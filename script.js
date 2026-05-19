// ============================================================
//  Liste des joueurs — Mondial 2026
//  En attendant les photos, chaque joueur dispose d'initiales
//  affichées sur un placeholder doré/noir. Dès qu'un fichier
//  `mondial2026/<file>` existe, il remplace automatiquement le
//  placeholder sans modification de code.
// ============================================================
// `rank` controle l'ordre d'apparition des joueurs : on tire d'abord
// tous les joueurs de rang 1 (melanges), puis rang 2, puis 3, et enfin
// rang 4 (les top stars). Cela evite les affiches Messi vs Mbappe dans
// les premiers duels. Modifie librement le rank de chaque joueur.
const PLAYERS = [
  { file: "mbappe.jpg",          name: "Kylian Mbappé",      initials: "KM",  rank: 4 },
  { file: "dembele.jpg",         name: "Ousmane Dembélé",    initials: "OD",  rank: 3 },
  { file: "olise.jpg",           name: "Michael Olise",      initials: "MO",  rank: 4 },
  { file: "kane.jpg",            name: "Harry Kane",         initials: "HK",  rank: 4 },
  { file: "saka.jpg",            name: "Bukayo Saka",        initials: "BS",  rank: 3 },
  { file: "yamal.jpg",           name: "Lamine Yamal",       initials: "LY",  rank: 4 },
  { file: "pedri.jpg",           name: "Pedri",              initials: "PE",  rank: 2 },
  { file: "cubarsi.jpg",         name: "Pau Cubarsí",        initials: "PC",  rank: 1 },
  { file: "dejong.jpg",          name: "Frenkie de Jong",    initials: "FJ",  rank: 2 },
  { file: "kimmich.jpg",         name: "Joshua Kimmich",     initials: "JK",  rank: 2 },
  { file: "musiala.jpg",         name: "Jamal Musiala",      initials: "JM",  rank: 3 },
  { file: "wirtz.jpg",           name: "Florian Wirtz",      initials: "FW",  rank: 2 },
  { file: "pulisic.jpg",         name: "Christian Pulisic",  initials: "CP",  rank: 2 },
  { file: "davies.jpg",          name: "Alphonso Davies",    initials: "AD",  rank: 2 },
  { file: "messi.jpg",           name: "Lionel Messi",       initials: "LM",  rank: 4 },
  { file: "alvarez.jpg",         name: "Julián Álvarez",     initials: "JA",  rank: 3 },
  { file: "vinicius.jpg",        name: "Vinicius",           initials: "VI",  rank: 4 },
  { file: "raphinha.jpg",        name: "Raphinha",           initials: "RA",  rank: 3 },
  { file: "marquinhos.jpg",      name: "Marquinhos",         initials: "MA",  rank: 2 },
  { file: "mendes.jpg",          name: "Nuno Mendes",        initials: "NM",  rank: 1 },
  { file: "bruno-fernandes.jpg", name: "Bruno Fernandes",    initials: "BF",  rank: 2 },
  { file: "ronaldo.jpg",         name: "Cristiano Ronaldo",  initials: "CR",  rank: 4 },
  { file: "debruyne.jpg",        name: "Kevin De Bruyne",    initials: "KDB", rank: 2 },
  { file: "doku.jpg",            name: "Jérémy Doku",        initials: "JD",  rank: 1 },
  { file: "modric.jpg",          name: "Luka Modric",        initials: "LM",  rank: 3 },
  { file: "hakimi.jpg",          name: "Achraf Hakimi",      initials: "AH",  rank: 3 },
  { file: "diaz.jpg",            name: "Luis Díaz",          initials: "LD",  rank: 1 },
  { file: "valverde.jpg",        name: "Federico Valverde",  initials: "FV",  rank: 2 },
  { file: "mane.jpg",            name: "Sadio Mané",         initials: "SM",  rank: 2 },
  { file: "haaland.jpg",         name: "Erling Haaland",     initials: "EH",  rank: 4 },
  { file: "salah.jpg",           name: "Mohamed Salah",      initials: "MS",  rank: 3 },
  { file: "mahrez.jpg",          name: "Riyad Mahrez",       initials: "RM",  rank: 1 },
  { file: "mctominay.jpg",       name: "Scott McTominay",    initials: "SM",  rank: 1 },
  { file: "diomande.jpg",        name: "Yan Diomandé",       initials: "YD",  rank: 1 },
  { file: "isak.jpg",            name: "Alexander Isak",     initials: "AI",  rank: 1 },
  { file: "yildiz.jpg",          name: "Kenan Yildiz",       initials: "KY",  rank: 1 },
  { file: "martinez.jpg",        name: "Lautaro Martínez",   initials: "LM",  rank: 2 },
];

// ============================================================
//  État du jeu
// ============================================================
const state = {
  pool: [],
  champion: null,
  challenger: null,
  round: 1,
  history: [],
  locked: false,
};

// ============================================================
//  DOM refs
// ============================================================
const $ = (id) => document.getElementById(id);
const imgLeft       = $("img-left");
const imgRight      = $("img-right");
const nameLeft      = $("name-left");
const nameRight     = $("name-right");
const cardLeft      = $("card-left");
const cardRight     = $("card-right");
const roundNum      = $("round-number");
const historyList   = $("history");
const duelEl        = $("duel");
const endEl         = $("endscreen");
const placeholderL  = $("placeholder-left");
const placeholderR  = $("placeholder-right");
const placeholderC  = $("placeholder-champion");
const undoBtn       = $("undo-btn");

// ============================================================
//  Utils
// ============================================================
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Construit le pool en respectant l'ordre des rangs :
// rang 1 melange, puis rang 2 melange, puis 3, puis 4.
// Les joueurs sans `rank` defini sont assimiles au rang 4 (en fin).
function buildPool() {
  const byRank = [[], [], [], []];
  PLAYERS.forEach((p) => {
    const r = Math.max(1, Math.min(4, p.rank || 4));
    byRank[r - 1].push(p);
  });
  return [
    ...shuffle(byRank[0]),
    ...shuffle(byRank[1]),
    ...shuffle(byRank[2]),
    ...shuffle(byRank[3]),
  ];
}

function imgPath(p) {
  return `images/${p.file}`;
}

const _imgCache = new Map();
function preloadAll() {
  PLAYERS.forEach((p) => {
    if (_imgCache.has(p.file)) return;
    const img = new Image();
    img.decoding = "async";
    img.src = imgPath(p);
    _imgCache.set(p.file, img);
  });
}
function preloadOne(p) {
  if (!p || _imgCache.has(p.file)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = imgPath(p);
  _imgCache.set(p.file, img);
}

// Affecte une photo à un <img>, gère le placeholder (initiales) si la
// photo n'existe pas encore (le fichier renvoie 404).
function setImage(imgEl, placeholderEl, player) {
  placeholderEl.querySelector(".initials").textContent = player.initials;

  imgEl.classList.remove("loaded");
  imgEl.alt = player.name;
  imgEl.style.objectPosition = player.crop || "";

  imgEl.onload  = () => imgEl.classList.add("loaded");
  imgEl.onerror = () => imgEl.classList.remove("loaded");
  imgEl.src = imgPath(player);
}

// ============================================================
//  Démarrage / Reset
// ============================================================
function startGame() {
  preloadAll();

  state.pool = buildPool();
  state.champion = state.pool.shift();
  state.challenger = state.pool.shift();
  state.round = 1;
  state.history = [];
  state.locked = false;

  endEl.classList.add("hidden");
  duelEl.style.display = "";
  historyList.innerHTML = "";
  undoBtn.disabled = true;
  renderDuel();
}

const TOTAL_DUELS = PLAYERS.length - 1;

function renderDuel() {
  roundNum.textContent = `${state.round}/${TOTAL_DUELS}`;

  setImage(imgLeft, placeholderL, state.champion);
  nameLeft.textContent = state.champion.name;

  setImage(imgRight, placeholderR, state.challenger);
  nameRight.textContent = state.challenger.name;

  cardLeft.classList.remove("winner", "loser");
  cardRight.classList.remove("winner", "loser");
}

// ============================================================
//  Choix utilisateur
// ============================================================
function pick(side) {
  if (state.locked) return;
  state.locked = true;

  const winner = side === "left" ? state.champion : state.challenger;
  const loser  = side === "left" ? state.challenger : state.champion;

  (side === "left" ? cardLeft  : cardRight).classList.add("winner");
  (side === "left" ? cardRight : cardLeft ).classList.add("loser");

  // On capture l'etat AVANT mise a jour pour pouvoir le restaurer via undo()
  state.history.push({
    round: state.round,
    winner,
    loser,
    side,
    prevChampion: state.champion,
    prevChallenger: state.challenger,
  });
  renderHistory();
  undoBtn.disabled = false;

  setTimeout(() => {
    // try/finally pour garantir que le verrou est toujours relache,
    // meme si une exception survient dans le rendu ou showEnd.
    try {
      state.champion = winner;

      if (state.pool.length === 0) {
        showEnd();
        return;
      }

      state.challenger = state.pool.shift();
      state.round += 1;
      renderDuel();
      preloadOne(state.pool[0]);
    } finally {
      state.locked = false;
    }
  }, 480);
}

// Restaure l'etat d'avant la derniere selection.
function undo() {
  if (state.locked) return;
  if (state.history.length === 0) return;

  const popped = state.history.pop();

  // Si on n'etait pas a l'ecran de fin, c'est que state.challenger
  // courant venait de pool.shift() : on le remet au debut du pool.
  const onEndscreen = !endEl.classList.contains("hidden");
  if (!onEndscreen) {
    state.pool.unshift(state.challenger);
  }

  state.champion = popped.prevChampion;
  state.challenger = popped.prevChallenger;
  state.round = popped.round;

  endEl.classList.add("hidden");
  duelEl.style.display = "";

  renderDuel();
  renderHistory();
  undoBtn.disabled = state.history.length === 0;
}

// ============================================================
//  Historique
// ============================================================
function renderHistory() {
  historyList.innerHTML = state.history
    .map(
      (h) => `
        <li title="Duel ${h.round} : ${h.winner.name} vs ${h.loser.name}">
          <span class="num">${h.round}</span>
          <span class="pair">
            <span class="win">✓ ${h.winner.name}</span>
            <span class="lose">${h.loser.name}</span>
          </span>
        </li>`
    )
    .join("");
}

// ============================================================
//  Écran de fin
// ============================================================
function showEnd() {
  duelEl.style.display = "none";
  endEl.classList.remove("hidden");

  const champImg = $("champion-img");
  setImage(champImg, placeholderC, state.champion);
  $("champion-name").textContent = state.champion.name;

  renderHistory();
  const last = historyList.lastElementChild;
  if (last) last.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ============================================================
//  Téléchargements
// ============================================================
async function downloadImage() {
  const target = document.getElementById("recap-block");
  const actions = target.querySelector(".history-actions");
  const prevDisplay = actions ? actions.style.display : "";
  if (actions) actions.style.display = "none";

  try {
    const canvas = await html2canvas(target, {
      backgroundColor: "#0d0d0d",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = "vainqueur-reste-mondial-2026.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Erreur capture image :", err);
    alert("Impossible de générer l'image. Ouvre le jeu via un serveur local (ex: python3 -m http.server).");
  } finally {
    if (actions) actions.style.display = prevDisplay;
  }
}

// ============================================================
//  Partage réseaux (URL de la page d'intégration)
// ============================================================
let hostUrl = (() => {
  try {
    if (window.top !== window.self) {
      return document.referrer || location.href;
    }
  } catch (e) {}
  return location.href;
})();

window.addEventListener("message", (e) => {
  if (e.data && typeof e.data === "object" && e.data.type === "host-url" && typeof e.data.url === "string") {
    hostUrl = e.data.url;
  }
});

function share(network) {
  const url = hostUrl;
  const text = state.history.length > 0
    ? `Mon joueur préféré pour le moment : ${state.champion.name} ! Joue au jeu : 'Le Vainqueur reste — Édition Mondial 2026' 🏆⚽`
    : `Joue au jeu : 'Le Vainqueur reste — Édition Mondial 2026' 🏆⚽ — qui est ton joueur préféré ?`;

  const enc = encodeURIComponent;
  const links = {
    twitter:  `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${enc(text + " " + url)}`,
  };

  if (network === "copy") {
    navigator.clipboard.writeText(url).then(() => {
      const toast = $("share-toast");
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 1800);
    });
    return;
  }
  window.open(links[network], "_blank", "noopener");
}

// ============================================================
//  Event listeners
// ============================================================
document.querySelectorAll(".choose-btn").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    pick(btn.dataset.side);
  })
);

cardLeft.addEventListener("click", () => pick("left"));
cardRight.addEventListener("click", () => pick("right"));

$("restart-btn").addEventListener("click", startGame);
$("download-img").addEventListener("click", downloadImage);
undoBtn.addEventListener("click", undo);

document.querySelectorAll(".share-btn").forEach((btn) =>
  btn.addEventListener("click", () => share(btn.dataset.network))
);

// ============================================================
//  Communication de la hauteur vers la page hôte (iframe)
// ============================================================
function sendHeight() {
  if (window.top === window.self) return;
  const h = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  window.parent.postMessage({ type: "duel-height", height: h }, "*");
}

if (typeof ResizeObserver !== "undefined") {
  const ro = new ResizeObserver(() => sendHeight());
  ro.observe(document.body);
}
window.addEventListener("load",   sendHeight);
window.addEventListener("resize", sendHeight);

// Go!
startGame();
sendHeight();
