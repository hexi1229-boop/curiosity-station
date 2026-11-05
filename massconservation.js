(function(){
  'use strict';
  const L=MassConservationLesson,F=LearningFeedback,esc=F.esc,$=id=>document.getElementById(id);
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'massconservation.html']);
  let log=F.create(L.title,L.tasks),state=loadState();

  function loadState(){
    const clean=L.sanitizeState(log.checkpoint?.[L.id]);
    clean.atomAttempted=clean.atomAttempted&&!!log.records[1]?.attempts?.length;
    clean.copperAttempted=clean.copperAttempted&&!!log.records[2]?.attempts?.length;
    clean.transferAttempted=clean.transferAttempted&&!!log.records[3]?.attempts?.length;
    return clean;
  }
  function save(){log.point({[L.id]:state});drawReport();}
  function allDone(){return log.records.every(record=>record.done);}
  function drawReport(){
    $('mass-report').innerHTML=log.active?log.html():'<p class="empty-work">还没有学习记录。第一判断、清点、提示与修订会自动保存在本机。</p>';
    if(allDone())$('mass-report').insertAdjacentHTML('beforeend','<button type="button" class="secondary mass-restart" id="mass-restart">重新学习，保留这次记录</button>');
    $('mass-restart')?.addEventListener('click',()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});renderAll();save();window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
    $('mass-rule-box').hidden=!log.records[3].done;$('mass-sources').hidden=!allDone();
  }
  function setFeedback(id,text,kind=''){const node=$(id);node.textContent=text;node.dataset.state=kind;}
  function choiceText(list,id){return list.find(item=>item.id===id)?.text||id;}
  function reasonValue(prefix){const value=state[prefix+'Reason'].trim();return value||(state[prefix+'Unsure']?'暂时说不清理由':'');}
  function renderMolecules(molecules){return molecules.map(molecule=>'<span class="molecule">'+molecule.map(atom=>`<i class="atom" data-atom="${esc(atom)}">${esc(atom)}</i>`).join('')+'</span>').join('');}

  $('atom-before').innerHTML=renderMolecules(L.atomExample.before);$('atom-after').innerHTML=renderMolecules(L.atomExample.after);
  $('atom-independent-before').innerHTML=renderMolecules([['X','X'],['X','X'],['Y','Y']]);
  $('copper-boundary').insertAdjacentHTML('beforeend',L.copperBoundaries.map(item=>`<option value="${item.id}">${esc(item.text)}</option>`).join(''));
  $('copper-flow').insertAdjacentHTML('beforeend',L.copperFlows.map(item=>`<option value="${item.id}">${esc(item.text)}</option>`).join(''));

  function radios(container,items,selected,onSelect,disabled=false){
    container.innerHTML=items.map((item,index)=>`<button type="button" role="radio" aria-checked="${String(item.id===selected)}" tabindex="${item.id===selected||(!selected&&index===0)?'0':'-1'}" data-choice="${esc(item.id)}" ${disabled?'disabled':''}>${esc(item.text)}</button>`).join('');
    const buttons=[...container.querySelectorAll('[data-choice]')];
    buttons.forEach((button,index)=>{
      button.addEventListener('click',()=>{buttons.forEach(item=>{const chosen=item===button;item.setAttribute('aria-checked',String(chosen));item.tabIndex=chosen?0:-1;});onSelect(button.dataset.choice);button.focus();});
      button.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key))return;event.preventDefault();const step=['ArrowDown','ArrowRight'].includes(event.key)?1:-1,next=buttons[(index+step+buttons.length)%buttons.length];next.focus();next.click();});
    });
  }
  function ruleRadios(fieldset,name,selected,onSelect,disabled=false){
    fieldset.innerHTML='<legend>'+esc(fieldset.dataset.legend||fieldset.querySelector('legend')?.textContent||'选择结论')+'</legend>'+L.rules.map(item=>`<label><input type="radio" name="${name}" value="${item.id}" ${item.id===selected?'checked':''} ${disabled?'disabled':''}><span>${esc(item.text)}</span></label>`).join('');
    fieldset.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>onSelect(input.value)));
  }
  $('copper-rules').dataset.legend=$('copper-rules').querySelector('legend').textContent;
  $('transfer-rules').dataset.legend=$('transfer-rules').querySelector('legend').textContent;
  function renderHints(prefix,list,level){
    const record=log.records[prefix==='atom'?1:prefix==='copper'?2:3],attempted=record.attempts.length>0;
    $(prefix+'-hints').innerHTML=level?'<ol>'+list.slice(0,level).map(text=>'<li>'+esc(text)+'</li>').join('')+'</ol>':`<p>${attempted?'还没有打开提示。':'先提交一次自己的判断，再决定是否打开提示。'}</p>`;
    $(prefix+'-hint').disabled=!attempted||level>=list.length||record.done;
  }
  function bindReason(prefix){
    const input=$(prefix+'-reason'),unsure=$(prefix+'-unsure');input.value=state[prefix+'Reason'];unsure.checked=state[prefix+'Unsure'];
    input.addEventListener('input',()=>{state[prefix+'Reason']=input.value.slice(0,700);if(input.value.trim()){state[prefix+'Unsure']=false;unsure.checked=false;}save();});
    unsure.addEventListener('change',()=>{state[prefix+'Unsure']=unsure.checked;if(unsure.checked){state[prefix+'Reason']='';input.value='';}save();});
  }
  function syncReason(prefix,disabled){
    $(prefix+'-reason').value=state[prefix+'Reason'];$(prefix+'-reason').disabled=disabled;
    $(prefix+'-unsure').checked=state[prefix+'Unsure'];$(prefix+'-unsure').disabled=disabled;
  }

  function renderCold(){
    const done=log.records[0].done;
    radios($('cold-choices'),L.coldChoices,state.coldChoice,value=>{state.coldChoice=value;save();},done);
    syncReason('cold',done);$('cold-submit').disabled=done;
    setFeedback('cold-feedback',done?'第一判断已封存。下面用原子账与系统边界检验它；封存不代表判断正确。':'',done?'ok':'');
  }
  $('cold-submit').addEventListener('click',()=>{
    if(!state.coldChoice){setFeedback('cold-feedback','先选一个最接近的第一判断。','retry');return;}
    const why=reasonValue('cold');if(!why){setFeedback('cold-feedback','先留一句理由；暂时说不清也可以如实勾选。','retry');return;}
    log.submit(0,choiceText(L.coldChoices,state.coldChoice),null,why);log.note(0,'第一判断在原子模型和边界示例前封存，不即时判对错。');log.finish(0,'模型前判断已封存');renderAll();
  });

  function renderCount(){
    document.querySelectorAll('[data-count-atom]').forEach(button=>button.setAttribute('aria-pressed',String(state.atomGuideSeen.includes(button.dataset.countAtom))));
    const before=L.countAtoms(L.atomExample.before),after=L.countAtoms(L.atomExample.after),parts=[];
    if(state.atomGuideSeen.includes('H'))parts.push(`H：反应前 ${before.H} 个，反应后 ${after.H} 个`);
    if(state.atomGuideSeen.includes('O'))parts.push(`O：反应前 ${before.O} 个，反应后 ${after.O} 个`);
    $('atom-count-result').textContent=parts.length?parts.join('；')+'。分子由3个变成2个，但每种原子仍对得上。':'还没开始清点。';
  }
  document.querySelectorAll('[data-count-atom]').forEach(button=>button.addEventListener('click',()=>{
    const atom=button.dataset.countAtom,first=!state.atomGuideSeen.includes(atom);if(first)state.atomGuideSeen=[...state.atomGuideSeen,atom];save();
    if(first)log.note(1,'示例清点：'+atom+' 原子反应前后数量相同；正常示例不计作答求助。');renderCount();
  }));
  function renderAtom(){
    const done=log.records[1].done;
    $('atom-candidates').innerHTML=L.atomCandidates.map((item,index)=>`<button type="button" class="atom-candidate" role="radio" aria-checked="${String(item.id===state.atomChoice)}" tabindex="${item.id===state.atomChoice||(!state.atomChoice&&index===0)?'0':'-1'}" data-atom-choice="${item.id}" ${done?'disabled':''}><b>${esc(item.label)}</b><span class="molecule-board">${renderMolecules(item.molecules)}</span></button>`).join('');
    const candidates=[...$('atom-candidates').querySelectorAll('[data-atom-choice]')];
    candidates.forEach((button,index)=>{
      const choose=()=>{candidates.forEach(item=>{const chosen=item===button;item.setAttribute('aria-checked',String(chosen));item.tabIndex=chosen?0:-1;});state.atomChoice=button.dataset.atomChoice;state.atomAttempted=false;save();setFeedback('atom-feedback','');button.focus();};
      button.addEventListener('click',choose);
      button.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key))return;event.preventDefault();const step=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;candidates[(index+step+candidates.length)%candidates.length].click();});
    });
    syncReason('atom',done);$('atom-submit').disabled=done;
    renderHints('atom',L.atomHints,state.atomHintLevel);
    if(!state.atomAttempted)setFeedback('atom-feedback',done?'原子账已完成；正确候选只表示原子清单可行，不证明真实反应一定发生。':'',done?'ok':'');
    else if(L.gradeAtom(state).correct)setFeedback('atom-feedback','逐种对上了：反应前后都是4个X、2个Y；分子个数可以改变。','ok');
    else if(!L.gradeAtom(state).guide)setFeedback('atom-feedback','先把H和O各数一次，再独立数X和Y。','retry');
    else setFeedback('atom-feedback','这个候选有一种原子没对上。不要只数粒子团有几个，要逐种数X和Y。','retry');
  }
  $('atom-hint').addEventListener('click',()=>{if(state.atomHintLevel>=L.atomHints.length)return;state.atomHintLevel++;log.help(1,'提示'+state.atomHintLevel+'：'+L.atomHints[state.atomHintLevel-1]);save();renderAtom();});
  $('atom-submit').addEventListener('click',()=>{
    if(!log.records[0].done){setFeedback('atom-feedback','先封存模型前判断，再进入原子账。','retry');return;}
    if(!L.gradeAtom(state).guide){setFeedback('atom-feedback','先点“数H”和“数O”，看完完整示例。','retry');return;}
    if(!state.atomChoice){setFeedback('atom-feedback','先选一个候选产物图。','retry');return;}
    const why=reasonValue('atom');if(!why){setFeedback('atom-feedback','留一句核对方法；暂时说不清也可以如实勾选。','retry');return;}
    const result=L.gradeAtom(state);log.submit(1,choiceText(L.atomCandidates,state.atomChoice),result.correct,why);state.atomAttempted=true;save();
    if(!result.correct)log.help(1,'自动反馈：逐种清点X和Y');else{log.note(1,'独立候选的X/Y原子清单已逐种对上。');log.finish(1,state.atomUnsure?'结构判断通过；解释待练':'能用原子账解释分子数变化');}renderAll();
  });

  function renderBoundary(){
    const open=state.boundaryMode==='open',reading=L.systemReading({start:100,entered:0,left:open?2:0});
    $('boundary-visual').dataset.mode=state.boundaryMode;$('boundary-visual-desc').textContent=open?'当前气体穿过虚线边界离开所称系统，装置读数下降。':'当前气体仍留在密闭装置内，系统边界内没有质量进出。';
    $('scale-reading').textContent=reading.toFixed(1)+' g';$('boundary-ledger').textContent=`起始100.0 g；进入0 g；离开${open?'2.0':'0'} g；当前${reading.toFixed(1)} g。`;
    document.querySelectorAll('[data-boundary-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.boundaryMode===state.boundaryMode)));
    $('boundary-seen').textContent='已观察 '+state.boundarySeen.length+' / 2 种边界'+(state.boundarySeen.length?'：'+state.boundarySeen.map(id=>id==='closed'?'密闭收集':'敞口逸出').join('、'):'。');
  }
  document.querySelectorAll('[data-boundary-mode]').forEach(button=>button.addEventListener('click',()=>{
    const mode=button.dataset.boundaryMode,first=!state.boundarySeen.includes(mode);state.boundaryMode=mode;if(first)state.boundarySeen=[...state.boundarySeen,mode];save();
    if(first)log.note(2,'边界示例：'+(mode==='closed'?'气体留在所称系统内，读数不变。':'气体穿过边界离开，装置读数下降。'));renderBoundary();
  }));
  function renderCopper(){
    const done=log.records[2].done;$('copper-boundary').value=state.copperBoundary;$('copper-flow').value=state.copperFlow;$('copper-mass').value=state.copperOxygenMass;
    ruleRadios($('copper-rules'),'copper-rule',state.copperRule,value=>{state.copperRule=value;state.copperAttempted=false;save();setFeedback('copper-feedback','');},done);
    for(const id of ['copper-boundary','copper-flow','copper-mass','copper-submit'])$(id).disabled=done;syncReason('copper',done);
    renderHints('copper',L.copperHints,state.copperHintLevel);
    if(!state.copperAttempted)setFeedback('copper-feedback',done?'边界质量账已完成：6.4克铜与1.6克进入系统的氧共同形成8.0克氧化物。':'',done?'ok':'');
    else{
      const result=L.gradeCopper(state),missing=[];if(!result.guide)missing.push('两种边界');if(!result.boundary)missing.push('系统边界');if(!result.flow)missing.push('氧气流向');if(!result.mass)missing.push('1.6克质量差');if(!result.rule)missing.push('共同守恒结论');
      setFeedback('copper-feedback',result.correct?'边界、流向和质量差都对上了：增加的1.6克来自进入系统的氧。':'再检查：'+missing.join('、')+'。',result.correct?'ok':'retry');
    }
  }
  for(const [id,key] of [['copper-boundary','copperBoundary'],['copper-flow','copperFlow'],['copper-mass','copperOxygenMass']])$(id).addEventListener(id==='copper-mass'?'input':'change',event=>{state[key]=event.target.value.slice?.(0,20)??event.target.value;state.copperAttempted=false;save();setFeedback('copper-feedback','');});
  $('copper-hint').addEventListener('click',()=>{if(state.copperHintLevel>=L.copperHints.length)return;state.copperHintLevel++;log.help(2,'提示'+state.copperHintLevel+'：'+L.copperHints[state.copperHintLevel-1]);save();renderCopper();});
  $('copper-submit').addEventListener('click',()=>{
    if(!log.records[1].done){setFeedback('copper-feedback','先完成独立原子账，再把守恒放进系统边界。','retry');return;}
    if(state.boundarySeen.length<2){setFeedback('copper-feedback','先分别观察密闭收集与敞口逸出。','retry');return;}
    if(!state.copperBoundary||!state.copperFlow||!state.copperOxygenMass||!state.copperRule){setFeedback('copper-feedback','系统边界、流向、质量差和结论都要选好。','retry');return;}
    const why=reasonValue('copper');if(!why){setFeedback('copper-feedback','留一句边界解释；暂时说不清也可以如实勾选。','retry');return;}
    const result=L.gradeCopper(state);log.submit(2,`边界：${choiceText(L.copperBoundaries,state.copperBoundary)}；流向：${choiceText(L.copperFlows,state.copperFlow)}；氧气：${state.copperOxygenMass}克`,result.correct,why+'；'+choiceText(L.rules,state.copperRule));state.copperAttempted=true;save();
    if(!result.correct)log.help(2,'自动反馈：把质量差连到跨边界的氧气');else{log.note(2,'已把样品增重解释为氧气进入所称系统，而非凭空增加质量。');log.finish(2,state.copperUnsure?'结构判断通过；解释待练':'能用边界与流向完成质量账');}renderAll();
  });

  function renderTransfer(){
    const done=log.records[3].done;
    $('transfer-reports').innerHTML=L.transferReports.map(report=>`<article class="transfer-report"><h3>${esc(report.title)}</h3><p>${esc(report.text)}</p><label for="transfer-${report.id}">最关键的物质流向</label><select id="transfer-${report.id}" data-transfer="${report.id}" ${done?'disabled':''}><option value="">先判断</option>${report.options.map(option=>`<option value="${option.id}" ${state.transferAnswers[report.id]===option.id?'selected':''}>${esc(option.text)}</option>`).join('')}</select></article>`).join('');
    $('transfer-reports').querySelectorAll('[data-transfer]').forEach(select=>select.addEventListener('change',()=>{state.transferAnswers={...state.transferAnswers,[select.dataset.transfer]:select.value};state.transferAttempted=false;save();setFeedback('transfer-feedback','');}));
    ruleRadios($('transfer-rules'),'transfer-rule',state.transferRule,value=>{state.transferRule=value;state.transferAttempted=false;save();setFeedback('transfer-feedback','');},done);
    for(const id of ['transfer-submit'])$(id).disabled=done;syncReason('transfer',done);
    renderHints('transfer',L.transferHints,state.transferHintLevel);
    if(!state.transferAttempted)setFeedback('transfer-feedback',done?'两份相反读数已用同一条“边界—流向—守恒”原则解释。':'',done?'ok':'');
    else{
      const result=L.gradeTransfer(state),missing=[];if(!result.a)missing.push('报告A的气体逸出');if(!result.b)missing.push('报告B的氧气进入');if(!result.rule)missing.push('共同守恒结论');
      setFeedback('transfer-feedback',result.correct?'读数方向相反，原因却可以统一：所称子系统有不同方向的物质进出；总系统仍守恒。':'再检查：'+missing.join('、')+'。',result.correct?'ok':'retry');
    }
  }
  $('transfer-hint').addEventListener('click',()=>{if(state.transferHintLevel>=L.transferHints.length)return;state.transferHintLevel++;log.help(3,'提示'+state.transferHintLevel+'：'+L.transferHints[state.transferHintLevel-1]);save();renderTransfer();});
  $('transfer-submit').addEventListener('click',()=>{
    if(!log.records[2].done){setFeedback('transfer-feedback','先完成铜吸收氧的边界质量账，再独立读两份报告。','retry');return;}
    if(L.transferReports.some(report=>!state.transferAnswers[report.id])||!state.transferRule){setFeedback('transfer-feedback','两份报告的流向和共同结论都要选择。','retry');return;}
    const why=reasonValue('transfer');if(!why){setFeedback('transfer-feedback','留一句“判断—证据—边界”；暂时说不清也可以如实勾选。','retry');return;}
    const result=L.gradeTransfer(state),answer=L.transferReports.map(report=>report.title+'：'+choiceText(report.options,state.transferAnswers[report.id])).join('；');
    log.submit(3,answer,result.correct,why+'；共同结论：'+choiceText(L.rules,state.transferRule));state.transferAttempted=true;save();
    if(!result.correct)log.help(3,'自动反馈：分别找离开和进入系统的物质');else{log.note(3,'已用同一守恒原则解释敞口系统读数下降与上升。');log.finish(3,state.transferUnsure?'结构判断通过；解释待练':'能迁移边界—流向—守恒链');}renderAll();
  });

  bindReason('cold');bindReason('atom');bindReason('copper');bindReason('transfer');
  function renderAccess(){
    const access={atoms:log.records[0].done,boundary:log.records[1].done,transfer:log.records[2].done};
    Object.entries(access).forEach(([id,ready])=>{$(id).hidden=!ready;document.querySelector(`.mass-nav a[href="#${id}"]`).hidden=!ready;});
  }
  function renderAll(){renderCold();renderCount();renderAtom();renderBoundary();renderCopper();renderTransfer();renderAccess();drawReport();}
  renderAll();
})();
