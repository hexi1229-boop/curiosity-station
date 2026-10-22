export function chartMetrics(values, start, end) {
  if(values.length!==2 || ![...values,start,end].every(Number.isFinite) || start<0 || start>=Math.min(...values) || end<Math.max(...values) || end<=start) throw new RangeError('Invalid chart range');
  return {
    fractions:values.map(value=>(value-start)/(end-start)),
    visibleRatio:(values[1]-start)/(values[0]-start),
    actualRatio:values[1]/values[0],
    difference:values[1]-values[0],
    increasePercent:(values[1]-values[0])/values[0]*100
  };
}

export function axisTicks(start, end) {
  const step=[1,2,5,10,20,25,50,100].find(value=>value>=(end-start)/5) || (end-start)/4;
  const ticks=[start];
  for(let value=Math.ceil(start/step)*step;value<end;value+=step) {
    if(value-start>=(end-start)*.09 && end-value>=(end-start)*.09) ticks.push(value);
  }
  return [...new Set([...ticks,end])];
}

export function percentAnswer(value) {
  const normalized=value.trim().replace(/[０-９．％]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/%$/,'').trim();
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : null;
}
