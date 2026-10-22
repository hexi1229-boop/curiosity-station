/* Original teaching passages. Open responses are retained, never keyword-scored. */
(function(root){
  'use strict';
  const library={title:'雨后的借书角',lines:[
    '午休时，小禾发现借书角的《星空地图》有几页潮了。',
    '她把书轻轻摊开，用纸巾吸去水分，又立起“请轻翻”的小卡片。',
    '同桌招手说：“快来，球赛要开始了！”小禾看了看书，摇摇头：“等它干一点。”',
    '第二天，书页干了，小禾把书放回原处。',
    '值日生说：“昨天窗边飘进了雨，把靠窗的几本书都打湿了。”'
  ]};
  const balls={title:'借球的新办法',lines:[
    '班级试用了“提前预约借球”。记录的四天里，平均排队时间由试用前的 10 分钟缩短为 6 分钟。',
    '这四天恰逢雨天，每天来借球的人数也比试用前少。',
    '小安说：“看来，排队变快一定全是预约制度的功劳！”'
  ]};
  const bridge={title:'还没贴上的彩纸',lines:[
    '科学节布展前，小宇试了三次纸桥，桥每次都在中间弯下去。',
    '同伴递来彩纸：“先把桥装饰漂亮吧。”小宇说：“先等等，桥还没撑住小车呢。”',
    '他把桥面折成折扇形，再放上小车测试。这一次，纸桥托住了小车，他才接过彩纸。'
  ]};
  const questions=[
    {kind:'choice',skill:'自己找依据',title:'哪句话直接写出了小禾暂时不去球赛的原因？',passage:library,options:[library.lines[1],library.lines[2],library.lines[3]],labels:['②','③','④'],answer:1,hint:'题目问的是“不去球赛的原因”。找一找她回应同桌时说了什么。',explanation:'选③。她回应“球赛要开始了”时说“等它干一点”，直接交代了暂时不去的原因：想等书页干一点。②写照看书的动作，④写第二天的结果。'},
    {kind:'evidence',skill:'把理由接起来',title:'“小禾爱护图书。”选一个细节，说说它怎样支持这个判断。',passage:library,hint:'可以从②里的动作挑一个细节。别只抄句子，再说一句：这个动作说明她怎样对待书。',reference:'一种说法：她轻轻摊开湿书，还立起“请轻翻”的卡片，说明她担心书被弄坏、想保护它，因此可以看出她爱护图书。也可以用③等待书页变干等细节说明；依据和解释能对应即可。',checks:['我选了文中确实出现的细节。','我解释了这个细节怎样体现爱护图书。']},
    {kind:'choice',skill:'找错并改正',title:'“小禾一直摆弄湿书，所以书一定是她弄湿的。”怎样改才有依据？',passage:library,options:['改成“可能是她”，因为看见她碰过湿书就足够怀疑她。','改成“书是同桌弄湿的”，因为同桌急着叫她离开。','改成“文中写她照看湿书，但这个行为不能证明是她弄湿的”。'],answer:2,hint:'照看已经湿了的书，和把书弄湿，是同一件事吗？⑤还提供了什么信息？',explanation:'选第三种。接触或照看湿书，不能证明弄湿书的原因。⑤还提供了雨打湿靠窗书本的信息。判断要有对应依据，不能把“碰过”直接变成“造成了”。'},
    {kind:'choice',skill:'换篇材料再判断',title:'只根据这份记录，哪句话最稳妥？',passage:balls,options:['预约制度一定能让每一天的排队时间缩短 4 分钟。','这四天平均排队时间缩短了，但还不能确定全是预约制度的作用。','这四天的平均排队时间没有变化，因为借球人数少了。'],answer:1,hint:'把“看到了什么”和“为什么发生”分开。除了制度，还有哪个条件也变了？',explanation:'选第二种。记录支持“这四天平均排队时间缩短”，但人数也减少了，不能单凭这些记录确定全是预约制度的作用，更不能保证以后每天都少等 4 分钟。'},
    {kind:'writing',skill:'独立组织短答案',title:'你觉得小宇做事有什么特点？用文中的一个细节说明理由。',passage:bridge,hint:'用你自己的判断开头，找一个细节，再说清两者的联系。特点不必只有一种。',reference:'例如：小宇做事认真，重视实际效果。纸桥还撑不住小车时，他没有先装饰，而是修改桥面并再次测试，说明他先解决问题再考虑外观。也可以从“不轻易放弃”“愿意改进”等角度作答，只要细节与判断对应。',checks:['我明确回答了“小宇有什么特点”。','我用了这篇短文中的具体细节。','我说清了细节与这个特点的联系。']}
  ];
  questions.forEach(q=>q.context=q.passage.title+'：'+q.passage.lines.map((line,i)=>(i+1)+'. '+line).join(' '));
  root.ReadingLesson={title:'这句话能证明你的答案吗？',questions};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ReadingLesson;
})(typeof window!=='undefined'?window:globalThis);
