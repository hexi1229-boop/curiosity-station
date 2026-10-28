/* Geometry proof G1: copying an angle and building parallel-line proofs without circular reasoning. */
(function(root){
  'use strict';
  const id='parallel';
  const title='不拿量角器，怎么把一个角搬过去？';
  const tasks=[
    {title:'圆规没有刻度，怎样复制一个角？',context:'先留下猜想，再按“相同半径＋相同弦长”动手作图，并说明复制为什么可靠。'},
    {title:'已知两直线平行，怎样不循环地证明同位角相等？',context:'用复制角构造新直线，再调用平行判定与平行线唯一性完成证明。'},
    {title:'图转过方向后，应该用判定还是性质？',context:'先判断推理方向，再用同位角与对顶角证明内错角相等，并审计缺少条件的说法。'}
  ];
  const copyChoices=[
    '把两条射线画成一样长，开口看起来一样就行',
    '用相同半径截两边，再把两个交点间的弦长搬过去',
    '圆规可以直接读出角的度数，再照着画'
  ];
  const copyChecks=[
    {id:'radius',text:'源角和新角使用相同半径'},
    {id:'chord',text:'把源角两交点间的弦长原样搬过去'},
    {id:'ray',text:'两条射线在纸上必须画得一样长'}
  ];
  const copyAnswer=['radius','chord'];
  const directionOptions=[
    {id:'criterion',text:'角相等 → 线平行：使用平行判定'},
    {id:'property',text:'线平行 → 角相等：目标是平行线性质'},
    {id:'measure',text:'先量出两个角，再把读数当证明'}
  ];
  const proofCards=[
    {id:'copy',text:'在同位角对应的一侧作射线 BN，使复制角等于源角；把 BN 所在直线记作 n'},
    {id:'criterion',text:'复制角与源角是相等的同位角，所以 n ∥ l（使用判定）'},
    {id:'unique',text:'m 与 n 都过 B 且都平行于 l；由唯一性，n 与 m 重合'},
    {id:'conclude',text:'复制角就是原来由 m 形成的目标角，所以两同位角相等'},
    {id:'circle',text:'因为 l ∥ m，所以同位角相等，证明结束'},
    {id:'looks',text:'图上 m 与 n 看起来重合，所以它们一定重合'}
  ];
  const proofAnswer=['copy','criterion','unique','conclude'];
  const transferDirections=[
    {id:'criterion',text:'已知角相等，目标是证明 p ∥ q：用判定'},
    {id:'property',text:'已知 p ∥ q，目标是证明角相等：用性质'},
    {id:'both',text:'判定和性质方向相反，可以随便挑一个'}
  ];
  const transferCards=[
    {id:'corresponding',text:'因为 p ∥ q，所以 ∠1＝∠3（同位角相等）'},
    {id:'vertical',text:'因为 ∠3 与 ∠2 是对顶角，所以 ∠3＝∠2'},
    {id:'conclude',text:'由等量代换，得到 ∠1＝∠2'},
    {id:'position',text:'∠1 与 ∠2 是内错角，所以它们自然相等'},
    {id:'reverse',text:'因为 ∠1＝∠2，所以 p ∥ q'}
  ];
  const transferAnswer=['corresponding','vertical','conclude'];
  const auditOptions=[
    '还缺“两条直线平行”这个条件',
    '还缺“两个角都小于90°”这个条件',
    '没有缺条件；只要叫内错角就一定相等'
  ];
  const sources=[
    {title:'教育部：义务教育数学课程标准（2022年版）',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf'},
    {title:'人教社：新版七年级上册数学资源',url:'https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/'},
    {title:'人教社：新版七年级下册数学资源',url:'https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7x/'}
  ];
  function finite(value){return typeof value==='number'&&Number.isFinite(value);}
  function chord(radius,degrees){
    if(!finite(radius)||radius<=0||!finite(degrees)||degrees<=0||degrees>=180)throw new RangeError('Invalid radius or angle');
    return 2*radius*Math.sin(degrees*Math.PI/360);
  }
  function circleIntersections(centerA,radiusA,centerB,radiusB){
    const values=[centerA?.x,centerA?.y,radiusA,centerB?.x,centerB?.y,radiusB];
    if(!values.every(finite)||radiusA<=0||radiusB<=0)throw new RangeError('Invalid circles');
    const dx=centerB.x-centerA.x,dy=centerB.y-centerA.y,distance=Math.hypot(dx,dy);
    if(distance===0||distance>radiusA+radiusB||distance<Math.abs(radiusA-radiusB))throw new RangeError('Circles do not intersect twice');
    const along=(radiusA*radiusA-radiusB*radiusB+distance*distance)/(2*distance);
    const heightSquared=radiusA*radiusA-along*along;
    if(heightSquared<=1e-10)throw new RangeError('Circles do not intersect twice');
    const height=Math.sqrt(heightSquared);
    const middleX=centerA.x+along*dx/distance,middleY=centerA.y+along*dy/distance;
    return [
      {x:middleX+height*dy/distance,y:middleY-height*dx/distance},
      {x:middleX-height*dy/distance,y:middleY+height*dx/distance}
    ];
  }
  function sameSet(values,answer){
    if(!Array.isArray(values)||!Array.isArray(answer))return false;
    const left=[...values].sort(),right=[...answer].sort();
    return left.length===right.length&&left.every((value,index)=>value===right[index]);
  }
  function sameOrder(values,answer){
    return Array.isArray(values)&&Array.isArray(answer)&&values.length===answer.length&&values.every((value,index)=>value===answer[index]);
  }
  function validTransferOrder(values){
    return Array.isArray(values)&&values.length===3&&sameSet(values.slice(0,2),transferAnswer.slice(0,2))&&values[2]===transferAnswer[2];
  }
  function point(cx,cy,length,degrees){
    if(![cx,cy,length,degrees].every(finite)||length<0)throw new RangeError('Invalid point');
    const radians=degrees*Math.PI/180;
    return {x:cx+length*Math.cos(radians),y:cy-length*Math.sin(radians)};
  }
  function textPresent(value){return typeof value==='string'&&value.trim().length>0;}
  const api={id,title,tasks,copyChoices,copyChecks,copyAnswer,directionOptions,proofCards,proofAnswer,transferDirections,transferCards,transferAnswer,auditOptions,sources,chord,circleIntersections,sameSet,sameOrder,validTransferOrder,point,textPresent};
  root.ParallelLesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
