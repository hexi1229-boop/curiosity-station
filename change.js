'use strict';
const changeQuestions=ChangeLesson.questions,changeEscape=LearningFeedback.esc;
const changeTask=document.querySelector('#change-task');
let changeLog=LearningFeedback.create(ChangeLesson.title,changeQuestions),changeIndex=changeLog.index;
function particleSvg(mode,count=4,spread=0){
  const molecules=ChangeLesson.model(mode,count,spread);
  const groups=molecules.map(m=>{
    const s=ChangeLesson.species[m.species];
    const bonds=s.bonds.map(([a,b])=>`<path d="M${s.atoms[a].x} ${s.atoms[a].y}L${s.atoms[b].x} ${s.atoms[b].y}" stroke="#8a9880" stroke-width="7" stroke-linecap="round"/>`).join('');
    const atoms=s.atoms.map(a=>`<g><circle cx="${a.x}" cy="${a.y}" r="${a.element==='O'?17:13}" fill="${a.element==='O'?'#eac8b8':'#e4ead8'}" stroke="${a.element==='O'?'#a57560':'#71866a'}" stroke-width="1.5"/><text x="${a.x}" y="${a.y+5}" font-size="15" font-weight="600" text-anchor="middle" fill="#354d40">${a.element}</text></g>`).join('');
    return `<g class="model-molecule" style="transform:translate(${m.x}px,${m.y}px)">${bonds}${atoms}</g>`;
  }).join('');
  const alt=mode==='water'?`${count}个水分子，每个含2个H和1个O。`:`${count}个氢分子，每个含2个H；${count/2}个氧分子，每个含2个O。`;
  return `<svg class="particle-model" viewBox="0 0 360 290" role="img" aria-label="${alt}"><rect x="2" y="2" width="356" height="286" rx="14" fill="#f5f5ed" stroke="#d3dccb"/>${groups}</svg>`;
}
function atomLegend(){return '<div class="atom-legend"><span><i>H</i>一个氢原子</span><span><i class="oxygen">O</i>一个氧原子</span></div>';}
function changeScene(index){
  if(index===0)return `<h2>眼睛看见的，只是气泡</h2><svg class="bubble-scene" viewBox="0 0 360 260" role="img" aria-label="示意杯中出现气泡，但气体成分未知"><path d="M85 30V216Q85 232 103 232H257Q275 232 275 216V30" fill="#f1f4e8" stroke="#78917e" stroke-width="4"/><path d="M88 108Q136 95 180 108T272 108V214Q272 229 257 229H103Q88 229 88 214Z" fill="#cee0d8"/><g fill="#fffefa" stroke="#78a99a" stroke-width="2"><circle cx="130" cy="179" r="13"/><circle cx="208" cy="154" r="17"/><circle cx="163" cy="128" r="9"/><circle cx="233" cy="102" r="11"/><circle cx="163" cy="78" r="12"/></g><text x="306" y="85" text-anchor="middle" font-size="36" fill="#a8794e">?</text></svg><p>杯中冒泡了。气体是什么、变化前后是什么物质？现在还不知道。</p><p class="source-note">情境示意图，不代表某种已确定的反应。</p>`;
  if(index===1)return `<h2>两张资料卡</h2><div class="evidence-cards"><div class="evidence-card"><b>A · 水沸腾</b>变化前：液态水<br>变化后：水蒸气<br><strong>水蒸气仍然是水。</strong></div><div class="evidence-card"><b>B · 水发生电解</b>适当条件下，水发生电解。<br>生成气体：<strong>氢气和氧气。</strong><br>它们与水是不同的物质。</div></div><p class="source-note">依据资料判断，不需要做实验。水蒸气不可见，生活中看到的白雾是小水滴。</p>`;
  if(index===2)return `<h2>颜色变浅的蓝色玻璃</h2><svg class="bubble-scene" viewBox="0 0 360 170" role="img" aria-label="蓝色玻璃磨碎后成为看起来更浅的细粉"><path d="M37 46L116 32L130 114L62 132Z" fill="#5b89a0"/><path d="M156 83H196L185 73M196 83L185 93" fill="none" stroke="#8b9a7d" stroke-width="3"/><g fill="#a8c0cb">${Array.from({length:25},(_,i)=>`<circle cx="${232+i%5*18}" cy="${50+Math.floor(i/5)*18}" r="5"/>`).join('')}</g></svg><div class="evidence-card"><b>资料明确告诉我们</b>磨成细粉后，看起来颜色变浅；<strong>检测表明没有产生新物质。</strong></div><p>先想清楚：颜色这个线索，和物质身份的证据，哪个能支持判断？</p>`;
  if(index===3)return `<h2>这次，换一组数量</h2><p>变化前：6个水分子。<br>下面画的是<strong>变化后</strong>：6个氢分子、3个氧分子。</p>${particleSvg('products',6)}${atomLegend()}<p class="source-note">连在一起的一组圆球表示这里的一个分子；每个圆球表示一个原子。图中大小和间距是示意。</p>`;
  return `<h2>同一支蜡烛，两个过程</h2><div class="evidence-cards"><div class="evidence-card"><b>过程① · 熔化</b>固态蜡变成液态蜡，<strong>仍然是蜡。</strong></div><div class="evidence-card"><b>过程② · 燃烧</b>蜡与空气中的氧气发生燃烧，<strong>生成二氧化碳和水等新物质。</strong></div></div><p>请分别分析两个过程，再看能否用一个标签概括。</p>`;
}
function labMarkup(){return `<details class="change-lab" data-help="对照粒子模型"><summary>动手比较：变的是间距，还是物质？</summary><div class="change-lab-body"><div class="change-controls" aria-label="选择模型"><button id="model-boil" aria-pressed="true">水沸腾</button><button id="model-electrolysis" aria-pressed="false">水电解</button></div><div class="model-panel"><h3 id="model-label">同样的水分子</h3><div id="particle-stage"></div>${atomLegend()}</div><div id="spacing-control"><label for="particle-spacing">拉开分子间距，看看每组H、O有没有变</label><input id="particle-spacing" type="range" min="0" max="100" step="1" value="0"><p>从液态到气态，分子间平均距离增大。图只展示这个关系，不表示实际大小比例。</p></div><div id="reaction-steps" class="change-controls" hidden><button id="model-before" aria-pressed="true">看变化前</button><button id="model-after" aria-pressed="false">看变化后</button></div><p id="change-result" class="change-result" role="status"></p><p class="change-rule">模型只对照前后，不演示真实反应路径。H、O表示原子，连接的一组表示这里的分子。分子本身没有因为沸腾而变大。<br>判断依据：有没有新物质产生，而不只是有没有气泡。</p></div></details>`;}
function bindLab(){
  let mode='boil',after=false;
  const range=document.querySelector('#particle-spacing');
  function draw(){
    const product=mode==='electrolysis'&&after;
    document.querySelector('#particle-stage').innerHTML=particleSvg(product?'products':'water',4,mode==='boil'?Number(range.value):55);
    document.querySelector('#model-label').textContent=mode==='boil'?'还是同样的水分子':after?'变化后：氢分子、氧分子':'变化前：水分子';
    document.querySelector('#spacing-control').hidden=mode!=='boil';document.querySelector('#reaction-steps').hidden=mode==='boil';
    document.querySelector('#model-boil').setAttribute('aria-pressed',String(mode==='boil'));document.querySelector('#model-electrolysis').setAttribute('aria-pressed',String(mode==='electrolysis'));
    document.querySelector('#model-before').setAttribute('aria-pressed',String(!after));document.querySelector('#model-after').setAttribute('aria-pressed',String(after));
    document.querySelector('#change-result').textContent=mode==='boil'?'不管怎样拉开，每组仍是1个O连着2个H，水分子没有变成其他分子。水蒸气仍是水，沸腾是物理变化。':after?'水分子变成氢分子和氧分子：形成了新物质。原子重新组合，H仍有8个，O仍有4个。':'这里画了4个水分子，共8个H、4个O。点“看变化后”，比较它们怎样组合。';
  }
  range.addEventListener('input',()=>{changeLog.help(changeIndex,'改变水分子间距');const molecules=ChangeLesson.model('water',4,Number(range.value));document.querySelectorAll('#particle-stage .model-molecule').forEach((g,i)=>g.style.transform=`translate(${molecules[i].x}px,${molecules[i].y}px)`);});
  document.querySelector('#model-boil').onclick=()=>{mode='boil';changeLog.help(changeIndex,'比较水沸腾模型');draw();};
  document.querySelector('#model-electrolysis').onclick=()=>{mode='electrolysis';changeLog.help(changeIndex,'比较水电解模型');draw();};
  document.querySelector('#model-before').onclick=()=>{after=false;changeLog.help(changeIndex,'查看反应前模型');draw();};
  document.querySelector('#model-after').onclick=()=>{after=true;changeLog.help(changeIndex,'查看反应后模型');draw();};draw();
}

function renderChange(focus=false){
  document.querySelector('#change-progress').textContent=changeIndex===5?'5 题完成':`第 ${changeIndex+1} / 5 题`;
  document.querySelector('#change-dots').innerHTML=changeQuestions.map((_,i)=>`<i class="${changeLog.records[i].done?'done':''} ${i===changeIndex?'current':''}"></i>`).join('');
  if(changeIndex===5){finishChange();return;}
  const q=changeQuestions[changeIndex],r=changeLog.records[changeIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${changeEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="change-answer">留下你的理由或关键步骤</label><textarea id="change-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话或几个算式就好。"></textarea><label class="reason-unsure"><input id="change-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`<label for="change-number">${q.label}</label><div class="number-answer"><input id="change-number" inputmode="decimal" autocomplete="off" maxlength="30"><span>${q.unit}</span></div>`;
  changeTask.innerHTML=`<div class="change-layout"><article class="matter-card">${changeScene(changeIndex)}</article><section class="reading-work change-work"><p class="skill-label">${q.skill}</p><h2 id="change-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-change">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="change-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="change-method">暂时不会，看看方法</button>':''}<div id="change-review" hidden></div><div id="change-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-change" disabled>${changeIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#change-message'),submit=document.querySelector('#submit-change'),next=document.querySelector('#next-change');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(changeIndex!==0||document.querySelector('.change-lab'))return;document.querySelector('#change-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.change-lab');details.addEventListener('toggle',()=>{if(details.open)changeLog.help(changeIndex,'对照粒子模型');});}
  function finishClosed(){changeTask.querySelectorAll('[data-choice],#change-number,#submit-change,#change-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#change-answer').value.trim();if(!text&&!document.querySelector('#change-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#change-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)changeLog.submit(changeIndex,answer,null,answer);changeLog.finish(changeIndex,button.dataset.self);changeTask.querySelectorAll('textarea,input,#submit-change,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  changeTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);changeTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)changeLog.submit(changeIndex,answer,null,answer);if(first)changeLog.help(changeIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#change-number').value;const value=ChangeLesson.numberValue(raw);if(value===null){say('这里填一个数字就好，例如 2。',true);return;}answer=raw.trim()+' '+q.unit;correct=value===q.answer;}
    changeLog.submit(changeIndex,answer,correct);if(correct){changeLog.finish(changeIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(changeIndex===0)showLab();}
  };
  if(!open)document.querySelector('#change-method').onclick=()=>{if(!r.first)changeLog.submit(changeIndex,'暂时不会，选择查看方法',false);changeLog.help(changeIndex,'查看本题方法');changeLog.finish(changeIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(changeTask,changeLog,changeIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{changeIndex++;renderChange(true);};
  if(focus){document.querySelector('#change-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishChange(){
  changeTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>别只盯着现象，追问变化前后是什么物质。</p><div class="change-finish-steps"><span>说清具体过程</span><span>找变化前后物质</span><span>用证据判断</span></div><p>冒泡、变色、发光等都是线索。判断物理变化还是化学变化，要看有没有新物质产生；同一场景也可能包含不同过程。</p><p class="finish-note">3题核对了判断或数值，2题保留了理由与自检。下次看到一个变化，先问：我知道发生了什么，还是只看到了一个现象？</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-change">重新练这5题（保留旧记录）</button></section>${changeLog.html()}`;
  document.querySelector('#restart-change').onclick=()=>{changeLog=LearningFeedback.create(ChangeLesson.title,changeQuestions,true);changeLog.save();changeIndex=0;renderChange(true);};changeTask.querySelector('h2').focus({preventScroll:true});
}
renderChange();
