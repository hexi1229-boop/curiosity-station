(function(){
 'use strict';
 const L=CurrentLesson,esc=LearningFeedback.esc,$=id=>document.getElementById(id);
 let log=LearningFeedback.create(L.title,L.tasks);
 let word=Number.isInteger(log.checkpoint.word)&&L.words[log.checkpoint.word]?log.checkpoint.word:0;
 let material=L.materials.some(m=>m.id===log.checkpoint.material)?log.checkpoint.material:'court';
 $('story-text').innerHTML=L.story.map(p=>`<p>${esc(p)}</p>`).join('');
 $('word-buttons').innerHTML=L.words.map((w,i)=>`<button type="button" data-word="${i}" aria-pressed="false">${w.word}<small>${w.sound}</small></button>`).join('');
 $('material-buttons').innerHTML=L.materials.map(m=>`<button type="button" data-material="${m.id}" aria-pressed="false">${m.name}</button>`).join('');
 function drawWord(){
  const w=L.words[word];
  document.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.word)===word)));
  $('word-card').innerHTML=`<blockquote>${esc(w.quote)}</blockquote><p>${esc(w.meaning)}</p><p class="word-effect">${esc(w.choice)}</p><p class="word-another">换个位置读：${esc(w.another)}</p>`;
 }
 function drawMaterial(){
  const m=L.materials.find(m=>m.id===material);
  document.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.material===material)));
  $('material-text').textContent=m.text;$('material-invitation').textContent=m.invitation;
 }
 function drawReport(){
  $('workshop-report').innerHTML=log.active?log.html():'<p class="empty-work">今天可以先读。写下一点后，初稿和修改会出现在这里。</p>';
 }
 function saveDraft(){log.draft(0,{text:$('my-scene').value,reason:$('revision-reason').value,material});$('draft-status').textContent=LearningFeedback.storageError?'本机保存未成功，请先复制或截图保留。':'草稿已自动保存在本机，稍后可以接着写。';drawReport();}
 function rememberMaterial(){const m=L.materials.find(m=>m.id===material);log.note(0,'本次写作材料：'+m.name+'。'+m.text);}
 function commit(){
  const text=$('my-scene').value.trim(),reason=$('revision-reason').value.trim(),r=log.records[0];
  if(!text){$('action-status').textContent='先写下一点自己的文字，再留稿。';$('my-scene').focus();return false;}
  const last=r.attempts[r.attempts.length-1];
  if(!last||text!==last.answer||reason!==last.explanation){rememberMaterial();log.submit(0,text,null,reason);}
  saveDraft();return true;
 }
 function drawWriter(restore=false){
  const r=log.records[0],hasFirst=!!r.first;
  if(restore){$('my-scene').value=r.draft?.text??r.attempts[r.attempts.length-1]?.answer??'';$('revision-reason').value=r.draft?.reason??r.attempts[r.attempts.length-1]?.explanation??'';}
  $('first-draft-panel').innerHTML=hasFirst?`<details class="first-draft"><summary>初稿一直在 · 展开对照</summary><p class="preserved-text">${esc(r.first.answer)}</p></details>`:'';
  $('scene-label').textContent=r.done?'这次收好的片段':hasFirst?'在这里修改你的片段':'你的初稿';
  $('revision-tools').hidden=!hasFirst;
  $('my-scene').readOnly=r.done;$('revision-reason').readOnly=r.done;
  document.querySelectorAll('[data-material]').forEach(b=>b.disabled=r.done);
  $('writing-actions').innerHTML=r.done?'<button type="button" class="primary" id="reopen-work">继续修改这份作品</button><button type="button" class="secondary" id="new-work">另写一篇</button>':hasFirst?'<button type="button" class="primary" id="save-revision">保存这次修改</button><button type="button" class="secondary" id="finish-work">这次先收好作品</button>':'<button type="button" class="primary" id="keep-first">留住初稿，再看看怎样改</button>';
  if(r.done){
   $('reopen-work').onclick=()=>{log.reopen(0);drawWriter();$('action-status').textContent='可以接着改，初稿和以前的修改都保留。';$('my-scene').focus();};
   $('new-work').onclick=()=>{log=LearningFeedback.create(L.title,L.tasks,true);material='court';$('writing-help').open=false;drawMaterial();drawWriter(true);$('draft-status').textContent='这是新的一篇，上一份作品仍在学习记录里。';$('action-status').textContent='换一个场景再试试。';$('my-scene').focus();};
  }else if(hasFirst){
   $('save-revision').onclick=()=>{const before=r.attempts.length;if(commit()){$('action-status').textContent=r.attempts.length===before?'文字和修改说明没有变化，原稿已经留好。':'修改已留好，初稿也一直保留。';drawWriter();}};
   $('finish-work').onclick=()=>{if(!commit())return;log.finish(0,'这次留稿，未判定掌握');drawWriter();$('action-status').textContent='作品已收好。以后回来，还可以继续修改。';};
  }else{
   $('keep-first').onclick=()=>{if(!commit())return;drawWriter();$('action-status').textContent='初稿已留住。下面的修改建议挑一条用就好。';};
  }
  drawReport();
 }
 document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{word=Number(b.dataset.word);log.point({focusWorkshopVersion:2,word});log.note(0,'共读时细看了“'+L.words[word].word+'”的用法（课程示例，不计写作求助）。');drawWord();drawReport();});
 document.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{material=b.dataset.material;log.point({focusWorkshopVersion:2,material});saveDraft();drawMaterial();$('action-status').textContent='已选择素材；写过的文字保留，可以接着改。';});
 $('my-scene').addEventListener('input',saveDraft);$('revision-reason').addEventListener('input',saveDraft);
 $('writing-help').addEventListener('toggle',()=>{if($('writing-help').open){log.help(0,'写作卡住时的小提示');drawReport();}});
 drawWord();drawMaterial();drawWriter(true);
 if(log.active)$('draft-status').textContent=log.records[0].done?'已恢复这次作品，可继续修改或另写一篇。':'已恢复本机草稿，可以接着写。';
})();
