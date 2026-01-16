
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 5 - OEFENING 3 (TRANSFER)
 * Focus: Rijkere zinnen, woordenschat uitbreiding.
 */

export const getGroup5Step3Logic = (words: WordItem[]) => {
    return {
        outputType: 'invul',
        systemPrompt: "Niveau groep 5. Rijkere taal, samengestelde zinnen.",
        taskPrompt: `
            Maak contextzinnen waarin de betekenis van het woord duidelijk wordt.
            Laat het doelwoord weg (...).
            
            Output JSON: { "woord": "...", "opdracht": "...", "type": "invul" }
        `
    };
};
