/* Original tasks. All depicted samples have explicitly given molecular compositions. */
(function(root){
 'use strict';
 const title='只有一种元素，就一定是纯净物吗？';
 const labels=['单质','化合物','混合物'];
 const samples=[
  {name:'A · 纯氧气',composition:'只有O₂分子；每个由2个氧原子构成',answer:0},
  {name:'B · 纯水',composition:'只有H₂O分子；每个含氢、氧两种原子',answer:1},
  {name:'C · 氧气和臭氧',composition:'同时含O₂、O₃两种分子，没有其他成分',answer:2},
  {name:'D · 纯臭氧',composition:'只有O₃分子；每个由3个氧原子构成',answer:0}
 ];
 function validAssignments(a,complete=false){return Array.isArray(a)&&a.length===4&&Array.from(a).every(v=>Number.isInteger(v)&&v>=0&&v<labels.length||(!complete&&v===null));}
 function checkAssignments(a){return validAssignments(a,true)&&a.every((v,i)=>v===samples[i].answer);}
 function answerText(a){if(!validAssignments(a,true))throw new Error('Incomplete classification');return samples.map((s,i)=>s.name+'：'+labels[a[i]]).join('；');}
 const specimens=[
  {name:'纯氧气',formulas:['O₂'],atoms:['O'],recipe:['O₂','O₂','O₂'],classification:'单质'},
  {name:'纯臭氧',formulas:['O₃'],atoms:['O'],recipe:['O₃','O₃','O₃'],classification:'单质'},
  {name:'氧气 + 臭氧',formulas:['O₂','O₃'],atoms:['O'],recipe:['O₂','O₃','O₂'],classification:'混合物'},
  {name:'纯水',formulas:['H₂O'],atoms:['H','O'],recipe:['H₂O','H₂O','H₂O'],classification:'化合物'}
 ];
 function model(sample=2,copies=1,layout=0){
  if(!Number.isInteger(sample)||sample<0||sample>=4||![1,2].includes(copies)||![0,1].includes(layout))throw new Error('Invalid sample model');
  const s=specimens[sample],slots=[[76,48],[224,48],[76,116],[224,116],[76,184],[224,184]],order=layout?[5,2,1,4,3,0]:[0,1,2,3,4,5];
  const particles=Array.from({length:6},(_,i)=>({id:i,formula:s.recipe[i%3],visible:i<3*copies,x:slots[order[i]][0],y:slots[order[i]][1]}));
  return {sample,copies,layout,name:s.name,particles,substanceKinds:s.formulas.length,elementKinds:s.atoms.length,elements:[...s.atoms],formulas:[...s.formulas],total:3*copies,classification:s.classification,pure:s.formulas.length===1};
 }
 const questions=[
  {kind:'choice',skill:'先判断：同一种元素，能组成几种物质',title:'这份样品只含氧元素，就一定是纯净物吗？',context:'给定：样品同时含氧气O₂和臭氧O₃，没有其他成分。O₂、O₃是两种不同物质，其分子分别由2个、3个氧原子构成。',options:['是，只有氧这一种元素，所以是单质','不是，它含氧气和臭氧两种物质，是混合物','不是纯净物，因此它一定含两种元素'],answer:1,hint:'纯净物的“纯”是在数物质种类。氧原子种类相同，构成的完整分子也相同吗？',explanation:'选B。这里只有氧一种元素，却有氧气、臭氧两种物质，所以是混合物。单质首先必须是纯净物；不能漏掉这个条件。打开模型，分别数“元素”和“物质”。'},
  {kind:'classify',skill:'两步分类：先看物质种类，再看元素种类',title:'把4份样品放入合适的类别。',context:'只按已给出的成分判断。先看是纯净物还是混合物；属于纯净物，再分单质与化合物。',source:'A纯氧气只有O₂；B纯水只有H₂O；C同时含O₂和O₃；D纯臭氧只有O₃。',hint:'含多种物质，先归混合物。只有一种物质，再看它由一种还是不同元素组成。',explanation:'A、D是单质：都只有一种物质，也都只由氧元素组成。B是化合物：只有水一种物质，由氢、氧两种元素组成。C是混合物：氧气和臭氧两种物质同时存在，不能把整体归为单质。'},
  {kind:'open',skill:'辨错解释：元素不是装在水里的两种气体',title:'“纯水含氢、氧，所以是氢气和氧气的混合物。”对吗？',context:'题目给定这份纯水只有H₂O分子，没有H₂或O₂分子。每个H₂O分子含2个氢原子、1个氧原子。请改正结论，并讲清“含氢、氧元素”和“混有氢气、氧气”的区别。',hint:'把每个完整H₂O分子圈起来。图中有没有独立的H₂分子、O₂分子？数到两种原子，能直接当成两种物质吗？',reference:'不对。纯水只有水一种物质，属于纯净物；水由氢、氧两种元素组成，所以是化合物。氢、氧原子结合在水分子中，不表示氢气和氧气混在水里。题目给定没有H₂、O₂分子，不能把元素名称直接替换成物质名称。',checks:['把纯水归为化合物，说明它既是纯净物，又由不同元素组成。','明确氢、氧元素不等于氢气、氧气；没有把两种原子当成两种物质。']},
  {kind:'choice',skill:'追到根本：用什么决定元素种类',title:'三张原子卡，代表几种元素？',context:'已知：元素是质子数相同的一类原子的总称。甲原子核中有8个质子；乙也有8个；丙有1个。这里比较的都是原子，不是整颗分子。',options:['3种，甲、乙、丙的卡片编号不同','2种，甲和乙属于同种元素，丙属于另一种','1种，它们都可以叫原子'],answer:1,hint:'元素分类的依据是原子核内的质子数，还是卡片编号与原子总个数？',explanation:'选B。甲、乙质子数相同，都属于氧元素；丙有1个质子，属于氢元素。一共有3个原子，但只有2种元素。元素种类看质子数，不看卡片名称，也不数原子总个数。'},
  {kind:'open',skill:'换个样品：相同元素，分类也一定相同吗',title:'甲、乙都含碳和氧，能都叫化合物吗？',context:'甲只含二氧化碳CO₂。乙同时含一氧化碳CO和二氧化碳CO₂，没有其他物质；两者是不同物质。CO每个分子含1个碳原子、1个氧原子；CO₂每个含1个碳原子、2个氧原子。请分别分类，并说明：乙中CO₂分子数量增多、CO仍在且未发生反应时，分类会变吗？',hint:'先比较完整分子的种类，再看元素种类。数量增多之后，CO有没有全部消失？',reference:'不能都叫化合物。甲只有CO₂一种物质，由碳、氧两种元素组成，是化合物。乙同时有CO和CO₂两种物质，是混合物，尽管这两种物质各自都是化合物。CO₂数量增多而CO仍在、没有反应时，乙仍含两种物质，所以仍是混合物。决定分类的是物质与元素的种类，不是两种分子的多少比例。',checks:['甲归为化合物，并同时说明“一种物质、两种元素”。','乙整体归为混合物，区分“成分各自是化合物”和“整体是化合物”。','数量改变后仍归混合物，依据是CO与CO₂仍同时存在，未忽略给定条件。']}
 ];
 root.ElementsLesson={title,samples,labels,validAssignments,checkAssignments,answerText,model,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.ElementsLesson;
})(typeof window!=='undefined'?window:globalThis);
