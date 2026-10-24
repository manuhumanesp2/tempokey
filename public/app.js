import {searchTracks,getTempoCandidates} from './src/providers/getsongbpm.js';
import {findCompatible} from './src/compat.js';
import {diffPercent} from './src/bpm.js';
import {toCsv} from './src/csv.js';
const $=id=>document.getElementById(id);
let all=[],sort={k:'bpm',d:1},ctl,base=null,cctl;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
function visible(){
  const mn=+$('fmin').value||0,mx=+$('fmax').value||999,t=$('ftxt').value.toLowerCase(),k=$('fkey').value;
  const v=all.filter(r=>(!$('fmin').value&&!$('fmax').value||r.bpm&&r.bpm>=mn&&r.bpm<=mx)&&(r.title+' '+r.artist).toLowerCase().includes(t)&&(!k||r.camelot===k));
  return v.sort((a,b)=>{const x=a[sort.k],y=b[sort.k];if(x==null)return 1;if(y==null)return -1;return (x>y?1:x<y?-1:0)*sort.d;});
}
function render(){
  const body=$('rows');body.replaceChildren();
  for(const r of visible()){
    const tr=el('tr');tr.append(el('td','',r.title),el('td','',r.artist));
    tr.append(el('td',r.bpm?'bpm':'na',r.bpm??'—'),el('td',r.key?'':'na',r.key??'—'),el('td',r.camelot?'cam':'na',r.camelot?r.camelot+(r.camelotCalculated?'*':''):'—'),el('td',r.genre?'':'na',r.genre??'—'));
    const s=el('td');if(r.url&&/^https:\/\//.test(r.url)){const a=el('a','','GetSongBPM');a.href=r.url;a.rel='noopener';a.target='_blank';s.append(a);}else s.textContent='—';
    const b=el('td'),btn=el('button','','Compatibles');btn.onclick=()=>openCompat(r);b.append(btn);tr.append(s,b);body.append(tr);
  }
  $('status').textContent=`${visible().length} de ${all.length} resultados`;
}
$('f').onsubmit=async e=>{
  e.preventDefault();const q=$('q').value.trim();if(q.length<2){$('status').textContent='Escribe al menos 2 caracteres.';return;}
  ctl?.abort();ctl=new AbortController();$('status').textContent='Buscando…';
  try{all=await searchTracks(q,ctl.signal);}catch(x){if(x.name==='AbortError')return;$('status').textContent=x.message==='Failed to fetch'?'Error de red. Revisa tu conexión.':x.message;return;}
  $('resultados').hidden=false;
  const ks=[...new Set(all.map(r=>r.camelot).filter(Boolean))].sort((a,b)=>parseInt(a)-parseInt(b)||a.localeCompare(b));
  $('fkey').replaceChildren(new Option('Todas',''),...ks.map(k=>new Option(k,k)));
  if(!all.length){$('resultados').hidden=true;$('status').textContent='Sin coincidencias. Prueba con otro título o artista.';return;}
  render();
};
document.querySelectorAll('th button').forEach(b=>b.onclick=()=>{sort={k:b.dataset.s,d:sort.k===b.dataset.s?-sort.d:1};render();});
['fmin','fmax','ftxt','fkey'].forEach(i=>$(i).oninput=render);
$('clr').onclick=()=>{['fmin','fmax','ftxt','fkey'].forEach(i=>$(i).value='');render();};
$('csv').onclick=()=>{const u=URL.createObjectURL(new Blob([toCsv(visible())],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=u;a.download='tempokey.csv';a.click();URL.revokeObjectURL(u);};
async function openCompat(t){
  base=t;$('compat').hidden=false;$('compat').scrollIntoView({behavior:'smooth'});
  $('base').textContent=`Base: ${t.artist} – ${t.title} · ${t.bpm??'BPM n/d'} BPM · ${t.camelot??'Camelot n/d'}`;
  if(!t.bpm||!t.camelot){$('cstatus').textContent='Esta canción no tiene BPM o tonalidad disponibles: no se puede evaluar compatibilidad.';$('clist').replaceChildren();return;}
  cctl?.abort();cctl=new AbortController();$('cstatus').textContent='Buscando candidatos…';
  const range=+$('rng').value;let pool=[];
  try{pool=(await Promise.all([...new Set([t.bpm,...(range>=4?[t.bpm-range/2|0,t.bpm+(range/2|0)]:[]),...($('hd').checked?[t.bpm*2,Math.round(t.bpm/2)]:[])])].map(b=>getTempoCandidates(b,cctl.signal)))).flat();}
  catch(x){if(x.name!=='AbortError')$('cstatus').textContent=x.message;return;}
  const res=findCompatible(t,pool,{range,strict:$('strict').checked,allowHalfDouble:$('hd').checked});
  $('cstatus').textContent=res.length?`${res.length} sugerencias (entre los candidatos que devuelve la fuente, no todo el catálogo).`:'Sin sugerencias con estos criterios.';
  $('clist').replaceChildren(...res.map(r=>{const c=el('div','card');c.append(el('b','',r.track.title),el('div','na',r.track.artist),el('div','bpm',r.track.bpm+' BPM'),el('div','cam',r.track.camelot),el('small','',`${r.why} Dif.: ${diffPercent(t.bpm,r.track.bpm).toFixed(1)}%`));return c;}));
}
['rng','strict','hd'].forEach(i=>$(i).onchange=()=>base&&openCompat(base));
