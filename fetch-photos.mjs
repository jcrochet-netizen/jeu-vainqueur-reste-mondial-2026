#!/usr/bin/env node
/**
 * fetch-photos.mjs
 * Télécharge les photos des 37 joueurs depuis l'API Sportmonks v3 et les
 * enregistre dans ./mondial2026/<file>.jpg
 *
 * Usage :
 *   SPORTMONKS_TOKEN=ton_token node fetch-photos.mjs
 *
 * Le token n'est jamais lu depuis le code ni commité — il est lu uniquement
 * dans l'environnement au moment de l'exécution.
 *
 * Nécessite Node 18+ (fetch natif).
 */

import fs from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.SPORTMONKS_TOKEN;
if (!TOKEN) {
  console.error("✗ Définis SPORTMONKS_TOKEN avant de lancer :");
  console.error("    SPORTMONKS_TOKEN=ton_token node fetch-photos.mjs\n");
  process.exit(1);
}

const API = "https://api.sportmonks.com/v3/football";
const PHOTO_DIR = "mondial2026";

// Liste à garder en miroir avec PLAYERS dans script.js.
// `hint` (optionnel) aide à désambiguïser quand plusieurs joueurs portent
// un nom proche (ex: club, nationalité).
const PLAYERS = [
  { file: "mbappe.jpg",          name: "Kylian Mbappé"      },
  { file: "dembele.jpg",         name: "Ousmane Dembélé"    },
  { file: "olise.jpg",           name: "Michael Olise"      },
  { file: "kane.jpg",            name: "Harry Kane"         },
  { file: "saka.jpg",            name: "Bukayo Saka"        },
  { file: "yamal.jpg",           name: "Lamine Yamal"       },
  { file: "pedri.jpg",           name: "Pedri"              },
  { file: "cubarsi.jpg",         name: "Pau Cubarsí"        },
  { file: "dejong.jpg",          name: "Frenkie de Jong"    },
  { file: "kimmich.jpg",         name: "Joshua Kimmich"     },
  { file: "musiala.jpg",         name: "Jamal Musiala"      },
  { file: "wirtz.jpg",           name: "Florian Wirtz"      },
  { file: "pulisic.jpg",         name: "Christian Pulisic"  },
  { file: "davies.jpg",          name: "Alphonso Davies"    },
  { file: "messi.jpg",           name: "Lionel Messi"       },
  { file: "alvarez.jpg",         name: "Julián Álvarez"     },
  { file: "vinicius.jpg",        name: "Vinicius Junior"    },
  { file: "raphinha.jpg",        name: "Raphinha"           },
  { file: "marquinhos.jpg",      name: "Marquinhos"         },
  { file: "mendes.jpg",          name: "Nuno Mendes"        },
  { file: "bruno-fernandes.jpg", name: "Bruno Fernandes"    },
  { file: "ronaldo.jpg",         name: "Cristiano Ronaldo"  },
  { file: "debruyne.jpg",        name: "Kevin De Bruyne"    },
  { file: "doku.jpg",            name: "Jérémy Doku"        },
  { file: "modric.jpg",          name: "Luka Modric"        },
  { file: "hakimi.jpg",          name: "Achraf Hakimi"      },
  { file: "diaz.jpg",            name: "Luis Díaz"          },
  { file: "valverde.jpg",        name: "Federico Valverde"  },
  { file: "mane.jpg",            name: "Sadio Mané"         },
  { file: "haaland.jpg",         name: "Erling Haaland"     },
  { file: "salah.jpg",           name: "Mohamed Salah"      },
  { file: "mahrez.jpg",          name: "Riyad Mahrez"       },
  { file: "mctominay.jpg",       name: "Scott McTominay"    },
  { file: "diomande.jpg",        name: "Yan Diomandé"       },
  { file: "isak.jpg",            name: "Alexander Isak"     },
  { file: "yildiz.jpg",          name: "Kenan Yildiz"       },
  { file: "martinez.jpg",        name: "Lautaro Martínez"   },
];

async function searchPlayer(name) {
  // Endpoint v3 : /players/search/{query}
  const url = `${API}/players/search/${encodeURIComponent(name)}?api_token=${TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} sur la recherche`);
  }
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} sur le téléchargement`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

await fs.mkdir(PHOTO_DIR, { recursive: true });

let ok = 0, miss = 0, fail = 0;
const issues = [];

for (const p of PLAYERS) {
  try {
    const results = await searchPlayer(p.name);
    if (results.length === 0) {
      console.warn(`✗ Pas trouvé : ${p.name}`);
      issues.push(`${p.name} — aucun résultat`);
      miss++;
      continue;
    }
    // On prend le 1er résultat. À vérifier manuellement si un joueur
    // mal nommé revient (homonymes possibles).
    const player = results[0];
    if (!player.image_path) {
      console.warn(`✗ Pas de photo : ${p.name} (id=${player.id})`);
      issues.push(`${p.name} — pas d'image_path (id=${player.id})`);
      miss++;
      continue;
    }
    const dest = path.join(PHOTO_DIR, p.file);
    await downloadTo(player.image_path, dest);
    console.log(`✓ ${p.name.padEnd(28)} → ${p.file}  (id=${player.id})`);
    ok++;
  } catch (e) {
    console.error(`✗ Erreur ${p.name} : ${e.message}`);
    issues.push(`${p.name} — ${e.message}`);
    fail++;
  }
  // Petite pause polie
  await new Promise((r) => setTimeout(r, 200));
}

console.log("\n" + "=".repeat(50));
console.log(`Bilan : ${ok} OK · ${miss} introuvable · ${fail} erreur`);
if (issues.length > 0) {
  console.log("\nÀ vérifier manuellement :");
  issues.forEach((i) => console.log("  - " + i));
}
