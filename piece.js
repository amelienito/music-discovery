/* ════════════════════════════════════════════════════════════════════
   LA PIÈCE — Music Discovery en 3D
   Au milieu, un fauteuil club et son pouf ; Amélien y est allongé (afro,
   lunettes rondes, moustache, manteau sombre, cravate orange). À sa droite,
   la mini-chaîne CD fait défiler le morceau. À côté, la fenêtre montre le
   vrai moment de la journée chez toi. Ton mot sur le morceau devient une
   pensée au-dessus de lui. Quand la musique joue, des notes partent des
   enceintes et rebondissent sur les murs, la lampe réchauffe la pièce, et
   il bouge selon le morceau : il lit quand c'est très doux, met les mains
   derrière la tête quand c'est catchy, balance la tête quand c'est groovy,
   tape sur les accoudoirs quand c'est énergique. Le chat dort.
   Si la 3D ne marche pas, le salon dessiné (salon.js) reste à sa place.
   ════════════════════════════════════════════════════════════════════ */
import * as THREE from './vendor/three.module.js';

const conteneurs = [...document.querySelectorAll('[data-salon]')];
const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
function webgl() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

// la 3D ne démarre qu'une fois la page chargée, et quand un salon approche de l'écran :
// le site et la musique passent toujours en premier
function demarrer() {
  if (demarrer.fait) return; demarrer.fait = true;
  try { lancer(); } catch (e) { console.warn('La pièce 3D ne démarre pas, on garde le salon dessiné.', e); }
}
function guetter() {
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    io.disconnect();
    (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(demarrer, { timeout: 1200 });
  }, { rootMargin: '300px' });
  conteneurs.forEach(c => io.observe(c));
}
if (conteneurs.length && webgl()) {
  if (document.readyState === 'complete') guetter(); else addEventListener('load', guetter, { once: true });
}

function lancer() {
  /* ─────────── moteur ─────────── */
  const toile = document.createElement('canvas');
  toile.className = 'piece-toile';
  toile.setAttribute('aria-hidden', 'true');
  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: false });
  rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  rendu.shadowMap.enabled = true;
  rendu.shadowMap.type = THREE.PCFShadowMap;
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1410');
  const camera = new THREE.PerspectiveCamera(40, 2, .05, 40);

  // la pensée : une bulle HTML posée au-dessus de sa tête (le texte reste net)
  const pensee = document.createElement('div');
  pensee.className = 'piece-pensee';
  pensee.innerHTML = '<p class="piece-pensee-texte"></p><i></i><i></i><i></i>';

  /* ─────────── matériaux et petits outils ─────────── */
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .82, metalness: 0, flatShading: true }, o));
  const ombre = m => { m.traverse(x => { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } }); return m; };
  const boite = (w, h, d, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const cyl = (r1, r2, h, n, mat, parent) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), mat); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  // un membre : un cylindre qui part du pivot vers le bas, de longueur l
  const membre = (r1, r2, l, mat, parent) => { const g = new THREE.Group(); parent.add(g); const m = cyl(r1, r2, l, 8, mat, g); m.position.y = -l / 2; return g; };

  /* ─────────── la lumière ─────────── */
  const hemi = new THREE.HemisphereLight('#fff1dc', '#4a3a2a', .7); scene.add(hemi);
  const soleil = new THREE.DirectionalLight('#fff3df', 1); soleil.position.set(2.2, 3.2, -6); soleil.target.position.set(0, 0, 0); scene.add(soleil, soleil.target);
  const lampe = new THREE.SpotLight('#ffcf8f', 30, 8, 1.05, .7, 1.6);
  lampe.position.set(.95, 2.35, .05); lampe.target.position.set(0, .4, .2);
  lampe.castShadow = true; lampe.shadow.mapSize.set(1024, 1024); lampe.shadow.bias = -.0008;
  scene.add(lampe, lampe.target);
  const chaleur = new THREE.PointLight('#ff9a4a', 0, 6, 1.4); chaleur.position.set(-.6, 1.4, .8); scene.add(chaleur);

  /* ─────────── la pièce (maison de poupée : pas de mur de face) ─────────── */
  const piece = new THREE.Group(); scene.add(piece);
  const bois = ['#8a5d3b', '#94643f', '#7f5534', '#9a6b45'].map(c => M(c, { roughness: .7 }));
  for (let i = 0; i < 15; i++) boite(.5, .06, 5.4, bois[i % 4], -3.5 + i * .5, -.03, 0, piece);
  const peinture = M('#dccbaa', { flatShading: false }), plinthe = M('#efe6d3');
  boite(7.2, 3, .12, peinture, 0, 1.5, -2.62, piece);
  boite(.12, 3, 5.4, peinture, -3.62, 1.5, 0, piece);
  boite(7.1, .12, .05, plinthe, 0, .06, -2.54, piece); boite(.05, .12, 5.3, plinthe, -3.54, .06, 0, piece);
  // le tapis
  const tapis = cyl(1.7, 1.7, .025, 12, M('#8a3b2c', { roughness: 1 }), piece); tapis.scale.z = .75; tapis.position.set(.15, .015, .2);
  const tapis2 = cyl(1.35, 1.35, .03, 12, M('#c9a35a', { roughness: 1 }), piece); tapis2.scale.z = .75; tapis2.position.set(.15, .02, .2);

  /* la fenêtre, sur le mur du fond à droite : le ciel de l'heure qu'il est */
  const ciel = document.createElement('canvas'); ciel.width = 256; ciel.height = 200;
  const texCiel = new THREE.CanvasTexture(ciel); texCiel.colorSpace = THREE.SRGBColorSpace;
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), new THREE.MeshBasicMaterial({ map: texCiel, toneMapped: false }));
  vitre.position.set(1.85, 1.75, -2.55); piece.add(vitre);
  const cadreF = M('#efe6d3');
  boite(1.56, .08, .1, cadreF, 1.85, 2.34, -2.52, piece); boite(1.56, .08, .1, cadreF, 1.85, 1.16, -2.52, piece);
  boite(.08, 1.26, .1, cadreF, 1.11, 1.75, -2.52, piece); boite(.08, 1.26, .1, cadreF, 2.59, 1.75, -2.52, piece);
  boite(.05, 1.1, .06, cadreF, 1.85, 1.75, -2.51, piece); boite(1.4, .05, .06, cadreF, 1.85, 1.9, -2.51, piece);
  boite(1.7, .05, .22, cadreF, 1.85, 1.13, -2.44, piece);
  const velours = M('#7d3129', { roughness: .95 });
  [.92, 2.78].forEach(x => { for (let k = 0; k < 3; k++) { const p = cyl(.06, .08, 2.25, 6, velours, piece); p.position.set(x + (k - 1) * .08, 1.38, -2.45); } });
  boite(2.3, .04, .04, M('#2a2420'), 1.85, 2.52, -2.45, piece);

  /* la bibliothèque, au fond à gauche */
  const biblio = new THREE.Group(); biblio.position.set(-2.62, 0, -2.35); piece.add(biblio);
  const noyer = M('#4b2f1c');
  boite(1.3, 1.95, .05, M('#2e1c10'), 0, .98, -.14, biblio);
  boite(.05, 1.95, .32, noyer, -.64, .98, 0, biblio); boite(.05, 1.95, .32, noyer, .64, .98, 0, biblio);
  const couleurs = ['#b8473a', '#e3b04b', '#2f4a6b', '#d9d2c3', '#3f7a4a', '#7e5aa0', '#1d1c22', '#c87a3e', '#8aa0b8', '#a3352a'];
  for (let e = 0; e < 4; e++) {
    const y = .05 + e * .48;
    boite(1.28, .04, .32, noyer, 0, y, 0, biblio);
    let x = -.58;
    for (let k = 0; x < .56; k++) {
      const w = .035 + ((k * 7 + e * 3) % 5) * .008, h = .26 + ((k * 13 + e) % 7) * .02;
      const livre = boite(w, h, .22, M(couleurs[(k * 3 + e * 5) % couleurs.length]), x + w / 2, y + .02 + h / 2, .02, biblio);
      if ((k + e) % 9 === 4) livre.rotation.z = .18;
      x += w + .006;
    }
  }
  boite(1.3, .04, .32, noyer, 0, 1.94, 0, biblio);

  /* le poster : la pochette du morceau */
  const poster = new THREE.Group(); poster.position.set(-1.05, 1.68, -2.55); piece.add(poster);
  boite(.78, .78, .04, M('#1f1a15'), 0, 0, 0, poster);
  boite(.7, .7, .045, M('#efe7d8'), 0, 0, .002, poster);
  const vierge = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#c8572f'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#1d1c22'; x.beginPath(); x.arc(32, 32, 18, 0, 7); x.fill(); x.fillStyle = '#efe7d8'; x.beginPath(); x.arc(32, 32, 3, 0, 7); x.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const affiche = new THREE.Mesh(new THREE.PlaneGeometry(.6, .6), new THREE.MeshStandardMaterial({ map: vierge, roughness: .6 }));
  affiche.position.z = .026; poster.add(affiche);
  const chargeur = new THREE.TextureLoader(); chargeur.setCrossOrigin('anonymous');
  let pochetteActuelle = null;
  function majPoster(src) {
    if (!src || src === pochetteActuelle) return;
    pochetteActuelle = src;
    chargeur.load(src, t => { if (pochetteActuelle !== src) return; t.colorSpace = THREE.SRGBColorSpace; affiche.material.map = t; affiche.material.needsUpdate = true; }, undefined, () => {});
  }

  /* la lampe à arc */
  const lampeG = new THREE.Group(); lampeG.position.set(1.15, 0, -.35); piece.add(lampeG);
  const fer = M('#2a2a2e', { metalness: .4, roughness: .5 });
  cyl(.18, .2, .04, 12, fer, lampeG).position.y = .02;
  const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.7, .1), new THREE.Vector3(-.25, 2.42, .42)), 20, .018, 6), fer);
  arc.castShadow = true; lampeG.add(arc);
  const abat = cyl(.08, .22, .2, 10, M('#2b2a2e', { side: THREE.DoubleSide }), lampeG); abat.position.set(-.25, 2.38, .42); abat.material.side = THREE.DoubleSide;
  const ampoule = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffe2a6' })); ampoule.position.set(-.25, 2.3, .42); lampeG.add(ampoule);

  /* la plante */
  const pot = cyl(.17, .13, .32, 7, M('#b5603c'), piece); pot.position.set(3.05, .16, -2.15);
  for (let i = 0; i < 8; i++) { const f = cyl(0, .07, .7, 4, M('#4f7a46'), piece); f.position.set(3.05 + Math.cos(i) * .06, .62, -2.15 + Math.sin(i) * .06); f.rotation.set(Math.sin(i * 2) * .55, i, Math.cos(i * 2) * .55); }

  /* ─────────── la chaîne CD, à sa droite ─────────── */
  const chaine = new THREE.Group(); chaine.position.set(-1.55, 0, -.55); chaine.rotation.y = .5; piece.add(chaine);
  boite(1.5, .62, .48, M('#5a3520'), 0, .31, 0, chaine);
  boite(.7, .5, .02, M('#4a2a18'), -.36, .31, .245, chaine); boite(.7, .5, .02, M('#4a2a18'), .36, .31, .245, chaine);
  const noir = M('#232227', { roughness: .6 }), cone = M('#3a393f', { roughness: .5 });
  const enceintes = [-.55, .55].map(x => {
    const e = new THREE.Group(); e.position.set(x, .62, 0); chaine.add(e);
    boite(.3, .48, .3, noir, 0, .24, 0, e);
    const hp = cyl(.1, .1, .02, 14, cone, e); hp.rotation.x = Math.PI / 2; hp.position.set(0, .17, .151);
    const tw = cyl(.04, .04, .02, 10, cone, e); tw.rotation.x = Math.PI / 2; tw.position.set(0, .37, .151);
    return { e, hp };
  });
  const alu = M('#c9cbce', { metalness: .55, roughness: .35, flatShading: false });
  boite(.46, .22, .32, alu, 0, .73, 0, chaine);
  boite(.46, .015, .3, M('#e6e7e9', { metalness: .4, roughness: .3 }), 0, .845, 0, chaine);
  // l'écran : le morceau défile
  const lcd = document.createElement('canvas'); lcd.width = 256; lcd.height = 48;
  const texLcd = new THREE.CanvasTexture(lcd); texLcd.colorSpace = THREE.SRGBColorSpace;
  const ecran = new THREE.Mesh(new THREE.PlaneGeometry(.3, .056), new THREE.MeshBasicMaterial({ map: texLcd, toneMapped: false }));
  ecran.position.set(-.04, .76, .162); chaine.add(ecran);
  boite(.3, .012, .01, M('#8f9196'), -.04, .68, .162, chaine);
  const molette = cyl(.035, .035, .02, 12, M('#b4b6ba', { metalness: .5 }), chaine); molette.rotation.x = Math.PI / 2; molette.position.set(.16, .75, .165);
  // la tour à CD
  const tour = new THREE.Group(); tour.position.set(-1.05, 0, -.3); chaine.add(tour);
  boite(.16, .9, .16, M('#2b2420'), 0, .45, 0, tour);
  for (let k = 0; k < 14; k++) boite(.13, .02, .14, M(couleurs[k % couleurs.length]), 0, .08 + k * .058, .02, tour);

  let lcdTexte = 'MUSIC DISCOVERY', lcdDecalage = 0;
  function dessinerLcd() {
    const x = lcd.getContext('2d');
    x.fillStyle = '#06111c'; x.fillRect(0, 0, 256, 48);
    x.fillStyle = '#8fdcff'; x.font = 'bold 30px ui-monospace, monospace'; x.textBaseline = 'middle';
    const largeur = x.measureText(lcdTexte + '   ·   ').width;
    const d = -(lcdDecalage % largeur);
    x.fillText(lcdTexte + '   ·   ' + lcdTexte, d + 8, 25);
    texLcd.needsUpdate = true;
  }
  dessinerLcd();

  /* ─────────── le fauteuil club et le pouf ─────────── */
  const fauteuil = new THREE.Group(); fauteuil.position.set(.05, 0, .05); fauteuil.rotation.y = .12; piece.add(fauteuil);
  const cuir = M('#9a5226', { roughness: .5, metalness: .05 }), cuirFonce = M('#7a3c1b', { roughness: .55 });
  boite(.92, .28, .82, cuirFonce, 0, .22, 0, fauteuil);
  boite(.62, .13, .66, cuir, 0, .42, .05, fauteuil);
  const dos = boite(.92, .62, .2, cuir, 0, .7, -.33, fauteuil); dos.rotation.x = -.16;
  const rouleauDos = cyl(.11, .11, .92, 12, cuir, fauteuil); rouleauDos.rotation.z = Math.PI / 2; rouleauDos.position.set(0, 1.0, -.39);
  [-.38, .38].forEach(x => {
    boite(.17, .34, .82, cuir, x, .45, 0, fauteuil);
    const r = cyl(.1, .1, .82, 12, cuir, fauteuil); r.rotation.x = Math.PI / 2; r.position.set(x, .63, 0);
    [-.33, .33].forEach(z => { const p = cyl(.03, .025, .09, 6, M('#3b2316'), fauteuil); p.position.set(x * 1.05, .045, z); });
  });
  const pouf = new THREE.Group(); pouf.position.set(0, 0, .95); fauteuil.add(pouf);
  cyl(.3, .28, .3, 12, cuir, pouf).position.y = .2; cyl(.31, .31, .06, 12, cuirFonce, pouf).position.y = .36;

  /* ─────────── Amélien ─────────── */
  const peau = M('#9a6646', { roughness: .7 }), peau2 = M('#7e5034'), costume = M('#1d2233', { roughness: .8 }), pantalon = M('#23262f'), chemise = M('#f4f1ea'), cravate = M('#d06a32'), cheveux = M('#2e1c14', { roughness: 1 }), monture = M('#121010', { roughness: .4 }), chaussure = M('#3a2418', { roughness: .5 });
  const perso = new THREE.Group(); perso.position.set(0, .5, -.06); fauteuil.add(perso);
  // le buste, adossé (allongé)
  const buste = new THREE.Group(); perso.add(buste); buste.rotation.x = -.34;
  boite(.42, .52, .24, costume, 0, .27, 0, buste);
  const vChemise = boite(.1, .2, .01, chemise, 0, .44, .122, buste); vChemise.scale.x = 1.2;
  boite(.045, .3, .012, cravate, 0, .32, .128, buste);
  boite(.05, .06, .012, cravate, 0, .5, .129, buste);
  // la tête
  const cou = cyl(.05, .055, .1, 8, peau2, buste); cou.position.set(0, .57, 0);
  const tete = new THREE.Group(); tete.position.set(0, .63, .01); tete.scale.setScalar(1.15); buste.add(tete);
  const visage = new THREE.Mesh(new THREE.IcosahedronGeometry(.125, 1), peau); visage.scale.set(.92, 1.12, .95); visage.position.y = .08; tete.add(visage);
  const afro = new THREE.Mesh(new THREE.IcosahedronGeometry(.25, 1), cheveux); afro.position.set(0, .14, -.11); afro.scale.set(1.08, .98, .9); tete.add(afro);
  [-1, 1].forEach(s => { const o = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 5), peau2); o.position.set(s * .115, .07, -.01); tete.add(o); });
  const boucleOreille = new THREE.Mesh(new THREE.SphereGeometry(.009, 6, 4), M('#e3c06a', { metalness: .8, roughness: .3 })); boucleOreille.position.set(.118, .035, -.005); tete.add(boucleOreille);
  [-1, 1].forEach(s => {
    const l = new THREE.Mesh(new THREE.TorusGeometry(.04, .008, 6, 16), monture); l.position.set(s * .048, .1, .112); tete.add(l);
    const oeil = boite(.03, .006, .005, M('#1a100b'), s * .048, .097, .108, tete);
    const branche = boite(.006, .006, .12, monture, s * .09, .1, .05, tete);
  });
  boite(.022, .008, .008, monture, 0, .105, .118, tete);
  boite(.09, .022, .03, cheveux, 0, .03, .112, tete); // la moustache
  boite(.04, .03, .02, cheveux, 0, -.035, .1, tete);  // la barbichette
  const sourire = boite(.05, .008, .01, M('#3b1d14'), 0, .005, .115, tete);
  // les bras : épaule, coude, main
  const bras = [-1, 1].map(s => {
    const epaule = new THREE.Group(); epaule.position.set(s * .25, .46, 0); buste.add(epaule);
    const haut = membre(.055, .05, .3, costume, epaule);
    const coude = new THREE.Group(); coude.position.y = -.3; epaule.add(coude);
    membre(.05, .045, .27, costume, coude);
    const poignet = boite(.07, .03, .07, chemise, 0, -.27, 0, coude);
    const main = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), peau); main.position.y = -.31; coude.add(main);
    return { s, epaule, coude, main };
  });
  // le verre, dans la main droite (côté chaîne)
  const verre = new THREE.Group(); verre.position.set(0, -.33, .03); bras[0].coude.add(verre);
  const coupe = cyl(.03, .025, .08, 8, new THREE.MeshStandardMaterial({ color: '#f4efe6', transparent: true, opacity: .55, roughness: .1 }), verre); coupe.position.y = .03;
  const whisky = cyl(.026, .024, .04, 8, M('#c8a24a', { roughness: .3 }), verre); whisky.position.y = .015;
  // le livre (quand c'est très doux)
  const livre = new THREE.Group(); livre.position.set(0, .3, .3); livre.rotation.x = -.9; buste.add(livre); livre.visible = false;
  const couv = M('#7a2f24'), page = M('#f6f0e2', { flatShading: false });
  [-1, 1].forEach(s => { const c = boite(.16, .22, .012, couv, s * .08, 0, 0, livre); c.rotation.y = -s * .25; const p = boite(.15, .2, .012, page, s * .075, 0, .008, livre); p.rotation.y = -s * .25; });
  // les jambes, posées sur le pouf
  const jambes = [-1, 1].map(s => {
    const hanche = new THREE.Group(); hanche.position.set(s * .11, 0, .05); perso.add(hanche);
    membre(.075, .065, .46, pantalon, hanche);
    const genou = new THREE.Group(); genou.position.y = -.46; hanche.add(genou);
    membre(.062, .05, .44, pantalon, genou);
    const pied = boite(.1, .08, .2, chaussure, 0, -.46, .05, genou);
    return { s, hanche, genou };
  });

  /* le chat qui dort, sur le tapis */
  const chat = new THREE.Group(); chat.position.set(.95, 0, 1.15); chat.rotation.y = .6; piece.add(chat);
  const fourrure = M('#2b2522', { roughness: 1 });
  const corps = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), fourrure); corps.scale.set(1.35, .62, .95); corps.position.y = .1; chat.add(corps);
  const teteChat = new THREE.Mesh(new THREE.SphereGeometry(.085, 10, 8), fourrure); teteChat.position.set(-.2, .1, .06); chat.add(teteChat);
  [-1, 1].forEach(s => { const o = cyl(0, .03, .06, 4, fourrure, chat); o.position.set(-.22, .18, .06 + s * .045); });
  const queue = new THREE.Mesh(new THREE.TorusGeometry(.14, .022, 6, 12, Math.PI * 1.1), fourrure); queue.rotation.x = Math.PI / 2; queue.position.set(.05, .03, .02); chat.add(queue);

  ombre(scene);
  [vitre, ecran, affiche].forEach(m => { m.castShadow = false; });

  /* ─────────── les notes qui rebondissent sur les murs ─────────── */
  const BORNES = { x: [-3.45, 3.3], y: [.08, 2.75], z: [-2.45, 2.3] };
  const matNote = new THREE.MeshBasicMaterial({ color: '#ffc27a', transparent: true, opacity: .9, toneMapped: false });
  const notes = Array.from({ length: 36 }, () => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(.035, 0), matNote.clone()); m.visible = false; scene.add(m); return { m, v: new THREE.Vector3(), vie: 0 }; });
  const posEnceinte = new THREE.Vector3();
  function emettre() {
    enceintes.forEach(({ hp }) => {
      const n = notes.find(x => x.vie <= 0); if (!n) return;
      hp.getWorldPosition(posEnceinte);
      n.m.position.copy(posEnceinte);
      const a = Math.random() * Math.PI * 1.2 - .1;
      n.v.set(Math.cos(a) * 1.4, .25 + Math.random() * .7, Math.sin(a) * 1.4 + .6);
      n.vie = 4; n.m.visible = true;
    });
    enceintes.forEach(({ hp }) => { hp.scale.set(1.18, 1, 1.18); });
  }

  /* ─────────── le ciel de l'heure qu'il est ─────────── */
  const CIEL = [[0, '#070b1d', '#17203f'], [5, '#0a0f26', '#1f2a4f'], [6.3, '#3c4a86', '#f2a487'], [7.5, '#86b6e3', '#f6d8b8'], [10, '#5ea6e6', '#cfe5f6'], [15, '#6aaee8', '#d9ebf6'], [18, '#6b8fcb', '#f4c89a'], [19.4, '#3e3f80', '#f08355'], [20.6, '#1b2150', '#6c4677'], [22, '#0a0f27', '#1c2448'], [24, '#070b1d', '#17203f']];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mel = (a, b, f) => '#' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * f).toString(16).padStart(2, '0')).join('');
  const couleursCiel = h => { for (let i = 0; i < CIEL.length - 1; i++) { const [h1, a1, b1] = CIEL[i], [h2, a2, b2] = CIEL[i + 1]; if (h >= h1 && h <= h2) { const f = (h - h1) / (h2 - h1); return [mel(a1, a2, f), mel(b1, b2, f)]; } } return [CIEL[0][1], CIEL[0][2]]; };
  const jourDe = h => Math.max(0, Math.min(1, Math.sin((h - 6.2) / 13.6 * Math.PI) * 1.6));
  let jour = .5;
  function heure() {
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    const [haut, bas] = couleursCiel(h); jour = jourDe(h);
    const x = ciel.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, haut); g.addColorStop(1, bas);
    x.fillStyle = g; x.fillRect(0, 0, 256, 200);
    x.fillStyle = `rgba(255,255,255,${(1 - jour) * .9})`;
    for (let k = 0; k < 26; k++) x.fillRect((k * 97) % 256, (k * 53) % 110, 2, 2);
    const levant = h >= 6.3 && h <= 20.4, f = levant ? (h - 6.3) / 14.1 : ((h + 24 - 20.4) % 24) / 9.9;
    x.fillStyle = levant ? (jour > .5 ? '#fff4d0' : '#ffb36b') : '#f3efe2';
    x.beginPath(); x.arc(20 + f * 216, 150 - Math.sin(f * Math.PI) * 110, 16, 0, 7); x.fill();
    x.fillStyle = mel('#151a33', '#7d8aa3', jour);
    [[0, 70], [40, 50], [70, 96], [120, 44], [150, 80], [196, 60], [226, 88]].forEach(([bx, bh]) => x.fillRect(bx, 200 - bh, 34, bh));
    x.fillStyle = `rgba(255,210,122,${(1 - jour) * .95})`;
    for (let k = 0; k < 40; k++) x.fillRect((k * 37) % 250 + 3, 200 - ((k * 23) % 80) - 8, 4, 5);
    texCiel.needsUpdate = true;
    soleil.intensity = .15 + jour * 1.6;
    soleil.color.set(mel('#6f86c6', '#fff1d8', jour));
    hemi.intensity = .4 + jour * .5;
    hemi.color.set(mel('#6b78a8', '#fff1dc', jour));
  }
  heure();
  setInterval(heure, 60000);

  /* ─────────── l'état de la musique ─────────── */
  const etat = { joue: false, bpm: 96, energie: 5, danse: 5, humeur: 'repos', note: '' };
  const humeurDe = (e, d) => e <= 3 && d <= 4 ? 'doux' : e >= 8 ? 'energie' : d >= 6 ? 'groove' : 'detente';
  function maj(n = {}) {
    Object.assign(etat, n);
    etat.humeur = etat.joue ? humeurDe(etat.energie, etat.danse) : 'repos';
    if (n.titre !== undefined) { lcdTexte = (n.titre ? `${n.titre} — ${n.artiste || ''}` : 'MUSIC DISCOVERY').toUpperCase(); lcdDecalage = 0; dessinerLcd(); }
    if (n.pochette) majPoster(n.pochette);
    const texte = (etat.note || '').trim();
    pensee.querySelector('.piece-pensee-texte').textContent = texte;
    pensee.classList.toggle('visible', !!texte);
    livre.visible = etat.humeur === 'doux';
    verre.visible = etat.humeur !== 'doux' && etat.humeur !== 'detente';
  }

  /* ─────────── les attitudes : des angles cibles pour chaque articulation ─────────── */
  // épaule [x, z] (z vers l'extérieur), coude x ; tête [x, z] ; buste x
  const POSES = {
    repos:   { epaule: [.3, .3], coude: -1.2, tete: [.28, 0], buste: -.34 },
    groove:  { epaule: [.3, .3], coude: -1.2, tete: [.24, 0], buste: -.3 },
    energie: { epaule: [.2, .28], coude: -1.4, tete: [.3, 0], buste: -.26 },
    detente: { epaule: [-2.6, .95], coude: -2.25, tete: [.12, 0], buste: -.42 },
    doux:    { epaule: [-.15, .12], coude: -1.85, tete: [.6, 0], buste: -.3 },
  };
  const lisse = (a, b, k) => a + (b - a) * k;

  /* ─────────── la caméra, la profondeur ─────────── */
  let px = 0, py = 0, cx = 0, cy = 0, souris = false;
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; souris = true; px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const regard = new THREE.Vector3(-.3, .9, -.2);
  function placerCamera(t) {
    if (!souris) { px = Math.sin(t / 5200) * .6; py = Math.sin(t / 7300) * .3; }
    cx = lisse(cx, px, .05); cy = lisse(cy, py, .05);
    const etroit = camera.aspect < 1.25;
    const base = etroit ? new THREE.Vector3(1.05, 1.45, 3.25) : new THREE.Vector3(1.7, 1.45, 3.6);
    camera.position.set(base.x + cx * .45, base.y - cy * .2, base.z);
    camera.lookAt(regard);
  }
  function taille() {
    const parent = toile.parentElement; if (!parent) return;
    const w = parent.clientWidth, h = parent.clientHeight;
    if (!w || !h) return;
    rendu.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1.25 ? 54 : 40;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', taille);

  /* ─────────── la boucle ─────────── */
  let visible = false, dernier = performance.now(), prochainBattement = 0, horloge = 0, lcdT = 0;
  const tmp = new THREE.Vector3();
  function image(maintenant) {
    if (!visible || document.hidden) { boucle = null; return; }
    const dt = Math.min(.05, (maintenant - dernier) / 1000); dernier = maintenant; horloge += dt;
    const t = horloge, P = POSES[etat.humeur], k = calme ? 1 : Math.min(1, dt * 4);
    const battement = 60 / Math.max(60, Math.min(170, etat.bpm || 96)) * (etat.bpm > 130 ? 2 : 1);
    const phase = (t / battement) * Math.PI * 2;
    // le corps
    buste.rotation.x = lisse(buste.rotation.x, P.buste + Math.sin(t * 1.3) * .012, k);
    let teteX = P.tete[0], teteZ = P.tete[1], busteZ = 0;
    if (!calme && etat.joue) {
      if (etat.humeur === 'groove') { teteZ += Math.sin(phase / 2) * .16; busteZ = Math.sin(phase / 2) * .04; }
      if (etat.humeur === 'energie') teteX += Math.max(0, Math.sin(phase)) * .22;
      if (etat.humeur === 'detente') teteX += Math.sin(phase / 2) * .05;
    }
    tete.rotation.x = lisse(tete.rotation.x, teteX, Math.min(1, dt * 10));
    tete.rotation.z = lisse(tete.rotation.z, teteZ, Math.min(1, dt * 10));
    buste.rotation.z = lisse(buste.rotation.z, busteZ, Math.min(1, dt * 8));
    bras.forEach(b => {
      let cx2 = P.coude;
      if (!calme && etat.joue && etat.humeur === 'energie') cx2 += Math.max(0, Math.sin(phase + (b.s > 0 ? Math.PI : 0))) * .5;
      b.epaule.rotation.x = lisse(b.epaule.rotation.x, P.epaule[0], k);
      b.epaule.rotation.z = lisse(b.epaule.rotation.z, b.s * P.epaule[1], k);
      b.coude.rotation.x = lisse(b.coude.rotation.x, cx2, Math.min(1, dt * 9));
    });
    jambes.forEach(j => {
      let tape = 0;
      if (!calme && etat.joue && (etat.humeur === 'groove' || etat.humeur === 'energie') && j.s > 0) tape = Math.max(0, Math.sin(phase)) * .12;
      j.hanche.rotation.x = lisse(j.hanche.rotation.x, -1.32, k);
      j.hanche.rotation.z = j.s * .04;
      j.genou.rotation.x = lisse(j.genou.rotation.x, .2 + tape, Math.min(1, dt * 10));
    });
    // le chat respire
    corps.scale.y = .62 + Math.sin(t * 1.6) * .025;
    // la lumière : la musique réchauffe la pièce
    const chaud = etat.joue ? 1 : 0;
    lampe.intensity = lisse(lampe.intensity, 16 + (1 - jour) * 22 + chaud * 14, dt * 1.5);
    chaleur.intensity = lisse(chaleur.intensity, chaud * (2.5 + (1 - jour) * 3), dt * 1.2);
    // la musique : des notes partent des enceintes et rebondissent sur les murs
    if (etat.joue && !calme && t >= prochainBattement) { emettre(); prochainBattement = t + battement; }
    enceintes.forEach(({ hp }) => { hp.scale.x = hp.scale.z = lisse(hp.scale.x, 1, dt * 8); });
    notes.forEach(n => {
      if (n.vie <= 0) return;
      n.vie -= dt; n.m.position.addScaledVector(n.v, dt); n.v.y -= dt * .05;
      ['x', 'y', 'z'].forEach(a => {
        const [lo, hi] = BORNES[a];
        if (n.m.position[a] < lo) { n.m.position[a] = lo; n.v[a] = Math.abs(n.v[a]) * .9; }
        if (n.m.position[a] > hi) { n.m.position[a] = hi; n.v[a] = -Math.abs(n.v[a]) * .9; }
      });
      n.m.rotation.y += dt * 3;
      n.m.material.opacity = Math.min(1, n.vie) * .9;
      n.m.scale.setScalar(.7 + Math.min(1, n.vie / 4) * .6);
      if (n.vie <= 0) n.m.visible = false;
    });
    // l'écran fait défiler le morceau
    if ((lcdT += dt) > .06) { lcdT = 0; lcdDecalage += etat.joue ? 3 : .8; dessinerLcd(); }
    placerCamera(maintenant);
    rendu.render(scene, camera);
    // la pensée suit la tête
    if (pensee.classList.contains('visible')) {
      tete.getWorldPosition(tmp); tmp.y += .42; tmp.project(camera);
      const r = toile.getBoundingClientRect(), pr = toile.parentElement.getBoundingClientRect();
      pensee.style.left = ((tmp.x + 1) / 2 * r.width) + 'px';
      pensee.style.top = ((1 - tmp.y) / 2 * r.height) + 'px';
    }
    boucle = requestAnimationFrame(image);
  }
  let boucle = null;
  const relancer = () => { if (!boucle && visible && !document.hidden) { dernier = performance.now(); boucle = requestAnimationFrame(image); } };
  document.addEventListener('visibilitychange', relancer);

  // une seule pièce, posée dans le salon qui est à l'écran (accueil ou chaîne)
  const vus = new Map();
  const obs = new IntersectionObserver(entrees => {
    entrees.forEach(e => vus.set(e.target, e.isIntersecting && e.target.offsetParent !== null));
    const cible = conteneurs.find(c => vus.get(c));
    visible = !!cible;
    if (cible && toile.parentElement !== cible) { cible.appendChild(toile); cible.appendChild(pensee); taille(); }
    if (visible) relancer();
  }, { threshold: .05 });
  conteneurs.forEach(c => { c.classList.add('en-3d'); obs.observe(c); });
  conteneurs[conteneurs.length - 1].appendChild(toile); conteneurs[conteneurs.length - 1].appendChild(pensee);
  document.body.classList.add('piece-3d');
  taille();

  window.Piece = { maj };
  if (window.__salonEtat) maj(window.__salonEtat);
}
