'use strict';
(function(){
  const host=document.querySelector('#parallel-task');
  const L=window.ParallelLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="parallel-refresh">重新打开</button></section>';
    document.querySelector('#parallel-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.unshift([L.id,L.title,'parallel.html']);

  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  const defaults={
    phase0:'initial',copyChoice:null,copyReason:'',copyUnsure:false,constructStep:0,radius:78,opening:56,constructSeen:[],copyPicks:[],copyExplain:'',copyExplainUnsure:false,
    phase1:'direction',direction1:null,directionReason:'',directionUnsure:false,proofDemoStep:0,proofPicks:[],proofExplain:'',proofExplainUnsure:false,proofAttempted:false,
    phase2:'direction',direction2:null,transferPicks:[],auditChoice:null,transferExplain:'',transferExplainUnsure:false,transferAttempted:false
  };

  function textValue(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function integer(value,min,max,fallback){return Number.isInteger(value)&&value>=min&&value<=max?value:fallback;}
  function oneOf(value,values){return values.includes(value)?value:null;}
  function safeIds(values,allowed,max){
    if(!Array.isArray(values))return [];
    const set=new Set(allowed);
    return values.filter((value,index)=>set.has(value)&&values.indexOf(value)===index).slice(0,max);
  }
  function loadState(){
    const saved=log.checkpoint.parallel||{};
    return {
      ...defaults,...saved,
      phase0:saved.phase0==='lab'?'lab':'initial',
      copyChoice:integer(saved.copyChoice,0,L.copyChoices.length-1,null),
      copyReason:textValue(saved.copyReason),copyUnsure:!!saved.copyUnsure,
      constructStep:integer(saved.constructStep,0,4,0),
      radius:integer(saved.radius,58,96,78),opening:integer(saved.opening,34,92,56),
      constructSeen:safeIds(saved.constructSeen,[0,1,2,3,4],5),
      copyPicks:safeIds(saved.copyPicks,L.copyChecks.map(item=>item.id),3),
      copyExplain:textValue(saved.copyExplain),copyExplainUnsure:!!saved.copyExplainUnsure,
      phase1:saved.phase1==='proof'?'proof':'direction',
      direction1:oneOf(saved.direction1,L.directionOptions.map(item=>item.id)),
      directionReason:textValue(saved.directionReason),directionUnsure:!!saved.directionUnsure,
      proofDemoStep:integer(saved.proofDemoStep,0,3,0),
      proofPicks:safeIds(saved.proofPicks,L.proofCards.map(item=>item.id),4),
      proofExplain:textValue(saved.proofExplain),proofExplainUnsure:!!saved.proofExplainUnsure,proofAttempted:!!saved.proofAttempted,
      phase2:saved.phase2==='proof'?'proof':'direction',
      direction2:oneOf(saved.direction2,L.transferDirections.map(item=>item.id)),
      transferPicks:safeIds(saved.transferPicks,L.transferCards.map(item=>item.id),3),
      auditChoice:integer(saved.auditChoice,0,L.auditOptions.length-1,null),
      transferExplain:textValue(saved.transferExplain),transferExplainUnsure:!!saved.transferExplainUnsure,transferAttempted:!!saved.transferAttempted
    };
  }
  let state=loadState();
  function save(){log.point({parallel:state});}

  function line(x1,y1,x2,y2,attributes=''){
    return '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" '+attributes+'/>';
  }
  function arc(cx,cy,r,start,end){
    const a=L.point(cx,cy,r,start),b=L.point(cx,cy,r,end);
    return 'M '+a.x.toFixed(1)+' '+a.y.toFixed(1)+' A '+r+' '+r+' 0 0 0 '+b.x.toFixed(1)+' '+b.y.toFixed(1);
  }
  function constructionSvg(step){
    const r=state.radius,opening=state.opening;
    const a={x:145,y:170},o={x:505,y:170};
    const d=L.point(a.x,a.y,r,0),e=L.point(a.x,a.y,r,opening);
    const p=L.point(o.x,o.y,r,0),copiedChord=L.chord(r,opening);
    const q=L.circleIntersections(o,r,p,copiedChord)[0];
    const rayEnd={x:o.x+(q.x-o.x)*125/r,y:o.y+(q.y-o.y)*125/r};
    const angleEnd={x:o.x+(q.x-o.x)*34/r,y:o.y+(q.y-o.y)*34/r};
    return '<svg viewBox="0 0 660 320" role="img" aria-label="复制角作图进行到第'+step+'步">'+
      '<title>用相同半径和相同弦长复制角，当前第'+step+'步</title>'+
      '<g stroke="#355f67" stroke-width="5" stroke-linecap="round" fill="none">'+
      line(a.x,a.y,270,a.y)+line(a.x,a.y,L.point(a.x,a.y,125,opening).x,L.point(a.x,a.y,125,opening).y)+
      line(o.x,o.y,630,o.y)+'</g>'+
      (step>=1?'<path class="construction-ink" d="'+arc(a.x,a.y,r,0,opening)+'" fill="none" stroke="#c4773d" stroke-width="4" stroke-dasharray="7 5"/><circle cx="'+d.x.toFixed(1)+'" cy="'+d.y.toFixed(1)+'" r="5" fill="#c4773d"/><circle cx="'+e.x.toFixed(1)+'" cy="'+e.y.toFixed(1)+'" r="5" fill="#c4773d"/>':'')+
      (step>=2?'<path class="construction-ink" d="'+arc(o.x,o.y,r,0,112)+'" fill="none" stroke="#c4773d" stroke-width="4" stroke-dasharray="7 5"/><circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="5" fill="#c4773d"/>':'')+
      (step>=3?line(d.x,d.y,e.x,e.y,'class="construction-ink" stroke="#97632f" stroke-width="3" stroke-dasharray="5 4"')+'<path class="construction-ink" d="'+arc(p.x,p.y,copiedChord,80,160)+'" fill="none" stroke="#97632f" stroke-width="4" stroke-dasharray="7 5"/>'+line(p.x,p.y,q.x,q.y,'class="construction-ink" stroke="#97632f" stroke-width="2.5" stroke-dasharray="5 4"')+'<circle cx="'+q.x.toFixed(1)+'" cy="'+q.y.toFixed(1)+'" r="6" fill="#97632f"/><text x="330" y="287" text-anchor="middle" fill="#7a6045" font-size="14">以 P 为圆心、DE 为开度画弧，与新圆弧交于 Q</text>':'')+
      (step>=4?line(o.x,o.y,rayEnd.x,rayEnd.y,'class="construction-ink" stroke="#355f67" stroke-width="5" stroke-linecap="round"')+'<path class="construction-ink" d="M '+(o.x+34).toFixed(1)+' '+o.y.toFixed(1)+' A 34 34 0 0 0 '+angleEnd.x.toFixed(1)+' '+angleEnd.y.toFixed(1)+'" fill="none" stroke="#c4773d" stroke-width="8" stroke-linecap="round"/>':'')+
      '<g fill="#21474f" font-size="18" font-weight="700"><text x="128" y="195">A</text><text x="488" y="195">O</text></g>'+
      (step>=1?'<g fill="#8b5a32" font-size="15"><text x="'+(d.x+5).toFixed(1)+'" y="'+(d.y+22).toFixed(1)+'">D</text><text x="'+(e.x-15).toFixed(1)+'" y="'+(e.y-8).toFixed(1)+'">E</text></g>':'')+
      (step>=2?'<text x="'+(p.x+5).toFixed(1)+'" y="'+(p.y+22).toFixed(1)+'" fill="#8b5a32" font-size="15">P</text>':'')+
      (step>=3?'<text x="'+(q.x-15).toFixed(1)+'" y="'+(q.y-8).toFixed(1)+'" fill="#8b5a32" font-size="15">Q</text>':'')+
      '<text x="145" y="38" text-anchor="middle" fill="#526d70" font-size="16">源角</text><text x="505" y="38" text-anchor="middle" fill="#526d70" font-size="16">新位置</text></svg>';
  }
  function proofSvg(step){
    return '<svg viewBox="0 0 650 330" role="img" aria-label="用复制角和平行线唯一性证明同位角相等">'+
      '<title>直线l平行于m，截线t与它们相交；过B构造射线BN，其所在直线记作n</title>'+
      '<g fill="none" stroke-linecap="round">'+
      '<line x1="55" y1="82" x2="595" y2="82" stroke="#355f67" stroke-width="5"/>'+
      '<line x1="55" y1="244" x2="595" y2="244" stroke="#779094" stroke-width="5"/>'+
      '<line x1="218" y1="25" x2="393" y2="305" stroke="#355f67" stroke-width="5"/>'+
      (step>=1?'<line class="proof-ink" x1="119" y1="244" x2="594" y2="244" stroke="#c4773d" stroke-width="8" stroke-dasharray="12 8"/>':'')+
      '</g>'+
      '<g fill="#21474f" font-size="18" font-weight="700"><text x="604" y="88">l</text><text x="604" y="250">m</text><text x="398" y="305">t</text><text x="244" y="73">A</text><text x="337" y="270">B</text></g>'+
      '<path d="M 253 82 L 292 82 A 39 39 0 0 1 274 115 Z" fill="#e9c79d" opacity=".85"/>'+
      (step>=1?'<path class="proof-ink" d="M 355 244 L 394 244 A 39 39 0 0 1 376 277 Z" fill="#e9c79d" opacity=".85"/><text x="515" y="228" fill="#a85f33" font-size="18" font-weight="700">构造候选 n</text>':'')+
      (step>=2?'<text class="proof-ink" x="82" y="61" fill="#355f67" font-size="18" font-weight="700">n ∥ l</text>':'')+
      (step>=3?'<text class="proof-ink" x="520" y="292" fill="#416c59" font-size="20" font-weight="700">n＝m</text>':'')+
      '</svg>';
  }
  function transferSvg(){
    return '<svg viewBox="0 0 650 410" role="img" aria-label="两条旋转后的平行线p和q被截线r所截，标出角1、角2、角3">'+
      '<title>p平行于q，角1与角3是同位角，角3与角2是对顶角</title><g transform="rotate(14 325 205)">'+
      '<g fill="none" stroke="#355f67" stroke-width="5" stroke-linecap="round"><line x1="55" y1="120" x2="600" y2="120"/><line x1="55" y1="280" x2="600" y2="280"/><line x1="235" y1="20" x2="405" y2="380"/></g>'+
      '<g fill="#21474f" font-size="19" font-weight="700"><text x="606" y="126">p</text><text x="606" y="286">q</text><text x="410" y="382">r</text></g>'+
      '<path d="M 282 120 L 321 120 A 39 39 0 0 1 300 155 Z" fill="#e7b981" opacity=".88"/><text x="314" y="158" fill="#6f492b" font-size="18" font-weight="700">∠1</text>'+
      '<path d="M 358 280 L 319 280 A 39 39 0 0 1 340 245 Z" fill="#a8c6bd" opacity=".9"/><text x="306" y="248" fill="#315f59" font-size="18" font-weight="700">∠2</text>'+
      '<path d="M 358 280 L 397 280 A 39 39 0 0 1 376 315 Z" fill="#e7b981" opacity=".88"/><text x="389" y="319" fill="#6f492b" font-size="18" font-weight="700">∠3</text>'+
      '</g></svg>';
  }

  function choices(items,selected,label,idKey=false){
    return '<div class="parallel-choices" role="group" aria-label="'+esc(label)+'">'+items.map((item,index)=>{
      const value=idKey?item.id:index,text=idKey?item.text:item;
      return '<button type="button" data-choice="'+esc(value)+'" aria-pressed="'+String(selected===value)+'">'+esc(text)+'</button>';
    }).join('')+'</div>';
  }
  function reason(prefix,label,value,unsure,placeholder='一句话、关键词或一个算式都可以。'){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" maxlength="900" rows="3" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindReason(prefix,valueKey,unsureKey){
    const field=host.querySelector('#'+prefix+'-reason'),unsure=host.querySelector('#'+prefix+'-unsure');
    field.addEventListener('input',()=>{state[valueKey]=field.value.slice(0,900);if(field.value.trim()){state[unsureKey]=false;unsure.checked=false;}save();});
    unsure.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function bindChoice(stateKey,parse=value=>value){
    host.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
      state[stateKey]=parse(button.dataset.choice);
      host.querySelectorAll('[data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      save();
    });
  }
  function bindHelp(index){
    host.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)log.help(index,details.dataset.help);}));
  }
  function message(value){const box=host.querySelector('#parallel-message');if(box)box.textContent=value;}
  function corrective(index,label,value){log.help(index,'自动纠错反馈：'+label);message(value);}
  function base(label,title,body,actions=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="parallel-message" role="status"></p>'+actions+'</section>';
  }
  function progress(){
    document.querySelectorAll('.parallel-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});host.scrollIntoView({block:'start'});}
  function rerenderAndFocus(selector){render();host.querySelector(selector)?.focus({preventScroll:true});}
  function validReason(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function radiusLabel(value){return value<70?'较短':value<85?'中等':'较长';}
  function openingLabel(value){return value<50?'较窄':value<75?'中等':'较宽';}

  function renderCopyInitial(){
    const body='<p class="parallel-lead">桌上只有直尺和没有刻度的圆规。要在点 O 复制 ∠A，哪一种想法真正能把“开口大小”搬过去？先判断，再看作图。</p>'+choices(L.copyChoices,state.copyChoice,'复制角的第一次判断')+reason('copy-first','我觉得它能成功，是因为……',state.copyReason,state.copyUnsure);
    host.innerHTML=base('先判断 / 留住首答','圆规没有刻度，怎样复制一个角？',body,'<button class="primary" id="copy-first-submit">留下判断，开始作图 →</button>');
    bindChoice('copyChoice',Number);bindReason('copy-first','copyReason','copyUnsure');
    host.querySelector('#copy-first-submit').onclick=()=>{
      if(state.copyChoice===null){message('先选一种想法。');return;}
      const why=validReason(state.copyReason,state.copyUnsure);if(!why){message('再留一句理由；说不清也可以如实勾选。');return;}
      log.submit(0,L.copyChoices[state.copyChoice],state.copyChoice===1,why);
      state.phase0='lab';save();render(true);
    };
  }
  function copyCheckButtons(){
    return '<div class="parallel-checks" role="group" aria-label="选择复制角必须保持的量">'+L.copyChecks.map((item,index)=>'<button type="button" data-check="'+item.id+'" aria-pressed="'+String(state.copyPicks.includes(item.id))+'"><span>'+(index+1)+'</span>'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function renderCopyLab(){
    const notes=['以 A 为圆心画弧，交两边于 D、E','圆规开口不变，以 O 为圆心画弧，交起始射线于 P','把圆规改成弦长 DE，以 P 为圆心在新弧上找到 Q','连接 OQ，得到与源角相等的新角'];
    const stepStatus=state.constructStep?('第 '+state.constructStep+' / 4 笔：'+notes[state.constructStep-1]):'准备开始：先观察源角和新位置。';
    const body='<p class="parallel-lead">每按一次“下一笔”，只搬一种距离。半径可以调，但两边必须使用同一个半径；角也可以换，方法不变。</p><div class="construction-lab"><div class="construction-stage"><div id="construction-live">'+constructionSvg(state.constructStep)+'</div><section class="construction-notes"><h3>作图清单</h3><ol>'+notes.map((note,index)=>'<li class="'+(index+1<state.constructStep?'done':index+1===state.constructStep?'current':'')+'">'+esc(note)+'</li>').join('')+'</ol></section></div><div class="parallel-controls"><label for="copy-radius">试换一种圆规开度 <output id="copy-radius-out">'+radiusLabel(state.radius)+'</output></label><input id="copy-radius" type="range" min="58" max="96" step="1" value="'+state.radius+'" aria-valuetext="'+radiusLabel(state.radius)+'"><label for="copy-opening">拖动源角的开口 <output id="copy-opening-out">'+openingLabel(state.opening)+'</output></label><input id="copy-opening" type="range" min="34" max="92" step="1" value="'+state.opening+'" aria-valuetext="'+openingLabel(state.opening)+'"></div><div class="parallel-actions"><button class="secondary" id="construction-restart">重新画</button><button class="primary" id="construction-next">'+(state.constructStep<4?'下一笔 →':'再看一遍')+'</button></div><p class="parallel-readout" id="copy-readout" aria-live="polite"><b>'+esc(stepStatus)+'</b><br>你可以改变圆规开度或源角；新位置始终复制当前这组<b>同半径＋同弦长</b>，全程不用读角度数。</p></div><section class="borrowed-fact"><b>这里借用一个以后正式学习的事实</b><small>△ADE 与 △OPQ 的三条对应边分别相等：AD＝AE＝OP＝OQ（相同半径），DE＝PQ（搬过去的弦长）。因此两个三角形形状、大小相同，∠A＝∠POQ。初中会把“三边分别相等”简称为 SSS；本课先借用，不把它冒充已经证明完的定理。</small></section><h3>作图之后，检查真正不能变的量</h3>'+copyCheckButtons()+reason('copy-final','不用度数，你怎样解释新角与源角相等？',state.copyExplain,state.copyExplainUnsure,'可写“相同半径、相同弦长”在两个三角形中怎样对应。')+'<details class="parallel-help" data-help="复制角提示"><summary>给我一点提示</summary><p>射线可以无限延长，画在纸上的长短不是角的大小。找一找两个三角形中哪三组线段分别相等。</p></details><details class="parallel-help" data-help="复制角完整关系"><summary>我还需要完整关系</summary><p>相同半径给出四条相等的半径，搬弦长再给出第三组相等边。借用 SSS，可知两个三角形的对应角相等。</p></details>';
    host.innerHTML=base('动手作图 / 再解释为什么','半径和弦长，分别搬走了什么？',body,'<button class="primary" id="copy-final-submit">保存作图结论 →</button>');
    function redraw(){
      host.querySelector('#construction-live').innerHTML=constructionSvg(state.constructStep);
      host.querySelector('#copy-radius-out').textContent=radiusLabel(state.radius);host.querySelector('#copy-opening-out').textContent=openingLabel(state.opening);
      host.querySelector('#copy-radius').setAttribute('aria-valuetext',radiusLabel(state.radius));host.querySelector('#copy-opening').setAttribute('aria-valuetext',openingLabel(state.opening));
    }
    host.querySelector('#copy-radius').oninput=event=>{state.radius=Number(event.target.value);save();redraw();};
    host.querySelector('#copy-opening').oninput=event=>{state.opening=Number(event.target.value);save();redraw();};
    host.querySelector('#construction-restart').onclick=()=>{state.constructStep=0;state.constructSeen=[];save();rerenderAndFocus('#construction-restart');};
    host.querySelector('#construction-next').onclick=()=>{
      state.constructStep=state.constructStep<4?state.constructStep+1:0;
      if(!state.constructSeen.includes(state.constructStep))state.constructSeen=[...state.constructSeen,state.constructStep];
      save();rerenderAndFocus('#construction-next');
    };
    host.querySelectorAll('[data-check]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.check;
      state.copyPicks=state.copyPicks.includes(id)?state.copyPicks.filter(value=>value!==id):[...state.copyPicks,id];
      button.setAttribute('aria-pressed',String(state.copyPicks.includes(id)));save();
    });
    bindReason('copy-final','copyExplain','copyExplainUnsure');bindHelp(0);
    host.querySelector('#copy-final-submit').onclick=()=>{
      if(!state.constructSeen.includes(4)){message('先把四笔作图走完，亲眼看见半径和弦长怎样搬过去。');return;}
      if(!state.copyPicks.length){message('再选出复制时真正不能变的量。');return;}
      const why=validReason(state.copyExplain,state.copyExplainUnsure);if(!why){message('留一句自己的解释；说不清也可以如实勾选。');return;}
      const correct=L.sameSet(state.copyPicks,L.copyAnswer);
      const answer='作图自检：'+state.copyPicks.map(id=>L.copyChecks.find(item=>item.id===id)?.text||id).join('；');
      log.submit(0,answer,correct,why);
      if(!correct){corrective(0,'射线长度与圆规搬运的距离','还要区分“射线画多长”和“圆规搬哪段距离”。首答已保留，可以回看作图再改。');return;}
      log.note(0,'亲手完成四笔尺规复制角；页面借用SSS解释可靠性，未把SSS标成已在本课证明。');
      log.finish(0,state.copyExplainUnsure?'作图与结构化检查正确；自己的解释暂时说不清':'能用相同半径和相同弦长说明复制角；开放解释未自动判分');render(true);
    };
  }

  function renderDirectionOne(){
    const body='<p class="parallel-lead">已知直线 l ∥ m，被截线 t 所截；目标是证明一对同位角相等。先判断这道题从什么条件走向什么结论。</p><div class="parallel-route"><article><b>已知</b><span>l ∥ m</span></article><span>→</span><article><b>目标</b><span>同位角相等</span></article></div>'+choices(L.directionOptions,state.direction1,'判断平行线推理方向',true)+reason('direction-one','为什么不能直接把目标当理由？',state.directionReason,state.directionUnsure);
    host.innerHTML=base('先定方向 / 防止循环','已知线平行，证明角相等：该走哪条路？',body,'<button class="primary" id="direction-one-submit">保存判断，进入证明 →</button>');
    bindChoice('direction1');bindReason('direction-one','directionReason','directionUnsure');
    host.querySelector('#direction-one-submit').onclick=()=>{
      if(!state.direction1){message('先判断这是“角到线”还是“线到角”。');return;}
      const why=validReason(state.directionReason,state.directionUnsure);if(!why){message('再留一句理由；说不清也可以如实勾选。');return;}
      const item=L.directionOptions.find(option=>option.id===state.direction1);
      const correct=state.direction1==='property';log.submit(1,item.text,correct,why);
      if(!correct){corrective(1,'判定与性质的方向',state.direction1==='criterion'?'判定的方向是“角相等→线平行”；本题已知却是线平行。先把箭头转回来。':'测量只能验证这张图，不能证明任意位置都必然成立。');return;}
      state.phase1='proof';save();render(true);
    };
  }
  function selectedList(ids,cards){
    if(!ids.length)return '<p class="sequence-empty" aria-live="polite">还没有放入步骤。按你认为的先后顺序点击下方卡片。</p>';
    return '<ol class="sequence-list" aria-live="polite">'+ids.map(id=>'<li>'+esc(cards.find(card=>card.id===id)?.text||id)+'<button type="button" data-remove="'+id+'" aria-label="移除这一步">×</button></li>').join('')+'</ol>';
  }
  function sequenceCards(cards,selected,limit){
    return '<div class="parallel-sequence" role="group" aria-label="按顺序选择证明步骤">'+cards.map(card=>'<button type="button" data-proof="'+card.id+'" aria-pressed="'+String(selected.includes(card.id))+'" '+(selected.includes(card.id)?'disabled':'')+'>'+esc(card.text)+'</button>').join('')+'</div><p class="parallel-label">已放入 '+selected.length+' / '+limit+' 步</p>';
  }
  function renderParallelProof(){
    const demoNotes=['把待证性质放在一边，只保留已知 l ∥ m','在同位角对应的一侧作射线 BN，把 BN 所在直线记作 n','由相等同位角判定 n ∥ l','m、n 都过 B 且平行于 l；唯一性迫使 n 与 m 重合'];
    const body='<p class="parallel-lead">我们不直接使用“平行线同位角相等”。先在同位角对应的一侧过 B 复制源角，作射线 BN，并把 BN 所在直线记作 n；再用两个允许的事实把 n 锁回 m。</p><div class="proof-lab"><div id="parallel-proof-live">'+proofSvg(state.proofDemoStep)+'</div><div class="parallel-actions"><button class="secondary" id="proof-demo-restart">从头看</button><button class="primary" id="proof-demo-next">'+(state.proofDemoStep<3?'下一步 →':'再看一遍')+'</button></div><p class="parallel-readout" aria-live="polite"><b>演示 '+state.proofDemoStep+' / 3：</b>'+esc(demoNotes[state.proofDemoStep])+'</p></div><div class="logic-key"><div><b>允许使用 ①</b>复制角得到相等角</div><div><b>允许使用 ②</b>同位角相等 ⇒ 两直线平行（判定）</div><div><b>允许使用 ③</b>过线外一点只有一条平行线</div><div class="do-not-use"><b>此处禁止偷用</b>两直线平行 ⇒ 同位角相等（这正是待证结论）</div></div><h3>撤掉演示，自己排出证明链</h3>'+selectedList(state.proofPicks,L.proofCards)+sequenceCards(L.proofCards,state.proofPicks,4)+reason('parallel-proof','哪一步阻止了“另一条平行线”出现？',state.proofExplain,state.proofExplainUnsure,'写出“过B、平行于l、唯一”之间的关系。')+'<details class="parallel-help" data-help="平行性质证明提示一"><summary>提示1：先造出什么？</summary><p>在同位角对应的一侧过 B 复制源角，作射线 BN，并把 BN 所在直线记作 n。这样才能使用“同位角相等可以判平行”这条方向相反的事实。</p></details><details class="parallel-help" data-help="平行性质证明提示二"><summary>提示2：n 为什么必须和 m 重合？</summary><p>它们都经过同一个点 B，也都平行于 l。平行线唯一性不允许两条不同的候选线同时存在。</p></details>';
    host.innerHTML=base('构造一条候选线 / 再由唯一性锁定','怎样证明同位角相等，又不偷偷使用它？',body,'<button class="primary" id="parallel-proof-submit">检查证明链 →</button>');
    host.querySelector('#proof-demo-restart').onclick=()=>{state.proofDemoStep=0;save();rerenderAndFocus('#proof-demo-restart');};
    host.querySelector('#proof-demo-next').onclick=()=>{state.proofDemoStep=state.proofDemoStep<3?state.proofDemoStep+1:0;save();rerenderAndFocus('#proof-demo-next');};
    host.querySelectorAll('[data-proof]').forEach(button=>button.onclick=()=>{
      if(state.proofPicks.length>=4){message('证明只需要4步；先移除一项再换。');return;}
      const id=button.dataset.proof;state.proofPicks=[...state.proofPicks,id];save();rerenderAndFocus('[data-remove="'+id+'"]');
    });
    host.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{const id=button.dataset.remove;state.proofPicks=state.proofPicks.filter(value=>value!==id);save();rerenderAndFocus('[data-proof="'+id+'"]');});
    bindReason('parallel-proof','proofExplain','proofExplainUnsure');bindHelp(1);
    host.querySelector('#parallel-proof-submit').onclick=()=>{
      if(state.proofDemoStep<3){message('先把构造演示走到“唯一性锁定”，再独立排证明。');return;}
      if(state.proofPicks.length!==4){message('请按先后放入完整的4步证明链。');return;}
      const why=validReason(state.proofExplain,state.proofExplainUnsure);if(!why){message('再留一句自己的解释；说不清也可以如实勾选。');return;}
      const correct=L.sameOrder(state.proofPicks,L.proofAnswer);
      const answer=state.proofPicks.map(id=>L.proofCards.find(card=>card.id===id)?.text||id).join(' → ');
      log.submit(1,answer,correct,why);state.proofAttempted=true;save();
      if(!correct){corrective(1,'无循环证明链',state.proofPicks.includes('circle')?'这条链把待证的“平行线同位角相等”提前当了理由，形成循环。首答已保留，请换成构造、判定、唯一性。':'检查先后：先复制角，才能用判定；先得到两条平行线，才能用唯一性。');return;}
      log.note(1,'证明起点限定为复制角、同位角相等判平行、平行线唯一性；未调用待证性质。');
      log.finish(1,state.proofExplainUnsure?'证明链顺序正确；唯一性理由暂时说不清':'能用构造加唯一性完成无循环的平行线性质证明；开放解释未自动判分');render(true);
    };
  }

  function renderDirectionTwo(){
    const body='<p class="parallel-lead">新图整体旋转了。已知 p ∥ q，目标是证明内错位置的 ∠1＝∠2。颜色只是帮助找位置，真正决定推理方向的是已知条件。</p><div class="transfer-layout"><figure class="transfer-figure">'+transferSvg()+'<figcaption>p ∥ q；∠1 与 ∠2 位于两条线之间、截线两侧。</figcaption></figure><div><div class="proof-givens"><span>已知：p ∥ q</span><span>目标：∠1＝∠2</span></div>'+choices(L.transferDirections,state.direction2,'迁移题先判断推理方向',true)+'</div></div>';
    host.innerHTML=base('陌生图先不追角 / 先看箭头','这一次该用“角→线”，还是“线→角”？',body,'<button class="primary" id="direction-two-submit">确定方向，再组织证明 →</button>');
    bindChoice('direction2');
    host.querySelector('#direction-two-submit').onclick=()=>{
      if(!state.direction2){message('先根据“已知”和“目标”判断箭头方向。');return;}
      const item=L.transferDirections.find(option=>option.id===state.direction2),correct=state.direction2==='property';
      log.submit(2,item.text,correct);
      if(!correct){corrective(2,'判定与性质的方向',state.direction2==='criterion'?'判定用于“角相等→线平行”；这里已经给出 p ∥ q，应从线平行走向角关系。':'两个方向不能混用；先看已知在箭头哪一端。');return;}
      state.phase2='proof';save();render(true);
    };
  }
  function renderTransferProof(){
    const body='<p class="parallel-lead">∠1 与 ∠2 不是同位角。可以找一个“中转角”∠3：一边用刚证明过的平行线性质，一边用 G0 的对顶角。</p><div class="transfer-layout"><figure class="transfer-figure">'+transferSvg()+'<figcaption>把 ∠1 接到 ∠3，再把 ∠3 接到 ∠2。</figcaption></figure><div class="relation-chain"><p><b>平行线性质：</b>同位角</p><p><b>G0 已证：</b>对顶角</p><p><b>最后：</b>等量代换</p></div></div><h3>先放入两条依据（次序可换），最后放结论</h3>'+selectedList(state.transferPicks,L.transferCards)+sequenceCards(L.transferCards,state.transferPicks,3)+'<section class="audit-box"><h3>再审一句常见说法</h3><p class="audit-claim">“两条直线被第三条直线所截，内错角相等。”</p><p>这句话少了什么，才会从“有这个位置关系”变成“必然相等”？</p><div class="parallel-audit" role="group" aria-label="判断缺少的条件">'+L.auditOptions.map((item,index)=>'<button type="button" data-audit="'+index+'" aria-pressed="'+String(state.auditChoice===index)+'">'+esc(item)+'</button>').join('')+'</div></section>'+reason('transfer-proof','你怎样检查自己没有把判定和性质用反？',state.transferExplain,state.transferExplainUnsure,'可以从“已知是什么，结论是什么”开始说。')+'<details class="parallel-help" data-help="旋转图证明提示"><summary>给我一点提示</summary><p>∠1 与 ∠3 是同位角；∠3 与 ∠2 是对顶角。前两条依据次序可以交换，但结论必须等它们都建立后再写。</p></details><details class="parallel-help" data-help="判定与性质方向提示"><summary>我总把判定和性质弄反</summary><p>判定：看到角关系，判断线是否平行。性质：已经知道线平行，推出角关系。先把“已知→目标”写成箭头。</p></details>';
    host.innerHTML=base('独立迁移 / 中转角与条件审计','内错角为什么相等？少一个条件还成立吗？',body,'<button class="primary" id="transfer-proof-submit">检查证明与条件 →</button>');
    host.querySelectorAll('[data-proof]').forEach(button=>button.onclick=()=>{
      if(state.transferPicks.length>=3){message('这条证明只需要3步；先移除一项再换。');return;}
      const id=button.dataset.proof;state.transferPicks=[...state.transferPicks,id];save();rerenderAndFocus('[data-remove="'+id+'"]');
    });
    host.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{const id=button.dataset.remove;state.transferPicks=state.transferPicks.filter(value=>value!==id);save();rerenderAndFocus('[data-proof="'+id+'"]');});
    host.querySelectorAll('[data-audit]').forEach(button=>button.onclick=()=>{state.auditChoice=Number(button.dataset.audit);host.querySelectorAll('[data-audit]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    bindReason('transfer-proof','transferExplain','transferExplainUnsure');bindHelp(2);
    host.querySelector('#transfer-proof-submit').onclick=()=>{
      if(state.transferPicks.length!==3){message('先按顺序放入完整的3步证明。');return;}
      if(state.auditChoice===null){message('再审计那句话缺少哪个条件。');return;}
      const why=validReason(state.transferExplain,state.transferExplainUnsure);if(!why){message('再留一句检查方法；说不清也可以如实勾选。');return;}
      const chainCorrect=L.validTransferOrder(state.transferPicks),auditCorrect=state.auditChoice===0,correct=chainCorrect&&auditCorrect;
      const answer='证明：'+state.transferPicks.map(id=>L.transferCards.find(card=>card.id===id)?.text||id).join(' → ')+'；条件审计：'+L.auditOptions[state.auditChoice];
      log.submit(2,answer,correct,why);state.transferAttempted=true;save();
      if(!chainCorrect){corrective(2,'中转角证明链',state.transferPicks.includes('position')?'“是内错角”只说明位置，不能单独推出相等；需要先使用 p ∥ q 得到同位角关系。':'找 ∠3 做中转：同位角和对顶角两条依据可以互换，但等量代换必须最后写。');return;}
      if(!auditCorrect){corrective(2,'内错角相等的必要条件','把 p、q 稍微转得不平行，内错位置仍存在，但两个角通常不相等。缺少的是“两直线平行”。');return;}
      log.note(2,'在旋转图中先判断“线平行→角相等”，再用同位角、对顶角与等量代换；审出内错角相等缺少平行条件。');
      log.finish(2,state.transferExplainUnsure?'结构化迁移与条件审计正确；自己的方向检查方法暂时说不清':'能在新图中区分判定与性质并审计证明条件；开放解释未自动判分');render(true);
    };
  }

  function finish(){
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">G1 · 证明工具箱收好</p><h2 tabindex="-1">几何不是“看起来平行”，而是每个箭头都有来处。</h2><p class="parallel-takeaway"><b>复制角：</b>相同半径＋相同弦长，借用 SSS 说明对应角相等。<br><b>证明平行线性质：</b>复制角造候选线 → 相等同位角判平行 → 唯一性迫使重合。<br><b>陌生图：</b>先写“已知→目标”，再决定用判定还是性质；角的位置名称本身不是相等条件。</p><p>页面记录了结构化选择、提示和孩子留下的原话；开放解释没有按关键词自动判分。隔几天只看旋转图再口头说一遍，才能检查是否真正迁移。</p>'+log.html()+'<div class="parallel-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school">回到 TY敏捷课堂</a><button class="secondary" id="parallel-restart">重新练一轮（保留旧记录）</button></div></section>';
    host.querySelector('#parallel-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,constructSeen:[],copyPicks:[],proofPicks:[],transferPicks:[]};save();render(true);};
  }
  function render(focus=false){
    progress();
    if(log.index>=L.tasks.length)finish();
    else if(log.index===0)state.phase0==='initial'?renderCopyInitial():renderCopyLab();
    else if(log.index===1)state.phase1==='direction'?renderDirectionOne():renderParallelProof();
    else state.phase2==='direction'?renderDirectionTwo():renderTransferProof();
    progress();if(focus)focusCard();
  }
  render();
})();
