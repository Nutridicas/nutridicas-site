// ===============================================
// 🔎 BUSCA WORKER NUTRIDICAS - Criado 03/06/2025
// otimizado para grandes volumes
// ===============================================

function normalizarTexto(txt){

if(!txt) return "";

return txt
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase();

}

// plural simples
function expandirPlural(p){

if(p.endsWith("s"))
return [p,p.slice(0,-1)];

return [p,p+"s"];

}

self.onmessage = function(e){

const {indiceBusca, termo} = e.data;

const palavras = normalizarTexto(termo).split(" ");

let resultados = [];

palavras.forEach(p=>{

const variantes = expandirPlural(p);

variantes.forEach(v=>{

if(indiceBusca[v])
resultados.push(...indiceBusca[v]);

});

});

// remover duplicados

const unicos = [...new Map(
resultados.map(r=>[r.s,r])
).values()];

// limite de segurança

postMessage(unicos.slice(0,30));

};