'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='grid'))LearningFeedback.courses.push(['grid',GridLesson.title,'grid.html']);
const gridQuestions=GridLesson.questions,gridEscape=LearningFeedback.esc;
const gridTask=document.querySelector('#grid-task');
let gridLog=LearningFeedback.create(GridLesson.title,gridQuestions),gridIndex=gridLog.index;
function gridScene(index){
 if(index===0)return `<p class="scene-kicker">同样的数字，不同的位置</p><h2>定位信息里，字母也不能漏</h2><div class="coordinate-cards"><p><b>A点</b>纬度 30°<em>N</em><br>经度 60°E</p><p><b>B点</b>纬度 30°<em>S</em><br>经度 60°E</p></div><p>N＝北纬，S＝南纬<br>E＝东经，W＝西经</p><p class="source-note">先比较两组信息。留下判断后，再到经纬网上验证。</p>`;
 if(index===1)return `<p class="scene-kicker">探测点等待定位</p><h2>把文字坐标变成一个交点</h2><div class="target-coordinate"><b>纬度 20°S</b><b>经度 40°W</b></div><p>可以直接在网格上拖点，也可以分别调纬度、经度。两项都要对应。</p><p class="source-note">这里每小格是10°，不是10千米。图中没有距离比例尺。</p>`;
 if(index===2)return `<p class="scene-kicker">不看标签，只记两个数？</p><h2>30和60，分别属于哪一项</h2><div class="coordinate-cards"><p><b>原来的点</b>纬度30°N<br>经度60°E</p><p><b>改写后的点</b>纬度60°N<br>经度30°E</p></div><p>比较的是数值与“纬度/经度”的对应关系。解释两个交点为何不同。</p>`;
 if(index===3)return `<p class="scene-kicker">定位中的零也有含义</p><h2>纬度0°，并不缺少方向</h2><div class="target-coordinate"><b>纬度 0°</b><b>经度 90°W</b></div><p>分清两个0°：赤道是0°纬线，本初子午线是0°经线。</p>`;
 return `<p class="scene-kicker">一张新的南纬、西经局部图</p><h2>去M站，别把数字大小当方向</h2><svg class="regional-grid" viewBox="0 0 380 280" role="img" aria-label="上北下南、左西右东。经线从左到右120W、100W、80W；纬线从上到下20S、40S、60S。M在中间经纬线交点，P在左侧经线与中间纬线交点。"><rect x="65" y="52" width="260" height="170" rx="8"/><path d="M85 65V225M195 65V225M305 65V225M75 75H315M75 145H315M75 215H315"/><text x="85" y="42" text-anchor="middle">120°W</text><text x="195" y="42" text-anchor="middle">100°W</text><text x="305" y="42" text-anchor="middle">80°W</text><text x="55" y="79" text-anchor="end">20°S</text><text x="55" y="149" text-anchor="end">40°S</text><text x="55" y="219" text-anchor="end">60°S</text><circle cx="195" cy="145" r="6"/><text x="206" y="137">M</text><circle cx="85" cy="145" r="6"/><text x="96" y="137">P</text><text x="350" y="68" text-anchor="middle">北↑</text><text x="195" y="258" text-anchor="middle">西 ←　图上方向　→ 东</text></svg><p class="source-note">局部经纬网示意。只读坐标与相对方向，不测屏幕距离。</p>`;
}
function mapMarkup(key){return `<div class="coordinate-map" data-map="${key}"><svg id="grid-${key}-svg" viewBox="0 0 400 290" role="img" tabindex="0" aria-label="可定位经纬网"></svg><p class="map-instruction">点按或拖动定位；聚焦网格后也可用方向键，每次10°。</p><label for="grid-${key}-lat">纬度 <output id="grid-${key}-lat-label"></output></label><input id="grid-${key}-lat" type="range" min="-60" max="60" step="10"><label for="grid-${key}-lon">经度 <output id="grid-${key}-lon-label"></output></label><input id="grid-${key}-lon" type="range" min="-120" max="120" step="10"><p class="current-coordinate" id="grid-${key}-current" aria-live="polite"></p>${key==='lab'?'<div class="flip-controls"><button data-flip="lat">只换N / S</button><button data-flip="lon">只换E / W</button></div>':''}</div>`;}
function mapDrawing(s){
 let lines='',labels='';for(let v=-120;v<=120;v+=10){const x=GridLesson.state(0,v).x;lines+=`<path d="M${x} 28V244" class="${v===0?'prime':v%30===0?'major':'minor'}"/>`;if(v%30===0)labels+=`<text x="${x}" y="265" text-anchor="middle">${v===0?'0°':Math.abs(v)+(v<0?'W':'E')}</text>`;}
 for(let v=-60;v<=60;v+=10){const y=GridLesson.state(v,0).y;lines+=`<path d="M50 ${y}H350" class="${v===0?'equator':v%30===0?'major':'minor'}"/>`;if(v%30===0)labels+=`<text x="41" y="${y+4}" text-anchor="end">${v===0?'0°':Math.abs(v)+(v<0?'S':'N')}</text>`;}
 return `<rect x="50" y="28" width="300" height="216" class="map-water"/>${lines}${labels}<text x="205" y="16" text-anchor="middle">本图：北↑　纬线横向，经线纵向</text><path class="latitude-guide" d="M50 ${s.y}H350"/><path class="longitude-guide" d="M${s.x} 28V244"/><circle class="locator-halo" cx="${s.x}" cy="${s.y}" r="13"/><circle class="locator-dot" cx="${s.x}" cy="${s.y}" r="5"/><text x="200" y="286" text-anchor="middle">西 ←　经度　→ 东</text>`;
}
function bindMap(key){
 const isTask=key==='task',stem=isTask?'gridTask':'gridLab',cp=gridLog.checkpoint,container=document.querySelector(`[data-map="${key}"]`),svg=document.querySelector(`#grid-${key}-svg`),latInput=document.querySelector(`#grid-${key}-lat`),lonInput=document.querySelector(`#grid-${key}-lon`);
 let lat=GridLesson.valid(cp[stem+'Lat'],cp[stem+'Lon'])?cp[stem+'Lat']:(isTask?0:30),lon=GridLesson.valid(cp[stem+'Lat'],cp[stem+'Lon'])?cp[stem+'Lon']:(isTask?0:60),dragging=false;
 function draw(){const s=GridLesson.state(lat,lon);svg.innerHTML=mapDrawing(s);svg.setAttribute('aria-label',`经纬网示意，上北下南、左西右东；当前点${s.label}。方向键每次移动10度。`);latInput.value=lat;lonInput.value=lon;document.querySelector(`#grid-${key}-lat-label`).textContent=s.latitude;document.querySelector(`#grid-${key}-lon-label`).textContent=s.longitude;document.querySelector(`#grid-${key}-current`).textContent=s.label;}
 function update(a,b){if(isTask&&gridLog.records[gridIndex].done)return;lat=a;lon=b;gridLog.point({[stem+'Lat']:lat,[stem+'Lon']:lon,[stem+'Touched']:true});gridLog.draft(gridIndex,{[`grid-${key}-lat`]:String(lat),[`grid-${key}-lon`]:String(lon)});if(!isTask)gridLog.help(gridIndex,'操作经纬网模型');draw();}
 function locate(e){const box=svg.getBoundingClientRect(),s=GridLesson.fromPoint((e.clientX-box.left)/box.width*400,(e.clientY-box.top)/box.height*290);update(s.lat,s.lon);}
 svg.onpointerdown=e=>{if(isTask&&gridLog.records[gridIndex].done)return;e.preventDefault();dragging=true;svg.setPointerCapture(e.pointerId);locate(e);};svg.onpointermove=e=>{if(dragging)locate(e);};svg.onpointerup=e=>{dragging=false;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);};svg.onpointercancel=()=>{dragging=false;};
 svg.onkeydown=e=>{const moves={ArrowUp:[10,0],ArrowDown:[-10,0],ArrowLeft:[0,-10],ArrowRight:[0,10]};if(!moves[e.key])return;e.preventDefault();const [a,b]=moves[e.key];update(Math.max(-60,Math.min(60,lat+a)),Math.max(-120,Math.min(120,lon+b)));};latInput.oninput=()=>update(Number(latInput.value),lon);lonInput.oninput=()=>update(lat,Number(lonInput.value));container.querySelectorAll('[data-flip]').forEach(b=>b.onclick=()=>update(b.dataset.flip==='lat'?-lat:lat,b.dataset.flip==='lon'?-lon:lon));
 draw();if(isTask&&gridLog.records[gridIndex].done){container.querySelectorAll('input,button').forEach(el=>el.disabled=true);svg.setAttribute('aria-disabled','true');}
}
function labMarkup(){return `<details class="grid-lab" data-help="查看经纬网定位方法"><summary>动手定位：只改一个字母，会到哪里？</summary><div class="grid-lab-body">${mapMarkup('lab')}<div class="grid-guide"><p><b>纬度找南北：</b>赤道为0°，北纬N、南纬S。同一纬线的纬度相同。</p><p><b>经度找东西：</b>本初子午线为0°，向东为东经E、向西为西经W。同一经线的经度相同。</p><p>先找两条线，再取交点。赤道上的点不必标N/S；本初子午线上的点不必标E/W。</p></div><p class="model-note">本图只截取60°S—60°N、120°W—120°E，网格间隔10°。真实纬度到南北90°，经度到东西180°。这是平面定位示意：地球上经线在两极汇合，不能用图上线的平行或等间隔推断真实形状、距离，也不能把东经/西经直接当作东西半球。</p></div></details>`;}
function bindLab(){bindMap('lab');}
function renderGrid(focus=false){
  document.querySelector('#grid-progress').textContent=gridIndex===5?'5 题完成':`第 ${gridIndex+1} / 5 题`;
  document.querySelector('#grid-dots').innerHTML=gridQuestions.map((_,i)=>`<i class="${gridLog.records[i].done?'done':''} ${i===gridIndex?'current':''}"></i>`).join('');
  if(gridIndex===5){finishGrid();return;}
  const q=gridQuestions[gridIndex],r=gridLog.records[gridIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${gridEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="grid-answer">用自己的话，留下你的解释</label><textarea id="grid-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="grid-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':mapMarkup('task');
  gridTask.innerHTML=`<div class="grid-layout"><article class="grid-scene">${gridScene(gridIndex)}</article><section class="reading-work grid-work"><p class="skill-label">${q.skill}</p><h2 id="grid-question" tabindex="-1">${q.title}</h2><p class="grid-task-context">${gridEscape(q.context)}</p>${entry}<button class="primary" id="submit-grid">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="grid-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="grid-method">暂时不会，看看方法</button>':''}<div id="grid-review" hidden></div><div id="grid-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-grid" disabled>${gridIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#grid-message'),submit=document.querySelector('#submit-grid'),next=document.querySelector('#next-grid');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(gridIndex!==0||document.querySelector('.grid-lab'))return;document.querySelector('#grid-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.grid-lab');details.addEventListener('toggle',()=>{if(details.open)gridLog.help(gridIndex,'查看经纬网定位方法');});}
  function finishClosed(){gridTask.querySelectorAll('[data-choice],[data-map=task] input,#submit-grid,#grid-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();const map=document.querySelector('#grid-task-svg');if(map)map.setAttribute('aria-disabled','true');}
  function getOpen(){const text=document.querySelector('#grid-answer').value.trim();if(!text&&!document.querySelector('#grid-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#grid-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)gridLog.submit(gridIndex,answer,null,answer);gridLog.finish(gridIndex,button.dataset.self);gridTask.querySelectorAll('textarea,input,#submit-grid,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  gridTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);gridTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)gridLog.submit(gridIndex,answer,null,answer);if(first)gridLog.help(gridIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{if(!gridLog.checkpoint.gridTaskTouched){say('先移动探测点或调节滑块，再确认位置。',true);return;}const s=GridLesson.state(gridLog.checkpoint.gridTaskLat,gridLog.checkpoint.gridTaskLon);answer=s.label;correct=s.lat===q.answer.lat&&s.lon===q.answer.lon;}
    gridLog.submit(gridIndex,answer,correct);if(correct){gridLog.finish(gridIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(gridIndex===0)showLab();}
  };
  if(!open)document.querySelector('#grid-method').onclick=()=>{if(!r.first)gridLog.submit(gridIndex,'暂时不会，选择查看方法',false);gridLog.help(gridIndex,'查看本题方法');gridLog.finish(gridIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(gridTask,gridLog,gridIndex);
  if(q.kind==='locate')bindMap('task');
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{gridIndex++;renderGrid(true);};
  if(focus){document.querySelector('#grid-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishGrid(){
  gridTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>读坐标要带标签，数值和方向一起读。</strong></p><p>纬度看相对赤道的南北，经度看相对本初子午线的东西。找两条指定线的交点；西经度数减小，也可能正在向东。</p><p class="finish-note">2题判断、1题动手定位、2题解释与迁移。参考后的自检不等于独立掌握；以后换成新地图，还要根据标注读数，不能只记屏幕上的左右位置。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-grid">重新练这5题（保留旧记录）</button></section>${gridLog.html()}`;
  document.querySelector('#restart-grid').onclick=()=>{gridLog=LearningFeedback.create(GridLesson.title,gridQuestions,true);gridLog.save();gridIndex=0;renderGrid(true);};gridTask.querySelector('h2').focus({preventScroll:true});
}
renderGrid();
