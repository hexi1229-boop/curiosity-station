'use strict';
(function(){
  const host=document.querySelector('#equation-task');
  const sources=document.querySelector('#equation-sources');
  const L=window.EquationLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p></section>';return;}
  const registered=F.courses.find(course=>course[0]===L.id);
  if(registered){registered[1]=L.title;registered[2]='equation.html';}

  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  let state=L.sanitizeState(log.checkpoint.equation);
  state.labAttempted=state.labAttempted&&!!log.records[1]?.attempts?.length;
  state.transferAttempted=state.transferAttempted&&!!log.records[2]?.attempts?.length;
  function save(){log.point({equation:state});}
  function answerText(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function message(value,error=false){const box=host.querySelector('#equation-message');if(box){box.textContent=value;box.dataset.error=String(error);}}
  function progress(){
    document.querySelectorAll('.parallel-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',index<log.index);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){requestAnimationFrame(()=>{const heading=host.querySelector('h2');if(heading){heading.focus();heading.scrollIntoView({block:'start'});}});}
  function card(label,title,body,actions=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<p class="parallel-error" id="equation-message" role="status" aria-live="polite"></p>'+actions+'</section>';
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
    const claims='<div class="equation-claims" role="group" aria-label="选择仍只让同一个x成立的改写">'+L.coldClaims.map(item=>'<button type="button" class="equation-claim" data-cold="'+item.id+'" aria-pressed="'+String(state.coldChoices.includes(item.id))+'">'+item.formula+'</button>').join('')+'</div>';
    const body='<p class="parallel-lead">原方程 <b>2x＋6＝20</b> 最后只有一个答案。下面哪些式子可以替代它，继续寻找<strong>同一个 x</strong>？可以多选。</p><div class="equation-seed"><p>原方程</p><strong>2x＋6＝20</strong></div>'+claims+reason('cold','先留一句判断依据。',state.coldReason,state.coldUnsure,'例如：我认为……仍是同一个问题，因为……。')+'<p class="identity-note">现在不看天秤和规则。首答会原样保留，本环节不自动显示正确项。</p>';
    host.innerHTML=card('环节一 · 冷判断','等式换了样子，问题还是原来那个吗？',body,'<button class="primary" id="cold-submit">封存首答，打开操作台 →</button>');
    host.querySelectorAll('[data-cold]').forEach(button=>button.onclick=()=>{const id=button.dataset.cold;state.coldChoices=state.coldChoices.includes(id)?state.coldChoices.filter(value=>value!==id):[...state.coldChoices,id];button.setAttribute('aria-pressed',String(state.coldChoices.includes(id)));save();});
    bindReason('cold','coldReason','coldUnsure');
    host.querySelector('#cold-submit').onclick=()=>{
      if(!state.coldChoices.length){message('至少选择一个你认为能替代原方程的式子。',true);return;}
      const why=answerText(state.coldReason,state.coldUnsure);if(!why){message('先留一句理由；暂时说不清也可以如实勾选。',true);return;}
      const selected=state.coldChoices.map(id=>L.coldClaims.find(item=>item.id===id)?.formula||id);
      log.submit(0,selected.join('；'),null,why);
      log.note(0,'首答在规则、天秤与提示出现前封存；本环节未即时判分。');
      log.finish(0,'冷判断已封存；未自动判分');render(true);
    };
  }

  const actionLabels={minus6:'两边都减6',divide2:'两边整体除以2',minus3:'两边都减3','left-only':'只让左边减6',times0:'两边都乘0',reset:'回到原方程'};
  const pathLabels={'minus6-divide2':'两边先减6，再整体除以2','divide2-minus3':'两边先整体除以2，再减3'};
  const zeroLabels={'information-lost':'0＝0允许任何x，原答案信息丢失','still-seven':'认为0＝0仍只代表x＝7','false-equality':'认为0＝0本身不成立'};
  function actionButtons(){
    let actions=[];
    if(['broken','zero'].includes(state.labView))actions=['reset'];
    else if(state.labNode==='start')actions=['minus6','divide2','left-only','times0'];
    else if(state.labNode==='minus6')actions=['divide2','reset'];
    else if(state.labNode==='divide2')actions=['minus3','reset'];
    else actions=['reset'];
    return '<div class="operation-grid" aria-label="等式操作按钮">'+actions.map(action=>'<button type="button" data-operation="'+action+'" class="'+(['left-only','times0'].includes(action)?'secondary-operation ':'')+(action==='reset'?'reset-operation':'')+'">'+actionLabels[action]+'</button>').join('')+'</div>';
  }
  function balanceMarkup(){
    const view=L.labStates[state.labView]||L.labStates[state.labNode]||L.labStates.start;
    const tokens=values=>values.map(value=>'<span class="balance-token">'+esc(value)+'</span>').join('');
    return '<section class="balance-lab"><div class="balance-lab-head"><div><h3>等式操作台</h3><p>目标不是只让天秤看起来平，而是让改写前后保留同一个答案。</p></div><output>'+view.formula+'</output></div><div class="balance-visual" role="img" aria-label="'+esc(view.caption)+'" style="--tilt:'+(view.tilt||0)+'deg"><div class="balance-stand"></div><div class="balance-beam"></div><div class="balance-side left"><span class="balance-rope"></span><div class="balance-pan">'+tokens(view.left)+'</div></div><div class="balance-side right"><span class="balance-rope"></span><div class="balance-pan">'+tokens(view.right)+'</div></div></div><p class="balance-caption" data-view="'+state.labView+'">'+esc(view.caption)+'</p>'+actionButtons()+'</section>';
  }
  function labFeedback(){
    if(!state.labAttempted)return '';
    const result=L.gradeLab(state),notes=[];
    if(!result.path)notes.push('先在操作台完成一条路线：两边同减6再同除2，或两边整体同除2再同减3。');
    if(!result.zero)notes.push('两边乘0会得到真的0＝0，但所有x都能通过；它丢掉了原方程只有x＝7这一信息。');
    if(!result.check)notes.push('把x＝7代回原方程：2×7＋6＝20，所以左边算得20。');
    return '<div class="equation-feedback '+(notes.length?'':'equation-success')+'">'+(notes.length?notes.map(note=>'<p>'+esc(note)+'</p>').join(''):'可逆路线、乘0边界和代回检查已经互相对应。')+'</div>';
  }
  function renderLab(){
    const zeroChoices=[
      ['still-seven','可以，因为两边做了同样的事，所以0＝0仍然只代表x＝7'],
      ['information-lost','不可以；0＝0让任何x都成立，原来的唯一答案丢失了'],
      ['false-equality','不可以，因为0＝0本身是错误的等式']
    ];
    const zero='<section class="zero-check"><h3>边界检查：两边同时乘0，能继续代替原方程吗？</h3><p>这里问的不是“0＝0真不真”，而是它是否仍只保留原方程的答案。</p><div class="zero-grid" role="group" aria-label="判断两边乘零是否保留原方程答案">'+zeroChoices.map(item=>'<button type="button" data-zero="'+item[0]+'" aria-pressed="'+String(state.zeroChoice===item[0])+'">'+item[1]+'</button>').join('')+'</div></section>';
    const hint=state.labAttempted?'<details class="parallel-help" data-help="等式操作提示"><summary>首次提交后仍卡住，给我一条提示</summary><p>想保留同一个答案，每一步都要能倒着走回来。减6可以用加6倒回，除以2可以用乘2倒回；乘0以后无法从0＝0找回原式。</p></details>':'';
    const body='<div class="reveal-banner"><b>现在揭题：</b>天秤会平，方程为什么也必须两边同时做？因为等号左右表示同一个量；解方程还要求每一步能反过来，保留原来的全部答案。</div><div class="equation-law"><div><b>a＝b ⇒ a＋c＝b＋c</b>两边同加或同减同一个数，关系保持；这一步总能用相反运算倒回。</div><div><b>c≠0 时才可逆</b>两边同乘或同除非零数，能保留相同答案；乘0会丢信息，除0没有定义。</div></div>'+balanceMarkup()+zero+'<div class="equation-inputs"><label for="lab-check">把 x＝7 代回原方程，左边 2×7＋6 等于多少？</label><input id="lab-check" inputmode="numeric" autocomplete="off" value="'+esc(state.checkValue)+'"></div>'+labFeedback()+reason('lab','把操作与理由连起来。',state.labReason,state.labUnsure,'例如：我对左右两边的整个式子都……，这一步还能用……倒回。')+hint+'<p class="identity-note">天秤帮助看见对应变化；一般依据仍是等式性质。代回原方程是检查，不是代替推理。</p>';
    host.innerHTML=card('环节二 · 动手验证','同一个方程，可以沿两条可逆路线走到 x＝7',body,'<button class="primary" id="lab-submit">检查路线与解释 →</button>');
    host.querySelectorAll('[data-operation]').forEach(button=>button.onclick=()=>{
      const action=button.dataset.operation,result=L.stepLab(state.labNode,action);
      state.seenActions=L.uniqueAllowed([...state.seenActions,action],['minus6','divide2','minus3','left-only','times0','reset']);
      state.labNode=result.node;state.labView=result.view;if(result.path)state.labPath=result.path;save();render();
    });
    host.querySelectorAll('[data-zero]').forEach(button=>button.onclick=()=>{state.zeroChoice=button.dataset.zero;host.querySelectorAll('[data-zero]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    host.querySelector('#lab-check').oninput=event=>{state.checkValue=event.target.value.slice(0,20);save();};
    bindReason('lab','labReason','labUnsure');bindHelp(1);
    host.querySelector('#lab-submit').onclick=()=>{
      if(!state.labPath||!state.zeroChoice||!String(state.checkValue).trim()){message('先完成一条操作路线，再完成乘0判断和代回检查。',true);return;}
      const why=answerText(state.labReason,state.labUnsure);if(!why){message('留一句自己的解释；暂时说不清也可以如实勾选。',true);return;}
      const result=L.gradeLab(state),correct=Object.values(result).every(Boolean);
      log.submit(1,'路线：'+pathLabels[state.labPath]+'；尝试过：'+state.seenActions.map(action=>actionLabels[action]).join('、')+'；乘0判断：'+zeroLabels[state.zeroChoice]+'；代回左边：'+state.checkValue,correct,why);
      state.labAttempted=true;save();
      if(!correct){log.help(1,'自动反馈：可逆操作、乘0边界或代回检查');render();return;}
      log.note(1,'完成路线：'+pathLabels[state.labPath]+'。开放解释保留原话，不按关键词自动判分。');
      log.finish(1,(log.records[1].helps.some(help=>help.phase!=='完成后回看')?'使用过提示或自动反馈；':'未打开提示；')+'完成等式操作台');render(true);
    };
  }

  function optionGroup(items,key,attribute,label,textKey='formula',extraClass=''){
    return '<div class="formula-grid '+extraClass+'" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" '+attribute+'="'+item.id+'" aria-pressed="'+String(state[key]===item.id)+'">'+item[textKey]+'</button>').join('')+'</div>';
  }
  function transferFeedback(){
    if(!state.transferAttempted)return '';
    const result=L.gradeTransfer(state),notes=[];
    if(!result.model)notes.push('固定说明文件只出现一次，是4 MB；3个图像文件各是m MB，所以总量是3m＋4。');
    if(!result.chain)notes.push('先让两边同时减4，得到3m＝21；再让两边同时除以非零数3。');
    if(!result.result)notes.push('3m＝21，所以m＝7；答案要表示每个图像文件的大小。');
    if(!result.check)notes.push('代回原清单：3×7＋4＝25，因此检查结果应是25 MB。');
    if(!result.reason)notes.push('关键不是“数字过河”，而是每一步都对左右两个完整式子做同一个可逆运算。');
    return '<div class="equation-feedback '+(notes.length?'':'equation-success')+'">'+(notes.length?notes.map(note=>'<p>'+esc(note)+'</p>').join(''):'建模、操作链、答案和原式检查已经互相对应。')+'</div>';
  }
  function renderTransfer(){
    const hint=state.transferAttempted?'<details class="parallel-help" data-help="数据包方程提示"><summary>首次提交后仍卡住，再看一条提示</summary><p>先把固定的4 MB从总量两边同时减掉，剩下21 MB正好对应3个同样大的图像文件。</p></details>':'';
    const scene='<div class="packet-scene"><article class="packet-card parts"><b>数据包组成</b><strong>3 个图像文件</strong><p>每个大小相同，记作 m MB；另有一份固定说明文件4 MB。</p></article><article class="packet-card total"><b>传输日志</b><strong>总计 25 MB</strong><p>没有压缩、重复文件或其他数据。</p></article></div>';
    const work='<section class="formula-section"><h3>1. 哪个方程对应这份清单？</h3>'+optionGroup(L.transferModels,'model','data-model','数据包清单的方程')+'</section><section class="formula-section"><h3>2. 哪条操作链能保持同一个答案？</h3>'+optionGroup(L.transferChains,'chain','data-chain','解数据包方程的操作链','text','chain-grid')+'</section><div class="answer-row"><label for="result-value">每个图像文件多大（MB）？</label><input id="result-value" inputmode="numeric" autocomplete="off" value="'+esc(state.resultValue)+'"><label for="transfer-check">代回原清单得到总量（MB）</label><input id="transfer-check" inputmode="numeric" autocomplete="off" value="'+esc(state.transferCheck)+'"></div><section class="formula-section"><h3>3. 哪句话说明了这些步骤为什么成立？</h3><div class="reason-grid" role="group" aria-label="选择方程变形的一般理由">'+L.transferReasons.map(item=>'<button type="button" data-transfer-reason="'+item.id+'" aria-pressed="'+String(state.reason===item.id)+'">'+item.text+'</button>').join('')+'</div></section>';
    const body='<p class="parallel-lead">这次撤掉天秤，也不把方程预先写好。先从一份数据包清单找出相等关系，再选择每一步的依据。</p>'+scene+work+transferFeedback()+reason('transfer','用自己的话解释：为什么“把＋4移到右边变－4”只是简写？',state.transferExplanation,state.transferUnsure,'因为完整写出来，其实是等号两边都……。')+hint+'<p class="identity-note">最后答案正确不代表中间步骤自动正确；操作对象、非零条件和代回原关系都要对应。</p>';
    host.innerHTML=card('环节三 · 独立迁移','没有天秤图，还能守住同一个相等关系吗？',body,'<button class="primary" id="transfer-submit">封存数据包质检 →</button>');
    for(const [selector,key,dataset] of [['[data-model]','model','model'],['[data-chain]','chain','chain'],['[data-transfer-reason]','reason','transferReason']])host.querySelectorAll(selector).forEach(button=>button.onclick=()=>{state[key]=button.dataset[dataset];host.querySelectorAll(selector).forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    host.querySelector('#result-value').oninput=event=>{state.resultValue=event.target.value.slice(0,20);save();};
    host.querySelector('#transfer-check').oninput=event=>{state.transferCheck=event.target.value.slice(0,20);save();};
    bindReason('transfer','transferExplanation','transferUnsure');bindHelp(2);
    host.querySelector('#transfer-submit').onclick=()=>{
      if(!state.model||!state.chain||!String(state.resultValue).trim()||!String(state.transferCheck).trim()||!state.reason){message('建模、操作链、答案、代回检查和一般理由都要先完成。',true);return;}
      const why=answerText(state.transferExplanation,state.transferUnsure);if(!why){message('留一句自己的解释；暂时说不清也可以如实勾选。',true);return;}
      const result=L.gradeTransfer(state),correct=Object.values(result).every(Boolean);
      const model=L.transferModels.find(item=>item.id===state.model)?.formula||state.model,chain=L.transferChains.find(item=>item.id===state.chain)?.text||state.chain,basis=L.transferReasons.find(item=>item.id===state.reason)?.text||state.reason;
      log.submit(2,'建模：'+model+'；操作链：'+chain+'；m='+state.resultValue+' MB；代回总量：'+state.transferCheck+' MB；依据：'+basis,correct,why);
      state.transferAttempted=true;save();
      if(!correct){log.help(2,'自动反馈：建模、操作链、答案或代回检查');render();return;}
      log.note(2,'结构化迁移全部正确；开放解释保留原话，不按关键词自动判分。');
      log.finish(2,(log.records[2].helps.some(help=>help.phase!=='完成后回看')?'使用过迁移提示或自动反馈；':'未打开迁移提示；')+'完成无天秤数据包迁移');render(true);
    };
  }

  function finish(){
    if(sources)sources.hidden=false;
    const body='<p class="parallel-lead">解方程不是把数字搬过等号，而是把同一个相等关系一步步改写得更简单，同时不丢掉也不增加答案。</p><div class="equation-final"><div><b>看整个左右两边</b>每次操作都作用于等号两边的完整式子。</div><div><b>要求能倒着回来</b>加减用相反运算倒回；乘除时必须守住非零条件。</div><div><b>回到原式检查</b>把结果代回最初关系，而不是只检查中间式子。</div></div><p class="parallel-takeaway"><b>a＝b ⇒ a＋c＝b＋c</b><br><b>c≠0 时，a＝b ⇔ ac＝bc ⇔ a÷c＝b÷c</b></p><p>两边同乘0会得到真等式，却丢掉原方程的信息；除以0没有定义。天秤只是帮助看见关系，数学依据是等式性质。本页完成不等于长期掌握，之后还要换成费用、几何长度或物理公式做间隔迁移。</p><div class="parallel-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school&amp;subject=数学">返回数学课程</a><button class="secondary" id="equation-restart">重新学一轮（保留旧记录）</button></div>';
    host.innerHTML=card('M-A03 · 等式性质','每一步都保留同一个问题，答案才不会被偷偷换掉',body)+log.html();
    host.querySelector('#equation-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});save();if(sources)sources.hidden=true;render(true);};
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length)finish();else if(log.index===0)renderCold();else if(log.index===1)renderLab();else renderTransfer();
    progress();if(sources&&log.index<L.tasks.length)sources.hidden=true;if(moveFocus)focusCard();
  }
  render();
})();
