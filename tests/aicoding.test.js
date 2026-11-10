'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const L=require('../aicoding-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('one happy path does not hide the two candidate-program defects',()=>{
  assert.equal(L.tasks.length,3);
  const result=Object.fromEntries(L.runSuite(L.baseProgram).map(item=>[item.scenario,item]));
  assert.equal(result.normal.pass,true);
  assert.equal(result.already.pass,true);
  assert.equal(result.rock.pass,false);
  assert.equal(result.rock.status,'collision');
  assert.equal(result.battery.pass,false);
  assert.equal(result.battery.final.battery,0);
});

test('repair changes a general rule and passes normal, edge and regression tests',()=>{
  const suite=L.runSuite(L.fixedProgram);
  assert.equal(suite.length,4);
  assert.equal(suite.every(item=>item.pass),true);
  assert.equal(suite.find(item=>item.scenario==='battery').status,'aborted');
  assert.equal(suite.find(item=>item.scenario==='rock').final.battery,3);
  assert.deepEqual(L.gradeRover({testsSeen:['normal','rock','battery'],baseFailuresSeen:['rock','battery'],program:L.fixedProgram,reason:'先检查再前进，并把保留电量算进门槛。'}),{observed:true,tested:true,program:true,regression:true,reason:true});
  assert.equal(L.gradeRover({testsSeen:['normal'],program:L.fixedProgram,reason:'只跑普通地图。'}).tested,false);
  assert.equal(L.gradeRover({testsSeen:['normal','rock','battery'],program:L.fixedProgram,reason:'直接选了修复。'}).observed,false);
  assert.equal(L.sameProgram(L.baseProgram,{checkOrder:'after',reserveRule:'steps'}),true);
});

test('sandstorm transfer rebuilds energy instead of swapping route numbers',()=>{
  const correct={modelChoice:'energy',routeEnergy:'4',neededEnergy:'6',predictions:{low:'abort',exact:'execute',extra:'execute'},operator:'less',reason:'沙暴每格耗电不同，所以要加总每段能耗。'};
  assert.deepEqual(L.gradeTransfer(correct),{model:true,energy:true,predictions:true,rule:true,reason:true});
  assert.equal(L.gradeTransfer({...correct,modelChoice:'segments'}).model,false);
  assert.equal(L.gradeTransfer({...correct,operator:'less-equal'}).rule,false);
  assert.equal(L.transferOutcome(6,6,'less'),'execute');
  assert.equal(L.transferOutcome(6,6,'less-equal'),'abort');
});

test('state sanitizer keeps bounded evidence and rejects forged mastery',()=>{
  const state=L.sanitizeState({
    requirements:['reach','reach','unsafe'],coldDecision:'unsafe',coldReason:'x'.repeat(1200),coldSaved:true,
    testsSeen:['normal','unsafe','rock'],baseFailuresSeen:['rock','unsafe'],program:{checkOrder:'unsafe',reserveRule:'plus-one'},roverHintLevel:99,
    routeEnergy:'123456789',neededEnergy:'6',modelChoice:'peak',predictions:{low:'abort',exact:'unsafe',extra:'execute'},transferOperator:'less',transferHintLevel:99,
    completed:true,mastered:true,score:100
  });
  assert.deepEqual(state.requirements,['reach']);assert.equal(state.coldDecision,'');assert.equal(state.coldReason.length,900);
  assert.deepEqual(state.testsSeen,['normal','rock']);assert.deepEqual(state.baseFailuresSeen,['rock']);assert.deepEqual(state.program,{checkOrder:'after',reserveRule:'plus-one'});assert.equal(state.roverHintLevel,3);
  assert.equal(state.routeEnergy.length,8);assert.equal(state.modelChoice,'peak');assert.deepEqual(state.predictions,{low:'abort',extra:'execute'});assert.equal(state.transferHintLevel,3);
  assert.equal('completed' in state,false);assert.equal('mastered' in state,false);assert.equal('score' in state,false);
});

test('page labels the AI and code as simulations and avoids arbitrary code execution',()=>{
  const html=read('aicoding.html'),js=read('aicoding.js'),css=read('aicoding.css');
  assert.match(html,/不连接真实 AI，也不运行任意代码/);
  assert.match(html,/教学情境/);
  assert.match(html,/伪代码/);
  assert.match(html,/Experience AI/);
  assert.doesNotMatch(js,/\beval\s*\(|new Function\s*\(/);
  assert.match(js,/log\.submit\(0,answer,correct,state\.coldReason\)/);
  assert.match(js,/log\.submit\(1,summary,correct,state\.roverReason\)/);
  assert.match(js,/log\.submit\(2,summary,correct,state\.transferReason\)/);
  assert.match(js,/baseFailuresSeen/);
  assert.match(js,/const codeModel=verified\?/);
  assert.match(js,/\$\{verified\?'<details class="ai-hints" data-help="主任务后加速挑战"/);
  assert.doesNotMatch(js,/刚好等于门槛/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('unsure placeholder is recorded but never counted as explanation evidence',()=>{
  assert.equal(L.hasReason('把每段耗电加总'),true);
  assert.equal(L.gradeCold({requirements:L.required,decision:'test-first',reason:'暂时说不清'}).reason,false);
  assert.equal(L.gradeRover({testsSeen:['normal','rock','battery'],baseFailuresSeen:['rock','battery'],program:L.fixedProgram,reason:'暂时说不清'}).reason,false);
  assert.equal(L.gradeTransfer({modelChoice:'energy',routeEnergy:'4',neededEnergy:'6',predictions:{low:'abort',exact:'execute',extra:'execute'},operator:'less',reason:'暂时说不清'}).reason,false);
});

test('failure evidence is committed only after the visible animation completes',()=>{
  const js=read('aicoding.js');
  assert.match(js,/animateResult\(result,\(\)=>completeTestObservation\(result\)\)/);
  assert.match(js,/function completeTestObservation\(result\)/);
  assert.match(js,/latestResultDone=true;[\s\S]*baseFailuresSeen\.push/);
  assert.match(js,/data-test="\$\{id\}" \$\{latestResult&&!latestResultDone\?'disabled'/);
  assert.match(js,/L\.hasReason\(record\.first\?\.explanation\)/);
  assert.doesNotMatch(js,/\$\{latestResultDone\?`<strong>/);
});

test('a new learning session binds to aicoding and preserves the first explanation',()=>{
  const store=new Map();
  const localStorage={get length(){return store.size;},key:index=>[...store.keys()][index]??null,getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
  const window={localStorage};
  vm.runInNewContext(read('learning-feedback.js'),{window,console});
  const F=window.LearningFeedback,log=F.create(L.title,L.tasks);
  log.submit(0,'先测试',true,'一次演示只覆盖一种输入');
  log.submit(0,'仍然先测试',true,'还要看边界输入');
  const session=F.history()[0];
  assert.equal(session.courseId,'aicoding');assert.equal(session.records.length,3);
  assert.equal(session.records[0].first.explanation,'一次演示只覆盖一种输入');
  assert.equal(session.records[0].attempts.length,2);
});

test('catalog, record link, filter and offline cache register the course once',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),courses=read('courses.html'),sw=read('sw.js');
  assert.equal((catalog.match(/id:'aicoding'/g)||[]).length,1);
  assert.match(catalog,/id:'aicoding'.*subject:'计算机'.*group:'explore'.*tasks:3.*fresh:true/s);
  assert.match(catalog,/'aicoding','rotor','rocket'/);
  assert.equal((feedback.match(/\['aicoding'/g)||[]).length,1);
  assert.match(feedback,/\['aicoding','AI 写的代码，为什么还不能直接发射？','aicoding\.html'\]/);
  assert.match(courses,/<option>计算机<\/option>/);
  assert.match(sw,/const CACHE = `\$\{CACHE_PREFIX\}v174`/);
});
