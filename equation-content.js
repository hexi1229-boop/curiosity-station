/* Algebra bridge M-A03: equality properties and equivalent equations. */
(function(root){
  'use strict';

  const id='equation';
  const title='等式变了，原来的答案还在吗？';
  const tasks=[
    {title:'四个改写里，哪些仍只让同一个 x 成立？',context:'先封存判断与理由，不显示天秤、规则或提示。'},
    {title:'同一个方程，两条改写路线会走到哪里？',context:'在等式操作台比较两条路线，再检查特殊操作是否仍保留原问题。'},
    {title:'没有天秤图，能从数据包清单独立找回未知数吗？',context:'根据固定文件与图像文件的总大小建模，选择操作链并代回原关系检查。'}
  ];

  const coldClaims=[
    {id:'minus-six',formula:'2x＝14'},
    {id:'divide-two',formula:'x＋3＝10'},
    {id:'missed-constant',formula:'x＋6＝10'},
    {id:'zero',formula:'0＝0'}
  ];
  const coldAnswer=['minus-six','divide-two'];

  const labStates={
    start:{formula:'2x＋6＝20',left:['x','x','6'],right:['20'],caption:'原方程只在 x＝7 时成立。'},
    minus6:{formula:'2x＝14',left:['x','x'],right:['14'],caption:'两边同时减6，仍然平衡，也仍然只让 x＝7 成立。'},
    divide2:{formula:'x＋3＝10',left:['x','3'],right:['10'],caption:'把左右两个完整式子都除以2，仍然只让 x＝7 成立。'},
    solved:{formula:'x＝7',left:['x'],right:['7'],caption:'沿任一条可逆路线，最后都会得到 x＝7。'},
    broken:{formula:'2x＝20？',left:['x','x'],right:['20'],caption:'只让左边减6，左右不再相等；这不是原方程的等价改写。',tilt:6},
    zero:{formula:'0＝0',left:['0'],right:['0'],caption:'两边乘0后仍然相等，但任何 x 都能通过，原来的唯一答案丢失了。'}
  };

  const transferModels=[
    {id:'right',formula:'3m＋4＝25'},
    {id:'grouped',formula:'3(m＋4)＝25'},
    {id:'single',formula:'m＋4＝25'}
  ];
  const transferChains=[
    {id:'right',text:'两边同时减4，再把两边同时除以3'},
    {id:'left-only',text:'只把左边的＋4去掉，右边保持25'},
    {id:'partial-divide',text:'两边都除以3，但左边只除3m，不处理＋4'}
  ];
  const transferReasons=[
    {id:'whole',text:'每一步都对等号两边的整个式子做同一个可逆运算'},
    {id:'move',text:'数字穿过等号会自动变号，所以不用说明两边做了什么'},
    {id:'answer-only',text:'只要最后答案看起来合理，中间怎样改写都可以'}
  ];

  const sources=[
    {title:'教育部《义务教育数学课程标准（2022年版）》',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf'},
    {title:'人教社公开的旧版数学七年级上册目录',url:'https://www.pep.com.cn/products/jc/czjks/201510/t20151026_1250813.shtml'},
    {title:'人教版义务教育数学（七～九年级）新教材介绍',url:'https://www.pep.com.cn/xw/zt/hd/12/xjcjs/cz/202408/t20240826_1994351.html'}
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
    const text=String(value??'').trim().normalize('NFKC').replace(/−/g,'-');
    if(!/^[+-]?\d+$/.test(text))return null;
    const number=Number(text);
    return Number.isSafeInteger(number)?number:null;
  }
  function stepLab(node,action){
    if(action==='reset')return {node:'start',view:'start'};
    if(node==='start'&&action==='minus6')return {node:'minus6',view:'minus6'};
    if(node==='start'&&action==='divide2')return {node:'divide2',view:'divide2'};
    if(node==='start'&&action==='left-only')return {node:'start',view:'broken'};
    if(node==='start'&&action==='times0')return {node:'start',view:'zero'};
    if(node==='minus6'&&action==='divide2')return {node:'solved',view:'solved',path:'minus6-divide2'};
    if(node==='divide2'&&action==='minus3')return {node:'solved',view:'solved',path:'divide2-minus3'};
    return {node,view:node};
  }
  function gradeLab(state){
    return {
      path:['minus6-divide2','divide2-minus3'].includes(state?.labPath),
      zero:state?.zeroChoice==='information-lost',
      check:integer(state?.checkValue)===20
    };
  }
  function gradeTransfer(state){
    return {
      model:state?.model==='right',
      chain:state?.chain==='right',
      result:integer(state?.resultValue)===7,
      check:integer(state?.transferCheck)===25,
      reason:state?.reason==='whole'
    };
  }
  function cleanText(value,max=900){return typeof value==='string'?value.slice(0,max):'';}
  function sanitizeState(raw){
    const source=raw&&typeof raw==='object'?raw:{};
    const node=['start','minus6','divide2','solved'].includes(source.labNode)?source.labNode:'start';
    const view=Object.hasOwn(labStates,source.labView)?source.labView:node;
    return {
      coldChoices:uniqueAllowed(source.coldChoices,coldClaims.map(item=>item.id)),coldReason:cleanText(source.coldReason),coldUnsure:!!source.coldUnsure,
      labNode:node,labView:view,labPath:['minus6-divide2','divide2-minus3'].includes(source.labPath)?source.labPath:null,seenActions:uniqueAllowed(source.seenActions,['minus6','divide2','minus3','left-only','times0','reset']),zeroChoice:['information-lost','still-seven','false-equality'].includes(source.zeroChoice)?source.zeroChoice:null,checkValue:cleanText(source.checkValue,20),labReason:cleanText(source.labReason),labUnsure:!!source.labUnsure,labAttempted:!!source.labAttempted,
      model:transferModels.some(item=>item.id===source.model)?source.model:null,chain:transferChains.some(item=>item.id===source.chain)?source.chain:null,resultValue:cleanText(source.resultValue,20),transferCheck:cleanText(source.transferCheck,20),reason:transferReasons.some(item=>item.id===source.reason)?source.reason:null,transferExplanation:cleanText(source.transferExplanation),transferUnsure:!!source.transferUnsure,transferAttempted:!!source.transferAttempted
    };
  }

  const api={id,title,tasks,coldClaims,coldAnswer,labStates,transferModels,transferChains,transferReasons,sources,uniqueAllowed,sameSet,integer,stepLab,gradeLab,gradeTransfer,sanitizeState};
  root.EquationLesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
