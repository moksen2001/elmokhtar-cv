
/* ---------- Terrain : vraies photos du terrain, mouvement plus naturel ----------
   Les illustrations vectorielles (art, tile) sont remplacées par des photographies
   prises au Sénégal et en Afrique de l'Ouest (Wikimedia Commons, crédits dans l'app). */
const PHC=__COLS__;
const PHT={pousses:'pousses',goutte:'goutte',graines:'graines',cloture:'cloture',fleurs:'fleurs',pluie:'pluie',sacs:'arachide-2'};
const phk=(k,v)=>{const a=[k,k+'-2',k+'-3'].filter(x=>PHC[x]);return a.length?a[(v||0)%a.length]:null};
const ph=(k,small)=>`<img class="pho" src="img/ph/${k}${small?'-s':''}.webp" alt="" loading="lazy" decoding="async" draggable="false" style="--c:${PHC[k]}" onload="this.classList.add('on')">`;
const art0=art,tile0=tile;
art=function(k,al,v){const key=phk(k,v);return key?ph(key,al==='xMaxYMid'):art0(k,al)};
tile=function(k,sl){const key=PHT[k]||(PHC[k]&&k);return key?ph(key,!sl):tile0(k,sl)};
card=function(id,i=0){const c=C[id],p=pct(c),[st,cl]=status(c);
 return `<article class="ccard" data-go="detail" data-id="${id}" style="--i:${i}">
 <div class="art">${art(id)}<span class="pill ${cl} pr">${st}</span>
  <div class="acap"><h3><button class="stretch" type="button" data-go="detail" data-id="${id}">${c.crop} · ${c.zone}</button></h3>
  <p class="meta">${I.pin}${c.place} · ${c.agro.name}</p></div></div>
 <div class="cbody">${bar(p)}<p class="fund"><b>${cnt(p,'n','p')}${NN}% financé</b><span>${cnt(c.raised,'M','r')} sur ${M(c.goal)}${NB}FCFA</span></p>
 <dl class="stats"><div><dt>Rendement estimé</dt><dd class="g">${c.roi[0]}–${pc(c.roi[1])}</dd></div><div><dt>Durée</dt><dd>${c.months}${NB}mois</dd></div><div><dt>Investisseurs</dt><dd><span class="inv-dd">${cnt(c.investors,'n','i')}</span></dd></div></dl></div></article>`};

plant=function(st){const k=S.sel&&PHC[S.sel]?S.sel:'arachide';
 const key=st<=0?'pousses':st===1?'mais-2':st===2?phk(k,0):st===3?(k==='arachide'?'fleurs':phk(k,1)):phk(k,1);
 return `<span class="gph">${ph(key,1)}</span>`};
/* Carte -> fiche : la photo de la carte s'agrandit jusqu'à devenir l'en-tête de la fiche */
let MSRC=null;
app.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-go="detail"]');MSRC=h?(h.closest('.ccard,.rc,.lnk-card,.post')||h).querySelector('img.pho'):null},true);
app.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const h=e.target.closest('[data-go="detail"]');MSRC=h?(h.closest('.ccard,.rc,.lnk-card,.post')||h).querySelector('img.pho'):null}},true);
function MORPH(id){
 const src=MSRC;MSRC=null;
 if(id!=='detail'||!src||!src.isConnected||RM.matches)return '';
 const a=src.getBoundingClientRect();if(!a.width||a.bottom<0||a.top>innerHeight)return '';
 requestAnimationFrame(()=>{const dst=$('#s-detail .hero img.pho');if(!dst)return;
  const b=dst.getBoundingClientRect();if(!b.width)return;
  const g=document.createElement('img');g.src=src.currentSrc||src.src;g.className='pho-fly';g.alt='';
  const r0=parseFloat(getComputedStyle(src.parentElement).borderTopLeftRadius)||0,r1=parseFloat(getComputedStyle(dst.parentElement).borderTopLeftRadius)||0;
  Object.assign(g.style,{left:b.left+'px',top:b.top+'px',width:b.width+'px',height:b.height+'px'});
  document.body.appendChild(g);dst.style.visibility='hidden';
  const sx=a.width/b.width,sy=a.height/b.height;
  const an=g.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px) scale(${sx},${sy})`,borderRadius:`${r0/sx}px / ${r0/sy}px`},{transform:'none',borderRadius:r1+'px'}],{duration:440,easing:'cubic-bezier(.32,.72,0,1)'});
  const end=()=>{dst.style.visibility='';g.remove()};an.onfinish=end;an.oncancel=end;setTimeout(end,700)});
 return 'morph';
}
/* Fiche : la photo recule légèrement au défilement, la barre du haut se densifie */
(function(){const sc=$('#s-detail');let tk=0;
 sc.addEventListener('scroll',()=>{if(tk)return;tk=requestAnimationFrame(()=>{tk=0;const y=sc.scrollTop,h=$('.hero',sc),tb=$('.topbar',sc);
  if(tb)tb.classList.toggle('solid',y>(h?h.offsetHeight-64:40));
  if(h&&!RM.matches&&y<h.offsetHeight){const im=$('img.pho',h);if(im)im.style.transform=`translate3d(0,${(y*.32).toFixed(1)}px,0) scale(${(1+y/1400).toFixed(4)})`}})},{passive:true})})();
/* Barre d'onglets : un seul trait qui glisse d'un onglet à l'autre */
function TABIND(id){const i=TABS.indexOf(id);const tb=$('.tabbar');if(i>=0)tb.style.setProperty('--ti',i);tb.classList.toggle('has-ti',i>=0)}
/* Connexion : la photo du terrain derrière le logo */
$('.login-top').insertAdjacentHTML('afterbegin',`<div class="lt-ph" aria-hidden="true">${ph('oignon-2')}</div>`);
/* Crédits photo (CC BY-SA : auteur, licence, source) */
const PHCRED=__CRED__;
function credits(){return `<details class="credits"><summary>Crédits des photographies</summary><p>Photos d’illustration issues de Wikimedia Commons. Elles ne représentent pas les campagnes fictives de la démo et ont été recadrées.</p><ul>${PHCRED.map(c=>`<li><a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(c[0].replace(/ /g,'_'))}" target="_blank" rel="noopener">${esc(c[0].replace(/\.jpe?g$/i,''))}</a>, ${esc(c[1])}, ${c[2]}</li>`).join('')}</ul></details>`}
