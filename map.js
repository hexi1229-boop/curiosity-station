'use strict';
const mapQuestions=MapLesson.questions,mapEscape=LearningFeedback.esc;
const mapTask=document.querySelector('#map-task');
let mapLog=LearningFeedback.create(MapLesson.title,mapQuestions),mapIndex=mapLog.index;
function mapSvg(data,angle,overlay=false,prefix='scene'){
  const pos=p=>{const v=MapLesson.rotate(p,angle);return {x:200+40*v.x,y:200+40*v.y};};
  const lines=Array.from({length:7},(_,i)=>{const k=80+i*40;return `<path d="M${k} 80V320 M80 ${k}H320"/>`;}).join('');
  const dots=data.points.map((p,i)=>{const v=pos(p);return `<g><circle cx="${v.x}" cy="${v.y}" r="9" fill="${i===0?'#2e6958':'#b07749'}" stroke="#fffefa" stroke-width="3"/><text x="${v.x}" y="${v.y+25}" text-anchor="middle" font-size="18" fill="#294e42" stroke="#fffefa" stroke-width="4" paint-order="stroke">${p.name}</text></g>`;}).join('');
  const path=data.route.map(i=>{const p=pos(data.points[i]);return `${p.x},${p.y}`;}).join(' ');
  const cardinal=overlay?[['北',0,2.7],['东',2.7,0],['南',0,-2.7],['西',-2.7,0]].map(([label,x,y])=>{const p=pos({x,y});return `<g><circle cx="${p.x}" cy="${p.y}" r="15" fill="#fffefa"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="15" fill="#356650">${label}</text></g>`;}).join(''):'';
  const tip=pos({x:2.25,y:3.45});
  const screen=({0:'上',90:'右',180:'下',270:'左'})[((angle%360)+360)%360];
  const alt=`平面地图，${screen?'指北标朝屏幕'+screen+'方':'指北标和地点一起转过'+angle+'度'}。${data.metresPerGrid?'每格边长表示100米。':''}`;
  return `<svg class="orientation-map" viewBox="0 0 400 400" role="img" aria-label="${alt}"><defs><marker id="${prefix}-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L8 4L0 8Z" fill="#a97546"/></marker></defs><g transform="rotate(${angle} 200 200)"><rect x="78" y="78" width="244" height="244" rx="12" fill="#edf2e5" stroke="#cad8bd"/><g stroke="#d3ddc9" stroke-width="1">${lines}</g><g transform="translate(290 110)"><path d="M0 20V-24 M-7-15L0-27L7-15" fill="none" stroke="#315f51" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></g>${data.route.length?`<polyline points="${path}" fill="none" stroke="#a97546" stroke-width="4" stroke-dasharray="7 6" stroke-linecap="round" marker-mid="url(#${prefix}-arrow)" marker-end="url(#${prefix}-arrow)"/>`:''}${dots}<text x="${tip.x}" y="${tip.y+5}" text-anchor="middle" fill="#315f51" font-size="19" font-weight="600">N</text>${cardinal}${data.metresPerGrid?'<path d="M25 362V370H65V362" fill="none" stroke="#55674d" stroke-width="2"/><text x="76" y="371" font-size="14" fill="#55674d">一个格边＝100米</text>':''}</svg>`;
}
function mapScene(index){
  const titles=['一张转过的营地图','同一地点，换个图纸朝向','这次，从灯塔看向营地','沿虚线走到展馆','一张新的公园图'];
  const captions=['N表示北。灯塔位于营地的屏幕右侧。','现在N朝左，灯塔也在营地左侧。实际地点没有移动。','N朝下，灯塔在营地下方。题目要换一个参照点。','每个格边表示100米。虚线沿格线连续走3格。','N朝左。入口到休息站向图左走2格，再向图上走2格到观景台。每格边长表示100米。'];
  return `<h2>${titles[index]}</h2>${mapSvg(MapLesson.maps[index],MapLesson.maps[index].angle)}<p class="map-caption">${captions[index]}</p>${index>=3?'<p class="map-legend"><span></span>虚线是指定路线，圆点是地点。</p>':''}`;
}
function labMarkup(){return `<details class="map-lab" data-help="旋转地图验证"><summary>动手转图：北方会改变吗？</summary><div class="map-lab-body"><p>图纸上的地点与指北标一起转。留意“营地到灯塔”和指北箭头是否始终同向。</p><div id="rotating-map"></div><label for="map-angle">转动图纸 <output id="map-angle-label">90</output>°</label><input id="map-angle" type="range" min="0" max="360" step="1" value="90"><div class="map-controls"><button id="map-turn">再转四分之一圈</button><button id="map-reset">让北朝上</button></div><label class="map-overlay"><input id="map-cardinals" type="checkbox">显示东、南、西、北，帮助核对</label><p id="map-result" class="map-result" role="status"></p><p class="map-rule">先找指向标，再确定参照点，最后判断方向。<br>没有指向标、经纬网等方向信息时，普通地图通常按“上北下南、左西右东”判读。</p></div></details>`;}
function bindLab(){
  const range=document.querySelector('#map-angle'),overlay=document.querySelector('#map-cardinals');
  function draw(){const a=Number(range.value);document.querySelector('#map-angle-label').textContent=a;document.querySelector('#rotating-map').innerHTML=mapSvg(MapLesson.maps[0],a,overlay.checked,'lab');const side=({0:'上',90:'右',180:'下',270:'左'})[a%360];document.querySelector('#map-result').textContent=(side?`北现在指向屏幕${side}方。`:'北的屏幕朝向改变了。')+'从营地指向灯塔，始终与指北箭头同向：灯塔在营地北方。';}
  range.addEventListener('input',()=>{mapLog.help(mapIndex,'转动地图');draw();});
  overlay.addEventListener('change',()=>{if(overlay.checked)mapLog.help(mapIndex,'显示四个方向');draw();});
  document.querySelector('#map-turn').onclick=()=>{range.value=String((Number(range.value)+90)%360);mapLog.help(mapIndex,'转四分之一圈');draw();};
  document.querySelector('#map-reset').onclick=()=>{range.value='0';mapLog.help(mapIndex,'让北朝上');draw();};draw();
}

function renderMap(focus=false){
  document.querySelector('#map-progress').textContent=mapIndex===5?'5 题完成':`第 ${mapIndex+1} / 5 题`;
  document.querySelector('#map-dots').innerHTML=mapQuestions.map((_,i)=>`<i class="${mapLog.records[i].done?'done':''} ${i===mapIndex?'current':''}"></i>`).join('');
  if(mapIndex===5){finishMap();return;}
  const q=mapQuestions[mapIndex],r=mapLog.records[mapIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${mapEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="map-answer">留下你的理由或关键步骤</label><textarea id="map-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话或几个算式就好。"></textarea><label class="reason-unsure"><input id="map-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`<label for="map-number">${q.label}</label><div class="number-answer"><input id="map-number" inputmode="decimal" autocomplete="off" maxlength="30"><span>${q.unit}</span></div>`;
  mapTask.innerHTML=`<div class="map-layout"><article class="trip-card">${mapScene(mapIndex)}</article><section class="reading-work map-work"><p class="skill-label">${q.skill}</p><h2 id="map-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-map">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="map-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="map-method">暂时不会，看看方法</button>':''}<div id="map-review" hidden></div><div id="map-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-map" disabled>${mapIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#map-message'),submit=document.querySelector('#submit-map'),next=document.querySelector('#next-map');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(mapIndex!==0||document.querySelector('.map-lab'))return;document.querySelector('#map-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.map-lab');details.addEventListener('toggle',()=>{if(details.open)mapLog.help(mapIndex,'旋转地图验证');});}
  function finishClosed(){mapTask.querySelectorAll('[data-choice],#map-number,#submit-map,#map-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#map-answer').value.trim();if(!text&&!document.querySelector('#map-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#map-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)mapLog.submit(mapIndex,answer,null,answer);mapLog.finish(mapIndex,button.dataset.self);mapTask.querySelectorAll('textarea,input,#submit-map,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  mapTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);mapTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)mapLog.submit(mapIndex,answer,null,answer);if(first)mapLog.help(mapIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#map-number').value;const value=MapLesson.numberValue(raw);if(value===null){say('这里填一个数字就好，例如 2。',true);return;}answer=raw.trim()+' '+q.unit;correct=value===q.answer;}
    mapLog.submit(mapIndex,answer,correct);if(correct){mapLog.finish(mapIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(mapIndex===0)showLab();}
  };
  if(!open)document.querySelector('#map-method').onclick=()=>{if(!r.first)mapLog.submit(mapIndex,'暂时不会，选择查看方法',false);mapLog.help(mapIndex,'查看本题方法');mapLog.finish(mapIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(mapTask,mapLog,mapIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{mapIndex++;renderMap(true);};
  if(focus){document.querySelector('#map-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishMap(){
  mapTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>屏幕的上下左右会变，判断方向的依据要跟着地图找。</p><div class="map-finish-steps"><span>找指向标</span><span>确定参照点</span><span>按路线量算距离</span></div><p>换个参照点，重新判断方向。算指定路线的路程，要把各段相加，不能用起终点的直线代替。</p><p class="finish-note">3题核对了判断或数值，2题保留了理由与自检。下次拿到一张新图，先找到它的方向信息。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-map">重新练这5题（保留旧记录）</button></section>${mapLog.html()}`;
  document.querySelector('#restart-map').onclick=()=>{mapLog=LearningFeedback.create(MapLesson.title,mapQuestions,true);mapLog.save();mapIndex=0;renderMap(true);};mapTask.querySelector('h2').focus({preventScroll:true});
}
renderMap();
