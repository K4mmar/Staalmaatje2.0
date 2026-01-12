export type ViewState = 'dashboard' | 'create' | 'library' | 'player' | 'admin' | 'dictee' | 'rules' | 'info';
export type GradeLevel = '4' | '5' | '6' | '7' | '8' | '7/8';

export interface SpellingRule {
  id: number;
  naam: string;
  regel: string;
  uitgebreide_uitleg?: string; // Uit de PDF
  versje?: string; // Bijv. Sippe Simon
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
  // Didactische metadata (optioneel, afhankelijk van groep)
  lettergrepen?: string; // "bo-men"
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
  type: 'invul' | 'keuze' | 'regel' | 'klankgroep' | 'werkwoord' | 'sorteer';
  choices?: string[];
  metadata?: any; // Flexibele data voor specifieke oefeningen
}

export interface WorksheetExercises {
  invulzinnen: ExerciseItem[];
  kies_juiste_spelling: ExerciseItem[];
  regelvragen: ExerciseItem[];
  speciale_oefeningen?: ExerciseItem[]; // Voor Groep 5 machine / Groep 7 werkwoorden
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
  [questionId: string]: any; // Changed to any to support objects for complex answers
}

export const COLORS = {
  blue: '#2073af',
  green: '#a8c641',
  orange: '#f19127',
  purple: '#7c3aed',
  slate: '#475569',
  red: '#ef4444'
};