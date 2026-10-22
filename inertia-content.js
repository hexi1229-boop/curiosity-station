/* Original inertia tasks; coordinates are relative to the ground. */
(function(root){
 'use strict';
 const title='车停了，人为什么还往前？';
 const surfaces=[{id:'large',name:'阻力较大',deceleration:1},{id:'small',name:'阻力较小',deceleration:.5},{id:'zero',name:'理想：水平阻力为0',deceleration:0}];
 const massSamples=[{name:'A车',mass:1,speed:0},{name:'B车',mass:1,speed:4},{name:'C车',mass:2,speed:2}];
 function state(initial=2,surface='large',time=0){
  const s=surfaces.find(s=>s.id===surface);
  if(![0,2].includes(initial)||!s||typeof time!=='number'||!Number.isFinite(time)||time<0||time>4)throw new Error('Outside inertia model');
  const a=s.deceleration,stopTime=initial===0?0:a?initial/a:Infinity,t=Math.min(time,stopTime),speed=Math.max(0,initial-a*time),distance=initial*t-a*t*t/2;
  return {initial,surface,time,speed,distance,stopTime,horizontalForce:speed>0&&a>0?'left':'zero',ideal:surface==='zero'};
 }
 function readNumber(input){const s=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
 const questions=[
  {kind:'choice',skill:'先判断：原来怎样运动，后来谁先减速',title:'汽车向前行驶时突然刹车，人为什么容易向前倾？',context:'相对地面，刹车前人和车一起向前运动。这里只解释刚开始刹车时的前倾趋势。',options:['惯性是一种向前的力，它把人推向前','车先减速，上身具有保持原来运动状态的惯性，相对车向前倾','车一刹车，人的惯性突然变大了'],answer:1,hint:'刹车前人的上身是否已经在向前运动？继续保持原来的运动，需要凭空多出一个向前的力吗？',explanation:'选B。人原来和车一起向前运动，车先减速，上身由于惯性有保持原来运动状态的趋势，相对车向前倾。惯性是物体的性质，不是一种推力。安全带通过给人施力使人随车减速，不是把惯性消除。'},
  {kind:'number',skill:'用规律预测：没有推力，不等于不能运动',title:'松手后2秒，箱子沿直线前进了多少米？',context:'从松手开始，相对地面，箱子以3m/s向右运动。之后水平合力始终为0，竖直方向受力平衡，运动方向不变。求松手后2秒内的路程。',label:'2秒内的路程',unit:'m',answer:6,hint:'先判断松手后速度是否改变。若速度保持原值，每秒前进多少米？两秒呢？',explanation:'6米。水平合力为0，箱子保持3m/s向右做匀速直线运动，路程为3×2＝6米。松手撤去推力不会自动使它停下；如果存在未平衡的阻力，情况才会不同。'},
  {kind:'open',skill:'辨错：惯性大小由什么决定',title:'“B最快，所以惯性最大；A没动，没有惯性。”对吗？',context:'相对地面，A车质量1kg、静止；B车质量1kg、速度4m/s；C车质量2kg、速度2m/s。请纠正这句话，并比较三车的惯性大小。',hint:'静止物体也会保持原来的状态吗？在本课涉及的日常运动范围内，惯性大小看质量，还是看当前速度？',reference:'不对。三辆车都有惯性，静止并不等于没有惯性。惯性大小由质量决定：C质量最大，惯性最大；A与B质量相同，惯性一样大，虽然速度不同。可以写成C＞A＝B。不能把“运动得快”直接解释成“惯性更大”。',checks:['说明静止和运动的物体都有惯性，惯性不是只在刹车时才出现。','以质量为依据得出C＞A＝B，没有用速度或是否运动来比较惯性。']},
  {kind:'choice',skill:'证据与推理：分清实际观察和理想情况',title:'怎样从比较现象，合理认识牛顿第一定律？',context:'让同一滑块以相同初速度进入不同水平表面。比较发现：水平阻力较小时，速度减小得更慢，滑得更远。其余条件相同，竖直受力平衡。',options:['每次最终都停，所以任何运动都必须靠持续推力维持','只要动画显示4秒没停，就已经直接证明它永远不停','把观察与科学推理结合：若没有水平阻力，也无其他水平力，它会保持原速度沿直线运动'],answer:2,hint:'比较时哪些条件相同，哪个因素变了？“越来越慢地减速”能帮助推想什么？有限时间的动画能代替实验证据吗？',explanation:'选C。实验比较提供“阻力减小，运动状态改变得更慢”的依据，再推理理想的零水平合力情形。牛顿第一定律不是靠直接观察一个物体无限久才得到的；动画按规律制作，帮助理解，不是独立证明。第一定律指出：一切物体在不受外力时，总保持静止或匀速直线运动状态。本课滑块的重力和支持力平衡，理想零水平合力时也得到相同的运动结果。'},
  {kind:'open',skill:'新情境迁移：把水平运动与下落分开',title:'匀速小车上释放小球，它会落在标记点后方吗？',context:'小车在水平轨道上向右做匀速直线运动。小球起初随车运动，位于车板标记点的正上方；释放时不给额外水平推力。忽略空气阻力，小球下落时只受重力。先判断它到达车板高度时与标记点的位置关系，再说明：若球离手后小车开始刹车，结论还能照搬吗？',hint:'释放前小球是否已有与车相同的水平速度？重力改变哪一方向的运动？第二种情况中，标记点的水平速度又怎样变化？',reference:'匀速直线行驶时，小球落在标记点。释放前它已有与车相同的水平速度，释放后没有水平力，仍保持这个水平速度；车也保持原速度，所以两者水平位置始终对齐。重力使小球向下运动，不能说小球完全不受力。若离手后小车开始刹车，标记点减速，而球在接触其他物体前仍保持原水平速度，因此相对标记点向前偏移，不能照搬原结论。',checks:['说明小球原来已有与车相同的水平速度；不需要额外向前推力来维持。','匀速时落在标记点，并区分无水平力与仍受竖直重力。','车开始刹车时判断条件变化，小球相对标记点向前偏移，不保证仍落在标记点。']}
 ];
 root.InertiaLesson={title,surfaces,massSamples,state,readNumber,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.InertiaLesson;
})(typeof window!=='undefined'?window:globalThis);
