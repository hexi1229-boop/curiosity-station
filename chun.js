(function(){
 'use strict';
 const L=ReadalongLesson,F=LearningFeedback,esc=F.esc,$=id=>document.getElementById(id);
 if(!F.courses.some(c=>c[0]===L.id))F.courses.unshift([L.id,L.title,'chun.html']);
 if(F.readalongs&&!F.readalongs[L.id])F.readalongs[L.id]=1;
 const log=F.create(L.title,L.tasks),record=log.records[0];

 function trackOnce(key,text){
  const field='$tracked_'+key;
  if(record.draft?.[field])return;
  log.draft(0,{[field]:true});
  log.note(0,text);
  drawReport();
 }
 function drawReport(){
  $('reading-report').innerHTML=log.active?log.html():'<p class="empty-work">这里可以先空着。打开全文、点词、动手验证或收好阅读时，轨迹才会留在本机。</p>';
 }

 $('word-list').innerHTML=L.wordGroups.map((group,index)=>`<details class="companion-group" data-word-group="${index}"><summary>${esc(group.label)} · ${group.words.map(w=>esc(w[0])).join('、')}</summary><dl>${group.words.map(([word,note])=>`<div><dt>${esc(word)}</dt><dd>${esc(note)}</dd></div>`).join('')}</dl></details>`).join('');
 $('article-text').innerHTML=L.paragraphs.map((paragraph,index)=>{
  let html='',cursor=0;
  L.annotations.forEach((annotation,annotationIndex)=>{
   if(annotation.paragraph!==index+1)return;
   const at=paragraph.indexOf(annotation.text,cursor);
   if(at<0)return;
   html+=esc(paragraph.slice(cursor,at))+`<button type="button" class="annotated-word" data-annotation="${annotationIndex}" aria-haspopup="dialog" aria-expanded="false" aria-controls="reading-annotation">${esc(annotation.text)}</button>`;
   cursor=at+annotation.text.length;
  });
  return `<p id="paragraph-${index+1}" data-paragraph="${index+1}"><span class="paragraph-number" aria-hidden="true">${index+1}</span>${html+esc(paragraph.slice(cursor))}</p>`;
 }).join('');

 const annotationBox=$('reading-annotation');let annotationButton=null,annotationOpenedAt=0;
 function closeAnnotation(restoreFocus=false){const previous=annotationButton;annotationBox.hidden=true;if(previous)previous.setAttribute('aria-expanded','false');annotationButton=null;if(restoreFocus&&previous)previous.focus({preventScroll:true});}
 function placeAnnotation(){
  const r=annotationButton.getBoundingClientRect(),v=window.visualViewport,left=v?v.offsetLeft:0,top=v?v.offsetTop:0,width=v?v.width:window.innerWidth,height=v?v.height:window.innerHeight;
  annotationBox.style.maxWidth=(width-24)+'px';annotationBox.style.maxHeight=(height-24)+'px';const h=annotationBox.offsetHeight;
  annotationBox.style.left=Math.max(left+12,Math.min(r.left,left+width-annotationBox.offsetWidth-12))+'px';
  annotationBox.style.top=Math.max(top+12,Math.min(r.bottom+8+h<=top+height-12?r.bottom+8:r.top-h-8,top+height-h-12))+'px';
 }
 document.querySelectorAll('[data-annotation]').forEach(button=>button.onclick=()=>{
  if(annotationButton===button){closeAnnotation();return;}
  closeAnnotation();annotationButton=button;annotationOpenedAt=performance.now();const annotation=L.annotations[Number(button.dataset.annotation)];
  $('annotation-title').textContent=annotation.text;$('annotation-text').textContent=annotation.note;annotationBox.hidden=false;button.setAttribute('aria-expanded','true');placeAnnotation();annotationBox.focus({preventScroll:true});
  trackOnce('annotation_'+button.dataset.annotation,'点读词句：'+annotation.text+'（阅读支持，不计作答求助，不代表已经理解）。');
 });
 $('close-annotation').onclick=()=>closeAnnotation(true);
 document.addEventListener('pointerdown',event=>{if(annotationButton&&!annotationBox.contains(event.target)&&!event.target.closest('[data-annotation]'))closeAnnotation();});
 document.addEventListener('keydown',event=>{if(annotationButton&&event.key==='Escape'){event.preventDefault();closeAnnotation(true);}});
 document.addEventListener('focusin',event=>{if(annotationButton&&!annotationBox.contains(event.target)&&event.target!==annotationButton)closeAnnotation();});
 const closeForViewport=()=>closeAnnotation(annotationBox.contains(document.activeElement));
 const closeAfterIntentionalScroll=()=>{if(annotationButton&&performance.now()-annotationOpenedAt>250)closeForViewport();};
 window.addEventListener('scroll',closeAfterIntentionalScroll,{passive:true});window.addEventListener('resize',closeForViewport);
 if(window.visualViewport){window.visualViewport.addEventListener('resize',closeForViewport);window.visualViewport.addEventListener('scroll',closeAfterIntentionalScroll);}

 document.querySelectorAll('[data-word-group]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)trackOnce('words_'+details.dataset.wordGroup,'查看第'+L.wordGroups[Number(details.dataset.wordGroup)].label.replace('第','')+'的语境词义（阅读支持，不计作答求助）。');}));
 $('pep-full-text').addEventListener('click',()=>trackOnce('open_full_text','打开人教社《春》页面核对版本（打开链接不等于已经读完）。'));
 function drawReadState(){const confirmed=!!record.draft?.$readConfirmed;$('mark-read').textContent=confirmed?'已确认读到结尾 ✓':'我读到结尾了，继续细读';$('mark-read').disabled=confirmed;$('read-status').textContent=confirmed?'已记下你的确认；这只代表本次读到结尾，不代表已经理解或记住。':'是否读完由你自己确认，页面不会把滚动或点击当作读懂。';}
 $('mark-read').onclick=()=>{if(record.draft?.$readConfirmed)return;log.draft(0,{$readConfirmed:true});log.note(0,'孩子主动确认本次读到文章结尾；页面未验证实际阅读或理解。');drawReadState();drawReport();};

 function drawMotion(mode,animate=false){
  const process=mode==='process',stage=$('sprout-stage');
  if(animate){stage.dataset.mode='';void stage.offsetWidth;}
  stage.dataset.mode=mode;
  document.querySelectorAll('[data-motion]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.motion===mode)));
  $('motion-line').textContent=process?'小草偷偷地从土里钻出来。':'小草从土里长出来。';
  $('motion-comment').innerHTML=process?'<strong>“钻”把动作写得更具体。</strong><br>方向从土下向上，动作里还带着突破泥土的力量。':'“长出来”已经写出小草生长、出现的过程；动作方式和阻力还没有展开。';
 }
 document.querySelectorAll('[data-motion]').forEach(button=>button.onclick=()=>{const mode=button.dataset.motion;drawMotion(mode,true);log.draft(0,{$motionMode:mode});trackOnce('motion','切换“长／钻”小草动画，观察动作方式与力量的区别。');});

 $('sense-buttons').innerHTML=L.senses.map((sense,index)=>`<button type="button" data-sense="${index}" aria-controls="sense-scene" aria-pressed="${index===0}">${esc(sense.name)}</button>`).join('');
 function drawSense(index){const sense=L.senses[index];$('sense-icon').textContent=sense.icon;$('sense-title').textContent=sense.title;$('sense-text').textContent=sense.text;document.querySelectorAll('[data-sense]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.sense)===index)));}
 document.querySelectorAll('[data-sense]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.sense);drawSense(index);log.draft(0,{$sense:index});trackOnce('sense_'+index,'用“'+L.senses[index].name+'”感官线索读看不见的春风。');});
 document.querySelectorAll('[data-conversation]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)trackOnce('conversation_'+details.dataset.conversation,'打开共读讨论：'+details.dataset.conversation+'（阅读讲解，不代表已经理解）。');}));

 const widthInput=$('rain-width'),densityInput=$('rain-density'),slantInput=$('rain-slant');
 function rainLabel(kind,value){
  if(kind==='width')return value<=2?'细':value<=3?'中等':'粗';
  if(kind==='density')return value>=17?'密':value>=12?'中等':'疏';
  return value>=16?'明显斜':value>=8?'微斜':'近直';
 }
 function drawRain(save=false){
  const width=Number(widthInput.value),density=Number(densityInput.value),slant=Number(slantInput.value);
  const widthText=rainLabel('width',width),densityText=rainLabel('density',density),slantText=rainLabel('slant',slant);
  $('rain-width-value').textContent=widthText;$('rain-density-value').textContent=densityText;$('rain-slant-value').textContent=slantText;
  widthInput.setAttribute('aria-valuetext',widthText);densityInput.setAttribute('aria-valuetext',densityText);slantInput.setAttribute('aria-valuetext',slantText);
  $('rain-lines').innerHTML=Array.from({length:density},(_,index)=>`<i class="rain-drop" style="left:${((index+.5)/density*100).toFixed(2)}%;width:${width}px;transform:rotate(${slant}deg);animation-delay:${(-index*.07).toFixed(2)}s"></i>`).join('');
  if(save)log.draft(0,{$rainWidth:width,$rainDensity:density,$rainSlant:slant});
 }
 if(Number.isFinite(record.draft?.$rainWidth))widthInput.value=record.draft.$rainWidth;
 if(Number.isFinite(record.draft?.$rainDensity))densityInput.value=record.draft.$rainDensity;
 if(Number.isFinite(record.draft?.$rainSlant))slantInput.value=record.draft.$rainSlant;
 for(const input of [widthInput,densityInput,slantInput])input.addEventListener('input',()=>drawRain(true));
 $('rain-check').onclick=()=>{
  const width=Number(widthInput.value),density=Number(densityInput.value),slant=Number(slantInput.value),fits=[width<=2,density>=17,slant>=16];
  $('rain-feedback').innerHTML=`<ul><li data-fit="${fits[0]}"><b>细</b><br>${fits[0]?'雨丝已经很细。':'再细一点，更接近细线。'}</li><li data-fit="${fits[1]}"><b>密密</b><br>${fits[1]?'线与线挨得很近。':'再加密，让雨丝连成一片。'}</li><li data-fit="${fits[2]}"><b>斜</b><br>${fits[2]?'方向已经看得出来。':'再斜一点，让方向更清楚。'}</li></ul><p>${fits.every(Boolean)?'三个控件对应粗细、间距和方向；不断落下的细线又让作者联想到“织”。':'没有判成失败；回到原词，只改还没有对应上的关系。'}</p>`;
  const check=`${width}|${density}|${slant}|${fits.map(Boolean).join(',')}`;
  if(!record.draft?.$rainFirstCheck)log.note(0,`首次春雨对照：粗细${width}、疏密${density}、倾斜${slant}；匹配 ${fits.filter(Boolean).length}/3 项。`);
  log.draft(0,{$rainFirstCheck:record.draft?.$rainFirstCheck||check,$rainLastCheck:check});drawReport();
 };

 $('route-buttons').innerHTML=L.route.map((step,index)=>`<button type="button" data-route="${index}" aria-controls="route-screen" aria-pressed="${index===0}"><span aria-hidden="true">${index+1}</span><b>${esc(step.label)}</b></button>`).join('');
 function drawRoute(index){const step=L.route[index];$('route-icon').textContent=step.icon;$('route-step').textContent='第 '+(index+1)+' 步 · '+step.label;$('route-heading').textContent=step.title;$('route-text').textContent=step.text;document.querySelectorAll('[data-route]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.route)===index)));$('route-icon').style.transform=`rotate(${index%2?4:-3}deg)`;}
 document.querySelectorAll('[data-route]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.route);drawRoute(index);log.draft(0,{$route:index});trackOnce('route_'+index,'查看段落路线：'+L.route[index].label+'（结构地图是读者概括，不是作者小标题）。');});

 $('transfer-sentence').textContent=L.transfer.text;
 $('transfer-words').innerHTML=L.transfer.words.map(word=>`<button type="button" data-transfer-word="${esc(word)}" aria-pressed="false">${esc(word)}</button>`).join('');
 let transferSelected=new Set(Array.isArray(record.draft?.$transferWords)?record.draft.$transferWords:[]);
 function drawTransferWords(message=''){document.querySelectorAll('[data-transfer-word]').forEach(button=>button.setAttribute('aria-pressed',String(transferSelected.has(button.dataset.transferWord))));$('transfer-check').disabled=transferSelected.size!==2;$('transfer-selection-status').textContent=message||`已选 ${transferSelected.size} / 2`;}
 document.querySelectorAll('[data-transfer-word]').forEach(button=>button.onclick=()=>{const word=button.dataset.transferWord;if(transferSelected.has(word))transferSelected.delete(word);else if(transferSelected.size>=2){drawTransferWords('一次只保留两个词；先取消一个，再换新的。');return;}else transferSelected.add(word);log.draft(0,{$transferWords:[...transferSelected]});drawTransferWords();});
 $('transfer-check').onclick=()=>{
  if(transferSelected.size<2)return;
  const selected=[...transferSelected],moving=selected.filter(word=>L.transfer.moving.includes(word));
  $('fog-scene').classList.remove('is-playing');void $('fog-scene').offsetWidth;$('fog-scene').classList.add('is-playing');
  $('transfer-feedback').innerHTML=moving.length>=2?`<strong>你选的“${esc(moving.slice(0,2).join('、'))}”都在控制播放过程。</strong><br>${esc(L.transfer.explanation)}`:`<strong>你选的词里，有 ${moving.length} 个直接控制动作或速度。</strong><br>场景名词告诉我们“有什么”；再找“漫上来、一点点、吞没、爬上”中的动作线索，画面才会播放。`;
  if(!record.draft?.$transferFirst)log.note(0,'首次晨雾迁移选择：'+selected.join('、')+'。');
  log.draft(0,{$transferFirst:record.draft?.$transferFirst||selected,$transferLast:selected});drawReport();
 };

 $('quote-buttons').innerHTML=['小草那句','雨丝那句','结尾那句'].map((label,index)=>`<button type="button" data-quote="${index}" aria-pressed="false">${label}</button>`).join('');
 function drawQuoteChoices(){document.querySelectorAll('[data-quote]').forEach(button=>button.setAttribute('aria-pressed',String($('kept-quote').value.trim()===L.quotes[Number(button.dataset.quote)])));}
 function saveDraft(){log.draft(0,{quote:$('kept-quote').value,note:$('reading-note').value});$('note-status').textContent=F.storageError?'本机保存未成功，请先截图保留。':'便笺已自动保存在本机；空着也可以。';drawQuoteChoices();drawReport();}
 function commit(){const answer=L.compose($('kept-quote').value.trim(),$('reading-note').value.trim()),last=record.attempts[record.attempts.length-1];if(answer&&answer!==last?.answer)log.submit(0,answer,null,$('reading-note').value.trim());saveDraft();return !!answer;}
 function drawNote(restore=false){
  if(restore){$('kept-quote').value=record.draft?.quote||'';$('reading-note').value=record.draft?.note||'';}
  $('kept-quote').readOnly=record.done;$('reading-note').readOnly=record.done;document.querySelectorAll('[data-quote]').forEach(button=>button.disabled=record.done);
  $('note-actions').innerHTML=record.done?'<button type="button" class="primary" id="continue-reading">接着共读</button>':'<button type="button" class="primary" id="keep-note">留住这版便笺</button><button type="button" class="secondary" id="close-reading">这次先读到这里</button>';
  if(record.done)$('continue-reading').onclick=()=>{log.reopen(0);drawNote();$('keep-note').focus();$('note-action-status').textContent='可以继续阅读和修改；以前留下的版本仍在记录里。';};
  else{
   $('keep-note').onclick=()=>{const before=record.attempts.length;if(commit())$('note-action-status').textContent=before===record.attempts.length?'这版已经留好，不重复记。':'便笺已留好，以后可以改变看法。';else $('note-action-status').textContent='现在可以不写。读过、动过手，也可以先收工。';drawReport();};
   $('close-reading').onclick=()=>{commit();log.finish(0,'这次先读到这里，未判定理解程度');drawNote();$('continue-reading').focus();$('note-action-status').textContent='这次先收好。没有写便笺也可以，下次接着读。';};
  }
  drawQuoteChoices();drawReport();
 }
 document.querySelectorAll('[data-quote]').forEach(button=>button.onclick=()=>{$('kept-quote').value=L.quotes[Number(button.dataset.quote)];saveDraft();trackOnce('keep_quote','从短引文中留下一句，未要求抄写全文。');});
 for(const id of ['kept-quote','reading-note'])$(id).addEventListener('input',saveDraft);
 $('note-help').addEventListener('toggle',()=>{if($('note-help').open){log.help(0,'家长共读提问的小启发');drawReport();}});

 function drawResume(){const number=Number(record.draft?.$paragraph),link=$('resume-reading'),valid=Number.isInteger(number)&&number>=1&&number<=L.paragraphs.length;link.hidden=!valid;if(valid){link.href='#paragraph-'+number;link.textContent='从上次停留的第 '+number+' 段继续读 →';}}

 let pendingParagraph=false;
 window.addEventListener('scroll',()=>{
  if(pendingParagraph)return;
  pendingParagraph=true;
  requestAnimationFrame(()=>{
   pendingParagraph=false;
   const paragraph=[...document.querySelectorAll('[data-paragraph]')].find(element=>{const rect=element.getBoundingClientRect();return rect.top<=150&&rect.bottom>150;});
   if(!paragraph)return;
   const number=Number(paragraph.dataset.paragraph);
   if(number!==record.draft?.$paragraph){log.draft(0,{$paragraph:number});drawResume();drawReport();}
  });
 },{passive:true});

 drawReadState();drawResume();drawMotion(record.draft?.$motionMode||'result');drawSense(Number.isInteger(record.draft?.$sense)?record.draft.$sense:0);drawRain();drawRoute(Number.isInteger(record.draft?.$route)?record.draft.$route:0);drawTransferWords();drawNote(true);
 if(record.draft?.$transferLast){$('transfer-feedback').textContent='已恢复上次选词；点“播放画面”可以重新查看。';}
 if(log.active)$('note-status').textContent='已恢复本机阅读轨迹；这些记录不等于已经读懂。';
})();
