'use strict';
(function(){
  const host=document.querySelector('#chute-task'),L=ParachuteLesson;
  if(!LearningFeedback.flexibleTasks){
    host.innerHTML='<section class="mission-card"><h2>新探索课正在准备</h2><p>正在更新课程组件，已有学习记录会保留。请保持联网，更新完成后会自动打开。</p><button class="primary" id="refresh-course">重新打开</button></section>';
    document.querySelector('#refresh-course').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});return;
  }
  if(!LearningFeedback.courses.some(c=>c[0]==='parachute'))LearningFeedback.courses.unshift(['parachute',L.title,'parachute.html']);
  let log=LearningFeedback.create(L.title,L.tasks),frame=0,clock=0,playing=false;
  let state=Object.assign({area:6,wind:1,trials:[]},log.checkpoint.parachute||{});
  if(!Number.isInteger(state.area)||state.area<1||state.area>6)state.area=6;
  if(![0,1].includes(state.wind))state.wind=1;
  if(!Array.isArray(state.trials))state.trials=[];
  const $=selector=>host.querySelector(selector),esc=LearningFeedback.esc;
  const choices=[['选最大的，落得越慢就越好','还要看它会落在哪里','暂时没把握，先收集证据'],[],['批准：把地球上的伞再放大','退回：需要重新设计减速方式','不用减速：月球上没有重力']];
  function save(){log.point({parachute:state});}
  function reasonMarkup(label){return `<div class="chute-reason"><label for="chute-reason">${label}</label><textarea id="chute-reason" rows="2" maxlength="500" placeholder="一句话或一个算式即可，也可用键盘上的语音输入。"></textarea><label class="unsure"><input id="chute-unsure" type="checkbox">我暂时说不清，先记下来</label></div>`;}
  function reason(){return $('#chute-reason').value.trim()||($('#chute-unsure').checked?'暂时说不清':'');}
  function options(i){return `<div class="chute-choices">${choices[i].map((x,j)=>`<button data-choice="${j}" aria-pressed="false">${x}</button>`).join('')}</div>`;}
  function message(text){$('#chute-message').textContent=text;}
  function stop(){cancelAnimationFrame(frame);playing=false;}
  function progress(){document.querySelectorAll('.mission-nav li').forEach((el,i)=>{el.classList.toggle('active',i===log.index);el.classList.toggle('done',log.records[i].done);if(i===log.index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
  function focus(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.mission-nav').scrollIntoView({block:'start'});}
  function render(move=false){
    stop();progress();const i=log.index;
    if(i===3){finish();if(move)focus();return;}
    if(i===0)host.innerHTML=`<section class="mission-card"><p class="mission-label">01 / 任务简报</p><h2 tabindex="-1">换成最大伞，就能把箱子送到吗？</h2><p class="lead">箱子与伞一共 2 千克。现在只看已经稳定下落的最后 30 米；风一直向右吹。你要同时满足两项要求。</p><div class="constraints"><span>落速 ≤ <b>2.5 米/秒</b></span><span>水平偏移 ≤ <b>15 米</b></span></div><p>供应商建议：把 3 平方米的伞换成 6 平方米。“这样落得更慢，肯定更好。”你怎么看？</p>${options(i)}${reasonMarkup('先留一句判断依据，之后可以改变想法')}<p class="chute-error" role="status" id="chute-message"></p><button class="primary" id="submit-chute">带着判断去验证 →</button></section>`;
    if(i===1)host.innerHTML=`<section class="mission-card"><p class="mission-label">02 / 地球投送试验</p><h2 tabindex="-1">选一张伞，用落点说话。</h2><p class="lead">先只改伞面积，比较同一只箱子。两个箱子共用一个秒表；灰色是 3 平方米的参照伞。</p><div class="example"><b>先读一次示例：</b>3 平方米的伞，稳定落速约 2.58 米/秒；最后 30 米用约 11.6 秒。风每秒吹移 1 米，所以偏移约 11.6 米。位置合格，但落速超出 2.5 米/秒。</div><div class="constraints"><span>任务：落速 ≤ <b>2.5 米/秒</b></span><span>偏移 ≤ <b>15 米</b></span></div>${scene()}<div class="lab-controls"><div><label for="chute-area">我的伞面积 <output id="area-output"></output></label><input id="chute-area" type="range" min="1" max="6" step="1" value="${state.area}" aria-label="我的伞面积"><small>1 平方米 — 6 平方米</small></div><div><label>横风条件</label><div class="wind-controls"><button class="secondary" data-wind="1">任务风 1 米/秒</button><button class="secondary" data-wind="0">无风对照</button></div></div></div><div class="actions"><button class="primary" id="drop-chute">试放并比较</button><button class="secondary" id="pause-chute">暂停</button></div><div class="clock-control"><label for="chute-clock">统一秒表：<output id="clock-output">0.0 秒</output> · 也可以手动拖动</label><input id="chute-clock" type="range" min="0" max="20" step="0.1" value="0" aria-label="统一秒表"></div><div class="readouts" id="chute-readouts"></div><p id="lab-status" role="status" class="lead"></p><div class="trial-log" id="trial-log"></div><details class="mission-help" data-help="实验比较提示"><summary>不知道该比较什么？</summary><p>只改变伞面积，保持任务风不变，比较落地速度和水平偏移。再用无风作对照，看看哪项结果改变。最后提交任务风下实际试过的方案。</p></details>${reasonMarkup('我选这个面积，因为试验显示……')}<p class="chute-error" role="status" id="chute-message"></p><button class="primary" id="submit-chute">提交当前方案与依据</button><div id="chute-review"></div></section>`;
    if(i===2)host.innerHTML=`<section class="mission-card"><p class="mission-label">03 / 一份新订单</p><h2 tabindex="-1">到了月球，还批准这张采购单吗？</h2><p class="lead">这次不提供调参按钮。请根据任务档案，独立审查供应商的建议。</p><div class="moon-brief"><div class="moon-disc" aria-hidden="true"></div><div><strong>月球任务档案</strong><p>重力约为地球的 1/6。</p><p>气体极其稀薄，与地球近地面环境差别巨大。</p><p>载荷：一箱需要缓慢着陆的仪器。</p></div></div><p><b>供应商：</b>“我们在地球上试过了。把伞再加大，就能让仪器在月球上慢慢落下。”</p>${options(i)}${reasonMarkup('我的决定是……，关键依据是……')}<details class="mission-help" data-help="月球任务提示"><summary>给我一点提示</summary><p>先回想：地球上伞的减速作用，需要与什么相互作用？再看任务档案里这个条件是否还成立。</p></details><p class="chute-error" role="status" id="chute-message"></p><button class="primary" id="submit-chute">提交我的审查意见</button><div id="chute-review"></div></section>`;
    let selected=log.records[i].draft.$choice??null;
    LearningFeedback.watchHelp(host,log,i);
    host.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);host.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
    if(i===1){log.help(1,'随课示例：3平方米参照伞');setupLab();}
    $('#submit-chute').onclick=()=>{
      if(i!==1&&selected===null){message('先选一个判断。暂时没把握也可以如实记录。');return;}
      if(!reason()){message('留一句自己的依据，或勾选“暂时说不清”。');return;}
      if(i===1&&(state.wind!==1||!state.trials.some(t=>t.area===state.area&&t.wind===1))){message('请在任务风下试放当前面积，等它落地后再提交。');return;}
      submit(i,selected);
      if(i===0){log.finish(0);render(true);}else review(i,selected);
    };
    if(i>0&&log.records[i].first)review(i,selected,false);
    if(move)focus();
  }
  function submit(i,selected){
    if(i===1){const m=L.model(state.area,state.wind);log.submit(i,`面积 ${m.area} 平方米；风速 ${m.wind} 米/秒；落速 ${m.speed.toFixed(2)} 米/秒；偏移 ${m.drift.toFixed(1)} 米`,null,reason());log.note(i,`该次方案数值条件：${m.success?'同时满足':'未同时满足'}；理由保留原话，未自动判分。`);}
    else log.submit(i,choices[i][selected],null,reason());
  }
  function review(i,selected,recordHelp=true){
    const m=i===1?L.model(state.area,state.wind):null;
    const text=i===1?`<p><b>核对两条要求：</b>任务风下，4 或 5 平方米的伞能同时满足本题两项要求。6 平方米虽然更慢，却漂到约 16.4 米处，越过了 15 米边界。</p><p>同样下落速度时，更大的同形伞会受到更大的空气阻力；因此它达到重力与阻力平衡时，速度更低。稳定下落时两力平衡，物体仍在运动。</p><p>关系链：伞变大 → 稳定下落更慢 → 空中时间更长 → 有横风时漂移更远。无风时，最后一步会变。</p>`:`<p><b>关键在环境前提。</b>降落伞需要足够的气体产生阻力。月球的气体极其稀薄，普通降落伞不能承担这里的着陆减速任务；直接加大地球上的伞，不能解决这个问题。</p><p>月球仍有重力。应退回方案，研究适合月球的其他减速方式，再验证。地球上的模型也不能直接套来算月球着陆。</p>`;
    $('#chute-review').innerHTML=`<section class="mission-review"><h3>对照证据，再看自己的理由</h3>${text}<p>你的原话在上方，想调整可以直接修改。下面只做自检，不自动判定解释是否充分。</p><div class="actions"><button class="secondary" data-self="能说明依据（自评）">我能说明依据</button><button class="secondary" data-self="还需要帮助">还需要帮助</button></div></section>`;
    if(recordHelp)log.help(i,'参考思路（提交后）');
    $('#submit-chute').textContent='保存修改后的方案与依据';
    host.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{
      const chosen=i===2?(log.records[i].draft.$choice??selected):null;
      if(!reason()){message('请保留自己的理由，或勾选“暂时说不清”。');return;}
      if(i===1&&(state.wind!==1||!state.trials.some(t=>t.area===state.area&&t.wind===1))){message('当前方案还没有在任务风下试过，请先试放。');return;}
      const previous=log.records[i].attempts.at(-1),answer=i===2?choices[i][chosen]:null;
      if(reason()!==previous.explanation||(i===2&&answer!==previous.answer)||(i===1&&!previous.answer.startsWith(`面积 ${state.area} 平方米；风速 ${state.wind}`)))submit(i,chosen);
      log.finish(i,button.dataset.self);render(true);
    });
  }
  function scene(){return `<div class="scene-shell"><div class="scene-top"><span>灰色：3 m² 参照伞　<b>橙色：我的伞</b></span><span>动画加速 5 倍</span></div><svg viewBox="0 0 620 360" role="img" aria-labelledby="chute-scene-title"><title id="chute-scene-title">同一秒表下，参照伞与我的伞的下落位置</title><defs><pattern id="chute-grid" width="50" height="40" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 40" fill="none" stroke="#fff" opacity=".06"/></pattern></defs><rect width="620" height="360" fill="url(#chute-grid)"/><rect x="60" y="305" width="375" height="20" rx="4" fill="#7b9c79" opacity=".35"/><path d="M60 68V305H560" fill="none" stroke="#9ab4b0" stroke-width="1.5"/><path d="M435 70V325" stroke="#e8b382" stroke-dasharray="5 5"/><text x="15" y="77" fill="#c7d8cf" font-size="14">30m</text><text x="25" y="303" fill="#c7d8cf" font-size="14">0</text><text x="57" y="345" fill="#c7d8cf" font-size="14">0</text><text x="297" y="345" fill="#c7d8cf" font-size="14">10m</text><text x="421" y="345" fill="#f0c097" font-size="14">15m</text><text x="540" y="345" fill="#c7d8cf" font-size="14">20m</text><text x="185" y="321" fill="#d9ead8" font-size="13">允许落地区域</text><text x="300" y="48" fill="#bfd2cc" font-size="15" id="wind-label"></text><path id="base-trail" fill="none" stroke="#abbeb7" stroke-width="2" stroke-dasharray="4 4"/><path id="my-trail" fill="none" stroke="#efb176" stroke-width="2"/><g id="base-chute"></g><g id="my-chute"></g></svg><p class="scene-caption">水平偏移与高度按图中刻度读；伞与箱子是示意图标。只展示已开伞、已稳定下落的最后 30 米。</p></div>`;}
  function canopy(area,color){const width=22*Math.sqrt(area);return `<path d="M${-width/2} -30 Q0 ${-30-width/2} ${width/2} -30 Q0 -39 ${-width/2} -30" fill="${color}"/><path d="M${-width/2} -30L-6 -5M${width/2} -30L6 -5M0 -34V-5" stroke="${color}" fill="none"/><rect x="-9" y="-10" width="18" height="10" rx="2" fill="${color}"/>`;}
  function draw(){
    const a=L.position(state.area,state.wind,clock),b=L.position(3,state.wind,clock);
    for(const [id,p,area,color]of [['base',b,3,'#9bb1a8'],['my',a,state.area,'#f0ad70']]){const x=60+25*p.x,y=305-7.5*p.height;$('#'+id+'-chute').innerHTML=canopy(area,color);$('#'+id+'-chute').setAttribute('transform',`translate(${x},${y})`);$('#'+id+'-trail').setAttribute('d',`M60 80L${x} ${y}`);}
    $('#wind-label').textContent=state.wind?'横风 → 1 米/秒':'无风对照 · 0 米/秒';
    $('#area-output').textContent=`${state.area} 平方米`;$('#clock-output').textContent=`${clock.toFixed(1)} 秒`;$('#chute-clock').value=clock;
    $('#chute-scene-title').textContent=`${clock.toFixed(1)}秒：我的伞高${a.height.toFixed(1)}米，偏移${a.x.toFixed(1)}米；参照伞高${b.height.toFixed(1)}米，偏移${b.x.toFixed(1)}米。`;
  }
  function result(){
    const tested=state.trials.some(t=>t.area===state.area&&t.wind===state.wind),m=L.model(state.area,state.wind);
    $('#chute-readouts').innerHTML=[['稳定落速',tested?m.speed.toFixed(2):'—','米/秒',m.speedOK],['下落时间',tested?m.time.toFixed(1):'—','秒',true],['水平偏移',tested?m.drift.toFixed(1):'—','米',m.driftOK]].map(([label,value,unit,ok])=>`<div><small>${label}</small><b>${value}</b><span class="${tested?(ok?'pass':'fail'):''}">${unit}${tested&&label!=='下落时间'?(ok?' · 合格':' · 超限'):''}</span></div>`).join('');
    $('#lab-status').textContent=!tested?'先预测它会落在哪里，再试放看看。':state.wind===0?'无风对照已完成。提交方案前，请切回任务风验证。':m.success?'这一方案同时满足两项数值要求。把依据说清楚。':'这一方案没有同时满足两项要求。可以调面积再试，也可以带着疑问提交。';
    const recent=state.trials.slice(-4);$('#trial-log').innerHTML=recent.length?`<b>最近试验 · 自动记录</b><ol>${recent.map(t=>{const r=L.model(t.area,t.wind);return `<li>${t.area} m² / 风 ${t.wind} m/s：落速 ${r.speed.toFixed(2)} m/s，偏移 ${r.drift.toFixed(1)} m。</li>`;}).join('')}</ol>`:'试放后，这里会留下你的比较证据。';
  }
  function completeTrial(){
    const m=L.model(state.area,state.wind),last=state.trials.at(-1);
    if(!last||last.area!==state.area||last.wind!==state.wind){state.trials.push({area:state.area,wind:state.wind});log.note(1,`试放：面积 ${m.area} 平方米，横风 ${m.wind} 米/秒；落速 ${m.speed.toFixed(2)} 米/秒，用时 ${m.time.toFixed(1)} 秒，漂移 ${m.drift.toFixed(1)} 米。`);save();}
    result();
  }
  function setupLab(){
    $('#chute-area').value=state.area;clock=0;
    function winds(){host.querySelectorAll('[data-wind]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.wind)===state.wind)));}
    function changed(){stop();clock=0;save();winds();draw();result();}
    $('#chute-area').oninput=()=>{state.area=Number($('#chute-area').value);changed();};
    host.querySelectorAll('[data-wind]').forEach(b=>b.onclick=()=>{state.wind=Number(b.dataset.wind);changed();});
    $('#chute-clock').oninput=()=>{stop();clock=Number($('#chute-clock').value);draw();if(clock>=Math.max(L.model(state.area,state.wind).time,L.model(3,state.wind).time))completeTrial();};
    $('#pause-chute').onclick=()=>{stop();$('#lab-status').textContent='已暂停。拖动统一秒表可以逐步观察。';};
    $('#drop-chute').onclick=()=>{
      stop();clock=0;
      host.querySelector('.scene-shell').scrollIntoView({block:'start'});
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){clock=20;draw();completeTrial();return;}
      playing=true;const start=performance.now(),end=Math.max(L.model(state.area,state.wind).time,L.model(3,state.wind).time);
      function tick(now){if(!playing)return;clock=Math.min(end,(now-start)/200);draw();if(clock>=end){stop();completeTrial();}else frame=requestAnimationFrame(tick);}
      frame=requestAnimationFrame(tick);
    };
    winds();draw();result();
  }
  function finish(){
    host.innerHTML=`<section class="mission-card chute-finish"><p class="mission-label">任务结束 / 带走一种判断方法</p><h2 tabindex="-1">你已经留下了一次完整探索。</h2><p class="takeaway">先看任务要求，再用试验作比较；<br>换了环境，重新检查前提。</p><p>这次完成了 3 个探索环节。记录保留了最初判断、试验方案和你的解释；完成不等于已经长期掌握，开放解释未自动评分。</p><details class="mission-help"><summary>下次遇到新方案，可以再问自己</summary><p>先不看旧答案，回想：目标有哪些？改变了哪个条件？原来的方法还适用吗？以后学习火箭回收或其他工程方案时，再调用这三个问题。</p></details><div class="actions"><a class="secondary" href="records.html">查看学习记录 →</a><button class="secondary" id="chute-restart">重新探索一次</button><a class="secondary" href="./">回到小站</a></div></section>${log.html()}`;
    $('#chute-restart').onclick=()=>{log=LearningFeedback.create(L.title,L.tasks,true);state={area:6,wind:1,trials:[]};save();render(true);};
  }
  const sourceHelp=document.querySelector('.sources');sourceHelp.addEventListener('toggle',()=>{if(sourceHelp.open)log.help(Math.min(log.index,2),'模型边界与知识来源');});
  render();
})();
