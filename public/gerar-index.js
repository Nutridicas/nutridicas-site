const fs = require("fs");

function normalizar(txt){

if(!txt) return "";

return txt
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase();

}

const receitas = JSON.parse(
fs.readFileSync("./receitas.json","utf8")
);

const index = receitas.map(r=>({

s: r.slug,

t: normalizar(r.titulo),

c: normalizar(r.categoria),

i: normalizar((r.ingredientes||[]).join(" ")),

g: normalizar((r.tags||[]).join(" "))

}));

fs.writeFileSync(
"./public/receitas-index.json",
JSON.stringify(index)
);

console.log("Index criado com sucesso");