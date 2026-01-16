
import { WorksheetData, WordItem } from '../types';
import { SPELLING_REGELS } from '../constants';

const generateId = (type: string, idx: number) => `${type}-${Date.now()}-${idx}`;

// Helper om opties uit een template string te halen
const extractChoicesFromTemplate = (template?: string): string[] => {
    if (!template) return [];
    const match = template.match(/\((.*?)\)/);
    if (match && match[1]) {
        return match[1].split('/').map(s => s.trim());
    }
    return [];
};

// Hardcoded lettergrepen voor de mock data woorden (zodat de preview klopt)
const SYLLABLE_MAP: Record<string, string> = {
    // Groep 5 Focus
    'bomen': 'bo-men', 'bakker': 'bak-ker', 'vissen': 'vis-sen', 'jager': 'ja-ger', 'lopen': 'lo-pen',
    'maken': 'ma-ken', 'pannen': 'pan-nen', 'emmer': 'em-mer', 'sturen': 'stu-ren', 'doelen': 'doe-len',
    'zeggen': 'zeg-gen', 'kippen': 'kip-pen', 'boten': 'bo-ten', 'muren': 'mu-ren', 'willen': 'wil-len',
    // Groep 5 Mix
    'hond': 'hond', 'web': 'web', 'stad': 'stad', 'krab': 'krab', 'tent': 'tent',
    'boompje': 'boom-pje', 'klokje': 'klok-je', 'raampje': 'raam-pje', 'truitje': 'trui-tje', 'visje': 'vis-je',
    'piloot': 'pi-loot', 'artikel': 'ar-ti-kel', 'diploma': 'di-plo-ma', 'ritme': 'rit-me', 'radio': 'ra-di-o',
    // Groep 6 Mix Extra
    'molen': 'mo-len'
};

const createMockWorksheet = (
  id: string, 
  title: string, 
  group: string, 
  categories: number[], 
  words: { woord: string, cat: number, meta?: any }[]
): WorksheetData => {
  const woordenlijst: WordItem[] = words.map(w => ({
    woord: w.woord,
    categorie: w.cat
  }));

  const oefeningen: any = {
    sorteer_oefening: { categorieen: categories, woorden: [] },
    transformatie: [], // Stap 2: Analyse
    context: [],       // Stap 3: Transfer
    invulzinnen: [],   
    kies_juiste_spelling: []
  };

  words.forEach((w, i) => {
    const base = { id: generateId('ex', i), woord: w.woord, categorie: w.cat };
    const wordStr = w.woord.toLowerCase();
    
    // 1. Haal de strikte regel definitie op uit de database
    const rule = SPELLING_REGELS.find(r => r.id === w.cat);
    
    // --- STAP 1: SORTEREN / VISUEEL ---
    oefeningen.sorteer_oefening.woorden.push({ 
        ...base, 
        type: 'sorteer', 
        opdracht: rule?.stap1.opdracht || 'Sorteer' 
    });

    // --- STAP 2: ANALYSE (Database Driven + Hybrid Group 6/7 Override) ---
    
    let forcedType = null;
    let metadata: any = { ...w.meta }; // Neem custom meta mee indien aanwezig

    if (group === '6' && w.cat === 10) {
        // Groep 6 Klankgroepen override
        forcedType = 'klankgroep';
        metadata.lettergrepen = SYLLABLE_MAP[wordStr] || wordStr.split('').join('-');
    } else if (group === '7' && w.cat === 99) { 
        // 99 = Interne code voor Werkwoorden in Mock Data
        forcedType = 'werkwoord';
        // Metadata (infinitief etc) zit al in w.meta via de aanroep
    } else if (rule && rule.stap2) {
        // Standaard regel logica uit DB
        const step2Def = rule.stap2;
        metadata.choices = extractChoicesFromTemplate(step2Def.visual_template);
        forcedType = step2Def.type;
        
        if (step2Def.type === 'keuze' && metadata.choices.length > 0) {
            const matchedChoice = metadata.choices.find((c: string) => wordStr.includes(c));
            if (matchedChoice) {
                const parts = wordStr.split(matchedChoice);
                metadata.prefix = parts[0];
                metadata.suffix = parts.slice(1).join(matchedChoice);
            } else {
                metadata.prefix = wordStr.substring(0, wordStr.length - 1);
                metadata.suffix = "";
            }
        } 
        else if (step2Def.type === 'invul') {
             if (w.cat === 9) { // Voorvoegsel
                 const prefix = metadata.choices.find((c: string) => wordStr.startsWith(c));
                 metadata.prefix = "";
                 metadata.suffix = wordStr.substring(prefix?.length || 0);
             } else if (w.cat === 11) { // Verkleinwoord (fallback)
                 metadata.prefix = wordStr.replace(/(je|tje|pje)$/, '');
                 metadata.suffix = "";
             } else {
                 metadata.prefix = wordStr.substring(0, 1);
                 metadata.suffix = wordStr.substring(2);
             }
        }
        else if (step2Def.type === 'splits' || step2Def.type === 'klankgroep') {
            metadata.lettergrepen = SYLLABLE_MAP[wordStr] || wordStr.split('').join('-');
        }
        else if (step2Def.type === 'discriminatie') {
            metadata.foutWoord = rule.fout || (wordStr.substring(0, 2) + "u" + wordStr.substring(2));
        }
    } else {
        forcedType = 'gaten';
        metadata = { prefix: wordStr[0], suffix: wordStr.slice(-1) };
    }

    oefeningen.transformatie.push({ 
        ...base, 
        type: forcedType, 
        opdracht: forcedType === 'werkwoord' ? 'Vul het schema in' : (rule?.stap2?.instructie || 'Opdracht'), 
        metadata 
    });

    // --- STAP 3: CONTEXT ---
    const step3Instruction = rule?.stap3?.instructie || "Vul in.";
    if (i < 8) {
        oefeningen.context.push({ 
            ...base, 
            type: 'invul', 
            opdracht: `${step3Instruction} De ... is groot.` 
        });
    }
  });

  return {
    id,
    created_at: new Date().toISOString(),
    title,
    group,
    categories,
    woordenlijst,
    oefeningen
  };
};

export const MOCK_LAB_DATA: Record<string, WorksheetData> = {
  '4_single': createMockWorksheet('m4s', 'Model: Groep 4 Focus', '4', [1], [
    { woord: 'melk', cat: 1 }, 
    { woord: 'wolk', cat: 1 }, 
    { woord: 'dorp', cat: 1 }, 
    { woord: 'werk', cat: 1 }, 
    { woord: 'jurk', cat: 1 },
    { woord: 'boom', cat: 1 }, 
    { woord: 'roos', cat: 1 }, 
    { woord: 'vis', cat: 1 }, 
    { woord: 'vuur', cat: 1 }, 
    { woord: 'mus', cat: 1 },
    { woord: 'teun', cat: 1 }, 
    { woord: 'ijs', cat: 1 }, 
    { woord: 'bij', cat: 1 }, 
    { woord: 'doos', cat: 1 }, 
    { woord: 'pet', cat: 1 }
  ]),
  '4_mix': createMockWorksheet('m4m', 'Model: Groep 4 Mix', '4', [2, 3, 7], [
    { woord: 'ding', cat: 2 }, { woord: 'tong', cat: 2 }, { woord: 'bang', cat: 2 }, { woord: 'slang', cat: 2 }, { woord: 'ring', cat: 2 },
    { woord: 'lucht', cat: 3 }, { woord: 'nacht', cat: 3 }, { woord: 'pech', cat: 3 }, { woord: 'lach', cat: 3 }, { woord: 'toch', cat: 3 },
    { woord: 'eeuw', cat: 7 }, { woord: 'sneeuw', cat: 7 }, { woord: 'nieuw', cat: 7 }, { woord: 'geeuw', cat: 7 }, { woord: 'kieuw', cat: 7 }
  ]),
  '5_single': createMockWorksheet('m5s', 'Model: Groep 5 Focus', '5', [10], [
    { woord: 'bomen', cat: 10 }, { woord: 'bakker', cat: 10 }, { woord: 'vissen', cat: 10 }, { woord: 'jager', cat: 10 }, { woord: 'lopen', cat: 10 },
    { woord: 'maken', cat: 10 }, { woord: 'pannen', cat: 10 }, { woord: 'emmer', cat: 10 }, { woord: 'sturen', cat: 10 }, { woord: 'doelen', cat: 10 },
    { woord: 'zeggen', cat: 10 }, { woord: 'kippen', cat: 10 }, { woord: 'boten', cat: 10 }, { woord: 'muren', cat: 10 }, { woord: 'willen', cat: 10 }
  ]),
  '5_mix': createMockWorksheet('m5m', 'Model: Groep 5 Mix', '5', [8, 11, 13], [
    { woord: 'hond', cat: 8 }, { woord: 'web', cat: 8 }, { woord: 'stad', cat: 8 }, { woord: 'krab', cat: 8 }, { woord: 'tent', cat: 8 },
    { woord: 'boompje', cat: 11 }, { woord: 'klokje', cat: 11 }, { woord: 'raampje', cat: 11 }, { woord: 'truitje', cat: 11 }, { woord: 'visje', cat: 11 },
    { woord: 'piloot', cat: 13 }, { woord: 'artikel', cat: 13 }, { woord: 'diploma', cat: 13 }, { woord: 'ritme', cat: 13 }, { woord: 'radio', cat: 13 }
  ]),
  '6_single': createMockWorksheet('m6s', 'Model: Groep 6 Focus', '6', [18], [
    { woord: 'cola', cat: 18 }, { woord: 'computer', cat: 18 }, { woord: 'cactus', cat: 18 }, { woord: 'camera', cat: 18 }, { woord: 'conflict', cat: 18 },
    { woord: 'contact', cat: 18 }, { woord: 'correct', cat: 18 }, { woord: 'cursus', cat: 18 }, { woord: 'clown', cat: 18 }, { woord: 'circus', cat: 18 },
    { woord: 'code', cat: 18 }, { woord: 'concept', cat: 18 }, { woord: 'club', cat: 18 }, { woord: 'crisis', cat: 18 }, { woord: 'creatief', cat: 18 }
  ]),
  '6_mix': createMockWorksheet('m6m', 'Model: Groep 6 Mix (Hybride)', '6', [10, 27, 28], [
    { woord: 'molen', cat: 10 }, { woord: 'jager', cat: 10 }, { woord: 'kippen', cat: 10 }, { woord: 'bomen', cat: 10 }, { woord: 'bakker', cat: 10 },
    { woord: 'lolly', cat: 27 }, { woord: 'baby', cat: 27 }, { woord: 'pony', cat: 27 }, { woord: 'hobby', cat: 27 }, { woord: 'gym', cat: 27 },
    { woord: 'ideeën', cat: 28 }, { woord: 'knieën', cat: 28 }, { woord: 'zeeën', cat: 28 }, { woord: 'poëzie', cat: 28 }, { woord: 'ruïne', cat: 28 }
  ]),
  '7_single': createMockWorksheet('m7s', 'Model: Groep 7 Focus', '7', [99], [
    { woord: 'vindt', cat: 99, meta: { infinitief: 'vinden', tijd: 'tt' } }, 
    { woord: 'gebeurde', cat: 99, meta: { infinitief: 'gebeuren', tijd: 'vt' } }, 
    { woord: 'wordt', cat: 99, meta: { infinitief: 'worden', tijd: 'tt' } }, 
    { woord: 'gebrand', cat: 99, meta: { infinitief: 'branden', tijd: 'vd' } }, 
    { woord: 'verhuisd', cat: 99, meta: { infinitief: 'verhuizen', tijd: 'vd' } },
    { woord: 'praatte', cat: 99, meta: { infinitief: 'praten', tijd: 'vt' } }, 
    { woord: 'lustte', cat: 99, meta: { infinitief: 'lusten', tijd: 'vt' } }, 
    { woord: 'brandde', cat: 99, meta: { infinitief: 'branden', tijd: 'vt' } }, 
    { woord: 'verwacht', cat: 99, meta: { infinitief: 'verwachten', tijd: 'tt' } }, 
    { woord: 'beloofd', cat: 99, meta: { infinitief: 'beloven', tijd: 'vd' } },
    { woord: 'raadt', cat: 99, meta: { infinitief: 'raden', tijd: 'tt' } }, 
    { woord: 'denkt', cat: 99, meta: { infinitief: 'denken', tijd: 'tt' } }, 
    { woord: 'landde', cat: 99, meta: { infinitief: 'landen', tijd: 'vt' } }, 
    { woord: 'verbreed', cat: 99, meta: { infinitief: 'verbreden', tijd: 'tt' } }, 
    { woord: 'schudde', cat: 99, meta: { infinitief: 'schudden', tijd: 'vt' } }
  ]),
  '7_mix': createMockWorksheet('m7m', 'Model: Groep 7 Mix', '7', [24, 26, 32], [
    { woord: 'cadeau', cat: 24 }, { woord: 'bureau', cat: 24 }, { woord: 'niveau', cat: 24 }, { woord: 'plateau', cat: 24 }, { woord: 'claxon', cat: 18 },
    { woord: 'garage', cat: 26 }, { woord: 'bagage', cat: 26 }, { woord: 'massage', cat: 26 }, { woord: 'lekkage', cat: 26 }, { woord: 'slijtage', cat: 26 },
    { woord: 'pannenkoek', cat: 32 }, { woord: 'kippenhok', cat: 32 }, { woord: 'hondenhok', cat: 32 }, { woord: 'vliegenzwam', cat: 32 }, { woord: 'boekenrek', cat: 32 }
  ])
};
