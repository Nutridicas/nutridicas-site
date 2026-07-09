// ===============================
// VARIÁVEL GLOBAL
// ===============================
let receitaSelecionada = null;

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);

   const versaoURL = params.get("versao");

  // ===============================
  // PREVIEW
  // ===============================
  if (params.get("preview") === "true") {

    const receitaAtual = JSON.parse(localStorage.getItem("previewReceita"));

    if (!receitaAtual) {
      mostrarErro("Preview não encontrado.");
      return;
    }

    await carregarIngredientesInfo()

    receitaSelecionada = receitaAtual;

    const versaoPreview =
    receitaAtual.versoes.at(-1);

    window.versaoAtual =
    versaoPreview;

// CORREÇÃO: Salva o array de ingredientes contido em .conteudo.ingredientes
    window.textoIngredientesAtivo = versaoPreview.conteudo?.ingredientes || [];

    renderizarReceita(
      receitaAtual,
      versaoPreview.conteudo
    );

    renderizarVersoes(receitaAtual);
    return;
  }

  // ===============================
  // SLUG
  // ===============================
      const slug = params.get("slug");

      if (!slug) {
        mostrarErro("Receita não encontrada.");
        return;
      }

      try {

        const response = await fetch(`/receitas/${slug}`);

        if (!response.ok) {
          throw new Error("Receita não encontrada");
        }

        const receitaAtual = await response.json();
        await carregarIngredientesInfo();


        receitaSelecionada = receitaAtual;

        // Carregar versões diferentes da mesma receita
        const versaoSelecionada =
          receitaAtual.versoes.find(v => v.id === versaoURL) ||
          receitaAtual.versoes.find(v => v.padrao) ||
          receitaAtual.versoes[0];

        window.versaoAtual = versaoSelecionada;
        const conteudo = versaoSelecionada.conteudo;

        // MAPEA O CAMINHO EXATO: Salva o array de ingredientes limpo no carregamento ou na busca
        window.textoIngredientesAtivo = conteudo?.ingredientes || [];

        // 1. Renderiza o conteúdo escrito da receita
        renderizarReceita(receitaAtual, conteudo);

        // 2. Renderiza as versões destacando a ativa
        renderizarVersoes(receitaAtual, versaoSelecionada.id);

        const tituloElemento = document.getElementById("titulo");
        if (tituloElemento) {
          tituloElemento.innerText = `${receitaAtual.titulo} (${versaoSelecionada.nome})`;
        }

        // Exibir Restrições - 09/06/2026
       exibirRestricoesDaReceita(versaoSelecionada, receitaAtual);

        // Carregar dicas relacionadas
        const responseDicas = await fetch("/dicas-rapidas");
        const dataDicas = await responseDicas.json();
        const dicas = dataDicas.dicas_rapidas.filter(d => d.ativa !== false);

        const relacionadas = gerarDicasRelacionadas(receitaAtual, dicas);
        renderizarDicasUteis(relacionadas.slice(0, 3));

        aplicarPremium(receitaAtual, conteudo);
        ativarListaCompras(receitaAtual, conteudo);
        ativarFavorito(receitaAtual);
        gerarBreadcrumb(receitaAtual);

        // Exibir introdução da receita
        const introducaoDiv = document.getElementById("introducao");
        if (introducaoDiv && receitaAtual.Introducao) {
          const textoIntroducao = receitaAtual.Introducao.join(" ");
          introducaoDiv.innerHTML = `<p>${textoIntroducao}</p>`;
        }

      } catch (erro) {
        console.error(erro);
        mostrarErro("Erro ao carregar receita.");
      }
    });

// ===============================
// FUNÇÃO PRINCIPAL DE RENDER
// ===============================
function renderizarReceita(receitaAtual, conteudo) {

  document.title =
 `${receitaAtual.titulo} (${window.versaoAtual.nome}) | NutriDicas Online`;

  document.getElementById("titulo").innerText =
  receitaAtual.titulo;

  //===================
  // Mostrar informações de alguns ingredientes tooltip
  // Inserida 12/03/2026 - Atualizada 31/03/2026 00h48m

  function renderIngrediente(nome){

  const slug = normalizar(nome).replace(/\s+/g,"-");

  return `
    <span class="ingrediente-link" data-slug="${slug}">
      ${nome}
    </span>
  `;
}

  // ===============================
  // IMAGEM
  // ===============================
  const img = document.getElementById("imagem");
  if (img && receitaAtual.imagem) {
    img.src =
        "/imagens/receitas/" + receitaAtual.imagem;
        img.alt = receitaAtual.titulo;
  }

  // ===============================
  // CAMPOS BÁSICOS
  
  preencher("tempoPreparoReceita", conteudo.tempoPreparoReceita);
  preencher("tempoPreparoForno", conteudo.tempoPreparoForno);

  preencher("tempoPreparoFogao", conteudo.tempoPreparoFogao);
  preencher("tempoPreparoGeladeira", conteudo.tempoPreparoGeladeira);
  preencher("tempoPreparoDescanso", conteudo.tempoPreparoDescanso);

  preencher("tempoPreparoTotal", conteudo.tempoPreparoTotal);
  preencher("rendimento", conteudo.rendimento);
  preencher("dificuldade", conteudo.dificuldade);
  preencher("custoMedio", conteudo.custoMedio);
  preencher("comoServir", conteudo.comoServir);
  preencher("enviadaPor", conteudo.enviadaPor);
 
  preencher("avaliacaoMedia", receitaAtual.avaliacoes?.media ?? "0");
  preencher("avaliacaoTotal", receitaAtual.avaliacoes?.total ?? "0");
  preencher("autorNome", receitaAtual.autor?.nome ?? "Não informado");

  const miseEnPlaceEl = document.getElementById("miseEnPlace");
  if (miseEnPlaceEl) {
    miseEnPlaceEl.innerHTML = (conteudo.miseEnPlace || []).map(i => `<li>${i}</li>`).join("");
  }

  const conservacaoEl = document.getElementById("conservacao");
  if (conservacaoEl) {
    conservacaoEl.innerHTML = (conteudo.conservacao || []).map(c => `<li>${c}</li>`).join("");
  }

  // ===============================
  // INGREDIENTES - renderizar indredientes - alterada 18/04/2026
  // ===============================

      const ingredientesEl = document.getElementById("ingredientes");
      if (ingredientesEl) {
        ingredientesEl.innerHTML = (conteudo.ingredientes || [])
          .map(i => `<li>${typeof criarIngrediente === "function" ? criarIngrediente(i) : i}</li>`)
          .join("");
      }

    // 👇 AQUI ENTRA - alterada 11/05/2026
    const ingredientesTexto = (conteudo.ingredientes || []).map(i =>
    i
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[0-9]/g, "")
      .replace(/[≈()]/g, "")
      .replace(/xicaras?|colheres?|colher|xicara|gramas?|ml|kg|g|de|da|do|sem|com|media|medio|madura|maduro|picado|picada/gi, "")
      .trim()
  );

     // carregar dicas rápidas com alguma relação com a receita ativa/
    // inserida 18/04/2026 - alterada 17/05/2026
  if (typeof carregarDicasRelacionadas === "function") {
    carregarDicasRelacionadas(ingredientesTexto);
  }

  // ===============================
  // PREPARO - Atualizada 17/05/2026
  // ===============================

 const preparoEl = document.getElementById("preparo");
  if (preparoEl) {
    preparoEl.innerHTML = (conteudo.preparo || [])
      .map(p => `<li>${typeof linkarIngredientesNoTexto === "function" ? linkarIngredientesNoTexto(p) : p}</li>`)
      .join("");
  }
  
// ===============================
// RECEITAS RELACIONADAS - Atualizada 29/03/2026
// ===============================

   const listaRelacionadas = document.getElementById("receitasRelacionadas");
    if (listaRelacionadas && receitaAtual.relacionadas) {
      listaRelacionadas.innerHTML = "";
      receitaAtual.relacionadas.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="receita.html?slug=${r.slug}">
            <img src="/imagens/receitas/${r.imagem}" alt="${r.titulo}" width="120" height="120">
            <p>${r.titulo}</p>
          </a>
        `;
        listaRelacionadas.appendChild(li);
      });
    }

  // controlar a exibição das relacionadas  - Inserida 29/03/2026
  const lista = document.getElementById('receitasRelacionadas');
  const btnPrev = document.getElementById('prev');
  const btnNext = document.getElementById('next');
  let index = 0;

  // Função para calcular a largura exata de um item (card + gap)
  function getItemWidth() {
      const item = lista.querySelector('li');
      if (!item) return 0;
      
      // Calcula a largura total: largura do card + o espaço (gap)
      const rect = item.getBoundingClientRect();
      return rect.width + 20; // 20 é o valor do gap definido no CSS
  }

  // Tentativa de corrigir os botões do carrossel que estavam dessabilitados
  // em recita.html - criada 25/04/2026

  function getItemsVisiveis() {
    const item = lista.querySelector("li");
    if (!item) return 1;

    const containerWidth = lista.parentElement.clientWidth;
    const itemWidth = item.getBoundingClientRect().width;

    return Math.floor(containerWidth / itemWidth);
  }

  // Atualizar carrossel para receita.html (relacionadas)
  // modificada 25/04/2026 

  function atualizarCarrossel() {
    const totalItems = lista.children.length;
    const itemWidth = getItemWidth();

    const maxIndex = totalItems - 4; // já que você quer 4 visíveis

    lista.style.transform = `translateX(-${index * itemWidth}px)`;

    btnPrev.disabled = index === 0;
    btnNext.disabled = index >= maxIndex;
  }

  // Eventos de Clique

  btnNext.addEventListener('click', () => {
      index++;
      atualizarCarrossel();
  });

  btnPrev.addEventListener('click', () => {
      index--;
      atualizarCarrossel();
  });

  // Debounce para o redimensionamento (melhora performance)
  let resizeTimeout;
  window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
          atualizarCarrossel();
      }, 150);
  });
    
  } // Fecha renderizar
  
// ===============================
// SISTEMA DE AVALIAÇÃO
// ===============================
function ativarEstrelas() {

  const estrelas = document.querySelectorAll("#estrelas span");

  estrelas.forEach(estrela => {
    estrela.addEventListener("click", () => {
      const nota = parseInt(estrela.dataset.nota);

     
      alert(`Você avaliou com ${nota} estrelas!`);

      document.getElementById("avaliacaoMedia").textContent = nota;
    });
  });
}

// ===============================
// LISTA DE COMPRAS - atualizada 17/05/2026 Mapeamento de Título Correto
// ===============================

// ==========================================================================
// LISTA DE COMPRAS (VERSÃO ÚNICA E DEFINITIVA - SEM CONFLITOS)
// ==========================================================================

function ativarListaCompras(receita, conteudo) {
  const btn = document.getElementById("btnListaCompras");
  if (!btn) return;

  // Remove clones de eventos antigos limpando e reiniciando o botão
  const novoBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(novoBtn, btn);

  novoBtn.addEventListener("click", () => {
    // 1. Pega a lista existente limpa
    const listaGridAtual = JSON.parse(localStorage.getItem("listaCompras")) || [];

    // 2. Garante a captura do array estruturado de ingredientes da versão ativa
    let ingredientesFonte = window.textoIngredientesAtivo || conteudo?.ingredientes || [];

    // Se por acaso vier como objeto de conteúdo bruto, extrai o array
    if (ingredientesFonte && ingredientesFonte.ingredientes) {
      ingredientesFonte = ingredientesFonte.ingredientes;
    }

    if (!Array.isArray(ingredientesFonte) || ingredientesFonte.length === 0) {
      alert("Nenhum ingrediente mapeado para esta receita.");
      return;
    }

    // 3. Formata os itens injetando o título correto do JSON raiz
    const novosItens = ingredientesFonte
      .map(linha => {
        if (typeof linha !== "string" || linha.trim().length === 0) return null;
        
        // Chama o interpretador do somar.js
        const itemInterpretado = interpretarIngrediente(linha.trim());
        
        if (itemInterpretado) {
          // Captura estritamente o título raiz do seu JSON (ex: "Broa de Fubá Aerada de Padaria")
          const sufixoVersao = (window.versaoAtual && window.versaoAtual.nome) ? ` (${window.versaoAtual.nome})` : "";
          itemInterpretado.receitaOrigem = `${receita.titulo || receita.nome || "Receita"}${sufixoVersao}`;
        }
        return itemInterpretado;
      })
      .filter(Boolean);

    // 4. Junta as duas listas e passa pelo filtro anti-duplicação do somar.js
    const listaCompletaSomada = somarIngredientes([...listaGridAtual, ...novosItens]);

    // 5. Salva e redireciona
    localStorage.setItem("listaCompras", JSON.stringify(listaCompletaSomada));
    window.location.href = "lista-compras.html";
  });
}
window.ativarListaCompras = ativarListaCompras;


// ===============================
// PREMIUM - Alterada 15/05/2026 para permitir inseriri novos campos
//  na tabela nutricional e aparecer somente se tiver conteúdo
// ===============================
 
   function aplicarPremium(receita, conteudo) {
  // 1. Limpa e esconde TODAS as linhas da tabela antes de começar
  const todasAsLinhas = document.querySelectorAll('.tabela-nutricional tr');
  todasAsLinhas.forEach(linha => {
    if (linha.querySelector('td')) {
      linha.style.display = "none"; 
      linha.querySelector('td').innerText = ""; 
    }
  });

  // 2. DETECTOR AUTOMÁTICO: Encontra onde a tabela nutricional está escondida nos parâmetros
  let dadosNutricionais = null;

  if (conteudo && conteudo.nutricional) {
    dadosNutricionais = conteudo.nutricional;
  } else if (receita && receita.nutricional) {
    dadosNutricionais = receita.nutricional;
  } else if (conteudo && conteudo.frase) { // Caso o objeto nutricional tenha sido passado direto
    dadosNutricionais = conteudo;
  } else if (receita && receita.frase) {
    dadosNutricionais = receita;
  }

  // Se mesmo assim não encontrar nada, avisa no console do F12 e interrompe
  if (!dadosNutricionais) {
    console.error("Erro: Objeto 'nutricional' não foi encontrado nos parâmetros passados para a função.");
    return;
  }

  // 3. Percorre cada campo encontrado e injeta no HTML
  Object.keys(dadosNutricionais).forEach(chave => {
    // Remove espaços em branco do nome da chave e padroniza o açúcar
    const chaveLimpa = chave.trim();
    const idCampo = (chaveLimpa === "acuçar" || chaveLimpa === "açúcar") ? "acucar" : chaveLimpa;
    
    const el = document.getElementById(idCampo);
    if (el) {
      let valor = dadosNutricionais[chave];
      
      if (valor !== undefined && valor !== null) {
        // Limpa espaços extras que possam vir no texto (ex: " 169 mg" vira "169 mg")
        valor = valor.toString().trim();
        
        if (valor !== "") {
          el.innerText = valor;
          
          const linhaTabela = el.closest('tr');
          if (linhaTabela) {
            linhaTabela.style.display = ""; // Força a exibição da linha
          }
        }
      }
    }
  });

 // SUBSTITUIÇÕES
  if (conteudo.substituicoes) {
    //preencher("substituicoes", conteudo.substituicoes);
    document.getElementById("substituicoes").innerHTML =
    conteudo.substituicoes.map(s => `<li>${s}</li>`).join("");
  }

  // DICAS
  if (conteudo.dicas) {
    document.getElementById("dicas").innerHTML =
      conteudo.dicas.map(d => `<li>${d}</li>`).join("");
  }

  // COMENTÁRIO NUTRI -  alterado 09/05/2026
   if (conteudo.comentarioNutri) {
      document.getElementById("comentarioNutri").innerHTML =
      conteudo.comentarioNutri.map(d => `<li>${d}</li>`).join("");
  }
}

// ===============================
// FUNÇÕES AUXILIARES
// ===============================

// Função alterada para exibir somente se o campo tiver conteúdo
// na tabela nutriconal e tempos de preparo alteerada 15/05/2026 

  function preencher(id, valor) {
  const el = document.getElementById(id);
  if (!el) return; // Ignora se o ID não existir no HTML

  // Captura o container correto: tenta achar um <tr> (tabela) OU uma div de tempo (.tempo-linha / .tempo-total)
  const container = el.closest('tr') || el.closest('.tempo-linha') || el.closest('.tempo-total');

  // Valida se o valor existe e não é uma string vazia
  if (valor !== undefined && valor !== null && valor.toString().trim() !== "") {
    el.innerText = valor.toString().trim();
    
    if (container) {
      // Regra inteligente: se for linha de tabela (tr) usa o padrão "". Se for div de tempo, usa "flex"
      container.style.display = container.matches('tr') ? "" : "flex"; 
    }
  } else {
    if (container) {
      container.style.display = "none"; // Oculta a linha <tr> ou a <div> de tempo vazia
    }
  }
}


// Função sem utilidade no momento
function usuarioTemPremium() {
  return localStorage.getItem("premium") === "true";
}

// Função sem utilidade no momento
function bloquearSecao(id) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `
      <div class="bloqueado">
        🔒 Conteúdo Premium
        <br>
        <a href="planos.html">Assine para desbloquear</a>
      </div>
    `;
  }
}

//
function mostrarErro(msg) {
  document.querySelector("main").innerHTML = `<p>${msg}</p>`;
}

// função normalizar 

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


// Abrir e fechar o modal - inserida 01/04/2026

function abrirModal() {
  const modal = document.getElementById("meuModal");
  modal.style.display = "flex"; // Usa flex para centralizar o container
}

function fecharModal() {
  const modal = document.getElementById("meuModal");
  modal.style.display = "none";
}

// Função para imprimir as medidas caseiras do modal- inserida 01/04/2026

function copiarMedidas() {
    let texto = "📊 TABELA DE MEDIDAS CASEIRAS\n\n";
    const secoes = document.querySelectorAll('.medida-secao');
    
    secoes.forEach(secao => {
        const titulo = secao.querySelector('h4').innerText;
        texto += `🔹 ${titulo}\n`;
        const linhas = secao.querySelectorAll('tbody tr');
        linhas.forEach(linha => {
            const cols = linha.querySelectorAll('td');
            texto += `${cols[0].innerText}: ${cols[1].innerText}\n`;
        });
        texto += "\n";
    });

    navigator.clipboard.writeText(texto).then(() => {
        alert("Tabela copiada para a área de transferência! 📋");
    });
}

 // Relacionar dicas rápidas com a receita ativa
// Inserida 18/04/2026

function carregarDicasRelacionadas(ingredientesTexto) {

  fetch('/dicas-rapidas')
    .then(res => res.json())
    .then(data => {

      const container = document.getElementById('lista-dicas');

      if (!container) return;

      const dicas = data.dicas_rapidas.filter(d => d.ativa !== false);

      // 🔥 FILTRO INTELIGENTE - alterado 11/05/2026
      const relacionadas = dicas.filter(dica => {

      // normalizar tipo
      const tipo = (dica.tipo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      // normalizar tags
      const tags = (dica.tags || []).map(tag =>
        tag
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      );

      return ingredientesTexto.some(ing => {

        // comparar tipo
        if (tipo && ing.includes(tipo)) {
          return true;
        }

        // comparar tags
        return tags.some(tag => ing.includes(tag));

      });

    });  // fim do filtro
      
   // console.log("RELACIONADAS:", relacionadas);

      const final = relacionadas.length > 0 ? relacionadas : dicas;
      const ordenadas = ordenarPorPopularidade(final);

      container.innerHTML = ""; // limpa antes
      ordenadas.slice(0, 3).forEach(dica => {

      const div = document.createElement('div');
        div.classList.add('dica-item-card');

        div.innerHTML = `
          <span class="categoria">${dica.categoria}</span>
          <h3>${dica.titulo}</h3>
          <p>${dica.texto}</p>
          <a href="/dicas.html?id=${dica.id}&slug=${dica.slug}" class="btn-detalhes">
            Saiba mais →
          </a>
        `;

        container.appendChild(div);
      });

    });
}

// Para trocar a versão da receita ativa - inserida 16/05/2026
// gerada opção para desktop e celular, adaptável

function renderizarVersoes(receitaAtual, versaoAtivaId) {
  
  const container = document.getElementById("versoesReceita");
 
  if (!container) return;
  container.innerHTML = "";

  // Se tiver apenas 1 versão, não precisa mostrar nada
  if (!receitaAtual.versoes || receitaAtual.versoes.length <= 1) return;

  // 1. Cria o container principal do Dropdown (usado no Desktop)
  const hibridoContainer = document.createElement("div");
  hibridoContainer.classList.add("comp-hibrido-versoes");

  // --- NOVA INCLUSÃO DO TÍTULO (FORA DO MENU) ---
  // Cria o elemento h3 para chamar a atenção do usuário
  const tituloChamada = document.createElement("h4");
  tituloChamada.innerText = "Clique para ver outras versões";
  tituloChamada.classList.add("chamada-versoes"); // Classe para estilizar no CSS
  hibridoContainer.appendChild(tituloChamada);
  // -----------------------------------------------

  // Botão que serve de gatilho no desktop e título explicativo no mobile
  const gatilho = document.createElement("button");
  gatilho.classList.add("hibrido-trigger");
  
  const atual = receitaAtual.versoes.find(v => v.id === versaoAtivaId);
  gatilho.innerText = atual ? `Versão: ${atual.nome}` : "Escolha uma outra versão";
  
  // Lista que conterá as opções (vira carrossel no mobile e menu flutuante no desktop)
  const menuLista = document.createElement("div");
  menuLista.classList.add("hibrido-menu");

  // 2. Cria os botões para cada versão
  receitaAtual.versoes.forEach(versao => {
    const item = document.createElement("button");
    item.classList.add("hibrido-item");
    item.innerText = versao.nome;
    
    if (versao.id === versaoAtivaId) {
      item.classList.add("ativo"); // Destaca a versão atual
    } else {
      item.addEventListener("click", () => {
        trocarDeVersao(versao.id); // Substitua pela sua função de troca
      });
    }
    menuLista.appendChild(item);
  });

  // 3. Controle do clique do Dropdown (apenas para Desktop)
  gatilho.addEventListener("click", (e) => {
    e.stopPropagation();
    hibridoContainer.classList.toggle("aberto");
  });

  // Fecha o menu se clicar fora dele (comportamento de desktop)
  document.addEventListener("click", () => {
    hibridoContainer.classList.remove("aberto");
  });

  hibridoContainer.appendChild(gatilho);
  hibridoContainer.appendChild(menuLista);
  container.appendChild(hibridoContainer);
}


// Função para atualizar os dados da receita ao trocar a versão
// inserida 16/05/2026

// Exemplo de estado global para controlar qual receita e versão estão ativas
let receitaGlobal = null; 

// 1. Função principal que carrega a receita pela primeira vez
function inicializarReceita(dadosDaReceita) {
  receitaGlobal = dadosDaReceita;
  
  // Encontra qual versão é a padrão (geralmente tem "padrao: true" no JSON)
  const versaoPadrao = dadosDaReceita.versoes.find(v => v.padrao) || dadosDaReceita.versoes[0];
  
  // Renderiza a tela com a versão padrão
  trocarDeVersao(versaoPadrao.id);
}

// 2. A FUNÇÃO DE TROCA (O motor que atualiza tudo) - 16/05/2026
// Função auxiliar para criar a notificação flutuante na tela
function mostrarAvisoToast(mensagem) {
  // Remove qualquer aviso antigo que ainda esteja na tela
  const antigo = document.querySelector(".toast-notificacao");
  if (antigo) antigo.remove();

  // Cria o elemento do aviso
  const toast = document.createElement("div");
  toast.classList.add("toast-notificacao");
  toast.innerText = mensagem;

  document.body.appendChild(toast);

  // Remove o aviso sozinho depois de 3 segundos

  setTimeout(() => {
    toast.style.transition = "all 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, -20px)"; // Esconde subindo de volta
    setTimeout(() => toast.remove(), 400);
  }, 3000);

}

// Sua função principal de troca atualizada
function trocarDeVersao(versaoId) {
  const novaVersao = receitaSelecionada.versoes.find(v => v.id === versaoId);
  if (!novaVersao) return;

  window.versaoAtual = novaVersao;

  // 1. ADICIONA EFEITO DE PISCAR NA TELA
  const containerReceita = document.getElementById("conteudoReceita") || document.querySelector("main");
  if (containerReceita) {
    containerReceita.classList.remove("efeito-mudanca");
    void containerReceita.offsetWidth; 
    containerReceita.classList.add("efeito-mudanca");
  }

  // 2. EXIBE A NOTIFICAÇÃO NO TOPO
  mostrarAvisoToast(`Versão "${novaVersao.nome}" carregada!`);

  // 3. ATUALIZA O CONTEÚDO DA TELA (Roda primeiro para não quebrar nosso título)
  renderizarReceita(receitaSelecionada, novaVersao.conteudo);
  renderizarVersoes(receitaSelecionada, versaoId);

  // 4. GARANTE A ATUALIZAÇÃO DO TÍTULO (Roda por último para sobrescrever qualquer texto antigo)
  const tituloElemento = document.getElementById("titulo");
  if (tituloElemento) {
    tituloElemento.innerText = `${receitaSelecionada.titulo} (${novaVersao.nome})`;
  }
}

// ==========================================================================
// INTERVENÇÃO PARA ATUALIZAR INGREDIENTES NO CLIQUE DAS VERSÕES
// ==========================================================================
const originalTrocarDeVersao = window.trocarDeVersao;
window.trocarDeVersao = function(versaoId) {
  if (receitaSelecionada) {
    const novaVersao = receitaSelecionada.versoes.find(v => v.id === versaoId);
    if (novaVersao && novaVersao.conteudo && novaVersao.conteudo.ingredientes) {
      // Sincroniza os ingredientes ativos da nova versão escolhida no menu/dropdown
      window.textoIngredientesAtivo = novaVersao.conteudo.ingredientes;
    }
  }
  if (typeof originalTrocarDeVersao === "function") {
    originalTrocarDeVersao(versaoId);
  }
};

// Criada 09/06/2026
// Função que recebe o objeto da receita e exibe as restrições
function exibirRestricoesDaReceita(versao, receitaCompleta) {
    const container = document.getElementById('exibirRestricoes');

    // 1. Tenta pegar as restrições da versão. Se não achar, tenta pegar da raiz da receita.
    const listaRestricoes = (versao && versao.restricoes) || (receitaCompleta && receitaCompleta.restricoes);

    if (listaRestricoes && listaRestricoes.length > 0) {
        // Formata o texto removendo hífens estéticos do JSON
        const tagsHTML = listaRestricoes
            .map(item => `<span class="tag-restricao">${item.replace('-', ' ')}</span>`)
            .join('');

        container.innerHTML = `
            <div class="container-restricoes">
                <span class="titulo-restricoes">Atenção:</span>
                <div class="wrapper-tags">
                    ${tagsHTML}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="container-restricoes livre">
                <span class="tag-livre">✓ Livre de restrições alérgicas</span>
            </div>
        `;
    }
}


