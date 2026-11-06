(function(){
  'use strict';
  const L=window.MusicLesson,F=window.LearningFeedback,A=window.MusicAudio,host=document.querySelector('#music-workspace');
  if(!L||!F||!A||!host)return;
  const $=selector=>document.querySelector(selector),esc=F.esc,audio=A.create();
  const choices={tempo:'整体速度变了',pitch:'旋律音高变了',layers:'伴奏层次变了',unsure:'我还拿不准'};
  const layerChoices={layers:'多了底下的伴奏，主旋律相同',melody:'换了另一条主旋律',tempo:'整体速度变了',unsure:'我还拿不准'};
  const log=F.create(L.title,L.tasks),raw=log.checkpoint.music||{};
  const cleanText=value=>typeof value==='string'?value.slice(0,900):'';
  let state={...L.sanitizeState(raw),tab:[0,1,2].includes(raw.tab)?raw.tab:0,revealed:raw.revealed===true,layerChoice:cleanText(raw.layerChoice),layerRevealed:raw.layerRevealed===true,layerHeard:Array.isArray(raw.layerHeard)?raw.layerHeard.filter(id=>['C','D'].includes(id)):[],pattern:Array.isArray(raw.pattern)&&raw.pattern.length===4?raw.pattern.map(value=>['q','e','r'].includes(value)?value:''):['','','',''],patternHeard:raw.patternHeard===true,patternChecked:raw.patternChecked===true,patternFirst:Array.isArray(raw.patternFirst)?raw.patternFirst:null,dawn:raw.dawn?L.sanitizeArrangement(raw.dawn):null,dawnReason:cleanText(raw.dawnReason),mixStage:raw.mixStage==='night'?'night':'dawn',mixPlayed:raw.mixPlayed?{dawn:raw.mixPlayed.dawn===true,night:raw.mixPlayed.night===true}:{dawn:false,night:false},mixFinished:raw.mixFinished===true,trace:Array.isArray(raw.trace)?raw.trace.slice(-32):[]};
  let serial=0,tapRun=null,padTimer=null;
  const button=(id,label,primary=false)=>`<button type="button" id="${id}" class="studio-button ${primary?'primary':''}">${label}</button>`;
  function save(){log.point({music:state});}
  function status(message,playing=false){$('#audio-status').textContent=message;$('.transport').classList.toggle('playing',playing);}
  function stop(message='声音已停止；可以随时重新播放。'){
    serial++;audio.stop();tapRun=null;clearTimeout(padTimer);
    document.querySelectorAll('.hot').forEach(node=>node.classList.remove('hot'));
    const pad=$('#tap-pad');if(pad){pad.disabled=true;pad.classList.remove('hit');}
    status(message);
  }
  async function play(score,label,{countIn=0,onBeat=()=>{},onEnd=()=>{},onReady=()=>{}}={}){
    stop();const token=++serial;status(`正在准备：${label}…`);
    try{
      const clock=await audio.play(score,{countIn,onBeat:info=>{
        if(token!==serial)return;
        document.querySelectorAll('.beat-dot').forEach((node,index)=>node.classList.toggle('hot',index===info.beatInBar));
        document.querySelectorAll('.roll-bar').forEach((node,index)=>node.classList.toggle('hot',index===info.bar));onBeat(info);
      },onEnd:()=>{if(token!==serial)return;document.querySelectorAll('.hot').forEach(node=>node.classList.remove('hot'));status(`${label}播放结束。`);onEnd();},onStop:reason=>{if(token!==serial)return;tapRun=null;if(reason==='interrupted'){document.querySelectorAll('.hot').forEach(node=>node.classList.remove('hot'));status('声音被系统中断了，本轮不作为完整尝试；回来后可以重播。');const pad=$('#tap-pad');if(pad)pad.disabled=true;}}});
      if(token!==serial||!clock)return;status(`正在播放：${label}。`,true);onReady(clock);
    }catch(error){if(token!==serial)return;status(error.message||'声音暂时未启动，请再点一次播放。');tapRun=null;const pad=$('#tap-pad');if(pad)pad.disabled=true;}
  }
  function record(index,answer,reason,self){if(log.records[index].done)log.reopen(index);log.submit(index,answer,null,reason);log.finish(index,self);}
  function trace(message){state.trace.push(message);state.trace=state.trace.slice(-32);log.note(2,message);save();}
  function nav(){document.querySelectorAll('[data-tab]').forEach(node=>{const i=Number(node.dataset.tab);if(i===state.tab)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');node.classList.toggle('done',log.records[i].done);});}
  function render(){stop('点播放开始；所有作品和想法会自动留在本机。');nav();if(state.tab===0)listen();else if(state.tab===1)rhythm();else mix();nav();}
  function go(tab){state.tab=tab;save();render();host.querySelector('h2')?.focus({preventScroll:true});}
  function optionMarkup(options,value,attr){return `<div class="music-options">${Object.entries(options).map(([key,label])=>`<button type="button" ${attr}="${key}" aria-pressed="${value===key}">${label}</button>`).join('')}</div>`;}
  function bindChoices(attr,setter){host.querySelectorAll(`[${attr}]`).forEach(node=>node.onclick=()=>{setter(node.getAttribute(attr));save();host.querySelectorAll(`[${attr}]`).forEach(item=>item.setAttribute('aria-pressed',String(item===node)));});}
  function helpDetails(index){host.querySelectorAll('details[data-help]').forEach(node=>node.addEventListener('toggle',()=>{if(node.open)log.help(index,node.dataset.help);}));}
  function roll(){
    return `<div class="roll" aria-label="原创旋律图：横向是时间，位置越高音越高，横条越长持续越久">${Array.from({length:4},(_,bar)=>`<div class="roll-bar">${L.motif.filter(note=>Math.floor(note.beat/4)===bar).map(note=>`<i class="roll-note" style="left:${(note.beat%4)*25}%;width:${note.duration*25-1.5}%;top:${12+(81-note.midi)*6}px"></i>`).join('')}<span class="roll-label">第 ${bar+1} 小节</span></div>`).join('')}</div><p class="roll-caption">横向看时间 · 位置越高，音越高 · 横条越长，持续越久 · 每小节 4 拍</p>`;
  }
  function listen(){
    host.innerHTML=`<section class="studio-card"><p class="kicker">01 / LISTEN FIRST</p><h2 tabindex="-1">同一段旋律，两个版本。</h2><p class="studio-sub">不用猜它“应该”让人快乐还是悲伤。先听声音本身：究竟什么变了？</p>
      <div class="listen-pair">${['A','B'].map(id=>`<button type="button" class="listen-card" data-listen="${id}"><strong>▶ ${id}</strong><span>听版本 ${id}<small id="heard-${id}">${state.heard.includes(id)?'已播完 · 可以重听':'原创四小节 · 先用耳朵发现'}</small></span></button>`).join('')}</div>
      ${optionMarkup(choices,state.listeningChoice,'data-listen-choice')}<label class="studio-label" for="listen-reason">这让我想到什么画面？愿意的话留一句。</label><textarea id="listen-reason" class="studio-textarea" maxlength="900" placeholder="你想到什么画面？也可以先只选听到的变化。">${esc(state.listeningReason)}</textarea>
      <div class="studio-actions">${button('reveal-listen',state.revealed?'留住这次听法':'留住听法，打开声音对照',true)}${button('skip-listen','这次没听清，先去玩节奏')}</div><p id="listen-notice" class="notice" role="status"></p>
      <div id="listen-reveal" ${state.revealed?'':'hidden'}><div class="reveal"><p><strong>旋律没换，只有整体速度变了。</strong>A 是每分钟 72 拍，B 是 108 拍。音高、音的先后顺序、节奏型、音色与设定音量都相同。</p><p>B 每拍用时更短，所以整段也更短。“感觉更急”是听感；“每分钟拍数更多”是可以核对的变化。快慢并不自动等于快乐或悲伤。</p></div>${roll()}
        <details class="studio-hint" id="layer-lab"><summary>有钢琴经验，再听细一点：藏在下面的声音</summary><p>两段速度相同。试着追踪高处的主旋律，再留意它下面发生了什么。</p><div class="listen-pair">${['C','D'].map(id=>`<button class="listen-card" type="button" data-layer="${id}"><strong>▶ ${id}</strong><span>听版本 ${id}<small id="heard-${id}">${state.layerHeard.includes(id)?'已播完，可重听':'保持相同速度'}</small></span></button>`).join('')}</div>${optionMarkup(layerChoices,state.layerChoice,'data-layer-choice')}${button('reveal-layer','打开这一层声音对照')}<p id="layer-notice" class="notice" role="status"></p><div class="reveal" id="layer-answer" ${state.layerRevealed?'':'hidden'}><p>D 加了低音与和弦，主旋律和速度都没变。多了声音，不一定就是换了曲子。可以跟着哼主旋律再听一次。</p></div></details><div class="studio-actions">${button('listen-next','去把拍子接住 →',true)}</div></div></section>`;
    host.querySelectorAll('[data-listen]').forEach(node=>node.onclick=()=>{const id=node.dataset.listen;play(L.buildEvents({...L.defaults,bpm:id==='A'?72:108}),`版本 ${id}`,{onEnd:()=>{if(!state.heard.includes(id))state.heard.push(id);save();const text=$(`#heard-${id}`);if(text)text.textContent='已播完 · 可以重听';}});});
    bindChoices('data-listen-choice',value=>state.listeningChoice=value);
    $('#listen-reason').oninput=event=>{state.listeningReason=event.target.value;save();};
    $('#reveal-listen').onclick=()=>{
      if(state.heard.length<2){$('#listen-notice').textContent='先把 A、B 各听完一次；没有声音或这次没听清，可以直接去玩节奏。';return;}
      if(!state.listeningChoice){$('#listen-notice').textContent='选一个最接近你听到的变化；拿不准也可以如实留下。';return;}
      const first=!state.revealed;record(0,`A/B 比较选项：${choices[state.listeningChoice]}`,state.listeningReason||'未补充个人听感','听辨过程已留存；个人听感不判分');
      log.note(0,`声音证据：两版仅速度不同；本次选择${state.listeningChoice==='tempo'?'与差异一致':state.listeningChoice==='unsure'?'尚不确定':'与差异不一致'}。`);
      state.revealed=true;save();if(first){log.reopen(0);log.help(0,'听辨后查看速度对照与旋律图');log.finish(0,'听辨过程已留存；个人听感不判分');}render();
    };
    $('#skip-listen').onclick=()=>{if(!log.records[0].first)record(0,'本次略过听辨，未获得可判断的听觉证据','未自动推断原因','可以后再听');go(1);};
    $('#listen-next').onclick=()=>go(1);
    host.querySelectorAll('[data-layer]').forEach(node=>node.onclick=()=>{const id=node.dataset.layer;play(L.buildEvents({...L.defaults,bpm:72,bass:id==='D',chords:id==='D'}),`版本 ${id}`,{onEnd:()=>{if(!state.layerHeard.includes(id))state.layerHeard.push(id);save();const text=$(`#heard-${id}`);if(text)text.textContent='已播完 · 可重听';}});});
    bindChoices('data-layer-choice',value=>state.layerChoice=value);
    $('#reveal-layer').onclick=()=>{
      if(state.layerHeard.length<2||!state.layerChoice){$('#layer-notice').textContent='听完 C 和 D，再选择你的听法。';return;}
      if(!state.layerRevealed)log.draft(0,{$layerFirst:state.layerChoice});
      log.note(0,`${state.layerRevealed?'再次':'首次'}层次听辨：${layerChoices[state.layerChoice]}；实际变化为加入伴奏，主旋律不变。`);
      state.layerRevealed=true;save();$('#layer-answer').hidden=false;log.help(0,'查看伴奏层次对照');
    };
  }
  function tapDescription(attempt){
    const result=attempt.summary;
    return `这轮轻点 ${result.tapCount} 次；按最近拍点配对，8 个位置中有 ${result.matched} 个留下轻点，${result.missed} 个未配到${result.extra?`，另有 ${result.extra} 次未配到独立拍点`:''}。`;
  }
  function rhythm(){
    const latest=state.rhythmAttempts.at(-1);
    host.innerHTML=`<section class="studio-card"><p class="kicker">02 / FIND THE PULSE</p><h2 tabindex="-1">音乐在走，手指跟上。</h2><p class="studio-sub">先听 4 拍预备，再连续轻点 8 拍。跟着声音走，不用追赶屏幕；可以重来，也可以这次先听。</p><div class="beat-row" aria-hidden="true">${[1,2,3,4].map(n=>`<span class="beat-dot">${n}</span>`).join('')}</div><div class="tap-stage"><div><p id="tap-cue" role="status">每分钟 84 拍。预备声结束后接着走。</p>${button('start-tap','开始：预备 4 拍，再接 8 拍',true)}<p class="small-note">尽量使用设备扬声器或有线耳机。蓝牙、触屏和音频延迟可能让记录整体偏移。</p></div><button class="tap-pad" id="tap-pad" type="button" disabled><strong>轻点这里</strong><span>也可聚焦后按空格 · 不用使劲</span></button></div><div id="tap-result" class="reveal" ${latest?'':'hidden'}>${latest?`<p>${tapDescription(latest)}</p><p>首轮已保留，重来不会覆盖。这里只观察这次跟拍，不给钢琴水平打等级。</p>`:''}</div>
      <details class="studio-hint" data-help="拍点与节奏的区别"><summary>拍点和节奏，是一回事吗？</summary><p><strong>拍点</strong>像脚步，给出相对均匀的时间参照。<strong>节奏</strong>安排声音何时出现、持续多久；同一拍可以一个音、两个短音，也可以休止。休止时，心里的拍子仍往前走。</p></details>
      <details class="studio-hint" id="pattern-lab"><summary>再玩一个可选回声：一拍里可以发生什么？</summary><p>这是一个 4/4 拍小节，四分音符为一拍。先听四拍预备，接着听一个小节，再用四格拼出听到的节奏。每格都占一拍：单音 ♩、两个短音 ♪♪，或休止。</p><div class="studio-actions">${button('hear-pattern','听这个小节（含 4 拍预备）')}</div><div class="rhythm-grid">${state.pattern.map((value,index)=>`<label class="rhythm-slot"><span>第 ${index+1} 拍</span><select data-pattern="${index}" aria-label="第${index+1}拍的节奏"><option value="">选声音</option><option value="q" ${value==='q'?'selected':''}>♩ 一个音</option><option value="e" ${value==='e'?'selected':''}>♪♪ 两短音</option><option value="r" ${value==='r'?'selected':''}>休止</option></select></label>`).join('')}</div><div class="studio-actions">${button('hear-mine','听我拼的小节')}${button('check-pattern','两种节奏对照')}</div><p id="pattern-notice" class="notice" role="status"></p><div id="pattern-answer" class="reveal" ${state.patternChecked?'':'hidden'}><p>示范是：<strong>一个音 → 两短音 → 休止 → 一个音</strong>。第二格有两个八分音符，各半拍；第三格没发声，时间却没有停。</p><p>四个格子总共 4 拍，发声次数与拍数可以不同。改一格再听，看看画面是不是也改变了。</p></div></details>
      <div class="studio-actions">${button('rhythm-next','去给画面配乐 →',true)}</div><p class="small-note">${latest?'这轮已自动记下，不用另交一次。':'不想轻点也没关系，进入下一站时会如实记为本次略过。'}</p></section>`;
    $('#start-tap').onclick=()=>{
      play(L.rhythmScore(84),'预备与跟拍',{countIn:4,onReady:clock=>{tapRun={...clock,taps:[]};$('#tap-pad').disabled=false;$('#tap-cue').textContent='先听预备 4 拍，跟拍即将开始。';},onBeat:info=>{$('#tap-cue').textContent=info.phase==='countin'?`预备 ${info.beat+5} / 4`:`跟拍 ${info.beat+1} / 8`;},onEnd:()=>{
        const run=tapRun;tapRun=null;$('#tap-pad').disabled=true;if(!run)return;
        const taps=run.taps.map(time=>Number((time-run.startTime).toFixed(4))),summary=L.analyzeTaps(taps,{startTime:0,beatSeconds:run.beatSeconds,count:8}),attempt={taps,beatSeconds:run.beatSeconds,summary};
        state.rhythmAttempts.push(attempt);if(state.rhythmAttempts.length>6)state.rhythmAttempts.splice(1,1);
        record(1,tapDescription(attempt),'相对首拍的轻点时间（秒）：'+taps.join('、'),'保存的是本次轻点证据，不是钢琴等级');
        if(summary.spreadMs!==null)log.note(1,`本轮计时观察：相对对应拍点的中位偏移为 ${summary.offsetMs} 毫秒（正值偏晚）；扣除这一整体偏移后的中位绝对偏差为 ${summary.spreadMs} 毫秒。这只是本轮配对数据，受设备延迟影响，不作为定级标准。`);
        log.draft(1,{$tapFirst:JSON.stringify(state.rhythmAttempts[0]),$tapLatest:JSON.stringify(attempt)});save();$('#tap-cue').textContent='这一轮走完了。想再来一次，点开始就行。';$('#tap-result').hidden=false;$('#tap-result').innerHTML=`<p>${tapDescription(attempt)}</p><p>首轮已保留，重来不会覆盖。轻点没配到，可能与时机、设备或当时注意有关，先听再试。</p>`;nav();
      }});
    };
    function tap(){
      if(!tapRun)return;const time=audio.now(),position=(time-tapRun.startTime)/tapRun.beatSeconds;
      if(position<-.5||position>7.5){$('#tap-cue').textContent=position<0?'预备还没结束，听下一拍再接。':'最后一拍已过去，正在收好这轮。';return;}
      if(tapRun.taps.length>=64)return;tapRun.taps.push(time);const pad=$('#tap-pad');pad.classList.add('hit');clearTimeout(padTimer);padTimer=setTimeout(()=>pad.classList.remove('hit'),90);
    }
    $('#tap-pad').addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();event.currentTarget.focus({preventScroll:true});tap();});
    $('#tap-pad').addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();if(!event.repeat)tap();}});
    $('#hear-pattern').onclick=()=>play(L.patternScore(L.targetPattern,84),'节奏示范',{countIn:4,onEnd:()=>{state.patternHeard=true;save();}});
    host.querySelectorAll('[data-pattern]').forEach(node=>node.onchange=()=>{state.pattern[Number(node.dataset.pattern)]=node.value;save();});
    $('#hear-mine').onclick=()=>{if(state.pattern.some(value=>!value)){$('#pattern-notice').textContent='先给四格各选一种节奏。';return;}play(L.patternScore(state.pattern,84),'我拼的小节',{countIn:4});};
    $('#check-pattern').onclick=()=>{
      if(!state.patternHeard||state.pattern.some(value=>!value)){$('#pattern-notice').textContent='听完示范，再把四格拼好；不用赶，可以反复听。';return;}
      const labels={q:'一个音',e:'两短音',r:'休止'};
      if(!state.patternFirst){state.patternFirst=[...state.pattern];log.draft(1,{$patternFirst:[...state.pattern]});}
      log.note(1,`${state.patternChecked?'再次':'首次'}节奏回声：${state.pattern.map(value=>labels[value]).join(' → ')}；${JSON.stringify(state.pattern)===JSON.stringify(L.targetPattern)?'与示范一致':'与示范有差异'}。`);
      state.patternChecked=true;save();$('#pattern-answer').hidden=false;log.help(1,'查看短节奏示范答案');
    };
    $('#rhythm-next').onclick=()=>{if(!log.records[1].first){state.rhythmSkipped=true;record(1,'本次未完成 8 拍跟拍','可选节奏回声另见操作记录','略过不代表不会');}go(2);};helpDetails(1);
  }
  function arrangementText(value){const a=L.sanitizeArrangement(value);return `${a.bpm} 拍/分钟；旋律${a.bass?'＋低音':''}${a.chords?'＋和弦':''}${a.pulse?'＋拍点':''}`;}
  function currentMix(){return state.mixStage==='dawn'?state.arrangement:state.transferArrangement;}
  function editMix(){state.mixFinished=false;const journal=$('#music-journal');if(journal)journal.hidden=true;}
  function mix(){
    const night=state.mixStage==='night',a=currentMix(),reason=night?state.transferReason:state.arrangementReason;
    host.innerHTML=`<section class="studio-card"><p class="kicker">03 / MAKE A SCENE</p><h2 tabindex="-1">你来决定，哪些声音留下。</h2><p class="studio-sub">主旋律固定。先只改一项，听出区别，再决定要不要叠加。每次播放是当前旋钮的一张声音快照。</p><div class="mix-steps"><span class="${night?'':'active'}">A 清晨出发</span><span class="${night?'active':''}">B 星空下等待</span></div><div class="mix-scene ${night?'night':''}"><div><h3>${night?'星空下，等一个信号':'门推开了，清晨出发'}</h3><p>${night?'镜头停在一盏忽明忽暗的灯。你希望观众感到什么：期待、安静，还是一点不安？':'一个人收好行囊，推开门，走向远处。轻快、犹豫、坚定，都可能成立。'}</p></div><span class="scene-glyph" aria-hidden="true">${night?'✦':'☀'}</span></div>
      <div class="mix-console"><div class="track-list"><div class="track"><span class="track-mark">♪</span><div><strong>主旋律 · 始终保留</strong><small>高处的线条，贯穿同一段故事</small></div></div>${[['bass','低音','低处的支撑；沿着和声根音走'],['chords','和弦','几种音同时响起，铺出背景'],['pulse','拍点','短促的时间参照，像脚步']].map(([id,label,desc])=>`<label class="track"><input type="checkbox" data-track="${id}" ${a[id]?'checked':''}><span><strong>${label}</strong><small>${desc}</small></span></label>`).join('')}</div><div class="tempo-panel"><label for="mix-tempo" class="tempo-readout"><span>每分钟的拍数 · BPM</span><output id="tempo-output">${a.bpm}</output></label><input id="mix-tempo" type="range" min="60" max="120" step="1" value="${a.bpm}"><p>慢一点，让每拍留出更多时间；快一点，让同样的音更快经过。不是加快录音，所以不会把音调一起抬高。</p><p>这是合成音示意，不能替代真实钢琴的触键与音色。</p></div></div>${roll()}
      <div class="studio-actions">${button('play-mix','▶ 听当前编配',true)}${button('solo-melody','只听主旋律作比较')}${night&&state.dawn?button('play-dawn','回听保留的出发版'):''}</div><p id="mix-feedback" class="small-note">${state.mixPlayed[state.mixStage]?'本场景已经试听；继续调整后可以再听。':'从只听旋律开始，然后加入一个声部试试。'}</p>
      <label class="studio-label" for="mix-reason">${night?'这次我改变／保留……，因为想让画面……':'我留下／拿掉……，因为想让画面……'}</label><textarea id="mix-reason" class="studio-textarea" maxlength="900" placeholder="一句自己的听感就够；说不清，也可以留空以后再聊。">${esc(reason)}</textarea>
      <details class="studio-hint" data-help="编配时一次只改一项"><summary>还没听出差别？给耳朵一个小支点。</summary><p>先用相同速度，比较“只有旋律”和“旋律＋低音”；再只加和弦。想让旋律更显眼，可以试试拿掉一层。想保持往前走的感觉，可以试试拍点。但声音多不等于更好听，速度慢也不一定更悲伤。</p><p>和弦不是音量按钮：本页用 C、Am、F、G 等和弦给旋律不同的背景，部分旋律音会形成短暂张力，再走向较稳定的位置。不必先背名称，先听变化。</p></details>
      <div class="studio-actions">${button('keep-mix',night?'把这两段配乐收好':'留住出发版，换个画面 →',true)}${night?button('back-dawn','回到出发版再听'):''}</div><p id="mix-notice" class="notice" role="status"></p>
      <div id="music-journal" ${state.mixFinished?'':'hidden'}>${state.mixFinished?journal():''}</div></section>`;
    host.querySelectorAll('[data-track]').forEach(node=>node.onchange=()=>{stop('编配已改变；点“听当前编配”试听这一版。');editMix();currentMix()[node.dataset.track]=node.checked;state.mixPlayed[state.mixStage]=false;trace(`${night?'等待版':'出发版'}：${node.checked?'加入':'拿掉'}${{bass:'低音',chords:'和弦',pulse:'拍点'}[node.dataset.track]}`);$('#mix-feedback').textContent='刚改变了一项，重播比较它带来的效果。';});
    $('#mix-tempo').oninput=event=>{editMix();currentMix().bpm=Number(event.target.value);$('#tempo-output').textContent=event.target.value;state.mixPlayed[state.mixStage]=false;save();};
    $('#mix-tempo').onchange=()=>{stop('速度已改变；点播放试听这一版。');trace(`${night?'等待版':'出发版'}：速度改为 ${currentMix().bpm} 拍/分钟`);$('#mix-feedback').textContent='速度已改，重播比较听感。';};
    $('#mix-reason').oninput=event=>{editMix();if(night)state.transferReason=event.target.value;else state.arrangementReason=event.target.value;save();};
    $('#play-mix').onclick=()=>{const captured={...currentMix()},scene=state.mixStage;play(L.buildEvents(captured),night?'等待版':'出发版',{onEnd:()=>{if(scene===state.mixStage&&JSON.stringify(captured)===JSON.stringify(currentMix())){state.mixPlayed[scene]=true;trace(`${scene==='dawn'?'出发版':'等待版'}试听完：${arrangementText(captured)}`);$('#mix-feedback').textContent='这版已听完。保留或再改，都由你的耳朵决定。';}}});};
    $('#solo-melody').onclick=()=>{log.help(2,'用同速度的裸旋律作对照');play(L.buildEvents({...L.defaults,bpm:currentMix().bpm}),'当前速度的主旋律');};
    if($('#play-dawn'))$('#play-dawn').onclick=()=>play(L.buildEvents(state.dawn),'保留的出发版');
    if($('#back-dawn'))$('#back-dawn').onclick=()=>{state.mixStage='dawn';save();render();};
    $('#keep-mix').onclick=()=>{
      if(!state.mixPlayed[state.mixStage]){$('#mix-notice').textContent='先把当前编配听完一次，再决定收好哪一版；改了旋钮也要重新听。';return;}
      if(!night){
        const firstNight=!state.dawn;state.dawn={...state.arrangement};state.dawnReason=state.arrangementReason;log.draft(2,{$dawnFirst:log.records[2].draft.$dawnFirst||JSON.stringify({...state.dawn,reason:state.dawnReason}),$dawnLatest:JSON.stringify({...state.dawn,reason:state.dawnReason})});
        if(firstNight){state.transferArrangement={...state.dawn};state.transferReason='';state.mixPlayed.night=false;}
        state.mixStage='night';state.mixFinished=false;save();render();return;
      }
      record(2,`清晨出发：${arrangementText(state.dawn)}。星空下等待：${arrangementText(state.transferArrangement)}。`,`出发版：${state.dawnReason||'未补充理由'}；等待版：${state.transferReason||'未补充理由'}`,'两个版本已保存；编配选择不自动判分');
      log.draft(2,{$dawn:JSON.stringify(state.dawn),$night:JSON.stringify(state.transferArrangement)});state.mixFinished=true;save();$('#music-journal').innerHTML=journal();$('#music-journal').hidden=false;nav();$('#music-journal').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    };helpDetails(2);
  }
  function journal(){
    const first=state.rhythmAttempts[0];
    return `<section class="journal"><p class="kicker">YOUR SESSION / 已收好</p><h3>今天，你让同一段旋律住进了两个画面。</h3><p>以后可以再改。下次听《太阳照常升起》时，试着留意：哪条声音一直在，哪一层后来才加入？不急着说出乐器名称，先听见它的作用。</p><div class="journal-grid"><div class="journal-item"><strong>耳朵 · 听见了什么</strong><p>${log.records[0].first?esc(log.records[0].first.answer):'这次尚未留下听辨想法，可以以后再听。'}</p></div><div class="journal-item"><strong>拍点 · 留下的是一次过程</strong><p>${first?esc(tapDescription(first)):'本次没有完整跟拍证据，不推断能力。'}</p></div><div class="journal-item"><strong>编配 · 选择让声音有了方向</strong><p>出发：${esc(arrangementText(state.dawn))}<br>等待：${esc(arrangementText(state.transferArrangement))}</p></div></div><p class="small-note">这是一次创作过程，不是乐理等级证书。首次听法、首轮跟拍、节奏回声与编配理由已按实际操作保存；空白也会如实保留。</p><details><summary>家长回看 · 首次尝试、帮助与编配过程</summary>${log.html()}</details><a class="back-link" href="records.html">去学习记录查看或导出 ↗</a></section>`;
  }
  document.querySelectorAll('[data-tab]').forEach(node=>node.onclick=()=>go(Number(node.dataset.tab)));
  $('#stop-audio').onclick=()=>stop();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('页面离开后声音已暂停；未完成的一轮不计入结果。');});
  window.addEventListener('pagehide',()=>stop());
  render();
})();
