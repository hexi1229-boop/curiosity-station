'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const lesson=require('../repair-content.js');
const round=lesson.rounds.find(item=>item.id==='repair-math-transfer-01');

test('换情境迁移测评使用独立稳定记录并保留旧测评',()=>{
 assert.ok(round);
 assert.equal(round.key,'math-transfer-01');
 assert.equal(round.route,'repair.html?round=math-transfer-01&exam=1');
 assert.match(round.title,/^换情境迁移测评/);
 assert.equal(round.time,'约10–15分钟');
 assert.match(round.description,/立即完成只说明换情境迁移/);
 assert.equal(round.studyTabLabel,'相关基础');
 assert.equal(round.questions.length,4);
 assert.equal(new Set(round.questions.map(question=>question.id)).size,4);
 assert.ok(round.questions.every(question=>question.reasonRequired));
 const previous=lesson.rounds.find(item=>item.id==='repair-math-01');
 assert.equal(previous.route,'repair.html?round=math-01&exam=1');
 assert.equal(previous.questions.length,6);
});

test('四题数据、答案与诊断目标相互独立且自洽',()=>{
 const [model,eliminate,reciprocal,changingWhole]=round.questions;
 assert.equal(model.kind,'open');
 assert.equal(2*2+3*1,7); // 以1/20为一份。
 assert.equal(5*2+4*1,14);
 assert.equal(lesson.grade(model,'2x+3y=7/20; 5x+4y=7/10'),null);

 assert.equal(eliminate.kind,'number');
 assert.doesNotMatch(eliminate.title+eliminate.task,/消元|相消|复制|数量相同/);
 assert.equal(2*(3*5+2*7),58);
 assert.equal(6*5+5*7,65);
 assert.equal(lesson.grade(eliminate,'7'),true);
 assert.equal(lesson.grade(eliminate,'5'),false);

 assert.equal(reciprocal.kind,'number');
 assert.doesNotMatch(reciprocal.title+reciprocal.task,/甲型[^。]*更多|慢[^。]*更多/);
 assert.equal(1/(1/20)-1/(1/12),8);
 assert.equal(lesson.grade(reciprocal,'8'),true);

 assert.equal(changingWhole.kind,'fraction');
 assert.equal(3*3,9);
 assert.equal(4*5,20);
 assert.equal(40*(9/20),18);
 assert.equal(lesson.grade(changingWhole,'9/20'),true);
 assert.equal(lesson.grade(changingWhole,'2/5'),false);
});

test('课程入口、学习记录和离线缓存注册保持一致',()=>{
 const feedback=fs.readFileSync(path.join(root,'learning-feedback.js'),'utf8');
 const catalog=fs.readFileSync(path.join(root,'catalog.js'),'utf8');
 const repair=fs.readFileSync(path.join(root,'repair.js'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.equal((feedback.match(/\['repair-math-transfer-01'/g)||[]).length,1);
 assert.match(feedback,/title\.includes\('测评'\)\?'题':'环节'/);
 assert.match(catalog,/sessionIds:\[[^\]]*'repair-math-transfer-01'/);
 assert.match(repair,/r\.questions\.length/);
 assert.doesNotMatch(repair,/'约15分钟 · 6题 · 先考后看'/);
 assert.match(sw,/curiosity-station-`|CACHE_PREFIX/);
 assert.match(sw,/v165/);
});
