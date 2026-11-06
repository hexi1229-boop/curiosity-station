'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const L=require('../music-content.js');

function device(){
  const data=new Map();
  const localStorage={get length(){return data.size;},key:index=>[...data.keys()][index]??null,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
  const window={localStorage,crypto:webcrypto};
  const context=vm.createContext({window,Blob,TextEncoder});
  for(const file of ['learning-feedback.js','learning-backup.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  return {F:window.LearningFeedback,B:window.LearningBackup,localStorage};
}
const plain=value=>JSON.parse(JSON.stringify(value));

test('music evidence survives real local-save, export, fresh-device import and lesson resume',async()=>{
  const from=device(),log=from.F.create(L.title,L.tasks);
  const firstTap={taps:[-.04,.71,1.42,2.17,2.86,3.57,4.26,5.01],beatSeconds:60/84};
  firstTap.summary=L.analyzeTaps(firstTap.taps,{startTime:0,beatSeconds:firstTap.beatSeconds,count:8});
  const dawn={bpm:98,bass:true,chords:false,pulse:true};
  const night={bpm:68,bass:true,chords:true,pulse:false};
  log.submit(0,'A/B 比较选项：我还拿不准',null,'B 好像走得更快');
  log.help(0,'听辨后查看速度对照与旋律图');
  log.submit(0,'A/B 比较选项：整体速度变了',null,'每分钟的拍数更多');
  log.finish(0,'个人听感不判分');
  log.draft(0,{$layerFirst:'layers'});
  log.submit(1,'首轮轻点 8 次',null,'记录原始拍点');
  log.draft(1,{$tapFirst:JSON.stringify(firstTap),$tapLatest:JSON.stringify(firstTap),$patternFirst:['q','e','r','q']});
  log.finish(1,'一次跟拍证据');
  log.draft(2,{$dawnFirst:JSON.stringify({...dawn,reason:'有往前走的感觉'}),$dawnLatest:JSON.stringify({...dawn,reason:'有往前走的感觉'}),$dawn:JSON.stringify(dawn),$night:JSON.stringify(night)});
  log.note(2,'等待版：拿掉拍点');
  log.submit(2,'清晨出发和星空下等待两个版本',null,'等待版留出更多空间');
  log.finish(2,'两个版本已保存');
  const checkpoint={tab:2,revealed:true,heard:['A','B'],listeningChoice:'tempo',listeningReason:'每分钟的拍数更多',rhythmAttempts:[firstTap],arrangement:dawn,dawn,dawnReason:'有往前走的感觉',transferArrangement:night,transferReason:'等一个信号',mixStage:'night',mixPlayed:{dawn:true,night:true},mixFinished:true,pattern:['q','e','r','q'],patternFirst:['q','e','r','q'],trace:['等待版：拿掉拍点']};
  log.point({music:checkpoint});

  const before=plain(from.F.history()[0]);
  assert.equal(before.courseId,'music');
  const exported=from.B.exportText();
  assert.equal(exported.count,1);
  const to=device(),result=await to.B.importText(exported.content);
  assert.equal(result.added,1);assert.equal(result.failed,0);
  const resumed=to.F.create(L.title,L.tasks);
  assert.deepEqual(plain(resumed.checkpoint.music),checkpoint);
  assert.deepEqual(plain(resumed.records),before.records);
  assert.equal(resumed.records[0].first.answer,'A/B 比较选项：我还拿不准');
  assert.equal(resumed.records[0].attempts.length,2);
  assert.equal(resumed.records[0].attempts[1].helped,true);
  assert.equal(resumed.records[0].first.correct,null);
  assert.deepEqual(JSON.parse(resumed.records[1].draft.$tapFirst),firstTap);
  assert.deepEqual(JSON.parse(resumed.records[2].draft.$night),night);
  assert.equal(to.B.exportText().count,1);
  assert.equal((await to.B.importText(exported.content)).skipped,1);

  // A later visit can revise a finished work without replacing the first one.
  resumed.reopen(2);resumed.submit(2,'等待版再减掉和弦',null,'只让旋律留下');resumed.finish(2);
  assert.deepEqual(plain(to.F.history()[0].records[2].first),before.records[2].first);
  assert.equal(to.F.history()[0].records[2].attempts.length,2);
  assert.equal(to.B.exportText().count,1);
});

test('music draft snapshots use backup-compatible strings while checkpoint can preserve nested structures',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../music.js'),'utf8');
  for(const key of ['$tapFirst','$tapLatest','$dawnLatest','$dawn','$night'])assert.ok(source.includes(key+':JSON.stringify('),key+' must not put a nested object in record.draft');
  assert.match(source,/\$dawnFirst:log\.records\[2\]\.draft\.\$dawnFirst\|\|JSON\.stringify\(/);
  const {F,B}=device(),log=F.create(L.title,L.tasks);
  log.point({music:{rhythmAttempts:[{taps:[0,.7],summary:{matched:2}}],mixPlayed:{dawn:true,night:false}}});
  assert.equal(B.exportText().count,1);
  // The shared backup format deliberately rejects nested draft values.
  log.draft(1,{$tapFirst:{taps:[0,.7]}});
  assert.throws(()=>B.exportText(),/未能完整读取本机记录/);
});
