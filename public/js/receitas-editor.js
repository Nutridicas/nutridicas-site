document.getElementById("receitaForm").addEventListener("submit", e => {
  e.preventDefault();

  const receita = {
    slug: slug.value,
    titulo: titulo.value,
    categoria: categoria.value,
    data: new Date().toISOString().split("T")[0],
    imagem: imagem.value,
    ingredientes: ingredientes.value.split("\n").filter(Boolean),
    preparo: preparo.value.split("\n").filter(Boolean),
    medidas: medidas.value.split("\n").filter(Boolean),
    nutricional: {
      porcao: porcao.value,
      calorias: calorias.value,
      carboidratos: carboidratos.value,
      proteinas: proteinas.value,
      gorduras: gorduras.value
    }
  };

  document.getElementById("saida").textContent = JSON.stringify(receita, null, 2);
});
