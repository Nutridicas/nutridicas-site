//=====================================
// Arquivo criado em 22/03/2026 para armazenar as medidas caseiras


async function carregarMedidas() {
  const res = await fetch('/json/medidas.json');
  return await res.json();
}

function abrirModal() {
  document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}

async function renderMedidas() {
  const data = await carregarMedidas();
  const container = document.getElementById('conteudoMedidas');

  data.secoes.forEach(sec => {
    const title = document.createElement('h3');
    title.textContent = sec.titulo;
    container.appendChild(title);

    if (sec.tipo === 'lista') {
      sec.itens.forEach(i => {
        const p = document.createElement('p');
        p.textContent = `${i.nome} — ${i.ml}`;
        container.appendChild(p);
      });
    }

    if (sec.tipo === 'tabela') {
      const table = document.createElement('table');

      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      sec.colunas.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
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
      container.appendChild(table);
    }
  });
}

renderMedidas();