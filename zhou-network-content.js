'use strict';
(function(root){
  const id='zhou-network';
  const title='没有电话和现代公路，周天子怎样管理千里之外？';
  const tasks=[
    {title:'王都能直接处理每个远方聚落的日常事务吗？',context:'先封存一个治理方案，并说明它解决的问题与付出的代价。'},
    {title:'一件青铜器，能把制度图画到哪一步？',context:'先读具体器物档案，再判断材料支持到哪里。'},
    {title:'信息还在路上时，远方怎样继续运行？',context:'改变路线条件，重建王室、封国与地方事务之间的往返关系。'},
    {title:'新证据加入后，原来的模型该怎样修正？',context:'只根据一张新器物档案完成判断、证据与边界报告。'}
  ];

  const coldOptions=[
    {id:'direct',text:'王都直接给每个远方聚落下日常命令，地方等命令再行动。'},
    {id:'layered',text:'把身份、资源与一定地方权力交给区域统治者，同时约定义务并保持往来。'},
    {id:'none',text:'只把远方圈进地图，平时完全不联系，也不承担任何义务。'},
    {id:'kinship',text:'只要派亲属去远方，就会自动、永远服从，不再需要其他制度。'}
  ];

  const keLei={
    name:'克罍',period:'西周早期',found:'1986年，琉璃河西周燕国墓地 M1193',
    quote:'令克侯于匽（燕）',
    note:'原铭为金文；页面使用现代隶定短句。首都博物馆藏品页认为铭文记录了周王分封克于燕的具体事件。'
  };
  const keClaims=[
    {id:'command',text:'这件器物的铭文记录了一次具体王命、具体人物与地点。',supported:true},
    {id:'network',text:'结合出土地点与馆方释读，这件材料支持燕地与周王室建立了政治关系。',supported:true},
    {id:'instant',text:'它证明每一道王命都能即时传到远方每个聚落。',supported:false},
    {id:'uniform',text:'它证明所有封国在所有时期都按完全相同的流程运作。',supported:false}
  ];
  const keAnswer=keClaims.filter(item=>item.supported).map(item=>item.id);
  const evidenceHints=[
    '先找器物页面明确给出的具体人、地、王命；不要从“一次记录”直接推出“所有地方、所有时期”。',
    '铭文和出土背景可以支持一条具体政治关系；它没有记录命令速度，也不是全国运行手册。'
  ];

  const routeConditions=[
    {id:'clear',label:'道路较通畅',status:'仍要靠人和车马真实往返',duration:'2.8s'},
    {id:'weather',label:'雨雪泥泞',status:'消息与人员往返更慢',duration:'5.4s'},
    {id:'detour',label:'河道受阻，改道',status:'路线改变，联系成本继续上升',duration:'7s'}
  ];
  const networkEvents=[
    {
      id:'repair',title:'封国内城墙被雨冲坏，王都消息尚未到达。',
      options:[
        {id:'local',text:'由封国与地方先组织处理，再按需要报告。'},
        {id:'wait',text:'所有人停工，等王都逐户下令。'},
        {id:'ignore',text:'既然离王都远，就永远不必处理。'}
      ],answer:'local'
    },
    {
      id:'summons',title:'王室发出征召，怎样变成远方行动？',
      options:[
        {id:'chain',text:'使者传命到封国，封国再组织本地力量履行义务。'},
        {id:'telepathy',text:'地图一变色，每个聚落就同时自动执行。'},
        {id:'village',text:'王室跳过封国，实时指挥每个家庭。'}
      ],answer:'chain'
    },
    {
      id:'report',title:'王室怎样知道远方履行了哪些事务？',
      options:[
        {id:'return',text:'诸侯、使者或相关人员携带信息与物资真实往返。'},
        {id:'instant',text:'王都能远程实时看到每个地方的全部情况。'},
        {id:'silence',text:'授权以后，双方不再需要任何联系。'}
      ],answer:'return'
    }
  ];
  const networkBoundaries=[
    {id:'network',text:'这是分层、双向、需要往返维系的关系网；扩大影响不等于实时直管。'},
    {id:'province',text:'封国就是现代省，诸侯只是可随时调换的地方官。'},
    {id:'automatic',text:'只要有亲属和礼仪，关系就会自动、永远稳定。'}
  ];
  const networkHints=[
    '先问：消息没到时，日常事务能不能停？这决定地方是否需要一定决策权。',
    '再看箭头方向：授权和王命向外，履行义务、报告与人员物资也会返回。',
    '“形成关系网”比“实时直管”更准确；交通慢不等于完全失去联系。'
  ];

  const eJian={
    name:'“噩监”青铜簋',period:'西周早期',
    inscription:'盖内和器内有对铭 2 行 7 字。',
    museum:'中国国家博物馆藏品页据铭文说明：器主是噩国监国之官；馆方把监国制度解释为王朝加强对诸侯国控制的一种措施。',
    boundary:'这是噩国一个案例；器主先人身份被馆方写作“可能为商遗民”。'
  };
  const transferCards=[
    {id:'inscription',label:'器物与铭文信息',text:'器内与盖内都有短铭，显示作器者具有“噩监”这一身份。'},
    {id:'museum',label:'馆方解释与边界',text:'馆方把它解释为噩国的监国之官，并强调这是西周初年噩国的具体案例。'}
  ];
  const transferRatings=[
    {id:'direct',text:'这张档案直接支持'},
    {id:'inference',text:'结合档案可谨慎推断'},
    {id:'overreach',text:'说得超过这张档案'}
  ];
  const transferClaims=[
    {id:'official',text:'西周初年噩国曾设有监国之官。',expected:'direct'},
    {id:'selective',text:'在地方治理之外，王室有时会给特定地区叠加监督层。',expected:'inference'},
    {id:'every',text:'西周每个封国、每一时期都设有同样的监官。',expected:'overreach'},
    {id:'daily',text:'有监官就证明王室直接处理噩国每一件日常事务。',expected:'overreach'}
  ];
  const transferModels=[
    {id:'replace',text:'新证据推翻了地方治理：所有事务其实都由王室直接处理。'},
    {id:'layered',text:'新证据补上“选择性监督”一层；它与地方治理、义务往返可以同时存在。'},
    {id:'irrelevant',text:'新证据与治理毫无关系，不能修正任何模型。'}
  ];
  const transferHints=[
    '先分开“噩国这个案例”和“所有封国的一般情况”。',
    '“有监督”与“中央包办全部日常事务”不是同一句话。',
    '更好的模型能同时容纳地方处理事务、向王室承担义务，以及特定情境下的监督。'
  ];

  const sources=[
    {title:'教育部《义务教育历史课程标准（2022年版）》',url:'https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582345700037.pdf'},
    {title:'首都博物馆：克罍',url:'https://capitalmuseum.org.cn/collection/30a9844041e24d919ad497143c9db47b'},
    {title:'中国国家博物馆：馆藏西周青铜器概述',url:'https://www.chnmuseum.cn/yj/xscg/xszz/202010/t20201027_247929.shtml'},
    {title:'中国国家博物馆：“噩监”青铜簋',url:'https://www.chnmuseum.cn/zp/zpml/csp/202209/t20220901_257137.shtml'},
    {title:'中国国家博物馆：古代中国·夏商西周',url:'https://www.chnmuseum.cn/portals/0/web/zt/gudai/detail2.html'},
    {title:'中国社会科学网：西周封建册命典礼前后的程序',url:'https://www.cssn.cn/skgz/skwyc/202301/t20230116_5582894.shtml'}
  ];

  function sameSet(values,answer){
    if(!Array.isArray(values)||!Array.isArray(answer))return false;
    const left=[...new Set(values)].sort(),right=[...new Set(answer)].sort();
    return left.length===right.length&&left.every((value,index)=>value===right[index]);
  }
  function gradeEvidence(selected){return {selection:sameSet(selected,keAnswer),correct:sameSet(selected,keAnswer)};}
  function gradeNetwork(state){
    const observed=[...new Set(Array.isArray(state?.routeSeen)?state.routeSeen:[])];
    const answers=state?.networkAnswers&&typeof state.networkAnswers==='object'?state.networkAnswers:{};
    const detail=networkEvents.map(event=>({id:event.id,correct:answers[event.id]===event.answer}));
    return {
      observed:observed.filter(id=>routeConditions.some(item=>item.id===id)).length>=2,
      detail,
      events:detail.every(item=>item.correct),
      boundary:state?.networkBoundary==='network',
      correct:observed.filter(id=>routeConditions.some(item=>item.id===id)).length>=2&&detail.every(item=>item.correct)&&state?.networkBoundary==='network'
    };
  }
  function gradeTransfer(state){
    const visited=[...new Set(Array.isArray(state?.transferVisited)?state.transferVisited:[])];
    const ratings=state?.transferRatings&&typeof state.transferRatings==='object'?state.transferRatings:{};
    const detail=transferClaims.map(claim=>({id:claim.id,expected:claim.expected,actual:ratings[claim.id]||null,correct:ratings[claim.id]===claim.expected}));
    return {
      visited:transferCards.every(card=>visited.includes(card.id)),
      detail,
      ratings:detail.every(item=>item.correct),
      model:state?.transferModel==='layered',
      correct:transferCards.every(card=>visited.includes(card.id))&&detail.every(item=>item.correct)&&state?.transferModel==='layered'
    };
  }

  const api={
    id,title,tasks,coldOptions,keLei,keClaims,keAnswer,evidenceHints,routeConditions,networkEvents,networkBoundaries,networkHints,
    eJian,transferCards,transferRatings,transferClaims,transferModels,transferHints,sources,sameSet,gradeEvidence,gradeNetwork,gradeTransfer
  };
  root.ZhouNetworkLesson=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
