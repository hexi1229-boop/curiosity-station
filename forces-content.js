/* Forces must be grouped by their receiver before discussing one body's balance. */
(function(root){
  'use strict';
  const title='两个力一样大，就会互相抵消吗？';
  function state(mode,left,right,target='A'){
    if(!['same','pair'].includes(mode)||![left,right].every(n=>Number.isInteger(n)&&n>=2&&n<=10)||!['A','B'].includes(target))throw new Error('Outside force model');
    const forces=mode==='same'?[{from:'左侧绳子',to:'箱子',value:-left},{from:'右侧绳子',to:'箱子',value:right}]:[{from:'B车',to:'A车',value:-left},{from:'A车',to:'B车',value:left}];
    const receiver=mode==='same'?'箱子':target+'车',selected=forces.filter(f=>f.to===receiver),net=selected.reduce((n,f)=>n+f.value,0);
    return {mode,left,right:mode==='pair'?left:right,target,receiver,forces,selected,net,balanced:net===0};
  }
  function readNumber(input){const s=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
  const questions=[
    {kind:'choice',skill:'先判断：两个力分别作用于谁',title:'A车推B车，B车也推A车。这两个力会在A车上抵消吗？',context:'只比较同一瞬间A对B的推力和B对A的推力，均为8N，方向相反、在同一直线上。N（牛顿）是力的单位。',options:['会：8N和8N相反，A车受到的合力就是0','不会：一个作用于A，一个作用于B','不会：主动推的A施加的力更大'],answer:1,hint:'把“A对B”读成“A施力，B受力”。再看“B对A”。两个受力者是同一个吗？',explanation:'选B。这是一对相互作用力，大小相等、方向相反，但作用于两个物体。研究A车时，只能把作用于A的力加在一起，不能把A施加给B的力算进来。'},
    {kind:'number',skill:'先锁定一个物体，再合成同线二力',title:'箱子只受这两个水平力，水平合力大小是多少牛顿？',context:'同一个箱子受到向右6N、向左4N的水平拉力，在同一直线上；竖直方向的力平衡。只填水平合力的大小。',label:'水平合力大小',unit:'N',answer:2,hint:'两个水平力都作用于箱子，但方向相反。先抵去同样多的部分，剩下多少？方向是哪边？',explanation:'水平合力大小是2N，方向向右：6−4＝2。两个力在同一直线上、方向相反、作用于同一物体，但大小不等，所以不能平衡。只知道合力方向，不能直接断定箱子此刻向哪边运动。'},
    {kind:'open',skill:'辨错：两个4N为什么不是同一种关系',title:'书静止在水平桌面上，哪两个力使书平衡？',context:'书只受竖直向下4N的重力和竖直向上4N的桌面支持力。另有书对桌面向下4N的压力。小林说：“支持力与压力平衡，所以书不动。”请纠正他。',hint:'先圈出受力者是“书”的两个力。“书对桌的压力”的受力者是谁？它与支持力是什么关系？',reference:'使书平衡的是地球对书的重力与桌面对书的支持力：都作用于书，大小相等、方向相反且在同一直线上。书对桌的压力作用于桌面，与桌面对书的支持力是一对相互作用力，不能当作书受到的两个力。',checks:['选出书的重力和桌面对书的支持力，说明同物、等大、反向、共线。','指出书对桌的压力受力者是桌面；压力和支持力是相互作用力。']},
    {kind:'choice',skill:'检查“平衡就静止”的误区',title:'箱子原来向右运动，受力一直平衡，接下来怎样？',context:'相对地面，箱子原来以2m/s向右做直线运动。此后向左、向右的水平拉力各5N、在同一直线上，其他力也平衡。',options:['立刻停止，因为合力为0','保持2m/s向右做匀速直线运动','向右越来越快，因为它本来就在向右'],answer:1,hint:'合力为0表示运动状态不改变。要看“原来”是静止，还是已经在运动；平衡不是刹车。',explanation:'选B。受力平衡时，原来静止的保持静止，原来运动的保持原来的速度和方向，做匀速直线运动。保持运动不需要合力来维持；改变运动状态才需要不平衡的力。'},
    {kind:'open',skill:'换成无人机，自己选对象与配对',title:'无人机悬停时，向上、向下的力该怎样配对？',context:'无人机相对地面静止悬停，只考虑重力和空气对它的竖直作用力。重力为12N；旋翼把空气向下推，空气也把无人机向上推。写出空气对无人机的力大小，并分别说出一对平衡力和一对相互作用力。',hint:'研究无人机，留下“受力者是无人机”的力。另找相互作用力时，把施力者和受力者交换。',reference:'空气对无人机向上的作用力为12N。它与地球对无人机向下12N的重力是一对平衡力，都作用于无人机、等大反向共线。无人机对空气向下的力和空气对无人机向上的力是一对相互作用力，分别作用于空气和无人机，不能在无人机上互相抵消。',checks:['利用静止悬停与题目只考虑两力，得向上12N。','平衡力：空气对无人机的力与无人机的重力；两者受力者都是无人机。','相互作用力：无人机对空气、空气对无人机；受力者不同。']}
  ];
  root.ForcesLesson={title,questions,state,readNumber};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ForcesLesson;
})(typeof window!=='undefined'?window:globalThis);
