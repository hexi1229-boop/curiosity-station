/* Original tasks; simplified conditions model, not a measured rate simulation. */
(function(root){
 'use strict';
 const title='植物的糖，是从土里吸来的吗？';
 const samples=[
  {name:'A · 二氧化碳',composition:'来自空气，进入叶片',answer:0},
  {name:'B · 氧气',composition:'只讨论光合作用的收支',answer:1},
  {name:'C · 水',composition:'由根吸收，可供叶片利用',answer:0},
  {name:'D · 有机物',composition:'如糖类，其中贮存着能量',answer:1}
 ];
 const labels=['原料','产物'];
 function validAssignments(a,complete=false){return Array.isArray(a)&&a.length===4&&Array.from(a).every(v=>v===0||v===1||(!complete&&v===null));}
 function checkAssignments(a){return validAssignments(a,true)&&a.every((v,i)=>v===samples[i].answer);}
 function answerText(a){if(!validAssignments(a,true))throw new Error('Incomplete classification');return samples.map((s,i)=>s.name+'：'+labels[a[i]]).join('；');}
 function model(light=true,carbon=true,water=true,medium='soil'){
  if([light,carbon,water].some(v=>typeof v!=='boolean')||!['soil','solution'].includes(medium))throw new Error('Invalid conditions');
  const missing=[!light&&'光能',!carbon&&'二氧化碳',!water&&'水'].filter(Boolean);
  return {light,carbon,water,medium,missing,canProduce:missing.length===0,inputs:['二氧化碳','水'],outputs:['有机物','氧气'],energy:'光能 → 有机物中贮存的化学能',place:'叶绿体'};
 }
 const questions=[
  {kind:'choice',skill:'先判断：叶片里的糖从哪里来',title:'一株正常生长的绿色植物，主要怎样获得自身需要的糖类？',context:'讨论普通绿色植物，光照、温度、水和无机盐等条件适宜。这里的“糖类”指有机物，不是把水、无机盐也叫作糖。',options:['主要由根把土壤中的现成糖类吸上来','利用光能，以二氧化碳和水为原料制造有机物','只要照到光就行，不需要物质原料'],answer:1,hint:'建房要材料，也要施工所需的能量。植物制造糖，哪些是材料，哪些提供能量？',explanation:'选B。光合作用利用光能，以二氧化碳和水为原料，在叶绿体中制造贮存能量的有机物，并释放氧气。水、无机盐对生长很重要，但不能把根吸收它们，等同于根直接吸收现成糖类。打开下面的模型，试着拿走一个条件。'},
  {kind:'classify',skill:'动手分类：只看光合作用的原料与产物',title:'把4张物质卡分到“原料”或“产物”。',context:'本题只讨论光合作用，不把呼吸作用混进来。光是能量来源，叶绿体是场所，它们不属于这4张物质卡。',source:'四张卡：二氧化碳、氧气、水、有机物（如糖类）。',hint:'用一句话回想：植物利用光能，把什么制造成什么？箭头左侧是原料，右侧是产物。',explanation:'A二氧化碳、C水是原料；B氧气、D有机物是产物。光能不是一种被吸收的“糖原料”，叶绿体也不是制造一次就被消耗掉的原料。'},
  {kind:'open',skill:'辨错解释：无土，等于不需要水和无机盐吗',title:'“水培不用土，说明水和无机盐对植物不重要。”哪里错了？',context:'一株水培生菜长出了新叶。题目给定：营养液含适量无机盐和水，根部有氧气，光照、二氧化碳和温度等条件适宜。请区分“没有土”与“没有生长所需的物质”。',hint:'先看营养液提供了什么。生菜自己造有机物，就能凭空造出所需的水和无机盐吗？',reference:'这句话错把“无土”当成“无水、无无机盐”。营养液仍提供水和无机盐：水是光合作用的原料之一，无机盐也是正常生长所需的物质。土壤常提供水、无机盐和支持，水培以其他方式满足这些需要。植物自己制造有机物，不代表不需要从环境获取其他物质，也不是靠营养液直接供应现成糖类。',checks:['指出水培没有土，但仍有水和无机盐，不等于没有营养供给。','说明水是光合作用的原料之一，无机盐对正常生长也重要；没有把无机盐直接说成糖。']},
  {kind:'choice',skill:'区分角色：能量、原料与场所',title:'给“光能”和“叶绿体”贴标签，哪一组准确？',context:'仍以正常绿色植物的光合作用为例。要说清能量从哪里来、转成什么，以及主要在哪个结构内发生。',options:['光能提供能量，并转化为有机物中贮存的化学能；叶绿体是场所','光能就是制造糖的物质原料；叶绿体被消耗后变成糖','氧气提供制造糖的主要原料；光只负责让叶片看起来更亮'],answer:0,hint:'能量的来源和物质的来源是两件事。叶绿体像进行制造的场所，不是做一次就用完的材料。',explanation:'选A。原料是二氧化碳和水；光提供能量；绿色植物的光合作用在叶绿体中进行。形成的有机物贮存化学能。说“光变成了糖”会把能量转化与物质合成混为一谈。'},
  {kind:'open',skill:'新情境：已经存在，不等于正在制造',title:'关灯后仍检测到淀粉，能证明“没有光也在持续进行光合作用”吗？',context:'这株植物白天接受过光照。刚关灯几分钟，叶片里仍检测到了淀粉；没有提供关灯前后的含量变化或新形成淀粉的证据。小林据此说：“没光也能一直靠光合作用造淀粉。”请判断这条证据是否足够，并解释淀粉可能从哪里来。',hint:'冰箱里还有昨天做的食物，能证明此刻正在做饭吗？把“原来就有”与“这段时间新形成”分开。',reference:'证据不够。淀粉是有机物，可以由白天光合作用形成的糖类转化、储存而来；关灯不会让原有淀粉立刻消失。检测到“仍有淀粉”，不等于证明它在黑暗中是新制造的，更不能证明没有光也能持续进行光合作用。要研究一段时间是否新形成淀粉，还需区分原有储存和新形成的部分，单凭有无不能判断。',checks:['明确当前证据不足，没有把“存在”直接等同于“此刻生成”。','提出白天形成并储存的有机物这一合理来源，没有断言全部淀粉都必然在刚才生成。','说明缺少新形成部分的证据；没有推成“关灯就立刻没有淀粉”或“植物马上死亡”。']}
 ];
 root.PhotosynthesisLesson={title,samples,labels,validAssignments,checkAssignments,answerText,model,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.PhotosynthesisLesson;
})(typeof window!=='undefined'?window:globalThis);
