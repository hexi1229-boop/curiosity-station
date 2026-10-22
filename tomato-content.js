/* Hierarchy models distinguish composition and function, not physical size. */
(function(root){
  'use strict';
  const title='一颗番茄，是组织还是器官？';
  const plantOrder=['细胞','组织','器官','个体'];
  const humanOrder=['细胞','组织','器官','系统','个体'];
  const questions=[
    {kind:'choice',skill:'先作出自己的判断',title:'这一整颗番茄果实，属于哪个结构层次？',context:'资料：番茄果实中有起保护作用的组织、主要储存营养物质的组织，以及运输物质的组织。它们按一定结构组合、相互配合。判断的是整个果实，不是整株番茄。',options:['细胞，因为它是一个圆圆的东西','组织，因为所有部分都由细胞构成','器官，因为不同组织按一定结构组合并共同完成相应功能'],answer:2,hint:'一个细胞、相似细胞形成的组织、不同组织协作形成的器官，哪个符合题目提供的组成？',explanation:'番茄果实属于器官。它包含保护、营养、输导等不同组织，这些组织有序组合、相互配合。由细胞构成并不能说明它只是一种组织；果实也不等于整株番茄这个个体。'},
    {kind:'open',skill:'说清两种材料的区别',title:'都由细胞构成，为什么这一层保护组织和整颗果实不是同一层次？',context:'材料A：果皮表面的一层保护组织，由形态、结构和功能相近的细胞组成，主要起保护作用。材料B：整个番茄果实包含保护、营养、输导等不同组织，按一定结构组合并相互配合。用组成和功能解释区别，不只比较大小。',hint:'不要停在“它们都有细胞”。再看：是一类细胞形成的组织，还是不同组织组成的整体？',reference:'这一层保护组织由形态、结构和功能相近的细胞组成，属于组织。整颗果实由不同组织按一定结构组合，各组织相互配合，属于器官。组织和器官最终都由细胞构成，区别要看它们怎样组成、怎样工作，而不是只看大小。',checks:['说清这一层保护组织是相近细胞形成的组织。','说明果实由不同组织有序组合并相互配合；不只用大小或细胞数量分类。']},
    {kind:'choice',skill:'换成叶片，找出错误依据',title:'“叶片又薄又平，所以只是一种组织。”这句话哪里不对？',context:'资料：一片叶里有起保护作用的表皮组织、进行光合作用的叶肉组织，以及运输物质的输导组织等。不同组织相互配合。',options:['应看组成与功能：不同组织相互配合构成叶这个器官','只要长得扁平，里面的所有细胞就属于同一种组织','叶比一个细胞大，所以它一定是一个完整的植物个体'],answer:0,hint:'薄厚、形状能告诉你里面是不是只有一种组织吗？题目给了哪些组成证据？',explanation:'叶片由不同组织按一定结构组合并相互配合，是器官。外形薄或平不是组织的定义；体积大也不能直接说明它是一个完整的植物个体。'},
    {kind:'order',skill:'亲手排出层次关系',title:'从细胞到完整的番茄植株，怎样排列？',context:'排列绿色开花植物的四个结构层次：细胞、组织、器官、个体。箭头表示从较低结构层次到较高结构层次，不是按体积大小排序。用上移、下移按钮调整后提交。',initial:['器官','细胞','个体','组织'],hint:'先找基本单位，再看相近细胞形成什么、不同组织形成什么，最后才是完整植株。',explanation:'正确顺序是细胞 → 组织 → 器官 → 个体。以绿色开花植物为例，根、茎、叶、花、果实、种子等器官共同构成植物个体；这里不套用人体的“系统”层次。'},
    {kind:'open',skill:'把方法用到人体',title:'胃和消化系统，分别是哪一层？人体比番茄植株多了哪一层？',context:'资料：胃由上皮组织、肌肉组织等不同组织有序构成。胃与食管、小肠等器官共同参与食物的消化等过程，属于消化系统。请判断胃与消化系统的层次并给依据，再比较人体和绿色开花植物的结构层次。',hint:'不同组织组成一个整体，与多个器官一起完成一类生理功能，这两种组合是同一层吗？',reference:'胃由不同组织有序构成，属于器官。消化系统由胃、食管、小肠等多个器官组成，各器官配合完成相关生理功能，属于系统。人体的层次为细胞→组织→器官→系统→个体；绿色开花植物为细胞→组织→器官→个体，人体在器官与个体之间还有系统这一层。',checks:['胃是器官，消化系统是系统；依据分别是不同组织组成、多个器官协作。','人体在器官与个体之间有系统层次，绿色开花植物的这条层次链不列系统。']}
  ];
  const levels=[
    {id:'plant',label:'整株番茄',rank:'个体',description:'根、茎、叶、花、果实等器官相互联系、协同工作，构成完整的番茄植株。一个果实只是其中的一个器官。'},
    {id:'fruit',label:'一颗果实',rank:'器官',description:'保护、营养、输导等不同组织按一定结构组合、相互配合。不是把几种组织随便堆在一起。'},
    {id:'tissue',label:'一种组织',rank:'组织',description:'这里看果皮表面的一层保护组织。形态、结构和功能相近的细胞组合在一起，主要起保护作用。'},
    {id:'cell',label:'一个细胞',rank:'细胞',description:'从这层保护组织里看一个细胞。细胞是生物体结构和功能的基本单位；图只示意边界和内部，不展示全部细胞结构。'}
  ];
  const tissues=[
    {id:'protect',label:'保护组织',description:'主要起保护作用。这张图把果实表面的保护区域加粗，便于看清；实际并不是这么厚。'},
    {id:'nutrition',label:'营养组织',description:'果肉中的营养组织主要储存营养物质。这里不能把“能吃的部分”直接当作组织定义。'},
    {id:'transport',label:'输导组织',description:'输导组织运输水、无机盐和有机物等，与其他组织相互配合。图中的线只是简化示意。'}
  ];
  function validOrder(order){return Array.isArray(order)&&order.length===4&&new Set(order).size===4&&order.every(x=>plantOrder.includes(x));}
  function move(order,index,direction){if(!validOrder(order)||!Number.isInteger(index)||index<0||index>=4||![-1,1].includes(direction))throw new Error('Invalid layer order');const next=order.slice(),target=index+direction;if(target>=0&&target<4)[next[index],next[target]]=[next[target],next[index]];return next;}
  function correctOrder(order){return validOrder(order)&&order.every((x,i)=>x===plantOrder[i]);}
  root.TomatoLesson={title,questions,plantOrder,humanOrder,levels,tissues,validOrder,move,correctOrder};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.TomatoLesson;
})(typeof window!=='undefined'?window:globalThis);
