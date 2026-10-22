'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='qualifier'))LearningFeedback.courses.push(['qualifier',QualifierLesson.title,'qualifier.html']);
const qualifierQuestions=QualifierLesson.questions,qualifierEscape=LearningFeedback.esc;
const qualifierTask=document.querySelector('#qualifier-task');
let qualifierLog=LearningFeedback.create(QualifierLesson.title,qualifierQuestions),qualifierIndex=qualifierLog.index;
function qualifierScene(index){
 if(index===0)return `<p class="scene-kicker">编辑台收到一份估测记录</p><h2>少一个字，多一层意思？</h2><div class="editing-pair"><p><span>原记录</span>机翼长<b>约</b>30厘米。</p><p><span>改写后</span>机翼长30厘米。</p></div><p class="source-note">先判断，再查看原句与改写句的对比。</p>`;
 if(index===1)return `<p class="scene-kicker">12颗已确认，纸包仍未打开</p><h2>把确定的和未知的分开</h2><svg class="seed-box" viewBox="0 0 360 150" role="img" aria-label="盒内有12颗已清点的种子，另有一个未打开的纸包，内容未知"><rect x="18" y="20" width="324" height="110" rx="14"/>${Array.from({length:12},(_,i)=>`<ellipse cx="${42+(i%6)*29}" cy="${55+Math.floor(i/6)*40}" rx="7" ry="10"/>`).join('')}<path d="M231 37H316V115H231Z M231 37L274 72L316 37"/><text x="274" y="100" text-anchor="middle">？</text></svg><p>12颗种子仍在同一盒内。纸包里可能还有，也可能没有。</p><p class="source-note">点击词卡，看看完整句子，再确认。</p>`;
 if(index===2)return `<p class="scene-kicker">记录只有周三这一批</p><h2>“本次”换成“每次”，范围怎样变？</h2><div class="editing-pair"><p><span>原说明</span><b>本次</b>测试全部成功。</p><p><span>拟改写</span><b>每次</b>测试全部成功。</p></div><p>已知周三4次试飞均完成动作，其他日期没有记录。</p>`;
 if(index===3)return `<p class="scene-kicker">一段给定的温度提醒程序</p><h2>0℃属于哪一边？</h2><div class="qualifier-facts"><p><b>低于0℃</b>闪灯</p><p><b>等于或高于0℃</b>常亮</p></div><p>比较“低于”与“不高于”，不要漏掉刚好等于0℃的情况。</p>`;
 return `<p class="scene-kicker">周二的试飞数据</p><h2>接近10分钟，不等于全都精确相同</h2><table class="flight-times"><caption>本次记录</caption><thead><tr><th>模型</th><th>飞行时长</th></tr></thead><tbody><tr><td>甲</td><td>9分58秒</td></tr><tr><td>乙</td><td>10分02秒</td></tr><tr><td>丙</td><td>10分00秒</td></tr><tr><td>另2架</td><td>尚未测试</td></tr></tbody></table><p class="source-note">用给定记录修句子；未测试不是失败的证据。</p>`;
}
function labMarkup(){return `<details class="qualifier-lab" data-help="查看限定词编辑台"><summary>动手改一句：证据还能支持吗？</summary><div class="qualifier-lab-body"><div class="editor-cases">${QualifierLesson.cases.map((c,i)=>`<button data-case="${i}">${c.name}</button>`).join('')}</div><div class="editor-versions"><button data-version="original">看原句</button><button data-version="changed">试着改写</button></div><div id="qualifier-editor"></div><div id="qualifier-battery"><label for="qualifier-level">改变电量 <output id="qualifier-level-label"></output></label><input id="qualifier-level" type="range" min="0" max="40" step="10" value="20"><p>在边界20%试一试，灯仍然闪烁吗？</p></div><p class="editor-method"><b>解释时连起三件事：</b><br>这个词限定什么 → 改写后意思怎样变 → 原材料能否支持。</p><p class="model-note">限定词不是永远不能删。要结合上下文和表达目的；已有信息能否省略，要具体判断。本课比较的是独立说明句能否忠实反映给定材料。只写“体现准确性”，还没有解释这个词在这里的作用。</p></div></details>`;}
function bindLab(){
 const cp=qualifierLog.checkpoint;let index=cp.qualifierCase??0,changed=cp.qualifierChanged??false,level=cp.qualifierLevel??20;
 try{QualifierLesson.state(index,changed,level);}catch{index=0;changed=false;level=20;}
 const slider=document.querySelector('#qualifier-level');
 function draw(){const s=QualifierLesson.state(index,changed,level);document.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.case)===index)));document.querySelectorAll('[data-version]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.version==='changed')===changed)));slider.value=level;document.querySelector('#qualifier-level-label').textContent=level+'%';document.querySelector('#qualifier-battery').hidden=index!==2;
  const sentence=changed?`<mark>${qualifierEscape(s.sentence)}</mark>`:qualifierEscape(s.sentence).replace(qualifierEscape(s.word),`<mark>${qualifierEscape(s.word)}</mark>`);
  document.querySelector('#qualifier-editor').innerHTML=`<p class="editor-source"><b>给定材料</b>${qualifierEscape(s.evidence)}</p><p class="editor-sentence">${sentence}</p>${index===2?`<div class="lamp-display"><span class="lamp ${s.flashing?'flashing':''}" aria-hidden="true"></span><p>当前电量 ${level}%<br>按程序：<b>${s.flashing?'闪烁':'常亮'}</b></p></div>`:''}<p class="editor-explanation" role="status">${qualifierEscape(s.explanation)}</p><p class="editor-note">${qualifierEscape(s.note)}</p>`;
 }
 function update(){qualifierLog.point({qualifierCase:index,qualifierChanged:changed,qualifierLevel:level});qualifierLog.draft(qualifierIndex,{'qualifier-level':String(level)});qualifierLog.help(qualifierIndex,'操作限定词编辑台');draw();}
 document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.case);changed=false;level=20;update();});document.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{changed=b.dataset.version==='changed';update();});slider.oninput=()=>{level=Number(slider.value);update();};draw();
}
function renderQualifier(focus=false){
  document.querySelector('#qualifier-progress').textContent=qualifierIndex===5?'5 题完成':`第 ${qualifierIndex+1} / 5 题`;
  document.querySelector('#qualifier-dots').innerHTML=qualifierQuestions.map((_,i)=>`<i class="${qualifierLog.records[i].done?'done':''} ${i===qualifierIndex?'current':''}"></i>`).join('');
  if(qualifierIndex===5){finishQualifier();return;}
  const q=qualifierQuestions[qualifierIndex],r=qualifierLog.records[qualifierIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=open?'<label for="qualifier-answer">用自己的话，留下你的解释</label><textarea id="qualifier-answer" maxlength="600" rows="4" placeholder="用自己的话，2–3句话就好。"></textarea><label class="reason-unsure"><input id="qualifier-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':`${q.kind==='edit'?'<p class="word-preview" id="qualifier-word-preview" aria-live="polite"></p>':''}<div class="reading-choices ${q.kind==='edit'?'word-cards':''}" role="group" aria-label="${q.kind==='edit'?'选择要填入的词':'选择你的判断'}">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${qualifierEscape(option)}</span></button>`).join('')}</div>`;
  qualifierTask.innerHTML=`<div class="qualifier-layout"><article class="qualifier-scene">${qualifierScene(qualifierIndex)}</article><section class="reading-work qualifier-work"><p class="skill-label">${q.skill}</p><h2 id="qualifier-question" tabindex="-1">${q.title}</h2><p class="qualifier-task-context">${qualifierEscape(q.context)}</p>${entry}<button class="primary" id="submit-qualifier">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="qualifier-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="qualifier-method">暂时不会，看看方法</button>':''}<div id="qualifier-review" hidden></div><div id="qualifier-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-qualifier" disabled>${qualifierIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#qualifier-message'),submit=document.querySelector('#submit-qualifier'),next=document.querySelector('#next-qualifier');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(qualifierIndex!==0||document.querySelector('.qualifier-lab'))return;document.querySelector('#qualifier-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.qualifier-lab');details.addEventListener('toggle',()=>{if(details.open)qualifierLog.help(qualifierIndex,'查看限定词编辑台');});}
  function finishClosed(){qualifierTask.querySelectorAll('[data-choice],#submit-qualifier,#qualifier-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#qualifier-answer').value.trim();if(!text&&!document.querySelector('#qualifier-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#qualifier-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)qualifierLog.submit(qualifierIndex,answer,null,answer);qualifierLog.finish(qualifierIndex,button.dataset.self);qualifierTask.querySelectorAll('textarea,input,#submit-qualifier,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  function previewWord(){if(q.kind==='edit')document.querySelector('#qualifier-word-preview').textContent=selected===null?q.prefix+'【选一个词】'+q.suffix:QualifierLesson.editAnswer(selected);}
  qualifierTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);qualifierTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));previewWord();});previewWord();
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)qualifierLog.submit(qualifierIndex,answer,null,answer);if(first)qualifierLog.help(qualifierIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}
    const answer=q.kind==='edit'?QualifierLesson.editAnswer(selected):q.options[selected],correct=selected===q.answer;
    qualifierLog.submit(qualifierIndex,answer,correct);if(correct){qualifierLog.finish(qualifierIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(qualifierIndex===0)showLab();}
  };
  if(!open)document.querySelector('#qualifier-method').onclick=()=>{if(!r.first)qualifierLog.submit(qualifierIndex,'暂时不会，选择查看方法',false);qualifierLog.help(qualifierIndex,'查看本题方法');qualifierLog.finish(qualifierIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(qualifierTask,qualifierLog,qualifierIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{qualifierIndex++;renderQualifier(true);};
  if(focus){document.querySelector('#qualifier-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishQualifier(){
  qualifierTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题完成，今天就到这里。</h2><p><strong>词语限定什么，要回到材料里说明白。</strong></p><p>精确程度、适用对象、时间和条件都可能影响句意。先说词语的具体含义，再比较改写后的变化，最后用材料判断能否支持。</p><p class="finish-note">2题判断、1题补词、2题解释与改写。参考后的自检不等于独立掌握；以后换一篇文章，也要具体分析；不能把“不能删、体现准确性”当作万能答案。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-qualifier">重新练这5题（保留旧记录）</button></section>${qualifierLog.html()}`;
  document.querySelector('#restart-qualifier').onclick=()=>{qualifierLog=LearningFeedback.create(QualifierLesson.title,qualifierQuestions,true);qualifierLog.save();qualifierIndex=0;renderQualifier(true);};qualifierTask.querySelector('h2').focus({preventScroll:true});
}
renderQualifier();
