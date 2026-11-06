'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../massconservation-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('molecule count may change while every atom inventory stays equal',()=>{
  assert.equal(L.atomExample.before.length,3);
  assert.equal(L.atomExample.after.length,2);
  assert.deepEqual(L.countAtoms(L.atomExample.before),{H:4,O:2});
  assert.deepEqual(L.countAtoms(L.atomExample.after),{H:4,O:2});
  assert.equal(L.sameAtomInventory(L.atomExample.before,L.atomExample.after),true);
});

test('missing, extra and unknown atoms cannot pass an atom account',()=>{
  assert.equal(L.sameAtomInventory([['X','X'],['Y','Y']],[['X','Y'],['X','Y']]),true);
  assert.equal(L.sameAtomInventory([['X','X'],['Y','Y']],[['X','Y']]),false);
  assert.equal(L.sameAtomInventory([['X','X'],['Y']],[['X','Y'],['X']]),true);
  assert.equal(L.sameAtomInventory([['X','X'],['Y']],[['X','Y'],['Z']]),false);
  assert.equal(L.sameAtomInventory([['X','?']],[['X','?']]),false);
  assert.equal(L.sameAtomInventory([['X'],['Y']],[['Z'],['Z']]),false,'equal particle counts do not replace element identity');
});

test('system reading follows entered and left mass across the same boundary',()=>{
  assert.equal(L.systemReading({start:100,entered:0,left:0}),100);
  assert.equal(L.systemReading({start:100,entered:0,left:2}),98);
  assert.equal(L.systemReading({start:6.4,entered:1.6,left:0}),8);
  assert.equal(Number.isNaN(L.systemReading({start:'oops',entered:0,left:0})),true);
});

test('atom task requires viewing both guided counts and the balanced candidate',()=>{
  assert.equal(L.gradeAtom({atomGuideSeen:['H','O'],atomChoice:'balanced'}).correct,true);
  assert.equal(L.gradeAtom({atomGuideSeen:['H'],atomChoice:'balanced'}).correct,false);
  assert.equal(L.gradeAtom({atomGuideSeen:['H','O'],atomChoice:'missing-x'}).correct,false);
  assert.equal(L.gradeAtom({atomGuideSeen:['H','O'],atomChoice:'balanced',solved:true}).correct,true);
  assert.equal(L.gradeAtom({atomGuideSeen:[],atomChoice:'missing-x',solved:true}).correct,false);
});

test('copper account needs the same boundary, oxygen flow, mass difference and rule',()=>{
  const correct={boundarySeen:['closed','open'],copperBoundary:'copper-oxygen',copperFlow:'oxygen-in',copperOxygenMass:'1.6',copperRule:'conserved'};
  assert.equal(L.gradeCopper(correct).correct,true);
  assert.equal(L.gradeCopper({...correct,boundarySeen:['closed','closed']}).guide,false);
  assert.equal(L.gradeCopper({...correct,copperBoundary:'copper-only'}).correct,false);
  assert.equal(L.gradeCopper({...correct,copperFlow:'none'}).correct,false);
  assert.equal(L.gradeCopper({...correct,copperOxygenMass:'8.0'}).correct,false);
  assert.equal(L.gradeCopper({...correct,copperRule:'closed-only'}).correct,false);
});

test('independent transfer explains opposite scale readings with one rule',()=>{
  const correct={transferAnswers:{a:'gas-out',b:'oxygen-in'},transferRule:'conserved'};
  assert.equal(L.gradeTransfer(correct).correct,true);
  assert.equal(L.gradeTransfer({...correct,transferAnswers:{a:'mass-gone',b:'oxygen-in'}}).a,false);
  assert.equal(L.gradeTransfer({...correct,transferAnswers:{a:'gas-out',b:'new-mass'}}).b,false);
  assert.equal(L.gradeTransfer({...correct,transferRule:'closed-only'}).rule,false);
  assert.equal(L.gradeTransfer({...correct,solved:true,transferAnswers:{}}).correct,false);
});

test('state sanitizer rejects forged completion, unknown ids and duplicate observations',()=>{
  const state=L.sanitizeState({
    coldChoice:'boundary',coldReason:'r'.repeat(900),coldUnsure:true,
    atomGuideSeen:['H','unsafe','H','O'],atomChoice:'balanced',atomAttempted:true,atomHintLevel:99,
    boundarySeen:['closed','closed','unsafe','open'],boundaryMode:'unsafe',
    copperBoundary:'copper-oxygen',copperFlow:'oxygen-in',copperOxygenMass:'1.6',copperRule:'conserved',copperAttempted:true,copperHintLevel:99,
    transferAnswers:{a:'gas-out',b:'oxygen-in',unsafe:'mass-gone'},transferRule:'conserved',transferAttempted:true,transferHintLevel:99,
    solved:true,correct:true,score:100
  });
  assert.deepEqual(state.atomGuideSeen,['H','O']);assert.deepEqual(state.boundarySeen,['closed','open']);assert.equal(state.boundaryMode,'closed');
  assert.deepEqual(state.transferAnswers,{a:'gas-out',b:'oxygen-in'});assert.equal(state.coldReason.length,700);
  assert.equal(state.atomHintLevel,L.atomHints.length);assert.equal(state.copperHintLevel,L.copperHints.length);assert.equal(state.transferHintLevel,L.transferHints.length);
  assert.equal('solved' in state,false);assert.equal('correct' in state,false);assert.equal('score' in state,false);
});

test('page states safety and scope boundaries without leaking the final rule before transfer',()=>{
  const html=read('massconservation.html'),js=read('massconservation.js');
  assert.match(html,/id="mass-rule-box" hidden/);assert.match(html,/id="mass-sources" hidden/);
  assert.match(html,/id="atoms"[^>]* hidden/);assert.match(html,/id="boundary"[^>]* hidden/);assert.match(html,/id="transfer"[^>]* hidden/);
  assert.match(html,/X₂[\s\S]*两个 X 原子连成一组/);assert.match(html,/id="atom-independent-before"/);
  assert.match(html,/旧版目录（2015年页面）/);assert.match(html,/不据此声称新版目录完全相同/);
  assert.match(html,/不要在家密封产气反应/);assert.match(html,/更不要加热密闭容器/);
  assert.match(html,/不提前教授配平、方程式计算或“摩尔”/);
  assert.match(html,/不是微粒真实碰撞路径/);assert.match(html,/不能单独证明反应一定发生/);
  assert.match(js,/\$\('mass-rule-box'\)\.hidden=!log\.records\[3\]\.done/);
});

test('interactive shell restores only whitelisted state and records feedback after submit',()=>{
  const js=read('massconservation.js');
  assert.match(js,/const clean=L\.sanitizeState\(log\.checkpoint\?\.\[L\.id\]\)/);
  assert.match(js,/clean\.atomAttempted=clean\.atomAttempted&&!!log\.records\[1\]\?\.attempts\?\.length/);
  assert.match(js,/clean\.transferAttempted=clean\.transferAttempted&&!!log\.records\[3\]\?\.attempts\?\.length/);
  assert.match(js,/disabled=!attempted\|\|level>=list\.length\|\|record\.done/);
  assert.match(js,/function renderAccess\(\)/);
  assert.doesNotMatch(js,/\.\.\.saved|solved|passed/);
  assert.match(js,/log\.submit\(1,[\s\S]*?if\(!result\.correct\)log\.help\(1,'自动反馈/);
  assert.match(js,/log\.submit\(2,[\s\S]*?if\(!result\.correct\)log\.help\(2,'自动反馈/);
  assert.match(js,/log\.submit\(3,[\s\S]*?if\(!result\.correct\)log\.help\(3,'自动反馈/);
});

test('course is registered once across catalog, records, sequence and offline release',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),previous=read('chentaiqiu.html'),sw=read('sw.js');
  assert.match(catalog,/id:'massconservation'.*subject:'化学'.*tasks:4/s);
  assert.match(catalog,/recommendedOrder=[\s\S]*'chentaiqiu','massconservation','activewords'/);
  assert.equal((feedback.match(/\['massconservation'/g)||[]).length,1);
  assert.match(previous,/href="massconservation\.html"/);
  assert.match(sw,/curiosity-station-`?v169|CACHE_PREFIX\}v169/);
});

