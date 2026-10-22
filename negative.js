'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='negative'))LearningFeedback.courses.push(['negative',NegativeLesson.title,'negative.html']);
const negativeQuestions=NegativeLesson.questions,negativeEscape=LearningFeedback.esc;
const negativeTask=document.querySelector('#negative-task');
let negativeLog=LearningFeedback.create(NegativeLesson.title,negativeQuestions),negativeIndex=negativeLog.index;
const signed=value=>String(Object.is(value,-0)?0:value).replace('-','−');
function axisSvg(a,b=null,distance=false){
  const x=NegativeLesson.position,points=[{value:a,label:b===null?'P':'甲',color:'#477e91',y:70},...(b===null?[]:[{value:b,label:'乙',color:'#b87351',y:151}])];
  const ticks=Array.from({length:21},(_,i)=>i-10).map(n=>`<path d="M${x(n)} 105V${n%5===0?119:115}" stroke="#9ba995" stroke-width="1.3"/>${n%5===0?`<text x="${x(n)}" y="135" text-anchor="middle">${signed(n)}</text>`:''}`).join('');
  const marks=points.map((p,i)=>`<path d="M${x(p.value)} ${p.y+5}V110" stroke="${p.color}" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="${x(p.value)}" cy="110" r="${i===0?7:4}" fill="${i===0?'#fffefa':p.color}" stroke="${p.color}" stroke-width="2"/><text x="${Math.max(42,Math.min(318,x(p.value)))}" y="${p.y}" text-anchor="middle" style="fill:${p.color}" class="axis-point-label">${p.label}：${signed(p.value)}</text>`).join('');
  const bracket=distance?`<path d="M${x(a)} 167V176H${x(0)}V167" fill="none" stroke="#b18b4c" stroke-width="2"/><text x="${(x(a)+x(0))/2}" y="200" text-anchor="middle" class="axis-distance-label">到原点的距离</text>`:'';
  return `<svg class="negative-axis" viewBox="0 0 360 ${distance?222:180}" role="img" aria-label="向右为正的数轴，${points.map(p=>p.label+'在'+signed(p.value)).join('，')}，每小格1个单位"><text x="180" y="27" text-anchor="middle" class="axis-direction">向右为正，单位长度相同 →</text><path d="M12 110H349 M342 105L350 110L342 115" stroke="#71866a" stroke-width="2" fill="none"/>${ticks}<path d="M180 96V119" stroke="#536e48" stroke-width="2.5"/>${marks}${bracket}</svg>`;
}
function thermometerSvg(a,b){
  const tube=(value,center,label,color)=>{const s=NegativeLesson.temperature(value);return `<g><text x="${center}" y="26" text-anchor="middle" class="thermo-name">${label} ${signed(value)}℃</text><rect x="${center-11}" y="41" width="22" height="223" rx="11" fill="#edf1e7" stroke="#abbda5" stroke-width="2"/><rect x="${center-6}" y="${s.y}" width="12" height="${s.height}" fill="${color}"/><circle cx="${center}" cy="271" r="18" fill="${color}" stroke="#fffefa" stroke-width="5"/>${[-10,-5,0,5,10].map(n=>`<path d="M${center+15} ${150-n*10}H${center+23}" stroke="#9bab95"/><text x="${center+29}" y="${155-n*10}">${signed(n)}</text>`).join('')}</g>`;};
  return `<svg class="negative-thermometers" viewBox="0 0 360 300" role="img" aria-label="同尺度温度计：甲${signed(a)}摄氏度，乙${signed(b)}摄氏度"><path d="M30 150H330" stroke="#b8c4ad" stroke-dasharray="4 4"/>${tube(a,88,'甲','#477e91')}${tube(b,244,'乙','#b87351')}</svg>`;
}
function readingCards(a,b,unit='℃'){return `<div class="signed-cards"><div><span>甲${unit==='℃'?'地':'潜水器'}</span><strong>${signed(a)}<small>${unit}</small></strong></div><div><span>乙${unit==='℃'?'地':'潜水器'}</span><strong>${signed(b)}<small>${unit}</small></strong></div></div>`;}
function negativeScene(index){
  if(index===0)return `<h2>天气站发来两个读数</h2><div class="weather-symbol" aria-hidden="true">☁</div>${readingCards(-8,-3)}<p>同一时刻的温度。先用自己的办法判断哪一地更暖。</p><p class="source-note">先提交，再打开温度计和数轴动手查看。</p>`;
  if(index===1)return `<h2>找到两点，再解释依据</h2>${axisSvg(-7,-2)}<div class="claim-card">“7比2大，所以−7比−2大。”</div><p>这里的7与2表示离0的距离。比较带负号的两个数，还要看它们的位置。</p>`;
  if(index===2)return `<h2>原点两侧，同样远</h2>${axisSvg(-4,4)}<div class="claim-card">“距离相同，所以数也相等。”</div><p>从0向左4格与向右4格，到了同一个位置吗？</p>`;
  if(index===3)return `<h2>从点P量到原点</h2>${axisSvg(-6,null,true)}<p>每一小格是1个单位。<br><strong>位置</strong>写作−6，<strong>距离</strong>该怎样写？</p><p class="source-note">|−6| 读作“负六的绝对值”。</p>`;
  return `<h2>同一海面，两个位置</h2><div class="sea-datum"><span>↑ 向上为正</span><strong>海面 = 0米</strong><span>海面以下记为负</span></div>${readingCards(-2.5,-6,'米')}<p>这是位置资料卡。分别回答“位置更高”和“离海面更远”，再说明依据。</p>`;
}
function labMarkup(){return `<details class="negative-lab" data-help="查看温度计与数轴"><summary>动手比较：更大，还是离零更远？</summary><div class="negative-lab-body"><div id="negative-model"></div><div class="temperature-controls"><label for="negative-a">甲地温度 <output id="negative-a-value"></output></label><input id="negative-a" type="range" min="-10" max="10" step="1"><label for="negative-b">乙地温度 <output id="negative-b-value"></output></label><input id="negative-b" type="range" min="-10" max="10" step="1"></div><p class="negative-relation" id="negative-relation" role="status"></p><div class="negative-presets"><button data-preset="-8,-3">都在0左侧</button><button data-preset="-4,4">跨过0</button><button data-preset="3,8">都在0右侧</button><button data-preset="0,0">重合在0</button></div><p class="model-rule"><b>比较大小</b>：数轴向右为正，右边的数大。<br><b>比较绝对值</b>：看离0多远，距离不带负号。</p><p class="source-note">这是−10到10的局部数轴，数轴向两端无限延伸。原点是0；同一数轴单位长度一致。</p></div></details>`;}
function bindLab(){
  const a=document.querySelector('#negative-a'),b=document.querySelector('#negative-b'),saved=negativeLog.checkpoint.negative;
  const valid=n=>Number.isInteger(n)&&n>=-10&&n<=10;
  a.value=valid(saved?.a)?saved.a:-8;b.value=valid(saved?.b)?saved.b:-3;
  function draw(){const av=Number(a.value),bv=Number(b.value);document.querySelector('#negative-model').innerHTML=thermometerSvg(av,bv)+axisSvg(av,bv);document.querySelector('#negative-a-value').textContent=signed(av)+'℃';document.querySelector('#negative-b-value').textContent=signed(bv)+'℃';a.setAttribute('aria-valuetext',signed(av)+'摄氏度');b.setAttribute('aria-valuetext',signed(bv)+'摄氏度');document.querySelector('#negative-relation').textContent=`数的大小：${signed(av)} ${NegativeLesson.compare(av,bv)} ${signed(bv)}\n离0的距离：甲 ${Math.abs(av)}，乙 ${Math.abs(bv)}`;}
  function save(label){negativeLog.point({negative:{a:Number(a.value),b:Number(b.value)}});negativeLog.help(negativeIndex,label);draw();}
  a.oninput=b.oninput=()=>save('调整温度与数轴位置');document.querySelectorAll('[data-preset]').forEach(button=>button.onclick=()=>{[a.value,b.value]=button.dataset.preset.split(',');save('示例：'+button.textContent);});draw();
}
function renderNegative(focus=false){
  document.querySelector('#negative-progress').textContent=negativeIndex===5?'5 题完成':`第 ${negativeIndex+1} / 5 题`;
  document.querySelector('#negative-dots').innerHTML=negativeQuestions.map((_,i)=>`<i class="${negativeLog.records[i].done?'done':''} ${i===negativeIndex?'current':''}"></i>`).join('');
  if(negativeIndex===5){finishNegative();return;}
  const q=negativeQuestions[negativeIndex],r=negativeLog.records[negativeIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${negativeEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="negative-answer">留下你的理由或关键步骤</label><textarea id="negative-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话就好。"></textarea><label class="reason-unsure"><input id="negative-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':'<label for="negative-number">|−6| 的值（只填数字）</label><div class="distance-input"><input id="negative-number" type="text" inputmode="decimal" autocomplete="off" placeholder="距离是几个单位？"><span>个单位</span></div>';

  negativeTask.innerHTML=`<div class="negative-layout"><article class="negative-scene">${negativeScene(negativeIndex)}</article><section class="reading-work negative-work"><p class="skill-label">${q.skill}</p><h2 id="negative-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-negative">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="negative-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="negative-method">暂时不会，看看方法</button>':''}<div id="negative-review" hidden></div><div id="negative-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-negative" disabled>${negativeIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#negative-message'),submit=document.querySelector('#submit-negative'),next=document.querySelector('#next-negative');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(negativeIndex!==0||document.querySelector('.negative-lab'))return;document.querySelector('#negative-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.negative-lab');details.addEventListener('toggle',()=>{if(details.open)negativeLog.help(negativeIndex,'查看温度计与数轴');});}
  function finishClosed(){negativeTask.querySelectorAll('[data-choice],#negative-number,#submit-negative,#negative-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#negative-answer').value.trim();if(!text&&!document.querySelector('#negative-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#negative-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)negativeLog.submit(negativeIndex,answer,null,answer);negativeLog.finish(negativeIndex,button.dataset.self);negativeTask.querySelectorAll('textarea,input,#submit-negative,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  negativeTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);negativeTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)negativeLog.submit(negativeIndex,answer,null,answer);if(first)negativeLog.help(negativeIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#negative-number').value,value=NegativeLesson.readNumber(raw);if(value===null){say('只填一个数字；不要填单位或未计算的算式。',true);return;}answer=raw.trim();correct=value===q.answer;}
    negativeLog.submit(negativeIndex,answer,correct);if(correct){negativeLog.finish(negativeIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(negativeIndex===0)showLab();}
  };
  if(!open)document.querySelector('#negative-method').onclick=()=>{if(!r.first)negativeLog.submit(negativeIndex,'暂时不会，选择查看方法',false);negativeLog.help(negativeIndex,'查看本题方法');negativeLog.finish(negativeIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(negativeTask,negativeLog,negativeIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{negativeIndex++;renderNegative(true);};
  if(focus){document.querySelector('#negative-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishNegative(){
  negativeTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>数的大小看位置，绝对值看距离。先确定0、正方向和单位长度，再比较。</p><div class="finish-contrast"><p><b>数的大小</b>−8 ＜ −3</p><p><b>到0的距离</b>|−8| = 8 ＞ 3 = |−3|</p></div><p class="finish-note">3题核对了判断或数值，2题保留了理由。相反数在原点两侧同样远（0的相反数还是0）；绝对值不能为负，但可以是0。换个情境，也先分清问的是位置还是距离。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-negative">重新练这5题（保留旧记录）</button></section>${negativeLog.html()}`;
  document.querySelector('#restart-negative').onclick=()=>{negativeLog=LearningFeedback.create(NegativeLesson.title,negativeQuestions,true);negativeLog.save();negativeIndex=0;renderNegative(true);};negativeTask.querySelector('h2').focus({preventScroll:true});
}
renderNegative();
