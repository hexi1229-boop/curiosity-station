'use strict';
(function(root){
  const title='没有国名牌的都城：二里头到底是不是夏都？';
  const tasks=[
    {title:'两把尺：先封存第一判断',context:'分别判断二里头是什么规模的城市，以及它能否被确认属于夏。'},
    {title:'城市扫描：拼出中心性大型都邑',context:'勘察道路、宫城、作坊和高等级墓葬，区分发现、支持与边界。'},
    {title:'标签审稿：把结论放到正确刻度',context:'用“确定、有力支持、尚未锁定”审核博物馆标签并修订首答。'},
    {title:'证据升级：什么才能推进身份判断',context:'以殷墟为参照，在虚构新证据中检验同一时代且能读懂的文字、出土背景和系统互证。'}
  ];
  const cityOptions=[
    {id:'village',text:'普通村落'},
    {id:'center',text:'区域中心'},
    {id:'capital-city',text:'当时最高等级的中心性大型都邑'},
    {id:'unsure',text:'现在还判断不了'}
  ];
  const identityOptions=[
    {id:'confirmed-xia',text:'已确认是夏都'},
    {id:'likely-xia',text:'有较多线索指向夏，但仍待确认'},
    {id:'not-enough',text:'目前材料不足，暂不判断'},
    {id:'not-xia',text:'更倾向不是夏都'}
  ];
  const hotspots=[
    {id:'roads',label:'井字形道路',x:27,y:60,title:'道路把城市分成网格',example:true,found:'发现纵横交错的主干道路，形成“井”字形路网。',supports:'支持这里经过统一规划，城市空间有明确分区。',cannot:'道路不会自己写出王朝和都城名称。'},
    {id:'palace',label:'宫城与宫室群',x:52,y:34,title:'10.8万平方米的宫城',found:'遗址中心发现宫城和成组的大型夯土宫室建筑。',supports:'支持这里存在长期组织工程和集中权力的核心区域。',cannot:'考古学名称“宫城”不等于已读出某位夏王的宫殿。',judgments:[{id:'bounded',text:'支持大型工程由中心组织；不能证明某位夏王住在这里。',correct:true},{id:'overclaim',text:'已经直接证明某位夏王住在这座宫殿。',correct:false}]},
    {id:'bronze',label:'铸铜作坊',x:76,y:69,title:'围墙内的铸铜作坊',found:'宫城附近发现用围墙圈起的铸铜作坊及生产遗迹。',supports:'支持珍贵资源、专业技术和生产活动受到集中管理。',cannot:'青铜礼器能显示等级与礼制，不能单独给王朝署名。',judgments:[{id:'bounded',text:'支持高端生产受到集中管理；不能只凭青铜器认定王朝。',correct:true},{id:'overclaim',text:'只要能铸青铜器，就能确认这一定是夏都。',correct:false}]},
    {id:'turquoise',label:'绿松石作坊',x:74,y:38,title:'专业化绿松石作坊',found:'宫城附近发现用围墙圈起的绿松石器作坊。',supports:'与铸铜作坊共同显示专业分工和高等级物品生产。',cannot:'绿松石材料或龙形象不能直接证明某个民族图腾。',judgments:[{id:'bounded',text:'支持专业分工和高等级生产；不能直接证明某个民族图腾。',correct:true},{id:'overclaim',text:'出现绿松石龙，已经证明夏人的图腾就是龙。',correct:false}]},
    {id:'tomb',label:'高等级墓葬',x:40,y:77,title:'墓葬与绿松石龙',found:'高等级墓葬中发现青铜礼器和大型绿松石龙形器等遗物。',supports:'支持社会等级分化、仪式活动和高等级身份已经形成。',cannot:'随葬品没有组成与这座城市同一时代、能读出“夏”或夏王名的文字。',judgments:[{id:'bounded',text:'支持社会等级和仪式活动；不能读出墓主人就是哪位夏王。',correct:true},{id:'overclaim',text:'随葬品珍贵，足以确认墓主人是一位夏王。',correct:false}]}
  ];
  const scanOptions=[
    {id:'planned-capital',text:'多种证据共同支持：这里是规划严密、权力集中、分工复杂的中心性大型都邑。'},
    {id:'named-xia',text:'发现宫城和绿松石龙，所以这里已经被证明是夏都斟鄩。'},
    {id:'large-village',text:'只要没有可读国名，它就仍然只能算大型村落。'},
    {id:'factory',text:'有两类作坊，所以这里主要是一座手工业工厂。'}
  ];
  const labelClaims=[
    {id:'facts',text:'遗址发现井字形道路网、宫城、专业作坊，以及随葬品差异明显的墓葬。',correct:'certain'},
    {id:'city',text:'这些发现有力支持：二里头是规划严密、权力集中、分工复杂的中心性大型都邑。',correct:'supported'},
    {id:'xia',text:'结合年代、位置、聚落规模和后世文献，国内许多研究者认为它很可能是夏晚期核心都邑或都城。',correct:'supported'},
    {id:'zhenxun',text:'二里头就是文献中的斟鄩，某位夏王曾住在一号宫殿。',correct:'unlocked'}
  ];
  const ratingOptions=[
    {id:'certain',text:'确定'},
    {id:'supported',text:'有力支持'},
    {id:'unlocked',text:'尚未锁定'}
  ];
  const museumOptions=[
    {id:'absolute',text:'夏都斟鄩。考古已经彻底证明历代夏王在此居住。'},
    {id:'careful',text:'道路、宫城、作坊与墓葬等发现，有力支持二里头是中心性大型都邑；许多研究者认为它很可能与夏晚期有关，但还缺能直接读出国名、城名或王名的同一时代文字。'},
    {id:'empty',text:'没有发现可读国名，所以这里是不是城市也无法判断。'}
  ];
  const upgrades=[
    {id:'market',title:'旧货市场出现一件刻“夏”的铜器',tag:'单件 · 没有发掘记录',facts:'从旧货市场购得；不知道原本埋在哪里、和哪些遗迹同层；器上有一个像“夏”的字。',strength:'几乎不能推进',text:'它没有可靠出土地点和土层记录，字也可能后刻或伪刻。可以继续检测和追查，不能直接给遗址定名。'},
    {id:'single',title:'宫城土层出土一片带单个刻符的陶片',tag:'单件 · 发掘位置清楚',facts:'由考古队从宫城土层中发掘；只有一个刻符；这个符号目前不能稳定读懂。',strength:'增加一条真实线索',text:'可靠出土背景让它成为真实材料，但一个不能稳定读懂的符号仍不能确认国名、王名。'},
    {id:'system',title:'多处土层出土一批能重复读懂的文字',tag:'多件 · 多处发掘位置清楚',facts:'来自宫城、墓葬等多处未被扰动的同一时代土层；多件材料反复出现同一国名、王名和事务。',strength:'大幅推进身份判断',text:'若文字能重复读懂、年代与出土位置可靠，又和宫城、墓葬、作坊系统相合，才会大幅推进身份判断。'}
  ];
  function gradeScan(id){return id==='planned-capital';}
  function gradeRatings(ratings){return labelClaims.every(item=>ratings&&ratings[item.id]===item.correct);}
  function gradeMuseum(id){return id==='careful';}
  function gradeUpgrade(id){return id==='system';}
  const lesson={id:'erlitou',title,tasks,cityOptions,identityOptions,hotspots,scanOptions,labelClaims,ratingOptions,museumOptions,upgrades,gradeScan,gradeRatings,gradeMuseum,gradeUpgrade};
  root.ErlitouLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
