'use strict';
(function(){
  const host=document.querySelector('#rigidmotion-task');
  const sources=document.querySelector('#rigidmotion-sources');
  const L=window.RigidMotionLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="rigid-refresh">重新打开</button></section>';
    document.querySelector('#rigid-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id)){
    const after=F.courses.findIndex(course=>course[0]==='polygon360');
    F.courses.splice(after+1,0,[L.id,L.title,'rigidmotion.html']);
  }

  const esc=F.esc;
  const defaults={
    coldChoices:[],coldReason:'',coldUnsure:false,
    labMode:'translation',translationPreset:'right-up',rotationCenter:'o1',rotationAngle:45,reflectionAxis:'vertical',
    translationSeen:[],rotationSeen:[],reflectionSeen:[],inverseMode:false,
    labChoices:[],labReason:'',labUnsure:false,labAttempted:false,labSolved:false,
    reportChoices:[],reportBReason:null,lengthAnswer:'',angleAnswer:'',scaleLengthAnswer:'',scaleAreaAnswer:'',
    transferReason:'',transferUnsure:false,transferAttempted:false
  };
  const allowedInvariant=L.invariantOptions.map(item=>item.id);
  const allowedReports=L.transferReports.map(item=>item.id);
  const allowedBReasons=L.reportBReasons.map(item=>item.id);
  const allowedModes=['translation','rotation','reflection','summary'];
  const cleanText=(value,max=900)=>typeof value==='string'?value.slice(0,max):'';
  function uniqueAllowed(values,allowed,max=20){
    if(!Array.isArray(values))return [];
    const set=new Set(allowed),result=[];
    for(const value of values)if(set.has(value)&&!result.includes(value)){result.push(value);if(result.length>=max)break;}
    return result;
  }
  function oneOf(value,allowed,fallback){return allowed.includes(value)?value:fallback;}
  function loadState(){
    const saved=log.checkpoint.rigidmotion||{};
    return {
      ...defaults,...saved,
      coldChoices:uniqueAllowed(saved.coldChoices,allowedInvariant,allowedInvariant.length),coldReason:cleanText(saved.coldReason),coldUnsure:!!saved.coldUnsure,
      labMode:oneOf(saved.labMode,allowedModes,'translation'),
      translationPreset:oneOf(saved.translationPreset,L.translationPresets.map(item=>item.id),'right-up'),
      rotationCenter:oneOf(saved.rotationCenter,L.rotationCenters.map(item=>item.id),'o1'),
      rotationAngle:L.rotationAngles.includes(Number(saved.rotationAngle))?Number(saved.rotationAngle):45,
      reflectionAxis:oneOf(saved.reflectionAxis,L.reflectionAxes.map(item=>item.id),'vertical'),
      translationSeen:uniqueAllowed(saved.translationSeen,L.translationPresets.map(item=>item.id),L.translationPresets.length),
      rotationSeen:uniqueAllowed(saved.rotationSeen,L.rotationCenters.flatMap(center=>L.rotationAngles.map(angle=>center.id+':'+angle)),12),
      reflectionSeen:uniqueAllowed(saved.reflectionSeen,L.reflectionAxes.map(item=>item.id),L.reflectionAxes.length),
      inverseMode:!!saved.inverseMode,
      labChoices:uniqueAllowed(saved.labChoices,allowedInvariant,allowedInvariant.length),labReason:cleanText(saved.labReason),labUnsure:!!saved.labUnsure,labAttempted:!!saved.labAttempted,labSolved:!!saved.labSolved,
      reportChoices:uniqueAllowed(saved.reportChoices,allowedReports,allowedReports.length),reportBReason:oneOf(saved.reportBReason,allowedBReasons,null),
      lengthAnswer:cleanText(saved.lengthAnswer,40),angleAnswer:cleanText(saved.angleAnswer,40),scaleLengthAnswer:cleanText(saved.scaleLengthAnswer,40),scaleAreaAnswer:cleanText(saved.scaleAreaAnswer,40),
      transferReason:cleanText(saved.transferReason),transferUnsure:!!saved.transferUnsure,transferAttempted:!!saved.transferAttempted
    };
  }
  let log=F.create(L.title,L.tasks);
  let state=loadState();
  function save(){log.point({rigidmotion:state});}
  function message(value,error=false){const box=host.querySelector('#rigid-message');if(box){box.textContent=value;box.dataset.error=String(error);}}
  function validReason(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function progress(){
    document.querySelectorAll('.rigid-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',index<log.index);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
      item.setAttribute('aria-label',(index<log.index?'已完成：':index===log.index?'当前：':'待完成：')+item.textContent.trim());
    });
  }
  function focusCard(){
    requestAnimationFrame(()=>{
      const heading=host.querySelector('h2');
      if(!heading)return;
      heading.focus();
      heading.scrollIntoView({block:'start',behavior:'auto'});
    });
  }
  function base(label,title,body,actions=''){
    return '<section class="parallel-card rigid-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<p class="parallel-error" id="rigid-message" role="status" aria-live="polite"></p>'+actions+'</section>';
  }
  function bindHelp(index){F.watchHelp(host,log,index);}
  function bindText(id,key,unsureKey){
    const input=host.querySelector('#'+id);input.addEventListener('input',()=>{state[key]=input.value.slice(0,900);if(unsureKey&&input.value.trim()){state[unsureKey]=false;const checkbox=host.querySelector('#'+id.replace('-reason','-unsure'));if(checkbox)checkbox.checked=false;}save();});
  }
  function reason(prefix,label,value,unsure,placeholder){
    return '<div class="parallel-reason rigid-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" rows="3" maxlength="900" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindReason(prefix,valueKey,unsureKey){
    bindText(prefix+'-reason',valueKey,unsureKey);
    host.querySelector('#'+prefix+'-unsure').onchange=event=>{state[unsureKey]=event.target.checked;save();};
  }
  function checklist(options,selected,name){
    return '<div class="rigid-checklist" role="group" aria-label="'+esc(name)+'">'+options.map(item=>'<label><input type="checkbox" data-check="'+esc(item.id)+'" '+(selected.includes(item.id)?'checked':'')+'><span>'+esc(item.text)+'</span></label>').join('')+'</div>';
  }
  function bindChecklist(key){
    host.querySelectorAll('[data-check]').forEach(input=>input.onchange=()=>{state[key]=[...host.querySelectorAll('[data-check]:checked')].map(item=>item.dataset.check);save();});
  }
  function coldSvg(){
    const mini='-54,-37 23,-49 65,12 10,69 -69,35';
    return '<svg class="rigid-cold-svg" viewBox="0 0 420 220" role="img" aria-labelledby="rigid-cold-title"><title id="rigid-cold-title">同一枚不对称徽标被放到另一处、转过方向或翻到另一面</title><defs><linearGradient id="cold-fill" x1="0" x2="1"><stop stop-color="#d8eee8"/><stop offset="1" stop-color="#fff1d8"/></linearGradient></defs><g transform="translate(78 91) scale(.55)"><polygon points="'+mini+'"/><text x="-11" y="7">T</text></g><g transform="translate(210 91) rotate(68) scale(.55)"><polygon points="'+mini+'"/><text x="-11" y="7">T</text></g><g transform="translate(342 91) scale(-.55 .55)"><polygon points="'+mini+'"/><text x="-11" y="7" transform="scale(-1 1)">T</text></g><g class="rigid-cold-labels"><text x="78" y="186">放到另一处</text><text x="210" y="186">转个方向</text><text x="342" y="186">翻到另一面</text></g></svg>';
  }
  function renderCold(){
    const body='<p class="parallel-lead">想象这枚硬质探测器徽标没有被拉伸、剪断或压扁，只是整块搬动。下面哪些量在三种搬法中都<strong>一定不变</strong>？其余项目不是“一定会变”，而是<strong>可能改变</strong>。</p>'+coldSvg()+checklist(L.invariantOptions,state.coldChoices,'选择你认为一定不变的量')+reason('cold','先留一句理由。',state.coldReason,state.coldUnsure,'例如：我认为……一定不变，因为……。');
    host.innerHTML=base('环节一 · 冷判断','先别看术语：搬过以后，它还是原来的图吗？',body,'<button class="primary" id="cold-submit">封存首答，进入实验台 →</button>');
    bindChecklist('coldChoices');bindReason('cold','coldReason','coldUnsure');
    host.querySelector('#cold-submit').onclick=()=>{
      if(!state.coldChoices.length){message('至少选择一项你认为一定不变的量。',true);return;}
      const why=validReason(state.coldReason,state.coldUnsure);if(!why){message('留一句理由；暂时说不清也可以如实勾选。',true);return;}
      const answer='我判断一定不变：'+state.coldChoices.map(id=>L.invariantOptions.find(item=>item.id===id)?.text||id).join('、');
      log.submit(0,answer,L.sameSet(state.coldChoices,L.invariantAnswer),why);
      log.note(0,'首答封存后才进入三种变换实验；本页未即时揭示正确分类。');
      log.finish(0,'已封存冷判断；暂不据此声称掌握');render(true);
    };
  }

  const pointsString=points=>points.map(point=>point.x.toFixed(2)+','+point.y.toFixed(2)).join(' ');
  function pointLabels(points,prime=false,className='rigid-point-labels'){
    return '<g class="'+className+'">'+points.map(point=>'<text x="'+(point.x+7).toFixed(1)+'" y="'+(point.y-7).toFixed(1)+'">'+esc(point.label)+(prime?'′':'')+'</text>').join('')+'</g>';
  }
  function currentMotion(){
    if(state.labMode==='translation'){
      const preset=L.translationPresets.find(item=>item.id===state.translationPreset);
      const image=L.shape.map(point=>L.translatePoint(point,preset.dx,preset.dy));
      return {image,back:image.map(point=>L.translatePoint(point,-preset.dx,-preset.dy)),title:'平移：'+preset.label,relation:'所有对应点都沿平行、等长、同向的箭头移动。',signature:preset.id,preset};
    }
    if(state.labMode==='rotation'){
      const center=L.rotationCenters.find(item=>item.id===state.rotationCenter),angle=state.rotationAngle;
      const image=L.shape.map(point=>L.rotatePoint(point,center,angle));
      return {image,back:image.map(point=>L.rotatePoint(point,center,-angle)),title:'旋转：'+center.label+'，'+(angle>0?'顺时针':'逆时针')+Math.abs(angle)+'°',relation:'所有点绕同一中心、沿同一方向转过同一个角度；每条半径保持不变。',signature:center.id+':'+angle,center,angle};
    }
    const axis=L.reflectionAxes.find(item=>item.id===state.reflectionAxis);
    const image=L.shape.map(point=>L.reflectPoint(point,axis.a,axis.b));
    return {image,back:image.map(point=>L.reflectPoint(point,axis.a,axis.b)),title:'轴对称变换：'+axis.label,relation:'同一条轴垂直平分每一对“点—像点”的连线；原图本身不一定是轴对称图形。',signature:axis.id,axis};
  }
  function midpoint(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
  function relationMarks(motion){
    if(state.labMode==='translation')return L.shape.slice(0,3).map((point,index)=>'<line class="rigid-relation-arrow" x1="'+point.x+'" y1="'+point.y+'" x2="'+motion.image[index].x.toFixed(2)+'" y2="'+motion.image[index].y.toFixed(2)+'" marker-end="url(#rigid-arrow)"/>').join('');
    if(state.labMode==='rotation'){
      const center=motion.center,items=[0,1];
      return '<circle class="rigid-center" cx="'+center.x+'" cy="'+center.y+'" r="6"/><text class="rigid-center-label" x="'+(center.x+9)+'" y="'+(center.y-9)+'">O</text>'+items.map(index=>'<path class="rigid-radius" d="M '+center.x+' '+center.y+' L '+L.shape[index].x+' '+L.shape[index].y+' M '+center.x+' '+center.y+' L '+motion.image[index].x.toFixed(2)+' '+motion.image[index].y.toFixed(2)+'"/>').join('')+'<text class="rigid-angle-label" x="'+(center.x+18)+'" y="'+(center.y+23)+'">共同转角 '+(motion.angle>0?'顺时针':'逆时针')+Math.abs(motion.angle)+'°</text>';
    }
    const axis=motion.axis;
    return '<line class="rigid-axis" x1="'+axis.a.x+'" y1="'+axis.a.y+'" x2="'+axis.b.x+'" y2="'+axis.b.y+'"/>'+L.shape.slice(0,3).map((point,index)=>{const image=motion.image[index],mid=midpoint(point,image);return '<line class="rigid-perpendicular" x1="'+point.x+'" y1="'+point.y+'" x2="'+image.x.toFixed(2)+'" y2="'+image.y.toFixed(2)+'"/><circle class="rigid-midpoint" cx="'+mid.x.toFixed(2)+'" cy="'+mid.y.toFixed(2)+'" r="4"/><text class="rigid-perp-label" x="'+(mid.x+5).toFixed(2)+'" y="'+(mid.y-5).toFixed(2)+'">⊥</text>';}).join('');
  }
  function labSvg(){
    const motion=currentMotion(),modeName=state.labMode==='translation'?'平移':state.labMode==='rotation'?'旋转':'轴对称变换';
    const inverse=state.inverseMode?'<polygon class="rigid-back" points="'+pointsString(motion.back)+'"/>'+pointLabels(motion.back,false,'rigid-back-labels'):'';
    return '<svg class="rigid-lab-svg" viewBox="0 0 420 300" role="img" aria-labelledby="rigid-lab-title"><title id="rigid-lab-title">'+esc(motion.title)+'。原图使用实线，像图使用虚线，并显示这次变换的对应关系。</title><defs><marker id="rigid-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z"/></marker></defs><polygon class="rigid-original" points="'+pointsString(L.shape)+'"/>'+pointLabels(L.shape,false)+relationMarks(motion)+'<polygon class="rigid-image" points="'+pointsString(motion.image)+'"/>'+pointLabels(motion.image,true,'rigid-image-labels')+inverse+'<text class="rigid-mode-title" x="18" y="26">'+modeName+'实验</text></svg>';
  }
  function orientationLabel(value){return value==='clockwise'?'顺时针':value==='counterclockwise'?'逆时针':'退化';}
  function labReadout(){
    const motion=currentMotion(),before=L.shape,after=motion.image,report=L.invariants(before,after);
    return '<div class="rigid-readout"><div><span>AB距离</span><b>'+L.distance(before[0],before[1]).toFixed(1)+' → '+L.distance(after[0],after[1]).toFixed(1)+'</b></div><div><span>∠ABC</span><b>'+L.angleAt(before[0],before[1],before[2]).toFixed(1)+'° → '+L.angleAt(after[0],after[1],after[2]).toFixed(1)+'°</b></div><div><span>周长</span><b>'+L.polygonPerimeter(before).toFixed(1)+' → '+L.polygonPerimeter(after).toFixed(1)+'</b></div><div><span>面积</span><b>'+L.polygonArea(before).toFixed(1)+' → '+L.polygonArea(after).toFixed(1)+'</b></div><div><span>绕点次序</span><b>'+orientationLabel(L.orientation(before))+' → '+orientationLabel(L.orientation(after))+'</b></div></div><p class="rigid-relation-copy"><b>'+esc(motion.title)+'</b>'+esc(motion.relation)+'</p>'+(state.inverseMode?'<p class="rigid-inverse-result">逆操作后的最大位置偏差：<b>'+Math.max(...motion.back.map((point,index)=>L.distance(point,before[index]))).toFixed(3)+'</b>。绿色点线图与原图重合。</p>':'');
  }
  function seenForMode(){return state[state.labMode+'Seen'];}
  function parameterControls(){
    if(state.labMode==='translation')return '<div class="rigid-parameter-group" role="group" aria-label="选择平移参数">'+L.translationPresets.map(item=>'<button type="button" data-translation="'+item.id+'" aria-pressed="'+String(state.translationPreset===item.id)+'">'+esc(item.label)+'</button>').join('')+'</div>';
    if(state.labMode==='rotation')return '<div class="rigid-control-stack"><div class="rigid-parameter-group" role="group" aria-label="选择旋转中心">'+L.rotationCenters.map(item=>'<button type="button" data-center="'+item.id+'" aria-pressed="'+String(state.rotationCenter===item.id)+'">'+esc(item.label)+'</button>').join('')+'</div><div class="rigid-parameter-group" role="group" aria-label="选择共同转角">'+L.rotationAngles.map(angle=>'<button type="button" data-angle="'+angle+'" aria-pressed="'+String(state.rotationAngle===angle)+'">'+(angle>0?'顺时针 ':'逆时针 ')+Math.abs(angle)+'°</button>').join('')+'</div></div>';
    return '<div class="rigid-parameter-group" role="group" aria-label="选择同一条对称轴">'+L.reflectionAxes.map(item=>'<button type="button" data-axis="'+item.id+'" aria-pressed="'+String(state.reflectionAxis===item.id)+'">'+esc(item.label)+'</button>').join('')+'</div>';
  }
  function labTabs(){
    const modes=[['translation','A 平移'],['rotation','B 旋转'],['reflection','C 轴对称变换'],['summary','D 汇总']];
    return '<div class="rigid-lab-tabs" role="group" aria-label="选择实验台">'+modes.map(([id,label])=>'<button type="button" data-mode="'+id+'" aria-pressed="'+String(state.labMode===id)+'">'+label+'</button>').join('')+'</div>';
  }
  function bindModeTabs(){
    host.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{state.labMode=button.dataset.mode;state.inverseMode=false;save();render();host.querySelector('[data-mode="'+button.dataset.mode+'"]')?.focus({preventScroll:true});});
  }
  function bindParameterButtons(){
    host.querySelectorAll('[data-translation]').forEach(button=>button.onclick=()=>{state.translationPreset=button.dataset.translation;state.inverseMode=false;save();render();host.querySelector('[data-translation="'+button.dataset.translation+'"]')?.focus({preventScroll:true});});
    host.querySelectorAll('[data-center]').forEach(button=>button.onclick=()=>{state.rotationCenter=button.dataset.center;state.inverseMode=false;save();render();host.querySelector('[data-center="'+button.dataset.center+'"]')?.focus({preventScroll:true});});
    host.querySelectorAll('[data-angle]').forEach(button=>button.onclick=()=>{state.rotationAngle=Number(button.dataset.angle);state.inverseMode=false;save();render();host.querySelector('[data-angle="'+button.dataset.angle+'"]')?.focus({preventScroll:true});});
    host.querySelectorAll('[data-axis]').forEach(button=>button.onclick=()=>{state.reflectionAxis=button.dataset.axis;state.inverseMode=false;save();render();host.querySelector('[data-axis="'+button.dataset.axis+'"]')?.focus({preventScroll:true});});
  }
  function renderLabExperiment(){
    const modeTitle=state.labMode==='translation'?'实验台A · 完整示范：所有点怎样一起走？':state.labMode==='rotation'?'实验台B · 撤一层提示：只保半径够吗？':'实验台C · 轴对称变换：同一条轴做了什么？';
    const seen=seenForMode(),motion=currentMotion();
    const guided=state.labMode==='translation'?'<p class="rigid-guidance"><b>完整示范：</b>平移要求每个点都走同一个方向、同样远；只“各走一样远”但方向不同，不是同一次平移。</p>':state.labMode==='rotation'?'<details class="parallel-help" data-help="旋转实验共同规则提示"><summary>操作后再看：还缺哪条共同规则？</summary><p>每个点不仅要保持到同一中心的距离，还要绕这个中心转过同一个有向角。</p></details>':'<details class="parallel-help" data-help="轴对称实验垂直平分提示"><summary>操作后再看：小圆点和⊥在说什么？</summary><p>每条“点—像点”连线都被同一条轴垂直平分；同一图再照一次会回到原位。</p></details>';
    const body=labTabs()+'<p class="parallel-lead">选择参数后，先看图中对应关系与测量值，再点“记录这次”。同一实验要留下两个不同参数状态。</p><div class="rigid-lab-grid"><div>'+labSvg()+'</div><div class="rigid-console"><h3>'+esc(modeTitle)+'</h3>'+parameterControls()+'<p class="rigid-seen">已记录 <b>'+seen.length+' / 2</b> 个不同状态</p><div class="parallel-actions"><button type="button" class="primary" id="record-state">记录这次</button><button type="button" class="secondary" id="inverse-state" aria-pressed="'+String(state.inverseMode)+'">'+(state.labMode==='reflection'?'再照一次':'倒着搬回去')+'</button></div></div></div>'+labReadout()+guided;
    const next=state.labMode==='translation'?'进入旋转实验 →':state.labMode==='rotation'?'进入轴对称实验 →':'把三种实验放在一起 →';
    host.innerHTML=base('环节二 · 三座实验台',modeTitle,body,'<button class="primary" id="lab-next">'+next+'</button>');
    bindModeTabs();bindParameterButtons();bindHelp(1);
    host.querySelector('#record-state').onclick=()=>{
      const key=state.labMode+'Seen';
      if(!state[key].includes(motion.signature))state[key]=[...state[key],motion.signature];
      save();render();message(state[key].length>=2?'已记录两个不同状态，可以继续。':'已记录这次。再换一个参数状态。');host.querySelector('#record-state')?.focus({preventScroll:true});
    };
    host.querySelector('#inverse-state').onclick=()=>{state.inverseMode=!state.inverseMode;save();render();host.querySelector('#inverse-state')?.focus({preventScroll:true});};
    host.querySelector('#lab-next').onclick=()=>{
      if(seen.length<2){message('先记录两个不同参数状态；只看一次还不足以比较规律。',true);return;}
      state.labMode=state.labMode==='translation'?'rotation':state.labMode==='rotation'?'reflection':'summary';state.inverseMode=false;save();render(true);
    };
  }
  function labFeedback(){
    if(!state.labAttempted)return '';
    const missing=L.invariantAnswer.filter(id=>!state.labChoices.includes(id));
    const extra=state.labChoices.filter(id=>!L.invariantAnswer.includes(id));
    if(!missing.length&&!extra.length)return '';
    return '<div class="rigid-feedback" role="status" aria-live="polite">'+(missing.length?'<p><b>还漏了：</b>'+missing.map(id=>L.invariantOptions.find(item=>item.id===id)?.text).join('、')+'。回看三座实验台的同一组读数。</p>':'')+(extra.length?'<p><b>再检查：</b>'+extra.map(id=>L.invariantOptions.find(item=>item.id===id)?.text).join('、')+'并不是三种搬法都一定保持。</p>':'')+'</div>';
  }
  function proofPreview(){
    return '<section class="rigid-proof-preview"><p class="parallel-label">证明接力 · 今天先看结构</p><h3>为什么“图形内任意两点距离不变”会带出更多不变量？</h3><div class="rigid-proof-chain"><div><b>保距</b>原图任取P、Q，都有PQ＝P′Q′</div><i>→</i><div><b>边与对角线</b>剖分需要的每条线段都不变</div><i>→</i><div><b>对应三角形</b>三边分别相等，由SSS可知全等</div><i>→</i><div><b>三个结论</b>全等推出对应角相等；边界边之和保住周长；各三角形面积之和保住总面积</div></div><p class="rigid-boundary">这里不是“角推出周长、周长再推出面积”，而是它们分别从保距和对应三角形全等得到。SSS是八年级“全等三角形”的预告，不是本课要求背下来的证明。动画和测量帮助发现、检查规律；它们不能代替对所有图形的一般证明。</p><details class="parallel-help"><summary>可选看一眼：旋转为什么能保住PQ？</summary><p>课标中的证明预览是：OP＝OP′，OQ＝OQ′；P、Q都绕O转过同一个角，所以∠POQ＝∠P′OQ′；由SAS，两三角形全等，于是PQ＝P′Q′。</p></details></section>';
  }
  function renderLabSummary(){
    const ready=state.translationSeen.length>=2&&state.rotationSeen.length>=2&&state.reflectionSeen.length>=2;
    const solvedRecorded=ready&&L.sameSet(state.labChoices,L.invariantAnswer)&&log.records[1].attempts.some(attempt=>attempt.correct===true);
    if(state.labSolved&&!solvedRecorded){state.labSolved=false;save();}
    if(state.labSolved&&solvedRecorded){
      const body=labTabs()+proofPreview()+'<p class="rigid-summary-note">三种规则长得不同，但共同保住了任意两点间距离。下一页不再给动画，只给工程记录。</p>';
      host.innerHTML=base('环节二 · 归纳完成','不是把三张图背下来，而是找到同一条结构',body,'<button class="primary" id="proof-next">撤掉动画，进入工程质检 →</button>');
      bindModeTabs();
      host.querySelector('#proof-next').onclick=()=>{const helped=log.records[1].helps.some(help=>help.phase!=='完成后回看');log.finish(1,(helped?'使用过实验提示；':'未打开实验提示；')+'完成三类实验并归纳共同不变量；正式全等证明只作预告');render(true);};
      return;
    }
    const body=labTabs()+'<p class="parallel-lead">现在把三座实验台放在一起。哪些量在三种搬法中都一定不变？</p><div class="rigid-lab-status"><span>平移 '+state.translationSeen.length+'/2</span><span>旋转 '+state.rotationSeen.length+'/2</span><span>轴对称变换 '+state.reflectionSeen.length+'/2</span></div>'+checklist(L.invariantOptions,state.labChoices,'重新选择三种搬法共同不变的量')+labFeedback()+reason('lab','把行动和解释绑在一起。',state.labReason,state.labUnsure,'我把……改成……，观察到……，所以我认为……一定不变。')+'<details class="parallel-help" data-help="共同不变量汇总提示"><summary>只给我一个汇总提示</summary><p>先比较三种实验中的AB距离、角、周长和面积；再看位置、朝向和顺逆次序是否每次都相同。</p></details>';
    host.innerHTML=base('环节二 · 实验汇总','三种搬法的共同底座是什么？',body,'<button class="primary" id="lab-summary-submit">检查这次归纳 →</button>');
    bindModeTabs();bindChecklist('labChoices');bindReason('lab','labReason','labUnsure');bindHelp(1);
    host.querySelector('#lab-summary-submit').onclick=()=>{
      if(!ready){message('三座实验台都要记录两个不同状态；目前还有实验未完成。',true);return;}
      if(!state.labChoices.length){message('先选择你认为三种搬法都一定不变的量。',true);return;}
      const why=validReason(state.labReason,state.labUnsure);if(!why){message('把一次操作、观察和结论连成一句；暂时说不清也可以如实勾选。',true);return;}
      const answer='共同不变量：'+state.labChoices.map(id=>L.invariantOptions.find(item=>item.id===id)?.text||id).join('、');
      const correct=L.sameSet(state.labChoices,L.invariantAnswer);
      log.submit(1,answer,correct,why);state.labAttempted=true;
      if(!correct){log.help(1,'自动反馈：共同不变量');save();render();return;}
      state.labSolved=true;save();
      log.note(1,'平移参数：'+state.translationSeen.join('、')+'；旋转参数：'+state.rotationSeen.join('、')+'；轴对称参数：'+state.reflectionSeen.join('、'));
      log.note(1,'动画与测量仅用于发现和检查规律，未被表述为对所有图形的完整证明。');render(true);
    };
  }
  function renderLab(){state.labMode==='summary'?renderLabSummary():renderLabExperiment();}

  function reportCards(){
    return '<div class="rigid-report-grid">'+L.transferReports.map(report=>'<label class="rigid-report-card"><input type="checkbox" data-report="'+report.id+'" '+(state.reportChoices.includes(report.id)?'checked':'')+'><span><b>'+report.code+'</b>'+report.text+'</span></label>').join('')+'</div>';
  }
  function transferFeedback(result){
    if(!state.transferAttempted)return '';
    const messages=[];
    if(!result.reports)messages.push('合格记录还没选对：找“所有点共享同一规则，且图形内任意两点距离保持不变”的记录。');
    if(!result.reportB)messages.push('记录B虽保留各点到O的距离，但点与点之间的距离未必保留；转角不同，不能判为同一次旋转。');
    if(!result.length||!result.angle)messages.push('合格搬动保持对应长度与对应角；不要根据屏幕位置重新估计。');
    if(!result.scaleLength||!result.scaleArea)messages.push('放大1.5倍时，长度乘1.5，面积乘1.5²＝2.25。');
    return messages.length?'<div class="rigid-feedback" role="status" aria-live="polite">'+messages.map(text=>'<p>'+esc(text)+'</p>').join('')+'</div>':'';
  }
  function numberField(id,label,value,suffix){return '<label class="rigid-number-field" for="'+id+'"><span>'+label+'</span><span><input id="'+id+'" inputmode="decimal" autocomplete="off" value="'+esc(value)+'">'+suffix+'</span></label>';}
  function renderTransfer(){
    const result=L.gradeTransfer(state);
    const body='<p class="parallel-lead">动画、测量值和术语卡都撤掉。下面四份记录中，哪些规则足以保证图形只做不拉伸、不缩放的整块搬动，也就是图形内任意两点的距离都保持？</p>'+reportCards()+'<section class="rigid-b-audit"><h3>记录B为什么不足以证明是同一次旋转？</h3><div class="rigid-choice-buttons" role="group" aria-label="诊断记录B">'+L.reportBReasons.map(item=>'<button type="button" data-b-reason="'+item.id+'" aria-pressed="'+String(state.reportBReason===item.id)+'">'+esc(item.text)+'</button>').join('')+'</div></section><section class="rigid-number-audit"><h3>从合格记录推出对应量</h3><p>原图AB＝7.2 cm，∠ABC＝64°。合格搬动后：</p><div class="rigid-number-grid">'+numberField('length-answer','A′B′＝',state.lengthAnswer,' cm')+numberField('angle-answer','∠A′B′C′＝',state.angleAnswer,'°')+'</div><p>D记录把图放大到150%。若原边长7.2 cm，放大后边长和面积倍数分别是多少？</p><div class="rigid-number-grid">'+numberField('scale-length-answer','放大后边长＝',state.scaleLengthAnswer,' cm')+numberField('scale-area-answer','面积变为原来的',state.scaleAreaAnswer,' 倍')+'</div></section>'+transferFeedback(result)+reason('transfer','写一句“判断—依据—结论”。',state.transferReason,state.transferUnsure,'我判断记录……，因为……，所以对应的……保持不变。')+'<details class="parallel-help" data-help="工程质检保距提示"><summary>卡住时，只看一条提示</summary><p>到中心的半径分别不变，不等于点与点之间的距离不变；角度保持也不等于长度保持。</p></details>';
    host.innerHTML=base('环节三 · 独立迁移','没有动画，只看记录还能判断是否只是整块搬动吗？',body,'<button class="primary" id="transfer-submit">封存工程质检 →</button>');
    host.querySelectorAll('[data-report]').forEach(input=>input.onchange=()=>{state.reportChoices=[...host.querySelectorAll('[data-report]:checked')].map(item=>item.dataset.report);save();});
    host.querySelectorAll('[data-b-reason]').forEach(button=>button.onclick=()=>{state.reportBReason=button.dataset.bReason;host.querySelectorAll('[data-b-reason]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    for(const [id,key] of [['length-answer','lengthAnswer'],['angle-answer','angleAnswer'],['scale-length-answer','scaleLengthAnswer'],['scale-area-answer','scaleAreaAnswer']])bindText(id,key);
    bindReason('transfer','transferReason','transferUnsure');bindHelp(2);
    host.querySelector('#transfer-submit').onclick=()=>{
      if(!state.reportChoices.length){message('先选出你认为能保证只做刚体搬动的记录。',true);return;}
      if(!state.reportBReason){message('还要完成对记录B的诊断。',true);return;}
      if(![state.lengthAnswer,state.angleAnswer,state.scaleLengthAnswer,state.scaleAreaAnswer].every(value=>String(value).trim())){message('把对应长度、角度、缩放后的长度和面积倍数补完整。',true);return;}
      const why=validReason(state.transferReason,state.transferUnsure);if(!why){message('留一句判断依据；暂时说不清也可以如实勾选。',true);return;}
      const graded=L.gradeTransfer(state),correct=Object.values(graded).every(Boolean);
      const answer='满足刚体搬动：'+state.reportChoices.join('、')+'；B诊断：'+(L.reportBReasons.find(item=>item.id===state.reportBReason)?.text||state.reportBReason)+'；A′B′='+state.lengthAnswer+'cm；对应角='+state.angleAnswer+'°；放大边长='+state.scaleLengthAnswer+'cm；面积倍数='+state.scaleAreaAnswer;
      log.submit(2,answer,correct,why);state.transferAttempted=true;save();
      if(!correct){log.help(2,'自动反馈：工程质检');render();return;}
      log.note(2,'结构化质检全部正确；开放解释保留原话，未自动判断语义质量。');
      log.note(2,'记录B虽保留各点到O的距离，但没有保证点与点之间距离不变；各点转角不同，也不能判为同一次旋转。记录D虽保角，但缩放会改变长度与面积。');
      const helped=log.records[2].helps.some(help=>help.phase!=='完成后回看');
      log.finish(2,(helped?'使用过质检提示；':'未打开质检提示；')+'完成新信息形式下的独立迁移');render(true);
    };
  }
  function finish(){
    if(sources)sources.hidden=false;
    const body='<p class="parallel-lead">图形可以搬位置、转方向、翻一面；真正把三种操作连起来的，是图形内任意两点之间的距离没有被拉长或压短。</p><div class="rigid-final-grid"><div><b>平移</b>同方向、同距离</div><div><b>旋转</b>同一中心、同一方向、同一角度</div><div><b>轴对称变换</b>同一条轴垂直平分对应点连线；原图本身不一定轴对称</div></div><p class="parallel-takeaway"><b>共同不变量：</b>点间距离、对应角、周长、面积。<br><b>可能改变：</b>屏幕位置、面对方向；轴对称变换还会翻转顶点的顺逆时针次序。<br><b>不能反推：</b>只保面积、只保角度或只保各点到中心的距离，都不足以证明只做了刚体搬动。</p><p>本页记录的是首答、实验参数、提示、修订和工程迁移。开发自检只能证明页面按规则工作；孩子隔天能否不看实验重新解释，才是后续掌握证据。</p><div class="rigid-next"><b>下一站：</b>历史H07将研究“没有电话和公路，周天子怎样管理千里之外？”</div>';
    host.innerHTML=base('G4 · 变化中的不变量收好','数学的美，不是图没变，而是你能说出什么必然不变',body)+log.html()+'<div class="parallel-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school&amp;subject=数学">返回数学课程</a><button class="secondary" id="rigid-restart">重新练一轮（保留旧记录）</button></div>';
    host.querySelector('#rigid-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,coldChoices:[],translationSeen:[],rotationSeen:[],reflectionSeen:[],labChoices:[],reportChoices:[]};save();if(sources)sources.hidden=true;render(true);};
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length)finish();else if(log.index===0)renderCold();else if(log.index===1)renderLab();else renderTransfer();
    progress();if(sources&&log.index<L.tasks.length)sources.hidden=true;if(moveFocus)focusCard();
  }
  render();
})();
