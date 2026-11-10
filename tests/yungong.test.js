'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {webcrypto}=require('node:crypto'),L=require('../yungong-content.js');
function device(){const data=new Map(),localStorage={get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};const window={localStorage,crypto:webcrypto},ctx=vm.createContext({window,Blob,TextEncoder});for(const name of ['learning-feedback.js','learning-backup.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),ctx);return {F:window.LearningFeedback,B:window.LearningBackup};}
const plain=v=>JSON.parse(JSON.stringify(v));
test('score excerpts stay within selected recording and agree with independently checked phrase attacks',()=>{
  assert.equal(L.stages.length,4);
  for(const [name,c] of Object.entries(L.clips)){assert.ok(c.start>=0&&c.end>c.start&&c.end<L.tracks.piano.duration,name);assert.equal(L.position(c.start+.001).bar,c.from);assert.ok(fs.existsSync(path.join(__dirname,'..',L.tracks.piano.src)));}
  // Audio/spectrum audit: E5/E6 attack around 48.59 s; F#5/F#6 around 98.675 s.
  assert.ok(Math.abs(L.clips.before.start+60/115-48.59)<.025);
  assert.ok(Math.abs(L.clips.after.start+60/115-98.675)<.025);
  assert.equal(L.regionAction(L.clips.held.end-.01,L.clips.held,false),'continue');
  assert.equal(L.regionAction(L.clips.held.end,L.clips.held,false),'stop');
  assert.equal(L.regionAction(L.clips.held.end,L.clips.held,true),'repeat');
  assert.equal(L.regionAction(172,null,true),'continue');
});
test('new score-led course keeps old mix evidence separate, including after export/import',async()=>{
  const from=device(),old=from.F.create(L.legacyTitle,['首听','原创拆层','回听']);old.submit(1,'旧版编配快照',null,'原先解释');old.finish(1);old.point({yungong:{mix:{lead:80,motor:20,bed:40}}});
  const log=from.F.create(L.title,L.tasks);log.submit(0,'整架钢琴还没有发声',null,'我只注意上面的休止');log.help(0,'查看谱面与讲解');log.finish(0);
  log.reopen(0);log.submit(0,'伴奏已经在走',null,'下面仍然有八分音符');log.finish(0);
  log.help(1,'未作答，直接看谱');log.finish(1,'只看过');log.point({yungong1052381:L.state({tab:2,choices:[1,null,0,null],notes:['原先解释','','节奏保留'],opened:[true,true,false,false]})});
  assert.equal(from.F.history().length,2);assert.equal(log.records[0].first.explanation,'我只注意上面的休止');assert.equal(log.records[0].first.helped,false);assert.equal(log.records[0].attempts[1].helped,true);assert.equal(log.records[1].first,null);
  const to=device();assert.equal((await to.B.importText(from.B.exportText().content)).added,2);const resumed=to.F.create(L.title,L.tasks);
  assert.equal(resumed.records[0].attempts.length,2);assert.deepEqual(plain(resumed.checkpoint),plain(log.checkpoint));assert.equal(to.F.history().filter(s=>s.courseId==='yungong').length,2);
  const oldAgain=to.F.create(L.legacyTitle,['首听','原创拆层','回听']);assert.equal(oldAgain.records[1].first.answer,'旧版编配快照');assert.equal(oldAgain.checkpoint.yungong.mix.motor,20);
  const invalid=JSON.parse(from.B.exportText().content);invalid.sessions[0].title='未登记的同名版本';await assert.rejects(()=>to.B.importText(JSON.stringify(invalid)),/未导入/);
});
test('catalog does not label the new listening lesson completed from old mix records',()=>{
  const catalog=require('../catalog.js'),course=catalog.items.find(c=>c.id==='yungong');
  const old={courseId:'yungong',title:L.legacyTitle,updatedAt:1,records:[{done:true},{done:true},{done:true}]};
  const current={courseId:'yungong',title:L.title,updatedAt:2,records:[{done:true},{done:false},{done:false},{done:false}]};
  assert.deepEqual(catalog.sessionsFor(course,catalog.latest([old])),[]);
  assert.deepEqual(catalog.sessionsFor(course,catalog.latest([old,current])),[current]);
});
test('malformed stored state does not invent observations or force completion',()=>{
  const s=L.state({tab:100,track:'x',choices:[500,-1,'0'],notes:['x'.repeat(2000)],opened:[1,'yes',true],loop:'false'});
  assert.equal(s.tab,0);assert.equal(s.track,'piano');assert.deepEqual(s.choices,[null,null,null,null]);assert.equal(s.notes[0].length,900);assert.deepEqual(s.opened,[false,false,true,false]);assert.equal(s.loop,false);
});
