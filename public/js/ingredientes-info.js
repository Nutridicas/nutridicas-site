//=============================
// Informações de ingredientes
// Criado em 11/03/2026
// Atualizada 12/03/2026
//=============================

// Tooltip
const tooltip = document.getElementById("tooltipIngrediente");

let ingredientesCache = null;
let activeEl = null;
let ingredientesInfo = {};



//=============================
// Criar ingrediente com tooltip
// Atualizada em 02/04/2026 para inserir função gerarslug - retira acentos
// Atualizada em 19/05/2026 - direicionar o tooltip para frutas.html, usando ingredientes.html
//=============================

  function criarIngrediente(nome) {

  const slug = gerarSlug(nome);

  const infoData =
    (typeof ingredientesInfo !== "undefined")
      ? ingredientesInfo
      : {};

  const info = Object.values(infoData).find(item =>
    (item.slug || gerarSlug(item.nome)) === slug
  );

  // Se não existir no JSON
  if (!info) {
    return `<li>${nome}</li>`;
  }

  // Usa o link do próprio JSON
  const urlDestino =
    info.link || `ingredientes.html?slug=${slug}`;

  return `
    <li>

      <span
        class="ingrediente-link"
        data-slug="${slug}"
      >

        ${nome}

        <a
          href="${urlDestino}"
          style="
            font-size: 0.8em;
            text-decoration: none;
            color: #6b7280;
          "
        >
          (Saiba mais)
        </a>

      </span>

    </li>
  `;
}



//=============================
// Carregar JSON de ingredientes
//=============================

async function carregarIngredientesInfo(){

  if(Object.keys(ingredientesInfo).length) return

  const resp = await fetch("/ingredientes-info")

  if(!resp.ok){
    console.error("Erro ao carregar ingredientes-info.json")
    return
  }

  ingredientesInfo = await resp.json()

}

//=============================
// Tooltip
//=============================

//const tooltip = document.getElementById("tooltipIngrediente");

//let ingredientesCache = null;
let showTimeout;
let hideTimeout;
let currentElemento = null;


// 🔥 carregar JSON uma vez só
// 1. Carregar JSON (Caminho corrigido para relativo)

async function carregarIngredientes() {
  if (ingredientesCache) return ingredientesCache;
  try {
    const res = await fetch("/ingredientes-info"); // Removi a barra inicial se estiver na mesma pasta
    ingredientesCache = await res.json();
    return ingredientesCache;
  } catch (e) {
    console.error("Erro ao carregar ingredientes-info.json", e);
    return {};
  }
}

// 2. Mostrar Tooltip

document.addEventListener("mouseover", async (e) => {

  const el = e.target.closest(".ingrediente-link");

  if (!el) return;

  clearTimeout(hideTimeout);

  const slug = el.dataset.slug;

  const data = await carregarIngredientes();

  const info = data[slug];

  if (!info) return;

  const rect = el.getBoundingClientRect();

  showTimeout = setTimeout(() => {

    // Link correto
    const linkBase =
      info.link || `ingredientes.html?slug=${slug}`;

    // Adiciona parâmetros corretamente
    const separador =
      linkBase.includes("?") ? "&" : "?";

    tooltip.innerHTML = `
      <strong>${info.nome}</strong><br>

      ${info.resumo}<br><br>

      <a href="${linkBase}${separador}from=${encodeURIComponent(location.href)}&scroll=${window.scrollY}">
        Saiba mais →
      </a>
    `;

    tooltip.style.display = "block";

    tooltip.style.left =
      rect.right + window.scrollX + 12 + "px";

    tooltip.style.top =
      rect.top + window.scrollY + "px";

    setTimeout(() => {
      tooltip.classList.add("show");
    }, 10);

  }, 200);

});

// 4. Esconder ao sair
document.addEventListener("mouseout", (e) => {
  if (e.target.closest(".ingrediente-link")) {
    clearTimeout(showTimeout);

    hideTimeout = setTimeout(() => {
      if (!tooltip.matches(":hover")) {
        tooltip.classList.remove("show");
        tooltip.style.display = "none";
      }
    }, 200);
  }
});

// 🔥 NÃO FECHAR AO ENTRAR NO TOOLTIP
tooltip.addEventListener("mouseenter", () => {
  clearTimeout(hideTimeout);
});

// 🔥 FECHAR AO SAIR DO TOOLTIP
tooltip.addEventListener("mouseleave", () => {
  tooltip.classList.remove("show");
  tooltip.style.display = "none";
});


/*tooltip.addEventListener("mouseleave", fecharTooltip);

function fecharTooltip() {
  tooltip.classList.remove("show");
  setTimeout(() => {
    if (!tooltip.classList.contains("show")) tooltip.style.display = "none";
  }, 200);
}
*/

//=============================
// História das receitas
//=============================

async function carregarHistoria(slug){

  const resp = await fetch("/receitas-historia")

  if(!resp.ok){
    console.error("Erro ao carregar receitas-historia.json")
    return null
  }

  const data = await resp.json()

  return data[slug] || null

}
//
async function inserirHistoriaReceita(receita){

  const slug = receita.slug;

  const historia = await carregarHistoria(slug);

  if (historia){

    const container =
      document.getElementById("historiaReceita");

    if (!container) return;

    container.innerHTML = `
      <h3>História da receita</h3>

      <p>${historia.historia}</p>

      <h4>Origem</h4>

      <p>${historia.origem}</p>

      <h4>Curiosidade</h4>

      <p>${historia.curiosidade}</p>
    `;

  }

}

// Função para converter texto automaticamente
// Inserida 15/03/2026
//
function linkarIngredientesNoTexto(texto){

  if(!texto) return texto

  for(const slug in ingredientesInfo){

    const nome = ingredientesInfo[slug].nome.toLowerCase()

    const regex = new RegExp(`\\b${nome}\\b`, "gi")

    texto = texto.replace(regex, match => {

      const info = ingredientesInfo[slug]

       return `
        <span class="ingrediente-link"
              data-slug="${slug}">
          ${match}
        </span>
      `

    })

  }

  return texto
}



//Abrir direto no ingrediente clicado
//Inserida 16/03/2026

const params = new URLSearchParams(location.search)

const paginaSlug = params.get("slug")

if(paginaSlug){

  setTimeout(()=>{

   const el = document.getElementById(paginaSlug)

    if(el){
      el.scrollIntoView({behavior:"smooth"})
    }

  },300)

}

// Desconsiderar acentos nas palavras para gerar tooltip
//Inserida 20/03/2026

function gerarSlug(texto){
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"") // remove acentos
    .replace(/[^\w\s-]/g,"")        // remove pontuação
    .replace(/\s+/g,"-")            // espaços → hífen
}

// tooltip mobile - inserida 31/03/2026

document.addEventListener("click", async (e) => {
  const el = e.target.closest(".ingrediente-link");
  if (!el) return;

  const slug = el.dataset.slug;
  const data = await carregarIngredientes();
  const info = data[slug];

  if (!info) return;

  tooltip.innerHTML = `
    <strong>${info.nome}</strong><br>
    ${info.resumo}<br><br>
    <a href="/ingrediente/${slug}">Saiba mais</a>
  `;

  tooltip.style.display = "block";
  tooltip.classList.add("show");

  tooltip.style.left = "50%";
  tooltip.style.top = "50%";
  tooltip.style.transform = "translate(-50%, -50%)";
});
