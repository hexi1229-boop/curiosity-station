'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='gist'))LearningFeedback.courses.push(['gist',GistLesson.title,'gist.html']);
const gistQuestions=GistLesson.questions,gistEscape=LearningFeedback.esc;
const gistTask=document.querySelector('#gist-task');
let gistLog=LearningFeedback.create(GistLesson.title,gistQuestions),gistIndex=gistLog.index;
function gistScene(index){const p=gistQuestions[index].passage;return `<div class="news-kicker"><span>校园快讯</span><span>原创教学材料</span></div><h2>${p.title}</h2><ol class="gist-lines">${p.lines.map(line=>`<li>${gistEscape(line)}</li>`).join('')}</ol><p class="source-note">材料中的事实可以反复看；概括时，要按题目取舍。</p>`;}
function cardsMarkup(){return `<p class="cards-instruction">点信息卡，在两个区域间移动，无需排顺序。保留3张后确认；键盘也能操作。</p><div class="card-zone keep-zone"><h3>保留的信息</h3><div id="gist-keep"></div></div><div class="card-zone leave-zone"><h3>这次暂不保留</h3><div id="gist-leave"></div></div><p id="gist-card-status" class="card-status" role="status"></p>`;}
function labMarkup(){return `<details class="gist-lab" data-help="查看概括编辑台"><summary>动手看：一句概括怎样形成？</summary><div class="gist-lab-body"><div class="method-tabs" role="group" aria-label="概括的四个步骤">${GistLesson.method.map((step,i)=>`<button type="button" data-step="${i}" aria-pressed="false">${i+1} · ${step.label}</button>`).join('')}</div><div id="gist-method-view" aria-live="polite"></div><p class="method-boundary">这次练的是短消息的主要事件。换成通知、人物分析或说明文，先看题目要什么，不能机械保留同样三项。</p></div></details>`;}
function bindLab(){
  let index=Number.isInteger(gistLog.checkpoint.gistMethod)&&gistLog.checkpoint.gistMethod>=0&&gistLog.checkpoint.gistMethod<4?gistLog.checkpoint.gistMethod:0;
  function draw(){const s=GistLesson.methodState(index);document.querySelector('#gist-method-view').innerHTML=`<p class="method-index">第 ${index+1} / 4 步</p><h3>${s.heading}</h3><div class="method-facts">${GistLesson.methodCards.map((text,i)=>`<span class="${index>0?(s.keep.includes(i)?'kept':'omitted'):''}">${gistEscape(text)}${index>0&&i===3?'<small>这次可省</small>':''}</span>`).join('')}</div>${s.sentence?`<p class="summary-preview">${gistEscape(s.sentence)}</p>`:''}${index===3?'<p class="added-claim"><del>从此再也不会出故障</del><span>原文没有保证</span></p>':''}<p>${s.note}</p>`;document.querySelectorAll('[data-step]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.step)===index)));}
  document.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>{index=Number(button.dataset.step);gistLog.point({gistMethod:index});gistLog.help(gistIndex,'切换概括步骤');draw();});draw();
}
function renderGist(focus=false){
  document.querySelector('#gist-progress').textContent=gistIndex===5?'5 题完成':`第 ${gistIndex+1} / 5 题`;
  document.querySelector('#gist-dots').innerHTML=gistQuestions.map((_,i)=>`<i class="${gistLog.records[i].done?'done':''} ${i===gistIndex?'current':''}"></i>`).join('');
  if(gistIndex===5){finishGist();return;}
  const q=gistQuestions[gistIndex],r=gistLog.records[gistIndex],open=q.kind==='open';
  let picked=GistLesson.validCards(gistLog.checkpoint.gistCards)?[...gistLog.checkpoint.gistCards]:[];
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${gistEscape(option)}</span></button>`).join('')}</div>`:open?`<label for="gist-answer">${gistIndex===4?'用自己的话，写1–2句概括':'补上缺少的信息，再说明为什么需要它'}</label><textarea id="gist-answer" maxlength="600" rows="4" placeholder="用自己的话，不必照搬示范。"></textarea><label class="reason-unsure"><input id="gist-unsure" type="checkbox">我暂时说不清，先如实记下来</label>`:cardsMarkup();

  gistTask.innerHTML=`<div class="gist-layout"><article class="gist-scene">${gistScene(gistIndex)}</article><section class="reading-work gist-work"><p class="skill-label">${q.skill}</p><h2 id="gist-question" tabindex="-1">${q.title}</h2>${q.task?`<p class="gist-task-note">${q.task}</p>`:''}${entry}<button class="primary" id="submit-gist">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="gist-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="gist-method">暂时不会，看看方法</button>':''}<div id="gist-review" hidden></div><div id="gist-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-gist" disabled>${gistIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#gist-message'),submit=document.querySelector('#submit-gist'),next=document.querySelector('#next-gist');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(gistIndex!==0||document.querySelector('.gist-lab'))return;document.querySelector('#gist-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.gist-lab');details.addEventListener('toggle',()=>{if(details.open)gistLog.help(gistIndex,'查看概括编辑台');});}
  function finishClosed(){gistTask.querySelectorAll('[data-choice],[data-card],#submit-gist,#gist-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#gist-answer').value.trim();if(!text&&!document.querySelector('#gist-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#gist-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)gistLog.submit(gistIndex,answer,null,answer);gistLog.finish(gistIndex,button.dataset.self);gistTask.querySelectorAll('textarea,input,#submit-gist,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  gistTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);gistTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)gistLog.submit(gistIndex,answer,null,answer);if(first)gistLog.help(gistIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{correct=GistLesson.checkCards(picked);if(correct===null){say('按这次任务保留3张卡，再一起核对。',true);return;}answer=GistLesson.cardAnswer(picked);}
    gistLog.submit(gistIndex,answer,correct);if(correct){gistLog.finish(gistIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(gistIndex===0)showLab();}
  };
  if(!open)document.querySelector('#gist-method').onclick=()=>{if(!r.first)gistLog.submit(gistIndex,'暂时不会，选择查看方法',false);gistLog.help(gistIndex,'查看本题方法');gistLog.finish(gistIndex,'看过方法，留待再练');finishClosed();};
  if(q.kind==='cards'){
    function drawCards(){
      const button=(card,id)=>`<button type="button" class="info-card" data-card="${id}" aria-pressed="${picked.includes(id)}" aria-label="${picked.includes(id)?'移回':'保留'}第${id+1}张：${gistEscape(card.text)}"><span class="card-number">${id+1}</span><span>${gistEscape(card.text)}</span><span class="card-action" aria-hidden="true">${picked.includes(id)?'移回 ↓':'保留 ↑'}</span></button>`;
      document.querySelector('#gist-keep').innerHTML=GistLesson.cards.map((c,i)=>picked.includes(i)?button(c,i):'').join('')||'<p class="empty-cards">把需要的信息放进这里。</p>';
      document.querySelector('#gist-leave').innerHTML=GistLesson.cards.map((c,i)=>!picked.includes(i)?button(c,i):'').join('')||'<p class="empty-cards">所有卡片都被保留了。按任务再做取舍。</p>';
      document.querySelector('#gist-card-status').textContent=`已保留 ${picked.length} 张，本题需要3张。确认后再核对。`;
      gistTask.querySelectorAll('[data-card]').forEach(el=>el.onclick=()=>{const id=Number(el.dataset.card);picked=picked.includes(id)?picked.filter(n=>n!==id):[...picked,id];gistLog.point({gistCards:[...picked]});gistLog.draft(gistIndex,{'信息卡草稿':GistLesson.cardAnswer(picked)});drawCards();gistTask.querySelector(`[data-card="${id}"]`).focus({preventScroll:true});});
    }
    drawCards();
  }
  LearningFeedback.watchHelp(gistTask,gistLog,gistIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{gistIndex++;renderGist(true);};
  if(focus){document.querySelector('#gist-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishGist(){
  gistTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>看任务 → 选主要信息 → 连成意思 → 检查有没有漏掉或添上。</strong></p><p>这次练短消息中的主要事件。简短不等于只剩一句空话；完整也不等于每个细节都照抄。</p><p class="finish-note">2题判断、1题信息卡取舍、2题保留解释与概括。开放表达不自动评分，换材料独立概括还需要继续观察。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-gist">重新练这5题（保留旧记录）</button></section>${gistLog.html()}`;
  document.querySelector('#restart-gist').onclick=()=>{gistLog=LearningFeedback.create(GistLesson.title,gistQuestions,true);gistLog.save();gistIndex=0;renderGist(true);};gistTask.querySelector('h2').focus({preventScroll:true});
}
renderGist();
