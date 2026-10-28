/* English bridge E02: preference, clarification and evidence-based negotiation. */
(function(root){
  'use strict';
  const id='persuade';
  const title='我选这个方案，但你能说服我改主意吗？';
  const tasks=[
    {title:'没有标准答案时，你先选哪个？',context:'先表达自己的首选和具体理由；首答保存后，才出现示例和词块。'},
    {title:'队友的顾虑，哪一个问题能问到关键？',context:'反方内容随首选变化；先听顾虑，再提出可能改变决定的澄清问题，最后更新或坚持。'},
    {title:'换成展会任务，还能自己完成协商吗？',context:'资料改成聊天与规则表，不给完整句架；先问缺失信息，再决定并回应队友。'}
  ];
  const plans=[
    {id:'field',name:'Plan A · Riverside field test',short:'Plan A',tag:'真实地面',facts:['40 minutes each way','60-minute rover test','outdoors · free'],pitch:'We can test the rover on real, rough ground.'},
    {id:'lab',name:'Plan B · Indoor robot lab',short:'Plan B',tag:'稳定省时',facts:['15 minutes each way','45-minute challenge','indoors · 20 yuan each'],pitch:'We can test indoors with tools and power nearby.'}
  ];
  const branches={
    field:{
      teammate:'I see why you like the field, but we can leave at ten and must be back by twelve thirty. The field is forty minutes away, and the forecast says it may rain before noon. Can we finish the test before the rain?',
      questions:['What color is the rover?','When will it start raining?','Can we buy drinks near the field?'],
      keyQuestion:1,
      answer:'The rain is expected at 11:50. We would arrive at 10:40, and the full test takes one hour.',
      facts:['150 minutes available','140 minutes for travel and the full test','rain expected at 11:50'],
      impact:'The full test would finish at 11:40, ten minutes before the rain, but the team would travel home after the rain starts.'
    },
    lab:{
      teammate:'The indoor lab is a reliable option, but it costs twenty yuan each, and Leo forgot his wallet. Can the whole team still join?',
      questions:['Does Leo like robots?','What color is the lab door?','Can the club cover one ticket?'],
      keyQuestion:2,
      answer:"Yes. The club can cover Leo's twenty-yuan ticket. The lab also offers a shorter thirty-minute challenge.",
      facts:['120 minutes available','one ticket covered by the club','shorter 30-minute challenge also available'],
      impact:'The original lab plan can still work; the team may also shorten the challenge or change plans for another reason.'
    }
  };
  const moves=[
    {id:'change',label:'Change',hint:'新事实改变了我的决定'},
    {id:'adjust',label:'Adjust',hint:'保留核心想法，但修改方案'},
    {id:'stay',label:'Stay',hint:'仍坚持原选择，并回应新事实'}
  ];
  const chunks=[
    {term:'I see your point.',meaning:'我听懂你的理由了；不等于已经完全同意。'},
    {term:'That changes my mind.',meaning:'这条新信息改变了我的决定。'},
    {term:"I'd still choose…",meaning:'我听过新信息后仍选择……'},
    {term:'What matters most is…',meaning:'现在最重要的是……'}
  ];
  const transfer={
    teammate:'I want a live rover demo because it will be exciting for the audience.',
    ruleRows:[
      ['Time','5 minutes for the whole team'],
      ['Wi-Fi','may stop working in the hall']
    ],
    questionIntents:[
      {id:'time',label:'Whether the five-minute limit is firm',answer:'Every team gets exactly five minutes, as the rule table already says.'},
      {id:'offline',label:'Whether an offline video is allowed',answer:'Yes. You may use a downloaded video, and it works without Wi-Fi.'},
      {id:'appearance',label:'What color the hall curtains are',answer:'The curtains are blue, but that does not affect the plan.'}
    ],
    plans:[
      {id:'live',name:'Live rover demo',facts:['8 minutes','needs stable Wi-Fi','highly interactive']},
      {id:'video',name:'Recorded demo',facts:['4 minutes','works offline','less interactive']},
      {id:'hybrid',name:'3-minute video + 1-minute Q&A',facts:['4 minutes','works offline','leaves time for audience questions']}
    ],
    validPlans:['video','hybrid']
  };
  const sources=[
    {title:'教育部：义务教育课程方案和课程标准（2022年版）',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/t20220420_619921.html'},
    {title:'人教社：义务教育英语（小学）新教材简介',url:'https://www.pep.com.cn/xw/zt/hd/12/xjcjs/xx/202409/t20240920_1995564.html'},
    {title:'人教社：义务教育英语（七至九年级）新教材介绍',url:'https://www.pep.com.cn/xw/zt/hd/12/xjcjs/cz/202510/t20251024_2004130.html'}
  ];
  function sameSet(values,answer){
    if(!Array.isArray(values)||!Array.isArray(answer))return false;
    return values.length===answer.length&&[...values].sort().every((value,index)=>value===[...answer].sort()[index]);
  }
  function englishWords(value){
    return typeof value==='string'?(value.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)||[]):[];
  }
  function meaningfulEnglish(value,min=5){return englishWords(value).length>=min;}
  function looksLikeQuestion(value){
    if(!meaningfulEnglish(value,3))return false;
    const text=value.trim();
    return /\?$/.test(text)||/^(can|could|do|does|did|is|are|will|would|how|what|when|where|why)\b/i.test(text);
  }
  const api={id,title,tasks,plans,branches,moves,chunks,transfer,sources,sameSet,englishWords,meaningfulEnglish,looksLikeQuestion};
  root.PersuadeLesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
