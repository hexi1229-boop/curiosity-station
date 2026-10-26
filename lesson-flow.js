/* Five-task flow for the new bridge lessons. Existing lessons keep their own flows. */
'use strict';
(function(){
 const L=CurrentLesson,Q=L.questions,esc=LearningFeedback.esc,task=document.querySelector('#lesson-task');
 if(!LearningFeedback.courses.some(c=>c[0]===L.id))LearningFeedback.courses.push([L.id,L.title,L.id+'.html']);
 let log=LearningFeedback.create(L.title,Q),index=log.index,cleanup=()=>{};
 window.addEventListener('pagehide',()=>cleanup());
 function render(focus=false){
  cleanup();cleanup=()=>{};
  document.querySelector('#lesson-progress').textContent=index===Q.length?'5 题完成':`第 ${index+1} / 5 题`;
  document.querySelector('#lesson-dots').innerHTML=Q.map((_,i)=>`<i class="${log.records[i].done?'done':''} ${i===index?'current':''}"></i>`).join('');
  if(index===Q.length){finish();return;}
  const n=index,current=log,q=Q[n],r=current.records[n],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  let picks=Array.isArray(r.draft?.picks)?r.draft.picks.filter(i=>Number.isInteger(i)&&i>=0&&i<q.options?.length):[];
  let entry='';
  if(q.kind==='choice')entry=`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((s,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${esc(s)}</span></button>`).join('')}</div>`;
  if(q.kind==='cards')entry=`<p class="card-count" id="card-count"></p><div class="reading-choices" role="group" aria-label="选择证据卡">${q.options.map((s,i)=>`<button class="reading-choice" data-card="${i}" aria-pressed="false"><span>${i+1}</span><span>${esc(s)}</span></button>`).join('')}</div>`;
  if(open)entry=`<label for="lesson-answer">${esc(q.entryLabel||'留一两句自己的解释')}</label><textarea id="lesson-answer" maxlength="${q.maxLength||600}" rows="4" placeholder="${esc(q.placeholder||'短句、算式或关键词都可以，也可用键盘语音输入。')}"></textarea><label class="reason-unsure"><input id="lesson-unsure" type="checkbox">我暂时说不清，先如实记下来</label>`;
  if(q.kind==='number')entry=`<label for="lesson-number">${esc(q.entryLabel||'填一个数值')}</label><div class="lesson-number"><input id="lesson-number" inputmode="decimal" autocomplete="off" maxlength="24"><span>${esc(q.unit||'')}</span></div>`;
  task.innerHTML=`<div class="lesson-layout"><article class="lesson-scene">${q.scene||`<p>${esc(q.context)}</p>`}<p class="source-note">${esc(q.origin||L.origin||'原创教学材料')}</p></article><section class="reading-work"><p class="skill-label">${esc(q.skill)}</p><h2 id="lesson-question" tabindex="-1">${esc(q.title)}</h2><p class="lesson-context">${esc(q.instruction||'根据左侧材料作答；小屏幕上材料在题目上方。')}</p>${entry}<button class="primary" id="lesson-submit">${open?'先保存我的想法':'确认我的判断'}</button><div class="reading-message" id="lesson-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${esc(q.hint)}</p></details>${!open?'<button class="text-button" id="lesson-method">暂时不会，看看方法</button>':''}<div id="lesson-review" hidden></div><div id="lesson-lab"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="lesson-next" disabled>${n===Q.length-1?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=task.querySelector('#lesson-message'),submit=task.querySelector('#lesson-submit'),next=task.querySelector('#lesson-next');
  function say(s,error=false){message.textContent=s;message.dataset.error=String(error);}
  if(L.bindScene){const stopScene=L.bindScene(task.querySelector('.lesson-scene'),current,n);if(typeof stopScene==='function')cleanup=stopScene;}
  function lab(){if(!L.lab||!L.labAt.includes(n)||task.querySelector('#lesson-lab').children.length)return;const stop=L.lab(task.querySelector('#lesson-lab'),current,n);if(typeof stop==='function'){const previous=cleanup;cleanup=()=>{previous();stop();};}}
  function lock(){task.querySelectorAll('[data-choice],[data-card],#lesson-number,#lesson-submit,#lesson-method').forEach(e=>e.disabled=true);say(q.explanation);next.disabled=false;lab();}
  function answer(){const text=task.querySelector('#lesson-answer').value.trim();if(!text&&!task.querySelector('#lesson-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function review(){
   current.help(n,'参考方法（提交后）');const box=task.querySelector('#lesson-review');box.hidden=false;
   box.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的依据</h3><p>${esc(q.reference)}</p><ul>${q.checks.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p>原话和修改分别保留。开放解释不自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还需要一点帮助</button></div></section>`;
   submit.textContent='保存我的修改';
   box.querySelectorAll('[data-self]').forEach(b=>b.onclick=()=>{const value=answer();if(!value)return;if(value!==r.attempts.at(-1)?.answer)current.submit(n,value,null,value);current.finish(n,b.dataset.self);task.querySelectorAll('textarea,input,#lesson-submit,[data-self]').forEach(e=>e.disabled=true);b.setAttribute('aria-pressed','true');say('原话、修改和自检已保存；自评不等于已经独立掌握。');next.disabled=false;});
  }
  function drawCards(){task.querySelectorAll('[data-card]').forEach(b=>b.setAttribute('aria-pressed',String(picks.includes(Number(b.dataset.card)))));task.querySelector('#card-count').textContent=`已选 ${picks.length} / ${q.pick} 张`;} 
  task.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.choice);task.querySelectorAll('[data-choice]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));});
  task.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.card);if(picks.includes(i))picks=picks.filter(x=>x!==i);else if(picks.length<q.pick)picks.push(i);else{say(`最多选${q.pick}张；先取消一张再换。`,true);return;}current.draft(n,{picks:[...picks]});drawCards();});
  submit.onclick=()=>{
   if(L.beforeSubmit){const warning=L.beforeSubmit(n,current);if(warning){say(warning,true);return;}}
   if(open){const value=answer();if(!value)return;if(value!==r.attempts.at(-1)?.answer)current.submit(n,value,null,value);review();say('先对照自己的方法，再完成本题自检。');return;}
   let value,correct;
   if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}value=q.options[selected];correct=selected===q.answer;}
   if(q.kind==='cards'){if(picks.length!==q.pick){say(`请选${q.pick}张证据卡，再确认。`,true);return;}value=picks.map(i=>`${i+1}. ${q.options[i]}`).join('；');correct=picks.length===q.answer.length&&picks.every(i=>q.answer.includes(i));}
   if(q.kind==='number'){const raw=task.querySelector('#lesson-number').value.trim(),valueNumber=L.readNumber(raw);if(valueNumber===null){say('请填一个数值；暂时不会可以直接看方法。',true);return;}value=raw+(q.unit||'');correct=Math.abs(valueNumber-q.answer)<1e-8;}
   current.submit(n,value,correct);
   if(correct){current.finish(n);lock();}else{say(q.retry||'首答已保留。回到材料，检查每一步依据；可以重试或看提示。',true);lab();}
  };
  if(!open)task.querySelector('#lesson-method').onclick=()=>{if(!r.first)current.submit(n,'暂时不会，选择查看方法',false);current.help(n,'查看本题方法');current.finish(n,'看过方法，留待再练');lock();};
  LearningFeedback.watchHelp(task,current,n);if(q.kind==='cards')drawCards();
  if(q.labBefore)lab();
  if(r.done&&!open)lock();else if(r.first){if(open){review();say('原话和草稿已恢复，继续对照或修改即可。');}else{say('首答已经保留，可以继续尝试。',true);lab();}}
  next.onclick=()=>{index++;render(true);};
  if(focus){task.querySelector('#lesson-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
 }
 function finish(){
  task.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题走完，今天先到这里。</h2><p><strong>${esc(L.takeaway)}</strong></p><ul>${L.summary.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="finish-note">首答、帮助和自己的解释，比“最后做完了”更能说明下一步。下次换新材料再试，本页不自动认定已经掌握。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="lesson-restart">重新练这5题（保留旧记录）</button><details class="reading-hint"><summary>家长参考：目标、边界与来源</summary>${L.sources}</details></section>${log.html()}`;
  task.querySelector('#lesson-restart').onclick=()=>{log=LearningFeedback.create(L.title,Q,true);log.save();index=0;render(true);};task.querySelector('h2').focus({preventScroll:true});
 }
 render();
})();
