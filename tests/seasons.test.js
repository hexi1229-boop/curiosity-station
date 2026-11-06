'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../seasons-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('science model separates daily rotation from the tilt and orbit season chain',()=>{
  assert.equal(L.tasks.length,3);
  assert.deepEqual(L.gradeEvidence({evidenceViewed:['opposite','distance','daynight'],revisedCause:'tilt-orbit',evidenceExplanation:'南北半球同一时刻季节相反，距离不能解释。'}),{evidence:true,cause:true,reason:true});
  assert.equal(L.gradeEvidence({evidenceViewed:['opposite','distance'],revisedCause:'tilt-orbit',evidenceExplanation:'南北半球同一时刻季节相反，距离不能解释。'}).evidence,false);
  assert.equal(L.gradeEvidence({evidenceViewed:['daynight'],revisedCause:'distance',evidenceExplanation:'因为距离发生变化所以夏天热。'}).evidence,false);
  assert.deepEqual(L.gradeLab({monthsViewed:['june','december'],tiltsViewed:['tilted','zero'],spinCompleted:true,labClaim:'split',labExplanation:'我关闭倾角后，六月和十二月的太阳高度与昼长差异消失。'}),{months:true,tilts:true,spin:true,claim:true,reason:true});
  assert.equal(L.gradeLab({monthsViewed:['june'],tiltsViewed:['tilted'],spinCompleted:false,labClaim:'rotation-seasons',labExplanation:'地球转动产生四季。'}).claim,false);
});

test('zero-tilt transfer keeps day and night but rejects Earth-like strong seasons',()=>{
  const correct={reviewClaim:'disagree',reviewDaynight:'yes',reviewSeasons:'no',reviewReason:'constant-light',reviewExplanation:'澄星自转会有昼夜，但零倾角时同一纬度全年光照不会像地球一样强烈改变。'};
  assert.deepEqual(L.gradeTransfer(correct),{claim:true,daynight:true,seasons:true,reason:true,explanation:true});
  assert.equal(L.gradeTransfer({...correct,reviewDaynight:'no'}).daynight,false);
  assert.equal(L.gradeTransfer({...correct,reviewReason:'same-temperature'}).reason,false);
});

test('lab observations change with month only when the axis is tilted',()=>{
  assert.deepEqual(L.labObservation({month:'june',tilt:'tilted'}),{altitude:'较高',daylight:'较长',direct:'直射点偏北',north:'北半球朝向太阳'});
  assert.deepEqual(L.labObservation({month:'december',tilt:'tilted'}),{altitude:'较低',daylight:'较短',direct:'直射点偏南',north:'北半球背向太阳'});
  assert.deepEqual(L.labObservation({month:'june',tilt:'zero'}),L.labObservation({month:'december',tilt:'zero'}));
});

test('state sanitizer keeps bounded whitelisted work and rejects forged mastery',()=>{
  const state=L.sanitizeState({
    coldCause:'unsafe',coldExplanation:'x'.repeat(1200),coldSaved:true,evidenceViewed:['opposite','unsafe','opposite'],
    month:'unsafe',tilt:'unsafe',monthsViewed:['june','unsafe'],tiltsViewed:['zero','unsafe'],spinHour:999,spinCompleted:true,labClaim:'split',
    planetClaim:'disagree',planetDaynight:'yes',planetSeasons:'no',reviewReason:'constant-light',reviewExplanation:'r'.repeat(1200),hintUsed:true,
    mastered:true,score:100,completed:true
  });
  assert.equal(state.coldCause,'');assert.equal(state.coldExplanation.length,900);assert.deepEqual(state.evidenceViewed,['opposite']);
  assert.equal(state.month,'june');assert.equal(state.tilt,'tilted');assert.deepEqual(state.monthsViewed,['june']);assert.deepEqual(state.tiltsViewed,['zero']);assert.equal(state.spinHour,24);
  assert.equal(state.reviewExplanation.length,900);assert.equal(state.hintUsed,true);
  assert.equal('mastered' in state,false);assert.equal('score' in state,false);assert.equal('completed' in state,false);
});

test('cold answer is neutral and open explanations are never automatically scored',()=>{
  const js=read('seasons.js'),html=read('seasons.html');
  const cold=js.slice(js.indexOf('function renderCold'),js.indexOf('function evidenceCards'));
  assert.doesNotMatch(cold,/L\.evidence|evidenceCards/);
  assert.match(cold,/首答前未展示近日点、远日点/);
  assert.match(js,/log\.submit\(0,'首答：'[\s\S]*?,null,state\.coldExplanation\)/);
  assert.match(js,/log\.submit\(1,'实验结论：'[\s\S]*?,null,state\.labExplanation\)/);
  assert.match(js,/log\.submit\(2,'澄星首答：'[\s\S]*?,null,state\.planetExplanation\)/);
  assert.match(js,/log\.submit\(2,'澄星复核：'[\s\S]*?,null,state\.reviewExplanation\)/);
  assert.match(html,/id="seasons-sources" hidden/);
  assert.match(html,/人教版七年级上册地理第一章第二节/);
  assert.match(html,/spaceplace\.nasa\.gov\/seasons/);
});

test('interaction requires both months, both tilt settings and a full day',()=>{
  const js=read('seasons.js'),css=read('seasons.css');
  assert.match(js,/\['june','december'\]\.every/);
  assert.match(js,/\['tilted','zero'\]\.every/);
  assert.match(js,/hour===24/);
  assert.match(js,/aria-valuetext/);
  assert.match(js,/equatorDy=zero\?0:13\.4/);
  assert.doesNotMatch(js,/log\.help\(1,'比较公转位置|log\.help\(1,'切换地轴倾角|log\.help\(1,'让天津随地球自转/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('catalog, records and cache register the geography lesson once after day and night',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),sw=read('sw.js');
  assert.equal((catalog.match(/id:'seasons'/g)||[]).length,1);
  assert.match(catalog,/'daynight','seasons','elements'/);
  assert.equal((feedback.match(/\['seasons'/g)||[]).length,1);
  assert.match(feedback,/findIndex\(course=>course\[0\]==='daynight'\)\+1/);
  assert.match(sw,/const CACHE = `\$\{CACHE_PREFIX\}v169`/);
});
