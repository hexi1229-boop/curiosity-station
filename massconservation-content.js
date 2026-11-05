/* Original teaching models aligned to the 2022 chemistry curriculum standard; no real experiment is instructed. */
(function(root){
  'use strict';
  const lesson={
    id:'massconservation',
    title:'反应前后，究竟是什么不能凭空少掉？',
    curriculumUrl:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020230605524875861384.pdf',
    catalogUrl:'https://www.pep.com.cn/products/jc/czjks/201510/t20151026_1250821.shtml',
    coldChoices:[
      {id:'gone',text:'少掉的2克物质凭空消失了'},
      {id:'broken',text:'这个反应不遵守质量守恒'},
      {id:'boundary',text:'只看秤还不能下结论，要先查有没有物质进出称量范围'}
    ],
    atomExample:{
      before:[['H','H'],['H','H'],['O','O']],
      after:[['H','H','O'],['H','H','O']]
    },
    atomCandidates:[
      {id:'missing-x',label:'候选 A',text:'候选 A：2组 XY（2个X、2个Y）',molecules:[['X','Y'],['X','Y']]},
      {id:'balanced',label:'候选 B',text:'候选 B：2组 X₂Y（4个X、2个Y）',molecules:[['X','X','Y'],['X','X','Y']]},
      {id:'extra-y',label:'候选 C',text:'候选 C：1组 X₂Y、1组 XY₂（3个X、3个Y）',molecules:[['X','X','Y'],['X','Y','Y']]}
    ],
    copper:{start:6.4,oxygen:1.6,product:8.0},
    copperBoundaries:[
      {id:'copper-only',text:'只把原来的铜算进系统'},
      {id:'copper-oxygen',text:'把铜和从空气进入的氧气一起算进系统'},
      {id:'whole-room',text:'必须把整间教室都放上秤'}
    ],
    copperFlows:[
      {id:'oxygen-in',text:'氧气从空气进入所称物质'},
      {id:'gas-out',text:'有气体从所称物质逸出'},
      {id:'none',text:'没有任何物质跨过边界'}
    ],
    rules:[
      {id:'conserved',text:'把进出的物质纳入同一系统后，反应前后总质量仍守恒'},
      {id:'closed-only',text:'只有密闭装置才遵守质量守恒'},
      {id:'every-substance',text:'反应前后每一种物质的质量都分别不变'}
    ],
    transferReports:[
      {id:'a',title:'报告 A · 读数下降',text:'敞口装置中发生虚拟产气过程，反应后装置读数下降。',options:[
        {id:'gas-out',text:'气体离开了所称系统'},
        {id:'mass-gone',text:'质量凭空消失'},
        {id:'oxygen-in',text:'空气中的氧进入系统'}
      ],answer:'gas-out'},
      {id:'b',title:'报告 B · 读数上升',text:'敞口放置的金属与空气中的氧反应，反应后样品读数上升。',options:[
        {id:'gas-out',text:'气体离开了所称系统'},
        {id:'new-mass',text:'反应凭空造出质量'},
        {id:'oxygen-in',text:'空气中的氧进入了所称系统'}
      ],answer:'oxygen-in'}
    ],
    atomHints:[
      '不要数“分子有几个”，先分别数每一种字母原子。',
      '反应前有4个X、2个Y；合格候选也必须逐种对上。'
    ],
    copperHints:[
      '样品变重时，先问新增质量可能从边界哪一侧进入。',
      '8.0 − 6.4 = 1.6；这部分来自进入系统的氧气。'
    ],
    transferHints:[
      '两份报告的读数方向相反，但都先画“秤正在称什么”的边界。',
      'A找离开的物质，B找进入的物质；再用同一句守恒结论解释。'
    ],
    tasks:[
      {title:'秤轻了，物质消失了吗？',context:'模型前判断不即时判分。'},
      {title:'分子换了，原子账还能对上吗？',context:'先看H/O示例，再用X/Y独立清点。'},
      {title:'秤到底在称什么？',context:'先切换密闭与敞口边界，再解释铜吸收氧的虚拟数据。'},
      {title:'两份相反读数，能用同一原则解释吗？',context:'独立识别气体逸出、氧气进入和共同边界。'}
    ]
  };

  const unique=value=>[...new Set(Array.isArray(value)?value:[])];
  const sameSet=(a,b)=>{const clean=unique(a);return clean.length===b.length&&b.every(item=>clean.includes(item));};
  lesson.countAtoms=molecules=>{
    if(!Array.isArray(molecules))return null;
    const counts={};
    for(const molecule of molecules){
      if(!Array.isArray(molecule)||!molecule.length)return null;
      for(const atom of molecule){if(typeof atom!=='string'||!/^[A-Z][a-z]?$/.test(atom))return null;counts[atom]=(counts[atom]||0)+1;}
    }
    return counts;
  };
  lesson.sameAtomInventory=(before,after)=>{
    const a=lesson.countAtoms(before),b=lesson.countAtoms(after);if(!a||!b)return false;
    const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];return keys.every(key=>a[key]===b[key]);
  };
  lesson.numericValue=value=>{
    if(typeof value==='string'&&!/^\s*[-+]?\d+(?:\.\d+)?\s*$/.test(value))return NaN;
    const number=Number(value);return Number.isFinite(number)?number:NaN;
  };
  lesson.systemReading=value=>{
    const start=lesson.numericValue(value?.start),entered=lesson.numericValue(value?.entered??0),left=lesson.numericValue(value?.left??0);
    return [start,entered,left].every(Number.isFinite)?start+entered-left:NaN;
  };
  lesson.gradeAtom=state=>({
    guide:sameSet(state?.atomGuideSeen,['H','O']),
    choice:state?.atomChoice==='balanced',
    get correct(){return this.guide&&this.choice;}
  });
  lesson.gradeCopper=state=>{
    const mass=lesson.numericValue(state?.copperOxygenMass);
    const parts={
      guide:sameSet(state?.boundarySeen,['closed','open']),
      boundary:state?.copperBoundary==='copper-oxygen',
      flow:state?.copperFlow==='oxygen-in',
      mass:Number.isFinite(mass)&&Math.abs(mass-lesson.copper.oxygen)<1e-9,
      rule:state?.copperRule==='conserved'
    };
    return {...parts,correct:Object.values(parts).every(Boolean)};
  };
  lesson.gradeTransfer=state=>{
    const reports=state?.transferAnswers||{};
    const parts={a:reports.a==='gas-out',b:reports.b==='oxygen-in',rule:state?.transferRule==='conserved'};
    return {...parts,correct:Object.values(parts).every(Boolean)};
  };

  const ids=(list)=>list.map(item=>item.id);
  const oneOf=(value,allowed)=>allowed.includes(value)?value:'';
  const strings=(value,allowed)=>unique(value).filter(item=>allowed.includes(item)).slice(0,allowed.length);
  const text=(value,max)=>typeof value==='string'?value.slice(0,max):'';
  const bool=value=>value===true;
  lesson.sanitizeState=raw=>{
    const source=raw&&typeof raw==='object'?raw:{};
    const transferAnswers={};
    lesson.transferReports.forEach(report=>{const answer=oneOf(source.transferAnswers?.[report.id],ids(report.options));if(answer)transferAnswers[report.id]=answer;});
    return {
      coldChoice:oneOf(source.coldChoice,ids(lesson.coldChoices)),coldReason:text(source.coldReason,700),coldUnsure:bool(source.coldUnsure),
      atomGuideSeen:strings(source.atomGuideSeen,['H','O']),atomChoice:oneOf(source.atomChoice,ids(lesson.atomCandidates)),atomReason:text(source.atomReason,700),atomUnsure:bool(source.atomUnsure),atomAttempted:bool(source.atomAttempted),atomHintLevel:Math.max(0,Math.min(lesson.atomHints.length,Number.isInteger(source.atomHintLevel)?source.atomHintLevel:0)),
      boundarySeen:strings(source.boundarySeen,['closed','open']),boundaryMode:oneOf(source.boundaryMode,['closed','open'])||'closed',
      copperBoundary:oneOf(source.copperBoundary,ids(lesson.copperBoundaries)),copperFlow:oneOf(source.copperFlow,ids(lesson.copperFlows)),copperOxygenMass:text(source.copperOxygenMass,20),copperRule:oneOf(source.copperRule,ids(lesson.rules)),copperReason:text(source.copperReason,700),copperUnsure:bool(source.copperUnsure),copperAttempted:bool(source.copperAttempted),copperHintLevel:Math.max(0,Math.min(lesson.copperHints.length,Number.isInteger(source.copperHintLevel)?source.copperHintLevel:0)),
      transferAnswers,transferRule:oneOf(source.transferRule,ids(lesson.rules)),transferReason:text(source.transferReason,700),transferUnsure:bool(source.transferUnsure),transferAttempted:bool(source.transferAttempted),transferHintLevel:Math.max(0,Math.min(lesson.transferHints.length,Number.isInteger(source.transferHintLevel)?source.transferHintLevel:0))
    };
  };
  root.MassConservationLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
