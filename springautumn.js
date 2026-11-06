'use strict';
(function(){
  const host=document.querySelector('#springautumn-task');
  const sources=document.querySelector('#springautumn-sources');
  const L=window.SpringAutumnLesson,F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'springautumn.html']);
  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  function loadState(){
    const next=L.sanitizeState(log.checkpoint.springautumn||{});
    next.openingSaved=next.openingSaved&&!!log.records[0]?.first;
    next.transferSaved=next.transferSaved&&!!log.records[2]?.first;
    return next;
  }
  let state=loadState();
  function save(){log.point({springautumn:state});}
  function label(items,id){return items.find(item=>item.id===id)?.text||id||'';}
  function listLabels(items,ids){return ids.map(id=>label(items,id)).join(' / ');}
  function progress(){
    document.querySelectorAll('.sa-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',index<log.index);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){requestAnimationFrame(()=>host.querySelector('h2')?.focus({preventScroll:true}));}
  function message(value,error=false){const node=host.querySelector('.sa-message');if(node){node.textContent=value;node.dataset.error=String(error);}}
  function feedback(value,type=''){const node=host.querySelector('.sa-feedback');if(node){node.textContent=value;node.dataset.state=type;}}
  function card(kicker,title,body,actions=''){
    return '<section class="parallel-card sa-card"><p class="parallel-label">'+esc(kicker)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<div class="sa-feedback" role="status" aria-live="polite"></div><div class="sa-message" role="status" aria-live="polite"></div>'+actions+'</section>';
  }
  function options(items,current,attribute,labelText){
    return '<div class="sa-options" role="group" aria-label="'+esc(labelText)+'">'+items.map(item=>'<button type="button" data-'+attribute+'="'+esc(item.id)+'" aria-pressed="'+String(current===item.id)+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function bindOptions(attribute,key){
    host.querySelectorAll('[data-'+attribute+']').forEach(button=>button.addEventListener('click',()=>{
      state[key]=button.getAttribute('data-'+attribute)||'';
      host.querySelectorAll('[data-'+attribute+']').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      save();
    }));
  }
  function evidence(items,selected,attribute,labelText){
    return '<div class="sa-evidence" role="group" aria-label="'+esc(labelText)+'">'+items.map(item=>'<button type="button" data-'+attribute+'="'+esc(item.id)+'" aria-pressed="'+String(selected.includes(item.id))+'">'+esc(item.text||item.time+' · '+item.type+' · '+item.text)+'</button>').join('')+'</div>';
  }
  function transferEvidence(items,selected,attribute,labelText){
    return '<div class="sa-evidence" role="group" aria-label="'+esc(labelText)+'">'+items.map(item=>'<button type="button" data-'+attribute+'="'+esc(item.id)+'" aria-pressed="'+String(selected.includes(item.id))+'"><span><b>'+esc(item.time)+' · '+esc(item.type)+'</b><br>'+esc(item.text)+'</span></button>').join('')+'</div>';
  }
  function bindEvidence(attribute,key,max=2){
    host.querySelectorAll('[data-'+attribute+']').forEach(button=>button.addEventListener('click',()=>{
      const id=button.getAttribute('data-'+attribute)||'',active=state[key].includes(id);
      if(!active&&state[key].length>=max){message('最多选择 '+max+' 条证据。请留下最能支撑整段结论的材料。',true);return;}
      state[key]=active?state[key].filter(item=>item!==id):[...state[key],id];
      button.setAttribute('aria-pressed',String(!active));save();
    }));
  }
  function field(id,key,labelText,placeholder='不要只写结论，请说清两条线索之间的关系。'){
    return '<label class="sa-field"><b>'+esc(labelText)+'</b><textarea id="'+esc(id)+'" rows="4" maxlength="900" placeholder="'+esc(placeholder)+'">'+esc(state[key])+'</textarea></label>';
  }
  function bindField(id,key){
    const node=host.querySelector('#'+id);if(!node)return;
    const update=()=>{state[key]=node.value.slice(0,900);save();};node.addEventListener('input',update);node.addEventListener('change',update);
  }
  function bindHelp(index){
    host.querySelectorAll('details[data-help]').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)log.help(index,item.dataset.help);}));
  }
  function intel(){
    return '<div class="sa-intel">'+L.openingClues.map((item,index)=>'<article><b>情报 '+(index+1)+'</b><p>'+esc(item.text)+'</p></article>').join('')+'</div>';
  }
  function renderOpeningCold(){
    const body='<p class="sa-lead">把时间拨到公元前4世纪。国君收到四条情报，却不知道哪一条才是“大变化”的发动机。先不看证据说明，留下你此刻真正的判断。</p>'+intel()+
      '<h3>哪一种解释最稳妥？</h3>'+options(L.openingOptions,state.openingChoice,'opening-choice','变化原因首答')+
      '<h3>选四条情报中的两条作为依据</h3>'+evidence(L.openingClues,state.openingEvidence,'opening-evidence','首答证据')+
      field('opening-explanation','openingExplanation','它们为什么能支持你的判断？');
    host.innerHTML=card('现场一 · 冷判断','战争、铁器，还是一张更大的网？',body,'<button class="primary" id="opening-submit">封存第一次判断 →</button>');
    bindOptions('opening-choice','openingChoice');bindEvidence('opening-evidence','openingEvidence');bindField('opening-explanation','openingExplanation');
    host.querySelector('#opening-submit').addEventListener('click',()=>{
      if(!state.openingChoice){message('先选择一个当前判断；保留判断也可以。',true);return;}
      if(state.openingEvidence.length!==2){message('请留下两条情报作为依据。',true);return;}
      if(!L.meaningful(state.openingExplanation)){message('请写清两条线索怎样支持你的判断。',true);return;}
      log.submit(0,'首答：'+label(L.openingOptions,state.openingChoice)+'；依据：'+listLabels(L.openingClues,state.openingEvidence),null,state.openingExplanation);
      log.note(0,'首答前未显示四座证据台、可证明边界或课程结论。');
      state.openingSaved=true;state.reviewChoice=state.openingChoice;save();render(true);
    });
  }
  function stationCards(){
    return '<div class="sa-stations">'+L.stations.map(item=>{
      const open=state.stationViews.includes(item.id);
      return '<article class="sa-station"><button type="button" class="sa-station-toggle" data-station="'+esc(item.id)+'" aria-expanded="'+String(open)+'" aria-controls="station-'+esc(item.id)+'"><b>'+esc(item.title)+'</b><span>'+esc(item.category)+' · '+esc(item.time)+'</span></button><div class="sa-station-body" id="station-'+esc(item.id)+'" '+(open?'':'hidden')+'><p class="sa-station-meta"><span>'+esc(item.kind)+'</span><span>'+esc(item.time)+'</span></p><p>'+esc(item.fact)+'</p><div class="sa-boundaries"><div><b>它能支持</b>'+esc(item.can)+'</div><div><b>它不能证明</b>'+esc(item.cannot)+'</div></div></div></article>';
    }).join('')+'</div>';
  }
  function renderEvidenceReview(){
    const first=log.records[0].first,grade=L.gradeOpening(state);
    const body='<p class="sa-lead">第一次判断已经保留。现在逐座打开证据台：先看材料本身，再看它能走多远；一个器物不能替整个时代发言。</p><div class="sa-capture"><b>第一次判断</b><p>'+esc(first?.answer||'')+'</p><b>第一次解释</b><p>'+esc(first?.explanation||'')+'</p></div>'+stationCards()+
      '<p><b>已查看 '+state.stationViews.length+' / '+L.stations.length+' 座证据台。</b></p><h3>看完材料后，哪一种解释最稳妥？</h3>'+options(L.openingOptions,state.reviewChoice,'review-choice','复核后的变化解释')+
      field('review-explanation','reviewExplanation','你坚持还是修改首答？用至少两类证据说明。','例如：铁器提供……条件，各国竞争形成……压力，改革和工程又……')+
      (state.reviewAttempted?'<div class="sa-checks"><span data-ok="'+grade.stations+'">证据边界 · '+(grade.stations?'已看全':'未看全')+'</span><span data-ok="'+grade.claim+'">多因素结论 · '+(grade.claim?'成立':'再检查')+'</span></div>':'');
    host.innerHTML=card('首答已封存 · 证据台','一件材料，只支持一段有限的结论',body,'<button class="primary" id="review-submit">带着边界进入因果网 →</button>');
    host.querySelectorAll('[data-station]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.station;
      if(!state.stationViews.includes(id))state.stationViews=[...state.stationViews,id];
      save();render(false);requestAnimationFrame(()=>host.querySelector('[data-station="'+id+'"]')?.focus({preventScroll:true}));
    }));
    bindOptions('review-choice','reviewChoice');bindField('review-explanation','reviewExplanation');
    host.querySelector('#review-submit').addEventListener('click',()=>{
      if(state.stationViews.length!==L.stations.length){message('请先打开四座证据台；尤其要看“不能证明”这一栏。',true);return;}
      if(!state.reviewChoice){message('请留下复核后的判断。',true);return;}
      if(!L.meaningful(state.reviewExplanation)){message('请用至少两类证据解释你为何坚持或修改。',true);return;}
      const next=L.gradeOpening(state),correct=Object.values(next).every(Boolean);
      log.submit(0,'复核：'+label(L.openingOptions,state.reviewChoice),correct,state.reviewExplanation);state.reviewAttempted=true;
      if(!correct){log.help(0,'自动反馈：没有一件证据能单独解释全部变化');save();render(true);return;}
      log.note(0,'已查看四类材料的可证明与不可证明边界；开放解释未按关键词自动评分。');
      log.finish(0,(log.records[0].helps.length?'使用过自动反馈；':'未使用自动反馈；')+'能把单因果修订为多因素判断');save();render(true);
    });
    if(state.reviewAttempted)feedback(grade.claim?'结论范围已收住：战争、技术或个人都不能单独解释整个时代。':'再检查：哪一个选项没有把战争或铁器当作唯一发动机？',grade.claim?'ok':'retry');
  }
  function nodeText(id){return L.nodes.find(item=>item.id===id)?.text||id;}
  function relationText(id){return L.relations.find(item=>item.id===id)?.text||id;}
  function edgeSentence(edge){return nodeText(edge.from)+' —'+relationText(edge.relation)+'→ '+nodeText(edge.to);}
  function nodeGrid(){
    return '<div class="sa-node-grid" role="group" aria-label="因果网络节点">'+L.nodes.map(item=>'<button type="button" class="sa-node" data-node="'+esc(item.id)+'" data-category="'+esc(item.category)+'" aria-pressed="'+String(state.edgeFrom===item.id||state.edgeTo===item.id)+'"><b>'+esc(item.text)+'</b><small>'+esc(item.category)+'</small></button>').join('')+'</div>';
  }
  function edgeList(){
    return '<div class="sa-edge-list" aria-label="已经建立的关系"><div class="sa-edge example"><span><b>示例：</b>'+esc(edgeSentence(L.example))+'</span></div>'+state.edges.map((edge,index)=>{const invalid=state.networkAttempted&&!L.allowedEdgeKeys.has(L.edgeKey(edge));return '<div class="sa-edge'+(invalid?' invalid':'')+'"><span>'+esc(edgeSentence(edge))+(invalid?' <b>· 方向或关系词需调整</b>':'')+'</span><button type="button" data-remove-edge="'+index+'" aria-label="删除关系 '+esc(edgeSentence(edge))+'">×</button></div>';}).join('')+'</div>';
  }
  function gradeChecks(grade){
    const labels={validity:'关系方向',edges:'有效关系',categories:'跨类连接',boundary:'战争边界',claim:'结论范围',evidence:'跨期证据',gap:'时间跨度',relation:'多因素关系'};
    return '<div class="sa-checks">'+Object.entries(grade).map(([key,ok])=>'<span data-ok="'+ok+'">'+labels[key]+' · '+(ok?'已对上':'再检查')+'</span>').join('')+'</div>';
  }
  function renderNetwork(){
    const grade=L.gradeNetwork(state);
    const body='<p class="sa-lead">示例只搭第一条边：铁制工具为生产变化提供条件。接下来撤掉支架。每次先点起点、再点终点，最后选择最准确的关系词。</p><div class="sa-example"><b>示例：</b>铁制工具更广泛使用 <strong>—提供条件→</strong> 开发土地与生产能力变化。它只说“提供条件”，没有说“必然造成”。</div><section class="sa-network">'+nodeGrid()+
      '<div class="sa-connector"><p><b>起点</b>'+esc(state.edgeFrom?nodeText(state.edgeFrom):'还未选择')+'</p><p><b>终点</b>'+esc(state.edgeTo?nodeText(state.edgeTo):'还未选择')+'</p></div><h3>这两个节点是什么关系？</h3>'+options(L.relations,state.edgeRelation,'edge-relation','关系词')+
      '<div class="sa-add"><button type="button" class="primary" id="edge-add">加入因果网</button><button type="button" class="secondary" id="edge-clear">清空当前选择</button></div>'+edgeList()+'</section><h3>战争和变化的关系，哪一种说法没有越界？</h3>'+options(L.boundaryOptions,state.boundaryChoice,'boundary','战争与变化的边界')+
      field('network-explanation','networkExplanation','从你搭的网中选两条边，解释它们为什么不能压成“战争导致一切”。')+
      (state.networkAttempted?gradeChecks(grade)+'<details class="sa-help" data-help="因果网提示：至少连接三类力量"><summary>需要时再看一条提示</summary><p>检查有没有一条来自生产或工程、一条来自制度或竞争、一条来自思想。战争可以“形成压力”，却不能替其他节点完成工作。</p></details>':'');
    host.innerHTML=card('现场二 · 一个示例后撤架','把长变化搭成网，不压成一条直线',body,'<button class="primary" id="network-submit">检查我的因果网 →</button>');
    host.querySelectorAll('[data-node]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.node;
      if(!state.edgeFrom||state.edgeTo){state.edgeFrom=id;state.edgeTo='';state.edgeRelation='';}
      else if(state.edgeFrom===id){state.edgeFrom='';state.edgeTo='';state.edgeRelation='';}
      else state.edgeTo=id;
      save();render(false);requestAnimationFrame(()=>host.querySelector('[data-node="'+id+'"]')?.focus({preventScroll:true}));
    }));
    bindOptions('edge-relation','edgeRelation');bindOptions('boundary','boundaryChoice');bindField('network-explanation','networkExplanation');bindHelp(1);
    host.querySelector('#edge-clear').addEventListener('click',()=>{state.edgeFrom='';state.edgeTo='';state.edgeRelation='';save();render(true);});
    host.querySelector('#edge-add').addEventListener('click',()=>{
      if(!state.edgeFrom||!state.edgeTo||!state.edgeRelation){message('请先选起点、终点和关系词。',true);return;}
      if(state.edgeFrom===state.edgeTo){message('起点和终点不能是同一个节点。',true);return;}
      const edge={from:state.edgeFrom,to:state.edgeTo,relation:state.edgeRelation},key=L.edgeKey(edge);
      if(L.edgeKey(L.example)===key){message('这条示例已经在网里，请换一条关系。',true);return;}
      if(state.edges.some(item=>L.edgeKey(item)===key)){message('这条关系已经加入。',true);return;}
      state.edges=[...state.edges,edge];state.edgeFrom='';state.edgeTo='';state.edgeRelation='';save();render(false);requestAnimationFrame(()=>host.querySelector('[data-remove-edge="'+(state.edges.length-1)+'"]')?.focus({preventScroll:true}));
    });
    host.querySelectorAll('[data-remove-edge]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.removeEdge);state.edges=state.edges.filter((_,i)=>i!==index);save();render(false);requestAnimationFrame(()=>host.querySelector('#edge-add')?.focus({preventScroll:true}));}));
    host.querySelector('#network-submit').addEventListener('click',()=>{
      if(state.edges.length<3){message('请在示例之外至少再搭三条关系。',true);return;}
      if(!state.boundaryChoice){message('请判断战争在因果网中的位置。',true);return;}
      if(!L.meaningful(state.networkExplanation)){message('请用两条关系解释为什么不能压成单因果。',true);return;}
      const next=L.gradeNetwork(state),correct=Object.values(next).every(Boolean);
      log.submit(1,state.edges.map(edgeSentence).join('；')+'；战争边界：'+label(L.boundaryOptions,state.boundaryChoice),correct,state.networkExplanation);state.networkAttempted=true;
      if(!correct){log.help(1,'自动反馈：至少连接三类力量，并把战争放在“压力之一”的位置');save();render(true);return;}
      log.note(1,'已在示例之外建立至少三条有效关系，跨越至少三类力量；开放解释未按关键词自动评分。');log.finish(1,(log.records[1].helps.length?'使用过提示或反馈；':'未使用提示或反馈；')+'本次多因素网络成立');save();render(true);
    });
    if(state.networkAttempted)feedback(Object.values(grade).every(Boolean)?'这张网已经容纳生产、制度、工程或思想中的多类力量；战争只占其中一个位置。':'看检查标签：删掉不成立的箭头，再补上缺少的力量。',Object.values(grade).every(Boolean)?'ok':'retry');
  }
  function timeline(){
    return '<ol class="sa-timeline" aria-label="秦国长期变化时间线">'+L.transferFacts.map(item=>'<li><time>'+esc(item.time)+'</time><b>'+esc(item.text)+'</b><small>'+esc(item.type)+'</small></li>').join('')+'</ol>';
  }
  function claim(){return '<section class="sa-claim"><b>同学的判断</b><p>“商鞅一个人设计了一切，所以秦国马上就统一了。”</p></section>';}
  function renderTransferCold(){
    const body='<p class="sa-lead">把方法搬到一个国家。先只看时间线，不给提示：这四个节点能否支持“一个人、马上、全部”的说法？</p>'+timeline()+claim()+
      '<h3>这句话是否充分？</h3>'+options(L.transferClaims,state.transferClaim,'transfer-claim','秦国迁移首答')+
      '<h3>选两条不同年代的材料</h3>'+transferEvidence(L.transferFacts,state.transferEvidence,'transfer-evidence','秦国迁移首答证据')+
      field('transfer-explanation','transferExplanation','两条材料怎样支持或修正同学的结论？');
    host.innerHTML=card('现场三 · 独立迁移','一个人能在一瞬间改造国家吗？',body,'<button class="primary" id="transfer-submit">封存迁移首答 →</button>');
    bindOptions('transfer-claim','transferClaim');bindEvidence('transfer-evidence','transferEvidence');bindField('transfer-explanation','transferExplanation');
    host.querySelector('#transfer-submit').addEventListener('click',()=>{
      if(!state.transferClaim){message('先留下当前判断；暂不能判断也可以。',true);return;}
      if(state.transferEvidence.length!==2){message('请选择两条不同年代的材料。',true);return;}
      if(!L.meaningful(state.transferExplanation)){message('请解释材料怎样支持或修正结论。',true);return;}
      log.submit(2,'迁移首答：'+label(L.transferClaims,state.transferClaim)+'；证据：'+listLabels(L.transferFacts,state.transferEvidence),null,state.transferExplanation);
      log.note(2,'迁移首答前未显示时间差答案、提示或多因素结论。');
      state.transferSaved=true;state.reviewTransferClaim=state.transferClaim;state.reviewTransferEvidence=[...state.transferEvidence];state.reviewTransferExplanation=state.transferExplanation;save();render(true);
    });
  }
  function renderTransferReview(){
    const first=log.records[2].first,grade=L.gradeTransfer(state);
    const shownHints=state.hintLevel?'<div class="sa-help"><ol>'+L.hints.slice(0,state.hintLevel).map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol></div>':'';
    const hintButton=state.hintLevel<L.hints.length?'<button type="button" class="secondary" id="next-hint">查看提示 '+(state.hintLevel+1)+' / '+L.hints.length+'</button>':'';
    const body='<p class="sa-lead">首答已经保留。现在检查时间跨度和证据类型，再决定坚持还是修改。</p><div class="sa-capture"><b>迁移第一次判断</b><p>'+esc(first?.answer||'')+'</p><b>第一次解释</b><p>'+esc(first?.explanation||'')+'</p></div>'+timeline()+claim()+shownHints+'<div class="sa-add">'+hintButton+'</div><h3>复核：同学的结论是否充分？</h3>'+options(L.transferClaims,state.reviewTransferClaim,'review-transfer-claim','迁移复核判断')+
      '<h3>重新选两条跨时间、不同类型的证据</h3>'+transferEvidence(L.transferFacts,state.reviewTransferEvidence,'review-transfer-evidence','迁移复核证据')+
      '<h3>前344年到前221年，相隔约多少年？</h3>'+options(L.gapOptions,state.gapChoice,'gap','时间跨度')+
      '<h3>这些节点怎样共同解释秦国变化？</h3>'+options(L.transferRelations,state.transferRelation,'transfer-relation','秦国变化关系')+
      field('review-transfer-explanation','reviewTransferExplanation','写下复核后的解释：商鞅重要在哪里，结论又遗漏了什么？')+
      '<div class="sa-options" role="group" aria-label="坚持或修改首答"><button type="button" data-revision="keep" aria-pressed="'+String(state.revisionDecision==='keep')+'">我坚持首答，并补强了证据</button><button type="button" data-revision="change" aria-pressed="'+String(state.revisionDecision==='change')+'">我修改首答，因为发现了遗漏</button></div>'+
      (state.transferReviewAttempted?gradeChecks(grade):'');
    host.innerHTML=card('迁移复核 · 首答不会被覆盖','让一个多世纪重新展开',body,'<button class="primary" id="transfer-review-submit">收好这次历史解释 →</button>');
    bindOptions('review-transfer-claim','reviewTransferClaim');bindEvidence('review-transfer-evidence','reviewTransferEvidence');bindOptions('gap','gapChoice');bindOptions('transfer-relation','transferRelation');bindOptions('revision','revisionDecision');bindField('review-transfer-explanation','reviewTransferExplanation');
    host.querySelector('#next-hint')?.addEventListener('click',()=>{state.hintLevel=Math.min(L.hints.length,state.hintLevel+1);log.help(2,'迁移提示 '+state.hintLevel+'：'+L.hints[state.hintLevel-1]);save();render(true);});
    host.querySelector('#transfer-review-submit').addEventListener('click',()=>{
      if(!state.reviewTransferClaim||state.reviewTransferEvidence.length!==2||!state.gapChoice||!state.transferRelation){message('请完成复核判断、两条证据、时间跨度和关系。',true);return;}
      if(!state.revisionDecision||!L.meaningful(state.reviewTransferExplanation)){message('请说明坚持或修改，并写下复核后的解释。',true);return;}
      const next=L.gradeTransfer(state),correct=Object.values(next).every(Boolean);
      log.submit(2,'迁移复核：'+label(L.transferClaims,state.reviewTransferClaim)+'；证据：'+listLabels(L.transferFacts,state.reviewTransferEvidence)+'；相隔：'+label(L.gapOptions,state.gapChoice)+'；关系：'+label(L.transferRelations,state.transferRelation),correct,state.reviewTransferExplanation);state.transferReviewAttempted=true;
      if(!correct){log.help(2,'自动反馈：跨越商鞅时期与后来的工程／统一，区分证据类型并检查123年跨度');save();render(true);return;}
      log.note(2,'已使用跨时间、不同类型的证据审查单人单因果结论；开放解释未按关键词自动评分。');log.finish(2,(log.records[2].helps.length?'使用过提示或反馈；':'未使用提示或反馈；')+'本次迁移证据链成立，不等于长期掌握');save();render(true);
    });
    if(state.transferReviewAttempted)feedback(Object.values(grade).every(Boolean)?'时间重新展开了：商鞅是重要节点，不是跨越123年的唯一行动者。':'根据检查标签，找出缺少的是跨期证据、时间差，还是多因素关系。',Object.values(grade).every(Boolean)?'ok':'retry');
  }
  function renderComplete(){
    if(sources)sources.hidden=false;
    const first=log.records[0].first,transferFirst=log.records[2].first,transferLast=log.records[2].attempts.at(-1);
    const body='<p class="sa-lead">这次不是背“铁器、变法、百家争鸣”三个答案，而是让每份证据停在自己的边界，再把多种力量连接起来。</p><div class="sa-intel"><article><b>时代首答</b><p>'+esc(first?.answer||'未留下')+'</p></article><article><b>秦国迁移</b><p><strong>首次：</strong>'+esc(transferFirst?.answer||'未留下')+'</p><p><strong>复核：</strong>'+esc(transferLast?.answer||'未留下')+'</p></article></div><div class="sa-next"><b>当前跨学科批次：4 / 4，已收口。</b>后续会隔一段时间，用新的材料形式复测“单因果—多因素—证据边界”，不会用本次完成冒充长期掌握。</div><div class="sa-actions"><a class="primary" href="records.html">查看本次学习记录</a><button type="button" class="secondary" id="sa-restart">重新调查（保留旧记录）</button><a class="secondary" href="courses.html?group=school&amp;subject=历史">返回历史课程</a></div>';
    host.innerHTML=card('H08 · 本次先收好','战争只是压力之一，历史变化来自一张网',body)+log.html();
    host.querySelector('#sa-restart').addEventListener('click',()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});if(sources)sources.hidden=true;save();render(true);});
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length)renderComplete();
    else if(log.index===0)state.openingSaved?renderEvidenceReview():renderOpeningCold();
    else if(log.index===1)renderNetwork();
    else state.transferSaved?renderTransferReview():renderTransferCold();
    progress();if(moveFocus)focusCard();
  }
  render();
})();
