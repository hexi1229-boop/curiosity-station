'use strict';
(function(){
  const host=document.querySelector('#triangle180-task');
  const L=window.Triangle180Lesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="triangle-refresh">重新打开</button></section>';
    document.querySelector('#triangle-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.unshift([L.id,L.title,'triangle180.html']);

  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  const defaults={
    phase0:'initial',conjectureChoice:null,conjectureReason:'',conjectureUnsure:false,
    vertexX:215,vertexY:92,observations:[],labExplain:'',labUnsure:false,
    proofDemoStep:0,proofPicks:[],proofExplain:'',proofUnsure:false,proofAttempted:false,
    phase2:'construction',constructionChoice:null,constructionFirstChoice:null,transferPicks:[],auditChoice:null,transferExplain:'',transferUnsure:false,transferAttempted:false
  };

  function textValue(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function numberIn(value,min,max,fallback){const number=Number(value);return Number.isFinite(number)&&number>=min&&number<=max?number:fallback;}
  function integer(value,min,max,fallback){return Number.isInteger(value)&&value>=min&&value<=max?value:fallback;}
  function oneOf(value,values){return values.includes(value)?value:null;}
  function safeIds(values,allowed,max){
    if(!Array.isArray(values))return [];
    const set=new Set(allowed);
    return values.filter((value,index)=>set.has(value)&&values.indexOf(value)===index).slice(0,max);
  }
  function loadState(){
    const saved=log.checkpoint.triangle180||{};
    return {
      ...defaults,...saved,
      phase0:saved.phase0==='lab'?'lab':'initial',
      conjectureChoice:oneOf(saved.conjectureChoice,L.conjectureOptions.map(item=>item.id)),
      conjectureReason:textValue(saved.conjectureReason),conjectureUnsure:!!saved.conjectureUnsure,
      vertexX:numberIn(saved.vertexX,82,338,defaults.vertexX),vertexY:numberIn(saved.vertexY,48,232,defaults.vertexY),
      observations:Array.isArray(saved.observations)?saved.observations.filter(value=>typeof value==='string'&&/^\d+:\d+$/.test(value)).slice(0,12):[],
      labExplain:textValue(saved.labExplain),labUnsure:!!saved.labUnsure,
      proofDemoStep:integer(saved.proofDemoStep,0,4,0),
      proofPicks:safeIds(saved.proofPicks,L.proofCards.map(card=>card.id),5),
      proofExplain:textValue(saved.proofExplain),proofUnsure:!!saved.proofUnsure,proofAttempted:!!saved.proofAttempted,
      phase2:saved.phase2==='proof'?'proof':'construction',
      constructionChoice:oneOf(saved.constructionChoice,L.constructionOptions.map(item=>item.id)),
      constructionFirstChoice:oneOf(saved.constructionFirstChoice,L.constructionOptions.map(item=>item.id)),
      transferPicks:safeIds(saved.transferPicks,L.transferRelations.map(item=>item.id),4),
      auditChoice:integer(saved.auditChoice,0,L.auditOptions.length-1,null),
      transferExplain:textValue(saved.transferExplain),transferUnsure:!!saved.transferUnsure,transferAttempted:!!saved.transferAttempted
    };
  }
  let state=loadState();
  function save(){log.point({triangle180:state});}
  function validReason(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function message(value){const box=host.querySelector('#triangle-message');if(box)box.textContent=value;}
  function progress(){
    document.querySelectorAll('.parallel-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.parallel-nav')?.scrollIntoView({block:'start'});}
  function base(label,title,body,button){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="triangle-message" role="status"></p>'+button+'</section>';
  }
  function choices(items,selected,label){
    return '<div class="parallel-choices" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" data-choice="'+esc(item.id)+'" aria-pressed="'+String(selected===item.id)+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function reason(prefix,label,value,unsure,placeholder='一句话、关键词或一个算式都可以。'){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" rows="3" maxlength="900" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindChoice(key){
    host.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
      state[key]=button.dataset.choice;host.querySelectorAll('[data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();
    });
  }
  function bindReason(prefix,valueKey,unsureKey){
    const input=host.querySelector('#'+prefix+'-reason'),unsure=host.querySelector('#'+prefix+'-unsure');
    input.addEventListener('input',()=>{state[valueKey]=input.value.slice(0,900);if(input.value.trim()){state[unsureKey]=false;unsure.checked=false;}save();});
    unsure.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function bindHelp(index){host.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)log.help(index,details.dataset.help);}));}
  function corrective(index,label,value){log.help(index,'自动反馈：'+label);message(value);}
  function rerenderAndFocus(selector){render();host.querySelector(selector)?.focus({preventScroll:true});}
  function selectedList(ids,cards){
    if(!ids.length)return '<p class="sequence-empty" aria-live="polite">还没有放入步骤。按你认为的先后顺序点击下方卡片。</p>';
    return '<ol class="sequence-list" aria-live="polite">'+ids.map(id=>'<li>'+esc(cards.find(card=>card.id===id)?.text||id)+'<button type="button" data-remove="'+esc(id)+'" aria-label="移除这一步">×</button></li>').join('')+'</ol>';
  }
  function sequenceCards(cards,selected,limit,dataKey='proof'){
    return '<div class="parallel-sequence" role="group" aria-label="按顺序选择证明步骤">'+cards.map(card=>'<button type="button" data-'+dataKey+'="'+esc(card.id)+'" aria-pressed="'+String(selected.includes(card.id))+'" '+(selected.includes(card.id)?'disabled':'')+'>'+esc(card.text)+'</button>').join('')+'</div><p class="parallel-label">已放入 '+selected.length+' / '+limit+' 步</p>';
  }
  function polar(cx,cy,r,degrees){const radians=degrees*Math.PI/180;return {x:cx+r*Math.cos(radians),y:cy+r*Math.sin(radians)};}
  function arc(cx,cy,r,start,end,color,width=9){
    const a=polar(cx,cy,r,start),b=polar(cx,cy,r,end),delta=((end-start)%360+360)%360;
    return '<path d="M '+a.x.toFixed(1)+' '+a.y.toFixed(1)+' A '+r+' '+r+' 0 '+(delta>180?1:0)+' 1 '+b.x.toFixed(1)+' '+b.y.toFixed(1)+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"/>';
  }

  function modelSvg(){
    return '<svg id="triangle-model-svg" viewBox="0 0 420 330" role="img" aria-labelledby="triangle-model-title"><title id="triangle-model-title">可改变顶点位置的三角形，页面显示三个内角的近似读数</title><polygon id="triangle-shape" fill="#edf3f1" stroke="#315f5a" stroke-width="5" stroke-linejoin="round"/><circle cx="60" cy="280" r="6" fill="#244d49"/><circle cx="360" cy="280" r="6" fill="#244d49"/><circle id="triangle-vertex" class="triangle-drag-handle" r="15" fill="#bd6f3b" stroke="#fff" stroke-width="5"/><text x="42" y="306" fill="#244d49" font-size="20" font-weight="700">B</text><text x="369" y="306" fill="#244d49" font-size="20" font-weight="700">C</text><text id="triangle-vertex-label" fill="#8d4f2d" font-size="20" font-weight="700">A</text><text x="210" y="320" text-anchor="middle" fill="#657a75" font-size="13">拖动橙色顶点；下方滑杆也可操作</text></svg>';
  }
  function updateModel(record=false){
    const a={x:state.vertexX,y:state.vertexY},b={x:60,y:280},c={x:360,y:280};
    const angles=L.triangleAngles(a,b,c),svg=host.querySelector('#triangle-model-svg');
    if(!svg)return;
    svg.querySelector('#triangle-shape').setAttribute('points',b.x+','+b.y+' '+a.x+','+a.y+' '+c.x+','+c.y);
    const handle=svg.querySelector('#triangle-vertex');handle.setAttribute('cx',a.x);handle.setAttribute('cy',a.y);
    const label=svg.querySelector('#triangle-vertex-label');label.setAttribute('x',a.x+14);label.setAttribute('y',a.y-13);
    host.querySelector('#vertex-x-out').textContent=Math.round(state.vertexX);host.querySelector('#vertex-y-out').textContent=Math.round(280-state.vertexY);
    host.querySelector('#angle-a').textContent=angles.A.toFixed(1)+'°';host.querySelector('#angle-b').textContent=angles.B.toFixed(1)+'°';host.querySelector('#angle-c').textContent=angles.C.toFixed(1)+'°';host.querySelector('#angle-sum').textContent=angles.sum.toFixed(1)+'°';
    if(record){
      const bucket=Math.round(state.vertexX/32)+':'+Math.round(state.vertexY/28);
      const isNew=!state.observations.includes(bucket);
      if(isNew)state.observations=[...state.observations,bucket].slice(-12);
      host.querySelector('#observation-count').textContent=String(state.observations.length);if(isNew)save();
    }
  }
  function bindModel(){
    const x=host.querySelector('#vertex-x'),y=host.querySelector('#vertex-y'),svg=host.querySelector('#triangle-model-svg');
    x.oninput=event=>{state.vertexX=Number(event.target.value);updateModel(true);};
    y.oninput=event=>{state.vertexY=280-Number(event.target.value);updateModel(true);};
    x.onchange=save;y.onchange=save;
    let dragging=false;
    svg.addEventListener('pointerdown',event=>{if(!event.target.closest('#triangle-vertex'))return;dragging=true;svg.setPointerCapture(event.pointerId);});
    svg.addEventListener('pointermove',event=>{
      if(!dragging)return;const rect=svg.getBoundingClientRect();
      state.vertexX=Math.max(82,Math.min(338,(event.clientX-rect.left)*420/rect.width));
      state.vertexY=Math.max(48,Math.min(232,(event.clientY-rect.top)*330/rect.height));
      x.value=String(state.vertexX);y.value=String(280-state.vertexY);updateModel(true);
    });
    svg.addEventListener('pointerup',event=>{dragging=false;if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);save();});
    svg.addEventListener('pointercancel',()=>{dragging=false;});
    updateModel(false);
  }

  function renderConjectureInitial(){
    const body='<p class="parallel-lead">有人拖动了几个不同形状的三角形，三个内角的读数加起来每次都是180°。关于“所有平面三角形”，现在最严谨的说法是哪一句？</p>'+choices(L.conjectureOptions,state.conjectureChoice,'判断测量是否已经构成证明')+reason('conjecture','先说说你为什么这样选。',state.conjectureReason,state.conjectureUnsure);
    host.innerHTML=base('先判断 / 暂时不看证明','多量几次，就能证明所有三角形吗？',body,'<button class="primary" id="conjecture-submit">留下首答，再动手验证 →</button>');
    bindChoice('conjectureChoice');bindReason('conjecture','conjectureReason','conjectureUnsure');
    host.querySelector('#conjecture-submit').onclick=()=>{
      if(!state.conjectureChoice){message('先选一句你认为最严谨的说法。');return;}
      const why=validReason(state.conjectureReason,state.conjectureUnsure);if(!why){message('再留一句理由；暂时说不清也可以如实勾选。');return;}
      const item=L.conjectureOptions.find(option=>option.id===state.conjectureChoice),correct=state.conjectureChoice==='conjecture';
      log.submit(0,item.text,correct,why);
      if(!correct){corrective(0,'测量与证明的边界',state.conjectureChoice==='measured'?'再多的有限次测量，仍没有覆盖无限多种三角形；它能支持猜想，不能单独完成一般性证明。':'直角、钝角三角形也可以测；真正的问题不是三角形类型，而是有限测量不能代表全部。');return;}
      state.phase0='lab';save();render(true);
    };
  }
  function renderConjectureLab(){
    const body='<p class="parallel-lead">现在亲手改变顶点A。读数保留一位小数，所以屏幕显示只是近似；看看形状大幅改变时，三个内角的和怎样变化。</p><div class="triangle-model">'+modelSvg()+'<div class="triangle-model-controls"><label>A点左右位置 <output id="vertex-x-out"></output><input id="vertex-x" type="range" min="82" max="338" step="1" value="'+state.vertexX+'"></label><label>A点离底边高度 <output id="vertex-y-out"></output><input id="vertex-y" type="range" min="48" max="232" step="1" value="'+(280-state.vertexY)+'"></label></div><div class="triangle-readout"><span>∠A<b id="angle-a"></b></span><span>∠B<b id="angle-b"></b></span><span>∠C<b id="angle-c"></b></span><span>读数之和<b id="angle-sum"></b></span></div><p class="triangle-observation">已观察 <b id="observation-count">'+state.observations.length+'</b> 种明显不同的位置。这里是在形成和检查猜想，还没有证明任意三角形。</p></div>'+reason('lab','这些读数为什么仍不能代替证明？',state.labExplain,state.labUnsure,'把“量了几个”和“要说明所有”联系起来。')+'<details class="parallel-help" data-help="测量与一般证明提示"><summary>给我一点提示</summary><p>屏幕只能展示有限个位置，读数还有舍入误差。证明需要一个对任意非退化三角形都成立的关系。</p></details>';
    host.innerHTML=base('动手验证 / 仍然只是猜想','三角形变瘦、变扁，读数之和会怎样？',body,'<button class="primary" id="lab-submit">收好猜想，进入证明 →</button>');
    bindModel();bindReason('lab','labExplain','labUnsure');bindHelp(0);
    host.querySelector('#lab-submit').onclick=()=>{
      if(state.observations.length<3){message('至少把顶点移到3个明显不同的位置，再判断规律。');return;}
      const why=validReason(state.labExplain,state.labUnsure);if(!why){message('再留一句“为什么还不是证明”；暂时说不清也可以如实勾选。');return;}
      log.submit(0,'观察了'+state.observations.length+'种不同形状；读数之和保持约180°，但它仍只是猜想',true,why);
      const neededSupport=log.records[0].first?.correct===false||log.records[0].helps.some(item=>item.phase!=='完成后回看');
      log.note(0,'拖动和近似读数只用于形成、检查猜想；没有把有限测量当成一般性证明。');
      log.finish(0,state.labUnsure?'完成多形状观察；测量与证明的区别暂时说不清':neededSupport?'在反馈或提示后完成测量与证明的区分；待后续无提示调用':'无额外提示完成测量与证明的区分；开放解释未自动判分');render(true);
    };
  }

  function proofSvg(step){
    const A={x:210,y:76},B={x:88,y:270},C={x:342,y:270},D={x:35,y:76},E={x:385,y:76};
    const top=step>=1?'<line x1="35" y1="76" x2="385" y2="76" stroke="#315f5a" stroke-width="5" stroke-linecap="round" class="proof-ink"/>':'';
    const left=step>=2?arc(A.x,A.y,38,122,180,'#bf7440')+arc(B.x,B.y,38,302,360,'#bf7440'):'';
    const right=step>=3?arc(A.x,A.y,54,0,57,'#4f8378')+arc(C.x,C.y,38,180,237,'#4f8378'):'';
    const middle=step>=4?arc(A.x,A.y,28,57,122,'#7a6a9b',8):'';
    const labels=step>=1?'<text x="25" y="67" fill="#244d49" font-size="19" font-weight="700">D</text><text x="392" y="67" fill="#244d49" font-size="19" font-weight="700">E</text>':'';
    const relation=step===2?'<text x="210" y="313" text-anchor="middle" fill="#8d4f2d" font-size="15">∠DAB＝∠ABC</text>':step===3?'<text x="210" y="313" text-anchor="middle" fill="#356c63" font-size="15">再得到 ∠CAE＝∠ACB</text>':step>=4?'<text x="210" y="313" text-anchor="middle" fill="#405d58" font-size="15">三个相邻角正好铺满平角∠DAE</text>':'';
    return '<svg class="triangle-proof-svg" viewBox="0 0 420 330" role="img" aria-label="证明演示第'+step+'步"><title>过三角形顶点A作平行于BC的直线，逐步建立两组相等角和平角关系</title>'+top+'<polygon points="'+B.x+','+B.y+' '+A.x+','+A.y+' '+C.x+','+C.y+'" fill="#f7faf8" stroke="#315f5a" stroke-width="5" stroke-linejoin="round"/>'+left+right+middle+'<g fill="#244d49" font-size="19" font-weight="700"><text x="205" y="58">A</text><text x="67" y="293">B</text><text x="350" y="293">C</text>'+labels+'</g>'+relation+'</svg>';
  }
  function renderProof(){
    const notes=[
      ['先写目标','要证明的是△ABC三个内角的和，不先使用这个结论。'],
      ['补一条辅助线','过A作DE∥BC；D、A、E共线，先造出一个平角容器。'],
      ['搬来左边的角','DE∥BC，AB作截线，所以∠DAB＝∠ABC。'],
      ['再搬来右边的角','DE∥BC，AC作截线，所以∠CAE＝∠ACB。'],
      ['铺满平角','两个搬来的角和原顶角相邻、无重叠、无空隙地组成∠DAE。']
    ];
    const current=notes[state.proofDemoStep];
    const body='<p class="parallel-lead">这次不量度数。先把允许使用的工具和要证明的结论分开，再看辅助线为什么出现。</p><div class="triangle-identity"><div><b>G0 已建立</b>平角是180°；相邻角可以相加</div><div><b>G1 已建立</b>两直线平行，可以推出内错角相等</div><div class="target"><b>本课待证</b>任意非退化三角形三个内角的和是180°</div></div><div class="triangle-proof-stage"><div>'+proofSvg(state.proofDemoStep)+'</div><div class="triangle-step-note"><b>演示 '+state.proofDemoStep+' / 4 · '+esc(current[0])+'</b>'+esc(current[1])+'<div class="parallel-actions"><button class="secondary" id="proof-restart">从头看</button><button class="primary" id="proof-next">'+(state.proofDemoStep<4?'下一步 →':'再看一遍')+'</button></div></div></div><h3>撤掉步骤说明，自己排出证明链</h3>'+selectedList(state.proofPicks,L.proofCards)+sequenceCards(L.proofCards,state.proofPicks,5)+reason('proof','为什么辅助线要“过A且平行于BC”？',state.proofExplain,state.proofUnsure,'说清它怎样同时带来两组角关系和一个平角。')+'<details class="parallel-help" data-help="三角形内角和证明提示一"><summary>提示1：这条线先制造了什么？</summary><p>“平行于BC”让AB、AC分别成为截线，从而把B、C两个角搬到A的两侧；“D、A、E共线”又提供平角。</p></details><details class="parallel-help" data-help="三角形内角和证明提示二"><summary>提示2：最后两步是什么？</summary><p>先确认三个相邻角正好组成平角，再把其中两个角替换成三角形的B角和C角。</p></details>';
    host.innerHTML=base('短示例后撤掉支架 / 正式证明','为什么要过顶点画一条平行线？',body,'<button class="primary" id="proof-submit">检查证明链 →</button>');
    host.querySelector('#proof-restart').onclick=()=>{state.proofDemoStep=0;save();rerenderAndFocus('#proof-restart');};
    host.querySelector('#proof-next').onclick=()=>{state.proofDemoStep=state.proofDemoStep<4?state.proofDemoStep+1:0;save();rerenderAndFocus('#proof-next');};
    host.querySelectorAll('[data-proof]').forEach(button=>button.onclick=()=>{
      if(state.proofPicks.length>=5){message('证明只需要5步；先移除一项再换。');return;}
      state.proofPicks=[...state.proofPicks,button.dataset.proof];save();rerenderAndFocus('[data-remove="'+button.dataset.proof+'"]');
    });
    host.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{const id=button.dataset.remove;state.proofPicks=state.proofPicks.filter(value=>value!==id);save();rerenderAndFocus('[data-proof="'+id+'"]');});
    bindReason('proof','proofExplain','proofUnsure');bindHelp(1);
    host.querySelector('#proof-submit').onclick=()=>{
      if(state.proofDemoStep<4){message('先把短示例看到“铺满平角”，再撤掉说明自己排序。');return;}
      if(state.proofPicks.length!==5){message('请按先后放入完整的5步证明链。');return;}
      const why=validReason(state.proofExplain,state.proofUnsure);if(!why){message('再留一句辅助线的作用；暂时说不清也可以如实勾选。');return;}
      const correct=L.validProofOrder(state.proofPicks),answer=state.proofPicks.map(id=>L.proofCards.find(card=>card.id===id)?.text||id).join(' → ');
      log.submit(1,answer,correct,why);state.proofAttempted=true;save();
      if(!correct){
        if(state.proofPicks.includes('circular'))corrective(1,'循环论证','这一步把待证的“三角形内角和”提前当成理由。先删掉它，只用G0、G1和辅助线。');
        else if(state.proofPicks.includes('measure'))corrective(1,'测量不能代替证明','量角器仍只能检查有限个图形。正式链条需要辅助线、两组等角、平角和等量代换。');
        else corrective(1,'证明步骤顺序','先作辅助线；两组等角可以交换；再确认平角；等量代换必须最后写。');
        return;
      }
      log.note(1,'本环节先看四步示例再独立排序，属于有指导的证明练习；证明只调用G0平角与G1平行线角关系，没有把测量、剪拼或待证结论当作前提。');
      const neededSupport=log.records[1].first?.correct===false||log.records[1].helps.some(item=>item.phase!=='完成后回看');
      log.finish(1,state.proofUnsure?'证明链正确；辅助线作用暂时说不清':neededSupport?'在提示或反馈后排出证明链；待后续撤掉支架再调用':'看过短示例后，无额外提示排出完整证明链；开放解释未自动判分');render(true);
    };
  }

  function transferSvg(withLine){
    return '<svg class="triangle-transfer-svg" viewBox="0 0 420 330" role="img" aria-label="斜放的钝角三角形PQR'+(withLine?'，过Q画出平行于PR的直线ST':'，尚未画辅助线')+'"><title>斜放的钝角三角形PQR，需要自己选择辅助线并重建完整证明链</title>'+(withLine?'<line x1="20" y1="112.93" x2="400" y2="178.45" stroke="#344f4b" stroke-width="5" stroke-linecap="round"/>':'')+'<polygon points="65,245 235,150 355,295" fill="#fff" stroke="#344f4b" stroke-width="5" stroke-linejoin="round"/><g fill="#243f3b" font-size="19" font-weight="700"><text x="45" y="270">P</text><text x="237" y="137">Q</text><text x="363" y="318">R</text>'+(withLine?'<text x="7" y="107">S</text><text x="402" y="174">T</text>':'')+'</g></svg>';
  }
  function renderTransferConstruction(){
    const body='<p class="parallel-lead">这次图形斜放了，Q是钝角。题目要求把另外两个内角搬到Q旁边：应该过Q补哪一条线？先自己选，页面不会预画答案。</p><div class="triangle-transfer-box"><div>'+transferSvg(false)+'</div><div class="triangle-transfer-copy"><b>已知：</b>△PQR是平面内非退化三角形。<br><b>目标：</b>不用量角器，证明∠QPR＋∠PQR＋∠PRQ＝180°。<br><b>限制：</b>本题要求过Q选择辅助线。</div></div>'+choices(L.constructionOptions,state.constructionChoice,'为钝角三角形选择辅助线');
    host.innerHTML=base('独立迁移 / 撤掉颜色和度数','过Q补哪一条线，才能调用刚才的方法？',body,'<button class="primary" id="construction-submit">保存选择，再找对应角 →</button>');
    bindChoice('constructionChoice');
    host.querySelector('#construction-submit').onclick=()=>{
      if(!state.constructionChoice){message('先选一条你会补上的辅助线。');return;}
      const item=L.constructionOptions.find(option=>option.id===state.constructionChoice),correct=state.constructionChoice==='throughQ';
      if(!state.constructionFirstChoice){
        state.constructionFirstChoice=state.constructionChoice;
        save();
        if(!correct)log.submit(2,item.text,false);
      }
      if(!correct){corrective(2,'辅助线的目标','要同时得到两组平行线角关系，还要让三个角落在同一个平角里。题目要求过Q，试着平行于对边PR。');return;}
      state.phase2='proof';save();render(true);
    };
  }
  function renderTransferProof(){
    const body='<p class="parallel-lead">辅助线已经按你的选择画出，但不再给颜色、度数和箭头。证明卡里混入了两个不可靠步骤，请自己重建完整的4步链。</p><div class="triangle-transfer-box"><div>'+transferSvg(true)+'</div><div class="triangle-transfer-copy"><b>行动：</b>过Q作ST∥PR。<br><b>目标：</b>只调用平行线角关系、平角和等量代换，证明△PQR三个内角的和。</div></div><h3>按顺序放入完整证明链</h3>'+selectedList(state.transferPicks,L.transferRelations)+sequenceCards(L.transferRelations,state.transferPicks,4,'transfer')+'<section class="audit-box"><h3>哪一种只是在有限次验证，不是一般性证明？</h3><div class="parallel-audit" role="group" aria-label="审查证明方法">'+L.auditOptions.map((item,index)=>'<button type="button" data-audit="'+index+'" aria-pressed="'+String(state.auditChoice===index)+'">'+esc(item)+'</button>').join('')+'</div></section>'+reason('transfer','把你的行动和理由连起来：为什么要过Q作PR的平行线？',state.transferExplain,state.transferUnsure,'例如：这条线让……，又让……，所以三个角……。')+'<details class="parallel-help" data-help="钝角三角形迁移提示"><summary>给我一点提示</summary><p>沿QP、QR各找一组内错角，再寻找Q处三个相邻角共同组成的平角；最后才能代换。</p></details>';
    host.innerHTML=base('独立迁移 / 自己找依据','没有颜色提示，还能把两个底角搬过来吗？',body,'<button class="primary" id="transfer-submit">检查迁移证明 →</button>');
    host.querySelectorAll('[data-transfer]').forEach(button=>button.onclick=()=>{
      if(state.transferPicks.length>=4){message('完整证明只需要4步；先移除一项再换。');return;}
      state.transferPicks=[...state.transferPicks,button.dataset.transfer];save();render();host.querySelector('[data-remove="'+button.dataset.transfer+'"]')?.focus({preventScroll:true});
    });
    host.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{const id=button.dataset.remove;state.transferPicks=state.transferPicks.filter(value=>value!==id);save();render();host.querySelector('[data-transfer="'+id+'"]')?.focus({preventScroll:true});});
    host.querySelectorAll('[data-audit]').forEach(button=>button.onclick=()=>{state.auditChoice=Number(button.dataset.audit);host.querySelectorAll('[data-audit]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    bindReason('transfer','transferExplain','transferUnsure');bindHelp(2);
    host.querySelector('#transfer-submit').onclick=()=>{
      if(state.transferPicks.length!==4){message('请按先后放入完整的4步证明链。');return;}
      if(state.auditChoice===null){message('再审查哪种说法只是有限次验证。');return;}
      const why=validReason(state.transferExplain,state.transferUnsure);if(!why){message('再把行动和理由连成一句；暂时说不清也可以如实勾选。');return;}
      const relationsCorrect=L.validTransferOrder(state.transferPicks),auditCorrect=state.auditChoice===1,correct=relationsCorrect&&auditCorrect;
      const firstConstruction=L.constructionOptions.find(item=>item.id===state.constructionFirstChoice)?.text||'未记录';
      const answer='第一次选辅助线：'+firstConstruction+'；完整证明链：'+state.transferPicks.map(id=>L.transferRelations.find(item=>item.id===id)?.text||id).join(' → ')+'；有限次验证的是：'+L.auditOptions[state.auditChoice];
      log.submit(2,answer,correct,why);state.transferAttempted=true;save();
      if(!relationsCorrect){
        if(state.transferPicks.includes('top')||state.transferPicks.includes('twins'))corrective(2,'证明依据','“画在两边”不能推出相等，单个内角也不会因为位于直线下方就等于180°。');
        else corrective(2,'证明步骤顺序','两组等角可以交换；然后确认三个相邻角组成平角；等量代换必须放在最后。');
        return;
      }
      if(!auditCorrect){corrective(2,'验证与证明','“测量100个三角形”仍是有限验证；另外两项都写出了平行、平角和代换依据。');return;}
      const independent=state.constructionFirstChoice==='throughQ'&&log.records[2].first?.correct===true&&!log.records[2].helps.some(item=>item.phase!=='完成后回看');
      log.note(2,(independent?'在斜放的钝角三角形中首次':'在提示或自动反馈后于斜放的钝角三角形中')+'选择过顶点的平行线并重建“等角—平角—代换”完整链；迁移图未给颜色、度数或预选答案。');
      log.finish(2,state.transferUnsure?'完整迁移链正确；辅助线作用暂时说不清':independent?'无提示完成换图迁移；开放解释未自动判分':'在提示或反馈后完成迁移；待换图无提示再做');render(true);
    };
  }

  function finish(){
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">G2 · 第一条辅助线证明收好</p><h2 tabindex="-1">180°不是背下来的数字，而是一条可以重建的证明链。</h2><p class="parallel-takeaway"><b>先猜想：</b>拖动和测量帮助发现规律，但不能覆盖所有三角形。<br><b>再证明：</b>过顶点作对边的平行线 → 搬来两个底角 → 三个相邻角铺满平角 → 等量代换。<br><b>换图检查：</b>图形斜放、字母更换后，仍先看目标，再决定辅助线。</p><details class="parallel-help"><summary>可选挑战：外角为什么等于两个不相邻内角的和？</summary><p>内角和已经证明后才能这样推出：一个外角与相邻内角组成180°；三个内角的和也等于180°。两式同时减去那个相邻内角，外角就等于另外两个内角的和。这是后续结论，不是本课主证明的前提。</p></details><p>一个定理的价值，还在于它能成为下一次证明的工具。接下来在四边形中画一条对角线，看看这个180°会长出什么。</p>'+log.html()+'<div class="parallel-actions"><a class="primary" href="polygon360.html">带着180°去拆四边形 →</a><a class="secondary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school">回到 TY敏捷课堂</a><button class="secondary" id="triangle-restart">重新练一轮（保留旧记录）</button></div></section>';
    host.querySelector('#triangle-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,observations:[],proofPicks:[],transferPicks:[]};save();render(true);};
  }
  function render(focus=false){
    progress();
    if(log.index>=L.tasks.length)finish();
    else if(log.index===0)state.phase0==='initial'?renderConjectureInitial():renderConjectureLab();
    else if(log.index===1)renderProof();
    else state.phase2==='construction'?renderTransferConstruction():renderTransferProof();
    progress();if(focus)focusCard();
  }
  render();
})();
