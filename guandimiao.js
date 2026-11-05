'use strict';
(function(){
  const host=document.querySelector('#village-task');
  const L=window.GuandimiaoLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请联网刷新后重新打开。</p><button class="primary" id="village-refresh">重新打开</button></section>';
    document.querySelector('#village-refresh').onclick=()=>location.reload();
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'guandimiao.html']);

  const esc=F.esc;
  const initialIds=new Set(L.initialOptions.map(item=>item.id));
  const spotIds=new Set(L.spots.map(item=>item.id));
  const spotOptionIds=new Map(L.spots.filter(item=>item.options).map(item=>[item.id,new Set(item.options.map(option=>option.id))]));
  const layerIds=new Set(L.layers.map(item=>item.id));
  const layerCardIds=new Set(L.layerCards.map(item=>item.id));
  const claimIds=new Set(L.claims.map(item=>item.id));
  const ratingIds=new Set(L.ratings.map(item=>item.id));
  const defaults={
    initialChoice:null,initialReason:'',initialUnsure:false,
    selectedSpot:'hearth',spotVisited:['hearth'],spotAnswers:{},spotAttempted:false,spotHintLevel:0,
    layerAssignments:{},layerAttempted:false,layerHintLevel:0,layerFocus:'fact',
    ratings:{},finalLabel:'',finalUnsure:false,finalAttempted:false
  };
  let log=F.create(L.title,L.tasks);

  function safeText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function safeObject(value,keys,values){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    return Object.fromEntries(Object.entries(value).filter(([key,val])=>keys.has(key)&&values(key,val)));
  }
  function loadState(){
    const saved=log.checkpoint.guandimiao||{};
    const visited=Array.isArray(saved.spotVisited)?[...new Set(saved.spotVisited.filter(id=>spotIds.has(id)))]:['hearth'];
    if(!visited.includes('hearth'))visited.unshift('hearth');
    return {
      ...defaults,...saved,
      initialChoice:initialIds.has(saved.initialChoice)?saved.initialChoice:null,
      initialReason:safeText(saved.initialReason),initialUnsure:!!saved.initialUnsure,
      selectedSpot:spotIds.has(saved.selectedSpot)?saved.selectedSpot:'hearth',spotVisited:visited,
      spotAnswers:safeObject(saved.spotAnswers,spotIds,(key,val)=>spotOptionIds.get(key)?.has(val)),
      spotAttempted:!!saved.spotAttempted,spotHintLevel:Number.isInteger(saved.spotHintLevel)?Math.max(0,Math.min(saved.spotHintLevel,L.spotHints.length)):0,
      layerAssignments:safeObject(saved.layerAssignments,layerCardIds,(_key,val)=>layerIds.has(val)),
      layerAttempted:!!saved.layerAttempted,layerHintLevel:Number.isInteger(saved.layerHintLevel)?Math.max(0,Math.min(saved.layerHintLevel,L.layerHints.length)):0,
      layerFocus:layerIds.has(saved.layerFocus)?saved.layerFocus:'fact',
      ratings:safeObject(saved.ratings,claimIds,(_key,val)=>ratingIds.has(val)),
      finalLabel:safeText(saved.finalLabel,100),finalUnsure:!!saved.finalUnsure,finalAttempted:!!saved.finalAttempted
    };
  }
  let state=loadState();
  function save(){log.point({guandimiao:state});}
  function optionText(items,id){const item=items.find(entry=>entry.id===id);return item?.text||item?.name||id||'';}
  function reasonValue(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function charCount(value){return Array.from(value.trim()).length;}
  function announce(value){const live=document.querySelector('#village-live');if(!live)return;live.textContent='';requestAnimationFrame(()=>{live.textContent=value;});}
  function progress(){
    document.querySelectorAll('.village-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
    const sources=document.querySelector('#village-sources');
    if(sources)sources.hidden=log.index<L.tasks.length;
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.village-nav')?.scrollIntoView({block:'start'});}
  function message(value){const box=host.querySelector('#village-message');if(box){box.textContent=value;box.focus({preventScroll:true});}}
  function card(label,title,body,button=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="village-message" role="status" tabindex="-1"></p>'+button+'</section>';
  }
  function choices(items,selected,label,attr){
    return '<div class="parallel-choices" role="radiogroup" aria-label="'+esc(label)+'">'+items.map((item,index)=>{const checked=item.id===selected;return '<button type="button" role="radio" '+attr+'="'+esc(item.id)+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!selected&&index===0)?'0':'-1')+'">'+esc(item.text)+'</button>';}).join('')+'</div>';
  }
  function bindRovingRadios(){
    host.querySelectorAll('[role="radiogroup"]').forEach(group=>{
      const buttons=[...group.querySelectorAll('[role="radio"]')];
      buttons.forEach((button,index)=>button.addEventListener('keydown',event=>{
        if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key))return;
        event.preventDefault();
        const step=event.key==='ArrowRight'||event.key==='ArrowDown'?1:-1;
        const next=buttons[(index+step+buttons.length)%buttons.length];
        next.click();next.focus({preventScroll:true});
      }));
    });
  }
  function bindHelp(index){host.querySelectorAll('details[data-help]').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)log.help(index,item.dataset.help);}));}
  function hintBox(hints,level,prefix){
    const shown=hints.slice(0,level);
    const button=level<hints.length?'<button type="button" id="'+prefix+'-hint">给我下一条提示</button>':'<p>提示已经全部打开。</p>';
    return '<section class="hint-console-village" id="'+prefix+'-hints" tabindex="-1"><h3>按需领取提示</h3>'+(shown.length?'<ol>'+shown.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>':'<p>还没有打开提示，可以先独立判断。</p>')+button+'</section>';
  }

  function renderInitial(){
    const body='<p class="parallel-lead">考古队打开一份没有人名的田野档案。先别急着听讲解，留下你现在的判断：没有文字自传的人，能不能进入历史？</p><div class="entry-file"><div class="entry-stamp"><b>关帝庙</b><small>今天的地点名<br>不是已知商代村名</small></div><ul class="entry-facts"><li>遗址总面积约 6.9 万平方米，发掘区只是其中一部分</li><li>主要材料属晚商时期</li><li>发现房址、灰坑与墓葬</li><li>本课采用的公开材料没有给出可读居民姓名</li></ul></div><h3>仅凭这样的遗址，最稳妥的起点是什么？</h3>'+choices(L.initialOptions,state.initialChoice,'首答判断','data-initial')+'<div class="parallel-reason"><label for="initial-reason">留下你现在的依据。</label><textarea id="initial-reason" maxlength="900" rows="3" placeholder="例如：我觉得遗物能告诉我们……，但还不能告诉我们……">'+esc(state.initialReason)+'</textarea><label class="parallel-unsure"><input id="initial-unsure" type="checkbox" '+(state.initialUnsure?'checked':'')+'>暂时说不清，先如实记录</label></div><div class="village-boundary"><b>这一步只封存首答。</b>课程不会用后面的讲解覆盖你第一次怎么想。</div>';
    host.innerHTML=card('第一现场 · 入场判断','没有姓名，还能写进历史吗？',body,'<button class="primary" id="initial-submit">封存首答，进入考古方舱 →</button>');
    host.querySelectorAll('[data-initial]').forEach(button=>button.onclick=()=>{state.initialChoice=button.dataset.initial;state.initialUnsure=false;state.initialChoice&&save();renderInitial();host.querySelector('[data-initial="'+state.initialChoice+'"]')?.focus({preventScroll:true});});
    bindRovingRadios();
    const input=host.querySelector('#initial-reason'),unsure=host.querySelector('#initial-unsure');
    input.addEventListener('input',()=>{state.initialReason=input.value.slice(0,900);if(input.value.trim()){state.initialUnsure=false;unsure.checked=false;}save();});
    unsure.addEventListener('change',()=>{state.initialUnsure=unsure.checked;save();});
    host.querySelector('#initial-submit').onclick=()=>{
      if(!state.initialChoice){message('请先选一个判断。');return;}
      if(!state.initialReason.trim()&&!state.initialUnsure){message('请留下一句依据；暂时说不清也可以勾选。');return;}
      const answer=optionText(L.initialOptions,state.initialChoice);
      log.submit(0,answer,L.gradeInitial(state.initialChoice),reasonValue(state.initialReason,state.initialUnsure));
      log.note(0,'首答已封存；后续修订不会覆盖第一次判断。');
      log.finish(0,'已留下进入遗址前的判断');render();focusCard();
    };
  }

  function digMap(){
    return '<div class="dig-map" role="group" aria-label="关帝庙遗址教学平面示意"><div class="map-house" aria-hidden="true"></div><div class="map-kiln" aria-hidden="true"></div><div class="map-burials" aria-hidden="true"><i></i><i></i><i></i></div><div class="map-tools" aria-hidden="true"></div>'+L.spots.map(spot=>'<button type="button" class="site-hotspot" data-spot="'+spot.id+'" aria-pressed="'+String(state.selectedSpot===spot.id)+'" aria-label="'+esc(spot.name)+(state.spotVisited.includes(spot.id)?'，已查看':'，未查看')+'">'+spot.mark+'</button>').join('')+'</div>';
  }
  function spotPanel(){
    const spot=L.spots.find(item=>item.id===state.selectedSpot)||L.spots[0];
    let work='';
    if(spot.guided){
      work='<div class="guided-example"><div><small>① 发掘事实</small>'+esc(spot.find)+'</div><div><small>② 可以支持</small>'+esc(spot.support)+'</div><div><small>③ 仍不能证明</small>'+esc(spot.boundary)+'</div></div>';
    }else{
      work='<p class="dig-find"><b>现场记录：</b>'+esc(spot.find)+'</p><h3>哪句没有越过这组证据？</h3><div class="spot-options" role="radiogroup" aria-label="'+esc(spot.name)+'的证据判断">'+spot.options.map((option,index)=>{const checked=state.spotAnswers[spot.id]===option.id;return '<button type="button" role="radio" data-spot-answer="'+option.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.spotAnswers[spot.id]&&index===0)?'0':'-1')+'">'+esc(option.text)+'</button>';}).join('')+'</div>';
    }
    return '<div class="dig-console"><header><b>'+esc(spot.name)+'</b><span>'+(spot.guided?'带着走一次':'独立判断')+'</span></header>'+work+'<p class="spot-status">已查看 <b>'+state.spotVisited.length+' / '+L.spots.length+'</b> 个位置；独立判断 <b>'+Object.keys(state.spotAnswers).length+' / '+(L.spots.length-1)+'</b> 组</p></div>';
  }
  function spotFeedback(){
    if(!state.spotAttempted)return '';
    const graded=L.gradeSpots(state.spotAnswers);
    if(graded.correct)return '<div class="village-result"><b>三组判断都守住了边界。</b><br>遗物能提示活动，却不会自动写出使用者姓名、每日生活和整个聚落的统一答案。</div>';
    const feedback={
      sickles:'镰、刀的形制能提示切割或收割活动；具体作物、食谱和使用者仍需别的材料。',
      kiln:'陶窑与陶器支持制陶和使用活动，但不能推出每个人都是陶工，更不能自动把聚落变成王宫。',
      knees:'异常磨损可能与长期重复动作有关；从这种解释到具体职业之间，还缺工具位置、微痕等证据。'
    };
    return '<div class="village-result bad"><b>还有 '+(graded.total-graded.count)+' 组把推断说得太满。</b><br>'+graded.detail.filter(item=>!item.correct).map(item=>esc(feedback[item.id])).join('<br>')+'</div>';
  }
  function spotAnswerText(){return L.spots.filter(spot=>!spot.guided).map(spot=>spot.name+'：'+optionText(spot.options,state.spotAnswers[spot.id])).join('；');}
  function renderSpots(){
    const ready=state.spotVisited.length===L.spots.length&&L.spots.filter(spot=>!spot.guided).every(spot=>state.spotAnswers[spot.id]);
    const body='<p class="parallel-lead">先用房址与灶坑做一次示范，再撤掉三步标签。点开地图上的 02—04，自己判断工具、陶窑和身体痕迹能把话说到哪里。</p><div class="dig-layout">'+digMap()+spotPanel()+'</div>'+hintBox(L.spotHints,state.spotHintLevel,'spot')+spotFeedback()+'<div class="village-boundary"><b>地图是教学示意。</b>位置、比例与形状不是关帝庙考古现场的精确测绘；真正用于判断的是相邻的文字材料。</div>';
    host.innerHTML=card('第二现场 · 田野方舱','遗物不会自己讲完整故事。',body,'<button class="primary" id="spot-submit">提交三组判断 →</button>');
    host.querySelectorAll('[data-spot]').forEach(button=>button.onclick=()=>{state.selectedSpot=button.dataset.spot;if(!state.spotVisited.includes(state.selectedSpot))state.spotVisited.push(state.selectedSpot);save();renderSpots();host.querySelector('[data-spot="'+state.selectedSpot+'"]')?.focus({preventScroll:true});announce('打开'+L.spots.find(item=>item.id===state.selectedSpot).name);});
    host.querySelectorAll('[data-spot-answer]').forEach(button=>button.onclick=()=>{state.spotAnswers[state.selectedSpot]=button.dataset.spotAnswer;state.spotAttempted=false;save();renderSpots();host.querySelector('[data-spot-answer="'+button.dataset.spotAnswer+'"]')?.focus({preventScroll:true});});
    bindRovingRadios();
    host.querySelector('#spot-hint')?.addEventListener('click',()=>{state.spotHintLevel=Math.min(L.spotHints.length,state.spotHintLevel+1);const hint=L.spotHints[state.spotHintLevel-1];log.help(1,'田野提示'+state.spotHintLevel+'：'+hint);save();renderSpots();(host.querySelector('#spot-hint')||host.querySelector('#spot-hints'))?.focus({preventScroll:true});announce('提示'+state.spotHintLevel+'：'+hint);});
    host.querySelector('#spot-submit').onclick=()=>{
      if(!ready){message('请查看四个位置，并完成 02—04 的三组判断。');return;}
      const graded=L.gradeSpots(state.spotAnswers);
      log.submit(1,spotAnswerText(),graded.correct,'依据“直接发现—能够支持—仍不能证明”判断。');state.spotAttempted=true;save();
      if(!graded.correct){renderSpots();message('诊断已保留在下方，调整后可以再次提交。');return;}
      log.note(1,'查看了全部四处材料；田野提示打开 '+state.spotHintLevel+' 条。');
      log.finish(1,'能为不同遗迹控制推断强度');render();focusCard();
    };
  }

  function layerStack(){
    return '<div class="layer-stack" aria-label="历史叙事三层结构">'+L.layers.map(layer=>'<div class="'+(state.layerFocus===layer.id?'active':'')+'"><span>'+esc(layer.name)+'</span><small>'+esc(layer.short)+'</small></div>').join('')+'</div>';
  }
  function layerDesk(){
    return '<div class="layer-cards">'+L.layerCards.map((item,index)=>'<article class="layer-card"><small>材料 '+(index+1)+'</small><p>'+esc(item.text)+'</p><div class="layer-buttons" role="radiogroup" aria-label="判断材料'+(index+1)+'属于哪一层">'+L.layers.map((layer,layerIndex)=>{const checked=state.layerAssignments[item.id]===layer.id;return '<button type="button" role="radio" data-layer-card="'+item.id+'" data-layer="'+layer.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.layerAssignments[item.id]&&layerIndex===0)?'0':'-1')+'">'+esc(layer.name)+'</button>';}).join('')+'</div></article>').join('')+'</div>';
  }
  function layerFeedback(){
    if(!state.layerAttempted)return '';
    const graded=L.gradeLayers(state.layerAssignments);
    if(graded.correct)return '<div class="village-result"><b>三层已经拆开。</b><br>历史叙述可以有想象，但必须让读者知道哪些来自现场、哪些是解释、哪些只是为了看得见而补出的场景。</div>';
    const names=graded.detail.filter(item=>!item.correct).map(item=>L.layerCards.find(card=>card.id===item.id)?.text).filter(Boolean);
    return '<div class="village-result bad"><b>还有 '+names.length+' 句混在了错误的层。</b><br>'+names.map((text,index)=>(index+1)+'．'+esc(text)).join('<br>')+'</div>';
  }
  function layerAnswerText(){return L.layerCards.map(card=>card.text+'——'+optionText(L.layers,state.layerAssignments[card.id])).join('；');}
  function renderLayers(){
    const body='<p class="parallel-lead">同一座村落，可以被写成考古报告，也可以被讲成一个有烟火气的故事。问题不在于能不能想象，而在于有没有把三层标清楚。</p><div class="layer-theatre">'+layerStack()+layerDesk()+'</div>'+hintBox(L.layerHints,state.layerHintLevel,'layer')+layerFeedback()+'<p class="method-sentence"><b>把解释绑在行动上：</b>每完成一次归类，心里接一句“我把这句话放到这一层，因为材料里……”。提交后再核对具体边界。</p>';
    host.innerHTML=card('第三现场 · 三层叙事台','一段好故事，也可能比证据多走了几步。',body,'<button class="primary" id="layer-submit">提交三层判断 →</button>');
    host.querySelectorAll('[data-layer-card]').forEach(button=>button.onclick=()=>{state.layerAssignments[button.dataset.layerCard]=button.dataset.layer;state.layerFocus=button.dataset.layer;state.layerAttempted=false;save();renderLayers();host.querySelector('[data-layer-card="'+button.dataset.layerCard+'"][data-layer="'+button.dataset.layer+'"]')?.focus({preventScroll:true});announce(optionText(L.layers,button.dataset.layer)+'：'+L.layerCards.find(card=>card.id===button.dataset.layerCard).text);});
    bindRovingRadios();
    host.querySelector('#layer-hint')?.addEventListener('click',()=>{state.layerHintLevel=Math.min(L.layerHints.length,state.layerHintLevel+1);const hint=L.layerHints[state.layerHintLevel-1];log.help(2,'叙事分层提示'+state.layerHintLevel+'：'+hint);save();renderLayers();(host.querySelector('#layer-hint')||host.querySelector('#layer-hints'))?.focus({preventScroll:true});announce('提示'+state.layerHintLevel+'：'+hint);});
    host.querySelector('#layer-submit').onclick=()=>{
      if(!L.layerCards.every(card=>state.layerAssignments[card.id])){message('请给五句话都选择一个层次。');return;}
      const graded=L.gradeLayers(state.layerAssignments);
      log.submit(2,layerAnswerText(),graded.correct,'按“现场所见—证据解释—补出细节”分层。');state.layerAttempted=true;save();
      if(!graded.correct){renderLayers();message('混层的句子已经列出，调整后可以再次提交。');return;}
      log.note(2,'叙事分层提示打开 '+state.layerHintLevel+' 条。');
      log.finish(2,'能区分发掘事实、谨慎推断与场景想象');render();focusCard();
    };
  }

  function transferFile(){
    return '<section class="transfer-file"><header><span>'+esc(L.transfer.label)+'</span><small>'+esc(L.transfer.place)+'</small></header><div class="transfer-records">'+L.transfer.records.map(item=>'<article><b>'+esc(item.title)+'</b><p>'+esc(item.text)+'</p></article>').join('')+'</div><p class="transfer-boundary">'+esc(L.transfer.boundary)+'</p></section>';
  }
  function claimsDesk(){
    return '<div class="claims-desk-village">'+L.claims.map((claim,index)=>'<article class="claim-row-village"><p><small>候选展签 '+(index+1)+'</small>'+esc(claim.text)+'</p><div class="claim-ratings-village" role="radiogroup" aria-label="判断候选展签'+(index+1)+'的证据强度">'+L.ratings.map((rating,ratingIndex)=>{const checked=state.ratings[claim.id]===rating.id;return '<button type="button" role="radio" data-claim="'+claim.id+'" data-rating="'+rating.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.ratings[claim.id]&&ratingIndex===0)?'0':'-1')+'">'+esc(rating.text)+'</button>';}).join('')+'</div></article>').join('')+'</div>';
  }
  function claimFeedback(){
    if(!state.finalAttempted)return '';
    const graded=L.gradeClaims(state.ratings);
    if(graded.correct)return '<div class="village-result"><b>你没有把分开的碎片硬拼成一户人的一天。</b><br>记录能直接确认发现物；聚落活动需要谨慎推测；具体人物、时间与证据是否属于同一生活单元仍无法确定。</div>';
    const feedback={
      finds:'发掘记录直接写到了三类发现物，这一层不需要再补人物故事。',
      life:'三类发现物分别支持三类活动，但仍不能判断它们是否由同一批人、在同一天完成。',
      bundle:'三格记录互不相连，材料没有证明它们属于同一家庭、同一天，更不能拼出一户人的完整日程。'
    };
    return '<div class="village-result bad"><b>还有 '+(graded.total-graded.count)+' 句越过了材料。</b><br>'+graded.detail.filter(item=>!item.correct).map(item=>esc(feedback[item.id])).join('<br>')+'</div>';
  }
  function ratingsAnswer(){return L.claims.map(claim=>claim.text+'——'+optionText(L.ratings,state.ratings[claim.id])).join('；');}
  function renderTransfer(){
    const chars=charCount(state.finalLabel);
    const body='<p class="parallel-lead">这次没有关帝庙的示范标签，也换了证据形式。你只拿到三格发掘记录，要替一个新聚落审核展签。</p>'+transferFile()+'<h3>哪些话是记录，哪些话需要降一档？</h3>'+claimsDesk()+'<div class="village-label"><label for="final-label"><b>写一条24—100字展签</b><br><small>建议包含“发现了什么—可以怎样理解—还不能知道什么”。</small></label><textarea id="final-label" maxlength="100" rows="3" placeholder="发掘记录显示……；这些材料支持……；但还不能证明……">'+esc(state.finalLabel)+'</textarea><p><output id="final-count">'+chars+'</output> / 100 字</p><label class="parallel-unsure"><input id="final-unsure" type="checkbox" '+(state.finalUnsure?'checked':'')+'>我现在还不能独立写清，先保存评级过程</label></div><details class="parallel-help" data-help="无名不等于无历史"><summary>卡住时：姓名和活动是两类信息</summary><p>没有姓名，不等于没有生活痕迹。反过来，发现生活痕迹，也不能替某个人补上姓名、性别、每天的习惯和内心感受。</p></details>'+claimFeedback();
    host.innerHTML=card('第四现场 · 新村落审稿','换一个地点，你还能让结论停在证据以内吗？',body,'<button class="primary" id="final-submit">提交展签，完成调查 →</button>');
    host.querySelectorAll('[data-claim]').forEach(button=>button.onclick=()=>{state.ratings[button.dataset.claim]=button.dataset.rating;state.finalAttempted=false;save();renderTransfer();host.querySelector('[data-claim="'+button.dataset.claim+'"][data-rating="'+button.dataset.rating+'"]')?.focus({preventScroll:true});});
    bindRovingRadios();
    const input=host.querySelector('#final-label'),unsure=host.querySelector('#final-unsure'),count=host.querySelector('#final-count');
    input.addEventListener('input',()=>{state.finalLabel=input.value.slice(0,100);state.finalAttempted=false;if(state.finalLabel.trim()){state.finalUnsure=false;unsure.checked=false;}count.textContent=charCount(state.finalLabel);save();});
    unsure.addEventListener('change',()=>{state.finalUnsure=unsure.checked;state.finalAttempted=false;save();});
    bindHelp(3);
    host.querySelector('#final-submit').onclick=()=>{
      if(!L.claims.every(claim=>state.ratings[claim.id])){message('请先给三句候选展签都标出证据强度。');return;}
      if(!state.finalUnsure&&charCount(state.finalLabel)<24){message('请把展签写到24字以上，同时写出证据与边界；暂时说不清也可以勾选。');return;}
      const graded=L.gradeClaims(state.ratings);
      const label=state.finalLabel.trim();
      const answer=ratingsAnswer()+'；我的展签：'+(label||'暂时说不清')+(state.finalUnsure?'；表达状态：仍需帮助':'');
      const explanation=state.finalUnsure?'证据评级仍自动判定；展签表达仍需帮助'+(label?'，当前文字：'+label:'。'):label;
      log.submit(3,answer,graded.correct,explanation);state.finalAttempted=true;save();
      if(!graded.correct){renderTransfer();message('错误评级不能被“暂时说不清”绕过；请根据诊断修订。');return;}
      log.note(3,'独立迁移材料为教学模拟；没有把互不相连的记录拼成同一家庭的一天。');
      log.finish(3,state.finalUnsure?'评级完成，展签表达仍待帮助':'能在新情境中控制历史解释强度');render();focusCard();
    };
  }

  function renderComplete(){
    const initial=optionText(L.initialOptions,state.initialChoice);
    const initialAssessment=L.gradeInitial(state.initialChoice)?'首答已经留意到遗迹与个人故事之间的边界。':'首答先把材料说得过少或过满，后面用三层叙事把它重新校准了。';
    const status=state.finalUnsure?'<div class="village-boundary"><b>“暂时说不清”已经保存。</b><br>这不等于自动掌握；学习记录仍保留首答、提示、分类、评级和当前文字。</div>':'';
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">调查完成 · 让无名者进入历史，也不替他们编故事</p><h2 tabindex="-1">没有姓名，不等于没有历史。</h2><div class="village-review"><b>进入遗址时</b><p>'+esc(initial)+'</p><p>'+esc(initialAssessment)+'</p></div><div class="village-review"><b>现在能说到的范围</b><p>房址、工具、陶窑、墓葬和身体痕迹可以共同支持对居住、生产与长期活动的判断；但从这些痕迹到某个人的姓名、家庭关系、每日食谱和内心感受，中间仍有证据缺口。</p></div>'+status+'<div class="village-method"><span>记录现场所见</span><span>提出有限解释</span><span>标清想象部分</span><span>换材料再迁移</span></div><p class="parallel-takeaway"><b>历史不只属于留下名字的人。</b>考古让沉默的房址、工具和身体痕迹进入叙述；严谨则要求我们不把“可能”写成“亲眼看见”。</p><div class="village-next"><b>下一案：</b>青铜利簋写下“甲子朝”，为什么还不能直接换算年份？ <a href="ligui.html">进入商周时间坐标实验 →</a></div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="village-restart" type="button">重新调查（保留旧记录）</button><a class="secondary" href="courses.html?group=school&subject=历史">返回历史课程</a></div></section>'+log.html();
    host.querySelector('#village-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,spotVisited:['hearth'],spotAnswers:{},layerAssignments:{},ratings:{}};save();render();focusCard();};
  }
  function render(){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();return;}
    if(log.index===0)renderInitial();
    else if(log.index===1)renderSpots();
    else if(log.index===2)renderLayers();
    else renderTransfer();
    progress();
  }
  render();
})();
