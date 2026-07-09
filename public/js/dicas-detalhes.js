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
     carregarDica(id, slug);
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

// Função para preencher o conteúdo das dicas em dicas.html

async function carregarDica(id, slug) {

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
   if (!dica) {
    console.error("Dica não encontrada", { id, slug });
    document.body.innerHTML = "<h1>Dica não encontrada</h1>";
    return;
  }

  // 🔥 MIGRAÇÃO AUTOMÁTICA
  dica = migrarEstrutura(dica);

  console.log(dica);

  if (!dica) {
    document.body.innerHTML = "<h1>Dica não encontrada</h1>";
    return;
  }

  dica = migrarEstrutura(dica);

aplicarFAQ({
  dados: dica,
  gerador: gerarFAQPro
});

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

if (id || slug) {
    if (lista) lista.style.display = "none";         // ESCONDE a lista geral
    if (tituloLista) tituloLista.style.display = "none"; // ESCONDE o título da lista
  } else {
    if (lista) lista.style.display = "grid";         // Mostra se não houver ID
    if (tituloLista) tituloLista.style.display = "block";
  }

  document.getElementById('titulo').innerText =
  `${dica.subcategoria} - ${dica.tema}
  Assunto: ${dica.categoria}
  ${dica.nome}`;

  const containerDicas = document.getElementById('conteudo');
  containerDicas.innerHTML = "";

  //  Mudar para exibir nova estrutura de dicas.json - 02/05/2026
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

 if (!dica) {
    console.error("migrarEstrutura recebeu dica inválida");
    return null;
  }

  const secoes = [];
 
  // =====================
  // PREPARO
  // =====================

  if (dica.conteudo?.preparo?.length) {
  secoes.push({
    id: "preparo",
    titulo: dica.alimento ? "🥕 Preparo" : "📖 Descrição",
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
      titulo: dica.alimento ? "♻️ Reaproveitamento" : "🛠️ Outras Dicas",
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
      titulo: dica.alimento ? "🔪 Tipos de Corte" : "🔍 Detalhes",
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
      titulo: dica.alimento ? "🔥 Cozimento" : "📌 Organização",
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

// Gerar Faq
function renderFAQ(faqs) {
  const container = document.getElementById("faq-lista");
  if (!container) return;

  container.innerHTML = "";

  faqs.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("faq-item");

    div.innerHTML = `
      <button class="faq-pergunta">
        ${item.pergunta}
        <span class="icone">+</span>
      </button>
      <div class="faq-resposta">
        <p>${item.resposta}</p>
      </div>
    `;

    container.appendChild(div);
  });

  // interação
  document.querySelectorAll(".faq-pergunta").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      item.classList.toggle("ativo");
    });
  });
}
// Aplicar FAQ função genérica (reutilizável) - insserida 05/05/2026
//Crie uma função única

function aplicarFAQ({ dados, gerador }) {
  const faqData = dados?.faq?.length
    ? dados.faq
    : gerador
      ? gerador(dados)
      : [];

  if (!faqData.length) return;

  renderFAQ(faqData);
  gerarFAQSchema(faqData);
}

// Schema.org FAQ - 05/05/2026
function gerarFAQSchema(faqs) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.pergunta,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.resposta
      }
    }))
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.innerHTML = JSON.stringify(schema);

  document.head.appendChild(script);
}

//Extrair FAQs de todo o conteúdo das dicas do dicas.json
// Inserida 05/05/2026

function extrairTextoDica(dica) {
  let textos = [];

  // percorre todas as seções já migradas
  dica.secoes.forEach(secao => {
    if (Array.isArray(secao.conteudo)) {
      secao.conteudo.forEach(item => {
        if (typeof item === "string") {
          textos.push(item);
        } else if (typeof item === "object") {
          textos.push(item.descricao || "");
        }
      });
    }
  });

  return textos.join(" ").toLowerCase();
}

// Detectar padrões automaticamente - cria um “motor” de interpretação:
// Criada 05/05/2026

function gerarFAQInteligente(dica) {
  const texto = extrairTextoDica(dica);
  const tema = dica.tema || "esse alimento";

  const faq = [];

  // 🔥 SUCULÊNCIA / SUCO
  if (texto.includes("suco") || texto.includes("extrair")) {
    faq.push({
      pergunta: `Como extrair mais suco de ${tema}?`,
      resposta: "Pressionar antes de cortar ou aquecer levemente ajuda a liberar mais líquido."
    });
  }

  // 🔥 UMIDADE / RESSECAR
  if (texto.includes("umidade") || texto.includes("ressecar")) {
    faq.push({
      pergunta: `Como evitar que ${tema} resseque?`,
      resposta: "Reduza o contato com o ar e preserve a umidade natural."
    });
  }

  // 🔥 ARMAZENAMENTO
  if (texto.includes("geladeira") || texto.includes("armazen")) {
    faq.push({
      pergunta: `Como armazenar ${tema} corretamente?`,
      resposta: "Evite exposição ao ar e controle temperatura e umidade."
    });
  }

  // 🔥 TEMPERATURA
  if (texto.includes("calor") || texto.includes("cozimento")) {
    faq.push({
      pergunta: `O calor afeta ${tema}?`,
      resposta: "Sim, temperaturas altas podem alterar textura e sabor."
    });
  }

  // 🔁 fallback
  if (!faq.length) {
    faq.push({
      pergunta: `Qual a melhor forma de usar ${tema}?`,
      resposta: "Boas práticas de preparo e armazenamento fazem toda diferença."
    });
  }

  return faq.slice(0, 4);
}

// Função Criada 05/05/2026 - dicas.html
function gerarFAQCompleto(dica) {
  const manual = gerarFAQ(dica); // seu atual
  const inteligente = gerarFAQInteligente(dica);

  return [...manual, ...inteligente].slice(0, 4);
}

// Para buscar e extrair textos das dicas no dicas.json
// Criada 05/05/2026

function extrairTextoDica(dica) {
  let textos = [];

  dica.secoes.forEach(secao => {
    if (Array.isArray(secao.conteudo)) {
      secao.conteudo.forEach(item => {
        if (typeof item === "string") {
          textos.push(item);
        } else if (item.descricao) {
          textos.push(item.descricao);
        }
      });
    }
  });

  return textos.join(" ").toLowerCase();
}
// Motor  de busca para criar FAQ baseados no arquivo dicas.json 
// com regras + pontuação - Criada 05/05/2026

function detectarTopicos(texto) {
  const regras = [
    {
      id: "armazenamento",
      palavras: ["geladeira", "armazen", "conservar", "guardar"],
      peso: 3
    },
    {
      id: "umidade",
      palavras: ["umidade", "ressecar", "seco"],
      peso: 2
    },
    {
      id: "suco",
      palavras: ["suco", "extrair", "espremer"],
      peso: 2
    },
    {
      id: "calor",
      palavras: ["calor", "cozinhar", "fogo"],
      peso: 2
    },
    {
      id: "erro",
      palavras: ["erro comum", "evite", "não faça"],
      peso: 3
    }
  ];

  const score = {};

  regras.forEach(regra => {
    regra.palavras.forEach(p => {
      if (texto.includes(p)) {
        score[regra.id] = (score[regra.id] || 0) + regra.peso;
      }
    });
  });

  return score;
}

//Gerador de perguntas inteligente - Criada 05/05/2026

function gerarPerguntas(topicos, tema) {
  const perguntas = [];

  if (topicos.armazenamento) {
    perguntas.push({
      pergunta: `Qual a melhor forma de armazenar ${tema}?`,
      resposta: "Evite exposição ao ar e controle a umidade."
    });
  }

  if (topicos.umidade) {
    perguntas.push({
      pergunta: `Como evitar que ${tema} resseque?`,
      resposta: "Manter a umidade natural é essencial para preservar a qualidade."
    });
  }

  if (topicos.suco) {
    perguntas.push({
      pergunta: `Como extrair mais suco de ${tema}?`,
      resposta: "Pressionar antes de cortar ou aquecer levemente ajuda."
    });
  }

  if (topicos.calor) {
    perguntas.push({
      pergunta: `O calor afeta ${tema}?`,
      resposta: "Sim, pode alterar textura e sabor."
    });
  }

  if (topicos.erro) {
    perguntas.push({
      pergunta: `Qual erro evitar ao usar ${tema}?`,
      resposta: "Evite práticas que comprometam textura e sabor."
    });
  }

  return perguntas;
}

// Função final (motor completo) - Criada 05/05/2026

function gerarFAQPro(dica) {
  const texto = extrairTextoDica(dica);
  const tema = dica.tema || "esse alimento";

  const topicos = detectarTopicos(texto);

  let faq = gerarPerguntas(topicos, tema);

  // 🔥 ordenar por relevância (score)
  faq = faq.sort((a, b) => {
    return (topicos[b.id] || 0) - (topicos[a.id] || 0);
  });

  // 🔁 fallback
  if (!faq.length) {
    faq.push({
      pergunta: `Qual a melhor forma de usar ${tema}?`,
      resposta: "Boas práticas garantem melhores resultados."
    });
  }

  return faq.slice(0, 4);
}

// Varia pergunta - Criada 05/05/2026
function gerarVariacoes(tema) {
  return [
    `Como conservar ${tema}?`,
    `Qual a melhor forma de armazenar ${tema}?`,
    `Como guardar ${tema} corretamente?`
  ];
}

//- Criada 05/05/2026
function gerarFAQFinal(dica) {
  return [
    ...gerarFAQ(dica),
    ...gerarFAQPro(dica)
  ].slice(0, 4);
}

// Função para buscar uma dica específica em dicas.html - inseida 23/05/2026

// js/busca.js

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // CONFIGURAÇÃO 1: BUSCA DE RECEITAS (Header)
  // ==========================================
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  let todasAsReceitas = [];

  async function carregarReceitas() {
    try {
      const response = await fetch('/receitas'); 
      todasAsReceitas = await response.json(); 
    } catch (e) { console.error("Erro ao carregar receitas", e); }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase().trim();
      if (!termo) { searchResults.innerHTML = ""; searchResults.style.display = "none"; return; }

      const filtrados = todasAsReceitas.filter(r => 
        (r.nome && r.nome.toLowerCase().includes(termo)) || 
        (r.titulo && r.titulo.toLowerCase().includes(termo))
      );

      searchResults.innerHTML = filtrados.slice(0, 5).map(r => `
        <a href="${r.url || `receita.html?id=${r.id}`}" class="search-item">
          <strong>${r.nome || r.titulo}</strong>
        </a>
      `).join("");
      searchResults.style.display = filtrados.length ? "block" : "none";
    });
  }

  // ==========================================
  // CONFIGURAÇÃO 2: BUSCA PROFUNDA DE DICAS (Filtra todo o JSON)
  // ==========================================
  const searchDicasInput = document.getElementById("searchDicasInput");
  const searchDicasResults = document.getElementById("searchDicasResults");
  let todasAsDicas = [];
  let contains

  async function carregarDicasParaBusca() {
    try {
      const response = await fetch('/dicas'); 
      const data = await response.json();
      todasAsDicas = data.dicas || data; 
    } catch (error) {
      console.error("Erro ao carregar dicas para a busca:", error);
    }
  }

  function filtrarDicasProfundo(termo) {
    if (!termo.trim()) {
      searchDicasResults.innerHTML = "";
      searchDicasResults.style.display = "none";
      return;
    }

    const termoMinusculo = termo.toLowerCase();

    const resultadosFiltrados = todasAsDicas.filter(dica => {
      // 1. Textos principais
      if (dica.nome?.toLowerCase().includes(termoMinusculo)) return true;
      if (dica.tema?.toLowerCase().includes(termoMinusculo)) return true;
      if (dica.categoria?.toLowerCase().includes(termoMinusculo)) return true;
      if (dica.resumo?.toLowerCase().includes(termoMinusculo)) return true;
      if (dica.tags?.some(tag => tag.toLowerCase().includes(termoMinusculo))) return true;

      // 2. Busca dentro de 'conteudo' (preparo, reaproveitamento, dicas_extras)
      if (dica.conteudo) {
        const preparo = dica.conteudo.preparo?.some(t => t.toLowerCase().includes(termoMinusculo));
        const reaproveita = dica.conteudo.reaproveitamento?.some(t => t.toLowerCase().includes(termoMinusculo));
        const extras = dica.conteudo.dicas_extras?.some(t => t.toLowerCase().includes(termoMinusculo));
        if (preparo || reaproveita || extras) return true;
      }

      // 3. Busca dentro de 'cozimento.metodos' e 'cozimento.dicas_gerais'
      if (dica.cozimento) {
        const gerais = dica.cozimento.dicas_gerais?.some(t => t.toLowerCase().includes(termoMinusculo));
        const metodos = dica.cozimento.metodos?.some(m => 
          m.tipo?.toLowerCase().includes(termoMinusculo) || 
          m.descricao?.toLowerCase().includes(termoMinusculo)
        );
        if (gerais || metodos) return true;
      }

      // 4. Busca dentro de perguntas e respostas do 'faq'
      if (dica.faq?.some(f => f.pergunta?.toLowerCase().includes(termoMinusculo) || f.resposta?.toLowerCase().includes(termoMinusculo))) {
        return true;
      }

      return false;
    });

    exibirResultadosDicas(resultadosFiltrados);
  }

  function exibirResultadosDicas(resultados) {
    searchDicasResults.innerHTML = "";

    if (resultados.length === 0) {
      searchDicasResults.innerHTML = "<div class='search-item-dica'>Nenhuma dica encontrada para este termo</div>";
      searchDicasResults.style.display = "block";
      return;
    }

    resultados.slice(0, 5).forEach(dica => {
      const item = document.createElement("a");
      item.href = `dicas.html?id=${dica.id}&slug=${dica.slug}`;
      item.classList.add("search-item-dica");
      
      item.innerHTML = `
        <div class="search-dica-title">💡 ${dica.nome}</div>
        <div class="search-dica-meta">📌 ${dica.tema} • <small>${dica.resumo}</small></div>
      `;

      item.addEventListener("click", (e) => {
        if (typeof carregarDica === "function") {
          e.preventDefault();
          window.history.pushState(null, "", item.href);
          carregarDica(dica.id, dica.slug);
          searchDicasResults.style.display = "none";
          searchDicasInput.value = "";
          // Rola suavemente até o topo para visualizar a dica aberta
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      searchDicasResults.appendChild(item);
    });

    searchDicasResults.style.display = "block";
  }

  if (searchDicasInput) {
    searchDicasInput.addEventListener("input", (e) => {
      filtrarDicasProfundo(e.target.value);
    });
  }

   document.addEventListener("click", (e) => {
    // Verifica a busca de dicas (Configuração 2)
    if (searchDicasInput && searchDicasResults && !searchDicasInput.contains(e.target) && !searchDicasResults.contains(e.target)) {
      searchDicasResults.style.display = "none";
    }
    
    // CORREÇÃO: Adicionada a validação para checar se searchInput e searchResults existem antes de rodar o .contains()
    if (typeof searchInput !== 'undefined' && searchInput && 
        typeof searchResults !== 'undefined' && searchResults) {
        
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
          searchResults.style.display = "none";
        }
    }
  });

  carregarReceitas();
  carregarDicasParaBusca();
});



