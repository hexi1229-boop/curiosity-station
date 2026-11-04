'use strict';
(function(root){
  const title='没有名字的人，怎么走进历史？';
  const tasks=[
    {title:'先封存：没有姓名，还能写进历史吗？',context:'面对没有可读姓名的商代聚落，先留下自己的证据判断。'},
    {title:'考古方舱：遗物能把话说到哪一步？',context:'查看关帝庙遗址的房址、工具、陶窑与人骨痕迹，区分观察和推断。'},
    {title:'三层叙事台：事实、推断还是想象？',context:'把同一座村落的描述拆成发掘事实、谨慎推断与场景想象。'},
    {title:'新村落审稿：替没有姓名的人守住证据',context:'换到教学模拟遗址，独立审核展签并留下自己的解释。'}
  ];
  const initialOptions=[
    {id:'silent',text:'没有留下姓名和文字，就无法把他们写进历史。'},
    {id:'complete',text:'只要挖到几件遗物，就能还原每个人一天里的所有细节。'},
    {id:'boundary',text:'遗迹能支持一部分生活判断，但姓名、情感和具体故事常常仍不知道。'},
    {id:'picture',text:'现代复原图画得越真实，就越接近当时的照片。'}
  ];
  const spots=[
    {
      id:'hearth',mark:'01',name:'房址与灶坑',guided:true,
      find:'发掘出半地穴式房址；一处屋内地面有被火烧红的灶坑。',
      support:'可以支持这里存在居住和用火活动。',
      boundary:'不能只凭一座房址确定住了几个人、他们是什么关系，也不能知道某天晚饭吃了什么。'
    },
    {
      id:'sickles',mark:'02',name:'石镰与蚌镰',
      find:'遗址出土磨制石镰、石刀，以及刃部带锯齿的蚌镰。',
      options:[
        {id:'crop',text:'这些工具支持这里发生过切割、收割类劳动；具体收什么，还要找植物遗存等证据。'},
        {id:'rice',text:'这些工具证明全村人每天都吃水稻。'},
        {id:'owner',text:'这些工具能告诉我们使用者的姓名和年龄。'}
      ],expected:'crop'
    },
    {
      id:'kiln',mark:'03',name:'陶窑与陶器',
      find:'聚落中发现陶窑，并出土鬲、簋、罐、盆、甑、豆等陶器。',
      options:[
        {id:'all',text:'每位居民一定都是专职陶工。'},
        {id:'production',text:'这里存在制陶和使用陶器的活动；谁制作、怎样分工，还需更多证据。'},
        {id:'palace',text:'陶器种类多，说明这里一定是王宫。'}
      ],expected:'production'
    },
    {
      id:'knees',mark:'04',name:'墓葬与膝关节',
      find:'公众考古文章报道，部分墓葬人骨的膝关节存在异常磨损。',
      options:[
        {id:'job',text:'仅凭磨损，就能确定每个人分别在舂米、制陶还是纺织。'},
        {id:'lazy',text:'膝关节磨损证明他们不愿站立劳动。'},
        {id:'repeated',text:'这些磨损可能与长期反复屈膝或跪坐活动有关；具体做什么，不能只凭关节确定。'}
      ],expected:'repeated'
    }
  ];
  const spotHints=[
    '先把“发掘时看见的东西”和“我们据此想到的生活”分开。',
    '一件工具通常能提示用途，却很少直接写出使用者姓名、每天食谱或全村职业。',
    '身体磨损能留下长期活动痕迹，但从动作到具体工作之间仍需要别的证据。'
  ];
  const layers=[
    {id:'fact',name:'发掘事实',short:'现场实际发现或检测到什么'},
    {id:'inference',name:'谨慎推断',short:'由多项痕迹支持的解释'},
    {id:'scene',name:'场景想象',short:'为了看得见而补出的细节'}
  ];
  const layerCards=[
    {id:'house',text:'发掘出半地穴房址，屋内地面有被火烧红的灶坑。',expected:'fact'},
    {id:'cutting',text:'石镰、石刀和蚌镰支持这里发生过切割、收割类劳动。',expected:'inference'},
    {id:'supper',text:'黄昏时，一家五口围着灶坑喝刚煮好的粟米粥。',expected:'scene'},
    {id:'wear',text:'部分墓主人膝关节出现异常磨损。',expected:'fact'},
    {id:'kneeling',text:'这些磨损可能支持长期反复屈膝或跪坐活动。',expected:'inference'}
  ];
  const layerHints=[
    '带有“发掘出、检测到、出土”的句子，通常在报告现场所见。',
    '“说明、支持、可能”是在把遗物转成解释，强弱要和证据匹配。',
    '具体姓名、人数、某个黄昏和一顿饭，如果材料没有留下，就是复原者补出的场景。'
  ];
  const transfer={
    label:'独立迁移 · 教学模拟遗址，不是真实考古报告',
    place:'河湾聚落 · 三个互不相连的发掘记录格',
    records:[
      {id:'grain',title:'储藏坑',text:'坑底集中发现经鉴定的炭化粟籽。'},
      {id:'spindle',title:'房址地面',text:'出土一枚陶纺轮；周围没有可读文字。'},
      {id:'fish',title:'灰坑',text:'筛选出鱼骨；无法确定由谁食用。'}
    ],
    boundary:'这是为了检验迁移而编写的教学材料，不能当作某座真实遗址的发现。'
  };
  const ratings=[
    {id:'direct',text:'记录直接支持'},
    {id:'cautious',text:'可以谨慎推测'},
    {id:'cannot',text:'现有材料不能证明'}
  ];
  const claims=[
    {id:'finds',text:'三个记录格分别发现了炭化粟籽、陶纺轮和鱼骨。',expected:'direct'},
    {id:'life',text:'这些材料分别支持聚落中可能存在粟类利用、纺织和鱼类资源利用活动。',expected:'cautious'},
    {id:'bundle',text:'这三格材料来自同一个家庭的一天：他们储存粟、纺线并吃鱼。',expected:'cannot'}
  ];
  function gradeInitial(id){return id==='boundary';}
  function gradeSpots(values){
    const answers=values&&typeof values==='object'?values:{};
    const detail=spots.filter(spot=>!spot.guided).map(spot=>({id:spot.id,expected:spot.expected,actual:answers[spot.id]||null,correct:answers[spot.id]===spot.expected}));
    return {detail,correct:detail.every(item=>item.correct),count:detail.filter(item=>item.correct).length,total:detail.length};
  }
  function gradeLayers(values){
    const answers=values&&typeof values==='object'?values:{};
    const detail=layerCards.map(card=>({id:card.id,expected:card.expected,actual:answers[card.id]||null,correct:answers[card.id]===card.expected}));
    return {detail,correct:detail.every(item=>item.correct),count:detail.filter(item=>item.correct).length,total:detail.length};
  }
  function gradeClaims(values){
    const answers=values&&typeof values==='object'?values:{};
    const detail=claims.map(claim=>({id:claim.id,expected:claim.expected,actual:answers[claim.id]||null,correct:answers[claim.id]===claim.expected}));
    return {detail,correct:detail.every(item=>item.correct),count:detail.filter(item=>item.correct).length,total:detail.length};
  }
  const lesson={
    id:'guandimiao',title,tasks,initialOptions,spots,spotHints,layers,layerCards,layerHints,
    transfer,ratings,claims,gradeInitial,gradeSpots,gradeLayers,gradeClaims
  };
  root.GuandimiaoLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
