
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 4 - OEFENING 3 (TRANSFER)
 * Focus: Korte zinnen, eenvoudige context.
 */

export const getGroup4Step3Logic = (words: WordItem[]) => {
    return {
        outputType: 'invul',
        systemPrompt: "Niveau groep 4. Korte, concrete zinnen (max 7 woorden).",
        taskPrompt: `
            Maak voor elk woord een korte contextzin.
            Vervang het doelwoord door puntjes (...).
            
            Voorbeeld:
            Woord: "boom" -> Zin: "De vogel zit in de ..."
            
            Output JSON: { "woord": "...", "opdracht": "...", "type": "invul" }
        `
    };
};
