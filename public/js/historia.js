// Exibir curiosidades - criado 07/04/2026

// Função para carregar curiosidades e história da receita

async function carregarHistoria() {

  try {
    // 1️⃣ Buscar arquivo JSON
    const response = await fetch('/receitas-historia');
    if (!response.ok) throw new Error('Não foi possível carregar receitas-historia.json');

    const data = await response.json();

    // 2️⃣ Pegar o slug da URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    // 3️ Buscar a receita no JSON
    const receita = data[slug];
    const container = document.getElementById('caaixainfo');

    if (!receita) {
      container.innerHTML = '<p>Ainda não tenho nada a falar sobre essa receita.</p>';
      return;
    }

    // 4️⃣ Construir HTML moderno e bonito
    // ... dentro da sua função carregarHistoria ...

    // 4️⃣ Construir HTML com hierarquia visual - Modificado 23/04/2026
    // Verifica se o texto é longo para aplicar estilo diferenciado
    const isLongo = receita.origem.length > 60;
    const classeOrigem = isLongo ? 'origem-longa' : 'origem-curta';

    let html = `
    <div class="editorial">

        ${receita.imagemReceita ? `
          <div class="editorial-img">
            <img src="/imagens/historia/${receita.imagemReceita}" 
                 alt="Imagem da receita" 
                 width="680" 
                 height="150">

            <p class="texto-centralizado">${receita.credito}</p>

            <p class="texto-centralizado">
              Disponível em: ${receita.end}
            </p>
          </div>
        ` : ''}
   </div>

      <p class="editorial-origem">
        ${receita.origem}
      </p>

      <h4 class="editorial-subtitulo">Fato Curioso</h4>
      <p class="editorial-curiosidade">
        ${receita.evolucaoTecnica}
      </p>

      <p class="editorial-curiosidade">
        ${receita.curiosidade}
      </p>

      <h4 class="editorial-subtitulo">Etimologia</h4>
      <p class="editorial-curiosidade">
        ${receita.etimologia}
      </p>

      <h4 class="editorial-subtitulo">Contexto histórico</h4>
      <p class="editorial-curiosidade">
        ${receita.personagemChave}
      </p>
      <p class="editorial-curiosidade">
        ${receita.contextoGeopolitico}
      </p>
    `;
    if (receita.historia && receita.historia.length > 0) {
  html += `
    <h4 class="editorial-subtitulo">Mais curiosidades</h4>

    <div class="editorial-lista">
      ${receita.historia.map((item, index) => `
        <div class="editorial-item">
          <span class="editorial-num">${(index + 1).toString().padStart(2, '0')}</span>
          <p>${item}</p>
        </div>
      `).join('')}
    </div>
  `;
}
      html += `</div>`;
      container.innerHTML = html;

    } catch (error) {
      console.error('Erro ao carregar história:', error);
      document.getElementById('caaixainfo').innerHTML = '<p>Erro ao carregar informações.</p>';
    }
  }

// Chamar a função quando a página terminar de carregar
window.addEventListener('DOMContentLoaded', carregarHistoria);

