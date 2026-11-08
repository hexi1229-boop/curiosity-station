(function(){
  'use strict';
  const L=window.YungongLesson,F=window.LearningFeedback,A=window.MusicAudio,host=document.querySelector('#yungong-workspace');
  if(!L||!F||!A||!host)return;
  const $=selector=>document.querySelector(selector),esc=F.esc,log=F.create(L.title,L.tasks),audio=A.create();
  const state=L.state(log.checkpoint.yungong);
  const source='https://tv.cctv.com/2018/09/06/VIDECU1XosNT9PfHrHbU2zdU180906.shtml';
  let serial=0;
  const button=(id,label,primary=false)=>`<button type="button" id="${id}" class="studio-button ${primary?'primary':''}">${label}</button>`;
  const sourceLink=()=>`<a class="studio-button source-link" data-source href="${source}" target="_blank" rel="noopener">打开央视原曲 ↗</a>`;
  function save(){log.point({yungong:state});}
  function status(text,playing=false){$('#audio-status').textContent=text;$('.transport').classList.toggle('playing',playing);}
  function clearPlay(){host.querySelectorAll('.hot,.sound-cursor.active').forEach(node=>node.classList.remove('hot','active'));}
  function stop(message='小样已停止。'){serial++;audio.stop();clearPlay();status(message);}
  function nav(){document.querySelectorAll('[data-tab]').forEach(node=>{const i=Number(node.dataset.tab);node.classList.toggle('done',log.records[i].done);if(i===state.tab)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});}
  function record(i,answer,reason,self){if(log.records[i].done)log.reopen(i);log.submit(i,answer,null,reason);log.finish(i,self);nav();}
  function field(id,key,index){const node=$(id);node.addEventListener('input',()=>{state[key]=node.value;log.draft(index,{[key]:node.value});save();});}
  function check(id,key){$(id).onchange=event=>{state[key]=event.target.checked;save();};}
  function helpers(index){host.querySelectorAll('details[data-help]').forEach(node=>node.addEventListener('toggle',()=>{if(node.open)log.help(index,node.dataset.help);}));host.querySelectorAll('[data-source]').forEach(node=>node.onclick=()=>log.note(index,'打开央视原曲链接；不据此认定已经收听。'));}
  function go(tab){state.tab=tab;save();render();host.querySelector('h2')?.focus({preventScroll:true});host.scrollIntoView({block:'start'});}
  function render(){stop('点播放才发声。本站小样是原创演示，原曲在外部播放器收听。');nav();[listen,lab,returnListen][state.tab]();helpers(state.tab);}
  async function play(value,label,keep=false){
    const m=L.mix(value),key=JSON.stringify(m);stop();const token=++serial;
    status(`准备播放：${label}…`);
    try{
      const result=await audio.play(L.score(m),{onBeat:info=>{
        if(token!==serial)return;
        host.querySelectorAll('.sound-cursor').forEach(node=>{node.style.left=`${info.beat/16*100}%`;node.classList.add('active');});
        host.querySelectorAll('.accent-strip span').forEach((node,i)=>node.classList.toggle('hot',Math.floor(i/2)===info.beatInBar));
      },onEnd:()=>{
        if(token!==serial)return;clearPlay();status(`${label}播放结束。`);
        log.note(1,`完整播放${label}：${L.describe(m)}`);
        if(keep&&key===JSON.stringify(state.mix)){state.heardMix=key;save();const feedback=$('#lab-heard');if(feedback)feedback.textContent='当前设置已完整试听；可以留住这一版。';}
      },onStop:reason=>{if(token===serial&&reason==='interrupted'){clearPlay();status('系统中断了声音，这次不记为完整试听；可以重播。');}}});
      if(token===serial&&result)status(`正在播放：${label} · 每分钟 96 拍 · 共 16 拍`,true);
    }catch(error){if(token===serial)status(error.message||'声音未启动，请再点一次播放。');}
  }
  function listen(){
    const first=log.records[0].first;
    host.innerHTML=`<section class="studio-card"><p class="kicker">01 / ENTER THE CLOUDS</p><h2 tabindex="-1">先别看解释，听一段你熟悉的。</h2><p class="studio-sub">打开《云宫迅音》，从开头听到你愿意停下的地方。钢琴版也可以。留意：哪个声音一出现，就让你认出它？</p><div class="studio-actions">${sourceLink()}</div><p class="small-note">央视页面若无法播放，用平时的音乐应用收听。两个版本可能长短、速度、编配不同，不套用统一时间点。</p>
      <label class="studio-label" for="listen-version">今天听的版本 · 知道多少写多少</label><input id="listen-version" class="version-field" maxlength="900" value="${esc(state.version)}" placeholder="例如：央视片头版／自己的钢琴录像／某位演奏者">
      <label class="check-line"><input id="original-heard" type="checkbox" ${state.listened?'checked':''}>我已经实际听过这次选的片段</label>
      <label class="studio-label" for="listen-place">让我停下来的一处 · 时间或位置都行</label><input id="listen-place" class="version-field" maxlength="900" value="${esc(state.place)}" placeholder="例如：开头／旋律展开时／播放器 0:__">
      <label class="studio-label" for="listen-impression">那里听到了什么？让你想到什么？</label><textarea id="listen-impression" class="studio-textarea" maxlength="900" placeholder="先说自己的听法；暂时叫不出乐器名字也没关系。">${esc(state.impression)}</textarea>
      <div class="studio-actions">${button('keep-listen',first?'留住这次听法':'留住第一印象，打开听音线索',true)}${button('skip-original','暂时播不了，先做声音实验')}</div><p id="listen-notice" class="notice" role="status"></p>
      ${first?`<div class="first-note"><b>第一次留住的听法</b><br>${esc(first.answer)}${first.explanation?`<br>${esc(first.explanation)}`:''}</div>`:''}
      <div ${state.guide?'':'hidden'} id="listen-guide"><div class="listening-map"><article><b>谁让音乐向前走？</b><p>留意反复出现的短音、鼓点或节奏。先跟着走几拍，再听它是不是一直不变。</p></article><article><b>你会跟着哼哪条线？</b><p>试着只追踪一条旋律。别急着认乐器；它也可能换一种音色继续唱。</p></article><article><b>远处还铺着什么？</b><p>听持续的背景、同时响起的音、声音的进入与退出。只抓一个细节就够。</p></article></div><div class="reading-note"><p>这首作品把电子声与民乐、管弦乐放在一起。熟悉的“神话世界”也能由现代声音创造出来。这里的三个问题是听音乐的视角，<strong>不是把原曲硬分成三个声部</strong>。</p></div><details class="studio-hint" data-help="作曲家的生活声音灵感"><summary>幕后小故事：敲饭盒，怎么进了作曲家的耳朵？</summary><p>许镜清在央视访谈中回忆，工人敲饭盒、哼唱的声音曾给他灵感。灵感不等于把生活声音直接搬进作品；重复、节奏、音色，还要经过创作和组织。下次听见一种有意思的声音，也可以先问：我喜欢它的哪一点？</p></details><div class="studio-actions">${button('to-lab','拆开一段声音试试 →',true)}</div></div></section>`;
    field('#listen-version','version',0);field('#listen-place','place',0);field('#listen-impression','impression',0);check('#original-heard','listened');
    $('#keep-listen').onclick=()=>{
      if(!state.listened){$('#listen-notice').textContent='实际听过后再勾选；现在播不了，也可以用旁边的按钮先做实验。';return;}
      if(log.records[0].done)log.reopen(0);
      log.submit(0,`自述已听；版本：${state.version.trim()||'未注明'}；位置：${state.place.trim()||'未注明'}；听法：${state.impression.trim()||'暂时说不清，先保留这个状态'}`,null,state.impression);
      log.help(0,'首听后查看三个听音视角');log.finish(0,'首听原话已保存，未自动判断听辨是否正确');state.guide=true;save();render();
    };
    $('#skip-original').onclick=()=>{if(!log.records[0].first)record(0,'本次暂未收听原曲，先做原创声音实验','','缺少原曲听辨证据，不据此判断会或不会');go(1);};
    $('#to-lab')?.addEventListener('click',()=>go(1));
  }
  function roll(){
    const m=state.mix,score=L.score({...m,lead:100,motor:100,bed:100});
    return `<div class="sound-lab">${Object.entries(L.roles).map(([role,label])=>`<div class="sound-track" data-role="${role}"><div class="track-control"><label class="track-title" for="level-${role}"><b>${label}</b><output id="out-${role}">${m[role]}</output></label><input id="level-${role}" data-level="${role}" aria-label="${label}相对音量" type="range" min="0" max="100" step="5" value="${m[role]}"><small>${{lead:'可以跟着哼的线条',motor:'一拍两个短音，重音可移动',bed:'同时响起的几个音，铺在下面'}[role]}</small></div><div class="sound-roll" aria-label="${label}时间图，左至右共16拍">${score.events.filter(n=>n.role===role).map(n=>`<i class="sound-note" style="left:${n.beat/16*100}%;width:${n.duration/16*100}%;top:${role==='lead'?(83-n.midi)*2.5:role==='motor'?28:(73-n.midi)*3}px;opacity:${role==='motor'?(L.strong(n.beat,m.accent)?1:.28):.85}"></i>`).join('')}<i class="sound-cursor"></i></div></div>`).join('')}<div class="mix-caption"><span>左 → 右：时间 · 高 → 低：音高</span><span>每格 4 拍，共 16 拍</span></div></div>`;
  }
  function accents(){return [0,.5,1,1.5,2,2.5,3,3.5].map((beat,i)=>`<span class="${L.strong(beat,state.mix.accent)?'strong':''}">${i%2?'＋':beat+1}</span>`).join('');}
  function lab(){
    host.innerHTML=`<section class="studio-card"><p class="kicker">02 / HEAR THE LAYERS</p><h2 tabindex="-1">先听见一条线，再听见它身边的世界。</h2><p class="studio-sub">这是另一段<strong>原创小样</strong>，不是《云宫迅音》的分轨。先只听旋律，再听三层合在一起：你还能一直跟着旋律哼吗？</p><div class="studio-actions">${button('solo','▶ 只听旋律')}${button('baseline','▶ 听原始三层')}</div>
      <p>试着让旋律更容易被听见：先只改一层的音量，再试听。数字只是相对控制值，<strong>不是分贝，也不是钢琴力度记号</strong>。拉到 0 可以暂时拿掉这一层。</p>${roll()}
      <div class="lab-controls"><div><label class="studio-label" for="accent">短音的重音位置</label><select class="studio-select" id="accent"><option value="beat" ${state.mix.accent==='beat'?'selected':''}>第 1、3 拍上</option><option value="between" ${state.mix.accent==='between'?'selected':''}>第 2、4 拍后半</option></select><div class="accent-strip" aria-label="每小节8个短音，金色标重音">${accents()}</div><p class="small-note">1＋2＋3＋4＋：每个“＋”是半拍处。金色变了，音的起点和每分钟 96 拍都没变。</p></div><div><label class="studio-label" for="color">音色对照</label><select class="studio-select" id="color"><option value="separate" ${state.mix.color==='separate'?'selected':''}>不同合成音色帮助分层</option><option value="same" ${state.mix.color==='same'?'selected':''}>统一合成音色再听</option></select><p class="small-note">统一音色只改变音色设置，音高与时间不变；听感响度仍可能受音色影响。它不是钢琴采样，只用来观察音色线索变少时怎样追踪声部。</p></div></div>
      <div class="studio-actions">${button('play-mix','▶ 听我的设置',true)}${button('reset-mix','恢复原始三层')}</div><p id="lab-heard" class="lab-status" role="status">${state.heardMix===JSON.stringify(state.mix)?'当前设置已完整试听；可以留住这一版。':'改好后完整听一次，留住实际听过的设置。'}</p>
      <label class="studio-label" for="mix-reason">我改了什么，耳朵发现了什么？</label><textarea id="mix-reason" class="studio-textarea" maxlength="900" placeholder="例如：我把……调轻后，更容易跟着……。还没听出差别，也可以如实留下。">${esc(state.mixReason)}</textarea>
      <details class="studio-hint" data-help="拆层示例与拍点重音解释"><summary>给耳朵一个小支点 · 卡住时再打开</summary><p>先回到原始三层，只把“短音伴奏”从 60 调到 20。旋律没被改写，但它与伴奏的前后关系可能更清楚。听不出时，先单听旋律、哼住开头，再回到合奏追踪它。</p><p><strong>速度管“拍子走多快”，重音管“哪些声音更突出”。</strong>移动重音，可能让音乐有推着走、悬着走的不同感觉；不代表速度一定加快。你也可以有别的听感，用实际变化说明就好。</p><p>真实钢琴也有旋律与伴奏的层次，但旋律不一定永远在右手或最高音。先在自己的谱和录音里找到它，再决定听谁。</p></details>
      <div class="studio-actions">${button('keep-mix','留住这一版，回到原曲 →',true)}${button('skip-lab','这次声音没听成，先回原曲')}</div><p id="lab-notice" class="notice" role="status"></p></section>`;
    $('#solo').onclick=()=>play({...L.defaults,motor:0,bed:0},'只有旋律');$('#baseline').onclick=()=>play(L.defaults,'原始三层');
    $('#play-mix').onclick=()=>{if(Object.keys(L.roles).every(role=>state.mix[role]===0)){$('#lab-notice').textContent='三层都静音了；先让至少一层发声。';return;}play(state.mix,'我的设置',true);};
    function changed(){stop('设置已改变，点击“听我的设置”听这一版。');state.heardMix='';save();$('#lab-heard').textContent='设置已变，还没有完整听过这一版。';$('#lab-notice').textContent='';}
    host.querySelectorAll('[data-level]').forEach(node=>node.oninput=()=>{const role=node.dataset.level;state.mix[role]=Number(node.value);$(`#out-${role}`).textContent=node.value;changed();});
    $('#accent').onchange=event=>{state.mix.accent=event.target.value;changed();$('.accent-strip').innerHTML=accents();host.querySelectorAll('[data-role=motor] .sound-note').forEach((node,i)=>node.style.opacity=L.strong(i*.5,state.mix.accent)?'1':'.28');};
    $('#color').onchange=event=>{state.mix.color=event.target.value;changed();};
    $('#reset-mix').onclick=()=>{state.mix={...L.defaults};state.heardMix='';save();render();};field('#mix-reason','mixReason',1);
    $('#keep-mix').onclick=()=>{
      if(state.heardMix!==JSON.stringify(state.mix)){$('#lab-notice').textContent='先完整听一遍当前设置；中途停止或改动后，请重新试听。';return;}
      const snapshot=JSON.stringify({mix:state.mix,reason:state.mixReason});
      log.draft(1,{$mixFirst:log.records[1].draft.$mixFirst||snapshot,$mixLatest:snapshot});
      record(1,L.describe(state.mix),state.mixReason||'暂时说不清听到的差别','设置已完整播放，个人解释未自动判分');go(2);
    };
    $('#skip-lab').onclick=()=>{if(!log.records[1].first)record(1,'本次没有完成可留存的拆层试听','','缺少试听证据，不自动判断原因');go(2);};
  }
  function returnListen(){
    const first=log.records[0].first,focuses={none:'今天只赏析，不回看钢琴',pulse:'只听：拍子在音符之间有没有继续走',melody:'只听：主旋律能不能被一路跟唱',join:'只听：两小段接起来时发生什么'};
    host.innerHTML=`<section class="studio-card"><p class="kicker">03 / BACK TO THE MUSIC</p><span class="return-art" aria-hidden="true">听</span><h2 tabindex="-1">现在，重新听刚才那一段。</h2><p class="studio-sub">离开小样，回到真正的《云宫迅音》。先不看提示，挑一个以前忽略的声音，跟着它走一小段。用同一个版本比较，少一个干扰。</p><div class="studio-actions">${sourceLink()}</div><div class="first-note"><b>第一次留下的线索</b><br>${esc(first?.answer||'还没有第一印象，可以先去第一站听一听。')}</div>
      <label class="check-line"><input id="return-heard" type="checkbox" ${state.returnHeard?'checked':''}>我已回到原曲或自己的演奏版本，实际重听了片段</label>
      <label class="studio-label" for="return-note">原来我听见……；这次在……位置，我还听见……</label><textarea id="return-note" class="studio-textarea" maxlength="900" placeholder="抓住一个声音证据即可。也可能发现：第一遍的听法仍然成立，但我知道原因了。">${esc(state.returnNote)}</textarea>
      <details class="studio-hint" data-help="原曲回听线索"><summary>还找不到新细节？换一个听法。</summary><p>上一遍跟着旋律走，这一遍只跟短音或节奏；上一遍注意开头，这一遍听一个声音进入或退去的地方。先说“我听见什么”，再说“它让我想到什么”。如果没有明显新发现，可以如实记下，不用编一种感受。</p></details>
      <details class="studio-hint" id="piano-extension"><summary>弹过钢琴版？把它变成一次小小的侦听 · 可选</summary><p>从自己的录音或曲谱挑<strong>两小节左右</strong>，不要整首重来。先选这次只听什么；不要同时追速度、音准、音量和手型。</p><label class="studio-label" for="piano-focus">这次的观察任务</label><select id="piano-focus" class="studio-select">${Object.entries(focuses).map(([id,label])=>`<option value="${id}" ${state.pianoFocus===id?'selected':''}>${label}</option>`).join('')}</select><ol class="piano-steps"><li><b>先听，别急着纠错。</b>指一处具体位置：哪条线更显眼？哪里有停顿、换气或重启？休止、速度处理和不熟悉都可能造成间隔，需结合谱核对。</li><li><b>只做一个对照。</b>想听旋律，先哼它或单听该声部，再听合起来；想听衔接，比较“前一段最后一拍＋后一段第一拍”。有琴时可以用舒服的慢速试一遍，没有琴就只回听。</li><li><b>回到音乐。</b>这一小段更像一句完整的话了吗？只描述这次的变化，不给自己定等级。</li></ol><label class="studio-label" for="piano-note">愿意的话记下位置与发现</label><textarea id="piano-note" class="studio-textarea" maxlength="900" placeholder="哪段录像／哪两小节；我这次只听……；发现……">${esc(state.pianoNote)}</textarea><p class="small-note">这里没有自动听评或上传功能。口头聊过但未记下的发现，小站无法自动保存。</p></details>
      <div class="studio-actions">${button('keep-return','收好这次听音便笺',true)}${button('back-lab','回拆层台再试')}</div><p id="return-notice" class="notice" role="status"></p><div id="listening-journal">${log.records[2].done?log.html():''}</div><div class="studio-actions"><a href="records.html">查看全部学习记录 ↗</a><a href="music.html">回到第一间配乐工作室 ↗</a></div></section>`;
    field('#return-note','returnNote',2);field('#piano-note','pianoNote',2);check('#return-heard','returnHeard');
    $('#piano-focus').onchange=event=>{state.pianoFocus=event.target.value;log.draft(2,{pianoFocus:focuses[state.pianoFocus]});save();};
    $('#piano-extension').addEventListener('toggle',event=>{if(event.target.open)log.note(2,'打开可选钢琴侦听环节；不代表实际练琴。');});
    $('#keep-return').onclick=()=>{
      const answer=state.returnHeard?`自述已回听；${state.returnNote.trim()||'这次没有留下文字发现'}`:`这次未确认回听，先存便笺；${state.returnNote.trim()||'暂无文字发现'}`;
      record(2,answer,`${focuses[state.pianoFocus]}${state.pianoNote.trim()?'；'+state.pianoNote.trim():''}`,'保存本次听音过程，不自动认定会听或会弹');save();$('#listening-journal').innerHTML=log.html();$('#return-notice').textContent='便笺已收好。首听、改动和回听原话都保留；以后回来可以继续。';
    };
    $('#back-lab').onclick=()=>go(1);
  }
  document.querySelectorAll('[data-tab]').forEach(node=>node.onclick=()=>go(Number(node.dataset.tab)));
  $('#stop-audio').onclick=()=>stop();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('离开页面时已停止本站小样，回来可重播。');});
  window.addEventListener('pagehide',()=>stop());render();
})();
