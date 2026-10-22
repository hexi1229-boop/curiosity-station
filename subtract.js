'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='subtract'))LearningFeedback.courses.push(['subtract',SubtractLesson.title,'subtract.html']);
const subtractQuestions=SubtractLesson.questions,subtractEscape=LearningFeedback.esc;
const subtractTask=document.querySelector('#subtract-task');
let subtractLog=LearningFeedback.create(SubtractLesson.title,subtractQuestions),subtractIndex=subtractLog.index,subtractAnimation=0;
function subtractExpression(a,b){return `<div class="subtract-expression"><span class="number-a">${SubtractLesson.fmt(a)}</span><span class="operator">−</span><span class="number-b">${SubtractLesson.term(b)}</span></div><div class="subtract-labels"><span>被减数</span><span>减法</span><span>减数</span></div>`;}
function subtractAxis(s,view){
  const row=s[view],pos=SubtractLesson.position,fmt=SubtractLesson.fmt;
  const ticks=Array.from({length:21},(_,i)=>i-10).map(n=>`<path d="M${pos(n)} 100V${n===0?111:106}" stroke="${n===0?'#577e67':'#a8b19d'}"/><text x="${pos(n)}" y="129" text-anchor="middle">${n%2===0?fmt(n):''}</text>`).join('');
  const start=pos(row.start),end=pos(row.end),sign=Math.sign(row.change),head=sign?`<path d="M${end-sign*7} 53L${end} 59L${end-sign*7} 65" fill="none" stroke="#ae824c" stroke-width="2"/>`:'';
  const arrow=sign?`<path d="M${start} 59H${end}" fill="none" stroke="#ae824c" stroke-width="2.5"/>${head}`:`<circle cx="${start}" cy="59" r="3" fill="#ae824c"/>`;
  return `<svg class="subtract-axis" viewBox="0 0 360 190" role="img" aria-label="${view==='difference'?'从减数到被减数求差':'从被减数加上减数的相反数'}：从${fmt(row.start)}到${fmt(row.end)}，${SubtractLesson.direction(row.change)}${Math.abs(row.change)}个单位"><path d="M18 100H344L338 96 M344 100L338 104" stroke="#829579" fill="none"/>${ticks}${arrow}<text x="180" y="24" text-anchor="middle" class="axis-change">${SubtractLesson.direction(row.change)}${row.change===0?'':Math.abs(row.change)+'个单位'}</text><path d="M${start} 65V99 M${end} 65V99" stroke="#c7cbb7" stroke-dasharray="3 4"/><circle cx="${start}" cy="100" r="5" fill="#fffefa" stroke="#55858a" stroke-width="2"/><circle cx="${end}" cy="100" r="3" fill="#ae824c"/><text x="${start}" y="151" text-anchor="middle" class="axis-start">起点 ${fmt(row.start)}</text><text x="${end}" y="174" text-anchor="middle" class="axis-end">终点 ${fmt(row.end)}</text><circle id="subtract-traveller" cx="${start}" cy="59" r="6" fill="#55858a" stroke="#fffefa" stroke-width="2"/></svg>`;
}
function subtractScene(index){
  if(index===0)return `<h2>两个符号，各有任务</h2>${subtractExpression(-2,-5)}<p>减号表示“做减法”；括号里的负号是减数的一部分。</p><p class="source-note">先留下自己的判断，再打开数轴验证。不要把括号中的负号漏掉。</p>`;
  if(index===1)return `<h2>变大，就一定跨过0吗？</h2>${subtractExpression(-3,-2)}<p>写出结果，再比较：结果比原来的−3大吗？结果本身是正数吗？</p>`;
  if(index===2)return `<h2>小数也有相反数</h2>${subtractExpression(-1.5,-2)}<p>先辨认减数，再算结果。只填最终数值。</p>`;
  if(index===3)return `<h2>找出改写中出错的一步</h2><div class="subtract-mistake"><span>小宇的草稿</span><p>−4−(+3)<br>↓<br>−4+3＝−1</p></div><p>这一次，减数是+3。它的相反数是什么？</p>`;
  return `<h2>比赛记分板</h2><div class="score-card"><span>当前净分</span><strong>−3<small>分</small></strong><p>其中含一项 <b>−4分处罚</b></p><div>裁判撤销这项处罚<br>其他记录不变</div></div><p>总分里去掉一项负分记录，怎样列式？</p>`;
}
function subtractLabMarkup(){return `<details class="subtract-lab" data-help="打开有理数减法模型"><summary>动手验证：改两个数，看变化</summary><div class="subtract-lab-body"><div class="subtract-inputs"><label for="subtract-a">被减数 a <output id="subtract-a-value"></output></label><input id="subtract-a" type="range" min="-5" max="5" step=".5"><label for="subtract-b">减数 b <output id="subtract-b-value"></output></label><input id="subtract-b" type="range" min="-5" max="5" step=".5"></div><div class="subtract-presets">${SubtractLesson.presets.map((p,i)=>`<button data-preset="${i}">${p.label}</button>`).join('')}</div><div class="subtract-views" role="group" aria-label="选择数轴解释"><button data-view="difference">① 从减数到被减数求差</button><button data-view="calculation">② 从被减数加相反数</button></div><h3 id="subtract-view-title"></h3><div id="subtract-model"></div><button class="subtract-play" id="subtract-play">让圆点走一遍</button><p class="subtract-relation" id="subtract-relation" role="status"></p><p class="source-note" id="subtract-view-note"></p><p class="subtract-rule"><b>为什么两个办法等价？</b><br>减法要找满足 b＋差＝a 的数。b 与相反数 −b 相加为0，所以 b＋[a＋(−b)]＝a；因此差就是 a＋(−b)。</p><p class="source-note">数轴向右为正，相邻短刻度间隔1个单位，两种视图尺度一致。只看距离会丢失正负方向。</p></div></details>`;}
function bindSubtractLab(){
  const ia=document.querySelector('#subtract-a'),ib=document.querySelector('#subtract-b'),saved=subtractLog.checkpoint;
  const valid=n=>Number.isFinite(n)&&Math.abs(n)<=5&&Number.isInteger(n*2);
  ia.value=valid(saved.subtractA)?saved.subtractA:-2;ib.value=valid(saved.subtractB)?saved.subtractB:-5;
  let view=saved.subtractView==='calculation'?'calculation':'difference';
  function draw(){cancelAnimationFrame(subtractAnimation);const s=SubtractLesson.state(Number(ia.value),Number(ib.value)),f=SubtractLesson.fmt,t=SubtractLesson.term;document.querySelector('#subtract-a-value').textContent=f(s.a);document.querySelector('#subtract-b-value').textContent=f(s.b);document.querySelector('#subtract-model').innerHTML=subtractAxis(s,view);document.querySelector('#subtract-view-title').textContent=view==='difference'?'求差：从b走到a，变化量是多少？':'计算：从a出发，加上b的相反数';document.querySelector('#subtract-relation').textContent=view==='difference'?`${f(s.a)}−${t(s.b)}＝${f(s.result)}\n验算：${f(s.b)}＋${t(s.result)}＝${f(s.a)}`:`${f(s.a)}−${t(s.b)}＝${f(s.a)}＋${t(s.opposite)}＝${f(s.result)}`;document.querySelector('#subtract-view-note').textContent=view==='difference'?'这幅图中：箭头的有向变化量是差，终点是被减数a。向右记正，向左记负，重合记0。':'这幅图中：箭头的有向变化量是减数的相反数−b，终点才是计算结果。不要把它与第一幅图的箭头含义混同。';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));}
  function save(label){subtractLog.point({subtractA:Number(ia.value),subtractB:Number(ib.value),subtractView:view});subtractLog.help(subtractIndex,label);draw();}
  ia.oninput=()=>save('调节被减数');ib.oninput=()=>save('调节减数');document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{const p=SubtractLesson.presets[Number(b.dataset.preset)];ia.value=p.a;ib.value=p.b;save('验证：'+p.label);});document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;save('切换数轴解释');});
  document.querySelector('#subtract-play').onclick=()=>{cancelAnimationFrame(subtractAnimation);subtractLog.help(subtractIndex,'播放有向变化');const s=SubtractLesson.state(Number(ia.value),Number(ib.value))[view],dot=document.querySelector('#subtract-traveller'),start=SubtractLesson.position(s.start),end=SubtractLesson.position(s.end);if(matchMedia('(prefers-reduced-motion: reduce)').matches){dot.setAttribute('cx',end);return;}let began;function frame(now){if(!dot.isConnected)return;if(began===undefined)began=now;const progress=Math.min(1,(now-began)/900);dot.setAttribute('cx',start+(end-start)*progress);if(progress<1)subtractAnimation=requestAnimationFrame(frame);}subtractAnimation=requestAnimationFrame(frame);};draw();
}
function renderSubtract(focus=false){
  cancelAnimationFrame(subtractAnimation);
  document.querySelector('#subtract-progress').textContent=subtractIndex===5?'5 题完成':`第 ${subtractIndex+1} / 5 题`;
  document.querySelector('#subtract-dots').innerHTML=subtractQuestions.map((_,i)=>`<i class="${subtractLog.records[i].done?'done':''} ${i===subtractIndex?'current':''}"></i>`).join('');
  if(subtractIndex===5){finishSubtract();return;}
  const q=subtractQuestions[subtractIndex],r=subtractLog.records[subtractIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${subtractEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="subtract-answer">留下你的理由或关键步骤</label><textarea id="subtract-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话就好。"></textarea><label class="reason-unsure"><input id="subtract-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':'<label for="subtract-number">计算结果（只填数字）</label><div class="subtract-number-input"><input id="subtract-number" type="text" inputmode="decimal" autocomplete="off" placeholder="最后的数值是多少？"></div>';

  subtractTask.innerHTML=`<div class="subtract-layout"><article class="subtract-scene">${subtractScene(subtractIndex)}</article><section class="reading-work subtract-work"><p class="skill-label">${q.skill}</p><h2 id="subtract-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-subtract">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="subtract-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="subtract-method">暂时不会，看看方法</button>':''}<div id="subtract-review" hidden></div><div id="subtract-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-subtract" disabled>${subtractIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#subtract-message'),submit=document.querySelector('#submit-subtract'),next=document.querySelector('#next-subtract');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(subtractIndex!==0||document.querySelector('.subtract-lab'))return;document.querySelector('#subtract-lab-slot').innerHTML=subtractLabMarkup();bindSubtractLab();const details=document.querySelector('.subtract-lab');details.addEventListener('toggle',()=>{if(details.open)subtractLog.help(subtractIndex,'打开有理数减法模型');});}
  function finishClosed(){subtractTask.querySelectorAll('[data-choice],#subtract-number,#submit-subtract,#subtract-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#subtract-answer').value.trim();if(!text&&!document.querySelector('#subtract-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#subtract-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)subtractLog.submit(subtractIndex,answer,null,answer);subtractLog.finish(subtractIndex,button.dataset.self);subtractTask.querySelectorAll('textarea,input,#submit-subtract,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  subtractTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);subtractTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)subtractLog.submit(subtractIndex,answer,null,answer);if(first)subtractLog.help(subtractIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#subtract-number').value,value=SubtractLesson.readNumber(raw);if(value===null){say('只填一个数字；不要填单位或未计算的算式。',true);return;}answer=raw.trim();correct=value===q.answer;}
    subtractLog.submit(subtractIndex,answer,correct);if(correct){subtractLog.finish(subtractIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(subtractIndex===0)showLab();}
  };
  if(!open)document.querySelector('#subtract-method').onclick=()=>{if(!r.first)subtractLog.submit(subtractIndex,'暂时不会，选择查看方法',false);subtractLog.help(subtractIndex,'查看本题方法');subtractLog.finish(subtractIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(subtractTask,subtractLog,subtractIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{subtractIndex++;renderSubtract(true);};
  if(focus){document.querySelector('#subtract-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishSubtract(){
  subtractTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p>减去一个数，等于加上它的相反数。用“减数＋差＝被减数”还能反过来检查。</p><div class="finish-contrast"><p><b>减去负数</b>结果比原来大，但不一定是正数</p><p><b>减去正数 / 0</b>分别变小 / 不变，不能都向右走</p></div><p class="finish-note">3题核对了运算与辨错，2题保留了你的解释。注意减法符号与负数符号的不同任务。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-subtract">重新练这5题（保留旧记录）</button></section>${subtractLog.html()}`;
  document.querySelector('#restart-subtract').onclick=()=>{subtractLog=LearningFeedback.create(SubtractLesson.title,subtractQuestions,true);subtractLog.save();subtractIndex=0;renderSubtract(true);};subtractTask.querySelector('h2').focus({preventScroll:true});
}
renderSubtract();
