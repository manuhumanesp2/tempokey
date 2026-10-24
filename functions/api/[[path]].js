// Proxy mínimo: la clave vive en el servidor; solo 2 rutas con parámetros validados.
const BASE='https://api.getsong.co';
export async function onRequestGet({request,env,params}){
  const url=new URL(request.url); const route=[].concat(params.path||[])[0];
  const j=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
  if(!env.GETSONGBPM_API_KEY) return j({error:'config'},503);
  let target;
  if(route==='search'){
    const q=(url.searchParams.get('q')||'').trim();
    if(q.length<2||q.length>100) return j({error:'bad_query'},400);
    target=`${BASE}/search/?type=both&limit=25&lookup=${encodeURIComponent(q)}`;
  }else if(route==='tempo'){
    const b=Number(url.searchParams.get('bpm'));
    if(!Number.isInteger(b)||b<30||b>300) return j({error:'bad_bpm'},400);
    target=`${BASE}/tempo/?limit=50&bpm=${b}`;
  }else return j({error:'not_found'},404);
  try{
    const r=await fetch(target,{headers:{'X-API-KEY':env.GETSONGBPM_API_KEY}});
    if(r.status===429) return j({error:'rate'},429);
    if(!r.ok) return j({error:'upstream'},502);
    return new Response(await r.text(),{headers:{'content-type':'application/json','cache-control':'public, max-age=300'}});
  }catch{return j({error:'upstream'},502);}
}
