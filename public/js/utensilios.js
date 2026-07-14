// ============================================================
// NutriDicas - Catálogo de Utensílios
// Sincronizado com o HTML atual
// ============================================================

let bancoUtensilios = [];

/**
 * Inicializa o catálogo após o carregamento do DOM.
 */

async function inicializarCatalogo() {
  try {
    const resposta = await fetch("/utensilios");

    if (!resposta.ok) {
      throw new Error(
        `Erro ao carregar utensílios: HTTP ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    // Aceita tanto um array direto quanto { utensilios: [...] }
    bancoUtensilios = Array.isArray(dados)
      ? dados
      : Array.isArray(dados.utensilios)
        ? dados.utensilios
        : [];

    if (bancoUtensilios.length === 0) {
      throw new Error("Nenhum utensílio foi encontrado.");
    }

    gerarMenuLateral();
    configurarBusca();

  } catch (erro) {
    console.error("Erro ao carregar o catálogo:", erro);

    const menu = document.getElementById("menuUtensilios");

    if (menu) {
      menu.innerHTML = `
        <li class="mensagem-erro">
          Não foi possível carregar o catálogo de utensílios.
        </li>
      `;
    }
  }
}


/**  * Cria dinamicamente o menu lateral.  */
function gerarMenuLateral() {
  const menu = document.getElementById("menuUtensilios");

  if (!menu) return;

  menu.innerHTML = "";

  bancoUtensilios.forEach((item) => {
    const li = document.createElement("li");
    li.id = `item-${item.id}`;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = `${item.emoji || "🍳"} ${item.nome || "Utensílio"}`;

    botao.addEventListener("click", () => {
      exibirFichaUtensilio(item.id);
    });

    li.appendChild(botao);
    menu.appendChild(li);
  });

  // Abre automaticamente o primeiro utensílio.
  exibirFichaUtensilio(bancoUtensilios[0].id);
}


/**  * Exibe os dados do utensílio selecionado.  */
function exibirFichaUtensilio(id) {
  const item = bancoUtensilios.find(
    (utensilio) => String(utensilio.id) === String(id)
  );

  if (!item) {
    console.warn(`Utensílio não encontrado: ${id}`);
    return;
  }

  atualizarItemAtivo(id);

  // ----------------------------------------------------------
  // Identidade
  // ----------------------------------------------------------

  definirTexto(
    "utensilio-emoji",
    item.emoji || "🍳"
  );

  definirTexto(
    "utensilio-nome",
    item.nome || "Utensílio"
  );

  definirTexto(
    "utensilio-categoria",
    item.subcategoria || item.categoria || "Utensílio de cozinha"
  );

  definirTexto(
    "utensilio-descricao",
    item.descricao || "Descrição não disponível."
  );


  // ----------------------------------------------------------
  // Vantagens e desvantagens
  // ----------------------------------------------------------

  preencherLista(
    "utensilio-vantagens",
    item.analise_vantagens || item.vantagens
  );

  preencherLista(
    "utensilio-desvantagens",
    item.analise_desvantagens || item.desvantagens
  );


  // ----------------------------------------------------------
  // Aplicabilidade culinária
  // ----------------------------------------------------------

  const culinaria = item.aplicabilidade_culinaria || {};

  preencherTextoOuLista(
    "utensilio-alimentos-sim",
    culinaria.alimentos_recomendados
  );

  preencherTextoOuLista(
    "utensilio-alimentos-nao",
    culinaria.alimentos_nao_recomendados
  );

// ----------------------------------------------------------
// Características- 12/07/2026
// ----------------------------------------------------------

preencherMateriais(item.materiais_disponiveis);

preencherModelos(item.tipos_modelos);

preencherCapacidades(item.capacidades_e_uso);

preencherCompatibilidade(item.compatibilidade_fogao);

  // ----------------------------------------------------------
  // Manual de uso seguro
  // ----------------------------------------------------------

  const manual = item.manual_uso_seguro || {};

  definirTexto(
    "utensilio-limites",
    obterLimitesDeUso(manual)
  );

  preencherLista(
    "utensilio-passos",
    manual.passo_a_passo
  );

  preencherLista(
    "utensilio-erros",
    item.erros_criticos_comuns
  );


  // ----------------------------------------------------------
  // Manutenção
  // ----------------------------------------------------------

  const manutencao = item.manutencao_e_conservacao || {};

  definirTexto(
    "utensilio-limpeza",
    manutencao.rotina_limpeza ||
    manutencao.limpeza ||
    "Consulte as orientações do fabricante."
  );

  preencherDicas(
    "utensilio-dicas-expert",
    item.dicas_especialistas
  );

  // ----------------------------------------------------------
  // Contexto histórico
  // ----------------------------------------------------------

  const historico = item.contexto_historico || {};

  definirTexto(
    "utensilio-ano",
    historico.ano_invencao || "data desconhecida"
  );

  definirTexto(
    "utensilio-inventor",
    historico.inventor || "autoria desconhecida"
  );

  definirTexto(
    "utensilio-nome-original",
    historico.nome_original || "não informado"
  );

preencherLista(
    "utensilio-historico-detalhes",
    historico.detalhe
);

  // ----------------------------------------------------------
  // SEO dinâmico
  // ----------------------------------------------------------

  atualizarSEO(item);

  // ----------------------------------------------------------
  // Exibe a ficha
  // ----------------------------------------------------------

  const ficha = document.getElementById("fichaUtensilio");

  if (ficha) {
    ficha.style.display = "block";
  }

  mudarAba("visao-geral");
}



/**  * Marca visualmente o utensílio ativo no menu.  */

function atualizarItemAtivo(id) {
  document
    .querySelectorAll(".lista-utensilios-sidebar li")
    .forEach((li) => li.classList.remove("ativo"));

  const itemAtivo = document.getElementById(`item-${id}`);

  if (itemAtivo) {
    itemAtivo.classList.add("ativo");
  }
}


/**  * Controla as abas internas.  *
 * Esta função usa o mesmo nome chamado pelo HTML:
 * onclick="mudarAba(...)"  */

function mudarAba(abaId) {
  document
    .querySelectorAll(".conteudo-secao")
    .forEach((secao) => {
      secao.classList.add("escondido");
    });

  document
    .querySelectorAll(".tab-botao")
    .forEach((botao) => {
      botao.classList.remove("ativa");
    });

  const secaoAtiva = document.getElementById(`aba-${abaId}`);
  const botaoAtivo = document.getElementById(`btn-${abaId}`);

  if (secaoAtiva) {
    secaoAtiva.classList.remove("escondido");
  }

  if (botaoAtivo) {
    botaoAtivo.classList.add("ativa");
  }
}


/**  * Define texto com segurança.  */

function definirTexto(id, valor) {

  const elemento = document.getElementById(id);

  if (!elemento) return;

  elemento.textContent =
    valor !== undefined &&
    valor !== null &&
    valor !== ""
      ? valor
      : "Não informado.";
}

/**  * Preenche UL ou OL com segurança.  */

function preencherLista(id, itens) {
  const elemento = document.getElementById(id);

  if (!elemento) return;

  elemento.innerHTML = "";

  const lista = normalizarArray(itens);

  if (lista.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Não informado.";
    elemento.appendChild(li);
    return;
  }

  lista.forEach((item) => {
    const li = document.createElement("li");

    li.textContent =
      typeof item === "object"
        ? item.nome ||
          item.descricao ||
          JSON.stringify(item)
        : String(item);

    elemento.appendChild(li);
  });
}


/**  * Preenche um elemento <p> com dados que podem vir
 * como texto ou array.  */

function preencherTextoOuLista(id, dados) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    const lista = normalizarArray(dados);

    elemento.style.whiteSpace = "pre-line";
    elemento.textContent = lista.length
        ? lista.map(item => `• ${item}`).join("\n")
        : "Não informado.";
}


/**  * Exibe as dicas dos especialistas.  */

function preencherDicas(id, dicas) {
  const elemento = document.getElementById(id);

  if (!elemento) return;

  elemento.innerHTML = "";

  const lista = normalizarArray(dicas);

  if (lista.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Nenhuma dica cadastrada.";
    elemento.appendChild(p);
    return;
  }

  lista.forEach((dica) => {
    const p = document.createElement("p");
    p.textContent = `💡 ${dica}`;
    elemento.appendChild(p);
  });
}

// Preencher os materiais do utensílio - 12/07/2026 
function preencherMateriais(lista) {
    const container = document.getElementById("utensilio-materiais");
    if (!container) return;

    container.innerHTML = "";

    lista = normalizarArray(lista);

    if (!lista.length) {
        container.textContent = "Não informado.";
        return;
    }

    lista.forEach(material => {
        const card = document.createElement("article");
        card.className = "card-tecnico";

        card.innerHTML = `
            <h4>${material.tipo}</h4>
            <p>${material.caracteristicas}</p>
        `;

        container.appendChild(card);
    });
}

// Preencher os modelos do utensílio - 12/07/2026 

function preencherModelos(lista) {
    const container = document.getElementById("utensilio-modelos");
    if (!container) return;

    container.innerHTML = "";

    lista = normalizarArray(lista);

    if (!lista.length) {
        container.textContent = "Não informado.";
        return;
    }

    lista.forEach(modelo => {
        const card = document.createElement("article");
        card.className = "card-tecnico";

        card.innerHTML = `
            <h4>${modelo.nome}</h4>
            <p>${modelo.descricao}</p>
        `;

        container.appendChild(card);
    });
}

// Preencher as capacidades - 12/07/2026 
function preencherCapacidades(lista) {
    const ul = document.getElementById("utensilio-capacidades");
    if (!ul) return;

    ul.innerHTML = "";

    lista = normalizarArray(lista);

    if (!lista.length) {
        ul.innerHTML = "<li>Não informado.</li>";
        return;
    }

    lista.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item.tamanho}</strong> — ${item.indicacao}`;
        ul.appendChild(li);
    });
}

// Preencher as compatibilidades - 12/07/2026 
function preencherCompatibilidade(comp) {

    comp = comp || {};

    definirTexto("fogao-gas", comp.gas);

    definirTexto("fogao-inducao", comp.inducao);

    definirTexto("fogao-vitroceramico", comp.vitroceramico);

    definirTexto("fogao-eletrico", comp.eletrico);
}

/**  * Converte valores variados em array.  */

function normalizarArray(valor) {
  if (Array.isArray(valor)) {
    return valor.filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== ""
    );
  }

  if (
    valor !== undefined &&
    valor !== null &&
    valor !== ""
  ) {
    return [valor];
  }

  return [];
}


/**
 * Monta o texto dos limites de uso.
 */
function obterLimitesDeUso(manual) {
  if (!manual) {
    return "Consulte o manual do fabricante.";
  }

  // Caso o JSON já tenha um texto direto.
  if (typeof manual.limites === "string") {
    return manual.limites;
  }

  if (typeof manual.limite_uso === "string") {
    return manual.limite_uso;
  }

  const limite = manual.limite_preenchimento;

  if (!limite) {
    return "Consulte o manual do fabricante.";
  }

  // Caso seja apenas texto.
  if (typeof limite === "string") {
    return limite;
  }

  // Caso seja objeto.
  const partes = [];

  if (limite.alimentos_comuns) {
    partes.push(
      `Alimentos comuns: ${limite.alimentos_comuns}`
    );
  }

  if (limite.alimentos_que_espumam) {
    partes.push(
      `Alimentos que espumam: ${limite.alimentos_que_espumam}`
    );
  }

  return partes.length > 0
    ? partes.join(" | ")
    : "Consulte o manual do fabricante.";
}


/**
 * Atualiza título e metadados da página.
 */
function atualizarSEO(item) {
  const nome = item.nome || "Utensílio de Cozinha";

  const descricao =
    item.descricao ||
    `Conheça tudo sobre ${nome}: uso, vantagens e manutenção.`;

  document.title = `${nome} | NutriDicas`;

  const metaDescription =
    document.getElementById("metaDescription");

  const ogTitle =
    document.getElementById("ogTitle");

  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      descricao.slice(0, 160)
    );
  }

  if (ogTitle) {
    ogTitle.setAttribute(
      "content",
      `${nome} | NutriDicas`
    );
  }
}


// ============================================================
// Inicialização
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  inicializarCatalogo
);

// Função para a busca dos utensílios -criada 13/07/2026 

function configurarBusca(){

    const campo = document.getElementById("buscaUtensilio");

    campo.addEventListener("input", function(){
        const termo = this.value.toLowerCase();

        document.querySelectorAll("#menuUtensilios li").forEach(li=>{
            const texto = li.innerText.toLowerCase();

            li.style.display =
                texto.includes(termo)
                ? ""
                : "none";
        });

    });

}