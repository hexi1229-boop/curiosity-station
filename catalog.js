/* Course discovery metadata; stable lesson URLs and evidence stay in LearningFeedback. */
(function(root){
  'use strict';
  const items=[
    {id:'repair',name:'错题修复站',subject:'数学 · 语文 · 英语',subjects:['数学','语文','英语'],group:'school',stages:['六年级','初中衔接'],tags:['错题修复','倒数','工程问题','工作量','单位','多音字','词块','课文顺序','字形','悬','悬停','名句','比喻','排比','分条表达','句式','标点','语境','阅读','动作描写'],description:'按薄弱点选择讲解与对应练习；9个讲解、10道变式可分次选，之前的答案与草稿都保留。',icon:'修复',time:'按需复习 · 可分次',format:'repair',sessionIds:['repair','repair-words']},
    {id:'baicao',name:'共读《从百草园到三味书屋》：小园子里，藏着多少趣味？',readingTitle:'从百草园到三味书屋',subject:'语文',group:'school',stages:['六年级','初中衔接','七年级'],tags:['共读课','鲁迅','百草园','三味书屋','词汇','句式','拟人','比喻','动作描写','阅读','北大'],description:'从北大游览认识鲁迅，读绍兴童年的草木、虫声和书屋。全文可分两次，点读词句、品句式和人物，不安排练笔。',icon:'共读',time:'可分两次 · 每次10—15分钟',format:'readalong',tasks:1,fresh:true},
    {id:'beiying',readingTitle:'背影',name:'共读《背影》：那个背影，为什么留在记忆里？',subject:'语文',group:'school',stages:['六年级','初中衔接','七年级','八年级'],tags:['共读课','朱自清','背影','散文','词汇','动作描写','叙述视角','语气','阅读'],description:'完整读一篇经典，挑一处聊动作、语气与前后看法；带走一句或一个疑问，阅读位置与便笺自动留存。',icon:'共读',time:'15—20分钟 · 可分次',format:'readalong',tasks:1,fresh:true},
    {id:'weighted',name:'两组平均数都有了，为什么不能再除以2？',subject:'数学',group:'school',stages:['六年级','初中衔接','七年级'],tags:['平均数','加权平均','总量','份数','统计','平均速度','逆推'],description:'改人数，看整体均值怎样移动；换成时间检验平均速度，最后从总量差额还原未知试飞次数。',icon:'总/份',time:'12–18 分钟',fresh:true},
    {id:'focus',name:'写了一堆好事，为什么还是没扣住题？',subject:'语文',group:'school',stages:['六年级','初中衔接','七年级'],tags:['读写工坊','作文','词汇','句式','扣题','详略','照应','尊重'],description:'共读《留给他的半分钟》，品三个动词、比较场景详略，再到球场写自己的片段，留住初稿与修改。',icon:'读·写',time:'约15分钟 · 可分次',format:'workshop',tasks:1,fresh:true},
    {id:'fairtest',name:'只改一个条件，结论就一定可信吗？',subject:'物理',group:'school',stages:['初中衔接','八年级'],tags:['实验设计','控制变量','测量','重复','证据','化学','生物'],description:'从试降报告找测量缺口，拖出完整记录看波动，最后自己修一份保温比较方案。',icon:'测·证',time:'12–15 分钟',fresh:true},
    {id:'briefing',name:'任务单收起来，你能给队友讲清楚吗？',subject:'英语',group:'school',stages:['六年级','初中衔接','七年级'],tags:['口语','听力','转述','词块','任务沟通','澄清','通知'],description:'听原创任务音频，收起任务单自己说；再处理变更、追问缺口，用新出行表格独立回复队友。',icon:'Say it',time:'12–15 分钟',fresh:true},
    {id:'causal',name:'这句话是在讲原因，还是只说现象？',subject:'语文',group:'school',stages:['六年级','初中衔接','七年级'],tags:['原因','现象','因果','证据','说明性阅读','结论范围'],description:'读模型车日志，拼运输证据，再独立审查一份有对照组却仍归因过头的报道。',icon:'因·果',time:'12–15 分钟',fresh:true},
    {id:'discount',name:'打折再加运费，为什么不能一起乘？',subject:'数学',group:'school',stages:['六年级','初中衔接','七年级'],tags:['百分数','基数','整体','折扣','费用','配方','单位1'],description:'先留判断，再拖动优惠范围看哪笔钱被打折；换规则与配方表，自己认清整体和部分。',icon:'80%',time:'10–15 分钟',fresh:true},
    {id:'buoyancy',name:'钢会沉，钢造的轮船为什么能浮？',subject:'科学',group:'explore',stages:['六年级','初中衔接','八年级'],tags:['轮船','浮力','排水量','密度','总质量','潜水器','控制变量'],description:'同一团黏土换船形、加货物，看水线与排水读数一起变化，再用设备卡决定潜水器怎样留在水中。',icon:'船·浮',time:'约 8–12 分钟',tasks:3,fresh:true},
    {id:'glacier',name:'冰河时代调查局：这片没有冰的山谷，曾经有冰川吗？',subject:'科学',group:'explore',stages:['六年级','初中衔接'],tags:['冰河时代','冰川','地貌','证据','科学推理','地理'],description:'先判断山谷，再让冰携带碎石走一遍；最后换地点查档案，看相似痕迹是否来自同一过程。',icon:'冰·证',time:'约 8–10 分钟',tasks:3,fresh:true},
    {id:'parachute',name:'降落伞越大，就一定越好吗？',subject:'科学',group:'explore',stages:['六年级','初中衔接'],tags:['降落伞','空气阻力','控制变量','工程设计','权衡','月球'],description:'亲手选伞、看落点，再接一份月球任务。用证据决定，而不只追求更大。',icon:'↘',time:'约 8–10 分钟',tasks:3},
    {id:'addition',name:'加上一个数，结果一定变大吗？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['有理数','加法','正负数','绝对值','相反数','分数','交换律','路程'],description:'让正负计分片配对，分清剩余的符号，再解释机器人回到原点为什么仍走了路。',icon:'＋/−',time:'8–12 分钟',fresh:true},
    {id:'elements',name:'只有一种元素，就一定是纯净物吗？',subject:'化学',group:'school',stages:['初中衔接','九年级'],tags:['元素','单质','化合物','物质分类','质子数','化学式','纯净物','混合物'],description:'切换氧气、臭氧和水的样品，分开数元素与物质，再给新的碳氧样品分类。',icon:'O₂/O₃',time:'8–12 分钟'},
    {id:'pressure',name:'大脚板，为什么不容易陷下去？',subject:'物理',group:'school',stages:['初中衔接','八年级'],tags:['压强','压力','受力面积','帕','单位换算','控制变量','生活应用'],description:'改变压力和接触格数，比较每份面积承担多少，再解释雪地靴与窄刃口的不同设计。',icon:'F/S',time:'8–12 分钟'},
    {id:'character',name:'手在发抖，就一定胆小吗？',subject:'语文',group:'school',stages:['初中衔接','七年级'],tags:['人物分析','文学阅读','动作描写','语言描写','证据','情境'],description:'切换人物证据透镜，分清一时情绪与面对任务的选择，再独立分析新的海报故事。',icon:'人·证',time:'8–12 分钟'},
    {id:'hangar',name:'机库里有，就代表我有吗？',subject:'英语',group:'school',stages:['初中衔接','七年级'],tags:['there be','have','has','存现句','单复数','听力','口语','词汇'],description:'移动无人机、切换归属，看清位置与拥有，再用英语介绍一个新的补给站。',icon:'有？',time:'8–12 分钟'},
    {id:'photosynthesis',name:'植物的糖，是从土里吸来的吗？',subject:'生物',group:'school',stages:['初中衔接','七年级'],tags:['光合作用','原料','产物','叶绿体','能量','有机物','水培'],description:'切换光照与原料，比较土培和水培，再辨清叶片中的淀粉是原来就有，还是现在新造。',icon:'光→糖',time:'8–12 分钟'},
    {id:'quotient',name:'分装小站：除法到底在找什么？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['有理数','除法','倒数','分数','零','反例','逆运算'],description:'分装6升水，用乘法检查商，辨清负号和0，再反求潜水器到达目标的时间。',icon:'÷',time:'8–12 分钟'},
    {id:'daynight',name:'太阳没关灯，为什么天黑了？',subject:'地理',group:'school',stages:['初中衔接','七年级'],tags:['地球自转','昼夜更替','方向','周期','日出','日落','视角'],description:'跟着赤道上的点转过一天，排出昼夜顺序，再换光照与观察方向重新判断。',icon:'昼/夜',time:'8–12 分钟'},
    {id:'inertia',name:'车停了，人为什么还往前？',subject:'物理',group:'school',stages:['初中衔接','八年级'],tags:['惯性','牛顿第一定律','质量','阻力','运动状态','科学推理'],description:'切换初始状态与阻力，拖动时间看运动，再预测小车上释放的小球落在哪里。',icon:'v→',time:'8–12 分钟'},
    {id:'purity',name:'看起来一样，就是纯净物吗？',subject:'化学',group:'school',stages:['初中衔接','九年级'],tags:['纯净物','混合物','物质分类','成分','分子','过滤'],description:'改变蔗糖量、重新排列分子，区分外观与成分，再判断冰水和过滤后的样品。',icon:'1/多',time:'8–12 分钟'},
    {id:'supplies',name:'两瓶水，英语里究竟在数什么？',subject:'英语',group:'school',stages:['初中衔接','七年级'],tags:['可数名词','不可数名词','单复数','单位','much','many','口语'],description:'同样的水换装不同瓶数，听清物资清单，再用英语把新清单说准确。',icon:'2瓶',time:'8–12 分钟'},
    {id:'qualifier',name:'一个“约”字，为什么不能随便删？',subject:'语文',group:'school',stages:['初中衔接','七年级'],tags:['词语作用','限定词','准确表达','阅读理解','条件','改写'],description:'在编辑台改词对照，分清精确程度、对象和条件，再独立修好一份试飞说明。',icon:'约',time:'8–12 分钟'},
    {id:'power',name:'3⁴是12吗？把乘方拆开看',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['有理数','乘方','底数','指数','括号','幂'],description:'展开因子卡，看清负号是否属于底数，再破解探测器复制游戏。',icon:'aⁿ',time:'8–12 分钟'},
    {id:'division',name:'细胞变多了，分工就会自动出现吗？',subject:'生物',group:'school',stages:['初中衔接','七年级'],tags:['细胞','生长','分裂','分化','组织','遗传信息'],description:'切换细胞变化模型，区分变大、变多和分工，再解释一份新的培养记录。',icon:'1→2',time:'8–12 分钟'},
    {id:'grid',name:'只差一个字母，地点能跑到哪儿？',subject:'地理',group:'school',stages:['初中衔接','七年级'],tags:['经纬网','纬度','经度','定位','赤道','方向'],description:'拖动探测点，分清N/S和E/W，再到一张新的局部图中寻找站点。',icon:'N/E',time:'8–12 分钟'},
    {id:'forces',name:'两个力一样大，就会互相抵消吗？',subject:'物理',group:'school',stages:['初中衔接','八年级'],tags:['力','受力对象','相互作用','二力平衡','合力','运动状态'],description:'把力按受力者分组，调节拉力，再解释书与无人机怎样平衡。',icon:'⇄',time:'8–12 分钟'},
    {id:'multiply',name:'负数乘负数，为什么是正数？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['有理数','乘法','分配律','负数','小数','零'],description:'改变两个因子，用分配律推理，再把负号放回潜水器的时间与方向。',icon:'×',time:'8–12 分钟'},
    {id:'particle',name:'水蒸发了，分子也变大了吗？',subject:'化学',group:'school',stages:['初中衔接','九年级'],tags:['分子','微观粒子','蒸发','凝结','状态变化','数量范围'],description:'拖动水分子模型，分清大小与间隔，再解释密闭和敞口情境。',icon:'H₂O',time:'8–12 分钟'},
    {id:'gist',name:'一句话说清整件事',subject:'语文',group:'school',stages:['初中衔接','七年级'],tags:['概括','主要信息','取舍','阅读理解','表达','短消息'],description:'点选信息卡，留下关键行动与结果，再换一篇材料独立概括。',icon:'摘',time:'8–12 分钟'},
    {id:'past',name:'昨天的试飞，怎么用英语讲清楚？',subject:'英语',group:'school',stages:['初中衔接','七年级'],tags:['一般过去时','did','口语','词汇','听读','语序'],description:'听试飞记录，重排问句词牌，再用英语讲清昨天做过和没做的事。',icon:'did',time:'8–12 分钟'},
    {id:'subtract',name:'减去负数，为什么反而变大？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['有理数','减法','负数','相反数','数轴','变化'],description:'切换求差与加相反数两种数轴表示，看清变大不等于变成正数。',icon:'−(−)',time:'8–12 分钟'},
    {id:'cell',name:'没有叶绿体，就不是植物细胞吗？',subject:'生物',group:'school',stages:['初中衔接','七年级'],tags:['细胞','细胞壁','细胞膜','细胞核','叶绿体','结构与功能'],description:'切换三种细胞样本，找到共同结构，再用证据解释差异。',icon:'◉',time:'8–12 分钟'},
    {id:'contour',name:'两条上山路，哪条更陡？',subject:'地理',group:'school',stages:['初中衔接','七年级'],tags:['等高线','等高距','海拔','相对高度','比例尺','陡缓'],description:'联动等高线和侧面图，用升高的高度与水平距离解释陡缓。',icon:'△',time:'8–12 分钟'},
    {id:'density',name:'更重的积木，材料就更“密”吗？',subject:'物理',group:'school',stages:['初中衔接','八年级'],tags:['密度','质量','体积','比值','材料'],description:'把两块材料调成相同体积，看清总质量与每单位体积质量的区别。',icon:'ρ',time:'8–12 分钟'},
    {id:'negative',name:'零下8℃和零下3℃，哪里更暖？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['负数','数轴','绝对值','相反数','比较'],description:'调节温度计与数轴，分清数更大和离零更远，再迁移到海面下的位置。',icon:'−3',time:'8–12 分钟'},
    {id:'now',name:'平时常做，还是此刻正在做？',subject:'英语',group:'school',stages:['六年级','初中衔接','七年级'],tags:['一般现在时','现在进行时','语法','口语','词汇','习惯'],description:'切换日常周历与此刻镜头，再用英语说出自己的习惯和正在做的事。',icon:'am',time:'8–12 分钟'},
    {id:'tomato',name:'一颗番茄，是组织还是器官？',subject:'生物',group:'school',stages:['初中衔接','七年级'],tags:['结构层次','细胞','组织','器官','系统','植物'],description:'从整株番茄看到一个细胞，亲手排列层次，再用组成和功能说明理由。',icon:'◎',time:'8–12 分钟'},
    {id:'change',name:'冒泡了，就一定发生化学变化吗？',subject:'化学',group:'school',stages:['初中衔接','九年级'],tags:['物理变化','化学变化','新物质','分子','原子','证据'],description:'比较沸腾与电解，区分眼前的现象和判断变化的证据。',icon:'H₂O',time:'8–12 分钟'},
    {id:'map',name:'地图转了，北方也会跟着转吗？',subject:'地理',group:'school',stages:['初中衔接','七年级'],tags:['地图判读','方向','指向标','参照点','比例尺','路线'],description:'转动一张地图，找准方向，再用自己的话给朋友指路。',icon:'N↗',time:'8–12 分钟'},
    {id:'speed',name:'跑得远，就一定更快吗？',subject:'物理',group:'school',stages:['初中衔接','八年级'],tags:['平均速度','路程','时间','单位换算','运动'],description:'改变用时，比较同样时间里的路程，再看途中停留怎样影响平均速度。',icon:'m/s',time:'8–12 分钟'},
    {id:'equation',name:'神秘货箱有多重？',subject:'数学',group:'school',stages:['初中衔接','七年级'],tags:['一元一次方程','等式','天秤','移项','检验'],description:'亲手改变天秤两边，看清解方程的每一步为什么成立。',icon:'x＝?',time:'8–12 分钟'},
    {id:'reading',name:'这句话能证明你的答案吗？',subject:'语文',group:'school',stages:['六年级','初中衔接'],tags:['阅读理解','依据','推断','分点回答'],description:'从短文里找依据，把“我觉得”说得有根有据。',icon:'证',time:'8–12 分钟'},
    {id:'english',name:'你会选一只机器狗吗？',subject:'英语',group:'school',stages:['六年级','初中衔接'],tags:['口语','词汇','听力','表达'],description:'听懂一个想法，用英语说出自己的选择和理由。',icon:'Aa',time:'8–10 分钟'},
    {id:'math',name:'圆，遇上正方形',subject:'数学',group:'school',stages:['六年级'],tags:['圆','周长','面积','组合图形','内切','外接'],description:'分清周长与面积，看懂圆与正方形套在一起怎么算。',icon:'◎',time:'8–12 分钟'},
    {id:'scale',name:'造一枚迷你火箭',subject:'数学',group:'school',stages:['六年级','初中衔接'],tags:['比例尺','单位换算','缩放'],description:'把 20 米的原型，变成放得进盒子的模型。',icon:'1∶n',time:'8–10 分钟'},
    {id:'chinese',name:'换个角度，说清楚',subject:'语文',group:'school',stages:['六年级'],tags:['句式转换','转述句','人称'],description:'转述别人的话，改对人称，也把原意保留下来。',icon:'“ ”',time:'8–10 分钟'},
    {id:'balance',name:'9 个果子，只称 2 次？',subject:'数学',group:'school',stages:['六年级','初中衔接'],tags:['天秤','排除','推理','信息'],description:'亲手称出更重的那个，说清为什么两次一定够。',icon:'⚖',time:'8–10 分钟'},
    {id:'charts',name:'两张图都没造假，为什么结论相反？',subject:'数学',group:'explore',stages:['六年级','初中衔接'],tags:['统计图','坐标轴','数据','百分比'],description:'先判断，再拖动坐标轴，看看数字怎样影响印象。',icon:'▥',time:'8–10 分钟'},
    {id:'rocket',name:'火箭为什么要回收？',subject:'科学',group:'explore',stages:['六年级','初中衔接'],tags:['火箭','回收','成本','决策','太空'],description:'看一级助推器回来，再算算什么时候更划算。',icon:'↗',time:'8–10 分钟'}
  ];
  function latest(sessions){const byCourse={};for(const s of [...sessions].sort((a,b)=>b.updatedAt-a.updatedAt))if(!byCourse[s.courseId])byCourse[s.courseId]=s;return byCourse;}
  function select({group='all',subject='all',stage='all',query=''}={}){const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);return items.filter(c=>(group==='all'||c.group===group)&&(subject==='all'||(c.subjects||[c.subject]).includes(subject))&&(stage==='all'||c.stages.includes(stage))&&words.every(w=>[c.name,c.subject,...c.tags,...c.stages].join(' ').toLocaleLowerCase().includes(w)));}
  function sessionsFor(course,progress){return (course.sessionIds||[course.id]).map(id=>progress[id]).filter(Boolean);}
  function home(sessions){
    const progress=latest(sessions),saved=c=>sessionsFor(c,progress);
    const complete=c=>saved(c).length===(c.sessionIds||[c.id]).length&&saved(c).every(s=>s.records.every(r=>r.done));
    const updated=c=>Math.max(0,...saved(c).map(s=>s.updatedAt));
    const continuing=items.filter(c=>saved(c).some(s=>s.records.some(r=>!r.done))).sort((a,b)=>updated(b)-updated(a))[0];
    const featured=continuing||items.find(c=>c.group==='school'&&!complete(c))||items[0];
    const candidates=items.filter(c=>c.group==='school'&&c!==featured);
    candidates.sort((a,b)=>Number(complete(a))-Number(complete(b)));
    return {continuing,featured,school:candidates.slice(0,2),explore:items.find(c=>c.group==='explore'&&c.fresh)||items.find(c=>c.group==='explore'),progress};
  }
  root.CourseCatalog={items,latest,sessionsFor,select,home};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.CourseCatalog;
})(typeof window!=='undefined'?window:globalThis);
