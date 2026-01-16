
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 5 - OEFENING 2 (ANALYSE)
 * Focus: KLANKGROEPEN SCHEMA & SPLITSEN
 * Concept: Woord splitsen (bo-men) en regel benoemen.
 */

export const getGroup5Step2Logic = (words: WordItem[]) => {
    
    // Check of er klankgroepenwoorden in de lijst zitten
    const hasKlankgroep = words.some(w => w.categorie === 10);
    const hasVerkleinwoord = words.some(w => w.categorie === 11);

    // Als we Klankgroepen of Verkleinwoorden hebben, dwingen we het Schema af.
    // Anders vallen we terug op een generieke aanpak voor groep 5.
    
    if (hasKlankgroep || hasVerkleinwoord) {
        return {
            outputType: 'klankgroep', // Dit triggert de visuele "Splits Box" in de WorksheetPlayer
            systemPrompt: "Je bent een leerkracht groep 5. Focus op de Klankgroepen-machine en woord-analyse.",
            taskPrompt: `
                Genereer Oefening 2: Het Klankgroepen Schema.
                
                Voor elk woord:
                1. SPLITS het woord in klankgroepen (bijv: "bo-men", "bak-ker"). 
                   Voor verkleinwoorden: splits grondwoord en suffix (bijv: "boom-pje").
                2. Bepaal de REGEL die bij het eerste stukje hoort (bijv: "lange klank -> eentje naar de gang").
                
                Output JSON item format:
                { 
                  "woord": "bomen", 
                  "opdracht": "Splits het woord. Welke regel?", 
                  "type": "klankgroep",
                  "metadata": { 
                      "lettergrepen": "bo-men", 
                      "klankgroepType": "lang" 
                  } 
                }
                
                Zorg dat ALLE woorden een 'lettergrepen' veld hebben in de metadata!
            `
        };
    }

    // Fallback voor als er GEEN cat 10/11 is (bijv. alleen herhaling cat 1-9)
    return {
        outputType: 'gaten',
        systemPrompt: "Niveau groep 5. Herhaling regels.",
        taskPrompt: `
            Maak gatenoefeningen waarbij de kern van de categorie mist.
            Bijvoorbeeld voor cat 13 (kilowoord): piloot -> p...loot.
            
            Output JSON: { "woord": "...", "opdracht": "Vul in", "type": "gaten", "metadata": { "prefix": "...", "suffix": "..." } }
        `
    };
};
