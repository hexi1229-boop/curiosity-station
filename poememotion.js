'use strict';
(function(){
  const host=document.querySelector('#poememotion-task');
  const sources=document.querySelector('#poememotion-sources');
  const L=window.PoemEmotionLesson,F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'poememotion.html']);
  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  function loadState(){
    const next=L.sanitizeState(log.checkpoint.poememotion||{});
    next.coldSaved=next.coldSaved&&!!log.records[0]?.first;
    next.guidedDone=next.guidedDone&&!!log.records[0]?.done;
    next.whatIfAttempted=next.whatIfAttempted&&!!log.records[1]?.first;
    next.transferAttempted=next.transferAttempted&&!!log.records[2]?.first;
    next.reviewAttempted=next.reviewAttempted&&next.transferAttempted;
    return next;
  }
  let state=loadState();
  const annotationMap=new Map([...L.main.annotations,...L.transfer.annotations].map(item=>[item.id,item]));
  const annotationBox=document.querySelector('#poem-annotation');
  let annotationButton=null,annotationOpenedAt=0;
  function save(){log.point({poememotion:state});}
  function closeAnnotation(restoreFocus=false){
    const previous=annotationButton;
    if(annotationBox)annotationBox.hidden=true;
    if(previous)previous.setAttribute('aria-expanded','false');
    annotationButton=null;
    if(restoreFocus&&previous)previous.focus({preventScroll:true});
  }
  function placeAnnotation(){
    if(!annotationButton||!annotationBox)return;
    const rect=annotationButton.getBoundingClientRect(),viewport=window.visualViewport;
    const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
    annotationBox.style.maxWidth=(width-24)+'px';annotationBox.style.maxHeight=(height-24)+'px';
    const boxWidth=annotationBox.offsetWidth,boxHeight=annotationBox.offsetHeight;
    annotationBox.style.left=Math.max(left+12,Math.min(rect.left,left+width-boxWidth-12))+'px';
    annotationBox.style.top=Math.max(top+12,Math.min(rect.bottom+8+boxHeight<=top+height-12?rect.bottom+8:rect.top-boxHeight-8,top+height-boxHeight-12))+'px';
  }
  function bindAnnotations(index){
    host.querySelectorAll('[data-annotation]').forEach(button=>button.addEventListener('click',()=>{
      if(annotationButton===button){closeAnnotation(true);return;}
      closeAnnotation();annotationButton=button;annotationOpenedAt=performance.now();
      const item=annotationMap.get(button.dataset.annotation);if(!item||!annotationBox)return;
      document.querySelector('#poem-annotation-kind').textContent=item.kind;
      document.querySelector('#poem-annotation-title').textContent=item.text;
      document.querySelector('#poem-annotation-text').textContent=item.note;
      annotationBox.hidden=false;button.setAttribute('aria-expanded','true');placeAnnotation();annotationBox.focus({preventScroll:true});
      const useKey=index+':'+item.id;
      if(!state.annotationUses.includes(useKey)){
        state.annotationUses=[...state.annotationUses,useKey];
        if(!state.annotationViews.includes(item.id))state.annotationViews=[...state.annotationViews,item.id];
        log.help(index,'点读词句：'+item.text+'（'+item.kind+'）');
        save();
      }
    }));
  }
  document.querySelector('#poem-annotation-close')?.addEventListener('click',()=>closeAnnotation(true));
  document.addEventListener('pointerdown',event=>{if(annotationButton&&!annotationBox?.contains(event.target)&&!event.target.closest?.('[data-annotation]'))closeAnnotation();});
  document.addEventListener('keydown',event=>{if(annotationButton&&event.key==='Escape'){event.preventDefault();closeAnnotation(true);}});
  document.addEventListener('focusin',event=>{if(annotationButton&&!annotationBox?.contains(event.target)&&event.target!==annotationButton)closeAnnotation();});
  const closeForViewport=()=>closeAnnotation(annotationBox?.contains(document.activeElement));
  const closeAfterScroll=()=>{if(annotationButton&&performance.now()-annotationOpenedAt>250)closeForViewport();};
  window.addEventListener('scroll',closeAfterScroll,{passive:true});window.addEventListener('resize',closeForViewport);
  window.visualViewport?.addEventListener('resize',closeForViewport);window.visualViewport?.addEventListener('scroll',closeAfterScroll);

  function progress(){
    document.querySelectorAll('.poem-nav li').forEach((item,index)=>{
      item.classList.toggle('current',index===log.index);item.classList.toggle('done',index<log.index);
      item.setAttribute('aria-label',item.textContent.trim()+'；'+(index<log.index?'已完成':index===log.index?'当前环节':'待完成'));
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){requestAnimationFrame(()=>host.querySelector('h2')?.focus());}
  function message(value,error=false){const node=host.querySelector('.poem-message');if(node){node.textContent=value;node.dataset.error=String(error);}}
  function feedback(value,stateName=''){const node=host.querySelector('.poem-feedback');if(node){node.textContent=value;node.dataset.state=stateName;}}
  function base(kicker,title,body,actions=''){
    return '<section class="persuade-card poem-card"><p class="persuade-label">'+esc(kicker)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<div class="poem-feedback" role="status" aria-live="polite"></div><div class="poem-message" role="status" aria-live="polite"></div>'+actions+'</section>';
  }
  function annotatedText(text,annotations){
    const located=annotations.map(item=>({...item,at:text.indexOf(item.text)})).filter(item=>item.at>=0).sort((a,b)=>a.at-b.at);
    let html='',cursor=0;
    for(const item of located){
      if(item.at<cursor)continue;
      html+=esc(text.slice(cursor,item.at))+'<button type="button" class="annotated-word" data-annotation="'+esc(item.id)+'" aria-haspopup="dialog" aria-expanded="false" aria-controls="poem-annotation">'+esc(item.text)+'</button>';
      cursor=item.at+item.text.length;
    }
    return html+esc(text.slice(cursor));
  }
  function poemPaper(poem,{annotated=false,hideTail=false}={}){
    const notes=annotated?(poem.annotations||[]):[];
    const title=annotated?annotatedText(poem.title,notes):esc(poem.title);
    const lines=poem.lines.map((line,index)=>{
      const tail=index===poem.lines.length-1;
      if(tail&&hideTail)return '<span class="poem-tail" hidden aria-hidden="true">'+(annotated?annotatedText(line,notes):esc(line))+'</span><span class="poem-tail-placeholder">（尾句暂时遮住）</span>';
      return '<span class="'+(tail?'poem-tail':'')+'">'+(annotated?annotatedText(line,notes):esc(line))+'</span>';
    }).join('');
    return '<article class="poem-paper" data-tail="'+(hideTail?'hidden':'shown')+'"><h3>'+title+'</h3><p class="poem-author">'+esc(poem.author)+'</p><p class="poem-lines">'+lines+'</p></article>';
  }
  function options(items,current,attribute,label){
    return '<div class="poem-options" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" data-'+attribute+'="'+esc(item.id)+'" aria-pressed="'+String(current===item.id)+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function bindOptions(attribute,key,onChange=()=>{}){
    host.querySelectorAll('[data-'+attribute+']').forEach(button=>button.addEventListener('click',()=>{
      state[key]=button.getAttribute('data-'+attribute)||'';
      host.querySelectorAll('[data-'+attribute+']').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      save();onChange();
    }));
  }
  function evidence(items,selected,attribute,label){
    return '<div class="poem-evidence" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" class="evidence-chip" data-'+attribute+'="'+esc(item.id)+'" aria-pressed="'+String(selected.includes(item.id))+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function bindEvidence(attribute,key,max=2){
    host.querySelectorAll('[data-'+attribute+']').forEach(button=>button.addEventListener('click',()=>{
      const id=button.getAttribute('data-'+attribute)||'',active=state[key].includes(id);
      if(!active&&state[key].length>=max){message('这里最多选 '+max+' 处。先留下最能支撑整首判断的证据。',true);return;}
      state[key]=active?state[key].filter(item=>item!==id):[...state[key],id];
      button.setAttribute('aria-pressed',String(!active));save();
    }));
  }
  function bindText(id,key){
    const node=host.querySelector('#'+id);if(!node)return;
    const update=()=>{state[key]=node.value;save();};node.addEventListener('input',update);node.addEventListener('change',update);
  }
  function labelFor(items,id){return items.find(item=>item.id===id)?.text||id;}
  function evidenceText(items,ids){return ids.map(id=>labelFor(items,id)).join(' / ');}

  function renderCold(){
    const body='<p class="poem-lead">先把整首读完。此时没有点读注释，也不公布“标准心情”；你可以选择“不确定”，但要留下眼下真正看到的证据。</p>'+poemPaper(L.main)+
      '<h3>整首曲给你的整体感受更接近哪一种？</h3>'+options(L.toneOptions,state.coldTone,'cold-tone','整体感受')+
      '<h3>选两处最能支撑这个判断的原文</h3>'+evidence(L.main.evidence,state.coldEvidence,'cold-evidence','初读证据')+
      '<label class="poem-field"><b>这两处为什么能一起支持你的判断？</b><textarea id="cold-explanation" rows="4" maxlength="900" placeholder="不要只抄诗句，说清它们之间或它们与人物处境的关系。">'+esc(state.coldExplanation)+'</textarea></label>';
    host.innerHTML=base('现场一 · 完整冷读','先封存第一判断，再学会检查它',body,'<button class="primary" id="cold-submit">封存第一次阅读 →</button>');
    bindOptions('cold-tone','coldTone');bindEvidence('cold-evidence','coldEvidence');bindText('cold-explanation','coldExplanation');
    host.querySelector('#cold-submit').addEventListener('click',()=>{
      if(!state.coldTone){message('先选一个最接近的整体感受；暂时不确定也可以如实选择。',true);return;}
      if(state.coldEvidence.length!==2){message('请从完整原文中留下两处证据。',true);return;}
      if(!L.meaningful(state.coldExplanation)){message('请用一句话说明两处证据怎样一起支持判断。',true);return;}
      log.submit(0,'初读：'+labelFor(L.toneOptions,state.coldTone)+'；证据：'+evidenceText(L.main.evidence,state.coldEvidence),null,state.coldExplanation);
      log.note(0,'首答前未显示词句注释、关系示例或情感答案；开放判断未自动判分。');
      state.coldSaved=true;save();render(true);
    });
  }
  function sceneLab(){
    const hidden=state.lensMode==='hidden';
    const scenes=L.main.evidence.map(item=>{
      const covered=hidden&&item.group==='speaker';
      return '<div class="scene-card" data-group="'+esc(item.group)+'"'+(covered?' hidden aria-hidden="true"':'')+'><b>'+esc(item.text)+'</b><small>'+esc(item.role)+'</small></div>';
    }).join('')+(hidden?'<div class="scene-card scene-card-covered" aria-label="尾句已遮住"><b>尾句已遮住</b><small>先只看前四句</small></div>':'');
    return '<section class="scene-lab" data-lens="'+esc(state.lensMode)+'" aria-label="景物与人物关系实验"><div class="scene-strip">'+scenes+'</div><div class="scene-bridge"'+(hidden?' hidden aria-hidden="true"':'')+'>人家 ↔ 天涯中的旅人</div><div class="lens-controls" role="group" aria-label="尾句透镜"><button type="button" data-lens="hidden" aria-pressed="'+String(hidden)+'">遮住尾句</button><button type="button" data-lens="restored" aria-pressed="'+String(!hidden)+'">恢复尾句</button></div><p class="lens-status" role="status">'+(hidden?'只剩景物时，可以感到气氛；但人物是谁、为何悲伤，还没有被直接说出。':'尾句交代“谁、在哪里、感受怎样”，也让“人家”和“天涯”产生可讨论的对照。')+'</p></section>';
  }
  function renderGuided(){
    const first=log.records[0].first;
    const grade=L.gradeGuided(state);
    const body='<p class="poem-lead">第一次判断已经保留。现在才开放点读注释，并把最后一句当作一副“透镜”：亲手遮住、恢复，看它改变了哪些能确定的关系。</p><div class="cold-capture"><b>第一次选择</b><p>'+esc(first?.answer||'')+'</p><b>第一次解释</b><p>'+esc(first?.explanation||'')+'</p></div>'+poemPaper(L.main,{annotated:true})+sceneLab()+
      '<h3>哪一种关系经得起整首曲的检查？</h3>'+options(L.relationOptions,state.relationChoice,'relation','景物与人物关系')+
      '<label class="poem-field"><b>你坚持还是修改第一次判断？为什么？</b><textarea id="guided-explanation" rows="4" maxlength="900" placeholder="例如：我保留／修改……，因为……和……放在一起……">'+esc(state.guidedExplanation)+'</textarea></label>';
    host.innerHTML=base('首答已封存 · 点读与关系实验','景物不单独“发情绪”，整首关系才让结论站稳',body,'<button class="primary" id="guided-submit">检查证据链 →</button>');
    bindAnnotations(0);bindOptions('relation','relationChoice');bindText('guided-explanation','guidedExplanation');
    host.querySelectorAll('[data-lens]').forEach(button=>button.addEventListener('click',()=>{
      const mode=button.dataset.lens;state.lensMode=mode;
      if(!state.lensViews.includes(mode))state.lensViews=[...state.lensViews,mode];
      save();render(false);requestAnimationFrame(()=>host.querySelector('[data-lens="'+mode+'"]')?.focus());
    }));
    host.querySelector('#guided-submit').addEventListener('click',()=>{
      if(!state.relationChoice){message('先选择一条你认为能经得起整首检查的关系。',true);return;}
      if(!L.meaningful(state.guidedExplanation)){message('请说明你为何坚持或修改，不能只写一个情感词。',true);return;}
      const result=L.gradeGuided(state);
      log.submit(0,'复核：'+labelFor(L.relationOptions,state.relationChoice),null,state.guidedExplanation);
      state.guidedAttempted=true;
      if(!result.views||!result.relation){
        log.help(0,'自动反馈：比较“人家”与“天涯旅人”，并实际遮住、恢复尾句');save();render(true);return;
      }
      state.guidedDone=true;
      log.note(0,'已实际比较有／无尾句，并把景物关系连到人物处境；开放解释未自动判分。');
      log.finish(0,(log.records[0].helps.length?'使用过点读或反馈；':'未使用点读或反馈；')+'本次证据链已接通');save();render(true);
    });
    if(state.guidedAttempted){
      if(grade.views&&grade.relation)feedback('关系已接通：不是“人家＝悲伤”，而是它和天涯旅人的处境共同生成了对照。','ok');
      else feedback(!grade.views?'请真的切换“遮住尾句／恢复尾句”各一次，再比较能确定的信息。':'再检查：哪个说法没有把单个景物做成固定情绪密码？','retry');
    }
  }

  function renderWhatIf(){
    const result=L.gradeWhatIf(state);
    const body='<p class="poem-lead">这次不再给关系示例。尾句真的被遮住了：只用剩下的四行，判断我们能确定到哪一步。</p>'+poemPaper(L.main,{annotated:true,hideTail:true})+
      '<h3>还能确定“一个远离家乡的旅人正在悲伤”吗？</h3>'+options(L.whatIfOptions,state.whatIfChoice,'whatif','遮句判断')+
      '<h3>哪条理由最能限定结论范围？</h3>'+options(L.whatIfReasons,state.whatIfReason,'whatif-reason','结论边界理由')+
      '<label class="poem-field"><b>用自己的话解释：景物线索和人物结论有什么差别？</b><textarea id="whatif-explanation" rows="4" maxlength="900">'+esc(state.whatIfExplanation)+'</textarea></label>'+
      (state.whatIfAttempted?'<details class="poem-help" data-help="遮句实验提示"><summary>需要时再看：哪里写出了“人”？</summary><p>前四行能让你感到日暮、秋风、旅途或安稳人家；但请逐字找一找，它们有没有直接交代“谁在天涯”。</p></details>':'');
    host.innerHTML=base('现场二 · 撤掉示例','有情绪倾向，不等于每一步都能确定',body,'<button class="primary" id="whatif-submit">提交边界判断 →</button>');
    bindAnnotations(1);bindOptions('whatif','whatIfChoice');bindOptions('whatif-reason','whatIfReason');bindText('whatif-explanation','whatIfExplanation');F.watchHelp(host,log,1);
    host.querySelector('#whatif-submit').addEventListener('click',()=>{
      if(!state.whatIfChoice||!state.whatIfReason){message('先完成判断，并选出限定结论范围的理由。',true);return;}
      if(!L.meaningful(state.whatIfExplanation)){message('请解释景物倾向和人物结论的差别。',true);return;}
      const grade=L.gradeWhatIf(state),correct=Object.values(grade).every(Boolean);
      log.submit(1,'遮住尾句：'+labelFor(L.whatIfOptions,state.whatIfChoice)+'；理由：'+labelFor(L.whatIfReasons,state.whatIfReason),correct,state.whatIfExplanation);
      state.whatIfAttempted=true;
      if(!correct){log.help(1,'自动反馈：区分“可以感到”与“原文直接说明”');save();render(true);return;}
      log.note(1,'已区分景物形成的情绪倾向与原文直接交代的人物处境。');log.finish(1,'边界判断成立；开放解释只留存，不自动评价质量');save();render(true);
    });
    if(state.whatIfAttempted){
      if(result.boundary&&result.reason)feedback('边界清楚：前四行可以形成倾向，但“断肠人在天涯”才把人物与处境直接说出来。','ok');
      else feedback('再检查“确定”二字：哪些是读者感到的气氛，哪些是原文直接交代的事实？','retry');
    }
  }

  function transferClaim(){return '<section class="claim-card"><b>同学的判断</b><p>“最后写乡书、归雁，所以整首诗从头到尾都很悲伤。”</p></section>';}
  function renderTransferCold(){
    const body='<p class="poem-lead">换成唐代五言律诗。这里不先给注释、提示或证据分类；先完整读完，再审查同学的结论。</p>'+poemPaper(L.transfer)+transferClaim()+
      '<h3>这句话是否充分？</h3>'+options(L.transfer.claims,state.transferClaim,'transfer-claim','迁移首答')+
      '<h3>仍然只选两处原文，尽量让它们作用不同</h3>'+evidence(L.transfer.evidence,state.transferEvidence,'transfer-evidence','迁移首答证据')+
      '<label class="poem-field"><b>这两处怎样支持或修正同学的结论？</b><textarea id="transfer-explanation" rows="4" maxlength="900">'+esc(state.transferExplanation)+'</textarea></label>';
    host.innerHTML=base('现场三 · 独立迁移','换形式、换景象、换情感结构',body,'<button class="primary" id="transfer-submit">封存迁移首答 →</button>');
    bindOptions('transfer-claim','transferClaim');bindEvidence('transfer-evidence','transferEvidence');bindText('transfer-explanation','transferExplanation');
    host.querySelector('#transfer-submit').addEventListener('click',()=>{
      if(!state.transferClaim){message('先判断同学的说法是否充分；暂时不确定也可以如实选择。',true);return;}
      if(state.transferEvidence.length!==2){message('请留下两处原文证据。',true);return;}
      if(!L.meaningful(state.transferExplanation)){message('请解释两处证据怎样支持或修正结论。',true);return;}
      log.submit(2,'迁移首答：'+labelFor(L.transfer.claims,state.transferClaim)+'；证据：'+evidenceText(L.transfer.evidence,state.transferEvidence),null,state.transferExplanation);
      log.note(2,'迁移首答前未显示点读注释、证据分类、提示或答案；开放判断未自动判分。');
      state.transferAttempted=true;state.reviewClaim=state.transferClaim;state.reviewEvidence=[...state.transferEvidence];state.reviewExplanation=state.transferExplanation;save();render(true);
    });
  }
  function gradeRows(grade){
    const labels={claim:'结论范围',evidence:'两类证据',relation:'景与情关系'};
    return '<div class="grade-row">'+Object.entries(grade).map(([key,ok])=>'<span data-ok="'+String(ok)+'">'+labels[key]+' · '+(ok?'已对上':'再检查')+'</span>').join('')+'</div>';
  }
  function renderTransferReview(){
    const first=log.records[2].first,grade=L.gradeTransfer(state);
    const hints=state.hintLevel?'<div class="poem-help"><ol>'+L.transfer.hints.slice(0,state.hintLevel).map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol></div>':'';
    const nextHint=state.hintLevel<L.transfer.hints.length?'<button type="button" class="secondary" id="next-hint">打开提示 '+(state.hintLevel+1)+'</button>':'';
    const body='<p class="poem-lead">迁移首答已经保留。现在才开放点读和分层提示；可以坚持，也可以把遗漏的一类证据补回来。</p><div class="cold-capture"><b>迁移第一次判断</b><p>'+esc(first?.answer||'')+'</p><b>第一次解释</b><p>'+esc(first?.explanation||'')+'</p></div>'+poemPaper(L.transfer,{annotated:true})+transferClaim()+hints+'<div class="lens-controls">'+nextHint+'</div>'+
      '<h3>复核：同学的结论是否充分？</h3>'+options(L.transfer.claims,state.reviewClaim,'review-claim','迁移复核判断')+
      '<h3>重新选两处作用不同的证据</h3>'+evidence(L.transfer.evidence,state.reviewEvidence,'review-evidence','迁移复核证据')+
      '<h3>两类证据怎样共同构成全诗？</h3>'+options(L.transfer.relations,state.reviewRelation,'review-relation','迁移关系')+
      '<label class="poem-field"><b>写下复核后的解释</b><textarea id="review-explanation" rows="4" maxlength="900">'+esc(state.reviewExplanation)+'</textarea></label>'+
      '<div class="poem-options" role="group" aria-label="坚持或修改"><button type="button" data-decision="keep" aria-pressed="'+String(state.revisionDecision==='keep')+'">我坚持首答，并补强了依据</button><button type="button" data-decision="change" aria-pressed="'+String(state.revisionDecision==='change')+'">我修改首答，因为发现了遗漏</button></div>'+
      (state.reviewAttempted?gradeRows(grade):'');
    host.innerHTML=base('迁移复核 · 首答不会被覆盖','不是选中“思乡”，而是让整首每一类证据都有位置',body,'<button class="primary" id="review-submit">收好本次证据链 →</button>');
    bindAnnotations(2);bindOptions('review-claim','reviewClaim');bindEvidence('review-evidence','reviewEvidence');bindOptions('review-relation','reviewRelation');bindText('review-explanation','reviewExplanation');bindOptions('decision','revisionDecision');
    host.querySelector('#next-hint')?.addEventListener('click',()=>{
      state.hintLevel=Math.min(L.transfer.hints.length,state.hintLevel+1);log.help(2,'迁移提示 '+state.hintLevel+'：'+L.transfer.hints[state.hintLevel-1]);save();render(true);
    });
    host.querySelector('#review-submit').addEventListener('click',()=>{
      if(!state.reviewClaim||state.reviewEvidence.length!==2||!state.reviewRelation){message('请完成复核判断、两处证据和它们的关系。',true);return;}
      if(!state.revisionDecision||!L.meaningful(state.reviewExplanation)){message('请说明你坚持还是修改，并留下复核后的解释。',true);return;}
      const next=L.gradeTransfer(state);
      log.submit(2,'迁移复核：'+labelFor(L.transfer.claims,state.reviewClaim)+'；证据：'+evidenceText(L.transfer.evidence,state.reviewEvidence)+'；关系：'+labelFor(L.transfer.relations,state.reviewRelation),null,state.reviewExplanation);
      state.reviewAttempted=true;
      if(!Object.values(next).every(Boolean)){
        log.help(2,'自动反馈：同时保留开阔／更新证据与尾联思乡证据');save();render(true);return;
      }
      log.note(2,'本次复核同时使用一处开阔或更新证据与一处思乡证据；开放解释未自动判分。');
      log.finish(2,(log.records[2].helps.length?'使用过点读、提示或反馈；':'未使用点读、提示或反馈；')+'本次迁移证据链已成立，不等于长期掌握');save();render(true);
    });
  }
  function renderComplete(){
    if(sources)sources.hidden=false;
    const first=log.records[0].first,transferFirst=log.records[2].first,transferLast=log.records[2].attempts.at(-1);
    const body='<p class="poem-lead">这次不是给两首诗贴情绪标签，而是把“景物—关系—人物处境—结论范围”走完了一遍。</p><div class="review-grid"><section class="review-panel"><h3>《天净沙·秋思》首答</h3><p>'+esc(first?.answer||'未留下')+'</p><p>'+esc(first?.explanation||'')+'</p></section><section class="review-panel"><h3>《次北固山下》迁移</h3><p><b>首次：</b>'+esc(transferFirst?.answer||'未留下')+'</p><p><b>复核：</b>'+esc(transferLast?.answer||'未留下')+'</p></section></div><div class="strategy-ribbon"><span>先读完整首</span><span>留下第一判断</span><span>找两类证据</span><span>说明关系</span><span>检查结论范围</span></div><p>本次记录能说明孩子在这两个文本中留下了怎样的首答、依据、提示和修订；不能证明所有古诗情感题已经会做。真正的保持与迁移，要隔一段时间再换诗、换提问方式检查。</p><div class="poem-next"><b>当前批次：2 / 4。</b>下一课切到地理，研究地球自转、公转与四季；古诗会在后续换文本间隔复测。</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button type="button" class="secondary" id="poem-restart">重新读一轮（保留旧记录）</button><a class="secondary" href="courses.html?group=school&amp;subject=语文">返回语文课程</a></div>';
    host.innerHTML=base('C-P01 · 本次先收好','景物不是答案，关系才让情感有依据',body)+log.html();
    host.querySelector('#poem-restart').addEventListener('click',()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});if(sources)sources.hidden=true;save();render(true);});
  }
  function render(moveFocus=false){
    closeAnnotation();progress();
    if(log.index>=L.tasks.length)renderComplete();
    else if(log.index===0)state.coldSaved?renderGuided():renderCold();
    else if(log.index===1)renderWhatIf();
    else state.transferAttempted?renderTransferReview():renderTransferCold();
    progress();if(moveFocus)focusCard();
  }
  render();
})();
