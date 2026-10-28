'use strict';
(function(){
 const host=document.querySelector('#journey-task'),L=JourneyLesson,F=LearningFeedback,esc=F.esc;
 if(!F.flexibleTasks){host.innerHTML='<section class="journey-card"><h2>看图课堂正在更新</h2><p>稍后重新打开即可继续，原有记录会保留。</p><button class="primary" id="journey-refresh">重新打开</button></section>';document.querySelector('#journey-refresh').onclick=()=>location.reload();navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});return;}
 if(!F.courses.some(c=>c[0]===L.id))F.courses.unshift([L.id,L.title,'journey.html']);
 let log=F.create(L.title,L.tasks),frame=0,playing=false;
 let state=Object.assign({time:0,returnMinutes:4,mode:'distance'},log.checkpoint.journey||{});
 try{L.walk(state.time,state.returnMinutes);L.series(state.mode,state.returnMinutes,state.time);}catch{state={time:0,returnMinutes:4,mode:'distance'};}
 const $=s=>host.querySelector(s),save=()=>log.point({journey:state});
 function stop(){cancelAnimationFrame(frame);playing=false;}
 function say(text){$('#journey-message').textContent=text;}
 function fmt(n){return Number(n.toFixed(1)).toString();}
 function choices(values){return `<div class="journey-choices" role="group" aria-label="选择判断">${values.map((x,i)=>`<button data-choice="${i}" aria-pressed="false">${esc(x)}</button>`).join('')}</div>`;}
 function reason(label,optional=false){return `<div class="journey-reason"><label for="journey-reason">${label}${optional?'（可选）':''}</label><textarea id="journey-reason" rows="3" maxlength="700" placeholder="一句话、算式或关键词就好，也可以用键盘语音输入。"></textarea><label class="journey-unsure"><input id="journey-unsure" type="checkbox">暂时说不清，先如实记录</label></div>`;}
 function chart(points,{maxT,maxY,ticksY,ticksT,yLabel,caption,cursor=null}){
  const x=t=>70+520*t/maxT,y=v=>260-210*v/maxY;
  return `<figure class="journey-chart"><div class="journey-chart-heading"><b>${esc(yLabel)}</b><span>横轴：时间 / 分钟</span></div><svg viewBox="0 0 620 315" role="img" aria-label="${esc(caption)}"><g stroke="#d7e0d8" stroke-width="1">${ticksY.map(v=>`<path d="M70 ${y(v)}H590"/>`).join('')}</g><path d="M70 30V260H597" fill="none" stroke="#6c8279" stroke-width="2"/><g fill="#405e52" font-size="24">${ticksY.map(v=>`<text x="59" y="${y(v)+7}" text-anchor="end">${v}</text>`).join('')}${ticksT.map(t=>`<text x="${x(t)}" y="290" text-anchor="middle">${t}</text>`).join('')}</g><polyline points="${points.map(p=>`${x(p.t)},${y(p.y)}`).join(' ')}" fill="none" stroke="#26765e" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>${points.map(p=>`<circle cx="${x(p.t)}" cy="${y(p.y)}" r="5" fill="#26765e"/>`).join('')}${cursor?`<path d="M${x(cursor.t)} 35V260" stroke="#b87338" stroke-width="2" stroke-dasharray="6 6"/><circle cx="${x(cursor.t)}" cy="${y(cursor.y)}" r="8" fill="#b87338" stroke="#fffdf5" stroke-width="3"/>`:''}</svg><figcaption>${esc(caption)}</figcaption></figure>`;
 }
 function initialGraph(){return chart([{t:0,y:0},{t:4,y:600},{t:6,y:600},{t:10,y:0}],{maxT:10,maxY:600,ticksY:[0,300,600],ticksT:[0,2,4,6,8,10],yLabel:'离家距离 / 米',caption:'小宇始终在家的同一侧、同一条直路上活动。图上每一点记录“某时刻离家多远”，不是道路的形状。'});}
 function progress(){document.querySelectorAll('.journey-nav li').forEach((el,i)=>{el.classList.toggle('active',i===log.index);el.classList.toggle('done',log.records[i].done);if(i===log.index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
 function input(){const selected=$('[data-choice][aria-pressed=true]');return {...state,choice:selected?Number(selected.dataset.choice):null,answer:$('#journey-number')?.value.trim()||'',reason:$('#journey-reason').value.trim(),unsure:$('#journey-unsure').checked};}
 function explanation(data){return data.reason||(data.unsure?'暂时说不清':'');}
 function answer(i,data){if(i===0)return L.initial[data.choice];if(i===1){const m=L.walk(data.time,data.returnMinutes);return `返程设为${data.returnMinutes}分钟；第${fmt(data.time)}分钟，纵轴为${data.mode==='distance'?'离家距离':'累计路程'}；离家${fmt(m.distance)}米，累计${fmt(m.cumulative)}米。`;}if(i===2)return data.answer?data.answer+'米':'暂时不会';return explanation(data);}
 function submit(i,data){const value=answer(i,data),why=explanation(data),last=log.records[i].attempts.at(-1);if(last?.answer===value&&last?.explanation===why)return;log.submit(i,value,i===0?data.choice===1:i===2?(data.answer?Number(data.answer)===L.robot.answer:false):null,why);}
 function move(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.journey-nav').scrollIntoView({block:'start'});}
 function render(focus=false){
  stop();progress();const i=log.index;
  if(i===L.tasks.length){finish();if(focus)move();return;}
  let body='';
  if(i===0)body=`<p class="journey-label">先判断 / 不急着背口诀</p><h2 tabindex="-1">第4—6分钟，小宇在做什么？</h2><p class="journey-lead">先看清两个轴，再判断第 <b>4—6 分钟</b> 发生了什么。</p>${initialGraph()}${choices(L.initial)}${reason('我这样判断，是因为图上……')}`;
  if(i===1)body=`<p class="journey-label">动手看图 / 一次行程，两种记录</p><h2 tabindex="-1">人回家了，两个数一起回到 0 吗？</h2><div class="journey-example"><h3>先把刚才的水平段读完整</h3><p>第4分钟和第6分钟，都离家600米。<b>时间多了2分钟，位置没变</b>，所以画出水平段；“水平”也不代表“在家”。</p><p>再看一个短例子：第2分钟离家300米，第4分钟离家600米。这2分钟走了 <b>600−300＝300米</b>，平均每分钟150米。看这段的变化量，不能把终点600米当作这段走的路。</p></div><p>下面仍是同一条直路：去程4分钟走600米，在原地停2分钟，再沿原路回家。<b>把时间拖到返程，再切换纵轴</b>；留意人物没换路线，图为什么变了。想进一步比较，可改变返程用时。</p>${bench()}${reason('我切换了……，看到返程时……；这是因为这条纵轴记录的是……')}<details class="journey-help" data-help="两种纵轴比较提示"><summary>给我一点提示</summary><p>“现在离家多远”和“从出发一共走了多远”各在数什么？回头走过的路，要不要加进累计路程？</p></details>`;
  if(i===2)body=`<p class="journey-label">自己读图 / 起点换了</p><h2 tabindex="-1">机器人到站了，它一共走了多少米？</h2><p class="journey-lead">${esc(L.robot.context)}</p>${chart(L.robot.points,{maxT:10,maxY:600,ticksY:[0,200,400,600],ticksT:[0,2,4,6,8,10],yLabel:'离基站距离 / 米',caption:'记录点为（0分，200米）、（4分，600米）、（6分，600米）、（10分，0米）；点之间用直线连接。'})}<label for="journey-number">从计时0分到10分，共走过</label><div class="journey-input"><input id="journey-number" inputmode="decimal" autocomplete="off" maxlength="24"><span>米</span></div>${reason('图上哪两段变化支持这个数？可以留一个算式。')}<details class="journey-help" data-help="机器人行程提示"><summary>我需要一点提示</summary><p>别漏掉计时开始时机器人已经在哪里。每个时间段的两端，各离基站多远？停留的那段增加了多少路程？</p></details>`;
  if(i===3)body=`<p class="journey-label">换一种量 / 给设备记录把关</p><h2 tabindex="-1">同样是水平、下降，还能照搬刚才的说法吗？</h2><p class="journey-lead">${esc(L.tank.context)}</p>${chart(L.tank.points,{maxT:8,maxY:100,ticksY:[0,30,60,90],ticksT:[0,1,2,3,4,5,6,7,8],yLabel:'箱内水量 / 升',caption:'记录点为（0分，30升）、（3分，90升）、（5分，90升）、（8分，45升）；点之间用直线连接。'})}<blockquote class="journey-log">设备员写道：<br>“第3—5分钟是水平线，说明两个阀门都关了。<br>第5—8分钟是下降线，说明每分钟流出45升水。”</blockquote><p><b>只凭这张图，这两句能确认吗？</b>帮他改得准确一点：图能确定什么，哪些情况还不知道？</p>${reason('我的核对意见……')}<details class="journey-help" data-help="水箱读图提示"><summary>我需要一点提示</summary><p>先读纵轴：这里记的是箱内还剩多少水。比较一段时间的起点和终点；如果有水流入、也有水流出，箱内水量反映的是哪两者共同作用后的结果？</p></details>`;
  host.innerHTML=`<section class="journey-card">${body}<p class="journey-error" id="journey-message" role="status"></p><button class="primary" id="journey-submit">${i===0?'留下判断，动手验证 →':'保存我的回答，看看依据'}</button><div id="journey-review"></div></section>`;
  F.watchHelp(host,log,i);
  host.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>host.querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))));
  if(i===1){log.help(1,'随课短示例：时间段、距离变化与水平段');setupBench();}
  $('#journey-submit').onclick=()=>{if(i===1){stop();save();draw();}const data=input(),error=L.validate(i,data);if(error){say(error);return;}say('');submit(i,data);if(i===0){log.finish(i);render(true);}else review(i,true);};
  if(i>0&&log.records[i].first)review(i,false);
  if(focus)move();
 }
 function bench(){return `<div class="journey-lab"><h3>同一路程，亲手描一遍</h3><div class="journey-modes" role="group" aria-label="选择纵轴"><button data-mode="distance" aria-pressed="false">离家距离</button><button data-mode="cumulative" aria-pressed="false">累计路程</button></div><div class="journey-controls"><label for="journey-return">返程用时（只改这一段）</label><select id="journey-return"><option value="2">2分钟</option><option value="4">4分钟</option><option value="6">6分钟</option></select><label for="journey-time">时间 <output id="journey-time-output"></output></label><input id="journey-time" type="range" min="0" max="10" step="0.1" value="0" aria-label="时间（分钟）"></div><div class="journey-road"><svg viewBox="0 0 620 120" role="img" aria-labelledby="journey-road-title"><title id="journey-road-title">人物在同一直路上的位置</title><path d="M55 70H565" stroke="#c0cebd" stroke-width="12" stroke-linecap="round"/><text x="55" y="108" text-anchor="middle" fill="#405e52" font-size="22">家 · 0米</text><text x="550" y="108" text-anchor="middle" fill="#405e52" font-size="22">600米处</text><g id="journey-person" fill="#b87338"><circle cy="28" r="10"/><path d="M0 40V60M0 46L-12 55M0 46L12 55M0 60L-11 70M0 60L11 70" stroke="#b87338" stroke-width="5" stroke-linecap="round"/></g></svg></div><div id="journey-plot"></div><div class="journey-readings"><div><span>时间</span><strong id="journey-clock"></strong></div><div><span>离家距离</span><strong id="journey-distance"></strong></div><div><span>累计路程</span><strong id="journey-total"></strong></div></div><div class="journey-actions"><button class="secondary" id="journey-play">播放行程</button><button class="secondary" id="journey-reset">回到出发时</button></div><p class="journey-note" id="journey-observation" role="status"></p><p class="journey-fine">上面是直路，下面是数量随时间的记录。向下的线不表示下坡。两种纵轴都固定为0—1200米，横轴固定为0—12分钟；一次只换记录的量，或返程用时。行程结束就停止描点。</p></div>`;}
 function draw(){
  const m=L.walk(state.time,state.returnMinutes),value=state.mode==='distance'?m.distance:m.cumulative,label=state.mode==='distance'?'离家距离':'累计路程';
  $('#journey-person').setAttribute('transform',`translate(${55+510*m.distance/600} 0)`);
  $('#journey-road-title').textContent=`第${fmt(state.time)}分钟，离家${fmt(m.distance)}米，累计走过${fmt(m.cumulative)}米。`;
  $('#journey-plot').innerHTML=chart(L.series(state.mode,state.returnMinutes,state.time),{maxT:12,maxY:1200,ticksY:[0,300,600,900,1200],ticksT:[0,2,4,6,8,10,12],yLabel:label+' / 米',caption:`橙点：（${fmt(state.time)}分钟，${fmt(value)}米）。只画到当前时刻；这是${label}的记录。`,cursor:{t:state.time,y:value}});
  $('#journey-clock').textContent=fmt(state.time)+' 分';$('#journey-distance').textContent=fmt(m.distance)+' 米';$('#journey-total').textContent=fmt(m.cumulative)+' 米';
  $('#journey-time').max=m.end;$('#journey-time').value=state.time;$('#journey-time-output').textContent=fmt(state.time)+' / '+m.end+' 分钟';$('#journey-return').value=state.returnMinutes;
  host.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
  $('#journey-play').textContent=playing?'暂停观察':'播放行程';
  let note=state.time<4?'去程：离家越来越远，已经走过的路也越来越长。':state.time<6?'停留：时间继续增加，离家距离和累计路程都不变。':state.time<m.end?'返程：人向家走，离家距离减少；新走过的路仍要加进累计路程。':'回到家：离家距离为0，累计走过的1200米没有消失。';
  if(state.time>=6)note+=` 返程600米用了${state.returnMinutes}分钟，平均每分钟${fmt(600/state.returnMinutes)}米。`;
  $('#journey-observation').textContent=note;
 }
 function setupBench(){
  host.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();draw();});
  $('#journey-time').oninput=()=>{stop();state.time=Number($('#journey-time').value);save();draw();};
  $('#journey-return').onchange=()=>{stop();state.returnMinutes=Number($('#journey-return').value);state.time=0;save();draw();};
  $('#journey-reset').onclick=()=>{stop();state.time=0;save();draw();};
  $('#journey-play').onclick=()=>{if(playing){stop();save();draw();return;}const end=6+state.returnMinutes;if(state.time>=end)state.time=0;if(matchMedia('(prefers-reduced-motion: reduce)').matches){state.time=end;save();draw();return;}playing=true;const start=performance.now(),from=state.time;function tick(now){if(!playing)return;const time=Math.min(end,Math.round((from+(now-start)/800)*10)/10);if(time!==state.time){state.time=time;draw();}if(state.time===end){stop();save();draw();}else frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);draw();};
  draw();
 }
 function review(i,recordHelp){
  const body=i===1?'<p><b>换的是记录的量，不是人物走的路线。</b>返程时离家越来越近，所以距离图下降；回头走过的路也算路程，所以累计图上升。到家时分别是0米和1200米。</p><p>返程改用2、4、6分钟，同样的600米分别对应300、150、100米/分。比较快慢要看一段的“变化量 ÷ 用时”，并核对轴的刻度，不能只看线的高度。</p>':i===2?'<p>计时开始时已在离基站200米处，前4分钟走了 <b>600−200＝400米</b>；停留2分钟没有增加路程；返程又走了 <b>600−0＝600米</b>。</p><p>所以计时这10分钟，累计走过 <b>400＋600＝1000米</b>。最后离基站0米，只能说明到了站，不能说明没走路；也不能一律把最大距离乘2。</p>':`<p>${esc(L.tank.reference)}</p><ul>${L.tank.checks.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
  $('#journey-review').innerHTML=`<section class="journey-review"><h3>对照关系，保留自己的话</h3>${body}<p class="journey-fine">可以修改上面的回答再保存。首答和修改分别留存；解释不按关键词判分。</p><button class="primary" id="journey-next">${i===3?'收好这次学习记录':'收好这一步，继续'} →</button></section>`;
  if(recordHelp)log.help(i,'参考思路（提交后）');$('#journey-submit').textContent='保存修改后的回答';
  $('#journey-next').onclick=()=>{const data=input(),error=L.validate(i,data);if(error){say(error);return;}submit(i,data);log.finish(i);render(true);};
  if(recordHelp)$('#journey-review').scrollIntoView({block:'start'});
 }
 function finish(){host.innerHTML=`<section class="journey-card"><p class="journey-label">这次先收好 / 下次换图再试</p><h2 tabindex="-1">先问纵轴记什么，再解释线怎么变。</h2><p class="journey-takeaway">读一个点，看某时刻的量；<br>读一段线，看这段时间的变化。</p><p>回家不等于没走路，水量不变也未必表示没有进出水。图能告诉我们什么，要由坐标含义和已知条件共同决定。</p><p class="journey-fine">几天后可以只看机器人或水箱图，再讲一遍依据。完成这课不等于已经长期掌握；后续气候图与分段费用课会再次用到读轴、读变化的方法。</p>${log.html()}<div class="journey-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school">回到TY敏捷课堂</a><button class="secondary" id="journey-restart">再试一轮（旧记录保留）</button></div></section>`;$('#journey-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={time:0,returnMinutes:4,mode:'distance'};render(true);};}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(log.index===1)save();}});
 window.addEventListener('pagehide',()=>{stop();if(log.index===1)save();});
 render();
})();
