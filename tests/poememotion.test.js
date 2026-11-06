'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const L=require('../poememotion-content.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('both poems are complete and aligned to the intended contrast',()=>{
  assert.deepEqual(L.main.lines,[
    '枯藤老树昏鸦，','小桥流水人家，','古道西风瘦马。','夕阳西下，','断肠人在天涯。'
  ]);
  assert.deepEqual(L.transfer.lines,[
    '客路青山外，行舟绿水前。','潮平两岸阔，风正一帆悬。','海日生残夜，江春入旧年。','乡书何处达？归雁洛阳边。'
  ]);
  assert.equal(L.tasks.length,3);
  assert.ok(L.main.annotations.some(item=>item.text==='人家'&&item.note.includes('本身')));
  assert.ok(L.transfer.annotations.some(item=>item.text==='残夜'));
});

test('guided and withdrawal checks distinguish atmosphere from a supported speaker conclusion',()=>{
  assert.deepEqual(L.gradeGuided({lensViews:['hidden','restored'],relationChoice:'contrast'}),{views:true,relation:true});
  assert.deepEqual(L.gradeGuided({lensViews:['restored'],relationChoice:'all-sad'}),{views:false,relation:false});
  assert.deepEqual(L.gradeWhatIf({whatIfChoice:'cannot',whatIfReason:'no-speaker'}),{boundary:true,reason:true});
  assert.equal(L.gradeWhatIf({whatIfChoice:'can',whatIfReason:'sad-code'}).boundary,false);
});

test('transfer requires one expansive or renewing line and one homesick line',()=>{
  const correct={reviewClaim:'partly',reviewEvidence:['wide','letter'],reviewRelation:'coexist'};
  assert.deepEqual(L.gradeTransfer(correct),{claim:true,evidence:true,relation:true});
  assert.equal(L.gradeTransfer({...correct,reviewEvidence:['route','letter']}).evidence,false);
  assert.equal(L.gradeTransfer({...correct,reviewEvidence:['wide','renewal']}).evidence,false);
  assert.equal(L.gradeTransfer({...correct,reviewClaim:'fully'}).claim,false);
});

test('state sanitizer keeps bounded whitelisted work and rejects forged mastery',()=>{
  const state=L.sanitizeState({
    coldTone:'unsafe',coldEvidence:['home','unsafe','home'],coldExplanation:'x'.repeat(1200),coldSaved:true,
    annotationViews:['main-renjia','unsafe'],annotationUses:['0:main-renjia','1:main-renjia','0:unsafe','bad'],lensViews:['hidden','unsafe'],lensMode:'unsafe',relationChoice:'contrast',guidedAttempted:true,
    whatIfChoice:'cannot',whatIfReason:'unsafe',transferClaim:'partly',transferEvidence:['wide','letter','unsafe'],hintLevel:99,
    reviewClaim:'partly',reviewEvidence:['wide','letter','renewal'],reviewRelation:'coexist',reviewExplanation:'r'.repeat(1200),
    mastered:true,score:100,completed:true
  });
  assert.equal(state.coldTone,'');assert.deepEqual(state.coldEvidence,['home']);assert.equal(state.coldExplanation.length,900);
  assert.deepEqual(state.annotationViews,['main-renjia']);assert.deepEqual(state.annotationUses,['0:main-renjia','1:main-renjia']);assert.deepEqual(state.lensViews,['hidden']);assert.equal(state.lensMode,'hidden');
  assert.equal(state.whatIfReason,'');assert.deepEqual(state.transferEvidence,['wide','letter']);assert.equal(state.hintLevel,2);
  assert.deepEqual(state.reviewEvidence,['wide','letter']);assert.equal(state.reviewExplanation.length,900);
  assert.equal('mastered' in state,false);assert.equal('score' in state,false);assert.equal('completed' in state,false);
});

test('course is uniquely registered, recommended after English reading and released offline',()=>{
  const catalog=read('catalog.js'),feedback=read('learning-feedback.js'),html=read('poememotion.html'),js=read('poememotion.js'),sw=read('sw.js');
  assert.match(catalog,/id:'poememotion'.*subject:'语文'.*tasks:3.*fresh:true/s);
  assert.match(catalog,/recommendedOrder=\[\s*'repair',\s*'readenglish','poememotion','liketerms'/s);
  assert.equal((catalog.match(/id:'poememotion'/g)||[]).length,1);
  assert.equal((feedback.match(/\['poememotion'/g)||[]).length,1);
  assert.match(feedback,/\['poememotion','景物都看懂了，诗人的心情从哪里来？','poememotion\.html'\]/);
  assert.match(html,/id="poememotion-sources" hidden/);
  assert.match(js,/log\.submit\(0,'初读：'[\s\S]*?,null,state\.coldExplanation\)/);
  assert.match(js,/log\.submit\(2,'迁移首答：'[\s\S]*?,null,state\.transferExplanation\)/);
  assert.match(js,/首答前未显示词句注释/);
  assert.match(js,/const useKey=index\+':\'\+item\.id/);
  assert.match(js,/class="poem-tail" hidden aria-hidden="true"/);
  assert.match(js,/class="scene-bridge"'\+\(hidden\?' hidden aria-hidden="true"/);
  assert.match(js,/requestAnimationFrame\(\(\)=>host\.querySelector\('\[data-lens=/);
  assert.match(sw,/CACHE_PREFIX\}v167/);
});

test('a new learning session binds to poememotion and keeps open readings unscored',()=>{
  const prefix='curiosity-station:learning:v1:';
  const store=new Map();
  const localStorage={get length(){return store.size;},key:index=>[...store.keys()][index]??null,getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
  const window={localStorage};
  vm.runInNewContext(read('learning-feedback.js'),{window,console});
  const feedback=window.LearningFeedback,log=feedback.create(L.title,L.tasks);
  log.submit(0,'first reading',null,'first relation');log.finish(0,'saved');
  const session=feedback.history()[0];
  assert.equal(session.courseId,'poememotion');assert.equal(session.records.length,3);
  assert.equal(session.records[0].first.correct,null);assert.equal(session.records[0].first.explanation,'first relation');
});
