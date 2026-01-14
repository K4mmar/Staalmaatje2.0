
import { SpellingRule, CategoriesMap, GroupCategoriesMap, GrammarRule } from './types';

export const SPELLING_REGELS: SpellingRule[] = [
  { 
      "id": 1, 
      "naam": "Hakwoord", 
      "regel": "Ik schrijf het woord zoals ik het hoor.", 
      "actie": "Zet streepjes tussen de letters (b-o-m).",
      "uitgebreide_uitleg": "Ik schrijf het woord zoals ik het hoor. b-o-s bos, d-a-k dak. Speciaal hakwoord: Daar mag geen 'u' tussen (melk, werk).",
      "voorbeeld": "melk", 
      "fout": "meluk" 
  },
  { 
      "id": 2, 
      "naam": "Zingwoord", 
      "regel": "Net als bij ding dong.", 
      "actie": "Zet een rondje om 'ng' of 'nk'.",
      "voorbeeld": "jongen", 
      "fout": "jonggen" 
  },
  { 
      "id": 3, 
      "naam": "Luchtwoord", 
      "regel": "Korte klank + cht met de ch van lucht. Behalve bij: hij ligt, hij legt, hij zegt.", 
      "actie": "Onderstreep de korte klank en 'cht'.",
      "versje": "Sippe Simon heeft weer pech.\nAch, het is zo’n lekker joch.\nDraait zich om en, och, niet huilen.\nSippe Simon, lach nou toch.\nSimon roept na eerst wat kuchen\n“Kijk dan, ik ben goochelaar!”\nMaar helaas het wordt een chaos,\nzijn techniek is toch niet klaar.\nEindelijk, Simon staat te juichen,\nheel zijn lichaam jubelt mee.\nHij roept: “kachel!”, er klinkt: “kachel”!\nDoor de echo zijn het er twee.",
      "voorbeeld": "lucht", 
      "fout": "lugt" 
  },
  { 
      "id": 4, 
      "naam": "Plankwoord", 
      "regel": "Daar mag geen 'g' tussen.", 
      "actie": "Kleur de 'nk'. Geen g!",
      "voorbeeld": "bank", 
      "fout": "bangk" 
  },
  { 
      "id": 5, 
      "naam": "Eer-oor-eur woord", 
      "regel": "Ik schrijf eer, oor, of eur.", 
      "actie": "Onderstreep eer, oor of eur.",
      "uitgebreide_uitleg": "eer-woord: ik schrijf ee (weer, keer). oor-woord: ik schrijf oo (door, koor). eur-woord: ik schrijf eu (deur, sleur). eel-woord: ik schrijf ee (veel, steel).",
      "voorbeeld": "beer", 
      "fout": "bir" 
  },
  { 
      "id": 6, 
      "naam": "Aai-ooi-oei woord", 
      "regel": "Ik hoor de 'j', maar ik schrijf de 'i'.", 
      "actie": "Zet een rondje om de 'i' op het eind.",
      "uitgebreide_uitleg": "aai: haai, maai. ooi: strooi, mooi. oei: loei, roei.",
      "voorbeeld": "haai", 
      "fout": "haaj" 
  },
  { 
      "id": 7, 
      "naam": "Eeuw-ieuw woord", 
      "regel": "Ik denk aan de 'u'.", 
      "actie": "Zet een rondje om de 'u'.",
      "uitgebreide_uitleg": "eeuw: sneeuw, geeuw. ieuw: nieuw, kieuw.",
      "voorbeeld": "nieuwe", 
      "fout": "niewe" 
  },
  { 
      "id": 8, 
      "naam": "Langermaakwoord", 
      "regel": "Ik hoor een 't' aan het eind -> langer maken.", 
      "actie": "Maak het woord langer (hond -> honden).",
      "uitgebreide_uitleg": "Ik hoor een t aan het eind, dus langer maken. Ik hoor of ik d of t moet schrijven (hond-honden). Ook Langermaakwoord (2): Eind-b rijtje, dus langer maken. Ik hoor dat ik een b moet schrijven (krab-krabben).",
      "voorbeeld": "hond", 
      "fout": "hont" 
  },
  { 
      "id": 9, 
      "naam": "Voorvoegsel", 
      "regel": "Ik hoor de 'u', maar ik schrijf de 'e' (be-, ge-, ver-).", 
      "actie": "Kleur het voorvoegsel (be, ge, ver).",
      "uitgebreide_uitleg": "geluk, genoeg, verdwalen en bewaker.",
      "voorbeeld": "gebak", 
      "fout": "gubak" 
  },
  { 
      "id": 10, 
      "naam": "Klankgroepenwoord", 
      "regel": "Klankgroep is... Laatste klank is...", 
      "actie": "Hak het woord in stukjes. Zet een stip onder de klankgroep.",
      "uitgebreide_uitleg": "1. Korte klank (a,e,i,o,u) -> dubbele medeklinker (bakker). 2. Lange klank (aa,ee,oo,uu) -> ik gum een stukje weg (bomen). 3. Twee-tekenklank (ie,eu,au) -> schrijf zoals je hoort. 4. Medeklinker -> schrijf zoals je hoort.",
      "voorbeeld": "bakker / bomen", 
      "fout": "baker / bommen" 
  },
  { 
      "id": 11, 
      "naam": "Verkleinwoord", 
      "regel": "Grondwoord + je/tje/pje.", 
      "actie": "Onderstreep het grondwoord.",
      "uitgebreide_uitleg": "Grondwoord dan –je, -tje, -pje erachter. Verkleinwoord met -etje: ik hoor twee keer u maar schrijf e. Verkleinwoord met: -aatje, -ootje, -uutje (woord + aatje). Let op: Eerst de regels van het grondwoord toepassen!",
      "voorbeeld": "boompje", 
      "fout": "boompie" 
  },
  { 
      "id": 12, 
      "naam": "Achtervoegsel", 
      "regel": "Ik hoor '-ug' of '-luk', maar ik schrijf '-ig' of '-lijk'.", 
      "actie": "Kleur het achtervoegsel (ig of lijk).",
      "voorbeeld": "jarig", 
      "fout": "jarug" 
  },
  { 
      "id": 13, 
      "naam": "Kilowoord", 
      "regel": "Ik hoor de 'ie', maar ik schrijf de 'i'.", 
      "actie": "Zet een rondje om de 'i'.",
      "voorbeeld": "piloot", 
      "fout": "pieloot" 
  },
  { 
      "id": 14, 
      "naam": "Komma-s meervoud", 
      "regel": "Meervoud en lange klank aan het eind -> komma-s.", 
      "actie": "Omcirkel de komma-s ('s).",
      "uitgebreide_uitleg": "Eerst de komma, dan de s ('s avonds). Meervoud: Meervoud en lange klank aan het eind: komma s behalve bij ee (kassa's).",
      "voorbeeld": "auto's", 
      "fout": "autos" 
  },
  { 
      "id": 15, 
      "naam": "Centwoord", 
      "regel": "Ik hoor de 's', maar ik schrijf de 'c'.", 
      "actie": "Onderstreep de 'c'.",
      "voorbeeld": "citroen", 
      "fout": "sitroen" 
  },
  { 
      "id": 16, 
      "naam": "Komma-s diverse", 
      "regel": "Komma-s bij bezit of afkortingen.", 
      "actie": "Omcirkel de komma-s ('s).",
      "voorbeeld": "Anna's", 
      "fout": "Annas" 
  },
  { 
      "id": 17, 
      "naam": "Politiewoord", 
      "regel": "Ik hoor 'tsie', maar ik schrijf 'tie'.", 
      "actie": "Zet een rondje om 'tie'.",
      "voorbeeld": "politie", 
      "fout": "politsie" 
  },
  { 
      "id": 18, 
      "naam": "Colawoord", 
      "regel": "Ik hoor de 'k', maar ik schrijf de 'c'.", 
      "actie": "Onderstreep de 'c'.",
      "voorbeeld": "cola", 
      "fout": "kola" 
  },
  { 
      "id": 19, 
      "naam": "Tropisch woord", 
      "regel": "Ik hoor 'ies', maar ik schrijf 'isch'.", 
      "actie": "Onderstreep 'isch'.",
      "voorbeeld": "tropisch", 
      "fout": "tropies" 
  },
  { 
      "id": 20, 
      "naam": "Taxiwoord", 
      "regel": "Ik hoor 'ks', maar ik schrijf de 'x'.", 
      "actie": "Zet een rondje om de 'x'.",
      "voorbeeld": "taxi", 
      "fout": "taksi" 
  },
  { 
      "id": 21, 
      "naam": "Chefwoord", 
      "regel": "Ik hoor 'sj', maar ik schrijf 'ch'.", 
      "actie": "Onderstreep 'ch'.",
      "uitgebreide_uitleg": "chef, chocola",
      "voorbeeld": "chef", 
      "fout": "sjef" 
  },
  { 
      "id": 22, 
      "naam": "Theewoord", 
      "regel": "Ik hoor 't', maar ik schrijf 'th'.", 
      "actie": "Omcirkel 'th'.",
      "uitgebreide_uitleg": "thee, theater",
      "voorbeeld": "thee", 
      "fout": "tee" 
  }, 
  { 
      "id": 23, 
      "naam": "Caféwoord", 
      "regel": "Leenwoord met een streepje op de 'e'.", 
      "actie": "Zet een rondje om het streepje (é).",
      "voorbeeld": "café", 
      "fout": "cafe" 
  },
  { 
      "id": 24, 
      "naam": "Cadeauwoord", 
      "regel": "Ik hoor 'oo', maar ik schrijf 'eau'.", 
      "actie": "Onderstreep 'eau'.",
      "uitgebreide_uitleg": "cadeau, bureau",
      "voorbeeld": "cadeau", 
      "fout": "kado" 
  },
  { 
      "id": 25, 
      "naam": "Routewoord", 
      "regel": "Ik hoor 'oe', maar ik schrijf 'ou'.", 
      "actie": "Onderstreep 'ou'.",
      "voorbeeld": "route", 
      "fout": "roete" 
  },
  { 
      "id": 26, 
      "naam": "Garagewoord", 
      "regel": "Ik hoor 'zj', maar ik schrijf 'g'.", 
      "actie": "Zet een rondje om de 'g'.",
      "uitgebreide_uitleg": "garage, bagage",
      "voorbeeld": "garage", 
      "fout": "garazje" 
  },
  { 
      "id": 27, 
      "naam": "Lollywoord", 
      "regel": "Ik hoor 'ie', maar ik schrijf 'y'.", 
      "actie": "Zet een rondje om de 'y'.",
      "uitgebreide_uitleg": "Ik schrijf de Griekse y. lolly, baby",
      "voorbeeld": "lolly", 
      "fout": "lollie" 
  },
  { 
      "id": 28, 
      "naam": "Tremawoord", 
      "regel": "Twee puntjes om klinkerbotsing te voorkomen.", 
      "actie": "Zet een rondje om de puntjes.",
      "uitgebreide_uitleg": "Puntjes op de klinker (vegetariër, financiële). Trema meervoud: Bij woorden met ee schrijf ik ën erachter (ideeën). Bij woorden met ie schrijf ik ën erachter (knieën). Behalve bij bacteriën, koloniën, oliën.",
      "voorbeeld": "poëzie", 
      "fout": "poezie" 
  },
  { 
      "id": 29, 
      "naam": "Militairwoord", 
      "regel": "Ik hoor 'èr', maar ik schrijf 'air'.", 
      "actie": "Onderstreep 'air'.",
      "voorbeeld": "militair", 
      "fout": "militèr" 
  },
  { 
      "id": 30, 
      "naam": "Koppelteken", 
      "regel": "Samenstelling met streepje.", 
      "actie": "Zet een rondje om het streepje.",
      "uitgebreide_uitleg": "1. Klinkerbotsing: 1e woord eindigt en 2e woord begint met een klinker (zee-egel). 2. Aardrijkskundige namen (Noord-Brabant). 3. Afkortingen (tv-gids). 4. Met ex, oud en bij klaar-over.",
      "voorbeeld": "na-apen", 
      "fout": "naapen" 
  },
  { 
      "id": 31, 
      "naam": "Trottoirwoord", 
      "regel": "Ik hoor 'waar', ik schrijf 'oir'.", 
      "actie": "Onderstreep 'oir'.",
      "voorbeeld": "trottoir", 
      "fout": "trottewaar" 
  },
  { 
      "id": 32, 
      "naam": "Tussen-e of -en", 
      "regel": "Meervoud van eerste deel is -en? Dan tussen-n.", 
      "actie": "Onderstreep de tussen-n.",
      "uitgebreide_uitleg": "De tussen -e komt bij: bijvoeglijk naamwoord (machteloos), eerste woord geen zelfstandig naamwoord (verrekijker), eerste woord geen meervoud of meervoud op -es (secondewijzer), eerste woord is zon/maan/koningin.",
      "voorbeeld": "pannenkoek", 
      "fout": "pannekoek" 
  },
  { 
      "id": 33, 
      "naam": "Apostrofwoord", 
      "regel": "S's morgens of meervoud op 's.", 
      "actie": "Zet een rondje om de komma-s ('s).",
      "voorbeeld": "baby's", 
      "fout": "babys" 
  },
  { 
      "id": 34, 
      "naam": "Latijns voorvoegsel", 
      "regel": "Ad-, ab-, ob-, sub-.", 
      "actie": "Onderstreep het voorvoegsel.",
      "uitgebreide_uitleg": "abces, advent, obsessie, substantie",
      "voorbeeld": "adviseren", 
      "fout": "atviseren" 
  },
  { 
      "id": 35, 
      "naam": "Samenstelling", 
      "regel": "Twee woorden aan elkaar.", 
      "actie": "Zet een streepje tussen de twee woorden.",
      "uitgebreide_uitleg": "1e woord: (woord+categorie+regel) + 2e woord: (woord+categorie+regel).",
      "voorbeeld": "voetbal", 
      "fout": "voet bal" 
  },
  { 
      "id": 36, 
      "naam": "Ei-plaat", 
      "regel": "Weetwoord: staat op de ei-plaat.", 
      "actie": "Onderstreep de 'ei'.",
      "versje": "EI RAP:\nOnze geit staat in de wei\nmet haar poten in de klei\nen eist een teil met worteltjes en lekker verse prei\nUit de eik valt soms in mei\nuit een heel klein nest een ei\nHet valt steil naar beneden op een zachte rode sprei\nOnze reis gaat met de trein\nHet station is aan het plein,\nmaar de trein moet even wachten op het groene sein.\nHein die zei, ’t is echt een feit,\nMaar, als de knecht de keuken dweilt, heel graag een stukje zeilt.\nWeet je wat Hein ook nog zei?\nEr loopt een engerd op de hei\nen die dreigt zowaar te gooien met een grote kei!",
      "voorbeeld": "trein", 
      "fout": "trijn" 
  },
  { 
      "id": 37, 
      "naam": "Au-plaat", 
      "regel": "Weetwoord: staat op de au-plaat.", 
      "actie": "Onderstreep de 'au'.",
      "versje": "AU RAP:\nDie prachtige pauw\nheeft zo’n last van zijn klauw.\nWat zielig, straks valt de stakker nog flauw.\nLaura eet graag rauw,\ndus niet warm, liever lauw\nmet saus gemaakt van druppeltjes dauw.\nPauls jas is niet blauw,\nmaar een tikkeltje grauw,\nmaar als je dat opmerkt dan krijg je een snauw.\nAls ik vettig kauw\nwordt mijn broek veel te nauw\nen dat doet au! Dus stop ik maar gauw.",
      "voorbeeld": "pauw", 
      "fout": "pouw" 
  }
];

export const GRAMMATICA_REGELS: GrammarRule[] = [
    { term: "Werkwoord", categorie: "woordsoort", uitleg: "Wat doet iemand of wat gebeurt er? (lopen, denken, zijn)" },
    { term: "Lidwoord", categorie: "woordsoort", uitleg: "de, het, een" },
    { term: "Zelfstandig naamwoord", categorie: "woordsoort", uitleg: "Mensen, dieren, dingen (fiets, bakker, hond). Kan 'de', 'het' of 'een' voor." },
    { term: "Bijvoeglijk naamwoord", categorie: "woordsoort", uitleg: "Zegt iets over het zelfstandig naamwoord (grote, mooie, rode)." },
    { term: "Voorzetsel", categorie: "woordsoort", uitleg: "Kast-woorden (in, op, onder, achter, naast de kast)." },
    { term: "Telwoord", categorie: "woordsoort", uitleg: "Hoeveelheid of rangorde (twee, vijfde, veel)." },
    { term: "Persoonsvorm", categorie: "zinsdeel", uitleg: "Het werkwoord dat verandert als je de zin in een andere tijd zet." },
    { term: "Onderwerp", categorie: "zinsdeel", uitleg: "Wie of wat doet het? (Wie + persoonsvorm?)" },
    { term: "Lijdend voorwerp", categorie: "zinsdeel", uitleg: "Wat + persoonsvorm + onderwerp?" },
    { term: "Leestekens", categorie: "leesteken", uitleg: "Hoofdletter, punt, vraagteken, uitroepteken, komma, dubbele punt, aanhalingstekens." }
];

export const CATEGORIES: CategoriesMap = Object.fromEntries(SPELLING_REGELS.map(r => [r.id, r.naam]));

export const GROUP_CATEGORIES: GroupCategoriesMap = {
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 35, 36, 37],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 35, 36, 37],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 35, 36, 37],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]
};

// DIDACTISCHE STRATEGIEËN PER GROEP
interface GradeStrategy {
    systemPrompt: string;
    focusExplanation: string;
    extraFields: string[]; 
    teacherTone: string; 
}

export const GRADE_STRATEGIES: Record<string, GradeStrategy> = {
    '4': {
        focusExplanation: "Focus op: Categorie herkenning (hak/zing/lucht), Speciaal hakwoord (tussen-u).",
        systemPrompt: "NIVEAU GROEP 4. Woorden zijn kort en concreet.",
        teacherTone: "Spreek als een lieve, geduldige juf of meester van groep 4. Gebruik korte zinnen. Gebruik aanmoedigingen zoals 'Zet hem op!' of 'Bijna goed!'. Noem een 'u' tussen letters bij melk/dorp een 'tussen-u'.",
        extraFields: []
    },
    '5': {
        focusExplanation: "Focus op: KLANKGROEPEN (bomen/bommen). De 'Machine'.",
        systemPrompt: "NIVEAU GROEP 5. Focus op Klankgroepenwoord.",
        teacherTone: "Spreek als een enthousiaste leerkracht van groep 5. Verwijs vaak naar de 'klankgroepen-machine'. Gebruik termen als 'korte klank', 'lange klank' en 'twee-teken-klank'.",
        extraFields: ['lettergrepen', 'klankgroepType']
    },
    '6': {
        focusExplanation: "Focus op: Leenwoorden en Sorteren.",
        systemPrompt: "NIVEAU GROEP 6. Introductie leenwoorden en Trema.",
        teacherTone: "Spreek als een deskundige leerkracht van groep 6. Wees duidelijk over de herkomst van woorden (zoals 'Frans leenwoord'). Moedig aan om goed naar de klank te luisteren.",
        extraFields: ['lettergrepen']
    },
    '7': {
        focusExplanation: "Focus op: WERKWOORDEN en complexe regels.",
        systemPrompt: "NIVEAU GROEP 7/8. Grammaticale focus.",
        teacherTone: "Spreek als een coach voor de bovenbouw. Gebruik volwassenere taal maar blijf positief. Verwijs naar stam, kofschip-x en grammaticale context.",
        extraFields: ['werkwoord']
    }
};

export const getStrategy = (group: string) => {
    const key = group === '7/8' || group === '8' ? '7' : group;
    return GRADE_STRATEGIES[key] || GRADE_STRATEGIES['4'];
};
