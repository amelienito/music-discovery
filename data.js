/* ════════════════════════════════════════════════════════════════════
   MUSIC DISCOVERY — ta banque musicale
   ════════════════════════════════════════════════════════════════════

   C'est le SEUL fichier que tu as besoin de toucher pour faire vivre
   le site. Tout le reste se construit tout seul à partir d'ici.

   ➜ Pour ajouter un morceau : copie un bloc { ... }, colle-le à la fin
     de la liste (avant le ];), remplis, n'oublie pas la virgule.

   Champs obligatoires
     titre    le nom du morceau
     artiste  le ou les artistes
     lien     le lien YouTube ou YouTube Music du morceau
              (c'est lui qui permet de l'écouter directement sur le site).
              Prends la version officielle : celle de YouTube Music (chaîne
              « Artiste - Topic »), de l'artiste ou de son label.

   Champs facultatifs (tu peux les laisser vides ou les supprimer)
     album    l'album d'origine (aide à trouver la bonne pochette)
     note     TON texte. Trois mots, un pavé, ou rien du tout.
              Rien du tout, c'est très bien aussi : le morceau parle seul.
     volume   de 0.1 à 1, si un morceau est enregistré trop fort.
              (Les morceaux très énergiques sont déjà baissés tout seuls.)
     connu    true pour un morceau connu de tous même si ses interprètes
              ne le sont pas (Mozart, Zelda…) : il ira côté « mainstream ».
     coeur    true pour un coup de cœur (la table de tri le coche pour toi).
     long     true pour un morceau de 20 minutes et plus (simple repère).
     pochette 'maison' si la pochette trouvée en ligne est fausse.
     debut    en secondes, si la vidéo doit démarrer plus loin (ex. 25).
     secours  { lien, note } : une autre version si la première ne passe
              pas, avec son propre commentaire.
     bandcamp le lien Bandcamp du morceau, s'il y est. Il apparaît dans
              « Écouter en entier sur » (sans pub, et l'artiste touche plus).
              Ex : bandcamp: "https://artiste.bandcamp.com/track/morceau"

   La fiche du morceau : c'est elle qui fait que la chaîne enchaîne sans
   à-coups, et qu'« Oriente la suite » va dans le bon sens.
     ambiance son univers : "soleil" (soul, funk, chaleur),
              "bitume" (rap, la ville la nuit), "piste" (pour danser),
              "brume" (doux et rêveur), "ailleurs" (étrange et lointain),
              "electrique" (guitares et pop vive), "epopee" (orchestres,
              jeux vidéo). Les univers voisins sont dans moteur.js.
     style    deux ou trois mots montrés aux visiteurs : "Philly soul"
     annee    l'année de sortie (ou de composition)
     bpm      le tempo, à peu près
     voix     "chant", "rap" ou "instru"
     tags     quelques étiquettes, en minuscules : ["soul", "philly", "cordes"].
              Deux morceaux qui partagent des étiquettes se suivent bien.
   Tu n'as pas à les remplir toi-même : quand tu colles tes « oui » de la
   table de tri, Claude écrit la fiche de chaque nouveau morceau.

   Les réglages (de 0 à 10) servent à « Oriente la suite » (énergie,
   groove, notoriété). Ils ne sont jamais montrés aux visiteurs.
   Ajuste-les à l'instinct :
     energie  0 immobile · 2 calme · 4 posé · 6 ça avance · 8 intense
              · 10 extrême (thrash, metal, speedcore)
     danse    0 impossible (classique, ambient) · 2 on écoute · 4 on hoche
              la tête · 6 ça groove · 8 dansant · 10 club, disco
              (un metal très énergique peut avoir une danse basse : on
              secoue la tête, on ne danse pas)
     etrange  1 évident pour tout le monde · 5 inhabituel · 9 d'où ça sort ?
              (une fois sur le site, c'est le nombre de fans de l'artiste
              sur Deezer qui décide, quand on le connaît)

   ⚠ Les valeurs actuelles sont une première estimation faite par Claude.
     Corrige-les comme tu le sens, c'est ta sélection, pas la sienne.
   ════════════════════════════════════════════════════════════════════ */

const MORCEAUX = [

  { titre: "Losin' Weight", artiste: "Cam'ron feat. Prodigy", album: "S.D.E.",
    lien: "https://music.youtube.com/watch?v=RQxJfDU66rw", note: "Miam le rap",
    ambiance: "bitume", style: "Rap new-yorkais", annee: 2000, bpm: 92, voix: "rap",
    tags: ["rap", "boom bap", "samples soul", "new york"],
    energie: 5, etrange: 3, danse: 4 },

  { titre: "King Back", artiste: "T.I.", album: "King",
    lien: "https://music.youtube.com/watch?v=Q7KuF4aImt8", note: "Cette montée en puissance qui donne envie de monter sur un ring",
    ambiance: "bitume", style: "Rap du Sud", annee: 2006, bpm: 80, voix: "rap",
    tags: ["rap", "sud", "cuivres", "trap"],
    energie: 8, etrange: 2, danse: 6 },

  { titre: "What We Do", artiste: "Freeway feat. JAY-Z & Beanie Sigel", album: "Philadelphia Freeway",
    lien: "https://music.youtube.com/watch?v=ITSVEXkuadk", note: "Morceau emblématique de Philadelphie, y'a tout dans ce titre",
    ambiance: "bitume", style: "Rap de Philadelphie", annee: 2003, bpm: 90, voix: "rap",
    tags: ["rap", "boom bap", "samples soul", "philly"],
    energie: 5, etrange: 2, danse: 4 },

  { titre: "Exhibit C", artiste: "Jay Electronica", album: "Exhibit C",
    lien: "https://music.youtube.com/watch?v=b0c9A74BmcU", note: "J'étais persuadé qu'il était dans GTA V",
    ambiance: "bitume", style: "Rap à samples", annee: 2009, bpm: 92, voix: "rap",
    tags: ["rap", "boom bap", "samples soul", "cuivres"],
    energie: 7, etrange: 4, danse: 3 },

  { titre: "Larry Bird", artiste: "Roc Marciano feat. Knowledge the Pirate & GREA8GAWD", album: "Marciology",
    lien: "https://music.youtube.com/watch?v=KZ8Xu74Ysrk", note: "\"I slept like a white baby\" signé le roi du drumless",
    ambiance: "bitume", style: "Rap underground", annee: 2024, bpm: 80, voix: "rap",
    tags: ["rap", "drumless", "samples soul", "nocturne"],
    energie: 3, etrange: 6, danse: 2 },

  { titre: "I'm the Devil", artiste: "Lil B", album: "6 Kiss",
    lien: "https://music.youtube.com/watch?v=7-1nLlYjpKY", note: "Le plus grand fou du plus grand bus",
    ambiance: "ailleurs", style: "Cloud rap", annee: 2009, bpm: 70, voix: "rap",
    tags: ["rap", "cloud rap", "expérimental", "nocturne"],
    energie: 4, etrange: 9, danse: 3 },

  { titre: "Got to Be Real", artiste: "Cheryl Lynn", album: "Cheryl Lynn",
    lien: "https://music.youtube.com/watch?v=SxW1I0diFqI", note: "Le fait que le son soit à la fois dans un film de Brian De Palma et dans une vidéo The Great Review",
    ambiance: "piste", style: "Disco", annee: 1978, bpm: 118, voix: "chant",
    tags: ["disco", "funk", "cuivres", "solaire"],
    energie: 8, etrange: 1, danse: 10 },

  { titre: "Quiet Storm", artiste: "Smokey Robinson", album: "A Quiet Storm",
    lien: "https://music.youtube.com/watch?v=c52DagmSTdI", note: "La naissance d'un sous-genre éponyme que j'aimais trop pour ne pas placer",
    ambiance: "soleil", style: "Soul quiet storm", annee: 1975, bpm: 84, voix: "chant",
    tags: ["soul", "motown", "nocturne", "ballade"],
    energie: 2, etrange: 3, danse: 3 },

  { titre: "YOU HAVE TO LEAVE!!!", artiste: "Hyas et Tactic 24", album: "LOUDER!!!",
    lien: "https://music.youtube.com/watch?v=yM_KeoOHVy8", note: "Je sais même pas c'est quoi le genre exact mais c'est super",
    ambiance: "piste", style: "Rage, électro dure", annee: 2024, bpm: 150, voix: "rap",
    tags: ["rap", "electro", "club", "hyperpop"],
    energie: 10, etrange: 8, danse: 8 },

  { titre: "Cassius 1999 (Radio Edit)", artiste: "Cassius", album: "1999",
    lien: "https://music.youtube.com/watch?v=J8fMAXnDocs", note: "Je l'ai découvert si tard",
    ambiance: "piste", style: "French touch", annee: 1999, bpm: 124, voix: "instru",
    tags: ["house", "french touch", "club", "disco"],
    energie: 8, etrange: 2, danse: 10 },

  { titre: "SWING", artiste: "Angie", album: "SWING",
    lien: "https://music.youtube.com/watch?v=guDSFndnX_M", note: "Goûts de chipies ou quoi ?",
    ambiance: "piste", style: "Rap afro-R&B", annee: 2024, bpm: 105, voix: "rap",
    tags: ["rap", "rnb", "afro", "solaire"],
    energie: 6, etrange: 5, danse: 7 },

  { titre: "CSIRAC", artiste: "Ninajirachi", album: "I Love My Computer", sansExtrait: true,
    lien: "https://music.youtube.com/watch?v=L_rc7qJyFOQ", note: "J'ai fait tellement de vaisselles grâce à ce titre.",
    ambiance: "piste", style: "Électro club", annee: 2025, bpm: 140, voix: "instru",
    tags: ["electro", "club", "hyperpop", "synthés"],
    energie: 9, etrange: 7, danse: 8 },

  { titre: "Nomad", artiste: "Clairo", album: "Charm",
    lien: "https://music.youtube.com/watch?v=RdRD80xT2mc", note: "Un peu facile mais quand même bien",
    ambiance: "brume", style: "Soft rock seventies", annee: 2024, bpm: 80, voix: "chant",
    tags: ["indie", "pop", "ballade", "piano"],
    energie: 2, etrange: 3, danse: 2 },

  { titre: "Heaven is a Home", artiste: "Kali Uchis", album: "Sincerely",
    lien: "https://music.youtube.com/watch?v=3CsPC9C8Oa4", note: "La hauteur des violons, de la voix, t'iras loin @kali",
    ambiance: "brume", style: "R&B rêveur", annee: 2025, bpm: 75, voix: "chant",
    tags: ["rnb", "pop", "voix aérienne", "ballade"],
    energie: 2, etrange: 4, danse: 3 },

  { titre: "The Field", artiste: "Blood Orange feat. Caroline Polachek & Daniel Caesar", album: "Essex Honey",
    lien: "https://music.youtube.com/watch?v=Brt_wrBrSqQ", note: "bellemusique.mp3 #mouettes",
    ambiance: "brume", style: "Pop de chambre", annee: 2025, bpm: 80, voix: "chant",
    tags: ["rnb", "indie", "cordes", "mélancolique"],
    energie: 3, etrange: 6, danse: 2 },

  { titre: "Six Songs for Invisible Gardens", artiste: "Green-House", album: "Six Songs for Invisible Gardens",
    lien: "https://music.youtube.com/watch?v=nqCTPxdW9tQ", note: "J'ai mis l'album direct, idéal pour lire ou se reposer", long: true,
    ambiance: "brume", style: "Ambient", annee: 2020, bpm: 60, voix: "instru",
    tags: ["ambient", "synthés", "nature", "long"],
    energie: 0, etrange: 7, danse: 0 },

  { titre: "Plume Valley", artiste: "Windows96", album: "Plume Valley",
    lien: "https://music.youtube.com/watch?v=MFBOtWq7dsE", note: "J'ai pas d'autres explications que : suggestions nocturnes de YouTube", long: true,
    ambiance: "brume", style: "Ambient vaporwave", annee: 2019, bpm: 60, voix: "instru",
    tags: ["ambient", "vaporwave", "synthés", "long"],
    energie: 1, etrange: 8, danse: 0 },

  { titre: "Fly-day Chinatown", artiste: "Yasuha", album: "Transit",
    lien: "https://music.youtube.com/watch?v=hci81q8Q49Q", note: "Elle parle bien du quartier Chinatown à Yokohama au Japon, je sais que vous le saviez",
    ambiance: "soleil", style: "City pop", annee: 1981, bpm: 125, voix: "chant",
    tags: ["citypop", "funk", "disco", "japon"],
    energie: 7, etrange: 4, danse: 8 },

  { titre: "私のすべて", artiste: "Pizzicato Five", album: "The Band of 20th Century",
    lien: "https://music.youtube.com/watch?v=SD_Hk_O5YFA", note: "Je sais même plus comment je suis tombé sur ça mais la contrebasse m'a eu",
    ambiance: "ailleurs", style: "Shibuya-kei", annee: 1986, bpm: 120, voix: "chant",
    tags: ["citypop", "pop", "lounge", "japon"],
    energie: 5, etrange: 6, danse: 6 },

  { titre: "Euryale", artiste: "Serge Bulot", album: "Euryale",
    lien: "https://music.youtube.com/watch?v=5P2hiU8J5QE", note: "Bien nébuleux comme on aime",
    ambiance: "ailleurs", style: "Synthés minimalistes", annee: 1983, bpm: 100, voix: "instru",
    tags: ["electro", "synthés", "minimal", "expérimental"],
    energie: 3, etrange: 7, danse: 2 },

  { titre: "Big City Life", artiste: "Mattafix", album: "Signs of a Struggle",
    lien: "https://music.youtube.com/browse/MPREb_JvDDGFtLBYc", note: "",
    ambiance: "soleil", style: "Reggae-pop", annee: 2005, bpm: 95, voix: "chant",
    tags: ["pop", "reggae", "soul", "solaire"],
    energie: 5, etrange: 2, danse: 6 },

  { titre: "good girl, lassie.", artiste: "is it sunday?", album: "good girl, give them reason to stare.",
    lien: "https://music.youtube.com/watch?v=09hEFrUZrXA", note: "Et c'est même pas le meilleur son de l'album",
    ambiance: "electrique", style: "Indie émo", annee: 2023, bpm: 120, voix: "chant",
    tags: ["indie", "rock", "guitares", "mélancolique"],
    energie: 5, etrange: 6, danse: 3 },

  { titre: "Scheherazade, Op. 35: III. The Young Prince and The Young Princess", artiste: "Rimsky-Korsakov, New York Philharmonic", album: "",
    lien: "https://music.youtube.com/watch?v=07pZtrFkfWo", note: "Y'a quoi de mieux que la musique ?", connu: true,
    ambiance: "brume", style: "Romantique russe", annee: 1888, bpm: 70, voix: "instru",
    tags: ["classique", "orchestre", "cordes", "romantique"],
    energie: 2, etrange: 3, danse: 1 },

  { titre: "Piano Concerto No. 2: I. Moderato", artiste: "Rachmaninoff, Krystian Zimerman", album: "",
    lien: "https://music.youtube.com/watch?v=caR7C2SHdFI", note: "Je suis pensif comme lui en écoutant", connu: true,
    ambiance: "epopee", style: "Concerto romantique", annee: 1901, bpm: 70, voix: "instru",
    tags: ["classique", "piano", "orchestre", "romantique"],
    energie: 6, etrange: 2, danse: 0 },

  { titre: "Serenata D.957", artiste: "Schubert, The Royal Schubert Orchestra", album: "",
    lien: "https://music.youtube.com/watch?v=Huy791G17Ak", note: "J'aurais pu mettre l'Andantino D.960 mais je voulais pas être clivant", connu: true,
    ambiance: "brume", style: "Romantique", annee: 1828, bpm: 70, voix: "instru",
    tags: ["classique", "cordes", "ballade", "romantique"],
    energie: 1, etrange: 2, danse: 0 },

  { titre: "Ma Tfel", artiste: "Ziad Rahbani", album: "Houdou Nisbi",
    lien: "https://music.youtube.com/watch?v=NLurnvYk0aI", note: "La pop libanaise : sous-cotée",
    ambiance: "ailleurs", style: "Jazz oriental libanais", annee: 1978, bpm: 100, voix: "chant",
    tags: ["monde", "jazz", "funk", "arabe"],
    energie: 5, etrange: 6, danse: 6 },

  { titre: "Close the Door", artiste: "Teddy Pendergrass", album: "Life Is a Song Worth Singing",
    lien: "https://music.youtube.com/watch?v=QEbyvA9srrE", note: "Il tendait la MPC pour se faire sampler...",
    ambiance: "soleil", style: "Philly soul", annee: 1978, bpm: 72, voix: "chant",
    tags: ["soul", "philly", "ballade", "nocturne"],
    energie: 2, etrange: 2, danse: 4 },

  { titre: "Motherless Child", artiste: "Marvin Holmes and Justice", album: "",
    lien: "https://music.youtube.com/watch?v=JXwSLmHlu_U", note: "Parfois j'ai rien à dire si ce n'est : belle boucle",
    ambiance: "soleil", style: "Funk psychédélique", annee: 1971, bpm: 100, voix: "chant",
    tags: ["funk", "soul", "psyché", "cuivres"],
    energie: 6, etrange: 5, danse: 7 },

  { titre: "Les matins d'hiver", artiste: "Gérard Lenorman", album: "",
    lien: "https://music.youtube.com/watch?v=ELF91NCD_-I", note: "",
    ambiance: "soleil", style: "Chanson seventies", annee: 1977, bpm: 90, voix: "chant",
    tags: ["chanson", "ballade", "cordes", "mélancolique"],
    energie: 2, etrange: 3, danse: 1 },

  { titre: "(v)oOOOOOOooo", artiste: "⣎⡇ꉺლ༽இ•̛)ྀ◞ ༎ຶ ༽ৣৢ؞ৢ؞ؖ ꉺლ", album: "",
    lien: "https://music.youtube.com/watch?v=29Sh3yEaBP8", note: "Performatif mais pas que",
    ambiance: "ailleurs", style: "Ambient d'internet", annee: 2018, bpm: 70, voix: "instru",
    tags: ["ambient", "vaporwave", "expérimental", "glitch"],
    energie: 2, etrange: 9, danse: 1 },

  { titre: "err:log", artiste: "cast heal", album: "err:log",
    lien: "https://music.youtube.com/watch?v=DCcAlLqOM8E", note: "J'ai une passion inexpliquée pour certains titres",
    ambiance: "ailleurs", style: "Électronique glitch", annee: 2023, bpm: 90, voix: "instru",
    tags: ["electro", "glitch", "expérimental", "ambient"],
    energie: 4, etrange: 8, danse: 3 },

  { titre: "Till", artiste: "Conjunto Capri", album: "",
    lien: "https://music.youtube.com/watch?v=5Ov-yEqFYvk", note: "",
    ambiance: "brume", style: "Lounge latino", annee: 1965, bpm: 80, voix: "instru",
    tags: ["jazz", "lounge", "monde", "orgue"],
    energie: 2, etrange: 5, danse: 3 },

  { titre: "Zelda's Lullaby (Skyward Sword)", artiste: "The Legend of Zelda", album: "",
    lien: "https://music.youtube.com/watch?v=YHO6EDIbGlk", note: "", connu: true,
    ambiance: "brume", style: "Musique de jeu vidéo", annee: 2011, bpm: 60, voix: "instru",
    tags: ["bo", "orchestre", "harpe", "berceuse"],
    energie: 1, etrange: 3, danse: 0 },

  { titre: "Great Fairy's Fountain", artiste: "Sleeping Phoenix", album: "Great Fairy's Fountain (From \"The Legend of Zelda - Ocarina of Time\")",
    lien: "https://music.youtube.com/watch?v=O5HGP6yf0GA", note: "La super grande fontaine de furry",
    ambiance: "brume", style: "Jeu vidéo en douceur", annee: 2020, bpm: 70, voix: "instru",
    tags: ["bo", "ambient", "piano", "berceuse"],
    energie: 1, etrange: 4, danse: 0 },

  { titre: "The Flight of the Bumble-bee", artiste: "Rimsky-Korsakov, Neeme Järvi", album: "",
    lien: "https://music.youtube.com/watch?v=kh6gSLInIXo", note: "Tachycardie land", connu: true,
    ambiance: "epopee", style: "Virtuosité orchestrale", annee: 1900, bpm: 170, voix: "instru",
    tags: ["classique", "orchestre", "virtuose", "rapide"],
    energie: 8, etrange: 3, danse: 1 },

  { titre: "Tócame (feat. Dillom)", artiste: "Six Sex", album: "X-sex",
    lien: "https://music.youtube.com/watch?v=rh6agFmfyhI", note: "",
    ambiance: "piste", style: "Électro-perreo", annee: 2023, bpm: 128, voix: "chant",
    tags: ["electro", "reggaeton", "club", "latin"],
    energie: 8, etrange: 6, danse: 9 },

  { titre: "夜に駆ける", artiste: "YOASOBI", album: "夜に駆ける",
    lien: "https://music.youtube.com/watch?v=by4SYYWlhEs", note: "La montée en intensité, miam",
    ambiance: "electrique", style: "J-pop", annee: 2019, bpm: 130, voix: "chant",
    tags: ["pop", "japon", "piano", "rapide"],
    energie: 8, etrange: 3, danse: 6 },

  { titre: "Be Ever Wonderful", artiste: "Earth, Wind & Fire", album: "All 'N All",
    lien: "https://music.youtube.com/watch?v=HLyU8BWfGKA", note: "",
    ambiance: "soleil", style: "Soul ballade", annee: 1977, bpm: 70, voix: "chant",
    tags: ["soul", "ballade", "cuivres", "cordes"],
    energie: 2, etrange: 2, danse: 3 },

  { titre: "Walking With Ice Cream", artiste: "Tupperwave", album: "Grocery Store Sunset",
    lien: "https://music.youtube.com/watch?v=7Uv3P8-rhB8", note: "L'effet des loops sur mon cerveau",
    ambiance: "brume", style: "Vaporwave douce", annee: 2017, bpm: 95, voix: "instru",
    tags: ["vaporwave", "ambient", "funk", "synthés"],
    energie: 3, etrange: 6, danse: 4 },

  { titre: "At Doom's Gate", artiste: "Mick Gordon", album: "DOOM (Original Game Soundtrack)",
    lien: "https://music.youtube.com/watch?v=Lp-TdtDYGAA", note: "DOOM 2016 m'a fait changer mon regard sur ce handicap qu'est le metal",
    ambiance: "epopee", style: "Metal de jeu vidéo", annee: 2016, bpm: 140, voix: "instru",
    tags: ["metal", "bo", "guitares", "synthés"],
    energie: 10, etrange: 5, danse: 2 },

  { titre: "Have It All (feat. Pharrell)", artiste: "Gucci Mane", album: "",
    lien: "https://music.youtube.com/watch?v=RdAAAUPYti4", note: "Pharrell, t'étais pas obligé de te forcer à poser",
    ambiance: "bitume", style: "Trap", annee: 2020, bpm: 75, voix: "rap",
    tags: ["rap", "trap", "sud", "solaire"],
    energie: 5, etrange: 3, danse: 6 },

  { titre: "Dove", artiste: "Orca", album: "",
    lien: "https://music.youtube.com/watch?v=4uX1fGGDD9k", note: "",
    ambiance: "bitume", style: "Rap brumeux", annee: 2022, bpm: 80, voix: "rap",
    tags: ["rap", "nocturne", "expérimental", "lofi"],
    energie: 3, etrange: 7, danse: 2 },

  { titre: "remember?", artiste: "svnti", album: "",
    lien: "https://music.youtube.com/watch?v=4qCZ1WcPWr4", note: "",
    ambiance: "bitume", style: "Rap lo-fi", annee: 2022, bpm: 80, voix: "rap",
    tags: ["rap", "lofi", "ambient", "mélancolique"],
    energie: 2, etrange: 6, danse: 2 },

  { titre: "Yesterday I Had the Blues", artiste: "Harold Melvin & The Blue Notes", album: "",
    lien: "https://music.youtube.com/watch?v=jCwDytox1sM", note: "",
    ambiance: "soleil", style: "Philly soul", annee: 1972, bpm: 90, voix: "chant",
    tags: ["soul", "philly", "cordes", "ballade"],
    energie: 4, etrange: 2, danse: 5 },

  { titre: "Clair de Lune", artiste: "Claude Debussy", album: "",
    lien: "https://music.youtube.com/watch?v=WKU8DJzipW4", note: "", connu: true,
    ambiance: "brume", style: "Impressionnisme", annee: 1905, bpm: 60, voix: "instru",
    tags: ["classique", "piano", "ballade", "romantique"],
    energie: 1, etrange: 1, danse: 0 },

  { titre: "Bobby", artiste: "Phoebe Bridgers", album: "Lost Weekend",
    lien: "https://music.youtube.com/watch?v=yLbf1Wgida4", note: "",
    ambiance: "brume", style: "Folk indé", annee: 2018, bpm: 80, voix: "chant",
    tags: ["indie", "folk", "guitares", "mélancolique"],
    energie: 1, etrange: 4, danse: 1 },

  { titre: "Stop The Wedding!", artiste: "Ashe", album: "Stop The Wedding!",
    lien: "https://music.youtube.com/watch?v=WNxAvQNsJuM", note: "",
    ambiance: "electrique", style: "Pop", annee: 2023, bpm: 110, voix: "chant",
    tags: ["pop", "piano", "ballade", "rock"],
    energie: 5, etrange: 3, danse: 4 },

  { titre: "Sing", artiste: "Carpenters", album: "Now & Then",
    lien: "https://music.youtube.com/watch?v=U07qx3MBEoI", note: "",
    ambiance: "soleil", style: "Soft pop seventies", annee: 1973, bpm: 90, voix: "chant",
    tags: ["pop", "ballade", "choeur", "solaire"],
    energie: 2, etrange: 2, danse: 3 },

  { titre: "premium package", artiste: "SOMA", album: "quêtes secondaires* vol.1",
    lien: "https://music.youtube.com/watch?v=ycoaG_klmkY", note: "",
    ambiance: "ailleurs", style: "Hyperpop", annee: 2023, bpm: 140, voix: "chant",
    tags: ["electro", "hyperpop", "expérimental", "pop"],
    energie: 7, etrange: 8, danse: 6 },

  { titre: "Gingerbread Boy", artiste: "Miles Davis", album: "Miles Smiles",
    lien: "https://music.youtube.com/watch?v=fVndRGAF8Gg", note: "",
    ambiance: "ailleurs", style: "Jazz post-bop", annee: 1967, bpm: 200, voix: "instru",
    tags: ["jazz", "cuivres", "rapide", "expérimental"],
    energie: 7, etrange: 6, danse: 3 },

  { titre: "Forse Domani", artiste: "Giampiero Boneschi & Sergio Farina", album: "",
    lien: "https://music.youtube.com/watch?v=84hFDVEK3jQ", note: "",
    ambiance: "brume", style: "Lounge jazz italien", annee: 1970, bpm: 95, voix: "instru",
    tags: ["jazz", "lounge", "library", "cordes"],
    energie: 3, etrange: 5, danse: 4 },

  { titre: "Funky Fanfare", artiste: "Keith Mansfield", album: "",
    lien: "https://music.youtube.com/watch?v=tUFwQjOpqJM", note: "On dirait presque le générique des Boondocks",
    ambiance: "soleil", style: "Funk de librairie", annee: 1968, bpm: 110, voix: "instru",
    tags: ["funk", "cuivres", "library", "jazz"],
    energie: 7, etrange: 4, danse: 8 },

  { titre: "The Empty Room", artiste: "Haruomi Hosono", album: "Manbiki Kazoku (Shoplifters) Original Soundtrack",
    lien: "https://music.youtube.com/watch?v=CYC30CSXG4o", note: "",
    ambiance: "brume", style: "Ambient japonais", annee: 2018, bpm: 70, voix: "instru",
    tags: ["ambient", "synthés", "japon", "minimal"],
    energie: 1, etrange: 6, danse: 0 },

  { titre: "Symphonie n° 6 : I. Allegro energico, ma non troppo", artiste: "Mahler, Berliner Philharmoniker", album: "",
    lien: "https://music.youtube.com/watch?v=hoVnIDmuwLw", note: "", connu: true,
    ambiance: "epopee", style: "Symphonie tragique", annee: 1904, bpm: 120, voix: "instru",
    tags: ["classique", "orchestre", "cuivres", "romantique"],
    energie: 8, etrange: 4, danse: 1 },

  { titre: "Symphonie n° 2 : IV. Finale (Allegro moderato)", artiste: "Sibelius, Berliner Philharmoniker", album: "",
    lien: "https://music.youtube.com/watch?v=-10jYSvWYeI", note: "", connu: true,
    ambiance: "epopee", style: "Finale symphonique", annee: 1902, bpm: 100, voix: "instru",
    tags: ["classique", "orchestre", "cuivres", "romantique"],
    energie: 6, etrange: 3, danse: 0 },

  { titre: "Resurrections", artiste: "Lena Raine", album: "Celeste (Original Soundtrack)",
    lien: "https://music.youtube.com/watch?v=-YjgOzSQNQ0", note: "",
    ambiance: "epopee", style: "Musique de jeu vidéo", annee: 2018, bpm: 120, voix: "instru",
    tags: ["bo", "electro", "piano", "synthés"],
    energie: 6, etrange: 4, danse: 4 },

  { titre: "Moments (Voice Memo)", artiste: "Teesa", album: "Moments (Voice Memo)",
    lien: "https://music.youtube.com/watch?v=R8BmJxhrZdo", note: "",
    ambiance: "brume", style: "Mémo vocal intime", annee: 2023, bpm: 70, voix: "chant",
    tags: ["rnb", "lofi", "mélancolique", "voix aérienne"],
    energie: 1, etrange: 7, danse: 0 },

  { titre: "Wake Up Everybody", artiste: "Harold Melvin & The Blue Notes", album: "Wake Up Everybody",
    lien: "https://music.youtube.com/watch?v=FMR6eMHjqIo", note: "",
    ambiance: "soleil", style: "Philly soul", annee: 1975, bpm: 100, voix: "chant",
    tags: ["soul", "philly", "cordes", "piano"],
    energie: 4, etrange: 2, danse: 5 },

  { titre: "Out Of The Picture", artiste: "Tavares", album: "Love Storm",
    lien: "https://music.youtube.com/watch?v=w_VZD6RcQI4", note: "Many men…",
    ambiance: "soleil", style: "Soul seventies", annee: 1975, bpm: 108, voix: "chant",
    tags: ["soul", "disco", "cordes", "solaire"],
    energie: 5, etrange: 3, danse: 6 },

  { titre: "Swing and Jump", artiste: "Alba Lamar", album: "",
    lien: "https://music.youtube.com/watch?v=pNPw1PZboWI", note: "",
    ambiance: "piste", style: "Électro swing", annee: 2015, bpm: 125, voix: "instru",
    tags: ["electro", "swing", "jazz", "club"],
    energie: 7, etrange: 5, danse: 8 },

  { titre: "Overjoyed", artiste: "Stevie Wonder", album: "In Square Circle",
    lien: "https://music.youtube.com/watch?v=678STgx-Esw", note: "J'y crois à la théorie qu'il est pas vraiment aveugle",
    ambiance: "soleil", style: "Soul ballade", annee: 1985, bpm: 72, voix: "chant",
    tags: ["soul", "ballade", "piano", "motown"],
    energie: 2, etrange: 2, danse: 2 },

  { titre: "Concerto pour piano n° 21 : II. Andante", artiste: "Mozart, London Mozart Players", album: "",
    lien: "https://music.youtube.com/watch?v=sgqtFZ9S5sA", note: "", connu: true,
    ambiance: "brume", style: "Classique", annee: 1785, bpm: 60, voix: "instru",
    tags: ["classique", "piano", "orchestre", "ballade"],
    energie: 1, etrange: 1, danse: 0 },

  { titre: "My Cherie Amour", artiste: "Stevie Wonder", album: "My Cherie Amour",
    lien: "https://music.youtube.com/watch?v=Fjufjv4rH0s", note: "",
    ambiance: "soleil", style: "Motown", annee: 1969, bpm: 110, voix: "chant",
    tags: ["soul", "motown", "cordes", "solaire"],
    energie: 3, etrange: 1, danse: 5 },

  { titre: "Outstanding", artiste: "The Gap Band", album: "Gap Band IV",
    lien: "https://music.youtube.com/watch?v=xBcpaB8lq44", note: "",
    ambiance: "soleil", style: "Boogie funk", annee: 1982, bpm: 98, voix: "chant",
    tags: ["funk", "boogie", "synthés", "solaire"],
    energie: 4, etrange: 2, danse: 7 },

  { titre: "Come Outside", artiste: "ScarLip", album: "Come Outside",
    lien: "https://music.youtube.com/watch?v=q34xnPe-C1g", note: "Les fous et les folles sauveront le rap",
    ambiance: "bitume", style: "Drill new-yorkaise", annee: 2022, bpm: 140, voix: "rap",
    tags: ["rap", "drill", "new york", "nocturne"],
    energie: 8, etrange: 5, danse: 6 },

  { titre: "MINISKIRT", artiste: "Aliyah's Interlude", album: "MINISKIRT",
    lien: "https://music.youtube.com/watch?v=fUTpvxkgA80", note: "",
    ambiance: "piste", style: "Rap house-pop", annee: 2025, bpm: 125, voix: "rap",
    tags: ["rap", "house", "club", "pop"],
    energie: 7, etrange: 5, danse: 8 },

  { titre: "Les volets clos", artiste: "Paul Mauriat", album: "",
    lien: "https://music.youtube.com/watch?v=lkHNEb72DH0", note: "",
    ambiance: "brume", style: "Orchestre easy listening", annee: 1972, bpm: 80, voix: "instru",
    tags: ["orchestre", "lounge", "cordes", "chanson"],
    energie: 2, etrange: 4, danse: 2 },

  { titre: "Bi Kelma Menak", artiste: "Sherine", album: "Batamenak",
    lien: "https://music.youtube.com/watch?v=BSHhX8nypcY", note: "",
    ambiance: "ailleurs", style: "Pop égyptienne", annee: 2008, bpm: 95, voix: "chant",
    tags: ["monde", "arabe", "pop", "cordes"],
    energie: 4, etrange: 5, danse: 5 },

  { titre: "Raubíri", artiste: "Marcel Gidote's Holy Crab", album: "Felvidék (OST)",
    lien: "https://music.youtube.com/watch?v=CA1ZmK3DC8o", note: "Ça peut être hongrois/slovaque, mon cœur ne suit que la batterie",
    ambiance: "ailleurs", style: "Rock psyché-jazz tchèque", annee: 2024, bpm: 110, voix: "instru",
    tags: ["rock", "jazz", "psyché", "expérimental"],
    energie: 6, etrange: 8, danse: 4 },

  { titre: "I Miss You (Part 1)", artiste: "David Ruffin", album: "David Ruffin",
    lien: "https://music.youtube.com/watch?v=sbNioahCQlA", note: "Bring back yearning music",
    ambiance: "soleil", style: "Soul seventies", annee: 1973, bpm: 80, voix: "chant",
    tags: ["soul", "ballade", "cordes", "nocturne"],
    energie: 3, etrange: 3, danse: 3 },

  { titre: "Walk Away From Love", artiste: "David Ruffin", album: "Who I Am",
    lien: "https://music.youtube.com/watch?v=34yv3D8oYBI", note: "Le meilleur des Ruffin",
    ambiance: "soleil", style: "Soul disco", annee: 1975, bpm: 115, voix: "chant",
    tags: ["soul", "disco", "cordes", "solaire"],
    energie: 6, etrange: 2, danse: 8 },

  { titre: "Through the Fire (A COLORS SHOW)", artiste: "Chaka Khan", album: "",
    lien: "https://music.youtube.com/watch?v=HiEz8agZmnM", note: "",
    ambiance: "soleil", style: "Soul ballade, en live", annee: 2023, bpm: 70, voix: "chant",
    tags: ["soul", "rnb", "ballade", "piano"],
    energie: 3, etrange: 2, danse: 2 },

  { titre: "Jōdo", artiste: "Hiroshi Sato", album: "Time",
    lien: "https://music.youtube.com/watch?v=xCJIDvmyKO8", note: "Faut être patient",
    ambiance: "brume", style: "Ambient japonais", annee: 1977, bpm: 80, voix: "instru",
    tags: ["ambient", "japon", "synthés", "jazz"],
    energie: 2, etrange: 6, danse: 2 },

  { titre: "Life goes on", artiste: "Steven Boyd", album: "",
    lien: "https://music.youtube.com/watch?v=uYa_YH9AH3A", note: "",
    ambiance: "soleil", style: "Boogie AOR", annee: 1983, bpm: 105, voix: "chant",
    tags: ["soul", "boogie", "synthés", "solaire"],
    energie: 5, etrange: 5, danse: 6 },

  { titre: "Symphonie n° 1 : I. Allegro (molto moderato)", artiste: "Bruckner, Orchestre Métropolitain", album: "",
    lien: "https://music.youtube.com/watch?v=_Ak0zpy-ICU", note: "Posez-vous un quart d'heure…", connu: true,
    ambiance: "epopee", style: "Symphonie romantique", annee: 1866, bpm: 100, voix: "instru",
    tags: ["classique", "orchestre", "cuivres", "romantique"],
    energie: 7, etrange: 4, danse: 1 },

  { titre: "Mermaid", artiste: "Sade", album: "Love Deluxe",
    lien: "https://music.youtube.com/watch?v=dwTedc_QUOI", note: "",
    ambiance: "soleil", style: "Soul feutrée", annee: 1992, bpm: 75, voix: "chant",
    tags: ["soul", "rnb", "nocturne", "ballade"],
    energie: 2, etrange: 4, danse: 3 },

  { titre: "I Miss You, Pt. 1", artiste: "Harold Melvin & The Blue Notes", album: "I Miss You",
    lien: "https://music.youtube.com/watch?v=4fIeEVHhGyQ", note: "",
    ambiance: "soleil", style: "Philly soul", annee: 1972, bpm: 75, voix: "chant",
    tags: ["soul", "philly", "ballade", "cordes"],
    energie: 2, etrange: 2, danse: 3 },

  { titre: "The Adults Are Talking", artiste: "The Strokes", album: "The New Abnormal",
    lien: "https://music.youtube.com/watch?v=826mxiKjoP0", note: "",
    ambiance: "electrique", style: "Rock indé new-yorkais", annee: 2020, bpm: 165, voix: "chant",
    tags: ["rock", "indie", "guitares", "new york"],
    energie: 6, etrange: 2, danse: 6 },

  { titre: "The Weekend (Radio Edit)", artiste: "Michael Gray", album: "The Weekend",
    lien: "https://music.youtube.com/watch?v=uDGJ9DyF25I", note: "Juste, j'adore ce son",
    ambiance: "piste", style: "House disco", annee: 2004, bpm: 127, voix: "chant",
    tags: ["house", "disco", "club", "solaire"],
    energie: 8, etrange: 2, danse: 9 },

  { titre: "The Only Thing They Fear...", artiste: "Banana Jim", album: "",
    lien: "https://music.youtube.com/watch?v=w5k4YLWvOT0", note: "",
    ambiance: "epopee", style: "Metal de jeu vidéo", annee: 2020, bpm: 130, voix: "instru",
    tags: ["metal", "bo", "guitares", "rapide"],
    energie: 10, etrange: 6, danse: 2 },

  { titre: "Reasons", artiste: "Earth, Wind & Fire", album: "That's the Way of the World",
    lien: "https://music.youtube.com/watch?v=zTeD3RWvE6A", note: "Bisous à Cam'ron",
    ambiance: "soleil", style: "Soul ballade", annee: 1975, bpm: 68, voix: "chant",
    tags: ["soul", "ballade", "cuivres", "nocturne"],
    energie: 2, etrange: 2, danse: 2 },

  { titre: "ANTIOXYDANT", artiste: "Mairo", album: "BLISS",
    lien: "https://music.youtube.com/watch?v=fYky_uuCzVE", note: "J'ai vraiment un truc pour les saxos",
    ambiance: "bitume", style: "Rap français", annee: 2023, bpm: 90, voix: "rap",
    tags: ["rap", "boom bap", "france", "samples soul"],
    energie: 6, etrange: 5, danse: 5 },

  { titre: "Can't Take My Eyes Off You (Original Extended Version)", artiste: "Boys Town Gang", album: "Disc Charge",
    lien: "https://music.youtube.com/watch?v=i0iD4KzoIqk", note: "Si je veux mettre la version 9 minutes, vous allez faire quoi ?", debut: 23,
    ambiance: "piste", style: "Hi-NRG disco", annee: 1982, bpm: 130, voix: "chant",
    tags: ["disco", "club", "cuivres", "solaire"],
    energie: 8, etrange: 3, danse: 10 },

  { titre: "Fantasy", artiste: "Aquarian Dream", album: "Fantasy",
    lien: "https://music.youtube.com/watch?v=2p8Ev0jm8kM", note: "",
    ambiance: "soleil", style: "Jazz-funk disco", annee: 1978, bpm: 115, voix: "chant",
    tags: ["funk", "disco", "jazz", "solaire"],
    energie: 6, etrange: 4, danse: 8 },

  { titre: "Mutant", artiste: "Arca", album: "Mutant",
    lien: "https://music.youtube.com/watch?v=pW4I_y56DC0", note: "Franchement, dites rien, je sais",
    ambiance: "ailleurs", style: "Électronique expérimentale", annee: 2015, bpm: 90, voix: "instru",
    tags: ["electro", "expérimental", "glitch", "nocturne"],
    energie: 6, etrange: 9, danse: 2 },

  { titre: "No Voy a Llorar", artiste: "DJ Pablito", album: "",
    lien: "https://music.youtube.com/watch?v=hSUAlPKgeto", note: "",
    ambiance: "piste", style: "Cumbia club", annee: 2023, bpm: 100, voix: "chant",
    tags: ["latin", "club", "electro", "reggaeton"],
    energie: 7, etrange: 6, danse: 8 },

  { titre: "MINIBUS AVEC LES PETITS", artiste: "Igouh", album: "l'argent 2 la caf vol.2",
    lien: "https://music.youtube.com/watch?v=4xeY7BinY9E", note: "",
    ambiance: "bitume", style: "Rap français", annee: 2024, bpm: 140, voix: "rap",
    tags: ["rap", "france", "trap", "nocturne"],
    energie: 7, etrange: 6, danse: 6 },

  { titre: "STOPLIGHT", artiste: "SUMIN", album: "MINISERIES 2",
    lien: "https://music.youtube.com/watch?v=Ox3uJaLsXgI", note: "Je suis tellement en propagande",
    ambiance: "piste", style: "R&B électronique coréen", annee: 2024, bpm: 110, voix: "chant",
    tags: ["rnb", "electro", "pop", "club"],
    energie: 5, etrange: 5, danse: 6 },

  { titre: "Moral Tem Hora", artiste: "Cristina Camargo", album: "Moral Tem Hora / Minas Do Rei Salomão",
    lien: "https://music.youtube.com/watch?v=O5FlEwQ1IHo", note: "",
    ambiance: "ailleurs", style: "Musique brésilienne", annee: 1975, bpm: 105, voix: "chant",
    tags: ["monde", "bresil", "funk", "samba"],
    energie: 5, etrange: 6, danse: 6 },

  { titre: "Une pieuvre dans un seau", artiste: "Surprise", album: "Une pieuvre dans un seau",
    lien: "https://music.youtube.com/watch?v=eEXjdCmQ5pU", note: "",
    ambiance: "ailleurs", style: "Pop bizarre", annee: 2022, bpm: 100, voix: "chant",
    tags: ["pop", "expérimental", "france", "chanson"],
    energie: 4, etrange: 7, danse: 3 },

  { titre: "honeybee", artiste: "Olivia Rodrigo", album: "you seem pretty sad for a girl so in love",
    lien: "https://music.youtube.com/watch?v=OrNTGMmSpz0", note: "J'ai pas encore mentionné mon obsession pour les chœurs",
    ambiance: "electrique", style: "Pop", annee: 2025, bpm: 100, voix: "chant",
    tags: ["pop", "guitares", "ballade", "indie"],
    energie: 3, etrange: 2, danse: 3 },

  { titre: "264bpm Song", artiste: "Andrew Baena", album: "264bpm Song",
    lien: "https://music.youtube.com/watch?v=kSF0hIIDofM", note: "264 bpm, c'est assez pour vous ?",
    ambiance: "electrique", style: "Metal à 264 bpm", annee: 2020, bpm: 264, voix: "instru",
    tags: ["metal", "guitares", "rapide", "expérimental"],
    energie: 10, etrange: 8, danse: 3 },

  { titre: "Hooked (Remastered)", artiste: "D.R.I.", album: "Crossover",
    lien: "https://music.youtube.com/watch?v=PXIuSHT4YoE", note: "",
    ambiance: "electrique", style: "Crossover thrash", annee: 1987, bpm: 200, voix: "chant",
    tags: ["punk", "metal", "guitares", "rapide"],
    energie: 10, etrange: 5, danse: 3 },

  { titre: "Private Valet", artiste: "Larry June", album: "Spaceships on the Blade",
    lien: "https://music.youtube.com/watch?v=TIBbr_u9gBc", note: "",
    ambiance: "bitume", style: "Rap West Coast cool", annee: 2022, bpm: 85, voix: "rap",
    tags: ["rap", "samples soul", "solaire", "west coast"],
    energie: 4, etrange: 3, danse: 5 },

  { titre: "All of Me", artiste: "Andrus, Blackwood & Co.", album: "Following You",
    lien: "https://music.youtube.com/watch?v=t2mSibwG6Hg", note: "",
    ambiance: "soleil", style: "Gospel soul", annee: 1978, bpm: 105, voix: "chant",
    tags: ["soul", "gospel", "funk", "jazz"],
    energie: 5, etrange: 5, danse: 6 },

  { titre: "Glue Song (feat. Clairo)", artiste: "beabadoobee", album: "Glue Song (feat. Clairo)",
    lien: "https://music.youtube.com/watch?v=9Yy4-LCOi34", note: "",
    ambiance: "brume", style: "Folk-pop indé", annee: 2023, bpm: 80, voix: "chant",
    tags: ["indie", "folk", "ballade", "guitares"],
    energie: 2, etrange: 2, danse: 2 },

  { titre: "we fell in love in october", artiste: "girl in red", album: "we fell in love in october / forget her",
    lien: "https://music.youtube.com/watch?v=FJX0JPXD2nM", note: "Vu que je suis une Tumblr Girl apparemment",
    ambiance: "electrique", style: "Bedroom pop", annee: 2018, bpm: 105, voix: "chant",
    tags: ["indie", "pop", "guitares", "mélancolique"],
    energie: 2, etrange: 2, danse: 2 },

  { titre: "BEST INTEREST", artiste: "Tyler, The Creator", album: "BEST INTEREST",
    lien: "https://music.youtube.com/watch?v=37kWL6Qowq4", note: "",
    ambiance: "soleil", style: "Rap néo-soul", annee: 2019, bpm: 90, voix: "rap",
    tags: ["rap", "soul", "rnb", "solaire"],
    energie: 4, etrange: 3, danse: 5 },

  { titre: "A Lot Has Changed (Rough Trade Session)", artiste: "Weyes Blood", album: "Rough Trade Session",
    lien: "https://music.youtube.com/watch?v=NmFqLz6tyLA", note: "Miam",
    ambiance: "brume", style: "Folk baroque", annee: 2019, bpm: 70, voix: "chant",
    tags: ["indie", "folk", "piano", "cordes"],
    energie: 2, etrange: 4, danse: 1 },

  /* ─── arrivés depuis la table de tri, octobre 2026 ─── */
  { titre: "Piano Concerto in G: II. Adagio assai", artiste: "Ravel, Krystian Zimerman", album: "",
    lien: "https://music.youtube.com/watch?v=W1hyEjZros8", note: "",
    ambiance: "brume", style: "Concerto impressionniste", annee: 1931, bpm: 60, voix: "instru",
    tags: ["classique", "piano", "orchestre", "ballade"],
    energie: 1, etrange: 2, danse: 0 },

  { titre: "Le Sable", artiste: "Alpha Wann", album: "",
    lien: "https://music.youtube.com/watch?v=U-GdqWtYspU", note: "",
    ambiance: "bitume", style: "Rap français, hors projet", annee: 2023, bpm: 90, voix: "rap",
    tags: ["rap", "france", "boom bap"],
    energie: 6, etrange: 3, danse: 5 },

  { titre: "I Thought I Saw Your Face Today", artiste: "She & Him", album: "Volume One",
    lien: "https://music.youtube.com/watch?v=HJstyRBLqBQ", note: "",
    ambiance: "brume", style: "Pop rétro douce", annee: 2008, bpm: 80, voix: "chant",
    tags: ["indie", "pop", "ballade", "rétro"],
    energie: 3, etrange: 2, danse: 3 },

  { titre: "Bag of Bones", artiste: "Mitski", album: "Retired from Sad, New Career in Business",
    lien: "https://music.youtube.com/watch?v=o3iak3BjFzY", note: "Ce sera pas le seul Mitski (déso pas déso)",
    ambiance: "electrique", style: "Indie orchestral", annee: 2013, bpm: 100, voix: "chant",
    tags: ["indie", "piano", "cordes", "mélancolique"],
    energie: 5, etrange: 5, danse: 3 },

  { titre: "SHYNESS BOY", artiste: "Anri", album: "Timely!!",
    lien: "https://music.youtube.com/watch?v=50qu96dvhH8", note: "De la citypop qui citypop bien",
    ambiance: "soleil", style: "City pop", annee: 1983, bpm: 120, voix: "chant",
    tags: ["citypop", "japon", "funk", "synthés"],
    energie: 6, etrange: 4, danse: 7 },

  { titre: "Unspoken", artiste: "Alex Burey", album: "",
    lien: "https://music.youtube.com/watch?v=tPJY8ItB-lA", note: "Mon son quand j'étais sous crise d'angoisse en 2015",
    ambiance: "soleil", style: "Soul rétro, boîte à rythmes", annee: 2015, bpm: 85, voix: "chant",
    tags: ["soul", "rnb", "saxophone", "boîte à rythmes"],
    energie: 3, etrange: 4, danse: 4 },

  { titre: "Night Fever (Serban Mix)", artiste: "Bee Gees", album: "Saturday Night Fever",
    lien: "https://music.youtube.com/watch?v=6bpd7Gkg0MQ", note: "Serban mix, c'est vraiment gage de qualité (j'ai fait mes recherches sur le monsieur)",
    ambiance: "piste", style: "Disco, remixé par Serban Ghenea", annee: 1977, bpm: 109, voix: "chant",
    tags: ["disco", "funk", "cordes", "club"],
    energie: 7, etrange: 1, danse: 9 },

  { titre: "Me And Those Dreamin' Eyes Of Mine", artiste: "D'Angelo", album: "Brown Sugar",
    lien: "https://music.youtube.com/watch?v=GqUUFuxpiSk", note: "C'était dur de ne mettre qu'un seul titre de l'album",
    ambiance: "soleil", style: "Neo-soul", annee: 1995, bpm: 86, voix: "chant",
    tags: ["soul", "rnb", "nocturne", "piano"],
    energie: 3, etrange: 3, danse: 5 },

  { titre: "Palm Wine", artiste: "Ezra Collective", album: "Dance, No One's Watching",
    lien: "https://music.youtube.com/watch?v=w0gJXVxF6dM", note: "",
    ambiance: "soleil", style: "Jazz londonien, afro", annee: 2024, bpm: 104, voix: "instru",
    tags: ["jazz", "afro", "cuivres", "solaire"],
    energie: 6, etrange: 4, danse: 7 },

  { titre: "Tanpopo", artiste: "Herbie Mann", album: "Pop Impression",
    lien: "https://music.youtube.com/watch?v=Ij_EaAGgx0c", note: "Un son à mettre en premier jour de retraite",
    ambiance: "brume", style: "Jazz-funk, reprise japonaise", annee: 1974, bpm: 92, voix: "instru",
    tags: ["jazz", "japon", "flûte", "funk"],
    energie: 4, etrange: 6, danse: 5 },

  { titre: "Oh! Tengo Suerte", artiste: "Masayoshi Takanaka", album: "Seychelles",
    lien: "https://music.youtube.com/watch?v=qqgmrDE4p40", note: "Les émotions",
    ambiance: "soleil", style: "Fusion japonaise", annee: 1976, bpm: 120, voix: "instru",
    tags: ["citypop", "japon", "guitares", "latin"],
    energie: 6, etrange: 5, danse: 7 },

  { titre: "Tezeta", artiste: "Mulatu Astatke", album: "Ethiopian Modern Instrumentals Hits",
    lien: "https://music.youtube.com/watch?v=te9CHZCKWkU", note: "Branchez-vous jazz éthiopien",
    ambiance: "ailleurs", style: "Éthio-jazz", annee: 1972, bpm: 80, voix: "instru",
    tags: ["jazz", "afro", "monde", "nocturne"],
    energie: 3, etrange: 6, danse: 4 },

  { titre: "Dream Hill", artiste: "Casiopea", album: "Casiopea",
    lien: "https://music.youtube.com/watch?v=kwNXiXBjiBo", note: "Les samples découverts sans faire exprès",
    ambiance: "soleil", style: "Fusion japonaise", annee: 1979, bpm: 100, voix: "instru",
    tags: ["citypop", "japon", "synthés", "funk"],
    energie: 5, etrange: 5, danse: 6 },

  { titre: "Toffee", artiste: "Maddie Ashman", album: "Toffee",
    lien: "https://music.youtube.com/watch?v=oPh0uhdLt64", note: "Je vous recommande de plonger dans la musique microtonale",
    ambiance: "ailleurs", style: "Pop microtonale", annee: 2025, bpm: 90, voix: "chant",
    tags: ["pop", "expérimental", "voix aérienne", "indie"],
    energie: 4, etrange: 8, danse: 4 },

  { titre: "HOWWEFLOW", artiste: "GENA", album: "The Pleasure Is Yours",
    lien: "https://music.youtube.com/watch?v=t4Sj8KTIPp4", note: "Je suis souvent séduit par les grosses basses, je le concède",
    ambiance: "bitume", style: "Neo-soul hip-hop", annee: 2025, bpm: 90, voix: "chant",
    tags: ["rnb", "rap", "jazz", "basses"],
    energie: 6, etrange: 6, danse: 6 },

  { titre: "Me and Mrs. Jones (Single Version)", artiste: "Billy Paul", album: "360 Degrees of Billy Paul",
    lien: "https://music.youtube.com/watch?v=mhDsz2HSKwU", note: "Pour moi c'est un peu le T-Pain de la soul",
    ambiance: "soleil", style: "Philly soul", annee: 1972, bpm: 66, voix: "chant",
    tags: ["soul", "philly", "ballade", "cordes"],
    energie: 2, etrange: 2, danse: 3 },

  { titre: "pSYch3d3L!qu3", artiste: "Crap0", album: "cr04ss3m3nts m4ud!ts",
    lien: "https://music.youtube.com/watch?v=unhNDjnm1aI", note: "J'ai la vision pour l'avenir",
    ambiance: "ailleurs", style: "Rap underground", annee: 2023, bpm: 140, voix: "rap",
    tags: ["rap", "france", "expérimental", "glitch"],
    energie: 6, etrange: 10, danse: 5 },

  { titre: "Chega De Saudade", artiste: "Antonio Carlos Jobim", album: "Inédito",
    lien: "https://music.youtube.com/watch?v=tlp8iY4g--4", note: "Incontournable",
    ambiance: "soleil", style: "Bossa nova", annee: 1958, bpm: 128, voix: "chant",
    tags: ["bresil", "samba", "jazz", "piano"],
    energie: 3, etrange: 2, danse: 5 },

  { titre: "On My Block", artiste: "Scarface", album: "The Fix",
    lien: "https://music.youtube.com/watch?v=3cVoaF64aco", note: "",
    ambiance: "bitume", style: "Rap sudiste, samples soul", annee: 2002, bpm: 88, voix: "rap",
    tags: ["rap", "sud", "samples soul", "nocturne"],
    energie: 5, etrange: 3, danse: 5 },

  { titre: "La Valse à mille temps", artiste: "Jacques Brel", album: "La Valse à mille temps",
    lien: "https://music.youtube.com/watch?v=NR5ZOBh7O04", note: "Adolescent, j'adorais ce morceau",
    ambiance: "electrique", style: "Chanson française", annee: 1959, bpm: 180, voix: "chant",
    tags: ["chanson", "valse", "orchestre", "rapide"],
    energie: 8, etrange: 2, danse: 5 },

  { titre: "Stay Fly", artiste: "Three 6 Mafia feat. Young Buck, 8Ball & MJG", album: "Most Known Unknowns",
    lien: "https://music.youtube.com/watch?v=U_jq38d3FFI", note: "Top 5 morceaux",
    ambiance: "bitume", style: "Rap sudiste, Memphis", annee: 2005, bpm: 82, voix: "rap",
    tags: ["rap", "sud", "memphis", "clip"],
    energie: 5, etrange: 3, danse: 5 },

  { titre: "With You", artiste: "Lil Wayne feat. Drake", album: "I Am Not a Human Being",
    lien: "https://music.youtube.com/watch?v=c4Y5KE5DFDM", note: "S/o Solo",
    ambiance: "bitume", style: "Rap, R&B mélodique", annee: 2010, bpm: 88, voix: "rap",
    tags: ["rap", "r&b", "nouvelle-orléans", "mélodique"],
    energie: 5, etrange: 3, danse: 5 },

  { titre: "Just Asking (Day Theme I)", artiste: "Max Specter", album: "No, I'm Not a Human (bande originale)",
    lien: "https://music.youtube.com/watch?v=flGJj6d1Q9M", note: "Je peux l'écouter en boucle pendant des heures",
    ambiance: "brume", style: "BO de jeu vidéo, ambient", annee: 2025, bpm: 78, voix: "instru",
    tags: ["jeux vidéo", "ost", "ambient", "boucle"],
    energie: 3, etrange: 3, danse: 2 },

  { titre: "WHY, WHY, WHY", artiste: "SUMIN & Slom", album: "MINISERIES 2",
    lien: "https://music.youtube.com/watch?v=Qo2VFR6DAhY", note: "Une de mes plus belles découvertes musicales cette année",
    ambiance: "brume", style: "R&B, soul coréenne", annee: 2024, bpm: 120, voix: "chant",
    tags: ["rnb", "soul", "corée", "pop"],
    energie: 4, etrange: 5, danse: 5 },

  { titre: "Relax", artiste: "Stephen Gray", album: "Relax",
    lien: "https://music.youtube.com/watch?v=JUUwoyuAUKA", note: "Un grand oui comme on dit chez moi",
    ambiance: "soleil", style: "Library music, soul-jazz", annee: 1979, bpm: 110, voix: "chant",
    tags: ["library music", "soul-jazz", "samples", "détente"],
    energie: 3, etrange: 3, danse: 5 },

  { titre: "Wild and Free", artiste: "Curtis Mayfield", album: "Curtis",
    lien: "https://music.youtube.com/watch?v=wJJ1blF5aq4", note: "Encore un bon dimanche de mon côté perso",
    ambiance: "soleil", style: "Soul orchestrale, funk", annee: 1970, bpm: 100, voix: "chant",
    tags: ["soul", "funk", "chicago", "cordes"],
    energie: 5, etrange: 2, danse: 6 },

  { titre: "Azucar", artiste: "Earl Sweatshirt", album: "Some Rap Songs",
    lien: "https://music.youtube.com/watch?v=-hA-81XOCgM", note: "Pitié, guettez la transition sample/morceau", secours: { lien: "https://music.youtube.com/watch?v=188lJwrhmic", note: "La plus grande minute de rap contemporain" },
    ambiance: "ailleurs", style: "Rap abstrait, samples", annee: 2018, bpm: 80, voix: "rap",
    tags: ["rap", "abstrait", "samples", "jazz"],
    energie: 4, etrange: 7, danse: 3 },

  { titre: "SWEET / I THOUGHT YOU WANTED TO DANCE", artiste: "Tyler, The Creator feat. Brent Faiyaz & Fana Hues", album: "CALL ME IF YOU GET LOST",
    lien: "https://music.youtube.com/watch?v=oCEaYar1RgU", note: "Vous pouvez pas comprendre et j'expliquerai rien",
    ambiance: "soleil", style: "R&B, synth-pop, dancehall", annee: 2021, bpm: 140, voix: "rap",
    tags: ["rap", "r&b", "dancehall", "synthés"],
    energie: 6, etrange: 4, danse: 7 },

  { titre: "Daydream", artiste: "Gunter Kallmann Choir", album: "",
    lien: "https://music.youtube.com/watch?v=rQACwgrYwKM", note: "Merci Lupe Fiasco et Mr.Nobody pour la vision",
    ambiance: "brume", style: "Easy listening, chœurs", annee: 1970, bpm: 90, voix: "chant",
    tags: ["chœurs", "easy listening", "samples", "reprise"],
    energie: 2, etrange: 3, danse: 2 },

  { titre: "I'll Take Care of You", artiste: "Tyler, The Creator feat. Yebba", album: "DON'T TAP THE GLASS",
    lien: "https://music.youtube.com/watch?v=O3GONS2o1sM", note: "Je remets un Tyler car l'instru à la Zelda m'a eu…",
    ambiance: "piste", style: "Rap, bounce du Sud", annee: 2025, bpm: 100, voix: "rap",
    tags: ["rap", "bounce", "sud", "jeux vidéo"],
    energie: 6, etrange: 5, danse: 7 },

  { titre: "When Sunny Gets Blue", artiste: "McCoy Tyner Trio", album: "Today and Tomorrow",
    lien: "https://music.youtube.com/watch?v=frYLvC0mM50", note: "Vous reprendrez bien une bouteille?",
    ambiance: "brume", style: "Jazz, ballade en trio piano", annee: 1964, bpm: 66, voix: "instru",
    tags: ["jazz", "piano", "ballade", "trio"],
    energie: 2, etrange: 2, danse: 2 },

  { titre: "C12H16N2", artiste: "Action Bronson", album: "Only for Dolphins",
    lien: "https://music.youtube.com/watch?v=4DCiFyduK2c", note: "Sûrement un des sons que j'ai le plus écouté (le sample également)",
    ambiance: "bitume", style: "Rap psyché, boom bap", annee: 2020, bpm: 71, voix: "rap",
    tags: ["rap", "new york", "samples", "psyché"],
    energie: 5, etrange: 4, danse: 4 },

  { titre: "Tonight You Belong to Me", artiste: "Patience & Prudence", album: "",
    lien: "https://music.youtube.com/watch?v=OQvaFtm4CWE", note: "Les gens disent qu'elle est creepy (moi je trouve pas)",
    ambiance: "brume", style: "Pop vocale, duo", annee: 1956, bpm: 100, voix: "chant",
    tags: ["années 50", "duo", "ukulélé", "douceur"],
    energie: 2, etrange: 5, danse: 2 },

  { titre: "Carte Black (prod. Lil Chick / Mix. Neat)", artiste: "Soldat Yaya, Sylvestre & Tileam", album: "",
    lien: "https://music.youtube.com/watch?v=rfvLfEBAXxk", note: "Très chaud soldat yaya",
    ambiance: "bitume", style: "Rap français", bpm: 140, voix: "rap",
    tags: ["rap", "france", "underground"],
    energie: 7, etrange: 4, danse: 6 },

  { titre: "Nadine", artiste: "SMS", album: "HECTOR",
    lien: "https://music.youtube.com/watch?v=1_ux1XFaSp8", note: "Tellement dans le shit-talk que j'en ai trouvé tout droit sorti du Canada",
    ambiance: "bitume", style: "Rap francophone canadien", annee: 2026, bpm: 140, voix: "rap",
    tags: ["rap", "canada", "francophone", "shit-talk"],
    energie: 6, etrange: 4, danse: 5 },

  { titre: "Frank Ocean – Thinkin' Bout You (KLM Flip)", artiste: "K, Le Maestro", album: "",
    lien: "https://music.youtube.com/watch?v=C8fH4h8b1HM", note: "Toujours le h.i.p. H.o.p.",
    ambiance: "brume", style: "Flip chopped & screwed", annee: 2023, bpm: 85, voix: "chant",
    tags: ["flip", "chopped & screwed", "r&b", "houston"],
    energie: 3, etrange: 3, danse: 4 },

  { titre: "1ST DAY OUT", artiste: "Charly Kid", album: "",
    lien: "https://music.youtube.com/watch?v=Ddf1PFguZpg", note: "Offrez-moi des fleurs",
    ambiance: "bitume", style: "Rap francophone, trap", annee: 2023, bpm: 130, voix: "rap",
    tags: ["rap", "trap", "francophone", "samples"],
    energie: 6, etrange: 5, danse: 5 },

  { titre: "Ain't Talkin Bout Much", artiste: "Patrick Paige II feat. Syd", album: "If I Fail Are We Still Cool?",
    lien: "https://music.youtube.com/watch?v=Fy1zXirIbEs", note: "J'ai tellement écouté ça quand c'était sorti",
    ambiance: "soleil", style: "Rap, R&B West Coast", annee: 2021, bpm: 90, voix: "chant",
    tags: ["rap", "r&b", "west coast", "basse"],
    energie: 3, etrange: 3, danse: 5 },

  { titre: "Nová syntéza", artiste: "Blue Effect", album: "Nová syntéza",
    lien: "https://music.youtube.com/watch?v=sA33UBVUWNM", note: "Quoi? Vous n'êtes pas branchés de jazz-rock/psych tchécoslovaque des années 70???", long: true,
    ambiance: "ailleurs", style: "Jazz-rock orchestral, psyché", annee: 1971, bpm: 110, voix: "instru",
    tags: ["jazz-rock", "psychédélique", "tchécoslovaquie", "big band", "album entier"],
    energie: 6, etrange: 7, danse: 3 },

  { titre: "My Name is Nobody (Main Title)", artiste: "Ennio Morricone", album: "Il mio nome è Nessuno",
    lien: "https://music.youtube.com/watch?v=vqMQ0gkEyt0", note: "Je ne saurais pas l'expliquer", connu: true,
    ambiance: "epopee", style: "Western spaghetti, bande originale", annee: 1973, bpm: 120, voix: "instru",
    tags: ["western", "bo", "morricone", "film"],
    energie: 5, etrange: 3, danse: 3 },

  { titre: "going home", artiste: "Shiro Sagisu", album: "Bleach (bande originale 1)",
    lien: "https://music.youtube.com/watch?v=TBRbZaEEeEw", note: "La guitare a l'air espagnole",
    ambiance: "brume", style: "BO d'anime, guitare", annee: 2005, bpm: 70, voix: "instru",
    tags: ["ost", "anime", "guitare", "nocturne"],
    energie: 3, etrange: 3, danse: 2 },

  { titre: "You Know How We Do It", artiste: "Ice Cube", album: "Lethal Injection",
    lien: "https://music.youtube.com/watch?v=_HGZBLdn9_c", note: "Je m'empêche grave de mettre des sons « trop évidents » mais celui-ci….", connu: true,
    ambiance: "bitume", style: "G-funk, rap de L.A.", annee: 1993, bpm: 93, voix: "rap",
    tags: ["rap", "g-funk", "los angeles", "samples soul"],
    energie: 5, etrange: 2, danse: 6 },

  { titre: "Lithonia", artiste: "Childish Gambino", album: "Bando Stone & the New World",
    lien: "https://music.youtube.com/watch?v=_7GVjIF08_c", note: "S/o Flo",
    ambiance: "electrique", style: "Rock alternatif, soul", annee: 2024, bpm: 95, voix: "chant",
    tags: ["rock", "soul", "guitares", "grunge"],
    energie: 7, etrange: 4, danse: 4 },

  { titre: "Life Goes On", artiste: "Chihiro Yamanaka", album: "",
    lien: "https://music.youtube.com/watch?v=XjzQpGcG_Uw", note: "Le piano, meilleur instrument ?", coeur: true,
    ambiance: "brume", style: "Jazz, trio piano japonais", bpm: 120, voix: "instru",
    tags: ["jazz", "piano", "japon", "trio"],
    energie: 5, etrange: 3, danse: 4 },

  { titre: "Stranger to Love", artiste: "Dexter in the Newsagent", album: "",
    lien: "https://music.youtube.com/watch?v=eQGdrWCt0F8", note: "Ça sur un vélo la nuit avec des écouteurs filaires",
    ambiance: "brume", style: "Pop indie, acoustique", bpm: 100, voix: "chant",
    tags: ["indie", "pop", "nocturne", "acoustique"],
    energie: 4, etrange: 4, danse: 4 },

  { titre: "Tiny Desk Concert", artiste: "Ca7riel & Paco Amoroso", album: "",
    lien: "https://music.youtube.com/watch?v=9kqnsoY94L8", note: "Le meilleur Tiny Desk ?",
    ambiance: "piste", style: "Funk, rap et rock argentins, en live", annee: 2024, bpm: 110, voix: "chant",
    tags: ["argentine", "live", "funk", "rap"],
    energie: 7, etrange: 6, danse: 7 },

  { titre: "Yussef Dayes in Japan (film)", artiste: "Yussef Dayes", album: "",
    lien: "https://music.youtube.com/watch?v=BEcJNcLTAkw", note: "Vous pouvez toujours vous poser devant ou avancer aux parties musicales", long: true,
    ambiance: "ailleurs", style: "Jazz, film documentaire", bpm: 95, voix: "instru",
    tags: ["jazz", "batterie", "japon", "live", "film"],
    energie: 5, etrange: 6, danse: 4 },

  { titre: "F*** You", artiste: "The LOX", album: "",
    lien: "https://music.youtube.com/watch?v=YN9uBK2M0Uw", note: "Tout est dans le titre",
    ambiance: "bitume", style: "Rap new-yorkais", bpm: 92, voix: "rap",
    tags: ["rap", "new york", "boom bap"],
    energie: 7, etrange: 3, danse: 5 },

  { titre: "Plover", artiste: "Yorushika", album: "",
    lien: "https://music.youtube.com/watch?v=YLG1yiWkZM0", note: "Avec du recul, la ligne entre passionné et fétichiste me paraît poreuse",
    ambiance: "electrique", style: "J-rock, pop rock japonaise", bpm: 150, voix: "chant",
    tags: ["japon", "rock", "guitares", "pop"],
    energie: 6, etrange: 4, danse: 4 },

  { titre: "Common Man", artiste: "David Ruffin", album: "",
    lien: "https://music.youtube.com/watch?v=VN4RsPongvI", note: "Ça fait bcp de David Ruffin mais joli sample",
    ambiance: "soleil", style: "Soul seventies", bpm: 90, voix: "chant",
    tags: ["soul", "samples", "cordes"],
    energie: 4, etrange: 3, danse: 4 },

  { titre: "How Can You Mend a Broken Heart", artiste: "Al Green", album: "Let's Stay Together",
    lien: "https://music.youtube.com/watch?v=SuQJZp2yWc0", note: "Répondez-lui pitié", connu: true,
    ambiance: "soleil", style: "Soul de Memphis", annee: 1972, bpm: 64, voix: "chant",
    tags: ["soul", "memphis", "ballade", "cordes"],
    energie: 3, etrange: 2, danse: 3 },

  { titre: "So in Love", artiste: "Curtis Mayfield", album: "There's No Place Like America Today",
    lien: "https://music.youtube.com/watch?v=mx8_dhQpzzg", note: "Bakary dans 20 ans il lui ressemble je pense",
    ambiance: "soleil", style: "Soul, funk de Chicago", annee: 1975, bpm: 80, voix: "chant",
    tags: ["soul", "chicago", "doux", "groove"],
    energie: 3, etrange: 3, danse: 4 },

  { titre: "Pernambuco", artiste: "Luiz Bonfá", album: "",
    lien: "https://music.youtube.com/watch?v=pEm8pFlF0d4", note: "Il suffit d'une guitare (ou plus)",
    ambiance: "soleil", style: "Guitare brésilienne", bpm: 120, voix: "instru",
    tags: ["bresil", "guitare", "bossa", "acoustique"],
    energie: 4, etrange: 4, danse: 4 },

  { titre: "The Alien", artiste: "Dream Theater", album: "A View from the Top of the World",
    lien: "https://music.youtube.com/watch?v=B84ms7dz3tQ", note: "Tw metal mais la façon dont les temps sont décomposés, c'est ahurissant",
    ambiance: "electrique", style: "Metal progressif", annee: 2021, bpm: 130, voix: "chant",
    tags: ["metal", "progressif", "guitares", "virtuose"],
    energie: 9, etrange: 5, danse: 2 },

  { titre: "Klops Jol", artiste: "Robin Fassie", album: "",
    lien: "https://music.youtube.com/watch?v=bBm0x-2G9iw", note: "Entre le moment où je l'ai écouté et aujourd'hui, y'a eu un Grammy… #influenceur",
    ambiance: "piste", style: "Amapiano, afro-house", bpm: 112, voix: "chant",
    tags: ["amapiano", "afrique du sud", "house", "club"],
    energie: 6, etrange: 5, danse: 8 },

  { titre: "Change for the World", artiste: "Charles Bradley", album: "Changes",
    lien: "https://music.youtube.com/watch?v=WWWx4g9QKsE", note: "Merci Barry pour la passe D",
    ambiance: "soleil", style: "Soul", annee: 2016, bpm: 78, voix: "chant",
    tags: ["soul", "daptone", "cuivres", "voix"],
    energie: 5, etrange: 3, danse: 4 },

  { titre: "endlessly", artiste: "Chanpan", album: "",
    lien: "https://music.youtube.com/watch?v=vrnFatmWtPU", note: "Je remarque que j'ai un truc pour les drums frénétiques", debut: 25, secours: { lien: "https://music.youtube.com/watch?v=D_g4udDanNM", note: "Je remarque que j'ai un truc pour les drums frénétiques" },
    ambiance: "piste", style: "Électro, drums frénétiques", bpm: 170, voix: "chant",
    tags: ["électro", "breakbeat", "drums", "intense"],
    energie: 8, etrange: 6, danse: 7 },

  { titre: "旅行的意義 (Travel is Meaningful)", artiste: "Cheer Chen", album: "華麗的冒險",
    lien: "https://music.youtube.com/watch?v=KTQGxaSY-AE", note: "« Un classique incontournable de la Mandopop » d'après Internet (et moi)",
    ambiance: "brume", style: "Mandopop, folk", annee: 2004, bpm: 80, voix: "chant",
    tags: ["mandopop", "taïwan", "folk", "guitare"],
    energie: 3, etrange: 4, danse: 3 },

  { titre: "APTX", artiste: "Tattletale", album: "",
    lien: "https://music.youtube.com/watch?v=HW52njxOW0s", note: "Faut imaginer la colère qui monte petit à petit",
    ambiance: "electrique", style: "Rock, montée en colère", bpm: 120, voix: "chant",
    tags: ["rock", "colère", "montée", "guitares"],
    energie: 7, etrange: 6, danse: 3 },

  { titre: "Assumptions", artiste: "Sam Gellaitry", album: "Viewfinder Vol. 3: Assumptions",
    lien: "https://music.youtube.com/watch?v=Z28jtA4Cjvw", note: "Parce que pourquoi pas ?",
    ambiance: "piste", style: "Électro, funk", annee: 2019, bpm: 104, voix: "chant",
    tags: ["électro", "funk", "synthés", "groove"],
    energie: 6, etrange: 4, danse: 7 },

  { titre: "Burguesinha", artiste: "Seu Jorge", album: "América Brasil o Disco",
    lien: "https://music.youtube.com/watch?v=bWSn9jL1g7I", note: "Amélieniño (avec l'accent)",
    ambiance: "soleil", style: "Samba-funk", annee: 2007, bpm: 112, voix: "chant",
    tags: ["bresil", "samba", "funk", "fête"],
    energie: 6, etrange: 3, danse: 8 },

  { titre: "Medley: Intro", artiste: "JAŸ-Z", album: "",
    lien: "https://music.youtube.com/watch?v=6zE7uHz7d4E", note: "Auto-persuadé que le refrain dit Amélien",
    ambiance: "bitume", style: "Rap, mashup", bpm: 90, voix: "rap",
    tags: ["rap", "mashup", "samples"],
    energie: 5, etrange: 6, danse: 5 },

  { titre: "Day & Night (feat. Holybrune)", artiste: "Dabeull", album: "",
    lien: "https://music.youtube.com/watch?v=rDVOqLGZgW0", note: "Le son de mon bar à cocktails",
    ambiance: "piste", style: "Funk, boogie français", bpm: 110, voix: "chant",
    tags: ["funk", "boogie", "talkbox", "france"],
    energie: 6, etrange: 4, danse: 8 },

  { titre: "タリオのテーマ", artiste: "Hitomitoi", album: "",
    lien: "https://music.youtube.com/watch?v=87zf34lHEbs", note: "En mode protagoniste du générique",
    ambiance: "piste", style: "City pop japonaise", bpm: 115, voix: "chant",
    tags: ["citypop", "japon", "synthés", "générique"],
    energie: 6, etrange: 5, danse: 7 },

  { titre: "Genkidama (bande originale)", artiste: "Dragon Ball GT", album: "",
    lien: "https://music.youtube.com/watch?v=xkcUFEfbrQc", note: "J'avais ça dans ma playlist « concentration »",
    ambiance: "epopee", style: "BO d'anime", bpm: 90, voix: "instru",
    tags: ["anime", "ost", "épique", "concentration"],
    energie: 5, etrange: 3, danse: 2 },

  { titre: "Palco", artiste: "Gilberto Gil", album: "Luar (A Gente Precisa Ver o Luar)",
    lien: "https://music.youtube.com/watch?v=PVyArpY0Vp0", note: "Je te remercierai jamais assez Pela",
    ambiance: "soleil", style: "MPB, funk brésilien", annee: 1981, bpm: 118, voix: "chant",
    tags: ["bresil", "mpb", "funk", "fête"],
    energie: 7, etrange: 3, danse: 8 },

  { titre: "My Foolish Heart", artiste: "Bill Evans Trio", album: "Waltz for Debby",
    lien: "https://music.youtube.com/watch?v=Bkn5bMo-VCQ", note: "C'est beau le jazz",
    ambiance: "brume", style: "Jazz, trio piano", annee: 1961, bpm: 60, voix: "instru",
    tags: ["jazz", "piano", "ballade", "trio"],
    energie: 1, etrange: 2, danse: 1 },

  { titre: "Lovely Day", artiste: "Bill Withers", album: "Menagerie",
    lien: "https://music.youtube.com/watch?v=QCgeitX5xg0", note: "Allez c'est cadeau", connu: true,
    ambiance: "soleil", style: "Soul", annee: 1977, bpm: 98, voix: "chant",
    tags: ["soul", "classique", "optimiste", "groove"],
    energie: 5, etrange: 1, danse: 6 },

  { titre: "I Don't Smoke / Class of 2013 (Audiotree Live)", artiste: "Mitski", album: "Mitski on Audiotree Live",
    lien: "https://music.youtube.com/watch?v=fL6srzfRwgo", note: "Cette version me donne des frissons à chaque fois",
    ambiance: "brume", style: "Indie rock, live", bpm: 90, voix: "chant",
    tags: ["indie", "live", "guitare", "émotion"],
    energie: 4, etrange: 5, danse: 3 },

  { titre: "Quand ça se disperse", artiste: "Akhenaton", album: "",
    lien: "https://music.youtube.com/watch?v=4KGPw-8iz08", note: "De ceux qui restent",
    ambiance: "bitume", style: "Rap marseillais", bpm: 88, voix: "rap",
    tags: ["rap", "france", "marseille", "boom bap"],
    energie: 5, etrange: 3, danse: 4 },

  { titre: "Hifi-Mes Rimes Sortent du Coeur", artiste: "Ma3FoisPlusEfficace", album: "",
    lien: "https://music.youtube.com/watch?v=mXK3qFRWWf0", note: "Écoutez comment il rebondit",
    ambiance: "bitume", style: "Rap français", bpm: 92, voix: "rap",
    tags: ["rap", "france", "flow"],
    energie: 6, etrange: 5, danse: 5 },

  { titre: "Je t'ai tatoué (La chanson de Louis)", artiste: "Amélien", album: "",
    lien: "https://music.youtube.com/watch?v=TrNwn-pXOjs", note: "Déjà un classique de la musique contemporaine",
    ambiance: "brume", style: "Chanson", bpm: 90, voix: "chant",
    tags: ["chanson", "perso"],
    energie: 4, etrange: 7, danse: 3 },

  { titre: "(They Long to Be) Close to You", artiste: "Carpenters", album: "Close to You",
    lien: "https://music.youtube.com/watch?v=M268Csnue9I", note: "Affilié aux Simpsons pour toujours ✨", connu: true,
    ambiance: "brume", style: "Pop douce", annee: 1970, bpm: 88, voix: "chant",
    tags: ["pop", "douceur", "seventies", "simpsons"],
    energie: 2, etrange: 1, danse: 3 },

  { titre: "喫茶aori", artiste: "Shin Rizumu", album: "",
    lien: "https://music.youtube.com/watch?v=aYMC_4EycVw", note: "Super pour la bibliothèque",
    ambiance: "soleil", style: "City pop, funk japonais", bpm: 110, voix: "chant",
    tags: ["citypop", "japon", "funk", "groove"],
    energie: 5, etrange: 6, danse: 6 },

  { titre: "Every Nigger Is a Star", artiste: "Boris Gardner", album: "Every Nigger Is a Star (bande originale)",
    lien: "https://music.youtube.com/watch?v=3y56omFve_4", note: "Bah alors vous pouvez pas chanter ?",
    ambiance: "soleil", style: "Soul jamaïcaine", annee: 1973, bpm: 80, voix: "chant",
    tags: ["soul", "jamaïque", "samples", "bo"],
    energie: 4, etrange: 4, danse: 4 },

  { titre: "T.A.R (TORA AURA RARE)", artiste: "Tora Meishi", album: "",
    lien: "https://music.youtube.com/watch?v=CR-xLa2M7bM", note: "Dans mon viseur en tout cas",
    ambiance: "bitume", style: "Rap", bpm: 140, voix: "rap",
    tags: ["rap", "underground"],
    energie: 7, etrange: 6, danse: 6 },

  { titre: "Orchids and Roses", artiste: "The Symphonia Orchestra", album: "",
    lien: "https://music.youtube.com/watch?v=By6epz3PseA", note: "M'accompagneriez-vous pour une dernière danse ?",
    ambiance: "brume", style: "Easy listening, cordes", bpm: 80, voix: "instru",
    tags: ["easy listening", "cordes", "slow", "vintage"],
    energie: 2, etrange: 4, danse: 3 },

  { titre: "Clock Town (Day 1, Day 2, Day 3 & Final Hours)", artiste: "The Legend of Zelda: Majora's Mask", album: "",
    lien: "https://music.youtube.com/watch?v=K0kXVfqPrLs", note: "Ça va monter en mode « stress » au fil de l'écoute si jamais (j'adore)",
    ambiance: "epopee", style: "BO de jeu vidéo", annee: 2000, bpm: 125, voix: "instru",
    tags: ["jeux vidéo", "zelda", "nintendo", "stress"],
    energie: 5, etrange: 4, danse: 3 },

  { titre: "The NTS Guide to… Legend of Zelda Soundtracks", artiste: "NTS", album: "",
    lien: "https://music.youtube.com/watch?v=1rOt7repQek", note: "Si jamais vous voulez 1h de musique de Zelda", long: true,
    ambiance: "epopee", style: "Mix de BO de jeux vidéo", bpm: 100, voix: "instru",
    tags: ["jeux vidéo", "zelda", "mix", "nintendo"],
    energie: 4, etrange: 4, danse: 3 },

  { titre: "I Just Want to Spend the Night With You", artiste: "Ace Spectrum", album: "",
    lien: "https://music.youtube.com/watch?v=g_p2Wtd2-oQ", note: "Trop aigu pour les karaokés, pas pour ma douche",
    ambiance: "soleil", style: "Soul seventies", bpm: 95, voix: "chant",
    tags: ["soul", "falsetto", "seventies", "groove"],
    energie: 5, etrange: 4, danse: 6 },

  { titre: "Spiked", artiste: "Bilk", album: "",
    lien: "https://music.youtube.com/watch?v=umWKBcVTYIQ", note: "Je suis supra fan des 20 premières secondes, un peu moins le reste",
    ambiance: "electrique", style: "Indie punk britannique", bpm: 160, voix: "chant",
    tags: ["punk", "indie", "guitares", "uk"],
    energie: 8, etrange: 4, danse: 4 },

  { titre: "B.O.R. (Birth of Rap)", artiste: "Lil B", album: "",
    lien: "https://music.youtube.com/watch?v=KIHzPgX1aEw", note: "",
    ambiance: "bitume", style: "Rap, cloud rap", bpm: 80, voix: "rap",
    tags: ["rap", "based", "cloud rap"],
    energie: 4, etrange: 6, danse: 4 },

  { titre: "Love in São Paulo", artiste: "Yuji Ohno Trio", album: "",
    lien: "https://music.youtube.com/watch?v=OkvZZuLyLf8", note: "Parfois c'est juste bien",
    ambiance: "brume", style: "Jazz japonais", bpm: 110, voix: "instru",
    tags: ["jazz", "japon", "piano", "trio"],
    energie: 4, etrange: 4, danse: 4 },

  { titre: "Dakishimete Jitterbug (Careless Whisper)", artiste: "Hideki Saijo", album: "",
    lien: "https://music.youtube.com/watch?v=pQtHl7SYinU", note: "Pourquoi écouter Careless Whisper en anglais ?",
    ambiance: "brume", style: "Kayōkyoku, reprise", annee: 1984, bpm: 76, voix: "chant",
    tags: ["japon", "reprise", "slow", "eighties"],
    energie: 3, etrange: 6, danse: 4 },

  { titre: "DROPPING SEEDS", artiste: "Carly Gibert", album: "",
    lien: "https://music.youtube.com/watch?v=r0hClR5smoU", note: "Elle a des clips sublimes si jamais",
    ambiance: "brume", style: "R&B alternatif", bpm: 90, voix: "chant",
    tags: ["rnb", "alternatif", "doux"],
    energie: 4, etrange: 6, danse: 4 },

  { titre: "Broke/Miroir (A COLORS SHOW)", artiste: "Prince Waly", album: "",
    lien: "https://music.youtube.com/watch?v=EZyuiCwosis", note: "Allah y Rahmo, grand homme",
    ambiance: "bitume", style: "Rap français, boom bap", bpm: 90, voix: "rap",
    tags: ["rap", "france", "boom bap"],
    energie: 5, etrange: 4, danse: 5 },

  { titre: "Minimum", artiste: "Release", album: "",
    lien: "https://music.youtube.com/watch?v=oKjN_WrbbWA", note: "C'était sympa Seta",
    ambiance: "bitume", style: "Rap français", bpm: 95, voix: "rap",
    tags: ["rap", "france"],
    energie: 5, etrange: 5, danse: 5 },

  { titre: "Buddies", artiste: "Quelle Chris", album: "",
    lien: "https://music.youtube.com/watch?v=Yq_Cc3hZqEM", note: "Perso je m'aime trop donc j'aime beaucoup",
    ambiance: "bitume", style: "Rap abstrait", bpm: 88, voix: "rap",
    tags: ["rap", "abstrait", "detroit"],
    energie: 4, etrange: 6, danse: 4 },

  { titre: "Parque Laje", artiste: "Egberto Gismonti", album: "",
    lien: "https://music.youtube.com/watch?v=gFi37mlgqpk", note: "J'ai que des samples merveilleux à vous faire écouter en fait",
    ambiance: "ailleurs", style: "Jazz brésilien, samples", bpm: 100, voix: "instru",
    tags: ["bresil", "jazz", "samples", "piano"],
    energie: 4, etrange: 6, danse: 3 },

  { titre: "Stormy", artiste: "The Third Wave", album: "",
    lien: "https://music.youtube.com/watch?v=6EpVQmWC514", note: "Va y avoir bientôt plus de jazz/soul que de rap", secours: { lien: "https://music.youtube.com/watch?v=ToDZ_iFcCvA", note: "Va y avoir bientôt plus de jazz/soul que de rap" },
    ambiance: "soleil", style: "Soul jazz, pop vocale", bpm: 90, voix: "chant",
    tags: ["soul", "jazz", "sixties", "samples"],
    energie: 3, etrange: 4, danse: 4 },

  { titre: "En se prenant par la main", artiste: "Jean Claudric", album: "Escapade",
    lien: "https://music.youtube.com/watch?v=kdred0hJOO0", note: "Le sample du son le plus horrible à écrire d'Action Bronson",
    ambiance: "brume", style: "Library music française", annee: 1974, bpm: 90, voix: "instru",
    tags: ["library music", "samples", "cordes", "france"],
    energie: 3, etrange: 6, danse: 3 },

  { titre: "Detronomicon L'Archive (Detroit Thug Rap Mix)", artiste: "Zetray", album: "",
    lien: "https://music.youtube.com/watch?v=x3Bo48TYD-0", note: "Que les gens qui sentent bons passent leurs routes, on est savoureurs/savoureuses de Detroit Rap", long: true,
    ambiance: "bitume", style: "Mix de rap de Detroit", bpm: 95, voix: "rap",
    tags: ["rap", "detroit", "mix", "street"],
    energie: 7, etrange: 6, danse: 5 },

  { titre: "gwYn", artiste: "Isaac Thursday", album: "",
    lien: "https://music.youtube.com/watch?v=rjsrgnxxUHc", note: "J'avais lancé pour la cover à la base",
    ambiance: "ailleurs", style: "Électronique expérimentale", bpm: 100, voix: "instru",
    tags: ["électro", "expérimental", "texture"],
    energie: 4, etrange: 7, danse: 4 },

  { titre: "Embarcadero", artiste: "Paul Desmond", album: "",
    lien: "https://music.youtube.com/watch?v=k4uvlHw_AMg", note: "J'ai réfléchi, finalement saxophone et piano ex æquo",
    ambiance: "brume", style: "Jazz, saxophone", bpm: 110, voix: "instru",
    tags: ["jazz", "saxophone", "cool jazz"],
    energie: 3, etrange: 3, danse: 3 },

  { titre: "Can't Go Wrong", artiste: "O.C.", album: "Jewelz",
    lien: "https://music.youtube.com/watch?v=gjBUb4hY7H4", note: "Tant de souvenirs à QB… enfin, Queensbridge, comme vous dites ici",
    ambiance: "bitume", style: "Rap new-yorkais", annee: 1997, bpm: 90, voix: "rap",
    tags: ["rap", "new york", "boom bap", "samples"],
    energie: 5, etrange: 4, danse: 5 },

  { titre: "Ain't No Sunshine", artiste: "Bill Withers", album: "Just As I Am",
    lien: "https://music.youtube.com/watch?v=CICIOJqEb5c", note: "Les fondamentaux", connu: true,
    ambiance: "soleil", style: "Soul folk", annee: 1971, bpm: 78, voix: "chant",
    tags: ["soul", "folk", "classique", "guitare"],
    energie: 3, etrange: 1, danse: 3 },

  { titre: "Come Wander With Me", artiste: "Bonnie Beecher", album: "",
    lien: "https://music.youtube.com/watch?v=lVdIf8BJME8", note: "Encore un sample évidemment…",
    ambiance: "ailleurs", style: "Folk, bande de série", annee: 1964, bpm: 70, voix: "chant",
    tags: ["folk", "samples", "twilight zone", "étrange"],
    energie: 2, etrange: 7, danse: 1 },

  { titre: "Body Count", artiste: "Mozzy", album: "",
    lien: "https://music.youtube.com/watch?v=uE9rwGpR-Qk", note: "T'sais, le mec qui a rien compris",
    ambiance: "bitume", style: "Rap de Sacramento", bpm: 85, voix: "rap",
    tags: ["rap", "west coast", "street"],
    energie: 7, etrange: 4, danse: 5 },

  { titre: "Dancing in My Room", artiste: "347aidan", album: "",
    lien: "https://music.youtube.com/watch?v=MRwXrdGYOC8", note: "Envie de relancer Roblox",
    ambiance: "brume", style: "Pop lo-fi", bpm: 120, voix: "chant",
    tags: ["pop", "lo-fi", "chambre"],
    energie: 5, etrange: 4, danse: 6 },

  { titre: "For Me", artiste: "Chase B feat. OMB Bloodbath & KenTheMan", album: "",
    lien: "https://music.youtube.com/watch?v=UvTxuQFbkzQ", note: "Bwaap Bwaap Bwaap Bwaap Bwaap Bwaap (je fais la basse)",
    ambiance: "bitume", style: "Rap de Houston", annee: 2020, bpm: 150, voix: "rap",
    tags: ["rap", "houston", "trap", "basse"],
    energie: 7, etrange: 4, danse: 7 },

  { titre: "Return of the Mack", artiste: "Mark Morrison", album: "Return of the Mack",
    lien: "https://music.youtube.com/watch?v=1ZfjB5P7RS0", note: "Quand ça me passe les écouteurs en soirée (Merci Master of None)", connu: true,
    ambiance: "piste", style: "R&B britannique", annee: 1996, bpm: 96, voix: "chant",
    tags: ["rnb", "nineties", "soirée", "uk"],
    energie: 6, etrange: 1, danse: 7 },

  { titre: "B.M.F. (Blowin' Money Fast)", artiste: "Rick Ross feat. Styles P", album: "Teflon Don",
    lien: "https://music.youtube.com/watch?v=bdTAlbL72W8", note: "Pourquoi se priver ?", pochette: 'maison',
    ambiance: "bitume", style: "Rap de Miami", annee: 2010, bpm: 80, voix: "rap",
    tags: ["rap", "miami", "trap", "lourd"],
    energie: 8, etrange: 2, danse: 6 },

  { titre: "Inédit", artiste: "Booba", album: "",
    lien: "https://music.youtube.com/watch?v=_Vdt0ThfC_s", note: "Temps Mort est son meilleur album (ou celui sur lequel il est le + en maîtrise)",
    ambiance: "bitume", style: "Rap français", bpm: 90, voix: "rap",
    tags: ["rap", "france", "boom bap"],
    energie: 6, etrange: 3, danse: 5 },

  { titre: "If Only", artiste: "Raveena", album: "Lucid",
    lien: "https://music.youtube.com/watch?v=hCMuvYSrMuY", note: "Écouteurs dans les transports, visage impassible #bonhomme",
    ambiance: "brume", style: "R&B, soul douce", annee: 2019, bpm: 80, voix: "chant",
    tags: ["rnb", "soul", "doux", "transports"],
    energie: 3, etrange: 4, danse: 4 },

  { titre: "Thank You!!", artiste: "Home Made Kazoku", album: "",
    lien: "https://music.youtube.com/watch?v=43AwELcIZ-w", note: "Morceau super et ending de Bleach (youhou)",
    ambiance: "soleil", style: "Rap japonais, soul", bpm: 95, voix: "rap",
    tags: ["japon", "rap", "anime", "bleach"],
    energie: 6, etrange: 4, danse: 6 },

  { titre: "Mas, Que Nada!", artiste: "Jorge Ben", album: "Samba Esquema Novo",
    lien: "https://music.youtube.com/watch?v=hg0XftC43Zo", note: "Très belle version à ne pas sous-estimer",
    ambiance: "soleil", style: "Samba, bossa", annee: 1963, bpm: 118, voix: "chant",
    tags: ["bresil", "samba", "classique", "fête"],
    energie: 6, etrange: 2, danse: 7 },

  { titre: "100 Bars & Gunnin'", artiste: "Ramirez", album: "",
    lien: "https://music.youtube.com/watch?v=sI_ySt_bdi4", note: "Vu que c'est une radio, autant y aller",
    ambiance: "bitume", style: "Rap, phonk de Memphis", bpm: 130, voix: "rap",
    tags: ["rap", "memphis", "phonk", "sombre"],
    energie: 8, etrange: 6, danse: 5 },

  { titre: "Haruka Kanata", artiste: "Asian Kung-Fu Generation", album: "",
    lien: "https://music.youtube.com/watch?v=wCqpacYI6b0", note: "J'ai toujours été ce weeb…",
    ambiance: "electrique", style: "J-rock", annee: 2003, bpm: 180, voix: "chant",
    tags: ["japon", "rock", "anime", "naruto"],
    energie: 8, etrange: 3, danse: 4 },

  { titre: "Beautiful", artiste: "Eminem", album: "Relapse",
    lien: "https://music.youtube.com/watch?v=F4yb0CBd4I4", note: "Je pourrais jamais le détester à 100 % par respect du moi ado qui l'écoutait bcp",
    ambiance: "bitume", style: "Rap, introspectif", annee: 2009, bpm: 76, voix: "rap",
    tags: ["rap", "introspectif", "samples"],
    energie: 5, etrange: 2, danse: 3 },

  { titre: "reflection eternal", artiste: "Nujabes", album: "Modal Soul",
    lien: "https://music.youtube.com/watch?v=0n7iUJL-Eiw", note: "Je crois bien qu'Hakim avait rappé sur ça y'a genre un peu moins de 10 ans",
    ambiance: "brume", style: "Hip-hop jazz instrumental", annee: 2005, bpm: 88, voix: "instru",
    tags: ["jazz", "hip-hop", "japon", "piano"],
    energie: 3, etrange: 3, danse: 4 },

  { titre: "Life Goes On", artiste: "2Pac", album: "All Eyez on Me",
    lien: "https://music.youtube.com/watch?v=k11iUIQ5XbY", note: "À l'époque je voulais ça comme son d'enterrement, aujourd'hui un petit clair de lune", connu: true,
    ambiance: "bitume", style: "Rap West Coast", annee: 1996, bpm: 90, voix: "rap",
    tags: ["rap", "west coast", "nineties"],
    energie: 5, etrange: 1, danse: 5 },

  { titre: "Saleté de rap", artiste: "Georgio", album: "",
    lien: "https://music.youtube.com/watch?v=f9GTm7kAJTQ", note: "Dites-vous que Zlatan venait d'arriver à Paris (ça date)",
    ambiance: "bitume", style: "Rap français", bpm: 90, voix: "rap",
    tags: ["rap", "france", "paris"],
    energie: 6, etrange: 4, danse: 4 },

  { titre: "Bang Bang", artiste: "MANI", album: "",
    lien: "https://music.youtube.com/watch?v=Et3xz3Ltm2c", note: "C'était un banger",
    ambiance: "bitume", style: "Rap", bpm: 140, voix: "rap",
    tags: ["rap", "banger"],
    energie: 7, etrange: 5, danse: 6 },

  { titre: "Funky Rhytms", artiste: "DJ Logilo", album: "",
    lien: "https://music.youtube.com/watch?v=QFR1Io4T8Rk", note: "Fun fact : j'étais allé retrouver la face B d'un freestyle de Nekfeu qui aujourd'hui n'a que 2000 vues",
    ambiance: "bitume", style: "Instru boom bap", bpm: 90, voix: "instru",
    tags: ["boom bap", "instru", "samples", "funk"],
    energie: 5, etrange: 6, danse: 5 },

  { titre: "Max B (feat. Starring Max B)", artiste: "Ateyaba", album: "",
    lien: "https://music.youtube.com/watch?v=hCwT8-HbBf8", note: "Tokyo>Kyoto",
    ambiance: "bitume", style: "Rap français", bpm: 80, voix: "rap",
    tags: ["rap", "france", "cloud"],
    energie: 5, etrange: 5, danse: 4 },

  { titre: "Something to Rap About (feat. Tyler, The Creator)", artiste: "Freddie Gibbs & The Alchemist", album: "Alfredo 2",
    lien: "https://music.youtube.com/watch?v=POw27Wug4wo", note: "Une de mes instrus préférées",
    ambiance: "bitume", style: "Rap, boucle soul", annee: 2023, bpm: 80, voix: "rap",
    tags: ["rap", "alchemist", "samples", "boucle"],
    energie: 4, etrange: 4, danse: 4 },

  { titre: "Tiny Desk Concert", artiste: "T-Pain", album: "",
    lien: "https://music.youtube.com/watch?v=CIjXUg1s5gc", note: "Régalez-vous bien",
    ambiance: "soleil", style: "R&B en live, sans Auto-Tune", annee: 2014, bpm: 90, voix: "chant",
    tags: ["rnb", "live", "voix", "tiny desk"],
    energie: 5, etrange: 3, danse: 5 },

];

/* Les morceaux retirés exprès (ancienne version, doublon…) : la table de tri
   ne les repropose plus et ne les renvoie plus à Claude. */
const RETIRES = [
  "https://music.youtube.com/watch?v=UGDQVZ4caR0", // Oh! Tengo Suerte, version courte (remplacée)
  "https://music.youtube.com/watch?v=QmH60FrHzO4", // HOWWEFLOW, audio (remplacé par le clip)
  "https://music.youtube.com/watch?v=beO3qViOUiQ", // The Weekend (Original 12 Inch Mix)
  "https://music.youtube.com/watch?v=VwgTm70Njs8", // Casiopea, Sailing Alone
  "https://music.youtube.com/watch?v=9D6xRc5YoZ4", // Sous la pluie
  "https://music.youtube.com/watch?v=lcwGFZQLD9Q", // Al Green, Judy
  "https://music.youtube.com/watch?v=q7LXyZse14I", // David Ruffin, You Ought To Know Me
  "https://music.youtube.com/watch?v=0us-KJG6UIM", // Miles Davis, I See Your Face Before Me
  "https://music.youtube.com/watch?v=jPzKKSzqYzk", // Olivia Rodrigo, all-american bitch
  "https://music.youtube.com/watch?v=jYb-B1j4ul8", // JR Writer, Bird Call
  "https://music.youtube.com/watch?v=Pc6TLSnhvUY", // Grant Green, We've Only Just Begun
  "https://music.youtube.com/watch?v=eozd1FdeSUs", // Lucio Bukowski, Confiture d'orties
  "https://music.youtube.com/watch?v=ZT-UAsTZcdY", // Prince Waly, Broke (audio, remplacé par la COLORS)
  "https://music.youtube.com/watch?v=WZKXguICxUo", // MINISKIRT (audio, remplacé par la vidéo)
  "https://music.youtube.com/watch?v=1DqzwJlvX-0", // Through the Fire (audio, remplacé par la vidéo COLORS)
  "https://music.youtube.com/watch?v=ejamlNAYHmY", // DROPPING SEEDS (audio, remplacé par le clip)
  "https://music.youtube.com/watch?v=Gz6Wgz3HOpM", // For Me (audio, remplacé par le clip)
  "https://music.youtube.com/watch?v=29AuPDvKnxU", // Buddies (audio, remplacé par le clip)
  "https://music.youtube.com/watch?v=SEpJx322NIc", // David Ruffin, I Miss You (Part 1), autre version (le site garde l'autre)
];
