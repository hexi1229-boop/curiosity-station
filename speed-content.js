/* Average speed uses path length over the specified positive time interval. */
(function(root){
  'use strict';
  const title='跑得远，就一定更快吗？';
  const questions=[
    {kind:'choice',skill:'先给自己的判断',title:'哪辆车这段路的平均速度更大？',context:'甲车行驶300米，用时60秒；乙车行驶240米，用时40秒。比较各自这段路的平均速度。',options:['甲车，因为它行驶的路程更长','乙车，它平均每秒行驶的路程更多','一样快，因为两辆车都到达了终点'],answer:1,hint:'只比路程公平吗？试着把两段记录都换成“平均每秒走多少米”。',explanation:'甲车平均速度为300÷60＝5米/秒，乙车为240÷40＝6米/秒，所以乙更快。比较这段路的快慢，要把路程和对应的用时一起看。'},
    {kind:'open',skill:'说明比较的依据',title:'甲车走得更远，为什么仍可能比乙车慢？',context:'甲车300米用60秒，乙车240米用40秒。用一句话或两个算式解释比较方法。',hint:'把两辆车的路程都按1秒来比较；也可以说清“时间相同”为什么重要。',reference:'甲虽然走了300米，但也用了更久的60秒。换成平均每秒的路程，甲是5米，乙是6米，所以乙的平均速度更大。只知道总路程，缺少对应时间，不能判断平均速度大小。',checks:['同时考虑路程和对应的时间。','说明了公平的比较依据，例如每秒路程5米与6米，而不只说“乙用时短”。']},
    {kind:'choice',skill:'检查一个熟悉的算法',title:'小明算平均速度：(2＋6)÷2＝4米/秒。对吗？',context:'小车先以2米/秒行驶10秒，再以6米/秒行驶30秒，中途没有停留。小明把两个速度直接相加再除以2。',options:['对，两个速度取平均，就是4米/秒','不对，两个速度应该直接相加，得到8米/秒','不对，总路程200米，总时间40秒，应为5米/秒'],answer:2,hint:'两段持续时间不一样。先算各走了多少米，再合起来看全程。',explanation:'前段2×10＝20米，后段6×30＝180米。全程平均速度＝(20＋180)÷(10＋30)＝5米/秒。只有两段时间相等时，才能直接取这两个速度的算术平均。'},
    {kind:'number',skill:'换一组单位',title:'配送车这段路的平均速度是多少米/秒？',context:'一辆配送车行驶1.2千米，用时4分钟。用米/秒表示这段路的平均速度。',label:'平均速度（填数字）',unit:'米/秒',answer:5,hint:'先把千米换成米，把分钟换成秒，再计算同一段路的路程÷时间。',explanation:'1.2千米＝1200米，4分钟＝240秒。平均速度＝1200÷240＝5米/秒。单位也要跟着路程和时间一起换。'},
    {kind:'open',skill:'给新行程写准确说明',title:'用一条完整说明，写清全程平均速度及它的含义。',context:'一辆观测小车从营地出发：前60米用10秒；原地停留10秒；后60米用20秒到达观测点。从出发到到达，给出平均速度，并说明是否每一秒都以这个速度行驶。',hint:'明确“从出发到到达”的时间范围。停着的时候，时间还在走吗？',reference:'全程路程60＋60＝120米，用时10＋10＋20＝40秒，所以平均速度为120÷40＝3米/秒。它描述整段行程的平均快慢，并不表示每一秒都走3米；例如中途停留时速度为0。',checks:['总时间计入途中10秒停留，算得120÷40＝3米/秒。','说明平均速度不代表每一刻的速度，可用停留时为0作例子。']}
  ];
  function averageSpeed(segments){
    if(!Array.isArray(segments)||!segments.length)throw new Error('Segments required');
    const total=segments.reduce((sum,s)=>{if(!Number.isFinite(s.distance)||s.distance<0||!Number.isFinite(s.time)||s.time<=0)throw new Error('Invalid distance or time');return {distance:sum.distance+s.distance,time:sum.time+s.time};},{distance:0,time:0});
    return total.distance/total.time;
  }
  function raceState(bTime,elapsed){
    if(!Number.isFinite(bTime)||bTime<24||bTime>80||!Number.isFinite(elapsed)||elapsed<0||elapsed>20)throw new Error('Outside simulation range');
    const aSpeed=300/60,bSpeed=240/bTime;
    return {aSpeed,bSpeed,aDistance:aSpeed*elapsed,bDistance:bSpeed*elapsed,elapsed,bTime};
  }
  function numberValue(value){const s=String(value).normalize('NFKC').trim().replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
  root.SpeedLesson={title,questions,averageSpeed,raceState,numberValue};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SpeedLesson;
})(typeof window!=='undefined'?window:globalThis);
