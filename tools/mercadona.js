// Descarga el catálogo de Mercadona (Barcelona) con miniaturas para Nido de recetas.
// Se ejecuta en una pestaña de tienda.mercadona.es.
(async()=>{
  const log=(...a)=>console.log('%c[Nido]','color:#22807E;font-weight:bold',...a);
  const subs=(await (await fetch('/api/categories/?lang=es&wh=bcn1')).json()).results.flatMap(c=>c.categories.map(s=>s.id));
  const out=[],th=[],seen=new Set();
  for(const [n,id] of subs.entries()){
    log('Categorías',n+1,'/',subs.length);
    try{const r=await (await fetch('/api/categories/'+id+'/?lang=es&wh=bcn1')).json();
      for(const c of r.categories)for(const p of c.products){ if(seen.has(p.id))continue; seen.add(p.id); const q=p.price_instructions;
        out.push([p.id,p.display_name,p.packaging||'',+q.unit_price,q.unit_size,q.size_format||'',+q.reference_price||0,q.reference_format||'',q.selling_method,r.name,c.name,q.previous_unit_price?+String(q.previous_unit_price).trim():0,q.price_decreased?1:0]); th.push(p.thumbnail||''); }
    }catch(e){ log('error en categoría',id); }
    await new Promise(s=>setTimeout(s,100));
  }
  const C=72,cv=[];
  for(let s=0;s<Math.ceil(out.length/100);s++){const c=document.createElement('canvas');c.width=c.height=C*10;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,C*10,C*10);cv.push(g);}
  let k=0,done=0;
  const w=async()=>{while(k<out.length){const i=k++;out[i].push(Math.floor(i/100),i%100);
    if(th[i])await new Promise(res=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{const g=cv[Math.floor(i/100)],p=i%100,sc=Math.min(C/im.naturalWidth,C/im.naturalHeight),W=im.naturalWidth*sc,H=im.naturalHeight*sc;g.drawImage(im,(p%10)*C+(C-W)/2,Math.floor(p/10)*C+(C-H)/2,W,H);res()};im.onerror=res;im.src=th[i].split('?')[0]+'?fit=crop&h=96&w=96';setTimeout(res,15000)});
    if(++done%500==0)log('Fotos',done,'/',out.length);}};
  await Promise.all(Array.from({length:10},w));
  const d=new Date();
  const blob=new Blob([JSON.stringify({date:d.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}),wh:'bcn1',fetched:d.toISOString(),products:out,sprites:cv.map(g=>g.canvas.toDataURL('image/jpeg',.8))})],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nido-mercadona.json';document.body.appendChild(a);a.click();
  log('LISTO:',out.length,'productos');
})();
