/* Geometry proof G2: triangle angle sum from a parallel line and a straight angle. */
(function(root){
  'use strict';
  const id='triangle180';
  const title='三角形三个角为什么正好是180°？';
  const tasks=[
    {title:'量了很多个都是180°，已经证明所有三角形了吗？',context:'先判断，再拖动不同形状的三角形；把“发现规律”和“证明规律”分开。'},
    {title:'一条平行线，怎样把三个角放进同一个平角？',context:'只调用G0的平角和G1的平行线角关系，按顺序建立三角形内角和证明。'},
    {title:'图转了、字母换了，还能自己补出辅助线吗？',context:'在钝角三角形中自己选择辅助线、对应角和依据，并审出测量不能代替证明。'}
  ];
  const conjectureOptions=[
    {id:'measured',text:'已经证明了：只要多量几个，所有三角形就都包括了'},
    {id:'conjecture',text:'还只是有力的猜想：有限次测量不能覆盖所有三角形'},
    {id:'acute',text:'只能说明锐角三角形；直角、钝角三角形的和会改变'}
  ];
  const proofCards=[
    {id:'construct',text:'过A作直线DE∥BC，并让D、A、E在同一直线上'},
    {id:'left',text:'由DE∥BC，得到∠DAB＝∠ABC（内错角相等）'},
    {id:'right',text:'由DE∥BC，得到∠CAE＝∠ACB（内错角相等）'},
    {id:'straight',text:'∠DAB、∠BAC、∠CAE相邻且正好组成平角∠DAE，所以三者和是180°'},
    {id:'substitute',text:'把两个相等角代换回去，得到∠ABC＋∠BAC＋∠ACB＝180°'},
    {id:'measure',text:'用量角器把三个角再量一次，读数相加等于180°'},
    {id:'circular',text:'因为三角形内角和是180°，所以这三个角组成平角'}
  ];
  const proofAnswer=['construct','left','right','straight','substitute'];
  const constructionOptions=[
    {id:'throughQ',text:'过Q作直线ST∥PR，让S、Q、T在同一直线上'},
    {id:'perpendicularP',text:'过P作PR的垂线，把直角放进图里'},
    {id:'extendQR',text:'只把QR延长，再量三个内角'}
  ];
  const transferRelations=[
    {id:'left',text:'∠SQP＝∠QPR，因为ST∥PR，内错角相等'},
    {id:'right',text:'∠RQT＝∠PRQ，因为ST∥PR，内错角相等'},
    {id:'straight',text:'∠SQP＋∠PQR＋∠RQT＝∠SQT＝180°'},
    {id:'substitute',text:'把两个相等角代换回去，得到∠QPR＋∠PQR＋∠PRQ＝180°'},
    {id:'top',text:'∠PQR＝180°，因为它位于直线ST下面'},
    {id:'twins',text:'∠SQP＝∠RQT，因为它们画在Q的两边'}
  ];
  const transferAnswer=['left','right','straight','substitute'];
  const auditOptions=[
    '过Q作ST∥PR，再用两组内错角相等和一个平角完成证明',
    '量出100个三角形的内角和都是180°，所以已经证明所有三角形都成立',
    '先写ST∥PR，再写两组相等角和三个相邻角铺满平角，最后做等量代换'
  ];
  const sources=[
    {title:'教育部：义务教育数学课程标准（2022年版）',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf'},
    {title:'人教社：新版七年级上册数学资源',url:'https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/'},
    {title:'人教社：七年级下册数学教材目录（含第5章平行线、第7章三角形）',url:'https://www.pep.com.cn/products/jc/czjks/201602/t20160228_1258440.shtml'}
  ];
  function finitePoint(point){return point&&Number.isFinite(point.x)&&Number.isFinite(point.y);}
  function angleAt(a,b,c){
    if(![a,b,c].every(finitePoint))throw new TypeError('A point is missing');
    const ux=a.x-b.x,uy=a.y-b.y,vx=c.x-b.x,vy=c.y-b.y;
    const ul=Math.hypot(ux,uy),vl=Math.hypot(vx,vy);
    if(ul<1e-9||vl<1e-9)throw new RangeError('Triangle points must be distinct');
    const cosine=Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(ul*vl)));
    return Math.acos(cosine)*180/Math.PI;
  }
  function triangleAngles(a,b,c){
    if(![a,b,c].every(finitePoint))throw new TypeError('A point is missing');
    const twiceArea=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
    if(twiceArea<1e-8)throw new RangeError('Triangle must not be degenerate');
    const A=angleAt(b,a,c),B=angleAt(a,b,c),C=angleAt(a,c,b);
    return {A,B,C,sum:A+B+C};
  }
  function sameSet(values,answer){
    if(!Array.isArray(values)||!Array.isArray(answer))return false;
    const left=[...new Set(values)].sort(),right=[...new Set(answer)].sort();
    return left.length===right.length&&left.every((value,index)=>value===right[index]);
  }
  function validProofOrder(values){
    return Array.isArray(values)&&values.length===5&&values[0]==='construct'&&sameSet(values.slice(1,3),['left','right'])&&values[3]==='straight'&&values[4]==='substitute';
  }
  function validTransferOrder(values){
    return Array.isArray(values)&&values.length===4&&sameSet(values.slice(0,2),['left','right'])&&values[2]==='straight'&&values[3]==='substitute';
  }
  function textPresent(value){return typeof value==='string'&&value.trim().length>0;}
  const api={id,title,tasks,conjectureOptions,proofCards,proofAnswer,constructionOptions,transferRelations,transferAnswer,auditOptions,sources,angleAt,triangleAngles,sameSet,validProofOrder,validTransferOrder,textPresent};
  root.Triangle180Lesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
