/* Original tasks; idealised compositions are given explicitly. */
(function(root){
 'use strict';
 const title='看起来一样，就是纯净物吗？';
 const samples=[
  {name:'A · 蒸馏水',composition:'题目给定只含水',answer:0},
  {name:'B · 纯氧气',composition:'只含氧气',answer:0},
  {name:'C · 蔗糖水',composition:'只含水和已完全溶解的蔗糖',answer:1},
  {name:'D · 空气',composition:'含氮气、氧气等物质',answer:1}
 ];
 const labels=['纯净物','混合物'];
 function validAssignments(a,complete=false){return Array.isArray(a)&&a.length===4&&Array.from(a).every(v=>v===0||v===1||(!complete&&v===null));}
 function checkAssignments(a){return validAssignments(a,true)&&a.every((v,i)=>v===samples[i].answer);}
 function answerText(a){if(!validAssignments(a,true))throw new Error('Incomplete classification');return samples.map((s,i)=>s.name+'：'+labels[a[i]]).join('；');}
 function model(sugar=0,layout=0){
  if(!Number.isInteger(sugar)||sugar<0||sugar>3||!Number.isInteger(layout)||layout<0||layout>1)throw new Error('Invalid particle model');
  const slots=[[42,43],[115,43],[188,43],[261,43],[42,106],[115,106],[188,106],[261,106],[42,169],[115,169],[188,169],[261,169]];
  const order=layout?[10,3,8,1,6,11,4,9,2,7,0,5]:[0,2,4,6,8,10,1,5,9,3,7,11];
  const particles=order.map((slot,i)=>({id:i,kind:i<9?'W':'S',visible:i<9||i-9<sugar,x:slots[slot][0],y:slots[slot][1]}));
  return {sugar,layout,particles,water:9,total:9+sugar,kinds:sugar===0?1:2,classification:sugar===0?'纯净物':'混合物'};
 }
 const questions=[
  {kind:'choice',skill:'先判断：眼睛看到了什么，没看到什么',title:'两杯液体都透明无色，能据此断定它们都是纯净物吗？',context:'现在只知道A杯和B杯的外观，没有配料、制备或成分信息。先根据目前的证据判断。',options:['能，透明无色说明只含一种物质','不能，它们一定都是混合物','证据不足，还需要知道分别含有哪些物质'],answer:2,hint:'水和溶解了少量蔗糖的水，都可能透明无色。外观一样，组成也一定一样吗？',explanation:'选C。纯净物由一种物质组成，混合物由两种或更多物质组成。仅凭透明无色，无法知道成分种类；不能断定都是纯净物，也不能反过来断定都是混合物。打开下面的模型验证。'},
  {kind:'classify',skill:'动手分类：读成分，不猜外观',title:'把4份样品分别归类，再一起提交。',context:'本题按卡片给定的成分判断，不额外假设有杂质。纯净物只含一种物质；混合物含两种或更多物质。',source:'样品成分：A蒸馏水只含水；B纯氧气只含氧气；C蔗糖水只含水和完全溶解的蔗糖；D空气含氮气、氧气等。',hint:'“气体”是状态，“溶解”是现象。逐张圈出有哪些物质，不要数名字有几个字。',explanation:'A和B是纯净物，C和D是混合物。A只含水，B只含氧气；C中水和蔗糖都在，完全溶解不等于蔗糖消失；D含氮气、氧气等多种物质。'},
  {kind:'open',skill:'辨错解释：两种状态，就是两种物质吗',title:'“杯中有冰又有水，所以是混合物。”这句话对吗？',context:'题目给定：密闭杯中只有纯水，部分为冰，部分为液态水，不含其他物质。请判断并说明：这里变化的是状态，还是物质种类？',hint:'冰熔化前后都是什么物质？判断纯净物和混合物时，应该数哪一种“种类”？',reference:'这句话不对。冰与液态水是同一种物质（水）的不同状态；题目又给定不含其他物质，所以属于纯净物。固态和液态同时出现，不等于出现两种物质。关键是成分，不是状态的数量。',checks:['判断为纯净物，并依据题目“只含水”的条件。','解释冰和液态水是同一种物质的不同状态，没有把两种状态当成两种物质。']},
  {kind:'choice',skill:'读微观图：分子种类与原子种类分开数',title:'这幅图对应的样品，应当怎样归类？',context:'图中每一对相连的A、B小球表示一个AB分子；A和B代表两种不同原子。这份样品只含图示这一种分子，没有其他成分。',options:['混合物，因为图中有6个分子','混合物，因为有A、B两种原子','纯净物，因为这些分子的组成相同，样品只含一种物质'],answer:2,hint:'先把每一对相连的小球看成一个完整分子。比较的是完整分子种类，还是一个分子里有几种原子？',explanation:'选C。6个AB分子都属于同一种分子；两种原子结合在同一种分子中，不表示两种物质混在一起。这里讨论的是题目给定的分子样品，不能把“数图中颜色”当作通用分类方法。'},
  {kind:'open',skill:'换个情境：能判断的判断，缺证据的说明缺什么',title:'给两份样品写结论：哪份能判断，哪份还缺证据？',context:'甲：只含水和已完全溶解的食盐。乙：某液体经过普通滤纸过滤后透明无色，没有提供成分信息。请分别判断，并说明乙还需要什么信息。',hint:'甲的两种成分已给出。普通滤纸能除去不溶的固体，但能把已溶解的食盐从水中滤掉吗？透明说明了全部成分吗？',reference:'甲是混合物，水和食盐两种物质都在。乙证据不足：过滤后透明无色不等于只含水；普通滤纸不能除去水中已溶解的食盐等物质。还需可靠的成分信息，例如是否含有水以外的溶解物质、实际含哪些物质。若只含水可判纯净物；若含水和其他物质则为混合物。不能仅凭没看见杂质断定纯净，也不能断言乙一定含盐。',checks:['甲判断为混合物，说明溶解后食盐仍是其成分。','乙保留“证据不足”，并指出普通过滤与透明外观不能证明只含一种物质。','提出需要成分种类/是否还有其他物质的信息，没有编造乙一定含盐或一定纯净。']}
 ];
 root.PurityLesson={title,samples,labels,validAssignments,checkAssignments,answerText,model,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.PurityLesson;
})(typeof window!=='undefined'?window:globalThis);
