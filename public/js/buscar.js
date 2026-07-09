// ============================================
// 🔥 Página de Busca NutriDicas (buscar.html)
// Alterado 27/05/2026 
// 🔥 Alterado para fazer Integração Otimizada com BuscaWorker.js + Debounce
// ============================================

let buscaWorker = null;
let indiceDeBuscaString = null; // Agora salvaremos o índice como String criptografada/serializada

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function inicializarIndice() {
  try {
    const res = await fetch("/receitas-index");
    const receitas = await res.json();
    const indice = {};

    receitas.forEach(r => {
      // Força a validação do status para evitar dados nulos
      if (r.status !== "publicada") return;

      // Junta e normaliza no lado do cliente os termos chaves
      const textoCompleto = `
        ${r.titulo || ""} 
        ${r.categorias ? r.categorias.join(" ") : ""} 
        ${r.tags ? r.tags.join(" ") : ""} 
        ${r.ingredientes ? r.ingredientes.join(" ") : ""}
      `
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

      const palavras = textoCompleto.split(/\s+/);

      palavras.forEach(p => {
        const palavraLimpa = p.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        if (palavraLimpa.length < 2) return; 
        
        if (!indice[palavraLimpa]) indice[palavraLimpa] = [];
        
        indice[palavraLimpa].push({
          s: r.slug,
          titulo: r.titulo,
          imagem: r.imagem,
          premium: r.premium,
          categorias: r.categorias
        });
      });
    });

    // Converte em String para evitar falhas de clonagem estrutural do postMessage
    return JSON.stringify(indice);
  } catch (erro) {
    console.error("Erro ao montar o índice local:", erro);
    return "{}";
  }
}

function getQueryParam() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("q") || "").trim();
}

function renderResultados(lista, termo) {
  const container = document.getElementById("resultadosLista");
  if (!container) return;

  if (!termo || !termo.trim()) {
    container.innerHTML = "";
    return;
  }

  if (!lista || lista.length === 0) {
    container.innerHTML = `
      <p class="sem-resultado">Nenhuma receita encontrada para "<strong>${termo}</strong>" 😢</p>
    `;
    return;
  }

  container.innerHTML = lista.map(r => `
    <div class="card-receita" onclick="window.location.href='receita.html?slug=${r.s}'" style="cursor:pointer;">
      <img src="${r.imagem ? `/imagens/receitas/${r.imagem}` : `/imagens/placeholder.jpg`}" alt="${r.titulo}">
      <div class="card-info">
        <h3>
          ${r.titulo}
          ${r.premium ? `<span class="premium-badge">⭐ Premium</span>` : ""}
        </h3>
        <p>${r.categorias ? r.categorias.join(", ") : ""}</p>
      </div>
    </div>
  `).join("");
}

async function initBusca() {
  const inputBusca = document.getElementById("searchInput");
  const elementoTermo = document.getElementById("buscaTermo");
  const termoInicial = getQueryParam();

  // Instancia o Worker
  buscaWorker = new Worker("buscaworker.js");

  // Escuta o Worker retornar os dados filtrados
  buscaWorker.onmessage = function(e) {
    const filtrados = e.data; 
    const termoAtual = inputBusca ? inputBusca.value : termoInicial;
    renderResultados(filtrados, termoAtual);
  };

  // Carrega e transforma o índice em string uma única vez
  indiceDeBuscaString = await inicializarIndice();

  if (termoInicial && inputBusca) {
    inputBusca.value = termoInicial;
  }

  if (elementoTermo) {
    elementoTermo.innerHTML = `Você pesquisou por: <strong>${termoInicial || "nada"}</strong>`;
  }

  // Se veio termo da URL, dispara imediatamente
  if (termoInicial && indiceDeBuscaString !== "{}") {
    buscaWorker.postMessage({ indiceBuscaString: indiceDeBuscaString, termo: termoInicial });
  }

  // Configura a busca reativa ao digitar com Debounce de 300ms
  const dispararBuscaOtimizada = debounce((termo) => {
    if (buscaWorker && indiceDeBuscaString && termo.trim().length > 0) {
      buscaWorker.postMessage({ indiceBuscaString: indiceDeBuscaString, termo: termo });
    } else if (termo.trim().length === 0) {
      renderResultados([], ""); // Limpa a tela imediatamente se apagar tudo
    }
  }, 300);

  if (inputBusca) {
    inputBusca.addEventListener("input", (e) => {
      const novoTermo = e.target.value;
      if (elementoTermo) {
        elementoTermo.innerHTML = `Você pesquisou por: <strong>${novoTermo || "nada"}</strong>`;
      }
      dispararBuscaOtimizada(novoTermo);
    });

    inputBusca.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const primeiroCard = document.querySelector("#resultadosLista .card-receita");
        if (primeiroCard) {
          primeiroCard.click();
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initBusca);



