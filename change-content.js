/* Particle diagrams compare endpoints; they are not a reaction mechanism. */
(function(root){
  'use strict';
  const title='冒泡了，就一定发生化学变化吗？';
  const questions=[
    {kind:'choice',skill:'先判断证据够不够',title:'只看到杯中冒泡，能断定发生了化学变化吗？',context:'只知道杯中出现气泡，还不知道逸出的气体是什么，也不知道变化前后的物质。',options:['能，出现气泡就说明产生了新物质','不能，还要知道变化前后有没有新物质产生','不能，冒泡一定只是水在沸腾'],answer:1,hint:'“气泡”说明有气体，但能告诉你气体一定是新产生的物质吗？',explanation:'仅凭冒泡不能断定。水沸腾时逸出水蒸气，仍然是水；水在适当条件下发生电解，生成氢气和氧气。都能看到气泡，关键却是有没有新物质产生。'},
    {kind:'open',skill:'解释相似现象背后的区别',title:'两杯都冒泡，为什么一种是物理变化，另一种是化学变化？',context:'资料A：水沸腾，逸出的气体是水蒸气，仍是水。资料B：水在适当条件下电解，生成氢气和氧气。用变化前后的物质来解释。',hint:'分别补完整：“变化前是……，变化后是……，所以……”',reference:'沸腾前后都是水，没有产生新物质，只是状态改变，所以是物理变化。电解前是水，电解后生成氢气和氧气，它们是与水不同的物质，所以是化学变化。不能只靠都冒泡就把二者归为一类。',checks:['说明沸腾后仍是水，没有产生新物质，而不是因为“能变回来”。','指出电解生成氢气和氧气等新物质，区别依据是物质身份而不是气泡。']},
    {kind:'choice',skill:'换一个现象，检查判断依据',title:'“颜色看起来变了，就是化学变化。”怎样有依据地反驳？',context:'资料：一块蓝色玻璃磨成细粉后，看起来颜色变浅；检测表明没有产生新物质。判断这一磨碎过程。',options:['玻璃很难恢复原样，所以一定是化学变化','资料说没有产生新物质，磨碎是物理变化；不能只看颜色','颜色变浅就足以证明发生了化学变化，不必看检测资料'],answer:1,hint:'题目提供了哪条直接涉及“有没有新物质”的证据？能否恢复原样也不是唯一判断标准。',explanation:'题目已提供“没有产生新物质”的检测资料，所以这一磨碎过程是物理变化。颜色、形状等现象是线索，不能替代新物质的证据；能否恢复原样也不是划分标准。'},
    {kind:'number',skill:'读模型，分清原子和分子',title:'变化后，图里共有几个氢原子？',context:'新的模型：变化前6个水分子，每个由2个氢原子和1个氧原子组成；变化后6个氢分子和3个氧分子。图例H表示一个氢原子，O表示一个氧原子。问变化后氢原子总数，不是氢分子个数。',label:'氢原子总数（填数字）',unit:'个',answer:12,hint:'一个H圆球表示一个氢原子。每个氢分子里有2个H，先数有几组，再数每组几个。',explanation:'图中有6个氢分子，每个含2个氢原子，所以共有6×2＝12个氢原子。变化前也是6×2＝12个。原子重新组合形成新的分子，氢原子没有凭空消失或增加；6是氢分子数，不是氢原子数。'},
    {kind:'open',skill:'把一个场景拆成两个过程',title:'蜡烛熔化和燃烧，各是什么变化？请分别给出依据。',context:'资料①：固态蜡熔化成液态蜡，仍然是蜡。资料②：蜡与空气中的氧气发生燃烧，生成二氧化碳和水等新物质。请分别判断并说明依据；用一个“物理”或“化学”标签能否概括这两个过程？',hint:'先把“熔化”和“燃烧”分开。分别问有没有新物质，再判断能否只用一个标签。',reference:'蜡熔化后仍是蜡，没有产生新物质，是物理变化。蜡燃烧生成二氧化碳和水等新物质，是化学变化。这一场景同时包含两个不同过程，不能用单一标签把它们全部概括。判断时要说清正在分析哪个过程。',checks:['分别判断：熔化是物理变化，燃烧是化学变化，并分别引用物质是否改变的资料。','说明同一场景可同时有两类变化，要把具体过程分开分析。']}
  ];
  const species={
    water:{name:'水分子',atoms:[{element:'O',x:0,y:0},{element:'H',x:-25,y:23},{element:'H',x:25,y:23}],bonds:[[0,1],[0,2]]},
    hydrogen:{name:'氢分子',atoms:[{element:'H',x:-16,y:0},{element:'H',x:16,y:0}],bonds:[[0,1]]},
    oxygen:{name:'氧分子',atoms:[{element:'O',x:-19,y:0},{element:'O',x:19,y:0}],bonds:[[0,1]]}
  };
  function model(mode,count=4,spread=0){
    if(!['water','products'].includes(mode)||![4,6].includes(count)||!Number.isFinite(spread)||spread<0||spread>100)throw new Error('Invalid particle model');
    const columns=count===4?2:3;
    const xs=count===4?[105,255]:[65,180,295];
    if(mode==='water')return Array.from({length:count},(_,i)=>({species:'water',x:count===4?180+(i%2?1:-1)*(39+.48*spread):xs[i%columns],y:count===4?145+(i<2?-1:1)*(36+.48*spread):(i<3?75:205)}));
    return [
      ...Array.from({length:count},(_,i)=>({species:'hydrogen',x:xs[i%columns],y:i<columns?60:140})),
      ...Array.from({length:count/2},(_,i)=>({species:'oxygen',x:xs[i],y:235}))
    ];
  }
  function numberValue(value){const s=String(value).normalize('NFKC').trim();return /^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
  root.ChangeLesson={title,questions,species,model,numberValue};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ChangeLesson;
})(typeof window!=='undefined'?window:globalThis);
