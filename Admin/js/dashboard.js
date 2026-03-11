// ùltim atualização 04/03/2026
// ============================
// dashboard.js – versão final com melhorias 04/03/2026
// ============================

console.log("dashboard.js carregado");
// API e receitas
const API =  window.location.origin; 
const listaReceitas = document.getElementById("listaReceitas");

let todasReceitas = [];
let relacionadasSelecionadas = [];

// Carregar todas receitas - Atualizada em 06/03/2026

async function carregarReceitas() {

  const res = await fetch(`${API}/receitas`);
  todasReceitas = await res.json();

  filtrarReceitas();

}

carregarReceitas();

// Campos do editor
const editor = document.getElementById("editorReceita");
const titulo = document.getElementById("titulo");
const topSemana = document.getElementById("topSemana");
const premium = document.getElementById("premium");
const tags = document.getElementById("tags");
const restricoes = document.getElementById("restricoes");
const nome = document.getElementById("nome");
const credencial = document.getElementById("credencial");
const registro = document.getElementById("registro");
const categoria = document.getElementById("categoria");
const subcategoria = document.getElementById("subcategoria");

const tempoPreparoTotal = document.getElementById("tempoPreparoTotal");
const relacionadasContainer = document.getElementById("relacionadasContainer");
const sugestoesAutomaticas = document.getElementById("sugestoesAutomaticas");

let receitaAtual = null;

// ============================
// ADICIONAR RELACIONADA MANUAL - Inserida 04/03/2026
// ============================
function adicionarRelacionada() {
  const total = relacionadasContainer.querySelectorAll(".relacionada").length;
  if (total >= 4) {
    alert("Máximo de 4 receitas relacionadas");
    return;
  }

  const bloco = document.createElement("div");
  bloco.classList.add("relacionada");

  bloco.innerHTML = `
    <p><strong>Nome</strong></p>
    <input class="nomeRelacionada" placeholder="Nome da Receita">
    <div class="sugestoesRelacionadas"></div>

    <p><strong>Slug</strong></p>
    <input class="slugRelacionada" placeholder="slug da receita">

    <p><strong>Imagem</strong></p>
    <input class="imagemRelacionada" placeholder="imagem.jpg">
  `;

  relacionadasContainer.appendChild(bloco);
}

// ============================
// ADICIONAR RELACIONADA AUTOMÁTICA - 
//Inserida 04/03/2026 / Atualizada 06/03/2026
// ============================

function adicionarRelacionadaAutomatica(r) {

  const total = relacionadasContainer.querySelectorAll(".relacionada").length;

  if (total >= 4) {
    alert("Máximo de 4 relacionadas");
    return;
  }

  const titulo = r.titulo || r.nome || "";
  const slug = r.slug || "";
  const imagem = r.imagem || "";

  const bloco = document.createElement("div");
  bloco.classList.add("relacionada");

  bloco.innerHTML = `
    <p><strong>Nome</strong></p>
    <input class="nomeRelacionada" value="${titulo}">

    <div class="sugestoesRelacionadas"></div>

    <p><strong>Slug</strong></p>
    <input class="slugRelacionada" value="${slug}" readonly>

    <p><strong>Imagem</strong></p>
    <input class="imagemRelacionada" value="${imagem}" readonly>
  `;

  relacionadasContainer.appendChild(bloco);
}

// ============================
// AUTOCOMPLETE AO DIGITAR NOME  DA RELACIONADA
// - Inserida 04/03/2026
// ============================
document.addEventListener("input", function(e) {
  if (!e.target.classList.contains("nomeRelacionada")) return;

  const termo = e.target.value.toLowerCase();
  const bloco = e.target.closest(".relacionada");
  const caixaSugestoes = bloco.querySelector(".sugestoesRelacionadas");
  caixaSugestoes.innerHTML = "";

  if (termo.length < 2) return;

 const resultados = todasReceitas
  .filter(r => r.titulo?.toLowerCase().includes(termo))
  .slice(0,5);

  resultados.forEach(r => {
    const item = document.createElement("div");
    item.className = "sugestao-item";
    item.textContent = r.titulo;
    item.onclick = function() {
      bloco.querySelector(".nomeRelacionada").value = r.titulo;
      bloco.querySelector(".slugRelacionada").value = r.slug;
      bloco.querySelector(".imagemRelacionada").value = r.imagem || "";
      caixaSugestoes.innerHTML = "";
    };
    caixaSugestoes.appendChild(item);
  });
});

// ============================
// SUGESTÕES AUTOMÁTICAS COM MINIATURA, CATEGORIA E TEMPO
// - Inserida 04/03/2026
// ============================
function sugerirRelacionadas(receitaAtualDados) {
  sugestoesAutomaticas.innerHTML = "";

  const categoriaAtual = receitaAtualDados.versoes?.at(-1)?.conteudo?.categoria;
  const tagsAtual = receitaAtualDados.tags || [];

  const relacionadas = todasReceitas.filter(r => {
    if (r.slug === receitaAtualDados.slug) return false;

    const mesmaCategoria =
      r.versoes?.at(-1)?.conteudo?.categoria === categoriaAtual;

    const mesmasTags =
      r.tags?.some(tag => tagsAtual.includes(tag));

    return mesmaCategoria || mesmasTags;
  });

  // Atualizada 05/03/2026 
   relacionadas.slice(0,6).forEach(r => {

    const img = r.imagem
      ? `/imagens/receitas/${r.imagem}`
      : `/imagens/placeholder.jpg`;

    const item = document.createElement("div");
    item.classList.add("cardSugestao");

    item.innerHTML = `
      <img src="${img}" alt="${r.titulo}" />

      <div class="infoSugestao">
        <h4>${r.titulo}</h4>
        <span class="categoria">${r.versoes.at(-1).conteudo.categoria || ''}</span>
        <span class="tempo">${r.versoes.at(-1).conteudo.tempoPreparoTotal || ''}</span>
      </div>

      <button class="btnAdicionarSugestao">Adicionar</button>
    `;

    item.querySelector(".btnAdicionarSugestao").onclick = () => {
      adicionarRelacionadaAutomatica(r);
    };

    sugestoesAutomaticas.appendChild(item);
  });
}


//=========================
//  LISTAR - Reinserida 06/03/2026
//========================= */
async function carregarReceitas() {

  const res = await fetch(`${API}/receitas`);
  const receitas = await res.json();

  listaReceitas.innerHTML = "";

  receitas.forEach(r => {

    const li = document.createElement("li");

    const statusClass = r.status === "publicado"
    ? "status-publicado"
    : "status-rascunho";

    li.innerHTML = `
      ${r.titulo}
      <span class="status">${r.status}</span>
    `;

    li.onclick = () => abrirReceita(r.slug);

    listaReceitas.appendChild(li);

    // Botão dúplicar receita - Inserida 08/03/2026
    li.innerHTML = `
    ${r.titulo}
    <span class="status">${r.status}</span>

    <button onclick="duplicarReceita('${r.slug}')">
    Duplicar
    </button>
`;

  });

}


// ============================
// ABRIR RECEITA - Atualizada 06/03/2026
// ============================
async function abrirReceita(slug) {
  const res = await fetch(`${API}/receitas/${slug}`);
  const receita = await res.json();

  receitaAtual = slug;

  editor.style.display = "block";

  const ultimaVersao = receita.versoes?.at(-1)?.conteudo || {};

  titulo.value = receita.titulo || "";
  premium.checked = receita.premium || false;
  topSemana.checked = receita.topSemana || false;

  tags.value = (receita.tags || []).join(", ");

  categoria.value = ultimaVersao.categoria || "";
   subcategoria.value = conteudo.subcategoria || "";

  tempoPreparoTotal.value = ultimaVersao.tempoPreparoTotal || "";

  relacionadasContainer.innerHTML = "";

  (receita.relacionadas || []).forEach(rel => {
    adicionarRelacionadaAutomatica(rel);
  });

  sugerirRelacionadas(receita);
}

// ============================
// SALVAR RECEITA (com relacionadas) - Atualizada 06/03/2026
// ============================

async function salvarReceita(status){

    const nomeImagem =
    document.getElementById("imagemInput")?.dataset?.filename || "";

    const ingredientes = Array.from(
    document.querySelectorAll(".ingrediente")
    ).map(i => i.value);

    const preparo = Array.from(
    document.querySelectorAll(".passoPreparo")
    ).map(i => i.value);

    const miseEnPlace = Array.from(
    document.querySelectorAll(".miseItem")
    ).map(i => i.value);

    const conservacao = Array.from(
    document.querySelectorAll(".conservacaoItem")
    ).map(i => i.value);

    const medidas = Array.from(
    document.querySelectorAll(".medidaItem")
    ).map(i => i.value);

    const substituicoes = Array.from(
    document.querySelectorAll(".substituicaoItem")
    ).map(i => i.value);

    const dicas = Array.from(
    document.querySelectorAll(".dicaItem")
    ).map(i => i.value);

    const listaCompras = Array.from(
    document.querySelectorAll(".compraItem")
    ).map(i => i.value);

    const receita = {

    id: receitaAtual || crypto.randomUUID(),

    dataCriacao: new Date().toISOString(),

    slug: gerarSlug(titulo.value),

    titulo: titulo.value,

    status: status,

    imagem: nomeImagem,

    topSemana: topSemana.checked,

    premium: premium.checked,

    tags: tags.value
    ? tags.value.split(",").map(t => t.trim())
    : [],

    restricoes: restricoes.value
    ? restricoes.value.split(",").map(r => r.trim())
    : [],

    relacionadas: relacionadasSelecionadas,

    autor:{
    nome: autorNome.value,
    credencial: autorCredencial.value,
    registro: autorRegistro.value
    },

    avaliacoes:{
    media: "0",
    total: "0"
    },

    versoes:[{

    data: new Date().toISOString(),

    conteudo:{

    categoria: categoria.value,

    subcategoria: subcategoria.value,

    tempoPreparoReceita: tempoPreparoReceita.value,

    tempoPreparoForno: tempoPreparoForno.value,

    tempoPreparoTotal: tempoPreparoTotal.value,

    rendimento: rendimento.value,

    dificuldade: dificuldade.value,

    custoMedio: custoMedio.value,

    enviadaPor: enviadaPor.value,

    comoServir: comoServir.value,

    miseEnPlace,

    conservacao,

    ingredientes,

    preparo,

    medidas,

    substituicoes,

    dicas,

    comentarioNutri: comentarioNutri.value,

    listaCompras,

    nutricional:{
    porcao: porcao.value,
    calorias: calorias.value,
    carboidratos: carboidratos.value,
    proteinas: proteinas.value,
    gordurasTotais: gordurasTotais.value,
    gordurasSaturadas: gordurasSaturadas.value,
    fibras: fibras.value,
    sodio: sodio.value,
    acucar: acucar.value
}

}

}]

};

try {
    // Verifique se receitaAtual é o ID ou o objeto todo
    const id = receitaAtual?.id || receitaAtual; 

     const metodo = id ? "PUT" : "POST";
    const url = id ? `${API}/receitas/${id}` : `${API}/receitas`;

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receita)
    });

    if (!res.ok) throw new Error("Erro ao salvar");

    alert("Receita salva com sucesso!");
    carregarReceitas();
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao salvar receita.");
  }
}

// ============================
// Gerar slug 
// ============================
function gerarSlug(texto) {
  return texto.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

// Inserida 06/03/2026 - Atualizada 08/03/2026

document
.getElementById("novaReceita")
.onclick = ()=>{

receitaAtual = null;

document
.getElementById("formReceita")
.reset();

editorReceita.style.display="block";

}

//==============
//SCRIPT DAS ABAS - Inserida 06/03/2026 - Atualizada 08/03/2026

document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".admin-tabs button");

  botoes.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove a classe 'active' de todos os botões
      document.querySelectorAll(".admin-tabs button")
        .forEach(b => b.classList.remove("active"));

      // Remove a classe 'active' de todas as abas
      document.querySelectorAll(".tab")
        .forEach(tab => tab.classList.remove("active"));

      // Adiciona 'active' ao botão clicado
      btn.classList.add("active");

      // Ativa a aba correspondente via data-tab
      const id = btn.dataset.tab;
      const aba = document.getElementById(id);

      if (aba) {
        aba.classList.add("active");
      }
    });
  });
});


//=======================
// Função filtrar receitas - Inserida 07/03/2026

function filtrarReceitas() {

  const busca = document.getElementById("buscaReceita").value.toLowerCase();
  const filtro = document.getElementById("filtroStatus").value;

  const listaReceitas = document.getElementById("listaReceitas");
  const contador = document.getElementById("contadorReceitas");

  listaReceitas.innerHTML = "";

  let receitasFiltradas = todasReceitas.filter(r => {

    const bateBusca = r.titulo.toLowerCase().includes(busca);

    const bateFiltro =
      filtro === "todas" ||
      r.status === filtro;

    return bateBusca && bateFiltro;

  });

  receitasFiltradas.forEach(r => {

    const li = document.createElement("li");

    const statusClass =
      r.status === "publicado"
        ? "status-publicado"
        : "status-rascunho";

    li.innerHTML = `
      ${r.titulo}
      <span class="${statusClass}">${r.status}</span>
    `;

    li.onclick = () => abrirReceita(r.slug);

    listaReceitas.appendChild(li);

    relacionadasSelecionadas = receita.relacionadas || [];

atualizarListaRelacionadas();

  });

  contador.innerText = `Total: ${receitasFiltradas.length} receitas`;

}

//================
// Buscar relacionadas - Inserida 07/03/2026

function buscarRelacionadas() {

  const busca = document
    .getElementById("buscarRelacionada")
    .value
    .toLowerCase();

  const container = document.getElementById("sugestoesRelacionadas");

  container.innerHTML = "";

  if (!busca) return;

  const resultados = todasReceitas.filter(r =>
    r.titulo.toLowerCase().includes(busca)
  );

  resultados.slice(0,5).forEach(r => {

    const div = document.createElement("div");

    div.innerText = r.titulo;

    div.onclick = () => adicionarRelacionada(r);

    container.appendChild(div);

  });

}

//================
// Adicionar relacionadas - Inserida 07/03/2026

function adicionarRelacionada(receita){

  if(relacionadasSelecionadas.includes(receita.slug)) return;

  relacionadasSelecionadas.push(receita.slug);

  atualizarListaRelacionadas();

}

//================
// Mostrar relacionadas selecionadas - Inserida 07/03/2026

function atualizarListaRelacionadas(){

  const lista = document.getElementById("listaRelacionadas");

  lista.innerHTML = "";

  relacionadasSelecionadas.forEach(slug => {

    const receita = todasReceitas.find(r => r.slug === slug);

    const li = document.createElement("li");

    li.innerHTML = `
      ${receita.titulo}
      <button onclick="removerRelacionada('${slug}')">❌</button>
    `;

    lista.appendChild(li);

  });

}

//================
// remover relacionadas selecionadas - Inserida 07/03/2026

function removerRelacionada(slug){

  relacionadasSelecionadas =
    relacionadasSelecionadas.filter(r => r !== slug);

  atualizarListaRelacionadas();

}

//=========================
// Acrescentar ingredientes - Inserida 08/03/2026 01h10
//

function adicionarIngrediente(valor = "") {

const div = document.createElement("div");

div.className = "linhaIngrediente";

div.innerHTML = `
<input name="ingredientes[]" value="${valor}" placeholder="Ingrediente">
<button type="button" onclick="this.parentElement.remove()">❌</button>
`;

document
.getElementById("listaIngredientes")
.appendChild(div);

}

//============================
// crescentar Prepato - Inserida 08/03/2026 01h10

function adicionarPasso(valor = "") {

const div = document.createElement("div");

div.className = "linhaPreparo";

div.innerHTML = `
<textarea name="preparo[]" rows="2">${valor}</textarea>
<button type="button" onclick="this.parentElement.remove()">❌</button>
`;

document
.getElementById("listaPreparo")
.appendChild(div);

} 

//============================
// crescentar Mise en place  - Inserida 08/03/2026 01h14
function adicionarMise(valor=""){

const div = document.createElement("div");

div.innerHTML = `
<input name="miseEnPlace[]" value="${valor}">
<button type="button" onclick="this.parentElement.remove()">❌</button>
`;

document.getElementById("listaMise").appendChild(div);

}

//============================
// crescentar Conservação - Inserida 08/03/2026 01h14

function addConservacao(valor=""){

const div = document.createElement("div");

div.innerHTML = `
<input name="conservacao[]" value="${valor}">
<button type="button" onclick="this.parentElement.remove()">❌</button>
`;

document.getElementById("listaConservacao").appendChild(div);

}

//============================
// crescentar Lista de compras - Inserida 08/03/2026 01h19

function addCompra(valor=""){

const div = document.createElement("div");

div.innerHTML = `
<input name="listaCompras[]" value="${valor}">
<button type="button" onclick="this.parentElement.remove()">❌</button>
`;

document
.getElementById("listaComprasContainer")
.appendChild(div);

}

// ==================
// Autosalvar rascunho - Inserida 08/03/2026 14h41m

setInterval(autoSalvar,30000);

function autoSalvar(){

if(!titulo.value) return;

const dados = {
titulo: titulo.value,
categoria: categoria.value,
tempo: tempoPreparoTotal.value
};

localStorage.setItem(
"rascunhoReceita",
JSON.stringify(dados)
);

console.log("Auto rascunho salvo");

}

// ==================
// Duplicar receitas - Inserida 08/03/2026 14h41m

async function duplicarReceita(slug){

const res =
await fetch(`/receitas/${slug}`);

const receita =
await res.json();

receita.slug =
gerarSlug(receita.titulo+"-copia");

receita.id = crypto.randomUUID();

receita.status = "rascunho";

await fetch("/receitas",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(receita)

});

carregarReceitas();

alert("Receita duplicada");

}