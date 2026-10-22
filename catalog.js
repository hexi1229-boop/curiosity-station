/* Course discovery metadata; stable lesson URLs and evidence stay in LearningFeedback. */
(function(root){
  'use strict';
  const items=[
    {id:'negative',name:'零下8℃和零下3℃，哪里更暖？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['负数','数轴','绝对值','相反数','比较'],description:'调节温度计与数轴，分清数更大和离零更远，再迁移到海面下的位置。',icon:'−3',time:'8–12 分钟',fresh:true},
    {id:'now',name:'平时常做，还是此刻正在做？',subject:'英语',group:'school',stages:['六年级','初中衔接','七年级'],tags:['一般现在时','现在进行时','语法','口语','词汇','习惯'],description:'切换日常周历与此刻镜头，再用英语说出自己的习惯和正在做的事。',icon:'am',time:'8–12 分钟'},
    {id:'tomato',name:'一颗番茄，是组织还是器官？',subject:'生物',group:'school',stages:['初中衔接','七年级'],tags:['结构层次','细胞','组织','器官','系统','植物'],description:'从整株番茄看到一个细胞，亲手排列层次，再用组成和功能说明理由。',icon:'◎',time:'8–12 分钟'},
    {id:'change',name:'冒泡了，就一定发生化学变化吗？',subject:'化学',group:'school',stages:['初中衔接','九年级'],tags:['物理变化','化学变化','新物质','分子','原子','证据'],description:'比较沸腾与电解，区分眼前的现象和判断变化的证据。',icon:'H₂O',time:'8–12 分钟'},
    {id:'map',name:'地图转了，北方也会跟着转吗？',subject:'地理',group:'school',stages:['初中衔接','七年级'],tags:['地图判读','方向','指向标','参照点','比例尺','路线'],description:'转动一张地图，找准方向，再用自己的话给朋友指路。',icon:'N↗',time:'8–12 分钟'},
    {id:'speed',name:'跑得远，就一定更快吗？',subject:'物理',group:'school',stages:['初中衔接','八年级'],tags:['平均速度','路程','时间','单位换算','运动'],description:'改变用时，比较同样时间里的路程，再看途中停留怎样影响平均速度。',icon:'m/s',time:'8–12 分钟'},
    {id:'equation',name:'神秘货箱有多重？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['一元一次方程','等式','天秤','移项','检验'],description:'亲手改变天秤两边，看清解方程的每一步为什么成立。',icon:'x＝?',time:'8–12 分钟'},
    {id:'reading',name:'这句话能证明你的答案吗？',subject:'语文',group:'school',stages:['六年级','初中衔接'],tags:['阅读理解','依据','推断','分点回答'],description:'从短文里找依据，把“我觉得”说得有根有据。',icon:'证',time:'8–12 分钟'},
    {id:'english',name:'你会选一只机器狗吗？',subject:'英语',group:'school',stages:['六年级','初中衔接'],tags:['口语','词汇','听力','表达'],description:'听懂一个想法，用英语说出自己的选择和理由。',icon:'Aa',time:'8–10 分钟'},
    {id:'math',name:'圆，遇上正方形',subject:'数学',group:'school',stages:['六年级'],tags:['圆','周长','面积','组合图形','内切','外接'],description:'分清周长与面积，看懂圆与正方形套在一起怎么算。',icon:'◎',time:'8–12 分钟'},
    {id:'scale',name:'造一枚迷你火箭',subject:'数学',group:'school',stages:['六年级','初中衔接'],tags:['比例尺','单位换算','缩放'],description:'把 20 米的原型，变成放得进盒子的模型。',icon:'1∶n',time:'8–10 分钟'},
    {id:'chinese',name:'换个角度，说清楚',subject:'语文',group:'school',stages:['六年级'],tags:['句式转换','转述句','人称'],description:'转述别人的话，改对人称，也把原意保留下来。',icon:'“ ”',time:'8–10 分钟'},
    {id:'balance',name:'9 个果子，只称 2 次？',subject:'数学',group:'school',stages:['六年级','初中衔接'],tags:['天秤','排除','推理','信息'],description:'亲手称出更重的那个，说清为什么两次一定够。',icon:'⚖',time:'8–10 分钟'},
    {id:'charts',name:'两张图都没造假，为什么结论相反？',subject:'数学',group:'explore',stages:['六年级','初中衔接'],tags:['统计图','坐标轴','数据','百分比'],description:'先判断，再拖动坐标轴，看看数字怎样影响印象。',icon:'▥',time:'8–10 分钟'},
    {id:'rocket',name:'火箭为什么要回收？',subject:'科学',group:'explore',stages:['六年级','初中衔接'],tags:['火箭','回收','成本','决策','太空'],description:'看一级助推器回来，再算算什么时候更划算。',icon:'↗',time:'8–10 分钟'}
  ];
  function latest(sessions){const byCourse={};for(const s of [...sessions].sort((a,b)=>b.updatedAt-a.updatedAt))if(!byCourse[s.courseId])byCourse[s.courseId]=s;return byCourse;}
  function select({group='all',subject='all',stage='all',query=''}={}){const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);return items.filter(c=>(group==='all'||c.group===group)&&(subject==='all'||c.subject===subject)&&(stage==='all'||c.stages.includes(stage))&&words.every(w=>[c.name,c.subject,...c.tags,...c.stages].join(' ').toLocaleLowerCase().includes(w)));}
  function home(sessions){const progress=latest(sessions);const continuing=items.filter(c=>progress[c.id]?.records.some(r=>!r.done)).sort((a,b)=>progress[b.id].updatedAt-progress[a.id].updatedAt)[0];const featured=continuing||items.find(c=>c.group==='school'&&!progress[c.id]?.records.every(r=>r.done))||items[0];const candidates=items.filter(c=>c.group==='school'&&c!==featured);candidates.sort((a,b)=>Number(!!progress[a.id]?.records.every(r=>r.done))-Number(!!progress[b.id]?.records.every(r=>r.done)));return {continuing,featured,school:candidates.slice(0,2),explore:items.find(c=>c.id==='charts'),progress};}
  root.CourseCatalog={items,latest,select,home};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.CourseCatalog;
})(typeof window!=='undefined'?window:globalThis);
