/* Original picnic task: the counted unit and the substance are different. */
(function(root){
  'use strict';
  const title='两瓶水，英语里究竟在数什么？';
  const story='For our picnic, pack two bottles of water and three apples. We need some bread, too.';
  const words=[{word:'pack',meaning:'把东西装好',example:'pack a bag'},{word:'bottle',meaning:'瓶；瓶子',example:'one bottle → two bottles'},{word:'bread',meaning:'面包（本课作食物名）',example:'some bread'},{word:'slice',meaning:'薄片；一片',example:'a slice of bread'},{word:'cup',meaning:'杯；杯子',example:'one cup → two cups'},{word:'milk',meaning:'牛奶（本课作饮品名）',example:'some milk'}];
  const counts=[1,2,4],numberWords=['one','two','four'];
  function view(index){
    if(!Number.isInteger(index)||index<0||index>=counts.length)throw new Error('Invalid bottle arrangement');
    const count=counts[index],perBottle=1000/count;
    return {index,count,perBottle,total:1000,sentence:numberWords[index]+' '+(count===1?'bottle':'bottles')+' of water',parts:[numberWords[index]+' ',count===1?'bottle':'bottles',' of ','water'],question:'How many bottles of water are there?',amountQuestion:'How much water is there?'};
  }
  const tokens=['I need','two','bottles','of','water','.','bottle','waters'],bank=[4,6,1,7,3,0,5,2];
  function validOrder(ids){return Array.isArray(ids)&&ids.length<=6&&new Set(ids).size===ids.length&&ids.every(i=>Number.isInteger(i)&&i>=0&&i<tokens.length);}
  function checkOrder(ids){if(!validOrder(ids)||ids.length!==6)return null;return ids.every((n,i)=>n===i);}
  function sentence(ids){if(!validOrder(ids))throw new Error('Invalid supply sentence');return ids.map(i=>tokens[i]).join(' ').replace(/\s+\./g,'.');}
  const questions=[
    {kind:'choice',skill:'先听一份清单，分清数了什么',title:'哪一份清单与这段英语一致？',context:story,options:['两瓶水、三个苹果，以及一些面包；面包片数没有说明。','两瓶水、三个苹果、恰好三片面包。','两瓶水、三个面包，以及一些苹果。'],answer:0,hint:'two bottles of water、three apples 各自数的是什么？some bread 有说具体几片吗？',explanation:'选A。two bottles of water 数两瓶水；three apples 数三个完整苹果；some bread 没有给出片数。apple 这样表示完整水果时可直接数；water、bread 在这里作物质或食物名，通常不直接跟数字组成复数。瓶、杯、片等单位可以帮助说清数量。'},
    {kind:'order',skill:'动手组句，复数到底落在哪个词上',title:'把“我需要两瓶水”组成一句英语。',context:'用6块词牌拼出 I need 开头的完整句子；有2块多余。这里写完整物资说明，不使用点餐时的简略说法。',hint:'数字two后面数的是瓶子。瓶子用复数；of 后说明瓶子里是什么。',explanation:'I need two bottles of water. two 后用 bottles，water 在这里表示水这种物质，不加复数词尾。注意不是 two bottle，也不是在完整单位表达里写 bottles of waters。'},
    {kind:'open',skill:'改错，还要解释你在数什么',title:'桌上是三片面包。“I need three bread.” 怎么改？',context:'桌上明确是从一条面包切下的三片，想要的就是这三片，不是三整条。改成完整英语句子，再用中文或英文解释复数落在哪里。',hint:'“片”用 slice。数的是几片，面包这个食物名仍是 bread。',reference:'I need three slices of bread. three 后的 slices 表示三片，bread 仍是食物名，不写 breads。“I need some bread.” 可以表达想要面包，但丢掉了本题“三片”的具体要求；three loaves 则变成三条，也不符合图片。',checks:['完整句子表达三片面包，例如 I need three slices of bread.，不改成三整条或不确定的量。','说明数字直接修饰 slices；bread 在这个语境中不用复数词尾。']},
    {kind:'choice',skill:'换到牛奶，区分问总量与问杯数',title:'先问“需要多少牛奶”，再问“需要几杯牛奶”，哪组问法对应得上？',context:'milk 是牛奶，cup 是杯子。第一问关注饮品总量，第二问明确按杯来数。',options:['How many milk do we need? / How many cups of milk do we need?','How much milk do we need? / How much cups of milk do we need?','How much milk do we need? / How many cups of milk do we need?'],answer:2,hint:'先找问题在数哪个词：直接问milk，还是问cups？不要只因两句都提牛奶就用同一个词。',explanation:'选C。问milk这种饮品的量用 How much milk；数cups用 How many cups of milk。much与many取决于正在询问的名词或单位，不是看现实中能不能测量它。'},
    {kind:'open',skill:'先开口，再把新清单说给同伴',title:'换一份点心清单，你能用自己的英语说清吗？',context:'清单：2杯牛奶、3根完整香蕉（banana）。先用英语向同伴说出需要的两样东西，再问还需要多少面包（不指定片数）；共2–3句。留下刚才的英语原话，可在同一句中用and连接。这里不录音、不自动评价发音。',hint:'请求可从 I need… / We need… 开始。先找你在数cups还是bananas；问bread的量时，想想是How much还是How many。',reference:'一种说法：We need two cups of milk and three bananas. How much bread do we need? 也可拆成三句，或用 I need / Can we have 等合适表达。cups、bananas是复数；milk、bread在这里不加复数词尾。不要把some milk当作已经说明两杯。',checks:['自己的英语表达两杯牛奶和三根香蕉，单位、数量与单复数对应；表达方式不必和示范相同。','询问面包的量，可用 How much bread do we need?；先开口再记录，文字自检不证明发音或流利度。']}
  ];
  root.SuppliesLesson={title,story,words,counts,tokens,bank,questions,view,validOrder,checkOrder,sentence};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SuppliesLesson;
})(typeof window!=='undefined'?window:globalThis);
