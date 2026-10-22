'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='density'))LearningFeedback.courses.push(['density',DensityLesson.title,'density.html']);
const densityQuestions=DensityLesson.questions,densityEscape=LearningFeedback.esc;
const densityTask=document.querySelector('#density-task');
let densityLog=LearningFeedback.create(DensityLesson.title,densityQuestions),densityIndex=densityLog.index;
function cells(volume){return `<div class="volume-cells" role="img" aria-label="${volume/10}格，每格代表10立方厘米，共${volume}立方厘米">${Array.from({length:volume/10},()=>'<i aria-hidden="true"></i>').join('')}</div>`;}
function sampleCard(s,showDensity=false){return `<div class="material-card ${s.material==='材料乙'?'material-b':''}"><span class="material-name">${s.material}</span>${cells(s.volume)}<div class="sample-values"><strong>${s.mass}<small>克</small></strong><span>${s.volume} 立方厘米</span></div>${showDensity?`<p class="per-volume">每1立方厘米<br><b>${s.density}克</b></p>`:''}</div>`;}
function samplePair(a,b,showDensity=false){return `<div class="sample-pair">${sampleCard(DensityLesson.sample('a',a),showDensity)}${sampleCard(DensityLesson.sample('b',b),showDensity)}</div>`;}
function densityScene(index){
  if(index===0)return `<h2>两块积木，两份资料</h2>${samplePair(60,20)}<p class="grid-key">每格代表10立方厘米，按体积计数。</p><p>都是均匀实心积木。<b>密度</b>比较每单位体积的质量。</p><div class="quantity-key"><span><b>质量 m</b>：用“克”表示</span><span><b>体积 V</b>：用“立方厘米”表示</span></div><p class="source-note">先判断，再打开材料工坊。图格是计数示意，不表示微观粒子。</p>`;
  if(index===1)return `<h2>切下一半，材料没换</h2><div class="cut-before"><span>原来一整块</span>${cells(60)}<b>120克 / 60立方厘米</b></div><div class="cut-arrow" aria-hidden="true">↓ 切成两半</div><div class="cut-halves"><div><span>取出这一半</span>${cells(30)}<b>60克 / 30立方厘米</b></div><div class="remaining-half"><span>另一半</span>${cells(30)}<b>60克 / 30立方厘米</b></div></div><p class="grid-key">每格代表10立方厘米。</p><p>同一均匀实心材料，温度和物态不变。用“每单位体积的质量”说明你的判断。</p>`;
  if(index===2)return `<h2>每1立方厘米，对应多少克？</h2><div class="data-ticket"><span>实心零件资料</span><strong>60克</strong><b>20立方厘米</b></div><div class="density-formula">密度 ρ = 质量 m ÷ 体积 V</div><p>ρ = m / V。把总质量平均对应到每1立方厘米，数值与单位一起核对。</p>`;
  if(index===3)return `<h2>从每一份，推回总量</h2><div class="unit-piece"><i aria-hidden="true"></i><span>每1立方厘米<br><b>对应3克</b></span></div><div class="data-ticket"><span>零件所用材料的体积</span><strong>50<small>立方厘米</small></strong></div><p>同种均匀材料，温度和物态不变。共有50份，每份都是1立方厘米。</p>`;
  return `<h2>模型车的实心配件</h2><div class="design-brief"><span>这次只比较质量</span><strong>两种方案都是30立方厘米</strong><p>均匀实心，温度和物态不变。</p></div><div class="material-options"><p><span>材料丙</span><b>3克 / 立方厘米</b></p><p><span>材料丁</span><b>8克 / 立方厘米</b></p></div><p>选一种材料，用数据解释怎样让配件更轻。注意题目限定的比较条件。</p>`;
}
function labMarkup(){return `<details class="density-lab" data-help="打开材料工坊"><summary>动手比较：把体积调成一样</summary><div class="density-lab-body"><div id="density-model"></div><p class="grid-key">每格代表10立方厘米；同样一格，代表同样体积。</p><div class="volume-controls"><label for="density-a">材料甲的体积 <output id="density-a-value"></output></label><input id="density-a" type="range" min="10" max="100" step="10"><label for="density-b">材料乙的体积 <output id="density-b-value"></output></label><input id="density-b" type="range" min="10" max="100" step="10"></div><div class="density-presets"><button data-preset="20,20">都取20立方厘米</button><button data-preset="60,60">都取60立方厘米</button><button data-preset="60,20">恢复原来的两块</button></div><p class="density-relation" id="density-relation" role="status"></p><div class="density-formula">密度 ρ = 质量 m ÷ 体积 V</div><p class="model-rule">材料没换，增加体积时质量也按同样倍数增加；每1立方厘米对应的质量保持不变。<br><b>g/cm³</b>就是“克/立方厘米”。</p><p class="source-note">模型限定均匀实心材料、温度和物态不变；真实材料的密度可能随温度或物态变化。示意模型不代替真实测量。</p></div></details>`;}
function bindLab(){
  const a=document.querySelector('#density-a'),b=document.querySelector('#density-b'),saved=densityLog.checkpoint.density;
  const valid=n=>Number.isInteger(n)&&n>=10&&n<=100&&n%10===0;
  a.value=valid(saved?.a)?saved.a:60;b.value=valid(saved?.b)?saved.b:20;
  function draw(){const av=Number(a.value),bv=Number(b.value),sa=DensityLesson.sample('a',av),sb=DensityLesson.sample('b',bv);document.querySelector('#density-model').innerHTML=samplePair(av,bv,true);document.querySelector('#density-a-value').textContent=av+'立方厘米';document.querySelector('#density-b-value').textContent=bv+'立方厘米';a.setAttribute('aria-valuetext',av+'立方厘米');b.setAttribute('aria-valuetext',bv+'立方厘米');document.querySelector('#density-relation').textContent=`甲：${sa.mass} ÷ ${av} = ${DensityLesson.density(sa.mass,av)} 克/立方厘米\n乙：${sb.mass} ÷ ${bv} = ${DensityLesson.density(sb.mass,bv)} 克/立方厘米\n${av===bv?'现在体积相同，可以直接比较质量。':'现在体积不同，先换成相同体积再比较。'}`;}
  function save(label){densityLog.point({density:{a:Number(a.value),b:Number(b.value)}});densityLog.help(densityIndex,label);draw();}
  a.oninput=b.oninput=()=>save('调节材料体积');document.querySelectorAll('[data-preset]').forEach(button=>button.onclick=()=>{[a.value,b.value]=button.dataset.preset.split(',');save('对照：'+button.textContent);});draw();
}
function renderDensity(focus=false){
  document.querySelector('#density-progress').textContent=densityIndex===5?'5 题完成':`第 ${densityIndex+1} / 5 题`;
  document.querySelector('#density-dots').innerHTML=densityQuestions.map((_,i)=>`<i class="${densityLog.records[i].done?'done':''} ${i===densityIndex?'current':''}"></i>`).join('');
  if(densityIndex===5){finishDensity();return;}
  const q=densityQuestions[densityIndex],r=densityLog.records[densityIndex],open=q.kind==='open';
  let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
  const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${densityEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="density-answer">留下你的理由或关键步骤</label><textarea id="density-answer" maxlength="600" rows="4" placeholder="用自己的话，1–3句话就好。"></textarea><label class="reason-unsure"><input id="density-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':'<label for="density-number">零件的质量（只填数字）</label><div class="mass-input"><input id="density-number" type="text" inputmode="decimal" autocomplete="off" placeholder="质量是多少克？"><span>克</span></div>';

  densityTask.innerHTML=`<div class="density-layout"><article class="density-scene">${densityScene(densityIndex)}</article><section class="reading-work density-work"><p class="skill-label">${q.skill}</p><h2 id="density-question" tabindex="-1">${q.title}</h2>${entry}<button class="primary" id="submit-density">${open?'先留下我的答案':'确认我的判断'}</button><div class="reading-message" id="density-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${q.hint}</p></details>${!open?'<button class="text-button" id="density-method">暂时不会，看看方法</button>':''}<div id="density-review" hidden></div><div id="density-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-density" disabled>${densityIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
  const message=document.querySelector('#density-message'),submit=document.querySelector('#submit-density'),next=document.querySelector('#next-density');
  function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
  function showLab(){if(densityIndex!==0||document.querySelector('.density-lab'))return;document.querySelector('#density-lab-slot').innerHTML=labMarkup();bindLab();const details=document.querySelector('.density-lab');details.addEventListener('toggle',()=>{if(details.open)densityLog.help(densityIndex,'打开材料工坊');});}
  function finishClosed(){densityTask.querySelectorAll('[data-choice],#density-number,#submit-density,#density-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
  function getOpen(){const text=document.querySelector('#density-answer').value.trim();if(!text&&!document.querySelector('#density-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
  function showReview(){
    const review=document.querySelector('#density-review');review.hidden=false;review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的理由</h3><p>${q.reference}</p><ul>${q.checks.map(c=>`<li>${c}</li>`).join('')}</ul><p>原话已保留，想改可以修改上面的答案。开放答案不会自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还想再练一练</button></div></section>`;submit.textContent='保存我的修改';
    review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)densityLog.submit(densityIndex,answer,null,answer);densityLog.finish(densityIndex,button.dataset.self);densityTask.querySelectorAll('textarea,input,#submit-density,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('你的原话、修改和自检已保存。');next.disabled=false;});
  }
  densityTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);densityTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
  submit.onclick=()=>{
    if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)densityLog.submit(densityIndex,answer,null,answer);if(first)densityLog.help(densityIndex,'参考方法（提交后）');showReview();say('先看你的方法是否讲得通，再完成自检。');return;}
    let answer,correct;
    if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
    else{const raw=document.querySelector('#density-number').value,value=DensityLesson.readNumber(raw);if(value===null){say('只填一个数字；不要填单位或未计算的算式。',true);return;}answer=raw.trim();correct=value===q.answer;}
    densityLog.submit(densityIndex,answer,correct);if(correct){densityLog.finish(densityIndex);finishClosed();}else{say('这次还没对应上题目中的关系。首答已保留，可以再试或打开提示。',true);if(densityIndex===0)showLab();}
  };
  if(!open)document.querySelector('#density-method').onclick=()=>{if(!r.first)densityLog.submit(densityIndex,'暂时不会，选择查看方法',false);densityLog.help(densityIndex,'查看本题方法');densityLog.finish(densityIndex,'看过方法，留待再练');finishClosed();};
  LearningFeedback.watchHelp(densityTask,densityLog,densityIndex);
  if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('上次的答案和草稿已恢复，对照方法后完成自检即可继续。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
  next.onclick=()=>{densityIndex++;renderDensity(true);};
  if(focus){document.querySelector('#density-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishDensity(){
  densityTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5 题完成，今天就到这里。</h2><p>先问体积是否相同，再比较质量。密度是每单位体积的质量。</p><div class="finish-contrast"><p><b>从总量求每份</b>ρ = m ÷ V</p><p><b>从每份求总量</b>m = ρ × V</p></div><p class="finish-note">3题核对了判断或数值，2题保留了理由。同一均匀材料、温度和物态不变时，切半不会让密度减半。换个情境，先看比较条件，再计算。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-density">重新练这5题（保留旧记录）</button></section>${densityLog.html()}`;
  document.querySelector('#restart-density').onclick=()=>{densityLog=LearningFeedback.create(DensityLesson.title,densityQuestions,true);densityLog.save();densityIndex=0;renderDensity(true);};densityTask.querySelector('h2').focus({preventScroll:true});
}
renderDensity();
