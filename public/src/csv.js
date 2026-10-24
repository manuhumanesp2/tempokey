const COLS=[['title','Título'],['artist','Artista'],['bpm','BPM original'],['key','Tonalidad'],['camelot','Camelot'],['genre','Género'],['url','Enlace a la fuente']];
export function safeCell(v){
  let s=v==null?'':String(v);
  if(/^[=+\-@\t\r]/.test(s)) s="'"+s; // evita inyección de fórmulas
  return '"'+s.replace(/"/g,'""')+'"';
}
export function toCsv(tracks){
  const rows=[COLS.map(c=>safeCell(c[1])).join(',')];
  for(const t of tracks) rows.push(COLS.map(([k])=>safeCell(t[k])).join(','));
  return '\uFEFF'+rows.join('\r\n')+'\r\n'; // BOM UTF-8 para Excel
}
