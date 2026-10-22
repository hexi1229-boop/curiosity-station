'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='contour'))LearningFeedback.courses.push(['contour',ContourLesson.title,'contour.html']);
const contourQuestions=ContourLesson.questions,contourEscape=LearningFeedback.esc;
const contourTask=document.querySelector('#contour-task');
let contourLog=LearningFeedback.create(ContourLesson.title,contourQuestions),contourIndex=contourLog.index;
function contourSvg(height=null,probe=false){
  const rings=ContourLesson.levels.map(h=>{const r=ContourLesson.ring(h);return `<ellipse cx="180" cy="130" rx="${r.rx}" ry="${r.ry}" fill="none" stroke="#95aa7b" stroke-width="1.6"/><text x="${180+r.rx*Math.sqrt(3)/2+3}" y="${134-r.ry/2}" class="contour-label">${h}</text>`;}).join('');
  const start=ContourLesson.routeState(100),end=ContourLesson.routeState(500),point=ContourLesson.probePoint();
  const routes=probe?`<circle cx="${point.x}" cy="${point.y}" r="5" fill="#477e91" stroke="#fffefa" stroke-width="2"/><text x="${point.x-9}" y="${point.y-10}" class="probe-label">P</text>`:`<path d="M${start.a.x} ${start.a.y}L${end.a.x} ${end.a.y}" stroke="#477e91" stroke-width="3.5"/><path d="M${start.b.x} ${start.b.y}L${end.b.x} ${end.b.y}" stroke="#b87351" stroke-width="3.5"/>${['a','b'].map((id,i)=>`<circle cx="${start[id].x}" cy="${start[id].y}" r="4" fill="#fffefa" stroke="${i?'#b87351':'#477e91'}" stroke-width="2"/><circle cx="${end[id].x}" cy="${end[id].y}" r="4" fill="${i?'#b87351':'#477e91'}"/>`).join('')}<text x="196" y="238" class="route-a-label">A</text><text x="17" y="115" class="route-b-label">B</text>`;
  let markers='';if(height!==null&&!probe){const s=ContourLesson.routeState(height);markers=`<circle cx="${s.a.x}" cy="${s.a.y}" r="7" fill="#477e91" stroke="#fffefa" stroke-width="2.5"/><circle cx="${s.b.x}" cy="${s.b.y}" r="7" fill="#b87351" stroke="#fffefa" stroke-width="2.5"/>`;}
  return `<svg class="contour-map" viewBox="0 0 360 292" role="img" aria-label="等高线图，标注单位米，等高距100米。${probe?'P不在等高线上，位于标有300和400的相邻线之间。':'A沿图中下侧、B沿左侧，均从100米至500米。'}"><ellipse cx="180" cy="130" rx="160" ry="90" fill="#edf2df"/>${rings}${routes}<text x="180" y="134" text-anchor="middle" class="summit-label">600</text>${markers}<path d="M24 265H64 M24 261V269 M64 261V269" stroke="#62775e" stroke-width="2"/><text x="24" y="283" text-anchor="middle">0</text><text x="64" y="283" text-anchor="middle">400米</text><text x="222" y="278" class="map-note">标注单位：米</text></svg>`;
}
function profileSvg(height){
  const state=ContourLesson.routeState(height),end=ContourLesson.routeState(500),p=ContourLesson.profilePoint;
  const ticksX=[0,400,800,1200].map(n=>`<path d="M${p(n,100).x} 150V155" stroke="#a7b49a"/><text x="${p(n,100).x}" y="174" text-anchor="middle">${n}</text>`).join('');
  const ticksY=[100,300,500].map(n=>`<path d="M41 ${p(0,n).y}H310" stroke="#d1d9c3" stroke-dasharray="3 4"/><text x="35" y="${p(0,n).y+4}" text-anchor="end">${n}</text>`).join('');
  const lines=['a','b'].map((id,i)=>{const e=p(end[id].distance,500),now=p(state[id].distance,height),color=i?'#b87351':'#477e91';return `<path d="M45 150L${e.x} ${e.y}" stroke="${color}" stroke-width="3" fill="none"/><circle cx="${now.x}" cy="${now.y}" r="${i?4:7}" fill="${i?color:'#fffefa'}" stroke="${color}" stroke-width="2"/><text x="${e.x}" y="${e.y-12}" text-anchor="middle" class="${i?'route-b-label':'route-a-label'}">${i?'B':'A'}</text>`;}).join('');
  return `<svg class="contour-profile" viewBox="0 0 360 220" role="img" aria-label="同尺度侧面图，A升高400米对应水平720米，B对应1280米。当前两点海拔${height}米。"><text x="45" y="27">海拔（米）</text>${ticksY}<path d="M45 45V150H320" stroke="#8ea07d" stroke-width="1.5" fill="none"/>${ticksX}${lines}<text x="185" y="202" text-anchor="middle">水平距离（米）</text></svg>`;
}
function heightSvg(){return `<svg class="height-diagram" viewBox="0 0 360 270" role="img" aria-label="海平面0米，营地海拔100米，山顶海拔600米，求两者高差"><path d="M30 235H330" stroke="#8ba8ad" stroke-width="2"/><path d="M105 235V205 M235 235V55" stroke="#bdc9ac" stroke-width="3"/><path d="M105 205H300 M235 55H300" stroke="#b7c3a7" stroke-dasharray="4 4"/><path d="M292 55H302V205H292" stroke="#b59055" stroke-width="2" fill="none"/><circle cx="105" cy="205" r="5" fill="#477e91"/><path d="M229 57L235 47L241 57Z" fill="#768d5a"/><text x="105" y="172" text-anchor="middle">营地</text><text x="105" y="192" text-anchor="middle">100米</text><text x="235" y="24" text-anchor="middle">山顶</text><text x="235" y="43" text-anchor="middle">600米</text><text x="315" y="131" text-anchor="middle" class="difference-label">?</text><text x="180" y="258" text-anchor="middle">同一海平面：0米</text></svg>`;}
function routeKey(){return '<div class="route-key"><span><i class="route-a"></i>A路线</span><span><i class="route-b"></i>B路线</span><span>均从100米到500米</span></div>';}
function contourScene(index){
  if(index===0)return `<h2>同一座山，两条上山路</h2>${contourSvg()}${routeKey()}<p><b>等高线</b>连接海拔相同的点。相邻两条线的高度差叫<b>等高距</b>，这张图是100米。</p><p class="source-note">先判断，再打开侧面图对照。图中为简化山丘，路线表示从正上方看到的位置。</p>`;
  if(index===1)return `<h2>找到图中的比较依据</h2>${contourSvg()}${routeKey()}<p>两条路线都从100米升到500米。请把“升高的高度”和“水平距离”联系起来，说明理由。</p>`;
  if(index===2)return `<h2>这个点，没有标出精确海拔</h2>${contourSvg(null,true)}<p>P不在任何等高线上。沿它两侧的线，找到相邻的海拔标注，再判断哪些结论能确定。</p><p class="source-note">不要把图上“看起来在中间”当作精确测量。</p>`;
  if(index===3)return `<h2>两个海拔，同一个起点</h2>${heightSvg()}<p>海拔从海平面量起。相对高度比较两个地点之间的高度差。</p>`;
  return `<h2>换成两张不同的地图</h2><div class="contour-cards">${ContourLesson.scaleCards.map(c=>`<div><span>${c.name}</span><strong>${c.cm}<small>厘米</small></strong><p>图上水平距离<br>比例尺 <b>1∶${c.scale}</b></p><p>相邻等高线<br>升高 <b>${c.rise}米</b></p></div>`).join('')}</div><p>两段路线都跨越相邻等高线。比较它们的平均陡缓，并用数据说明。</p><p class="source-note">使用题目给出的图上距离；卡片不按实际厘米绘制，不测量屏幕。</p>`;
}
function labMarkup(){return `<details class="contour-lab" data-help="打开侧面图对照"><summary>动手对照：同时升高，看水平距离</summary><div class="contour-lab-body"><div id="contour-model"></div>${routeKey()}<label class="height-label" for="contour-height">两点当前海拔 <output id="contour-height-value"></output></label><input id="contour-height" type="range" min="100" max="500" step="10"><div class="contour-presets"><button data-height="100">回到100米</button><button data-height="200">到200米</button><button data-height="400">到400米</button><button data-height="500">到500米</button></div><p class="contour-relation" id="contour-relation" role="status"></p><div id="contour-profile"></div><p class="model-rule">两条侧面线使用<b>相同尺度</b>，横向和纵向每100米画得一样长。升高相同高度，水平距离越短就越陡。</p><p class="source-note">从正上方看，地图量到的是水平距离，不是沿坡面走过的路程。跨图比较还要核对比例尺与等高距；陡缓不能单独决定真实路线是否省力或安全。</p></div></details>`;}
function bindLab(){
  const input=document.querySelector('#contour-height'),saved=contourLog.checkpoint.contourHeight;
  input.value=Number.isInteger(saved)&&saved>=100&&saved<=500&&saved%10===0?saved:100;
  function draw(){const h=Number(input.value),s=ContourLesson.routeState(h);document.querySelector('#contour-model').innerHTML=contourSvg(h);document.querySelector('#contour-profile').innerHTML=profileSvg(h);document.querySelector('#contour-height-value').textContent=h+'米';input.setAttribute('aria-valuetext','海拔'+h+'米');document.querySelector('#contour-relation').textContent=`共同升高：${s.rise}米\nA的水平距离：${s.a.distance}米\nB的水平距离：${s.b.distance}米`;}
  function save(label){contourLog.point({contourHeight:Number(input.value)});contourLog.help(contourIndex,label);draw();}
  input.oninput=()=>save('调节共同海拔');document.querySelectorAll('[data-height]').forEach(button=>button.onclick=()=>{input.value=button.dataset.height;save('对照：'+button.textContent);});draw();
}
function renderContour(focus=false){
  document.querySelector('#contour-progress').textContent=contourIndex===5?'5 题完成':`第 ${contourIndex+1} / 5 题`;
  document.querySelector('#contour-dots').innerHTML=contourQuestions.map((_,i)=>`<i class="${contourLog.records[i].done?'done':''} ${i===contourIndex?'current':''}"></i>`).join('');
  if(contourIndex===5){finishContour();return;}
  const q=contourQuestions[contourIndex],r=contourLog.records[contourIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${contourEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="contour-answer">留下你的理由或关键步骤</label><textarea id="contour-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话就好。"></textarea><label class="reason-unsure"><input id="contour-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':'<label for="contour-number">山顶比营地高多少（只填数字）</label><div class="height-input"><input id="contour-number" type="text" inputmode="decimal" autocomplete="off" placeholder="高度差是多少米？"><span>米</span></div>';

  contourTask.innerHTML=`<div class="contour-layout"><article class="contour-scene">${contourScene(contourIndex)}</article><section class="reading-work contour-work"><p class="skill-label">${q.skill}</p><h2 id="contour-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-contour">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="contour-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="contour-method">暂时不会，看看方法</button>':''}<div id="contour-review" hidden></div><div id="contour-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-contour" disabled>${contourIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#contour-message'),submit=document.querySelector('#submit-contour'),next=document.querySelector('#next-contour');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(contourIndex!==0||document.querySelector('.contour-lab'))return;document.querySelector('#contour-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.contour-lab');details.addEventListener('toggle',()=>{if(details.open)contourLog.help(contourIndex,'打开侧面图对照');});}
  function finishClosed(){contourTask.querySelectorAll('[data-choice],#contour-number,#submit-contour,#contour-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#contour-answer').value.trim();if(!text&&!document.querySelector('#contour-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#contour-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)contourLog.submit(contourIndex,answer,null,answer);contourLog.finish(contourIndex,button.dataset.self);contourTask.querySelectorAll('textarea,input,#submit-contour,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  contourTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);contourTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)contourLog.submit(contourIndex,answer,null,answer);if(first)contourLog.help(contourIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#contour-number').value,value=ContourLesson.readNumber(raw);if(value===null){say('只填一个数字；不要填单位或未计算的算式。',true);return;}answer=raw.trim();correct=value===q.answer;}
    contourLog.submit(contourIndex,answer,correct);if(correct){contourLog.finish(contourIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(contourIndex===0)showLab();}
  };
  if(!open)document.querySelector('#contour-method').onclick=()=>{if(!r.first)contourLog.submit(contourIndex,'暂时不会，选择查看方法',false);contourLog.help(contourIndex,'查看本题方法');contourLog.finish(contourIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(contourTask,contourLog,contourIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{contourIndex++;renderContour(true);};
  if(focus){document.querySelector('#contour-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishContour(){
  contourTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>等高线告诉你相同的海拔；陡缓要把升高的高度与实际水平距离放在一起看。</p><div class="finish-contrast"><p><b>同图、相同等高距</b>同样升高，水平距离越短越陡</p><p><b>跨图比较</b>先核对比例尺与等高距</p></div><p class="finish-note">3题核对了判断或数值，2题保留了理由。海拔范围不等于精确值，海拔也不等于相对高度。换一张地图，先看标注和比较条件。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-contour">重新练这5题（保留旧记录）</button></section>${contourLog.html()}`;
  document.querySelector('#restart-contour').onclick=()=>{contourLog=LearningFeedback.create(ContourLesson.title,contourQuestions,true);contourLog.save();contourIndex=0;renderContour(true);};contourTask.querySelector('h2').focus({preventScroll:true});
}
renderContour();
