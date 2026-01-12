import { GoogleGenAI } from "@google/genai";
import { SPELLING_REGELS, CATEGORIES, getStrategy } from '../constants';
import { WordItem, WorksheetExercises, ExerciseItem } from '../types';
import { ensureDictionaryLoaded, isInDictionary } from './dictionaryService';
import { aiGuardrail } from './aiGuardrail';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string
const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
};

/**
 * Categorieën die moeilijk te valideren zijn met een standaard woordenlijst.
 */
const COMPLEX_CATEGORIES = [21, 23, 24, 25, 26, 28, 30, 31, 32, 33, 34, 35];

const passesRuleCheck = (word: string, categoryId: number): boolean => {
    const w = word.toLowerCase();
    switch (categoryId) {
        case 2: return /(ng|nk)$/.test(w);
        case 3: return /cht/.test(w);
        case 4: return /nk$/.test(w);
        case 5: return /(eer|oor|eur)/.test(w);
        case 6: return /(aai|ooi|oei)$/.test(w);
        case 7: return /(eeuw|ieuw)/.test(w);
        case 8: return /[db]$/.test(w);
        case 9: return /^(be|ge|ver)/.test(w);
        case 10: 
            const hasDoubleConsonant = /(bb|dd|ff|gg|kk|ll|mm|nn|pp|rr|ss|tt|vv|zz)/.test(w);
            const hasOpenSyllable = /[aeiou][bdfgklmnprstvz][aeiou]/.test(w);
            return w.length > 3 && (hasDoubleConsonant || hasOpenSyllable);
        case 11: return /je$/.test(w);
        case 12: return /(ig|lijk)$/.test(w);
        case 13: return /i/.test(w) && !/ie/.test(w);
        case 14: return /'s$/.test(w);
        case 15: return /c/.test(w);
        case 17: return /tie$/.test(w);
        case 18: return /c/.test(w);
        case 19: return /isch$/.test(w);
        case 20: return /x/.test(w);
        case 21: return /ch/.test(w) || /sh/.test(w);
        case 22: return /th/.test(w);
        case 23: return /é/.test(w);
        case 24: return /eau/.test(w);
        case 25: return /ou/.test(w);
        case 26: return /g/.test(w); 
        case 27: return /y$/.test(w);
        case 28: return /[äëïöü]/.test(w);
        case 29: return /air$/.test(w);
        case 30: return w.includes('-');
        case 31: return /oir/.test(w);
        case 32: return /e/.test(w);
        case 33: return w.includes("'");
        case 34: return /^(ab|ad|con|ob|sub)/.test(w);
        case 35: return w.length > 6 && !w.includes(' ');
        case 36: return /ei/.test(w);
        case 37: return /au/.test(w);
        default: return false;
    }
};

export const generateStory = async (wordList: string[], group: string): Promise<string> => {
    const strategy = getStrategy(group);
    
    const userPrompt = `Verhaal groep ${group}. 
    ${strategy.systemPrompt}
    Gebruik deze woorden: ${wordList.join(', ')}. 
    Zet de gebruikte woorden **dikgedrukt**. 
    Houd zinnen kort en leesbaar voor dit niveau.
    Max 10 zinnen.`;
    
    const cacheId = `story-${group}-${wordList.sort().join('-')}`;

    return aiGuardrail.execute(cacheId, async () => {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: userPrompt,
            config: {
                 responseMimeType: "application/json",
                 systemInstruction: `Je bent kinderboekenschrijver voor het basisonderwijs. Output JSON: { "story": "..." }`,
            }
        });
        
        const json = JSON.parse(cleanJson(response.text || '{}'));
        return json.story || "Kon geen verhaal genereren.";
    });
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
             if (passesRuleCheck(clean, categoryId)) return true;
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
    
    let jsonExample = `{ "woord": "boom", "categorie": 1 }`;
    if (strategy.extraFields.includes('lettergrepen')) {
        jsonExample = `{ "woord": "bomen", "categorie": 10, "lettergrepen": "bo-men", "klankgroepType": "lang" }`;
    }
    if (strategy.extraFields.includes('werkwoord')) {
        jsonExample = `{ "woord": "verhuisd", "categorie": 30, "werkwoord": { "stam": "verhuiz", "tijd": "vd", "kofschip": false } }`;
    }
    
    const systemPrompt = `Je bent een didactische engine.
    Output JSON: { "items": [ ${jsonExample} ] }
    Zorg voor correcte spelling en didactische metadata.`;
    
    const userPrompt = `Genereer spellingwoorden voor Groep ${group}.
    
    DIDACTISCHE REGELS:
    ${strategy.systemPrompt}
    ${strategy.focusExplanation}
    
    VERDELING:
    ${categoryRequests}
    `;

    const cacheId = `wordlist-mixed-v8-${group}-${selectedCatIds.sort().join('-')}`;

    return aiGuardrail.execute(cacheId, async () => {
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
            
            const candidates = forThisCat.map(i => {
                if (!i.woord && !i.w) return null;
                return {
                    woord: (i.woord || i.w).trim(),
                    categorie: catId,
                    lettergrepen: i.lettergrepen,
                    klankgroepType: i.klankgroepType,
                    werkwoord: i.werkwoord
                } as WordItem;
            }).filter(Boolean) as WordItem[];

            const validWords = candidates.filter(item => {
                const w = item.woord.toLowerCase();
                if (w.includes(' ')) return false;
                if (passesRuleCheck(w, catId)) return true;
                if (COMPLEX_CATEGORIES.includes(catId)) return true;
                return isInDictionary(w);
            });

            const sourceList = validWords.length < 2 ? candidates : validWords;
            const unique = new Map();
            sourceList.forEach(item => {
                if(!unique.has(item.woord.toLowerCase())) unique.set(item.woord.toLowerCase(), item);
            });

            const slice = Array.from(unique.values()).slice(0, quotaPerCat);
            finalSelection = [...finalSelection, ...slice];
        }
        
        return finalSelection.sort(() => Math.random() - 0.5).slice(0, totalTarget);
    });
};

export const generateDictationSentences = async (words: WordItem[], group: string): Promise<string[]> => {
    const wordStrings = words.map(w => w.woord);
    const strategy = getStrategy(group);
    
    const constraints = group === '4' || group === '5' 
        ? "Zinnen: KORT (max 7 woorden). Tegenwoordige tijd. GEEN passief. Woord NIET vervoegen (dus 'hond' blijft 'hond', niet 'honden')."
        : "Zinnen: Normale lengte. Woord mag in context staan, maar spelling moet identiek blijven.";

    const prompt = `Maak dicteezinnen voor groep ${group}.
    ${strategy.systemPrompt}
    CONSTRAINT: ${constraints}
    Het doelwoord moet er exact zo in staan.
    JSON: { "zinnen": ["zin1", "zin2"] }. 
    Woorden: ${wordStrings.join(',')}`;
    
    const cacheId = `sentences-v2-${group}-${wordStrings.sort().join('-')}`;

    try {
        return await aiGuardrail.execute(cacheId, async () => {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            const json = JSON.parse(cleanJson(response.text || '{}'));
            const s = json.s || json.zinnen || [];
            
            if (s.length !== words.length) {
                return words.map((w, i) => s[i] || `Schrijf op: ${w.woord}`);
            }
            return s;
        });
    } catch (e) {
        return wordStrings.map(w => `Schrijf op: ${w}`);
    }
};

export const generateExercises = async (words: WordItem[], group: string): Promise<WorksheetExercises> => {
    const strategy = getStrategy(group);
    const extraInstruction = group === '5' 
        ? "Maak ook 'speciale_oefeningen' voor de Klankgroepen-machine. Type: 'klankgroep'."
        : group === '7' || group === '8' || group === '7/8'
        ? "Maak ook 'speciale_oefeningen' voor werkwoordspelling (ontleding). Type: 'werkwoord'."
        : "";

    const prompt = `Maak spellingoefeningen voor: ${words.map(w=>w.woord).join(',')}.
    ${strategy.systemPrompt}
    ${extraInstruction}
    1. Invul (5x)
    2. Keuze (5x)
    3. Regel (5x)
    JSON output: { "invulzinnen": [], "kies_juiste_spelling": [], "regelvragen": [], "speciale_oefeningen": [] }`;
    
    const cacheId = `exercises-didactic-${group}-${words.map(w=>w.woord).sort().join('-')}`;

    try {
        return await aiGuardrail.execute(cacheId, async () => {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const json = JSON.parse(cleanJson(response.text || '{}'));
            
            const process = (list: any[], type: string): ExerciseItem[] => {
                return (list || []).map((item, idx) => {
                    const matchedWord = words.find(w => w.woord.toLowerCase() === item.woord?.toLowerCase());
                    return {
                        ...item,
                        id: `${type}-${Date.now()}-${idx}`,
                        type: item.type || type,
                        categorie: matchedWord?.categorie || 0,
                        metadata: matchedWord
                    };
                });
            };

            return {
                invulzinnen: process(json.invulzinnen, 'invul'),
                kies_juiste_spelling: process(json.kies_juiste_spelling, 'keuze'),
                regelvragen: process(json.regelvragen, 'regel'),
                speciale_oefeningen: process(json.speciale_oefeningen, group === '5' ? 'klankgroep' : 'werkwoord')
            };
        });
    } catch (e) {
        console.error(e);
        return { invulzinnen: [], kies_juiste_spelling: [], regelvragen: [] };
    }
};

export const generateSpellingFeedback = async (target: string, userInput: string, ruleDescription: string, group: string): Promise<string> => {
    // FAST-PATH: Local checks for speed and efficiency
    if (target.toLowerCase() === userInput.toLowerCase()) return "Dat is goed geschreven! Let alleen even op de hoofdletters.";
    
    // Check if we have specific mnemonic data to inject
    const matchingRule = SPELLING_REGELS.find(r => r.regel === ruleDescription);
    let mnemonicContext = "";
    if (matchingRule) {
        if (matchingRule.versje) mnemonicContext += `\nVERSJE/RAP: "${matchingRule.versje}"`;
        if (matchingRule.uitgebreide_uitleg) mnemonicContext += `\nEXTRA UITLEG: "${matchingRule.uitgebreide_uitleg}"`;
    }

    // AI Strategy
    const strategy = getStrategy(group);
    
    const prompt = `
    PERSOONA: ${strategy.teacherTone}
    CONTEXT: Dictee Groep ${group}.
    FOUT: Kind schreef "${userInput}" in plaats van "${target}".
    STANDAARD REGEL: ${ruleDescription}.
    ${mnemonicContext}
    
    TAAK: Geef een korte hint (max 12 woorden). VERKLAP HET ANTWOORD NIET. 
    Focus op de kern van de fout (bijv. klankgroep, tussen-u, d/t). 
    Als er een versje/rap is, verwijs daar subtiel naar.
    Wees bemoedigend.
    `;

    const cacheId = `feedback-v4-${target}-${userInput}`;

    try {
        return await aiGuardrail.execute(cacheId, async () => {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    temperature: 0.7, // Slightly lower for more focused answers
                }
            });
            return response.text?.trim() || ruleDescription;
        });
    } catch (e) {
        console.error("Feedback generation failed", e);
        return ruleDescription;
    }
};

// Legacy
export const generateWorksheet = async (selectedCatIds: number[], group: string): Promise<any> => { return {}; };