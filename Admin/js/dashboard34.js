// ============================
// dashboard.js – versão corrigida FINAL
// ============================

console.log("dashboard.js carregado");

let receitaIdAtual = null;
let relacionadasSelecionadas = [];
let tituloOriginal = null;
let slugOriginal = null;

// API
const API = window.location.origin;
//<link rel="icon" href="/favicon.ico">

// ELEMENTOS
const listaReceitas = document.getElementById("listaReceitas");
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
const tipo = document.getElementById("tipo");

const tipoMenu = document.getElementById("tipoMenu");

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

let todasReceitas = [];
let receitaAtual = null;

//if (localStorage.getItem("nutri_admin") !== "true") {
//  window.location.href = "/admin-login";
//}

// ============================
// CARREGAR RECEITAS
// ============================

async function carregarReceitas() {
  try {
    const res = await fetch(`${API}/receitas`);

    console.log("Status API:", res.status);

    const data = await res.json();

    console.log("Receitas:", data);

    todasReceitas = data;

    renderizarLista(data);

  } catch (err) {
    console.error("Erro real:", err);
  }
}

// Função para renderizar
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

// Função para adicionar relacionadas - inserida 20/03/2026
function adicionarRelacionadaAutomatica(r) {

  const bloco = document.createElement("div");
  bloco.classList.add("relacionada");

  bloco.innerHTML = `
    <input class="nomeRelacionada" value="${r.titulo}">
    <input class="slugRelacionada" value="${r.slug}">
    <input class="imagemRelacionada" value="${r.imagem || ""}">
  `;

  document
    .getElementById("relacionadasContainer")
    .appendChild(bloco);
}
//============
//Atribuir valor do tipo para o menu - Captura os dois elementos -->
          
    const selectSubcat = document.getElementById('Subcategoria');
    const inputTipo = document.getElementById('tipo');

   //Adiciona o evento de mudança ao select -->
         if (selectSubcat && inputTipo) {
          selectSubcat.addEventListener('change', function() {
          //Atribui o valor do select ao valor do input -->
              inputTipo.value = this.value;
          });
        }

//========================
// Tipo
 const selectTipo = document.getElementById('tipo');
    const inputTipoMenu = document.getElementById('tipoMenu');

    if (selectTipo && inputTipoMenu) {
        selectTipo.addEventListener('change', function() {
            // Atribui o valor do select ao input
            inputTipoMenu.value = this.value;
        });
  }

// Função fazer upload da imagem

  // ======================
//🖼️ PREVIEW IMAGEM
//====================== */
imagemInput.addEventListener("change", () => {
  const file = imagemInput.files[0];
  if (!file) return;
  previewImagem.src = URL.createObjectURL(file);
  previewImagem.style.display = "block";
});

//* ======================
//⬆️ UPLOAD IMAGEM - Alterada 25/03/2026
//====================== */

function uploadImagem() {
  const imagemInput = document.getElementById("imagemInput");
  const status = document.getElementById("uploadStatus");

  if (imagemInput && previewImagem) {
  imagemInput.addEventListener("change", () => {
    const file = imagemInput.files[0];
    if (!file) return;

    previewImagem.src = URL.createObjectURL(file);
    previewImagem.style.display = "block";
  });
}

  const arquivo = imagemInput.files[0];
  const nomeDoArquivo = arquivo.name;

  // ✅ SALVA NO DATASET (ESSENCIAL)
  imagemInput.dataset.filename = nomeDoArquivo;

  status.innerText = `Imagem "${nomeDoArquivo}" pronta!`;
  status.style.color = "green";

  console.log("Imagem salva no dataset:", imagemInput.dataset.filename);
}

// ============================
// ABRIR RECEITA - Atualizada 20/03/2026 19h15m
// ============================

async function abrirReceita(slug) {

 
  const res = await fetch(`${API}/receitas/${slug}`);
  const receita = await res.json();

  receitaAtual = receita.slug;
  receitaIdAtual = receita.id;
;

  if (!titulo.value.trim()) {
  return ExibirMensagem("Título é obrigatório", "erro");
  }

 tituloOriginal = receita.titulo;
  slugOriginal = receita.slug;
  
  editor.style.display = "block";

  const ultima = receita.versoes?.at(-1)?.conteudo || {};

  // =========================
  // CAMPOS SIMPLES
  // =========================

  titulo.value = receita.titulo || "";
  tags.value = (receita.tags || []).join(", ");
  topSemana.value = receita.topSemana || "";
  premium.value = receita.premium || "";

  tipo.value = receita.tipo || "";

  tipoMenu.value = receita.tipoMenu || "";
  categoria.value = receita.categoria || "";
  subcategoria.value = receita.subcategoria || "";

  tempoPreparoReceita.value = ultima.tempoPreparoReceita || "";
  tempoPreparoForno.value = ultima.tempoPreparoForno || "";
  tempoPreparoTotal.value = ultima.tempoPreparoTotal || "";

  rendimento.value = ultima.rendimento || "";
  dificuldade.value = ultima.dificuldade || "";
  custoMedio.value = ultima.custoMedio || "";
  enviadaPor.value = ultima.enviadaPor || "";
  comoServir.value = ultima.comoServir || "";

  // =========================
  // LIMPAR LISTAS ANTES
  // =========================

   document.getElementById("listaConservacao").innerHTML = "";
  document.getElementById("listaMise").innerHTML = "";
  document.getElementById("listaIngredientes").innerHTML = "";
  document.getElementById("listaPreparo").innerHTML = "";
  document.getElementById("listaComprasContainer").innerHTML = "";

  // =========================
  // CONSERVAÇÃO
  // =========================

  (ultima.conservacao || []).forEach(item => {
    addConservacao(item);
  });

 // =========================
  // MISE EN PLACE
  // =========================

  (ultima.miseEnPlace || []).forEach(item => {
    adicionarMise(item);
  });

  // =========================
  // PREENCHER INGREDIENTES
  // =========================

  (ultima.ingredientes || []).forEach(item => {
    adicionarIngrediente(item);
  });

  // =========================
  // PREENCHER PREPARO
  // =========================

  (ultima.preparo || []).forEach(item => {
    adicionarPasso(item);
  });
  // =========================
  // LISTA DE COMPRAS
  // =========================

  (ultima.listaCompras || []).forEach(item => {
    addCompra(item);
  });

  // =========================
  // RELACIONADAS
  // =========================

  relacionadasContainer.innerHTML = "";

  (receita.relacionadas || []).forEach(r => {
    adicionarRelacionadaAutomatica(r);
  });

  // =========================
  // SUGESTÕES AUTOMÁTICAS
  // =========================

    sugerirRelacionadas(receita.categoria, receita.tags);
  }

// ============================
// SUGESTÕES AUTOMÁTICAS COM MINIATURA, CATEGORIA E TEMPO
// - Inserida 04/03/2026
// ============================
function sugerirRelacionadas(receitaAtualDados) {
  sugestoesAutomaticas.innerHTML = "";

  const categoriaAtual = receitaAtualDados.receita?.at(-1)?.receita?.categoria;
  const tagsAtual = receitaAtualDados.tags || [];

  const relacionadas = todasReceitas.filter(r => {
    if (r.slug === receitaAtualDados.slug) return false;

    const mesmaCategoria =
      r.receita?.at(-1)?.receita?.categoria === categoriaAtual;

    const mesmasTags =
      r.tags?.some(tag => tagsAtual.includes(tag));

    return mesmaCategoria || mesmasTags;
  });

  // Atualizada 20/03/2026  15h40m
  relacionadas.slice(0,6).forEach(r => {

  const categoria = r.receita?.at(-1)?.receita?.categoria;
  const tempo = r.versoes?.at(-1)?.conteudo?.tempoPreparoTotal;

  const img = r.imagem
    ? `/imagens/receitas/${r.imagem}`
    : `/imagens/placeholder.jpg`;

  const item = document.createElement("div");
  item.classList.add("cardSugestao");

  item.innerHTML = `
    <img src="${img}" alt="${r.titulo}" />

    <div class="infoSugestao">
      <h4>${r.titulo}</h4>
      <span class="categoria">${categoria || ''}</span>
      <span class="tempo">${tempo || ''}</span>
    </div>

    <button type="button" class="btnAdicionarSugestao">Adicionar</button>
  `;

    item.querySelector(".btnAdicionarSugestao").onclick = () => {
      adicionarRelacionadaAutomatica(r);
    };

    sugestoesAutomaticas.appendChild(item);
  });
}
// ============================
// SALVAR RECEITA - Atualizada 20/03/2026
// ============================

async function salvarReceita(status) {

  // =========================
  // CAPTURAR LISTAS DINÂMICAS
  // =========================

  const conservacao = Array.from(
    document.querySelectorAll('#listaConservacao input')
  ).map(i => i.value).filter(v => v);

  const miseEnPlace = Array.from(
    document.querySelectorAll('#listaMise input')
  ).map(i => i.value).filter(v => v);

  const ingredientes = Array.from(
    document.querySelectorAll('#listaIngredientes input')
  ).map(i => i.value).filter(v => v);

  const preparo = Array.from(
    document.querySelectorAll('#listaPreparo textarea')
  ).map(i => i.value).filter(v => v);

  const listaCompras = Array.from(
    document.querySelectorAll('#listaComprasContainer input')
  ).map(i => i.value).filter(v => v);

  // =========================
  // RELACIONADAS
  // =========================

  const relacionadas = Array.from(
    document.querySelectorAll(".relacionada")
  ).map(bloco => ({
    titulo: bloco.querySelector(".nomeRelacionada")?.value || "",
    slug: bloco.querySelector(".slugRelacionada")?.value || "",
    imagem: bloco.querySelector(".imagemRelacionada")?.value || ""
  })).filter(r => r.slug);

  // =========================
  // OBJETO RECEITA
  // =========================
  const nomeImagem =
  document.getElementById("imagemInput")?.dataset?.filename || "";

  const receita = {

    id: receitaIdAtual || crypto.randomUUID(),
   // slug: gerarSlug(titulo.value),
   // tentar deixar o mesmo slug ao editar - 24/03/2026
   
    slug: (
      !receitaIdAtual
      ? gerarSlug(titulo.value) // nova receita
      : titulo.value !== tituloOriginal
        ? gerarSlug(titulo.value) // mudou título
        : slugOriginal // mantém slug
    ),

    titulo: titulo.value,
    status: status,

    imagem: nomeImagem,

   // topSemana: topSemana.checked,
    //premium: premium.checked,

   topSemana: topSemana?.checked || false,
   premium: premium?.checked || false,

    tags: tags.value
      ? tags.value.split(",").map(t => t.trim())
      : [],

    restricoes: restricoes.value
      ? restricoes.value.split(",").map(r => r.trim())
      : [],

    tipo: tipo.value,
    tipoMenu: tipoMenu?.value || "",

    categoria: categoria.value,
    subcategoria: subcategoria.value,

    autor: {
      nome: nome.value,
      credencial: credencial.value,
      registro: registro.value
    },

    avaliacoes: {
      media: "0",
      total: "0"
    },

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
       
        conservacao,
       
        miseEnPlace,
        ingredientes,
        preparo,
     
        nutricional: {
          porcao: porcao.value,
          calorias: calorias.value,
          carboidratos: carboidratos.value,
          proteinas: proteinas.value,
          gordurasTotais: gordurasTotais.value,
          gordurasSaturadas: gordurasSaturadas.value,
          fibras: fibras.value,
          sodio: sodio.value,
          acucar: acucar.value
        },

       // substituicoes: substituicoes?.value || "",
       //  dicas: dicas?.value || "",

          substituicoes: getLista("substituicoes"),
          dicas: getLista("dicas"),

         comentarioNutri: comentarioNutri.value,
         listaCompras,
      }
    }]
        
  };

  // =========================
  // ENVIO  - Atualizada 24/03/2026 - 
  // alterada de receitaAtual para receitaIdAtual
  // =========================

  try {

    const metodo = receitaIdAtual ? "PUT" : "POST";

    const url = receitaIdAtual
  ? `${API}/receitas/id/${receitaIdAtual}` // ✅
  : `${API}/receitas`;

  //  console.log("URL:", url);
//console.log("Método:", metodo);

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receita)
    });

    const data = await res.json().catch(() => null);

    //pegar id para autosalvamento - 25/03/2026
    if (!receitaIdAtual && data?.id) {
        receitaIdAtual = data.id;
      }

    if (!res.ok) {
      console.error("Erro backend:", data);
      throw new Error("Erro ao salvar");
    }

    toast("Receita salva com sucesso!", "aviso")
   // alert("Receita salva com sucesso!");
    carregarReceitas();

  } catch (e) {
    console.error(e);
    ExibirMensagem("Erro ao salvar receita", "erro");
    //alert("Erro ao salvar receita");
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

/* =========================
   HELPERS
========================= */
function getLista(id) {
  return document.getElementById(id).value
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);
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
      <button type="button" onclick="removerRelacionada('${slug}')">❌</button>
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
// crescentar Preparo - Inserida 08/03/2026 01h10

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
// Acrescentar Mise en place  - Inserida 08/03/2026 01h14
function adicionarMise(valor=""){

const div = document.createElement("div");

div.innerHTML = `
<input name="miseEnPlace[]" value="${valor}" placeholder="Digite aqui..." style="width: 450px;">
<button type="button" onclick="this.parentElement.remove()">❌</button>
`;

document.getElementById("listaMise").appendChild(div);

}

//============================
// Acrescentar Conservação - Inserida 08/03/2026 01h14

function addConservacao(valor=""){

const div = document.createElement("div");

div.innerHTML = `
<input name="conservacao[]" value="${valor}" placeholder="Digite aqui..." style="width: 450px;">
<button type="button" onclick="this.parentElement.remove()">❌</button>
`;

document.getElementById("listaConservacao").appendChild(div);

}

//============================
// Acrescentar Lista de compras - Inserida 08/03/2026 01h19

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

//==============
//SCRIPT DAS ABAS - Inserida 06/03/2026 - Atualizada 08/03/2026
//==========================

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

// ============================
// NOVA RECEITA
// ============================

document.getElementById("novaReceita").onclick = () => {
  receitaAtual = null;

  document.getElementById("formReceita").reset();

  editor.style.display = "block";
};

// ============================
// INIT
// ============================

document.addEventListener("DOMContentLoaded", () => {
  carregarReceitas();
});

// Botão Preview - Criada em 14/02/26 - reinserida 25/03/2026
function previewReceita() {
  const texto = `
🍲 ${titulo.value}

📌 Categoria: ${categoria.value}

🧾 Ingredientes:
${Array.from(document.querySelectorAll('#listaIngredientes input'))
  .map(i => i.value).join('\n')}

👨‍🍳 Preparo:
${Array.from(document.querySelectorAll('#listaPreparo textarea'))
  .map(i => i.value).join('\n')}
  `;

  alert(texto);
}

//------------------------
//Duplicar receita - Inserida 25/03/2026

function duplicarReceita() {

  if (!receitaAtual) return;

  receitaIdAtual = null;
  receitaAtual = null;

  titulo.value += " (cópia)";

  alert("Receita duplicada! Agora salve como nova.");
}

//=======================
// AUTO SALVAR RASCUNHO (TOP FEATURE) - Inserida 25/03/2026

let timeoutAutoSave;

document.addEventListener("input", () => {

  clearTimeout(timeoutAutoSave);

  timeoutAutoSave = setTimeout(() => {

    // Só salva se tiver título (evita lixo)
    if (!titulo.value.trim()) return;

    console.log("Auto salvando rascunho...");

    salvarReceita("rascunho");

  }, 5000); // aumentei pra 5s (melhor UX)

});