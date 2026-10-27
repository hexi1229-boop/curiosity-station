(function(){
 'use strict';
 const L=ReadalongLesson,F=LearningFeedback,esc=F.esc,$=id=>document.getElementById(id);
 // The new route may open while a previous offline registry is still active.
 if(!F.courses.some(c=>c[0]===L.id))F.courses.unshift([L.id,L.title,L.id+'.html']);
 let log=F.create(L.title,L.tasks),motion=0;
 $('article-text').innerHTML=L.paragraphs.map((p,i)=>{
  let html='',cursor=0;
  L.annotations.forEach((a,k)=>{if(a.paragraph!==i+1)return;const at=p.indexOf(a.text,cursor);if(at<0)return;html+=esc(p.slice(cursor,at))+`<button type="button" class="annotated-word" data-annotation="${k}" aria-haspopup="dialog" aria-expanded="false" aria-controls="reading-annotation">${esc(a.text)}</button>`;cursor=at+a.text.length;});
  return `${i===9?'<div class="reading-part-break">百草园先读到这里。今天也可以先停下，下次接着读三味书屋。</div>':''}<p id="paragraph-${i+1}" data-paragraph="${i+1}"><span class="paragraph-number" aria-hidden="true">${i+1}</span>${html+esc(p.slice(cursor))}</p>`;
 }).join('');
 $('word-list').innerHTML=L.words.map(([w,s])=>`<div><dt>${esc(w)}</dt><dd>${esc(s)}</dd></div>`).join('');
 $('motion-quote').textContent=L.quotes[0].text;
 $('motion-buttons').innerHTML=L.motions.map((m,i)=>`<button type="button" data-motion="${i}" aria-pressed="${i===0}">${m.word}</button>`).join('');
 function drawMotion(){const m=L.motions[motion];$('motion-comment').innerHTML=`<strong>${esc(m.quote)}</strong><br>${esc(m.comment)}`;document.querySelectorAll('[data-motion]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.motion)===motion)));}
 function drawReport(){$('reading-report').innerHTML=log.active?(F.readalongs?.[L.id]?log.html():`<p class="empty-work">${F.storageError?'本机保存未成功，请先截图保留。':'阅读轨迹已自动保存在本机；本机正在更新记录显示，稍后可继续回看。'}</p>`):'<p class="empty-work">这里可以先空着。阅读的位置、挑出的句子和便笺，会在你使用时自动留下。</p>';}
 const annotation=$('reading-annotation');let wordButton=null;
 function closeAnnotation(restoreFocus=false){const previous=wordButton;annotation.hidden=true;if(previous)previous.setAttribute('aria-expanded','false');wordButton=null;if(restoreFocus&&previous)previous.focus({preventScroll:true});}
 function placeAnnotation(){
  const r=wordButton.getBoundingClientRect(),v=window.visualViewport,left=v?v.offsetLeft:0,top=v?v.offsetTop:0,width=v?v.width:window.innerWidth,height=v?v.height:window.innerHeight;
  annotation.style.maxWidth=(width-24)+'px';annotation.style.maxHeight=(height-24)+'px';const h=annotation.offsetHeight;
  annotation.style.left=Math.max(left+12,Math.min(r.left,left+width-annotation.offsetWidth-12))+'px';
  annotation.style.top=Math.max(top+12,Math.min(r.bottom+8+h<=top+height-12?r.bottom+8:r.top-h-8,top+height-h-12))+'px';
 }
 document.querySelectorAll('[data-annotation]').forEach(b=>b.onclick=()=>{
  if(wordButton===b){closeAnnotation();return;}
  closeAnnotation();wordButton=b;const a=L.annotations[Number(b.dataset.annotation)];
  $('annotation-title').textContent=a.text;$('annotation-text').textContent=a.note;annotation.hidden=false;b.setAttribute('aria-expanded','true');placeAnnotation();annotation.focus({preventScroll:true});
  log.note(0,'点读词句：'+a.text+'（阅读支持，不计作答求助，不代表已经理解）。');drawReport();
 });
 $('close-annotation').onclick=()=>closeAnnotation(true);
 document.addEventListener('pointerdown',e=>{if(wordButton&&!annotation.contains(e.target)&&!e.target.closest('[data-annotation]'))closeAnnotation();});
 document.addEventListener('keydown',e=>{if(wordButton&&e.key==='Escape'){e.preventDefault();closeAnnotation(true);}});
 document.addEventListener('focusin',e=>{if(wordButton&&!annotation.contains(e.target)&&e.target!==wordButton)closeAnnotation();});
 window.addEventListener('scroll',()=>closeAnnotation(),{passive:true});window.addEventListener('resize',()=>closeAnnotation());
 if(window.visualViewport){window.visualViewport.addEventListener('resize',()=>closeAnnotation());window.visualViewport.addEventListener('scroll',()=>closeAnnotation());}
 function drawQuoteChoices(){document.querySelectorAll('[data-keep]').forEach(b=>{const kept=$('kept-quote').value.trim()===L.quotes[Number(b.dataset.keep)].text;b.textContent=kept?'这句已带走 ✓':'把这句带走 ↗';b.setAttribute('aria-pressed',String(kept));});}
 function drawResume(){const p=L.paragraph(log.records[0].draft?.$paragraph),link=$('resume-reading');link.hidden=!p;if(p){link.href='#paragraph-'+p;link.textContent='从上次停留的第'+p+'段继续读 →';}}
 function draft(){log.draft(0,{quote:$('kept-quote').value,note:$('reading-note').value});$('note-status').textContent=F.storageError?'本机保存未成功，请复制或截图保留。':'便笺已自动保存在本机，下次可以接着读。';drawQuoteChoices();drawReport();}
 function commit(){
  const answer=L.compose($('kept-quote').value,$('reading-note').value),r=log.records[0],last=r.attempts[r.attempts.length-1];
  if(answer&&answer!==last?.answer)log.submit(0,answer,null,$('reading-note').value);
  draft();return !!answer;
 }
 function drawNote(restore=false){
  const r=log.records[0];if(restore){$('kept-quote').value=r.draft?.quote||'';$('reading-note').value=r.draft?.note||'';}
  $('kept-quote').readOnly=r.done;$('reading-note').readOnly=r.done;
  document.querySelectorAll('[data-keep]').forEach(b=>b.disabled=r.done);
  $('note-version-actions').innerHTML=r.done?'':'<button type="button" class="secondary" id="keep-note">留住这版交流便笺</button>';
  $('note-actions').innerHTML=r.done?'<button type="button" class="primary" id="continue-reading">下次接着读</button>':'<button type="button" class="primary" id="close-reading">这次先读到这里</button>';
  if(r.done)$('continue-reading').onclick=()=>{log.reopen(0);drawNote();$('note-action-status').textContent='可以接着读；之前的便笺也会保留。';};
  else{
   $('keep-note').onclick=()=>{const count=r.attempts.length;if(commit())$('note-action-status').textContent=count===r.attempts.length?'这版已经留好，不重复记。':'这版口头交流便笺已留好，之前的版本也会保留。';else $('note-action-status').textContent='便笺可以空着，读过、聊过就好。';drawReport();};
   $('close-reading').onclick=()=>{commit();log.finish(0,'这次先读到这里，未判定理解程度');drawNote();$('note-action-status').textContent='这次先收好。没有写便笺也可以，下次接着读。';};
  }
  drawQuoteChoices();drawReport();drawResume();
 }
 document.querySelectorAll('[data-motion]').forEach(b=>b.onclick=()=>{motion=Number(b.dataset.motion);drawMotion();log.note(0,'共读品词：'+L.motions[motion].word+'（阅读讲解，不计作答求助）。');drawReport();});
 document.querySelectorAll('[data-conversation]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){log.note(0,'打开共读讨论：'+d.dataset.conversation+'（不代表已经理解）。');drawReport();}}));
 $('old-words').addEventListener('toggle',()=>{if($('old-words').open){log.note(0,'查看作者与三个地点的关系（阅读支持，不计作答求助）。');drawReport();}});
 $('try-without').onclick=()=>{const on=$('without-card').hidden;$('without-card').hidden=!on;$('try-without').setAttribute('aria-pressed',String(on));$('try-without').textContent=on?'收起骨架，回到原句':'看一眼句子的骨架';if(on){log.note(0,'查看“不必说……也不必说……单是……”的层次示意（教学提示，原文未改）。');drawReport();}};
 document.querySelectorAll('[data-keep]').forEach(b=>b.onclick=()=>{$('kept-quote').value=L.quotes[Number(b.dataset.keep)].text;draft();log.note(0,'从讨论中带走了一句原文。');drawReport();$('note-action-status').textContent='句子已自动放进家长便笺，孩子不用另写文字。';});
 for(const id of ['kept-quote','reading-note'])$(id).addEventListener('input',draft);
 $('note-help').addEventListener('toggle',()=>{if($('note-help').open){log.help(0,'家长共读提问的小启发');drawReport();}});
 $('action-buttons').innerHTML=L.actions.map((a,i)=>`<button type="button" data-action="${i}" aria-pressed="${i===0}">${esc(a.word)}</button>`).join('');
 function drawAction(i){const a=L.actions[i];$('action-comment').innerHTML=`<strong>${esc(a.quote)}</strong><br>${esc(a.comment)}`;document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.action)===i)));}
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.action);drawAction(i);log.note(0,'慢读动作：'+L.actions[i].word+'（阅读讲解，不计作答求助）。');drawReport();});drawAction(0);
 let pending=false;
 window.addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const p=[...document.querySelectorAll('[data-paragraph]')].find(el=>{const r=el.getBoundingClientRect();return r.top<=150&&r.bottom>150;});if(!p)return;const n=Number(p.dataset.paragraph);if(n!==log.records[0].draft?.$paragraph){log.draft(0,{$paragraph:n});drawResume();drawReport();}});},{passive:true});
 drawMotion();drawNote(true);if(log.active)$('note-status').textContent='已恢复本机阅读记录；翻到某一段不代表已经读懂。';
})();
