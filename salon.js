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
      <!-- le fauteuil club, vu de face, et Amélien assis dedans -->
      <g class="salon-fauteuil">
        <!-- le dossier -->
        <path d="M786 250 L786 168 Q786 136 822 134 L898 134 Q934 136 934 168 L934 250 Z" fill="url(#salon-cuir-${id})"/>
        <path d="M800 160 Q860 146 920 160" fill="none" stroke="#d48a4c" stroke-width="2" opacity=".55"/>
        <!-- Amélien -->
        <g class="salon-personne">
          <g class="salon-buste" style="--o:860px 250px">
            <!-- le corps : manteau sombre, chemise blanche, cravate orange -->
            <path d="M826 186 Q860 174 894 186 L900 252 L820 252 Z" fill="#1d2233"/>
            <path d="M851 178 L860 206 L869 178 Z" fill="#f4f1ea"/>
            <path d="M858 184 L862 184 L865 222 L860 230 L855 222 Z" fill="#d06a32"/><circle cx="860" cy="196" r="1.3" fill="#f0b07a"/><circle cx="860.6" cy="209" r="1.3" fill="#f0b07a"/>
            <path d="M846 180 L856 206" stroke="#151a28" stroke-width="3"/><path d="M874 180 L864 206" stroke="#151a28" stroke-width="3"/>
            <!-- les bras, selon l'humeur : posés, un livre, derrière la tête -->
            <g class="bras bras-poses">
              <path d="M830 192 L808 226" stroke="#1d2233" stroke-width="17" stroke-linecap="round"/><path d="M890 192 L912 226" stroke="#1d2233" stroke-width="17" stroke-linecap="round"/>
              <g class="main-g"><ellipse cx="806" cy="230" rx="8" ry="6" fill="#9a6646"/><path d="M799 226 l2 -15 h10 l2 15z" fill="#f4efe6" opacity=".9"/><rect x="801" y="217" width="10" height="7" fill="#c8a24a" opacity=".9"/></g>
              <g class="main-d"><ellipse cx="914" cy="230" rx="8" ry="6" fill="#9a6646"/></g>
            </g>
            <g class="bras bras-livre">
              <path d="M830 192 L836 230 L850 232" fill="none" stroke="#1d2233" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M890 192 L884 230 L870 232" fill="none" stroke="#1d2233" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M838 220 L860 226 L882 220 L882 238 L860 244 L838 238 Z" fill="#7a2f24"/>
              <path d="M840 219 L860 224 L860 241 L840 236 Z" fill="#f6f0e2"/><path d="M880 219 L860 224 L860 241 L880 236 Z" fill="#efe6d2"/>
              <path d="M844 226 l12 3 M844 230 l12 3 M864 229 l12 -3 M864 233 l12 -3" stroke="#b9ad96" stroke-width="1"/>
              <ellipse cx="840" cy="232" rx="6" ry="5" fill="#9a6646"/><ellipse cx="880" cy="232" rx="6" ry="5" fill="#9a6646"/>
            </g>
            <g class="bras bras-tete">
              <path d="M830 190 L812 158 L836 126" fill="none" stroke="#1d2233" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M890 190 L908 158 L884 126" fill="none" stroke="#1d2233" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <!-- la tête : grand afro, lunettes rondes noires, moustache -->
            <g class="salon-tete" style="--o:860px 176px">
              <rect x="853" y="160" width="14" height="22" rx="6" fill="#7e5034"/>
              <g class="afro" fill="#2e1c14"><circle cx="860" cy="128" r="35"/><circle cx="895.0" cy="128.0" r="4.2"/><circle cx="894.5" cy="134.1" r="5.1"/><circle cx="892.9" cy="140.0" r="6.0"/><circle cx="890.3" cy="145.5" r="4.2"/><circle cx="886.8" cy="150.5" r="5.1"/><circle cx="882.5" cy="154.8" r="6.0"/><circle cx="877.5" cy="158.3" r="4.2"/><circle cx="872.0" cy="160.9" r="5.1"/><circle cx="866.1" cy="162.5" r="6.0"/><circle cx="860.0" cy="163.0" r="4.2"/><circle cx="853.9" cy="162.5" r="5.1"/><circle cx="848.0" cy="160.9" r="6.0"/><circle cx="842.5" cy="158.3" r="4.2"/><circle cx="837.5" cy="154.8" r="5.1"/><circle cx="833.2" cy="150.5" r="6.0"/><circle cx="829.7" cy="145.5" r="4.2"/><circle cx="827.1" cy="140.0" r="5.1"/><circle cx="825.5" cy="134.1" r="6.0"/><circle cx="825.0" cy="128.0" r="4.2"/><circle cx="825.5" cy="121.9" r="5.1"/><circle cx="827.1" cy="116.0" r="6.0"/><circle cx="829.7" cy="110.5" r="4.2"/><circle cx="833.2" cy="105.5" r="5.1"/><circle cx="837.5" cy="101.2" r="6.0"/><circle cx="842.5" cy="97.7" r="4.2"/><circle cx="848.0" cy="95.1" r="5.1"/><circle cx="853.9" cy="93.5" r="6.0"/><circle cx="860.0" cy="93.0" r="4.2"/><circle cx="866.1" cy="93.5" r="5.1"/><circle cx="872.0" cy="95.1" r="6.0"/><circle cx="877.5" cy="97.7" r="4.2"/><circle cx="882.5" cy="101.2" r="5.1"/><circle cx="886.8" cy="105.5" r="6.0"/><circle cx="890.3" cy="110.5" r="4.2"/><circle cx="892.9" cy="116.0" r="5.1"/><circle cx="894.5" cy="121.9" r="6.0"/></g>
              <ellipse cx="843" cy="153" rx="3.5" ry="5.5" fill="#7e5034"/><ellipse cx="877" cy="153" rx="3.5" ry="5.5" fill="#7e5034"/>
              <circle cx="877" cy="160" r="1.4" fill="#e3c06a"/>
              <ellipse cx="860" cy="151" rx="16" ry="19.5" fill="#9a6646"/>
              <path d="M845 140 Q860 128 875 140 Q868 133 860 133 Q852 133 845 140 Z" fill="#2e1c14"/>
              <path class="oeil" d="M849 149 q4 -3 8 0 M863 149 q4 -3 8 0" fill="none" stroke="#1a100b" stroke-width="1.7" stroke-linecap="round"/>
              <path d="M860 151 l-2 8 h4" fill="none" stroke="#7e5034" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M851 162 q9 -5 18 0" fill="none" stroke="#1a100b" stroke-width="3.2" stroke-linecap="round"/>
              <path d="M853 164.5 q7 5 14 0" fill="#f4efe6" stroke="#3b1d14" stroke-width="1.3"/>
              <path d="M855 170 q5 3 10 0 l-1 3 q-4 2 -8 0 z" fill="#1a100b"/>
              <g class="lunettes" fill="rgba(255,255,255,.06)" stroke="#121010" stroke-width="2.2">
                <circle cx="852.5" cy="149" r="6.2"/><circle cx="867.5" cy="149" r="6.2"/><path d="M858.7 148.5 q1.3 -1.5 2.6 0" fill="none"/>
                <path d="M846.3 148 l-3 -1 M873.7 148 l3 -1" fill="none"/>
              </g>
            </g>
          </g>
          <!-- les jambes : sur le coussin, puis devant le fauteuil, les pieds sur le tapis -->
          <path d="M832 240 Q846 236 858 242 L856 266 L834 266 Z" fill="#23262f"/><path d="M862 242 Q874 236 888 240 L886 266 L864 266 Z" fill="#23262f"/>
        </g>
        <!-- le coussin et les accoudoirs, devant le corps -->
        <path d="M800 252 Q860 244 920 252 L920 268 L800 268 Z" fill="#b8693a"/>
        <path d="M768 300 L768 214 Q768 194 790 194 Q812 194 812 214 L812 300 Z" fill="url(#salon-cuir2-${id})"/>
        <path d="M908 300 L908 214 Q908 194 930 194 Q952 194 952 214 L952 300 Z" fill="url(#salon-cuir2-${id})"/>
        <ellipse cx="790" cy="204" rx="16" ry="7" fill="#c47a3c" opacity=".7"/><ellipse cx="930" cy="204" rx="16" ry="7" fill="#c47a3c" opacity=".7"/>
        <rect x="772" y="266" width="176" height="36" rx="5" fill="#8c4a22"/>
        <rect x="778" y="300" width="10" height="24" rx="2" fill="#3b2316"/><rect x="932" y="300" width="10" height="24" rx="2" fill="#3b2316"/>
        <!-- les tibias et les chaussures, devant le fauteuil (rien ne traverse) -->
        <g class="salon-jambes">
          <path d="M845 264 L842 318" stroke="#23262f" stroke-width="21" stroke-linecap="round"/>
          <g class="salon-pied" style="--o:875px 264px"><path d="M875 264 L878 318" stroke="#23262f" stroke-width="21" stroke-linecap="round"/><path d="M866 322 q2 -8 14 -8 q10 0 12 8 z" fill="#3a2418"/></g>
          <path d="M830 322 q2 -8 14 -8 q10 0 12 8 z" fill="#3a2418"/>
        </g>
      </g>

      <!-- le chat qui dort sur le tapis -->
      <g class="salon-chat">
        <ellipse cx="1000" cy="330" rx="26" ry="9" fill="#2b2522"/>
        <circle cx="980" cy="324" r="9" fill="#2b2522"/><path d="M974 317 l2 -7 l4 5 z M982 316 l4 -6 l2 7 z" fill="#2b2522"/>
        <path d="M1024 332 q14 2 10 -8" fill="none" stroke="#2b2522" stroke-width="4" stroke-linecap="round"/>
        <path d="M976 324 q2 1.5 4 0 M982 324 q2 1.5 4 0" stroke="#d9cfc0" stroke-width=".9" fill="none"/>
        <g class="zzz" fill="#8a7f72" font-family="var(--mono, monospace)" font-size="9"><text x="986" y="306">z</text><text x="992" y="298" font-size="7">z</text></g>
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
  // l'humeur du morceau : très doux = il lit ; groovy = la tête et les épaules balancent ;
  // énergique = il tape sur les accoudoirs ; entre les deux, catchy = les mains derrière la tête
  function humeurDe(energie, danse) {
    if (energie <= 3 && danse <= 4) return 'doux';
    if (energie >= 8) return 'energie';
    if (danse >= 6) return 'groove';
    return 'detente';
  }
  function maj({ joue = false, bpm = 96, energie = 5, danse = 5, pochette = null } = {}) {
    let b = Number(bpm) || 96;
    while (b > 132) b /= 2;
    while (b < 66) b *= 2;
    salons.forEach(el => {
      el.classList.toggle('joue', !!joue);
      ['doux', 'energie', 'groove', 'detente'].forEach(h => el.classList.toggle('humeur-' + h, !!joue && humeurDe(energie, danse) === h));
      el.style.setProperty('--battement', (60 / b).toFixed(3) + 's');
      el.style.setProperty('--amplitude', (2.5 + Math.min(10, energie) * .55).toFixed(2) + 'deg');
      const im = el.querySelector('.cadre-pochette');
      if (pochette) { if (im.getAttribute('href') !== pochette) im.setAttribute('href', pochette); el.classList.add('avec-pochette'); }
      else { im.removeAttribute('href'); el.classList.remove('avec-pochette'); }
    });
  }

  return { monter, maj, heure };
})();
