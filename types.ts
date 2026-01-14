
export type ViewState = 'dashboard' | 'create' | 'library' | 'player' | 'admin' | 'dictee' | 'rules' | 'info' | 'tester';
export type GradeLevel = '4' | '5' | '6' | '7' | '8' | '7/8';

export interface SpellingRule {
  id: number;
  naam: string;
  regel: string;
  actie?: string;    
  uitgebreide_uitleg?: string; 
  versje?: string; 
  voorbeeld: string; 
  fout: string;      
}

export interface GrammarRule {
  term: string;
  uitleg: string;
  categorie: 'woordsoort' | 'zinsdeel' | 'leesteken';
}

export interface CategoriesMap {
  [key: number]: string;
}

export interface GroupCategoriesMap {
  [key: string]: number[];
}

export interface WordItem {
  woord: string;
  categorie: number;
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
  type: 'invul' | 'keuze' | 'regel' | 'klankgroep' | 'werkwoord' | 'sorteer' | 'hussel' | 'vertaal' | 'grammatica' | 'redacteur' | 'onderstreep' | 'spiegel' | 'gaten';
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
  }; 
}

export interface WorksheetExercises {
  invulzinnen: ExerciseItem[];
  kies_juiste_spelling: ExerciseItem[]; 
  sorteer_oefening?: {
      categorieen: number[];
      woorden: ExerciseItem[];
  };
  gaten_oefening?: ExerciseItem[]; 
  klankgroepen_tabel?: ExerciseItem[]; 
  verander_oefening?: ExerciseItem[]; 
  grammatica_oefening?: ExerciseItem[]; 
  redacteur_oefening?: ExerciseItem[]; 
  transformatie?: ExerciseItem[]; 
  context?: ExerciseItem[];
  regelvragen: ExerciseItem[]; 
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
