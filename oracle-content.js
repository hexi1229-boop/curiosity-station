'use strict';
(function(root){
  const title='甲骨会说话，但它说的是问题、判断，还是结果？';
  const tasks=[
    {title:'先封存：一片骨上到底写了什么？',context:'据国博馆藏卜骨说明整理的四段现代汉语释意。'},
    {title:'时间轴：四层内容分别指向何时？',context:'按内容所指的时间分清叙辞、命辞、占辞与验辞，不推定实际刻写时刻。'},
    {title:'复原台：没有问号，还能认出命辞吗？',context:'用明确标注的教学模拟材料独立排列四层记录。'},
    {title:'展签审稿：两句刻辞，哪句才是真相？',context:'审核小屯YH127坑出土卜甲两项“受年”文字的证据边界。'}
  ];
  const initialOptions=[
    {id:'question',text:'它主要是在提一个问题。'},
    {id:'judgment',text:'它主要是在记录商王的判断。'},
    {id:'outcome',text:'它主要是在记录后来发生的结果。'},
    {id:'layers',text:'它把时间、占问事项、判断和后来结果放在了一起。'}
  ];
  const sourceLines=[
    {id:'preface',mark:'A',text:'癸巳日，占卜者主持占卜。'},
    {id:'charge',mark:'B',text:'占问未来十日会不会有灾祸。'},
    {id:'prognostication',mark:'C',text:'商王看过兆纹，判断这一旬将有麻烦到来。'},
    {id:'verification',mark:'D',text:'验辞记载：到第五日，传来敌方入侵的报告。'}
  ];
  const timelineStages=[
    {id:'preface',short:'叙辞／前辞',time:'占卜背景',title:'先给记录定位',text:'记录占卜的日期、主持者，有时也记录地点。它回答“何时、谁来做”。',bone:'癸巳日 · 占卜者主持',action:'这部分内容把整条记录放回占卜当天。'},
    {id:'charge',short:'命辞',time:'事情发生前',title:'留下准备占问的事',text:'命辞是占问事项或待检验的命题。它有时被翻译成问句，也可能写成陈述形式，不能只找问号。',bone:'未来一旬 · 是否有灾',action:'这部分内容指向尚未发生、准备检验的事情。'},
    {id:'prognostication',short:'占辞',time:'兆纹出现后',title:'留下当时作出的判断',text:'灼烧出现兆纹后，商王或占卜者对吉凶作出判断。判断不是后来情况本身。',bone:'王判断 · 将有麻烦',action:'这部分内容需要先看到兆纹，反映的是当时判断。'},
    {id:'verification',short:'验辞',time:'后来有了进展',title:'追记所认定的应验情况',text:'后来情况出现后，记录者把所认定的应验情况追记下来。它仍是记录者一侧的简要记载，不是独立、无偏的核验。',bone:'五日后 · 追记来侵报告',action:'这部分内容包含事后才可能知道的信息。'}
  ];
  const layerOptions=timelineStages.map(stage=>({id:stage.id,text:stage.short}));
  const sortCards=[
    {id:'preface',text:'某日，记录占卜时间与主持者。',clue:'日期与人物给整条记录定位。'},
    {id:'charge',text:'来月的庄稼会有好收成。',clue:'这是一件尚未发生、准备检验的事；没有问号也仍可能是命辞。'},
    {id:'prognostication',text:'商王看过兆纹后判断：吉。',clue:'“看过兆纹后判断”把它放在灼烧之后。'},
    {id:'verification',text:'到了来月，记录者追记：庄稼有收成。',clue:'“到了来月、追记”说明记录者把它写作后来情况。'}
  ];
  const correctOrder=['preface','charge','prognostication','verification'];
  const defaultOrder=['verification','preface','prognostication','charge'];
  const sortReasons=[
    {id:'later',text:'“到了来月、追记”表明这是记录者事后补记的情况。'},
    {id:'good',text:'句子中出现了“吉”，所以它一定是验辞。'},
    {id:'date',text:'句子中提到月份，所以它一定是验辞。'}
  ];
  const sortHints=[
    '先找写明日期和主持者的卡片，它负责给记录定位。',
    '再找事情尚未发生、正等待检验的卡片；不要只找问号。',
    '“看过兆纹后判断”属于兆纹出现以后，但仍不是实际结果。',
    '带有“到了、后来、追记”等标记的，才是在记录事后情况。'
  ];
  const transferSource={
    label:'真实材料 · 本地文字卡示意，不远程加载文物图片',
    provenance:'商代晚期武丁时期 · 殷墟小屯遗址YH127坑 · 登记号R044852',
    lineA:'丙子卜，韦贞：我受年。',
    glossA:'这一年，我们会有好收成。',
    lineB:'丙子卜，韦贞：我不其受年。',
    glossB:'这一年，我们不会有好收成。',
    boundary:'提交后核对：这两句是对同一件事所作的正反命辞。来源页面没有给出可据此判断当年实际丰歉的明确验辞；即使发现验辞，也仍应尽量与其他同时代材料互证。'
  };
  const ratings=[
    {id:'direct',text:'现存文字直接支持'},
    {id:'cautious',text:'可以谨慎推测'},
    {id:'cannot',text:'现有材料不能证明'}
  ];
  const claims=[
    {id:'concern',text:'这两条命辞把这一年的收成列作占问事项。',expected:'direct'},
    {id:'royal',text:'它属于商王室相关的占卜记录。',expected:'cautious'},
    {id:'harvest',text:'“我受年”就是后来结果，证明这一年实际丰收。',expected:'cannot'}
  ];
  function gradeInitial(id){return id==='layers';}
  function gradeTimeline(id){return id==='verification';}
  function gradeSort(order,reason){
    const sequence=Array.isArray(order)&&order.length===correctOrder.length&&correctOrder.every((id,index)=>order[index]===id);
    return {sequence,reason:reason==='later',correct:sequence&&reason==='later'};
  }
  function gradeClaims(values){
    const answers=values&&typeof values==='object'?values:{};
    const detail=claims.map(claim=>({id:claim.id,expected:claim.expected,actual:answers[claim.id]||null,correct:answers[claim.id]===claim.expected}));
    return {detail,correct:detail.every(item=>item.correct),count:detail.filter(item=>item.correct).length,total:detail.length};
  }
  const lesson={
    id:'oracle',title,tasks,initialOptions,sourceLines,timelineStages,layerOptions,
    sortCards,correctOrder,defaultOrder,sortReasons,sortHints,transferSource,ratings,claims,
    gradeInitial,gradeTimeline,gradeSort,gradeClaims
  };
  root.OracleLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
