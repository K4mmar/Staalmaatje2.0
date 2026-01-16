
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 4 - OEFENING 2 (ANALYSE)
 * Focus: Categorieherkenning, Gaten, Keuzes.
 */

// Specifieke AI-instructies per categorie voor Groep 4
const CATEGORY_PROMPTS: Record<number, string> = {
    1:  "Hakwoord: Geen gaten. Laat de leerling het woord overschrijven om de hak-structuur te oefenen. Type: 'spiegel'. Opdracht: 'Schrijf het woord'.",
    2:  "Zingwoord: Maak een gat op de plek van 'ng' of 'nk'. Metadata choices: ['ng', 'nk']. Type: 'keuze'.",
    3:  "Luchtwoord: Maak een gat op de plek van 'cht' of 'ch'. Metadata choices: ['g', 'ch', 'cht']. Type: 'keuze'.",
    4:  "Plankwoord: Maak een gat op de plek van 'nk'. Metadata choices: ['ng', 'nk']. Type: 'keuze'.",
    5:  "Eer-oor-eur: Maak een gat bij de 'eer', 'oor' of 'eur'. Metadata choices: ['eer', 'oor', 'eur']. Type: 'keuze'.",
    6:  "Aai-ooi-oei: Maak een gat bij de 'aai', 'ooi' of 'oei'. Type: 'invul'.",
    7:  "Eeuw-ieuw: Maak een gat bij 'eeuw' of 'ieuw'. Type: 'invul'.",
    8:  "Langermaakwoord: Maak een gat op de laatste letter (d/t). Metadata choices: ['d', 't']. Type: 'keuze'.",
    9:  "Voorvoegsel: Maak een gat bij het voorvoegsel (be/ge/ver). Metadata choices: ['be', 'ge', 'ver']. Type: 'keuze'.",
    10: "Klankgroepenwoord: In groep 4 simpel houden. Maak een gat bij de klinker die verandert (of dubbelzetter). Type: 'gaten'.",
    11: "Verkleinwoord: Laat de leerling het grondwoord onderstrepen of het achtervoegsel invullen. Type: 'invul'.",
    12: "Achtervoegsel: Maak een gat bij 'ig' of 'lijk'. Metadata choices: ['ig', 'lijk']. Type: 'keuze'."
};

export const getGroup4Step2Logic = (words: WordItem[]) => {
    // Bouw een specifieke instructie set op basis van de aanwezige categorieën
    const activeCategories = Array.from(new Set(words.map(w => w.categorie)));
    
    let specificInstructions = activeCategories.map(catId => {
        const instruction = CATEGORY_PROMPTS[catId];
        return instruction ? `- Cat ${catId}: ${instruction}` : `- Cat ${catId}: Maak een logische gatenoefening.`;
    }).join('\n');

    return {
        outputType: 'gaten', // Dominante type voor Gr4
        systemPrompt: "Je bent een leerkracht groep 4. Je maakt oefeningen voor beginnende spellers. Focus op visuele herkenning.",
        taskPrompt: `
            Genereer Oefening 2 (Analyse) voor Groep 4.
            Gebruik DEZE specifieke regels per categorie:
            ${specificInstructions}
            
            Voor alle overige categorieën: Maak een gat op de plek van de moeilijkheid.
            
            Output JSON item format: 
            { 
              "woord": "doelwoord", 
              "opdracht": "Vul in / Kies", 
              "type": "gaten" | "keuze" | "spiegel",
              "metadata": { 
                  "prefix": "stukje voor gat", 
                  "suffix": "stukje na gat", 
                  "choices": ["optie1", "optie2"] 
              } 
            }
        `
    };
};
