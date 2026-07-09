// para a página frutas.html - criado em 19/05/2026 

function gerarSlug(texto){
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^\w\s-]/g,"")
    .replace(/\s+/g,"-");
}

let bancoFrutas = {};
let paginaAtual = 1;
const itensPorPagina = 5;

// 1. Carrega o banco de dados de frutas do servidor
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Alinhado com a rota configurada no Express /frutas
    const response = await fetch("/frutas");
    if (!response.ok) throw new Error("Erro ao ler dados de frutas");
    bancoFrutas = await response.json();
    
    inicializarBuscadorFrutas();
    inicializarPaginacaoFrutas(); // 🚀 Ativa o controle matemático de páginas

    // Captura parâmetros se o usuário for redirecionado via url externa
    const parametros = new URLSearchParams(window.location.search);
    const frutaParametro = parametros.get("nome");

    if (frutaParametro) {
      const frutaChaveOriginal = Object.keys(bancoFrutas).find(
        f => f.toLowerCase() === frutaParametro.toLowerCase()
      );

      if (frutaChaveOriginal) {
        const elBusca = document.getElementById("buscaFruta");
        if (elBusca) elBusca.value = frutaChaveOriginal;
        renderizarPainelFruta(frutaChaveOriginal);
      }
    }
  } catch (erro) {
    console.error("Erro na inicialização de frutas:", erro);
  }
});

// 2. Controla a barra de pesquisa preditiva tradicional
function inicializarBuscadorFrutas() {
  const input = document.getElementById("buscaFruta");
  const sugestoesBox = document.getElementById("sugestoesBusca");
  if (!input || !sugestoesBox) return;

  input.addEventListener("input", () => {
    const termo = input.value.trim().toLowerCase();
    sugestoesBox.innerHTML = "";

    // Oculta a listagem dinâmica caso o usuário decida digitar
    const elPaginacao = document.getElementById("containerPaginacao");
    if (elPaginacao) elPaginacao.style.display = "none";

    if (termo.length === 0) {
      sugestoesBox.style.display = "none";
      return;
    }

    const chavesEncontradas = Object.keys(bancoFrutas).filter(fruta => 
      fruta.toLowerCase().includes(termo)
    );

    if (chavesEncontradas.length === 0) {
      sugestoesBox.style.display = "none";
      return;
    }

    chavesEncontradas.forEach(fruta => {
      const item = document.createElement("div");
      item.className = "sugestao-item";
      item.innerText = fruta;
      
      item.addEventListener("click", () => {
        input.value = fruta;
        sugestoesBox.style.display = "none";
        renderizarPainelFruta(fruta);
      });
      
      sugestoesBox.appendChild(item);
    });

    sugestoesBox.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input) sugestoesBox.style.display = "none";
  });
}

// 🚀 3. NOVO: Gerenciador de cliques e estados da paginação
function inicializarPaginacaoFrutas() {
  const btnLista = document.getElementById("btnListaCompleta");
  const container = document.getElementById("containerPaginacao");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const inputBusca = document.getElementById("buscaFruta");

  if (!btnLista || !container || !btnPrev || !btnNext) return;

  btnLista.addEventListener("click", () => {
    if (container.style.display === "none") {
      container.style.display = "block";
      if (inputBusca) inputBusca.value = ""; 
      paginaAtual = 1; 
      renderizarListaPaginadaFrutas();
    } else {
      container.style.display = "none";
    }
  });

  btnPrev.addEventListener("click", () => {
    if (paginaAtual > 1) {
      paginaAtual--;
      renderizarListaPaginadaFrutas();
    }
  });

  btnNext.addEventListener("click", () => {
    const totalItens = Object.keys(bancoFrutas).length;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderizarListaPaginadaFrutas();
    }
  });
}

// 🚀 4. NOVO: Fatiador dinâmico do array de chaves do JSON de frutas
function renderizarListaPaginadaFrutas() {
  const listaContenedor = document.getElementById("listaItensPaginados");
  const infoPagina = document.getElementById("infoPagina");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  if (!listaContenedor || !infoPagina || !btnPrev || !btnNext) return;

  const arrayFrutas = Object.keys(bancoFrutas);
  const totalItens = arrayFrutas.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;

  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

  // Cálculo dos limites do índice da página atual
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const itensDaPagina = arrayFrutas.slice(indiceInicio, indiceFim);

  listaContenedor.innerHTML = "";
  itensDaPagina.forEach(fruta => {
    const botao = document.createElement("button");
    botao.className = "btn-fruta-item";
    botao.innerText = `🍓 ${fruta}`;
    botao.addEventListener("click", () => {
      renderizarPainelFruta(fruta);
    });
    listaContenedor.appendChild(botao);
  });

  infoPagina.innerText = `Página ${paginaAtual} de ${totalPaginas}`;

  btnPrev.disabled = (paginaAtual === 1);
  btnNext.disabled = (paginaAtual === totalPaginas);
}

// 5. Injeta de forma defensiva os dados no painel visual
function renderizarPainelFruta(nomeChave) {
  const fruta = bancoFrutas[nomeChave];
  if (!fruta) return;

  const elEstadoVazio = document.getElementById("estadoVazio");
  const elPainelFruta = document.getElementById("painelFruta");
  
  if (elEstadoVazio) elEstadoVazio.style.display = "none";
  if (elPainelFruta) elPainelFruta.style.display = "block";

  // Identidade Textual e Imagens
  const elNome = document.getElementById("frutaNome");
  const elCientifico = document.getElementById("frutaCientifico");
  const elImg = document.getElementById("frutaImagem");

  if (elNome) elNome.innerText = nomeChave;
  if (elCientifico) elCientifico.innerText = `${fruta.nomeCientifico || ""} • Família: ${fruta.familia || ""}`;
  
  if (elImg) {
    if (fruta.imagem && fruta.imagem.trim() !== "") {
      elImg.src = fruta.imagem;
      elImg.style.display = "block";
    } else {
      elImg.style.display = "none";
    }
  }

  const elDesc = document.getElementById("frutaDescricao");
  if (elDesc) elDesc.innerHTML = (fruta.descricao || []).map(p => `<p>${p}</p>`).join("");

  // Tabela Nutricional
  const nut = fruta.informacaoNutricional || {};
  const elPorcao = document.getElementById("nutriPorcao");
  const elCalorias = document.getElementById("nutriCalorias");
  const elCarbo = document.getElementById("nutriCarbo");
  const elProteina = document.getElementById("nutriProteina");
  const elGordura = document.getElementById("nutriGordura");
  const elFibra = document.getElementById("nutriFibra");

  if (elPorcao) elPorcao.innerText = nut.porcao || "100g";
  if (elCalorias) elCalorias.innerText = nut.calorias || "-";
  if (elCarbo) elCarbo.innerText = nut.carboidratos || "-";
  if (elProteina) elProteina.innerText = nut.proteinas || nut.protein || "-";
  if (elGordura) elGordura.innerText = nut.gorduras || "-";
  if (elFibra) elFibra.innerText = nut.fibras || "-";

  // Listagens de propriedades
  const elBeneficios = document.getElementById("frutaBeneficios");
  const elContra = document.getElementById("frutaContraindicacoes");
  const elComoUsar = document.getElementById("frutaComoUsar");
  const elConsumo = document.getElementById("frutaConsumo");

  if (elBeneficios) elBeneficios.innerHTML = (fruta.beneficios || []).map(b => `<li>${b}</li>`).join("");
  if (elContra) elContra.innerHTML = (fruta.contraindicacoes || []).map(c => `<li>${c}</li>`).join("");
  if (elComoUsar) elComoUsar.innerHTML = (fruta.comoUsar || []).map(u => `<li>${u}</li>`).join("");
  if (elConsumo) elConsumo.innerHTML = (fruta.consumoRecomendado || []).map(r => `<li>${r}</li>`).join("");

  // Vitaminas
  const elVitaminas = document.getElementById("frutaVitaminas");
  if (elVitaminas) {
    const vits = fruta.compostos?.vitaminas || {};
    elVitaminas.innerHTML = Object.keys(vits)
      .filter(k => vits[k] && vits[k].length > 0)
      .map(k => `<li><strong>${k.toUpperCase()}:</strong> ${vits[k]}</li>`).join("");
  }

  // Sais Minerais
  const elMinerais = document.getElementById("frutaMinerais");
  if (elMinerais) {
    const mins = fruta.compostos?.saisMinerais || {};
    elMinerais.innerHTML = Object.keys(mins)
      .filter(k => mins[k] && mins[k].length > 0)
      .map(k => `<li><strong>${k.toUpperCase()}:</strong> ${mins[k]}</li>`).join("");
  }

  // Receitas Integradas
  const receitasEl = document.getElementById("frutaReceitas");
  if (receitasEl && fruta.sugestaoReceita) {
    receitasEl.innerHTML = fruta.sugestaoReceita.map(rec => `
      <li style="margin-bottom: 12px; list-style: none;">
        <a href="receita.html?slug=${rec.slug}" style="color: #0891b2; font-weight: 600; text-decoration: none; display: block;">
          🍰 ${rec.nome}
        </a>
        <span style="font-size: 11px; color: #6b7280;">Fonte: <a href="${rec.urlOrigem || '#'}" target="_blank" style="color: inherit;">${rec.credito || 'NutriDicas'}</a></span>
      </li>
    `).join("");
  }
}
