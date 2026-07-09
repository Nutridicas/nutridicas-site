// Arquivo para exibir medidas caseiras - criado 28/03/2026
// Atualizado 30/03/2026 - criar modal maos bonito e con animação

async function carregarMedidas() {
  const res = await fetch('/medidas');
  return await res.json();
}

// animação para o modal

function abrirModal() {
  const modal = document.getElementById("meuModal");
  modal.style.display = "flex"; // 🔥 isso faltava
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

function fecharModal() {
  const modal = document.getElementById("meuModal");

  modal.classList.remove("show");

  // espera a animação terminar antes de esconder
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

//renderizar modal

async function renderMedidas() { 
  const data = await carregarMedidas();
  const container = document.getElementById('conteudoMedidas');

  // limpa antes de renderizar
  container.innerHTML = "";

  // 🔹 TÍTULO DO MODAL
  const title = document.createElement('h1');
  title.textContent = "Medidas Caseiras";
  title.classList.add('modal-title');
  container.appendChild(title);

  data.secoes.forEach(sec => {

    // 🔹 CARD DA SEÇÃO
    const card = document.createElement('div');
    card.classList.add('card-secao');

    const subtitle = document.createElement('h3');
    subtitle.textContent = sec.titulo;
    card.appendChild(subtitle);

    // 🔹 LISTA
    if (sec.tipo === 'lista') {
      const list = document.createElement('div');
      list.classList.add('lista');

      sec.itens.forEach(i => {
        const item = document.createElement('div');
        item.classList.add('item-lista');
        item.innerHTML = `<span>${i.nome}</span><strong>${i.ml}</strong>`;
        list.appendChild(item);
      });

      card.appendChild(list);
    }

    // 🔹 TABELA
    if (sec.tipo === 'tabela') {
      const table = document.createElement('table');

      const thead = document.createElement('thead');
      const trHead = document.createElement('tr');

      sec.colunas.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
      });

      thead.appendChild(trHead);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');

      sec.linhas.forEach(linha => {
        const tr = document.createElement('tr');

        linha.forEach(c => {
          const td = document.createElement('td');
          td.textContent = c;
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      card.appendChild(table);
    }

    container.appendChild(card);
  });
}

renderMedidas();

