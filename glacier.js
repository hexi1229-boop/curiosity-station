'use strict';
(function(){
  const host=document.querySelector('#ice-task'),L=GlacierLesson;
  if(!LearningFeedback.flexibleTasks){
    host.innerHTML='<section class="ice-card"><h2>调查档案正在准备</h2><p>正在更新课程组件。请保持联网，更新完成后会自动打开；已有记录会保留。</p><button class="primary" id="ice-refresh">重新打开</button></section>';
    document.querySelector('#ice-refresh').onclick=()=>location.reload();navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});return;
  }
  if(!LearningFeedback.courses.some(c=>c[0]==='glacier'))LearningFeedback.courses.unshift(['glacier',L.title,'glacier.html']);
  let log=LearningFeedback.create(L.title,L.tasks),frame=0,playing=false;
  let state=Object.assign({progress:0,observed:false},log.checkpoint.glacier||{});
  if(!Number.isFinite(state.progress)||state.progress<0||state.progress>100)state.progress=0;
  const $=selector=>host.querySelector(selector),esc=LearningFeedback.esc;
  function save(){log.point({glacier:state});}
  function stop(){cancelAnimationFrame(frame);playing=false;}
  function message(text){$('#ice-message').textContent=text;}
  function choices(values){return `<div class="ice-choices">${values.map((x,i)=>`<button data-choice="${i}" aria-pressed="false">${x}</button>`).join('')}</div>`;}
  function reason(label){return `<div class="ice-reason"><label for="ice-reason">${label}</label><textarea id="ice-reason" rows="2" maxlength="600" placeholder="一两句话即可，也可用键盘上的语音输入。"></textarea><label class="ice-unsure"><input id="ice-unsure" type="checkbox">我暂时说不清，先如实记下来</label></div>`;}
  function picked(){return [...host.querySelectorAll('[data-evidence]:checked')].map(el=>el.dataset.evidence);}
  function input(){const button=host.querySelector('[data-choice][aria-pressed=true]');return {choice:button?Number(button.dataset.choice):null,evidence:picked(),reason:$('#ice-reason').value.trim(),unsure:$('#ice-unsure').checked,observed:state.observed};}
  function answer(i,data){
    if(i===0)return L.initial[data.choice];
    const cards=i===1?L.north:L.south,evidence=data.evidence.map(id=>{const c=cards.find(c=>c.id===id);return `${c.tag}：${c.title}`;}).join('；')||'暂未选出依据';
    return i===1?`调查依据：${evidence}`:`${L.verdicts[data.choice]}。依据：${evidence}`;
  }
  function submit(i,data){log.submit(i,answer(i,data),null,data.reason||(data.unsure?'暂时说不清':''));}
  function progress(){document.querySelectorAll('.ice-nav li').forEach((el,i)=>{el.classList.toggle('active',i===log.index);el.classList.toggle('done',log.records[i].done);if(i===log.index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
  function focus(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.ice-nav').scrollIntoView({block:'start'});}
  function render(move=false){
    stop();progress();const i=log.index;
    if(i===L.tasks.length){finish();if(move)focus();return;}
    if(i===0)host.innerHTML=`<section class="ice-card"><p class="ice-label">01 / 北谷 · 第一眼</p><h2 tabindex="-1">现在没有冰，过去呢？</h2><p class="ice-lead">调查队只传来一幅山谷图：谷底较宽，两侧较陡。其他资料还没送到。</p>${valley()}<p><b>仅凭这幅图，你能确定这里曾有冰川吗？</b></p>${choices(L.initial)}${reason('我这样判断，是因为……')}<p id="ice-message" class="ice-error" role="status"></p><button class="primary" id="submit-ice">留下判断，去查证 →</button></section>`;
    if(i===1)host.innerHTML=`<section class="ice-card"><p class="ice-label">02 / 机制台与现场资料</p><h2 tabindex="-1">让冰走过一次，看看它留下什么。</h2><div class="ice-example"><b>先补一个小知识：</b><p>多年里，夏天仍未融尽的雪不断积累，逐渐压实、变成冰。足够厚的冰在重力作用下会缓慢流动；冰川并不是冻在原地的一大块冰。</p></div><p class="ice-lead">两组冰沿同样的路线移动，只改变是否夹带碎石。这次只研究<b>碎石造成擦痕</b>的机制。</p><h3>运行前，先预测一次</h3><div class="ice-choices" id="ice-predictions">${L.predictions.map((p,j)=>`<button data-predict="${j}" aria-pressed="false">${p}</button>`).join('')}</div><p id="prediction-status" class="ice-hintline"></p>${bench()}<div class="ice-actions"><button class="primary" id="run-ice">运行对照</button><button class="secondary" id="pause-ice">暂停观察</button></div><div class="ice-clock"><label for="ice-time">拖动进程：<output id="ice-time-output"></output></label><input id="ice-time" type="range" min="0" max="100" step="1" value="0" aria-label="冰川机制演示进程"></div><p id="ice-observation" class="ice-note" role="status"></p><p class="ice-hintline">模型只显示一个机制。未画出其他侵蚀方式；没有碎石的一组“不画擦痕”，不代表纯冰在所有条件下都没有侵蚀作用。</p><h3>回到北谷：你会用哪些资料作依据？</h3><p class="ice-lead">选择最有用的 1–2 条，并把观察与形成过程连起来。</p>${evidence(L.north)}<p id="ice-selection" class="ice-selection" role="status"></p><details class="ice-help" data-help="北谷证据比较提示"><summary>我需要一点调查提示</summary><p>先看材料是在描述“今天”，还是可能保留了过去过程的痕迹。再问：什么机制能同时解释不同线索？外观相像还不够，来源也要查。</p></details>${reason('我选这些资料，因为它们可能是这样形成的……')}<p id="ice-message" class="ice-error" role="status"></p><button class="primary" id="submit-ice">提交依据与解释</button><div id="ice-review"></div></section>`;
    if(i===2)host.innerHTML=`<section class="ice-card"><p class="ice-label">03 / 南坡 · 一份新档案</p><h2 tabindex="-1">这次，你来写调查结论。</h2><p class="ice-lead">新地点改用简图与档案。先独立判断；需要时再打开提示。</p>${southMap()}<div class="ice-dossier">${evidenceCards(L.south)}</div><p id="ice-selection" class="ice-selection" role="status"></p><p><b>选出最影响你判断的 1–2 条资料，再决定报告怎么写。</b></p>${choices(L.verdicts)}${reason('我的结论依据是……；要进一步确认，我还想查……')}<details class="ice-help" data-help="南坡独立调查提示"><summary>我需要一点提示</summary><p>先查同一处痕迹的来源是否有记录。能解释眼前的痕迹，和能否排除更早的事情，是两个不同的问题。</p></details><p id="ice-message" class="ice-error" role="status"></p><button class="primary" id="submit-ice">提交独立调查报告</button><div id="ice-review"></div></section>`;
    LearningFeedback.watchHelp(host,log,i);
    host.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>host.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button))));
    host.querySelectorAll('[data-evidence]').forEach(box=>box.onchange=()=>{
      if(picked().length>2){box.checked=false;log.draft(i,{[box.id]:false});message('最多选两条最关键的资料，避免把所有线索都当成证据。');}
      else message('');selection();
    });
    if(i>0)selection();
    if(i===1){log.help(1,'随课短示例：积雪成冰与冰川流动');setupBench();}
    $('#submit-ice').onclick=()=>{
      const data=input(),error=L.validate(i,data);if(error){message(error);return;}
      message('');submit(i,data);
      if(i===0){log.finish(0);render(true);}else review(i,true);
    };
    if(i>0&&log.records[i].first)review(i,false);
    if(move)focus();
  }
  function selection(){const names=picked().map(id=>(log.index===1?L.north:L.south).find(c=>c.id===id).tag);$('#ice-selection').textContent=`已选 ${names.length} / 2：${names.join('、')||'还没有选择'}`;}
  function review(i,recordHelp){
    const text=i===1?`<p><b>把“看到的”接到“怎样形成”。</b>流动的冰夹带碎石，碎石可像砂纸一样在基岩上留下擦痕；被冰搬运的岩块，也可能在冰融化后留在不同岩性的地方。</p><p>北谷的 A 与 B 分别提供岩面痕迹和岩石来源线索，结合谷地形态，可以支持“过去可能有冰川活动”的解释。缺少施工记录并不自动证明冰川，需要结合更多地质背景。</p><p>C 只告诉我们今天冷。只看一条划痕、一块圆石或一幅 U 形谷图，都不够直接下定论；这里也没有足够资料判断具体年代或古代温度。</p>`:`<p><b>先查痕迹的来路。</b>档案 02 说明这几条沟槽由机械留下，档案 03 说明这批岩块由人运来。它们虽然像刚才的线索，却不能用来支持“冰川造成了这些痕迹”。</p><p>因此，这份材料<b>不足以确认过去有冰川，也不能证明从来没有</b>。今天的低温不提供古代气候证据。</p><p>可以继续调查未被施工影响的基岩、多处天然遗留物与岩石来源。若要判断年代，还需要对应的年代证据。合理的不同表达都可以，关键是结论不超过材料。</p>`;
    $('#ice-review').innerHTML=`<section class="ice-review"><h3>对照思路，保留自己的判断过程</h3>${text}<p>想改变选择或理由，可以直接修改上面的答案。这里是自检，不自动判定解释是否充分。</p><div class="ice-actions"><button class="secondary" data-self="能连接证据与解释（自评）">我能说明依据</button><button class="secondary" data-self="还需要帮助">还需要帮助</button></div></section>`;
    if(recordHelp)log.help(i,'参考思路（提交后）');
    $('#submit-ice').textContent='保存修改后的调查意见';
    host.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{
      const data=input(),error=L.validate(i,data);if(error){message(error);return;}
      const previous=log.records[i].attempts.at(-1),explanation=data.reason||(data.unsure?'暂时说不清':'');
      if(previous.answer!==answer(i,data)||previous.explanation!==explanation)submit(i,data);
      log.finish(i,button.dataset.self);render(true);
    });
    if(recordHelp)$('#ice-review').scrollIntoView({block:'start'});
  }
  function valley(){return `<figure class="ice-art"><svg viewBox="0 0 760 270" role="img" aria-label="原创山谷示意图：谷底宽，两侧陡，河水流过谷底，现在看不到冰"><defs><linearGradient id="valley-sky" x2="0" y2="1"><stop stop-color="#bacfd1"/><stop offset="1" stop-color="#e3e8da"/></linearGradient></defs><rect width="760" height="270" fill="url(#valley-sky)"/><path d="M0 200L105 40L185 116L265 20L340 130L430 47L550 180L638 44L760 130V270H0Z" fill="#91a6a0"/><path d="M0 100L130 170L205 220Q275 249 380 240Q480 249 550 210L655 110L760 50V270H0Z" fill="#aebaa0"/><path d="M0 45L95 86L166 180Q185 238 280 240L220 270H0Z" fill="#6f8980"/><path d="M760 50L648 91L585 170Q564 231 470 241L545 270H760Z" fill="#728d82"/><path d="M380 178Q355 198 388 215Q430 235 380 250L345 270H404Q460 239 412 221Q370 204 393 182Z" fill="#719fa3"/><path d="M30 198L106 223M620 197L709 165M52 96L111 129M637 133L708 102" stroke="#b6c4b3" stroke-width="2" opacity=".55"/><text x="28" y="36" fill="#244e56" font-size="19">北谷 / 现在</text><text x="516" y="254" fill="#2f5557" font-size="18">没有年代测定资料</text></svg><figcaption>原创景观示意，不是真实地点照片。只看到谷地形状，还没看到岩石和岩面调查资料。</figcaption></figure>`;}
  function bench(){return `<div class="ice-bench"><div class="bench-top"><span>同一路线 · 同一进程</span><span>仅改变：是否夹带碎石</span></div><div class="bench-grid">${[false,true].map(grit=>`<section class="bench-group"><h3>${grit?'B 组 · <b>夹带碎石</b>':'A 组 · 不夹带碎石'}</h3><svg viewBox="0 0 500 320" role="img" aria-labelledby="bench-title-${grit}"><title id="bench-title-${grit}">冰川机制对照</title><path d="M30 30H90L79 23M90 30L79 37" stroke="#c3dbdb" fill="none" stroke-width="2"/><text x="108" y="37" fill="#c7dedc" font-size="19">沿谷地移动 →</text><path d="M15 224H485V250H15Z" fill="#b8bba7"/><text x="21" y="248" fill="#213c40" font-size="18">基岩</text><g id="ice-body-${grit}"><path d="M0 0Q35 -15 75 -9L145 8L160 130H0Z" fill="${grit?'#90c4cf':'#aacfd3'}" opacity=".85"/><path d="M30 2L39 45M95 3L108 65M13 85L50 105" stroke="#dfefec" fill="none" stroke-width="2"/><text x="57" y="71" fill="#204c59" font-size="22">冰</text></g><g id="ice-grit-${grit}" fill="#d79d7d" stroke="#734f41" stroke-width="1.5"><path d="M-7 -9L2 -13L9 -3L3 0H-6Z"/><path d="M20 -5L26 -12L34 -2L25 0Z"/></g><text id="ice-deposit-${grit}" x="290" y="198" fill="#f1c39e" font-size="20"></text><rect x="15" y="267" width="470" height="42" rx="5" fill="#d4d8c5"/><text x="23" y="292" fill="#536663" font-size="17">岩面放大</text><path id="ice-scratch-${grit}" stroke="#73594c" stroke-width="3" fill="none"/><text id="ice-bench-note-${grit}" x="165" y="290" fill="#536663" font-size="18"></text></svg></section>`).join('')}</div><p class="bench-caption">先移动，再示意冰就地融化。画面压缩了过程；进程不是地质年数，冰川并非倒着流走。</p></div>`;}
  function draw(){
    for(const grit of [false,true]){
      const p=L.model(state.progress,grit),body=$(`#ice-body-${grit}`),rock=$(`#ice-grit-${grit}`);
      body.setAttribute('transform',`translate(${p.iceX},94)`);body.setAttribute('opacity',p.iceOpacity);
      rock.setAttribute('transform',`translate(${p.rockX},224)`);rock.style.display=p.rockVisible?'':'none';
      $(`#ice-scratch-${grit}`).setAttribute('d',p.scratchLength?`M155 279h${p.scratchLength}M155 286h${p.scratchLength}M155 294h${p.scratchLength}`:'');
      $(`#ice-deposit-${grit}`).textContent=p.deposited?'岩块留在这里':'';
      $(`#ice-bench-note-${grit}`).textContent=state.progress===100&&!grit?'本模型未画出碎石擦痕':'';
      $(`#bench-title-${grit}`).textContent=`${grit?'夹带':'未夹带'}碎石；${state.progress<70?'冰正在移动':state.progress<100?'冰就地融化':'冰已消失'}；${p.scratchLength?'留下碎石磨出的擦痕':'尚无碎石磨出的擦痕'}。`;
    }
    $('#ice-time').value=state.progress;
    $('#ice-time-output').textContent=`${Math.round(state.progress)}% · ${state.progress<70?'冰流动':state.progress<100?'融化示意':'查看遗留痕迹'}`;
    $('#ice-observation').textContent=state.progress===100?'对照完成：B 组留下碎石磨出的擦痕与被搬运的岩块。冰消失了，这些痕迹仍可留下。':state.progress>0?'观察两组的共同点与不同点。暂停或拖动，可以检查同一进程。':state.observed?'你已完成过对照。可以再次运行，或继续查阅北谷资料。':'先选一个预测，再运行或拖动进程。';
  }
  function recordPrediction(){
    const prediction=log.records[1].draft.$prediction;
    if(!Number.isInteger(prediction)||!L.predictions[prediction])return false;
    if(state.predictionFirst===undefined){state.predictionFirst=prediction;log.note(1,`首次试验前预测：${L.predictions[prediction]}。${log.records[1].helps.length?'此前已见随课示例或帮助，详见帮助记录。':'此前未打开帮助。'}`);save();}
    return true;
  }
  function observe(){
    if(!state.observed){state.observed=true;log.note(1,'已完成同进程对照：不夹带碎石 / 夹带碎石。模型末端：B组有碎石擦痕和遗留岩块；A组未显示该机制。');}
    save();
  }
  function setupBench(){
    const chosen=log.records[1].draft.$prediction;
    host.querySelectorAll('[data-predict]').forEach(button=>{
      button.setAttribute('aria-pressed',String(Number(button.dataset.predict)===chosen));
      button.onclick=()=>{
        log.draft(1,{$prediction:Number(button.dataset.predict)});
        host.querySelectorAll('[data-predict]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        $('#ice-time').disabled=false;$('#prediction-status').textContent=state.predictionFirst===undefined?'预测已保存。现在运行对照。':'首次预测已保留；这里可以调整当前想法。';
      };
    });
    $('#ice-time').disabled=!Number.isInteger(chosen);
    $('#prediction-status').textContent=state.predictionFirst===undefined?'先猜一次，不需要猜对才能继续。':`首次预测已保留：${L.predictions[state.predictionFirst]}`;
    $('#run-ice').onclick=()=>{
      if(!recordPrediction()){message('先选一个预测，再开始对照。');return;}
      message('');stop();state.progress=0;save();host.querySelector('.ice-bench').scrollIntoView({block:'start'});
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){state.progress=100;draw();observe();return;}
      playing=true;const start=performance.now();
      function tick(now){if(!playing)return;state.progress=Math.min(100,(now-start)/65);draw();if(state.progress===100){stop();observe();}else frame=requestAnimationFrame(tick);}
      frame=requestAnimationFrame(tick);
    };
    $('#pause-ice').onclick=()=>{stop();save();$('#ice-observation').textContent='已暂停并保存当前位置。可拖动继续观察。';};
    $('#ice-time').oninput=()=>{stop();if(!recordPrediction())return;state.progress=Number($('#ice-time').value);draw();if(state.progress===100)observe();else save();};
    draw();
  }
  function miniFigure(kind){
    const art=kind==='scratches'?'<path d="M23 65L210 30M27 76L221 40M41 88L232 50" stroke="#7f7867" stroke-width="4"/><path d="M10 10L245 8L238 95L16 92Z" fill="none" stroke="#b8bbad"/>':kind==='rocks'?'<path d="M18 80H240V93H18Z" fill="#939d92"/><path d="M80 78L88 43L118 34L145 54L150 78Z" fill="#c59583" stroke="#946b5d"/><path d="M184 75L190 54L208 50L220 78Z" fill="#c59583"/>':'<circle cx="70" cy="38" r="20" fill="#dfd4a8"/><path d="M150 20V70M137 27L164 60M164 27L137 60M137 20L164 70M164 20L137 70" stroke="#87a6a9" stroke-width="3"/>';
    return `<svg viewBox="0 0 255 100" aria-hidden="true">${art}</svg>`;
  }
  function evidenceCards(cards){return cards.map(c=>`<article class="ice-clue"><span class="tag">${c.tag}</span>${c.figure?miniFigure(c.figure):''}<h4>${c.title}</h4><p>${c.text}</p><label><input type="checkbox" id="ice-evidence-${c.id}" data-evidence="${c.id}">选作我的依据</label></article>`).join('');}
  function evidence(cards){return `<div class="ice-evidence-grid">${evidenceCards(cards)}</div>`;}
  function southMap(){return `<figure class="ice-art"><svg viewBox="0 0 760 270" role="img" aria-label="南坡教学简图：道路旁有沟槽观察点及粉色岩块堆放处，背景是谷地"><rect width="760" height="270" fill="#e3e6d7"/><path d="M0 44Q200 140 300 15M0 90Q185 170 340 50M455 10Q560 130 760 75M495 40Q575 165 760 115M0 210Q120 255 205 270M600 270Q720 190 760 195" fill="none" stroke="#c2cabb" stroke-width="3"/><path d="M330 0Q270 70 380 150T340 270" stroke="#9bb7b5" stroke-width="13" fill="none"/><path d="M0 174Q160 132 300 181T760 172" stroke="#b7afa0" stroke-width="27" fill="none"/><path d="M0 174Q160 132 300 181T760 172" stroke="#fff9e8" stroke-width="2" fill="none" stroke-dasharray="12 10"/><circle cx="460" cy="176" r="22" fill="#f2dcba" stroke="#9b704e" stroke-width="2"/><text x="452" y="184" font-size="23" fill="#6b553d">1</text><path d="M533 170L542 144L567 137L586 169Z" fill="#c69583"/><text x="514" y="119" fill="#6b553d" font-size="22">2 岩块堆放处</text><path d="M452 200L426 222" stroke="#6b553d"/><text x="290" y="249" fill="#6b553d" font-size="22">1 沟槽观察点</text><text x="25" y="35" font-size="22" fill="#3b666a">南坡 / 道路旁</text></svg><figcaption>原创教学简图，不按实际比例。编号对应下方档案中的同一处沟槽和同一批岩块。</figcaption></figure>`;}
  function finish(){
    host.innerHTML=`<section class="ice-card"><p class="ice-label">档案归档 / 你留下的调查过程</p><h2 tabindex="-1">让证据支持结论，也给未知留位置。</h2><p class="ice-takeaway">看见痕迹 → 追问成因 → 查来源与其他线索 → 决定能说到哪一步。</p><p>三个调查环节已完成。首次判断、试验前预测、帮助、依据与修改原话都在下方；完成不等于已经长期掌握，开放解释未自动判分。</p><details class="ice-help"><summary>下次调查时，先不看答案，回想一下</summary><p>相似的外观一定来自同一过程吗？哪些是观察，哪些是推断？以后研究冰芯和古气候时，再用这几个问题审查材料。</p></details><div class="ice-actions"><a class="secondary" href="records.html">查看学习记录 →</a><button class="secondary" id="ice-restart">重新调查一次</button><a class="secondary" href="./">回到小站</a></div></section>${log.html()}`;
    $('#ice-restart').onclick=()=>{log=LearningFeedback.create(L.title,L.tasks,true);state={progress:0,observed:false};save();render(true);};
  }
  document.querySelector('.ice-sources').addEventListener('toggle',event=>{if(event.target.open)log.help(Math.min(log.index,2),'模型边界与知识来源');});
  // A backgrounded page may stop animation frames; preserve its observed position.
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){stop();save();}});
  render();
})();
