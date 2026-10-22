'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='purity'))LearningFeedback.courses.push(['purity',PurityLesson.title,'purity.html']);
const purityQuestions=PurityLesson.questions,purityEscape=LearningFeedback.esc;
const purityTask=document.querySelector('#purity-task');
let purityLog=LearningFeedback.create(PurityLesson.title,purityQuestions),purityIndex=purityLog.index;
function cupsMarkup(){return `<div class="sample-cups" role="img" aria-label="A杯和B杯中的液体外观相同，都透明无色，成分未知"><div><div class="sample-cup"><i></i></div><b>A杯</b></div><div><div class="sample-cup"><i></i></div><b>B杯</b></div></div>`;}
function purityScene(index){
 if(index===0)return `<p class="scene-kicker">样品鉴定员的第一关</p><h2>看起来一样，<br>里面也一样吗？</h2>${cupsMarkup()}<p>你手里只有一条信息：<b>都透明无色。</b></p><p class="source-note">先作判断，再解锁成分模型。</p>`;
 if(index===1)return `<p class="scene-kicker">4张成分卡</p><h2>给样品找到合适的抽屉</h2><div class="purity-facts"><p><b>纯净物</b>由一种物质组成</p><p><b>混合物</b>由两种或更多物质组成</p></div><p>先看“含有什么”，再作判断。气体、液体、固体都可能是纯净物，也都可能是混合物。</p>`;
 if(index===2)return `<p class="scene-kicker">杯中只含水，没有其他成分</p><h2>“冰 + 水”<br>要数状态，还是数物质？</h2><div class="ice-cup" role="img" aria-label="一杯液态水中有冰块，题目给定全部成分只有水"><span>冰</span><b>液态水</b></div><p class="source-note">这是题目明确给定的纯水样品；不额外加入其他杂质的假设。</p>`;
 if(index===3)return `<p class="scene-kicker">每一对相连小球 = 1个分子</p><h2>先看完整的分子</h2><svg class="ab-model" viewBox="0 0 300 190" role="img" aria-label="6个相同的AB分子，每个由一个A原子与一个B原子相连构成">${Array.from({length:6},(_,i)=>`<g transform="translate(${40+(i%3)*92},${48+Math.floor(i/3)*88})"><path d="M0 0H28"/><circle r="17"/><circle cx="28" r="17" class="atom-b"/><text text-anchor="middle" y="5">A</text><text text-anchor="middle" x="28" y="5">B</text></g>`).join('')}</svg><p>A、B的颜色区分原子种类；相连的两个球属于同一个分子。</p>`;
 return `<p class="scene-kicker">检验报告只写了这些</p><h2>结论不能跑到证据前面</h2><div class="purity-facts"><p><b>甲 · 成分已给出</b>水 + 已完全溶解的食盐</p><p><b>乙 · 只有处理与外观记录</b>普通滤纸过滤后透明无色</p></div><p>允许写“还不能确定”，但要说明缺少哪类信息。</p>`;
}
function labMarkup(){return `<details class="purity-lab" data-help="查看成分模型"><summary>动手验证：透明的水里，加一点蔗糖</summary><div class="purity-lab-body"><p>只改变蔗糖量，假定完全溶解、不发生化学反应。两种情况都可以透明无色。</p><label for="purity-sugar">示意图中蔗糖分子个数 <output id="purity-sugar-label"></output></label><input id="purity-sugar" type="range" min="0" max="3" step="1" value="0"><svg id="purity-model" viewBox="0 0 303 212" role="img">${PurityLesson.model().particles.map(p=>`<g data-particle="${p.id}" class="model-particle ${p.kind==='S'?'sugar':''}">${p.kind==='W'?'<circle r="17"/>':'<path d="M-19 0L-10-17H10L19 0L10 17H-10Z"/>'}<text text-anchor="middle" y="5">${p.kind}</text></g>`).join('')}</svg><div class="model-legend"><span>● W：一个水分子</span><span>⬡ S：一个蔗糖分子</span></div><button class="secondary" id="purity-shuffle">换一个排列</button><p id="purity-model-result" role="status"></p><p class="model-note">这里只画少量代表，数量、大小和间隔不是实际比例。W、S是本图标记，不是化学式；每个图形代表整个分子。物质也可由原子、离子等构成，不能对所有物质都机械数“分子种类”。</p></div></details>`;}
function bindLab(){
 const cp=purityLog.checkpoint;let sugar=cp.puritySugar??0,layout=cp.purityLayout??0;
 try{PurityLesson.model(sugar,layout);}catch{sugar=0;layout=0;}
 const slider=document.querySelector('#purity-sugar'),svg=document.querySelector('#purity-model');
 function draw(){const m=PurityLesson.model(sugar,layout);slider.value=sugar;document.querySelector('#purity-sugar-label').textContent=sugar;svg.setAttribute('aria-label',`示意图：9个水分子、${sugar}个蔗糖分子；${m.kinds}种物质，${m.classification}`);m.particles.forEach(p=>{const g=svg.querySelector(`[data-particle="${p.id}"]`);g.style.transform=`translate(${p.x}px,${p.y}px)`;g.style.opacity=p.visible?'1':'0';});document.querySelector('#purity-model-result').innerHTML=`图中共 <b>${m.total}</b> 个代表分子，属于 <b>${m.kinds}</b> 种物质 → <b>${m.classification}</b>。<br>${sugar===0?'只有水；水分子不止一个，但物质只有一种。':'水和蔗糖都在。继续增加蔗糖，只改变数量，并没有增加第三种物质。'}`;}
 function update(){purityLog.point({puritySugar:sugar,purityLayout:layout});purityLog.draft(purityIndex,{'purity-sugar':String(sugar)});purityLog.help(purityIndex,'操作成分模型');draw();}
 slider.oninput=()=>{sugar=Number(slider.value);update();};document.querySelector('#purity-shuffle').onclick=()=>{layout=1-layout;update();};draw();
}
function classificationMarkup(a){return `<div class="classification-board">${PurityLesson.samples.map((s,i)=>`<section class="sample-card"><h3>${purityEscape(s.name)}</h3><p>${purityEscape(s.composition)}</p><div role="group" aria-label="${purityEscape(s.name)}的分类">${PurityLesson.labels.map((label,j)=>`<button data-sample="${i}" data-classification="${j}" aria-pressed="${a[i]===j}">${label}</button>`).join('')}</div></section>`).join('')}</div>`;}
function renderPurity(focus=false){
  document.querySelector('#purity-progress').textContent=purityIndex===5?'5 题完成':`第 ${purityIndex+1} / 5 题`;
  document.querySelector('#purity-dots').innerHTML=purityQuestions.map((_,i)=>`<i class="${purityLog.records[i].done?'done':''} ${i===purityIndex?'current':''}"></i>`).join('');
  if(purityIndex===5){finishPurity();return;}
  const q=purityQuestions[purityIndex],r=purityLog.records[purityIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  let assignments=PurityLesson.validAssignments(r.draft?.$classification)?[...r.draft.$classification]:[null,null,null,null];
  const entry=open?'<label for="purity-answer">用自己的话，留下你的解释</label><textarea id="purity-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="purity-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':q.kind==='classify'?classificationMarkup(assignments):`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${purityEscape(option)}</span></button>`).join('')}</div>`;
  purityTask.innerHTML=`<div class="purity-layout"><article class="purity-scene">${purityScene(purityIndex)}</article><section class="reading-work purity-work"><p class="skill-label">${q.skill}</p><h2 id="purity-question" tabindex="-1">${q.title}</h2><p class="purity-task-context">${purityEscape(q.context)}</p>${entry}<button class="primary" id="submit-purity">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="purity-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="purity-method">暂时不会，看看方法</button>':''}<div id="purity-review" hidden></div><div id="purity-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-purity" disabled>${purityIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#purity-message'),submit=document.querySelector('#submit-purity'),next=document.querySelector('#next-purity');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(purityIndex!==0||document.querySelector('.purity-lab'))return;document.querySelector('#purity-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.purity-lab');details.addEventListener('toggle',()=>{if(details.open)purityLog.help(purityIndex,'查看成分模型');});}
  function finishClosed(){purityTask.querySelectorAll('[data-choice],[data-sample],#submit-purity,#purity-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#purity-answer').value.trim();if(!text&&!document.querySelector('#purity-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#purity-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)purityLog.submit(purityIndex,answer,null,answer);purityLog.finish(purityIndex,button.dataset.self);purityTask.querySelectorAll('textarea,input,#submit-purity,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  purityTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);purityTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  purityTask.querySelectorAll('[data-sample]').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.sample);assignments[i]=Number(button.dataset.classification);purityTask.querySelectorAll(`[data-sample="${i}"]`).forEach(el=>el.setAttribute('aria-pressed',String(el===button)));purityLog.draft(purityIndex,{$classification:[...assignments],'分类草稿':PurityLesson.samples.map((s,j)=>s.name+'：'+(assignments[j]===null?'未选择':PurityLesson.labels[assignments[j]])).join('；')});});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)purityLog.submit(purityIndex,answer,null,answer);if(first)purityLog.help(purityIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='classify'){
      if(!PurityLesson.validAssignments(assignments,true)){say('还有样品没有归类。4张都选好，再一起提交。',true);return;}
      answer=PurityLesson.answerText(assignments);correct=PurityLesson.checkAssignments(assignments);
    }else{
      if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}
      answer=q.options[selected];correct=selected===q.answer;
    }
    purityLog.submit(purityIndex,answer,correct);if(correct){purityLog.finish(purityIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(purityIndex===0)showLab();}
  };
  if(!open)document.querySelector('#purity-method').onclick=()=>{if(!r.first)purityLog.submit(purityIndex,'暂时不会，选择查看方法',false);purityLog.help(purityIndex,'查看本题方法');purityLog.finish(purityIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(purityTask,purityLog,purityIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{purityIndex++;renderPurity(true);};
  if(focus){document.querySelector('#purity-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishPurity(){
  purityTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>分清物质种类，再下分类结论。</strong></p><p>纯净物只含一种物质，混合物含两种或更多物质。外观、状态数量、分子总数、原子颜色，都不能直接代替成分信息。</p><p class="finish-note">2题判断、1题分类、2题解释与迁移。参考后的自检不等于独立掌握；以后遇到新样品，要先找成分证据；缺少证据时，说明还需要知道什么。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-purity">重新练这5题（保留旧记录）</button></section>${purityLog.html()}`;
  document.querySelector('#restart-purity').onclick=()=>{purityLog=LearningFeedback.create(PurityLesson.title,purityQuestions,true);purityLog.save();purityIndex=0;renderPurity(true);};purityTask.querySelector('h2').focus({preventScroll:true});
}
renderPurity();
