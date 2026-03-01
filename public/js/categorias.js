document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("cat");

  document.getElementById("tituloCategoria").innerText =
    "📌 Categoria: " + categoria;

  fetch("/receitas")
    .then(res => res.json())
    .then(receitas => {

      const filtradas = receitas.filter(r => {
        const cat = r.versoes?.[0]?.conteudo?.categoria;
        return cat === categoria;
      });

      mostrarReceitas(filtradas);
    });

  function mostrarReceitas(lista) {

    const container = document.getElementById("listaCategoria");

    if (lista.length === 0) {
      container.innerHTML = "<p>Nenhuma receita encontrada.</p>";
      return;
    }

    lista.forEach(r => {

      container.innerHTML += `
        <div class="recipe-card">
          <a href="receita.html?slug=${r.slug}">
            <img src="imagens/receitas/${r.imagem}" alt="${r.titulo}">
          </a>
          <h3>${r.titulo}</h3>
        </div>
      `;
    });
  }

});
