// ===============================================
// BUSCA NUTRIDICAS ULTRA RÁPIDA - Atualizado 09/03/2026 00h49m
// ===============================================

const sinonimos = {
aipim:"mandioca",
macaxeira:"mandioca",
jerimum:"abobora",
mexerica:"tangerina",
bergamota:"tangerina",
frango:"galinha",
galinha:"frango"
};

let receitas = [];
let indice = {};
let palavras = [];

// =====================
// NORMALIZAR
// =====================

function normalizar(txt){
return (txt||"")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase();
}

// =====================
// TOKENIZAR
// =====================

function tokenizar(txt){
return normalizar(txt)
.split(/[^a-z0-9]+/)
.filter(Boolean)
.map(p=> sinonimos[p] || p);
}

// =====================
// CARREGAR RECEITAS
// =====================

async function carregarReceitas(){

if(receitas.length) return;

const cache = localStorage.getItem("receitasCache");

if(cache){
receitas = JSON.parse(cache);
}else{
const res = await fetch("/receitas-index.json");
receitas = await res.json();
localStorage.setItem("receitasCache",JSON.stringify(receitas));
}

criarIndice();

}

// =====================
// CRIAR INDICE
// =====================

function criarIndice(){

indice = {};

receitas.forEach(r=>{

const texto = `${r.t} ${r.c} ${r.i} ${r.g}`;

const tokens = tokenizar(texto);

tokens.forEach(p=>{

if(!indice[p]) indice[p] = new Set();

indice[p].add(r);

});

});

palavras = Object.keys(indice);

}

// =====================
// BUSCA
// =====================

function buscar(termo){

const tokens = tokenizar(termo);

let resultados = [];

tokens.forEach(t=>{

if(indice[t]){

resultados.push(...indice[t]);

}else{

const corr = corrigir(t);

if(indice[corr])
resultados.push(...indice[corr]);

}

});

const unicos =
[...new Map(resultados.map(r=>[r.s,r])).values()];

return rankear(unicos,tokens);

}

// =====================
// RANKING
// =====================

function rankear(lista,tokens){

return lista
.map(r=>{

let score = 0;

const texto =
normalizar(`${r.t} ${r.c} ${r.i} ${r.g}`);

tokens.forEach(t=>{

if(texto.includes(t)) score++;

});

return {...r,score};

})
.sort((a,b)=>b.score-a.score)
.slice(0,20);

}

// ============================
  // Highlight termo
  // ============================
  function destacarTexto(texto, termo) {
    if (!termo || !texto) return texto;

    const safe = escapeRegExp(termo);
    const regex = new RegExp(`(${safe})`, "gi");

    return texto.replace(regex, "<mark>$1</mark>");
  }

// ============================
  // Render dropdown
  // ============================
  function exibirDropdown(lista, termo) {
    selecionadoIndex = -1;

    if (!lista.length) {
      resultsContainer.innerHTML = `
        <div class="search-item">Nenhuma receita encontrada 😢</div>
      `;
      resultsContainer.classList.add("active");
      return;
    }

    resultsContainer.innerHTML = lista
      resultsContainer.innerHTML = lista.map(receita => {

    // caminho correto da imagem
        const imgSrc = receita.imagem
            ? `/imagens/receitas/${receita.imagem}`
            : `/imagens/placeholder.jpg`;

        return `
            <div class="search-item"
                 onclick="window.location.href='receita.html?slug=${receita.slug}'">

                <img src="${imgSrc}" class="search-thumb">

                <div>
                    <strong>${destacarTexto(receita.titulo, termo)}</strong><br>
                    <small>Categoria: ${destacarTexto(receita.categoria, termo)}</small>
                </div>
            </div>
        `;
    }).join('');

    resultsContainer.classList.add("active");

    // clique abre receita
    document.querySelectorAll(".search-item").forEach((item) => {
      item.addEventListener("click", () => {
        const i = item.dataset.index;
        window.location.href = `receita.html?slug=${lista[i].slug}`;
      });
    });
  }


// =====================
// AUTOCOMPLETE
// =====================

function sugestoes(termo){

termo = normalizar(termo);

return palavras
.filter(p=>p.startsWith(termo))
.slice(0,6);

}

// =====================
// CORREÇÃO DE DIGITAÇÃO
// =====================

function corrigir(t){

let melhor = t;
let menor = 999;

palavras.forEach(p=>{

const d = lev(t,p);

if(d < menor && d <= 2){
menor = d;
melhor = p;
}

});

return melhor;

}

// =====================
// LEVENSHTEIN
// =====================

function lev(a,b){

const m=[];

for(let i=0;i<=b.length;i++) m[i]=[i];

for(let j=0;j<=a.length;j++) m[0][j]=j;

for(let i=1;i<=b.length;i++){
for(let j=1;j<=a.length;j++){

m[i][j] =
b[i-1]==a[j-1]
? m[i-1][j-1]
: Math.min(
m[i-1][j-1]+1,
m[i][j-1]+1,
m[i-1][j]+1
);

}
}

return m[b.length][a.length];

}

//=====================
document.addEventListener("DOMContentLoaded", () => {

  const campo = document.getElementById("searchInput");
  const resultados = document.getElementById("searchResults");

  if (!campo || !resultados) return;

  campo.addEventListener("input", async (e) => {

    const termo = e.target.value.trim();

    if (!termo) {
      resultados.innerHTML = "";
      return;
    }

    await carregarReceitas();

    const lista = buscar(termo);

    resultados.innerHTML = lista.slice(0,10).map(r => `
  <a href="receita.html?slug=${r.s.slug}" class="resultado-item">

    ${r.t}
  </a>
`).join("");

  });

});