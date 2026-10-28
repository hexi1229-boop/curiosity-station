(function(root){
  'use strict';
  const id='buoyancy';
  const title='钢会沉，钢造的轮船为什么能浮？';
  const tasks=[
    {title:'先判断：同一团黏土，换个形状会怎样？',context:'用同一团 120 g 的黏土，分别做成实心块和图中这只不漏水的空船（大船），轻轻放入淡水。先留下你的判断，再去试。'},
    {title:'动手验证：船变大了，浮力就一定更大吗？',context:'比较实心块、小船和大船，再给船加货物。留意船和货物的总质量、实际排开的水，以及水到船沿的时刻。'},
    {title:'独立迁移：外形不变，怎样留在水中？',context:'潜水器全部浸没，刚性外壳体积为 200 mL，空水舱时总质量为 180 g。现在水舱有 30 mL 淡水。推进器关闭，每次都从静止释放；请选择让它留在原深度的操作。'}
  ];
  const initial=['实心块和空船都会沉','实心块会沉，空船能浮','实心块和空船都能浮','还不能确定，想先试一试'];
  const transfer=['从目前的水舱排出 10 mL 水','保持目前的 30 mL 水','再向水舱注入 10 mL 水'];
  const capacities={solid:80,small:160,wide:300};
  function boat(shape,cargo=0){
    if(typeof shape!=='string'||!Object.prototype.hasOwnProperty.call(capacities,shape)||!Number.isInteger(cargo)||cargo<0||cargo>120||cargo%10!==0||(shape==='solid'&&cargo!==0))throw new RangeError('Invalid boat model input');
    const mass=120+cargo,capacity=capacities[shape];
    const status=shape==='solid'?'sinking':mass<capacity?'floating':mass===capacity?'critical':'flooding';
    // A flooded boat is shown only at the instant water starts entering.
    // Its later displacement depends on flooding and cargo volume, which are not modelled.
    const displaced=Math.min(mass,capacity),waterMass=displaced;
    return {mass,capacity,displaced,waterMass,weightN:mass/100,buoyancyN:waterMass/100,draftFraction:displaced/capacity,status};
  }
  function sub(ballast){
    if(!Number.isInteger(ballast)||ballast<0||ballast>40||ballast%10!==0)throw new RangeError('Invalid submersible model input');
    const mass=180+ballast,displaced=200,waterMass=200;
    const weightN=mass/100,buoyancyN=waterMass/100,netN=(waterMass-mass)/100;
    // Initial tendency after release from rest, while fully submerged.
    // Equal forces do not make an already moving object stop instantly.
    return {mass,displaced,waterMass,weightN,buoyancyN,forces:{weightN,buoyancyN,netN},status:mass<waterMass?'rising':mass===waterMass?'neutral':'sinking'};
  }
  function validate(index,input){
    if(!Number.isInteger(index)||index<0||index>=tasks.length)throw new RangeError('Invalid buoyancy task index');
    input=input&&typeof input==='object'?input:{};
    if(index===0||index===2){const options=index===0?initial:transfer;if(!Number.isInteger(input.choice)||!options[input.choice])return '先选一个判断，再留下你的理由；暂时说不清也可以如实记录。';}
    if(index===1&&input.observed!==true)return '先运行一次船坞实验，看看船的位置和两项读数怎样变化。';
    if(!(typeof input.reason==='string'&&input.reason.trim())&&input.unsure!==true)return '留一句与你的判断或操作有关的理由，或勾选“暂时说不清”。';
    return '';
  }
  const reference=[
    {title:'材料与单位',text:'这是比水密的教学黏土，不是钢材。黏土质量始终为 120 g，本体体积为 80 mL；淡水近似为每 mL 质量 1 g，每 1 kg 质量对应约 10 N 重力。读数里的 g 是质量单位“克”，N 是力的单位“牛顿”。'},
    {title:'实际排水与载货余量',text:'静止漂浮时，浮力等于总重力，排开水的质量等于船和货物的总质量。同重的空船实际排水量相同；更大的船可以在水到船沿前排开更多水。'},
    {title:'水到船沿',text:'小船的 160 mL、大船的 300 mL 是水到船沿的临界排水量，不是安全载荷。临界时已经没有船沿余量；再加货物就会开始进水。模型在进水开始时停止，不模拟灌水、倾覆和沉底。'},
    {title:'潜水器的条件',text:'潜水器的刚性外形不变，只有内部水舱通过受控水路进排水。全部浸没时排水量保持 200 mL。这里只判断静水中从静止释放后的趋势，不模拟水流、推进器、运动惯性或到达水面后的过程。'},
    {title:'实验范围',text:'船体保持直立，货物居中，忽略黏土变形、表面张力和空气质量。浮力是水对物体的作用；水压随深度增加，各处水压的合力向上。'}
  ];
  const sources=[
    {title:'OpenStax：阿基米德原理与浮力',url:'https://openstax.org/books/university-physics-volume-1/pages/14-4-archimedes-principle-and-buoyancy'},
    {title:'加州大学圣芭芭拉分校：浮力与铝箔船演示',url:'https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/36.36.html'},
    {title:'NSTA：区分材料密度、空腔与进水',url:'https://www.nsta.org/lesson-plan/solids-and-holes'},
    {title:'史密森尼美国历史博物馆：潜艇压载控制',url:'https://americanhistory.si.edu/subs/operating/attackcenter/controlstation/ballastcontrol.html'},
    {title:'Galway City Museum：黏土造船实验',url:'https://www.galwaycitymuseum.ie/wp-content/uploads/2021/04/Archimedes-Experiment-updated.pdf'}
  ];
  const api={id,title,tasks,initial,transfer,boat,sub,validate,reference,sources};
  root.BuoyancyLesson=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
