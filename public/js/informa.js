// Arquivo para mostrar informações dos ingredientes
// Criado em 041/04/2026

async function carregarPaginaIngrediente() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) return;

  try {
    // 1. Carrega Info do Ingrediente
   const resp = await fetch("/ingredientes-geral"); // caminho correto
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const dados = await resp.json();
    const ing = dados[slug];

   if (ing) {
      document.getElementById("tituloIngrediente").innerText = ing.nome;
      document.getElementById("categoriaIngrediente").innerText = ing.categoria;
      document.getElementById("resumoCurto").innerText = ing.descricao_curta;
      document.getElementById("imagemIngrediente").src = ing.imagem;
      
     const campoCredito = document.getElementById("creditoIngrediente");
     const campoEndereco = document.getElementById("enderecoIngrediente");
     
      campoCredito.innerText = ing.credito;
      campoEndereco.innerText = ing.endereco; 

      // Preenche parágrafos da descrição longa
      document.getElementById("descricaoLonga").innerHTML = 
        ing.descricao_longa.map(p => `<p style="text-align: justify;">${p}</p>`).join("");

      // Benefícios e Como Usar
      document.getElementById("listaBeneficios").innerHTML =
  (ing.beneficios || []).map(
    b => `<li style="text-decoration:none; list-style:none;">✅ ${b}</li>`
  ).join("");
        
      document.getElementById("comoUsar").innerHTML =
  (ing.como_usar || []).map(c => `<li>${c}</li>`).join("");

    document.getElementById("riscoscomoUso").innerHTML =
  (ing.riscos || []).map(c => `<li>${c}</li>`).join("");
      
    document.getElementById("naoRecomUsar").innerHTML =
  (ing.naoRecomenda || []).map(c => `<li>${c}</li>`).join("");

     const campoConsumo = document.getElementById("consumo");
     
      campoConsumo.innerText = ing.consumoMaximo;
      
      // 2. BUSCA AUTOMÁTICA DE RECEITAS (Onde esse slug aparece?)
      buscarReceitasAutomatico(slug);
    }
  } catch (e) { console.error("Erro ao carregar:", e); }
}

// Função para gerar slugs uniformes
function gerarSlug(texto) {
    return texto.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/\s+/g, "-") // espaços por "-"
        .replace(/[^\w-]/g, ""); // remove caracteres especiais
}

// Função principal para buscar receitas relacionadas
async function buscarReceitasAutomatico(slugBusca) {
    try {
        const resp = await fetch("/receitas");
        if (!resp.ok) throw new Error("HTTP " + resp.status);

        const receitas = await resp.json();

        const lista = document.getElementById("receitasRelacionadas");
        if (!lista) return;

        // ⚠️ evita buscas muito genéricas
        if (slugBusca.length < 4) {
            lista.innerHTML = "<li>Ingrediente muito genérico.</li>";
            return;
        }

        function limparIngrediente(txt) {
            return gerarSlug(
                txt.replace(/^\d+\s*\w*\s*/i, "")
            );
        }

        // ✔️ filtro correto
        const relacionadas = receitas.filter(r =>
            r.versoes?.some(v =>
                v.conteudo?.ingredientes?.some(i => {
                    const ingLimpo = limparIngrediente(i);
                    return ingLimpo.includes(slugBusca);
                })
            )
        );

        // ✔️ remove duplicatas
        const relacionadasUnicas = Array.from(
            new Map(relacionadas.map(r => [r.slug, r])).values()
        );

        if (relacionadasUnicas.length > 0) {
            lista.innerHTML = relacionadasUnicas.map(r => `
                <li style="display:flex; align-items:center; gap:8px;">
                    <a href="receita.html?slug=${r.slug}" 
                       style="display:flex; align-items:center; text-decoration:none;">
                        <img src="/imagens/receitas/${r.imagem}" alt="${r.titulo}" 
                             style="width:40px; height:40px; border-radius:4px;">
                        <span>${r.titulo}</span>
                    </a>
                </li>
            `).join("");
        } else {
            lista.innerHTML = "<li>Nenhuma receita encontrada.</li>";
        }

    } catch (erro) {
        console.error("Erro ao buscar receitas relacionadas:", erro);
    }
}

document.addEventListener("DOMContentLoaded", carregarPaginaIngrediente);

// botão voltar paara a receita - inserida 04/04/2026

const btnVoltar = document.getElementById("btnVoltar");

btnVoltar.addEventListener("click", () => {
    // Aqui você define o que o botão deve fazer
    window.history.back(); // volta para a página anterior
});

/*onst btnVoltar = document.getElementById("btnVoltar");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

btnVoltar.addEventListener("click", () => {
    if (slug) {
        window.location.href = `/receita.html?slug=${slug}`;
    } else {
        window.history.back(); // fallback
    }
});
*/