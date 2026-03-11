const fs = require("fs")
const { exec } = require("child_process")

const arquivo = "./json/receitas.json"

console.log("👀 Monitorando receitas.json...")

fs.watchFile(arquivo,()=>{

console.log("🔄 Atualizando índice...")

exec("node gerar-index.js",(err,stdout)=>{

if(err) return console.error(err)

console.log(stdout)

})

})