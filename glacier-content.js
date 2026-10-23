(function(root){
  'use strict';
  const title='冰河时代调查局：这片没有冰的山谷，曾经有冰川吗？';
  const tasks=[
    {title:'先判断：一幅山谷图够不够？',context:'北谷现在没有冰，谷底较宽、两侧较陡。只有原创景观示意图，尚无年代、岩石和岩面调查资料。'},
    {title:'动手验证：痕迹怎样形成，现场该查什么？',context:'先预测，再观察同样运动的冰是否夹带碎石的对照；从北谷现场资料中选依据，并解释痕迹和形成过程的关系。'},
    {title:'独立迁移：南坡的新档案支持什么结论？',context:'改用简图、观测与施工档案，判断沟槽和外来岩块的来源；说明目前能推断什么、还缺什么。'}
  ];
  const initial=['能确定：谷底宽就是充分证据','还不能确定，需要其他线索','能确定从来没有：现在看不到冰'];
  const predictions=['夹带碎石的一组，会留下碎石磨出的擦痕','只要冰移动，两组都会磨出同样的擦痕','两组都不会留下碎石磨出的擦痕'];
  const verdicts=['可以确认这里过去有冰川','可以确认这里从来没有冰川','这些材料还不足以确认，也不能排除'];
  const north=[
    {id:'a',tag:'A · 岩面记录',title:'裸露基岩上的成组细痕',text:'多处岩面有细长、近乎平行的擦痕，轴向大致沿谷地延伸。调查范围内未发现施工记录。',figure:'scratches'},
    {id:'b',tag:'B · 岩石来源',title:'与谷底基岩不同的岩块',text:'谷底基岩为灰色石灰岩，却散落粉色花岗岩块。更高处的谷地有同类花岗岩露头；未发现人为运入记录。',figure:'rocks'},
    {id:'c',tag:'C · 当天观测',title:'早晨很冷',text:'今天早晨测得 −6℃，草叶上有霜。',figure:'weather'}
  ];
  const south=[
    {id:'a',tag:'档案 01 · 现场速写',title:'谷地与路旁',text:'谷底开阔。路旁基岩上有几条平行深沟，旁边堆着粉色岩块；当地基岩为灰色石灰岩。'},
    {id:'b',tag:'档案 02 · 施工记录',title:'沟槽的位置对得上',text:'去年道路维修照片显示：机械在图中同一处基岩上留下了这些沟槽。'},
    {id:'c',tag:'档案 03 · 运料清单',title:'岩块的来路查到了',text:'清单及现场编号对应：图中这批粉色岩块从外地采石场运来，用于道路护坡。'},
    {id:'d',tag:'档案 04 · 当天观测',title:'今天的温度',text:'今晨 1℃。没有提供未被施工影响区域的地质调查，也没有古环境年代测定。'}
  ];
  // Qualitative mechanism model only: progress has no years, distances or erosion rates.
  // Both groups follow the same path. Only embedded grit differs. The final fade
  // represents melting in place, not a glacier flowing backward during retreat.
  function model(progress,grit){
    if(!Number.isFinite(progress)||progress<0||progress>100||typeof grit!=='boolean')throw new Error('Invalid glacier model input');
    const travel=Math.min(progress/70,1),melt=Math.max(0,(progress-70)/30);
    return {travel,melt,iceX:35+220*travel,iceOpacity:1-melt,rockX:100+220*travel,
      scratchLength:grit?220*travel:0,rockVisible:grit,deposited:grit&&progress===100};
  }
  function validate(index,input){
    if(index===0||index===2){const opts=index===0?initial:verdicts;if(!Number.isInteger(input.choice)||!opts[input.choice])return '先选一个判断；证据不足也是可以认真作出的判断。';}
    if(index===1&&!input.observed)return '先运行对照，或拖动时间到终点，看看冰消失后留下什么。';
    if(index>0&&(!Array.isArray(input.evidence)||input.evidence.length>2||input.evidence.some(id=>!(index===1?north:south).some(c=>c.id===id))))return '请从档案中选择至多两条依据。';
    if(index>0&&input.evidence.length===0&&!input.unsure)return '请选至少一条依据，或如实勾选“暂时说不清”。';
    if(!String(input.reason||'').trim()&&!input.unsure)return '留一句与判断有关的理由，或勾选“暂时说不清”。';
    return '';
  }
  const api={title,tasks,initial,predictions,verdicts,north,south,model,validate};
  root.GlacierLesson=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
