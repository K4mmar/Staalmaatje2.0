
import { WordItem } from '../../types';
import { SPELLING_REGELS } from '../../constants';

/**
 * STRATEGIE VOOR OEFENING 1: Visuele Inprenting & Sorteren
 * Deze logica geldt generiek, maar kan per categorie specifieke instructies bevatten.
 */

export const getStep1PromptInstruction = (words: WordItem[]): string => {
    // 1. Analyseer de input
    const uniqueCategories = Array.from(new Set(words.map(w => w.categorie)));
    const isSortingExercise = uniqueCategories.length > 1;

    // 2. Basis instructie voor de AI
    let taskInstruction = "";

    if (isSortingExercise) {
        taskInstruction = `
        DOEL: Sorteeroefening (Stap 1).
        De leerling moet woorden in de juiste kolom schrijven.
        Genereer JSON items met type: 'sorteer'.
        Opdracht: "Schrijf in het juiste vak."
        `;
    } else {
        // Focus op 1 categorie: Specifieke visuele instructie ophalen uit constants
        const catId = uniqueCategories[0];
        const rule = SPELLING_REGELS.find(r => r.id === catId);
        
        taskInstruction = `
        DOEL: Visuele inprenting (Stap 1).
        Focus categorie: ${catId} (${rule?.naam}).
        Specifieke didactische actie: "${rule?.stap1?.opdracht || 'Schrijf het woord over'}".
        Genereer JSON items met type: 'visueel'.
        Zorg dat de opdracht exact overeenkomt met de didactische actie.
        `;
    }

    return taskInstruction;
};
