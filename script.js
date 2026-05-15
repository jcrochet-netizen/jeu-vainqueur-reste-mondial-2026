// ============================================================
//  Liste des joueurs — Mondial 2026
//  En attendant les photos, chaque joueur dispose d'initiales
//  affichées sur un placeholder doré/noir. Dès qu'un fichier
//  `mondial2026/<file>` existe, il remplace automatiquement le
//  placeholder sans modification de code.
// ============================================================
const PLAYERS = [
  { file: "mbappe.jpg",          name: "Kylian Mbappé",      initials: "KM"  },
  { file: "dembele.jpg",         name: "Ousmane Dembélé",    initials: "OD"  },
  { file: "olise.jpg",           name: "Michael Olise",      initials: "MO"  },
  { file: "kane.jpg",            name: "Harry Kane",         initials: "HK"  },
  { file: "saka.jpg",            name: "Bukayo Saka",        initials: "BS"  },
  { file: "yamal.jpg",           name: "Lamine Yamal",       initials: "LY"  },
  { file: "pedri.jpg",           name: "Pedri",              initials: "PE"  },
  { file: "cubarsi.jpg",         name: "Pau Cubarsí",        initials: "PC"  },
  { file: "dejong.jpg",          name: "Frenkie de Jong",    initials: "FJ"  },
  { file: "kimmich.jpg",         name: "Joshua Kimmich",     initials: "JK"  },
  { file: "musiala.jpg",         name: "Jamal Musiala",      initials: "JM"  },
  { file: "wirtz.jpg",           name: "Florian Wirtz",      initials: "FW"  },
  { file: "pulisic.jpg",         name: "Christian Pulisic",  initials: "CP"  },
  { file: "davies.jpg",          name: "Alphonso Davies",    initials: "AD"  },
  { file: "messi.jpg",           name: "Lionel Messi",       initials: "LM"  },
  { file: "alvarez.jpg",         name: "Julián Álvarez",     initials: "JA"  },
  { file: "vinicius.jpg",        name: "Vinicius",           initials: "VI"  },
  { file: "raphinha.jpg",        name: "Raphinha",           initials: "RA"  },
  { file: "marquinhos.jpg",      name: "Marquinhos",         initials: "MA"  },
  { file: "mendes.jpg",          name: "Nuno Mendes",        initials: "NM"  },
  { file: "bruno-fernandes.jpg", name: "Bruno Fernandes",    initials: "BF"  },
  { file: "ronaldo.jpg",         name: "Cristiano Ronaldo",  initials: "CR"  },
  { file: "debruyne.jpg",        name: "Kevin De Bruyne",    initials: "KDB" },
  { file: "doku.jpg",            name: "Jérémy Doku",        initials: "JD"  },
  { file: "modric.jpg",          name: "Luka Modric",        initials: "LM"  },
  { file: "hakimi.jpg",          name: "Achraf Hakimi",      initials: "AH"  },
  { file: "diaz.jpg",            name: "Luis Díaz",          initials: "LD"  },
  { file: "valverde.jpg",        name: "Federico Valverde",  initials: "FV"  },
  { file: "mane.jpg",            name: "Sadio Mané",         initials: "SM"  },
  { file: "haaland.jpg",         name: "Erling Haaland",     initials: "EH"  },
  { file: "salah.jpg",           name: "Mohamed Salah",      initials: "MS"  },
  { file: "mahrez.jpg",          name: "Riyad Mahrez",       initials: "RM"  },
  { file: "mctominay.jpg",       name: "Scott McTominay",    initials: "SM"  },
  { file: "diomande.jpg",        name: "Yan Diomandé",       initials: "YD"  },
  { file: "isak.jpg",            name: "Alexander Isak",     initials: "AI"  },
  { file: "yildiz.jpg",          name: "Kenan Yildiz",       initials: "KY"  },
  { file: "martinez.jpg",        name: "Lautaro Martínez",   initials: "LM"  },
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
  prevChampion: null,    // pour détecter si la carte gauche change
  prevChallenger: null,  // pour détecter si la carte droite change
};

// Durée de la rotation 360° (en ms). Le swap de photo se fait à la moitié,
// quand le dos de la carte fait face au joueur.
const FLIP_DURATION = 700;

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

function imgPath(p) {
  return `mondial2026/${p.file}`;
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

  state.pool = shuffle(PLAYERS);
  state.champion = state.pool.shift();
  state.challenger = state.pool.shift();
  state.round = 1;
  state.history = [];
  state.prevChampion = null;
  state.prevChallenger = null;

  endEl.classList.add("hidden");
  duelEl.style.display = "";
  historyList.innerHTML = "";
  renderDuel({ flip: false });
}

const TOTAL_DUELS = PLAYERS.length - 1;

// Pose le contenu d'une carte sans animation (1er rendu).
function setCardContent(imgEl, placeholderEl, nameEl, player) {
  setImage(imgEl, placeholderEl, player);
  nameEl.textContent = player.name;
}

// Anime un flip 360° sur la carte. Le contenu est swappé à mi-flip,
// pendant que le dos de la carte fait face à l'utilisateur.
function flipCardTo(cardEl, imgEl, placeholderEl, nameEl, player) {
  const flipper = cardEl.querySelector(".photo-inner");
  if (!flipper) return setCardContent(imgEl, placeholderEl, nameEl, player);

  // Reset et déclenchement de l'animation
  flipper.classList.remove("flipping");
  void flipper.offsetWidth; // force reflow
  flipper.classList.add("flipping");

  // Au milieu de l'animation (le dos est face au viewer), on swap le contenu
  setTimeout(() => {
    setCardContent(imgEl, placeholderEl, nameEl, player);
  }, FLIP_DURATION / 2);

  // Nettoyage de la classe en fin d'animation
  setTimeout(() => {
    flipper.classList.remove("flipping");
  }, FLIP_DURATION + 20);
}

function renderDuel({ flip = true } = {}) {
  roundNum.textContent = `${state.round}/${TOTAL_DUELS}`;

  const championChanged   = !state.prevChampion   || state.prevChampion.file   !== state.champion.file;
  const challengerChanged = !state.prevChallenger || state.prevChallenger.file !== state.challenger.file;

  if (championChanged) {
    if (flip) flipCardTo(cardLeft,  imgLeft,  placeholderL, nameLeft,  state.champion);
    else      setCardContent(imgLeft, placeholderL, nameLeft, state.champion);
  }
  if (challengerChanged) {
    if (flip) flipCardTo(cardRight, imgRight, placeholderR, nameRight, state.challenger);
    else      setCardContent(imgRight, placeholderR, nameRight, state.challenger);
  }

  state.prevChampion   = state.champion;
  state.prevChallenger = state.challenger;

  cardLeft.classList.remove("winner", "loser");
  cardRight.classList.remove("winner", "loser");
}

// ============================================================
//  Choix utilisateur
// ============================================================
function pick(side) {
  const winner = side === "left" ? state.champion : state.challenger;
  const loser  = side === "left" ? state.challenger : state.champion;

  (side === "left" ? cardLeft  : cardRight).classList.add("winner");
  (side === "left" ? cardRight : cardLeft ).classList.add("loser");

  state.history.push({ round: state.round, winner, loser });
  renderHistory();

  setTimeout(() => {
    state.champion = winner;

    if (state.pool.length === 0) {
      showEnd();
      return;
    }

    state.challenger = state.pool.shift();
    state.round += 1;
    renderDuel();
    preloadOne(state.pool[0]);
  }, 480);
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
function downloadText() {
  const lines = [
    "🏆 LE VAINQUEUR RESTE — MONDIAL 2026",
    "=".repeat(40),
    "",
    ...state.history.map(
      (h) => `Duel ${h.round}: ${h.winner.name}  ✓   vs   ${h.loser.name}  ✗`
    ),
    "",
    state.pool.length === 0 && state.history.length > 0
      ? `🏆 Joueur préféré : ${state.champion.name}`
      : `Champion actuel : ${state.champion.name}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vainqueur-reste-mondial-2026.txt";
  a.click();
  URL.revokeObjectURL(url);
}

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
    ? `Mon joueur préféré pour le moment : ${state.champion.name} ! Joue au Vainqueur reste — Édition Mondial 2026 🏆⚽`
    : `Joue au Vainqueur reste — Édition Mondial 2026 🏆⚽ — qui est ton joueur préféré ?`;

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
$("download-txt").addEventListener("click", downloadText);
$("download-img").addEventListener("click", downloadImage);

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
