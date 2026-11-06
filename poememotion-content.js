'use strict';
(function(root){
  const tasks=[
    {title:'先读完整首曲，留下第一判断',context:'不先给注释和情感标签；保存整体感受、两处原文证据与它们的关系。'},
    {title:'遮住结尾，检查自己能确定到哪一步',context:'把“断肠人在天涯”暂时拿走，区分景物带来的倾向与原文能够确认的结论。'},
    {title:'换一首诗，独立审查片面结论',context:'完整阅读《次北固山下》，用两类作用不同的证据判断“整首从头到尾都很悲伤”是否充分。'}
  ];
  const main={
    title:'天净沙·秋思',author:'马致远',
    lines:['枯藤老树昏鸦，','小桥流水人家，','古道西风瘦马。','夕阳西下，','断肠人在天涯。'],
    evidence:[
      {id:'withered',text:'枯藤老树昏鸦',role:'衰败、迟暮的词群',group:'scene'},
      {id:'home',text:'小桥流水人家',role:'安稳、有人居住的生活画面',group:'home'},
      {id:'road',text:'古道西风瘦马',role:'旅途、秋风与疲惫的马',group:'traveler'},
      {id:'sunset',text:'夕阳西下',role:'一天将尽的时间',group:'time'},
      {id:'speaker',text:'断肠人在天涯',role:'说出人物感受和远离家乡的处境',group:'speaker'}
    ],
    annotations:[
      {id:'main-tianjingsha',text:'天净沙',kind:'教材注释',note:'曲牌名；它说明曲调格式，不是诗中一处景物。'},
      {id:'main-si',text:'秋思',kind:'本站解释',note:'题目中的“思”指秋日触发的思绪，不只等于“想念”一个词。'},
      {id:'main-hunya',text:'昏鸦',kind:'教材注释',note:'黄昏时将要回巢的乌鸦。“昏”交代时间，也让画面走向日暮。'},
      {id:'main-renjia',text:'人家',kind:'本站解释',note:'有人居住的房舍。它本身可以温暖安定；放回全曲，才看它与旅人处境怎样相互映照。'},
      {id:'main-xifeng',text:'西风',kind:'本站解释',note:'秋风。古诗词中的景物不能脱离上下文做固定“情绪密码”。'},
      {id:'main-duanchang',text:'断肠',kind:'教材注释',note:'形容悲伤到极点。这里是人物感受，不是把前面每一个景物都变成“悲景”。'},
      {id:'main-tianya',text:'天涯',kind:'教材注释',note:'天边；这里指远离家乡的地方。'}
    ]
  };
  const toneOptions=[
    {id:'sorrow',text:'羁旅中的悲凉与思乡更突出'},
    {id:'mixed',text:'既有安稳人家，也有旅人的孤独与悲凉'},
    {id:'calm',text:'主要是平静地记录一幅秋景'},
    {id:'unsure',text:'我暂时不确定，先留下证据'}
  ];
  const relationOptions=[
    {id:'all-sad',text:'前面每一个景物本身都只表示悲伤'},
    {id:'contrast',text:'“人家”的安稳与“天涯”旅人的处境放在一起，形成有家与离家的对照'},
    {id:'wind-code',text:'只要诗中出现“西风”，就一定是在写思乡'},
    {id:'unrelated',text:'景物和最后的人物没有关系，只是五句并排'}
  ];
  const whatIfOptions=[
    {id:'can',text:'能确定：前四行已经直接说明远离家乡'},
    {id:'cannot',text:'不能确定：前四行能形成情绪倾向，却没有直接交代人物身份和处境'},
    {id:'none',text:'完全不能感到任何情绪：前四行只是景物清单'}
  ];
  const whatIfReasons=[
    {id:'no-speaker',text:'前四行没有直接写出人物是谁、身在何处'},
    {id:'sad-code',text:'“枯藤”和“西风”本来就只能表示思乡'},
    {id:'home-proof',text:'只要出现“人家”，就能证明人物一定想家'}
  ];
  const transfer={
    title:'次北固山下',author:'王湾',
    lines:['客路青山外，行舟绿水前。','潮平两岸阔，风正一帆悬。','海日生残夜，江春入旧年。','乡书何处达？归雁洛阳边。'],
    evidence:[
      {id:'route',text:'客路青山外，行舟绿水前',group:'journey'},
      {id:'wide',text:'潮平两岸阔，风正一帆悬',group:'open'},
      {id:'renewal',text:'海日生残夜，江春入旧年',group:'renewal'},
      {id:'letter',text:'乡书何处达？归雁洛阳边',group:'homesick'}
    ],
    annotations:[
      {id:'transfer-ci',text:'次',kind:'教材注释',note:'停宿。题目说诗人停宿在北固山下。'},
      {id:'transfer-kelu',text:'客路',kind:'教材注释',note:'旅人前行的路。“客”点出诗人在外行旅。'},
      {id:'transfer-chaoping',text:'潮平两岸阔',kind:'本站解释',note:'潮水涨满，水面与两岸显得开阔。这里的“阔”写眼前空间。'},
      {id:'transfer-fengzheng',text:'风正一帆悬',kind:'本站解释',note:'顺风吹来，船帆端正高悬。画面不是狂风险浪，而是平稳前行。'},
      {id:'transfer-canye',text:'残夜',kind:'教材注释',note:'夜将尽未尽。海日从残夜中升起，写新旧交替。'},
      {id:'transfer-jiangchun',text:'江春入旧年',kind:'本站解释',note:'旧年还未过去，江南已经显出春意。“入”让新春仿佛主动进入旧年。'},
      {id:'transfer-xiangshu',text:'乡书',kind:'教材注释',note:'寄给家乡的书信。'},
      {id:'transfer-guiyan',text:'归雁洛阳边',kind:'教材注释＋本站解释',note:'希望北归的大雁把家书捎到洛阳一带。尾联直接显出旅人的思乡。'}
    ],
    claims:[
      {id:'fully',text:'充分：尾联思乡，所以前面所有景象也只能是悲伤'},
      {id:'partly',text:'只说对一部分：尾联有思乡，中间还有开阔与新生的景象'},
      {id:'reject',text:'完全错误：有开阔景象就说明诗人没有思乡'},
      {id:'unsure',text:'我暂时不能判断，先留下证据'}
    ],
    relations:[
      {id:'all-sad',text:'所有景象都被尾联改成同一种悲伤'},
      {id:'coexist',text:'开阔、更新的眼前景象与旅人的思乡同时存在，情感有层次'},
      {id:'all-hope',text:'中间两联明亮，所以尾联的思乡可以忽略'},
      {id:'word-code',text:'看到“归雁”就能直接给整首贴上固定标签'}
    ],
    hints:[
      '先把中间两联和最后一联分开看：它们分别写了什么？',
      '“阔、悬、生、入”让画面怎样变化？“乡书、归雁、洛阳”又暴露了谁的处境？'
    ]
  };
  const allowed={
    tone:new Set(toneOptions.map(item=>item.id)),
    mainEvidence:new Set(main.evidence.map(item=>item.id)),
    relation:new Set(relationOptions.map(item=>item.id)),
    whatIf:new Set(whatIfOptions.map(item=>item.id)),
    whatIfReason:new Set(whatIfReasons.map(item=>item.id)),
    transferEvidence:new Set(transfer.evidence.map(item=>item.id)),
    transferClaim:new Set(transfer.claims.map(item=>item.id)),
    transferRelation:new Set(transfer.relations.map(item=>item.id)),
    annotation:new Set([...main.annotations,...transfer.annotations].map(item=>item.id))
  };
  const cleanText=(value,max=900)=>typeof value==='string'?value.slice(0,max):'';
  const cleanChoice=(value,set)=>set.has(value)?value:'';
  const cleanList=(value,set,max=8)=>Array.isArray(value)?[...new Set(value.filter(item=>set.has(item)))].slice(0,max):[];
  function meaningful(value,min=8){
    const text=String(value||'').trim();
    const chinese=(text.match(/[\u3400-\u9fff]/g)||[]).length;
    const words=(text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[]).length;
    return chinese>=min||words>=Math.max(4,Math.ceil(min/2));
  }
  function sanitizeState(value={}){
    return {
      coldTone:cleanChoice(value.coldTone,allowed.tone),coldEvidence:cleanList(value.coldEvidence,allowed.mainEvidence,2),coldExplanation:cleanText(value.coldExplanation),coldSaved:!!value.coldSaved,
      annotationViews:cleanList(value.annotationViews,allowed.annotation,20),annotationUses:Array.isArray(value.annotationUses)?[...new Set(value.annotationUses.filter(item=>/^\d+:[\w-]+$/.test(item)&&allowed.annotation.has(item.split(':').slice(1).join(':'))))].slice(0,60):[],lensViews:cleanList(value.lensViews,new Set(['hidden','restored']),2),lensMode:cleanChoice(value.lensMode,new Set(['hidden','restored']))||'hidden',relationChoice:cleanChoice(value.relationChoice,allowed.relation),guidedExplanation:cleanText(value.guidedExplanation),guidedAttempted:!!value.guidedAttempted,guidedDone:!!value.guidedDone,
      whatIfChoice:cleanChoice(value.whatIfChoice,allowed.whatIf),whatIfReason:cleanChoice(value.whatIfReason,allowed.whatIfReason),whatIfExplanation:cleanText(value.whatIfExplanation),whatIfAttempted:!!value.whatIfAttempted,
      transferClaim:cleanChoice(value.transferClaim,allowed.transferClaim),transferEvidence:cleanList(value.transferEvidence,allowed.transferEvidence,2),transferExplanation:cleanText(value.transferExplanation),transferAttempted:!!value.transferAttempted,
      reviewClaim:cleanChoice(value.reviewClaim,allowed.transferClaim),reviewEvidence:cleanList(value.reviewEvidence,allowed.transferEvidence,2),reviewRelation:cleanChoice(value.reviewRelation,allowed.transferRelation),reviewExplanation:cleanText(value.reviewExplanation),revisionDecision:cleanChoice(value.revisionDecision,new Set(['keep','change'])),reviewAttempted:!!value.reviewAttempted,
      hintLevel:Math.max(0,Math.min(transfer.hints.length,Number.isInteger(value.hintLevel)?value.hintLevel:0))
    };
  }
  function gradeGuided(state){return {views:['hidden','restored'].every(id=>(state.lensViews||[]).includes(id)),relation:state.relationChoice==='contrast'};}
  function gradeWhatIf(state){return {boundary:state.whatIfChoice==='cannot',reason:state.whatIfReason==='no-speaker'};}
  function gradeTransfer(state){
    const groups=new Set((state.reviewEvidence||[]).map(id=>transfer.evidence.find(item=>item.id===id)?.group));
    return {
      claim:state.reviewClaim==='partly',
      evidence:(groups.has('open')||groups.has('renewal'))&&groups.has('homesick'),
      relation:state.reviewRelation==='coexist'
    };
  }
  const lesson={
    id:'poememotion',title:'景物都看懂了，诗人的心情从哪里来？',tasks,main,toneOptions,relationOptions,whatIfOptions,whatIfReasons,transfer,
    sanitizeState,meaningful,gradeGuided,gradeWhatIf,gradeTransfer
  };
  root.PoemEmotionLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
