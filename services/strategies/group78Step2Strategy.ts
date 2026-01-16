
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 7/8 - OEFENING 2 (ANALYSE)
 * Focus: Werkwoordspelling (Het Schema).
 */

export const getGroup78Step2Logic = (words: WordItem[]) => {
    // Check of er werkwoorden zijn
    const hasVerbs = words.some(w => w.categorie === 30 || w.werkwoord);

    if (hasVerbs) {
        return {
            outputType: 'werkwoord', // Nieuw specifiek type voor het schema
            systemPrompt: "Je bent een expert in werkwoordspelling (Groep 8). Je gebruikt het 'Werkwoordschema' (Staal).",
            taskPrompt: `
                Genereer een analyse-oefening voor werkwoorden.
                Het doel is dat de leerling het STROOMSCHEMA volgt:
                1. Is het de Persoonsvorm (PV)?
                2. Welke tijd (TT/VT)?
                3. Wat is het onderwerp?
                4. Wat is de regel (stam / stam+t / kofschip)?

                Output JSON item: 
                { 
                  "woord": "verbrand", 
                  "opdracht": "Vul het schema in", 
                  "type": "werkwoord", 
                  "metadata": { 
                      "infinitief": "verbranden",
                      "tijd": "vt",
                      "hulp": "kofschip" 
                  } 
                }
            `
        };
    }

    // Fallback voor niet-werkwoorden (zinsontleding)
    return {
        outputType: 'grammatica', 
        systemPrompt: "Niveau groep 7/8. Grammaticale benoeming.",
        taskPrompt: `
            Benoem de woordsoort of het zinsdeel van het woord.
            (Zn, Bn, Ww, Vz, etc.)
            
            Output JSON: 
            { 
              "woord": "grote", 
              "opdracht": "Benoem woordsoort", 
              "type": "grammatica", 
              "metadata": { "woordsoort": "bn" } 
            }
        `
    };
};
