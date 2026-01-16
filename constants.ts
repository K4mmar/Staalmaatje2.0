
import { SpellingRule, CategoriesMap, GroupCategoriesMap, GrammarRule } from './types';

export const SPELLING_REGELS: SpellingRule[] = [
  { 
      "id": 1, 
      "naam": "Hakwoord", 
      "regel": "Ik schrijf het woord zoals ik het hoor.", 
      "actie": "Zet streepjes tussen de letters.",
      "uitgebreide_uitleg": "Ik schrijf het woord zoals ik het hoor. b-o-s bos, d-a-k dak. Speciaal hakwoord: Daar mag geen 'u' tussen (melk, werk).",
      "voorbeeld": "melk", 
      "fout": "meluk",
      "stap1": { "opdracht": "Zet streepjes tussen de letters", "visueel_type": "streepjes" },
      "stap2": { "titel": "Speciaal Hakwoord", "instructie": "Hoor je een u? Schrijf hem niet!", "type": "discriminatie", "visual_template": "melk | meluk" },
      "stap3": { "titel": "Zinnen", "instructie": "Vul het hakwoord in.", "type": "invulzin" }
  },
  { 
      "id": 2, 
      "naam": "Zingwoord", 
      "regel": "Net als bij ding dong.", 
      "actie": "Zet een rondje om 'ng' of 'nk'.",
      "voorbeeld": "jongen", 
      "fout": "jonggen",
      "stap1": { "opdracht": "Zet een rondje om ng of nk", "visueel_type": "cirkel" },
      "stap2": { "titel": "Zingwoord", "instructie": "Vul in: ng of nk?", "type": "keuze", "visual_template": "di... (ng/nk)" },
      "stap3": { "titel": "Context", "instructie": "Maak de zin af.", "type": "context" }
  },
  { 
      "id": 3, 
      "naam": "Luchtwoord", 
      "regel": "Korte klank + cht met de ch van lucht.", 
      "actie": "Onderstreep 'cht' of 'ch'.",
      "versje": "Sippe Simon heeft weer pech...",
      "voorbeeld": "lucht", 
      "fout": "lugt",
      "stap1": { "opdracht": "Onderstreep cht of ch", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Luchtwoord", "instructie": "Korte klank? Vul in.", "type": "keuze", "visual_template": "lu...t (g/ch/cht)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 4, 
      "naam": "Plankwoord", 
      "regel": "Daar mag geen 'g' tussen.", 
      "actie": "Onderstreep de 'nk'. Geen g!",
      "voorbeeld": "bank", 
      "fout": "bangk",
      "stap1": { "opdracht": "Onderstreep nk", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Plankwoord", "instructie": "Vul in: ng of nk?", "type": "keuze", "visual_template": "ba... (ng/nk)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 5, 
      "naam": "Eer-oor-eur woord", 
      "regel": "Ik schrijf eer, oor, of eur.", 
      "actie": "Onderstreep eer, oor of eur.",
      "voorbeeld": "beer", 
      "fout": "bir",
      "stap1": { "opdracht": "Onderstreep eer, oor of eur", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Eer-oor-eur", "instructie": "Vul in: eer, oor of eur?", "type": "keuze", "visual_template": "b... (eer/oor/eur)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 6, 
      "naam": "Aai-ooi-oei woord", 
      "regel": "Ik hoor de 'j', maar ik schrijf de 'i'.", 
      "actie": "Zet een rondje om de 'i' op het eind.",
      "voorbeeld": "haai", 
      "fout": "haaj",
      "stap1": { "opdracht": "Zet een rondje om de i", "visueel_type": "cirkel" },
      "stap2": { "titel": "Aai-ooi-oei", "instructie": "Vul in: aai, ooi of oei?", "type": "keuze", "visual_template": "h... (aai/ooi/oei)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 7, 
      "naam": "Eeuw-ieuw woord", 
      "regel": "Ik denk aan de 'u'.", 
      "actie": "Zet een rondje om de 'u'.",
      "voorbeeld": "nieuwe", 
      "fout": "niewe",
      "stap1": { "opdracht": "Zet een rondje om de u", "visueel_type": "cirkel" },
      "stap2": { "titel": "Eeuw-ieuw", "instructie": "Vergeet de u niet!", "type": "keuze", "visual_template": "sn... (eeuw/ieuw)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 8, 
      "naam": "Langermaakwoord", 
      "regel": "Ik hoor een 't' aan het eind -> langer maken.", 
      "actie": "Onderstreep de d of t op het eind.",
      "voorbeeld": "hond", 
      "fout": "hont",
      "stap1": { "opdracht": "Onderstreep de laatste letter (d/t)", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Langermaakwoord", "instructie": "Maak het woord langer. d of t?", "type": "langermaak", "visual_template": "hon... (d/t)" },
      "stap3": { "titel": "Vervoeging", "instructie": "Enkelvoud of meervoud?", "type": "invulzin" }
  },
  { 
      "id": 9, 
      "naam": "Voorvoegsel", 
      "regel": "Ik hoor de 'u', maar ik schrijf de 'e' (be-, ge-, ver-).", 
      "actie": "Onderstreep het voorvoegsel (be, ge, ver).",
      "voorbeeld": "gebak", 
      "fout": "gubak",
      "stap1": { "opdracht": "Onderstreep be, ge of ver", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Voorvoegsel", "instructie": "Vul in: be, ge of ver.", "type": "invul", "visual_template": "...bak (be/ge/ver)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 10, 
      "naam": "Klankgroepenwoord", 
      "regel": "Klankgroep is... Laatste klank is...", 
      "actie": "Schrijf het woord netjes op.",
      "voorbeeld": "bomen", 
      "fout": "bommen",
      "stap1": { "opdracht": "Schrijf het woord netjes op", "visueel_type": "tekst" },
      "stap2": { 
          "titel": "Klankgroepen Schema", 
          "instructie": "Splits het woord. Welke regel hoort erbij?", 
          "type": "klankgroep", 
          "visual_template": "bo - men" 
      },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 11, 
      "naam": "Verkleinwoord", 
      "regel": "Grondwoord + je/tje/pje.", 
      "actie": "Onderstreep het grondwoord.",
      "voorbeeld": "boompje", 
      "fout": "boompie",
      "stap1": { "opdracht": "Onderstreep het grondwoord", "visueel_type": "onderstreep" },
      "stap2": { 
          "titel": "Verkleinwoord", 
          "instructie": "Analyse: Grondwoord + stukje.", 
          "type": "splits", 
          "visual_template": "boom - pje" 
      },
      "stap3": { "titel": "Transform", "instructie": "Maak klein.", "type": "invulzin" }
  },
  { 
      "id": 12, 
      "naam": "Achtervoegsel", 
      "regel": "Ik hoor '-ug' of '-luk', maar ik schrijf '-ig' of '-lijk'.", 
      "actie": "Onderstreep het achtervoegsel (ig of lijk).",
      "voorbeeld": "jarig", 
      "fout": "jarug",
      "stap1": { "opdracht": "Onderstreep ig of lijk", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Achtervoegsel", "instructie": "Vul in: ig of lijk?", "type": "keuze", "visual_template": "jar... (ig/lijk)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 13, 
      "naam": "Kilowoord", 
      "regel": "Ik hoor de 'ie', maar ik schrijf de 'i'.", 
      "actie": "Zet een rondje om de 'i'.",
      "voorbeeld": "piloot", 
      "fout": "pieloot",
      "stap1": { "opdracht": "Zet een rondje om de i", "visueel_type": "cirkel" },
      "stap2": { "titel": "Kilowoord", "instructie": "Vul in: i of ie?", "type": "keuze", "visual_template": "p...loot (i/ie)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 14, 
      "naam": "Komma-s meervoud", 
      "regel": "Meervoud en lange klank aan het eind -> komma-s.", 
      "actie": "Omcirkel de komma-s ('s).",
      "voorbeeld": "auto's", 
      "fout": "autos",
      "stap1": { "opdracht": "Omcirkel de 's", "visueel_type": "cirkel" },
      "stap2": { "titel": "Komma-s", "instructie": "Meervoud: s of 's?", "type": "keuze", "visual_template": "auto..." },
      "stap3": { "titel": "Meervoud", "instructie": "Zet in meervoud.", "type": "invulzin" }
  },
  { 
      "id": 15, 
      "naam": "Centwoord", 
      "regel": "Ik hoor de 's', maar ik schrijf de 'c'.", 
      "actie": "Onderstreep de 'c'.",
      "voorbeeld": "citroen", 
      "fout": "sitroen",
      "stap1": { "opdracht": "Onderstreep de c", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Centwoord", "instructie": "Vul in: s of c?", "type": "keuze", "visual_template": "...itroen (s/c)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 16, 
      "naam": "Komma-s diverse", 
      "regel": "Komma-s bij bezit of afkortingen.", 
      "actie": "Omcirkel de komma-s ('s).",
      "voorbeeld": "Anna's", 
      "fout": "Annas",
      "stap1": { "opdracht": "Omcirkel de 's", "visueel_type": "cirkel" },
      "stap2": { "titel": "Komma-s", "instructie": "Vul in: s of 's?", "type": "keuze", "visual_template": "Anna..." },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 17, 
      "naam": "Politiewoord", 
      "regel": "Ik hoor 'tsie', maar ik schrijf 'tie'.", 
      "actie": "Zet een rondje om 'tie'.",
      "voorbeeld": "politie", 
      "fout": "politsie",
      "stap1": { "opdracht": "Zet een rondje om tie", "visueel_type": "cirkel" },
      "stap2": { "titel": "Politiewoord", "instructie": "Vul in: tie of tsie?", "type": "keuze", "visual_template": "poli... (tie/tsie)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 18, 
      "naam": "Colawoord", 
      "regel": "Ik hoor de 'k', maar ik schrijf de 'c'.", 
      "actie": "Onderstreep de 'c'.",
      "voorbeeld": "cola", 
      "fout": "kola",
      "stap1": { "opdracht": "Onderstreep de c", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Colawoord", "instructie": "Vul in: k of c?", "type": "keuze", "visual_template": "...ola (k/c)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 19, 
      "naam": "Tropisch woord", 
      "regel": "Ik hoor 'ies', maar ik schrijf 'isch'.", 
      "actie": "Onderstreep 'isch'.",
      "voorbeeld": "tropisch", 
      "fout": "tropies",
      "stap1": { "opdracht": "Onderstreep isch", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Tropisch woord", "instructie": "Vul in: ies of isch?", "type": "keuze", "visual_template": "trop... (ies/isch)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 20, 
      "naam": "Taxiwoord", 
      "regel": "Ik hoor 'ks', maar ik schrijf de 'x'.", 
      "actie": "Zet een rondje om de 'x'.",
      "voorbeeld": "taxi", 
      "fout": "taksi",
      "stap1": { "opdracht": "Zet een rondje om de x", "visueel_type": "cirkel" },
      "stap2": { "titel": "Taxiwoord", "instructie": "Vul in: ks of x?", "type": "keuze", "visual_template": "ta...i (ks/x)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 21, 
      "naam": "Chefwoord", 
      "regel": "Ik hoor 'sj', maar ik schrijf 'ch'.", 
      "actie": "Onderstreep 'ch'.",
      "voorbeeld": "chef", 
      "fout": "sjef",
      "stap1": { "opdracht": "Onderstreep ch", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Chefwoord", "instructie": "Vul in: sj of ch?", "type": "keuze", "visual_template": "...ef (sj/ch)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 22, 
      "naam": "Theewoord", 
      "regel": "Ik hoor 't', maar ik schrijf 'th'.", 
      "actie": "Omcirkel 'th'.",
      "voorbeeld": "thee", 
      "fout": "tee",
      "stap1": { "opdracht": "Omcirkel th", "visueel_type": "cirkel" },
      "stap2": { "titel": "Theewoord", "instructie": "Vul in: t of th?", "type": "keuze", "visual_template": "...ee (t/th)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  }, 
  { 
      "id": 23, 
      "naam": "Caféwoord", 
      "regel": "Leenwoord met een streepje op de 'e'.", 
      "actie": "Zet een rondje om de 'é'.",
      "voorbeeld": "café", 
      "fout": "cafe",
      "stap1": { "opdracht": "Zet een rondje om de é", "visueel_type": "cirkel" },
      "stap2": { "titel": "Caféwoord", "instructie": "Zet het streepje goed.", "type": "keuze", "visual_template": "caf... (e/é)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 24, 
      "naam": "Cadeauwoord", 
      "regel": "Ik hoor 'oo', maar ik schrijf 'eau'.", 
      "actie": "Onderstreep 'eau'.",
      "voorbeeld": "cadeau", 
      "fout": "kado",
      "stap1": { "opdracht": "Onderstreep eau", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Cadeauwoord", "instructie": "Vul in: oo of eau?", "type": "keuze", "visual_template": "cad... (oo/eau)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 25, 
      "naam": "Routewoord", 
      "regel": "Ik hoor 'oe', maar ik schrijf 'ou'.", 
      "actie": "Onderstreep 'ou'.",
      "voorbeeld": "route", 
      "fout": "roete",
      "stap1": { "opdracht": "Onderstreep ou", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Routewoord", "instructie": "Vul in: oe of ou?", "type": "keuze", "visual_template": "r...te (oe/ou)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 26, 
      "naam": "Garagewoord", 
      "regel": "Ik hoor 'zj', maar ik schrijf 'g'.", 
      "actie": "Zet een rondje om de 'g'.",
      "voorbeeld": "garage", 
      "fout": "garazje",
      "stap1": { "opdracht": "Zet een rondje om de g", "visueel_type": "cirkel" },
      "stap2": { "titel": "Garagewoord", "instructie": "Vul in: zj of g?", "type": "keuze", "visual_template": "gara...e (zj/g)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 27, 
      "naam": "Lollywoord", 
      "regel": "Ik hoor 'ie', maar ik schrijf 'y'.", 
      "actie": "Zet een rondje om de 'y'.",
      "voorbeeld": "lolly", 
      "fout": "lollie",
      "stap1": { "opdracht": "Zet een rondje om de y", "visueel_type": "cirkel" },
      "stap2": { "titel": "Lollywoord", "instructie": "Vul in: ie of y?", "type": "keuze", "visual_template": "bab... (ie/y)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 28, 
      "naam": "Tremawoord", 
      "regel": "Twee puntjes om klinkerbotsing te voorkomen.", 
      "actie": "Zet een rondje om de letter met puntjes.",
      "voorbeeld": "poëzie", 
      "fout": "poezie",
      "stap1": { "opdracht": "Zet een rondje om de klinker met trema", "visueel_type": "cirkel" },
      "stap2": { "titel": "Tremawoord", "instructie": "Zet de puntjes op de juiste plek.", "type": "invul", "visual_template": "po..zie (ë)" },
      "stap3": { "titel": "Meervoud", "instructie": "Zet in meervoud.", "type": "invulzin" }
  },
  { 
      "id": 29, 
      "naam": "Militairwoord", 
      "regel": "Ik hoor 'èr', maar ik schrijf 'air'.", 
      "actie": "Onderstreep 'air'.",
      "voorbeeld": "militair", 
      "fout": "militèr",
      "stap1": { "opdracht": "Onderstreep air", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Militairwoord", "instructie": "Vul in: èr of air?", "type": "keuze", "visual_template": "milit... (èr/air)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 30, 
      "naam": "Koppelteken", 
      "regel": "Samenstelling met streepje.", 
      "actie": "Zet een rondje om het streepje.",
      "voorbeeld": "na-apen", 
      "fout": "naapen",
      "stap1": { "opdracht": "Zet een rondje om het streepje", "visueel_type": "cirkel" },
      "stap2": { "titel": "Koppelteken", "instructie": "Vergeet het streepje niet!", "type": "invul", "visual_template": "na...apen (-)" },
      "stap3": { "titel": "Samenstelling", "instructie": "Maak de samenstelling.", "type": "invulzin" }
  },
  { 
      "id": 31, 
      "naam": "Trottoirwoord", 
      "regel": "Ik hoor 'waar', ik schrijf 'oir'.", 
      "actie": "Onderstreep 'oir'.",
      "voorbeeld": "trottoir", 
      "fout": "trottewaar",
      "stap1": { "opdracht": "Onderstreep oir", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Trottoirwoord", "instructie": "Vul in: waar of oir?", "type": "keuze", "visual_template": "trott... (waar/oir)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 32, 
      "naam": "Tussen-e of -en", 
      "regel": "Meervoud van eerste deel is -en? Dan tussen-n.", 
      "actie": "Onderstreep de tussen-n.",
      "voorbeeld": "pannenkoek", 
      "fout": "pannekoek",
      "stap1": { "opdracht": "Onderstreep de tussen-n", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Tussen-n", "instructie": "Vul in: e of en?", "type": "keuze", "visual_template": "pann...koek (e/en)" },
      "stap3": { "titel": "Samenstelling", "instructie": "Maak de samenstelling.", "type": "invulzin" }
  },
  { 
      "id": 33, 
      "naam": "Apostrofwoord", 
      "regel": "S's morgens of meervoud op 's.", 
      "actie": "Zet een rondje om de komma-s ('s).",
      "voorbeeld": "baby's", 
      "fout": "babys",
      "stap1": { "opdracht": "Zet een rondje om 's", "visueel_type": "cirkel" },
      "stap2": { "titel": "Apostrofwoord", "instructie": "Vul in: s of 's?", "type": "keuze", "visual_template": "baby..." },
      "stap3": { "titel": "Meervoud", "instructie": "Zet in meervoud.", "type": "invulzin" }
  },
  { 
      "id": 34, 
      "naam": "Latijns voorvoegsel", 
      "regel": "Ad-, ab-, ob-, sub-.", 
      "actie": "Onderstreep het voorvoegsel.",
      "voorbeeld": "adviseren", 
      "fout": "atviseren",
      "stap1": { "opdracht": "Onderstreep het voorvoegsel", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Latijns Voorvoegsel", "instructie": "Vul de juiste letters in.", "type": "invul", "visual_template": "...viseren (ad)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 35, 
      "naam": "Samenstelling", 
      "regel": "Twee woorden aan elkaar.", 
      "actie": "Zet een streepje tussen de twee woorden.",
      "voorbeeld": "voetbal", 
      "fout": "voet bal",
      "stap1": { "opdracht": "Zet een streepje tussen de woorden", "visueel_type": "splits" },
      "stap2": { "titel": "Samenstelling", "instructie": "Schrijf de woorden aan elkaar.", "type": "invul", "visual_template": "voet + bal" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 36, 
      "naam": "Ei-plaat", 
      "regel": "Weetwoord: staat op de ei-plaat.", 
      "actie": "Onderstreep de 'ei'.",
      "voorbeeld": "trein", 
      "fout": "trijn",
      "stap1": { "opdracht": "Onderstreep ei", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Ei-plaat", "instructie": "Staat het op de ei-plaat? Vul in: ei of ij?", "type": "keuze", "visual_template": "tr...n (ei/ij)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
  },
  { 
      "id": 37, 
      "naam": "Au-plaat", 
      "regel": "Weetwoord: staat op de au-plaat.", 
      "actie": "Onderstreep de 'au'.",
      "voorbeeld": "pauw", 
      "fout": "pouw",
      "stap1": { "opdracht": "Onderstreep au", "visueel_type": "onderstreep" },
      "stap2": { "titel": "Au-plaat", "instructie": "Staat het op de au-plaat? Vul in: au of ou?", "type": "keuze", "visual_template": "p...w (au/ou)" },
      "stap3": { "titel": "Context", "instructie": "Vul in.", "type": "context" }
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
