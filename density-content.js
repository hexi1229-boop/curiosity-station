/* Compare equal volumes before applying the density formula. */
(function(root){
  'use strict';
  const title='更重的积木，材料就更“密”吗？';
  const materials=[{id:'a',name:'材料甲',density:2},{id:'b',name:'材料乙',density:5}];
  const questions=[
    {kind:'choice',skill:'先判断，应该怎样比',title:'甲积木120克，乙积木100克：哪种材料的密度更大？',context:'两块均匀实心积木，温度和状态相同。甲的质量120克、体积60立方厘米；乙的质量100克、体积20立方厘米。密度比较的是每单位体积的质量。',options:['材料甲，因为它的总质量更大','材料乙，换成相同体积比较时它的质量更大','密度相同，因为两块积木的总质量很接近'],answer:1,hint:'甲的体积是乙的3倍。先想象取出20立方厘米的甲，再与20立方厘米的乙比较质量。',explanation:'乙的密度更大。20立方厘米的甲质量是40克，乙是100克。每1立方厘米，甲对应2克，乙对应5克。总质量较大不一定密度较大，还要比较体积。'},
    {kind:'open',skill:'切一半，什么变了',title:'同一块积木切成一半，密度也会减半吗？',context:'一块均匀实心积木原来120克、60立方厘米。切下一半后，这一半60克、30立方厘米，温度和物态不变。解释密度是否改变，并说明依据。',hint:'分别计算切之前和切之后，每1立方厘米对应的质量。不要只看60克比120克少。',reference:'密度没有减半。切之前120÷60=2克/立方厘米，切之后60÷30仍是2克/立方厘米。质量与体积都减半，比值不变。这里限定同一均匀材料、温度和物态不变。',checks:['判断密度不变，不把总质量的变化当成密度变化。','用两个比值相等，或质量和体积同倍变化的关系说明理由。']},
    {kind:'choice',skill:'数值与单位一起核对',title:'60克的实心零件，体积20立方厘米，密度是多少？',context:'密度ρ=m÷V，表示每单位体积的质量。这里m是质量，V是体积。',options:['3克/立方厘米','1/3克/立方厘米','1200克/立方厘米'],answer:0,hint:'把60克平均对应到20份、每份1立方厘米，每一份对应几克？',explanation:'ρ=60÷20=3克/立方厘米，意思是这种材料每1立方厘米对应3克。20÷60颠倒了质量和体积；把60与20相乘也不是每单位体积的质量。'},
    {kind:'number',skill:'由每份质量推回总质量',title:'每1立方厘米3克，50立方厘米共有多少克？',context:'同种均匀材料的密度是3克/立方厘米。实心零件的材料体积为50立方厘米，温度和物态不变，只填质量的数字，单位已给出。',answer:150,hint:'有50份1立方厘米，每份3克。求总质量时，3与50应怎样组合？',explanation:'m=ρV=3×50=150克。密度是每份的质量，体积告诉你有多少份。'},
    {kind:'open',skill:'给模型选材料，说清条件',title:'做同样体积的实心模型零件，只想减轻质量，你选哪种材料？',context:'材料丙密度3克/立方厘米，丁8克/立方厘米。两种方案都是30立方厘米的均匀实心零件，温度和物态不变。只比较质量，选择一种材料，并用数据说明理由。',hint:'两种方案的体积相同。分别算30立方厘米的质量，再比较；不要把这道题变成“哪种材料在所有方面都更好”。',reference:'只考虑减轻质量，选丙。丙质量3×30=90克，丁8×30=240克。同体积时，密度较小的材料质量较小。真实选材还可能要比较强度等条件，不能只凭密度判断材料全面优劣。',checks:['选丙，能正确比较90克与240克，或用同体积、较小密度推导较小质量。','说明同体积且这里只比较质量的条件，不把结论扩大成材料丙各方面都更好。']}
  ];
  function sample(material,volume){const m=materials.find(x=>x.id===material);if(!m||!Number.isInteger(volume)||volume<10||volume>100||volume%10!==0)throw new Error('Invalid uniform sample');return {material:m.name,volume,mass:m.density*volume,density:m.density,cells:volume/10};}
  function density(mass,volume){if(!Number.isFinite(mass)||!Number.isFinite(volume)||mass<=0||volume<=0)throw new Error('Mass and volume must be positive');return mass/volume;}
  function readNumber(input){const raw=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)&&Number.isFinite(Number(raw))?Number(raw):null;}
  root.DensityLesson={title,materials,questions,sample,density,readNumber};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.DensityLesson;
})(typeof window!=='undefined'?window:globalThis);
