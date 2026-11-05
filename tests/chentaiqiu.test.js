'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../chentaiqiu-content.js');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('official main text keeps the decisive wording and punctuation',()=>{
  assert.equal(L.text,'陈太丘与友期行，期日中。过中不至，太丘舍去，去后乃至。元方时年七岁，门外戏。客问元方：“尊君在不？”答曰：“待君久不至，已去。”友人便怒曰：“非人哉！与人期行，相委而去。”元方曰：“君与家君期日中。日中不至，则是无信；对子骂父，则是无礼。”友人惭，下车引之。元方入门不顾。');
  assert.match(L.text,/期日中。过中不至/);
  assert.match(L.text,/友人便怒曰/);
  assert.match(L.text,/友人惭，下车引之。元方入门不顾。$/);
  assert.match(L.text,/尊君在不？/);
});

test('stable annotation ids are unique and every note points to source text',()=>{
  const all=[...L.annotations,...L.transfer.annotations];
  assert.equal(new Set(all.map(item=>item.id)).size,all.length);
  for(const item of L.annotations)assert.notEqual(L.text.indexOf(item.text),-1,item.id);
  for(const item of L.transfer.annotations)assert.notEqual(L.transfer.text.indexOf(item.text),-1,item.id);
  assert.ok(L.annotations.some(item=>item.kind==='教材注释'));
  assert.ok(L.annotations.some(item=>item.kind==='本站解释'));
  assert.doesNotMatch(L.transfer.choices.find(item=>item.id==='commitment').text,/迟疑|谨慎/);
  assert.match(L.transfer.choices.find(item=>item.id==='commitment').text,/起初拒绝/);
  assert.equal(L.annotations.find(item=>item.id==='main-chen').kind,'教材注释＋本站解释');
  assert.equal(L.annotations.find(item=>item.id==='main-nai').kind,'教材注释＋本站解释');
  assert.equal(L.transfer.annotations.find(item=>item.id==='transfer-she').kind,'国图注释＋本站解释');
});

test('timeline accepts only the exact non-duplicated chronology',()=>{
  const correct=['promise','late','leave','arrive'];
  assert.equal(L.gradeTimeline(correct).correct,true);
  assert.equal(L.gradeTimeline(['late','promise','leave','arrive']).correct,false);
  assert.equal(L.gradeTimeline(['promise','late','leave','leave']).correct,false);
  assert.equal(L.gradeTimeline([...correct,'unsafe']).correct,false);
});

test('address and claim graders keep speakers and the two arguments separate',()=>{
  assert.equal(L.gradeAddresses({zunjun:'your-father',jiajun:'my-father',jun:'you'}).correct,true);
  assert.equal(L.gradeAddresses({zunjun:'my-father',jiajun:'your-father',jun:'you'}).correct,false);
  assert.equal(L.gradeAddresses({zunjun:'your-father',jiajun:'my-father',jun:'you',unsafe:'you'}).correct,false);
  assert.equal(L.gradeClaim(['insult-father']).correct,true);
  assert.equal(L.gradeClaim(['late-noon']).correct,false);
  assert.equal(L.gradeClaim(['insult-father','late-noon']).correct,false);
});

test('transfer requires a whole-text conclusion and both contrasting actions',()=>{
  const correct={choice:'commitment',evidence:['wang-abandon','hua-keep']};
  assert.equal(L.gradeTransfer(correct).correct,true);
  assert.equal(L.gradeTransfer({...correct,evidence:['hua-keep','wang-abandon']}).correct,true);
  assert.equal(L.gradeTransfer({...correct,choice:'cold'}).correct,false);
  assert.equal(L.gradeTransfer({...correct,evidence:['hua-hesitate','hua-keep']}).correct,false);
  assert.equal(L.gradeTransfer({...correct,solved:true,evidence:[]}).correct,false);
});

test('draft sanitizer drops forged completion and unknown values',()=>{
  const state=L.sanitizeDraft({
    $readConfirmed:true,$seenAnnotations:['main-gu','unsafe','main-gu'],
    initialChoice:'both',initialEvidence:'ignore',$initialSaved:true,
    timelineOrder:['promise','unsafe','promise','late'],timelineAttempted:true,
    addressAnswers:{zunjun:'your-father',unsafe:'you',jun:'unsafe'},
    claimEvidence:['insult-father','unsafe'],transferChoice:'commitment',
    transferEvidence:['wang-abandon','unsafe','hua-keep'],$transferFirst:{choice:'cold',evidence:['hua-hesitate','unsafe']},
    transferHintLevel:99,finalChoice:'support',finalEvidence:['ignore','unsafe'],
    quote:'q'.repeat(500),note:'n'.repeat(900),solved:true,score:100
  });
  assert.deepEqual(state.$seenAnnotations,['main-gu']);
  assert.deepEqual(state.timelineOrder,['promise','late']);
  assert.deepEqual(state.addressAnswers,{zunjun:'your-father'});
  assert.deepEqual(state.claimEvidence,['insult-father']);
  assert.deepEqual(state.transferEvidence,['wang-abandon','hua-keep']);
  assert.deepEqual(state.$transferFirst,{choice:'cold',evidence:['hua-hesitate'],hintLevel:0});
  assert.equal(state.transferHintLevel,L.transfer.hints.length);
  assert.equal(state.quote.length,400);assert.equal(state.note.length,800);
  assert.equal('solved' in state,false);assert.equal('score' in state,false);
});

test('page keeps full text, source boundaries and one readalong record',()=>{
  const html=read('chentaiqiu.html'),feedback=read('learning-feedback.js'),catalog=read('catalog.js');
  assert.match(html,/id="article-text"/);assert.match(html,/id="transfer-text"/);
  assert.match(html,/人教社官方全文与诵读页/);assert.match(html,/中国国家图书馆/);
  assert.match(html,/教材注释、本站解释和国图迁移注释分层标明|教材注释.*本站解释/s);
  assert.match(feedback,/readalongs=\{[^}]*chentaiqiu:1/);
  assert.equal((feedback.match(/\['chentaiqiu'/g)||[]).length,1);
  assert.match(catalog,/id:'chentaiqiu'.*format:'readalong',tasks:1/s);
});

test('interactive shell derives progress from records and never trusts solved flags',()=>{
  const js=read('chentaiqiu.js');
  assert.match(js,/const hasAttempt=prefix=>record\.attempts\.some\(attempt=>attempt\.answer\.startsWith\(prefix\)\)/);
  assert.match(js,/state\.timelineAttempted=state\.timelineAttempted&&hasAttempt\('时间线：'\)/);
  assert.match(js,/state\.addressAttempted=state\.addressAttempted&&hasAttempt\('称谓：'\)/);
  assert.match(js,/state\.claimAttempted=state\.claimAttempted&&hasAttempt\('“无礼”的证据：'\)/);
  assert.match(js,/state\.transferAttempted=state\.transferAttempted&&hasAttempt\('迁移判断：'\)/);
  assert.doesNotMatch(js,/solved|passed|\{\.\.\.record\.draft/);
  assert.match(js,/if\(!state\.timelineAttempted\|\|!L\.gradeTimeline/);
  assert.match(js,/if\(!state\.addressAttempted\|\|!L\.gradeAddresses/);
  assert.match(js,/if\(!state\.claimAttempted\|\|!L\.gradeClaim/);
  assert.match(js,/function invalidateFrom\(stage\)/);
  assert.match(js,/order\.slice\(start\)\.forEach\(name=>\{state\[name\+'Attempted'\]=false;\}\)/);
  assert.match(js,/function allStagesPassed\(\)/);
  assert.match(js,/state\.timelineAttempted&&L\.gradeTimeline[\s\S]*state\.addressAttempted&&L\.gradeAddresses[\s\S]*state\.claimAttempted&&L\.gradeClaim[\s\S]*state\.transferAttempted&&L\.gradeTransfer/);
  assert.match(js,/const locked=!allStagesPassed\(\)/);
  assert.match(js,/\$\('kept-quote'\)\.readOnly=record\.done;\$\('reading-note'\)\.readOnly=record\.done/);
  assert.match(js,/log\.submit\(0,'迁移判断/);
  assert.match(js,/if\(!result\.correct\)log\.help\(0,'自动反馈/);
  assert.match(js,/log\.finish\(0,'已完成一次有证据的共读回看；不等于长期掌握'/);
  assert.match(js,/log\.finish\(0,[\s\S]*renderTimeline\(\);renderAddresses\(\);renderClaim\(\);renderTransfer\(\);renderFinal\(\)/);
});

test('readalong report exposes transfer first attempt, hint count and revision',()=>{
  const feedback=read('learning-feedback.js');
  assert.match(feedback,/迁移首次：/);assert.match(feedback,/提交前已打开/);assert.match(feedback,/迁移最近：/);
  assert.match(feedback,/r\.draft\?\.\$transferFirst/);assert.match(feedback,/r\.draft\.\$transferLast/);
});

