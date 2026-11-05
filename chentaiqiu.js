(function(){
  'use strict';
  const L=ReadalongLesson,F=LearningFeedback,esc=F.esc,$=id=>document.getElementById(id);
  if(!F.courses.some(course=>course[0]===L.id))F.courses.unshift([L.id,L.title,'chentaiqiu.html']);
  if(F.readalongs&&!F.readalongs[L.id])F.readalongs[L.id]=1;
  const log=F.create(L.title,L.tasks),record=log.records[0];
  let state=L.sanitizeDraft(record.draft);
  const hasAttempt=prefix=>record.attempts.some(attempt=>attempt.answer.startsWith(prefix));
  state.$initialSaved=state.$initialSaved&&record.first?.answer.startsWith('初读判断：');
  state.timelineAttempted=state.timelineAttempted&&hasAttempt('时间线：');
  state.addressAttempted=state.addressAttempted&&hasAttempt('称谓：');
  state.claimAttempted=state.claimAttempted&&hasAttempt('“无礼”的证据：');
  state.transferAttempted=state.transferAttempted&&hasAttempt('迁移判断：');
  const annotationMap=new Map([...L.annotations,...L.transfer.annotations].map(item=>[item.id,item]));

  function save(draw=true){log.draft(0,state);if(draw)drawReport();}
  function drawReport(){
    $('reading-report').innerHTML=log.active?log.html():'<p class="empty-work">这里先空着。确认读到结尾、封存初读或动手验证后，阅读轨迹才会留在本机。</p>';
    const resume=$('resume-reading');
    if(log.active&&!record.done){resume.hidden=false;resume.textContent='继续这次共读 →';}
    else resume.hidden=true;
  }
  function feedback(id,text,stateName=''){
    const node=$(id);node.textContent=text;node.dataset.state=stateName;
  }
  function textFor(list,id){return list.find(item=>item.id===id)?.text||list.find(item=>item.id===id)?.label||id;}
  function composeSelection(list,ids){return ids.map(id=>textFor(list,id)).join('；');}
  function invalidateFrom(stage){
    const order=['timeline','address','claim','transfer'],start=order.indexOf(stage);
    if(start<0)return;
    order.slice(start).forEach(name=>{state[name+'Attempted']=false;});
  }
  function allStagesPassed(){
    return state.timelineAttempted&&L.gradeTimeline(state.timelineOrder).correct
      &&state.addressAttempted&&L.gradeAddresses(state.addressAnswers).correct
      &&state.claimAttempted&&L.gradeClaim(state.claimEvidence).correct
      &&state.transferAttempted&&L.gradeTransfer({choice:state.transferChoice,evidence:state.transferEvidence}).correct;
  }

  function renderAnnotated(text,annotations){
    const located=annotations.map(item=>({...item,at:text.indexOf(item.text)})).filter(item=>item.at>=0).sort((a,b)=>a.at-b.at);
    let html='',cursor=0;
    for(const item of located){
      if(item.at<cursor)continue;
      html+=esc(text.slice(cursor,item.at))+`<button type="button" class="annotated-word" data-annotation="${esc(item.id)}" aria-haspopup="dialog" aria-expanded="false" aria-controls="reading-annotation">${esc(item.text)}</button>`;
      cursor=item.at+item.text.length;
    }
    return html+esc(text.slice(cursor));
  }
  $('article-text').innerHTML='<p>'+renderAnnotated(L.text,L.annotations)+'</p>';
  $('transfer-heading').textContent=L.transfer.title;
  $('transfer-text').innerHTML=renderAnnotated(L.transfer.text,L.transfer.annotations);
  $('word-list').innerHTML=L.annotations.map(item=>`<div><dt>${esc(item.text)}<small>${esc(item.kind)}</small></dt><dd>${esc(item.note)}</dd></div>`).join('');

  const annotationBox=$('reading-annotation');let annotationButton=null,annotationOpenedAt=0;
  function closeAnnotation(restoreFocus=false){
    const previous=annotationButton;annotationBox.hidden=true;
    if(previous)previous.setAttribute('aria-expanded','false');annotationButton=null;
    if(restoreFocus&&previous)previous.focus({preventScroll:true});
  }
  function placeAnnotation(){
    if(!annotationButton)return;
    const rect=annotationButton.getBoundingClientRect(),viewport=window.visualViewport,left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
    annotationBox.style.maxWidth=(width-24)+'px';annotationBox.style.maxHeight=(height-24)+'px';
    const boxWidth=annotationBox.offsetWidth,boxHeight=annotationBox.offsetHeight;
    annotationBox.style.left=Math.max(left+12,Math.min(rect.left,left+width-boxWidth-12))+'px';
    annotationBox.style.top=Math.max(top+12,Math.min(rect.bottom+8+boxHeight<=top+height-12?rect.bottom+8:rect.top-boxHeight-8,top+height-boxHeight-12))+'px';
  }
  document.querySelectorAll('[data-annotation]').forEach(button=>button.addEventListener('click',()=>{
    if(annotationButton===button){closeAnnotation(true);return;}
    closeAnnotation();annotationButton=button;annotationOpenedAt=performance.now();
    const item=annotationMap.get(button.dataset.annotation);if(!item)return;
    $('annotation-kind').textContent=item.kind;$('annotation-kind').dataset.kind=item.kind;
    $('annotation-title').textContent=item.text;$('annotation-text').textContent=item.note;
    annotationBox.hidden=false;button.setAttribute('aria-expanded','true');placeAnnotation();annotationBox.focus({preventScroll:true});
    if(!state.$seenAnnotations.includes(item.id)){
      state.$seenAnnotations=[...state.$seenAnnotations,item.id];save(false);
      log.note(0,'点读词句：'+item.text+'（'+item.kind+'；阅读支持不等于作答求助）。');drawReport();
    }
  }));
  $('close-annotation').addEventListener('click',()=>closeAnnotation(true));
  document.addEventListener('pointerdown',event=>{if(annotationButton&&!annotationBox.contains(event.target)&&!event.target.closest?.('[data-annotation]'))closeAnnotation();});
  document.addEventListener('keydown',event=>{if(annotationButton&&event.key==='Escape'){event.preventDefault();closeAnnotation(true);}});
  document.addEventListener('focusin',event=>{if(annotationButton&&!annotationBox.contains(event.target)&&event.target!==annotationButton)closeAnnotation();});
  const closeForViewport=()=>closeAnnotation(annotationBox.contains(document.activeElement));
  const closeAfterScroll=()=>{if(annotationButton&&performance.now()-annotationOpenedAt>250)closeForViewport();};
  window.addEventListener('scroll',closeAfterScroll,{passive:true});window.addEventListener('resize',closeForViewport);
  window.visualViewport?.addEventListener('resize',closeForViewport);window.visualViewport?.addEventListener('scroll',closeAfterScroll);

  function radioButtons(container,items,selected,onSelect,disabled=false){
    container.innerHTML=items.map((item,index)=>`<button type="button" role="radio" aria-checked="${String(item.id===selected)}" tabindex="${item.id===selected||(!selected&&index===0)?'0':'-1'}" data-choice="${esc(item.id)}" ${disabled?'disabled':''}>${esc(item.label||item.text)}</button>`).join('');
    const buttons=[...container.querySelectorAll('[data-choice]')];
    buttons.forEach((button,index)=>{
      button.addEventListener('click',()=>{buttons.forEach(item=>{const active=item===button;item.setAttribute('aria-checked',String(active));item.tabIndex=active?0:-1;});onSelect(button.dataset.choice);button.focus({preventScroll:true});});
      button.addEventListener('keydown',event=>{
        if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key))return;
        event.preventDefault();const step=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;
        buttons[(index+step+buttons.length)%buttons.length].click();
      });
    });
  }
  function singleChips(container,items,selected,onSelect,disabled=false){
    container.innerHTML=items.map((item,index)=>`<button type="button" role="radio" aria-checked="${String(item.id===selected)}" tabindex="${item.id===selected||(!selected&&index===0)?'0':'-1'}" data-chip="${esc(item.id)}" ${disabled?'disabled':''}>${esc(item.text)}</button>`).join('');
    const buttons=[...container.querySelectorAll('[data-chip]')];
    buttons.forEach((button,index)=>{
      button.addEventListener('click',()=>{buttons.forEach(item=>{const active=item===button;item.setAttribute('aria-checked',String(active));item.tabIndex=active?0:-1;});onSelect(button.dataset.chip);button.focus({preventScroll:true});});
      button.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key))return;event.preventDefault();const step=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;buttons[(index+step+buttons.length)%buttons.length].click();});
    });
  }
  function multiChips(container,items,selected,onChange,disabled=false){
    container.innerHTML=items.map(item=>`<button type="button" role="checkbox" aria-checked="${String(selected.includes(item.id))}" data-chip="${esc(item.id)}" ${disabled?'disabled':''}>${esc(item.text)}</button>`).join('');
    const buttons=[...container.querySelectorAll('[data-chip]')];
    buttons.forEach(button=>button.addEventListener('click',()=>{const active=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(active));onChange(buttons.filter(item=>item.getAttribute('aria-checked')==='true').map(item=>item.dataset.chip));button.focus({preventScroll:true});}));
  }

  function renderReadState(){
    $('mark-read').textContent=state.$readConfirmed?'已确认读到结尾':'我读到结尾了';
    $('read-status').textContent=state.$readConfirmed?'已由你确认；这只记录阅读位置，不代表已经读懂。':'是否读完由你确认。';
  }
  $('mark-read').addEventListener('click',()=>{
    if(!state.$readConfirmed){state.$readConfirmed=true;save(false);log.note(0,'孩子自行确认读到全文结尾；页面未把滚动当作完成证明。');drawReport();}
    renderReadState();$('first-look').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });

  function renderInitial(){
    radioButtons($('initial-choices'),L.initialChoices,state.initialChoice,value=>{state.initialChoice=value;save(false);},state.$initialSaved);
    singleChips($('initial-evidence'),L.endingEvidence,state.initialEvidence,value=>{state.initialEvidence=value;save(false);},state.$initialSaved);
    $('save-initial').disabled=state.$initialSaved;$('save-initial').textContent=state.$initialSaved?'初读已经封存':'封存初读，不被后面答案覆盖';
    feedback('initial-status',state.$initialSaved?'第一次判断已保留。最后可以坚持，也可以用新证据修订。':'');
  }
  $('save-initial').addEventListener('click',()=>{
    if(!state.$readConfirmed){feedback('initial-status','请先读到全文结尾并由自己确认；页面不会替你猜。','retry');return;}
    if(!state.initialChoice||!state.initialEvidence){feedback('initial-status','先选一个最接近的判断，再点一处结尾证据。','retry');return;}
    if(!record.first)log.submit(0,'初读判断：'+textFor(L.initialChoices,state.initialChoice),null,'我先注意到：'+textFor(L.endingEvidence,state.initialEvidence));
    state.$initialSaved=true;save(false);log.note(0,'初读判断在讲解前封存，不自动判对错。');drawReport();renderInitial();
  });

  const poolOrder=['late','promise','arrive','leave'];
  function renderTimeline(focusId=''){
    const frozen=record.done;
    $('timeline-pool').innerHTML=poolOrder.map(id=>`<button type="button" data-event="${id}" data-focus="pool-${id}" ${state.timelineOrder.includes(id)||frozen?'disabled':''}>${esc(textFor(L.timeline,id))}</button>`).join('');
    $('timeline-order').innerHTML=state.timelineOrder.map(id=>`<li><button type="button" data-remove="${id}" data-focus="selected-${id}" aria-label="撤回 ${esc(textFor(L.timeline,id))}" ${frozen?'disabled':''}>${esc(textFor(L.timeline,id))}</button></li>`).join('');
    $('timeline-pool').querySelectorAll('[data-event]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.event;state.timelineOrder=[...state.timelineOrder,id];invalidateFrom('timeline');save(false);renderTimeline('selected-'+id);renderAddresses();renderClaim();renderTransfer();renderFinal();}));
    $('timeline-order').querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.remove;state.timelineOrder=state.timelineOrder.filter(item=>item!==id);invalidateFrom('timeline');save(false);renderTimeline('pool-'+id);renderAddresses();renderClaim();renderTransfer();renderFinal();}));
    $('timeline-reset').disabled=frozen;$('timeline-check').disabled=frozen;
    if(!state.timelineAttempted)feedback('timeline-feedback','');
    else if(L.gradeTimeline(state.timelineOrder).correct)feedback('timeline-feedback','顺序成立：约在正午 → 过午未到 → 陈太丘离开 → 友人才到。','ok');
    else feedback('timeline-feedback','还没接稳。先只盯住“日中—过中—舍去—乃至”四个时间和动作词。','retry');
    if(focusId)document.querySelector(`[data-focus="${focusId}"]`)?.focus({preventScroll:true});
  }
  $('timeline-reset').addEventListener('click',()=>{state.timelineOrder=[];invalidateFrom('timeline');save(false);renderTimeline();renderAddresses();renderClaim();renderTransfer();renderFinal();});
  $('timeline-check').addEventListener('click',()=>{
    if(!state.$initialSaved){feedback('timeline-feedback','先封存自己的初读，再看时间线。','retry');return;}
    if(state.timelineOrder.length!==L.timeline.length){feedback('timeline-feedback','四个事件都排进去，再检查。','retry');return;}
    const result=L.gradeTimeline(state.timelineOrder);log.submit(0,'时间线：'+composeSelection(L.timeline,state.timelineOrder),result.correct,'按日中、过中、舍去、乃至判断先后');state.timelineAttempted=true;save(false);
    if(!result.correct)log.help(0,'自动反馈：用四个时间与动作词重排');else log.note(0,'时间线已按原文顺序重建。');drawReport();renderTimeline();
  });

  function renderAddresses(){
    $('address-map').innerHTML=L.addressTerms.map(item=>`<label class="chen-address-row"><b>${esc(item.term)}</b><select data-address="${item.id}"><option value="">先判断说话位置</option>${L.addressOptions.map(option=>`<option value="${option.id}" ${state.addressAnswers[item.id]===option.id?'selected':''}>${esc(option.text)}</option>`).join('')}</select></label>`).join('');
    $('address-map').querySelectorAll('[data-address]').forEach(select=>{select.disabled=record.done;select.addEventListener('change',()=>{state.addressAnswers={...state.addressAnswers,[select.dataset.address]:select.value};invalidateFrom('address');save(false);feedback('address-feedback','');renderClaim();renderTransfer();renderFinal();});});
    $('address-check').disabled=record.done;
    if(!state.addressAttempted)feedback('address-feedback','');
    else if(L.gradeAddresses(state.addressAnswers).correct)feedback('address-feedback','称谓站稳了：尊君＝您的父亲，家君＝我的父亲，君＝您／你。','ok');
    else feedback('address-feedback','再换到说话者的位置：“家”是谦称自己的，“尊”是尊称对方的。','retry');
  }
  $('address-check').addEventListener('click',()=>{
    if(!state.timelineAttempted||!L.gradeTimeline(state.timelineOrder).correct){feedback('address-feedback','先提交并接稳时间线，再换到人物的说话位置。','retry');return;}
    if(L.addressTerms.some(item=>!state.addressAnswers[item.id])){feedback('address-feedback','三个称谓都选好，再一起检查。','retry');return;}
    const result=L.gradeAddresses(state.addressAnswers);log.submit(0,'称谓：'+L.addressTerms.map(item=>item.term+'＝'+textFor(L.addressOptions,state.addressAnswers[item.id])).join('；'),result.correct,'称谓随说话者与听话者的位置变化');state.addressAttempted=true;save(false);
    if(!result.correct)log.help(0,'自动反馈：从“自己的父亲／对方的父亲”重看称谓');else log.note(0,'已把尊君、家君、君放回各自说话位置。');drawReport();renderAddresses();
  });

  function renderClaim(){
    multiChips($('claim-evidence'),L.claimEvidence,state.claimEvidence,value=>{state.claimEvidence=value;invalidateFrom('claim');save(false);feedback('claim-feedback','');renderTransfer();renderFinal();},record.done);
    $('claim-check').disabled=record.done;
    if(!state.claimAttempted)feedback('claim-feedback','');
    else if(L.gradeClaim(state.claimEvidence).correct)feedback('claim-feedback','证据对上了：“对子骂父”直接连到“则是无礼”。“日中不至”属于另一条无信证据。','ok');
    else feedback('claim-feedback','“无礼”和“无信”是两条并列理由。只选直接连到“无礼”的那一处。','retry');
  }
  $('claim-check').addEventListener('click',()=>{
    if(!state.addressAttempted||!L.gradeAddresses(state.addressAnswers).correct){feedback('claim-feedback','先提交并说清称谓，才知道是谁“对子骂父”。','retry');return;}
    if(!state.claimEvidence.length){feedback('claim-feedback','先选一处你认为能直接支撑“无礼”的原文。','retry');return;}
    const result=L.gradeClaim(state.claimEvidence);log.submit(0,'“无礼”的证据：'+composeSelection(L.claimEvidence,state.claimEvidence),result.correct,'事实与判断一一对应');state.claimAttempted=true;save(false);
    if(!result.correct)log.help(0,'自动反馈：分开“无信”和“无礼”两条理由');else log.note(0,'已独立把“对子骂父”连到“则是无礼”。');drawReport();renderClaim();
  });

  function renderTransfer(){
    radioButtons($('transfer-choices'),L.transfer.choices,state.transferChoice,value=>{state.transferChoice=value;invalidateFrom('transfer');save(false);feedback('transfer-feedback',state.$transferFirst?'已保留第一次迁移判断；可以修订后再提交。':'');renderFinal();},record.done);
    multiChips($('transfer-evidence'),L.transfer.evidence,state.transferEvidence,value=>{state.transferEvidence=value;invalidateFrom('transfer');save(false);feedback('transfer-feedback',state.$transferFirst?'已保留第一次迁移判断；可以修订后再提交。':'');renderFinal();},record.done);
    $('transfer-hints').innerHTML=state.transferHintLevel?'<ol>'+L.transfer.hints.slice(0,state.transferHintLevel).map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>':'<p>还没有打开提示。前面的“事实 → 判断”示例现在撤掉了。</p>';
    $('transfer-hint').disabled=record.done||state.transferHintLevel>=L.transfer.hints.length;$('transfer-check').disabled=record.done;
    if(!state.transferAttempted)feedback('transfer-feedback',state.$transferFirst?'已保留第一次迁移判断；可以修订后再提交。':'');
    else{
      const result=L.gradeTransfer({choice:state.transferChoice,evidence:state.transferEvidence});
      if(result.correct)feedback('transfer-feedback','前后都照顾到了：王朗先答应后想弃人；华歆起初拒绝，但接受请托后坚持相救。','ok');
      else if(!result.choice&&!result.evidence)feedback('transfer-feedback','判断和证据都要再看。别只看两人的第一句话，还要看危急时各自怎样行动。','retry');
      else if(!result.choice)feedback('transfer-feedback','两处行动证据已经找到，但结论还没有把“开头”和“后来”合在一起。','retry');
      else feedback('transfer-feedback','判断方向成立；再选出危急时两个人相反行动的两处原文。','retry');
    }
  }
  $('transfer-hint').addEventListener('click',()=>{
    if(state.transferHintLevel>=L.transfer.hints.length)return;
    state.transferHintLevel+=1;log.help(0,'迁移提示'+state.transferHintLevel+'：'+L.transfer.hints[state.transferHintLevel-1]);save(false);drawReport();renderTransfer();
  });
  $('transfer-check').addEventListener('click',()=>{
    if(!state.claimAttempted||!L.gradeClaim(state.claimEvidence).correct){feedback('transfer-feedback','先提交并完成元方“事实 → 判断”的独立取证，再换新篇。','retry');return;}
    if(!state.transferChoice||!state.transferEvidence.length){feedback('transfer-feedback','先选一个判断，再选择支撑它的原文。','retry');return;}
    const snapshot={choice:state.transferChoice,evidence:[...state.transferEvidence],hintLevel:state.transferHintLevel},result=L.gradeTransfer(snapshot);
    if(!state.$transferFirst)state.$transferFirst=snapshot;state.$transferLast=snapshot;
    log.submit(0,'迁移判断：'+textFor(L.transfer.choices,state.transferChoice),result.correct,'证据：'+composeSelection(L.transfer.evidence,state.transferEvidence));state.transferAttempted=true;save(false);
    if(!result.correct)log.help(0,'自动反馈：同时比较开头承诺与危急时行动');else log.note(0,'迁移中已同时使用王朗欲弃人与华歆坚持相救两处证据。');drawReport();renderTransfer();renderFinal();
  });

  function renderFinal(){
    const locked=!allStagesPassed();
    radioButtons($('final-choices'),L.initialChoices,state.finalChoice,value=>{state.finalChoice=value;save(false);},locked||record.done);
    multiChips($('final-evidence'),L.endingEvidence,state.finalEvidence,value=>{state.finalEvidence=value;save(false);},locked||record.done);
    $('kept-quote').value=state.quote;$('reading-note').value=state.note;$('kept-quote').readOnly=record.done;$('reading-note').readOnly=record.done;
    $('finish-reading').textContent=record.done?'继续修改这次共读':'收好这次共读';
    $('finish-reading').disabled=locked&&!record.done;
    feedback('finish-status',locked&&!record.done?'先把时间线、称谓、取证与新篇迁移都提交通过，再回到结尾。':record.done?'这次已收好；完成只表示过程已留存，不代表长期掌握。':'');
  }
  let noteTimer=0;
  for(const [id,key,max] of [['kept-quote','quote',400],['reading-note','note',800]]){
    const input=$(id);input.addEventListener('input',event=>{state[key]=event.target.value.slice(0,max);window.clearTimeout(noteTimer);noteTimer=window.setTimeout(()=>save(false),180);});
    input.addEventListener('change',()=>{window.clearTimeout(noteTimer);state[key]=input.value.slice(0,max);save(false);});
  }
  function flushNote(){window.clearTimeout(noteTimer);state.quote=$('kept-quote').value.slice(0,400);state.note=$('reading-note').value.slice(0,800);log.draft(0,state);}
  window.addEventListener('pagehide',flushNote);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushNote();});
  $('finish-reading').addEventListener('click',()=>{
    if(record.done){log.reopen(0);drawReport();renderTimeline();renderAddresses();renderClaim();renderTransfer();renderFinal();return;}
    if(!allStagesPassed()){feedback('finish-status','先把时间线、称谓、取证与新篇迁移都重新提交通过，再回到结尾。','retry');return;}
    if(!state.finalChoice||!state.finalEvidence.length){feedback('finish-status','选一个现在的判断，并保留至少一处结尾证据。','retry');return;}
    window.clearTimeout(noteTimer);save(false);
    log.submit(0,'回看判断：'+textFor(L.initialChoices,state.finalChoice),null,'结尾证据：'+composeSelection(L.endingEvidence,state.finalEvidence));
    log.finish(0,'已完成一次有证据的共读回看；不等于长期掌握');drawReport();renderTimeline();renderAddresses();renderClaim();renderTransfer();renderFinal();
  });

  renderReadState();renderInitial();renderTimeline();renderAddresses();renderClaim();renderTransfer();renderFinal();drawReport();
})();
