/* Local planar maps: x east, y north; rotation changes screen orientation only. */
(function(root){
  'use strict';
  const title='地图转了，北方也会跟着转吗？';
  const camp=[{name:'营地',x:0,y:-1},{name:'灯塔',x:0,y:1}];
  const maps=[
    {angle:90,points:camp,route:[]},
    {angle:270,points:camp,route:[]},
    {angle:180,points:camp,route:[]},
    {angle:90,points:[{name:'营地',x:-1,y:-1},{name:'展馆',x:2,y:-1}],route:[0,1],metresPerGrid:100},
    {angle:270,points:[{name:'入口',x:-1,y:-1},{name:'休息站',x:-1,y:1},{name:'观景台',x:1,y:1}],route:[0,1,2],metresPerGrid:100}
  ];
  const questions=[
    {kind:'choice',skill:'先用自己的方法判断',title:'灯塔在营地的哪个方向？',context:'平面营地图上，指北标N指向屏幕右侧，灯塔也在营地右侧。判断灯塔相对于营地的地理方向。',options:['东，因为它在屏幕右边','北，要按图上的指北标判断','南，因为地图被转过了'],answer:1,hint:'先找到N。它指向的方向才是这张图上的北方。',explanation:'指北标N朝屏幕右侧，从营地到灯塔也朝右，因此灯塔在营地北方。“上北下南”适用于北朝上的图，不能直接套到这张已经转过的图。'},
    {kind:'open',skill:'把不变的关系说清楚',title:'地图转了，为什么灯塔仍在营地北方？',context:'同一张营地图换了朝向：现在N指向屏幕左侧，灯塔在营地左侧。实际地点没有搬动。用自己的话说清判断依据。',hint:'看“从营地指向灯塔”和“指北箭头”之间的关系，而不只看屏幕的左、右。',reference:'转动的是图纸，地点和指北箭头一起转动。从营地指向灯塔的方向始终与指北箭头同向，所以灯塔仍在营地北方。屏幕上的左右变了，实际地点之间的地理方向没有改变。',checks:['说明地点与指北标一起转动，改变的是图纸朝向。','从营地指向灯塔仍与N同向，不把屏幕左、右直接当西、东。']},
    {kind:'choice',skill:'换个参照点，检查一句话',title:'小明说：“营地也在灯塔北方。”这句话对吗？',context:'图上N向下，灯塔在营地下方。这次问的是营地相对于灯塔的方向，不是灯塔相对于营地。',options:['不对，营地在灯塔南方；从灯塔看向营地，与N相反','对，交换参照点也不会改变两地相对的方向','对，营地在屏幕上方，上方就是北'],answer:0,hint:'把手指先放在题目作为参照的“灯塔”上，再指向营地。',explanation:'从灯塔到营地朝屏幕上方，而指北标朝下，两者相反，所以营地在灯塔南方。调换“谁在谁的哪方”，要从新的参照点重新判断。'},
    {kind:'number',skill:'按图量算实际距离',title:'沿虚线从营地直走到展馆，需要走多少米？',context:'图中每个小方格的边长表示100米。从营地到展馆的虚线路线沿格线连续走3格。按这条路线计算实际距离。',label:'路线距离（填数字）',unit:'米',answer:300,hint:'按小方格的边长数路程，不要把屏幕上的厘米当真实距离。',explanation:'虚线路线长3个格边，每个格边表示100米，所以路线距离＝3×100＝300米。旋转地图或放大画面不改变它表示的实际距离。'},
    {kind:'open',skill:'给朋友写一条可用的路线',title:'从入口经休息站到观景台：请说清方向、总路程和依据。',context:'新图N朝屏幕左侧。休息站在入口左侧2格，观景台在休息站上方2格；每个格边表示100米。必须经过休息站，沿图中虚线走。在一条完整说明里写清先后方向、总路程和判断依据。',hint:'每走一段，都从这一段的出发点判断方向。先找北，再找东；总路程要把两段相加。',reference:'从入口先向北走200米到休息站，再向东走200米到观景台，全程400米。依据是指北标朝图的左侧，因此图的上方是东；两段路线各2格，每格100米。',checks:['路线为先向北到休息站、再向东到观景台，方向依据来自指北标。','把两段路程相加：(2＋2)×100＝400米，而不是量入口到观景台的直线。']}
  ];
  function rotate(point,degrees){
    if(!point||![point.x,point.y,degrees].every(Number.isFinite))throw new Error('Invalid map point or angle');
    const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    return {x:point.x*c+point.y*s,y:point.x*s-point.y*c};
  }
  function numberValue(value){const s=String(value).normalize('NFKC').trim();return /^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
  root.MapLesson={title,questions,maps,rotate,numberValue};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.MapLesson;
})(typeof window!=='undefined'?window:globalThis);
