'use strict';
(function(){
  const host=document.querySelector('#brackets-task');
  const sources=document.querySelector('#brackets-sources');
  const L=window.BracketsLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p></section>';return;}
  if(!F.courses.some(course=>course[0]===L.id)){
    const after=F.courses.findIndex(course=>course[0]==='liketerms');
    F.courses.splice(after+1,0,[L.id,L.title,'brackets.html']);
  }

  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  let state=L.sanitizeState(log.checkpoint.brackets);
  state.labAttempted=state.labAttempted&&!!log.records[1]?.attempts?.length;
  state.transferAttempted=state.transferAttempted&&!!log.records[2]?.attempts?.length;
  function save(){log.point({brackets:state});}
  function answerText(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function message(value,error=false){const box=host.querySelector('#brackets-message');if(box){box.textContent=value;box.dataset.error=String(error);}}
  function progress(){
    document.querySelectorAll('.parallel-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',index<log.index);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){requestAnimationFrame(()=>{const heading=host.querySelector('h2');if(heading){heading.focus();heading.scrollIntoView({block:'start'});}});}
  function card(label,title,body,actions=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<p class="parallel-error" id="brackets-message" role="status" aria-live="polite"></p>'+actions+'</section>';
  }
  function reason(prefix,label,value,unsure,placeholder){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" rows="3" maxlength="900" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindReason(prefix,valueKey,unsureKey){
    const input=host.querySelector('#'+prefix+'-reason'),checkbox=host.querySelector('#'+prefix+'-unsure');
    input.oninput=()=>{state[valueKey]=input.value.slice(0,900);if(input.value.trim()){state[unsureKey]=false;checkbox.checked=false;}save();};
    checkbox.onchange=()=>{state[unsureKey]=checkbox.checked;save();};
  }
  function bindHelp(index){F.watchHelp(host,log,index);}

  function renderCold(){
    const claims='<div class="bracket-claims" role="group" aria-label="选择你认为对所有取值都成立的改写">'+L.coldClaims.map(item=>'<button type="button" class="bracket-claim" data-cold="'+item.id+'" aria-pressed="'+String(state.coldChoices.includes(item.id))+'">'+item.formula+'</button>').join('')+'</div>';
    const body='<p class="parallel-lead">这里的字母表示数。选择你认为<strong>对所有允许取值都成立</strong>的改写，可以选一项或多项。先不代入数字，也不看规则。</p>'+claims+reason('cold','先留一句判断依据。',state.coldReason,state.coldUnsure,'例如：我认为第……条总成立，因为……。')+'<p class="identity-note">首答会原样保留。提交后才进入操作区，这里不揭示正确项。</p>';
    host.innerHTML=card('环节一 · 冷判断','拆开括号以后，哪些式子仍与原来相等？',body,'<button class="primary" id="cold-submit">封存首答，进入实验台 →</button>');
    host.querySelectorAll('[data-cold]').forEach(button=>button.onclick=()=>{const id=button.dataset.cold;state.coldChoices=state.coldChoices.includes(id)?state.coldChoices.filter(value=>value!==id):[...state.coldChoices,id];button.setAttribute('aria-pressed',String(state.coldChoices.includes(id)));save();});
    bindReason('cold','coldReason','coldUnsure');
    host.querySelector('#cold-submit').onclick=()=>{
      if(!state.coldChoices.length){message('至少选择一条你认为总成立的改写。',true);return;}
      const why=answerText(state.coldReason,state.coldUnsure);if(!why){message('先留一句理由；暂时说不清也可以如实勾选。',true);return;}
      const selected=state.coldChoices.map(id=>L.coldClaims.find(item=>item.id===id)?.formula||id);
      log.submit(0,selected.join('；'),null,why);
      log.note(0,'首答在规则、动画与提示出现前封存；本环节未即时揭示正确项。');
      log.finish(0,'冷判断已封存；不据此认定掌握');render(true);
    };
  }

  function gateMarkup(kind){
    const positive=kind==='positive';
    const spec=positive?{
      title:'正数门：2(x＋3)',expression:'2(x＋3)',door:'×2',tokens:[['positive-x','x','2x'],['positive-3','＋3','＋6']]
    }:{
      title:'负号门：－(x－4)',expression:'(－1)(x－4)',door:'×(－1)',tokens:[['negative-x','x','－x'],['negative-minus4','－4','＋4']]
    };
    return '<section class="gate-lab"><h3>'+spec.title+'</h3><p>'+(positive?'把两整组 (x＋3) 展开，看括号外的2作用到哪里。':'先把括号前单独的负号写成乘数－1，再逐项观察。')+'</p><div class="gate-expression">'+spec.expression+'</div><div class="gate-machine"><div class="gate-source">'+spec.tokens.map(token=>'<div class="gate-token">'+token[1]+'</div>').join('')+'</div><div class="gate-door">'+spec.door+'</div><div class="gate-results">'+spec.tokens.map(token=>'<div class="gate-result '+(state.gateActions.includes(token[0])?'passed':'')+'" data-result="'+token[0]+'">'+(state.gateActions.includes(token[0])?token[2]:'等待')+'</div>').join('')+'</div></div><div class="gate-actions">'+spec.tokens.map(token=>'<button type="button" data-gate="'+token[0]+'" '+(state.gateActions.includes(token[0])?'disabled':'')+'>'+(state.gateActions.includes(token[0])?'已处理 '+token[1]:'让 '+token[1]+' 经过门')+'</button>').join('')+'</div></section>';
  }
  function sampleMarkup(){
    const x=state.sampleValue,original=2*(x+3),expanded=2*x+6,missed=2*x+3;
    return '<section class="sample-check"><div class="sample-check-head"><h3>改变 x，检查“漏掉一项”会怎样</h3><output>x＝'+x+'</output></div><input id="sample-value" type="range" min="1" max="6" step="1" value="'+x+'" aria-label="改变x的检查值"><div class="sample-readout"><div>原式 2(x＋3)<b>'+original+'</b></div><div>完整展开 2x＋6<b>'+expanded+'</b></div><div>漏乘后的 2x＋3<b>'+missed+'</b></div></div><p>已改变 <b id="sample-count">'+new Set(state.sampleValues).size+' / 2</b> 个不同取值。数值不一致能推翻错误改写；一般结论仍要靠分配律。</p></section>';
  }
  function labFeedback(){
    if(!state.labAttempted)return '';
    const result=L.gradeLab(state),notes=[];
    if(!result.gates)notes.push('两扇门里的四个带符号项都要亲手处理一次。');
    if(!result.samples)notes.push('把 x 调到至少两个不同取值，比较原式、完整展开和漏乘式。');
    if(!result.expandedX)notes.push('－2乘3x，得到－6x；先只看这一项的系数。');
    if(!result.expandedConstant)notes.push('括号里的常数项是－4，所以 (－2)×(－4)＝＋8。');
    if(!result.finalX)notes.push('展开后有－6x与＋5x，它们合并为－x，系数是－1。');
    if(!result.finalConstant)notes.push('合并同类项不会改变常数＋8。');
    return '<div class="bracket-feedback '+(notes.length?'':'bracket-success')+'">'+(notes.length?notes.map(note=>'<p>'+esc(note)+'</p>').join(''):'作用范围、符号与同类项合并都已经对应。')+'</div>';
  }
  function challengeMarkup(){
    const hint=state.labAttempted?'<details class="parallel-help" data-help="展开与合并提示"><summary>首次提交后仍卡住，给我一条提示</summary><p>先写成 (－2)×3x＋(－2)×(－4)＋5x；展开括号和合并同类项是两个不同步骤。</p></details>':'';
    return '<section class="withdraw-lab"><h3>提示撤掉：－2(3x－4)＋5x</h3><p>先展开括号，再调用上一课的方法合并同类项。填写的是每一步的系数或常数。</p><div class="withdraw-expression">－2(3x－4)＋5x</div><div class="coefficient-grid"><label>展开后 x 项的系数<input id="expanded-x" inputmode="text" autocapitalize="off" value="'+esc(state.expandedX)+'"></label><label>展开后的常数<input id="expanded-constant" inputmode="text" autocapitalize="off" value="'+esc(state.expandedConstant)+'"></label><label>合并后 x 项的系数<input id="final-x" inputmode="text" autocapitalize="off" value="'+esc(state.finalX)+'"></label><label>合并后的常数<input id="final-constant" inputmode="text" autocapitalize="off" value="'+esc(state.finalConstant)+'"></label></div>'+hint+'</section>';
  }
  function renderLab(){
    const body='<div class="reveal-banner"><b>现在揭题：</b>括号一打开，为什么里面每个带符号的项都要“过门”？门只是动画比喻，数学依据是分配律。</div><div class="gate-grid">'+gateMarkup('positive')+gateMarkup('negative')+'</div><p class="law-note"><b>一般理由：</b>k(A＋B)＝kA＋kB，k(A－B)＝kA－kB。单独的负号相当于乘－1，所以－(x－4)＝(－1)×x＋(－1)×(－4)＝－x＋4。</p>'+sampleMarkup()+challengeMarkup()+labFeedback()+reason('lab','把动作和依据连起来。',state.labReason,state.labUnsure,'我先把……作用到……；出现正8是因为……；最后再……。');
    host.innerHTML=card('环节二 · 示例与撤架','不是擦掉括号，而是保持值不变地改写',body,'<button class="primary" id="lab-submit">检查展开与解释 →</button>');
    host.querySelectorAll('[data-gate]').forEach(button=>button.onclick=()=>{
      const action=button.dataset.gate;state.gateActions=L.uniqueAllowed([...state.gateActions,action],L.gateActions);save();
      const result=host.querySelector('[data-result="'+action+'"]');const label=button.textContent.replace(/^让 | 经过门$/g,'');
      if(result){result.classList.add('passed');result.textContent=action==='positive-x'?'2x':action==='positive-3'?'＋6':action==='negative-x'?'－x':'＋4';}
      button.disabled=true;button.textContent='已处理 '+label;
    });
    const slider=host.querySelector('#sample-value');
    slider.oninput=()=>{
      state.sampleValue=Number(slider.value);state.sampleValues=L.uniqueAllowed([...state.sampleValues,state.sampleValue],[1,2,3,4,5,6]);save();
      const x=state.sampleValue,boxes=host.querySelectorAll('.sample-readout b');
      host.querySelector('.sample-check output').textContent='x＝'+x;boxes[0].textContent=2*(x+3);boxes[1].textContent=2*x+6;boxes[2].textContent=2*x+3;host.querySelector('#sample-count').textContent=new Set(state.sampleValues).size+' / 2';
    };
    for(const [id,key] of [['expanded-x','expandedX'],['expanded-constant','expandedConstant'],['final-x','finalX'],['final-constant','finalConstant']])host.querySelector('#'+id).oninput=event=>{state[key]=event.target.value.slice(0,20);save();};
    bindReason('lab','labReason','labUnsure');bindHelp(1);
    host.querySelector('#lab-submit').onclick=()=>{
      if(![state.expandedX,state.expandedConstant,state.finalX,state.finalConstant].every(value=>String(value).trim())){message('四个系数或常数都要先填写。',true);return;}
      const why=answerText(state.labReason,state.labUnsure);if(!why){message('留一句展开依据；暂时说不清也可以如实勾选。',true);return;}
      const result=L.gradeLab(state),correct=Object.values(result).every(Boolean);
      log.submit(1,'门操作：'+state.gateActions.join('、')+'；展开后x系数：'+state.expandedX+'，常数：'+state.expandedConstant+'；合并后x系数：'+state.finalX+'，常数：'+state.finalConstant,correct,why);
      state.labAttempted=true;save();
      if(!correct){log.help(1,'自动反馈：作用范围、符号或同类项');render();return;}
      log.note(1,'数值检查操作过的x：'+state.sampleValues.join('、')+'。数值只作检查，一般理由使用分配律。');
      log.finish(1,(log.records[1].helps.some(help=>help.phase!=='完成后回看')?'使用过提示或自动反馈；':'未打开提示；')+'完成一层括号撤架');render(true);
    };
  }

  function optionGroup(items,key,attribute,label){
    return '<div class="formula-grid" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" '+attribute+'="'+item.id+'" aria-pressed="'+String(state[key]===item.id)+'">'+item.formula+'</button>').join('')+'</div>';
  }
  function transferFeedback(){
    if(!state.transferAttempted)return '';
    const result=L.gradeTransfer(state),notes=[];
    if(!result.model)notes.push('三箱是3个完整的 (x＋2)；卸下一箱是减去完整的 (x＋1)。');
    if(!result.expansion)notes.push('3要同时乘x和2；减去 (x＋1) 等于－x－1。');
    if(!result.result)notes.push('展开后先收集x项3x－x，再收集常数6－1。');
    if(!result.check)notes.push('x＝4时，装入18千克、卸下5千克，净增加13千克。');
    if(!result.reason)notes.push('依据是两个括号外的因数分别作用到各自整组中的每个带符号项。');
    return '<div class="bracket-feedback '+(notes.length?'':'bracket-success')+'">'+(notes.length?notes.map(note=>'<p>'+esc(note)+'</p>').join(''):'建模、展开、合并和数值检查已经互相对应。')+'</div>';
  }
  function renderTransfer(){
    const hint=state.transferAttempted?'<details class="parallel-help" data-help="货舱清单提示"><summary>首次提交后仍卡住，再看一条提示</summary><p>先保持两整组：＋3(x＋2) 与－1(x＋1)。分别展开后，再把x项和常数项各自合并。</p></details>':'';
    const manifest='<div class="manifest"><article class="manifest-card add"><b>装入</b><strong>3 箱</strong><p>每箱：传感器 x 千克＋箱架2千克</p></article><article class="manifest-card remove"><b>卸下</b><strong>1 箱</strong><p>该箱：传感器 x 千克＋电池1千克</p></article></div>';
    const work='<section class="formula-section"><h3>1. 哪个式子表示货舱净增加的质量？</h3>'+optionGroup(L.transferModels,'model','data-model','货舱净增加质量的建模式')+'</section><section class="formula-section"><h3>2. 展开括号后是哪一行？</h3>'+optionGroup(L.transferExpansions,'expansion','data-expansion','展开括号后的式子')+'</section><section class="formula-section"><h3>3. 合并同类项后是什么？</h3>'+optionGroup(L.transferResults,'result','data-result-choice','合并同类项后的结果')+'</section><div class="transfer-check"><label for="check-value">取 x＝4 千克，按原清单计算净增加多少千克？</label><input id="check-value" inputmode="numeric" value="'+esc(state.checkValue)+'"></div><section class="formula-section"><h3>4. 选择能说明一般理由的一项</h3><div class="reason-grid" role="group" aria-label="货舱式子的一般化简理由">'+L.transferReasons.map(item=>'<button type="button" data-transfer-reason="'+item.id+'" aria-pressed="'+String(state.reason===item.id)+'">'+item.text+'</button>').join('')+'</div></section>';
    const body='<p class="parallel-lead">这次不提供“过门”颜色和箭头。先从两张货舱卡建立式子，再决定是否需要展开与合并。</p>'+manifest+work+transferFeedback()+reason('transfer','用自己的话解释“为什么卸下一箱会得到－x－1”。',state.transferExplanation,state.transferUnsure,'因为卸下的是整个……，所以……。')+hint+'<p class="identity-note">代入 x＝4 是检查，不是一般证明；能够解释括号外因数的作用范围，才说明改写为何对所有允许取值成立。</p>';
    host.innerHTML=card('环节三 · 独立迁移','货舱清单换了样子，方法还能认出来吗？',body,'<button class="primary" id="transfer-submit">封存货舱质检 →</button>');
    for(const [selector,key,dataset] of [['[data-model]','model','model'],['[data-expansion]','expansion','expansion'],['[data-result-choice]','result','resultChoice'],['[data-transfer-reason]','reason','transferReason']])host.querySelectorAll(selector).forEach(button=>button.onclick=()=>{state[key]=button.dataset[dataset];host.querySelectorAll(selector).forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    host.querySelector('#check-value').oninput=event=>{state.checkValue=event.target.value.slice(0,20);save();};
    bindReason('transfer','transferExplanation','transferUnsure');bindHelp(2);
    host.querySelector('#transfer-submit').onclick=()=>{
      if(!state.model||!state.expansion||!state.result||!String(state.checkValue).trim()||!state.reason){message('建模式、展开式、化简式、数值检查和一般理由都要先完成。',true);return;}
      const why=answerText(state.transferExplanation,state.transferUnsure);if(!why){message('留一句自己的解释；暂时说不清也可以如实勾选。',true);return;}
      const result=L.gradeTransfer(state),correct=Object.values(result).every(Boolean);
      const model=L.transferModels.find(item=>item.id===state.model)?.formula||state.model,expansion=L.transferExpansions.find(item=>item.id===state.expansion)?.formula||state.expansion,final=L.transferResults.find(item=>item.id===state.result)?.formula||state.result,basis=L.transferReasons.find(item=>item.id===state.reason)?.text||state.reason;
      log.submit(2,'建模：'+model+'；展开：'+expansion+'；合并：'+final+'；x=4时：'+state.checkValue+'千克；依据：'+basis,correct,why);
      state.transferAttempted=true;save();
      if(!correct){log.help(2,'自动反馈：建模、展开或合并');render();return;}
      log.note(2,'结构化迁移全部正确；开放解释保留原话，不按关键词自动判分。');
      log.finish(2,(log.records[2].helps.some(help=>help.phase!=='完成后回看')?'使用过迁移提示或自动反馈；':'未打开迁移提示；')+'完成无箭头货舱迁移');render(true);
    };
  }

  function finish(){
    if(sources)sources.hidden=false;
    const body='<p class="parallel-lead">去括号不是把两个弧线擦掉，而是用分配律把一个式子改写成值始终相等的另一个式子。</p><div class="bracket-final"><div><b>先认作用范围</b>括号外因数作用于括号内每个带符号的项。</div><div><b>负号不是魔法</b>括号前单独的减号，就是用－1乘整个括号。</div><div><b>分清两步</b>先展开括号，再判断哪些项可以合并。</div></div><p class="parallel-takeaway"><b>k(A＋B)＝kA＋kB</b><br><b>k(A－B)＝kA－kB</b><br><b>－(A－B)＝－A＋B</b></p><p>动画中的“门”只帮助看见作用范围。分配律处理的是和或差；像3(ab)只有一个乘积项，不能错误写成(3a)(3b)。本页完成不等于长期掌握，之后还要换成面积、费用或物理公式做间隔迁移。</p><div class="parallel-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school&amp;subject=数学">返回数学课程</a><button class="secondary" id="brackets-restart">重新学一轮（保留旧记录）</button></div>';
    host.innerHTML=card('A2 · 括号与整式','改写以后值不变，才是同一个数学关系',body)+log.html();
    host.querySelector('#brackets-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});save();if(sources)sources.hidden=true;render(true);};
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length)finish();else if(log.index===0)renderCold();else if(log.index===1)renderLab();else renderTransfer();
    progress();if(sources&&log.index<L.tasks.length)sources.hidden=true;if(moveFocus)focusCard();
  }
  render();
})();
