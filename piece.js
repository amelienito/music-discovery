/* ════════════════════════════════════════════════════════════════════
   LA PIÈCE — Music Discovery en 3D
   Le salon du même appartement que la vitrine (amelienito.github.io) :
   même parquet, mêmes murs, même fenêtre, vu de face comme une maison
   de poupée. Amélien est dans son fauteuil club en velours, les pieds sur
   le pouf, tourné vers sa chaîne japonaise (ampli à gros vu-mètres,
   analyseur de spectre, tuner, double cassette, écran du lecteur CD, et sur
   le dessus le lecteur CD à chargement par le dessus, son CD qui tourne), avec
   une grande colonne de chaque côté : le son lui arrive des deux côtés.
   Au fond, Talya dort dans son panier, le chat sur le rebord de la fenêtre,
   et la fenêtre montre le vrai moment de la journée (onze tranches,
   chacune avec son ciel).
   Quand la musique joue, la pièce se réchauffe, les boomers poussent l'air,
   des notes partent vers lui, et il vit le morceau. Ton mot devient une
   pensée au-dessus de lui. Sur une vraie pause seulement, tout s'éteint :
   lumière froide, pluie à la fenêtre, un petit nuage, la tête dans les mains.
   Si la 3D ne marche pas, le salon dessiné (salon.js) prend le relais.
   ════════════════════════════════════════════════════════════════════ */
import * as THREE from './vendor/three.module.js';

const conteneurs = [...document.querySelectorAll('[data-salon]')];
const plein = conteneurs.find(c => c.hasAttribute('data-plein')) || null;
const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const racine = document.documentElement;
window.__piece = true;   // le module a bien démarré (sinon index.html remet le salon dessiné)

function webgl() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
// pas de 3D : on rend la main au salon dessiné
function renoncer(e) {
  racine.classList.remove('avec-3d');
  document.body.classList.remove('piece-3d');
  conteneurs.forEach(c => c.classList.remove('en-3d', 'triste'));
  if (e) console.warn('La pièce 3D ne démarre pas : on garde le salon dessiné.', e);
}
// la 3D démarre dès qu'un salon approche de l'écran, dans un moment de calme du navigateur
// (sans attendre toutes les pochettes) ; en attendant, une image de la pièce tient la place
function demarrer() {
  if (demarrer.fait) return; demarrer.fait = true;
  try { lancer(); } catch (e) { renoncer(e); }
}
function guetter() {
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    io.disconnect();
    (window.requestIdleCallback || (f => setTimeout(f, 120)))(demarrer, { timeout: 500 });
  }, { rootMargin: '400px' });
  conteneurs.forEach(c => io.observe(c));
}
if (conteneurs.length && webgl()) {
  // au plus tard une seconde et demie après l'arrivée, même si des pochettes chargent encore (une image de la pièce tient la place)
  let parti = false; const go = () => { if (!parti) { parti = true; guetter(); } };
  if (document.readyState === 'complete') go(); else { addEventListener('load', go, { once: true }); setTimeout(go, 1500); }
} else renoncer();

function lancer() {
  /* ═══════════════ le moteur ═══════════════ */
  const toile = document.createElement('canvas');
  toile.className = 'piece-toile';
  toile.setAttribute('aria-hidden', 'true');
  const tactile = matchMedia('(pointer: coarse)').matches;   // tablette, téléphone : on ménage la mémoire
  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, powerPreference: tactile ? 'low-power' : 'default' });
  rendu.setPixelRatio(Math.min(devicePixelRatio || 1, tactile ? 1.5 : 1.75));
  const OMBRE = tactile ? 512 : 1024;
  rendu.shadowMap.enabled = true;
  rendu.shadowMap.type = THREE.PCFShadowMap;
  rendu.shadowMap.autoUpdate = false;   // recalculées environ 30 fois par seconde (voir la boucle)
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#15110d');
  const camera = new THREE.PerspectiveCamera(36, 2, .05, 60);

  // la pensée : une bulle HTML (le texte reste net), et trois petits ronds jusqu'à sa tête
  const pensee = document.createElement('div');
  pensee.className = 'piece-pensee';
  const penseeTexte = document.createElement('p');
  penseeTexte.className = 'piece-pensee-texte';
  pensee.appendChild(penseeTexte);
  const points = (matchMedia('(min-width: 701px)').matches ? [16, 11, 7] : [12, 8, 5]).map(d => { const p = document.createElement('i'); p.className = 'piece-pensee-point'; p.style.width = p.style.height = d + 'px'; p.dataset.d = d; return p; });

  /* ═══════════════ matériaux et petits outils ═══════════════ */
  const memo = new Map();
  const M = (c, o = {}) => {
    const k = c + JSON.stringify(o);
    if (!memo.has(k)) memo.set(k, new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .82, metalness: 0, flatShading: true }, o)));
    return memo.get(k);
  };
  const poser = (m, parent, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const boite = (w, h, d, mat, parent, x, y, z) => poser(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), parent, x, y, z);
  const cyl = (r1, r2, h, n, mat, parent, x, y, z) => poser(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), mat), parent, x, y, z);
  const bille = (r, mat, parent, x, y, z, d = 1) => poser(new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), mat), parent, x, y, z);
  const gelule = (r, l, mat, parent, x, y, z) => poser(new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 2, 7), mat), parent, x, y, z);
  const groupe = (parent, x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
  const vivant = o => { o.userData.vivant = true; return o; };       // ce qui bouge n'est pas fusionné
  const toileTexte = (w, h) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return { c, x: c.getContext('2d'), t };
  };
  const lisse = (a, b, k) => a + (b - a) * k;
  const borne = (v, a, b) => Math.max(a, Math.min(b, v));
  const COULEURS = ['#b8473a', '#e3b04b', '#2f4a6b', '#d9d2c3', '#3f7a4a', '#7e5aa0', '#1d1c22', '#c87a3e', '#8aa0b8', '#a3352a', '#c8572f', '#2f4a5a'];

  /* ═══════════════ la lumière ═══════════════ */
  const hemi = new THREE.HemisphereLight('#fff1dc', '#5a4632', .8); scene.add(hemi);
  const soleil = new THREE.DirectionalLight('#fff3df', 1); soleil.position.set(1.6, 3.2, -7); soleil.target.position.set(-.4, 0, 0); scene.add(soleil, soleil.target);
  // le plafonnier, comme dans la vitrine
  const plafonnier = new THREE.SpotLight('#ffd9a8', 36, 12, 1.15, .65, 1.4);
  plafonnier.position.set(-.8, 3.7, .45); plafonnier.target.position.set(-.8, 0, -.35);
  plafonnier.castShadow = true; plafonnier.shadow.mapSize.set(OMBRE, OMBRE); plafonnier.shadow.bias = -.0006; plafonnier.shadow.normalBias = .02;
  scene.add(plafonnier, plafonnier.target);
  // la liseuse (la lampe à arc), au-dessus de lui
  const liseuse = new THREE.SpotLight('#ffc98a', 20, 6, .8, .6, 1.5);
  liseuse.castShadow = true; liseuse.shadow.mapSize.set(OMBRE, OMBRE); liseuse.shadow.bias = -.0008; liseuse.shadow.normalBias = .02;
  scene.add(liseuse, liseuse.target);
  const chaleur = new THREE.PointLight('#ff9a4a', 0, 7, 1.4); chaleur.position.set(-1.9, 1.4, .4); scene.add(chaleur);
  // sans musique : une seule lumière froide, sur lui
  const blues = new THREE.SpotLight('#aabbe0', 0, 8, .44, 1, 1.1); blues.position.set(.55, 3.3, 1.35); scene.add(blues, blues.target);

  /* ═══════════════ la pièce (maison de poupée : pas de mur de face) ═══════════════
     L'écoute d'abord : le fauteuil est tourné vers la chaîne, contre le mur de gauche,
     avec une grande colonne de chaque côté, à égale distance de lui : le son arrive des deux côtés. */
  const piece = new THREE.Group(); scene.add(piece);
  const LARG = 3.1, FOND = -2.6, AVANT = 2.4, HAUT = 3.3;
  const bois = ['#8a5d3b', '#94643f', '#7f5534', '#9a6b45'].map(c => M(c, { roughness: .75 }));
  for (let i = 0; i < 14; i++) boite(.5, .06, AVANT - FOND, bois[i % 4], piece, -3.25 + i * .5, -.03, (AVANT + FOND) / 2);
  const peinture = M('#d8c7a6', { flatShading: false }), plinthe = M('#efe6d3');
  boite(2 * LARG + .24, HAUT, .12, peinture, piece, 0, HAUT / 2, FOND - .06);
  // les murs de côté sont à part : quand on tourne autour de la pièce, celui qui est entre nous et elle s'efface
  const MURS = { '-1': [], '1': [] };
  [-1, 1].forEach(s => {
    const mur = vivant(groupe(piece)); MURS[s].push(mur);
    boite(.12, HAUT, AVANT - FOND + .12, peinture, mur, s * (LARG + .06), HAUT / 2, (AVANT + FOND) / 2 - .06);
    boite(.05, .12, AVANT - FOND, plinthe, mur, s * (LARG - .025), .06, (AVANT + FOND) / 2);
  });
  boite(2 * LARG, .12, .05, plinthe, piece, 0, .06, FOND + .025);

  // l'axe d'écoute : de son fauteuil, il regarde la chaîne (et un peu vers nous)
  const ASSISE = new THREE.Vector3(0, 0, -.55), CAP = -1.15;
  const AXE = new THREE.Vector3(Math.sin(CAP), 0, Math.cos(CAP));         // devant lui
  const GAUCHE = new THREE.Vector3(Math.cos(CAP), 0, -Math.sin(CAP));    // sa gauche (de notre côté)
  const surAxe = (avant, gauche = 0) => ASSISE.clone().addScaledVector(AXE, avant).addScaledVector(GAUCHE, gauche);
  const CHAINE = surAxe((ASSISE.x + LARG - .32) / -AXE.x);             // la chaîne, pile en face de lui, contre le mur
  const ENCEINTES_Z = [CHAINE.z - .95, CHAINE.z + .95];                  // les colonnes, une de chaque côté de son axe

  // le tapis, le même que dans la vitrine, entre lui et la chaîne
  const sousTapis = surAxe(1.15);
  const tapis = cyl(1.75, 1.75, .03, 10, M('#7b3b2e', { roughness: 1 }), piece, sousTapis.x, .015, sousTapis.z); tapis.scale.z = .7;
  const tapis2 = cyl(1.36, 1.36, .035, 10, M('#c9a35a', { roughness: 1 }), piece, sousTapis.x, .02, sousTapis.z); tapis2.scale.z = .7;

  /* la fenêtre : le ciel de l'heure qu'il est */
  const FX = 1.0, FY = 1.62, FL = 1.3, FH = 1.2;
  const ciel = toileTexte(256, 236);
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(FL, FH), new THREE.MeshBasicMaterial({ map: ciel.t, toneMapped: false }));
  vitre.position.set(FX, FY, FOND + .005); scene.add(vitre);
  const cadre = M('#efe6d3');
  boite(FL + .16, .08, .1, cadre, piece, FX, FY + FH / 2 + .04, FOND + .03); boite(FL + .16, .08, .1, cadre, piece, FX, FY - FH / 2 - .04, FOND + .03);
  boite(.08, FH + .16, .1, cadre, piece, FX - FL / 2 - .04, FY, FOND + .03); boite(.08, FH + .16, .1, cadre, piece, FX + FL / 2 + .04, FY, FOND + .03);
  boite(.05, FH, .06, cadre, piece, FX, FY, FOND + .03);
  boite(FL + .3, .06, .26, cadre, piece, FX, FY - FH / 2 - .1, FOND + .12);   // le rebord
  const REBORD = FY - FH / 2 - .07;

  /* au-dessus de la chaîne, ce qui passe en ce moment : une enseigne au néon « EN ÉCOUTE », et sur une tablette,
     un boîtier de CD géant avec la pochette du morceau, le CD à moitié sorti (il tourne quand ça joue) */
  const vierge = (() => { const { x, t } = toileTexte(64, 64); x.fillStyle = '#c8572f'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#d4d8dd'; x.beginPath(); x.arc(32, 32, 20, 0, 7); x.fill(); x.fillStyle = 'rgba(159,216,255,.7)'; x.beginPath(); x.arc(32, 32, 14, -.6, 1.2); x.arc(32, 32, 8, 1.2, -.6, true); x.fill(); x.fillStyle = '#efe7d8'; x.beginPath(); x.arc(32, 32, 3, 0, 7); x.fill(); return t; })();
  const etiquetteDisque = new THREE.MeshStandardMaterial({ map: vierge, roughness: .4, flatShading: false });   // la sérigraphie du CD du lecteur : la même pochette
  // la face gravée d'un CD : l'argent, les reflets arc-en-ciel (ils tournent avec lui), le moyeu transparent
  const faceCD = (() => {
    const { x, t } = toileTexte(256, 256), c = 128;
    const base = x.createRadialGradient(c, c, 20, c, c, c); base.addColorStop(0, '#dfe3e8'); base.addColorStop(.7, '#b7bec8'); base.addColorStop(1, '#949cab'); x.fillStyle = base; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
    // deux éventails arc-en-ciel face à face, et un reflet blanc à côté de chacun : c'est à ça qu'on reconnaît un CD
    if (x.createConicGradient) [.35, .35 + Math.PI].forEach(a0 => {
      const w = 1.05, f = w / (Math.PI * 2), arc = x.createConicGradient(a0, c, c);
      ['rgba(255,70,90,0)', 'rgba(255,70,90,.75)', 'rgba(255,200,60,.75)', 'rgba(90,230,120,.75)', 'rgba(60,200,255,.75)', 'rgba(150,90,255,.7)', 'rgba(150,90,255,0)'].forEach((k, i, l) => arc.addColorStop(f * i / (l.length - 1), k));
      arc.addColorStop(Math.min(.999, f + .001), 'rgba(0,0,0,0)'); arc.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = arc; x.beginPath(); x.arc(c, c, c, 0, 7); x.arc(c, c, 42, 0, 7, true); x.fill();
      const blanc = x.createConicGradient(a0 - .32, c, c); blanc.addColorStop(0, 'rgba(255,255,255,0)'); blanc.addColorStop(.025, 'rgba(255,255,255,.65)'); blanc.addColorStop(.05, 'rgba(255,255,255,0)'); blanc.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = blanc; x.beginPath(); x.arc(c, c, c, 0, 7); x.arc(c, c, 42, 0, 7, true); x.fill();
    });
    x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 1; for (let r = 46; r < c; r += 7) { x.beginPath(); x.arc(c, c, r, 0, 7); x.stroke(); }
    x.strokeStyle = 'rgba(70,74,84,.5)'; x.lineWidth = 2; x.beginPath(); x.arc(c, c, c - 1.5, 0, 7); x.stroke();
    x.fillStyle = 'rgba(40,40,48,.35)'; x.font = '600 9px ui-monospace, monospace'; x.textAlign = 'center'; x.fillText('MD-0001 · COMPACT DISC DIGITAL AUDIO', c, c - 48);
    x.fillStyle = '#d6dadf'; x.beginPath(); x.arc(c, c, 40, 0, 7); x.fill();
    x.fillStyle = 'rgba(205,214,224,.6)'; x.beginPath(); x.arc(c, c, 30, 0, 7); x.fill();
    x.fillStyle = '#3a3532'; x.beginPath(); x.arc(c, c, 10, 0, 7); x.fill();
    return t;
  })();
  const poster = vivant(groupe(piece, -LARG + .02, 0, CHAINE.z, Math.PI / 2)); MURS[-1].push(poster);
  boite(1.16, .035, .17, M('#4a2c18', { roughness: .55 }), poster, 0, 1.42, .085);                                // la tablette
  boite(1.16, .028, .014, M('#c9a24a', { metalness: .75, roughness: .3, flatShading: false }), poster, 0, 1.452, .166);   // son rebord en laiton
  [-1, 1].forEach(s => { const e = boite(.02, .1, .1, M('#2a180c'), poster, s * .45, 1.37, .05); e.rotation.x = -.6; });   // les équerres
  // le CD, à moitié sorti du boîtier, côté gravé vers nous (l'arc-en-ciel) : il tourne quand ça joue
  const cdMural = vivant(groupe(poster, .2, 1.765, .052));
  {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .004, 56), new THREE.MeshStandardMaterial({ map: faceCD, emissive: '#ffffff', emissiveMap: faceCD, emissiveIntensity: .3, metalness: .15, roughness: .28, flatShading: false }));
    d.rotation.x = Math.PI / 2; cdMural.add(d);
  }
  // le boîtier de CD, en grand : le plateau noir, le livret (la pochette), le couvercle en plastique transparent et sa charnière
  const pochette = groupe(poster, -.12, 1.755, .08); pochette.rotation.x = -.07;
  boite(.704, .62, .012, M('#141317', { roughness: .35 }), pochette, 0, 0, -.006);                         // le plateau, derrière
  const affiche = new THREE.Mesh(new THREE.PlaneGeometry(.58, .58), new THREE.MeshStandardMaterial({ map: vierge, roughness: .55 }));
  affiche.position.set(.04, 0, .002); pochette.add(affiche);
  const plastique = new THREE.MeshStandardMaterial({ color: '#e8eef5', transparent: true, opacity: .16, roughness: .04, metalness: .1, depthWrite: false, flatShading: false });
  boite(.704, .62, .008, plastique, pochette, 0, 0, .008).castShadow = false;                              // le couvercle (transparent : pas d'ombre sur la pochette)
  boite(.05, .62, .02, new THREE.MeshStandardMaterial({ color: '#2a2a30', transparent: true, opacity: .55, roughness: .2 }), pochette, -.327, 0, .004).castShadow = false;   // la charnière
  [-.25, .25].forEach(y => { boite(.03, .06, .024, M('#1c1c21', { roughness: .3 }), pochette, -.327, y, .004).castShadow = false; });
  { const reflet = new THREE.Mesh(new THREE.PlaneGeometry(.09, .66), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .07, depthWrite: false })); reflet.position.set(.12, 0, .0125); reflet.rotation.z = -.55; pochette.add(reflet); }
  // l'enseigne au néon : allumée quand ça joue, éteinte (des tubes gris) sur une vraie pause
  const neon = toileTexte(512, 104);
  function dessinerNeon(allume) {
    const x = neon.x; x.clearRect(0, 0, 512, 104);
    x.font = 'italic 700 60px Georgia, "Times New Roman", serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (allume) { x.shadowColor = '#ff4d3d'; x.shadowBlur = 26; x.fillStyle = '#ff8a72'; x.fillText('♪ en écoute', 256, 54); x.shadowBlur = 10; x.fillStyle = '#ffe1d6'; x.fillText('♪ en écoute', 256, 54); }
    else { x.shadowBlur = 0; x.fillStyle = 'rgba(150,140,132,.8)'; x.fillText('♪ en écoute', 256, 54); }
    neon.t.needsUpdate = true;
  }
  dessinerNeon(false);
  const enseigne = new THREE.Mesh(new THREE.PlaneGeometry(1.12, .227), new THREE.MeshBasicMaterial({ map: neon.t, transparent: true, toneMapped: false, depthWrite: false }));
  enseigne.position.set(0, 2.24, .02); poster.add(enseigne);
  const lueurNeon = new THREE.PointLight('#ff6a55', 0, 1.8, 1.8); lueurNeon.position.set(0, 2.18, .35); poster.add(lueurNeon);
  const chargeur = new THREE.TextureLoader(); chargeur.setCrossOrigin('anonymous');
  let pochetteActuelle = null;
  function majPoster(src) {
    if (!src || src === pochetteActuelle) return;
    pochetteActuelle = src;
    chargeur.load(src, t => {
      if (pochetteActuelle !== src) { t.dispose(); return; }
      const avant = affiche.material.map;
      t.colorSpace = THREE.SRGBColorSpace; affiche.material.map = t; affiche.material.needsUpdate = true; etiquetteDisque.map = t; etiquetteDisque.needsUpdate = true;
      if (avant && avant !== vierge && avant !== t) avant.dispose();   // la pochette d'avant est libérée : la mémoire ne grossit pas au fil des morceaux
    }, undefined, () => {});
  }

  /* ═══════════════ aux murs : les images d'Amélien, en grand ═══════════════
     chaque cadre : une baguette, un passe-partout, l'image (chargée après le reste) */
  const CADRES_IMG = [];
  function cadreImage(nom, w, h, parent, x, y, z, ry, legende) {
    const g = vivant(groupe(parent, x, y, z, ry));
    const bord = Math.min(w, h) * .07;
    boite(w + bord * 2, h + bord * 2, .035, M('#1b1712', { roughness: .5 }), g, 0, 0, 0);
    boite(w + bord * .6, h + bord * .6, .038, M('#efe7d8'), g, 0, 0, .002);
    const image = new THREE.Mesh(new THREE.PlaneGeometry(w * .9, h * .9), new THREE.MeshStandardMaterial({ color: '#3a3430', roughness: .55 }));
    image.position.z = .023; g.add(image);
    CADRES_IMG.push({ g, nom, image, legende });
    return g;
  }
  // le mur du fond : Massy en grand, l'album d'Amélien, Kerry James Marshall
  cadreImage('massy', .9, 1.2, piece, -1.05, 1.8, FOND + .03, 0, 'Illustration de MassyPuster pour 7C');
  cadreImage('mode-creatif', .56, .56, piece, -.18, 2.02, FOND + .03, 0, 'Mode Créatif (dispo partout)');
  cadreImage('marshall', .4, .5, piece, -.18, 1.24, FOND + .03, 0, 'Kerry James Marshall');
  // le mur de droite : Junji Ito, The Boondocks, Seta
  MURS[1].push(cadreImage('junji', .5, .83, piece, LARG - .03, 1.76, -.3, -Math.PI / 2, 'Junji Ito'));
  MURS[1].push(cadreImage('boondocks', .52, .76, piece, LARG - .03, 1.72, .5, -Math.PI / 2, 'The Boondocks'));
  MURS[1].push(cadreImage('seta', .6, .6, piece, LARG - .03, 1.72, 1.3, -Math.PI / 2, 'Seta, chez Cul7ure'));
  // sur le rebord de la fenêtre : la photo des Anges déchus
  const photo = cadreImage('fallen-angels', .3, .168, piece, FX - .36, REBORD + .12, FOND + .15, 0, 'Vive l’amour, Tsai Ming-liang'); photo.rotation.x = -.16;
  boite(.02, .1, .06, M('#1b1712'), photo, 0, -.05, -.04).rotation.x = .5;

  /* la porte du bureau (la pièce de la vitrine), entrouverte, à droite de la fenêtre ; Talya dort devant */
  const PX = 2.35, PL = .84, PH = 2.04;
  const porte = vivant(groupe(piece, PX, 0, FOND));
  const dela = toileTexte(128, 256);
  { const x = dela.x; const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#f3dfb6'); g.addColorStop(.7, '#e7c995'); g.addColorStop(.72, '#a8703f'); g.addColorStop(1, '#8a5a34'); x.fillStyle = g; x.fillRect(0, 0, 128, 256); }
  const ouverture = new THREE.Mesh(new THREE.PlaneGeometry(PL, PH), new THREE.MeshBasicMaterial({ map: dela.t, toneMapped: false })); ouverture.position.set(0, PH / 2, .006); porte.add(ouverture);
  boite(PL + .16, .08, .07, cadre, porte, 0, PH + .04, .03); boite(.08, PH, .07, cadre, porte, -PL / 2 - .04, PH / 2, .03); boite(.08, PH, .07, cadre, porte, PL / 2 + .04, PH / 2, .03);
  const battant = vivant(groupe(porte, PL / 2, 0, .03));   // la charnière à droite
  const boisPorte = M('#8a5b36', { roughness: .6 });
  boite(PL - .02, PH - .02, .04, boisPorte, battant, -PL / 2, PH / 2, 0);
  [[.55, 1.45], [.55, .55]].forEach(([hh, y]) => boite(PL - .2, hh, .012, M('#7a4f2e', { roughness: .6 }), battant, -PL / 2, y, .024));
  bille(.022, M('#c9a64a', { metalness: .7, roughness: .3 }), battant, -PL + .09, 1.0, .04, 1);
  battant.rotation.y = .42;

  /* la bibliothèque, contre le mur du fond, dans le coin ; dessus : I Love Ugly, le globe et la boîte à curiosités */
  const biblio = groupe(piece, -LARG + .79, 0, FOND + .19, 0);
  const livresMobiles = [];
  const noyer = M('#4b2f1c'), noyerF = M('#2e1c10');
  boite(1.3, 1.47, .04, noyerF, biblio, 0, .735, -.14);
  boite(.05, 1.47, .32, noyer, biblio, -.64, .735, 0); boite(.05, 1.47, .32, noyer, biblio, .64, .735, 0);
  for (let e = 0; e < 3; e++) {
    const y = .05 + e * .48;
    boite(1.28, .04, .32, noyer, biblio, 0, y, 0);
    let x = -.58;
    for (let k = 0; x < .55; k++) {
      const w = .035 + ((k * 7 + e * 3) % 5) * .008, h = .26 + ((k * 13 + e) % 7) * .02;
      const livre = boite(w, h, .22, M(COULEURS[(k * 3 + e * 5) % 10]), biblio, x + w / 2, y + .02 + h / 2, .02);
      if ((k + e) % 9 === 4) livre.rotation.z = .18;
      else if (e > 0 && (k * 5 + e) % 13 === 2) livresMobiles.push(vivant(livre));
      x += w + .006;
    }
  }
  boite(1.3, .04, .32, noyer, biblio, 0, 1.46, 0);
  const ugly = cadreImage('i-love-ugly', .58, .387, biblio, -.04, 1.75, -.06, 0, 'I Love Ugly, de Chester Watson'); ugly.rotation.x = -.12;
  const globe = vivant(groupe(biblio, .47, 1.48, 0));
  cyl(.06, .078, .024, 10, M('#8c6a3c', { metalness: .5, roughness: .4 }), globe, 0, .012, 0); cyl(.009, .009, .09, 6, M('#8c6a3c', { metalness: .5 }), globe, 0, .06, 0);
  const globeBoule = (() => {
    const geo = new THREE.IcosahedronGeometry(.115, 2).toNonIndexed(); const p = geo.attributes.position, coul = [];
    for (let i = 0; i < p.count; i += 3) {
      const cx = p.getX(i) + p.getX(i + 1) + p.getX(i + 2), cy = p.getY(i) + p.getY(i + 1) + p.getY(i + 2), cz = p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2);
      const c = new THREE.Color(Math.sin(cx * 24) + Math.sin(cy * 20 + cz * 11) + Math.cos(cz * 26 - cx * 9) > .7 ? '#c9b27a' : '#3f6f8f');
      for (let j = 0; j < 3; j++) coul.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(coul, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5, flatShading: true })); m.position.y = .22; m.rotation.z = .41; m.castShadow = true; globe.add(m); return m;
  })();
  const curio = vivant(groupe(biblio, -.5, 1.48, 0));
  boite(.24, .15, .17, M('#5a3c26', { roughness: .6 }), curio, 0, .075, 0);
  const couvercle = vivant(groupe(curio, 0, .15, -.085));
  boite(.25, .022, .18, M('#4a301e', { roughness: .6 }), couvercle, 0, .011, .085);
  bille(.016, M('#d8b04a', { metalness: .6, roughness: .3 }), curio, 0, .08, .09, 0);
  const lueurCurio = { intensity: 0 };   // (plus une vraie lumière : trop chère pour une si petite lueur)

  /* la plante, dans le coin (il faut bien) */
  const plante = vivant(groupe(piece, LARG - .32, 0, -2.2));
  cyl(.2, .15, .38, 7, M('#b5603c'), plante, 0, .19, 0);
  const feuilles = vivant(groupe(plante, 0, .38, 0));
  for (let i = 0; i < 8; i++) { const f = cyl(0, .085, .8, 4, M('#4f7a46'), feuilles, Math.cos(i) * .07, .32, Math.sin(i) * .07); f.rotation.set(Math.sin(i * 2) * .5, i, Math.cos(i * 2) * .5); }

  /* la lampe à arc, derrière lui, penchée au-dessus de sa tête */
  const piedLampe = surAxe(-.75, .55);
  const lampe = groupe(piece, piedLampe.x, 0, piedLampe.z);
  lampe.rotation.y = Math.atan2(ASSISE.x - piedLampe.x, ASSISE.z - piedLampe.z) - Math.atan2(-.68, .46);
  const fer = M('#2a2a2e', { metalness: .4, roughness: .5 });
  cyl(.19, .21, .045, 12, fer, lampe, 0, .022, 0);
  const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.85, .05), new THREE.Vector3(-.68, 2.32, .46)), 24, .018, 6), fer);
  arc.castShadow = true; lampe.add(arc);
  const abat = cyl(.08, .21, .2, 12, M('#2b2a2e', { side: THREE.DoubleSide }), lampe, -.68, 2.28, .46);
  const matAmpoule = new THREE.MeshBasicMaterial({ color: '#ffe2a6' });
  const ampoule = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), matAmpoule); ampoule.position.set(-.68, 2.2, .46); lampe.add(ampoule);
  lampe.updateMatrixWorld(true); ampoule.getWorldPosition(liseuse.position); liseuse.target.position.copy(ASSISE).y = .6;

  /* la petite table, à sa gauche (de notre côté) : son verre, l'ordi quand il ne s'en sert pas */
  const posTable = surAxe(.66, .74);   // devant l'accoudoir gauche, sans le toucher
  const table = groupe(piece, posTable.x, 0, posTable.z);
  const tableBois = M('#3f2716', { roughness: .55 });
  cyl(.3, .3, .035, 16, tableBois, table, 0, .53, 0); cyl(.028, .034, .5, 7, tableBois, table, 0, .27, 0); cyl(.18, .19, .03, 12, tableBois, table, 0, .015, 0);
  const cristal = new THREE.MeshStandardMaterial({ color: '#eef5f6', transparent: true, opacity: .38, roughness: .05, metalness: .1 });
  // un grand jus orange-mangue, avec des glaçons, une paille rayée et une rondelle d'orange sur le bord
  const paille = toileTexte(8, 64);
  { const x = paille.x; for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f4efe6' : '#d23b33'; x.fillRect(0, i * 8, 8, 8); } }
  function boisson(parent) {
    const v = groupe(parent);
    cyl(.031, .026, .135, 12, cristal, v, 0, .0675, 0);
    cyl(.028, .024, .1, 12, M('#f39a26', { roughness: .25, flatShading: false }), v, 0, .052, 0);
    cyl(.028, .028, .006, 12, M('#ffc15a', { roughness: .2, flatShading: false }), v, 0, .103, 0);
    const glacon = M('#f3fbff', { transparent: true, opacity: .7, roughness: .05 });
    boite(.019, .019, .019, glacon, v, .008, .103, .006).rotation.set(.4, .3, .2);
    boite(.017, .017, .017, glacon, v, -.01, .099, -.007).rotation.set(.1, .7, .4);
    const p = poser(new THREE.Mesh(new THREE.CylinderGeometry(.0045, .0045, .18, 6), new THREE.MeshStandardMaterial({ map: paille.t, roughness: .5 })), v, .011, .13, -.004); p.rotation.z = -.2;
    const rondelle = poser(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .007, 14, 1, false, 0, Math.PI), M('#f7b733', { roughness: .4 })), v, -.031, .126, 0);
    rondelle.rotation.set(0, 0, Math.PI / 2);
    return vivant(v);
  }

  /* ═══════════════ la chaîne : une grande chaîne japonaise, en éléments séparés, dans un meuble en noyer ═══════════════
     de bas en haut : l'ampli et ses deux gros vu-mètres, l'analyseur de spectre, le tuner et son cadran éclairé,
     la double cassette, l'écran du lecteur CD (il fait défiler le morceau), une rangée de CD, et le lecteur CD dessus */
  const chaine = groupe(piece, CHAINE.x, 0, CHAINE.z, 1.45);
  const noyerC = M('#5b3a22', { roughness: .55 }), noyerCF = M('#2c1a0d');
  const alu = M('#cfd1d4', { metalness: .62, roughness: .3 }), aluF = M('#8e9095', { metalness: .55, roughness: .4 }), noirHifi = M('#121115', { roughness: .45 });
  const RW = .9, RD = .46;
  [-1, 1].forEach(s => boite(.04, 1.04, RD, noyerC, chaine, s * (RW / 2 + .02), .56, 0));
  boite(RW + .08, .045, RD, noyerC, chaine, 0, 1.1, 0); boite(RW + .08, .04, RD, noyerC, chaine, 0, .06, 0);
  boite(RW, 1.0, .02, noyerCF, chaine, 0, .58, -RD / 2 + .01);
  [-1, 1].forEach(s => [-1, 1].forEach(t => cyl(.024, .02, .04, 6, noyerCF, chaine, s * RW / 2, .02, t * (RD / 2 - .05))));
  const facade = (y, h) => { boite(RW - .02, h, RD - .06, alu, chaine, 0, y + h / 2, -.01); return RD / 2 - .04 + .001; };
  const lumiere = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  // l'ampli : deux gros vu-mètres ambrés, le gros bouton du volume, une rangée de petits boutons
  let zf = facade(.08, .22);
  const matVu = lumiere('#ffcf7a');
  const aiguilles = [-1, 1].map(s => {
    boite(.25, .12, .008, noirHifi, chaine, s * .23, .225, zf);
    const fond = new THREE.Mesh(new THREE.PlaneGeometry(.22, .1), matVu); fond.position.set(s * .23, .225, zf + .005); chaine.add(fond);
    const pivot = vivant(groupe(chaine, s * .23, .178, zf + .008));
    const a = new THREE.Mesh(new THREE.BoxGeometry(.003, .09, .002), M('#1a1a1a')); a.position.y = .045; pivot.add(a);
    return pivot;
  });
  const volume = cyl(.052, .052, .03, 18, aluF, chaine, 0, .2, zf + .015); volume.rotation.x = Math.PI / 2;
  for (let k = 0; k < 7; k++) { const b = cyl(.014, .014, .02, 10, aluF, chaine, -.33 + k * .11, .115, zf + .01); b.rotation.x = Math.PI / 2; }
  const led = new THREE.Mesh(new THREE.SphereGeometry(.008, 6, 4), lumiere('#ff5a3a')); led.position.set(-.4, .27, zf + .004); chaine.add(vivant(led));
  // l'analyseur de spectre : douze colonnes de diodes qui dansent avec la musique
  zf = facade(.31, .12);
  const diodes = vivant(new THREE.InstancedMesh(new THREE.PlaneGeometry(.044, .0062), new THREE.MeshBasicMaterial({ toneMapped: false }), 120));
  {
    const m4 = new THREE.Matrix4(), eteinte = new THREE.Color('#0f2117');
    for (let i = 0; i < 12; i++) for (let k = 0; k < 10; k++) { m4.makeTranslation(-.353 + i * .055, .332 + k * .0085, zf + .004); diodes.setMatrixAt(i * 10 + k, m4); diodes.setColorAt(i * 10 + k, eteinte); }
    diodes.castShadow = false; chaine.add(diodes);
  }
  boite(.68, .095, .006, noirHifi, chaine, -.05, .37, zf + .001);
  for (let k = 0; k < 3; k++) { const b = cyl(.012, .012, .02, 10, aluF, chaine, .35, .335 + k * .03, zf + .01); b.rotation.x = Math.PI / 2; }
  // le tuner : le long cadran éclairé, l'aiguille rouge qui cherche les stations, le gros bouton d'accord
  zf = facade(.44, .13);
  const cadran = toileTexte(512, 64);
  {
    const x = cadran.x; x.fillStyle = '#0b2a2e'; x.fillRect(0, 0, 512, 64);
    x.fillStyle = '#9ff3e0'; x.font = 'bold 15px ui-monospace, monospace'; x.textAlign = 'center';
    ['88', '92', '96', '100', '104', '108'].forEach((f, i) => x.fillText(f, 40 + i * 86, 22));
    for (let i = 0; i <= 40; i++) x.fillRect(40 + i * 10.75, i % 5 ? 34 : 30, 2, i % 5 ? 8 : 14);
    x.font = 'bold 11px ui-monospace, monospace'; x.fillText('FM  STEREO', 470, 56); x.fillText('MHz', 40, 56);
  }
  const ecranCadran = new THREE.Mesh(new THREE.PlaneGeometry(.6, .075), new THREE.MeshBasicMaterial({ map: cadran.t, toneMapped: false }));
  ecranCadran.position.set(-.08, .505, zf + .004); chaine.add(ecranCadran);
  boite(.62, .09, .006, noirHifi, chaine, -.08, .505, zf + .001);
  const aiguilleTuner = vivant(new THREE.Mesh(new THREE.BoxGeometry(.004, .07, .002), lumiere('#ff4a3a')));
  aiguilleTuner.position.set(-.2, .505, zf + .007); chaine.add(aiguilleTuner);
  const accord = cyl(.04, .04, .028, 18, aluF, chaine, .34, .505, zf + .014); accord.rotation.x = Math.PI / 2;
  // la double cassette : deux fenêtres, les bobines tournent quand ça joue
  zf = facade(.58, .13);
  const bobines = [];
  [-1, 1].forEach(s => {
    boite(.25, .095, .008, noirHifi, chaine, s * .2, .645, zf);
    boite(.19, .06, .004, M('#e9e2d0', { roughness: .6 }), chaine, s * .2, .645, zf + .005);
    [-1, 1].forEach(t => { const b = vivant(groupe(chaine, s * .2 + t * .045, .645, zf + .008)); const r = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .003, 6), M('#1c1b20')); r.rotation.x = Math.PI / 2; b.add(r); boite(.02, .004, .004, M('#e9e2d0'), b, 0, 0, .002); bobines.push(b); });
  });
  // l'écran du lecteur CD : il fait défiler le morceau (le CD, lui, tourne sur le dessus du meuble)
  zf = facade(.73, .1);
  boite(.36, .014, .008, noirHifi, chaine, -.18, .8, zf);
  const lcd = toileTexte(512, 72);   // pour PAUSE et les petits messages
  const ruban = toileTexte(512, 72); ruban.t.wrapS = THREE.RepeatWrapping;   // le titre qui défile
  const ecran = new THREE.Mesh(new THREE.PlaneGeometry(.3, .044), new THREE.MeshBasicMaterial({ map: lcd.t, toneMapped: false }));
  ecran.position.set(.22, .775, zf + .005); chaine.add(ecran);
  boite(.31, .052, .006, noirHifi, chaine, .22, .775, zf + .002);
  for (let k = 0; k < 4; k++) boite(.03, .012, .008, aluF, chaine, -.32 + k * .05, .757, zf + .003);
  // des CD, au-dessus : une longue rangée de boîtiers debout (les tranches de couleur), et deux piles couchées au bout
  // (les mêmes matières que le reste de la pièce : elles se fusionnent avec, rien de plus à dessiner pour les ombres)
  for (let k = 0; k < 50; k++) { const v = boite(.0104, .124, .142, M(COULEURS[(k * 7 + 3) % 12]), chaine, -.435 + k * .0118, .893, .12); if (k % 17 === 16) v.rotation.z = .07; }
  [[.228, 9], [.372, 6]].forEach(([x, n], p) => { for (let k = 0; k < n; k++) { const v = boite(.142, .0104, .124, M(COULEURS[(k * 5 + p * 4 + 1) % 12]), chaine, x, .8362 + k * .0106, .12); v.rotation.y = (k % 3 - 1) * .05 + p * .04; } });
  // le lecteur CD, posé sur le meuble, à chargement par le dessus : le CD (la pochette imprimée dessus) tourne sous son palet en alu
  const lecteurCD = groupe(chaine, 0, 1.125, 0);
  boite(.5, .085, .38, noirHifi, lecteurCD, 0, .0425, 0);
  boite(.49, .008, .37, alu, lecteurCD, 0, .089, 0);
  cyl(.068, .068, .012, 36, noirHifi, lecteurCD, -.07, .09, 0);                                    // le puits
  const disque = vivant(groupe(lecteurCD, -.07, .0975, 0));
  poser(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .0012, 48), etiquetteDisque), disque).castShadow = false;
  const bordCD = poser(new THREE.Mesh(new THREE.TorusGeometry(.059, .0012, 4, 48), M('#d9dde2', { metalness: .6, roughness: .2, flatShading: false })), disque); bordCD.rotation.x = Math.PI / 2; bordCD.castShadow = false;   // le bord argenté
  cyl(.017, .017, .0016, 24, new THREE.MeshStandardMaterial({ color: '#cfd8e2', transparent: true, opacity: .75, roughness: .1 }), disque, 0, .0002, 0).castShadow = false;   // le moyeu transparent
  cyl(.022, .024, .014, 24, M('#c9ccd1', { metalness: .7, roughness: .25, flatShading: false }), disque, 0, .008, 0);   // le palet
  boite(.004, .002, .03, M('#8e9095', { metalness: .6 }), disque, 0, .0155, .006);                                     // un repère sur le palet (on le voit tourner)
  // le couvercle coulissant en plexi fumé, repoussé derrière ; l'écran bleu et quatre touches devant
  boite(.2, .006, .18, new THREE.MeshStandardMaterial({ color: '#2b2f38', transparent: true, opacity: .4, roughness: .05, metalness: .2 }), lecteurCD, -.07, .1, -.1).castShadow = false;
  const ecranHaut = toileTexte(256, 48);
  { const x = ecranHaut.x; x.fillStyle = '#05121c'; x.fillRect(0, 0, 256, 48); x.fillStyle = '#8fdcff'; x.font = 'bold 22px ui-monospace, monospace'; x.fillText('CD  ▶  01', 16, 32); x.font = 'bold 13px ui-monospace, monospace'; x.fillText('1×', 210, 31); }
  const vfd = new THREE.Mesh(new THREE.PlaneGeometry(.13, .026), new THREE.MeshBasicMaterial({ map: ecranHaut.t, toneMapped: false })); vfd.position.set(.12, .045, .191); lecteurCD.add(vfd);
  for (let k = 0; k < 4; k++) boite(.022, .01, .006, aluF, lecteurCD,-.18 + k * .04, .045, .192);
  // la lueur de la chaîne (les cadrans éclairent un peu la pièce quand ça joue)
  const lueurChaine = new THREE.PointLight('#ffb35a', 0, 2.4, 1.6); lueurChaine.position.set(0, .5, .6); chaine.add(lueurChaine);

  /* les deux grandes colonnes, de part et d'autre de la chaîne, tournées vers lui */
  const haut_parleurs = [];
  const papierCreme = M('#e3dac6', { roughness: .8 }), caoutchouc = M('#111013', { roughness: .9 }), anneau = M('#bfc2c6', { metalness: .65, roughness: .3 });
  function colonne(z, ry) {
    const e = groupe(piece, -LARG + .32, 0, z, ry);
    boite(.56, .07, .46, noyerCF, e, 0, .035, 0);
    boite(.56, 1.16, .44, noyerC, e, 0, .65, 0);
    boite(.52, 1.12, .012, M('#151418', { roughness: .6 }), e, 0, .65, .222);
    boite(.57, .016, .45, noyerCF, e, 0, 1.235, 0);
    [[1.08, .034, 'aigu'], [.88, .085, 'medium'], [.5, .2, 'grave']].forEach(([y, r, type]) => {
      const cadreHp = new THREE.Mesh(new THREE.TorusGeometry(r * 1.06, r * .07, 6, 28), anneau); cadreHp.position.set(0, y, .229); e.add(cadreHp);
      const hp = vivant(groupe(e, 0, y, .226));
      const bord = new THREE.Mesh(new THREE.TorusGeometry(r * .93, r * .09, 6, 28), caoutchouc); hp.add(bord);
      if (type === 'aigu') { const dome = new THREE.Mesh(new THREE.SphereGeometry(r * .82, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#d6d8db', { metalness: .55, roughness: .3 })); dome.rotation.x = Math.PI / 2; hp.add(dome); }
      else {
        const membrane = new THREE.Mesh(new THREE.CylinderGeometry(r * .88, r * .3, r * .42, 24, 1, true), M(type === 'grave' ? '#e3dac6' : '#d9d0bc', { roughness: .8, side: THREE.DoubleSide })); membrane.rotation.x = Math.PI / 2; membrane.position.z = -r * .21; hp.add(membrane);
        const capuchon = new THREE.Mesh(new THREE.SphereGeometry(r * .3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#2a2930', { roughness: .4 })); capuchon.rotation.x = Math.PI / 2; capuchon.position.z = -r * .33; hp.add(capuchon);
      }
      hp.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });
      haut_parleurs.push({ hp, type, base: .226, push: 0, e });
    });
    const event = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 6, 16), M('#0b0a0c')); event.position.set(0, .2, .224); e.add(event);
    const fondEvent = new THREE.Mesh(new THREE.CircleGeometry(.045, 16), M('#050405')); fondEvent.position.set(0, .2, .22); e.add(fondEvent);
    return e;
  }
  const versLui = z => Math.atan2(ASSISE.x - (-LARG + .32), ASSISE.z - z);
  const colonnes = [colonne(ENCEINTES_Z[0], lisse(Math.PI / 2, versLui(ENCEINTES_Z[0]), .8)), colonne(ENCEINTES_Z[1], Math.PI / 2 + .05)];
  // sur la colonne de devant : la figurine du loup de Cul7ure
  const loup = vivant(groupe(colonnes[1], 0, 1.243, .02, -.6));
  loup.userData.y0 = 1.243; loup.scale.setScalar(1.25);
  {
    const gris = M('#5f6b6a', { roughness: .7 }), grisC = M('#9aa6a3', { roughness: .7 }), rouge = M('#b4485a', { roughness: .6 }), blancL = M('#ecebe4'), noirL = M('#16201e'), vert = M('#27e08a', { roughness: .4 });
    cyl(.07, .075, .02, 16, noirL, loup, 0, .01, 0);                                   // le socle
    [-1, 1].forEach(s => { cyl(.022, .02, .07, 8, M('#2c3436'), loup, s * .03, .055, 0); });
    const corps = cyl(.055, .045, .11, 10, rouge, loup, 0, .14, 0); corps.scale.z = .8;  // la veste de survêtement rouge
    boite(.112, .012, .09, blancL, loup, 0, .14, 0);                                  // la bande blanche
    [-1, 1].forEach(s => { const b = cyl(.018, .016, .09, 8, rouge, loup, s * .065, .15, .01); b.rotation.z = s * .35; bille(.018, grisC, loup, s * .08, .1, .015, 0); });
    const teteL = groupe(loup, 0, .24, .005);
    bille(.05, gris, teteL, 0, 0, 0, 1).scale.set(1, .95, 1);
    const museau = poser(new THREE.Mesh(new THREE.ConeGeometry(.03, .07, 6), grisC), teteL, 0, -.012, .055); museau.rotation.x = Math.PI / 2;
    bille(.011, noirL, teteL, 0, -.012, .09, 0);
    [-1, 1].forEach(s => { const o = poser(new THREE.Mesh(new THREE.ConeGeometry(.018, .055, 4), gris), teteL, s * .03, .05, -.005); o.rotation.z = -s * .3; bille(.009, vert, teteL, s * .02, .012, .043, 0); });
    const casquette = poser(new THREE.Mesh(new THREE.SphereGeometry(.052, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), blancL), teteL, 0, .015, -.005); casquette.rotation.x = -.25;
    const visiere = boite(.06, .006, .05, blancL, teteL, 0, .02, -.055); visiere.rotation.x = .2;   // la visière en arrière
  }
  // les ondes : à chaque temps fort, un anneau d'air part des boomers vers lui
  const ondes = Array.from({ length: 10 }, () => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, .015, 4, 40), new THREE.MeshBasicMaterial({ color: '#fff0d6', transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    m.visible = false; scene.add(m); return { m, vie: 0, dir: new THREE.Vector3() };
  });

  /* ═══════════════ Talya, qui dort dans son panier (la même que dans la vitrine) ═══════════════ */
  const panier = groupe(piece, 2.2, 0, -1.2, -2.4); panier.scale.setScalar(.9);
  const bord = new THREE.Mesh(new THREE.TorusGeometry(.48, .14, 8, 16), M('#7b3b2e', { roughness: 1 })); bord.rotation.x = Math.PI / 2; bord.position.y = .14; bord.scale.z = .9; poser(bord, panier, 0, .14, 0);
  cyl(.45, .45, .1, 16, M('#d9c3a0', { roughness: 1 }), panier, 0, .08, 0);
  const talya = vivant(groupe(panier));
  const blanc = M('#f1f3ee'), ombreT = M('#d5d9d1'), rose = M('#e2b7b2'), truffeM = M('#151010');
  const corpsT = bille(.3, blanc, talya, -.05, .25, -.05); corpsT.scale.set(1.25, .55, .85);
  const teteT = groupe(talya, .14, .36, .2); teteT.rotation.y = .9;
  bille(.17, blanc, teteT, 0, 0, 0, 0).scale.set(1, .85, 1);
  const museau = poser(new THREE.Mesh(new THREE.ConeGeometry(.08, .34, 5), blanc), teteT, 0, -.04, .2); museau.rotation.x = Math.PI / 2;
  bille(.025, truffeM, teteT, 0, -.04, .37, 0);
  const oreilles = [-1, 1].map(c => {
    const o = groupe(teteT, c * .09, .1, -.02); o.rotation.z = -c * .25;
    poser(new THREE.Mesh(new THREE.ConeGeometry(.06, .26, 4), c < 0 ? ombreT : blanc), o, 0, .12, 0);
    poser(new THREE.Mesh(new THREE.ConeGeometry(.032, .18, 3), rose), o, 0, .11, .03);
    return o;
  });
  // les yeux fermés : deux petits traits
  [-1, 1].forEach(c => { const t = boite(.035, .006, .006, truffeM, teteT, c * .07, .03, .145); t.rotation.z = c * .15; });
  const queueT = poser(new THREE.Mesh(new THREE.ConeGeometry(.05, .35, 5), blanc), talya, -.42, .2, .12); queueT.rotation.z = 1.9;
  const gamelle = groupe(panier, .8, 0, .35);
  poser(new THREE.Mesh(new THREE.CylinderGeometry(.15, .11, .08, 14, 1, true), M('#c8572f', { side: THREE.DoubleSide, metalness: .2 })), gamelle, 0, .04, 0);
  cyl(.11, .11, .01, 14, M('#9c4225'), gamelle, 0, .005, 0);
  bille(.07, M('#cfe05a'), panier, -.75, .07, .55);

  /* le chat, roulé en boule sur le rebord de la fenêtre */
  const chat = vivant(groupe(piece, FX + .38, REBORD + .03, FOND + .15, .2));
  const fourrure = M('#2b2522', { roughness: 1 });
  const corpsChat = bille(.13, fourrure, chat, 0, .065, 0); corpsChat.scale.set(1.35, .6, .9);
  bille(.068, fourrure, chat, -.15, .065, .04);
  [-1, 1].forEach(s => { const o = cyl(0, .024, .05, 4, fourrure, chat, -.165, .12, .04 + s * .035); o.rotation.x = s * .2; });
  const queueChat = poser(new THREE.Mesh(new THREE.TorusGeometry(.11, .018, 5, 12, Math.PI * 1.1), fourrure), chat, .04, .02, .02); queueChat.rotation.x = Math.PI / 2;

  /* ═══════════════ le fauteuil club, en velours, et le pouf ═══════════════
     un velours rouille profond qui accroche la lumière, le dossier capitonné, des clous en laiton */
  const fauteuil = groupe(scene, ASSISE.x, 0, ASSISE.z, CAP);
  const habillage = groupe(fauteuil);
  const velours = new THREE.MeshPhysicalMaterial({ color: '#9a3418', roughness: .74, sheen: 1, sheenRoughness: .3, sheenColor: new THREE.Color('#ffb98a') });
  const veloursF = new THREE.MeshPhysicalMaterial({ color: '#6c2010', roughness: .82, sheen: .9, sheenRoughness: .38, sheenColor: new THREE.Color('#e4906a') });
  const laiton = M('#c9a24a', { metalness: .8, roughness: .28, flatShading: false }), pied = M('#2e1c10', { roughness: .45 });
  boite(1.0, .3, .78, veloursF, habillage, 0, .21, -.03);                 // la jupe : y .06–.36, z -.42–.36
  boite(.62, .13, .6, velours, habillage, 0, .425, 0);                     // l'assise : y .36–.49, z -.30–.30
  const nez = cyl(.062, .062, .62, 14, velours, habillage, 0, .43, .28); nez.rotation.z = Math.PI / 2;
  const dossier = groupe(habillage, 0, .36, -.36); dossier.rotation.x = -.14;
  boite(1.0, .66, .16, velours, dossier, 0, .33, 0);
  const rouleau = cyl(.1, .1, 1.0, 16, velours, dossier, 0, .66, -.01); rouleau.rotation.z = Math.PI / 2;
  // le capitonnage en losanges : un bouton à chaque croisement
  for (let r = 0; r < 4; r++) for (let c = 0; c < (r % 2 ? 4 : 5); c++) {
    const x = (r % 2 ? -.3 : -.4) + c * .2, y = .16 + r * .13;
    bille(.014, veloursF, dossier, x, y, .083, 0);
    [-1, 1].forEach(s => { const pli = boite(.11, .005, .006, veloursF, dossier, x + s * .05, y + .065, .081); pli.rotation.z = s * .9; });
  }
  [-1, 1].forEach(s => {
    boite(.19, .34, .78, velours, habillage, s * .405, .52, -.03);         // accoudoirs : x ±(.31–.50), z -.42–.36
    const r = cyl(.098, .098, .8, 14, velours, habillage, s * .41, .69, -.03); r.rotation.x = Math.PI / 2;
    const volute = cyl(.102, .102, .03, 14, veloursF, habillage, s * .41, .69, .375); volute.rotation.x = Math.PI / 2;
    boite(.2, .3, .03, veloursF, habillage, s * .405, .5, .37);
    // les clous en laiton, autour de la face de l'accoudoir, et des boutons sur le côté
    for (let k = 0; k < 7; k++) bille(.008, laiton, habillage, s * (.405 + .085), .37 + k * .05, .386, 0);
    for (let k = 0; k < 4; k++) bille(.008, laiton, habillage, s * .405 + (k - 1.5) * .045, .36, .386, 0);
    for (let k = 0; k < 3; k++) bille(.013, veloursF, habillage, s * .502, .52, -.3 + k * .25, 0);
    [-.36, .3].forEach(z => { cyl(.03, .022, .07, 8, pied, habillage, s * .44, .035, z); cyl(.024, .024, .012, 8, laiton, habillage, s * .44, .006, z); });
  });
  for (let k = 0; k < 21; k++) bille(.008, laiton, habillage, -.45 + k * .045, .075, .368, 0);   // une ligne de clous au bas de la jupe
  const POUF_Z = .86, POUF_H = .47;
  const pouf = groupe(fauteuil, 0, 0, POUF_Z);
  cyl(.3, .28, .39, 14, veloursF, pouf, 0, .225, 0); cyl(.31, .31, .06, 14, velours, pouf, 0, .44, 0);
  bille(.016, veloursF, pouf, 0, .472, 0, 0);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; bille(.013, veloursF, pouf, Math.cos(a) * .17, .468, Math.sin(a) * .17, 0); }
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; bille(.007, laiton, pouf, Math.cos(a) * .3, .4, Math.sin(a) * .3, 0); }
  [-1, 1].forEach(s => [-1, 1].forEach(t => cyl(.025, .02, .05, 6, pied, pouf, s * .18, .025, t * .18)));

  /* ═══════════════ Amélien ═══════════════ */
  const peau = M('#6c412c', { roughness: .62 }), peauF = M('#5a3422', { roughness: .7 });
  // le pull vert, d'une couleur franche (il est dessiné, pas photographié), et un pantalon bleu nuit un peu large
  const pull = new THREE.MeshStandardMaterial({ color: '#25744c', roughness: .95 });
  const cotes = new THREE.MeshStandardMaterial({ color: '#1b5c3c', roughness: .95 });
  const pant = new THREE.MeshStandardMaterial({ color: '#1c2744', roughness: .9 });
  const poils = M('#160d09', { roughness: 1 }), cheveux = M('#21150f', { roughness: 1 }), monture = M('#1a1310', { roughness: .35, metalness: .25, flatShading: false });
  const sombre = M('#1a0f0a');
  // des baskets de trail façon Salomon : mesh beige, renforts ocre, laçage rapide noir, semelle crème et châssis noir
  const meshBeige = M('#c8ae86', { roughness: .85 }), ocre = M('#a8731f', { roughness: .55 }), jauneS = M('#d8b43c', { roughness: .5 }), cremeS = M('#ece5d2', { roughness: .7 }), noirS = M('#18181b', { roughness: .6 });
  const perso = groupe(fauteuil);

  // le bassin et le buste (le buste pivote au niveau des hanches)
  const bassin = poser(new THREE.Mesh(new THREE.CylinderGeometry(.17, .16, .17, 18), pant), perso, 0, .575, -.11); bassin.scale.z = .8;
  const buste = groupe(perso, 0, .585, -.13);
  // le pull : un peu ample, côtes en bas, au col rond et aux poignets
  const torseGeo = new THREE.CylinderGeometry(.205, .19, .47, 28, 3); torseGeo.translate(0, .245, 0);
  poser(new THREE.Mesh(torseGeo, pull), buste).scale.z = .66;
  poser(new THREE.Mesh(new THREE.CylinderGeometry(.193, .196, .055, 20), cotes), buste, 0, .035, 0).scale.z = .68;
  const epaulettes = [-1, 1].map(s => { const b = poser(new THREE.Mesh(new THREE.SphereGeometry(.08, 16, 12), pull), buste, s * .185, .43, -.005); b.scale.set(1.02, .8, .92); b.userData.bouge = true; return b; });
  const creme = M('#efe6cf', { roughness: .9 });
  poser(new THREE.Mesh(new THREE.TorusGeometry(.06, .014, 8, 20), creme), buste, 0, .49, .008).rotation.x = Math.PI / 2;
  const rayure = poser(new THREE.Mesh(new THREE.TorusGeometry(.069, .005, 6, 20), cotes), buste, 0, .482, .008); rayure.rotation.x = Math.PI / 2; rayure.castShadow = false;
  const bas = poser(new THREE.Mesh(new THREE.CylinderGeometry(.1955, .1985, .014, 20), creme), buste, 0, .07, 0); bas.scale.z = .68; bas.castShadow = false;   // une rayure crème au bas du pull
  // son casque, toujours autour du cou : l'arceau derrière la nuque, les deux écouteurs posés sur les clavicules
  {
    const casqueN = M('#18171b', { roughness: .4 }), casqueA = M('#c9cbcf', { metalness: .6, roughness: .3, flatShading: false }), mousse = M('#2b292e', { roughness: 1 });
    const arceau = poser(new THREE.Mesh(new THREE.TorusGeometry(.098, .012, 6, 22, Math.PI * 1.15), casqueN), buste, 0, .5, -.018);
    arceau.rotation.set(Math.PI / 2 + .35, 0, Math.PI + (Math.PI * 1.15 - Math.PI) / 2 - .08);
    [-1, 1].forEach(c => {
      const e = groupe(buste, c * .093, .468, .07); e.rotation.set(-.95, c * .5, 0);
      cyl(.044, .044, .028, 18, casqueN, e, 0, 0, 0);
      cyl(.034, .034, .03, 16, casqueA, e, 0, .0035, 0).castShadow = false;
      cyl(.04, .04, .012, 16, mousse, e, 0, -.019, 0).castShadow = false;
    });
  }
  poser(new THREE.Mesh(new THREE.CylinderGeometry(.051, .056, .1, 12), peauF), buste, 0, .525, .012);

  // la tête : visage taillé (mâchoire plus étroite), afro, lunettes rondes, fine moustache
  const tete = groupe(buste, 0, .65, .03); tete.scale.setScalar(1.15);
  // un crâne lisse (une sphère déformée, ombrée en douceur) : le visage n'a plus de facettes bizarres
  const crane = new THREE.SphereGeometry(.104, 28, 22);
  {
    const pa = crane.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      let x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
      const bas = Math.max(0, -y / .104);
      x *= 1 - bas * .24; z *= 1 - bas * .1;
      if (z > 0 && y < -.02) z += .006 * bas;
      pa.setXYZ(i, x * .94, y * 1.17, z);
    }
    crane.computeVertexNormals();
  }
  const peauLisse = M('#6c412c', { roughness: .6, flatShading: false }), peauLisseF = M('#5a3422', { roughness: .66, flatShading: false });
  poser(new THREE.Mesh(crane, peauLisse), tete);
  const nezP = poser(new THREE.Mesh(new THREE.SphereGeometry(.017, 16, 12), peauLisseF), tete, 0, -.01, .104); nezP.scale.set(1, .8, 1.1);   // un nez rond, de dessin
  [-1, 1].forEach(s => { const o = bille(.024, peauF, tete, s * .098, -.002, -.008, 0); o.scale.set(.45, 1, .75); });
  const boucleOreille = new THREE.Mesh(new THREE.TorusGeometry(.009, .0025, 4, 10), M('#c99a3a', { metalness: .85, roughness: .25 })); boucleOreille.position.set(.1, -.03, -.005); boucleOreille.rotation.y = Math.PI / 2; tete.add(boucleOreille);
  // les yeux : du blanc, une pupille, un éclat ; ils clignent (toute l'œil s'écrase)
  const blancOeil = M('#fbf6ec', { roughness: .4, flatShading: false }), pupille = M('#140d0a', { roughness: .3, flatShading: false });
  const yeux = [-1, 1].map(s => {
    const o = groupe(tete, s * .038, .021, .093);
    poser(new THREE.Mesh(new THREE.SphereGeometry(.0135, 16, 12), blancOeil), o).scale.set(1, 1.08, .45);
    poser(new THREE.Mesh(new THREE.SphereGeometry(.007, 12, 10), pupille), o, -s * .002, -.0015, .0052).scale.set(1, 1.1, .5);
    poser(new THREE.Mesh(new THREE.SphereGeometry(.002, 8, 6), M('#ffffff', { flatShading: false })), o, -s * .002 + .0028, .002, .0088).castShadow = false;
    return o;
  });
  const sourcils = [-1, 1].map(s => boite(.042, .011, .012, poils, tete, s * .039, .066, .1));   // au-dessus des lunettes, épais
  // l'afro : le même volume, mais en grosses boucles serrées (des petites boules à la surface) :
  // une silhouette à lui, qu'on reconnaît de loin, pas la boule lisse des personnages tout faits
  const afroGeo = (() => {
    const g = new THREE.SphereGeometry(.135, 64, 40), pa = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i); const n = v.clone().normalize();
      // de grosses bosses douces (la masse n'est pas une boule) et un grain serré (les boucles)
      const gros = Math.sin(n.x * 5.1 + 1.3) * Math.sin(n.y * 4.3 + .7) * Math.sin(n.z * 4.7 + 2.1);
      const grain = Math.sin(n.x * 31 + n.z * 7) * Math.sin(n.y * 29 + n.x * 5) * Math.sin(n.z * 33 + n.y * 3);
      v.addScaledVector(n, gros * .009 + grain * .0035); pa.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  })();
  const boucles = toileTexte(256, 128);
  {
    const x = boucles.x;
    x.fillStyle = '#1d120c'; x.fillRect(0, 0, 256, 128);
    let k = 7; const h = () => (k = (k * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 1400; i++) {   // des petites spirales serrées, plus claires ou plus sombres
      const cx = h() * 256, cy = h() * 128, r = 1.5 + h() * 2.6, a = h() * 6.3;
      x.strokeStyle = h() < .55 ? 'rgba(66,45,32,.75)' : 'rgba(6,4,2,.85)'; x.lineWidth = 1 + h() * .8;
      x.beginPath(); x.arc(cx, cy, r, a, a + 4.2 + h() * 1.5); x.stroke();
    }
    boucles.t.wrapS = boucles.t.wrapT = THREE.RepeatWrapping; boucles.t.repeat.set(3, 2);
  }
  const cheveuxAfro = new THREE.MeshStandardMaterial({ color: '#ffffff', map: boucles.t, roughness: 1 });
  const afro = poser(new THREE.Mesh(afroGeo, cheveuxAfro), tete, 0, .112, -.052); afro.scale.set(1.12, .93, 1.02);   // la ligne des cheveux juste au-dessus des sourcils   // assez en avant pour couvrir le haut du front
  // les lunettes rondes, noires
  [-1, 1].forEach(s => {
    // une monture fine et bien ronde, un verre à peine teinté (un reflet, pas un trait blanc), la branche jusqu'à l'oreille
    const cercle = new THREE.Mesh(new THREE.TorusGeometry(.032, .0042, 12, 48), monture); cercle.position.set(s * .038, .022, .107); tete.add(cercle);
    const verreL = new THREE.Mesh(new THREE.CircleGeometry(.031, 32), new THREE.MeshStandardMaterial({ color: '#dfeeff', transparent: true, opacity: .14, roughness: .05, metalness: .2, depthWrite: false })); verreL.position.set(s * .038, .022, .1075); verreL.castShadow = false; tete.add(verreL);
    const branche = boite(.0035, .0035, .1, monture, tete, s * .071, .028, .058); branche.rotation.y = s * -.1;
  });
  { const pont = new THREE.Mesh(new THREE.TorusGeometry(.0085, .0032, 8, 16, Math.PI), monture); pont.position.set(0, .024, .108); tete.add(pont); }   // le pont, en arc
  // la moustache (fine, en chevron)
  [-1, 1].forEach(s => { const m = gelule(.0078, .024, poils, tete, s * .0185, -.032, .1); m.rotation.z = Math.PI / 2 - s * .3; m.scale.z = .8; });
  const bouche = [-1, 1].map(s => boite(.018, .004, .005, M('#3b1a12'), tete, s * .0088, -.05, .095));

  // les bras : épaule → coude → main (positionnés par cinématique inverse)
  const L_BRAS = .285, L_AVANT = .265;
  const bras = [-1, 1].map(s => {
    const epaule = groupe(buste, s * .195, .43, -.005);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.052, L_BRAS, 6, 22), pull), epaule, 0, -L_BRAS / 2, 0);
    const coude = groupe(epaule, 0, -L_BRAS, 0);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.047, L_AVANT - .04, 6, 22), pull), coude, 0, -(L_AVANT - .04) / 2, 0);
    poser(new THREE.Mesh(new THREE.CylinderGeometry(.043, .046, .045, 14), creme), coude, 0, -L_AVANT + .03, 0);
    poser(new THREE.Mesh(new THREE.CylinderGeometry(.0445, .0465, .008, 14), cotes), coude, 0, -L_AVANT + .036, 0).castShadow = false;
    const main = groupe(coude, 0, -L_AVANT, 0);
    {
      const mx = (x, y, z, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, rz)), new THREE.Vector3(sx, sy, sz));
      const morceaux = [[new THREE.SphereGeometry(1, 16, 12), mx(0, -.036, 0, 0, 0, .029, .04, .013)], [new THREE.CapsuleGeometry(.0145, .02, 3, 10), mx(0, -.004, 0, 0, 0, 1, 1, .8)]];   // la paume, un peu longue, et le poignet
      [[-.0185, .042], [-.0062, .048], [.0062, .045], [.0185, .036]].forEach(([dx, l], i) => {   // l'index, le majeur, l'annulaire, l'auriculaire : longs et fins
        const x = -s * dx, y0 = -.066, ec = s * (i - 1.5) * .03;
        morceaux.push([new THREE.CapsuleGeometry(.0058, l * .55, 3, 8), mx(x, y0 - l * .3, .001, -.12, ec)]);
        morceaux.push([new THREE.CapsuleGeometry(.0052, l * .38, 3, 8), mx(x - ec * l * .5, y0 - l * .74, .007, -.38, ec)]);
      });
      morceaux.push([new THREE.CapsuleGeometry(.0072, .034, 3, 8), mx(-s * .028, -.044, .011, .4, -s * .55)]);   // le pouce
      poser(new THREE.Mesh(fusionLisse(morceaux), peauLisse), main);
    }
    return { s, epaule, coude, main };
  });
  // son verre : sur la table tant qu'il ne boit pas ; il le prend, boit, et le repose là où il l'a pris
  const SPOT_VERRE = new THREE.Vector3(.6, .548, .56);
  cyl(.042, .042, .006, 16, M('#3b2a1d', { roughness: .9 }), fauteuil, SPOT_VERRE.x, SPOT_VERRE.y + .002, SPOT_VERRE.z);   // le dessous de verre
  const verre = boisson(fauteuil); verre.position.copy(SPOT_VERRE); verre.position.y += .005;
  const verreRepos = verre.position.clone();

  // le livre (quand c'est très doux), tenu à deux mains
  const livre = vivant(groupe(buste, 0, .27, .29)); livre.rotation.x = -2.17;
  const couv = M('#d9a23a', { roughness: .6 }), pages = M('#f4eedd', { flatShading: false });
  [-1, 1].forEach(s => { const d = groupe(livre); d.rotation.y = -s * .22; boite(.17, .24, .012, couv, d, s * .085, 0, 0); boite(.16, .23, .016, pages, d, s * .082, 0, .012); });

  // les jambes : hanche → genou → cheville
  const L_CUISSE = .46, L_TIBIA = .45;
  const jambes = [-1, 1].map(s => {
    const hanche = groupe(perso, s * .095, .565, -.1);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.073, L_CUISSE, 6, 22), pant), hanche, 0, -L_CUISSE / 2, 0);
    const genou = groupe(hanche, 0, -L_CUISSE, 0);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.063, L_TIBIA - .05, 6, 22), pant), genou, 0, -L_TIBIA / 2 + .02, 0);
    poser(new THREE.Mesh(new THREE.CylinderGeometry(.07, .073, .05, 14), pant), genou, 0, -L_TIBIA + .085, 0);   // le bas du pantalon, un peu large, retroussé
    const cheville = groupe(genou, 0, -L_TIBIA, 0);
    cyl(.05, .05, .07, 10, M('#d9a23a', { roughness: .95 }), cheville, 0, .035, 0).castShadow = false;   // les chaussettes moutarde, qu'on voit sous l'ourlet
    const p = groupe(cheville);
    cyl(.046, .048, .05, 8, noirS, p, 0, -.01, 0);                                   // le col, noir
    boite(.104, .012, .29, noirS, p, 0, -.091, .055);                                // la semelle d'usure
    boite(.102, .032, .28, cremeS, p, 0, -.07, .05);                                 // la semelle intermédiaire, crème
    bille(.051, cremeS, p, 0, -.07, .17, 1).scale.set(1, .34, .72);
    boite(.106, .014, .14, noirS, p, 0, -.05, -.02);                                 // le châssis noir, au talon
    boite(.09, .062, .21, meshBeige, p, 0, -.026, .035);                             // la tige en mesh
    bille(.047, meshBeige, p, 0, -.036, .14, 1).scale.set(.98, .66, 1.12);
    [-1, 1].forEach(c => {                                                            // les renforts ocre, en zigzag sur les côtés
      [[-.05, .55], [.01, -.55], [.07, .55], [.12, -.5]].forEach(([z, r]) => { const b = boite(.006, .056, .016, ocre, p, c * .046, -.03, z); b.rotation.x = r; });
      boite(.006, .012, .2, jauneS, p, c * .047, -.052, .04).castShadow = false;     // la bande jaune (trop fine pour une ombre)
    });
    boite(.05, .045, .012, ocre, p, 0, -.012, -.072).castShadow = false;             // le renfort du talon
    [.0, .045, .09].forEach((z, i) => { const l = boite(.075, .006, .007, noirS, p, 0, .006 - i * .008, z); l.rotation.y = i % 2 ? .45 : -.45; l.castShadow = false; });   // le laçage rapide
    return { s, hanche, genou, pied: p };
  });

  /* l'ordinateur portable : posé sur le tapis à sa gauche, sur ses genoux quand il s'en sert ; l'écran affiche son blog */
  const ordi = vivant(groupe(fauteuil, .8, .555, .76, 2.0));
  const aluOrdi = M('#c9cbcf', { metalness: .55, roughness: .3, flatShading: false });
  boite(.31, .014, .215, aluOrdi, ordi, 0, .007, 0);
  boite(.27, .002, .1, M('#2a2b2f'), ordi, 0, .015, -.02);
  const capot = groupe(ordi, 0, .014, -.1075);
  boite(.31, .205, .008, aluOrdi, capot, 0, .1025, -.004);
  const page = toileTexte(256, 168);
  {
    const x = page.x;
    // onsenbranle.fr, en gros : l'en-tête violet, le titre de l'article, le bandeau bleu nuit
    const sans = (g, t) => `${g} ${t}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    x.fillStyle = '#7174cc'; x.fillRect(0, 0, 256, 80);
    x.fillStyle = '#111'; x.font = sans(800, 10); x.textAlign = 'left'; x.fillText('En vrai, on s’en branle.', 8, 14);
    x.fillStyle = '#3b0f22'; x.font = sans(500, 6); x.textAlign = 'right'; x.fillText('« Bien ou quoooi ? »   Fluxxx', 248, 13);
    x.fillStyle = '#0a0a0a'; x.font = sans(900, 22); x.textAlign = 'center'; x.fillText('« Bien ou quoooi ? »', 128, 58);
    x.fillStyle = '#05062e'; x.fillRect(0, 80, 256, 88);
    x.fillStyle = '#fff'; x.font = sans(800, 11); x.fillText('(dixit le vrai maire de Sevran en', 128, 102);
    {
      x.textAlign = 'left';
      const a = 'découvrant le ', b = 'logiciel Snapchat', la = x.measureText(a).width, lb = x.measureText(b).width, lc = x.measureText(')').width;
      let cx = 128 - (la + lb + lc) / 2;
      x.fillText(a, cx, 117); cx += la;
      x.fillStyle = '#ff2056'; x.fillText(b, cx, 117); x.fillRect(cx, 119, lb, 1.5); cx += lb;
      x.fillStyle = '#fff'; x.fillText(')', cx, 117);
    }
    const dg = x.createLinearGradient(20, 0, 236, 0); ['#c3cf3a', '#3fb6d6', '#7fc24a', '#d9da4a'].forEach((c, i) => dg.addColorStop(i / 3, c));
    x.fillStyle = dg; x.fillRect(20, 134, 216, 34); x.textAlign = 'left';
  }
  const ecranOrdi = new THREE.Mesh(new THREE.PlaneGeometry(.28, .18), new THREE.MeshBasicMaterial({ map: page.t, toneMapped: false })); ecranOrdi.position.set(0, .104, .001); capot.add(ecranOrdi);
  const autocollant = toileTexte(64, 64);
  { const x = autocollant.x; x.fillStyle = '#d06a32'; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.fillStyle = '#1d1a16'; x.font = '800 20px Helvetica, Arial, sans-serif'; x.textAlign = 'center'; x.fillText('OSB', 32, 39); }
  const sticker = new THREE.Mesh(new THREE.CircleGeometry(.03, 16), new THREE.MeshStandardMaterial({ map: autocollant.t, roughness: .7 })); sticker.position.set(.06, .12, -.0085); sticker.rotation.y = Math.PI; capot.add(sticker);
  const lueurOrdi = { intensity: 0 };   // (idem)
  ordi.traverse(m => { if (m.isMesh) m.castShadow = true; });
  // au repos, fermé sur la petite table ; il le prend de là, le passe au-dessus de l'accoudoir, et le pose sur ses genoux
  const posRepos = new THREE.Vector3(.8, .555, .76), quatRepos = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 2.0, 0)), posMilieu = new THREE.Vector3(.55, 1.05, .58);
  const posGenoux = new THREE.Vector3(0, .68, .17), quatGenoux = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
  // le téléphone, dans la main droite
  const tel = vivant(groupe(bras[0].main, 0, -.075, .03));
  boite(.072, .145, .009, M('#16161a', { roughness: .3 }), tel, 0, 0, 0);
  const ecranTel = new THREE.Mesh(new THREE.PlaneGeometry(.064, .132), new THREE.MeshBasicMaterial({ color: '#9fc4ff', toneMapped: false })); ecranTel.position.z = .005; tel.add(ecranTel);
  tel.rotation.x = -1.2; tel.visible = false;

  // le carnet, ouvert sur ses genoux, et le stylo dans la main qui écrit (il note ce qu'il écoute, pour de faux)
  const carnet = vivant(groupe(fauteuil, -.01, .755, .23)); carnet.rotation.set(-.55, Math.PI, 0); carnet.visible = false;
  {
    const couvC = M('#2f4a5a', { roughness: .7 }), papier = M('#f4eedd', { flatShading: false }), encre = M('#2a2c33');
    [-1, 1].forEach(c => { boite(.11, .006, .15, couvC, carnet, c * .056, 0, 0); boite(.104, .008, .144, papier, carnet, c * .054, .005, 0); });
    for (let l = 0; l < 6; l++) boite(.075, .0012, .003, encre, carnet, -.056, .0098, -.05 + l * .019);   // des lignes déjà écrites, page de gauche
    for (let l = 0; l < 3; l++) boite(.06 - l * .012, .0012, .003, encre, carnet, .05, .0098, -.05 + l * .019);
    cyl(.0045, .0045, .15, 6, M('#1d1c22'), carnet, 0, .006, 0).rotation.x = Math.PI / 2;   // la spirale
    carnet.traverse(o => { if (o.isMesh) o.castShadow = false; });
  }
  const stylo = vivant(groupe(bras[1].main, -.01, -.07, .03)); stylo.visible = false;
  { const c = cyl(.0042, .0042, .13, 6, M('#c8572f', { roughness: .4 }), stylo, 0, 0, 0); c.rotation.x = 1.15; const pointe = cyl(.0012, .0042, .014, 6, M('#c9cbcf', { metalness: .6 }), stylo, 0, -.026, .059); pointe.rotation.x = 1.15 + Math.PI; c.castShadow = pointe.castShadow = false; }

  /* ═══════════════ Amélien est peint en aplats ═══════════════
     Son propre style, qu'on ne confond pas avec les petits bonshommes lisses des autres sites :
     des ombres en aplats (trois tons nets, comme de la gouache), sans contour. */
  {
    // (le dégradé se lit de -1 à 1 selon l'angle de la lumière : la moitié « de dos » reste à zéro, comme une vraie ombre)
    const tons = [0, 0, 0, 88, 142, 192], data = new Uint8Array(tons.length * 4);
    tons.forEach((v, i) => data.set([v, v, v, 255], i * 4));
    const degrade = new THREE.DataTexture(data, tons.length, 1, THREE.RGBAFormat);
    degrade.minFilter = degrade.magFilter = THREE.NearestFilter; degrade.generateMipmaps = false; degrade.needsUpdate = true;
    const versToon = new Map();
    const toon = m => {
      if (!m.isMeshStandardMaterial || m.transparent) return m;
      if (!versToon.has(m.uuid)) versToon.set(m.uuid, new THREE.MeshToonMaterial({ color: m.color.clone(), map: m.map || null, gradientMap: degrade, emissive: m.emissive.clone(), emissiveIntensity: m.emissiveIntensity }));
      return versToon.get(m.uuid);
    };
    const habille = racine => racine.traverse(o => { if (o.isMesh) o.material = toon(o.material); });
    [perso, carnet, verre].forEach(habille);
  }

  /* ═══════════════ le petit nuage (sans musique) ═══════════════ */
  const nuage = new THREE.Group(); nuage.visible = false; scene.add(nuage);
  [[0, 0, 0, .11], [.1, -.01, .02, .085], [-.1, -.015, 0, .09], [.04, .06, -.02, .085], [-.05, .045, .03, .07], [.17, -.03, -.01, .06]].forEach(([x, y, z, r], i) => {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M(i % 2 ? '#757c89' : '#636a77', { roughness: 1 })); b.position.set(x, y, z); nuage.add(b);
  });
  const matGoutte = new THREE.MeshBasicMaterial({ color: '#a9c1e6', transparent: true, opacity: .75 });
  const gouttes = Array.from({ length: 16 }, (_, i) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(.006, .05, .006), matGoutte);
    g.position.set((Math.random() - .5) * .34, -.08 - Math.random() * .4, (Math.random() - .5) * .14); nuage.add(g); return g;
  });

  /* ═══════════════ les notes qui rebondissent sur les murs ═══════════════ */
  function fusionLisse(liste) {
    const geos = liste.map(([g, m]) => (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(m));
    let n = 0; geos.forEach(g => { n += g.attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let k = 0;
    geos.forEach(g => { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); k += g.attributes.position.count; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return geo;
  }
  function fusionGeos(liste) {
    const geos = liste.map(([g, m]) => (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(m));
    let n = 0; geos.forEach(g => { n += g.attributes.position.count; });
    const pos = new Float32Array(n * 3); let k = 0;
    geos.forEach(g => { pos.set(g.attributes.position.array, k * 3); k += g.attributes.position.count; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return geo;
  }
  const mat4 = (x, y, z, rz = 0, sx = 1, sy = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz)), new THREE.Vector3(sx, sy, 1));
  const croche = fusionGeos([[new THREE.CircleGeometry(.032, 10), mat4(0, 0, 0, .45, 1.25, .9)], [new THREE.PlaneGeometry(.009, .1), mat4(.035, .05, 0)], [new THREE.PlaneGeometry(.04, .014), mat4(.052, .093, 0, -.55)]]);
  const doubles = fusionGeos([[new THREE.CircleGeometry(.028, 10), mat4(0, 0, 0, .45, 1.25, .9)], [new THREE.CircleGeometry(.028, 10), mat4(.07, .016, 0, .45, 1.25, .9)], [new THREE.PlaneGeometry(.008, .1), mat4(.031, .05, 0)], [new THREE.PlaneGeometry(.008, .1), mat4(.101, .066, 0)], [new THREE.PlaneGeometry(.074, .016), mat4(.066, .104, 0, .22)]]);
  const BORNES = { x: [-LARG + .12, LARG - .12], y: [.1, HAUT - .15], z: [FOND + .12, AVANT - .3] };
  const notes = Array.from({ length: 30 }, (_, i) => {
    const m = new THREE.Mesh(i % 3 ? croche : doubles, new THREE.MeshBasicMaterial({ color: i % 4 ? '#ffc27a' : '#ffe0a8', transparent: true, opacity: .95, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
    m.visible = false; scene.add(m); return { m, v: new THREE.Vector3(), vie: 0, tour: 0 };
  });
  const posHp = new THREE.Vector3(), teteMonde = new THREE.Vector3(), _n = new THREE.Vector3();
  let colonneSuivante = 0;
  function emettre(fort) {
    haut_parleurs.forEach(h => { if (h.type === 'grave') h.push = 1; else if (h.type === 'medium') h.push = Math.max(h.push, .65); });
    // un anneau d'air part de chaque boomer, vers lui
    haut_parleurs.forEach(h => {
      if (h.type !== 'grave') return;
      const o = ondes.find(x => x.vie <= 0); if (!o) return;
      h.hp.getWorldPosition(o.m.position); h.e.getWorldQuaternion(o.m.quaternion);
      o.dir.set(0, 0, 1).applyQuaternion(o.m.quaternion); o.vie = 1; o.m.visible = true; o.m.scale.setScalar(.2);
    });
    // et des notes, une colonne puis l'autre, qui volent jusqu'à lui
    tete.getWorldPosition(teteMonde);
    const sources = haut_parleurs.filter(h => h.type !== 'aigu');
    for (let k = 0; k < (fort ? 2 : 1); k++) {
      const n = notes.find(x => x.vie <= 0); if (!n) return;
      const col = colonnes[colonneSuivante++ % 2], dispo = sources.filter(h => h.e === col);
      dispo[Math.floor(Math.random() * dispo.length)].hp.getWorldPosition(posHp);
      n.m.position.copy(posHp);
      _n.copy(teteMonde).sub(posHp).normalize();
      n.v.copy(_n).multiplyScalar(.95 + Math.random() * .35);
      n.v.x += (Math.random() - .5) * .35; n.v.y += .2 + Math.random() * .45; n.v.z += (Math.random() - .5) * .35;
      n.vie = 4.5; n.tour = Math.random() * 6; n.m.visible = true;
    }
  }

  /* ═══════════════ on fusionne tout ce qui ne bouge pas (beaucoup moins de travail pour le téléphone) ═══════════════ */
  function fusionner(g) {
    g.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(g.matrixWorld).invert();
    const lots = new Map(), morts = [];
    g.traverse(o => {
      if (!o.isMesh || Array.isArray(o.material) || o.material.map || o.material.transparent) return;
      for (let p = o; p && p !== g; p = p.parent) if (p.userData.vivant) return;
      const geo = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      const cle = o.material.uuid + (o.castShadow ? '+' : '-');
      if (!lots.has(cle)) lots.set(cle, { mat: o.material, geos: [], ombre: o.castShadow });
      lots.get(cle).geos.push(geo); morts.push(o);
    });
    morts.forEach(o => o.parent.remove(o));
    lots.forEach(({ mat, geos, ombre }) => {
      let n = 0; geos.forEach(x => { n += x.attributes.position.count; });
      const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let k = 0;
      geos.forEach(x => { pos.set(x.attributes.position.array, k * 3); nor.set(x.attributes.normal.array, k * 3); k += x.attributes.position.count; x.dispose(); });
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.computeBoundingSphere();
      const m = new THREE.Mesh(geo, mat); m.castShadow = ombre; m.receiveShadow = true; g.add(m);
    });
  }
  fusionner(piece); if (!window.__pieceSansFusion) { fusionner(habillage); fusionner(pouf); }   // (sans fusion : pour vérifier les collisions)
  vitre.castShadow = false; ecran.castShadow = false; affiche.castShadow = false;
  {
    const _s = new THREE.Vector3();
    scene.updateMatrixWorld(true);
    scene.traverse(o => {
      if (!o.isMesh || !o.castShadow) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      o.getWorldScale(_s);
      if (o.geometry.boundingSphere.radius * Math.max(_s.x, _s.y, _s.z) < .03) o.castShadow = false;
    });
  }

  /* ═══════════════ le ciel : la journée en onze tranches (de deux heures, minuit passé en dure quatre), chacune avec son ciel ═══════════════
     À 15 h, on n'est pas dans « l'après-midi » : on est dans le début d'après-midi, avec sa montgolfière.
     Le soleil ou la lune avancent dans la tranche ; la pluie arrive par-dessus, sur une vraie pause. */
  const TRANCHES = [
    { nom: 'minuit passé', heures: 4, haut: '#060a1c', bas: '#141d3c', lune: [[175, 46], [222, 82]], etoiles: 1, fenetres: .3, jour: 0, filante: 1 },
    { nom: 'avant l’aube', haut: '#0b1032', bas: '#4a3f72', lune: [[228, 98], [238, 112]], etoiles: .45, fenetres: .22, jour: .06, lisere: 1 },
    { nom: 'le lever du soleil', haut: '#5465a6', bas: '#f6a57c', soleil: [[28, 190], [54, 150]], couleur: '#ff9f5a', fenetres: .12, jour: .45, nuagesRoses: 1 },
    { nom: 'le matin', haut: '#7db3e6', bas: '#e8eff0', soleil: [[66, 124], [94, 98]], couleur: '#fff1c4', jour: .8, oiseaux: 1 },
    { nom: 'la fin de matinée', haut: '#4f9be3', bas: '#cde6f8', soleil: [[104, 74], [124, 58]], couleur: '#fffbe6', jour: 1, avion: 1 },
    { nom: 'midi', haut: '#3d92e8', bas: '#dbf0fb', soleil: [[130, 40], [146, 36]], couleur: '#ffffff', jour: 1, cumulus: 1 },
    { nom: 'le début d’après-midi', haut: '#4c97df', bas: '#d4e8f4', soleil: [[160, 46], [182, 64]], couleur: '#fffbe6', jour: .95, cumulus: .6, montgolfiere: 1 },
    { nom: 'l’heure dorée', haut: '#6d9cd3', bas: '#f7d394', soleil: [[192, 86], [212, 118]], couleur: '#ffd27a', jour: .78, dore: 1 },
    { nom: 'le coucher du soleil', haut: '#3a4286', bas: '#f27a48', soleil: [[220, 150], [238, 196]], couleur: '#ff7a3c', fenetres: .45, jour: .38, trainees: 1 },
    { nom: 'l’heure bleue', haut: '#121a4c', bas: '#3d529e', lune: [[34, 94], [50, 78]], croissant: 1, etoiles: .35, fenetres: .9, jour: .1, lampadaires: 1 },
    { nom: 'la nuit', haut: '#080d26', bas: '#18224a', lune: [[100, 46], [140, 40]], etoiles: .85, fenetres: .7, jour: 0, clignotant: 1 },
  ];
  const IMMEUBLES = [[0, 70], [40, 50], [70, 96], [120, 44], [150, 80], [196, 60], [226, 88]];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mel = (a, b, f) => '#' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * f).toString(16).padStart(2, '0')).join('');
  // chaque tranche dure deux heures (minuit passé en dure quatre) : on cherche celle où l'on est, et où l'on en est dedans
  function trancheActuelle() {
    const d = new Date(); let h = d.getHours() + d.getMinutes() / 60, debut = 0;
    for (let i = 0; i < TRANCHES.length; i++) { const n = TRANCHES[i].heures || 2; if (h < debut + n || i === TRANCHES.length - 1) return [i, borne((h - debut) / n, 0, 1)]; debut += n; }
  }
  let jour = .5, tranche = TRANCHES[0], cibleFenetre = null;
  function dessinerCiel(t, gris) {
    const [i, q] = trancheActuelle(), T = TRANCHES[i];
    tranche = T; jour = T.jour;
    if (cibleFenetre) cibleFenetre.nom = `La fenêtre : ${T.nom}`;
    const x = ciel.x, W = 256, H = 236, net = 1 - gris;
    const haut = mel(T.haut, jour > .35 ? '#56606f' : '#141925', gris * .8), bas = mel(T.bas, jour > .35 ? '#8c939e' : '#262c3a', gris * .8);
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, haut); g.addColorStop(1, bas);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (T.lisere) { const l = x.createLinearGradient(0, H - 130, 0, H - 40); l.addColorStop(0, 'rgba(240,138,90,0)'); l.addColorStop(1, `rgba(240,138,90,${.6 * net})`); x.fillStyle = l; x.fillRect(0, H - 130, W, 90); }
    // les étoiles, qui scintillent
    if (T.etoiles) for (let k = 0; k < 46; k++) { const a = T.etoiles * net * (.55 + .45 * Math.sin(t * 2 + k * 1.7)); x.fillStyle = `rgba(255,255,255,${a * .9})`; const d = k % 7 ? 1.5 : 2.5; x.fillRect((k * 97) % W, (k * 53) % 130, d, d); }
    if (T.filante && net > .5 && t % 37 < 1.1) { const f = (t % 37) / 1.1; x.strokeStyle = `rgba(255,255,255,${1 - f})`; x.lineWidth = 1.5; x.beginPath(); x.moveTo(40 + f * 130, 18 + f * 40); x.lineTo(18 + f * 130, 10 + f * 40); x.stroke(); }
    const ou = c => [c[0][0] + (c[1][0] - c[0][0]) * q, c[0][1] + (c[1][1] - c[0][1]) * q];
    x.globalAlpha = 1 - gris * .85;
    if (T.soleil) {
      const [sx, sy] = ou(T.soleil), halo = x.createRadialGradient(sx, sy, 8, sx, sy, 50);
      halo.addColorStop(0, T.couleur + '99'); halo.addColorStop(1, T.couleur + '00'); x.fillStyle = halo; x.fillRect(sx - 50, sy - 50, 100, 100);
      x.fillStyle = T.couleur; x.beginPath(); x.arc(sx, sy, 15, 0, 7); x.fill();
    }
    if (T.lune) {
      const [lx, ly] = ou(T.lune);
      x.fillStyle = '#f3efe2'; x.beginPath(); x.arc(lx, ly, 12, 0, 7); x.fill();
      if (T.croissant) { x.fillStyle = haut; x.beginPath(); x.arc(lx + 6, ly - 3, 11, 0, 7); x.fill(); }
      else { x.fillStyle = 'rgba(190,186,170,.55)'; x.beginPath(); x.arc(lx - 3, ly + 2, 3, 0, 7); x.arc(lx + 4, ly - 4, 2, 0, 7); x.fill(); }
    }
    x.globalAlpha = net;
    if (T.nuagesRoses) { x.fillStyle = 'rgba(255,172,160,.75)'; [[60, 70], [150, 50], [210, 96]].forEach(([cx, cy]) => { x.beginPath(); x.ellipse((cx + t * 2) % 300 - 20, cy, 34, 6, 0, 0, 7); x.fill(); }); }
    if (T.oiseaux) { x.strokeStyle = 'rgba(40,40,50,.8)'; x.lineWidth = 1.4; for (let k = 0; k < 5; k++) { const bx = (t * 14 + k * 18) % 330 - 40, by = 70 + (k % 2) * 8 + k * 3 + Math.sin(t * 6 + k) * 2, a = Math.sin(t * 9 + k) * 2; x.beginPath(); x.moveTo(bx - 5, by - 2 - a); x.lineTo(bx, by); x.lineTo(bx + 5, by - 2 - a); x.stroke(); } }
    if (T.avion) { const ax = (t * 9) % 380 - 60, ay = 40; x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(ax - 100, ay + 12); x.lineTo(ax, ay); x.stroke(); x.fillStyle = '#eef2f5'; x.fillRect(ax, ay - 2, 10, 3); }
    if (T.cumulus) { x.fillStyle = `rgba(255,255,255,${.88 * T.cumulus})`; [[50, 62], [170, 40], [120, 96]].forEach(([cx, cy], k) => { const ox = (cx + t * 3 + k * 40) % 330 - 40; x.beginPath(); x.ellipse(ox, cy, 30, 12, 0, 0, 7); x.ellipse(ox + 18, cy - 8, 20, 12, 0, 0, 7); x.ellipse(ox - 16, cy - 4, 16, 10, 0, 0, 7); x.fill(); }); }
    if (T.montgolfiere) { const mx = 64 + Math.sin(t * .05) * 34, my = 74 + Math.sin(t * .3) * 4; x.fillStyle = '#e2533c'; x.beginPath(); x.ellipse(mx, my, 10, 12, 0, 0, 7); x.fill(); x.fillStyle = '#f2c14a'; x.fillRect(mx - 10, my - 2, 20, 4); x.strokeStyle = 'rgba(60,40,20,.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(mx - 6, my + 9); x.lineTo(mx - 3, my + 16); x.moveTo(mx + 6, my + 9); x.lineTo(mx + 3, my + 16); x.stroke(); x.fillStyle = '#5a3a20'; x.fillRect(mx - 3, my + 16, 6, 5); }
    if (T.trainees) { x.fillStyle = 'rgba(160,70,140,.55)'; [[20, 118, 90], [120, 98, 120], [60, 150, 80]].forEach(([cx, cy, l]) => { x.beginPath(); x.ellipse(cx + l / 2, cy, l / 2, 4, 0, 0, 7); x.fill(); }); }
    if (T.brume) { const b = x.createLinearGradient(0, H - 110, 0, H); b.addColorStop(0, 'rgba(120,130,160,0)'); b.addColorStop(1, 'rgba(120,130,160,.38)'); x.fillStyle = b; x.fillRect(0, H - 110, W, 110); }
    x.globalAlpha = 1;
    if (gris > .02) {  // de gros nuages gris qui passent
      x.fillStyle = `rgba(${jour > .35 ? '120,128,140' : '40,46,60'},${gris * .85})`;
      for (let k = 0; k < 5; k++) { const cx = ((k * 71 + t * 6) % 330) - 40, cy = 26 + (k * 37) % 70; x.beginPath(); x.ellipse(cx, cy, 52, 18, 0, 0, 7); x.ellipse(cx + 30, cy - 9, 34, 16, 0, 0, 7); x.fill(); }
    }
    // la ville : les immeubles, leurs fenêtres allumées selon l'heure, les lampadaires de l'heure bleue
    x.fillStyle = mel(mel('#151a33', '#7d8aa3', jour), '#2e3442', gris * .5);
    IMMEUBLES.forEach(([bx, bh]) => x.fillRect(bx, H - bh, 34, bh));
    if (T.dore && net > .5) { x.fillStyle = 'rgba(255,198,110,.7)'; IMMEUBLES.forEach(([bx, bh]) => x.fillRect(bx, H - bh, 34, 3)); }
    const allumees = T.fenetres || 0;
    x.fillStyle = 'rgba(255,210,122,.95)';
    for (let k = 0; k < 40; k++) if (((k * 7919) % 100) / 100 < allumees) x.fillRect((k * 37) % 250 + 3, H - ((k * 23) % 80) - 8, 4, 5);
    if (T.lampadaires) for (let k = 0; k < 5; k++) { const lx = 20 + k * 52, lg = x.createRadialGradient(lx, H - 6, 1, lx, H - 6, 20); lg.addColorStop(0, 'rgba(255,200,120,.8)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = lg; x.fillRect(lx - 20, H - 26, 40, 26); }
    if (T.clignotant && Math.floor(t * 1.5) % 2 === 0) { x.fillStyle = '#ff4a4a'; x.fillRect((t * 6) % 330 - 40, 30, 3, 3); }
    if (gris > .05) {  // la pluie sur la vitre
      x.strokeStyle = `rgba(205,220,240,${gris * .6})`; x.lineWidth = 1.2;
      x.beginPath();
      for (let k = 0; k < 70; k++) { const px = (k * 53.7) % W, py = ((k * 31.3) + t * (150 + (k % 5) * 25)) % (H + 30) - 20; x.moveTo(px, py); x.lineTo(px - 3, py + 13); }
      x.stroke();
    }
    ciel.t.needsUpdate = true;
  }

  /* ═══════════════ l'écran de la chaîne ═══════════════ */
  let lcdTexte = 'MUSIC DISCOVERY', lcdDecalage = 0, lcdPolice = 'bold 42px ui-monospace, monospace';
  if (document.fonts) document.fonts.load('900 42px Doto').then(f => { if (f && f.length) lcdPolice = '900 42px Doto, ui-monospace, monospace'; }).catch(() => {});
  let rubanPour = '', fixePour = '';
  function preparerRuban() {
    const cle = lcdTexte + '|' + lcdPolice; if (cle === rubanPour) return; rubanPour = cle;
    const c = ruban.c; let x = ruban.x; x.font = lcdPolice;
    const largeur = Math.min(4096, Math.max(512, Math.ceil(x.measureText(lcdTexte + '   ·   ').width)));
    if (c.width !== largeur) { c.width = largeur; ruban.t.dispose(); x = ruban.x; }
    x.fillStyle = '#06111c'; x.fillRect(0, 0, c.width, 72);
    x.fillStyle = '#8fdcff'; x.font = lcdPolice; x.textBaseline = 'middle'; x.textAlign = 'left';
    x.fillText(lcdTexte + '   ·   ', 0, 38);
    ruban.t.repeat.x = 512 / c.width; ruban.t.needsUpdate = true;
  }
  function dessinerFixe(texte) {
    if (texte === fixePour) return; fixePour = texte;
    const x = lcd.x; x.fillStyle = '#06111c'; x.fillRect(0, 0, 512, 72);
    x.fillStyle = '#8fdcff'; x.font = lcdPolice; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(texte, 256, 38); x.textAlign = 'left';
    lcd.t.needsUpdate = true;
  }
  function dessinerLcd(pause, t, message) {
    if (message || pause) {
      dessinerFixe(message || 'PAUSE');
      if (ecran.material.map !== lcd.t) ecran.material.map = lcd.t;
      ecran.visible = !!message || Math.floor(t * 1.4) % 2 === 0;
    } else {
      preparerRuban();
      if (ecran.material.map !== ruban.t) ecran.material.map = ruban.t;
      ecran.visible = true;
      ruban.t.offset.x = ((lcdDecalage - 10) / ruban.c.width) % 1;
    }
  }

  const barres = new Array(12).fill(0), cretes = new Array(12).fill(0);
  let vitesseDisque = 0, neonAllume = false;
  const cVert = new THREE.Color('#5dff9a'), cAmbre = new THREE.Color('#ffc14a'), cRouge = new THREE.Color('#ff4a3a'), cEteinte = new THREE.Color('#0f2117');
  let spectreVide = false;
  function dessinerSpectre(joue) {
    const e = Number(etat.energie) || 5;
    if (!joue && vuForce <= .01 && spectreVide) return;   // éteint : rien à renvoyer à la carte graphique
    spectreVide = !joue && vuForce <= .01 && barres.every(b => b < .01) && cretes.every(c => c < .01);
    for (let i = 0; i < 12; i++) {
      const vise = vuForce > .01 ? .85 + Math.random() * .15 : joue && !calme ? borne(.18 + Math.pow(Math.abs(Math.sin(phase * .5 + i * .9 + Math.sin(phase * .13 + i))), 2) * (.32 + e * .05) + (Math.random() - .5) * .2 - i * .012, 0, 1) : 0;
      barres[i] = lisse(barres[i], vise, vise > barres[i] ? .75 : .22);
      cretes[i] = Math.max(barres[i], cretes[i] - .02);
      const n = Math.round(barres[i] * 10), c = Math.min(9, Math.round(cretes[i] * 10));
      for (let k = 0; k < 10; k++) diodes.setColorAt(i * 10 + k, k < n || (k === c && c > 0) ? (k > 7 ? cRouge : k > 5 ? cAmbre : cVert) : cEteinte);
    }
    diodes.instanceColor.needsUpdate = true;
  }

  /* ═══════════════ l'état de la musique ═══════════════ */
  const etat = { joue: false, attente: false, bpm: 96, energie: 5, danse: 5, humeur: 'triste', note: '' };
  const humeurDe = (e, d) => e <= 3 && d <= 4 ? 'doux' : e >= 8 ? 'energie' : d >= 6 ? 'groove' : 'detente';
  let penseeVue = false, bulleW = 0, bulleH = 0;
  function mesurerPensee() { bulleW = pensee.offsetWidth; bulleH = pensee.offsetHeight; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => mesurerPensee());   // la police de la pensée arrive parfois après le texte
  function maj(n = {}) {
    Object.assign(etat, n);
    // la musique joue : selon le morceau ; entre deux morceaux : détendu, il attend le suivant ; vraie pause : il déprime
    etat.humeur = etat.joue ? humeurDe(Number(etat.energie) || 5, Number(etat.danse) || 5) : etat.attente ? 'detente' : 'triste';
    if (n.titre !== undefined) { lcdTexte = (n.titre ? `${n.titre} — ${n.artiste || ''}` : 'MUSIC DISCOVERY').toUpperCase(); lcdDecalage = 0; }
    if (n.pochette) majPoster(n.pochette);
    const texte = (etat.note || '').trim();
    if (penseeTexte.textContent !== texte) { penseeTexte.textContent = texte; mesurerPensee(); penseeJusqua = horloge + 11; }
    penseeVue = !!texte;
  }

  /* ═══════════════ les attitudes ═══════════════
     Chaque attitude donne : l'inclinaison du buste et de la tête, où vont les mains et les pieds
     (dans le repère du fauteuil, du buste ou de la tête), et l'expression. On mélange les attitudes
     en douceur, et la cinématique inverse place coudes et genoux : rien ne traverse le fauteuil. */
  const ondule = (v) => calme ? 0 : v;
  const P = {
    // sans musique : penché en avant, les coudes vers les genoux, la tête dans les mains ; un gros soupir de temps en temps
    triste: (t) => {
      const soupir = ondule(Math.pow(Math.max(0, Math.sin(t * 1.1)), 8));
      return {
        buste: [.78 - soupir * .14, 0, 0], tete: [.5 + soupir * .06, 0, 0], epaules: soupir * .035, assise: .12, assiseY: .022,
        main: s => ['tete', s * .05, -.03, .125], pole: s => [s * .15, -1, .5],
        pied: s => [s * .25, .085, .42], polePied: [0, 1, .35], tangage: 0, lacet: .22,
        sourcils: -1, bouche: -1,
      };
    },
    // très doux : il lit, la tête penchée sur le livre
    doux: (t) => ({
      buste: [-.22, 0, 0], tete: [.42 + ondule(Math.sin(t * .4) * .03), 0, ondule(Math.sin(t * .27) * .03)], epaules: 0,
      main: s => ['buste', s * .14, .265, .3], pole: s => [s, -.6, -.35],
      pied: s => [s * .1, .56, .78], polePied: [0, 1, .2], tangage: -1.05, lacet: .18,
      sourcils: .15, bouche: .25,
    }),
    // catchy : les mains derrière la tête, les chevilles croisées, un petit hochement
    detente: (t, ph) => ({
      buste: [-.31, 0, 0], tete: [-.1 + ondule(Math.sin(ph / 2) * .06), 0, 0], epaules: 0,
      main: s => ['tete', s * .09, .03, -.15], pole: s => [s, .75, -.25],
      pied: s => s < 0 ? [.05, .665, .77] : [-.02, .56, .79], polePied: [0, 1, .2], tangage: -1.0, lacet: .15, tape: .6,
      sourcils: .4, bouche: .75,
    }),
    // groovy : la tête et les épaules balancent, la main gauche tapote l'accoudoir, le pied droit bat
    groove: (t, ph) => {
      const bal = ondule(Math.sin(ph / 2)), bat = ondule(Math.max(0, Math.sin(ph)));
      return {
        buste: [-.25, bal * .05, -bal * .04], tete: [.05 + bat * .07, -.1 + bal * .05, bal * .17], epaules: 0,
        main: s => s < 0 ? ['F', -.41, .87, .06] : ['F', .41, .83 + bat * .035, .13], pole: s => [s, -.6, -.3],
        pied: s => s > 0 ? [.12, .56, .79] : [-.1, .56, .77], polePied: [0, 1, .2], tangage: -1.05, lacet: .18, tape: 1,
        sourcils: .3, bouche: .85,
      };
    },
    // énergique : il tape sur les accoudoirs, la tête hoche franchement
    energie: (t, ph) => {
      const bat = ondule(Math.max(0, Math.sin(ph)));
      return {
        buste: [-.15 + bat * .05, 0, 0], tete: [.08 + bat * .26, 0, 0], epaules: bat * .015, assise: .03,
        main: s => ['F', s * .41, .83 + ondule(Math.max(0, Math.sin(ph + (s > 0 ? Math.PI : 0)))) * .1, .12], pole: s => [s, -.7, -.2],
        pied: s => [s * .11, .56, .78], polePied: [0, 1, .2], tangage: -1.05, lacet: .16, tape: 1.4,
        sourcils: .65, bouche: 1,
      };
    },
  };
  const surPouf = s => [s * .1, .56, .78];
  Object.assign(P, {
    // l'ordi sur les genoux : il tape, il lit son écran
    ordi: (t) => ({
      buste: [-.16, 0, 0], tete: [.5 + ondule(Math.sin(t * .5) * .03), ondule(Math.sin(t * .23) * .06), 0], epaules: 0,
      main: s => ['F', s * .108, .735 + ondule(Math.max(0, Math.sin(t * 13 + s * 1.9)) * .014), .135], pole: s => [s, -.6, -.2],
      pied: surPouf, polePied: [0, 1, .2], tangage: -1.05, lacet: .18, sourcils: .15, bouche: .2,
    }),
    // une gorgée
    boire: () => {
      const p = avancement('boire'), [vers, gorgee, penche] = mouvementBoire(p);
      return {
        buste: [-.2 + penche * .62, 0, -penche * .25], tete: [-.04 - gorgee * .3 + penche * .15, .12 * (1 - gorgee) + penche * .25, 0], epaules: 0, assise: penche * .08,
        main: s => s > 0 ? mainBoire(vers) : ['F', -.41, .83, .1], pole: s => s > 0 ? [1, .15, .35] : [-1, -.6, -.3],
        pied: surPouf, polePied: [0, 1, .2], tangage: -1.05, lacet: .18, sourcils: .25, bouche: gorgee ? 0 : .5,
      };
    },
    // il écrit dans son carnet : la tête penchée dessus, une main le tient, l'autre griffonne (et s'arrête pour réfléchir)
    ecrire: (t) => {
      const pense = ondule(Math.max(0, Math.sin(t * .55))) > .85 ? 1 : 0;   // de temps en temps, il lève le stylo
      const gx = ondule(Math.sin(t * 9.5)) * .022 * (1 - pense), gz = ondule(Math.sin(t * 4.7 + 1)) * .012 * (1 - pense);
      return {
        buste: [-.08, 0, 0], tete: [.55 - pense * .35, pense * .15, 0], epaules: 0,
        main: s => s < 0 ? ['F', -.08, .775, .22] : ['F', .03 + gx + ((t * .35) % 1) * .03, .79 + pense * .05, .225 + gz], pole: s => [s, -.6, -.2],
        pied: surPouf, polePied: [0, 1, .2], tangage: -1.05, lacet: .18, sourcils: .2 + pense * .3, bouche: .2,
      };
    },
    // il regarde son téléphone
    telephone: (t) => ({
      buste: [-.24, 0, 0], tete: [.45, -.06, 0], epaules: 0,
      main: s => s < 0 ? ['buste', -.06, .25 + ondule(Math.sin(t * 2.3) * .006), .32] : ['F', .41, .83, .1], pole: s => s < 0 ? [-1, -.8, -.2] : [1, -.6, -.3],
      pied: s => s > 0 ? [.04, .62, .77] : [-.05, .56, .79], polePied: [0, 1, .2], tangage: -1.0, lacet: .15, sourcils: 0, bouche: .1,
    }),
    // il s'étire
    etirement: () => ({
      buste: [-.3, 0, 0], tete: [-.35, 0, 0], epaules: .035,
      main: s => ['buste', s * .2, 1.12, .02], pole: s => [s, 0, -.5],
      pied: s => [s * .13, .56, .8], polePied: [0, 1, .2], tangage: -1.2, lacet: .25, sourcils: .5, bouche: .4,
    }),
    // la pose de Malcolm X : le pouce sous le menton, l'index le long de la joue, le coude sur l'accoudoir
    malcolm: (t) => ({
      buste: [-.16, .04, .06], tete: [.04, .3, -.14 + ondule(Math.sin(t * .4) * .02)], epaules: 0,
      main: s => s < 0 ? ['tete', -.045, -.16, .06] : ['F', .41, .83, .1], pole: s => s < 0 ? [-.35, -1, .35] : [1, -.6, -.3],
      pied: s => s < 0 ? [.05, .665, .77] : [-.02, .56, .79], polePied: [0, 1, .2], tangage: -1.0, lacet: .15,
      sourcils: .25, bouche: .45,
    }),
    // il savoure : la tête en arrière, les yeux fermés, les mains croisées sur le ventre
    savourer: (t, ph) => ({
      buste: [-.29, 0, 0], tete: [-.34 + ondule(Math.sin(ph / 2) * .04), 0, ondule(Math.sin(ph / 4) * .06)], epaules: 0,
      main: s => ['buste', s * .045, .14, .2], pole: s => [s, -.5, -.15],
      pied: s => s < 0 ? [.05, .665, .77] : [-.02, .56, .79], polePied: [0, 1, .2], tangage: -1.0, lacet: .15, tape: .5,
      sourcils: .5, bouche: .6, yeuxFermes: 1,
    }),
    // il claque des doigts sur le temps, tranquille
    claquer: (t, ph) => {
      const bal = ondule(Math.sin(ph / 2));
      const claque = s => ondule(Math.max(0, Math.sin(ph + (s > 0 ? 0 : Math.PI)))) * .035;
      return {
        buste: [-.19, bal * .04, -bal * .03], tete: [.03 + ondule(Math.max(0, Math.sin(ph))) * .06, -.04 + bal * .08, bal * .1], epaules: 0,
        main: s => ['buste', s * .25, .5 + claque(s), .2], pole: s => [s, -.75, -.1],
        pied: s => s > 0 ? [.12, .56, .79] : [-.1, .56, .77], polePied: [0, 1, .2], tangage: -1.05, lacet: .18, tape: 1,
        sourcils: .4, bouche: .8,
      };
    },
    // il te fait coucou
    salut: (t) => ({
      buste: [-.2, 0, -.04], tete: [0, .38, .06], epaules: 0,
      main: s => s > 0 ? ['buste', .33 + ondule(Math.sin(t * 10) * .07), .8, .14] : ['F', -.41, .83, .1], pole: s => s > 0 ? [1, -.4, -.3] : [-1, -.6, -.3],
      pied: surPouf, polePied: [0, 1, .2], tangage: -1.05, lacet: .18, sourcils: .7, bouche: 1,
    }),
  });
  const HUMEURS = Object.keys(P);
  const poids = Object.fromEntries(HUMEURS.map(h => [h, h === 'triste' ? 1 : 0]));
  let activite = null, finActivite = 0, debutActivite = 0, prochaineActivite = 12;
  const DUREES = { ordi: 13, boire: 5.6, telephone: 9, etirement: 3.4, salut: 2.8, malcolm: 7, savourer: 8, claquer: 7, ecrire: 12 };
  function lancerActivite(nom) { activite = nom; debutActivite = horlogeCorps; finActivite = horlogeCorps + DUREES[nom]; }
  const avancement = nom => activite === nom ? borne((horlogeCorps - debutActivite) / DUREES[nom], 0, 1) : 1;
  let horlogeCorps = 0;
  // la gorgée, en cinq temps : aller au verre, le porter à la bouche, boire, le reposer au même endroit, lâcher
  const doux3 = x => { x = borne(x, 0, 1); return x * x * (3 - 2 * x); };
  function mouvementBoire(p) {
    const vers = p < .26 ? 0 : p < .42 ? doux3((p - .26) / .16) : p < .62 ? 1 : p < .8 ? 1 - doux3((p - .62) / .18) : 0;
    const gorgee = p > .44 && p < .62 ? 1 : 0;
    const penche = p < .42 ? doux3(p / .2) * (1 - doux3((p - .26) / .16)) : p > .62 ? doux3((p - .66) / .14) : 0;
    return [vers, gorgee, penche];
  }
  const _vb = new THREE.Vector3(), _vt = new THREE.Vector3();
  const PRENDRE = new THREE.Vector3(SPOT_VERRE.x - .01, SPOT_VERRE.y + .16, SPOT_VERRE.z - .04);
  function mainBoire(vers) {
    versF(['tete', .05, -.165, .13], _vt);
    _vb.copy(PRENDRE).lerp(_vt, vers);
    return ['F', _vb.x, _vb.y, _vb.z];
  }

  const BAS = new THREE.Vector3(0, -1, 0);
  const _d = new THREE.Vector3(), _q = new THREE.Vector3(), _e = new THREE.Vector3(), _f = new THREE.Vector3(), _qi = new THREE.Quaternion();
  // deux os (épaule/coude ou hanche/genou) qui pendent vers le bas au repos ; cible et pôle dans le repère du parent
  function ik(rac, mil, L1, L2, cible, pole) {
    const S = rac.position;
    _d.copy(cible).sub(S);
    const dist = Math.min(L1 + L2 - 1e-3, Math.max(Math.abs(L1 - L2) + 1e-3, _d.length()));
    _d.normalize();
    const a = (L1 * L1 + dist * dist - L2 * L2) / (2 * dist), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    _q.copy(pole).addScaledVector(_d, -pole.dot(_d));
    if (_q.lengthSq() < 1e-8) _q.set(0, 0, 1).addScaledVector(_d, -_d.z);
    _q.normalize();
    _e.copy(S).addScaledVector(_d, a).addScaledVector(_q, h);
    _f.copy(_e).sub(S).normalize();
    rac.quaternion.setFromUnitVectors(BAS, _f);
    _f.copy(S).addScaledVector(_d, dist).sub(_e).normalize().applyQuaternion(_qi.copy(rac.quaternion).invert());
    mil.quaternion.setFromUnitVectors(BAS, _f);
  }

  const invBuste = new THREE.Matrix4(), _p = new THREE.Vector3(), _c = new THREE.Vector3(), _pole = new THREE.Vector3(), _sort = new THREE.Vector3();
  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _eul = new THREE.Euler(), _qf = new THREE.Quaternion();
  function versF([rep, x, y, z], out) {
    out.set(x, y, z);
    if (rep === 'tete') out.applyMatrix4(tete.matrix).applyMatrix4(buste.matrix);
    else if (rep === 'buste') out.applyMatrix4(buste.matrix);
    return out;
  }
  let clin = 3, clinT = 0;
  function animerCorps(t, dt, ph) {
    // le mélange des attitudes
    const k = calme ? 1 : 1 - Math.exp(-dt * (activite ? 5 : 3.2));
    let total = 0, maxi = 0;
    horlogeCorps = t;
    const visee = activite || etat.humeur;
    HUMEURS.forEach(h => { poids[h] = borne(lisse(poids[h], h === visee ? 1 : 0, k), 0, 1); if (poids[h] < .002) poids[h] = 0; total += poids[h]; maxi = Math.max(maxi, poids[h]); });
    if (window.__piecePoids) { Object.assign(poids, window.__piecePoids); total = 1; maxi = Math.max(...Object.values(poids)); }   // pour les vérifications
    const att = HUMEURS.filter(h => poids[h] > 0).map(h => [poids[h] / total, P[h](t, ph)]);
    const ecart = 1 - maxi / total;
    // le buste, la tête, les épaules
    let bx = 0, by = 0, bz = 0, tx = 0, ty = 0, tz = 0, ep = 0, so = 0, bo = 0, tape = 0, as = 0, ay = 0, fermes = 0;
    att.forEach(([w, a]) => { fermes += w * (a.yeuxFermes || 0); as += w * (a.assise || 0); ay += w * (a.assiseY || 0); bx += w * a.buste[0]; by += w * a.buste[1]; bz += w * a.buste[2]; tx += w * a.tete[0]; ty += w * a.tete[1]; tz += w * a.tete[2]; ep += w * a.epaules; so += w * a.sourcils; bo += w * a.bouche; tape += w * (a.tape || 0); });
    // assis au fond du fauteuil, ou au bord quand ça ne va pas
    bassin.position.set(0, .575 + ay, -.11 + as); buste.position.set(0, .585 + ay, -.13 + as); jambes.forEach(j => { j.hanche.position.set(j.s * .095, .565 + ay, -.1 + as); });
    const souffle = ondule(Math.sin(t * 1.25) * .012);
    // quand il écoute tranquille, il tourne un peu la tête vers nous
    ty += .22 * (poids.detente + poids.groove + poids.energie + poids.claquer) / (total || 1);
    buste.rotation.set(bx + souffle, by, bz); tete.rotation.set(tx - souffle * .6, ty, tz);
    buste.updateMatrix(); tete.updateMatrix();
    invBuste.copy(buste.matrix).invert();
    // les bras
    bras.forEach(b => {
      _c.set(0, 0, 0); _pole.set(0, 0, 0);
      att.forEach(([w, a]) => { _c.addScaledVector(versF(a.main(b.s), _p), w); _pole.addScaledVector(_p.set(...a.pole(b.s)), w); });
      _c.addScaledVector(_sort.set(b.s * .12, .6, .55).normalize(), ecart * (poids.boire > .05 && b.s > 0 ? .5 : .25));   // en changeant d'attitude, la main fait le tour (par-dessus l'accoudoir)
      _c.applyMatrix4(invBuste);
      b.epaule.position.y = .43 + ep;
      ik(b.epaule, b.coude, L_BRAS, L_AVANT, _c, _pole);
    });
    epaulettes.forEach(e => { e.position.y = .435 + ep; });
    // les jambes
    jambes.forEach(j => {
      _c.set(0, 0, 0); _pole.set(0, 0, 0); let tg = 0, lc = 0;
      att.forEach(([w, a]) => { _c.addScaledVector(_p.set(...a.pied(j.s)), w); _pole.addScaledVector(_p.set(...a.polePied), w); tg += w * a.tangage; lc += w * a.lacet * j.s; });
      _c.y += ecart * .5;  // les pieds se lèvent pour passer du sol au pouf
      // et ne rentrent jamais dans le pouf : s'ils sont au-dessus, ils se posent dessus
      if (Math.hypot(_c.x, _c.z - POUF_Z) < .38 || Math.hypot(_c.x, _c.z + .14 - POUF_Z) < .35) _c.y = Math.max(_c.y, POUF_H + .08);
      if (etat.joue) tg += tape * ondule(Math.max(0, Math.sin(ph + (j.s < 0 ? 0 : 1.2)))) * (j.s < 0 ? .34 : .07);   // le pied droit bat la mesure (le gauche, à peine)
      ik(j.hanche, j.genou, L_CUISSE, L_TIBIA, _c, _pole);
      _qf.setFromEuler(_eul.set(tg, lc, 0, 'YXZ'));
      j.pied.quaternion.copy(_qa.copy(j.hanche.quaternion).multiply(j.genou.quaternion).invert().multiply(_qf));
    });
    // le visage : sourcils, bouche, clignements
    sourcils.forEach((s, i) => { const c = i ? 1 : -1; s.rotation.z = c * (so < 0 ? .34 * so : .08 * so); s.position.y = .066 + Math.max(0, -so) * .004; });
    bouche.forEach((m, i) => { const c = i ? 1 : -1; m.rotation.z = c * .22 * bo; });
    if ((clin -= dt) < 0) { clinT = .12; clin = 2.5 + Math.random() * 4; }
    clinT = Math.max(0, clinT - dt);
    yeux.forEach(o => { o.scale.y = clinT > 0 || fermes > .5 ? .15 : 1; });
    // le livre et le verre
    livre.visible = poids.doux > .15; livre.scale.setScalar(Math.max(.001, borne((poids.doux - .15) * 1.6, 0, 1)));
    tel.visible = poids.telephone > .45;
    carnet.visible = poids.ecrire > .3; carnet.scale.setScalar(Math.max(.001, borne((poids.ecrire - .3) * 2, 0, 1)) * 1.45);
    stylo.visible = poids.ecrire > .45;
    // l'ordi : du tapis jusqu'à ses genoux (en passant au-dessus de l'accoudoir), le capot s'ouvre
    const wo = borne(poids.ordi, 0, 1), u = 1 - wo;   // une courbe qui passe devant l'accoudoir, bien au-dessus
    ordi.position.set(0, 0, 0).addScaledVector(posRepos, u * u).addScaledVector(posMilieu, 2 * u * wo).addScaledVector(posGenoux, wo * wo);
    ordi.quaternion.slerpQuaternions(quatRepos, quatGenoux, wo);
    capot.rotation.x = lisse(Math.PI / 2, -.28, borne((wo - .45) * 2.2, 0, 1));
    lueurOrdi.intensity = borne((wo - .5) * 2, 0, 1) * .5;
    // le verre : dans sa main gauche entre le moment où il le prend et celui où il le repose ; sinon, là où il l'a posé
    const pb = avancement('boire');
    bras[1].main.updateWorldMatrix(true, false);
    bras[1].main.localToWorld(_vb.set(0, -.075, .045)); fauteuil.worldToLocal(_vb); _vb.y -= .065;
    const ecartVerre = _vb.distanceTo(verreRepos);
    if (activite === 'boire' && !verre.userData.tenu && pb > .15 && pb < .5 && ecartVerre < .15) verre.userData.tenu = true;
    if (verre.userData.tenu && (activite !== 'boire' || (pb > .7 && ecartVerre < .15))) verre.userData.tenu = false;
    if (verre.userData.tenu) {
      verre.position.lerp(_vb, Math.min(1, dt * 16));
      verre.rotation.x = lisse(verre.rotation.x, mouvementBoire(pb)[1] * -.9, Math.min(1, dt * 6));
    } else {
      verre.position.lerp(verreRepos, Math.min(1, dt * 10));
      verre.rotation.x = lisse(verre.rotation.x, 0, Math.min(1, dt * 8));
    }
  }

  /* ═══════════════ la caméra : de face, comme dans la vitrine ═══════════════ */
  const CADRES = [
    { a: .5, c: [-1.0, 1.0, -.1], w: 3.4, h: 4.4, fov: 56 },
    { a: 1.1, c: [-.8, .95, 0], w: 4.8, h: 3.1, fov: 44 },
    { a: 2.2, c: [-.5, .95, .05], w: 6.9, h: 3.0, fov: 34 },
  ];
  const DIR = new THREE.Vector3(.07, .3, 1).normalize(), HAUT_Y = new THREE.Vector3(0, 1, 0);
  const cadreActuel = { c: new THREE.Vector3(), d: 5, dir: new THREE.Vector3().copy(DIR) }, cadreVise = { c: new THREE.Vector3(), d: 5, dir: new THREE.Vector3().copy(DIR), suit: false };
  let pres = false, cadrePret = false, derniereCam = 0;
  const _poitrine = new THREE.Vector3();
  function cadrer() {
    const a = camera.aspect;
    let i = 0; while (i < CADRES.length - 2 && a > CADRES[i + 1].a) i++;
    const A = CADRES[i], B = CADRES[i + 1], f = borne((a - A.a) / (B.a - A.a), 0, 1);
    let fov = lisse(A.fov, B.fov, f);
    let w = lisse(A.w, B.w, f), h = lisse(A.h, B.h, f);
    cadreVise.c.set(lisse(A.c[0], B.c[0], f), lisse(A.c[1], B.c[1], f), lisse(A.c[2], B.c[2], f));
    cadreVise.dir.copy(DIR); cadreVise.suit = false;
    if (parent === plein && a >= 1) { w = Math.max(w, 6.3); h = Math.max(h, 3.0); cadreVise.c.set(-.5, .9, .12); w = Math.max(w, 7.0); }   // en grand sur ordinateur : toute la pièce, de la chaîne à la porte
    // en grand sur téléphone : vue un peu plus plongeante, pour que toute la pièce tienne entre la vidéo et l'afficheur
    if (parent === plein && a < 1) { w = 5.0; h = 4.4; fov = 52; cadreVise.c.set(-1.05, .55, -.25); cadreVise.dir.set(.48, 1.3, 1).normalize(); }   // sur téléphone : vue plongeante, la pièce remplit l'écran
    // « plus près » : on se rapproche de lui
    if (parent === plein && pres) { w = a < 1 ? 1.7 : 2.6; h = 1.75; cadreVise.suit = true; cadreVise.dir.set(AXE.x * .6 + .1, .34, AXE.z * .6 + .78).normalize(); }   // face à lui, de trois quarts
    const tv = Math.tan(fov * Math.PI / 360);
    cadreVise.d = Math.max(h / 2 / tv, w / 2 / (tv * a));
    camera.fov = fov; camera.updateProjectionMatrix();
  }
  let px = 0, py = 0, cx = 0, cy = 0, souris = false;
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; souris = true; px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const _dir = new THREE.Vector3();
  function placerCamera(ms) {
    const essai = window.__pieceCam;   // pour les vérifications : une caméra posée à la main
    if (essai) { camera.position.set(...essai.p); camera.lookAt(...essai.l); if (essai.fov && camera.fov !== essai.fov) { camera.fov = essai.fov; camera.updateProjectionMatrix(); } return; }
    if (!souris) { px = ondule(Math.sin(ms / 5200) * .55); py = ondule(Math.sin(ms / 7300) * .3); }
    cx = lisse(cx, px, .05); cy = lisse(cy, py, .05);
    // on glisse doucement d'un cadre à l'autre (toute la pièce, plus près…)
    if (cadreVise.suit) { tete.getWorldPosition(_poitrine); _poitrine.y -= .3; cadreVise.c.copy(_poitrine); }
    const k = !cadrePret || calme ? 1 : 1 - Math.exp(-Math.min(.1, (ms - derniereCam) / 1000) * 3.5);
    derniereCam = ms; cadrePret = true;
    cadreActuel.c.lerp(cadreVise.c, k); cadreActuel.d = lisse(cadreActuel.d, cadreVise.d, k); cadreActuel.dir.lerp(cadreVise.dir, k).normalize();
    // ce qu'on a tourné à la main (on glisse doucement vers la position voulue)
    const ko = calme ? 1 : 1 - Math.exp(-Math.min(.1, (ms - (orbite.t || ms)) / 1000) * 9); orbite.t = ms;
    orbite.lacet = lisse(orbite.lacet, orbite.lacetVise, ko); orbite.tangage = lisse(orbite.tangage, orbite.tangageVise, ko); orbite.recul = lisse(orbite.recul, orbite.reculVise, ko);
    _dir.copy(cadreActuel.dir).applyAxisAngle(HAUT_Y, cx * .11 + orbite.lacet);
    const az = Math.atan2(_dir.x, _dir.z), el = borne(Math.atan2(_dir.y, Math.hypot(_dir.x, _dir.z)) + cy * .035 + orbite.tangage, .04, 1.38);
    _dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    camera.position.copy(cadreActuel.c).addScaledVector(_dir, cadreActuel.d * orbite.recul);
    camera.lookAt(cadreActuel.c);
    // le mur qui est entre nous et la pièce s'efface (comme une maison de poupée qu'on fait tourner)
    MURS[1].forEach(o => { o.visible = camera.position.x < LARG + .1; });
    MURS[-1].forEach(o => { o.visible = camera.position.x > -LARG - .1; });
  }
  /* on fait tourner la pièce en la faisant glisser (à la souris ou au doigt) ; en grand, on zoome aussi (molette, deux doigts).
     Un double-clic (ou « Toute la pièce ») remet la vue de face. */
  const orbite = { lacet: 0, lacetVise: 0, tangage: 0, tangageVise: 0, recul: 1, reculVise: 1, t: 0 };
  function remettreVue() { orbite.lacetVise = 0; orbite.tangageVise = 0; orbite.reculVise = 1; }
  const doigts = new Map(); let glisse = null, aGlisse = false, ecartDoigts = 0;
  function lierOrbite(t) {
    t.addEventListener('pointerdown', e => {
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (doigts.size === 1) { glisse = { x: e.clientX, y: e.clientY, lacet: orbite.lacetVise, tangage: orbite.tangageVise, bouge: false }; aGlisse = false; }
      if (doigts.size === 2) { const [a, b] = [...doigts.values()]; ecartDoigts = Math.hypot(a.x - b.x, a.y - b.y); glisse = null; }
    });
    t.addEventListener('pointermove', e => {
      if (!doigts.has(e.pointerId)) return;
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (doigts.size === 2 && parent === plein) {
        const [a, b] = [...doigts.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (ecartDoigts) orbite.reculVise = borne(orbite.reculVise * ecartDoigts / d, .55, 1.35);
        ecartDoigts = d; aGlisse = true; return;
      }
      if (!glisse) return;
      const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
      if (!glisse.bouge && Math.hypot(dx, dy) < 7) return;
      glisse.bouge = aGlisse = true;
      t.style.cursor = 'grabbing';
      orbite.lacetVise = borne(glisse.lacet - dx * .0065, -1.3, 1.3);
      if (parent === plein || e.pointerType === 'mouse') orbite.tangageVise = borne(glisse.tangage + dy * .0045, -.25, .75);
    });
    const fin = e => { doigts.delete(e.pointerId); if (!doigts.size) { glisse = null; t.style.cursor = ''; } ecartDoigts = 0; };
    t.addEventListener('pointerup', fin); t.addEventListener('pointercancel', fin);
    t.addEventListener('dblclick', () => remettreVue());
    t.addEventListener('wheel', e => { if (parent !== plein) return; e.preventDefault(); orbite.reculVise = borne(orbite.reculVise * Math.exp(e.deltaY * .0012), .55, 1.35); }, { passive: false });
  }
  let parent = null, tW = 1, tH = 1, hautPensee = 10;   // la taille de la pièce à l'écran, gardée pour ne pas la redemander à chaque image
  function taille() {
    if (!parent) return;
    const w = parent.clientWidth, h = parent.clientHeight;
    if (!w || !h) return;
    // pas plus d'environ 2,4 millions de pixels à calculer, même en plein écran sur un grand iPad (moins de mémoire, moins de chaleur)
    rendu.setPixelRatio(Math.max(.7, Math.min(devicePixelRatio || 1, tactile ? 1.5 : 1.75, Math.sqrt((tactile ? 1.6e6 : 2.2e6) / (w * h))) * qualite));
    tW = w; tH = h;
    rendu.setSize(w, h, false);
    // en grand : la pièce se cadre dans la zone libre, entre la vidéo (sur téléphone) et l'afficheur du bas
    let haut = 0, bas = h;
    if (parent === plein) {
      const r0 = parent.getBoundingClientRect(), autour = parent.parentElement;
      const barre = autour.querySelector('.plein-barre'), vue = autour.querySelector('.plein-vue');
      if (w / h < 1) haut = (vue ? vue.getBoundingClientRect().bottom : 0) - r0.top + 6;   // (la vidéo est rangée dans la barre du bas)
      if (barre) bas = barre.getBoundingClientRect().top - r0.top + 22;
      haut = borne(haut, 0, h * .4); bas = borne(bas, haut + 120, h);
      // la pensée ne passe pas sous le bouton « Plus près / Toute la pièce »
      hautPensee = vue ? vue.getBoundingClientRect().bottom - r0.top + 8 : 10;
    } else hautPensee = 10;
    camera.aspect = w / (bas - haut);
    cadrer();
    if (haut > 0 || bas < h) camera.setViewOffset(w, bas - haut, 0, -haut, w, h); else camera.clearViewOffset();
    mesurerPensee();
    if (etiquettePoint) { etiquetteW = etiquette.offsetWidth; etiquetteH = etiquette.offsetHeight; }
  }

  /* ═══════════════ la pensée : au-dessus de l'afro, les petits ronds descendent vers lui ═══════════════ */
  const _h = new THREE.Vector3();
  function placerPensee() {
    // en mode salon, la pensée reste une dizaine de secondes, puis laisse voir la pièce (elle revient quand on le touche)
    const montrer = penseeVue && poids.triste < .5 && (parent !== plein || horloge < penseeJusqua);
    pensee.classList.toggle('visible', montrer);
    points.forEach(p => p.classList.toggle('visible', montrer));
    if (!montrer && !pensee.style.transform) return;
    const W = tW, H = tH;
    tete.localToWorld(_h.set(0, .25, -.06)); _h.project(camera);
    const hx = (_h.x + 1) / 2 * W, hy = (1 - _h.y) / 2 * H;
    const marge = 10;
    let cxB = hx + Math.min(bulleW * .3, W * .12), basB = hy - Math.max(30, H * .07);
    cxB = borne(cxB, bulleW / 2 + marge, W - bulleW / 2 - marge);
    basB = Math.max(basB, bulleH + hautPensee);
    pensee.style.transform = `translate(${Math.round(cxB - bulleW / 2)}px, ${Math.round(basB - bulleH)}px)`;
    const ax = borne(hx, cxB - bulleW / 2 + 22, cxB + bulleW / 2 - 22), ay = basB - 4;
    const dx = ax - hx, dy = ay - (hy - 6), loin = Math.hypot(dx, dy) > 26;
    points.forEach((p, i) => {
      const f = [.76, .5, .24][i], d = +p.dataset.d;
      p.style.transform = `translate(${Math.round(hx + dx * f - d / 2)}px, ${Math.round(hy - 6 + dy * f - d / 2)}px)`;
      p.style.display = loin ? '' : 'none';
    });
  }

  /* ═══════════════ ce qu'on peut toucher ═══════════════
     Des objets futiles (le chat, la lampe, la fenêtre, les enceintes, les cadres…) et des passerelles
     vers les autres créations d'Amélien (la porte du bureau, Talya, l'ordi, le globe, la boîte à curiosités).
     Une passerelle ouvre dans un nouvel onglet : la musique continue ici. */
  const zone = (w, h, d, parent, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(x, y, z); parent.add(m); return m; };
  const CIBLES = [];
  const cible = (obj, nom, action, quoi = '') => CIBLES.push({ obj, nom, action, quoi });   // quoi : ce qu'on y gagne, écrit sous le nom
  const reactions = {};                                        // nom → instant où ça a commencé
  const reagir = nom => { reactions[nom] = horloge; };
  const depuis = nom => reactions[nom] === undefined ? 99 : horloge - reactions[nom];
  let lampeEteinte = false, vuForce = 0, lcdMessage = '', finLcdMessage = 0, penseeJusqua = 0;
  const ALLER = { bureau: 'https://amelienito.github.io/', talya: 'https://amelienito.github.io/Hb/', blog: 'https://www.onsenbranle.fr', cite: 'https://amelienito.github.io/cite-trois-chinois/', faits: 'https://amelienito.github.io/fun-facts/' };
  const hasard = l => l[Math.floor(Math.random() * l.length)];

  // lui (et sa pensée revient quand on le touche)
  cible(zone(.5, .8, .4, buste, 0, .4, 0), 'Amélien', () => {
    penseeJusqua = horloge + 8;
    if (etat.humeur === 'triste') { reagir('eclair'); return { texte: hasard(['Pas maintenant…', 'Remets du son…', 'Laisse-moi…']) }; }
    lancerActivite('salut');
    return { texte: 'Monte le son' };
  }, 'lui dire bonjour');
  cible(nuage, 'Le petit nuage', () => { reagir('eclair'); return null; }, 'il boude sans musique');
  // les passerelles : une petite fenêtre, avec de quoi y aller (nouvel onglet, la musique continue ici)
  cible(porte, 'La porte du bureau', () => { reagir('porte'); return { texte: 'Le bureau, à côté : toutes les créations d’Amélien', lien: ALLER.bureau, quoi: 'Entrer' }; }, 'toutes ses créations');
  cible(zone(1.1, .55, 1.0, panier, 0, .27, 0), 'Talya', () => { reagir('talya'); return { texte: 'Talya a son jeu à elle : RP Talya', lien: ALLER.talya, quoi: 'Jouer' }; }, 'son jeu : RP Talya');
  cible(ordi, 'L’ordi', () => { if (etat.humeur !== 'triste' && !activite) lancerActivite('ordi'); return { texte: 'Sur l’écran : Onsenbranle.fr, son blog', lien: ALLER.blog, quoi: 'Lire' }; }, 'son blog, Onsenbranle.fr');
  cible(globe, 'Le globe', () => { reagir('globe'); return { texte: 'Cite 3 Chinois : trois célébrités par pays', lien: ALLER.cite, quoi: 'Jouer' }; }, 'le jeu Cite 3 Chinois');
  cible(curio, 'La boîte à curiosités', () => { reagir('curio'); return { texte: 'Fun facts : pour apprendre en s’amusant', lien: ALLER.faits, quoi: 'Ouvrir' }; }, 'le quiz Fun facts');
  // les objets futiles : ils réagissent, sans forcément rien dire
  cible(chat, 'Le chat', () => { reagir('chat'); return null; }, 'il s’étire');
  const zoneLampe = zone(.2, 2.2, .2, lampe, 0, 1.1, 0); zone(.44, .3, .44, zoneLampe, -.68, 1.17, .46);
  cible(zoneLampe, 'La lampe', () => { lampeEteinte = !lampeEteinte; return null; }, 'allumer, éteindre');
  cibleFenetre = { obj: vitre, nom: `La fenêtre : ${tranche.nom}`, action: () => null }; CIBLES.push(cibleFenetre);
  haut_parleurs.forEach(h => { if (h.type === 'grave') cible(h.e, 'L’enceinte', () => { for (let k = 0; k < 5; k++) emettre(true); return null; }, 'un coup de basse'); });
  cible(zone(RW + .1, 1.3, RD, chaine, 0, .66, 0), 'La chaîne', () => { vuForce = 1.2; lcdMessage = hasard(['MERCI', 'TROP FORT', 'BASS BOOST']); finLcdMessage = horloge + 2.2; return null; }, 'un mot sur l’écran');
  cible(plante, 'La plante', () => { reagir('plante'); return null; }, 'ses feuilles dansent');
  // la bibliothèque : on en sort un CD au hasard (un morceau avec le mot d'Amélien) ; il vient flotter devant nous
  cible(zone(1.3, 1.47, .34, biblio, 0, .735, 0), 'La bibliothèque', () => { sortirCD(); return null; }, 'sortir un CD au hasard');
  cible(zone(.6, .3, .6, table, 0, .62, 0), 'Le verre', () => { if (etat.humeur !== 'triste' && !activite) lancerActivite('boire'); return null; }, 'il boit une gorgée');
  cible(pouf, 'Le pouf', () => { reagir('pouf'); return null; }, 'il rebondit');
  cible(loup, 'Le loup de Cul7ure', () => { reagir('loup'); return null; }, 'le média rap qu’il a cofondé');
  cible(poster, 'En écoute', () => { reagir('pochette'); return { texte: etat.titre ? `En écoute : ${etat.titre} — ${etat.artiste || ''}` : 'La pochette du dernier morceau' }; }, 'le morceau qui passe');
  CADRES_IMG.forEach(c => cible(c.g, c.legende, () => { c.g.userData.penche = !c.g.userData.penche; return { texte: c.legende }; }));

  /* ═══════════════ un CD sorti de la bibliothèque, comme un objet qu'on inspecte dans un jeu vidéo ═══════════════
     Le boîtier quitte l'étagère, vient flotter devant nous et tourne doucement, pochette en face ; dessous, une petite
     légende : le titre, ton mot, « Écouter », « Un autre ». On le range en touchant ailleurs (ou Échap). */
  const inspect = new THREE.Group(); inspect.visible = false; scene.add(inspect);
  const boitierI = new THREE.Group(); inspect.add(boitierI);
  const couvI = new THREE.MeshBasicMaterial({ color: '#ffffff', map: vierge });
  {
    const plateauI = new THREE.Mesh(new THREE.BoxGeometry(.3, .27, .02), new THREE.MeshStandardMaterial({ color: '#141317', roughness: .35 })); plateauI.position.z = -.004; boitierI.add(plateauI);
    const disqueI = new THREE.Mesh(new THREE.CylinderGeometry(.118, .118, .004, 48), new THREE.MeshStandardMaterial({ map: faceCD, metalness: .4, roughness: .2, emissive: '#ffffff', emissiveMap: faceCD, emissiveIntensity: .25 }));
    disqueI.rotation.x = Math.PI / 2; disqueI.position.set(.11, 0, -.016); boitierI.add(disqueI);   // le disque, à moitié sorti derrière
    const c = new THREE.Mesh(new THREE.PlaneGeometry(.255, .255), couvI); c.position.set(.016, 0, .0075); boitierI.add(c);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(.3, .27, .004), new THREE.MeshStandardMaterial({ color: '#e8eef5', transparent: true, opacity: .14, roughness: .04, depthWrite: false }));
    lid.position.z = .01; boitierI.add(lid);
    const charniere = new THREE.Mesh(new THREE.BoxGeometry(.022, .27, .022), new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: .25 })); charniere.position.set(-.139, 0, .002); boitierI.add(charniere);
    const reflet = new THREE.Mesh(new THREE.PlaneGeometry(.035, .28), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .1, depthWrite: false })); reflet.position.set(.06, 0, .013); reflet.rotation.z = -.18; boitierI.add(reflet);
  }
  const legendeI = document.createElement('div'); legendeI.className = 'piece-livret';
  let cdSorti = null, cdDebut = 0, cdFin = 0;
  const _dep = new THREE.Vector3(), _arr = new THREE.Vector3(), _fw = new THREE.Vector3(), _up = new THREE.Vector3(), _qc = new THREE.Quaternion(), _qw = new THREE.Quaternion();
  function sortirCD() {
    const m = window.MD && window.MD.auHasard && window.MD.auHasard();
    if (!m) return;
    const l = hasard(livresMobiles); if (l) l.userData.sortie = horloge;
    cdSorti = m; cdDebut = horloge; cdFin = 0;
    couvI.map = vierge; couvI.needsUpdate = true;
    if (window.MD.pochette) window.MD.pochette(m.id, src => chargeur.load(src, t => {
      if (cdSorti !== m) { t.dispose(); return; }
      t.colorSpace = THREE.SRGBColorSpace; const avant = couvI.map; couvI.map = t; couvI.needsUpdate = true; if (avant && avant !== vierge) avant.dispose();
    }, undefined, () => {}));
    (l || biblio).getWorldPosition(_dep);
    legendeI.innerHTML = '';
    const t = document.createElement('p'); t.className = 'piece-livret-titre'; t.textContent = m.titre; legendeI.appendChild(t);
    const a = document.createElement('p'); a.className = 'piece-livret-artiste'; a.textContent = m.artiste; legendeI.appendChild(a);
    if (m.note) { const n = document.createElement('p'); n.className = 'piece-livret-mot'; n.textContent = m.note; legendeI.appendChild(n); }
    const actions = document.createElement('div'); actions.className = 'piece-livret-actions';
    const bouton = (texte, classe, faire) => { const b = document.createElement('button'); b.type = 'button'; b.className = classe; b.textContent = texte; b.addEventListener('click', e => { e.stopPropagation(); faire(); }); actions.appendChild(b); };
    bouton('Écouter ▸', 'piece-livret-ecouter', () => { window.MD.jouer(m.id); rangerCD(); });
    bouton('Un autre', 'piece-livret-autre', () => sortirCD());
    bouton('×', 'piece-livret-fermer', () => rangerCD());
    actions.lastChild.setAttribute('aria-label', 'Ranger le CD');
    legendeI.appendChild(actions);
    etiquette.classList.remove('visible'); etiquettePoint = null;
    inspect.visible = true;
  }
  function rangerCD() { if (cdSorti && !cdFin) cdFin = horloge; legendeI.classList.remove('visible'); }
  addEventListener('keydown', e => { if (e.key === 'Escape' && cdSorti) rangerCD(); });
  function animerCD() {
    if (!cdSorti) return;
    // où il flotte : bien devant nous, un peu au-dessus du milieu (la légende va dessous)
    camera.getWorldDirection(_fw); _up.copy(camera.up).applyQuaternion(camera.quaternion);
    const pres = Math.max(.75, .8 * (camera.fov > 50 ? 1.15 : 1));
    _arr.copy(camera.position).addScaledVector(_fw, pres).addScaledVector(_up, .07);
    const aller = doux3((horloge - cdDebut) / .7), retour = cdFin ? doux3((horloge - cdFin) / .45) : 0, k = aller * (1 - retour);
    inspect.position.lerpVectors(_dep, _arr, k);
    // d'abord sur la tranche (comme rangé), puis face à nous ; il tourne doucement de gauche à droite
    _qc.copy(camera.quaternion);
    _qw.setFromEuler(new THREE.Euler(Math.sin(horloge * .9) * .08, (1 - k) * 1.5 + Math.sin(horloge * .7) * .35, 0));
    inspect.quaternion.copy(_qc).multiply(_qw);
    inspect.scale.setScalar(.25 + .75 * k);
    legendeI.classList.toggle('visible', aller > .9 && !cdFin);
    if (aller > .9 && !cdFin) {
      _ep.copy(_arr).addScaledVector(_up, -.16).project(camera);
      const lw = legendeI.offsetWidth, lh = legendeI.offsetHeight;
      const x = borne((_ep.x + 1) / 2 * tW - lw / 2, 8, tW - lw - 8), y = borne((1 - _ep.y) / 2 * tH, 8, tH - lh - 8);
      legendeI.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }
    if (cdFin && retour >= 1) { cdSorti = null; inspect.visible = false; }
  }

  // l'étiquette qui apparaît là où on a touché, et le nom de l'objet sous la souris
  const etiquette = document.createElement('div'); etiquette.className = 'piece-etiquette';
  const survol = document.createElement('div'); survol.className = 'piece-survol';
  let etiquettePoint = null, finEtiquette = 0, etiquetteW = 0, etiquetteH = 0;
  function montrerEtiquette(r, point) {
    etiquette.innerHTML = '';
    const p = document.createElement('span'); p.textContent = r.texte; etiquette.appendChild(p);
    if (r.detail) { const d = document.createElement('small'); d.textContent = r.detail; etiquette.appendChild(d); }
    if (r.lien) { const a = document.createElement('a'); a.href = r.lien; a.target = '_blank'; a.rel = 'noopener'; a.textContent = `${r.quoi || 'Y aller'} ↗`; etiquette.appendChild(a); }
    if (r.faire) { const b = document.createElement('button'); b.type = 'button'; b.textContent = `${r.bouton} ▸`; b.addEventListener('click', e => { e.stopPropagation(); r.faire(); etiquette.classList.remove('visible'); etiquettePoint = null; }); etiquette.appendChild(b); }
    etiquettePoint = point.clone(); finEtiquette = horloge + (r.lien || r.faire ? 8 : 3.2);
    etiquette.classList.add('visible');
    etiquetteW = etiquette.offsetWidth; etiquetteH = etiquette.offsetHeight;
  }
  const rayon = new THREE.Raycaster(), ptr = new THREE.Vector2();
  function viser(ev) {
    const r = toile.getBoundingClientRect();
    ptr.set((ev.clientX - r.left) / r.width * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    rayon.setFromCamera(ptr, camera);
    let mieux = null, d = Infinity, point = null;
    for (const c of CIBLES) {
      if (!c.obj.visible && c.obj !== nuage) continue;
      if (c.obj === nuage && !nuage.visible) continue;
      const h = rayon.intersectObject(c.obj, true)[0];
      if (h && h.distance < d) { d = h.distance; mieux = c; point = h.point; }
    }
    return mieux && { c: mieux, point };
  }
  toile.addEventListener('click', ev => {
    if (aGlisse) { aGlisse = false; return; }   // on a fait tourner la pièce, pas touché un objet
    if (cdSorti && !cdFin) { rangerCD(); return; }   // le CD sorti se range d'abord
    const v = viser(ev);
    if (!v) { etiquette.classList.remove('visible'); return; }
    const r = v.c.action();
    if (r) montrerEtiquette(r, v.point); else { etiquette.classList.remove('visible'); etiquettePoint = null; }
  });
  let survolPrevu = false;
  toile.addEventListener('pointermove', ev => {
    if (ev.pointerType !== 'mouse' || survolPrevu) return;
    survolPrevu = true;
    requestAnimationFrame(() => {
      survolPrevu = false;
      const v = viser(ev);
      toile.style.cursor = v ? 'pointer' : '';
      survol.classList.toggle('visible', !!v);
      if (v) { const r = toile.getBoundingClientRect(); survol.innerHTML = ''; { const b = document.createElement('b'); b.textContent = v.c.nom; survol.append(b); if (v.c.quoi) { const i = document.createElement('span'); i.textContent = v.c.quoi; survol.append(i); } } survol.style.transform = `translate(${Math.round(ev.clientX - r.left + 14)}px, ${Math.round(ev.clientY - r.top + 16)}px)`; }
    });
  });
  toile.addEventListener('pointerleave', () => { survol.classList.remove('visible'); toile.style.cursor = ''; });
  const _ep = new THREE.Vector3();
  function placerEtiquette() {
    if (!etiquettePoint) return;
    if (horloge > finEtiquette) { etiquette.classList.remove('visible'); etiquettePoint = null; return; }
    _ep.copy(etiquettePoint).project(camera);
    const W = tW, H = tH, ew = etiquetteW, eh = etiquetteH;
    const x = borne((_ep.x + 1) / 2 * W - ew / 2, 8, W - ew - 8), y = borne((1 - _ep.y) / 2 * H - eh - 14, 8, H - eh - 8);
    etiquette.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  // les réactions, image après image
  let eveilTalya = 0;
  function animerReactions(t, dt) {
    // il vit sa vie en mode salon : de temps en temps, l'ordi, une gorgée, le téléphone, un étirement
    if (activite && (t > finActivite || (etat.humeur === 'triste' && activite !== 'salut'))) { activite = null; prochaineActivite = t + (parent === plein ? 9 + Math.random() * 9 : 18 + Math.random() * 18); }
    // en mode salon il vit sa vie souvent ; dans la page, de temps en temps (sinon il garde l'attitude du morceau)
    if (!activite && etat.joue && !calme && t > prochaineActivite) lancerActivite(hasard(['ordi', 'ecrire', 'telephone', 'etirement', 'malcolm', 'savourer', 'claquer', 'boire', 'ecrire']));
    // la porte s'ouvre un peu plus, puis revient
    const dp = depuis('porte'); battant.rotation.y = .42 + (dp < 4 ? Math.sin(Math.min(1, dp * 3) * Math.PI / 2) * .5 * Math.min(1, (4 - dp) * 1.5) : 0);
    // Talya relève la tête et remue la queue
    const dt2 = depuis('talya'); eveilTalya = dt2 < 3 ? Math.min(1, dt2 * 4, (3 - dt2) * 2) : 0;
    teteT.position.y = .36 + eveilTalya * .1;
    // le chat s'étire
    const dc = depuis('chat'), et = dc < 1.6 ? Math.sin(dc / 1.6 * Math.PI) : 0;
    corpsChat.scale.x = 1.35 + et * .35; chat.position.y = REBORD + .03 + et * .02;
    // le globe tourne, la boîte s'ouvre, le loup fait un tour, la plante danse, le pouf rebondit
    globeBoule.rotation.y += dt * (.1 + (depuis('globe') < 2.5 ? (2.5 - depuis('globe')) * 6 : 0));
    const dcu = depuis('curio'), ouvert = dcu < 5 ? Math.min(1, dcu * 3, (5 - dcu) * 2) : 0;
    couvercle.rotation.x = -ouvert * 1.6; lueurCurio.intensity = ouvert * 1.2;
    const dl = depuis('loup'); loup.rotation.y = -.6 + (dl < .9 ? (dl / .9) * Math.PI * 2 : 0); loup.position.y = loup.userData.y0 + (dl < .9 ? Math.sin(dl / .9 * Math.PI) * .06 : 0);
    const dpl = depuis('plante'); feuilles.rotation.z = dpl < 2 ? Math.sin(dpl * 14) * .12 * (2 - dpl) / 2 : ondule(Math.sin(t * .8) * .01);
    const dpo = depuis('pouf'); pouf.scale.y = 1 - (dpo < .5 ? Math.sin(dpo / .5 * Math.PI) * .12 : 0);
    // les cadres qu'on a mis de travers
    CADRES_IMG.map(c => c.g).forEach((g, i) => { const vise = g.userData.penche ? (i % 2 ? .07 : -.07) : 0; g.rotation.z = lisse(g.rotation.z, vise, Math.min(1, dt * 8)); });
    // un livre sort un peu, puis rentre
    livresMobiles.forEach(l => { const d = l.userData.sortie === undefined ? 99 : t - l.userData.sortie; if (l.userData.z0 === undefined) l.userData.z0 = l.position.z; l.position.z = l.userData.z0 + (d < 2.4 ? Math.min(1, d * 4, (2.4 - d) * 2) * .11 : 0); });
    // l'éclair dans le petit nuage
    const de = depuis('eclair');
    nuage.children.forEach(m => { if (m.material && m.material.emissive) m.material.emissive.setRGB(de < .35 ? 1.2 : 0, de < .35 ? 1.1 : 0, de < .35 ? .6 : 0); });
  }

  /* ═══════════════ la boucle ═══════════════ */
  let visible = false, cielGris = 1, dernier = performance.now(), horloge = 0, prochainBattement = 0, lcdT = 0, cielT = 0, phase = 0, premiere = true, derniereOmbre = 0;
  /* si l'appareil n'arrive plus à suivre (images trop espacées pendant deux secondes), on calcule un peu moins de pixels ;
     s'il a de la marge pendant longtemps, on remonte. La pièce reste fluide plutôt que nette et saccadée. */
  let qualite = 1, mesures = [], precedente = 0, aise = 0;
  function suivreFluidite(ms) {
    const d = ms - precedente; precedente = ms;
    if (!etat.joue || d <= 0 || d > 250) { mesures.length = 0; return; }   // sans musique (30 images par seconde) ou après une coupure : on ne juge pas
    mesures.push(d); if (mesures.length < 120) return;
    mesures.sort((a, b) => a - b); const med = mesures[60];
    // (un appareil bridé à 30 images par seconde, comme un iPad en mode économie d'énergie, donne des images régulières : ce n'est pas une saccade)
    if ((med > 40 || (med > 21 && mesures[12] < 26)) && qualite > .55) { qualite = Math.max(.55, qualite - .15); aise = 0; taille(); }
    else if (med < 15.5 && qualite < 1 && ++aise >= 4) { qualite = Math.min(1, qualite + .1); aise = 0; taille(); }
    mesures.length = 0;
  }
  const niveaux = [0, 0], _t = new THREE.Vector3(), cFroid = new THREE.Color('#6f7fae'), cChaud = new THREE.Color(), cAmpouleOff = new THREE.Color('#3a3128'), cAmpouleOn = new THREE.Color('#ffe2a6'), cVuOff = new THREE.Color('#3b2c18'), cVuOn = new THREE.Color('#ffcf7a');
  dessinerCiel(0, 1); dessinerLcd(true, 0);
  function image(ms) {
    if (!visible || document.hidden) { boucle = null; return; }
    boucle = requestAnimationFrame(image);
    if (!etat.joue && poids.triste > .98 && ms - dernier < 30) return;   // sans musique, 30 images par seconde suffisent
    const dt = borne((ms - dernier) / 1000, 0, .05); dernier = Math.max(dernier, ms); horloge += dt;   // l'horodatage d'une image peut précéder performance.now()
    const t = horloge;
    const bpm = Number(etat.bpm) || 96;
    const battement = 60 / borne(bpm, 60, 170) * (bpm > 130 ? 2 : 1);
    phase += dt / battement * Math.PI * 2;
    animerReactions(t, dt);
    animerCorps(t, dt, phase);

    // la lumière : la musique réchauffe la pièce ; sans elle, tout devient froid
    const tr = poids.triste, mus = 1 - tr, nuit = 1 - jour;
    hemi.intensity = .26 + mus * (.36 + jour * .3);
    hemi.color.copy(cFroid).lerp(cChaud.set(mel('#c7c3d6', '#fff1dc', jour)), mus);
    plafonnier.intensity = 4 + mus * (28 + nuit * 14);
    liseuse.intensity = (lampeEteinte ? 0 : 1) * mus * (7 + nuit * 24);
    chaleur.intensity = mus * (1.5 + nuit * 3);
    soleil.intensity = (.1 + jour * 1.5) * (1 - .6 * tr);
    soleil.color.set(mel('#6f86c6', tranche.couleur || '#fff1d8', jour)); soleil.position.y = 1.2 + jour * 2.4;
    blues.intensity = tr * 70;
    rendu.toneMappingExposure = 1.1 - .18 * tr;
    matAmpoule.color.copy(cAmpouleOff).lerp(cAmpouleOn, lampeEteinte ? 0 : mus);
    matVu.color.copy(cVuOff).lerp(cVuOn, mus);
    led.visible = mus > .5;
    if (parent) parent.classList.toggle('triste', tr > .5);

    // la chaîne : les vu-mètres, les membranes, les notes
    const fort = (Number(etat.energie) || 5) >= 8;
    if (etat.joue && !calme && t >= prochainBattement) { emettre(fort); prochainBattement = t + battement * (fort ? .5 : 1); }
    aiguilles.forEach((a, i) => {
      vuForce = Math.max(0, vuForce - dt / 2);
      const cible = vuForce > .01 ? borne(.6 + vuForce * .5 + (Math.random() - .5) * .2, 0, 1) : etat.joue ? borne(.32 + Math.pow(Math.abs(Math.sin(phase * .5 + i * .7)), 2) * (.25 + (Number(etat.energie) || 5) * .045) + (Math.random() - .5) * .12, 0, 1) : 0;
      niveaux[i] = lisse(niveaux[i], cible, cible > niveaux[i] ? Math.min(1, dt * 18) : Math.min(1, dt * 4));
      a.rotation.z = .85 - niveaux[i] * 1.7;
    });
    // les membranes poussent l'air (bien visible), et entre deux temps le boomer vibre encore un peu
    const vibre = etat.joue && !calme ? (Number(etat.energie) || 5) / 10 : 0;
    haut_parleurs.forEach((h, i) => {
      h.push = Math.max(0, h.push - dt * 5);
      const tremble = h.type === 'grave' ? Math.sin(t * 47 + i) * .004 * vibre : 0;
      h.hp.position.z = h.base + h.push * (h.type === 'grave' ? .045 : h.type === 'medium' ? .018 : 0) + tremble;
      if (h.type !== 'aigu') h.hp.scale.setScalar(1 + h.push * (h.type === 'grave' ? .05 : .03));
    });
    ondes.forEach(o => {
      if (o.vie <= 0) return;
      o.vie -= dt * 1.3;
      o.m.position.addScaledVector(o.dir, dt * 1.1);
      o.m.scale.setScalar(.2 + (1 - o.vie) * .75);
      o.m.material.opacity = Math.max(0, o.vie) * .32 * mus;
      if (o.vie <= 0) o.m.visible = false;
    });
    // la chaîne vit : le CD tourne, les bobines défilent, l'aiguille du tuner cherche, les cadrans éclairent
    vitesseDisque = lisse(vitesseDisque, etat.joue ? 5.5 : 0, Math.min(1, dt * 1.5));
    disque.rotation.y -= dt * vitesseDisque;
    bobines.forEach((b, i) => { b.rotation.z += dt * vitesseDisque * .63 * (i % 2 ? .8 : 1.1); });
    if (etat.joue) aiguilleTuner.position.x = -.08 + Math.sin(t * .09) * .26;
    lueurChaine.intensity = mus * (.6 + nuit * .6);
    if ((mus > .5) !== neonAllume) { neonAllume = mus > .5; dessinerNeon(neonAllume); }
    lueurNeon.intensity = mus * (.5 + nuit * .7);
    cdMural.rotation.z -= dt * ((etat.joue ? 1.1 : 0) + (depuis('pochette') < 1.6 ? 9 * (1.6 - depuis('pochette')) : 0));
    ecranCadran.material.color.setScalar(.25 + mus * .75);
    notes.forEach(n => {
      if (n.vie <= 0) return;
      n.vie -= dt; n.m.position.addScaledVector(n.v, dt); n.v.y -= dt * .06;
      ['x', 'y', 'z'].forEach(ax => {
        const [lo, hi] = BORNES[ax];
        if (n.m.position[ax] < lo) { n.m.position[ax] = lo; n.v[ax] = Math.abs(n.v[ax]) * .9; }
        if (n.m.position[ax] > hi) { n.m.position[ax] = hi; n.v[ax] = -Math.abs(n.v[ax]) * .9; }
      });
      n.tour += dt;
      n.m.quaternion.copy(camera.quaternion); n.m.rotateZ(Math.sin(n.tour * 3) * .3);
      n.m.material.opacity = Math.min(1, n.vie) * .95;
      n.m.scale.setScalar(.75 + Math.min(1, n.vie / 4.5) * .55);
      if (n.vie <= 0 || tr > .6) { n.m.visible = false; n.vie = 0; }
    });
    // l'écran fait défiler le morceau, l'analyseur de spectre danse
    if ((lcdT += dt) > .05) { lcdT = 0; if (etat.joue) lcdDecalage += 4.5; dessinerLcd(!etat.joue, t, t < finLcdMessage ? lcdMessage : ''); dessinerSpectre(etat.joue); }
    // la fenêtre : chaque minute, ou souvent quand il pleut
    cielT += dt;
    const cielBouge = tr > .02 || Math.abs(tr - cielGris) > .01 || tranche.oiseaux || tranche.avion || tranche.cumulus || tranche.montgolfiere || tranche.nuagesRoses || tranche.clignotant || tranche.filante || tranche.etoiles;
    if (cielT > (calme ? 30 : cielBouge ? .25 : 20)) { cielT = 0; cielGris = tr; dessinerCiel(t, tr); }

    // le nuage au-dessus de sa tête
    nuage.visible = tr > .03;
    if (nuage.visible) {
      tete.getWorldPosition(_t); _t.y += .5;
      if (premiere) nuage.position.copy(_t); else nuage.position.lerp(_t, Math.min(1, dt * 3));
      nuage.position.y += ondule(Math.sin(t * 1.3) * .02);
      nuage.scale.setScalar(Math.max(.001, borne((tr - .03) * 1.4, 0, 1)));
      gouttes.forEach((g, i) => { g.visible = !calme; g.position.y -= dt * (1.3 + (i % 4) * .2); if (g.position.y < -.5) { g.position.y = -.08; g.position.x = (Math.random() - .5) * .34; } });
    }
    blues.target.position.copy(nuage.position).y -= .6;

    // Talya et le chat respirent ; une oreille frémit de temps en temps
    corpsT.scale.y = .55 + ondule(Math.sin(t * 1.5) * .015);
    corpsChat.scale.y = .6 + ondule(Math.sin(t * 1.7 + 1) * .03);
    teteT.rotation.x = -.15 - eveilTalya * .3 + ondule(Math.sin(t * .6) * .03);
    const frisson = ondule(Math.max(0, Math.sin(t * .9) - .985) * 40);
    oreilles[0].rotation.x = Math.sin(t * 40) * frisson * .3 + eveilTalya * .25; oreilles[1].rotation.x = -eveilTalya * .25;
    queueT.rotation.y = eveilTalya ? Math.sin(t * 16) * .55 * eveilTalya : ondule(Math.sin(t * (etat.joue ? 3 : 1.2)) * (etat.joue ? .25 : .08));

    placerCamera(ms);
    if (ms - derniereOmbre > 30 || premiere) { derniereOmbre = ms; rendu.shadowMap.needsUpdate = true; }
    rendu.render(scene, camera);
    suivreFluidite(ms);
    placerPensee();
    placerEtiquette();
    animerCD();
    if (premiere) { premiere = false; requestAnimationFrame(() => toile.classList.add('prete')); }
  }
  let boucle = null;
  const relancer = () => { if (!boucle && visible && !document.hidden) { dernier = performance.now(); boucle = requestAnimationFrame(image); } };
  document.addEventListener('visibilitychange', relancer);

  /* ═══════════════ une seule pièce, posée dans le salon qui est à l'écran ═══════════════ */
  const vus = new Map();
  function placer() {
    const cible = document.body.classList.contains('mode-salon') && plein ? plein : conteneurs.find(c => c !== plein && vus.get(c));
    visible = !!cible;
    if (cible && cible !== parent) {
      if (parent) parent.classList.remove('triste');
      if (cible !== plein) pres = false;
      parent = cible;
      cible.append(toile, pensee, ...points, etiquette, survol, legendeI);
      remettreVue();
      // dans la page, un glissement vertical fait défiler la page ; en grand, tous les gestes tournent la pièce
      toile.style.touchAction = cible === plein ? 'none' : 'pan-y';
      taille();
    }
    if (visible) relancer();
  }
  const obs = new IntersectionObserver(entrees => {
    entrees.forEach(e => vus.set(e.target, e.isIntersecting && e.target.getClientRects().length > 0));
    placer();
  }, { threshold: .05 });
  conteneurs.forEach(c => {
    c.classList.add('en-3d'); obs.observe(c);
    // sous la chaîne : le bouton pour passer la pièce en grand
    if (c !== plein && c.closest('.ecran-machine')) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'salon-agrandir'; b.dataset.action = 'mode-salon';
      b.title = 'La pièce en grand, la musique continue';
      b.innerHTML = '<span aria-hidden="true">⤢</span> Mode salon';
      c.appendChild(b);
    }
  });
  if (window.ResizeObserver) { const ro = new ResizeObserver(() => taille()); conteneurs.forEach(c => ro.observe(c)); }
  addEventListener('resize', taille); addEventListener('md-mise-en-page', taille);
  document.body.classList.add('piece-3d');

  // les images des cadres arrivent après le reste
  (window.requestIdleCallback || (f => setTimeout(f, 400)))(() => {
    CADRES_IMG.forEach(c => chargeur.load(`img/salon/${c.nom}.jpg`, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; c.image.material.map = t; c.image.material.color.set('#ffffff'); c.image.material.needsUpdate = true; }, undefined, () => {}));
  }, { timeout: 1500 });
  lierOrbite(toile);
  window.Piece = { maj, placer, vue: () => { pres = !pres && parent === plein; remettreVue(); cadrer(); return pres; } };
  window.__pieceDebug = { THREE, rendu, fauteuil, perso, buste, tete, bras, jambes, poids, scene, camera, lancerActivite,
    // où se trouve un objet touchable à l'écran (pour les vérifications)
    ecran: nom => { const c = CIBLES.find(x => x.nom === nom); if (!c) return null; const b = new THREE.Box3().setFromObject(c.obj); const p = b.getCenter(new THREE.Vector3()).project(camera); const r = toile.getBoundingClientRect(); return [r.left + (p.x + 1) / 2 * r.width, r.top + (1 - p.y) / 2 * r.height]; },
    noms: () => CIBLES.map(c => c.nom), cd: () => ({ sorti: !!cdSorti, visible: inspect.visible, pos: inspect.position.toArray(), cam: camera.position.toArray() }), sortirCD, finirCD: () => { cdDebut = horloge - 5; }, orbite };   // pour les vérifications
  if (window.__salonEtat) maj(window.__salonEtat);
  const compile = rendu.compileAsync ? rendu.compileAsync(scene, camera).catch(() => {}) : Promise.resolve();
  compile.then(() => placer());
  setTimeout(() => placer(), 2500);   // au cas où la compilation traînerait
}
