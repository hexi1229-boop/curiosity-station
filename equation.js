'use strict';
const equationQuestions=EquationLesson.questions,eqEscape=LearningFeedback.esc;
const equationTask=document.querySelector('#equation-task');
let equationLog=LearningFeedback.create(EquationLesson.title,equationQuestions),equationIndex=equationLog.index;
function cargoScene(index){
  if(index===0)return '<h2>发货前，算清箱子质量</h2><div class="cargo-tokens" aria-hidden="true"><span class="cargo-box">x</span><span class="cargo-box">x</span><span class="cargo-box">x</span><b>＋</b><span class="cargo-weight">6 kg</span></div><p>3只质量相同的箱子，加上6千克砝码，与21千克砝码平衡。每只箱子的质量记作 <b>x 千克</b>。</p><p class="cargo-equation">3x＋6＝21</p><p class="cargo-note">3x 就是 3×x。等号表示左右两边的数量相等。</p>';
  if(index===1)return '<h2>从一组，看见一份</h2><div class="cargo-tokens" aria-hidden="true"><span class="cargo-box">x</span><span class="cargo-box">x</span><span class="cargo-box">x</span></div><p>3只质量相同的箱子，共15千克。</p><p class="cargo-equation">3x＝15 → x＝5</p><p class="cargo-note">这次不比计算速度，讲清这一步为什么成立。</p>';
  if(index===2)return '<h2>这一步，看起来很熟？</h2><p>小宇写了这样的解法：</p><p class="cargo-equation">4x−8＝20<br>↓<br>4x＝20−8<br>↓<br>x＝3</p><p class="cargo-note">先检查第一步。不能只凭“数字换了一边”决定符号。</p>';
  if(index===3)return '<h2>模拟飞行馆的收费单</h2><p><b>开卡费：4元</b>，只收一次。<br><b>体验费：3元 / 轮</b>。</p><p class="cargo-equation">一共付了 25 元</p><p>没有其他费用。小林体验了几轮？</p>';
  return '<h2>最后一题，交给你</h2><p class="cargo-equation">4x−3＝2x＋9</p><p>写出一个简短解法，并把结果代回原式检查。可以先在纸上算好，再输入关键步骤。</p><p class="cargo-note">这次等号两边都有x。找一个能让问题变简单的同量操作。</p>';
}
function labMarkup(){return `<details class="cargo-lab" data-help="天秤互动演示"><summary>动手验证：只动一边会怎样？</summary><div class="cargo-lab-body"><p>前两个按钮各自从原来的平衡天秤开始。第三步把两边剩下的质量都分成3份。</p><svg viewBox="0 0 360 210" role="img" aria-label="表示等式的天秤"><path d="M180 63 L155 190 H205 Z" fill="#bfcbb0"/><rect x="134" y="187" width="92" height="10" rx="5" fill="#65846c"/><g class="cargo-beam" id="cargo-beam"><path d="M56 62 H304" stroke="#527c66" stroke-width="7" stroke-linecap="round"/><path d="M70 62 V142 M290 62 V142" stroke="#7b9374" stroke-width="3"/><path d="M18 142 H122 Q117 159 70 159 Q23 159 18 142 M238 142 H342 Q337 159 290 159 Q243 159 238 142" fill="#e0e8cf" stroke="#8a9e7c" stroke-width="2"/><g id="cargo-left"></g><rect x="257" y="97" width="66" height="43" rx="7" fill="#ebd89f"/><text id="cargo-right" x="290" y="124" text-anchor="middle" font-size="17" fill="#655530">21 kg</text></g><circle cx="180" cy="62" r="8" fill="#e2be73"/></svg><p class="balance-equation" id="balance-equation">3x＋6＝21</p><p class="balance-caption" id="balance-caption" role="status"></p><div class="cargo-controls"><button data-stage="one">只减左边 6</button><button data-stage="both">两边各减 6</button><button data-stage="divide" disabled>再把两边都 ÷3</button><button data-stage="start">恢复原式</button></div><p class="equation-rules"><strong>等式变形的依据</strong><br>两边加上或减去同一个数（或同一个有意义的式子），仍然相等。两边同乘或同除一个非零数，解也不变。</p><p>不能除以0。两边都乘0虽然得到0＝0，却丢掉了关于x的信息，不能据此求出x。</p></div></details>`;}
function bindLab(){
  const lab=document.querySelector('.cargo-lab');if(!lab)return;
  function draw(stage){
    const s=EquationLesson.balanceState(stage);
    document.querySelector('#cargo-beam').style.transform=`rotate(${s.tilt}deg)`;
    document.querySelector('#cargo-left').innerHTML=Array.from({length:s.boxes},(_,i)=>{const x=s.boxes===1?55:25+i*31;return `<rect x="${x}" y="${s.leftMass?77:103}" width="28" height="35" rx="4" fill="#d7e4c7" stroke="#6b8a70"/><text x="${x+14}" y="${s.leftMass?101:127}" text-anchor="middle" font-size="20" fill="#315947">x</text>`;}).join('')+(s.leftMass?'<rect x="48" y="114" width="44" height="26" rx="4" fill="#ebd89f"/><text x="70" y="132" text-anchor="middle" font-size="13" fill="#655530">6 kg</text>':'');
    document.querySelector('#cargo-right').textContent=s.rightMass+' kg';
    const formula=document.querySelector('#balance-equation');formula.textContent=s.equation;formula.classList.toggle('invalid',stage==='one');
    document.querySelector('#balance-caption').textContent=s.caption;
    lab.querySelectorAll('[data-stage]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.stage===stage));if(button.dataset.stage==='divide')button.disabled=stage!=='both';});
  }
  lab.querySelectorAll('[data-stage]').forEach(button=>button.onclick=()=>{equationLog.help(equationIndex,'天秤操作：'+button.textContent);draw(button.dataset.stage);});draw('start');
}
function renderEquation(focus=false){
  document.querySelector('#equation-progress').textContent=equationIndex===5?'5 题完成':`第 ${equationIndex+1} / 5 题`;
  document.querySelector('#equation-dots').innerHTML=equationQuestions.map((_,i)=>`<i class="${equationLog.records[i].done?'done':''} ${i===equationIndex?'current':''}"></i>`).join('');
  if(equationIndex===5){finishEquation();return;}
  const q=equationQuestions[equationIndex],r=equationLog.records[equationIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${eqEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="equation-answer">留下你的理由或关键步骤</label><textarea id="equation-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话或几个算式就好。"></textarea><label class="reason-unsure"><input id="equation-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`<label for="equation-number">${q.label}</label><div class="number-answer"><input id="equation-number" inputmode="decimal" autocomplete="off" maxlength="30"><span>${q.unit}</span></div>`;
  equationTask.innerHTML=`<div class="equation-layout"><article class="cargo-card">${cargoScene(equationIndex)}</article><section class="reading-work equation-work"><p class="skill-label">${q.skill}</p><h2 id="equation-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-equation">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="equation-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="equation-method">暂时不会，看看方法</button>':''}<div id="equation-review" hidden></div><div id="equation-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-equation" disabled>${equationIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#equation-message'),submit=document.querySelector('#submit-equation'),next=document.querySelector('#next-equation');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(equationIndex!==0||document.querySelector('.cargo-lab'))return;document.querySelector('#equation-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.cargo-lab');details.addEventListener('toggle',()=>{if(details.open)equationLog.help(equationIndex,'天秤互动演示');});}
  function finishClosed(){equationTask.querySelectorAll('[data-choice],#equation-number,#submit-equation,#equation-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#equation-answer').value.trim();if(!text&&!document.querySelector('#equation-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#equation-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)equationLog.submit(equationIndex,answer,null,answer);equationLog.finish(equationIndex,button.dataset.self);equationTask.querySelectorAll('textarea,input,#submit-equation,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  equationTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);equationTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)equationLog.submit(equationIndex,answer,null,answer);if(first)equationLog.help(equationIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#equation-number').value;const value=EquationLesson.numberValue(raw);if(value===null){say('这里填一个数字就好，例如 2。',true);return;}answer=raw.trim()+' '+q.unit;correct=value===q.answer;}
    equationLog.submit(equationIndex,answer,correct);if(correct){equationLog.finish(equationIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(equationIndex===0)showLab();}
  };
  if(!open)document.querySelector('#equation-method').onclick=()=>{if(!r.first)equationLog.submit(equationIndex,'暂时不会，选择查看方法',false);equationLog.help(equationIndex,'查看本题方法');equationLog.finish(equationIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(equationTask,equationLog,equationIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{equationIndex++;renderEquation(true);};
  if(focus){document.querySelector('#equation-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishEquation(){
  equationTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>解方程，是把相等关系一步步变简单，直到看见未知数。</p><div class="equation-finish-steps"><span>找相等关系</span><span>两边做对应操作</span><span>代回原式检查</span></div><p>“移项变号”的背后，是两边加上或减去同一个量。记得：乘除时用非零数。</p><p class="finish-note">3题核对了判断或数值，2题保留了理由与自检。下次换一道题，看看能否独立把每一步讲清楚。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-equation">重新练这5题（保留旧记录）</button></section>${equationLog.html()}`;
  document.querySelector('#restart-equation').onclick=()=>{equationLog=LearningFeedback.create(EquationLesson.title,equationQuestions,true);equationLog.save();equationIndex=0;renderEquation(true);};equationTask.querySelector('h2').focus({preventScroll:true});
}
renderEquation();
