'use strict';
// New lessons also identify themselves when an older service worker supplies the shared registry.
if(!LearningFeedback.courses.some(c=>c[0]==='now'))LearningFeedback.courses.push(['now',NowLesson.title,'now.html']);
const nowQuestions=NowLesson.questions,nowEscape=LearningFeedback.esc;
const nowTask=document.querySelector('#now-task');
let nowLog=LearningFeedback.create(NowLesson.title,nowQuestions),nowIndex=nowLog.index;
function weekMarkup(){return `<div class="habit-week" aria-label="Mia 通常周一、周三、周五放学后训练">${['一','二','三','四','五','六','日'].map((day,i)=>`<div class="${[0,2,4].includes(i)?'training-day':''}"><span>周${day}</span><b>${[0,2,4].includes(i)?'●':'·'}</b></div>`).join('')}</div><p class="week-caption">● 通常的训练日。</p>`;}
function personSvg(action){
  const resting=action!=='train';
  const legs=resting?'<path d="M156 147L197 158L210 211 M160 148L151 175L179 217"/>':'<path class="moving-leg" d="M170 144L153 179L181 213"/><path d="M172 144L198 173L218 203"/>';
  const arms=action==='read'?'<path d="M170 107L197 123L213 111 M171 108L151 132L184 140"/>':action==='rest'?'<path d="M169 108L145 129L156 151 M171 108L198 125L194 157"/>':'<path d="M170 107L147 94L133 114 M171 108L192 126L210 110"/>';
  return `<svg class="now-figure" viewBox="0 0 340 250" role="img" aria-label="Mia 正在${action==='train'?'训练':action==='rest'?'休息':'读书'}的情境示意"><path d="M25 222H315" stroke="#c7cbbb" stroke-width="3"/>${resting?'<path d="M126 158H204 M135 158V220 M197 158V220" stroke="#b38d62" stroke-width="7" fill="none"/>':'<path d="M40 201V131H94V201" stroke="#cbd5c4" stroke-width="4" fill="none"/>'}<circle cx="172" cy="71" r="19" fill="#c49175"/><path d="M154 67Q155 40 180 48Q193 51 191 71" fill="#486051"/><path d="M170 97L168 145" stroke="#638b71" stroke-width="30" stroke-linecap="round"/><g stroke="#486051" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none">${legs}${arms}</g>${action==='read'?'<path d="M180 126L204 117L227 127V158L204 148L180 157Z" fill="#e0bd76" stroke="#a27e3f" stroke-width="2"/><path d="M204 118V148" stroke="#a27e3f" stroke-width="2"/>':''}${action==='train'?'<g class="moving-ball"><circle cx="259" cy="204" r="16" fill="#fffefa" stroke="#6a7f68" stroke-width="2"/><path d="M250 201L257 193L267 199L263 210L253 210Z" fill="#6a7f68"/></g>':''}</svg>`;
}
function robotSvg(){return '<svg class="now-figure robot-figure" viewBox="0 0 340 210" role="img" aria-label="机器人维修台示意"><path d="M30 166H310 M55 166V202 M285 166V202" stroke="#a98b68" stroke-width="7"/><rect x="119" y="66" width="106" height="91" rx="14" fill="#b7cfc0" stroke="#5b7d69" stroke-width="3"/><rect x="136" y="27" width="72" height="54" rx="12" fill="#e9eddf" stroke="#5b7d69" stroke-width="3"/><circle cx="155" cy="51" r="5" fill="#315b48"/><circle cx="188" cy="51" r="5" fill="#315b48"/><path d="M160 65H182 M172 26V13" stroke="#5b7d69" stroke-width="3"/><circle cx="172" cy="10" r="6" fill="#bc8b56"/><path d="M118 92L93 125 M225 92L250 125" stroke="#5b7d69" stroke-width="10" stroke-linecap="round"/><circle cx="172" cy="112" r="18" fill="#efdbab"/><path d="M62 150L92 119 M78 118L91 107L101 118L89 132" fill="none" stroke="#a58b60" stroke-width="7" stroke-linecap="round"/></svg>';}
function nowScene(index){
  if(index===0)return `<h2>一张周历，一句介绍</h2>${weekMarkup()}<p class="english-line" lang="en">${NowLesson.habit}</p><p>她通常放学后训练。</p><div class="snapshot-unknown"><span>此刻镜头</span><b>?</b><p>还没有提供此刻的画面。</p></div>`;
  if(index===1)return `<h2>同一个人，两个时间范围</h2><span class="view-label">平时</span><p class="english-line" lang="en">Mia usually <strong>trains</strong> after school.</p><span class="view-label">此刻</span>${personSvg('rest')}<p class="english-line" lang="en">She <strong>is resting</strong> now.</p><p>先说一说，再留下自己的解释。</p>`;
  if(index===2)return `<h2>机器人维修直播</h2>${robotSvg()}<span class="live-label">当前画面 · Ben 正在修理</span><p class="english-line" lang="en">Ben repairing a robot.</p><p>这是一句待修正的话。要完整地描述眼前动作，还缺哪一块？</p>`;
  if(index===3)return `<h2>平时修理，此刻测试</h2>${robotSvg()}<div class="scene-fact"><b>日常习惯</b>我们通常在周日修理机器人。</div><div class="scene-fact"><b>眼前动作</b>我们此刻正在测试一台机器人。</div><p>主语换成 <span lang="en">we</span> 后，动词也要对应。</p>`;
  return `<h2>把镜头转向自己</h2><div class="speaking-card"><span>01 · 平时的你</span><p>你经常做的一件事。</p></div><div class="speaking-card"><span>02 · 此刻的你</span><p>你此刻正在做的动作。</p></div><p>对着一个假想的新朋友，用英语说两句。慢一点，意思说清楚就好。</p><p class="source-note">这里不录音。留下的文字是你补记的口述原话，不能自动证明发音或流利度。</p>`;
}
function wordMarkup(){return `<details class="reading-hint" data-help="词汇小卡"><summary>需要时，看看词汇小卡</summary><div class="now-words">${NowLesson.words.map(w=>`<div><b lang="en">${w.word}</b><span>${w.meaning}</span><small lang="en">${w.example}</small></div>`).join('')}</div></details>`;}
function labMarkup(){return `<details class="now-lab" data-help="查看平时与此刻的双镜头"><summary>动手切换：周历不变，此刻会变</summary><div class="now-lab-body"><span class="view-label">平时的习惯</span>${weekMarkup()}<p class="english-line" lang="en">${NowLesson.habit}</p><div id="now-snapshot"></div><label for="now-time">拖动或用左右键，查看周五三个时刻</label><input id="now-time" type="range" min="0" max="2" step="1" value="1"><div class="time-ticks" aria-hidden="true">${NowLesson.snapshots.map(s=>`<span>${s.time}</span>`).join('')}</div><p class="view-rule">本课这类动作：说习惯，用一般现在时；说此刻正在做的动作，用 am / is / are + 动词-ing。先想意思，再选形式。</p><p class="source-note">这里只练两种常见用法。进行时也能表达一段时间内的暂时情况；know、like 等状态动词通常不用于进行时，不能只见 now 就套用。</p></div></details>`;}
function bindLab(){
  const slider=document.querySelector('#now-time');const saved=nowLog.checkpoint.nowSnapshot;slider.value=Number.isInteger(saved)&&saved>=0&&saved<3?saved:1;
  function draw(){const state=NowLesson.snapshot(Number(slider.value));document.querySelector('#now-snapshot').innerHTML=`<div class="current-shot"><span class="live-label">周五 ${state.time} · 此刻镜头</span>${personSvg(state.action)}<p class="english-line" lang="en">She <strong>is ${state.verb}</strong> now.</p><p>此刻正在${state.label}；上面的日常习惯句没有改变。</p></div>`;slider.setAttribute('aria-valuetext',`${state.time}，Mia 正在${state.label}`);}
  slider.oninput=()=>{nowLog.point({nowSnapshot:Number(slider.value)});nowLog.help(nowIndex,'切换此刻镜头');draw();};draw();
}
function renderNow(focus=false){
  document.querySelector('#now-progress').textContent=nowIndex===5?'5 题完成':`第 ${nowIndex+1} / 5 题`;
  document.querySelector('#now-dots').innerHTML=nowQuestions.map((_,i)=>`<i class="${nowLog.records[i].done?'done':''} ${i===nowIndex?'current':''}"></i>`).join('');
  if(nowIndex===5){finishNow();return;}
  const q=nowQuestions[nowIndex],r=nowLog.records[nowIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${nowEscape(option)}</span></button>`).join('')}</div>`:open?`<label for="now-answer">${nowIndex===4?'先开口，再留下刚才的两句英语':'留下你的解释（中文或英语都可以）'}</label><textarea id="now-answer" maxlength="600" rows="4" placeholder="用自己的话，不必照搬示范。"></textarea><label class="reason-unsure"><input id="now-unsure" type="checkbox">我暂时说不清，先如实记下来</label>`:`<div class="pair-blanks">${q.blanks.map((b,i)=>`<label for="now-blank-${i}" lang="en">${b.label}</label><select id="now-blank-${i}"><option value="">选一个表达</option>${b.options.map(option=>`<option value="${option}">${option}</option>`).join('')}</select>`).join('')}</div>`;

  nowTask.innerHTML=`<div class="now-layout"><article class="now-scene">${nowScene(nowIndex)}</article><section class="reading-work now-work"><p class="skill-label">${q.skill}</p><h2 id="now-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-now">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="now-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${wordMarkup()}${!open?'<button class="text-button" id="now-method">暂时不会，看看方法</button>':''}<div id="now-review" hidden></div><div id="now-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-now" disabled>${nowIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#now-message'),submit=document.querySelector('#submit-now'),next=document.querySelector('#next-now');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(nowIndex!==0||document.querySelector('.now-lab'))return;document.querySelector('#now-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.now-lab');details.addEventListener('toggle',()=>{if(details.open)nowLog.help(nowIndex,'查看平时与此刻的双镜头');});}
  function finishClosed(){nowTask.querySelectorAll('[data-choice],select,#submit-now,#now-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#now-answer').value.trim();if(!text&&!document.querySelector('#now-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#now-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)nowLog.submit(nowIndex,answer,null,answer);nowLog.finish(nowIndex,button.dataset.self);nowTask.querySelectorAll('textarea,input,#submit-now,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  nowTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);nowTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)nowLog.submit(nowIndex,answer,null,answer);if(first)nowLog.help(nowIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const values=q.blanks.map((_,i)=>document.querySelector('#now-blank-'+i).value);if(values.some(v=>v==='')){say('两处都选好，再一起核对。',true);return;}const indexes=values.map((value,i)=>q.blanks[i].options.indexOf(value));correct=NowLesson.checkPair(indexes);if(correct===null)return;answer='We usually '+q.blanks[0].options[indexes[0]]+' robots on Sundays. Look! We '+q.blanks[1].options[indexes[1]]+' a robot now.';}
    nowLog.submit(nowIndex,answer,correct);if(correct){nowLog.finish(nowIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(nowIndex===0)showLab();}
  };
  if(!open)document.querySelector('#now-method').onclick=()=>{if(!r.first)nowLog.submit(nowIndex,'暂时不会，选择查看方法',false);nowLog.help(nowIndex,'查看本题方法');nowLog.finish(nowIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(nowTask,nowLog,nowIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{nowIndex++;renderNow(true);};
  if(focus){document.querySelector('#now-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishNow(){
  nowTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>先判断你要表达的是习惯，还是此刻正在做的动作，再检查主语与动词形式。</p><div class="finish-pair"><p><b>平时</b><span lang="en">I train. / She trains.</span></p><p><b>此刻</b><span lang="en">I am training. / She is training.</span></p></div><p class="finish-note">3题核对理解与形式，2题保留解释和表达。口述与自检不自动判分；能在新情境中独立说清楚，才是下一步要验证的事。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-now">重新练这5题（保留旧记录）</button></section>${nowLog.html()}`;
  document.querySelector('#restart-now').onclick=()=>{nowLog=LearningFeedback.create(NowLesson.title,nowQuestions,true);nowLog.save();nowIndex=0;renderNow(true);};nowTask.querySelector('h2').focus({preventScroll:true});
}
renderNow();
