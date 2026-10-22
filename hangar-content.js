/* Original location/possession task. The speaker is Leo. */
(function(root){
 'use strict';
 const title='机库里有，就代表我有吗？';
 const story='There is a drone in the hangar. It belongs to Mia. I have a helmet.';
 const words=[{word:'hangar',meaning:'机库',example:'in the hangar'},{word:'drone',meaning:'无人机',example:'one drone → two drones'},{word:'belong to',meaning:'属于',example:'It belongs to Mia.'},{word:'helmet',meaning:'头盔',example:'a helmet'},{word:'station',meaning:'站；本课指补给站',example:'at the station'},{word:'chair',meaning:'椅子',example:'two chairs'}];
 function view(count=1,owner='Mia'){
  if(!Number.isInteger(count)||count<0||count>3||!['Mia','Leo'].includes(owner))throw new Error('Invalid hangar model');
  const plural=count!==1;
  const existence=count===0?"There aren't any drones in the hangar.":count===1?'There is a drone in the hangar.':`There are ${count===2?'two':'three'} drones in the hangar.`;
  return {count,owner,total:3,outside:3-count,existence,ownership:owner==='Mia'?'Mia has three drones.':'I have three drones.',question:plural?'Are there any drones in the hangar?':'Is there a drone in the hangar?',reply:count===0?"No, there aren't.":plural?'Yes, there are.':'Yes, there is.',drones:Array.from({length:3},(_,i)=>({id:i,x:60+i*100,y:i<count?115:265,inside:i<count}))};
 }
 const tokens=['There','are','two drones','in','the hangar','.','have','is'],bank=[4,6,2,7,3,0,5,1];
 function validOrder(ids){return Array.isArray(ids)&&ids.length<=6&&new Set(ids).size===ids.length&&Array.from(ids).every(i=>Number.isInteger(i)&&i>=0&&i<tokens.length);}
 function checkOrder(ids){if(!validOrder(ids)||ids.length!==6)return null;return ids.every((n,i)=>n===i);}
 function sentence(ids){if(!validOrder(ids))throw new Error('Invalid hangar sentence');return ids.map(i=>tokens[i]).join(' ').replace(/\s+\./g,'.');}
 const questions=[
  {kind:'choice',skill:'先听信息：在哪儿，与属于谁',title:'Leo说了什么？哪条信息与录音一致？',context:'说话者Leo：'+story,options:['无人机在机库里，所以一定是Leo自己的。','机库里有两架无人机，它们都属于Mia。','机库里有一架无人机，它属于Mia；Leo有一个头盔。'],answer:2,hint:'in the hangar告诉你地点，belongs to Mia告诉你归属。两条信息可以合成“都是Leo的”吗？',explanation:'选C。There is a drone in the hangar. 介绍某处有一架无人机；It belongs to Mia. 说明它属于Mia。Leo说 I have a helmet.，是在说自己有头盔。物品在哪里，不能自动证明是谁拥有它。'},
  {kind:'order',skill:'动手组句：描述某处有什么',title:'把“机库里有两架无人机”组成一句英语。',context:'用6块词牌，以There开头；有2块多余。只表达此处有两架无人机，没有给出拥有者。',hint:'two drones是复数，There后面选are；再放地点in the hangar。不要把中文“有”直接换成have。',explanation:'There are two drones in the hangar. two drones用复数，配are；there be介绍存在或位置。本句不能用There have，也不能把复数two drones搭配is。'},
  {kind:'open',skill:'辨错解释：改对形式，也守住信息范围',title:'“There have three drones in the hangar.” 怎么改？能据此说无人机是我的吗？',context:'新场景只告诉你：机库里有三架无人机，没有提供拥有者信息。先改成正确的There开头英语句子，再用中文或英语解释能否推出“我拥有三架”。',hint:'这句话要介绍机库里存在什么，还是介绍我拥有什么？数三架时用is还是are？',reference:'There are three drones in the hangar. 这里用there be，three drones是复数，所以用are。不能仅凭无人机在机库里，就推出 I have three drones.；这句话在本课语境中说的是我拥有三架，需要另外知道归属。have还可以表达其他关系，但不把本句写成There have + 名词。',checks:['用There are three drones in the hangar.表达给定数量和地点，没有用There have或There is three。','指出地点信息不能证明无人机归我所有，需另外有归属信息。']},
  {kind:'choice',skill:'换到补给站：问有没有，再表达没有',title:'哪组英语准确表达了这两句话？',context:'第一句问：补给站里有没有水（water）？第二句说：补给站里没有任何头盔（helmet）。按本课完整、规范的表达选择。',options:["Is there any water at the station? / There aren't any helmets at the station.","Are there any water at the station? / There aren't any helmets at the station.","Is there any water at the station? / There isn't any helmets at the station."],answer:0,hint:'water在这里不可数，配is；helmets是复数，配are。提问把is/are放到there前；否定在is/are后加not。',explanation:'选A。问水的有无：Is there any water…? water是不可数名词；说没有头盔：There aren’t any helmets…，helmets是复数。若说There are no helmets…也可以；不是所有中文“有”或“没有”都机械对应have。'},
  {kind:'open',skill:'先开口：用新场景给队友介绍补给站',title:'用自己的英语说3句：这里有什么、你有什么、还想问什么？',context:'补给站里有两把椅子；你有一个头盔；你想问站里有没有水。请先大声说，再留下刚才的3句英语原话（chair椅子，helmet头盔，station站）。不用添加没有给出的物资。这里不录音、不自动评价发音。',hint:'介绍地点中的东西，想想There…；说自己拥有的物品，从I…开始；问水的有无，想想Is there…?。',reference:'一种说法：There are two chairs at the station. I have a helmet. Is there any water at the station? 用in the station描述站内也可以；拥有的表达也可用I have got a helmet.。检查语义、单复数和问句语序，不必逐字照搬。说“站里有头盔”不能替代“我有头盔”这条信息。',checks:['介绍两把椅子位于站内/站点，用There are two chairs…，数量与地点对应。','清楚表达自己有一个头盔，如I have a helmet.，没有把位置当作归属。','问水的有无，如Is there any water…?；先开口后记录，文字自检不证明发音或流利度。']}
 ];
 root.HangarLesson={title,story,words,tokens,bank,questions,view,validOrder,checkOrder,sentence};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.HangarLesson;
})(typeof window!=='undefined'?window:globalThis);
