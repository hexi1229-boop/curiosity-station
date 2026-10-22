'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='division'))LearningFeedback.courses.push(['division',DivisionLesson.title,'division.html']);
const divisionQuestions=DivisionLesson.questions,divisionEscape=LearningFeedback.esc;
const divisionTask=document.querySelector('#division-task');
let divisionLog=LearningFeedback.create(DivisionLesson.title,divisionQuestions),divisionIndex=divisionLog.index,divisionTimer=null;
function cellDrawing(x,y,type='initial',scale=1){
 const w=type==='surface'?68:48,h=type==='surface'?28:48,chloroplasts=type==='leaf'?'<g class="chloroplast"><ellipse cx="-12" cy="-12" rx="4" ry="7"/><ellipse cx="13" cy="-11" rx="4" ry="7"/><ellipse cx="-11" cy="12" rx="4" ry="7"/><ellipse cx="13" cy="12" rx="4" ry="7"/></g>':'';
 return `<g transform="translate(${x} ${y}) scale(${scale})" class="cell-shape ${type}"><rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="7"/><circle class="nucleus" r="6"/>${chloroplasts}</g>`;
}
function divisionScene(index){
 if(index===0)return `<p class="scene-kicker">一条还不完整的观察记录</p><h2>看到“变多”，还缺什么证据？</h2><div class="process-facts"><p><b>开始：1个细胞</b>后来：8个细胞</p><p>没有记录细胞的结构与功能是否出现差异。</p></div><p class="source-note">先留下判断，再操作三种变化的对比模型。</p>`;
 if(index===1)return `<p class="scene-kicker">所有细胞都参与两轮分裂</p><h2>从3个出发，而不是从1个出发</h2><svg viewBox="0 0 360 115" role="img" aria-label="开始有3个相似细胞">${[85,180,275].map(x=>cellDrawing(x,55)).join('')}</svg><div class="process-facts"><p><b>第1轮：所有细胞各分一次</b>第2轮：此时所有细胞再各分一次</p></div><p>只数细胞，不计算体积；题目没有死亡或移出的细胞。</p>`;
 if(index===2)return `<p class="scene-kicker">“一分为二”的推理可信吗</p><h2>先想：分开前发生了什么？</h2><div class="process-facts"><p>原细胞（复制前）</p><p>经过正常体细胞分裂</p><p>两个新细胞，各得到多少遗传信息？</p></div><p class="source-note">比较遗传信息，不把细胞大小当作信息多少。</p>`;
 if(index===3)return `<p class="scene-kicker">三个记录，三种主要变化</p><h2>盯住证据：数、大小、结构与功能</h2><div class="process-facts"><p><b>数量</b>几个变成几个？</p><p><b>大小</b>每个细胞的体积怎样变化？</p><p><b>结构与功能</b>出现了哪些不同特点和作用？</p></div>`;
 return `<p class="scene-kicker">换成动物细胞的培养记录</p><h2>“几个”与“几种”，分开回答</h2><div class="process-facts"><p><b>记录①</b>4个细胞各分一次 → 8个</p><p><b>记录②：继续跟踪同一批8个</b>出现肌细胞、神经细胞<br>没有再分裂或死亡</p></div><p class="source-note">这是给定条件下的材料分析。不同细胞实际分化需要相应条件，不是任意细胞都能随意转换类型。</p>`;
}
function labMarkup(){return `<details class="division-lab" data-help="查看生长分裂分化模型"><summary>动手对比：变大、变多、分工</summary><div class="division-lab-body"><div class="process-modes"><button data-mode="grow">生长</button><button data-mode="divide">分裂</button><button data-mode="specialize">分化</button></div><div id="division-diagram"></div><label for="division-step">观察进度 <output id="division-step-label"></output></label><input id="division-step" type="range" min="0" max="2" step="1" value="0"><div class="process-controls"><button id="division-play">播放这段变化</button><button id="division-reset">回到起点</button></div><p class="process-description" id="division-description" aria-live="polite"></p><p class="model-note">每个按钮切换一段独立示意；不是所有细胞必须依次经历的操作菜单。图形、颜色和进度都用于说明，不按真实比例或时间。分化示意只截取4个细胞，忽略同时发生的生长与分裂。细胞受到调控，不会随意变成任何类型；成熟细胞的分裂能力也不同。</p></div></details>`;}
function stopDivision(){if(divisionTimer!==null){clearInterval(divisionTimer);divisionTimer=null;}const button=document.querySelector('#division-play');if(button)button.textContent='播放这段变化';}
function bindLab(){
 let mode=divisionLog.checkpoint.divisionMode||'grow',step=divisionLog.checkpoint.divisionStep||0;
 try{DivisionLesson.state(mode,step);}catch{mode='grow';step=0;}
 const slider=document.querySelector('#division-step');
 function draw(){const s=DivisionLesson.state(mode,step);slider.max=mode==='divide'?3:2;slider.value=step;document.querySelector('#division-step-label').textContent=s.label;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const cells=s.types.map((type,i)=>{const cols=s.count===1?1:Math.min(s.count,4),x=180+(i%cols-(cols-1)/2)*82,y=s.count>4?65+Math.floor(i/cols)*85:100;return cellDrawing(x,y,type,s.size);}).join('');
 document.querySelector('#division-diagram').innerHTML=`<svg viewBox="0 0 360 200" role="img" aria-label="${s.label}，当前${s.count}个细胞；${mode==='specialize'?'扁平表示表皮细胞，带绿色结构表示叶肉细胞。':'圆点表示细胞核。'}">${cells}</svg><p class="process-count">当前：<b>${s.count}个细胞</b></p>${mode==='specialize'?'<p class="process-legend">扁平：表皮细胞，参与保护<br>绿色结构：叶绿体；叶肉细胞，进行光合作用</p>':''}`;
 document.querySelector('#division-description').textContent=mode==='grow'?'细胞体积增大，数量仍是1个。这一段只比较大小。生长需要从外界吸收物质并进行生命活动。':mode==='divide'?'数量1→2→4→8。这里假设每轮所有细胞各分一次。正常体细胞分裂前遗传物质先复制，再平均分配；新细胞染色体数目和遗传信息与原细胞复制前一致，不是每个只拿半套。':step===0?'4个原本相似的植物细胞，先看它们后续的结构与功能。':step===1?'部分细胞成为扁平的表皮细胞；这组示意仍共4个，尚有未表现出该分化特点的细胞。':'仍是4个：部分表皮细胞参与保护，部分叶肉细胞富含叶绿体、进行光合作用。分化产生结构和功能差异，同类细胞组成相应组织。它不是把一套遗传信息撕成不同碎片；通常是遗传信息的利用方式不同。';
 }
 function update(){divisionLog.point({divisionMode:mode,divisionStep:step});divisionLog.draft(divisionIndex,{'division-step':String(step)});divisionLog.help(divisionIndex,'操作生长分裂分化模型');draw();}
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{stopDivision();mode=b.dataset.mode;step=0;update();});slider.oninput=()=>{stopDivision();step=Number(slider.value);update();};document.querySelector('#division-reset').onclick=()=>{stopDivision();step=0;update();};document.querySelector('#division-play').onclick=()=>{if(divisionTimer!==null){stopDivision();return;}const max=mode==='divide'?3:2;if(step===max)step=0;update();document.querySelector('#division-play').textContent='暂停播放';divisionTimer=setInterval(()=>{step++;update();if(step>=max)stopDivision();},1000);};draw();
}
function renderDivision(focus=false){
  stopDivision();
  document.querySelector('#division-progress').textContent=divisionIndex===5?'5 题完成':`第 ${divisionIndex+1} / 5 题`;
  document.querySelector('#division-dots').innerHTML=divisionQuestions.map((_,i)=>`<i class="${divisionLog.records[i].done?'done':''} ${i===divisionIndex?'current':''}"></i>`).join('');
  if(divisionIndex===5){finishDivision();return;}
  const q=divisionQuestions[divisionIndex],r=divisionLog.records[divisionIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${divisionEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="division-answer">用自己的话，留下你的解释</label><textarea id="division-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="division-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`<label for="division-number">${q.label}</label><div class="number-answer"><input id="division-number" inputmode="numeric" autocomplete="off" maxlength="30"><span>${q.unit}</span></div>`;
  divisionTask.innerHTML=`<div class="division-layout"><article class="division-scene">${divisionScene(divisionIndex)}</article><section class="reading-work division-work"><p class="skill-label">${q.skill}</p><h2 id="division-question" tabindex="-1">${q.title}</h2><p class="division-task-context">${divisionEscape(q.context)}</p>${entry}<button class="primary" id="submit-division">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="division-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="division-method">暂时不会，看看方法</button>':''}<div id="division-review" hidden></div><div id="division-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-division" disabled>${divisionIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#division-message'),submit=document.querySelector('#submit-division'),next=document.querySelector('#next-division');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(divisionIndex!==0||document.querySelector('.division-lab'))return;document.querySelector('#division-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.division-lab');details.addEventListener('toggle',()=>{if(details.open)divisionLog.help(divisionIndex,'查看生长分裂分化模型');});}
  function finishClosed(){divisionTask.querySelectorAll('[data-choice],#division-number,#submit-division,#division-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#division-answer').value.trim();if(!text&&!document.querySelector('#division-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#division-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)divisionLog.submit(divisionIndex,answer,null,answer);divisionLog.finish(divisionIndex,button.dataset.self);divisionTask.querySelectorAll('textarea,input,#submit-division,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  divisionTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);divisionTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)divisionLog.submit(divisionIndex,answer,null,answer);if(first)divisionLog.help(divisionIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#division-number').value;const value=DivisionLesson.readNumber(raw);if(value===null){say('这里填细胞总数，只填非负整数，例如 6。',true);return;}answer=raw.trim()+(q.unit?' '+q.unit:'');correct=value===q.answer;}
    divisionLog.submit(divisionIndex,answer,correct);if(correct){divisionLog.finish(divisionIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(divisionIndex===0)showLab();}
  };
  if(!open)document.querySelector('#division-method').onclick=()=>{if(!r.first)divisionLog.submit(divisionIndex,'暂时不会，选择查看方法',false);divisionLog.help(divisionIndex,'查看本题方法');divisionLog.finish(divisionIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(divisionTask,divisionLog,divisionIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{divisionIndex++;renderDivision(true);};
  if(focus){document.querySelector('#division-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishDivision(){
  divisionTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>变大看生长，变多看分裂，分工看分化。</strong></p><p>分裂前先复制遗传物质，再向新细胞分配。分化使结构与功能出现差异，同类细胞组成组织；细胞“几种”不等于“几个”。</p><p class="finish-note">2题判断、1题数值、2题解释与迁移。参考后的自检不等于独立掌握；以后换成新的生物材料，还要根据观察证据判断过程，不能只看到“变了”就猜词。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-division">重新练这5题（保留旧记录）</button></section>${divisionLog.html()}`;
  document.querySelector('#restart-division').onclick=()=>{divisionLog=LearningFeedback.create(DivisionLesson.title,divisionQuestions,true);divisionLog.save();divisionIndex=0;renderDivision(true);};divisionTask.querySelector('h2').focus({preventScroll:true});
}
renderDivision();
