/* ---------- Bouton Retour du navigateur / du téléphone ----------
   Chaque écran ouvert dans le prototype ajoute une entrée d'historique ; Retour referme
   l'écran courant au lieu de quitter la démo. HB.init(profondeur, retour) puis HB.sync()
   après chaque navigation interne. */
const HB=(()=>{let n=0,mute=0,lock=false,pend=false,t=0,depth=null,fn=null;
 try{if(history.state&&history.state.hb)history.replaceState(null,'')}catch(e){}
 const run=()=>{t=0;if(lock||!depth)return;if(mute>0){pend=true;return}
  let d=0;try{d=Math.max(0,depth()|0)}catch(e){return}
  try{if(d>n){while(n<d){n++;history.pushState({hb:n},'')}}
   else if(d<n){const k=d-n;n=d;mute++;history.go(k)}}catch(e){}};
 const sync=()=>{if(!t)t=setTimeout(run,0)};
 addEventListener('popstate',e=>{
  if(mute>0){mute--;if(!mute&&pend){pend=false;sync()}return}
  if(!fn)return;const i=(e.state&&e.state.hb)||0;
  if(i>n){mute++;history.go(n-i);return}
  let k=n-i;n=i;lock=true;try{while(k-->0)fn()}catch(x){}lock=false;setTimeout(sync,450)});
 return {init(d,b){depth=d;fn=b},sync}})();
