'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const L=require('../readenglish-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('the cold article is complete, original-sized and does not need a glossary to be submitted',()=>{
  const words=L.article.paragraphs.join(' ').match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g)||[];
  assert.ok(words.length>=120&&words.length<=180,`unexpected article length: ${words.length}`);
  assert.equal(L.mainOptions.find(item=>item.id==='evidence').text.includes('two different problems'),true);
  assert.equal(L.tasks.length,3);
});

test('guided grading requires the main idea, evidence from both problems, context inference and a rule',()=>{
  const correct={labMain:'evidence',labEvidence:['wheel-spinning','slowed-finished'],gripChoice:'traction',readingRule:'I look for the problem, change and result.'};
  assert.deepEqual(L.gradeLab(correct),{main:true,evidence:true,grip:true});
  assert.equal(L.gradeLab({...correct,labEvidence:['wheel-spinning','tipped-turn']}).evidence,true);
  assert.equal(L.gradeLab({...correct,labEvidence:['motor-turning','rubber-crossed','report']}).evidence,false);
  assert.equal(L.gradeLab({...correct,gripChoice:'power'}).grip,false);
  assert.equal(L.meaningful('word',4),false);
});

test('transfer checks only objective chat facts and the three-to-four-sentence structure',()=>{
  const correct={
    transferPlace:'lab',transferTime:'920',transferWait:'start',transferMissing:'lead',
    revisedUpdate:'We will meet outside Lab 2 at 9:20.',
    revisedAction:'Practice starts at 9:30, so the team should start without Leo.',
    revisedQuestion:'Can anyone bring the other extension lead?'
  };
  assert.deepEqual(L.gradeTransfer(correct),{place:true,time:true,wait:true,missing:true,update:true,action:true,question:true});
  assert.equal(L.gradeTransfer({...correct,transferTime:'930'}).time,false);
  assert.equal(L.gradeTransfer({...correct,revisedQuestion:'Please bring the other extension lead.'}).question,true);
  assert.equal(L.gradeTransfer({...correct,revisedQuestion:'请带另一根延长线。'}).question,false);
  assert.equal(L.gradeTransfer({...correct,revisedUpdate:'我们在实验室见。'}).update,false);
  assert.equal(L.meaningfulEnglish('这是三句中文。仍然不是英文。可以吗？',2),false);
  assert.equal(L.sentenceCount('One. Two? Three!'),3);
  assert.equal(L.sentenceCount('One sentence without punctuation'),1);
});

test('state sanitizer keeps only bounded whitelisted work and rejects forged completion',()=>{
  const state=L.sanitizeState({
    coldMain:'unsafe',coldSummary:'x'.repeat(1000),coldEvidence:['wheel-spinning','unsafe','wheel-spinning'],coldUnknown:'grip',coldSaved:true,
    clueViews:['but','unsafe'],labMain:'evidence',labEvidence:['slowed-finished','unsafe'],gripChoice:'traction',readingRule:'r'.repeat(1000),labAttempted:true,
    transferPlace:'lab',transferTime:'unsafe',transferWait:'start',transferMissing:'lead',firstReply:'u'.repeat(2000),selfChecks:['leo','unsafe'],
    completed:true,score:100,mastered:true
  });
  assert.equal(state.coldMain,'');assert.equal(state.coldSummary.length,600);
  assert.deepEqual(state.coldEvidence,['wheel-spinning']);assert.deepEqual(state.clueViews,['but']);
  assert.deepEqual(state.labEvidence,['slowed-finished']);assert.equal(state.readingRule.length,600);
  assert.equal(state.transferTime,'');assert.equal(state.firstReply.length,1800);assert.deepEqual(state.selfChecks,['leo']);
  assert.equal('completed' in state,false);assert.equal('score' in state,false);assert.equal('mastered' in state,false);
});

test('course is uniquely registered, first in the new batch and released for offline refresh',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),html=read('readenglish.html'),js=read('readenglish.js'),sw=read('sw.js');
  assert.match(catalog,/id:'readenglish'.*subject:'英语'.*tasks:3.*fresh:true/s);
  assert.match(catalog,/recommendedOrder=\[\s*'repair',\s*'readenglish','poememotion','liketerms','brackets','equation'/s);
  assert.equal((catalog.match(/id:'readenglish'/g)||[]).length,1);
  assert.equal((feedback.match(/\['readenglish'/g)||[]).length,1);
  assert.match(feedback,/\['readenglish','单词没全懂，也能抓住一篇英文在说什么吗？','readenglish\.html'\]/);
  assert.match(html,/id="readenglish-sources" hidden/);
  assert.doesNotMatch(html,/Better grip helped on the sand/);
  assert.match(js,/log\.submit\(0,readableCold\(\),null,state\.coldSummary\)/);
  assert.match(js,/log\.submit\(2,transferSummary\(\),null,reply\)/);
  assert.match(js,/log\.submit\(2,transferSummary\('revised'\),null,finalReply\)/);
  assert.match(js,/log\.submit\(1,[\s\S]*?,null,state\.readingRule\)/);
  assert.match(js,/L\.meaningfulEnglish\(reply,12\)/);
  assert.match(js,/log\.submit\(1,[\s\S]*?log\.help\(1,'自动反馈/);
  assert.match(js,/log\.submit\(2,[\s\S]*?log\.help\(2,'自动反馈/);
  assert.match(sw,/CACHE_PREFIX\}v174/);
});

test('a new learning session is bound to readenglish and keeps open replies unscored',()=>{
  const prefix='curiosity-station:learning:v1:';
  const store=new Map();
  const localStorage={get length(){return store.size;},key:index=>[...store.keys()][index]??null,getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
  const window={localStorage};
  vm.runInNewContext(read('learning-feedback.js'),{window,console});
  const feedback=window.LearningFeedback;
  const log=feedback.create(L.title,L.tasks);
  log.submit(0,'cold evidence',null,'my first summary');
  log.finish(0,'cold read saved');
  const session=feedback.history()[0];
  assert.equal(session.courseId,'readenglish');
  assert.equal(session.records.length,3);
  assert.equal(session.records[0].first.correct,null);
  assert.equal(session.records[0].first.explanation,'my first summary');
});
