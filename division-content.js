/* Growth, division and differentiation are compared as separate schematic observations. */
(function(root){
 'use strict';
 const title='细胞变多了，分工就会自动出现吗？';
 function state(mode,step){
  if(!['grow','divide','specialize'].includes(mode)||!Number.isInteger(step)||step<0||step>(mode==='divide'?3:2))throw new Error('Outside cell process model');
  const count=mode==='grow'?1:mode==='divide'?2**step:4;
  return {mode,step,count,size:mode==='grow'?1+step*.25:1,types:Array.from({length:count},(_,i)=>mode!=='specialize'||step===0?'initial':i<2?'surface':step===2?'leaf':'initial'),label:mode==='divide'?`第${step}轮完成：${count}个细胞`:mode==='grow'?['生长前','生长中','生长后'][step]:['分化前：4个相似细胞','部分细胞出现结构与功能差异','分化后：4个细胞，出现不同分工'][step]};
 }
 function descendants(start,rounds){if(!Number.isInteger(start)||start<1||!Number.isInteger(rounds)||rounds<0||rounds>10)throw new Error('Invalid synchronized division count');return start*2**rounds;}
 function readNumber(input){const s=String(input).trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));return /^\d+$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):null;}
 const questions=[
  {kind:'choice',skill:'先判断：增多和分工是一回事吗',title:'只知道细胞从1个变成8个，就能说已经形成不同组织了吗？',context:'观察记录只确认细胞数增多，没有提供形态、结构或功能的差异。',options:['能：只要数量增加，就一定有了不同分工','不能：数量增加还不能证明出现了不同结构与功能','不能：细胞只会长大，不会增加数量'],answer:1,hint:'“有更多细胞”与“有不同分工的细胞”，需要的证据相同吗？',explanation:'选B。分裂使细胞数增加；分化使细胞在形态、结构和生理功能上出现差异，形成不同组织。仅有数量变化，不能证明已经分化。生长主要体现为细胞体积增大。'},
  {kind:'number',skill:'按条件计算：每一轮谁参与分裂',title:'开始有3个细胞，两轮后共有几个？',context:'每一轮，所有已有细胞都完成一次正常分裂，每个变成两个；没有死亡或移出。只统计两轮结束时细胞总数。',label:'两轮结束时的细胞数',unit:'个',answer:12,hint:'第一轮：3个各变成2个，共几个？第二轮是这些新细胞全部再各变成2个。别把轮数直接当倍数。',explanation:'12个：3→6→12。每一轮都把当时的细胞数乘2。这里“全部细胞每轮都分裂”是题目条件，真实组织里的细胞不会都按同一节拍无限分裂。'},
  {kind:'open',skill:'解释机制：数量翻倍，信息会减半吗',title:'一个植物体细胞分成两个，新细胞里的遗传信息只有原来的一半吗？',context:'讨论正常体细胞分裂，不考虑变异；比较分裂完成后的每个新细胞与原细胞在遗传物质复制前的状态。小林说：“一分为二，所以每个只能分到半套。”请解释他漏掉了什么。',hint:'分开之前，遗传物质是否先复制？复制后再分配，与把唯一的一份直接撕成两半一样吗？',reference:'他漏掉了分裂前遗传物质的复制。正常体细胞分裂时，复制后的染色体平均分配到两个新细胞；每个新细胞的染色体数目和遗传信息，与原细胞复制前保持一致，不是各分半套。这里不能把细胞体积的分配等同于遗传信息减半。',checks:['说明先复制遗传物质，再向两个新细胞平均分配。','每个新细胞得到与原细胞复制前一致的一套染色体和遗传信息，而非半套。']},
  {kind:'choice',skill:'看证据分类：体积变化还是功能差异',title:'哪一条观察能支持“发生了分化”？',context:'比较来自同一植物、原本相似的细胞的后续变化；这里只根据所给记录判断。',options:['数量不变，每个细胞体积都增大','每个细胞又分成两个，形态仍相似','一部分变成扁平的表皮细胞，另一部分成为富含叶绿体的叶肉细胞，作用不同'],answer:2,hint:'找出同时涉及结构差异与功能分工的记录。数量更多或体积更大，单独能说明这一点吗？',explanation:'选C。表皮细胞与叶肉细胞出现不同形态、结构和功能，支持发生分化。A主要描述生长；B主要描述分裂。分化不是换个颜色，而是细胞结构与功能真正出现差异。'},
  {kind:'open',skill:'换成动物材料：用观察解释过程',title:'培养记录里的两种变化，都能只用“分裂”解释吗？',context:'动物细胞培养记录：①原有4个相似细胞全部各分裂一次，得到8个；②跟踪这8个细胞，没有再分裂或死亡，其中一些逐渐形成细长、能收缩的肌细胞，另一些形成带长突起、能传递信息的神经细胞。分别解释①②的主要过程，并说明②结束时细胞数及依据。',hint:'①变化的是数量，②变化的是形态结构和功能。题目明确②没有新增或死亡，出现两类分工会自动让数量翻倍吗？',reference:'①主要是分裂，4个各分成两个，变成8个。②主要是分化：原本相似的细胞出现不同形态结构和功能，分别承担收缩与信息传递等作用。②结束仍是8个，因为材料明确没有再分裂或死亡；出现不同类型不等于数量增加。仅用“分裂”不能解释②的分工差异。',checks:['将①对应分裂、②对应分化，并用数量变化/结构功能差异解释。','②结束仍是8个，依据没有再分裂或死亡；分化形成不同类型，不自动使数量翻倍。']}
 ];
 root.DivisionLesson={title,questions,state,descendants,readNumber};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.DivisionLesson;
})(typeof window!=='undefined'?window:globalThis);
