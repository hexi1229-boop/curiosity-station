'use strict';
(function(){
  const host=document.querySelector('#readenglish-task');
  const sources=document.querySelector('#readenglish-sources');
  const L=window.ReadEnglishLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="persuade-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="readenglish-refresh">重新打开</button></section>';
    host.querySelector('#readenglish-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'readenglish.html']);
  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  function loadState(){
    const state=L.sanitizeState(log.checkpoint.readenglish||{});
    state.coldSaved=state.coldSaved&&!!log.records[0]?.first;
    state.labAttempted=state.labAttempted&&!!log.records[1]?.first;
    state.transferAttempted=state.transferAttempted&&!!log.records[2]?.first;
    state.transferReview=state.transferReview&&state.transferAttempted;
    state.reviewAttempted=state.reviewAttempted&&state.transferReview;
    return state;
  }
  let state=loadState();
  function save(){log.point({readenglish:state});}
  function focusCard(){requestAnimationFrame(()=>host.querySelector('h2')?.focus());}
  function message(value,error=false){const box=host.querySelector('.persuade-message');if(box){box.textContent=value;box.dataset.error=String(error);}}
  function progress(){
    document.querySelectorAll('.readenglish-nav li').forEach((item,index)=>{
      item.classList.toggle('current',index===log.index);
      item.classList.toggle('done',index<log.index);
      item.setAttribute('aria-label',item.textContent.trim()+'；'+(index<log.index?'已完成':index===log.index?'当前环节':'待完成'));
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function base(kicker,title,body,actions=''){
    return '<section class="persuade-card readenglish-card"><p class="persuade-label">'+esc(kicker)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<div class="persuade-message" role="status" aria-live="polite"></div>'+actions+'</section>';
  }
  function bindField(id,key){
    const input=host.querySelector('#'+id);
    input.addEventListener('input',()=>{state[key]=input.value;save();});
    input.addEventListener('change',()=>{state[key]=input.value;save();});
    return input;
  }
  function optionButtons(items,current,attribute='choice',label='选项'){
    return '<div class="readenglish-options" role="group" aria-label="'+esc(label)+'">'+items.map(item=>'<button type="button" data-'+attribute+'="'+esc(item.id)+'" aria-pressed="'+String(current===item.id)+'"><span lang="en">'+esc(item.text)+'</span></button>').join('')+'</div>';
  }
  function bindOptionButtons(attribute,key){
    host.querySelectorAll('[data-'+attribute+']').forEach(button=>button.onclick=()=>{
      state[key]=button.getAttribute('data-'+attribute)||'';
      host.querySelectorAll('[data-'+attribute+']').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      save();
    });
  }
  function evidenceList(selected,key,max){
    return '<div class="evidence-grid" role="group" aria-label="证据信息卡">'+L.evidenceOptions.map(item=>'<label class="evidence-option" aria-pressed="'+String(selected.includes(item.id))+'"><input type="checkbox" data-evidence="'+esc(item.id)+'" '+(selected.includes(item.id)?'checked':'')+'><span lang="en">'+esc(item.text)+'</span></label>').join('')+'</div>';
  }
  function bindEvidence(key,max){
    host.querySelectorAll('[data-evidence]').forEach(input=>input.onchange=()=>{
      const id=input.dataset.evidence;
      if(input.checked&&!state[key].includes(id)){
        if(state[key].length>=max){input.checked=false;message('这一环节最多选择 '+max+' 处证据。先判断哪几句最能支撑整篇主旨。',true);return;}
        state[key]=[...state[key],id];
      }else if(!input.checked)state[key]=state[key].filter(value=>value!==id);
      input.closest('.evidence-option')?.setAttribute('aria-pressed',String(input.checked));
      save();
    });
  }
  function article(highlight=false){
    let paragraphs=L.article.paragraphs.map(esc);
    if(highlight){
      if(state.clueViews.includes('but'))paragraphs[0]=paragraphs[0].replace('but Mina watched the video again','<mark data-kind="turn">but Mina watched the video again</mark>');
      if(state.clueViews.includes('while'))paragraphs[0]=paragraphs[0].replace('while the rover hardly moved','<mark>while the rover hardly moved</mark>');
      if(state.clueViews.includes('this-time'))paragraphs[1]=paragraphs[1].replace('This time they kept the rubber strips and slowed down before the turn','<mark data-kind="turn">This time they kept the rubber strips and slowed down before the turn</mark>');
      if(state.clueViews.includes('report'))paragraphs[2]=paragraphs[2].replace('In their report','<mark data-kind="result">In their report</mark>');
    }
    return '<article class="reading-paper" lang="en"><h3>'+esc(L.article.title)+'</h3>'+paragraphs.map(text=>'<p>'+text+'</p>').join('')+'</article>';
  }
  function meaningfulSummary(){return L.meaningful(state.coldSummary,4);}
  function readableCold(){
    const main=L.mainOptions.find(item=>item.id===state.coldMain)?.text||state.coldMain;
    const evidence=state.coldEvidence.map(id=>L.evidenceOptions.find(item=>item.id===id)?.text||id).join(' / ');
    return '主旨：'+main+'；证据：'+evidence+'；陌生词：'+state.coldUnknown;
  }
  function renderCold(){
    const body='<p class="readenglish-lead">先完整读一遍。这里故意不放逐句翻译：即使有词不熟，也先看文章反复讲了什么变化。</p>'+article()+
      '<h3>哪一句最接近整篇主旨？</h3>'+optionButtons(L.mainOptions,state.coldMain,'cold-main','主旨初步判断')+
      '<label class="readenglish-field"><b>用中文或英文写一句：这篇文章主要讲什么？</b><textarea id="cold-summary" rows="3" maxlength="600" placeholder="先写现在真正读到的意思。">'+esc(state.coldSummary)+'</textarea></label>'+
      '<h3>选两张最能支持主旨的证据信息卡</h3>'+evidenceList(state.coldEvidence,'coldEvidence',2)+
      '<div class="unknown-line"><label for="cold-unknown">记下一个没完全懂、但仍能继续读的词</label><select id="cold-unknown"><option value="">请选择</option>'+L.unknownOptions.map(value=>'<option value="'+esc(value)+'" '+(state.coldUnknown===value?'selected':'')+'>'+esc(value)+'</option>').join('')+'</select></div>';
    host.innerHTML=base('现场一 · 不给词表的冷读','先抓整篇，再决定哪些词值得查',body,'<button class="primary" id="cold-submit">封存第一次阅读 →</button>');
    bindOptionButtons('cold-main','coldMain');
    bindField('cold-summary','coldSummary');
    bindEvidence('coldEvidence',2);
    bindField('cold-unknown','coldUnknown');
    host.querySelector('#cold-submit').onclick=()=>{
      if(!state.coldMain){message('先选出你现在认为最接近整篇主旨的一项。',true);return;}
      if(!meaningfulSummary()){message('请用一句话留下你真正读到的主旨；中文或英文都可以。',true);return;}
      if(state.coldEvidence.length!==2){message('请从原文选两处证据，不只凭选项文字猜主旨。',true);return;}
      if(!state.coldUnknown){message('选一个没完全懂的词；如果没有词阻断阅读，也可以如实选择最后一项。',true);return;}
      log.submit(0,readableCold(),null,state.coldSummary);
      log.note(0,'首答前未显示词义注释、线索提示或正确主旨；主旨选择未自动判分');
      state.coldSaved=true;save();render(true);
    };
  }
  function renderColdSaved(){
    const first=log.records[0].first;
    const body='<p class="readenglish-lead">第一次判断已经保留，后面的讲解不会覆盖它。现在不公布主旨答案，先看一个更短的例子，学习怎样只解决真正拦路的词。</p><div class="cold-capture"><b>第一次概括</b><p>'+esc(first?.explanation||state.coldSummary)+'</p><b>当时选择的证据</b><p>'+esc(state.coldEvidence.map(id=>L.evidenceOptions.find(item=>item.id===id)?.text||id).join(' / '))+'</p></div><p>下一页会开放词义小注和结构线索；它们都会进入学习记录。</p>';
    host.innerHTML=base('首答已封存 · 暂不判分','选了主旨，还要能回到原文取证',body,'<button class="primary" id="cold-next">进入线索实验室 →</button>');
    host.querySelector('#cold-next').onclick=()=>{log.finish(0,'保留主旨、两处证据与陌生词；未即时公布答案');render(true);};
  }
  function renderExample(){
    const body='<p class="readenglish-lead">先看一个短例子。你不必先知道 <b lang="en">cleats</b> 的中文名，也能从前后动作判断它在这里有什么用。</p><section class="mini-example"><blockquote lang="en">The path was muddy, so Ben put on <b>cleats</b>—shoes with small studs underneath. He stopped slipping.</blockquote><p>哪种理解已经足够继续读？</p></section><div class="readenglish-options" role="group" aria-label="短例子判断"><button type="button" data-example="name">必须先背出 cleats 的准确中文名称</button><button type="button" data-example="function">它是一种能减少打滑的鞋；具体中文名暂时不影响主旨</button><button type="button" data-example="mud">它的意思就是 muddy</button></div>';
    host.innerHTML=base('现场二 · 一个短示例','词义不必一步到位，先判断它在句子里做什么',body);
    host.querySelectorAll('[data-example]').forEach(button=>button.onclick=()=>{
      if(button.dataset.example!=='function'){message('再把前后两句连起来：穿上它以后，Ben 不再打滑。这个结果已经说明了什么？',true);return;}
      state.exampleDone=true;save();render(true);
    });
  }
  function labFeedback(grade,ruleFilled){
    if(!state.labAttempted)return '';
    const labels={main:'主旨',evidence:'跨段证据',grip:'语境词义'};
    return '<div class="lab-status" aria-label="本次结构检查">'+Object.entries(grade).map(([key,ok])=>'<span data-ok="'+String(ok)+'">'+esc(labels[key])+' · '+(ok?'已对上':'再检查')+'</span>').join('')+'<span data-ok="'+String(ruleFilled)+'">阅读规则 · '+(ruleFilled?'已填写，未评价质量':'未填写')+'</span></div><p class="readenglish-feedback">主旨、证据和语境词义可由原文核对；自己的阅读规则只检查是否留下，不评价质量。你的概括和英语表达没有被关键词自动评分。</p>';
  }
  function renderLab(){
    const grade=L.gradeLab(state);
    const notes=Object.entries(L.wordNotes).filter(([word])=>word!=='grip'||state.labAttempted);
    const body='<p class="readenglish-lead">回到原文。点击连接词，看它怎样把“原先猜测—观察—改法—结果”连起来；然后重新判断，不必逐句翻译。</p>'+article(true)+
      '<div class="clue-grid">'+L.clueCards.map(item=>'<button type="button" class="clue-card" data-clue="'+esc(item.id)+'" aria-pressed="'+String(state.clueViews.includes(item.id))+'"><b lang="en">'+esc(item.label)+'</b><span>'+(state.clueViews.includes(item.id)?esc(item.meaning):'点一下，看它连接了什么')+'</span></button>').join('')+'</div>'+
      '<div class="word-notes">'+notes.map(([word,note])=>'<details data-help="点读词义：'+esc(word)+'"><summary lang="en">'+esc(word)+'</summary><p>'+esc(note)+'</p></details>').join('')+'</div>'+
      '<h3>现在重新判断主旨</h3>'+optionButtons(L.mainOptions,state.labMain,'lab-main','主旨复核')+
      '<h3>最多选三处证据：必须覆盖两个不同问题</h3>'+evidenceList(state.labEvidence,'labEvidence',3)+
      '<label class="readenglish-field"><b><span lang="en">grip</span> 在这里最接近什么？</b><select id="grip-choice"><option value="">请选择</option><option value="power" '+(state.gripChoice==='power'?'selected':'')+'>马达功率</option><option value="traction" '+(state.gripChoice==='traction'?'selected':'')+'>车轮抓住地面、不容易打滑的能力</option><option value="battery" '+(state.gripChoice==='battery'?'selected':'')+'>电池数量</option><option value="distance" '+(state.gripChoice==='distance'?'selected':'')+'>跑道长度</option></select></label>'+
      '<label class="readenglish-field"><b>给自己留一句阅读规则</b><textarea id="reading-rule" rows="3" maxlength="600" placeholder="例如：遇到不认识的词，我先……">'+esc(state.readingRule)+'</textarea></label>'+labFeedback(grade,L.meaningful(state.readingRule,4))+
      (state.labAttempted?'<details class="persuade-help" data-help="主旨检查提示"><summary>提示1：回到“两个问题”</summary><p>沙地上，马达和轮子分别发生了什么？急弯处又出现了什么？两种改法是否解决同一问题？</p></details><details class="persuade-help" data-help="证据范围提示"><summary>提示2：一句总结够不够？</summary><p><span lang="en">A stronger motor was not the answer.</span> 能排除一个猜测，但要说明整篇主旨，还需同时找到沙地和转弯的过程证据。</p></details>':'');
    host.innerHTML=base('线索实验室 · 示例后撤架','不用翻完每个词，也要让主旨经得起原文检查',body,'<button class="primary" id="lab-submit">检查这次阅读 →</button>');
    host.querySelectorAll('[data-clue]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.clue;
      state.clueViews=state.clueViews.includes(id)?state.clueViews.filter(value=>value!==id):[...state.clueViews,id];
      save();render(false);
    });
    bindOptionButtons('lab-main','labMain');
    bindEvidence('labEvidence',3);
    bindField('grip-choice','gripChoice');
    bindField('reading-rule','readingRule');
    F.watchHelp(host,log,1);
    host.querySelector('#lab-submit').onclick=()=>{
      const next=L.gradeLab(state);
      if(!state.labMain||state.labEvidence.length<2||!state.gripChoice||!L.meaningful(state.readingRule,4)){message('先完成主旨、跨段证据、词义推断和自己的阅读规则。',true);return;}
      const passed=Object.values(next).every(Boolean);
      const main=L.mainOptions.find(item=>item.id===state.labMain)?.text||state.labMain;
      const evidence=state.labEvidence.map(id=>L.evidenceOptions.find(item=>item.id===id)?.text||id).join(' / ');
      const grip={power:'马达功率',traction:'车轮抓住地面、不容易打滑的能力',battery:'电池数量',distance:'跑道长度'}[state.gripChoice]||state.gripChoice;
      log.submit(1,'主旨：'+main+'；证据：'+evidence+'；grip：'+grip,null,state.readingRule);
      state.labAttempted=true;
      if(!passed){log.note(1,'本次客观结构仍需检查：'+Object.entries(next).filter(([,ok])=>!ok).map(([key])=>({main:'主旨',evidence:'跨段证据',grip:'语境词义'}[key])).join('、'));log.help(1,'自动反馈：回到问题—改动—结果');save();render(true);return;}
      log.note(1,'结构化检查通过；阅读规则已留存，开放概括和规则质量均未按关键词判定');
      log.finish(1,(log.records[1].helps.length?'使用过点读或提示；':'未打开点读和提示；')+'主旨同时有沙地与转弯证据');
      save();render(true);
    };
  }
  function chatBoard(){
    return '<section class="chat-board" aria-label="机器人队训练群聊" lang="en">'+L.transfer.messages.map(item=>'<article class="chat-message"><b>'+esc(item.who)+'</b><p>'+esc(item.text)+'</p></article>').join('')+'</section>';
  }
  function selectField(id,label,options,current){
    return '<label class="readenglish-field"><span>'+esc(label)+'</span><select id="'+esc(id)+'"><option value="">请选择</option>'+options.map(([value,text])=>'<option value="'+esc(value)+'" '+(current===value?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select></label>';
  }
  function replyBuilder(){
    const values=[state.revisedUpdate,state.revisedAction,state.revisedQuestion];
    const ids=['revised-update','revised-action','revised-question'];
    const labels=[['1句概括变化','让没看群聊的队友知道地点或安排变了什么。'],['1句说明行动','说明团队应该怎样做，并带上一个具体事实。'],['1—2句提出问题或请求','留下一个需要队友回应或行动的信息。']];
    return '<div class="reply-builder">'+labels.map((item,index)=>'<label class="reply-part"><b>'+item[0]+'</b><small>'+item[1]+'</small><textarea id="'+ids[index]+'" rows="2" maxlength="700" lang="en">'+esc(values[index])+'</textarea></label>').join('')+'</div><p class="reply-counter">当前共 '+(values.map(L.sentenceCount).reduce((a,b)=>a+b,0))+' 句；目标是3—4句。</p>';
  }
  function transferSummary(prefix='reply'){
    if(prefix!=='revised')return '第一次独立回复：'+L.replyText(state);
    const label=(options,value)=>options.find(item=>item[0]===value)?.[1]||value;
    return '地点：'+label(L.transfer.placeOptions,state.transferPlace)+'；集合：'+label(L.transfer.timeOptions,state.transferTime)+'；安排：'+label(L.transfer.waitOptions,state.transferWait)+'；仍缺：'+label(L.transfer.missingOptions,state.transferMissing)+'；发送前版本：'+L.replyText(state,'revised');
  }
  function transferFeedback(grade){
    if(!state.reviewAttempted)return '';
    const labels={place:'地点',time:'集合时间',wait:'是否等待',missing:'仍缺物品',update:'英文概括句',action:'英文行动句',question:'英文问题或请求'};
    return '<div class="lab-status">'+Object.entries(grade).map(([key,ok])=>'<span data-ok="'+String(ok)+'">'+esc(labels[key])+' · '+(ok?'已对上':'再检查')+'</span>').join('')+'</div>';
  }
  function renderTransfer(){
    const body='<p class="readenglish-lead">材料形式变成群聊，关键信息也不按文章顺序出现。这里不先告诉你要找哪几项：读完后，直接给队友写3—4句英文回复。</p>'+chatBoard()+
      '<label class="readenglish-field"><b>如果你就在这个群里，现在会怎样回复？</b><textarea id="first-reply" rows="7" maxlength="1800" lang="en" placeholder="Write 3–4 sentences. Make your message useful to the team.">'+esc(state.firstReply)+'</textarea></label><p class="reply-counter">当前共 '+L.sentenceCount(state.firstReply)+' 句；先独立写，检查表会在首答保存后出现。</p>';
    host.innerHTML=base('现场三 · 独立迁移','先自己识别任务，再看发送前检查表',body,'<button class="primary" id="transfer-submit">封存第一次回复 →</button>');
    const firstReplyInput=bindField('first-reply','firstReply');
    const firstReplyCounter=host.querySelector('.reply-counter');
    firstReplyInput.addEventListener('input',()=>{firstReplyCounter.textContent='当前共 '+L.sentenceCount(state.firstReply)+' 句；先独立写，检查表会在首答保存后出现。';});
    host.querySelector('#transfer-submit').onclick=()=>{
      const reply=L.replyText(state);
      const count=L.sentenceCount(reply);
      if(count<3||count>4||!L.meaningfulEnglish(reply,12)){message('请先独立留下3—4句英文回复；这里只检查句数和英文词数，不判断语义或语法。',true);return;}
      log.submit(2,transferSummary(),null,reply);
      state.transferAttempted=true;
      state.transferReview=true;
      log.note(2,'首轮只显示群聊和空白回复框；未提供事实清单、句架或词义提示');
      log.note(2,'第一次开放回复只检查3—4句及最低英文词数；语义、语法和得体程度未自动判分');
      save();render(true);
    };
  }
  function renderReview(){
    const first=log.records[2].first?.explanation||L.replyText(state);
    const grade=L.gradeTransfer(state);
    const body='<p class="readenglish-lead">第一次回复已经保留。现在才展开事实核对和结构支架：它们帮助修改，但不会倒写成你的首答。</p><div class="first-reply"><b>第一次回复</b><p lang="en">'+esc(first)+'</p></div><h3>先从群聊核对四项客观信息</h3><div class="facts-grid">'+selectField('transfer-place','新集合地点',L.transfer.placeOptions,state.transferPlace)+selectField('transfer-time','集合时间',L.transfer.timeOptions,state.transferTime)+selectField('transfer-wait','团队应该怎样回应Leo',L.transfer.waitOptions,state.transferWait)+selectField('transfer-missing','现在仍缺什么',L.transfer.missingOptions,state.transferMissing)+'</div><ul class="review-list">'+[
      ['place-time','我核对了新集合地点、集合时间和开始时间'],['leo','我核对了开始时间与Leo预计到达时间'],['missing','我用“需要数量－已承诺数量”核对了仍缺物品'],['request','我检查了最后一句是否需要队友回应或行动']
    ].map(([id,text])=>'<li><label><input type="checkbox" data-self="'+id+'" '+(state.selfChecks.includes(id)?'checked':'')+'><span>'+esc(text)+'</span></label></li>').join('')+'</ul><h3>修改成最后准备发送的3—4句英文</h3>'+replyBuilder()+transferFeedback(grade)+
      '<label class="readenglish-field"><b>你为什么保留或修改这一版？</b><textarea id="revision-reason" rows="3" maxlength="600" placeholder="写清这次检查了哪一处信息或表达。">'+esc(state.revisionReason)+'</textarea></label>'+
      (state.reviewAttempted?'<details class="persuade-help" data-help="群聊时间线提示"><summary>提示1：集合与开始不是同一时刻</summary><p>先找到 <span lang="en">meet</span>，再找 <span lang="en">starts</span>。Leo到达的时间是在开始前还是开始后？</p></details><details class="persuade-help" data-help="群聊数量提示"><summary>提示2：需要几根，已经有几根？</summary><p>Coach说总共需要两根；Kai只承诺带一根。Mia的备用控制器不能替代延长线。</p></details>':'');
    host.innerHTML=base('发送前自检 · 首答不会被覆盖','修改不是重写答案，而是让信息更可靠',body,'<button class="primary" id="review-submit">收好这次阅读记录 →</button>');
    host.querySelectorAll('[data-self]').forEach(input=>input.onchange=()=>{state.selfChecks=[...host.querySelectorAll('[data-self]:checked')].map(item=>item.dataset.self);save();});
    [['transfer-place','transferPlace'],['transfer-time','transferTime'],['transfer-wait','transferWait'],['transfer-missing','transferMissing'],['revised-update','revisedUpdate'],['revised-action','revisedAction'],['revised-question','revisedQuestion'],['revision-reason','revisionReason']].forEach(([id,key])=>bindField(id,key));
    const reviewCounter=host.querySelector('.reply-counter');
    const updateReviewCounter=()=>{reviewCounter.textContent='当前共 '+[state.revisedUpdate,state.revisedAction,state.revisedQuestion].map(L.sentenceCount).reduce((a,b)=>a+b,0)+' 句；目标是3—4句。';};
    ['revised-update','revised-action','revised-question'].forEach(id=>host.querySelector('#'+id).addEventListener('input',updateReviewCounter));
    F.watchHelp(host,log,2);
    host.querySelector('#review-submit').onclick=()=>{
      if(state.selfChecks.length!==4){message('请逐项核对四件事；这是发送前自检，不是额外加题。',true);return;}
      if(!L.meaningful(state.revisionReason,4)){message('请留一句修改理由；如果不改，也说明为什么这版已经覆盖关键信息。',true);return;}
      const finalReply=L.replyText(state,'revised');
      const next=L.gradeTransfer(state);
      log.submit(2,transferSummary('revised'),null,finalReply);
      state.reviewAttempted=true;
      if(!Object.values(next).every(Boolean)){log.note(2,'发送前检查仍需核对：'+Object.entries(next).filter(([,ok])=>!ok).map(([key])=>({place:'地点',time:'集合时间',wait:'是否等待',missing:'仍缺物品',update:'英文概括句',action:'英文行动句',question:'英文问题或请求'}[key])).join('、'));log.help(2,'自动反馈：核对群聊事实与英文回复结构');save();render(true);return;}
      log.note(2,'孩子完成四项发送前自检并留下修改理由；开放回复未自动判分');
      log.finish(2,'结构化事实已核对；留下3—4句回复与修改理由；不据此认定英语表达已掌握');
      save();render(true);
    };
  }
  function renderComplete(){
    if(sources)sources.hidden=false;
    const firstCold=log.records[0].first?.explanation||'未留下概括';
    const firstReply=log.records[2].first?.explanation||'未留下回复';
    const attempts=log.records[2].attempts,lastReply=attempts[attempts.length-1]?.explanation||firstReply;
    const reviewMain=L.mainOptions.find(item=>item.id===state.labMain)?.text||'未留下';
    const reviewEvidence=state.labEvidence.map(id=>L.evidenceOptions.find(item=>item.id===id)?.text||id).join(' / ')||'未留下';
    const body='<p class="readenglish-lead">你完成的不是“把每个词翻译出来”，而是让主旨经过证据检查，再尝试把阅读结果用于模拟群聊回复。</p><div class="cold-capture"><b>第一次冷读概括</b><p>'+esc(firstCold)+'</p><b>复核后的主旨</b><p lang="en">'+esc(reviewMain)+'</p><b>复核时使用的跨段证据</b><p lang="en">'+esc(reviewEvidence)+'</p><b>后来留下的阅读规则</b><p>'+esc(state.readingRule)+'</p></div><div class="first-reply"><b>群聊第一次回复</b><p lang="en">'+esc(firstReply)+'</p><b>发送前版本</b><p lang="en">'+esc(lastReply)+'</p></div><div class="strategy-ribbon"><span>先读整篇</span><span>找问题与变化</span><span>跨段取证</span><span>只查拦路词</span><span>尝试用阅读完成任务</span></div><p>这份记录只能说明本次阅读中留下的首答、证据、提示和修改；不能证明所有英文文章都能独立读懂，也不能自动判断语法与表达是否自然。后续会换成新的题材和载体做间隔复测。</p><div class="readenglish-next"><b>跨学科批次：4 / 4，已收口。</b>英语阅读仍会换题材、换载体做间隔复测；本次完成不等于长期掌握。</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="readenglish-restart">重新读一轮（保留旧记录）</button><a class="secondary" href="courses.html?group=school&amp;subject=英语">返回英语课程</a></div>';
    host.innerHTML=base('E-R01 · 本次先收好','不认识每个词，也能让判断有证据、让回复有依据',body)+log.html();
    host.querySelector('#readenglish-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});if(sources)sources.hidden=true;save();render(true);};
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();if(moveFocus)focusCard();return;}
    if(sources)sources.hidden=true;
    if(log.index===0)state.coldSaved?renderColdSaved():renderCold();
    else if(log.index===1)state.exampleDone?renderLab():renderExample();
    else state.transferReview?renderReview():renderTransfer();
    progress();if(moveFocus)focusCard();
  }
  render();
})();
