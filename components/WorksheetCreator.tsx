
import React, { useState, useEffect } from 'react';
import { GROUP_CATEGORIES, CATEGORIES } from '../constants';
import { COLORS, WorksheetData, WordItem } from '../types';
import { generateMixedWordList, generateExercises, generateDictationSentences } from '../services/geminiService';

interface WorksheetCreatorProps {
    onWorksheetCreated: (data: WorksheetData, mode: 'fill' | 'print') => void; // Aangepast
    onStartDictation: (data: WorksheetData) => void;
}

const WorksheetCreator: React.FC<WorksheetCreatorProps> = ({ onWorksheetCreated, onStartDictation }) => {
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [group, setGroup] = useState<string>('4');
    const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
    const [generatedWords, setGeneratedWords] = useState<WordItem[]>([]);
    
    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState<number>(0);
    const [isDailyLimit, setIsDailyLimit] = useState(false);

    // Cooldown Timer Effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleQuotaError = (isDaily: boolean = false) => {
        if (isDaily) {
            setIsDailyLimit(true);
            setError("DAGLIMIET BEREIKT. Je hebt het maximum aantal verzoeken voor vandaag verbruikt (1500). De teller reset morgenochtend (ca. 09:00).");
        } else {
            setCooldown(60); // 60 seconds wait
            setError("Snelheidslimiet bereikt. Wacht even tot de teller op 0 staat.");
        }
    };

    const toggleCategory = (id: number) => {
        if (selectedCatIds.includes(id)) {
            setSelectedCatIds(prev => prev.filter(c => c !== id));
        } else {
            if (selectedCatIds.length >= 3) {
                alert("Kies maximaal 3 categorieën.");
                return;
            }
            setSelectedCatIds(prev => [...prev, id]);
        }
    };

    const handleGenerateWords = async () => {
        if (cooldown > 0 || isDailyLimit) return;
        if (selectedCatIds.length === 0) {
            setError("Selecteer ten minste één categorie.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setStatusText("De AI zoekt didactisch verantwoorde woorden en valideert deze...");

        try {
            const words = await generateMixedWordList(selectedCatIds, group);
            if (words.length === 0) throw new Error("Geen woorden gevonden");
            setGeneratedWords(words);
            setStage(1);
        } catch (e: any) {
            if (e.message === 'QUOTA_DAILY') {
                handleQuotaError(true);
            } else if (e.message === 'QUOTA_LIMIT') {
                handleQuotaError(false);
            } else {
                setError(e.message || "Kon geen woorden genereren. Probeer het opnieuw.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOutput = async (type: 'dictee' | 'werkblad' | 'online') => {
        if (cooldown > 0 || isDailyLimit) return;
        setIsLoading(true);
        setError(null);
        
        const baseData: WorksheetData = {
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            title: type === 'dictee' ? `Dictee Groep ${group}` : type === 'online' ? `Online Oefening Groep ${group}` : `Werkblad Groep ${group}`,
            group,
            categories: selectedCatIds,
            woordenlijst: generatedWords,
        };

        try {
            if (type === 'dictee') {
                // For Dictation, we skip generating sentences here.
                // We hand off to the DictationCard module which lets the user generate them interactively.
                onStartDictation(baseData);
            } else {
                setStatusText("Oefeningen genereren...");
                const exercises = await generateExercises(generatedWords, group);
                baseData.oefeningen = exercises;
                // STUUR MODUS MEE: 'print' als werkblad, anders 'fill' (online)
                onWorksheetCreated(baseData, type === 'werkblad' ? 'print' : 'fill');
            }
            
        } catch (e: any) {
            if (e.message === 'QUOTA_DAILY') {
                handleQuotaError(true);
            } else if (e.message === 'QUOTA_LIMIT') {
                handleQuotaError(false);
            } else {
                setError("Fout bij het genereren van de output. Probeer het later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="mb-6">
                    <i className="fas fa-spinner fa-spin text-5xl text-blue-500"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Even geduld...</h3>
                <p className="text-slate-500">{statusText}</p>
            </div>
        );
    }

    // Cooldown Overlay with Daily limit info
    const CooldownNotice = () => {
        if (isDailyLimit) {
            return (
                <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 flex items-start gap-3 mb-6">
                    <i className="fas fa-ban text-xl mt-1"></i>
                    <div>
                        <span className="font-bold block">Daglimiet Bereikt</span> 
                        <span className="text-sm">Je hebt vandaag te veel verzoeken gedaan (1500). De limiet reset morgenochtend rond 09:00 uur.</span>
                    </div>
                </div>
            );
        }

        if (cooldown > 0) {
            return (
                <div className="bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-200 flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-3 animate-pulse">
                        <i className="fas fa-clock text-xl"></i>
                        <div>
                            <span className="font-bold">Even wachten...</span> 
                            <span className="ml-1">De AI moet afkoelen. Je kunt weer genereren over: <span className="font-mono font-bold text-lg">{cooldown}s</span></span>
                        </div>
                    </div>
                    <p className="text-xs text-orange-700/70 ml-8">
                        * Als het na het wachten nog niet lukt, heb je mogelijk je daglimiet bereikt.
                    </p>
                </div>
            );
        }
        return null;
    };

    if (stage === 1) {
        return (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-green-50 p-6 border-b border-green-100 flex justify-between items-center">
                    <div>
                         <h2 className="text-2xl font-bold text-green-800">
                            <i className="fas fa-clipboard-check mr-2"></i>
                            Woordenlijst Klaar
                        </h2>
                        <p className="text-green-700 text-sm mt-1">Deze woorden zijn didactisch gevalideerd voor groep {group}.</p>
                    </div>
                    <button onClick={() => setStage(0)} className="text-green-700 text-sm bg-white/50 px-3 py-1 rounded hover:bg-white transition-colors">
                        <i className="fas fa-redo mr-1"></i> Opnieuw
                    </button>
                </div>

                <div className="p-8">
                    <CooldownNotice />
                    {error && !cooldown && !isDailyLimit && <p className="mb-4 text-red-500 font-medium bg-red-50 p-3 rounded-lg">{error}</p>}

                    {/* Word List Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Gegenereerde Woorden ({generatedWords.length})</h3>
                             <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                 <i className="fas fa-shield-alt mr-1"></i> OpenTaal Validated
                             </span>
                        </div>
                       
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {generatedWords.map((w, i) => (
                                <div key={i} className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:border-green-300 hover:shadow-md">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mr-2 flex-shrink-0">
                                         {w.categorie}
                                    </div>
                                    <span className="text-slate-700 font-bold text-sm truncate">
                                        {w.woord}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="border-t border-slate-100 pt-8 mt-8 bg-slate-50 -mx-8 -mb-8 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Wat wil je doen met deze woorden?</h3>
                        <p className="text-center text-slate-500 text-sm mb-6">Kies een werkvorm om direct aan de slag te gaan.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                            {['dictee', 'werkblad', 'online'].map((t) => (
                                <button 
                                    key={t}
                                    onClick={() => handleCreateOutput(t as any)} 
                                    disabled={cooldown > 0 || isDailyLimit}
                                    className={`group relative p-6 rounded-xl border-2 transition-all text-left bg-white shadow-sm overflow-hidden ${
                                        (cooldown > 0 || isDailyLimit) ? 'border-slate-100 opacity-50 cursor-not-allowed' : 
                                        'border-slate-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1'
                                    }`}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-slate-50 rounded-bl-full -mr-8 -mt-8 transition-colors group-hover:to-blue-50"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <i className={`fas ${t === 'dictee' ? 'fa-microphone-alt' : t === 'werkblad' ? 'fa-print' : 'fa-laptop'} text-xl`}></i>
                                        </div>
                                        <h4 className="font-bold text-slate-800 mb-1 capitalize text-lg">{t === 'online' ? 'Online Oefenen' : t === 'dictee' ? 'Dicteekaart' : 'Print Werkblad'}</h4>
                                        <p className="text-xs text-slate-500">
                                            {t === 'dictee' && "Inclusief voorlees-zinnen"}
                                            {t === 'werkblad' && "Printklaar PDF formaat"}
                                            {t === 'online' && "Interactief invullen & nakijken"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Het Woorden Laboratorium</h2>
                <p className="text-slate-500">Stap 1: Stel je mix samen en genereer de basislijst.</p>
            </div>

            <div className="p-8 space-y-8">
                <CooldownNotice />
                
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mr-3 text-sm">1</span>
                        Kies de groep
                    </h3>
                    <div className="flex gap-3">
                        {['4', '5', '6', '7/8'].map(g => {
                             const val = g === '7/8' ? '7' : g;
                             const isActive = group === val;
                             return (
                                 <button
                                     key={g}
                                     onClick={() => { setGroup(val); setSelectedCatIds([]); }}
                                     className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-blue-200 text-slate-600'}`}
                                 >
                                     Groep {g}
                                 </button>
                             );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mr-3 text-sm">2</span>
                        Selecteer categorieën (max 3)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(GROUP_CATEGORIES[group] || []).map(catId => (
                            <label 
                                key={catId} 
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedCatIds.includes(catId) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                            >
                                <input 
                                    type="checkbox"
                                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    checked={selectedCatIds.includes(catId)}
                                    onChange={() => toggleCategory(catId)}
                                />
                                <span className="ml-3 text-sm font-medium text-slate-700">
                                    <span className="font-bold text-blue-600 mr-1">{catId}.</span>
                                    {CATEGORIES[catId]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <button 
                        onClick={handleGenerateWords}
                        disabled={isLoading || cooldown > 0 || isDailyLimit}
                        className={`w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${ (cooldown > 0 || isDailyLimit) ? 'bg-slate-400 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1'}`}
                        style={{backgroundColor: (cooldown > 0 || isDailyLimit) ? undefined : COLORS.orange}}
                    >
                        {isLoading ? (
                            <><i className="fas fa-spinner fa-spin"></i> Bezig...</>
                        ) : cooldown > 0 ? (
                            <><i className="fas fa-hourglass-half"></i> Wacht {cooldown}s</>
                        ) : isDailyLimit ? (
                             <><i className="fas fa-ban"></i> Limiet Bereikt</>
                        ) : (
                            <><i className="fas fa-flask"></i> Genereer Woordenlijst</>
                        )}
                    </button>
                    {error && !cooldown && !isDailyLimit && <p className="mt-4 text-red-500 font-medium bg-red-50 p-3 rounded-lg">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default WorksheetCreator;
