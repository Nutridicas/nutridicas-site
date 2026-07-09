//Inserida 16/03/2026
// ===============================
// Identificar ingrediente na URL
// ===============================

//const params = new URLSearchParams(location.search)
// Inserida 20/03/2026 - posicionar o link no ingrediente selcionado
const params =
  new URLSearchParams(window.location.search);

const slug =
  params.get("slug");;

// 2. DEPOIS pegamos o slug dele
//const slug = params.get("slug");

// 3. AGORA o seu IF vai funcionar
if (slug) {
  const el = document.getElementById(slug);
  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// Defina as outras variáveis que seu código usa logo abaixo
const slugIngrediente = slug;
const from = params.get("from");
const scroll = params.get("scroll");

// ===============================
// Carregar dados do ingrediente
// ===============================

async function carregarIngrediente(){
  const resp = await fetch("/ingredientes-info")
  const data = await resp.json()

  const ing = data[slugIngrediente]
  if(!ing) return

  document.getElementById("tituloIngrediente").innerText = ing.nome
  document.getElementById("infoIngrediente").innerHTML = `<p>${ing.resumo}</p>`
}

// ===============================
// Buscar receitas que usam ingrediente 
// ===============================

async function carregarReceitasIngrediente(){
  const lista = document.getElementById("receitasIngrediente")
  if (!lista) return 

  const resp = await fetch("/receitas")
  if(!resp.ok){
    console.error("Erro ao carregar receitas")
    return
  }

  const receitas = await resp.json()
  const filtradas = receitas.filter(r =>
    r.conteudo?.ingredientes.some(i =>
      i.toLowerCase().replace(/\s+/g,"-") === slugIngrediente
    )
  )

  lista.innerHTML = filtradas.map(r => `
    <li>
      <a href="receita.html?slug=${r.slug}">
        ${r.titulo}
      </a>
    </li>
  `).join("")
}

// ===============================
// Inicializar página - alterada 19/05/2026 - chamar frutas.html
// ===============================

 document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const resp = await fetch("/ingredientes-info.json");
  const banco = await resp.json();

  if (!slug) {
    carregarLista();
    return;
  }

  const ing = Object.values(banco).find(i =>
    i.slug === slug || gerarSlug(i.nome) === slug
  );

  if (!ing) return;

  mostrarIngrediente(ing);
});


//  Para retornar para a página - Inserida 20/03/2026

//const from = params.get("from")
//const scroll = params.get("scroll")

const btnVoltar = document.getElementById("btnVoltar")

if(from && btnVoltar){

  btnVoltar.href = from + (scroll ? `&scroll=${scroll}` : "")

}

// RESTAURAR SCROLL NA RECEITA - Inserida 20/03/2026

if(scroll){
  window.scrollTo(0, parseInt(scroll))
}


//
function mostrarIngrediente(ing) {

  document.getElementById("tituloIngrediente").innerText = ing.nome;

  document.getElementById("infoIngrediente").innerHTML =
    `<p>${ing.resumo}</p>`;

}