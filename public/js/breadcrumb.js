// ===============================
// BREADCRUMB + BOTÃO VOLTAR
// Atualizada 2026
// ===============================

function gerarBreadcrumb(receita){

  const container = document.getElementById("breadcrumb");
  if(!container) return;

  const versao = receita.versoes[0];
  const menu = receita.tipoMenu;           // ex: zerolac
  const subcategoria = receita.subcategoria; // ex: paes
  const titulo = receita.titulo;

  const nomeMenus = {
    zerolac: "Zero Lactose",
    zerogluten: "Sem Glúten",
    zeroacucar: "Sem Açúcar",
    zerovo: "Sem Ovo",
    funcional: "Funcional",
    vegano: "Vegano",
    tradicional: "Tradicional",
    bolos: "Bolos",
    paes: "pães",
    sobremesas: "Sobremesas"
  };

  const nomeSub = {
    paes: "Pães",
    bolos: "Bolos",
    bebidas: "Bebidas",
    lanches: "Lanches",
    sobremesas: "Sobremesas",
    refeicoes: "Refeições",
    sopas: "Sopas",
    pastas: "Pastas",
    massas: "Massas"
  };

  const menuNome = nomeMenus[menu] || menu;
  const subNome = nomeSub[subcategoria] || subcategoria;

  container.innerHTML = `
    <a href="/">Início</a>
    <span> › </span>

    <a href="/menu-${menu}.html">
      ${menuNome}
    </a>

    <span> › </span>

    <a href="/smenu-${subcategoria}.html">
      ${subNome}
    </a>

    <span> › </span>
    <span class="current">${titulo}</span>
  `;
}


// fica inativa, mudança de nome
function gerarBr(receita){

  const container = document.getElementById("breadcrumb");
  if(!container) return;

  const versao = receita.versoes[0];
  const categoria = receita.categoria;
  const subcategoria = receita.subcategoria || null;
  const titulo = receita.titulo;

  function slugify(texto){
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g,"-");
  }

  const categoriaSlug = slugify(categoria);

  let breadcrumbHTML = `
    <a href="/">Início</a>
    <span> › </span>
    <a href="/categoria.html?cat=${categoriaSlug}">
      ${categoria}
    </a>
  `;

  if(subcategoria){

    const subcategoriaSlug = slugify(subcategoria);

    breadcrumbHTML += `
      <span> › </span>
      <a href="/categoria.html?cat=${categoriaSlug}&sub=${subcategoriaSlug}">
        ${subcategoria}
      </a>
    `;
  }

  breadcrumbHTML += `
    <span> › </span>
    <span class="current">${titulo}</span>
  `;

  container.innerHTML = breadcrumbHTML;

  // ===== SCHEMA SEO =====

  const schema = {
   "@context": "https://schema.org",
   "@type": "BreadcrumbList",
   "itemListElement": [
     {
       "@type": "ListItem",
       "position": 1,
       "name": "Início",
       "item": window.location.origin
     },
     {
       "@type": "ListItem",
       "position": 2,
       "name": categoria,
       "item": `${window.location.origin}/categoria.html?cat=${categoriaSlug}`
     }
   ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);

  document.head.appendChild(script);
}