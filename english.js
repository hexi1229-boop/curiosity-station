'use strict';
const stage = document.querySelector('#exercise');
const labels = ['听懂意思','词组应用','表达选择','解决麻烦','换个场景'];
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
  stage.innerHTML = `<p class="task-kicker">${first ? '01 / LISTEN' : '02 / WORDS IN ACTION'}</p><h2 id="task-title" tabindex="-1">${first ? '先听听他的想法' : '照顾它，用哪个词组？'}</h2><p class="task-intro">${first ? '先不看文字，听一遍。抓住“选什么”和“为什么”就够了。' : '把词组放进句子里，再大声读出完整的一句。'}</p>${first ? `<div class="audio-block"><label for="model-audio">英文示范 · 可重复播放</label><audio id="model-audio" controls preload="metadata" src="assets/audio/robot-dog.m4a" aria-label="机器狗话题英语示范"></audio><p class="audio-fallback" id="audio-error" hidden>音频暂时无法播放。可以先看原文，试着读出来。</p></div><details><summary>需要时，再看英文原文</summary><p lang="en">${scriptText}</p></details><p class="task-intro">哪一句最接近他的意思？</p>` : `${words()}<p class="english-prompt" lang="en">I need to <span class="blank">_____</span> my dog every day.</p><p class="tip">我每天都需要照顾我的狗。</p>`}<div class="answers" role="group" aria-label="选择答案">${choices.map((choice,i)=>`<button class="answer" data-choice="${i}" aria-pressed="false">${String.fromCharCode(65+i)}. ${esc(choice)}</button>`).join('')}</div><p class="feedback" id="feedback" role="status"></p>${footer('继续',true)}`;
  stage.querySelector('#model-audio')?.addEventListener('error', () => {document.querySelector('#audio-error').hidden = false;});
  stage.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    selected = Number(button.dataset.choice);
    stage.querySelectorAll('[data-choice]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    const correct = selected === (first ? 0 : 1);
    const feedback = stage.querySelector('#feedback');
    feedback.className = 'feedback' + (correct ? '' : ' error');
    feedback.textContent = correct ? (first ? '听到了！他偏爱机器狗，理由是能一起探索。最后还问了一句：没电了怎么办？' : '对！I need to take care of my dog every day. 试着连起来说：take care of，而不是一个词一个词地蹦出来。') : (first ? '再听一次 would rather have 和 explore with me。也可以展开原文看看。' : '这里需要“照顾”。run out of 是“用完”；would rather 后面直接跟动词，不能放在这里。再选一次。');
    stage.querySelector('#next').disabled = !correct;
  }));
}
function renderSpeaking() {
  const tasks = {
    2: {kicker:'03 / YOUR CHOICE',title:'现在，轮到你选择',intro:'选机器狗或真狗都行。用两句话说清选择和一个理由。',prompt:'Would you rather have a robot dog or a real dog? Why?',hint:'I’d rather have a ___ because ___. I could ___.',sample:'I’d rather have a real dog because it can be my friend. I’d take care of it every day.',checks:['我说出了自己的选择。','我给了一个理由，而不只是说 “I like it.”。']},
    3: {kicker:'04 / WHAT IF…?',title:'糟糕，机器狗没电了',intro:'你正和机器狗在公园探险。它突然停了，家还很远。你准备怎么做？',prompt:'Your robot dog runs out of power in the park. What would you do?',hint:'If it runs out of power, I could ___. / I would ___ because ___.',sample:'If it runs out of power, I could carry it home. Next time, I’d bring a charger.',checks:['我说清楚了“没电”这个问题。','我用英语提出了一个可行的办法。']},
    4: {kicker:'05 / TRY A NEW SCENE',title:'换个场景，还会用吗？',intro:'这次不聊宠物。周末你更想打球，还是玩游戏？先试着独立说，再按需打开提示。',prompt:'Would you rather play a sport or play a video game this weekend? Why?',hint:'I’d rather ___ because ___. 还可以加一句：I don’t want to run out of time.（我不想没时间。）',sample:'I’d rather play basketball because I want to be outside. I’ll finish my homework first so I don’t run out of time.',checks:['我把 I’d rather… 用到了新的场景。','我补充了自己的理由或计划。']}
  };
  const task = tasks[step];
  stage.innerHTML = `<p class="task-kicker">${task.kicker}</p><h2 id="task-title" tabindex="-1">${task.title}</h2><p class="task-intro">${task.intro}</p><p class="english-prompt" lang="en">${task.prompt}</p><details><summary>卡住了？借一个句子开头</summary><p lang="en">${task.hint}</p></details>${recorderUI()}<details><summary>说完后，看看一种示范</summary><p lang="en">${task.sample}</p><span class="sample-note">只是一个想法。你的答案可以完全不同。</span></details><div class="self-check"><p>自己检查一下（不是自动评分）</p>${task.checks.map((check,i)=>`<label><input type="checkbox" name="self-${i}"><span>${check}</span></label>`).join('')}</div><p class="tip">可以先直接说，再勾选；不需要录音，也不用追求一次说得完美。</p>${footer(step === 4 ? '完成今天的小练' : '说完了，继续',true)}`;
  stage.querySelectorAll('.self-check input').forEach(input => input.addEventListener('change',updateNext));
  stage.querySelector('#record').onclick = record;
  stage.querySelector('#erase').onclick = erase;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    stage.querySelector('#record').disabled = true;
    stage.querySelector('#record-status').textContent = '当前浏览器无法录音。可以直接说出来；也可用 Safari 打开本站，并允许麦克风权限后再试。';
  }
}
function updateNext() {
  const next = stage.querySelector('#next');
  if (next && step >= 2 && step < 5) next.disabled = ![...stage.querySelectorAll('.self-check input')].every(input=>input.checked) || !!(recorder && recorder.state !== 'inactive');
}
function erase() {
  const playback = stage.querySelector('#playback');
  if (!playback) return;
  playback.pause();
  const url = playback.getAttribute('src');
  if (url) { URL.revokeObjectURL(url); recordings = recordings.filter(value=>value !== url); }
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
    erase();
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
  } finally { if (id === requestId) pending = false; }
}
function renderFinish() {
  recordings.forEach(url => URL.revokeObjectURL(url)); recordings = [];
  stage.innerHTML = `<div class="finish-emoji" aria-hidden="true">✳</div><p class="task-kicker">5 / 5 · TODAY’S EXPLORATION</p><h2 class="finish-title" id="task-title" tabindex="-1">今天，已经多会说一点了。</h2><p class="task-intro">你听懂了一个观点，也说出了自己的选择、办法和计划。</p><ul class="finish-list"><li><b>✓</b> I’d rather… — 说出自己的偏好</li><li><b>✓</b> take care of — 谈谈如何照顾</li><li><b>✓</b> run out of — 说清“用完了”</li></ul><p class="task-intro">三个词组，已经从“见过”走到了“用过”。</p><p class="tip">完成一次就够了。下次生活里遇到这些情境，再试着用一用。</p><div class="finish-actions"><a class="primary" href="./">回到小站</a><button class="text-button" id="review-words">再看一眼三个词组</button></div><div id="word-review" hidden>${words()}</div>`;
  stage.querySelector('#review-words').onclick = () => {const review = stage.querySelector('#word-review'); review.hidden = !review.hidden;};
}
document.addEventListener('visibilitychange', () => {if(document.hidden) stopRecording();});
window.addEventListener('pagehide', () => {leaveTask(); recordings.forEach(url=>URL.revokeObjectURL(url)); recordings=[];});
render(false);
