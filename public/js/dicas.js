// Arquivo para carregar dicas de cozinha - criado 13/04/2026

// para usar a mesma página dicas.html e exibir lista e dicas rápidas
const { id, slug } = getParamsFromURL();

const isPaginaDicas = document.getElementById('lista-dicas-completas');

if (isPaginaDicas) {
  //const slug = getSlugFromURL();

  if (id) {
    carregarDica(id);
  } else {
    carregarLista();
  
  }
}

async function carregarDica(id) {

  const response = await fetch('/dicas');
  const data = await response.json();

  let dica = null;

    // 🔥 prioridade: ID
    if (id) {
      dica = data.dicas.find(d => d.id === id);
    }

    // 🔥 fallback: slug
    if (!dica && slug) {
      dica = data.dicas.find(d => d.slug === slug);
    }

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
    // antes de renderizar - 15/04/2026
    const preparoComDicas = aplicarDicasNoPreparo(
      dica.conteudo.preparo,
      data.dicas_rapidas
    );

  // esconder lista
  document.getElementById('lista-dicas-completas').style.display = "none";
  document.getElementById('titulo-lista').style.display = "none";

  // mostrar conteúdo
  document.getElementById('titulo').innerText = dica.nome;

  const containerDicas = document.getElementById('conteudo');
  containerDicas.innerHTML = "";

  if (dica.conteudo?.preparo) {
    criarLista("Preparo", dica.conteudo.preparo);
  }

if (dica.conteudo?.reaproveitamento) {
  criarLista("Reaproveitamento", dica.conteudo.reaproveitamento);
}

if (dica.conteudo?.dicas_extras) {
  criarLista("Dicas Extras", dica.conteudo.dicas_extras);
}
  if (dica.cortes) {
    criarListaObjetos("Tipos de Corte", dica.cortes);
  }

  if (dica.cozimento?.metodos) {
    criarListaObjetos("Métodos de Cozimento", dica.cozimento.metodos);
  }
}

// Função para criar lista de dicas 

  function criarLista(titulo, itens) {
    const section = document.createElement("div");

    const h2 = document.createElement("h2");
    h2.innerText = titulo;

    const ul = document.createElement("ul");

    itens.forEach(item => {
      const li = document.createElement("li");
      li.innerText = item;
      ul.appendChild(li);
    });

    section.appendChild(h2);
    section.appendChild(ul);
    containerDicas.appendChild(section);
  }

function criarListaObjetos(titulo, itens) {
  const containerDicas = document.getElementById('conteudo'); // 👈 ADICIONE ISSO

  const section = document.createElement("div");

  const h2 = document.createElement("h2");
  h2.innerText = titulo;

  const ul = document.createElement("ul");

  itens.forEach(item => {
    const li = document.createElement("li");
    li.innerText = Object.values(item).join(" - ");
    ul.appendChild(li);
  });

  section.appendChild(h2);
  section.appendChild(ul);
  containerDicas.appendChild(section);
}
//-------------------------

  function criarLista(titulo, itens) {
  const containerDicas = document.getElementById('conteudo'); // 👈 ADICIONE ISSO

  const section = document.createElement("div");

  const h2 = document.createElement("h2");
  h2.innerText = titulo;

  const ul = document.createElement("ul");

  itens.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    ul.appendChild(li);
  });

  section.appendChild(h2);
  section.appendChild(ul);
  containerDicas.appendChild(section);
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

  
//Pegar o slug ou id da URL 13/04/2026 - alterada 14/04/2026 para constar id

function getParamsFromURL() {
  const params = new URLSearchParams(window.location.search);

  return {
    id: params.get("id"),
    slug: params.get("slug")
  };
}


if (document.getElementById('dica-do-dia')) {

  fetch('/dicas-rapidas')
    .then(res => res.json())
    .then(data => {

      const dicas = data.dicas_rapidas;

  //    const dicasOrdenadas = ordenarPorPopularidade(dicas);

      // ✅ filtrar apenas dicas ativas
      const dicasAtivas = dicas.filter(d => d.ativa !== false);

      // ⚠️ evitar erro se não tiver dicas
      if (dicasAtivas.length === 0) return;

      const hoje = new Date();

      // ✅ índice mais inteligente (não repete sempre igual)
      const indice = Math.floor(
        (hoje.getTime() / (1000 * 60 * 60 * 24)) % dicasAtivas.length
      );

      const dica = dicasAtivas[indice];

      const containerDicas = document.getElementById('dica-do-dia');

      containerDicas.innerHTML = `
        <div class="card-dica destaque">
          <span class="categoria">${dica.categoria}</span>
          <h3>${dica.titulo}</h3>
          <p>${dica.texto}</p>
          <a href="/dicas.html?id=${dica.id}&slug=${dica.slug}"">Ver dica completa →</a>
        </div>
      `;
    });

}

// lista de dicas rápidas index.html- inseida 14/04/2026
if (document.getElementById('lista-dicas')) {

  fetch('/dicas-rapidas')
    .then(res => res.json())
    .then(data => {

      const containerDicas = document.getElementById('lista-dicas');

      const dicas = data.dicas_rapidas
        .filter(d => d.ativa !== false);

      // ⭐ AQUI (correto agora)
      //const dicasOrdenadas = ordenarPorPopularidade(dicas);

      //Exibir dicas do dia no index.html - 11/06/2026
      const dicasSelecionadas = obterDicasDoDia(dicas);

      //dicasOrdenadas
      dicasSelecionadas
        .slice(0, 3)
        .forEach(dica => {

          const div = document.createElement('div');
          div.classList.add('card-dica');

          div.innerHTML = `
            <span class="categoria">${dica.categoria}</span>
            <h3>${dica.titulo}</h3>
            <p>${dica.texto}</p>
            <a href="/dicas.html?id=${dica.id}&slug=${dica.slug}"
               onclick="registrarClique('${dica.id}')">
              Saiba mais →
            </a>
          `;

          containerDicas.appendChild(div);
        });

    });
}

//Mostrar dicas essenciais - inserida 14/04/2026

function mostrarDicaEssencial(dicas) {
  const containerDicas = document.getElementById('lista-dicas');

  const essencial = dicas.find(d => d.essencial);

  if (!essencial) return;

  const div = document.createElement('div');
  div.classList.add('dica-essencial');

  div.innerHTML = `
    <h4>⭐ Dica essencial</h4>
    <p><strong>${essencial.titulo}</strong></p>
    <p>${essencial.texto}</p>
    <a href="/dicas.html?id=${essencial.id}&slug=${essencial.slug}">
      Ver dica completa →
    </a>
  `;

  containerDicas.appendChild(div);
}

// Apresentar tooltip no preparo para chamar a dica - inserida 15/04/2026 

function aplicarDicasNoPreparo(preparo, dicas) {

  return preparo.map(passo => {

    dicas.forEach(dica => {

      const palavra = dica.tipo;

      const regex = new RegExp(`(${palavra})`, 'gi');

      if (regex.test(passo)) {
        passo = passo.replace(regex, `
          <span class="tooltip-dica" data-dica="${dica.texto}">
            $1
          </span>
        `);
      }

    });

    return passo;
  });
}

// Função registrar clique dica essencial receita.html
//- inserida 15/04/2026 

function registrarClique(id) {
  let ranking = JSON.parse(localStorage.getItem("rankingDicas")) || {};

  ranking[id] = (ranking[id] || 0) + 1;

  localStorage.setItem("rankingDicas", JSON.stringify(ranking));
}

// Função ordenar as dicas receita.html
//- inserida 15/04/2026 

function ordenarPorPopularidade(dicas) {
  const ranking = JSON.parse(localStorage.getItem("rankingDicas")) || {};

  return dicas.sort((a, b) => {
    return (ranking[b.id] || 0) - (ranking[a.id] || 0);
  });
}

// Exibir as dicas rápidas no index.html de forma aleatória 
// Criada 11/06/2026 - 00h11m, dia do 1o jogo da copa mundial de futebol
function embaralhar(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Exibir as dicas rápidas no index.html do dia 
// Criada 11/06/2026 - 00h15m, dia do 1o jogo da copa mundial de futebol
function obterDicasDoDia(dicas, quantidade = 3) {

  const hoje = new Date();

  const seed =
    hoje.getFullYear() * 10000 +
    (hoje.getMonth() + 1) * 100 +
    hoje.getDate();

  const copia = [...dicas];

  copia.sort((a, b) => {
    return ((a.id + seed).length % 10) -
           ((b.id + seed).length % 10);
  });

  return copia.slice(0, quantidade);
}