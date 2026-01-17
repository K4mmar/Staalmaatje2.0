
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

const SKIP_DICT_CHECK_IDS = [
    11, 14, 16, 33, 21, 23, 24, 25, 26, 28, 30, 31, 32, 34, 35, 10
];

const CATEGORY_SPECIFIC_INSTRUCTIONS: Record<number, string> = {
    21: "Gebruik veelvoorkomende woorden (bv. chef, douche, machine). Geen obscure termen.",
    23: "STRIKTE EIS: Gebruik alleen bekende woorden voor kinderen (bv. café, oké, privé, logé, coupé, hé). GEEN moeilijke Franse woorden zoals 'procedé', 'neglié', 'attaché' of 'revé'.",
    24: "Alleen gangbare woorden (bv. cadeau, bureau, niveau, tableau).",
    25: "Alleen gangbare woorden (bv. route, journaal, douane).",
    26: "Alleen gangbare woorden (bv. garage, etage, rage, horloge).",
    31: "Alleen gangbare woorden (bv. trottoir, reservoir)."
};

/**
 * STRICT VALIDATION LAYER
 */
const passesRuleCheck = (word: string, categoryId: number): boolean => {
    const w = word.toLowerCase().trim();
    
    switch (categoryId) {
        case 1: return true; 
        case 2: return /(ng|nk)/.test(w); 
        case 3: return /(cht|ch)/.test(w); 
        case 4: return /nk/.test(w) && !/ng/.test(w); 
        case 5: return /(eer|oor|eur)/.test(w); 
        case 6: return /(aai|ooi|oei)/.test(w); 
        case 7: return /(eeuw|ieuw)/.test(w); 
        case 8: return /[dbt]$/.test(w); 
        case 9: return /^(be|ge|ver)/.test(w); 
        case 10: return w.length > 3; 
        case 11: return /(je)$/.test(w); 
        case 12: return /(ig|lijk)$/.test(w); 
        case 13: return /i/.test(w) && !/ie/.test(w); 
        case 14: return /'s/.test(w); 
        case 15: return /c/.test(w); 
        case 17: return /tie$/.test(w); 
        case 18: return /c/.test(w); 
        case 19: return /isch/.test(w); 
        case 20: return /x/.test(w); 
        case 21: return /ch/.test(w); 
        case 22: return /th/.test(w); 
        case 23: return /é/.test(w); 
        case 24: return /eau/.test(w); 
        case 25: return /ou/.test(w); 
        case 26: return /g/.test(w); 
        case 27: return /y/.test(w); 
        case 28: return /[äëïöü]/.test(w); 
        case 30: return /-/.test(w); 
        case 32: return /en/.test(w); 
        case 33: return /'s/.test(w); 
        case 35: return w.length > 5; 
        case 36: return /ei/.test(w); 
        case 37: return /au/.test(w); 
        default: return true; 
    }
};

const validateGradeAppropriateness = (word: string, group: string, catId: number): boolean => {
    const w = word.toLowerCase().trim();
    if (group === '4') {
        if (w.length > 12 && catId !== 35) return false; 
        if (/[xqy'é-]/.test(w) && ![20, 27, 14, 23, 30].includes(catId)) return false;
    }
    if (group === '5' && w.length > 14 && catId !== 35) return false;
    return true;
};

// --- FASE 1: KANDIDATEN GENEREREN ---
const generateRawCandidates = async (catIds: number[], group: string): Promise<{ word: string, cat: number }[]> => {
    const numCats = catIds.length;
    const requestCount = Math.max(30, Math.ceil(60 / numCats)); 

    const prompt = `
    Ik heb een lijst met kale oefenwoorden nodig voor spelling Groep ${group}.
    Genereer per categorie ${requestCount} woorden.
    
    Categorieën:
    ${catIds.map(id => `- ID ${id}: ${CATEGORIES[id]}. ${CATEGORY_SPECIFIC_INSTRUCTIONS[id] || ''}`).join('\n')}

    BELANGRIJK:
    - Output puur JSON array.
    - Gebruik de keys "w" (woord) en "c" (categorie ID).
    - GEEN nummering, geen markdown anders dan json blocks.

    Output format:
    [
      {"w": "woord1", "c": 1},
      {"w": "woord2", "c": 1}
    ]
    `;

    const cacheId = `raw-candidates-v3-${group}-${catIds.sort().join('-')}`;

    return aiGuardrail.execute(cacheId, async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const text = cleanJson(response.text || '[]');
        let list = [];
        try {
            const json = JSON.parse(text);
            list = Array.isArray(json) ? json : (json.words || json.items || []);
        } catch (e) {
            console.error("JSON Parse Error candidates", text);
            return [];
        }
        
        return list.map((i: any) => ({
            word: (i.w || i.word || "").trim(),
            cat: i.c || i.cat || i.categorie
        }));
    });
};

// --- FASE 3: VERRIJKING ---
const enrichSelectedWords = async (selection: { word: string, cat: number }[], group: string): Promise<WordItem[]> => {
    if (selection.length === 0) return [];

    const wordsListStr = selection.map(i => `${i.word} (cat ${i.cat})`).join(', ');
    
    let contextPrompt = "";
    if (group === '4') {
        contextPrompt = "Contextzinnen: Simpel. Zin met '...'. Duidelijk dat alleen dit woord past. Dicteezin: Max 7 woorden, tt.";
    } else if (group === '7' || group === '8' || group === '7/8') {
        contextPrompt = "Contextzinnen: Uitdagend. Dicteezin: Werkwoordspelling correct toepassen.";
    } else {
        contextPrompt = "Contextzinnen: Rijke taal. Dicteezin: Normaal.";
    }

    const extraFields = (group === '7' || group === '8' || group === '7/8') 
        ? ", werkwoord: { stam, tijd, kofschip }" 
        : (group === '5' || group === '6') ? ", lettergrepen, klankgroepType" : "";

    const prompt = `
    Verrijk deze exacte woordenlijst met didactische metadata voor Groep ${group}.
    
    WOORDEN: ${wordsListStr}
    
    REGELS:
    ${contextPrompt}
    
    Output JSON:
    { "items": [
      { 
        "woord": "...", 
        "categorie": 1, 
        "dicteeZin": "...", 
        "contextZin": "De ... is groot."
        ${extraFields}
      }
    ]}
    `;

    const cacheId = `enrich-v2-${group}-${selection.map(w => w.word).sort().join('-')}`;

    return aiGuardrail.execute(cacheId, async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const json = JSON.parse(cleanJson(response.text || '{}'));
        return json.items || [];
    });
};

// --- MAIN ORCHESTRATOR ---
export const generateMixedWordList = async (selectedCatIds: number[], group: string, onLog?: (msg: string) => void): Promise<WordItem[]> => {
    
    const log = (msg: string) => {
        console.log(`[AI] ${msg}`);
        if (onLog) onLog(msg);
    };

    log(`🚀 Start generatieprocedure voor Groep ${group}...`);
    log(`📚 Woordenboek laden en initialiseren...`);
    await ensureDictionaryLoaded();

    log(`🌪️ Fase 1: Ruwe kandidaten genereren (High Volume)...`);
    let rawCandidates: { word: string, cat: number }[] = [];
    try {
        rawCandidates = await generateRawCandidates(selectedCatIds, group);
        log(`✅ Fase 1 voltooid. ${rawCandidates.length} kandidaten ontvangen.`);
    } catch (e) {
        log(`❌ Fout in Fase 1: ${e}`);
        throw new Error("Kon geen basiswoorden genereren.");
    }

    log(`🛡️ Fase 2: Gelaagde validatie (Bucket Strategy)...`);
    
    const bucketStrict: any[] = [];
    const bucketLoose: any[] = [];
    const bucketFallback: any[] = [];

    let totalRejected = 0;

    for (const item of rawCandidates) {
        const w = item.word ? item.word.trim() : "";
        if (!w || (w.includes(' ') && item.cat !== 35) || w.length < 2) {
            totalRejected++;
            continue;
        }

        if (!validateGradeAppropriateness(w, group, item.cat)) {
            totalRejected++;
            continue;
        }

        const inDict = isInDictionary(w) || SKIP_DICT_CHECK_IDS.includes(item.cat);
        const matchesRule = passesRuleCheck(w, item.cat);

        if (inDict && matchesRule) {
            bucketStrict.push(item);
        } else if (matchesRule) {
            bucketLoose.push(item);
        } else if (inDict) {
            bucketFallback.push(item);
        } else {
            totalRejected++;
        }
    }
    
    log(`📊 Validatie Stats: Goud=${bucketStrict.length}, Zilver=${bucketLoose.length}, Brons=${bucketFallback.length}. Afgewezen=${totalRejected}.`);

    log(`⚖️ Fase 3: Selectie van de beste 15 woorden...`);
    
    const totalTarget = 15;
    const finalSelection: { word: string, cat: number }[] = [];
    const targetPerCat = Math.ceil(totalTarget / selectedCatIds.length);
    
    const fillCategory = (catId: number) => {
        let needed = targetPerCat;
        
        const strictMatches = bucketStrict.filter(i => i.cat === catId).sort(() => Math.random() - 0.5);
        const takeStrict = strictMatches.slice(0, needed);
        finalSelection.push(...takeStrict);
        needed -= takeStrict.length;

        if (needed <= 0) return;

        const looseMatches = bucketLoose.filter(i => i.cat === catId).sort(() => Math.random() - 0.5);
        const takeLoose = looseMatches.slice(0, needed);
        finalSelection.push(...takeLoose);
        needed -= takeLoose.length;

        if (needed <= 0) return;

        const fallbackMatches = bucketFallback.filter(i => i.cat === catId).sort(() => Math.random() - 0.5);
        const takeFallback = fallbackMatches.slice(0, needed);
        finalSelection.push(...takeFallback);
    };

    selectedCatIds.forEach(id => fillCategory(id));

    const uniqueSelection = Array.from(new Set(finalSelection.map(s => s.word)))
        .map(w => finalSelection.find(s => s.word === w)!)
        .slice(0, totalTarget);

    if (uniqueSelection.length < 5) {
        log(`❌ CRITICAL: Zelfs met fallback te weinig woorden (${uniqueSelection.length}).`);
        throw new Error("AI genereerde geen bruikbare woorden. Probeer andere categorieën.");
    }
    
    const trimmedSelection = uniqueSelection.sort(() => Math.random() - 0.5).slice(0, totalTarget);
    
    log(`✅ Selectie compleet: ${trimmedSelection.length} woorden.`);

    log(`🎨 Fase 4: Verrijken (Zinnen & Metadata)...`);
    try {
        const enrichedItems = await enrichSelectedWords(trimmedSelection, group);
        
        if (enrichedItems.length === 0) throw new Error("Enrichment returned empty");

        log(`✨ Generatie succesvol afgerond!`);
        
        return enrichedItems.map(item => {
             const original = trimmedSelection.find(t => t.word.toLowerCase() === item.woord.toLowerCase());
             return {
                 ...item,
                 categorie: original ? original.cat : item.categorie
             };
        });

    } catch (e) {
        log(`⚠️ Fout in Fase 4 (Verrijking): ${e}. Terugvallen op kale lijst.`);
        return trimmedSelection.map(i => ({
            woord: i.word,
            categorie: i.cat,
            dicteeZin: `Schrijf op: ${i.word}.`,
            contextZin: `Vul in: ...`
        }));
    }
};

const heuristicSplit = (word: string) => {
    const vowels = /[aeiouy]+/g;
    let parts = [];
    let lastIndex = 0;
    let match;
    while ((match = vowels.exec(word)) !== null) {
        if (match.index + match[0].length < word.length) {
             parts.push(word.substring(lastIndex, match.index + match[0].length));
             lastIndex = match.index + match[0].length;
        }
    }
    if (lastIndex < word.length) parts.push(word.substring(lastIndex));
    if (parts.length === 0) return word.split('').join('-');
    return parts.join('-');
}

const calculateMetadataFallback = (word: string, type: string, categoryId: number, existingMeta: any) => {
    const meta = { ...existingMeta };
    const w = word.toLowerCase();

    if (meta.prefix !== undefined || meta.suffix !== undefined) return meta;

    if (type === 'gaten' || type === 'keuze' || type === 'invul') {
        let match = null;
        if (categoryId === 2) match = w.match(/(ng|nk)/);
        else if (categoryId === 3) match = w.match(/(cht|ch)/);
        else if (categoryId === 4) match = w.match(/(nk)/);
        else if (categoryId === 5) match = w.match(/(eer|oor|eur)/);
        else if (categoryId === 6) match = w.match(/(aai|ooi|oei)/);
        else if (categoryId === 7) match = w.match(/(eeuw|ieuw)/);
        else if (categoryId === 9) match = w.match(/^(be|ge|ver)/);
        else if (categoryId === 11) match = w.match(/(pje|tje|je)$/);
        else if (categoryId === 12) match = w.match(/(ig|lijk)$/);
        else if (categoryId === 13) match = w.match(/i(?!e)/);
        else if (categoryId === 18 || categoryId === 15) match = w.match(/c/);
        else if (categoryId === 24) match = w.match(/eau/);
        else if (categoryId === 26) match = w.match(/g/);
        
        if (match && match.index !== undefined) {
            meta.prefix = w.substring(0, match.index);
            meta.suffix = w.substring(match.index + match[0].length);
        } else {
            meta.prefix = w.substring(0, 1);
            meta.suffix = w.substring(2);
        }
    }
    
    if ((type === 'klankgroep' || type === 'splits') && !meta.lettergrepen) {
        meta.lettergrepen = heuristicSplit(w);
    }

    return meta;
};

const enforceDidacticRules = (item: ExerciseItem, step: 2 | 3): ExerciseItem => {
    const catId = item.categorie;
    const rule = SPELLING_REGELS.find(r => r.id === catId);

    if (!rule) return item;

    if (step === 2) {
        if (rule.stap2 && rule.stap2.instructie) {
            item.opdracht = rule.stap2.instructie;
        }
        
        if (item.type === 'keuze' && (!item.metadata?.choices || item.metadata.choices.length === 0)) {
            const match = rule.stap2?.visual_template?.match(/\((.*?)\)/);
            if (match && match[1]) {
                 item.metadata = { ...item.metadata, choices: match[1].split('/').map(s => s.trim()) };
            }
        }
    }

    return item;
};

export const generateDidacticWordList = async (categoryId: number, group: string): Promise<string[]> => {
    const items = await generateMixedWordList([categoryId], group);
    return items.map(i => i.woord);
};

export const generateDictationSentences = async (words: WordItem[], group: string): Promise<string[]> => {
    if (words[0]?.dicteeZin) {
        return words.map(w => w.dicteeZin || `Schrijf op: ${w.woord}`);
    }

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
    
    const cacheId = `sentences-fallback-v3-${group}-${wordStrings.sort().join('-')}`;

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
            if (s.length !== words.length) return words.map(w => `Schrijf op: ${w.woord}`);
            return s;
        });
    } catch (e) {
        return wordStrings.map(w => `Schrijf op: ${w}`);
    }
};

export const generateExercises = async (words: WordItem[], group: string): Promise<WorksheetExercises> => {
    const wordListStr = words.map(w => w.woord).join(', ');
    const step2Strat = getStep2Strategy(group, words);
    const step3Strat = getStep3Strategy(group, words);

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

    const cacheId = `exercises-robust-v3-${group}-${words.map(w=>w.woord).sort().join('-')}`;

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
            
            const mapItems = (raw: any[], strategyType: any, stepNumber: 2 | 3): ExerciseItem[] => {
                return (raw || []).map((item: any, idx: number) => {
                    const matched = words.find(w => w.woord.toLowerCase() === (item.woord || "").toLowerCase());
                    const catId = matched?.categorie || 0;

                    if (strategyType === 'invul' && matched?.contextZin) {
                        item.opdracht = matched.contextZin;
                    }

                    const finalType = strategyType === 'mixed' ? (item.type || 'gaten') : strategyType;
                    const enhancedMetadata = calculateMetadataFallback(
                        item.woord || matched?.woord || "", 
                        finalType, 
                        catId, 
                        { ...matched, ...(item.metadata || {}) }
                    );

                    let exerciseItem: ExerciseItem = {
                        id: `${finalType}-${Date.now()}-${idx}`,
                        type: finalType, 
                        woord: item.woord,
                        opdracht: item.opdracht || "Opdracht",
                        categorie: catId,
                        metadata: enhancedMetadata
                    };

                    exerciseItem = enforceDidacticRules(exerciseItem, stepNumber);

                    return exerciseItem;
                });
            };

            const result: WorksheetExercises = {
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
                stap2_oefening: mapItems(json.step2, step2Strat.outputType, 2),
                stap3_oefening: mapItems(json.step3, step3Strat.outputType, 3),
                transformatie: mapItems(json.step2, step2Strat.outputType, 2),
                invulzinnen: mapItems(json.step3, 'invul', 3),
                gaten_oefening: mapItems(json.step2, 'gaten', 2),
                klankgroepen_tabel: mapItems(json.step2, 'klankgroep', 2),
                kies_juiste_spelling: []
            };

            return result;
        });
    } catch (e) {
        console.error("Exercises generation failed", e);
        return { 
            stap2_oefening: [], 
            stap3_oefening: [],
            invulzinnen: [], 
            kies_juiste_spelling: [] 
        };
    }
};

export const generateSpellingFeedback = async (target: string, userInput: string, ruleDescription: string, group: string): Promise<string> => {
    return ruleDescription;
};

// Legacy
export const generateWorksheet = async (selectedCatIds: number[], group: string): Promise<any> => { return {}; };
export const generateStory = async (wordList: string[], group: string): Promise<string> => { return ""; };
