'use strict';
(function(){
  const host=document.querySelector('#ligui-task');
  const L=window.LiguiLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请联网刷新后重新打开。</p><button class="primary" id="ligui-refresh">重新打开</button></section>';
    document.querySelector('#ligui-refresh').onclick=()=>location.reload();
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'ligui.html']);

  const esc=F.esc;
  const initialIds=new Set(L.initialOptions.map(item=>item.id));
  const cycleOptionIds=new Set(L.cycleOptions.map(item=>item.id));
  const gateIds=new Set(L.gates.map(item=>item.id));
  const claimIds=new Set(L.claims.map(item=>item.id));
  const ratingIds=new Set(L.ratings.map(item=>item.id));
  const constraintIds=new Set(L.transfer.constraints.map(item=>item.id));
  const candidateIds=new Set(L.transfer.candidates.map(item=>item.id));
  const conclusionIds=new Set(L.transferConclusions.map(item=>item.id));
  const defaults={
    initialChoice:null,initialReason:'',initialUnsure:false,
    cycleDay:1,cycleFound:[],sawXinwei:false,cycleChoice:null,cycleAttempted:false,cycleHintLevel:0,
    gatesOpened:['bronze'],activeGate:'bronze',ratings:{},chainAttempted:false,chainHintLevel:0,
    transferApplied:[],transferCandidate:null,transferConclusion:null,transferAttempted:false,transferHintLevel:0
  };
  let log=F.create(L.title,L.tasks);

  function safeText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function safeList(value,allowed){return Array.isArray(value)?[...new Set(value.filter(item=>allowed.has(item)))]:[];}
  function safeObject(value,keys,values){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    return Object.fromEntries(Object.entries(value).filter(([key,val])=>keys.has(key)&&values.has(val)));
  }
  function loadState(){
    const saved=log.checkpoint.ligui||{};
    const day=Number.isInteger(saved.cycleDay)?Math.max(1,Math.min(121,saved.cycleDay)):1;
    const opened=safeList(saved.gatesOpened,gateIds);
    if(!opened.includes('bronze'))opened.unshift('bronze');
    return {
      ...defaults,...saved,
      initialChoice:initialIds.has(saved.initialChoice)?saved.initialChoice:null,
      initialReason:safeText(saved.initialReason),initialUnsure:!!saved.initialUnsure,
      cycleDay:day,cycleFound:Array.isArray(saved.cycleFound)?[...new Set(saved.cycleFound.map(Number).filter(value=>value===61||value===121))]:[],
      sawXinwei:!!saved.sawXinwei,cycleChoice:cycleOptionIds.has(saved.cycleChoice)?saved.cycleChoice:null,
      cycleAttempted:!!saved.cycleAttempted,cycleHintLevel:Number.isInteger(saved.cycleHintLevel)?Math.max(0,Math.min(saved.cycleHintLevel,L.cycleHints.length)):0,
      gatesOpened:opened,activeGate:gateIds.has(saved.activeGate)?saved.activeGate:'bronze',
      ratings:safeObject(saved.ratings,claimIds,ratingIds),chainAttempted:!!saved.chainAttempted,
      chainHintLevel:Number.isInteger(saved.chainHintLevel)?Math.max(0,Math.min(saved.chainHintLevel,L.chainHints.length)):0,
      transferApplied:safeList(saved.transferApplied,constraintIds),transferCandidate:candidateIds.has(saved.transferCandidate)?saved.transferCandidate:null,
      transferConclusion:conclusionIds.has(saved.transferConclusion)?saved.transferConclusion:null,transferAttempted:!!saved.transferAttempted,
      transferHintLevel:Number.isInteger(saved.transferHintLevel)?Math.max(0,Math.min(saved.transferHintLevel,L.transferHints.length)):0
    };
  }
  let state=loadState();
  function save(){log.point({ligui:state});}
  function optionText(items,id){const item=items.find(entry=>entry.id===id);return item?.text||item?.title||item?.name||id||'';}
  function reasonValue(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function progress(){
    document.querySelectorAll('.ligui-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
    const sources=document.querySelector('#ligui-sources');
    if(sources)sources.hidden=log.index<L.tasks.length;
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.ligui-nav')?.scrollIntoView({block:'start'});}
  function message(value){const box=host.querySelector('#ligui-message');if(box){box.textContent=value;box.focus({preventScroll:true});}}
  function clearMessage(){const box=host.querySelector('#ligui-message');if(box)box.textContent='';}
  function announce(value){const live=document.querySelector('#ligui-live');if(!live)return;live.textContent='';requestAnimationFrame(()=>{live.textContent=value;});}
  function card(label,title,body,button=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="ligui-message" role="status" tabindex="-1"></p>'+button+'</section>';
  }
  function choices(items,selected,label,attr){
    return '<div class="parallel-choices" role="radiogroup" aria-label="'+esc(label)+'">'+items.map((item,index)=>{const checked=item.id===selected;return '<button type="button" role="radio" '+attr+'="'+esc(item.id)+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!selected&&index===0)?'0':'-1')+'">'+esc(item.text)+'</button>';}).join('')+'</div>';
  }
  function selectRadio(button){
    button.closest('[role="radiogroup"]')?.querySelectorAll('[role="radio"]').forEach(item=>{const checked=item===button;item.setAttribute('aria-checked',String(checked));item.tabIndex=checked?0:-1;});
  }
  function bindRovingRadios(){
    host.querySelectorAll('[role="radiogroup"]').forEach(group=>{
      const buttons=[...group.querySelectorAll('[role="radio"]')];
      buttons.forEach((button,index)=>button.addEventListener('keydown',event=>{
        if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key))return;
        event.preventDefault();
        const step=event.key==='ArrowRight'||event.key==='ArrowDown'?1:-1;
        const next=buttons[(index+step+buttons.length)%buttons.length];next.click();next.focus({preventScroll:true});
      }));
    });
  }
  function reason(prefix,label,value,unsure,placeholder,max=900){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" maxlength="'+max+'" rows="3" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindReason(prefix,key,unsureKey,max=900){
    const input=host.querySelector('#'+prefix+'-reason');
    const unsure=host.querySelector('#'+prefix+'-unsure');
    input?.addEventListener('input',()=>{state[key]=input.value.slice(0,max);if(input.value.trim()){state[unsureKey]=false;if(unsure)unsure.checked=false;}save();});
    unsure?.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function hintBox(items,level,prefix){
    const shown=items.slice(0,level);
    const next=level<items.length?'<button type="button" id="'+prefix+'-hint">给我下一条提示</button>':'<p>提示已经全部打开。</p>';
    return '<section class="ligui-hints" id="'+prefix+'-hints" tabindex="-1"><h3>按需领取提示</h3>'+(shown.length?'<ol>'+shown.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>':'<p>还没有打开提示，可以先独立试一试。</p>')+next+'</section>';
  }
  function bindHint(taskIndex,prefix,items,key){
    host.querySelector('#'+prefix+'-hint')?.addEventListener('click',()=>{
      state[key]=Math.min(items.length,state[key]+1);
      const text=items[state[key]-1];log.help(taskIndex,'提示'+state[key]+'：'+text);save();render();
      (host.querySelector('#'+prefix+'-hint')||host.querySelector('#'+prefix+'-hints'))?.focus({preventScroll:true});announce('提示'+state[key]+'：'+text);
    });
  }

  function artifact(){
    return '<div class="ligui-artifact"><div class="bronze-vessel" aria-hidden="true"><i></i><b>利</b></div><div class="artifact-copy"><span>真实器物信息 · 现代隶定节录</span><blockquote>武征商，唯甲子朝……<br>辛未……赐利金……</blockquote><p>器内原铭是金文；这里用现代字形节录，省略号表示没有展示的字句，不是原器拓片。</p></div></div>';
  }
  function renderInitial(){
    const body='<p class="parallel-lead">1976年出土的利簋，按国博通行释读把武王征商与“甲子朝”联系起来。现代教材与年代研究常采用公元前1046年。先封存你的判断：这两件事是怎样连起来的？</p>'+artifact()+'<h3>哪一种说法最稳妥？</h3>'+choices(L.initialOptions,state.initialChoice,'利簋首答判断','data-initial')+reason('initial','留下你现在的依据。',state.initialReason,state.initialUnsure,'例如：我觉得“甲子”能告诉我们……，但还缺少……');
    host.innerHTML=card('第一现场 · 青铜器时间胶囊','“甲子朝”就是公元前1046年吗？',body,'<button class="primary" id="initial-submit">封存首答，打开日轮 →</button>');
    host.querySelectorAll('[data-initial]').forEach(button=>button.onclick=()=>{state.initialChoice=button.dataset.initial;selectRadio(button);clearMessage();save();});
    bindRovingRadios();bindReason('initial','initialReason','initialUnsure');
    host.querySelector('#initial-submit').onclick=()=>{
      const why=reasonValue(state.initialReason,state.initialUnsure);
      if(!state.initialChoice){message('先留一个判断；后面可以用新证据修订。');return;}
      if(!why){message('再留一句依据；暂时说不清也可以勾选。');return;}
      log.submit(0,optionText(L.initialOptions,state.initialChoice),null,why);
      log.note(0,'首答在展示干支循环和断代工程证据链之前封存，本环节不立即判分。');
      log.finish(0,'已封存首答');render();focusCard();
    };
  }

  function cycleLab(){
    const found=state.cycleFound.slice().sort((a,b)=>a-b);
    return '<div class="cycle-lab"><div class="cycle-visual" id="cycle-visual"><div class="gear gear-stem"><small>天干 · 10格</small><b id="cycle-stem">'+esc(L.stems[(state.cycleDay-1)%10])+'</b></div><div class="gear gear-branch"><small>地支 · 12格</small><b id="cycle-branch">'+esc(L.branches[(state.cycleDay-1)%12])+'</b></div><div class="cycle-readout"><span>从甲子起第</span><strong id="cycle-day">'+state.cycleDay+'</strong><span>日</span><b id="cycle-name">'+esc(L.dayName(state.cycleDay))+'</b></div></div><div class="cycle-console"><label for="cycle-range">拖动日轮：第 <output id="cycle-output">'+state.cycleDay+'</output> 日</label><input id="cycle-range" type="range" min="1" max="121" step="1" value="'+state.cycleDay+'" aria-valuetext="第'+state.cycleDay+'日，'+esc(L.dayName(state.cycleDay))+'"><div class="cycle-controls"><button type="button" data-cycle-day="1">回到甲子</button><button type="button" data-cycle-day="8">从甲子走7日</button><button type="button" data-cycle-delta="10">向后10日</button><button type="button" data-cycle-delta="12">向后12日</button></div><button type="button" class="lock-day" id="cycle-lock" '+(L.dayName(state.cycleDay)==='甲子'&&state.cycleDay>1?'':'disabled')+'>锁定这次甲子</button><div class="cycle-found"><b>已经锁定</b><span>起点：第1日 · 甲子</span>'+(found.length?found.map(day=>'<span>第'+day+'日 · 甲子</span>').join(''):'<span>还没找到下一次甲子</span>')+'</div></div></div>';
  }
  function cycleFeedback(){
    if(!state.cycleAttempted)return '';
    const graded=L.gradeCycle(state.cycleFound,state.cycleChoice,state.sawXinwei);
    if(graded.correct)return '<div class="ligui-result"><b>日轮规律找到了。</b><br>甲子到辛未相隔7日，能建立相对顺序；但每60日又会出现甲子，所以仍需年份锚点。</div>';
    const missing=[];
    if(!graded.interval)missing.push('还没走过“甲子→辛未”的7日示范');
    if(!graded.repeats)missing.push('还没锁定第61日和第121日两个甲子');
    if(!graded.choice)missing.push('最后一句仍把循环日名说得太强');
    return '<div class="ligui-result bad"><b>日轮还有一处没对齐。</b><br>'+esc(missing.join('；'))+'。</div>';
  }
  function refreshCycleDom(){
    const day=state.cycleDay,name=L.dayName(day);
    const range=host.querySelector('#cycle-range');
    if(range){range.value=String(day);range.setAttribute('aria-valuetext','第'+day+'日，'+name);}
    const values={
      '#cycle-day':day,'#cycle-output':day,'#cycle-name':name,
      '#cycle-stem':L.stems[(day-1)%10],'#cycle-branch':L.branches[(day-1)%12]
    };
    Object.entries(values).forEach(([selector,value])=>{const node=host.querySelector(selector);if(node)node.textContent=value;});
    const lock=host.querySelector('#cycle-lock');if(lock)lock.disabled=!(name==='甲子'&&day>1);
  }
  function setCycleDay(value,spoken=true){
    state.cycleDay=Math.max(1,Math.min(121,Math.trunc(Number(value)||1)));
    if(state.cycleDay===8)state.sawXinwei=true;
    save();refreshCycleDom();
    if(spoken)announce('第'+state.cycleDay+'日，'+L.dayName(state.cycleDay)+(state.cycleDay===8?'；从甲子起经过7日，到辛未':'。'));
  }
  function renderCycle(){
    const body='<p class="parallel-lead">先做一个有答案的示范：从甲子起走7日，会到辛未。然后让10格和12格两个循环同时回到起点，自己锁定接下来的两次甲子。</p><div class="cycle-rule"><span><b>10</b>个天干循环</span><i>同时回到起点</i><span><b>12</b>个地支循环</span><strong>最小公倍数 = 60</strong></div>'+cycleLab()+'<div class="relative-note"><b>这块铭文能做什么？</b><p>'+(state.sawXinwei?'你已经验证：第1日甲子，第8日辛未，两个日名相隔7日。':'点击“从甲子走7日”，先验证铭文内部的相对日序。')+'</p></div><h3>日轮告诉你的结论是什么？</h3>'+choices(L.cycleOptions,state.cycleChoice,'干支循环结论','data-cycle-choice')+hintBox(L.cycleHints,state.cycleHintLevel,'cycle')+cycleFeedback();
    host.innerHTML=card('第二现场 · 六十日轮','同一个“甲子”，为什么会不断回来？',body,'<button class="primary" id="cycle-submit">提交日轮发现 →</button>');
    host.querySelector('#cycle-range').addEventListener('input',event=>setCycleDay(event.target.value,false));
    host.querySelector('#cycle-range').addEventListener('change',()=>announce('第'+state.cycleDay+'日，'+L.dayName(state.cycleDay)+'。'));
    host.querySelectorAll('[data-cycle-day]').forEach(button=>button.onclick=()=>{setCycleDay(button.dataset.cycleDay);button.focus({preventScroll:true});});
    host.querySelectorAll('[data-cycle-delta]').forEach(button=>button.onclick=()=>{setCycleDay(state.cycleDay+Number(button.dataset.cycleDelta));button.focus({preventScroll:true});});
    host.querySelector('#cycle-lock').onclick=()=>{
      if(L.dayName(state.cycleDay)!=='甲子'||state.cycleDay===1)return;
      if(!state.cycleFound.includes(state.cycleDay))state.cycleFound.push(state.cycleDay);
      state.cycleAttempted=false;save();renderCycle();host.querySelector('#cycle-lock')?.focus({preventScroll:true});announce('已锁定第'+state.cycleDay+'日的甲子。');
    };
    host.querySelectorAll('[data-cycle-choice]').forEach(button=>button.onclick=()=>{state.cycleChoice=button.dataset.cycleChoice;state.cycleAttempted=false;selectRadio(button);clearMessage();save();});
    bindRovingRadios();bindHint(1,'cycle',L.cycleHints,'cycleHintLevel');
    host.querySelector('#cycle-submit').onclick=()=>{
      if(!state.cycleChoice){message('先选一句能够解释日轮的结论。');return;}
      const graded=L.gradeCycle(state.cycleFound,state.cycleChoice,state.sawXinwei);
      const answer='锁定甲子：'+(state.cycleFound.slice().sort((a,b)=>a-b).join('、')||'尚未锁定')+'；'+optionText(L.cycleOptions,state.cycleChoice);
      log.submit(1,answer,graded.correct,'用10与12的最小公倍数解释60日循环。');state.cycleAttempted=true;save();
      if(!graded.correct){renderCycle();message('让两个齿轮都回到起点，再检查你的结论。');return;}
      log.note(1,'已验证甲子到辛未相隔7日，并找到第61、121日再次出现甲子；相对日序不等于绝对公元日期。');
      log.finish(1,'能解释循环日名为何还需要年份锚点');render();focusCard();
    };
  }

  function gateLab(){
    const active=L.gates.find(item=>item.id===state.activeGate)||L.gates[0];
    const funnelStages=[
      ['bronze','反复出现的许多甲子'],
      ['archaeology','商末周初相关年代区间'],
      ['interpretation','若干历法与天象方案'],
      ['synthesis','断代工程采用方案']
    ];
    const funnel='<div class="constraint-funnel" aria-label="候选空间如何收窄">'+funnelStages.map(([id,text],index)=>{const reached=state.gatesOpened.includes(id);return '<div class="'+(reached?'reached':'locked')+'" style="--funnel-step:'+index+'" aria-label="第'+(index+1)+'层，'+(reached?'已查看':'待打开')+'，'+esc(text)+'"><small>第'+(index+1)+'层</small><b>'+esc(text)+'</b></div>';}).join('')+'</div>';
    return '<div class="constraint-lab"><div class="constraint-track" role="group" aria-label="年代证据链">'+L.gates.map(item=>'<button type="button" data-gate="'+item.id+'" class="'+(state.gatesOpened.includes(item.id)?'opened':'')+'" aria-pressed="'+String(active.id===item.id)+'"><small>'+item.step+'</small><b>'+esc(item.title)+'</b><span>'+esc(item.kind)+'</span></button>').join('')+'</div><article class="constraint-readout"><small>'+esc(active.kind)+'</small><h3>'+esc(active.title)+'</h3><p>'+esc(active.effect)+'</p><div><b>这一层还不能单独证明：</b>'+esc(active.boundary)+'</div></article><div class="constraint-meter" aria-label="证据链进度"><span style="--progress:'+(state.gatesOpened.length/L.gates.length*100)+'%"></span><b>'+state.gatesOpened.length+' / '+L.gates.length+' 层已查看</b></div>'+funnel+'</div>';
  }
  function claimRows(){
    return '<div class="ligui-claims">'+L.claims.map((claim,index)=>'<article class="ligui-claim"><p><small>展签 '+(index+1)+'</small>'+esc(claim.text)+'</p><div role="radiogroup" aria-label="审核展签'+(index+1)+'">'+L.ratings.map((rating,pos)=>{const checked=state.ratings[claim.id]===rating.id;return '<button type="button" role="radio" data-claim="'+claim.id+'" data-rating="'+rating.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.ratings[claim.id]&&pos===0)?'0':'-1')+'">'+esc(rating.text)+'</button>';}).join('')+'</div></article>').join('')+'</div>';
  }
  function chainFeedback(){
    if(!state.chainAttempted)return '';
    const graded=L.gradeClaims(state.ratings);
    if(graded.correct)return '<div class="ligui-result"><b>三种证据强度分开了。</b><br>“甲子朝”由原铭及通行释读支持；1046是综合方案；现代公元日期不是青铜器上的原话。</div>';
    const hints={event:'回到第一层，找能在铭文节录中直接对应的词。',year:'“断代工程采用”说的是多学科综合，不是原铭直写。',literal:'现代公元纪年数字没有出现在这件青铜器原铭里。'};
    const wrong=graded.detail.filter(item=>!item.correct).map(item=>hints[item.id]);
    return '<div class="ligui-result bad"><b>已对 '+graded.count+' / '+graded.total+' 条。</b><br>'+esc(wrong.join(' '))+'</div>';
  }
  function renderChain(){
    const all=L.gates.every(item=>state.gatesOpened.includes(item.id));
    const audit=all?'<div class="chain-outcome"><b>断代工程采用的坐标</b><strong>公元前 1046 年</strong><p>它是多类约束整体匹配后的方案，不是“甲子”三个字的现代翻译。</p></div><h3>现在审核三条博物馆展签</h3>'+claimRows()+hintBox(L.chainHints,state.chainHintLevel,'chain')+chainFeedback():'<div class="chain-lock"><b>先把四层证据都打开</b><p>每层都要写清“它增加了什么”和“它仍不能单独证明什么”。</p></div>';
    const body='<p class="parallel-lead">公元前1046年不是从一个字词里蹦出来的。依次打开约束层，观察候选空间怎样从“反复出现的许多甲子”逐层收窄；这里展示方法关系，不冒充真实天文复算。</p>'+gateLab()+audit;
    host.innerHTML=card('第三现场 · 年代约束台','一个年份，要通过几道独立校验？',body,'<button class="primary" id="chain-submit">提交展签审核 →</button>');
    host.querySelectorAll('[data-gate]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.gate;state.activeGate=id;if(!state.gatesOpened.includes(id))state.gatesOpened.push(id);save();renderChain();host.querySelector('[data-gate="'+id+'"]')?.focus({preventScroll:true});
      const gate=L.gates.find(item=>item.id===id);announce(gate.title+'：'+gate.effect+'；边界：'+gate.boundary);
    });
    if(all){
      host.querySelectorAll('[data-claim]').forEach(button=>button.onclick=()=>{state.ratings[button.dataset.claim]=button.dataset.rating;state.chainAttempted=false;save();renderChain();host.querySelector('[data-claim="'+button.dataset.claim+'"][data-rating="'+button.dataset.rating+'"]')?.focus({preventScroll:true});});
      bindRovingRadios();bindHint(2,'chain',L.chainHints,'chainHintLevel');
    }
    host.querySelector('#chain-submit').onclick=()=>{
      if(!all){message('先打开四层证据，不能跳过中间过程只记最后年份。');return;}
      if(L.claims.some(claim=>!state.ratings[claim.id])){message('三条展签都需要标出证据强度。');return;}
      const graded=L.gradeClaims(state.ratings);
      const answer=L.claims.map(claim=>claim.text+'→'+optionText(L.ratings,state.ratings[claim.id])).join('；');
      log.submit(2,answer,graded.correct,'按原铭直证、综合推定与越界表述审核。');state.chainAttempted=true;save();
      if(!graded.correct){renderChain();message('回到相应约束层，检查这句话究竟来自哪里。');return;}
      log.note(2,'已查看四层约束；“岁鼎”等释读存在讨论，公元前1046年按断代工程采用方案表述，不冒充原铭直写。');
      log.finish(2,'能区分原始信息、解释前提和综合年代方案');render();focusCard();
    };
  }

  function transferTable(){
    const remaining=new Set(L.remainingCandidates(state.transferApplied));
    return '<div class="transfer-table" role="table" aria-label="四个年代方案与三项约束"><div class="transfer-row transfer-head" role="row"><span role="columnheader">候选</span>'+L.transfer.constraints.map(item=>'<span role="columnheader">'+esc(item.short)+'</span>').join('')+'</div>'+L.transfer.candidates.map(candidate=>'<div class="transfer-row '+(remaining.has(candidate.id)?'alive':'eliminated')+'" role="row"><b role="rowheader">'+esc(candidate.label)+'</b>'+L.transfer.constraints.map(item=>{const applied=state.transferApplied.includes(item.id);const pass=candidate.checks[item.id];return '<span role="cell" class="'+(applied?(pass?'pass':'fail'):'pending')+'">'+(applied?(pass?'符合':'冲突'):'待检')+'</span>';}).join('')+'</div>').join('')+'</div>';
  }
  function transferFeedback(){
    if(!state.transferAttempted)return '';
    const graded=L.gradeTransfer(state.transferApplied,state.transferCandidate,state.transferConclusion);
    if(graded.correct)return '<div class="ligui-result"><b>约束交集找对了。</b><br>只有方案B通过当前三项校验；最稳的表述是“在这些前提下，目前最匹配”，不是“木牍直写”。</div>';
    const pieces=[];
    if(!graded.candidate)pieces.push('候选方案没有停在三项约束的共同交集');
    if(!graded.conclusion)pieces.push('结论强度仍高于材料能够支持的范围');
    return '<div class="ligui-result bad"><b>还有一处越过了约束。</b><br>'+esc(pieces.join('；'))+'。</div>';
  }
  function renderTransfer(){
    const all=L.transfer.constraints.every(item=>state.transferApplied.includes(item.id));
    const remaining=L.remainingCandidates(state.transferApplied);
    const controls='<div class="constraint-controls" role="group" aria-label="选择外部约束">'+L.transfer.constraints.map(item=>'<button type="button" data-constraint="'+item.id+'" aria-pressed="'+String(state.transferApplied.includes(item.id))+'"><b>'+esc(item.title)+'</b><small>'+esc(item.description)+'</small></button>').join('')+'</div>';
    const choice=all?'<h3>哪套方案通过了当前全部约束？</h3><div class="candidate-choices" role="radiogroup" aria-label="选择最匹配方案">'+L.transfer.candidates.map((item,index)=>{const checked=state.transferCandidate===item.id;return '<button type="button" role="radio" data-candidate="'+item.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.transferCandidate&&index===0)?'0':'-1')+'">'+esc(item.label)+'</button>';}).join('')+'</div><h3>怎样表述这个结果才不过界？</h3>'+choices(L.transferConclusions,state.transferConclusion,'迁移结论强度','data-transfer-conclusion')+hintBox(L.transferHints,state.transferHintLevel,'transfer')+transferFeedback():'<div class="transfer-remaining"><b>当前还剩 '+remaining.length+' 套候选</b><p>继续加入独立约束；冲突的方案会退出，但已经通过的方案仍可能在下一层被排除。</p></div>';
    const body='<p class="parallel-lead">现在换一种材料呈现方式。你不知道任何“标准年份”，只能让四套方案逐项接受检验，寻找“约束交集”——也就是同时满足全部条件的部分。</p><section class="simulation-file"><span>'+esc(L.transfer.label)+'</span><blockquote>'+esc(L.transfer.record)+'</blockquote><p>'+esc(L.transfer.note)+'</p></section>'+controls+transferTable()+choice;
    host.innerHTML=card('第四现场 · 海岬城模拟档案','把所有约束放在一起，交集还剩谁？',body,'<button class="primary" id="transfer-submit">提交年代审查 →</button>');
    host.querySelectorAll('[data-constraint]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.constraint;if(!state.transferApplied.includes(id))state.transferApplied.push(id);state.transferAttempted=false;save();renderTransfer();host.querySelector('[data-constraint="'+id+'"]')?.focus({preventScroll:true});
      const left=L.remainingCandidates(state.transferApplied);announce(optionText(L.transfer.constraints,id)+'已加入，当前剩余'+left.length+'套方案。');
    });
    if(all){
      host.querySelectorAll('[data-candidate]').forEach(button=>button.onclick=()=>{state.transferCandidate=button.dataset.candidate;state.transferAttempted=false;save();renderTransfer();host.querySelector('[data-candidate="'+state.transferCandidate+'"]')?.focus({preventScroll:true});});
      host.querySelectorAll('[data-transfer-conclusion]').forEach(button=>button.onclick=()=>{state.transferConclusion=button.dataset.transferConclusion;state.transferAttempted=false;save();renderTransfer();host.querySelector('[data-transfer-conclusion="'+state.transferConclusion+'"]')?.focus({preventScroll:true});});
      bindRovingRadios();bindHint(3,'transfer',L.transferHints,'transferHintLevel');
    }
    host.querySelector('#transfer-submit').onclick=()=>{
      if(!all){message('先让四套方案接受全部三项独立约束。');return;}
      if(!state.transferCandidate||!state.transferConclusion){message('选择最匹配方案，并给出强度合适的结论。');return;}
      const graded=L.gradeTransfer(state.transferApplied,state.transferCandidate,state.transferConclusion);
      const answer='选择'+state.transferCandidate+'；'+optionText(L.transferConclusions,state.transferConclusion);
      log.submit(3,answer,graded.correct,'依据木材范围、王年顺序与天象复算的交集。');state.transferAttempted=true;save();
      if(!graded.correct){renderTransfer();message('逐行找冲突，再把“最匹配”和“原文直写”分开。');return;}
      log.note(3,'海岬城档案、候选方案和三项约束均为教学模拟；通过当前约束不等于获得绝对无误的真实年代。');
      log.finish(3,'能在新情境中用约束交集选择并控制结论强度');render();focusCard();
    };
  }

  function renderComplete(){
    const initial=optionText(L.initialOptions,state.initialChoice);
    const start=L.gradeInitial(state.initialChoice)?'首答已经抓住“循环信号＋年份锚点”。':'首答里的直觉，后来被六十日轮和证据链重新校准了。';
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">年代调查完成 · 把答案还原成证明过程</p><h2 tabindex="-1">甲子不是坐标点，而是一条会反复经过的刻度。</h2><div class="ligui-review"><b>进入实验室时</b><p>'+esc(initial)+'</p><p>'+esc(start)+'</p></div><div class="ligui-review"><b>现在能说到的范围</b><p>按国博通行释读，利簋把武王征商与甲子日清晨联系起来，也留下辛未这一相对日序。公元前1046年是夏商周断代工程结合考古、测年、文献、历法、天文和金文历谱等材料后采用的方案，不是原铭里直接写出的现代年份。</p></div><div class="ligui-method"><span>读原器与通行释读</span><span>识别循环信号</span><span>加入独立锚点</span><span>求约束交集</span><span>控制结论强度</span></div><p class="parallel-takeaway"><b>不同方案不等于历史不可知。</b>它提醒我们公开前提、继续找约束，并让结论精度不超过证据链。</p><div class="ligui-next"><b>年代案卷先封存。</b>下一案稍后开放；你可以先把这条证据链讲给别人听。</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="ligui-restart" type="button">重新调查（保留旧记录）</button><a class="secondary" href="courses.html?group=school&amp;subject=历史">返回历史课程</a></div></section>'+log.html();
    host.querySelector('#ligui-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,cycleFound:[],gatesOpened:['bronze'],ratings:{},transferApplied:[]};save();render();focusCard();};
  }
  function render(){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();return;}
    if(log.index===0)renderInitial();
    else if(log.index===1)renderCycle();
    else if(log.index===2)renderChain();
    else renderTransfer();
    progress();
  }
  render();
})();
