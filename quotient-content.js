/* Division asks for a missing factor. Water model and signed-number model stay distinct. */
(function(root){
 'use strict';
 const title='分装小站：除法到底在找什么？';
 const sizes=[.5,1,1.5,2,3,6],dividends=[-6,0,6],divisors=[3,.5,-3,-.5,0];
 function fmt(n){return String(Object.is(n,-0)?0:n).replace('-','−');}
 function term(n){return n<0?'('+fmt(n)+')':fmt(n);}
 function water(sizeIndex=0,packed=0){
  if(!Number.isInteger(sizeIndex)||sizeIndex<0||sizeIndex>=sizes.length)throw new Error('Invalid portion size');
  const size=sizes[sizeIndex],count=6/size;
  if(!Number.isInteger(packed)||packed<0||packed>count)throw new Error('Invalid packed count');
  return {sizeIndex,size,count,packed,filled:size*packed,remaining:6-size*packed};
 }
 function division(a,b){
  if(!dividends.includes(a)||!divisors.includes(b))throw new Error('Outside division model');
  if(b===0)return {a,b,defined:false,reason:a===0?'not-unique':'no-solution',result:null,reciprocal:null};
  return {a,b,defined:true,reason:'unique',result:a/b||0,reciprocal:1/b};
 }
 function readNumber(input){
  const raw=String(input).trim().replace(/[０-９．＋－／]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');
  const parts=raw.split('/').map(s=>s.trim()),number=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
  if(parts.length>2||parts.some(s=>!number.test(s)||!Number.isFinite(Number(s))))return null;
  if(parts.length===2&&Number(parts[1])===0)return null;
  const value=Number(parts[0])/(parts.length===2?Number(parts[1]):1);return Number.isFinite(value)?value||0:null;
 }
 const questions=[
  {kind:'choice',skill:'先判断：除法在问有几个“每份”',title:'6升水，每份0.5升，恰好能装几份？',context:'补给站共有6升水，每份都装0.5升，没有洒漏，也不剩水。这里问份数，不是求6升的一半。',options:['3份','12份','6份'],answer:1,hint:'1升里能装几份0.5升？也可以反过来：0.5升×多少份＝6升？',explanation:'12份。6÷0.5＝12，因为0.5×12＝6。除法在找“每份的量×几份＝总量”中的份数。份数变多，水没有变多；求6的一半才是6×0.5＝3。'},
  {kind:'number',skill:'换成负分数：用乘法验回去',title:'（−3/4）÷（−1/2）＝？',context:'这里的3/4和1/2都是分数。请给出商，可以填分数或小数，再用“除数×商”在心里验一下。',label:'商（例如可以写分数或小数）',unit:'',answer:1.5,hint:'先找−1/2的倒数，保留负号。除以一个非零数等于乘它的倒数；变的是除数，不是被除数。',explanation:'3/2，也就是1.5。−1/2的倒数是−2，所以（−3/4）÷（−1/2）＝（−3/4）×（−2）＝3/2。验算：（−1/2）×（3/2）＝−3/4。两个非零同号数相除，商为正。'},
  {kind:'open',skill:'辨错：0在不同位置，结果不同',title:'“只要算式里有0，除法的结果就是0。”对吗？',context:'请分别判断：0÷（−5）、5÷0、0÷0。用“除数×商＝被除数”说明，不能只写一条口诀。',hint:'想象商是一个待找的数：−5×？＝0，0×？＝5，0×？＝0。每一个式子能不能确定唯一的数？',reference:'不对。0÷（−5）＝0，因为（−5）×0＝0，且只有商为0才行。5÷0没有意义，因为0乘任何数都不能得到5。0÷0也没有意义：0乘任何数都得0，不能确定唯一的商；不能随便把商定为0。普通有理数除法中，除数不能为0。',checks:['正确区分：0除以非零数得0；5÷0和0÷0都没有意义。','分别解释5÷0找不到满足条件的商，而0÷0不能确定唯一商，没有把它们说成无穷大。']},
  {kind:'choice',skill:'找反例：一条规律有没有漏条件',title:'“除以小于1的正数，商一定变大。”这句话总对吗？',context:'小林看过6÷0.5＝12，就把规律推广到所有被除数。请选择能检验他这句话的一项。这里比较数的大小，不是比较绝对值。',options:['总对，只要除数是正数且小于1，就不必看被除数','不总对：−6÷0.5＝−12，而−12比−6小','不总对，因为−6÷0.5＝−3'],answer:1,hint:'“变大”指在数轴上更靠右。把被除数换成负数后，结果更靠右还是更靠左？',explanation:'选B。−6÷0.5＝−12，−12比−6小，足以否定“商一定变大”。只有把被除数限定为正数，除以0与1之间的正数，商才比被除数大；被除数为0时结果不变。不能把正水量模型的结论直接套到所有有理数。'},
  {kind:'open',skill:'独立迁移：方向、时间和单位一起检查',title:'潜水器从0米到−9米，要几分钟？',context:'以出发位置为0米，向上为正。潜水器匀速向下，每分钟位置变化−1.5米，目标是−9米。列除法算式求时间，并用乘法验算；如果改成每分钟位置变化为0，还能从0米到达−9米吗？',hint:'每分钟的位置变化×所用分钟数＝总位置变化。时间应当是正数；改成0后，0乘任何时间能得到−9吗？',reference:'（−9米）÷（−1.5米/分钟）＝6分钟。验算：（−1.5米/分钟）×6分钟＝−9米。两个负号都表示向下的位置变化，算出的时间是正的6分钟，不是−6分钟。若每分钟变化为0，位置始终停在0米，不能到达−9米；不能把−9÷0算成0分钟或某个有限时间。',checks:['列出（−9）÷（−1.5）＝6，说明是6分钟。','用（−1.5）×6＝−9验算，正确解释向下的负号与正的时间。','速率改为0时说明无法到达目标，没有给出除以0的数值结果。']}
 ];
 root.QuotientLesson={title,sizes,dividends,divisors,fmt,term,water,division,readNumber,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.QuotientLesson;
})(typeof window!=='undefined'?window:globalThis);
