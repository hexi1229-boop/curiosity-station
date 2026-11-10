/* Score-led listening: 王宁@虫虫钢琴, opern 1052381. No substitute music. */
(function(root){
  'use strict';
  const title='听《云宫迅音》：跟着乐句，看懂钢琴改编',legacyTitle='听《云宫迅音》：一架钢琴，怎样听见一支乐队？';
  const source='https://cc.lzjoy.com/public/web/webmobile/share_v2.html?opern_id=1052381';
  const bpm=115,offset=.068,barStart=bar=>offset+(bar-1)*4*60/bpm;
  const tracks={piano:{name:'王宁编配 · 谱面配套试听',src:'assets/yungong/piano-1052381.mp3',duration:178.0803},original:{name:'原版参考 · 家长提供',src:'assets/yungong/original-reference.m4a',duration:176.1}};
  const clips={intro:{label:'第 1–2 小节 · 伴奏先走',from:1,to:2},entrance:{label:'第 3–4 小节 · 旋律进入',from:3,to:4},opening:{label:'连起来听 · 第 1–4 小节',from:1,to:4},phrase:{label:'第 24–25 小节 · 一句长线条',from:24,to:25},held:{label:'第 25 小节 · 长音与流动',from:25,to:25},before:{label:'先听 · 第 24 小节',from:24,to:24},after:{label:'再听 · 第 48 小节',from:48,to:48},raised:{label:'连起来听 · 第 48–49 小节',from:48,to:49},ending:{label:'第 72–75 小节 · 谁还在继续？',from:72,to:75}};
  Object.values(clips).forEach(c=>{c.start=barStart(c.from);c.end=barStart(c.to+1);});
  const stages=[
    {short:'旋律登场',title:'旋律还没进，音乐已经在走了？',bars:'第 1–4 小节',clips:['intro','entrance','opening'],image:'opening',caption:'第 1–3 小节：上方前两小节休止，下方连续行进；第三小节上方加入八度音。',question:'只听开头两小节，哪种说法更贴近声音？',choices:['旋律声部还在休息，伴奏已经向前走','整架钢琴还没有发声','我还拿不准'],explain:[
      '看上方：前两小节是整小节休止。看下方：每小节有八个八分音符。休止属于某个声部，不等于整首音乐静止。',
      '第三小节，上方加入八度音，形成两组“短、短、长”。每组是两个十六分音符接一个附点四分音符，合计两拍；下面的八分音符仍然继续。',
      '再连起来听：先有持续流动的伴奏，再有醒目的旋律进入。你觉得像“登场”或别的画面都可以，依据是声音进入的先后。'
    ],action:'只用手指轻点伴奏的拍子。旋律进入时，手指不用突然加快。',hint:'先只看两个谱表：哪一行有休止符，哪一行有成串的音符？再回听第 1–2 小节。'},
    {short:'长音与流动',title:'上面拖着长音，下面为什么没停？',bars:'第 24–25 小节',clips:['phrase','held'],image:'longline',caption:'第 24–25 小节：第 25 小节上方是一组八度全音符，下方仍有八个八分音符。',question:'听第 25 小节：长音出现后，哪里还在不断落下新音？',choices:['下方伴奏继续，旋律长音留在上面','两个声部一起停住了','我还拿不准'],explain:[
      '第 24 小节的旋律先休息一拍，再奏出 E—D—C 的下降线条。下一小节，旋律落在一个长音上；上下两个同名音相隔八度，一起构成这条旋律。',
      '第 25 小节，上方的全音符占四拍，下方八个八分音符也占四拍。它们走过同样长的一小节，却不是同样密的发音。',
      '“长旋律＋流动伴奏”让一句音乐既能舒展，又不断向前。钢琴音敲响后会衰减；长音符要求保留时值，不代表音量会一直不变。'
    ],action:'回放第 25 小节：一只手在空中慢慢划一条长线，另一只手轻点八下，感受两层声音共用同一段时间。',hint:'先只追最高处的长音，再重播一次，只追下方不断换动的音。不要求同时听清每个音。'},
    {short:'熟悉句子变高',title:'熟悉的一句，为什么换了高度？',bars:'对比第 24 与第 48 小节',clips:['before','after','raised'],image:'raised',caption:'第 48–49 小节：此处调号新增 F♯、C♯；第 49 小节还增加了中间的活动声部。',question:'比较第 24 与第 48 小节的上方旋律，你注意到了什么？',choices:['节奏骨架相同，三个旋律音都升高了','只换了乐器，音高完全没变','我还拿不准'],explain:[
      '第 24 小节：E—D—C。第 48 小节：F♯—E—D。三个音都升高两个半音，也就是一个全音；旋律的下降关系仍然保留。',
      '这两小节都先休止一拍，然后是四分音符、附点四分音符、八分音符。我们仍认得这句话，是因为节奏与音高之间的关系保留下来。',
      '继续听第 49 小节，还会多出中间活动的线条。这里不只有音高改变，不能把所有听感差别都归给“升调”。你觉得更明亮、更紧张，或没有明显区别，都可以用听到的变化说明。'
    ],action:'先哼住第一句的高低走向，再播放第二句；保持同样的节奏，把哼唱的起点抬高。不会唱准也可以只对照谱。',hint:'别先猜调名。只比较三个音：E 到 F♯、D 到 E、C 到 D，各跨了几个半音？'},
    {short:'结尾的接力',title:'旋律安静下来，谁把音乐送向结尾？',bars:'第 72–75 小节',clips:['ending'],image:'ending',caption:'第 72–73 小节：上方短和弦后留出休止，下方仍有反复的节奏音型。',question:'这次先不看谱：主旋律变少以后，你还听到了什么？',choices:['下方反复的音型仍在推进','旋律一休止，全曲就没有声音了','我想再听一遍'],explain:[
      '第 72 小节上方只在开头弹一个短和弦，随后休止；第 73 小节上方整小节休止。下方的节奏音型却没有退出。',
      '回想开头：也是有的声部暂时休息，有的声部继续工作。这里的情境换成了结尾——声音的任务可以交接，不必每一层始终都在。',
      '最后回到整首，留意你现在能辨认的入口、长线条和结尾。能指出一个具体位置、说出哪一层在变化，就比只说“好听、很燃”更清楚了。'
    ],action:'和爸爸口头交换一次发现：我听见____继续，所以虽然____停了，音乐仍在走。愿意留文字再写，不另加作业。',hint:'用长音段学过的“追一层”听法，先追下方反复出现的音型，再听上方什么时候加入、什么时候退出。'}
  ];
  const tasks=stages.map(s=>s.title),clean=v=>typeof v==='string'?v.slice(0,900):'';
  function state(value){const v=value&&typeof value==='object'?value:{};return {tab:Number.isInteger(v.tab)&&v.tab>=0&&v.tab<4?v.tab:0,track:v.track==='original'?'original':'piano',choices:stages.map((s,i)=>Number.isInteger(v.choices?.[i])&&v.choices[i]>=0&&v.choices[i]<s.choices.length?v.choices[i]:null),notes:stages.map((s,i)=>clean(v.notes?.[i])),opened:stages.map((s,i)=>v.opened?.[i]===true),loop:v.loop===true};}
  function position(t){const beat=Math.max(0,(t-offset)*bpm/60);return {bar:Math.max(1,Math.min(83,Math.floor(beat/4)+1)),beat:beat%4};}
  function regionAction(t,clip,loop){return !clip||t<clip.end?'continue':loop?'repeat':'stop';}
  const api={title,legacyTitle,source,bpm,offset,tracks,clips,stages,tasks,state,barStart,position,regionAction};root.YungongLesson=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
