'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const L=require('../yungong-content.js');
const timing=score=>score.events.map(({velocity,voice,...note})=>note);

test('moving accents changes only motor emphasis, preserving tempo, every onset, pitch and duration',()=>{
  const a=L.score(L.defaults),b=L.score({...L.defaults,accent:'between'});
  assert.equal(a.bpm,96);assert.equal(b.bpm,96);assert.equal(a.totalBeats,16);
  assert.deepEqual(timing(a),timing(b));
  assert.deepEqual(a.events.filter(n=>n.role!=='motor'),b.events.filter(n=>n.role!=='motor'));
  assert.notDeepEqual(a.events.filter(n=>n.role==='motor'),b.events.filter(n=>n.role==='motor'));
  for(let i=0;i<4;i++)assert.equal(b.events.filter(n=>n.role==='motor'&&n.beat>=i*4&&n.beat<i*4+4).length,8);
  assert.deepEqual(b.events.filter(n=>n.role==='motor'&&n.velocity===.6).map(n=>n.beat),[1.5,3.5,5.5,7.5,9.5,11.5,13.5,15.5]);
});

test('each fader controls its own layer; shared timbre leaves musical events and levels intact',()=>{
  const baseline=L.score(L.defaults),quiet=L.score({...L.defaults,motor:20});
  assert.deepEqual(baseline.events.filter(n=>n.role!=='motor'),quiet.events.filter(n=>n.role!=='motor'));
  const unified=L.score({...L.defaults,color:'same'});
  assert.deepEqual(baseline.events.map(({voice,...note})=>note),unified.events.map(({voice,...note})=>note));
  assert.ok(unified.events.every(n=>n.voice==='melody'));
  assert.ok(L.score({...L.defaults,motor:0,bed:0}).events.every(n=>n.role==='lead'));
  assert.equal(L.score({lead:0,motor:0,bed:0}).events.length,0);
});

test('original score stays in bounds and even a conservative full mix is below clipping',()=>{
  for(const color of ['same','separate']){
    const score=L.score({lead:100,motor:100,bed:100,color});
    assert.ok(score.events.every(n=>n.beat>=0&&n.beat+n.duration<=16&&n.velocity>0&&n.velocity<=1));
    const gains={melody:.17,pulse:.075,chord:.075};
    const peak=Math.max(...score.events.map(n=>score.events.filter(x=>x.beat<=n.beat&&x.beat+x.duration>n.beat).reduce((s,x)=>s+gains[x.voice]*x.velocity,0)))*.8;
    assert.ok(peak<.7,`worst-case peak ${peak}`);
  }
  const s=L.state({tab:50,mix:{lead:999,motor:-1,bed:NaN,color:'piano'},impression:'x'.repeat(1000),returnHeard:'yes'});
  assert.equal(s.tab,0);assert.equal(s.mix.lead,100);assert.equal(s.mix.motor,0);assert.equal(s.mix.bed,40);assert.equal(s.mix.color,'separate');assert.equal(s.impression.length,900);assert.equal(s.returnHeard,false);
});

function device(){
  const data=new Map(),localStorage={get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
  const window={localStorage,crypto:webcrypto},context=vm.createContext({window,Blob,TextEncoder});
  for(const file of ['learning-feedback.js','learning-backup.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  return {F:window.LearningFeedback,B:window.LearningBackup};
}
test('first listening, help phases, mix snapshots and optional piano notes survive export/import and revision',async()=>{
  const from=device(),log=from.F.create(L.title,L.tasks),mix={...L.defaults,motor:20};
  log.submit(0,'版本：自己的钢琴；位置：开头',null,'我先跟着低处的声音');log.help(0,'首听后查看三个听音视角');log.finish(0);
  log.help(1,'拆层示例');log.submit(1,L.describe(mix),null,'短音轻一些，容易哼旋律');
  log.draft(1,{$mixFirst:JSON.stringify({mix,reason:'容易哼旋律'}),$mixLatest:JSON.stringify({mix,reason:'容易哼旋律'})});log.finish(1);
  log.submit(2,'自述已回听；我找到背景声音',null,'只观察两句衔接');log.finish(2);
  const saved=L.state({tab:2,mix,heardMix:JSON.stringify(mix),returnHeard:true,pianoFocus:'join',pianoNote:'前一拍与后一拍'});
  log.point({yungong:saved});
  const data=from.B.exportText();assert.equal(data.count,1);
  const to=device();assert.equal((await to.B.importText(data.content)).added,1);
  const resumed=to.F.create(L.title,L.tasks);assert.equal(to.F.history()[0].courseId,'yungong');
  assert.deepEqual(JSON.parse(JSON.stringify(resumed.checkpoint.yungong)),saved);
  assert.equal(resumed.records[0].helps[0].phase,'首答后');assert.equal(resumed.records[0].first.helped,false);assert.equal(resumed.records[1].first.helped,true);
  resumed.reopen(0);resumed.submit(0,'回听后的新想法',null,'这次跟高处的旋律');resumed.finish(0);
  assert.equal(resumed.records[0].first.explanation,'我先跟着低处的声音');assert.equal(resumed.records[0].attempts.length,2);assert.equal(resumed.records[0].first.correct,null);
  assert.equal(to.B.exportText().count,1);assert.deepEqual(JSON.parse(resumed.records[1].draft.$mixFirst).mix,mix);
});
