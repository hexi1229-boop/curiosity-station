'use strict';
(function(){
  const host=document.querySelector('#history-task');
  const L=window.HistoryLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){
    host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p><button class="primary" id="history-refresh">重新打开</button></section>';
    document.querySelector('#history-refresh').onclick=()=>location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload(),{once:true});
    return;
  }
  if(!F.courses.some(course=>course[0]===L.id))F.courses.unshift([L.id,L.title,'history.html']);

  const esc=F.esc;
  const optionText=(items,id)=>items.find(item=>item.id===id)?.text||id||'';
  const defaults={
    openingPhase:'initial',openingChoice:null,openingReason:'',openingUnsure:false,
    revisedChoice:null,revisedReason:'',revisedUnsure:false,
    assignments:{},claimReason:'',claimUnsure:false,claimAttempted:false,
    transferSupport:null,transferUnproved:null,transferReason:'',transferUnsure:false,transferAttempted:false
  };
  let log=F.create(L.title,L.tasks);

  function text(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function oneOf(value,items){return items.some(item=>item.id===value)?value:null;}
  function loadState(){
    const saved=log.checkpoint.history||{};
    const assignments={};
    for(const claim of L.claims){
      if(L.buckets.some(bucket=>bucket.id===saved.assignments?.[claim.id]))assignments[claim.id]=saved.assignments[claim.id];
    }
    return {
      ...defaults,...saved,assignments,
      openingPhase:saved.openingPhase==='review'?'review':'initial',
      openingChoice:oneOf(saved.openingChoice,L.initialOptions),openingReason:text(saved.openingReason),openingUnsure:!!saved.openingUnsure,
      revisedChoice:oneOf(saved.revisedChoice,L.initialOptions),revisedReason:text(saved.revisedReason),revisedUnsure:!!saved.revisedUnsure,
      claimReason:text(saved.claimReason),claimUnsure:!!saved.claimUnsure,claimAttempted:!!saved.claimAttempted,
      transferSupport:oneOf(saved.transferSupport,L.transferSupport),transferUnproved:oneOf(saved.transferUnproved,L.transferUnproved),
      transferReason:text(saved.transferReason),transferUnsure:!!saved.transferUnsure,transferAttempted:!!saved.transferAttempted
    };
  }
  let state=loadState();
  function save(){log.point({history:state});}
  function reasonValue(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function progress(){
    document.querySelectorAll('.parallel-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);
      item.classList.toggle('done',!!log.records[index]?.done);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){host.querySelector('h2')?.focus({preventScroll:true});document.querySelector('.parallel-nav')?.scrollIntoView({block:'start'});}
  function message(value){const box=host.querySelector('#history-message');if(box)box.textContent=value;}
  function card(label,title,body,button){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+title+'</h2>'+body+'<p class="parallel-error" id="history-message" role="status" tabindex="-1"></p>'+button+'</section>';
  }
  function choices(items,selected,name){
    return '<div class="parallel-choices" role="group" aria-label="'+esc(name)+'">'+items.map(item=>'<button type="button" data-choice="'+esc(item.id)+'" aria-pressed="'+String(selected===item.id)+'">'+esc(item.text)+'</button>').join('')+'</div>';
  }
  function reason(prefix,label,value,unsure,placeholder='用一句话说明你依据了哪一处材料；暂时不会也可以如实记录。'){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" maxlength="900" rows="3" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindChoice(key){
    host.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
      state[key]=button.dataset.choice;
      host.querySelectorAll('[data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      save();
    });
  }
  function bindReason(prefix,key,unsureKey){
    const input=host.querySelector('#'+prefix+'-reason'),unsure=host.querySelector('#'+prefix+'-unsure');
    input.addEventListener('input',()=>{state[key]=input.value.slice(0,900);if(input.value.trim()){state[unsureKey]=false;unsure.checked=false;}save();});
    unsure.addEventListener('change',()=>{state[unsureKey]=unsure.checked;save();});
  }
  function bindHelp(index){
    host.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)log.help(index,details.dataset.help);}));
  }
  function sourceCardsTianjin(detailed=false){
    return '<div class="history-materials">'+
      '<article class="history-source"><header><h3>材料 A</h3><span class="source-tag">1905 · 质疑</span></header><blockquote>“非不满于电车，实不满于天津之所以兴办电车也。”</blockquote>'+
      (detailed?'<dl><dt>时间</dt><dd>1905年6月20日</dd><dt>来源</dt><dd>《大公报》刊载的一种意见，据李侃研究转录</dd><dt>对象</dt><dd>这句话针对天津兴办电车的方式</dd><dt>能说明</dt><dd>至少一种当时意见批评的是兴办方式，不是简单拒绝电车技术。</dd></dl><p class="history-transcript">这里展示的是现代研究中的文字转录，不是原报扫描件；它不能代表所有报人或市民。</p>':'<p>这句话是在肯定电车，还是在批评电车？先别急着只看“满不满意”。</p>')+
      '</article><article class="history-source"><header><h3>材料 B</h3><span class="source-tag">1906 · 试运营</span></header><blockquote>“该电车往来次数甚密，搭客甚多，道旁观者如堵。”</blockquote>'+
      (detailed?'<dl><dt>时间</dt><dd>1906年2月16日白牌电车试运营；次日见报</dd><dt>来源</dt><dd>《大公报》本地新闻，据2024年《天津日报》转录</dd><dt>对象</dt><dd>试运营当日的搭客与道旁围观者</dd><dt>能说明</dt><dd>当天电车班次频繁，乘客和围观者很多。</dd></dl><p class="history-transcript">这也是现代文章中的文字转录；“人多”不能自动推出“人人赞成”。</p>':'<p>这句话记录的是态度、现场，还是一项政策的长期结果？</p>')+
      '</article></div>';
  }
  function timeline(){
    return '<ol class="history-timeline" aria-label="天津电车背景时间线"><li><b>1904</b>签订有关电车建设的合同，进入筹办阶段。<small>背景节点，不是态度调查。</small></li><li><b>1905</b>报刊争论与受影响群体的陈情出现。<small>材料A属于这一阶段。</small></li><li><b>1906.2.16</b>白牌电车试运营，现场搭客、围观者很多。<small>材料B只记录这一天的试运营场景。</small></li></ol>';
  }

  function renderOpeningInitial(){
    const body='<p class="parallel-lead">下面两句话都与天津早期电车有关。一份在质疑，一份写得很热闹。先不看分析，你认为最稳妥的判断是哪一个？</p>'+sourceCardsTianjin(false)+choices(L.initialOptions,state.openingChoice,'两份记录的关系')+reason('opening','先写下你这样判断的理由。',state.openingReason,state.openingUnsure);
    host.innerHTML=card('第一环节 · 留住首答','两份记录，必有一份是假的吗？',body,'<button class="primary" id="opening-submit">留下首答，再查时间与来源 →</button>');
    bindChoice('openingChoice');bindReason('opening','openingReason','openingUnsure');
    host.querySelector('#opening-submit').onclick=()=>{
      const why=reasonValue(state.openingReason,state.openingUnsure);
      if(!state.openingChoice){message('先选一个判断。');return;}
      if(!why){message('再留一句理由；暂时说不清也可以勾选。');return;}
      log.submit(0,optionText(L.initialOptions,state.openingChoice),L.gradeInitial(state.openingChoice),why);
      state.openingPhase='review';state.revisedChoice=state.openingChoice;state.revisedReason='';state.revisedUnsure=false;save();
      render();focusCard();
    };
  }
  function renderOpeningReview(){
    const body='<p class="parallel-lead">先把两句话放回各自的时间、来源和观察范围。它们看似冲突，是因为我们刚才把“不同时间里的不同问题”压成了同一道是非题。</p>'+timeline()+sourceCardsTianjin(true)+'<div class="history-revision"><strong>可以同时成立：</strong>1905年，一份报刊意见质疑电车的兴办方式；1906年2月16日试运营当天，电车也确实吸引了很多乘客和围观者。热闹不等于人人赞成，后来的现场也不会抹去先前的争议。</div>'+choices(L.initialOptions,state.revisedChoice,'修订后的判断')+reason('opening-revise','现在用“时间／来源／范围”补全或修改你的解释。',state.revisedReason,state.revisedUnsure,'例如：A记录的是……；B记录的是……；所以两份材料……');
    host.innerHTML=card('第一环节 · 根据出处修订','把话放回当时，冲突还在吗？',body,'<button class="primary" id="opening-finish">收好修订，进入证据台 →</button>');
    bindChoice('revisedChoice');bindReason('opening-revise','revisedReason','revisedUnsure');
    host.querySelector('#opening-finish').onclick=()=>{
      const why=reasonValue(state.revisedReason,state.revisedUnsure);
      if(!state.revisedChoice){message('先留下修订后的判断。');return;}
      if(!why){message('请用时间、来源或范围说一句理由；暂时不会也可以勾选。');return;}
      const correct=L.gradeInitial(state.revisedChoice);
      log.submit(0,optionText(L.initialOptions,state.revisedChoice),correct,why);
      if(!correct){message('再对照一下：1905年的质疑和1906年某一天的热闹，能不能同时发生？');return;}
      log.note(0,'修订时已查看两份材料的时间、来源和可证明范围。');
      log.finish(0,state.revisedUnsure?'还需要帮助':'能用时间和范围解释差异');
      render();focusCard();
    };
  }

  function assignmentButtons(claim){
    const selected=state.assignments[claim.id];
    const attempted=state.claimAttempted;
    return '<div class="history-buckets" role="group" aria-label="为这句话选择证据范围">'+L.buckets.map(bucket=>{
      const isSelected=selected===bucket.id;
      const resultClass=attempted&&isSelected?(bucket.id===claim.expected?' correct':' wrong'):'';
      return '<button type="button" class="'+resultClass.trim()+'" data-claim="'+esc(claim.id)+'" data-bucket="'+esc(bucket.id)+'" aria-pressed="'+String(isSelected)+'">'+esc(bucket.label)+'</button>';
    }).join('')+'</div>';
  }
  function evidenceKey(){
    return '<div class="history-evidence-key"><div><b>A 的边界</b>能支持“至少一种意见质疑兴办方式”，不能代表所有市民。</div><div><b>B 的边界</b>能支持“试运营当日现场很热闹”，不能推出人人赞成。</div><div><b>合看仍有限</b>能看见报刊中的质疑与热闹报道，不能证明反对已经消失。</div></div>';
  }
  function renderClaims(){
    const graded=L.gradeClaims(state.assignments);
    const body='<p class="parallel-lead">不要问“哪份材料比较顺眼”，而要问“这句话需要什么证据”。给每个结论标出它能走到的最远位置。</p>'+sourceCardsTianjin(true)+'<div class="history-grid">'+L.claims.map((claim,index)=>'<article class="history-claim"><p><b>'+(index+1)+'.</b> '+esc(claim.text)+'</p>'+assignmentButtons(claim)+'</article>').join('')+'</div>'+(state.claimAttempted?'<p class="history-score">这次有 <b>'+graded.count+' / '+graded.total+'</b> 个证据范围放对了。红色表示当前选择越过了材料边界；回到原句修订即可。</p>'+evidenceKey():'')+reason('claim','用一句话完成：我保留两份记录，因为A能说明……；B能说明……；两份都不能证明……',state.claimReason,state.claimUnsure)+'<details class="parallel-help" data-help="提示一：先找每份材料直接写到的人、事和时间"><summary>卡住时先看一个问题</summary><p>材料A直接写的是“为什么不满”；材料B直接写的是试运营当天“看见了什么”。先别替材料补上“所有人”“后来都怎样”。</p></details><details class="parallel-help" data-help="提示二：查看两份材料的证据边界"><summary>还需要更具体的提示</summary>'+evidenceKey()+'</details><div class="history-caution"><b>史料不同，不代表它们自动一样可靠。</b>还要查来源、时间、留下它的目的、细节能否核对，并寻找独立材料互证。本课只是证明“两份不同的记录可以同时成立”，没有给任何材料免检通行证。</div>';
    host.innerHTML=card('第二环节 · 证据分拣','每句话，证据够走到哪一步？',body,'<button class="primary" id="claim-submit">检查证据范围 →</button>');
    host.querySelectorAll('[data-claim]').forEach(button=>button.onclick=()=>{
      state.assignments[button.dataset.claim]=button.dataset.bucket;
      state.claimAttempted=false;save();renderClaims();
      host.querySelector('[data-claim="'+button.dataset.claim+'"][data-bucket="'+button.dataset.bucket+'"]')?.focus({preventScroll:true});
    });
    bindReason('claim','claimReason','claimUnsure');bindHelp(1);
    host.querySelector('#claim-submit').onclick=()=>{
      const missing=L.claims.filter(claim=>!state.assignments[claim.id]).length;
      const why=reasonValue(state.claimReason,state.claimUnsure);
      if(missing){message('还有 '+missing+' 个结论没有标出证据范围。');return;}
      if(!why){message('再写一句证据理由；暂时说不清也可以勾选。');return;}
      const result=L.gradeClaims(state.assignments);
      const answer=L.claims.map(claim=>claim.id+'='+state.assignments[claim.id]).join('；');
      log.submit(1,answer,result.correct,why);
      state.claimAttempted=true;save();
      if(!result.correct){renderClaims();message('先看红色选择，再回原句删掉材料没有说出的部分。');host.querySelector('.history-buckets button.wrong')?.focus({preventScroll:true});return;}
      log.note(1,'已把材料A、材料B、合看与不能证明的范围分别标出。');
      log.finish(1,state.claimUnsure?'还需要帮助':'能限制结论范围');
      render();focusCard();
    };
  }

  function qinSources(){
    return '<div class="history-pair"><article class="history-source"><header><h3>材料 C · 实物</h3><span class="source-tag">含公元前221年诏书</span></header><p><b>秦始皇、秦二世双诏版</b></p><blockquote>“及诏丞相状、绾，法度量，则不壹，歉疑者皆明壹之。”</blockquote><p>大意：秦始皇命丞相把度量衡标准中不一致或有疑问的地方明确统一。中国国家博物馆藏；铜版另有秦二世元年诏文，本课只聚焦这一篇。</p><dl><dt>留下者</dt><dd>秦政府</dd><dt>材料时间</dt><dd>这篇诏文与秦统一同年</dd><dt>材料类型</dt><dd>带有官方诏文的铜版实物</dd></dl><p class="history-transcript">诏文用字另与故宫博物院藏同文“秦始皇诏文权”核对；标点为方便阅读所加。</p></article><article class="history-source"><header><h3>材料 D · 史书</h3><span class="source-tag">西汉成书</span></header><blockquote>“一法度衡石丈尺。车同轨。书同文字。”</blockquote><p>司马迁《史记·秦始皇本纪》，记述秦统一制度的措施。</p><dl><dt>编写者</dt><dd>西汉司马迁</dd><dt>材料时间</dt><dd>写作晚于秦统一一百多年</dd><dt>材料类型</dt><dd>后世编写的纪传体史书</dd></dl></article></div>';
  }
  function radioGroup(name,legend,items,selected){
    return '<fieldset><legend>'+esc(legend)+'</legend>'+items.map(item=>'<label class="history-radio"><input type="radio" name="'+esc(name)+'" value="'+esc(item.id)+'" '+(selected===item.id?'checked':'')+'><span>'+esc(item.text)+'</span></label>').join('')+'</fieldset>';
  }
  function renderTransfer(){
    const graded=L.gradeTransfer(state.transferSupport,state.transferUnproved);
    const result=state.transferAttempted?'<div class="history-result '+(graded.correct?'':'bad')+'"><b>'+(graded.correct?'证据范围守住了。':'还有结论越过了证据。')+'</b><br>材料C和D可以互证“秦政府颁布过统一度量衡的命令”；但命令存在、史书记载，都不等于每个地方立刻完全执行。要回答执行速度与范围，还需地方量器、文书、考古层位等更多材料。</div>':'';
    const body='<div class="history-background"><b>背景</b><p>公元前221年，秦完成统一；此前各地的制度与标准并不完全相同。现在不再给你天津电车的分类框架，请独立判断下面两份新材料。</p></div>'+qinSources()+'<div class="history-transfer">'+radioGroup('support','两份材料共同支持哪一个结论？',L.transferSupport,state.transferSupport)+radioGroup('unproved','哪一个说法仍然没有被证明？',L.transferUnproved,state.transferUnproved)+'</div>'+reason('transfer','说清材料C、D各自的一项优势或限制，再解释你的选择。',state.transferReason,state.transferUnsure,'例如：C与事情相隔多久，能说明……；D成书时间是……，还需要……')+'<details class="parallel-help" data-help="秦代迁移提示：把命令存在与执行结果分开"><summary>卡住时看一个提示</summary><p>先把问题拆成两层：第一层是“政府有没有下过命令”；第二层是“各地实际何时、怎样执行”。一份官方命令能直接回答哪一层？</p></details>'+result;
    host.innerHTML=card('第三环节 · 独立迁移','换到秦代，还能守住证据边界吗？',body,'<button class="primary" id="transfer-submit">'+(state.transferAttempted?'修订后再检查':'提交独立判断')+' →</button>');
    host.querySelectorAll('input[name="support"]').forEach(input=>input.onchange=()=>{state.transferSupport=input.value;state.transferAttempted=false;save();});
    host.querySelectorAll('input[name="unproved"]').forEach(input=>input.onchange=()=>{state.transferUnproved=input.value;state.transferAttempted=false;save();});
    bindReason('transfer','transferReason','transferUnsure');bindHelp(2);
    host.querySelector('#transfer-submit').onclick=()=>{
      const why=reasonValue(state.transferReason,state.transferUnsure);
      if(!state.transferSupport||!state.transferUnproved){message('两个判断都要留下选择。');return;}
      if(!why){message('再写一句材料的优势或限制；暂时说不清也可以勾选。');return;}
      const result=L.gradeTransfer(state.transferSupport,state.transferUnproved);
      log.submit(2,'共同支持：'+optionText(L.transferSupport,state.transferSupport)+'；不能证明：'+optionText(L.transferUnproved,state.transferUnproved),result.correct,why);
      state.transferAttempted=true;save();
      if(!result.correct){renderTransfer();message('把“发布命令”和“各地实际执行”拆开，再修订一次。');host.querySelector('#history-message')?.focus({preventScroll:true});return;}
      log.note(2,'独立迁移使用了同时代实物与后世史书，并保留执行范围的不确定性。');
      log.finish(2,state.transferUnsure?'还需要帮助':'能在新情境限制结论');
      render();focusCard();
    };
  }

  function renderComplete(){
    host.innerHTML='<section class="parallel-card"><p class="parallel-label">调查完成 · 方法可以带走</p><h2 tabindex="-1">历史不是选一句相信，而是搭一条能复查的证据链。</h2><div class="history-method"><h3>遇到两份不同记录，按这个顺序查</h3><ol><li>放回时间与地点</li><li>看谁留下、为何留下</li><li>只说材料直接支持的范围</li><li>找独立材料互证</li><li>保留仍不确定的部分</li></ol></div><p class="parallel-takeaway">天津材料告诉我们：争议与热闹可以同时存在。秦代材料告诉我们：<b>颁布命令</b>和<b>实际执行</b>是两个需要不同证据的问题。</p><div class="history-caution">这套方法不会保证所有记录都可信。它的作用，是让你知道下一步该查什么，也让结论不超过证据。</div><div class="parallel-actions"><a class="primary" href="records.html">查看本次学习记录</a><button class="secondary" id="history-restart" type="button">重新练一轮（保留旧记录）</button><a class="secondary" href="courses.html?group=school">返回课程库</a></div></section>'+log.html();
    host.querySelector('#history-restart').onclick=()=>{
      log=F.create(L.title,L.tasks,true);
      state={...defaults,assignments:{}};
      save();render();focusCard();
    };
  }
  function render(){
    progress();
    if(log.index>=L.tasks.length){renderComplete();progress();return;}
    if(log.index===0){if(state.openingPhase==='initial')renderOpeningInitial();else renderOpeningReview();}
    else if(log.index===1)renderClaims();
    else renderTransfer();
    progress();
  }
  render();
})();
