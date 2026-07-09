// 1. DECLARE AS VARIÁVEIS NO TOPO (GLOBAL)
// ==========================================================================
// 1. MOTOR DE CAPTURA PARA RECEITA.HTML (Executa na página da receita)
// alterada 17/05/2026
// ==========================================================================

function ativarBotaoListaCompras(receita, versaoAtual) {
  const btn = document.getElementById("btnListaCompras");
  if (!btn) return;

  btn.addEventListener("click", () => {
    let listaAtual = JSON.parse(localStorage.getItem("listaCompras")) || [];

    let novosIngredientes = [];
    if (versaoAtual.conteudo && Array.isArray(versaoAtual.conteudo.ingredientes)) {
      novosIngredientes = versaoAtual.conteudo.ingredientes;
    } else if (versaoAtual.ingredientes && Array.isArray(versaoAtual.ingredientes)) {
      novosIngredientes = versaoAtual.ingredientes;
    } else if (versaoAtual.conteudo && typeof versaoAtual.conteudo === "string") {
      novosIngredientes = processarIngredientes(versaoAtual.conteudo);
    }

    if (novosIngredientes.length === 0) {
      if (typeof mostrarAvisoToast === "function") {
        mostrarAvisoToast("Nenhum ingrediente encontrado para adicionar!");
      } else {
        alert("Nenhum ingrediente encontrado para adicionar!");
      }
      return;
    }

    novosIngredientes.forEach(ingNome => {
      listaAtual.push({
        nome: ingNome.trim(),
        quantidade: 1,
        categoria: "Outros",
        unidade: "",
        receitaOrigem: `${receita.titulo} (${versaoAtual.nome || "Versão Padrão"})`
      });
    });

    localStorage.setItem("listaCompras", JSON.stringify(listaAtual));

    if (typeof mostrarAvisoToast === "function") {
      mostrarAvisoToast("Ingredientes adicionados à Lista de Compras! 🛒");
    } else {
      alert("Ingredientes adicionados à Lista de Compras! 🛒");
    }
  });
}
window.ativarBotaoListaCompras = ativarBotaoListaCompras;

// ==========================================================================
// 2. DECLARAÇÃO DE VARIÁVEIS GLOBAIS
// ==========================================================================
let itens = JSON.parse(localStorage.getItem("listaCompras")) || [];
let comprados = JSON.parse(localStorage.getItem("comprados")) || [];

// ==========================================================================
// 3. FUNÇÕES DE APOIO E NORMALIZAÇÃO
// ==========================================================================
function limparTexto(txt) {
  if (!txt) return "";
  return txt
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace("madura", "")
    .replace("maduro", "")
    .replace("picado", "")
    .replace("picada", "")
    .replace("ralado", "")
    .replace("ralada", "")
    .trim();
}

function identificarIngrediente(txt) {
  return {
    nome: txt,
    categoria: "Outros",
    unidade: ""
  };
}

function organizarCategorias(lista) {
  return lista.reduce((acc, item) => {
    const cat = item.categoria || "Outros";
    if (!acc[cat]) acc[cat] = [];
    return acc;
  }, {});
}

function normalizarItens() {
  const mapa = {};

  itens
    .filter(Boolean)
    .forEach(item => {
      if (typeof item === "string") {
        item = { nome: item, quantidade: 1 };
      }

      const textoLimpo = limparTexto(item.nome);
      const ingrediente = identificarIngrediente(textoLimpo);
      const chave = item.nome.trim().toLowerCase();

      if (!mapa[chave]) {
        mapa[chave] = {
          nome: item.nome, 
          categoria: ingrediente.categoria,
          unidade: ingrediente.unidade,
          quantidade: item.quantidade || 1,
          receitaOrigem: item.receitaOrigem || "" 
        };
      } else {
        mapa[chave].quantidade += item.quantidade || 1;
      }
    });

  itens = Object.values(mapa);
  localStorage.setItem("listaCompras", JSON.stringify(itens));
}

function atualizarProgresso() {
  const barra = document.getElementById("barraProgresso");
  const contador = document.getElementById("contador");

  const total = itens.length;
  const feitos = itens.filter(i => comprados.includes(i.nome)).length;
  const porcentagem = total === 0 ? 0 : Math.round((feitos / total) * 100);

  if (barra) barra.style.width = `${porcentagem}%`;
  if (contador) contador.textContent = `${feitos} de ${total} comprados`;
}

function processarIngredientes(texto) {
  return texto
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .filter(l => !/^(creme:|camadas:|modo|preparo)/i.test(l))
    .map(l => l
      .replace(/\(.*?\)/g, "")
      .replace(/\d+\s*(ml|g|colher|xícara)?/gi, "")
      .trim()
    );
}

function toggleItem(nome) {
  if (comprados.includes(nome)) {
    comprados = comprados.filter(i => i !== nome);
  } else {
    comprados.push(nome);
  }
  localStorage.setItem("comprados", JSON.stringify(comprados));
  renderizar();
}
window.toggleItem = toggleItem;

// ==========================================================================
// 4. RENDERIZAÇÃO DA PÁGINA (ORGANIZADA POR BLOCOS DE RECEITAS)
// ==========================================================================
function renderizar() {
  const container = document.getElementById("listaCategorias");
  if (!container) return;
  
  container.innerHTML = "";
  itens = JSON.parse(localStorage.getItem("listaCompras")) || [];
  
  if (itens.length === 0) {
    container.innerHTML = "<p style='opacity:.6; font-family: sans-serif;'>Nenhum item na lista</p>";
    atualizarProgresso();
    return;
  }

  // Filtro anti-duplicação de renderização
  const itensUnicos = [];
  const nomesVistos = new Set();
  
  itens.forEach(item => {
    if (!item || !item.nome) return;
    const nomeChave = item.nome.trim().toLowerCase();
    if (!nomesVistos.has(nomeChave)) {
      nomesVistos.add(nomeChave);
      itensUnicos.push(item);
    }
  });
  
  itens = itensUnicos;

  // Agrupa os ingredientes por receita de origem
  const receitasAgrupadas = {};
  itens.forEach(item => {
    const nomeReceita = item.receitaOrigem || "Minhas Receitas";
    if (!receitasAgrupadas[nomeReceita]) {
      receitasAgrupadas[nomeReceita] = [];
    }
    receitasAgrupadas[nomeReceita].push(item);
  });

  // Renderiza cada receita em seu bloco correspondente
  Object.keys(receitasAgrupadas).forEach(nomeDaReceita => {
    const blocoReceita = document.createElement("div");
    blocoReceita.className = "receita-bloco-grupo";
    blocoReceita.style.cssText = "margin-bottom: 35px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; font-family: sans-serif;";

    const tituloHeader = document.createElement("h2");
    tituloHeader.style.cssText = "color: #2f8f83; font-size: 18px; margin: 0 0 15px 0; border-left: 4px solid #2f8f83; padding-left: 10px; font-weight: 700;";
    tituloHeader.innerText = `📋 Ingredientes de: ${nomeDaReceita}`;
    blocoReceita.appendChild(tituloHeader);

    const categorias = {};
    receitasAgrupadas[nomeDaReceita].forEach(item => {
      const cat = item.categoria || "Outros";
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(item);
    });

    Object.keys(categorias).forEach(cat => {
      const subBloco = document.createElement("div");
      subBloco.style.margin = "10px 0";
      
      if (Object.keys(categorias).length > 1 || cat !== "Outros") {
        subBloco.innerHTML = `<div style="font-weight: 600; color: #4b5563; font-size: 13px; margin-bottom: 6px; text-transform: uppercase;">📦 ${cat}</div>`;
      }

      categorias[cat].forEach(item => {
        const card = document.createElement("div");
        card.className = `item-card ${comprados.includes(item.nome) ? 'comprado' : ''}`;
       
        const jaTemNumeroNoInicio = /^\d/.test(item.nome);
        const textoExibicao = (item.quantidade > 1 && !jaTemNumeroNoInicio)
         ? `${item.quantidade} ${item.unidade || ""} ${item.nome}` 
         : item.nome;

        card.innerHTML = `<span>${textoExibicao}</span><button onclick="toggleItem('${item.nome}')" style="cursor:pointer;">✔️</button>`;
        subBloco.appendChild(card);
      });
      
      blocoReceita.appendChild(subBloco);
    });

    container.appendChild(blocoReceita);
  });

  atualizarProgresso();
}

// ==========================================================================
// 5. EVENTOS DO PAINEL SAAS (DOM CONTENT LOADED)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof normalizarItens === "function" && document.getElementById("listaCategorias")) {
    normalizarItens();
  }
  
  renderizar();

    // ------------------------------------------------------------------------
  // 🖨️ EXPORTAR PDF (VERSÃO FINAL COM RODAPÉ CORPORATIVO E HORÁRIO)
  //  inserida e alterado 17/05/2026
  // ------------------------------------------------------------------------
  document.getElementById("btnPDF")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  function sanitizarParaPDF(texto) {
      if (!texto) return "";
      return texto
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "") 
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
        .trim();
    }

    // 1. CABEÇALHO: Barra verde principal do topo
    doc.setFillColor(47, 143, 131); 
    doc.rect(0, 0, 210, 35, "F"); 

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("NutriDicas", 20, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Sua Lista de Compras Saudável", 20, 29);

    // Data e Hora no canto direito do cabeçalho
    const agora = new Date();
    const dataHoje = agora.toLocaleDateString("pt-BR");
    const horaHoje = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    
    doc.setFontSize(9);
    doc.text(`Gerado em: ${dataHoje}`, 160, 20);
    doc.text(`Horário: ${horaHoje}`, 160, 26); // Adiciona a hora abaixo da data

    let linhaVertical = 50; 
    doc.setTextColor(51, 51, 51);

    const receitasAgrupadas = {};
    itens.forEach(item => {
      const nomeReceita = item.receitaOrigem || "Outras Receitas";
      if (!receitasAgrupadas[nomeReceita]) receitasAgrupadas[nomeReceita] = [];
      receitasAgrupadas[nomeReceita].push(item);
    });

    Object.keys(receitasAgrupadas).forEach(nomeDaReceita => {
      if (linhaVertical > 250) { doc.addPage(); linhaVertical = 25; }

      const tituloReceitaTratado = sanitizarParaPDF(nomeDaReceita);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(47, 143, 131);
      
      doc.text(`Lista de: ${tituloReceitaTratado}`, 20, linhaVertical, { maxWidth: 170 });
      linhaVertical += 10;

      doc.setDrawColor(229, 231, 235);
      doc.line(20, linhaVertical - 5, 190, linhaVertical - 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);

      receitasAgrupadas[nomeDaReceita].forEach(item => {
        if (linhaVertical > 265) { doc.addPage(); linhaVertical = 25; }

        const jaTemNumero = /^\d/.test(item.nome);
        const textoItemRaw = (item.quantidade > 1 && !jaTemNumero)
          ? `${item.quantidade} ${item.unidade || ""} ${item.nome}`
          : item.nome;

        const ingredienteTratado = sanitizarParaPDF(textoItemRaw);

        doc.rect(20, linhaVertical - 3.5, 4, 4); 
        doc.text(ingredienteTratado, 28, linhaVertical, { maxWidth: 160 });
        linhaVertical += 8; 
      });
      linhaVertical += 6; 
    });

    // 2. CONFIGURAÇÃO DO RODAPÉ EM TODAS AS PÁGINAS (Com cor suave e endereço)
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      
      // Barra decorativa inferior com cor verde bem suave
      doc.setFillColor(240, 253, 244); 
      doc.rect(0, 280, 210, 17, "F"); 

      // Linha fina divisória superior no rodapé
      doc.setDrawColor(220, 252, 231);
      doc.line(0, 280, 210, 280);

      // Link do site no canto esquerdo do rodapé suave
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(47, 143, 131);
      doc.text("www.nutridicas.com.br", 20, 290);

      // Paginação no canto direito do rodapé suave
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(`Página ${i} de ${totalPaginas}`, 170, 290);
    }

    doc.save("lista-de-compras-nutridicas.pdf");
  });


  // 📱 GERAR QR CODE
  document.getElementById("btnQR")?.addEventListener("click", () => {
    const container = document.getElementById("qrContainer");
    const canvas = document.getElementById("canvasQR");
    if (!container || !canvas) return;

    if (container.style.display === "block") {
      container.style.display = "none";
      return;
    }

    if (itens.length === 0) {
      alert("Adicione ingredientes antes de gerar o QR Code!");
      return;
    }

    let textoParaCelular = "🛒 MINHA LISTA NUTRIDICAS:\n\n";
    const receitasAgrupadas = {};
    
    itens.forEach(item => {
      const nomeReceita = item.receitaOrigem || "Outras Receitas";
      if (!receitasAgrupadas[nomeReceita]) receitasAgrupadas[nomeReceita] = [];
      receitasAgrupadas[nomeReceita].push(item);
    });

    Object.keys(receitasAgrupadas).forEach(nome => {
      textoParaCelular += `🔹 ${nome.toUpperCase()}\n`;
      receitasAgrupadas[nome].forEach(item => {
        const jaTemNumero = /^\d/.test(item.nome);
        const textoItem = (item.quantidade > 1 && !jaTemNumero)
          ? `${item.quantidade} ${item.unidade || ""} ${item.nome}`
          : item.nome;
        textoParaCelular += `[ ] ${textoItem}\n`;
      });
      textoParaCelular += "\n";
    });

    window.QRCode.toCanvas(canvas, textoParaCelular, {
      width: 200,
      margin: 1,
      color: { dark: "#111827", light: "#ffffff" }
    }, (erro) => {
      if (erro) {
        console.error("Erro no QR Code:", erro);
      } else {
        container.style.display = "block";
      }
    });
  });

  /// 📲 ENVIAR PARA WHATSAPP - 17/05/2026
  // ------------------------------------------------------------------------
  
     document.getElementById("btnWhats")?.addEventListener("click", () => {

      const itensAtuais = JSON.parse(localStorage.getItem("listaCompras")) || [];
      const itensPendentes = itensAtuais.filter(
        i => i && i.nome && !comprados.includes(i.nome)
      );

      if (itensPendentes.length === 0) {
        alert("Sua lista está vazia ou você já comprou tudo! 🎉");
        return;
      }

      const receitasAgrupadas = {};
      itensPendentes.forEach(item => {
        const nomeReceita = item.receitaOrigem || "Outras Receitas";

        if (!receitasAgrupadas[nomeReceita]) {
          receitasAgrupadas[nomeReceita] = [];
        }
        receitasAgrupadas[nomeReceita].push(item);
      });

      let mensagem = "🛒 *MINHA LISTA DE COMPRAS - NUTRIDICAS*\n\n";

      Object.keys(receitasAgrupadas).forEach(nomeDaReceita => {

        const tituloLimpo = nomeDaReceita
          .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
          .trim();

        mensagem += `📋 *${tituloLimpo.toUpperCase()}*\n`;

        receitasAgrupadas[nomeDaReceita].forEach(item => {
          const jaTemNumero = /^\d/.test(item.nome);

          let textoItem = (
            item.quantidade > 1 && !jaTemNumero
          )
            ? `${item.quantidade} ${item.unidade || ""} ${item.nome}`
            : item.nome;

          textoItem = textoItem
            .replaceAll("<strong>", "*")
            .replaceAll("</strong>", "*")
            .replaceAll("<b>", "*")
            .replaceAll("</b>", "*");

          const textoItemLimpo = textoItem
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .trim();

          mensagem += `◽ ${textoItemLimpo}\n`;
        });

        mensagem += "\n";
      });

      mensagem += "_Gerado por NutriDicas.com.br_ 🌾";

      // Copia em background
      navigator.clipboard.writeText(mensagem).catch(() => {});

      // Abre WhatsApp com mensagem pronta
      const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");      
    })

  // 🗑️ LIMPAR LISTA
  document.getElementById("btnLimpar")?.addEventListener("click", () => {
    localStorage.removeItem("listaCompras");
    localStorage.removeItem("comprados");
    itens = [];
    comprados = [];
    
    const qrContainer = document.getElementById("qrContainer");
    if (qrContainer) qrContainer.style.display = "none";
    
    renderizar();
  });
});



