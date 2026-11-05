'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../zhou-network-content.js');

test('Ke lei evidence requires exactly the two supported claims',()=>{
  assert.equal(L.gradeEvidence(['network','command']).correct,true);
  assert.equal(L.gradeEvidence(['command']).correct,false);
  assert.equal(L.gradeEvidence(['command','network','instant']).correct,false);
  assert.equal(L.gradeEvidence(['command','command','network']).correct,true);
});

test('network grade requires two route conditions, all directions and the boundary',()=>{
  const correct={
    routeSeen:['clear','weather'],
    networkAnswers:{repair:'local',summons:'chain',report:'return'},
    networkBoundary:'network'
  };
  assert.equal(L.gradeNetwork(correct).correct,true);
  assert.equal(L.gradeNetwork({...correct,routeSeen:['clear','clear']}).observed,false);
  assert.equal(L.gradeNetwork({...correct,networkAnswers:{...correct.networkAnswers,report:'instant'}}).events,false);
  assert.equal(L.gradeNetwork({...correct,networkBoundary:'province'}).boundary,false);
  assert.equal(L.gradeNetwork({...correct,solved:true,routeSeen:[]}).correct,false);
});

test('transfer grade keeps direct evidence, inference and overreach separate',()=>{
  const correct={
    transferVisited:['museum','inscription'],
    transferRatings:{official:'direct',selective:'inference',every:'overreach',daily:'overreach'},
    transferModel:'layered'
  };
  assert.equal(L.gradeTransfer(correct).correct,true);
  assert.equal(L.gradeTransfer({...correct,transferVisited:['inscription']}).visited,false);
  assert.equal(L.gradeTransfer({...correct,transferRatings:{...correct.transferRatings,selective:'direct'}}).ratings,false);
  assert.equal(L.gradeTransfer({...correct,transferModel:'replace'}).model,false);
  assert.equal(L.gradeTransfer({...correct,solved:true,transferRatings:{}}).correct,false);
});

test('unknown and duplicate values cannot supply missing requirements',()=>{
  assert.equal(L.sameSet(['command','unsafe'],['command','network']),false);
  assert.equal(L.gradeNetwork({routeSeen:['unsafe','clear'],networkAnswers:{},networkBoundary:'network'}).observed,false);
  assert.equal(L.gradeTransfer({transferVisited:['inscription','unsafe'],transferRatings:{},transferModel:'layered'}).visited,false);
});

test('interactive shell keeps checkpoint, feedback and visible-card invariants',()=>{
  const js=fs.readFileSync(path.join(__dirname,'..','zhou-network.js'),'utf8');
  assert.match(js,/const saved=log\.checkpoint\?\.\[L\.id\]\|\|\{\}/);
  assert.doesNotMatch(js,/\.\.\.defaults,\.\.\.saved/);
  assert.match(js,/evidenceAttempted:!!saved\.evidenceAttempted&&!!log\.records\[1\]\?\.attempts\?\.length/);
  assert.match(js,/networkAttempted:!!saved\.networkAttempted&&!!log\.records\[2\]\?\.attempts\?\.length/);
  assert.match(js,/transferAttempted:!!saved\.transferAttempted&&!!log\.records\[3\]\?\.attempts\?\.length/);
  assert.match(js,/if\(!state\.transferVisited\.includes\(state\.activeTransferCard\)\)/);
  assert.equal((js.match(/render\(\);focusFeedback\(\)/g)||[]).length,3);
  assert.match(js,/aria-label="判断：'\+esc\(claim\.text\)/);
});
