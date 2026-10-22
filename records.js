'use strict';
let logs=LearningFeedback.history();
const list=document.querySelector('#records-list');
const filter=document.querySelector('#course-filter');
const escapeRecord=LearningFeedback.esc;
const date=value=>new Date(value).toLocaleString('zh-CN',{month:'long',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
LearningFeedback.courses.forEach(([id,title])=>{const option=document.createElement('option');option.value=id;option.textContent=title;filter.append(option);});
function renderRecords() {
  const visible=logs.filter(s=>filter.value==='all'||s.courseId===filter.value);
  document.querySelector('#record-count').textContent=`${visible.length} 次练习`;
  if(LearningFeedback.storageError){list.innerHTML='<div class="records-empty"><h2>暂时无法读取本机记录</h2><p>当前浏览器限制了网站存储。已打开的反馈页请先截图保留。</p></div>';return;}
  if(!visible.length){list.innerHTML=`<div class="records-empty"><span aria-hidden="true">✳</span><h2>${logs.length?'这门课还没有记录':'第一次尝试，从这里留下'}</h2><p>开始答题、写下一点想法，或打开提示后，记录就会自动出现在这里。</p><a class="secondary" href="./">去选一课 →</a></div>`;return;}
  list.innerHTML=visible.map((s,i)=>{
    const course=LearningFeedback.courses.find(c=>c[0]===s.courseId);
    const report=LearningFeedback.create(s.title,s.records.map(r=>({title:r.title})),true);
    report.records.splice(0,5,...s.records);
    const completed=s.records.filter(r=>r.done).length;
    return `<details class="saved-session" ${i===0?'open':''}><summary><span class="session-heading"><span class="session-date">${escapeRecord(date(s.startedAt))}</span><strong>${escapeRecord(s.title)}</strong><span class="session-progress">${completed===5?'已完成 5 题':`进行中 · ${completed} / 5 题完成`}</span></span><span class="session-toggle" aria-hidden="true">展开 / 收起</span></summary><div class="saved-body"><p class="saved-time">最后保存：${escapeRecord(date(s.updatedAt))}${s.completedAt?` · 完成：${escapeRecord(date(s.completedAt))}`:''}</p>${report.html()}${course?`<a class="secondary continue-lesson" href="${course[2]}">${completed===5?'回到课程':'继续这门课的最近一次练习'} →</a>`:''}</div></details>`;
  }).join('');
}
filter.onchange=renderRecords;
renderRecords();

function refreshRecords(){logs=LearningFeedback.history();renderRecords();}
window.addEventListener('pageshow',refreshRecords);
window.addEventListener('storage',refreshRecords);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRecords();});
