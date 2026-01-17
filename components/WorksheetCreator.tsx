
import React, { useState, useEffect, useRef } from 'react';
import { GROUP_CATEGORIES, CATEGORIES } from '../constants';
import { WorksheetData, WordItem } from '../types';
import { generateMixedWordList, generateExercises } from '../services/geminiService';

interface WorksheetCreatorProps {
    onWorksheetCreated: (data: WorksheetData, mode: 'fill' | 'print') => void; 
    onStartDictation: (data: WorksheetData) => void;
}

type WizardStep = 'group' | 'categories' | 'processing' | 'actions';

const WorksheetCreator: React.FC<WorksheetCreatorProps> = ({ onWorksheetCreated, onStartDictation }) => {
    // State for the Wizard Flow
    const [step, setStep] = useState<WizardStep>('group');
    const [group, setGroup] = useState<string>('4');
    const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
    
    // Data State
    const [generatedData, setGeneratedData] = useState<WorksheetData | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // UI States
    const [cooldown, setCooldown] = useState<number>(0);
    const [isDailyLimit, setIsDailyLimit] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // Handlers
    const toggleCategory = (id: number) => {
        if (selectedCatIds.includes(id)) {
            setSelectedCatIds(prev => prev.filter(c => c !== id));
        } else {
            if (selectedCatIds.length >= 3) {
                // Shake effect or toast could go here
                return;
            }
            setSelectedCatIds(prev => [...prev, id]);
        }
    };

    const handleGenerate = async () => {
        if (selectedCatIds.length === 0) {
            setError("Kies minimaal 1 categorie.");
            return;
        }

        setStep('processing');
        setLogs(["Systeem initialiseren...", `Configuratie: Groep ${group}`, "Verbinding maken met AI..."]);
        setError(null);

        try {
            const logUpdate = (msg: string) => setLogs(prev => [...prev, msg]);

            // 1. Generate Words
            const words = await generateMixedWordList(selectedCatIds, group, logUpdate);
            
            if (words.length === 0) throw new Error("Geen woorden gegenereerd.");

            // 2. Generate Exercises immediately to have a complete object
            logUpdate("🎨 Oefeningen genereren en layout voorbereiden...");
            const exercises = await generateExercises(words, group);

            // 3. Create Data Object
            const newData: WorksheetData = {
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                title: `Oefening Groep ${group}`,
                group,
                categories: selectedCatIds,
                woordenlijst: words,
                oefeningen: exercises
            };

            setGeneratedData(newData);
            logUpdate("✅ Klaar! Oefening opgeslagen in geheugen.");
            
            // Short delay to let user see "Success"
            setTimeout(() => {
                setStep('actions');
            }, 1000);

        } catch (e: any) {
             if (e.message === 'QUOTA_DAILY') {
                setIsDailyLimit(true);
                setLogs(p => [...p, "❌ FOUT: Daglimiet bereikt."]);
            } else if (e.message === 'QUOTA_LIMIT') {
                setCooldown(60);
                setLogs(p => [...p, "❌ FOUT: Snelheidslimiet. Wacht 60s."]);
                // Go back to categories after a bit? Or stay to show error
            } else {
                setLogs(p => [...p, `❌ CRITICAL: ${e.message}`]);
            }
        }
    };

    // --- RENDER STEPS ---

    const renderHeader = (title: string, subtitle: string, backAction?: () => void) => (
        <div className="mb-6">
            {backAction && (
                <button onClick={backAction} className="text-slate-400 text-sm font-bold mb-2 flex items-center hover:text-slate-600">
                    <i className="fas fa-arrow-left mr-2"></i> Terug
                </button>
            )}
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">{title}</h2>
            <p className="text-slate-500">{subtitle}</p>
        </div>
    );

    // STEP 1: GROUP SELECTION
    if (step === 'group') {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in">
                {renderHeader("Start Nieuwe Oefening", "Voor welke groep is dit werkblad?")}
                
                <div className="grid grid-cols-2 gap-4">
                    {['4', '5', '6', '7/8'].map(g => {
                         const val = g === '7/8' ? '7' : g;
                         return (
                            <button
                                key={g}
                                onClick={() => { setGroup(val); setStep('categories'); setSelectedCatIds([]); }}
                                className="group relative bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-lg transition-all text-left overflow-hidden h-32 md:h-40 flex flex-col justify-end"
                            >
                                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {g}
                                </div>
                                <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Groep</span>
                                <span className="text-3xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{g}</span>
                            </button>
                         );
                    })}
                </div>
            </div>
        );
    }

    // STEP 2: CATEGORY SELECTION
    if (step === 'categories') {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-[calc(100vh-100px)] md:h-auto">
                {renderHeader(
                    `Groep ${group}: Categorieën`, 
                    `Selecteer maximaal 3 regels (${selectedCatIds.length}/3)`, 
                    () => setStep('group')
                )}

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 mb-20 md:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(GROUP_CATEGORIES[group] || []).map(catId => {
                            const isSelected = selectedCatIds.includes(catId);
                            const isDisabled = !isSelected && selectedCatIds.length >= 3;
                            
                            return (
                                <button
                                    key={catId}
                                    onClick={() => toggleCategory(catId)}
                                    disabled={isDisabled}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all 
                                        ${isSelected 
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                            : isDisabled 
                                                ? 'border-slate-100 opacity-50 cursor-not-allowed bg-slate-50'
                                                : 'border-slate-200 bg-white hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
                                            ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {catId}
                                        </div>
                                        <div className="font-bold text-slate-700 leading-tight">
                                            {CATEGORIES[catId]}
                                        </div>
                                    </div>
                                    {isSelected && <div className="absolute top-3 right-3 text-blue-600"><i className="fas fa-check-circle"></i></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Bottom Action Bar for Mobile/Desktop */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:static md:bg-transparent md:border-0 md:p-0 z-10">
                    <div className="max-w-4xl mx-auto">
                        {error && <div className="mb-2 text-red-500 text-sm text-center font-bold">{error}</div>}
                        <button
                            onClick={handleGenerate}
                            disabled={selectedCatIds.length === 0 || cooldown > 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                                ${selectedCatIds.length === 0 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-500 hover:-translate-y-1'
                                }`}
                        >
                            {selectedCatIds.length === 0 ? 'Kies eerst een regel' : `Start Woorden Lab (${selectedCatIds.length})`}
                            {selectedCatIds.length > 0 && <i className="fas fa-flask"></i>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 3: PROCESSING (CHAT SCREEN)
    if (step === 'processing') {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in h-[80vh] flex flex-col">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl animate-pulse">
                        <i className="fas fa-robot text-3xl text-green-400"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Het Lab is bezig...</h3>
                    <p className="text-slate-500">De AI stelt nu een unieke oefening samen.</p>
                </div>

                <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-4 font-mono text-sm overflow-hidden flex flex-col shadow-inner relative">
                    {/* Fake Window Controls */}
                    <div className="flex gap-2 mb-4 border-b border-slate-700 pb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-slate-500 ml-2 text-xs">staalmaatje-core — ai-process</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {logs.map((log, i) => {
                             let color = "text-slate-300";
                             if (log.includes("Fase")) color = "text-blue-400 font-bold";
                             if (log.includes("✅")) color = "text-green-400";
                             if (log.includes("❌")) color = "text-red-400";
                             
                             return (
                                 <div key={i} className={`${color} animate-fade-in-up`}>
                                     <span className="opacity-40 mr-2">$</span>
                                     {log}
                                 </div>
                             );
                        })}
                        {isDailyLimit && <div className="text-red-500 font-bold mt-2">PROCESS TERMINATED: QUOTA EXCEEDED.</div>}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        );
    }

    // STEP 4: ACTIONS (RESULT)
    if (step === 'actions' && generatedData) {
        return (
            <div className="max-w-3xl mx-auto animate-fade-in text-center pt-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
                    <i className="fas fa-check text-5xl text-green-600"></i>
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Missie Geslaagd!</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    We hebben <strong>{generatedData.woordenlijst.length} woorden</strong> en zinnen gegenereerd voor <strong>Groep {generatedData.group}</strong>. 
                    <br/>Wat wil je nu doen?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* DICTEE ACTION */}
                    <button 
                        onClick={() => onStartDictation(generatedData)}
                        className="group bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-xl transition-all flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">
                            <i className="fas fa-microphone-alt"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">Dictee Starten</h3>
                        <p className="text-sm text-slate-500">Interactief dictee of printen voor de leerkracht.</p>
                    </button>

                    {/* WORKSHEET ACTION */}
                    <button 
                        onClick={() => onWorksheetCreated(generatedData, 'print')}
                        className="group bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-green-500 hover:shadow-xl transition-all flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">
                            <i className="fas fa-print"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">Werkblad Maken</h3>
                        <p className="text-sm text-slate-500">Printklaar PDF werkblad met 3 didactische stappen.</p>
                    </button>
                </div>

                <div className="mt-12">
                     <button 
                        onClick={() => { setStep('group'); setGeneratedData(null); }}
                        className="text-slate-400 font-bold text-sm hover:text-slate-600 underline"
                     >
                        Begin helemaal opnieuw
                     </button>
                </div>
            </div>
        );
    }

    return null;
};

export default WorksheetCreator;
