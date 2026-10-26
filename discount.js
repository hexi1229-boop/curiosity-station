'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='discount'))LearningFeedback.courses.push(['discount',DiscountLesson.title,'discount.html']);
const discountQuestions=DiscountLesson.questions,discountEscape=LearningFeedback.esc,discountTask=document.querySelector('#discount-task');
let discountLog=LearningFeedback.create(DiscountLesson.title,discountQuestions),discountIndex=discountLog.index,discountStop=()=>{};
document.addEventListener('visibilitychange',()=>{if(document.hidden)discountStop();});
window.addEventListener('pagehide',()=>discountStop());
function discountBill(price,shipping,rule){return `<div class="discount-bill"><div class="bill-line"><span>商品原价</span><b>${price} 元</b></div><div class="bill-line"><span>运费</span><b>${shipping} 元</b></div></div><strong class="bill-rule">${rule}</strong>`;}
function discountScene(index){
 if(index===0)return `<p class="scene-kicker">第一张订单</p><h2>先看规则，<br>再算这笔账</h2>${discountBill(80,10,'仅商品八折<br>运费不参与优惠')}<p>先留下判断。提交后，再用另一张订单动手看。</p>`;
 if(index===1)return `<p class="scene-kicker">自己接一单</p><h2>折扣变了，<br>运费还是另算</h2>${discountBill(150,12,'仅商品六折<br>运费不参与优惠')}<p>需要时可以回看短例子；使用帮助会如实记下来。</p>`;
 if(index===2)return `<p class="scene-kicker">给同伴改一处</p><h2>括号把谁<br>也算进去了？</h2>${discountBill(200,20,'商品按原价的75%收费<br>运费不参与优惠')}<p class="wrong-calculation">小林：<br>（200＋20）×75%<br>＝165元</p><p>指出具体哪笔钱被多打了折，比只说“先乘后加”更有用。</p>`;
 if(index===3)return `<p class="scene-kicker">相同金额，换了条件</p><h2>这次优惠，<br>两笔钱都包括</h2>${discountBill(80,10,'商品＋运费<br>合计金额统一八折')}<p>模型先收起来。这次自己按新规则判断。</p>`;
 return `<p class="scene-kicker">离开购物，换张信息表</p><h2>同一个配方，<br>做成更大的一杯</h2><table class="recipe-table"><caption>每份固定配方</caption><thead><tr><th>成品饮料总量</th><th>其中的果汁</th></tr></thead><tbody><tr><td>100 毫升</td><td>20 毫升</td></tr></tbody></table><p class="recipe-target">这次要做：250毫升成品</p><p>20毫升果汁已包含在100毫升成品中，不是额外再加的一份。保持配方不变。</p><p class="source-note">原创配方数据，只研究体积配比，不讨论营养或化学浓度。</p>`;
}
function discountLabMarkup(){return `<details class="discount-lab"><summary>动手验证：拖动优惠范围，看它覆盖了谁</summary><div class="discount-lab-body"><h3>短例子：商品与运费分开看</h3><p class="percent-key" id="discount-percent-key"></p><p class="lab-note">例子与题目金额不同。这里切换例子的优惠规则，实际作答按题干。</p><label for="discount-scope">拖动优惠圈：<output id="discount-scope-label"></output></label><input type="range" id="discount-scope" min="0" max="1" step="1" value="0"><div class="discount-scope-options" role="group" aria-label="优惠覆盖范围"><button data-scope="goods">只覆盖商品</button><button data-scope="all">覆盖商品和运费</button></div><p class="lab-rule" id="discount-lab-rule"></p><div id="discount-picture"></div><label for="discount-stage">过程位置：<output id="discount-stage-label"></output></label><input type="range" id="discount-stage" min="0" max="2" step="1" value="0"><div class="discount-controls"><button id="discount-play">播放三步</button><button id="discount-step">下一步</button><button id="discount-reset">回到原账单</button></div><p class="lab-equation" id="discount-equation" aria-live="polite"></p><p id="discount-scope-difference" class="scope-difference"></p><details class="discount-parameters"><summary>想换数字，再展开</summary><div class="discount-price-options" role="group" aria-label="选择例子的商品原价"><button data-price="100">商品100元</button><button data-price="200">商品200元</button></div><label for="discount-fee">例子运费：<output id="discount-fee-label"></output></label><input type="range" id="discount-fee" min="0" max="40" step="10" value="20"><label for="discount-rate">付费比例：<output id="discount-rate-label"></output></label><input type="range" id="discount-rate" min="50" max="100" step="10" value="80"></details><p class="lab-note">同一组金额的前后图尺不变；换金额会重设图尺。浅色虚框是省下的钱。切换范围是比较两种规则，不是在订单里任选更便宜的算法。</p></div></details>`;}
function bindDiscountLab(){
 const log=discountLog,index=discountIndex,details=discountTask.querySelector('.discount-lab');
 let s=DiscountLesson.restore(log.checkpoint.discountLab),timer=null,playing=false;
 const money=DiscountLesson.money,stages=['① 看原价与运费','② 留下要付的部分','③ 合起来看总额'];
 function save(label){log.point({discountLab:{price:s.price,shipping:s.shipping,payPercent:s.payPercent,scope:s.scope,stage:s.stage}});if(label)log.help(index,label);}
 function halt(){if(timer!==null)clearTimeout(timer);timer=null;playing=false;const button=details.querySelector('#discount-play');if(button)button.textContent='播放三步';}
 discountStop=halt;
 function draw(){
  s=DiscountLesson.model(s);
  const scale=300/(s.price+s.shipping),goodsWidth=s.price*scale,feeX=24+goodsWidth,feeWidth=s.shipping*scale,payGoods=s.stage===0?goodsWidth:goodsWidth*s.payPercent/100,payFee=s.stage===0?feeWidth:feeWidth*(s.scope==='all'?s.payPercent/100:1),bracketEnd=s.scope==='all'?324:feeX;
  details.querySelector('h3').textContent=`短例子：商品${s.price}元，运费${s.shipping}元`;
  details.querySelector('#discount-percent-key').textContent=`${s.payPercent/10}折＝付原价的${s.payPercent}%＝乘${s.payPercent/100}；省下的是${100-s.payPercent}%。`;
  details.querySelector('#discount-fee').value=s.shipping;details.querySelector('#discount-fee-label').textContent=s.shipping+'元';
  details.querySelector('#discount-rate').value=s.payPercent;details.querySelector('#discount-rate-label').textContent=s.payPercent/10+'折，付'+s.payPercent+'%';
  details.querySelector('#discount-scope').value=s.scope==='all'?1:0;details.querySelector('#discount-scope-label').textContent=s.scope==='all'?'商品＋运费':'仅商品';
  details.querySelector('#discount-stage').value=s.stage;details.querySelector('#discount-stage-label').textContent=stages[s.stage];
  details.querySelectorAll('[data-price]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.price)===s.price)));
  details.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===s.scope)));
  details.querySelector('#discount-lab-rule').textContent=s.scope==='all'?`此刻的规则：商品和运费合计，统一按${s.payPercent}%收费。`:`此刻的规则：只有商品按${s.payPercent}%收费，运费按原数加入。`;
  const scope=s.scope==='all'?'商品和运费':'商品',tickLines=Array.from({length:9},(_,i)=>`<path d="M${24+goodsWidth*(i+1)/10} 95V129" class="bar-tick"/>`).join('');
  let picture=details.querySelector('svg');
  if(!picture){details.querySelector('#discount-picture').innerHTML='<svg class="discount-picture" viewBox="0 0 350 265" role="img"><title></title><g id="discount-bars"></g></svg>';picture=details.querySelector('svg');}
  picture.querySelector('title').textContent=`${stages[s.stage]}。原价${s.price}元，运费${s.shipping}元，优惠覆盖${scope}。${s.stage?s.total/100+'元应付。':'尚未打折。'}`;
  const goodsText=s.stage===0?s.price:money(s.goodsPaid),feeText=s.stage===0?s.shipping:money(s.shippingPaid);
  const bars=picture.querySelector('#discount-bars');
  if(!bars.children.length)bars.innerHTML='<text x="24" y="28" class="stage-title" id="discount-svg-stage"></text><path id="discount-bracket" class="scope-bracket"/><text x="24" y="78">商品</text><text x="324" y="78" text-anchor="end">运费</text><rect id="discount-goods-outline" y="95" height="34" class="bar-outline"/><rect id="discount-fee-outline" y="95" height="34" class="bar-outline"/><rect id="discount-goods-paid" x="24" y="95" height="34" class="goods-bar paid-bar"/><rect id="discount-fee-paid" y="95" height="34" class="shipping-bar paid-bar"/><rect id="discount-goods-saved" y="95" height="34" class="saved-bar"/><rect id="discount-fee-saved" y="95" height="34" class="saved-bar"/><g id="discount-ticks"></g><text x="24" y="157" class="bar-label" id="discount-goods-text"></text><text x="324" y="157" text-anchor="end" class="bar-label" id="discount-fee-text"></text><text x="24" y="195" id="discount-svg-explanation"></text><text x="24" y="230" class="stage-title" id="discount-svg-total"></text>';
  function attrs(id,a){const el=bars.querySelector(id);Object.entries(a).forEach(([k,v])=>el.setAttribute(k,v));}
  bars.querySelector('#discount-svg-stage').textContent=stages[s.stage];
  attrs('#discount-bracket',{d:`M24 57V44H${bracketEnd}V57`,class:'scope-bracket'+(s.scope==='all'?' scope-all':'')});
  attrs('#discount-goods-outline',{x:24,width:goodsWidth});attrs('#discount-fee-outline',{x:feeX,width:feeWidth});
  attrs('#discount-goods-paid',{width:payGoods});attrs('#discount-fee-paid',{x:feeX,width:payFee});
  attrs('#discount-goods-saved',{x:24+payGoods,width:goodsWidth-payGoods});attrs('#discount-fee-saved',{x:feeX+payFee,width:feeWidth-payFee});
  bars.querySelector('#discount-ticks').innerHTML=tickLines;
  bars.querySelector('#discount-goods-text').textContent=`商品 ${goodsText}元`;
  bars.querySelector('#discount-fee-text').textContent=`运费 ${feeText}元`;
  bars.querySelector('#discount-svg-explanation').textContent=s.stage===0?`上方括线覆盖${scope}，它才参与优惠。`:s.scope==='all'?'两段都缩短；虚框是省下的钱。':'只缩短商品段，运费段保持原长。';
  bars.querySelector('#discount-svg-total').textContent=s.stage===2?`应付 ${money(s.goodsPaid)}＋${money(s.shippingPaid)}＝${money(s.total)}元`:'先认范围，再留出要付的部分。';
  details.querySelector('#discount-equation').textContent=s.stage===0?'先预测，再点“下一步”验证。':s.scope==='all'?`（${s.price}＋${s.shipping}）×${s.payPercent/100}＝${money(s.total)}元`:`${s.price}×${s.payPercent/100}＋${s.shipping}＝${money(s.total)}元`;
  details.querySelector('#discount-scope-difference').textContent=s.difference?`比较两种规则：只商品优惠付${money(s.goodsOnly)}元；整单优惠付${money(s.wholeBill)}元。相差${money(s.difference)}元，差在运费是否也享受优惠。`:'这组数的两种算法结果相同；运费为0或不打折时可能相同，不能据此说两种优惠范围总是一样。';
  details.querySelector('#discount-play').textContent=playing?'暂停':'播放三步';
 }
 function change(patch,label){halt();s={...s,...patch};save(label);draw();}
 function playStep(){if(!playing)return;s={...s,stage:Math.min(2,s.stage+1)};save();if(s.stage===2)halt();draw();if(playing)timer=setTimeout(playStep,1400);}
 details.querySelectorAll('[data-price]').forEach(b=>b.onclick=()=>change({price:Number(b.dataset.price)},'改变例子商品原价'));
 details.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>change({scope:b.dataset.scope},'改变优惠覆盖范围'));
 details.querySelector('#discount-fee').oninput=e=>change({shipping:Number(e.target.value)},'改变例子运费');
 details.querySelector('#discount-rate').oninput=e=>change({payPercent:Number(e.target.value)},'改变付费比例');
 details.querySelector('#discount-scope').oninput=e=>change({scope:Number(e.target.value)?'all':'goods'},'拖动优惠范围');
 details.querySelector('#discount-stage').oninput=e=>change({stage:Number(e.target.value)},'拖动计算过程');
 details.querySelector('#discount-step').onclick=()=>change({stage:(s.stage+1)%3},'逐步验证优惠范围');
 details.querySelector('#discount-reset').onclick=()=>change({stage:0},'回到原账单');
 details.querySelector('#discount-play').onclick=()=>{if(playing){halt();draw();return;}if(s.stage===2)s={...s,stage:0};playing=true;save('播放优惠计算过程');draw();timer=setTimeout(playStep,1400);};
 details.addEventListener('toggle',()=>{if(details.open)log.help(index,'查看百分数与优惠范围模型');else halt();});draw();
}
function renderDiscount(focus=false){
 discountStop();
 document.querySelector('#discount-progress').textContent=discountIndex===5?'5 题完成':`第 ${discountIndex+1} / 5 题`;
 document.querySelector('#discount-dots').innerHTML=discountQuestions.map((_,i)=>`<i class="${discountLog.records[i].done?'done':''} ${i===discountIndex?'current':''}"></i>`).join('');
 if(discountIndex===5){finishDiscount();return;}
 const q=discountQuestions[discountIndex],r=discountLog.records[discountIndex],open=q.kind==='open';
 let selected=Number.isInteger(r.draft?.$choice)?r.draft.$choice:null;
 const entry=q.kind==='choice'?`<div class="reading-choices" role="group" aria-label="选择你的判断">${q.options.map((option,i)=>`<button class="reading-choice" data-choice="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span><span>${discountEscape(option)}</span></button>`).join('')}</div>`:open?'<label for="discount-answer">留一句自己的解释或一个算式</label><textarea id="discount-answer" maxlength="600" rows="3" placeholder="短句或列式都可以，也可用键盘语音输入。"></textarea><label class="reason-unsure"><input id="discount-unsure" type="checkbox">我暂时说不清，先如实记下来</label>':'<label for="discount-number">应付金额</label><div class="discount-number"><input id="discount-number" inputmode="decimal" autocomplete="off" maxlength="24" aria-label="应付金额，单位元"><span>元</span></div>';
 discountTask.innerHTML=`<div class="discount-layout"><article class="discount-scene">${discountScene(discountIndex)}</article><section class="reading-work discount-work"><p class="skill-label">${q.skill}</p><h2 id="discount-question" tabindex="-1">${discountEscape(q.title)}</h2><p class="discount-context">${discountEscape(discountIndex<2?"按这张订单作答；需要时可以打开提示。":q.context)}</p>${entry}<button class="primary" id="submit-discount">${open?'先保存我的想法':'确认我的判断'}</button><div class="reading-message" id="discount-message" role="status" aria-live="polite"></div><details class="reading-hint" data-help="本题提示"><summary>给我一点提示</summary><p>${discountEscape(q.hint)}</p></details>${!open?'<button class="text-button" id="discount-method">暂时不会，看看方法</button>':''}<div id="discount-review" hidden></div><div id="discount-lab-slot"></div><div class="reading-next"><p>首答会保留。<br>不计时，不排名。</p><button class="primary" id="next-discount" disabled>${discountIndex===4?'看看学习反馈':'下一题'} →</button></div></section></div>`;
 const message=document.querySelector('#discount-message'),submit=document.querySelector('#submit-discount'),next=document.querySelector('#next-discount');
 function say(text,error=false){message.textContent=text;message.dataset.error=String(error);}
 function showLab(){if(discountIndex>1||discountTask.querySelector('.discount-lab'))return;discountTask.querySelector('#discount-lab-slot').innerHTML=discountLabMarkup();bindDiscountLab();}
 function finishClosed(){discountTask.querySelectorAll('[data-choice],#discount-number,#submit-discount,#discount-method').forEach(el=>el.disabled=true);say(q.explanation);next.disabled=false;showLab();}
 function getOpen(){const text=discountTask.querySelector('#discount-answer').value.trim();if(!text&&!discountTask.querySelector('#discount-unsure').checked){say('先留一点自己的想法；暂时说不清也可以如实记录。',true);return null;}return text||'暂时说不清';}
 function showReview(){
  discountLog.help(discountIndex,'参考方法（提交后）');
  const review=discountTask.querySelector('#discount-review');review.hidden=false;
  review.innerHTML=`<section class="reading-review"><h3>对照方法，检查自己的依据</h3><p>${discountEscape(q.reference)}</p><ul>${q.checks.map(c=>`<li>${discountEscape(c)}</li>`).join('')}</ul><p>你的原话已保留；想改可以直接改上面的答案。开放解释不自动判分。</p><div class="reading-self"><button data-self="已对照，认为理由说清了">我对照过，能说清</button><button data-self="对照后仍需要帮助">还需要一点帮助</button></div></section>`;
  submit.textContent='保存我的修改';
  review.querySelectorAll('[data-self]').forEach(button=>button.onclick=()=>{const answer=getOpen();if(!answer)return;if(answer!==r.attempts.at(-1)?.answer)discountLog.submit(discountIndex,answer,null,answer);discountLog.finish(discountIndex,button.dataset.self);discountTask.querySelectorAll('textarea,input,#submit-discount,[data-self]').forEach(el=>el.disabled=true);button.setAttribute('aria-pressed','true');say('原话、修改和自检已保存；自评不等于已经独立掌握。');next.disabled=false;});
 }
 discountTask.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.choice);discountTask.querySelectorAll('[data-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});
 submit.onclick=()=>{
  if(open){const answer=getOpen();if(!answer)return;const first=!r.first;if(answer!==r.attempts.at(-1)?.answer)discountLog.submit(discountIndex,answer,null,answer);if(first)discountLog.help(discountIndex,'参考方法（提交后）');showReview();say('先对照自己的方法，再完成本题自检。');return;}
  let answer,correct;
  if(q.kind==='choice'){if(selected===null||!q.options[selected]){say('先选一个判断，再确认。',true);return;}answer=q.options[selected];correct=selected===q.answer;}
  else{const raw=discountTask.querySelector('#discount-number').value,value=DiscountLesson.readAmount(raw);if(value===null){say('请填金额数值，例如 12 或 12.50；单位已标在旁边。',true);return;}answer=raw.trim()+'元';correct=value===q.answer;}
  discountLog.submit(discountIndex,answer,correct);
  if(correct){discountLog.finish(discountIndex);finishClosed();}else{say('首答已保留。再看优惠覆盖了谁，可以重试或看一个短例子。',true);showLab();}
 };
 if(!open)discountTask.querySelector('#discount-method').onclick=()=>{if(!r.first)discountLog.submit(discountIndex,'暂时不会，选择查看方法',false);discountLog.help(discountIndex,'查看本题方法');discountLog.finish(discountIndex,'看过方法，留待再练');finishClosed();};
 LearningFeedback.watchHelp(discountTask,discountLog,discountIndex);
 if(discountIndex===1)showLab();
 if(r.done&&!open)finishClosed();else if(r.first){if(open){showReview();say('原话和草稿已恢复，继续对照或修改即可。');}else{say('首答已经保留，可以继续尝试。',true);showLab();}}
 next.onclick=()=>{discountIndex++;renderDiscount(true);};
 if(focus){discountTask.querySelector('#discount-question').focus({preventScroll:true});document.querySelector('.reading-progress').scrollIntoView({block:'start'});}
}
function finishDiscount(){
 discountTask.innerHTML=`<section class="reading-finish"><h2 tabindex="-1">5题走完，今天先到这里。</h2><p><strong>先认清“谁是整体”，再看百分数作用于哪一部分。</strong></p><ul class="discount-finish-list"><li>八折是付原价的80%，不是只付20%。</li><li>只有商品优惠：商品价×付费比例＋未优惠的运费。</li><li>商品和运费都参与：可以把合计金额一起乘。</li><li>换成配方表，也先辨清整体和其中的一部分。</li></ul><p class="finish-note">3题数值或判断，2题解释与迁移。首答、帮助和原话比“最后都做完了”更能帮助判断下一步。下次换一份新材料，再看能否独立使用；本页不自动认定已经掌握。</p><a class="secondary" href="records.html">查看学习记录 ↗</a><a class="secondary" href="./">回到小站</a><button class="text-button" id="restart-discount">重新练这5题（保留旧记录）</button><details class="reading-hint discount-source-links"><summary>家长参考：目标、边界与来源</summary><p>本课衔接百分数意义和简单实际应用，核心是辨认基数与优惠范围；不涵盖复杂叠券、满减、税费、化学浓度或完整百分数单元。金额与配方均为原创教学材料，不代表真实商家规则。</p><p>依据：<a href="https://www.moe.gov.cn/srcsite/A26/s8001/202204/t20220420_619921.html" target="_blank" rel="noopener">教育部 · 义务教育课程标准（2022年版）</a>；数学核对：<a href="https://openstax.org/books/prealgebra-2e/pages/6-3-solve-sales-tax-commission-and-discount-applications" target="_blank" rel="noopener">OpenStax · 百分数与折扣应用</a>。中文八折是付80%，与英文“减价百分比”的说法须区分。本课只提供未来应用题建模的前置，不冒称天津真题原题。</p></details></section>${discountLog.html()}`;
 discountTask.querySelector('#restart-discount').onclick=()=>{discountLog=LearningFeedback.create(DiscountLesson.title,discountQuestions,true);discountLog.save();discountIndex=0;renderDiscount(true);};discountTask.querySelector('h2').focus({preventScroll:true});
}
renderDiscount();
