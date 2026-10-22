/* A short original flight log: meaning first, then form and personal transfer. */
(function(root){
  'use strict';
  const title='昨天的试飞，怎么用英语讲清楚？';
  const story="Yesterday, we built a paper rocket. It flew two metres, but it didn't reach the target. We changed one fin and tried again.";
  const words=[{word:'build → built',meaning:'制作、建造',example:'We built a paper rocket.'},{word:'fly → flew',meaning:'飞行',example:'It flew two metres.'},{word:'reach',meaning:'到达',example:'reach the target'},{word:'target',meaning:'目标；靶子',example:'a target on the wall'},{word:'fin',meaning:'火箭尾翼；鱼鳍',example:'change one fin'}];
  const views=[
    {label:'平时常做',time:'通常的周末',sentence:'We usually build paper rockets.',parts:['We usually ','build',' paper rockets.'],note:'build 表达 we 的日常活动；这句没有告诉你昨天的具体结果。'},
    {label:'昨天做过',time:'昨天 → 已发生',sentence:'We built a paper rocket yesterday.',parts:['We ','built',' a paper rocket yesterday.'],note:'built 是 build 的不规则过去式。不是所有动词都在词尾加 -ed。'},
    {label:'昨天没做到',time:'昨天 → 未发生的动作',sentence:"It didn't reach the target yesterday.",parts:['It ',"didn't",' ','reach',' the target yesterday.'],note:'否定的是“到达目标”，不是否定它曾飞行。did 已标记过去，后面的实义动词 reach 用原形。'},
    {label:'问昨天的事',time:'昨天 → 结果待确认',sentence:'Did it reach the target yesterday?',parts:['','Did',' it ','reach',' the target yesterday?'],note:'这类一般疑问句用 Did + 主语 + 动词原形。问句本身没有断定结果；回答可用 Yes, it did. / No, it didn’t.'}
  ];
  const tokens=['Did','it','fly','two metres','?','flew'],bank=[2,4,0,5,1,3];
  function validOrder(ids){return Array.isArray(ids)&&ids.length<=5&&new Set(ids).size===ids.length&&ids.every(i=>Number.isInteger(i)&&i>=0&&i<tokens.length);}
  function checkOrder(ids){if(!validOrder(ids)||ids.length!==5)return null;return ids.every((n,i)=>n===i);}
  function sentence(ids){if(!validOrder(ids))throw new Error('Invalid word order');return ids.map(i=>tokens[i]).join(' ').replace(/\s+\?/g,'?');}
  function view(index){if(!Number.isInteger(index)||index<0||index>=views.length)throw new Error('Invalid viewpoint');return {...views[index],parts:[...views[index].parts]};}
  const questions=[
    {kind:'choice',skill:'听懂一段记录，不替故事补结果',title:'哪句话符合这段试飞记录？',context:story,options:['他们每天都飞两米，所以昨天的结果也一样。','昨天纸火箭飞了两米，没到目标；调整后又试了一次，但没说第二次的结果。','昨天第一次没到目标，但第二次一定成功了。'],answer:1,hint:'留意 Yesterday、didn’t reach 和 tried again。再试一次，能直接证明这次成功了吗？',explanation:'这段讲昨天：做了纸火箭、飞了两米但没到目标、调整尾翼后又试。tried again 只说明“再次尝试”，没有说明第二次成功。过去时讲已经发生的事，也可以讲过去没发生的动作。'},
    {kind:'open',skill:'改一句，还要讲清为什么',title:'“It didn’t reached the target.” 怎么改？为什么？',context:'同伴在昨天的试飞记录中写：It didn’t reached the target. 请写出正确的英语句子，再用中文或英文说明动词为什么这样改。',hint:'本题是否定句。did 已经承担过去时标记，后面的实义动词要用什么形式？',reference:"It didn’t reach the target. 或 It did not reach the target. didn’t 中的 did 已经表示过去，后面的实义动词 reach 用原形，不再写 reached。整句仍在说过去，不是改成现在。",checks:['写出 didn’t / did not + reach，保留“没有到达目标”的意思。','解释 did 已标记过去，后面用动词原形；不是因为否定句就不再表示过去。']},
    {kind:'order',skill:'亲手组句，换一个动词试试',title:'问“它飞了两米吗？”怎样组成英语问句？',context:'仍在问昨天的试飞。点选5块词牌组成一个一般疑问句；其中1块多余。句意：它飞了两米吗？',hint:'过去时提问：Did + 主语 + 动词原形 + 其余部分。fly 和 flew 只需要选一个。',explanation:'Did it fly two metres? Did 提到主语 it 前面，实义动词用原形 fly；不能再用 flew。根据记录，可回答 Yes, it did. 这是问飞行距离，不是问是否到达目标。'},
    {kind:'choice',skill:'换到运动场，词义还能认出来吗',title:'这次 target 指什么？',context:'Yesterday, Leo threw a soft ball at a target on the wall. The ball missed it.（Leo 朝墙上的某个东西投软球，没有击中。）这里的 target 最可能指什么？',options:['练习时想击中的靶子','飞行器的尾翼','把动作变成过去的词尾'],answer:0,hint:'at a target on the wall，后面又说球没有击中它。结合位置与动作判断，不要只记火箭故事里的图片。',explanation:'这里 target 指墙上想击中的靶子。“目标”不只属于火箭：可以是实体靶子，也可以是想达到的目标。本句的 wall、threw、missed 给出了具体语境。'},
    {kind:'open',skill:'先开口，再留下自己的英语',title:'用英语讲一件昨天的小事：做了什么，没做什么？',context:'先大声说2–3句，再留下刚才的英语原话：说清昨天，包含一个做过的动作和一个 didn’t 句。运动、游戏、读书都可以，不必讲火箭。不录音、不自动评价发音。',hint:'需要时借句架：Yesterday, I ____. I didn’t ____. 词组可用 played football、watched a video、read a story（read 的过去式拼写不变，读作 /red/）。didn’t 后分别用 play、watch、read。',reference:"一种示范：Yesterday, I played basketball with my friend. I didn’t watch TV. 你的活动可以不同。检查时间、过去动作和 didn’t + 原形，确保说的是自己的经历；不是照搬示范才算对。",checks:['英语原话说明昨天，包含做过与没做的动作；内容可以与示范不同。','肯定句用合适的过去式；didn’t 后用动词原形。自检不能自动证明发音或流利度。']}
  ];
  root.PastLesson={title,story,words,views,tokens,bank,questions,validOrder,checkOrder,sentence,view};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.PastLesson;
})(typeof window!=='undefined'?window:globalThis);
