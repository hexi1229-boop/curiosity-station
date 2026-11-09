'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../liketerms-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('like terms share the complete variable part, not merely one visible letter',()=>{
  const a={coefficient:3,powers:{a:1}};
  const anotherA={coefficient:2,powers:{a:1}};
  const aSquared={coefficient:2,powers:{a:2}};
  const b={coefficient:2,powers:{b:1}};
  const ab={coefficient:1,powers:{a:1,b:1}};
  const ba={coefficient:4,powers:{b:1,a:1}};
  assert.equal(L.areLikeTerms(a,anotherA),true);
  assert.equal(L.areLikeTerms(a,aSquared),false);
  assert.equal(L.areLikeTerms(a,b),false);
  assert.equal(L.areLikeTerms(ab,ba),true);
  assert.equal(L.termKey(ab),'a^1*b^1');
});

test('combining uses coefficient addition and keeps each variable part intact',()=>{
  const result=L.combineLikeTerms([
    {coefficient:4,powers:{x:1}},
    {coefficient:-1,powers:{x:1}},
    {coefficient:2,powers:{y:1}},
    {coefficient:3,powers:{}},
    {coefficient:-1,powers:{}}
  ]);
  assert.deepEqual(result,[
    {coefficient:3,powers:{x:1}},
    {coefficient:2,powers:{y:1}},
    {coefficient:2,powers:{}}
  ]);
  assert.equal(L.combineLikeTerms([{coefficient:1,powers:{a:1}},{coefficient:-1,powers:{a:1}}]).length,0);
  assert.equal(L.combineLikeTerms([{coefficient:1,powers:{'a+b':1}}]),null);
});

test('a special value cannot turn unlike terms into a structural identity',()=>{
  const left=[{coefficient:3,powers:{a:1}},{coefficient:2,powers:{b:1}}];
  const accidental=[{coefficient:5,powers:{a:1}}];
  assert.equal(L.evaluateTerms(left,{a:4,b:4}),L.evaluateTerms(accidental,{a:4,b:4}));
  assert.notEqual(L.evaluateTerms(left,{a:4,b:7}),L.evaluateTerms(accidental,{a:4,b:7}));
  assert.equal(L.areLikeTerms(left[0],left[1]),false);
});

test('lab grading requires two sample values, exact grouping, coefficients and power diagnosis',()=>{
  const correct={sampleValues:[2,5],groups:{'4x':'x','-x':'x','2y':'y','3':'constant','-1':'constant'},xCoefficient:'3',yCoefficient:'2',constant:'2',powerChoice:'cannot'};
  assert.deepEqual(L.gradeLab(correct),{grouped:true,x:true,y:true,constant:true,power:true,samples:true});
  assert.equal(L.gradeLab({...correct,sampleValues:[2,2]}).samples,false);
  assert.equal(L.gradeLab({...correct,groups:{...correct.groups,'-x':'constant'}}).grouped,false);
  assert.equal(L.gradeLab({...correct,xCoefficient:'5'}).x,false);
  assert.equal(L.gradeLab({...correct,powerChoice:'can'}).power,false);
});

test('route transfer needs 3x+4, a counterexample value and the general grouping reason',()=>{
  const correct={option:'right',claim:'not-always',checkValue:'13',reason:'group'};
  assert.deepEqual(L.gradeTransfer(correct),{option:true,claim:true,check:true,reason:true});
  assert.equal(L.gradeTransfer({...correct,option:'seven-x'}).option,false);
  assert.equal(L.gradeTransfer({...correct,claim:'always'}).claim,false);
  assert.equal(L.gradeTransfer({...correct,checkValue:'21'}).check,false);
  assert.equal(L.gradeTransfer({...correct,reason:'add-all'}).reason,false);
});

test('state sanitizer accepts only whitelisted work and never trusts forged completion',()=>{
  const state=L.sanitizeState({
    coldChoices:['same-a','unsafe','same-a'],coldReason:'r'.repeat(1000),coldUnsure:true,
    sampleValue:99,sampleValues:[1,1,4,99],sampleExpanded:true,
    groups:{'4x':'x','-x':'unsafe','2y':'y',unsafe:'constant'},xCoefficient:'3',yCoefficient:'2',constant:'2',powerChoice:'cannot',labAttempted:true,
    option:'right',claim:'not-always',checkValue:'13',reason:'group',transferAttempted:true,
    solved:true,completed:true,score:100
  });
  assert.deepEqual(state.coldChoices,['same-a']);assert.equal(state.coldReason.length,900);
  assert.equal(state.sampleValue,2);assert.deepEqual(state.sampleValues,[1,4]);
  assert.deepEqual(state.groups,{'4x':'x','2y':'y'});
  assert.equal('solved' in state,false);assert.equal('completed' in state,false);assert.equal('score' in state,false);
});

test('course is registered across catalog, records and offline release',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),html=read('liketerms.html'),js=read('liketerms.js'),sw=read('sw.js');
  assert.match(catalog,/id:'liketerms'.*subject:'数学'.*tasks:3.*fresh:true/s);
  assert.match(catalog,/recommendedOrder=\[\s*'repair',\s*'readenglish','poememotion','liketerms'/s);
  assert.doesNotMatch(catalog,/name:'3a＋2a能合并/);
  assert.match(catalog,/name:'字母式长得很像，哪些真的能合并？'/);
  assert.equal((feedback.match(/\['liketerms'/g)||[]).length,1);
  assert.match(html,/id="liketerms-sources" hidden/);
  assert.doesNotMatch(html,/<h1>3a＋2a能合并/);
  assert.doesNotMatch(html,/代数守则：先找共同变量部分/);
  assert.match(html,/字母在代数式里表示数/);
  assert.match(js,/state\.labAttempted=state\.labAttempted&&!!log\.records\[1\]/);
  assert.doesNotMatch(js,/代入 x＝3 能推翻错误/);
  assert.match(js,/一次不一致足以推翻“总成立”/);
  assert.match(js,/log\.submit\(1,[\s\S]*?log\.help\(1,'自动反馈/);
  assert.match(js,/log\.submit\(2,[\s\S]*?log\.help\(2,'自动反馈/);
  assert.match(sw,/CACHE_PREFIX\}v171/);
});
