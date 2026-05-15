#!/usr/bin/env node
/**
 * fetch-photos.mjs
 * Télécharge les photos des joueurs depuis l'API Sportmonks v3.
 *
 * Stratégie de match :
 *   1. Recherche par nom (ou `searchQuery` si fourni pour lever une ambiguïté)
 *   2. On élimine les résultats avec image placeholder
 *   3. Si une nationalité est précisée, on garde uniquement les joueurs de
 *      cette nationalité
 *   4. On prend le 1er candidat restant
 *
 * Usage :
 *   SPORTMONKS_TOKEN=ton_token node fetch-photos.mjs
 *
 * Nécessite Node 18+.
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

// `searchQuery` (optionnel) : utilisé pour la recherche API quand le nom court
// ne renvoie pas le bon joueur (cas Pedri, Bruno Fernandes, etc.)
// `nationality` (optionnel) : nom exact de la nationalité côté Sportmonks
//   (ex: France, Spain, England, Portugal, Argentina, Brazil, Germany,
//   Netherlands, Belgium, USA, Canada, Croatia, Morocco, Colombia, Uruguay,
//   Senegal, Norway, Egypt, Algeria, Scotland, Ivory Coast, Sweden, Turkey)
const PLAYERS = [
  { file: "mbappe.jpg",          name: "Kylian Mbappé",      nationality: "France"       },
  { file: "dembele.jpg",         name: "Ousmane Dembélé",    nationality: "France"       },
  { file: "olise.jpg",           name: "Michael Olise",      nationality: "France"       },
  { file: "kane.jpg",            name: "Harry Kane",         nationality: "England"      },
  { file: "saka.jpg",            name: "Bukayo Saka",        nationality: "England"      },
  { file: "yamal.jpg",           name: "Lamine Yamal",       nationality: "Spain"        },
  { file: "pedri.jpg",           name: "Pedri",              searchQuery: "Pedro González López", nationality: "Spain" },
  { file: "cubarsi.jpg",         name: "Pau Cubarsí",        nationality: "Spain"        },
  { file: "dejong.jpg",          name: "Frenkie de Jong",    nationality: "Netherlands"  },
  { file: "kimmich.jpg",         name: "Joshua Kimmich",     nationality: "Germany"      },
  { file: "musiala.jpg",         name: "Jamal Musiala",      nationality: "Germany"      },
  { file: "wirtz.jpg",           name: "Florian Wirtz",      nationality: "Germany"      },
  { file: "pulisic.jpg",         name: "Christian Pulisic",  nationality: "USA"          },
  { file: "davies.jpg",          name: "Alphonso Davies",    nationality: "Canada"       },
  { file: "messi.jpg",           name: "Lionel Messi",       searchQuery: "Lionel Andrés Messi Cuccittini", nationality: "Argentina" },
  { file: "alvarez.jpg",         name: "Julián Álvarez",     nationality: "Argentina"    },
  { file: "vinicius.jpg",        name: "Vinicius Junior",    nationality: "Brazil"       },
  { file: "raphinha.jpg",        name: "Raphinha",           nationality: "Brazil"       },
  { file: "marquinhos.jpg",      name: "Marquinhos",         nationality: "Brazil"       },
  { file: "mendes.jpg",          name: "Nuno Mendes",        nationality: "Portugal"     },
  { file: "bruno-fernandes.jpg", name: "Bruno Fernandes",    searchQuery: "Bruno Miguel Borges Fernandes", nationality: "Portugal" },
  { file: "ronaldo.jpg",         name: "Cristiano Ronaldo",  nationality: "Portugal"     },
  { file: "debruyne.jpg",        name: "Kevin De Bruyne",    nationality: "Belgium"      },
  { file: "doku.jpg",            name: "Jérémy Doku",        nationality: "Belgium"      },
  { file: "modric.jpg",          name: "Luka Modric",        nationality: "Croatia"      },
  { file: "hakimi.jpg",          name: "Achraf Hakimi",      nationality: "Morocco"      },
  { file: "diaz.jpg",            name: "Luis Díaz",          nationality: "Colombia"     },
  { file: "valverde.jpg",        name: "Federico Valverde",  nationality: "Uruguay"      },
  { file: "mane.jpg",            name: "Sadio Mané",         nationality: "Senegal"      },
  { file: "haaland.jpg",         name: "Erling Haaland",     nationality: "Norway"       },
  { file: "salah.jpg",           name: "Mohamed Salah",      nationality: "Egypt"        },
  { file: "mahrez.jpg",          name: "Riyad Mahrez",       nationality: "Algeria"      },
  { file: "mctominay.jpg",       name: "Scott McTominay",    nationality: "Scotland"     },
  { file: "diomande.jpg",        name: "Yan Diomandé"        /* nationality absente côté Sportmonks */ },
  { file: "isak.jpg",            name: "Alexander Isak",     nationality: "Sweden"       },
  { file: "yildiz.jpg",          name: "Kenan Yildiz",       nationality: "Turkey"       },
  { file: "martinez.jpg",        name: "Lautaro Martínez",   nationality: "Argentina"    },
];

async function searchPlayer(p) {
  const query = p.searchQuery || p.name;
  const url = `${API}/players/search/${encodeURIComponent(query)}?api_token=${TOKEN}&include=nationality`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} sur la recherche`);
  const json = await res.json();
  const results = Array.isArray(json.data) ? json.data : [];

  // 1) On écarte les résultats sans image ou avec placeholder
  let candidates = results.filter(
    (r) => r.image_path && !r.image_path.includes("placeholder")
  );

  // 2) Si une nationalité est précisée, on privilégie les joueurs qui matchent
  if (p.nationality) {
    const byNat = candidates.filter(
      (c) => c.nationality?.name === p.nationality
    );
    if (byNat.length > 0) candidates = byNat;
  }

  return candidates[0] || null;
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
    const player = await searchPlayer(p);
    if (!player) {
      console.warn(`✗ Pas trouvé : ${p.name}`);
      issues.push(`${p.name} — aucun candidat valide`);
      miss++;
      continue;
    }
    const dest = path.join(PHOTO_DIR, p.file);
    await downloadTo(player.image_path, dest);
    console.log(
      `✓ ${p.name.padEnd(28)} → ${p.file.padEnd(22)} (id=${player.id}, nat=${player.nationality?.name || "?"})`
    );
    ok++;
  } catch (e) {
    console.error(`✗ Erreur ${p.name} : ${e.message}`);
    issues.push(`${p.name} — ${e.message}`);
    fail++;
  }
  await new Promise((r) => setTimeout(r, 200));
}

console.log("\n" + "=".repeat(60));
console.log(`Bilan : ${ok} OK · ${miss} introuvable · ${fail} erreur`);
if (issues.length > 0) {
  console.log("\nÀ vérifier manuellement :");
  issues.forEach((i) => console.log("  - " + i));
}
