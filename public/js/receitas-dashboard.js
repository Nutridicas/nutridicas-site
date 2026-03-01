const receitas = [
  "bolo-fofo-zero-lactose-sem-acucar",
  "pao-integral-zero-gluten"
  // futuramente automático
];

const lista = document.getElementById("listaReceitas");

receitas.forEach(slug => {
  const li = document.createElement("li");

  li.innerHTML = `
    <strong>${slug.replaceAll("-", " ")}</strong>
    <div>
      <button onclick="editarReceita('${slug}')">✏️ Editar</button>
      <a href="../receita.html?slug=${slug}" target="_blank">
        👁️ Ver
      </a>
    </div>
  `;

  lista.appendChild(li);
});

function editarReceita(slug) {
  fetch(`../json/${slug}.json`)
    .then(res => res.json())
    .then(data => preencherFormulario(data));
}

//preencher formulario do editor de receitas

function preencherFormulario(data) {
  document.querySelector('[name="slug"]').value = data.slug;
  document.querySelector('[name="titulo"]').value = data.titulo;
  document.querySelector('[name="categoria"]').value = data.categoria;
  document.querySelector('[name="imagem"]').value = data.imagem;

  document.querySelector('[name="ingredientes"]').value =
    data.ingredientes.join("\n");

  document.querySelector('[name="preparo"]').value =
    data.preparo.join("\n");

  document.querySelector('[name="medidas"]').value =
    data.medidas.join("\n");

  document.querySelector('[name="dicas"]').value = data.dicas;
  document.querySelector('[name="observacoes"]').value = data.observacoes;

  document.querySelector('[name="porcao"]').value =
    data.nutricional.porcao;
  document.querySelector('[name="calorias"]').value =
    data.nutricional.calorias;
}
