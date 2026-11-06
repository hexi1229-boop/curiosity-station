/* Gesture-started, single-transport Web Audio. No recordings or external assets. */
(function(root){
  'use strict';
  function create(){
    let context=null,master=null,active=null,timer=null,generation=0,volume=.55;
    const nodes=new Set();
    function now(){return context?context.currentTime:0;}
    function stop(reason='stopped'){
      generation++;
      if(timer!==null){root.clearTimeout(timer);timer=null;}
      const previous=active;active=null;
      for(const item of nodes){try{item.osc.stop();}catch(error){}try{item.osc.disconnect();item.gain.disconnect();}catch(error){}}
      nodes.clear();
      if(previous&&typeof previous.onStop==='function')previous.onStop(reason);
    }
    function setVolume(value){
      volume=Math.max(0,Math.min(.8,Number.isFinite(Number(value))?Number(value):.55));
      if(master)master.gain.setTargetAtTime(volume,context.currentTime,.015);
    }
    async function ready(){
      const AudioContext=root.AudioContext||root.webkitAudioContext;
      if(!AudioContext)throw new Error('这个浏览器暂时不能播放合成音，请用 Safari 或更新后的浏览器打开。');
      if(!context||context.state==='closed'){
        context=new AudioContext({latencyHint:'interactive'});
        master=context.createGain();master.gain.value=volume;master.connect(context.destination);
        context.onstatechange=()=>{if(active&&context.state!=='running')stop('interrupted');};
      }
      if(context.state!=='running'){
        let timeout;
        try{
          await Promise.race([
            context.resume(),
            new Promise((resolve,reject)=>{timeout=root.setTimeout(()=>reject(new Error('声音未能启动。请确认设备音量，再点一次播放。')),3000);})
          ]);
        }finally{if(timeout!==undefined)root.clearTimeout(timeout);}
      }
      if(context.state!=='running')throw new Error('声音还没有启动。请确认设备音量，再点一次播放。');
    }
    function scheduleNote(note,time,beatSeconds){
      const voice=note.voice||'melody';
      const settings={melody:{type:'triangle',level:.17,attack:.009,release:.09},chord:{type:'sine',level:.075,attack:.06,release:.12},bass:{type:'sine',level:.17,attack:.012,release:.08},pulse:{type:'triangle',level:.075,attack:.003,release:.035},click:{type:'sine',level:.2,attack:.002,release:.035}}[voice];
      if(!settings)return;
      const duration=Math.max(.04,note.duration*beatSeconds),release=Math.min(settings.release,duration*.25),attack=Math.min(settings.attack,duration*.2);
      const osc=context.createOscillator(),gain=context.createGain(),item={osc,gain};
      osc.type=settings.type;osc.frequency.value=440*Math.pow(2,(note.midi-69)/12);
      const peak=settings.level*Math.max(0,Math.min(1,note.velocity??.7));
      gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(peak,time+attack);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001,peak*.55),time+duration-release);
      gain.gain.linearRampToValueAtTime(0,time+duration);
      osc.connect(gain);gain.connect(master);nodes.add(item);
      osc.onended=()=>{nodes.delete(item);osc.disconnect();gain.disconnect();};
      osc.start(time);osc.stop(time+duration+.01);
    }
    async function play(score,options={}){
      stop('replaced');const token=generation;
      try{await ready();}catch(error){if(token!==generation)return null;throw error;}
      if(token!==generation)return null;
      const bpm=Math.max(60,Math.min(120,Number(score?.bpm)||84)),beatSeconds=60/bpm;
      const totalBeats=Math.max(1,Math.min(64,Math.round(Number(score?.totalBeats)||16)));
      const countIn=Math.max(0,Math.min(4,Math.round(Number(options.countIn)||0)));
      const origin=context.currentTime+.1,startTime=origin+countIn*beatSeconds;
      active={...options,startTime,beatSeconds,totalBeats,countIn};
      for(let beat=0;beat<countIn;beat++)scheduleNote({midi:beat===0?81:74,voice:'click',velocity:beat===0?.8:.55,duration:.12},origin+beat*beatSeconds,beatSeconds);
      for(const note of Array.isArray(score?.events)?score.events:[]){
        if(!Number.isFinite(note.beat)||note.beat<0||note.beat>=totalBeats||!Number.isFinite(note.midi)||note.midi<24||note.midi>100||!Number.isFinite(note.duration)||note.duration<=0)continue;
        scheduleNote({...note,duration:Math.min(note.duration,totalBeats-note.beat)},startTime+note.beat*beatSeconds,beatSeconds);
      }
      let nextBeat=-countIn;
      function tick(){
        if(token!==generation||!active)return;
        const current=context.currentTime;
        while(nextBeat<totalBeats&&current>=startTime+nextBeat*beatSeconds){
          const beat=nextBeat++;
          if(typeof options.onBeat==='function')options.onBeat({beat,time:startTime+beat*beatSeconds,phase:beat<0?'countin':'play',beatInBar:((beat%4)+4)%4,bar:beat<0?-1:Math.floor(beat/4)});
        }
        if(current>=startTime+totalBeats*beatSeconds+.03){
          const onEnd=options.onEnd;active=null;timer=null;
          if(typeof onEnd==='function')onEnd();
          return;
        }
        timer=root.setTimeout(tick,16);
      }
      tick();
      return {startTime,beatSeconds,totalBeats,countIn};
    }
    return {play,stop,now,setVolume,get playing(){return active!==null;}};
  }
  root.MusicAudio={create};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.MusicAudio;
})(typeof window!=='undefined'?window:globalThis);
