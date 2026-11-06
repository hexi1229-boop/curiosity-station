'use strict';
(function(root){
  const tasks=[
    {title:'先留下关于四季的第一猜想',context:'同一个七月，天津是夏季，悉尼却是冬季。先不看模型，保存你的原因和理由。'},
    {title:'把一天和一年拆开验证',context:'亲手比较六月、十二月，转过一天，再把地轴倾角在0°与23.4°之间切换。'},
    {title:'换到零倾角行星独立迁移',context:'澄星会自转也会公转，但地轴不倾斜。判断它会不会出现地球式明显四季。'}
  ];
  const causes=[
    {id:'rotation',text:'主要因为地球每天自转'},
    {id:'distance',text:'主要因为夏季地球离太阳更近'},
    {id:'tilt-orbit',text:'主要因为地轴倾斜，并且地球绕太阳公转'},
    {id:'unsure',text:'暂时不确定，先留下猜想'}
  ];
  const evidence=[
    {id:'opposite',text:'同一时刻，南北半球离太阳几乎同样远，季节却相反'},
    {id:'distance',text:'北半球一月冬季接近近日点，七月夏季接近远日点'},
    {id:'daynight',text:'地球自转时，一个地点每天会轮流经过白天和黑夜'}
  ];
  const labClaims=[
    {id:'rotation-seasons',text:'自转让同一地点一年中太阳高度不断改变，所以产生四季'},
    {id:'distance-seasons',text:'日地距离的远近是南北半球季节相反的主要原因'},
    {id:'split',text:'自转主要形成昼夜；地轴倾斜与公转共同改变一年中的太阳高度和白昼长度'},
    {id:'orbit-alone',text:'只要绕太阳公转，即使地轴不倾斜也一定有地球式明显四季'}
  ];
  const planetClaims=[
    {id:'agree',text:'成立：只要会公转，就一定有地球式明显四季'},
    {id:'disagree',text:'不成立：有公转还不够，要检查倾角怎样改变全年光照'},
    {id:'unsure',text:'暂时不确定'}
  ];
  const yesNo=[{id:'yes',text:'会'},{id:'no',text:'不会'},{id:'unsure',text:'暂不确定'}];
  const planetReasons=[
    {id:'constant-light',text:'零倾角、近圆轨道下，同一纬度的太阳高度和白昼长度不会出现地球式年度强变化'},
    {id:'no-rotation',text:'零倾角会让行星停止自转，所以不会有昼夜'},
    {id:'farther',text:'400天的公转周期说明澄星一定比地球离太阳远'},
    {id:'same-temperature',text:'零倾角能证明澄星所有地方温度始终相同'}
  ];
  const months={
    june:{name:'六月',short:'6月',x:380,y:170,north:'北半球朝向太阳',altitude:'较高',daylight:'较长',direct:'直射点偏北'},
    december:{name:'十二月',short:'12月',x:100,y:170,north:'北半球背向太阳',altitude:'较低',daylight:'较短',direct:'直射点偏南'}
  };
  const allowed={
    cause:new Set(causes.map(item=>item.id)),evidence:new Set(evidence.map(item=>item.id)),labClaim:new Set(labClaims.map(item=>item.id)),month:new Set(Object.keys(months)),tilt:new Set(['tilted','zero']),planetClaim:new Set(planetClaims.map(item=>item.id)),yesNo:new Set(yesNo.map(item=>item.id)),planetReason:new Set(planetReasons.map(item=>item.id)),decision:new Set(['keep','change'])
  };
  const cleanText=(value,max=900)=>typeof value==='string'?value.slice(0,max):'';
  const cleanChoice=(value,set)=>set.has(value)?value:'';
  const cleanList=(value,set,max=8)=>Array.isArray(value)?[...new Set(value.filter(item=>set.has(item)))].slice(0,max):[];
  function meaningful(value,min=8){
    const text=String(value||'').trim(),chinese=(text.match(/[\u3400-\u9fff]/g)||[]).length,words=(text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[]).length;
    return chinese>=min||words>=Math.max(4,Math.ceil(min/2));
  }
  function sanitizeState(value={}){
    return {
      coldCause:cleanChoice(value.coldCause,allowed.cause),coldExplanation:cleanText(value.coldExplanation),coldSaved:!!value.coldSaved,
      evidenceViewed:cleanList(value.evidenceViewed,allowed.evidence,3),revisedCause:cleanChoice(value.revisedCause,allowed.cause),evidenceExplanation:cleanText(value.evidenceExplanation),evidenceDone:!!value.evidenceDone,
      month:cleanChoice(value.month,allowed.month)||'june',tilt:cleanChoice(value.tilt,allowed.tilt)||'tilted',monthsViewed:cleanList(value.monthsViewed,allowed.month,2),tiltsViewed:cleanList(value.tiltsViewed,allowed.tilt,2),spinHour:Number.isFinite(value.spinHour)?Math.max(0,Math.min(24,Math.round(value.spinHour))):0,spinCompleted:!!value.spinCompleted,labClaim:cleanChoice(value.labClaim,allowed.labClaim),labExplanation:cleanText(value.labExplanation),labAttempted:!!value.labAttempted,
      planetClaim:cleanChoice(value.planetClaim,allowed.planetClaim),planetDaynight:cleanChoice(value.planetDaynight,allowed.yesNo),planetSeasons:cleanChoice(value.planetSeasons,allowed.yesNo),planetExplanation:cleanText(value.planetExplanation),planetSaved:!!value.planetSaved,
      reviewClaim:cleanChoice(value.reviewClaim,allowed.planetClaim),reviewDaynight:cleanChoice(value.reviewDaynight,allowed.yesNo),reviewSeasons:cleanChoice(value.reviewSeasons,allowed.yesNo),reviewReason:cleanChoice(value.reviewReason,allowed.planetReason),reviewExplanation:cleanText(value.reviewExplanation),revisionDecision:cleanChoice(value.revisionDecision,allowed.decision),reviewAttempted:!!value.reviewAttempted,hintUsed:!!value.hintUsed
    };
  }
  function labObservation(state){
    const month=months[state.month]||months.june;
    if(state.tilt==='zero')return {altitude:'全年近似不变',daylight:'全年约相同',direct:'直射点近赤道',north:'地轴不向太阳倾斜'};
    return {altitude:month.altitude,daylight:month.daylight,direct:month.direct,north:month.north};
  }
  function gradeEvidence(state){return {evidence:evidence.every(item=>(state.evidenceViewed||[]).includes(item.id)),cause:state.revisedCause==='tilt-orbit',reason:meaningful(state.evidenceExplanation)};}
  function gradeLab(state){return {months:['june','december'].every(id=>(state.monthsViewed||[]).includes(id)),tilts:['tilted','zero'].every(id=>(state.tiltsViewed||[]).includes(id)),spin:state.spinCompleted===true,claim:state.labClaim==='split',reason:meaningful(state.labExplanation)};}
  function gradeTransfer(state){return {claim:state.reviewClaim==='disagree',daynight:state.reviewDaynight==='yes',seasons:state.reviewSeasons==='no',reason:state.reviewReason==='constant-light',explanation:meaningful(state.reviewExplanation)};}
  const lesson={id:'seasons',title:'地球为什么一边自转，一边还会有四季？',tasks,causes,evidence,labClaims,planetClaims,yesNo,planetReasons,months,sanitizeState,meaningful,labObservation,gradeEvidence,gradeLab,gradeTransfer};
  root.SeasonsLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
