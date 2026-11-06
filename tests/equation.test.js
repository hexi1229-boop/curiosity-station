'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const E=require('../equation-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('cold claims separate equivalent equations from changed or information-free equations',()=>{
  assert.deepEqual(E.coldAnswer,['minus-six','divide-two']);
  assert.equal(E.sameSet(['divide-two','minus-six'],E.coldAnswer),true);
  assert.equal(E.sameSet(['minus-six','zero'],E.coldAnswer),false);
});

test('both reversible routes preserve the unique solution x=7',()=>{
  const first=E.stepLab('start','minus6');
  assert.deepEqual(first,{node:'minus6',view:'minus6'});
  assert.deepEqual(E.stepLab(first.node,'divide2'),{node:'solved',view:'solved',path:'minus6-divide2'});
  const second=E.stepLab('start','divide2');
  assert.deepEqual(second,{node:'divide2',view:'divide2'});
  assert.deepEqual(E.stepLab(second.node,'minus3'),{node:'solved',view:'solved',path:'divide2-minus3'});
});

test('one-sided change breaks equality while multiplying by zero loses information',()=>{
  assert.deepEqual(E.stepLab('start','left-only'),{node:'start',view:'broken'});
  assert.deepEqual(E.stepLab('start','times0'),{node:'start',view:'zero'});
  assert.match(E.labStates.zero.caption,/任何 x.*唯一答案丢失/);
  assert.match(E.labStates.broken.caption,/不再相等/);
});

test('lab grading checks route, zero boundary and original-equation substitution separately',()=>{
  const correct={labPath:'divide2-minus3',zeroChoice:'information-lost',checkValue:'20'};
  assert.deepEqual(E.gradeLab(correct),{path:true,zero:true,check:true});
  assert.equal(E.gradeLab({...correct,zeroChoice:'false-equality'}).zero,false);
  assert.equal(E.gradeLab({...correct,checkValue:'14'}).check,false);
});

test('data-package transfer keeps model, operation chain, answer, check and reason separate',()=>{
  const correct={model:'right',chain:'right',resultValue:'7',transferCheck:'25',reason:'whole'};
  assert.deepEqual(E.gradeTransfer(correct),{model:true,chain:true,result:true,check:true,reason:true});
  assert.equal(E.gradeTransfer({...correct,model:'grouped'}).model,false);
  assert.equal(E.gradeTransfer({...correct,chain:'partial-divide'}).chain,false);
  assert.equal(E.gradeTransfer({...correct,transferCheck:'21'}).check,false);
});

test('sanitizer keeps only whitelisted work and rejects forged mastery state',()=>{
  const state=E.sanitizeState({
    coldChoices:['minus-six','unsafe','minus-six'],coldReason:'r'.repeat(1000),
    labNode:'unsafe',labView:'zero',labPath:'divide2-minus3',seenActions:['divide2','unsafe','minus3'],zeroChoice:'information-lost',checkValue:'20',labAttempted:true,
    model:'right',chain:'unsafe',resultValue:'7',transferCheck:'25',reason:'whole',transferAttempted:true,
    solved:true,completed:true,score:100
  });
  assert.deepEqual(state.coldChoices,['minus-six']);assert.equal(state.coldReason.length,900);
  assert.equal(state.labNode,'start');assert.equal(state.labView,'zero');assert.deepEqual(state.seenActions,['divide2','minus3']);
  assert.equal(state.chain,null);assert.equal(state.reason,'whole');
  assert.equal('solved' in state,false);assert.equal('completed' in state,false);assert.equal('score' in state,false);
});

test('existing equation URL is upgraded once, ordered in the algebra chain and offline-versioned',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),html=read('equation.html'),js=read('equation.js'),sw=read('sw.js');
  assert.match(catalog,/id:'equation'.*name:'等式变了，原来的答案还在吗？'.*tasks:3.*fresh:true/s);
  assert.match(catalog,/recommendedOrder=\[\s*'repair',\s*'readenglish','liketerms','brackets','equation'/s);
  assert.equal((catalog.match(/id:'equation'/g)||[]).length,1);
  assert.equal((feedback.match(/\['equation'/g)||[]).length,1);
  assert.match(feedback,/\['equation','等式变了，原来的答案还在吗？','equation\.html'\]/);
  assert.match(html,/id="equation-sources" hidden/);
  assert.match(html,/旧版数学七年级上册目录/);
  assert.doesNotMatch(html,/<h1>[\s\S]{0,80}两边同时做/);
  assert.doesNotMatch(html,/<footer[\s\S]*两边的整个式子/);
  assert.match(js,/log\.submit\(0,selected\.join\('；'\),null,why\)/);
  assert.match(js,/state\.labAttempted=state\.labAttempted&&!!log\.records\[1\]/);
  assert.match(js,/state\.transferAttempted=state\.transferAttempted&&!!log\.records\[2\]/);
  assert.match(js,/state\.labAttempted\?'<details/);
  assert.match(js,/state\.transferAttempted\?'<details/);
  assert.match(js,/乘0会得到真等式，却丢掉原方程的信息/);
  assert.doesNotMatch(E.tasks[1].title,/x＝7|两边同时|乘0/);
  assert.doesNotMatch(E.tasks[1].context,/x＝7|可逆|丢信息/);
  assert.match(sw,/CACHE_PREFIX\}v165/);
});

test('an old five-question completion stays in history but does not complete the upgraded course',()=>{
  const catalog=require('../catalog.js');
  const course=catalog.items.find(item=>item.id==='equation');
  const old={courseId:'equation',title:'神秘货箱有多重？',updatedAt:1,records:Array.from({length:5},()=>({done:true}))};
  const fresh={courseId:'equation',title:E.title,updatedAt:2,records:E.tasks.map(()=>({done:false}))};
  assert.deepEqual(catalog.sessionsFor(course,catalog.latest([old])),[]);
  assert.deepEqual(catalog.sessionsFor(course,catalog.latest([old,fresh])),[fresh]);
});

test('old unfinished five-question work and the new three-stage session coexist in local storage',()=>{
  const prefix='curiosity-station:learning:v1:';
  const old={version:1,id:'old-equation',courseId:'equation',title:'神秘货箱有多重？',startedAt:1,updatedAt:2,revision:1,taskCount:5,checkpoint:{},records:Array.from({length:5},(_,index)=>({title:'旧题'+index,context:'',first:null,attempts:[],helps:[],notes:[],done:index<2,self:'',draft:{}}))};
  const store=new Map([[prefix+old.id,JSON.stringify(old)]]);
  const localStorage={get length(){return store.size;},key:index=>[...store.keys()][index]??null,getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
  const window={localStorage};
  vm.runInNewContext(read('learning-feedback.js'),{window,console});
  const feedback=window.LearningFeedback;
  const log=feedback.create(E.title,E.tasks);
  assert.equal(log.records.length,3);assert.equal(log.records.every(record=>!record.done),true);
  log.save();
  const history=feedback.history();
  assert.equal(history.length,2);
  assert.equal(history.some(session=>session.title===old.title&&session.records.length===5),true);
  assert.equal(history.some(session=>session.title===E.title&&session.records.length===3),true);
});
