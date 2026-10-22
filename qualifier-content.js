/* Original editing tasks: judge a statement against its evidence, not a fixed answer template. */
(function(root){
 'use strict';
 const title='一个“约”字，为什么不能随便删？';
 const cases=[
  {name:'精确程度',evidence:'小宁用纸尺估测模型机翼长度，记录为约30厘米，没有得到精确到小数位的测量结果。',original:'模型机翼长约30厘米。',changed:'模型机翼长30厘米。',word:'约',before:'“约”表示近似值，保留估测的性质。',after:'删去“约”，就把近似记录写成了确定的30厘米，精确程度改变了。这份估测记录不足以支持这样的改写。',note:'“约”本身不规定固定误差范围，不能机械说成允许上下差1厘米；要结合测量背景。'},
  {name:'适用对象',evidence:'共有5台小车，本次只测试了其中2台，这2台能自动返航，另外3台还没测试。',original:'本次已测试的2台小车能自动返航。',changed:'全部5台小车都能自动返航。',word:'本次已测试的2台',before:'限定为有记录的2台；没有替未测试的小车下结论。',after:'改成“全部5台”，把结论扩大到未测试的3台。没有测试不等于不能返航，但也不能当作已证明能返航。',note:'判断能不能改，要看证据能支持谁；不能仅凭句子读起来顺畅。'},
  {name:'成立条件',evidence:'游戏探测器程序设定：电量低于20%时，提示灯闪烁；电量等于或高于20%时，提示灯常亮。',original:'电量低于20%时，提示灯闪烁。',changed:'提示灯一直闪烁。',word:'电量低于20%时',before:'条件说明什么时候闪烁；20%不属于“低于20%”。',after:'改写取消了条件，变成一直闪烁。把电量调到20%或以上，就能看到它与程序设定不符。',note:'这是给定的游戏程序，不是在推断所有真实设备的电量提示规律。'}
 ];
 function state(index,changed=false,level=20){if(!Number.isInteger(index)||index<0||index>=cases.length||typeof changed!=='boolean'||!Number.isInteger(level)||level<0||level>40||level%10!==0)throw new Error('Invalid editor state');const c=cases[index];return {...c,index,changed,level,sentence:changed?c.changed:c.original,explanation:changed?c.after:c.before,flashing:level<20};}
 const questions=[
  {kind:'choice',skill:'先判断：简短不等于原意不变',title:'把“模型机翼长约30厘米”改成“长30厘米”，这份记录更准确了吗？',context:'小宁只做了估测，得到接近30厘米的结果，没有精确测量。记录要忠实表达这次测量信息。',options:['更准确：删去一个字，句子更简洁','没有：“约”保留了估测的近似性质，删去会改变精确程度','没有：有“约”就说明机翼一定短于30厘米'],answer:1,hint:'“接近30厘米”与“确定是30厘米”表达的精确程度一样吗？“约”只表示小于吗？',explanation:'选B。“约”表示近似，可能略多也可能略少；这次只有估测依据，不宜把它写成精确值。要结合语境解释词语作用，不能只说“有这个词更生动”。'},
  {kind:'edit',skill:'动手补词：已确认多少，尚不知道什么',title:'选一个词放进记录，使它符合目前知道的信息。',context:'收集盒里已清点出12颗种子，这12颗仍在盒内；另有一个纸包尚未打开，不知道里面是否还有种子。这里只根据这些信息写记录。',prefix:'这个收集盒里',suffix:'有12颗种子。',options:['恰好','至少','至多'],answer:1,hint:'已经确认的12颗不会少。未打开的纸包又让哪一种可能性没有被排除？',explanation:'应填“至少”：盒内已确认12颗，也可能更多。至少12包括12及更多；恰好12断定没有更多，至多12排除了更多，两者都缺少依据。不能因为不确定，就写成“一个也不能确定”。'},
  {kind:'open',skill:'解释改写后多出了什么承诺',title:'“本次测试全部成功”能改成“每次测试全部成功”吗？',context:'航模社记录：“周三进行了4次试飞，4次都完成了指定动作。”记录没有说明其他日期的试飞结果。小林把说明中的“本次测试”换成“每次测试”。请根据材料判断并说明理由。',hint:'“本次”限定哪一批记录？“每次”会包含哪些材料没有提供的情形？只写“体现准确性”能解释清楚吗？',reference:'不能仅凭这份记录这样改。本次指周三这批测试，材料只证明这4次完成了动作；每次把范围扩大到其他测试，甚至让人理解为以后也都会成功，但材料没有这些证据。应保留本次范围，不能把一次批次记录变成所有测试的保证。',checks:['说明本次对应周三这批4次试飞，每次扩大了时间/测试范围。','指出材料只提供周三结果，其他测试无证据；不是仅用“体现语言准确性”作结论。']},
  {kind:'choice',skill:'换一个程序，检查条件边界',title:'哪一条独立说明能完整、准确地介绍这个提示灯？',context:'温度提醒程序设定：低于0℃时闪灯，等于或高于0℃时常亮。说明要适用于这两类状态。',options:['提示灯一直闪烁','温度不高于0℃时闪灯，高于0℃时常亮','温度低于0℃时闪灯，等于或高于0℃时常亮'],answer:2,hint:'“低于”和“不高于”都包含0℃吗？如果只写一直闪烁，遗漏了哪种状态？',explanation:'选C。A取消条件；B把0℃也算入闪灯范围，与设定不符。C保留条件及边界。准确表达不仅要有条件，还要把条件的范围说对。'},
  {kind:'open',skill:'独立改写：把一句夸大的说明修准确',title:'把“所有模型都能飞10分钟”改成有记录支持的说明。',context:'周二有5架模型，其中3架完成试飞，飞行时长分别是9分58秒、10分02秒、10分00秒；另外2架尚未测试。请用1–2句话改写，并说明至少两处修改分别解决了什么问题。',hint:'哪些模型有记录？三个时长是否都精确相等？这一批结果能不能保证所有日期的试飞？',reference:'例如：“周二本次已测试的3架模型，飞行时长都约10分钟，另2架尚未测试。”也可逐一写出3个实际时长。把所有模型限定为本次已测试的3架，避免替未测的2架下结论；加约或保留具体秒数，避免把接近10分钟写成精确相同。允许不同表达，但不能据未测试推断另2架失败，也不能保证以后每次都如此。',checks:['改写限定为周二/本次已测试的3架，并用约10分钟或实际时长准确表达。','解释至少两处修改：对象/时间范围与精确程度；不只说“这样更准确”。','不添加未测模型失败、所有模型永久达到10分钟等材料没有的结论。']}
 ];
 function editAnswer(index){if(!Number.isInteger(index)||index<0||index>=questions[1].options.length)throw new Error('Invalid word');return questions[1].prefix+questions[1].options[index]+questions[1].suffix;}
 root.QualifierLesson={title,cases,questions,state,editAnswer};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.QualifierLesson;
})(typeof window!=='undefined'?window:globalThis);
