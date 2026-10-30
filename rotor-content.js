/* Course contract and learner-facing prompts for the standalone rotor lesson. */
(function(root){
  'use strict';
  const title='空气往下走，无人机为什么往上？';
  const tasks=[
    {title:'空气流走，向上的力会断吗？',context:'先留下自己的判断，再用连续气流动画核对空气与旋翼之间的相互作用。'},
    {title:'悬停与上升，推力怎样变？',context:'调节旋翼转速，分清推力、重力、速度和加速度。'},
    {title:'换到水里，反作用还能找出来吗？',context:'换介质、换方向、换信息形式，独立找出水和探测器之间的相互作用。'}
  ];
  const sourceChoices=[
    '气流撞到地面再弹回来，把无人机顶上去',
    '旋翼不断让新空气向下加速，空气同时向上推旋翼',
    '空气既然向下流，无人机也应该被空气带着向下'
  ];
  const transferPrompts=[
    {key:'changed',label:'螺旋桨直接推动哪种介质？',options:[['水','water'],['探测器','robot'],['池壁','wall']],answer:'water'},
    {key:'motion',label:'正常转动时，这部分水怎样改变？',options:[['向后加速','backward'],['向前加速','forward'],['停在原地','still']],answer:'backward'},
    {key:'force',label:'与此同时，水给探测器的力朝哪边？',options:[['向后','backward'],['向前','forward'],['没有力','none']],answer:'forward'}
  ];
  root.RotorLesson={id:'rotor',title,tasks,sourceChoices,sourceAnswer:1,transferPrompts};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.RotorLesson;
})(typeof window!=='undefined'?window:globalThis);
