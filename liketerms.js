'use strict';
(function(){
  const host=document.querySelector('#liketerms-task');
  const sources=document.querySelector('#liketerms-sources');
  const L=window.LikeTermsLesson;
  const F=window.LearningFeedback;
  if(!host||!L||!F)return;
  if(!F.flexibleTasks){host.innerHTML='<section class="parallel-card"><h2>互动课堂正在更新</h2><p>原有学习记录会保留，请稍后重新打开。</p></section>';return;}
  if(!F.courses.some(course=>course[0]===L.id)){
    const after=F.courses.findIndex(course=>course[0]==='power');
    F.courses.splice(after+1,0,[L.id,L.title,'liketerms.html']);
  }

  const esc=F.esc;
  let log=F.create(L.title,L.tasks);
  let state=L.sanitizeState(log.checkpoint.liketerms);
  state.labAttempted=state.labAttempted&&!!log.records[1]?.attempts?.length;
  state.transferAttempted=state.transferAttempted&&!!log.records[2]?.attempts?.length;
  function save(){log.point({liketerms:state});}
  function answerText(value,unsure){return value.trim()||(unsure?'暂时说不清':'');}
  function message(value,error=false){const box=host.querySelector('#liketerms-message');if(box){box.textContent=value;box.dataset.error=String(error);}}
  function progress(){
    document.querySelectorAll('.parallel-nav li').forEach((item,index)=>{
      item.classList.toggle('active',index===log.index);item.classList.toggle('done',index<log.index);
      if(index===log.index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  function focusCard(){requestAnimationFrame(()=>{const heading=host.querySelector('h2');if(heading){heading.focus();heading.scrollIntoView({block:'start'});}});}
  function card(label,title,body,actions=''){
    return '<section class="parallel-card"><p class="parallel-label">'+esc(label)+'</p><h2 tabindex="-1">'+esc(title)+'</h2>'+body+'<p class="parallel-error" id="liketerms-message" role="status" aria-live="polite"></p>'+actions+'</section>';
  }
  function reason(prefix,label,value,unsure,placeholder){
    return '<div class="parallel-reason"><label for="'+prefix+'-reason">'+esc(label)+'</label><textarea id="'+prefix+'-reason" rows="3" maxlength="900" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea><label class="parallel-unsure"><input id="'+prefix+'-unsure" type="checkbox" '+(unsure?'checked':'')+'>暂时说不清，先如实记录</label></div>';
  }
  function bindReason(prefix,valueKey,unsureKey){
    const input=host.querySelector('#'+prefix+'-reason'),checkbox=host.querySelector('#'+prefix+'-unsure');
    input.oninput=()=>{state[valueKey]=input.value.slice(0,900);if(input.value.trim()){state[unsureKey]=false;checkbox.checked=false;}save();};
    checkbox.onchange=()=>{state[unsureKey]=checkbox.checked;save();};
  }
  function bindHelp(index){F.watchHelp(host,log,index);}

  function renderCold(){
    const claims='<div class="algebra-claims" role="group" aria-label="选择你认为对所有取值都成立的等式">'+L.coldClaims.map(item=>'<button type="button" class="algebra-claim" data-claim="'+item.id+'" aria-pressed="'+String(state.coldChoices.includes(item.id))+'"><b>'+item.formula+'</b><span>'+item.text+'</span></button>').join('')+'</div>';
    const body='<p class="parallel-lead">这里的字母表示数。选出你认为<strong>无论字母取什么允许的值都成立</strong>的等式；可以选一项或多项。</p>'+claims+reason('cold','先留一句理由。',state.coldReason,state.coldUnsure,'例如：我认为……总成立，因为……。')+'<p class="identity-note">现在不代入特定数字，也不看提示。首答会原样保留，下一环再动手验证。</p>';
    host.innerHTML=card('环节一 · 冷判断','只是长得像，还是对所有取值都成立？',body,'<button class="primary" id="cold-submit">封存首答，进入实验台 →</button>');
    host.querySelectorAll('[data-claim]').forEach(button=>button.onclick=()=>{const id=button.dataset.claim;state.coldChoices=state.coldChoices.includes(id)?state.coldChoices.filter(value=>value!==id):[...state.coldChoices,id];button.setAttribute('aria-pressed',String(state.coldChoices.includes(id)));save();});
    bindReason('cold','coldReason','coldUnsure');
    host.querySelector('#cold-submit').onclick=()=>{
      if(!state.coldChoices.length){message('至少选择一个你认为总成立的式子。',true);return;}
      const why=answerText(state.coldReason,state.coldUnsure);if(!why){message('先留一句理由；暂时说不清也可以如实勾选。',true);return;}
      const selected=state.coldChoices.map(id=>L.coldClaims.find(item=>item.id===id)?.formula||id);
      log.submit(0,selected.join('；'),L.sameSet(state.coldChoices,L.coldAnswer),why);
      log.note(0,'首答在示例与提示出现前封存；本环节未即时揭示正确答案。');
      log.finish(0,'冷判断已封存；不据此认定掌握');render(true);
    };
  }

  function sampleMarkup(){
    const merged=state.sampleExpanded;
    const before='<div class="segment-row" style="--a-size:'+state.sampleValue+'" aria-label="三个a与两个a"><span>a</span><span>a</span><span>a</span><b>＋</b><span>a</span><span>a</span></div>';
    const after='<div class="segment-row merged" style="--a-size:'+state.sampleValue+'" aria-label="五个相同的a"><span>a</span><span>a</span><span>a</span><span>a</span><span>a</span></div>';
    return '<section class="algebra-sample"><div class="algebra-sample-head"><h3>完整示例：让 a 换几个值</h3><output>a＝'+state.sampleValue+'</output></div><p>这里先把 <b>a</b> 看成一段可变长度。长度条只是帮助观察；一般理由在下面的分配律。</p><input id="sample-value" type="range" min="1" max="5" step="1" value="'+state.sampleValue+'" aria-label="改变a的示例值">'+(merged?after:before)+'<div class="sample-equation"><span>3a＋2a</span><i>＝</i><span>(3＋2)a</span><i>＝</i><span>5a</span></div><p class="sample-proof"><b>为什么对所有 a 都成立？</b><br>3a 和 2a 都把 a 当作共同因子。分配律反过来用：3×a＋2×a＝(3＋2)×a。改变 a 只会同时改变每一份，不会改变一共有5份。</p><div class="sample-actions"><button type="button" id="toggle-sample">'+(merged?'重新分成3份和2份':'把相同的5份收在一起')+'</button></div><p class="sample-status">已亲手改变过 '+new Set(state.sampleValues).size+' / 2 个不同的 a 值。代入能帮助检查，分配律才是一般理由。</p></section>';
  }
  function sorterMarkup(){
    return '<section class="term-sorter"><h3>提示撤掉：把 4x－x＋2y＋3－1 分组</h3><p>每一行只看它的<strong>变量部分</strong>。−x 的系数是 −1；不含字母的数是常数项。</p><div class="term-sorter-header"><span>这一项</span><span>放进哪一组</span></div>'+L.labTerms.map(term=>'<label class="term-row"><b>'+term.label+'</b><select data-term="'+term.id+'"><option value="">先判断</option>'+L.groupOptions.map(group=>'<option value="'+group.id+'" '+(state.groups[term.id]===group.id?'selected':'')+'>'+group.label+'</option>').join('')+'</select></label>').join('')+'<div class="coefficient-grid"><label>x 项合并后的系数<input id="x-coefficient" inputmode="numeric" value="'+esc(state.xCoefficient)+'"></label><label>y 项合并后的系数<input id="y-coefficient" inputmode="numeric" value="'+esc(state.yCoefficient)+'"></label><label>常数项合并后的数<input id="constant" inputmode="numeric" value="'+esc(state.constant)+'"></label></div></section>';
  }
  function powerMarkup(){
    return '<section class="power-diagnostic"><h3>最后一层：3a＋2a² 能合并成一项吗？</h3><p>这次没有颜色提示。指数也是变量部分的一部分。</p><div class="parallel-choices" role="group" aria-label="判断3a加2a平方能否合并"><button type="button" data-power="can" aria-pressed="'+String(state.powerChoice==='can')+'">能合并</button><button type="button" data-power="cannot" aria-pressed="'+String(state.powerChoice==='cannot')+'">不能合并成一个单项式</button></div></section>';
  }
  function labFeedback(){
    if(!state.labAttempted)return '';
    const result=L.gradeLab(state),notes=[];
    if(!result.samples)notes.push('先把 a 调到至少两个不同的值，观察两边同步变化；再把理由落回分配律。');
    if(!result.grouped)notes.push('分组还没完全对应：4x 与 −x 是 x 项；2y 是 y 项；3 与 −1 都是常数项。');
    if(!result.x)notes.push('x 项的系数是 4＋(−1)，不是4＋1。');
    if(!result.y)notes.push('这里只有一个 y 项2y，所以它的系数仍是2。');
    if(!result.constant)notes.push('常数项也互为同类项：3＋(−1)＝2。');
    if(!result.power)notes.push('a 与 a² 的变量部分不同；出现同一个字母还不够。');
    return '<div class="lab-feedback '+(notes.length?'':'lab-success')+'">'+(notes.length?notes.map(note=>'<p>'+esc(note)+'</p>').join(''):'分组、系数和指数判断都对应上了。')+'</div>';
  }
  function renderLab(){
    const body='<p class="parallel-lead">先看一个完整示例，再自己给没有颜色的项分组。目标不是记词，而是找到<strong>共同变量部分</strong>。</p>'+sampleMarkup()+sorterMarkup()+powerMarkup()+labFeedback()+reason('lab','把操作和解释绑在一起。',state.labReason,state.labUnsure,'我把……和……分在一起，因为……；合并时只……。')+'<details class="parallel-help" data-help="同类项分组提示"><summary>分过一次后仍卡住，给我一条提示</summary><p>把每一项写成“系数×变量部分”：4x＝4×x，−x＝−1×x，2y＝2×y；常数3和−1的变量部分都可以看成1。</p></details>';
    host.innerHTML=card('环节二 · 示例与撤架','共同因子没有变，系数才可以一起算',body,'<button class="primary" id="lab-submit">检查分组与解释 →</button>');
    const slider=host.querySelector('#sample-value');
    slider.oninput=()=>{
      state.sampleValue=Number(slider.value);state.sampleValues=L.uniqueAllowed([...state.sampleValues,state.sampleValue],[1,2,3,4,5]);save();
      host.querySelector('.algebra-sample output').textContent='a＝'+state.sampleValue;
      host.querySelectorAll('.segment-row').forEach(row=>row.style.setProperty('--a-size',state.sampleValue));
      host.querySelector('.sample-status').textContent='已亲手改变过 '+new Set(state.sampleValues).size+' / 2 个不同的 a 值。代入能帮助检查，分配律才是一般理由。';
    };
    host.querySelector('#toggle-sample').onclick=()=>{state.sampleExpanded=!state.sampleExpanded;state.sampleValues=L.uniqueAllowed([...state.sampleValues,state.sampleValue],[1,2,3,4,5]);save();render();host.querySelector('#toggle-sample')?.focus({preventScroll:true});};
    host.querySelectorAll('[data-term]').forEach(select=>select.onchange=()=>{if(select.value)state.groups[select.dataset.term]=select.value;else delete state.groups[select.dataset.term];save();});
    for(const [id,key] of [['x-coefficient','xCoefficient'],['y-coefficient','yCoefficient'],['constant','constant']])host.querySelector('#'+id).oninput=event=>{state[key]=event.target.value.slice(0,20);save();};
    host.querySelectorAll('[data-power]').forEach(button=>button.onclick=()=>{state.powerChoice=button.dataset.power;host.querySelectorAll('[data-power]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    bindReason('lab','labReason','labUnsure');bindHelp(1);
    host.querySelector('#lab-submit').onclick=()=>{
      if(Object.keys(state.groups).length<L.labTerms.length){message('五项都要先放进一组。',true);return;}
      if(![state.xCoefficient,state.yCoefficient,state.constant].every(value=>String(value).trim())){message('把三组合并后的系数或常数补完整。',true);return;}
      if(!state.powerChoice){message('还要判断3a＋2a²能否合并成一项。',true);return;}
      const why=answerText(state.labReason,state.labUnsure);if(!why){message('留一句分组依据；暂时说不清也可以如实勾选。',true);return;}
      const result=L.gradeLab(state),correct=Object.values(result).every(Boolean);
      const groups=L.labTerms.map(term=>term.label+'→'+(L.groupOptions.find(group=>group.id===state.groups[term.id])?.label||'未分组')).join('；');
      log.submit(1,groups+'；结果：'+state.xCoefficient+'x＋'+state.yCoefficient+'y＋'+state.constant+'；3a＋2a²：'+(state.powerChoice==='cannot'?'不能合并':'能合并'),correct,why);
      state.labAttempted=true;save();
      if(!correct){log.help(1,'自动反馈：分组、系数或指数');render();return;}
      log.note(1,'孩子操作过的a示例值：'+state.sampleValues.join('、')+'。数值代入只作检查，一般理由使用分配律。');
      log.finish(1,(log.records[1].helps.some(help=>help.phase!=='完成后回看')?'使用过提示或自动反馈；':'未打开提示；')+'完成撤架分组');render(true);
    };
  }

  function routeFigure(){
    return '<figure class="route-figure"><svg viewBox="0 0 420 310" role="img" aria-labelledby="route-title route-desc"><title id="route-title">五边形试验路线</title><desc id="route-desc">五条边依次标为x、2、x、2、x米</desc><defs><marker id="route-arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#435d8b"/></marker></defs><path d="M112 42 L310 58 L360 190 L202 275 L54 178 Z" fill="#edf1fa" stroke="#435d8b" stroke-width="4" stroke-linejoin="round"/><path d="M112 42 L310 58" stroke="#bf7a39" stroke-width="7" marker-end="url(#route-arrow)"/><g fill="#2c426c" font-family="system-ui,sans-serif" font-size="22" font-weight="700"><text x="202" y="42">x</text><text x="342" y="122">2</text><text x="279" y="250">x</text><text x="116" y="258">2</text><text x="65" y="105">x</text></g><text x="210" y="151" text-anchor="middle" fill="#6b7690" font-family="system-ui,sans-serif" font-size="15">从橙色边出发，沿箭头绕一圈</text></svg><figcaption>单位：米。x 是一段可变长度，且取值使图形成立。</figcaption></figure>';
  }
  function transferFeedback(){
    if(!state.transferAttempted)return '';
    const result=L.gradeTransfer(state),notes=[];
    if(!result.option)notes.push('五条边逐项相加：x＋2＋x＋2＋x。先分别收集 x 项和常数项。');
    if(!result.claim)notes.push('“7x”只会在特殊取值下碰巧等于周长，不能作为对所有x都成立的式子。');
    if(!result.check)notes.push('x＝3时，三条x边共9米，两条常数边共4米，总路程13米。');
    if(!result.reason)notes.push('一般化简的依据是分别合并相同变量部分，不是把字母相乘。');
    return '<div class="lab-feedback '+(notes.length?'':'lab-success')+'">'+(notes.length?notes.map(note=>'<p>'+esc(note)+'</p>').join(''):'结构判断、数值反例和一般理由已经对应。')+'</div>';
  }
  function renderTransfer(){
    const options='<div class="formula-options" role="group" aria-label="选择化简后的周长">'+L.transferOptions.map(item=>'<button type="button" data-option="'+item.id+'" aria-pressed="'+String(state.option===item.id)+'">'+item.formula+'</button>').join('')+'</div>';
    const reasons='<div class="reason-options" role="group" aria-label="选择化简依据">'+L.transferReasons.map(item=>'<button type="button" data-transfer-reason="'+item.id+'" aria-pressed="'+String(state.reason===item.id)+'">'+item.text+'</button>').join('')+'</div>';
    const work='<div class="route-work"><h3>1. 绕一圈的总路程化简成什么？</h3>'+options+'<h3>2. “总路程是7x米”对所有x都成立吗？</h3><div class="claim-options" role="group"><button type="button" data-claim-answer="always" aria-pressed="'+String(state.claim==='always')+'">总成立</button><button type="button" data-claim-answer="not-always" aria-pressed="'+String(state.claim==='not-always')+'">不总成立</button></div><div class="route-check"><label for="check-value">代入 x＝3 检查，实际总路程是多少米？</label><input id="check-value" inputmode="numeric" value="'+esc(state.checkValue)+'"></div><h3>3. 选择一般化简的依据</h3>'+reasons+'</div>';
    const body='<p class="parallel-lead">颜色、分组框和“同类项”标签全部撤掉。读图列式，再用刚才的方法独立处理。</p><div class="route-transfer">'+routeFigure()+work+'</div>'+transferFeedback()+reason('transfer','最后用自己的话把“判断—依据—结论”连起来。',state.transferExplanation,state.transferUnsure,'我把……和……合并，因为……；所以总路程……。')+'<details class="parallel-help" data-help="路线图同类项提示"><summary>独立做过一次仍卡住，再看一条提示</summary><p>先原样写成 x＋2＋x＋2＋x；再问哪些项拥有完全相同的变量部分。</p></details><p class="identity-note">代入 x＝3 可以检查“7x”在这个取值下是否与真实总路程一致：一次不一致足以推翻“总成立”，一次一致却不能证明总成立。一般结论仍要靠分组与分配律。</p>';
    host.innerHTML=card('环节三 · 独立迁移','没有颜色提示，路线图里的周长怎样化简？',body,'<button class="primary" id="transfer-submit">封存路线质检 →</button>');
    host.querySelectorAll('[data-option]').forEach(button=>button.onclick=()=>{state.option=button.dataset.option;host.querySelectorAll('[data-option]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    host.querySelectorAll('[data-claim-answer]').forEach(button=>button.onclick=()=>{state.claim=button.dataset.claimAnswer;host.querySelectorAll('[data-claim-answer]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    host.querySelector('#check-value').oninput=event=>{state.checkValue=event.target.value.slice(0,20);save();};
    host.querySelectorAll('[data-transfer-reason]').forEach(button=>button.onclick=()=>{state.reason=button.dataset.transferReason;host.querySelectorAll('[data-transfer-reason]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));save();});
    bindReason('transfer','transferExplanation','transferUnsure');bindHelp(2);
    host.querySelector('#transfer-submit').onclick=()=>{
      if(!state.option||!state.claim||!String(state.checkValue).trim()||!state.reason){message('公式、7x判断、代入检查和一般依据都要先完成。',true);return;}
      const why=answerText(state.transferExplanation,state.transferUnsure);if(!why){message('留一句自己的解释；暂时说不清也可以如实勾选。',true);return;}
      const result=L.gradeTransfer(state),correct=Object.values(result).every(Boolean);
      const formula=L.transferOptions.find(item=>item.id===state.option)?.formula||state.option;
      const basis=L.transferReasons.find(item=>item.id===state.reason)?.text||state.reason;
      log.submit(2,'总路程：'+formula+'；7x：'+(state.claim==='not-always'?'不总成立':'总成立')+'；x=3时：'+state.checkValue+'米；依据：'+basis,correct,why);
      state.transferAttempted=true;save();
      if(!correct){log.help(2,'自动反馈：路线图迁移');render();return;}
      log.note(2,'结构化迁移全部正确；开放解释保留原话，不按关键词自动判分。');
      log.finish(2,(log.records[2].helps.some(help=>help.phase!=='完成后回看')?'使用过迁移提示或自动反馈；':'未打开迁移提示；')+'完成无颜色几何迁移');render(true);
    };
  }

  function finish(){
    if(sources)sources.hidden=false;
    const body='<p class="parallel-lead">这节课不是教一条“看字母”的口诀，而是建立代数中的第一座桥：从若干份具体数量，走到对所有允许取值都成立的式子。</p><div class="algebra-final"><div><b>先看结构</b>每一项＝系数×变量部分；常数项也能互相合并。</div><div><b>再用依据</b>同类项合并是分配律的逆用，只算系数，变量部分不变。</div><div><b>守住边界</b>异类项可以相加、也能代入求值，只是不能一般地化成一个单项式。</div></div><p class="parallel-takeaway"><b>3a＋2a＝(3＋2)a＝5a</b><br>共同变量部分是 a。<br><b>3a＋2b</b> 已经是合法的和；若 a、b 未知，不能一般地合成一个单项式。<br><b>3a＋2a²</b> 也不能合并，因为 a 与 a² 的变量部分不同。</p><p>本页保留了首答、样例操作值、分组、提示、修订和独立迁移。完成页面不等于长期掌握；隔一段时间换成价格、面积或公式情境，仍要能自己找共同变量部分。</p><div class="parallel-actions"><a class="primary" href="records.html">查看学习记录</a><a class="secondary" href="courses.html?group=school&amp;subject=数学">返回数学课程</a><button class="secondary" id="liketerms-restart">重新学一轮（保留旧记录）</button></div>';
    host.innerHTML=card('A1 · 从数走向式','能合并的不是“长得像”，而是共同结构',body)+log.html();
    host.querySelector('#liketerms-restart').onclick=()=>{log=F.create(L.title,L.tasks,true);state=L.sanitizeState({});save();if(sources)sources.hidden=true;render(true);};
  }
  function render(moveFocus=false){
    progress();
    if(log.index>=L.tasks.length)finish();else if(log.index===0)renderCold();else if(log.index===1)renderLab();else renderTransfer();
    progress();if(sources&&log.index<L.tasks.length)sources.hidden=true;if(moveFocus)focusCard();
  }
  render();
})();
