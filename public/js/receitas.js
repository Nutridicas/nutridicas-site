// 1. FUNÇÃO CORRIGIDA: Adicionado o , "" que causava o SyntaxError

function normalizar(texto) {
  return texto
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const params = new URLSearchParams(window.location.search);
const categoria = params.get("categoria");
const subcategoria = params.get("subcategoria");
const tipo = params.get("tipo");
const tag = params.get("tag");

const lista = document.getElementById("relacaoReceitas");
const titulo = document.getElementById("tituloCategoria");

const contador = document.getElementById("contadorReceitas");

fetch("/receitas")
  .then(resp => resp.json())
  .then(receitas => {
    window.receitasDebug = receitas;

    const resultado = receitas.filter(r => {
      const tagL = tag?.toLowerCase();
      const cat = normalizar(categoria);
      const sub = normalizar(subcategoria);
     

      const rCat = normalizar(r.categoria);
      const rSub = normalizar(r.subcategoria);

      const catOk = !cat || rCat === cat;
      const subOk = !sub || rSub === sub;
      const tagOk = !tagL || r.tags?.map(t => t.toLowerCase()).includes(tagL);

      return catOk && subOk && tagOk;
    });

       atualizarTitulo(resultado);
       atualizarContador(resultado);
       renderizarCards(resultado);
         
      });

function renderizarCards(relacaoReceitas) {
  if (!lista) return;

  // Garante a classe correta idêntica ao HTML e CSS
  lista.className = "receita-grid-menu";

  lista.innerHTML = "";

  if (relacaoReceitas.length === 0) {
    lista.innerHTML = `
      <div class="sem-resultados">
        <span>🔍</span>
        <p>Nenhuma receita encontrada para esta categoria.</p>
      </div>
    `;
    return;
  }

//console.log("Resultado:", relacaoReceitas);
//console.log("Primeira receita:", relacaoReceitas[0]);

relacaoReceitas.forEach(receita => {
  //console.log(receita);

  const card = document.createElement("div");
  card.className = "card-receita-nova";

 //./ exibir um card com todas as versões - alterada 07/06/2026
 const versoesAlternativas =
  receita.versoes?.filter(v => !v.padrao) || [];

    const versoesHtml =
      versoesAlternativas
        .map(v => `
          <a
            href="receita.html?slug=${receita.slug}&versao=${v.id}"
            class="tag-versao"
          >
            ${v.nome}
          </a>
        `)
        .join("");

    // exibir um card com todas as versões - alterada 07/06/2026
    card.innerHTML = `
      <div class="card-foto">
        <img
          src="imagens/receitas/${receita.imagem}"
          alt="${receita.titulo}"
          onerror="this.style.display='none'; this.parentElement.classList.add('sem-foto');">
      </div>

      <div class="card-body">

        <h3>${receita.titulo}</h3>

        <p>${receita.fraseCurta}</p>

        <a
          href="receita.html?slug=${receita.slug}"
          class="btn-ver"
        >
          Ver Receita
        </a>

        ${
            versoesAlternativas.length > 0
              ? `
                <div class="outras-versoes">
                  <strong>Outras versões:</strong>

                  <div class="versoes-receita">
                    ${versoesHtml}
                  </div>
                </div>
              `
              : ""
          }

        </div>
      `;
                         
      lista.appendChild(card);
      
    });

    } // fecha renderizarCards()

   
// função para exibir a quantidade de receitas encontradas de aordo com a escolha no menu 
// 03/06/2026
function atualizarContador(relacaoReceitas) {
    if (!contador) return;

    const total = relacaoReceitas.length;

    contador.innerHTML = `
  <span class="contador-badge">
     ${total}
  </span>
  receitas encontradas
`;
}

// função para exibir a categoria e o tipo da recita como título - isneida 06/06/2026
function atualizarTitulo(relacaoReceitas) {
  if (!titulo) return;

  const partes = [];

  if (categoria) {
    partes.push(formatarCategoria(categoria));
  }

  if (relacaoReceitas.length > 0 && relacaoReceitas[0].tipo) {
    partes.push(relacaoReceitas[0].tipo);
  }

  titulo.textContent = partes.join(" • ");
}

// estilizar o nome da categoria - 06/06/2026 
function formatarCategoria(cat) {
  return cat
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}