'use strict';
(function(root){
  const title='同一件事，两份记录为什么不一样？';
  const initialOptions=[
    {id:'conflict',text:'两份话相反，至少有一份一定是假的。'},
    {id:'later-wins',text:'1906年的记录更晚，所以它会把1905年的记录作废。'},
    {id:'can-coexist',text:'两份记录可能都是真的，但它们写的时间、人物和问题范围不同。'},
    {id:'same-meaning',text:'两份记录其实表达的是同一个意思。'}
  ];
  const claims=[
    {id:'method',text:'1905年，有人质疑的是电车项目的兴办方式。',expected:'A'},
    {id:'busy',text:'1906年试行时，电车往来频繁，乘客和围观者很多。',expected:'B'},
    {id:'public',text:'合起来看，天津报刊中既有公开质疑，也有试运营热闹场景的报道。',expected:'S'},
    {id:'everyone',text:'当时每一位天津人都欢迎电车。',expected:'N'},
    {id:'gone',text:'到1906年，先前的质疑已经全部消失。',expected:'N'}
  ];
  const buckets=[
    {id:'A',label:'材料A能支持'},
    {id:'B',label:'材料B能支持'},
    {id:'S',label:'两份合看能支持'},
    {id:'N',label:'两份都不能证明'}
  ];
  const transferSupport=[
    {id:'order',text:'秦政府颁布过统一度量衡的命令。'},
    {id:'instant',text:'命令颁布当天，全国各地已经完全统一。'},
    {id:'never',text:'秦以前各地从来没有使用过度量衡。'}
  ];
  const transferUnproved=[
    {id:'instant',text:'全国所有市场和家庭立刻、毫无例外地执行了命令。'},
    {id:'order',text:'秦政府曾经发布统一度量衡的命令。'},
    {id:'record',text:'后世史书记载过这项制度变化。'}
  ];
  const tasks=[
    {title:'先判断：两份记录一定互相打架吗？',context:'1905年的质疑与1906年的热闹场景。'},
    {title:'证据台：每句话能说到哪一步？',context:'把结论放回材料能够支持的范围。'},
    {title:'独立迁移：秦统一标准真的“一夜完成”吗？',context:'当时实物与后世史书记载的互证和边界。'}
  ];
  function gradeInitial(id){return id==='can-coexist';}
  function gradeClaims(assignments){
    const value=assignments&&typeof assignments==='object'?assignments:{};
    const detail=claims.map(claim=>({id:claim.id,correct:value[claim.id]===claim.expected,expected:claim.expected,actual:value[claim.id]||null}));
    return {correct:detail.every(item=>item.correct),count:detail.filter(item=>item.correct).length,total:detail.length,detail};
  }
  function gradeTransfer(support,unproved){return {support:support==='order',unproved:unproved==='instant',correct:support==='order'&&unproved==='instant'};}
  const lesson={
    id:'history',title,tasks,initialOptions,claims,buckets,transferSupport,transferUnproved,
    gradeInitial,gradeClaims,gradeTransfer
  };
  root.HistoryLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
