// Arquivo de termos culinários - Criado 10/06/2026

// Elementos capturados do seu HTML existente
const metaInfoElement = document.getElementById('meta-info');
const gridElement = document.getElementById('terms-grid');
const searchInput = document.getElementById('search');

// Array global para gerenciar os dados em memória
let listaDeTermos = [];

async function inicializarPagina() {
    try {
        // 1. Faz a requisição para o seu arquivo completo de dados
        const resposta = await fetch('/termos-culinarios');
        if (!resposta.ok) throw new Error(`Erro ao ler os dados: ${resposta.status}`);
        
        const dadosGastronomia = await resposta.json();
        
        // Atualiza os metadados do seu cabeçalho
        if (dadosGastronomia.Arquivo && dadosGastronomia.Versão) {
            metaInfoElement.textContent = `Versão: ${dadosGastronomia.Versão}`;
        }

        // 2. Verifica se existe um parâmetro "slug" na URL (vindo do "Saiba mais")
        const parametrosURL = new URLSearchParams(window.location.search);
        const slugBuscado = parametrosURL.get('slug');

        if (slugBuscado) {
            // Esconde a barra de pesquisa pois o usuário quer ver apenas um termo específico
            if (searchInput) searchInput.parentElement.style.display = 'none';
            
            const termoEncontrado = dadosGastronomia[slugBuscado];
            
            if (termoEncontrado) {
                // Modifica o título da aba do navegador dinamicamente
                document.title = `${termoEncontrado.nome} - Dicionário Gastronômico`;
                
                // Exibe apenas o card detalhado
                renderizarCards([termoEncontrado], true);
            } else {
                gridElement.innerHTML = `<div class="no-results">Termo técnico não encontrado no banco de dados.</div>`;
            }
        } else {
            // Se não há slug na URL, popula a lista e exibe todos os termos normalmente
            Object.keys(dadosGastronomia).forEach(chave => {
                if (chave !== 'Arquivo' && chave !== 'Versão') {
                    listaDeTermos.push(dadosGastronomia[chave]);
                }
            });
            renderizarCards(listaDeTermos, false);
        }

    } catch (erro) {
        console.error('Erro crítico na aplicação:', erro);
        gridElement.innerHTML = `<div class="no-results">Não foi possível carregar as informações gastronômicas.</div>`;
    }
}

// Função responsável por gerar o HTML dos cards baseado na estrutura do seu JSON
function renderizarCards(termos, modoDetalhe) {
    gridElement.innerHTML = '';

    if (termos.length === 0) {
        gridElement.innerHTML = `<div class="no-results">Nenhum termo culinário encontrado para a sua busca.</div>`;
        return;
    }

    termos.forEach(termo => {
        // Processa o array de aplicações do novo formato se ele existir
        let aplicacoesHTML = '';
        if (modoDetalhe && termo.aplicacoes && termo.aplicacoes.length > 0) {
            aplicacoesHTML = `
                <div class="card-aplicacoes" style="margin-top: 1rem; border-top: 1px dashed #e5e7eb; padding-top: 1rem;">
                    <strong style="display: block; margin-bottom: 0.5rem; color: #1f2937;">Aplicações Comuns:</strong>
                    <ul style="padding-left: 1.25rem; color: #6b7280; font-size: 0.9rem;">
                        ${termo.aplicacoes.map(app => `<li style="margin-bottom: 0.25rem;">${app}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Adiciona um botão de retorno caso esteja visualizando apenas um termo isolado
        const botaoVoltarHTML = modoDetalhe 
            ? `<a href="javascript:history.back()" style="display: inline-block; margin-bottom: 1rem; color: #c2410c; text-decoration: none; font-weight: 600;">← Voltar para a listagem</a>` 
            : '';

        // Localize este trecho dentro da função renderizarCards no seu termos.js:
        const cardHTML = `
            ${modoDetalhe ? `<div class="card-container-detalhe animar-entrada">${botaoVoltarHTML}` : ''}
                <article class="card ${!modoDetalhe ? 'animar-entrada' : ''}">
                    <div class="card-header">
                        <h2 class="card-title">${termo.nome}</h2>
                        <span class="badge">${termo.categoria}</span>
                    </div>
                    <p class="short-desc">${termo.descricao_curta}</p>
                    <p class="full-desc">${termo.descricao}</p>
                    <div class="identify-box">
                        <strong>Como identificar:</strong>
                        ${termo.como_identificar || 'Critério de identificação não fornecido.'}
                    </div>
                    ${aplicacoesHTML}
                </article>
            ${modoDetalhe ? `</div>` : ''}
        `;
        gridElement.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Ouvinte de evento para a caixa de busca (utilizado apenas na listagem geral)
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const termoBuscado = e.target.value.toLowerCase().trim();
        
        const termosFiltrados = listaDeTermos.filter(termo => {
            return termo.nome.toLowerCase().includes(termoBuscado) || 
                   termo.descricao_curta.toLowerCase().includes(termoBuscado) ||
                   termo.descricao.toLowerCase().includes(termoBuscado);
        });

        renderizarCards(termosFiltrados, false);
    });
}

// Dispara a execução da página
inicializarPagina();
