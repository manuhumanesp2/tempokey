import {tempoMatch} from './bpm.js';
import {harmonicRelation} from './camelot.js';
export function findCompatible(base,pool,{range=4,strict=true,allowHalfDouble=false}={}){
  const out=[];
  for(const t of pool){
    if(t.id===base.id||!t.bpm||!t.camelot||!base.bpm||!base.camelot) continue; // sin datos → no se recomienda
    let tm=tempoMatch(base.bpm,t.bpm,range);
    if(tm&&!allowHalfDouble&&tm.mode!=='direct') tm=null;
    const hr=harmonicRelation(base.camelot,t.camelot);
    if(!tm||!hr||hr.id==='none'||(strict&&hr.level!=='strict')) continue;
    const score=100-Math.abs(tm.delta)*5-(hr.level==='flexible'?15:0)-(tm.mode!=='direct'?10:0);
    const why=`Tempo: ${tm.delta>=0?'+':''}${tm.delta.toFixed(1)} BPM${tm.mode!=='direct'?` (${tm.mode==='double'?'a doble':'a mitad'})`:''}. Armonía: ${hr.label}.`;
    out.push({track:t,tempo:tm,harmony:hr,score,why});
  }
  return out.sort((a,b)=>b.score-a.score);
}
