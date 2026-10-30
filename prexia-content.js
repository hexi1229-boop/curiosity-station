'use strict';
(function(root){
  const title='夏朝以前，真的叫“三皇五帝时代”吗？';
  const tasks=[
    {title:'时间舱：先留下你的判断',context:'回到距今约4200年以前，区分今天的名称和当时留下的证据。'},
    {title:'遗址现场：陶寺与石峁',context:'查看两处年代重叠的区域中心，判断考古发现能直接说明什么。'},
    {title:'双层时间线：故事与遗址不能硬贴',context:'把后世整理的传统人物线和考古材料线分开，再修订首答。'},
    {title:'独立迁移：河湾城档案',context:'面对一组虚构新遗址材料，给出不越过证据的结论。'}
  ];
  const initialOptions=[
    {id:'official-name',text:'当时的人已经把整个时代统一叫作“三皇五帝时代”。'},
    {id:'empty',text:'夏朝以前还没有真正复杂的社会，只有简单部落。'},
    {id:'dual',text:'“三皇五帝”是后世整理上古传统的一条叙事线；考古学还要用遗址和器物重建当时，二者不能直接画等号。'},
    {id:'all-fiction',text:'没有发现当时的帝王名单，所以后来关于上古的传统全部没有研究价值。'}
  ];
  const sites=[
    {
      id:'taosi',name:'陶寺',place:'山西襄汾',period:'主体距今约4300—3900年',caption:'黄土台地上的大型聚落复原示意',
      hotspots:[
        {id:'taosi-city',label:'城与大型建筑',x:24,y:43,title:'组织大型工程',text:'考古发现早、中期城址和大型夯土建筑区。它说明这里能够组织大量人力与物资；遗迹本身没有写出统治者姓名。'},
        {id:'taosi-tombs',label:'大小不同的墓葬',x:70,y:65,title:'社会等级差异',text:'墓葬规模和随葬品差别明显，大墓中见礼乐器。它能支持社会分化已经加深，不能自动证明墓主人就是尧。'},
        {id:'taosi-workshop',label:'手工作坊',x:48,y:71,title:'专业生产出现',text:'遗址发现手工业作坊区，说明部分生产活动已经专业化，聚落不只是普通村庄。'},
        {id:'taosi-platform',label:'半圆形台基',x:79,y:34,title:'一种仍需检验的解释',text:'有研究根据结构与模拟，把这处夯土台基解释为观察日出方位、安排时令的设施。这是有依据的考古解释，不是器物自己写下的说明书。'}
      ]
    },
    {
      id:'shimao',name:'石峁',place:'陕西神木',period:'距今约4300—3800年',caption:'石墙、城门与高台的复原示意',
      hotspots:[
        {id:'shimao-wall',label:'多重石城',x:21,y:58,title:'超过4平方公里的石城',text:'考古发现皇城台、内城、外城等结构和复杂城门。如此规模需要长期组织劳动力，显示这里是北方重要区域中心。'},
        {id:'shimao-platform',label:'中央高台',x:53,y:35,title:'皇城台大型建筑',text:'城内高处发现大型建筑台基及相关遗存。“皇城台”是考古地点名称，不等于已经找到了某位传说帝王的宫殿。'},
        {id:'shimao-art',label:'石雕与壁画',x:76,y:54,title:'仪式与工艺线索',text:'石雕、壁画、玉器等遗物显示复杂工艺和仪式活动，也帮助研究人群交流；它们没有组成一份可读的帝王年表。'},
        {id:'shimao-words',label:'没有姓名的空白',x:66,y:76,title:'最关键的缺口',text:'石峁尚未留下能够确认城名、国名或统治者姓名的文字。因此可以研究它的年代与社会结构，不能断言它就是黄帝都城。'}
      ]
    }
  ];
  const siteOptions=[
    {id:'dynasties',text:'陶寺在先、石峁在后，正好是两个前后相接的朝代。'},
    {id:'overlap',text:'两者年代长期重叠，是不同区域的复杂中心；它们显示文明形成有多条区域路线。'},
    {id:'same-city',text:'两地规模都很大，所以其实是同一个国家的两座都城。'},
    {id:'named-rulers',text:'大型建筑已经直接证明陶寺属于尧、石峁属于黄帝。'}
  ];
  const layerOptions=[
    {id:'one-table',text:'把黄帝、尧、舜逐个贴到陶寺或石峁，时间接近就足以确认。'},
    {id:'two-layers',text:'传统人物线告诉我们后世怎样整理上古记忆；考古线呈现遗址的年代与物质证据。可以比较，但目前不能逐人逐城对号。'},
    {id:'archaeology-only',text:'只要有考古遗址，所有传世文献都应该丢掉。'},
    {id:'text-only',text:'《史记》已经列出五帝顺序，所以遗址有没有文字并不重要。'}
  ];
  const transferOptions=[
    {id:'center',text:'河湾城很可能是当时一个组织能力较强、等级分化明显的区域中心；主人姓名仍不知道。'},
    {id:'capital',text:'河湾城已经被证明是“帝青”的都城。'},
    {id:'village',text:'没有可读文字，所以河湾城只能算普通村庄。'},
    {id:'dynasty',text:'距今约4200年，所以河湾城一定属于同一个名叫“三皇五帝”的王朝。'}
  ];
  const transferEvidence=[
    {tag:'年代',text:'城墙木炭样本测年集中在距今约4200—4000年。'},
    {tag:'城市',text:'发现围墙、排水沟、大型公共台基和分区作坊。'},
    {tag:'人群',text:'少数墓葬很大、随葬品丰富，多数墓葬较小。'},
    {tag:'文字',text:'只见刻画符号，尚不能组成可读的城名或人名。'},
    {tag:'后世传说',text:'约800年后的《旧闻抄》写“帝青居泷水之东”。这是本课虚构文献，用来练习证据判断。'}
  ];
  function gradeInitial(id){return id==='dual';}
  function gradeSite(id){return id==='overlap';}
  function gradeLayer(id){return id==='two-layers';}
  function gradeTransfer(id){return id==='center';}
  const lesson={id:'prexia',title,tasks,initialOptions,sites,siteOptions,layerOptions,transferOptions,transferEvidence,gradeInitial,gradeSite,gradeLayer,gradeTransfer};
  root.PreXiaLesson=lesson;
  if(typeof module!=='undefined'&&module.exports)module.exports=lesson;
})(typeof window!=='undefined'?window:globalThis);
