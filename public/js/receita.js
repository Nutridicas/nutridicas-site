// ===============================
// VARIÁVEL GLOBAL
// ===============================
let receitaSelecionada = null;

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);

  // ===============================
  // PREVIEW
  // ===============================
  if (params.get("preview") === "true") {

    const receita = JSON.parse(localStorage.getItem("previewReceita"));

    if (!receita) {
      mostrarErro("Preview não encontrado.");
      return;
    }

    receitaSelecionada = receita;
    renderizarReceita(receita, receita.versoes.at(-1).conteudo);
    return;
  }

  // ===============================
  // SLUG
  // ===============================
  const slug = params.get("slug");

  if (!slug) {
    mostrarErro("Receita não encontrada.");
    return;
  }

  try {

    const response = await fetch(`/receitas/${slug}`);

    if (!response.ok) {
      throw new Error("Receita não encontrada");
    }

    const receita = await response.json();

    receitaSelecionada = receita;

    const conteudo = receita.versoes.at(-1).conteudo;

    renderizarReceita(receita, conteudo);
    ativarListaCompras(receita, conteudo);
    aplicarPremium(receita, conteudo);

  } catch (erro) {
    console.error(erro);
    mostrarErro("Erro ao carregar receita.");
  }

});


// ===============================
// FUNÇÃO PRINCIPAL DE RENDER
// ===============================
function renderizarReceita(receita, conteudo) {

  document.title = receita.titulo + " | NutriDicas Online";

  document.getElementById("titulo").innerText = receita.titulo;

  // ===============================
  // IMAGEM
  // ===============================
  const img = document.getElementById("imagem");
  if (img && receita.imagem) {
    img.src = "/imagens/receitas/" + receita.imagem;
    img.alt = receita.titulo;
  }

  // ===============================
  // CAMPOS BÁSICOS
  // ===============================
  preencher("tempoPreparoReceita", conteudo.tempoPreparoReceita);
  preencher("tempoPreparoForno", conteudo.tempoPreparoForno);
  preencher("tempoPreparoTotal", conteudo.tempoPreparoTotal);
  preencher("rendimento", conteudo.rendimento);
  preencher("dificuldade", conteudo.dificuldade);
  preencher("custoMedio", conteudo.custoMedio);
  preencher("enviadaPor", conteudo.enviadaPor);

  // ===============================
  // AVALIAÇÃO E AUTOR
  // ===============================
  preencher("avaliacaoMedia", receita.avaliacoes?.media ?? "0");
  preencher("avaliacaoTotal", receita.avaliacoes?.total ?? "0");
  preencher("autorNome", receita.autor?.nome ?? "Não informado");

   document.getElementById("miseEnPlace").innerHTML =
      (conteudo.miseEnPlace || []).map(i => `<li>${i}</li>`).join("");

    document.getElementById("conservacao").innerHTML =
      (conteudo.conservacao || []).map(c => `<li>${c}</li>`).join("");

  // ===============================
  // INGREDIENTES
  // ===============================
  if (conteudo.ingredientes) {
    document.getElementById("ingredientes").innerHTML =
      conteudo.ingredientes.map(i => `<li>${i}</li>`).join("");
  }

  // ===============================
  // PREPARO
  // ===============================
  if (conteudo.preparo) {
    document.getElementById("preparo").innerHTML =
      conteudo.preparo.map(p => `<li>${p}</li>`).join("");
  }

  // ===============================
  // MEDIDAS
  // ===============================
  if (conteudo.medidas) {
    document.getElementById("medidas").innerHTML =
      conteudo.medidas.map(m => `<li>${m}</li>`).join("");
  }

  // ===============================
  // RECEITAS RELACIONADAS
  // ===============================
 const listaRelacionadas = document.getElementById("receitasRelacionadas");

if (receita.relacionadas && listaRelacionadas) {
  listaRelacionadas.innerHTML = "";

  receita.relacionadas.forEach(r => {
    const li = document.createElement("li");

    li.innerHTML = `
      <a href="receita.html?slug=${r.slug}">
        <img src="/imagens/receitas/${r.imagem}" 
             alt="${r.titulo}" 
             width="150"
             height="150">
        <p>${r.titulo}</p>
      </a>
    `;

    listaRelacionadas.appendChild(li);
  });
}

  // ===============================
  // BREADCRUMB
  // ===============================
  const breadcrumbs = document.getElementById("breadcrumbs");


    if (breadcrumbs) {
    breadcrumbs.innerHTML = 
        '<a href="index.html">Início</a> › ' +
        '<a href="receita.html?cat=' + receita.categoria + '">' +
        conteudo.categoria +
        '</a> › ' +
        "<span>" + receita.titulo + "</span>";

    }


  /*if (breadcrumbs) {
    breadcrumbs.innerHTML = `
      <a href="index.html">Início</a> >
      <a href="menu-tradicional.html">${receita.categoria || ""}</a> >
      <span>${receita.titulo}</span>
    `;
  }*/

  // ===============================
  // SISTEMA DE ESTRELAS
  // ===============================
  ativarEstrelas();
}


// ===============================
// SISTEMA DE AVALIAÇÃO
// ===============================
function ativarEstrelas() {

  const estrelas = document.querySelectorAll("#estrelas span");

  estrelas.forEach(estrela => {
    estrela.addEventListener("click", () => {
      const nota = parseInt(estrela.dataset.nota);

     
      alert(`Você avaliou com ${nota} estrelas!`);

      document.getElementById("avaliacaoMedia").textContent = nota;
    });
  });
}


// ===============================
// LISTA DE COMPRAS
// ===============================
function ativarListaCompras(receita, conteudo) {

  const btn = document.getElementById("btnListaCompras");
  if (!btn) return;

  btn.addEventListener("click", () => {

    const listaAtual = JSON.parse(localStorage.getItem("listaCompras")) || [];

    const novosItens = (conteudo.ingredientes || []).map(item => ({
      nome: item,
      categoria: "Outros"
    }));

    const listaAtualizada = [...listaAtual, ...novosItens];

    localStorage.setItem("listaCompras", JSON.stringify(listaAtualizada));
    localStorage.setItem("ultimaReceita", receita.titulo);

    window.location.href = "lista-compras.html";
  });
}


// ===============================
// PREMIUM
// ===============================
function aplicarPremium(receita, conteudo) {

 // if (!usuarioTemPremium()) {
//    bloquearSecao("secaoPremium");
 //   return;
//  }

  if (conteudo.nutricional) {
    preencher("porcao", conteudo.nutricional.porcao);
    preencher("calorias", conteudo.nutricional.calorias);
    preencher("carboidratos", conteudo.nutricional.carboidratos);
    preencher("proteinas", conteudo.nutricional.proteinas);
    preencher("gordurasTotais", conteudo.nutricional.gordurasTotais);
    preencher("gordurasSaturadas", conteudo.nutricional.gordurasSaturadas);
    preencher("fibras", conteudo.nutricional.fibras);
    preencher("sodio", conteudo.nutricional.sodio);
    preencher("acucar", conteudo.nutricional.acucar);
  }

 // SUBSTITUIÇÕES
  if (conteudo.substituicoes) {
    //preencher("substituicoes", conteudo.substituicoes);
  document.getElementById("substituicoes").innerHTML =
  conteudo.substituicoes.map(s => `<li>${s}</li>`).join("");
  }

  // DICAS
  if (conteudo.dicas) {
    document.getElementById("dicas").innerHTML =
      conteudo.dicas.map(d => `<li>${d}</li>`).join("");
  }

  // COMENTÁRIO NUTRI
  if (conteudo.comentarioNutri) {
    preencher("comentarioNutri", conteudo.comentarioNutri);
  }
}
// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function preencher(id, valor) {
  const el = document.getElementById(id);
  if (el) el.innerText = valor || "";
}

function usuarioTemPremium() {
  return localStorage.getItem("premium") === "true";
}

function bloquearSecao(id) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `
      <div class="bloqueado">
        🔒 Conteúdo Premium
        <br>
        <a href="planos.html">Assine para desbloquear</a>
      </div>
    `;
  }
}

function mostrarErro(msg) {
  document.querySelector("main").innerHTML = `<p>${msg}</p>`;
}