'use strict';
(function(){
  const host=document.querySelector('#zhou-network-task');
  const sources=document.querySelector('#zhou-network-sources');
  const live=document.querySelector('#zhou-live');
  const L=window.ZhouNetworkLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="zhou-refresh">重新打开</button></section>';
    host.querySelector('#zhou-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id)){
    const after=F.courses.findIndex(course=>course[0]==='ligui');
    F.courses.splice(after+1,0,[L.id,L.title,'zhou-network.html']);
  }

  const esc=F.esc;
  const coldIds=L.coldOptions.map(item=>item.id);
  const claimIds=L.keClaims.map(item=>item.id);
  const routeIds=L.routeConditions.map(item=>item.id);
  const eventIds=L.networkEvents.map(item=>item.id);
  const eventOptionIds=Object.fromEntries(L.networkEvents.map(event=>[event.id,event.options.map(item=>item.id)]));
  const boundaryIds=L.networkBoundaries.map(item=>item.id);
  const cardIds=L.transferCards.map(item=>item.id);
  const ratingIds=L.transferRatings.map(item=>item.id);
  const transferClaimIds=L.transferClaims.map(item=>item.id);
  const modelIds=L.transferModels.map(item=>item.id);
  const defaults={
    coldChoice:null,coldReason:'',coldUnsure:false,
    evidenceChoices:[],evidenceReason:'',evidenceUnsure:false,evidenceAttempted:false,evidenceHintLevel:0,
    routeCondition:'clear',routeSeen:[],networkAnswers:{},networkBoundary:null,networkReason:'',networkUnsure:false,networkAttempted:false,networkHintLevel:0,
    activeTransferCard:'inscription',transferVisited:[],transferRatings:{},transferModel:null,transferReason:'',transferUnsure:false,transferAttempted:false,transferHintLevel:0
  };
  let log=F.create(L.title,L.tasks);

  function safeText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function oneOf(value,allowed,fallback=null){return allowed.includes(value)?value:fallback;}
  function safeList(value,allowed,max=30){
    if(!Array.isArray(value))return [];
    const result=[];for(const item of value)if(allowed.includes(item)&&!result.includes(item)){result.push(item);if(result.length>=max)break;}
    return result;
  }
  function safeObject(value,keys,valuesByKey){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    const result={};
    for(const key of keys){const allowed=Array.isArray(valuesByKey)?valuesByKey:valuesByKey[key]||[];if(allowed.includes(value[key]))result[key]=value[key];}
    return result;
  }
  function loadState(){
    const saved=log.checkpoint?.[L.id]||{};
    return {
      ...defaults,
      coldChoice:oneOf(saved.coldChoice,coldIds),coldReason:safeText(saved.coldReason),coldUnsure:!!saved.coldUnsure,
      evidenceChoices:safeList(saved.evidenceChoices,claimIds,claimIds.length),evidenceReason:safeText(saved.evidenceReason),evidenceUnsure:!!saved.evidenceUnsure,
      evidenceAttempted:!!saved.evidenceAttempted&&!!log.records[1]?.attempts?.length,evidenceHintLevel:Number.isInteger(saved.evidenceHintLevel)?Math.max(0,Math.min(saved.evidenceHintLevel,L.evidenceHints.length)):0,
      routeCondition:oneOf(saved.routeCondition,routeIds,'clear'),routeSeen:safeList(saved.routeSeen,routeIds,routeIds.length),
      networkAnswers:safeObject(saved.networkAnswers,eventIds,eventOptionIds),networkBoundary:oneOf(saved.networkBoundary,boundaryIds),
      networkReason:safeText(saved.networkReason),networkUnsure:!!saved.networkUnsure,networkAttempted:!!saved.networkAttempted&&!!log.records[2]?.attempts?.length,
      networkHintLevel:Number.isInteger(saved.networkHintLevel)?Math.max(0,Math.min(saved.networkHintLevel,L.networkHints.length)):0,
      activeTransferCard:oneOf(saved.activeTransferCard,cardIds,'inscription'),transferVisited:safeList(saved.transferVisited,cardIds,cardIds.length),
      transferRatings:safeObject(saved.transferRatings,transferClaimIds,ratingIds),transferModel:oneOf(saved.transferModel,modelIds),
      transferReason:safeText(saved.transferReason),transferUnsure:!!saved.transferUnsure,transferAttempted:!!saved.transferAttempted&&!!log.records[3]?.attempts?.length,
      transferHintLevel:Number.isInteger(saved.transferHintLevel)?Math.max(0,Math.min(saved.transferHintLevel,L.transferHints.length)):0
    };
  }
  let state=loadState();
  function save(){log.point({[L.id]:state});}
  function announce(value){if(!live)return;live.textContent='';requestAnimationFrame(()=>{live.textContent=value;});}
  function optionText(items,id){
    const item=items.find(entry=>entry.id===id);
    return item?.text||item?.label||item?.title||item?.name||id||'';
  }
  function reasonValue(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function progress(){
    document.querySelectorAll('.zhou-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
      item.setAttribute('aria-label',(log.records[index]?.done?'已完成：':index===log.index?'当前：':'待完成：')+item.textContent.trim());
    });
    if(sources)sources.hidden=log.index<L.tasks.length;
  }
  function focusCard(){
    requestAnimationFrame(()=>{const heading=host.querySelector('h2');if(!heading)return;heading.focus();heading.scrollIntoView({block:'start',behavior:'auto'});});
  }
  function focusFeedback(){
    requestAnimationFrame(()=>host.querySelector('.zhou-feedback')?.focus());
  }
  function message(value,error=false){const box=host.querySelector('#zhou-message');if(box){box.textContent=value;box.dataset.error=String(error);box.focus({preventScroll:true});}}
  function clearMessage(){const box=host.querySelector('#zhou-message');if(box){box.textContent='';box.dataset.error='false';}}
  function card(label,title,body,action=''){
    return '<section class="parallel-card zhou-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<p class="parallel-error" id="zhou-message" role="status" tabindex="-1"></p>'+action+'</section>';
  }
  function radioChoices(items,selected,label,attr){
    return '<div class="parallel-choices zhou-choices" role="radiogroup" aria-label="'+esc(label)+'">'+items.map((item,index)=>{const checked=item.id===selected;return '<button type="button" role="radio" '+attr+'="'+esc(item.id)+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!selected&&index===0)?'0':'-1')+'">'+esc(item.text)+'</button>';}).join('')+'</div>';
  }
  function selectRadio(button){button.closest('[role="radiogroup"]')?.querySelectorAll('[role="radio"]').forEach(item=>{const checked=item===button;item.setAttribute('aria-checked',String(checked));item.tabIndex=checked?0:-1;});}
  function bindRovingRadios(){
    host.querySelectorAll('[role="radiogroup"]').forEach(group=>{
      const buttons=[...group.querySelectorAll('[role="radio"]')];
      buttons.forEach((button,index)=>button.addEventListener('keydown',event=>{
        if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key))return;
        event.preventDefault();const step=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;const next=buttons[(index+step+buttons.length)%buttons.length];next.click();next.focus({preventScroll:true});
      }));
    });
  }
  function reason(prefix,label,value,unsure,placeholder){
    return '<div class="parallel-reason zhou-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" maxlength="900" rows="3" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindReason(prefix,key,unsureKey){
    const input=host.querySelector('#'+prefix+'-reason'),unsure=host.querySelector('#'+prefix+'-unsure');
    input?.addEventListener('input',()=>{state[key]=input.value.slice(0,900);if(input.value.trim()){state[unsureKey]=false;if(unsure)unsure.checked=false;}save();});
    unsure?.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function hintBox(items,level,prefix){
    const shown=items.slice(0,level);
    return '<section class="zhou-hints" id="'+prefix+'-hints" tabindex="-1"><h3>按需领取提示</h3>'+(shown.length?'<ol>'+shown.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>':'<p>还没有打开提示，可以先独立试一试。</p>')+(level<items.length?'<button type="button" id="'+prefix+'-hint">给我下一条提示</button>':'<p>提示已经全部打开。</p>')+'</section>';
  }
  function bindHint(index,prefix,items,key){
    host.querySelector('#'+prefix+'-hint')?.addEventListener('click',()=>{
      state[key]=Math.min(items.length,state[key]+1);const text=items[state[key]-1];log.help(index,'提示'+state[key]+'：'+text);save();render();
      (host.querySelector('#'+prefix+'-hint')||host.querySelector('#'+prefix+'-hints'))?.focus({preventScroll:true});announce('提示'+state[key]+'：'+text);
    });
  }

  function coldMap(){
    return '<svg class="zhou-cold-map" viewBox="0 0 620 270" role="img" aria-labelledby="zhou-cold-title zhou-cold-desc"><title id="zhou-cold-title">王都与遥远地区的关系示意</title><desc id="zhou-cold-desc">左侧是王都，右侧是遥远区域，中间有山河和多段路线。地图不按比例，不表示精确国界。</desc><path class="zhou-land" d="M28 214 Q86 52 184 88 T333 76 T592 184 L592 245 L28 245Z"/><g class="zhou-route-skeleton"><path d="M104 164 C190 112 252 189 326 132 S454 78 523 139"/><circle cx="104" cy="164" r="8"/><circle cx="326" cy="132" r="8"/><circle cx="523" cy="139" r="8"/></g><g class="zhou-cold-labels"><text x="104" y="205">王都</text><text x="326" y="176">路途节点</text><text x="523" y="183">遥远地区</text></g><path class="zhou-mountain" d="M212 214 l32 -69 34 69 M408 214 l28 -58 31 58"/><path class="zhou-river" d="M25 110 C112 88 126 133 205 115 S350 88 403 112 S526 142 603 105"/></svg>';
  }
  function renderCold(){
    const body='<p class="parallel-lead">你来到西周早期，王都与远方之间没有即时通信。地图不按比例，也没有给出答案。哪种方案最可能让远方日常事务继续运转，同时仍与王室保持关系？</p>'+coldMap()+'<p class="zhou-map-note">“千里”只表达遥远；路线、节点和山河都是关系示意，不是精确疆域图。</p>'+radioChoices(L.coldOptions,state.coldChoice,'选择治理方案','data-cold')+reason('cold','这套方案解决了什么，又付出什么代价？',state.coldReason,state.coldUnsure,'例如：它让谁先处理日常事务？王室又失去了什么即时性？');
    host.innerHTML=card('第一现场 · 王都规划室','一条王命，能直接管到每座村落吗？',body,'<button class="primary" id="cold-submit">封存方案，进入证据室 →</button>');
    host.querySelectorAll('[data-cold]').forEach(button=>button.onclick=()=>{state.coldChoice=button.dataset.cold;selectRadio(button);clearMessage();save();});
    bindRovingRadios();bindReason('cold','coldReason','coldUnsure');
    host.querySelector('#cold-submit').onclick=()=>{
      const why=reasonValue(state.coldReason,state.coldUnsure);if(!state.coldChoice){message('先选一套方案；后面会用器物和路线实验修订。',true);return;}if(!why){message('再留一句它的作用或代价；暂时说不清也可以勾选。',true);return;}
      log.submit(0,optionText(L.coldOptions,state.coldChoice),null,why);log.note(0,'首答在展示克罍与治理网络前封存，本环节不即时判定方案。');log.finish(0,'已封存治理方案，暂不据此声称掌握');render(true);
    };
  }

  function keArtifact(){
    return '<div class="zhou-artifact"><div class="zhou-vessel" aria-hidden="true"><i></i><b>克</b></div><div class="zhou-artifact-copy"><span>真实器物档案 · 页面未使用器物图片</span><h3>'+esc(L.keLei.name)+' · '+esc(L.keLei.period)+'</h3><blockquote>'+esc(L.keLei.quote)+'</blockquote><p><b>出土：</b>'+esc(L.keLei.found)+'</p><p>'+esc(L.keLei.note)+'</p></div></div>';
  }
  function evidenceChecks(){
    return '<div class="zhou-claim-checks" role="group" aria-label="选择这件材料能够支持的说法">'+L.keClaims.map(item=>'<label><input type="checkbox" data-evidence="'+item.id+'" '+(state.evidenceChoices.includes(item.id)?'checked':'')+'><span>'+esc(item.text)+'</span></label>').join('')+'</div>';
  }
  function evidenceFeedback(){
    if(!state.evidenceAttempted)return '';
    const graded=L.gradeEvidence(state.evidenceChoices);if(graded.correct)return '';
    const missing=L.keAnswer.filter(id=>!state.evidenceChoices.includes(id));const extra=state.evidenceChoices.filter(id=>!L.keAnswer.includes(id));
    return '<div class="zhou-feedback" role="status" tabindex="-1">'+(missing.length?'<p><b>还漏了：</b>'+missing.map(id=>L.keClaims.find(item=>item.id===id)?.text).join('；')+'</p>':'')+(extra.length?'<p><b>证据伸得太远：</b>'+extra.map(id=>L.keClaims.find(item=>item.id===id)?.text).join('；')+'</p>':'')+'</div>';
  }
  function renderEvidence(){
    const body='<p class="parallel-lead">先做一个完整示范：藏品页告诉我们“M1193是出土地点”，但这不是青铜器自己写出的现代墓号。接下来把“器物、出土背景与馆方释读”合在一起，看它能支持到哪一步。</p>'+keArtifact()+'<div class="zhou-example"><b>把材料放进制度图</b><span>周王室</span><i>册命／封授 →</i><span>燕侯与燕地</span><p>这条线有具体器物材料支撑；它仍没有告诉我们命令速度和全国每个地方的运行方式。</p></div><h3>哪些说法能由这件材料及馆方释读支持？</h3>'+evidenceChecks()+evidenceFeedback()+reason('evidence','用一句“能支持……，但不能证明……”收住边界。',state.evidenceReason,state.evidenceUnsure,'例如：它能支持一次具体政治关系，但不能证明……')+hintBox(L.evidenceHints,state.evidenceHintLevel,'evidence');
    host.innerHTML=card('第二现场 · 克罍证据室','一件青铜器，能把制度图画到哪一步？',body,'<button class="primary" id="evidence-submit">提交证据边界 →</button>');
    host.querySelectorAll('[data-evidence]').forEach(input=>input.onchange=()=>{state.evidenceChoices=[...host.querySelectorAll('[data-evidence]:checked')].map(item=>item.dataset.evidence);state.evidenceAttempted=false;save();clearMessage();});
    bindReason('evidence','evidenceReason','evidenceUnsure');bindHint(1,'evidence',L.evidenceHints,'evidenceHintLevel');
    host.querySelector('#evidence-submit').onclick=()=>{
      const why=reasonValue(state.evidenceReason,state.evidenceUnsure);if(!state.evidenceChoices.length){message('先选择至少一条你认为材料能够支持的说法。',true);return;}if(!why){message('再留一句材料的边界；暂时说不清也可以勾选。',true);return;}
      const graded=L.gradeEvidence(state.evidenceChoices);const answer='材料能支持：'+state.evidenceChoices.map(id=>L.keClaims.find(item=>item.id===id)?.text||id).join('；');
      log.submit(1,answer,graded.correct,why);state.evidenceAttempted=true;save();
      if(!graded.correct){log.help(1,'自动反馈：克罍证据边界');render();focusFeedback();return;}
      log.note(1,'正确区分了具体王命/政治关系与即时通信、全国统一流程等越界结论；开放解释按原话保留。');log.finish(1,state.evidenceUnsure?'结构判断通过；证据边界暂时说不清':'能把一件器物放入制度图，同时保留结论边界');render(true);
    };
  }

  function networkSvg(){
    const condition=L.routeConditions.find(item=>item.id===state.routeCondition)||L.routeConditions[0];
    const compact=window.matchMedia?.('(max-width:560px)').matches;
    const repair=state.networkAnswers.repair,summons=state.networkAnswers.summons,report=state.networkAnswers.report;
    const localEdge=repair==='local'?'<path class="zhou-edge zhou-local-edge" d="M480 186 L480 292" marker-end="url(#zhou-arrow)"/><text x="492" y="246">地方先处理</text>':repair==='wait'?'<path class="zhou-edge zhou-wrong-edge" d="M126 151 Q320 238 462 304" marker-end="url(#zhou-arrow-wrong)"/><text x="268" y="254">等王都逐户下令？</text>':'';
    const summonsEdge=summons==='chain'?'<path class="zhou-edge zhou-command-edge" d="M142 121 C252 55 377 70 451 127" marker-end="url(#zhou-arrow)"/><text x="277" y="72">使者传命</text>':summons==='village'?'<path class="zhou-edge zhou-wrong-edge" d="M126 141 Q292 33 470 295" marker-end="url(#zhou-arrow-wrong)"/><text x="297" y="47">跳过封国？</text>':summons==='telepathy'?'<path class="zhou-edge zhou-wrong-edge zhou-flash-edge" d="M145 155 L450 155"/><text x="285" y="141">自动同时执行？</text>':'';
    const reportEdge=report==='return'?'<path class="zhou-edge zhou-return-edge" d="M450 174 C362 235 235 228 143 171" marker-end="url(#zhou-arrow)"/><text x="278" y="231">报告／义务返回</text>':report==='instant'?'<path class="zhou-edge zhou-wrong-edge zhou-flash-edge" d="M449 176 L143 176"/><text x="283" y="199">实时看见？</text>':'';
    return '<div class="zhou-network-visual" style="--route-duration:'+esc(condition.duration)+'" tabindex="'+(compact?'0':'-1')+'" role="region" aria-label="'+(compact?'治理关系动画；小屏可左右滚动查看完整关系':'治理关系动画')+'"><svg viewBox="0 0 620 390" role="img" aria-labelledby="zhou-net-title zhou-net-desc"><title id="zhou-net-title">西周治理关系实验图，当前路线条件：'+esc(condition.label)+'</title><desc id="zhou-net-desc">王畿与封国之间靠使者和车马真实往返；封国内还有地方事务节点。实线、虚线和点划线同时配有文字标签。</desc><defs><marker id="zhou-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3Z"/></marker><marker id="zhou-arrow-wrong" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3Z"/></marker></defs><path class="zhou-map-ground" d="M26 324 Q134 58 281 102 T594 283 L594 352 L26 352Z"/><path class="zhou-base-route" d="M142 151 C246 121 356 121 450 151"/><circle class="zhou-message-dot" cx="142" cy="151" r="8"/><g class="zhou-node zhou-node-royal"><rect x="44" y="108" width="100" height="92" rx="18"/><text x="94" y="143">王畿</text><text x="94" y="172">周王室</text></g><g class="zhou-node zhou-node-state"><rect x="450" y="108" width="116" height="92" rx="18"/><text x="508" y="143">远方封国</text><text x="508" y="172">诸侯治理</text></g><g class="zhou-node zhou-node-local"><rect x="435" y="292" width="146" height="62" rx="16"/><text x="508" y="330">地方日常事务</text></g><path class="zhou-grant-edge" d="M143 116 C257 31 370 41 451 116" marker-end="url(#zhou-arrow)"/><text class="zhou-grant-label" x="292" y="37">册命／授权</text>'+localEdge+summonsEdge+reportEdge+'<g class="zhou-route-label"><rect x="214" y="111" width="178" height="66" rx="12"/><text x="303" y="136">使者 · 车马 · 真实路线</text><text x="303" y="158">'+esc(condition.status)+'</text></g></svg><p>动画速度只表示“相对变慢”，不代表真实天数；节点位置和距离均为教学示意。</p><p class="zhou-scroll-note">小屏提示：在图上左右滑动，查看完整关系。</p></div>';
  }
  function routeControls(){
    const current=L.routeConditions.find(item=>item.id===state.routeCondition)||L.routeConditions[0];
    return '<section class="zhou-route-console"><h3>先给路线施加条件</h3><div class="zhou-route-buttons" role="group" aria-label="选择路线条件">'+L.routeConditions.map(item=>'<button type="button" data-route="'+item.id+'" aria-pressed="'+String(item.id===state.routeCondition)+'">'+esc(item.label)+'</button>').join('')+'</div><button type="button" class="secondary" id="route-observe">观察这次往返</button><p><b>当前：</b>'+esc(current.status)+'</p><div class="zhou-seen">已观察 '+state.routeSeen.length+' / 2 个不同条件'+(state.routeSeen.length?'<span>'+state.routeSeen.map(id=>esc(L.routeConditions.find(item=>item.id===id)?.label||id)).join(' · ')+'</span>':'')+'</div></section>';
  }
  function eventCards(){
    return '<div class="zhou-events">'+L.networkEvents.map((event,index)=>'<article class="zhou-event"><small>网络行动 '+(index+1)+'</small><h3>'+esc(event.title)+'</h3>'+radioChoices(event.options,state.networkAnswers[event.id],'选择行动：'+event.title,'data-event-'+event.id)+'</article>').join('')+'</div>';
  }
  function networkFeedback(){
    if(!state.networkAttempted)return '';
    const graded=L.gradeNetwork(state);if(graded.correct)return '';
    const wrong=graded.detail.filter(item=>!item.correct).map(item=>L.networkEvents.find(event=>event.id===item.id)?.title);
    return '<div class="zhou-feedback" role="status" tabindex="-1">'+(!graded.observed?'<p>还要在至少两个不同路线条件下观察往返；只看一次不足以比较通信成本。</p>':'')+(wrong.length?'<p><b>再检查这些行动：</b>'+wrong.join('；')+'</p>':'')+(!graded.boundary?'<p>最后的制度边界还没有收住：地方有一定决策空间，不等于脱离王室；形成关系网，也不等于实时直管。</p>':'')+'</div>';
  }
  function renderNetwork(){
    const body='<p class="parallel-lead">克罍先给了“王室→封国”的具体一条线。下面不是铭文直接写出的因果关系，而是根据史料搭建的现代分析模型：改变路线条件，再处理三件事，看看信息仍在路上时，日常事务怎样继续。</p><div class="zhou-network-grid">'+networkSvg()+routeControls()+'</div>'+eventCards()+'<h3>这张网络图最稳妥的边界是什么？</h3>'+radioChoices(L.networkBoundaries,state.networkBoundary,'选择治理网络边界','data-boundary')+networkFeedback()+reason('network','用一句“我让谁先做什么，因为……”解释你的网络。',state.networkReason,state.networkUnsure,'例如：我让封国先处理……，因为消息在路上时……；王室仍通过……保持关系。')+hintBox(L.networkHints,state.networkHintLevel,'network');
    host.innerHTML=card('第三现场 · 高延迟治理实验','信息还在路上时，远方怎样继续运行？',body,'<button class="primary" id="network-submit">封存治理网络 →</button>');
    host.querySelectorAll('[data-route]').forEach(button=>button.onclick=()=>{state.routeCondition=button.dataset.route;save();render();host.querySelector('[data-route="'+button.dataset.route+'"]')?.focus({preventScroll:true});});
    host.querySelector('#route-observe').onclick=()=>{if(!state.routeSeen.includes(state.routeCondition))state.routeSeen=[...state.routeSeen,state.routeCondition];save();render();host.querySelector('#route-observe')?.focus({preventScroll:true});announce('已观察：'+optionText(L.routeConditions,state.routeCondition));};
    L.networkEvents.forEach(event=>host.querySelectorAll('[data-event-'+event.id+']').forEach(button=>button.onclick=()=>{state.networkAnswers={...state.networkAnswers,[event.id]:button.getAttribute('data-event-'+event.id)};state.networkAttempted=false;save();render();host.querySelector('[data-event-'+event.id+'="'+state.networkAnswers[event.id]+'"]')?.focus({preventScroll:true});}));
    host.querySelectorAll('[data-boundary]').forEach(button=>button.onclick=()=>{state.networkBoundary=button.dataset.boundary;selectRadio(button);state.networkAttempted=false;save();clearMessage();});
    bindRovingRadios();bindReason('network','networkReason','networkUnsure');bindHint(2,'network',L.networkHints,'networkHintLevel');
    host.querySelector('#network-submit').onclick=()=>{
      const why=reasonValue(state.networkReason,state.networkUnsure);if(state.routeSeen.length<2){message('先观察至少两个不同路线条件。',true);return;}if(eventIds.some(id=>!state.networkAnswers[id])){message('三件网络行动都要做出选择。',true);return;}if(!state.networkBoundary){message('还要选择一句制度边界。',true);return;}if(!why){message('留一句行动依据；暂时说不清也可以勾选。',true);return;}
      const graded=L.gradeNetwork(state);const answer='路线：'+state.routeSeen.map(id=>optionText(L.routeConditions,id)).join('、')+'；行动：'+L.networkEvents.map(event=>optionText(event.options,state.networkAnswers[event.id])).join('；')+'；边界：'+optionText(L.networkBoundaries,state.networkBoundary);
      log.submit(2,answer,graded.correct,why);state.networkAttempted=true;save();
      if(!graded.correct){log.help(2,'自动反馈：治理网络关系');render();focusFeedback();return;}
      log.note(2,'路线条件与动画只表达相对通信成本，不换算真实天数；网络图不表示精确疆域。');log.note(2,'结构化行动全部通过；开放解释按原话保留，未自动判断语义质量。');log.finish(2,state.networkUnsure?'网络结构判断通过；行动解释暂时说不清':'能用授权、地方治理、义务回流和真实往返解释高延迟治理');render(true);
    };
  }

  function transferArtifact(){
    const active=L.transferCards.find(item=>item.id===state.activeTransferCard)||L.transferCards[0];
    return '<div class="zhou-transfer-artifact"><div class="zhou-mini-vessel" aria-hidden="true"><b>噩监</b></div><div><span>真实器物档案 · 新证据</span><h3>'+esc(L.eJian.name)+' · '+esc(L.eJian.period)+'</h3><p>'+esc(L.eJian.inscription)+'</p><p>'+esc(L.eJian.museum)+'</p><p class="zhou-boundary-note"><b>边界：</b>'+esc(L.eJian.boundary)+'</p></div></div><div class="zhou-card-tabs" role="group" aria-label="查看新证据档案">'+L.transferCards.map(item=>'<button type="button" data-transfer-card="'+item.id+'" aria-pressed="'+String(item.id===active.id)+'">'+esc(item.label)+'</button>').join('')+'</div><article class="zhou-card-readout"><small>'+esc(active.label)+'</small><p>'+esc(active.text)+'</p><b>'+(state.transferVisited.includes(active.id)?'已查看':'点开后将记入调查轨迹')+'</b></article>';
  }
  function transferClaimRows(){
    return '<div class="zhou-rating-list">'+L.transferClaims.map((claim,index)=>'<article class="zhou-rating-row"><p><small>报告句 '+(index+1)+'</small>'+esc(claim.text)+'</p><div role="radiogroup" aria-label="判断：'+esc(claim.text)+'">'+L.transferRatings.map((rating,pos)=>{const checked=state.transferRatings[claim.id]===rating.id;return '<button type="button" role="radio" data-rating-claim="'+claim.id+'" data-rating="'+rating.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.transferRatings[claim.id]&&pos===0)?'0':'-1')+'">'+esc(rating.text)+'</button>';}).join('')+'</div></article>').join('')+'</div>';
  }
  function transferFeedback(){
    if(!state.transferAttempted)return '';
    const graded=L.gradeTransfer(state);if(graded.correct)return '';
    const wrong=graded.detail.filter(item=>!item.correct).map(item=>L.transferClaims.find(claim=>claim.id===item.id)?.text);
    return '<div class="zhou-feedback" role="status" tabindex="-1">'+(!graded.visited?'<p>两张档案卡还没有都查看；先分清器物信息和馆方解释。</p>':'')+(wrong.length?'<p><b>再审这些报告句：</b>'+wrong.join('；')+'</p>':'')+(!graded.model?'<p>新证据不是“中央直管全部”的证明，也不是无关材料；它给原模型补上了选择性监督。</p>':'')+'</div>';
  }
  function renderTransfer(){
    if(!state.transferVisited.includes(state.activeTransferCard)){
      state.transferVisited=[...state.transferVisited,state.activeTransferCard];
      save();
    }
    const body='<p class="parallel-lead">现在换一件器物，撤掉前一页的网络答案。先读两张档案卡，再判断它给“地方治理—王室关系”模型增加了什么；不要把噩国一个案例放大成全国统一规则。</p>'+transferArtifact()+'<h3>把四句报告放到正确证据层</h3>'+transferClaimRows()+'<h3>新证据怎样修正原模型？</h3>'+radioChoices(L.transferModels,state.transferModel,'选择制度模型修订','data-transfer-model')+transferFeedback()+reason('transfer','提交一句“判断—证据—边界”。',state.transferReason,state.transferUnsure,'例如：我判断……；证据是……；但这不能推出……。')+hintBox(L.transferHints,state.transferHintLevel,'transfer');
    host.innerHTML=card('第四现场 · 噩监簋独立修模','有监官，就等于王室直接管理一切吗？',body,'<button class="primary" id="transfer-submit">封存独立报告 →</button>');
    host.querySelectorAll('[data-transfer-card]').forEach(button=>button.onclick=()=>{const id=button.dataset.transferCard;state.activeTransferCard=id;if(!state.transferVisited.includes(id))state.transferVisited=[...state.transferVisited,id];save();render();host.querySelector('[data-transfer-card="'+id+'"]')?.focus({preventScroll:true});announce((L.transferCards.find(item=>item.id===id)?.label||id)+'：已查看。');});
    host.querySelectorAll('[data-rating-claim]').forEach(button=>button.onclick=()=>{state.transferRatings={...state.transferRatings,[button.dataset.ratingClaim]:button.dataset.rating};selectRadio(button);state.transferAttempted=false;save();clearMessage();});
    host.querySelectorAll('[data-transfer-model]').forEach(button=>button.onclick=()=>{state.transferModel=button.dataset.transferModel;selectRadio(button);state.transferAttempted=false;save();clearMessage();});
    bindRovingRadios();bindReason('transfer','transferReason','transferUnsure');bindHint(3,'transfer',L.transferHints,'transferHintLevel');
    host.querySelector('#transfer-submit').onclick=()=>{
      const why=reasonValue(state.transferReason,state.transferUnsure);if(!L.transferCards.every(card=>state.transferVisited.includes(card.id))){message('先把两张档案卡都打开。',true);return;}if(transferClaimIds.some(id=>!state.transferRatings[id])){message('四句报告都要完成证据分层。',true);return;}if(!state.transferModel){message('还要选择新证据怎样修正原模型。',true);return;}if(!why){message('留一句判断、证据与边界；暂时说不清也可以勾选。',true);return;}
      const graded=L.gradeTransfer(state);const answer='已查看：'+state.transferVisited.map(id=>L.transferCards.find(item=>item.id===id)?.label||id).join('、')+'；报告分层：'+L.transferClaims.map(claim=>claim.text+' → '+optionText(L.transferRatings,state.transferRatings[claim.id])).join('；')+'；模型修订：'+optionText(L.transferModels,state.transferModel);
      log.submit(3,answer,graded.correct,why);state.transferAttempted=true;save();
      if(!graded.correct){log.help(3,'自动反馈：噩监簋证据层级');render();focusFeedback();return;}
      log.note(3,'正确保留了噩国个案边界：有监官不等于所有封国均设监官，也不等于王室包办全部日常事务。');log.finish(3,state.transferUnsure?'结构判断通过；判断—证据—边界解释待练':'能用新证据修正模型，同时保留个案边界');render(true);
    };
  }

  function finish(){
    if(sources)sources.hidden=false;
    const body='<p class="parallel-lead">西周远方治理不是遥控，也不是“封出去就不管”。王室与封国之间形成了一个需要人员、车马、物资、礼仪和时间维持的分层关系网。</p><div class="zhou-final-network"><div><b>王室向外</b>册命／封授、赏赐、征召</div><i>⇄</i><div><b>维系通道</b>人员、使者与车马真实往返</div><i>⇄</i><div><b>诸侯在地</b>处理地方事务、组织本地力量</div><i>⇄</i><div><b>关系返回</b>如朝觐／报政、进献贡物、军事协助等</div><i>＋</i><div><b>选择性叠加</b>特定地区的监官</div></div><p class="parallel-takeaway"><b>模型推论：</b>在远距离、信息往返较慢的条件下，通常更需要让现场承担部分日常决策；但册命／封授要继续成为“治理关系”，还得靠义务、往返、礼仪及特定情境下的监督等方式维持。具体形式会因封国与时期而异。<br><b>证据边界：</b>一个铭文个案能照亮一条制度关系，不能自动证明全国每地、每时都同样运行。<br><b>不要套现代模板：</b>封国不是现代省，诸侯也不是王室实时调度的现代地方官。“授权”和“高延迟网络”是本课帮助分析的现代说法，不是西周制度原名。</p><p>页面记录的是治理首答、克罍证据边界、路线条件、网络行动、自动反馈和噩监簋独立修模。开发自检只能证明页面按规则工作；孩子隔天能否不用术语、自己画出双向关系，才是后续掌握证据。</p><div class="zhou-next"><b>下一站：</b>共读《陈太丘与友期行》，看看短短一段故事怎样用动作、称谓和对话建立判断。</div>';
    host.innerHTML=card('H07 · 西周治理网络调查完成','真正连接千里之外的，不是一条神奇的命令，而是一张需要维护的关系网',body)+log.html()+'<div class="parallel-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school&amp;subject=历史">返回历史课程</a><button class="secondary" id="zhou-restart">重新调查一轮（保留旧记录）</button></div>';
    host.querySelector('#zhou-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,evidenceChoices:[],routeSeen:[],networkAnswers:{},transferVisited:[],transferRatings:{}};save();if(sources)sources.hidden=true;render(true);};
  }
  function render(moveFocus=false){
    progress();if(log.index>=L.tasks.length)finish();else if(log.index===0)renderCold();else if(log.index===1)renderEvidence();else if(log.index===2)renderNetwork();else renderTransfer();progress();if(moveFocus)focusCard();
  }
  render();
})();
