'use strict';
let logs=LearningFeedback.history();
const list=document.querySelector('#records-list');
const filter=document.querySelector('#course-filter');
const escapeRecord=LearningFeedback.esc;
const exportButton=document.querySelector('#export-records');
const importButton=document.querySelector('#import-records');
const backupInput=document.querySelector('#backup-file');
const backupStatus=document.querySelector('#backup-status');
let importing=false;
const date=value=>new Date(value).toLocaleString('zh-CN',{month:'long',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
LearningFeedback.courses.forEach(([id,title])=>{const option=document.createElement('option');option.value=id;option.textContent=title;filter.append(option);});
function renderRecords() {
  exportButton.disabled=importing||logs.length===0;
  importButton.disabled=importing;
  const visible=logs.filter(s=>filter.value==='all'||s.courseId===filter.value);
  document.querySelector('#record-count').textContent=`${visible.length} 次练习`;
  if(LearningFeedback.storageError){list.innerHTML='<div class="records-empty"><h2>暂时无法读取本机记录</h2><p>当前浏览器限制了网站存储。已打开的反馈页请先截图保留。</p></div>';return;}
  if(!visible.length){list.innerHTML=`<div class="records-empty"><span aria-hidden="true">✳</span><h2>${logs.length?'这门课还没有记录':'第一次尝试，从这里留下'}</h2><p>开始答题、写下一点想法，或打开提示后，记录就会自动出现在这里。</p><a class="secondary" href="./">去选一课 →</a></div>`;return;}
  list.innerHTML=visible.map((s,i)=>{
    const course=LearningFeedback.courses.find(c=>c[0]===s.courseId);
    const report=LearningFeedback.create(s.title,s.records.map(r=>({title:r.title})),true);
    report.records.splice(0,report.records.length,...s.records);
    const completed=s.records.filter(r=>r.done).length,total=s.records.length,unit=total===5?'题':'环节';
    return `<details class="saved-session" ${i===0?'open':''}><summary><span class="session-heading"><span class="session-date">${escapeRecord(date(s.startedAt))}${s.backupOriginId?' · 备份恢复':''}</span><strong>${escapeRecord(s.title)}</strong><span class="session-progress">${completed===total?`已完成 ${total} ${unit}`:`进行中 · ${completed} / ${total} ${unit}完成`}</span></span><span class="session-toggle" aria-hidden="true">展开 / 收起</span></summary><div class="saved-body"><p class="saved-time">最后保存：${escapeRecord(date(s.updatedAt))}${s.completedAt?` · 完成：${escapeRecord(date(s.completedAt))}`:''}</p>${report.html()}${course?`<a class="secondary continue-lesson" href="${course[2]}">${completed===total?'回到课程':'继续这门课的最近一次练习'} →</a>`:''}</div></details>`;
  }).join('');
}
filter.onchange=renderRecords;
renderRecords();

function refreshRecords(){logs=LearningFeedback.history();renderRecords();}
window.addEventListener('pageshow',refreshRecords);
window.addEventListener('storage',refreshRecords);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRecords();});

function backupMessage(message,error=false) {
  backupStatus.textContent=message;
  backupStatus.dataset.error=String(error);
}
exportButton.onclick=()=>{
  try {
    const {content,count}=LearningBackup.exportText();
    const stamp=new Date();
    const pad=n=>String(n).padStart(2,'0');
    const filename=`好奇心小站-学习记录-${stamp.getFullYear()}${pad(stamp.getMonth()+1)}${pad(stamp.getDate())}-${pad(stamp.getHours())}${pad(stamp.getMinutes())}${pad(stamp.getSeconds())}.json`;
    const url=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=filename;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    backupMessage(`已生成全部 ${count} 次练习的备份。请在下载列表或「文件」中保留它，也可以直接把这个 .json 文件发给 AI。\niPad 若打开了文件预览，点「分享 → 存储到“文件”」即可。`);
  } catch(error) {backupMessage(error.message,true);}
};
importButton.onclick=()=>backupInput.click();
backupInput.onchange=async()=>{
  const file=backupInput.files[0];
  if(!file)return;
  importing=true;renderRecords();backupMessage('正在读取备份并核对记录…');
  try {
    if(file.size>LearningBackup.maxBytes)throw Error('文件过大，请选择小站导出的备份文件（不超过 20 MB）。');
    const result=await LearningBackup.importText(await file.text());
    backupMessage(`${result.failed?'导入尚未全部完成':'核对完成'}：新增 ${result.added} 份，跳过重复 ${result.skipped} 份${result.versions?`，其中 ${result.versions} 份不同进度已另存`:''}。${result.failed?`还有 ${result.failed} 份未写入，可能是设备存储受限或已满；请保留原文件，稍后可再次导入。`:'原有记录保留，刷新或回到课程即可继续。'}`,result.failed>0);
  } catch(error) {backupMessage(error.message,true);}
  finally {importing=false;backupInput.value='';refreshRecords();}
};
