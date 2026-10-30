'use strict';
(function(){
  const host=document.querySelector('#erlitou-task');
  const L=window.ErlitouLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请联网刷新后重新打开。</p><button class="primary" id="erlitou-refresh">重新打开</button></section>';
    document.querySelector('#erlitou-refresh').onclick=()=>location.reload();
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'erlitou.html']);

  const esc=F.esc;
  const optionText=(items,id)=>items.find(item=>item.id===id)?.text||id||'';
  const validId=(value,items)=>items.some(item=>item.id===value)?value:null;
  const hotspotIds=new Set(L.hotspots.map(item=>item.id));
  const claimIds=new Set(L.labelClaims.map(item=>item.id));
  const ratingIds=new Set(L.ratingOptions.map(item=>item.id));
  const defaults={
    initialCity:null,initialIdentity:null,initialReason:'',initialUnsure:false,
    visited:[],selectedHotspot:null,hotspotAttempts:{},hotspotRevealed:[],scanChoice:null,scanReason:'',scanUnsure:false,scanAttempted:false,
    ratings:{},museumChoice:null,labelReason:'',labelUnsure:false,labelAttempted:false,
    upgradeVisited:[],upgradeSelected:null,upgradeChoice:null,upgradeExplained:false,finalConclusion:'',finalUnsure:false,finalAttempted:false
  };
  let log=F.create(L.title,L.tasks);
  function safeText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function safeRatings(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    return Object.fromEntries(Object.entries(value).filter(([key,val])=>claimIds.has(key)&&ratingIds.has(val)));
  }
  function safeHotspotAttempts(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    const result={};
    for(const spot of L.hotspots){
      const valid=new Set((spot.judgments||[]).map(item=>item.id));
      if(Array.isArray(value[spot.id]))result[spot.id]=value[spot.id].filter(id=>valid.has(id)).slice(0,20);
    }
    return result;
  }
  function loadState(){
    const saved=log.checkpoint.erlitou||{};
    return {
      ...defaults,...saved,
      initialCity:validId(saved.initialCity,L.cityOptions),initialIdentity:validId(saved.initialIdentity,L.identityOptions),initialReason:safeText(saved.initialReason),initialUnsure:!!saved.initialUnsure,
      visited:Array.isArray(saved.visited)?[...new Set(saved.visited.filter(id=>hotspotIds.has(id)))]:[],selectedHotspot:hotspotIds.has(saved.selectedHotspot)?saved.selectedHotspot:null,
      hotspotAttempts:safeHotspotAttempts(saved.hotspotAttempts),hotspotRevealed:Array.isArray(saved.hotspotRevealed)?[...new Set(saved.hotspotRevealed.filter(id=>hotspotIds.has(id)&&id!=='roads'))]:[],
      scanChoice:validId(saved.scanChoice,L.scanOptions),scanReason:safeText(saved.scanReason),scanUnsure:!!saved.scanUnsure,scanAttempted:!!saved.scanAttempted,
      ratings:safeRatings(saved.ratings),museumChoice:validId(saved.museumChoice,L.museumOptions),labelReason:safeText(saved.labelReason),labelUnsure:!!saved.labelUnsure,labelAttempted:!!saved.labelAttempted,
      upgradeVisited:Array.isArray(saved.upgradeVisited)?[...new Set(saved.upgradeVisited.filter(id=>L.upgrades.some(item=>item.id===id)))]:[],upgradeSelected:validId(saved.upgradeSelected,L.upgrades),upgradeChoice:validId(saved.upgradeChoice,L.upgrades),upgradeExplained:!!saved.upgradeExplained,finalConclusion:safeText(saved.finalConclusion,60),finalUnsure:!!saved.finalUnsure,finalAttempted:!!saved.finalAttempted
    };
  }
  let state=loadState();
  function save(){log.point({erlitou:state});}
  function reasonValue(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function progress(){
    document.querySelectorAll('.erlitou-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.erlitou-nav')?.scrollIntoView({block:'start'});}
  function message(value){const box=host.querySelector('#erlitou-message');if(box){box.textContent=value;box.focus({preventScroll:true});}}
  function card(label,title,body,button=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="erlitou-message" role="status" tabindex="-1"></p>'+button+'</section>';
  }
  function choices(items,selected,label,attr='data-choice'){
    return '<div class="parallel-choices" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" '+attr+'="'+esc(item.id)+'" aria-pressed="'+String(item.id===selected)+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function reason(prefix,label,value,unsure,placeholder,max=900){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" maxlength="'+max+'" rows="3" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindChoices(key,selector='[data-choice]',attemptedKey=null){
    host.querySelectorAll(selector).forEach(button=>button.onclick=()=>{
      state[key]=button.dataset.choice||button.dataset.city||button.dataset.identity||button.dataset.scan||button.dataset.museum||button.dataset.upgradeChoice;
      if(attemptedKey)state[attemptedKey]=false;
      host.querySelectorAll(selector).forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      host.querySelector('.scan-result,.label-result,.upgrade-result')?.remove();
      const status=host.querySelector('#erlitou-message');if(status)status.textContent='';
      save();
    });
  }
  function bindReason(prefix,key,unsureKey,max=900){
    const input=host.querySelector('#'+prefix+'-reason');
    const unsure=host.querySelector('#'+prefix+'-unsure');
    input?.addEventListener('input',()=>{state[key]=input.value.slice(0,max);if(input.value.trim()){state[unsureKey]=false;unsure.checked=false;}save();});
    unsure?.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function bindHelp(index){host.querySelectorAll('details[data-help]').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)log.help(index,item.dataset.help);}));}

  function openingMap(){
    return '<div class="erlitou-map" role="img" aria-label="二里头遗址教学复原鸟瞰示意"><svg viewBox="0 0 820 300"><defs><linearGradient id="er-earth" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9b47e"/><stop offset="1" stop-color="#947552"/></linearGradient></defs><path fill="url(#er-earth)" d="M0 0h820v300H0z"/><path d="M0 70h820M0 225h820M185 0v300M590 0v300" stroke="#e0cf9a" stroke-width="24" opacity=".82"/><rect x="260" y="70" width="245" height="155" rx="5" fill="#755c45" stroke="#ead4a2" stroke-width="8"/><g fill="#b08a58"><rect x="293" y="102" width="75" height="45"/><rect x="397" y="91" width="75" height="62"/><rect x="323" y="171" width="122" height="37"/></g><path d="M73 247Q175 185 255 266" fill="none" stroke="#647d75" stroke-width="13"/></svg><span>教学复原示意 · 不是照片或真实平面图</span></div>';
  }
  function renderInitial(){
    const body='<p class="parallel-lead">你站在今天的伊洛河考古营地。复原视窗依据地下遗迹，把道路、宫室和作坊重新“立”起来，带你看约距今3700年的城市——这是教学想象，不是当时实景。城门口没有一块“夏都”国名牌，请先用两把尺分别判断。</p>'+openingMap()+'<div class="double-ruler"><section><p>第一把尺 · 城市性质</p><h3>它是什么规模的聚落？</h3>'+choices(L.cityOptions,state.initialCity,'城市性质','data-city')+'</section><section><p>第二把尺 · 王朝身份</p><h3>它是不是夏都？</h3>'+choices(L.identityOptions,state.initialIdentity,'王朝身份','data-identity')+'</section></div>'+reason('initial','先说说你为什么把两把尺放在这些位置。',state.initialReason,state.initialUnsure,'可以猜，但要分清：你是根据城市规模，还是根据王朝名称？');
    host.innerHTML=card('第一现场 · 伊洛河考古营地','同一座城，为什么要量两次？',body,'<button class="primary" id="initial-submit">封存两项首答，领取扫描仪 →</button>');
    bindChoices('initialCity','[data-city]');bindChoices('initialIdentity','[data-identity]');bindReason('initial','initialReason','initialUnsure');
    host.querySelector('#initial-submit').onclick=()=>{
      const why=reasonValue(state.initialReason,state.initialUnsure);
      if(!state.initialCity||!state.initialIdentity){message('请在两把尺上各留一个判断。它们可以不同。');return;}
      if(!why){message('再留一句理由；暂时说不清也可以勾选。');return;}
      const answer='城市性质：'+optionText(L.cityOptions,state.initialCity)+'；王朝身份：'+optionText(L.identityOptions,state.initialIdentity);
      log.submit(0,answer,null,why);
      log.note(0,'两项判断均在查看二里头现场材料前封存，本环节不立即判分。');
      log.finish(0,'已封存双尺度首答');render();focusCard();
    };
  }

  function siteSvg(){
    return '<svg viewBox="0 0 820 390" role="img" aria-label="二里头遗址教学复原扫描图"><path fill="#b89d70" d="M0 0h820v390H0z"/><path d="M0 92h820M0 280h820M210 0v390M635 0v390" stroke="#e2ce99" stroke-width="28"/><g fill="#735946" stroke="#ead39b" stroke-width="7"><rect x="285" y="75" width="256" height="188" rx="6"/><rect x="316" y="103" width="78" height="54"/><rect x="423" y="96" width="84" height="72"/><rect x="349" y="190" width="128" height="43"/></g><g fill="#8b6648"><rect x="655" y="220" width="92" height="61"/><rect x="653" y="82" width="100" height="66"/></g><path d="M86 302q79-91 151 0" fill="none" stroke="#5e776e" stroke-width="15"/><g fill="#806044"><rect x="302" y="303" width="33" height="51" rx="15"/><rect x="353" y="309" width="31" height="46" rx="14"/></g></svg>';
  }
  function hotspotNote(selected){
    if(!selected)return '<div class="scan-note empty"><h3>扫描仪等待落点</h3><p>先看道路这个完整示例，再到另外四个节点自己判断“能支持什么、不能证明什么”。</p></div>';
    const attempts=state.hotspotAttempts[selected.id]||[];
    const latest=selected.judgments?.find(item=>item.id===attempts[attempts.length-1]);
    const revealed=selected.example||state.hotspotRevealed.includes(selected.id);
    const example=selected.example?'<p class="example-badge">完整示例 · 先看三层怎样分开</p>':'';
    const found='<section><b>直接发现</b><p>'+esc(selected.found)+'</p></section>';
    if(!revealed){
      return '<div class="scan-note guided"><h3>'+esc(selected.title)+'</h3>'+example+'<div class="single-finding">'+found+'</div><fieldset class="hotspot-judgment"><legend>先判断：这条发现能支持什么，又不能证明什么？</legend>'+selected.judgments.map(item=>'<button type="button" data-spot="'+selected.id+'" data-spot-judgment="'+item.id+'" aria-pressed="false">'+esc(item.text)+'</button>').join('')+'</fieldset></div>';
    }
    const verdict=selected.example?'':latest?'<p class="judgment-result '+(latest.correct?'':'bad')+'"><b>'+(latest.correct?'边界守住了。':'这次判断走得比证据更远。')+'</b> '+(latest.correct?'下面揭示的两层与你的判断一致。':'对照下面两层后，可以重新选择。')+'</p>':'';
    const revise=selected.example?'':'<fieldset class="hotspot-judgment compact"><legend>你的判断'+(attempts.length>1?'（已修订 '+(attempts.length-1)+' 次）':'')+'</legend>'+selected.judgments.map(item=>'<button type="button" data-spot="'+selected.id+'" data-spot-judgment="'+item.id+'" aria-pressed="'+String(item.id===latest?.id)+'">'+esc(item.text)+'</button>').join('')+'</fieldset>';
    return '<div class="scan-note"><h3>'+esc(selected.title)+'</h3>'+example+'<div>'+found+'<section><b>能够支持</b><p>'+esc(selected.supports)+'</p></section><section><b>不能证明</b><p>'+esc(selected.cannot)+'</p></section></div>'+verdict+revise+'</div>';
  }
  function renderScan(){
    const roadsDone=state.visited.includes('roads');
    const selected=L.hotspots.find(item=>item.id===state.selectedHotspot&&(item.example||roadsDone));
    const completed=(state.visited.includes('roads')?1:0)+state.hotspotRevealed.length;
    const correct=state.scanAttempted?L.gradeScan(state.scanChoice):null;
    const wrongScanFeedback={
      'named-xia':['“中心性大型都邑”不等于“已确认的夏都斟鄩”。','宫城和绿松石龙支持权力、等级与仪式活动；它们没有写出“夏”、斟鄩或夏王名。'],
      'large-village':['没有可读国名，不会把城市缩回村落。','道路规划、宫城、专业作坊和等级墓葬都能独立说明城市规模与组织能力。'],
      factory:['作坊是城市系统的一部分，不是城市的全部。','作坊与道路、宫城、墓葬共同出现，说明生产、权力与等级在同一大型都邑中组织起来。']
    };
    const wrong=wrongScanFeedback[state.scanChoice]||['结论越过了一块缺口。','重新检查“城市有多复杂”和“这座城市叫什么”是不是被混成了一件事。'];
    const result=state.scanAttempted?'<div class="scan-result '+(correct?'':'bad')+'" role="status"><b>'+(correct?'城市轮廓拼起来了。':wrong[0])+'</b><br>'+(correct?'道路、宫城、专业作坊和高等级墓葬彼此配合，有力支持“中心性大型都邑”的解释；这些材料没有直接写出王朝名称。':wrong[1])+'</div>':'';
    const body='<p class="parallel-lead">考古不是寻找一件“镇馆之宝”就结束。先用道路学习一次完整判断；随后只给另外四处的直接发现，由你先划出证据边界，再揭示研究解释。</p><div class="scan-board">'+siteSvg()+L.hotspots.map((spot,index)=>{const done=spot.id==='roads'?state.visited.includes(spot.id):state.hotspotRevealed.includes(spot.id);const locked=!spot.example&&!roadsDone;return '<button type="button" class="scan-hotspot '+(done?'visited':'')+'" style="--x:'+spot.x+';--y:'+spot.y+'" data-hotspot="'+spot.id+'" aria-label="'+(locked?'先看道路示例，再扫描':'扫描')+esc(spot.label)+'" '+(locked?'disabled':'')+'>'+(index+1)+'</button>';}).join('')+'<span>教学复原示意 · 位置与建筑外观不代表真实平面图</span></div>'+hotspotNote(selected)+'<p class="scan-count">已完成 '+completed+' / '+L.hotspots.length+' 个城市节点</p><h3>把扫描碎片拼成一幅城市画像</h3>'+choices(L.scanOptions,state.scanChoice,'二里头城市性质','data-scan')+reason('scan','引用两个不同节点，说明它们怎样共同支持你的判断。',state.scanReason,state.scanUnsure,'例如：道路说明……，作坊说明……；合在一起可以判断……，但还不能……')+'<details class="parallel-help" data-help="从一件宝物退后一步，看城市系统"><summary>卡住时：把镜头拉远</summary><p>一件器物可能偶然出现；道路、宫城、作坊、墓葬在同一城市中彼此配合，更能说明长期的规划、组织与等级。</p></details>'+result;
    host.innerHTML=card('第二现场 · 城市地下扫描','五块碎片，能拼出怎样的城市？',body,'<button class="primary" id="scan-submit">提交城市扫描报告 →</button>');
    host.querySelectorAll('[data-hotspot]').forEach(button=>button.onclick=()=>{const id=button.dataset.hotspot;state.selectedHotspot=id;if(!state.visited.includes(id))state.visited.push(id);save();renderScan();host.querySelector('[data-hotspot="'+id+'"]')?.focus({preventScroll:true});});
    host.querySelectorAll('[data-spot-judgment]').forEach(button=>button.onclick=()=>{const id=button.dataset.spot,choice=button.dataset.spotJudgment;const attempts=state.hotspotAttempts[id]||[];if(attempts[attempts.length-1]!==choice)attempts.push(choice);state.hotspotAttempts[id]=attempts;if(!state.hotspotRevealed.includes(id))state.hotspotRevealed.push(id);save();renderScan();host.querySelector('[data-spot="'+id+'"][data-spot-judgment="'+choice+'"]')?.focus({preventScroll:true});});
    bindChoices('scanChoice','[data-scan]','scanAttempted');bindReason('scan','scanReason','scanUnsure');bindHelp(1);
    host.querySelector('#scan-submit').onclick=()=>{
      const why=reasonValue(state.scanReason,state.scanUnsure);
      if(completed<L.hotspots.length){message('请完成道路示例，并在其余四个节点先判断、再揭示。');return;}
      if(!state.scanChoice){message('请先拼出一幅城市画像。');return;}
      if(!why){message('请引用两个不同节点；暂时说不清也可以勾选。');return;}
      const correct=L.gradeScan(state.scanChoice);
      log.submit(1,optionText(L.scanOptions,state.scanChoice),correct,why);state.scanAttempted=true;save();
      if(!correct){renderScan();message('上方保留了针对这次选择的诊断，请据此修订。');return;}
      const traces=L.hotspots.filter(item=>!item.example).map(item=>{const attempts=state.hotspotAttempts[item.id]||[];const describe=id=>item.judgments.find(j=>j.id===id)?.text||id;return item.label+'：首次“'+describe(attempts[0])+'”'+(attempts.length>1?'；最后修订为“'+describe(attempts[attempts.length-1])+'”':'');});
      log.note(1,'热点判断留痕：'+traces.join('；')+'。');
      log.finish(1,state.scanUnsure?'仍需帮助':'能用城市系统判断都邑性质');render();focusCard();
    };
  }

  function ratingsTable(){
    return '<div class="label-desk">'+L.labelClaims.map((claim,index)=>'<article><div class="label-copy"><small>标签句 '+(index+1)+'</small><p>'+esc(claim.text)+'</p></div><div class="rating-buttons" role="group" aria-label="给标签句'+(index+1)+'分级">'+L.ratingOptions.map(option=>'<button type="button" data-rate-claim="'+claim.id+'" data-rate="'+option.id+'" aria-pressed="'+String(state.ratings[claim.id]===option.id)+'">'+esc(option.text)+'</button>').join('')+'</div></article>').join('')+'</div>';
  }
  function renderLabels(){
    const ratingsComplete=L.labelClaims.every(item=>state.ratings[item.id]);
    const ratingsCorrect=L.gradeRatings(state.ratings);
    const correct=state.labelAttempted&&ratingsCorrect&&L.gradeMuseum(state.museumChoice);
    const initial='城市性质：'+optionText(L.cityOptions,state.initialCity)+'；王朝身份：'+optionText(L.identityOptions,state.initialIdentity);
    let feedback='';
    if(state.labelAttempted){
      const wrongClaims=L.labelClaims.filter(item=>state.ratings[item.id]!==item.correct).map(item=>item.id);
      let title='审稿通过：两把尺仍然分开。';
      let detail='道路、宫城等遗迹是直接发现；中心性大型都邑与夏晚期都城身份属于不同层次的有力解释；具体城名和夏王名仍未锁定。';
      if(!correct&&wrongClaims.length){
        title=wrongClaims.length===1?'还有一句放错了证据刻度。':'有 '+wrongClaims.length+' 句放错了证据刻度。';
        detail=wrongClaims.length>1?'逐句区分：遗迹本身是直接发现；大型都邑是多类遗迹共同支持的解释；夏都身份有力但未完全锁定；斟鄩与夏王名仍缺同一时代文字。':wrongClaims[0]==='facts'?'道路、宫城、作坊和墓葬差异都由考古发掘直接发现，可以放在“确定”。':wrongClaims[0]==='city'?'“中心性大型都邑”是多类发现共同支持的解释，不是某一处遗迹自己说出的身份。':wrongClaims[0]==='zhenxun'?'具体城名和夏王名还没有被同一时代、能读懂的文字锁定。':'“许多研究者认为很可能”比“已经完全确认”更符合现有证据。';
      }else if(!correct&&state.museumChoice==='absolute'){
        title='展签把“有力支持”写成了“完全确认”。';
        detail='年代、位置和城市规模让夏都解释很有力量，但还不能替代与城市同一时代、能直接读出国名、城名或王名的文字。';
      }else if(!correct&&state.museumChoice==='empty'){
        title='没有国名，不会抹掉已经发现的城市。';
        detail='道路、宫城、作坊和墓葬是直接发现，它们共同有力支持大型都邑解释；缺口只限制王朝、城名和王名判断。';
      }
      feedback='<div class="label-result '+(correct?'':'bad')+'" role="status"><b>'+title+'</b><br>'+detail+'</div>';
    }
    const body='<p class="parallel-lead">发掘材料已经送到博物馆。你的任务不是把标签写得最响亮，而是让每句话站在它真正拥有的证据上。</p><div class="initial-seal"><b>你的首答</b><p>'+esc(initial)+'</p></div><div class="evidence-scale" aria-label="三档证据刻度"><span>确定<br><small>直接发现或可直接核对</small></span><span>有力支持<br><small>多类发现共同支持的解释</small></span><span>尚未锁定<br><small>还缺能直接认出身份的材料</small></span></div>'+ratingsTable()+'<h3>请留下最终展签</h3>'+choices(L.museumOptions,state.museumChoice,'博物馆最终展签','data-museum')+reason('label','与首答相比，你保留或修改了什么？为什么？',state.labelReason,state.labelUnsure,'可以用：我仍然认为……；我把……从“确定”改成……，因为……')+'<details class="parallel-help" data-help="分清直接发现、城市解释与王朝身份"><summary>卡住时：把四句话分层</summary><p>第一句是直接挖到的遗迹；第二句用多处遗迹解释城市性质；第三句讨论它与夏的关系；第四句精确到城名和王名。越往后，身份判断需要的证据越直接。</p></details>'+feedback;
    host.innerHTML=card('第三现场 · 博物馆闭馆审稿','“确定”与“很可能”，只差三个字吗？',body,'<button class="primary" id="label-submit">交付博物馆展签 →</button>');
    host.querySelectorAll('[data-rate-claim]').forEach(button=>button.onclick=()=>{state.ratings[button.dataset.rateClaim]=button.dataset.rate;state.labelAttempted=false;save();renderLabels();host.querySelector('[data-rate-claim="'+button.dataset.rateClaim+'"][data-rate="'+button.dataset.rate+'"]')?.focus({preventScroll:true});});
    bindChoices('museumChoice','[data-museum]','labelAttempted');bindReason('label','labelReason','labelUnsure');bindHelp(2);
    host.querySelector('#label-submit').onclick=()=>{
      const why=reasonValue(state.labelReason,state.labelUnsure);
      if(!ratingsComplete){message('请给四句标签都放上证据刻度。');return;}
      if(!state.museumChoice){message('请选一份可以公开展示的最终展签。');return;}
      if(!why){message('请说明保留或修改了什么；暂时说不清也可以勾选。');return;}
      const correct=L.gradeRatings(state.ratings)&&L.gradeMuseum(state.museumChoice);
      const answer='分级：'+L.labelClaims.map((item,index)=>'标签'+(index+1)+'='+optionText(L.ratingOptions,state.ratings[item.id])).join('；')+'。展签：'+optionText(L.museumOptions,state.museumChoice);
      log.submit(2,answer,correct,why);state.labelAttempted=true;save();
      if(!correct){renderLabels();message('根据反馈重新放置证据刻度，再修订展签。');return;}
      log.note(2,'已用“确定／有力支持／尚未锁定”修订双尺度首答。');
      log.finish(2,state.labelUnsure?'仍需帮助':'能按证据强度表达历史结论');render();focusCard();
    };
  }

  function benchmark(){
    return '<div class="yinxu-benchmark"><header><span>真实参照</span><h3>殷墟为什么能确认是商代晚期都城？</h3></header><div><section><b>同一时代、现在能读懂的文字</b><p>甲骨文记录商王、祭祀、战争和事务。学术上把“能稳定读懂”叫作“可释读”。</p></section><section><b>知道从哪里挖出来</b><p>文字材料来自考古队记录清楚的土层、坑穴和遗迹，不是来历不明的孤品。</p></section><section><b>整座遗址互相印证</b><p>宫殿宗庙、王陵、作坊和城市遗迹共同指向同一时代与权力中心。</p></section></div><p>结论不是“有一个字就是真的”，而是文字、出土位置与整座遗址彼此咬合。</p></div>';
  }
  function upgradeLab(){
    const selected=L.upgrades.find(item=>item.id===state.upgradeSelected);
    const explanations=state.upgradeExplained?'<div class="upgrade-explanations"><h3>提交后揭示 · 三项材料分别能走多远？</h3>'+L.upgrades.map(item=>'<article><small>'+esc(item.strength)+'</small><b>'+esc(item.title)+'</b><p>'+esc(item.text)+'</p></article>').join('')+'</div>':'';
    return '<p class="fiction-label">以下三项均为教学虚构新证据，不是现实发现</p><div class="upgrade-cards">'+L.upgrades.map((item,index)=>'<button type="button" data-upgrade="'+item.id+'" class="'+(state.upgradeVisited.includes(item.id)?'visited':'')+'" aria-pressed="'+String(item.id===state.upgradeSelected)+'"><span>实验 '+(index+1)+'</span><b>'+esc(item.title)+'</b><small>'+esc(item.tag)+'</small></button>').join('')+'</div><div class="upgrade-readout" aria-live="polite">'+(selected?'<b>'+esc(selected.title)+'</b><p>'+esc(selected.facts)+'</p>':'<b>验证台尚未启动</b><p>依次投入三项材料。选择前只看来源、发掘位置、能否读懂以及单件或多件，不先告诉你强弱。</p>')+'</div>'+explanations;
  }
  function countChars(value){return Array.from(value.trim()).length;}
  function renderUpgrade(){
    const chars=countChars(state.finalConclusion);
    const correct=state.upgradeChoice?L.gradeUpgrade(state.upgradeChoice):false;
    const wrongUpgrade={market:['来历不明的单件材料，推进力很弱。','先要确认它从哪里出土、是不是与城市同一时代；一个像“夏”的字也可能后刻或伪刻。'],single:['发掘位置可靠，让它成为真实线索；但还不能定名。','单个符号目前读不懂，也没有多件材料重复印证，仍不能确认国名或王名。']};
    const wrong=wrongUpgrade[state.upgradeChoice]||['这项材料还没有形成完整互证。','比较文字能否读懂、出土位置是否可靠，以及是否有多件材料与城市系统相合。'];
    const result=state.finalAttempted?state.finalUnsure?'<div class="upgrade-result" role="status"><b>探索过程已保存，尚未形成独立结论。</b><br>你可以先对照刚揭示的强弱解释，再选择收束调查或继续修订。</div>':'<div class="upgrade-result '+(correct?'':'bad')+'" role="status"><b>'+(correct?'证据升级方向成立。':wrong[0])+'</b><br>'+(correct?'决定性提升来自文字能重复读懂、出土位置可靠，并与宫城、墓葬和作坊互相印证。':wrong[1])+'</div>':'';
    const body='<p class="parallel-lead">最后来到证据升级实验室。先用已经确认身份的殷墟作参照，再测试：什么样的新发现，才会真正推进二里头的王朝身份判断？</p>'+benchmark()+upgradeLab()+'<h3>哪一项最可能大幅推进身份判断？</h3>'+choices(L.upgrades.map(item=>({id:item.id,text:item.title})),state.upgradeChoice,'选择最强证据升级','data-upgrade-choice')+'<div class="conclusion-box"><label for="final-conclusion"><b>给下一位参观者留下30—60字结论</b><br><small>同时写出“直接发现什么”“有力支持什么”和“还不能锁定什么”。</small></label><textarea id="final-conclusion" maxlength="60" rows="3" placeholder="遗址直接发现……；这些发现有力支持……；许多研究者认为……，但还缺……">'+esc(state.finalConclusion)+'</textarea><p><output id="conclusion-count">'+chars+'</output> / 60 字</p><label class="parallel-unsure"><input id="final-unsure" type="checkbox" '+(state.finalUnsure?'checked':'')+'>我暂时说不清，先保存探索过程</label></div><details class="parallel-help" data-help="用殷墟的三项互证检查新材料"><summary>卡住时：用殷墟标准逐项检查</summary><p>问三次：文字能不能稳定读懂？出土地点和土层记录清楚吗？它能不能与同一时期的城市、墓葬和作坊互相印证？</p></details>'+result;
    const submitText=state.finalAttempted&&(correct||state.finalUnsure)?'看过解释，收束调查 →':'提交判断，揭示证据强弱 →';
    host.innerHTML=card('第四现场 · 证据升级实验室','找到一个“夏”字，就可以宣布定案吗？',body,'<button class="primary" id="upgrade-submit">'+submitText+'</button>');
    host.querySelectorAll('[data-upgrade]').forEach(button=>button.onclick=()=>{const id=button.dataset.upgrade;state.upgradeSelected=id;if(!state.upgradeVisited.includes(id))state.upgradeVisited.push(id);save();renderUpgrade();host.querySelector('[data-upgrade="'+id+'"]')?.focus({preventScroll:true});});
    bindChoices('upgradeChoice','[data-upgrade-choice]','finalAttempted');
    const input=host.querySelector('#final-conclusion');const unsure=host.querySelector('#final-unsure');const output=host.querySelector('#conclusion-count');
    input.addEventListener('input',()=>{state.finalConclusion=Array.from(input.value).slice(0,60).join('');if(input.value!==state.finalConclusion)input.value=state.finalConclusion;if(input.value.trim()){state.finalUnsure=false;unsure.checked=false;}state.finalAttempted=false;output.textContent=countChars(state.finalConclusion);save();});
    unsure.addEventListener('change',()=>{state.finalUnsure=unsure.checked;state.finalAttempted=false;save();});bindHelp(3);
    host.querySelector('#upgrade-submit').onclick=()=>{
      const chars=countChars(state.finalConclusion);
      const currentCorrect=state.upgradeChoice?L.gradeUpgrade(state.upgradeChoice):false;
      if(state.upgradeVisited.length<L.upgrades.length){message('请把三项虚构材料都投入验证台，再比较。');return;}
      if(state.finalAttempted&&state.finalUnsure){log.note(3,'已检查全部虚构新证据；本次已完成探索，尚未形成独立结论。');log.finish(3,'已探索，尚未形成独立结论');render();focusCard();return;}
      if(state.finalAttempted&&currentCorrect){log.note(3,'已检查全部虚构新证据，并完成从“城市性质”到“王朝身份”的独立结论。');log.finish(3,'能限制结论并说明证据缺口');render();focusCard();return;}
      if(!state.finalUnsure&&!state.upgradeChoice){message('请选择最能推进身份判断的一项材料；暂时无法判断也可勾选“说不清”。');return;}
      if(!state.finalUnsure&&(chars<30||chars>60)){message('请把结论写在30—60字之间；暂时说不清也可以勾选。');return;}
      const conclusion=state.finalUnsure?'暂时说不清':state.finalConclusion.trim();
      const chosen=state.upgradeChoice?optionText(L.upgrades.map(item=>({id:item.id,text:item.title})),state.upgradeChoice):'暂时未判断';
      const answer='证据升级：'+chosen+'。结论：'+conclusion;
      log.submit(3,answer,state.finalUnsure?null:currentCorrect,conclusion);state.finalAttempted=true;state.upgradeExplained=true;save();renderUpgrade();
      message(state.finalUnsure?'强弱解释已经揭示；可以继续修订，也可以收束本次探索。':currentCorrect?'强弱解释已经揭示；看完后可以收束调查，或继续修订。':'已揭示三项材料能走多远，请据此修订判断。');
    };
  }

  function renderComplete(){
    const uncertain=state.finalUnsure||log.records[3]?.self==='已探索，尚未形成独立结论';
    const status=uncertain?'<div class="completion-status"><b>本次已完成探索，尚未形成独立结论。</b><p>这不是失败。记录里保留了看过的材料和提示，下次可以从两把证据尺重新判断。</p></div>':'';
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">调查收束 · 结论仍向新证据开放</p><h2 tabindex="-1">'+(uncertain?'探索已经走完，结论可以稍后再来。':'没有国名牌，不等于什么都不知道。')+'</h2>'+status+'<div class="final-facts"><b>确定的直接发现</b><p>井字形道路网、宫城、专业作坊，以及随葬品差异明显的墓葬。</p></div><div class="final-scales"><section><small>城市性质 · 有力支持</small><b>中心性大型都邑</b><p>这是多类遗迹共同支持的解释，不是某一件遗物直接写下的结论。</p></section><span>≠</span><section><small>王朝身份 · 有力支持但未锁定</small><b>很可能与夏晚期核心都邑／都城有关</b><p>年代、位置、规模与文献线索形成有力解释；还缺与城市同一时代、能直接读出国名、城名或王名的文字。</p></section></div><p class="parallel-takeaway"><b>历史不是在“相信”与“不相信”之间二选一。</b>数学会给结论写证明，历史也要给每句话标出证据强度：哪些是直接发现，哪些是有力解释，哪些仍等待新材料。</p><div class="next-case"><b>下一案预告：</b>商朝留下甲骨文以后，文字就能自动告诉我们真相吗？同一片甲骨上的字、出土位置与问题背景，仍要一起读。</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="erlitou-restart" type="button">重新调查（保留旧记录）</button><a class="secondary" href="courses.html?group=school&subject=历史">返回历史课程</a></div></section>'+log.html();
    host.querySelector('#erlitou-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,visited:[],hotspotAttempts:{},hotspotRevealed:[],ratings:{},upgradeVisited:[]};save();render();focusCard();};
  }
  function render(){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();return;}
    if(log.index===0)renderInitial();else if(log.index===1)renderScan();else if(log.index===2)renderLabels();else renderUpgrade();
    progress();
  }
  render();
})();
