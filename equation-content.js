/* Equalities and linear equations. No expression evaluation or automatic grading of prose. */
(function(root){
  'use strict';
  const title='神秘货箱有多重？';
  const questions=[
    {kind:'choice',skill:'先自己判断',title:'要先去掉左边的 6 千克，怎样做还能保持两边相等？',context:'天秤平衡：左边3只质量相同的箱子和6千克砝码，右边21千克砝码。每只箱子的质量是x千克，3x＋6＝21。',options:['只从左边拿走 6 千克','两边各拿走 6 千克','左边拿走 6 千克，右边加上 6 千克'],answer:1,hint:'原来两边一样重。改变后，两边减少的质量一样吗？',explanation:'两边各减 6，仍然一样重：3x＋6−6＝21−6，所以 3x＝15。只动一边，会破坏原来的相等关系。'},
    {kind:'open',skill:'把理由说清楚',title:'从 3x＝15 到 x＝5，为什么两边都要除以 3？',context:'3只质量相同的箱子共15千克。3x＝15 → x＝5。',hint:'左边从“3只”变成“1只”，右边对应的总质量应该怎样变？',reference:'3x 表示 3 个相同的 x。把两边都平均分成 3 份，每一份仍相等，所以 x＝15÷3＝5。若只把左边除以 3，右边仍是3只箱子的总质量，两边就不对应。',checks:['说明了左边从3个x变成1个x。','说明右边也要分成同样的3份，而不是只写“规定要这样”。']},
    {kind:'choice',skill:'抓住错误的一步',title:'小宇解 4x−8＝20，写成 4x＝20−8。怎样修正？',context:'错误解法：4x−8＝20 → 4x＝20−8 → x＝3。',options:['两边都减 8，得到 4x＝12，x＝3','两边都加 8，得到 4x＝28，x＝7','只把左边的 −8 擦掉，得到 4x＝20，x＝5'],answer:1,hint:'想把“减去8”抵消，需要加8还是减8？另一边也要做同样的事。',explanation:'要消掉 −8，两边都加 8：4x−8＋8＝20＋8，得到 4x＝28，再两边除以 4 得 x＝7。代回去：4×7−8＝20。'},
    {kind:'number',skill:'换个场景用一次',title:'他一共体验了几轮？',context:'模拟飞行馆收一次性的开卡费4元，每体验一轮另收3元。小林一共付了25元，没有其他费用。',label:'体验轮数（填数字）',unit:'轮',answer:7,hint:'总费用里，哪一部分只收一次？剩下的钱对应几轮体验？',explanation:'先扣除一次性开卡费，(25−4)÷3＝7 轮。也可设体验 x 轮：4＋3x＝25，解得 x＝7。检查：4＋3×7＝25。'},
    {kind:'open',skill:'独立解一个新方程',title:'解出 4x−3＝2x＋9，并用原式检查。',context:'4x−3＝2x＋9。写一个简短解法，再把结果代回原式。可以在纸上算好后输入关键步骤。',hint:'先让等号的一边不再出现x。两边都减去2x，会留下什么？',reference:'两边都减 2x：2x−3＝9；两边都加 3：2x＝12；两边都除以 2：x＝6。检查原式：左边 4×6−3＝21，右边 2×6＋9＝21，两边相等。也可以用其他保持等价的步骤。',checks:['结果是x＝6，每次加减的量或除以的非零数两边一致。','把6代回原来的两边，分别算得21。不是只检查中途得到的式子。']}
  ];
  function balanceState(stage){
    const states={start:{boxes:3,leftMass:6,rightMass:21,tilt:0,equation:'3x＋6＝21',caption:'3只同样的箱子，加上6千克砝码，和21千克一样重。'},one:{boxes:3,leftMass:0,rightMass:21,tilt:6,equation:'3x＜21',caption:'从原来的天秤只拿走左侧6千克，左边变轻，右边下沉。3x＝21已经不成立。'},both:{boxes:3,leftMass:0,rightMass:15,tilt:0,equation:'3x＝15',caption:'从原来的天秤两边各拿走6千克，仍然平衡。现在3只箱子共15千克。'},divide:{boxes:1,leftMass:0,rightMass:5,tilt:0,equation:'x＝5',caption:'把刚才两边都分成3份，取各自的一份：1只箱子和5千克一样重。'}};
    if(!Object.hasOwn(states,stage))throw new Error('Unknown balance stage');
    return {...states[stage]};
  }
  function numberValue(value){const s=String(value).normalize('NFKC').trim().replace(/−/g,'-');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
  root.EquationLesson={title,questions,balanceState,numberValue};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.EquationLesson;
})(typeof window!=='undefined'?window:globalThis);
