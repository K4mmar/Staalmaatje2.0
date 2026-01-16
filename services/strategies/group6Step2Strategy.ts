
import { WordItem } from '../../types';

/**
 * STRATEGIE VOOR GROEP 6 - OEFENING 2 (ANALYSE)
 * Focus: DYNAMISCH.
 * 
 * Staal methodiek Groep 6:
 * 1. Klankgroepenwoorden (Cat 10) -> Blijven het 'Schema' volgen (Splitsen + Regel).
 * 2. Leenwoorden (Cat 18, 24, 26, etc.) -> Klank-Teken koppeling (Ik hoor /k/, ik schrijf c).
 *    Leenwoorden kun je vaak niet 'hakken' volgens de standaard regels.
 */

export const getGroup6Step2Logic = (words: WordItem[]) => {
    // We geven een hybride instructie. De outputType in de return waarde is de 'dominante' type, 
    // maar de prompt forceert per item het juiste type.
    
    return {
        outputType: 'mixed', // Geeft aan dat de output per item verschilt
        systemPrompt: "Je bent een leerkracht groep 6. Je differentieert tussen Klankgroepenwoorden (regels) en Leenwoorden (weet-woorden/herkomst).",
        taskPrompt: `
            Genereer Oefening 2 (Analyse) met een DYNAMISCHE aanpak per woord:

            SCENARIO A: Is het woord een Klankgroepenwoord (Cat 10)?
            -> Gebruik het 'Klankgroepen Schema'.
            -> Type: "klankgroep"
            -> Metadata: Vul 'lettergrepen' in (bijv. "bo-men") en 'klankgroepType'.
            -> Opdracht: "Splits en kies de regel."

            SCENARIO B: Is het woord een Leenwoord (Cat 18, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31)?
            -> Gebruik 'Klank-Teken koppeling' of Herkomst.
            -> Type: "keuze"
            -> Metadata: Focus op de lastige klank. Bijv. Cadeau -> hoort 'oo', schrijft 'eau'.
            -> Opdracht: "Welke klank hoor je? / Wat schrijf je?"

            SCENARIO C: Overige woorden?
            -> Type: "gaten" of "spiegel".

            Output JSON item format (voorbeeld):
            [
              { "woord": "jager", "type": "klankgroep", "opdracht": "Splits het woord", "metadata": { "lettergrepen": "ja-ger" } },
              { "woord": "cadeau", "type": "keuze", "opdracht": "Ik hoor 'oo', ik schrijf...", "metadata": { "choices": ["oo", "eau"], "prefix": "cad", "suffix": "" } }
            ]
        `
    };
};
