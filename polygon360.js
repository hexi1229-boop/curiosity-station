'use strict';
(function(){
  const host=document.querySelector('#polygon360-task');
  const L=window.Polygon360Lesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="polygon360-refresh">重新打开</button></section>';
    document.querySelector('#polygon360-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.unshift([L.id,L.title,'polygon360.html']);

  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  const defaults={
    quadPhase:'choose',quadChoice:null,quadReason:'',quadUnsure:false,
    quadDiagonal:null,quadFacts:[],quadExplain:'',quadExplainUnsure:false,
    pentagonRotation:16,pentagonFirstLine:null,pentagonLines:[],pentagonExplain:'',pentagonUnsure:false,
    generalPhase:'construct',fanPicks:[],fanFirstPick:null,sideCount:3,observedSides:[],patternChoice:null,patternReason:'',patternUnsure:false,
    generalChoice:null,centerChoice:null,centerStep:0,scopeChoice:null,challengeChecked:false,generalExplain:'',generalUnsure:false
  };

  function textValue(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function oneOf(value,values){return values.includes(value)?value:null;}
  function numberIn(value,min,max,fallback){const n=Number(value);return Number.isFinite(n)&&n>=min&&n<=max?n:fallback;}
  function integer(value,min,max,fallback){return Number.isInteger(value)&&value>=min&&value<=max?value:fallback;}
  function safeIds(values,allowed,max){
    if(!Array.isArray(values))return [];
    const set=new Set(allowed);
    return values.filter((value,index)=>set.has(value)&&values.indexOf(value)===index).slice(0,max);
  }
  function loadState(){
    const saved=log.checkpoint.polygon360||{};
    const next={
      ...defaults,...saved,
      quadPhase:saved.quadPhase==='draw'?'draw':'choose',
      quadChoice:oneOf(saved.quadChoice,L.quadrilateralMethods.map(item=>item.id)),
      quadReason:textValue(saved.quadReason),quadUnsure:!!saved.quadUnsure,
      quadDiagonal:oneOf(saved.quadDiagonal,['AC','BD']),
      quadFacts:safeIds(saved.quadFacts,L.quadrilateralFacts.map(item=>item.id),L.quadrilateralFacts.length),
      quadExplain:textValue(saved.quadExplain),quadExplainUnsure:!!saved.quadExplainUnsure,
      pentagonRotation:numberIn(saved.pentagonRotation,-30,30,defaults.pentagonRotation),
      pentagonFirstLine:oneOf(saved.pentagonFirstLine,L.pentagonLines.map(item=>item.id)),
      pentagonLines:safeIds(saved.pentagonLines,L.pentagonLines.filter(item=>item.valid).map(item=>item.id),2),
      pentagonExplain:textValue(saved.pentagonExplain),pentagonUnsure:!!saved.pentagonUnsure,
      generalPhase:L.resumeGeneralPhase(saved.generalPhase),
      fanPicks:safeIds(saved.fanPicks,[2,3,4,5],4),fanFirstPick:integer(saved.fanFirstPick,1,6,null),
      sideCount:integer(saved.sideCount,3,9,defaults.sideCount),
      observedSides:safeIds(saved.observedSides,[3,4,5,6,7,8,9],7),
      patternChoice:oneOf(saved.patternChoice,L.patternOptions.map(item=>item.id)),
      patternReason:textValue(saved.patternReason),patternUnsure:!!saved.patternUnsure,
      generalChoice:oneOf(saved.generalChoice,L.generalOptions.map(item=>item.id)),
      centerChoice:oneOf(saved.centerChoice,L.centerOptions.map(item=>item.id)),centerStep:integer(saved.centerStep,0,2,0),
      scopeChoice:oneOf(saved.scopeChoice,L.scopeOptions.map(item=>item.id)),challengeChecked:false,
      generalExplain:textValue(saved.generalExplain),generalUnsure:!!saved.generalUnsure
    };
    next.challengeChecked=!!saved.challengeChecked&&next.centerStep>=2&&L.validResearchChallenge(next.centerChoice,next.scopeChoice);
    return next;
  }
  let state=loadState();
  function save(){log.point({polygon360:state});}
  function validReason(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function message(value){const box=host.querySelector('#polygon360-message');if(box)box.textContent=value;}
  function progress(){
    document.querySelectorAll('.parallel-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.parallel-nav')?.scrollIntoView({block:'start'});}
  function base(label,title,body,button){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="polygon360-message" role="status"></p>'+button+'</section>';
  }
  function proofGrowth(stage){
    const items=[
      {label:'已有工具',text:'三角形内角和＝180°',state:'known'},
      {label:stage>=1?'已经推出':'现在挑战',text:stage>=1?'四边形内角和＝2×180°＝360°':'四边形能拆成几块？',state:stage>=1?'known':stage===0?'current':''},
      {label:stage>=2?'已经推出':stage===1?'继续生长':'下一步',text:stage>=2?'五边形内角和＝3×180°＝540°':stage===1?'五边形能拆成几块？':'等待前一步',state:stage>=2?'known':stage===1?'current':''},
      {label:stage>=3?'一般结论':stage===2?'继续追问':'再下一步',text:stage>=3?'n边形内角和＝(n−2)×180°':stage===2?'任意n边形呢？':'能否推广到所有边数？',state:stage>=3?'known':stage===2?'current':''}
    ];
    return '<div class="polygon-growth" aria-label="证明生长进度">'+items.map(item=>'<div class="'+item.state+'"><span>'+esc(item.label)+'</span><b>'+esc(item.text)+'</b></div>').join('')+'</div>';
  }
  function choices(items,selected,label,group){
    return '<div class="parallel-choices" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" data-group="'+esc(group)+'" data-choice="'+esc(item.id)+'" aria-pressed="'+String(selected===item.id)+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function reason(prefix,label,value,unsure,placeholder='一句话、关键词或一个算式都可以。'){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" rows="3" maxlength="900" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindSingle(group,key,onChange){
    host.querySelectorAll('[data-group="'+group+'"][data-choice]').forEach(button=>button.onclick=()=>{
      const changed=state[key]!==button.dataset.choice;
      state[key]=button.dataset.choice;
      host.querySelectorAll('[data-group="'+group+'"][data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      if(changed&&onChange)onChange();
      save();
    });
  }
  function bindReason(prefix,valueKey,unsureKey){
    const input=host.querySelector('#'+prefix+'-reason'),unsure=host.querySelector('#'+prefix+'-unsure');
    input.addEventListener('input',()=>{state[valueKey]=input.value.slice(0,900);if(input.value.trim()){state[unsureKey]=false;unsure.checked=false;}save();});
    unsure.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function bindHelp(index){
    host.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)log.help(index,details.dataset.help);}));
  }
  function corrective(index,label,value){log.help(index,'自动反馈：'+label);message(value);}

  const quadPoints={A:[72,55],B:[330,38],C:[365,245],D:[55,280]};
  function line(points,id,className='polygon-line'){
    const a=points[id[0]],b=points[id[1]];
    return '<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" class="'+className+'"/>';
  }
  function vertexMarkup(points,fixed=''){
    return Object.entries(points).map(([name,p])=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="7" class="polygon-vertex '+(name===fixed?'fixed':'')+'"/><text x="'+(p[0]+(p[0]>210?-22:11))+'" y="'+(p[1]+(p[1]>160?24:-12))+'" fill="#284f4b" font-size="18" font-weight="750">'+name+'</text>').join('');
  }
  function quadrilateralSvg(diagonal){
    const p=quadPoints;
    let slices='';
    if(diagonal==='AC')slices='<polygon points="72,55 330,38 365,245" class="polygon-slice-a"/><polygon points="72,55 365,245 55,280" class="polygon-slice-b"/>';
    if(diagonal==='BD')slices='<polygon points="72,55 330,38 55,280" class="polygon-slice-a"/><polygon points="330,38 365,245 55,280" class="polygon-slice-b"/>';
    return '<svg viewBox="0 0 420 330" role="img" aria-labelledby="quad-title"><title id="quad-title">一个歪斜的凸四边形'+(diagonal?'，对角线'+diagonal+'把它分成两个三角形':'，还没有画对角线')+'</title>'+slices+'<polygon points="72,55 330,38 365,245 55,280" class="polygon-outline"/>'+(diagonal?line(p,diagonal):'')+vertexMarkup(p)+'</svg>';
  }

  function renderQuadrilateralChoice(){
    const body=proofGrowth(0)+'<p class="parallel-lead">G2已经证明：每个三角形的三个内角和是180°。面对下面这个没有直角标记的凸四边形，哪种方法最直接地把旧结论用起来？</p><div class="polygon-stage"><figure class="polygon-figure">'+quadrilateralSvg(null)+'<figcaption>它故意不是长方形；“看起来”不能决定内角和。</figcaption></figure><div class="polygon-side-note"><h3>已知工具</h3><p><b>三角形内角和＝180°</b></p><p>目标不是量出这一个图形，而是找一个对所有凸四边形都能重复的构造。</p></div></div>'+choices(L.quadrilateralMethods,state.quadChoice,'选择四边形证明方法','quad')+reason('quad-choice','为什么这种方法能把问题变成已经会的问题？',state.quadReason,state.quadUnsure,'把“四边形”和“三角形”联系起来。');
    host.innerHTML=base('环节 1 / 先选方法','歪斜四边形，也能用三角形解释吗？',body,'<button class="primary" id="quad-choice-submit">留下首答，再亲手画线 →</button>');
    bindSingle('quad','quadChoice');bindReason('quad-choice','quadReason','quadUnsure');
    host.querySelector('#quad-choice-submit').onclick=()=>{
      if(!state.quadChoice){message('先选一种方法。');return;}
      const why=validReason(state.quadReason,state.quadUnsure);if(!why){message('再留一句理由；暂时说不清也可以如实勾选。');return;}
      const item=L.quadrilateralMethods.find(option=>option.id===state.quadChoice),correct=L.validQuadrilateralMethod(state.quadChoice);
      log.submit(0,item.text,correct,why);
      if(!correct){
        if(state.quadChoice==='measure')corrective(0,'有限测量不是一般证明','量角器可以检查一个实例，却没有说明每一个凸四边形为什么都成立。再找一种能调用三角形内角和的方法。');
        else corrective(0,'选择最直接的切法','两条对角线会在内部相交，多出中心的一整圈角，还要额外处理。这里只需一条对角线就能铺满四边形。');
        return;
      }
      state.quadPhase='draw';save();render(true);
    };
  }

  function renderQuadrilateralDraw(){
    const facts='<div class="polygon-facts" role="group" aria-label="检查切分关系">'+L.quadrilateralFacts.map((item,index)=>'<button type="button" data-fact="'+item.id+'" aria-pressed="'+String(state.quadFacts.includes(item.id))+'"><span>'+(index+1)+'</span>'+esc(item.text)+'</button>').join('')+'</div>';
    const body=proofGrowth(0)+'<p class="parallel-lead">现在亲手选一条内部对角线。两种画法都可以；关键是检查切开后的三角形有没有重叠或空隙，以及四个原内角有没有被完整算到。</p><div class="polygon-stage"><figure class="polygon-figure" id="quad-figure">'+quadrilateralSvg(state.quadDiagonal)+'<figcaption>'+(state.quadDiagonal?'已画 '+state.quadDiagonal+'。两块颜色只帮助看清覆盖关系，不是证明本身。':'选择 AC 或 BD，画出一条对角线。')+'</figcaption></figure><div class="polygon-side-note"><h3>亲手画一条</h3><div class="polygon-line-buttons"><button type="button" data-diagonal="AC" aria-pressed="'+String(state.quadDiagonal==='AC')+'">画对角线 A—C</button><button type="button" data-diagonal="BD" aria-pressed="'+String(state.quadDiagonal==='BD')+'">画对角线 B—D</button></div>'+(state.quadDiagonal?'<p class="polygon-calc">1条对角线 → 2个三角形 → 2 × 180° ＝ 360°</p><p class="polygon-reduction">没有重新量四个角，而是把陌生的四边形变回已经证明过的三角形。</p>':'<p>还没有切分，暂时不能直接写“2个三角形”。</p>')+'</div></div>'+facts+reason('quad-draw','把行动和理由连起来：我画了哪条线？为什么能得到360°？',state.quadExplain,state.quadExplainUnsure,'例如：我画……，因为它把……，所以……')+'<details class="parallel-help" data-help="四边形切分检查提示"><summary>给我一点提示</summary><p>一条有效对角线连接两个不相邻顶点。沿着它切开，两块合起来要和原图完全一样；再看对角线两端，原来的内角只是被分成了两部分。</p></details>';
    host.innerHTML=base('环节 1 / 动手验证','一条线，为什么正好得到360°？',body,'<button class="primary" id="quad-finish">收好四边形证明 →</button>');
    host.querySelectorAll('[data-diagonal]').forEach(button=>button.onclick=()=>{state.quadDiagonal=button.dataset.diagonal;save();render();});
    host.querySelectorAll('[data-fact]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.fact;state.quadFacts=state.quadFacts.includes(id)?state.quadFacts.filter(value=>value!==id):[...state.quadFacts,id];button.setAttribute('aria-pressed',String(state.quadFacts.includes(id)));save();
    });
    bindReason('quad-draw','quadExplain','quadExplainUnsure');bindHelp(0);
    host.querySelector('#quad-finish').onclick=()=>{
      if(!state.quadDiagonal){message('先亲手画一条对角线。');return;}
      if(!L.validQuadrilateralFacts(state.quadFacts)){message('再逐项检查三角形数量、覆盖关系和四个原内角。');return;}
      const why=validReason(state.quadExplain,state.quadExplainUnsure);if(!why){message('再把画线行动和结论连成一句；暂时说不清也可以如实勾选。');return;}
      log.submit(0,'画对角线'+state.quadDiagonal+'；确认2个三角形无重叠、无空隙，并完整包含原四边形内角',true,why);
      log.note(0,'用一条内部对角线把凸四边形剖分成2个三角形；颜色只用于观察覆盖关系，证明依据是一般切分和G2三角形内角和。');
      log.finish(0,state.quadExplainUnsure?'完成切分操作；行动理由暂时说不清':'完成“对角线—2个三角形—360°”证明；开放解释未自动判分');render(true);
    };
  }

  const pentagonPoints={A:[103,57],B:[303,43],C:[367,170],D:[260,282],E:[62,235]};
  function pentagonSvg(){
    const selected=state.pentagonLines.map(id=>line(pentagonPoints,id)).join('');
    return '<svg viewBox="0 0 420 330" role="img" aria-labelledby="pentagon-title"><title id="pentagon-title">一个旋转后的不规则凸五边形，从顶点A已画'+state.pentagonLines.length+'条有效对角线</title><g id="pentagon-rotor" transform="rotate('+state.pentagonRotation+' 210 165)"><polygon points="103,57 303,43 367,170 260,282 62,235" class="polygon-outline"/>'+selected+vertexMarkup(pentagonPoints,'A')+'</g></svg>';
  }
  function updatePentagonRotation(){
    const group=host.querySelector('#pentagon-rotor'),out=host.querySelector('#pentagon-rotation-out');
    if(group)group.setAttribute('transform','rotate('+state.pentagonRotation+' 210 165)');
    if(out)out.textContent=Math.round(state.pentagonRotation)+'°';
  }
  function choosePentagonLine(id){
    const item=L.pentagonLines.find(lineItem=>lineItem.id===id);if(!item)return;
    if(!state.pentagonFirstLine){
      state.pentagonFirstLine=id;
      log.submit(1,'第一次画线：'+item.text,item.valid,'操作记录：从指定顶点A辨认有效对角线');
    }
    if(!item.valid){
      save();render();corrective(1,'辨认有效对角线',item.reason);return;
    }
    state.pentagonLines=state.pentagonLines.includes(id)?state.pentagonLines.filter(value=>value!==id):state.pentagonLines.length<2?[...state.pentagonLines,id]:state.pentagonLines;
    save();render();
  }
  function renderPentagon(){
    const first=L.pentagonLines.find(item=>item.id===state.pentagonFirstLine);
    const body=proofGrowth(1)+'<p class="parallel-lead">颜色提示已经撤掉。指定从橙色顶点A出发，依次选出两条有效对角线。图转了方向，边和对角线的关系不会改变。</p><div class="polygon-stage"><figure class="polygon-figure">'+pentagonSvg()+'<figcaption>只有统一浅色底；请靠“是否连接不相邻顶点”判断。</figcaption></figure><div class="polygon-side-note"><h3>从A出发画线</h3><div class="polygon-rotation"><label for="pentagon-rotation">把整张图再转一转 <output id="pentagon-rotation-out">'+Math.round(state.pentagonRotation)+'°</output><input id="pentagon-rotation" type="range" min="-30" max="30" step="1" value="'+state.pentagonRotation+'"></label></div><div class="polygon-line-buttons">'+L.pentagonLines.map(item=>'<button type="button" data-pentagon-line="'+item.id+'" aria-pressed="'+String(state.pentagonLines.includes(item.id))+'">'+esc(item.text)+'</button>').join('')+'</div><p>已画有效对角线：<b>'+state.pentagonLines.length+' / 2</b></p></div></div><p class="polygon-first-record">首次画线：<b>'+(first?esc(first.text):'尚未落笔')+'</b>。这条记录不会被后面的修改覆盖。</p>'+(state.pentagonLines.length===2?'<p class="polygon-calc">2条对角线 → 3个三角形 → 3 × 180° ＝ 540°</p><p class="polygon-reduction">图形换了，方法没有换：继续把新问题化成已经会的三角形。</p>':'')+reason('pentagon','这次为什么从同一顶点画两条线就能完整切分？',state.pentagonExplain,state.pentagonUnsure,'把“无重叠、无空隙”和“3个三角形”说进一句话。')+'<details class="parallel-help" data-help="五边形对角线辨认提示"><summary>卡住了，给我一点提示</summary><p>边连接相邻顶点；对角线连接不相邻顶点。本课选用一把扇形构造：两条线都从指定顶点A出发；这不是五边形唯一的三角剖分方法。</p></details>';
    host.innerHTML=base('环节 2 / 撤掉颜色提示','图转了，还能独立切出3个三角形吗？',body,'<button class="primary" id="pentagon-finish">检查五边形证明 →</button>');
    const slider=host.querySelector('#pentagon-rotation');
    slider.oninput=event=>{state.pentagonRotation=Number(event.target.value);updatePentagonRotation();save();};
    host.querySelectorAll('[data-pentagon-line]').forEach(button=>button.onclick=()=>choosePentagonLine(button.dataset.pentagonLine));
    bindReason('pentagon','pentagonExplain','pentagonUnsure');bindHelp(1);
    host.querySelector('#pentagon-finish').onclick=()=>{
      if(!state.pentagonFirstLine){message('先从A尝试画第一条线。');return;}
      if(!L.validPentagonLines(state.pentagonLines)){message('需要从A画出两条不同的有效对角线。');return;}
      const why=validReason(state.pentagonExplain,state.pentagonUnsure);if(!why){message('再说清这两条线为什么得到3个三角形；暂时说不清也可以如实勾选。');return;}
      const answer='首次画线：'+first.text+'；最终从A画：'+state.pentagonLines.join('、')+'；得到3个无重叠、无空隙的三角形，内角和540°';
      log.submit(1,answer,true,why);
      log.note(1,'旋转图形并撤掉三角形配色后，从固定顶点A画AC、AD，得到3个三角形；首次画线单独保留。');
      const independent=first?.valid&&!log.records[1].helps.some(item=>item.phase!=='完成后回看');
      log.finish(1,state.pentagonUnsure?'完成五边形切分；画线理由暂时说不清':independent?'无提示完成换图切分；开放解释未自动判分':'在提示或反馈后完成五边形切分；待后续无提示调用');render(true);
    };
  }

  function heptagonSvg(){
    const points=polygonVertices(7),complete=state.fanPicks.length===4;
    const pointString=points.map(point=>point.map(value=>value.toFixed(1)).join(',')).join(' ');
    const slices=complete?Array.from({length:5},(_,index)=>'<polygon points="'+[points[0],points[index+1],points[index+2]].map(point=>point.map(value=>value.toFixed(1)).join(',')).join(' ')+'" class="'+(index%2?'polygon-slice-b':'polygon-slice-a')+'" opacity=".72"/>').join(''):'';
    const lines=state.fanPicks.map(index=>'<line x1="'+points[0][0].toFixed(1)+'" y1="'+points[0][1].toFixed(1)+'" x2="'+points[index][0].toFixed(1)+'" y2="'+points[index][1].toFixed(1)+'" class="polygon-line"/>').join('');
    const marks=points.map((point,index)=>'<circle cx="'+point[0].toFixed(1)+'" cy="'+point[1].toFixed(1)+'" r="7" class="polygon-vertex '+(index===0?'fixed':'')+'"/><text x="'+point[0].toFixed(1)+'" y="'+(point[1]+(point[1]<60?-12:24)).toFixed(1)+'" text-anchor="middle" fill="#284f4b" font-size="14" font-weight="750">V'+(index+1)+'</text>').join('');
    return '<svg viewBox="0 0 420 330" role="img" aria-labelledby="heptagon-title"><title id="heptagon-title">一个凸七边形，从V1出发已选择'+state.fanPicks.length+'条有效对角线</title>'+slices+'<polygon points="'+pointString+'" class="polygon-outline"/>'+lines+marks+'</svg>';
  }
  function chooseFanEndpoint(index){
    const valid=L.isFanEndpoint(7,0,index);
    if(state.fanFirstPick===null){
      state.fanFirstPick=index;
      log.note(2,'七边形首次构造：V1—V'+(index+1)+(valid?'，是有效对角线。':'，是相邻边；后续修改不会覆盖这次记录。'));
    }
    if(!valid){
      save();render();corrective(2,'辨认七边形对角线','V1与V'+(index+1)+'相邻，这一段已经是多边形的边。对角线要连接两个不相邻顶点。');return;
    }
    state.fanPicks=state.fanPicks.includes(index)?state.fanPicks.filter(value=>value!==index):[...state.fanPicks,index].sort((a,b)=>a-b);
    save();render();
  }
  function renderGeneralConstruct(){
    const first=state.fanFirstPick===null?'尚未落笔':'V1—V'+(state.fanFirstPick+1);
    const complete=L.validFanEndpoints(7,0,state.fanPicks);
    const buttons=Array.from({length:6},(_,offset)=>offset+1).map(index=>'<button type="button" data-fan-endpoint="'+index+'" aria-pressed="'+String(state.fanPicks.includes(index))+'">连接 V1—V'+(index+1)+'</button>').join('');
    const body=proofGrowth(2)+'<p class="parallel-lead">四边形和五边形都成功了。现在不给颜色、不给预画线：请在七边形中从V1出发，亲手找全有效对角线。</p><div class="polygon-stage"><figure class="polygon-figure">'+heptagonSvg()+'<figcaption>'+(complete?'切分完成后才显示5块颜色，帮助核对是否无空隙、无重叠。':'先靠“是否连接不相邻顶点”判断；选对的线会留在图上。')+'</figcaption></figure><div class="polygon-side-note"><h3>从V1出发</h3><div class="polygon-line-buttons">'+buttons+'</div><p>已画有效对角线：<b>'+state.fanPicks.length+' / 4</b></p>'+(complete?'<p class="polygon-calc">4条对角线 → 5个三角形 → 5 × 180°</p><p class="polygon-reduction">这一次仍没有重新测角，只是继续把七边形化成三角形。</p>':'')+'</div></div><p class="polygon-first-record">首次画线：<b>'+esc(first)+'</b>。后面的修改不会覆盖它。</p><details class="parallel-help" data-help="七边形扇形切分提示"><summary>怎样判断还缺哪条线</summary><p>固定起点是V1。排除V1自己，以及与它相邻的V2、V7；其余顶点都可以成为这把扇形中的对角线终点。</p></details>';
    host.innerHTML=base('环节 3 / 先自己构造','没有预画线，能把七边形也化成三角形吗？',body,'<button class="primary" id="fan-construct-finish">用这个方法观察不同边数 →</button>');
    host.querySelectorAll('[data-fan-endpoint]').forEach(button=>button.onclick=()=>chooseFanEndpoint(Number(button.dataset.fanEndpoint)));
    bindHelp(2);
    host.querySelector('#fan-construct-finish').onclick=()=>{
      if(!complete){message('还没有找全从V1出发的4条有效对角线。');return;}
      log.note(2,'在无预画线、无颜色提示的七边形中，从V1亲手选出4条有效对角线，得到5个三角形；首次画线与反馈单独保留。');
      state.generalPhase='observe';state.sideCount=3;save();render(true);
    };
  }

  function polygonVertices(n){
    const points=[];
    for(let i=0;i<n;i++){
      const angle=(-90+i*360/n)*Math.PI/180;
      points.push([210+130*Math.cos(angle),165+130*Math.sin(angle)]);
    }
    return points;
  }
  function fanSvg(n){
    const points=polygonVertices(n),pointString=points.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
    const slices=[];
    for(let i=1;i<=n-2;i++)slices.push('<polygon points="'+[points[0],points[i],points[i+1]].map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')+'" class="'+(i%2?'polygon-slice-a':'polygon-slice-b')+'" opacity=".72"/>');
    const diagonals=L.fanDiagonals(n,0).map(pair=>'<line x1="'+points[pair[0]][0].toFixed(1)+'" y1="'+points[pair[0]][1].toFixed(1)+'" x2="'+points[pair[1]][0].toFixed(1)+'" y2="'+points[pair[1]][1].toFixed(1)+'" class="polygon-line"/>').join('');
    const marks=points.map((p,index)=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="6" class="polygon-vertex '+(index===0?'fixed':'')+'"/><text x="'+p[0].toFixed(1)+'" y="'+(p[1]+(p[1]<60?-12:22)).toFixed(1)+'" text-anchor="middle" fill="#284f4b" font-size="13" font-weight="750">V'+(index+1)+'</text>').join('');
    return '<svg viewBox="0 0 420 330" role="img" aria-labelledby="fan-title"><title id="fan-title">凸'+n+'边形从固定顶点V1作扇形切分，得到'+(n-2)+'个三角形</title>'+slices+'<polygon points="'+pointString+'" class="polygon-outline"/>'+diagonals+marks+'</svg>';
  }
  function updateFan(){
    const counts=L.countForSides(state.sideCount),wrap=host.querySelector('#fan-svg-wrap');
    if(wrap)wrap.innerHTML=fanSvg(state.sideCount);
    const fields={sides:counts.sides,diagonals:counts.fanDiagonals,triangles:counts.triangles,sum:counts.interiorSum+'°'};
    Object.entries(fields).forEach(([id,value])=>{const el=host.querySelector('#fan-'+id);if(el)el.textContent=String(value);});
    const out=host.querySelector('#side-count-out');if(out)out.textContent=state.sideCount+'边形';
    const observed=host.querySelector('#observed-sides');if(observed)observed.textContent=state.observedSides.length?state.observedSides.slice().sort((a,b)=>a-b).join('、'):'还没有主动移动滑杆';
  }
  function renderGeneralObserve(){
    const counts=L.countForSides(state.sideCount);
    const ready=state.observedSides.length>=3;
    const guess=ready?'<h3>先留下观察后的猜想</h3>'+choices(L.patternOptions,state.patternChoice,'选择边数增加时的变化规律','pattern')+reason('pattern','这些具体图支持了什么猜想？为什么现在还不能叫一般证明？',state.patternReason,state.patternUnsure,'先说观察到的变化，再提醒自己只看了有限个图。'):'<p class="polygon-first-record">先主动移动滑杆，查看至少3种不同边数。达到3种后，猜想选项才会出现。</p>';
    const body=proofGrowth(2)+'<p class="parallel-lead">把边数从3调到9，观察同一种切分怎样从三角形一路生长。先找变化规律，一般公式稍后再证明。</p><div class="polygon-stage"><figure class="polygon-figure"><div id="fan-svg-wrap">'+fanSvg(state.sideCount)+'</div><figcaption>当前只看一个具体图。颜色帮助数清三角形，不是一般证明。</figcaption></figure><div class="polygon-side-note"><h3>改变边数</h3><div class="polygon-rotation"><label for="side-count">边数 <output id="side-count-out">'+state.sideCount+'边形</output><input id="side-count" type="range" min="3" max="9" step="1" value="'+state.sideCount+'"></label></div><div class="polygon-counts"><div>边数<b id="fan-sides">'+counts.sides+'</b></div><div>从V1作对角线<b id="fan-diagonals">'+counts.fanDiagonals+'</b></div><div>三角形<b id="fan-triangles">'+counts.triangles+'</b></div><div>内角和<b id="fan-sum">'+counts.interiorSum+'°</b></div></div><p class="polygon-observed">主动观察过：<b id="observed-sides">'+(state.observedSides.length?state.observedSides.slice().sort((a,b)=>a-b).join('、'):'还没有主动移动滑杆')+'</b></p></div></div>'+guess+'<details class="parallel-help" data-help="相邻边数比较提示"><summary>不知道该比较什么</summary><p>从3边形开始，挑两个相邻的边数，只比较三栏具体数字各变化了多少。这里仍然是在找猜想，不是证明任意n。</p></details>';
    host.innerHTML=base('环节 3 / 先观察再猜想','边数增加时，三个数字怎样一起变？',body,'<button class="primary" id="pattern-submit">留下猜想，再看一般构造 →</button>');
    const slider=host.querySelector('#side-count');
    slider.oninput=event=>{
      const previous=state.observedSides.length;
      state.sideCount=Number(event.target.value);
      if(!state.observedSides.includes(state.sideCount))state.observedSides=[...state.observedSides,state.sideCount];
      save();
      if(previous<3&&state.observedSides.length>=3)render();else updateFan();
    };
    if(ready){bindSingle('pattern','patternChoice');bindReason('pattern','patternReason','patternUnsure');}
    bindHelp(2);
    host.querySelector('#pattern-submit').onclick=()=>{
      if(state.observedSides.length<3){message('先主动查看至少3种不同边数。');return;}
      if(!state.patternChoice){message('先选出你观察到的变化规律。');return;}
      const why=validReason(state.patternReason,state.patternUnsure);if(!why){message('再留下观察与猜想的关系；暂时说不清也可以如实勾选。');return;}
      const item=L.patternOptions.find(option=>option.id===state.patternChoice),correct=L.validPattern(state.patternChoice);
      log.note(2,'规律猜想'+(correct?'正确':'未通过')+'：'+item.text+'；孩子解释：'+why);
      if(!correct){corrective(2,'比较相邻边数','再选两个相邻边数，逐栏比较：边数只增加1时，对角线、三角形和内角和各增加多少？');return;}
      log.note(2,'主动查看'+state.observedSides.slice().sort((a,b)=>a-b).join('、')+'边形后留下变化猜想。课程说明：有限观察用于形成猜想，不能代替一般证明；孩子的原因解释按原话保留，未自动判分。');
      state.generalPhase='proof';save();render(true);
    };
  }

  function centerMethodSvg(step){
    const points=polygonVertices(6),pointString=points.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' '),center=[210,165];
    const rays=step>=1?points.map(p=>'<line x1="210" y1="165" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'" class="polygon-center-ray"/>').join(''):'';
    const ring=step>=2?'<circle cx="210" cy="165" r="31" class="polygon-center-ring"/><text x="210" y="171" text-anchor="middle" fill="#7a492d" font-size="18" font-weight="800">360°</text>':'';
    return '<svg viewBox="0 0 420 330" role="img" aria-labelledby="center-title"><title id="center-title">凸六边形内部一点法，'+(step===0?'尚未连接':step===1?'已连接中心到各顶点':'已连接各顶点并点亮中心一整圈360度')+'</title><polygon points="'+pointString+'" class="polygon-outline"/>'+rays+'<circle cx="'+center[0]+'" cy="'+center[1]+'" r="8" class="polygon-vertex fixed"/>'+ring+'<text x="224" y="156" fill="#284f4b" font-size="16" font-weight="750">O</text></svg>';
  }
  function boundaryFigures(){
    return '<div class="polygon-boundary-figures"><figure><svg viewBox="0 0 180 130" role="img" aria-label="边不相交、向内凹的五边形"><polygon points="18,18 160,18 92,65 160,112 18,112" class="polygon-mini-shape"/></svg><figcaption>图A：边不相交，有一个角向里凹</figcaption></figure><figure><svg viewBox="0 0 180 130" role="img" aria-label="边发生交叉的四边形"><polygon points="20,18 160,112 20,112 160,18" class="polygon-mini-shape"/></svg><figcaption>图B：两条边在中间相交</figcaption></figure></div>';
  }
  function renderGeneralProof(){
    const centerChoices=state.centerStep>=2?choices(L.centerOptions,state.centerChoice,'选择内部一点法减去360度的原因','center'):'<p class="polygon-first-record">先完成“连接顶点”和“点亮中心一整圈”两个动作，再判断为什么要减360°。</p>';
    const centerButton=state.centerStep===0?'<button type="button" class="secondary" id="center-next">① 连接 O 到各顶点</button>':state.centerStep===1?'<button type="button" class="secondary" id="center-next">② 点亮中心一整圈</button>':'<p class="polygon-center-done">✓ 已看见：n个三角形还包含中心一整圈360°</p>';
    const research='<details class="polygon-research" data-help="可选研究：另一种切法与公式边界" '+((state.centerStep>0||state.centerChoice||state.scopeChoice||state.challengeChecked)?'open':'')+'><summary>可选 · 数学家审查：另一种切法与公式边界</summary><p class="polygon-research-intro">想继续研究可以先展开；也可以直接提交一般证明。这里保留另一条思路和严谨边界，不作为过关条件。</p><div class="polygon-audits"><section class="polygon-audit"><h3>内部一点法</h3><p>在凸六边形内部放一点O。先连接，再观察 n×180° 里多算了什么。</p><figure class="polygon-figure polygon-center-figure">'+centerMethodSvg(state.centerStep)+'</figure>'+centerButton+centerChoices+'</section><section class="polygon-audit"><h3>公式适用于哪些图？</h3><p>先看边是否相交，再判断凸、凹和自交图形能否使用同一个结论与同一种证明。</p>'+boundaryFigures()+choices(L.scopeOptions,state.scopeChoice,'选择多边形内角和公式的适用边界','scope')+'</section></div><button type="button" class="secondary" id="challenge-check">检查研究员挑战</button><p class="polygon-challenge-message" id="challenge-message" role="status">'+(state.challengeChecked?'✓ 已审出另一种切法和公式边界。':'')+'</p></details>';
    const body=proofGrowth(2)+'<p class="parallel-lead">刚才的具体图支持了猜想。现在把同一个构造说到任意凸 n 边形：不是继续多看几个图，而是说明线为什么总能这样画、区域为什么总是三角形。</p><div class="polygon-proof-chain"><div><b>为什么是 n−3 条线？</b>从固定顶点出发，排除它自己和左右两个相邻顶点。因为多边形是凸的，这些对角线都落在图形内部；它们都从V1出发，除了共同端点V1外不会相交。<span class="polygon-arrow">→</span></div><div><b>为什么是 n−2 个三角形？</b>n−3条互不交叉的对角线从1个区域开始，每条再多分1块，共1＋(n−3)＝n−2块；按边界顺序看，每一块都由V1和一对相邻顶点围成三角形。<span class="polygon-arrow">→</span></div><div><b>怎样得到内角和？</b>各三角形无重叠、无空隙地覆盖原图；每个180°，所以乘三角形个数。</div></div><h3>选出一般关系</h3>'+choices(L.generalOptions,state.generalChoice,'选择一般的凸n边形计数关系','general')+reason('general','把“未知化为已知”说成一句完整理由。',state.generalExplain,state.generalUnsure,'我没有重新测角，而是从固定顶点画……，把n边形变成……，所以……')+'<details class="parallel-help" data-help="n边形计数提示"><summary>计数卡住了，给我一点提示</summary><p>从V1出发时，V1自己和它左右两个邻点不能成为对角线终点，所以从n个顶点里排除3个。每加一条不交叉的对角线，原来的一个区域就多分出一块。</p></details>'+research;
    host.innerHTML=base('环节 3 / 完成一般证明','为什么任意凸 n 边形都成立？',body,'<button class="primary" id="general-finish">提交一般证明 →</button>');
    const resetChallenge=()=>{state.challengeChecked=false;const output=host.querySelector('#challenge-message');if(output)output.textContent='';};
    bindSingle('general','generalChoice');if(state.centerStep>=2)bindSingle('center','centerChoice',resetChallenge);bindSingle('scope','scopeChoice',resetChallenge);
    bindReason('general','generalExplain','generalUnsure');bindHelp(2);
    const centerNext=host.querySelector('#center-next');if(centerNext)centerNext.onclick=()=>{state.centerStep=Math.min(2,state.centerStep+1);save();render();};
    host.querySelector('#challenge-check').onclick=()=>{
      const output=host.querySelector('#challenge-message');
      if(state.centerStep<2||!state.centerChoice||!state.scopeChoice){state.challengeChecked=false;save();output.textContent='先完成中心点的两个动作，并回答两项判断。';return;}
      if(!L.validResearchChallenge(state.centerChoice,state.scopeChoice)){
        state.challengeChecked=false;save();
        const feedback=state.centerChoice!=='full-turn'?'再看中心O周围：这里多算的是首尾相接的一整圈360°。':'凹的简单多边形仍满足公式，但扇形切法未必直接可用；自交图形要另作定义。';
        log.help(2,'可选挑战反馈：'+feedback);output.textContent=feedback;return;
      }
      if(!state.challengeChecked)log.note(2,'可选挑战：亲手连接内部点到各顶点并点亮中心一整圈，审出应减360°；区分凹简单多边形的公式与扇形证明、自交图形的范围。');
      state.challengeChecked=true;save();
      output.textContent='✓ 审查通过：另一种切法也得到同一结论，但证明过程和适用边界必须说清。';
    };
    host.querySelector('#general-finish').onclick=()=>{
      if(!state.generalChoice){message('先选出一般的计数关系。');return;}
      const why=validReason(state.generalExplain,state.generalUnsure);if(!why){message('再把n−3、n−2和180°连成一句；暂时说不清也可以如实勾选。');return;}
      const answer='一般关系：'+L.generalOptions.find(item=>item.id===state.generalChoice).text;
      const correct=L.validMainProof(state.generalChoice);
      log.submit(2,answer,correct,why);
      if(!correct){
        corrective(2,'对角线数与三角形数','从固定顶点排除自己和左右两个邻点，所以有n−3条对角线；这些线形成n−2个三角形。两种数量相差1。');
        return;
      }
      log.note(2,'页面呈现了n−3条对角线形成n−2个三角形的一般构造；孩子选择的一般计数关系正确，化归解释按原话保留、未自动判分。');
      const supported=log.records[2].helps.some(item=>item.phase!=='完成后回看');
      log.finish(2,state.generalUnsure?'一般计数关系选择正确；化归理由暂时说不清':supported?'一般计数关系选择正确；在提示或反馈后提交化归解释，解释内容未自动判分':'一般计数关系选择正确；已提交化归解释，解释内容未自动判分');render(true);
    };
  }

  function finish(){
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">G3 · 多边形内角和证明收好</p><h2 tabindex="-1">360°不是四边形的“长相”，而是两个三角形的总和。</h2>'+proofGrowth(3)+'<p class="parallel-takeaway"><b>四边形：</b>一条内部对角线 → 2个无重叠、无空隙的三角形 → 360°。<br><b>五边形：</b>从同一顶点画2条对角线 → 3个三角形 → 540°。<br><b>凸n边形：</b>从固定顶点画n−3条对角线 → n−2个三角形 → <b>(n−2)×180°</b>。</p><div class="polygon-method-card"><h3>真正值得带走的，不只是一个公式</h3><div class="polygon-method-steps"><div><b>已有工具</b>三角形内角和180°</div><div><b>关键构造</b>从一个顶点画对角线</div><div><b>化归</b>把陌生多边形变成三角形</div><div><b>一般化</b>说明任意凸n边形都成立</div></div><p>数学不只给出答案，还说明它为什么必然如此；一个证明，又能成为下一个证明的起点。</p></div><details class="polygon-research"><summary>可选回看 · 另一种切法与公式边界</summary><div class="polygon-audits"><section class="polygon-audit"><h3>内部一点法</h3><p>n个三角形共有n×180°，其中中心周围一整圈360°不属于原多边形内角，所以要减掉它。</p></section><section class="polygon-audit"><h3>边界要说清</h3><p>凹简单多边形也符合公式，但固定顶点扇形切法未必直接可用；自交图形不在本课范围。</p></section></div></details><p>页面记录的是本次首答、画线、提示、计数与解释；完成页面不等于已经长期掌握。下次遇到陌生多边形，能自己决定怎样三角剖分，才是新的独立调用。</p>'+log.html()+'<div class="parallel-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school">回到 TY敏捷课堂</a><button class="secondary" id="polygon360-restart">重新练一轮（保留旧记录）</button></div></section>';
    host.querySelector('#polygon360-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,quadFacts:[],pentagonLines:[],fanPicks:[],observedSides:[]};save();render(true);};
  }
  function render(focus=false){
    progress();
    if(log.index>=L.tasks.length)finish();
    else if(log.index===0)state.quadPhase==='draw'?renderQuadrilateralDraw():renderQuadrilateralChoice();
    else if(log.index===1)renderPentagon();
    else if(state.generalPhase==='proof')renderGeneralProof();
    else if(state.generalPhase==='observe')renderGeneralObserve();
    else renderGeneralConstruct();
    progress();if(focus)focusCard();
  }
  const sources=document.querySelector('#polygon360-sources');
  sources?.querySelector('summary')?.addEventListener('click',()=>{if(!sources.open)log.help(Math.min(log.index,L.tasks.length-1),'展开课程边界与来源');});
  render();
})();
