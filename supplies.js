'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='supplies'))LearningFeedback.courses.push(['supplies',SuppliesLesson.title,'supplies.html']);
const suppliesQuestions=SuppliesLesson.questions,suppliesEscape=LearningFeedback.esc;
const suppliesTask=document.querySelector('#supplies-task');
let suppliesLog=LearningFeedback.create(SuppliesLesson.title,suppliesQuestions),suppliesIndex=suppliesLog.index;
function picnicBag(){return '<svg class="supply-picture" viewBox="0 0 340 160" role="img" aria-label="一只等待装入物资的野餐包，图片不提供清单数量"><path d="M45 58H295L273 140H67Z" fill="#e9d8b8" stroke="#ad9370" stroke-width="3"/><path d="M110 60Q110 12 170 12Q230 12 230 60" fill="none" stroke="#779b87" stroke-width="8"/><path d="M95 72L106 125M145 72L148 125M195 72L192 125M245 72L234 125" stroke="#ceb88e" stroke-width="4"/></svg>';}
function suppliesScene(index){
 if(index===0)return `<h2>听同伴准备野餐</h2>${picnicBag()}<label class="audio-label" for="supplies-audio">英语示范 · 约7秒 · 可重复播放</label><audio id="supplies-audio" controls preload="metadata" src="assets/audio/picnic-supplies.m4a" aria-label="野餐物资清单的英语示范"></audio><p id="supplies-audio-error" role="status" hidden>音频暂时无法播放，可以展开下方原文继续。</p><p>先听一遍，看看哪些数量已经说清。听不清也可以读原文。</p><details class="reading-hint" data-help="查看英文原文"><summary>需要时，看英文原文</summary><p class="english-line" lang="en">${suppliesEscape(SuppliesLesson.story)}</p></details>`;
 if(index===1)return `<h2>给同伴一条完整说明</h2><div class="speech-bubble">我需要两瓶水。</div>${picnicBag()}<p>把需要的东西说准确，同伴才能照着准备。</p>`;
 if(index===2)return `<h2>这三片，是从面包切下来的</h2><svg class="supply-picture bread-picture" viewBox="0 0 340 160" role="img" aria-label="三片切好的面包，不是三条完整面包">${[0,1,2].map(i=>`<path transform="translate(${i*97} 0)" d="M24 68Q15 32 65 32Q109 32 100 68V127H24Z"/>`).join('')}<text x="170" y="153" text-anchor="middle">三片，不是三整条</text></svg><p class="english-line wrong-sentence" lang="en">I need three bread.</p><p>修好这句，再解释数字实际在数什么。</p>`;
 if(index===3)return `<h2>同一种饮品，两种问题</h2><div class="supply-facts"><p><b>第一问</b>需要多少牛奶？</p><p><b>第二问</b>需要几杯牛奶？</p></div><p>milk：牛奶　cup：杯子</p><p>看清问题关注的是饮品的量，还是盛装单位的个数。</p>`;
 return `<h2>把新清单说给同伴</h2><div class="supply-facts"><p><b>2 杯</b>牛奶 · milk</p><p><b>3 根</b>完整香蕉 · banana</p><p><b>再问一句</b>还需要多少面包？</p></div><p>先大声说2–3句，再留下刚才的原话。可以用键盘语音输入补记。</p><p class="source-note">这里不录音。文字与自检不能自动证明发音或流利度。</p>`;
}
function wordMarkup(){return `<details class="reading-hint" data-help="词汇小卡"><summary>需要时，看看词汇小卡</summary><div class="supplies-words">${SuppliesLesson.words.map(w=>`<div><b lang="en">${w.word}</b><span>${w.meaning}</span><small lang="en">${w.example}</small></div>`).join('')}</div></details>`;}
function orderMarkup(){return `<div id="supplies-assembled" class="supplies-assembled" role="group" aria-label="已组成的物资说明"></div><p id="supplies-order-status" class="order-status" role="status"></p><div class="supplies-bank" role="group" aria-label="可用词牌">${SuppliesLesson.bank.map(id=>`<button type="button" data-token="${id}" lang="en">${suppliesEscape(SuppliesLesson.tokens[id])}</button>`).join('')}</div><div class="order-tools"><button type="button" class="text-button" id="supplies-undo">撤销最后一块</button><button type="button" class="text-button" id="supplies-clear">清空重排</button></div>`;}
function labMarkup(){return `<details class="supplies-lab" data-help="查看瓶数与水量模型"><summary>动手分装：瓶子多了，水也变多了吗？</summary><div class="supplies-lab-body"><p>同样的1升水，平均分进相同的瓶子。每瓶最大能装1升，水不洒出，也不添加。</p><label for="supplies-split">拖动改变瓶数 <output id="supplies-count"></output></label><input id="supplies-split" type="range" min="0" max="2" step="1" value="0" aria-label="分装瓶数，1、2或4瓶"><div class="supplies-view-buttons">${SuppliesLesson.counts.map((n,i)=>`<button data-view="${i}" type="button">${n}瓶</button>`).join('')}</div><div id="supplies-view" aria-live="polite"></div><p class="source-note">本课用完整数量表达。点餐时有时会用 two waters 简称两份水，但那是特定语境中的省略，不作为本课完整清单的写法。名词的用法要结合语境；“不可数”不等于现实中不能测量。其他特殊复数另学。</p></div></details>`;}
function bindLab(){
 let index=suppliesLog.checkpoint.suppliesView??0;try{SuppliesLesson.view(index);}catch{index=0;}
 const slider=document.querySelector('#supplies-split');
 function draw(){const s=SuppliesLesson.view(index);slider.value=index;slider.setAttribute('aria-valuetext',s.count+'瓶');document.querySelector('#supplies-count').textContent=s.count+'瓶';const start=(340-s.count*65)/2;
 document.querySelector('#supplies-view').innerHTML=`<svg class="water-model" viewBox="0 0 340 205" role="img" aria-label="${s.count}个相同瓶子，每瓶装${s.perBottle}毫升，总水量1000毫升">${Array.from({length:s.count},(_,i)=>`<g transform="translate(${start+i*65} 0)"><path class="bottle-shell" d="M21 21H39V42L51 57V164H9V57L21 42Z"/><rect class="water-fill" x="11" y="${162-104/s.count}" width="38" height="${104/s.count}"/><path class="bottle-cap" d="M21 19H39V28H21Z"/><text x="30" y="189" text-anchor="middle">${s.perBottle} mL</text></g>`).join('')}</svg><p class="english-line view-sentence" lang="en">${s.parts.map((p,i)=>i===1?`<strong>${p}</strong>`:p).join('')}</p><div class="supply-facts"><p><b>问几瓶</b><span lang="en">${s.question}</span><br>${s.count}瓶</p><p><b>问多少水</b><span lang="en">${s.amountQuestion}</span><br>仍然是1升</p></div><p class="unit-note">${s.count===1?'one 后用单数 bottle。':'数的是瓶子，'+s.count+'瓶用复数 bottles。'} water仍表示同样的水。瓶数增加，每瓶的水减少，总量没有变。</p>`;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.view)===index)));}
 function update(){suppliesLog.point({suppliesView:index});suppliesLog.draft(suppliesIndex,{'supplies-split':String(index)});suppliesLog.help(suppliesIndex,'操作分装模型');draw();}
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.view);update();});slider.oninput=()=>{index=Number(slider.value);update();};draw();
}
function renderSupplies(focus=false){
  suppliesTask.querySelectorAll('audio').forEach(audio=>audio.pause());
  document.querySelector('#supplies-progress').textContent=suppliesIndex===5?'5 题完成':`第 ${suppliesIndex+1} / 5 题`;
  document.querySelector('#supplies-dots').innerHTML=suppliesQuestions.map((_,i)=>`<i class="${suppliesLog.records[i].done?'done':''} ${i===suppliesIndex?'current':''}"></i>`).join('');
  if(suppliesIndex===5){finishSupplies();return;}
  const q=suppliesQuestions[suppliesIndex],r=suppliesLog.records[suppliesIndex],open=q.kind==='open';
  let order=SuppliesLesson.validOrder(suppliesLog.checkpoint.suppliesOrder)?[...suppliesLog.checkpoint.suppliesOrder]:[];
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${suppliesEscape(option)}</span></button>`).join('')}</div>`:open?`<label for="supplies-answer">${suppliesIndex===4?'先开口，再留下刚才的2–3句英语':'留下你的解释（中文或英语都可以）'}</label><textarea id="supplies-answer" maxlength="600" rows="4" placeholder="用自己的话，不必照搬示范。"></textarea><label class="reason-unsure"><input id="supplies-unsure" type="checkbox">我暂时说不清，先如实记下来</label>`:orderMarkup();

  suppliesTask.innerHTML=`<div class="supplies-layout"><article class="supplies-scene">${suppliesScene(suppliesIndex)}</article><section class="reading-work supplies-work"><p class="skill-label">${q.skill}</p><h2 id="supplies-question" tabindex="-1">${q.title}</h2>${suppliesIndex===0?'':`<p class="supplies-context">${suppliesEscape(q.context)}</p>`}${entry}<button class="primary" id="submit-supplies">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="supplies-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${wordMarkup()}${!open?'<button class="text-button" id="supplies-method">暂时不会，看看方法</button>':''}<div id="supplies-review" hidden></div><div id="supplies-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-supplies" disabled>${suppliesIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#supplies-message'),submit=document.querySelector('#submit-supplies'),next=document.querySelector('#next-supplies');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(suppliesIndex!==0||document.querySelector('.supplies-lab'))return;document.querySelector('#supplies-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.supplies-lab');details.addEventListener('toggle',()=>{if(details.open)suppliesLog.help(suppliesIndex,'查看瓶数与水量模型');});}
  function finishClosed(){suppliesTask.querySelectorAll('[data-choice],[data-token],[data-remove],#supplies-clear,#supplies-undo,#submit-supplies,#supplies-method').forEach(el=>el.disabled=true);if(q.kind==='order')document.querySelector('#supplies-order-status').textContent='本题已记录；首答、订正和求助情况已保留。';say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#supplies-answer').value.trim();if(!text&&!document.querySelector('#supplies-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#supplies-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)suppliesLog.submit(suppliesIndex,answer,null,answer);suppliesLog.finish(suppliesIndex,button.dataset.self);suppliesTask.querySelectorAll('textarea,input,#submit-supplies,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  suppliesTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);suppliesTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)suppliesLog.submit(suppliesIndex,answer,null,answer);if(first)suppliesLog.help(suppliesIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{correct=SuppliesLesson.checkOrder(order);if(correct===null){say('选出6块词牌组成完整句子，再核对。',true);return;}answer=SuppliesLesson.sentence(order);}
    suppliesLog.submit(suppliesIndex,answer,correct);if(correct){suppliesLog.finish(suppliesIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(suppliesIndex===0)showLab();}
  };
  if(!open)document.querySelector('#supplies-method').onclick=()=>{if(!r.first)suppliesLog.submit(suppliesIndex,'暂时不会，选择查看方法',false);suppliesLog.help(suppliesIndex,'查看本题方法');suppliesLog.finish(suppliesIndex,'看过方法，留待再练');finishClosed();};
  if(q.kind==='order'){
    function drawOrder(){
      document.querySelector('#supplies-assembled').innerHTML=order.length?order.map((id,i)=>`<button type="button" data-remove="${i}" aria-label="移除第${i+1}块 ${suppliesEscape(SuppliesLesson.tokens[id])}" lang="en">${suppliesEscape(SuppliesLesson.tokens[id])}</button>`).join(''):'<span>点下面的词牌，按顺序放进这里。</span>';
      suppliesTask.querySelectorAll('[data-token]').forEach(button=>{button.disabled=order.includes(Number(button.dataset.token))||order.length===6;});
      document.querySelector('#supplies-order-status').textContent=`已选 ${order.length} / 6 块。点上面的词牌可以移除。`;
      document.querySelector('#supplies-undo').disabled=!order.length;document.querySelector('#supplies-clear').disabled=!order.length;
      suppliesTask.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{order.splice(Number(button.dataset.remove),1);saveOrder();});
    }
    function saveOrder(){suppliesLog.point({suppliesOrder:[...order]});suppliesLog.draft(suppliesIndex,{'组句草稿':SuppliesLesson.sentence(order)});drawOrder();(suppliesTask.querySelector('[data-token]:not(:disabled)')||document.querySelector('#submit-supplies')).focus({preventScroll:true});}
    suppliesTask.querySelectorAll('[data-token]').forEach(button=>button.onclick=()=>{const id=Number(button.dataset.token);if(order.includes(id)||order.length>=6)return;order.push(id);saveOrder();});
    document.querySelector('#supplies-undo').onclick=()=>{order.pop();saveOrder();};document.querySelector('#supplies-clear').onclick=()=>{order=[];saveOrder();};drawOrder();
  }
  const audio=document.querySelector('#supplies-audio');
  if(audio){audio.addEventListener('play',()=>{const count=(suppliesLog.checkpoint.suppliesAudioPlays||0)+1;suppliesLog.point({suppliesAudioPlays:count});suppliesLog.note(suppliesIndex,`示范音频开始播放 ${count} 次；不代表听完或听懂。`);});audio.addEventListener('error',()=>{document.querySelector('#supplies-audio-error').hidden=false;});}
  LearningFeedback.watchHelp(suppliesTask,suppliesLog,suppliesIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{suppliesIndex++;renderSupplies(true);};
  if(focus){document.querySelector('#supplies-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishSupplies(){
  suppliesTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p>先找你正在数什么，再决定数字、单位和复数。</p><div class="finish-pair"><p><b>数瓶子</b><span lang="en">two bottles of water</span></p><p><b>数面包片</b><span lang="en">three slices of bread</span></p></div><p class="finish-note">2题判断、1题组句、2题解释和开口迁移。瓶数不等于水的总量；参考后的自检不等于已经独立掌握，文字也不能自动判断发音。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-supplies">重新练这5题（保留旧记录）</button><details class="reading-hint"><summary>家长参考：课程依据</summary><p>对应2022英语课标中可数/不可数名词、语境词汇语法和口头表达的局部要求。语法核对：<a href="https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/nouns-countable-uncountable" target="_blank" rel="noopener">British Council · 可数与不可数名词</a>、<a href="https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice/much-many" target="_blank" rel="noopener">How much 与 How many</a>。情境、题目和图示原创，音频为合成语音。</p></details></section>${suppliesLog.html()}`;
  document.querySelector('#restart-supplies').onclick=()=>{suppliesLog=LearningFeedback.create(SuppliesLesson.title,suppliesQuestions,true);suppliesLog.save();suppliesIndex=0;renderSupplies(true);};suppliesTask.querySelector('h2').focus({preventScroll:true});
}
renderSupplies();
