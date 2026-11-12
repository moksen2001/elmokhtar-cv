
/* ---------- Version ordinateur ---------- */
const HT=document.documentElement,DESK=()=>HT.classList.contains('desk');
const PRE=['login','onb','signup','otp'];
const DKP={detail:'explore',invest:'explore',pay:'explore',kyc:'explore',ok:'explore',coop:'explore',receipt:'wallet',donok:'don',chat:'messages',notifs:'home',identite:'profil',conditions:'profil',contact:'profil',paym:'profil'};
const DKR={
 home:{top:['.hhead'],aside:['.pf','.ticker','.feed-prev']},
 detail:{top:['.topbar'],aside:['.fundbox','.sticky-cta','.box.agro','.help-cta','.note']},
 invest:{top:['.topbar'],aside:['.mini-c','.proj','.sticky-cta']},
 wallet:{top:['.topbar'],aside:['.wal','.box:has(.alloc)','.note']},
 suivi:{top:['.ph','.chips'],aside:['.box:has(.sv-head)','.box:has(.chart)']},
 coop:{top:['.topbar'],aside:['.box:has(.map)','.box.agro','.pad:has(.lnk-card)','.note']}
};
function DK(id,el){
 HB.sync();TABIND(id);
 if(id==='conditions'&&el&&!el.querySelector('.credits'))el.insertAdjacentHTML('beforeend',credits());
 app.classList.toggle('pre',PRE.includes(id));
 const on=TABS.includes(id)?'':(DKP[id]||id);
 $$('.tabbar [data-tab],.tabbar [data-dk]').forEach(b=>(b.dataset.tab||b.dataset.dk)===on?b.setAttribute('data-on',''):b.removeAttribute('data-on'));
 const u=$('.dk-user');if(u){const g=S.guest,nm=g?'Mode découverte':`${S.user.first} ${S.user.last||''}`.trim();u.innerHTML=`<span class="av" aria-hidden="true">${g?'?':ini(nm).slice(0,2)}</span><div>${esc(nm)}<small>${g?'Sans compte':S.kyc?'Identité vérifiée':'Investisseur'}</small></div>`}
 const c=$('.dk-cta');if(c)c.hidden=!S.guest;
 const mn=$('.dk-n');if(mn){const k=CV.reduce((s,x)=>s+(x.unread||0),0);mn.hidden=!k||S.guest;mn.textContent=k}
 if(!DESK()||!el)return;
 if(PRE.includes(id)){if(id==='login')return;const w=document.createElement('div');w.className='dk-card';w.append(...el.childNodes);el.append(w);return}
 const r=DKR[id];if(!r)return;
 const kids=[...el.children],g=document.createElement('div'),m=document.createElement('div'),a=document.createElement('div');
 g.className='dk-grid';m.className='dk-main';a.className='dk-aside';
 const pick=sel=>kids.filter(k=>k.matches(sel));
 const top=r.top.flatMap(pick),as=[];
 r.aside.forEach(sel=>pick(sel).forEach(k=>{const p=k.previousElementSibling;if(p&&p.classList.contains('sec-head')&&!as.includes(p))as.push(p);as.push(k)}));
 kids.forEach(k=>{if(!top.includes(k)&&!as.includes(k))m.append(k)});
 a.append(...as);g.append(m,a);el.append(g);
}
(function(){
 const tb=$('.tabbar');
 const b=(k,ic,l,x='')=>`<button class="dk" type="button" data-dk="${k}"><span class="ti">${ic}</span>${l}${x}</button>`;
 tb.insertAdjacentHTML('afterbegin',`<div class="dk dk-brand" aria-hidden="true"><svg viewBox="0 0 100 100"><use href="#mark"/></svg>Baykat</div>`);
 tb.insertAdjacentHTML('beforeend',`<p class="dk dk-lbl">Mon espace</p>${b('wallet',I.wallet,'Portefeuille')}${b('feed',I.leaf,'Nouvelles du terrain')}${b('messages',I.chat,'Messagerie','<span class="dk-n" hidden></span>')}${b('faq',I.help,'Aide et FAQ')}<div class="dk dk-cta" hidden><b>Mode découverte</b>Créez un compte pour investir dès 10${NB}000${NB}FCFA.<button type="button" data-act="join">Créer un compte</button></div><div class="dk dk-spacer"></div><div class="dk dk-user"></div>`);
 tb.addEventListener('click',e=>{const t=e.target.closest('[data-dk]');if(!t)return;const id=t.dataset.dk;if(S.guest&&(id==='wallet'||id==='messages')){toast('Créez un compte pour accéder à cet espace.');return}stack.length=0;stack.push('home',id);show(id,'tab')});
 const lt=$('.login-top');
 lt.insertAdjacentHTML('beforeend',`<ul class="dk-proof"><li><b>8</b>campagnes suivies</li><li><b>10${NB}000</b>FCFA pour commencer</li><li><b>100${NN}%</b>suivi par un agronome</li></ul>`);
 const sw=$('.viewsw'),MQ=matchMedia('(min-width:960px)');
 const pref=()=>{try{return localStorage.getItem('bk-view')}catch(e){return null}};
 function apply(re){const d=MQ.matches&&pref()!=='phone';const was=DESK();HT.classList.toggle('desk',d);if(!d)HT.classList.remove('imp-open');
  $$('button',sw).forEach(x=>x.setAttribute('aria-pressed',String((x.dataset.view==='desk')===d)));
  if(re&&was!==d){const id=stack[stack.length-1];if(id==='login'){DK('login',cur)}else show(id,'none')}}
 sw.addEventListener('click',e=>{const t=e.target.closest('[data-view]');if(!t)return;try{localStorage.setItem('bk-view',t.dataset.view)}catch(e){}apply(true)});
 MQ.addEventListener('change',()=>apply(true));
 const ib=$('.imp-btn'),pn=$('#panel');
 ($('#panel-body')||pn).insertAdjacentHTML('beforeend',credits());
 pn.insertAdjacentHTML('afterbegin',`<button class="dk dk-close" type="button" aria-label="Fermer le panneau">${I.x}</button>`);
 const imp=o=>{HT.classList.toggle('imp-open',o);ib.setAttribute('aria-expanded',String(o))};
 ib.addEventListener('click',()=>imp(!HT.classList.contains('imp-open')));
 $('.dk-close',pn).addEventListener('click',()=>{imp(false);ib.focus()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&HT.classList.contains('imp-open'))imp(false)});
 $$('[data-jump]',pn).forEach(x=>x.addEventListener('click',()=>{if(DESK())imp(false)}));
 HB.init(()=>stack.length-1,()=>back());
 apply(false);DK('login',cur);
})();
