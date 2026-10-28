(function(root){
  'use strict';
  const id='journey';
  const title='人停了，图上的线为什么还在？';
  const tasks=[
    {title:'先判断：水平的线，说明人正在做什么？',context:'小宇沿同一条直路从家出发，始终在家的同一侧活动。图的横轴是经过时间（分钟），纵轴是离家的距离（米），依次经过（0，0）、（4，600）、（6，600）、（10，0）。第 4—6 分钟，他在做什么？'},
    {title:'动手验证：返回家，走过的路会减少吗？',context:'同一段行程换两种纵轴：离家的距离，或累计走过的路程。从家走到 600 米处用 4 分钟，停留 2 分钟，再沿原路匀速返回。拖动到返程阶段，比较人的位置和两张图；返程可改为 2、4 或 6 分钟。'},
    {title:'独立迁移：机器人不是从基站出发的',context:'机器人始终在基站同一侧的一条直路上。开始时离基站 200 米，离基站距离—时间图依次经过（0，200）、（4，600）、（6，600）、（10，0），每一线段内匀速或静止。10 分钟里，它累计走过多少米？'},
    {title:'换一种量：水箱的水平线，能证明阀门关了吗？',context:'水箱可以同时进水和出水，不漏水，忽略蒸发。水量—时间图依次经过（0，30）、（3，90）、（5，90）、（8，45），单位是分钟和升。设备员写道：“3—5 分钟是水平线，说明两个阀门都关了；5—8 分钟下降，说明每分钟流出 45 升。”请修改记录，区分能确定的事和还不能确定的事。'}
  ];
  const initial=['仍在这条直路上继续向前走','停在离家 600 米处，持续 2 分钟','这 2 分钟正沿原路走回家'];
  const robot={
    points:[{t:0,y:200},{t:4,y:600},{t:6,y:600},{t:10,y:0}],
    answer:1000,
    context:'计时 0 分时，机器人已在距基站 200 米处，只计算图中这 10 分钟的累计路程。它沿直路在基站同侧活动，图上高度表示离基站的距离；各线段内匀速或静止。',
    reference:'先向远处走 600−200＝400 米，停留时走了 0 米，再返回基站走 600 米。累计路程为 400＋0＋600＝1000 米。起点的 200 米是开始时的位置，不是这 10 分钟内已经走过的路。'
  };
  const tank={
    points:[{t:0,y:30},{t:3,y:90},{t:5,y:90},{t:8,y:45}],
    context:'纵轴是水箱内的水量（升），横轴是经过时间（分钟）。图上各段为直线。进水管、出水管可以同时工作；水箱不漏水，忽略蒸发。没有给出任一根管道的单独流量。',
    reference:'3—5 分钟水量保持 90 升，只能确定进水与出水相抵，净变化为 0；两个阀门都关闭是一种可能，也可能一边进水、一边以相同流量出水。5—8 分钟水量共减少 90−45＝45 升，用了 3 分钟，平均每分钟净减少 15 升。该段是直线，表示净减少速率保持为每分钟 15 升；它不直接给出出水管的流量。只有另外知道没有进水，才能说每分钟出水 15 升。',
    checks:['水平线表示水量不变，不能单凭它确定两个阀门都关闭。','45 升是 3 分钟内的净减少量；平均每分钟净减少 15 升。','水箱的净变化＝进水量−出水量；只有已知进水为 0 时，净减少量才等于出水量。']
  };
  function duration(value){
    if(![2,4,6].includes(value))throw new RangeError('Invalid return duration');
    return 6+value;
  }
  function walk(time,returnMinutes=4){
    const end=duration(returnMinutes);
    if(typeof time!=='number'||!Number.isFinite(time)||time<0||time>end)throw new RangeError('Invalid journey time');
    const distance=time<=4?150*time:time<=6?600:600*(end-time)/returnMinutes;
    const cumulative=time<=4?150*time:time<=6?600:600+600*(time-6)/returnMinutes;
    // The phase labels use [0,4), [4,6), [6,end), and the end point.
    // At a phase boundary the model has no instantaneous-speed claim.
    const phase=time<4?'outbound':time<6?'pause':time<end?'return':'finished';
    const rate=time===4||time===6||time===end?null:phase==='outbound'?150:phase==='pause'?0:600/returnMinutes;
    return {time,distance,cumulative,phase,end,rate};
  }
  function series(mode,returnMinutes=4,until=6+returnMinutes){
    if(mode!=='distance'&&mode!=='cumulative')throw new RangeError('Invalid graph mode');
    const current=walk(until,returnMinutes);
    const times=[0,4,6,current.end].filter(t=>t<=until);
    if(times[times.length-1]!==until)times.push(until);
    return times.map(t=>({t,y:walk(t,returnMinutes)[mode]}));
  }
  function validate(index,input){
    if(!Number.isInteger(index)||index<0||index>=tasks.length)throw new RangeError('Invalid journey task index');
    input=input&&typeof input==='object'?input:{};
    if(index===0&&(!Number.isInteger(input.choice)||input.choice<0||input.choice>=initial.length))return '先选一个判断，再留下理由；暂时说不清也可以如实记录。';
    if(index===1){
      try{duration(input.returnMinutes);walk(input.time,input.returnMinutes);if(input.mode!=='distance'&&input.mode!=='cumulative')throw new RangeError('Invalid graph mode');}catch(e){return '先用时间滑块观察一段合法的行程，再留下发现。';}
      if(input.time<=6)return '把时间滑块拖到第 6 分钟以后，看看返程时人的位置和图怎样变化。';
    }
    if(index===2){
      if(input.unsure===true)return '';
      const text=typeof input.answer==='number'?String(input.answer):typeof input.answer==='string'?input.answer.trim():'';
      if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)||!Number.isFinite(Number(text)))return '填一个非负数字（单位：米）；暂时不能确定，也可以如实勾选。';
    }
    if(!(typeof input.reason==='string'&&input.reason.trim())&&input.unsure!==true)return '留一句与你的判断或操作有关的理由，或勾选“暂时说不清”。';
    return '';
  }
  const sources=[
    {title:'OpenStax：位置、位移与路程',url:'https://openstax.org/books/college-physics-2e/pages/2-1-displacement'},
    {title:'OpenStax：一维运动的图像分析',url:'https://openstax.org/books/college-physics-2e/pages/2-8-graphical-analysis-of-one-dimensional-motion'}
  ];
  const api={id,title,tasks,initial,robot,tank,walk,series,validate,sources};
  root.JourneyLesson=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
