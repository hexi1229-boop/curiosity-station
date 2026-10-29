'use strict';
(function(){
 const L=RepairLesson,F=LearningFeedback,esc=F.esc;
 for(const round of L.rounds)if(!F.courses.some(c=>c[0]===round.id))F.courses.unshift([round.id,round.title,round.route]);
 const params=new URLSearchParams(location.search),roundKey=params.get('round')||'1',round=L.rounds.find((r,i)=>(r.key||String(i+1))===roundKey||r.id===roundKey)||L.rounds[0];
 function route(r,key,value){return 'repair.html?round='+encodeURIComponent(r.key||String(L.rounds.indexOf(r)+1))+(key?'&'+key+'='+encodeURIComponent(value):'');}
 function related(id){return L.rounds.filter(r=>r.kind!=='exam').flatMap(r=>r.questions.map((q,i)=>({r,q,i}))).filter(x=>x.q.sources.includes(id));}
 function label(r){return r.label||r.title;}
 function renderHub(){
  const hub=document.querySelector('#repair-hub'),history=F.history(),latest=L.rounds.map(r=>({r,s:history.find(s=>s.courseId===r.id)}));
  const recent=latest.filter(x=>x.s).sort((a,b)=>b.s.updatedAt-a.s.updatedAt)[0],assessments=latest.filter(x=>x.r.kind==='exam');
  hub.hidden=false;
  hub.innerHTML=`<div class="repair-hub-heading"><h2>今天想弄懂哪一点？</h2><p>看讲解或直接练都可以；同一道练习的首答只保留一份，回来能接着做。</p>${recent?`<a class="repair-resume" href="${route(recent.r,'resume','1')}">继续上次 · ${esc(label(recent.r))} →</a>`:''}</div>${assessments.map(({r,s})=>{const done=s?.records.filter(record=>record.done).length||0,status=s?.records.every(record=>record.done)?'已交卷 · 查看首答与订正':done?`已完成 ${done} / ${r.questions.length} 题 · 继续`:'约15分钟 · 6题 · 先考后看';return `<article class="repair-assessment"><div><p class="eyebrow">近期强化考试</p><h3>${esc(r.title.replace(/^近期数学强化考试①：/,''))}</h3><p>换算式、换信息呈现、换真实情境，检查方法能不能独立再用。整卷交卷后再显示参考。</p></div><a class="primary" href="${esc(r.route)}">${esc(status)} →</a></article>`;}).join('')}${['数学','英语','语文'].map(subject=>`<section class="repair-subject"><h3>${subject}</h3><div class="repair-topic-grid">${L.lessons.filter(l=>l.subject===subject).map(l=>{const links=related(l.id);return `<article class="repair-topic"><h4>${esc(l.title)}</h4><p>${esc(l.focus)}</p><a class="repair-study-link" href="${route(links[0].r,'lesson',l.id)}">看讲解 →</a><div class="repair-practice-links"><span>对应变式</span>${links.map(({r,q,i})=>{const record=latest.find(x=>x.r===r)?.s?.records[i],current=record?.title===q.title&&record.context===[q.context,q.source,q.task].filter(Boolean).join(' '),status=current&&record.done?'已作答 · 看反馈':current&&(record.draft?.answer||Number.isInteger(record.draft?.choice)&&record.draft.choice>=0)?'有草稿 · 继续':'练一练';return `<a href="${route(r,'practice',q.id)}"><b>${esc(q.title)}</b><small>${status} ↗</small></a>`;}).join('')}</div></article>`;}).join('')}</div></section>`).join('')}<p class="small-note">关联到多个知识点的同一道题只记一次。已有首答、提示、订正与草稿仍在<a href="records.html">学习记录</a>里；这里的已作答不等于已经掌握。</p>`;
 }
 if(!params.has('round')&&!params.has('lesson')&&!params.has('practice')&&!params.has('resume')){renderHub();return;}
 document.querySelector('#repair-workspace').hidden=false;
 if(round.kind==='exam'){document.querySelector('#study-tab').textContent='相关讲解';document.querySelector('#exam-tab').textContent='强化考试';}
 let log=F.create(round.title,round.questions),timer=null;
 let practiceIndex=round.questions.findIndex(q=>q.id===params.get('practice'));
 if(practiceIndex<0)practiceIndex=Number.isInteger(log.checkpoint.practiceIndex)&&log.checkpoint.practiceIndex>=0&&log.checkpoint.practiceIndex<round.questions.length?log.checkpoint.practiceIndex:null;
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
 document.body.insertAdjacentHTML('beforeend','<aside id="repair-reading-note" role="dialog" aria-modal="false" aria-labelledby="reading-note-title" aria-describedby="reading-note-text" tabindex="-1" hidden><div class="reading-note-heading"><span>词句小注 · 本站释义</span><button type="button" id="close-reading-note" aria-label="收起词句注释">收起 ×</button></div><h3 id="reading-note-title"></h3><p id="reading-note-text"></p><small>点正文空白处，或继续滚动，也会收起。</small></aside>');
 const readingNote=document.querySelector('#repair-reading-note');let wordButton=null;
 function closeReadingNote(restoreFocus=false){const previous=wordButton;readingNote.hidden=true;if(previous)previous.setAttribute('aria-expanded','false');wordButton=null;if(restoreFocus&&previous)previous.focus({preventScroll:true});}
 function placeReadingNote(){
  const r=wordButton.getBoundingClientRect(),v=window.visualViewport,left=v?v.offsetLeft:0,top=v?v.offsetTop:0,width=v?v.width:window.innerWidth,height=v?v.height:window.innerHeight;
  readingNote.style.maxWidth=(width-24)+'px';readingNote.style.maxHeight=(height-24)+'px';const h=readingNote.offsetHeight;
  readingNote.style.left=Math.max(left+12,Math.min(r.left,left+width-readingNote.offsetWidth-12))+'px';
  readingNote.style.top=Math.max(top+12,Math.min(r.bottom+8+h<=top+height-12?r.bottom+8:r.top-h-8,top+height-h-12))+'px';
 }
 function addReadingNotes(){
  const readings=article.querySelector('.local-readings');if(!readings)return;
  readings.querySelector('p').insertAdjacentHTML('afterend','<p class="annotation-invitation">有点线的词句可以点开看小注；读得顺，就直接往下读。</p>');
  readings.querySelector('.repair-sources').insertAdjacentHTML('beforeend','<p>点读小注为本站结合上下文写的简短释义，不改动正文。读音核对：<a href="https://zdic.net/hans/绷" target="_blank" rel="noopener">绷</a>、<a href="https://zdic.net/hans/揳" target="_blank" rel="noopener">揳</a>、<a href="https://zdic.net/hans/魁梧" target="_blank" rel="noopener">魁梧</a>、<a href="https://zdic.net/hans/黧" target="_blank" rel="noopener">黧</a>、<a href="https://www.zdic.net/hans/畢畢剝剝" target="_blank" rel="noopener">毕毕剥剥</a>。小注随页面保存在本地，不用跳转查词。</p>');
  readings.querySelectorAll('.local-reading').forEach(reading=>{
   reading.querySelectorAll('.reading-prose p').forEach((p,i)=>{p.innerHTML=L.readingTokens(p.textContent,reading.id,i+1).map(token=>token.note===undefined?esc(token.text):`<button type="button" class="annotated-word" data-reading="${reading.id}" data-reading-note="${token.note}" aria-haspopup="dialog" aria-expanded="false" aria-controls="repair-reading-note">${esc(token.text)}</button>`).join('');});
   reading.addEventListener('toggle',()=>{if(!reading.open&&wordButton&&reading.contains(wordButton))closeReadingNote();});
  });
  readings.querySelectorAll('[data-reading-note]').forEach(button=>button.onclick=()=>{
   if(wordButton===button){closeReadingNote();return;}
   closeReadingNote();wordButton=button;const note=L.readingNotes[button.dataset.reading][Number(button.dataset.readingNote)],title=button.closest('.local-reading').querySelector('summary span').textContent;
   document.querySelector('#reading-note-title').textContent=note.text;document.querySelector('#reading-note-text').textContent=note.note;
   readingNote.hidden=false;button.setAttribute('aria-expanded','true');placeReadingNote();readingNote.focus({preventScroll:true});
   round.questions.forEach((q,i)=>{if(q.sources.includes('sequence'))log.note(i,'点读'+title+'：'+note.text+'（阅读支持，不计作答提示，不代表已经理解）。');});
  });
 }
 document.querySelector('#close-reading-note').onclick=()=>closeReadingNote(true);
 document.addEventListener('pointerdown',event=>{if(wordButton&&!readingNote.contains(event.target)&&!event.target.closest('[data-reading-note]'))closeReadingNote();});
 document.addEventListener('keydown',event=>{if(wordButton&&event.key==='Escape'){event.preventDefault();closeReadingNote(true);}});
 document.addEventListener('focusin',event=>{if(wordButton&&!readingNote.contains(event.target)&&event.target!==wordButton)closeReadingNote();});
 window.addEventListener('scroll',()=>closeReadingNote(),{passive:true});window.addEventListener('resize',()=>closeReadingNote());
 if(window.visualViewport){window.visualViewport.addEventListener('scroll',()=>closeReadingNote());window.visualViewport.addEventListener('resize',()=>closeReadingNote());}
 document.title='错题修复站 · TY敏捷课堂';
 function stopModel(){if(timer!==null){clearInterval(timer);timer=null;}}
 function setMode(mode){stopModel();closeReadingNote();study.hidden=mode!=='study';exam.hidden=mode==='study';document.querySelector('#study-tab').setAttribute('aria-pressed',String(mode==='study'));document.querySelector('#exam-tab').setAttribute('aria-pressed',String(mode!=='study'));log.point({mode});}
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
  stopModel();closeReadingNote();index=Math.max(0,Math.min(L.lessons.length-1,index));const item=L.lessons[index];
  if(log.checkpoint.examStarted)round.questions.forEach((q,i)=>{const record=log.records[i],started=practiceIndex===null||record.notes.some(n=>n.startsWith('本题开始前'));if(started&&q.sources.includes(item.id)&&!record.done)log.help(i,'答题中回看讲解：'+item.title);});
  const seen=[...new Set([...(log.checkpoint.studySeen||[]),item.id])];log.point({lessonIndex:index,studySeen:seen});
  document.querySelector('#lesson-list').innerHTML=L.lessons.map((l,i)=>`<button data-lesson="${i}" aria-current="${i===index}"><span>${i+1} · ${esc(l.subject)}</span>${esc(l.title)}</button>`).join('');
  document.querySelectorAll('[data-lesson]').forEach(button=>button.onclick=()=>renderLesson(Number(button.dataset.lesson),true));
  article.innerHTML=`<p class="eyebrow">讲解 ${index+1} / ${L.lessons.length} · ${esc(item.subject)}</p><h2>${esc(item.title)}</h2><p class="focus-line">${esc(item.focus)}</p><div class="source-question"><small>原题要解决的问题</small>${esc(item.source)}</div>${item.body}<p class="takeaway"><b>带走这一点：</b>${esc(item.takeaway)}</p>`;
  article.querySelector('.focus-line').insertAdjacentHTML('afterend',`<div class="lesson-practice-links"><span>想检验一下？</span>${related(item.id).map(({r,q})=>`<a href="${route(r,'practice',q.id)}">${esc(q.title)} →</a>`).join('')}</div>`);
  addReadingNotes();
  article.querySelectorAll('[data-close-reading]').forEach(button=>button.onclick=()=>{
   const reading=button.closest('details'),summary=reading.querySelector('summary');reading.open=false;summary.focus({preventScroll:true});summary.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  const previous=document.querySelector('#previous-lesson'),next=document.querySelector('#next-lesson');previous.disabled=index===0;previous.onclick=()=>renderLesson(index-1,true);next.textContent=index===L.lessons.length-1?'选择对应练习':'下一个讲解';next.onclick=()=>index===L.lessons.length-1?choosePractice():renderLesson(index+1,true);
  renderModel();if(focus)focusPanel(article);
 }
 function showStudy(){setMode('study');renderLesson(Number.isInteger(log.checkpoint.lessonIndex)?log.checkpoint.lessonIndex:0);}
 function renderWelcome(){
  if(round.kind==='exam'){
   const finished=log.records.filter(record=>record.done).length;
   panel.innerHTML=`<section class="exam-welcome assessment-welcome"><p class="eyebrow">${esc(round.label)} · 约15分钟 · ${round.questions.length}题</p><h2>先自己做完，再一起看哪里卡住。</h2><p>最近三道作业只看到了订正结果，不能据此猜出第一次为什么错。这份卷不抄原题：分别换模型、算法和情境，检查方法能不能独立再用。</p><ul><li>不看讲解；需要提示可以打开，系统会如实记录。</li><li>带“关键依据”的题，用一行算式或一句话说明。</li><li>整卷交卷后才显示答案；首答不会被订正覆盖。</li></ul><button class="primary" id="start-assessment">${finished?'继续考试 · 已完成 '+finished+' / '+round.questions.length:'开始考试'}</button><a class="secondary" href="repair.html">先回修复站</a></section>`;
   panel.querySelector('#start-assessment').onclick=()=>{practiceIndex=null;log.point({examStarted:true,mode:'exam'});renderQuestion();focusPanel(panel);};return;
  }
  const lesson=L.lessons[Number.isInteger(log.checkpoint.lessonIndex)?log.checkpoint.lessonIndex:0];
  panel.innerHTML=`<section class="exam-welcome"><p class="eyebrow">按需练习</p><h2>选一道，看看能不能自己用。</h2><p>对应讲解：${esc(lesson.title)}</p><div class="lesson-practice-links">${related(lesson.id).map(({r,q})=>`<a href="${route(r,'practice',q.id)}">${esc(q.title)} →</a>`).join('')}</div><p class="small-note">首答提交后再看这道题的参考。做完可以停下，不会要求做完一整组。原有题目和记录都保留。</p><a class="secondary" href="repair.html">查看其他薄弱点</a></section>`;
 }
 function choosePractice(){setMode('exam');if(round.kind==='exam'&&log.checkpoint.examStarted)renderQuestion();else renderWelcome();focusPanel(panel);}
 function noteTeaching(index){
  const q=round.questions[index],seen=[...new Set(F.history().filter(s=>L.rounds.some(r=>r.id===s.courseId)).flatMap(s=>s.checkpoint.studySeen||[]))],titles=L.lessons.filter(l=>seen.includes(l.id)&&q.sources.includes(l.id)).map(l=>l.title);
  if(!log.records[index].first&&!log.records[index].notes.some(n=>n.startsWith('本题开始前')))log.note(index,titles.length?'本题开始前，本专题页面展示过对应讲解：'+titles.join('；')+'。展示记录不是学会证明。':'本题开始前没有本专题对应讲解的展示记录；不代表从未学过或没有外部帮助。');
 }
 function answerValue(q){if(q.kind==='choice'){const checked=panel.querySelector('input[name="exam-choice"]:checked');return checked?Number(checked.value):null;}return panel.querySelector('#exam-answer').value.trim();}
 function renderQuestion(){
  const index=practiceIndex===null?log.index:practiceIndex;if(index>=round.questions.length){renderReport();return;}if(practiceIndex!==null)log.point({practiceIndex,lessonIndex:L.lessons.findIndex(l=>l.id===round.questions[index].sources[0])});if(log.records[index].done){renderReport(index);return;}noteTeaching(index);log.point({examStarted:true,practiceIndex,mode:'exam'});const q=round.questions[index],record=log.records[index],draft=record.draft;
  const options=q.kind==='choice'?`<div class="exam-options">${q.options.map((text,i)=>`<label><input type="radio" name="exam-choice" value="${i}" ${draft.choice===i?'checked':''}><span>${String.fromCharCode(65+i)}. ${esc(text)}</span></label>`).join('')}</div>`:q.kind==='open'?`<label class="reason-label" for="exam-answer">先留自己的回答；可以使用键盘语音输入。</label><textarea id="exam-answer" maxlength="1000" rows="4">${esc(draft.answer||'')}</textarea>`:`<label class="reason-label" for="exam-answer">${q.kind==='fraction'?'分数用 / 输入，例如3/2。':q.kind==='character'?'填一个汉字；手写准确性需要另看纸笔。':'填数字，单位已在输入框旁。'}</label><div class="answer-input"><input id="exam-answer" type="text" inputmode="${q.kind==='number'?'decimal':'text'}" maxlength="60" autocomplete="off" value="${esc(draft.answer||'')}"><span>${esc(q.unit||'')}</span></div>`;
  const table=q.table?`<table><thead><tr>${q.table[0].map(cell=>`<th scope="col">${esc(cell)}</th>`).join('')}</tr></thead><tbody>${q.table.slice(1).map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'';
  panel.innerHTML=`<section class="exam-card"><div class="exam-progress"><span>${practiceIndex===null?esc(label(round))+' · 第 '+(index+1)+' / '+round.questions.length+' 题':'本次选择 · 一道变式'}</span><button class="text-button" id="exam-to-study">回看讲解（会记录）</button></div><h2>${esc(q.title)}</h2><p class="exam-context">${esc(q.context)}</p>${table}<p class="exam-task">${esc(q.task)}</p>${options}<label class="reason-label" for="exam-reason">${q.reasonRequired?'关键依据（必填，可写一行算式或使用语音输入）':q.kind==='open'?'补充说明（可选）':'留一句自己的理由（可选，可写算式或语音输入）'}</label><textarea id="exam-reason" maxlength="500" rows="2" ${q.reasonRequired?'required aria-required="true"':''}>${esc(draft.reason||'')}</textarea><details class="exam-help"><summary>需要一点提示（会记录）</summary><p>${esc(q.hint)}</p></details><p class="small-note">想不出也能先记下来；“暂时不会”会保留为首答，不会被后来的订正覆盖。${round.kind==='exam'?'整卷交卷后才显示参考。':'提交后才显示本题参考。'}</p><p id="exam-message" class="exam-message" role="status"></p><div class="exam-actions"><button class="secondary" id="unsure-answer">暂时不会，记下再继续</button><button class="primary" id="commit-answer">${practiceIndex!==null?'保留首答，查看本题反馈':index===round.questions.length-1?'交卷，查看反馈':'保留本题，下一题'}</button></div></section>`;
  const reason=panel.querySelector('#exam-reason');
  function saveDraft(){const value=answerValue(q),fields={reason:reason.value};if(q.kind==='choice')fields.choice=value===null?-1:value;else fields.answer=value;log.draft(index,fields);}
  panel.querySelectorAll('input,textarea').forEach(field=>field.addEventListener(field.type==='radio'?'change':'input',saveDraft));
  panel.querySelector('.exam-help').addEventListener('toggle',event=>{if(event.target.open)log.help(index,'本题短提示');});
  panel.querySelector('#exam-to-study').onclick=()=>{saveDraft();setMode('study');renderLesson(L.lessons.findIndex(l=>l.id===q.sources[0]),true);};
  function commit(unsure){
   const value=answerValue(q);if(!unsure&&(value===null||value==='')){panel.querySelector('#exam-message').textContent='先选一个答案或留一句话；也可以用“暂时不会”保留这次尝试。';return;}if(!unsure&&q.reasonRequired&&!reason.value.trim()){panel.querySelector('#exam-message').textContent='再留一行关键算式或一句理由，才能判断这次是不是自己想通了。';reason.focus();return;}
   const answer=unsure?'暂时不会':q.kind==='choice'?`${String.fromCharCode(65+value)}. ${q.options[value]}`:String(value),result=unsure?q.kind==='open'?null:false:L.grade(q,value);
   log.submit(index,answer,result,reason.value);log.finish(index);log.point({mode:practiceIndex!==null||index===round.questions.length-1?'report':'exam'});if(practiceIndex!==null)renderReport(index);else renderQuestion();focusPanel(panel);
  }
  panel.querySelector('#commit-answer').onclick=()=>commit(false);panel.querySelector('#unsure-answer').onclick=()=>commit(true);
 }
 function renderReport(only=null){
  log.point({mode:'report'});
  const selected=round.questions.map((q,i)=>({q,i})).filter(x=>log.records[x.i].done&&(only===null||x.i===only)),records=selected.map(x=>log.records[x.i]);
  const objective=records.filter(r=>r.first&&r.first.correct!==null),right=objective.filter(r=>r.first?.correct).length,open=records.filter(r=>r.first?.correct===null).length;
  selected.forEach(({i})=>log.help(i,'提交后查看本题参考'));
  panel.innerHTML=`<section class="round-report"><p class="eyebrow">${only===null?esc(label(round))+' · 作答回看':'这道题先收好'}</p><h2>先看哪里卡住，再看怎么修。</h2><div class="round-summary">${objective.length?`<span>客观题首答 ${right} / ${objective.length}</span>`:''}${open?`<span>${open}题开放表达，待对照</span>`:''}<span>${records.length}份首答已保留</span></div><p class="small-note">这是本次作答的表现，不等于长期掌握。客观题只核对结果；理由是否成立，还要结合原话。以下“订正”不会覆盖首答。</p>${selected.map(({q,i})=>{const r=log.records[i],last=r.attempts[r.attempts.length-1];return `<section class="answer-review"><h3>${only===null?(i+1)+'. ':''}${esc(q.title)}</h3><span class="review-label ${r.first.correct===false?'needs':''}">${r.first.correct===null?'开放表达 · 不自动判分':r.first.correct?'首答结果正确':'首答需再核对'}</span><p><b>首次答案：</b>${esc(r.first.answer)}</p>${r.first.explanation?`<p><b>首次理由：</b>${esc(r.first.explanation)}</p>`:''}<p class="small-note">答前回看：${r.first.helped?'有，请在过程记录里查看':'未打开本题帮助；前置讲解另有记录'}</p><div class="reference"><p><b>对照方法：</b>${esc(q.reference)}</p><ul>${q.checks.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div>${r.attempts.length>1?`<p><b>最近订正：</b>${esc(last.answer)}</p>${last.explanation?`<p><b>订正理由：</b>${esc(last.explanation)}</p>`:''}`:''}<details class="correction" data-correction="${i}"><summary>我想订正，留住新答案和理由</summary><label class="reason-label" for="correction-answer-${i}">订正后的答案</label><textarea id="correction-answer-${i}" maxlength="1000" rows="2">${esc(r.draft.correctionAnswer||'')}</textarea><label class="reason-label" for="correction-reason-${i}">哪里改变了？一句话即可。</label><textarea id="correction-reason-${i}" maxlength="500" rows="2">${esc(r.draft.correctionReason||'')}</textarea><button class="secondary" data-save-correction="${i}">留住这次订正</button><p class="small-note" role="status"></p></details></section>`;}).join('')}<div class="exam-actions"><a class="secondary" href="repair.html">这次先到这里，回到修复站 →</a><a class="secondary" href="records.html">查看学习记录与导出 →</a></div><details class="report-evidence"><summary>完整过程记录（方便截图）</summary><div id="round-evidence">${log.html()}</div></details></section>`;
  panel.querySelectorAll('[data-correction]').forEach(details=>{const i=Number(details.dataset.correction),a=details.querySelector('textarea'),b=details.querySelectorAll('textarea')[1];for(const el of [a,b])el.oninput=()=>log.draft(i,{correctionAnswer:a.value,correctionReason:b.value});details.querySelector('button').onclick=()=>{if(!a.value.trim()){details.querySelector('[role=status]').textContent='先留一个新答案，原来的首答会保留。';return;}log.reopen(i);log.help(i,'订正前已看参考');log.submit(i,a.value,null,b.value);log.finish(i,'对照参考后订正，未再作独立验证');renderReport(only);};});
 }
 function showExam(focus=false){setMode('exam');if(practiceIndex!==null)renderQuestion();else if(log.records.every(r=>r.done))renderReport();else if(log.checkpoint.examStarted)renderQuestion();else renderWelcome();if(focus)focusPanel(panel);}
 document.querySelector('#study-tab').onclick=showStudy;document.querySelector('#exam-tab').onclick=choosePractice;window.addEventListener('pagehide',stopModel);
 const lessonIndex=L.lessons.findIndex(l=>l.id===params.get('lesson'));
 if(params.has('practice')&&practiceIndex!==null)showExam();else if(lessonIndex>=0){setMode('study');renderLesson(lessonIndex);}else if(round.kind==='exam'||params.has('exam')||['exam','report'].includes(log.checkpoint.mode))showExam();else showStudy();
})();
