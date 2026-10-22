'use strict';
const stage = document.querySelector('#exercise');
const labels = ['听懂意思','词组应用','表达选择','解决麻烦','换个场景'];
const feedbackLog=LearningFeedback.create('英语 · 机器狗，还是一只真狗？',labels.map((title,i)=>({title,context:['听示范后判断说话者的选择与理由。','I need to ____ my dog every day.','Would you rather have a robot dog or a real dog? Why?','Your robot dog runs out of power in the park. What would you do?','Would you rather play a sport or play a video game this weekend? Why?'][i]})));
const firstRecordings=Array(5).fill(null);
const recordedFirst=Array(5).fill(false);
let audioPlays=0;
const scriptText = "I would rather have a robot dog. I could take care of it, and it could explore with me. But what if it runs out of power?";
let step = 0;
let selected = null;
let recorder = null;
let stream = null;
let clock = null;
let requestId = 0;
let recordings = [];
let pending = false;
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stopTracks() { if (stream) stream.getTracks().forEach(track => track.stop()); stream = null; }
function stopRecording() {
  clearInterval(clock);
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  stopTracks();
}
function leaveTask() {
  requestId++;
  pending = false;
  stopRecording();
  stage.querySelectorAll('audio').forEach(audio => audio.pause());
}
function progress() {
  document.querySelector('#steps').innerHTML = labels.map((label, i) => `<li class="${i < step ? 'done' : i === step ? 'current' : ''}"${i === step ? ' aria-current="step"' : ''}>${i < step ? '✓' : i + 1} ${label}</li>`).join('');
}
function footer(label, disabled = false) {
  return `<div class="next-row"><span>${step + 1} / 5 · ${step < 4 ? '还有 ' + (4-step) + ' 个小任务' : '最后一步，轻松收尾'}</span><button class="primary" id="next"${disabled ? ' disabled' : ''}>${label} →</button></div>`;
}
function words() {
  return `<div class="word-cards"><div class="word"><strong lang="en">I’d rather…</strong><span>我更想……</span><small>I’d = I would<br>后面接动词原形</small></div><div class="word"><strong lang="en">take care of</strong><span>照顾、照料</span><small>take care of a dog</small></div><div class="word"><strong lang="en">run out of</strong><span>用完、耗尽</span><small>run out of power / time</small></div></div>`;
}
function recorderUI() {
  return `<div class="recorder"><div class="recorder-head"><span>说一说，听听自己</span><span class="record-time" id="record-time">建议 20–30 秒</span></div><div class="recorder-buttons"><button class="record-button" id="record"><span class="dot" aria-hidden="true"></span>录一段</button><button class="text-button" id="erase" hidden>删除录音</button></div><audio id="playback" controls hidden aria-label="回听我的录音"></audio><p id="record-status" class="record-status" role="status">想录音时才会请求麦克风权限，45 秒自动停止。</p></div>`;
}
function render(focus = true) {
  leaveTask();
  selected = null;
  progress();
  if (step < 2) renderChoice();
  else if (step < 5) renderSpeaking();
  else renderFinish();
  if (focus) document.querySelector('#task-title')?.focus({preventScroll:true});
  stage.querySelector('#next')?.addEventListener('click', () => {step++; render(); stage.scrollIntoView({behavior:'auto',block:'start'});});
}
function renderChoice() {
  const first = step === 0;
  const choices = first ? ['他更想要机器狗，还想和它一起探索。','他喜欢真狗，因为不需要照顾它。','他不喜欢宠物，只想买一块电池。'] : ['run out of','take care of','would rather'];
  stage.innerHTML = `<p class="task-kicker">${first ? '01 / LISTEN' : '02 / WORDS IN ACTION'}</p><h2 id="task-title" tabindex="-1">${first ? '先听听他的想法' : '照顾它，用哪个词组？'}</h2><p class="task-intro">${first ? '先不看文字，听一遍。抓住“选什么”和“为什么”就够了。' : '把词组放进句子里，再大声读出完整的一句。'}</p>${first ? `<div class="audio-block"><label for="model-audio">英文示范 · 可重复播放</label><audio id="model-audio" controls preload="metadata" src="assets/audio/robot-dog.m4a" aria-label="机器狗话题英语示范"></audio><p class="audio-fallback" id="audio-error" hidden>音频暂时无法播放。可以先看原文，试着读出来。</p></div><details data-help="英文原文"><summary>需要时，再看英文原文</summary><p lang="en">${scriptText}</p></details><p class="task-intro">哪一句最接近他的意思？</p>` : `<details data-help="词组卡与释义"><summary>需要时，看看词组卡</summary>${words()}</details><p class="english-prompt" lang="en">I need to <span class="blank">_____</span> my dog every day.</p><p class="tip">我每天都需要照顾我的狗。</p>`}<div class="answers" role="group" aria-label="选择答案">${choices.map((choice,i)=>`<button class="answer" data-choice="${i}" aria-pressed="false">${String.fromCharCode(65+i)}. ${esc(choice)}</button>`).join('')}</div><p class="feedback" id="feedback" role="status"></p>${footer('继续',true)}`;
  LearningFeedback.watchHelp(stage,feedbackLog,step);
  stage.querySelector('#model-audio')?.addEventListener('play',()=>{audioPlays++;});
  stage.querySelector('#model-audio')?.addEventListener('error', () => {document.querySelector('#audio-error').hidden = false;});
  stage.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    selected = Number(button.dataset.choice);
    stage.querySelectorAll('[data-choice]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    const correct = selected === (first ? 0 : 1);
    feedbackLog.submit(step,choices[selected],correct);
    if(first)feedbackLog.note(step,`本次提交时，示范音频已播放 ${audioPlays} 次。播放本身不算提示。`);
    const feedback = stage.querySelector('#feedback');
    feedback.className = 'feedback' + (correct ? '' : ' error');
    feedback.textContent = correct ? (first ? '听到了！他偏爱机器狗，理由是能一起探索。最后还问了一句：没电了怎么办？' : '对！I need to take care of my dog every day. 试着连起来说：take care of，而不是一个词一个词地蹦出来。') : (first ? '再听一次 would rather have 和 explore with me。也可以展开原文看看。' : '这里需要“照顾”。run out of 是“用完”；would rather 后面直接跟动词，不能放在这里。再选一次。');
    stage.querySelector('#next').disabled = !correct;
    if(correct){feedbackLog.finish(step);stage.querySelectorAll('[data-choice]').forEach(el=>el.disabled=true);}else feedbackLog.help(step,'答错后的提示');
  }));
}
function renderSpeaking() {
  const tasks = {
    2: {kicker:'03 / YOUR CHOICE',title:'现在，轮到你选择',intro:'选机器狗或真狗都行。用两句话说清选择和一个理由。',prompt:'Would you rather have a robot dog or a real dog? Why?',hint:'I’d rather have a ___ because ___. I could ___.',sample:'I’d rather have a real dog because it can be my friend. I’d take care of it every day.',checks:['我说出了自己的选择。','我给了一个理由，而不只是说 “I like it.”。']},
    3: {kicker:'04 / WHAT IF…?',title:'糟糕，机器狗没电了',intro:'你正和机器狗在公园探险。它突然停了，家还很远。你准备怎么做？',prompt:'Your robot dog runs out of power in the park. What would you do?',hint:'If it runs out of power, I could ___. / I would ___ because ___.',sample:'If it runs out of power, I could carry it home. Next time, I’d bring a charger.',checks:['我说清楚了“没电”这个问题。','我用英语提出了一个可行的办法。']},
    4: {kicker:'05 / TRY A NEW SCENE',title:'换个场景，还会用吗？',intro:'这次不聊宠物。周末你更想打球，还是玩游戏？先试着独立说，再按需打开提示。',prompt:'Would you rather play a sport or play a video game this weekend? Why?',hint:'I’d rather ___ because ___. 还可以加一句：I don’t want to run out of time.（我不想没时间。）',sample:'I’d rather play basketball because I want to be outside. I’ll finish my homework first so I don’t run out of time.',checks:['我把 I’d rather… 用到了新的场景。','我补充了自己的理由或计划。']}
  };
  const task = tasks[step];
  stage.innerHTML = `<p class="task-kicker">${task.kicker}</p><h2 id="task-title" tabindex="-1">${task.title}</h2><p class="task-intro">${task.intro}</p><p class="english-prompt" lang="en">${task.prompt}</p><details data-help="句子开头"><summary>卡住了？借一个句子开头</summary><p lang="en">${task.hint}</p></details>${recorderUI()}${LearningFeedback.reasonField(step===4?'留下一句你刚才说的英语和理由':'刚才怎么说的？可记一句原话（选填）',step===4?'一句就够，例如自己的选择和理由；也可用语音输入。':'可直接开口；不写时，反馈会注明没有文字证据。')}<button class="primary" id="save-speech">记下这次表达，再看示范</button><p id="speech-status" role="status" class="tip"></p><div id="speech-review" hidden></div>${footer(step===4?'查看学习反馈':'下一题',true)}`;
  LearningFeedback.watchHelp(stage,feedbackLog,step);
  stage.querySelector('#record').onclick=record;
  stage.querySelector('#erase').onclick=()=>erase();
  stage.querySelector('#save-speech').onclick=()=>{
    const own=LearningFeedback.readReason(stage);
    if(step===4&&!own){stage.querySelector('#speech-status').textContent='留下一句刚才的原话，方便回看；暂时说不清也可以如实勾选。';return;}
    if(!feedbackLog.records[step].first)feedbackLog.submit(step,own||'自报已口述；未保留文字或录音',null);
    else if(own)feedbackLog.note(step,'口述补记（自己填写，未自动核对录音）：'+own);
    stage.querySelectorAll('#record,#erase,#my-reason,#reason-unsure,#save-speech').forEach(el=>el.disabled=true);
    const review=stage.querySelector('#speech-review');review.hidden=false;
    review.innerHTML=`<div class="evidence-review"><b>一种示范，答案可以不同</b><p lang="en">${task.sample}</p><ul>${task.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>对照刚才的表达，自己判断；没有自动语音评分。</p><div class="evidence-self"><button data-self="能说清（自评）">我能说清</button><button data-self="还需要帮助">我还需要帮助</button></div></div>`;
    feedbackLog.help(step,'示范表达（提交后）');
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{feedbackLog.finish(step,button.dataset.self);review.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));stage.querySelector('#next').disabled=false;});
  };
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    stage.querySelector('#record').disabled = true;
    stage.querySelector('#record-status').textContent = '当前浏览器无法录音。直接说或留一句文字，一样可以完成。';
  }
}
function updateNext() {
  const save=stage.querySelector('#save-speech');
  if(save&&!feedbackLog.records[step]?.done)save.disabled=pending||!!(recorder&&recorder.state!=='inactive');
}

function erase(preserveFirst=false) {
  const playback = stage.querySelector('#playback');
  if (!playback) return;
  playback.pause();
  const url = playback.getAttribute('src');
  if(url&&(!preserveFirst||firstRecordings[step]!==url)){URL.revokeObjectURL(url);recordings=recordings.filter(value=>value!==url);}
  if(!preserveFirst&&firstRecordings[step]){URL.revokeObjectURL(firstRecordings[step]);recordings=recordings.filter(value=>value!==firstRecordings[step]);firstRecordings[step]=null;feedbackLog.note(step,'首次录音已由本人删除；不再提供回听。');}
  playback.removeAttribute('src'); playback.load(); playback.hidden = true;
  stage.querySelector('#erase').hidden = true;
  stage.querySelector('#record-status').textContent = '录音已删除。可以再说一次。';
}
async function record() {
  if (pending) return;
  if (recorder && recorder.state !== 'inactive') {stopRecording();return;}
  const id = ++requestId;
  const button = stage.querySelector('#record');
  const status = stage.querySelector('#record-status');
  const playback = stage.querySelector('#playback');
  const time = stage.querySelector('#record-time');
  pending = true;
  button.disabled = true;
  updateNext();
  status.textContent = '正在等待麦克风权限…也可以不录音，直接开口完成这一题。';
  try {
    const acquired = await navigator.mediaDevices.getUserMedia({audio:true});
    if (id !== requestId || document.hidden) {
      acquired.getTracks().forEach(track=>track.stop());
      if (id === requestId) {button.disabled = false;status.textContent = '页面切到后台，已取消录音。回来后可以重新开始。';}
      return;
    }
    stream = acquired;
    playback.pause();
    erase(true);
    const mimeType = ['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
    const active = new MediaRecorder(stream, mimeType ? {mimeType} : undefined);
    recorder = active;
    const chunks = [];
    let startedAt;
    active.ondataavailable = event => {if (event.data.size) chunks.push(event.data);};
    active.onstop = () => {
      clearInterval(clock); stopTracks();
      if (id !== requestId) return;
      button.classList.remove('recording'); button.innerHTML = '<span class="dot" aria-hidden="true"></span>再录一次'; button.disabled = false;
      if (chunks.length) {
        const blob = new Blob(chunks,{type:active.mimeType || chunks[0].type});
        const url = URL.createObjectURL(blob); recordings.push(url); playback.src = url; playback.hidden = false;
        if(!recordedFirst[step]){firstRecordings[step]=url;recordedFirst[step]=true;}
        feedbackLog.submit(step,recordedFirst[step]&&firstRecordings[step]===url?'首次录音（反馈页可回听，未自动转写）':'重新录音（首次内容仍保留）',null);
        stage.querySelector('#erase').hidden = false;
        status.textContent = '录好了。点播放回听：别人能听清你的意思吗？';
      } else {status.textContent = '这次没有录到声音，可以重新试试，或直接开口说。';}
      updateNext();
    };
    active.onerror = () => {stopRecording(); status.textContent = '录音中断了。可以再试一次，或直接开口说。';};
    active.start();
    startedAt = Date.now();
    button.classList.add('recording'); button.innerHTML = '<span class="dot" aria-hidden="true"></span>停止录音'; button.disabled = false;
    time.textContent = '00:00 / 00:45';
    status.textContent = '正在录音。慢慢说，表达清楚就好。';
    stage.querySelector('#next').disabled = true;
    clock = setInterval(() => {
      const seconds = Math.floor((Date.now()-startedAt)/1000);
      time.textContent = '00:' + String(Math.min(seconds,45)).padStart(2,'0') + ' / 00:45';
      if (seconds >= 45) stopRecording();
    },250);
  } catch (error) {
    stopTracks();
    if (id !== requestId) return;
    const messages = {NotAllowedError:'麦克风未获允许。可以直接开口练习；想录音时，在浏览器的网站设置里允许麦克风后再试。',NotFoundError:'没有找到可用的麦克风，可以直接开口练习。',NotReadableError:'麦克风暂时被其他应用占用，稍后再试。'};
    status.textContent = messages[error.name] || '暂时无法录音，可以直接说出来，照常完成小练习。';
    button.disabled = false;
    updateNext();
  } finally { if(id===requestId){pending=false;updateNext();} }
}
function renderFinish() {
  recordings.filter(url=>!firstRecordings.includes(url)).forEach(url=>URL.revokeObjectURL(url));
  recordings=recordings.filter(url=>firstRecordings.includes(url));
  stage.innerHTML=`<div class="finish-emoji" aria-hidden="true">✳</div><p class="task-kicker">5 / 5 · TODAY’S EXPLORATION</p><h2 class="finish-title" id="task-title" tabindex="-1">5 个任务完成，今天到这里。</h2><p class="task-intro">前两题核对意思与词组；后三题保留表达与自评，不自动判断口语是否正确。</p>${feedbackLog.html()}<p class="tip">截图能保留文字和提示记录，不能代替听录音；未留文字的口述只能作为自报完成，不能据此判断表达质量。</p><div class="finish-actions"><a class="primary" href="./">回到小站</a><button class="text-button" id="review-words">再看一眼三个词组</button></div><div id="word-review" hidden>${words()}</div>`;
  firstRecordings.forEach((url,i)=>{if(url){const audio=document.createElement('audio');audio.controls=true;audio.src=url;audio.setAttribute('aria-label',`第 ${i+1} 题首次录音`);stage.querySelectorAll('.report-list>li')[i].append(audio);}});
  stage.querySelector('#review-words').onclick=()=>{const review=stage.querySelector('#word-review');review.hidden=!review.hidden;};
}
document.addEventListener('visibilitychange', () => {if(document.hidden) stopRecording();});
window.addEventListener('pagehide', () => {leaveTask(); recordings.forEach(url=>URL.revokeObjectURL(url)); recordings=[];});
render(false);
