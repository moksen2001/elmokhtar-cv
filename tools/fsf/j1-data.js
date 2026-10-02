/* ================= data (sources: tools/fsf/sources.md — checked 2 Oct 2026) ================= */
const CREDITS=/*CREDITS*/{};
const NOW0=Date.parse('2026-10-02T08:00:00Z'); // data snapshot

/* ---------- official channels (verified, see sources.md §3) ---------- */
const SOCIAL=[
 {k:'web',g:'p_web',n:'fsfoot.sn',d:{fr:'Site officiel de la FSF',en:'FSF official website'},u:'https://fsfoot.sn/'},
 {k:'ig',g:'p_ig',n:'@fsfofficielle',d:{fr:'Instagram de la Fédération',en:'Federation Instagram'},u:'https://www.instagram.com/fsfofficielle/',f:'1,48 M'},
 {k:'ig',g:'p_ig',n:'@gaindeyi',d:{fr:'Instagram des Lions (équipes masculines)',en:'Lions Instagram (men’s teams)'},u:'https://www.instagram.com/gaindeyi/',f:'486 k'},
 {k:'ig',g:'p_ig',n:'@gaindeyifeminine',d:{fr:'Instagram des Lionnes',en:'Lionesses Instagram'},u:'https://www.instagram.com/gaindeyifeminine/',f:'106 k'},
 {k:'yt',g:'p_yt',n:'FSF TV',d:{fr:'Chaîne YouTube officielle',en:'Official YouTube channel'},u:'https://www.youtube.com/@fsfofficielle',f:'355 k'},
 {k:'tt',g:'p_tt',n:'@fsfofficielle',d:{fr:'TikTok officiel de la FSF',en:'FSF official TikTok'},u:'https://www.tiktok.com/@fsfofficielle',f:'2,1 M'},
 {k:'x',g:'p_x',n:'@Fsfofficielle',d:{fr:'X de la Fédération',en:'Federation on X'},u:'https://x.com/Fsfofficielle'},
 {k:'fb',g:'p_fb',n:'fsfOfficielle',d:{fr:'Page Facebook de la FSF',en:'FSF Facebook page'},u:'https://www.facebook.com/fsfOfficielle/'}
];

/* ---------- teams ---------- */
const TEAMS=[
 {k:'A',n:{fr:'Lions',en:'Lions'},s:{fr:'Équipe A',en:'Senior men'}},
 {k:'F',n:{fr:'Lionnes',en:'Lionesses'},s:{fr:'Équipe A féminine',en:'Senior women'}},
 {k:'U23',n:{fr:'U-23',en:'U-23'},s:{fr:'Lions U-23',en:'Lions U-23'}},
 {k:'U20',n:{fr:'U-20',en:'U-20'},s:{fr:'Lions U-20',en:'Lions U-20'}},
 {k:'U17',n:{fr:'U-17',en:'U-17'},s:{fr:'Lionceaux U-17',en:'U-17 Cubs'}},
 {k:'BS',n:{fr:'Beach Soccer',en:'Beach Soccer'},s:{fr:'Lions de la plage',en:'Beach Lions'}}
];
const TEAM=k=>TEAMS.find(t=>t.k===k)||TEAMS[0];
const NAT={SEN:{fr:'Sénégal',en:'Senegal'},COM:{fr:'Comores',en:'Comoros'},MOZ:{fr:'Mozambique',en:'Mozambique'},ETH:{fr:'Éthiopie',en:'Ethiopia'},SUD:{fr:'Soudan',en:'Sudan'},IRQ:{fr:'Irak',en:'Iraq'},FRA:{fr:'France',en:'France'},NOR:{fr:'Norvège',en:'Norway'},BEL:{fr:'Belgique',en:'Belgium'},PER:{fr:'Pérou',en:'Peru'},GAM:{fr:'Gambie',en:'Gambia'},MAR:{fr:'Maroc',en:'Morocco'},TUN:{fr:'Tunisie',en:'Tunisia'},COD:{fr:'RD Congo',en:'DR Congo'},NGA:{fr:'Nigeria',en:'Nigeria'}};
const nat=c=>tx(NAT[c])||c;

/* ---------- fixtures (real, announced by the FSF) ---------- */
const FIX=[
 {id:'u20-cod-1',t:'U20',h:'SEN',a:'COD',ko:'2026-10-01T16:00:00Z',comp:{fr:'Match amical',en:'Friendly'},v:'Stade Léopold Sédar Senghor',c:'Dakar',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'u17-fra-1',t:'U17',h:'FRA',a:'SEN',day:'2026-10-02',comp:{fr:'Amical · prépa Mondial U-17',en:'Friendly · U-17 World Cup prep'},v:'Clairefontaine',c:'France',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'u23-gam-1',t:'U23',h:'SEN',a:'GAM',ko:'2026-10-03T16:00:00Z',comp:{fr:'Match amical',en:'Friendly'},v:'Stade Léopold Sédar Senghor',c:'Dakar',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'bs-nga-1',t:'BS',h:'NGA',a:'SEN',day:'2026-10-03',comp:{fr:'Amical · prépa CAN Beach Soccer',en:'Friendly · Beach AFCON prep'},v:'Abuja',c:'Nigeria',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'sen-com',t:'A',h:'SEN',a:'COM',ko:'2026-10-04T13:00:00Z',comp:{fr:'Match amical',en:'Friendly'},v:'CEPAC Vélodrome',c:'Marseille',big:1,
  tk:'https://www.cepacvelodrome.com/senegal-comores-e43.html',src:'https://fsfoot.sn/actualites/senegal-comores-a-marseille-le-4-octobre-2026/',
  info:{fr:'Match de gala au stade de l’OM, après les deux premières journées des éliminatoires de la CAN 2027. Billets dès 15 € sur le site du stade.',en:'Gala match at OM’s stadium, after the first two 2027 AFCON qualifiers. Tickets from €15 on the stadium website.'}},
 {id:'u20-cod-2',t:'U20',h:'SEN',a:'COD',ko:'2026-10-04T16:00:00Z',comp:{fr:'Match amical',en:'Friendly'},v:'Stade Léopold Sédar Senghor',c:'Dakar',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'u17-fra-2',t:'U17',h:'FRA',a:'SEN',day:'2026-10-04',comp:{fr:'Amical · prépa Mondial U-17',en:'Friendly · U-17 World Cup prep'},v:'Clairefontaine',c:'France',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'u23-gam-2',t:'U23',h:'SEN',a:'GAM',ko:'2026-10-05T16:00:00Z',comp:{fr:'Match amical',en:'Friendly'},v:'Stade Léopold Sédar Senghor',c:'Dakar',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'bs-nga-2',t:'BS',h:'NGA',a:'SEN',day:'2026-10-05',comp:{fr:'Amical · prépa CAN Beach Soccer',en:'Friendly · Beach AFCON prep'},v:'Abuja',c:'Nigeria',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'f-tun-1',t:'F',h:'TUN',a:'SEN',day:'2026-10-08',comp:{fr:'Qualif. JO 2028 · 2e tour, aller',en:'2028 Olympics qualifier · R2, 1st leg'},v:'Tunis',c:'Tunisie',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'f-tun-2',t:'F',h:'SEN',a:'TUN',day:'2026-10-13',comp:{fr:'Qualif. JO 2028 · 2e tour, retour',en:'2028 Olympics qualifier · R2, 2nd leg'},v:'Dakar',c:'Sénégal',src:'https://fsfoot.sn/actualites/listes-selections/'},
 {id:'sen-sud',t:'A',h:'SEN',a:'SUD',month:'2026-11',comp:{fr:'Qualif. CAN 2027 · J3–J4 (aller-retour)',en:'2027 AFCON qualifiers · MD3–MD4 (two legs)'},v:{fr:'Lieu à confirmer',en:'Venue TBC'},c:'',tbc:1,src:'https://fsfoot.sn/actualites/les-lions-ont-rejoint-marseille-apres-leur-double-deplacement-au-mozambique-et-en-ethiopie/'},
 {id:'bs-can',t:'BS',h:'SEN',a:null,day:'2026-11-28',end:'2026-12-06',comp:{fr:'CAN Beach Soccer 2026 · au Sénégal',en:'Beach Soccer AFCON 2026 · in Senegal'},v:{fr:'Sénégal (pays hôte)',en:'Senegal (hosts)'},c:'',src:'https://fsfoot.sn/actualites/reprogrammation-can-beach-soccer-2026/'}
];
/* ---------- results (real) ---------- */
const RES=[
 {id:'eth-sen',t:'A',d:'2026-09-29',h:'ETH',a:'SEN',hs:0,as:1,comp:{fr:'Qualif. CAN 2027 · J2',en:'2027 AFCON qualifier · MD2'},v:'Bahir Dar Stadium',g:[['a','Ibrahim Mbaye',"11'"]],src:'https://fsfoot.sn/actualites/le-senegal-domine-lethiopie-et-poursuit-sa-route-vers-la-can-2027/'},
 {id:'moz-sen',t:'A',d:'2026-09-25',h:'MOZ',a:'SEN',hs:1,as:1,comp:{fr:'Qualif. CAN 2027 · J1',en:'2027 AFCON qualifier · MD1'},v:'Estádio do Zimpeto, Maputo',g:[['a','Nicolas Jackson',"32'"],['h','Geny Catamo',"45+'"]],src:'https://fsfoot.sn/actualites/eliminatoires-can-2027-le-senegal-accroche-par-le-mozambique-pour-son-premier-match/'},
 {id:'bel-sen',t:'A',d:'2026-07-01',h:'BEL',a:'SEN',hs:3,as:2,aet:1,comp:{fr:'Coupe du monde 2026 · 16es de finale',en:'2026 World Cup · Round of 32'},v:'Lumen Field, Seattle',g:[['a','Habib Diarra',"24'"],['a','Ismaïla Sarr',"51'"],['h','Romelu Lukaku',"86'"],['h','Youri Tielemans',"89', 120+5' (pen.)"]],src:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {id:'sen-irq',t:'A',d:'2026-06-26',h:'SEN',a:'IRQ',hs:5,as:0,replay:1,comp:{fr:'Coupe du monde 2026 · Groupe I',en:'2026 World Cup · Group I'},v:'BMO Field, Toronto',g:[['h','Habib Diarra',"4'"],['h','Ismaïla Sarr',"56'"],['h','Pape Gueye',"59', 71'"],['h','Iliman Ndiaye',"82'"]],src:'https://fdp.fifa.org/assetspublic/ce281/r12502/pdf/FullTimeMatchReport-English.pdf'},
 {id:'nor-sen',t:'A',d:'2026-06-22',h:'NOR',a:'SEN',hs:3,as:2,comp:{fr:'Coupe du monde 2026 · Groupe I',en:'2026 World Cup · Group I'},v:'MetLife Stadium',g:[['a','Ismaïla Sarr',"53', 90+3'"]],src:'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_I'},
 {id:'fra-sen',t:'A',d:'2026-06-16',h:'FRA',a:'SEN',hs:3,as:1,comp:{fr:'Coupe du monde 2026 · Groupe I',en:'2026 World Cup · Group I'},v:'MetLife Stadium',g:[['a','Ibrahim Mbaye',"90+5'"]],src:'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_I'},
 {id:'sen-gam',t:'A',d:'2026-03-31',h:'SEN',a:'GAM',hs:3,as:1,comp:{fr:'Match amical',en:'Friendly'},v:'Stade Abdoulaye Wade',g:[['h','Abdoulaye Seck',"45+4'"],['h','Ibrahim Mbaye',"47'"],['h','Lamine Camara',"90+5'"]],src:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {id:'sen-per',t:'A',d:'2026-03-28',h:'SEN',a:'PER',hs:2,as:0,comp:{fr:'Match amical',en:'Friendly'},v:'Stade de France',g:[['h','Nicolas Jackson',"41'"],['h','Ismaïla Sarr',"54'"]],src:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {id:'sen-mar',t:'A',d:'2026-01-18',h:'SEN',a:'MAR',hs:1,as:0,aet:1,disp:1,comp:{fr:'CAN 2025 · Finale',en:'2025 AFCON · Final'},v:'Stade Prince Moulay Abdellah, Rabat',g:[['h','Pape Gueye',"94'"]],src:'https://www.bbc.com/sport/football/articles/ce949glzzglo',
  note:{fr:'Score sur le terrain. Le jury d’appel de la CAF a déclaré le match perdu par forfait (3-0) le 17 mars 2026 ; la FSF a saisi le TAS, audience fixée au 8 octobre 2026.',en:'Score on the pitch. On 17 March 2026 the CAF Appeal Board declared a forfeit (3-0); the FSF appealed to CAS, hearing set for 8 October 2026.'}}
];
/* U-17 results announced by FSF TV (WAFU-A U-17 tournament, Sept. 2026) */
const RES_U17=[{h:'SEN',a:'MTN',hs:4,as:0},{h:'SLE',a:'SEN',hs:0,as:5},{h:'SEN',a:'GAM',hs:0,as:0},{h:'SEN',a:'GUI',hs:3,as:0}];
const STAND=[ // CAN 2027 qualifiers, group J after MD2 (FSF, 30 Sep 2026)
 {c:'MOZ',p:2,w:1,d:1,l:0,gf:5,ga:2,pts:4},{c:'SEN',p:2,w:1,d:1,l:0,gf:2,ga:1,pts:4},{c:'SUD',p:2,w:1,d:0,l:1,gf:2,ga:4,pts:3},{c:'ETH',p:2,w:0,d:0,l:2,gf:0,ga:2,pts:0}];

/* ---------- squad: list published on fsfoot.sn/lions-du-senegal (2 Oct 2026) ---------- */
/* no/caps/goals = official FIFA World Cup 2026 squad data (11 June 2026) when the player was in it */
const SQ=[
 {id:'diaw',n:'Mory Diaw',p:'GK',r:{fr:'Gardien',en:'Goalkeeper'},cl:'Al-Shabab',dob:'1993-06-22',no:23,cp:5,gl:0},
 {id:'ydiouf',sn:'Y. Diouf',n:'Yehvann Diouf',p:'GK',r:{fr:'Gardien',en:'Goalkeeper'},cl:'OGC Nice',dob:'1999-11-16',no:1,cp:2,gl:0,ph:'p-ydiouf',so:{ig:'yehvann'}},
 {id:'mndiaye',sn:'M. Ndiaye',n:'Mamour Ndiaye',p:'GK',r:{fr:'Gardien',en:'Goalkeeper'},cl:'AS Saint-Étienne',dob:'2005-10-22'},
 {id:'thiam',sn:'D. Thiam',n:'Ngagne Demba Thiam',p:'GK',r:{fr:'Gardien',en:'Goalkeeper'},cl:'AC Monza'},
 {id:'sane',sn:'S. Sané',n:'Sadibou Sané',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'AS Monaco',dob:'2004-06-10'},
 {id:'sangante',n:'Arona Sangante',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'Séville FC'},
 {id:'sy',sn:'L. Sy',n:'Lamine Sy',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'AJ Auxerre',dob:'2002-08-10',nw:1},
 {id:'ehmdiouf',sn:'E. H. M. Diouf',n:'El Hadji Malick Diouf',p:'DF',r:{fr:'Arrière gauche',en:'Left-back'},cl:'Brentford FC',dob:'2004-12-29',no:25,cp:20,gl:1,ph:'p-ehmdiouf',so:{ig:'el_hadji_malick_diouf26'}},
 {id:'koulibaly',n:'Kalidou Koulibaly',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'Al-Hilal',dob:'1991-06-20',no:3,cp:104,gl:2,cap:1,ph:'p-koulibaly',so:{ig:'kkoulibaly26',x:'kkoulibaly26'}},
 {id:'nmendy',sn:'N. Mendy',n:'Nobel Mendy',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'Hull City',dob:'2004-09-03'},
 {id:'niakhate',n:'Moussa Niakhaté',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'Olympique Lyonnais',dob:'1996-03-08',no:19,cp:32,gl:0,ph:'p-niakhate'},
 {id:'msarr',sn:'Mam. Sarr',n:'Mamadou Sarr',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'Real Sociedad',dob:'2005-08-29',no:2,cp:8,gl:0,ph:'p-msarr'},
 {id:'malang',sn:'Malang Sarr',n:'Malang Sarr',p:'DF',r:{fr:'Défenseur central',en:'Centre-back'},cl:'Neom SC',dob:'1999-01-23',nw:1,ph:'p-malang'},
 {id:'camara',sn:'L. Camara',n:'Lamine Camara',p:'MF',r:{fr:'Milieu central',en:'Central midfielder'},cl:'AS Monaco',dob:'2004-01-01',no:8,cp:45,gl:7,ph:'p-camara',so:{ig:'lamine_camara_15'}},
 {id:'igueye',sn:'I. Gana Gueye',n:'Idrissa Gana Gueye',p:'MF',r:{fr:'Milieu défensif',en:'Defensive midfielder'},cl:'Al-Diriyah',dob:'1989-09-26',no:5,cp:132,gl:7,ph:'p-igueye',so:{ig:'iganagueye',x:'IGanaGueye'},rec:{fr:'Recordman des sélections',en:'Most-capped player'}},
 {id:'pgueye',sn:'P. Gueye',n:'Pape Gueye',p:'MF',r:{fr:'Milieu central',en:'Central midfielder'},cl:'Villarreal',dob:'1999-01-24',no:26,cp:42,gl:5,ph:'p-pgueye',so:{ig:'p.gueye24'},wc:2},
 {id:'bara',sn:'B. S. Ndiaye',n:'Bara Sapoko Ndiaye',p:'MF',r:{fr:'Milieu central',en:'Central midfielder'},cl:'Bayern Munich',dob:'2007-12-31',no:22,cp:1,gl:0,ph:'p-bara'},
 {id:'rassoul',sn:'R. Ndiaye',n:'Rassoul Ndiaye',p:'MF',r:{fr:'Milieu central',en:'Central midfielder'},cl:'Le Havre AC',dob:'2001-12-11',nw:1},
 {id:'pmsarr',sn:'P. M. Sarr',n:'Pape Matar Sarr',p:'MF',r:{fr:'Milieu central',en:'Central midfielder'},cl:'Juventus',dob:'2002-09-14',no:17,cp:40,gl:4,ph:'p-pmsarr'},
 {id:'diakhon',n:'Mamadou Diakhon',p:'FW',r:{fr:'Ailier droit',en:'Right winger'},cl:'Club Brugge',dob:'2005-09-22',ph:'p-diakhon'},
 {id:'diao',n:'Assane Diao',p:'FW',r:{fr:'Ailier gauche',en:'Left winger'},cl:'Como 1907',dob:'2005-09-07',no:7,cp:5,gl:0,ph:'p-diao',so:{ig:'assandiao.8'}},
 {id:'pmfall',sn:'P. M. Fall',n:'Pape Moussa Fall',p:'FW',r:{fr:'Attaquant',en:'Forward'},cl:'FC Metz',dob:'2004-07-04'},
 {id:'jackson',n:'Nicolas Jackson',p:'FW',r:{fr:'Avant-centre',en:'Centre-forward'},cl:'Aston Villa',dob:'2001-06-20',no:11,cp:33,gl:8,ph:'p-jackson',so:{ig:'jackson.nj11'}},
 {id:'mbaye',n:'Ibrahim Mbaye',p:'FW',r:{fr:'Ailier droit',en:'Right winger'},cl:'Aston Villa',dob:'2008-01-24',no:20,cp:11,gl:3,ph:'p-mbaye',wc:1},
 {id:'iliman',sn:'I. Ndiaye',n:'Iliman Ndiaye',p:'FW',r:{fr:'Attaquant',en:'Forward'},cl:'Manchester City',dob:'2000-03-06',no:13,cp:41,gl:4,ph:'p-iliman',wc:1},
 {id:'isarr',sn:'I. Sarr',n:'Ismaïla Sarr',p:'FW',r:{fr:'Ailier droit',en:'Right winger'},cl:'Crystal Palace',dob:'1998-02-25',no:18,cp:84,gl:19,ph:'p-isarr',wc:4},
 {id:'soumare',n:'Issa Soumaré',p:'FW',r:{fr:'Attaquant',en:'Forward'},cl:'Stade Rennais',dob:'2000-10-10'},
 {id:'sima',n:'Abdallah Sima',p:'FW',r:{fr:'Ailier gauche',en:'Left winger'},cl:'RC Lens',dob:'2001-06-17',ph:'p-sima'},
 {id:'dia',sn:'B. Dia',n:'Boulaye Dia',p:'FW',r:{fr:'Avant-centre',en:'Centre-forward'},cl:'Stade Rennais',dob:'1996-11-16',ph:'p-dia'}
];
const STAFF=[
 {id:'vieira',n:'Patrick Vieira',r:{fr:'Sélectionneur des Lions · nommé le 18 août 2026',en:'Lions head coach · appointed 18 Aug 2026'},ph:'p-vieira',so:{ig:'officialpatrickvieira',x:'OfficialVieira'}},
 {id:'aidara',n:'Issa Aidara',r:{fr:'Entraîneur adjoint',en:'Assistant coach'}},
 {id:'kfaye',n:'Khadim Faye',r:{fr:'Entraîneur des gardiens',en:'Goalkeeping coach'}},
 {id:'afall',n:'Alioune Abitalib Fall',r:{fr:'Sélectionneur des Lionnes',en:'Lionesses head coach'}},
 {id:'lsane',n:'Lamine Sané',r:{fr:'Sélectionneur des U-17',en:'U-17 head coach'}}
];
const POS={GK:{fr:'Gardiens',en:'Goalkeepers'},DF:{fr:'Défenseurs',en:'Defenders'},MF:{fr:'Milieux',en:'Midfielders'},FW:{fr:'Attaquants',en:'Forwards'}};
const P=id=>SQ.find(p=>p.id===id);
const ageOf=dob=>{if(!dob)return null;const d=new Date(dob),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;return a;};
const initials=n=>n.split(/[\s-]+/).filter(w=>/^[A-ZÀ-Ý]/.test(w)).map(w=>w[0]).join('').slice(-2);
const shortN=n=>{const p=SQ.find(x=>x.n===n);if(p&&p.sn)return p.sn;const w=n.split(' ');return w[w.length-1];};

/* ---------- live replay: Sénégal 5-0 Irak (FIFA match report, 26 Jun 2026) ---------- */
const REPLAY={id:'sen-irq',h:'SEN',a:'IRQ',d:'2026-06-26',v:'BMO Field, Toronto',att:43036,ref:'Anthony Taylor (ENG)',coach:'Pape Thiaw',add:[9,6],
 xi:[[23,'Mory Diaw','GK',null],[15,'Krépin Diatta','RB',null],[4,'Abdoulaye Seck','CB',null],[19,'Moussa Niakhaté','CB','niakhate'],[14,'Ismail Jakobs','LB',null],[21,'Habib Diarra','CM',null],[5,'Idrissa Gana Gueye','DM','igueye'],[8,'Lamine Camara','CM','camara'],[20,'Ibrahim Mbaye','RW','mbaye'],[18,'Ismaïla Sarr','CF','isarr'],[10,'Sadio Mané','LW',null]],
 bench:[[11,'Nicolas Jackson','jackson'],[13,'Iliman Ndiaye','iliman'],[26,'Pape Gueye','pgueye'],[6,'Pathé Ciss',null],[7,'Assane Diao','diao']],
 ev:[
  {m:4,k:'goal',s:'h',p:'Habib Diarra',n:21,as:'Abdoulaye Seck'},
  {m:13,k:'red',s:'a',p:'Rebin Sulaka',n:2},
  {m:16,k:'sub',s:'a',on:'Munaf Younus',off:'Ahmed Qasem'},
  {m:18,k:'yel',s:'h',p:'Abdoulaye Seck',n:4},
  {m:45,k:'ht'},
  {m:46,k:'sub',s:'a',on:'Jalal Hassan',off:'Ahmed Basil',ht:1},
  {m:56,k:'goal',s:'h',p:'Ismaïla Sarr',n:18,as:'Lamine Camara'},
  {m:56,k:'sub',s:'h',on:'Nicolas Jackson',off:'Lamine Camara',n:11},
  {m:56,k:'sub',s:'h',on:'Iliman Ndiaye',off:'Ibrahim Mbaye',n:13},
  {m:56,k:'sub',s:'h',on:'Pape Gueye',off:'Habib Diarra',n:26},
  {m:57,k:'sub',s:'a',on:'Ahmed Maknazi',off:'Ali Jasim'},
  {m:57,k:'sub',s:'a',on:'Ali Yousif',off:'Ali Alhamadi'},
  {m:58,k:'sub',s:'h',on:'Pathé Ciss',off:'Abdoulaye Seck',n:6},
  {m:59,k:'goal',s:'h',p:'Pape Gueye',n:26,as:'Ismaïla Sarr'},
  {m:67,k:'sub',s:'a',on:'Kevin Yakob',off:'Zidane Iqbal'},
  {m:71,k:'goal',s:'h',p:'Pape Gueye',n:26,as:'Iliman Ndiaye'},
  {m:75,k:'yel',s:'a',p:'Amir Alammari',n:16},
  {m:81,k:'sub',s:'h',on:'Assane Diao',off:'Ismaïla Sarr',n:7},
  {m:81,k:'yel',s:'h',p:'Pape Gueye',n:26},
  {m:82,k:'goal',s:'h',p:'Iliman Ndiaye',n:13,as:'Pape Gueye'},
  {m:90,k:'yel',s:'a',p:'Merchas Doski',n:23},
  {m:96,k:'ft'}
 ],
 stats:[[{fr:'Possession',en:'Possession'},58.6,30.7,'%'],[{fr:'Buts attendus (xG)',en:'Expected goals (xG)'},2.7,.21,''],[{fr:'Tirs',en:'Attempts'},27,6,''],[{fr:'Tirs cadrés',en:'On target'},11,1,''],[{fr:'Passes réussies',en:'Completed passes'},523,200,''],[{fr:'Précision des passes',en:'Pass completion'},89,71,'%'],[{fr:'Centres',en:'Crosses'},29,5,''],[{fr:'Distance parcourue',en:'Distance covered'},111.9,104.7,' km']],
 motm:'pgueye',src:'https://fdp.fifa.org/assetspublic/ce281/r12502/pdf/FullTimeMatchReport-English.pdf'
};

/* ---------- FSF TV videos (official channel, embeddable, oEmbed-checked 2 Oct 2026) ---------- */
const VIDEOS=[
 {id:'mD5sWK93qQM',t:{fr:'Long voyage, ludo à bord, accueil chaleureux… Embarquez avec les Lions !',en:'Long trip, ludo on board, warm welcome… Travel with the Lions!'},d:'6:31',at:'2026-09-28',ph:'team',tag:{fr:'Coulisses',en:'Behind the scenes'}},
 {id:'NsPNuIfj4fU',t:{fr:'Entraînement des Lions : la remontada de la team Iliman, Koulibaly, Ib Mbaye, Bara…',en:'Lions training: the comeback of team Iliman, Koulibaly, Ib Mbaye, Bara…'},d:'10:30',at:'2026-09-27',ph:'p-iliman',tag:{fr:'Entraînement',en:'Training'},pl:['iliman','koulibaly','mbaye','bara']},
 {id:'CCEmJejC7rc',t:{fr:'Réaction d’Idrissa Gana Guèye en wolof après la victoire face à l’Éthiopie',en:'Idrissa Gana Guèye reacts in Wolof after the win over Ethiopia'},d:'2:39',at:'2026-09-30',ph:'p-igueye',tag:{fr:'Réaction',en:'Reaction'},pl:['igueye']},
 {id:'36yTbJvCiqI',t:{fr:'Éthiopie - Sénégal (0-1) : la conférence de presse d’après-match',en:'Ethiopia - Senegal (0-1): post-match press conference'},d:'5:19',at:'2026-09-30',ph:'p-mbaye',tag:{fr:'Conférence',en:'Press'}},
 {id:'JBH79Rh3r2g',t:{fr:'Éthiopie vs Sénégal : extraits de la séance de veille de match',en:'Ethiopia vs Senegal: eve-of-match training'},d:'4:49',at:'2026-09-29',ph:'p-koulibaly',tag:{fr:'Entraînement',en:'Training'}},
 {id:'MLGPwVSfBvQ',t:{fr:'Travail spécifique des gardiens avec leur coach Khadim Faye',en:'Goalkeepers’ session with their coach Khadim Faye'},d:'4:40',at:'2026-09-27',ph:'p-ydiouf',tag:{fr:'Gardiens',en:'Goalkeepers'},pl:['ydiouf','diaw','mndiaye','thiam']},
 {id:'zfMZjDrtpRU',t:{fr:'Patrick Vieira : « On a identifié les manques, on va les combler avec du travail… »',en:'Patrick Vieira: “We’ve identified what’s missing, we’ll fix it with work…”'},d:'2:35',at:'2026-09-26',ph:'p-vieira',tag:{fr:'Sélectionneur',en:'Head coach'}},
 {id:'dgyL66hR_FE',t:{fr:'Kalidou Koulibaly : « Continuer à intégrer les nouveaux, ce sont eux le futur »',en:'Kalidou Koulibaly: “Keep integrating the newcomers, they are the future”'},d:'1:21',at:'2026-09-27',ph:'p-koulibaly',tag:{fr:'Interview',en:'Interview'},pl:['koulibaly']},
 {id:'SbzLMwjCU6I',t:{fr:'Iliman Ndiaye : « On veut continuer à gagner des titres avec l’équipe nationale »',en:'Iliman Ndiaye: “We want to keep winning titles with the national team”'},d:'1:01',at:'2026-09-27',ph:'p-iliman',tag:{fr:'Interview',en:'Interview'},pl:['iliman']},
 {id:'O7RTlMdHtQ4',t:{fr:'Préparation Mondial U17 Qatar 2026 : les Lionceaux à Paris',en:'U-17 World Cup Qatar 2026 prep: the Cubs in Paris'},d:'9:34',at:'2026-10-01',ph:'fans-2',tag:{fr:'U-17',en:'U-17'}}
];

/* ---------- stories (photos Wikimedia Commons, captions factual) ---------- */
const STORIES=[
 {id:'wc',t:{fr:'Mondial 2026',en:'World Cup 2026'},cv:'team',sl:[
  {ph:'team',k:{fr:'16 juin 2026 · MetLife Stadium',en:'16 June 2026 · MetLife Stadium'},c:{fr:'Les Lions alignés pour l’hymne avant France–Sénégal, premier match du Mondial 2026.',en:'The Lions line up for the anthem before France–Senegal, their first 2026 World Cup game.'}},
  {ph:'p-koulibaly',k:{fr:'Le capitaine',en:'The captain'},c:{fr:'Kalidou Koulibaly, 104 sélections au coup d’envoi du Mondial.',en:'Kalidou Koulibaly, 104 caps at the start of the World Cup.'}},
  {ph:'a-mane',k:{fr:'Le n°10',en:'The number 10'},c:{fr:'Sadio Mané, meilleur buteur de l’histoire des Lions (55 buts).',en:'Sadio Mané, the Lions’ all-time top scorer (55 goals).'}},
  {ph:'p-mbaye',k:{fr:'90+5’',en:'90+5’'},c:{fr:'À 18 ans, Ibrahim Mbaye marque le premier but sénégalais du tournoi.',en:'Aged 18, Ibrahim Mbaye scores Senegal’s first goal of the tournament.'}},
  {ph:'a-jackson',k:{fr:'N. Jackson · 11',en:'N. Jackson · 11'},c:{fr:'Nicolas Jackson, avant-centre des Lions.',en:'Nicolas Jackson, the Lions’ centre-forward.'}}]},
 {id:'fans',t:{fr:'12e Gaïndé',en:'12th Lion'},cv:'fans-1',sl:[
  {ph:'fans-1',k:{fr:'Mondial 2018 · Pologne–Sénégal',en:'2018 World Cup · Poland–Senegal'},c:{fr:'Les supporters sénégalais en tribune à Moscou, le jour de la victoire 2-1 sur la Pologne.',en:'Senegal fans in the stands in Moscow on the day of the 2-1 win over Poland.'}},
  {ph:'fans-2',k:{fr:'Mondial 2018 · Iekaterinbourg',en:'2018 World Cup · Yekaterinburg'},c:{fr:'Avant Japon–Sénégal (2-2) : le drapeau vert-or-rouge dans les rues de Russie.',en:'Before Japan–Senegal (2-2): the green-gold-red flag in Russia’s streets.'}},
  {ph:'fans-4',k:{fr:'6 février 2022',en:'6 February 2022'},c:{fr:'Le jour du premier titre de champion d’Afrique : tout un pays derrière ses Lions.',en:'The day of the first AFCON title: a whole country behind its Lions.'}}]},
 {id:'tv',t:{fr:'FSF TV',en:'FSF TV'},cv:'p-iliman',sl:[
  {ph:'p-iliman',k:{fr:'Vidéo · 10:30',en:'Video · 10:30'},c:{fr:'Entraînement des Lions : la remontada de la team Iliman, Koulibaly, Ib Mbaye, Bara…',en:'Lions training: the comeback of team Iliman, Koulibaly, Ib Mbaye, Bara…'},v:'NsPNuIfj4fU'},
  {ph:'p-ydiouf',k:{fr:'Vidéo · 4:40',en:'Video · 4:40'},c:{fr:'Les gardiens au travail avec Khadim Faye.',en:'The goalkeepers at work with Khadim Faye.'},v:'MLGPwVSfBvQ'},
  {ph:'team',k:{fr:'Vidéo · 6:31',en:'Video · 6:31'},c:{fr:'Long voyage, ludo à bord, accueil chaleureux… Embarquez avec les Lions !',en:'Long trip, ludo on board, warm welcome… Travel with the Lions!'},v:'mD5sWK93qQM'}]},
 {id:'dakar',t:{fr:'Teranga',en:'Teranga'},cv:'dakar-1',sl:[
  {ph:'dakar-1',k:{fr:'Pointe des Almadies · Dakar',en:'Pointe des Almadies · Dakar'},c:{fr:'Le point le plus à l’ouest de l’Afrique continentale.',en:'The westernmost point of mainland Africa.'}},
  {ph:'fans-3',k:{fr:'Champions d’Afrique',en:'African champions'},c:{fr:'6 février 2022 : la fête après la victoire face à l’Égypte en finale de la CAN 2021.',en:'6 February 2022: celebrating the win over Egypt in the 2021 AFCON final.'}}]}
];

/* ---------- quiz (each answer sourced) ---------- */
const QUIZ=[
 {q:{fr:'Pour son tout premier match de Coupe du monde, en 2002, le Sénégal bat le tenant du titre. Lequel ?',en:'In their very first World Cup match, in 2002, Senegal beat the holders. Who?'},o:[{fr:'Le Brésil',en:'Brazil'},{fr:'La France',en:'France'},{fr:'L’Allemagne',en:'Germany'},{fr:'L’Argentine',en:'Argentina'}],a:1,x:{fr:'1-0 à Séoul, but de Papa Bouba Diop (30e).',en:'1-0 in Seoul, Papa Bouba Diop scored (30’).'},s:'https://en.wikipedia.org/wiki/2002_FIFA_World_Cup_Group_A'},
 {q:{fr:'Jusqu’où les Lions sont-ils allés lors de ce Mondial 2002 ?',en:'How far did the Lions go at that 2002 World Cup?'},o:[{fr:'Huitièmes',en:'Round of 16'},{fr:'Quarts de finale',en:'Quarter-finals'},{fr:'Demi-finales',en:'Semi-finals'},{fr:'Phase de groupes',en:'Group stage'}],a:1,x:{fr:'Éliminés par la Turquie en prolongation, après avoir battu la Suède.',en:'Knocked out by Turkey in extra time, after beating Sweden.'},s:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {q:{fr:'Qui a marqué le tir au but décisif de la finale de la CAN 2021 face à l’Égypte ?',en:'Who scored the decisive penalty in the 2021 AFCON final against Egypt?'},o:[{fr:'Kalidou Koulibaly',en:'Kalidou Koulibaly'},{fr:'Idrissa Gana Gueye',en:'Idrissa Gana Gueye'},{fr:'Sadio Mané',en:'Sadio Mané'},{fr:'Famara Diédhiou',en:'Famara Diédhiou'}],a:2,x:{fr:'Premier titre continental du Sénégal.',en:'Senegal’s first continental title.'},s:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {q:{fr:'Combien de buts compte Sadio Mané, meilleur buteur de l’histoire des Lions ?',en:'How many goals has Sadio Mané, the Lions’ all-time top scorer, scored?'},o:[{fr:'35',en:'35'},{fr:'44',en:'44'},{fr:'55',en:'55'},{fr:'61',en:'61'}],a:2,x:{fr:'55 buts en sélection.',en:'55 international goals.'},s:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {q:{fr:'Quel joueur détient le record de sélections avec les Lions ?',en:'Who holds the record for most Senegal caps?'},o:[{fr:'Idrissa Gana Gueye',en:'Idrissa Gana Gueye'},{fr:'Henri Camara',en:'Henri Camara'},{fr:'Kalidou Koulibaly',en:'Kalidou Koulibaly'},{fr:'El Hadji Diouf',en:'El Hadji Diouf'}],a:0,x:{fr:'136 sélections (Wikipédia, mise à jour du 29 septembre 2026).',en:'136 caps (Wikipedia, updated 29 Sept 2026).'},s:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {q:{fr:'Au Mondial 2018, comment le Sénégal a-t-il été éliminé en phase de groupes ?',en:'At the 2018 World Cup, how were Senegal knocked out in the group stage?'},o:[{fr:'À la différence de buts',en:'On goal difference'},{fr:'Au fair-play (cartons)',en:'On fair play (cards)'},{fr:'Par tirage au sort',en:'By drawing lots'},{fr:'Aux buts marqués',en:'On goals scored'}],a:1,x:{fr:'À égalité parfaite avec le Japon, départagés par le nombre de cartons.',en:'Level with Japan, separated by the number of cards.'},s:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {q:{fr:'Quelle est la capacité du stade Abdoulaye-Wade de Diamniadio ?',en:'What is the capacity of the Abdoulaye Wade Stadium in Diamniadio?'},o:[{fr:'30 000',en:'30,000'},{fr:'40 000',en:'40,000'},{fr:'50 000',en:'50,000'},{fr:'65 000',en:'65,000'}],a:2,x:{fr:'Inauguré en février 2022, construit en 18 mois.',en:'Opened in February 2022, built in 18 months.'},s:'https://en.wikipedia.org/wiki/Abdoulaye_Wade_Stadium'},
 {q:{fr:'Quel était l’ancien nom du stade Léopold-Sédar-Senghor ?',en:'What was the Léopold Sédar Senghor Stadium formerly called?'},o:[{fr:'Stade de la Paix',en:'Stade de la Paix'},{fr:'Stade de l’Amitié',en:'Stade de l’Amitié'},{fr:'Stade Demba-Diop',en:'Stade Demba-Diop'},{fr:'Stade de l’Unité',en:'Stade de l’Unité'}],a:1,x:{fr:'Ouvert en 1985, il a accueilli la finale de la CAN 1992.',en:'Opened in 1985, it hosted the 1992 AFCON final.'},s:'https://en.wikipedia.org/wiki/Leopold_S%C3%A9dar_Senghor_Stadium'},
 {q:{fr:'Le 26 juin 2026, Sénégal 5-0 Irak au Mondial. Quel record ?',en:'26 June 2026, Senegal 5-0 Iraq at the World Cup. What record?'},o:[{fr:'Plus large victoire africaine en Coupe du monde',en:'Biggest African win at a World Cup'},{fr:'But le plus rapide du tournoi',en:'Fastest goal of the tournament'},{fr:'Plus jeune buteur africain',en:'Youngest African scorer'},{fr:'Plus grand nombre de tirs',en:'Most shots ever'}],a:0,x:{fr:'Elle dépasse le 4-2 de l’Algérie face à la Corée du Sud (2014).',en:'It beat Algeria’s 4-2 against South Korea (2014).'},s:'https://en.wikipedia.org/wiki/Senegal_national_football_team'},
 {q:{fr:'Le 10 juin 2025, le Sénégal devient la première sélection africaine à battre…',en:'On 10 June 2025, Senegal became the first African side to beat…'},o:[{fr:'L’Angleterre',en:'England'},{fr:'L’Espagne',en:'Spain'},{fr:'Le Portugal',en:'Portugal'},{fr:'Les Pays-Bas',en:'the Netherlands'}],a:0,x:{fr:'Victoire 3-1 à Nottingham.',en:'A 3-1 win in Nottingham.'},s:'https://en.wikipedia.org/wiki/Senegal_national_football_team'}
];

/* ---------- shop (own designs — concept products, no kit-maker / sponsor marks) ---------- */
const SHOP=[
 {id:'home',k:'jersey',n:{fr:'Maillot Teranga · Domicile',en:'Teranga jersey · Home'},d:{fr:'Blanc cassé, chevron tricolore et motif tissé. Création concept Gaïndé.',en:'Off-white, tricolour chevron and woven motif. Gaïndé concept design.'},p:39000,c:['#F4F1E6','#00853F','#FDEF42','#E31B23'],perso:1},
 {id:'away',k:'jersey',n:{fr:'Maillot Baobab · Extérieur',en:'Baobab jersey · Away'},d:{fr:'Vert profond, motif pagne en jaune. Création concept Gaïndé.',en:'Deep green, wax-print motif in yellow. Gaïndé concept design.'},p:39000,c:['#0B5E30','#FDEF42','#06140C','#E31B23'],perso:1},
 {id:'scarf',k:'scarf',n:{fr:'Écharpe Tanière',en:'Den scarf'},d:{fr:'Tricot double face vert, or, rouge.',en:'Double-sided knit in green, gold and red.'},p:9000},
 {id:'bob',k:'cap',n:{fr:'Bob 12e Lion',en:'12th Lion bucket hat'},d:{fr:'Le bob des tribunes, motif tissé.',en:'The terrace bucket hat, woven motif.'},p:7500}
];

/* ---------- ticketing (demo) — Stade Abdoulaye Wade, Diamniadio (50 000 places) ---------- */
const ZONES=[
 {id:'vip',n:{fr:'Tribune présidentielle',en:'Presidential stand'},p:30000,c:'#FDEF42'},
 {id:'ouest',n:{fr:'Tribune Ouest',en:'West stand'},p:10000,c:'#1DB86A'},
 {id:'est',n:{fr:'Tribune Est',en:'East stand'},p:5000,c:'#7BE0A6'},
 {id:'nord',n:{fr:'Virage Nord',en:'North end'},p:2000,c:'#E31B23'},
 {id:'sud',n:{fr:'Virage Sud',en:'South end'},p:2000,c:'#FF7A7F'}
];
/* where to watch (illustrative, demo) */
const ZONESFAN=[
 {c:'Dakar',k:{fr:'Place du Souvenir africain',en:'Place du Souvenir africain'},n:4200},
 {c:'Marseille',k:{fr:'Au stade : CEPAC Vélodrome',en:'At the stadium: CEPAC Vélodrome'},n:6100,real:1},
 {c:'Paris',k:{fr:'Fan zone communautaire (exemple)',en:'Community fan zone (example)'},n:2300},
 {c:'Milan',k:{fr:'Fan zone communautaire (exemple)',en:'Community fan zone (example)'},n:640},
 {c:'Madrid',k:{fr:'Fan zone communautaire (exemple)',en:'Community fan zone (example)'},n:410},
 {c:'New York',k:{fr:'Fan zone communautaire (exemple)',en:'Community fan zone (example)'},n:380},
 {c:'Montréal',k:{fr:'Fan zone communautaire (exemple)',en:'Community fan zone (example)'},n:290}
];

/* ---------- news (real headlines, linked) ---------- */
const NEWS=[
 {d:'2026-09-30',t:{fr:'Les Lions ont rejoint Marseille avant Sénégal–Comores',en:'The Lions have arrived in Marseille ahead of Senegal–Comoros'},u:'https://fsfoot.sn/actualites/les-lions-ont-rejoint-marseille-apres-leur-double-deplacement-au-mozambique-et-en-ethiopie/',s:'fsfoot.sn',ph:'team'},
 {d:'2026-09-29',t:{fr:'Le Sénégal domine l’Éthiopie (1-0) et poursuit sa route vers la CAN 2027',en:'Senegal beat Ethiopia (1-0) on the road to AFCON 2027'},u:'https://fsfoot.sn/actualites/le-senegal-domine-lethiopie-et-poursuit-sa-route-vers-la-can-2027/',s:'fsfoot.sn',ph:'p-mbaye'},
 {d:'2026-09-30',t:{fr:'Finale CAN 2025 : le TAS fixe l’audience au 8 octobre',en:'2025 AFCON final: CAS sets the hearing for 8 October'},u:'https://xalimasn.com/2026/09/30/senegal-maroc-le-tas-fixe-au-8-octobre-laudience-sur-la-finale-de-la-can-2025/',s:'xalimasn.com',ph:'p-pgueye'},
 {d:'2026-09-23',t:{fr:'La FIFA confirme l’éligibilité de Rassoul Ndiaye, Malang Sarr et Lamine Sy',en:'FIFA confirms Rassoul Ndiaye, Malang Sarr and Lamine Sy are eligible'},u:'https://fsfoot.sn/actualites/equipe-nationale-du-senegal-la-fifa-confirme-leligibilite-de-rassoul-ndiaye-malang-sarr-et-lamine-sy/',s:'fsfoot.sn',ph:'p-malang'}
];
