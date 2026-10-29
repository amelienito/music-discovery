/* ════════════════════════════════════════════════════════════════════
   MUSIC DISCOVERY
   Toute la logique du site. Tu n'as normalement pas besoin d'y toucher :
   la musique se gère dans data.js, les couleurs dans teintes.css, et la
   façon d'enchaîner les morceaux dans moteur.js.
   ════════════════════════════════════════════════════════════════════ */

(() => {
'use strict';

/* ─────────────────────────────── utilitaires ─────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const E  = Pochettes.echapper;
const N  = Pochettes.normaliser;
const hasard = arr => arr[Math.floor(Math.random() * arr.length)];
const borner = (v, a, b) => Math.max(a, Math.min(b, v));
const deux = n => String(Math.max(0, Math.floor(n))).padStart(2, '0');
const minutes = s => `${Math.floor(s / 60)}:${deux(s % 60)}`;
const reduitMouvement = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (IOS) document.documentElement.classList.add('ios');
const doux = reduitMouvement ? 'auto' : 'smooth';

const memoire = {
  lire(cle, defaut) { try { const v = JSON.parse(localStorage.getItem(cle)); return v === null || v === undefined ? defaut : v; } catch (e) { return defaut; } },
  ecrire(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) {} }
};

/* ─────────────────────────────── la banque ─────────────────────────────── */
function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9぀-ヿ一-龯]+/g, '-').replace(/^-|-$/g, '') || 'x';
}
function idYouTube(lien) {
  if (!lien) return null;
  const m = lien.match(/[?&]v=([\w-]{11})/) || lien.match(/youtu\.be\/([\w-]{11})/) || lien.match(/embed\/([\w-]{11})/);
  return m ? m[1] : null;
}
const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
// certains titres ne sont faits que de caractères invisibles (ㅤㅤㅤ) : on affiche alors « Sans titre »
const titreVisible = t => String(t || '').replace(/[\s\u3164\u115F\u1160\uFFA0\u2800\u200B-\u200F\u2060\uFEFF]/g, '') ? String(t).trim() : 'Sans titre';

// l'identifiant d'un morceau ne dépend que de son artiste et de son titre :
// retirer un morceau de data.js ne décale plus les trouvailles des autres
const vusIds = {};
const BANQUE = (typeof MORCEAUX !== 'undefined' ? MORCEAUX : []).map((m, i) => {
  const energie = num(m.energie, 5);
  const base = slug(m.artiste + '-' + m.titre);
  vusIds[base] = (vusIds[base] || 0) + 1;
  return {
    ...m,
    id: vusIds[base] > 1 ? `${base}-${vusIds[base]}` : base,
    affiche: titreVisible(m.titre),
    yt: idYouTube(m.lien),
    energie, etrange: num(m.etrange, 5), danse: num(m.danse, 5),
    note: (m.note || '').trim(),
    notePrincipale: (m.note || '').trim(),
    // une version « bonus » en priorité (ex. Azucar avec son intro alternative), et la version classique en secours, avec son propre commentaire
    secours: m.secours && idYouTube(m.secours.lien) ? { yt: idYouTube(m.secours.lien), note: String(m.secours.note || '').trim() } : null,
    ytPrincipal: idYouTube(m.lien),
    // deux versions d'un même morceau (radio edit, version longue…) ne s'enchaînent jamais
    version: Pochettes.normaliser(Pochettes.artistePrincipal(m.artiste)) + '|' + Pochettes.normaliser(String(m.titre).replace(/\s*[([].*?[)\]]\s*/g, ' ')),
    // les morceaux qui cognent sont joués un peu moins fort, pour ne pas surprendre
    facteur: borner(num(m.volume, energie >= 9 ? 0.66 : energie >= 8 ? 0.78 : energie >= 7 ? 0.88 : 1), 0.1, 1),
  };
});
const parId = Object.fromEntries(BANQUE.map(m => [m.id, m]));
// « mainstream / confidentiel » se mesure d'après le nombre de fans de l'artiste sur Deezer,
// et, tant qu'on ne sait pas, d'après la note « etrange » de data.js
const conf = m => { if (m.connu) return 1; const c = m.id ? Pochettes.confidentiel(m) : null; return c === null ? m.etrange : c; };
const val = (m, cle) => cle === 'etrange' ? conf(m) : m[cle];
/* ─────────────────────────────── l'état ─────────────────────────────── */
const S = {
  vue: 'allumage',
  // lecture
  joue: null,             // morceau en cours de lecture
  lecture: null,          // 'yt' | 'extrait' | null
  enLecture: false,
  finTraitee: false,
  erreur: false,          // rien n'a pu être lu
  bloque: false,          // la lecture ne démarre pas toute seule
  aJoue: false,           // le morceau en cours a-t-il déjà démarré ?
  // la chaîne
  source: (s => ['radio', 'selection'].includes(s) ? s : 'radio')(memoire.lire('md-source', 'radio')),
  suite: [],              // les six prochains morceaux
  historique: memoire.lire('md-historique', []).filter(id => parId[id]),
  echecs: 0,              // morceaux qui ne démarrent pas, d'affilée
  affichage: memoire.lire('md-affichage-v2', 'ecran'), // l'écran LCD, ou le disque qui tourne
  pile: [],               // les trois disques posés sous la chaîne : [{ m, dir }]
  choix: 1,               // celui qui passera ensuite (le milieu par défaut)
  tirage: 0,              // « Autres disques » : combien de fois on a reposé la pile
  dejaVus: new Set(),     // les disques déjà proposés pour ce morceau
  axeSuivi: null,         // on a choisi un côté : la pile suivante garde la même échelle
  auto: memoire.lire('md-auto', false), // « Flemme de choisir » : la radio enchaîne toute seule
  autoDir: null, autoPas: 0, // le pilote automatique glisse doucement dans un sens, puis change
  pub: false,             // une pub YouTube semble passer avant le morceau
  joues: 0,               // morceaux lancés depuis l'arrivée sur la page
  reprise: memoire.lire('md-reprise', {}),        // où on en était dans chaque source
  fidget: Object.assign({ lcd: 'origine', eq: 'barres', vitesse: '33', loudness: false, dimmer: '3', lumieres: 'tempo', grilles: false, bip: true }, memoire.lire('md-fidget', {})),
  aime: new Set(memoire.lire('md-aime', [])),
  aimePas: new Set(memoire.lire('md-aime-pas', [])),
  // le reste
  volume: borner(memoire.lire('md-volume', 60), 0, 100),
  croises: memoire.lire('md-croises', []),
  gardes: memoire.lire('md-gardes', []),
  // vidéos que YouTube a refusées : on les réessaie au bout de deux jours (un refus n'est pas toujours définitif)
  injouables: (() => { const v = memoire.lire('md-injouables-v2', {}); const t = Date.now(); return new Map(Object.entries(v).filter(([, d]) => t - d < 2 * 864e5)); })(),
  son: memoire.lire('md-son', 'complet'),
  onglet: 'gardes',
  livrets: { machine: false },
};
// les anciens identifiants finissaient par « -numéro » : on les retrouve
const retrouver = ids => [...new Set(ids.map(id => parId[id] ? id : parId[String(id).replace(/-\d+$/, '')] ? String(id).replace(/-\d+$/, '') : null).filter(Boolean))];
S.croises = retrouver(S.croises); memoire.ecrire('md-croises', S.croises);
S.gardes  = retrouver(S.gardes);  memoire.ecrire('md-gardes', S.gardes);
if (S.source === 'selection' && S.gardes.length < 2) S.source = 'radio';

let apiEnPanne = false;
const jouable = m => S.son === 'complet' && !apiEnPanne && !!m.yt && !S.injouables.has(m.yt);
const ecoutable = m => jouable(m) || Pochettes.etat(m) !== 'absent';

/* ─────────────────────────────── petits sons de la machine ─────────────────────────────── */
let ctxAudio = null;
function audioCtx() {
  try { ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)(); if (ctxAudio.state === 'suspended') ctxAudio.resume(); } catch (e) {}
  return ctxAudio;
}
function clic(freq = 1800, duree = 0.035, volume = 0.05) {
  if (S.fidget && S.fidget.bip === false) return;
  const c = audioCtx(); if (!c) return;
  try {
    const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.4, t + duree);
    g.gain.setValueAtTime(volume * (0.3 + S.volume / 140), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + duree + 0.01);
  } catch (e) {}
}

/* ─────────────────────────────── navigation ─────────────────────────────── */
function aller(vue) {
  const change = S.vue !== vue;
  S.vue = vue;
  const faire = () => {
    $$('section[data-ecran]').forEach(s => { s.hidden = s.dataset.ecran !== vue; });
    document.body.dataset.vue = vue;
    window.scrollTo(0, 0);
    arreterExtrait();
    majVideo();
  };
  // un fondu entre deux écrans, là où le navigateur sait le faire
  if (change && document.startViewTransition && !reduitMouvement && document.body.classList.contains('allume')) {
    try { document.startViewTransition(faire); return; } catch (e) {}
  }
  faire();
}
/* ─────────────────────────────── LA MOLETTE DE VOLUME ───────────────────────────────
   Elle se tourne comme une vraie : on l'attrape et on tourne autour.
   Glisser vers le haut marche aussi, la roulette et les flèches du clavier aussi.
   Sur la grande molette, toucher l'anneau règle directement le niveau. */
function majMolettes() {
  $$('[data-molette="volume"]').forEach(b => {
    const f = S.volume / 100;
    const mol = $('.molette', b);
    mol.style.setProperty('--rot', `${-135 + f * 270}deg`);
    mol.setAttribute('aria-valuenow', Math.round(S.volume));
    mol.setAttribute('aria-valuetext', `Volume ${Math.round(S.volume)}`);
    const arc = $('.molette-arc circle', b);
    if (arc) arc.style.strokeDasharray = `${f * 75} 100`;
    const v = $('.valeur-volume', b);
    if (v) v.textContent = Math.round(S.volume);
  });
  const f = $('#fader-volume');
  if (f) { f.value = Math.round(S.volume); f.style.setProperty('--v', `${S.volume}%`); }
}
function reglerVolume(v) {
  const avant = Math.round(S.volume / 5);
  S.volume = borner(v, 0, 100);
  if (Math.round(S.volume / 5) !== avant) clic(1500 + S.volume * 10, 0.012, 0.03);
  memoire.ecrire('md-volume', Math.round(S.volume));
  majMolettes();
  appliquerVolume();
}
function brancherMolette(b) {
  const mol = $('.molette', b);
  const angle = (x, y, r) => Math.atan2(x - (r.left + r.width / 2), (r.top + r.height / 2) - y) * 180 / Math.PI; // 0 = en haut, sens des aiguilles
  let g = null;
  mol.addEventListener('pointerdown', e => {
    const r = mol.getBoundingClientRect();
    g = { r, x: e.clientX, y: e.clientY, a: angle(e.clientX, e.clientY, r), bouge: false };
    try { mol.setPointerCapture(e.pointerId); } catch (er) {}
    mol.classList.add('saisie');
    e.preventDefault();
  });
  mol.addEventListener('pointermove', e => {
    if (!g) return;
    if (!g.bouge && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 3) return;
    g.bouge = true;
    const r = g.r, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const loin = Math.hypot(e.clientX - cx, e.clientY - cy) > Math.max(12, r.width * 0.3);
    let delta;
    if (loin) {
      // on tourne autour du bouton : on suit l'angle
      const a = angle(e.clientX, e.clientY, r);
      let d = a - g.a;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      delta = d / 270 * 100;
      g.a = a;
    } else {
      // tout près du centre : vers le haut ou la droite, ça monte
      delta = ((g.y - e.clientY) + (e.clientX - g.x)) * 0.5;
      g.a = angle(e.clientX, e.clientY, r);
    }
    g.x = e.clientX; g.y = e.clientY;
    reglerVolume(S.volume + delta);
  });
  const fin = e => {
    if (!g) return;
    const r = g.r, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    // un simple toucher sur l'anneau de la grande molette : le volume va là où on a touché
    if (!g.bouge && e && r.width >= 70 && Math.hypot(e.clientX - cx, e.clientY - cy) > r.width * 0.3) {
      const a = borner(angle(e.clientX, e.clientY, r), -135, 135);
      reglerVolume((a + 135) / 270 * 100);
    }
    g = null; mol.classList.remove('saisie');
  };
  mol.addEventListener('pointerup', fin);
  mol.addEventListener('pointercancel', () => { g = null; mol.classList.remove('saisie'); });
  mol.addEventListener('wheel', e => { e.preventDefault(); reglerVolume(S.volume - Math.sign(e.deltaY) * 5); }, { passive: false });
  mol.addEventListener('keydown', e => {
    const pas = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 20, PageDown: -20 }[e.key];
    if (!pas) return;
    e.preventDefault();
    reglerVolume(S.volume + pas);
  });
}
$$('[data-molette="volume"]').forEach(brancherMolette);
$('#fader-volume').addEventListener('input', e => reglerVolume(+e.target.value));

function appliquerVolume() {
  const m = S.joue ? parId[S.joue] : null;
  const f = m ? m.facteur : 1;
  const att = extraitPour ? 0.15 : 1; // pendant une pré-écoute, le morceau en cours se fait tout petit
  if (lecteur && lecteurPret) { try { lecteur.setVolume(Math.round(S.volume * f * att)); } catch (e) {} }
  audioLecture.volume = borner(S.volume / 100 * f * att, 0, 1);
}

/* ─────────────────────────────── croiser / garder ─────────────────────────────── */
function croiser(id) {

  if (!S.croises.includes(id)) {
    S.croises.unshift(id);
    memoire.ecrire('md-croises', S.croises);
  }
}
const estGarde = id => S.gardes.includes(id);
function basculerGarde(id) {
  if (!id || !parId[id]) return;
  let ajoute = false;
  if (estGarde(id)) {
    S.gardes = S.gardes.filter(x => x !== id);
    S.aime.delete(id);
    toast('Retiré de ta sélection.');
  } else {
    ajoute = true;
    S.gardes.unshift(id);
    S.aimePas.delete(id);
    const n = S.gardes.length;
    toast(n === 1 ? 'Noté ♥ La suite va dans ce sens.' : n === 2 ? 'Deux coups de cœur : « Ma sélection » apparaît en haut, et tu peux l\'écouter depuis le tuner.' : `Noté ♥ Dans ta sélection (${n}).`, n === 2 ? 5000 : 2400);
    clic(900, 0.08, 0.06);
    const b = $('.bouton-trouvailles'); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
  }
  if (ajoute) S.aime.add(id);
  memoire.ecrire('md-gardes', S.gardes);
  memoire.ecrire('md-aime', [...S.aime]); memoire.ecrire('md-aime-pas', [...S.aimePas]);
  majGarde();
  if (S.source === 'selection' && S.gardes.length < 2) { choisirSource('radio'); return; }
  // la pile reste en place (sauf si ta sélection, qui la remplit, a changé)
  if (S.joue && S.source === 'selection') rafraichirSuite(); else rendreTuner();
  if (!$('#bac').hidden) rendreBac();
}
// le cœur de la chaîne et le compteur de « Ma sélection »
function majGarde() {
  document.body.classList.toggle('sans-selection', S.gardes.length < 2);
  $('#compteur-bac').textContent = S.gardes.length;
  const rg = $('#radio-garder');
  const gr = !!S.joue && estGarde(S.joue);
  rg.classList.toggle('est-garde', gr);
  rg.setAttribute('aria-pressed', gr);
  $('.avis-aime-texte', rg).textContent = gr ? (S.gardes.length >= 2 ? 'Dans ma sélection' : 'Aimé') : 'J\'aime bien';
}

// « Philly soul, années 70 » : de quoi choisir sans avoir à écouter
function decennie(a) {
  if (!a) return '';
  if (a < 1800) return 'XVIIIᵉ siècle';
  if (a < 1900) return 'XIXᵉ siècle';
  if (a < 1950) return 'début du XXᵉ siècle';
  return a >= 2000 ? `années ${Math.floor(a / 10) * 10}` : `années ${Math.floor((a % 100) / 10) * 10}`;
}
function indice(m) {
  const t = [m.style, decennie(m.annee)].filter(Boolean).join(', ');
  return t || (m.energie <= 3 ? 'Tout en douceur' : m.energie >= 7 ? 'Ça cogne' : 'Ça avance');
}

/* ─────────────────────────────── LE LIVRET ───────────────────────────────
   Comme le livret d'un CD : l'album, l'artiste, et où écouter le morceau
   en entier. Replié par défaut, pour que la page reste légère. */
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function dateLongue(d) {
  if (!d) return '';
  const [a, mo, j] = d.split('-').map(Number);
  if (!a) return '';
  if (!mo || (mo === 1 && j === 1)) return `en ${a}`;
  return `le ${j === 1 ? '1er' : j} ${MOIS[mo - 1]} ${a}`;
}
function phraseAlbum(a) {
  const mot = { album: 'Album', single: 'Single', ep: 'EP', compile: 'Compilation' }[a.type] || 'Album';
  const fem = a.type === 'compile';
  let p = mot;
  const date = dateLongue(a.date);
  if (date) p += ` sorti${fem ? 'e' : ''} ${date}`;
  if (a.label) p += ` chez ${a.label}`;
  p += '.';
  if (a.nb > 1) p += ` ${a.nb} titres${a.duree ? `, ${Math.round(a.duree / 60)} minutes` : ''}.`;
  if (a.genre) p += ` Au rayon ${a.genre.toLowerCase()}.`;
  return p;
}
function liensAilleurs(m) {
  const q = encodeURIComponent(`${Pochettes.artistePrincipal(m.artiste)} ${m.titre}`);
  const l = Pochettes.liens(m);
  return [
    ['YouTube Music', m.lien],
    ['Deezer', l.deezer || `https://www.deezer.com/search/${q}`],
    ['Apple Music', l.apple || `https://music.apple.com/fr/search?term=${q}`],
    ['Qobuz', `https://www.qobuz.com/fr-fr/search?q=${q}`],
    ['Bandcamp', m.bandcamp || `https://bandcamp.com/search?q=${q}&item_type=t`],
  ].map(([nom, url]) => `<a href="${E(url)}" target="_blank" rel="noopener">${nom}</a>`).join('');
}
function rendreLivret(ou, m, { force = false } = {}) {
  const el = $(`#livret-${ou}`);
  if (!el) return;
  if (!m) { el.hidden = true; el.dataset.id = ''; return; }
  el.hidden = false;
  const ouvert = S.livrets[ou];
  if (!force && el.dataset.id === m.id && el.dataset.ouvert === String(ouvert)) return;
  el.dataset.id = m.id;
  el.dataset.ouvert = String(ouvert);
  el.classList.toggle('ouvert', ouvert);
  const q = encodeURIComponent(`${Pochettes.artistePrincipal(m.artiste)} ${m.titre}`);
  el.innerHTML = `
    <button class="livret-bouton" data-action="livret" data-livret="${ou}" aria-expanded="${ouvert}">
      <span class="livret-icone" aria-hidden="true"><span></span></span>
      <span class="livret-bouton-texte"><strong>${ouvert ? 'Moins d\'infos' : 'Plus d\'infos'}</strong>
      <span>L'album, l'artiste, et où écouter « ${E(m.affiche)} » en entier</span></span>
    </button>
    ${ouvert ? `
    <button class="livret-fermer" data-action="fermer-livret" aria-label="Fermer les infos">×</button>
    <p class="livret-genre">${E(indice(m))}</p>
    <p class="livret-chronique" data-chronique="${m.id}"></p>
    <div class="livret-pages">
      <section class="livret-page" aria-label="L'album">
        <div class="livret-album" data-album-pour="${m.id}"><p class="livret-attente">On feuillette l'album…</p></div>
      </section>
      <section class="livret-page" aria-label="L'artiste">
        <div class="livret-artiste" data-artiste-pour="${m.id}"><p class="livret-attente">On cherche qui est derrière ce morceau…</p></div>
      </section>
    </div>
    <div class="livret-ailleurs">
      <p class="livret-ailleurs-titre">Écouter ce morceau en entier sur</p>
      <p class="ailleurs">${liensAilleurs(m)}</p>
      <p class="livret-paroles"><a class="lien-bouton" href="https://genius.com/search?q=${q}" target="_blank" rel="noopener">Les paroles sur Genius</a></p>
    </div>` : ''}`;
  if (ouvert) { remplirAlbum(el, m); remplirArtiste(el, m); remplirChronique(m); }
}
const pistesLivret = {};
// un titre de l'album qui est aussi dans la sélection : on peut le lancer en entier
function dansLaSelection(titre, artiste) {
  const t = N(titre), a = N(Pochettes.artistePrincipal(artiste));
  return BANQUE.find(x => N(x.titre) === t && (N(x.artiste).includes(a) || a.includes(N(Pochettes.artistePrincipal(x.artiste)))));
}
function remplirAlbum(el, m) {
  const ou = el.id.replace('livret-', '');
  Pochettes.album(m).then(a => {
    const corps = el.querySelector(`[data-album-pour="${m.id}"]`);
    if (!corps) return;
    if (!a) {
      corps.innerHTML = `<p class="livret-nom">${E(m.album || 'Album inconnu')}</p>
        <p class="livret-vide">${m.album ? 'C\'est l\'album d\'où vient ce morceau. ' : ''}Les catalogues n'en disent pas plus : ces disques-là se racontent chez les disquaires.</p>`;
      return;
    }
    const t = N(m.titre);
    pistesLivret[ou] = a.pistes;
    const pistes = a.pistes.length > 1 ? `<p class="pistes-aide">Touche un titre pour en écouter 30 secondes${a.pistes.some(p => dansLaSelection(p.titre, a.artiste || m.artiste)) ? ' (ceux marqués « en entier » sont dans la sélection)' : ''}.</p>
      <ol class="pistes">${a.pistes.slice(0, 40).map((p, i) => {
      const pt = N(p.titre);
      const ici = pt && t && (pt === t || pt.startsWith(t) || t.startsWith(pt));
      const sel = !ici && dansLaSelection(p.titre, a.artiste || m.artiste);
      const duree = p.duree ? `<span class="piste-duree">${minutes(p.duree)}</span>` : '';
      return ici
        ? `<li class="ici"><span class="piste-btn"><span class="piste-titre">${E(p.titre)}</span><span class="piste-note">en cours</span>${duree}</span></li>`
        : `<li><button class="piste-btn" data-action="piste" data-livret="${ou}" data-i="${i}"${sel ? ` data-id="${sel.id}"` : ''}><span class="piste-titre">${E(p.titre)}</span>${sel ? '<span class="piste-note">en entier</span>' : '<span class="piste-note piste-ecoute">30 s</span>'}${duree}</button></li>`;
    }).join('')}</ol>` : '';
    corps.innerHTML = `
      <div class="livret-album-tete">
        ${Pochettes.html(m, 'pochette-livret')}
        <div>
          <p class="livret-nom">${E(a.titre || m.album || '')}</p>
          <p class="livret-phrase">${E(phraseAlbum(a))}</p>
        </div>
      </div>
      <div class="livret-wiki" data-wiki hidden></div>
      ${pistes}
      ${a.liens.deezer || a.liens.apple ? `<p class="livret-liens">${a.liens.deezer ? `<a class="lien-bouton" href="${E(a.liens.deezer)}" target="_blank" rel="noopener">L'album sur Deezer</a>` : ''}${a.liens.apple ? `<a class="lien-bouton" href="${E(a.liens.apple)}" target="_blank" rel="noopener">L'album sur Apple Music</a>` : ''}</p>` : ''}`;
    Infos.oeuvre(a.titre || m.album || m.titre, a.artiste || m.artiste, a.type === 'single' ? 'chanson' : 'album', w => {
      const box = corps.querySelector('[data-wiki]');
      if (!box || !w) return;
      box.hidden = false;
      box.innerHTML = `<p>${E(w.extrait)}</p><a class="lien-bouton" href="${E(w.url)}" target="_blank" rel="noopener">Lire la suite sur Wikipédia</a>`;
    });
  });
}
const geniusArtiste = nom => `https://genius.com/search?q=${encodeURIComponent(nom)}`;
function remplirArtiste(el, m) {
  Infos.artiste(m.artiste, f => {
    const corps = el.querySelector(`[data-artiste-pour="${m.id}"]`);
    if (!corps) return;
    const nom = Pochettes.artistePrincipal(m.artiste);
    if (!f) {
      corps.innerHTML = `<p class="livret-nom">${E(nom)}</p>
        <p class="livret-vide">Pas de page Wikipédia en français sur ${E(nom)}. Sa page Genius raconte souvent qui se cache derrière.</p>
        <p class="livret-liens"><a class="lien-bouton lien-genius" href="${geniusArtiste(nom)}" target="_blank" rel="noopener">Sa page sur Genius</a>
        <a class="lien-bouton" href="https://music.youtube.com/search?q=${encodeURIComponent(nom)}" target="_blank" rel="noopener">Tout ${E(nom)} sur YouTube Music</a></p>`;
      return;
    }
    corps.innerHTML = `
      <div class="livret-artiste-tete">
        ${f.image ? `<img class="livret-photo" src="${E(f.image)}" alt="" loading="lazy">` : ''}
        <p class="livret-nom">${E(f.titre)}</p>
      </div>
      <p class="livret-texte">${E(f.extrait)}</p>
      <p class="livret-liens">
        <a class="lien-bouton" href="${E(f.url)}" target="_blank" rel="noopener">Lire la suite sur Wikipédia</a>
        <a class="lien-bouton" href="${geniusArtiste(nom)}" target="_blank" rel="noopener">Sa page sur Genius</a>
        <a class="lien-bouton" href="https://music.youtube.com/search?q=${encodeURIComponent(nom)}" target="_blank" rel="noopener">Tout ${E(nom)} sur YouTube Music</a>
      </p>`;
  });
}
function ouvrirLivret(ou, m) {
  S.livrets[ou] = true;
  rendreLivret(ou, m, { force: true });
  const el = $(`#livret-${ou}`);
  if (el) setTimeout(() => el.scrollIntoView({ behavior: doux, block: 'start' }), 60);
}

// la première fois qu'un morceau passe par YouTube : pourquoi des pubs, et comment s'en passer légalement
const AVIS_PUB = `
  <p class="avis-titre">Des pubs ?</p>
  <p>Je sais que c'est relou, mais c'est lié à YouTube. Si t'as YouTube Premium, il suffit de te connecter ; sinon, passe en mode extraits.</p>
  <div class="avis-actions">
    <button class="gros-bouton gros-bouton-plein" data-action="encart-ok">Compris</button>
    <button class="lien-bouton" data-action="encart-extraits">Passer en mode extraits</button>
  </div>`;
function majAvis() {
  const montrer = S.lecture === 'yt' && S.pub && !memoire.lire('md-encart-pub-v2', false);
  $$('[data-avis]').forEach(a => { if (montrer && !a.innerHTML.trim()) a.innerHTML = AVIS_PUB; a.hidden = !montrer; });
}

/* ─────────────────────────────── pré-écoutes (30 secondes d'un titre de l'album, dans le livret) ─────────────────────────────── */
const audioExtrait = $('#extrait');
const audioLecture = new Audio(); // sert au mode extraits, et quand un morceau refuse YouTube
audioLecture.setAttribute('playsinline', '');
let extraitPour = null;
function lancerExtraitPiste(p, cle, li) {
  arreterExtrait();
  extraitPour = cle;
  appliquerVolume();
  if (li) li.classList.add('ecoute');
  Pochettes.extraitPiste(p).then(url => {
    if (extraitPour !== cle) return;
    if (!url) { arreterExtrait(); toast('Pas d\'extrait pour ce titre.'); return; }
    audioExtrait.src = url;
    audioExtrait.volume = borner(S.volume / 100, 0, 1);
    audioExtrait.play().catch(() => arreterExtrait());
  });
}
function arreterExtrait() {
  if (!audioExtrait.paused) audioExtrait.pause();
  const avait = extraitPour;
  extraitPour = null;
  $$('.ecoute').forEach(b => b.classList.remove('ecoute'));
  if (avait) appliquerVolume();
}
audioExtrait.addEventListener('ended', arreterExtrait);
audioExtrait.addEventListener('error', () => { if (extraitPour) { arreterExtrait(); toast('Pas d\'extrait pour ce titre.'); } });
document.addEventListener('pochette-prete', e => {
  const id = e.detail;
  if (S.joue === id && S.vue === 'machine') majAfficheur();
  if (S.joue === id) majSalon();
  // une vraie pochette arrive pour un disque de la pile : on le repose avec
  if (S.vue === 'machine' && S.pile.some(p => p.m.id === id)) rendreTuner();
});

/* ─────────────────────────────── LE LECTEUR ─────────────────────────────── */
let lecteur = null, lecteurPret = false, enAttente = null, apiDemandee = false, demarrage = null;
function chargerAPI() {
  if (apiDemandee) return;
  apiDemandee = true;
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  s.onerror = () => panneAPI();
  document.head.appendChild(s);
  setTimeout(() => { if (!lecteurPret) panneAPI(); }, 12000);
}
// YouTube injoignable : on passe aux extraits pour ne pas rester bloqué
function panneAPI() {
  if (lecteurPret || apiEnPanne) return;
  apiEnPanne = true;
  toast('YouTube ne répond pas : on passe aux extraits de 30 secondes.', 4000);
  if (enAttente) { const m = enAttente; enAttente = null; if (S.joue === m.id) jouerExtraitComplet(m); }
}
window.onYouTubeIframeAPIReady = () => {
  lecteur = new YT.Player('yt-lecteur', {
    width: '100%', height: '100%',
    // lecteur youtube.com classique : un visiteur abonné à YouTube Premium n'a pas de pub
    playerVars: { playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, origin: location.origin.startsWith('http') ? location.origin : undefined },
    events: {
      onReady: () => {
        lecteurPret = true;
        apiEnPanne = false;
        if (enAttente) { const m = enAttente; enAttente = null; if (S.joue === m.id) jouerMorceau(m); }
      },
      onStateChange: e => {
        if (S.lecture !== 'yt') return;
        if (e.data === YT.PlayerState.PLAYING) { S.enLecture = true; S.aJoue = true; S.bloque = false; S.echecs = 0; clearTimeout(demarrage); appliquerVolume(); }
        if (e.data === YT.PlayerState.PAUSED) S.enLecture = false;
        if (e.data === YT.PlayerState.ENDED) { S.enLecture = false; finDuMorceau(); }
        majEtat();
      },
      onError: () => {
        const m = parId[S.joue];
        if (!m || S.lecture !== 'yt') return;
        clearTimeout(demarrage);
        S.injouables.set(m.yt, Date.now());
        memoire.ecrire('md-injouables-v2', Object.fromEntries(S.injouables));
        try { lecteur.stopVideo(); } catch (e) {}
        if (basculerSecours(m)) { jouerMorceau(m); return; }
        jouerExtraitComplet(m);
      }
    }
  });
};
// une pub avant le morceau : le lecteur tourne, mais le morceau reste à 0 seconde. On prévient (au-dessus de la chaîne)
let veillePub = null;
function surveillerPub(m, debut = 0) {
  clearInterval(veillePub);
  S.pub = false; majAvis();
  let immobile = 0, n = 0;
  veillePub = setInterval(() => {
    if (S.joue !== m.id || S.lecture !== 'yt' || ++n > 120) { clearInterval(veillePub); return; }
    let st = -1, t = 0;
    try { st = lecteur.getPlayerState(); t = lecteur.getCurrentTime() || 0; } catch (e) {}
    if (t > debut + 0.8) { clearInterval(veillePub); return; }
    if (st === YT.PlayerState.PLAYING || st === YT.PlayerState.BUFFERING) immobile++;
    if (immobile >= 5 && !S.pub) { S.pub = true; majAvis(); }
  }, 1000);
}
// une vidéo qui ne démarre jamais (lecture automatique bloquée, vidéo coincée) ne doit pas tout figer
function surveillerDemarrage(m) {
  clearTimeout(demarrage);
  let patience = 2;
  const verif = () => {
    if (S.joue !== m.id || S.lecture !== 'yt' || S.enLecture) return;
    let st = -1;
    try { st = lecteur.getPlayerState(); } catch (e) {}
    if (st === YT.PlayerState.PLAYING || st === YT.PlayerState.PAUSED) return;
    // une pub passe : on la laisse finir (jusqu'à deux minutes)
    if ((st === YT.PlayerState.BUFFERING || S.pub) && patience-- > (S.pub ? -18 : 0)) { demarrage = setTimeout(verif, 6000); return; }
    S.bloque = true;
    echecRadio(m, 'ne démarre pas');
    majEtat();
  };
  demarrage = setTimeout(verif, 9000);
}
// la version bonus ne passe pas (supprimée, intégration refusée…) : on prend la version classique et le commentaire qui va avec
function basculerSecours(m) {
  if (!m.secours || m.yt === m.secours.yt) return false;
  m.yt = m.secours.yt;
  return true;
}
function bonCommentaire(m, classique) {
  if (!m.secours) return;
  const note = classique || m.yt === m.secours.yt ? (m.secours.note || m.notePrincipale) : m.notePrincipale;
  if (note === m.note) return;
  m.note = note;
  const el = $('#post-it'); if (el) delete el.dataset.id;
  if (S.joue === m.id) majPostIt(m);
}
function jouerMorceau(m, debut = 0) {
  if (m.secours && S.injouables.has(m.yt)) basculerSecours(m);
  // certaines vidéos démarrent plus loin (ex. endlessly de Chanpan à 0:25)
  if (!debut && m.debut && m.yt === m.ytPrincipal) debut = num(m.debut, 0);
  arreterExtrait();
  clearTimeout(demarrage);
  S.joue = m.id;
  S.finTraitee = false;
  S.erreur = false;
  S.bloque = false;
  S.aJoue = false;
  audioLecture.pause();
  if (!jouable(m)) { jouerExtraitComplet(m); return; }
  bonCommentaire(m, false);
  S.lecture = 'yt';
  S.enLecture = false;
  $('#ecran-video').hidden = false;
  majVideo();
  if (!lecteurPret) { enAttente = m; chargerAPI(); majEtat(); return; }
  try { lecteur.loadVideoById(debut ? { videoId: m.yt, startSeconds: debut } : m.yt); } catch (e) {}
  appliquerVolume();
  surveillerDemarrage(m);
  surveillerPub(m, debut);
  majEtat();
}
function jouerExtraitComplet(m, essai = 0) {
  if (lecteur && lecteurPret) { try { lecteur.stopVideo(); } catch (e) {} }
  clearTimeout(demarrage);
  bonCommentaire(m, true); // l'extrait vient des plateformes : c'est la version classique
  S.lecture = 'extrait'; S.erreur = false; S.enLecture = false;
  majVideo(); majEtat();
  Pochettes.extraitFrais(m).then(url => {
    if (S.joue !== m.id || S.lecture !== 'extrait') return;
    if (!url) return extraitIntrouvable(m);
    audioLecture.dataset.id = m.id;
    audioLecture.dataset.essai = String(essai);
    audioLecture.src = url;
    appliquerVolume();
    audioLecture.play()
      .then(() => { S.enLecture = true; S.aJoue = true; S.bloque = false; S.echecs = 0; majEtat(); })
      .catch(err => {
        if (S.joue !== m.id) return;
        S.enLecture = false;
        // lecture automatique refusée par le navigateur : il faut un geste (appuyer sur lecture)
        if (err && err.name === 'NotAllowedError') { S.bloque = true; echecRadio(m, 'ne démarre pas'); }
        majEtat();
        // les autres erreurs (lien mort) arrivent par l'événement « error » ci-dessous
      });
  });
}
function extraitIntrouvable(m) {
  S.lecture = null; S.enLecture = false; S.erreur = true;
  majVideo(); majEtat();
  echecRadio(m, S.son === 'extraits' ? 'n\'a pas d\'extrait' : 'ne s\'écoute que sur YouTube Music');
}
// un extrait dont le lien est périmé : on en redemande un, une fois ; sinon on passe
audioLecture.addEventListener('error', () => {
  const id = audioLecture.dataset.id, m = parId[id];
  if (!m || S.joue !== id || S.lecture !== 'extrait') return;
  if (audioLecture.dataset.essai !== '1') {
    Pochettes.rafraichir(m).then(() => { if (S.joue === id && S.lecture === 'extrait') jouerExtraitComplet(m, 1); });
    return;
  }
  Pochettes.oublierExtrait(m, audioLecture.src);
  extraitIntrouvable(m);
});
audioLecture.addEventListener('ended', () => { if (S.lecture !== 'extrait') return; S.enLecture = false; majEtat(); finDuMorceau(); });
audioLecture.addEventListener('pause', () => { if (S.lecture === 'extrait') { S.enLecture = false; majEtat(); } });
audioLecture.addEventListener('play', () => { if (S.lecture === 'extrait') { S.enLecture = true; S.bloque = false; majEtat(); } });

function basculerLecture() {
  if (!S.joue) return;
  if (S.lecture === 'extrait') { if (audioLecture.paused) audioLecture.play().catch(() => {}); else audioLecture.pause(); return; }
  if (S.lecture === 'yt' && lecteurPret) {
    const st = lecteur.getPlayerState();
    if (st === YT.PlayerState.PLAYING) lecteur.pauseVideo(); else lecteur.playVideo();
  } else jouerMorceau(parId[S.joue]);
}
function finDuMorceau() {
  if (S.finTraitee) return;
  S.finTraitee = true;
  radioSuivant();
}
setInterval(() => {
  if (S.lecture !== 'yt' || !lecteurPret || S.finTraitee || !S.joue) return;
  try { if (lecteur.getPlayerState() === YT.PlayerState.ENDED) finDuMorceau(); } catch (e) {}
}, 1500);
function majSalon() {
  if (typeof Salon === 'undefined') return;
  const m = parId[S.joue];
  const im = m && Pochettes.image(m);
  Salon.maj({ joue: S.enLecture, bpm: m && m.bpm, energie: m ? m.energie : 5, pochette: im ? im.src : null });
}
function majEtat() {
  document.body.classList.toggle('en-lecture', S.enLecture);
  majSalon();
  $('#radio-icone').classList.toggle('pause', S.enLecture);
  majAvis();
  majVideo();
  if (S.vue === 'machine') majAfficheur();
}
function tempsActuel() {
  try {
    if (S.lecture === 'yt' && lecteurPret) return [lecteur.getCurrentTime() || 0, lecteur.getDuration() || 0];
    if (S.lecture === 'extrait') return [audioLecture.currentTime || 0, audioLecture.duration || 30];
  } catch (e) {}
  return [0, 0];
}

/* ─────────────────────────────── l'écran vidéo ─────────────────────────────── */
/* Règles du lecteur YouTube, respectées ici : la vidéo est toujours visible
   pendant qu'elle joue (jamais de lecture cachée), dans un cadre d'au moins
   200 × 200 pixels, sans rien posé par-dessus. Une seule vidéo, qui se pose
   sur la chaîne. Quand on descend, elle reste à sa place et la musique continue. */
function majVideo() {
  document.body.classList.toggle('video-machine', S.lecture === 'yt' && S.vue === 'machine');
  majGarde();
  placerEcranVideo();
}
let suiviRAF = null;
function emplacementCible() {
  if (!S.joue || S.lecture !== 'yt' || S.vue !== 'machine') return null;
  return $('[data-emplacement="machine"]');
}
function placerEcranVideo() {
  const ev = $('#ecran-video');
  const slot = emplacementCible();
  cancelAnimationFrame(suiviRAF);
  if (!slot) {
    ev.classList.add('cache');
    // garde-fou : une vidéo qui n'est pas à l'écran ne doit pas jouer
    if (S.lecture === 'yt' && S.enLecture && lecteurPret) { try { lecteur.pauseVideo(); } catch (e) {} }
    return;
  }
  ev.classList.remove('cache');
  const suivre = () => {
    const r = slot.getBoundingClientRect();
    ev.style.transform = `translate(${Math.round(r.left)}px, ${Math.round(r.top)}px)`;
    ev.style.width = r.width + 'px'; ev.style.height = r.height + 'px';
    suiviRAF = requestAnimationFrame(suivre);
  };
  suivre();
}
addEventListener('resize', majVideo);

// le temps qui passe : la chaîne, et la barre des extraits sur la platine
setInterval(() => {
  if (S.vue !== 'machine' || !S.joue || !S.lecture) return;
  const [t] = tempsActuel();
  $('#lcd-temps').textContent = $('#etq-temps').textContent = `${deux(t / 60)}:${deux(t % 60)}`;
  if (t >= 40 && S.enLecture) montrerAide();
}, 500);

/* ─────────────────────────────── LA CHAÎNE ET LE TUNER ───────────────────────────────
   La chaîne diffuse ; juste dessous, trois disques posés : le prochain titre, c'est toi
   qui le choisis (plus calme / dans la lignée / plus énergique, l'échelle change à chaque
   morceau). « J'aime bien » attire la suite vers ce morceau, « Pas trop comme ça » l'en
   éloigne (et passe au suivant).
   Le moteur (moteur.js) compare les fiches de data.js pour que chaque morceau mène
   au plus proche. */
const SOURCES = {
  radio:     { nom: 'La radio' },
  selection: { nom: 'Ma sélection' },
};
function poolSource() {
  const p = S.source === 'selection' ? S.gardes.map(id => parId[id]).filter(Boolean) : BANQUE;
  const ok = p.filter(ecoutable);
  return ok.length >= 3 ? ok : p;
}
/* l'équité de la radio : les morceaux du centre (ceux qui ressemblent à tout le monde) revenaient
   sans cesse, ceux des bords presque jamais. Chaque écoute est comptée dans ce navigateur :
   un morceau jamais entendu passe devant, un morceau très entendu recule, et l'écart
   s'efface avec le temps. */
const ECOUTES = memoire.lire('md-ecoutes', {});
function compterEcoute(m) {
  const e = ECOUTES[m.id] || { n: 0, t: 0 };
  e.n++; e.t = Date.now(); ECOUTES[m.id] = e;
  memoire.ecrire('md-ecoutes', ECOUTES);
}
function fraicheur(x) {
  const e = ECOUTES[x.id];
  if (!e) return -1.1;                                        // jamais entendu : il passe devant
  const jours = (Date.now() - e.t) / 864e5;
  return Math.min(1.6, 0.45 * Math.log2(1 + e.n)) - Math.min(0.9, jours / 10);
}
// ce que tu aimes attire, ce que tu n'aimes pas repousse (et ce que tu as peu entendu revient)
function gout(x) {
  let d = S.source === 'selection' ? 0 : fraicheur(x);
  S.aime.forEach(id => { const a = parId[id]; if (a && a !== x) d -= 0.7 * Math.exp(-Moteur.distance(a, x) / 2.6); });
  S.aimePas.forEach(id => { const a = parId[id]; if (a) d += 2.4 * Math.exp(-Moteur.distance(a, x) / 2.2); });
  return d;
}
/* l'anti-boucle : un morceau qui ressemble beaucoup aux trois d'avant recule, pour que la radio
   avance au lieu de tourner en rond dans un petit groupe (Great Fairy ↔ Moments ↔ Euryale ↔ Till) */
function echo(x) {
  if (S.source === 'selection') return 0;
  let e = 0;
  S.historique.slice(-4, -1).forEach(id => { const h = parId[id]; if (h && h !== x) e += Math.max(0, 1.8 - Moteur.distance(h, x)) * .7; });
  return e;
}
// les derniers morceaux joués ne reviennent jamais tout de suite, même dans une petite sélection
const derniersJoues = base => new Set(S.historique.slice(-Math.max(1, Math.min(12, base.length - 3))));
const score = (cur, x) => Moteur.distance(cur, x) + gout(x) + echo(x);
function parmiDeux(l) { return !l.length ? null : l.length === 1 || Math.random() < 0.72 ? l[0] : l[1]; }
/* la suite : les six prochains morceaux, calculés depuis celui qui passe.
   Chaque morceau mène au plus proche (ce que tu aimes attire) ;
   ta sélection passe dans l'ordre qui s'enchaîne le mieux. */
function construireSuite(depuis, n = 6) {
  const selection = S.source === 'selection';
  if (selection) {
    const ordre = Moteur.sequencer(poolSource(), { depart: depuis && S.gardes.includes(depuis.id) ? depuis : null }).map(m => m.id);
    const i = depuis ? ordre.indexOf(depuis.id) : -1;
    return [...ordre.slice(i + 1), ...ordre.slice(0, Math.max(0, i))].slice(0, n);
  }
  const recents = new Set(S.historique.slice(-40));
  const versionsRecentes = new Set(S.historique.slice(-12).map(id => parId[id] && parId[id].version));
  const base = poolSource().filter(m => (!depuis || (m.id !== depuis.id && m.version !== depuis.version)) && (selection || !S.aimePas.has(m.id)));
  let pool = base.filter(m => !recents.has(m.id) && !versionsRecentes.has(m.version));
  if (pool.length < n) { const garde = derniersJoues(base); pool = base.filter(m => !garde.has(m.id)); }
  if (pool.length < 2) pool = base;
  const suite = [];
  let cur = depuis || hasard(pool);
  if (!depuis && cur) { suite.push(cur.id); pool = pool.filter(m => m !== cur); }
  while (suite.length < n && pool.length) {
    const x = parmiDeux(pool.map(m => [m, score(cur, m)]).sort((a, b) => a[1] - b[1]).map(p => p[0]));
    if (!x) break;
    suite.push(x.id);
    pool = pool.filter(m => m !== x && m.version !== x.version);
    cur = x;
  }
  return suite;
}
/* la pile : trois disques posés sous la chaîne, pour choisir le prochain titre.
   Au milieu, celui qui s'enchaîne le mieux (« dans la lignée ») ; à gauche et à droite,
   un pas de chaque côté d'une même échelle : énergie, groove ou notoriété. L'échelle
   change à chaque morceau ; quand tu choisis un côté, la pile suivante garde la même,
   pour que tu puisses continuer dans ce sens. */
const AXES = [['calme', 'energique'], ['pose', 'dansant'], ['connu', 'confidentiel']];
const ETIQUETTES = { calme: 'plus calme', energique: 'plus énergique', pose: 'moins groovy', dansant: 'plus groovy', connu: 'plus mainstream', confidentiel: 'plus confidentiel' };
const axeDe = dir => AXES.findIndex(a => a.includes(dir));
function poolPile(cur) {
  const selection = S.source === 'selection';
  const recents = new Set(S.historique.slice(-40));
  const versionsRecentes = new Set(S.historique.slice(-12).map(id => parId[id] && parId[id].version));
  const base = poolSource().filter(m => m.id !== cur.id && m.version !== cur.version && (selection || !S.aimePas.has(m.id)));
  let pool = base.filter(m => !recents.has(m.id) && !versionsRecentes.has(m.version) && !S.dejaVus.has(m.id));
  if (pool.length < 6) pool = base.filter(m => !S.dejaVus.has(m.id) && !recents.has(m.id));
  const garde = derniersJoues(base);
  if (pool.length < 3) pool = base.filter(m => !S.dejaVus.has(m.id) && !garde.has(m.id));
  if (pool.length < 3) pool = base.filter(m => !garde.has(m.id));
  if (pool.length < 3) pool = base;
  return pool;
}
// le pilote automatique : un morceau sur deux fait un pas dans un sens (plus énergique, plus confidentiel…),
// l'autre reste tout près ; au bout de quatre morceaux, ou au bout de l'échelle, il change de sens
function prochainAuto(cur) {
  const pool = poolPile(cur);
  if (!pool.length) return null;
  S.autoPas++;
  if (!S.autoDir || S.autoPas > 4 || !Moteur.possible(cur, S.autoDir, pool, val)) {
    const avant = S.autoDir;
    const dirs = Object.keys(Moteur.DIRECTIONS).filter(d => (!avant || axeDe(d) !== axeDe(avant)) && Moteur.possible(cur, d, pool, val));
    S.autoDir = dirs.length ? hasard(dirs) : null;
    S.autoPas = 1;
  }
  const x = S.autoDir && S.autoPas % 2 === 0 ? Moteur.versDirection(cur, S.autoDir, pool, val, { gout }) : null;
  return x || parmiDeux(pool.map(m => [m, score(cur, m)]).sort((a, b) => a[1] - b[1]).map(p => p[0]));
}
function calculerPile(cur) {
  if (!cur) return [];
  const selection = S.source === 'selection';
  const pool = poolPile(cur);
  if (!pool.length) return [];
  // le milieu : ta sélection garde son ordre, la radio prend le plus proche
  let milieu = null;
  if (selection && !S.tirage) milieu = parId[construireSuite(cur, 1)[0]];
  if (!milieu || !pool.includes(milieu)) milieu = parmiDeux(pool.map(m => [m, score(cur, m)]).sort((a, b) => a[1] - b[1]).map(p => p[0]));
  const reste = pool.filter(x => x !== milieu && x.version !== milieu.version);
  const sauf = (l, m) => m ? l.filter(x => x !== m && x.version !== m.version) : l;
  const depart = (S.axeSuivi !== null ? S.axeSuivi : S.historique.length) + S.tirage;
  // une échelle où l'on peut aller des deux côtés
  for (let k = 0; k < 3; k++) {
    const [g, d] = AXES[(depart + k) % 3];
    const a = Moteur.versDirection(cur, g, reste, val, { gout });
    const b = a && Moteur.versDirection(cur, d, sauf(reste, a), val, { gout });
    if (a && b) return [{ m: a, dir: g }, { m: milieu, dir: null }, { m: b, dir: d }];
  }
  // tout au bout d'une échelle : on prend les deux pas possibles, d'où qu'ils viennent
  const cotes = [];
  let r = reste;
  for (let k = 0; k < 3 && cotes.length < 2; k++) for (const dir of AXES[(depart + k) % 3]) {
    if (cotes.length >= 2) break;
    const x = Moteur.versDirection(cur, dir, r, val, { gout });
    if (x) { cotes.push({ m: x, dir }); r = sauf(r, x); }
  }
  // et s'il manque encore un disque, un voisin
  while (cotes.length < 2 && r.length) { const x = r.sort((p, q) => score(cur, p) - score(cur, q))[0]; cotes.push({ m: x, dir: null }); r = sauf(r, x); }
  return cotes.length === 2 ? [cotes[0], { m: milieu, dir: null }, cotes[1]] : [...cotes, { m: milieu, dir: null }];
}
// la pile du morceau qui passe, et la suite qui part du disque choisi
function poserPile(cur, { garderAxe = true } = {}) {
  if (!garderAxe) S.axeSuivi = null;
  if (S.auto && cur) { const x = prochainAuto(cur); S.pile = x ? [{ m: x, dir: null }] : []; S.choix = 0; appliquerChoix(); return; }
  S.pile = calculerPile(cur);
  S.pile.forEach(p => S.dejaVus.add(p.m.id));
  S.choix = S.pile.length === 3 ? 1 : S.pile.length - 1;
  appliquerChoix();
}
function appliquerChoix() {
  const p = S.pile[S.choix];
  if (!p) { S.suite = construireSuite(parId[S.joue] || null); return; }
  S.suite = [p.m.id, ...construireSuite(p.m, 5).filter(id => id !== S.joue && id !== p.m.id)];
}
function rafraichirSuite() {
  S.dejaVus = new Set(); S.tirage = 0;
  poserPile(parId[S.joue] || null);
  rendreTuner();
  majAfficheur();
}
// choisir un disque : il passera ensuite ; le rechoisir le lance tout de suite
function choisirDisque(i) {
  if (!S.pile[i]) return;
  if (i === S.choix) { radioSuivant(); return; }
  S.choix = i;
  appliquerChoix();
  clic(900 + i * 300, 0.04, 0.05);
  rendreTuner(); majAfficheur();
}
// « Flemme de choisir » : le pilote automatique prend la main, ou te la rend
function basculerAuto() {
  S.auto = !S.auto; memoire.ecrire('md-auto', S.auto);
  S.autoDir = null; S.autoPas = 0; S.dejaVus = new Set(); S.tirage = 0;
  poserPile(parId[S.joue] || null);
  clic(S.auto ? 1300 : 700, 0.05, 0.06);
  rendreTuner({ repose: !S.auto }); majAfficheur();
}
// « Autres disques » : on repose la pile, avec d'autres morceaux (et une autre échelle)
function autresDisques() {
  const cur = parId[S.joue];
  if (!cur) return;
  S.tirage++;
  poserPile(cur);
  clic(380, 0.12, 0.06);
  rendreTuner({ repose: true }); majAfficheur();
}

/* le disque dans le tiroir : la radio (holographique), ma sélection (CD-R) */
function disqueHTML(k, extra = '') {
  if (k === 'selection') return `<span class="disque disque-compil ${extra}"><span class="disque-main">Ma sélection</span></span>`;
  return `<span class="disque disque-hasard ${extra}"><span class="disque-nom">La radio<small>Music Discovery</small></span></span>`;
}
/* le disque imprimé : la pochette du morceau qui passe, en picture disc */
function majDisque() {
  const d = $('#disque-tiroir');
  const m = parId[S.joue];
  const img = m && Pochettes.image(m);
  if (!d) return;
  d.classList.toggle('disque-image', !!img);
  d.classList.toggle('disque-yt', !!(img && img.yt));
  if (img) d.style.setProperty('--pochette', `url("${img.src.replace(/"/g, '%22')}")`);
  else d.style.removeProperty('--pochette');
}
// une spirale, pour la vitesse « hypno », et l'anneau stroboscopique du disque
(function () {
  let p = 'M50 50';
  for (let a = 0; a < Math.PI * 2 * 7; a += 0.12) { const r = 2 + a * 1.08; p += `L${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`; }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${p}' fill='none' stroke='white' stroke-width='2.6' stroke-linecap='round'/></svg>`;
  let dots = '';
  for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2; dots += `<circle cx='${(50 + 48.6 * Math.cos(a)).toFixed(2)}' cy='${(50 + 48.6 * Math.sin(a)).toFixed(2)}' r='${k % 5 ? 0.55 : 0.85}'/>`; }
  const strobe = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='rgba(255,255,255,.85)'>${dots}</svg>`;
  document.documentElement.style.setProperty('--strobe', `url("data:image/svg+xml,${encodeURIComponent(strobe)}")`);
  document.documentElement.style.setProperty('--spirale', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
})();
let tiroirMin = [];
function poserDisque(k) {
  const d = $('#disque-tiroir');
  const tmp = document.createElement('div');
  tmp.innerHTML = disqueHTML(k, 'disque-tiroir');
  const nv = tmp.firstElementChild;
  nv.id = 'disque-tiroir';
  d.replaceWith(nv);
  majDisque();
}
// changer de disque : le tiroir s'ouvre, le disque se pose, le tiroir se referme
function chargerTiroir(k) {
  tiroirMin.forEach(clearTimeout); tiroirMin = [];
  const t = $('#tiroir');
  if (reduitMouvement) { poserDisque(k); majAfficheur(); return; }
  document.body.classList.add('lecture-disque');
  t.classList.add('ouvert'); t.classList.remove('pose');
  clic(300, 0.18, 0.05);
  tiroirMin.push(setTimeout(() => { poserDisque(k); t.classList.add('pose'); clic(700, 0.05, 0.05); }, 330));
  tiroirMin.push(setTimeout(() => { t.classList.remove('ouvert'); clic(320, 0.16, 0.05); }, 720));
  tiroirMin.push(setTimeout(() => { t.classList.remove('pose'); document.body.classList.remove('lecture-disque'); majAfficheur(); }, 1150));
  majAfficheur();
}
function choisirSource(k) {
  if (!SOURCES[k]) return;
  if (k === 'selection' && S.gardes.length < 2) { toast('Garde au moins deux morceaux (♥ J\'aime bien) pour écouter ta sélection.', 4200); return; }
  if (k === S.source && S.joue) return;
  // on note où on en était, pour y revenir pile au même endroit
  if (S.joue) { const [t] = tempsActuel(); S.reprise[S.source] = { id: S.joue, t: S.lecture === 'yt' && t > 5 ? Math.floor(t) : 0 }; memoire.ecrire('md-reprise', S.reprise); }
  S.source = k;
  memoire.ecrire('md-source', k);
  S.axeSuivi = null;
  const r = S.reprise[k];
  const ok = r && parId[r.id] && r.id !== S.joue && (k === 'radio' || S.gardes.includes(r.id));
  chargerTiroir(k);
  if (ok) jouerRadio(r.id, { debut: r.t });
  else { const premier = construireSuite(null, 1)[0]; if (premier) jouerRadio(premier); }
}

/* jouer : le morceau passe, la suite se recalcule depuis lui */
function jouerRadio(id, { debut = 0 } = {}) {
  const m = parId[id];
  if (!m) return;
  S.livrets.machine = false;
  croiser(m.id);
  if (S.historique[S.historique.length - 1] !== m.id) { S.historique.push(m.id); compterEcoute(m); }
  memoire.ecrire('md-historique', S.historique.slice(-60));
  jouerMorceau(m, debut);
  if (++S.joues >= 2) setTimeout(montrerAide, 4000);
  // on a choisi un côté de la pile : la suivante garde la même échelle pour continuer dans ce sens
  const pris = S.pile.find(p => p.m.id === m.id);
  S.axeSuivi = pris && pris.dir ? axeDe(pris.dir) : null;
  S.dejaVus = new Set(); S.tirage = 0;
  poserPile(m);
  rendreTuner();
  majMachine();
}
function radioSuivant() {
  if (!S.suite.length) S.suite = construireSuite(parId[S.joue] || null);
  const id = S.suite[0];
  clic(1400);
  if (id) jouerRadio(id);
}
function radioPrecedent() {
  const [t] = tempsActuel();
  if (S.joue && t > 5) {
    try { if (S.lecture === 'yt') lecteur.seekTo(0, true); else audioLecture.currentTime = 0; } catch (e) {}
    clic(1100); return;
  }
  if (S.historique.length >= 2) { S.historique.pop(); const id = S.historique.pop(); clic(1100); jouerRadio(id); }
}
function radioLecture() {
  S.echecs = 0;
  if (S.joue && S.lecture) basculerLecture();
  else jouerRadio(S.joue || construireSuite(null, 1)[0]);
  clic(600, 0.06, 0.07);
}
function radioStop() {
  if (!S.joue) return;
  S.finTraitee = true;
  clearTimeout(demarrage);
  try { if (S.lecture === 'yt') lecteur.stopVideo(); } catch (e) {}
  audioLecture.pause();
  S.enLecture = false; S.lecture = null; S.bloque = false;
  clic(500, 0.05, 0.06);
  majEtat(); majMachine();
}
// un morceau qui ne veut pas se lire : on essaie l'extrait, sinon on passe ; au bout de 3 ratés d'affilée, on s'arrête
function echecRadio(m, raison) {
  if (S.joue !== m.id) return;
  S.echecs++;
  if (S.echecs >= 3) {
    S.echecs = 0;
    radioStop();
    toast('Trois morceaux de suite ne démarrent pas. Vérifie ta connexion, puis appuie sur lecture.', 6000);
    return;
  }
  if (S.lecture === 'yt' && Pochettes.etat(m) === 'ok' && !S.bloque) { jouerExtraitComplet(m); return; }
  toast(`${m.affiche} ${raison}. On passe au suivant.`);
  setTimeout(() => { if (S.joue === m.id) radioSuivant(); }, 1500);
}

/* l'avis du visiteur sur le morceau qui passe */
function aimer(id) { basculerGarde(id); }
function pasAime(id) {
  if (!id) return;
  S.aimePas.add(id); S.aime.delete(id);
  memoire.ecrire('md-aime', [...S.aime]); memoire.ecrire('md-aime-pas', [...S.aimePas]);
  toast('Compris, on s\'éloigne de ce genre-là.');
  S.suite = construireSuite(parId[id]);
  radioSuivant();
}
/* les petits réglages inutiles : couleur de l'écran, égaliseur, vitesse, loudness */
function appliquerFidget() {
  const f = S.fidget;
  document.documentElement.dataset.lcd = f.lcd;
  document.body.dataset.eq = f.eq;
  document.body.dataset.vitesse = f.vitesse;
  document.body.classList.toggle('loudness', !!f.loudness);
  document.body.classList.toggle('grilles', !!f.grilles);
  document.body.dataset.dimmer = f.dimmer;
  document.body.dataset.lumieres = f.lumieres;
  $$('#trappe [data-action="fidget"]').forEach(b => {
    const v = INTERRUPTEURS.includes(b.dataset.cle) ? String(!!f[b.dataset.cle]) : String(String(f[b.dataset.cle]) === b.dataset.val);
    b.setAttribute(b.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-pressed', v);
  });
  const g = $('.glissiere'); if (g) g.style.setProperty('--pos', ['33', '45', 'hypno'].indexOf(f.vitesse));
}
const INTERRUPTEURS = ['loudness', 'grilles', 'bip'];
function bidouiller(b) {
  const cle = b.dataset.cle;
  if (INTERRUPTEURS.includes(cle)) S.fidget[cle] = !S.fidget[cle];
  else S.fidget[cle] = b.dataset.val;
  memoire.ecrire('md-fidget', S.fidget);
  appliquerFidget();
  const sons = { lcd: [2200, 0.02, 0.05], eq: [1500, 0.03, 0.05], vitesse: [420, 0.07, 0.07], loudness: [180, 0.09, 0.08], grilles: [260, 0.1, 0.07], dimmer: [1900, 0.02, 0.05], lumieres: [1200, 0.04, 0.05], bip: [2400, 0.03, 0.06] };
  if (cle === 'bip' && !S.fidget.bip) { S.fidget.bip = true; clic(2400, 0.03, 0.06); S.fidget.bip = false; }
  clic(...(sons[cle] || [1500, 0.03, 0.05]));
  if (cle === 'vitesse' && !S.enLecture) toast('Lance un morceau pour voir le disque tourner.');
}
/* la pile : ta sélection ou la radio, puis les trois disques */
function rendreTuner({ repose = false } = {}) {
  const m = parId[S.joue];
  // la radio ou ta sélection : seulement quand ta sélection a au moins deux morceaux
  const so = $('#sources');
  so.hidden = S.gardes.length < 2;
  if (!so.hidden) so.innerHTML = Object.entries(SOURCES).map(([k, x]) => `<button class="source-choix" data-action="source-chaine" data-source="${k}" aria-pressed="${S.source === k}">${x.nom}${k === 'selection' ? ` <b>${S.gardes.length}</b>` : ''}</button>`).join('');
  const el = $('#pile-disques');
  $('#tuner').classList.toggle('en-auto', S.auto);
  $('#pile-autres').hidden = !m || S.pile.length < 2 || S.auto;
  $('#pile-flemme').hidden = S.auto;
  $('#pile-titre').hidden = S.auto && !!m;
  if (S.auto && m) {
    const p = S.pile[0];
    el.innerHTML = `<div class="pilote">
      <span class="pilote-led" aria-hidden="true"></span>
      <div class="pilote-textes"><b>Pilote automatique</b>${p ? `<span><i>${E(p.m.affiche)}</i>, ${E(p.m.artiste)}</span>` : ''}</div>
      <button class="pilote-stop" data-action="auto">Reprendre la main</button>
    </div>`;
    majPostIt(m); majGarde();
    return;
  }
  if (!m || !S.pile.length) {
    el.innerHTML = `<p class="pile-vide">${m ? 'Plus rien à poser ici : la radio continue toute seule.' : 'Appuie sur lecture : trois disques t\'attendront ici pour choisir la suite.'}</p>`;
    majPostIt(m); majGarde();
    return;
  }
  el.classList.toggle('repose', repose);
  el.innerHTML = S.pile.map((p, i) => disquePile(p, i)).join('');
  if (repose) { void el.offsetWidth; }
  majPostIt(m);
  majGarde();
}
/* sans vraie pochette, on en fabrique une, façon label de disques : une image de la vidéo
   en bichromie et le titre composé en grand. Trois maquettes (et une couleur par morceau) */
function pochetteMaison(m) {
  const h = hache(m.id);
  const modele = ['bleue', 'blanche', 'bandeau'][h % 3];
  const titre = String(m.titre).replace(/\s*[([].*?[)\]]\s*/g, ' ').trim() || m.titre;
  const artiste = Pochettes.artistePrincipal(m.artiste);
  // la taille du titre : le mot le plus long doit tenir sur une ligne, et le tout sur trois lignes
  const mots = Math.max(...titre.split(/\s+/).map(w => w.length));
  const t = Math.max(5, Math.min(15, 74 / mots, 240 / titre.length)).toFixed(2);   // capitales larges
  const tb = Math.max(5.5, Math.min(12, 118 / mots, 340 / titre.length)).toFixed(2); // texte courant
  const photo = m.yt ? `<img class="maison-photo" src="https://i.ytimg.com/vi/${E(m.yt)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">` : '';
  return `<span class="maison maison-${modele}" aria-hidden="true" style="--h:${h % 360};--t:${t};--tb:${tb}">
    <span class="maison-cadre">${photo}</span>
    <span class="maison-titre"><span>${E(titre)}</span></span>
    <span class="maison-artiste">${E(artiste)}${m.annee && artiste.length < 18 ? ` · ${E(m.annee)}` : ''}</span>
  </span>`;
}
// un disque de la pile : la vraie pochette si on l'a, sinon une pochette maison
function disquePile({ m, dir }, i) {
  const choisi = i === S.choix;
  const mot = dir ? ETIQUETTES[dir] : 'dans la lignée';
  const im = Pochettes.image(m);
  const officielle = im && !im.yt;
  const penche = [-2.4, 1.2, 2.2][i % 3] + ((hache(m.id) % 5) - 2) * 0.4;
  return `<div class="disque-pile${choisi ? ' choisi' : ''}" data-id="${m.id}" data-dir="${dir || ''}" style="--penche:${penche.toFixed(1)}deg;--i:${i}">
    <button class="pile-boite" data-action="choisir-disque" data-i="${i}" role="radio" aria-checked="${choisi}" aria-label="${E(mot)} : ${E(m.affiche)}, ${E(m.artiste)}${choisi ? ' (passe ensuite, rappuie pour l\'écouter maintenant)' : ''}">
      <span class="pile-scotch" aria-hidden="true">${E(mot)}</span>
      ${officielle ? Pochettes.html(m, 'pochette-pile') : pochetteMaison(m)}
      <span class="pile-reflet" aria-hidden="true"></span>
    </button>
    <p class="pile-morceau"><span class="pile-titre-m">${E(m.affiche)}</span><span class="pile-artiste">${E(m.artiste)}</span></p>
    ${choisi ? `<button class="pile-maintenant" data-action="radio-suivant" title="Passer au suivant (→)"><span><span class="pile-maintenant-long">Écouter </span>maintenant</span><span class="icone icone-suiv" aria-hidden="true"></span></button>` : ''}
  </div>`;
}
// ton mot sur le morceau : un post-it collé sur l'enceinte de droite (sous la chaîne sur petit écran)
// la typographie française : jamais de « : », « ? », « ! » ou « » » seul en début de ligne,
// jamais de virgule après une espace, et le dernier mot ne reste pas seul sur sa ligne
const FINE = '\u202F', INSECABLE = '\u00A0';
function typoFr(t) {
  return String(t)
    .replace(/\s+([,.…])/g, '$1')
    .replace(/\s*([;!?»])/g, (x, p, i, s) => (i > 0 && !/\s/.test(s[i - 1]) && p !== '»' && !/\s/.test(x[0]) ? p : FINE + p))
    .replace(/\s+:/g, INSECABLE + ':')
    .replace(/«\s*/g, '«' + FINE)
    .replace(/(\S+) (\S{1,12})$/, '$1' + INSECABLE + '$2')
    .replace(/^\u202F/, '');
}
function majPostIt(m) {
  const el = $('#post-it');
  const note = m && m.note ? m.note.trim() : '';
  if (el.dataset.id === (m ? m.id : '') && !el.hidden === !!note) return;
  el.dataset.id = m ? m.id : '';
  el.hidden = !note;
  if (!note) return;
  $('#post-it-texte').innerHTML = E(typoFr(note)).replace(/\n/g, '<br>');
  el.classList.toggle('long', note.length > 80);
  placerPostIt();
  el.style.setProperty('--dx', '0px'); el.style.setProperty('--dy', '0px');
  el.style.setProperty('--penche', `${((hache(m.id) % 7) - 3.5) * .5}deg`);
  el.classList.remove('colle'); void el.offsetWidth; el.classList.add('colle');
}
function placerPostIt() {
  const el = $('#post-it'), sp = $('.hifi-enceinte-d'), h = $('.hifi');
  if (el.hidden) return;
  if (innerWidth < 1240 || !sp.offsetWidth) { el.style.top = el.style.right = ''; return; }
  const a = sp.getBoundingClientRect(), b = h.getBoundingClientRect();
  el.style.top = `${Math.round(a.top - b.top + a.height * 0.17)}px`;
  el.style.right = `${Math.round(b.right - a.right + (a.width - el.offsetWidth) / 2)}px`;
}
if ('ResizeObserver' in window) new ResizeObserver(() => placerPostIt()).observe($('.hifi'));
addEventListener('resize', placerPostIt);
if (document.fonts) document.fonts.ready.then(placerPostIt);
const hache = t => [...String(t)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
// quelques mots sur le titre, sinon l'album, sinon l'artiste : en français, sans les phrases de catalogue
function remplirChronique(m) {
  Pochettes.album(m).then(a => Infos.chronique(m, a && a.titre, c => {
    const p = $(`[data-chronique="${m.id}"]`);
    if (!p || !c) return;
    p.innerHTML = `${E(c.texte)} <a class="chronique-source" href="${E(c.url)}" target="_blank" rel="noopener">Sur ${E(c.de)}, d'après Wikipédia</a>`;
    p.classList.add('pret');
  }));
}
// le bouton « Cosmétique » : il déplie tous les petits réglages, et les replie
function basculerCosmetique(force) {
  const ouvre = typeof force === 'boolean' ? force : !document.body.classList.contains('cosmetique');
  document.body.classList.toggle('cosmetique', ouvre);
  $$('[data-action="cosmetique"]').forEach(b => b.setAttribute('aria-expanded', ouvre));
  clic(ouvre ? 520 : 380, 0.08, 0.06);
}
function choisirAffichage(v) {
  S.affichage = v === 'ecran' ? 'ecran' : 'disque';
  memoire.ecrire('md-affichage-v2', S.affichage);
  document.body.dataset.affichage = S.affichage;
  $$('.choix-affichage [data-val]').forEach(b => b.setAttribute('aria-checked', b.dataset.val === S.affichage));
  clic(S.affichage === 'ecran' ? 1700 : 600, 0.04, 0.05);
}
function entrerMachine() {
  rendreTuner();
  if (!$('#tiroir').classList.contains('ouvert')) poserDisque(S.source);
  aller('machine');
  majMachine();
}
function majMachine() {
  const m = parId[S.joue];
  majAfficheur();
  majGarde();
  S.suite.slice(0, 4).forEach(x => Pochettes.demander(parId[x]));
  majDisque();
  if (m) Pochettes.demander(m, () => { if (S.joue === m.id) majDisque(); });
  rendreLivret('machine', m);
  placerEcranVideo();
}
function texteLCD(el, texte) {
  if (el.textContent === texte) return;
  el.textContent = texte;
  el.style.animationDuration = `${Math.max(8, texte.length * 0.3)}s`;
  const boite = el.parentElement;
  boite.classList.add('fixe');
  requestAnimationFrame(() => { if (el.scrollWidth > boite.clientWidth + 2) boite.classList.remove('fixe'); });
}
function majEtiquette(m, active) {
  $('#etq-piste').textContent = m ? `PISTE ${deux(S.historique.length)} · ${S.source === 'selection' ? 'MA SÉLECTION' : 'LA RADIO'}` : 'PISTE --';
  $('#etq-titre').textContent = m ? m.affiche : 'Appuie sur lecture';
  $('#etq-artiste').textContent = m ? m.artiste : '';
  const e = parId[S.suite[0]];
  $('#etq-ensuite').textContent = e ? `Ensuite : ${e.affiche}` : '';
  if (!active) $('#etq-temps').textContent = '--:--';
}
function majAfficheur() {
  const m = parId[S.joue];
  const active = !!m && !!S.lecture;
  const lecture = document.body.classList.contains('lecture-disque');
  $('#lcd-disque').textContent = SOURCES[S.source].nom.toUpperCase();
  $('#lcd-piste').textContent = m ? deux(S.historique.length) : '--';
  const texte = lecture ? 'READING' : m ? `${m.affiche} · ${m.artiste}${active && S.lecture === 'extrait' ? ' (extrait)' : ''}` : 'APPUIE SUR LECTURE';
  texteLCD($('#lcd-texte'), texte);
  majEtiquette(m, active);
  $('#lcd-etat').textContent = lecture ? 'READ' : !active ? 'STOP' : S.bloque ? 'APPUIE SUR ▶' : S.enLecture ? '▶ PLAY' : S.aJoue ? 'II PAUSE' : 'LOAD';
  const ensuite = parId[S.suite[0]];
  $('#lcd-ensuite').textContent = ensuite && !lecture ? `ENSUITE ${ensuite.affiche}` : '';
  if (!active) $('#lcd-temps').textContent = '--:--';
  const ms = $('#machine-source');
  const src = active && S.lecture === 'extrait' ? Pochettes.source(m) : null;
  ms.hidden = !src && !(active && S.bloque);
  if (active && S.bloque) ms.textContent = 'La lecture ne démarre pas toute seule : appuie sur lecture.';
  else if (src) ms.innerHTML = `Extrait de 30 secondes.${src.lien ? ` <a href="${E(src.lien)}" target="_blank" rel="noopener">En entier sur ${src.nom}</a>` : ''}`;
  document.body.classList.toggle('cd-tourne', active && S.enLecture);
  document.body.classList.toggle('energie-forte', !!m && num(m.energie, 5) >= 8);
  document.body.classList.toggle('chaine-allumee', true);
  if (m && m.bpm) document.body.style.setProperty('--battement', `${(60 / (m.bpm > 140 ? m.bpm / 2 : m.bpm)).toFixed(3)}s`);
  lancerSpectre();
}
/* le petit égaliseur de l'écran : il bat au tempo du morceau (on ne peut pas analyser
   le son de YouTube, alors il danse d'après la fiche : tempo et énergie) */
const BARRES = 18;
$('#lcd-spectre').innerHTML = '<i></i>'.repeat(BARRES);
const barres = $$('#lcd-spectre i');
const pics = new Array(BARRES).fill(0);
let spectreRAF = null, spectreDernier = 0;
function lancerSpectre() {
  if (spectreRAF || reduitMouvement) return;
  if (S.vue !== 'machine' || !S.enLecture) return;
  spectreRAF = requestAnimationFrame(animerSpectre);
}
function animerSpectre(t) {
  if (S.vue !== 'machine' || !S.enLecture) {
    spectreRAF = null;
    barres.forEach((b, i) => { b.style.setProperty('--h', '0.06'); pics[i] = 0; b.style.setProperty('--pic', 0); });
    majVU(0, 0);
    return;
  }
  spectreRAF = requestAnimationFrame(animerSpectre);
  if (t - spectreDernier < 55) return;
  spectreDernier = t;
  const m = parId[S.joue] || {};
  const bpm = m.bpm || 100, e = Math.min(1, num(m.energie, 5) / 10 + (S.fidget.loudness ? 0.18 : 0));
  const temps = (t / 60000) * (bpm > 150 ? bpm / 2 : bpm);
  const coup = Math.pow(1 - (temps % 1), 3);
  barres.forEach((b, i) => {
    const f = i / (BARRES - 1);
    const base = (0.22 + 0.5 * e) * (1 - f * 0.5);
    const bruit = 0.5 + 0.5 * Math.sin(t / (85 + i * 11) + i * 1.9) * Math.sin(t / (230 + i * 17) + i);
    const h = Math.max(0.06, Math.min(1, base * (0.5 + 0.55 * bruit) + coup * (1 - f) * 0.38 * (0.4 + e) + Math.random() * 0.07));
    pics[i] = Math.max(h, pics[i] - 0.035);
    b.style.setProperty('--h', h.toFixed(2));
    b.style.setProperty('--pic', ((pics[i] - h) * 52).toFixed(1));
  });
  majVU(...niveaux());
}
// les vumètres des enceintes : les graves à gauche, les aigus à droite
const vus = $$('.hp-vu').map(v => [...v.children]);
function niveaux() {
  const h = barres.map(b => +b.style.getPropertyValue('--h') || 0);
  const moy = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
  return [moy(h.slice(0, 6)), moy(h.slice(9))];
}
function majVU(g, d) {
  vus.forEach((segs, k) => {
    const n = Math.round(Math.min(1, (k ? d : g) * 1.15) * segs.length);
    segs.forEach((b, i) => b.classList.toggle('on', i < n));
  });
}
/* ─────────────────────────────── MES TROUVAILLES / RÉGLAGES (panneaux) ─────────────────────────────── */
function ouvrirPanneau(id) {
  fermerPanneaux(true);
  if (id === 'bac') rendreBac();
  $('#voile').hidden = false;
  $('#' + id).hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('panneau-ouvert')));
}
function fermerPanneaux(immediat) {
  document.body.classList.remove('panneau-ouvert');
  const cacher = () => { $('#voile').hidden = true; $('#bac').hidden = true; $('#reglages').hidden = true; };
  if (immediat === true || reduitMouvement) cacher(); else setTimeout(cacher, 320);
}
function rendreBac() {
  $('#n-gardes').textContent = S.gardes.length;
  $('#n-croises').textContent = S.croises.length;
  $$('#bac .onglet').forEach(o => o.setAttribute('aria-selected', o.dataset.onglet === S.onglet));
  const ids = S.onglet === 'gardes' ? S.gardes : S.croises;
  $('#bac-liste').innerHTML = !ids.length
    ? `<li class="bac-vide">${S.onglet === 'gardes'
        ? 'Rien dans ta sélection pour l\'instant. Quand un morceau te plaît, appuie sur « ♥ J\'aime bien ».'
        : 'Tout ce qui passe dans la chaîne s\'inscrit ici.'}</li>`
    : S.onglet === 'gardes' ? ids.map(id => {
        const m = parId[id];
        const incl = ((hache(id) % 9) - 4) * 0.9;
        return `<li class="boitier" style="--incl:${incl}deg">
          <button class="boitier-morceau" data-action="ouvrir" data-id="${m.id}" title="Écouter ${E(m.affiche)}">
            <span class="boitier-cd"><span class="boitier-disque" aria-hidden="true"></span><span class="boitier-etui"><span class="boitier-dos" aria-hidden="true"></span>${Pochettes.html(m, 'pochette-mini')}<span class="boitier-reflet" aria-hidden="true"></span></span></span>
            <span class="boitier-titre">${E(m.affiche)}</span><span class="boitier-artiste">${E(m.artiste)}</span>
          </button>
          <button class="boitier-retirer" data-action="garder" data-id="${m.id}" aria-label="Retirer de ma sélection : ${E(m.affiche)}" title="Retirer de ma sélection">♥</button>
        </li>`;
      }).join('')
    : ids.map(id => {
        const m = parId[id];
        return `<li class="bac-ligne">
          <button class="bac-morceau" data-action="ouvrir" data-id="${m.id}">
            ${Pochettes.html(m, 'pochette-mini')}
            <span><span class="bac-titre">${E(m.affiche)}</span><span class="bac-artiste">${E(m.artiste)}</span></span>
          </button>
          <button class="bac-garder ${estGarde(m.id) ? 'est-garde' : ''}" data-action="garder" data-id="${m.id}" aria-label="${estGarde(m.id) ? 'Retirer de ma sélection' : 'Ça, j\'aime bien'} : ${E(m.affiche)}" title="${estGarde(m.id) ? 'Retirer de ma sélection' : 'Ça, j\'aime bien'}">${estGarde(m.id) ? '♥' : '♡'}</button>
        </li>`;
      }).join('');
  $('#bac-liste').classList.toggle('etagere', S.onglet === 'gardes' && !!S.gardes.length);
  $('#bac-pied').hidden = S.onglet !== 'gardes' || !S.gardes.length;
  const avecYt = S.gardes.map(id => parId[id].yt).filter(Boolean).slice(0, 50);
  $('#lien-playlist').href = `https://www.youtube.com/watch_videos?video_ids=${avecYt.join(',')}`;
}
async function copierListe() {
  const txt = S.gardes.map(id => { const m = parId[id]; return `${m.titre}, ${m.artiste}  ${m.lien}`; }).join('\n');
  try { await navigator.clipboard.writeText('Ma sélection sur Music Discovery\n\n' + txt); toast('Liste copiée : colle-la dans un outil d\'import de playlist (TuneMyMusic, Soundiiz…).', 4500); }
  catch (e) { toast('Copie impossible dans ce navigateur.'); }
}

/* ─────────────────────────────── COMMENT ÉCOUTER ─────────────────────────────── */
function majSon() { $$('.choix-son').forEach(b => b.setAttribute('aria-checked', b.dataset.son === S.son)); }
function choisirSon(son) {
  if (son === S.son) return;
  S.son = son;
  memoire.ecrire('md-son', son);
  majSon();
  toast(son === 'extraits' ? 'Mode extraits : 30 secondes par morceau, sans pub.' : 'Morceaux complets, via YouTube.');
  if (S.joue) jouerMorceau(parId[S.joue]);
}

/* ─────────────────────────────── TEINTES ─────────────────────────────── */
const TEINTES = [
  { id: 'salon',  nom: 'Salon',  couleur: '#dcdbd8', pastille: 'conic-gradient(#1b3cc4 0 33%, #9a5f34 0 66%, #dcdbd8 0)' },
  { id: 'nuit',   nom: 'Nuit',   couleur: '#141318', pastille: 'conic-gradient(#5470ff 0 33%, #6e4122 0 66%, #141318 0)' },
  { id: 'papier', nom: 'Papier', couleur: '#dfe4d7', pastille: 'linear-gradient(135deg, #dfe4d7 50%, #1d2a4d 50%)' },
];
// anciennes teintes (avant la v0.6) : on retombe sur la plus proche
const ANCIENNES = { ambre: 'nuit', signal: 'salon', vide: 'salon', fievre: 'salon' };
const teinteChoisie = memoire.lire('md-teinte-v5', null);
let teinteActive = teinteChoisie ? (ANCIENNES[teinteChoisie] || teinteChoisie)
  : (matchMedia('(prefers-color-scheme: dark)').matches ? 'nuit' : 'salon'); // sans choix : comme le téléphone
function rendreTeintes() {
  const html = TEINTES.map(t => `<button class="pastille" role="radio" data-action="teinte" data-teinte="${t.id}" aria-checked="${t.id === teinteActive}" aria-label="Teinte ${t.nom}" title="${t.nom}"><span style="background:${t.pastille}"></span><em>${t.nom}</em></button>`).join('');
  $('#teintes-facade').innerHTML = html;
  $('#teintes-reglages').innerHTML = html;
}
function appliquerTeinte(id, choisie) {
  const t = TEINTES.find(x => x.id === id) || TEINTES[0];
  teinteActive = t.id;
  document.documentElement.dataset.teinte = t.id;
  $('meta[name="theme-color"]').setAttribute('content', t.couleur);
  if (choisie || teinteChoisie) memoire.ecrire('md-teinte-v5', t.id);
  rendreTeintes();
  if (choisie) { toast(`Teinte ${t.nom}`, 1400); clic(2400, 0.02, 0.05); }
}

/* ─────────────────────────────── toast ─────────────────────────────── */
let toastMinuterie = null;
function toast(msg, duree = 2800) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastMinuterie);
  toastMinuterie = setTimeout(() => t.classList.remove('visible'), duree);
}

/* ─────────────────────────────── commencer ─────────────────────────────── */
// une seule fois, après un peu d'écoute : l'astuce de « Ma sélection » (rien d'autre, le reste se voit)
let aideMontree = false;
function montrerAide() {
  if (aideMontree || memoire.lire('md-aide-vue-v2', false) || S.vue !== 'machine') return;
  aideMontree = true;
  $('#aide').hidden = false;
  requestAnimationFrame(() => $('#aide').classList.add('ouverte'));
  const b = $('#radio-garder'); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
  $('.bouton-reglages').classList.add('brille');
}
function fermerAide() {
  if ($('#aide').hidden) return;
  memoire.ecrire('md-aide-vue-v2', true);
  $('#aide').classList.remove('ouverte');
  setTimeout(() => { $('#aide').hidden = true; }, 250);
}
function allumer() {
  audioCtx();
  clic(220, 0.12, 0.12);
  setTimeout(() => clic(2600, 0.02, 0.04), 140);
  document.body.classList.add('allume');
  // le geste « Commencer » autorise le son. On ne démarre jamais pareil : un morceau au hasard,
  // pris parmi ceux que tu n'as encore jamais entendus (puis les moins récents)
  let m = null;
  if (S.source === 'radio') {
    const pool = (poolSource());
    const vus = new Set(S.croises);
    const jamais = pool.filter(x => !vus.has(x.id) && !S.aimePas.has(x.id));
    m = jamais.length ? hasard(jamais) : hasard(pool.filter(x => !S.historique.slice(-40).includes(x.id)));
  }
  m = m || parId[construireSuite(null, 1)[0]];
  entrerMachine();
  if (m) jouerRadio(m.id);
}
const demarre = () => document.body.classList.contains('allume');

/* ─────────────────────────────── les actions ─────────────────────────────── */
const ACTIONS = {
  'allumer': allumer,
  'accueil': () => { if (demarre()) window.scrollTo({ top: 0, behavior: doux }); },
  'piste': b => {
    if (b.dataset.id) { arreterExtrait(); clic(1300); jouerRadio(b.dataset.id); return; }
    const p = (pistesLivret[b.dataset.livret] || [])[+b.dataset.i];
    if (!p) return;
    const cle = `piste:${b.dataset.livret}:${b.dataset.i}`;
    if (extraitPour === cle) arreterExtrait(); else lancerExtraitPiste(p, cle, b.closest('li'));
  },
  'ouvrir': b => { fermerPanneaux(); clic(1300); jouerRadio(b.dataset.id); },
  'jouer-id': b => { clic(1300); jouerRadio(b.dataset.id); },
  'garder': b => basculerGarde(b.dataset.id),
  'aime': () => aimer(S.joue),
  'pas-aime': () => pasAime(S.joue),
  'choisir-disque': b => choisirDisque(+b.dataset.i),
  'autres-disques': () => autresDisques(),
  'auto': () => basculerAuto(),
  'fermer-aide': () => fermerAide(),
  'fidget': b => bidouiller(b),
  'source-chaine': b => choisirSource(b.dataset.source),
  'cosmetique': () => basculerCosmetique(),
  'affichage': b => choisirAffichage(b.dataset.val),
  'fermer-livret': () => { const m = parId[S.joue]; S.livrets.machine = false; if (m) rendreLivret('machine', m, { force: true }); clic(1000, 0.04, 0.05); },
  'livret': b => {
    const m = parId[S.joue];
    if (!m) return;
    if (b.dataset.ouvrir) return ouvrirLivret('machine', m);
    S.livrets.machine = !S.livrets.machine;
    rendreLivret('machine', m, { force: true });
    clic(1000, 0.04, 0.05);
  },
  'radio-lecture': radioLecture,
  'radio-suivant': radioSuivant,
  'radio-precedent': radioPrecedent,
  'radio-stop': radioStop,
  'ecouter-selection': () => { fermerPanneaux(); choisirSource('selection'); window.scrollTo({ top: 0, behavior: doux }); },
  'copier-lien': async () => {
    try { await navigator.clipboard.writeText(location.href); toast('Lien copié : colle-le dans ton navigateur.'); }
    catch (e) { toast(location.href, 6000); }
  },
  'fermer-avis-appli': () => { $('#avis-appli').hidden = true; memoire.ecrire('md-avis-appli', true); },
  'ouvrir-bac': () => ouvrirPanneau('bac'),
  'ouvrir-reglages': () => { memoire.ecrire('md-reglages-vu', true); $('.bouton-reglages').classList.remove('brille'); ouvrirPanneau('reglages'); },
  'fermer-panneaux': () => fermerPanneaux(),
  'onglet': b => { S.onglet = b.dataset.onglet; rendreBac(); },
  'copier-liste': copierListe,
  'son': b => choisirSon(b.dataset.son),
  'teinte': b => appliquerTeinte(b.dataset.teinte, true),
  'encart-ok': () => { memoire.ecrire('md-encart-pub-v2', true); majAvis(); },
  'encart-extraits': () => { memoire.ecrire('md-encart-pub-v2', true); majAvis(); choisirSon('extraits'); },
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  const a = ACTIONS[b.dataset.action];
  if (!a) return;
  e.preventDefault();
  // après un clic de souris, le bouton lâche le focus : Espace mettra en pause au lieu de rappuyer dessus
  if (e.detail > 0 && b.matches('.pile-boite, .pile-maintenant, .pile-autres, .pile-flemme, .pilote-stop, .rond, .pilule, .source-choix, .choix-affichage button')) b.blur();
  // une erreur dans une action ne doit jamais figer le reste du site
  try { a(b); } catch (err) { console.error(err); toast('Oups, quelque chose a coincé. Réessaie.'); }
});
/* le clavier : Espace (lecture / pause), ← et → (morceau précédent / suivant),
   J (j'aime bien), X (pas trop comme ça), Échap (refermer) */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { fermerAide(); fermerPanneaux(); if (document.body.classList.contains('cosmetique')) basculerCosmetique(false); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || S.vue !== 'machine' || !S.joue) return;
  const t = e.target;
  if (t.closest && t.closest('input, textarea, select, [contenteditable="true"], .molette')) return;
  const surBouton = t.closest && t.closest('button, a');
  const touche = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (touche === ' ') { if (surBouton) return; e.preventDefault(); basculerLecture(); }
  else if (touche === 'ArrowRight') { e.preventDefault(); radioSuivant(); }
  else if (touche === 'ArrowLeft') { e.preventDefault(); radioPrecedent(); }
  else if (touche === 'j' || touche === 'g') aimer(S.joue);
  else if (touche === 'x') pasAime(S.joue);
});

/* ─────────────────────────────── démarrage ─────────────────────────────── */
appliquerTeinte(teinteActive, false);
appliquerFidget();
majMolettes();
majSon();
majGarde();
S.suite = construireSuite(null);
document.body.dataset.affichage = S.affichage;
$$('.choix-affichage [data-val]').forEach(b => b.setAttribute('aria-checked', b.dataset.val === S.affichage));
poserDisque(S.source);
if (!memoire.lire('md-reglages-vu', false)) $('.bouton-reglages').classList.add('brille');
rendreTuner();
majAfficheur();
chargerAPI();
// pochettes, extraits et fiches de toute la sélection, préparés dès l'arrivée (puis gardés en cache)
BANQUE.forEach(m => Pochettes.demander(m));
if (IOS) $('#allumage-conseil').textContent = 'Sur iPhone, le volume se règle avec les boutons du téléphone : baisse-le un peu avant de commencer.';
if (S.gardes.length || S.croises.length) {
  const r = $('#allumage-retour');
  r.hidden = false;
  r.textContent = S.gardes.length
    ? `Ta sélection t'attend : ${S.gardes.length} morceau${S.gardes.length > 1 ? 'x' : ''}.`
    : `Content de te revoir. Tu avais croisé ${S.croises.length} morceaux.`;
}
// ouvert depuis Instagram, TikTok, Messenger… : leur navigateur intégré lit mal YouTube et ne garde rien
(() => {
  const ua = navigator.userAgent || '';
  const appli = [['Instagram', /Instagram/i], ['Facebook', /FBAN|FBAV|FB_IAB|FBIOS/i], ['Messenger', /Messenger|FB_IAB\/MESSENGER/i], ['TikTok', /TikTok|musical_ly|BytedanceWebview|trill/i],
    ['Snapchat', /Snapchat/i], ['LinkedIn', /LinkedInApp/i], ['X', /Twitter/i], ['Pinterest', /Pinterest/i], ['Google', /GSA\//i], ['Line', /\bLine\//]].find(([, r]) => r.test(ua));
  const webview = /Android.*; wv\)/.test(ua);
  if ((!appli && !webview) || memoire.lire('md-avis-appli', false)) return;
  const nom = appli ? appli[0] : 'cette appli';
  const android = /Android/i.test(ua);
  $('#avis-appli').hidden = false;
  $('#avis-appli-texte').textContent = android
    ? `Le navigateur intégré à ${nom} lit mal la musique et oublie ta sélection. Ouvre plutôt la page dans Chrome.`
    : `Le navigateur intégré à ${nom} lit mal la musique et oublie ta sélection. Touche ⋯ ou ↗ (en haut ou en bas de l'écran), puis « Ouvrir dans Safari » ou « Ouvrir dans le navigateur ».`;
  if (android) {
    const a = $('#avis-appli-ouvrir');
    a.hidden = false;
    a.href = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=com.android.chrome;end`;
  }
})();

/* ─────────────────────────────── petites bidouilles sur la chaîne (rien d'utile, tout est fait pour tripoter) ─────────────────────────────── */
(() => {
  const compte = {};
  const fois = k => (compte[k] = (compte[k] || 0) + 1);
  const rejouer = (el, classe) => { el.classList.remove(classe); void el.offsetWidth; el.classList.add(classe); };
  // un coup sur le haut-parleur : il pompe, une onde part, un grave sourd
  document.addEventListener('click', e => {
    const gr = e.target.closest('.hp-boomer'), ai = e.target.closest('.hp-tweeter');
    if (gr) {
      rejouer(gr, 'coup'); clic(72 + Math.random() * 14, 0.14, 0.14);
      const n = fois('grave');
      if (n === 9) toast('Doucement : c\'est une enceinte à deux voies, pas un caisson.', 3600);
      if (n === 24) toast('Il commence à le regretter, ce haut-parleur.', 3600);
    } else if (ai) {
      rejouer(ai, 'ping'); clic(2600 + Math.random() * 1400, 0.06, 0.06);
      if (fois('aigu') === 10) toast('Les aigus, c\'est comme les ragots : ça porte loin.', 3600);
    }
  });
  // toucher l'écran LCD change la couleur des chiffres, sans passer par « Cosmétique »
  const COULEURS = ['origine', 'glacier', 'ambre', 'menthe', 'rose', 'blanc'];
  $('.lcd').addEventListener('click', () => {
    const k = COULEURS.indexOf(S.fidget.lcd);
    S.fidget.lcd = COULEURS[(k + 1) % COULEURS.length];
    memoire.ecrire('md-fidget', S.fidget); appliquerFidget();
    clic(2200, 0.02, 0.05);
    rejouer($('.lcd'), 'lcd-clic');
  });
  // le post-it se décolle et se recolle ailleurs ; double-clic : il revient à sa place
  const pi = $('#post-it');
  let pris = null;
  const pos = (n, v) => pi.style.setProperty(n, v + 'px');
  pi.addEventListener('pointerdown', e => {
    if (innerWidth < 1240 || e.button) return; // sur petit écran, le post-it est rangé sous la chaîne : on ne le décolle pas
    pris = { x: e.clientX, y: e.clientY, dx: parseFloat(pi.style.getPropertyValue('--dx')) || 0, dy: parseFloat(pi.style.getPropertyValue('--dy')) || 0 };
    pi.setPointerCapture(e.pointerId); pi.classList.add('souleve'); pi.classList.remove('colle');
  });
  pi.addEventListener('pointermove', e => {
    if (!pris) return;
    pos('--dx', pris.dx + e.clientX - pris.x); pos('--dy', pris.dy + e.clientY - pris.y);
  });
  const lacher = () => { if (!pris) return; pris = null; pi.classList.remove('souleve'); clic(900, 0.03, 0.04); };
  pi.addEventListener('pointerup', lacher); pi.addEventListener('pointercancel', lacher);
  pi.addEventListener('dblclick', () => { pi.style.setProperty('--dx', '0px'); pi.style.setProperty('--dy', '0px'); });
})();
if (typeof Salon !== 'undefined') { document.querySelectorAll('[data-salon]').forEach(Salon.monter); majSalon(); }
aller('allumage');
})();
