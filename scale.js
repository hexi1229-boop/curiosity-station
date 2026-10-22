'use strict';
const scales = [50,80,100,125,200];
const scaleInput = document.querySelector('#scale-slider');
const playScale = document.querySelector('#play-scale');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scaleTimer = 0;
function stopScale() {
  clearInterval(scaleTimer);
  scaleTimer = 0;
  playScale.textContent = reducedMotion ? '下一种比例尺' : '播放变化动画';
}
function updateScale(index) {
  const denominator = scales[index];
  const height = 2000 / denominator;
  scaleInput.value = index;
  scaleInput.setAttribute('aria-valuetext',`1比${denominator}`);
  document.querySelector('#ratio-value').textContent = `1 ∶ ${denominator}`;
  document.querySelector('#ratio-meaning').textContent = `模型上 1 厘米，代表实际 ${denominator} 厘米。`;
  document.querySelector('#scale-model').style.transform = `scale(${height/20})`;
  document.querySelector('#model-height-marker').style.transform = `translateY(${285-height*6}px)`;
  document.querySelector('#model-height-text').textContent = `模型 ${height} cm`;
  document.querySelector('#model-formula').textContent = `2000 ÷ ${denominator} ＝ ${height} 厘米`;
  document.querySelector('#fit-verdict').textContent = height <= 30 ? `${height} ≤ 30，可以竖直放进去。` : `${height} > 30，太高了！需要再缩小一点。`;
  document.querySelector('.scale-readout').classList.toggle('too-tall',height>30);
  document.querySelector('#model-svg-desc').textContent = `模型高${height}厘米，${height<=30?'可以':'不能'}竖直放进30厘米高的展示盒。`;
  document.querySelectorAll('[data-scale]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.scale)===index)));
}
scaleInput.oninput = () => {stopScale();updateScale(Number(scaleInput.value));};
document.querySelectorAll('[data-scale]').forEach(button=>button.onclick=()=>{stopScale();updateScale(Number(button.dataset.scale));});
playScale.onclick = () => {
  if (scaleTimer) {stopScale();return;}
  if (reducedMotion) {updateScale((Number(scaleInput.value)+1)%scales.length);return;}
  updateScale(0);
  playScale.textContent = '暂停动画';
  let index = 0;
  scaleTimer = setInterval(()=>{updateScale(++index);if(index===scales.length-1) stopScale();},1600);
};
document.addEventListener('visibilitychange',()=>{if(document.hidden) stopScale();});
window.addEventListener('pagehide',stopScale);

function showPanel(id) {
  if(id!=='quiz'&&!document.querySelector('#quiz').hidden&&questionIndex<5) feedbackLog.help(questionIndex,'回看讲解或演示');
  stopScale();
  document.querySelectorAll('.rocket-panel').forEach(panel=>panel.hidden=panel.id!==id);
  document.querySelectorAll('[data-panel]').forEach(button=>{
    const selected = button.dataset.panel === id;
    button.classList.toggle('current',selected);
    if(selected) button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
  });
  document.querySelector(`#${id} h2`).focus({preventScroll:true});
  document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});
}
document.querySelectorAll('[data-panel],[data-go]').forEach(button=>button.onclick=()=>showPanel(button.dataset.panel||button.dataset.go));

const examples = {
  forward: {task:'实际高 20 米，按 1∶100 做模型。模型高多少厘米？',steps:[['01 / 统一单位','20 米 ＝ 2000 厘米'],['02 / 实际缩小成模型，用除法','2000 ÷ 100 ＝ 20（厘米）'],['03 / 检查大小与单位','模型高 20 厘米，比实际小，能放进 30 厘米高的盒子。']]},
  reverse: {task:'模型高 20 厘米，比例尺是 1∶100。实际高多少米？',steps:[['01 / 先用相同单位计算','模型已知是 20 厘米，还原后也先得到厘米。'],['02 / 模型还原成实际，用乘法','20 × 100 ＝ 2000（厘米）'],['03 / 按题目要求换成米','2000 ÷ 100 ＝ 20（米）。注意：这次除以 100 是厘米换米。']]}
};
let direction = 'forward', revealedSteps = 1;
function drawExample() {
  const example = examples[direction];
  document.querySelector('#example-task').textContent = example.task;
  document.querySelector('#example-steps').innerHTML = example.steps.slice(0,revealedSteps).map(step=>`<li><span>${step[0]}</span>${step[1]}</li>`).join('');
  const button = document.querySelector('#reveal-step');
  button.textContent = revealedSteps===3 ? '从第 1 步再看' : `看第 ${revealedSteps+1} 步 →`;
  document.querySelectorAll('[data-direction]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.direction===direction)));
}
document.querySelector('#reveal-step').onclick = () => {revealedSteps=revealedSteps===3?1:revealedSteps+1;drawExample();};
document.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>{direction=button.dataset.direction;revealedSteps=1;drawExample();});

const questions = [
  {skill:'理解含义',title:'比例尺 1∶100，谁是 1，谁是 100？',context:'这里的比例尺表示“模型长度 ∶ 实际长度”。',kind:'choice',options:['模型 1 厘米，对应实际 100 厘米。','模型 100 厘米，对应实际 1 厘米。','模型 1 厘米，对应实际 100 米。'],answer:0,hint:'模型在前、实际在后；比的两边要用相同单位。',explanation:'对！模型 1 厘米，对应实际 100 厘米，也就是 1 米。前面的 1 代表模型，后面的 100 代表实际。'},
  {skill:'正向计算',title:'20 米高的火箭，模型做多高？',context:'按 1∶100 缩小，模型高多少厘米？先自己算一遍。',kind:'number',unit:'厘米',answer:20,hint:'先把 20 米换成厘米，再除以 100。',explanation:'20 米＝2000 厘米。2000 ÷ 100＝20 厘米。先统一单位，缩小用除法。'},
  {skill:'反向推算',title:'换个比例尺，你能还原原型吗？',context:'一枚模型高 16 厘米，比例尺是 1∶125。实际火箭高多少米？',kind:'number',unit:'米',answer:20,hint:'16 × 125 先得到厘米，再换成米。125 × 8＝1000。',explanation:'16 × 125＝2000 厘米，2000 厘米＝20 米。先用乘法还原，再换成题目要求的单位。'},
  {skill:'找出错误',title:'“20 米 ÷ 100 ＝ 0.2 厘米”，错在哪里？',context:'小航按 1∶100 做模型，他把这一步写进了设计稿。',kind:'choice',options:['缩小应该用乘法，不能用除法。','除以 100 后仍是米：0.2 米＝20 厘米。','比例尺没有单位，所以答案不用写单位。'],answer:1,hint:'一个长度除以一个没有单位的数，不会自动改变这个长度的单位。',explanation:'除法方向没错，错在把单位直接改成了厘米。20 米 ÷ 100＝0.2 米＝20 厘米。也可以先换成 2000 厘米再计算。'},
  {skill:'选择方案与说明理由',title:'既放得进去，又尽量大，你选哪个？',context:'实际高 20 米。只从下面三种方案中选一个，模型要竖直放进 30 厘米高的盒子；盒宽足够。',kind:'design',options:['1∶50，模型高 40 厘米。','1∶100，模型高 20 厘米。','1∶200，模型高 10 厘米。'],answer:1,hint:'先排除太高的，再比较剩下的两个。题目要在给定方案中选最大的。',explanation:'选 1∶100。40 厘米太高；20 厘米和 10 厘米都能放进去，其中 20 厘米更大。先检查限制，再比较可行方案。'}
];
let questionIndex = 0;
const questionBox = document.querySelector('#scale-question');
let feedbackLog=LearningFeedback.create('造一枚迷你火箭：比例尺到底怎么用？',questions);
function renderQuestion(focus=true) {
  if(questionIndex===5) {showFinish();return;}
  const q=questions[questionIndex], final=questionIndex===4;
  const number=q.kind==='number'||q.kind==='transfer';
  const inputId='scale'==='scale'?'length-answer':'scale'==='balance'?'weigh-answer':'cost-answer';
  let selected=null;
  let body=q.kind==='hands'?'<div id="practice-balance"></div>':number?`<div class="number-entry"><label for="${inputId}">填入计算结果</label><div><input id="${inputId}" inputmode="decimal" autocomplete="off"><span>${q.unit||('scale'==='balance'?'次':'任务币')}</span><button class="secondary" id="check-number">核对一下</button></div></div>`:q.kind==='speak'?'':(q.kind==='chart'?chartTable():'')+`<div class="rocket-answers">${q.options.map((option,i)=>`<button class="rocket-answer" data-answer="${i}" aria-pressed="false">${LearningFeedback.esc(option)}</button>`).join('')}</div>`;
  if(final) body+=LearningFeedback.reasonField('scale'==='balance'?'用一句话或一个算式，说明为什么更少不够、你的办法怎样做到':'scale'==='scale'?'用一句话说明：为什么选它，另外两种呢？':'留一句你的建议：选什么、为什么、还要确认什么？')+(q.kind==='speak'||q.kind==='design'?'<button class="primary" id="submit-reason">记下答案和理由，再核对</button>':'');
  questionBox.innerHTML=`<div class="rocket-question"><div class="quiz-meta"><span>第 ${questionIndex+1} / 5 题 · ${q.skill}</span><span class="quiz-dots" aria-hidden="true">${questions.map((_,i)=>`<i class="${i<=questionIndex?'active':''}"></i>`).join('')}</span></div><h3 tabindex="-1">${q.title}</h3><p class="question-context">${q.context}</p>${body}<div class="rocket-feedback" role="status" id="question-feedback"></div>${q.hint?`<details class="quiz-help" data-help="题目提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>`:''}<div id="reason-review" hidden></div><div class="quiz-next"><span>首次作答会保留；不计时、不排名。</span><button class="primary" id="next-question" disabled>${final?'查看学习反馈':'下一题'} →</button></div></div>`;
  const next=questionBox.querySelector('#next-question'),feedback=questionBox.querySelector('#question-feedback');
  LearningFeedback.watchHelp(questionBox,feedbackLog,questionIndex);
  function check(answer,correct) {
    const reason=final?LearningFeedback.readReason(questionBox):'';
    if(final&&!reason) {feedback.textContent='留一句自己的理由；暂时说不清也可以勾选如实记录。';return;}
    feedbackLog.submit(questionIndex,answer,correct,reason||'');
    feedback.textContent=correct===false?'再检查一下条件和关系。首次答案已保留，可以修改或看提示。':q.explanation||'你的原话已保留。对照参考，自检一下。';
    feedback.classList.toggle('error',correct===false);
    if(correct===false) return;
    questionBox.querySelectorAll('[data-answer],input,textarea,#check-number,#submit-reason').forEach(el=>el.disabled=true);
    if(!final) {feedbackLog.finish(questionIndex);next.disabled=false;return;}
    const review=questionBox.querySelector('#reason-review');
    review.hidden=false;
    review.innerHTML=`<div class="evidence-review"><strong>对照理由，不按关键词判分</strong><p>${q.explanation||'一种建议：回收再用，在这次 3 次飞行的模型中少花 80 任务币；还要核实回收是否可靠、检修费用和载荷要求。不同建议可以成立，但理由要符合给定条件。'}</p><div class="evidence-self"><button data-self="已说清理由">我已对照，理由说清了</button><button data-self="还需要帮助">理由还需要帮助</button></div></div>`;
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{review.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));feedbackLog.finish(questionIndex,button.dataset.self);next.disabled=false;});
    feedbackLog.help(questionIndex,'参考思路（提交后）');
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
      check(input.value.trim()+' '+(q.unit||('scale'==='balance'?'次':'任务币')),Number(value)===q.answer);
    };
    questionBox.querySelector('#check-number').onclick=checkNumber;
    input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();checkNumber();}};
  }
  if(final&&(q.kind==='design'||q.kind==='speak')) questionBox.querySelector('#submit-reason').onclick=()=>{
    if(q.kind==='design'&&selected===null) {feedback.textContent='先选一个方案，再留下理由。';return;}
    check(q.kind==='speak'?LearningFeedback.readReason(questionBox)||'':q.options[selected],q.kind==='speak'?null:selected===q.answer);
  };

  next.onclick=()=>{questionIndex++;renderQuestion();};
  if(focus) {questionBox.querySelector('h3').focus({preventScroll:true});document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});}
}
function showFinish() {
  questionBox.innerHTML = '<div class="finish-star" aria-hidden="true">✳</div><h3 class="finish-title" tabindex="-1">5 题完成，模型设计交卷！</h3><p class="question-context">5 题答案已核对；最后的设计理由由你完成表达与自检。今天可以到这里。</p><div class="takeaway"><strong>带走三个检查点</strong><p>单位一致吗？该乘还是该除？结果大小合理吗？</p></div><div class="finish-actions"><a href="./">回到小站</a><button class="text-button" id="retry-scale">重做这 5 题</button></div><details class="bonus-lab"><summary>可选彩蛋 · 长度减半，面积也减半吗？</summary><p>想一想上一课的圆和正方形。一个边长 2 厘米的正方形，面积是 4 平方厘米。边长缩成 1 厘米，面积变成 1 平方厘米。</p><div class="bonus-grid" role="img" aria-label="大正方形分成四个相等小正方形，其中一个涂成黄色。小正方形边长是大正方形的一半，面积是四分之一。"></div><p class="bonus-label">长度变成 1/2，面积变成 1/4。</p><p>圆也一样：半径减半，面积变成原来的 1/4。缩放长度与缩放面积，是两回事。</p></details>';
  questionBox.insertAdjacentHTML('beforeend',feedbackLog.html());
  questionBox.querySelector('#retry-scale').onclick=()=>{feedbackLog=LearningFeedback.create('造一枚迷你火箭：比例尺到底怎么用？',questions);questionIndex=0;renderQuestion();};
  questionBox.querySelector('h3').focus({preventScroll:true});
  document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});
}
updateScale(2);stopScale();drawExample();renderQuestion(false);
