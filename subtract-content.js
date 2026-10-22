/* Difference is a directed change, not an unsigned distance. */
(function(root){
  'use strict';
  const title='减去负数，为什么反而变大？';
  const presets=[{a:-2,b:-5,label:'减去负数'},{a:-3,b:-2,label:'变大但仍为负'},{a:-4,b:3,label:'减去正数'},{a:2,b:0,label:'减去0'}];
  const questions=[
    {kind:'choice',skill:'先判断，再用数轴验证',title:'−2−(−5)等于多少？',context:'被减数是−2，减数是−5。中间的减号表示减法，括号里的负号属于减数。先独立判断，再打开数轴模型。',options:['−7','3','−3'],answer:1,hint:'先把“−2减去−5”看成求差：−5加上多少会等于−2？数轴上从−5到−2，方向和步数是什么？',explanation:'结果是3。因为−5+3=−2，所以−2−(−5)=3。也可从−2加上−5的相反数+5，走到3。减去一个数，等于加上这个数的相反数。'},
    {kind:'open',skill:'用反例纠正过度概括',title:'减去负数，结果就一定是正数吗？',context:'用−3−(−2)检验这个说法。写出结果，并说明它相对−3怎样变化、为什么。不能只写“负负得正”。',hint:'从−3加上−2的相反数+2，会到哪里？“比原来大”和“已经大于0”是一回事吗？',reference:'不一定。−3−(−2)=−3+2=−1，从−3向右走2个单位到−1。−1比−3大，但仍小于0。减去负数使数变大，不保证结果跨过0。',checks:['算得−1，用这个负数结果反驳“一定是正数”。','说明−3加上+2、向右2到−1或等价推理；把“变大”和“变成正数”分开。']},
    {kind:'number',skill:'换成小数，规则还成立吗',title:'−1.5−(−2)＝？',context:'被减数−1.5，减数−2。只填最后的数值；不用填算式。',answer:.5,hint:'减数−2的相反数是什么？从−1.5加上这个数，再看有没有跨过0。',explanation:'−1.5−(−2)=−1.5+2=0.5。加上2后跨过了0。括号中的负号属于−2，不能把式子错读成−1.5−2。'},
    {kind:'choice',skill:'减去正数，方向一样吗',title:'小宇把−4−(+3)写成−4+3＝−1。他哪里改错了？',context:'这次减数是正数+3。选出正确的纠正，不能把所有减法都理解成向右移动。',options:['没有改错，所有减法都改成加正数','应加上+3的相反数−3，结果为−7','应先把−4改成4，再减3，结果为1'],answer:1,hint:'“加相反数”改变的是减数+3，不是被减数−4。+3的相反数是哪个数？',explanation:'应写−4−(+3)=−4+(−3)=−7。减去正数会变小；减去负数会变大；减去0不变。不要只记“看到减号就向右”。'},
    {kind:'open',skill:'从真实记录中列式',title:'撤销一项负分，新的净分是多少？',context:'比赛净分是各项加减分记录的总和。小队当前净分−3分，其中包含一项−4分处罚。裁判撤销这项处罚，其他记录不变。新的净分是多少？请写出算式并说明理由。',hint:'撤销−4分这项记录，是从当前总和里去掉哪一个数？是再扣4分，还是取消原来的扣分？',reference:'新净分是1分。原来的总分−3已经包含−4分，撤销这项记录应算−3−(−4)=−3+4=1。取消原来的扣分，相当于把4分加回来，不是再扣一次。',checks:['列式−3−(−4)并得到1分，或写出等价的−3+4=1。','说清“去掉已包含的−4分记录”为什么是减负数，不能只写一个答案。']}
  ];
  function fmt(n){if(!Number.isFinite(n))throw new Error('Invalid number');return String(Object.is(n,-0)?0:n).replace('-','−');}
  function term(n){return '('+(n>0?'+':'')+fmt(n)+')';}
  function position(value){if(!Number.isFinite(value)||value< -10||value>10)throw new Error('Outside number line');return 24+(value+10)*15.6;}
  function state(a,b){if(!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a)>5||Math.abs(b)>5||!Number.isInteger(a*2)||!Number.isInteger(b*2))throw new Error('Outside model range');const result=a-b;return {a,b,result,opposite:b===0?0:-b,difference:{start:b,end:a,change:result},calculation:{start:a,end:result,change:b===0?0:-b}};}
  function direction(change){return change>0?'向右':change<0?'向左':'不移动';}
  function readNumber(input){const raw=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)&&Number.isFinite(Number(raw))?Number(raw):null;}
  root.SubtractLesson={title,questions,presets,fmt,term,position,state,direction,readNumber};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SubtractLesson;
})(typeof window!=='undefined'?window:globalThis);
