/* Signed tokens model integer addition; fractions are tested with exact quarter units. */
(function(root){
 'use strict';
 const title='加上一个数，结果一定变大吗？';
 const presets=[{a:-3,b:5,label:'异号：−3＋5'},{a:-4,b:-2,label:'同为负：−4＋(−2)'},{a:3,b:2,label:'同为正：3＋2'},{a:-5,b:5,label:'相反数：−5＋5'},{a:-4,b:0,label:'加上0：−4＋0'}];
 function fmt(n){if(!Number.isFinite(n))throw new Error('Invalid number');return String(Object.is(n,-0)?0:n).replace('-','−');}
 function term(n){return '('+(n>0?'+':'')+fmt(n)+')';}
 function model(a=-3,b=5){
  if(!Number.isInteger(a)||!Number.isInteger(b)||Math.abs(a)>5||Math.abs(b)>5)throw new Error('Outside integer token model');
  const positive=Math.max(a,0)+Math.max(b,0),negative=Math.max(-a,0)+Math.max(-b,0),pairs=Math.min(positive,negative),result=a+b;
  const tokens=Array.from({length:20},(_,i)=>{const sign=i<10?1:-1,j=i%10;return {id:i,sign,x:23+j*28,y:sign===1?48:125,visible:j<(sign===1?positive:negative),paired:j<pairs};});
  return {a,b,positive,negative,pairs,result:result===0?0:result,remaining:Math.abs(result),sign:Math.sign(result)||0,tokens};
 }
 function readNumber(input){
  const raw=String(input).trim().replace(/[０-９．＋－／]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');
  if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw))return Number.isFinite(Number(raw))?(Number(raw)||0):null;
  const f=raw.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
  if(!f)return null;const a=Number(f[1]),b=Number(f[2]);return Number.isSafeInteger(a)&&Number.isSafeInteger(b)&&b!==0&&Number.isFinite(a/b)?(a/b||0):null;
 }
 const questions=[
  {kind:'choice',skill:'先判断：加的是带着符号的数',title:'−3＋(+5)等于多少？',context:'一次记录为−3分，另一次为+5分，把两次记录相加。中间的加号表示做加法；括号里的+号属于正数5。先独立判断，再打开计分片验证。',options:['−8','−2','2'],answer:2,hint:'把每个+1和一个−1配成一对，每对总分为0。3个负片与5个正片配对后，还剩哪一种、几个？',explanation:'选C，结果为2。3个−1与3个+1合计0，还剩2个+1。异号数相加，要比较绝对值，取绝对值较大的数的符号，再用较大绝对值减较小绝对值。'},
  {kind:'number',skill:'换成分数：先统一每份的大小',title:'−3/4＋1/2＝？',context:'可填分数或小数，分数用斜线 / 书写。先把两项都看成若干个1/4，再判断抵消后剩余部分的符号。',answer:-.25,label:'计算结果（分数或小数）',unit:'',hint:'1/2等于几个1/4？负的三个1/4与正的两个1/4配对后，剩下什么？',explanation:'−3/4＋1/2＝−3/4＋2/4＝−1/4＝−0.25。这里每份是1/4，先通分再比较份数；不能把分母相加，也不能只算3−2而丢掉负号。'},
  {kind:'open',skill:'辨错解释：加法能直接套乘法口诀吗',title:'“负负得正，所以−4＋(−2)＝6。”对吗？',context:'这是两个负数做加法。请写出正确结果，并说明它比−4变大还是变小；用计分片或数轴解释，不能只换一句口诀。',hint:'−4表示4个−1，−2表示2个−1。合起来有正片可抵消吗？如果从−4再向左走2，会到哪里？',reference:'不对，−4＋(−2)＝−6。4个负片加上2个负片，共6个负片，结果为−6；也可从−4向左移动2到−6。−6比−4小，加负数会变小。“负负得正”适用于两个负数相乘等特定运算，不能直接套在加法上。',checks:['得到−6，说明同为负数时绝对值相加、符号仍为负。','用6个负片或向左2的数轴过程解释，并指出结果比−4小。','没有把加号当成一定变大，也没有用乘法口诀替代加法推理。']},
  {kind:'choice',skill:'边界判断：全抵消以后，0归哪边',title:'−2.5＋(+2.5)的和是什么？',context:'两个加数互为相反数。判断结果时，也要分清0与正数、负数的关系。',options:['0；0既不是正数，也不是负数','5；两个绝对值相加就是结果','−5；第一个数是负数，就保留负号'],answer:0,hint:'正的2.5和负的2.5能否完全抵消？全部抵消后，还剩正的或负的部分吗？',explanation:'选A，和为0。互为相反数的两个数相加得0；0既不是正数，也不是负数。另一个边界是加上0：a＋0＝a，原数不变。'},
  {kind:'open',skill:'换个情境：位置变化与走过的路程',title:'机器人的最终位置和总路程，是同一个数吗？',context:'机器人沿同一直线行驶，规定向东为正、向西为负。它从出发点先向西4m，再向东7m，最后向西3m。请列式求最终相对出发点的位置，并判断总路程是不是0，说明理由。',hint:'位置变化把三个带符号的数相加；路程累计每段实际走过的长度。方向相反能抵消的是哪一种量？',reference:'位置变化为(−4)＋(+7)＋(−3)＝0m，所以最终回到出发点。可以先算−4＋7＝3，再算3＋(−3)＝0。总路程是4＋7＋3＝14m，不是0；有向位置变化能抵消，但实际走过的路程不会因此消失。',checks:['按向东为正列出−4、+7、−3的加法，得到0m并解释为回到出发点。','总路程算得14m，说明它累计各段长度而不是带方向相抵。','清楚区分最终位置与总路程，没有把和为0解释成没有运动。']}
 ];
 root.AdditionLesson={title,presets,fmt,term,model,readNumber,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.AdditionLesson;
})(typeof window!=='undefined'?window:globalThis);
