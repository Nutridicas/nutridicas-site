function matchCandidates(ingrediente, contexto, restricoes, db) {
  const item = db.ingredientes.find(i => i.id === ingrediente);

  if (!item) return [];

  return item.substituicoes.filter(sub => {
    const contextOk =
      !contexto ||
      sub.contextos_validos?.includes(contexto);

    const restrictionOk =
      !restricoes ||
      restricoes.every(r =>
        sub.restricoes_atendidas?.includes(r)
      );

    return contextOk && restrictionOk;
  });
}

// Scorer (ranking) - 07/06/2026

function scoreSubstitution(sub, contexto, restricoes) {
  let score = 0;

  // contexto
  if (sub.contextos_validos?.includes(contexto)) {
    score += 40;
  }

  // restrições
  const matchRestricoes =
    restricoes?.every(r =>
      sub.restricoes_atendidas?.includes(r)
    );

  if (matchRestricoes) {
    score += 40;
  }

  // fidelidade
  const fidelityMap = {
    alto: 20,
    medio: 10,
    baixo: 5
  };

  score += fidelityMap[sub.nivel_fidelidade] || 0;

  // penalidade remoção
  if (sub.tipo === "remoção") {
    score -= 10;
  }

  return score;
}

//  Engine principal
import db from "../data/substituicoes.json";
import { matchCandidates } from "./matcher.js";
import { scoreSubstitution } from "./scorer.js";

export function getBestSubstitution({
  ingrediente,
  contexto,
  restricoes = []
}) {
  const candidates = matchCandidates(
    ingrediente,
    contexto,
    restricoes,
    db
  );

  const ranked = candidates
    .map(sub => ({
      ...sub,
      score: scoreSubstitution(sub, contexto, restricoes)
    }))
    .sort((a, b) => b.score - a.score);

  return {
    best: ranked[0] || null,
    alternatives: ranked.slice(1, 3)
  };
}

// API (Express simples)
import express from "express";
import { getBestSubstitution } from "../engine/substituteEngine.js";

const router = express.Router();

router.get("/substituicoes", (req, res) => {
  const { ingrediente, contexto, restricoes } = req.query;

  const result = getBestSubstitution({
    ingrediente,
    contexto,
    restricoes: restricoes ? restricoes.split(",") : []
  });

  res.json(result);
});

export default router;