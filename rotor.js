'use strict';
if(!LearningFeedback.courses.some(c=>c[0]==='forces'))LearningFeedback.courses.push(['forces',ForcesLesson.title,'forces.html']);
const rotorLog=LearningFeedback.create(ForcesLesson.title,ForcesLesson.questions),rotorCP=rotorLog.checkpoint;
let rotorRPM=Number.isInteger(rotorCP.rotorRPM)&&rotorCP.rotorRPM>=0&&rotorCP.rotorRPM<=120?rotorCP.rotorRPM:100;
let rotorDensity=[0,.5,1].includes(rotorCP.rotorDensity)?rotorCP.rotorDensity:1,rotorView=rotorCP.rotorView==='drone'?'drone':'pair';
let rotorSlow=rotorCP.rotorSlow===true,rotorPlaying=false,rotorPhase=0,rotorLast=0,rotorFrame=0;
const rotorReduced=window.matchMedia('(prefers-reduced-motion: reduce)'),rotorPlay=document.querySelector('#rotor-play');
const rotorDots=document.querySelector('#rotor-parcels');
rotorDots.innerHTML=Array.from({length:28},()=>'<circle r="5"/>').join('');
function rotorRecord(label){
  rotorLog.point({rotorRPM,rotorDensity,rotorView,rotorSlow});
  rotorLog.help(4,'补充动画：'+label);
  rotorLog.note(4,`旋翼观察：转速${rotorRPM}%，${rotorDensity===0?'真空':rotorDensity===.5?'一半空气密度':'普通空气'}，${rotorView==='pair'?'看两个物体的相互作用':'只看无人机受力'}${rotorSlow?'，慢放':''}。`);
}
function rotorDrawFlow(){
  const s=RotorModel.state(rotorRPM,rotorDensity),visible=rotorDensity===0?0:rotorDensity===.5?14:28;
  [...rotorDots.children].forEach((dot,i)=>{
    dot.style.display=i<visible?'':'none';
    const p=(rotorPhase+(i%7)/7+Math.floor(i/7)*.03)%1,pos=RotorModel.parcel(p,Math.floor(i/7));
    dot.setAttribute('cx',pos.x);dot.setAttribute('cy',pos.y);dot.setAttribute('opacity',.4+.6*p);
  });
  const stretch=.22+.78*Math.abs(Math.cos(rotorPhase*18));
  document.querySelector('#rotor-blade').setAttribute('d',`M${320-113*stretch} 220H${320+113*stretch}`);
  document.querySelector('.rotor-stream').style.opacity=rotorDensity===0?'0':'1';
  if(!s.airMoving&&rotorDensity>0)rotorDots.setAttribute('opacity','.55');else rotorDots.setAttribute('opacity','1');
}
function rotorDraw(){
  const s=RotorModel.state(rotorRPM,rotorDensity),m=s.thrust.toFixed(1),airArrow=80*s.thrust/12;
  document.querySelector('#rotor-rpm').value=rotorRPM;
  document.querySelector('#rotor-rpm-value').textContent=rotorRPM+'%';
  document.querySelector('#rotor-slow').checked=rotorSlow;
  document.querySelectorAll('[data-density]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.density)===rotorDensity)));
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===rotorView)));
  document.querySelector('#rotor-air-force').toggleAttribute('hidden',rotorView==='drone');
  document.querySelector('#rotor-up-arrow').setAttribute('d',`M492 220V${220-airArrow}`);
  document.querySelector('#rotor-down-arrow').setAttribute('d',`M132 240V${240+airArrow}`);
  for(const id of ['rotor-up-arrow','rotor-down-arrow','balance-up'])document.querySelector('#'+id).style.visibility=s.thrust===0?'hidden':'visible';
  document.querySelector('#rotor-up-value').textContent=m+' N';document.querySelector('#rotor-down-value').textContent=m+' N';
  document.querySelector('#balance-up').setAttribute('d',`M150 160V${160-82*s.thrust/12}`);
  document.querySelector('#balance-up-value').textContent=m+' N';
  document.querySelector('#rotor-net').textContent=s.balance?'竖直合力 0.0 N':`竖直合力 ${Math.abs(s.net).toFixed(1)} N，向${s.net>0?'上':'下'}`;
  document.querySelector('#rotor-motion').textContent=s.balance?'原来静止时，可以保持悬停；原来有竖直速度时，平衡本身不会让它停下。':`若此刻从静止放开整机：开始${s.net>0?'上升':'下落'}。合力给出加速度方向，不直接给出原有速度方向。`;
  let text=rotorDensity===0?'真空：旋翼可以转，但没有空气可加速，空气推力为0。':rotorRPM===0?'停转：没有旋翼驱动的下洗气流，空气推力为0。':`空气对旋翼向上${m} N，旋翼对空气向下${m} N，同时发生。`;
  if(rotorDensity===.5&&rotorRPM>0)text+=' 转速不变时，空气质量流率变小，推力也变小。';
  if(rotorView==='drone')text+=' 只看无人机时，向下推空气的力不计入它的受力。';
  document.querySelector('#rotor-status').textContent=text;
  document.querySelector('#rotor-flow-caption').textContent=rotorDensity===0?'真空中：有转动，没有空气推力。':rotorRPM===0?'停转：空气仍存在，没有驱动的下洗。':'空气被持续向下加速；不需要地面。';
  document.querySelector('#rotor-numbers').textContent=rotorDensity===0?'当前为真空：空气质量流率为0，空气推力为0。':`当前模型：每秒${s.massFlow.toFixed(3)} kg空气 × 向下速度增加${s.wakeSpeed.toFixed(1)} m/s = ${m} N。`;
  document.querySelector('#rotor-scene').setAttribute('aria-label',`相对转速${rotorRPM}%，${rotorDensity===0?'真空':rotorDensity===.5?'一半空气密度':'普通空气'}；空气给旋翼向上${m}牛顿${rotorView==='pair'?'，旋翼给空气向下'+m+'牛顿':''}。`);
  document.querySelector('#rotor-balance').setAttribute('aria-label',`无人机受空气向上${m}牛顿，重力向下12牛顿；合力${s.balance?'为零':Math.abs(s.net).toFixed(1)+'牛顿向'+(s.net>0?'上':'下')}。`);
  rotorDrawFlow();
}
function rotorStop(){
  rotorPlaying=false;cancelAnimationFrame(rotorFrame);rotorFrame=0;rotorLast=0;rotorPlay.textContent='播放动画';rotorPlay.setAttribute('aria-pressed','false');
}
function rotorTick(now){
  if(!rotorPlaying)return;
  const dt=rotorLast?Math.min((now-rotorLast)/1000,.06):0;rotorLast=now;
  rotorPhase=(rotorPhase+dt*.24*(rotorRPM/100)*(rotorSlow?.23:1))%1;
  rotorDrawFlow();rotorFrame=requestAnimationFrame(rotorTick);
}
rotorPlay.onclick=()=>{
  if(rotorPlaying){rotorStop();return;}
  if(rotorReduced.matches){rotorPhase=(rotorPhase+.07*(rotorRPM/100))%1;rotorDrawFlow();document.querySelector('#rotor-status').textContent='已前进一小步。你启用了减少动态效果，可继续点「前进一小步」观察。';rotorRecord('分步观察（减少动态效果）');return;}
  rotorPlaying=true;rotorPlay.textContent='暂停动画';rotorPlay.setAttribute('aria-pressed','true');rotorRecord('播放气流与相互作用');rotorFrame=requestAnimationFrame(rotorTick);
};
document.querySelector('#rotor-rpm').oninput=e=>{rotorRPM=Number(e.target.value);rotorDraw();rotorLog.point({rotorRPM});};
document.querySelector('#rotor-rpm').onchange=()=>rotorRecord('调节转速');
document.querySelectorAll('[data-density]').forEach(b=>b.onclick=()=>{rotorDensity=Number(b.dataset.density);rotorDraw();rotorRecord('改变空气密度');});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{rotorView=b.dataset.view;rotorDraw();rotorRecord('切换受力对象');});
document.querySelector('#rotor-slow').onchange=e=>{rotorSlow=e.target.checked;rotorRecord('切换慢放');};
document.querySelector('#rotor-step').onclick=()=>{rotorStop();rotorPhase=(rotorPhase+.07*(rotorRPM/100))%1;rotorDrawFlow();rotorRecord('分步观察');};
document.querySelector('#rotor-reset').onclick=()=>{rotorStop();rotorRPM=100;rotorDensity=1;rotorView='pair';rotorSlow=false;rotorPhase=0;rotorDraw();rotorRecord('恢复初始条件');};
document.querySelectorAll('[data-rotor-help]').forEach(el=>el.addEventListener('toggle',()=>{if(el.open)rotorLog.help(4,el.dataset.rotorHelp);}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)rotorStop();});
window.addEventListener('pagehide',rotorStop);
rotorReduced.addEventListener('change',()=>{if(rotorReduced.matches)rotorStop();});
rotorDraw();rotorLog.help(4,'打开旋翼推力补充动画');
