// Normaliza tonalidades y convierte a Camelot. Reglas en README.
const PC = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const MAJ = {0:'8B',7:'9B',2:'10B',9:'11B',4:'12B',11:'1B',6:'2B',1:'3B',8:'4B',3:'5B',10:'6B',5:'7B'};
const MIN = {9:'8A',4:'9A',11:'10A',6:'11A',1:'12A',8:'1A',3:'2A',10:'3A',5:'4A',0:'5A',7:'6A',2:'7A'};
const NAMES = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
export function parseKey(s){
  if(typeof s!=='string') return null;
  const m=s.trim().match(/^([A-G])\s*([#♯b♭]?)\s*(m|min|minor|maj|major)?$/);
  if(!m) return null;
  let pc=PC[m[1]];
  if(m[2]==='#'||m[2]==='♯') pc+=1;
  if(m[2]==='b'||m[2]==='♭') pc-=1;
  return {pc:(pc+12)%12,minor:m[3]==='m'||m[3]==='min'||m[3]==='minor'};
}
export function toCamelot(s){const k=parseKey(s);return k?(k.minor?MIN:MAJ)[k.pc]:null;}
export function keyName(s){const k=parseKey(s);return k?NAMES[k.pc]+(k.minor?' menor':' mayor'):null;}
export function parseCamelot(c){const m=/^(1[0-2]|[1-9])([AB])$/i.exec(c||'');return m?{n:+m[1],l:m[2].toUpperCase()}:null;}
export function harmonicRelation(a,b){
  const x=parseCamelot(a),y=parseCamelot(b); if(!x||!y) return null;
  const d=Math.min((x.n-y.n+12)%12,(y.n-x.n+12)%12);
  if(d===0&&x.l===y.l) return {id:'same',label:'Misma tonalidad',level:'strict'};
  if(d===0) return {id:'relative',label:'Relativa mayor/menor',level:'strict'};
  if(d===1&&x.l===y.l) return {id:'neighbor',label:'Vecina (±1)',level:'strict'};
  if(d===2&&x.l===y.l) return {id:'energy',label:'Salto de 2 (cambio de energía)',level:'flexible'};
  return {id:'none',label:'No compatible',level:null};
}
