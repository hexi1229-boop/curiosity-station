'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='daynight'))LearningFeedback.courses.push(['daynight',DaynightLesson.title,'daynight.html']);
const daynightQuestions=DaynightLesson.questions,daynightEscape=LearningFeedback.esc;
const daynightTask=document.querySelector('#daynight-task');
let daynightLog=LearningFeedback.create(DaynightLesson.title,daynightQuestions),daynightIndex=daynightLog.index,daynightStop=()=>{};
function stopDaynight(){daynightStop();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopDaynight();});
window.addEventListener('pagehide',stopDaynight);
function globeMarkup(id,{right=false,arrow=false,transfer=false,model=false}={}){
 const sun=right?368:32,from=right?342:58,to=right?306:94;
 return `<svg ${model?'id="daynight-globe"':''} class="globe-picture" viewBox="0 0 400 320" role="img" aria-label="从北极上空看，光从${right?'右':'左'}方照来；${transfer?'P在上方、Q在下方的昼夜交界，地球逆时针转':'赤道上的A点起初正对太阳'}"><defs><clipPath id="${id}-clip"><circle cx="200" cy="160" r="92"/></clipPath><marker id="${id}-head" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#729174"/></marker></defs><circle class="model-sun" cx="${sun}" cy="160" r="16"/><text x="${sun}" y="195" text-anchor="middle">太阳</text>${[93,125,160,195,227].map(y=>`<path class="sun-ray" d="M${from} ${y}H${to}l${right?7:-7} -4m${right?-7:7} 4l${right?7:-7} 4"/>`).join('')}<circle class="earth-night" cx="200" cy="160" r="92"/><rect class="earth-day" x="${right?200:108}" y="68" width="92" height="184" clip-path="url(#${id}-clip)"/><circle class="equator-edge" cx="200" cy="160" r="92"/><path class="light-boundary" d="M200 68V252"/><text class="pole-label" x="200" y="147" text-anchor="middle">N</text><text class="pole-note" x="200" y="168" text-anchor="middle">北极</text><text class="half-label ${right?'night-label':''}" x="155" y="206" text-anchor="middle">${right?'夜':'昼'}</text><text class="half-label ${right?'':'night-label'}" x="245" y="206" text-anchor="middle">${right?'昼':'夜'}</text>${arrow?`<path class="rotation-arrow" d="M295 105 A110 110 0 0 0 105 105" marker-end="url(#${id}-head)"/><text x="200" y="31" text-anchor="middle">逆时针转</text>`:''}${transfer?'<circle class="place-dot" cx="200" cy="68" r="7"/><text class="place-name" x="225" y="81">P</text><circle class="place-dot" cx="200" cy="252" r="7"/><text class="place-name" x="223" y="264">Q</text>':`<g transform="translate(200 160)"><g ${model?'id="daynight-rotor"':''}><path class="site-spoke" d="M-20 0H-84"/><circle class="place-dot" cx="-92" cy="0" r="7"/><g transform="translate(-92 0)"><text ${model?'id="daynight-place-name"':''} class="place-name" x="-14" y="-14">A</text></g></g></g>`}<text class="diagram-note" x="200" y="297" text-anchor="middle">圆周是赤道 · 不是普通地图</text></svg>`;
}
function poleMarkup(){return `<div class="pole-pair">${[{name:'甲 · 北极上空',pole:'N',clock:'逆时针',path:'M155 80A60 60 0 1 0 113 157'},{name:'乙 · 南极上空',pole:'S',clock:'顺时针',path:'M45 80A60 60 0 1 1 87 157'}].map((v,i)=>`<figure><figcaption>${v.name}</figcaption><svg viewBox="0 0 200 195" role="img" aria-label="${v.name}，${v.clock}"><defs><marker id="pole-${i}-head" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#729174"/></marker></defs><circle cx="100" cy="100" r="43" class="pole-earth"/><text x="100" y="109" text-anchor="middle">${v.pole}</text><path class="rotation-arrow" d="${v.path}" marker-end="url(#pole-${i}-head)"/></svg><p>${v.clock}</p></figure>`).join('')}</div>`;}
function daynightScene(index){
 if(index===0)return `<p class="scene-kicker">太阳没有关灯</p><h2>同一个A点，接下来会怎样？</h2>${globeMarkup('first')}<p>A固定在地球表面，不是绕地球飞的卫星。此刻它正对太阳。</p><p class="source-note">先判断，再打开模型；所有标记点都在赤道上。</p>`;
 if(index===1)return `<p class="scene-kicker">一轮，从正午开始</p><h2>别把起点偷偷换成早晨</h2>${globeMarkup('order',{arrow:true})}<p>沿箭头追踪A，看看它接下来经过哪一边。</p><p class="source-note">简化赤道模型，忽略大气折射及这一天内公转带来的微小变化。</p>`;
 if(index===2)return `<p class="scene-kicker">按下暂停，只讨论这个模型</p><h2>球没动，光还照着</h2>${globeMarkup('paused')}<p>模型球静止，光照方向固定。迎光与背光的区别还在。</p><p class="source-note">图中的A停在正午位置。请分别回答“昼夜存在吗”和“A还在转换吗”。</p>`;
 if(index===3)return `<p class="scene-kicker">同一个地球，换一端观察</p><h2>观察者在哪里？</h2>${poleMarkup()}<p>顺时针和逆时针描述的是从当前视角看到的转向。</p>`;
 return `<p class="scene-kicker">最后一关 · 太阳换边了</p><h2>追踪P和Q，别背页面位置</h2>${globeMarkup('transfer',{right:true,arrow:true,transfer:true})}<p>右半边受光，左半边背光。P、Q都位于赤道上的昼夜交界处。</p><p class="source-note">沿箭头再转一点，再分别判断两个点。</p>`;
}
function orderMarkup(){return `<div class="order-endpoint">起点：正午</div><div id="daynight-assembled" class="daynight-assembled" role="group" aria-label="已排列的昼夜顺序"></div><div class="order-endpoint">终点：下一个正午</div><p id="daynight-order-status" class="order-status" role="status"></p><div class="daynight-bank" role="group" aria-label="可用时刻卡片">${DaynightLesson.tokens.map((v,id)=>`<button type="button" data-token="${id}">${v}</button>`).join('')}</div><div class="order-tools"><button type="button" class="text-button" id="daynight-undo">撤销最后一块</button><button type="button" class="text-button" id="daynight-clear">清空重排</button></div>`;}
function labMarkup(){return `<details class="daynight-lab" data-help="查看昼夜自转模型"><summary>动手验证：跟着A转过一天</summary><div class="daynight-lab-body"><p>从北极上空看地球。光从左边照来，地球自西向东转，在这里看就是逆时针。</p>${globeMarkup('lab',{arrow:true,model:true})}<label for="daynight-time">从正午起经过 <output id="daynight-time-label"></output></label><input id="daynight-time" type="range" min="0" max="24" step="1" value="0"><div class="time-presets" role="group" aria-label="选择经过的小时数">${[0,6,12,18,24].map(n=>`<button data-hour="${n}">${n}小时</button>`).join('')}</div><div class="motion-buttons"><button id="daynight-play">播放这一轮</button><button id="daynight-reset">回到正午</button></div><p id="daynight-condition" class="motion-readout" aria-live="off"></p><p class="model-note">这是一段加速模型：约8秒演示一个昼夜，滑杆不是北京时间。光照方向固定，所有标记点位于赤道；按太阳直射赤道、忽略折射和一天内公转微小变化来简化，不能推成“所有地方每天都是12小时白昼”。真实昼长还随纬度和季节变化。</p><details class="reading-hint"><summary>为什么这里用约24小时？</summary><p>这里看一个地点从正午再回到正午，以太阳为参照，一昼夜平均约24小时。若以远方恒星为参照，地球自转一周约23小时56分；两种计时参照不同。本课不要求计算这个差值。</p></details></div></details>`;}
function bindLab(){
 const log=daynightLog,index=daynightIndex;let elapsed=log.checkpoint.daynightElapsed??0,playing=false,frame=0,startTime=0,startStamp=0;
 try{DaynightLesson.state(elapsed);}catch{elapsed=0;}
 const slider=document.querySelector('#daynight-time'),play=document.querySelector('#daynight-play'),svg=document.querySelector('#daynight-globe');
 const fmt=n=>Number(n.toFixed(1)).toString();
 function save(){log.point({daynightElapsed:elapsed});log.draft(index,{'daynight-time':String(elapsed)});}
 function draw(){const s=DaynightLesson.state(elapsed);slider.value=elapsed;slider.setAttribute('aria-valuetext',`从正午起经过${fmt(elapsed)}小时`);document.querySelector('#daynight-time-label').textContent=fmt(elapsed)+' 小时';document.querySelector('#daynight-rotor').setAttribute('transform',`rotate(${s.rotation})`);document.querySelector('#daynight-place-name').setAttribute('transform',`rotate(${-s.rotation})`);svg.setAttribute('aria-label',`从北极上空看；太阳在左方，地球逆时针转。A点从正午起经过${fmt(elapsed)}小时，${s.zone}${s.event?'，'+s.event:''}`);document.querySelector('#daynight-condition').textContent=`A点：${s.zone}${s.event?' · '+s.event:''}。`+(s.event==='日落附近'?'继续转，将由昼入夜。':s.event==='日出附近'?'继续转，将由夜入昼。':'光照分界留在原处，A随地球转动。');play.textContent=playing?'暂停':elapsed===24?'重播这一轮':'播放这一轮';document.querySelectorAll('[data-hour]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hour)===elapsed)));}
 function halt(){if(!playing)return;playing=false;cancelAnimationFrame(frame);save();draw();}
 daynightStop=halt;
 function tick(stamp){if(!playing)return;elapsed=Math.min(24,startTime+(stamp-startStamp)*.003);draw();if(elapsed>=24){halt();return;}frame=requestAnimationFrame(tick);}
 function change(){save();log.help(index,'操作昼夜自转模型');draw();}
 slider.oninput=()=>{const value=Number(slider.value);halt();elapsed=value;change();};
 document.querySelectorAll('[data-hour]').forEach(b=>b.onclick=()=>{halt();elapsed=Number(b.dataset.hour);change();});
 document.querySelector('#daynight-reset').onclick=()=>{halt();elapsed=0;change();};
 play.onclick=()=>{if(playing){halt();return;}if(elapsed===24)elapsed=0;playing=true;startTime=elapsed;startStamp=performance.now();save();log.help(index,'播放昼夜自转模型');draw();frame=requestAnimationFrame(tick);};draw();
}
function renderDaynight(focus=false){
  stopDaynight();
  document.querySelector('#daynight-progress').textContent=daynightIndex===5?'5 题完成':`第 ${daynightIndex+1} / 5 题`;
  document.querySelector('#daynight-dots').innerHTML=daynightQuestions.map((_,i)=>`<i class="${daynightLog.records[i].done?'done':''} ${i===daynightIndex?'current':''}"></i>`).join('');
  if(daynightIndex===5){finishDaynight();return;}
  const q=daynightQuestions[daynightIndex],r=daynightLog.records[daynightIndex],open=q.kind==='open';
  let order=DaynightLesson.validOrder(daynightLog.checkpoint.daynightOrder)?[...daynightLog.checkpoint.daynightOrder]:[];
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${daynightEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="daynight-answer">用自己的话，留下你的解释</label><textarea id="daynight-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="daynight-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':orderMarkup();

  daynightTask.innerHTML=`<div class="daynight-layout"><article class="daynight-scene">${daynightScene(daynightIndex)}</article><section class="reading-work daynight-work"><p class="skill-label">${q.skill}</p><h2 id="daynight-question" tabindex="-1">${q.title}</h2><p class="daynight-task-context">${daynightEscape(q.context)}</p>${entry}<button class="primary" id="submit-daynight">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="daynight-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="daynight-method">暂时不会，看看方法</button>':''}<div id="daynight-review" hidden></div><div id="daynight-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-daynight" disabled>${daynightIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#daynight-message'),submit=document.querySelector('#submit-daynight'),next=document.querySelector('#next-daynight');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(daynightIndex!==0||document.querySelector('.daynight-lab'))return;document.querySelector('#daynight-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.daynight-lab');details.addEventListener('toggle',()=>{if(details.open)daynightLog.help(daynightIndex,'查看昼夜自转模型');else stopDaynight();});}
  function finishClosed(){daynightTask.querySelectorAll('[data-choice],[data-token],[data-remove],#daynight-clear,#daynight-undo,#submit-daynight,#daynight-method').forEach(el=>el.disabled=true);if(q.kind==='order')document.querySelector('#daynight-order-status').textContent='本题已记录；首答、订正和求助情况已保留。';say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#daynight-answer').value.trim();if(!text&&!document.querySelector('#daynight-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#daynight-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)daynightLog.submit(daynightIndex,answer,null,answer);daynightLog.finish(daynightIndex,button.dataset.self);daynightTask.querySelectorAll('textarea,input,#submit-daynight,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  daynightTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);daynightTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)daynightLog.submit(daynightIndex,answer,null,answer);if(first)daynightLog.help(daynightIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{correct=DaynightLesson.checkOrder(order);if(correct===null){say('把3张时刻卡全部排好，再核对。',true);return;}answer=DaynightLesson.sequence(order);}
    daynightLog.submit(daynightIndex,answer,correct);if(correct){daynightLog.finish(daynightIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(daynightIndex===0)showLab();}
  };
  if(!open)document.querySelector('#daynight-method').onclick=()=>{if(!r.first)daynightLog.submit(daynightIndex,'暂时不会，选择查看方法',false);daynightLog.help(daynightIndex,'查看本题方法');daynightLog.finish(daynightIndex,'看过方法，留待再练');finishClosed();};
  if(q.kind==='order'){
    function drawOrder(){
      document.querySelector('#daynight-assembled').innerHTML=order.length?order.map((id,i)=>`<button type="button" data-remove="${i}" aria-label="移除第${i+1}块 ${daynightEscape(DaynightLesson.tokens[id])}">${daynightEscape(DaynightLesson.tokens[id])}</button>`).join(''):'<span>点下面的卡片，按顺序放进这里。</span>';
      daynightTask.querySelectorAll('[data-token]').forEach(button=>{button.disabled=order.includes(Number(button.dataset.token))||order.length===3;});
      document.querySelector('#daynight-order-status').textContent=`已选 ${order.length} / 3 张。点上面的卡片可以移除。`;
      document.querySelector('#daynight-undo').disabled=!order.length;document.querySelector('#daynight-clear').disabled=!order.length;
      daynightTask.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{order.splice(Number(button.dataset.remove),1);saveOrder();});
    }
    function saveOrder(){daynightLog.point({daynightOrder:[...order]});daynightLog.draft(daynightIndex,{'排序草稿':DaynightLesson.sequence(order)});drawOrder();(daynightTask.querySelector('[data-token]:not(:disabled)')||document.querySelector('#submit-daynight')).focus({preventScroll:true});}
    daynightTask.querySelectorAll('[data-token]').forEach(button=>button.onclick=()=>{const id=Number(button.dataset.token);if(order.includes(id)||order.length>=3)return;order.push(id);saveOrder();});
    document.querySelector('#daynight-undo').onclick=()=>{order.pop();saveOrder();};document.querySelector('#daynight-clear').onclick=()=>{order=[];saveOrder();};drawOrder();
  }
  LearningFeedback.watchHelp(daynightTask,daynightLog,daynightIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{daynightIndex++;renderDaynight(true);};
  if(focus){document.querySelector('#daynight-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishDaynight(){
  daynightTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>先找光从哪边来，再跟着同一个地点转。</strong></p><p>地球不透明，产生昼夜之分；自转带着地点改变朝向，产生昼夜更替。自西向东转，从北极上空看是逆时针，从南极上空看是顺时针。</p><p class="finish-note">2题判断、1题排序、2题解释与迁移。自检不等于独立掌握；换图后仍要先辨光照和视角。本课不把简化模型当成所有地点的日出日落时刻表。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-daynight">重新练这5题（保留旧记录）</button><details class="reading-hint"><summary>家长参考：课程依据</summary><p>对应2022地理课标“地球自转”中方向、周期与昼夜更替的局部要求。科学核对：<a href="https://science.nasa.gov/learn/heat/big-ideas/big-idea-1-1/" target="_blank" rel="noopener">NASA · 昼夜与光照</a>、<a href="https://science.nasa.gov/learn/basics-of-space-flight/chapter2-1/" target="_blank" rel="noopener">太阳日与恒星日</a>。情境、题目和图示原创，动画为简化模型。</p></details></section>${daynightLog.html()}`;
  document.querySelector('#restart-daynight').onclick=()=>{daynightLog=LearningFeedback.create(DaynightLesson.title,daynightQuestions,true);daynightLog.save();daynightIndex=0;renderDaynight(true);};daynightTask.querySelector('h2').focus({preventScroll:true});
}
renderDaynight();
