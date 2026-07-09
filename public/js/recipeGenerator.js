import { resolveIngredient } from "./ingredientResolver.js";
import { transformInstructions } from "./instructionTransformer.js";

export function generateRecipeVersion({
  recipe,
  contexto,
  restricoes = []
}) {
  const newIngredients = recipe.ingredientes.map(ing => {
    return resolveIngredient(ing, contexto, restricoes);
  });

  const newInstructions = transformInstructions(
    recipe.preparo,
    newIngredients
  );

  return {
    ...recipe,
    versionGerada: true,
    restricoesAplicadas: restricoes,
    ingredientes: newIngredients,
    preparo: newInstructions
  };
}