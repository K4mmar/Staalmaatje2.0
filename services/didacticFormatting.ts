
import { WordItem } from '../types';

/**
 * Splitst een woord in letters (Groep 3/4 niveau).
 * m-e-l-k
 */
const splitLetters = (word: string): string => {
    return word.split('').join('-');
};

/**
 * Formatteert een woord didactisch op basis van categorie en metadata.
 * Dit wordt gebruikt voor plain-text weergave waar geen React componenten mogelijk zijn.
 */
export const formatDidacticWord = (word: string, catId: number, metadata?: Partial<WordItem>): string => {
    if (!word) return "";
    const w = word.toLowerCase();

    // CATEGORIE 1 (Hakwoord):
    // Visueel voorbeeld is letter-voor-letter met streepjes.
    if (catId === 1) {
        return splitLetters(w);
    }

    return w;
};

/**
 * Geeft de didactische instructie voor Opdracht 1 op basis van de categorie.
 */
export const getStep1InstructionText = (catId: number): string => {
    if (catId === 1) return "Zet streepjes tussen de letters (b-oo-m).";
    if (catId === 10) return "Schrijf het woord netjes op.";
    if (catId === 35) return "Zet een streepje tussen de twee woorden.";
    
    // Default fallback
    return "";
};
