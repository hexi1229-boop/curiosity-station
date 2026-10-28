'use strict';
(function(){
 const L=RepairLesson,F=LearningFeedback,esc=F.esc;
 for(const round of L.rounds)if(!F.courses.some(c=>c[0]===round.id))F.courses.unshift([round.id,round.title,round.route]);
 const round=L.rounds[new URLSearchParams(location.search).get('round')==='2'?1:0];
 let log=F.create(round.title,round.questions),timer=null;
 // A replaced question must not reinterpret a saved answer to the old question.
 const carried=L.carryRecords(log.records,round.questions);
 if(log.active&&carried.some(record=>record===null)){
  const changed=carried.map((record,i)=>record===null?i:-1).filter(i=>i>=0);
  const previous={...log.checkpoint};log=F.create(round.title,round.questions,true);
  carried.forEach((record,i)=>{if(record){log.records[i]=record;log.note(i,'沿用更新前同一道题的已有记录，本次未要求重做已完成部分。');}});
  log.point({...previous,mode:'study',examStarted:false,lessonIndex:L.lessons.findIndex(l=>l.id===round.questions[changed[0]].sources[0])});
  changed.forEach(i=>log.note(i,'本题内容已更新；更新前的整轮原记录另存保留，不将原题答案改判为新题答案。'));
 }
 const study=document.querySelector('#study-panel'),exam=document.querySelector('#exam-panel'),panel=document.querySelector('#exam-content'),article=document.querySelector('#explanation');
 document.querySelector(round.id==='repair'?'#round-one':'#round-two').setAttribute('aria-current','page');
 document.title=round.title+' · TY敏捷课堂';
 function stopModel(){if(timer!==null){clearInterval(timer);timer=null;}}
 function setMode(mode){stopModel();study.hidden=mode!=='study';exam.hidden=mode==='study';document.querySelector('#study-tab').setAttribute('aria-pressed',String(mode==='study'));document.querySelector('#exam-tab').setAttribute('aria-pressed',String(mode!=='study'));log.point({mode});}
 function focusPanel(el){el.focus({preventScroll:true});el.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
 function renderModel(){
  const slot=document.querySelector('#work-model');if(!slot)return;
  slot.innerHTML='<div class="work-box"><label for="cooperation-days">动手看：合作了 <output id="cooperation-output">0</output> 天</label><input id="cooperation-days" type="range" min="0" max="3" step="1" value="0"><div class="work-track" role="img" aria-label="工作量进度"><div class="work-fill"></div></div><div class="work-legend" aria-live="polite"></div><p class="work-quantity"></p><div class="work-buttons"><button class="secondary" id="play-work">播放合作3天</button><button class="secondary" id="reset-work">回到开工时</button></div></div>';
  const slider=slot.querySelector('input'),play=slot.querySelector('#play-work');
  function draw(){const m=L.workModel(+slider.value);slot.querySelector('output').textContent=m.day;slot.querySelector('.work-fill').style.width=(m.done/m.total*100)+'%';slot.querySelector('.work-track').setAttribute('aria-label',`假设24件，完成${m.done}件，剩${m.left}件`);slot.querySelector('.work-legend').textContent=`假设整批24件：杨每天4件，洪每天3件，合作每天7件。已做${m.done}件，剩${m.left}件。`;slot.querySelector('.work-quantity').textContent=m.day===3?'完成21/24＝7/8批；剩3/24＝1/8批。洪每天3件，剩3件还需1天。':`已完成${m.done}/24批。这是工作量占比，时间是${m.day}天。`;}
  slider.oninput=()=>{stopModel();play.textContent='播放合作3天';draw();};
  play.onclick=()=>{if(timer!==null){stopModel();play.textContent='继续播放';return;}if(+slider.value===3)slider.value='0';draw();play.textContent='暂停';timer=setInterval(()=>{slider.value=String(+slider.value+1);draw();if(+slider.value===3){stopModel();play.textContent='重新播放';}},900);};
  slot.querySelector('#reset-work').onclick=()=>{stopModel();slider.value='0';play.textContent='播放合作3天';draw();};draw();
 }
 function renderLesson(index,focus=false){
  stopModel();index=Math.max(0,Math.min(L.lessons.length-1,index));const item=L.lessons[index];
  if(log.checkpoint.examStarted)round.questions.forEach((q,i)=>{if(q.sources.includes(item.id)&&!log.records[i].done)log.help(i,'考试中回看讲解：'+item.title);});
  const seen=[...new Set([...(log.checkpoint.studySeen||[]),item.id])];log.point({lessonIndex:index,studySeen:seen});
  document.querySelector('#lesson-list').innerHTML=L.lessons.map((l,i)=>`<button data-lesson="${i}" aria-current="${i===index}"><span>${i+1} · ${esc(l.subject)}</span>${esc(l.title)}</button>`).join('');
  document.querySelectorAll('[data-lesson]').forEach(button=>button.onclick=()=>renderLesson(Number(button.dataset.lesson),true));
  article.innerHTML=`<p class="eyebrow">讲解 ${index+1} / ${L.lessons.length} · ${esc(item.subject)}</p><h2>${esc(item.title)}</h2><p class="focus-line">${esc(item.focus)}</p><div class="source-question"><small>原题要解决的问题</small>${esc(item.source)}</div>${item.body}<p class="takeaway"><b>带走这一点：</b>${esc(item.takeaway)}</p>`;
  article.querySelectorAll('[data-close-reading]').forEach(button=>button.onclick=()=>{
   const reading=button.closest('details'),summary=reading.querySelector('summary');reading.open=false;summary.focus({preventScroll:true});summary.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  const previous=document.querySelector('#previous-lesson'),next=document.querySelector('#next-lesson');previous.disabled=index===0;previous.onclick=()=>renderLesson(index-1,true);next.textContent=index===L.lessons.length-1?'进入本轮5题':'下一个讲解';next.onclick=()=>index===L.lessons.length-1?showExam(true):renderLesson(index+1,true);
  renderModel();if(focus)focusPanel(article);
 }
 function showStudy(){setMode('study');renderLesson(Number.isInteger(log.checkpoint.lessonIndex)?log.checkpoint.lessonIndex:0);}
 function renderWelcome(){
  const remaining=log.records.filter(r=>!r.done).length;
  panel.innerHTML=`<section class="exam-welcome"><p class="eyebrow">${esc(round.label)}</p><h2>换了材料，还能自己用吗？</h2><p>${remaining<5?`本轮仍是5题，已完成的${5-remaining}题沿用原记录，只需补${remaining}题。`:'本轮只有5题。'}先保留自己的答案，整轮交卷后再对照方法；不用赶时间，草稿会自动保存。</p><p class="small-note">可以返回讲解或打开提示，页面会记录回看情况。前面学过的讲解也会单独记下；这是讲解后的练习，不能当成从未接触知识的测评。</p><button class="primary" id="start-exam">${remaining<5?`继续本轮（补${remaining}题）`:'开始本轮5题'}</button></section>`;
  panel.querySelector('#start-exam').onclick=()=>{
   const seen=[...new Set(F.history().filter(s=>L.rounds.some(r=>r.id===s.courseId)).flatMap(s=>s.checkpoint.studySeen||[]))];
   round.questions.forEach((q,i)=>{const titles=L.lessons.filter(l=>seen.includes(l.id)&&q.sources.includes(l.id)).map(l=>l.title);log.note(i,titles.length?'本轮开始前，本专题页面展示过对应讲解：'+titles.join('；')+'。展示记录不是学会证明。':'本轮开始前没有本专题对应讲解的展示记录；不代表从未学过或没有外部帮助。');});
   log.point({examStarted:true});renderQuestion();focusPanel(panel);
  };
 }
 function answerValue(q){if(q.kind==='choice'){const checked=panel.querySelector('input[name="exam-choice"]:checked');return checked?Number(checked.value):null;}return panel.querySelector('#exam-answer').value.trim();}
 function renderQuestion(){
  const index=log.index;if(index>=round.questions.length){renderReport();return;}const q=round.questions[index],record=log.records[index],draft=record.draft;
  const options=q.kind==='choice'?`<div class="exam-options">${q.options.map((text,i)=>`<label><input type="radio" name="exam-choice" value="${i}" ${draft.choice===i?'checked':''}><span>${String.fromCharCode(65+i)}. ${esc(text)}</span></label>`).join('')}</div>`:q.kind==='open'?`<label class="reason-label" for="exam-answer">先留自己的回答；可以使用键盘语音输入。</label><textarea id="exam-answer" maxlength="1000" rows="4">${esc(draft.answer||'')}</textarea>`:`<label class="reason-label" for="exam-answer">${q.kind==='fraction'?'分数用 / 输入，例如3/2。':q.kind==='character'?'填一个汉字；手写准确性需要另看纸笔。':'填数字，单位已在输入框旁。'}</label><div class="answer-input"><input id="exam-answer" type="text" inputmode="${q.kind==='number'?'decimal':'text'}" maxlength="60" autocomplete="off" value="${esc(draft.answer||'')}"><span>${esc(q.unit||'')}</span></div>`;
  const table=q.table?`<table><thead><tr>${q.table[0].map(cell=>`<th scope="col">${esc(cell)}</th>`).join('')}</tr></thead><tbody>${q.table.slice(1).map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'';
  panel.innerHTML=`<section class="exam-card"><div class="exam-progress"><span>${esc(round.label)} · 第 ${index+1} / 5 题</span><button class="text-button" id="exam-to-study">回看讲解（会记录）</button></div><h2>${esc(q.title)}</h2><p class="exam-context">${esc(q.context)}</p>${table}<p class="exam-task">${esc(q.task)}</p>${options}<label class="reason-label" for="exam-reason">${q.kind==='open'?'补充说明（可选）':'留一句自己的理由（可选，可写算式或语音输入）'}</label><textarea id="exam-reason" maxlength="500" rows="2">${esc(draft.reason||'')}</textarea><details class="exam-help"><summary>需要一点提示（会记录）</summary><p>${esc(q.hint)}</p></details><p class="small-note">想不出也能先记下来；“暂时不会”会保留为首答，不会被后来的订正覆盖。答案与参考暂不显示。</p><p id="exam-message" class="exam-message" role="status"></p><div class="exam-actions"><button class="secondary" id="unsure-answer">暂时不会，记下再继续</button><button class="primary" id="commit-answer">${index===4?'交卷，查看反馈':'保留本题，下一题'}</button></div></section>`;
  const reason=panel.querySelector('#exam-reason');
  function saveDraft(){const value=answerValue(q),fields={reason:reason.value};if(q.kind==='choice')fields.choice=value===null?-1:value;else fields.answer=value;log.draft(index,fields);}
  panel.querySelectorAll('input,textarea').forEach(field=>field.addEventListener(field.type==='radio'?'change':'input',saveDraft));
  panel.querySelector('.exam-help').addEventListener('toggle',event=>{if(event.target.open)log.help(index,'本题短提示');});
  panel.querySelector('#exam-to-study').onclick=()=>{saveDraft();setMode('study');renderLesson(L.lessons.findIndex(l=>l.id===q.sources[0]),true);};
  function commit(unsure){
   const value=answerValue(q);if(!unsure&&(value===null||value==='')){panel.querySelector('#exam-message').textContent='先选一个答案或留一句话；也可以用“暂时不会”保留这次尝试。';return;}
   const answer=unsure?'暂时不会':q.kind==='choice'?`${String.fromCharCode(65+value)}. ${q.options[value]}`:String(value),result=unsure?q.kind==='open'?null:false:L.grade(q,value);
   log.submit(index,answer,result,reason.value);log.finish(index);log.point({mode:index===4?'report':'exam'});renderQuestion();focusPanel(panel);
  }
  panel.querySelector('#commit-answer').onclick=()=>commit(false);panel.querySelector('#unsure-answer').onclick=()=>commit(true);
 }
 function renderReport(){
  log.point({mode:'report'});
  const objective=log.records.filter(r=>r.first?.correct!==null),right=objective.filter(r=>r.first?.correct).length,open=log.records.filter(r=>r.first?.correct===null).length;
  round.questions.forEach((q,i)=>log.help(i,'交卷后查看参考'));
  panel.innerHTML=`<section class="round-report"><p class="eyebrow">${esc(round.label)} · 本轮已交卷</p><h2>先看哪里卡住，再看怎么修。</h2><div class="round-summary"><span>客观题首答 ${right} / ${objective.length}</span><span>${open}题开放表达，待对照</span><span>5份首答已保留</span></div><p class="small-note">这是讲解后的当次表现，不等于长期掌握。客观题只核对结果；理由是否成立，还要结合原话。以下“订正”不会覆盖首答。</p>${round.questions.map((q,i)=>{const r=log.records[i],last=r.attempts[r.attempts.length-1];return `<section class="answer-review"><h3>${i+1}. ${esc(q.title)}</h3><span class="review-label ${r.first.correct===false?'needs':''}">${r.first.correct===null?'开放表达 · 不自动判分':r.first.correct?'首答结果正确':'首答需再核对'}</span><p><b>首次答案：</b>${esc(r.first.answer)}</p>${r.first.explanation?`<p><b>首次理由：</b>${esc(r.first.explanation)}</p>`:''}<p class="small-note">答前回看：${r.first.helped?'有，请在过程记录里查看':'未打开本题帮助；前置讲解另有记录'}</p><div class="reference"><p><b>对照方法：</b>${esc(q.reference)}</p><ul>${q.checks.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div>${r.attempts.length>1?`<p><b>最近订正：</b>${esc(last.answer)}</p>${last.explanation?`<p><b>订正理由：</b>${esc(last.explanation)}</p>`:''}`:''}<details class="correction" data-correction="${i}"><summary>我想订正，留住新答案和理由</summary><label class="reason-label" for="correction-answer-${i}">订正后的答案</label><textarea id="correction-answer-${i}" maxlength="1000" rows="2">${esc(r.draft.correctionAnswer||'')}</textarea><label class="reason-label" for="correction-reason-${i}">哪里改变了？一句话即可。</label><textarea id="correction-reason-${i}" maxlength="500" rows="2">${esc(r.draft.correctionReason||'')}</textarea><button class="secondary" data-save-correction="${i}">留住这次订正</button><p class="small-note" role="status"></p></details></section>`;}).join('')}<div class="exam-actions"><a class="secondary" href="${round.id==='repair'?L.rounds[1].route:L.rounds[0].route}">${round.id==='repair'?'另一轮5题，可以下次再做 →':'回到第一轮 →'}</a><a class="secondary" href="records.html">查看学习记录与导出 →</a></div><details class="report-evidence"><summary>完整过程记录（方便截图）</summary><div id="round-evidence">${log.html()}</div></details></section>`;
  panel.querySelectorAll('[data-correction]').forEach(details=>{const i=Number(details.dataset.correction),a=details.querySelector('textarea'),b=details.querySelectorAll('textarea')[1];for(const el of [a,b])el.oninput=()=>log.draft(i,{correctionAnswer:a.value,correctionReason:b.value});details.querySelector('button').onclick=()=>{if(!a.value.trim()){details.querySelector('[role=status]').textContent='先留一个新答案，原来的首答会保留。';return;}log.reopen(i);log.help(i,'订正前已看参考');log.submit(i,a.value,null,b.value);log.finish(i,'对照参考后订正，未再作独立验证');renderReport();};});
 }
 function showExam(focus=false){setMode('exam');if(log.records.every(r=>r.done))renderReport();else if(log.checkpoint.examStarted)renderQuestion();else renderWelcome();if(focus)focusPanel(panel);}
 document.querySelector('#study-tab').onclick=showStudy;document.querySelector('#exam-tab').onclick=()=>showExam(true);window.addEventListener('pagehide',stopModel);
 if(['exam','report'].includes(log.checkpoint.mode))showExam();else showStudy();
})();
