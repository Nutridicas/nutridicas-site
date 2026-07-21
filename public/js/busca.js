// ===============================================
// 🔎 BUSCA PROFISSIONAL NUTRIDICAS
// versão otimizada 03/06/2025
// ===============================================

const sinonimos = {
aipim:"mandioca",
macaxeira:"mandioca",
jerimum:"abobora",

mexerica:"tangerina",
bergamota:"tangerina",

frango:"galinha",
galinha:"frango",

linguica:"linguiça",
linguiça:"linguica",

bode:"ovino",
ovelha:"ovino"
};

let receitasCache = [];
let indiceBusca = {};
let debounceTimer;

// ==========================
// NORMALIZAR TEXTO
// ==========================

function normalizarTexto(texto){

if(!texto) return "";

return texto
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase();

}

// ==========================
// CARREGAR RECEITAS (CACHE)
// ==========================

// Função para tentar resolve ro problema do cache na busca de não aparecer
//nova receitas - 19/07/2026 - final da copa de futebol

async function carregarReceitas(){

    if(receitasCache.length) return;

    try{

        const res = await fetch("/receitas-index", {
            cache: "no-cache"
        });

        if(!res.ok){
            throw new Error("JSON não encontrado");
        }

        receitasCache = await res.json();

        criarIndice(receitasCache);

    }catch(err){
        console.error("Erro ao carregar receitas:", err);
    }

}

// ==========================
// CRIAR INDICE INVERTIDO
// ==========================

function criarIndice(receitas){

	indiceBusca = {};

	receitas.forEach(r=>{

	const campos=[r.t,r.c,r.i,r.g];

	campos.forEach(campo=>{

	if(!campo) return;

		normalizarTexto(campo)
		.split(/\s+/)
		.forEach(p=>{

		if(!indiceBusca[p]) indiceBusca[p]=[];

			indiceBusca[p].push(r);

      });

   });

 });

}

// ==========================
// BUSCA PRINCIPAL
// ==========================

function buscarReceitas(termo){

termo = normalizarTexto(termo);

termo = aplicarSinonimos(termo);

const palavras = termo.split(" ");

let resultados=[];

palavras.forEach(p=>{

if(indiceBusca[p]){

resultados.push(...indiceBusca[p]);

}else{

const corrigido = corrigirBusca(p);

if(indiceBusca[corrigido])
resultados.push(...indiceBusca[corrigido]);

}

});

const unicos=[...new Map(
resultados.map(r=>[r.s,r])
).values()];

return calcularScore(unicos,termo).slice(0,20);

}

// ==========================
// SCORE + POPULARIDADE
// ==========================

function calcularScore(lista,termo){

const ranking =
JSON.parse(localStorage.getItem("rankingReceitas")) || {};

return lista
.map(r=>{

let score=0;

if(normalizarTexto(r.t).includes(termo)) score+=5;
if(normalizarTexto(r.c).includes(termo)) score+=3;
if(normalizarTexto(r.g||"").includes(termo)) score+=2;
if(normalizarTexto(r.i||"").includes(termo)) score+=1;

score += ranking[r.s] || 0;

return {...r,score};

})
.sort((a,b)=>b.score-a.score);

}

// ==========================
// AUTOCOMPLETE
// ==========================

function gerarSugestoes(termo){

termo = normalizarTexto(termo);

return Object.keys(indiceBusca)
.filter(p=>p.startsWith(termo))
.slice(0,5);

}

// ==========================
// CORREÇÃO AUTOMÁTICA
// ==========================

function corrigirBusca(termo){

	const palavras = Object.keys(indiceBusca);

	let melhor = termo;
	let menor = Infinity;

	palavras.forEach(p=>{

	const d = levenshtein(termo,p);

	if(d < menor && d<=2){

	menor=d;
	melhor=p;

    }

  });

  return melhor;

}

// ==========================
// LEVENSHTEIN
// ==========================

function levenshtein(a,b){

const matrix=[];

for(let i=0;i<=b.length;i++) matrix[i]=[i];

for(let j=0;j<=a.length;j++) matrix[0][j]=j;

for(let i=1;i<=b.length;i++){

for(let j=1;j<=a.length;j++){

matrix[i][j] =
b[i-1]==a[j-1]
? matrix[i-1][j-1]
: Math.min(
matrix[i-1][j-1]+1,
matrix[i][j-1]+1,
matrix[i-1][j]+1
);

}

}

return matrix[b.length][a.length];

}

// ==========================
// SINÔNIMOS
// ==========================

function aplicarSinonimos(termo){

return termo
.split(" ")
.map(p=> sinonimos[p] || p)
.join(" ");

}

// ==========================
// HISTÓRICO
// ==========================

function salvarBusca(termo){

let historico =
JSON.parse(localStorage.getItem("historicoBusca")) || [];

historico.unshift(termo);

historico=[...new Set(historico)].slice(0,10);

localStorage.setItem(
"historicoBusca",
JSON.stringify(historico)
);

}

// ==========================
// RANKING
// ==========================

function registrarClique(slug){

let ranking =
JSON.parse(localStorage.getItem("rankingReceitas")) || {};

ranking[slug]=(ranking[slug]||0)+1;

localStorage.setItem(
"rankingReceitas",
JSON.stringify(ranking)
);

}

// ==========================
// DESTACAR TEXTO
// ==========================

function destacarTexto(texto,termo){

if(!texto||!termo) return texto;

const regex =
new RegExp(`(${termo})`,"gi");

return texto.replace(regex,"<mark>$1</mark>");

}

// ==========================
// RENDER RESULTADOS
// ==========================

function renderResultados(lista,termo,container){

if(!lista.length){

	container.innerHTML=
	`<div class="search-item">Nenhuma receita encontrada</div>`;

	container.classList.add("active");

	return;
 }

	container.innerHTML = lista.slice(0,8).map(r=>`

	<div class="search-item"
		onclick="registrarClique('${r.s}');
		window.location.href='receita.html?slug=${r.s}'">

		<img
		class="search-thumb"
		src="imagens/receitas/${r.img || 'sem-foto.jpg'}"
		alt="${r.t}">
	    <div class="search-info">

			<strong>${destacarTexto(r.t,termo)}</strong>
			<small>${destacarTexto(r.c,termo)}</small>

		</div>

	</div>

	`).join("");

	container.classList.add("active");

 }

// ==========================
// INIT BUSCA
// ==========================

document.addEventListener("DOMContentLoaded",()=>{

	const input =
	document.getElementById("searchInput");

	const results =
	document.getElementById("resultadosLista");

	if(!input||!results) return;

	input.addEventListener("input",()=>{

	clearTimeout(debounceTimer);

	debounceTimer=setTimeout(async()=>{

	const termo = input.value.trim();

	if(termo.length<2){

	results.classList.remove("active");
	results.innerHTML="";

     return;
	}

	await carregarReceitas();

	salvarBusca(termo);

	// autocomplete

	const sugestoes = gerarSugestoes(termo);

	if(sugestoes.length){

	results.innerHTML=sugestoes.map(s=>`

	<div class="search-item sugestao"
		onclick="document.getElementById('searchInput').value='${s}'">

		${s}

	</div>

	`).join("");

	}

	// busca

		const resultados =
		buscarReceitas(termo);

		renderResultados(
		resultados,
		termo,
		results
	 );

	 },150);

   });

 });