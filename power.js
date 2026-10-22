'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='power'))LearningFeedback.courses.push(['power',PowerLesson.title,'power.html']);
const powerQuestions=PowerLesson.questions,powerEscape=LearningFeedback.esc;
const powerTask=document.querySelector('#power-task');
let powerLog=LearningFeedback.create(PowerLesson.title,powerQuestions),powerIndex=powerLog.index,powerTimer=null;
function powerScene(index){
 if(index===0)return `<p class="scene-kicker">一样的数字，不一样的位置</p><h2>把3和4的位置看清楚</h2><div class="power-comparison"><p><b>3<sup>4</sup></b>4写在右上角</p><p><b>3 × 4</b>中间是乘号</p></div><p class="source-note">先选展开方式，再操作因子卡验证。</p>`;
 if(index===1)return `<p class="scene-kicker">这次把负数作为一个整体</p><h2>底数是括号里的−2</h2><div class="power-symbol">(−2)<sup>3</sup></div><p>每次作为因子的都是同一个数。先写出因子，再决定结果的符号。</p>`;
 if(index===2)return `<p class="scene-kicker">括号影响运算范围</p><h2>负号被括进去了吗？</h2><div class="power-comparison"><p><b>−3<sup>2</sup></b>没有括号</p><p><b>(−3)<sup>2</sup></b>有括号</p></div><p class="source-note">说清底数是谁，比只记正负号更可靠。</p>`;
 if(index===3)return `<p class="scene-kicker">换成分数与0试一试</p><h2>结果一定比底数大吗？</h2><div class="power-comparison"><p><b>(1/2)<sup>2</sup></b>二分之一的平方</p><p><b>0<sup>3</sup></b>0的立方</p></div><p>这里的1/2是分数，括号表示整个分数参与平方。</p>`;
 return `<p class="scene-kicker">探测器复制游戏</p><h2>“新增2个”与“变成2倍”一样吗？</h2><div class="power-facts"><p><b>开始：1个探测器</b>连续运行2轮</p><p>每轮每个已有探测器各复制2个新的<br><b>原来的也保留</b></p><p>新探测器从下一轮才参与复制</p></div><p class="source-note">先从一轮的总数变化确定底数，再把相同倍数连乘。</p>`;
}
function labMarkup(){return `<details class="power-lab" data-help="查看乘方因子模型"><summary>动手拆开：谁重复乘了几次？</summary><div class="power-lab-body"><label for="power-base">选一个数</label><select id="power-base">${PowerLesson.bases.map(b=>`<option value="${b}">${PowerLesson.fmt(PowerLesson.rational(b*2,2))}</option>`).join('')}</select><label for="power-n">正整数指数 <output id="power-n-label"></output></label><input id="power-n" type="range" min="1" max="4" step="1" value="3"><div class="power-scopes" id="power-sign-controls"><button data-scope="whole">负号属于底数</button><button data-scope="outside">负号留在外面</button></div><div id="power-model"></div><div class="power-steps"><button id="power-prev">退回一步</button><button id="power-next">合并下一个因子</button></div><button class="power-play" id="power-play">播放连乘过程</button><p class="model-note">模型只讨论1—4的正整数指数，指数1表示只有一个因子，a¹＝a；0与负数也可以作底数。零指数、负整数指数和幂的运算法则另学。卡片表示因子，每增加一张卡就多一个相同因子，不表示加上一个底数。</p></div></details>`;}
function stopPower(){if(powerTimer!==null){clearInterval(powerTimer);powerTimer=null;}const b=document.querySelector('#power-play');if(b)b.textContent='播放连乘过程';}
function bindLab(){
 const cp=powerLog.checkpoint;
 let base=cp.powerBase??2,n=cp.powerN??3,scope=cp.powerScope??'whole',step=cp.powerStep??1;
 try{PowerLesson.state(base,n,scope,step);}catch{base=2;n=3;scope='whole';step=1;}
 const baseSelect=document.querySelector('#power-base'),nInput=document.querySelector('#power-n');
 function draw(){
  const s=PowerLesson.state(base,n,scope,step);baseSelect.value=base;nInput.value=n;document.querySelector('#power-n-label').textContent=n;document.querySelector('#power-sign-controls').hidden=base>=0;document.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===scope)));
  const result=step===n?`这个式子的结果：<b>${PowerLesson.fmt(s.value)}</b>`:'还没全部合并，继续看下一个因子。';
  document.querySelector('#power-model').innerHTML=`<p class="power-formula">${s.expression}</p><p class="power-base-note">乘方的底数：<b>${s.baseLabel}</b>；指数：<b>${n}</b></p>${scope==='outside'?'<p class="outside-note">外面的−号先保留，框内连乘算完再取相反数。</p>':''}<div class="factor-line ${scope==='outside'?'outside-frame':''}" aria-label="展开：${s.expansion}">${s.factors.map((f,i)=>`${i?'<span class="times">×</span>':''}<span class="factor-card ${i<step?'used':''} ${i===step-1?'current':''}">${f}</span>`).join('')}</div><p class="power-step-note">已合并 ${step} / ${n} 个因子</p><div class="product-chain">${s.products.slice(0,step).map((v,i)=>`${i?'<span>→</span>':''}<b>${PowerLesson.fmt(v)}</b>`).join('')}</div><p class="power-result" role="status">${result}</p><p class="power-rule">${scope==='outside'?'这里参与连乘的是正底数，外面的负号只在最后取相反数；不能把它算成每张卡都有负号。':base<0?`共${n}个负因子：${n%2?'奇数个，结果为负':'偶数个，结果为正'}。可以两两配对理解。`:base===0?'正整数个0相乘仍是0。':base===.5?'分数连乘：1/2、1/4、1/8……，结果可能变小。':'先重复写出底数，再逐步相乘；不要把底数乘指数。'}</p>`;
  document.querySelector('#power-prev').disabled=step===1;document.querySelector('#power-next').disabled=step===n;document.querySelector('#power-play').disabled=n===1;
 }
 function update(){powerLog.point({powerBase:base,powerN:n,powerScope:scope,powerStep:step});powerLog.draft(powerIndex,{'power-base':String(base),'power-n':String(n)});powerLog.help(powerIndex,'操作乘方因子模型');draw();}
 baseSelect.onchange=()=>{stopPower();base=Number(baseSelect.value);if(base>=0)scope='whole';step=1;update();};nInput.oninput=()=>{stopPower();n=Number(nInput.value);step=1;update();};document.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>{stopPower();scope=b.dataset.scope;step=1;update();});document.querySelector('#power-prev').onclick=()=>{stopPower();step=Math.max(1,step-1);update();};document.querySelector('#power-next').onclick=()=>{stopPower();step=Math.min(n,step+1);update();};document.querySelector('#power-play').onclick=()=>{if(powerTimer!==null){stopPower();return;}if(step===n)step=1;update();document.querySelector('#power-play').textContent='暂停播放';powerTimer=setInterval(()=>{step++;update();if(step>=n)stopPower();},1000);};draw();
}
function renderPower(focus=false){
  stopPower();
  document.querySelector('#power-progress').textContent=powerIndex===5?'5 题完成':`第 ${powerIndex+1} / 5 题`;
  document.querySelector('#power-dots').innerHTML=powerQuestions.map((_,i)=>`<i class="${powerLog.records[i].done?'done':''} ${i===powerIndex?'current':''}"></i>`).join('');
  if(powerIndex===5){finishPower();return;}
  const q=powerQuestions[powerIndex],r=powerLog.records[powerIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${powerEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="power-answer">用自己的话，留下你的解释</label><textarea id="power-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="power-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`<label for="power-number">${q.label}</label><div class="number-answer"><input id="power-number" inputmode="decimal" autocomplete="off" maxlength="30"><span>${q.unit}</span></div>`;
  powerTask.innerHTML=`<div class="power-layout"><article class="power-scene">${powerScene(powerIndex)}</article><section class="reading-work power-work"><p class="skill-label">${q.skill}</p><h2 id="power-question" tabindex="-1">${q.title}</h2><p class="power-task-context">${powerEscape(q.context)}</p>${entry}<button class="primary" id="submit-power">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="power-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="power-method">暂时不会，看看方法</button>':''}<div id="power-review" hidden></div><div id="power-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-power" disabled>${powerIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#power-message'),submit=document.querySelector('#submit-power'),next=document.querySelector('#next-power');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(powerIndex!==0||document.querySelector('.power-lab'))return;document.querySelector('#power-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.power-lab');details.addEventListener('toggle',()=>{if(details.open)powerLog.help(powerIndex,'查看乘方因子模型');});}
  function finishClosed(){powerTask.querySelectorAll('[data-choice],#power-number,#submit-power,#power-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#power-answer').value.trim();if(!text&&!document.querySelector('#power-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#power-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)powerLog.submit(powerIndex,answer,null,answer);powerLog.finish(powerIndex,button.dataset.self);powerTask.querySelectorAll('textarea,input,#submit-power,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  powerTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);powerTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)powerLog.submit(powerIndex,answer,null,answer);if(first)powerLog.help(powerIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#power-number').value;const value=PowerLesson.readNumber(raw);if(value===null){say('这里只填计算结果，例如 −8。',true);return;}answer=raw.trim()+(q.unit?' '+q.unit:'');correct=value===q.answer;}
    powerLog.submit(powerIndex,answer,correct);if(correct){powerLog.finish(powerIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(powerIndex===0)showLab();}
  };
  if(!open)document.querySelector('#power-method').onclick=()=>{if(!r.first)powerLog.submit(powerIndex,'暂时不会，选择查看方法',false);powerLog.help(powerIndex,'查看本题方法');powerLog.finish(powerIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(powerTask,powerLog,powerIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{powerIndex++;renderPower(true);};
  if(focus){document.querySelector('#power-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishPower(){
  powerTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>先认底数，再数因子，最后逐步相乘。</strong></p><p>正整数指数表示底数作为因子的个数；括号决定负号是否属于底数。结果不一定变大，情境中的倍数也不一定等于新增数量。</p><p class="finish-note">2题判断、1题数值、2题解释与迁移。参考后的自检不等于独立掌握；以后换一种算式或复制规则，还要自己找出底数和指数，并解释为什么这样列式。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-power">重新练这5题（保留旧记录）</button></section>${powerLog.html()}`;
  document.querySelector('#restart-power').onclick=()=>{powerLog=LearningFeedback.create(PowerLesson.title,powerQuestions,true);powerLog.save();powerIndex=0;renderPower(true);};powerTask.querySelector('h2').focus({preventScroll:true});
}
renderPower();
