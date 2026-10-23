(function(root){
  'use strict';
  const title='降落伞越大，就一定越好吗？';
  const tasks=[
    {title:'先判断：换成最大伞就能完成任务吗？',context:'地球模拟任务：2千克总质量，已稳定下落的最后30米；恒定横风1米/秒。落速不超过2.5米/秒，水平偏移不超过15米。'},
    {title:'动手验证：提交一个有证据的投送方案',context:'只改伞面积，保持其他条件；无风仅作对照。用实际试放结果说明能否同时满足落速与落点要求。'},
    {title:'独立迁移：月球订单能照搬地球方案吗？',context:'月球重力约为地球的1/6，气体极其稀薄。供应商建议直接把地球降落伞放大。决定是否批准，并说明依据。'}
  ];
  // Teaching assumptions, not measured parachute specifications: m=2 kg,
  // g=10 m/s², rho=1 kg/m³, Cd=2. Already at terminal vertical speed;
  // horizontal speed equals a constant wind, without opening/transients.
  function model(area,wind=1){
    if(!Number.isInteger(area)||area<1||area>6||![0,1].includes(wind))throw Error('Invalid model input');
    const speed=Math.sqrt(20/area),time=30/speed,drift=wind*time;
    return {area,wind,speed,time,drift,speedOK:speed<=2.5,driftOK:drift<=15,success:speed<=2.5&&drift<=15};
  }
  function position(area,wind,seconds){
    if(!Number.isFinite(seconds)||seconds<0||seconds>20)throw Error('Invalid clock');
    const result=model(area,wind),time=Math.min(seconds,result.time);
    return {x:wind*time,height:seconds>=result.time?0:Math.max(0,30-result.speed*time),landed:seconds>=result.time};
  }
  root.ParachuteLesson={title,tasks,model,position};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ParachuteLesson;
})(typeof window!=='undefined'?window:globalThis);
