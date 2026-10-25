# Music Discovery

Allume la chaîne, choisis la suite, garde ce qui te plaît.

Site en ligne : https://amelienito.github.io/music-discovery/

---

## Ce que fait le site

- **Le carton d'entrée** : on règle le volume (la molette se tourne comme une vraie), puis **Commencer**. Pas de compte : tes choix restent dans ton navigateur. Ouvert depuis Instagram, TikTok, Messenger…, un bandeau propose d'ouvrir la page dans le vrai navigateur.
- **La chaîne** : une micro-chaîne CD des années 2000, entre deux enceintes.
  - **Le lecteur** : l'écran à cristaux liquides (ou, au choix, le disque qui tourne derrière son hublot, avec la pochette imprimée dessus), la vidéo, les commandes, **♥ J'aime bien** (le morceau part dans ta sélection et la suite va dans ce sens) et **Pas trop comme ça** (on passe au suivant et on s'éloigne de ce genre-là), le volume.
  - **La pile, juste dessous : « La suite, c'est toi qui la poses »**. Trois disques posés sur l'étagère : au milieu celui qui s'enchaîne le mieux (**dans la lignée**), à gauche et à droite un pas de chaque côté d'une échelle (**plus calme / plus énergique**, **moins groovy / plus groovy** ou **plus mainstream / plus confidentiel**), qui change à chaque morceau. Cliquer un disque le met **ensuite** ; le recliquer (ou **Écouter maintenant**) le lance tout de suite ; sans choix, celui du milieu passe. Quand tu choisis un côté, la pile suivante garde la même échelle pour continuer dans ce sens. **Autres disques** repose la pile. Sans vraie pochette, le disque est un CD gravé, le titre écrit au feutre. À partir de deux coups de cœur, on peut aussi écouter **Ma sélection** (la pile pioche dedans).
  - **Ton mot** sur le morceau arrive en post-it, collé sur l'enceinte de droite (on peut le décoller).
  - **Cosmétique** (en haut de la chaîne) : des petits réglages inutiles, couleur de l'écran, égaliseur, vitesse du disque, rétroéclairage, lumières et grilles des enceintes, loudness, bip des touches. Toucher l'écran change aussi sa couleur ; les haut-parleurs répondent quand on tape dessus.
- **Quand on descend** lire « Plus d'infos », la vidéo suit dans un coin (YouTube veut qu'elle reste visible) ; « Revenir à la chaîne » remonte.
- **Plus d'infos** : le genre et l'époque, quelques mots sur le morceau, l'album (titres à écouter 30 secondes), l'artiste (Wikipédia en français, sinon Genius), et où écouter en entier (YouTube Music, Deezer, Apple Music, Qobuz, Bandcamp).
- **Ma sélection** (en haut, à partir de deux morceaux) : tes morceaux en boîtiers de CD, l'historique de tout ce qui est passé, l'écoute dans la chaîne, et de quoi repartir avec une playlist.
- **Clavier** : Espace (lecture / pause), ← et → (morceau précédent / suivant), J (j'aime bien), X (pas trop comme ça), Échap (refermer).
- **Une chaîne qui ne se bloque pas** : un morceau qui refuse de se lire est remplacé par son extrait ou sauté ; après trois ratés d'affilée, elle s'arrête et dit pourquoi.
- **Réglages** : morceaux complets via YouTube, ou extraits de 30 secondes sans pub ; teinte du site (Salon, Nuit, Papier).

## Les recommandations

Chaque morceau a une fiche dans `data.js` (ambiance, style, année, tempo, voix, étiquettes, énergie, groove, notoriété). `moteur.js` compare les fiches :

- **Sans direction**, chaque morceau mène au plus proche qu'on n'a pas entendu récemment ; ce que tu aimes attire, ce que tu n'aimes pas repousse.
- **Avec une direction**, le premier pas va au moins d'un cran dans le sens demandé, par le morceau le plus proche ; ensuite la suite tient le niveau atteint, remonte d'un cran un morceau sur trois quand ça se fait en douceur, et ne redescend jamais de plus d'un cran. Elle préfère un pas modeste dans le même univers à un grand saut vers l'autre bout de la banque.
- La notoriété se mesure au nombre de fans de l'artiste sur Deezer (sinon la note `etrange` de la fiche).
- Avec une petite banque, certains morceaux ont peu de voisins : plus la banque grandit, plus les enchaînements sont naturels.

## La table de tri

**https://amelienito.github.io/music-discovery/tri.html**

1. Colle le lien d'une playlist YouTube ou YouTube Music (ou des liens de morceaux, un par ligne), clique sur Charger. Le formulaire se replie pendant le tri ; le bouton **Playlists** le rouvre.
2. Chaque morceau se lance (à 0:40 pour sauter l'intro, décochable). Bouton **vert = oui**, il entre sur le site. **Rouge = non**, il sort. « Pas sûr » le met de côté pour plus tard. On peut aussi **faire glisser la carte** du morceau : à droite pour oui, à gauche pour non.
3. **Un commentaire par morceau** : le champ sous la carte. Ce que tu écris part tel quel dans le champ `note` de `data.js`. Sur la liste « Le site actuel », le champ contient déjà le texte actuel du morceau.
4. **Coup de cœur** (☆, touche C) : marque les morceaux à mettre en avant. Il devient `coeur: true` dans `data.js`, et le site le propose en priorité quand il glisse un « coup de cœur » dans la découverte.
5. **Régler le ressenti** (facultatif) : trois curseurs, énergie, étrange, danse. Laissés de côté, ce sont les valeurs estimées par Claude qui servent.
6. **Manches de dix** : une barre de dix segments montre où tu en es. Au dixième morceau, un bilan (oui, non, coups de cœur, commentaires, temps restant estimé) te laisse souffler ; chaque ligne rouvre le morceau. Désactivable avec « Bilan toutes les 10 écoutes ».
7. **Objectif du jour** (en haut, toucher pour le changer : 10, 20, 30, 50, 100) et nombre de jours d'affilée.
8. **La frise** : une case par morceau de la playlist (vert oui, rouge non, jaune à revoir, gris déjà vu, contour doré coup de cœur). Toucher une case rouvre le morceau pour changer d'avis.
9. **Revue** : la liste de tout ce qui est jugé, avec filtres (oui, non, à revoir, ★, avec un mot), chiffres, et pour chaque morceau : changer le verdict, le coup de cœur, le commentaire, le réécouter.
10. Clavier : → oui, ← non, ↓ plus tard, C coup de cœur, Espace pause, ↑ +30 s, Z annuler, Échap pour sortir du commentaire, Entrée pour passer au bilan suivant.
11. Un morceau déjà sur le site, ou déjà trié dans n'importe quelle playlist, est sauté tout seul. Tes choix sont enregistrés au fur et à mesure : tu peux fermer et revenir. Recoller la même playlist la reprend là où tu t'étais arrêté.
12. **Sauvegarde** (dans la Revue) : un seul fichier avec tous tes choix, commentaires et réglages, à restaurer sur un autre appareil. La restauration fusionne, elle n'écrase rien.
13. **Ordre aléatoire** (case à cocher) : les morceaux arrivent dans le désordre, pour juger chacun sans être influencé par ceux d'à côté.
14. **Plus de 200 morceaux** : le lecteur YouTube s'arrête à 200. Pour la suite, la table demande la liste à Invidious, un miroir public de YouTube (seulement les titres, la musique passe toujours par le lecteur officiel). Si le miroir est en panne, la table explique comment inverser l'ordre de la playlist pour continuer.
15. Sous chaque titre, la table dit si la vidéo vient d'une chaîne officielle (YouTube Music, l'artiste, le label). Si elle doute, cherche la version officielle avant de dire oui.
16. **Trier aussi les morceaux déjà sur le site** : repasse la sélection actuelle. Vert, il reste ; rouge, il sort.
17. Mode sombre par défaut, bouton « Mode clair » en haut.
18. Quand tu veux : **Copier pour Claude** (texte avec commentaires, coups de cœur et réglages), ou **Copier au format data.js** : des blocs prêts à coller avant le `];` final.

## Les fichiers

| Fichier | À quoi il sert | Tu y touches ? |
|---|---|---|
| `data.js` | Ta banque de morceaux et tes textes | **Oui, c'est le tien** |
| `moteur.js` | Les ambiances et la façon de passer d'un morceau à l'autre (directions comprises) | Rarement |
| `teintes.css` | Les couleurs et polices de chaque teinte | Si tu veux créer une teinte |
| `styles.css` | La forme des objets (chaîne, pile de disques, livret, panneaux) | Rarement |
| `app.js` | Le fonctionnement | Non |
| `pochettes.js` | Va chercher pochettes, extraits, et la fiche de l'album (date, label, titres) | Non |
| `infos.js` | Va chercher les fiches Wikipédia de l'artiste et de l'album | Non |
| `tri.html` + `tri.js` | La table de tri des playlists | Non |
| `index.html` | La page | Non |

## Ajouter un morceau

Dans `data.js`, copie un bloc, colle-le avant le `];` final, remplis :

```js
{ titre: "Pearls", artiste: "Sade", album: "Love Deluxe",
  lien: "https://music.youtube.com/watch?v=JcljzvUgoAQ",
  note: "Ce que tu veux en dire. Ou rien.",
  ambiance: "soleil", style: "Soul feutrée", annee: 1992, bpm: 72, voix: "chant",
  tags: ["soul", "rnb", "nocturne", "ballade"],
  energie: 2, etrange: 4, danse: 1 },
```

- La **fiche** (ambiance, style, année, tempo, voix, étiquettes, énergie, groove, notoriété) décide de ses voisins dans la radio. Le plus simple : colle tes « oui » de la table de tri à Claude, il écrit les fiches.

- La **pochette** et l'**extrait** se trouvent tout seuls (pas besoin de les fournir).
- La **note** est facultative. Un morceau sans texte, c'est très bien aussi.

## Vérifier que tous les morceaux se lisent

Ouvre **https://amelienito.github.io/music-discovery/verif.html** et clique sur « Lancer la vérification ». La page teste chaque morceau et te dit lesquels refusent d'être lus sur un autre site, avec un lien pour chercher une autre version. Remplace le lien dans `data.js`, c'est tout.

## Dans les clous

- **Le site n'héberge aucune musique.** Il intègre le lecteur officiel de YouTube, comme un article de blog intègre une vidéo. En Europe, intégrer une vidéo mise en ligne avec l'accord des ayants droit est légal (Cour de justice de l'UE, arrêts Svensson 2014 et BestWater 2014). D'où l'importance de choisir des versions **officielles** (la table de tri les signale).
- **Les règles du lecteur YouTube sont respectées** : la vidéo est toujours visible quand elle joue (au moins 200 × 200 pixels, rien par-dessus), jamais de lecture cachée, et le site ne pousse plus à bloquer les pubs (c'est interdit par ces règles, et ce sont ces pubs qui paient les artistes). Replier le petit lecteur met la vidéo en pause.
- **Les extraits de 30 secondes** viennent de Deezer et d'Apple Music, qui les fournissent pour faire découvrir : le site indique toujours d'où vient l'extrait, avec le lien pour écouter le morceau en entier chez eux.
- **Pour aller plus loin (payant)** : une vraie webradio, comme Radiooooo, qui diffuse ses propres fichiers. En France, pour une webradio associative sans recettes : environ 80 € HT par an à la SACEM (forfait 2021) et au moins 300 € HT par an à la SPRE (barème 2019), plus l'hébergement du flux. Ça ne couvrirait qu'Écouter (une radio, où l'on ne choisit pas le morceau) ; Découvrir resterait sur YouTube.

## Ce qu'il faut savoir

- La lecture passe par le lecteur YouTube intégré : gratuit, complet, pour tout le monde, sans compte. Pas de Spotify.
- Certains morceaux refusent d'être lus hors de YouTube. Le site le détecte et joue à la place l'extrait de 30 secondes, avec le lien vers la version complète. Le vérificateur te dit lesquels remplacer.
- Les morceaux complets passent par YouTube, qui peut afficher des pubs. Un visiteur connecté à YouTube Premium n'en a pas. Sinon : le mode extraits, ou les liens Deezer, Apple Music, Qobuz et Bandcamp de chaque morceau (le site l'explique la première fois).
- Les extraits viennent d'Apple Music, et de Deezer quand Apple ne trouve pas.
- Les ambiances et l'ordre des disques viennent des fiches de `data.js` : une fiche juste, c'est un enchaînement fluide.
- Sur iPhone, une page web ne peut pas régler le volume : ce sont les boutons du téléphone qui comptent.
- Les pochettes HD viennent d'Apple Music ou de Deezer. Si un morceau n'y est pas, l'image YouTube prend le relais.
- Tout est gratuit : aucun serveur, aucune base de données, hébergé par GitHub Pages.
