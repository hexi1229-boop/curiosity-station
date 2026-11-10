(function(){
  'use strict';
  const L=window.YungongLesson,F=window.LearningFeedback,host=document.querySelector('#yungong-workspace');
  if(!L||!F||!host)return;
  const $=s=>document.querySelector(s),esc=F.esc,log=F.create(L.title,L.tasks),state=L.state(log.checkpoint.yungong1052381),audio=$('#work-audio');
  let clip=null,clipKey='',requestId=0,completed=false,raf=0,playStage=0;
  const save=()=>log.point({yungong1052381:state}),status=text=>{$('#audio-status').textContent=text;};
  const time=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  const clipButton=key=>`<button type="button" data-clip="${key}" aria-pressed="false">▶ ${esc(L.clips[key].label)}</button>`;
  function nav(){document.querySelectorAll('[data-tab]').forEach(n=>{const i=Number(n.dataset.tab);n.classList.toggle('done',state.opened[i]);if(i===state.tab)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');});}
  function halt(message='已停止，可以重新选择一处细听。'){requestId++;audio.pause();cancelAnimationFrame(raf);clip=null;clipKey='';document.querySelectorAll('[data-clip]').forEach(n=>n.setAttribute('aria-pressed','false'));$('.timing-picture')?.classList.remove('active');status(message);}
  function setTrack(track){state.track=track;$('#track-name').textContent=L.tracks[track].name;if(audio.getAttribute('src')!==L.tracks[track].src){audio.src=L.tracks[track].src;audio.load();}save();}
  async function play(track,key=''){
    halt();const request=requestId;setTrack(track);clip=key?L.clips[key]:null;clipKey=key;completed=false;playStage=state.tab;$('#audio-error').hidden=true;
    document.querySelectorAll('[data-clip]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.clip===key)));
    const start=clip?clip.start:0;status(`正在载入：${clip?clip.label:L.tracks[track].name}…`);
    try{
      if(audio.readyState<1)await new Promise((resolve,reject)=>{let timer;const clear=()=>{clearTimeout(timer);audio.removeEventListener('loadedmetadata',ok);audio.removeEventListener('error',bad);};const ok=()=>{clear();resolve();};const bad=()=>{clear();reject(new Error('load'));};audio.addEventListener('loadedmetadata',ok,{once:true});audio.addEventListener('error',bad,{once:true});timer=setTimeout(bad,15000);});
      if(request!==requestId)return;
      audio.currentTime=start;await audio.play();if(request!==requestId)return;
      status(clip?`${clip.label} · ${time(clip.start)}–${time(clip.end)} · 可随时停止`:`正在播放：${L.tracks[track].name}`);
    }catch(error){if(request===requestId){halt(error.name==='NotAllowedError'?'浏览器暂停了自动启动，请点播放器里的播放键。':'这次没有播起来，可点乐句按钮重试；讲解仍可查看。');$('#audio-error').hidden=error.name==='NotAllowedError';}}
  }
  function update(){
    const t=audio.currentTime||0,pos=L.position(t);$('#playing-bar').textContent=state.track==='piano'?`约第 ${pos.bar} 小节 · ${time(t)}`:`原版参考 · ${time(t)}`;
    const picture=$('.timing-picture');if(picture){picture.classList.toggle('active',state.track==='piano'&&pos.bar===25&&!audio.paused);picture.querySelectorAll('.sweep').forEach(n=>n.style.left=`${pos.beat/4*100}%`);}
    if(clip&&state.track==='piano'){
      if(t<clip.start-.25||t>clip.end+.75){clip=null;clipKey='';document.querySelectorAll('[data-clip]').forEach(n=>n.setAttribute('aria-pressed','false'));status('已切换为自由收听；要重播片段，可再点乐句按钮。');}
      else{const action=L.regionAction(t,clip,state.loop);if(action!=='continue'){
        if(!completed){log.note(playStage,`播放器到达片段结尾：${clip.label}；不据此判断实际注意或掌握。`);completed=true;}
        if(action==='repeat')audio.currentTime=clip.start;else{audio.pause();status(`这一段播放到结尾了：${clip.label}。可重听，也可直接看谱。`);}
      }}
    }
  }
  function tick(){update();if(!audio.paused)raf=requestAnimationFrame(tick);}
  audio.addEventListener('play',()=>{cancelAnimationFrame(raf);tick();});audio.addEventListener('timeupdate',update);audio.addEventListener('pause',()=>{cancelAnimationFrame(raf);$('.timing-picture')?.classList.remove('active');});
  audio.addEventListener('error',()=>{$('#audio-error').hidden=false;status('音频暂不可用；可重试，或先读对应谱例。');});audio.addEventListener('ended',()=>status('这首播放结束。挑一处有新发现的乐句，再听一次就好。'));
  function diagram(i){
    if(i===1)return `<div class="timing-picture" aria-label="第25小节：上方长音占4拍，下方8个八分音符也占4拍"><div class="lane"><b>旋律 · 四拍</b><div class="note-lane"><i class="held"></i><i class="sweep"></i></div></div><div class="lane"><b>伴奏 · 四拍</b><div class="note-lane">${'<i></i>'.repeat(8)}<i class="sweep"></i></div></div><p>同样长的一小节：上面保留一个长音，下面继续落下八个新音。回放第 25 小节时，白线标出时间。</p></div>`;
    if(i===2)return `<table class="pitch-table"><thead><tr><th>同一句的三个旋律音</th><th>第一个</th><th>第二个</th><th>第三个</th></tr></thead><tbody><tr><th>第 24 小节</th><td>E</td><td>D</td><td>C</td></tr><tr><th>第 48 小节</th><td>F♯</td><td>E</td><td>D</td></tr><tr><th>各自升高</th><td>2 个半音</td><td>2 个半音</td><td>2 个半音</td></tr></tbody></table><p class="small-note">F♯ 是升 F。钢琴上相邻的两个键（包含黑键）相差半音；两个半音合成一个全音。这里比较的是同一八度位置上的对应音。</p>`;
    return '';
  }
  function record(i){const s=L.stages[i],choice=state.choices[i],note=state.notes[i].trim();if(choice===null&&!note)return false;if(log.records[i].done)log.reopen(i);log.submit(i,choice===null?'只留下文字观察':s.choices[choice],null,note);return true;}
  function firstHtml(i){const first=log.records[i].first;return first?`<div class="first-note"><b>第一次留下的听法</b><br>${esc(first.answer)}${first.explanation?`<br>${esc(first.explanation)}`:''}</div>`:'';}
  function render(){
    const i=state.tab,s=L.stages[i];nav();
    host.innerHTML=`<section class="studio-card"><p class="kicker">${String(i+1).padStart(2,'0')} / ${esc(s.bars)}</p><h2 tabindex="-1">${esc(s.title)}</h2><p class="studio-sub">点击听这一处，再看谱里的声音怎样配合。可以先留下发现，也可以直接一起听、一起看。</p><div class="phrase-actions">${s.clips.map(clipButton).join('')}</div><details class="observation-box"><summary>先留下自己的听法 · 可选</summary><h3>${esc(s.question)}</h3><div class="listening-choice">${s.choices.map((label,n)=>`<button type="button" data-choice="${n}" aria-pressed="${state.choices[i]===n}">${esc(label)}</button>`).join('')}</div><label class="studio-label" for="hearing-note">我听到的依据 · 可选，也可以只口头聊</label><textarea id="hearing-note" class="studio-textarea" maxlength="900" placeholder="抓一个具体声音或谱上的细节就够了。">${esc(state.notes[i])}</textarea><div class="studio-actions"><button type="button" id="keep-observation" class="studio-button primary">${state.opened[i]?'留住这次新发现':'留住听法，展开谱面'}</button></div><p id="observation-status" class="small-note" role="status"></p><div id="first-observation">${firstHtml(i)}</div></details><div class="studio-actions"><button type="button" id="open-reading" class="studio-button primary">${state.opened[i]?'回看谱面讲解':'边听边看谱 →'}</button></div><details class="studio-hint" id="listening-hint"><summary>还抓不住？给耳朵一个小支点</summary><p>${esc(s.hint)}</p></details><section id="score-reading" class="score-reading" ${state.opened[i]?'':'hidden'} aria-label="谱面与解释"><h3>把耳朵听到的，放回谱里看看。</h3>${i===2?'<p class="score-caption">先看第 24–25 小节，再与下面第 48–49 小节比较。</p><div class="score-image" tabindex="0" aria-label="第24至25小节原句谱例"><img src="assets/yungong/longline.webp" alt="第24小节的E、D、C旋律和第25小节的长音"></div>':''}<div class="score-image" tabindex="0" aria-label="对应谱例，窄屏可以左右滑动"><img src="assets/yungong/${s.image}.webp" alt="${esc(s.caption)}"></div><p class="score-caption">${esc(s.caption)} 手机可左右滑动谱例；完整谱在页面下方。</p>${diagram(i)}${s.explain.map(p=>`<p class="reading-point">${p}</p>`).join('')}<div class="little-action"><b>和声音一起做一下 · 可选</b><p>${esc(s.action)}</p></div><div class="phrase-actions">${s.clips.slice(0,2).map(clipButton).join('')}</div></section><div class="journal-actions">${i>0?'<button type="button" class="studio-button" id="previous">← 上一处</button>':'<a href="#work-audio">回到作品播放器 ↑</a>'}${i<3?'<button type="button" class="studio-button primary" id="next">下一处细听 →</button>':'<button type="button" class="studio-button primary" id="whole-again">回到整首再听 →</button>'}</div>${i===3?'<details id="journal"><summary>展开这次的共听记录</summary><div id="journal-content"></div></details>':''}</section>`;
    host.querySelectorAll('[data-clip]').forEach(n=>{n.setAttribute('aria-pressed',String(clipKey===n.dataset.clip));n.onclick=()=>play('piano',n.dataset.clip);});
    host.querySelectorAll('[data-choice]').forEach(n=>n.onclick=()=>{state.choices[i]=Number(n.dataset.choice);log.draft(i,{choice:s.choices[state.choices[i]]});save();host.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===n)));});
    $('#hearing-note').oninput=event=>{state.notes[i]=event.target.value;log.draft(i,{note:state.notes[i]});save();};
    function showReading(){state.opened[i]=true;log.help(i,`查看谱面与讲解：${s.bars}`);log.finish(i,'看过谱面讲解，未自动判断听辨或演奏能力');save();$('#score-reading').hidden=false;nav();$('#keep-observation').textContent='留住这次新发现';$('#open-reading').textContent='回看谱面讲解';}
    $('#keep-observation').onclick=()=>{const kept=record(i);showReading();$('#first-observation').innerHTML=firstHtml(i);$('#observation-status').textContent=kept?'这次的听法已保存；第一版保留。':'还没有填写听法，先看谱面也可以。没有替你补写答案。';};
    $('#open-reading').onclick=()=>{showReading();$('#score-reading').scrollIntoView({block:'nearest'});};
    $('#listening-hint').addEventListener('toggle',event=>{if(event.target.open)log.help(i,'打开聆听小支点');});
    $('#previous')?.addEventListener('click',()=>go(i-1));$('#next')?.addEventListener('click',()=>go(i+1));$('#whole-again')?.addEventListener('click',()=>{play('piano');$('#work-audio').scrollIntoView({block:'center'});});
    $('#journal')?.addEventListener('toggle',event=>{if(event.target.open)$('#journal-content').innerHTML=log.html();});
  }
  function go(i){halt();state.tab=i;save();render();host.querySelector('h2')?.focus({preventScroll:true});host.scrollIntoView({block:'start'});}
  document.querySelectorAll('[data-tab]').forEach(n=>n.onclick=()=>go(Number(n.dataset.tab)));
  document.querySelectorAll('[data-full]').forEach(n=>n.onclick=()=>play(n.dataset.full));$('#stop-audio').onclick=()=>halt();
  $('#repeat-clip').checked=state.loop;$('#repeat-clip').onchange=event=>{state.loop=event.target.checked;save();};
  $('.full-score').addEventListener('toggle',event=>{if(event.target.open&&!$('#score-pages').childElementCount)$('#score-pages').innerHTML=Array.from({length:5},(_,i)=>`<a href="assets/yungong/score-${i+1}.webp" target="_blank" rel="noopener"><img src="assets/yungong/score-${i+1}.webp" loading="lazy" alt="《云宫迅音》曲谱第 ${i+1} 页"><span>第 ${i+1} 页 · 点击放大</span></a>`).join('');});
  $('#legacy-note').hidden=!F.history().some(s=>s.title===L.legacyTitle);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)halt('离开页面时已暂停，回来后点击继续收听。');});window.addEventListener('pagehide',()=>halt());
  if(state.track==='original'){audio.src=L.tracks.original.src;$('#track-name').textContent=L.tracks.original.name;}
  render();
})();
