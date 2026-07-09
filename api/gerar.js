router.post("/receita/gerar", (req, res) => {
  const { receitaId, restricoes, contexto } = req.body;

  const receita = getRecipe(receitaId);

  const gerada = generateRecipeVersion({
    recipe: receita,
    contexto,
    restricoes
  });

  res.json(gerada);
});