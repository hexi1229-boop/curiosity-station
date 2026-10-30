/* Ideal steady, fixed-pitch teaching model. Positive vertical force is upward. */
(function(root){
  'use strict';
  function state(rpm,density){
    if(!Number.isInteger(rpm)||rpm<0||rpm>160||![0,.5,1].includes(density))throw new Error('Outside rotor model');
    const ratio=rpm/100,thrust=12*density*ratio*ratio,weight=12;
    return {rpm,density,thrust,weight,net:thrust-weight,airForce:-thrust,
      massFlow:.5*density*ratio,wakeSpeed:density===0?0:24*ratio,
      balance:Math.abs(thrust-weight)<1e-9,airMoving:density>0&&rpm>0};
  }
  function tilt(thrust,angle,weight=12){
    if(!Number.isFinite(thrust)||thrust<0||thrust>40||!Number.isFinite(angle)||angle<0||angle>80||!Number.isFinite(weight)||weight<=0)throw new Error('Outside tilt model');
    const radians=angle*Math.PI/180,vertical=thrust*Math.cos(radians),horizontal=thrust*Math.sin(radians),netVertical=vertical-weight;
    return {thrust,angle,weight,vertical,horizontal,netVertical,holdsHeight:Math.abs(netVertical)<=.12};
  }
  function parcel(progress,lane){
    if(!Number.isFinite(progress)||progress<0||progress>1||!Number.isInteger(lane)||lane<0||lane>3)throw new Error('Outside flow illustration');
    // Continuous, faster downward movement; positions are illustrative, not CFD.
    const y=40+440*(.2*progress+.8*progress*progress),spread=1-.18*progress;
    return {x:320+(lane-1.5)*42*spread,y};
  }
  root.RotorModel={state,tilt,parcel};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.RotorModel;
})(typeof window!=='undefined'?window:globalThis);
