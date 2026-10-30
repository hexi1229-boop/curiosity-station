'use strict';
(function(){
  const host=document.querySelector('#prexia-task');
  const L=window.PreXiaLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请联网刷新后重新打开。</p><button class="primary" id="prexia-refresh">重新打开</button></section>';
    document.querySelector('#prexia-refresh').onclick=()=>location.reload();
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'prexia.html']);

  const esc=F.esc;
  const allHotspots=L.sites.flatMap(site=>site.hotspots);
  const hotspotIds=new Set(allHotspots.map(item=>item.id));
  const optionText=(items,id)=>items.find(item=>item.id===id)?.text||id||'';
  const defaults={
    arrived:false,initialChoice:null,initialReason:'',initialUnsure:false,
    activeSite:'taosi',visited:[],selectedHotspot:null,siteChoice:null,siteReason:'',siteUnsure:false,siteAttempted:false,
    layerMode:'both',layerChoice:null,layerReason:'',layerUnsure:false,layerAttempted:false,
    transferChoice:null,transferReason:'',transferUnsure:false,transferAttempted:false
  };
  let log=F.create(L.title,L.tasks);

  function safeText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function oneOf(value,items){return items.some(item=>item.id===value)?value:null;}
  function loadState(){
    const saved=log.checkpoint.prexia||{};
    return {
      ...defaults,...saved,
      arrived:!!saved.arrived,
      initialChoice:oneOf(saved.initialChoice,L.initialOptions),initialReason:safeText(saved.initialReason),initialUnsure:!!saved.initialUnsure,
      activeSite:L.sites.some(site=>site.id===saved.activeSite)?saved.activeSite:'taosi',
      visited:Array.isArray(saved.visited)?[...new Set(saved.visited.filter(id=>hotspotIds.has(id)))]:[],
      selectedHotspot:hotspotIds.has(saved.selectedHotspot)?saved.selectedHotspot:null,
      siteChoice:oneOf(saved.siteChoice,L.siteOptions),siteReason:safeText(saved.siteReason),siteUnsure:!!saved.siteUnsure,siteAttempted:!!saved.siteAttempted,
      layerMode:['tradition','archaeology','both'].includes(saved.layerMode)?saved.layerMode:'both',
      layerChoice:oneOf(saved.layerChoice,L.layerOptions),layerReason:safeText(saved.layerReason),layerUnsure:!!saved.layerUnsure,layerAttempted:!!saved.layerAttempted,
      transferChoice:oneOf(saved.transferChoice,L.transferOptions),transferReason:safeText(saved.transferReason),transferUnsure:!!saved.transferUnsure,transferAttempted:!!saved.transferAttempted
    };
  }
  let state=loadState();
  function save(){log.point({prexia:state});}
  function progress(){
    document.querySelectorAll('.prexia-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.prexia-nav')?.scrollIntoView({block:'start'});}
  function message(value){const box=host.querySelector('#prexia-message');if(box){box.textContent=value;box.focus({preventScroll:true});}}
  function card(label,title,body,button=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="prexia-message" role="status" tabindex="-1"></p>'+button+'</section>';
  }
  function choices(items,selected,label){
    return '<div class="parallel-choices" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" data-choice="'+esc(item.id)+'" aria-pressed="'+String(item.id===selected)+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function reason(prefix,label,value,unsure,placeholder){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" maxlength="900" rows="3" placeholder="'+esc(placeholder||'说出哪一条材料改变或支持了你的判断。')+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function reasonValue(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function bindChoices(key,attemptedKey=null){
    host.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
      state[key]=button.dataset.choice;
      if(attemptedKey)state[attemptedKey]=false;
      host.querySelectorAll('[data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      host.querySelector('.site-result,.layer-result,.transfer-result')?.remove();
      const status=host.querySelector('#prexia-message');if(status)status.textContent='';
      save();
    });
  }
  function bindReason(prefix,key,unsureKey){
    const input=host.querySelector('#'+prefix+'-reason');
    const unsure=host.querySelector('#'+prefix+'-unsure');
    input?.addEventListener('input',()=>{state[key]=input.value.slice(0,900);if(input.value.trim()){state[unsureKey]=false;unsure.checked=false;}save();});
    unsure?.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function bindHelp(index){
    host.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)log.help(index,details.dataset.help);}));
  }

  function timeCapsule(){
    return '<div class="time-capsule" id="time-capsule"><div class="time-stars" aria-hidden="true"></div><div class="time-readout"><small>time capsule · destination</small><output class="time-year" id="time-year">公元 2026</output><p>目的地不是一段可以重播的录像。我们能抵达的，是遗址和后来留下的文字。</p><button type="button" id="launch-capsule">倒转四千多年</button></div></div>';
  }
  function renderArrival(){
    if(!state.arrived){
      const body='<p class="parallel-lead">如果时间舱真的回到夏朝以前，入口处会不会立着一块牌子：“欢迎来到三皇五帝时代”？先出发，抵达后再留下判断。</p>'+timeCapsule()+'<p class="visit-status">画面是教学时间舱，不是历史录像；公元前年代和距今年数均取约数。</p>';
      host.innerHTML=card('第一现场 · 时间舱','把今天的名字，带回当时会发生什么？',body);
      host.querySelector('#launch-capsule').onclick=launch;
      return;
    }
    const body='<div class="arrival-strip"><div><b>你看得到</b>城墙、建筑基址、墓葬、器物和它们所在的地层。</div><div><b>你暂时看不到</b>一块写着“现在是三皇五帝时代”的年代牌。</div><div><b>你必须区分</b>当时留下的材料，与后人给过去整理出的名字。</div></div><p class="parallel-lead">在查看遗址以前，先留下你的第一判断。这里不急着判对错，下一站会给你新证据。</p>'+choices(L.initialOptions,state.initialChoice,'夏朝以前如何称呼')+reason('initial','你为什么这样判断？',state.initialReason,state.initialUnsure,'可以从“名字是谁留下的”或“没有文字是否等于没有复杂社会”来说。');
    host.innerHTML=card('第一现场 · 已抵达距今约4200年','入口处没有年代牌，你怎样称呼这里？',body,'<button class="primary" id="initial-submit">封存首答，进入遗址现场 →</button>');
    bindChoices('initialChoice');bindReason('initial','initialReason','initialUnsure');
    host.querySelector('#initial-submit').onclick=()=>{
      const why=reasonValue(state.initialReason,state.initialUnsure);
      if(!state.initialChoice){message('先选一个最接近你现在想法的判断。');return;}
      if(!why){message('再留一句理由；暂时说不清也可以勾选。');return;}
      log.submit(0,optionText(L.initialOptions,state.initialChoice),null,why);
      log.note(0,'首答在查看陶寺、石峁材料以前封存，本环节不立即判分。');
      log.finish(0,'已封存首答，等待证据修订');
      render();focusCard();
    };
  }
  function launch(){
    const capsule=host.querySelector('#time-capsule');
    const output=host.querySelector('#time-year');
    const button=host.querySelector('#launch-capsule');
    button.disabled=true;capsule.classList.add('running');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration=reduced?0:850;
    const start=performance.now();
    function tick(now){
      const p=duration?Math.min(1,(now-start)/duration):1;
      const year=Math.round(2026-(4226*p));
      output.textContent=year>0?'公元 '+year:'约公元前 '+Math.abs(year);
      if(p<1)requestAnimationFrame(tick);else{
        state.arrived=true;save();render();focusCard();
      }
    }
    requestAnimationFrame(tick);
  }

  function siteSvg(site){
    if(site.id==='taosi')return '<svg viewBox="0 0 760 360" role="img" aria-label="陶寺遗址教学复原景观"><defs><linearGradient id="taosi-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8bd92"/><stop offset="1" stop-color="#a77d55"/></linearGradient></defs><path d="M0 177 Q120 118 240 169 T480 159 T760 162 V360 H0Z" fill="url(#taosi-earth)"/><path d="M78 227 L230 179 L385 215 L540 172 L697 214" fill="none" stroke="#75513b" stroke-width="13"/><path d="M173 207 v-51 h92 v45 M184 156 l35-28 35 28" fill="#9c704d" stroke="#5d4133" stroke-width="5"/><g fill="#7b5740"><rect x="412" y="174" width="118" height="63" rx="4"/><path d="M397 177 l74-47 74 47z"/></g><g fill="#806044"><rect x="536" y="238" width="25" height="32"/><rect x="570" y="229" width="29" height="41"/><rect x="610" y="241" width="23" height="29"/></g><path d="M81 290 q85-70 173 0" fill="none" stroke="#654637" stroke-width="11"/><circle cx="105" cy="112" r="24" fill="#6d7f62"/><circle cx="137" cy="124" r="29" fill="#60765b"/></svg>';
    return '<svg viewBox="0 0 760 360" role="img" aria-label="石峁遗址教学复原景观"><path d="M0 176 Q130 116 260 165 T520 137 T760 160 V360 H0Z" fill="#ad906c"/><path d="M0 242 L132 207 L264 225 L400 191 L546 218 L760 180 V360 H0Z" fill="#8c755d"/><g fill="none" stroke="#5f5548" stroke-width="17"><path d="M39 276 L183 230 L323 254 L474 213 L638 239 L746 216"/><path d="M113 310 L264 270 L404 292 L566 253 L700 273"/></g><g fill="#6d5b4a" stroke="#4a4037" stroke-width="5"><path d="M317 207 L365 126 L492 126 L543 207Z"/><rect x="369" y="87" width="120" height="63"/><path d="M355 91 L429 52 L503 91Z"/></g><g fill="#bb9c72"><rect x="178" y="213" width="18" height="17"/><rect x="204" y="207" width="22" height="19"/><rect x="591" y="213" width="21" height="19"/></g></svg>';
  }
  function renderSites(){
    const site=L.sites.find(item=>item.id===state.activeSite)||L.sites[0];
    const selected=allHotspots.find(item=>item.id===state.selectedHotspot);
    const visitedBySite=id=>state.visited.filter(item=>item.startsWith(id+'-')).length;
    const checked=state.siteAttempted?L.gradeSite(state.siteChoice):null;
    const wrongSiteFeedback={
      dynasties:'陶寺主体约距今4300—3900年，石峁约距今4300—3800年。两条时间带有很长一段并排，不是整齐的前后接班。',
      'same-city':'两地都有大型工程，能分别说明较强的组织能力；规模相近不能自动证明它们属于同一个国家，还需要能连接两地制度、权力或身份的材料。',
      'named-rulers':'大型建筑、墓葬和作坊没有写出主人姓名。陶寺与尧、石峁与黄帝的对应仍是需要更多直接证据检验的解释。'
    };
    const result=state.siteAttempted?'<div class="site-result '+(checked?'':'bad')+'"><b>'+(checked?'年代关系看清了。':'这项结论还缺关键证据。')+'</b><br>'+(checked?'陶寺和石峁存在时间重叠，材料显示不同地区都出现了复杂中心；规模相近不能自动证明它们属于同一国家。':wrongSiteFeedback[state.siteChoice]||'回到年代、规模与姓名三类证据，检查结论多走了哪一步。')+'</div>':'';
    const body='<p class="parallel-lead">你现在是现场调查员。切换两处遗址，至少查看每处两个热点。每一个热点都分成“直接发现”和“能够解释到哪里”。</p><div class="site-tabs" role="group" aria-label="切换遗址">'+L.sites.map(item=>'<button type="button" data-site="'+item.id+'" aria-pressed="'+String(item.id===site.id)+'">'+esc(item.name)+' · '+esc(item.period)+'</button>').join('')+'</div><section class="prexia-stage"><div class="site-heading"><h3>'+esc(site.name)+'现场</h3><p>'+esc(site.place)+'<br>'+esc(site.period)+'</p></div><div class="site-board">'+siteSvg(site)+site.hotspots.map((spot,index)=>'<button type="button" class="hotspot '+(state.visited.includes(spot.id)?'visited':'')+'" style="--x:'+spot.x+';--y:'+spot.y+'" data-hotspot="'+spot.id+'" aria-label="查看'+esc(spot.label)+'">'+(index+1)+'</button>').join('')+'<span class="reconstruction-label">教学复原示意 · 不是照片或真实平面图</span></div><div class="field-note" aria-live="polite">'+(selected?'<h4>'+esc(selected.title)+'</h4><p>'+esc(selected.text)+'</p><small>热点：'+esc(selected.label)+'</small>':'<h4>现场笔记等待证据</h4><p>点击图上的编号。先看考古学家实际发现了什么，再看它能支持怎样的解释。</p>')+'</div><p class="visit-status">陶寺已查看 '+visitedBySite('taosi')+' / 4；石峁已查看 '+visitedBySite('shimao')+' / 4。每处看两个即可继续。</p></section><h3>两处遗址是什么关系？</h3>'+choices(L.siteOptions,state.siteChoice,'陶寺和石峁的关系')+reason('site','用年代或一项现场证据说明理由。',state.siteReason,state.siteUnsure,'例如：两条年代……；城墙／墓葬能说明……，但不能说明……')+'<details class="parallel-help" data-help="先把两条年代带叠在一起"><summary>卡住时看年代提示</summary><p>陶寺主体距今约4300—3900年，石峁距今约4300—3800年。把它们画成两条线，而不是两个点。</p></details><details class="parallel-help" data-help="区分大型城市与已知城名"><summary>还需要一个证据边界提示</summary><p>大城、作坊和等级墓葬能说明组织能力与社会分化；没有能确认城名、国名或统治者姓名的文字，就不能只凭规模给它贴上传说人物。</p></details>'+result;
    host.innerHTML=card('第二现场 · 陶寺与石峁','城很大，就能叫出它主人的名字吗？',body,'<button class="primary" id="site-submit">检查现场结论 →</button>');
    host.querySelectorAll('[data-site]').forEach(button=>button.onclick=()=>{state.activeSite=button.dataset.site;state.selectedHotspot=null;save();renderSites();host.querySelector('[data-site="'+state.activeSite+'"]')?.focus({preventScroll:true});});
    host.querySelectorAll('[data-hotspot]').forEach(button=>button.onclick=()=>{const id=button.dataset.hotspot;state.selectedHotspot=id;if(!state.visited.includes(id))state.visited.push(id);save();renderSites();host.querySelector('[data-hotspot="'+id+'"]')?.focus({preventScroll:true});});
    bindChoices('siteChoice','siteAttempted');bindReason('site','siteReason','siteUnsure');bindHelp(1);
    host.querySelector('#site-submit').onclick=()=>{
      const eachVisited=L.sites.every(item=>state.visited.filter(id=>id.startsWith(item.id+'-')).length>=2);
      const why=reasonValue(state.siteReason,state.siteUnsure);
      if(!eachVisited){message('每处遗址至少查看两个热点，再比较它们。');return;}
      if(!state.siteChoice){message('先选择两处遗址最稳妥的关系。');return;}
      if(!why){message('再留一句年代或现场证据；暂时说不清也可以勾选。');return;}
      const correct=L.gradeSite(state.siteChoice);
      log.submit(1,optionText(L.siteOptions,state.siteChoice),correct,why);
      state.siteAttempted=true;save();
      if(!correct){renderSites();message('看看上方针对你这个选择的反馈，再修订结论。');return;}
      log.note(1,'查看热点：'+state.visited.map(id=>allHotspots.find(item=>item.id===id)?.label).filter(Boolean).join('、')+'。');
      log.finish(1,state.siteUnsure?'仍需帮助':'能区分遗址规模与人物身份');
      render();focusCard();
    };
  }

  function layerLab(){
    return '<div class="layer-lab" data-layer="'+esc(state.layerMode)+'"><div class="layer-tabs" role="group" aria-label="切换两层材料"><button type="button" data-layer="tradition" aria-pressed="'+String(state.layerMode==='tradition')+'">只看传统人物线</button><button type="button" data-layer="archaeology" aria-pressed="'+String(state.layerMode==='archaeology')+'">只看考古材料线</button><button type="button" data-layer="both" aria-pressed="'+String(state.layerMode==='both')+'">两层并看</button></div><p class="layer-note">传统人物线没有可靠的同期绝对年代，不能和下方横轴逐格对齐。“三皇”“五帝”的名单在不同古书中并不一致；这里只展示《史记·五帝本纪》的一种五帝顺序，并接入《夏本纪》中的禹。</p><section class="time-layer tradition-layer"><header><b>后世文献线</b><small>西汉《史记》整理的一种顺序</small></header><div class="layer-track"><div class="tradition-nodes"><span>黄帝</span><span>颛顼</span><span>帝喾</span><span>尧</span><span>舜</span><span>禹</span></div></div></section><section class="time-layer archaeology-layer"><header><b>考古材料线</b><small>约数 · 不等于朝代表</small></header><div class="layer-track"><div class="archaeology-bars"><div style="--left:0%;--width:100%">广义龙山时代 · 各地起止不同</div><div style="--left:42%;--width:38%">陶寺 · 约前2300—前1900</div><div style="--left:42%;--width:50%">石峁 · 约前2300—前1800</div></div></div></section><div class="bridge-warning"><span>≠</span><div><b>不能自动逐格连线</b><br>年代、位置相合可以提出假设；要确认“某城就是某位人物的都城”，还需要能识别名称的同期文字等更直接材料。</div></div></div>';
  }
  function renderLayers(){
    const correct=state.layerAttempted?L.gradeLayer(state.layerChoice):null;
    const initial=optionText(L.initialOptions,state.initialChoice)||'未找到首答文字';
    const wrongLayerFeedback={
      'one-table':['不能只按时间硬贴名字。','“时间、位置相近”只能提出待检验的假设，还不能确认人物与城址。'],
      'archaeology-only':['考古不是丢掉文献的理由。','后世文献能告诉我们古人怎样整理与记忆上古，只是不能把它当成同期现场记录。'],
      'text-only':['文献顺序不能替代考古证据。','《史记》保存了一条后世整理的人物线；判断当时的城址与社会，还要看遗址、器物和年代等材料。']
    };
    const wrongLayer=wrongLayerFeedback[state.layerChoice]||['两层材料回答的问题不同。','分别看清后世文献与考古遗存能说明什么，再修订判断。'];
    const result=state.layerAttempted?'<div class="layer-result '+(correct?'':'bad')+'"><b>'+(correct?'两层没有被压成一层。':wrongLayer[0])+'</b><br>'+(correct?'传统文献与考古材料都值得研究，但回答的问题不同；比较不是强行对号。':wrongLayer[1])+'</div>':'';
    const body='<p class="parallel-lead">你已经在遗址里看见复杂社会。现在把另一类材料放进来：司马迁在西汉整理的《五帝本纪》，距离它讲述的上古时代很远，但保存了后世关于黄帝、尧、舜等人的历史记忆。</p><div class="history-revision"><strong>时间舱里的首答</strong>'+esc(initial)+'</div>'+layerLab()+'<h3>看完两层，你怎样修订？</h3>'+choices(L.layerOptions,state.layerChoice,'传统人物与考古遗址的关系')+reason('layer','说明你为什么保留或改变首答。',state.layerReason,state.layerUnsure,'至少提到两类材料中的一类：后世文献能说明……；考古遗址能说明……；目前不能……')+'<details class="parallel-help" data-help="先问两层材料分别来自什么时候"><summary>卡住时先问一个时间问题</summary><p>陶寺、石峁的遗迹是在四千多年前形成的；《史记》由西汉司马迁整理。较晚的文献可以保存更早的记忆，但不能假装成当时人的现场记录。</p></details><details class="parallel-help" data-help="比较不等于确认人物身份"><summary>还需要一个修订句式</summary><p>可以这样搭骨架：“考古材料能证明……；后世文献能说明……；因为还缺少……，所以不能确认……。”把内容换成你自己的判断。</p></details>'+result;
    host.innerHTML=card('第三现场 · 两层时间线','“五帝故事”和“考古现场”怎样相遇？',body,'<button class="primary" id="layer-submit">提交修订后的判断 →</button>');
    host.querySelectorAll('button[data-layer]').forEach(button=>button.onclick=()=>{state.layerMode=button.dataset.layer;save();renderLayers();host.querySelector('button[data-layer="'+state.layerMode+'"]')?.focus({preventScroll:true});});
    bindChoices('layerChoice','layerAttempted');bindReason('layer','layerReason','layerUnsure');bindHelp(2);
    host.querySelector('#layer-submit').onclick=()=>{
      const why=reasonValue(state.layerReason,state.layerUnsure);
      if(!state.layerChoice){message('先留下修订后的判断。');return;}
      if(!why){message('请说明为什么保留或改变首答；暂时说不清也可以勾选。');return;}
      const correct=L.gradeLayer(state.layerChoice);
      log.submit(2,optionText(L.layerOptions,state.layerChoice),correct,why);
      state.layerAttempted=true;save();
      if(!correct){renderLayers();message('看看上方针对你这个选择的反馈，再修订判断。');return;}
      log.note(2,'修订时已比较后世文献线与考古材料线，并保留逐人逐城对应的不确定性。');
      log.finish(2,state.layerUnsure?'仍需帮助':'能分层比较文献与考古');
      render();focusCard();
    };
  }

  function renderTransfer(){
    const correct=state.transferAttempted?L.gradeTransfer(state.transferChoice):null;
    const result=state.transferAttempted?'<div class="transfer-result '+(correct?'':'bad')+'"><b>'+(correct?'调查结论守住了。':'结论比证据走得更远。')+'</b><br>'+(correct?'大型工程、作坊和墓葬差异共同支持“复杂区域中心”；没有可读名称，人物身份仍然未知。':'检查你的结论是否把晚800年的传说变成了同期名牌，或把“没有文字”误写成“没有复杂社会”。')+'</div>':'';
    const body='<p class="parallel-lead">考古队送来一处新遗址档案。这次没有陶寺、石峁，也没有上一题的答案框架。请先辨认每条材料是什么时候留下的，再写调查简报。</p><p class="fiction-label">教学虚构材料 · 河湾城不是现实考古发现</p><div class="transfer-archive">'+L.transferEvidence.map(item=>'<article><b>'+esc(item.tag)+'</b><p>'+esc(item.text)+'</p></article>').join('')+'</div><h3>哪一份结论可以交给博物馆？</h3>'+choices(L.transferOptions,state.transferChoice,'河湾城调查结论')+reason('transfer','引用至少两条档案，并指出一件仍不能确认的事。',state.transferReason,state.transferUnsure,'例如：因为发现……和……，可以说……；但由于……，还不能说……')+'<details class="parallel-help" data-help="把材料按当时遗存与后世说法分组"><summary>卡住时看一条调查提示</summary><p>城墙、作坊、墓葬和测年属于遗址材料；《旧闻抄》比遗址晚约800年。两组材料都可研究，但离事件的距离和能回答的问题不同。</p></details>'+result;
    host.innerHTML=card('第四现场 · 独立迁移','河湾城找到了，“帝青都城”也找到了吗？',body,'<button class="primary" id="transfer-submit">提交河湾城调查简报 →</button>');
    bindChoices('transferChoice','transferAttempted');bindReason('transfer','transferReason','transferUnsure');bindHelp(3);
    host.querySelector('#transfer-submit').onclick=()=>{
      const why=reasonValue(state.transferReason,state.transferUnsure);
      if(!state.transferChoice){message('先选一份可以交给博物馆的结论。');return;}
      if(!why){message('请引用至少两条档案并留下一个未知；暂时说不清也可以勾选。');return;}
      const correct=L.gradeTransfer(state.transferChoice);
      log.submit(3,optionText(L.transferOptions,state.transferChoice),correct,why);
      state.transferAttempted=true;save();
      if(!correct){renderTransfer();message('检查“复杂社会”“没有文字”和“人物身份”是不是被混成了一件事。');return;}
      log.note(3,'在虚构新遗址中独立区分了同期遗存、后世传说和仍缺少的姓名证据。');
      log.finish(3,state.transferUnsure?'仍需帮助':'能独立限制历史结论');
      render();focusCard();
    };
  }

  function renderComplete(){
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">调查结束 · 但历史问题仍开放</p><h2 tabindex="-1">你没有给古城硬贴姓名，也没有把传说一笔抹掉。</h2><div class="prexia-method"><div><b>传统文献留下什么？</b>后世怎样记忆、整理黄帝、尧、舜、禹等上古人物与故事。</div><span>⇄</span><div><b>考古材料留下什么？</b>当时人的城市、工程、生产、仪式和社会差异，但未必留下可读姓名。</div></div><p class="parallel-takeaway">目前更稳妥的表达是：<b>“三皇五帝时代”是传统历史叙事中的上古阶段；考古学看见的，则是多个地区复杂社会与早期国家逐渐形成。</b>两条线可以互相提问，不能未经证明就逐格重合。</p><div class="history-caution"><b>下一把钥匙：</b>进入夏朝研究后，问题会更尖锐——文献中有“夏”，二里头又有强大的早期国家；缺少哪一种证据，才使“二里头就是夏都”仍需要严谨讨论？</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="prexia-restart" type="button">重新调查（保留旧记录）</button><a class="secondary" href="courses.html?group=school&subject=历史">返回历史课程</a></div></section>'+log.html();
    host.querySelector('#prexia-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,visited:[]};save();render();focusCard();};
  }
  function render(){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();return;}
    if(log.index===0)renderArrival();
    else if(log.index===1)renderSites();
    else if(log.index===2)renderLayers();
    else renderTransfer();
    progress();
  }
  render();
})();
