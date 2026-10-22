'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='elements'))LearningFeedback.courses.push(['elements',ElementsLesson.title,'elements.html']);
const elementsQuestions=ElementsLesson.questions,elementsEscape=LearningFeedback.esc;
const elementsTask=document.querySelector('#elements-task');
let elementsLog=LearningFeedback.create(ElementsLesson.title,elementsQuestions),elementsIndex=elementsLog.index;
function moleculeMarkup(formula){
 const atoms=formula==='O₂'?[['O',-14,0],['O',14,0]]:formula==='O₃'?[['O',-25,6],['O',0,-8],['O',25,6]]:formula==='H₂O'?[['H',-25,12],['O',0,-4],['H',25,12]]:formula==='CO'?[['C',-14,0],['O',14,0]]:[['O',-28,0],['C',0,0],['O',28,0]];
 return `<polyline points="${atoms.map(a=>a[1]+','+a[2]).join(' ')}" fill="none" stroke="#7d9988" stroke-width="4"/>`+atoms.map(([atom,x,y])=>`<g transform="translate(${x},${y})"><circle class="atom-${atom}" r="13"/><text y="4" text-anchor="middle">${atom}</text></g>`).join('')+`<text class="formula" y="34" text-anchor="middle">${formula}</text>`;
}
function moleculePanel(formulas,label){return `<svg class="molecule-panel" viewBox="0 0 300 100" role="img" aria-label="${elementsEscape(label)}">${formulas.map((f,i)=>`<g transform="translate(${300/(formulas.length+1)*(i+1)},34)">${moleculeMarkup(f)}</g>`).join('')}</svg>`;}
function elementsScene(index){
 if(index===0)return `<p class="scene-kicker">元素侦探 · 氧的两种组合</p><h2>球上都写着O，<br>组合却不一样。</h2>${moleculePanel(['O₂','O₃'],'一个氧气分子O₂和一个臭氧分子O₃，都是氧原子组成，但分子不同')}<p><b>O</b> 表示氧。O₂的一个分子有2个氧原子，O₃的一个分子有3个氧原子。</p><p class="source-note">这份样品同时含氧气和臭氧。图只表示组成，数量、大小、形状不是实际比例。</p>`;
 if(index===1)return `<p class="scene-kicker">分类路线 · 顺序很重要</p><h2>先过第一道门</h2><div class="elements-facts"><p><b>① 有几种物质？</b>多种 → 混合物<br>一种 → 纯净物，继续看②</p><p><b>② 纯净物由几种元素组成？</b>一种 → 单质<br>不同元素 → 化合物</p></div><p>“单质”和“化合物”都是纯净物的类别。</p>`;
 if(index===2)return `<p class="scene-kicker">给定：只有水分子</p><h2>两种原子，<br>在同一种分子里。</h2>${moleculePanel(['H₂O','H₂O'],'两个相同的水分子，每个有2个氢原子和1个氧原子')}<p>H 表示氢，O 表示氧。每一组相连的小球是一个完整的水分子。</p><p class="source-note">“水含氧元素”与“水里混有氧气”表达的是不同信息。</p>`;
 if(index===3)return `<p class="scene-kicker">原子档案 · 看核内质子数</p><h2>编号不同，<br>元素就不同吗？</h2><div class="proton-cards"><p>甲<strong>8</strong>个质子</p><p>乙<strong>8</strong>个质子</p><p>丙<strong>1</strong>个质子</p></div><p>元素：质子数相同的一类原子的总称。</p><p class="source-note">这一题不要求记周期表，只按已给出的质子数作判断。</p>`;
 return `<p class="scene-kicker">新的鉴定任务 · 碳和氧</p><h2>先看全体成分，<br>再下分类结论。</h2><div class="elements-facts"><p><b>甲：只含CO₂</b>只有二氧化碳</p><p><b>乙：同时含CO和CO₂</b>一氧化碳 + 二氧化碳</p></div>${moleculePanel(['CO','CO₂'],'乙中两种分子：CO含1个碳原子1个氧原子，CO₂含1个碳原子2个氧原子')}<p>两份样品都涉及碳（C）、氧（O）两种元素。乙中CO₂增多时，CO仍在，且未发生反应。</p>`;
}
function labMarkup(){return `<details class="elements-lab" data-help="查看元素与物质模型"><summary>动手验证：换一份样品，分别数两种“种类”</summary><div class="elements-lab-body"><label for="elements-sample">选择已知成分的样品</label><select id="elements-sample"><option value="0">纯氧气 · 只有O₂</option><option value="1">纯臭氧 · 只有O₃</option><option value="2">氧气 + 臭氧 · O₂和O₃</option><option value="3">纯水 · 只有H₂O</option></select><p>这是切换不同样品的快照，不演示它们相互反应。</p><label for="elements-copies">图中分子数量 <output id="elements-count"></output></label><input id="elements-copies" type="range" min="1" max="2" step="1" value="1"><svg id="elements-model" viewBox="0 0 300 232" role="img">${Array.from({length:6},(_,i)=>`<g data-molecule="${i}" class="model-molecule"></g>`).join('')}</svg><button class="secondary" id="elements-shuffle">换一个排列</button><div id="elements-model-result" role="status"></div><p class="model-note">O代表氧、H代表氢；相连小球表示一个完整分子。图仅表示组成，不按实际大小、数量、间隔与形状绘制。这些样品由分子构成；物质也可由原子、离子等构成，不能对所有物质都机械数分子。改变排列或分子数量，不增加新的物质种类。</p></div></details>`;}
function bindLab(log,index){
 const cp=log.checkpoint;let sample=cp.elementsSample??2,copies=cp.elementsCopies??1,layout=cp.elementsLayout??0;
 try{ElementsLesson.model(sample,copies,layout);}catch{sample=2;copies=1;layout=0;}
 const select=document.querySelector('#elements-sample'),slider=document.querySelector('#elements-copies'),svg=document.querySelector('#elements-model');
 function draw(){const m=ElementsLesson.model(sample,copies,layout);select.value=sample;slider.value=copies;document.querySelector('#elements-count').textContent=m.total+'个';svg.setAttribute('aria-label',`${m.name}示意图：${m.total}个代表分子，${m.elementKinds}种元素，${m.substanceKinds}种物质，${m.classification}`);m.particles.forEach(p=>{const g=svg.querySelector(`[data-molecule="${p.id}"]`);g.innerHTML=moleculeMarkup(p.formula);g.style.transform=`translate(${p.x}px,${p.y}px)`;g.style.opacity=p.visible?'1':'0';});document.querySelector('#elements-model-result').innerHTML=`<p><span>数元素</span><b>${m.elements.join('、')} → ${m.elementKinds}种</b></p><p><span>数物质</span><b>${m.formulas.join('、')} → ${m.substanceKinds}种</b></p><p class="model-verdict">${m.pure?'一种物质 → 纯净物 → '+m.classification:'两种物质 → 混合物'}<br><small>${sample===2?'一种元素，也能对应两种不同物质。':sample===3?'两种元素结合在水分子中，并不是两种气体混在一起。':'纯净物 + 一种元素，两个条件都满足。'}</small></p>`;}
 function update(){log.point({elementsSample:sample,elementsCopies:copies,elementsLayout:layout});log.help(index,'操作元素与物质模型');draw();}
 select.onchange=()=>{sample=Number(select.value);update();};slider.oninput=()=>{copies=Number(slider.value);update();};document.querySelector('#elements-shuffle').onclick=()=>{layout=1-layout;update();};draw();
}
function classificationMarkup(a){return `<div class="classification-board">${ElementsLesson.samples.map((s,i)=>`<section class="sample-card"><h3>${elementsEscape(s.name)}</h3><p>${elementsEscape(s.composition)}</p><div role="group" aria-label="${elementsEscape(s.name)}的分类">${ElementsLesson.labels.map((label,j)=>`<button data-sample="${i}" data-classification="${j}" aria-pressed="${a[i]===j}">${label}</button>`).join('')}</div></section>`).join('')}</div>`;}
function renderElements(focus=false){
  document.querySelector('#elements-progress').textContent=elementsIndex===5?'5 题完成':`第 ${elementsIndex+1} / 5 题`;
  document.querySelector('#elements-dots').innerHTML=elementsQuestions.map((_,i)=>`<i class="${elementsLog.records[i].done?'done':''} ${i===elementsIndex?'current':''}"></i>`).join('');
  if(elementsIndex===5){finishElements();return;}
  const q=elementsQuestions[elementsIndex],r=elementsLog.records[elementsIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  let assignments=ElementsLesson.validAssignments(r.draft?.$classification)?[...r.draft.$classification]:[null,null,null,null];
  const entry=open?'<label for="elements-answer">用自己的话，留下你的解释</label><textarea id="elements-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="elements-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':q.kind==='classify'?classificationMarkup(assignments):`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${elementsEscape(option)}</span></button>`).join('')}</div>`;
  elementsTask.innerHTML=`<div class="elements-layout"><article class="elements-scene">${elementsScene(elementsIndex)}</article><section class="reading-work elements-work"><p class="skill-label">${q.skill}</p><h2 id="elements-question" tabindex="-1">${q.title}</h2><p class="elements-task-context">${elementsEscape(q.context)}</p>${entry}<button class="primary" id="submit-elements">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="elements-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="elements-method">暂时不会，看看方法</button>':''}<div id="elements-review" hidden></div><div id="elements-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-elements" disabled>${elementsIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#elements-message'),submit=document.querySelector('#submit-elements'),next=document.querySelector('#next-elements');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(elementsIndex!==0||document.querySelector('.elements-lab'))return;document.querySelector('#elements-lab-slot').innerHTML=labMarkup();const log=elementsLog,index=elementsIndex;bindLab(log,index);const details=document.querySelector('.elements-lab');details.addEventListener('toggle',()=>{if(details.open)log.help(index,'查看元素与物质模型');});}
  function finishClosed(){elementsTask.querySelectorAll('[data-choice],[data-sample],#submit-elements,#elements-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#elements-answer').value.trim();if(!text&&!document.querySelector('#elements-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#elements-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)elementsLog.submit(elementsIndex,answer,null,answer);elementsLog.finish(elementsIndex,button.dataset.self);elementsTask.querySelectorAll('textarea,input,#submit-elements,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  elementsTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);elementsTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  elementsTask.querySelectorAll('[data-sample]').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.sample);assignments[i]=Number(button.dataset.classification);elementsTask.querySelectorAll(`[data-sample="${i}"]`).forEach(el=>el.setAttribute('aria-pressed',String(el===button)));elementsLog.draft(elementsIndex,{$classification:[...assignments],'分类草稿':ElementsLesson.samples.map((s,j)=>s.name+'：'+(assignments[j]===null?'未选择':ElementsLesson.labels[assignments[j]])).join('；')});});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)elementsLog.submit(elementsIndex,answer,null,answer);if(first)elementsLog.help(elementsIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='classify'){
      if(!ElementsLesson.validAssignments(assignments,true)){say('还有样品没有归类。4张都选好，再一起提交。',true);return;}
      answer=ElementsLesson.answerText(assignments);correct=ElementsLesson.checkAssignments(assignments);
    }else{
      if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}
      answer=q.options[selected];correct=selected===q.answer;
    }
    elementsLog.submit(elementsIndex,answer,correct);if(correct){elementsLog.finish(elementsIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(elementsIndex===0)showLab();}
  };
  if(!open)document.querySelector('#elements-method').onclick=()=>{if(!r.first)elementsLog.submit(elementsIndex,'暂时不会，选择查看方法',false);elementsLog.help(elementsIndex,'查看本题方法');elementsLog.finish(elementsIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(elementsTask,elementsLog,elementsIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{elementsIndex++;renderElements(true);};
  if(focus){document.querySelector('#elements-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishElements(){
  elementsTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>先数物质，再看元素。</strong></p><p>只有一种元素，不一定是纯净物；由不同元素组成，也不一定是混合物。单质、化合物都要先满足“纯净物”这个条件。</p><p class="finish-note">2题判断、1题分类、2题解释与迁移。参考后的自检不等于独立掌握；以后遇到新样品，先列出所含物质，再判断元素种类；分子多少和排列不是分类依据。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-elements">重新练这5题（保留旧记录）</button></section>${elementsLog.html()}`;
  document.querySelector('#restart-elements').onclick=()=>{elementsLog=LearningFeedback.create(ElementsLesson.title,elementsQuestions,true);elementsLog.save();elementsIndex=0;renderElements(true);};elementsTask.querySelector('h2').focus({preventScroll:true});
}
renderElements();
