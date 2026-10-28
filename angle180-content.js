/* Geometry proof G0: angle measure, straight angles and vertical angles. */
(function(root){
  'use strict';
  const id='angle180';
  const title='180°从哪里来？角到底在量什么？';
  const tasks=[
    {title:'边拉长、图转向，角会跟着变吗？',context:'先留下判断，再分别改变射线长度、整图朝向和开口大小；最后换一组没有度数的图独立判断。'},
    {title:'平角为什么正好是180°？',context:'区分角度制的单位约定、平角的定义关系与需要证明的几何定理。'},
    {title:'不量角，怎样证明对顶角相等？',context:'先看一个可拖动示例，再在换过方向和字母的新图中独立选择证明链。'}
  ];
  const angleOptions=[
    '长边那幅角更大，因为射线更长',
    '两幅角一样大，因为两条边的方向差相同',
    '图转过方向后，已经无法比较'
  ];
  const transferOptions=['X 与 Z','X 与 Y','Y 与 Z'];
  const flatOptions=[
    '量角器量了很多次，结果都是180°',
    '角度制规定一周是360°；平角是半周，所以是180°',
    '三角形三个角是180°，所以平角也是180°'
  ];
  const proofCards=[
    {id:'first',text:'∠POQ＋∠QOR＝180°'},
    {id:'measure',text:'用量角器多量几次，两个角读数差不多'},
    {id:'second',text:'∠ROS＋∠QOR＝180°'},
    {id:'looks',text:'图看起来左右对称，所以两个角相等'},
    {id:'subtract',text:'两式同时减去∠QOR，得到∠POQ＝∠ROS'}
  ];
  const proofAnswer=['first','second','subtract'];
  function finite(value){return typeof value==='number'&&Number.isFinite(value);}
  function point(cx,cy,length,degrees){
    if(![cx,cy,length,degrees].every(finite)||length<0)throw new RangeError('Invalid ray');
    const radians=degrees*Math.PI/180;
    return {x:cx+length*Math.cos(radians),y:cy-length*Math.sin(radians)};
  }
  function intersection(opening){
    if(!finite(opening)||opening<=0||opening>=180)throw new RangeError('Opening must be between 0 and 180');
    return {one:opening,two:180-opening,three:opening,four:180-opening};
  }
  function sameSet(values,answer){
    if(!Array.isArray(values)||!Array.isArray(answer))return false;
    return values.length===answer.length&&[...values].sort().every((value,index)=>value===[...answer].sort()[index]);
  }
  function validReason(value){return typeof value==='string'&&value.trim().length>0;}
  const sources=[
    {title:'教育部：义务教育数学课程标准（2022年版）',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf'},
    {title:'人民教育出版社：新版七年级上册数学资源',url:'https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/'},
    {title:'人民教育出版社：新版七年级下册数学资源',url:'https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7x/'}
  ];
  const api={id,title,tasks,angleOptions,transferOptions,flatOptions,proofCards,proofAnswer,point,intersection,sameSet,validReason,sources};
  root.Angle180Lesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
