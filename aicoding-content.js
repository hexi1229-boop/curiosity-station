/* Pure course contract and deterministic teaching simulator for AI coding. */
(function(root){
  'use strict';

  const id='aicoding';
  const title='AI 写的代码，为什么还不能直接发射？';
  const tasks=[
    {title:'一次演示成功，可以直接发射吗？',context:'先把任务要求写清，再判断模拟 AI 助手给出的候选程序是否已经可靠。'},
    {title:'怎样用测试把隐藏错误逼出来？',context:'运行普通、岩石和边界场景，修复执行顺序与临界电量，再重跑完整测试。'},
    {title:'换成沙暴救援，还能自己建立规则吗？',context:'信息改成地形能耗表，自行计算所需电量、预测并验证相邻边界测试，再写出通用判断。'}
  ];

  const requirementIds=['reach','avoid','reserve','send','shortest','pretty'];
  const required=['reach','avoid','reserve','send'];
  const coldChoices=['launch','test-first','trust-readable'];
  const directions=['N','E','S','W'];
  const deltas={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};
  const scenarioIds=['normal','rock','battery','already'];
  const scenarios={
    normal:{id:'normal',name:'A · 普通通道',size:5,start:{x:1,y:4,dir:'N'},target:{x:1,y:1},rocks:[],battery:5,estimatedSteps:3,reserve:1,expected:'arrive',given:'无岩石；预计 3 步；电量 5。',purpose:'这张卡确认基本路线能工作。'},
    rock:{id:'rock',name:'B · 岩石拐角',size:5,start:{x:0,y:3,dir:'N'},target:{x:2,y:3},rocks:[[0,2]],battery:5,estimatedSteps:2,reserve:1,expected:'arrive',given:'前方第 1 格有岩石；目标在拐弯后；电量 5。',purpose:'这张卡检查“先行动还是先观察”。'},
    battery:{id:'battery',name:'C · 临界电量',size:5,start:{x:2,y:4,dir:'N'},target:{x:2,y:0},rocks:[],battery:4,estimatedSteps:4,reserve:1,expected:'abort',given:'预计 4 步；电量 4；结束须留 1 格。',purpose:'这张卡检查刚好够走、却不够留电的边界。'},
    already:{id:'already',name:'D · 起点就是终点',size:5,start:{x:3,y:2,dir:'E'},target:{x:3,y:2},rocks:[],battery:1,estimatedSteps:0,reserve:1,expected:'arrive',given:'起点就是目标；电量 1。',purpose:'这张卡检查循环会不会多做一步。'}
  };

  const baseProgram={checkOrder:'after',reserveRule:'steps'};
  const fixedProgram={checkOrder:'before',reserveRule:'plus-one'};

  const unique=(values,allowed)=>[...new Set(Array.isArray(values)?values:[])].filter(value=>allowed.includes(value));
  const text=(value,max=900)=>typeof value==='string'?value.slice(0,max):'';
  const hasReason=value=>{const reason=text(value).trim();return reason.length>=4&&reason!=='暂时说不清';};
  const sameSet=(a,b)=>a.length===b.length&&a.every(value=>b.includes(value));
  const pointKey=(x,y)=>`${x},${y}`;
  const isRock=(scenario,x,y)=>scenario.rocks.some(([rx,ry])=>rx===x&&ry===y);
  const inside=(scenario,x,y)=>x>=0&&y>=0&&x<scenario.size&&y<scenario.size;
  const turnRight=direction=>directions[(directions.indexOf(direction)+1)%directions.length];

  function sanitizeProgram(value){
    return {
      checkOrder:value?.checkOrder==='before'?'before':'after',
      reserveRule:value?.reserveRule==='plus-one'?'plus-one':'steps'
    };
  }
  function sameProgram(a,b){
    const left=sanitizeProgram(a),right=sanitizeProgram(b);
    return left.checkOrder===right.checkOrder&&left.reserveRule===right.reserveRule;
  }

  function runRover(scenarioOrId,programValue){
    const scenario=typeof scenarioOrId==='string'?scenarios[scenarioOrId]:scenarioOrId;
    if(!scenario||!scenarioIds.includes(scenario.id))throw new Error('Unknown rover scenario');
    const program=sanitizeProgram(programValue);
    const state={x:scenario.start.x,y:scenario.start.y,dir:scenario.start.dir,battery:scenario.battery};
    const trace=[{...state,line:'start',message:'读取任务输入'}];
    const requiredEnergy=scenario.estimatedSteps+(program.reserveRule==='plus-one'?scenario.reserve:0);
    if(state.battery<requiredEnergy){
      trace.push({...state,line:'guard',message:`电量 ${state.battery} < 启动门槛 ${requiredEnergy}，安全停止`});
      return finishRun('aborted',false);
    }
    let status='running',sent=false,commands=0;
    while((state.x!==scenario.target.x||state.y!==scenario.target.y)&&commands<12){
      const [dx,dy]=deltas[state.dir],nx=state.x+dx,ny=state.y+dy;
      const rockAhead=isRock(scenario,nx,ny),outside=!inside(scenario,nx,ny);
      if(program.checkOrder==='before'&&(rockAhead||outside)){
        state.dir=turnRight(state.dir);commands++;
        trace.push({...state,line:'check',message:rockAhead?'先看见岩石，向右转':'先看见地图边界，向右转'});
      }
      const [mx,my]=deltas[state.dir],tx=state.x+mx,ty=state.y+my;
      if(!inside(scenario,tx,ty)||isRock(scenario,tx,ty)){
        status='collision';
        trace.push({...state,line:'move',message:!inside(scenario,tx,ty)?'前进一步越出地图':'前进一步撞上岩石'});
        break;
      }
      if(state.battery<=0){status='empty';trace.push({...state,line:'move',message:'没有电量，无法前进'});break;}
      state.x=tx;state.y=ty;state.battery--;commands++;
      trace.push({...state,line:'move',message:`前进一步，剩余电量 ${state.battery}`});
      if(program.checkOrder==='after'&&(state.x!==scenario.target.x||state.y!==scenario.target.y)){
        const [ax,ay]=deltas[state.dir],fx=state.x+ax,fy=state.y+ay;
        if(isRock(scenario,fx,fy)||!inside(scenario,fx,fy)){
          state.dir=turnRight(state.dir);commands++;
          trace.push({...state,line:'check',message:'行动以后才检查前方，并向右转'});
        }
      }
    }
    if(status==='running'){
      if(state.x===scenario.target.x&&state.y===scenario.target.y){status='arrived';sent=true;trace.push({...state,line:'send',message:'到达目标并发送样本数据'});}
      else {status='limit';trace.push({...state,line:'limit',message:'超过教学模拟的安全步数，自动停止'});}
    }
    return finishRun(status,sent);

    function finishRun(runStatus,runSent){
      const arrived=runStatus==='arrived'&&runSent&&state.battery>=scenario.reserve;
      const safeAbort=runStatus==='aborted'&&state.x===scenario.start.x&&state.y===scenario.start.y;
      const pass=scenario.expected==='arrive'?arrived:safeAbort;
      let reason='';
      if(pass)reason=scenario.expected==='arrive'?`到达目标，保留 ${state.battery} 格电量`:'电量不足，出发前安全停止';
      else if(runStatus==='collision')reason='发生碰撞，违反安全要求';
      else if(runStatus==='arrived'&&state.battery<scenario.reserve)reason=`虽然到达，但只剩 ${state.battery} 格电量`;
      else if(runStatus==='aborted')reason='程序停止了，但这个场景本应完成任务';
      else reason='没有按任务要求结束';
      return {scenario:scenario.id,program,status:runStatus,pass,reason,final:{...state},trace};
    }
  }

  function runSuite(program){return scenarioIds.map(id=>runRover(id,program));}
  function gradeCold(value){
    const chosen=unique(value?.requirements,requirementIds);
    return {requirements:sameSet(chosen,required),decision:value?.decision==='test-first',reason:hasReason(value?.reason)};
  }
  function gradeRover(value){
    const testsSeen=unique(value?.testsSeen,scenarioIds);
    const baseFailuresSeen=unique(value?.baseFailuresSeen,['rock','battery']);
    const suite=runSuite(value?.program);
    return {observed:['rock','battery'].every(id=>baseFailuresSeen.includes(id)),tested:['normal','rock','battery'].every(id=>testsSeen.includes(id)),program:suite.every(result=>result.pass),regression:suite.length===4&&suite.every(result=>result.pass),reason:hasReason(value?.reason)};
  }

  const transferCases={
    low:{battery:5,expected:'abort'},
    exact:{battery:6,expected:'execute'},
    extra:{battery:7,expected:'execute'}
  };
  const transferCaseIds=Object.keys(transferCases);
  function transferOutcome(battery,needed,operator){
    if(operator==='less')return battery<needed?'abort':'execute';
    if(operator==='less-equal')return battery<=needed?'abort':'execute';
    return battery===needed?'abort':'execute';
  }
  function gradeTransfer(value){
    const routeEnergy=Number(value?.routeEnergy),neededEnergy=Number(value?.neededEnergy);
    const predictions=value?.predictions&&typeof value.predictions==='object'?value.predictions:{};
    const operator=['less','less-equal','equal'].includes(value?.operator)?value.operator:'';
    return {
      model:value?.modelChoice==='energy',
      energy:routeEnergy===4&&neededEnergy===6,
      predictions:transferCaseIds.every(id=>predictions[id]===transferCases[id].expected),
      rule:operator==='less'&&transferCaseIds.every(id=>transferOutcome(transferCases[id].battery,neededEnergy,operator)===transferCases[id].expected),
      reason:hasReason(value?.reason)
    };
  }

  function sanitizeState(value){
    const source=value&&typeof value==='object'?value:{};
    const predictions={};
    for(const id of transferCaseIds)if(['abort','execute'].includes(source.predictions?.[id]))predictions[id]=source.predictions[id];
    return {
      requirements:unique(source.requirements,requirementIds),
      coldDecision:coldChoices.includes(source.coldDecision)?source.coldDecision:'',
      coldReason:text(source.coldReason),
      coldSaved:source.coldSaved===true,
      testsSeen:unique(source.testsSeen,scenarioIds),
      baseFailuresSeen:unique(source.baseFailuresSeen,['rock','battery']),
      program:sanitizeProgram(source.program),
      roverReason:text(source.roverReason),
      roverHintLevel:Math.max(0,Math.min(3,Number.isInteger(source.roverHintLevel)?source.roverHintLevel:0)),
      routeEnergy:text(source.routeEnergy,8),
      neededEnergy:text(source.neededEnergy,8),
      modelChoice:['segments','energy','peak'].includes(source.modelChoice)?source.modelChoice:'',
      predictions,
      transferOperator:['less','less-equal','equal'].includes(source.transferOperator)?source.transferOperator:'',
      transferReason:text(source.transferReason),
      transferHintLevel:Math.max(0,Math.min(3,Number.isInteger(source.transferHintLevel)?source.transferHintLevel:0))
    };
  }

  root.AICodingLesson={id,title,tasks,requirementIds,required,coldChoices,scenarioIds,scenarios,baseProgram,fixedProgram,transferCases,transferCaseIds,sanitizeProgram,sameProgram,runRover,runSuite,gradeCold,gradeRover,transferOutcome,gradeTransfer,sanitizeState,pointKey,hasReason};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.AICodingLesson;
})(typeof window!=='undefined'?window:globalThis);
