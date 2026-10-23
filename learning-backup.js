/* File backups stay on the device. Import adds records; it never replaces them. */
(function(root) {
  'use strict';
  const prefix='curiosity-station:learning:v1:';
  const format='curiosity-station-learning-backup';
  const maxBytes=20*1024*1024;
  const plain=v=>v!==null && typeof v==='object' && !Array.isArray(v);
  const text=v=>typeof v==='string';
  const integer=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const time=v=>integer(v,0,8640000000000000);
  const id=v=>text(v)&&/^[a-zA-Z0-9-]{1,200}$/.test(v);
  const maybe=(v,check)=>v===undefined||check(v);
  const canonical=v=>JSON.stringify(v,(_,value)=>plain(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
  function safeTree(value,depth=0) {
    if(depth>16)throw Error('文件结构异常，请选择小站导出的原始备份。');
    if(Array.isArray(value))value.forEach(v=>safeTree(v,depth+1));
    else if(plain(value))for(const [key,v] of Object.entries(value)) {
      if(['__proto__','constructor','prototype'].includes(key))throw Error('文件结构异常，请选择小站导出的原始备份。');
      safeTree(v,depth+1);
    }
  }
  const attempt=a=>plain(a)&&text(a.answer)&&text(a.explanation)&&[true,false,null].includes(a.correct)&&typeof a.helped==='boolean';
  const draftScalar=v=>text(v)||typeof v==='boolean'||Number.isFinite(v);
  const draftValue=v=>draftScalar(v)||(Array.isArray(v)&&v.length<=100&&v.every(item=>item===null||draftScalar(item)));
  function record(r) {
    return plain(r)&&text(r.title)&&text(r.context)&&typeof r.done==='boolean'&&text(r.self)&&
      Array.isArray(r.attempts)&&r.attempts.every(attempt)&&
      (r.first===null?r.attempts.length===0:attempt(r.first)&&canonical(r.first)===canonical(r.attempts[0]))&&
      Array.isArray(r.helps)&&r.helps.every(h=>plain(h)&&text(h.label)&&['首答前','首答后','完成后回看'].includes(h.phase))&&
      Array.isArray(r.notes)&&r.notes.every(text)&&maybe(r.draft,d=>plain(d)&&Object.values(d).every(draftValue));
  }
  const fruitList=v=>Array.isArray(v)&&v.every(n=>integer(n,1,9))&&new Set(v).size===v.length;
  function checkpoint(c,course) {
    if(!plain(c))return false;
    if(course==='english'&&(!maybe(c.audioPlays,v=>integer(v))||!maybe(c.speechReview,v=>integer(v,2,4))))return false;
    if(course==='balance') {
      if(!maybe(c.round,v=>integer(v,1)))return false;
      if(c.balance!==undefined) {
        const b=c.balance;
        if(!plain(b)||!integer(b.heavy,1,9)||!Array.isArray(b.places)||b.places.length!==9||!b.places.every(v=>['left','right','table'].includes(v))||
          !fruitList(b.candidates)||!b.candidates.length||!['left','right','table'].includes(b.target)||typeof b.dirty!=='boolean'||typeof b.solved!=='boolean'||
          !Array.isArray(b.records)||b.records.length>2||!b.records.every(r=>plain(r)&&fruitList(r.left)&&fruitList(r.right)&&r.left.length>0&&r.left.length===r.right.length&&!r.left.some(n=>r.right.includes(n))&&['left','right','level'].includes(r.result))||
          !maybe(b.guess,v=>v===''||/^[1-9]$/.test(String(v))))return false;
      }
    }
    if(course==='charts'&&c.charts!==undefined) {
      const v=c.charts;
      if(!plain(v)||!integer(v.questionIndex,1,5)||!integer(v.axis,0,79)||!(v.selectedFirst===null||integer(v.selectedFirst,0,3))||typeof v.firstLocked!=='boolean'||
        !['judge','lab','practice'].includes(v.panel)||!Array.isArray(v.seenStarts)||v.seenStarts.length>2||!v.seenStarts.every(n=>n===0||n===79)||
        !Array.isArray(v.records)||v.records.length!==5||!v.records.every(r=>plain(r)&&(r.first===null||text(r.first))&&integer(r.attempts)&&typeof r.hint==='boolean'&&typeof r.review==='boolean'&&typeof r.correct==='boolean'&&maybe(r.firstCorrect,x=>typeof x==='boolean')&&maybe(r.self,x=>['clear','help'].includes(x))))return false;
      if(v.panel!=='judge'&&!v.firstLocked || v.panel==='practice'&&new Set(v.seenStarts).size!==2)return false;
    }
    return true;
  }
  function validate(s) {
    s=root.LearningFeedback.resolveCourse?.(s) || s;
    const course=root.LearningFeedback.courses.find(c=>c[0]===s?.courseId);
    if(!plain(s)||s.version!==1||!id(s.id)||!course||course[1]!==s.title||!time(s.startedAt)||!time(s.updatedAt)||!maybe(s.completedAt,time)||!integer(s.revision)||
      !maybe(s.backupOriginId,id)||!root.LearningFeedback.validTaskCount(s)||!s.records.every(record)||!checkpoint(s.checkpoint,s.courseId))throw Error('备份中的课程记录不完整或版本不兼容，未导入任何记录。请保留原文件。');
    return s;
  }
  function readLocal() {
    const sessions=[];
    let readingTitle='';
    try {
      const storage=root.localStorage;
      if(!storage)throw Error('unavailable');
      for(let i=0;i<storage.length;i++) {
        const key=storage.key(i);
        if(!key?.startsWith(prefix))continue;
        let session=JSON.parse(storage.getItem(key));
        readingTitle=typeof session?.title==='string'?session.title:'无法识别的记录';
        safeTree(session);session=validate(session);
        if(key!==prefix+session.id)throw Error('mismatched key');
        sessions.push(session);
      }
    } catch(_) {throw Error(`未能完整读取本机记录${readingTitle?'（'+readingTitle+'）':''}，导出或导入未继续。请保留已有记录，可先截图备份。`);}
    return sessions.sort((a,b)=>b.updatedAt-a.updatedAt);
  }
  function exportText() {
    const sessions=readLocal();
    if(!sessions.length)throw Error('还没有学习记录。开始练习后，这里就能导出。');
    const content=JSON.stringify({format,version:1,exportedAt:new Date().toISOString(),description:'好奇心小站全部课程学习记录。包含首答、每次提交、提示、原话、草稿和续练进度；不含音频，不等于掌握程度评定。',sessions},null,2);
    if(new Blob([content]).size>maxBytes)throw Error('记录文件过大，暂时无法完整导出，请先保留本机记录。');
    return {content,count:sessions.length};
  }
  function parse(content) {
    if(!text(content)||new Blob([content]).size>maxBytes)throw Error('请选择小站导出的备份文件（不超过 20 MB）。');
    let data;
    try {data=JSON.parse(content.replace(/^\uFEFF/,''));}catch(_) {throw Error('文件无法读取，请选择完整的 .json 备份文件。');}
    safeTree(data);
    if(data?.format!==format||data.version!==1||!Array.isArray(data.sessions))throw Error('这不是当前版本的小站备份，请选择“导出学习记录”生成的文件。');
    data.sessions=data.sessions.map(validate);
    if(new Set(data.sessions.map(s=>s.id)).size!==data.sessions.length)throw Error('备份中有重复的记录编号，未导入。请选择原始备份文件。');
    return data.sessions;
  }
  async function digest(session) {
    const {id,revision,backupOriginId,...payload}=session;
    const bytes=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(payload)));
    return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  async function importText(content) {
    const incoming=parse(content); // Validate the entire file before the first write.
    const existing=readLocal();
    const known=new Set(await Promise.all(existing.map(digest)));
    const fingerprints=await Promise.all(incoming.map(digest));
    const result={added:0,skipped:0,versions:0,failed:0};
    for(let i=0;i<incoming.length;i++) {
      const session=incoming[i],hash=fingerprints[i],key=prefix+'backup-'+hash;
      try {
        // Deterministic IDs also prevent re-importing an old snapshot after continuing it.
        if(known.has(hash)||root.localStorage.getItem(key)!==null){result.skipped++;continue;}
        const origin=session.backupOriginId||session.id;
        const copy={...session,id:'backup-'+hash,backupOriginId:origin};
        root.localStorage.setItem(key,JSON.stringify(copy));
        result.added++;
        if(existing.some(s=>(s.backupOriginId||s.id)===origin))result.versions++;
        existing.push(copy);known.add(hash);
      } catch(_) {result.failed=incoming.length-i;break;}
    }
    return result;
  }
  root.LearningBackup={exportText,importText,maxBytes};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.LearningBackup;
})(typeof window!=='undefined'?window:globalThis);
