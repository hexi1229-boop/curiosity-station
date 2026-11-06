/* Algebra bridge A1: from repeated quantities to like terms. */
(function(root){
  'use strict';

  const id='liketerms';
  const title='字母式长得很像，哪些真的能合并？';
  const tasks=[
    {title:'三个式子看起来很像，哪些变形对所有取值都成立？',context:'先封存判断与理由，不立即揭示答案。'},
    {title:'真正能合并的，究竟是哪一部分相同？',context:'从完整示例开始，再撤掉颜色和展开提示。'},
    {title:'换成一张没有颜色提示的路线图，还能自己合并吗？',context:'从五段路程中提取同类项，写出对所有允许取值都成立的总路程。'}
  ];

  const coldClaims=[
    {id:'same-a',formula:'3a＋2a＝5a',text:'小明：我把3份a和2份a收成5份a'},
    {id:'different-letter',formula:'3a＋2b＝5ab',text:'小宇：我把前面的数相加，字母写在一起'},
    {id:'different-power',formula:'3a＋2a²＝5a³',text:'小航：我把前面的数和右上角的数分别相加'}
  ];
  const coldAnswer=['same-a'];

  const labTerms=[
    {id:'4x',label:'4x',group:'x'},
    {id:'-x',label:'−x',group:'x'},
    {id:'2y',label:'2y',group:'y'},
    {id:'3',label:'3',group:'constant'},
    {id:'-1',label:'−1',group:'constant'}
  ];
  const groupOptions=[
    {id:'x',label:'x 项'},
    {id:'y',label:'y 项'},
    {id:'constant',label:'常数项'}
  ];

  const transferOptions=[
    {id:'right',formula:'3x＋4'},
    {id:'seven-x',formula:'7x'},
    {id:'power',formula:'3x²＋4'},
    {id:'product',formula:'12x'}
  ];
  const transferReasons=[
    {id:'group',text:'三个 x 项有相同变量部分；两个常数项也能合并'},
    {id:'add-all',text:'把五条边上的数字全部加起来，再保留一个 x'},
    {id:'multiply-x',text:'见到相同字母就把字母相乘'}
  ];

  const sources=[
    {title:'教育部《义务教育数学课程标准（2022年版）》',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf'},
    {title:'人教版义务教育数学（七～九年级）新教材介绍',url:'https://www.pep.com.cn/xw/zt/hd/12/xjcjs/cz/202408/t20240826_1994351.html'},
    {title:'人教社：七年级核心内容含“代数式与整式的加减”',url:'https://www.pep.com.cn/rjdt/rjdt/202506/t20250618_2002139.shtml'}
  ];

  function uniqueAllowed(values,allowed){
    if(!Array.isArray(values))return [];
    const set=new Set(allowed),result=[];
    for(const value of values)if(set.has(value)&&!result.includes(value))result.push(value);
    return result;
  }
  function sameSet(left,right){
    const a=[...new Set(left||[])].sort(),b=[...new Set(right||[])].sort();
    return a.length===b.length&&a.every((value,index)=>value===b[index]);
  }
  function integer(value){
    const text=String(value??'').trim().replace(/[０-９＋－]/g,char=>String.fromCharCode(char.charCodeAt(0)-65248)).replace(/−/g,'-');
    if(!/^[+-]?\d+$/.test(text))return null;
    const number=Number(text);
    return Number.isSafeInteger(number)?number:null;
  }
  function normalizeTerm(term){
    if(!term||!Number.isFinite(term.coefficient)||!term.powers||typeof term.powers!=='object'||Array.isArray(term.powers))return null;
    const powers={};
    for(const name of Object.keys(term.powers).sort()){
      if(!/^[a-z]$/i.test(name)||!Number.isInteger(term.powers[name])||term.powers[name]<1)return null;
      powers[name]=term.powers[name];
    }
    return {coefficient:term.coefficient,powers};
  }
  function termKey(term){
    const clean=normalizeTerm(term);
    if(!clean)return null;
    return Object.entries(clean.powers).map(([name,power])=>name+'^'+power).join('*')||'constant';
  }
  function areLikeTerms(left,right){const a=termKey(left),b=termKey(right);return a!==null&&a===b;}
  function combineLikeTerms(terms){
    if(!Array.isArray(terms))return null;
    const groups=new Map();
    for(const term of terms){
      const clean=normalizeTerm(term),key=termKey(term);
      if(!clean||key===null)return null;
      if(!groups.has(key))groups.set(key,{coefficient:0,powers:clean.powers});
      groups.get(key).coefficient+=clean.coefficient;
    }
    return [...groups.values()].filter(term=>term.coefficient!==0);
  }
  function evaluateTerm(term,values){
    const clean=normalizeTerm(term);
    if(!clean)return NaN;
    let result=clean.coefficient;
    for(const [name,power] of Object.entries(clean.powers)){
      if(!Number.isFinite(values?.[name]))return NaN;
      result*=values[name]**power;
    }
    return result;
  }
  function evaluateTerms(terms,values){
    if(!Array.isArray(terms))return NaN;
    const parts=terms.map(term=>evaluateTerm(term,values));
    return parts.every(Number.isFinite)?parts.reduce((sum,value)=>sum+value,0):NaN;
  }
  function gradeLab(state){
    const groups=state?.groups||{};
    return {
      grouped:labTerms.every(term=>groups[term.id]===term.group),
      x:integer(state?.xCoefficient)===3,
      y:integer(state?.yCoefficient)===2,
      constant:integer(state?.constant)===2,
      power:state?.powerChoice==='cannot',
      samples:Array.isArray(state?.sampleValues)&&new Set(state.sampleValues).size>=2
    };
  }
  function gradeTransfer(state){
    return {
      option:state?.option==='right',
      claim:state?.claim==='not-always',
      check:integer(state?.checkValue)===13,
      reason:state?.reason==='group'
    };
  }
  function cleanText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function sanitizeState(raw){
    const source=raw&&typeof raw==='object'?raw:{};
    const groups={};
    for(const term of labTerms){const value=source.groups?.[term.id];if(groupOptions.some(group=>group.id===value))groups[term.id]=value;}
    return {
      coldChoices:uniqueAllowed(source.coldChoices,coldClaims.map(item=>item.id)),coldReason:cleanText(source.coldReason),coldUnsure:!!source.coldUnsure,
      sampleValue:[1,2,3,4,5].includes(Number(source.sampleValue))?Number(source.sampleValue):2,
      sampleValues:uniqueAllowed((source.sampleValues||[]).map(Number),[1,2,3,4,5]),sampleExpanded:!!source.sampleExpanded,
      groups,xCoefficient:cleanText(source.xCoefficient,20),yCoefficient:cleanText(source.yCoefficient,20),constant:cleanText(source.constant,20),powerChoice:['can','cannot'].includes(source.powerChoice)?source.powerChoice:null,labReason:cleanText(source.labReason),labUnsure:!!source.labUnsure,labAttempted:!!source.labAttempted,
      option:transferOptions.some(item=>item.id===source.option)?source.option:null,claim:['always','not-always'].includes(source.claim)?source.claim:null,checkValue:cleanText(source.checkValue,20),reason:transferReasons.some(item=>item.id===source.reason)?source.reason:null,transferExplanation:cleanText(source.transferExplanation),transferUnsure:!!source.transferUnsure,transferAttempted:!!source.transferAttempted
    };
  }

  const api={id,title,tasks,coldClaims,coldAnswer,labTerms,groupOptions,transferOptions,transferReasons,sources,uniqueAllowed,sameSet,integer,normalizeTerm,termKey,areLikeTerms,combineLikeTerms,evaluateTerm,evaluateTerms,gradeLab,gradeTransfer,sanitizeState};
  root.LikeTermsLesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
