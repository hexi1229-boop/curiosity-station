/* Geometry proof G3: polygon angle sums by triangulation. */
(function(root){
  'use strict';

  const id='polygon360';
  const title='四边形为什么是360°？更多边呢？';
  const tasks=[
    {title:'歪斜的四边形，也能切成两个三角形吗？',context:'先选方法，再亲手画一条对角线；检查两个三角形是否无重叠、无空隙地铺满原图。'},
    {title:'五边形转了方向，哪两条线才是有效对角线？',context:'从指定顶点依次选两条对角线，撤掉颜色提示后独立完成三角剖分。'},
    {title:'n边形为什么是(n−2)×180°？',context:'从亲手切分和有限观察走向一般证明；内部一点法与图形边界保留为可选研究员挑战。'}
  ];

  const quadrilateralMethods=[
    {id:'one-diagonal',text:'从一个顶点向不相邻顶点画一条对角线'},
    {id:'all-diagonals',text:'把两条对角线都画出来，再数所有小块'},
    {id:'measure',text:'量出四个角，只要这一次加起来是360°就算证明'}
  ];
  const quadrilateralFacts=[
    {id:'two',text:'得到的正好是2个三角形'},
    {id:'cover',text:'两个三角形无重叠、无空隙地铺满原四边形'},
    {id:'angles',text:'对角线只把两端的内角拆开；把小角加回去仍是原来4个内角'}
  ];
  const pentagonLines=[
    {id:'AC',from:'A',to:'C',text:'连接 A—C',valid:true},
    {id:'AD',from:'A',to:'D',text:'连接 A—D',valid:true},
    {id:'AB',from:'A',to:'B',text:'连接 A—B',valid:false,reason:'A—B原本就是边，不是对角线。'},
    {id:'AE',from:'A',to:'E',text:'连接 A—E',valid:false,reason:'A—E原本就是边，不是对角线。'},
    {id:'BD',from:'B',to:'D',text:'连接 B—D',valid:false,reason:'B—D虽然是对角线，但没有从指定顶点A出发，不能和另一条线组成这一把扇形切分。'}
  ];
  const patternOptions=[
    {id:'plus-one',text:'边数每增加1，扇形中的对角线和三角形都增加1，内角和增加180°'},
    {id:'plus-two',text:'边数每增加1，扇形中的对角线和三角形都增加2'},
    {id:'fixed',text:'边数在变，但三角形个数和内角和不变'}
  ];
  const generalOptions=[
    {id:'fan',text:'n−3条对角线，n−2个三角形，内角和为(n−2)×180°'},
    {id:'same',text:'n−2条对角线，n−2个三角形，内角和为(n−2)×180°'},
    {id:'diagonal-count',text:'n−3条对角线，n−3个三角形，内角和为(n−3)×180°'}
  ];
  const centerOptions=[
    {id:'full-turn',text:'n个三角形的角里多算了中心点周围一整圈360°，所以要减360°'},
    {id:'two-triangles',text:'中心点会少出2个三角形，所以直接减去2×180°'},
    {id:'outside',text:'多边形外面还有360°，所以要把外面的角减掉'}
  ];
  const scopeOptions=[
    {id:'bounded',text:'凹的简单多边形仍满足公式，但从任意固定顶点扇形切分未必都在内部；自交图形不在本课公式范围'},
    {id:'convex-only-formula',text:'只有凸多边形满足公式；凹多边形一定不满足'},
    {id:'all-shapes',text:'只要画了n条边，凹图形和自交图形都能直接套同一个公式与同一种扇形证明'}
  ];
  const sources=[
    {title:'教育部：义务教育数学课程标准（2022年版）',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf'},
    {title:'人教社：初中数学教材与教学资源',url:'https://www.pep.com.cn/xw/zt/xkzt/csazy/'},
    {title:'人教社：八年级上册数学教材目录',url:'https://www.pep.com.cn/products/jc/jks/201602/t20160219_1258155.shtml'}
  ];

  function assertSides(n){
    if(!Number.isInteger(n)||n<3)throw new RangeError('A polygon needs an integer number of sides, at least 3');
  }
  function countForSides(n){
    assertSides(n);
    return {sides:n,fanDiagonals:n-3,triangles:n-2,interiorSum:(n-2)*180,centerTriangles:n,centerSubtract:360};
  }
  function fanDiagonals(n,start=0){
    assertSides(n);
    if(!Number.isInteger(start)||start<0||start>=n)throw new RangeError('The start vertex must belong to the polygon');
    const lines=[];
    for(let offset=2;offset<=n-2;offset++)lines.push([start,(start+offset)%n]);
    return lines;
  }
  function isFanEndpoint(n,start,end){
    assertSides(n);
    if(!Number.isInteger(start)||start<0||start>=n)throw new RangeError('The start vertex must belong to the polygon');
    if(!Number.isInteger(end)||end<0||end>=n)return false;
    const offset=(end-start+n)%n;
    return offset>=2&&offset<=n-2;
  }
  function sameSet(values,answer){
    if(!Array.isArray(values)||!Array.isArray(answer))return false;
    const left=[...new Set(values)].sort(),right=[...new Set(answer)].sort();
    return left.length===right.length&&left.every((value,index)=>value===right[index]);
  }
  function validQuadrilateralMethod(id){return id==='one-diagonal';}
  function validQuadrilateralFacts(ids){return sameSet(ids,quadrilateralFacts.map(item=>item.id));}
  function validPentagonLines(ids){return sameSet(ids,['AC','AD']);}
  function validPattern(id){return id==='plus-one';}
  function validFanDiagonals(n,start,lines){
    if(!Array.isArray(lines))return false;
    const encode=line=>Array.isArray(line)&&line.length===2?line.join('-'):'';
    return sameSet(lines.map(encode),fanDiagonals(n,start).map(encode));
  }
  function validFanEndpoints(n,start,ends){
    if(!Array.isArray(ends))return false;
    return sameSet(ends,fanDiagonals(n,start).map(line=>line[1]));
  }
  function resumeGeneralPhase(value){return ['construct','observe','proof'].includes(value)?value:'construct';}
  function validMainProof(generalId){return generalId==='fan';}
  function validResearchChallenge(centerId,scopeId){return centerId==='full-turn'&&scopeId==='bounded';}
  function textPresent(value){return typeof value==='string'&&value.trim().length>0;}

  const api={id,title,tasks,quadrilateralMethods,quadrilateralFacts,pentagonLines,patternOptions,generalOptions,centerOptions,scopeOptions,sources,countForSides,fanDiagonals,isFanEndpoint,sameSet,validQuadrilateralMethod,validQuadrilateralFacts,validPentagonLines,validPattern,validFanDiagonals,validFanEndpoints,resumeGeneralPhase,validMainProof,validResearchChallenge,textPresent};
  root.Polygon360Lesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
