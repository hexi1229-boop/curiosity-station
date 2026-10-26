/* Percentages apply to a stated base. Money in the model is calculated in cents. */
(function(root){
 'use strict';
 const title='打折再加运费，为什么不能一起乘？';
 const defaults={price:100,shipping:20,payPercent:80,scope:'goods',stage:0};
 function model(state={}){
  const s={...defaults,...state};
  if(![100,200].includes(s.price)||![0,10,20,30,40].includes(s.shipping)||!Number.isInteger(s.payPercent)||s.payPercent<50||s.payPercent>100||s.payPercent%10!==0||!['goods','all'].includes(s.scope)||!Number.isInteger(s.stage)||s.stage<0||s.stage>2)throw new Error('Outside percent model');
  const goodsPaid=s.price*s.payPercent,shippingPaid=s.shipping*(s.scope==='all'?s.payPercent:100);
  return {...s,original:(s.price+s.shipping)*100,goodsPaid,shippingPaid,total:goodsPaid+shippingPaid,goodsOnly:s.price*s.payPercent+s.shipping*100,wholeBill:(s.price+s.shipping)*s.payPercent,difference:s.shipping*(100-s.payPercent)};
 }
 function restore(state){try{return model(state);}catch(_){return model();}}
 function money(cents){return (cents/100).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');}
 function readAmount(input){
  const raw=String(input).trim().replace(/[０-９．]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
  if(!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(raw))return null;
  const value=Number(raw);return Number.isFinite(value)&&value<=1000000?Math.round(value*100):null;
 }
 const questions=[
  {kind:'choice',skill:'先判断 · 百分数作用于谁',title:'商品80元，运费10元，最后付多少？',context:'优惠规则：只有商品价打八折，运费不参与优惠。没有其他费用或优惠。先留一次自己的判断。',options:['72元','74元','90元'],answer:1,hint:'八折是付商品原价的80%，也就是0.8或4/5；不是只付20%。先看哪一笔钱参与优惠。',explanation:'付74元：80×0.8＋10＝64＋10。把（80＋10）一起乘0.8会得到72元，但那也给运费打了折，不符合这道题的规则。'},
  {kind:'number',skill:'自己用一次 · 改变付费比例',title:'换一张订单，这次该付多少？',context:'商品原价150元，商品打六折；另付运费12元，运费不参与优惠。没有其他费用。请填应付金额。',unit:'元',answer:10200,hint:'六折是付原价的60%，可写成0.6或3/5。把参与优惠的金额与不参与的金额分开。',explanation:'付102元：150×0.6＋12＝90＋12。这里150元是打折的基数；12元运费仍按原数加入。'},
  {kind:'open',skill:'辨错 · 解释刚才那一步',title:'165元的算法，错在什么地方？',context:'规则写着：商品按原价的75%收费，运费不参与优惠。商品原价200元，运费20元。小林算：（200＋20）×75%＝165元。请指出哪笔钱被多打了折，并写出你会怎样改。',hint:'75%是付原价的75%，不是减去75%。括号把哪些金额都放进了乘法？',reference:'小林把20元运费也乘了75%，只付了15元运费，少付5元。不参与优惠的运费应保持20元，所以应付200×0.75＋20＝150＋20＝170元。也可用先求商品节省的钱等合理方法说明。',checks:['指出错误在于运费也被打折，而不是因为“有括号就错”。','改后的结果为170元；算式或短句能说明商品价与运费各按什么规则处理。']},
  {kind:'choice',skill:'撤掉模型 · 规则变了，方法也要变',title:'这次整笔账单统一八折，能一起乘吗？',context:'商品80元，运费10元。新规则明确写着：商品与运费都参与优惠，合计金额统一八折。没有其他费用。按新规则应付多少？',options:['72元','74元','90元'],answer:0,hint:'别沿用上一张订单的规则。这一次，运费是否也参与优惠？',explanation:'付72元：（80＋10）×0.8＝72。也可算80×0.8＋10×0.8＝72。不是“一起乘永远错”，而是要看乘数作用的范围是否符合题意。'},
  {kind:'open',skill:'独立迁移 · 不再给你购物算式',title:'照配方装满一杯，要准备多少果汁？',context:'配方表给的是固定配方。现在要做250毫升成品饮料，保持配方不变。你会准备多少毫升果汁？用一个算式或一两句说明，你把表中的量怎样用到了这一杯。',hint:'表中100毫升指成品饮料总量，20毫升果汁已经包含在其中。先看250毫升对应多少份原配方。',reference:'需要50毫升果汁。250毫升是100毫升的2.5倍，所以20×2.5＝50毫升。也可用250×（20÷100）＝50毫升：果汁占成品饮料的20%，这里作为整体的是250毫升成品，不是把250与100相加。',checks:['给出50毫升；可以用份数、分数、小数或百分数列式，不限定一种说法。','解释中的整体是成品饮料总量，20毫升果汁包含在100毫升成品中；没有把它误当成额外加入的一笔量。']}
 ];
 root.DiscountLesson={title,defaults,model,restore,money,readAmount,questions};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.DiscountLesson;
})(typeof window!=='undefined'?window:globalThis);
