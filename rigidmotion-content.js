/* Geometry thinking G4: invariants under distance-preserving motions. */
(function(root){
  'use strict';

  const id='rigidmotion';
  const title='图形搬家后，什么一定不变？';
  const tasks=[
    {title:'图搬了位置、转了方向或翻了一面，什么一定不变？',context:'先封存判断与理由，不即时揭晓术语或答案。'},
    {title:'三种搬法的规则不同，共同保住了什么？',context:'改变参数，记录观察并归纳共同不变量。'},
    {title:'没有动画，只看工程记录还能判断是否变形吗？',context:'只根据工程记录判断图形是否只做整块搬动，并说明依据。'}
  ];

  const invariantOptions=[
    {id:'distance',text:'图形内任意两点的距离（如 AB＝A′B′）'},
    {id:'angle',text:'对应角的大小'},
    {id:'perimeter',text:'整个图形的周长'},
    {id:'area',text:'整个图形的面积'},
    {id:'position',text:'图形在屏幕上的位置'},
    {id:'facing',text:'图案相对屏幕面对的方向'},
    {id:'orientation',text:'按顶点绕一圈时的顺／逆时针次序'}
  ];
  const invariantAnswer=['distance','angle','perimeter','area'];

  const shape=[
    {x:125,y:82,label:'A'},
    {x:222,y:66,label:'B'},
    {x:274,y:143,label:'C'},
    {x:205,y:224,label:'D'},
    {x:103,y:181,label:'E'}
  ];
  const translationPresets=[
    {id:'right-up',label:'向右70、向上25',dx:70,dy:-25},
    {id:'left-down',label:'向左42、向下38',dx:-42,dy:38},
    {id:'right-down',label:'向右46、向下32',dx:46,dy:32}
  ];
  const rotationCenters=[
    {id:'o1',label:'中心 O₁',x:210,y:150},
    {id:'o2',label:'中心 O₂',x:174,y:144}
  ];
  const rotationAngles=[45,90,-60,135];
  const reflectionAxes=[
    {id:'vertical',label:'竖直轴',a:{x:210,y:28},b:{x:210,y:272}},
    {id:'horizontal',label:'水平轴',a:{x:48,y:150},b:{x:372,y:150}},
    {id:'diagonal',label:'斜轴',a:{x:72,y:246},b:{x:340,y:58}}
  ];

  const transferReports=[
    {id:'A',code:'记录 A',text:'所有点都向右4格、向上2格。'},
    {id:'B',code:'记录 B',text:'每个点到中心O的距离不变；A、B、C分别转过20°、35°、50°。'},
    {id:'C',code:'记录 C',text:'每对对应点的连线都被同一条直线垂直平分。'},
    {id:'D',code:'记录 D',text:'所有边长都变为原来的1.5倍；所有对应角保持不变。'}
  ];
  const transferAnswer=['A','C'];
  const reportBReasons=[
    {id:'common-angle',text:'只保到O的距离不能保证点间距离；各点转角又不同'},
    {id:'same-radius',text:'缺少“每个点到中心的距离保持不变”'},
    {id:'screen-position',text:'缺少“图形必须留在屏幕原位置”'}
  ];

  const sources=[
    {title:'教育部《义务教育数学课程标准（2022年版）》',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf'},
    {title:'人教版数学七年级下册目录（含5.4平移）',url:'https://www.pep.com.cn/products/jc/czjks/201510/t20151026_1250721.shtml'},
    {title:'人教版八年级上册教师教学用书目录（全等三角形、轴对称）',url:'https://www.pep.com.cn/products/jc/jks/201510/t20151026_1250894.shtml'},
    {title:'人教社：图形变换与“变化中的不变性”',url:'https://www.pep.com.cn/kcs/yjcg/lw/lw2015/201809/t20180929_1931786.html'}
  ];

  function finitePoint(point){return point&&Number.isFinite(point.x)&&Number.isFinite(point.y);}
  function assertPoint(point){if(!finitePoint(point))throw new TypeError('A finite point is required');}
  function translatePoint(point,dx,dy){
    assertPoint(point);if(!Number.isFinite(dx)||!Number.isFinite(dy))throw new TypeError('A finite translation is required');
    return {...point,x:point.x+dx,y:point.y+dy};
  }
  function rotatePoint(point,center,degrees){
    assertPoint(point);assertPoint(center);if(!Number.isFinite(degrees))throw new TypeError('A finite angle is required');
    const radians=degrees*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians),x=point.x-center.x,y=point.y-center.y;
    return {...point,x:center.x+x*cos-y*sin,y:center.y+x*sin+y*cos};
  }
  function reflectPoint(point,lineA,lineB){
    assertPoint(point);assertPoint(lineA);assertPoint(lineB);
    const dx=lineB.x-lineA.x,dy=lineB.y-lineA.y,length2=dx*dx+dy*dy;
    if(length2<1e-12)throw new RangeError('A reflection axis needs two distinct points');
    const t=((point.x-lineA.x)*dx+(point.y-lineA.y)*dy)/length2;
    const projection={x:lineA.x+t*dx,y:lineA.y+t*dy};
    return {...point,x:2*projection.x-point.x,y:2*projection.y-point.y};
  }
  function distance(a,b){assertPoint(a);assertPoint(b);return Math.hypot(a.x-b.x,a.y-b.y);}
  function polygonPerimeter(points){
    if(!Array.isArray(points)||points.length<3)throw new RangeError('A polygon needs at least three points');
    return points.reduce((sum,point,index)=>sum+distance(point,points[(index+1)%points.length]),0);
  }
  function signedDoubleArea(points){
    if(!Array.isArray(points)||points.length<3)throw new RangeError('A polygon needs at least three points');
    points.forEach(assertPoint);
    return points.reduce((sum,point,index)=>{const next=points[(index+1)%points.length];return sum+point.x*next.y-next.x*point.y;},0);
  }
  function polygonArea(points){return Math.abs(signedDoubleArea(points))/2;}
  function orientation(points){const value=signedDoubleArea(points);if(Math.abs(value)<1e-9)return 'degenerate';return value>0?'clockwise':'counterclockwise';}
  function angleAt(a,b,c){
    [a,b,c].forEach(assertPoint);const ux=a.x-b.x,uy=a.y-b.y,vx=c.x-b.x,vy=c.y-b.y,ul=Math.hypot(ux,uy),vl=Math.hypot(vx,vy);
    if(ul<1e-9||vl<1e-9)throw new RangeError('Angle points must be distinct');
    return Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(ul*vl))))*180/Math.PI;
  }
  function sameSet(values,answer){
    if(!Array.isArray(values)||!Array.isArray(answer))return false;
    const left=[...new Set(values)].sort(),right=[...new Set(answer)].sort();
    return left.length===right.length&&left.every((value,index)=>value===right[index]);
  }
  function allPairDistances(points){
    if(!Array.isArray(points))throw new TypeError('Points are required');
    const values=[];for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)values.push(distance(points[i],points[j]));
    return values;
  }
  function approxEqual(a,b,tolerance=1e-7){return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tolerance;}
  function arraysApproxEqual(left,right,tolerance=1e-7){return Array.isArray(left)&&Array.isArray(right)&&left.length===right.length&&left.every((value,index)=>approxEqual(value,right[index],tolerance));}
  function invariants(before,after){
    return {
      distances:arraysApproxEqual(allPairDistances(before),allPairDistances(after)),
      perimeter:approxEqual(polygonPerimeter(before),polygonPerimeter(after)),
      area:approxEqual(polygonArea(before),polygonArea(after)),
      orientationSame:orientation(before)===orientation(after)
    };
  }
  function numericEquals(value,expected,tolerance=1e-7){
    const text=String(value??'').trim();
    if(!text)return false;
    const number=Number(text);
    return Number.isFinite(number)&&Math.abs(number-expected)<=tolerance;
  }
  function gradeTransfer(state){
    return {
      reports:sameSet(state?.reportChoices,transferAnswer),
      reportB:state?.reportBReason==='common-angle',
      length:numericEquals(state?.lengthAnswer,7.2),
      angle:numericEquals(state?.angleAnswer,64),
      scaleLength:numericEquals(state?.scaleLengthAnswer,10.8),
      scaleArea:numericEquals(state?.scaleAreaAnswer,2.25)
    };
  }
  function textPresent(value){return typeof value==='string'&&value.trim().length>0;}

  const api={id,title,tasks,invariantOptions,invariantAnswer,shape,translationPresets,rotationCenters,rotationAngles,reflectionAxes,transferReports,transferAnswer,reportBReasons,sources,translatePoint,rotatePoint,reflectPoint,distance,polygonPerimeter,polygonArea,orientation,angleAt,sameSet,allPairDistances,approxEqual,arraysApproxEqual,invariants,numericEquals,gradeTransfer,textPresent};
  root.RigidMotionLesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
