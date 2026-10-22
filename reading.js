'use strict';
const readingQuestions=ReadingLesson.questions;
const readingBox=document.querySelector('#reading-task');
const readingEscape=LearningFeedback.esc;
let readingLog=LearningFeedback.create(ReadingLesson.title,readingQuestions);
let readingIndex=readingLog.index;
let methodTimer=0,methodStep=0;
function stopMethod(){clearInterval(methodTimer);methodTimer=0;const button=document.querySelector('#play-method');if(button)button.textContent='播放 12 秒连线演示';}
window.addEventListener('pagehide',stopMethod);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMethod();});
function renderReading(focus=false){
  stopMethod();
  document.querySelector('#reading-progress-label').textContent=readingIndex===5?'5 题完成':`第 ${readingIndex+1} / 5 题`;
  document.querySelector('#reading-dots').innerHTML=readingQuestions.map((_,i)=>`<i class="${readingLog.records[i].done?'done':''} ${i===readingIndex?'current':''}"></i>`).join('');
  if(readingIndex===5){finishReading();return;}
  const q=readingQuestions[readingIndex],r=readingLog.records[readingIndex];
  const choice=q.kind==='choice';
  let selected=Number.isInteger(r.draft?.$choice)&&r.draft.$choice>=0&&r.draft.$choice<(q.options?.length||0)?r.draft.$choice:null;
  const entry=choice?`<div class="reading-choices" role="group" aria-label="选择你的答案">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${q.labels?.[i]||String.fromCharCode(65+i)}</span><span>${readingEscape(option)}</span></button>`).join('')}</div>`:`${q.kind==='evidence'?`<label for="evidence-line">选择你要用的那一句</label><select id="evidence-line"><option value="">先选一句细节</option>${q.passage.lines.map((_,i)=>`<option value="${i}">第 ${i+1} 句</option>`).join('')}</select>`:''}<label for="reading-answer">${q.kind==='evidence'?'这句细节怎样支持“爱护图书”？':'写一个短答案：特点＋细节＋你的解释'}</label><textarea id="reading-answer" maxlength="600" rows="4" placeholder="用自己的话，写 1–3 句话就好；也可用键盘的语音输入。"></textarea><label class="reason-unsure"><input id="reading-unsure" type="checkbox">我暂时说不清，先如实记下来</label>`;
  readingBox.innerHTML=`<div class="reading-layout"><article class="reading-passage" aria-labelledby="passage-title"><h2 id="passage-title">${q.passage.title}</h2><ol>${q.passage.lines.map(line=>`<li>${readingEscape(line)}</li>`).join('')}</ol><p class="passage-origin">原创教学短文 · 句子编号方便找依据</p></article><section class="reading-work" aria-labelledby="reading-question"><p class="skill-label">${q.skill}</p><h2 id="reading-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-reading">${choice?'确认我的判断':'先留下我的答案'}</button><div class="reading-message" id="reading-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${choice?'<button class="text-button" id="show-method">暂时不会，看看方法</button>':''}<div id="reading-review" hidden></div><div id="reading-method" hidden></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-reading" disabled>${readingIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  LearningFeedback.watchHelp(readingBox,readingLog,readingIndex);
  const message=document.querySelector('#reading-message'),submit=document.querySelector('#submit-reading'),next=document.querySelector('#next-reading');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function lockChoice(){readingBox.querySelectorAll('[data-choice],#submit-reading,#show-method').forEach(el=>el.disabled=true);}
  function completedChoice(){lockChoice();say(q.explanation);next.disabled=false;if(readingIndex===0)showEvidenceMethod();}
  function openAnswer(){
    const text=document.querySelector('#reading-answer').value.trim(),unsure=document.querySelector('#reading-unsure').checked;
    const line=q.kind==='evidence'?document.querySelector('#evidence-line').value:'';
    if(!text&&!unsure){say('先留下一点自己的想法；暂时说不清也可以勾选记录。',true);return null;}
    if(q.kind==='evidence'&&line===''&&!unsure){say('先选一句你要用的细节。',true);return null;}
    const explanation=text||'暂时说不清';
    return {answer:q.kind==='evidence'?(line===''?'未选依据':`第 ${Number(line)+1} 句：${q.passage.lines[Number(line)]}`)+'；我的解释：'+explanation:explanation,explanation};
  }
  function showOpenReview(){
    const review=document.querySelector('#reading-review');review.hidden=false;
    review.innerHTML=`<section class="reading-review"><h3>对照看看，不要求和参考一样</h3><p>${q.reference}</p><ul>${q.checks.map(check=>`<li>${check}</li>`).join('')}</ul><p>原话已经保留。想改可以直接改上面的答案，再选下面一项；修改也会另记。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;
    submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{
      const value=openAnswer();if(!value)return;
      if(value.answer!==r.attempts.at(-1)?.answer)readingLog.submit(readingIndex,value.answer,null,value.explanation);
      readingLog.finish(readingIndex,button.dataset.self);
      review.querySelectorAll('[data-self]').forEach(b=>{b.setAttribute('aria-pressed',String(b===button));b.disabled=true;});
      readingBox.querySelectorAll('textarea,select,input,#submit-reading').forEach(el=>el.disabled=true);
      say('这题的原话、修改和自检已保存。开放答案没有自动判分。');next.disabled=false;
    });
  }
  readingBox.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
    selected=Number(button.dataset.choice);
    readingBox.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  });
  submit.onclick=()=>{
    if(choice){
      if(selected===null){say('先选一个判断，再确认。',true);return;}
      const correct=selected===q.answer;readingLog.submit(readingIndex,q.options[selected],correct);
      if(correct){readingLog.finish(readingIndex);completedChoice();}
      else say('这条依据还不能准确回答题目。首答已保留，可以再读材料、修改，或打开提示。',true);
    }else{
      const value=openAnswer();if(!value)return;
      const first=!r.first;
      if(value.answer!==r.attempts.at(-1)?.answer)readingLog.submit(readingIndex,value.answer,null,value.explanation);
      if(first)readingLog.help(readingIndex,'参考答案（提交后）');
      say('你的原话已留下。读完参考后，对照两者的关系，再做一次自检。');showOpenReview();
    }
  };
  if(choice)document.querySelector('#show-method').onclick=()=>{
    if(!r.first)readingLog.submit(readingIndex,'暂时不会，选择查看方法',false);
    readingLog.help(readingIndex,'查看本题方法');readingLog.finish(readingIndex,'看过方法，留待再练');completedChoice();
  };
  if(r.done){if(choice)completedChoice();}
  else if(r.first){if(choice)say('上次的首次答案已保留，可以继续修改或看提示。',true);else{showOpenReview();say('已恢复上次的原话和草稿，完成自检就能继续。');}}
  next.onclick=()=>{readingIndex++;renderReading(true);};
  if(focus){document.querySelector('#reading-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function showEvidenceMethod(){
  const box=document.querySelector('#reading-method');box.hidden=false;
  box.innerHTML='<section class="reading-method"><h3>让证据和答案连起来</h3><p>找到一句有关的话，还要看它是否回答了题目。</p><div class="evidence-chain"><div class="evidence-node"><b>① 对准题目</b>问的是：为什么暂时不去球赛？</div><div class="evidence-node"><b>② 找到直接依据 ↓</b>被叫去球赛时，她说：“等它干一点。”</div><div class="evidence-node"><b>③ 接上解释 ↓</b>“等”说明她想先照看湿书，所以暂时不去。</div></div><p id="method-caption" role="status">可以播放，也可以逐步查看。</p><div class="method-controls"><button class="secondary" id="play-method">播放 12 秒连线演示</button><button class="text-button" id="step-method">逐步看 →</button></div></section>';
  methodStep=-1;
  function draw(step){methodStep=step;box.querySelectorAll('.evidence-node').forEach((el,i)=>el.classList.toggle('active',i<=step));document.querySelector('#method-caption').textContent=['先圈出题目真正要问的内容。','再找能直接回答它的那句话。','最后用自己的话，说清证据与结论的联系。'][step];}
  document.querySelector('#step-method').onclick=()=>{stopMethod();readingLog.help(0,'证据连线演示');draw((methodStep+1)%3);};
  document.querySelector('#play-method').onclick=()=>{
    if(methodTimer){stopMethod();return;}
    readingLog.help(0,'证据连线演示');
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){draw(2);document.querySelector('#method-caption').textContent='已按减少动态效果设置展示完整连线，可用“逐步看”分步阅读。';return;}
    draw(0);document.querySelector('#play-method').textContent='暂停演示';
    methodTimer=setInterval(()=>{if(methodStep===2)stopMethod();else draw(methodStep+1);},4000);
  };
}
function finishReading(){
  readingBox.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>带走一个办法：<strong>看清问什么 → 找到对应细节 → 说清两者的联系。</strong></p><p>证据只能支持到哪里，答案就说到哪里。别把“可能”悄悄写成“一定”。</p><p class="finish-note">3 道判断题已核对；2 道开放题保留了你的表达与自检，没有自动评分。下次换篇材料，才知道方法能不能独立用上。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-reading">重新练这 5 题（保留旧记录）</button></section>${readingLog.html()}`;
  document.querySelector('#restart-reading').onclick=()=>{readingLog=LearningFeedback.create(ReadingLesson.title,readingQuestions,true);readingLog.save();readingIndex=0;renderReading(true);};
  readingBox.querySelector('h2').focus({preventScroll:true});
}
renderReading();
