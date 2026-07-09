// Exibir receitas favoritas ao clicaro no botão favoritar no receita.html
// Alterado em 17/05/2026 2h46

// ==========================================================================
// 1. PARTE PARA RECEITA.HTML (Sua função original)
// ==========================================================================
function ativarFavorito(receita) {
  const btn = document.getElementById("btnFavorito");
  if (!btn) return;

  atualizarTexto();

  btn.addEventListener("click", () => {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (favoritos.includes(receita.slug)) {
      favoritos = favoritos.filter(s => s !== receita.slug);
    } else {
      favoritos.push(receita.slug);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    atualizarTexto();
  });

  function atualizarTexto() {
    const favs = JSON.parse(localStorage.getItem("favoritos")) || [];
    btn.textContent = favs.includes(receita.slug)
      ? "❤️ Desfavoritar"
      : "🤍 Favoritar";
  }
}

// ==========================================================================
// 2. PARTE PARA FAVORITOS.HTML (Com contador e categorias)
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("listaFavoritos");
  if (!container) return;

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  // Criar elemento do contador dinâmico e inserir antes da lista
  const contadorContainer = document.createElement("div");
  contadorContainer.id = "contadorFavoritos";
  contadorContainer.style.cssText = "font-family: sans-serif; color: #4b5563; font-size: 16px; margin-bottom: 20px; font-weight: 500;";
  container.parentNode.insertBefore(contadorContainer, container);

  // Se a lista estiver vazia
  if (favoritos.length === 0) {
    contadorContainer.innerText = "Você não possui receitas favoritadas.";
    container.innerHTML = `
      <div class="sem-favoritos" style="text-align: center; padding: 40px; width: 100%; color: #6b7280; font-family: sans-serif;">
        <p>Sua lista está vazia no momento.</p>
        <a href="index.html" style="display: inline-block; margin-top: 15px; background: #2f8f83; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none;">Explorar Receitas</a>
      </div>
    `;
    return;
  }

  // Atualiza o texto do contador com a quantidade
  contadorContainer.innerHTML = `Você tem <strong>${favoritos.length}</strong> ${favoritos.length === 1 ? 'receita favoritada' : 'receitas favoritas'}:`;
  container.innerHTML = "<p style='font-family: sans-serif;'>Carregando seus favoritos...</p>";

  try {
    const requisicoes = favoritos.map(slug => 
      fetch(`/receitas/${slug}`).then(res => res.ok ? res.json() : null)
    );
    
    const receitasResultados = await Promise.all(requisicoes);
    const receitasValidas = receitasResultados.filter(r => r !== null);

    container.innerHTML = ""; // Limpa texto de carregamento

    receitasValidas.forEach(receita => {
      const card = document.createElement("div");
      card.classList.add("receita-card"); 

      // Busca a categoria do seu JSON (usa 'Geral' caso não exista no seu banco de dados)
      const categoriaNome = receita.categoria || "Geral";

      card.innerHTML = `
          <div class="card-link" onclick="window.location.href='receita.html?slug=${receita.slug}'" style="cursor: pointer; display: flex; flex-direction: column;">
            
            <!-- Imagem limpa sem nenhum texto flutuando por cima -->
            <img src="${receita.imagem || 'img/placeholder.jpg'}" alt="${receita.titulo}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px 8px 0 0; display: block;">
            
            <div class="card-info" style="padding: 15px; display: flex; flex-direction: column; gap: 6px; font-family: sans-serif; align-items: flex-start;">
              
              <!-- CORREÇÃO AQUI: Categoria no formato de pílula ajustada ao texto -->
              <span class="tag-categoria" style="display: inline-block !important; background-color: rgba(47, 143, 131, 0.9) !important; color: white !important; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px !important; border-radius: 12px !important; margin-bottom: 6px !important; width: auto !important; max-width: max-content !important; white-space: nowrap !important;">
                ${categoriaNome}
              </span>
              
              <!-- Título da Receita -->
              <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #333; line-height: 1.4; font-weight: 600; width: 100%;">
                ${receita.titulo}
              </h3>
              
              <!-- Botão Remover -->
              <button class="btn-remover" data-slug="${receita.slug}" style="background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; align-self: flex-start; margin-top: 4px; transition: all 0.2s;">
                ❌ Remover
              </button>
              
            </div>
          </div>
        `;



      // Lógica do botão de remoção rápida
      const btnRemover = card.querySelector(".btn-remover");
      btnRemover.addEventListener("click", (e) => {
        e.stopPropagation(); 
        
        let favs = JSON.parse(localStorage.getItem("favoritos")) || [];
        favs = favs.filter(s => s !== receita.slug);
        localStorage.setItem("favoritos", JSON.stringify(favs));
        
        window.location.reload(); 
      });

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Erro ao processar favoritos:", error);
    container.innerHTML = "<p style='font-family: sans-serif; color: red;'>Erro ao carregar favoritos.</p>";
  }
});

// Cria um apelido global para aceitar a chamada sem a letra "c"
// criada em 17/05/2026

window.ativarFavorito = typeof ativarFavorito !== "undefined" ? ativarFavorito : typeof activarFavorito !== "undefined" ? activarFavorito : null;

// Caso sua função esteja escrita com "c", essa linha faz o JavaScript entender as duas formas:
if (typeof activarFavorito === "function") {
    window.ativarFavorito = activarFavorito;
}
