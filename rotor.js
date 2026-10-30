'use strict';
(function(){
  const host=document.querySelector('#rotor-task'),L=RotorLesson,M=RotorModel,esc=LearningFeedback.esc;
  if(!LearningFeedback.flexibleTasks){
    host.innerHTML='<section class="rotor-task-card"><h2>新探索课正在更新</h2><p>已有学习记录会保留。请保持联网，更新完成后重新打开。</p><button class="primary" id="rotor-refresh">重新打开</button></section>';
    document.querySelector('#rotor-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!LearningFeedback.courses.some(course=>course[0]===L.id))LearningFeedback.courses.unshift([L.id,L.title,'rotor.html']);
  let log=LearningFeedback.create(L.title,L.tasks);
  const defaults={
    q0Choice:null,q0Reason:'',q0Unsure:false,q0FinalReason:'',q0FinalUnsure:false,q0Observed:false,q0VacuumSeen:false,q0DroneSeen:false,q0Density:1,q0View:'pair',
    q1Rpm:70,q1Hover:false,q1Answers:{},q1Reason:'',q1Unsure:false,q1Message:'',
    q2Answers:{},q2Reason:'',q2Unsure:false,q2Judged:false,q2Direction:'normal',q2Reversed:false,q2FinalReason:'',q2FinalUnsure:false,
    tiltThrust:12,tiltAchieved:false
  };
  let state=Object.assign({},defaults,log.checkpoint.rotor||{});
  state.q1Answers=Object.assign({},defaults.q1Answers,state.q1Answers||{});
  state.q2Answers=Object.assign({},defaults.q2Answers,state.q2Answers||{});
  if(!Number.isInteger(state.q1Rpm)||state.q1Rpm<0||state.q1Rpm>130)state.q1Rpm=70;
  if(![0,.5,1].includes(state.q0Density))state.q0Density=1;
  if(!['pair','drone','pressure'].includes(state.q0View))state.q0View='pair';
  if(!['normal','reverse'].includes(state.q2Direction))state.q2Direction='normal';
  if(!Number.isFinite(state.tiltThrust)||state.tiltThrust<8||state.tiltThrust>18)state.tiltThrust=12;
  let animationFrame=0,playing=false,lastFrame=0,flowPhase=0,saveTimer=0;

  const fromForces=new URLSearchParams(location.search).get('from')==='forces';
  if(fromForces){const back=document.querySelector('.rotor-header .back-link');back.href='forces.html';back.textContent='← 返回「力与平衡」';}
  const sourceDetails=document.querySelector('.rotor-sources');
  sourceDetails?.addEventListener('toggle',()=>{if(sourceDetails.open)log.help(Math.min(log.index,L.tasks.length-1),'展开模型边界与知识来源');});

  const $=selector=>host.querySelector(selector);
  function stopAnimation(){playing=false;cancelAnimationFrame(animationFrame);animationFrame=0;lastFrame=0;const button=$('#rotor-play');if(button){button.textContent='播放气流';button.setAttribute('aria-pressed','false');}}
  function save(){clearTimeout(saveTimer);saveTimer=0;log.point({rotor:state});}
  function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,350);}
  function flushSave(){if(saveTimer)save();}
  function setMessage(text,error=false){const box=$('#rotor-message');if(!box)return;box.textContent=text;box.classList.toggle('error',error);}
  function reasonValue(prefix){const text=$(`#${prefix}-reason`)?.value.trim()||'';return text||($(`#${prefix}-unsure`)?.checked?'暂时说不清':'');}
  function bindReason(index,prefix,textKey,unsureKey){
    const text=$(`#${prefix}-reason`),unsure=$(`#${prefix}-unsure`);
    if(!text||!unsure)return;
    text.value=state[textKey]||'';unsure.checked=state[unsureKey]===true;
    const sync=()=>{state[textKey]=text.value;state[unsureKey]=unsure.checked;scheduleSave();};
    text.addEventListener('input',sync);text.addEventListener('change',()=>{sync();save();});unsure.addEventListener('change',()=>{sync();save();});
  }
  function choose(container,selector,key,after){
    container.querySelectorAll(selector).forEach(button=>{
      const value=Number(button.dataset.choice);
      button.setAttribute('aria-pressed',String(value===state[key]));
      button.onclick=()=>{state[key]=value;container.querySelectorAll(selector).forEach(el=>el.setAttribute('aria-pressed',String(el===button)));save();after?.(value);};
    });
  }
  function bindHelp(index){
    host.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)log.help(index,details.dataset.help);}));
  }
  function progress(){
    document.querySelectorAll('.rotor-progress li').forEach((item,index)=>{
      item.classList.toggle('done',log.records[index].done);item.classList.toggle('active',index===log.index);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function choiceButtons(options,key='choice'){
    return `<div class="rotor-choices">${options.map((option,index)=>`<button type="button" data-${key}="${index}" aria-pressed="false"><span>${String.fromCharCode(65+index)}</span>${esc(option)}</button>`).join('')}</div>`;
  }
  function reasonMarkup(prefix,label){
    return `<div class="rotor-reason"><label for="${prefix}-reason">${label}</label><textarea id="${prefix}-reason" rows="2" maxlength="500" placeholder="一句自己的话就够，也可使用键盘语音输入。"></textarea><label class="rotor-unsure"><input id="${prefix}-unsure" type="checkbox">暂时说不清，先如实记录</label></div>`;
  }
  function pressureOverlay(){
    return `<g id="rotor-pressure-force" hidden>
      <g class="pressure-up"><path d="M250 245V194"/><path d="M300 245V182"/><path d="M350 245V182"/><path d="M400 245V194"/></g>
      <g class="pressure-down"><path d="M270 191V211"/><path d="M320 181V207"/><path d="M370 191V211"/></g>
      <text x="320" y="149" text-anchor="middle">上方压得较少</text><text x="320" y="286" text-anchor="middle">下方推得更多</text>
    </g><g id="rotor-pressure-empty" hidden><text id="rotor-pressure-empty-title" x="320" y="168" text-anchor="middle">没有空气</text><text id="rotor-pressure-empty-note" x="320" y="288" text-anchor="middle">不形成这组空气压力差</text></g>`;
  }
  function flowMarkup(mode){
    const adjustable=mode==='balance';
    return `<section class="rotor-lab" aria-label="旋翼与空气互动动画">
      <div class="rotor-toolbar"><div><p class="rotor-kicker">${adjustable?'先看70%示例，再把两支力箭头调到一样长':'让时间前进，追踪空气与旋翼'}</p><h3>${adjustable?'多快才刚好悬停？':'同一时刻，两个物体各自发生什么？'}</h3></div><button class="primary" id="rotor-play" aria-pressed="false">播放气流</button></div>
      ${adjustable?`<div class="rotor-controls rotor-one-control"><label class="rotor-speed" for="rotor-rpm">相对转速 <output id="rotor-rpm-value">${state.q1Rpm}%</output><input type="range" id="rotor-rpm" min="0" max="130" step="1" value="${state.q1Rpm}"></label></div>`:`<div class="rotor-controls rotor-observation-controls"><div id="rotor-density-wrap" ${state.q0Observed?'':'hidden'}><span>换一种环境再看</span><div class="rotor-environment" role="group" aria-label="空气环境"><button data-density="1" aria-pressed="false">普通空气</button><button data-density=".5" aria-pressed="false">一半密度</button><button data-density="0" aria-pressed="false">真空</button></div></div></div><div class="rotor-views" role="group" aria-label="切换观察视角"><button data-view="pair" aria-pressed="false">整体：空气与旋翼</button><button data-view="drone" aria-pressed="false">只看无人机</button><button data-view="pressure" aria-pressed="false">贴近叶片表面</button></div>`}
      <div class="rotor-lab-grid">
        <div class="rotor-flow"><p class="rotor-diagram-label">侧面示意 · 四个旋翼合并成一个等效圆盘</p>
          <svg id="rotor-scene" viewBox="0 0 640 510" role="img" aria-label="旋翼与空气作用示意">
            <defs><marker id="rotor-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#24644e"/></marker><marker id="rotor-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#ad5c2d"/></marker><marker id="rotor-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#8b948f"/></marker></defs>
            <path class="rotor-stream" d="M250 32Q264 180 270 470M390 32Q376 180 370 470"/><g id="rotor-parcels" fill="#438da7"></g>
            <g class="rotor-machine"><path d="M320 220V282"/><rect x="287" y="261" width="66" height="39" rx="12"/><ellipse cx="320" cy="220" rx="119" ry="10"/><path id="rotor-blade" d="M207 220H433"/><circle cx="320" cy="220" r="9"/></g>
            <text x="320" y="337" text-anchor="middle" class="rotor-machine-label">旋翼与机身</text>
            <g id="rotor-air-force"><path id="rotor-down-arrow" d="M132 240V355" marker-end="url(#rotor-orange)"/><text x="20" y="392">旋翼推空气 ↓</text><text x="20" y="424" id="rotor-down-value">12.0 N</text></g>
            <g id="rotor-drone-force"><path id="rotor-up-arrow" d="M492 220V105" marker-end="url(#rotor-green)"/><text x="435" y="49">空气推旋翼 ↑</text><text x="435" y="81" id="rotor-up-value">12.0 N</text></g>
            ${pressureOverlay()}<text x="320" y="501" text-anchor="middle" id="rotor-flow-caption">空气被持续向下加速。</text>
          </svg><div class="rotor-mobile-force-labels"><p class="rotor-mobile-down">旋翼推空气 ↓ <b id="rotor-down-mobile">12.0 N</b></p><p class="rotor-mobile-up">空气推旋翼 ↑ <b id="rotor-up-mobile">12.0 N</b></p></div><p class="rotor-small">蓝点代表一小团空气，不是单个分子；画面固定无人机位置，只为看清气流与受力。</p>
        </div>
        <aside class="rotor-force-card"><p class="rotor-kicker">只研究无人机</p><h3>加在它身上的竖直力</h3>
          <svg id="rotor-balance" viewBox="0 0 300 310" role="img" aria-label="无人机的空气推力与重力"><defs><marker id="balance-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#24644e"/></marker><marker id="balance-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#6b7371"/></marker></defs><path id="balance-up" d="M150 160V78" marker-end="url(#balance-green)"/><path d="M150 160V242" class="balance-weight" marker-end="url(#balance-gray)"/><rect x="126" y="145" width="48" height="30" rx="9"/><path d="M103 142H197" class="balance-rotor"/><text x="150" y="27" text-anchor="middle">空气给无人机 ↑</text><text id="balance-up-value" x="150" y="51" text-anchor="middle">12.0 N</text><text x="150" y="280" text-anchor="middle">地球给无人机 ↓ 12.0 N</text></svg>
          <p class="rotor-net" id="rotor-net">竖直合力 0.0 N</p><p id="rotor-motion">原来静止时，可以保持悬停。</p><p class="rotor-card-note">橙色向下的力作用在空气上，不能搬进这张无人机受力图里相减。</p>
        </aside>
      </div>
      <div class="rotor-controls rotor-bottom-controls"><label class="rotor-slow"><input type="checkbox" id="rotor-slow">慢放</label><button type="button" id="rotor-step">前进一小步</button><button type="button" id="rotor-reset">恢复本环节起点</button></div>
      <p class="rotor-status" id="rotor-status" role="status"></p>
    </section>`;
  }
  function setupFlow(mode){
    const adjustable=mode==='balance',reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),play=$('#rotor-play'),dots=$('#rotor-parcels');
    dots.innerHTML=Array.from({length:28},()=>'<circle r="5"/>').join('');
    let rpm=adjustable?state.q1Rpm:100,density=adjustable?1:state.q0Density,view=adjustable?'drone':state.q0View,slow=false,observedTravel=state.q0Observed ? .28 : 0;
    function model(){return M.state(rpm,density);}
    function advanceFlow(amount){
      flowPhase=(flowPhase+amount)%1;
      if(mode!=='source'||state.q0Observed||rpm===0||density===0)return;
      observedTravel+=Math.abs(amount);
      if(observedTravel>=.28){state.q0Observed=true;$('#rotor-density-wrap')?.removeAttribute('hidden');save();setMessage('一团空气已经完整经过旋翼：旧空气离开，新空气继续进入。');}
    }
    function drawFlow(){
      const s=model(),visible=density===0?0:density===.5?14:28;
      [...dots.children].forEach((dot,index)=>{dot.style.display=index<visible?'':'none';const progress=(flowPhase+(index%7)/7+Math.floor(index/7)*.03)%1,pos=M.parcel(progress,Math.floor(index/7));dot.setAttribute('cx',pos.x);dot.setAttribute('cy',pos.y);dot.setAttribute('opacity',.4+.6*progress);});
      const stretch=.22+.78*Math.abs(Math.cos(flowPhase*18));$('#rotor-blade').setAttribute('d',`M${320-113*stretch} 220H${320+113*stretch}`);
      $('.rotor-stream').style.opacity=density===0?'0':'1';dots.setAttribute('opacity',s.airMoving?'1':'.55');
    }
    function draw(){
      const s=model(),m=s.thrust.toFixed(1),arrow=80*s.thrust/12;
      const slider=$('#rotor-rpm');if(slider){slider.value=rpm;$('#rotor-rpm-value').textContent=rpm+'%';}
      $('#rotor-slow').checked=slow;
      host.querySelectorAll('[data-density]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.density)===density)));
      host.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
      const pressureActive=view==='pressure'&&s.thrust>0;
      $('#rotor-air-force').toggleAttribute('hidden',view!=='pair');$('#rotor-pressure-force').toggleAttribute('hidden',!pressureActive);$('#rotor-pressure-empty').toggleAttribute('hidden',view!=='pressure'||s.thrust>0);
      $('#rotor-pressure-force').style.opacity=String(.35+.65*Math.min(s.thrust/12,1));
      $('#rotor-pressure-empty-title').textContent=density===0?'没有空气':'旋翼没有驱动空气';$('#rotor-pressure-empty-note').textContent='不形成这组空气压力差';
      $('#rotor-up-arrow').setAttribute('d',`M492 220V${220-arrow}`);$('#rotor-down-arrow').setAttribute('d',`M132 240V${240+arrow}`);
      ['#rotor-up-arrow','#rotor-down-arrow','#balance-up'].forEach(id=>$(id).style.visibility=s.thrust===0?'hidden':'visible');
      $('#rotor-up-value').textContent=m+' N';$('#rotor-down-value').textContent=m+' N';$('#rotor-up-mobile').textContent=m+' N';$('#rotor-down-mobile').textContent=m+' N';$('#balance-up-value').textContent=m+' N';$('#balance-up').setAttribute('d',`M150 160V${160-82*s.thrust/12}`);
      $('.rotor-mobile-down').toggleAttribute('hidden',view!=='pair');$('.rotor-mobile-up').toggleAttribute('hidden',view==='pressure');
      $('#rotor-net').textContent=s.balance?'竖直合力 0.0 N':`竖直合力 ${Math.abs(s.net).toFixed(1)} N，向${s.net>0?'上':'下'}`;
      $('#rotor-motion').textContent=s.balance?'原来静止时，可以保持悬停；原来已有速度时，平衡不会让它立刻停下。':`若从静止放开：产生向${s.net>0?'上':'下'}的加速度。合力不直接说明原有速度方向。`;
      let status=density===0?'真空：旋翼可以转，但没有空气可加速，空气推力为0。':rpm===0?'停转：空气仍在，但没有旋翼驱动的下洗，空气推力为0。':`每秒${s.massFlow.toFixed(2)} kg空气获得向下${s.wakeSpeed.toFixed(1)} m/s的速度变化；空气给旋翼向上${m} N。`;
      if(view==='drone')status+=' 现在只保留作用在无人机上的空气推力和重力。';
      if(view==='pressure')status+=s.thrust>0?' 叶片上下表面的压力作用合起来，得到同一个向上空气动力。':density===0?' 没有空气，因此叶片表面不形成这组空气压力差。':' 旋翼没有驱动空气，因此不形成这组空气压力差。';
      $('#rotor-status').textContent=status;$('#rotor-flow-caption').textContent=density===0?'真空中：有转动，没有空气推力。':rpm===0?'停转：没有被持续加速的下洗气流。':'空气经过旋翼后，持续带着向下的动量离开。';
      $('#rotor-scene').setAttribute('aria-label',`相对转速${rpm}%，${density===0?'真空':density===.5?'一半空气密度':'普通空气'}；空气给旋翼向上${m}牛顿。`);
      drawFlow();
      if(adjustable){
        const hover=Math.abs(s.net)<=.12;
        if(hover&&!state.q1Hover){state.q1Hover=true;save();const panel=$('#rotor-scenarios');if(panel)panel.hidden=false;setMessage('两支力箭头一样长：你调出了悬停条件。接着判断三个飞行瞬间。');}
      }
    }
    function tick(now){if(!playing)return;const dt=lastFrame?Math.min((now-lastFrame)/1000,.06):0;lastFrame=now;advanceFlow(dt*.24*(rpm/100)*(slow?.23:1));drawFlow();animationFrame=requestAnimationFrame(tick);}
    play.onclick=()=>{if(playing){stopAnimation();return;}if(reduced.matches){advanceFlow(.07*(rpm/100));drawFlow();setMessage(state.q0Observed?'一团空气已经完整经过旋翼。':'已前进一小步。设备启用了减少动态效果，可继续单步观察。');return;}playing=true;play.textContent='暂停气流';play.setAttribute('aria-pressed','true');animationFrame=requestAnimationFrame(tick);};
    $('#rotor-step').onclick=()=>{stopAnimation();advanceFlow(.07*(rpm/100));drawFlow();setMessage(state.q0Observed?'一团空气已经完整经过旋翼：旧空气离开，新空气接着进入。':`空气团继续向下经过；再前进${Math.max(1,Math.ceil((.28-observedTravel)/.07))}小步看完整过程。`);};
    $('#rotor-slow').onchange=event=>{slow=event.target.checked;};
    $('#rotor-reset').onclick=()=>{stopAnimation();flowPhase=0;slow=false;if(adjustable){rpm=70;state.q1Rpm=70;}else{density=1;view='pair';state.q0Density=1;state.q0View='pair';}save();draw();};
    host.querySelectorAll('[data-density]').forEach(button=>button.onclick=()=>{density=Number(button.dataset.density);state.q0Density=density;if(density===0)state.q0VacuumSeen=true;save();draw();});
    host.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{view=button.dataset.view;state.q0View=view;if(view==='drone')state.q0DroneSeen=true;save();draw();});
    const slider=$('#rotor-rpm');if(slider){slider.oninput=event=>{rpm=Number(event.target.value);state.q1Rpm=rpm;draw();};slider.onchange=()=>save();}
    draw();
  }
  function bindTask0Choice(){choose(host,'[data-choice]','q0Choice');}
  function renderSource(){
    const r=log.records[0],after=!!r.first;
    const reason=after?reasonMarkup('q0-final','把两次操作和结论连起来：我切到真空看到……；只看无人机时看到……；所以……'):reasonMarkup('q0','先写下你为什么这样选');
    host.innerHTML=`<section class="rotor-task-card"><p class="rotor-step-label">01 / 追踪空气</p><h2>空气流走，向上的力会断吗？</h2><p>一架无人机悬停在离地20米处，气流不会撞到地面。哪种解释最站得住？</p>${choiceButtons(L.sourceChoices)}${reason}<p id="rotor-message" class="rotor-message" role="status">${after?(r.first.correct?'首答已经保存。现在别急着背结论，让动画把两个物体分开。':'首答已经保存。动画会帮你追踪空气和旋翼，不会覆盖第一次想法。'):'先留下判断，动画才会出现。'}</p>${after?`${flowMarkup('source')}<details class="rotor-hint" data-help="提示：分开追踪两个物体"><summary>还是容易混？只看一个追踪方法</summary><p>先问“哪个物体的运动发生了改变”，再问“是谁给它的力”。不要把空气运动方向直接当成无人机受力方向。</p></details><button class="primary rotor-submit" id="q0-finish">保存验证后的解释</button>`:'<button class="primary rotor-submit" id="q0-submit">留下首答，再看气流</button>'}</section>`;
    bindTask0Choice();if(after)bindReason(0,'q0-final','q0FinalReason','q0FinalUnsure');else bindReason(0,'q0','q0Reason','q0Unsure');bindHelp(0);
    if(!after){
      $('#q0-submit').onclick=()=>{const reason=reasonValue('q0');if(state.q0Choice===null||!reason){setMessage('先选择一种解释，并留一句理由；说不清也可以如实勾选。',true);return;}const correct=state.q0Choice===L.sourceAnswer;log.submit(0,L.sourceChoices[state.q0Choice],correct,reason);if(!correct)log.help(0,'自动反馈：追踪空气与旋翼');save();render();};
      return;
    }
    setupFlow('source');
    $('#q0-finish').onclick=()=>{
      const reason=reasonValue('q0-final'),explained=!state.q0FinalUnsure&&!!state.q0FinalReason.trim();
      if(!state.q0Observed){setMessage('先播放或单步，让至少一团空气完整经过旋翼。',true);return;}
      if(!state.q0VacuumSeen){setMessage('再切到“真空”看一次：没有空气时，旋翼转动还能不能产生空气推力？',true);return;}
      if(!state.q0DroneSeen){setMessage('再切到“只看无人机”，分清哪些力真正加在它身上。',true);return;}
      if(state.q0Choice!==L.sourceAnswer||!reason){setMessage('根据刚才的动画重新选择，并留下验证后的解释；暂时说不清也可以如实勾选。',true);return;}
      const answer=L.sourceChoices[state.q0Choice],last=r.attempts.at(-1);
      if(last?.answer!==answer||last.explanation!==reason)log.submit(0,answer,explained,reason);
      log.note(0,'已观察连续气流、真空和无人机单独受力图。');
      const independent=explained&&r.first.correct&&!r.helps.length;
      log.finish(0,!explained?'已完成三项观察；验证后的因果解释暂时说不清，需回看或面谈':independent?'首答判断正确；能把真空、受力视图与因果解释连起来':'在反馈或提示后完成空气与旋翼的因果解释；待换情境再独立调用');
      render();
    };
  }
  const scenarioCopy={hover:{label:'原来静止，保持悬停',options:[['小于','less'],['等于','equal'],['大于','greater']]},accelerate:{label:'从悬停开始向上加速',options:[['小于','less'],['等于','equal'],['大于','greater']]},moving:{label:'已经向上飞，推力忽然小于重力',options:[['立刻向下飞','down'],['仍先向上，但越来越慢','slow'],['速度完全不变','same']]}};
  function scenarioMarkup(){
    return `<div class="rotor-scenario-list">${Object.entries(scenarioCopy).map(([key,item])=>`<fieldset><legend>${item.label}</legend><div>${item.options.map(([label,value])=>`<button type="button" data-scenario="${key}" data-value="${value}" aria-pressed="false">${label}</button>`).join('')}</div></fieldset>`).join('')}</div>`;
  }
  function bindScenarios(){host.querySelectorAll('[data-scenario]').forEach(button=>{const key=button.dataset.scenario;button.setAttribute('aria-pressed',String(state.q1Answers[key]===button.dataset.value));button.onclick=()=>{state.q1Answers[key]=button.dataset.value;host.querySelectorAll(`[data-scenario="${key}"]`).forEach(el=>el.setAttribute('aria-pressed',String(el===button)));save();};});}
  function renderBalance(){
    host.innerHTML=`<section class="rotor-task-card"><p class="rotor-step-label">02 / 调出悬停</p><h2>推力多大，才是悬停？</h2><p>模型把无人机重力固定为12 N。先观察70%转速，再调节到两支力箭头一样长。</p>${flowMarkup('balance')}<section id="rotor-scenarios" class="rotor-scenarios" ${state.q1Hover?'':'hidden'}><h3>同一张受力图，能判断“正在往哪飞”吗？</h3><p>本环节忽略机身空气阻力。为三个瞬间选出最准确的说法。</p>${scenarioMarkup()}${reasonMarkup('q1','为什么“已经向上飞”也可能受到向下的合力？')}<details class="rotor-hint" data-help="提示：区分速度与加速度"><summary>需要一个短提示</summary><p>速度说“现在往哪走”；合力决定加速度，说明“速度正怎样改变”。二者方向可以暂时相反。</p></details><button class="primary rotor-submit" id="q1-submit">提交三个判断</button></section><p id="rotor-message" class="rotor-message" role="status">${esc(state.q1Message||'先把转速调到悬停，后面的判断才会打开。')}</p></section>`;
    bindReason(1,'q1','q1Reason','q1Unsure');bindScenarios();bindHelp(1);setupFlow('balance');
    const submit=$('#q1-submit');if(submit)submit.onclick=()=>{
      const reason=reasonValue('q1'),complete=['hover','accelerate','moving'].every(key=>state.q1Answers[key]);
      if(!complete||!reason){setMessage('三个瞬间都要判断，并留下自己的理由。',true);return;}
      const correct=state.q1Answers.hover==='equal'&&state.q1Answers.accelerate==='greater'&&state.q1Answers.moving==='slow';
      const answer=`悬停：${state.q1Answers.hover}；向上加速：${state.q1Answers.accelerate}；已向上但合力向下：${state.q1Answers.moving}`;
      log.submit(1,answer,correct,reason);
      if(!correct){
        const misses=[];if(state.q1Answers.hover!=='equal')misses.push('悬停');if(state.q1Answers.accelerate!=='greater')misses.push('向上加速');if(state.q1Answers.moving!=='slow')misses.push('已有速度');
        log.help(1,'自动反馈：速度与加速度');state.q1Message=`再看这${misses.length}处：${misses.join('、')}。首答已保留，修改不会覆盖。`;save();render();return;
      }
      log.note(1,`在普通空气中把相对转速调到${state.q1Rpm}%，模型推力约${M.state(state.q1Rpm,1).thrust.toFixed(1)} N。`);
      const independent=rFirstClean(1);log.finish(1,independent?'无提示完成悬停条件与速度—加速度判断':'在提示或反馈后完成本环节；待新状态无提示再做');render();
    };
  }
  function rFirstClean(index){const r=log.records[index];return !!r.first?.correct&&!r.first.helped&&!r.helps.some(help=>help.phase!=='完成后回看');}
  function tiltMarkup(){
    return `<section class="tilt-lab" aria-label="倾斜飞行推力分解实验"><div class="tilt-copy"><p class="rotor-kicker">可选加速挑战 · 固定倾角30° · 重力12 N</p><h3>把总推力调到既能前进，又不掉高度</h3><p>绿色斜箭头是总推力；虚线只把它拆成竖直和水平两份，没有凭空增加新力。</p></div><div class="tilt-grid"><svg id="tilt-scene" viewBox="0 0 380 340" role="img" aria-label="无人机倾斜30度的推力分解"><defs><marker id="tilt-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#24644e"/></marker><marker id="tilt-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#6b7371"/></marker></defs><g transform="rotate(30 150 190)" class="tilt-drone"><path d="M95 190H205"/><rect x="128" y="177" width="44" height="26" rx="7"/></g><path id="tilt-total-arrow" marker-end="url(#tilt-green)"/><path id="tilt-vertical-line" class="tilt-component"/><path id="tilt-horizontal-line" class="tilt-component horizontal"/><path d="M150 190V274" class="tilt-weight" marker-end="url(#tilt-gray)"/><text x="34" y="304">重力 12 N ↓</text><text id="tilt-total-label" x="218" y="65">总推力</text></svg><div class="tilt-readout"><p><span>总推力</span><b id="tilt-total-value">12.0 N</b></p><p><span>竖直分量</span><b id="tilt-vertical-value">10.4 N</b></p><p><span>水平分量</span><b id="tilt-horizontal-value">6.0 N</b></p><p id="tilt-state">竖直分量小于重力：产生向下加速度。</p></div></div><label class="tilt-slider" for="tilt-thrust">调节总推力 <output id="tilt-output">12.0 N</output><input id="tilt-thrust" type="range" min="8" max="18" step="0.1" value="${state.tiltThrust}"></label><p class="rotor-status" id="tilt-status" role="status">先从12 N开始。</p></section>`;
  }
  function setupTilt(){
    const slider=$('#tilt-thrust');
    function draw(){
      const value=M.tilt(state.tiltThrust,30),scale=7,startX=150,startY=190,endX=startX+value.horizontal*scale,endY=startY-value.vertical*scale;
      $('#tilt-total-arrow').setAttribute('d',`M${startX} ${startY}L${endX} ${endY}`);$('#tilt-vertical-line').setAttribute('d',`M${startX} ${startY}V${endY}`);$('#tilt-horizontal-line').setAttribute('d',`M${startX} ${endY}H${endX}`);
      $('#tilt-total-value').textContent=value.thrust.toFixed(1)+' N';$('#tilt-vertical-value').textContent=value.vertical.toFixed(1)+' N';$('#tilt-horizontal-value').textContent=value.horizontal.toFixed(1)+' N';$('#tilt-output').textContent=value.thrust.toFixed(1)+' N';
      const stateText=value.holdsHeight?'竖直分量约等于重力：高度可以保持，同时有向前的水平分量。':`竖直分量${value.netVertical>0?'大于':'小于'}重力：产生向${value.netVertical>0?'上':'下'}的加速度。`;
      $('#tilt-state').textContent=stateText;$('#tilt-status').textContent=stateText;$('#tilt-scene').setAttribute('aria-label',`倾斜30度，总推力${value.thrust.toFixed(1)}牛顿，竖直分量${value.vertical.toFixed(1)}牛顿，水平分量${value.horizontal.toFixed(1)}牛顿；${stateText}`);
      if(value.holdsHeight&&!state.tiltAchieved){state.tiltAchieved=true;save();setMessage('可选挑战完成：竖直分量重新达到12 N，同时保留向前的水平分量。');}
    }
    slider.oninput=event=>{state.tiltThrust=Number(event.target.value);draw();};slider.onchange=()=>save();draw();
  }
  function transferChoices(){
    return `<div class="transfer-questions">${L.transferPrompts.map(prompt=>`<fieldset><legend>${esc(prompt.label)}</legend><div>${prompt.options.map(([label,value])=>`<button type="button" data-transfer="${prompt.key}" data-value="${value}" aria-pressed="false">${esc(label)}</button>`).join('')}</div></fieldset>`).join('')}</div>`;
  }
  function transferAnswer(){return L.transferPrompts.map(prompt=>`${prompt.label}${state.q2Answers[prompt.key]||'未选'}`).join('；');}
  function transferComplete(){return L.transferPrompts.every(prompt=>state.q2Answers[prompt.key]);}
  function transferCorrect(){return L.transferPrompts.every(prompt=>state.q2Answers[prompt.key]===prompt.answer);}
  function bindTransferChoices(){
    host.querySelectorAll('[data-transfer]').forEach(button=>{const key=button.dataset.transfer;button.setAttribute('aria-pressed',String(state.q2Answers[key]===button.dataset.value));button.onclick=()=>{state.q2Answers[key]=button.dataset.value;host.querySelectorAll(`[data-transfer="${key}"]`).forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();};});
  }
  function transferLab(){
    return `<section class="transfer-lab" aria-label="水下探测器螺旋桨反作用实验"><div class="transfer-copy"><p class="rotor-kicker">不换结论，换介质和方向</p><h3>让螺旋桨反转，再检查两支箭头</h3><p>蓝箭头表示水获得的速度变化；绿箭头表示水给探测器的力。它们属于不同物体。</p></div><div class="transfer-direction" role="group" aria-label="螺旋桨转向"><button data-jet="normal" aria-pressed="false">正常：准备向前</button><button data-jet="reverse" aria-pressed="false">反转：准备后退</button></div><svg id="transfer-scene" viewBox="0 0 560 260" role="img" aria-label="水下探测器正常转动，水向后加速，水给探测器向前的力"><defs><marker id="water-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#3d86a1"/></marker><marker id="water-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#24644e"/></marker></defs><g class="sub-robot"><rect x="212" y="94" width="136" height="74" rx="34"/><circle cx="318" cy="130" r="15"/><path d="M212 130H176M176 105V155"/></g><g id="transfer-water"><path id="water-arrow" marker-end="url(#water-blue)"/><text id="water-label" text-anchor="middle">水向后加速</text></g><g id="transfer-force"><path id="robot-arrow" marker-end="url(#water-green)"/><text id="robot-label" text-anchor="middle">水给探测器向前的力</text></g></svg><div class="transfer-mobile-labels"><p id="water-mobile">水向后加速</p><p id="robot-mobile">水给探测器向前的力</p></div><p id="transfer-status" class="rotor-status" role="status"></p></section>`;
  }
  function setupTransfer(){
    function draw(){
      const reverse=state.q2Direction==='reverse';
      $('#water-arrow').setAttribute('d',reverse?'M178 192H360':'M178 192H54');$('#water-label').setAttribute('x',reverse?'355':'96');$('#water-label').setAttribute('y','225');$('#water-label').textContent=reverse?'水向前加速':'水向后加速';
      $('#robot-arrow').setAttribute('d',reverse?'M280 70H158':'M280 70H402');$('#robot-label').setAttribute('x',reverse?'160':'400');$('#robot-label').setAttribute('y','47');$('#robot-label').textContent=reverse?'水给探测器向后的力':'水给探测器向前的力';
      $('#water-mobile').textContent=reverse?'水向前加速':'水向后加速';$('#robot-mobile').textContent=reverse?'水给探测器向后的力':'水给探测器向前的力';
      $('#transfer-status').textContent=reverse?'反转后：螺旋桨让水向前加速，水同时给探测器向后的力。':'正常转动：螺旋桨让水向后加速，水同时给探测器向前的力。';
      $('#transfer-scene').setAttribute('aria-label',$('#transfer-status').textContent);host.querySelectorAll('[data-jet]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.jet===state.q2Direction)));
    }
    host.querySelectorAll('[data-jet]').forEach(button=>button.onclick=()=>{state.q2Direction=button.dataset.jet;if(state.q2Direction==='reverse')state.q2Reversed=true;save();draw();if(state.q2Reversed)setMessage('方向真的变了；现在把“水怎样变、探测器受什么力”写进操作解释。');});draw();
  }
  function renderTransfer(){
    const r=log.records[2],after=!!r.first;
    host.innerHTML=`<section class="rotor-task-card"><p class="rotor-step-label">03 / 换介质迁移</p><h2>水下探测器不碰池壁，为什么能向前？</h2><p>尾部螺旋桨启动后，染色水迹向后离开，探测器开始向前。不要套“空气”两个字，自己完成相互作用账本。</p>${transferChoices()}${after?reasonMarkup('q2-final','把反转操作和结论连起来：反转后水向……；探测器受力向……；所以……'):reasonMarkup('q2','先根据这段新证据说明理由')}<p id="rotor-message" class="rotor-message" role="status">${after?(r.first.correct?'首答已经保存。现在反转螺旋桨，检查方向能否一起反过来。':'首答已经保存。接下来用反转实验核对三个格子，不覆盖第一次判断。'):'先独立完成三格判断，再开放反转实验。'}</p>${after?`${transferLab()}<details class="rotor-hint" data-help="提示：先追踪水"><summary>需要一个短提示</summary><p>先只追踪水：是谁改变了水的运动？再把施力者和受力者交换，方向反过来。</p></details><button class="primary rotor-submit" id="q2-finish">保存反转后的解释</button>`:'<button class="primary rotor-submit" id="q2-submit">留下首答，再反转验证</button>'}</section>`;
    bindTransferChoices();if(after)bindReason(2,'q2-final','q2FinalReason','q2FinalUnsure');else bindReason(2,'q2','q2Reason','q2Unsure');bindHelp(2);
    if(!after){
      $('#q2-submit').onclick=()=>{const reason=reasonValue('q2');if(!transferComplete()||!reason){setMessage('三格都要判断，并留一句理由；暂时说不清也可以如实勾选。',true);return;}const correct=transferCorrect();log.submit(2,transferAnswer(),correct,reason);if(!correct)log.help(2,'自动反馈：追踪水与探测器');state.q2Judged=true;save();render();};return;
    }
    setupTransfer();
    $('#q2-finish').onclick=()=>{
      const reason=reasonValue('q2-final'),explained=!state.q2FinalUnsure&&!!state.q2FinalReason.trim();
      if(!state.q2Reversed){setMessage('先按“反转”，观察水和探测器受力方向怎样一起变化。',true);return;}
      if(!transferCorrect()){setMessage('根据正常与反转两种状态，再检查三个格子。',true);return;}
      if(!reason){setMessage('把反转操作和理由连成一句话；暂时说不清也可以如实勾选。',true);return;}
      log.submit(2,transferAnswer(),explained,reason);log.note(2,'已把螺旋桨切到反转：水改为向前加速，探测器受到水向后的力。');
      const independent=explained&&rFirstClean(2);log.finish(2,!explained?'已完成换介质与反转操作；迁移解释暂时说不清，需回看或面谈':independent?'首答无提示完成水下新情境，并用反转操作验证方向':'在反馈或提示后完成水下迁移；待新装置无提示再做');render();
    };
  }
  function finish(){
    stopAnimation();host.innerHTML=`<section class="rotor-finish"><p class="rotor-step-label">飞行动力实验完成</p><h2 tabindex="-1">空气获得向下的动量；空气同时给旋翼向上的力。</h2><div class="rotor-summary"><p><b>持续推力：</b>旧空气离开，新空气继续进入；旋翼持续改变空气的运动，所以必须持续供电。</p><p><b>悬停条件：</b>推力和重力都作用在无人机上；二者相等时合力为0。已有速度不会因此瞬间消失。</p><p><b>换介质迁移：</b>水下螺旋桨直接推动水；水同时给探测器反方向的力。反转后，两边方向一起反过来。</p></div><p class="rotor-boundary">这不是气球意义上的静浮力，通常称旋翼推力或空气动力升力。本次完成只说明走完了判断、验证和迁移，不代表长期掌握。</p>
      <details class="rotor-details"><summary>再追一层：压力差和空气动量，是两套解释吗？</summary><div class="rotor-details-body"><p>不是。贴近叶片看，空气压力分布在叶片表面，各处作用合成向上的空气动力；从整股气流看，空气获得向下动量。一个描述力怎样传到叶片，一个描述空气最后发生了什么。</p><p>不能用“上表面路长，所以两股空气必须同时到达尾缘”解释；上、下表面都参与改变气流。</p></div></details>
      <details class="rotor-details rotor-tilt-extra"><summary>可选加速挑战：向前倾斜后，为什么还要补推力？</summary><div class="rotor-details-body"><p>无人机原来用12 N总推力悬停。向前倾斜30°后，总推力不变，但竖直分量会变小。把总推力调到既能前进、又保持高度。</p>${tiltMarkup()}</div></details>
      <details class="rotor-details"><summary>月球挑战：普通无人机和火箭，谁能在真空工作？</summary><div class="rotor-details-body"><p>普通旋翼需要周围空气，没有空气就没有旋翼空气动力。火箭携带推进剂并把它高速向后喷出，因此能在真空中工作。两者都用动量变化产生反作用，但“被加速的物质”来源不同。</p></div></details>
      <div class="rotor-finish-actions"><a class="secondary" href="forces.html">相关课：两个力一样大，就会互相抵消吗？</a><a class="secondary" href="courses.html?group=explore">返回太空学校</a><button class="text-button" id="rotor-restart">重新探索一轮（保留旧记录）</button></div></section>${log.html()}`;
    setupTilt();$('#rotor-restart').onclick=()=>{log=LearningFeedback.create(L.title,L.tasks,true);state=Object.assign({},defaults,{q1Answers:{},q2Answers:{}});log.save();render();};host.querySelector('h2').focus({preventScroll:true});
  }
  function render(){stopAnimation();progress();if(log.index>=L.tasks.length){finish();progress();return;}if(log.index===0)renderSource();else if(log.index===1)renderBalance();else renderTransfer();progress();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAnimation();flushSave();}});window.addEventListener('pagehide',()=>{stopAnimation();flushSave();});
  render();
})();
