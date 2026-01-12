import { WordItem } from '../types';

// We use the dwyl/dutch-words list which aggregates OpenTaal and other open sources into a clean txt file.
const WORDLIST_URL = 'https://raw.githubusercontent.com/dwyl/dutch-words/master/words.txt';

let localDictionary: Set<string> | null = null;
let isLoadingDictionary = false;

// Initialize dictionary
const loadDictionary = async () => {
    if (localDictionary || isLoadingDictionary) return;
    
    isLoadingDictionary = true;
    try {
        console.log("Fetching dictionary...");
        const response = await fetch(WORDLIST_URL);
        const text = await response.text();
        // Split by newline and create a Set for O(1) lookup speed
        localDictionary = new Set(text.split('\n').map(w => w.trim().toLowerCase()));
        console.log(`Dictionary loaded with ${localDictionary.size} words.`);
    } catch (error) {
        console.error("Failed to load local dictionary:", error);
        localDictionary = new Set();
    } finally {
        isLoadingDictionary = false;
    }
};

// Start loading immediately
loadDictionary();

export const ensureDictionaryLoaded = async () => {
    if (!localDictionary && !isLoadingDictionary) {
        await loadDictionary();
    }
    while (isLoadingDictionary) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return true;
};

export const isInDictionary = (word: string): boolean => {
    if (!localDictionary) return false;
    // Remove punctuation from start/end for cleaner lookup (e.g. "word." -> "word")
    const clean = word.trim().toLowerCase().replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()]+|[.,\/#!$%\^&\*;:{}=\-_`~()]+$/g, "");
    return localDictionary.has(clean);
};

export const validateWords = async (wordList: WordItem[]): Promise<WordItem[]> => {
    await ensureDictionaryLoaded();
    const unknownWords: WordItem[] = [];

    wordList.forEach(item => {
        if (!isInDictionary(item.woord)) {
            unknownWords.push(item);
        }
    });

    // We simply return the unknown words without asking AI again.
    // Saving quota is more important than a double-check on obscure words.
    return unknownWords;
};