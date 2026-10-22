'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='particle'))LearningFeedback.courses.push(['particle',ParticleLesson.title,'particle.html']);
const particleQuestions=ParticleLesson.questions,particleEscape=LearningFeedback.esc;
const particleTask=document.querySelector('#particle-task');
let particleLog=LearningFeedback.create(ParticleLesson.title,particleQuestions),particleIndex=particleLog.index;
function molecule(){return '<g class="water-shape"><path d="M-10 8L0 0L10 8" fill="none" stroke="#648f8b" stroke-width="4"/><circle r="7" fill="#b58b6a"/><circle cx="-10" cy="8" r="4.5" fill="#f2e7c8" stroke="#aa9f83"/><circle cx="10" cy="8" r="4.5" fill="#f2e7c8" stroke="#aa9f83"/></g>';}
function modelMarkup(total,key){return `<div class="water-model" data-model="${key}"><svg viewBox="0 0 360 355" role="img" aria-label="密闭框里的水分子示意，每组三个圆球表示一个水分子；拖动下方滑块比较分布"><rect x="4" y="7" width="352" height="340" rx="16" fill="#f5f9f5" stroke="#7a9d92" stroke-width="2"/><path d="M5 247H355V331Q355 347 339 347H21Q5 347 5 331Z" fill="#d7e9e0"/><text x="20" y="33" class="zone-label">气态区</text><text x="20" y="271" class="zone-label">液态区</text>${ParticleLesson.model(total,0).map(p=>`<g class="water-position" data-molecule="${p.id}" style="transform:translate(${p.x}px,${p.y}px)">${molecule()}</g>`).join('')}</svg><p class="model-key"><span class="key-dot">●</span>一个O与两个H连成的一组，表示一个水分子。</p><label for="${key}-range">拖动，改变转入气态区的数量</label><input type="range" id="${key}-range" min="0" max="${total}" step="1" value="0"><div class="model-buttons"><button type="button" data-end="0">全在液态区</button><button type="button" data-end="${total}">全在气态区</button><button type="button" data-count>显示粒子计数</button></div><p data-count-result class="count-result" role="status" hidden></p><p class="model-boundary">这是便于数清的少量粒子模型，实际有大量分子；大小、间距和位置不按真实比例。两区标记不是隔板。滑块比较不同分布，不是温度、真实时间或最终平衡的预测。</p></div>`;}
function bindModel(total,key,isTask=false){
  const box=document.querySelector(`[data-model="${key}"]`),range=box.querySelector('input');
  const saved=particleLog.checkpoint[key];let vapor=Number.isInteger(saved)&&saved>=0&&saved<=total?saved:(isTask?4:0),showCount=false;
  function draw(){const data=ParticleLesson.model(total,vapor);range.value=vapor;box.querySelectorAll('[data-molecule]').forEach((el,i)=>el.style.transform=`translate(${data[i].x}px,${data[i].y}px)`);box.querySelectorAll('[data-end]').forEach(el=>el.setAttribute('aria-pressed',String(vapor===Number(el.dataset.end))));const c=ParticleLesson.counts(total,vapor),result=box.querySelector('[data-count-result]');result.hidden=!showCount;result.textContent=`液态区 ${c.liquid} 个 ＋ 气态区 ${c.vapor} 个 ＝ 合计 ${c.total} 个水分子。每组仍是1个O、2个H。`;}
  function update(value){vapor=value;particleLog.point({[key]:vapor});particleLog.draft(particleIndex,{[range.id]:String(vapor)});if(!isTask)particleLog.help(particleIndex,'改变分子分布模型');draw();}
  range.addEventListener('input',()=>update(Number(range.value)));box.querySelectorAll('[data-end]').forEach(el=>el.onclick=()=>update(Number(el.dataset.end)));
  box.querySelector('[data-count]').onclick=()=>{showCount=!showCount;if(showCount)particleLog.help(particleIndex,'查看粒子计数');box.querySelector('[data-count]').textContent=showCount?'收起粒子计数':'显示粒子计数';draw();};draw();
}
function particleScene(index){
  if(index===0)return `<p class="scene-kicker">从一滴水出发</p><h2>看起来散开了，是什么改变了？</h2><svg class="water-hero" viewBox="0 0 360 210" role="img" aria-label="液态水与看不见的水蒸气的情境示意，问蒸发时分子怎样变化"><path d="M90 38C70 76 47 100 47 126A43 43 0 00133 126C133 101 110 74 90 38" fill="#9dc7bc"/><path d="M155 103H208L196 91M208 103L196 115" fill="none" stroke="#a48e66" stroke-width="3"/><path d="M244 148C215 122 276 96 248 68M283 148C254 122 315 96 287 68" fill="none" stroke="#a7bcb0" stroke-width="2" stroke-dasharray="5 6"/><text x="273" y="45" text-anchor="middle" fill="#9f7e4c" font-size="32">?</text><text x="90" y="190" text-anchor="middle">液态水</text><text x="272" y="190" text-anchor="middle">水蒸气（不可见）</text></svg><p>只发生蒸发，没有化学反应。先选一个解释，再打开分子模型验证。</p><p class="source-note">虚线只是气态的符号，不表示能直接看见水蒸气。</p>`;
  if(index===1)return `<p class="scene-kicker">一个都没有离开框</p><h2>先数一数，再拖动</h2><p>模型起初有9个水分子。你可以让它们在两个区域间转移，观察整个密闭框。</p>${modelMarkup(9,'particleTaskVapor')}`;
  if(index===2)return `<p class="scene-kicker">从气态回到液态</p><h2>冷表面上出现小水滴</h2><div class="water-facts"><p><b>之前</b>水蒸气，气态的水。</p><p><b>之后</b>接触较冷表面，凝结成液态小水滴。</p></div><p>有同学说：“一定是每个分子缩小了。”请指出他混淆的两个量。</p>`;
  if(index===3)return `<p class="scene-kicker">读资料，修正生活语言</p><h2>白雾不是单个分子的照片</h2><div class="water-facts"><p><b>资料①</b>水蒸气本身看不见。</p><p><b>资料②</b>水蒸气遇冷凝结形成许多小水滴，可以成为可见的白雾。</p></div><p class="source-note">一个微小水滴也包含大量水分子，不能把二者当成同一级大小。</p>`;
  return `<p class="scene-kicker">这次，边界变了</p><h2>都在蒸发，先说清数哪里</h2><div class="water-facts"><p><b>A · 密闭不漏</b>没有水进入或离开。</p><p><b>B · 敞口</b>有水蒸气净逸出，且没有其他水进入。</p></div><p>都只发生蒸发。分别数<strong>容器里面</strong>的水分子，液态和气态都算。</p><p class="source-note">B的净逸出是题目给定条件，并非所有敞口情境都必然如此。</p>`;
}
function labMarkup(){return `<details class="particle-lab" data-help="查看蒸发分子模型"><summary>动手验证：分子大了，还是站开了？</summary><div class="particle-lab-body">${modelMarkup(6,'particleLabVapor')}<p class="model-conclusion">每一组始终是一个水分子，分子本身没有被放大或拆开。转入气态后，分子间平均距离更大。液态、气态中的分子都在不断运动；这里只比较分布，不展示真实运动轨迹。</p></div></details>`;}
function bindLab(){bindModel(6,'particleLabVapor');}
function renderParticle(focus=false){
  document.querySelector('#particle-progress').textContent=particleIndex===5?'5 题完成':`第 ${particleIndex+1} / 5 题`;
  document.querySelector('#particle-dots').innerHTML=particleQuestions.map((_,i)=>`<i class="${particleLog.records[i].done?'done':''} ${i===particleIndex?'current':''}"></i>`).join('');
  if(particleIndex===5){finishParticle();return;}
  const q=particleQuestions[particleIndex],r=particleLog.records[particleIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${particleEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="particle-answer">用自己的话，留下你的解释</label><textarea id="particle-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="particle-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`<label for="particle-number">${q.label}</label><div class="number-answer"><input id="particle-number" inputmode="numeric" autocomplete="off" maxlength="30"><span>${q.unit}</span></div>`;
  particleTask.innerHTML=`<div class="particle-layout"><article class="particle-scene">${particleScene(particleIndex)}</article><section class="reading-work particle-work"><p class="skill-label">${q.skill}</p><h2 id="particle-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-particle">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="particle-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="particle-method">暂时不会，看看方法</button>':''}<div id="particle-review" hidden></div><div id="particle-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-particle" disabled>${particleIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#particle-message'),submit=document.querySelector('#submit-particle'),next=document.querySelector('#next-particle');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(particleIndex!==0||document.querySelector('.particle-lab'))return;document.querySelector('#particle-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.particle-lab');details.addEventListener('toggle',()=>{if(details.open)particleLog.help(particleIndex,'对照粒子模型');});}
  function finishClosed(){particleTask.querySelectorAll('[data-choice],#particle-number,#submit-particle,#particle-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#particle-answer').value.trim();if(!text&&!document.querySelector('#particle-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#particle-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)particleLog.submit(particleIndex,answer,null,answer);particleLog.finish(particleIndex,button.dataset.self);particleTask.querySelectorAll('textarea,input,#submit-particle,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  particleTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);particleTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)particleLog.submit(particleIndex,answer,null,answer);if(first)particleLog.help(particleIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#particle-number').value;const value=ParticleLesson.integer(raw);if(value===null){say('这里填一个非负整数，例如 2。',true);return;}answer=raw.trim()+' '+q.unit;correct=value===q.answer;}
    particleLog.submit(particleIndex,answer,correct);if(correct){particleLog.finish(particleIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(particleIndex===0)showLab();}
  };
  if(!open)document.querySelector('#particle-method').onclick=()=>{if(!r.first)particleLog.submit(particleIndex,'暂时不会，选择查看方法',false);particleLog.help(particleIndex,'查看本题方法');particleLog.finish(particleIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(particleTask,particleLog,particleIndex);
  if(particleIndex===1)bindModel(9,'particleTaskVapor',true);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{particleIndex++;renderParticle(true);};
  if(focus){document.querySelector('#particle-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishParticle(){
  particleTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>看分子本身 → 看分子间隔 → 说清计数范围。</strong></p><p>蒸发与凝结都不把水分子变大、缩小或变成其他分子。容器里数量变少，还要问：水分子是不是移到了外面？</p><p class="finish-note">2题判断、1题模型计数、2题独立解释。开放解释保留原话与修订，不自动判分；还需用新情境观察是否会迁移。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-particle">重新练这5题（保留旧记录）</button></section>${particleLog.html()}`;
  document.querySelector('#restart-particle').onclick=()=>{particleLog=LearningFeedback.create(ParticleLesson.title,particleQuestions,true);particleLog.save();particleIndex=0;renderParticle(true);};particleTask.querySelector('h2').focus({preventScroll:true});
}
renderParticle();
