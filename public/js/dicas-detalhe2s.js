// dicas detalhadas para dicas.html - 17/04/2026

const imagensDicas = {
  cenoura: "imagens/dicas/cenoura.jpg",
  alface: "imagens/dicas/alface.jpg",
  peixe: "imagens/dicas/peixe.jpg",
  frigideira: "imagens/dicas/frigideira.jpg",

  legumes: "imagens/dicas/legumes.jpg",
  verduras: "imagens/dicas/alface.jpg",
  utensilios: "imagens/dicas/utensilios.jpg",

  default: "imagens/dicas/default.jpg"
};

const perguntasUsadas = new Set();

function getImagemDica(dica) {

  // prioridade 1: tipo (mais específico)
  if (dica.tipo && imagensDicas[dica.tipo.toLowerCase()]) {
    return imagensDicas[dica.tipo.toLowerCase()];
  }

  // prioridade 2: categoria
  if (dica.categoria && imagensDicas[dica.categoria.toLowerCase()]) {
    return imagensDicas[dica.categoria.toLowerCase()];
  }

  // fallback
  return imagensDicas.default;
}
const { id, slug } = getParamsFromURL();

const isPaginaDicas = document.getElementById('lista-dicas-completas');

if (isPaginaDicas) {
  if (id || slug) {
    carregarDica(id);
  } else {
    carregarLista();
  }
}

function getParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
    slug: params.get("slug")
  };
}

async function carregarDica(id) {

  const responseRapidas = await fetch('/dicas-rapidas');
  const dataRapidas = await responseRapidas.json();

  const response = await fetch('/dicas');
  const data = await response.json();
 
  let dica = null;

  if (id) {
    dica = data.dicas.find(d => d.id === id);
  }


  if (!dica && slug) {
    dica = data.dicas.find(d => d.slug === slug);
  }

  // 🔥 MIGRAÇÃO AUTOMÁTICA - 02/05/2026
  dica = migrarEstrutura(dica);

  console.log(dica);

  if (!dica) {
    document.body.innerHTML = "<h1>Dica não encontrada</h1>";
    return;
  }

  if (dica && slug !== dica.slug) {
    window.history.replaceState(
      null,
      "",
      `/dicas.html?id=${dica.id}&slug=${dica.slug}`
    );
  }

// esconder só a lista geral (se existir) - inserida  23/04/2026
const lista = document.getElementById('lista-dicas-completas');
const tituloLista = document.getElementById('titulo-lista');

if (lista) lista.style.display = "grid";
if (tituloLista) tituloLista.style.display = "block";

  document.getElementById('titulo').innerText =
  `${dica.subcategoria} - ${dica.tema}
  Assunto: ${dica.categoria}
  ${dica.nome}`;

  const containerDicas = document.getElementById('conteudo');
  containerDicas.innerHTML = "";

  //  Mudar oara exibir nova estrutura de dicas.json - 02/05/2026
  dica.secoes.forEach(secao => {

  // LISTAS
  if (secao.tipo === "lista") {

    criarLista(
      secao.titulo,
      secao.conteudo,
      secao.imagem
    );
  }

  // OBJETOS
  if (secao.tipo === "objetos") {

    criarListaObjetos(
      secao.titulo,
      secao.conteudo
    );
  }

});
  // 🔥 GERAR DICAS RELACIONADAS DINÂMICAS - 23/04/2026
  const relacionadas = gerarRelacionadas(data.dicas, dica);
  renderRelacionadas(relacionadas);

} // ✅ FECHOU A FUNÇÃO AQUI

// Modificada 01/05/2026 para exibir imagens ao lado do textoà direita

function criarLista(titulo, itens, imagem = null) {

  const container = document.getElementById('conteudo');

  const section = document.createElement("section");
  section.classList.add("bloco-dica");

  // 🔥 TÍTULO FORA DO TEXTO
  const h2 = document.createElement("h2");
  h2.innerText = titulo;

  section.appendChild(h2);

  // 🔥 BLOCO DO TEXTO
  const texto = document.createElement("div");
  texto.classList.add("texto-fluido");

  // 🔥 IMAGEM FLUTUANDO
  if (imagem) {
    const img = document.createElement("img");

    img.src = imagem.startsWith("/")
      ? imagem
      : "/imagens/dicas/" + imagem;
    img.alt = titulo;
    img.classList.add("imagem-flutuante");
    texto.appendChild(img);
  }

  // 🔥 LISTA
  const ul = document.createElement("ul");
  itens.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = item;
    ul.appendChild(li);
  });

  texto.appendChild(ul);
  section.appendChild(texto);
  container.appendChild(section);
}

// Criar lista de objeto para mostrar os métodos dicas.json
// Modificada 30/04/2026 - Exibir imagens de cortes
//===================================
function criarListaObjetos(titulo, itens) {

  const container = document.getElementById('conteudo');

  const section = document.createElement("div");
  section.classList.add("bloco-dica");

  const conteudo = document.createElement("div");
  conteudo.classList.add("conteudo-texto");

  const h2 = document.createElement("h2");
  h2.innerText = titulo;

  const ul = document.createElement("ul");

  itens.forEach(item => {

    const li = document.createElement("li");
    li.classList.add("item-lista");

    const wrapper = document.createElement("div");
    wrapper.classList.add("item-com-imagem");

    // 📝 texto
    const texto = document.createElement("div");
    texto.classList.add("texto-item");

    texto.innerHTML = `
      <strong>${item.nome}</strong><br>
      ${item.tempo ? `<em>${item.tempo}</em><br>` : ""}
      ${item.descricao}
    `;

    // 📸 imagem
    if (item.imagem) {
      const img = document.createElement("img");
      img.src = "imagens/dicas/" + item.imagem;
      img.alt = item.nome;
      img.classList.add("imagem-dica-item");

     img.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModalImagem(img.src, item.nome);
    });

    wrapper.appendChild(img);

    }

    wrapper.appendChild(texto);
    li.appendChild(wrapper);
    ul.appendChild(li);
  });

  conteudo.appendChild(h2);
  conteudo.appendChild(ul);
  section.appendChild(conteudo);
  container.appendChild(section);
}

// função carregar lista 14/04/2026
  async function carregarLista() {

  const containerDicas = document.getElementById('lista-dicas-completas');

  // 👇 ESSENCIAL
  if (!containerDicas) return;

  const response = await fetch('/dicas');
  const data = await response.json();
  

  containerDicas.innerHTML = "";

  data.dicas.forEach(dica => {
    const div = document.createElement('div');

    div.innerHTML = `
      <h2>${dica.nome}</h2>
      <p>${dica.resumo || ''}</p>
      <a href="/dicas.html?id=${dica.id}&slug=${dica.slug}">Ver dica</a>
      <hr>
    `;

    containerDicas.appendChild(div);
  });

  // esconder detalhe (com proteção também)
  const titulo = document.getElementById('titulo');
  const conteudo = document.getElementById('conteudo');

  if (titulo) titulo.style.display = "none";
  if (conteudo) conteudo.style.display = "none";
}

//=================
function aplicarDicasNoPreparo(preparo, dicas) {

  return preparo.map(passo => {

    let usado = new Set();

    dicas.forEach(dica => {
      const palavra = dica.tipo.toLowerCase();
      if (usado.has(palavra)) return;

      const regex = new RegExp(`\\b(${palavra})\\b`, 'gi');

      if (regex.test(passo)) {

        passo = passo.replace(regex, `
          <span class="tooltip-dica" data-dica="${dica.texto}">
            $1
          </span>
        `);

        usado.add(palavra);
      }

    });

    return passo;
  });
}

// Criar imagem - inserida 17/04/2026

function getImagemPorTipo(tipo) {
  const imagens = {
    preparo: "imagens/dicas/preparo.jpg",
    reaproveitamento: "imagens/dicas/reaproveitamento.jpg",
    dicas: "imagens/dicas/dicas.jpg",
    cortes: "imagens/dicas/cortes.jpg",
    cozimento: "imagens/dicas/cozimento.jpg"
  };

  return imagens[tipo] || "imagens/dicas/default.jpg";
}

// 1. Seus dados (Exemplo)
const dicasRelacionadas = [
    { id: 1, titulo: "Arroz Soltinho", descricaoCurta: "Truques para nunca mais errar o ponto." },
    { id: 2, titulo: "Feijão Caldoso", descricaoCurta: "Como engrossar o caldo naturalmente." },
    { id: 3, titulo: "Legumes no Vapor", descricaoCurta: "Mantenha a cor e os nutrientes." }
];

// 2. A função que você já tem (O Molde)
function renderizarCard(dica) {
    return `
        <div class="dica-card-item">
            <span class="badge-dica">Cozinha Prática</span>
            <h3>${dica.titulo}</h3>
            <p>${dica.descricaoCurta}</p>
            <a href="dicas.html?id=${dica.id}&slug=${dica.slug}" class="btn-detalhes">
            Saiba mais → </a>
        </div>
    `;
}

// 3. A FUNÇÃO QUE FAZ A MÁGICA (Coloque esta logo abaixo das outras)
function carregarDicasRelacionadas() {
    const container = document.getElementById('lista-dicas-completas');
    
    if (container) {
        // Limpa o conteúdo atual
        container.innerHTML = "";
        
        // Percorre o array e adiciona cada card ao HTML
        dicasRelacionadas.forEach(dica => {
            container.innerHTML += renderizarCard(dica);
        });
    }
}

// 4. Executar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarDicasRelacionadas();
    // Outras funções de carregar o texto principal (Arroz) devem estar aqui
});


// Função para filtrar os cards dinamicamente - 22/04/2026
  function configurarFiltro() {
      const inputBusca = document.getElementById('searchInput');
      
      // Usamos 'keyup' para garantir que pegamos o texto após a tecla subir
      inputBusca.addEventListener('keyup', () => {
      const termo = inputBusca.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.dica-card-item');
      let encontrouQualquer = false;

      cards.forEach(card => {
          const titulo = card.querySelector('h3').textContent.toLowerCase();
          const descricao = card.querySelector('p').textContent.toLowerCase();

          if (titulo.includes(termo) || descricao.includes(termo)) {
              card.style.setProperty('display', 'flex', 'important');
              setTimeout(() => card.style.opacity = "1", 10);
              encontrouQualquer = true;
          } else {
              card.style.opacity = "0";
              setTimeout(() => card.style.setProperty('display', 'none', 'important'), 300);
          }
      });

      aviso.style.display = encontrouQualquer ? 'none' : 'block';
  });
  }

// Função para listar as dicas relacionadas - inserida 23/04/2026
function gerarRelacionadas(dicas, atual) {

  let relacionadas = dicas.filter(d => 
      d.slug !== atual.slug && (
      d.tema === atual.tema ||
      d.subcategoria === atual.subcategoria ||
      d.categoria === atual.categoria ||
      d.tags?.some(tag => atual.tags?.includes(tag))
    )
  );

  return relacionadas.slice(0, 3);
}

// =====================
//Função para renderizar as dicas relacionadas - inserida 23/04/2026
function renderRelacionadas(lista) {

  const container = document.getElementById('lista-dicas-completas');
  if (!container) return;

  container.innerHTML = "";

  lista.forEach(dica => {

    const card = document.createElement("div");
    card.classList.add("dica-card-item"); // 🔥 ESSENCIAL

    card.innerHTML = `
      <span class="badge-dica">${dica.tema}</span>

      <h3>${dica.nome}</h3>

      <p>${dica.resumo}</p>

      <a href="/dicas.html?id=${dica.id}&slug=${dica.slug}" 
         class="btn-detalhes">
         Veja mais detalhes →
      </a>
    `;

    container.appendChild(card);
  });
}
// Modal para dar zoom na imagem dos cortes - 01/05/2026 

function abrirModalImagem(src, titulo) {

  let modal = document.getElementById("modal-imagem");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-imagem";
    modal.innerHTML = `
      <div class="modal-box">

        <span class="fechar-modal">&times;</span>

        <img class="modal-conteudo">

        <p class="modal-titulo"></p>

      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".fechar-modal")
      .addEventListener("click", () => {
        modal.style.display = "none";
      });
    modal.addEventListener("click", (e) => {

      if (e.target.id === "modal-imagem") {
        modal.style.display = "none";
      }
    });
  }

  modal.style.display = "flex";
  modal.querySelector("img").src = src;
  modal.querySelector(".modal-titulo").innerText = titulo;
}

// Função para migrar a estrutura do dicas.json - inserida 02/05/2026
function migrarEstrutura(dica) {

  const secoes = [];

  // =====================
  // PREPARO
  // =====================

  if (dica.conteudo?.preparo?.length) {

    secoes.push({
      id: "preparo",
      titulo: "🥕 Preparo",
      tipo: "lista",
      layout: "imagem-direita",
      imagem: dica.conteudo.imagem_preparo || null,
      conteudo: dica.conteudo.preparo
    });
  }

  // =====================
  // REAPROVEITAMENTO
  // =====================

  if (dica.conteudo?.reaproveitamento?.length) {

    secoes.push({
      id: "reaproveitamento",
      titulo: "♻️ Reaproveitamento",
      tipo: "lista",
      layout: "imagem-direita",
      imagem: dica.conteudo.imagem_reaproveitamento || null,
      conteudo: dica.conteudo.reaproveitamento
    });
  }

  // =====================
  // DICAS EXTRAS
  // =====================

  if (dica.conteudo?.dicas_extras?.length) {

    secoes.push({
      id: "dicas-extras",
      titulo: "💡 Dicas Extras",
      tipo: "lista",
      layout: "imagem-direita",
      imagem: dica.conteudo.imagem_dicas_extras || null,
      conteudo: dica.conteudo.dicas_extras
    });
  }

  // =====================
  // CORTES
  // =====================

  if (dica.cortes?.length) {

    secoes.push({
      id: "cortes",
      titulo: "🔪 Tipos de Corte",
      tipo: "objetos",
      conteudo: dica.cortes.map(corte => ({
        nome: corte.tipo,
        descricao: corte.descricao || corte.descrição || "",
        imagem: corte.imagem || null
      }))
    });
  }

  // =====================
  // COZIMENTO
  // =====================

  if (dica.cozimento?.dicas_gerais?.length) {

    secoes.push({
      id: "cozimento",
      titulo: "🔥 Cozimento",
      tipo: "lista",
      layout: "imagem-direita",
      imagem: dica.cozimento.imagem_cozimento || null,
      conteudo: dica.cozimento.dicas_gerais
    });
  }

  // =====================
  // MÉTODOS
  // =====================

  if (dica.cozimento?.metodos?.length) {
    secoes.push({
      id: "metodos",
      titulo: "🍳 Métodos",
      tipo: "objetos",

      conteudo: dica.cozimento.metodos.map(metodo => ({
        nome: metodo.tipo,
        tempo: metodo.tempo || "",
        descricao: metodo.descricao || "",
        imagem: metodo.imagem || null
      }))
    });
  }

  // =====================
  // RETORNO FINAL
  // =====================

  return {
    ...dica,
    secoes
  };
}

// Função para gerar FAQs - inserida 03/05/2026
function gerarFAQ(dica) {
  const categoria = (dica.categoria || "").toLowerCase();
  const extras = dica.conteudo?.dicas_extras || [];
  const tema = dica.tema || "esse alimento";

  const faq = [];

  // 🧠 Helpers
  const temTexto = (txt) =>
    extras.some(e => e.toLowerCase().includes(txt));

  // 🔍 Detectar ERRO COMUM corretamente
  extras.forEach(extra => {
    if (extra.toLowerCase().includes("erro comum")) {
      faq.push({
        pergunta: `Qual erro devo evitar ao trabalhar com ${tema}?`,
        resposta: extra.replace(/erro comum:\s*/i, "")
      });
    }
  });

  // =========================
  // 📦 ARMAZENAMENTO
  // =========================
  if (categoria.includes("armazen")) {
    faq.push({
      pergunta: `Qual a melhor forma de armazenar ${tema}?`,
      resposta: "Controlar umidade, temperatura e evitar exposição ao ar aumenta a durabilidade."
    });

    if (temTexto("água")) {
      faq.push({
        pergunta: `Por que armazenar ${tema} na água funciona?`,
        resposta: "A água reduz a perda de umidade e mantém a textura por mais tempo."
      });
    }

    faq.push({
      pergunta: `Quanto tempo ${tema} dura na geladeira?`,
      resposta: "Depende do método, mas boas práticas podem prolongar significativamente a conservação."
    });
  }

  // =========================
  // 🔥 COZIMENTO
  // =========================
  else if (categoria.includes("cozimento")) {
    faq.push({
      pergunta: `Qual o maior erro ao cozinhar ${tema}?`,
      resposta: "O excesso de tempo no fogo compromete textura, sabor e nutrientes."
    });

    if (temTexto("cor")) {
      faq.push({
        pergunta: `Como manter a cor de ${tema}?`,
        resposta: "Controle o tempo de cozimento e use técnicas como choque térmico."
      });
    }

    faq.push({
      pergunta: `Qual o melhor método para preparar ${tema}?`,
      resposta: "Métodos rápidos geralmente preservam melhor sabor e textura."
    });
  }

  // =========================
  // 🔪 CORTES
  // =========================
  else if (categoria.includes("corte")) {
    faq.push({
      pergunta: `Por que o corte uniforme é importante no ${tema}?`,
      resposta: "Garante cozimento igual e melhor apresentação."
    });

    faq.push({
      pergunta: `Preciso de faca especial para cortar ${tema}?`,
      resposta: "Não necessariamente, mas uma faca bem afiada é essencial."
    });
  }

  // =========================
  // 🍳 PREPARO
  // =========================
  else if (categoria.includes("preparo")) {
    faq.push({
      pergunta: `Preciso preparar ${tema} antes de cozinhar?`,
      resposta: "Sim, etapas como secagem e corte influenciam diretamente no resultado."
    });

    faq.push({
      pergunta: `O preparo influencia no sabor do ${tema}?`,
      resposta: "Sim, impacta textura, suculência e sabor final."
    });
  }

  // =========================
  // ♻️ APROVEITAMENTO
  // =========================
  else if (categoria.includes("aproveitamento")) {
    faq.push({
      pergunta: `Posso congelar ${tema}?`,
      resposta: "Sim, o congelamento é uma ótima forma de evitar desperdício."
    });

    faq.push({
      pergunta: `Como saber se ${tema} ainda está bom?`,
      resposta: "Observe cheiro, cor e textura."
    });
  }

  // =========================
  // 🍳 UTENSÍLIOS
  // =========================
  else if (categoria.includes("utensilio")) {
    faq.push({
      pergunta: `Qual o erro mais comum ao usar ${tema}?`,
      resposta: extras[0] || "Uso incorreto pode comprometer o resultado."
    });

    faq.push({
      pergunta: `${tema} influencia na receita?`,
      resposta: "Sim, o utensílio impacta diretamente no preparo."
    });
  }

  // =========================
  // 🔁 FALLBACK
  // =========================
  if (faq.length === 0) {
    faq.push({
      pergunta: `Qual a principal dica sobre ${tema}?`,
      resposta: extras[0] || "Seguir boas práticas garante melhores resultados."
    });
  }

  return faq.slice(0, 4);
}

// Função com IA para gerar FAQ automatica - isnerida //
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function gerarFAQComIA(dica) {
  const tema = dica.tema || "alimento";

  // 🔥 Junta conteúdo relevante
  const textoBase = `
TEMA: ${tema}

PREPARO:
${(dica.conteudo?.preparo || []).join("\n")}

DICAS EXTRAS:
${(dica.conteudo?.dicas_extras || []).join("\n")}

REAPROVEITAMENTO:
${(dica.conteudo?.reaproveitamento || []).join("\n")}
`;

  const prompt = `
Gere de 3 a 4 perguntas frequentes (FAQ) úteis, específicas e não genéricas sobre o tema abaixo.

Regras:
- Evite perguntas óbvias ou genéricas
- Use linguagem natural (como busca do Google)
- Foque em dúvidas reais de cozinha
- Respostas curtas (máx 2 linhas)
- NÃO repita o conteúdo literalmente
- Retorne em JSON no formato:

[
  { "pergunta": "...", "resposta": "..." }
]

CONTEÚDO:
${textoBase}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  });

  const texto = response.output[0].content[0].text;

  try {
    return JSON.parse(texto);
  } catch (e) {
    console.error("Erro ao parsear FAQ:", texto);
    return [];
  }
}

// Aplicar IA ao dicas.json - inserida 03/05/2026
async function processarDicas(json) {
  const resultado = [];

  for (const dica of json.dicas) {
    const faq = await gerarFAQComIA(dica);
    await new Promise(r => setTimeout(r, 500));
    
    if (dica.faq && dica.faq.length > 0) {
      console.log("Pulando (já tem FAQ):", dica.nome);
      
    resultado.push({
      ...dica,
      faq
    });
  }

  return resultado;
}