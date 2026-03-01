// Atualização 22/02/26


const API = "http://localhost:3000";

const imagemInput = document.getElementById("imagemInput");
const previewImagem = document.getElementById("previewImagem");
const btnUpload = document.getElementById("btnUpload");
const uploadStatus = document.getElementById("uploadStatus");

const editor = document.getElementById("editorReceita");
const listaReceitas = document.getElementById("listaReceitas");
const acoesEditor = document.getElementById("acoesEditor");

// Campos do .json - Receitas
const titulo = document.getElementById("titulo");
const topSemana = document.getElementById("topSemana");
const premium = document.getElementById("premium");
const tags = document.getElementById("tags");
const restricoes = document.getElementById("restricoes");

const nome = document.getElementById("nome");
const credencial = document.getElementById("credencial");
const registro = document.getElementById("registro");

const media = document.getElementById("media");
const total = document.getElementById("total");

const categoria = document.getElementById("categoria");
const tempoPreparoReceita = document.getElementById("tempoPreparoReceita");
const tempoPreparoForno = document.getElementById("tempoPreparoForno");
const tempoPreparoTotal = document.getElementById("tempoPreparoTotal");

const rendimento = document.getElementById("rendimento");
const dificuldade = document.getElementById("dificuldade");
const custoMedio = document.getElementById("custoMedio");
const enviadaPor = document.getElementById("enviadaPor");
const comoServir = document.getElementById("comoServir");

const ingredientes = document.getElementById("ingredientes");
const preparo = document.getElementById("preparo");
const miseEnPlace = document.getElementById("miseEnPlace");
const conservacao = document.getElementById("conservacao");
const medidas = document.getElementById("medidas");

const porcao = document.getElementById("porcao");
const calorias = document.getElementById("calorias");
const carboidratos = document.getElementById("carboidratos");
const proteinas = document.getElementById("proteinas");
const gordurasTotais = document.getElementById("gordurasTotais");
const gordurasSaturadas = document.getElementById("gordurasSaturadas");
const fibras = document.getElementById("fibras");
const sodio = document.getElementById("sodio");
const acucar = document.getElementById("acucar");

const substituicoes = document.getElementById("substituicoes");
const dicas = document.getElementById("dicas");
const comentario = document.getElementById("comentario");
const listaCompras = document.getElementById("listaCompras");

let receitaAtual = null;

/* =========================
   ABAS
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const botoes = document.querySelectorAll(".admin-tabs button");
  const abas = document.querySelectorAll(".tab");

  botoes.forEach(btn => {
    btn.addEventListener("click", () => {

      abas.forEach(sec => {
        sec.classList.remove("active");
        sec.style.display = "none";
      });

      botoes.forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      const alvo = document.getElementById(btn.dataset.tab);
      alvo.classList.add("active");
      alvo.style.display = "block";
    });
  });

  carregarReceitas();
});

/* =========================
   NOVA RECEITA
========================= */
document.getElementById("novaReceita").addEventListener("click", () => {

  receitaAtual = null;
  editor.style.display = "block";
  document.getElementById("editorTitulo").innerText = "Nova Receita";

  limparFormulario();

  acoesEditor.innerHTML = `
    <button onclick="salvarReceita('rascunho')" class="btn-gravar">Salvar Rascunho</button>
    <button onclick="salvarReceita('publicada')" class="btn-gravar">Publicar</button>
  `;
});

// ============================
// Função para validar se a receita está vazia- criada em 23/02/26
//===========================
function validarReceita(r) {

  if (!r.titulo || r.titulo.trim() === "") {
    // mensagem de alerta
      Swal.fire({
          title: 'Preenchar o campo!',
          text: 'Título obrigatório.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
    //alert("");
    return false;
  }

  if (!r.versoes[0].conteudo.ingredientes.length) {
    alert("Adicione ingredientes");
    return false;
  }

  return true;
}

//=========================
//   SALVAR RECEITAS - Atualizada em 22/02/26
//========================= 

async function salvarReceita(status) {

  try {

    // 🔹 pegar nome da imagem enviada
    const nomeImagem =
      document.getElementById("imagemInput").dataset.filename || "";

    // 🔹 montar objeto
     const receita = {
     id: crypto.randomUUID(),
      slug: gerarSlug(titulo.value),
      titulo: titulo.value,
      status: status,
      topSemana: topSemana.checked,
      premium: premium.checked,
      restricoes:getLista("restricoes"),
      tags: tags.value.split(",").map(t => t.trim()),
      imagem: nomeImagem,   // 👈 AQUI CORRETO

       autor: {
        nome: nome.value, 
        credencial: credencial.value,
        registro: registro.value
      },
      avaliacoes : {
        media: media.value,
        total: total.value
     },

      versoes: [{
        data: new Date().toISOString(),
        conteudo: {

          categoria: categoria.value,
          tempoPreparoReceita: tempoPreparoReceita.value,
          tempoPreparoForno: tempoPreparoForno.value,
          tempoPreparoTotal: tempoPreparoTotal.value,
          rendimento: rendimento.value,
          dificuldade: dificuldade.value,
          custoMedio: custoMedio.value,
          enviadaPor: enviadaPor.value,
          comoServir: comoServir.value,

          miseEnPlace: getLista("miseEnPlace"),
          conservacao: getLista("conservacao"),

          ingredientes: getLista("ingredientes"),
          preparo: getLista("preparo"),
          medidas: getLista("medidas"),

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

          substituicoes: getLista("substituicoes"),
          dicas: getLista("dicas"),
          comentarioNutri: comentario.value,
          listaCompras: getLista("listaCompras")
        }
      }]
    };

    // 🔹 validar antes de salvar
    if (!validarReceita(receita)) {
      return;
    }

    const metodo = receitaAtual ? "PUT" : "POST";
    const url = receitaAtual
      ? `${API}/receitas/${receitaAtual}`
      : `${API}/receitas`;

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receita)
    });

    if (!res.ok) {
      throw new Error("Erro ao salvar no servidor");
    }
     // mensagem de alerta
      Swal.fire({
          title: 'Sucesso!',
          text: 'Receita salva com sucesso!.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

    //alert("Receita salva com sucesso!");
    carregarReceitas();

  } catch (erro) {

    console.error("Erro ao salvar:", erro);
    alert("Erro ao salvar receita. Veja o console (F12).");

  }
}

// =========================
//   LISTAR - Carregar receitas
//========================= */
async function carregarReceitas() {

  const res = await fetch(`${API}/receitas`);
  const receitas = await res.json();

  listaReceitas.innerHTML = "";

  receitas.forEach(r => {
    const li = document.createElement("li");
    li.innerText = `${r.titulo} (${r.status})`;
    li.onclick = () => abrirReceita(r.slug);
    listaReceitas.appendChild(li);
  });
}

// =========================
//   ABRIR RECEITA CADASTRADA - Atualizada em 22/02/26
//========================= */
async function abrirReceita(slug) {

  const res = await fetch(`${API}/receitas/${slug}`);
  const receita = await res.json();

  receitaAtual = slug;

  const conteudo = receita.versoes.at(-1).conteudo;

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  editor.classList.add("active");

  editor.style.display = "block";

  if (receita.imagem) {
  previewImagem.src = "/imagens/receitas/" + receita.imagem;
  previewImagem.style.display = "block";
}

  titulo.value = receita.titulo || "";
  premium.value = receita.premium || "";
  tags.value = receita.tags || "";
  topSemana.value = receita.topSemana || "";
  premium.value = receita.premium || "";

  restricoes.value = receita.restricoes?.join("\n") || "";

  nome.value = receita.autor?.nome || "";
  credencial.value = receita.autor?.credencial || "";
  registro.value = receita.autor?.registro || "";

  categoria.value = conteudo.categoria || "";
  tempoPreparoReceita.value = conteudo.tempoPreparoReceita || "";
  tempoPreparoForno.value = conteudo.tempoPreparoForno || "";
  tempoPreparoTotal.value = conteudo.tempoPreparoTotal || "";
  rendimento.value = conteudo.rendimento || "";
  dificuldade.value = conteudo.dificuldade || "";
  custoMedio.value = conteudo.custoMedio || "";
  enviadaPor.value = conteudo.enviadaPor || "";
  comoServir.value = conteudo.comoServir || "";

  ingredientes.value = (conteudo.ingredientes || []).join("\n");
  preparo.value = (conteudo.preparo || []).join("\n");
  miseEnPlace.value = (conteudo.miseEnPlace || []).join("\n");
  conservacao.value = (conteudo.conservacao || []).join("\n");
  medidas.value = (conteudo.medidas || []).join("\n");

  const nutri = conteudo.nutricional || {};

  porcao.value = nutri.porcao || "";
  calorias.value = nutri.calorias || "";
  carboidratos.value = nutri.carboidratos || "";
  proteinas.value = nutri.proteinas || "";
  gordurasTotais.value = nutri.gordurasTotais || "";
  gordurasSaturadas.value = nutri.gordurasSaturadas || "";
  fibras.value = nutri.fibras || "";
  sodio.value = nutri.sodio || "";
  acucar.value = nutri.acucar || "";

  substituicoes.value = (conteudo.substituicoes || []).join("\n");
  dicas.value = (conteudo.dicas || []).join("\n");
  comentario.value = conteudo.comentarioNutri || "";
  listaCompras.value = (conteudo.listaCompras || []).join("\n");

  acoesEditor.innerHTML = `
    <button onclick="salvarReceita('rascunho')" class="btn-gravar">Salvar Alterações</button>
    <button onclick="salvarReceita('publicada')" class="btn-gravar">Publicar</button>
  `;
// Deletar receita
  acoesEditor.innerHTML += `
  <button onclick="deletarReceita()" style="background:red;color:white">
    🗑 Deletar
  </button>
`;
// Exibir histórico de versões - 22/02/26
const historico = document.getElementById("historicoVersoes");
historico.innerHTML = "";
receita.versoes.forEach(v => {
  const li = document.createElement("li");
  li.innerText = new Date(v.data).toLocaleString();
  historico.appendChild(li);
});
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

//========================

function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

//====================
// Limpar o formulário

function limparFormulario() {
  document.querySelectorAll("#editorReceita input, #editorReceita textarea")
    .forEach(el => el.value = "");
}

//===================
// ATUALIZAR RECEITA (PUT) -  22/02/26

/*app.put("/receitas/:slug", (req, res) => {

const { slug } = req.params;
  const novaVersao = req.body;

  const receitas = lerReceitas();
  const index = receitas.findIndex(r => r.slug === slug);

  if (index === -1) {
    return res.status(404).json({ erro: "Receita não encontrada" });
  }

  receitas[index].status = novaVersao.status;
  receitas[index].premium = novaVersao.premium;
  receitas[index].topSemana = novaVersao.topSemana;
  receitas[index].tags = novaVersao.tags;

  receitas[index].versoes.push(novaVersao.versoes[0]);

  salvarReceitas(receitas);

  res.json({ sucesso: true });
});*/


//===================  
//DELETAR RECEITA - 22/02/26
async function deletarReceita() {

  if (!confirm("Deseja deletar esta receita?")) return;

  await fetch(`${API}/receitas/${receitaAtual}`, {
    method: "DELETE"
  });

  alert("Receita deletada");
  carregarReceitas();
  editor.style.display = "none";
}
//==========================
// Coletar dados - 25/02/2026

function coletarDados() {
  return {
    titulo: titulo.value,
    ingredientes: ingredientes.value,
    preparo: preparo.value
  };
}

//===============
//🔥 7️⃣ PREVIEW REAL DA RECEITA - 22/02/26
//=====================

function previewReceita() {

  const dados = coletarDados();

  localStorage.setItem("previewReceita", JSON.stringify(dados));

  window.open("/receita.html?preview=true", "_blank");
}

//function previewReceita() {

  //const novaJanela = window.open("", "_blank");

  //novaJanela.document.write(`
 //   <h1>${titulo.value}</h1>
 //   <h3>Ingredientes</h3>
 //   <pre>${ingredientes.value}</pre>
 //   <h3>Preparo</h3>
 //   <pre>${preparo.value}</pre>
//  `);
//

/* ======================
🖼️ PREVIEW IMAGEM - Atualizada em 25/02/26 - Validar upload
====================== */
imagemInput.addEventListener("change", () => {

  const file = imagemInput.files[0];
  if (!file) return;

  // ✅ Validar tipo
  if (!file.type.startsWith("image/")) {
    alert("Selecione apenas arquivos de imagem.");
    imagemInput.value = "";
    return;
  }

  // ✅ Validar tamanho (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert("Imagem deve ter no máximo 2MB.");
    imagemInput.value = "";
    return;
  }

  // Mostrar preview
  previewImagem.src = URL.createObjectURL(file);
  previewImagem.style.display = "block";
});

/* ======================
⬆️ UPLOAD IMAGEM - Atualizada em 25/02/26 21:58
====================== */
async function uploadImagem() {

  const file = imagemInput.files[0];

  if (!file) {
    alert("Selecione uma imagem.");
    return;
  }

  btnUpload.disabled = true;
  uploadStatus.innerText = "Enviando imagem... ⏳";

  const formData = new FormData();
  formData.append("imagem", file);

  try {

    const resp = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    if (!resp.ok) {
      throw new Error("Erro no servidor");
    }

    const json = await resp.json();

    if (json.ok) {

      uploadStatus.innerText = "Imagem enviada com sucesso ✅";

      // Salvar nome da imagem no dataset
      imagemInput.dataset.filename = json.caminho;

    } else {
      throw new Error(json.erro || "Erro desconhecido");
    }

  } catch (erro) {

    console.error("Erro upload:", erro);
    uploadStatus.innerText = "Erro ao enviar imagem ❌";

  } finally {
    btnUpload.disabled = false;
  }
}