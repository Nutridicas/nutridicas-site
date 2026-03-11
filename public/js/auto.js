async function gerarMenuCategorias(){

  const res = await fetch("/api/json/receitas.json");
  const data = await res.json();

  const receitas = Array.isArray(data) ? data : data.receitas;

  const estrutura = {};

  function slugify(texto){
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g,"-");
  }

  receitas.forEach(r => {

    const conteudo = r.versoes?.[0]?.conteudo;

    if(!conteudo) return;

    const categoria = conteudo.categoria;
    const subcategoria = conteudo.subcategoria;

    if(!categoria || !subcategoria) return;

    if(!estrutura[categoria]){
      estrutura[categoria] = new Set();
    }

    estrutura[categoria].add(subcategoria);

  });

  const menu = document.getElementById("menuCategorias");

  Object.keys(estrutura).forEach(categoria => {

    const catSlug = slugify(categoria);

    let html = `
      <li>
        <strong>${categoria}</strong>
        <ul>
    `;

    estrutura[categoria].forEach(sub => {

      const subSlug = slugify(sub);

      html += `
        <li>
          <a href="categoria.html?cat=${catSlug}&sub=${subSlug}">
            ${sub}
          </a>
        </li>
      `;

    });

    html += `</ul></li>`;

    menu.innerHTML += html;

  });

}

document.addEventListener("DOMContentLoaded", gerarMenuCategorias);