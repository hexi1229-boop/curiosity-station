'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const L=require('../springautumn-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('four evidence stations state both support and boundary without turning one artifact into the whole era',()=>{
  assert.equal(L.stations.length,4);
  assert.equal(new Set(L.stations.map(item=>item.id)).size,4);
  for(const item of L.stations){
    assert.ok(item.fact.length>20);assert.ok(item.can.length>15);assert.ok(item.cannot.length>15);
  }
  assert.match(L.stations.find(item=>item.id==='iron-mould').cannot,/不能单独证明/);
  assert.match(L.stations.find(item=>item.id==='fangsheng').time,/前344年/);
  assert.match(L.stations.find(item=>item.id==='dujiangyan').time,/前256年/);
  assert.match(L.stations.find(item=>item.id==='thinkers').cannot,/不能证明/);
});

test('opening and network grading reject war-only or tool-only history explanations',()=>{
  const opening={stationViews:L.stations.map(item=>item.id),reviewChoice:'multi'};
  assert.deepEqual(L.gradeOpening(opening),{stations:true,claim:true});
  assert.equal(L.gradeOpening({...opening,reviewChoice:'war'}).claim,false);
  const network={
    edges:[
      {from:'competition',to:'reform',relation:'pressure'},
      {from:'reform',to:'water',relation:'organize'},
      {from:'problems',to:'thinkers',relation:'response'}
    ],
    boundaryChoice:'one-pressure'
  };
  assert.deepEqual(L.gradeNetwork(network),{validity:true,edges:true,categories:true,boundary:true});
  assert.equal(L.gradeNetwork({...network,boundaryChoice:'only-engine'}).boundary,false);
  assert.equal(L.gradeNetwork({edges:[...network.edges.slice(0,2),{from:'competition',to:'water',relation:'pressure'}],boundaryChoice:'one-pressure'}).edges,false);
  assert.equal(L.gradeNetwork({edges:[...network.edges,{from:'competition',to:'water',relation:'pressure'}],boundaryChoice:'one-pressure'}).validity,false);
});

test('Qin transfer requires evidence on both sides of a century-long accumulation',()=>{
  assert.deepEqual(L.transferFacts.map(item=>item.time),['前4世纪中期','前344年','约前256年','前221年']);
  const correct={reviewTransferClaim:'accumulated',reviewTransferEvidence:['measure','water'],gapChoice:'123',transferRelation:'accumulate'};
  assert.deepEqual(L.gradeTransfer(correct),{claim:true,evidence:true,gap:true,relation:true});
  assert.equal(L.gradeTransfer({...correct,reviewTransferEvidence:['reform','measure']}).evidence,false);
  assert.equal(L.gradeTransfer({...correct,gapChoice:'23'}).gap,false);
  assert.equal(L.gradeTransfer({...correct,reviewTransferClaim:'instant'}).claim,false);
});

test('state sanitizer whitelists evidence and edges and rejects forged completion',()=>{
  const state=L.sanitizeState({
    openingChoice:'multi',openingEvidence:['tools','tools','unsafe'],openingExplanation:'x'.repeat(1000),openingSaved:true,
    stationViews:['iron-mould','unsafe'],reviewChoice:'unsafe',
    edges:[{from:'competition',to:'reform',relation:'pressure'},{from:'competition',to:'reform',relation:'pressure'},{from:'unsafe',to:'water',relation:'pressure'}],
    boundaryChoice:'one-pressure',transferEvidence:['measure','unsafe','water'],reviewTransferEvidence:['measure','water','unity'],hintLevel:99,
    completed:true,mastered:true,score:100
  });
  assert.deepEqual(state.openingEvidence,['tools']);assert.equal(state.openingExplanation.length,900);
  assert.deepEqual(state.stationViews,['iron-mould']);assert.equal(state.reviewChoice,'');
  assert.deepEqual(state.edges,[{from:'competition',to:'reform',relation:'pressure'}]);
  assert.deepEqual(state.transferEvidence,['measure','water']);assert.deepEqual(state.reviewTransferEvidence,['measure','water']);assert.equal(state.hintLevel,2);
  assert.equal('completed' in state,false);assert.equal('mastered' in state,false);assert.equal('score' in state,false);
});

test('page preserves cold answers, hides sources until completion and includes accessible motion boundaries',()=>{
  const html=read('springautumn.html'),js=read('springautumn.js'),css=read('springautumn.css');
  assert.match(html,/id="springautumn-sources" hidden/);
  assert.match(html,/教育部：义务教育历史课程标准/);
  assert.match(html,/中国国家博物馆：双镰铁范/);
  assert.match(html,/上海博物馆：商鞅方升/);
  assert.match(html,/历史 H08/);
  assert.match(js,/log\.submit\(0,'首答：'[\s\S]*?,null,state\.openingExplanation\)/);
  assert.match(js,/log\.submit\(2,'迁移首答：'[\s\S]*?,null,state\.transferExplanation\)/);
  assert.match(js,/requestAnimationFrame\(\(\)=>host\.querySelector\('\[data-station=/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(js,/开放解释未按关键词自动评分/);
  assert.doesNotMatch(js,/已经掌握全部|满分|掌握所有/);
});

test('a new learning session binds to springautumn and keeps open readings unscored',()=>{
  const prefix='curiosity-station:learning:v1:';
  const store=new Map();
  const localStorage={get length(){return store.size;},key:index=>[...store.keys()][index]??null,getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
  const window={localStorage};
  vm.runInNewContext(read('learning-feedback.js'),{window,console});
  const F=window.LearningFeedback;
  assert.equal(F.courses.filter(item=>item[0]===L.id).length,1);
  const log=F.create(L.title,L.tasks);
  log.submit(0,'first claim',null,'first explanation');
  const session=F.history()[0];
  assert.equal(session.courseId,'springautumn');assert.equal(session.records.length,3);
  assert.equal(session.records[0].first.correct,null);assert.equal(session.records[0].first.explanation,'first explanation');
});

test('catalog, records and cache register H08 once in the intended history sequence',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),sw=read('sw.js');
  assert.equal((catalog.match(/id:'springautumn'/g)||[]).length,1);
  assert.match(catalog,/'zhou-network','springautumn','chentaiqiu'/);
  assert.equal((feedback.match(/\['springautumn'/g)||[]).length,1);
  assert.match(feedback,/findIndex\(course=>course\[0\]==='zhou-network'\)\+1/);
  assert.match(sw,/const CACHE = `\$\{CACHE_PREFIX\}v174`/);
});
