// Proveedor GetSongBPM (vía /api/* para no exponer la clave). Para cambiar de fuente, reemplaza este archivo.
import {toCamelot,keyName} from '../camelot.js';
import {validBpm} from '../bpm.js';
export const SOURCE={name:'GetSongBPM',url:'https://getsongbpm.com'};
export function normalize(r){
  const bpm=Number(r.tempo), key=r.key_of||null;
  const calc=!r.camelot&&key?toCamelot(key):null;
  return {id:r.id,title:r.title||'',artist:r.artist?.name||'',
    bpm:validBpm(bpm)?Math.round(bpm):null,
    key:key?keyName(key):null,
    camelot:r.camelot||calc||null,camelotCalculated:!!calc,
    genre:(r.artist?.genres||[]).join(', ')||null,url:r.uri||null};
}
async function call(path,params,signal){
  const res=await fetch(path+'?'+new URLSearchParams(params),{signal});
  if(res.status===429) throw new Error('Límite de peticiones alcanzado. Inténtalo en unos minutos.');
  if(res.status===503) throw new Error('El servidor no tiene configurada la clave de la API.');
  if(!res.ok) throw new Error('El servicio de datos no está disponible ahora mismo.');
  return res.json();
}
export async function searchTracks(q,signal){
  const d=await call('/api/search',{q},signal);
  return (Array.isArray(d.search)?d.search:[]).map(normalize);
}
export async function getTempoCandidates(bpm,signal){
  const d=await call('/api/tempo',{bpm:String(bpm)},signal);
  return (Array.isArray(d.tempo)?d.tempo:[]).map(normalize);
}
