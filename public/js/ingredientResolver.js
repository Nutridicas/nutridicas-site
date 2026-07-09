import db from "../data/substituicoes.json";
import { getBestSubstitution } from "../engine/substituteEngine.js";

export function resolveIngredient(ingredientText, contexto, restricoes) {
  const match = findIngredientInDB(ingredientText, db);

  if (!match) {
    return {
      original: ingredientText,
      substituido: false
    };
  }

  const substitution = getBestSubstitution({
    ingrediente: match.id,
    contexto,
    restricoes
  });

  if (!substitution.best) {
    return {
      original: ingredientText,
      substituido: false
    };
  }

  return {
    original: ingredientText,
    substituido: true,
    novo: substitution.best.nome,
    detalhes: substitution.best
  };
}