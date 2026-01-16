
import { WordItem } from '../types';

// Step 2 Imports (Analysis) - Consistent Naming
import { getGroup4Step2Logic } from './strategies/group4Step2Strategy';
import { getGroup5Step2Logic } from './strategies/group5Step2Strategy';
import { getGroup6Step2Logic } from './strategies/group6Step2Strategy';
import { getGroup78Step2Logic } from './strategies/group78Step2Strategy';

// Step 3 Imports (Transfer)
import { getGroup4Step3Logic } from './strategies/group4Step3Strategy';
import { getGroup5Step3Logic } from './strategies/group5Step3Strategy';
import { getGroup6Step3Logic } from './strategies/group6Step3Strategy';
import { getGroup78Step3Logic } from './strategies/group78Step3Strategy';

/**
 * CENTRAL STRATEGY ROUTER
 * Dit bestand bepaalt welke sub-strategie gebruikt wordt.
 * De daadwerkelijke logica staat in aparte files in /strategies/.
 */

interface StrategyResult {
    systemPrompt: string;
    taskPrompt: string;
    outputType: 'gaten' | 'klankgroep' | 'grammatica' | 'invul' | 'redacteur' | 'sorteer' | 'keuze' | 'spiegel';
}

// --- STAP 2 ROUTER (ANALYSE) ---

export const getStep2Strategy = (group: string, words: WordItem[]): StrategyResult => {
    const isLower = group === '4';
    const isMiddle5 = group === '5';
    const isMiddle6 = group === '6';
    const isUpper = group === '7' || group === '8' || group === '7/8';

    // GROEP 4: Gaten & Herkenning
    if (isLower) {
        const logic = getGroup4Step2Logic(words);
        return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }

    // GROEP 5: Klankgroepen Schema
    if (isMiddle5) {
        const logic = getGroup5Step2Logic(words);
        return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }

    // GROEP 6: Leenwoorden & Specifieke Regels
    if (isMiddle6) {
         const logic = getGroup6Step2Logic(words); 
         return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }

    // GROEP 7/8: Grammatica & Werkwoorden
    if (isUpper) {
        const logic = getGroup78Step2Logic(words);
        return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }

    // Fallback
    return {
        outputType: 'gaten',
        systemPrompt: "Generiek",
        taskPrompt: "Maak een gatenoefening."
    };
};

// --- STAP 3 ROUTER (TRANSFER) ---

export const getStep3Strategy = (group: string, words: WordItem[]): StrategyResult => {
    const isLower = group === '4';
    const isMiddle5 = group === '5';
    const isMiddle6 = group === '6';
    const isUpper = group === '7' || group === '8' || group === '7/8';

    // GROEP 4
    if (isLower) {
        const logic = getGroup4Step3Logic(words);
        return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }

    // GROEP 5
    if (isMiddle5) {
        const logic = getGroup5Step3Logic(words);
        return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }
    
    // GROEP 6
    if (isMiddle6) {
        const logic = getGroup6Step3Logic(words);
        return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }

    // GROEP 7/8
    if (isUpper) {
        const logic = getGroup78Step3Logic(words);
        return {
            outputType: logic.outputType as any,
            systemPrompt: logic.systemPrompt,
            taskPrompt: logic.taskPrompt
        };
    }

    return {
        outputType: 'invul',
        systemPrompt: "Generiek",
        taskPrompt: "Maak invulzinnen."
    };
};
