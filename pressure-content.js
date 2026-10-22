/* Uniform normal loading model; footprint deformation is not quantitatively simulated. */
(function(root){
  'use strict';
  const title='大脚板，为什么不容易陷下去？';
  const forces=[60,120,180,240],tileArea=20;
  function pressure(force,areaM2){if(!Number.isFinite(force)||force<0||!Number.isFinite(areaM2)||areaM2<=0)throw new Error('Pressure needs nonnegative normal force and positive area');return force/areaM2;}
  function model(force,cells){if(!forces.includes(force)||!Number.isInteger(cells)||cells<1||cells>6)throw new Error('Outside contact model');const areaCm2=cells*tileArea,areaM2=areaCm2/10000;return {force,cells,areaCm2,areaM2,perTile:force/cells,perCm2:force/areaCm2,pa:pressure(force,areaM2)};}
  function fmt(n){return String(Math.round(n*10000)/10000);}
  function readNumber(input){const s=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
  const questions=[
    {kind:'choice',skill:'先比较每单位面积承担多少',title:'两块支脚对地面的压强，哪一块更大？',context:'压力均匀分布。甲对地面的压力120N，实际接触面积60cm²；乙的压力180N，实际接触面积120cm²。压强表示每单位受力面积承受的压力；N是牛顿，cm²是平方厘米。',options:['甲：虽然总压力较小，但每1cm²承担的压力更大','乙：总压力较大，所以压强一定更大','一样大：压力和面积都增大，就一定互相抵消'],answer:0,hint:'先求每1平方厘米承担的压力。也可只看60平方厘米：甲全部120N，乙在均匀分布时这一半面积承担多少N？',explanation:'甲更大。甲120÷60＝2N/cm²，乙180÷120＝1.5N/cm²。只看总压力不够；压力增至1.5倍、面积增至2倍，乙的压强反而较小。面积与压力必须一起比较。'},
    {kind:'number',skill:'计算前，先把面积单位换对',title:'90N均匀压在30cm²上，压强是多少帕？',context:'求压强p，使用p＝F/S。F是垂直接触面的压力，S是实际受力面积。填Pa时，把N与m²配套使用；1m²＝10000cm²。',label:'压强的数值（只填数字）',unit:'Pa',answer:30000,hint:'30cm²＝30÷10000m²。先换面积，再用90N除以这个面积。3N/cm²与3Pa不是同一个大小。',explanation:'30cm²＝0.003m²，p＝90÷0.003＝30000Pa。也可以先算3N/cm²，再乘10000换成Pa。1Pa＝1N/m²，面积换算不能只除以100。'},
    {kind:'open',skill:'辨错：变化了一个量，还是两个量',title:'接触面积翻倍，压强就一定减半吗？',context:'改装前，支架对地面的压力400N，实际接触面积0.02m²；装上设备并换宽脚后，压力800N，实际接触面积0.04m²。均匀受压。小林说：“面积翻倍，所以压强减半。”请纠正并说明理由。',hint:'分别计算两次F/S。这里扩大面积的同时，压力有没有保持不变？',reference:'这次压强没有减半，而是保持不变。改装前400÷0.02＝20000Pa，改装后800÷0.04仍为20000Pa，压力和受力面积同倍增加，比值不变。只有压力不变时，受力面积翻倍才能推出压强减半。',checks:['判断本次压强不变，用两个比值或同倍变化说明原因。','补出“压力不变”这个条件，不把面积变大直接等同于压强减小。']},
    {kind:'choice',skill:'换成竖直墙面，选对公式里的力',title:'机器人用平板压墙，墙面受到的压强是多少？',context:'机器人通过平板水平向右压竖直墙面，压力40N，接触面积0.01m²，压力均匀分布。机器人的重力为200N、方向竖直向下。只计算平板与墙的接触面压强。',options:['20000Pa：把机器人重力200N代入','0Pa：重力不朝墙，所以墙面没有压力','4000Pa：用垂直墙面的40N除以0.01m²'],answer:2,hint:'公式里的F是作用在这个接触面上的压力。哪一个力垂直压在墙上？压力并不总等于物体重力。',explanation:'选第三项，p＝40÷0.01＝4000Pa。墙面受到的是水平40N压力，不是向下200N的重力。只有符合特定受力条件时，压力大小才可能等于重力；不能不看接触面就直接代入重力。'},
    {kind:'open',skill:'迁移：什么时候要大面积，什么时候要小面积',title:'雪地靴要宽，切割工具的刃口却要窄，矛盾吗？',context:'机器人平稳站在同样的雪面上，总压力保持600N。两只靴子的总接触面积由300cm²增到600cm²，按均匀受压比较。切割工具则希望增大接触处压强，比较时保持压力相同。说明雪靴的压强怎样变，以及两个设计为什么不矛盾。',hint:'先找两种设计各自的目的。雪靴希望减小还是增大压强？刃口呢？面积变了，不能说总压力一定也变了。',reference:'不矛盾，目的不同。雪靴在600N压力不变时，总接触面积翻倍，压强减半（20000Pa→10000Pa），有助于减小对雪面的压入作用，不是机器人变轻了。刃口在压力相同时减小受力面积，能增大压强，便于切开材料。实际是否下陷、是否切开还与材料等有关，不能把面积变化当成任何情况下都有效的保证。',checks:['雪靴面积是两只的总接触面积；压力不变、面积翻倍，压强减半，不说机器人变轻。','同样压力下，刃口面积小使压强大；解释两种目的不同。','结合题目条件，不断言宽靴永不下陷或所有材料都能切开。']}
  ];
  root.PressureLesson={title,forces,tileArea,questions,pressure,model,fmt,readNumber};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.PressureLesson;
})(typeof window!=='undefined'?window:globalThis);
