'use strict';
(function(){
  const host=document.querySelector('#oracle-task');
  const L=window.OracleLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请联网刷新后重新打开。</p><button class="primary" id="oracle-refresh">重新打开</button></section>';
    document.querySelector('#oracle-refresh').onclick=()=>location.reload();
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'oracle.html']);

  const esc=F.esc;
  const validId=(value,items)=>items.some(item=>item.id===value)?value:null;
  const optionText=(items,id)=>items.find(item=>item.id===id)?.text||id||'';
  const stageIds=new Set(L.timelineStages.map(item=>item.id));
  const sortIds=new Set(L.sortCards.map(item=>item.id));
  const claimIds=new Set(L.claims.map(item=>item.id));
  const ratingIds=new Set(L.ratings.map(item=>item.id));
  const defaults={
    initialChoice:null,initialReason:'',initialUnsure:false,
    timelineIndex:0,timelineVisited:['preface'],timelineChoice:null,timelineAttempted:false,
    sortOrder:[...L.defaultOrder],sortSelected:null,sortReason:null,sortUnsure:false,sortAttempted:false,sortHintLevel:0,
    ratings:{},finalLabel:'',finalUnsure:false,finalAttempted:false,transferRevealed:false
  };
  let log=F.create(L.title,L.tasks);

  function safeText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function safeOrder(value){
    if(!Array.isArray(value)||value.length!==L.correctOrder.length)return [...L.defaultOrder];
    const unique=[...new Set(value.filter(id=>sortIds.has(id)))];
    return unique.length===L.correctOrder.length?unique:[...L.defaultOrder];
  }
  function safeRatings(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    return Object.fromEntries(Object.entries(value).filter(([key,val])=>claimIds.has(key)&&ratingIds.has(val)));
  }
  function loadState(){
    const saved=log.checkpoint.oracle||{};
    const index=Number.isInteger(saved.timelineIndex)&&saved.timelineIndex>=0&&saved.timelineIndex<L.timelineStages.length?saved.timelineIndex:0;
    const visited=Array.isArray(saved.timelineVisited)?[...new Set(saved.timelineVisited.filter(id=>stageIds.has(id)))]:['preface'];
    if(!visited.includes('preface'))visited.unshift('preface');
    return {
      ...defaults,...saved,
      initialChoice:validId(saved.initialChoice,L.initialOptions),initialReason:safeText(saved.initialReason),initialUnsure:!!saved.initialUnsure,
      timelineIndex:index,timelineVisited:visited,timelineChoice:validId(saved.timelineChoice,L.layerOptions),timelineAttempted:!!saved.timelineAttempted,
      sortOrder:safeOrder(saved.sortOrder),sortSelected:Number.isInteger(saved.sortSelected)&&saved.sortSelected>=0&&saved.sortSelected<L.correctOrder.length?saved.sortSelected:null,
      sortReason:validId(saved.sortReason,L.sortReasons),sortUnsure:!!saved.sortUnsure,sortAttempted:!!saved.sortAttempted,
      sortHintLevel:Number.isInteger(saved.sortHintLevel)?Math.max(0,Math.min(saved.sortHintLevel,L.sortHints.length)):0,
      ratings:safeRatings(saved.ratings),finalLabel:safeText(saved.finalLabel,90),finalUnsure:!!saved.finalUnsure,finalAttempted:!!saved.finalAttempted,transferRevealed:!!saved.transferRevealed
    };
  }
  let state=loadState();
  function save(){log.point({oracle:state});}
  function reasonValue(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function charCount(value){return Array.from(value.trim()).length;}
  function progress(){
    document.querySelectorAll('.oracle-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
    const sources=document.querySelector('#oracle-sources');
    if(sources)sources.hidden=log.index<L.tasks.length;
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.oracle-nav')?.scrollIntoView({block:'start'});}
  function message(value){const box=host.querySelector('#oracle-message');if(box){box.textContent=value;box.focus({preventScroll:true});}}
  function clearMessage(){const box=host.querySelector('#oracle-message');if(box)box.textContent='';}
  function announce(value){const live=document.querySelector('#oracle-live');if(!live)return;live.textContent='';requestAnimationFrame(()=>{live.textContent=value;});}
  function card(label,title,body,button=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="oracle-message" role="status" tabindex="-1"></p>'+button+'</section>';
  }
  function choices(items,selected,label,attr='data-choice'){
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
        const next=buttons[(index+step+buttons.length)%buttons.length];
        next.click();next.focus({preventScroll:true});
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
  function bindHelp(index){host.querySelectorAll('details[data-help]').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)log.help(index,item.dataset.help);}));}

  function sourceLines(){
    return '<div class="oracle-source-note"><b>真实馆藏资料的现代汉语释意</b><br>据中国国家博物馆藏《卜骨》说明整理；不展示甲骨原字，A—D标签是课程所加。</div><div class="oracle-lines">'+L.sourceLines.map(line=>'<article class="oracle-line"><b>'+esc(line.mark)+'</b><span>'+esc(line.text)+'</span></article>').join('')+'</div>';
  }
  function renderInitial(){
    const body='<p class="parallel-lead">你进入殷墟王室记录室。面前这片卜骨上，一条记录说到了前后好几天。先别找标准答案，只判断这四段文字合在一起主要记录了什么。</p>'+sourceLines()+'<h3>四段话合起来，最接近哪一种记录？</h3>'+choices(L.initialOptions,state.initialChoice,'首答判断','data-initial')+reason('initial','留下你现在的依据。',state.initialReason,state.initialUnsure,'例如：我注意到A写……，D写……，所以……');
    host.innerHTML=card('第一现场 · 王室刻辞记录','一片骨上，到底写了什么？',body,'<button class="primary" id="initial-submit">封存首答，进入火光现场 →</button>');
    host.querySelectorAll('[data-initial]').forEach(button=>button.onclick=()=>{state.initialChoice=button.dataset.initial;selectRadio(button);clearMessage();save();});
    bindRovingRadios();
    bindReason('initial','initialReason','initialUnsure');
    host.querySelector('#initial-submit').onclick=()=>{
      const why=reasonValue(state.initialReason,state.initialUnsure);
      if(!state.initialChoice){message('先留下一个判断，之后还会有机会用新证据重新审视。');return;}
      if(!why){message('再留一句依据；暂时说不清也可以勾选。');return;}
      log.submit(0,optionText(L.initialOptions,state.initialChoice),null,why);
      log.note(0,'首答在揭示卜辞四层结构前封存，本环节不立即判分。');
      log.finish(0,'已封存首答');render();focusCard();
    };
  }

  function boneSvg(){
    return '<svg viewBox="0 0 420 360" role="img" aria-label="教学甲骨与灼烧兆纹示意"><defs><radialGradient id="or-fire" cx="50%" cy="80%" r="55%"><stop offset="0" stop-color="#fff4a1"/><stop offset=".48" stop-color="#e46f31"/><stop offset="1" stop-color="#8e2d1b"/></radialGradient></defs><path class="bone-shell" d="M111 31Q189 2 291 28q70 19 64 99l-9 156q-4 58-70 55l-145-8q-70-4-64-71l11-143q5-62 33-85Z"/><ellipse class="bone-hole" cx="123" cy="91" rx="13" ry="24"/><ellipse class="bone-hole" cx="312" cy="104" rx="11" ry="21"/><path class="bone-crack" d="M201 78l-12 55 31 29-24 48 35 46M220 161l57-24M196 210l-52 30M231 256l39 36"/><path class="bone-fire" fill="url(#or-fire)" d="M176 333q-32-40 8-75-2 35 22 24 28-14 14-56 58 54 27 107Z"/></svg>';
  }
  function timelineLab(){
    const stage=L.timelineStages[state.timelineIndex];
    return '<div class="timeline-lab"><div class="bone-stage" data-stage="'+state.timelineIndex+'">'+boneSvg()+'<div class="bone-inscription">'+esc(stage.bone)+'</div><span>教学过程示意 · 不是复原影像</span></div><div class="timeline-console"><div class="timeline-buttons" role="group" aria-label="卜辞内容时间轴">'+L.timelineStages.map((item,index)=>'<button type="button" data-stage-index="'+index+'" class="'+(state.timelineVisited.includes(item.id)?'visited':'')+'" aria-pressed="'+String(index===state.timelineIndex)+'"><small>'+esc(item.time)+'</small><br>'+esc(item.short)+'</button>').join('')+'</div><article class="stage-readout"><small>'+esc(stage.time)+' · '+esc(stage.short)+'</small><h3>'+esc(stage.title)+'</h3><p>'+esc(stage.text)+'</p><p class="stage-action">'+esc(stage.action)+'</p></article><p class="timeline-progress">已经看过 '+state.timelineVisited.length+' / '+L.timelineStages.length+' 个内容位置</p></div></div>';
  }
  function timelineFeedback(){
    if(!state.timelineAttempted)return '';
    const correct=L.gradeTimeline(state.timelineChoice);
    const wrong={
      preface:'叙辞／前辞记录日期和主持者，内容对应占卜背景。',
      charge:'命辞写的是尚未发生、准备占问或检验的事情。',
      prognostication:'占辞内容来自看到兆纹后的判断，不是后来情况的追记。'
    };
    return '<div class="layer-result '+(correct?'':'bad')+'"><b>'+(correct?'内容指向的时间位置找对了。':'还要把“判断”与“后来追记”分开。')+'</b><br>'+(correct?'验辞包含事后才可能知道的信息；它仍是记录者一侧的追记，不是独立核验。':esc(wrong[state.timelineChoice]||'沿时间轴重新看一次。'))+'</div>';
  }
  function renderTimeline(){
    const ready=state.timelineVisited.length===L.timelineStages.length;
    const check=ready?'<div class="layer-check"><h3>哪一层包含事后才可能知道的信息？</h3>'+choices(L.layerOptions,state.timelineChoice,'选择记录后来情况的一层','data-layer')+timelineFeedback()+'</div>':'<div class="oracle-boundary"><b>先沿内容所指的四个时间位置走一遍</b><br>动画展示各部分说的是哪个阶段，不推定文字实际分四次刻写，也不说明占卜能科学预测未来。</div>';
    const body='<p class="parallel-lead">沿着内容所指的时间往前走：占问的事、看到兆纹后的判断、数日后的追记，并不处在事情的同一阶段。</p>'+timelineLab()+'<div class="oracle-boundary"><b>内容顺序不等于刀刻顺序。</b>课程没有断定四部分分别在四个时刻刻上去；完整文字也可能后来集中刻录。完整四层很少见，多数卜辞只有叙辞和命辞；甲骨残断还可能让后半段消失。因此“现存部分没看到”不能直接说成“事情从未发生”。</div><details class="parallel-help" data-help="命辞不只靠问号识别"><summary>为什么命辞不一定像现代问句？</summary><p>甲骨时代没有今天这套标点。学者对有些命辞究竟是问句还是关于未来的陈述命题也有讨论。更稳的方法是看作用：它写的是准备占问或检验的事。</p></details>'+check;
    host.innerHTML=card('第二现场 · 火光时间轴','四层内容，分别指向什么时候？',body,'<button class="primary" id="timeline-submit">收好时间轴，进入复原台 →</button>');
    host.querySelectorAll('[data-stage-index]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.stageIndex);const stage=L.timelineStages[index];if(!stage)return;state.timelineIndex=index;if(!state.timelineVisited.includes(stage.id))state.timelineVisited.push(stage.id);save();renderTimeline();host.querySelector('[data-stage-index="'+index+'"]')?.focus({preventScroll:true});announce(stage.time+'，'+stage.short+'：'+stage.text);});
    host.querySelectorAll('[data-layer]').forEach(button=>button.onclick=()=>{state.timelineChoice=button.dataset.layer;state.timelineAttempted=false;save();renderTimeline();host.querySelector('[data-layer="'+state.timelineChoice+'"]')?.focus({preventScroll:true});});
    bindRovingRadios();
    bindHelp(1);
    host.querySelector('#timeline-submit').onclick=()=>{
      if(!ready){message('请先查看四个时间位置。');return;}
      if(!state.timelineChoice){message('请指出哪一层包含事后才可能知道的信息。');return;}
      const correct=L.gradeTimeline(state.timelineChoice);
      log.submit(1,optionText(L.layerOptions,state.timelineChoice),correct,'依据内容所指的时间位置判断。');state.timelineAttempted=true;save();
      if(!correct){renderTimeline();message('对照上方时间位置，再把“判断”和“实际结果”分开。');return;}
      log.note(1,'已查看四层；内容所指时间不等于实际刻写时间，现存未见也不等于从未发生。');
      log.finish(1,'能按内容所指时间区分四层记录');render();focusCard();
    };
  }

  function sortCardText(id){return L.sortCards.find(item=>item.id===id)?.text||id;}
  function orderAnswer(){return state.sortOrder.map((id,index)=>(index+1)+'．'+sortCardText(id)).join(' → ');}
  function sortFeedback(){
    if(!state.sortAttempted)return '';
    const graded=L.gradeSort(state.sortOrder,state.sortReason);
    if(graded.correct)return '<div class="sort-result"><b>内容链完整了。</b><br>你没有依赖问号，而是用“尚未发生／看过兆纹／到了来月并追记”等关系恢复了记录。</div>';
    if(!graded.sequence){
      const index=L.correctOrder.findIndex((id,pos)=>state.sortOrder[pos]!==id);
      const expected=L.sortCards.find(item=>item.id===L.correctOrder[index]);
      return '<div class="sort-result bad"><b>第 '+(index+1)+' 个时间位置还没接上。</b><br>'+esc(expected?.clue||'重新比较每张卡发生在兆纹出现前还是以后。')+'</div>';
    }
    return '<div class="sort-result bad"><b>排列已经正确，解释仍把标志词认错了。</b><br>“吉”是判断；“到了来月、追记”才表明记录者在补记后来情况。</div>';
  }
  function sortLab(){
    const labels=['占卜背景','事情发生前','兆纹出现后','后来有了进展'];
    return '<p class="sort-instruction"><b>操作：</b>先点一张卡，再点另一张卡交换位置。触屏、键盘都可以使用。</p><div class="sort-lab">'+state.sortOrder.map((id,index)=>'<div class="sort-position"><span>'+labels[index]+'<br>第 '+(index+1)+' 步</span><button type="button" class="sort-card" data-sort-index="'+index+'" aria-pressed="'+String(state.sortSelected===index)+'" aria-label="第'+(index+1)+'步，'+esc(sortCardText(id))+'；点击后可与另一张卡交换">'+esc(sortCardText(id))+'</button></div>').join('')+'</div>';
  }
  function hintConsole(){
    const shown=L.sortHints.slice(0,state.sortHintLevel);
    const button=state.sortHintLevel<L.sortHints.length?'<button type="button" id="sort-hint" aria-controls="sort-hints">给我下一条提示</button>':'<p>四条提示已经全部打开。</p>';
    return '<section class="hint-console" id="sort-hints" tabindex="-1"><h3>按需领取提示</h3>'+(shown.length?'<ol>'+shown.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>':'<p>现在还没有打开提示，可以先独立试一次。</p>')+button+'</section>';
  }
  function renderSort(){
    const body='<p class="parallel-lead">这次换到农业情境，颜色和正式术语都撤掉。你只能靠内容所指的时间与功能复原四层。</p><span class="simulation-label">教学模拟 · 现代汉语仿结构 · 不是出土原文</span>'+sortLab()+hintConsole()+'<h3>为什么最后一张属于事后追记？</h3><div class="sort-reasons" role="radiogroup" aria-label="选择排列理由">'+L.sortReasons.map((item,index)=>{const checked=state.sortReason===item.id;return '<button type="button" role="radio" data-sort-reason="'+item.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.sortReason&&index===0)?'0':'-1')+'">'+esc(item.text)+'</button>';}).join('')+'</div><label class="parallel-unsure"><input id="sort-unsure" type="checkbox" '+(state.sortUnsure?'checked':'')+'>排列可以先完成，但理由暂时说不清</label>'+sortFeedback();
    host.innerHTML=card('第三现场 · 残片复原台','没有问号，还能认出命辞吗？',body,'<button class="primary" id="sort-submit">提交复原结果 →</button>');
    host.querySelectorAll('[data-sort-index]').forEach(button=>button.onclick=()=>{
      const index=Number(button.dataset.sortIndex);
      if(state.sortSelected===null){state.sortSelected=index;}
      else if(state.sortSelected===index){state.sortSelected=null;}
      else {const first=state.sortSelected;[state.sortOrder[first],state.sortOrder[index]]=[state.sortOrder[index],state.sortOrder[first]];state.sortSelected=null;state.sortAttempted=false;}
      save();renderSort();host.querySelector('[data-sort-index="'+index+'"]')?.focus({preventScroll:true});
    });
    host.querySelector('#sort-hint')?.addEventListener('click',()=>{state.sortHintLevel=Math.min(L.sortHints.length,state.sortHintLevel+1);const hint=L.sortHints[state.sortHintLevel-1];log.help(2,'排序提示'+state.sortHintLevel+'：'+hint);save();renderSort();(host.querySelector('#sort-hint')||host.querySelector('#sort-hints'))?.focus({preventScroll:true});announce('提示'+state.sortHintLevel+'：'+hint);});
    host.querySelectorAll('[data-sort-reason]').forEach(button=>button.onclick=()=>{state.sortReason=button.dataset.sortReason;state.sortUnsure=false;state.sortAttempted=false;save();renderSort();host.querySelector('[data-sort-reason="'+state.sortReason+'"]')?.focus({preventScroll:true});});
    bindRovingRadios();
    host.querySelector('#sort-unsure').onchange=event=>{state.sortUnsure=event.target.checked;if(state.sortUnsure)state.sortReason=null;state.sortAttempted=false;save();renderSort();host.querySelector('#sort-unsure')?.focus({preventScroll:true});};
    host.querySelector('#sort-submit').onclick=()=>{
      if(!state.sortReason&&!state.sortUnsure){message('请选择一个判断依据；暂时说不清也可以勾选。');return;}
      const graded=L.gradeSort(state.sortOrder,state.sortReason);
      const passed=graded.sequence&&(graded.reason||state.sortUnsure);
      const answer=orderAnswer()+'；理由：'+(state.sortUnsure?'暂时说不清':optionText(L.sortReasons,state.sortReason));
      log.submit(2,answer,graded.correct?true:passed?null:false,state.sortUnsure?'排列已完成，解释暂时说不清。':optionText(L.sortReasons,state.sortReason));state.sortAttempted=true;save();
      if(!passed){renderSort();message('上方保留了这次复原的具体诊断，可以调整后再提交。');return;}
      log.note(2,'排序提示共打开 '+state.sortHintLevel+' 条；首次与后续排列均按提交顺序保留。');
      log.finish(2,state.sortUnsure?'排列完成，解释仍待练习':'能用时间关系复原四层');render();focusCard();
    };
  }

  function artifact(){
    const s=L.transferSource;
    const boundary=state.transferRevealed?'<p class="artifact-boundary">'+esc(s.boundary)+'</p>':'';
    return '<section class="oracle-artifact"><header><span>'+esc(s.label)+'</span><small>'+esc(s.provenance)+'</small></header><div class="paired-charges"><article><small>龟甲正面 · 文字 A</small><blockquote>'+esc(s.lineA)+'</blockquote><p>现代释意：'+esc(s.glossA)+'</p></article><article><small>龟甲正面 · 文字 B</small><blockquote>'+esc(s.lineB)+'</blockquote><p>现代释意：'+esc(s.glossB)+'</p></article></div>'+boundary+'</section>';
  }
  function claimsDesk(){
    return '<div class="claims-desk">'+L.claims.map((claim,index)=>'<article class="claim-row"><p><small>拟写展签 '+(index+1)+'</small>'+esc(claim.text)+'</p><div class="claim-ratings" role="radiogroup" aria-label="判断展签'+(index+1)+'的证据强度">'+L.ratings.map((rating,ratingIndex)=>{const checked=state.ratings[claim.id]===rating.id;return '<button type="button" role="radio" data-claim="'+claim.id+'" data-rating="'+rating.id+'" aria-checked="'+String(checked)+'" tabindex="'+(checked||(!state.ratings[claim.id]&&ratingIndex===0)?'0':'-1')+'">'+esc(rating.text)+'</button>';}).join('')+'</div></article>').join('')+'</div>';
  }
  function claimFeedback(){
    if(!state.finalAttempted)return '';
    const graded=L.gradeClaims(state.ratings);
    if(graded.correct)return '<div class="claim-result"><b>展签的边界守住了。</b><br>两条文字直接说明年成被列作占问事项；“商王室相关”还要结合出土背景谨慎判断。正反命辞不是两个已经发生的结果，也不能给出当年实际丰歉。</div>';
    const feedback={
      concern:'“我受年／我不其受年”直接表明这两条命辞把年成列作占问事项。',
      royal:'“商王室相关”需要结合YH127坑、武丁时期等出土背景谨慎判断，不是两句话直接写出的身份。',
      harvest:'“我受年”在这里是命辞，不是后来追记的丰收结果。',
    };
    return '<div class="claim-result bad"><b>还有 '+(graded.total-graded.count)+' 句越过了现存文字。</b><br>'+graded.detail.filter(item=>!item.correct).map(item=>esc(feedback[item.id])).join('<br>')+'</div>';
  }
  function ratingsAnswer(){return L.claims.map(claim=>claim.text+'——'+optionText(L.ratings,state.ratings[claim.id])).join('；');}
  function renderTransfer(){
    const chars=charCount(state.finalLabel);
    const body='<p class="parallel-lead">现在没有颜色、时间槽和四层标签。你只拿到真实出土信息与两句刻辞，要替博物馆审核展签。</p>'+artifact()+'<h3>两句哪句才是“实际真相”？</h3><p>先给三句拟写展签标出证据强度。注意：文字直接支持的内容，与结合出土背景作出的判断，不在同一层。</p>'+claimsDesk()+'<div class="final-label"><label for="final-label"><b>给这件卜甲写一条30—90字展签</b><br><small>建议同时写出“它说明什么”和“它还不能证明什么”。</small></label><textarea id="final-label" maxlength="90" rows="3" placeholder="现存两项文字说明……；它们还不能证明……">'+esc(state.finalLabel)+'</textarea><p><output id="final-count">'+chars+'</output> / 90 字</p><label class="parallel-unsure"><input id="final-unsure" type="checkbox" '+(state.finalUnsure?'checked':'')+'>我现在还不能独立写清，先保存判断过程</label></div><details class="parallel-help" data-help="正反命辞不是正反结果"><summary>卡住时：先问它处在哪个时间位置</summary><p>两句内容都属于待检验的命题，本身没有记录后来结果。要知道后来究竟丰收还是歉收，应继续寻找对应的验辞，并尽量与其他同时代材料互证。</p></details>'+claimFeedback();
    host.innerHTML=card('第四现场 · 展签审稿','“会丰收”和“不会丰收”，哪句才是真相？',body,'<button class="primary" id="final-submit">提交展签，完成调查 →</button>');
    host.querySelectorAll('[data-claim]').forEach(button=>button.onclick=()=>{state.ratings[button.dataset.claim]=button.dataset.rating;state.finalAttempted=false;save();renderTransfer();host.querySelector('[data-claim="'+button.dataset.claim+'"][data-rating="'+button.dataset.rating+'"]')?.focus({preventScroll:true});});
    bindRovingRadios();
    const input=host.querySelector('#final-label'),unsure=host.querySelector('#final-unsure'),count=host.querySelector('#final-count');
    input.addEventListener('input',()=>{state.finalLabel=input.value.slice(0,90);state.finalAttempted=false;if(state.finalLabel.trim()){state.finalUnsure=false;unsure.checked=false;}count.textContent=charCount(state.finalLabel);save();});
    unsure.addEventListener('change',()=>{state.finalUnsure=unsure.checked;state.finalAttempted=false;save();});
    bindHelp(3);
    host.querySelector('#final-submit').onclick=()=>{
      if(!L.claims.every(claim=>state.ratings[claim.id])){message('请先给三句拟写展签都标出证据强度。');return;}
      if(!state.finalUnsure&&charCount(state.finalLabel)<30){message('请把展签写到30字以上，同时说明证据与边界；暂时说不清也可以勾选。');return;}
      const graded=L.gradeClaims(state.ratings);
      const label=state.finalLabel.trim();
      const answer=ratingsAnswer()+'；我的展签：'+(label||'暂时说不清')+(state.finalUnsure?'；表达状态：仍需帮助':'');
      const explanation=state.finalUnsure?'证据评级仍自动判定；展签表达仍需帮助'+(label?'，当前文字：'+label:'。'):label;
      log.submit(3,answer,graded.correct,explanation);state.finalAttempted=true;state.transferRevealed=true;save();
      if(!graded.correct){renderTransfer();message('上方指出了越过证据的句子，请修订证据评级后再提交；“暂时说不清”只用于展签文字。');return;}
      log.note(3,'迁移材料为小屯YH127坑R044852的正反“受年”命辞；页面未把命辞改写成实际丰歉结果。');
      log.finish(3,state.finalUnsure?'已完成审核，结论仍待帮助':'能区分命辞、结果与证据边界');render();focusCard();
    };
  }

  function renderComplete(){
    const initial=optionText(L.initialOptions,state.initialChoice);
    const uncertain=state.finalUnsure;
    const initialAssessment=L.gradeInitial(state.initialChoice)?'首答已经注意到多层记录。':'首答先抓住其中一层，后面用时间轴把它展开了。';
    const final='<div class="final-review"><b>现在能说到的范围</b><p>一条完整卜辞可能同时留下占问事项、兆纹判断和事后追记；但完整四层少见。YH127“受年”两句直接说明年成被列作占问事项；结合出土背景，可谨慎判断它与商王室记录有关，但不能单独证明当年实际丰歉。</p></div>';
    const status=uncertain?'<div class="oracle-boundary"><b>“暂时说不清”已经保存。</b><br>这不是错误完成；学习记录会保留首答、排序、提示和展签评级，方便之后继续分析。</div>':'';
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">调查完成 · 让结论停在证据以内</p><h2 tabindex="-1">甲骨不是自动播放真相的录音。</h2><div class="initial-review"><b>进入记录室时</b><p>'+esc(initial)+'</p><p>'+esc(initialAssessment)+'</p></div>'+final+status+'<div class="method-chain"><span>先找内容所指时间</span><span>分清占问与判断</span><span>再辨认事后追记</span><span>标出仍然缺失的证据</span></div><p class="parallel-takeaway"><b>“现存未见”不等于“从未发生”；一条例子也不能推出“预测总是准确”。</b>历史研究先问文字说的是事情的哪一步，再决定它能支持多强的结论。</p><div class="oracle-next"><b>下一案：</b>有了甲骨和青铜器，我们能看见商王室的生活；普通人的生活为什么更难被留下？ <a href="guandimiao.html">进入《没有名字的人，怎么走进历史？》 →</a></div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="oracle-restart" type="button">重新调查（保留旧记录）</button><a class="secondary" href="courses.html?group=school&subject=历史">返回历史课程</a></div></section>'+log.html();
    host.querySelector('#oracle-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,timelineVisited:['preface'],sortOrder:[...L.defaultOrder],ratings:{}};save();render();focusCard();};
  }
  function render(){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();return;}
    if(log.index===0)renderInitial();
    else if(log.index===1)renderTimeline();
    else if(log.index===2)renderSort();
    else renderTransfer();
    progress();
  }
  render();
})();
