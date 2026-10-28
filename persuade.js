'use strict';
(function(){
  const host=document.querySelector('#persuade-task');
  const L=window.PersuadeLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="persuade-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="persuade-refresh">重新打开</button></section>';
    document.querySelector('#persuade-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.push([L.id,L.title,'persuade.html']);
  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  const defaults={
    phase0:'choose',initialPlan:null,initialReply:'',initialUnsure:false,initialSpoken:false,revisedReply:'',firstOral:false,
    phase1:'listen',guidedPlays:0,guidedInputSeen:false,guidedQuestion:null,guidedReply:'',guidedMove:null,guidedOral:false,
    phase2:'question',transferQuestion:'',transferRejectedQuestion:'',transferIntent:null,transferPlan:null,transferReply:'',transferChecks:[],transferOral:false
  };
  const choice=(value,allowed)=>allowed.includes(value)?value:null;
  const text=(value,max=900)=>typeof value==='string'?value.slice(0,max):'';
  function loadState(){
    const saved=log.checkpoint.persuade||{};
    return {
      ...defaults,...saved,
      phase0:['choose','rehearse','oral'].includes(saved.phase0)?saved.phase0:'choose',
      initialPlan:choice(saved.initialPlan,L.plans.map(plan=>plan.id)),
      initialReply:text(saved.initialReply),initialUnsure:!!saved.initialUnsure,initialSpoken:!!saved.initialSpoken,
      revisedReply:text(saved.revisedReply),firstOral:!!saved.firstOral,
      phase1:['listen','response','oral'].includes(saved.phase1)?saved.phase1:'listen',
      guidedPlays:Number.isInteger(saved.guidedPlays)&&saved.guidedPlays>=0?Math.min(saved.guidedPlays,99):0,
      guidedInputSeen:!!saved.guidedInputSeen,guidedQuestion:Number.isInteger(saved.guidedQuestion)?saved.guidedQuestion:null,
      guidedReply:text(saved.guidedReply),guidedMove:choice(saved.guidedMove,L.moves.map(move=>move.id)),guidedOral:!!saved.guidedOral,
      phase2:['question','decision','oral'].includes(saved.phase2)?saved.phase2:'question',
      transferQuestion:text(saved.transferQuestion),transferRejectedQuestion:text(saved.transferRejectedQuestion),
      transferIntent:choice(saved.transferIntent,L.transfer.questionIntents.map(intent=>intent.id)),
      transferPlan:choice(saved.transferPlan,L.transfer.plans.map(plan=>plan.id)),transferReply:text(saved.transferReply),
      transferChecks:Array.isArray(saved.transferChecks)?saved.transferChecks.filter(value=>['choice','reply','fact'].includes(value)):[],
      transferOral:!!saved.transferOral
    };
  }
  let state=loadState();
  function save(){log.point({persuade:state});}
  function plan(id){return L.plans.find(item=>item.id===id);}
  function branch(){return L.branches[state.initialPlan]||L.branches.field;}
  function message(value,error=false){const box=host.querySelector('.persuade-message');if(box){box.textContent=value;box.dataset.error=String(error);}}
  function comparableQuestion(value){return String(value||'').toLowerCase().replace(/[^a-z]+/g,' ').trim();}
  function progress(){
    const index=log.index;
    document.querySelectorAll('.persuade-nav li').forEach((item,i)=>{item.classList.toggle('current',i===index);item.classList.toggle('done',i<index);});
  }
  function base(kicker,title,body,actions=''){
    return '<section class="persuade-card"><p class="persuade-label">'+esc(kicker)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<div class="persuade-message" role="status" aria-live="polite"></div>'+actions+'</section>';
  }
  function planCards(items,selected,attr='plan'){
    return '<div class="plan-grid">'+items.map(item=>'<button type="button" class="plan-card" data-'+attr+'="'+esc(item.id)+'" aria-pressed="'+String(selected===item.id)+'"><span class="plan-tag">'+esc(item.tag||item.name)+'</span><b>'+esc(item.name)+'</b><em>'+esc(item.pitch||'')+'</em><ul>'+item.facts.map(fact=>'<li>'+esc(fact)+'</li>').join('')+'</ul></button>').join('')+'</div>';
  }
  function reason(prefix,label,value,unsure=false,placeholder='先大声说，再用键盘或听写补记英文原话。'){
    return '<div class="persuade-reason"><label for="'+prefix+'-text">'+esc(label)+'</label><textarea id="'+prefix+'-text" rows="4" maxlength="900" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea>'+(unsure===null?'':'<label class="reason-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>我暂时还说不出英文，先如实记录</label>')+'</div>';
  }
  function bindText(prefix,key,unsureKey=null){
    const input=host.querySelector('#'+prefix+'-text');
    const unsure=unsureKey?host.querySelector('#'+prefix+'-unsure'):null;
    input.addEventListener('input',()=>{
      state[key]=input.value.slice(0,900);
      if(unsure&&input.value.trim()){state[unsureKey]=false;unsure.checked=false;}
      save();
    });
    if(unsure)unsure.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function chunks(full=false){
    return '<div class="chunk-grid">'+L.chunks.map(chunk=>'<div><b lang="en">'+esc(chunk.term)+'</b>'+(full?'<span>'+esc(chunk.meaning)+'</span>':'')+'</div>').join('')+'</div>';
  }
  function bindHelp(index){F.watchHelp(host,log,index);}
  function speak(textValue,button,status,index){
    state.guidedPlays++;
    state.guidedInputSeen=true;
    save();
    log.note(index,'队友英语播放第'+state.guidedPlays+'次（重听输入材料，不算求助）');
    if(!('speechSynthesis' in window)||typeof window.SpeechSynthesisUtterance!=='function'){
      const transcript=host.querySelector('#guided-transcript');
      if(transcript)transcript.open=true;
      status.textContent='这台设备暂不能播放合成语音，已显示同一份文字。';
      log.note(index,'设备不支持语音播放，自动显示文字稿');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(textValue);
    utterance.lang='en-US';utterance.rate=.88;utterance.pitch=1;
    button.disabled=true;status.textContent='正在播放队友的英语……';
    utterance.onend=()=>{button.disabled=false;status.textContent='听完可以重听；重听不算求助。';};
    utterance.onerror=()=>{button.disabled=false;status.textContent='语音没有成功播放，可以打开同文文字稿继续。';};
    window.speechSynthesis.speak(utterance);
  }
  function renderChoose(){
    const body='<p class="persuade-lead">机器人社团周六上午要完成一次测试。两个方案各有长处；先别找“标准答案”，选你现在更看重的。</p>'+planCards(L.plans,state.initialPlan)+
      reason('initial','先大声说一句，再补记你刚才说的英文',state.initialReply,state.initialUnsure)+
      '<label class="spoken-check"><input id="initial-spoken" type="checkbox" '+(state.initialSpoken?'checked':'')+'>我先开口说了，再补记文字</label><details class="persuade-help" data-help="查看方案词义"><summary>方案里有词看不懂</summary><p><span lang="en">each way</span>：单程；<span lang="en">rough ground</span>：不平的地面；<span lang="en">challenge</span>：挑战任务。</p></details>';
    host.innerHTML=base('第一轮 · 先锁定首选','没有标准答案时，你先选哪个？',body,'<button class="primary" id="initial-submit">留住首选，再看新信息 →</button>');
    host.querySelectorAll('[data-plan]').forEach(button=>button.onclick=()=>{state.initialPlan=button.dataset.plan;host.querySelectorAll('[data-plan]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    bindText('initial','initialReply','initialUnsure');
    host.querySelector('#initial-spoken').onchange=event=>{state.initialSpoken=event.target.checked;save();};
    host.querySelector('#initial-submit').onclick=()=>{
      if(!state.initialPlan){message('先选一个当前更愿意采用的方案。',true);return;}
      const answer=state.initialReply.trim();
      if(!answer&&!state.initialUnsure){message('先留下刚才说的英文；暂时说不出也可以如实勾选。',true);return;}
      if(answer&&!L.meaningfulEnglish(answer,5)){message('再补成一个完整意思：至少说清选择和一个理由。',true);return;}
      const first=plan(state.initialPlan).short+'；'+(answer||'暂时说不出英文');
      log.submit(0,first,null,answer||'暂时说不出英文');
      log.note(0,state.initialSpoken?'孩子自报先口头表达，再补记文字':'未自报先口头表达；本站只保存文字，无法确认是否已经开口');
      state.phase0='rehearse';state.revisedReply=answer;save();render(true);
    };
    bindHelp(0);
  }
  function renderRehearse(){
    const selected=plan(state.initialPlan);
    const body='<p class="persuade-lead">首答已经保存。先看一个不同情境的短示例，再把自己的理由说得更具体。</p><section class="mini-example"><p><b>Different situation</b> · It is raining.</p><p lang="en"><mark>I see your point.</mark> The bus is more <mark>reliable</mark> in the rain, so I would take the bus.</p><small>听见对方 → 指出重要事实 → 给决定。示例没有替你选择机器人方案。</small></section>'+chunks(true)+
      '<p class="selected-note">你刚才选择：<b>'+esc(selected.name)+'</b></p>'+reason('revised','把理由升级成1—2句英文',state.revisedReply,null,"例如：I'd choose Plan A because testing on rough ground matters more to me.")+
      '<details class="persuade-help" data-help="查看首选表达句架"><summary>需要一个起步句架</summary><p lang="en">I’d choose … because … matters more to me.</p><p>只借骨架，理由必须来自你选的方案。</p></details>';
    host.innerHTML=base('示例与独立练习交替','把“我喜欢”升级成具体理由',body,'<button class="primary" id="revised-submit">保存这版，收起文字口头说 →</button>');
    bindText('revised','revisedReply');
    host.querySelector('#revised-submit').onclick=()=>{
      const answer=state.revisedReply.trim();
      if(!L.meaningfulEnglish(answer,6)){message('请用英文说清“选哪个＋哪条事实重要”，至少一个完整短句。',true);return;}
      if(answer!==log.records[0].attempts.at(-1)?.explanation)log.submit(0,plan(state.initialPlan).short+'；'+answer,null,answer);
      state.phase0='oral';save();render(true);
    };
    bindHelp(0);
  }
  function oralBody(textValue,label){
    return '<p class="persuade-lead">点击后文字会收起。网页不录音，也不判断发音；这一步只要求你真正把意思说出来。</p><section class="oral-stage"><p class="spoken-script" lang="en">'+esc(textValue)+'</p><button class="secondary" id="oral-start">收起文字，开始说</button><div id="oral-live" hidden><p>'+esc(label)+'</p><button class="primary" id="oral-done">我说完了</button></div></section>';
  }
  function bindOral(index,key,onDone){
    host.querySelector('#oral-start').onclick=()=>{
      host.querySelector('.spoken-script').hidden=true;
      host.querySelector('#oral-start').hidden=true;
      host.querySelector('#oral-live').hidden=false;
      log.note(index,'收起文字后开始口头表达');
    };
    host.querySelector('#oral-done').onclick=()=>{state[key]=true;save();log.note(index,'孩子自报完成一次不看文字的口头表达；本站未录音核验');onDone();};
  }
  function renderInitialOral(){
    host.innerHTML=base('口语动作 · 不把打字当开口','收起文字，把首选说给队友听',oralBody(state.revisedReply,'说清你的选择和一个具体理由。'));
    bindOral(0,'firstOral',()=>{log.finish(0,'保存了首选与理由，并自报完成一次脱稿口头表达');render(true);});
  }
  function renderListen(){
    const current=branch();
    const body='<p class="persuade-lead">你已经选择 <b>'+esc(plan(state.initialPlan).short)+'</b>。队友会针对这个选择提出真实顾虑；先听，再问一个答案可能改变决定的问题。</p><section class="teammate-card"><span>TEAMMATE</span><p>New concern</p><button class="primary" id="guided-listen">▶ 听队友说</button><p id="guided-audio-status">可以重听；重听不算求助。</p><details id="guided-transcript" data-help="打开队友文字稿"><summary>需要时打开同文文字稿</summary><p lang="en">'+esc(current.teammate)+'</p></details></section><h3>Which question could change the decision?</h3><div class="question-grid">'+current.questions.map((question,index)=>'<button type="button" data-question="'+index+'" aria-pressed="'+String(state.guidedQuestion===index)+'"><span>'+(index+1)+'</span><b lang="en">'+esc(question)+'</b></button>').join('')+'</div><details class="persuade-help" data-help="查看澄清问题提示"><summary>什么叫“问到关键”？</summary><p>答案必须可能改变计划。颜色、喜好等信息即使有趣，也未必影响这次任务。</p></details>';
    host.innerHTML=base('第二步 · 先听顾虑，再问缺口','队友的顾虑，哪一个问题能问到关键？',body,'<button class="primary" id="guided-question-submit">提出这个问题 →</button>');
    const listen=host.querySelector('#guided-listen'),status=host.querySelector('#guided-audio-status');
    listen.onclick=()=>speak(current.teammate,listen,status,1);
    const transcript=host.querySelector('#guided-transcript');
    transcript.addEventListener('toggle',()=>{if(transcript.open){state.guidedInputSeen=true;save();}});
    host.querySelectorAll('[data-question]').forEach(button=>button.onclick=()=>{state.guidedQuestion=Number(button.dataset.question);host.querySelectorAll('[data-question]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    host.querySelector('#guided-question-submit').onclick=()=>{
      if(!state.guidedInputSeen){message('先听队友说，或者打开同文文字稿，再决定问什么。',true);return;}
      if(!Number.isInteger(state.guidedQuestion)){message('先选择一个澄清问题。',true);return;}
      const correct=state.guidedQuestion===current.keyQuestion;
      log.submit(1,current.questions[state.guidedQuestion],correct);
      if(!correct){message('这个答案不太会改变计划。首答已保留，再找时间、费用、天气或任务条件里的关键缺口。',true);return;}
      state.phase1='response';save();render(true);
    };
    bindHelp(1);
  }
  function evidence(){
    const current=branch();
    if(state.initialPlan==='field')return '<section class="constraint-visual"><h3>10:00—12:30的窗口里，雨会在哪一步到来？</h3><div class="time-track"><span style="--share:26.67%">去程 40</span><span style="--share:40%">测试 60</span><span style="--share:26.67%">返程 40</span><span style="--share:6.66%">余量 10</span><i style="left:73.33%">11:50 下雨</i></div><p>'+esc(current.impact)+'</p></section>';
    return '<section class="constraint-visual"><h3>新事实让哪些方向都可行？</h3><div class="adjust-flow"><span>20 yuan each</span><b>→ club covers →</b><span>Leo\'s ticket</span><b>→ stay →</b><span>45-minute challenge works</span></div><p><b>Adjust is optional:</b> the team may choose the shorter 30-minute challenge.</p><p>'+esc(current.impact)+'</p></section>';
  }
  function renderGuidedResponse(){
    const current=branch();
    const body='<section class="answer-card"><span>TEAMMATE ANSWERS</span><p lang="en">'+esc(current.answer)+'</p></section>'+evidence()+
      '<section class="mini-example compact"><p><b>Different situation</b> · Walk or bus?</p><p lang="en"><mark>I see your point.</mark> The rain matters, so <mark>that changes my mind</mark>. Let’s take the bus.</p></section><p class="persuade-lead">现在可以改、调或坚持。方向不计对错；理由必须回应刚得到的新事实。</p><div class="move-grid">'+L.moves.map(move=>'<button type="button" data-move="'+move.id+'" aria-pressed="'+String(state.guidedMove===move.id)+'"><b>'+esc(move.label)+'</b><span>'+esc(move.hint)+'</span></button>').join('')+'</div>'+chunks(true)+reason('guided','写下你准备对队友说的2—3句英文',state.guidedReply,null)+
      '<details class="persuade-help" data-help="查看回应路径句架"><summary>卡住时，看三条回应路径</summary><p lang="en">Change: I see your point. That changes my mind because…</p><p lang="en">Adjust: What if we…? That solves the … problem.</p><p lang="en">Stay: I see your point, but I’d still choose… because… matters more.</p></details>';
    host.innerHTML=base('得到答案 · 把新事实接到决定上','改、调或坚持，都要说清为什么',body,'<button class="primary" id="guided-response-submit">留住回应，收起文字口头说 →</button>');
    host.querySelectorAll('[data-move]').forEach(button=>button.onclick=()=>{state.guidedMove=button.dataset.move;host.querySelectorAll('[data-move]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    bindText('guided','guidedReply');
    host.querySelector('#guided-response-submit').onclick=()=>{
      if(!state.guidedMove){message('先明确你是改变、调整，还是有理由地坚持。',true);return;}
      const answer=state.guidedReply.trim();
      if(!L.meaningfulEnglish(answer,8)){message('再说具体一点：回应队友的一条事实，再给决定。',true);return;}
      log.submit(1,L.moves.find(move=>move.id===state.guidedMove).label+'；'+answer,null,answer);
      log.note(1,'关键问题：'+current.questions[current.keyQuestion]+'；得到回答：'+current.answer);
      state.phase1='oral';save();render(true);
    };
    bindHelp(1);
  }
  function renderGuidedOral(){
    host.innerHTML=base('口语动作 · 像回应队友一样说','收起文字，把决定说给队友听',oralBody(state.guidedReply,'先回应队友的顾虑，再说明你改、调或坚持。'));
    bindOral(1,'guidedOral',()=>{log.finish(1,'问到关键后给出最终回应；开放英语未自动判分');render(true);});
  }
  function transferPlans(interactive=true){
    return '<div class="transfer-plans">'+L.transfer.plans.map(item=>interactive
      ?'<button type="button" data-transfer-plan="'+item.id+'" aria-pressed="'+String(state.transferPlan===item.id)+'"><b>'+esc(item.name)+'</b><ul>'+item.facts.map(fact=>'<li>'+esc(fact)+'</li>').join('')+'</ul></button>'
      :'<article class="plan-card" style="cursor:default"><b>'+esc(item.name)+'</b><ul>'+item.facts.map(fact=>'<li>'+esc(fact)+'</li>').join('')+'</ul></article>').join('')+'</div>';
  }
  function renderTransferQuestion(){
    const body='<p class="persuade-lead">场景和资料形式都变了。科技展上，队友先发来一条消息；组织者只给了一张规则表。</p><div class="transfer-layout"><section class="chat-card"><span>TEAMMATE</span><p lang="en">'+esc(L.transfer.teammate)+'</p></section><table><caption>Science fair rules</caption><tbody>'+L.transfer.ruleRows.map(row=>'<tr><th>'+esc(row[0])+'</th><td>'+esc(row[1])+'</td></tr>').join('')+'</tbody></table></div>'+transferPlans(false)+
      '<p class="persuade-lead"><b>先别决定。</b>规则已经给出时长和网络风险，还缺少哪条会真正改变选择的信息？自己写一个英文问题，再说明它想查哪类信息。</p>'+reason('transfer-question','Your question',state.transferQuestion,null,'自己组织问句；这里不提供完整句架。')+
      '<div class="intent-grid">'+L.transfer.questionIntents.map(intent=>'<button type="button" data-intent="'+intent.id+'" aria-pressed="'+String(state.transferIntent===intent.id)+'">'+esc(intent.label)+'</button>').join('')+'</div><details class="persuade-help" data-help="查看迁移词汇卡"><summary>只看词汇，不看整句</summary><p lang="en">allow · offline · firm limit · without Wi-Fi</p></details>';
    host.innerHTML=base('独立迁移 · 聊天＋规则表','问什么，答案才会影响选择？',body,'<button class="primary" id="transfer-question-submit">把问题交给组织者 →</button>');
    bindText('transfer-question','transferQuestion');
    host.querySelectorAll('[data-intent]').forEach(button=>button.onclick=()=>{state.transferIntent=button.dataset.intent;host.querySelectorAll('[data-intent]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    host.querySelector('#transfer-question-submit').onclick=()=>{
      const question=state.transferQuestion.trim();
      if(!L.looksLikeQuestion(question)){message('请写一个能听出在提问的英文短句，问清可能改变选择的信息。',true);return;}
      if(!state.transferIntent){message('再标出这个问题想查哪类信息，方便自己检查是否问到关键。',true);return;}
      if(state.transferRejectedQuestion&&comparableQuestion(question)===comparableQuestion(state.transferRejectedQuestion)){
        message('不能只换信息标签：请把英文问句也改成真正询问缺失信息的问题。',true);return;
      }
      const relevant=state.transferIntent==='offline';
      const intent=L.transfer.questionIntents.find(item=>item.id===state.transferIntent);
      log.submit(2,'My question: '+question+'；目的：'+intent.label,null,question);
      if(!relevant){
        state.transferRejectedQuestion=question;save();
        log.note(2,'孩子选择的澄清目的：'+intent.label+'；页面只依据这项结构化选择提示它未补上关键缺口，未自动判断英文问句内容');
        message(state.transferIntent==='time'?'5分钟已经写在规则表里；重复确认仍没有问到“是否允许离线视频”。首问已保留，请改写英文问句。':'窗帘颜色不会改变演示方案。首问已保留，请改写英文问句，找出资料里真正缺少的信息。',true);return;
      }
      log.note(2,'最终澄清问题：'+question+'；孩子自选目的：'+intent.label+'；页面未自动判断英文语义或质量');
      state.transferRejectedQuestion='';state.phase2='decision';save();render(true);
    };
    bindHelp(2);
  }
  function renderTransferDecision(){
    const intent=L.transfer.questionIntents.find(item=>item.id===state.transferIntent);
    const checks=[['choice','我明确说出最后选择'],['reply','我回应了队友“现场更精彩”的理由'],['fact','我用了5分钟或Wi-Fi中的具体事实']];
    const body='<section class="answer-card"><span>ORGANIZER ANSWERS</span><p lang="en">'+esc(intent.answer)+'</p></section><p class="persuade-lead">现在自己完成决定。可以选录播，也可以设计兼顾互动的混合方案；现场演示超过5分钟，还依赖可能中断的Wi-Fi。</p>'+transferPlans()+reason('transfer-reply','Your final reply · 2—4 sentences',state.transferReply,null,'不显示完整句架。先回应队友，再把规则连到你的决定。')+
      '<div class="self-checks">'+checks.map(item=>'<label><input type="checkbox" data-check="'+item[0]+'" '+(state.transferChecks.includes(item[0])?'checked':'')+'>'+item[1]+'</label>').join('')+'</div><details class="persuade-help" data-help="查看迁移主动词汇"><summary>需要时，只打开4张主动词汇卡</summary><p lang="en">reliable · adjust · instead · what matters most</p><p>没有完整参考句；用自己的顺序组织。</p></details>';
    host.innerHTML=base('撤掉整句支架 · 自己回应','新事实出现后，你最后怎么选？',body,'<button class="primary" id="transfer-response-submit">留住决定，收起文字口头说 →</button>');
    host.querySelectorAll('[data-transfer-plan]').forEach(button=>button.onclick=()=>{state.transferPlan=button.dataset.transferPlan;host.querySelectorAll('[data-transfer-plan]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    bindText('transfer-reply','transferReply');
    host.querySelectorAll('[data-check]').forEach(input=>input.onchange=()=>{state.transferChecks=[...host.querySelectorAll('[data-check]:checked')].map(item=>item.dataset.check);save();});
    host.querySelector('#transfer-response-submit').onclick=()=>{
      if(!state.transferPlan){message('先明确最后采用哪个方案。',true);return;}
      const item=L.transfer.plans.find(option=>option.id===state.transferPlan);
      const answer=state.transferReply.trim();
      if(!L.meaningfulEnglish(answer,10)){message('再补完整：回应队友，再用时长或Wi-Fi事实说明决定。',true);return;}
      if(state.transferChecks.length!==3){message('先按三项清单回看自己的原话；缺哪一项就只补哪一项。',true);return;}
      if(!L.transfer.validPlans.includes(state.transferPlan)){
        log.submit(2,'Final plan: '+item.name+'；'+answer,null,answer);
        log.note(2,'孩子首选现场演示；页面依据“8分钟超过5分钟上限”提示不合约束，并指出它依赖可能中断的Wi-Fi；未自动判断英文回应内容');
        message('现场方案需要8分钟，超过5分钟上限；它还依赖可能中断的Wi-Fi。首答已保留，可以调整成混合方案。',true);return;
      }
      log.submit(2,'Final plan: '+item.name+'；'+answer,null,answer);
      log.note(2,'孩子自检：明确选择、回应队友、使用具体事实；开放英语内容未自动判分');
      state.phase2='oral';save();render(true);
    };
    bindHelp(2);
  }
  function renderTransferOral(){
    host.innerHTML=base('最后一次 · 新情境脱稿表达','收起文字，用20—30秒完成协商回应',oralBody(state.transferReply,'说清：回应队友 → 关键事实 → 最后决定。'));
    bindOral(2,'transferOral',()=>{log.finish(2,'完成新情境中的澄清、决定与理由；口头表达由孩子自报');render(true);});
  }
  function finish(){
    host.innerHTML='<section class="persuade-card persuade-finish"><p class="persuade-label">E02 · 今天先收好</p><h2 tabindex="-1">被说服不是目标，能根据事实更新决定才是。</h2><div class="bridge-strip"><div><b>E01</b><span lang="en">What do I prefer?</span></div><i>→</i><div><b>E02</b><span lang="en">Did the new fact change my decision? Why?</span></div></div><ul class="takeaway"><li><b lang="en">I see your point.</b> 先让对方知道你听懂了哪条理由。</li><li><b>Ask before deciding.</b> 缺失信息要先问，不能事后编理由。</li><li><b>Change / adjust / stay.</b> 三种方向都可以，决定必须连到新事实。</li></ul><p>这次页面只能证明你留下了哪些文字、选了什么信息并自报开口；它不能证明发音、流利度或隔天仍能独立调用。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="courses.html?group=school">回到 TY敏捷课堂</a><button class="text-button" id="persuade-restart">重新练一轮（保留旧记录）</button></section>'+log.html();
    host.querySelector('#persuade-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);log.save();state={...defaults};render(true);};
    host.querySelector('h2').focus({preventScroll:true});
  }
  function render(focus=false){
    if('speechSynthesis' in window)window.speechSynthesis.cancel();
    progress();
    const index=log.index;
    if(index===L.tasks.length){finish();return;}
    if(index===0){if(state.phase0==='choose')renderChoose();else if(state.phase0==='rehearse')renderRehearse();else renderInitialOral();}
    if(index===1){if(state.phase1==='listen')renderListen();else if(state.phase1==='response')renderGuidedResponse();else renderGuidedOral();}
    if(index===2){if(state.phase2==='question')renderTransferQuestion();else if(state.phase2==='decision')renderTransferDecision();else renderTransferOral();}
    if(focus){host.querySelector('h2')?.focus({preventScroll:true});host.scrollIntoView({block:'start'});}
  }
  window.addEventListener('pagehide',()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();});
  render();
})();
