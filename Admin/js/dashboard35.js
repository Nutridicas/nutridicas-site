// ============================
// DASHBOARD FINAL - PRODUÇÃO
// ============================

console.log("Dashboard carregado");

// ============================
// ESTADO GLOBAL
// ============================

const API = window.location.origin;

let todasReceitas = [];
let receitaIdAtual = null;
let slugOriginal = null;
let tituloOriginal = null;

// ============================
// ELEMENTOS
// ============================

const listaReceitas = document.getElementById("listaReceitas");
const editor = document.getElementById("editorReceita");

const titulo = document.getElementById("titulo");
const tags = document.getElementById("tags");
const categoria = document.getElementById("categoria");
const subcategoria = document.getElementById("subcategoria");
const tipo = document.getElementById("tipo");
const tipoMenu = document.getElementById("tipoMenu");

const topSemana = document.getElementById("topSemana");
const premium = document.getElementById("premium");

const tempoPreparoReceita = document.getElementById("tempoPreparoReceita");
const tempoPreparoForno = document.getElementById("tempoPreparoForno");
const tempoPreparoTotal = document.getElementById("tempoPreparoTotal");

const rendimento = document.getElementById("rendimento");
const dificuldade = document.getElementById("dificuldade");
const custoMedio = document.getElementById("custoMedio");
const enviadaPor = document.getElementById("enviadaPor");
const comoServir = document.getElementById("comoServir");

const comentarioNutri = document.getElementById("comentarioNutri");

const relacionadasContainer = document.getElementById("relacionadasContainer");
const sugestoesAutomaticas = document.getElementById("sugestoesAutomaticas");

// ============================
// INIT
// ============================

document.addEventListener("DOMContentLoaded", () => {
  carregarReceitas();
  iniciarAbas();
  initUploadImagem();
});

// ============================
// API
// ============================

async function carregarReceitas() {
  try {
    const res = await fetch(`${API}/receitas`);
    const data = await res.json();

    todasReceitas = data;
    renderizarLista(data);

  } catch (err) {
    console.error("Erro ao carregar receitas:", err);
  }
}

function renderizarLista(receitas) {
  listaReceitas.innerHTML = "";

  receitas.forEach(r => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${r.titulo}
      <span>${r.status}</span>
    `;

    li.onclick = () => abrirReceita(r.slug);

    listaReceitas.appendChild(li);
  });
}

// ============================
// ABRIR RECEITA
// ============================

async function abrirReceita(slug) {
  const res = await fetch(`${API}/receitas/${slug}`);
  const receita = await res.json();

  receitaIdAtual = receita.id;
  slugOriginal = receita.slug;
  tituloOriginal = receita.titulo;

  editor.style.display = "block";

  const ultima = receita.versoes?.at(-1)?.conteudo || {};

  // campos simples
  titulo.value = receita.titulo || "";
  tags.value = (receita.tags || []).join(", ");
  categoria.value = receita.categoria || "";
  subcategoria.value = receita.subcategoria || "";
  tipo.value = receita.tipo || "";
  tipoMenu.value = receita.tipoMenu || "";

  topSemana.checked = receita.topSemana || false;
  premium.checked = receita.premium || false;

  tempoPreparoReceita.value = ultima.tempoPreparoReceita || "";
  tempoPreparoForno.value = ultima.tempoPreparoForno || "";
  tempoPreparoTotal.value = ultima.tempoPreparoTotal || "";

  rendimento.value = ultima.rendimento || "";
  dificuldade.value = ultima.dificuldade || "";
  custoMedio.value = ultima.custoMedio || "";
  enviadaPor.value = ultima.enviadaPor || "";
  comoServir.value = ultima.comoServir || "";

  // limpar listas
  limparListas();

  // preencher listas
  (ultima.ingredientes || []).forEach(adicionarIngrediente);
  (ultima.preparo || []).forEach(adicionarPasso);
  (ultima.conservacao || []).forEach(addConservacao);
  (ultima.miseEnPlace || []).forEach(adicionarMise);
  (ultima.listaCompras || []).forEach(addCompra);

  // relacionadas
  relacionadasContainer.innerHTML = "";
  (receita.relacionadas || []).forEach(adicionarRelacionadaAutomatica);

  sugerirRelacionadas(receita);
}

// ============================
// SALVAR
// ============================

async function salvarReceita(status) {

  const ingredientes = getInputs("#listaIngredientes input");
  const preparo = getInputs("#listaPreparo textarea");
  const conservacao = getInputs("#listaConservacao input");
  const miseEnPlace = getInputs("#listaMise input");
  const listaCompras = getInputs("#listaComprasContainer input");

  const relacionadas = Array.from(
    document.querySelectorAll(".relacionada")
  ).map(b => ({
    titulo: b.querySelector(".nomeRelacionada")?.value,
    slug: b.querySelector(".slugRelacionada")?.value,
    imagem: b.querySelector(".imagemRelacionada")?.value
  })).filter(r => r.slug);

  const inputImagem = document.getElementById("imagemInput");

  const nomeImagem =
    inputImagem?.dataset?.filename ||
    window.imagemAtual ||
    "";

  const receita = {
    id: receitaIdAtual || crypto.randomUUID(),

    slug: !receitaIdAtual
      ? gerarSlug(titulo.value)
      : titulo.value !== tituloOriginal
        ? gerarSlug(titulo.value)
        : slugOriginal,

    titulo: titulo.value,
    status,

    imagem: nomeImagem,

    topSemana: topSemana.checked,
    premium: premium.checked,

    tags: tags.value ? tags.value.split(",").map(t => t.trim()) : [],

    categoria: categoria.value,
    subcategoria: subcategoria.value,
    tipo: tipo.value,
    tipoMenu: tipoMenu?.value || "",

    relacionadas,

    versoes: [{
      data: new Date().toISOString(),
      conteudo: {
        tempoPreparoReceita: tempoPreparoReceita.value,
        tempoPreparoForno: tempoPreparoForno.value,
        tempoPreparoTotal: tempoPreparoTotal.value,

        rendimento: rendimento.value,
        dificuldade: dificuldade.value,
        custoMedio: custoMedio.value,
        enviadaPor: enviadaPor.value,
        comoServir: comoServir.value,

        ingredientes,
        preparo,
        conservacao,
        miseEnPlace,
        listaCompras,

        comentarioNutri: comentarioNutri.value
      }
    }]
  };

//Envio 

  try {
    const metodo = receitaAtual ? "PUT" : "POST";

const url = receitaAtual
  ? `${API}/receitas/${receitaAtual}` // 👈 usa slug
  : `${API}/receitas`;

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receita)
    });

    if (!res.ok) throw new Error();

    window.imagemAtual = nomeImagem;

    alert("Receita salva!");
    carregarReceitas();

  } catch (e) {
    console.error(e);
    alert("Erro ao salvar");
  }
}

// ============================
// BUSCA
// ============================

function filtrarReceitas() {

  if (!Array.isArray(todasReceitas)) return;

  const busca = document
    .getElementById("buscaReceita")
    .value.toLowerCase();

  const filtro = document
    .getElementById("filtroStatus")
    .value;

  const receitasFiltradas = todasReceitas.filter(r => {

    const bateBusca = r.titulo
      ?.toLowerCase()
      .includes(busca);

    const bateFiltro =
      filtro === "todas" || r.status === filtro;

    return bateBusca && bateFiltro;
  });

  renderizarLista(receitasFiltradas);

  document.getElementById("contadorReceitas")
    .innerText = `Total: ${receitasFiltradas.length} receitas`;
}
// ============================
// HELPERS
// ============================

function getInputs(selector) {
  return Array.from(document.querySelectorAll(selector))
    .map(i => i.value)
    .filter(Boolean);
}

function limparListas() {
  document.getElementById("listaIngredientes").innerHTML = "";
  document.getElementById("listaPreparo").innerHTML = "";
  document.getElementById("listaConservacao").innerHTML = "";
  document.getElementById("listaMise").innerHTML = "";
  document.getElementById("listaComprasContainer").innerHTML = "";
}

//================
// Buscar relacionadas - Inserida 07/03/2026
// Atualizada 20/03/2026 - 00h20m

function buscarRelacionadas() {

  const busca = document
    .getElementById("buscarRelacionada")
    .value.toLowerCase();

  const container = document.getElementById("sugestoesRelacionadas");

  container.innerHTML = "";

  if (!busca) return;

  const resultados = todasReceitas.filter(r =>
    r.titulo?.toLowerCase().includes(busca)
  );

  resultados.slice(0,5).forEach(r => {

    const div = document.createElement("div");
    div.innerText = r.titulo;

    div.onclick = () => {
      adicionarRelacionadaAutomatica(r);
    };

    container.appendChild(div);
  });
}

// ============================
// RELACIONADAS
// ============================

function adicionarRelacionadaAutomatica(r) {
  const div = document.createElement("div");

  div.classList.add("relacionada");

  div.innerHTML = `
    <input class="nomeRelacionada" value="${r.titulo}">
    <input class="slugRelacionada" value="${r.slug}">
    <input class="imagemRelacionada" value="${r.imagem || ""}">
  `;

  relacionadasContainer.appendChild(div);

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
      <button type="button" onclick="removerRelacionada('${slug}')">❌</button>
    `;

    lista.appendChild(li);

  });

}

// ============================
// SUGESTÕES
// ============================

function sugerirRelacionadas(receitaAtual) {

  sugestoesAutomaticas.innerHTML = "";

  const relacionadas = todasReceitas.filter(r => {
    if (r.slug === receitaAtual.slug) return false;

    return (
      r.categoria === receitaAtual.categoria ||
      r.tags?.some(t => receitaAtual.tags?.includes(t))
    );
  });

    const img = r.imagem
    ? `/imagens/receitas/${r.imagem}`
    : `/imagens/placeholder.jpg`;

  relacionadas.slice(0, 6).forEach(r => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h4>${r.titulo}</h4>
      <img src="${img}" alt="${r.titulo}" />
      <button type="button">Adicionar</button>
    `;

    div.querySelector("button").onclick = () => {
      adicionarRelacionadaAutomatica(r);
    };

    sugestoesAutomaticas.appendChild(div);
  });
}

//================
// remover relacionadas selecionadas - Inserida 07/03/2026

function removerRelacionada(slug){

  relacionadasSelecionadas =
    relacionadasSelecionadas.filter(r => r !== slug);

  atualizarListaRelacionadas();

}

// ============================
// LISTAS DINÂMICAS
// ============================

function adicionarIngrediente(v = "") {
  criarInput("listaIngredientes", "Ingrediente", v);
}

function adicionarPasso(v = "") {
  criarTextarea("listaPreparo", v);
}

function adicionarMise(v = "") {
  criarInput("listaMise", "Mise en place", v);
}

function addConservacao(v = "") {
  criarInput("listaConservacao", "Conservação", v);
}

function addCompra(v = "") {
  criarInput("listaComprasContainer", "Item", v);
}

function criarInput(container, placeholder, value) {
  const div = document.createElement("div");

  div.innerHTML = `
    <input value="${value}" placeholder="${placeholder}">
    <button type="button" onclick="this.parentElement.remove()">❌</button>
  `;

  document.getElementById(container).appendChild(div);
}

function criarTextarea(container, value) {
  const div = document.createElement("div");

  div.innerHTML = `
    <textarea>${value}</textarea>
    <button type="button" onclick="this.parentElement.remove()">❌</button>
  `;

  document.getElementById(container).appendChild(div);
}

// ============================
// SLUG
// ============================

function gerarSlug(texto) {
  return texto.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

// ============================
// ABAS
// ============================

function iniciarAbas() {
  const botoes = document.querySelectorAll(".admin-tabs button");

  botoes.forEach(btn => {
    btn.addEventListener("click", () => {

      document.querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

      document.querySelectorAll(".admin-tabs button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      const aba = document.getElementById(btn.dataset.tab);

      if (aba) aba.classList.add("active");
    });
  });
}

// ============================
// UPLOAD IMAGEM
// ============================

function initUploadImagem() {
  const input = document.getElementById("imagemInput");
  const preview = document.getElementById("previewImagem");

  if (!input || !preview) return;

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    input.dataset.filename = file.name;
  });
}

// ============================
// AUTOSAVE
// ============================

let timeout;

document.addEventListener("input", () => {
  if (!titulo.value.trim()) return;

  clearTimeout(timeoutAutoSave);

  timeoutAutoSave = setTimeout(() => {
    salvarReceita("rascunho");
  }, 3000);
});