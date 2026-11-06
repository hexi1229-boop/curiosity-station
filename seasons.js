'use strict';
(function(){
  const host=document.querySelector('#seasons-task'),sources=document.querySelector('#seasons-sources');
  const L=window.SeasonsLesson,F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'seasons.html']);
  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  function loadState(){
    const next=L.sanitizeState(log.checkpoint.seasons||{});
    next.coldSaved=next.coldSaved&&!!log.records[0]?.first;
    next.evidenceDone=next.evidenceDone&&!!log.records[0]?.done;
    next.labAttempted=next.labAttempted&&!!log.records[1]?.first;
    next.planetSaved=next.planetSaved&&!!log.records[2]?.first;
    next.reviewAttempted=next.reviewAttempted&&next.planetSaved;
    return next;
  }
  let state=loadState();
  function save(){log.point({seasons:state});}
  function progress(){
    document.querySelectorAll('.seasons-nav li').forEach((item,index)=>{
      item.classList.toggle('current',index===log.index);item.classList.toggle('done',index<log.index);
      item.setAttribute('aria-label',item.textContent.trim()+'；'+(index<log.index?'已完成':index===log.index?'当前环节':'待完成'));
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){requestAnimationFrame(()=>host.querySelector('h2')?.focus({preventScroll:true}));}
  function base(kicker,title,body,actions=''){
    return '<section class="persuade-card seasons-card"><p class="persuade-label">'+esc(kicker)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<div class="seasons-feedback" role="status" aria-live="polite"></div><div class="seasons-message" role="status" aria-live="polite"></div>'+actions+'</section>';
  }
  function message(value,error=false){const node=host.querySelector('.seasons-message');if(node){node.textContent=value;node.dataset.error=String(error);}}
  function feedback(value,status=''){const node=host.querySelector('.seasons-feedback');if(node){node.textContent=value;node.dataset.state=status;}}
  function options(items,current,attribute,label){return '<div class="seasons-options" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" data-'+attribute+'="'+esc(item.id)+'" aria-pressed="'+String(current===item.id)+'">'+esc(item.text)+'</button>').join('')+'</div>';}
  function bindOptions(attribute,key,onChange=()=>{}){
    host.querySelectorAll('[data-'+attribute+']').forEach(button=>button.addEventListener('click',()=>{
      state[key]=button.getAttribute('data-'+attribute)||'';
      host.querySelectorAll('[data-'+attribute+']').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      save();onChange(button);
    }));
  }
  function bindText(id,key){const node=host.querySelector('#'+id);if(!node)return;const update=()=>{state[key]=node.value;save();};node.addEventListener('input',update);node.addEventListener('change',update);}
  function label(items,id){return items.find(item=>item.id===id)?.text||id;}

  function renderCold(){
    const body='<p class="seasons-lead">先不看地球仪，也不公布答案。这里的关键不是猜中，而是留下一个之后可以被证据检验的原因。</p><section class="scenario-card"><b>同一个七月</b><p>天津进入夏季，悉尼却在过冬。小航说：“天津更热，是因为这时地球离太阳更近。”</p></section><h3>你现在更倾向哪一种原因？</h3>'+options(L.causes,state.coldCause,'cold-cause','四季的第一猜想')+'<label class="seasons-field"><b>为什么？</b><textarea id="cold-explanation" maxlength="900" rows="4" placeholder="把你现在的理由说清；暂时不确定也可以说明卡在哪里。">'+esc(state.coldExplanation)+'</textarea></label>';
    host.innerHTML=base('现场一 · 不先泄题','同一个七月，为什么南北半球季节相反？',body,'<button type="button" class="primary" id="cold-submit">封存第一次猜想 →</button>');
    bindOptions('cold-cause','coldCause');bindText('cold-explanation','coldExplanation');
    host.querySelector('#cold-submit').addEventListener('click',()=>{
      if(!state.coldCause){message('先留下一个最接近的猜想；暂时不确定也可以。',true);return;}
      if(!L.meaningful(state.coldExplanation)){message('请用一句完整的话留下理由。',true);return;}
      log.submit(0,'首答：'+label(L.causes,state.coldCause),null,state.coldExplanation);
      log.note(0,'首答前未展示近日点、远日点、南北半球反例或四季成因。开放解释未自动判分。');
      state.coldSaved=true;save();render(true);
    });
  }
  function evidenceCards(){
    return '<div class="evidence-grid">'+L.evidence.map((item,index)=>'<button type="button" class="evidence-card" data-evidence="'+esc(item.id)+'" aria-pressed="'+String(state.evidenceViewed.includes(item.id))+'"><span>证据 '+(index+1)+'</span><strong>'+esc(item.text)+'</strong></button>').join('')+'</div>';
  }
  function renderEvidence(){
    const first=log.records[0].first;
    const body='<p class="seasons-lead">现在才打开证据。点开三张卡，先问每条证据能排除什么，再决定是否修改。</p><div class="first-capture"><b>第一次猜想</b><p>'+esc(first?.answer||'')+'</p><b>第一次理由</b><p>'+esc(first?.explanation||'')+'</p></div>'+evidenceCards()+'<h3>证据放在一起，哪个模型更能解释？</h3>'+options(L.causes,state.revisedCause,'revised-cause','证据复核后的原因')+'<label class="seasons-field"><b>你保留还是修改？至少用一条反常证据说明原因。</b><textarea id="evidence-explanation" maxlength="900" rows="4">'+esc(state.evidenceExplanation)+'</textarea></label>';
    host.innerHTML=base('首答已封存 · 反例检查','离太阳近，真的能解释南北半球吗？',body,'<button type="button" class="primary" id="evidence-submit">带着新模型进实验室 →</button>');
    host.querySelectorAll('[data-evidence]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.evidence;if(!state.evidenceViewed.includes(id))state.evidenceViewed=[...state.evidenceViewed,id];
      button.setAttribute('aria-pressed','true');save();
    }));
    bindOptions('revised-cause','revisedCause');bindText('evidence-explanation','evidenceExplanation');
    host.querySelector('#evidence-submit').addEventListener('click',()=>{
      if(!state.revisedCause){message('先选择经证据复核后的模型。',true);return;}
      if(!L.meaningful(state.evidenceExplanation)){message('请引用至少一条反常证据说清原因。',true);return;}
      const grade=L.gradeEvidence(state);log.submit(0,'复核：'+label(L.causes,state.revisedCause),null,state.evidenceExplanation);
      if(!grade.evidence||!grade.cause){log.help(0,'自动反馈：同时检查南北半球反例与一月／七月的日地距离');feedback(!grade.evidence?'还有关键证据没有亲手打开。':'再问一句：哪一个模型能同时解释“南北相反”和“一月更近”？','retry');save();return;}
      state.evidenceDone=true;log.note(0,'已用南北半球与近日点／远日点证据排除距离主因；开放解释只留存。');log.finish(0,'首答与证据复核均已保留');save();render(true);
    });
  }
  function axisMarkup(month,tilt){
    const m=L.months[month],x=m.x,y=m.y,zero=tilt==='zero',northX=zero?x:x-18,northY=y-42,southX=zero?x:x+18,southY=y+42,equatorDx=zero?32:31.3,equatorDy=zero?0:13.4;
    const rayStart=x>240?275:205,rayEnd=x>240?x-28:x+28,direction=x>240?1:-1;
    return '<svg id="orbit-svg" viewBox="0 0 480 340" role="img" aria-label="'+esc(m.name)+'，'+(zero?'地轴倾角0度':'地轴倾角23.4度')+'的地球公转光照模型"><ellipse class="orbit-line" cx="240" cy="170" rx="160" ry="112"/><circle class="sun-core" cx="240" cy="170" r="28"/><text class="sun-label" x="240" y="216" text-anchor="middle">太阳</text>'+[-20,0,20].map(offset=>'<line class="sun-ray" x1="'+rayStart+'" y1="'+(y+offset)+'" x2="'+rayEnd+'" y2="'+(y+offset)+'"/>').join('')+'<circle class="earth-body" cx="'+x+'" cy="'+y+'" r="34"/><line class="earth-equator" x1="'+(x-equatorDx)+'" y1="'+(y+equatorDy)+'" x2="'+(x+equatorDx)+'" y2="'+(y-equatorDy)+'"/><line class="earth-axis" x1="'+southX+'" y1="'+southY+'" x2="'+northX+'" y2="'+northY+'"/><text class="axis-label" x="'+(northX+direction*2)+'" y="'+(northY-7)+'" text-anchor="middle">N</text><text class="earth-label" x="'+x+'" y="'+(y+58)+'" text-anchor="middle">'+esc(m.short)+'</text><text class="axis-label" x="240" y="31" text-anchor="middle">地轴方向在一年尺度上近似保持平行</text></svg>';
  }
  function spinZone(hour){if(hour===0||hour===24)return '正午附近';if(hour===6)return '日落附近';if(hour===12)return '午夜附近';if(hour===18)return '日出附近';return hour<6?'下午':hour<12?'夜晚':hour<18?'后半夜':'上午';}
  function labMarkup(){
    const observation=L.labObservation(state),spread=state.tilt==='zero'?'steady':state.month==='june'?'compact':'wide';
    return '<section class="orbit-lab" aria-label="地球运动实验台"><div class="orbit-stage"><div id="orbit-picture">'+axisMarkup(state.month,state.tilt)+'</div><aside class="lab-readout" aria-live="polite"><h3>天津约39°N · 相对观察</h3><div class="metric"><span>北半球朝向</span><b id="metric-north">'+esc(observation.north)+'</b></div><div class="metric"><span>正午太阳高度</span><b id="metric-altitude">'+esc(observation.altitude)+'</b></div><div class="metric"><span>白昼长度</span><b id="metric-daylight">'+esc(observation.daylight)+'</b></div><div class="metric"><span>太阳直射点</span><b id="metric-direct">'+esc(observation.direct)+'</b></div><div class="beam-demo" id="beam-demo" data-spread="'+spread+'" aria-hidden="true"></div><p class="lab-note">同样一束光，入射越倾斜，铺开的面积越大；这里只看相对关系，不把示意值当天气预报。</p></aside></div><div class="lab-controls"><section class="control-panel"><h3>① 地球走到哪里？</h3><div class="control-row" role="group" aria-label="选择公转月份"><button type="button" data-month="june" aria-pressed="'+String(state.month==='june')+'">六月</button><button type="button" data-month="december" aria-pressed="'+String(state.month==='december')+'">十二月</button></div></section><section class="control-panel"><h3>② 地轴倾斜吗？</h3><div class="control-row" role="group" aria-label="选择地轴倾角"><button type="button" data-tilt="tilted" aria-pressed="'+String(state.tilt==='tilted')+'">23.4°</button><button type="button" data-tilt="zero" aria-pressed="'+String(state.tilt==='zero')+'">0°</button></div></section><section class="control-panel spin-panel"><h3>③ 同一位置，让天津转过一天</h3><label for="spin-hour"><span>从正午起经过</span><output id="spin-output">'+state.spinHour+' 小时</output></label><input id="spin-hour" type="range" min="0" max="24" step="6" value="'+state.spinHour+'" aria-valuetext="从正午起经过'+state.spinHour+'小时"><div class="spin-presets" role="group" aria-label="选择自转小时">'+[0,6,12,18,24].map(hour=>'<button type="button" data-hour="'+hour+'" aria-pressed="'+String(state.spinHour===hour)+'">'+hour+'小时</button>').join('')+'</div><p class="spin-status" id="spin-status" role="status">天津：'+spinZone(state.spinHour)+'。月份和全年光照条件没有被这次自转按钮改变。</p></section></div><div class="lab-gates"><span data-done="'+String(['june','december'].every(id=>state.monthsViewed.includes(id)))+'">六月／十二月</span><span data-done="'+String(['tilted','zero'].every(id=>state.tiltsViewed.includes(id)))+'">23.4°／0°</span><span data-done="'+String(state.spinCompleted)+'">转完一天</span></div></section>';
  }
  function updateLab(){
    const observation=L.labObservation(state),picture=host.querySelector('#orbit-picture');if(!picture)return;
    picture.innerHTML=axisMarkup(state.month,state.tilt);
    host.querySelector('#metric-north').textContent=observation.north;host.querySelector('#metric-altitude').textContent=observation.altitude;host.querySelector('#metric-daylight').textContent=observation.daylight;host.querySelector('#metric-direct').textContent=observation.direct;
    host.querySelector('#beam-demo').dataset.spread=state.tilt==='zero'?'steady':state.month==='june'?'compact':'wide';
    host.querySelectorAll('[data-month]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.month===state.month)));host.querySelectorAll('[data-tilt]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.tilt===state.tilt)));
    host.querySelectorAll('.lab-gates span')[0].dataset.done=String(['june','december'].every(id=>state.monthsViewed.includes(id)));host.querySelectorAll('.lab-gates span')[1].dataset.done=String(['tilted','zero'].every(id=>state.tiltsViewed.includes(id)));host.querySelectorAll('.lab-gates span')[2].dataset.done=String(state.spinCompleted);
  }
  function bindLab(){
    host.querySelectorAll('[data-month]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.month;state.month=id;if(!state.monthsViewed.includes(id))state.monthsViewed=[...state.monthsViewed,id];save();updateLab();button.focus({preventScroll:true});}));
    host.querySelectorAll('[data-tilt]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.tilt;state.tilt=id;if(!state.tiltsViewed.includes(id))state.tiltsViewed=[...state.tiltsViewed,id];save();updateLab();button.focus({preventScroll:true});}));
    const slider=host.querySelector('#spin-hour');
    function setHour(hour){state.spinHour=hour;if(hour===24&&!state.spinCompleted)state.spinCompleted=true;save();slider.value=hour;slider.setAttribute('aria-valuetext','从正午起经过'+hour+'小时');host.querySelector('#spin-output').textContent=hour+' 小时';host.querySelector('#spin-status').textContent='天津：'+spinZone(hour)+'。月份和全年光照条件没有被这次自转按钮改变。';host.querySelectorAll('[data-hour]').forEach(item=>item.setAttribute('aria-pressed',String(Number(item.dataset.hour)===hour)));host.querySelectorAll('.lab-gates span')[2].dataset.done=String(state.spinCompleted);}
    slider.addEventListener('input',()=>setHour(Number(slider.value)));host.querySelectorAll('[data-hour]').forEach(button=>button.addEventListener('click',()=>{setHour(Number(button.dataset.hour));button.focus({preventScroll:true});}));
  }
  function renderLab(){
    const grade=L.gradeLab(state);
    const body='<p class="seasons-lead">实验台一次只改一个条件。必须亲手比较两个公转位置、两种倾角，并让天津随地球转完一天。</p>'+labMarkup()+'<h3>哪一条因果链与刚才的操作一致？</h3>'+options(L.labClaims,state.labClaim,'lab-claim','地球运动因果链')+'<label class="seasons-field"><b>把你的操作和结论绑在一起</b><textarea id="lab-explanation" maxlength="900" rows="4" placeholder="我把……从……调到……，看到……，所以……">'+esc(state.labExplanation)+'</textarea></label>';
    host.innerHTML=base('现场二 · 控制变量','一天负责昼夜，一年怎样改变光照？',body,'<button type="button" class="primary" id="lab-submit">检查我的实验 →</button>');
    bindLab();bindOptions('lab-claim','labClaim');bindText('lab-explanation','labExplanation');
    host.querySelector('#lab-submit').addEventListener('click',()=>{
      if(!state.labClaim||!L.meaningful(state.labExplanation)){message('先选择因果链，并用一句话说明你实际改了什么、看到了什么。',true);return;}
      const result=L.gradeLab(state);state.labAttempted=true;log.submit(1,'实验结论：'+label(L.labClaims,state.labClaim),null,state.labExplanation);
      if(!Object.values(result).every(Boolean)){log.help(1,'自动反馈：完成六月／十二月、23.4°／0°和一整天的对照');const missing=[];if(!result.months)missing.push('比较六月和十二月');if(!result.tilts)missing.push('切换23.4°和0°');if(!result.spin)missing.push('转完一天');if(!result.claim)missing.push('重新检查自转与四季的分工');feedback('还需要：'+missing.join('；')+'。','retry');save();return;}
      log.note(1,'已分别改变公转位置、地轴倾角和一天内自转；开放解释未自动判分。');log.finish(1,'客观操作链已完成，不等于长期掌握');save();render(true);
    });
    if(state.labAttempted){if(Object.values(grade).every(Boolean))feedback('操作链完整：自转改变昼夜位置；倾角与公转共同改变全年光照。','ok');}
  }
  function planetCard(){return '<section class="planet-card"><h3>澄星档案</h3><div class="planet-specs"><span>自转一周 20 小时</span><span>公转一周 400 天</span><span>地轴倾角 0°</span><span>近圆轨道</span></div><p>同学判断：“它既会自转又会公转，所以一定像地球一样有明显四季。”</p></section>';}
  function renderTransferCold(){
    const body='<p class="seasons-lead">换了行星、周期和信息呈现方式。这里没有实验台，也不先给提示；请只用题目中的条件推理。</p>'+planetCard()+'<h3>同学的结论成立吗？</h3>'+options(L.planetClaims,state.planetClaim,'planet-claim','澄星首答结论')+'<h3>澄星会有昼夜吗？</h3>'+options(L.yesNo,state.planetDaynight,'planet-daynight','澄星昼夜首答')+'<h3>同一纬度会出现地球式明显四季光照变化吗？</h3>'+options(L.yesNo,state.planetSeasons,'planet-seasons','澄星四季首答')+'<label class="seasons-field"><b>写下你的推理</b><textarea id="planet-explanation" maxlength="900" rows="4">'+esc(state.planetExplanation)+'</textarea></label>';
    host.innerHTML=base('现场三 · 独立迁移','会公转，就一定有四季吗？',body,'<button type="button" class="primary" id="planet-submit">封存澄星首答 →</button>');
    bindOptions('planet-claim','planetClaim');bindOptions('planet-daynight','planetDaynight');bindOptions('planet-seasons','planetSeasons');bindText('planet-explanation','planetExplanation');
    host.querySelector('#planet-submit').addEventListener('click',()=>{
      if(!state.planetClaim||!state.planetDaynight||!state.planetSeasons){message('请完成结论、昼夜和季节三个判断。',true);return;}
      if(!L.meaningful(state.planetExplanation)){message('请用一句完整的话说明为什么。',true);return;}
      log.submit(2,'澄星首答：'+label(L.planetClaims,state.planetClaim)+'；昼夜：'+label(L.yesNo,state.planetDaynight)+'；明显四季：'+label(L.yesNo,state.planetSeasons),null,state.planetExplanation);
      log.note(2,'迁移首答前未显示提示、拆解问题或答案；开放解释未自动判分。');state.planetSaved=true;state.reviewClaim=state.planetClaim;state.reviewDaynight=state.planetDaynight;state.reviewSeasons=state.planetSeasons;state.reviewExplanation=state.planetExplanation;save();render(true);
    });
  }
  function renderTransferReview(){
    const first=log.records[2].first,grade=L.gradeTransfer(state);
    const hint=state.hintUsed?'<div class="seasons-help"><p>把两个问题分开：自转能否让地点进入昼夜？零倾角时，同一纬度一年中的太阳高度和白昼长度还会不会像地球一样强烈改变？</p></div>':'';
    const body='<p class="seasons-lead">首答已经保留。现在可以选择是否看一条拆解提示，再完成最终证据链。</p><div class="first-capture"><b>澄星第一次判断</b><p>'+esc(first?.answer||'')+'</p><b>第一次解释</b><p>'+esc(first?.explanation||'')+'</p></div>'+planetCard()+'<button type="button" class="secondary" id="planet-hint"'+(state.hintUsed?' disabled':'')+'>'+(state.hintUsed?'提示已打开':'需要时再看一条提示')+'</button>'+hint+'<h3>复核：同学的结论成立吗？</h3>'+options(L.planetClaims,state.reviewClaim,'review-claim','澄星复核结论')+'<h3>分别判断昼夜与明显四季</h3><div class="review-grid"><section class="review-panel"><h3>昼夜</h3>'+options(L.yesNo,state.reviewDaynight,'review-daynight','澄星昼夜复核')+'</section><section class="review-panel"><h3>地球式明显四季</h3>'+options(L.yesNo,state.reviewSeasons,'review-seasons','澄星四季复核')+'</section></div><h3>哪条理由没有越过题目信息？</h3>'+options(L.planetReasons,state.reviewReason,'review-reason','澄星复核理由')+'<label class="seasons-field"><b>写下复核后的解释</b><textarea id="review-explanation" maxlength="900" rows="4">'+esc(state.reviewExplanation)+'</textarea></label>'+options([{id:'keep',text:'我坚持首答，并补强了依据'},{id:'change',text:'我修改首答，因为发现了遗漏'}],state.revisionDecision,'decision','坚持或修改');
    host.innerHTML=base('迁移复核 · 首答不会覆盖','把“有昼夜”和“有四季”拆成两个问题',body,'<button type="button" class="primary" id="review-submit">收好本次证据链 →</button>');
    host.querySelector('#planet-hint').addEventListener('click',()=>{state.hintUsed=true;log.help(2,'澄星迁移提示：把自转与倾角造成的变化分开');save();render(true);});
    bindOptions('review-claim','reviewClaim');bindOptions('review-daynight','reviewDaynight');bindOptions('review-seasons','reviewSeasons');bindOptions('review-reason','reviewReason');bindOptions('decision','revisionDecision');bindText('review-explanation','reviewExplanation');
    host.querySelector('#review-submit').addEventListener('click',()=>{
      if(!state.reviewClaim||!state.reviewDaynight||!state.reviewSeasons||!state.reviewReason||!state.revisionDecision){message('请完成复核结论、昼夜、四季、理由和坚持／修改。',true);return;}
      if(!L.meaningful(state.reviewExplanation)){message('请用一句完整的话留下复核后的推理。',true);return;}
      const result=L.gradeTransfer(state);state.reviewAttempted=true;log.submit(2,'澄星复核：'+label(L.planetClaims,state.reviewClaim)+'；昼夜：'+label(L.yesNo,state.reviewDaynight)+'；明显四季：'+label(L.yesNo,state.reviewSeasons)+'；理由：'+label(L.planetReasons,state.reviewReason),null,state.reviewExplanation);
      if(!Object.values(result).every(Boolean)){log.help(2,'自动反馈：分别检查自转带来的昼夜与零倾角下的全年光照');feedback('再检查：20小时自转能说明什么？0°倾角又让什么年度变化消失？','retry');save();return;}
      log.note(2,'已在零倾角新行星中区分昼夜与地球式季节光照变化；开放解释未自动判分。');log.finish(2,(state.hintUsed?'使用过迁移提示；':'未使用迁移提示；')+'本次迁移链成立，不等于长期掌握');save();render(true);
    });
    if(state.reviewAttempted){if(Object.values(grade).every(Boolean))feedback('迁移链成立：澄星有昼夜，但题设不足以推出地球式明显四季。','ok');else feedback('客观条件还没有全部对应上，再把自转和倾角分开检查。','retry');}
  }
  function renderComplete(){
    if(sources)sources.hidden=false;
    const body='<p class="seasons-lead">你没有背一句“四季由公转产生”，而是用反例和控制变量把两台时钟拆开了。</p><div class="review-grid"><section class="review-panel"><h3>一天的时钟</h3><p>自转让地点轮流进入昼夜，不会仅凭一天转动改变月份。</p></section><section class="review-panel"><h3>一年的时钟</h3><p>地轴倾斜与公转共同改变各半球一年中的太阳高度和白昼长度。</p></section></div><p>本次记录能说明孩子在地球和澄星两个模型中留下了怎样的首答、操作、提示和修订；不能据此认定地球运动已经长期掌握。后续还需换图、换纬度并间隔复测。</p><div class="batch-note"><b>跨学科批次：4 / 4，已收口。</b>还可以继续进入历史课，用多因素证据网调查春秋战国的大变化。</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><a class="secondary" href="springautumn.html">进入春秋战国调查</a><button type="button" class="secondary" id="seasons-restart">重新实验（保留旧记录）</button><a class="secondary" href="courses.html?group=school&amp;subject=地理">返回地理课程</a></div>';
    host.innerHTML=base('G-E01 · 本次先收好','四季不是距离猜谜，而是全年光照关系',body)+log.html();
    host.querySelector('#seasons-restart').addEventListener('click',()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});if(sources)sources.hidden=true;save();render(true);});
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length)renderComplete();
    else if(log.index===0)state.coldSaved?renderEvidence():renderCold();
    else if(log.index===1)renderLab();
    else state.planetSaved?renderTransferReview():renderTransferCold();
    progress();if(moveFocus)focusCard();
  }
  render();
})();
