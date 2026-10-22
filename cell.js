'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='cell'))LearningFeedback.courses.push(['cell',CellLesson.title,'cell.html']);
const cellQuestions=CellLesson.questions,cellEscape=LearningFeedback.esc;
const cellTask=document.querySelector('#cell-task');
let cellLog=LearningFeedback.create(CellLesson.title,cellQuestions),cellIndex=cellLog.index;
function cellSvg(sample,focus='',labels=false,pick=false,caption=''){
  const s=CellLesson.samples[sample],plant=s.type==='植物';
  const active=id=>focus===id?' cell-active':'';
  const wall=plant?`<rect class="cell-wall${active('wall')}" x="29" y="39" width="252" height="202" rx="42" fill="#e4e9d3" stroke="#98a574" stroke-width="10"/>`:'';
  const membrane=plant?'<rect x="39" y="49" width="232" height="182" rx="33"/>':'<path d="M55 84C73 37 126 46 163 36C221 21 274 64 278 115C285 166 255 218 199 235C154 251 88 229 56 201C18 169 31 120 55 84Z"/>';
  const body=`<g class="cell-membrane${active('membrane')}" fill="#f0e7d0" stroke="#638f91" stroke-width="3">${membrane}</g>`;
  const cytoplasm=`<g class="cell-cytoplasm${active('cytoplasm')}" fill="#d5b36f" opacity=".55">${[[78,86],[109,63],[182,65],[249,115],[239,205],[180,219],[70,199]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`;
  const vacuole=plant?`<rect class="cell-vacuole${active('vacuole')}" x="105" y="79" width="133" height="124" rx="40" fill="#d7e8e4" stroke="#95b4a7" stroke-width="2"/>`:'';
  const nucleus=`<g class="cell-nucleus${active('nucleus')}"><ellipse cx="${plant?72:153}" cy="${plant?143:139}" rx="${plant?19:32}" ry="${plant?28:31}" fill="#bea6be" stroke="#967e9f" stroke-width="2"/><circle cx="${plant?73:153}" cy="${plant?143:139}" r="7" fill="#977e9f"/></g>`;
  const chloroplast=CellLesson.hasPart(sample,'chloroplast')?`<g class="cell-chloroplast${active('chloroplast')}" fill="#9cb76c" stroke="#6f935b" stroke-width="2">${[[80,69,-12],[181,64,3],[252,138,88],[220,218,-8],[92,211,13]].map(([x,y,a])=>`<ellipse cx="${x}" cy="${y}" rx="15" ry="7" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>`:'';
  const labelList=plant?[['wall','细胞壁',29,77,8,23],['membrane','细胞膜',271,82,235,23],['nucleus','细胞核',72,143,5,276],['vacuole','大液泡',173,141,230,276]]:[['membrane','细胞膜',267,82,232,23],['nucleus','细胞核',153,139,5,276],['cytoplasm','细胞质',110,196,227,276]];
  const captions=labels?labelList.map(([id,name,x,y,tx,ty])=>`<path d="M${x} ${y}L${tx+24} ${ty+(ty<100?6:-14)}" fill="none" stroke="#a3afa0" stroke-width="1"/><text x="${tx}" y="${ty}" class="cell-caption">${name}</text>`).join(''):'';
  const picks=pick?[[0,29,92,10,0],[1,271,100,252,0],[2,174,141,252,253],[3,72,143,10,253]].map(([i,x,y,tx,ty])=>`<path d="M${x} ${y}L${tx+20} ${ty+20}" fill="none" stroke="#b6bfa7"/><g class="cell-pick" data-diagram-choice="${i}" tabindex="0" role="button" aria-label="${cellQuestions[1].options[i]}"><rect x="${tx}" y="${ty}" width="42" height="42" rx="12" fill="#fffefa" stroke="#a4b69c"/><text x="${tx+21}" y="${ty+27}" text-anchor="middle">${String.fromCharCode(65+i)}</text></g>`).join(''):'';
  return `<svg class="cell-diagram focus-${focus}" viewBox="0 0 310 ${pick?305:295}" ${pick?'role="group" aria-label="点选细胞结构"':`role="img" aria-label="${caption||s.name}结构示意图${labels?'，有'+s.parts.map(p=>CellLesson.parts[p].name).join('、'):''}"`}>${wall}${body}${cytoplasm}${vacuole}${nucleus}${chloroplast}${captions}${picks}</svg>`;
}
function cellScene(index){
  if(index===0)return `<h2>样本甲：找结构证据</h2>${cellSvg('onion','',true,false,'样本甲')}<ul class="cell-evidence"><li>已确认：有细胞壁、细胞膜、细胞质、细胞核和大液泡。</li><li>已确认：没有叶绿体。</li></ul><p class="source-note">只比较典型动物与植物细胞。模型的颜色、大小和外形都不能单独当作分类证据。</p>`;
  if(index===1)return `<h2>外层结构，各有什么用？</h2><div id="cell-pick-diagram">${cellSvg('onion','',false,true)}</div><p>点图中A、B、C、D，或点同名选项，再确认。</p><p class="source-note">这是结构示意图。为看清膜和壁，将两层画开；实际细胞膜通常紧贴细胞壁内侧。</p>`;
  if(index===2)return `<h2>外形不同，寻找共同结构</h2><div class="cell-pair"><div><h3>绿色叶肉</h3>${cellSvg('leaf')}</div><div><h3>口腔上皮</h3>${cellSvg('cheek')}</div></div><p>写出共有的3种基本结构，再挑一种说明作用。</p><p class="source-note">此题图中暂不显示结构名称。想不起来可以用提示，首答与求助都会如实保留。</p>`;
  if(index===3)return `<h2>功能记录出了错</h2><div class="cell-note"><span>待纠正的记录</span><p>大液泡<br>↓<br>主要保存遗传信息</p></div><p>不要只认名字，要把结构与功能对应起来。</p>`;
  return `<h2>新的样本档案</h2><div class="cell-files"><div><h3>甲</h3><p>有细胞壁<br>有细胞膜、细胞质、细胞核<br>有大液泡<br><b>没有叶绿体</b></p></div><div><h3>乙</h3><p>确认没有细胞壁<br>有细胞膜、细胞质、细胞核<br>没有植物式大液泡<br><b>没有叶绿体</b></p></div></div><p>已知一份来自典型植物细胞，另一份来自典型动物细胞。给出甲、乙的判断，并解释为什么。</p><p class="source-note">“确认没有某结构”与“显微镜下暂时没看清”不同。本题给的是已确认信息。</p>`;
}
function cellLabMarkup(){return `<details class="cell-lab" data-help="打开三种细胞对照"><summary>动手对照：换样本，点结构</summary><div class="cell-lab-body"><div class="cell-samples" role="group" aria-label="选择细胞样本">${Object.entries(CellLesson.samples).map(([id,s])=>`<button data-sample="${id}" aria-pressed="false">${s.short}</button>`).join('')}</div><h3 id="cell-sample-name"></h3><div id="cell-model"></div><div class="cell-parts" role="group" aria-label="选择查看的结构">${Object.entries(CellLesson.parts).map(([id,p])=>`<button data-part="${id}" aria-pressed="false">${p.name}</button>`).join('')}</div><p id="cell-part-info" class="cell-relation" role="status"></p><p id="cell-sample-note"></p><p class="source-note">模型只突出本课结构，未画出全部细胞器；典型动植物细胞通常都有线粒体。液泡与叶绿体也属于细胞质中的结构。示意图不按真实比例或颜色绘制。</p></div></details>`;}
function bindCellLab(){
  const saved=cellLog.checkpoint;
  let sample=CellLesson.samples[saved.cellSample]?saved.cellSample:'onion',part=CellLesson.parts[saved.cellPart]?saved.cellPart:'chloroplast';
  function draw(){document.querySelector('#cell-sample-name').textContent=CellLesson.samples[sample].name;document.querySelector('#cell-model').innerHTML=cellSvg(sample,part,true);document.querySelector('#cell-part-info').textContent=CellLesson.describe(sample,part);document.querySelector('#cell-sample-note').textContent=CellLesson.samples[sample].note;document.querySelectorAll('[data-sample]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sample===sample)));document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===part)));}
  function save(label){cellLog.point({cellSample:sample,cellPart:part});cellLog.help(cellIndex,label);draw();}
  document.querySelectorAll('[data-sample]').forEach(b=>b.onclick=()=>{sample=b.dataset.sample;save('切换样本：'+CellLesson.samples[sample].short);});
  document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{part=b.dataset.part;save('查看结构：'+CellLesson.parts[part].name);});draw();
}
function renderCell(focus=false){
  document.querySelector('#cell-progress').textContent=cellIndex===5?'5 题完成':`第 ${cellIndex+1} / 5 题`;
  document.querySelector('#cell-dots').innerHTML=cellQuestions.map((_,i)=>`<i class="${cellLog.records[i].done?'done':''} ${i===cellIndex?'current':''}"></i>`).join('');
  if(cellIndex===5){finishCell();return;}
  const q=cellQuestions[cellIndex],r=cellLog.records[cellIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=(q.kind==='choice'||q.kind==='pick')?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${cellEscape(q.kind==='pick'?option.slice(2):option)}</span></button>`).join('')}</div>`:'<label for="cell-answer">留下你的理由或关键步骤</label><textarea id="cell-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话就好。"></textarea><label class="reason-unsure"><input id="cell-unsure" type="checkbox">我暂时说不清，先如实记下来</label>';

  cellTask.innerHTML=`<div class="cell-layout"><article class="cell-scene">${cellScene(cellIndex)}</article><section class="reading-work cell-work"><p class="skill-label">${q.skill}</p><h2 id="cell-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-cell">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="cell-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="cell-method">暂时不会，看看方法</button>':''}<div id="cell-review" hidden></div><div id="cell-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-cell" disabled>${cellIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#cell-message'),submit=document.querySelector('#submit-cell'),next=document.querySelector('#next-cell');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(cellIndex!==0||document.querySelector('.cell-lab'))return;document.querySelector('#cell-lab-slot').innerHTML=cellLabMarkup();bindCellLab();const details=document.querySelector('.cell-lab');details.addEventListener('toggle',()=>{if(details.open)cellLog.help(cellIndex,'打开三种细胞对照');});}
  function finishClosed(){cellTask.querySelectorAll('[data-choice],#submit-cell,#cell-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();if(q.kind==='pick')bindPicks();}
  function getOpen(){const text=document.querySelector('#cell-answer').value.trim();if(!text&&!document.querySelector('#cell-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#cell-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)cellLog.submit(cellIndex,answer,null,answer);cellLog.finish(cellIndex,button.dataset.self);cellTask.querySelectorAll('textarea,input,#submit-cell,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  function choose(index,focusDiagram=false){if(r.done)return;selected=index;cellTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.choice)===selected)));if(q.kind==='pick'){document.querySelector('#cell-pick-diagram').innerHTML=cellSvg('onion',q.targets[selected],false,true);bindPicks();if(focusDiagram)cellTask.querySelector('[data-diagram-choice="'+selected+'"]').focus({preventScroll:true});}cellLog.draft(cellIndex,{$choice:selected});}
  function bindPicks(){cellTask.querySelectorAll('[data-diagram-choice]').forEach(el=>{el.onclick=()=>choose(Number(el.dataset.diagramChoice));el.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(Number(el.dataset.diagramChoice),true);}};if(r.done){el.setAttribute('aria-disabled','true');el.setAttribute('tabindex','-1');}});}
  cellTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>choose(Number(button.dataset.choice)));
  if(q.kind==='pick'){if(selected!==null)document.querySelector('#cell-pick-diagram').innerHTML=cellSvg('onion',q.targets[selected],false,true);bindPicks();}
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)cellLog.submit(cellIndex,answer,null,answer);if(first)cellLog.help(cellIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}
    const answer=q.options[selected],correct=selected===q.answer;
    cellLog.submit(cellIndex,answer,correct);if(correct){cellLog.finish(cellIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(cellIndex===0)showLab();}
  };
  if(!open)document.querySelector('#cell-method').onclick=()=>{if(!r.first)cellLog.submit(cellIndex,'暂时不会，选择查看方法',false);cellLog.help(cellIndex,'查看本题方法');cellLog.finish(cellIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(cellTask,cellLog,cellIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{cellIndex++;renderCell(true);};
  if(focus){document.querySelector('#cell-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishCell(){
  cellTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p>比较细胞，要看结构和功能的证据。一个“没有叶绿体”，不足以决定它是不是植物细胞。</p><div class="finish-contrast"><p><b>共同结构</b>典型动植物细胞都有细胞膜、细胞质和细胞核</p><p><b>结构各有分工</b>细胞壁支持保护；细胞膜控制物质进出</p></div><p class="finish-note">3题核对判断与结构定位，2题保留自己的解释。本课只比较典型动植物细胞；微生物、特殊细胞与显微镜操作还要继续学。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-cell">重新练这5题（保留旧记录）</button></section>${cellLog.html()}`;
  document.querySelector('#restart-cell').onclick=()=>{cellLog=LearningFeedback.create(CellLesson.title,cellQuestions,true);cellLog.save();cellIndex=0;renderCell(true);};cellTask.querySelector('h2').focus({preventScroll:true});
}
renderCell();
