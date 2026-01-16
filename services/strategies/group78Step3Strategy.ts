
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 7/8 - OEFENING 3 (TRANSFER)
 * Focus: Redactiesommen (Foutsporing), Werkwoordvervoeging in context.
 */

export const getGroup78Step3Logic = (words: WordItem[]) => {
    return {
        outputType: 'redacteur',
        systemPrompt: "Niveau groep 8. Eindtoets niveau.",
        taskPrompt: `
            Schrijf een zin waarin het doelwoord FOUTief gespeld is (fonetisch aannemelijk).
            De leerling moet de fout vinden en verbeteren.
            
            Of bij werkwoorden: Geef de infinitief tussen haakjes.
            
            Output JSON: { "woord": "...", "opdracht": "Zoek de fout / Vervoeg", "type": "redacteur", "metadata": { "foutWoord": "..." } }
        `
    };
};
