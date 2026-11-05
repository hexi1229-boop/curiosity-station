'use strict';
(function(root){
  const chunks=[
    {id:'stuck',function:'遇到阻碍',base:'get stuck',past:'got stuck',cue:'g__ s__',tip:'说过去发生的事，可以用 got stuck。'},
    {id:'try',function:'尝试办法',base:'give it a try',past:'gave it a try',cue:'g___ … a t__',tip:'中间可以换成 the new move / the short pass。'},
    {id:'figure',function:'找到原因或办法',base:'figure it out',past:'figured it out',cue:'f_____ … o__',tip:'out 是整个词块的一部分，不要丢掉。'},
    {id:'better',function:'比较结果',base:'work better',past:'worked better',cue:'w___ b_____',tip:'讲已经发生的结果，可以用 worked better。'}
  ];
  const tasks=[
    {title:'没有词表时，先说一次',context:'机器人第一次试跑失败，团队调整后成功。先保留自己能主动调出的英语。'},
    {title:'看过示例后，盖住再取',context:'把四个完整词块放进阻碍、尝试、发现和结果，再遮住英文主动提取。'},
    {title:'撤掉词表，换到球场',context:'从比分牌和教练便笺中重组一次问题解决过程。'},
    {title:'新档案里独立调用',context:'阅读月球车聊天记录，先口头说明，再留下实际调用的词块。'}
  ];
  function normalize(value){
    return String(value||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z'\s]/g,' ').replace(/\s+/g,' ').trim();
  }
  const pronounObject="(?:it|this|that|them|these|those|something)";
  const nounPhrase="(?:(?:the|a|an|my|your|his|her|our|their|another|one|some|each|every|this|that|these|those)\\s+[a-z']+(?:\\s+[a-z']+){0,3})";
  const objectPhrase="(?:"+pronounObject+"|"+nounPhrase+")";
  const tryPattern=new RegExp("\\b(?:give|gives|gave|giving)\\s+"+objectPhrase+"\\s+a\\s+try\\b");
  const figureBeforePattern=new RegExp("\\b(?:figure|figures|figured|figuring)\\s+"+objectPhrase+"\\s+out\\b");
  const figureAfterPattern=new RegExp("\\b(?:figure|figures|figured|figuring)\\s+out\\s+(?:(?:what|why|how|whether|where|when|who)\\s+[a-z']+(?:\\s+[a-z']+){0,4}|something|"+nounPhrase+")\\b");
  function hasChunk(value,id){
    const text=normalize(value);
    if(id==='stuck')return /\b(?:get|gets|got|getting)\s+stuck\b/.test(text);
    if(id==='try')return tryPattern.test(text);
    if(id==='figure')return figureBeforePattern.test(text)||figureAfterPattern.test(text);
    if(id==='better')return /\b(?:work|works|worked|working)\s+better\b/.test(text);
    return false;
  }
  function identifyChunk(value){
    if(hasChunk(value,'stuck'))return 'stuck';
    if(hasChunk(value,'try'))return 'try';
    if(hasChunk(value,'figure'))return 'figure';
    if(hasChunk(value,'better'))return 'better';
    return null;
  }
  function gradeInputs(values){
    const result={};
    for(const chunk of chunks)result[chunk.id]=hasChunk(values?.[chunk.id],chunk.id);
    return result;
  }
  function extractChunks(value){
    return chunks.filter(chunk=>hasChunk(value,chunk.id)).map(chunk=>chunk.id);
  }
  function meaningfulEnglish(value,minWords=3){
    return (String(value||'').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[]).length>=minWords;
  }
  function gradeSummary(result){
    return chunks.filter(chunk=>result[chunk.id]).map(chunk=>chunk.id);
  }
  const lesson={
    id:'activewords',
    title:'认识这个词，为什么开口时还是想不起来？',
    tasks,chunks,normalize,hasChunk,identifyChunk,gradeInputs,extractChunks,meaningfulEnglish,gradeSummary,
    example:{
      label:'合作游戏 · 短示例',
      duration:'约30秒',
      highlights:['got stuck','gave a narrower wheel setting a try','figured out','worked better'],
      lines:[
        'Last night, my team reached the final level of a robot game.',
        'I got stuck because the gate was too narrow.',
        'I gave a narrower wheel setting a try, but the robot still touched the gate.',
        'Then my partner noticed that the front wheels were farther apart than the back wheels.',
        'We figured out the wheel-spacing problem and moved the front wheels inward.',
        'The new setting worked better, and our robot finally passed the gate.'
      ]
    }
  };
  root.ActiveWordsLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
