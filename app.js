/* Live: foglio Google + details.json + like condivisi. UI dal redesign. */
'use strict';
const paths={clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',home:'M3 11 12 3l9 8v10h-6v-7H9v7H3Z',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',search:'m21 21-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',garage:'M3 21V9l9-6 9 6v12 M7 21V11h10v10 M7 15h10 M7 18h10',bed:'M3 18v3 M21 18v3 M3 18V6 M3 14h18v4H3 M7 14V9h4v5 M11 9h7a3 3 0 0 1 3 3v2',wallet:'M20 8H5a2 2 0 0 1 0-4h13v4 M3 6v13a2 2 0 0 0 2 2h15V8 M20 12h-5v5h5',sliders:'M4 7h8 M16 7h4 M4 17h3 M11 17h9 M12 4v6 M7 14v6',sheet:'M6 3h9l4 4v14H5V3h1 M14 3v5h5 M8 12h8 M8 16h8 M12 12v7',external:'M14 3h7v7 M21 3 11 13 M10 3H3v18h18v-7',chevron:'m6 9 6 6 6-6',close:'m6 6 12 12 M6 18 18 6',expand:'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5',map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z M9 3v16 M15 5v16',area:'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5 M3 3l6 6 M21 21l-6-6',bath:'M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z M6 12V5a2 2 0 0 1 4 0 M6 20v2 M18 20v2',sofa:'M4 12V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4 M4 12H2v7h20v-7h-2 M6 12v3h12v-3 M4 19v2 M20 19v2',floor:'M4 21V3h16v18 M8 7h2 M14 7h2 M8 11h2 M14 11h2 M10 21v-5h4v5',check:'m5 12 4 4L19 6',list:'M8 6h13 M8 12h13 M8 18h13 M3 6h.1 M3 12h.1 M3 18h.1'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.home}"/></svg>`;
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('it-IT',{maximumFractionDigits:0}).format(n)+' €';

const SHEET_ID='1HYXLX9SNe0J6xJBuxV6XUrnqAojN1Qf0iowcfWVIrMM';
const LIKES_API_URL='https://script.google.com/macros/s/AKfycbyewMC6joL46lI2bLbFITNn_xyRZAvNdd2BLjMhEVPxFJ4KLk8bFptOIs-_1Mjq9XA/exec';
const PERSON_KEY='cca-local-person';
const LEGACY_PERSON_KEY='affitti-re-person';
const LIKES_CACHE_KEY='affitti-re-likes-cache';

const people=['Dade','Bonni','Ciccio'];
function readPerson(){
  try{
    let raw=localStorage.getItem(PERSON_KEY);
    if(raw!=null){
      try{const p=JSON.parse(raw);if(typeof p==='string'&&people.includes(p))return p;}catch{}
      if(people.includes(raw))return raw;
    }
    const legacy=localStorage.getItem(LEGACY_PERSON_KEY);
    if(legacy&&people.includes(legacy)){
      try{localStorage.setItem(PERSON_KEY,JSON.stringify(legacy));}catch{}
      return legacy;
    }
  }catch{}
  return 'Dade';
}
let person=readPerson();
/** likesById: { [listingId]: string[] } — forma API condivisa */
let likesById={};
function persistPerson(){
  try{
    localStorage.setItem(PERSON_KEY,JSON.stringify(person));
    localStorage.setItem(LEGACY_PERSON_KEY,person);
    return true;
  }catch{return false;}
}
function cacheLikes(){
  try{localStorage.setItem(LIKES_CACHE_KEY,JSON.stringify(likesById));}catch{}
}
function loadCachedLikes(){
  try{
    const raw=localStorage.getItem(LIKES_CACHE_KEY);
    likesById=raw?JSON.parse(raw):{};
    if(!likesById||typeof likesById!=='object'||Array.isArray(likesById))likesById={};
  }catch{likesById={};}
}
function likersOf(id){
  return (likesById[id]||[]).slice().sort((a,b)=>people.indexOf(a)-people.indexOf(b));
}
function likesLabel(id){
  const names=likersOf(id);
  if(!names.length)return '';
  if(names.length===1)return 'Piace a '+names[0];
  if(names.length===2)return 'Piace a '+names[0]+' e '+names[1];
  return 'Piace a '+names.slice(0,-1).join(', ')+' e '+names[names.length-1];
}
const isLiked=id=>likersOf(id).includes(person);
const hasAnyLikes=id=>likersOf(id).length>0;
const othersLiked=id=>likersOf(id).some(n=>n!==person);

async function fetchLikes(){
  try{
    const res=await fetch(LIKES_API_URL+'?t='+Date.now());
    const data=await res.json();
    likesById=data.likes||{};
    cacheLikes();
  }catch(err){
    console.warn('likes fetch',err);
    loadCachedLikes();
  }
}

async function setLikeRemote(id,like){
  try{
    const q='?id='+encodeURIComponent(String(id))
      +'&person='+encodeURIComponent(person)
      +'&like='+(like?'1':'0')
      +'&t='+Date.now();
    const res=await fetch(LIKES_API_URL+q);
    const data=await res.json();
    if(data&&data.likes){
      likesById=data.likes;
      cacheLikes();
    }
  }catch(err){
    console.warn('likes save',err);
  }
}

const state={query:'',filters:new Set(),max:0,furnished:false,available:false,saved:false,sort:'selection'};
/** @type {Array} */
let items=[];
let map,mapTiles,markers=new Map(),visible=[],selectedId=null,toastTimer,booted=false;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function hydrate(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function matches(d){return (!state.saved||isLiked(d.id))&&(!state.query||`${d.title} ${d.zone} ${d.address||''}`.toLocaleLowerCase('it').includes(state.query))&&(!state.filters.has('garage')||d.garage===true)&&(!state.filters.has('bedrooms')||d.bedrooms>=3)&&(!state.filters.has('budget')||(d.price!=null&&d.price/3<=280))&&(!state.max||(d.price!=null&&d.price<=state.max))&&(!state.furnished||d.furnished===true)&&(!state.available||d.available!==false);}
function photo(d,detail=false){return d.image?`<img ${detail?'class="detail-photo"':'loading="lazy"'} src="${esc(d.image)}" alt="${esc(d.title)}" ${detail?'':'width="420" height="300"'} decoding="async">`:`<div class="photo-placeholder ${detail?'detail-photo':''}">${icon('home')}<span>Foto non disponibile</span></div>`;}
function expense(d){return d.expenses!=null?`+ ${money(d.expenses)} di spese / mese`:(d.costNote?`Spese/consumi: ${d.costNote}`:'Spese non indicate');}
function card(d){
  const likeTxt=likesLabel(d.id);
  const others=othersLiked(d.id)&&!isLiked(d.id);
  return `<article class="card ${d.available===false?'unavailable':''}${others?' has-others-like':''}" data-id="${esc(d.id)}"><div class="photo-wrap"><button class="photo-button" data-detail="${esc(d.id)}" aria-label="Vedi ${esc(d.title)}">${photo(d)}</button>${d.available===false?'<span class="badge">Non disponibile</span>':d.garage?'<span class="badge">Con garage</span>':''}<button class="heart" data-like="${esc(d.id)}" aria-label="${isLiked(d.id)?'Rimuovi dai':'Aggiungi ai'} preferiti: ${esc(d.title)}" aria-pressed="${isLiked(d.id)}">${icon('heart')}</button></div><div class="card-info"><p class="card-zone"><span>${esc(d.zone)}</span>${d.approx?`<span title="Posizione indicativa">${icon('pin')}</span>`:''}</p><h3><button class="title-button" data-detail="${esc(d.id)}">${esc(d.title)}</button></h3><div class="card-facts">${d.mq?`<span>${icon('area')}${d.mq} m²</span>`:''}${d.bedrooms?`<span>${icon('bed')}${d.bedrooms} camere</span>`:''}${d.garage?`<span class="garage-fact">${icon('garage')}Garage</span>`:''}</div><div class="card-price"><span><strong>${d.price!=null?money(d.price):'Prezzo da verificare'}</strong>${d.price!=null?' <small>/ mese</small>':''}</span>${d.price!=null?`<span class="person-price">${money(d.price/3)} / persona</span>`:''}</div><p class="expenses">${expense(d)}</p>${likeTxt?`<p class="likes-line">${esc(likeTxt)}</p>`:''}</div></article>`;
}
function render(){
 visible=items.filter(matches).sort((a,b)=>{
  if(state.sort==='price-asc')return (a.price??Infinity)-(b.price??Infinity);
  if(state.sort==='price-desc')return (b.price??-Infinity)-(a.price??-Infinity);
  if(state.sort==='size')return (b.mq??0)-(a.mq??0);
  return Number(a.available===false)-Number(b.available===false)||a.index-b.index;
 });
 $('cards').innerHTML=visible.map(card).join('');
 $('results-title').innerHTML=`<span id="result-count">${visible.length}</span> ${state.saved?(visible.length===1?'casa preferita':'case preferite'):(visible.length===1?'casa da scoprire':'case da scoprire')}`;
 $('saved-count').textContent=items.filter(x=>isLiked(x.id)).length;
 $('saved').classList.toggle('active',state.saved);$('explore').classList.toggle('active',!state.saved);
 $('saved').setAttribute('aria-pressed',state.saved);$('explore').setAttribute('aria-pressed',!state.saved);
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',state.filters.has(b.dataset.filter)));
 const extra=Number(state.max>0)+Number(state.furnished)+Number(state.available), total=state.filters.size+extra+Number(!!state.query);
 $('extra-count').hidden=!extra;$('extra-count').textContent=extra;$('more-filters').classList.toggle('selected',extra>0);
 $('active-filters').hidden=!total;$('active-filters').innerHTML=`${total} ${total===1?'filtro attivo':'filtri attivi'} <button class="text-button" data-reset>Azzera filtri</button>`;
 $('empty').hidden=visible.length>0;
 const noLikes=state.saved&&!items.some(x=>isLiked(x.id));
 $('empty-title').textContent=noLikes?'Le case che ti piacciono, tutte qui':'Nessuna casa con questi filtri';
 $('empty-copy').textContent=noLikes?'Tocca il cuore su un annuncio per ritrovarlo nei preferiti.':'Prova un’altra zona o allarga la ricerca.';
 $('reset').textContent=noLikes?'Esplora le case':'Azzera i filtri';
 $('announcements').textContent=`${visible.length} case ${state.saved?'nei preferiti':'trovate'}`;
 updateMarkers();
}
function highlight(id,on){const marker=markers.get(id);if(!marker)return;marker.getElement()?.querySelector('.price-pin')?.classList.toggle('highlight',on);marker.setZIndexOffset(on?1000:0);}
function updateMarkers(){if(!map)return;markers.forEach(m=>m.remove());markers.clear();visible.forEach(d=>{
 if(!Number.isFinite(d.lat)||!Number.isFinite(d.lng))return;
 const savedCls=isLiked(d.id)?'saved':'';
 const othersCls=(!isLiked(d.id)&&hasAnyLikes(d.id))?'has-likes':'';
 const marker=L.marker([d.lat,d.lng],{title:`${d.title}, ${d.price!=null?money(d.price):'prezzo da verificare'}${d.approx?', posizione indicativa':''}`,icon:L.divIcon({className:'price-marker',html:`<span class="price-pin ${d.approx?'approx':''} ${d.available===false?'gone':''} ${savedCls} ${othersCls}">${d.price!=null?money(d.price):'Vedi'}</span>`,iconSize:[68,32],iconAnchor:[34,16]})}).addTo(map);
 marker.bindPopup(`<button class="popup-button" data-detail="${esc(d.id)}">${d.image?`<img src="${esc(d.image)}" alt="${esc(d.title)}">`:''}<strong>${esc(d.title)}</strong><span>${d.price!=null?money(d.price)+' / mese':'Prezzo da verificare'} · Vedi dettagli</span>${likesLabel(d.id)?`<span class="likes-line">${esc(likesLabel(d.id))}</span>`:''}</button>`,{maxWidth:235});
 marker.on('mouseover',()=>highlight(d.id,true));marker.on('mouseout',()=>highlight(d.id,false));markers.set(d.id,marker);
 });}
function fitMap(){if(!map)return;const coords=visible.filter(d=>Number.isFinite(d.lat)&&Number.isFinite(d.lng)).map(d=>[d.lat,d.lng]);if(coords.length)map.fitBounds(coords,{padding:[60,85],maxZoom:14,animate:!reduced()});else map.setView([44.692,10.636],13,{animate:false});}
function initMap(){if(!window.L){$('map-error').hidden=false;return;}if(map)return;map=L.map('map',{zoomControl:false,scrollWheelZoom:false}).setView([44.692,10.636],13);L.control.zoom({position:'bottomright'}).addTo(map);
 const tiles=mapTiles=L.tileLayer(mapTileUrl(),{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',maxZoom:19}).addTo(map);
 let failures=0;tiles.on('tileerror',()=>{if(++failures>=4)$('map-error').hidden=false;});tiles.on('tileload',()=>{$('map-error').hidden=true;failures=0;});new ResizeObserver(()=>map.invalidateSize()).observe($('map-panel'));updateMarkers();fitMap();}
function detail(d){selectedId=d.id;const facts=[['area',d.mq?d.mq+' m²':null],['bed',d.bedrooms?d.bedrooms+' camere':null],['bath',d.baths?d.baths+(d.baths===1?' bagno':' bagni'):null],['floor',d.floor?d.floor+' piano':null],['sofa',d.furnished===true?'Arredato':d.furnished===false?'Non arredato':null],['garage',d.garage===true?'Garage':d.garage===false?'Senza garage':null]];
 const likeTxt=likesLabel(d.id);
 const expLine=d.expenses!=null?`+ ${money(d.expenses)} di spese / mese. `:'';
 $('detail-content').innerHTML=`${photo(d,true)}<div class="detail-body"><p class="location">${icon('pin')}${esc(d.zone)}${d.approx?' · Posizione indicativa':''}</p><h2 id="detail-title">${esc(d.title)}</h2>${d.available===false?'<p class="detail-status">Questo annuncio risulta non più disponibile.</p>':''}<div class="detail-facts">${facts.filter(x=>x[1]).map(([i,t])=>`<div>${icon(i)}${esc(t)}</div>`).join('')||'<p>Dettagli non ancora disponibili.</p>'}</div><div class="detail-prices"><div><strong>${d.price!=null?money(d.price):'Da verificare'}</strong>${d.price!=null?' <small>/ mese</small>':''}</div>${d.price!=null?`<span class="person-price">${money(d.price/3)} / persona</span>`:''}</div><p class="expenses">${expLine}Canone diviso tra 3 persone, spese escluse.</p>${d.costNote?`<div class="detail-note"><strong>Spese e consumi dal foglio</strong>${esc(d.costNote)}</div>`:''}${d.note?`<div class="detail-note"><strong>Le nostre note</strong>${esc(d.note)}</div>`:''}${likeTxt?`<p class="likes-line" style="margin-top:12px;font-size:12px">${esc(likeTxt)}</p>`:''}<div class="detail-actions"><a class="primary" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Apri annuncio originale ${icon('external')}</a><button class="detail-save" data-like="${esc(d.id)}" aria-pressed="${isLiked(d.id)}">${icon('heart')}<span>${isLiked(d.id)?'Salvato':'Salva'}</span></button></div></div>`;
 if(!$('detail-dialog').open)$('detail-dialog').showModal();
}
function toggleLike(id){
 const liked=isLiked(id);
 const next=!liked;
 const set=new Set(likersOf(id));
 if(next)set.add(person);else set.delete(person);
 likesById[id]=Array.from(set);
 cacheLikes();
 const needsRerender=state.saved&&liked;
 if(needsRerender)render();else{
  document.querySelectorAll('[data-like]').forEach(b=>{if(b.dataset.like!==id)return;b.setAttribute('aria-pressed',next);if(b.classList.contains('heart')){const t=items.find(d=>d.id===id);b.setAttribute('aria-label',`${liked?'Aggiungi ai':'Rimuovi dai'} preferiti: ${t?t.title:''}`);b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}});
  $('saved-count').textContent=items.filter(x=>isLiked(x.id)).length;
  const pin=markers.get(id)?.getElement()?.querySelector('.price-pin');
  if(pin){pin.classList.toggle('saved',next);pin.classList.toggle('has-likes',!next&&hasAnyLikes(id));}
  const cardEl=document.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
  if(cardEl){
   const line=cardEl.querySelector('.likes-line');
   const label=likesLabel(id);
   if(line){if(label)line.textContent=label;else line.remove();}
   else if(label){const p=document.createElement('p');p.className='likes-line';p.textContent=label;cardEl.querySelector('.card-info')?.appendChild(p);}
   cardEl.classList.toggle('has-others-like',othersLiked(id)&&!isLiked(id));
  }
 }
 const detailSave=$('detail-content').querySelector('.detail-save');
 if(detailSave?.dataset.like===id){
  detailSave.setAttribute('aria-pressed',next);
  detailSave.querySelector('span').textContent=liked?'Salva':'Salvato';
  let line=$('detail-content').querySelector('.likes-line');
  const label=likesLabel(id);
  if(line){if(label)line.textContent=label;else line.remove();}
  else if(label){const p=document.createElement('p');p.className='likes-line';p.style.cssText='margin-top:12px;font-size:12px';p.textContent=label;$('detail-content').querySelector('.detail-actions')?.before(p);}
 }
 toast(liked?'Casa rimossa dai preferiti':'Casa salvata nei preferiti condivisi');
 setLikeRemote(id,next).then(()=>{if(state.saved)render();else{
  // refresh labels after server round-trip
  const label=likesLabel(id);
  document.querySelectorAll(`.card[data-id="${CSS.escape(id)}"] .likes-line`).forEach(el=>{if(label)el.textContent=label;else el.remove();});
  updateMarkers();
 }});
}
function reset(){state.filters.clear();state.query='';state.max=0;state.furnished=false;state.available=false;$('query').value='';render();}
function updatePerson(){ $('person-label').textContent=person;$('avatar').textContent=person[0];$('profile').setAttribute('aria-label',`Profilo ${person}: cambia persona`);}
function mapTileUrl(){return 'https://{s}.basemaps.cartocdn.com/'+(document.documentElement.dataset.theme==='dark'?'dark_all':'light_all')+'/{z}/{x}/{y}{r}.png';}
function updateThemeControl(){const dark=document.documentElement.dataset.theme==='dark';$('theme-toggle').setAttribute('aria-checked',String(dark));$('theme-toggle').title=dark?'Passa al tema chiaro':'Passa al tema scuro';document.querySelector('meta[name="theme-color"]').content=dark?'#111c2d':'#ffffff';}
function applyTheme(theme){document.documentElement.dataset.theme=theme;updateThemeControl();mapTiles?.setUrl(mapTileUrl());}
function showUpdatedAt(iso){
 const el=$('updated-at');
 if(!iso){el.textContent='dal foglio live';el.removeAttribute('datetime');return;}
 const date=new Date(iso);
 if(Number.isNaN(date.getTime())){el.textContent='dal foglio live';el.removeAttribute('datetime');return;}
 el.dateTime=date.toISOString();
 el.textContent=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);
 el.title='Ora italiana (Europe/Rome). Ultima lettura live dal foglio.';
}

function listingId(url){
 if(!url)return '';
 const m=String(url).match(/(?:annunci|immobili|immobile)\/(\d+)/);
 return m?m[1]:'';
}
function cleanUrl(url){return String(url||'').split('#')[0].split('?')[0];}

function loadSheet(){
 return new Promise((resolve,reject)=>{
  let done=false;
  const finish=(fn,value)=>{if(done)return;done=true;clearTimeout(timer);fn(value);};
  const prev=window.google;
  window.google={visualization:{Query:{setResponse(data){window.google=prev;finish(resolve,data);}}}};
  const s=document.createElement('script');
  s.src='https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/gviz/tq?tqx=out:json&gid=0&headers=0&t='+Date.now();
  s.onerror=()=>finish(reject,new Error('sheet'));
  document.head.appendChild(s);
  const timer=setTimeout(()=>finish(reject,new Error('sheet-timeout')),12000);
 });
}

function rowsFromSheet(data){
 const rows=(data.table&&data.table.rows)||[];
 const out=[];
 for(const row of rows){
  const cells=row.c||[];
  const noteB=cells[1]&&(cells[1].v||cells[1].f);
  const noteBStr=noteB!=null?String(noteB).trim():'';
  if(/^Duplicato\b/i.test(noteBStr))continue;
  const cell=cells[0];
  const v=cell&&(cell.v||cell.f);
  if(!v)continue;
  const s=String(v).trim();
  if(!/^https?:\/\//i.test(s))continue;
  const noteC=cells[2]&&(cells[2].v||cells[2].f);
  const noteCStr=noteC!=null?String(noteC).trim():'';
  out.push({url:s,noteB:noteBStr,noteC:noteCStr});
 }
 return out;
}

function buildItems(sheetRows,details){
 const seen=new Set();
 const built=[];
 let index=0;
 for(const row of sheetRows){
  const url=row.url;
  const id=listingId(url)||cleanUrl(url);
  if(!id||seen.has(id))continue;
  seen.add(id);
  const d=Object.assign({},details[id]||{});
  const beds=Number(d.bedrooms);
  const maxP=Number(d.maxPeople);
  if(Number.isFinite(beds)&&beds<2)continue;
  if(Number.isFinite(maxP)&&maxP<=2)continue;
  const image=d.image||(id.match(/^\d+$/)?`photos/${id}.jpg`:null);
  built.push({
   id:String(id),
   url:cleanUrl(url),
   note:row.noteB||'',
   costNote:row.noteC||'',
   title:d.title||'Annuncio da completare',
   zone:d.zone||'Zona da verificare',
   address:d.address||'',
   price:d.price!=null?d.price:null,
   expenses:d.expenses!=null?d.expenses:null,
   mq:d.mq!=null?d.mq:null,
   rooms:d.rooms!=null?d.rooms:null,
   bedrooms:d.bedrooms!=null?d.bedrooms:null,
   baths:d.baths!=null?d.baths:null,
   floor:d.floor!=null?d.floor:null,
   furnished:d.furnished!=null?d.furnished:null,
   garage:d.garage!=null?d.garage:null,
   elevator:d.elevator!=null?d.elevator:null,
   lat:d.lat!=null?Number(d.lat):null,
   lng:d.lng!=null?Number(d.lng):null,
   approx:!!d.approx,
   image:image,
   available:d.available===false?false:true,
   maxPeople:d.maxPeople!=null?d.maxPeople:null,
   index:index++
  });
 }
 return built;
}

function bindUi(){
 if(booted)return;
 booted=true;
 $('theme-toggle').onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(theme);try{localStorage.setItem('cca-local-theme',theme);}catch{toast('Tema applicato per questa sessione.');}};
 matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{let saved;try{saved=localStorage.getItem('cca-local-theme');}catch{}if(saved!=='light'&&saved!=='dark')applyTheme(e.matches?'dark':'light');});
 document.addEventListener('click',e=>{
  const like=e.target.closest('[data-like]');if(like){toggleLike(like.dataset.like);return;}
  const open=e.target.closest('[data-detail]');if(open){const d=items.find(x=>x.id===open.dataset.detail);if(d)detail(d);return;}
  const filter=e.target.closest('[data-filter]');if(filter){const k=filter.dataset.filter;state.filters.has(k)?state.filters.delete(k):state.filters.add(k);render();return;}
  if(e.target.closest('[data-close]'))e.target.closest('dialog').close();
  if(e.target.closest('[data-reset]'))reset();
  const personButton=e.target.closest('[data-person]');if(personButton){person=personButton.dataset.person;persistPerson();updatePerson();render();$('profile-dialog').close();}
 });
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();}));
 $('cards').addEventListener('pointerover',e=>{const c=e.target.closest('.card');if(c)highlight(c.dataset.id,true);});$('cards').addEventListener('pointerout',e=>{const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))highlight(c.dataset.id,false);});
 $('cards').addEventListener('focusin',e=>{const c=e.target.closest('.card');if(c)highlight(c.dataset.id,true);});$('cards').addEventListener('focusout',e=>{const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))highlight(c.dataset.id,false);});
 $('query').addEventListener('input',e=>{state.query=e.target.value.toLocaleLowerCase('it').trim();render();});$('sort').addEventListener('change',e=>{state.sort=e.target.value;render();});
 $('saved').onclick=()=>{state.saved=true;render();};$('explore').onclick=()=>{state.saved=false;render();};$('reset').onclick=()=>{if(state.saved&&!items.some(x=>isLiked(x.id)))state.saved=false;reset();};
 $('more-filters').onclick=()=>{$('max-price').value=state.max||'';$('furnished').checked=state.furnished;$('available').checked=state.available;$('filters-dialog').showModal();};
 $('clear-extra').onclick=()=>{$('max-price').value='';$('furnished').checked=false;$('available').checked=false;};
 $('filter-form').onsubmit=e=>{e.preventDefault();state.max=Math.max(0,Number($('max-price').value)||0);state.furnished=$('furnished').checked;state.available=$('available').checked;render();$('filters-dialog').close();};
 $('profile').onclick=()=>{$('people').innerHTML=people.map(p=>`<button class="person ${p===person?'selected':''}" data-person="${p}" aria-pressed="${p===person}"><span class="avatar">${p[0]}</span>${p}${p===person?icon('check'):''}</button>`).join('');$('profile-dialog').showModal();};
 $('fit-map').onclick=fitMap;
 $('toggle-map').onclick=()=>{const show=document.body.classList.toggle('map-view');$('toggle-map').innerHTML=`${icon(show?'list':'map')}<span id="view-label">${show?'Mostra elenco':'Mostra mappa'}</span>`;$('toggle-map').setAttribute('aria-pressed',show);if(show){map?.invalidateSize();fitMap();}};
 document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.closest('.leaflet-tile-pane')){const fallback=document.createElement('div');fallback.className='photo-placeholder'+(e.target.classList.contains('detail-photo')?' detail-photo':'');fallback.innerHTML=icon('home')+'<span>Foto non disponibile</span>';e.target.replaceWith(fallback);}},true);
 if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{Promise.resolve(document.modelContext.registerTool({
   name:'read_visible_homes',title:'Leggi le case visibili',
   description:'Restituisce le case mostrate con i filtri correnti, senza cambiare preferiti o selezione.',
   inputSchema:{type:'object',properties:{},additionalProperties:false},
   annotations:{readOnlyHint:true,untrustedContentHint:true},
   execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('È richiesto un oggetto vuoto.');return {count:visible.length,homes:visible.map(d=>({id:d.id,title:d.title,zone:d.zone,monthlyRent:d.price??null,expenses:d.expenses??null,url:d.url}))};}
  },{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 }
}

hydrate();
updatePerson();
updateThemeControl();
$('cards').innerHTML='<p class="loading-banner">Caricamento delle case dal foglio…</p>';
bindUi();

(async()=>{
 try{
  const [sheet,details]=await Promise.all([
   loadSheet(),
   fetch('details.json?t='+Date.now()).then(r=>r.ok?r.json():{}),
   fetchLikes()
  ]);
  const sheetRows=rowsFromSheet(sheet);
  items=buildItems(sheetRows,details);
  window.LISTINGS=items;
  const now=new Date().toISOString();
  window.CATALOG_META={updatedAt:now,scope:'live-sheet',checks:'9,14,19'};
  showUpdatedAt(now);
  initMap();
  render();
  fitMap();
 }catch(err){
  console.error(err);
  $('cards').innerHTML='<p class="loading-banner">Non riesco a leggere il foglio. Riprova tra poco.</p>';
  showUpdatedAt(null);
  initMap();
 }
})();
