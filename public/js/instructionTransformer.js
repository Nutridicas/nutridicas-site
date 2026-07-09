export function transformInstructions(instructions, ingredientsMap) {
  return instructions.map(step => {
    let updated = step;

    ingredientsMap.forEach(ing => {
      if (ing.substituido) {
        updated = updated.replace(
          ing.original,
          ing.novo
        );
      }
    });

    return updated;
  });
}