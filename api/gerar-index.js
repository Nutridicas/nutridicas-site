const fs = require("fs");
const path = require("path");

const receitas = JSON.parse(
fs.readFileSync("./json/receitas.json","utf8")
);

const index = receitas.map(r=>{

const v = r.versoes?.[0]?.conteudo || {};

return {

s: r.slug,

t: r.titulo || "",

c: `${v.categoria || ""} ${v.subcategoria || ""} ${v.dificuldade || ""}`,

i: (v.ingredientes || []).join(" "),

g: `${(r.restricoes || []).join(" ")} ${(r.tags || []).join(" ")}`,

img: r.imagem || "sem-foto.jpg"

};

}); // ← faltava isso

fs.writeFileSync(
"./public/receitas-index.json",
JSON.stringify(index, null, 2)
);

console.log("✅ Índice criado!");