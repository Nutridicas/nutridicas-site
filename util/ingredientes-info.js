//=============================
// Informações de ingredientes
// Criado em 11/03/2026
// Atualizada 12/03/2026
//=============================

// Tooltip
const tooltipIngrediente = document.getElementById("tooltipIngrediente")

// Banco de ingredientes
let ingredientesInfo = {}

//=============================
// Carregar JSON de ingredientes
//=============================

async function carregarIngredientesInfo(){

  if(Object.keys(ingredientesInfo).length) return

  const resp = await fetch("/json/ingredientes-info.json")

  if(!resp.ok){
    console.error("Erro ao carregar ingredientes-info.json")
    return
  }

  ingredientesInfo = await resp.json()

}

//=============================
// Criar ingrediente com tooltip
// Atualizada em 20/03/2026 para inserir função gerarslug - retira acentos
//=============================

function criarIngrediente(nome){

  const slug = gerarSlug(nome)

  const info = ingredientesInfo[slug]

  if(!info){
    return nome
  }

  return `
    <a href="ingredientes.html?slug=${el.dataset.slug}
      &from=${encodeURIComponent(location.href)}
      &scroll=${window.scrollY}">
      Saiba mais
    </a>
  `
}

//=============================
// Tooltip
//=============================

const tooltip = document.getElementById("tooltipIngrediente");

let ingredientesCache = null;
let showTimeout;
let hideTimeout;
let currentElemento = null;

// 🔥 carregar JSON uma vez só
async function carregarIngredientes() {
  if (ingredientesCache) return ingredientesCache;

  const res = await fetch("/ingredientes.json");
  ingredientesCache = await res.json();

  return ingredientesCache;
}

// 🔥 MOSTRAR TOOLTIP (com delay)
document.addEventListener("mouseover", (e) => {
  const el = e.target.closest(".ingrediente-link");
  if (!el) return;

  clearTimeout(hideTimeout);
  currentElemento = el;

  showTimeout = setTimeout(async () => {
    const slug = el.dataset.slug;
    const data = await carregarIngredientes();
    const info = data[slug];

    if (!info) return;

    tooltip.innerHTML = `
      <strong>${info.nome}</strong><br>
      ${info.descricao}<br><br>
      <a href="/ingrediente/${slug}">Saiba mais</a>
    `;

    tooltip.style.display = "block";
    tooltip.classList.add("show");
  }, 250); // delay suave
});

// 🔥 POSIÇÃO INTELIGENTE
document.addEventListener("mousemove", (e) => {
  if (!tooltip.classList.contains("show")) return;

  const padding = 15;
  let x = e.pageX + padding;
  let y = e.pageY + padding;

  const rect = tooltip.getBoundingClientRect();

  if (x + rect.width > window.innerWidth) {
    x = e.pageX - rect.width - padding;
  }

  if (y + rect.height > window.innerHeight) {
    y = e.pageY - rect.height - padding;
  }

  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
});

// 🔥 ESCONDER COM INTELIGÊNCIA
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

//=============================
// História das receitas
//=============================

async function carregarHistoria(slug){

  const resp = await fetch("/json/receitas-historia.json")

  if(!resp.ok){
    console.error("Erro ao carregar receitas-historia.json")
    return null
  }

  const data = await resp.json()

  return data[slug] || null

}
//
async function inserirHistoriaReceita(receita){

  const slug = receita.slug

  const historia = await carregarHistoria(slug)

  if(historia){

    document.getElementById("historiaReceita").innerHTML = `
      <h3>História da receita</h3>
      <p>${historia.historia}</p>

      <h4>Origem</h4>
      <p>${historia.origem}</p>

      <h4>Curiosidade</h4>
      <p>${historia.curiosidade}</p>
    `
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
              data-resumo="${info.resumo}"
              data-link="${info.link}">
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

const slug = params.get("slug")

if(slug){

  setTimeout(()=>{

    const el = document.getElementById(slug)

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
    ${info.descricao}<br><br>
    <a href="/ingrediente/${slug}">Saiba mais</a>
  `;

  tooltip.style.display = "block";
  tooltip.classList.add("show");

  tooltip.style.left = "50%";
  tooltip.style.top = "50%";
  tooltip.style.transform = "translate(-50%, -50%)";
});
