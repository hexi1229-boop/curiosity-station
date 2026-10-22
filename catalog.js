/* Course discovery metadata; stable lesson URLs and evidence stay in LearningFeedback. */
(function(root){
  'use strict';
  const items=[
    {id:'photosynthesis',name:'植物的糖，是从土里吸来的吗？',subject:'生物',group:'school',stages:['初中衔接','七年级'],tags:['光合作用','原料','产物','叶绿体','能量','有机物','水培'],description:'切换光照与原料，比较土培和水培，再辨清叶片中的淀粉是原来就有，还是现在新造。',icon:'光→糖',time:'8–12 分钟',fresh:true},
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
  function select({group='all',subject='all',stage='all',query=''}={}){const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);return items.filter(c=>(group==='all'||c.group===group)&&(subject==='all'||c.subject===subject)&&(stage==='all'||c.stages.includes(stage))&&words.every(w=>[c.name,c.subject,...c.tags,...c.stages].join(' ').toLocaleLowerCase().includes(w)));}
  function home(sessions){const progress=latest(sessions);const continuing=items.filter(c=>progress[c.id]?.records.some(r=>!r.done)).sort((a,b)=>progress[b.id].updatedAt-progress[a.id].updatedAt)[0];const featured=continuing||items.find(c=>c.group==='school'&&!progress[c.id]?.records.every(r=>r.done))||items[0];const candidates=items.filter(c=>c.group==='school'&&c!==featured);candidates.sort((a,b)=>Number(!!progress[a.id]?.records.every(r=>r.done))-Number(!!progress[b.id]?.records.every(r=>r.done)));return {continuing,featured,school:candidates.slice(0,2),explore:items.find(c=>c.id==='charts'),progress};}
  root.CourseCatalog={items,latest,select,home};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.CourseCatalog;
})(typeof window!=='undefined'?window:globalThis);
