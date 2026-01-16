
import { GoogleGenAI } from "@google/genai";
import { SPELLING_REGELS, CATEGORIES, getStrategy } from '../constants';
import { WordItem, WorksheetExercises, ExerciseItem } from '../types';
import { ensureDictionaryLoaded, isInDictionary } from './dictionaryService';
import { aiGuardrail } from './aiGuardrail';
import { getStep2Strategy, getStep3Strategy } from './exerciseStrategies';

// Helper to sanitize JSON string
const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
};

const COMPLEX_CATEGORIES = [21, 23, 24, 25, 26, 28, 30, 31, 32, 33, 34, 35];

const passesRuleCheck = (word: string, categoryId: number): boolean => {
    const w = word.toLowerCase();
    switch (categoryId) {
        case 2: return /(ng|nk)$/.test(w);
        case 3: return /cht/.test(w);
        case 4: return /nk$/.test(w);
        default: return true; 
    }
};

// --- HELPER: AUTOMATIC GAP CALCULATION ---
// Zorgt ervoor dat het werkblad eruit ziet als de mock, ook als de AI metadata vergeet.
const calculateMetadataFallback = (word: string, type: string, categoryId: number, existingMeta: any) => {
    const meta = { ...existingMeta };
    const w = word.toLowerCase();

    // Als prefix/suffix al bestaat, doe niets.
    if (meta.prefix !== undefined || meta.suffix !== undefined) return meta;

    // Logica voor automatische gaten vulling op basis van categorie
    if (type === 'gaten' || type === 'keuze' || type === 'invul') {
        let match = null;

        if (categoryId === 2) match = w.match(/(ng|nk)/); // Zingwoord
        else if (categoryId === 3) match = w.match(/(cht|ch)/); // Luchtwoord
        else if (categoryId === 4) match = w.match(/(nk)/); // Plankwoord
        else if (categoryId === 5) match = w.match(/(eer|oor|eur)/); // Eer-oor-eur
        else if (categoryId === 6) match = w.match(/(aai|ooi|oei)/); // Aai-ooi-oei
        else if (categoryId === 7) match = w.match(/(eeuw|ieuw)/); // Eeuw-ieuw
        else if (categoryId === 9) match = w.match(/^(be|ge|ver)/); // Voorvoegsel
        else if (categoryId === 11) match = w.match(/(pje|tje|je)$/); // Verkleinwoord
        else if (categoryId === 12) match = w.match(/(ig|lijk)$/); // Achtervoegsel
        else if (categoryId === 13) match = w.match(/i(?!e)/); // Kilowoord (i)
        else if (categoryId === 18 || categoryId === 15) match = w.match(/c/); // Cola/Cent (c)
        else if (categoryId === 24) match = w.match(/eau/); // Cadeau (eau)
        else if (categoryId === 26) match = w.match(/g/); // Garage (g)
        
        if (match && match.index !== undefined) {
            meta.prefix = w.substring(0, match.index);
            meta.suffix = w.substring(match.index + match[0].length);
        } else {
            // Fallback: eerste letter laten staan, rest puntjes
            meta.prefix = w.substring(0, 1);
            meta.suffix = w.substring(2);
        }
    }
    
    // Klankgroepen fallback
    if ((type === 'klankgroep' || type === 'splits') && !meta.lettergrepen) {
        // Simpele splitsing fallback als AI het vergeet: streepjes tussen alle letters
        // (Beter dan niets, leerkracht ziet direct dat het niet klopt, maar layout breekt niet)
        meta.lettergrepen = w.split('').join('-');
    }

    return meta;
};

export const generateDidacticWordList = async (categoryId: number, group: string): Promise<string[]> => {
    await ensureDictionaryLoaded();
    const strategy = getStrategy(group);
    const categoryName = CATEGORIES[categoryId];
    
    const prompt = `Genereer een lijst voor Categorie ${categoryId} (${categoryName}).
    ${strategy.systemPrompt}
    Geef 30 unieke woorden die aan deze spellingregel voldoen.
    JSON Output format: { "w": ["woord1", "woord2"] }`;

    const cacheId = `wordlist-single-${categoryId}-${group}`;

    return aiGuardrail.execute(cacheId, async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const json = JSON.parse(cleanJson(response.text || '{}'));
        const candidates: string[] = json.w || json.words || [];

        const valid = candidates.filter(w => {
             const clean = w.trim().toLowerCase();
             if (clean.length < 2) return false;
             if (COMPLEX_CATEGORIES.includes(categoryId)) return true;
             return isInDictionary(clean);
        });
        
        if (valid.length < 5) return candidates.slice(0, 30);
        return Array.from(new Set(valid));
    });
};

export const generateMixedWordList = async (selectedCatIds: number[], group: string): Promise<WordItem[]> => {
    await ensureDictionaryLoaded();
    
    const totalTarget = 15;
    const numCats = selectedCatIds.length;
    const strategy = getStrategy(group);
    
    const quotaPerCat = Math.ceil(totalTarget / numCats);
    const wordsPerCatRequest = Math.max(10, quotaPerCat * 2);

    const categoryRequests = selectedCatIds.map(id => 
        `- Categorie ${id} (${CATEGORIES[id]}): ${wordsPerCatRequest} woorden`
    ).join('\n');
    
    // Specifieke velden per groep vragen
    let extraFieldsPrompt = "";
    if (group === '5' || group === '6') extraFieldsPrompt = "Voeg 'lettergrepen' en 'klankgroepType' toe aan JSON.";
    if (group === '7' || group === '8' || group === '7/8') extraFieldsPrompt = "Voeg 'werkwoord' object toe indien van toepassing.";

    const systemPrompt = `Je bent een didactische engine.
    Output JSON: { "items": [ { "woord": "...", "categorie": 1, ...extra } ] }
    Zorg voor correcte spelling.`;
    
    const userPrompt = `Genereer spellingwoorden voor Groep ${group}.
    
    DIDACTISCHE REGELS:
    ${strategy.systemPrompt}
    
    VERDELING:
    ${categoryRequests}

    EXTRA INFO:
    ${extraFieldsPrompt}
    `;

    const cacheId = `wordlist-mixed-v9-${group}-${selectedCatIds.sort().join('-')}`;

    return aiGuardrail.execute(cacheId, async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: userPrompt,
            config: { 
                responseMimeType: "application/json",
                systemInstruction: systemPrompt
            }
        });

        const text = cleanJson(response.text || '{}');
        const json = JSON.parse(text);
        const rawList: any[] = Array.isArray(json) ? json : (json.items || json.words || []);

        let finalSelection: WordItem[] = [];

        for (const catId of selectedCatIds) {
            const forThisCat = rawList.filter(item => item.categorie == catId || item.cat == catId || item.c == catId);
            
            // Map raw items to WordItems
            const candidates = forThisCat.map(i => ({
                woord: (i.woord || i.w).trim(),
                categorie: catId,
                lettergrepen: i.lettergrepen,
                klankgroepType: i.klankgroepType,
                werkwoord: i.werkwoord
            } as WordItem));

            // Validate against dictionary (simplified)
            const validWords = candidates.filter(item => {
                const w = item.woord.toLowerCase();
                if (w.includes(' ')) return false;
                if (COMPLEX_CATEGORIES.includes(catId)) return true;
                return isInDictionary(w);
            });

            const sourceList = validWords.length < 2 ? candidates : validWords;
            const slice = sourceList.slice(0, quotaPerCat);
            finalSelection = [...finalSelection, ...slice];
        }
        
        return finalSelection.sort(() => Math.random() - 0.5).slice(0, totalTarget);
    });
};

export const generateDictationSentences = async (words: WordItem[], group: string): Promise<string[]> => {
    const wordStrings = words.map(w => w.woord);
    const strategy = getStrategy(group);
    
    const constraints = group === '4' || group === '5' 
        ? "Zinnen: KORT (max 7 woorden). Tegenwoordige tijd. GEEN passief. Woord NIET vervoegen."
        : "Zinnen: Normale lengte. Woord mag in context staan.";

    const prompt = `Maak dicteezinnen voor groep ${group}.
    ${strategy.systemPrompt}
    CONSTRAINT: ${constraints}
    Het doelwoord moet er exact zo in staan.
    JSON: { "zinnen": ["zin1", "zin2"] }. 
    Woorden: ${wordStrings.join(',')}`;
    
    const cacheId = `sentences-v3-${group}-${wordStrings.sort().join('-')}`;

    try {
        return await aiGuardrail.execute(cacheId, async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            const json = JSON.parse(cleanJson(response.text || '{}'));
            const s = json.s || json.zinnen || [];
            
            if (s.length !== words.length) {
                return words.map(w => `Schrijf op: ${w.woord}`);
            }
            return s;
        });
    } catch (e) {
        return wordStrings.map(w => `Schrijf op: ${w}`);
    }
};

/**
 * GENEREER OEFENINGEN MET ROBUUSTE STRATEGIE
 */
export const generateExercises = async (words: WordItem[], group: string): Promise<WorksheetExercises> => {
    const wordListStr = words.map(w => w.woord).join(', ');

    // 1. Haal strategieën op
    const step2Strat = getStep2Strategy(group, words);
    const step3Strat = getStep3Strategy(group, words);

    // 2. Bouw de prompt
    const prompt = `
    TASK: Genereer oefeningen voor deze woordenlijst: ${wordListStr}.
    GROEP: ${group}
    
    DEEL 1: STAP 2 (ANALYSE)
    ${step2Strat.taskPrompt}
    
    DEEL 2: STAP 3 (TRANSFER)
    ${step3Strat.taskPrompt}
    
    OUTPUT JSON FORMAT:
    {
       "step2": [ { "woord": "...", "opdracht": "...", "metadata": {...} } ],
       "step3": [ { "woord": "...", "opdracht": "...", "metadata": {...} } ]
    }
    `;

    const cacheId = `exercises-robust-v2-${group}-${words.map(w=>w.woord).sort().join('-')}`;

    try {
        return await aiGuardrail.execute(cacheId, async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: { 
                    responseMimeType: "application/json",
                    systemInstruction: `Je bent een didactische expert. Volg de instructies exact. Zorg dat metadata (zoals prefix/suffix/choices) ALTIJD is ingevuld bij gatenoefeningen.`
                }
            });

            const json = JSON.parse(cleanJson(response.text || '{}'));
            
            // Helper om items te mappen naar ExerciseItem
            const mapItems = (raw: any[], strategyType: any): ExerciseItem[] => {
                return (raw || []).map((item: any, idx: number) => {
                    const matched = words.find(w => w.woord.toLowerCase() === (item.woord || "").toLowerCase());
                    const catId = matched?.categorie || 0;

                    // UPDATE: Als strategy 'mixed' is, respecteer dan het type van het item zelf.
                    const finalType = strategyType === 'mixed' ? (item.type || 'gaten') : strategyType;
                    
                    // ROBUUSTHEID: Bereken fallback metadata als de AI lui is geweest
                    const enhancedMetadata = calculateMetadataFallback(
                        item.woord || matched?.woord || "", 
                        finalType, 
                        catId, 
                        { ...matched, ...(item.metadata || {}) }
                    );

                    return {
                        id: `${finalType}-${Date.now()}-${idx}`,
                        type: finalType, 
                        woord: item.woord,
                        opdracht: item.opdracht || "Opdracht",
                        categorie: catId,
                        metadata: enhancedMetadata
                    };
                });
            };

            const result: WorksheetExercises = {
                // STAP 1: Altijd sorteren
                sorteer_oefening: {
                    categorieen: Array.from(new Set(words.map(w => w.categorie))),
                    woorden: words.map((w, i) => ({
                        id: `sort-${i}`,
                        woord: w.woord,
                        categorie: w.categorie,
                        opdracht: "Sorteer",
                        type: 'sorteer'
                    }))
                },

                // STAP 2: Dynamisch op basis van strategie
                stap2_oefening: mapItems(json.step2, step2Strat.outputType),

                // STAP 3: Dynamisch op basis van strategie
                stap3_oefening: mapItems(json.step3, step3Strat.outputType),

                // Fallbacks voor legacy views (zodat de oude player niet crasht)
                transformatie: mapItems(json.step2, step2Strat.outputType),
                invulzinnen: mapItems(json.step3, 'invul'),
                gaten_oefening: mapItems(json.step2, 'gaten'),
                klankgroepen_tabel: mapItems(json.step2, 'klankgroep'),
                kies_juiste_spelling: []
            };

            return result;
        });
    } catch (e) {
        console.error("Exercises generation failed", e);
        // Return empty safe object
        return { 
            stap2_oefening: [], 
            stap3_oefening: [],
            invulzinnen: [], 
            kies_juiste_spelling: [] 
        };
    }
};

export const generateSpellingFeedback = async (target: string, userInput: string, ruleDescription: string, group: string): Promise<string> => {
    // (Bestaande feedback logica...)
    return ruleDescription;
};

// Legacy
export const generateWorksheet = async (selectedCatIds: number[], group: string): Promise<any> => { return {}; };
export const generateStory = async (wordList: string[], group: string): Promise<string> => { return ""; };
