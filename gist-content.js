/* Original short reports; summaries are evaluated by information, not copied phrasing. */
(function(root){
  'use strict';
  const title='一句话说清整件事';
  const car={title:'弯道停下的小车',lines:['科技社试车时，一台小车在弯道停了下来。','小宇发现一个轮子被线头缠住，便取下线头，再次试车。','这一次，小车顺利跑完了路线。','小宇的手腕上戴着一条蓝色手环。']};
  const balls={title:'器材架上的新标签',lines:['周二课间，小林和同伴发现器材架上的足球、篮球混在一起，常被放错位置。','他们用黑色笔给足球、篮球的摆放位置加上图案标签，再把两类球分开摆放。','架子旁贴着一张蓝色海报。','当天午休归还的球，都被放回了标签对应的位置。']};
  const routes={title:'两组同学的试行记录',lines:['周三，科技社的两个小组试走了一条新路线。','两个小组都按时到达了集合点。','其他小组还没有试走这条路线。']};
  const relay={title:'统一的交棒口令',lines:['校运会前，七（1）班接力队发现练习时常在交棒环节掉棒。','队员把口令统一为“接”，并在交棒前先喊出口令。','再次试跑时，三次交接都顺利完成。','记录员在本子边上画了一颗星星。']};
  const cards=[
    {text:'小林和同伴',keep:true},
    {text:'架子旁的海报是蓝色的',keep:false},
    {text:'当天午休归还的球都放回对应位置',keep:true},
    {text:'给足球、篮球的摆放位置加图案标签，并分开摆放',keep:true},
    {text:'周二课间',keep:false},
    {text:'画标签用的是黑色笔',keep:false}
  ];
  function validCards(ids){return Array.isArray(ids)&&ids.length<=cards.length&&new Set(ids).size===ids.length&&ids.every(i=>Number.isInteger(i)&&i>=0&&i<cards.length);}
  function checkCards(ids){if(!validCards(ids)||ids.length!==3)return null;return ids.every(i=>cards[i].keep);}
  function cardAnswer(ids){if(!validCards(ids))throw new Error('Invalid information cards');const list=ids.slice().sort((a,b)=>a-b);return '保留：'+list.map(i=>`${i+1}. ${cards[i].text}`).join('；')+'。暂不保留：'+cards.map((_,i)=>i).filter(i=>!list.includes(i)).map(i=>`${i+1}. ${cards[i].text}`).join('；')+'。';}
  const method=[
    {label:'先对准任务',heading:'这次要让读者知道什么？',note:'任务是概括小车这次怎样恢复行驶。先找谁采取了什么行动，以及这次出现什么结果。',keep:[],sentence:''},
    {label:'选出主要信息',heading:'删去手环颜色，主要事件还在',note:'小宇、清理线头后重试、小车跑完路线，都与本题有关。手环颜色不能回答本题，可以省去。',keep:[0,1,2],sentence:''},
    {label:'把信息接起来',heading:'用自己的话，连成完整意思',note:'把零散信息接成顺畅的一句。字数少不是唯一标准；关键行动和本次结果要说清。',keep:[0,1,2],sentence:'小宇清理小车轮子上的线头后再次试车，小车顺利跑完了路线。'},
    {label:'检查有没有添意',heading:'这次跑完了，不等于以后不会坏',note:'原文只写这一次的结果。“小车从此再也不会出故障”超出了材料，不能加进概括。',keep:[0,1,2],sentence:'小宇清理小车轮子上的线头后再次试车，小车顺利跑完了路线。'}
  ];
  const methodCards=['小宇','清理轮子上的线头，再次试车','这次小车顺利跑完路线','蓝色手环'];
  function methodState(index){if(!Number.isInteger(index)||index<0||index>=method.length)throw new Error('Invalid method step');return {...method[index],keep:[...method[index].keep]};}
  const questions=[
    {kind:'choice',skill:'先判断，哪一句抓住了主要事件',title:'向没在场的同学概括小车怎样恢复行驶，哪一句合适？',passage:car,options:['小宇戴着蓝色手环，在科技社参加了试车活动。','只要清理线头，任何小车以后都不会出故障。','小宇清理小车轮子上的线头后再次试车，小车顺利跑完了路线。'],answer:2,hint:'读者要知道“怎样恢复行驶”。只写衣着和参加活动够吗？材料有没有保证以后永远不坏？',explanation:'第三句保留了谁、关键行动与这次结果。第一句虽有真实细节，却漏了怎样恢复行驶；第二句加上了材料没有保证的结论。概括要对准任务，保留主要信息。'},
    {kind:'cards',skill:'动手取舍信息',title:'保留哪3张卡，能说清谁改进了摆球办法、这次结果如何？',passage:balls,hint:'按这次任务找主体、具体改进办法和本次结果。时间、海报颜色与用笔也是真实信息，但本题不需要单独保留它们。',explanation:'保留①小林和同伴、④加标签并分类摆球、③当天归还的球都放回对应位置。可以组合为：小林和同伴给足球、篮球的摆放位置加标签并分类摆球，当天归还的球都放回对应位置。是否保留时间地点要看题目；这次不是请人按时到某地参加活动。'},
    {kind:'open',skill:'说清为什么不能漏掉它',title:'“小林和同伴给球分类、加了标签。”已经回答完整了吗？',passage:balls,task:'任务仍是说明“谁改进了摆球办法、这次结果如何”。请补上漏掉的信息，并解释为什么需要它。',hint:'这句话告诉了你“做了什么”。题目还问了哪一部分？回看最后一句，注意结果只适用于这次记录。',reference:'还不完整，漏了这次的结果。应补充：当天午休归还的球都放回了对应位置。因为题目同时问办法和结果，只有“分类、加标签”还不能回答试用后发生了什么。不要改成“以后再也不会放错”。',checks:['补出当天归还的球都放回对应位置，不把一次记录扩大成永久保证。','说明原句缺少题目要求的结果，而不只是说“太短”或“还不够详细”。']},
    {kind:'choice',skill:'换一篇消息，检查范围有没有变',title:'要概括这次试行及结果，哪一句没有夸大？',passage:routes,options:['全校同学使用新路线后都能按时到达。','科技社两个小组试走新路线并按时到达，其他小组还没试过。','两个小组试过一次，所以以后每天都一定能按时到达。'],answer:1,hint:'圈出参与范围和时间范围：试过的是谁？“这一次”能不能直接换成“以后每天”？',explanation:'第二句保留两个小组与这次试行的范围。不能把两个小组改成全校，也不能把一次按时到达改成以后的永久保证。用词越肯定，越需要相应依据。'},
    {kind:'open',skill:'独立概括，换材料也能用',title:'用1–2句话，概括接力队怎样改进交棒、这次结果如何。',passage:relay,hint:'先在心里找主体、关键改进和这次结果，再用自己的话连接。星星图案是否帮助回答题目？别把试跑结果写成正式比赛获胜。',reference:'例如：七（1）班接力队统一口令，并在交棒前先喊“接”；再次试跑时，三次交接都顺利完成。也可以说“队员统一交棒口令并提前喊出，这次试跑顺利完成了各次交接”。允许不同说法，但不能漏掉主要改进或本次结果，也不能添加“比赛夺冠”“从此不掉棒”等结论。',checks:['说明接力队统一口令并在交棒前喊出，不能只写“认真练习”这类泛泛说法。','说明这次试跑交接顺利，保留本次范围，不添加比赛获胜等原文没有的信息。','用自己的话表达清楚，可以是一句或两句，不要求照抄参考。']}
  ];
  questions.forEach(q=>q.context=q.passage.title+'：'+q.passage.lines.map((line,i)=>(i+1)+'. '+line).join(' '));
  root.GistLesson={title,car,balls,routes,relay,cards,method,methodCards,questions,validCards,checkCards,cardAnswer,methodState};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GistLesson;
})(typeof window!=='undefined'?window:globalThis);
