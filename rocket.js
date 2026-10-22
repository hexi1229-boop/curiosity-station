'use strict';
const panelButtons = [...document.querySelectorAll('[data-panel]')];
const playButton = document.querySelector('#play-flight');
const progressInput = document.querySelector('#flight-progress');
const sceneTimes = [0.12, 0.37, 0.71, 1];
const scenes = [
  ['① 升空','一级助推器先出力，把上面一级和载荷送向高空。'],
  ['② 分离','上面一级继续完成任务；一级助推器与它分开，开始返回。'],
  ['③ 减速返回','一级助推器调整姿态，并通过发动机点火减速，准备落到平台上。'],
  ['④ 检查再用','成功着陆后，还要检查、维护和补充推进剂，才能为再次使用作准备。']
];
let animationFrame = 0;
let animationStart = 0;
let animationProgress = 0;
let shownScene = -1;
let playing = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function stopFlight() {
  cancelAnimationFrame(animationFrame);
  playing = false;
  playButton.textContent = reducedMotion ? '下一帧示意' : animationProgress >= 1 ? '再看一次' : '播放 16 秒动画';
}
function drawFlight(p) {
  animationProgress = p;
  const t = Math.min(p / 0.3, 1);
  let x = 65 + 140 * t, y = 244 - 150 * t;
  let ux = x, uy = y - 52;
  if (p > 0.3) {
    const u = Math.min((p - 0.3) / 0.55, 1);
    x = 205 + 208 * u;
    y = 94 + 150 * u * u;
    const upper = Math.min((p - 0.3) / 0.28, 1);
    ux = 205 + 245 * upper; uy = 42 - 15 * upper;
  }
  document.querySelector('#booster').setAttribute('transform', `translate(${x} ${y})`);
  document.querySelector('#upper-stage').setAttribute('transform', `translate(${ux} ${uy})`);
  document.querySelector('#upper-stage').setAttribute('opacity', p > 0.65 ? '0.35' : '1');
  document.querySelector('#engine-flame').setAttribute('opacity', p > 0 && (p < 0.3 || p > 0.62 && p < 0.85) ? '1' : '0');
  document.querySelector('#landing-legs').setAttribute('opacity', p > 0.7 ? '1' : '0');
  document.querySelector('#inspection-mark').setAttribute('opacity', p >= 0.85 ? '1' : '0');
  progressInput.value = Math.round(p * 100);
  const scene = p < 0.3 ? 0 : p < 0.48 ? 1 : p < 0.85 ? 2 : 3;
  if (scene !== shownScene) {
    shownScene = scene;
    document.querySelector('#flight-label').textContent = scenes[scene][0];
    document.querySelector('#flight-copy').textContent = scenes[scene][1];
    document.querySelectorAll('[data-scene]').forEach((button,i) => button.setAttribute('aria-pressed',String(i === scene)));
  }
}
function animateFlight(now) {
  if (!playing) return;
  drawFlight(Math.min((now - animationStart) / 16000, 1));
  if (animationProgress < 1) animationFrame = requestAnimationFrame(animateFlight);
  else stopFlight();
}
playButton.onclick = () => {
  if (reducedMotion) { drawFlight(sceneTimes[(shownScene + 1) % 4]); return; }
  if (playing) { stopFlight(); return; }
  if (animationProgress >= 1) drawFlight(0);
  playing = true; playButton.textContent = '暂停动画';
  animationStart = performance.now() - animationProgress * 16000;
  animationFrame = requestAnimationFrame(animateFlight);
};
progressInput.oninput = () => { stopFlight(); drawFlight(Number(progressInput.value)/100); stopFlight(); };
document.querySelectorAll('[data-scene]').forEach(button => button.onclick = () => { stopFlight(); drawFlight(sceneTimes[Number(button.dataset.scene)]); stopFlight(); });
function showPanel(id) {
  if(id!=='quiz'&&!document.querySelector('#quiz').hidden&&questionIndex<5) feedbackLog.help(questionIndex,'回看讲解或演示');
  stopFlight();
  for (const button of panelButtons) {
    const selected = button.dataset.panel === id;
    button.classList.toggle('current', selected);
    if (selected) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
    document.getElementById(button.dataset.panel).hidden = !selected;
  }
  const heading = document.querySelector('#' + id + '-title');
  heading.focus({preventScroll:true});
  document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});
}
panelButtons.forEach(button => button.onclick = () => showPanel(button.dataset.panel));
document.querySelectorAll('[data-go]').forEach(button => button.onclick = () => showPanel(button.dataset.go));
document.addEventListener('visibilitychange', () => { if (document.hidden) stopFlight(); });
window.addEventListener('pagehide', stopFlight);
function missionCosts(flights, repair) {
  return {newCost: (60 + 20) * flights, reuseCost: 80 + 20 * flights + repair * (flights - 1)};
}
function updateCost() {
  const n = Number(document.querySelector('#flights').value);
  const repair = Number(document.querySelector('#repair').value);
  const {newCost, reuseCost} = missionCosts(n, repair);
  const max = Math.max(newCost,reuseCost);
  document.querySelector('#flight-count').value = n;
  document.querySelector('#new-total').textContent = newCost;
  document.querySelector('#reuse-total').textContent = reuseCost;
  document.querySelector('#new-bar').style.width = newCost/max*100 + '%';
  document.querySelector('#reuse-bar').style.width = reuseCost/max*100 + '%';
  document.querySelector('#new-formula').textContent = `（制造 60 + 其他 20）× ${n} 次 = ${newCost}`;
  document.querySelector('#reuse-formula').textContent = `首次制造 80 + 其他 20 × ${n} 次 + 检修 ${repair} × ${n-1} 次 = ${reuseCost}`;
  const delta = newCost - reuseCost;
  document.querySelector('#cost-verdict').textContent = delta === 0 ? '在这些假设下，两种方案费用相同。' : `在这些假设下，${delta > 0 ? '回收再用' : '每次造新'}少花 ${Math.abs(delta)} 任务币。`;
}
document.querySelector('#flights').oninput = updateCost;
document.querySelector('#repair').onchange = updateCost;
const questions = [
  {kind:'choice',skill:'辨概念',title:'刚才动画中，哪一部分返回平台，准备再次使用？',context:'想一想：火箭分离以后，上下两部分去了哪里？',options:['一级助推器：包含发动机和箭体等硬件','整枚火箭连同载荷一起返回','已经燃烧掉的燃料'],answer:0,explanation:'对，回来的是一级助推器。上面一级继续飞行；消耗掉的推进剂还需要补充。',hint:'动画里返回的是下面那一段。'},
  {kind:'number',skill:'会计算',title:'同一个可回收一级飞 4 次，一共花多少？',context:'本题条件：首次制造 80，每次其他成本 20，每次再用前检修 10。每次均成功回收。单位都是任务币。',answer:190,explanation:'80 + 20 × 4 + 10 × 3 = 190。制造算一次；4 次飞行之间，为再次使用检修 3 次。',hint:'画 4 个点表示 4 次飞行。相邻两次之间有几段？那就是检修次数。'},
  {kind:'chart',skill:'读图表',title:'看这张图，回收再用从第几次任务起更省？',context:'每次再用前检修 10 任务币。比较同一行的两种总费用。',options:['第 1 次','第 2 次','第 3 次'],answer:1,explanation:'第 1 次是 100 对 80，回收方案更贵；到第 2 次是 130 对 160，回收方案开始更省。',hint:'先比第 1 行，再比第 2 行，找费用高低第一次交换的位置。'},
  {kind:'choice',skill:'换条件',title:'检修费涨到 70，飞 3 次，哪种方案费用更低？',context:'本题条件：每次造新一级 60；可回收一级首次制造 80；两方案每次其他成本 20；复用前检修改为 70。假设均能完成任务。',options:['回收再用，回收一定会省','每次造新','两种一样'],answer:1,explanation:'每次造新：（60 + 20）× 3 = 240。回收再用：80 + 20 × 3 + 70 × 2 = 280。这次每次造新少花 40；条件变了，结论也会变。',hint:'飞 3 次，中间检修 2 次。别把上一题的检修费 10 带进来。'},
  {kind:'speak',skill:'讲理由',title:'你来给任务团队提一个建议。',context:'现在需要飞 3 次。回到每次检修 10 的条件：每次造新共 240，回收再用共 160。你建议选什么？为什么？实施前还要确认什么？'}
];
const questionBox = document.querySelector('#rocket-question');
let questionIndex = 0;
function chartTable() {
  return `<table class="quiz-table"><caption>模拟总费用（任务币，条形长度可比较）</caption><thead><tr><th scope="col">任务次数</th><th scope="col">每次造新</th><th scope="col">回收再用</th></tr></thead><tbody>${[1,2,3].map(n=>{const c=missionCosts(n,10);return `<tr><th scope="row">${n} 次</th><td>${c.newCost}<span class="table-bar" style="--bar:${c.newCost/240*100}%" aria-hidden="true"></span></td><td>${c.reuseCost}<span class="table-bar reuse" style="--bar:${c.reuseCost/240*100}%" aria-hidden="true"></span></td></tr>`;}).join('')}</tbody></table>`;
}
let feedbackLog=LearningFeedback.create('火箭为什么要回收？',questions);
questionIndex=feedbackLog.index;
function renderQuestion(focus=true) {
  if(questionIndex===5) {showFinish();return;}
  const q=questions[questionIndex], final=questionIndex===4;
  const number=q.kind==='number'||q.kind==='transfer';
  const inputId='rocket'==='scale'?'length-answer':'rocket'==='balance'?'weigh-answer':'cost-answer';
  let selected=feedbackLog.records[questionIndex].draft?.$choice ?? null;
  let body=q.kind==='hands'?'<div id="practice-balance"></div>':number?`<div class="number-entry"><label for="${inputId}">填入计算结果</label><div><input id="${inputId}" inputmode="decimal" autocomplete="off"><span>${q.unit||('rocket'==='balance'?'次':'任务币')}</span><button class="secondary" id="check-number">核对一下</button></div></div>`:q.kind==='speak'?'':(q.kind==='chart'?chartTable():'')+`<div class="rocket-answers">${q.options.map((option,i)=>`<button class="rocket-answer" data-answer="${i}" aria-pressed="false">${LearningFeedback.esc(option)}</button>`).join('')}</div>`;
  if(final) body+=LearningFeedback.reasonField('rocket'==='balance'?'用一句话或一个算式，说明为什么更少不够、你的办法怎样做到':'rocket'==='scale'?'用一句话说明：为什么选它，另外两种呢？':'留一句你的建议：选什么、为什么、还要确认什么？')+(q.kind==='speak'||q.kind==='design'?'<button class="primary" id="submit-reason">记下答案和理由，再核对</button>':'');
  questionBox.innerHTML=`<div class="rocket-question"><div class="quiz-meta"><span>第 ${questionIndex+1} / 5 题 · ${q.skill}</span><span class="quiz-dots" aria-hidden="true">${questions.map((_,i)=>`<i class="${i<=questionIndex?'active':''}"></i>`).join('')}</span></div><h3 tabindex="-1">${q.title}</h3><p class="question-context">${q.context}</p>${body}<div class="rocket-feedback" role="status" id="question-feedback"></div>${q.hint?`<details class="quiz-help" data-help="题目提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>`:''}<div id="reason-review" hidden></div><div class="quiz-next"><span>首次作答会保留；不计时、不排名。</span><button class="primary" id="next-question" disabled>${final?'查看学习反馈':'下一题'} →</button></div></div>`;
  const next=questionBox.querySelector('#next-question'),feedback=questionBox.querySelector('#question-feedback');
  LearningFeedback.watchHelp(questionBox,feedbackLog,questionIndex);
  function check(answer,correct,restoring=false) {
    const reason=final?LearningFeedback.readReason(questionBox):'';
    if(final&&!reason) {feedback.textContent='留一句自己的理由；暂时说不清也可以勾选如实记录。';return;}
    if(!restoring) feedbackLog.submit(questionIndex,answer,correct,reason||'');
    feedback.textContent=correct===false?'再检查一下条件和关系。首次答案已保留，可以修改或看提示。':q.explanation||'你的原话已保留。对照参考，自检一下。';
    feedback.classList.toggle('error',correct===false);
    if(correct===false) return;
    questionBox.querySelectorAll('[data-answer],input,textarea,#check-number,#submit-reason').forEach(el=>el.disabled=true);
    if(!final) {feedbackLog.finish(questionIndex);next.disabled=false;return;}
    const review=questionBox.querySelector('#reason-review');
    review.hidden=false;
    review.innerHTML=`<div class="evidence-review"><strong>对照理由，不按关键词判分</strong><p>${q.explanation||'一种建议：回收再用，在这次 3 次飞行的模型中少花 80 任务币；还要核实回收是否可靠、检修费用和载荷要求。不同建议可以成立，但理由要符合给定条件。'}</p><div class="evidence-self"><button data-self="已说清理由">我已对照，理由说清了</button><button data-self="还需要帮助">理由还需要帮助</button></div></div>`;
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{review.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));feedbackLog.finish(questionIndex,button.dataset.self);next.disabled=false;});
    if(!restoring) feedbackLog.help(questionIndex,'参考思路（提交后）');
  }
  questionBox.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
    selected=Number(button.dataset.answer);
    questionBox.querySelectorAll('[data-answer]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
    if(!final) check(q.options[selected],selected===q.answer);
  });
  if(number) {
    const input=questionBox.querySelector('#'+inputId);
    const checkNumber=()=>{
      const value=input.value.trim().replace(/[０-９．]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
      if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {feedback.textContent='请先填一个数值；空白或格式错误不会计入作答。';return;}
      check(input.value.trim()+' '+(q.unit||('rocket'==='balance'?'次':'任务币')),Number(value)===q.answer);
    };
    questionBox.querySelector('#check-number').onclick=checkNumber;
    input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();checkNumber();}};
  }
  if(final&&(q.kind==='design'||q.kind==='speak')) questionBox.querySelector('#submit-reason').onclick=()=>{
    if(q.kind==='design'&&selected===null) {feedback.textContent='先选一个方案，再留下理由。';return;}
    check(q.kind==='speak'?LearningFeedback.readReason(questionBox)||'':q.options[selected],q.kind==='speak'?null:selected===q.answer);
  };

  const previous=feedbackLog.records[questionIndex].attempts.at(-1);
  if(previous&&q.kind!=='hands')check(previous.answer,previous.correct,true);
  next.onclick=()=>{questionIndex++;renderQuestion();};
  if(focus) {questionBox.querySelector('h3').focus({preventScroll:true});document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});}
}
function showFinish() {
  questionBox.innerHTML = '<div class="finish-star" aria-hidden="true">✳</div><h3 class="finish-title" tabindex="-1">5 题完成，今天就到这里。</h3><p class="question-context">前 4 题已核对，第 5 题由你完成表达与自检。</p><ul class="finish-points"><li>知道回来的是什么。</li><li>会把制造、任务和检修费用放在一起算。</li><li>条件变了，愿意重新作判断。</li></ul><div class="takeaway"><strong>带走一句话</strong><p>回收让硬件有机会多次使用；到底划不划算，要比较总费用，也要满足任务要求。</p></div><div class="finish-actions"><a href="./">回到小站</a><button class="text-button" id="retry-rocket">重做这 5 题</button></div>';
  questionBox.insertAdjacentHTML('beforeend',feedbackLog.html());
  questionBox.querySelector('#retry-rocket').onclick = () => {feedbackLog=LearningFeedback.create('火箭为什么要回收？',questions,true);feedbackLog.save();questionIndex=0;renderQuestion();};
  questionBox.querySelector('h3').focus({preventScroll:true});
  document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});
}
drawFlight(0); stopFlight(); updateCost(); renderQuestion(false);
if(feedbackLog.active)showPanel('quiz');
