'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const L=require('../repair-content.js'),round=L.rounds.find(r=>r.id==='repair-direction-01');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('north/east baselines give different 30 degree routes but complementary angles give the same route',()=>{
 const north=L.directionModel('N',30),east=L.directionModel('E',30);
 close(north.dx,.5);close(east.dx,Math.sqrt(3)/2);
 assert.notEqual(north.bearing,east.bearing);
 for(let angle=10;angle<=80;angle+=5){
  const a=L.directionModel('N',angle),b=L.directionModel('E',90-angle);
  close(a.dx,b.dx);close(a.dy,b.dy);close(Math.hypot(a.dx,a.dy),1);
 }
 close(L.directionModel('N',45).dx,L.directionModel('E',45).dx);
 assert.throws(()=>L.directionModel('S',30));assert.throws(()=>L.directionModel('N',NaN));
});
test('return route is antiparallel, keeping the same segment length and changing both cardinal directions',()=>{
 for(const base of ['N','E'])for(let angle=10;angle<=80;angle+=5){
  const forward=L.directionModel(base,angle),back=L.directionModel(base,angle,true),r=back.reverseBearing*Math.PI/180;
  close(Math.sin(r),-forward.dx);close(-Math.cos(r),-forward.dy);
  close(Math.hypot(Math.sin(r)*500,Math.cos(r)*500),500);
  assert.equal(back.label,base==='N'?'南偏西':'西偏南');
 }
 assert.match(L.directionDiagram('N',30,true),/B到P：南偏西30°/);
 assert.match(L.directionDiagram('E',30,true),/B到P：西偏南30°/);
});
test('transfer tasks distinguish reading a diagram, equivalent bearings, route reversal and scale',()=>{
 const [read,equivalent,back,scale]=round.questions;
 assert.equal(L.grade(read,1),true);assert.equal(L.grade(read,0),false);
 assert.match(read.diagram,/雷达站O/);assert.match(read.diagram,/>25°</);
 assert.equal(L.grade(equivalent,String(90-40)),true);assert.equal(L.grade(equivalent,'40'),false);
 assert.equal(L.grade(back,'南偏西35°300米到S；北偏西20°600米到R'),null);
 assert.equal(L.grade(scale,String(600/200*1.5)),true);assert.equal(L.grade(scale,'3'),false);
 assert.ok(read.reasonRequired&&scale.reasonRequired);
 assert.equal(new Set(round.questions.map(q=>q.id)).size,4);
 assert.ok(round.questions.every(q=>q.sources.includes('direction')));
 assert.equal(L.rounds.find(r=>r.id==='repair').questions.length,5);
 assert.equal(L.rounds.find(r=>r.id==='repair-math-01').questions.length,6);
});
test('new independent record survives refresh and export without overwriting first answers or old courses',()=>{
 const data=new Map(),localStorage={get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const window={localStorage,crypto:webcrypto},context=vm.createContext({window,Blob,TextEncoder});
 for(const file of ['learning-feedback.js','learning-backup.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
 const F=window.LearningFeedback,old=F.create(L.rounds[0].title,L.rounds[0].questions);old.submit(0,'5/3',true,'恢复原图');old.finish(0);
 let log=F.create(round.title,round.questions);log.help(0,'短提示');log.submit(0,'A',false,'从北起算');log.finish(0);log.point({directionModel:{base:'E',angle:30,back:true}});
 log=F.create(round.title,round.questions);assert.equal(log.checkpoint.directionModel.back,true);
 log.reopen(0);log.help(0,'已看参考');log.submit(0,'B',null,'从东起算');log.finish(0);
 assert.equal(log.records[0].first.answer,'A');assert.equal(log.records[0].first.helped,true);assert.equal(log.records[0].attempts.length,2);
 const exported=JSON.parse(window.LearningBackup.exportText().content);
 assert.equal(exported.sessions.length,2);
 assert.equal(exported.sessions.find(s=>s.courseId==='repair').records[0].first.answer,'5/3');
 assert.equal(exported.sessions.find(s=>s.courseId==='repair-direction-01').records[0].first.explanation,'从北起算');
 const catalog=fs.readFileSync(path.join(__dirname,'../catalog.js'),'utf8');assert.match(catalog,/sessionIds:\[[^\]]*'repair-direction-01'/);
});
