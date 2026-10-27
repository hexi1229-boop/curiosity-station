'use strict';
const courseLink=c=>LearningFeedback.courses.find(row=>row[0]===c.id)[2];
function courseCard(course,progress){
  const saved=progress[course.id],done=saved?.records.filter(r=>r.done).length;
  const total=saved?.records.length||course.tasks||5,unit=course.tasks?'环节':'题';
  const workshop=course.format==='workshop',readalong=course.format==='readalong';
  const status=readalong?(!saved?'先完整读一篇':done?'这次共读已收好':saved.records[0].draft?.quote||saved.records[0].draft?.note?'有共读便笺':saved.records[0].draft?.$paragraph?'阅读位置已保留':'可继续共读'):workshop?(!saved?'先读一个故事':total!==1?'旧版记录保留 · 新版可读':done?'已留作品，可再修改':saved.records[0].draft?.text?'有草稿，可续写':'可继续读写'):!saved?'未开始':done===total?`已完成 ${total} ${unit}`:`进行中 · ${done} / ${total} ${unit}`;
  return `<a class="catalog-card ${course.group}" href="${courseLink(course)}"><div class="catalog-card-top"><span>${course.subject} · ${course.tags[0]}</span>${course.fresh?'<span class="fresh-label">新课</span>':''}</div><div class="catalog-symbol" aria-hidden="true">${course.icon}</div><h3>${course.name}</h3><p>${course.description}</p><div class="catalog-card-foot"><span>${course.time} · ${readalong?'共读课':workshop?'读写工坊':course.tasks?`${course.tasks} 个探索环节`:'固定 5 题'}</span><span>${status} ↗</span></div></a>`;
}
function renderHome(){
  const result=CourseCatalog.home(LearningFeedback.history()),c=result.featured;
  const saved=result.progress[c.id],index=saved?.records.findIndex(r=>!r.done);
  const intro=c.format==='readalong'?'可以分次读，再挑一处聊。阅读位置和便笺自动留存。':c.format==='workshop'?(saved&&saved.records.length!==1?'旧版作答记录仍保留，进入新版读写工坊。':'阅读、品词句、写与改。按自己的节奏继续。'):result.continuing?`第 ${index+1} / ${saved.records.length} ${c.tasks?'环节':'题'} · 之前的答案与草稿都在`:(c.id==='reading'?'先试一次，再看讲解。今天选一课就好。':c.tasks?'判断、动手验证、独立迁移。按自己的节奏来。':'一次一课，固定 5 题。按自己的节奏来。');
  document.querySelector('#continue-card').innerHTML=`<div class="continue-copy"><p class="eyebrow">${result.continuing?'继续上次':saved?.records.every(r=>r.done)?'回顾一课':c.fresh?'从这里开始 · 新课':'接着学一点'}</p><h2>${c.name}</h2><p>${intro}</p><a class="start-link" href="${courseLink(c)}">${c.format==='readalong'?`一起读《${c.readingTitle}》`:c.format==='workshop'?'进入读写工坊':result.continuing?'继续学习':saved?.records.every(r=>r.done)?'回到这门课':'开始这一课'} <span aria-hidden="true">→</span></a></div><div class="continue-art" aria-hidden="true">${c.id==='reading'?'<span>题目</span><i>↓</i><span>证据</span><i>↓</i><span>结论</span>':`<span class="continue-symbol">${c.icon}</span>`}</div>`;
  document.querySelector('#home-school').innerHTML=result.school.map(c=>courseCard(c,result.progress)).join('');
  document.querySelector('#home-explore').innerHTML=courseCard(result.explore,result.progress);
  if(LearningFeedback.storageError)document.querySelector('#home-local-note').textContent='暂时无法读取本机进度，仍可从课程库选课。';
}
const search=document.querySelector('#course-search');
if(search){
  const filters=['group','subject','stage'];
  const params=new URLSearchParams(location.search);
  for(const key of filters){const el=document.querySelector('#filter-'+key),value=params.get(key);if([...el.options].some(o=>o.value===value))el.value=value;}
  search.value=params.get('q')||'';
  function renderLibrary(){
    const selection=Object.fromEntries(filters.map(key=>[key,document.querySelector('#filter-'+key).value]));
    const courses=CourseCatalog.select({...selection,query:search.value}),progress=CourseCatalog.latest(LearningFeedback.history());
    document.querySelector('#course-count').textContent=`找到 ${courses.length} 门课`;
    document.querySelector('#course-results').innerHTML=courses.map(c=>courseCard(c,progress)).join('');
    document.querySelector('#course-empty').hidden=courses.length>0;
  }
  search.addEventListener('input',renderLibrary);
  filters.forEach(key=>document.querySelector('#filter-'+key).addEventListener('change',renderLibrary));
  document.querySelector('#clear-filters').onclick=()=>{search.value='';filters.forEach(key=>document.querySelector('#filter-'+key).value='all');renderLibrary();search.focus();};
  for(const event of ['pageshow','storage'])window.addEventListener(event,renderLibrary);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderLibrary();});
  renderLibrary();
}else{
  for(const event of ['pageshow','storage'])window.addEventListener(event,renderHome);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHome();});
  renderHome();
}
