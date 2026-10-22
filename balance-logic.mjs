export function resultFor(left, right, heavy) {
  if (left.includes(heavy)) return 'left';
  if (right.includes(heavy)) return 'right';
  return 'level';
}

export function keepCandidates(candidates, left, right, result) {
  return candidates.filter(fruit => resultFor(left, right, fruit) === result);
}
