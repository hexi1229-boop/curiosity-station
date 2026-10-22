import {resultFor, keepCandidates} from './balance-logic.mjs';

const fruitIds = [1,2,3,4,5,6,7,8,9];
const resultNames = {left:'左边更重',right:'右边更重',level:'两边平衡'};
const placeNames = {left:'左盘',right:'右盘',table:'桌上'};

function createBalance(root, {prefix, limit=Infinity, onSolved=()=>{}, onEvidence=()=>{}}) {
  let heavy, places, candidates, records, target, dirty, solved;
  root.innerHTML = `<div class="balance-toolbar"><strong data-count>已称 0 次</strong><button class="text-button" data-reset>重新开一局</button></div>
    <div class="balance-machine"><svg viewBox="0 0 480 270" role="img" aria-labelledby="${prefix}-title ${prefix}-desc"><title id="${prefix}-title">可操作的双盘天秤</title><desc id="${prefix}-desc">还未称量。</desc><ellipse cx="240" cy="249" rx="160" ry="9" fill="#dce3d1"/><path d="M240 104 216 240H264Z" fill="#c3cfb0" stroke="#768b66" stroke-width="2"/><rect x="194" y="237" width="92" height="10" rx="5" fill="#718665"/><path class="balance-beam" d="M84 110H396" stroke="#55734c" stroke-width="8" stroke-linecap="round"/><circle cx="240" cy="110" r="10" fill="#dfc888" stroke="#55734c" stroke-width="3"/>
      <g class="balance-pan" data-pan="left"><path d="M0 0-49 89M0 0 49 89" fill="none" stroke="#8b9c75" stroke-width="2"/><path d="M-54 89H54Q43 112 0 112T-54 89" fill="#e3ca8d" stroke="#a78945" stroke-width="2"/><g data-pan-fruits="left"></g><text x="0" y="139" text-anchor="middle" fill="#728663" font-size="13">左盘</text></g>
      <g class="balance-pan" data-pan="right"><path d="M0 0-49 89M0 0 49 89" fill="none" stroke="#8b9c75" stroke-width="2"/><path d="M-54 89H54Q43 112 0 112T-54 89" fill="#d1ddbf" stroke="#8b9f73" stroke-width="2"/><g data-pan-fruits="right"></g><text x="0" y="139" text-anchor="middle" fill="#728663" font-size="13">右盘</text></g></svg><div class="weigh-caption" data-caption aria-live="polite">先放果子，再点“称一次”。</div></div>
    <div class="placement-targets" aria-label="先选择放到哪里"><button data-target="left" aria-pressed="true">放到左盘</button><button data-target="right" aria-pressed="false">放到右盘</button><button data-target="table" aria-pressed="false">拿回桌上</button></div>
    <p class="small-note">选好位置，再点下面的果子。点已在该盘的果子可拿下；不需要拖拽。</p><div class="fruit-rack" aria-label="九个可移动的果子">${fruitIds.map(id=>`<button class="fruit-button" data-fruit="${id}" aria-label="${id}号果子，在桌上"><span class="fruit-icon" aria-hidden="true">${id}</span><small>桌上</small></button>`).join('')}</div>
    <p class="placement-summary" data-placement></p><div class="balance-actions"><button class="primary" data-weigh>称一次</button><button class="secondary" data-clear>全部拿下</button><button class="text-button" data-example>帮我摆成 3 对 3</button></div>
    <p class="balance-message" data-message role="status"></p><details class="balance-evidence"><summary>看看称量记录与候选</summary><p data-candidates></p><ol data-history></ol></details>
    <div class="guess-row"><label for="${prefix}-guess">我判断更重的是</label><select id="${prefix}-guess"><option value="">选择编号</option>${fruitIds.map(id=>`<option value="${id}">${id} 号</option>`).join('')}</select><button class="secondary" data-guess>用证据确认</button></div>`;
  const $ = selector => root.querySelector(selector);
  function message(text,error=false) { $('[data-message]').textContent=text; $('[data-message]').classList.toggle('error',error); }
  function pans(result='level') {
    const angle = result==='left' ? -7 : result==='right' ? 7 : 0;
    $('.balance-beam').style.transform=`rotate(${angle}deg)`;
    for(const [side,dx] of [['left',-156],['right',156]]) {
      const rad=angle*Math.PI/180;
      $(`[data-pan="${side}"]`).style.transform=`translate(${240+dx*Math.cos(rad)}px,${110+dx*Math.sin(rad)}px)`;
    }
  }
  function placed(side) { return fruitIds.filter(id=>places[id-1]===side); }
  function paint() {
    const left=placed('left'),right=placed('right');
    $('[data-count]').textContent=`已称 ${records.length} 次${limit===2?' / 最多 2 次':''}`;
    root.querySelectorAll('[data-target]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.target===target)));
    root.querySelectorAll('[data-fruit]').forEach(button=>{
      const id=Number(button.dataset.fruit),place=places[id-1];
      button.dataset.place=place;
      button.querySelector('small').textContent=placeNames[place];
      button.setAttribute('aria-label',`${id}号果子，在${placeNames[place]}`);
      button.classList.toggle('found',solved && id===heavy);
      button.disabled=solved;
    });
    for(const side of ['left','right']) {
      const ids=placed(side);
      $(`[data-pan-fruits="${side}"]`).innerHTML=ids.map((id,i)=>{
        const row=Math.floor(i/4),rowCount=Math.min(4,ids.length-row*4),x=(i%4-(rowCount-1)/2)*24,y=75-row*24;
        return `<g transform="translate(${x} ${y})"><circle r="11" fill="#bf7653"/><path d="M1-11q3-7 8-4" fill="none" stroke="#688854" stroke-width="3"/><text text-anchor="middle" y="4" fill="white" font-size="12">${id}</text></g>`;
      }).join('');
    }
    $('[data-placement]').textContent=`左盘 ${left.length} 个 · 右盘 ${right.length} 个 · 桌上 ${9-left.length-right.length} 个。两盘要一样多，且不能空着称。`;
    $('[data-weigh]').disabled=solved || !dirty || records.length>=limit;
    $('[data-clear]').disabled=solved;
    $('[data-reset]').disabled=solved && limit===2;
    $('[data-example]').hidden=records.length>0 || solved;
    $('[data-candidates]').textContent=`根据已有结果，还可能更重的是：${candidates.join('、')} 号（${candidates.length} 个）。`;
    $('[data-history]').innerHTML=records.map((r,i)=>`<li>第 ${i+1} 次：左 ${r.left.join('、')}；右 ${r.right.join('、')} → ${resultNames[r.result]}。</li>`).join('');
    $('[data-guess]').disabled=solved;
    $(`#${prefix}-guess`).disabled=solved;
  }
  function changed() {dirty=true;pans();$('[data-caption]').textContent='已调整摆法，还未称量。';$(`#${prefix}-desc`).textContent='摆法已调整，等待称量。';paint();}
  function reset() {
    heavy=1+Math.floor(Math.random()*9);places=Array(9).fill('table');candidates=[...fruitIds];records=[];target='left';dirty=true;solved=false;
    $(`#${prefix}-guess`).value='';pans();$('[data-caption]').textContent='先放果子，再点“称一次”。';$(`#${prefix}-desc`).textContent='还未称量。';
    message(limit===2?'挑战：用不超过 2 次称量，凭结果唯一确定更重的果子。':'先试自己的办法，也可以点“帮我摆成 3 对 3”。更重的果子不会从外观露馅。');paint();
  }
  root.querySelectorAll('[data-target]').forEach(button=>button.onclick=()=>{target=button.dataset.target;paint();});
  root.querySelectorAll('[data-fruit]').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.fruit)-1;places[i]=places[i]===target?'table':target;changed();});
  $('[data-clear]').onclick=()=>{places.fill('table');changed();};
  $('[data-example]').onclick=()=>{onEvidence('help','自动摆成 3 对 3');places=['left','left','left','right','right','right','table','table','table'];changed();};
  $('[data-reset]').onclick=()=>{onEvidence('reset');reset();};
  $('.balance-evidence').addEventListener('toggle',()=>{if($('.balance-evidence').open) onEvidence('help','称量记录与候选');});
  $('[data-weigh]').onclick=()=>{
    const left=placed('left'),right=placed('right');
    if(!left.length || left.length!==right.length) {message('这次不计数：请在左右两盘放一样多个果子，且至少各放 1 个。',true);return;}
    const result=resultFor(left,right,heavy);
    candidates=keepCandidates(candidates,left,right,result);records.push({left,right,result});dirty=false;pans(result);
    const caption=`第 ${records.length} 次：${resultNames[result]}${result==='level'?'。':'，更重的一盘向下。'}`;
    $('[data-caption]').textContent=caption;$(`#${prefix}-desc`).textContent=caption;
    if(candidates.length===1) message('已有证据能唯一确定了！选出编号，用证据确认。');
    else if(records.length>=limit) message(`已经称了 2 次，仍有 ${candidates.length} 个候选。重新开一局，试试先把 9 个均分成三组。`,true);
    else message(`这次结果之后，还有 ${candidates.length} 个候选。想一想下一称怎样继续排除；需要时可打开记录。`);
    onEvidence('weigh',{left,right,result,count:records.length,remaining:candidates.length});
    paint();
    $('.balance-machine').scrollIntoView({block:'start'});
  };
  $('[data-guess]').onclick=()=>{
    const guess=Number($(`#${prefix}-guess`).value);
    if(!guess) {message('先选择你判断的编号。',true);return;}
    onEvidence('guess',{guess,correct:candidates.length===1&&guess===candidates[0]});
    if(candidates.length!==1) {message(`现有证据还允许 ${candidates.length} 个果子偏重。即使猜中了，也还没有唯一确定；需要继续称，或重新安排。`,true);return;}
    if(guess!==candidates[0]) {message('这个编号与称量结果不符。打开记录，再检查哪一个还没有被排除。',true);return;}
    solved=true;message(`找到了！${guess} 号更重。你用了 ${records.length} 次称量，并且排除了其他所有可能。`);paint();onSolved(records.length);
  };
  reset();
}

function showPanel(id) {
  if(id!=='quiz'&&!document.querySelector('#quiz').hidden&&questionIndex<5) feedbackLog.help(questionIndex,'回看讲解或演示');
  document.querySelectorAll('.rocket-panel').forEach(panel=>panel.hidden=panel.id!==id);
  document.querySelectorAll('[data-panel]').forEach(button=>{const selected=button.dataset.panel===id;button.classList.toggle('current',selected);if(selected) button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  document.querySelector(`#${id} h2`).focus({preventScroll:true});document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});
}
document.querySelectorAll('[data-panel],[data-go]').forEach(button=>button.onclick=()=>showPanel(button.dataset.panel||button.dataset.go));
document.querySelectorAll('[data-split]').forEach(button=>button.onclick=()=>setSplit(Number(button.dataset.split)));
function setSplit(n) {
  document.querySelector('#split-left').textContent=n;document.querySelector('#split-right').textContent=n;document.querySelector('#split-table').textContent=9-2*n;
  document.querySelectorAll('[data-split]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.split)===n)));
  document.querySelector('#split-verdict').textContent=n===3?'每个结果都只剩 3 个候选。再称 1 对 1，任何结果都能锁定 1 个。':n===4?'平衡时，桌上只剩 1 个，运气好就找到了；但倾斜时还剩 4 个，余下 1 次最多区分 3 种可能，不能保证找到。':'平衡时，桌上还剩 7 个；余下 1 次最多区分 3 种可能，不能保证找到。';
}
let branchGroup=[7,8,9];
function setFirst(result) {
  branchGroup=result==='left'?[1,2,3]:result==='right'?[4,5,6]:[7,8,9];
  document.querySelectorAll('[data-first]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.first===result)));
  document.querySelectorAll('[data-second]').forEach(button=>button.setAttribute('aria-pressed','false'));
  document.querySelector('#first-reason').textContent=result==='level'?'两盘一样重，偏重的果子没有上秤：只怀疑 7、8、9 号。':`${resultNames[result]}，而且两盘个数相同：只怀疑 ${branchGroup.join('、')} 号。`;
  document.querySelector('#second-plan').textContent=`第二称：${branchGroup[0]} 号对 ${branchGroup[1]} 号，${branchGroup[2]} 号留桌上。`;
  document.querySelector('#branch-answer').textContent='选择第二称的结果，看看哪一个被锁定。';
}
document.querySelectorAll('[data-first]').forEach(button=>button.onclick=()=>setFirst(button.dataset.first));
document.querySelectorAll('[data-second]').forEach(button=>button.onclick=()=>{
  const result=button.dataset.second,id=branchGroup[result==='left'?0:result==='right'?1:2];
  document.querySelectorAll('[data-second]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelector('#branch-answer').textContent=`${resultNames[result]} → ${id} 号更重。${result==='level'?'这次没上秤的那个，就是答案。':'这次较重的一盘只有它一个。'}`;
});

const questions=[
  {skill:'设计分组',title:'想保证两次找到，第一称选哪种？',context:'9 个中已知恰有 1 个更重。要让最不利的结果也方便处理。',kind:'choice',options:['4 对 4，另 1 个留桌上。','3 对 3，另 3 个留桌上。','1 对 1，另 7 个留桌上。'],answer:1,hint:'第一称之后只剩一次机会；每一种结果都要留下不超过 3 个候选。',explanation:'3 对 3：左重、右重、平衡都只留下 3 个候选。剩下的 1 次足够从这 3 个里找到更重的那个。'},
  {skill:'读懂结果',title:'第一称平衡了，是不是白称了？',context:'1、2、3 号放左边，4、5、6 号放右边；结果平衡。下一步应调查谁？',kind:'choice',options:['7、8、9 号，因为前 6 个都被排除了。','1、2、3 号，因为它们在左盘。','仍要检查全部 9 个，平衡没有信息。'],answer:0,hint:'恰好只有一个更重；它若在任一盘，两盘就不会平衡。',explanation:'平衡也是线索！两盘数量相等且重量相同，偏重的果子没有上秤，所以只剩 7、8、9 号。'},
  {skill:'亲手操作',title:'换一局，你来亲手锁定它。',context:'偏重的编号随机。最多称 2 次，确认时要有唯一答案；猜中不算完成推理。',kind:'hands'},
  {skill:'解释“最少”',title:'“我称一次就找到了，所以最少一次。”对吗？',context:'小舟称 4 对 4，碰巧平衡，确定桌上那一个更重。他把这次的好运当成了保证。',kind:'choice',options:['对，一次成功就证明每次都能一次找到。','不对，因为天秤不能称 4 对 4。','不对，要看所有情况。一次最多 3 种结果，不能唯一分清 9 种可能。'],answer:2,hint:'“最少需要几次”问的是：最不利的情况下，也保证找到。',explanation:'一次碰巧成功，不等于能保证。1 次最多区分 3 种可能，分不清全部 9 种；而 3、3、3 的方案能保证两次找到。因此最少是 2 次。'},
  {skill:'迁移与表达',title:'改成 12 个果子，最少几次能保证找到？',context:'条件仍是“恰有 1 个更重，其余一样重”。想一想两次最多区分多少种情况。',kind:'transfer',answer:3,hint:'两次最多区分 3 × 3＝9 种，够不够？可以先分 4、4、4；锁定 4 个后，再称 2 对 2。',explanation:'最少 3 次。两次最多区分 9 种，不能覆盖 12 种。三次的办法：先称 4 对 4，锁定可疑的 4 个；再称 2 对 2，锁定 2 个；最后称 1 对 1，找到更重的那个。'}
];
const questionBox=document.querySelector('#balance-question');
let questionIndex=0;
let feedbackLog=LearningFeedback.create('9 个果子，只称 2 次？',questions);
function renderQuestion(focus=true) {
  if(questionIndex===5) {showFinish();return;}
  const q=questions[questionIndex], final=questionIndex===4;
  const number=q.kind==='number'||q.kind==='transfer';
  const inputId='balance'==='scale'?'length-answer':'balance'==='balance'?'weigh-answer':'cost-answer';
  let selected=null;
  let body=q.kind==='hands'?'<div id="practice-balance"></div>':number?`<div class="number-entry"><label for="${inputId}">填入计算结果</label><div><input id="${inputId}" inputmode="decimal" autocomplete="off"><span>${q.unit||('balance'==='balance'?'次':'任务币')}</span><button class="secondary" id="check-number">核对一下</button></div></div>`:q.kind==='speak'?'':(q.kind==='chart'?chartTable():'')+`<div class="rocket-answers">${q.options.map((option,i)=>`<button class="rocket-answer" data-answer="${i}" aria-pressed="false">${LearningFeedback.esc(option)}</button>`).join('')}</div>`;
  if(final) body+=LearningFeedback.reasonField('balance'==='balance'?'用一句话或一个算式，说明为什么更少不够、你的办法怎样做到':'balance'==='scale'?'用一句话说明：为什么选它，另外两种呢？':'留一句你的建议：选什么、为什么、还要确认什么？')+(q.kind==='speak'||q.kind==='design'?'<button class="primary" id="submit-reason">记下答案和理由，再核对</button>':'');
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
      check(input.value.trim()+' '+(q.unit||('balance'==='balance'?'次':'任务币')),Number(value)===q.answer);
    };
    questionBox.querySelector('#check-number').onclick=checkNumber;
    input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();checkNumber();}};
  }
  if(final&&(q.kind==='design'||q.kind==='speak')) questionBox.querySelector('#submit-reason').onclick=()=>{
    if(q.kind==='design'&&selected===null) {feedback.textContent='先选一个方案，再留下理由。';return;}
    check(q.kind==='speak'?LearningFeedback.readReason(questionBox)||'':q.options[selected],q.kind==='speak'?null:selected===q.answer);
  };
  if(q.kind==='hands') {
    let round=1;
    feedbackLog.note(questionIndex,'操作题会提供候选数反馈；不据此判定已独立掌握。');
    createBalance(questionBox.querySelector('#practice-balance'),{prefix:'practice',limit:2,onSolved:()=>{feedback.textContent='已用证据唯一确定。称量记录和首次判断已保留。';feedbackLog.finish(questionIndex);next.disabled=false;},onEvidence:(type,data)=>{
      if(type==='help') feedbackLog.help(questionIndex,data);
      if(type==='weigh') {feedbackLog.note(questionIndex,`第 ${round} 局，第 ${data.count} 称：左 ${data.left.join('、')}；右 ${data.right.join('、')} → ${resultNames[data.result]}；剩 ${data.remaining} 个候选。`);if(data.count===2&&data.remaining>1) feedbackLog.submit(questionIndex,`第 ${round} 局两称后仍有 ${data.remaining} 个候选`,false);}
      if(type==='guess') feedbackLog.submit(questionIndex,`判断 ${data.guess} 号更重（第 ${round} 局）`,data.correct);
      if(type==='reset') {feedbackLog.note(questionIndex,`第 ${round} 局重新开始；之前记录保留。`);round++;}
    }});
  }
  next.onclick=()=>{questionIndex++;renderQuestion();};
  if(focus) {questionBox.querySelector('h3').focus({preventScroll:true});document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});}
}
function showFinish() {
  questionBox.innerHTML='<div class="finish-star" aria-hidden="true">✳</div><h3 class="finish-title" tabindex="-1">5 题完成，看看这次的思路。</h3><p class="question-context">选择与次数已核对，动手称量已完成；最后的解释由你自检。今天可以到这里。</p><div class="takeaway"><strong>带走一个思考习惯</strong><p>先数清可能，再看一次操作能排除多少；说“最少”时，既要证明更少不行，也要给出做得到的办法。</p></div><div class="finish-actions"><a href="./">回到小站</a><button class="text-button" id="retry-balance">重做这 5 题</button></div>';
  questionBox.insertAdjacentHTML('beforeend',feedbackLog.html());
  questionBox.querySelector('#retry-balance').onclick=()=>{feedbackLog=LearningFeedback.create('9 个果子，只称 2 次？',questions);questionIndex=0;renderQuestion();};questionBox.querySelector('h3').focus({preventScroll:true});document.querySelector('.rocket-tabs').scrollIntoView({block:'start'});
}
createBalance(document.querySelector('#free-balance'),{prefix:'free'});setSplit(3);setFirst('level');renderQuestion(false);
