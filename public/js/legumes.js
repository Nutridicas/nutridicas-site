// criado em  20/05/2026 - painel de legumes.html

let bancoLegumes = {};
let paginaAtual = 1;
const itensPorPagina = 5;

// 1. Carrega o banco de dados de legumes do servidor
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/legumes");
    if (!response.ok) throw new Error("Erro ao ler dados de legumes");
    bancoLegumes = await response.json();
    
    inicializarBuscadorLegumes();
    inicializarPaginacaoLegumes(); // 🚀 Inicializa o novo motor de lista

    // Captura parâmetros da URL se vier externo
    const parametros = new URLSearchParams(window.location.search);
    const legumeParametro = parametros.get("nome");

    if (legumeParametro) {
      const legumeChaveOriginal = Object.keys(bancoLegumes).find(
        l => l.toLowerCase() === legumeParametro.toLowerCase()
      );

      if (legumeChaveOriginal) {
        document.getElementById("buscaLegume").value = legumeChaveOriginal;
        renderizarPainelLegume(legumeChaveOriginal);
      }
    }
  } catch (erro) {
    console.error("Erro na inicialização de legumes:", erro);
  }
});

// 2. Controla a barra de pesquisa inteligente por digitação
function inicializarBuscadorLegumes() {
  const input = document.getElementById("buscaLegume");
  const sugestoesBox = document.getElementById("sugestoesBusca");

  input.addEventListener("input", () => {
    const termo = input.value.trim().toLowerCase();
    sugestoesBox.innerHTML = "";

    // Se o usuário começar a digitar, fecha a caixinha da lista completa automática
    document.getElementById("containerPaginacao").style.display = "none";

    if (termo.length === 0) {
      sugestoesBox.style.display = "none";
      return;
    }

    const chavesEncontradas = Object.keys(bancoLegumes).filter(legume => 
      legume.toLowerCase().includes(termo)
    );

    if (chavesEncontradas.length === 0) {
      sugestoesBox.style.display = "none";
      return;
    }

    chavesEncontradas.forEach(legume => {
      const item = document.createElement("div");
      item.className = "sugestao-item";
      item.innerText = legume;
      
      item.addEventListener("click", () => {
        input.value = legume;
        sugestoesBox.style.display = "none";
        renderizarPainelLegume(legume);
      });
      
      sugestoesBox.appendChild(item);
    });

    sugestoesBox.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input) sugestoesBox.style.display = "none";
  });
}

// 🚀 3. NOVO: Mecanismo de Paginação de 5 em 5 itens
function inicializarPaginacaoLegumes() {
  const btnLista = document.getElementById("btnListaCompleta");
  const container = document.getElementById("containerPaginacao");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  // Ação do Botão Alternativo (Abre / Fecha a lista)
  btnLista.addEventListener("click", () => {
    if (container.style.display === "none") {
      container.style.display = "block";
      document.getElementById("buscaLegume").value = ""; // Limpa a barra
      paginaAtual = 1; // Reinicia na primeira página
      renderizarListaPaginada();
    } else {
      container.style.display = "none";
    }
  });

  // Botão Voltar Página
  btnPrev.addEventListener("click", () => {
    if (paginaAtual > 1) {
      paginaAtual--;
      renderizarListaPaginada();
    }
  });

  // Botão Avançar Página
  btnNext.addEventListener("click", () => {
    const totalItens = Object.keys(bancoLegumes).length;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderizarListaPaginada();
    }
  });
}

// 🚀 4. NOVO: Renderizador matemático dos botões da página ativa
function renderizarListaPaginada() {
  const listaContenedor = document.getElementById("listaItensPaginados");
  const infoPagina = document.getElementById("infoPagina");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  const arrayLegumes = Object.keys(bancoLegumes);
  const totalItens = arrayLegumes.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;

  // Garante que a página atual está nos limites corretos
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

  // Descobre matematicamente o índice de corte do array
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const itensDaPagina = arrayLegumes.slice(indiceInicio, indiceFim);

  // Limpa os botões antigos e renderiza os novos 5
  listaContenedor.innerHTML = "";
  itensDaPagina.forEach(legume => {
    const botao = document.createElement("button");
    botao.className = "btn-legume-item";
    botao.innerText = `🥕 ${legume}`;
    botao.addEventListener("click", () => {
      renderizarPainelLegume(legume);
    });
    listaContenedor.appendChild(botao);
  });

  // Atualiza o texto do rodapé (Ex: Página 1 de 3)
  infoPagina.innerText = `Página ${paginaAtual} de ${totalPaginas}`;

  // Liga ou desliga os botões de navegação para evitar cliques inválidos
  btnPrev.disabled = (paginaAtual === 1);
  btnNext.disabled = (paginaAtual === totalPaginas);
}

// 5. Alimenta o painel de informações do legume selecionado
// 5. Alimenta o painel de informações do legume selecionado de forma segura
function renderizarPainelLegume(nomeChave) {
  const legume = bancoLegumes[nomeChave];
  if (!legume) return;

  // 🛡️ Segurança anti-erros: Só altera os elementos se eles existirem na página
  const elEstadoVazio = document.getElementById("estadoVazio");
  const elPainelLegume = document.getElementById("painelLegume");
  
  if (elEstadoVazio) elEstadoVazio.style.display = "none";
  if (elPainelLegume) elPainelLegume.style.display = "block";

  const elNome = document.getElementById("legumeNome");
  const elCientifico = document.getElementById("legumeCientifico");
  if (elNome) elNome.innerText = nomeChave;
  if (elCientifico) elCientifico.innerText = `${legume.nomeCientifico || ""} • Família: ${legume.familia || ""}`;
  
  const varBox = document.getElementById("legumeVariedades");
  if (varBox) {
    if (legume.variedades && legume.variedades.length > 0) {
      varBox.parentElement.style.display = "block";
      varBox.innerText = legume.variedades.join(", ");
    } else {
      varBox.parentElement.style.display = "none";
    }
  }

  const elDesc = document.getElementById("legumeDescricao");
  if (elDesc) elDesc.innerHTML = (legume.descricao || []).map(p => `<p>${p}</p>`).join("");

  // Tabela Nutricional (Mapeamento Seguro dos IDs)
  const nut = legume.informacaoNutricional || {};
  const elPorcao = document.getElementById("nutriPorcao");
  const elCalorias = document.getElementById("nutriCalorias");
  const elCarbo = document.getElementById("nutriCarbo");
  const elProteina = document.getElementById("nutriProteina");
  const elGordura = document.getElementById("nutriGordura");
  const elFibra = document.getElementById("nutriFibra");

  if (elPorcao) elPorcao.innerText = nut.porcao || "100g";
  if (elCalorias) elCalorias.innerText = nut.calorias || "-";
  if (elCarbo) elCarbo.innerText = nut.carboidratos || "-";
  if (elProteina) elProteina.innerText = nut.proteinas || nut.protein || "-"; // Aceita ambas as chaves
  if (elGordura) elGordura.innerText = nut.gorduras || "-";
  if (elFibra) elFibra.innerText = nut.fibras || "-";

  // Listas de Benefícios, Contraindicações e Usos
  const elBeneficios = document.getElementById("legumeBeneficios");
  const elContra = document.getElementById("legumeContraindicacoes");
  const elComoUsar = document.getElementById("legumeComoUsar");
  const elConsumo = document.getElementById("legumeConsumo");

  if (elBeneficios) elBeneficios.innerHTML = (legume.beneficios || []).map(b => `<li>${b}</li>`).join("");
  if (elContra) elContra.innerHTML = (legume.contraindicacoes || []).map(c => `<li>${c}</li>`).join("");
  if (elComoUsar) elComoUsar.innerHTML = (legume.comoUsar || []).map(u => `<li>${u}</li>`).join("");
  if (elConsumo) elConsumo.innerHTML = (legume.consumoRecomendado || []).map(r => `<li>${r}</li>`).join("");

  // Vitaminas Ativas
  const elVitaminas = document.getElementById("legumeVitaminas");
  if (elVitaminas) {
    const vits = legume.compostos?.vitaminas || {};
    elVitaminas.innerHTML = Object.keys(vits)
      .filter(k => vits[k] && vits[k].length > 0)
      .map(k => `<li><strong>${k.toUpperCase()}:</strong> ${vits[k]}</li>`).join("");
  }

  // Sais Minerais Ativos
  const elMinerais = document.getElementById("legumeMinerais");
  if (elMinerais) {
    const mins = legume.compostos?.saisMinerais || {};
    elMinerais.innerHTML = Object.keys(mins)
      .filter(k => mins[k] && mins[k].length > 0)
      .map(k => `<li><strong>${k.toUpperCase()}:</strong> ${mins[k]}</li>`).join("");
  }

  // Sugestões de Receitas
  const receitasEl = document.getElementById("legumeReceitas");
  if (receitasEl && legume.sugestaoReceita) {
    receitasEl.innerHTML = legume.sugestaoReceita.map(rec => `
      <li style="margin-bottom: 12px; list-style: none;">
        <a href="receita.html?slug=${rec.slug}" style="color: #0891b2; font-weight: 600; text-decoration: none; display: block;">
          🍽️ ${rec.nome}
        </a>
        <span style="font-size: 11px; color: #6b7280;">Fonte: <a href="${rec.urlOrigem}" target="_blank" style="color: inherit;">${rec.credito}</a></span>
      </li>
    `).join("");
  }
}

