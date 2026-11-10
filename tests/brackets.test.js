'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const B=require('../brackets-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('distribution scales every signed term and preserves the expression value',()=>{
  assert.deepEqual(B.scaleLinear(2,{x:1,constant:3}),{x:2,constant:6});
  assert.deepEqual(B.scaleLinear(-1,{x:1,constant:-4}),{x:-1,constant:4});
  assert.deepEqual(B.scaleLinear(-2,{x:3,constant:-4}),{x:-6,constant:8});
  const expanded=B.addLinear(B.scaleLinear(-2,{x:3,constant:-4}),{x:5,constant:0});
  assert.deepEqual(expanded,{x:-1,constant:8});
  for(const x of [-3,0,5])assert.equal(B.evaluateLinear(expanded,x),-2*(3*x-4)+5*x);
});

test('one matching value cannot make a missed distribution an identity',()=>{
  const correct={x:2,constant:6},missed={x:2,constant:3};
  assert.notEqual(B.evaluateLinear(correct,4),B.evaluateLinear(missed,4));
  assert.deepEqual(B.scaleLinear(3,{x:1,constant:0}),{x:3,constant:0});
});

test('lab grading requires both gates, two checks, expansion and later like-term combining',()=>{
  const correct={gateActions:[...B.gateActions],sampleValues:[1,5],expandedX:'-6',expandedConstant:'+8',finalX:'-1',finalConstant:'8'};
  assert.deepEqual(B.gradeLab(correct),{gates:true,samples:true,expandedX:true,expandedConstant:true,finalX:true,finalConstant:true});
  assert.equal(B.gradeLab({...correct,gateActions:B.gateActions.slice(0,3)}).gates,false);
  assert.equal(B.gradeLab({...correct,sampleValues:[2,2]}).samples,false);
  assert.equal(B.gradeLab({...correct,expandedConstant:'-8'}).expandedConstant,false);
  assert.equal(B.gradeLab({...correct,finalX:'-11'}).finalX,false);
});

test('cargo transfer keeps model, expansion, simplification, check and reason separate',()=>{
  const correct={model:'right',expansion:'right',result:'right',checkValue:'13',reason:'scope'};
  assert.deepEqual(B.gradeTransfer(correct),{model:true,expansion:true,result:true,check:true,reason:true});
  assert.equal(B.gradeTransfer({...correct,model:'missed-first'}).model,false);
  assert.equal(B.gradeTransfer({...correct,expansion:'plus-one'}).expansion,false);
  assert.equal(B.gradeTransfer({...correct,result:'seven'}).result,false);
  assert.equal(B.gradeTransfer({...correct,checkValue:'15'}).check,false);
  assert.equal(B.gradeTransfer({...correct,reason:'first-only'}).reason,false);
});

test('sanitizer whitelists learning work and rejects forged completion state',()=>{
  const state=B.sanitizeState({
    coldChoices:['positive-right','unsafe','positive-right'],coldReason:'r'.repeat(1000),coldUnsure:true,
    gateActions:['positive-x','unsafe','negative-x'],sampleValue:99,sampleValues:[1,1,6,99],
    expandedX:'-6',expandedConstant:'8',finalX:'-1',finalConstant:'8',labAttempted:true,
    model:'right',expansion:'unsafe',result:'right',checkValue:'13',reason:'scope',transferAttempted:true,
    solved:true,completed:true,score:100
  });
  assert.deepEqual(state.coldChoices,['positive-right']);assert.equal(state.coldReason.length,900);
  assert.deepEqual(state.gateActions,['positive-x','negative-x']);assert.equal(state.sampleValue,2);assert.deepEqual(state.sampleValues,[1,6]);
  assert.equal(state.expansion,null);assert.equal(state.result,'right');
  assert.equal('solved' in state,false);assert.equal('completed' in state,false);assert.equal('score' in state,false);
});

test('course registration stays ordered, neutral before the first answer and offline-versioned',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),html=read('brackets.html'),js=read('brackets.js'),sw=read('sw.js');
  assert.match(catalog,/id:'brackets'.*subject:'数学'.*tasks:3.*fresh:true/s);
  assert.match(catalog,/recommendedOrder=\[\s*'repair',\s*'readenglish','poememotion','liketerms','brackets'/s);
  assert.match(catalog,/name:'括号里的式子，拆开后还一样吗？'/);
  assert.doesNotMatch(catalog,/name:'括号一打开，为什么每一项/);
  assert.equal((feedback.match(/\['brackets'/g)||[]).length,1);
  assert.match(html,/id="brackets-sources" hidden/);
  assert.doesNotMatch(html,/<h1>[^<]*每一项/);
  assert.doesNotMatch(html,/<footer[\s\S]*每一项/);
  assert.match(js,/state\.labAttempted=state\.labAttempted&&!!log\.records\[1\]/);
  assert.match(js,/log\.submit\(0,selected\.join\('；'\),null,why\)/);
  assert.match(js,/id="expanded-x" inputmode="text"/);
  assert.match(js,/role="group" aria-label="'\+esc\(label\)\+'"/);
  assert.match(js,/货舱净增加质量的建模式/);
  assert.match(js,/log\.submit\(1,[\s\S]*?log\.help\(1,'自动反馈/);
  assert.match(js,/log\.submit\(2,[\s\S]*?log\.help\(2,'自动反馈/);
  assert.match(sw,/CACHE_PREFIX\}v174/);
});
