
import React from 'react';

interface DidacticStyledWordProps {
    word: string;
    catId: number;
    metadata?: any;
}

/**
 * Helper component om woorden visueel weer te geven volgens de Staal methodiek.
 * Past cirkels en onderstrepingen toe op specifieke letters.
 */
const DidacticStyledWord: React.FC<DidacticStyledWordProps> = ({ word, catId, metadata }) => {
    if (!word) return null;

    // STIJLEN

    // Cirkel: Absoluut gepositioneerd over de tekst heen, iets groter dan de tekst zelf.
    // min-w zorgt dat een dunne letter als 'i' of 'u' toch een mooi rondje krijgt.
    const styleCircle = (text: string) => (
        <span className="inline-block relative mx-0.5 z-10">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                             min-w-[1.4em] w-[130%] h-[130%] 
                             border-2 border-slate-800 rounded-[50%] 
                             pointer-events-none transform -rotate-2">
            </span>
            <span className="relative z-20">{text}</span>
        </span>
    );

    // Onderstreping: Dikke lijn, iets ruimte tussen letters
    const styleUnderline = (text: string) => (
        <span className="border-b-2 border-slate-800 inline-block pb-0.5 mx-[1px] leading-tight">{text}</span>
    );

    // Splitsen: Streepjes tussen letters (voor hakwoorden)
    const styleSplit = (text: string) => (
        <span className="tracking-widest">{text.split('').join('-')}</span>
    );

    // HELPER: Regex Replacer
    // Zoekt patronen en past de styleFunctie toe op de match
    const renderWithRegex = (regex: RegExp, styleFn: (t: string) => React.ReactNode) => {
        const globalRegex = new RegExp(regex, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
        
        let lastIndex = 0;
        const nodes: React.ReactNode[] = [];
        let match;
        
        while ((match = globalRegex.exec(word)) !== null) {
            // Tekst voor de match
            if (match.index > lastIndex) {
                nodes.push(word.substring(lastIndex, match.index));
            }
            // De match zelf (gestyled)
            nodes.push(styleFn(match[0]));
            lastIndex = match.index + match[0].length;
        }
        // Tekst na de laatste match
        if (lastIndex < word.length) {
            nodes.push(word.substring(lastIndex));
        }

        return <span className="font-handwriting text-slate-700 text-lg whitespace-nowrap">{nodes.map((n, i) => <React.Fragment key={i}>{n}</React.Fragment>)}</span>;
    };


    // LOGICA PER CATEGORIE
    switch (catId) {
        case 1: // Hakwoord: m-e-l-k (letters splitsen)
            return <span className="font-handwriting text-slate-700 text-lg">{styleSplit(word)}</span>;
            
        case 2: // Zingwoord: Cirkel om 'ng' of 'nk'
            return renderWithRegex(/(ng|nk)/, styleCircle);

        case 3: // Luchtwoord: Onderstreep 'cht' of 'ch'
            return renderWithRegex(/(cht|ch)/, styleUnderline);

        case 4: // Plankwoord: Onderstreep 'nk' (geen g)
            return renderWithRegex(/(nk)/, styleUnderline);

        case 5: // Eer-oor-eur: Onderstreep eer/oor/eur
            return renderWithRegex(/(eer|oor|eur)/, styleUnderline);

        case 6: // Aai-ooi-oei: Cirkel de 'i' op het eind
            return renderWithRegex(/i$/, styleCircle);

        case 7: // Eeuw-ieuw: Cirkel de 'u'
            return renderWithRegex(/u/, styleCircle);

        case 8: // Langermaakwoord: Onderstreep d of t aan het eind
            return renderWithRegex(/(d|t)$/, styleUnderline);

        case 9: // Voorvoegsel: Onderstreep be/ge/ver aan het begin
            return renderWithRegex(/^(be|ge|ver)/, styleUnderline);

        case 10: // Klankgroepen: Geen visuele markup in stap 1 (gewoon het woord)
            return <span className="font-handwriting text-slate-700 text-lg">{word}</span>;

        case 11: // Verkleinwoord: Onderstreep grondwoord
            const suffixMatch = word.match(/(pje|tje|je)$/);
            if (suffixMatch) {
                const groundWord = word.substring(0, suffixMatch.index);
                const suffix = suffixMatch[0];
                return (
                    <span className="font-handwriting text-slate-700 text-lg">
                        {styleUnderline(groundWord)}{suffix}
                    </span>
                );
            }
            return <span className="font-handwriting text-slate-700 text-lg">{word}</span>;

        case 12: // Achtervoegsel: Onderstreep ig of lijk aan het eind
            return renderWithRegex(/(ig|lijk)$/, styleUnderline);

        case 13: // Kilowoord: Cirkel de i (die klinkt als ie)
            // Logic: Alleen i's die NIET in 'ie' combinatie staan.
            return renderWithRegex(/i(?!e)/, styleCircle);

        case 14: // Komma-s: Cirkel 's
            return renderWithRegex(/'s/, styleCircle);

        case 15: // Centwoord: Onderstreep c
            return renderWithRegex(/c/, styleUnderline);

        case 16: // Komma-s diverse: Cirkel 's
            return renderWithRegex(/'s/, styleCircle);

        case 17: // Politiewoord: Cirkel tie
            return renderWithRegex(/tie$/, styleCircle);

        case 18: // Colawoord: Onderstreep c
            return renderWithRegex(/c/, styleUnderline);

        case 19: // Tropisch: Onderstreep isch
            return renderWithRegex(/isch$/, styleUnderline);

        case 20: // Taxiwoord: Cirkel x
            return renderWithRegex(/x/, styleCircle);

        case 21: // Chefwoord: Onderstreep ch (die klinkt als sj)
            return renderWithRegex(/ch/, styleUnderline);

        case 22: // Theewoord: Cirkel th
            return renderWithRegex(/th/, styleCircle);
            
        case 23: // Caféwoord: Cirkel é
            return renderWithRegex(/é/, styleCircle);

        case 24: // Cadeauwoord: Onderstreep eau
            return renderWithRegex(/eau/, styleUnderline);

        case 25: // Routewoord: Onderstreep ou
            return renderWithRegex(/ou/, styleUnderline);

        case 26: // Garagewoord: Cirkel g (die klinkt als zj)
            // Heuristiek: 
            // 1. g aan het begin gevolgd door i, y of e (giraf, genie, gynaecoloog)
            // 2. g gevolgd door e aan het einde (garage, etage)
            // 3. Negeert 'g' in andere posities (de eerste g in garage)
            return renderWithRegex(/(^g(?=[iyeé])|g(?=e$))/, styleCircle);

        case 27: // Lollywoord: Cirkel y
            return renderWithRegex(/y/, styleCircle);

        case 28: // Tremawoord: Cirkel de trema-letter (ä, ë, ï, ö, ü)
            return renderWithRegex(/[äëïöü]/, styleCircle);

        case 29: // Militair: Onderstreep air
            return renderWithRegex(/air$/, styleUnderline);

        case 30: // Koppelteken: Cirkel het streepje
            return renderWithRegex(/-/, styleCircle);

        case 31: // Trottoir: Onderstreep oir
            return renderWithRegex(/oir/, styleUnderline);
            
        case 32: // Tussen-n: Onderstreep n in -en- 
            return renderWithRegex(/n(?=[a-z])/, styleUnderline); 

        case 33: // Apostrof: Cirkel 's
            return renderWithRegex(/'s/, styleCircle);

        case 34: // Latijns voorvoegsel: Onderstreep prefix
             return renderWithRegex(/^(ad|ab|ob|sub)/, styleUnderline);

        case 35: // Samenstelling
            return <span className="font-handwriting text-slate-700 text-lg">{word}</span>;

        case 36: // Ei-plaat: Onderstreep ei
            return renderWithRegex(/ei/, styleUnderline);

        case 37: // Au-plaat: Onderstreep au
            return renderWithRegex(/au/, styleUnderline);

        default:
            return <span className="font-handwriting text-slate-700 text-lg">{word}</span>;
    }
};

export default DidacticStyledWord;
