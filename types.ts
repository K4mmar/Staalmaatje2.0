
export type ViewState = 'dashboard' | 'create' | 'library' | 'player' | 'admin' | 'dictee' | 'rules' | 'info' | 'tester';
export type GradeLevel = '4' | '5' | '6' | '7' | '8' | '7/8';

// CategoriesMap is a mapping from rule ID to name
export type CategoriesMap = Record<number, string>;
// GroupCategoriesMap is a mapping from grade level to allowed rule IDs
export type GroupCategoriesMap = Record<string | number, number[]>;

export interface SpellingRuleStep1 {
  opdracht: string;       // Bijv: "Zet streepjes"
  visueel_type: 'streepjes' | 'cirkel' | 'onderstreep' | 'tekst' | 'splits';
  toelichting?: string;   // Extra info voor docent
}

export interface SpellingRuleStep2 {
  titel: string;
  instructie: string;
  hulp?: string;
  type: 'invul' | 'keuze' | 'discriminatie' | 'langermaak' | 'splits' | 'grammatica' | 'klankgroep';
  visual_template?: string; // Bijv: "....cht" of "melk | mellek"
}

export interface SpellingRuleStep3 {
  titel: string;
  instructie: string;
  type: 'invulzin' | 'context' | 'redacteur' | 'vervoeging';
  voorbeeld_context?: string; // Bijv: "De [woord] staat in de wei."
}

export interface SpellingRule {
  id: number;
  naam: string;
  regel: string;
  actie?: string;    
  uitgebreide_uitleg?: string; 
  versje?: string; 
  voorbeeld: string; 
  fout: string;      
  stap1: SpellingRuleStep1; 
  stap2?: SpellingRuleStep2; 
  stap3?: SpellingRuleStep3; // Nieuw
}

export interface GrammarRule {
  term: string;
  uitleg: string;
  categorie: 'woordsoort' | 'zinsdeel' | 'leesteken';
}

export interface WordItem {
  woord: string;
  categorie: number;
  dicteeZin?: string;   // Nieuw: Zin voor dictee (leerkracht leest voor)
  contextZin?: string;  // Nieuw: Zin voor werkblad (leerling vult in)
  lettergrepen?: string; 
  klankgroepType?: 'kort' | 'lang' | 'twee-teken' | 'medeklinker' | 'anders';
  werkwoord?: {
    stam?: string;
    tijd?: 'tt' | 'vt' | 'vd';
    kofschip?: boolean;
  };
}

export interface ExerciseItem {
  id: string;
  opdracht: string;
  woord: string;
  categorie: number;
  type: 'invul' | 'keuze' | 'regel' | 'klankgroep' | 'werkwoord' | 'sorteer' | 'hussel' | 'vertaal' | 'grammatica' | 'redacteur' | 'onderstreep' | 'spiegel' | 'gaten' | 'splits' | 'discriminatie' | 'langermaak';
  choices?: string[];
  metadata?: {
      husselWoord?: string;      
      difficultyPart?: string;   
      prefix?: string;           
      suffix?: string;           
      lettergrepen?: string;     
      enkelvoudMeervoud?: string;
      woordsoort?: string;       
      foutWoord?: string;
      choices?: string[];
      infinitief?: string;
      tijd?: string;
      klankgroepType?: string;
  }; 
}

export interface WorksheetExercises {
  // Stap 1: Visueel / Sorteren
  sorteer_oefening?: {
      categorieen: number[];
      woorden: ExerciseItem[];
  };
  
  // Stap 2: Analyse (Verschilt per groep)
  stap2_oefening: ExerciseItem[]; 

  // Stap 3: Transfer (Verschilt per groep)
  stap3_oefening: ExerciseItem[];

  // Legacy fields (voor backwards compatibility tijdens migratie)
  invulzinnen?: ExerciseItem[];
  kies_juiste_spelling?: ExerciseItem[]; 
  gaten_oefening?: ExerciseItem[]; 
  klankgroepen_tabel?: ExerciseItem[]; 
  verander_oefening?: ExerciseItem[]; 
  grammatica_oefening?: ExerciseItem[]; 
  redacteur_oefening?: ExerciseItem[]; 
  transformatie?: ExerciseItem[]; 
  context?: ExerciseItem[];
  regelvragen?: ExerciseItem[]; 
  speciale_oefeningen?: ExerciseItem[]; 
}

export interface WorksheetData {
  id: string;
  created_at: string;
  title: string;
  group: string;
  categories: number[];
  woordenlijst: WordItem[];
  oefeningen?: WorksheetExercises; 
  dicteeZinnen?: string[]; 
}

export interface UserAnswers {
  [questionId: string]: any; 
}

export const COLORS = {
  blue: '#2073af',
  green: '#a8c641',
  orange: '#f19127',
  purple: '#7c3aed',
  slate: '#475569',
  red: '#ef4444'
};
