(function(){
  'use strict';
  const L=window.AICodingLesson,F=window.LearningFeedback,$=selector=>document.querySelector(selector),host=$('#ai-task');
  if(!L||!F||!host)return;
  const esc=F.esc;
  const requirementLabels={reach:'到达中继点',avoid:'不能撞上岩石',reserve:'结束时至少保留 1 格电量',send:'成功发送样本数据',shortest:'路线必须全场最短',pretty:'路线看起来必须最漂亮'};
  const decisionLabels={launch:'演示成功，直接发射','test-first':'先换输入测试，再决定','trust-readable':'代码容易读，可以相信'};
  const directionNames={N:'北',E:'东',S:'南',W:'西'};
  const modelLabels={segments:'只数经过几段',energy:'把每段耗电加总',peak:'只看最耗电的一段'};
  let log=F.create(L.title,L.tasks),state=L.sanitizeState(log.checkpoint.aicoding),timers=[],latestResult=null,latestResultDone=false;
  if(!['rock','battery'].every(id=>state.baseFailuresSeen.includes(id))&&!L.sameProgram(state.program,L.baseProgram))state.program={...L.baseProgram};

  function clearTimers(){timers.forEach(timer=>clearTimeout(timer));timers=[];}
  function save(){state=L.sanitizeState(state);log.point({aicoding:state});}
  function coreTrue(value){return Object.entries(value).filter(([key])=>key!=='reason').every(([,ok])=>ok);}
  function progress(){
    const index=log.index;
    document.querySelectorAll('.ai-progress li').forEach((item,i)=>{item.classList.toggle('active',i===index);item.classList.toggle('done',!!log.records[i]?.done);if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
  }
  function reasonValue(text,unsure){return text.trim()||(unsure?'暂时说不清':'');}
  function render(){clearTimers();latestResult=null;latestResultDone=false;$('#aicoding-sources').hidden=log.index<L.tasks.length;progress();if(log.index===0)renderCold();else if(log.index===1)renderRover();else if(log.index===2)renderTransfer();else renderFinish();progress();}

  function programCode(program,hot=''){
    const reserve=program.reserveRule==='plus-one'?'<span class="code-value">预计步数 + 1</span>':'<span class="code-value">预计步数</span>';
    const check='<span class="code-key">如果</span> 前方有岩石：向右转()';
    const move='前进一步()';
    const ordered=program.checkOrder==='before'
      ?`<span class="code-line indent ${hot==='check'?'hot':''}" data-line="check">${check}</span><span class="code-line indent ${hot==='move'?'hot':''}" data-line="move">${move}</span>`
      :`<span class="code-line indent ${hot==='move'?'hot':''}" data-line="move">${move}</span><span class="code-line indent ${hot==='check'?'hot':''}" data-line="check">${check}</span>`;
    return `<div class="code-window"><div class="code-title"><span>模拟 AI 候选程序 · 伪代码</span><span>ROVER-01</span></div><code class="code-body"><span class="code-line ${hot==='guard'?'hot':''}" data-line="guard"><span class="code-key">如果</span> 电量 &lt; ${reserve}：安全停止()</span><span class="code-line" data-line="while"><span class="code-key">只要</span> 还没到达中继点：</span>${ordered}<span class="code-line ${hot==='send'?'hot':''}" data-line="send">发送样本数据()</span></code></div>`;
  }

  function renderCold(){
    const record=log.records[0],last=record.attempts.at(-1),submitted=record.attempts.length>0;
    host.innerHTML=`<section class="ai-card"><p class="ai-kicker">01 / WRITE THE SPEC</p><h2 tabindex="-1">先说清“成功”，再看代码。</h2><p>任务控制室收到一段候选程序。模拟 AI 助手在普通地图上跑了一次，火星车顺利抵达。</p>
      <div class="mission-brief"><div class="mission-panel"><h3>火星取样任务单</h3><ul><li>把样本送到中继点。</li><li>任务途中不能损坏设备。</li><li>抵达后要有余电发送数据。</li><li>工程目标由人写进任务单，AI 不会自动知道“心里想的要求”。</li></ul></div><div class="ai-message"><div class="ai-message-head"><span>模拟 AI 助手</span><span class="ai-badge">教学情境</span></div><p>“程序已经写好，并在演示地图 A 上成功到达。是否提交正式任务？”</p><p class="ai-status"><strong>演示结果 · PASS</strong>3 步到达，剩余 2 格电量，没有遇到岩石。</p></div></div>
      ${programCode(L.baseProgram)}
      <div class="requirement-box"><h3>哪些是这次必须满足的要求？</h3><p>可以多选。没有写进要求的愿望，不能拿来判断代码对错。</p><div class="requirement-grid">${L.requirementIds.map(id=>`<button type="button" class="choice-button" data-requirement="${id}" aria-pressed="${state.requirements.includes(id)}">${esc(requirementLabels[id])}</button>`).join('')}</div></div>
      <div class="decision-box"><h3>只看这一次演示，现在应该怎么做？</h3><div class="decision-grid">${[['launch','A','演示已经成功，直接发射'],['test-first','B','换几种输入测试，再决定能不能发射'],['trust-readable','C','代码看起来顺眼，就可以相信']].map(([id,letter,label])=>`<button type="button" class="choice-button" data-decision="${id}" aria-pressed="${state.coldDecision===id}"><span class="choice-letter">${letter}</span><span>${label}</span></button>`).join('')}</div></div>
      <div class="ai-reason"><label for="cold-reason">把判断和原因绑在一起</label><textarea id="cold-reason" maxlength="900" placeholder="例如：这次演示只检查了……">${esc(state.coldReason==='暂时说不清'?'':state.coldReason)}</textarea><label class="ai-unsure"><input type="checkbox" id="cold-unsure" ${state.coldReason==='暂时说不清'?'checked':''}>我暂时说不清，先如实记下</label></div>
      <div class="ai-actions"><button type="button" class="primary" id="save-cold">${submitted?'再次检查':'封存第一次判断'}</button></div><div id="cold-status" role="status">${last&&!last.correct?'<p class="ai-status error">第一次判断已经保留。调整后可以再次检查。</p>':''}</div></section>`;
    host.querySelectorAll('[data-requirement]').forEach(button=>button.onclick=()=>{const id=button.dataset.requirement;state.requirements=state.requirements.includes(id)?state.requirements.filter(value=>value!==id):[...state.requirements,id];save();button.setAttribute('aria-pressed',String(state.requirements.includes(id)));});
    host.querySelectorAll('[data-decision]').forEach(button=>button.onclick=()=>{state.coldDecision=button.dataset.decision;save();host.querySelectorAll('[data-decision]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));});
    const reason=$('#cold-reason'),unsure=$('#cold-unsure');
    reason.oninput=()=>{if(reason.value.trim())unsure.checked=false;state.coldReason=reasonValue(reason.value,unsure.checked);save();};
    unsure.onchange=()=>{state.coldReason=reasonValue(reason.value,unsure.checked);save();};
    $('#save-cold').onclick=()=>{
      state.coldReason=reasonValue(reason.value,unsure.checked);
      const status=$('#cold-status');
      if(!state.requirements.length||!state.coldDecision||!state.coldReason){status.innerHTML='<p class="ai-status error">先选择任务要求和处理方式，再留一句原因；说不清可以如实勾选。</p>';return;}
      const grade=L.gradeCold({requirements:state.requirements,decision:state.coldDecision,reason:state.coldReason}),correct=coreTrue(grade);
      const answer=`必须要求：${state.requirements.map(id=>requirementLabels[id]).join('、')}；决定：${decisionLabels[state.coldDecision]}`;
      log.submit(0,answer,correct,state.coldReason);state.coldSaved=true;save();
      if(correct){log.finish(0,grade.reason?'写清任务要求，并说明了先测试的理由':'规格判断完成；解释暂未形成，待以后回看');render();return;}
      const notes=[];if(!grade.requirements)notes.push('任务单里有 4 条真正影响成败的要求；“最好看”“一定最短”不是本轮条件。');if(!grade.decision)notes.push('一次演示只覆盖一种输入，不能代表岩石和临界电量。');
      log.help(0,'自动反馈：任务要求或测试判断需要调整');
      status.innerHTML=`<p class="ai-status error"><strong>首次判断已保留。</strong>${notes.join('')}</p>`;
    };
    host.querySelector('h2').focus({preventScroll:true});
  }

  function gridMarkup(scenario,step,trace){
    const visited=new Set((trace||[]).map(item=>L.pointKey(item.x,item.y))),cells=[];
    for(let y=0;y<scenario.size;y++)for(let x=0;x<scenario.size;x++){
      const classes=['rover-cell'];if(scenario.rocks.some(([rx,ry])=>rx===x&&ry===y))classes.push('rock');if(x===scenario.target.x&&y===scenario.target.y)classes.push('target');if(visited.has(L.pointKey(x,y)))classes.push('trail');
      const rover=step&&step.x===x&&step.y===y?`<span class="rover" data-dir="${step.dir}" aria-hidden="true"></span>`:'';
      cells.push(`<span class="${classes.join(' ')}">${rover}</span>`);
    }
    return cells.join('');
  }
  function testCard(id){
    const scenario=L.scenarios[id],seen=state.testsSeen.includes(id),running=latestResult?.scenario===id&&!latestResultDone,result=latestResult?.scenario===id&&latestResultDone?latestResult:null;
    return `<button type="button" class="test-card ${seen?'seen':''} ${running?'running':''}" data-test="${id}" ${latestResult&&!latestResultDone?'disabled':''}><span class="test-mark">${id==='normal'?'A':id==='rock'?'B':id==='battery'?'C':'D'}</span><span><b>${esc(scenario.name.split('· ')[1])}</b><small>${esc(seen?scenario.purpose:scenario.given)}</small></span><span class="test-result ${result?(result.pass?'pass':'fail'):''}">${result?(result.pass?'通过':'暴露问题'):(running?'运行中':seen?'已运行':'运行')}</span></button>`;
  }
  function renderRover(){
    clearTimers();const record=log.records[1],grade=L.gradeRover({testsSeen:state.testsSeen,baseFailuresSeen:state.baseFailuresSeen,program:state.program,reason:state.roverReason}),verified=record.attempts.at(-1)?.correct===true&&coreTrue(grade);
    const scenario=latestResult?L.scenarios[latestResult.scenario]:L.scenarios.normal,visibleTrace=latestResult?(latestResultDone?latestResult.trace:latestResult.trace.slice(0,1)):[],step=visibleTrace.at(-1)||{...scenario.start,battery:scenario.battery};
    const patchReady=['rock','battery'].every(id=>state.baseFailuresSeen.includes(id));
    const suite=record.attempts.length?L.runSuite(state.program):[];
    host.innerHTML=`<section class="ai-card"><p class="ai-kicker">02 / TEST · DEBUG · REGRESSION</p><h2 tabindex="-1">测试不是多跑几遍，而是故意换条件。</h2><p>普通地图已经成功。现在挑能碰到“先后顺序”和“刚好卡在边界”的输入，让隐藏错误自己露出来。</p>
      <div class="concept-chain" aria-label="程序验证链"><div>任务要求</div><div>测试输入</div><div>运行候选程序</div><div>对照预期结果</div><div>修复后全部重跑</div></div>
      <div class="test-lab"><div class="test-lab-grid"><aside class="test-list"><h3>测试卡</h3><p>先跑 A 看基线，再用 B、C 挑战候选程序；运行后才会揭示每张卡在检查什么。</p>${L.scenarioIds.map(testCard).join('')}</aside><div class="rover-console"><div class="rover-console-head"><div><h3 id="active-test-title">${esc(scenario.name)}</h3><p class="ai-copy">目标：${scenario.expected==='arrive'?'抵达并留足电量':'电量不足时，出发前安全停止'}。</p></div><div class="rover-readout"><span id="rover-position">位置 ${step.x+1},${step.y+1}</span><span id="rover-direction">朝${directionNames[step.dir]}</span><span id="rover-battery">电量 ${step.battery}</span></div></div><div class="rover-stage"><div class="rover-grid" id="rover-grid" role="img" aria-label="${esc(scenario.name)}地图；目标与岩石位置见网格">${gridMarkup(scenario,step,visibleTrace)}</div><div class="trace-panel"><div id="live-code">${programCode(state.program,latestResult&&latestResultDone?latestResult.trace.at(-1)?.line:'')}</div><p class="trace-log" id="trace-log" role="status">${latestResult&&latestResultDone?`<strong>${latestResult.pass?'测试符合预期':'测试暴露问题'}：</strong>${esc(latestResult.reason)}`:'点一张测试卡，逐步观察输入、代码和结果。'}</p></div></div></div></div>
      ${patchReady?`<div class="patch-panel"><h3>修复候选程序</h3><p>不要针对某个数字打补丁。改一条规则后，要让旧的成功场景和新的失败场景一起通过。</p><div class="patch-grid"><fieldset class="patch-field"><legend>遇到岩石时，检查放在哪里？</legend><label><input type="radio" name="check-order" value="after" ${state.program.checkOrder==='after'?'checked':''}>先前进一步，再检查前方</label><label><input type="radio" name="check-order" value="before" ${state.program.checkOrder==='before'?'checked':''}>先检查前方，再决定转向或前进</label></fieldset><fieldset class="patch-field"><legend>任务结束必须留 1 格电，启动门槛是？</legend><label><input type="radio" name="reserve-rule" value="steps" ${state.program.reserveRule==='steps'?'checked':''}>电量 &lt; 预计步数</label><label><input type="radio" name="reserve-rule" value="plus-one" ${state.program.reserveRule==='plus-one'?'checked':''}>电量 &lt; 预计步数 + 1</label></fieldset></div>
        <details class="ai-hints" data-help="岩石顺序提示"><summary>卡在岩石？逐步看一条提示</summary><p>暂停在发生碰撞的那一步：此刻执行的是“前进一步”，还是“检查前方”？先后顺序本身就是算法的一部分。</p></details><details class="ai-hints" data-help="临界电量提示"><summary>卡在临界电量？看一条提示</summary><p>当电量和预计步数都是 4 时，4 &lt; 4 为假。走完后还剩多少？把“路上消耗”和“结束保留”都算进启动门槛。</p></details>
        <div class="ai-reason"><label for="rover-reason">我改了什么，为什么？</label><textarea id="rover-reason" maxlength="900" placeholder="例如：我把检查移到前进之前，因为……">${esc(state.roverReason==='暂时说不清'?'':state.roverReason)}</textarea><label class="ai-unsure"><input type="checkbox" id="rover-unsure" ${state.roverReason==='暂时说不清'?'checked':''}>我暂时说不清，先如实记下</label></div>
        ${suite.length?`<div class="suite-results">${suite.map(result=>`<div class="suite-result ${result.pass?'pass':'fail'}"><b>${esc(L.scenarios[result.scenario].name.split('· ')[0])} ${result.pass?'通过':'未通过'}</b><br>${esc(result.reason)}</div>`).join('')}</div>`:''}
        <div class="ai-actions">${verified?'<button type="button" class="primary" id="continue-transfer">完整复测通过，进入救援任务</button>':'<button type="button" class="primary" id="run-suite">运行 A—D 完整测试</button>'}</div><div id="suite-status" role="status">${record.attempts.length&&!verified?'<p class="ai-status error">修改尝试已保留；看失败的是哪条要求，再调整。</p>':''}</div></div>`:'<p class="ai-status"><strong>先别急着改代码。</strong>让 B、C 都在原候选程序中亲自露出问题，修复选项才会打开。</p>'}
      </section>`;
    host.querySelectorAll('[data-test]').forEach(button=>button.onclick=()=>runTest(button.dataset.test));
    if(patchReady){
      host.querySelectorAll('input[name=check-order]').forEach(input=>input.onchange=()=>{state.program={...state.program,checkOrder:input.value};save();latestResult=null;latestResultDone=false;renderRover();});
      host.querySelectorAll('input[name=reserve-rule]').forEach(input=>input.onchange=()=>{state.program={...state.program,reserveRule:input.value};save();latestResult=null;latestResultDone=false;renderRover();});
      const reason=$('#rover-reason'),unsure=$('#rover-unsure');reason.oninput=()=>{if(reason.value.trim())unsure.checked=false;state.roverReason=reasonValue(reason.value,unsure.checked);save();};unsure.onchange=()=>{state.roverReason=reasonValue(reason.value,unsure.checked);save();};
      F.watchHelp(host,log,1);
      if(verified)$('#continue-transfer').onclick=()=>{state.roverReason=reasonValue($('#rover-reason').value,$('#rover-unsure').checked);save();const current=L.gradeRover({testsSeen:state.testsSeen,baseFailuresSeen:state.baseFailuresSeen,program:state.program,reason:state.roverReason});if(!state.roverReason||!coreTrue(current)){renderRover();return;}log.finish(1,current.reason?(log.records[1].helps.length?'在提示或反馈后完成完整复测':'未打开提示，完成完整复测'):'操作与完整复测完成；解释暂未形成，待以后回看');render();};
      else $('#run-suite').onclick=runFullSuite;
    }
    host.querySelector('h2').focus({preventScroll:true});
  }
  function runTest(id){
    if(latestResult&&!latestResultDone)return;
    const result=L.runRover(id,state.program);latestResult=result;latestResultDone=false;
    renderRover();latestResult=result;animateResult(result,()=>completeTestObservation(result));
  }
  function completeTestObservation(result){
    latestResult=result;latestResultDone=true;
    if(L.sameProgram(state.program,L.baseProgram)&&['rock','battery'].includes(result.scenario)&&!result.pass&&!state.baseFailuresSeen.includes(result.scenario))state.baseFailuresSeen.push(result.scenario);
    if(!state.testsSeen.includes(result.scenario))state.testsSeen.push(result.scenario);
    save();log.note(1,`运行 ${L.scenarios[result.scenario].name}：${result.pass?'符合预期':'暴露问题'}；${result.reason}。`);renderRover();
  }
  function animateResult(result,onComplete){
    const scenario=L.scenarios[result.scenario],grid=$('#rover-grid'),logBox=$('#trace-log'),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const frames=reduced?[result.trace[result.trace.length-1]]:result.trace;
    frames.forEach((frame,index)=>{timers.push(setTimeout(()=>{
      const upto=reduced?result.trace:result.trace.slice(0,index+1);grid.innerHTML=gridMarkup(scenario,frame,upto);grid.setAttribute('aria-label',`${scenario.name}：${frame.message}；位置第 ${frame.x+1} 列第 ${frame.y+1} 行，朝${directionNames[frame.dir]}，电量 ${frame.battery}`);
      $('#rover-position').textContent=`位置 ${frame.x+1},${frame.y+1}`;$('#rover-direction').textContent=`朝${directionNames[frame.dir]}`;$('#rover-battery').textContent=`电量 ${frame.battery}`;logBox.textContent=frame.message;
      document.querySelectorAll('#live-code .code-line').forEach(line=>line.classList.toggle('hot',line.dataset.line===frame.line));
      if(index===frames.length-1){logBox.innerHTML=`<strong>${result.pass?'测试符合预期':'测试暴露问题'}：</strong>${esc(result.reason)}`;onComplete();}
    },reduced?0:index*360));});
  }
  function runFullSuite(){
    state.roverReason=reasonValue($('#rover-reason').value,$('#rover-unsure').checked);
    const status=$('#suite-status');
    if(!['normal','rock','battery'].every(id=>state.testsSeen.includes(id))){status.innerHTML='<p class="ai-status error">完整复测前，先亲手运行 A、B、C。测试不是看答案，而是观察哪条要求在哪个输入下失效。</p>';return;}
    if(!state.roverReason){status.innerHTML='<p class="ai-status error">留一句修改理由；暂时说不清也可以如实勾选。</p>';return;}
    const grade=L.gradeRover({testsSeen:state.testsSeen,baseFailuresSeen:state.baseFailuresSeen,program:state.program,reason:state.roverReason}),correct=coreTrue(grade),summary=`原程序已暴露：${state.baseFailuresSeen.join('、')}；检查顺序：${state.program.checkOrder==='before'?'先检查再前进':'先前进再检查'}；启动门槛：${state.program.reserveRule==='plus-one'?'预计步数+1':'预计步数'}；已运行：${state.testsSeen.join('、')}`;
    log.submit(1,summary,correct,state.roverReason);if(!correct)log.help(1,'自动反馈：完整测试未全部通过');save();renderRover();
  }

  function renderTransfer(){
    const record=log.records[2],grade=L.gradeTransfer({modelChoice:state.modelChoice,routeEnergy:state.routeEnergy,neededEnergy:state.neededEnergy,predictions:state.predictions,operator:state.transferOperator,reason:state.transferReason}),verified=record.attempts.at(-1)?.correct===true&&coreTrue(grade),attempted=record.attempts.length>0,operatorSymbol={less:'&lt;','less-equal':'≤',equal:'='}[state.transferOperator]||'[ 选择比较 ]';
    const codeModel=verified?'路线耗电 = 1 + 2 + 1':`路线指标 = ${esc(modelLabels[state.modelChoice]||'[ 先选择 ]')} = ${esc(state.routeEnergy||'[ 待计算 ]')}`,codeNeed=verified?'所需电量 = 路线耗电 + 2':`启动门槛 = ${esc(state.neededEnergy||'[ 待计算 ]')}`;
    host.innerHTML=`<section class="ai-card"><p class="ai-kicker">03 / TRANSFER</p><h2 tabindex="-1">地图不见了，只剩一张沙暴能耗表。</h2><p>救援失联探测器：普通地面每格耗电 1，沙暴地面每格耗电 2；抵达后必须保留 2 格。这里没有上一关的“预计步数”，你要自己决定程序该比较什么。</p>
      <div class="energy-route" aria-label="救援路线"><div class="terrain"><b>普通地面</b><span>耗电 1 格</span></div><div class="terrain storm"><b>沙暴地面</b><span>耗电 2 格</span></div><div class="terrain"><b>普通地面</b><span>耗电 1 格</span></div></div>
      <h3>第一步：程序应该比较什么？</h3><p class="ai-copy">选一个能代表整条路线的量。先做判断，提交前不显示公式。</p><div class="model-row" role="group" aria-label="选择路线模型">${Object.entries(modelLabels).map(([id,label])=>`<button type="button" data-model="${id}" aria-pressed="${state.modelChoice===id}">${esc(label)}</button>`).join('')}</div>
      <div class="energy-equation"><label for="route-energy">你选的这个量，数值是多少？<input id="route-energy" inputmode="numeric" maxlength="8" placeholder="填一个数" value="${esc(state.routeEnergy)}"></label><label for="needed-energy">满足本次任务，最低出发电量是多少？<input id="needed-energy" inputmode="numeric" maxlength="8" placeholder="填一个数" value="${esc(state.neededEnergy)}"></label></div>
      <h3>先预测三张相邻输入测试卡</h3><table class="prediction-table"><tbody>${L.transferCaseIds.map((id,index)=>{const item=L.transferCases[id];return `<tr><th>测试 ${String.fromCharCode(88+index)} · 当前电量 ${item.battery}</th><td><div class="prediction-choices"><button type="button" data-predict="${id}:abort" aria-pressed="${state.predictions[id]==='abort'}">安全停止</button><button type="button" data-predict="${id}:execute" aria-pressed="${state.predictions[id]==='execute'}">执行救援</button></div></td></tr>`;}).join('')}</tbody></table>
      <h3>把规则写进程序</h3><div class="code-window"><div class="code-title"><span>救援任务 · 伪代码</span><span>RESCUE-02</span></div><code class="code-body"><span class="code-line">${codeModel}</span><span class="code-line">${codeNeed}</span><span class="code-line"><span class="code-key">如果</span> 当前电量 <span class="code-value">${operatorSymbol}</span> 所需电量：安全停止()</span><span class="code-line"><span class="code-key">否则</span>：执行救援()</span></code></div>
      <div class="operator-row" role="group" aria-label="选择比较规则"><button type="button" data-operator="less" aria-pressed="${state.transferOperator==='less'}">当前电量 &lt; 所需电量</button><button type="button" data-operator="less-equal" aria-pressed="${state.transferOperator==='less-equal'}">当前电量 ≤ 所需电量</button><button type="button" data-operator="equal" aria-pressed="${state.transferOperator==='equal'}">当前电量 = 所需电量</button></div>
      <div class="ai-reason"><label for="transfer-reason">为什么“步数更少”不一定“耗电更少”？</label><textarea id="transfer-reason" maxlength="900" placeholder="把地形、每格能耗和总量连起来说。">${esc(state.transferReason==='暂时说不清'?'':state.transferReason)}</textarea><label class="ai-unsure"><input type="checkbox" id="transfer-unsure" ${state.transferReason==='暂时说不清'?'checked':''}>我暂时说不清，先如实记下</label></div>
      ${attempted?`<details class="ai-hints" data-help="沙暴能耗提示"><summary>第一次尝试后仍卡住？逐步看提示</summary><p>程序要比较的是整条路线的总耗电：1 + 2 + 1。再把任务结束时必须留下的 2 格算进启动门槛；随后检查电量 5、6、7 三个相邻输入。</p></details>`:''}
      ${attempted?`<div class="transfer-results">${L.transferCaseIds.map(id=>{const item=L.transferCases[id],actual=L.transferOutcome(item.battery,Number(state.neededEnergy),state.transferOperator),pass=actual===item.expected;return `<div class="transfer-result ${pass?'pass':'fail'}"><b>电量 ${item.battery} · ${pass?'符合预期':'与要求冲突'}</b><br>程序会${actual==='abort'?'安全停止':'执行救援'}；任务要求${item.expected==='abort'?'停止':'执行'}。</div>`;}).join('')}</div>`:''}
      <div class="ai-actions">${verified?'<button type="button" class="primary" id="finish-ai">收好任务复盘</button>':'<button type="button" class="primary" id="verify-transfer">运行三张测试卡</button>'}</div><div id="transfer-status" role="status">${attempted&&!verified?'<p class="ai-status error">首次方案已经保留。检查能耗总量、临界值和比较符号是否说的是同一条规则。</p>':''}</div>
      ${verified?'<details class="ai-hints" data-help="主任务后加速挑战"><summary>可选加速挑战：更短就更省电吗？</summary><p>路线甲走 3 格：沙暴、沙暴、普通，耗电 5；路线乙走 4 格普通地面，耗电 4。代码比较的应是能耗总量，不是只数格子。</p></details>':''}</section>`;
    host.querySelectorAll('[data-model]').forEach(button=>button.onclick=()=>{state.modelChoice=button.dataset.model;save();host.querySelectorAll('[data-model]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));});
    for(const id of ['route-energy','needed-energy'])$('#'+id).oninput=event=>{state[id==='route-energy'?'routeEnergy':'neededEnergy']=event.target.value;save();};
    host.querySelectorAll('[data-predict]').forEach(button=>button.onclick=()=>{const [id,value]=button.dataset.predict.split(':');state.predictions={...state.predictions,[id]:value};save();host.querySelectorAll(`[data-predict^="${id}:"]`).forEach(item=>item.setAttribute('aria-pressed',String(item===button)));});
    host.querySelectorAll('[data-operator]').forEach(button=>button.onclick=()=>{state.transferOperator=button.dataset.operator;save();host.querySelectorAll('[data-operator]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));host.querySelector('.code-window .code-value').textContent={less:'<','less-equal':'≤',equal:'='}[state.transferOperator];});
    const reason=$('#transfer-reason'),unsure=$('#transfer-unsure');reason.oninput=()=>{if(reason.value.trim())unsure.checked=false;state.transferReason=reasonValue(reason.value,unsure.checked);save();};unsure.onchange=()=>{state.transferReason=reasonValue(reason.value,unsure.checked);save();};
    F.watchHelp(host,log,2);
    if(verified)$('#finish-ai').onclick=()=>{state.routeEnergy=$('#route-energy').value;state.neededEnergy=$('#needed-energy').value;state.transferReason=reasonValue($('#transfer-reason').value,$('#transfer-unsure').checked);save();const current=L.gradeTransfer({modelChoice:state.modelChoice,routeEnergy:state.routeEnergy,neededEnergy:state.neededEnergy,predictions:state.predictions,operator:state.transferOperator,reason:state.transferReason});if(!state.transferReason||!coreTrue(current)){renderTransfer();return;}const helped=record.helps.some(help=>help.phase!=='完成后回看'),firstReason=L.hasReason(record.first?.explanation),independent=record.first?.correct===true&&firstReason&&!helped;let self='在提示或反馈后完成本次换情境迁移';if(!current.reason)self='客观规则与测试完成；解释暂未形成，不能据此认定独立迁移';else if(independent)self='首次无提示完成本次换情境迁移';else if(record.first?.correct===true&&!firstReason)self='客观规则首次正确；解释在提交后形成';log.finish(2,self);render();};else $('#verify-transfer').onclick=verifyTransfer;
    host.querySelector('h2').focus({preventScroll:true});
  }
  function verifyTransfer(){
    state.routeEnergy=$('#route-energy').value;state.neededEnergy=$('#needed-energy').value;state.transferReason=reasonValue($('#transfer-reason').value,$('#transfer-unsure').checked);
    const status=$('#transfer-status');
    if(!state.modelChoice||!state.routeEnergy||!state.neededEnergy||L.transferCaseIds.some(id=>!state.predictions[id])||!state.transferOperator||!state.transferReason){status.innerHTML='<p class="ai-status error">先选路线模型、填写两个数、预测三种结果、选择比较规则并留下原因。</p>';return;}
    const grade=L.gradeTransfer({modelChoice:state.modelChoice,routeEnergy:state.routeEnergy,neededEnergy:state.neededEnergy,predictions:state.predictions,operator:state.transferOperator,reason:state.transferReason}),correct=coreTrue(grade);
    const summary=`路线模型：${modelLabels[state.modelChoice]}；数值 ${state.routeEnergy}；启动至少 ${state.neededEnergy}；预测 ${L.transferCaseIds.map(id=>`${id}:${state.predictions[id]}`).join('、')}；规则 ${state.transferOperator}`;
    log.submit(2,summary,correct,state.transferReason);if(!correct)log.help(2,'自动反馈：沙暴边界测试未全部通过');save();renderTransfer();
  }

  function renderFinish(){
    $('#aicoding-sources').hidden=false;
    host.innerHTML=`<section class="ai-finish"><p class="ai-kicker">MISSION REVIEW · 本次任务收口</p><h2 tabindex="-1">AI 写得快；可靠性要靠规格和证据。</h2><div class="ai-finish-grid"><div><b>先定义正确</b>代码对不对，不看它像不像代码，而看输出是否满足写清的要求。</div><div><b>用不同输入找反例</b>普通情况、特殊情况和临界值各有作用；重复同一种输入，证据不会自动变强。</div><div><b>修复后完整复测</b>新失败场景通过后，还要重跑旧场景，防止修一处又坏一处。</div></div><div class="term-ribbon" aria-label="本课词汇"><span>输入 input</span><span>输出 output</span><span>算法 algorithm</span><span>条件 condition</span><span>循环 loop</span><span>变量 variable</span><span>错误 bug</span><span>测试 test</span></div><p class="ai-caution">本页完成只说明孩子留下了一次规格判断、一次火星车修复和一次沙暴迁移。它不能证明已经会写某种编程语言，也不能证明以后无需提示仍能独立测试 AI 代码。</p><div class="ai-finish-actions"><a class="primary" href="records.html">查看本次学习记录</a><a class="secondary" href="courses.html?group=explore">返回太空学校</a><button type="button" class="secondary" id="restart-ai">重新执行一轮（旧记录保留）</button></div>${log.html()}</section>`;
    $('#restart-ai').onclick=()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({program:L.baseProgram});save();render();};host.querySelector('h2').focus({preventScroll:true});
  }

  window.addEventListener('pagehide',clearTimers);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimers();else if(latestResult&&!latestResultDone&&log.index===1){latestResult=null;latestResultDone=false;renderRover();}});
  render();
})();
