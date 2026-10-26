/* Ideal steady, fixed-pitch rotor family. Positive vertical force is upward. */
(function(root){
  'use strict';
  function state(rpm,density){
    if(!Number.isInteger(rpm)||rpm<0||rpm>120||![0,.5,1].includes(density))throw new Error('Outside rotor model');
    const ratio=rpm/100,thrust=12*density*ratio*ratio,weight=12;
    return {rpm,density,thrust,weight,net:thrust-weight,airForce:-thrust,
      massFlow:.5*density*ratio,wakeSpeed:density===0?0:24*ratio,
      balance:Math.abs(thrust-weight)<1e-9,airMoving:density>0&&rpm>0};
  }
  function parcel(progress,lane){
    if(!Number.isFinite(progress)||progress<0||progress>1||!Number.isInteger(lane)||lane<0||lane>3)throw new Error('Outside flow illustration');
    // Continuous, faster downward movement; positions are illustrative, not CFD.
    const y=40+440*(.2*progress+.8*progress*progress),spread=1-.18*progress;
    return {x:320+(lane-1.5)*42*spread,y};
  }
  root.RotorModel={state,parcel};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.RotorModel;
})(typeof window!=='undefined'?window:globalThis);
