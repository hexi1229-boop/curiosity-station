import {chartMetrics, axisTicks, percentAnswer} from './chart-logic.mjs';

const $ = selector=>document.querySelector(selector);
const format = value=>Number(value.toFixed(2)).toString();
const escapeText = value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function makeChart(id, values, end, labels, unit) {
  const root=document.getElementById(id);
  root.innerHTML=`<svg viewBox="0 0 300 290" role="img" aria-labelledby="${id}-description"><desc id="${id}-description"></desc><text x="14" y="19" font-size="12" fill="#67796c">${unit}</text><g data-ticks></g><path d="M54 44V245H278" fill="none" stroke="#69816f" stroke-width="1.4"/><rect class="data-bar" x="101" width="46" fill="#9aaf90"/><rect class="data-bar" x="201" width="46" fill="#c28b49"/><g font-size="19" font-weight="650" text-anchor="middle" fill="#243e36"><text data-value x="124"></text><text data-value x="224"></text></g><g font-size="13" text-anchor="middle" fill="#496650"><text x="124" y="270">${labels[0]}</text><text x="224" y="270">${labels[1]}</text></g><path data-break d="m49 260 10-4-10-4 10-4" fill="none" stroke="#9c643f" stroke-width="2.2"/></svg><p class="chart-axis-note"></p>`;
  const bars=root.querySelectorAll('.data-bar');
  const dataLabels=root.querySelectorAll('[data-value]');
  return start=>{
    const stats=chartMetrics(values,start,end);
    root.querySelector('[data-ticks]').innerHTML=axisTicks(start,end).map(value=>{
      const y=245-(value-start)/(end-start)*200;
      return `<path d="M54 ${y}H278" stroke="#d7dfd0" stroke-dasharray="3 4"/><text x="44" y="${y+4}" text-anchor="end" font-size="13" fill="#617361">${format(value)}</text>`;
    }).join('');
    stats.fractions.forEach((fraction,i)=>{
      const height=fraction*200;
      bars[i].setAttribute('y',245-height);
      bars[i].setAttribute('height',height);
      dataLabels[i].setAttribute('y',237-height);
      dataLabels[i].textContent=values[i];
    });
    root.querySelector('[data-break]').style.display=start>0?'':'none';
    root.querySelector('.chart-axis-note').textContent=start===0?'纵轴从 0 开始，完整显示柱长。':`纵轴从 ${start} 开始，0–${start} 的部分未画出。`;
    root.querySelector('desc').textContent=`${labels[0]}${values[0]}${unit}，${labels[1]}${values[1]}${unit}。纵轴从${start}到${end}。`;
    return stats;
  };
}

makeChart('poster-a',[80,84],85,['旧款','新款'],'续航 / 公里')(0);
makeChart('poster-b',[80,84],85,['旧款','新款'],'续航 / 公里')(79);
makeChart('lab-control',[80,84],85,['旧款','新款'],'续航 / 公里')(0);
const updateVariable=makeChart('lab-variable',[80,84],85,['旧款','新款'],'续航 / 公里');
const seenStarts=new Set();
const records=Array.from({length:5},()=>({first:null,attempts:0,hint:false,review:false,correct:false}));
let selectedFirst=null, firstLocked=false, questionIndex=1;

function showPanel(id) {
  const nav=$(`[data-panel="${id}"]`);
  if(nav.disabled) return;
  if(id==='lab' && !$('#practice').hidden && questionIndex<5 && !records[questionIndex].correct) records[questionIndex].review=true;
  document.querySelectorAll('.rocket-panel').forEach(panel=>panel.hidden=panel.id!==id);
  document.querySelectorAll('[data-panel]').forEach(button=>{
    const current=button.dataset.panel===id;
    button.classList.toggle('current',current);
    if(current) button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
  });
  $(`#${id} h2`).focus({preventScroll:true});
  $('.rocket-tabs').scrollIntoView({block:'start'});
}
document.querySelectorAll('[data-panel]').forEach(button=>button.onclick=()=>showPanel(button.dataset.panel));
document.querySelectorAll('[data-first]').forEach(button=>button.onclick=()=>{
  if(firstLocked) return;
  selectedFirst=Number(button.dataset.first);
  document.querySelectorAll('[data-first]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  $('#start-lab').disabled=false;
  $('#first-feedback').textContent='已选好。去改变坐标轴，看看证据是否支持你的判断。';
});
$('#start-lab').onclick=()=>{
  if(selectedFirst===null) return;
  if(!firstLocked) {
    records[0]={first:$(`[data-first="${selectedFirst}"]`).textContent,attempts:1,hint:false,review:false,correct:selectedFirst===1};
    firstLocked=true;
    document.querySelectorAll('[data-first]').forEach(button=>button.disabled=true);
    $('#first-feedback').textContent='第一次判断已保留。你可以用实验检查它。';
    $('#start-lab').textContent='回到坐标轴实验 →';
  }
  $('[data-panel="lab"]').disabled=false;
  showPanel('lab');
};

function changeStart(start, touched=false) {
  const stats=updateVariable(start);
  $('#axis-start').value=start;
  $('#axis-start').setAttribute('aria-valuetext',`起点${start}公里，图上柱高比约${format(stats.visibleRatio)}倍，实际续航比1.05倍`);
  $('#axis-value').textContent=`${start} 公里`;
  $('#visible-ratio').textContent=`${format(stats.visibleRatio)} 倍`;
  $('#visible-formula').textContent=`(84 − ${start}) ÷ (80 − ${start})`;
  $('#axis-observation').textContent=start===0?'两张图现在一样了。柱长比较完整的 84 和 80，比例也是 1.05 倍。':`起点 ${start}：旧柱画出 ${80-start} 公里，新柱画出 ${84-start} 公里。完整数据仍是 80 和 84。`;
  document.querySelectorAll('[data-axis]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.axis)===start)));
  if(touched && (start===0 || start===79)) seenStarts.add(start);
  for(const [value,id,text] of [[0,'seen-zero','比较从 0 开始'],[79,'seen-crop','比较从 79 开始']]) {
    $(`#${id}`).textContent=`${seenStarts.has(value)?'✓':'○'} ${text}`;
    $(`#${id}`).classList.toggle('done',seenStarts.has(value));
  }
  if(seenStarts.size===2) {
    $('#continue-practice').disabled=false;
    $('[data-panel="practice"]').disabled=false;
    $('#lab-next-note').textContent='两种起点都比较过了。现在把方法用起来。';
    $('#first-review').hidden=false;
    $('#first-review').innerHTML=`<strong>回看第 1 题</strong><p>你最初选：${escapeText(records[0].first)}</p><p>${records[0].correct?'你的判断有数据支持。':selectedFirst===3?'现在可以作出有依据的判断：':'现在可以修正判断：'}实际多跑 4 公里。图上柱高的 5 倍，不能当成续航的 5 倍。变化是否重要，还需要任务背景。</p>`;
  }
}
$('#axis-start').oninput=event=>changeStart(Number(event.target.value),true);
document.querySelectorAll('[data-axis]').forEach(button=>button.onclick=()=>changeStart(Number(button.dataset.axis),true));
$('#continue-practice').onclick=()=>showPanel('practice');
changeStart(79);

const questions=[
  null,
  {skill:'算真实增幅',title:'从 80 公里到 84 公里，增加了百分之几？',context:'以旧款的 80 公里为比较基础。写下你算出的增加百分比。',type:'number',hint:'先求增加了多少，再用“增加量 ÷ 原来的量 × 100%”。',answer:5,explanation:'增加 84 − 80 = 4 公里。4 ÷ 80 × 100% = 5%。新续航是原来的 105%，增加的是 5%。'},
  {skill:'找到推理错误',title:'“右边柱子高 5 倍，所以续航有 5 倍。”错在哪？',context:'图里的数字仍是 80 和 84，纵轴起点是 79。找出这句话真正跳错的一步。',type:'choice',options:['80 和 84 都被坐标轴改成了别的数。','把截去底部后剩下的柱高比，当成了完整数值比。','只要纵轴不是从 0 开始，所有类型的图都一定造假。'],answer:1,hint:'图上剩下的是 80 − 79 和 84 − 79。它们的比，和 84 ÷ 80 是一回事吗？',explanation:'错在把两截柱长的比，当成完整数据的比。数据没有变，比较的对象却偷偷变了。非零起点也不能一概等同于造假，要看图表类型和用途。'},
  {skill:'换情境，修复图表',title:'两次各投 40 球：进了 30 球和 33 球。',context:'给队友做一张柱状图，让柱长公平比较两次命中数。请你拖动纵轴起点，再提交这个图表方案。',type:'chart',hint:'柱长要代表完整命中数，应该从哪里开始画？先找到完整数量的起点。',answer:0,explanation:'从 0 开始，柱长才对应完整的 30 和 33。后一次多进 3 球，命中数是前一次的 1.1 倍；两次都是投 40 球。'},
  {skill:'用证据写结论',title:'多出的 4 公里，对一次任务有用吗？',context:'旧款续航 80 公里，新款 84 公里。这次任务全程 82 公里，中途不能充电。只按这些教学数据比较续航，其他条件相同。',type:'writing'}
];
const box=$('#chart-question');
function feedback(message, error=false) {
  $('#question-feedback').textContent=message;
  $('#question-feedback').classList.toggle('error',error);
}
function attempt(answer, correct) {
  const record=records[questionIndex];
  if(record.first===null) {record.first=answer;record.firstCorrect=correct;}
  record.attempts++;
  record.correct=correct;
  const q=questions[questionIndex];
  feedback(correct?q.explanation:'再检查一下比较的起点和数量关系。可以修改，也可以打开提示。',!correct);
  if(correct) {
    box.querySelectorAll('[data-answer],#percent-answer,#check-answer,#transfer-start').forEach(element=>element.disabled=true);
    $('#next-question').disabled=false;
  }
}
function renderQuestion(focus=true) {
  if(questionIndex===5) {showFinish();return;}
  const q=questions[questionIndex];
  let body='';
  if(q.type==='number') body='<div class="number-entry"><label for="percent-answer">增加百分比</label><div><input id="percent-answer" inputmode="decimal" autocomplete="off" aria-describedby="percent-unit"><span id="percent-unit">%</span><button class="secondary" id="check-answer">核对一下</button></div></div>';
  if(q.type==='choice') body=`<div class="rocket-answers">${q.options.map((option,i)=>`<button class="rocket-answer" data-answer="${i}" aria-pressed="false">${option}</button>`).join('')}</div>`;
  if(q.type==='chart') body='<div class="chart-poster transfer-chart"><div id="transfer-chart"></div></div><div class="axis-controls transfer-controls"><label for="transfer-start">这张图的纵轴起点 <output id="transfer-value" for="transfer-start">29 球</output></label><input id="transfer-start" type="range" min="0" max="29" step="1" value="29"><div class="range-ends"><span>0</span><span>29</span></div><p>手指拖动；键盘可用方向键或 Home / End 调整。</p><button class="secondary" id="check-answer">提交我的图表方案</button></div>';
  if(q.type==='writing') body='<div class="chart-writing"><label for="my-conclusion">给海报写一句结论：说清真实变化，以及它对这次任务意味着什么。</label><textarea id="my-conclusion" maxlength="300" placeholder="先写自己的判断，再对照参考。"></textarea><p class="small-note">用自己的话就好，不按字数或关键词自动判对。</p><button class="primary" id="submit-conclusion">保存我的结论，再看参考</button></div><div id="writing-review" hidden></div>';
  box.innerHTML=`<div class="rocket-question"><div class="quiz-meta"><span>第 ${questionIndex+1} / 5 题 · ${q.skill}</span><span class="quiz-dots" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i class="${i<=questionIndex?'active':''}"></i>`).join('')}</span></div><h3 id="question-heading" tabindex="-1">${q.title}</h3><p class="question-context">${q.context}</p>${body}<div class="rocket-feedback" role="status" id="question-feedback"></div>${q.hint?`<details class="quiz-help" id="question-hint"><summary>给我一点提示</summary><p>${q.hint}</p></details>`:''}${q.type==='writing'?'':`<button class="text-button return-lab" id="review-lab">回看坐标轴实验</button><div class="quiz-next"><span>可以修改答案，首次作答会保留。</span><button class="primary" id="next-question" disabled>下一题 →</button></div>`}</div>`;
  const hint=$('#question-hint');
  const record=records[questionIndex];
  if(hint) hint.ontoggle=()=>{if(hint.open && !record.correct) record.hint=true;};
  if(q.type==='number') {
    const check=()=>{
      const raw=$('#percent-answer').value;
      const answer=percentAnswer(raw);
      if(answer===null) {feedback('先填入你算出的数字，百分号可以省略。',true);return;}
      attempt(`${raw.trim()}${raw.trim().match(/[%％]$/)?'':'%'}`,answer===q.answer);
    };
    $('#check-answer').onclick=check;
    $('#percent-answer').onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();check();}};
  }
  if(q.type==='choice') box.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
    box.querySelectorAll('[data-answer]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    attempt(button.textContent,Number(button.dataset.answer)===q.answer);
  });
  if(q.type==='chart') {
    const update=makeChart('transfer-chart',[30,33],40,['前一次','后一次'],'命中数 / 球');
    const input=$('#transfer-start');
    const draw=()=>{update(Number(input.value));$('#transfer-value').textContent=`${input.value} 球`;input.setAttribute('aria-valuetext',`纵轴从${input.value}球开始`);};
    input.oninput=draw;
    $('#check-answer').onclick=()=>attempt(`纵轴起点 ${input.value} 球`,Number(input.value)===q.answer);
    draw();
  }
  if(q.type==='writing') $('#submit-conclusion').onclick=()=>{
    const answer=$('#my-conclusion').value.trim();
    if(!answer) {feedback('先留下一句自己的结论，再来对照。',true);return;}
    records[4].first=answer;
    records[4].attempts=1;
    $('#my-conclusion').readOnly=true;
    $('#submit-conclusion').disabled=true;
    feedback('原话已保留。下面只做自检，不自动判断你的表达是否正确。');
    $('#writing-review').hidden=false;
    $('#writing-review').innerHTML='<div class="reference-answer"><strong>参考思路，不要求一字不差</strong><p>新款从 80 公里增加到 84 公里，多 4 公里（增加 5%）。这使它能完成全程 82 公里的任务，旧款不够。因此，这个变化对这次任务有用，但续航并没有变成 5 倍。</p><p>检查自己的结论：数据比较准确吗？是否用 82 公里的要求说明了判断？真实任务还要考虑路况与电量余量，本题只练给定条件下的判断。</p></div><div class="self-actions"><button class="secondary" data-self="clear">我已对照，两点都说清了</button><button class="secondary" data-self="help">这题我还需要帮助</button></div>';
    box.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{records[4].self=button.dataset.self;questionIndex=5;showFinish();});
  };
  if($('#review-lab')) $('#review-lab').onclick=()=>{if(!record.correct) record.review=true;showPanel('lab');};
  if($('#next-question')) $('#next-question').onclick=()=>{questionIndex++;renderQuestion();};
  if(focus) {$('#question-heading').focus({preventScroll:true});$('.rocket-tabs').scrollIntoView({block:'start'});}
}
function showFinish() {
  const independent=records.slice(0,4).filter((record,i)=>(i===0?record.correct:record.firstCorrect) && !record.hint && !record.review).length;
  const labels=['读图判断','计算增幅','辨别推理错误','迁移并修复图表','独立表达与自检'];
  box.innerHTML=`<div class="finish-star" aria-hidden="true">✳</div><h3 class="finish-title" tabindex="-1">5 题到站，今天可以收工。</h3><p class="question-context">前 4 题中，首次作答且未使用提示或回看就答对：<b>${independent} / 4</b>。第 5 题保留你的原话，由你自检，未自动判分。</p><div class="takeaway chart-explanation"><strong>带走三个检查动作</strong><p>读数值和单位 → 查坐标起点 → 用真实数量与任务要求判断。</p></div><details class="quiz-help"><summary>查看本次 5 题记录，方便截图交流</summary><ol class="result-list">${records.map((record,i)=>{
    const status=i===4?(record.self==='clear'?'自评已说清，未自动判分':'自评仍需帮助'):i===0?(record.correct?'首答正确':selectedFirst===3?'首次保留判断，已看实验解析':'首答未选中有数据支持的结论，已看实验解析'):record.firstCorrect&&!record.hint&&!record.review?'首次独立答对':record.hint||record.review?'使用提示或回看后完成':'重试后完成';
    return `<li><strong>${i+1}. ${labels[i]} · ${status}</strong><p class="own-answer">最初作答：${escapeText(record.first)}</p>${i>0&&i<4?`<p>提交 ${record.attempts} 次；${record.hint?'用过提示':'未用提示'}；${record.review?'回看过实验':'未回看实验'}。</p>`:''}</li>`;
  }).join('')}</ol><p>本次记录保留在当前页面，刷新会重新开始；需要时先截图。没有上传作答内容。</p></details><div class="finish-actions"><a href="./">回到小站</a><button class="text-button" id="restart-charts">重新开始这 5 题</button></div>`;
  $('#restart-charts').onclick=()=>window.location.reload();
  box.querySelector('h3').focus({preventScroll:true});
  $('.rocket-tabs').scrollIntoView({block:'start'});
  $('#continue-practice').textContent='查看本次学习小结 →';
}
renderQuestion(false);
