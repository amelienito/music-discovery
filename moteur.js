/* ════════════════════════════════════════════════════════════════════
   MOTEUR — la façon de passer d'un morceau à l'autre
   Chaque morceau a une fiche dans data.js (ambiance, style, année, tempo,
   voix, étiquettes, énergie, groove, notoriété). Le moteur compare deux
   fiches et dit à quel point les deux morceaux vont bien ensemble : c'est
   ce qui fait que la radio enchaîne sans à-coups, et qu'« Oriente la
   suite » va dans le sens demandé sans sauter n'importe où.
   ════════════════════════════════════════════════════════════════════ */

const Moteur = (() => {
  // les sept ambiances, et celles qui leur sont voisines
  const AMBIANCES = {
    soleil:     { nom: 'Soleil',     voisins: ['piste', 'bitume', 'brume'] },
    bitume:     { nom: 'Bitume',     voisins: ['soleil', 'piste', 'ailleurs'] },
    piste:      { nom: 'Piste',      voisins: ['soleil', 'bitume', 'ailleurs', 'electrique'] },
    brume:      { nom: 'Brume',      voisins: ['soleil', 'ailleurs', 'epopee'] },
    ailleurs:   { nom: 'Ailleurs',   voisins: ['brume', 'piste', 'electrique', 'bitume'] },
    electrique: { nom: 'Électrique', voisins: ['piste', 'ailleurs', 'epopee'] },
    epopee:     { nom: 'Épopée',     voisins: ['brume', 'electrique'] },
  };

  // des étiquettes de la même famille se ressemblent un peu, même si ce ne sont pas les mêmes
  const FAMILLES = [
    ['soul', 'funk', 'disco', 'rnb', 'boogie', 'gospel', 'motown', 'philly', 'memphis'],
    ['rap', 'boom bap', 'drumless', 'trap', 'drill', 'cloud rap', 'samples soul', 'new york', 'sud', 'west coast', 'france'],
    ['house', 'electro', 'club', 'french touch', 'hyperpop', 'minimal', 'synthés', 'reggaeton', 'latin'],
    ['ambient', 'vaporwave', 'lofi', 'nature', 'long', 'berceuse', 'glitch'],
    ['classique', 'orchestre', 'cordes', 'piano', 'romantique', 'virtuose', 'harpe'],
    ['jazz', 'lounge', 'library', 'swing', 'cuivres', 'orgue'],
    ['pop', 'indie', 'dream pop', 'folk', 'chanson', 'ballade', 'voix aérienne', 'mélancolique'],
    ['rock', 'punk', 'metal', 'guitares', 'rapide'],
    ['monde', 'arabe', 'bresil', 'samba', 'japon', 'citypop', 'afro', 'reggae'],
  ];
  const familleDe = {};
  FAMILLES.forEach((f, i) => f.forEach(t => { familleDe[t] = i; }));

  const tagsDe = m => m._tags || (m._tags = (m.tags || []).map(t => String(t).toLowerCase()));
  // 1 = mêmes étiquettes, 0 = rien en commun
  function ressemblance(a, b) {
    const A = tagsDe(a), B = tagsDe(b);
    if (!A.length || !B.length) return a.ambiance && a.ambiance === b.ambiance ? 0.4 : 0.1;
    const meilleur = (t, autre) => {
      let m = 0;
      for (const u of autre) {
        if (u === t) return 1;
        if (familleDe[t] !== undefined && familleDe[t] === familleDe[u]) m = 0.4;
      }
      return m;
    };
    let s = 0;
    A.forEach(t => { s += meilleur(t, B); });
    B.forEach(t => { s += meilleur(t, A); });
    return s / (A.length + B.length);
  }
  const voisines = (x, y) => !!(AMBIANCES[x] && AMBIANCES[x].voisins.includes(y));
  function ecartAmbiance(a, b) {
    if (!a.ambiance || !b.ambiance) return 0.7;
    return a.ambiance === b.ambiance ? 0 : voisines(a.ambiance, b.ambiance) ? 0.7 : 1.4;
  }
  // les époques : deux œuvres classiques sont proches entre elles, loin de tout le reste
  function ecartEpoque(a, b) {
    const x = a.annee, y = b.annee;
    if (!x || !y) return 0.3;
    const cx = x < 1950, cy = y < 1950;
    if (cx && cy) return Math.min(1, Math.abs(x - y) / 120) * 0.3;
    if (cx !== cy) return 1;
    return Math.min(1, Math.abs(x - y) / 25);
  }
  // le tempo : un morceau à 70 et un à 140 battent au même pas (l'un est le double de l'autre)
  function ecartTempo(a, b) {
    if (!a.bpm || !b.bpm) return 0.3;
    let r = Math.abs(Math.log2(a.bpm / b.bpm)) % 1;
    r = Math.min(r, 1 - r);
    return Math.min(1, r * 2);
  }
  function ecartVoix(a, b) {
    if (!a.voix || !b.voix || a.voix === b.voix) return 0;
    const p = [a.voix, b.voix].sort().join('-');
    return { 'chant-rap': 0.45, 'chant-instru': 0.35, 'instru-rap': 0.6 }[p] || 0.4;
  }
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  // plus c'est petit, mieux les deux morceaux vont ensemble (2 : très proches ; au-delà de 5 : un vrai saut)
  function distance(a, b, { sans = null } = {}) {
    let d = 4 * (1 - ressemblance(a, b));
    d += ecartAmbiance(a, b);
    if (sans !== 'energie') d += 0.22 * Math.abs(num(a.energie, 5) - num(b.energie, 5));
    if (sans !== 'danse') d += 0.12 * Math.abs(num(a.danse, 5) - num(b.danse, 5));
    d += 0.9 * ecartEpoque(a, b);
    d += 0.6 * ecartTempo(a, b);
    d += ecartVoix(a, b);
    return d;
  }

  // tire au sort parmi les meilleurs, le premier le plus souvent
  function parmiLesMeilleurs(liste, n = 2) {
    const l = liste.slice(0, n);
    if (!l.length) return null;
    const poids = l.map((_, i) => 1 / (i + 1.4));
    let r = Math.random() * poids.reduce((s, p) => s + p, 0);
    for (let i = 0; i < l.length; i++) { r -= poids[i]; if (r <= 0) return l[i]; }
    return l[0];
  }
  const classer = notes => notes.filter(Boolean).sort((a, b) => a[1] - b[1]).map(p => p[0]);

  /* les six directions d'« Oriente la suite ».
     val(m, cle) donne l'énergie, le groove ou le côté confidentiel d'un morceau (0 à 10) ;
     gout(x), facultatif, ajoute tes goûts (ce que tu aimes attire, ce que tu n'aimes pas repousse) */
  const DIRECTIONS = {
    calme:        { nom: 'Plus calme',        cle: 'energie', sens: -1, pas: 1.5 },
    energique:    { nom: 'Plus énergique',    cle: 'energie', sens: 1,  pas: 1.5 },
    // « plus groovy » depuis un morceau de piano doit vraiment faire bouger, pas juste un peu moins immobile
    pose:         { nom: 'Moins groovy',      cle: 'danse',   sens: -1, pas: 2, plafond: 5 },
    dansant:      { nom: 'Plus groovy',       cle: 'danse',   sens: 1,  pas: 2, plancher: 4 },
    connu:        { nom: 'Plus mainstream',   cle: 'etrange', sens: -1, pas: 1.5 },
    confidentiel: { nom: 'Plus confidentiel', cle: 'etrange', sens: 1,  pas: 1.5 },
  };
  const ecartDe = (R, ref, x, val) => (val(x, R.cle) - val(ref, R.cle)) * R.sens;

  /* Le premier pas : au moins un cran dans le sens demandé (deux crans si on a rappuyé),
     par le morceau le plus proche de celui qui passe. Un pas trop grand, ou qui sort du
     monde du morceau, coûte plus cher : on n'y va que s'il n'y a rien de mieux. */
  function versDirection(ref, dir, pool, val, { force = 1, gout = null } = {}) {
    const R = DIRECTIONS[dir];
    if (!R || !ref || !pool.length) return null;
    const sans = R.cle === 'etrange' ? null : R.cle;
    const cible = R.pas * force;
    return parmiLesMeilleurs(classer(pool.map(x => {
      const e = ecartDe(R, ref, x, val);
      if (x === ref || e < 1) return null;
      let note = distance(ref, x, { sans }) + 0.6 * Math.abs(e - cible) + 0.5 * Math.max(0, e - cible - 1.5);
      if (R.plancher !== undefined && val(x, R.cle) < R.plancher) note += 1.5;
      if (R.plafond !== undefined && val(x, R.cle) > R.plafond) note += 1.5;
      if (gout) note += gout(x);
      return [x, note];
    })));
  }
  // y a-t-il au moins un morceau plus loin dans ce sens ? (sinon, on est tout au bout de l'échelle)
  function possible(ref, dir, pool, val) {
    const R = DIRECTIONS[dir];
    if (!R || !ref) return pool.length > 0;
    return pool.some(x => x !== ref && ecartDe(R, ref, x, val) >= 1);
  }
  /* La suite d'une direction : elle tient le niveau atteint (le « sol »), remonte d'un cran
     un morceau sur trois quand ça se fait en douceur, et ne redescend jamais de plus d'un cran.
     Au lieu de foncer vers les extrêmes (et de sauter d'un univers à l'autre pour y arriver),
     elle choisit le morceau le plus proche qui respecte le sens. */
  function suivantPente(ref, dir, pool, val, { premier = false, force = 1, etape = 0, sol = null, gout = null } = {}) {
    const R = DIRECTIONS[dir];
    if (!R || !ref) return null;
    if (premier) { const x = versDirection(ref, dir, pool, val, { force, gout }); if (x) return x; }
    const niveau = sol === null ? val(ref, R.cle) : sol;
    const monte = etape % 3 === 2;
    return parmiLesMeilleurs(classer(pool.map(x => {
      if (x === ref) return null;
      const e = ecartDe(R, ref, x, val);
      const f = (val(x, R.cle) - niveau) * R.sens;
      if (f < -1 || e < -1.5) return null;
      let note = distance(ref, x);
      if (e < 0) note += 1.1 * -e;
      if (f < 0) note += 1.8 * -f;
      if (monte) note += e >= 1 ? -1 : 0.5;
      if (e > R.pas + 1.5) note += 0.5 * (e - R.pas - 1.5);
      if (gout) note += gout(x);
      return [x, note];
    })));
  }
  // le sol monte avec la direction (à un cran près), il ne redescend jamais
  function nouveauSol(dir, sol, m, val) {
    const R = DIRECTIONS[dir];
    if (!R) return sol;
    const v = val(m, R.cle);
    if (sol === null || sol === undefined) return v;
    return R.sens > 0 ? Math.max(sol, v - 1) : Math.min(sol, v + 1);
  }

  /* l'ordre d'un disque : chaque morceau mène au plus proche, puis on
     décroise les enchaînements maladroits (comme un DJ qui prépare son set) */
  function sequencer(liste, { depart = null, tours = 8 } = {}) {
    const reste = [...liste];
    if (reste.length < 3) return reste;
    const premier = depart && reste.includes(depart) ? depart : reste[Math.floor(Math.random() * reste.length)];
    const o = [premier];
    reste.splice(reste.indexOf(premier), 1);
    while (reste.length) {
      const der = o[o.length - 1];
      let k = 0, best = Infinity;
      reste.forEach((x, i) => { const d = distance(der, x); if (d < best) { best = d; k = i; } });
      o.push(reste.splice(k, 1)[0]);
    }
    // 2-opt : on retourne un bout du chemin quand ça raccourcit les sauts (le premier morceau reste en tête)
    const n = o.length;
    const D = new Map();
    const d = (a, b) => { const k = a.id + '|' + b.id; if (!D.has(k)) D.set(k, distance(a, b)); return D.get(k); };
    for (let t = 0; t < tours; t++) {
      let mieux = false;
      for (let i = 1; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
          const avant = d(o[i - 1], o[i]) + d(o[j], o[j + 1]);
          const apres = d(o[i - 1], o[j]) + d(o[i], o[j + 1]);
          if (apres + 1e-9 < avant) { o.splice(i, j - i + 1, ...o.slice(i, j + 1).reverse()); mieux = true; }
        }
      }
      if (!mieux) break;
    }
    return o;
  }

  return { AMBIANCES, DIRECTIONS, distance, ressemblance, versDirection, possible, suivantPente, nouveauSol, sequencer, parmiLesMeilleurs };
})();
if (typeof module !== 'undefined') module.exports = Moteur;
