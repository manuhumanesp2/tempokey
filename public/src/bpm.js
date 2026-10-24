export const validBpm=n=>Number.isFinite(n)&&n>=30&&n<=300;
export function diffPercent(orig,target){if(!validBpm(orig)||!validBpm(target))return null;return (target-orig)/orig*100;}
// Mejor coincidencia: directo, doble o mitad. Nunca sobrescribe el BPM original.
export function tempoMatch(a,b,range){
  if(!validBpm(a)||!validBpm(b)) return null;
  const opts=[{mode:'direct',bpm:b},{mode:'double',bpm:b*2},{mode:'half',bpm:b/2}]
    .map(o=>({...o,delta:o.bpm-a})).filter(o=>Math.abs(o.delta)<=range);
  if(!opts.length) return null;
  opts.sort((p,q)=>Math.abs(p.delta)-Math.abs(q.delta)); const o=opts[0];
  return {mode:o.mode,delta:o.delta,percent:diffPercent(a,o.bpm)};
}
