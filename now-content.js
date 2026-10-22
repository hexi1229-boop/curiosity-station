/* Two viewpoints: a repeated habit and an action in the current snapshot. */
(function(root){
  'use strict';
  const title='平时常做，还是此刻正在做？';
  const habit='Mia usually trains after school.';
  const snapshots=[
    {time:'17:00',action:'train',verb:'training',label:'训练',sentence:'She is training now.'},
    {time:'17:20',action:'rest',verb:'resting',label:'休息',sentence:'She is resting now.'},
    {time:'17:40',action:'read',verb:'reading',label:'读书',sentence:'She is reading now.'}
  ];
  const words=[{word:'train',meaning:'训练',example:'train after school'},{word:'rest',meaning:'休息',example:'rest after training'},{word:'repair',meaning:'修理',example:'repair a robot'},{word:'test',meaning:'测试、检验',example:'test a robot'}];
  const questions=[
    {kind:'choice',skill:'先判断，这句话能告诉你什么',title:'只看这句话，能断定 Mia 此刻正在训练吗？',context:'Mia usually trains after school.（Mia 通常放学后训练。）现在没有提供此刻的画面。',options:['能，既然平时训练，现在就一定在训练','不能，这句话说的是习惯；此刻在做什么还需要信息','能，她从早到晚一直在训练'],answer:1,hint:'“通常会做”与“说话这一刻正在做”，是同一件事吗？',explanation:'不能只凭这句话判断此刻的动作。usually trains 表达通常的习惯，不保证任何一个时刻都在训练。打开双镜头，把“平时”与“此刻”放在一起看。'},
    {kind:'open',skill:'把两个镜头讲明白',title:'平时训练，此刻休息：这两句话矛盾吗？',context:'Mia usually trains after school, but she is resting now. 先说一说，再用中文或英文解释这两部分为什么能同时成立。',hint:'第一部分在说通常的安排，第二部分在说镜头里这一刻。解释时把这两个时间范围说清楚。',reference:'不矛盾。usually trains 说的是她通常的习惯；is resting now 说的是她此刻正在休息。平时有训练习惯，不代表此刻一定在训练。可以说：She usually trains after school, but she is resting now.',checks:['区分通常的习惯与此刻的动作，不把两者当成同一时间范围。','说明有训练习惯的人此刻可以休息，两部分能同时成立。']},
    {kind:'choice',skill:'找到形式里缺的一块',title:'描述直播里的动作：“Ben repairing a robot.” 少了什么？',context:'直播画面中，Ben 此刻正在修理机器人。要写一个完整的英语句子：Ben repairing a robot. 请选正确修改及理由。',options:['Ben is repairing a robot. 用 is + repairing；Ben 对应 he。','Ben are repairing a robot. 只要有 -ing，前面用什么都行。','Ben repairing a robot. 动词已经加了 -ing，不需要别的。'],answer:0,hint:'本课用现在进行时描述此刻动作：am/is/are + 动词-ing。Ben 相当于 he，该选哪个 be 动词？',explanation:'完整句子是 Ben is repairing a robot. 这里需要 is + repairing，不能漏掉 be。I 用 am，he/she/it 用 is，you/we/they 用 are。-ing 并不能单独承担本句完整的谓语。'},
    {kind:'pair',skill:'换成我们，重新组合',title:'“我们”平时修机器人，此刻正在测试：两处怎么填？',context:'We usually ____ robots on Sundays. Look! We ____ a robot now. 第一空表达平时修理，第二空表达眼前正在测试。',blanks:[{label:'平时：We usually ____ robots on Sundays.',options:['repair','repairs','repairing'],answer:0},{label:'此刻：Look! We ____ a robot now.',options:['test','is testing','are testing'],answer:2}],hint:'先看要表达的意思，再看主语是 we。习惯句用动词原形；本题的此刻动作需要 are + 动词-ing。',explanation:'We usually repair robots on Sundays. Look! We are testing a robot now. 平时习惯用 repair，主语 we 不加第三人称单数的 -s；此刻的测试用 are testing。repair 是修理，test 是测试，不能混成一个动作。'},
    {kind:'open',skill:'先开口，把方法用到自己身上',title:'给新朋友说两句：你平时常做什么，此刻正在做什么？',context:'先大声用英语说两句，再留下刚才的英语原话：一句说你平时常做的事，一句说你此刻正在做的动作。可以分开说，也可以用 but 连接。这里不录音、不自动评价发音。',hint:'卡住了再借句架：I usually ____. Right now, I am ____. 注意填写真实动作，不必照搬示范。',reference:'只是一种示范：I usually play football after school. Right now, I am learning English. 也可说 I’m learning English now. 你的活动可以不同。先选“习惯”还是“此刻动作”，再检查 I 后用动词原形或 am + 动词-ing。',checks:['两句都用英语表达，并分别说明平时常做的事和此刻正在做的动作。','检查形式：I 的习惯句用动词原形；此刻动作使用 I am / I’m + 动词-ing。']}
  ];
  function snapshot(index){if(!Number.isInteger(index)||index<0||index>=snapshots.length)throw new Error('Invalid snapshot');return {...snapshots[index],habit};}
  function checkPair(values){const blanks=questions[3].blanks;if(!Array.isArray(values)||values.length!==2||values.some((v,i)=>!Number.isInteger(v)||v<0||v>=blanks[i].options.length))return null;return values.every((v,i)=>v===blanks[i].answer);}
  root.NowLesson={title,habit,snapshots,words,questions,snapshot,checkPair};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.NowLesson;
})(typeof window!=='undefined'?window:globalThis);
