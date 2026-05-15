# Le vainqueur reste — Édition Mondial 2026

Jeu de duels entre joueurs vedettes du Mondial 2026. À chaque tour deux joueurs sont proposés, l'utilisateur choisit son préféré, le vainqueur reste en place et affronte un nouvel adversaire jusqu'à ne laisser qu'un seul gagnant.

## État

- 37 joueurs (36 duels par partie)
- Photos **non encore fournies** : un placeholder doré sur fond noir affiche les initiales de chaque joueur. Dès qu'un fichier `mondial2026/<file>.jpg` est ajouté, il remplace automatiquement le placeholder du joueur correspondant.

## Récupération automatique des photos via Sportmonks

Si tu as un token Sportmonks v3 (plan football), le script `fetch-photos.mjs` interroge l'API par nom et télécharge les 37 photos d'un coup :

```bash
SPORTMONKS_TOKEN=ton_token_ici node fetch-photos.mjs
```

- Le token reste local (jamais commité, lu uniquement via variable d'environnement).
- Les photos sont enregistrées dans `mondial2026/` avec exactement les noms attendus par `script.js`.
- En cas d'homonymie, c'est le 1er résultat de la recherche qui est pris — vérifier manuellement après run.
- Nécessite Node 18+ (fetch natif).

Pour publier les photos après le run :

```bash
git add mondial2026/*.jpg
git commit -m "Ajout des photos depuis Sportmonks"
git push
```

## Fonctionnalités

- Thème or / noir / blanc
- Cartes avec photo (ou initiales) et nom, animations winner / loser
- Historique en 4 colonnes
- Téléchargement du récap en **image PNG** ou **texte**
- Partage Twitter / Facebook / WhatsApp / copie de lien
- **Intégration en iframe** : hauteur adaptative et propagation de l'URL hôte pour les partages

## Liste des photos attendues

Place chaque fichier dans `mondial2026/` avec exactement ces noms (lowercase, sans accents) :

```
mbappe.jpg, dembele.jpg, olise.jpg, kane.jpg, saka.jpg,
yamal.jpg, pedri.jpg, cubarsi.jpg, dejong.jpg, kimmich.jpg,
musiala.jpg, wirtz.jpg, pulisic.jpg, davies.jpg, messi.jpg,
alvarez.jpg, vinicius.jpg, raphinha.jpg, marquinhos.jpg,
mendes.jpg, bruno-fernandes.jpg, ronaldo.jpg, debruyne.jpg,
doku.jpg, modric.jpg, hakimi.jpg, diaz.jpg, valverde.jpg,
mane.jpg, haaland.jpg, salah.jpg, mahrez.jpg, mctominay.jpg,
diomande.jpg, isak.jpg, yildiz.jpg, martinez.jpg
```

## Lancement local

```bash
python3 -m http.server
```

Puis ouvrir <http://localhost:8000>.

## Intégration sur un site

```html
<iframe id="duel-frame"
        src="https://ton-domaine.com/jeu-mondial-2026/"
        style="width:100%;border:0;display:block"
        scrolling="no"></iframe>

<script>
  const frame = document.getElementById("duel-frame");

  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "duel-height") {
      frame.style.height = e.data.height + "px";
    }
  });

  frame.addEventListener("load", () => {
    frame.contentWindow.postMessage(
      { type: "host-url", url: location.href },
      "*"
    );
  });
</script>
```

## Structure

- [index.html](index.html) — structure du jeu
- [style.css](style.css) — design or / noir / blanc
- [script.js](script.js) — logique de duel, historique, partage, capture image
- [mondial2026/](mondial2026/) — photos `.jpg` (à compléter)
