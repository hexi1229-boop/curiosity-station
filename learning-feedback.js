/* Local learning evidence. Standalone lessons embed this same file. No network writes. */
(function (root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const prefix='curiosity-station:learning:v1:';
  const courses=[['math','圆，遇上正方形','lesson.html?topic=math'],['chinese','六年级语文 · 句式转换','lesson.html?topic=chinese'],['english','英语 · 机器狗，还是一只真狗？','english.html'],['scale','造一枚迷你火箭：比例尺到底怎么用？','scale.html'],['balance','9 个果子，只称 2 次？','balance.html'],['rocket','火箭为什么要回收？','rocket.html'],['charts','两张图都没造假，为什么结论相反？','charts.html'],['reading','这句话能证明你的答案吗？','reading.html'],['equation','神秘货箱有多重？','equation.html'],['speed','跑得远，就一定更快吗？','speed.html'],['map','地图转了，北方也会跟着转吗？','map.html'],['change','冒泡了，就一定发生化学变化吗？','change.html'],['tomato','一颗番茄，是组织还是器官？','tomato.html'],['now','平时常做，还是此刻正在做？','now.html'],['negative','零下8℃和零下3℃，哪里更暖？','negative.html'],['density','更重的积木，材料就更“密”吗？','density.html'],['contour','两条上山路，哪条更陡？','contour.html'],['cell','没有叶绿体，就不是植物细胞吗？','cell.html'],['subtract','减去负数，为什么反而变大？','subtract.html'],['past','昨天的试飞，怎么用英语讲清楚？','past.html'],['gist','一句话说清整件事','gist.html'],['particle','水蒸发了，分子也变大了吗？','particle.html'],['qualifier','一个“约”字，为什么不能随便删？','qualifier.html'],['power','3⁴是12吗？把乘方拆开看','power.html'],['division','细胞变多了，分工就会自动出现吗？','division.html'],['grid','只差一个字母，地点能跑到哪儿？','grid.html'],['forces','两个力一样大，就会互相抵消吗？','forces.html'],['multiply','负数乘负数，为什么是正数？','multiply.html']];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const newId=()=>Date.now().toString(36)+'-'+(root.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
  let storageError=false;
  const bridged=!!root.__learningSeed;
  function valid(s) {return s?.version===1 && typeof s.id==='string' && /^[a-zA-Z0-9-]+$/.test(s.id) && typeof s.title==='string' && Array.isArray(s.records) && s.records.length===5 && s.records.every(r=>Array.isArray(r.attempts)&&Array.isArray(r.helps)&&Array.isArray(r.notes));}
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
    if (questions.length !== 5) throw new Error('A lesson has exactly five tasks');
    const existing=history();
    const saved=!fresh && existing.find(s=>s.title===title);
    const session=saved || {version:1,id:newId(),courseId:courses.find(c=>c[1]===title)?.[0]||'other',title,startedAt:Date.now(),updatedAt:Math.max(Date.now(),(existing[0]?.updatedAt||0)+1),revision:0,checkpoint:{},records:questions.map(q=>({title:q.title||q,context:[q.context,q.source,q.task].filter(Boolean).join(' '),first:null,attempts:[],helps:[],notes:[],done:false,self:'',draft:{}}))};
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
    function status(r) {
      if (!r.first) return '未提交答案';
      if (r.first.correct === null) return '表达 / 自检，未自动判分';
      if (r.first.correct) return r.first.helped ? '首答正确，答前用过帮助' : '首答正确，答前未打开帮助';
      return r.attempts.some(a=>a.correct) ? '首答未通过，重试后通过' : '首答未通过，已查看方法或仍需帮助';
    }
    function html() {
      return `<section class="learning-report" aria-label="本次学习反馈"><h3>本次学习反馈 · ${records.filter(r=>r.done).length} / 5 题完成</h3><p class="report-course">${esc(title)}</p>${storageError?'<p class="report-status">本机保存未成功，请先截图保留这次记录。</p>':''}<p class="report-note">记录按作答过程保留，随时可以截图给家长；首答与求助记录帮助发现下一步，不等于已经长期掌握。</p><ol class="report-list">${records.map((r,i)=>{
        const first = r.first;
        const last = r.attempts[r.attempts.length-1];
        const laterExplanation = last?.explanation && last.explanation !== first?.explanation;
        return `<li><h4>${i+1}. ${esc(r.title)}</h4>${r.context?`<p class="report-context">${esc(r.context)}</p>`:''}<p class="report-status">${esc(status(r))}</p><p><b>首次答案：</b><span class="report-words">${esc(first?.answer || (r.done?'未提交，直接查看方法':'尚未提交'))}</span></p>${first?.explanation&&first.explanation!==first.answer?`<p><b>首次解释：</b><span class="report-words">${esc(first.explanation)}</span></p>`:''}${last && last !== first && r.attempts.length>1?`<p><b>最后提交：</b>${esc(last.answer)}</p>`:''}${laterExplanation?`<p><b>修改后解释：</b>${esc(last.explanation)}</p>`:''}<p><b>帮助：</b>${r.helps.length?r.helps.map(h=>`${esc(h.phase)}·${esc(h.label)}`).join('；'):'未打开提示或回看'}</p><p>有效提交 ${r.attempts.length} 次${r.self?`；自评：${esc(r.self)}`:''}。</p>${!r.done&&Object.entries(r.draft||{}).some(([k,v])=>typeof v==='string'&&v.trim()&&!k.startsWith('$'))?`<p><b>未提交草稿：</b><span class="report-words">${Object.entries(r.draft).filter(([k,v])=>typeof v==='string'&&v.trim()&&!k.startsWith('$')).map(([k,v])=>esc(v)).join('；')}</span></p>`:''}${r.notes.map(n=>`<p class="report-note">${esc(n)}</p>`).join('')}</li>`;
      }).join('')}</ol><p class="report-note">文字与操作记录自动保存在当前浏览器／桌面入口，不上传。纸上演算、外部求助无法自动识别；录音只在本次页面回听，不保存音频。</p></section>`;
    }
    return {records, help, submit, note, finish, html, save, point, draft, checkpoint:session.checkpoint, get active(){return active;}, get index(){const i=records.findIndex(r=>!r.done);return i<0?5:i;}};
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
  root.LearningFeedback = {create, esc, reasonField, readReason, watchHelp, watchDraft, history, courses, resolveCourse, installMathBridge, get storageError(){return storageError;}};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.LearningFeedback;
})(typeof window !== 'undefined' ? window : globalThis);
