/* One hill model drives contour rings, route positions and equal-scale profiles. */
(function(root){
  'use strict';
  const title='两条上山路，哪条更陡？',levels=[100,200,300,400,500];
  const scaleCards=[{name:'图甲',cm:1,scale:10000,rise:20},{name:'图乙',cm:2,scale:5000,rise:20}];
  const questions=[
    {kind:'choice',skill:'先看图，自己判断',title:'A、B都从100米走到500米，哪条路线更陡？',context:'同一幅等高线图，相邻等高线的海拔相差100米。A沿图中山丘下侧，B沿左侧，两条路线都从100米到500米。等高线连接海拔相同的点。',options:['A路线更陡','B路线更陡','一样陡，因为两条路线都升高400米'],answer:0,hint:'先看两条路线升高的高度是否相同，再比较各自对应的水平距离。不要只数跨过几条线。',explanation:'A更陡。两条路线都升高400米，A对应水平距离720米，B对应1280米。升高相同高度，水平距离越短，路线越陡。同图、相同等高距时，等高线更密的一侧通常更陡。'},
    {kind:'open',skill:'把口诀变成理由',title:'为什么这里“等高线更密”，就表示路线更陡？',context:'仍看同一幅图，等高距为100米。A与B都从100米升至500米。请联系升高的高度与水平距离解释，不能只重复“密陡疏缓”。',hint:'从一条等高线到下一条，都升高100米。哪条路的水平距离更短？同样升高却用更短水平距离，意味着什么？',reference:'同一幅图、等高距相同，从相邻两条线跨过去都升高100米。A的线更密，对应的水平距离更短；升高相同高度却只经过更短的水平距离，所以A更陡。不能只数线条，也不能跨不同尺度的图直接比疏密。',checks:['说明比较发生在同一幅图、相同等高距下，升高的高度相同。','把较短水平距离与较陡联系起来，不只复述口诀。']},
    {kind:'choice',skill:'读出范围，不猜精确值',title:'P不在等高线上。你能确定它的海拔吗？',context:'图中P位于300米和400米两条相邻等高线之间，不在任何等高线上。图上没有标出P的具体海拔。选择从图中能够确定的结论。',options:['一定是350米','等于300米','大于300米，小于400米'],answer:2,hint:'两条等高线告诉你上下界，能否仅凭P画在中间就断言一个精确数字？',explanation:'能确定300米＜P的海拔＜400米。P不在两条线上，因此不是端点。350米属于这个范围，但没有进一步信息，不能断言P恰好是350米。'},
    {kind:'number',skill:'海拔与高差分开',title:'山顶海拔600米，营地海拔100米，山顶比营地高多少米？',context:'山顶和营地的海拔都从同一个海平面0米量起。求的是山顶相对营地的高度差，不是山顶海拔。只填数字，单位米已给出。',answer:500,hint:'600米是从海平面量到山顶。营地已经在100米处，从营地到山顶还差多少？',explanation:'相对高度=600−100=500米。600米是山顶的海拔；500米才是山顶比营地高出的高度。'},
    {kind:'open',skill:'换两张图，还能直接比吗',title:'图甲的线看起来更密，就一定比图乙更陡吗？',context:'两张图沿所示路线跨越相邻等高线，均升高20米。图甲标注图上水平距离1厘米、比例尺1∶10000；图乙标注2厘米、比例尺1∶5000。比较这两段路线的平均陡缓，并说明依据。使用题给距离，不测量屏幕。',hint:'先用各自比例尺把图上距离换成实际水平距离，再在升高相同高度的条件下比较。厘米换成米时别漏一步。',reference:`不能只比图上疏密。图甲1×10000=${1*10000}厘米=${mapDistance(1,10000)}米，图乙2×5000=${2*5000}厘米=${mapDistance(2,5000)}米。两段都升高20米、水平距离都100米，所以平均陡缓相同。跨图比较必须核对比例尺和等高距。`,checks:['分别将图甲和图乙换算成实际水平距离100米。','结合两段都升高20米，说明平均陡缓相同，不能只凭图上疏密下结论。']}
  ];
  function ring(height){if(!Number.isFinite(height)||height<100||height>600)throw new Error('Height outside hill');const factor=(600-height)/500;return {rx:160*factor,ry:90*factor};}
  function routeState(height){if(!Number.isFinite(height)||height<100||height>500)throw new Error('Height outside routes');const r=ring(height);return {height,rise:height-100,a:{x:180,y:130+r.ry,distance:(height-100)*9/5},b:{x:180-r.rx,y:130,distance:(height-100)*16/5}};}
  function profilePoint(distance,height){if(!Number.isFinite(distance)||distance<0||distance>1600||!Number.isFinite(height)||height<100||height>600)throw new Error('Invalid profile coordinate');return {x:45+distance*.18,y:150-(height-100)*.18};}
  function probePoint(){const r=ring(360);return {x:180-r.rx/Math.sqrt(2),y:130-r.ry/Math.sqrt(2)};}
  function mapDistance(cm,scale){if(!Number.isFinite(cm)||cm<=0||!Number.isFinite(scale)||scale<=0)throw new Error('Invalid map distance');return cm*scale/100;}
  function readNumber(input){const raw=String(input).trim().replace(/[０-９．＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)&&Number.isFinite(Number(raw))?Number(raw):null;}
  root.ContourLesson={title,levels,scaleCards,questions,ring,routeState,profilePoint,probePoint,mapDistance,readNumber};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ContourLesson;
})(typeof window!=='undefined'?window:globalThis);
