/* Local learning evidence. Standalone lessons embed this same file. No network writes. */
(function (root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const prefix='curiosity-station:learning:v1:';
  const courses=[['buoyancy','钢会沉，钢造的轮船为什么能浮？','buoyancy.html'],['baicao','共读《从百草园到三味书屋》：小园子里，藏着多少趣味？','baicao.html'],['beiying','共读《背影》：那个背影，为什么留在记忆里？','beiying.html'],['weighted','两组平均数都有了，为什么不能再除以2？','weighted.html'],['focus','写了一堆好事，为什么还是没扣住题？','focus.html'],['fairtest','只改一个条件，结论就一定可信吗？','fairtest.html'],['briefing','任务单收起来，你能给队友讲清楚吗？','briefing.html'],['causal','这句话是在讲原因，还是只说现象？','causal.html'],['discount','打折再加运费，为什么不能一起乘？','discount.html'],['angle180','180°从哪里来？角到底在量什么？','angle180.html'],['glacier','冰河时代调查局：这片没有冰的山谷，曾经有冰川吗？','glacier.html'],['parachute','降落伞越大，就一定越好吗？','parachute.html'],['addition','加上一个数，结果一定变大吗？','addition.html'],['elements','只有一种元素，就一定是纯净物吗？','elements.html'],['pressure','大脚板，为什么不容易陷下去？','pressure.html'],['character','手在发抖，就一定胆小吗？','character.html'],['hangar','机库里有，就代表我有吗？','hangar.html'],['photosynthesis','植物的糖，是从土里吸来的吗？','photosynthesis.html'],['quotient','分装小站：除法到底在找什么？','quotient.html'],['daynight','太阳没关灯，为什么天黑了？','daynight.html'],['inertia','车停了，人为什么还往前？','inertia.html'],['purity','看起来一样，就是纯净物吗？','purity.html'],['math','圆，遇上正方形','lesson.html?topic=math'],['chinese','六年级语文 · 句式转换','lesson.html?topic=chinese'],['english','英语 · 机器狗，还是一只真狗？','english.html'],['scale','造一枚迷你火箭：比例尺到底怎么用？','scale.html'],['balance','9 个果子，只称 2 次？','balance.html'],['rocket','火箭为什么要回收？','rocket.html'],['charts','两张图都没造假，为什么结论相反？','charts.html'],['reading','这句话能证明你的答案吗？','reading.html'],['equation','神秘货箱有多重？','equation.html'],['speed','跑得远，就一定更快吗？','speed.html'],['map','地图转了，北方也会跟着转吗？','map.html'],['change','冒泡了，就一定发生化学变化吗？','change.html'],['tomato','一颗番茄，是组织还是器官？','tomato.html'],['now','平时常做，还是此刻正在做？','now.html'],['negative','零下8℃和零下3℃，哪里更暖？','negative.html'],['density','更重的积木，材料就更“密”吗？','density.html'],['contour','两条上山路，哪条更陡？','contour.html'],['cell','没有叶绿体，就不是植物细胞吗？','cell.html'],['subtract','减去负数，为什么反而变大？','subtract.html'],['past','昨天的试飞，怎么用英语讲清楚？','past.html'],['gist','一句话说清整件事','gist.html'],['particle','水蒸发了，分子也变大了吗？','particle.html'],['supplies','两瓶水，英语里究竟在数什么？','supplies.html'],['qualifier','一个“约”字，为什么不能随便删？','qualifier.html'],['power','3⁴是12吗？把乘方拆开看','power.html'],['division','细胞变多了，分工就会自动出现吗？','division.html'],['grid','只差一个字母，地点能跑到哪儿？','grid.html'],['forces','两个力一样大，就会互相抵消吗？','forces.html'],['multiply','负数乘负数，为什么是正数？','multiply.html']];
  courses.splice(courses.findIndex(course=>course[0]==='angle180')+1,0,['persuade','我选这个方案，但你能说服我改主意吗？','persuade.html']);
  courses.splice(courses.findIndex(course=>course[0]==='persuade')+1,0,['parallel','不拿量角器，怎么把一个角搬过去？','parallel.html']);
  courses.unshift(['repair','错题修复①：数量、语境与判断','repair.html'],['repair-words','错题修复②：词句与表达','repair.html?round=2'],['repair-math-01','近期数学强化考试①：分数运算与单位“1”','repair.html?round=math-01&exam=1']);
  courses.unshift(['journey','人停了，图上的线为什么还在？','journey.html']);
  const readalongs={beiying:6,baicao:24,chun:10};
  courses.unshift(['chun','共读《春》：一句话怎样让画面动起来？','chun.html']);
  courses.splice(courses.findIndex(course=>course[0]==='chun')+1,0,['triangle180','三角形三个角为什么正好是180°？','triangle180.html']);
  const clone=value=>JSON.parse(JSON.stringify(value));
  const newId=()=>Date.now().toString(36)+'-'+(root.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
  let storageError=false;
  const bridged=!!root.__learningSeed;
  const validTaskCount=s=>Array.isArray(s?.records) && (s.taskCount===undefined ? s.records.length===5 : Number.isInteger(s.taskCount)&&s.taskCount>=1&&s.taskCount<=20&&s.records.length===s.taskCount);
  function valid(s) {return s?.version===1 && typeof s.id==='string' && /^[a-zA-Z0-9-]+$/.test(s.id) && typeof s.title==='string' && validTaskCount(s) && s.records.every(r=>Array.isArray(r.attempts)&&Array.isArray(r.helps)&&Array.isArray(r.notes));}
  // Older cached registries recorded newly published lessons as 'other'.
  // Resolve only an exact known title; keep all learning evidence untouched.
  function resolveCourse(session) {
    const course=session?.courseId==='other' && courses.find(c=>c[1]===session.title);
    return course ? {...session,courseId:course[0]} : session;
  }
  function history() {
    if(bridged) return clone(root.__learningSeed.sessions || []).map(resolveCourse).sort((a,b)=>b.updatedAt-a.updatedAt);
    try {
      const result=[],storage=root.localStorage;
      if(!storage) return result;
      for(let i=0;i<storage.length;i++) {
        const key=storage.key(i);
        if(!key?.startsWith(prefix)) continue;
        try {const s=JSON.parse(storage.getItem(key));if(valid(s))result.push(resolveCourse(s));}catch(_) { /* Keep unreadable entries untouched. */ }
      }
      return result.sort((a,b)=>b.updatedAt-a.updatedAt);
    } catch(_) {storageError=true;return [];}
  }
  function announce(state) {
    if(!root.document) return;
    let box=root.document.getElementById('learning-save-status');
    if(!box) {box=root.document.createElement('p');box.id='learning-save-status';box.className='learning-save-status';box.setAttribute('role','status');root.document.body.append(box);}
    box.textContent=state==='saved'?'学习记录已自动保存在本机':state==='saving'?'正在保存本机记录…':'本机保存未成功，请先截图保留这次记录';
    box.dataset.state=state;
  }
  function write(session,remote=false) {
    if(bridged) {
      session.revision++;
      const sessions=root.__learningSeed.sessions;
      const index=sessions.findIndex(s=>s.id===session.id);
      if(index<0)sessions.push(clone(session));else sessions[index]=clone(session);
      announce('saving');
      root.parent.postMessage({type:'learning-save-v1',session:clone(session)},'*');
      return;
    }
    try {
      if(!root.localStorage) return;
      const stored=JSON.parse(root.localStorage.getItem(prefix+session.id)||'null');
      // A stale second tab gets a separate copy instead of overwriting newer work.
      if(remote && stored && stored.revision>=session.revision)throw new Error('Newer record exists');
      if(!remote && stored && stored.revision>session.revision) {session.id=newId();session.revision=0;}
      if(!remote)session.revision++;
      root.localStorage.setItem(prefix+session.id,JSON.stringify(session));
      storageError=false;if(!remote)announce('saved');
    } catch(_) {storageError=true;if(!remote)announce('failed');}
  }
  if(bridged) root.addEventListener('message',event=>{
    if(event.source===root.parent && event.data?.type==='learning-saved-v1') {storageError=!event.data.ok;announce(event.data.ok?'saved':'failed');}
  });
  function installMathBridge(frame) {
    root.addEventListener('message',event=>{
      const s=event.data?.session;
      if(event.source!==frame.contentWindow || event.data?.type!=='learning-save-v1' || !valid(s) || s.courseId!=='math' || JSON.stringify(s).length>2000000) return;
      write(s,true);
      event.source.postMessage({type:'learning-saved-v1',ok:!storageError},'*');
    });
  }
  function create(title, questions, fresh=false) {
    if (!Array.isArray(questions) || questions.length<1 || questions.length>20 || Array.from(questions).some(q=>!q || !['string','object'].includes(typeof q))) throw new Error('A lesson needs a complete task list');
    const existing=history();
    const saved=!fresh && existing.find(s=>s.title===title && s.records.length===questions.length);
    const session=saved || {version:1,id:newId(),courseId:courses.find(c=>c[1]===title)?.[0]||'other',title,startedAt:Date.now(),updatedAt:Math.max(Date.now(),(existing[0]?.updatedAt||0)+1),revision:0,taskCount:questions.length,checkpoint:{},records:questions.map(q=>({title:q.title||q,context:[q.context,q.source,q.task].filter(Boolean).join(' '),first:null,attempts:[],helps:[],notes:[],done:false,self:'',draft:{}}))};
    const records=session.records;
    let active=!!saved;
    function save() {active=true;session.updatedAt=Math.max(Date.now(),session.updatedAt+1);if(records.every(r=>r.done)&&!session.completedAt)session.completedAt=Date.now();write(session);}
    function point(patch) {Object.assign(session.checkpoint,patch);save();}
    function draft(index,fields) {records[index].draft={...records[index].draft,...fields};save();}
    function help(index, label) {
      const r = records[index];
      const phase = r.done ? '完成后回看' : r.first ? '首答后' : '首答前';
      if (!r.helps.some(h => h.label === label && h.phase === phase)) r.helps.push({label, phase});
      save();
    }
    function submit(index, answer, correct = null, explanation = '') {
      const r = records[index];
      if (!String(answer).trim() || r.done) return false;
      const attempt = {answer:String(answer).trim(), correct, explanation:String(explanation).trim(), helped:r.helps.some(h=>h.phase !== '完成后回看')};
      r.attempts.push(attempt);
      if (!r.first) r.first = {...attempt};
      save();
      return true;
    }
    function note(index, text) {
      const notes = records[index].notes;
      if (text && notes[notes.length-1] !== text) notes.push(String(text));
      save();
    }
    function finish(index, self = '') { records[index].done = true; records[index].self = self; save(); }
    function reopen(index) { records[index].done = false; records[index].self = ''; delete session.completedAt; save(); }
    function status(r) {
      if (!r.first) return '未提交答案';
      if (r.first.correct === null) return '表达 / 自检，未自动判分';
      if (r.first.correct) return r.first.helped ? '首答正确，答前用过帮助' : '首答正确，答前未打开帮助';
      return r.attempts.some(a=>a.correct) ? '首答未通过，重试后通过' : '首答未通过，已查看方法或仍需帮助';
    }
    function html() {
      const readalongId=courses.find(c=>readalongs[c[0]]&&c[1]===title)?.[0];
      if (readalongId && records.length===1) {
        const r=records[0],last=r.attempts[r.attempts.length-1],p=r.draft?.$paragraph;
        const phases={'首答前':'留想法前','首答后':'留过想法后','完成后回看':'收好后回看'};
        return `<section class="learning-report" aria-label="本次共读记录"><h3>共读便笺 · ${r.done?'这次先收好':'可以慢慢读'}</h3><p class="report-course">${esc(title)}</p>${storageError?'<p class="report-status">本机保存未成功，请先截图保留。</p>':''}<p class="report-note">阅读轨迹与个人想法，不自动判分，也不认定已经读懂。</p><ol class="report-list"><li><h4>这次留下的文字</h4>${Number.isInteger(p)&&p>=1&&p<=readalongs[readalongId]?`<p><b>上次页面停留：</b>原文第 ${p} 段（位置记录，不是读完证明）。</p>`:''}${r.draft?.quote?`<p><b>摘句：</b><span class="report-words">${esc(r.draft.quote)}</span></p>`:''}${r.draft?.note?`<p><b>感受、解释或疑问：</b><span class="report-words">${esc(r.draft.note)}</span></p>`:''}${r.first?`<p><b>第一次留存：</b><span class="report-words">${esc(r.first.answer)}</span></p>`:r.draft?.quote||r.draft?.note?'<p>便笺已自动保存；也可以用“留住这版想法”保留一个修改前的版本。</p>':'<p>这次还没留文字。可以只读、只聊，下次再留便笺。</p>'}${r.attempts.length>1?`<p><b>最近留存：</b><span class="report-words">${esc(last.answer)}</span></p>`:''}<p><b>便笺小启发：</b>${r.helps.length?r.helps.map(h=>`${esc(phases[h.phase]||h.phase)}·${esc(h.label)}`).join('；'):'未打开；正常共读讲解不计作答求助'}</p>${r.notes.map(n=>`<p class="report-note">${esc(n)}</p>`).join('')}</li></ol><p class="report-note">记录只在本机保存，可从学习记录导出备份。没有记录下来的口头交流无法自动识别；收好便笺不等于掌握阅读方法。</p></section>`;
      }
      if (title===courses.find(c=>c[0]==='focus')?.[1] && records.length===1) {
        const r=records[0],first=r.first,last=r.attempts[r.attempts.length-1],draft=r.draft?.text;
        const phases={'首答前':'初稿前','首答后':'留住初稿后','完成后回看':'收好后回看'};
        return `<section class="learning-report" aria-label="本次写作过程"><h3>作品回看 · ${r.done?'已收好':'可继续写与改'}</h3><p class="report-course">${esc(title)}</p>${storageError?'<p class="report-status">本机保存未成功，请先截图保留这次文字。</p>':''}<p class="report-note">保留作品与表达选择，不自动判分，也不据此认定长期掌握。</p><ol class="report-list"><li><h4>${esc(r.title)}</h4><p><b>初稿：</b><span class="report-words">${esc(first?.answer||'还没有留住初稿，可以先读、先写。')}</span></p>${r.attempts.length>1?`<p><b>最近留稿：</b><span class="report-words">${esc(last.answer)}</span></p>`:''}${last?.explanation?`<p><b>这次修改的理由：</b><span class="report-words">${esc(last.explanation)}</span></p>`:''}${!r.done&&draft&&draft!==last?.answer?`<p><b>自动保存的草稿：</b><span class="report-words">${esc(draft)}</span></p>`:''}${!r.done&&r.draft?.reason&&r.draft.reason!==last?.explanation?`<p><b>草稿中的修改说明：</b>${esc(r.draft.reason)}</p>`:''}<p><b>写作提示：</b>${r.helps.length?r.helps.map(h=>`${esc(phases[h.phase]||h.phase)}·${esc(h.label)}`).join('；'):'未打开写作小提示（正常共读、品词句不计求助）'}</p><p>已留 ${r.attempts.length} 版文字${r.done?'；这次先收好，以后可继续改。':'；随时可回来接着写。'}</p>${r.notes.map(n=>`<p class="report-note">${esc(n)}</p>`).join('')}</li></ol><p class="report-note">记录仅保存在当前设备的浏览器／桌面入口，不上传。外部帮助无法自动识别。学习记录中的导出可用来备份、转移或交给家长分析。</p></section>`;
      }
      return `<section class="learning-report" aria-label="本次学习反馈"><h3>本次学习反馈 · ${records.filter(r=>r.done).length} / ${records.length} ${records.length===5||title.includes('考试')?'题':'环节'}完成</h3><p class="report-course">${esc(title)}</p>${storageError?'<p class="report-status">本机保存未成功，请先截图保留这次记录。</p>':''}<p class="report-note">记录按作答过程保留，随时可以截图给家长；首答与求助记录帮助发现下一步，不等于已经长期掌握。</p><ol class="report-list">${records.map((r,i)=>{
        const first = r.first;
        const last = r.attempts[r.attempts.length-1];
        const laterExplanation = last?.explanation && last.explanation !== first?.explanation;
        return `<li><h4>${i+1}. ${esc(r.title)}</h4>${r.context?`<p class="report-context">${esc(r.context)}</p>`:''}<p class="report-status">${esc(status(r))}</p><p><b>首次答案：</b><span class="report-words">${esc(first?.answer || (r.done?'未提交，直接查看方法':'尚未提交'))}</span></p>${first?.explanation&&first.explanation!==first.answer?`<p><b>首次解释：</b><span class="report-words">${esc(first.explanation)}</span></p>`:''}${last && last !== first && r.attempts.length>1?`<p><b>最后提交：</b>${esc(last.answer)}</p>`:''}${laterExplanation?`<p><b>修改后解释：</b>${esc(last.explanation)}</p>`:''}<p><b>帮助：</b>${r.helps.length?r.helps.map(h=>`${esc(h.phase)}·${esc(h.label)}`).join('；'):'未打开提示或回看'}</p><p>有效提交 ${r.attempts.length} 次${r.self?`；自评：${esc(r.self)}`:''}。</p>${!r.done&&Object.entries(r.draft||{}).some(([k,v])=>typeof v==='string'&&v.trim()&&!k.startsWith('$'))?`<p><b>未提交草稿：</b><span class="report-words">${Object.entries(r.draft).filter(([k,v])=>typeof v==='string'&&v.trim()&&!k.startsWith('$')).map(([k,v])=>esc(v)).join('；')}</span></p>`:''}${r.notes.map(n=>`<p class="report-note">${esc(n)}</p>`).join('')}</li>`;
      }).join('')}</ol><p class="report-note">文字与操作记录自动保存在当前浏览器／桌面入口，不上传。纸上演算、外部求助无法自动识别；若某课使用浏览器临时录音，音频只在本次页面回听，不保存。</p></section>`;
    }
    return {records, help, submit, note, finish, reopen, html, save, point, draft, checkpoint:session.checkpoint, get active(){return active;}, get index(){const i=records.findIndex(r=>!r.done);return i<0?records.length:i;}};
  }
  function reasonField(label = '留一句自己的理由', placeholder = '一句话或一个算式就好，也可用键盘上的语音输入。') {
    return `<div class="evidence-reason"><label for="my-reason">${esc(label)}</label><textarea id="my-reason" maxlength="500" rows="2" placeholder="${esc(placeholder)}"></textarea><label class="reason-unsure"><input type="checkbox" id="reason-unsure">我暂时说不清，先记下来</label><p class="report-note">这是本题的一部分，不另加题；先留自己的想法，再看参考。</p></div>`;
  }
  function readReason(container) {
    const input = container.querySelector('#my-reason');
    return input?.value.trim() || (container.querySelector('#reason-unsure')?.checked ? '暂时说不清' : null);
  }
  const bindings=new WeakMap();
  function watchDraft(container,log,index) {
    const previous=bindings.get(container);
    if(previous) for(const type of ['input','change','click'])container.removeEventListener(type,previous,true);
    const fields=log.records[index].draft || {};
    container.querySelectorAll('input,textarea,select').forEach(el=>{
      const key=el.type==='radio'?'$radio:'+el.name:el.id;
      if(!key || !(key in fields))return;
      if(el.type==='radio')el.checked=el.value===fields[key];
      else if(el.type==='checkbox')el.checked=fields[key];else el.value=fields[key];
    });
    container.querySelectorAll('[data-answer],[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.answer??el.dataset.choice)===fields.$choice)));
    const listener=event=>{
      const el=event.target;
      if(event.type==='click') {
        const button=el.closest('[data-answer],[data-choice]');
        if(button&&!button.disabled)log.draft(index,{$choice:Number(button.dataset.answer??button.dataset.choice)});
      } else if(el.matches('input,textarea,select')&&!el.disabled) {
        const key=el.type==='radio'?'$radio:'+el.name:el.id;
        if(key)log.draft(index,{[key]:el.type==='checkbox'?el.checked:el.value});
      }
    };
    for(const type of ['input','change','click'])container.addEventListener(type,listener,true);
    bindings.set(container,listener);
  }
  function watchHelp(container, log, index) {
    watchDraft(container,log,index);
    container.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open) log.help(index,details.dataset.help);}));
  }
  root.LearningFeedback = {flexibleTasks:true, validTaskCount, create, esc, reasonField, readReason, watchHelp, watchDraft, history, courses, readalongs, resolveCourse, installMathBridge, get storageError(){return storageError;}};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.LearningFeedback;
})(typeof window !== 'undefined' ? window : globalThis);
