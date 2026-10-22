/* Signed multiplication preserves distributivity; cancellation is an equation model. */
(function(root){
  'use strict';
  const title='负数乘负数，为什么是正数？';
  function fmt(n){if(!Number.isFinite(n))throw new Error('Invalid number');return String(Object.is(n,-0)?0:n).replace('-','−');}
  function term(n){return n<0?'('+fmt(n)+')':fmt(n);}
  function state(a,b,step=0){
    if(!Number.isInteger(a)||a< -5||a> -1||!Number.isInteger(b)||b< -4||b>0||!Number.isInteger(step)||step<0||step>3)throw new Error('Outside multiplication model');
    const opposite=b===0?0:-b,known=a*opposite||0,result=a*b||0;
    const lines=[`${term(a)} × [${opposite}＋${term(b)}] ＝ ${term(a)} × 0 ＝ 0`,`${term(a)} × ${opposite} ＋ ${term(a)} × ${term(b)} ＝ 0`,`${fmt(known)} ＋ ? ＝ 0`,`${fmt(known)} ＋ ${result} ＝ 0`];
    return {a,b,opposite,known,result,step,line:lines[step],pairCount:result};
  }
  function readNumber(input){const raw=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)&&Number.isFinite(Number(raw))?Number(raw):null;}
  const questions=[
    {kind:'choice',skill:'先判断，再追问规则为什么成立',title:'（−3）×（−2）等于多少？',context:'这里是两个负数相乘。先独立选择，再打开分配律推理模型。',options:['−6','6','−5'],answer:1,hint:'先别只记符号口诀。2与−2相加为0，所以（−3）×2与（−3）×（−2）相加应是多少？',explanation:'结果是6。保持分配律：（−3）×[2＋（−2）]＝0，展开为−6＋（−3）×（−2）＝0。能与−6相加为0的是＋6，所以这个乘积必须是6。'},
    {kind:'number',skill:'换成异号和小数，检查两件事',title:'（−1.5）×4＝？',context:'一个负数乘一个正数。先确定符号，再算绝对值；只填数值。',label:'乘积（可填小数和负号）',unit:'',answer:-6,hint:'4个−1.5相加是什么方向的数？绝对值是1.5×4，不是1.5＋4。',explanation:'（−1.5）×4＝−6。异号两数相乘得负，绝对值1.5×4＝6。也可以想成4个−1.5相加。'},
    {kind:'open',skill:'用等式解释，不只背口诀',title:'为什么（−4）×（−2）不能等于−8？',context:'要求有理数乘法继续满足分配律。利用2＋（−2）＝0，写出或说清理由。不能只回答“负负得正”。',hint:'把（−4）×[2＋（−2）]展开。一项是（−4）×2＝−8，另一项要是多少，两项和才是0？',reference:'（−4）×[2＋（−2）]＝（−4）×0＝0。按分配律展开为−8＋（−4）×（−2）＝0，所以待求乘积应为8；如果也是−8，两项和会是−16，不是0。用自己的话说“需要＋8抵消−8，和才为0”也可以。',checks:['使用分配律或等价叙述，把两个乘积的和联系到0。','指出已知项−8，另一项必须是＋8；说明错误答案−8无法使和为0。']},
    {kind:'choice',skill:'检验小数与0这两个边界',title:'下面哪一组结果全部正确？',context:'甲：（−0.5）×（−0.2）；乙：（−7）×0。零不是正数，也不是负数。',options:['甲＝−0.1，乙＝0','甲＝0.1，乙＝−7','甲＝0.1，乙＝0'],answer:2,hint:'甲的符号与绝对值分开算，0.5×0.2是多少？乙中出现0，能把“两个非零因子同号”直接套上去吗？',explanation:'第三组正确。甲同号，积为正，0.5×0.2＝0.1；乙中任意数乘0都得0。零既不正也不负，不属于“两个负数相乘”的情况。'},
    {kind:'open',skill:'独立迁移，把负号放回情境',title:'潜水器每分钟下潜4米，三分钟前在哪里？',context:'过去3分钟内，潜水器一直匀速下潜，每分钟位置变化为−4米。把现在的位置记作0米，向上为正；把现在时刻记作0分钟，三分钟前记作−3分钟。求三分钟前相对现在的位置，列乘法算式并解释两个负号。',hint:'位置相对现在的变化＝每分钟的位置变化×相对现在的时间。−4表示方向，−3表示以前。以前的位置比现在高还是低？',reference:'（−4米/分钟）×（−3分钟）＝＋12米，所以三分钟前在现在位置的上方12米。−4表示每分钟向下变化，−3表示比现在早3分钟，不表示“下方3分钟”。过去3分钟从上方12米下潜到现在0米，也能反向检查这个结果。',checks:['列出（−4）×（−3）并得＋12米，或先用反向运动说明再补等价乘法。','分别解释−4的向下方向、−3的过去时间，说明结果是现在位置上方12米。','不把＋12说成绝对海拔或海面上方12米；参照点是现在的位置。']}
  ];
  root.MultiplyLesson={title,questions,state,fmt,term,readNumber};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.MultiplyLesson;
})(typeof window!=='undefined'?window:globalThis);
