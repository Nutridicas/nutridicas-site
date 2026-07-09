// arquivo criado para a página nutridicas.html - 25/05/2026
// Alterado 26/05/2026

// Função para carregar os dados

async function carregarNutricao() {
    try {
        const response = await fetch('/nutridicas');

        if (!response.ok) {
            throw new Error('Erro ao carregar dados nutricionais');
        }

        const data = await response.json();
        console.log('Dados carregados:', data);

        renderizarHeader(data);
        renderizarDiretrizes(data.diretrizesGerais);
        renderizarFaixas(data.faixasEtarias);
        renderizarMulheres(data.mulheres || data.Mulheres);
        renderizarNutrientes(data.nutrientes);
        renderizarSugestoes(data.sugestoesDeConsumo);
        renderizarRestricoes(data.restricoesAlimentares);
        renderizarObjetivos(data.objetivosAlimentares);

        iniciarBusca();

    } catch (error) {
        console.error("Erro ao carregar o JSON:", error);

        document.body.innerHTML += `
            <div class="erro-json">
                ❌ Erro ao carregar dados nutricionais
            </div>
        `;
    }
}

// ===============================
// HEADER
// ===============================

function renderizarHeader(data) {

    const header = document.getElementById('header-content');

    header.innerHTML = `
        
        <div class="hero-info">

            <span class="badge-versao">
                Versão ${data.versao}
            </span>

            <span class="badge-data">
                Atualizado em ${formatarData(data.ultimaAtualizacao)}
            </span>

        </div>

        <div class="hero-nutricao">

            <h1>${data.titulo}</h1>

            <h3>${data.avisoLegal}</h3>

            <p class="descricao-principal">
                 ${data.descricao}
            </p>
        </div>
    `;
}

// ===============================
// DIRETRIZES
// ===============================

function renderizarDiretrizes(diretrizes) {

    const container = document.getElementById('diretrizes');

    if (!container || !diretrizes) return;

    container.innerHTML = diretrizes.map(item => `

        <div class="card diretriz-card searchable">

            <h3>✅ ${item.titulo}</h3>

            <p>${item.descricao}</p>

        </div>

    `).join('');
}

// ===============================
// FAIXAS ETÁRIAS
// ===============================

function renderizarFaixas(faixas) {

    const container = document.getElementById('faixas-etarias');

    if (!container || !faixas) return;

    container.innerHTML = faixas.map(faixa => `

        <div class="card faixa-card searchable">

            <div class="faixa-header">

                <h2>
                    ${capitalizar(faixa.tipo)}
                </h2>

                <span class="badge">
                    ${faixa.idade}
                </span>

            </div>

            <div class="alimentacao-grid">

                ${renderizarRefeicao(
                    "☀️ Café da Manhã",
                    faixa.alimentacao?.cafeDaManha
                )}

                ${renderizarRefeicao(
                    "🍛 Almoço",
                    faixa.alimentacao?.almoco
                )}

                ${renderizarRefeicao(
                    "🌙 Jantar",
                    faixa.alimentacao?.jantar
                )}

            </div>

            <div class="info-extra">

                <div class="atividade-box">

                    <h4>🍓 Frutas sugeridas</h4>

                    <ul>
                        ${faixa.alimentacao?.frutasIndicadas?.map(fruta => `
                            <li>
                                <a href="${fruta.link}">${fruta.nome}</a>
                            </li>
                        `).join('')}
                    </ul>

                </div>

            </div>

           <div class="info-extra">

                <div class="atividade-box">

                    <h4>🏃 Atividades Físicas</h4>

                    <ul>
                        ${faixa.atividadeFisica?.map(a => `
                            <li>${a}</li>
                        `).join('')}
                    </ul>

                </div>

                <div class="sono-box">

                    <h4>😴 Sono</h4>

                    <p>
                        ${faixa.sono?.horasRecomendadas || '-'}
                    </p>

                </div>

                <div class="calorias-box">

                    <h4>🔥 Consumo Calórico</h4>

                    <p>
                        ${faixa.consumoCalorico?.mediaDiaria || '-'}
                    </p>

                </div>

            </div>

        </div>

    `).join('');
}

// ===============================
// REFEIÇÕES
// ===============================

function renderizarRefeicao(titulo, refeicao) {

    if (!refeicao) return '';

    return `
        <div class="refeicao-box">

            <h3>${titulo}</h3>

            <p class="dica-refeicao">
                ${refeicao.dica || ''}
            </p>

            ${refeicao.receitasSugeridas?.length ? `
                <div class="receitas-box">

                    <h4>🍽️ Receitas Sugeridas</h4>

                    ${refeicao.receitasSugeridas.map(r => `
                        <a 
                            href="${r.link}" 
                            class="receita-link"
                        >
                            ➜ ${r.nome}
                        </a>
                    `).join('')}

                </div>
            ` : ''}

            ${refeicao.frutasIndicadas?.length ? `
                <div class="frutas-box">

                    <h4>🍎 Frutas Indicadas</h4>

                    <div class="frutas-tags">

                        ${refeicao.frutasIndicadas.map(f => `
                            <a 
                                href="${f.link}" 
                                class="fruit-tag"
                            >
                                ${f.nome}
                            </a>
                        `).join('')}

                    </div>

                </div>
            ` : ''}

        </div>
    `;
}

// ===============================
// MULHERES / GESTANTES
// ===============================

function renderizarMulheres(mulheres) {

    const container = document.getElementById('mulheres-grid');

    if (!container || !mulheres) return;

    container.innerHTML = mulheres.map(item => `

        <div class="card mulheres-card searchable">

            <div class="faixa-header">

                <h2>
                    🤰 ${capitalizar(item.tipo)}
                </h2>

                <span class="badge">
                    ${item.idade}
                </span>

            </div>

            <div class="alimentacao-grid">

                ${renderizarRefeicao(
                    "☀️ Café da Manhã",
                    item.alimentacao?.cafeDaManha
                )}

                ${renderizarRefeicao(
                    "🍛 Almoço",
                    item.alimentacao?.almoco
                )}

                ${renderizarRefeicao(
                    "🌙 Jantar",
                    item.alimentacao?.jantar
                )}

            </div>

            <div class="info-extra">

                <div class="atividade-box">

                    <h4>🏃 Atividades Físicas</h4>

                    <ul>
                        ${item.atividadeFisica?.map(a => `
                            <li>${a}</li>
                        `).join('')}
                    </ul>

                </div>

                <div class="sono-box">

                    <h4>😴 Sono</h4>

                    <p>${item.sono?.horasRecomendadas}</p>

                </div>

                <div class="calorias-box">

                    <h4>🔥 Consumo Calórico</h4>

                    <p>${item.consumoCalorico?.mediaDiaria}</p>

                </div>

            </div>

        </div>

    `).join('');
}

// ===============================
// NUTRIENTES
// ===============================

function renderizarNutrientes(nutrientes) {

    const container = document.getElementById('nutrientes-grid');

    if (!container || !nutrientes) return;

    const vitaminas = nutrientes.vitaminas || [];
    const minerais = nutrientes.minerais || [];

    const todos = [...vitaminas, ...minerais];

    container.innerHTML = todos.map(n => `

        <div class="card nutriente-card searchable">

            <div class="nutriente-header">

                <h3>${n.nome}</h3>

            </div>

            <p class="funcao">
                ${n.funcao}
            </p>

            ${n["quem pode consumir"]?.length ? `

                <div class="secao">

                    <h4>👥 Quem pode consumir</h4>

                    <ul class="consumo-lista">

                        ${n["quem pode consumir"].map(item => {

                            const key = Object.keys(item)[0];

                            return `
                                <li>
                                    <strong>${key}:</strong>
                                    ${item[key]}
                                </li>
                            `;
                        }).join('')}

                    </ul>

                </div>

            ` : ''}

            ${n.fontes?.length ? `

                <div class="secao">

                    <h4>🥗 Fontes Alimentares</h4>

                    <ul class="fontes-lista">

                        ${n.fontes.map(f => `
                            <li>${f}</li>
                        `).join('')}

                    </ul>

                </div>

            ` : ''}

        </div>

    `).join('');
}

// ===============================
// SUGESTÕES DE CONSUMO
// ===============================

function renderizarSugestoes(sugestoes) {

    const container = document.getElementById('sugestoes-grid');

    if (!container || !sugestoes) return;

    container.innerHTML = Object.entries(sugestoes).map(([key, item]) => `

        <div class="card searchable">

            <h3>
                ${formatarTitulo(key)}
            </h3>

            <p>
                <strong>
                    ${item.quantidadeDiaria}
                </strong>
            </p>

            <p>
                ${item.recomendacao || ''}
            </p>

        </div>

    `).join('');
}

// ===============================
// RESTRIÇÕES
// ===============================

function renderizarRestricoes(restricoes) {

    const container = document.getElementById('restricoes-grid');

    if (!container || !restricoes) return;

    container.innerHTML = restricoes.map(r => `

        <div class="card searchable">

            <h3>
                ⚠️ ${capitalizar(r.tipo)}
            </h3>

            <p>
                ${r.descricao}
            </p>

        </div>

    `).join('');
}

// ===============================
// OBJETIVOS
// ===============================

function renderizarObjetivos(objetivos) {

    const container = document.getElementById('objetivos-grid');

    if (!container || !objetivos) return;

    container.innerHTML = objetivos.map(o => `

        <div class="card searchable">

            <h3>
                🎯 ${formatarTitulo(o.objetivo)}
            </h3>

            <p>
                ${o.descricao}
            </p>

        </div>

    `).join('');
}

// ===============================
// BUSCA
// ===============================

function iniciarBusca() {

    const input = document.getElementById('searchNutricao');

    if (!input) return;

    input.addEventListener('input', () => {

        const termo = input.value.toLowerCase();

        const cards = document.querySelectorAll('.searchable');

        cards.forEach(card => {

            const texto = card.innerText.toLowerCase();

            card.style.display = texto.includes(termo)
                ? 'block'
                : 'none';

        });

    });
}

// ===============================
// HELPERS
// ===============================

function capitalizar(texto = '') {

    return texto.charAt(0).toUpperCase() +
        texto.slice(1);
}

function formatarTitulo(texto = '') {

    return texto
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

function formatarData(data) {

    if (!data) return '';

    return new Date(data).toLocaleDateString('pt-BR');
}

// ===============================
// START
// ===============================

document.addEventListener('DOMContentLoaded', () => {

    carregarNutricao();

});
