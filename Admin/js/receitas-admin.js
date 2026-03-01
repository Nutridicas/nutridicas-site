let receitas = [];
let receitaAtual = null;

fetch("../json/receitas.json")
  .then(r => r.json())
  .then(dados => {
    receitas = dados;
    renderLista();
  });

function renderLista() {
  const ul = document.getElementById("listaReceitas");
  ul.innerHTML = "";

  receitas.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${r.titulo}</strong>
      <button onclick="editarReceita('${r.id}')">✏️ Editar</button>
    `;
    ul.appendChild(li);
  });
}

// Função de edição
function editarReceita(id) {
  receitaAtual = receitas.find(r => r.id === id);

  document.getElementById("titulo").value = receitaAtual.titulo;
  document.getElementById("categoria").value = receitaAtual.categoria;
  document.getElementById("ingredientes").value =
    receitaAtual.ingredientes.join("\n");
  document.getElementById("preparo").value =
    receitaAtual.preparo.join("\n");
}

// Salvar edição
function salvarEdicao() {
  receitaAtual.titulo = document.getElementById("titulo").value;
  receitaAtual.categoria = document.getElementById("categoria").value;
  receitaAtual.ingredientes =
    document.getElementById("ingredientes").value.split("\n");
  receitaAtual.preparo =
    document.getElementById("preparo").value.split("\n");

  exportarJSON();
  alert("Receita atualizada!");
}
