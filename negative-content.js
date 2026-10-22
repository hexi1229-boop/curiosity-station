/* Signed position and distance to zero are different quantities. */
(function(root){
  'use strict';
  const title='零下8℃和零下3℃，哪里更暖？';
  const questions=[
    {kind:'choice',skill:'先用自己的办法判断',title:'甲地 −8℃，乙地 −3℃：哪一地的温度更高？',context:'同一时刻，甲地温度是−8℃，乙地温度是−3℃。先比较这两个温度，再打开数轴查看。',options:['甲地，因为8比3大','乙地，−3℃比−8℃高','一样高，因为两个温度都是负数'],answer:1,hint:'先确定0℃。从0℃往下走3格与往下走8格，哪个温度更低？',explanation:'乙地温度更高。以向右为正方向的数轴上，−8在−3左边，所以−8＜−3。−8离0更远，表示低于0更多，并不表示温度更高。'},
    {kind:'open',skill:'换两个数，把依据说清楚',title:'“7比2大，所以−7比−2大。”你怎样纠正？',context:'在向右为正方向、单位长度相同的数轴上，比较−7与−2。不能只写正确大小关系，要说明为什么。',hint:'从0分别向左走7格和2格，再看谁在谁的左边。比较的是位置，还是离0的距离？',reference:'这个说法把距离和数的大小混在了一起。−7从0向左7格，−2从0向左2格；−7在−2左边，所以−7＜−2。两个数都是负数时，离0越远，数反而越小。',checks:['正确写出或说出−7＜−2。','用数轴左右位置或相对0的方向解释，不只比较7与2这两个距离。']},
    {kind:'choice',skill:'距离一样，位置也一样吗',title:'“−4和4到0都相隔4个单位，所以−4＝4。”这句话对吗？',context:'两点分别表示−4和4，原点为0。判断它们的数值与到原点的距离是否是同一个概念。',options:['对，只要离0同样远，就是同一个数','不对，它们在0两侧，数不相等，但离0的距离相等','不对，因为−4到0的距离是−4个单位'],answer:1,hint:'距离只表示有多远，不带左右方向。原点两侧同样远的两个非零点，位置相同吗？',explanation:'−4与4不相等，但到0的距离都是4。它们互为相反数；|−4|＝|4|＝4。绝对值表示到原点的距离，不能为负。0的绝对值是0，相反数也是0。'},
    {kind:'number',skill:'把距离写成一个数',title:'点P表示−6，它离原点几个单位？|−6|＝？',context:'数轴向右为正，原点是0，每一小格表示1个单位。点P位于−6。填写它到原点的距离，也就是−6的绝对值。',answer:6,hint:'−6说明点的位置；绝对值问的是到0有多远。距离会是负的吗？',explanation:'|−6|＝6。负号说明P在0左侧，到0的距离是6个单位。不要把点的位置−6直接当成距离。'},
    {kind:'open',skill:'换到海面下，还能分清吗',title:'谁的位置更高？谁离海面更远？',context:'以同一海面为0，向上记为正。潜水器甲的位置记作−2.5米，乙记作−6米。分别判断谁的位置更高、谁离海面更远，并写出依据。',hint:'“更高”比较带正负号的位置；“更远”比较到海面这个0的距离。两个问题不一定选同一个。',reference:'甲的位置更高，因为−2.5＞−6，甲更靠近海面。乙离海面更远，因为甲到海面的距离是2.5米，乙是6米，6＞2.5。“位置更高”和“离0更远”比较的不是同一个量。',checks:['甲位置更高，依据−2.5＞−6或同一基准下甲更靠近海面。','乙离海面更远，能把两个距离分别说成2.5米和6米，距离不带负号。']}
  ];
  function position(value){if(!Number.isFinite(value)||value< -10||value>10)throw new Error('Position outside displayed axis');return 24+(value+10)*15.6;}
  function temperature(value){if(!Number.isFinite(value)||value< -10||value>10)throw new Error('Temperature outside displayed scale');return {value,y:150-value*10,height:110+value*10,distance:Math.abs(value)};}
  function compare(a,b){if(!Number.isFinite(a)||!Number.isFinite(b))throw new Error('Invalid number');return a<b?'＜':a>b?'＞':'＝';}
  function readNumber(input){const raw=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)&&Number.isFinite(Number(raw))?Number(raw):null;}
  root.NegativeLesson={title,questions,position,temperature,compare,readNumber};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.NegativeLesson;
})(typeof window!=='undefined'?window:globalThis);
