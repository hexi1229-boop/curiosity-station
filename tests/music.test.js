'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const L=require('../music-content.js');

test('A/B changes tempo alone, and every arrangement retains the complete original motif',()=>{
  const a=L.buildEvents({...L.defaults,bpm:72}),b=L.buildEvents({...L.defaults,bpm:108});
  assert.deepEqual(a.events,b.events);assert.equal(a.totalBeats,16);assert.notEqual(a.bpm,b.bpm);
  for(const bass of [false,true])for(const chords of [false,true])for(const pulse of [false,true]){
    const score=L.buildEvents({bpm:84,bass,chords,pulse});
    assert.deepEqual(score.events.filter(note=>note.voice==='melody').map(({voice,velocity,...note})=>note),L.motif);
    assert.equal(score.events.every(note=>note.beat>=0&&note.beat+note.duration<=16),true);
  }
  const durations=L.motif.reduce((sum,note)=>sum+note.duration,0);assert.equal(durations,16);
});

test('tap evidence distinguishes systematic offset from variation, including early first taps',()=>{
  const perfect=Array.from({length:8},(_,i)=>10+i*.75);
  const shifted=L.analyzeTaps(perfect.map(time=>time-.2),{startTime:10,beatSeconds:.75});
  assert.equal(shifted.matched,8);assert.equal(shifted.offsetMs,-200);assert.equal(shifted.spreadMs,0);
  const uneven=L.analyzeTaps(perfect.map((time,i)=>time+(i%2?.15:-.15)),{startTime:10,beatSeconds:.75});
  assert.equal(uneven.matched,8);assert.equal(uneven.offsetMs,0);assert.equal(uneven.spreadMs,150);
  const missing=L.analyzeTaps([10,10.75,10.76,12.25,NaN],{startTime:10,beatSeconds:.75});
  assert.equal(missing.matched,3);assert.equal(missing.extra,1);assert.equal(missing.missed,5);
  assert.equal(L.analyzeTaps([]).offsetMs,null);assert.equal(L.analyzeTaps([0]).spreadMs,null);
});

test('saved evidence is bounded and descriptive; untrusted stored summaries are recomputed',()=>{
  const s=L.sanitizeState({heard:['A','A','B','C'],arrangement:{bpm:999,bass:true,chords:'yes'},rhythmAttempts:[{taps:[0,.75,1.5,Infinity],beatSeconds:.75,summary:{score:100,mastered:true}}],mastered:true,listeningReason:'x'.repeat(1000)});
  assert.deepEqual(s.heard,['A','B']);assert.equal(s.arrangement.bpm,120);assert.equal(s.arrangement.chords,false);assert.equal(s.listeningReason.length,900);
  assert.equal(s.rhythmAttempts[0].summary.matched,3);assert.equal('score' in s.rhythmAttempts[0].summary,false);assert.equal('mastered' in s,false);
  assert.deepEqual(L.sanitizeArrangement(null),L.defaults);
});

test('rhythm echo preserves a whole beat of rest and divides two eighths evenly',()=>{
  const score=L.patternScore(L.targetPattern,84);
  assert.equal(score.totalBeats,4);assert.deepEqual(score.events.map(note=>note.beat),[0,1,1.5,3]);
  assert.deepEqual(score.events.map(note=>note.duration),[1,.5,.5,1]);
  assert.equal(L.patternScore(['r','r','r','r']).events.length,0);
  assert.equal(L.patternScore(['e','e','e','e']).events.length,8);
});

function fakeAudio(resumePending=false){
  let now=0,id=0;const timers=new Map(),oscillators=[],contexts=[],gains=[];
  const param=()=>({value:0,events:[],setValueAtTime(value,time){this.events.push({value,time});},linearRampToValueAtTime(value,time){this.events.push({value,time});},exponentialRampToValueAtTime(value,time){this.events.push({value,time});},setTargetAtTime(value,time){this.events.push({value,time});}});
  class Context{
    constructor(){this.state=resumePending?'suspended':'running';this.destination={};contexts.push(this);}
    get currentTime(){return now;}
    createGain(){const node={gain:param(),connect(){},disconnect(){}};gains.push(node);return node;}
    createOscillator(){const osc={frequency:param(),started:false,stopped:false,connect(target){this.gainNode=target;},disconnect(){},start(time){this.started=time;},stop(time){if(time===undefined)this.stopped=true;else this.stopTime=time;}};oscillators.push(osc);return osc;}
    resume(){return new Promise(resolve=>{this.resumeNow=()=>{this.state='running';resolve();};if(!resumePending)this.resumeNow();});}
  }
  const window={AudioContext:Context,setTimeout(fn){const tid=++id;timers.set(tid,fn);return tid;},clearTimeout(tid){timers.delete(tid);}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../music-audio.js'),'utf8'),{window});
  return {audio:window.MusicAudio.create(),oscillators,contexts,gains,timers,tick(time){now=time;const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());}};
}

test('scheduled pitches match the motif, and even conservative full-mix overlap stays below digital clipping',async()=>{
  for(const bpm of [60,120]){
    const fake=fakeAudio(),score=L.buildEvents({bpm,bass:true,chords:true,pulse:true});
    fake.audio.setVolume(.8);await fake.audio.play(score);
    assert.equal(fake.oscillators.length,score.events.length);
    fake.oscillators.forEach((node,index)=>{
      assert.ok(Math.abs(node.frequency.value-440*2**((score.events[index].midi-69)/12))<1e-8);
    });
    // A sine/triangle oscillator is bounded by ±1. Sum each overlapping note's
    // peak envelope, including its already-silent stop tail, without phase cancellation.
    const times=fake.oscillators.flatMap(node=>[node.started,node.started+.00001,node.stopTime-.00001]);
    const bound=Math.max(...times.map(time=>fake.oscillators.reduce((sum,node)=>sum+(node.started<=time&&time<node.stopTime?Math.max(...node.gainNode.gain.events.map(event=>event.value)):0),0)))*.8;
    assert.ok(bound<.7,`conservative peak bound ${bound} must remain well below 1`);
    fake.audio.stop();
  }
});

test('stopping pending audio startup cannot create ghost playback',async()=>{
  const fake=fakeAudio(true);const pending=fake.audio.play(L.rhythmScore());fake.audio.stop();fake.contexts[0].resumeNow();
  assert.equal(await pending,null);assert.equal(fake.oscillators.length,0);assert.equal(fake.audio.playing,false);
});

test('a stalled audio resume gives a recoverable error instead of waiting forever',async()=>{
  const fake=fakeAudio(true);const pending=fake.audio.play(L.rhythmScore());fake.tick(3);
  await assert.rejects(pending,/声音未能启动/);assert.equal(fake.oscillators.length,0);assert.equal(fake.audio.playing,false);
});

test('transport counts in, finishes once and cancels every scheduled note on stop',async()=>{
  const fake=fakeAudio(),beats=[];let ended=0,stopped=0;
  const result=await fake.audio.play(L.rhythmScore(120),{countIn:4,onBeat:beat=>beats.push(beat),onEnd(){ended++;},onStop(){stopped++;}});
  assert.equal(result.startTime,2.1);assert.equal(fake.oscillators.length,12);
  fake.tick(.11);assert.equal(beats[0].beat,-4);fake.tick(2.1);assert.equal(beats.at(-1).beat,0);
  fake.tick(6.2);assert.equal(ended,1);assert.equal(fake.audio.playing,false);
  await fake.audio.play(L.buildEvents({bass:true,chords:true,pulse:true}),{onStop(){stopped++;}});
  fake.audio.stop();assert.equal(stopped,1);assert.equal(fake.timers.size,0);assert.equal(fake.oscillators.every(node=>node.stopped),true);
});

test('interrupted audio cancels the transport rather than leaving phantom recording time',async()=>{
  const fake=fakeAudio();let reason='';await fake.audio.play(L.rhythmScore(),{onStop:value=>{reason=value;}});
  fake.contexts[0].state='suspended';fake.contexts[0].onstatechange();
  assert.equal(reason,'interrupted');assert.equal(fake.audio.playing,false);assert.equal(fake.timers.size,0);
});
