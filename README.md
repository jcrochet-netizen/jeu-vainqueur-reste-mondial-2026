# Le vainqueur reste — Édition Mondial 2026

Jeu de duels entre joueurs vedettes du Mondial 2026. À chaque tour deux joueurs sont proposés, l'utilisateur choisit son préféré, le vainqueur reste en place et affronte un nouvel adversaire jusqu'à ne laisser qu'un seul gagnant.

## État

- 37 joueurs (36 duels par partie)
- Photos hébergées dans `images/` (source : photos officielles ICONSPORT)
- Jamal Musiala est sans photo pour le moment : son placeholder doré "JM" s'affiche en attendant qu'une photo `images/musiala.jpg` soit ajoutée

## Fonctionnalités

- Thème or / noir / blanc
- Cartes avec photo et nom, animations winner / loser
- Historique en 4 colonnes
- Téléchargement du récap en **image PNG** ou **texte**
- Partage Twitter / Facebook / WhatsApp / copie de lien
- **Intégration en iframe** : hauteur adaptative et propagation de l'URL hôte pour les partages
- Fallback automatique : si un fichier `images/<file>.jpg` est manquant, un placeholder doré avec les initiales du joueur s'affiche

## Lancement local

```bash
python3 -m http.server
```

Puis ouvrir <http://localhost:8000>.

## Intégration sur un site

```html
<iframe id="duel-frame"
        src="https://jcrochet-netizen.github.io/jeu-vainqueur-reste-mondial-2026/"
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
- [images/](images/) — photos `.jpg` des joueurs (37 attendues, 36 actuellement)
