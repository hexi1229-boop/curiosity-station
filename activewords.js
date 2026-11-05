'use strict';
(function(){
  const host=document.querySelector('#activewords-task');
  const sources=document.querySelector('#activewords-sources');
  const L=window.ActiveWordsLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="persuade-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="activewords-refresh">重新打开</button></section>';
    document.querySelector('#activewords-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'activewords.html']);
  const esc=F.esc;
  const blankInputs=()=>Object.fromEntries(L.chunks.map(chunk=>[chunk.id,'']));
  const defaults={
    phase0:'answer',baselineText:'',baselineUnsure:false,baselineSpoken:false,
    phase1:'example',exampleAudioPlayed:false,exampleTranscriptOpened:false,recallInputs:blankInputs(),recallResult:null,recallOral:false,
    sportText:'',sportSpoken:false,
    transferText:'',transferChunks:['','','',''],transferChecks:[],transferSpoken:false
  };
  const cleanText=(value,max=1200)=>typeof value==='string'?value.slice(0,max):'';
  const cleanInputs=value=>Object.fromEntries(L.chunks.map(chunk=>[chunk.id,cleanText(value?.[chunk.id],120)]));
  const cleanResult=value=>value&&typeof value==='object'?Object.fromEntries(L.chunks.map(chunk=>[chunk.id,!!value[chunk.id]])):null;
  function loadState(){
    const saved=log.checkpoint.activewords||{};
    return {
      ...defaults,...saved,
      phase0:['answer','saved'].includes(saved.phase0)?saved.phase0:'answer',
      baselineText:cleanText(saved.baselineText),baselineUnsure:!!saved.baselineUnsure,baselineSpoken:!!saved.baselineSpoken,
      phase1:['example','recall','oral'].includes(saved.phase1)?saved.phase1:'example',
      exampleAudioPlayed:!!saved.exampleAudioPlayed,exampleTranscriptOpened:!!saved.exampleTranscriptOpened,
      recallInputs:cleanInputs(saved.recallInputs),recallResult:cleanResult(saved.recallResult),recallOral:!!saved.recallOral,
      sportText:cleanText(saved.sportText),sportSpoken:!!saved.sportSpoken,
      transferText:cleanText(saved.transferText),transferChunks:Array.from({length:4},(_,i)=>cleanText(saved.transferChunks?.[i],120)),
      transferChecks:Array.isArray(saved.transferChecks)?[...new Set(saved.transferChecks.filter(value=>['problem','finding','result'].includes(value)))]:[],
      transferSpoken:!!saved.transferSpoken
    };
  }
  let log=F.create(L.title,L.tasks);
  let state=loadState();
  function save(){log.point({activewords:state});}
  function focusCard(){requestAnimationFrame(()=>host.querySelector('h2')?.focus());}
  function message(value,error=false){const box=host.querySelector('.persuade-message');if(box){box.textContent=value;box.dataset.error=String(error);}}
  function progress(){
    const index=log.index;
    document.querySelectorAll('.activewords-nav li').forEach((item,i)=>{
      item.classList.toggle('current',i===index);item.classList.toggle('done',i<index);
      if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
      item.setAttribute('aria-label',(i<index?'已完成：':i===index?'当前：':'待完成：')+item.textContent.trim());
    });
  }
  function base(kicker,title,body,actions=''){
    return '<section class="persuade-card activewords-card"><p class="persuade-label">'+esc(kicker)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<div class="persuade-message" role="status" aria-live="polite"></div>'+actions+'</section>';
  }
  function bindHelp(index){F.watchHelp(host,log,index);}
  function bindField(id,onInput){const input=host.querySelector('#'+id);input.addEventListener('input',()=>onInput(input.value));return input;}
  function allCorrect(result){return L.chunks.every(chunk=>result[chunk.id]);}
  function answerLine(values){return L.chunks.map(chunk=>chunk.function+'：'+(values[chunk.id].trim()||'未填写')).join('；');}
  function resultFeedback(result){
    if(!result)return '';
    const notes={
      stuck:'“卡住”要把整个词块一起取出；不要只留下 stuck。',
      try:'“试一试”需要 give / gave、a 和 try 共同出现，中间可以换成具体办法。',
      figure:'找到原因或办法时，out 也是整个词块的一部分。',
      better:'比较效果时，需要把 work / worked 和 better 连在一起。'
    };
    const wrong=L.chunks.filter(chunk=>!result?.[chunk.id]);
    return wrong.length?'<div class="activewords-feedback" role="status" aria-live="polite" aria-label="需要修订的词块">'+wrong.map(chunk=>'<p><b>'+esc(chunk.function)+'：</b>'+esc(notes[chunk.id])+'</p>').join('')+'</div>':'';
  }
  function chunkFields(prefix,values,result,showCue=false){
    return '<div class="recall-grid">'+L.chunks.map(chunk=>'<label class="recall-field"'+(result?' data-ok="'+String(!!result[chunk.id])+'"':'')+' for="'+prefix+'-'+chunk.id+'"><b>'+esc(chunk.function)+'</b>'+(showCue?'<span class="cue-line" aria-label="首字母提示">'+esc(chunk.cue)+'</span>':'')+'<input id="'+prefix+'-'+chunk.id+'" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(values[chunk.id])+'" placeholder="先说，再补记完整英语词块"></label>').join('')+'</div>';
  }
  function bindChunkFields(prefix,key,resultKey){
    L.chunks.forEach(chunk=>bindField(prefix+'-'+chunk.id,value=>{state[key][chunk.id]=value;state[resultKey]=null;save();}));
  }
  function fullChunkHelp(label='需要时查看完整词块'){
    return '<details class="persuade-help" data-help="'+esc(label)+'"><summary>'+esc(label)+'</summary><div class="chunk-map">'+L.chunks.map(chunk=>'<div class="chunk-card"><span>'+esc(chunk.function)+'</span><b lang="en">'+esc(chunk.base)+'</b><small>'+esc(chunk.tip)+'</small></div>').join('')+'</div></details>';
  }
  function storyStrip(){
    const panels=[
      ['第一次试跑','机器人前轮太宽，卡在窄门两侧。'],
      ['换一个办法','队员调窄前轮间距，再试一次。'],
      ['新的结果','机器人顺利通过窄门。']
    ];
    return '<div class="story-strip" aria-label="机器人试跑三格图">'+panels.map((panel,i)=>'<article class="story-panel"><div class="robot-scene" aria-hidden="true"><i class="robot-vehicle"></i><i class="gate-frame"></i></div><span>'+(i+1)+'</span><b>'+panel[0]+'</b><p>'+panel[1]+'</p></article>').join('')+'</div>';
  }
  function renderBaseline(){
    const body='<p class="activewords-lead">先别找词表。看三格记录，直接对队友说：发生了什么？团队怎样解决？</p>'+storyStrip()+
      '<p class="english-prompt" lang="en">Tell your teammate what happened and what the team changed.</p><div class="persuade-reason"><label for="baseline-text">先大声说，再补记你刚才实际说出的英语</label><textarea id="baseline-text" rows="4" maxlength="1200" placeholder="不必写得漂亮；保留现在真正能调出的英语。">'+esc(state.baselineText)+'</textarea><label class="spoken-check"><input id="baseline-spoken" type="checkbox" '+(state.baselineSpoken?'checked':'')+'>我先开口说了，再补记文字</label><label class="reason-unsure"><input id="baseline-unsure" type="checkbox" '+(state.baselineUnsure?'checked':'')+'>我暂时想不起来，先如实记录</label></div>';
    host.innerHTML=base('现场一 · 封存首答','眼熟的表达，没有词表还能自己出现吗？',body,'<button class="primary" id="baseline-submit">封存这次提取 →</button>');
    bindField('baseline-text',value=>{state.baselineText=value;if(value.trim()){state.baselineUnsure=false;const unsure=host.querySelector('#baseline-unsure');if(unsure)unsure.checked=false;}save();});
    host.querySelector('#baseline-spoken').onchange=event=>{state.baselineSpoken=event.target.checked;save();};
    host.querySelector('#baseline-unsure').onchange=event=>{state.baselineUnsure=event.target.checked;if(event.target.checked){state.baselineSpoken=false;host.querySelector('#baseline-spoken').checked=false;}save();};
    host.querySelector('#baseline-submit').onclick=()=>{
      const answer=state.baselineText.trim();
      if(!answer&&!state.baselineUnsure){message('先留下实际说出的英语；暂时想不起来也可以如实勾选。',true);return;}
      if(answer&&!state.baselineSpoken){message('这一步要先开口。说完后再勾选并保存文字。',true);return;}
      if(answer&&!L.meaningfulEnglish(answer,3)){message('再补成一个能表达完整意思的英语短句，或如实记录暂时想不起来。',true);return;}
      log.submit(0,answer||'暂时想不起来',null,answer||'暂时想不起来');
      log.note(0,state.baselineSpoken?'孩子自报先口头表达，再补记文字':'孩子如实记录暂时无法主动提取；本站未录音核验');
      state.phase0='saved';save();render(true);
    };
  }
  function renderBaselineSaved(){
    const first=log.records[0].first?.answer||'暂时想不起来';
    const body='<p class="activewords-lead">首答已经保留，后面的示例不会覆盖它。</p><div class="baseline-capture"><b>刚才真正调出的英语</b><p lang="en">'+esc(first)+'</p></div><div class="chunk-map"><div class="chunk-card"><span>看见时</span><b>Recognise</b><small>词形和语境都在眼前，大脑只需要判断“见过”。</small></div><div class="chunk-card"><span>开口时</span><b>Retrieve</b><small>词表不在眼前，需要从意思主动找到完整表达。</small></div></div><p>这不是“会或不会”的标签，而是两种不同动作。接下来只训练第二种。</p>';
    host.innerHTML=base('首答已封存 · 暂不评分','看得懂，与用得出，不是同一个动作',body,'<button class="primary" id="baseline-next">看一个短示例 →</button>');
    host.querySelector('#baseline-next').onclick=()=>{log.finish(0,'保留无词表首答；未据此判断口语水平');render(true);};
  }
  function renderExample(){
    const highlightPattern=new RegExp('('+L.example.highlights.map(value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');
    const lines=L.example.lines.map(line=>'<p class="example-line" lang="en">'+line.replace(highlightPattern,'<mark>$1</mark>')+'</p>').join('');
    const body='<p class="activewords-lead">先听一次完整过程。不要逐词背中文，把每个词块连到它在故事里承担的动作；不方便听时可直接看同一份文字。</p><section class="example-stage"><small>'+esc(L.example.label)+' · 原创听力'+esc(L.example.duration)+'</small><audio id="activewords-example-audio" controls preload="metadata" src="assets/audio/activewords-example.m4a" aria-label="合作游戏英语短示例"></audio><p class="audio-fallback" id="activewords-audio-error" role="status" hidden>音频暂时无法播放，展开下方文字即可继续，不影响本课完成。</p><details id="activewords-example-transcript"><summary>不方便听？看同一份文字</summary><div class="example-transcript">'+lines+'</div></details></section><div class="chunk-map">'+L.chunks.map(chunk=>'<div class="chunk-card"><span>'+esc(chunk.function)+'</span><b lang="en">'+esc(chunk.base)+'</b><small>'+esc(chunk.tip)+'</small></div>').join('')+'</div><p>下一页会撤掉完整词块，只留下功能和首字母。先自己说，再输入。</p>';
    host.innerHTML=base('现场二 · 短示例','听或读一次，然后把完整表达叫回来',body,'<button class="primary" id="example-cover">收起词表，开始提取 →</button>');
    const audio=host.querySelector('#activewords-example-audio');
    const transcript=host.querySelector('#activewords-example-transcript');
    audio.addEventListener('playing',()=>{state.exampleAudioPlayed=true;save();},{once:true});
    audio.addEventListener('error',()=>{host.querySelector('#activewords-audio-error').hidden=false;});
    transcript.addEventListener('toggle',()=>{if(transcript.open&&!state.exampleTranscriptOpened){state.exampleTranscriptOpened=true;save();}});
    host.querySelector('#example-cover').onclick=()=>{
      const mode=state.exampleAudioPlayed?(state.exampleTranscriptOpened?'音频曾开始播放，并查看文字':'音频曾开始播放'):(state.exampleTranscriptOpened?'查看文字替代':'直接观察词块卡');
      log.note(1,'短示例输入方式：'+mode+'；示例输入不计分');
      state.phase1='recall';save();render(true);
    };
  }
  function renderRecall(){
    const body='<p class="activewords-lead">完整词表已经从页面移走。根据动作功能和首字母，先大声说，再补记完整词块。</p>'+chunkFields('recall',state.recallInputs,state.recallResult,true)+resultFeedback(state.recallResult)+fullChunkHelp('我需要再看一次完整词块');
    host.innerHTML=base('示例后立即提取 · 有首字母支架','不是选答案：把四个完整词块重新叫出来',body,'<button class="primary" id="recall-submit">检查这次提取 →</button>');
    bindChunkFields('recall','recallInputs','recallResult');
    host.querySelector('#recall-submit').onclick=()=>{
      const result=L.gradeInputs(state.recallInputs);
      log.submit(1,answerLine(state.recallInputs),allCorrect(result),answerLine(state.recallInputs));
      state.recallResult=result;
      if(allCorrect(result)){
        log.note(1,'在功能与首字母支架下提取四个完整词块');
        state.phase1='oral';save();render(true);return;
      }
      save();render(true);
    };
    bindHelp(1);
  }
  function renderRecallOral(){
    const body='<p class="activewords-lead">输入框也收起来。只看四个动作功能，把刚才的游戏故事用英语说一遍。</p><section class="oral-cover"><div class="function-row"><span>遇到阻碍</span><span>尝试办法</span><span>找到规律</span><span>比较结果</span></div><button class="secondary" id="recall-oral-start">收起功能标签，开始说</button><div id="recall-oral-live" hidden><p>不用和示例一模一样；让队友听懂过程即可。</p><button class="primary" id="recall-oral-done">我说完了</button><button class="text-button" id="recall-oral-skip">现在不方便开口，先如实记录</button></div></section>';
    host.innerHTML=base('口语动作 · 不把打字当开口','再遮一层：不看输入框说一次',body);
    host.querySelector('#recall-oral-start').onclick=()=>{host.querySelector('.function-row').hidden=true;host.querySelector('#recall-oral-start').hidden=true;host.querySelector('#recall-oral-live').hidden=false;log.note(1,'收起功能标签后开始口头表达');requestAnimationFrame(()=>host.querySelector('#recall-oral-done').focus());};
    host.querySelector('#recall-oral-done').onclick=()=>{state.recallOral=true;save();log.note(1,'孩子自报完成一次不看词表的口头复述；本站未录音核验');log.finish(1,'有首字母支架完成提取，并自报脱稿复述');render(true);};
    host.querySelector('#recall-oral-skip').onclick=()=>{state.recallOral=false;save();log.note(1,'当前未自报完成口头复述，只保留文字提取证据');log.finish(1,'完成文字提取；未自报口头复述');render(true);};
  }
  function renderSportOral(){
    const body='<p class="activewords-lead">场景换成球场，资料也换成比分牌和教练便笺。这里没有首字母和填写格：先说2—4句，再补记实际说出的内容。</p><section class="scoreboard"><b>8 : 11</b><p>连续两次长传被截，队伍落后3分。</p><b>11 : 11</b><p>改用短传配合后，连得3分。</p></section><section class="coach-note"><b>教练便笺</b><p>先试一次短传；观察对手为什么总能提前扑向左侧。</p><p>队员发现：对手看到持球队员抬手，就会提前移动。</p></section><div class="persuade-reason"><label for="sport-text">球场过程</label><textarea id="sport-text" rows="5" maxlength="1200" placeholder="说清遇到的问题、尝试和结果；不必照搬示例。">'+esc(state.sportText)+'</textarea><label class="spoken-check"><input id="sport-spoken" type="checkbox" '+(state.sportSpoken?'checked':'')+'>我先开口说了，再补记文字</label></div><details class="persuade-help" data-help="过去时小提示"><summary>只需要一个时态提示</summary><p>讲刚才发生的事，可以用 <span lang="en">got / gave / figured / worked</span>。本课不会因为轻微时态错误否定词块提取。</p></details>'+fullChunkHelp('真正卡住时查看四张词块卡');
    host.innerHTML=base('现场三 · 逐步撤架','不用词表，把球场过程重新组织出来',body,'<button class="primary" id="sport-oral-submit">保存球场表达 →</button>');
    bindField('sport-text',value=>{state.sportText=value;save();});
    host.querySelector('#sport-spoken').onchange=event=>{state.sportSpoken=event.target.checked;save();};
    host.querySelector('#sport-oral-submit').onclick=()=>{
      const answer=state.sportText.trim(),used=L.extractChunks(answer);
      if(!L.meaningfulEnglish(answer,7)){message('请留下刚才说出的2—4句英语，让问题、尝试或结果至少出现两部分。',true);return;}
      const last=log.records[2].attempts[log.records[2].attempts.length-1];
      if(last?.answer!==answer)log.submit(2,answer,null,answer);
      if(!state.sportSpoken){message('先把意思说给队友听，再勾选；已经写下的第一次表达会保留。',true);return;}
      if(new Set(used).size<2){message('补记的实际表达中还只能识别到'+new Set(used).size+'个完整词块；至少让两个词块回到句子里。',true);return;}
      log.note(2,'孩子自报完成球场口头表达；文字中可识别词块：'+used.join('、'));
      const helped=log.records[2].helps.some(help=>help.phase!=='完成后回看');
      log.finish(2,(helped?'使用过词块或时态提示；':'未打开提示；')+'补记正文中含至少两个完整词块');render(true);
    };
    bindHelp(2);
  }
  function renderTransfer(){
    const body='<p class="activewords-lead">最后一次，情境和资料形式都变了。先读聊天记录，再直接解释“发生了什么、怎样解决”。</p><section class="chat-log" aria-label="月球车维修聊天记录"><div class="chat-line"><time>09:10 · TEST FIELD</time>Rover 2 stopped in loose sand.</div><div class="chat-line"><time>09:13 · KAI</time>I lowered the tire pressure and tried again, but the rover still stopped at the same shadow.</div><div class="chat-line"><time>09:16 · MEI</time>The log showed that the left sensor was reading the shadow as a rock.</div><div class="chat-line"><time>09:18 · TEAM</time>We recalibrated the sensor and tried the route again.</div><div class="chat-line"><time>09:20 · RESULT</time>Rover 2 crossed the field in 38 seconds — 12 seconds faster.</div></section><p class="english-prompt" lang="en">Explain what happened and how the problem was solved.</p><div class="persuade-reason"><label for="transfer-text">先口头说20—40秒，再留下刚才实际说出的英语</label><textarea id="transfer-text" rows="6" maxlength="1200" placeholder="没有完整句架；按自己认为清楚的顺序组织。">'+esc(state.transferText)+'</textarea><label class="spoken-check"><input id="transfer-spoken" type="checkbox" '+(state.transferSpoken?'checked':'')+'>我先开口说了，再补记文字</label></div><h3>只补记你刚才实际用过的词块</h3><div class="transfer-chunks">'+state.transferChunks.map((value,i)=>'<label for="transfer-chunk-'+i+'">词块 '+(i+1)+'（可留空）<input id="transfer-chunk-'+i+'" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(value)+'"></label>').join('')+'</div><div class="activewords-checks"><label><input type="checkbox" data-transfer-check="problem" '+(state.transferChecks.includes('problem')?'checked':'')+'>我说到了遇到的阻碍和尝试</label><label><input type="checkbox" data-transfer-check="finding" '+(state.transferChecks.includes('finding')?'checked':'')+'>我说到了团队发现的原因与调整</label><label><input type="checkbox" data-transfer-check="result" '+(state.transferChecks.includes('result')?'checked':'')+'>我用结果比较说明了是否改善</label></div>'+fullChunkHelp('真正卡住时，再打开词块提示');
    host.innerHTML=base('现场四 · 独立迁移','聊天记录里没有词表，你能主动调出几个？',body,'<button class="primary" id="transfer-submit">封存这次独立表达 →</button>');
    bindField('transfer-text',value=>{state.transferText=value;save();});
    host.querySelector('#transfer-spoken').onchange=event=>{state.transferSpoken=event.target.checked;save();};
    state.transferChunks.forEach((_,i)=>bindField('transfer-chunk-'+i,value=>{state.transferChunks[i]=value;save();}));
    host.querySelectorAll('[data-transfer-check]').forEach(input=>input.onchange=()=>{state.transferChecks=[...host.querySelectorAll('[data-transfer-check]:checked')].map(item=>item.dataset.transferCheck);save();});
    host.querySelector('#transfer-submit').onclick=()=>{
      const answer=state.transferText.trim();
      const used=new Set(L.extractChunks(answer));
      const noted=new Set(L.extractChunks(state.transferChunks.join(' ')));
      if(!L.meaningfulEnglish(answer,8)){message('请留下刚才说出的英语，让队友能听懂问题、办法和结果。',true);return;}
      const last=log.records[3].attempts[log.records[3].attempts.length-1];
      if(last?.answer!==answer)log.submit(3,answer,null,answer);
      if(!state.transferSpoken){message('先真正说一次，再勾选并留下文字；网页不会调用麦克风。',true);return;}
      if(used.size<3){message('补记的实际表达中还只能识别到'+used.size+'个完整词块；先自己再想一次，需要时再打开提示。',true);return;}
      if(!['problem','finding','result'].every(value=>state.transferChecks.includes(value))){message('回看聊天记录，确认阻碍、发现和结果三部分都已经说到。',true);return;}
      log.note(3,'补记正文中识别到'+used.size+'个不同词块；另行自报词块栏识别到'+noted.size+'个，未用于抬高通过数');
      log.note(3,'开放英语未按关键词自动判断语义质量');
      log.note(3,'孩子自报完成20—40秒口头表达；本站未录音核验');
      const helped=log.records[3].helps.some(help=>help.phase!=='完成后回看');
      log.finish(3,'新情境中自报口头表达；补记正文含至少3个词块；'+(helped?'使用过完整词块提示':'未打开完整词块提示'));render(true);
    };
    bindHelp(3);
  }
  function renderComplete(){
    if(sources)sources.hidden=false;
    const first=log.records[0].first?.answer||'未留下文字';
    const lastRecord=log.records[3],last=lastRecord.attempts[lastRecord.attempts.length-1]?.explanation||'未留下文字';
    const body='<p class="activewords-lead">从机器人首答到月球车迁移，你做的不是再看一遍，而是反复把完整表达从意思里叫出来。</p><div class="baseline-capture"><b>第一次没有词表时</b><p lang="en">'+esc(first)+'</p></div><div class="baseline-capture"><b>最后一次换情境时</b><p lang="en">'+esc(last)+'</p></div><div class="word-ribbon">'+L.chunks.map(chunk=>'<span lang="en">'+esc(chunk.base)+'</span>').join('')+'</div><ul class="takeaway"><li><b>整块提取：</b>不要只记 stuck 或 out，把常用组合当成一个把手。</li><li><b>先说再看：</b>主动尝试之后，提示才能告诉你真正缺在哪一环。</li><li><b>换情境再取：</b>从游戏到球场再到月球车，才能检查是否只记住了例句。</li></ul><p>今天的记录只能说明你在本次页面中留下了哪些文字、打开了什么提示，并自报完成口头表达；它不能证明发音、流利度或隔天仍能独立调用。</p><div class="activewords-next"><b>下一站：</b>数学G4将研究“图形搬家以后，哪些量一定不变”。</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="activewords-restart">重新练一轮（保留旧记录）</button><a class="secondary" href="courses.html?group=school&amp;subject=英语">返回英语课程</a></div>';
    host.innerHTML=base('E03 · 本次先收好','会认只是入口，能在新情境里调出才算真正用过',body)+log.html();
    host.querySelector('#activewords-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state={...defaults,recallInputs:blankInputs(),transferChunks:['','','',''],transferChecks:[]};save();if(sources)sources.hidden=true;render(true);};
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();if(moveFocus)focusCard();return;}
    if(sources)sources.hidden=true;
    if(log.index===0){state.phase0==='saved'?renderBaselineSaved():renderBaseline();}
    else if(log.index===1){state.phase1==='example'?renderExample():state.phase1==='oral'?renderRecallOral():renderRecall();}
    else if(log.index===2){renderSportOral();}
    else renderTransfer();
    progress();if(moveFocus)focusCard();
  }
  render();
})();
