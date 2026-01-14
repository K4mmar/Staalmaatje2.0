
import { WorksheetData, WordItem } from '../types';

const generateId = (type: string, idx: number) => `${type}-${Date.now()}-${idx}`;

const createMockWorksheet = (
  id: string, 
  title: string, 
  group: string, 
  categories: number[], 
  words: { woord: string, cat: number }[]
): WorksheetData => {
  const woordenlijst: WordItem[] = words.map(w => ({
    woord: w.woord,
    categorie: w.cat
  }));

  const oefeningen: any = {
    sorteer_oefening: { categorieen: categories, woorden: [] },
    transformatie: [], // Stap 2: Analyse
    context: [],       // Stap 3: Transfer (max 8)
    invulzinnen: [],   // Fallback/Legacy support
    kies_juiste_spelling: []
  };

  words.forEach((w, i) => {
    const base = { id: generateId('ex', i), woord: w.woord, categorie: w.cat };
    
    // STAP 1: Sorteer/Herkenning (Altijd 15)
    oefeningen.sorteer_oefening.woorden.push({ ...base, type: 'sorteer', opdracht: 'Sorteer' });

    // STAP 2: Analyse/Transformatie (Altijd 15)
    if (group === '4') {
        oefeningen.transformatie.push({ ...base, type: 'gaten', metadata: { prefix: w.woord.slice(0, 2), suffix: w.woord.slice(-1) } });
    } else if (group === '5' || group === '6') {
        oefeningen.transformatie.push({ ...base, type: 'klankgroep', metadata: { lettergrepen: w.woord.split('').join('-') } });
    } else {
        oefeningen.transformatie.push({ ...base, type: 'grammatica', metadata: { woordsoort: i % 3 === 0 ? 'zn' : i % 3 === 1 ? 'ww' : 'bn' } });
    }

    // STAP 3: Context/Transfer (Beperkt tot 8 items)
    if (i < 8) {
        if (group === '4' || group === '5') {
            oefeningen.context.push({ ...base, type: 'invul', opdracht: `Ik zie een ... in de verte.` });
        } else {
            oefeningen.context.push({ ...base, type: 'redacteur', opdracht: `Is het woord ${w.woord} hier wel goet geschreven?` });
        }
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
    { woord: 'boom', cat: 1 }, { woord: 'roos', cat: 1 }, { woord: 'vis', cat: 1 }, { woord: 'vuur', cat: 1 }, { woord: 'mus', cat: 1 },
    { woord: 'teun', cat: 1 }, { woord: 'ijs', cat: 1 }, { woord: 'bij', cat: 1 }, { woord: 'doos', cat: 1 }, { woord: 'pet', cat: 1 },
    { woord: 'sok', cat: 1 }, { woord: 'bel', cat: 1 }, { woord: 'mes', cat: 1 }, { woord: 'kar', cat: 1 }, { woord: 'hol', cat: 1 }
  ]),
  '4_mix': createMockWorksheet('m4m', 'Model: Groep 4 Mix', '4', [2, 3, 7], [
    { woord: 'ding', cat: 2 }, { woord: 'tong', cat: 2 }, { woord: 'bang', cat: 2 }, { woord: 'slang', cat: 2 }, { woord: 'ring', cat: 2 },
    { woord: 'lucht', cat: 3 }, { woord: 'nacht', cat: 3 }, { woord: 'pech', cat: 3 }, { woord: 'lach', cat: 3 }, { woord: 'toch', cat: 3 },
    { woord: 'eeuw', cat: 7 }, { woord: 'sneeuw', cat: 7 }, { woord: 'nieuw', cat: 7 }, { woord: 'geeuw', cat: 7 }, { woord: 'kieuw', cat: 7 }
  ]),
  '5_single': createMockWorksheet('m5s', 'Model: Groep 5 Focus', '5', [10], [
    { woord: 'bakker', cat: 10 }, { woord: 'bomen', cat: 10 }, { woord: 'vissen', cat: 10 }, { woord: 'jager', cat: 10 }, { woord: 'lopen', cat: 10 },
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
  '6_mix': createMockWorksheet('m6m', 'Model: Groep 6 Mix', '6', [20, 27, 28], [
    { woord: 'taxi', cat: 20 }, { woord: 'examen', cat: 20 }, { woord: 'exact', cat: 20 }, { woord: 'extra', cat: 20 }, { woord: 'saxofoon', cat: 20 },
    { woord: 'lolly', cat: 27 }, { woord: 'baby', cat: 27 }, { woord: 'pony', cat: 27 }, { woord: 'hobby', cat: 27 }, { woord: 'gym', cat: 27 },
    { woord: 'ideeën', cat: 28 }, { woord: 'knieën', cat: 28 }, { woord: 'zeeën', cat: 28 }, { woord: 'poëzie', cat: 28 }, { woord: 'ruïne', cat: 28 }
  ]),
  '7_single': createMockWorksheet('m7s', 'Model: Groep 7 Focus', '7', [17], [
    { woord: 'politie', cat: 17 }, { woord: 'vakantie', cat: 17 }, { woord: 'station', cat: 17 }, { woord: 'operatie', cat: 17 }, { woord: 'reaktie', cat: 17 },
    { woord: 'traditie', cat: 17 }, { woord: 'portie', cat: 17 }, { woord: 'emotie', cat: 17 }, { woord: 'generatie', cat: 17 }, { woord: 'situatie', cat: 17 },
    { woord: 'informatie', cat: 17 }, { woord: 'prestatie', cat: 17 }, { woord: 'repetitie', cat: 17 }, { woord: 'sollicitatie', cat: 17 }, { woord: 'illustratie', cat: 17 }
  ]),
  '7_mix': createMockWorksheet('m7m', 'Model: Groep 7 Mix', '7', [24, 26, 32], [
    { woord: 'cadeau', cat: 24 }, { woord: 'bureau', cat: 24 }, { woord: 'niveau', cat: 24 }, { woord: 'plateau', cat: 24 }, { woord: 'claxon', cat: 18 },
    { woord: 'garage', cat: 26 }, { woord: 'bagage', cat: 26 }, { woord: 'massage', cat: 26 }, { woord: 'lekkage', cat: 26 }, { woord: 'slijtage', cat: 26 },
    { woord: 'pannenkoek', cat: 32 }, { woord: 'kippenhok', cat: 32 }, { woord: 'hondenhok', cat: 32 }, { woord: 'vliegenzwam', cat: 32 }, { woord: 'boekenrek', cat: 32 }
  ])
};
