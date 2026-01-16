
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 6 - OEFENING 3 (TRANSFER)
 * Focus: Complexe zinnen, woordenschat.
 */

export const getGroup6Step3Logic = (words: WordItem[]) => {
    return {
        outputType: 'invul',
        systemPrompt: "Niveau groep 6. Informatieve zinnen.",
        taskPrompt: `
            Maak zinnen die passen bij wereldoriëntatie of begrijpend lezen.
            Laat het doelwoord weg.
            
            Output JSON: { "woord": "...", "opdracht": "...", "type": "invul" }
        `
    };
};
