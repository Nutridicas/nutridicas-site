const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin, output: process.stdout
});

const fileName = 'receitas.json';
const FRASE_NUTRI_PADRAO = "Valores aproximados para uma dieta de 2.000 Cal diárias";
const LIMITE_CARACTERES = 90;

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function processarSeguro() {
    try {
        const data = fs.readFileSync(fileName, 'utf8');
        let receitas = JSON.parse(data);
        const ehArray = Array.isArray(receitas);
        let lista = ehArray ? receitas : [receitas];

        for (let i = 0; i < lista.length; i++) {
            let r = lista[i];

            // VERIFICAÇÃO DE PULO (Mais robusta)
            const temFrase = r.fraseCurta && String(r.fraseCurta).trim().length > 5;
            const temIntro = r.Introducao && Array.isArray(r.Introducao) && r.Introducao.length > 0;

            if (temFrase && temIntro) {
                console.log(`⏭️  PULANDO: ${r.titulo} (Já possui conteúdo)`);
                continue;
            }

            console.log(`\n=== EDITANDO: ${r.titulo.toUpperCase()} ===`);

            // 1. Coleta fraseCurta
            let inputFrase = (await question(`➤ fraseCurta: `)).trim();
            const finalFrase = inputFrase !== "" ? inputFrase : (r.fraseCurta || "");

            if (finalFrase.length > LIMITE_CARACTERES) {
                console.log(`⚠️  ALERTA: Frase muito longa (${finalFrase.length} caracteres)`);
            }

            // 2. Coleta Introdução
            console.log("➤ Introdução (use '/' para quebrar linhas):");
            let inputIntro = (await question("  > ")).trim();
            let finalIntro;
            
            if (inputIntro !== "") {
                finalIntro = inputIntro.split('/').map(s => s.trim()).filter(s => s).slice(0, 5);
            } else {
                finalIntro = (r.Introducao && r.Introducao.length > 0) ? r.Introducao : [];
            }

            // 3. Reconstrução com Ordem de Chaves e Nutricional Limpo
            const novaReceita = {
                id: r.id,
                slug: r.slug,
                titulo: r.titulo,
                status: r.status,
                imagem: r.imagem,
                topSemana: r.topSemana,
                premium: r.premium,
                tipo: r.tipo,
                tipoMenu: r.tipoMenu,
                categoria: r.categoria,
                subcategoria: r.subcategoria,
                fraseCurta: finalFrase,
                Introducao: finalIntro,
                restricoes: r.restricoes,
                tags: r.tags,
                autor: r.autor,
                avaliacoes: r.avaliacoes,
                relacionadas: r.relacionadas,
                versoes: r.versoes.map(v => {
                    // Remove a frase antiga se existir para não duplicar no objeto
                    const { frase, ...restoNutricional } = v.conteudo.nutricional;
                    return {
                        ...v,
                        conteudo: {
                            ...v.conteudo,
                            nutricional: {
                                frase: FRASE_NUTRI_PADRAO,
                                ...restoNutricional
                            }
                        }
                    };
                })
            };

            lista[i] = novaReceita;

            // Salva após cada edição
            fs.writeFileSync(fileName, JSON.stringify(ehArray ? lista : lista[0], null, 2), 'utf8');
            console.log(`✅ ${r.titulo} atualizado e salvo!`);
        }

        console.log("\n✨ Processamento concluído.");
    } catch (err) {
        console.error("\n❌ Erro crítico:", err.message);
    } finally {
        rl.close();
    }
}

processarSeguro();
