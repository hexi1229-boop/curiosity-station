'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='character'))LearningFeedback.courses.push(['character',CharacterLesson.title,'character.html']);
const characterQuestions=CharacterLesson.questions,characterEscape=LearningFeedback.esc;
const characterTask=document.querySelector('#character-task');
let characterLog=LearningFeedback.create(CharacterLesson.title,characterQuestions),characterIndex=characterLog.index;
function characterScene(index){const p=characterQuestions[index].passage;return `<div class="news-kicker"><span>人物片段</span><span>原创教学材料</span></div><h2>${p.title}</h2><ol class="character-lines">${p.lines.map(line=>`<li>${characterEscape(line)}</li>`).join('')}</ol><p class="source-note">可以反复看原文。人物的反应、选择与所处情境，要联系起来理解。</p>`;}
function cardsMarkup(){return `<p class="cards-instruction">点信息卡，在两个区域间移动，无需排顺序。选出2张后确认；键盘也能操作。</p><div class="card-zone keep-zone"><h3>选作直接依据</h3><div id="character-keep"></div></div><div class="card-zone leave-zone"><h3>其他信息</h3><div id="character-leave"></div></div><p id="character-card-status" class="card-status" role="status"></p>`;}
function labMarkup(){return `<details class="character-lab" data-help="查看人物证据透镜"><summary>动手看：把两处证据连起来</summary><div class="character-lab-body"><p class="cards-instruction">点亮或关掉两处证据，比较每一种判断能走到哪里。原文始终可回看。</p><div class="lens-buttons" role="group" aria-label="人物证据透镜">${CharacterLesson.lenses.map((lens,i)=>`<button type="button" data-lens="${i}" aria-pressed="false">${lens.label}</button>`).join('')}</div><div id="character-lens-view" aria-live="polite"></div><p class="lens-method">先理解情境 → 找具体言行 → 解释支持什么特点 → 检查是否忽略另一面。<br>不必只找优点；不同理解都要能说明依据。</p></div></details>`;}
function bindLab(){
  const log=characterLog,index=characterIndex;
  let mask=Number.isInteger(log.checkpoint.characterLens)&&log.checkpoint.characterLens>=0&&log.checkpoint.characterLens<=3?log.checkpoint.characterLens:0;
  function draw(){const s=CharacterLesson.lensState(mask);document.querySelector('#character-lens-view').innerHTML=`<div class="lens-facts">${CharacterLesson.lenses.map((lens,i)=>`<section class="lens-fact ${s.selected.includes(i)?'active':''}"><small>${lens.type}</small><blockquote>${characterEscape(lens.quote)}</blockquote><p class="${s.selected.includes(i)?'':'lens-pending'}">${s.selected.includes(i)?characterEscape(lens.inference):'点亮这一处，再看它支持什么。'}</p></section>`).join('')}</div><h3>${s.heading}</h3><p class="lens-conclusion">${s.claim}</p><p class="method-boundary">${s.boundary}</p>`;document.querySelectorAll('[data-lens]').forEach(button=>button.setAttribute('aria-pressed',String(s.selected.includes(Number(button.dataset.lens)))));}
  document.querySelectorAll('[data-lens]').forEach(button=>button.onclick=()=>{mask^=1<<Number(button.dataset.lens);log.point({characterLens:mask});log.help(index,'切换人物证据透镜');draw();});draw();
}
function renderCharacter(focus=false){
  document.querySelector('#character-progress').textContent=characterIndex===5?'5 题完成':`第 ${characterIndex+1} / 5 题`;
  document.querySelector('#character-dots').innerHTML=characterQuestions.map((_,i)=>`<i class="${characterLog.records[i].done?'done':''} ${i===characterIndex?'current':''}"></i>`).join('');
  if(characterIndex===5){finishCharacter();return;}
  const q=characterQuestions[characterIndex],r=characterLog.records[characterIndex],open=q.kind==='open';
  let picked=CharacterLesson.validCards(characterLog.checkpoint.characterCards)?[...characterLog.checkpoint.characterCards]:[];
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${characterEscape(option)}</span></button>`).join('')}</div>`:open?`<label for="character-answer">${q.label}</label><textarea id="character-answer" maxlength="600" rows="4" placeholder="用自己的话，不必照搬示范。"></textarea><label class="reason-unsure"><input id="character-unsure" type="checkbox">我暂时说不清，先如实记下来</label>`:cardsMarkup();

  characterTask.innerHTML=`<div class="character-layout"><article class="character-scene">${characterScene(characterIndex)}</article><section class="reading-work character-work"><p class="skill-label">${q.skill}</p><h2 id="character-question" tabindex="-1">${q.title}</h2>${q.task?`<p class="character-task-note">${q.task}</p>`:''}${entry}<button class="primary" id="submit-character">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="character-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="character-method">暂时不会，看看方法</button>':''}<div id="character-review" hidden></div><div id="character-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-character" disabled>${characterIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#character-message'),submit=document.querySelector('#submit-character'),next=document.querySelector('#next-character');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(characterIndex!==0||document.querySelector('.character-lab'))return;document.querySelector('#character-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.character-lab'),log=characterLog,index=characterIndex;details.addEventListener('toggle',()=>{if(details.open)log.help(index,'查看人物证据透镜');});}
  function finishClosed(){characterTask.querySelectorAll('[data-choice],[data-card],#submit-character,#character-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#character-answer').value.trim();if(!text&&!document.querySelector('#character-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#character-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)characterLog.submit(characterIndex,answer,null,answer);characterLog.finish(characterIndex,button.dataset.self);characterTask.querySelectorAll('textarea,input,#submit-character,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  characterTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);characterTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)characterLog.submit(characterIndex,answer,null,answer);if(first)characterLog.help(characterIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{correct=CharacterLesson.checkCards(picked);if(correct===null){say('按这次任务选出2张卡，再一起核对。',true);return;}answer=CharacterLesson.cardAnswer(picked);}
    characterLog.submit(characterIndex,answer,correct);if(correct){characterLog.finish(characterIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(characterIndex===0)showLab();}
  };
  if(!open)document.querySelector('#character-method').onclick=()=>{if(!r.first)characterLog.submit(characterIndex,'暂时不会，选择查看方法',false);characterLog.help(characterIndex,'查看本题方法');characterLog.finish(characterIndex,'看过方法，留待再练');finishClosed();};
  if(q.kind==='cards'){
    function drawCards(){
      const button=(card,id)=>`<button type="button" class="info-card" data-card="${id}" aria-pressed="${picked.includes(id)}" aria-label="${picked.includes(id)?'移回':'选择'}第${id+1}张：${characterEscape(card.text)}"><span class="card-number">${id+1}</span><span>${characterEscape(card.text)}</span><span class="card-action" aria-hidden="true">${picked.includes(id)?'移回 ↓':'选择 ↑'}</span></button>`;
      document.querySelector('#character-keep').innerHTML=CharacterLesson.cards.map((c,i)=>picked.includes(i)?button(c,i):'').join('')||'<p class="empty-cards">把需要的信息放进这里。</p>';
      document.querySelector('#character-leave').innerHTML=CharacterLesson.cards.map((c,i)=>!picked.includes(i)?button(c,i):'').join('')||'<p class="empty-cards">所有卡片都被保留了。按任务再做取舍。</p>';
      document.querySelector('#character-card-status').textContent=`已保留 ${picked.length} 张，本题需要2张。确认后再核对。`;
      characterTask.querySelectorAll('[data-card]').forEach(el=>el.onclick=()=>{const id=Number(el.dataset.card);picked=picked.includes(id)?picked.filter(n=>n!==id):[...picked,id];characterLog.point({characterCards:[...picked]});characterLog.draft(characterIndex,{'信息卡草稿':CharacterLesson.cardAnswer(picked)});drawCards();characterTask.querySelector(`[data-card="${id}"]`).focus({preventScroll:true});});
    }
    drawCards();
  }
  LearningFeedback.watchHelp(characterTask,characterLog,characterIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{characterIndex++;renderCharacter(true);};
  if(focus){document.querySelector('#character-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishCharacter(){
  characterTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>人物特点，要用情境中的具体言行来解释。</strong></p><p>紧张和勇于承担可以同时存在。同一个动作，放在不同情境中可能有不同含义；证据不足时，也可以暂不下结论。</p><p class="finish-note">2题判断、1题证据卡、2题个人解释。开放表达不自动判分；能独立分析新的材料，才更接近真正会用。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-character">重新练这5题（保留旧记录）</button></section>${characterLog.html()}`;
  document.querySelector('#restart-character').onclick=()=>{characterLog=LearningFeedback.create(CharacterLesson.title,characterQuestions,true);characterLog.save();characterIndex=0;renderCharacter(true);};characterTask.querySelector('h2').focus({preventScroll:true});
}
renderCharacter();
