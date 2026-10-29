/* ════════════════════════════════════════════════════════════════════
   LE SALON
   Quelqu'un dans un fauteuil club écoute la chaîne. Dehors, le ciel suit
   l'heure qu'il est vraiment chez toi (l'aube, le jour, le coucher de
   soleil, la nuit). Quand la musique joue, la pièce se réchauffe : la
   lampe s'allume plus fort, la tête suit le tempo du morceau, le pied
   tape, le son sort de la platine. Au mur, la pochette du morceau.
   Tout est dessiné ici, en SVG : aucune image à charger.
   ════════════════════════════════════════════════════════════════════ */
const Salon = (() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let n = 0;

  /* le ciel, heure par heure : [heure, haut du ciel, bas du ciel] */
  const CIEL = [
    [0, '#070b1d', '#17203f'], [5, '#0a0f26', '#1f2a4f'], [6.3, '#3c4a86', '#f2a487'], [7.5, '#86b6e3', '#f6d8b8'],
    [10, '#5ea6e6', '#cfe5f6'], [15, '#6aaee8', '#d9ebf6'], [18, '#6b8fcb', '#f4c89a'], [19.4, '#3e3f80', '#f08355'],
    [20.6, '#1b2150', '#6c4677'], [22, '#0a0f27', '#1c2448'], [24, '#070b1d', '#17203f'],
  ];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mel = (a, b, f) => '#' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * f).toString(16).padStart(2, '0')).join('');
  function ciel(h) {
    for (let i = 0; i < CIEL.length - 1; i++) {
      const [h1, a1, b1] = CIEL[i], [h2, a2, b2] = CIEL[i + 1];
      if (h >= h1 && h <= h2) { const f = (h - h1) / (h2 - h1); return [mel(a1, a2, f), mel(b1, b2, f)]; }
    }
    return [CIEL[0][1], CIEL[0][2]];
  }
  // 0 la nuit, 1 en plein jour
  const jourDe = h => Math.max(0, Math.min(1, Math.sin((h - 6.2) / 13.6 * Math.PI) * 1.6));
  const moment = h => h < 5 || h >= 21.5 ? 'il fait nuit' : h < 7.5 ? 'le jour se lève' : h < 18 ? 'il fait jour' : h < 20.3 ? 'le soleil se couche' : 'la nuit tombe';

  function dessin(id) {
    // des livres et des disques sur l'étagère : des tranches de couleurs
    const couleurs = ['#b8473a', '#e3b04b', '#2f4a6b', '#d9d2c3', '#3f7a4a', '#7e5aa0', '#1d1c22', '#c87a3e', '#8aa0b8', '#a3352a'];
    let tranches = '';
    [[150, 0], [205, 1], [262, 2]].forEach(([y, r]) => {
      let x = 66;
      for (let k = 0; x < 214; k++) {
        const w = 5 + ((k * 7 + r * 3) % 6), hh = 34 + ((k * 13 + r) % 12);
        tranches += `<rect x="${x}" y="${y - hh}" width="${w}" height="${hh}" fill="${couleurs[(k * 3 + r * 5) % couleurs.length]}"/>`;
        x += w + 1;
      }
    });
    let immeubles = '', fenetres = '';
    [[312, 34, 70], [348, 26, 52], [376, 40, 84], [418, 22, 46], [442, 36, 66], [480, 30, 58], [508, 24, 74]].forEach(([x, w, hh], i) => {
      immeubles += `<rect x="${x}" y="${233 - hh}" width="${w}" height="${hh}"/>`;
      for (let yy = 233 - hh + 8; yy < 228; yy += 11) for (let xx = x + 5; xx < x + w - 5; xx += 9) if ((xx * 7 + yy * 3 + i) % 5 < 2) fenetres += `<rect x="${xx}" y="${yy}" width="4" height="5"/>`;
    });
    let planches = '';
    for (let y = 298; y < 360; y += 12) planches += `<line x1="0" y1="${y}" x2="1200" y2="${y}"/>`;
    for (let k = 0; k < 18; k++) { const y = 298 + (k % 5) * 12; planches += `<line x1="${(k * 137) % 1200}" y1="${y}" x2="${(k * 137) % 1200}" y2="${y + 12}"/>`; }
    let poussieres = '';
    for (let k = 0; k < 9; k++) poussieres += `<circle class="poussiere" cx="${850 + (k * 37) % 120}" cy="${110 + (k * 53) % 130}" r="${1 + (k % 3) * .6}" style="--i:${k}"/>`;

    return `
    <svg class="salon-svg" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMax slice" role="img" aria-labelledby="salon-titre-${id}">
      <title id="salon-titre-${id}">Le salon : quelqu'un écoute la musique dans un fauteuil club</title>
      <defs>
        <linearGradient id="salon-ciel-${id}" x1="0" y1="0" x2="0" y2="1"><stop class="ciel-haut" offset="0"/><stop class="ciel-bas" offset="1"/></linearGradient>
        <linearGradient id="salon-mur-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dfcf"/><stop offset="1" stop-color="#d8c9b2"/></linearGradient>
        <linearGradient id="salon-cuir-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c47a3c"/><stop offset=".55" stop-color="#9a5226"/><stop offset="1" stop-color="#6e3518"/></linearGradient>
        <linearGradient id="salon-cuir2-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3c1b"/><stop offset=".5" stop-color="#a95d2b"/><stop offset="1" stop-color="#7a3c1b"/></linearGradient>
        <linearGradient id="salon-rideau-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5f2420"/><stop offset=".3" stop-color="#8a3a30"/><stop offset=".55" stop-color="#6a2a24"/><stop offset=".8" stop-color="#8f3d33"/><stop offset="1" stop-color="#5a221e"/></linearGradient>
        <radialGradient id="salon-lampe-${id}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(950 118) scale(250 190)"><stop offset="0" stop-color="#ffd59a" stop-opacity=".95"/><stop offset=".35" stop-color="#ffb066" stop-opacity=".45"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
        <radialGradient id="salon-chaleur-${id}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(760 230) scale(620 300)"><stop offset="0" stop-color="#ff9442" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient>
        <clipPath id="salon-vitre-${id}"><rect x="312" y="72" width="216" height="161"/></clipPath>
      </defs>

      <!-- le mur et le sol -->
      <rect width="1200" height="300" fill="url(#salon-mur-${id})"/>
      <rect y="292" width="1200" height="68" fill="#7a4a2a"/>
      <g class="salon-planches" stroke="#5e381f" stroke-width="1.2" opacity=".55">${planches}</g>
      <rect y="284" width="1200" height="9" fill="#f3ece0"/><rect y="292" width="1200" height="2" fill="#c9bba4"/>

      <!-- l'étagère à disques -->
      <g class="salon-etagere">
        <rect x="54" y="96" width="172" height="200" fill="#4b2f1c"/><rect x="60" y="102" width="160" height="190" fill="#2e1c10"/>
        ${tranches}
        <rect x="58" y="150" width="164" height="6" fill="#5c3a22"/><rect x="58" y="205" width="164" height="6" fill="#5c3a22"/><rect x="58" y="262" width="164" height="6" fill="#5c3a22"/>
      </g>

      <!-- la fenêtre : le vrai ciel de l'heure qu'il est -->
      <rect x="244" y="34" width="356" height="7" rx="3" fill="#2a2420"/>
      <g class="salon-fenetre">
        <rect x="300" y="60" width="240" height="185" fill="#f1ebe0"/>
        <rect x="312" y="72" width="216" height="161" fill="url(#salon-ciel-${id})"/>
        <g clip-path="url(#salon-vitre-${id})">
          <g class="etoiles" fill="#fff">
            <circle cx="330" cy="88" r="1"/><circle cx="372" cy="104" r="1.3"/><circle cx="401" cy="84" r=".9"/><circle cx="455" cy="96" r="1.2"/><circle cx="498" cy="82" r="1"/><circle cx="512" cy="118" r=".8"/><circle cx="350" cy="130" r=".8"/><circle cx="470" cy="128" r="1"/>
          </g>
          <circle class="astre" r="13" cx="420" cy="120"/>
          <g class="immeubles">${immeubles}</g>
          <g class="fenetres-allumees" fill="#ffd27a">${fenetres}</g>
        </g>
        <rect x="417" y="72" width="6" height="161" fill="#f1ebe0"/><rect x="312" y="149" width="216" height="5" fill="#f1ebe0"/>
        <rect x="290" y="244" width="260" height="9" fill="#e7dfd1"/><rect x="294" y="253" width="252" height="4" fill="#c8bba6"/>
      </g>
      <path d="M252 38 h44 q-6 70 4 140 q-10 60 2 112 h-50 q8 -60 -2 -126 q10 -66 2 -126z" fill="url(#salon-rideau-${id})"/>
      <path d="M544 38 h44 q-8 66 2 126 q-10 66 -2 126 h-50 q12 -52 2 -112 q10 -70 4 -140z" fill="url(#salon-rideau-${id})"/>
      <polygon class="salon-rayon" points="312,233 528,233 690,330 380,330" fill="#fff6dc"/>

      <!-- le meuble et la platine -->
      <g class="salon-meuble">
        <rect x="574" y="256" width="150" height="70" rx="3" fill="#5a3520"/>
        <rect x="582" y="264" width="66" height="54" fill="#4a2a18"/><rect x="652" y="264" width="64" height="54" fill="#4a2a18"/>
        <rect x="584" y="326" width="6" height="10" fill="#2a1a10"/><rect x="708" y="326" width="6" height="10" fill="#2a1a10"/>
        <rect x="592" y="242" width="96" height="14" rx="2" fill="#2b2a2e"/>
        <ellipse cx="632" cy="242" rx="30" ry="5" fill="#141416"/><ellipse class="salon-vinyle" cx="632" cy="241" rx="24" ry="3.6" fill="#1e1d20"/>
        <circle cx="632" cy="240.6" r="2.2" fill="#c8572f"/>
        <path d="M676 238 l-14 4" stroke="#c9c9cc" stroke-width="2" stroke-linecap="round"/>
        <rect x="700" y="222" width="14" height="34" rx="1" fill="#d8ccb8"/><rect x="704" y="226" width="14" height="30" rx="1" fill="#2f4a6b"/>
      </g>
      <g class="salon-ondes" fill="none" stroke="#c87a3e" stroke-width="2" stroke-linecap="round">
        <path class="onde" d="M612 224 q20 -14 40 0" style="--i:0"/><path class="onde" d="M604 214 q28 -20 56 0" style="--i:1"/><path class="onde" d="M596 204 q36 -26 72 0" style="--i:2"/>
      </g>

      <!-- au mur : la pochette du morceau qui passe -->
      <g class="salon-cadre">
        <rect x="604" y="96" width="74" height="74" fill="#1f1a15"/><rect x="608" y="100" width="66" height="66" fill="#efe7d8"/>
        <rect class="cadre-vide" x="612" y="104" width="58" height="58" fill="#c8572f"/><circle class="cadre-vide" cx="641" cy="133" r="16" fill="#1d1c22"/><circle class="cadre-vide" cx="641" cy="133" r="3" fill="#efe7d8"/>
        <image class="cadre-pochette" x="612" y="104" width="58" height="58" preserveAspectRatio="xMidYMid slice"/>
      </g>

      <!-- le tapis, la table basse -->
      <ellipse cx="840" cy="336" rx="240" ry="17" fill="#9c4a33"/><ellipse cx="840" cy="336" rx="226" ry="12" fill="none" stroke="#e3b04b" stroke-width="1.5" opacity=".5"/>
      <g class="salon-table">
        <ellipse cx="672" cy="292" rx="34" ry="6" fill="#2b2420"/><rect x="669" y="292" width="6" height="40" fill="#2b2420"/><ellipse cx="672" cy="334" rx="16" ry="3" fill="#2b2420"/>
        <path d="M662 286 l3 -16 h12 l3 16z" fill="#f4efe6" opacity=".9"/><rect x="666" y="279" width="10" height="7" fill="#7a1f2b" opacity=".9"/>
      </g>

      <!-- la lampe à arc -->
      <g class="salon-lampe">
        <ellipse cx="1046" cy="331" rx="26" ry="6" fill="#1d1c20"/>
        <path d="M1046 330 V150 Q1046 68 950 78" fill="none" stroke="#2a2a2e" stroke-width="5" stroke-linecap="round"/>
        <path d="M918 82 L982 82 L992 112 L908 112 Z" fill="#2b2a2e"/>
        <ellipse class="ampoule" cx="950" cy="112" rx="38" ry="5" fill="#ffe2a6"/>
      </g>

      <!-- le fauteuil club et la personne -->
      <g class="salon-fauteuil">
        <path d="M884 150 Q888 128 920 126 Q962 124 970 152 L978 300 L878 300 Z" fill="url(#salon-cuir-${id})"/>
        <path d="M900 140 Q925 132 956 142" fill="none" stroke="#d48a4c" stroke-width="2" opacity=".6"/>
        <!-- la personne : pull bleu Klein, adossée, les yeux fermés -->
        <g class="salon-personne">
          <path d="M836 180 Q866 164 900 174 Q914 210 914 252 L828 254 Q826 214 836 180 Z" fill="#2440b8"/>
          <path d="M846 186 Q870 178 892 182" fill="none" stroke="#3a58d0" stroke-width="3" opacity=".6"/>
          <g class="salon-tete" style="--o:868px 172px">
            <rect x="858" y="156" width="17" height="22" rx="7" fill="#c48965"/>
            <circle cx="866" cy="142" r="21" fill="#d9a27c"/>
            <path d="M845 142 Q842 114 870 114 Q895 116 891 144 Q887 128 873 127 Q860 128 857 140 Z" fill="#2a1d17"/>
            <path d="M846 145 l-8 6 l8 2" fill="#d9a27c"/>
            <path class="oeil" d="M850 140 q4.5 3.5 9 0" fill="none" stroke="#2a1d17" stroke-width="2" stroke-linecap="round"/>
            <path d="M849 156 q4 2.5 9 .5" fill="none" stroke="#8a4a3a" stroke-width="1.8" stroke-linecap="round"/>
            <ellipse cx="875" cy="145" rx="4.5" ry="6.5" fill="#c48965"/>
          </g>
        </g>
        <!-- l'accoudoir, devant -->
        <path d="M772 238 Q760 214 786 210 L940 210 Q960 212 960 236 L962 300 L772 300 Z" fill="url(#salon-cuir2-${id})"/>
        <path d="M776 236 Q772 214 796 214 L940 214" fill="none" stroke="#d68c4e" stroke-width="2.5" opacity=".55"/>
        <circle cx="790" cy="236" r="20" fill="#8c4a22"/><circle cx="790" cy="236" r="12" fill="none" stroke="#c47a3c" stroke-width="2" opacity=".7"/>
        <rect x="782" y="300" width="10" height="26" rx="2" fill="#3b2316"/><rect x="944" y="300" width="10" height="26" rx="2" fill="#3b2316"/>
        <rect x="776" y="294" width="190" height="10" rx="4" fill="#6e3518"/>
        <!-- le bras posé sur l'accoudoir, le verre à la main -->
        <path d="M848 190 L832 222" stroke="#2440b8" stroke-width="20" stroke-linecap="round"/>
        <path d="M832 222 L810 213" stroke="#2440b8" stroke-width="17" stroke-linecap="round"/>
        <ellipse cx="801" cy="211" rx="9" ry="7" fill="#d9a27c"/>
        <path d="M793 207 l2 -17 h11 l2 17z" fill="#f4efe6" opacity=".9"/><rect x="795" y="197" width="11" height="8" fill="#c8a24a" opacity=".9"/>
        <!-- les jambes croisées : celle qui reste au sol, puis celle qui bat la mesure -->
        <path d="M772 236 L744 318" stroke="#2a2c35" stroke-width="23" stroke-linecap="round"/>
        <path d="M720 322 q2 -9 22 -10 q14 0 16 10 z" fill="#efe9df"/><rect x="719" y="321" width="40" height="5" rx="2" fill="#3a3a3e"/>
        <g class="salon-pied" style="--o:774px 228px">
          <path d="M776 226 L722 280" stroke="#33363f" stroke-width="21" stroke-linecap="round"/>
          <path d="M716 270 q-16 4 -22 14 q4 6 14 4 l16 -6z" fill="#efe9df"/><path d="M694 284 q4 6 14 4 l16 -6 l1 3 l-16 6 q-12 3 -16 -4z" fill="#3a3a3e"/>
        </g>
        <circle cx="774" cy="230" r="13" fill="#2f323b"/>
      </g>

      <!-- la plante -->
      <g class="salon-plante">
        <path d="M1104 330 l-8 -40 h44 l-8 40z" fill="#b8473a"/>
        <path d="M1118 292 Q1090 230 1062 214 Q1100 222 1118 292" fill="#3f7a4a"/><path d="M1118 292 Q1124 210 1150 180 Q1140 236 1118 292" fill="#4f8f58"/>
        <path d="M1118 292 Q1162 246 1186 244 Q1158 270 1118 292" fill="#3a6e44"/><path d="M1118 292 Q1104 250 1112 210 Q1126 254 1118 292" fill="#5aa064"/>
      </g>

      <!-- la lumière : la nuit, la lampe, la chaleur de la musique -->
      <rect class="salon-nuit" width="1200" height="360" fill="#0b0f22"/>
      <rect class="salon-halo" width="1200" height="360" fill="url(#salon-lampe-${id})"/>
      <rect class="salon-chaleur" width="1200" height="360" fill="url(#salon-chaleur-${id})"/>
      <g class="salon-poussieres" fill="#ffe7b8">${poussieres}</g>
    </svg>
    <p class="salon-heure"><span class="salon-heure-texte"></span></p>`;
  }

  const salons = [];
  function monter(el) {
    if (!el || el.dataset.monte) return;
    el.dataset.monte = '1';
    el.innerHTML = dessin(++n);
    salons.push(el);
    heure();
  }

  // le ciel de l'heure qu'il est, mis à jour chaque minute
  function heure() {
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    const [haut, bas] = ciel(h), jour = jourDe(h);
    // le soleil traverse la fenêtre de 7 h à 20 h ; la lune, le reste du temps
    const soleil = h >= 6.3 && h <= 20.4;
    const f = soleil ? (h - 6.3) / 14.1 : ((h + 24 - 20.4) % 24) / 9.9;
    const ax = 322 + f * 196, ay = 210 - Math.sin(f * Math.PI) * 120;
    const texte = `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')} chez toi, ${moment(h)}`;
    salons.forEach(el => {
      el.querySelectorAll('.ciel-haut').forEach(s => s.setAttribute('stop-color', haut));
      el.querySelectorAll('.ciel-bas').forEach(s => s.setAttribute('stop-color', bas));
      const a = el.querySelector('.astre');
      a.setAttribute('cx', ax.toFixed(1)); a.setAttribute('cy', ay.toFixed(1));
      a.setAttribute('fill', soleil ? (jour > .5 ? '#fff4d0' : '#ffb36b') : '#f3efe2');
      el.style.setProperty('--jour', jour.toFixed(3));
      el.querySelector('.immeubles').setAttribute('fill', mel('#151a33', '#7d8aa3', jour));
      el.querySelector('.salon-heure-texte').textContent = texte;
      const t = el.querySelector('title'); if (t) t.textContent = `Le salon : quelqu'un écoute la musique dans un fauteuil club. Dehors, ${moment(h)}.`;
    });
  }
  setInterval(heure, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) heure(); });

  // la musique joue (ou pas), sur quel tempo, avec quelle pochette au mur
  function maj({ joue = false, bpm = 96, energie = 5, pochette = null } = {}) {
    let b = Number(bpm) || 96;
    while (b > 132) b /= 2;
    while (b < 66) b *= 2;
    salons.forEach(el => {
      el.classList.toggle('joue', !!joue);
      el.style.setProperty('--battement', (60 / b).toFixed(3) + 's');
      el.style.setProperty('--amplitude', (2.5 + Math.min(10, energie) * .55).toFixed(2) + 'deg');
      const im = el.querySelector('.cadre-pochette');
      if (pochette) { if (im.getAttribute('href') !== pochette) im.setAttribute('href', pochette); el.classList.add('avec-pochette'); }
      else { im.removeAttribute('href'); el.classList.remove('avec-pochette'); }
    });
  }

  return { monter, maj, heure };
})();
