/* Text follows the official PEP reading page. Notes and interaction copy are teaching material unless marked as textbook notes. */
(function(root){
  'use strict';

  const lesson={
    id:'chentaiqiu',
    title:'共读《陈太丘与友期行》：一场迟到，怎样照见“信”与“礼”？',
    format:'readalong',
    fullTextUrl:'https://www.pep.com.cn/xw/zt/hd/ywsd/sfsd/7s/201806/t20180629_1926012.shtml',
    catalogUrl:'https://www.pep.com.cn/products/jc/czjks/201802/t20180209_1922672.shtml',
    transferSourceUrl:'https://www.nlc.cn/migrated/www.nlc.cn/bbjd/202108dzyd/zxyd/no6/202308/P020230801358615416293.pdf',
    text:'陈太丘与友期行，期日中。过中不至，太丘舍去，去后乃至。元方时年七岁，门外戏。客问元方：“尊君在不？”答曰：“待君久不至，已去。”友人便怒曰：“非人哉！与人期行，相委而去。”元方曰：“君与家君期日中。日中不至，则是无信；对子骂父，则是无礼。”友人惭，下车引之。元方入门不顾。',
    annotations:[
      {id:'main-chen',scope:'main',text:'陈太丘',kind:'教材注释＋本站解释',note:'即陈寔（shí），字仲弓，东汉人，曾任太丘长。“太丘”不是他的本名。'},
      {id:'main-qixing',scope:'main',text:'期行',kind:'教材注释',note:'相约同行。期，约定。'},
      {id:'main-rizhong',scope:'main',text:'日中',kind:'教材注释',note:'正午时分。'},
      {id:'main-shequ',scope:'main',text:'舍去',kind:'教材注释',note:'丢下（他）而离开。舍，丢下；去，离开。'},
      {id:'main-nai',scope:'main',text:'乃',kind:'教材注释＋本站解释',note:'才。“去后乃至”说明友人是在陈太丘离开后才到。'},
      {id:'main-yuanfang',scope:'main',text:'元方',kind:'教材注释',note:'即陈纪，字元方，陈寔的长子。'},
      {id:'main-xi',scope:'main',text:'门外戏',kind:'本站解释',note:'在门外玩。这里的“戏”不是演戏。'},
      {id:'main-zunjun',scope:'main',text:'尊君在不',kind:'教材注释',note:'令尊在不在？尊君，对别人父亲的尊称；不（fǒu），同“否”。'},
      {id:'main-subject',scope:'main',text:'待君久不至，已去',kind:'本站解释',note:'句中省略了主语：家君等您很久，您仍未到，家君已经离开。'},
      {id:'main-xiangwei',scope:'main',text:'相委而去',kind:'教材注释＋本站解释',note:'丢下我走了。相，表示动作偏指一方，不是“互相”；委，丢下。'},
      {id:'main-jiajun',scope:'main',text:'家君',kind:'教材注释',note:'对别人谦称自己的父亲。'},
      {id:'main-yin',scope:'main',text:'引之',kind:'教材注释＋本站解释',note:'引，拉；之，指元方。原文只写“下车拉他”，没有写出正式道歉。'},
      {id:'main-gu',scope:'main',text:'顾',kind:'教材注释＋本站解释',note:'回头看。“入门不顾”是走进门去，不回头看。'}
    ],
    initialChoices:[
      {id:'support',label:'我更理解元方：他在守住“信”和“礼”'},
      {id:'question',label:'我有一点疑问：友人已经惭愧，元方是否可以回应'},
      {id:'both',label:'两边都看见：元方有理由，结尾也值得商量'}
    ],
    endingEvidence:[
      {id:'shame',text:'友人惭'},
      {id:'pull',text:'下车引之'},
      {id:'ignore',text:'元方入门不顾'}
    ],
    timeline:[
      {id:'promise',text:'期日中：约在正午'},
      {id:'late',text:'过中不至：过午仍没到'},
      {id:'leave',text:'太丘舍去：陈太丘离开'},
      {id:'arrive',text:'去后乃至：友人这才到'}
    ],
    addressTerms:[
      {id:'zunjun',term:'尊君',answer:'your-father'},
      {id:'jiajun',term:'家君',answer:'my-father'},
      {id:'jun',term:'君',answer:'you'}
    ],
    addressOptions:[
      {id:'your-father',text:'您的父亲'},
      {id:'my-father',text:'我的父亲'},
      {id:'you',text:'您／你'}
    ],
    claimEvidence:[
      {id:'promise-noon',text:'君与家君期日中'},
      {id:'late-noon',text:'日中不至'},
      {id:'insult-father',text:'对子骂父'},
      {id:'enter-ignore',text:'元方入门不顾'}
    ],
    transfer:{
      title:'华歆、王朗俱乘船避难',
      text:'华歆、王朗俱乘船避难，有一人欲依附，歆辄难之。朗曰：“幸尚宽，何为不可？”后贼追至，王欲舍所携人。歆曰：“本所以疑，正为此耳。既已纳其自托，宁可以急相弃邪？”遂携拯如初。世以此定华、王之优劣。',
      annotations:[
        {id:'transfer-yifu',scope:'transfer',text:'依附',kind:'国图注释',note:'这里指请求搭船同行。'},
        {id:'transfer-nan',scope:'transfer',text:'辄难之',kind:'国图注释＋本站解释',note:'辄，立即、就；难（nàn），这里指拒绝。华歆起初立即拒绝搭载那个人。'},
        {id:'transfer-she',scope:'transfer',text:'舍所携人',kind:'国图注释＋本站解释',note:'想丢下已经带上船的人。舍，丢弃。'},
        {id:'transfer-naji',scope:'transfer',text:'既已纳其自托',kind:'国图注释',note:'既然已经接受了对方的请托。'},
        {id:'transfer-ning',scope:'transfer',text:'宁可以急相弃邪',kind:'本站解释',note:'怎么能因为情况危急就把他丢下呢？“邪”同“耶”，表示反问。'},
        {id:'transfer-zheng',scope:'transfer',text:'遂携拯如初',kind:'国图注释＋本站解释',note:'于是仍像开始时那样带着并救助那个人。'}
      ],
      choices:[
        {id:'cold',text:'华歆一开始不愿带人，所以他始终比王朗冷漠。'},
        {id:'commitment',text:'王朗先答应、危急时想弃人；华歆起初拒绝，但一旦接受请托便坚持相救。'},
        {id:'forced',text:'贼人追来以后，两个人都别无选择，只能继续带着那个人。'}
      ],
      evidence:[
        {id:'hua-hesitate',text:'歆辄难之'},
        {id:'wang-allow',text:'幸尚宽，何为不可'},
        {id:'wang-abandon',text:'王欲舍所携人'},
        {id:'hua-keep',text:'既已纳其自托……遂携拯如初'}
      ],
      hints:[
        '先分别找“情况危险时，王朗想做什么”和“华歆最后做了什么”。',
        '判断人物不能只抓开头一句；把“先答应—后想弃”与“先拒绝—接受后坚持”放在一起。'
      ]
    },
    tasks:[{title:'共读《陈太丘与友期行》',context:'全文阅读、初读判断、证据链与迁移都保存在同一份共读记录中；收好不等于掌握。'}]
  };

  const unique=value=>[...new Set(Array.isArray(value)?value:[])];
  const sameOrder=(value,expected)=>Array.isArray(value)&&value.length===expected.length&&value.every((item,index)=>item===expected[index])&&new Set(value).size===value.length;
  const sameSet=(value,expected)=>{const clean=unique(value);return clean.length===expected.length&&expected.every(item=>clean.includes(item));};
  const timelineIds=lesson.timeline.map(item=>item.id);
  const annotationIds=[...lesson.annotations,...lesson.transfer.annotations].map(item=>item.id);
  const endingIds=lesson.endingEvidence.map(item=>item.id);
  const claimIds=lesson.claimEvidence.map(item=>item.id);
  const transferEvidenceIds=lesson.transfer.evidence.map(item=>item.id);
  const initialIds=lesson.initialChoices.map(item=>item.id);
  const transferChoiceIds=lesson.transfer.choices.map(item=>item.id);
  const finalIds=['support','question','both'];

  lesson.gradeTimeline=value=>({correct:sameOrder(value,timelineIds),expected:[...timelineIds]});
  lesson.gradeAddresses=value=>({
    correct:!!value&&lesson.addressTerms.every(item=>value[item.id]===item.answer)&&Object.keys(value||{}).every(key=>lesson.addressTerms.some(item=>item.id===key))
  });
  lesson.gradeClaim=value=>({correct:sameSet(value,['insult-father'])});
  lesson.gradeTransfer=value=>({
    correct:transferChoiceIds.includes(value?.choice)&&value.choice==='commitment'&&sameSet(value?.evidence,['wang-abandon','hua-keep']),
    choice:value?.choice==='commitment',
    evidence:sameSet(value?.evidence,['wang-abandon','hua-keep'])
  });
  lesson.sameOrder=sameOrder;

  function oneOf(value,allowed,fallback=''){return allowed.includes(value)?value:fallback;}
  function strings(value,allowed,limit=allowed.length){return unique(value).filter(item=>allowed.includes(item)).slice(0,limit);}
  function text(value,max){return typeof value==='string'?value.slice(0,max):'';}
  function transferSnapshot(value){
    if(!value||typeof value!=='object')return null;
    const choice=oneOf(value.choice,transferChoiceIds);
    const evidence=strings(value.evidence,transferEvidenceIds);
    const hintLevel=Math.max(0,Math.min(lesson.transfer.hints.length,Number.isInteger(value.hintLevel)?value.hintLevel:0));
    return choice||evidence.length?{choice,evidence,hintLevel}:null;
  }
  lesson.sanitizeDraft=raw=>{
    const source=raw&&typeof raw==='object'?raw:{};
    const addresses={};
    if(source.addressAnswers&&typeof source.addressAnswers==='object')lesson.addressTerms.forEach(item=>{
      const value=oneOf(source.addressAnswers[item.id],lesson.addressOptions.map(option=>option.id));
      if(value)addresses[item.id]=value;
    });
    return {
      $readConfirmed:source.$readConfirmed===true,
      $seenAnnotations:strings(source.$seenAnnotations,annotationIds),
      $initialSaved:source.$initialSaved===true,
      initialChoice:oneOf(source.initialChoice,initialIds),
      initialEvidence:oneOf(source.initialEvidence,endingIds),
      timelineOrder:strings(source.timelineOrder,timelineIds),
      timelineAttempted:source.timelineAttempted===true,
      addressAnswers:addresses,
      addressAttempted:source.addressAttempted===true,
      claimEvidence:strings(source.claimEvidence,claimIds),
      claimAttempted:source.claimAttempted===true,
      transferChoice:oneOf(source.transferChoice,transferChoiceIds),
      transferEvidence:strings(source.transferEvidence,transferEvidenceIds),
      transferAttempted:source.transferAttempted===true,
      $transferFirst:transferSnapshot(source.$transferFirst),
      $transferLast:transferSnapshot(source.$transferLast),
      transferHintLevel:Math.max(0,Math.min(lesson.transfer.hints.length,Number.isInteger(source.transferHintLevel)?source.transferHintLevel:0)),
      finalChoice:oneOf(source.finalChoice,finalIds),
      finalEvidence:strings(source.finalEvidence,endingIds),
      quote:text(source.quote,400),
      note:text(source.note,800)
    };
  };

  root.ReadalongLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
