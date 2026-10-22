'use strict';
// A first visit can load a new lesson alongside an older cached registry.
if(!LearningFeedback.courses.some(c=>c[0]==='tomato'))LearningFeedback.courses.push(['tomato',TomatoLesson.title,'tomato.html']);
const tomatoQuestions=TomatoLesson.questions,tomatoEscape=LearningFeedback.esc;
const tomatoTask=document.querySelector('#tomato-task');
let tomatoLog=LearningFeedback.create(TomatoLesson.title,tomatoQuestions),tomatoIndex=tomatoLog.index;
function bioSvg(body,label){return `<svg class="tomato-figure" viewBox="0 0 360 300" role="img" aria-label="${label}">${body}</svg>`;}
function fruitSvg(focus='all'){
  const dim=id=>focus==='all'||focus===id?1:.24;
  return bioSvg(`<circle cx="180" cy="166" r="105" fill="#f5e2d5"/><circle cx="180" cy="166" r="94" fill="#e8a78b" opacity="${dim('nutrition')}"/><circle cx="180" cy="166" r="103" fill="none" stroke="#bd6655" stroke-width="13" opacity="${dim('protect')}"/><g fill="none" stroke="#8c8a43" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${dim('transport')}"><path d="M180 75V251 M180 112Q134 127 112 168 M180 112Q224 127 248 168 M180 180Q145 190 124 224 M180 180Q215 190 236 224"/></g><path d="M180 67L157 43L165 66L135 65L164 81L151 99L180 86L204 101L199 81L225 65L196 66L203 42Z" fill="#66835c"/><path d="M180 63Q173 39 186 27" fill="none" stroke="#66835c" stroke-width="7" stroke-linecap="round"/>`,'番茄果实组织示意：表面保护区域、果肉营养区域和内部输导区域；只标出部分组织，不按实际比例。');
}
function plantSvg(){return bioSvg(`<path d="M38 225H322" stroke="#c7b99b" stroke-width="3"/><g stroke="#69835c" stroke-width="7" fill="none" stroke-linecap="round"><path d="M180 227V45 M180 91L254 62 M180 135L102 105 M180 177L250 150"/></g><g fill="#91aa70"><path d="M178 92Q115 28 109 63Q126 101 178 92Z"/><path d="M181 141Q220 82 244 110Q236 139 181 141Z"/><path d="M179 177Q108 139 105 170Q134 196 179 177Z"/></g><g fill="#bd6655" stroke="#aa574b" stroke-width="2"><circle cx="253" cy="81" r="20"/><circle cx="102" cy="128" r="18"/><circle cx="250" cy="175" r="21"/></g><g fill="#dcb96d"><circle cx="184" cy="43" r="10"/><circle cx="194" cy="35" r="8"/><circle cx="178" cy="30" r="8"/></g><path d="M180 229V276 M180 242L143 270 M180 246L218 278 M180 263L161 288 M180 270L193 291" stroke="#a58a61" stroke-width="4" fill="none" stroke-linecap="round"/>`,'完整番茄植株示意：根、茎、叶、花和果实等器官相互联系。');}
function tissueSvg(single=false){
  const cells=single?[{x:89,y:62,w:182,h:173}]:Array.from({length:6},(_,i)=>({x:40+i%3*94,y:66+Math.floor(i/3)*86,w:90,h:82}));
  return bioSvg(cells.map(c=>`<g><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="12" fill="#f1dbcd" stroke="#ae755e" stroke-width="3"/><rect x="${c.x+7}" y="${c.y+7}" width="${c.w-14}" height="${c.h-14}" rx="8" fill="#f8eee1" stroke="#d8bfa8"/><ellipse cx="${c.x+c.w*.67}" cy="${c.y+c.h*.6}" rx="${single?17:8}" ry="${single?20:10}" fill="#a98176"/></g>`).join(''),single?'一个植物细胞的简化示意；只示意边界和内部，不是完整细胞结构图。':'一层保护组织的局部示意，由多个形态结构和功能相近的细胞组成。');
}
function leafSvg(){return bioSvg(`<path d="M77 249Q25 67 294 43Q312 251 77 249Z" fill="#bbcf98" stroke="#66825b" stroke-width="4"/><path d="M57 270L267 69 M103 222L95 150 M140 184L128 106 M178 146L178 82 M103 222L185 221 M140 184L229 176 M178 146L271 132" fill="none" stroke="#708c61" stroke-width="4" stroke-linecap="round"/>`,'一片叶子的外形示意；外形不能说明它只含一种组织。');}
function tomatoScene(index){
  if(index===0)return `<h2>一颗果实，几类组织协作</h2>${fruitSvg()}<div class="tissue-evidence"><div><b>保护组织</b>：主要起保护作用。</div><div><b>营养组织</b>：主要储存营养物质。</div><div><b>输导组织</b>：运输物质。</div></div><p>它们按一定结构组合、相互配合。现在问的是<strong>整个果实</strong>。</p><p class="source-note">图中仅示意部分组织，位置和厚度不按实际比例。</p>`;
  if(index===1)return `<h2>都有细胞，组合却不同</h2>${tissueSvg()}<div class="bio-material"><b>A · 这一层保护组织</b>果皮表面的一层保护组织，由形态、结构和功能相近的细胞组成，主要起保护作用。</div><div class="bio-material"><b>B · 整颗果实</b>包含保护、营养、输导等不同组织，按一定结构组合并相互配合。</div><p class="source-note">上图是A的局部示意，不代表整个果皮只有一种组织。</p>`;
  if(index===2)return `<h2>叶片里面不止一种组织</h2>${leafSvg()}<div class="tissue-evidence"><div>表皮组织：起保护作用。</div><div>叶肉组织：进行光合作用。</div><div>输导组织：运输物质。</div></div><p>不同组织相互配合。能只凭叶片薄、平就判断层次吗？</p>`;
  if(index===3)return `<h2>终点是完整植株</h2>${plantSvg()}<p>这次排列的是<strong>绿色开花植物</strong>的结构层次。</p><p>从最基本的结构和功能单位出发，逐步到完整植株。箭头表示组成层次，不是按画面大小排序。</p>`;
  return `<h2>换到人体，继续找组成依据</h2><div class="bio-material"><b>胃的组成</b>胃由上皮组织、肌肉组织等<strong>不同组织</strong>有序构成。</div><div class="bio-material"><b>消化系统的组成</b>胃与食管、小肠等<strong>多个器官</strong>协同，参与食物的摄入、运输、消化和吸收等过程。</div><p>人体的多个系统又相互配合，完成生命活动。</p>`;
}
function labMarkup(){return `<details class="tomato-lab" data-help="查看结构层次模型"><summary>逐层查看：从一株植物到一个细胞</summary><div class="tomato-lab-body"><div class="layer-tabs" aria-label="选择结构层次">${TomatoLesson.levels.map((v,i)=>`<button data-layer="${i}" aria-pressed="${i===1}">${v.label}</button>`).join('')}</div><div id="layer-stage"></div><div class="tissue-tabs" id="tissue-tabs" aria-label="查看组织的作用">${TomatoLesson.tissues.map(t=>`<button data-tissue="${t.id}" aria-pressed="false">${t.label}</button>`).join('')}</div><p id="layer-description" class="layer-description" role="status"></p><p class="layer-rule">每换一层，都用了适合观察的放大比例。不能用图画大小或颜色判断层次。<br>重点看：怎样组成，怎样协作。</p></div></details>`;}
function bindLab(){
  let level=1,focus='all';
  function draw(){const v=TomatoLesson.levels[level],t=TomatoLesson.tissues.find(x=>x.id===focus);const svg=[plantSvg,()=>fruitSvg(focus),()=>tissueSvg(),()=>tissueSvg(true)][level]();document.querySelector('#layer-stage').innerHTML=`<div class="layer-model"><h3>${v.label} · ${v.rank}</h3>${svg}</div>`;document.querySelector('#tissue-tabs').hidden=level!==1;document.querySelector('#layer-description').textContent=v.description+(level===1&&t?' '+t.description:'');document.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.layer)===level)));document.querySelectorAll('[data-tissue]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tissue===focus)));}
  document.querySelectorAll('[data-layer]').forEach(button=>button.onclick=()=>{level=Number(button.dataset.layer);focus='all';tomatoLog.help(tomatoIndex,'查看'+TomatoLesson.levels[level].label);draw();});
  document.querySelectorAll('[data-tissue]').forEach(button=>button.onclick=()=>{focus=button.dataset.tissue;tomatoLog.help(tomatoIndex,'查看'+TomatoLesson.tissues.find(t=>t.id===focus).label);draw();});draw();
}

function renderTomato(focus=false){
  document.querySelector('#tomato-progress').textContent=tomatoIndex===5?'5 题完成':`第 ${tomatoIndex+1} / 5 题`;
  document.querySelector('#tomato-dots').innerHTML=tomatoQuestions.map((_,i)=>`<i class="${tomatoLog.records[i].done?'done':''} ${i===tomatoIndex?'current':''}"></i>`).join('');
  if(tomatoIndex===5){finishTomato();return;}
  const q=tomatoQuestions[tomatoIndex],r=tomatoLog.records[tomatoIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const savedOrder=r.draft?.order?.split(' → ');
  let order=q.kind==='order'?(TomatoLesson.validOrder(savedOrder)?savedOrder:q.initial.slice()):null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${tomatoEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="tomato-answer">留下你的理由或关键步骤</label><textarea id="tomato-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话就好。"></textarea><label class="reason-unsure"><input id="tomato-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':'<p class="order-caption">用上移、下移调整。排好后再确认；调整本身不计作答次数。</p><ol id="layer-order" class="layer-list" aria-label="从较低层次到较高层次排列"></ol><p id="order-preview" class="order-preview" role="status"></p>';

  tomatoTask.innerHTML=`<div class="tomato-layout"><article class="organ-card">${tomatoScene(tomatoIndex)}</article><section class="reading-work tomato-work"><p class="skill-label">${q.skill}</p><h2 id="tomato-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-tomato">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="tomato-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="tomato-method">暂时不会，看看方法</button>':''}<div id="tomato-review" hidden></div><div id="tomato-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-tomato" disabled>${tomatoIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#tomato-message'),submit=document.querySelector('#submit-tomato'),next=document.querySelector('#next-tomato');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(tomatoIndex!==0||document.querySelector('.tomato-lab'))return;document.querySelector('#tomato-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.tomato-lab');details.addEventListener('toggle',()=>{if(details.open)tomatoLog.help(tomatoIndex,'查看结构层次模型');});}
  function finishClosed(){tomatoTask.querySelectorAll('[data-choice],[data-move],#submit-tomato,#tomato-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#tomato-answer').value.trim();if(!text&&!document.querySelector('#tomato-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#tomato-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)tomatoLog.submit(tomatoIndex,answer,null,answer);tomatoLog.finish(tomatoIndex,button.dataset.self);tomatoTask.querySelectorAll('textarea,input,#submit-tomato,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  function renderOrder(focusLabel='',direction=0){
    const list=document.querySelector('#layer-order');
    list.innerHTML=order.map((name,i)=>`<li><span class="layer-number">${i+1}</span><span class="layer-name">${name}</span><span class="layer-move"><button data-move="${i}" data-direction="-1" aria-label="${name}上移" ${i===0||r.done?'disabled':''}>↑ 上移</button><button data-move="${i}" data-direction="1" aria-label="${name}下移" ${i===3||r.done?'disabled':''}>↓ 下移</button></span></li>`).join('');
    document.querySelector('#order-preview').textContent=order.join(' → ');
    list.querySelectorAll('[data-move]').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.move),d=Number(button.dataset.direction),label=order[i];order=TomatoLesson.move(order,i,d);tomatoLog.draft(tomatoIndex,{order:order.join(' → ')});if(r.first)say('排列已调整，确认后再核对。首答会保留。');renderOrder(label,d);});
    if(focusLabel){const i=order.indexOf(focusLabel);let button=list.querySelector(`[data-move="${i}"][data-direction="${direction}"]`);if(button.disabled)button=list.querySelector(`[data-move="${i}"]:not(:disabled)`);button?.focus({preventScroll:true});}
  }
  if(q.kind==='order')renderOrder();
  tomatoTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);tomatoTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)tomatoLog.submit(tomatoIndex,answer,null,answer);if(first)tomatoLog.help(tomatoIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{answer=order.join(' → ');correct=TomatoLesson.correctOrder(order);}
    tomatoLog.submit(tomatoIndex,answer,correct);if(correct){tomatoLog.finish(tomatoIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(tomatoIndex===0)showLab();}
  };
  if(!open)document.querySelector('#tomato-method').onclick=()=>{if(!r.first)tomatoLog.submit(tomatoIndex,'暂时不会，选择查看方法',false);tomatoLog.help(tomatoIndex,'查看本题方法');tomatoLog.finish(tomatoIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(tomatoTask,tomatoLog,tomatoIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{tomatoIndex++;renderTomato(true);};
  if(focus){document.querySelector('#tomato-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishTomato(){
  tomatoTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>先看怎样组成，再说属于哪一层。</p><div class="tomato-finish-steps"><span>细胞</span><span>组织</span><span>器官</span><span>个体</span></div><p>绿色开花植物的层次链是细胞→组织→器官→个体。人体在器官与个体之间，还有系统这一层。大小、外形或颜色不能代替组成与功能的证据。</p><p class="finish-note">3题核对了判断或排列，2题保留了理由与自检。换成新的材料，也先问：是相近细胞形成的组织，还是不同组织、不同器官的协作？</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-tomato">重新练这5题（保留旧记录）</button></section>${tomatoLog.html()}`;
  document.querySelector('#restart-tomato').onclick=()=>{tomatoLog=LearningFeedback.create(TomatoLesson.title,tomatoQuestions,true);tomatoLog.save();tomatoIndex=0;renderTomato(true);};tomatoTask.querySelector('h2').focus({preventScroll:true});
}
renderTomato();
