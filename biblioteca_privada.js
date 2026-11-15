'use strict';
const fs=require('fs');
const zlib=require('zlib');
const STOP=new Set(['derecho','romano','romana','como','para','sobre','cual','cuales','cuando','donde','porque','entre','desde','hasta','explica','explicar','diferencia','tema','puede','tiene','actor','parte','partes','quiero','saber','acerca','segun']);
const clean=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const TERMS=[
['Ideas fundamentales acerca del Derecho',19],['Historia y persistencia del Derecho Romano',22],
['El sujeto de derecho. Persona y capacidad',31],['La familia romana',40],
['Hechos, actos y negocio jurídico',47],['El proceso. Generalidades',57],
['El proceso formulario (fase in iure)',63],['El proceso formulario (litis contestatio y fase apud iudicem)',71],
['La cognitio extra ordinem',77],['Introducción a los derechos reales. Posesión',81],
['La propiedad',88],['Derechos reales sobre cosa ajena',94],
['Protección procesal de los derechos reales',100],['La propiedad pretoria',104],
['La relación obligacional',111],['Los delitos',119],['Contratos reales',126],
['Contratos formales',134],['Contratos consensuales',136],
['Refuerzo y garantía de las obligaciones',142],['La sucesión mortis causa',146],
['Sucesión intestada',150],['Sucesión testamentaria y forzosa',155]];
let items=[];
function load(){
 try{
  const raw=fs.readFileSync('/etc/secrets/ulpiano_library.b64','utf8').trim();
  const parsed=JSON.parse(zlib.gunzipSync(Buffer.from(raw,'base64')).toString('utf8'));
  if(!Array.isArray(parsed.items)||parsed.items.length<100)throw new Error('Invalid library');
  items=parsed.items;
  console.log('[PRIVATE_LIBRARY]',JSON.stringify({fragments:items.length,public:false}));
 }catch(err){
  items=[];
  console.warn('[PRIVATE_LIBRARY] no disponible: cargar archivo secreto en Render antes de publicar esta versión');
 }
 return items.length;
}
function search(query){
 if(!items.length)return {context:'',sources:[],topic:null};
 const terms=[...new Set(clean(query).match(/[a-z]{4,}/g)||[])].filter(t=>!STOP.has(t)).slice(0,22);
 if(!terms.length)return {context:'',sources:[],topic:null};
 const matches=[];
 for(const item of items){
  const content=clean((item.h||'')+' '+(item.x||''));
  const found=terms.filter(t=>content.includes(t));
  if(!found.length)continue;
  const heading=clean(item.h);
  let score=found.length*6+found.length/terms.length*14;
  score+=found.filter(t=>heading.includes(t)).length*8;
  if(item.s==='Lecciones de Derecho Romano')score*=1.5;
  // Las preguntas sobre la pretensión del proceso formulario deben recuperar
  // antes que nada la sección doctrinal exacta de Lecciones (2026).
  const keys=['intentio','condemnatio','pretension','petitum','formula'];
  const formulaQuery=terms.some(t=>keys.includes(t));
  if(formulaQuery && item.s==='Lecciones de Derecho Romano' &&
     item.t==='7' && /partes principales|f[oó]rmula y sus partes/i.test(item.h)) score+=65;
  else if(item.s==='El Derecho Romano como introducción al Derecho')score*=1.15;
  matches.push({item,score});
 }
 matches.sort((a,b)=>b.score-a.score);
 const selected=[],seen=new Set();
 for(const {item} of matches){
  const key=[item.s,item.t,item.h].join('|');
  if(seen.has(key))continue;
  seen.add(key);selected.push(item);
  if(selected.length===4)break;
 }
 const sources=selected.map(it=>({
  obra:it.s,edicion:it.e,tema:it.t||null,epigrafe:it.h||null,
  pagina:it.s==='Lecciones de Derecho Romano'?null:it.p||null
 }));
 const v=selected.find(x=>x.s==='Lecciones de Derecho Romano'&&/^\d+$/.test(x.t||''));
 const index=v?TERMS[Number(v.t)-1]:null;
 return {
  context:selected.map((it,i)=>'FRAGMENTO '+(i+1)+' | '+it.s+' ('+it.e+')'+(it.t?' | tema '+it.t:'')+' | '+it.h+'\n'+it.x).join('\n\n').slice(0,6500),
  sources,
  topic:index?{titulo:index[0],pagina:index[1],tema:Number(v.t),notaPagina:'Página inicial del tema (Lecciones de Derecho Romano, 2026)'}:null
 };
}
module.exports={load,search};
