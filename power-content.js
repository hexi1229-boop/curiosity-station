/* Positive-integer powers expanded as repeated factors with exact half-unit arithmetic. */
(function(root){
 'use strict';
 const title='3⁴是12吗？把乘方拆开看',bases=[-3,-2,-1,-.5,0,.5,1,2,3],supers=['','¹','²','³','⁴'];
 function rational(num,den=1){if(!Number.isSafeInteger(num)||!Number.isSafeInteger(den)||den<1)throw new Error('Invalid rational');if(num===0)return {num:0,den:1};let a=Math.abs(num),b=den;while(b){const t=a%b;a=b;b=t;}return {num:num/a,den:den/a};}
 function fmt(q){return String(q.num).replace('-','−')+(q.den===1?'':'/'+q.den);}
 function factor(base){const q=rational(base*2,2),t=fmt(q);return base<0||q.den!==1?'('+t+')':t;}
 function state(base,n,scope='whole',step=n){
  if(!bases.includes(base)||!Number.isInteger(n)||n<1||n>4||!['whole','outside'].includes(scope)||(scope==='outside'&&base>=0)||!Number.isInteger(step)||step<1||step>n)throw new Error('Outside power model');
  const innerBase=scope==='outside'?Math.abs(base):base,q=rational(innerBase*2,2),factors=Array(n).fill(factor(innerBase)),products=Array.from({length:n},(_,i)=>rational(q.num**(i+1),q.den**(i+1))),inner=products[n-1],value=rational(scope==='outside'?-inner.num:inner.num,inner.den),prefix=scope==='outside'?'−':'';
  return {base,n,scope,step,factors,products,value,innerBase,expression:prefix+factor(innerBase)+supers[n],expansion:scope==='outside'?'−['+factors.join(' × ')+']':factors.join(' × '),partial:products[step-1],baseLabel:fmt(q),negativeFactors:innerBase<0?n:0};
 }
 function readNumber(input){const s=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
 const questions=[
  {kind:'choice',skill:'先独立判断右上角的4是什么意思',title:'3⁴应该怎样展开？',context:'右上角的小4是指数。先判断它与普通乘法3×4有什么不同。',options:['3 × 4','3 × 3 × 3 × 3','4 × 4 × 4'],answer:1,hint:'指数表示相同因子的个数。谁在反复作为因子，反复出现几个？',explanation:'选B。底数是3，指数是4，表示4个3相乘，结果81；3×4是12，表示另一种运算。乘方是求相同因子连乘积的运算，结果叫幂。'},
  {kind:'number',skill:'先展开，再处理负号',title:'(−2)³等于多少？',context:'括号把−2整体作为底数。只填最后的数值。',label:'计算结果',unit:'',answer:-8,hint:'写成(−2)×(−2)×(−2)。先算前两个，再与第三个相乘；三个负因子能否全部两两配成正数？',explanation:'(−2)³＝(−2)×(−2)×(−2)＝4×(−2)＝−8。负底数的奇数次幂为负，偶数次幂为正；判断前先确认负号是否属于底数。'},
  {kind:'open',skill:'辨错：说明哪个部分参与了乘方',title:'−3²与(−3)²都等于9吗？',context:'小林说：“都是两个负3相乘，当然一样。”请分别给出结果，并用展开式解释括号改变了什么。',hint:'没有括号的−3²，先算的是3²，再取相反数；有括号时，平方作用于哪个整体？',reference:'不一样。−3²＝−(3×3)＝−9，底数是3，外面的负号表示取相反数；(−3)²＝(−3)×(−3)＝9，底数是−3。括号决定负号是否和3一起参与两次相乘。',checks:['分别得到−9和9，并给出−(3×3)与(−3)×(−3)或等价解释。','明确两个乘方的底数分别是3和−3；不只背“有括号是正、没括号是负”。']},
  {kind:'choice',skill:'检查“乘方一定变大”的误区与零',title:'甲：(1/2)²；乙：0³。哪一组结果正确？',context:'1/2表示二分之一，平方作用于整个分数；两个指数都是正整数。',options:['甲＝1，乙＝0','甲＝1/4，乙＝1','甲＝1/4，乙＝0'],answer:2,hint:'甲是(1/2)×(1/2)，不是(1/2)×2。乙是几个0相乘？',explanation:'选C。(1/2)²＝1/4，比1/2还小，说明乘方不一定让数变大。0³＝0×0×0＝0。这里只讨论正整数指数，不涉及0⁰。'},
  {kind:'open',skill:'换成游戏规则，自己确定底数和指数',title:'复制两轮后，游戏里共有几个探测器？',context:'游戏起初有1个探测器。每轮所有已有探测器都各复制出2个新的，原来的也保留；新产生的探测器从下一轮才开始复制。没有损失，连续进行2轮。请列出乘方算式并解释底数、指数，判断小林的“2²＝4个”哪里错了。',hint:'每个原探测器在一轮结束后对应几个：原来的1个，加新复制的2个。第一轮共有几个，第二轮以谁为起点？',reference:'每轮每个原探测器变为“原有1个＋新增2个”，总数乘3：1→3→9。乘方算式是3²＝9，底数3表示每轮总数变为原来的3倍，指数2表示连续两轮。“2²＝4”只看到新增的2个，漏掉原来的探测器；也不是3×2＝6，因为第二轮的3个都会复制。',checks:['列出3²＝9或先写1×3×3＝9并给出等价乘方；两轮数量为1→3→9。','说明每轮保留原有1个并新增2个，所以倍数是3；指数2代表轮数，指出2²遗漏原有探测器。']}
 ];
 root.PowerLesson={title,questions,bases,rational,fmt,factor,state,readNumber};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.PowerLesson;
})(typeof window!=='undefined'?window:globalThis);
