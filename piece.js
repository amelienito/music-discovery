/* ════════════════════════════════════════════════════════════════════
   LA PIÈCE — Music Discovery en 3D
   Le salon du même appartement que la vitrine (amelienito.github.io) :
   même parquet, mêmes murs, même fenêtre, vu de face comme une maison
   de poupée. Au milieu, Amélien dans son fauteuil club, les pieds sur le
   pouf. À sa droite, la chaîne : lecteur CD qui fait défiler le morceau,
   ampli à vu-mètres, platine cassette, deux grandes colonnes. Au fond,
   Talya dort dans son panier, le chat sur le rebord de la fenêtre, et la
   fenêtre montre le vrai moment de la journée.
   Quand la musique joue, la pièce se réchauffe, des notes partent des
   enceintes et rebondissent sur les murs, et il vit le morceau : il lit
   quand c'est très doux, met les mains derrière la tête quand c'est
   catchy, balance la tête quand c'est groovy, tape sur les accoudoirs
   quand c'est énergique. Ton mot devient une pensée au-dessus de lui.
   Sans musique, tout s'éteint : lumière froide, pluie à la fenêtre, un
   petit nuage au-dessus de sa tête, et lui, la tête dans les mains.
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
// la 3D ne démarre qu'une fois la page chargée, et quand un salon approche de l'écran :
// le site et la musique passent toujours en premier
function demarrer() {
  if (demarrer.fait) return; demarrer.fait = true;
  try { lancer(); } catch (e) { renoncer(e); }
}
function guetter() {
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    io.disconnect();
    (window.requestIdleCallback || (f => setTimeout(f, 200)))(demarrer, { timeout: 900 });
  }, { rootMargin: '400px' });
  conteneurs.forEach(c => io.observe(c));
}
if (conteneurs.length && webgl()) {
  if (document.readyState === 'complete') guetter(); else addEventListener('load', guetter, { once: true });
} else renoncer();

function lancer() {
  /* ═══════════════ le moteur ═══════════════ */
  const toile = document.createElement('canvas');
  toile.className = 'piece-toile';
  toile.setAttribute('aria-hidden', 'true');
  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  rendu.shadowMap.enabled = true;
  rendu.shadowMap.type = THREE.PCFShadowMap;
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
  const points = [12, 8, 5].map(d => { const p = document.createElement('i'); p.className = 'piece-pensee-point'; p.style.width = p.style.height = d + 'px'; p.dataset.d = d; return p; });

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
  plafonnier.position.set(-.3, 3.7, .5); plafonnier.target.position.set(-.3, 0, -.7);
  plafonnier.castShadow = true; plafonnier.shadow.mapSize.set(1024, 1024); plafonnier.shadow.bias = -.0006; plafonnier.shadow.normalBias = .02;
  scene.add(plafonnier, plafonnier.target);
  // la liseuse (la lampe à arc), au-dessus de lui
  const liseuse = new THREE.SpotLight('#ffc98a', 20, 6, .8, .6, 1.5);
  liseuse.castShadow = true; liseuse.shadow.mapSize.set(1024, 1024); liseuse.shadow.bias = -.0008; liseuse.shadow.normalBias = .02;
  scene.add(liseuse, liseuse.target);
  const chaleur = new THREE.PointLight('#ff9a4a', 0, 7, 1.4); chaleur.position.set(-1.3, 1.3, -.9); scene.add(chaleur);
  // sans musique : une seule lumière froide, sur lui
  const blues = new THREE.SpotLight('#aabbe0', 0, 8, .44, 1, 1.1); blues.position.set(.55, 3.3, 1.35); scene.add(blues, blues.target);

  /* ═══════════════ la pièce (maison de poupée : pas de mur de face) ═══════════════ */
  const piece = new THREE.Group(); scene.add(piece);
  const LARG = 3.4, FOND = -2.6, AVANT = 2.5, HAUT = 3.3;
  const bois = ['#8a5d3b', '#94643f', '#7f5534', '#9a6b45'].map(c => M(c, { roughness: .75 }));
  for (let i = 0; i < 14; i++) boite(.5, .06, AVANT - FOND, bois[i % 4], piece, -3.25 + i * .5, -.03, (AVANT + FOND) / 2);
  const peinture = M('#d8c7a6', { flatShading: false }), plinthe = M('#efe6d3');
  boite(2 * LARG + .24, HAUT, .12, peinture, piece, 0, HAUT / 2, FOND - .06);
  [-1, 1].forEach(s => {
    boite(.12, HAUT, AVANT - FOND + .12, peinture, piece, s * (LARG + .06), HAUT / 2, (AVANT + FOND) / 2 - .06);
    boite(.05, .12, AVANT - FOND, plinthe, piece, s * (LARG - .025), .06, (AVANT + FOND) / 2);
  });
  boite(2 * LARG, .12, .05, plinthe, piece, 0, .06, FOND + .025);
  // le tapis, le même que dans la vitrine
  const tapis = cyl(1.75, 1.75, .03, 10, M('#7b3b2e', { roughness: 1 }), piece, .02, .015, .2); tapis.scale.z = .7;
  const tapis2 = cyl(1.36, 1.36, .035, 10, M('#c9a35a', { roughness: 1 }), piece, .02, .02, .2); tapis2.scale.z = .7;

  /* la fenêtre : le ciel de l'heure qu'il est */
  const FX = 1.35, FY = 1.62, FL = 1.3, FH = 1.2;
  const ciel = toileTexte(256, 236);
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(FL, FH), new THREE.MeshBasicMaterial({ map: ciel.t, toneMapped: false }));
  vitre.position.set(FX, FY, FOND + .005); scene.add(vitre);
  const cadre = M('#efe6d3');
  boite(FL + .16, .08, .1, cadre, piece, FX, FY + FH / 2 + .04, FOND + .03); boite(FL + .16, .08, .1, cadre, piece, FX, FY - FH / 2 - .04, FOND + .03);
  boite(.08, FH + .16, .1, cadre, piece, FX - FL / 2 - .04, FY, FOND + .03); boite(.08, FH + .16, .1, cadre, piece, FX + FL / 2 + .04, FY, FOND + .03);
  boite(.05, FH, .06, cadre, piece, FX, FY, FOND + .03);
  boite(FL + .3, .06, .26, cadre, piece, FX, FY - FH / 2 - .1, FOND + .12);   // le rebord
  const REBORD = FY - FH / 2 - .07;

  /* le poster, au-dessus de la chaîne : la pochette du morceau */
  const poster = vivant(groupe(piece, -1.85, 1.84, FOND + .03));
  boite(.74, .74, .04, M('#1f1a15'), poster, 0, 0, 0);
  boite(.66, .66, .045, M('#efe7d8'), poster, 0, 0, .002);
  const vierge = (() => { const { x, t } = toileTexte(64, 64); x.fillStyle = '#c8572f'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#1d1c22'; x.beginPath(); x.arc(32, 32, 18, 0, 7); x.fill(); x.fillStyle = '#efe7d8'; x.beginPath(); x.arc(32, 32, 3, 0, 7); x.fill(); return t; })();
  const affiche = new THREE.Mesh(new THREE.PlaneGeometry(.56, .56), new THREE.MeshStandardMaterial({ map: vierge, roughness: .6 }));
  affiche.position.z = .026; poster.add(affiche);
  const chargeur = new THREE.TextureLoader(); chargeur.setCrossOrigin('anonymous');
  let pochetteActuelle = null;
  function majPoster(src) {
    if (!src || src === pochetteActuelle) return;
    pochetteActuelle = src;
    chargeur.load(src, t => { if (pochetteActuelle !== src) return; t.colorSpace = THREE.SRGBColorSpace; affiche.material.map = t; affiche.material.needsUpdate = true; }, undefined, () => {});
  }

  /* ═══════════════ aux murs : les images d'Amélien ═══════════════
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
  // le mur du fond : l'album d'Amélien au-dessus de la colonne de gauche, l'illustration de Massy au-dessus du fauteuil, Kerry James Marshall à côté
  cadreImage('mode-creatif', .46, .46, piece, -2.95, 1.7, FOND + .03, 0, 'Mode Créatif, l’album d’Amélien');
  cadreImage('massy', .62, .827, piece, -.42, 1.75, FOND + .03, 0, 'Illustration de MassyPuster pour 7C');
  cadreImage('marshall', .3, .374, piece, .3, 1.66, FOND + .03, 0, 'Kerry James Marshall');
  // le mur de gauche, entre le coin et la bibliothèque : Seta, Junji Ito, The Boondocks
  cadreImage('seta', .38, .38, piece, -LARG + .03, 1.56, -2.22, Math.PI / 2, 'Seta, chez Cul7ure');
  cadreImage('junji', .29, .48, piece, -LARG + .03, 1.6, -1.8, Math.PI / 2, 'Junji Ito');
  cadreImage('boondocks', .3, .44, piece, -LARG + .03, 1.58, -1.42, Math.PI / 2, 'The Boondocks');

  /* la porte du bureau (la pièce de la vitrine), entrouverte, à droite de la fenêtre ; Talya dort devant */
  const PX = 2.66, PL = .84, PH = 2.04;
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

  /* sur le meuble de la chaîne, un cadre photo (Les Anges déchus) ; sur la bibliothèque, I Love Ugly, le globe et la boîte à curiosités */
  /* la bibliothèque, contre le mur de gauche */
  const biblio = groupe(piece, -LARG + .17, 0, -.5, Math.PI / 2);
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
  // sur la bibliothèque : I Love Ugly, le globe (Cite 3 Chinois), la boîte à curiosités (Fun facts)
  const ugly = cadreImage('i-love-ugly', .42, .28, biblio, -.05, 1.68, -.06, 0, 'I Love Ugly'); ugly.rotation.x = -.12;
  const globe = vivant(groupe(biblio, .45, 1.48, 0));
  cyl(.05, .065, .02, 10, M('#8c6a3c', { metalness: .5, roughness: .4 }), globe, 0, .01, 0); cyl(.008, .008, .07, 6, M('#8c6a3c', { metalness: .5 }), globe, 0, .05, 0);
  const globeBoule = (() => {
    const geo = new THREE.IcosahedronGeometry(.09, 2).toNonIndexed(); const p = geo.attributes.position, coul = [];
    for (let i = 0; i < p.count; i += 3) {
      const cx = p.getX(i) + p.getX(i + 1) + p.getX(i + 2), cy = p.getY(i) + p.getY(i + 1) + p.getY(i + 2), cz = p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2);
      const c = new THREE.Color(Math.sin(cx * 30) + Math.sin(cy * 25 + cz * 14) + Math.cos(cz * 33 - cx * 11) > .7 ? '#c9b27a' : '#3f6f8f');
      for (let j = 0; j < 3; j++) coul.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(coul, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5, flatShading: true })); m.position.y = .17; m.rotation.z = .41; m.castShadow = true; globe.add(m); return m;
  })();
  const curio = vivant(groupe(biblio, -.48, 1.48, 0));
  boite(.2, .13, .14, M('#5a3c26', { roughness: .6 }), curio, 0, .065, 0);
  const couvercle = vivant(groupe(curio, 0, .13, -.07));
  boite(.21, .02, .15, M('#4a301e', { roughness: .6 }), couvercle, 0, .01, .07);
  bille(.014, M('#d8b04a', { metalness: .6, roughness: .3 }), curio, 0, .07, .075, 0);
  const lueurCurio = new THREE.PointLight('#ffd9a0', 0, .8, 1.6); lueurCurio.position.set(0, .14, 0); curio.add(lueurCurio);

  /* la plante, dans le coin (il faut bien) */
  const plante = vivant(groupe(piece, 3.0, 0, -2.2));
  cyl(.2, .15, .38, 7, M('#b5603c'), plante, 0, .19, 0);
  const feuilles = vivant(groupe(plante, 0, .38, 0));
  for (let i = 0; i < 8; i++) { const f = cyl(0, .085, .8, 4, M('#4f7a46'), feuilles, Math.cos(i) * .07, .32, Math.sin(i) * .07); f.rotation.set(Math.sin(i * 2) * .5, i, Math.cos(i * 2) * .5); }

  /* la lampe à arc, derrière lui à sa gauche */
  const lampe = groupe(piece, 1.08, 0, -.88);
  const fer = M('#2a2a2e', { metalness: .4, roughness: .5 });
  cyl(.19, .21, .045, 12, fer, lampe, 0, .022, 0);
  const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.85, .05), new THREE.Vector3(-.68, 2.32, .46)), 24, .018, 6), fer);
  arc.castShadow = true; lampe.add(arc);
  const abat = cyl(.08, .21, .2, 12, M('#2b2a2e', { side: THREE.DoubleSide }), lampe, -.68, 2.28, .46);
  const matAmpoule = new THREE.MeshBasicMaterial({ color: '#ffe2a6' });
  const ampoule = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), matAmpoule); ampoule.position.set(-.68, 2.2, .46); lampe.add(ampoule);
  liseuse.position.set(1.08 - .68, 2.2, -.88 + .46);

  /* la petite table, à sa droite : la carafe, son verre, des CD */
  const table = groupe(piece, -.92, 0, .12);
  const tableBois = M('#3f2716', { roughness: .55 });
  cyl(.24, .24, .035, 14, tableBois, table, 0, .53, 0); cyl(.025, .03, .5, 7, tableBois, table, 0, .27, 0); cyl(.16, .17, .03, 12, tableBois, table, 0, .015, 0);
  const cristal = new THREE.MeshStandardMaterial({ color: '#e9f1f3', transparent: true, opacity: .42, roughness: .06, metalness: .1 });
  const ambre = M('#b8862e', { roughness: .25 });
  cyl(.06, .07, .17, 8, cristal, table, -.08, .63, -.06); cyl(.055, .065, .08, 8, ambre, table, -.08, .59, -.06); cyl(.022, .022, .07, 6, cristal, table, -.08, .74, -.06);
  [0, 1, 2].forEach(i => { const cd = boite(.13, .012, .13, M(COULEURS[i * 4 + 1]), table, .08, .555 + i * .013, .05); cd.rotation.y = i * .3; });
  function verreWhisky(parent) {
    const v = groupe(parent);
    cyl(.031, .027, .085, 9, cristal, v, 0, .042, 0); cyl(.028, .025, .035, 9, ambre, v, 0, .02, 0);
    boite(.024, .024, .024, M('#eef6f8', { transparent: true, opacity: .6, roughness: .1 }), v, .004, .04, 0).rotation.set(.4, .3, 0);
    return vivant(v);
  }
  const verreTable = verreWhisky(table); verreTable.position.set(.07, .548, -.09);

  /* ═══════════════ la chaîne : lecteur CD, ampli à vu-mètres, cassette, deux colonnes ═══════════════ */
  const chaine = groupe(piece, -1.85, 0, FOND + .27);
  const noyerC = M('#5b3a22', { roughness: .6 });
  boite(1.3, .05, .46, noyerC, chaine, 0, .5, 0); boite(1.3, .05, .46, noyerC, chaine, 0, .07, 0);
  boite(.05, .43, .46, noyerC, chaine, -.625, .285, 0); boite(.05, .43, .46, noyerC, chaine, .625, .285, 0); boite(.04, .43, .44, noyerC, chaine, 0, .285, 0);
  boite(1.25, .43, .02, noyerF, chaine, 0, .285, -.22);
  [[-.6, -.2], [.6, -.2], [-.6, .2], [.6, .2]].forEach(([x, z]) => cyl(.02, .02, .045, 6, noyerF, chaine, x, .022, z));
  // dans les niches : des CD à gauche, des vinyles à droite
  for (let k = 0; k < 22; k++) boite(.012, .14, .125, M(COULEURS[(k * 5) % 12]), chaine, -.585 + k * .025, .167, .06);
  for (let k = 0; k < 9; k++) { const v = boite(.02, .32, .32, M(COULEURS[(k * 7 + 3) % 12]), chaine, .08 + k * .055, .255, .02); v.rotation.z = -.08 + (k % 3) * .04; }
  const alu = M('#c3c5c8', { metalness: .6, roughness: .32 }), aluF = M('#8e9095', { metalness: .55, roughness: .4 }), noirHifi = M('#17161a', { roughness: .45 });
  // la platine cassette
  const k7 = groupe(chaine, 0, .525, -.02);
  boite(.7, .115, .38, alu, k7, 0, .0575, 0);
  [-1, 1].forEach(s => { boite(.2, .07, .01, noirHifi, k7, s * .17, .064, .191); boite(.13, .024, .012, M('#3a3f48', { roughness: .2 }), k7, s * .17, .068, .194); });
  // l'ampli et ses deux vu-mètres
  const ampli = groupe(chaine, 0, .64, -.02);
  boite(.7, .17, .4, alu, ampli, 0, .085, 0);
  const matVu = new THREE.MeshBasicMaterial({ color: '#ffcf7a', toneMapped: false });
  const aiguilles = [-1, 1].map(s => {
    boite(.17, .1, .01, noirHifi, ampli, s * .16, .1, .201);
    const fond = new THREE.Mesh(new THREE.PlaneGeometry(.15, .08), matVu); fond.position.set(s * .16, .1, .207); ampli.add(fond);
    const pivot = vivant(groupe(ampli, s * .16, .066, .209));
    const a = new THREE.Mesh(new THREE.BoxGeometry(.003, .066, .002), M('#1a1a1a')); a.position.y = .033; pivot.add(a);
    return pivot;
  });
  const molette = cyl(.04, .04, .024, 14, aluF, ampli, 0, .055, .21); molette.rotation.x = Math.PI / 2;
  const led = new THREE.Mesh(new THREE.SphereGeometry(.006, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff5a3a', toneMapped: false })); led.position.set(-.31, .03, .202); ampli.add(vivant(led));
  // le lecteur CD, avec l'écran qui fait défiler le morceau
  const lecteurCD = groupe(chaine, 0, .81, -.02);
  boite(.7, .095, .38, alu, lecteurCD, 0, .0475, 0);
  boite(.34, .012, .01, noirHifi, lecteurCD, -.12, .064, .191);
  const lcd = toileTexte(512, 72);
  const ecran = new THREE.Mesh(new THREE.PlaneGeometry(.24, .034), new THREE.MeshBasicMaterial({ map: lcd.t, toneMapped: false }));
  ecran.position.set(.18, .046, .192); lecteurCD.add(ecran);
  boite(.25, .044, .006, noirHifi, lecteurCD, .18, .046, .189);
  for (let k = 0; k < 4; k++) boite(.026, .011, .008, aluF, lecteurCD, -.25 + k * .04, .027, .192);
  // à droite sur le meuble : un cadre photo (Les Anges déchus) ; à gauche : la figurine du loup de Cul7ure
  const photo = cadreImage('fallen-angels', .24, .134, chaine, .5, .63, .02, -.15, 'Les Anges déchus, Wong Kar-wai'); photo.rotation.x = -.18;
  boite(.02, .1, .06, M('#1b1712'), photo, 0, -.05, -.04).rotation.x = .5;
  const loup = vivant(groupe(chaine, -.5, .525, .04, .35));
  {
    const gris = M('#5f6b6a', { roughness: .7 }), grisC = M('#9aa6a3', { roughness: .7 }), rouge = M('#b4485a', { roughness: .6 }), blancL = M('#ecebe4'), noirL = M('#16201e'), vert = M('#27e08a', { roughness: .4 });
    cyl(.07, .075, .02, 16, noirL, loup, 0, .01, 0);                                   // le socle
    [-1, 1].forEach(s => { const j = cyl(.022, .02, .07, 8, M('#2c3436'), loup, s * .03, .055, 0); });
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

  // les deux colonnes, tournées vers le fauteuil
  const haut_parleurs = [];
  function colonne(x, z, ry) {
    const e = groupe(piece, x, 0, z, ry);
    boite(.36, 1.12, .42, noyerC, e, 0, .62, 0);
    boite(.32, 1.07, .015, noirHifi, e, 0, .62, .214);
    boite(.42, .05, .48, noirHifi, e, 0, .025, 0);
    boite(.37, .015, .43, noyerF, e, 0, 1.185, 0);
    const caoutchouc = M('#111013', { roughness: .9 }), papier = M('#2c2b30', { roughness: .7 }), cache = M('#3a3940', { roughness: .4 });
    [[1.07, .028, 'aigu'], [.9, .068, 'medium'], [.6, .118, 'grave'], [.3, .118, 'grave']].forEach(([y, r, type]) => {
      const hp = vivant(groupe(e, 0, y, .222));
      const bord = new THREE.Mesh(new THREE.TorusGeometry(r, r * .13, 6, 20), caoutchouc); hp.add(bord);
      if (type === 'aigu') { const dome = new THREE.Mesh(new THREE.SphereGeometry(r * .85, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#cfd1d4', { metalness: .5, roughness: .3 })); dome.rotation.x = Math.PI / 2; hp.add(dome); }
      else {
        const membrane = new THREE.Mesh(new THREE.CylinderGeometry(r * .95, r * .32, r * .38, 18, 1, true), M('#2c2b30', { roughness: .7, side: THREE.DoubleSide })); membrane.rotation.x = Math.PI / 2; membrane.position.z = -r * .19; hp.add(membrane);
        const capuchon = new THREE.Mesh(new THREE.SphereGeometry(r * .3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), cache); capuchon.rotation.x = Math.PI / 2; capuchon.position.z = -r * .3; hp.add(capuchon);
      }
      hp.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });
      haut_parleurs.push({ hp, type, base: .222, push: 0 });
    });
    const event = new THREE.Mesh(new THREE.TorusGeometry(.035, .01, 6, 14), M('#0b0a0c')); event.position.set(0, .13, .222); e.add(event);
    const fondEvent = new THREE.Mesh(new THREE.CircleGeometry(.035, 14), M('#050405')); fondEvent.position.set(0, .13, .218); e.add(fondEvent);
    return e;
  }
  colonne(-2.92, FOND + .36, .35);
  colonne(-.78, FOND + .36, .25);

  /* ═══════════════ Talya, qui dort dans son panier (la même que dans la vitrine) ═══════════════ */
  const panier = groupe(piece, 2.42, 0, -1.3, -2.4); panier.scale.setScalar(.9);
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
  const bol = poser(new THREE.Mesh(new THREE.CylinderGeometry(.15, .11, .08, 14, 1, true), M('#c8572f', { side: THREE.DoubleSide, metalness: .2 })), gamelle, 0, .04, 0);
  cyl(.11, .11, .01, 14, M('#9c4225'), gamelle, 0, .005, 0);
  bille(.07, M('#cfe05a'), panier, -.75, .07, .55);

  /* le chat, roulé en boule sur le rebord de la fenêtre */
  const chat = vivant(groupe(piece, FX + .38, REBORD + .03, FOND + .15, .2));
  const fourrure = M('#2b2522', { roughness: 1 });
  const corpsChat = bille(.13, fourrure, chat, 0, .065, 0); corpsChat.scale.set(1.35, .6, .9);
  bille(.068, fourrure, chat, -.15, .065, .04);
  [-1, 1].forEach(s => { const o = cyl(0, .024, .05, 4, fourrure, chat, -.165, .12, .04 + s * .035); o.rotation.x = s * .2; });
  const queueChat = poser(new THREE.Mesh(new THREE.TorusGeometry(.11, .018, 5, 12, Math.PI * 1.1), fourrure), chat, .04, .02, .02); queueChat.rotation.x = Math.PI / 2;

  /* ═══════════════ le fauteuil club et le pouf ═══════════════ */
  const fauteuil = groupe(scene, .05, 0, -.25, -.42);
  const cuir = M('#8e4a22', { roughness: .48, metalness: .04 }), cuirF = M('#6b3418', { roughness: .55 }), pied = M('#2e1c10');
  boite(1.0, .3, .78, cuirF, fauteuil, 0, .21, -.03);                 // la jupe : y .06–.36, z -.42–.36
  boite(.62, .13, .6, cuir, fauteuil, 0, .425, 0);                     // l'assise : y .36–.49, z -.30–.30
  const nez = cyl(.062, .062, .62, 10, cuir, fauteuil, 0, .43, .28); nez.rotation.z = Math.PI / 2;
  const dossier = groupe(fauteuil, 0, .36, -.36); dossier.rotation.x = -.14;
  boite(1.0, .66, .16, cuir, dossier, 0, .33, 0);
  const rouleau = cyl(.1, .1, 1.0, 12, cuir, dossier, 0, .66, -.01); rouleau.rotation.z = Math.PI / 2;
  [[-.2, .25], [0, .25], [.2, .25], [-.1, .45], [.1, .45]].forEach(([x, y]) => bille(.014, cuirF, dossier, x, y, .081, 0));
  [-1, 1].forEach(s => {
    boite(.19, .34, .78, cuir, fauteuil, s * .405, .52, -.03);         // accoudoirs : x ±(.31–.50), z -.42–.36
    const r = cyl(.098, .098, .8, 12, cuir, fauteuil, s * .41, .69, -.03); r.rotation.x = Math.PI / 2;
    const volute = cyl(.102, .102, .03, 12, cuirF, fauteuil, s * .41, .69, .375); volute.rotation.x = Math.PI / 2;
    boite(.2, .3, .03, cuirF, fauteuil, s * .405, .5, .37);
    [-.36, .3].forEach(z => cyl(.03, .024, .06, 6, pied, fauteuil, s * .44, .03, z));
  });
  const POUF_Z = .86, POUF_H = .47;
  const pouf = groupe(fauteuil, 0, 0, POUF_Z);
  cyl(.3, .28, .39, 12, cuir, pouf, 0, .225, 0); cyl(.31, .31, .06, 12, cuirF, pouf, 0, .44, 0);
  [-1, 1].forEach(s => [-1, 1].forEach(t => cyl(.025, .02, .05, 6, pied, pouf, s * .18, .025, t * .18)));

  /* ═══════════════ Amélien ═══════════════ */
  const peau = M('#8c5737', { roughness: .62 }), peauF = M('#734428', { roughness: .7 });
  // le pull vert en maille fine (façon pull de tennis), et un pantalon bleu nuit un peu large
  const maille = toileTexte(64, 64);
  {
    const x = maille.x;
    x.fillStyle = '#1f6b47'; x.fillRect(0, 0, 64, 64);
    for (let c = 0; c < 8; c++) {                       // des côtes verticales, et de petits « v » de tricot
      x.fillStyle = c % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; x.fillRect(c * 8, 0, 8, 64);
      x.strokeStyle = 'rgba(0,0,0,.13)'; x.lineWidth = 1;
      for (let r = 0; r < 8; r++) { x.beginPath(); x.moveTo(c * 8 + 1, r * 8 + 1); x.lineTo(c * 8 + 4, r * 8 + 6); x.lineTo(c * 8 + 7, r * 8 + 1); x.stroke(); }
    }
    maille.t.wrapS = maille.t.wrapT = THREE.RepeatWrapping; maille.t.repeat.set(5, 4);
  }
  const pull = new THREE.MeshStandardMaterial({ color: '#ffffff', map: maille.t, roughness: .95 });
  const cotes = new THREE.MeshStandardMaterial({ color: '#185a3b', roughness: .95 });
  const pant = new THREE.MeshStandardMaterial({ color: '#141c2e', roughness: .9 });
  const poils = M('#160d09', { roughness: 1 }), cheveux = M('#0d0705', { roughness: 1 }), monture = M('#0d0b0b', { roughness: .3, metalness: .3 });
  const cuirChaussure = M('#3d2417', { roughness: .4 }), semelle = M('#17110d', { roughness: .8 }), sombre = M('#1a0f0a');
  const perso = groupe(fauteuil);

  // le bassin et le buste (le buste pivote au niveau des hanches)
  const bassin = poser(new THREE.Mesh(new THREE.CylinderGeometry(.17, .16, .17, 18), pant), perso, 0, .575, -.11); bassin.scale.z = .8;
  const buste = groupe(perso, 0, .585, -.13);
  // le pull : un peu ample, côtes en bas, au col rond et aux poignets
  const torseGeo = new THREE.CylinderGeometry(.205, .19, .47, 20, 3); torseGeo.translate(0, .245, 0);
  poser(new THREE.Mesh(torseGeo, pull), buste).scale.z = .66;
  poser(new THREE.Mesh(new THREE.CylinderGeometry(.193, .196, .055, 20), cotes), buste, 0, .035, 0).scale.z = .68;
  const epaulettes = [-1, 1].map(s => { const b = poser(new THREE.Mesh(new THREE.SphereGeometry(.08, 14, 10), pull), buste, s * .185, .43, -.005); b.scale.set(1.02, .8, .92); return b; });
  poser(new THREE.Mesh(new THREE.TorusGeometry(.06, .014, 8, 20), cotes), buste, 0, .49, .008).rotation.x = Math.PI / 2;
  poser(new THREE.Mesh(new THREE.CylinderGeometry(.051, .056, .1, 12), peauF), buste, 0, .525, .012);

  // la tête : visage taillé (mâchoire plus étroite), afro, lunettes rondes, fine moustache
  const tete = groupe(buste, 0, .64, .03);
  const crane = new THREE.IcosahedronGeometry(.104, 2);
  {
    const pa = crane.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      let x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
      const bas = Math.max(0, -y / .104);
      x *= 1 - bas * .32; z *= 1 - bas * .12;
      if (z > 0 && y < -.02) z += .006 * bas;
      pa.setXYZ(i, x * .94, y * 1.17, z);
    }
    crane.computeVertexNormals();
  }
  poser(new THREE.Mesh(crane, peau), tete);
  const nezP = poser(new THREE.Mesh(new THREE.ConeGeometry(.017, .044, 4), peauF), tete, 0, -.006, .108); nezP.rotation.x = Math.PI / 2 + .3;
  [-1, 1].forEach(s => { const o = bille(.024, peauF, tete, s * .098, -.002, -.008, 0); o.scale.set(.45, 1, .75); });
  const boucleOreille = new THREE.Mesh(new THREE.TorusGeometry(.009, .0025, 4, 10), M('#e3c06a', { metalness: .85, roughness: .25 })); boucleOreille.position.set(.1, -.03, -.005); boucleOreille.rotation.y = Math.PI / 2; tete.add(boucleOreille);
  const yeux = [-1, 1].map(s => { const o = bille(.0105, sombre, tete, s * .036, .024, .093, 1); o.scale.z = .5; return o; });
  const sourcils = [-1, 1].map(s => boite(.036, .0075, .01, poils, tete, s * .037, .057, .1));
  // l'afro : rond, un peu bosselé, plus raisonnable
  const afroGeo = new THREE.IcosahedronGeometry(.16, 3);
  {
    const pa = afroGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
      const n = 1 + Math.sin(x * 181.7 + y * 97.3 + z * 63.9) * .035 + Math.sin(x * 73.1 - z * 117.7 + y * 31.3) * .03 + Math.sin(y * 41.3 + z * 29.1) * .02;
      pa.setXYZ(i, x * n, y * n, z * n);
    }
    afroGeo.computeVertexNormals();
  }
  const afro = poser(new THREE.Mesh(afroGeo, cheveux), tete, 0, .1, -.078); afro.scale.set(1.08, .97, 1.02);
  // les lunettes rondes, noires
  [-1, 1].forEach(s => {
    const cercle = new THREE.Mesh(new THREE.TorusGeometry(.03, .005, 5, 16), monture); cercle.position.set(s * .037, .024, .108); tete.add(cercle);
    const branche = boite(.004, .004, .11, monture, tete, s * .074, .03, .055); branche.rotation.y = s * -.08;
  });
  boite(.016, .005, .005, monture, tete, 0, .031, .112);
  // la moustache (fine, en chevron) et la barbichette
  [-1, 1].forEach(s => { const m = boite(.032, .0095, .012, poils, tete, s * .0145, -.031, .101); m.rotation.z = -s * .2; });
  boite(.022, .03, .016, poils, tete, 0, -.084, .081);
  const bouche = [-1, 1].map(s => boite(.02, .005, .006, M('#3b1a12'), tete, s * .0098, -.051, .094));

  // les bras : épaule → coude → main (positionnés par cinématique inverse)
  const L_BRAS = .285, L_AVANT = .265;
  const bras = [-1, 1].map(s => {
    const epaule = groupe(buste, s * .195, .43, -.005);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.059, L_BRAS, 4, 12), pull), epaule, 0, -L_BRAS / 2, 0);
    const coude = groupe(epaule, 0, -L_BRAS, 0);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.053, L_AVANT - .04, 4, 12), pull), coude, 0, -(L_AVANT - .04) / 2, 0);
    poser(new THREE.Mesh(new THREE.CylinderGeometry(.047, .05, .045, 12), cotes), coude, 0, -L_AVANT + .03, 0);
    const main = groupe(coude, 0, -L_AVANT, 0);
    boite(.068, .062, .03, peau, main, 0, -.031, 0);
    const doigts = boite(.062, .05, .026, peau, main, 0, -.078, .006); doigts.rotation.x = .28;
    const pouce = gelule(.012, .028, peau, main, -s * .036, -.03, .016); pouce.rotation.set(.5, 0, -s * .5);
    return { s, epaule, coude, main };
  });
  const verreMain = verreWhisky(bras[0].main); verreMain.position.set(0, -.07, .045);

  // le livre (quand c'est très doux), tenu à deux mains
  const livre = vivant(groupe(buste, 0, .27, .29)); livre.rotation.x = -2.17;
  const couv = M('#d9a23a', { roughness: .6 }), pages = M('#f4eedd', { flatShading: false });
  [-1, 1].forEach(s => { const d = groupe(livre); d.rotation.y = -s * .22; boite(.17, .24, .012, couv, d, s * .085, 0, 0); boite(.16, .23, .016, pages, d, s * .082, 0, .012); });

  // les jambes : hanche → genou → cheville
  const L_CUISSE = .46, L_TIBIA = .45;
  const jambes = [-1, 1].map(s => {
    const hanche = groupe(perso, s * .095, .565, -.1);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.08, L_CUISSE, 4, 12), pant), hanche, 0, -L_CUISSE / 2, 0);
    const genou = groupe(hanche, 0, -L_CUISSE, 0);
    poser(new THREE.Mesh(new THREE.CapsuleGeometry(.07, L_TIBIA - .05, 4, 12), pant), genou, 0, -L_TIBIA / 2 + .02, 0);
    poser(new THREE.Mesh(new THREE.CylinderGeometry(.071, .075, .06, 12), pant), genou, 0, -L_TIBIA + .045, 0);   // le bas du pantalon, un peu large
    const cheville = groupe(genou, 0, -L_TIBIA, 0);
    const p = groupe(cheville);
    cyl(.044, .046, .05, 7, M('#14161c'), p, 0, -.01, 0);
    boite(.098, .024, .27, semelle, p, 0, -.073, .052);
    boite(.09, .068, .2, cuirChaussure, p, 0, -.03, .03);
    bille(.047, cuirChaussure, p, 0, -.04, .135, 1).scale.set(.98, .72, 1.12);
    return { s, hanche, genou, pied: p };
  });

  /* l'ordinateur portable : posé sur le tapis à sa gauche, sur ses genoux quand il s'en sert ; l'écran affiche son blog */
  const ordi = vivant(groupe(fauteuil, .62, .012, .55, .5));
  const aluOrdi = M('#c9cbcf', { metalness: .55, roughness: .3, flatShading: false });
  boite(.31, .014, .215, aluOrdi, ordi, 0, .007, 0);
  boite(.27, .002, .1, M('#2a2b2f'), ordi, 0, .015, -.02);
  const capot = groupe(ordi, 0, .014, -.1075);
  boite(.31, .205, .008, aluOrdi, capot, 0, .1025, -.004);
  const page = toileTexte(256, 168);
  {
    const x = page.x;
    x.fillStyle = '#f4efe4'; x.fillRect(0, 0, 256, 168); x.fillStyle = '#1b1a17'; x.fillRect(0, 0, 256, 18);
    x.fillStyle = '#f4efe4'; x.font = '600 10px Georgia, serif'; x.fillText('onsenbranle.fr', 8, 13);
    x.fillStyle = '#1b1a17'; x.font = '700 21px Georgia, serif'; x.fillText('En vrai,', 12, 50); x.fillText('on s’en branle', 12, 74);
    x.fillStyle = '#c8572f'; x.fillRect(12, 84, 34, 3); x.fillStyle = '#b8b0a0'; for (let i = 0; i < 5; i++) x.fillRect(12, 96 + i * 13, i % 3 === 2 ? 130 : 220, 5);
  }
  const ecranOrdi = new THREE.Mesh(new THREE.PlaneGeometry(.28, .18), new THREE.MeshBasicMaterial({ map: page.t, toneMapped: false })); ecranOrdi.position.set(0, .104, .001); capot.add(ecranOrdi);
  const autocollant = toileTexte(64, 64);
  { const x = autocollant.x; x.fillStyle = '#d06a32'; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.fillStyle = '#1d1a16'; x.font = '800 20px Helvetica, Arial, sans-serif'; x.textAlign = 'center'; x.fillText('OSB', 32, 39); }
  const sticker = new THREE.Mesh(new THREE.CircleGeometry(.03, 16), new THREE.MeshStandardMaterial({ map: autocollant.t, roughness: .7 })); sticker.position.set(.06, .12, -.0085); sticker.rotation.y = Math.PI; capot.add(sticker);
  const lueurOrdi = new THREE.PointLight('#cfe0ff', 0, 1.2, 1.5); lueurOrdi.position.set(0, .12, .12); capot.add(lueurOrdi);
  ordi.traverse(m => { if (m.isMesh) m.castShadow = true; });
  const posRepos = new THREE.Vector3(.62, .012, .55), quatRepos = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, .5, 0)), posMilieu = new THREE.Vector3(.62, 1.25, .5);
  const posGenoux = new THREE.Vector3(0, .68, .17), quatGenoux = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
  // le téléphone, dans la main droite
  const tel = vivant(groupe(bras[0].main, 0, -.075, .03));
  boite(.072, .145, .009, M('#16161a', { roughness: .3 }), tel, 0, 0, 0);
  const ecranTel = new THREE.Mesh(new THREE.PlaneGeometry(.064, .132), new THREE.MeshBasicMaterial({ color: '#9fc4ff', toneMapped: false })); ecranTel.position.z = .005; tel.add(ecranTel);
  tel.rotation.x = -1.2; tel.visible = false;

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
  const posHp = new THREE.Vector3();
  function emettre(fort) {
    haut_parleurs.forEach(h => { if (h.type === 'grave') h.push = 1; else if (h.type === 'medium') h.push = Math.max(h.push, .6); });
    const sources = haut_parleurs.filter(h => h.type !== 'aigu');
    for (let k = 0; k < (fort ? 2 : 1); k++) {
      const n = notes.find(x => x.vie <= 0); if (!n) return;
      sources[Math.floor(Math.random() * sources.length)].hp.getWorldPosition(posHp);
      n.m.position.copy(posHp);
      const a = Math.random() * 1.2 - .6;
      n.v.set(Math.sin(a) * 1.3 + .5, .35 + Math.random() * .7, Math.cos(a) * 1.25);
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
  fusionner(piece);
  vitre.castShadow = false; ecran.castShadow = false; affiche.castShadow = false;

  /* ═══════════════ le ciel de l'heure qu'il est (et la pluie, sans musique) ═══════════════ */
  const CIEL = [[0, '#070b1d', '#17203f'], [5, '#0a0f26', '#1f2a4f'], [6.3, '#3c4a86', '#f2a487'], [7.5, '#86b6e3', '#f6d8b8'], [10, '#5ea6e6', '#cfe5f6'], [15, '#6aaee8', '#d9ebf6'], [18, '#6b8fcb', '#f4c89a'], [19.4, '#3e3f80', '#f08355'], [20.6, '#1b2150', '#6c4677'], [22, '#0a0f27', '#1c2448'], [24, '#070b1d', '#17203f']];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mel = (a, b, f) => '#' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * f).toString(16).padStart(2, '0')).join('');
  const couleursCiel = h => { for (let i = 0; i < CIEL.length - 1; i++) { const [h1, a1, b1] = CIEL[i], [h2, a2, b2] = CIEL[i + 1]; if (h >= h1 && h <= h2) { const f = (h - h1) / (h2 - h1); return [mel(a1, a2, f), mel(b1, b2, f)]; } } return [CIEL[0][1], CIEL[0][2]]; };
  const jourDe = h => Math.max(0, Math.min(1, Math.sin((h - 6.2) / 13.6 * Math.PI) * 1.6));
  let jour = .5;
  function dessinerCiel(t, gris) {
    const d = new Date(), h = (d.getHours() + d.getMinutes() / 60 + (decalageHeure || 0)) % 24;
    jour = jourDe(h);
    let [haut, bas] = couleursCiel(h);
    haut = mel(haut, jour > .35 ? '#56606f' : '#141925', gris * .8); bas = mel(bas, jour > .35 ? '#8c939e' : '#262c3a', gris * .8);
    const x = ciel.x, W = 256, H = 236;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, haut); g.addColorStop(1, bas);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = `rgba(255,255,255,${(1 - jour) * (1 - gris) * .9})`;
    for (let k = 0; k < 30; k++) x.fillRect((k * 97) % W, (k * 53) % 120, 2, 2);
    const levant = h >= 6.3 && h <= 20.4, f = levant ? (h - 6.3) / 14.1 : ((h + 24 - 20.4) % 24) / 9.9;
    x.globalAlpha = 1 - gris * .85;
    x.fillStyle = levant ? (jour > .5 ? '#fff4d0' : '#ffb36b') : '#f3efe2';
    x.beginPath(); x.arc(22 + f * 212, 160 - Math.sin(f * Math.PI) * 120, 16, 0, 7); x.fill();
    x.globalAlpha = 1;
    if (gris > .02) {  // de gros nuages gris qui passent
      x.fillStyle = `rgba(${jour > .35 ? '120,128,140' : '40,46,60'},${gris * .85})`;
      for (let k = 0; k < 5; k++) { const cx = ((k * 71 + t * 6) % 330) - 40, cy = 26 + (k * 37) % 70; x.beginPath(); x.ellipse(cx, cy, 52, 18, 0, 0, 7); x.ellipse(cx + 30, cy - 9, 34, 16, 0, 0, 7); x.fill(); }
    }
    x.fillStyle = mel(mel('#151a33', '#7d8aa3', jour), '#2e3442', gris * .5);
    [[0, 70], [40, 50], [70, 96], [120, 44], [150, 80], [196, 60], [226, 88]].forEach(([bx, bh]) => x.fillRect(bx, H - bh, 34, bh));
    x.fillStyle = `rgba(255,210,122,${(1 - jour) * .95})`;
    for (let k = 0; k < 40; k++) x.fillRect((k * 37) % 250 + 3, H - ((k * 23) % 80) - 8, 4, 5);
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
  function dessinerLcd(pause, t, message) {
    const x = lcd.x;
    x.fillStyle = '#06111c'; x.fillRect(0, 0, 512, 72);
    x.fillStyle = '#8fdcff'; x.font = lcdPolice; x.textBaseline = 'middle';
    if (message) { x.textAlign = 'center'; x.fillText(message, 256, 38); x.textAlign = 'left'; }
    else if (pause) {
      if (Math.floor(t * 1.4) % 2 === 0) { x.textAlign = 'center'; x.fillText('PAUSE', 256, 38); x.textAlign = 'left'; }
    } else {
      const sep = '   ·   ', largeur = x.measureText(lcdTexte + sep).width;
      x.fillText(lcdTexte + sep + lcdTexte, 10 - (lcdDecalage % largeur), 38);
    }
    lcd.t.needsUpdate = true;
  }

  /* ═══════════════ l'état de la musique ═══════════════ */
  const etat = { joue: false, bpm: 96, energie: 5, danse: 5, humeur: 'triste', note: '' };
  const humeurDe = (e, d) => e <= 3 && d <= 4 ? 'doux' : e >= 8 ? 'energie' : d >= 6 ? 'groove' : 'detente';
  let penseeVue = false, bulleW = 0, bulleH = 0;
  function mesurerPensee() { bulleW = pensee.offsetWidth; bulleH = pensee.offsetHeight; }
  function maj(n = {}) {
    Object.assign(etat, n);
    etat.humeur = etat.joue ? humeurDe(Number(etat.energie) || 5, Number(etat.danse) || 5) : 'triste';
    if (n.titre !== undefined) { lcdTexte = (n.titre ? `${n.titre} — ${n.artiste || ''}` : 'MUSIC DISCOVERY').toUpperCase(); lcdDecalage = 0; }
    if (n.pochette) majPoster(n.pochette);
    const texte = (etat.note || '').trim();
    if (penseeTexte.textContent !== texte) { penseeTexte.textContent = texte; mesurerPensee(); }
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
      pied: s => s < 0 ? [.05, .665, .77] : [-.02, .56, .79], polePied: [0, 1, .2], tangage: -1.0, lacet: .15,
      sourcils: .4, bouche: .75,
    }),
    // groovy : la tête et les épaules balancent, le verre dans la main droite, la gauche tapote, le pied bat
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
      main: s => ['F', s * .085, .73 + ondule(Math.max(0, Math.sin(t * 13 + s * 1.9)) * .016), .1], pole: s => [s, -.6, -.2],
      pied: surPouf, polePied: [0, 1, .2], tangage: -1.05, lacet: .18, sourcils: .15, bouche: .2,
    }),
    // une gorgée
    boire: () => ({
      buste: [-.22, 0, 0], tete: [-.2, 0, 0], epaules: 0,
      main: s => s < 0 ? ['tete', -.02, -.13, .14] : ['F', .41, .83, .12], pole: s => s < 0 ? [-1, -.5, .1] : [1, -.6, -.3],
      pied: surPouf, polePied: [0, 1, .2], tangage: -1.05, lacet: .18, sourcils: .2, bouche: 0,
    }),
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
    // il te fait coucou
    salut: (t) => ({
      buste: [-.2, 0, -.04], tete: [0, .38, .06], epaules: 0,
      main: s => s > 0 ? ['buste', .33 + ondule(Math.sin(t * 10) * .07), .8, .14] : ['F', -.41, .83, .1], pole: s => s > 0 ? [1, -.4, -.3] : [-1, -.6, -.3],
      pied: surPouf, polePied: [0, 1, .2], tangage: -1.05, lacet: .18, sourcils: .7, bouche: 1,
    }),
  });
  const HUMEURS = Object.keys(P);
  const poids = Object.fromEntries(HUMEURS.map(h => [h, h === 'triste' ? 1 : 0]));
  let activite = null, finActivite = 0, prochaineActivite = 12;
  const DUREES = { ordi: 13, boire: 3.6, telephone: 9, etirement: 3.4, salut: 2.8 };
  function lancerActivite(nom) { activite = nom; finActivite = horlogeCorps + DUREES[nom]; }
  let horlogeCorps = 0;

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
    const k = calme ? 1 : 1 - Math.exp(-dt * 3.2);
    let total = 0, maxi = 0;
    horlogeCorps = t;
    const visee = activite || etat.humeur;
    HUMEURS.forEach(h => { poids[h] = borne(lisse(poids[h], h === visee ? 1 : 0, k), 0, 1); if (poids[h] < .002) poids[h] = 0; total += poids[h]; maxi = Math.max(maxi, poids[h]); });
    if (window.__piecePoids) { Object.assign(poids, window.__piecePoids); total = 1; maxi = Math.max(...Object.values(poids)); }   // pour les vérifications
    const att = HUMEURS.filter(h => poids[h] > 0).map(h => [poids[h] / total, P[h](t, ph)]);
    const ecart = 1 - maxi / total;
    // le buste, la tête, les épaules
    let bx = 0, by = 0, bz = 0, tx = 0, ty = 0, tz = 0, ep = 0, so = 0, bo = 0, tape = 0, as = 0, ay = 0;
    att.forEach(([w, a]) => { as += w * (a.assise || 0); ay += w * (a.assiseY || 0); bx += w * a.buste[0]; by += w * a.buste[1]; bz += w * a.buste[2]; tx += w * a.tete[0]; ty += w * a.tete[1]; tz += w * a.tete[2]; ep += w * a.epaules; so += w * a.sourcils; bo += w * a.bouche; tape += w * (a.tape || 0); });
    // assis au fond du fauteuil, ou au bord quand ça ne va pas
    bassin.position.set(0, .575 + ay, -.11 + as); buste.position.set(0, .585 + ay, -.13 + as); jambes.forEach(j => { j.hanche.position.set(j.s * .095, .565 + ay, -.1 + as); });
    const souffle = ondule(Math.sin(t * 1.25) * .012);
    buste.rotation.set(bx + souffle, by, bz); tete.rotation.set(tx - souffle * .6, ty, tz);
    buste.updateMatrix(); tete.updateMatrix();
    invBuste.copy(buste.matrix).invert();
    // les bras
    bras.forEach(b => {
      _c.set(0, 0, 0); _pole.set(0, 0, 0);
      att.forEach(([w, a]) => { _c.addScaledVector(versF(a.main(b.s), _p), w); _pole.addScaledVector(_p.set(...a.pole(b.s)), w); });
      _c.addScaledVector(_sort.set(b.s * .12, .6, .55).normalize(), ecart * .4);   // en changeant d'attitude, la main fait le tour
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
      if (j.s > 0 && etat.joue) tg += tape * ondule(Math.max(0, Math.sin(ph))) * .3;   // le pied bat la mesure
      ik(j.hanche, j.genou, L_CUISSE, L_TIBIA, _c, _pole);
      _qf.setFromEuler(_eul.set(tg, lc, 0, 'YXZ'));
      j.pied.quaternion.copy(_qa.copy(j.hanche.quaternion).multiply(j.genou.quaternion).invert().multiply(_qf));
    });
    // le visage : sourcils, bouche, clignements
    sourcils.forEach((s, i) => { const c = i ? 1 : -1; s.rotation.z = c * (so < 0 ? .34 * so : .08 * so); s.position.y = .057 + Math.max(0, -so) * .004; });
    bouche.forEach((m, i) => { const c = i ? 1 : -1; m.rotation.z = c * .38 * bo; });
    if ((clin -= dt) < 0) { clinT = .12; clin = 2.5 + Math.random() * 4; }
    clinT = Math.max(0, clinT - dt);
    yeux.forEach(o => { o.scale.y = clinT > 0 ? .15 : 1; });
    // le livre et le verre
    livre.visible = poids.doux > .15; livre.scale.setScalar(Math.max(.001, borne((poids.doux - .15) * 1.6, 0, 1)));
    verreMain.visible = poids.groove + poids.boire > .5; verreTable.visible = !verreMain.visible;
    tel.visible = poids.telephone > .45;
    // l'ordi : du tapis jusqu'à ses genoux (en passant au-dessus de l'accoudoir), le capot s'ouvre
    const wo = borne(poids.ordi, 0, 1), u = 1 - wo;   // une courbe qui passe devant l'accoudoir, bien au-dessus
    ordi.position.set(0, 0, 0).addScaledVector(posRepos, u * u).addScaledVector(posMilieu, 2 * u * wo).addScaledVector(posGenoux, wo * wo);
    ordi.quaternion.slerpQuaternions(quatRepos, quatGenoux, wo);
    capot.rotation.x = lisse(Math.PI / 2, -.28, borne((wo - .45) * 2.2, 0, 1));
    lueurOrdi.intensity = borne((wo - .5) * 2, 0, 1) * .5;
    if (verreMain.visible) { bras[0].main.updateWorldMatrix(true, false); bras[0].main.getWorldQuaternion(_qa); verreMain.quaternion.copy(_qa.invert().multiply(fauteuil.quaternion)); }
  }

  /* ═══════════════ la caméra : de face, comme dans la vitrine ═══════════════ */
  const CADRES = [
    { a: .5, c: [-.55, 1.0, -.6], w: 3.2, h: 4.4, fov: 56 },
    { a: 1.1, c: [-.55, .95, -.55], w: 4.3, h: 3.0, fov: 44 },
    { a: 2.2, c: [-.48, .96, -.6], w: 6.4, h: 2.9, fov: 34 },
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
    if (parent === plein && a >= 1) { w = Math.max(w, 6.9); h = Math.max(h, 3.2); cadreVise.c.set(-.22, .88, -.62); }   // en grand sur ordinateur : toute la pièce, porte comprise
    // en grand sur téléphone : vue un peu plus plongeante, pour que toute la pièce tienne entre la vidéo et l'afficheur
    if (parent === plein && a < 1) { w = 6.95; h = 3.4; fov = 50; cadreVise.c.set(-.25, .6, -.35); cadreVise.dir.set(.06, .95, 1).normalize(); }
    // « plus près » : on se rapproche de lui
    if (parent === plein && pres) { w = a < 1 ? 1.7 : 2.6; h = 1.75; cadreVise.suit = true; cadreVise.dir.copy(DIR); }
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
    _dir.copy(cadreActuel.dir).applyAxisAngle(HAUT_Y, cx * .11); _dir.y += cy * .035; _dir.normalize();
    camera.position.copy(cadreActuel.c).addScaledVector(_dir, cadreActuel.d);
    camera.lookAt(cadreActuel.c);
  }
  let parent = null;
  function taille() {
    if (!parent) return;
    const w = parent.clientWidth, h = parent.clientHeight;
    if (!w || !h) return;
    rendu.setSize(w, h, false);
    // en grand : la pièce se cadre dans la zone libre, entre la vidéo (sur téléphone) et l'afficheur du bas
    let haut = 0, bas = h;
    if (parent === plein) {
      const r0 = parent.getBoundingClientRect(), autour = parent.parentElement;
      const barre = autour.querySelector('.plein-barre'), video = autour.querySelector('.plein-video'), vue = autour.querySelector('.plein-vue');
      if (w / h < 1) haut = Math.max(video ? video.getBoundingClientRect().bottom : 0, vue ? vue.getBoundingClientRect().bottom : 0) - r0.top + 6;
      if (barre) bas = barre.getBoundingClientRect().top - r0.top + 22;
      haut = borne(haut, 0, h * .4); bas = borne(bas, haut + 120, h);
    }
    camera.aspect = w / (bas - haut);
    cadrer();
    if (haut > 0 || bas < h) camera.setViewOffset(w, bas - haut, 0, -haut, w, h); else camera.clearViewOffset();
    mesurerPensee();
  }

  /* ═══════════════ la pensée : au-dessus de l'afro, les petits ronds descendent vers lui ═══════════════ */
  const _h = new THREE.Vector3();
  function placerPensee() {
    const montrer = penseeVue && poids.triste < .5;
    pensee.classList.toggle('visible', montrer);
    points.forEach(p => p.classList.toggle('visible', montrer));
    if (!montrer && !pensee.style.transform) return;
    const W = toile.clientWidth, H = toile.clientHeight;
    tete.localToWorld(_h.set(0, .25, -.06)); _h.project(camera);
    const hx = (_h.x + 1) / 2 * W, hy = (1 - _h.y) / 2 * H;
    const marge = 10;
    let cxB = hx + Math.min(bulleW * .3, W * .12), basB = hy - Math.max(30, H * .07);
    cxB = borne(cxB, bulleW / 2 + marge, W - bulleW / 2 - marge);
    basB = Math.max(basB, bulleH + marge);
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
  const cible = (obj, nom, action) => CIBLES.push({ obj, nom, action });
  const reactions = {};                                        // nom → instant où ça a commencé
  const reagir = nom => { reactions[nom] = horloge; };
  const depuis = nom => reactions[nom] === undefined ? 99 : horloge - reactions[nom];
  let lampeEteinte = false, decalageHeure = 0, finDecalage = 0, vuForce = 0, lcdMessage = '', finLcdMessage = 0;
  const ALLER = { bureau: 'https://amelienito.github.io/', talya: 'https://amelienito.github.io/Hb/', blog: 'https://www.onsenbranle.fr', cite: 'https://amelienito.github.io/cite-trois-chinois/', faits: 'https://amelienito.github.io/fun-facts/' };
  const hasard = l => l[Math.floor(Math.random() * l.length)];

  // lui
  cible(zone(.5, .8, .4, buste, 0, .4, 0), 'Amélien', () => {
    if (!etat.joue) { reagir('eclair'); return { texte: hasard(['Pas maintenant…', 'Remets du son…', 'Laisse-moi…']) }; }
    lancerActivite('salut');
    return { texte: hasard(['Monte le son', 'Toujours le hip hop, ça dégage']) };
  });
  cible(nuage, 'Le petit nuage', () => { reagir('eclair'); return { texte: 'Il pleut dans sa tête.' }; });
  // les passerelles
  cible(porte, 'La porte du bureau', () => { reagir('porte'); return { texte: 'Le bureau, à côté : toutes les créations d’Amélien', lien: ALLER.bureau, quoi: 'Entrer' }; });
  cible(zone(1.1, .55, 1.0, panier, 0, .27, 0), 'Talya', () => { reagir('talya'); return { texte: 'Talya a son jeu à elle : RP Talya', lien: ALLER.talya, quoi: 'Y aller' }; });
  cible(ordi, 'L’ordi', () => { if (etat.joue && !activite) lancerActivite('ordi'); return { texte: 'Sur l’écran : Onsenbranle.fr, son blog', lien: ALLER.blog, quoi: 'Lire' }; });
  cible(globe, 'Le globe', () => { reagir('globe'); return { texte: 'Cite 3 Chinois : trois célébrités par pays', lien: ALLER.cite, quoi: 'Jouer' }; });
  cible(curio, 'La boîte à curiosités', () => { reagir('curio'); return { texte: 'Fun facts : pour apprendre en s’amusant', lien: ALLER.faits, quoi: 'Ouvrir' }; });
  // les objets futiles
  cible(chat, 'Le chat', () => { reagir('chat'); return { texte: hasard(['Mrrr…', 'Miaou.', '(il se rendort)']) }; });
  const zoneLampe = zone(.2, 2.2, .2, lampe, 0, 1.1, 0); zone(.44, .3, .44, zoneLampe, -.68, 1.17, .46);
  cible(zoneLampe, 'La lampe', () => { lampeEteinte = !lampeEteinte; return { texte: lampeEteinte ? 'Clic. Ambiance.' : 'Clic. Lumière !' }; });
  cible(vitre, 'La fenêtre', () => {
    decalageHeure = (decalageHeure + 6) % 24; finDecalage = horloge + 25; cielT = 99;
    const h = Math.floor((new Date().getHours() + decalageHeure) % 24);
    return { texte: decalageHeure ? `Et s’il était ${h} h ? (pour de faux)` : 'Retour à l’heure qu’il est.' };
  });
  haut_parleurs.forEach(h => { if (h.type === 'grave') cible(h.hp.parent, 'L’enceinte', () => { for (let k = 0; k < 5; k++) emettre(true); return { texte: 'Ça c’est du grave' }; }); });
  cible(zone(.74, .4, .42, chaine, 0, .73, 0), 'La chaîne', () => { vuForce = 1.2; lcdMessage = hasard(['MERCI', 'TROP FORT', 'BASS BOOST']); finLcdMessage = horloge + 2.2; return { texte: 'Les aiguilles s’affolent.' }; });
  cible(plante, 'La plante', () => { reagir('plante'); return { texte: hasard(['Elle a soif.', 'Elle danse aussi.']) }; });
  cible(zone(1.3, 1.47, .34, biblio, 0, .735, 0), 'La bibliothèque', () => { const l = hasard(livresMobiles); if (l) { l.userData.sortie = horloge; } return { texte: 'Un livre au hasard…' }; });
  cible(zone(.5, .2, .5, table, 0, .62, 0), 'La carafe', () => { if (etat.joue && !activite) lancerActivite('boire'); return { texte: 'Santé.' }; });
  cible(pouf, 'Le pouf', () => { reagir('pouf'); return { texte: 'Pouf' }; });
  cible(loup, 'Le loup de Cul7ure', () => { reagir('loup'); return { texte: 'Awouuu. (le loup de Cul7ure)' }; });
  cible(poster, 'Le poster', () => { poster.userData.penche = !poster.userData.penche; return { texte: etat.titre ? `${etat.titre} — ${etat.artiste || ''}` : 'La pochette du dernier morceau' }; });
  CADRES_IMG.forEach(c => cible(c.g, c.legende, () => { c.g.userData.penche = !c.g.userData.penche; return { texte: c.legende }; }));

  // l'étiquette qui apparaît là où on a touché, et le nom de l'objet sous la souris
  const etiquette = document.createElement('div'); etiquette.className = 'piece-etiquette';
  const survol = document.createElement('div'); survol.className = 'piece-survol';
  let etiquettePoint = null, finEtiquette = 0;
  function montrerEtiquette(r, point) {
    etiquette.innerHTML = '';
    const p = document.createElement('span'); p.textContent = r.texte; etiquette.appendChild(p);
    if (r.lien) { const a = document.createElement('a'); a.href = r.lien; a.target = '_blank'; a.rel = 'noopener'; a.textContent = `${r.quoi || 'Y aller'} ↗`; etiquette.appendChild(a); }
    etiquettePoint = point.clone(); finEtiquette = horloge + (r.lien ? 7 : 3.2);
    etiquette.classList.add('visible');
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
    const v = viser(ev);
    if (!v) { etiquette.classList.remove('visible'); return; }
    const r = v.c.action();
    if (r) montrerEtiquette(r, v.point);
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
      if (v) { const r = toile.getBoundingClientRect(); survol.textContent = v.c.nom; survol.style.transform = `translate(${Math.round(ev.clientX - r.left + 14)}px, ${Math.round(ev.clientY - r.top + 16)}px)`; }
    });
  });
  toile.addEventListener('pointerleave', () => { survol.classList.remove('visible'); toile.style.cursor = ''; });
  const _ep = new THREE.Vector3();
  function placerEtiquette() {
    if (!etiquettePoint) return;
    if (horloge > finEtiquette) { etiquette.classList.remove('visible'); etiquettePoint = null; return; }
    _ep.copy(etiquettePoint).project(camera);
    const W = toile.clientWidth, H = toile.clientHeight, ew = etiquette.offsetWidth, eh = etiquette.offsetHeight;
    const x = borne((_ep.x + 1) / 2 * W - ew / 2, 8, W - ew - 8), y = borne((1 - _ep.y) / 2 * H - eh - 14, 8, H - eh - 8);
    etiquette.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  // les réactions, image après image
  let eveilTalya = 0;
  function animerReactions(t, dt) {
    // il vit sa vie en mode salon : de temps en temps, l'ordi, une gorgée, le téléphone, un étirement
    if (activite && (t > finActivite || (!etat.joue && activite !== 'salut'))) { activite = null; prochaineActivite = t + 9 + Math.random() * 9; }
    if (!activite && parent === plein && etat.joue && !calme && t > prochaineActivite) lancerActivite(hasard(['ordi', 'boire', 'telephone', 'etirement', 'ordi']));
    // l'heure « pour de faux » à la fenêtre
    if (decalageHeure && t > finDecalage) { decalageHeure = 0; cielT = 99; }
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
    const dl = depuis('loup'); loup.rotation.y = .35 + (dl < .9 ? (dl / .9) * Math.PI * 2 : 0); loup.position.y = .525 + (dl < .9 ? Math.sin(dl / .9 * Math.PI) * .05 : 0);
    const dpl = depuis('plante'); feuilles.rotation.z = dpl < 2 ? Math.sin(dpl * 14) * .12 * (2 - dpl) / 2 : ondule(Math.sin(t * .8) * .01);
    const dpo = depuis('pouf'); pouf.scale.y = 1 - (dpo < .5 ? Math.sin(dpo / .5 * Math.PI) * .12 : 0);
    // les cadres qu'on a mis de travers
    [poster, ...CADRES_IMG.map(c => c.g)].forEach((g, i) => { const vise = g.userData.penche ? (i % 2 ? .07 : -.07) : 0; g.rotation.z = lisse(g.rotation.z, vise, Math.min(1, dt * 8)); });
    // un livre sort un peu, puis rentre
    livresMobiles.forEach(l => { const d = l.userData.sortie === undefined ? 99 : t - l.userData.sortie; if (l.userData.z0 === undefined) l.userData.z0 = l.position.z; l.position.z = l.userData.z0 + (d < 2.4 ? Math.min(1, d * 4, (2.4 - d) * 2) * .11 : 0); });
    // l'éclair dans le petit nuage
    const de = depuis('eclair');
    nuage.children.forEach(m => { if (m.material && m.material.emissive) m.material.emissive.setRGB(de < .35 ? 1.2 : 0, de < .35 ? 1.1 : 0, de < .35 ? .6 : 0); });
  }

  /* ═══════════════ la boucle ═══════════════ */
  let visible = false, cielGris = 1, dernier = performance.now(), horloge = 0, prochainBattement = 0, lcdT = 0, cielT = 0, phase = 0, premiere = true;
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
    soleil.color.set(mel('#6f86c6', '#fff1d8', jour));
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
    haut_parleurs.forEach(h => { h.push = Math.max(0, h.push - dt * 7); h.hp.position.z = h.base + h.push * (h.type === 'grave' ? .014 : .007); });
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
    // l'écran fait défiler le morceau
    if ((lcdT += dt) > .05) { lcdT = 0; if (etat.joue) lcdDecalage += 4.5; dessinerLcd(!etat.joue, t, t < finLcdMessage ? lcdMessage : ''); }
    // la fenêtre : chaque minute, ou souvent quand il pleut
    cielT += dt;
    if (cielT > (tr > .02 || Math.abs(tr - cielGris) > .005 ? .08 : 60)) { cielT = 0; cielGris = tr; dessinerCiel(t, tr); }

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
    rendu.render(scene, camera);
    placerPensee();
    placerEtiquette();
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
      cible.append(toile, pensee, ...points, etiquette, survol);
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
  addEventListener('resize', taille);
  document.body.classList.add('piece-3d');

  // les images des cadres arrivent après le reste
  (window.requestIdleCallback || (f => setTimeout(f, 400)))(() => {
    CADRES_IMG.forEach(c => chargeur.load(`img/salon/${c.nom}.jpg`, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; c.image.material.map = t; c.image.material.color.set('#ffffff'); c.image.material.needsUpdate = true; }, undefined, () => {}));
  }, { timeout: 1500 });
  window.Piece = { maj, placer, vue: () => { pres = !pres && parent === plein; cadrer(); return pres; } };
  window.__pieceDebug = { THREE, fauteuil, perso, buste, tete, bras, jambes, poids, scene, camera, lancerActivite,
    // où se trouve un objet touchable à l'écran (pour les vérifications)
    ecran: nom => { const c = CIBLES.find(x => x.nom === nom); if (!c) return null; const b = new THREE.Box3().setFromObject(c.obj); const p = b.getCenter(new THREE.Vector3()).project(camera); const r = toile.getBoundingClientRect(); return [r.left + (p.x + 1) / 2 * r.width, r.top + (1 - p.y) / 2 * r.height]; },
    noms: () => CIBLES.map(c => c.nom) };   // pour les vérifications
  if (window.__salonEtat) maj(window.__salonEtat);
  placer();
}
