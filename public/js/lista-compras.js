document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("listaCategorias");
  const contador = document.getElementById("contador");
  const barra = document.getElementById("barraProgresso");

  let itens = JSON.parse(localStorage.getItem("listaCompras")) || [];
  let comprados = JSON.parse(localStorage.getItem("comprados")) || [];

  // ============================
  // 🧠 NORMALIZAR DADOS ANTIGOS
  // ============================
  if (itens.length && typeof itens[0] === "string") {
    itens = itens.map(nome => ({
      nome,
      categoria: "Outros"
    }));
    localStorage.setItem("listaCompras", JSON.stringify(itens));
  }

// ============================
// 🛡️ GARANTIR CATEGORIA - 21/02/26
// ============================

itens = itens
  .filter(item => item && item.nome)
  .map(item => ({
    nome: item.nome,
    categoria: item.categoria || "Outros"
  }));

localStorage.setItem("listaCompras", JSON.stringify(itens));


  // ============================
  // 📊 PROGRESSO
  // ============================
  function atualizarProgresso() {

  const nomesValidos = itens.map(i => i.nome);
  comprados = comprados.filter(nome => nomesValidos.includes(nome));

  localStorage.setItem("comprados", JSON.stringify(comprados));

  const total = itens.length;
  const feitos = itens.filter(i => comprados.includes(i.nome)).length;

  const porcentagem = total === 0 ? 0 : (feitos / total) * 100;

  if (barra) barra.style.width = porcentagem + "%";
  if (contador) contador.textContent = `${feitos} de ${total} comprados`;
}

//
// ============================
// 🧠 NORMALIZAR FORMATO (STRING → OBJETO)
// ============================
itens = itens
  .filter(item => item) // remove null/undefined
  .map(item => {

    // Se for string antiga
    if (typeof item === "string") {
      return {
        nome: item,
        categoria: "Outros"
      };
    }

    // Se já for objeto correto
    if (item.nome) {
      return {
        nome: item.nome,
        categoria: item.categoria || "Outros"
      };
    }

    return null;
  })
  .filter(Boolean);

localStorage.setItem("listaCompras", JSON.stringify(itens));


  // ============================
  // 🎨 RENDERIZAR - Atualizada para somar unidades - 22/02/26
  // ============================
  function renderizar() {

  const itens = JSON.parse(localStorage.getItem("listaCompras")) || [];
  const container = document.getElementById("listaCategorias");

  if (!container) return;

  container.innerHTML = "";

  if (itens.length === 0) {
    container.innerHTML = "<p style='opacity:.6'>Nenhum item na lista</p>";
    return;
  }

  const categorias = {};

  itens.forEach(item => {
    const cat = item.categoria || "Outros";

    if (!categorias[cat]) {
      categorias[cat] = [];
    }

    categorias[cat].push(item);
  });

  Object.keys(categorias).forEach(cat => {

    const bloco = document.createElement("div");
    bloco.className = "categoria-bloco";

    const titulo = document.createElement("div");
    titulo.className = "categoria-titulo";
    titulo.textContent = "📦 " + cat;

    bloco.appendChild(titulo);

    categorias[cat].forEach(item => {

      const card = document.createElement("div");
      card.className = "item-card";

      if (comprados.includes(item.nome)) {
        card.classList.add("comprado");
      }

      const span = document.createElement("span");

      // 🔥 AQUI ESTÁ A MUDANÇA
      let texto;

      if (item.quantidade > 1) {
        texto = `${item.quantidade} ${pluralizar(item.unidade || item.nome, item.quantidade)} ${item.unidade ? item.nome : ""}`;
      } else {
        texto = `1 ${item.unidade ? item.unidade + " " + item.nome : item.nome}`;
      }

      span.textContent = texto.trim();

      const btn = document.createElement("button");
      btn.textContent = "✔️";
      btn.addEventListener("click", () => toggleItem(item.nome));

      card.appendChild(span);
      card.appendChild(btn);
      bloco.appendChild(card);
    });

    container.appendChild(bloco);
  });

  atualizarProgresso();
}

//===========================
// Função adicionar Receitas
//============================
function adicionarReceita(receitaSelecionada) {

 console.log("Receita recebida:", receitaSelecionada);
 
  const itensAtuais = JSON.parse(localStorage.getItem("listaCompras")) || [];

  const novosItens = receitaSelecionada.ingredientes.map(i => ({
    nome: i,
    categoria: "Outros"
  }));

  const listaAtualizada = [...itensAtuais, ...novosItens];

  localStorage.setItem("listaCompras", JSON.stringify(listaAtualizada));

  renderizar();
}

  // ============================
  // ✔️ TOGGLE ITEM
  // ============================
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

  
// ============================
// 🔁 UNIFICAR AUTOMATICAMENTE (VERSÃO SEGURA)
// ============================
function agruparPendentes(lista) {

  const mapa = {};

  lista.forEach(item => {

    if (!item) return;

    let nome = typeof item === "string" ? item : item.nome;
    let categoria = typeof item === "object" ? (item.categoria || "Outros") : "Outros";

    const match = nome.match(/^(\d+)\s+(.*)$/);

    let quantidade = 1;
    let nomeLimpo = nome.toLowerCase().trim();

    if (match) {
      quantidade = parseInt(match[1]);
      nomeLimpo = match[2].toLowerCase().trim();
    }

    if (!mapa[nomeLimpo]) {
      mapa[nomeLimpo] = {
        quantidade: 0,
        categoria
      };
    }

    mapa[nomeLimpo].quantidade += quantidade;
  });

  return Object.keys(mapa).map(nome => ({
    nome,
    quantidade: mapa[nome].quantidade,
    categoria: mapa[nome].categoria
  }));
}

  // ============================
  // 🗑️ LIMPAR
  // ============================
  document.getElementById("btnLimpar")?.addEventListener("click", () => {
    localStorage.removeItem("listaCompras");
    localStorage.removeItem("comprados");
    itens = [];
    comprados = [];
    renderizar();
  });

  // ============================
  // 🖨️ IMPRIMIR
  // ============================
  document.getElementById("btnPrint")?.addEventListener("click", () => {
    window.print();
  });

  // ============================
  // 🖨️ BOTÃO PDF
  // ============================
  document.getElementById("btnPDF")?.addEventListener("click", () => {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const nomeReceita =
    localStorage.getItem("ultimaReceita") || "Lista-Nutrichef";

  const pendentesRaw = itens.filter(i => !comprados.includes(i.nome));

  if (pendentesRaw.length === 0) {
    alert("Tudo comprado 🎉");
    return;
  }
// começo
   const tipoSelecionado = document.getElementById("tipoPDF").value;

  // salva preferência
  localStorage.setItem("tipoPDFPreferido", tipoSelecionado);

  if (tipoSelecionado === "cupom") {
    gerarPDFCupom();
  } else {
    gerarPDFPremium();
  }

});
// fim
  const pendentes = agruparPendentes(pendentesRaw);

  // ===== CABEÇALHO MODERNO DO PDF =====
  doc.setFillColor(16, 185, 129); // verde moderno
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Nutrichef", 20, 18);

  doc.setFontSize(12);
  doc.text(nomeReceita, 20, 27);

  // Reset cor
  doc.setTextColor(0, 0, 0);

  let y = 50;

  const categorias = {};

  pendentes.forEach(item => {
    if (!categorias[item.categoria]) {
      categorias[item.categoria] = [];
    }
    categorias[item.categoria].push(item);
  });

  Object.keys(categorias).forEach(cat => {

    doc.setFont(undefined, "bold");
    doc.setFontSize(13);
    doc.text(cat.toUpperCase(), 20, y);
    y += 10;

    doc.setFont(undefined, "normal");
    doc.setFontSize(12);

    categorias[cat].forEach(item => {

      const texto =
  item.quantidade > 1
    ? `☐ ${item.quantidade} ${pluralizar(item.unidade || item.nome, item.quantidade)} ${item.unidade ? item.nome : ""}`
    : `☐ 1 ${item.unidade ? item.unidade + " " + item.nome : item.nome}`;

      doc.text(texto, 25, y);
      y += 8;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 5;
  });

  // ===== RODAPÉ PREMIUM =====
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Gerado por Nutrichef • Lista inteligente de compras",
    20,
    290
  );


// Abrir PDF em nova aba
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
});


  // ============================
  // 📲 WHATSAPP
  // ============================
  document.getElementById("btnWhats")?.addEventListener("click", () => {

    const pendentes = itens
      .filter(i => !comprados.includes(i.nome))
      .map(i => `☐ ${i.nome}`)
      .join("\n");

    if (!pendentes) {
      alert("Tudo comprado 🎉");
      return;
    }

    const mensagem = `🛒 Minha Lista Nutrichef:\n\n${pendentes}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
  });

  renderizar();
});

//=============================
// PLURAL INTELIGENTE DAS QUANTIDADES - 22/02/26
//==================

function pluralizar(palavra, quantidade) {

  if (quantidade <= 1) return palavra;

  if (palavra.endsWith("r"))
    return palavra + "es"; // colher → colheres

  if (palavra.endsWith("ão"))
    return palavra.replace("ão", "ões");

  if (palavra.endsWith("s"))
    return palavra;

  return palavra + "s";
}

//=======================
//


