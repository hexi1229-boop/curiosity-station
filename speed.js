'use strict';
const speedQuestions=SpeedLesson.questions,speedEscape=LearningFeedback.esc;
const speedTask=document.querySelector('#speed-task');
let speedLog=LearningFeedback.create(SpeedLesson.title,speedQuestions),speedIndex=speedLog.index,speedAnimation=0;
function stopSpeedAnimation(){cancelAnimationFrame(speedAnimation);speedAnimation=0;const button=document.querySelector('#play-speed');if(button)button.textContent='播放 8 秒模拟';}
window.addEventListener('pagehide',stopSpeedAnimation);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeedAnimation();});
function speedScene(index){
  if(index<2)return '<h2>两辆车，各交一份行驶记录</h2><div class="trip-row"><span class="trip-tag">甲</span><div><strong>300 米</strong><small>用时 60 秒</small></div></div><div class="trip-row b"><span class="trip-tag">乙</span><div><strong>240 米</strong><small>用时 40 秒</small></div></div><p class="trip-note">比较各自这段路的平均快慢。记录没有告诉我们每一秒的具体情况。</p>';
  if(index===2)return '<h2>两段速度，能直接平均吗？</h2><ol class="trip-timeline"><li><b>第一段 · 持续10秒</b>2 米/秒</li><li><b>第二段 · 持续30秒</b>6 米/秒</li></ol><p>中途没有停留。小明这样算：</p><p class="trip-formula">(2＋6)÷2＝4 米/秒</p><p class="trip-note">先判断这个算法是否适用。</p>';
  if(index===3)return '<h2>配送车的行程记录</h2><div class="trip-row"><span class="trip-tag">路</span><div><strong>1.2 千米</strong><small>从出发点到送达点的总路程</small></div></div><div class="trip-row b"><span class="trip-tag">时</span><div><strong>4 分钟</strong><small>对应这段路的总用时</small></div></div><p>请用 <b>米/秒（m/s）</b> 表示平均速度。</p>';
  return '<h2>观测小车的一次出行</h2><ol class="trip-timeline"><li><b>从营地出发 · 前段</b>60 米，用时 10 秒</li><li class="stop"><b>途中停留</b>原地停留 10 秒</li><li><b>后段 · 到达观测点</b>60 米，用时 20 秒</li></ol><p class="trip-note">计算范围是从出发到到达的整段行程。</p>';
}
function labMarkup(){return `<details class="speed-lab" data-help="路程与时间互动"><summary>拖动时间，验证谁更快</summary><div class="speed-lab-body"><p>甲始终是300米用60秒。乙的路程固定为240米，改变乙的用时，观察平均速度。</p><label for="b-time">乙行驶240米，用时 <output id="b-time-label">40</output> 秒</label><input id="b-time" type="range" min="24" max="80" step="4" value="40"><div class="speed-readouts"><div>甲：300÷60<strong>5 米/秒</strong></div><div>乙：240÷<output id="b-divisor">40</output><strong><output id="b-speed">6</output> 米/秒</strong></div></div><p class="lab-assumption">按各自的平均速度做匀速模拟，一起观察前20秒；这不代表原记录中的每一刻都如此。两条路线使用相同刻度。</p><svg viewBox="0 0 380 192" role="img" aria-label="同一刻度下两辆车的匀速模拟位置"><g stroke="#cdd8c9" stroke-dasharray="3 5"><path d="M35 28 V153 M135 28 V153 M235 28 V153 M335 28 V153"/></g><path d="M35 63 H335" stroke="#d0e1cc" stroke-width="10" stroke-linecap="round"/><path d="M35 127 H275" stroke="#ebdac8" stroke-width="10" stroke-linecap="round"/><g fill="#6c7d67" font-size="11" text-anchor="middle"><text x="35" y="177">0</text><text x="135" y="177">100</text><text x="235" y="177">200</text><text x="335" y="177">300米</text></g><text x="35" y="22" font-size="12" fill="#35644c">甲 · 路程300米</text><text x="35" y="100" font-size="12" fill="#966439">乙 · 路程240米</text><g id="car-a"><rect x="-15" y="-12" width="30" height="18" rx="5" fill="#356b57"/><rect x="-8" y="-9" width="16" height="7" rx="2" fill="#dcebd6"/><circle cx="-9" cy="7" r="4" fill="#496146"/><circle cx="9" cy="7" r="4" fill="#496146"/></g><g id="car-b"><rect x="-15" y="-12" width="30" height="18" rx="5" fill="#ad7a4e"/><rect x="-8" y="-9" width="16" height="7" rx="2" fill="#f0e4c9"/><circle cx="-9" cy="7" r="4" fill="#785c3e"/><circle cx="9" cy="7" r="4" fill="#785c3e"/></g></svg><p class="lab-clock">模拟时间：<output id="race-time" aria-live="off">0</output> / 20 秒</p><div class="speed-controls"><button id="play-speed">播放 8 秒模拟</button><button id="finish-speed">直接看20秒的位置</button><button id="reset-speed">恢复原数据</button></div><p class="lab-result" id="race-result" role="status"></p><p class="speed-rule"><strong>平均速度＝这段总路程 ÷ 对应的总时间。</strong><br>它把整段行程折合成平均每秒走多少米，不能单凭它还原每一刻的速度。</p></div></details>`;}
function bindLab(){
  const lab=document.querySelector('.speed-lab');if(!lab)return;
  const range=document.querySelector('#b-time');let elapsed=0;
  const format=n=>Number(n.toFixed(2)).toString();
  const approximate=n=>(Math.abs(n-Number(n.toFixed(2)))>1e-8?'约':'')+format(n);
  function draw(t,announce=true){
    elapsed=t;const s=SpeedLesson.raceState(Number(range.value),t);
    document.querySelector('#b-time-label').textContent=s.bTime;
    document.querySelector('#b-divisor').textContent=s.bTime;
    document.querySelector('#b-speed').textContent=approximate(s.bSpeed);
    document.querySelector('#car-a').setAttribute('transform',`translate(${35+s.aDistance} 63)`);
    document.querySelector('#car-b').setAttribute('transform',`translate(${35+s.bDistance} 127)`);
    document.querySelector('#race-time').textContent=format(t);
    if(announce){const comparison=s.bSpeed>s.aSpeed?'乙的平均速度更大':s.bSpeed<s.aSpeed?'甲的平均速度更大':'两车的平均速度相等';document.querySelector('#race-result').textContent=t===0?`${comparison}。播放模拟，比较同样20秒内的路程。`:`同样${format(t)}秒，甲模拟行驶${approximate(s.aDistance)}米，乙模拟行驶${approximate(s.bDistance)}米。${comparison}。`;}
  }
  range.addEventListener('input',()=>{stopSpeedAnimation();speedLog.help(speedIndex,'调整乙的用时');draw(0);});
  document.querySelector('#play-speed').onclick=()=>{
    if(speedAnimation){stopSpeedAnimation();draw(elapsed);return;}
    speedLog.help(speedIndex,'播放速度模拟');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){draw(20);return;}
    draw(0);document.querySelector('#play-speed').textContent='暂停模拟';const started=performance.now();
    function frame(now){const t=Math.min((now-started)/8000*20,20);draw(t,false);if(t<20)speedAnimation=requestAnimationFrame(frame);else{stopSpeedAnimation();draw(20);}}
    speedAnimation=requestAnimationFrame(frame);
  };
  document.querySelector('#finish-speed').onclick=()=>{stopSpeedAnimation();speedLog.help(speedIndex,'查看20秒模拟结果');draw(20);};
  document.querySelector('#reset-speed').onclick=()=>{stopSpeedAnimation();range.value='40';speedLog.help(speedIndex,'重置速度模拟');draw(0);};
  lab.addEventListener('toggle',()=>{if(!lab.open)stopSpeedAnimation();});draw(0);
}
function renderSpeed(focus=false){
  stopSpeedAnimation();
  document.querySelector('#speed-progress').textContent=speedIndex===5?'5 题完成':`第 ${speedIndex+1} / 5 题`;
  document.querySelector('#speed-dots').innerHTML=speedQuestions.map((_,i)=>`<i class="${speedLog.records[i].done?'done':''} ${i===speedIndex?'current':''}"></i>`).join('');
  if(speedIndex===5){finishSpeed();return;}
  const q=speedQuestions[speedIndex],r=speedLog.records[speedIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${speedEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="speed-answer">留下你的理由或关键步骤</label><textarea id="speed-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话或几个算式就好。"></textarea><label class="reason-unsure"><input id="speed-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`<label for="speed-number">${q.label}</label><div class="number-answer"><input id="speed-number" inputmode="decimal" autocomplete="off" maxlength="30"><span>${q.unit}</span></div>`;
  speedTask.innerHTML=`<div class="speed-layout"><article class="trip-card">${speedScene(speedIndex)}</article><section class="reading-work speed-work"><p class="skill-label">${q.skill}</p><h2 id="speed-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-speed">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="speed-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="speed-method">暂时不会，看看方法</button>':''}<div id="speed-review" hidden></div><div id="speed-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-speed" disabled>${speedIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#speed-message'),submit=document.querySelector('#submit-speed'),next=document.querySelector('#next-speed');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(speedIndex!==0||document.querySelector('.speed-lab'))return;document.querySelector('#speed-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.speed-lab');details.addEventListener('toggle',()=>{if(details.open)speedLog.help(speedIndex,'路程与时间互动');});}
  function finishClosed(){speedTask.querySelectorAll('[data-choice],#speed-number,#submit-speed,#speed-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#speed-answer').value.trim();if(!text&&!document.querySelector('#speed-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#speed-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)speedLog.submit(speedIndex,answer,null,answer);speedLog.finish(speedIndex,button.dataset.self);speedTask.querySelectorAll('textarea,input,#submit-speed,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  speedTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);speedTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)speedLog.submit(speedIndex,answer,null,answer);if(first)speedLog.help(speedIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#speed-number').value;const value=SpeedLesson.numberValue(raw);if(value===null){say('这里填一个数字就好，例如 2。',true);return;}answer=raw.trim()+' '+q.unit;correct=value===q.answer;}
    speedLog.submit(speedIndex,answer,correct);if(correct){speedLog.finish(speedIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(speedIndex===0)showLab();}
  };
  if(!open)document.querySelector('#speed-method').onclick=()=>{if(!r.first)speedLog.submit(speedIndex,'暂时不会，选择查看方法',false);speedLog.help(speedIndex,'查看本题方法');speedLog.finish(speedIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(speedTask,speedLog,speedIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{speedIndex++;renderSpeed(true);};
  if(focus){document.querySelector('#speed-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishSpeed(){
  speedTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>比较一段路的快慢，要让路程、时间和单位对应起来。</p><div class="speed-finish-steps"><span>定清这段行程</span><span>统一单位</span><span>总路程÷总时间</span></div><p>停留也会占用全程时间。平均速度描述整段行程，不等于每一刻的速度；两段时间不同，别直接把速度相加除以2。</p><p class="finish-note">3题核对了判断或数值，2题保留了理由与自检。以后看一段新记录，先问清“这段路、这段时间分别是什么”。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-speed">重新练这5题（保留旧记录）</button></section>${speedLog.html()}`;
  document.querySelector('#restart-speed').onclick=()=>{speedLog=LearningFeedback.create(SpeedLesson.title,speedQuestions,true);speedLog.save();speedIndex=0;renderSpeed(true);};speedTask.querySelector('h2').focus({preventScroll:true});
}
renderSpeed();
