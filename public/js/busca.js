// ===============================================
// BUSCA NUTRIDICAS ULTRA RÁPIDA - Compatível Chrome/Edge/Firefox
// ===============================================

const sinonimos = {
  aipim: "mandioca",
  macaxeira: "mandioca",
  jerimum: "abobora",
  mexerica: "tangerina",
  bergamota: "tangerina",
  frango: "galinha",
  galinha: "frango"
};

let receitas = [];
let indice = {};
let palavras = [];

// =====================
// NORMALIZAR
// =====================
function normalizar(txt) {
  return (txt || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// =====================
// TOKENIZAR
// =====================
function tokenizar(txt) {
  return normalizar(txt)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(p => sinonimos[p] || p);
}

// =====================
// CARREGAR RECEITAS
// =====================
async function carregarReceitas() {
  if (receitas.length) return;

  try {
    const res = await fetch("/receitas-index.json"); // verifique se o JSON está em /api/receitas.json
    if (!res.ok) throw new Error("JSON não encontrado");
    receitas = await res.json();
    criarIndice();
  } catch (err) {
    console.error("Erro ao carregar receitas:", err);
  }
}

// =====================
// CRIAR INDICE
// =====================
function criarIndice() {
  indice = {};

  receitas.forEach(r => {
    const texto = `${r.t} ${r.c} ${r.i} ${r.g}`;
    const tokens = tokenizar(texto);
    tokens.forEach(p => {
      if (!indice[p]) indice[p] = new Set();
      indice[p].add(r);
    });
  });

  palavras = Object.keys(indice);
}

// =====================
// BUSCA
// =====================
function buscar(termo) {
  const tokens = tokenizar(termo);
  let resultados = [];

  tokens.forEach(t => {
    if (indice[t]) {
      resultados.push(...indice[t]);
    } else {
      const corr = corrigir(t);
      if (indice[corr]) resultados.push(...indice[corr]);
    }
  });

  const unicos = [...new Map(resultados.map(r => [r.s, r])).values()];
  return rankear(unicos, tokens);
}

// =====================
// RANKING
// =====================
function rankear(lista, tokens) {
  return lista
    .map(r => {
      let score = 0;
      const texto = normalizar(`${r.t} ${r.c} ${r.i} ${r.g}`);
      tokens.forEach(t => {
        if (texto.includes(t)) score++;
      });
      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

// =====================
// AUTOCOMPLETE
// =====================
function sugestoes(termo) {
  termo = normalizar(termo);
  return palavras.filter(p => p.startsWith(termo)).slice(0, 6);
}

// =====================
// CORREÇÃO DE DIGITAÇÃO
// =====================
function corrigir(t) {
  let melhor = t;
  let menor = 999;
  palavras.forEach(p => {
    const d = lev(t, p);
    if (d < menor && d <= 2) {
      menor = d;
      melhor = p;
    }
  });
  return melhor;
}

// =====================
// LEVENSHTEIN
// =====================
function lev(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] =
        b[i - 1] === a[j - 1]
          ? m[i - 1][j - 1]
          : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

// =====================
// EVENTO DO CAMPO DE BUSCA
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const campo = document.getElementById("searchInput");
  const resultados = document.getElementById("searchResults");

  campo.addEventListener("input", async e => {
    const termo = e.target.value;
    if (!termo) {
      resultados.innerHTML = "";
      return;
    }

    await carregarReceitas();
    const lista = buscar(termo);

    resultados.innerHTML = lista
      .slice(0, 10)
      .map(
        r => `<a href="receita.html?slug=${r.s}" class="resultado-item">${r.t}</a>`
      )
      .join("");
  });
});