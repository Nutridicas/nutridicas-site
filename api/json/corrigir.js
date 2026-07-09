// corrigir id
const fs = require("fs");
const { randomUUID } = require("crypto");

const data = JSON.parse(fs.readFileSync("receitas.json"));

data.forEach(r => {
  if (!r.id || r.id === "uuid") {
    r.id = randomUUID();
  }
});

fs.writeFileSync("receitas.json", JSON.stringify(data, null, 2));