/* Original classroom music, arrangement model and descriptive tap evidence. */
(function(root){
  'use strict';
  const id='music';
  const title='同一段旋律，怎样配出不同的画面？';
  const tasks=[
    {title:'两次听见的是同一段旋律吗？',context:'比较只改变速度的两次播放，记录第一次听辨和声音证据。'},
    {title:'让手指和稳定的拍点一起走',context:'听四拍预备后轻点八拍；记录本轮拍点，不用一次表现推断钢琴等级。'},
    {title:'为两个画面制作自己的配乐',context:'保留旋律，选择速度、低音、和声与节拍层；换画面后调整并解释选择。'}
  ];
  const defaults={bpm:84,bass:false,chords:false,pulse:false};
  // This 16-beat motif is original teaching material, not an adaptation of a film score.
  const motif=[
    {beat:0,duration:1,midi:76},{beat:1,duration:.5,midi:79},{beat:1.5,duration:.5,midi:81},{beat:2,duration:1,midi:79},{beat:3,duration:1,midi:76},
    {beat:4,duration:.5,midi:74},{beat:4.5,duration:.5,midi:76},{beat:5,duration:1,midi:79},{beat:6,duration:2,midi:76},
    {beat:8,duration:1,midi:77},{beat:9,duration:1,midi:81},{beat:10,duration:.5,midi:79},{beat:10.5,duration:.5,midi:76},{beat:11,duration:1,midi:74},
    {beat:12,duration:1,midi:74},{beat:13,duration:1,midi:76},{beat:14,duration:2,midi:72}
  ];
  const chords=[
    {beat:0,duration:4,name:'C',midi:[60,64,67],root:48},
    {beat:4,duration:4,name:'Am',midi:[57,60,64],root:45},
    {beat:8,duration:4,name:'F',midi:[57,60,65],root:41},
    {beat:12,duration:2,name:'G',midi:[55,59,62],root:43},
    {beat:14,duration:2,name:'C',midi:[60,64,67],root:48}
  ];
  const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
  const text=value=>typeof value==='string'?value.slice(0,900):'';
  function sanitizeArrangement(value){
    const input=value&&typeof value==='object'?value:{};
    return {bpm:Math.round(clamp(input.bpm,60,120,84)),bass:input.bass===true,chords:input.chords===true,pulse:input.pulse===true};
  }
  function buildEvents(value){
    const arrangement=sanitizeArrangement(value);
    const events=motif.map(note=>({...note,voice:'melody',velocity:.8}));
    if(arrangement.chords)for(const chord of chords)for(const midi of chord.midi)events.push({beat:chord.beat,duration:chord.duration,midi,voice:'chord',velocity:.52});
    if(arrangement.bass)for(const chord of chords)for(let beat=chord.beat;beat<chord.beat+chord.duration;beat+=2)events.push({beat,duration:1.7,midi:chord.root,voice:'bass',velocity:.65});
    if(arrangement.pulse)for(let beat=0;beat<16;beat++)events.push({beat,duration:.12,midi:beat%4===0?76:69,voice:'pulse',velocity:beat%4===0?.7:.45});
    return {bpm:arrangement.bpm,totalBeats:16,events:events.sort((a,b)=>a.beat-b.beat)};
  }
  function rhythmScore(bpm=84){
    return {bpm:sanitizeArrangement({bpm}).bpm,totalBeats:8,events:Array.from({length:8},(_,beat)=>({beat,duration:.12,midi:beat%4===0?81:74,voice:'click',velocity:beat%4===0?.8:.55}))};
  }
  const targetPattern=['q','e','r','q'];
  function patternScore(pattern,bpm=84){
    const events=[];
    for(let beat=0;beat<4;beat++){
      const value=['q','e','r'].includes(pattern?.[beat])?pattern[beat]:'q';
      if(value==='r')continue;
      events.push({beat,duration:value==='e'?.5:1,midi:76,voice:'pulse',velocity:.8});
      if(value==='e')events.push({beat:beat+.5,duration:.5,midi:76,voice:'pulse',velocity:.8});
    }
    return {bpm:sanitizeArrangement({bpm}).bpm,totalBeats:4,events};
  }
  function median(values){
    const sorted=[...values].sort((a,b)=>a-b),n=sorted.length;
    return n?(n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2):null;
  }
  function analyzeTaps(taps,options={}){
    const startTime=Number.isFinite(options.startTime)?options.startTime:0;
    const beatSeconds=clamp(options.beatSeconds,.5,1,60/84),count=Math.round(clamp(options.count,1,16,8));
    const input=(Array.isArray(taps)?taps:[]).filter(Number.isFinite).slice(0,64);
    const nearest=new Map();
    for(const time of input){
      const relative=(time-startTime)/beatSeconds,beat=Math.round(relative);
      if(beat<0||beat>=count||Math.abs(relative-beat)>.5)continue;
      const errorMs=(time-startTime-beat*beatSeconds)*1000;
      if(!nearest.has(beat)||Math.abs(errorMs)<Math.abs(nearest.get(beat)))nearest.set(beat,errorMs);
    }
    const matches=[...nearest.entries()].sort((a,b)=>a[0]-b[0]).map(([beat,errorMs])=>({beat,errorMs:Math.round(errorMs)}));
    const offset=median(matches.map(match=>match.errorMs));
    return {
      tapCount:input.length,matched:matches.length,missed:count-matches.length,extra:input.length-matches.length,
      offsetMs:offset===null?null:Math.round(offset),
      spreadMs:matches.length<3?null:Math.round(median(matches.map(match=>Math.abs(match.errorMs-offset)))),
      matches
    };
  }
  function sanitizeState(value){
    const source=value&&typeof value==='object'?value:{};
    const rhythmAttempts=(Array.isArray(source.rhythmAttempts)?source.rhythmAttempts:[]).slice(0,6).map(attempt=>{
      const beatSeconds=clamp(attempt?.beatSeconds,.5,1,60/84);
      const taps=(Array.isArray(attempt?.taps)?attempt.taps:[]).filter(time=>Number.isFinite(time)&&time>=-1&&time<=9).slice(0,64);
      return {taps,beatSeconds,summary:analyzeTaps(taps,{startTime:0,beatSeconds,count:8})};
    });
    return {
      heard:[...new Set(Array.isArray(source.heard)?source.heard:[])].filter(id=>['A','B'].includes(id)),
      listeningChoice:['tempo','pitch','layers','unsure'].includes(source.listeningChoice)?source.listeningChoice:'',
      listeningReason:text(source.listeningReason),rhythmAttempts,rhythmSkipped:source.rhythmSkipped===true,
      arrangement:sanitizeArrangement(source.arrangement),arrangementReason:text(source.arrangementReason),
      scene:source.scene==='run'?'run':'dawn',transferArrangement:sanitizeArrangement(source.transferArrangement),transferReason:text(source.transferReason)
    };
  }
  root.MusicLesson={id,title,tasks,motif,chords,defaults,targetPattern,sanitizeArrangement,buildEvents,rhythmScore,patternScore,analyzeTaps,sanitizeState};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.MusicLesson;
})(typeof window!=='undefined'?window:globalThis);
