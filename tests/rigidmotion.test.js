'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const L=require('../rigidmotion-content.js');

function assertReturns(points,back){
  assert.equal(back.length,points.length);
  back.forEach((point,index)=>assert.ok(L.distance(point,points[index])<1e-7));
}

test('translations preserve all pair distances, perimeter, area and orientation',()=>{
  for(const preset of L.translationPresets){
    const image=L.shape.map(point=>L.translatePoint(point,preset.dx,preset.dy));
    assert.deepEqual(L.invariants(L.shape,image),{distances:true,perimeter:true,area:true,orientationSame:true});
    assertReturns(L.shape,image.map(point=>L.translatePoint(point,-preset.dx,-preset.dy)));
  }
});

test('rotations preserve invariants and inverse rotations return every point',()=>{
  for(const center of L.rotationCenters){
    for(const angle of L.rotationAngles){
      const image=L.shape.map(point=>L.rotatePoint(point,center,angle));
      assert.deepEqual(L.invariants(L.shape,image),{distances:true,perimeter:true,area:true,orientationSame:true});
      assertReturns(L.shape,image.map(point=>L.rotatePoint(point,center,-angle)));
    }
    assertReturns(L.shape,L.shape.map(point=>L.rotatePoint(point,center,360)));
  }
});

test('reflections preserve lengths and area, reverse orientation and undo themselves',()=>{
  for(const axis of L.reflectionAxes){
    const image=L.shape.map(point=>L.reflectPoint(point,axis.a,axis.b));
    assert.deepEqual(L.invariants(L.shape,image),{distances:true,perimeter:true,area:true,orientationSame:false});
    assertReturns(L.shape,image.map(point=>L.reflectPoint(point,axis.a,axis.b)));
  }
  assert.throws(()=>L.reflectPoint(L.shape[0],{x:1,y:1},{x:1,y:1}),/distinct points/);
});

test('transfer grading requires exactly A and C, the rotation diagnosis and all values',()=>{
  const correct={reportChoices:['C','A'],reportBReason:'common-angle',lengthAnswer:'7.2',angleAnswer:'64',scaleLengthAnswer:'10.8',scaleAreaAnswer:'2.25'};
  assert.deepEqual(L.gradeTransfer(correct),{reports:true,reportB:true,length:true,angle:true,scaleLength:true,scaleArea:true});
  assert.equal(L.gradeTransfer({...correct,reportChoices:['A','B','C']}).reports,false);
  assert.equal(L.gradeTransfer({...correct,reportBReason:'same-radius'}).reportB,false);
  assert.equal(L.gradeTransfer({...correct,scaleAreaAnswer:'1.5'}).scaleArea,false);
  assert.equal(L.numericEquals('',0),false);
  assert.equal(L.numericEquals('7.2x',7.2),false);
});

test('set comparison rejects duplicates as a bypass only when an answer is missing or extra',()=>{
  assert.equal(L.sameSet(['area','distance','distance'],['distance','area']),true);
  assert.equal(L.sameSet(['distance'],['distance','area']),false);
  assert.equal(L.sameSet(['distance','area','unsafe'],['distance','area']),false);
});
