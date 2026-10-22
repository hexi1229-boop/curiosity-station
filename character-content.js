/* Original literary miniatures. Character interpretations need contextual evidence. */
(function(root){
  'use strict';
  const title='手在发抖，就一定胆小吗？';
  const stage={title:'临时接过的讲稿',lines:['科技节展示前，小周嗓子哑了，没法按计划介绍小组做的模型车。','林禾捏着讲稿，纸边随着她的手轻轻发抖。','老师问谁愿意接替。林禾举起手：“我来试试。小周，帮我翻演示图好吗？”她走上前，照着图把制作过程讲完了。','模型车是蓝色的，墙上的时钟有一个白色外框。']};
  const silence={title:'暂时只有这一句话',lines:['小组讨论要不要改变活动路线。阿宁坐在窗边，一声不吭。','材料到这里就结束了，没有交代沉默的原因，也没有写他之后的行动。']};
  const poster={title:'重新画过的海报',lines:['学习小组准备一张介绍校园鸟类的海报。唐宁连夜画好，组员说可以直接交了。','小安指着图说：“这里把麻雀画得比喜鹊大，会让人误会吧？”','唐宁皱皱眉，刚想说“我画了很久”，又把话咽回去：“你说得对，我们找图核实一下。”','核对后，她擦掉那部分重画。交稿时，她特地说明：“大小关系是小安帮我发现问题后改的。”']};
  const cards=[
    {text:'纸边随着林禾的手轻轻发抖。',keep:true},
    {text:'小周嗓子哑了，不能按计划介绍。',keep:false},
    {text:'墙上时钟的外框是白色的。',keep:false},
    {text:'林禾主动举手接替，请同伴帮忙翻图，并走上前把制作过程讲完。',keep:true},
    {text:'小组的模型车是蓝色的。',keep:false}
  ];
  function validCards(ids){return Array.isArray(ids)&&ids.length<=cards.length&&new Set(ids).size===ids.length&&Array.from(ids).every(i=>Number.isInteger(i)&&i>=0&&i<cards.length);}
  function checkCards(ids){if(!validCards(ids)||ids.length!==2)return null;return ids.every(i=>cards[i].keep);}
  function cardAnswer(ids){if(!validCards(ids))throw new Error('Invalid evidence cards');const list=ids.slice().sort((a,b)=>a-b);return '选作直接依据：'+list.map(i=>`${i+1}. ${cards[i].text.replace(/。$/,'')}`).join('；')+'。其余卡：'+cards.map((_,i)=>i).filter(i=>!list.includes(i)).map(i=>`${i+1}. ${cards[i].text.replace(/。$/,'')}`).join('；')+'。';}
  const lenses=[
    {label:'她当时的反应',quote:stage.lines[1],type:'动作细节',inference:'结合临时上台的情境，发抖的手暗示她此刻紧张。'},
    {label:'她接下来怎样做',quote:stage.lines[2],type:'语言与行动',inference:'遇到组员不能讲解，她主动接替、借助合作完成任务，表现出担当。'}
  ];
  const conclusions=[
    {heading:'还没有接上具体依据',claim:'先点亮一处证据，再看它能支持什么。',boundary:'“她很好”只是评价，还没有告诉读者为什么。'},
    {heading:'看见了情绪，还没看完选择',claim:'她此刻可能紧张；仅凭发抖，还不能断定她胆小退缩。',boundary:'身体反应要放回情境中理解。发抖也可能有其他原因，不能单独当作性格标签。'},
    {heading:'看见了担当，不代表她毫不害怕',claim:'她主动接替并完成介绍，表现出担当。',boundary:'这组行动能支持担当，却不能证明她内心一点也不紧张。'},
    {heading:'把两处证据连起来',claim:'林禾虽紧张，仍愿意承担任务：她的手在发抖，却主动举手接替并讲完。这说明她在压力下仍选择把小组的事做好。',boundary:'这是她在这一幕中的表现。不能扩大成“她从不害怕、任何时候都能成功”。'}
  ];
  function lensState(mask){if(!Number.isInteger(mask)||mask<0||mask>3)throw new Error('Invalid evidence lens');return {...conclusions[mask],selected:[0,1].filter(i=>mask&(1<<i))};}
  const questions=[
    {kind:'choice',skill:'先读整段，再判断人物',title:'哪一种分析最贴合这一幕中的林禾？',passage:stage,options:['她的手在发抖，说明她遇到任务只会退缩。','她虽然紧张，仍主动承担了介绍任务。','她把介绍讲完了，说明她从来不会害怕。'],answer:1,hint:'把“手的反应”和“后来怎样做”放在一起看。哪一种判断没有漏掉信息，也没有扩大到“从来”？',explanation:'第二种更贴合。发抖的手暗示当时紧张；主动接替并讲完，则体现她愿意承担任务。两者可以同时存在。“只会退缩”忽略后续行动，“从来不会害怕”超出了材料。'},
    {kind:'cards',skill:'挑出能同时支撑两面的证据',title:'选哪2张卡，能直接支持“她紧张，却仍有担当”？',passage:stage,task:'分别为“紧张”和“仍承担任务”找直接依据。背景有助于理解情境，但这次要选林禾本人的反应与行动。',hint:'一张说明她当时的反应；另一张说明她面对任务作出的选择。小周的困难是背景，本身还不能说明林禾采取了什么行动。',explanation:'选①和④。手在发抖支持此刻紧张；主动接替并讲完支持担当。小周嗓子哑帮助理解她为何需要接替，但不是林禾本人的反应或行动。车和时钟的颜色不能直接支撑这个判断。'},
    {kind:'open',skill:'解释表面上的矛盾',title:'“既然她勇于承担任务，为什么还要写她的手发抖？”',passage:stage,task:'用1–2句话说明：这两处是否矛盾？“手发抖”让你对她的表现多理解了什么？',label:'留下自己的解释',hint:'勇于承担是否等于毫不紧张？如果删掉发抖的手，读者还能同样清楚地看到她面临的心理压力吗？',reference:'例如：不矛盾。手发抖暗示她临时上台时紧张，主动接替并讲完说明她没有因紧张而退缩。这个细节让读者看见她克服压力的过程，人物也更真实。也可说“有了发抖的描写，更能体会她愿意承担任务的不容易”。只说“生动形象”还不够，要说明具体看见了什么。',checks:['区分此刻的紧张与面对任务的选择，不把勇于承担解释成从不害怕。','联系发抖和主动接替两处，说明细节怎样帮助理解人物；不只写通用套话。']},
    {kind:'choice',skill:'换情境，知道什么时候证据还不够',title:'仅凭这段材料，可以确定阿宁有什么性格吗？',passage:silence,options:['他一声不吭，足以说明他不关心小组。','他一声不吭，足以说明他一直谨慎善思。','目前不能确定，还需要沉默的原因或前后行动。'],answer:2,hint:'不说话可能有不同原因。材料有没有写出他在想什么，或随后作出的选择？',explanation:'第三种更稳妥。沉默可以和思考、紧张、不赞成等多种情况有关。缺少原因与前后行动时，不能硬贴冷漠或谨慎的标签。分析人物要允许“这段证据还不够”。'},
    {kind:'open',skill:'独立分析一个新人物',title:'唐宁在这件事中表现出什么特点？请用两个细节支持你的看法。',passage:poster,task:'选一个你能说清的特点，用2–3句话写出具体依据和它们为什么支持这个特点。合理的不同看法都可以，不必把人物夸成完美。',label:'特点＋两处具体细节＋你的解释',hint:'她听到不同意见后说了什么、怎样改图、交稿时又怎样介绍？挑与自己的判断有关的细节，别只重复“她很好”。',reference:'例如：唐宁能听取意见、对作品负责。她没有坚持“我画了很久就不能改”，而是提出找图核实；发现问题后又擦掉重画，说明她愿意根据事实改进作品。也可分析她尊重同伴贡献：她接受小安的提醒并一起核实，交稿时又主动说明小安的帮助。允许其他有据可解释的看法；皱眉不等于始终固执，连夜作画也不能证明她每次都完美。',checks:['特点与这件事吻合，不把一次表现扩大为永远如此。','至少联系两处具体语言或行动，而不只是抄两句话。','解释细节与特点的关系；不同说法有依据即可，不用照抄示范。']}
  ];
  questions.forEach(q=>q.context=q.passage.title+'：'+q.passage.lines.map((line,i)=>(i+1)+'. '+line).join(' '));
  root.CharacterLesson={title,stage,silence,poster,cards,lenses,questions,validCards,checkCards,cardAnswer,lensState};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.CharacterLesson;
})(typeof window!=='undefined'?window:globalThis);
