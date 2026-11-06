'use strict';
(function(root){
  const tasks=[
    {title:'先读完整篇，再留下第一判断',context:'不提供逐句翻译；先判断主旨、选择两处证据，并记下一个没有完全懂的词。'},
    {title:'用结构线索检查首答',context:'看一个短例子，再回到原文检查问题、改动、结果和转折；只解决真正阻塞理解的词。'},
    {title:'换成群聊，独立读完并回复',context:'从分散消息中找出地点、时间、安排和仍缺的物品，再写3—4句真实回复。'}
  ];
  const article={
    title:'Why Did the Rover Stop?',
    paragraphs:[
      'At the school tech fair on Friday, Team Orion sent a small rover across a sand track. The first run ended after six metres. The screen showed “wheel slip,” a phrase Leo had never seen. He wanted to change the motor, but Mina watched the video again. The motor was still turning; one wheel was spinning on loose sand, while the rover hardly moved.',
      'The team wrapped rubber strips around the wheels. On the second run, the rover crossed the sand, but it tipped near a sharp turn. This time they kept the rubber strips and slowed down before the turn. On the third run, the rover finished the whole track.',
      'In their report, the team wrote, “A stronger motor was not the answer. Better grip helped on the sand, and lower speed helped at the turn.” Next week, they will compare two rubber-strip designs while keeping the rover’s speed the same.'
    ]
  };
  const mainOptions=[
    {id:'motor',text:'The team changed to a stronger motor and won the fair.'},
    {id:'evidence',text:'The team checked evidence, found two different problems and improved the rover.'},
    {id:'parts',text:'The article introduces every part of a rover.'},
    {id:'word',text:'Leo learned the Chinese meaning of “wheel slip”.'}
  ];
  const evidenceOptions=[
    {id:'motor-turning',group:'sand',text:'The motor was still turning.'},
    {id:'wheel-spinning',group:'sand',text:'One wheel was spinning on loose sand, while the rover hardly moved.'},
    {id:'rubber-crossed',group:'sand',text:'On the second run, the rover crossed the sand, but it tipped near a sharp turn.'},
    {id:'tipped-turn',group:'turn',text:'It tipped near a sharp turn.'},
    {id:'slowed-finished',group:'turn',text:'This time they kept the rubber strips and slowed down before the turn. On the third run, the rover finished the whole track.'},
    {id:'report',group:'summary',text:'A stronger motor was not the answer.'}
  ];
  const unknownOptions=['rover','wheel slip','tipped','grip','没有词阻断我继续读'];
  const clueCards=[
    {id:'but',label:'but',meaning:'前后发生转折：Leo先猜马达，后面的观察却让团队重新判断。'},
    {id:'while',label:'while',meaning:'把两个同时发生的现象放在一起比较：轮子在转，车却几乎不动。'},
    {id:'this-time',label:'This time',meaning:'提示方案发生变化：第二个问题需要另一种改法。'},
    {id:'report',label:'In their report',meaning:'从试跑过程转入团队最后能有证据支持的结论。'}
  ];
  const wordNotes={
    rover:'rover：能在地面移动、执行探测或任务的小型车辆。',
    'wheel slip':'wheel slip：车轮在转，却没有有效推动整车前进；这里先靠后文现象理解，不必先背中文。',
    tipped:'tipped：失去平衡而倾倒；near a sharp turn 和后面的 slowed down 提供了线索。',
    grip:'grip：车轮抓住地面、不容易打滑的能力；rubber strip、crossed the sand 都在帮助推断。'
  };
  const transfer={
    messages:[
      {who:'Coach Sun',text:'Saturday’s robot practice moves to Lab 2 because the gym is being used for a basketball match. Meet outside Lab 2 at 9:20, not at the school gate. Practice starts at 9:30 and ends at 10:30. Bring your controller and charging cable. Lab 2 has power outlets, but the tables are far from them, so we need two extension leads.'},
      {who:'Kai',text:'I can bring one extension lead.'},
      {who:'Mia',text:'I’ll bring the spare controller. Who can bring the other lead?'},
      {who:'Leo',text:'I may arrive at 9:40. Should the team wait for me?'}
    ],
    placeOptions:[['gate','the school gate'],['lab','outside Lab 2'],['gym','the gym']],
    timeOptions:[['920','9:20'],['930','9:30'],['940','9:40']],
    waitOptions:[['wait','Wait for Leo at 9:40'],['start','Start practice at 9:30']],
    missingOptions:[['none','Nothing'],['lead','One extension lead'],['controller','One controller']]
  };
  const allowed={
    coldMain:new Set(mainOptions.map(item=>item.id)),
    evidence:new Set(evidenceOptions.map(item=>item.id)),
    unknown:new Set(unknownOptions),
    grip:new Set(['power','traction','battery','distance']),
    place:new Set(transfer.placeOptions.map(item=>item[0])),
    time:new Set(transfer.timeOptions.map(item=>item[0])),
    wait:new Set(transfer.waitOptions.map(item=>item[0])),
    missing:new Set(transfer.missingOptions.map(item=>item[0]))
  };
  const cleanText=(value,max=1200)=>typeof value==='string'?value.slice(0,max):'';
  const cleanChoice=(value,set)=>set.has(value)?value:'';
  const cleanList=(value,set,max=8)=>Array.isArray(value)?[...new Set(value.filter(item=>set.has(item)))].slice(0,max):[];
  function sanitizeState(value={}){
    return {
      coldMain:cleanChoice(value.coldMain,allowed.coldMain),
      coldSummary:cleanText(value.coldSummary,600),
      coldEvidence:cleanList(value.coldEvidence,allowed.evidence,2),
      coldUnknown:cleanChoice(value.coldUnknown,allowed.unknown),
      coldSaved:!!value.coldSaved,
      exampleDone:!!value.exampleDone,
      clueViews:cleanList(value.clueViews,new Set(clueCards.map(item=>item.id)),4),
      labMain:cleanChoice(value.labMain,allowed.coldMain),
      labEvidence:cleanList(value.labEvidence,allowed.evidence,3),
      gripChoice:cleanChoice(value.gripChoice,allowed.grip),
      readingRule:cleanText(value.readingRule,600),
      labAttempted:!!value.labAttempted,
      transferPlace:cleanChoice(value.transferPlace,allowed.place),
      transferTime:cleanChoice(value.transferTime,allowed.time),
      transferWait:cleanChoice(value.transferWait,allowed.wait),
      transferMissing:cleanChoice(value.transferMissing,allowed.missing),
      firstReply:cleanText(value.firstReply,1800),
      transferAttempted:!!value.transferAttempted,
      transferReview:!!value.transferReview,
      reviewAttempted:!!value.reviewAttempted,
      selfChecks:cleanList(value.selfChecks,new Set(['place-time','leo','missing','request']),4),
      revisedUpdate:cleanText(value.revisedUpdate,700),
      revisedAction:cleanText(value.revisedAction,700),
      revisedQuestion:cleanText(value.revisedQuestion,700),
      revisionReason:cleanText(value.revisionReason,600)
    };
  }
  function meaningful(value,minWords=3){
    const text=String(value||'').trim();
    const english=(text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[]).length;
    const chinese=(text.match(/[\u3400-\u9fff]/g)||[]).length;
    return english>=minWords||chinese>=Math.max(4,minWords);
  }
  function englishWordCount(value){return (String(value||'').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[]).length;}
  function meaningfulEnglish(value,minWords=3){return englishWordCount(value)>=minWords;}
  function gradeLab(state){
    const groups=new Set((state.labEvidence||[]).map(id=>evidenceOptions.find(item=>item.id===id)?.group));
    return {
      main:state.labMain==='evidence',
      evidence:groups.has('sand')&&groups.has('turn'),
      grip:state.gripChoice==='traction'
    };
  }
  function gradeTransfer(state){
    return {
      place:state.transferPlace==='lab',
      time:state.transferTime==='920',
      wait:state.transferWait==='start',
      missing:state.transferMissing==='lead',
      update:sentenceCount(state.revisedUpdate)===1&&meaningfulEnglish(state.revisedUpdate,3),
      action:sentenceCount(state.revisedAction)===1&&meaningfulEnglish(state.revisedAction,3),
      question:[1,2].includes(sentenceCount(state.revisedQuestion))&&meaningfulEnglish(state.revisedQuestion,2)
    };
  }
  function sentenceCount(value){
    const text=String(value||'').trim();
    if(!text)return 0;
    const punctuated=text.split(/[.!?。！？]+/).filter(part=>part.trim()).length;
    if(/[.!?。！？]/.test(text))return punctuated;
    return text.split(/\n+/).filter(part=>part.trim()).length;
  }
  function replyText(state,prefix='reply'){
    if(prefix!=='revised')return String(state.firstReply||'').trim();
    return ['revisedUpdate','revisedAction','revisedQuestion'].map(key=>String(state[key]||'').trim()).filter(Boolean).join(' ');
  }
  const lesson={
    id:'readenglish',title:'单词没全懂，也能抓住一篇英文在说什么吗？',tasks,article,mainOptions,evidenceOptions,unknownOptions,
    clueCards,wordNotes,transfer,sanitizeState,meaningful,meaningfulEnglish,englishWordCount,gradeLab,gradeTransfer,sentenceCount,replyText
  };
  root.ReadEnglishLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
