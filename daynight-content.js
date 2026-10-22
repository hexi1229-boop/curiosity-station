/* Original tasks. Equatorial points in a simplified, fixed-light polar model. */
(function(root){
 'use strict';
 const title='太阳没关灯，为什么天黑了？';
 const tokens=['午夜','日出附近','日落附近'];
 function validOrder(order){return Array.isArray(order)&&order.length<=3&&new Set(order).size===order.length&&order.every(i=>Number.isInteger(i)&&i>=0&&i<3);}
 function sequence(order){return '正午 → '+order.map(i=>tokens[i]).join(' → ')+(order.length===3?' → 下一个正午':'');}
 function checkOrder(order){return !validOrder(order)||order.length!==3?null:order.every((id,i)=>id===[2,0,1][i]);}
 function state(elapsed=0){
  if(typeof elapsed!=='number'||!Number.isFinite(elapsed)||elapsed<0||elapsed>24)throw new Error('Outside day-night model');
  const angle=elapsed*Math.PI/12,x=200-92*Math.cos(angle),y=160+92*Math.sin(angle);
  const at=t=>Math.abs(elapsed-t)<1e-8;
  const event=at(0)?'正午':at(6)?'日落附近':at(12)?'午夜':at(18)?'日出附近':at(24)?'下一个正午':'';
  const zone=at(6)||at(18)?'昼夜交界':elapsed<6||elapsed>18?'昼半球':'夜半球';
  return {elapsed,x,y,rotation:-elapsed*15,event,zone};
 }
 const questions=[
  {kind:'choice',skill:'先判断：黑夜从哪里来',title:'太阳一直发光，A点为什么仍会经历白天与黑夜？',context:'A固定在地球赤道上。太阳持续发光，地球是一个不透明的球体。先想每天昼夜更替的主要原因。',options:['晚上太阳停止发光，早上再亮起来','地球自转，带着A点先后进入被照亮和背光的区域','地球每天绕太阳公转一圈，所以每天有昼夜更替'],answer:1,hint:'是太阳关了灯，还是同一个地点朝向太阳的情况变了？自转与绕太阳公转，是同一种运动吗？',explanation:'选B。太阳持续发光，地球不透明，迎光的半球是白昼，背光的半球是黑夜。地球绕地轴自转，A点随之先后进入昼半球、夜半球，产生昼夜更替。自转与绕太阳公转不同；地球公转一周约一年，不是一天。'},
  {kind:'order',skill:'动手排序：跟着同一个地点走',title:'从正午出发，A点接下来依次经历什么？',context:'沿用左侧受光的模型：从北极上空看，地球逆时针转。A位于赤道，起点正对太阳。把3张卡按顺序放好，最后回到下一个正午。',source:'可选卡片：午夜、日出附近、日落附近；固定起点为正午，终点为下一个正午。',hint:'从正午开始，A先离开明亮的一侧，还是先进入明亮的一侧？跟着A走，不要把“早上”当作任意起点。',explanation:'正午 → 日落附近 → 午夜 → 日出附近 → 下一个正午。先由昼入夜，再由夜入昼。这个简化模型的一轮约24小时；滑杆显示从正午起经过的时间，不是北京时间。'},
  {kind:'open',skill:'辨错：有昼夜，不等于正在更替',title:'“暂停后球不转了，所以昼夜现象也消失了。”对吗？',context:'只讨论屏幕上的模型：太阳光方向固定，把球暂停，A点也不再移动。请区分“球上有没有昼夜”和“A点还会不会在昼夜之间转换”。',hint:'暂停时，迎光面和背光面还在吗？A点是否还在跨过两边的交界？不要把两个问题混在一起。',reference:'不对。球不透明，光照方向又固定，所以迎光的一半仍是白昼，背光的一半仍是黑夜，昼夜现象没有消失。但是暂停后A点不再跨过昼夜交界，这个模型中的A点不再经历昼夜更替。这里同时固定了模型与光照方向；不能据此断言真实地球若停止自转，就永远一面白天、一面黑夜，因为真实地球还有绕太阳的公转。',checks:['说明暂停后仍有迎光面和背光面，昼夜现象仍存在。','指出固定光照、球静止时，A点不再转换区域；没有把模型结论无限推广到真实地球。']},
  {kind:'choice',skill:'换视角：图上的顺逆时针会变',title:'两张图的箭头方向相反，地球真的反转了吗？',context:'甲从北极上空看，画成逆时针；乙从南极上空看，画成顺时针。两图表示同一时刻、同一个地球的自转。',options:['地球在北半球和南半球分别朝相反方向转','地球从任何方向看都必须是逆时针，因此乙一定错','没有反转：地球仍自西向东转，观察的位置变了'],answer:2,hint:'站在同一个转动物体的两端看，顺、逆时针会一样吗？先说自转的地理方向，再说从哪一极看。',explanation:'选C。地球自转的方向是自西向东。从北极上空看是逆时针，从南极上空看是顺时针。改变的是观察方向，不是地球突然反转，也不是南、北半球各转各的。不能脱离观察位置，只背“逆时针”。'},
  {kind:'open',skill:'新图迁移：别把页面上方当成固定答案',title:'太阳换到右边，P和Q谁即将进入黑夜？',context:'仍从北极上空看，地球逆时针转；太阳光这次从右边照来。赤道上的P在图的上方交界处，Q在下方交界处。沿箭头再转一点：P、Q分别进入昼半球还是夜半球？分别对应日出还是日落附近？说明理由。',hint:'先找光来自哪边，再沿箭头追踪P和Q。判断的是由亮到暗还是由暗到亮，不是点在纸面上方还是下方。',reference:'P从上方交界继续向左进入夜半球，是日落附近；Q从下方交界继续向右进入昼半球，是日出附近。判断依据是太阳在右边、从北极上空看逆时针转。日出是由夜入昼，日落是由昼入夜，不能死记“上方就是日出”。',checks:['P进入夜半球、日落附近；Q进入昼半球、日出附近，两点都说清。','理由同时用到光照方向和自转方向，按明暗转换判断，没有靠页面位置猜。']}
 ];
 root.DaynightLesson={title,tokens,validOrder,sequence,checkOrder,state,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.DaynightLesson;
})(typeof window!=='undefined'?window:globalThis);
