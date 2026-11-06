'use strict';
(function(root){
  const tasks=[
    {title:'先判断：乱世中的变化由什么推动？',context:'在没有提示时封存首答，再打开四座证据台，检查每份材料能证明到哪里。'},
    {title:'搭一张多因素因果网',context:'看过一个示例后撤掉支架，用关系词连接生产、竞争、制度、工程和思想。'},
    {title:'换到秦国：一个人能瞬间改造国家吗？',context:'用不同年代、不同类型的证据审查“商鞅一人使秦国马上统一”的单因果说法。'}
  ];
  const openingOptions=[
    {id:'war',text:'主要是战争造成的，其他变化都是结果'},
    {id:'iron',text:'主要是铁器造成的，一件新工具改变了一切'},
    {id:'multi',text:'生产、竞争、制度、工程和思想彼此推动'},
    {id:'unsure',text:'目前证据还不够，我先保留判断'}
  ];
  const openingClues=[
    {id:'tools',text:'越来越多铁制工具进入农业生产'},
    {id:'kings',text:'周王室控制减弱，诸侯各自扩张力量'},
    {id:'rules',text:'一些国家重新规定军功、土地与地方管理'},
    {id:'ideas',text:'不同思想家提出不同的治理方案'}
  ];
  const stations=[
    {id:'iron-mould',category:'生产',title:'双镰铁范',time:'战国时期实物与考古分布',kind:'考古实物',fact:'中国国家博物馆说明：春秋晚期已经掌握生铁铸造；到战国中期以后，铁器在更广大地区使用。铁范是铸造工具的模具，不是“全国农业产量表”。',can:'支持冶铁、铸造能力发展，以及战国中晚期铁器使用范围扩大。',cannot:'不能单独证明所有地区同时普及、粮食必然增长，或旧制度因一件工具立即瓦解。'},
    {id:'fangsheng',category:'制度',title:'商鞅方升',time:'前344年',kind:'有铭文的标准量器',fact:'上海博物馆资料说明：它是商鞅任大良造时监制的秦国标准量器，也是商鞅变法中统一量制的物质实证。',can:'支持秦国至少有一部分标准化措施真正落实到器物与管理。',cannot:'不能证明商鞅一人设计了秦国以后全部变化，也不能代表各诸侯国都采用同一制度。'},
    {id:'dujiangyan',category:'工程',title:'都江堰',time:'约前256年开始兴建',kind:'工程遗存＋文献',fact:'战国晚期，秦国蜀郡在李冰主持下兴修都江堰；工程经后世持续整修，长期发挥分水、灌溉和防洪作用。',can:'支持当时已经具备组织大型水利工程的能力，工程能为区域生产提供条件。',cannot:'不能证明战争直接制造了工程，也不能把今天看到的全部结构都说成战国时一次建成。'},
    {id:'thinkers',category:'思想',title:'诸子方案',time:'春秋战国时期',kind:'传世文献中的思想主张',fact:'孔子重视德与礼，墨子主张兼爱、非攻，法家重视法令与国家组织。它们是在不同处境中提出的不同治理答案。',can:'支持当时存在多种回应秩序、战争与治理问题的思想方案。',cannot:'不能证明所有主张都同时被普遍接受，也不能推出“战争越多，思想必然越繁荣”。'}
  ];
  const nodes=[
    {id:'tool',category:'生产',text:'铁制工具更广泛使用'},
    {id:'fields',category:'经济',text:'开发土地与生产能力变化'},
    {id:'competition',category:'竞争',text:'王室衰微与诸侯竞争'},
    {id:'reform',category:'制度',text:'各国改革与组织调整'},
    {id:'water',category:'工程',text:'大型水利工程'},
    {id:'problems',category:'社会',text:'秩序与治理问题'},
    {id:'thinkers',category:'思想',text:'不同思想方案'}
  ];
  const relations=[
    {id:'condition',text:'提供条件'},
    {id:'pressure',text:'形成压力'},
    {id:'organize',text:'组织实施'},
    {id:'response',text:'回应问题'}
  ];
  const example={from:'tool',to:'fields',relation:'condition'};
  const allowedEdges=[
    example,
    {from:'competition',to:'reform',relation:'pressure'},
    {from:'reform',to:'fields',relation:'organize'},
    {from:'reform',to:'water',relation:'organize'},
    {from:'water',to:'fields',relation:'condition'},
    {from:'problems',to:'thinkers',relation:'response'},
    {from:'competition',to:'thinkers',relation:'response'}
  ];
  const boundaryOptions=[
    {id:'only-engine',text:'战争是唯一发动机，战争越多变化越快'},
    {id:'one-pressure',text:'战争与竞争形成压力，但只是多种力量之一'},
    {id:'unrelated',text:'战争和制度、生产、思想完全没有关系'}
  ];
  const transferFacts=[
    {id:'reform',time:'前4世纪中期',type:'制度改革',text:'商鞅在秦国推行改革'},
    {id:'measure',time:'前344年',type:'有铭文实物',text:'商鞅方升留下统一量制的物证'},
    {id:'water',time:'约前256年',type:'公共工程',text:'李冰主持兴修都江堰'},
    {id:'unity',time:'前221年',type:'历史结果',text:'秦完成统一'}
  ];
  const transferClaims=[
    {id:'instant',text:'充分：商鞅一人设计一切，秦国马上就统一了'},
    {id:'accumulated',text:'不充分：商鞅重要，但秦国变化跨越多代并由多种力量积累'},
    {id:'war-only',text:'不充分，因为秦国强大只靠战争，与制度和工程无关'},
    {id:'unsure',text:'我暂时不能判断，先留下证据'}
  ];
  const gapOptions=[
    {id:'23',text:'约23年'},
    {id:'88',text:'约88年'},
    {id:'123',text:'约123年'},
    {id:'344',text:'约344年'}
  ];
  const transferRelations=[
    {id:'single',text:'只要有一位改革者，后来的工程和统一都会自动发生'},
    {id:'accumulate',text:'改革是重要节点，生产、制度、工程和多代人继续积累才形成后来结果'},
    {id:'erase',text:'既然后来还有工程，商鞅变法就完全不重要'}
  ];
  const hints=[
    '先比较前344年、约前256年和前221年的先后，不要把一个多世纪压成“马上”。',
    '量器、制度改革、公共工程和统一结果属于不同类型的证据；它们可以共同支持“长期积累”，却不能互相替代。'
  ];
  const choiceSet=list=>new Set(list.map(item=>item.id));
  const sets={
    opening:choiceSet(openingOptions),clues:choiceSet(openingClues),stations:choiceSet(stations),nodes:choiceSet(nodes),relations:choiceSet(relations),boundary:choiceSet(boundaryOptions),transfer:choiceSet(transferClaims),facts:choiceSet(transferFacts),gaps:choiceSet(gapOptions),transferRelations:choiceSet(transferRelations),decisions:new Set(['keep','change'])
  };
  const cleanText=(value,max=900)=>typeof value==='string'?value.slice(0,max):'';
  const cleanChoice=(value,set)=>set.has(value)?value:'';
  const cleanList=(value,set,max)=>Array.isArray(value)?[...new Set(value.filter(item=>set.has(item)))].slice(0,max):[];
  const edgeKey=edge=>edge.from+'>'+edge.to+':'+edge.relation;
  const allowedEdgeKeys=new Set(allowedEdges.map(edgeKey));
  const exampleKey=edgeKey(example);
  function cleanEdges(value){
    const result=[],seen=new Set();
    for(const item of Array.isArray(value)?value:[]){
      if(!item||!sets.nodes.has(item.from)||!sets.nodes.has(item.to)||!sets.relations.has(item.relation))continue;
      const edge={from:item.from,to:item.to,relation:item.relation},key=edgeKey(edge);
      if(seen.has(key))continue;seen.add(key);result.push(edge);
      if(result.length===10)break;
    }
    return result;
  }
  function meaningful(value,min=8){return (String(value||'').match(/[\u3400-\u9fff]/g)||[]).length>=min;}
  function sanitizeState(value={}){
    return {
      openingChoice:cleanChoice(value.openingChoice,sets.opening),openingEvidence:cleanList(value.openingEvidence,sets.clues,2),openingExplanation:cleanText(value.openingExplanation),openingSaved:!!value.openingSaved,
      stationViews:cleanList(value.stationViews,sets.stations,stations.length),reviewChoice:cleanChoice(value.reviewChoice,sets.opening),reviewExplanation:cleanText(value.reviewExplanation),reviewAttempted:!!value.reviewAttempted,
      edgeFrom:cleanChoice(value.edgeFrom,sets.nodes),edgeTo:cleanChoice(value.edgeTo,sets.nodes),edgeRelation:cleanChoice(value.edgeRelation,sets.relations),edges:cleanEdges(value.edges),networkExplanation:cleanText(value.networkExplanation),boundaryChoice:cleanChoice(value.boundaryChoice,sets.boundary),networkAttempted:!!value.networkAttempted,
      transferClaim:cleanChoice(value.transferClaim,sets.transfer),transferEvidence:cleanList(value.transferEvidence,sets.facts,2),transferExplanation:cleanText(value.transferExplanation),transferSaved:!!value.transferSaved,
      reviewTransferClaim:cleanChoice(value.reviewTransferClaim,sets.transfer),reviewTransferEvidence:cleanList(value.reviewTransferEvidence,sets.facts,2),gapChoice:cleanChoice(value.gapChoice,sets.gaps),transferRelation:cleanChoice(value.transferRelation,sets.transferRelations),reviewTransferExplanation:cleanText(value.reviewTransferExplanation),revisionDecision:cleanChoice(value.revisionDecision,sets.decisions),hintLevel:Math.max(0,Math.min(hints.length,Number.isInteger(value.hintLevel)?value.hintLevel:0)),transferReviewAttempted:!!value.transferReviewAttempted
    };
  }
  function gradeOpening(state){return {stations:stations.every(item=>(state.stationViews||[]).includes(item.id)),claim:state.reviewChoice==='multi'};}
  function gradeNetwork(state){
    const submitted=(state.edges||[]).filter(edge=>edgeKey(edge)!==exampleKey);
    const valid=submitted.filter(edge=>allowedEdgeKeys.has(edgeKey(edge)));
    const categories=new Set(valid.flatMap(edge=>[edge.from,edge.to]).map(id=>nodes.find(node=>node.id===id)?.category).filter(Boolean));
    return {validity:submitted.length===valid.length,edges:valid.length>=3,categories:categories.size>=3,boundary:state.boundaryChoice==='one-pressure'};
  }
  function gradeTransfer(state){
    const chosen=(state.reviewTransferEvidence||[]).map(id=>transferFacts.find(item=>item.id===id)).filter(Boolean);
    const before=chosen.some(item=>item.id==='reform'||item.id==='measure');
    const later=chosen.some(item=>item.id==='water'||item.id==='unity');
    return {claim:state.reviewTransferClaim==='accumulated',evidence:chosen.length===2&&new Set(chosen.map(item=>item.type)).size===2&&before&&later,gap:state.gapChoice==='123',relation:state.transferRelation==='accumulate'};
  }
  const lesson={id:'springautumn',title:'乱世为什么反而出现大变化？',tasks,openingOptions,openingClues,stations,nodes,relations,example,allowedEdges,boundaryOptions,transferFacts,transferClaims,gapOptions,transferRelations,hints,edgeKey,allowedEdgeKeys,sanitizeState,meaningful,gradeOpening,gradeNetwork,gradeTransfer};
  root.SpringAutumnLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
