/* Original teaching material. This is not a transcription of 云宫迅音. */
(function(root){
  'use strict';
  const title='听《云宫迅音》：一架钢琴，怎样听见一支乐队？';
  const tasks=['带着耳朵进云宫：第一印象','拆开声音，再决定谁站前面','回到原曲：我现在听见了什么'];
  const defaults={lead:80,motor:60,bed:40,accent:'beat',color:'separate'};
  const roles={lead:'旋律',motor:'短音伴奏',bed:'和声背景'};
  const motif=[[0,1.5,74],[1.5,.5,78],[2,1,81],[3,1,78],[4,2,76],[6,1,74],[7,1,71],[8,1,69],[9,1,74],[10,1,78],[11,1,76],[12,3,74]];
  const harmony=[[0,4,[62,66,69]],[4,4,[61,64,69]],[8,4,[62,66,71]],[12,2,[62,67,71]],[14,2,[62,66,69]]];
  function mix(value){
    const v=value&&typeof value==='object'?value:{};
    const level=key=>typeof v[key]==='number'&&Number.isFinite(v[key])?Math.round(Math.max(0,Math.min(100,v[key]))):defaults[key];
    return {lead:level('lead'),motor:level('motor'),bed:level('bed'),accent:v.accent==='between'?'between':'beat',color:v.color==='same'?'same':'separate'};
  }
  function strong(beat,accent){return accent==='between'?beat%4===1.5||beat%4===3.5:beat%4===0||beat%4===2;}
  function score(value){
    const m=mix(value),events=[];
    const add=(role,beat,duration,midi,voice,weight=1)=>{if(m[role]>0)events.push({role,beat,duration,midi,voice:m.color==='same'?'melody':voice,velocity:m[role]/100*weight});};
    motif.forEach(([beat,duration,midi])=>add('lead',beat,duration,midi,'melody'));
    for(let beat=0;beat<16;beat+=.5)add('motor',beat,.2,beat%1===0?50:57,'pulse',strong(beat,m.accent)?1:.3);
    harmony.forEach(([beat,duration,notes])=>notes.forEach(midi=>add('bed',beat,duration,midi,'chord',.55)));
    return {bpm:96,totalBeats:16,events:events.sort((a,b)=>a.beat-b.beat)};
  }
  function describe(value){const m=mix(value);return `旋律 ${m.lead}／短音伴奏 ${m.motor}／和声背景 ${m.bed}；重音${m.accent==='beat'?'在第 1、3 拍':'在第 2、4 拍后半'}；${m.color==='same'?'统一合成音色':'分开合成音色'}；固定 96 BPM`;}
  const text=value=>typeof value==='string'?value.slice(0,900):'';
  function state(value){
    const v=value&&typeof value==='object'?value:{};
    return {tab:[0,1,2].includes(v.tab)?v.tab:0,version:text(v.version),place:text(v.place),impression:text(v.impression),listened:v.listened===true,guide:v.guide===true,mix:mix(v.mix),mixReason:text(v.mixReason),heardMix:typeof v.heardMix==='string'?v.heardMix:'',returnHeard:v.returnHeard===true,returnNote:text(v.returnNote),pianoNote:text(v.pianoNote),pianoFocus:['pulse','melody','join','none'].includes(v.pianoFocus)?v.pianoFocus:'none'};
  }
  const api={title,tasks,defaults,roles,motif,harmony,mix,strong,score,describe,state};
  root.YungongLesson=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
