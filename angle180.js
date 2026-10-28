'use strict';
(function(){
  const host=document.querySelector('#angle-task');
  const L=window.Angle180Lesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="angle-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="angle-refresh">重新打开</button></section>';
    document.querySelector('#angle-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.unshift([L.id,L.title,'angle180.html']);

  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  const defaults={
    phase0:'initial',
    phase1:'initial',
    length:92,
    orientation:12,
    opening:52,
    actions:{length:false,orientation:false,opening:false},
    initialChoice:null,
    initialReason:'',
    initialUnsure:false,
    transferChoice:null,
    transferReason:'',
    transferUnsure:false,
    turn:0,
    reachedHalf:false,
    flatChoice:null,
    flatReason:'',
    flatUnsure:false,
    flatExplain:'',
    flatExplainUnsure:false,
    flatReview:false,
    proofOpening:58,
    observed:[],
    proofPicks:[],
    proofReason:'',
    proofUnsure:false,
    proofAttempted:false,
    proofReview:false
  };

  function numberIn(value,min,max,fallback){
    const number=Number(value);
    return Number.isFinite(number)&&number>=min&&number<=max?number:fallback;
  }
  function textValue(value,max=800){
    return typeof value==='string'?value.slice(0,max):'';
  }
  function choiceValue(value,max){
    return Number.isInteger(value)&&value>=0&&value<max?value:null;
  }
  function loadState(){
    const saved=log.checkpoint.angle180||{};
    const allowedProof=new Set(L.proofCards.map(card=>card.id));
    return {
      ...defaults,
      ...saved,
      phase0:saved.phase0==='lab'?'lab':'initial',
      phase1:saved.phase1==='turn'?'turn':'initial',
      length:numberIn(saved.length,55,135,defaults.length),
      orientation:numberIn(saved.orientation,-40,150,defaults.orientation),
      opening:numberIn(saved.opening,20,140,defaults.opening),
      actions:{
        length:!!saved.actions?.length,
        orientation:!!saved.actions?.orientation,
        opening:!!saved.actions?.opening
      },
      initialChoice:choiceValue(saved.initialChoice,L.angleOptions.length),
      initialReason:textValue(saved.initialReason),
      initialUnsure:!!saved.initialUnsure,
      transferChoice:choiceValue(saved.transferChoice,L.transferOptions.length),
      transferReason:textValue(saved.transferReason),
      transferUnsure:!!saved.transferUnsure,
      turn:numberIn(saved.turn,0,360,0),
      reachedHalf:!!saved.reachedHalf,
      flatChoice:choiceValue(saved.flatChoice,L.flatOptions.length),
      flatReason:textValue(saved.flatReason),
      flatUnsure:!!saved.flatUnsure,
      flatExplain:textValue(saved.flatExplain),
      flatExplainUnsure:!!saved.flatExplainUnsure,
      flatReview:!!saved.flatReview,
      proofOpening:numberIn(saved.proofOpening,25,155,defaults.proofOpening),
      observed:Array.isArray(saved.observed)?saved.observed.map(Number).filter(value=>Number.isFinite(value)&&value>=25&&value<=155).slice(-6):[],
      proofPicks:Array.isArray(saved.proofPicks)?saved.proofPicks.filter(id=>allowedProof.has(id)).slice(0,3):[],
      proofReason:textValue(saved.proofReason),
      proofUnsure:!!saved.proofUnsure,
      proofAttempted:!!saved.proofAttempted,
      proofReview:!!saved.proofReview
    };
  }
  let state=loadState();

  function save(){
    log.point({angle180:state});
  }
  function point(cx,cy,length,degrees){
    return L.point(cx,cy,length,degrees);
  }
  function line(x1,y1,x2,y2,extra=''){
    return '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" '+extra+'/>';
  }
  function arc(cx,cy,r,start,end){
    const a=point(cx,cy,r,start);
    const b=point(cx,cy,r,end);
    const large=end-start>180?1:0;
    return 'M '+a.x.toFixed(1)+' '+a.y.toFixed(1)+' A '+r+' '+r+' 0 '+large+' 0 '+b.x.toFixed(1)+' '+b.y.toFixed(1);
  }
  function angleSvg(opening,orientation,length,label){
    const cx=150,cy=118;
    const a=point(cx,cy,length,orientation);
    const b=point(cx,cy,length,orientation+opening);
    return '<svg viewBox="0 0 300 230" role="img" aria-label="'+esc(label)+'">'+
      '<title>'+esc(label)+'</title>'+
      '<path d="'+arc(cx,cy,32,orientation,orientation+opening)+'" fill="none" stroke="#c47a42" stroke-width="8" stroke-linecap="round"/>'+
      line(cx,cy,a.x,a.y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      line(cx,cy,b.x,b.y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      '<circle cx="'+cx+'" cy="'+cy+'" r="6" fill="#273a59"/>'+
      '<text x="150" y="207" text-anchor="middle" fill="#657186" font-size="16">'+esc(label)+'</text>'+
      '</svg>';
  }
  function transferSvg(opening,orientation,length,label){
    const cx=115,cy=93;
    const a=point(cx,cy,length,orientation);
    const b=point(cx,cy,length,orientation+opening);
    return '<svg viewBox="0 0 230 185" role="img" aria-label="角'+esc(label)+'">'+
      '<title>角'+esc(label)+'，没有给出度数</title>'+
      '<path d="'+arc(cx,cy,25,orientation,orientation+opening)+'" fill="none" stroke="#c47a42" stroke-width="7" stroke-linecap="round"/>'+
      line(cx,cy,a.x,a.y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      line(cx,cy,b.x,b.y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      '<circle cx="'+cx+'" cy="'+cy+'" r="5" fill="#273a59"/>'+
      '<text x="115" y="170" text-anchor="middle" fill="#273a59" font-size="22" font-weight="700">'+esc(label)+'</text>'+
      '</svg>';
  }
  function turnSvg(degrees){
    const cx=190,cy=165,r=112;
    const end=point(cx,cy,r,degrees);
    let sector='';
    if(degrees===360){
      sector='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#dfe5ee" opacity=".9"/>';
    }else if(degrees>0){
      const start=point(cx,cy,r,0);
      sector='<path d="M '+cx+' '+cy+' L '+start.x.toFixed(1)+' '+start.y.toFixed(1)+' A '+r+' '+r+' 0 '+(degrees>180?1:0)+' 0 '+end.x.toFixed(1)+' '+end.y.toFixed(1)+' Z" fill="#dfe5ee"/>';
    }
    return '<svg viewBox="0 0 380 330" role="img" aria-label="射线已经转过'+degrees+'度">'+
      '<title>一条射线绕端点转动，当前转过'+degrees+'度</title>'+
      sector+
      '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#c8cfdb" stroke-width="2" stroke-dasharray="5 7"/>'+
      line(cx,cy,cx+r,cy,'stroke="#8190a5" stroke-width="4" stroke-linecap="round"')+
      line(cx,cy,end.x,end.y,'stroke="#3f526f" stroke-width="6" stroke-linecap="round"')+
      '<circle cx="'+cx+'" cy="'+cy+'" r="7" fill="#273a59"/>'+
      '<text x="'+cx+'" y="307" text-anchor="middle" fill="#273a59" font-size="24" font-weight="700">'+degrees+'°</text>'+
      '</svg>';
  }
  function intersectionSvg(opening){
    const cx=205,cy=170,r=140;
    const angles=[0,opening,180,opening+180];
    const points=angles.map(value=>point(cx,cy,r,value));
    const values=L.intersection(opening);
    return '<svg viewBox="0 0 410 340" role="img" aria-label="两条直线相交，四个角随直线转动">'+
      '<title>两条直线相交，四个角分别是'+values.one+'度、'+values.two+'度、'+values.three+'度、'+values.four+'度</title>'+
      line(points[0].x,points[0].y,points[2].x,points[2].y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      line(points[1].x,points[1].y,points[3].x,points[3].y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      '<path d="'+arc(cx,cy,43,0,opening)+'" fill="none" stroke="#c47a42" stroke-width="10"/>'+
      '<path d="'+arc(cx,cy,43,180,180+opening)+'" fill="none" stroke="#c47a42" stroke-width="10"/>'+
      '<circle cx="'+cx+'" cy="'+cy+'" r="6" fill="#273a59"/>'+
      '<text x="338" y="190" fill="#273a59" font-size="19">B</text><text x="57" y="190" fill="#273a59" font-size="19">A</text>'+
      '<text x="'+(points[1].x+8).toFixed(1)+'" y="'+(points[1].y-8).toFixed(1)+'" fill="#273a59" font-size="19">C</text>'+
      '<text x="'+(points[3].x-20).toFixed(1)+'" y="'+(points[3].y+24).toFixed(1)+'" fill="#273a59" font-size="19">D</text>'+
      '<text x="'+point(cx,cy,67,opening/2).x.toFixed(1)+'" y="'+point(cx,cy,67,opening/2).y.toFixed(1)+'" fill="#273a59" font-size="18">∠1</text>'+
      '<text x="'+point(cx,cy,73,(opening+180)/2).x.toFixed(1)+'" y="'+point(cx,cy,73,(opening+180)/2).y.toFixed(1)+'" fill="#273a59" font-size="18">∠2</text>'+
      '<text x="'+point(cx,cy,73,180+opening/2).x.toFixed(1)+'" y="'+point(cx,cy,73,180+opening/2).y.toFixed(1)+'" fill="#273a59" font-size="18">∠3</text>'+
      '<text x="'+point(cx,cy,73,270+opening/2).x.toFixed(1)+'" y="'+point(cx,cy,73,270+opening/2).y.toFixed(1)+'" fill="#273a59" font-size="18">∠4</text>'+
      '</svg>';
  }
  function transferProofSvg(){
    const cx=205,cy=170,r=140;
    const pr=20,qs=112;
    const p=point(cx,cy,r,pr),rPoint=point(cx,cy,r,pr+180);
    const q=point(cx,cy,r,qs),s=point(cx,cy,r,qs+180);
    return '<svg viewBox="0 0 410 340" role="img" aria-label="换过方向并改用P、Q、R、S标记的两条相交直线">'+
      '<title>直线PR与直线QS相交于O，证明角POQ等于角ROS</title>'+
      line(p.x,p.y,rPoint.x,rPoint.y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      line(q.x,q.y,s.x,s.y,'stroke="#3f526f" stroke-width="5" stroke-linecap="round"')+
      '<circle cx="'+cx+'" cy="'+cy+'" r="6" fill="#273a59"/>'+
      '<g fill="#273a59" font-size="21" font-weight="700">'+
      '<text x="'+(p.x+8).toFixed(1)+'" y="'+(p.y-8).toFixed(1)+'">P</text>'+
      '<text x="'+(q.x-10).toFixed(1)+'" y="'+(q.y-10).toFixed(1)+'">Q</text>'+
      '<text x="'+(rPoint.x-22).toFixed(1)+'" y="'+(rPoint.y+25).toFixed(1)+'">R</text>'+
      '<text x="'+(s.x+9).toFixed(1)+'" y="'+(s.y+21).toFixed(1)+'">S</text>'+
      '<text x="'+(cx+10)+'" y="'+(cy+22)+'">O</text></g>'+
      '</svg>';
  }
  function choices(values,selected,name){
    return '<div class="angle-choices" role="group" aria-label="'+esc(name)+'">'+values.map((value,index)=>
      '<button type="button" data-choice="'+index+'" aria-pressed="'+String(selected===index)+'">'+esc(value)+'</button>'
    ).join('')+'</div>';
  }
  function reasonBlock(prefix,label,reason,unsure){
    return '<div class="angle-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label>'+
      '<textarea id="'+prefix+'-reason" rows="3" maxlength="800" placeholder="一句话、关键词或一个算式就好。">'+esc(reason)+'</textarea>'+
      '<label class="angle-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindReason(prefix,reasonKey,unsureKey){
    const reason=host.querySelector('#'+prefix+'-reason');
    const unsure=host.querySelector('#'+prefix+'-unsure');
    reason.addEventListener('input',()=>{
      state[reasonKey]=reason.value.slice(0,800);
      if(reason.value.trim()){
        state[unsureKey]=false;
        unsure.checked=false;
      }
      save();
    });
    unsure.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function bindChoices(stateKey){
    host.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
      state[stateKey]=Number(button.dataset.choice);
      host.querySelectorAll('[data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      save();
    });
  }
  function bindHelp(index){
    host.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{
      if(details.open)log.help(index,details.dataset.help);
    }));
  }
  function message(text){
    const box=host.querySelector('#angle-message');
    if(box)box.textContent=text;
  }
  function progress(){
    document.querySelectorAll('.angle-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');
      else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){
    host.querySelector('h2')?.focus({preventScroll:true});
    document.querySelector('.angle-nav')?.scrollIntoView({block:'start'});
  }
  function base(label,title,body,button){
    return '<section class="angle-card"><p class="angle-label">'+label+'</p><h2 tabindex="-1">'+title+'</h2>'+body+
      '<p class="angle-error" id="angle-message" role="status"></p>'+button+'</section>';
  }

  function renderInitialAngle(){
    const diagrams='<div class="angle-diagrams"><figure class="angle-diagram">'+angleSvg(50,10,110,'A：两条射线画得较长')+
      '<figcaption>两条射线画得较长，开口朝右上</figcaption></figure><figure class="angle-diagram">'+angleSvg(50,105,69,'B：两条射线画得较短')+
      '<figcaption>两条射线画得较短，整幅图也转了方向</figcaption></figure></div>';
    const body='<p class="angle-lead">先别量。图中只画出了射线的一部分：A 的边更长，B 的图转过方向。哪个角更大？</p>'+diagrams+
      choices(L.angleOptions,state.initialChoice,'第一次判断')+
      reasonBlock('angle-initial','我这样判断，是因为……',state.initialReason,state.initialUnsure);
    host.innerHTML=base('先判断 / 留住第一反应','边拉长、图转向，角会跟着变吗？',body,'<button class="primary" id="angle-submit">留下判断，动手验证 →</button>');
    bindChoices('initialChoice');
    bindReason('angle-initial','initialReason','initialUnsure');
    host.querySelector('#angle-submit').onclick=()=>{
      if(state.initialChoice===null){message('先选一个判断。');return;}
      const why=state.initialReason.trim()||(state.initialUnsure?'暂时说不清':'');
      if(!why){message('再留一句理由；说不清也可以如实勾选。');return;}
      log.submit(0,L.angleOptions[state.initialChoice],state.initialChoice===1,why);
      state.phase0='lab';
      save();
      render(true);
    };
  }

  function renderAngleLab(){
    const flags=state.actions;
    const ready=flags.length&&flags.orientation&&flags.opening;
    const body='<p class="angle-lead">一次只改一个量：边长、整图朝向、两条射线的方向差。观察哪个改变真的会改变角。</p>'+
      '<div class="angle-lab"><h3>角度实验台</h3><div id="angle-live">'+angleSvg(state.opening,state.orientation,state.length,'当前角度实验')+'</div>'+
      '<div class="angle-controls">'+
      '<label for="angle-length">射线在屏幕上画多长 <output id="angle-length-out">'+state.length+'</output></label><input id="angle-length" type="range" min="55" max="135" step="1" value="'+state.length+'">'+
      '<label for="angle-orientation">整幅图朝哪个方向 <output id="angle-orientation-out">'+state.orientation+'°</output></label><input id="angle-orientation" type="range" min="-40" max="150" step="1" value="'+state.orientation+'">'+
      '<label for="angle-opening">两条射线的方向差 <output id="angle-opening-out">'+state.opening+'°</output></label><input id="angle-opening" type="range" min="20" max="140" step="1" value="'+state.opening+'">'+
      '</div><div class="angle-flags" aria-label="已经完成的操作"><span data-flag="length" class="'+(flags.length?'done':'')+'">① 改边长</span><span data-flag="orientation" class="'+(flags.orientation?'done':'')+'">② 转整图</span><span data-flag="opening" class="'+(flags.opening?'done':'')+'">③ 改开口</span></div>'+
      '<p class="angle-readout">现在角的大小是 <strong id="angle-current">'+state.opening+'°</strong>。边长只改变画出来的线段，整图转向只改变朝向；两条射线的方向差改变，角才改变。</p></div>'+
      '<section class="angle-transfer"><p class="angle-label">换图独立判断</p><h3>不看数字，哪两个角一样大？</h3><p>故事、边长和朝向都换了。只比较两条射线的方向差。</p>'+
      '<div class="angle-diagrams"><figure class="angle-diagram">'+transferSvg(44,8,100,'X')+'</figure><figure class="angle-diagram">'+transferSvg(44,126,67,'Y')+'</figure><figure class="angle-diagram">'+transferSvg(72,38,88,'Z')+'</figure></div>'+
      choices(L.transferOptions,state.transferChoice,'换图判断')+
      reasonBlock('angle-transfer','我比较的是……',state.transferReason,state.transferUnsure)+
      '<details class="angle-help" data-help="角的大小提示"><summary>给我一点提示</summary><p>遮住射线末端，只看两条射线从同一点出发时，方向相差多少。图整体朝哪儿，不影响这个差。</p></details>'+
      '<details class="angle-help" data-help="角的完整方法"><summary>我还需要完整方法</summary><p>X 与 Y 的两条射线方向差相同；Y 只是画得更短并转了方向。Z 的开口更大。角量的是两条射线的方向差，不是边长，也不是图朝向。</p></details></section>';
    host.innerHTML=base('动手验证 / 再换图迁移','到底是哪一个变化，让角真的变了？',body,'<button class="primary" id="angle-transfer-submit">保存新判断</button>');
    function draw(){
      host.querySelector('#angle-live').innerHTML=angleSvg(state.opening,state.orientation,state.length,'当前角度实验');
      host.querySelector('#angle-length-out').textContent=state.length;
      host.querySelector('#angle-orientation-out').textContent=state.orientation+'°';
      host.querySelector('#angle-opening-out').textContent=state.opening+'°';
      host.querySelector('#angle-current').textContent=state.opening+'°';
      host.querySelectorAll('[data-flag]').forEach(item=>item.classList.toggle('done',!!state.actions[item.dataset.flag]));
    }
    [['length','length'],['orientation','orientation'],['opening','opening']].forEach(([id,key])=>{
      host.querySelector('#angle-'+id).addEventListener('input',event=>{
        state[key]=Number(event.target.value);
        state.actions[id]=true;
        save();
        draw();
      });
    });
    bindChoices('transferChoice');
    bindReason('angle-transfer','transferReason','transferUnsure');
    bindHelp(0);
    host.querySelector('#angle-transfer-submit').onclick=()=>{
      const all=state.actions.length&&state.actions.orientation&&state.actions.opening;
      if(!all){message('先分别动一动三个控制条，做完“只改一个量”的比较。');return;}
      if(state.transferChoice===null){message('再选出一样大的两个角。');return;}
      const why=state.transferReason.trim()||(state.transferUnsure?'暂时说不清':'');
      if(!why){message('留一句比较依据；说不清也可以如实勾选。');return;}
      const correct=state.transferChoice===1;
      log.submit(0,'换图判断：'+L.transferOptions[state.transferChoice],correct,why);
      if(!correct){message('这次还没锁定。别看边长和整图朝向，再比较三幅图中两条射线的方向差。');return;}
      if(state.transferUnsure||!state.transferReason.trim()){message('判断已经对了，再用自己的话说明比较的是哪个量。');return;}
      log.note(0,'动手验证：分别改变了边长、整图朝向和开口大小。');
      log.finish(0,'能在新图中依据两条射线的方向差判断角的大小');
      render(true);
    };
  }

  function renderFlatInitial(){
    const body='<p class="angle-lead">这里有三种说法。选出能回答“为什么正好是180°”的一种。</p>'+
      choices(L.flatOptions,state.flatChoice,'平角为什么是180度')+
      reasonBlock('angle-flat','它是在用约定、定义，还是定理？',state.flatReason,state.flatUnsure)+
      '<details class="angle-help" data-help="约定与定理提示"><summary>先分一分三个词</summary><p><b>约定</b>决定单位怎样数；<b>定义</b>说明一个名称指什么；<b>定理</b>要从已有依据推出来。别用后面才学到的结论倒过来解释前面的基础。</p></details>';
    host.innerHTML=base('先辨依据 / 不背孤立数字','平角为什么正好是180°？',body,'<button class="primary" id="angle-flat-submit">留下判断，亲手转半周 →</button>');
    bindChoices('flatChoice');
    bindReason('angle-flat','flatReason','flatUnsure');
    bindHelp(1);
    host.querySelector('#angle-flat-submit').onclick=()=>{
      if(state.flatChoice===null){message('先选一种说法。');return;}
      const why=state.flatReason.trim()||(state.flatUnsure?'暂时说不清':'');
      if(!why){message('再留一句理由；说不清也可以如实勾选。');return;}
      log.submit(1,L.flatOptions[state.flatChoice],state.flatChoice===1,why);
      state.phase1='turn';
      save();
      render(true);
    };
  }

  function renderTurn(){
    const summary=state.turn===0?'还没有转动：两条射线重合。':state.turn===180?'正好半周：两条射线方向相反，组成平角。':state.turn===360?'转完一周：活动射线回到起始方向，但走过了完整一周。':'已经转过一部分，继续比较它占一周的多少。';
    const review=state.flatReview?'<section class="angle-review"><h3>把依据接完整</h3><p>角度制先约定：<b>一整周记作360°</b>。平角表示射线绕端点转过<b>半周</b>，所以 360°÷2＝180°。</p><p>“三角形内角和是180°”是后面要证明的结论，不能拿它倒过来解释平角；量角器反复测到180°是验证，也不是“正好如此”的根本依据。</p><button class="primary" id="angle-flat-assisted">对照后收好，过几天换图再试</button></section>':'';
    const body='<p class="angle-lead">拖动射线。0°与360°的末端方向相同，但转过的路程不同；本课只看0°到360°这一周。</p>'+
      '<div class="angle-lab"><div id="angle-turn-live">'+turnSvg(state.turn)+'</div>'+
      '<div class="angle-controls"><label for="angle-turn">转过的角度 <output id="angle-turn-out">'+state.turn+'°</output></label><input id="angle-turn" type="range" min="0" max="360" step="5" value="'+state.turn+'"></div>'+
      '<div class="angle-actions"><button class="secondary" data-turn="90">四分之一周</button><button class="secondary" data-turn="180">半周</button><button class="secondary" data-turn="360">一整周</button></div>'+
      '<p class="angle-readout" id="angle-turn-summary">'+summary+'</p></div>'+
      reasonBlock('angle-turn-reason','请把这句话接完整：“一周记作360°，平角是……，所以……”',state.flatExplain,state.flatExplainUnsure)+
      '<details class="angle-help" data-help="半周提示"><summary>给我一点提示</summary><p>把“一整周有多少度”“平角占一整周的几分之几”写成一个除法算式。</p></details>'+review;
    host.innerHTML=base('动手转动 / 连接约定与定义','把一周转到半周，会发生什么？',body,'<button class="primary" id="angle-turn-submit">保存我的解释</button>');
    function draw(){
      host.querySelector('#angle-turn-live').innerHTML=turnSvg(state.turn);
      host.querySelector('#angle-turn').value=state.turn;
      host.querySelector('#angle-turn-out').textContent=state.turn+'°';
      host.querySelector('#angle-turn-summary').textContent=state.turn===0?'还没有转动：两条射线重合。':state.turn===180?'正好半周：两条射线方向相反，组成平角。':state.turn===360?'转完一周：活动射线回到起始方向，但走过了完整一周。':'已经转过一部分，继续比较它占一周的多少。';
    }
    host.querySelector('#angle-turn').addEventListener('input',event=>{
      state.turn=Number(event.target.value);
      if(state.turn===180)state.reachedHalf=true;
      save();
      draw();
    });
    host.querySelectorAll('[data-turn]').forEach(button=>button.onclick=()=>{
      state.turn=Number(button.dataset.turn);
      if(state.turn===180)state.reachedHalf=true;
      save();
      draw();
    });
    bindReason('angle-turn-reason','flatExplain','flatExplainUnsure');
    bindHelp(1);
    host.querySelector('#angle-turn-submit').onclick=()=>{
      if(!state.reachedHalf){message('先把射线亲手转到180°，观察半周时两条射线的位置。');return;}
      const why=state.flatExplain.trim()||(state.flatExplainUnsure?'暂时说不清':'');
      if(!why){message('把约定和半周关系接起来；说不清也可以如实勾选。');return;}
      log.submit(1,'把一周转到半周：180°',null,why);
      log.note(1,'动手验证：射线曾转到180°，观察到两边成为反向射线。');
      if(state.flatExplainUnsure||!state.flatExplain.trim()){
        state.flatReview=true;
        log.help(1,'约定与平角的完整关系');
        save();
        render();
        message('先对照完整关系；这次会如实记为在方法帮助下完成。');
        return;
      }
      log.finish(1,'完成半周操作并留下解释（文字未自动判分）');
      render(true);
    };
    const assisted=host.querySelector('#angle-flat-assisted');
    if(assisted)assisted.onclick=()=>{
      log.finish(1,'在完整方法帮助下完成，待换图独立说明');
      render(true);
    };
  }

  function proofCards(){
    return '<div class="angle-cards" role="group" aria-label="选择证明所需的三步">'+L.proofCards.map(card=>
      '<button type="button" data-proof="'+card.id+'" aria-pressed="'+String(state.proofPicks.includes(card.id))+'">'+esc(card.text)+'</button>'
    ).join('')+'</div><p class="angle-card-count">已选 <strong id="angle-proof-count">'+state.proofPicks.length+'</strong> / 3 步</p>';
  }
  function renderProof(){
    const values=L.intersection(state.proofOpening);
    const observed=state.observed.length?state.observed.join('°、')+'°':'还没有改变交角';
    const review=state.proofReview?'<section class="angle-review"><h3>完整证明链</h3><p>因为 P、O、R 在同一直线上，所以 ∠POQ＋∠QOR＝180°；因为 Q、O、S 在同一直线上，所以 ∠ROS＋∠QOR＝180°。</p><p>两式的左边都等于180°，再同时减去共同的 ∠QOR，得到 <b>∠POQ＝∠ROS</b>。这一步不需要量角器，也没有用平行线或三角形内角和。</p><button class="primary" id="angle-proof-assisted">对照后收好，过几天换图再证</button></section>':'';
    const body='<p class="angle-lead">先在示例中转动一条直线。橙色标出的∠1与∠3总是相等，但拖动只能帮助发现规律；右边三行才说明为什么必然相等。</p>'+
      '<div class="angle-lab"><div class="angle-proof"><div id="angle-intersection-live">'+intersectionSvg(state.proofOpening)+'</div>'+
      '<div class="angle-equations"><p>∠1＋∠2＝180°</p><p>∠3＋∠2＝180°</p><p class="therefore">两式同时减去∠2<br>∴ ∠1＝∠3</p></div></div>'+
      '<div class="angle-controls"><label for="angle-proof-opening">转动交线 <output id="angle-proof-out">'+state.proofOpening+'° / '+(180-state.proofOpening)+'°</output></label><input id="angle-proof-opening" type="range" min="25" max="155" step="1" value="'+state.proofOpening+'"></div>'+
      '<div class="angle-actions"><button class="secondary" data-opening="42">试42°</button><button class="secondary" data-opening="68">试68°</button><button class="secondary" data-opening="112">试112°</button></div>'+
      '<p class="angle-history">已亲手观察：<span id="angle-observed">'+esc(observed)+'</span>。至少换两个角度，再去新图证明。</p>'+
      '<p class="angle-readout" id="angle-proof-readout">当前：∠1＝∠3＝'+values.one+'°；∠2＝∠4＝'+values.two+'°。每一组相邻平角之和都是180°。</p></div>'+
      '<section class="angle-transfer"><p class="angle-label">撤掉数字与颜色 / 独立迁移</p><h3>直线 PR 与 QS 相交于 O，证明 ∠POQ＝∠ROS</h3>'+
      '<div class="angle-proof"><figure class="angle-diagram">'+transferProofSvg()+'<figcaption>图已旋转，字母也换了；没有给任何度数。</figcaption></figure>'+
      '<div><p>从下面选出证明需要的 <b>3 步</b>。顺序不用拖，选对依据即可。</p>'+proofCards()+'</div></div>'+
      reasonBlock('angle-proof-reason','共同使用了哪个角？为什么可以同时减去它？',state.proofReason,state.proofUnsure)+
      '<details class="angle-help" data-help="证明提示一：找共同角"><summary>提示1：先找两个式子都用到的角</summary><p>目标角 ∠POQ 与 ∠ROS 各和哪个相邻角拼成平角？那个角会同时出现在两条等式里。</p></details>'+
      '<details class="angle-help" data-help="证明提示二：写两组180度"><summary>提示2：先写两组180°</summary><p>P、O、R 在一条直线上；Q、O、S 在另一条直线上。分别找出以共同角 ∠QOR 为一部分的两个平角。</p></details>'+
      (state.proofAttempted?'<button class="secondary" id="angle-show-proof">这次仍说不清，查看完整方法</button>':'')+
      review+'</section>';
    host.innerHTML=base('先看示例，再撤掉支架','不量角，怎样证明对顶角相等？',body,'<button class="primary" id="angle-proof-submit">检查我的证明链</button>');
    function draw(){
      const current=L.intersection(state.proofOpening);
      host.querySelector('#angle-intersection-live').innerHTML=intersectionSvg(state.proofOpening);
      host.querySelector('#angle-proof-opening').value=state.proofOpening;
      host.querySelector('#angle-proof-out').textContent=state.proofOpening+'° / '+(180-state.proofOpening)+'°';
      host.querySelector('#angle-proof-readout').textContent='当前：∠1＝∠3＝'+current.one+'°；∠2＝∠4＝'+current.two+'°。每一组相邻平角之和都是180°。';
      host.querySelector('#angle-observed').textContent=state.observed.length?state.observed.join('°、')+'°':'还没有改变交角';
    }
    function observe(value){
      state.proofOpening=value;
      if(!state.observed.includes(value))state.observed=[...state.observed,value].slice(-6);
      save();
      draw();
    }
    host.querySelector('#angle-proof-opening').addEventListener('input',event=>observe(Number(event.target.value)));
    host.querySelectorAll('[data-opening]').forEach(button=>button.onclick=()=>observe(Number(button.dataset.opening)));
    host.querySelectorAll('[data-proof]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.proof;
      if(state.proofPicks.includes(id))state.proofPicks=state.proofPicks.filter(value=>value!==id);
      else if(state.proofPicks.length<3)state.proofPicks=[...state.proofPicks,id];
      else{message('最多选3步；先取消一项，再换另一项。');return;}
      button.setAttribute('aria-pressed',String(state.proofPicks.includes(id)));
      host.querySelector('#angle-proof-count').textContent=state.proofPicks.length;
      save();
    });
    bindReason('angle-proof-reason','proofReason','proofUnsure');
    bindHelp(2);
    host.querySelector('#angle-proof-submit').onclick=()=>{
      if(new Set(state.observed).size<2){message('先亲手换至少两个角度，分清“观察规律”和“证明规律”。');return;}
      if(state.proofPicks.length!==3){message('需要选出完整的3步证明链。');return;}
      const why=state.proofReason.trim()||(state.proofUnsure?'暂时说不清':'');
      if(!why){message('再留一句理由；说不清也可以如实勾选。');return;}
      const correct=L.sameSet(state.proofPicks,L.proofAnswer);
      const answer=state.proofPicks.map(id=>L.proofCards.find(card=>card.id===id)?.text||id).join(' → ');
      log.submit(2,answer,correct,why);
      state.proofAttempted=true;
      save();
      if(!correct){render();message('这三步还不能组成必然成立的证明。先找共同角，再检查两组相邻角的外侧两边是否为反向射线。');return;}
      if(state.proofUnsure||!state.proofReason.trim()){render();message('证明卡已经选对，再说明为什么两式可以减去同一个角。');return;}
      log.note(2,'动手观察过的交角：'+state.observed.join('°、')+'°；独立图没有数字或颜色提示。');
      log.finish(2,'能在旋转并换字母的新图中搭出对顶角证明链');
      render(true);
    };
    const show=host.querySelector('#angle-show-proof');
    if(show)show.onclick=()=>{
      state.proofReview=true;
      log.help(2,'对顶角相等的完整证明');
      save();
      render();
    };
    const assisted=host.querySelector('#angle-proof-assisted');
    if(assisted)assisted.onclick=()=>{
      log.note(2,'独立证明未完成后查看了完整证明链。');
      log.finish(2,'在完整方法帮助下完成，待换图独立证明');
      render(true);
    };
  }

  function finish(){
    host.innerHTML='<section class="angle-card"><p class="angle-label">证明链收好 / 以后继续调用</p><h2 tabindex="-1">角不看边长，证明不靠“看起来”。</h2>'+
      '<p class="angle-takeaway"><b>角的大小</b>：看两条射线的方向差。<br><b>平角180°</b>：一周360°的单位约定＋平角是半周。<br><b>对顶角相等</b>：两组平角都等于180°，同时减去共同角。</p>'+
      '<p>这次会做，不代表过几天仍能独立证明。下一课进入平行线前，可以先只看最后一张图，再口头说一遍每一步依据。</p>'+
      log.html()+
      '<div class="angle-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school">回到 TY敏捷课堂</a><button class="secondary" id="angle-restart">重新练一轮（保留旧记录）</button></div></section>';
    host.querySelector('#angle-restart').onclick=()=>{
      log=F.create(L.title,L.tasks,true);
      state={...defaults,actions:{...defaults.actions},observed:[],proofPicks:[]};
      save();
      render(true);
    };
  }

  function render(focus=false){
    progress();
    if(log.index>=L.tasks.length)finish();
    else if(log.index===0)state.phase0==='initial'?renderInitialAngle():renderAngleLab();
    else if(log.index===1)state.phase1==='initial'?renderFlatInitial():renderTurn();
    else renderProof();
    progress();
    if(focus)focusCard();
  }
  render();
})();
