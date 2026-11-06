/* Algebra bridge A2: distributive law, removing one layer of brackets. */
(function(root){
  'use strict';

  const id='brackets';
  const title='括号里的式子，拆开后还一样吗？';
  const tasks=[
    {title:'四条改写里，哪些对所有取值都成立？',context:'先封存判断与理由，不显示规则、动画或提示。'},
    {title:'括号外的数，作用范围到底到哪里？',context:'先看正数与负号怎样作用于整个括号，再撤掉颜色独立展开并合并。'},
    {title:'换成一份航天货舱清单，还能自己找出同一结构吗？',context:'从表格建立式子，展开括号、合并同类项，并用一个数值检查。'}
  ];

  const coldClaims=[
    {id:'positive-missed',formula:'2(x＋3)＝2x＋3'},
    {id:'positive-right',formula:'2(x＋3)＝2x＋6'},
    {id:'negative-missed',formula:'－(x－4)＝－x－4'},
    {id:'negative-right',formula:'－(x－4)＝－x＋4'}
  ];
  const coldAnswer=['positive-right','negative-right'];
  const gateActions=['positive-x','positive-3','negative-x','negative-minus4'];

  const transferModels=[
    {id:'right',formula:'3(x＋2)－(x＋1)'},
    {id:'missed-first',formula:'3x＋2－x＋1'},
    {id:'missed-minus',formula:'3(x＋2)－x＋1'}
  ];
  const transferExpansions=[
    {id:'right',formula:'3x＋6－x－1'},
    {id:'plus-one',formula:'3x＋6－x＋1'},
    {id:'missed-two',formula:'3x＋2－x－1'}
  ];
  const transferResults=[
    {id:'right',formula:'2x＋5'},
    {id:'seven',formula:'2x＋7'},
    {id:'four-x',formula:'4x＋7'}
  ];
  const transferReasons=[
    {id:'scope',text:'3乘第一组里的两项；减去第二整组，相当于−1乘里面的两项'},
    {id:'first-only',text:'括号外的数只处理紧挨着它的第一项，后面的数照抄'},
    {id:'sign-only',text:'只要看到减号，就把最后一个符号随意改掉'}
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
  function validLinear(value){return value&&Number.isFinite(value.x)&&Number.isFinite(value.constant);}
  function scaleLinear(multiplier,expression){
    if(!Number.isFinite(multiplier)||!validLinear(expression))return null;
    return {x:multiplier*expression.x,constant:multiplier*expression.constant};
  }
  function addLinear(left,right){
    if(!validLinear(left)||!validLinear(right))return null;
    return {x:left.x+right.x,constant:left.constant+right.constant};
  }
  function evaluateLinear(expression,x){return validLinear(expression)&&Number.isFinite(x)?expression.x*x+expression.constant:NaN;}
  function gradeLab(state){
    return {
      gates:sameSet(state?.gateActions,gateActions),
      samples:Array.isArray(state?.sampleValues)&&new Set(state.sampleValues).size>=2,
      expandedX:integer(state?.expandedX)===-6,
      expandedConstant:integer(state?.expandedConstant)===8,
      finalX:integer(state?.finalX)===-1,
      finalConstant:integer(state?.finalConstant)===8
    };
  }
  function gradeTransfer(state){
    return {
      model:state?.model==='right',
      expansion:state?.expansion==='right',
      result:state?.result==='right',
      check:integer(state?.checkValue)===13,
      reason:state?.reason==='scope'
    };
  }
  function cleanText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function sanitizeState(raw){
    const source=raw&&typeof raw==='object'?raw:{};
    return {
      coldChoices:uniqueAllowed(source.coldChoices,coldClaims.map(item=>item.id)),coldReason:cleanText(source.coldReason),coldUnsure:!!source.coldUnsure,
      gateActions:uniqueAllowed(source.gateActions,gateActions),sampleValue:[1,2,3,4,5,6].includes(Number(source.sampleValue))?Number(source.sampleValue):2,sampleValues:uniqueAllowed((source.sampleValues||[]).map(Number),[1,2,3,4,5,6]),
      expandedX:cleanText(source.expandedX,20),expandedConstant:cleanText(source.expandedConstant,20),finalX:cleanText(source.finalX,20),finalConstant:cleanText(source.finalConstant,20),labReason:cleanText(source.labReason),labUnsure:!!source.labUnsure,labAttempted:!!source.labAttempted,
      model:transferModels.some(item=>item.id===source.model)?source.model:null,expansion:transferExpansions.some(item=>item.id===source.expansion)?source.expansion:null,result:transferResults.some(item=>item.id===source.result)?source.result:null,checkValue:cleanText(source.checkValue,20),reason:transferReasons.some(item=>item.id===source.reason)?source.reason:null,transferExplanation:cleanText(source.transferExplanation),transferUnsure:!!source.transferUnsure,transferAttempted:!!source.transferAttempted
    };
  }

  const api={id,title,tasks,coldClaims,coldAnswer,gateActions,transferModels,transferExpansions,transferResults,transferReasons,sources,uniqueAllowed,sameSet,integer,scaleLinear,addLinear,evaluateLinear,gradeLab,gradeTransfer,sanitizeState};
  root.BracketsLesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
