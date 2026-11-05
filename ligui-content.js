'use strict';
(function(root){
  const title='利簋写下“甲子朝”，为什么还不能直接换算年份？';
  const tasks=[
    {title:'先封存：铭文写了“甲子朝”，等于写了公元年份吗？',context:'先区分青铜器原始信息和现代年代标签。'},
    {title:'六十日轮：同一个“甲子”会回来多少次？',context:'用十天干、十二地支的循环亲手验证相对日序与绝对日期的区别。'},
    {title:'年代约束台：公元前1046年为什么需要多层证据？',context:'审核原铭、通行释读、考古范围与多学科综合结论。'},
    {title:'独立迁移：四套方案，哪一套真正通过全部约束？',context:'使用明确标注的教学模拟档案，独立完成约束求交。'}
  ];
  const initialOptions=[
    {id:'written',text:'铭文直接写出了“公元前1046年1月20日”。'},
    {id:'lookup',text:'只要看见“甲子”，翻一张干支表就能得到唯一公元年份。'},
    {id:'anchor',text:'“甲子”给出循环日名；要落到公元年份，还需要独立的年代锚点。'},
    {id:'unknowable',text:'既然会循环，古代事件的年代就永远无法研究。'}
  ];
  const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  function dayName(day){
    const index=Math.max(1,Math.trunc(Number(day)||1))-1;
    return stems[index%stems.length]+branches[index%branches.length];
  }
  const cycleOptions=[
    {id:'anchor',text:'甲子每60日再次出现；它能定位循环中的位置，却不能单独告诉我们是哪一年。'},
    {id:'annual',text:'甲子每年只出现一次，所以知道甲子就等于知道年份。'},
    {id:'unique',text:'历史上只有一个甲子日，其他甲子都是后人补出来的。'}
  ];
  const cycleHints=[
    '先看两个小齿轮：天干10格、地支12格，要等到两边同时回到起点。',
    '10和12的最小公倍数是60，所以第1、61、121日会出现同一个组合。',
    '“甲子到辛未相隔7日”能建立事件内部顺序；它仍没有告诉你这是公元哪一年。'
  ];
  const gates=[
    {
      id:'bronze',step:'01',title:'青铜器与铭文',kind:'铭文信息（通行释读）',
      effect:'按国博通行释读，“武征商，唯甲子朝”把武王征商与一个甲子日的早晨联系起来；后文还有“辛未”。',
      boundary:'它没有出现“公元前1046年”这样的现代纪年数字。'
    },
    {
      id:'archaeology',step:'02',title:'考古分期与测年',kind:'范围约束',
      effect:'器物类型、地层关系和碳十四测年帮助收窄商末周初相关遗存的年代范围，从而限制事件的候选年份。',
      boundary:'范围测年通常不能独自精确到某一个清晨。'
    },
    {
      id:'interpretation',step:'03',title:'文献、历法与天象',kind:'解释约束',
      effect:'《尚书》等传世文献也记甲子清晨；研究者再比较月份、月相、天象和历法。',
      boundary:'“岁鼎”等字句怎样断读、怎样对应天象仍有不同意见，解释前提必须写出来。'
    },
    {
      id:'synthesis',step:'04',title:'金文历谱与整体年表',kind:'交叉校验',
      effect:'把候选方案接到西周早期其他铭文与王年顺序中，形成“金文历谱”，检查哪套方案整体冲突最少。',
      boundary:'夏商周断代工程采用公元前1046年，是多类证据“综合拟合”（共同检验后找整体最匹配方案）的结果。'
    }
  ];
  const ratings=[
    {id:'direct',text:'原铭及通行释读支持'},
    {id:'synthesis',text:'多证据综合结论'},
    {id:'overreach',text:'说得超过证据'}
  ];
  const claims=[
    {id:'event',text:'按国博通行释读，利簋铭文把武王征商与“甲子朝”联系起来。',expected:'direct'},
    {id:'year',text:'公元前1046年是夏商周断代工程综合多学科材料后采用的年代坐标。',expected:'synthesis'},
    {id:'literal',text:'利簋原铭直接写着“公元前1046年1月20日”。',expected:'overreach'}
  ];
  const chainHints=[
    '先问这句话能不能在原铭中直接找到，而不是问它最终是否常见于教材。',
    '“采用的年代坐标”可以有充分依据，但仍要和“器物上直接写着”分开。',
    '结论越精确，需要通过的独立约束通常越多。'
  ];
  const transfer={
    label:'独立迁移 · 教学模拟档案，不是真实出土铭文或天象记录',
    record:'木牍节录：王五年，戊辰夜见月食；次日修海堤。',
    note:'研究组先提出四个候选方案。每项外部约束都由不同材料提供；表中的“符合／冲突”是为本题设定的数据。',
    constraints:[
      {id:'wood',short:'木材年轮',title:'堤木砍伐范围',description:'检验候选年是否落在木材可能使用的时间范围内。'},
      {id:'reign',short:'王年表',title:'王五年顺序',description:'检验候选年能否与已经重建的王位顺序衔接。'},
      {id:'eclipse',short:'天象复算',title:'戊辰夜月食',description:'检验该候选方案下，戊辰夜是否出现记录所说的月食。'}
    ],
    candidates:[
      {id:'A',label:'方案 A',checks:{wood:true,reign:true,eclipse:false}},
      {id:'B',label:'方案 B',checks:{wood:true,reign:true,eclipse:true}},
      {id:'C',label:'方案 C',checks:{wood:false,reign:true,eclipse:true}},
      {id:'D',label:'方案 D',checks:{wood:true,reign:false,eclipse:true}}
    ]
  };
  const transferConclusions=[
    {id:'literal',text:'木牍已经直接写出了方案B对应的公元年份。'},
    {id:'bestfit',text:'在这三项材料及其解释成立的前提下，只有方案B同时符合，所以它目前最匹配。'},
    {id:'nothing',text:'起初有四个方案，说明任何历史年代都不可能判断。'}
  ];
  const transferHints=[
    '不要先挑“看着顺眼”的字母；逐列检查哪个方案出现了冲突。',
    'A卡在天象，C卡在木材范围，D卡在王年顺序。',
    '“通过当前全部约束”仍不等于“木牍直接写出了公元年份”。'
  ];
  function gradeInitial(id){return id==='anchor';}
  function gradeCycle(found,choice,sawXinwei){
    const values=Array.isArray(found)?[...new Set(found.map(Number))]:[];
    const repeats=[61,121].every(day=>values.includes(day));
    return {repeats,interval:!!sawXinwei,choice:choice==='anchor',correct:repeats&&!!sawXinwei&&choice==='anchor'};
  }
  function gradeClaims(values){
    const answers=values&&typeof values==='object'?values:{};
    const detail=claims.map(claim=>({id:claim.id,expected:claim.expected,actual:answers[claim.id]||null,correct:answers[claim.id]===claim.expected}));
    return {detail,correct:detail.every(item=>item.correct),count:detail.filter(item=>item.correct).length,total:detail.length};
  }
  function remainingCandidates(applied){
    const keys=new Set(Array.isArray(applied)?applied:[]);
    return transfer.candidates.filter(candidate=>[...keys].every(key=>candidate.checks[key]===true)).map(candidate=>candidate.id);
  }
  function gradeTransfer(applied,candidate,conclusion){
    const keys=new Set(Array.isArray(applied)?applied:[]);
    const all=transfer.constraints.every(item=>keys.has(item.id));
    const remaining=remainingCandidates(applied);
    return {all,remaining,candidate:candidate==='B',conclusion:conclusion==='bestfit',correct:all&&remaining.length===1&&remaining[0]==='B'&&candidate==='B'&&conclusion==='bestfit'};
  }
  const lesson={
    id:'ligui',title,tasks,initialOptions,stems,branches,dayName,cycleOptions,cycleHints,
    gates,ratings,claims,chainHints,transfer,transferConclusions,transferHints,
    gradeInitial,gradeCycle,gradeClaims,remainingCandidates,gradeTransfer
  };
  root.LiguiLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
