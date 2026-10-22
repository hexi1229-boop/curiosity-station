'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='past'))LearningFeedback.courses.push(['past',PastLesson.title,'past.html']);
const pastQuestions=PastLesson.questions,pastEscape=LearningFeedback.esc;
const pastTask=document.querySelector('#past-task');
let pastLog=LearningFeedback.create(PastLesson.title,pastQuestions),pastIndex=pastLog.index;
function paperRocket(){return '<svg class="past-rocket" viewBox="0 0 340 150" role="img" aria-label="带圆筒和尾翼的纸火箭示意，图片不提供试飞结果"><path d="M31 137H309" stroke="#d4dbcc" stroke-width="2"/><g transform="translate(170 76) rotate(38)"><path d="M-16 15L-35 53L-16 43 M16 15L35 53L16 43" fill="#a9c4b0" stroke="#688376" stroke-width="2" stroke-linejoin="round"/><path d="M-16-27L0-61L16-27" fill="#d6b982" stroke="#688376" stroke-width="2" stroke-linejoin="round"/><rect x="-16" y="-27" width="32" height="72" rx="2" fill="#f0ead6" stroke="#688376" stroke-width="2"/><path d="M0-26V44" stroke="#c7bda1" stroke-width="1.5" stroke-dasharray="4 4"/><path d="M-16 25H16" stroke="#9ebaa7" stroke-width="8"/><path d="M0 16V54" stroke="#688376" stroke-width="3"/></g></svg>';}

function pastScene(index){
  if(index===0)return `<h2>一段试飞记录</h2>${paperRocket()}<label class="audio-label" for="past-audio">英语示范 · 约10秒 · 可重复播放</label><audio id="past-audio" controls preload="metadata" src="assets/audio/past-flight.m4a" aria-label="昨天试飞记录的英语示范"></audio><p id="past-audio-error" role="status" hidden>音频暂时无法播放，可以展开下方原文继续。</p><p>先试着听一遍。也可以读原文；不用猜听不清的词。</p><details class="reading-hint" data-help="查看英文原文"><summary>需要时，看英文原文</summary><p class="english-line" lang="en">${pastEscape(PastLesson.story)}</p><p class="source-note">changed：调整了；tried again：又试了一次。更多词义可看右侧或下方的词汇小卡。</p></details>`;
  if(index===1)return `<h2>试飞记录里的一处笔误</h2>${paperRocket()}<p class="english-line wrong-sentence" lang="en">It didn’t reached the target.</p><p>这是待修正的句子。改好后，说明为什么这样改；不要只说“读着顺”。</p>`;
  if(index===2)return `<h2>向记录员问一个问题</h2><div class="speech-bubble">它飞了两米吗？</div>${paperRocket()}<p>这里确认的是“是否飞了两米”，不是“是否到达目标”。选5块词牌，留下一块。</p>`;
  if(index===3)return `<h2>同一个词，换一个现场</h2><svg class="past-target" viewBox="0 0 340 180" role="img" aria-label="运动练习中，软球与墙上圆形靶子的示意"><rect x="180" y="15" width="140" height="150" rx="10" fill="#e4e9dc"/><circle cx="250" cy="88" r="49" fill="#f2e5c8" stroke="#987756" stroke-width="3"/><circle cx="250" cy="88" r="29" fill="#d3b780"/><circle cx="250" cy="88" r="9" fill="#735c3f"/><circle cx="66" cy="129" r="20" fill="#9eb7a3"/><path d="M94 122Q133 78 169 95" stroke="#829a84" stroke-width="2" stroke-dasharray="5 7" fill="none"/></svg><p class="english-line" lang="en">Yesterday, Leo threw a soft ball at a <strong>target</strong> on the wall. The ball missed it.</p><p>Leo 朝墙上的某个东西投软球，没有击中。结合这一句判断词义。</p>`;
  return `<h2>你的昨天，也值得讲</h2><div class="speaking-card"><span>01 · 做过的事</span><p>昨天做过的一个动作。</p></div><div class="speaking-card"><span>02 · 没做的事</span><p>昨天没有做的一件事。</p></div><p>先大声说2–3句英语，再留下刚才的原话。可以用键盘语音输入补记。</p><p class="source-note">这里不录音。文字与自检不能自动证明发音或流利度。</p>`;
}
function wordMarkup(){return `<details class="reading-hint" data-help="词汇小卡"><summary>需要时，看看词汇小卡</summary><div class="past-words">${PastLesson.words.map(w=>`<div><b lang="en">${w.word}</b><span>${w.meaning}</span><small lang="en">${w.example}</small></div>`).join('')}</div></details>`;}
function orderMarkup(){return `<p>点选5块组成问句；多余1块。点已选词牌可移除。</p><div id="past-assembled" class="past-assembled" role="group" aria-label="已组成的问句"></div><p id="past-order-status" class="order-status" role="status"></p><div class="past-bank" role="group" aria-label="可用词牌">${PastLesson.bank.map(id=>`<button type="button" data-token="${id}" lang="en">${pastEscape(PastLesson.tokens[id])}</button>`).join('')}</div><div class="order-tools"><button type="button" class="text-button" id="past-undo">撤销最后一块</button><button type="button" class="text-button" id="past-clear">清空重排</button></div>`;}
function labMarkup(){return `<details class="past-lab" data-help="查看时间与句子变化"><summary>动手切换：时间和句子怎样对应？</summary><div class="past-lab-body"><div class="past-view-buttons" role="group" aria-label="切换时间与句式">${PastLesson.views.map((v,i)=>`<button type="button" data-view="${i}" aria-pressed="false">${v.label}</button>`).join('')}</div><div id="past-view" aria-live="polite"></div><p class="source-note">本课练实义动词的一般过去时。be 的过去式 was / were 另有规则，不套用 didn’t + be。过去时不只用于 yesterday，要先理解事情发生的时间。</p></div></details>`;}
function bindLab(){
  let index=Number.isInteger(pastLog.checkpoint.pastView)&&pastLog.checkpoint.pastView>=0&&pastLog.checkpoint.pastView<4?pastLog.checkpoint.pastView:0;
  function draw(){const state=PastLesson.view(index);document.querySelector('#past-view').innerHTML=`<div class="time-line" aria-hidden="true"><span class="${index===0?'':'active'}">昨天</span><i></i><span>今天</span></div><p class="time-label">${state.time}</p><p class="english-line view-sentence" lang="en">${state.parts.map((p,i)=>i%2===1?`<strong>${pastEscape(p)}</strong>`:pastEscape(p)).join('')}</p><p>${state.note}</p>`;document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.view)===index)));}
  document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{index=Number(button.dataset.view);pastLog.point({pastView:index});pastLog.help(pastIndex,'切换时间与句式');draw();});draw();
}
function renderPast(focus=false){
  pastTask.querySelectorAll('audio').forEach(audio=>audio.pause());
  document.querySelector('#past-progress').textContent=pastIndex===5?'5 题完成':`第 ${pastIndex+1} / 5 题`;
  document.querySelector('#past-dots').innerHTML=pastQuestions.map((_,i)=>`<i class="${pastLog.records[i].done?'done':''} ${i===pastIndex?'current':''}"></i>`).join('');
  if(pastIndex===5){finishPast();return;}
  const q=pastQuestions[pastIndex],r=pastLog.records[pastIndex],open=q.kind==='open';
  let order=PastLesson.validOrder(pastLog.checkpoint.pastOrder)?[...pastLog.checkpoint.pastOrder]:[];
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${pastEscape(option)}</span></button>`).join('')}</div>`:open?`<label for="past-answer">${pastIndex===4?'先开口，再留下刚才的2–3句英语':'留下你的解释（中文或英语都可以）'}</label><textarea id="past-answer" maxlength="600" rows="4" placeholder="用自己的话，不必照搬示范。"></textarea><label class="reason-unsure"><input id="past-unsure" type="checkbox">我暂时说不清，先如实记下来</label>`:orderMarkup();

  pastTask.innerHTML=`<div class="past-layout"><article class="past-scene">${pastScene(pastIndex)}</article><section class="reading-work past-work"><p class="skill-label">${q.skill}</p><h2 id="past-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-past">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="past-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${wordMarkup()}${!open?'<button class="text-button" id="past-method">暂时不会，看看方法</button>':''}<div id="past-review" hidden></div><div id="past-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-past" disabled>${pastIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#past-message'),submit=document.querySelector('#submit-past'),next=document.querySelector('#next-past');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(pastIndex!==0||document.querySelector('.past-lab'))return;document.querySelector('#past-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.past-lab');details.addEventListener('toggle',()=>{if(details.open)pastLog.help(pastIndex,'查看时间与句子变化');});}
  function finishClosed(){pastTask.querySelectorAll('[data-choice],[data-token],[data-remove],#past-clear,#past-undo,#submit-past,#past-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#past-answer').value.trim();if(!text&&!document.querySelector('#past-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#past-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)pastLog.submit(pastIndex,answer,null,answer);pastLog.finish(pastIndex,button.dataset.self);pastTask.querySelectorAll('textarea,input,#submit-past,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  pastTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);pastTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)pastLog.submit(pastIndex,answer,null,answer);if(first)pastLog.help(pastIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{correct=PastLesson.checkOrder(order);if(correct===null){say('选出5块词牌组成完整问句，再核对。',true);return;}answer=PastLesson.sentence(order);}
    pastLog.submit(pastIndex,answer,correct);if(correct){pastLog.finish(pastIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(pastIndex===0)showLab();}
  };
  if(!open)document.querySelector('#past-method').onclick=()=>{if(!r.first)pastLog.submit(pastIndex,'暂时不会，选择查看方法',false);pastLog.help(pastIndex,'查看本题方法');pastLog.finish(pastIndex,'看过方法，留待再练');finishClosed();};
  if(q.kind==='order'){
    function drawOrder(){
      document.querySelector('#past-assembled').innerHTML=order.length?order.map((id,i)=>`<button type="button" data-remove="${i}" aria-label="移除第${i+1}块 ${pastEscape(PastLesson.tokens[id])}" lang="en">${pastEscape(PastLesson.tokens[id])}</button>`).join(''):'<span>点下面的词牌，按顺序放进这里。</span>';
      pastTask.querySelectorAll('[data-token]').forEach(button=>{button.disabled=order.includes(Number(button.dataset.token))||order.length===5;});
      document.querySelector('#past-order-status').textContent=`已选 ${order.length} / 5 块。点上面的词牌可以移除。`;
      document.querySelector('#past-undo').disabled=!order.length;document.querySelector('#past-clear').disabled=!order.length;
      pastTask.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{order.splice(Number(button.dataset.remove),1);saveOrder();});
    }
    function saveOrder(){pastLog.point({pastOrder:[...order]});pastLog.draft(pastIndex,{'组句草稿':PastLesson.sentence(order)});drawOrder();(pastTask.querySelector('[data-token]:not(:disabled)')||document.querySelector('#submit-past')).focus({preventScroll:true});}
    pastTask.querySelectorAll('[data-token]').forEach(button=>button.onclick=()=>{const id=Number(button.dataset.token);if(order.includes(id)||order.length>=5)return;order.push(id);saveOrder();});
    document.querySelector('#past-undo').onclick=()=>{order.pop();saveOrder();};document.querySelector('#past-clear').onclick=()=>{order=[];saveOrder();};drawOrder();
  }
  const audio=document.querySelector('#past-audio');
  if(audio){audio.addEventListener('play',()=>{const count=(pastLog.checkpoint.pastAudioPlays||0)+1;pastLog.point({pastAudioPlays:count});pastLog.note(pastIndex,`示范音频开始播放 ${count} 次；不代表听完或听懂。`);});audio.addEventListener('error',()=>{document.querySelector('#past-audio-error').hidden=false;});}
  LearningFeedback.watchHelp(pastTask,pastLog,pastIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{pastIndex++;renderPast(true);};
  if(focus){document.querySelector('#past-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishPast(){
  pastTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p>先想清昨天发生了什么，再用过去式叙述；用 did 提问或否定时，后面的实义动词用原形。</p><div class="finish-pair"><p><b>讲发生过的事</b><span lang="en">It flew two metres.</span></p><p><b>问这件事</b><span lang="en">Did it fly two metres?</span></p></div><p class="finish-note">3题核对理解与形式，2题保留解释和自己的表达。这里记录学习过程，不自动判定口语发音或长期掌握。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-past">重新练这5题（保留旧记录）</button><details class="reading-hint"><summary>家长参考：课程依据</summary><p>对应2022英语课程标准的语境语法与一般过去时。语法规则核对：<a href="https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice/past-simple-sentences" target="_blank" rel="noopener">British Council · 过去时陈述句</a>、<a href="https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice/past-simple-questions" target="_blank" rel="noopener">过去时问句</a>。故事、题目与图示为本站原创；示范音频为语音合成。</p></details></section>${pastLog.html()}`;
  document.querySelector('#restart-past').onclick=()=>{pastLog=LearningFeedback.create(PastLesson.title,pastQuestions,true);pastLog.save();pastIndex=0;renderPast(true);};pastTask.querySelector('h2').focus({preventScroll:true});
}
renderPast();
