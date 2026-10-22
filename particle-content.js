/* Water molecules keep their identity during state changes; diagrams are schematic. */
(function(root){
  'use strict';
  const title='水蒸发了，分子也变大了吗？';
  function model(total,vapor){
    if(![6,9].includes(total)||!Number.isInteger(vapor)||vapor<0||vapor>total)throw new Error('Invalid water model');
    return Array.from({length:total},(_,id)=>({id,phase:id<vapor?'vapor':'liquid',x:id<vapor?60+(id%3)*120:142+((id-vapor)%3)*38,y:id<vapor?72+Math.floor(id/3)*61:270+Math.floor((id-vapor)/3)*29,oxygen:1,hydrogen:2,radius:7}));
  }
  function counts(total,vapor){model(total,vapor);return {liquid:total-vapor,vapor,total,oxygen:total,hydrogen:total*2};}
  function integer(value){const text=String(value).normalize('NFKC').trim();return /^\d+$/.test(text)&&Number.isSafeInteger(Number(text))?Number(text):null;}
  const questions=[
    {kind:'choice',skill:'先预测，分清大小和间隔',title:'同样多的水分子，从液态分散到气态。哪种解释合理？',context:'只发生水的蒸发，没有化学反应。比较液态水与水蒸气的微观状态。',options:['每个水分子变得更大，所以占的空间更大','水分子变成了氢分子和氧分子','水分子本身没有变大，分子间的平均距离增大'],answer:2,hint:'想想“人长大了”和“人站得更开”是不是同一件事。再判断蒸发后还是不是水。',explanation:'正确的是第三句。液态水变成水蒸气，水分子没有变大，也没有拆成氢分子、氧分子；分子间的平均距离增大。状态改变，物质仍是水。'},
    {kind:'number',skill:'动手改变分布，数清全部',title:'把整个密闭框都算上，模型里一共有几个水分子？',context:'密闭模型起初有9个水分子，没有进入或离开，也没有化学反应。拖动滑块，只让水分子在液态区与气态区之间转移。问两区合计的水分子数，不只是液态区。',label:'整个密闭框中的水分子总数',unit:'个',answer:9,hint:'分别数两区，再相加。转移到气态区的那一组，还是不是水分子？',explanation:'无论滑块停在哪里，两区合计都是9个。蒸发只是水分子从液态转入气态；这里没有水分子进出密闭框，也没有发生化学反应。数量要先说清在数哪个范围。'},
    {kind:'open',skill:'反过来解释，凝结改变了什么',title:'“水蒸气凝结成小水滴，是水分子缩小了。”你同意吗？',context:'水蒸气接触较冷的表面，凝结成液态小水滴。只讨论这一状态变化，不涉及化学反应。',hint:'把蒸发的过程反过来看。要区分“每个分子自身的大小”和“分子之间的平均距离”。',reference:'不同意。凝结后仍是水分子，并不是每个水分子缩小了。水分子间的平均距离减小，聚集形成液态小水滴；这只是状态改变，没有产生新物质。',checks:['明确不是水分子自身缩小，而是分子间平均距离减小。','说明仍然是水，属于状态变化，没有变成另一种物质。']},
    {kind:'choice',skill:'生活迁移，看见白雾不等于看见气体',title:'冷杯附近出现白雾。依据资料，白雾主要由什么组成？',context:'资料：水蒸气本身看不见；遇冷凝结产生的许多小水滴，可以形成肉眼可见的白雾。',options:['许多液态小水滴；一个小水滴中包含大量水分子','变大到能被肉眼看见的单个水分子','许多白色的气态水分子'],answer:0,hint:'资料把“看不见的水蒸气”和“可见的小水滴”分开了。水滴和一个水分子一样大吗？',explanation:'白雾由许多微小液态水滴组成，每个水滴仍包含大量水分子。水蒸气本身不可见，不能把白雾说成肉眼看见了单个水分子。'},
    {kind:'open',skill:'独立解释，先圈定统计范围',title:'两个容器里的水分子总数，为什么可能不同地变化？',context:'A容器密闭且不漏，没有水进出；B容器敞口，题目给定有水蒸气净逸出，且没有其他水进入。两者均只发生水的蒸发。分别讨论各自容器里面的水分子总数，液态和气态都要算。',hint:'A中从液态走到气态，是否离开了容器？B中逸出的水分子，出了容器以后是消失了，还是到了别处？',reference:'A中没有水分子进出，蒸发后容器内的水分子总数不变，只是液态和气态的分布改变。B中有水蒸气净逸出，所以容器内水分子总数减少；逸出的分子到了周围空气中，并没有凭空消失。两种情况下水分子本身都没有因为蒸发而变大，也没有变成别的物质。',checks:['A按整个容器计数，液态加气态的水分子总数不变。','B按容器内部计数，因题目给定净逸出而减少；不把“容器内减少”说成“分子凭空消失”。','用自己的话说明水分子到了周围空气中；无需照抄参考，也不把所有敞口情境都当成必然净逸出。']}
  ];
  root.ParticleLesson={title,questions,model,counts,integer};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ParticleLesson;
})(typeof window!=='undefined'?window:globalThis);
