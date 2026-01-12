import React, { useState } from 'react';
import { WorksheetData, UserAnswers, COLORS, ExerciseItem } from '../types';
import { generateStory, generateExercises } from '../services/geminiService';
import { CATEGORIES } from '../constants';

interface WorksheetPlayerProps {
    data: WorksheetData;
    onClose: () => void;
}

const WorksheetPlayer: React.FC<WorksheetPlayerProps> = ({ data, onClose }) => {
    // Determine default mode based on grade
    const defaultMode = data.group === '5' ? 'machine' : 'dictee';
    
    const [mode, setMode] = useState<'dictee' | 'machine' | 'fill' | 'check' | 'print'>(data.oefeningen ? 'fill' : 'dictee');
    const [localData, setLocalData] = useState<WorksheetData>(data);
    
    const [answers, setAnswers] = useState<UserAnswers>({});
    const [story, setStory] = useState<string | null>(null);
    const [loadingStory, setLoadingStory] = useState(false);
    const [generatingExercises, setGeneratingExercises] = useState(false);

    // Group 5 Klankgroepen State
    const [machineStep, setMachineStep] = useState<number>(0);

    const handleAnswerChange = (id: string, value: any) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerateStory = async () => {
        setLoadingStory(true);
        try {
            const words = localData.woordenlijst.map(w => w.woord);
            const storyText = await generateStory(words, localData.group);
            setStory(storyText);
        } catch (e) {
            alert("Kon geen verhaal maken.");
        } finally {
            setLoadingStory(false);
        }
    };

    const ensureExercises = async () => {
        if (localData.oefeningen) return;
        setGeneratingExercises(true);
        try {
            const exercises = await generateExercises(localData.woordenlijst, localData.group);
            setLocalData(prev => ({ ...prev, oefeningen: exercises }));
        } catch (e) {
            alert("Kon geen oefeningen laden.");
        } finally {
            setGeneratingExercises(false);
        }
    };

    const switchMode = async (newMode: 'dictee' | 'machine' | 'fill' | 'check' | 'print') => {
        if ((newMode === 'fill' || newMode === 'print' || newMode === 'check' || newMode === 'machine') && !localData.oefeningen) {
            await ensureExercises();
        }
        setMode(newMode);
        if (newMode === 'print') {
            setTimeout(window.print, 500);
        }
    };

    const CheckMark = ({ isCorrect }: { isCorrect: boolean }) => (
        mode === 'check' ? (
            <span className={`ml-2 text-lg ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </span>
        ) : null
    );

    // --- RENDERERS VOOR VERSCHILLENDE OEFENINGEN ---

    // MODULE GROEP 5: KLANKGROEPEN MACHINE
    const renderKlankgroepMachine = (item: ExerciseItem, index: number) => {
        const syllableData = item.metadata?.lettergrepen || "???";
        const parts = syllableData.split('-');
        
        const answer = answers[item.id] || { step: 1, splitsing: [], rule: '' };
        
        return (
            <div key={item.id} className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">{index + 1}</div>
                    <h3 className="text-xl font-bold text-slate-800">De Klankgroepen-Machine</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stap 1: Hakken */}
                    <div className={`p-4 rounded-lg bg-white border-2 ${answer.step >= 1 ? 'border-green-400' : 'border-slate-200'}`}>
                        <h4 className="font-bold text-slate-600 mb-2">Stap 1: Hak het woord</h4>
                        <p className="text-2xl font-bold text-center mb-2">{item.woord}</p>
                        <div className="text-sm text-slate-500 text-center">Hoeveel lettergrepen?</div>
                        <div className="flex justify-center gap-2 mt-2">
                            {[1,2,3,4].map(n => (
                                <button 
                                    key={n}
                                    onClick={() => handleAnswerChange(item.id, { ...answer, syllableCount: n, step: 2 })}
                                    className={`w-8 h-8 rounded border ${answer.syllableCount === n ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stap 2: Laatste Klank */}
                    <div className={`p-4 rounded-lg bg-white border-2 ${answer.step >= 2 ? 'border-blue-400' : 'border-slate-100 opacity-50'}`}>
                        <h4 className="font-bold text-slate-600 mb-2">Stap 2: Laatste klank?</h4>
                        {answer.step >= 2 && (
                             <div className="space-y-2">
                                 <div className="text-center text-lg font-mono bg-yellow-50 p-2 rounded">
                                     {parts[0]} | {parts.slice(1).join('')}
                                 </div>
                                 <p className="text-xs text-center">Kijk naar de laatste letter van de eerste groep.</p>
                                 <div className="grid grid-cols-2 gap-2">
                                     {['Korte Klank', 'Lange Klank', 'Tweeteken', 'Medeklinker'].map(type => (
                                         <button 
                                             key={type}
                                             onClick={() => handleAnswerChange(item.id, { ...answer, rule: type, step: 3 })}
                                             className={`text-xs p-2 rounded border ${answer.rule === type ? 'bg-blue-600 text-white' : 'bg-slate-50 hover:bg-blue-50'}`}
                                         >
                                             {type}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                        )}
                    </div>

                    {/* Stap 3: Schrijf */}
                    <div className={`p-4 rounded-lg bg-white border-2 ${answer.step >= 3 ? 'border-purple-400' : 'border-slate-100 opacity-50'}`}>
                         <h4 className="font-bold text-slate-600 mb-2">Stap 3: Schrijf op</h4>
                         {answer.step >= 3 && (
                             <input 
                                 type="text" 
                                 className="w-full p-2 text-xl font-bold border-b-2 border-slate-300 outline-none focus:border-purple-500 text-center"
                                 placeholder="..."
                                 onChange={(e) => handleAnswerChange(item.id, { ...answer, final: e.target.value })}
                             />
                         )}
                    </div>
                </div>
            </div>
        );
    };

    // MODULE GROEP 7: WERKWOORDEN
    const renderWerkwoordModule = (item: ExerciseItem, index: number) => {
        const answer = answers[item.id] || { stap1: '', stap2: '', stap3: '' };
        
        return (
            <div key={item.id} className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">{index + 1}</div>
                    <h3 className="text-xl font-bold text-slate-800">Werkwoord-Check</h3>
                </div>
                
                <div className="mb-4">
                    <p className="text-lg">Vervoeg het werkwoord: <strong>{item.woord}</strong></p>
                    <p className="text-sm text-slate-500 italic">In de zin: {item.opdracht || '...'}</p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">1</span>
                        <input 
                            placeholder="Wat is de persoonsvorm?" 
                            className="flex-1 p-2 border rounded"
                            value={answer.stap1}
                            onChange={(e) => handleAnswerChange(item.id, {...answer, stap1: e.target.value})}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">2</span>
                        <select 
                            className="flex-1 p-2 border rounded"
                            value={answer.stap2}
                            onChange={(e) => handleAnswerChange(item.id, {...answer, stap2: e.target.value})}
                        >
                            <option value="">Welke tijd?</option>
                            <option value="tt">Tegenwoordige Tijd</option>
                            <option value="vt">Verleden Tijd</option>
                            <option value="vd">Voltooid Deelwoord</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold">3</span>
                        <input 
                            placeholder="Schrijf het woord nu goed op" 
                            className="flex-1 p-2 border-2 border-green-400 rounded font-bold"
                            value={answer.stap3}
                            onChange={(e) => handleAnswerChange(item.id, {...answer, stap3: e.target.value})}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderInteractiveExercise = (item: ExerciseItem, index: number) => {
        const answer = answers[item.id] || '';
        const isCorrect = typeof answer === 'string' && answer.toLowerCase().trim() === item.woord.toLowerCase().trim();

        if (mode === 'print') {
             return (
                 <div key={item.id} className="p-2 border-b border-slate-100 flex gap-4 break-inside-avoid">
                     <span className="font-bold text-slate-400 w-6">{index + 1}.</span>
                     <div className="flex-1">
                         <p className="text-slate-800">{item.opdracht}</p>
                     </div>
                 </div>
             );
        }

        return (
            <div key={item.id} className={`p-4 rounded-lg border mb-4 transition-all ${mode === 'check' ? (isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between mb-2">
                    <span className="font-bold text-slate-400 text-sm">Vraag {index + 1}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">
                        {CATEGORIES[item.categorie]} ({item.categorie})
                    </span>
                </div>
                <p className="text-lg font-medium text-slate-800 mb-3">{item.opdracht}</p>

                {item.type === 'invul' && (
                    <div className="flex items-center">
                        <input 
                            type="text" 
                            value={answer}
                            onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                            disabled={mode === 'check'}
                            className="flex-1 p-2 border rounded border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Typ het woord..."
                        />
                        <CheckMark isCorrect={isCorrect} />
                    </div>
                )}

                {(item.type === 'keuze' || item.type === 'regel') && item.choices && (
                     <div className="space-y-2">
                         {item.choices.map((choice, idx) => {
                             const isSelected = answer === choice;
                             let btnClass = "w-full text-left p-3 rounded border transition-all ";
                             if (mode === 'check') {
                                 const isThisCorrect = choice === item.woord || (item.type === 'regel' && choice === answer); // Simple check for now
                                 if (isThisCorrect) btnClass += "bg-green-200 border-green-400 text-green-900";
                                 else if (isSelected) btnClass += "bg-red-200 border-red-400 text-red-900";
                                 else btnClass += "bg-white border-slate-200 opacity-50";
                             } else {
                                 btnClass += isSelected ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500" : "bg-white border-slate-200 hover:bg-slate-50";
                             }

                             return (
                                 <button
                                     key={idx}
                                     onClick={() => handleAnswerChange(item.id, choice)}
                                     disabled={mode === 'check'}
                                     className={btnClass}
                                 >
                                    {choice}
                                 </button>
                             );
                         })}
                         <CheckMark isCorrect={item.choices.includes(answer) && (item.type === 'keuze' ? answer === item.woord : true)} /> 
                     </div>
                )}
                
                {mode === 'check' && !isCorrect && (
                    <div className="mt-2 text-sm text-slate-600">
                        Correct: <span className="font-bold text-green-600">{item.woord}</span>
                    </div>
                )}
            </div>
        );
    };

    if (generatingExercises) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <i className="fas fa-magic fa-spin text-4xl text-blue-500 mb-4"></i>
                    <p className="text-slate-600 font-bold">Didactische Modules laden...</p>
                </div>
             </div>
        );
    }

    const showMachine = localData.group === '5' && localData.oefeningen?.speciale_oefeningen;
    const showVerbs = (localData.group === '7' || localData.group === '8' || localData.group === '7/8') && localData.oefeningen?.speciale_oefeningen;

    return (
        <div className="bg-white min-h-screen md:min-h-0 md:rounded-2xl shadow-xl border border-slate-200 flex flex-col max-w-5xl mx-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-slate-50 sticky top-0 z-10 rounded-t-2xl no-print gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <div>
                        <h2 className="font-bold text-slate-800">{localData.title}</h2>
                        <div className="flex items-center gap-2">
                             <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">Groep {localData.group}</span>
                             <span className="text-xs text-slate-500">{new Date(localData.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 w-full md:w-auto overflow-x-auto">
                     <button onClick={() => switchMode('dictee')} className={`tab-btn ${mode === 'dictee' ? 'active' : ''}`}>
                        <i className="fas fa-headphones mr-2"></i> Dictee
                     </button>
                     
                     {showMachine && (
                        <button onClick={() => switchMode('machine')} className={`tab-btn ${mode === 'machine' ? 'active bg-blue-100 text-blue-700' : ''}`}>
                            <i className="fas fa-cogs mr-2"></i> Klank-Machine
                        </button>
                     )}

                     {showVerbs && (
                        <button onClick={() => switchMode('machine')} className={`tab-btn ${mode === 'machine' ? 'active bg-purple-100 text-purple-700' : ''}`}>
                            <i className="fas fa-pencil-ruler mr-2"></i> Werkwoorden
                        </button>
                     )}

                    <button onClick={() => switchMode('fill')} className={`tab-btn ${mode === 'fill' ? 'active' : ''}`}>
                        <i className="fas fa-pen mr-2"></i> Invullen
                    </button>
                    <button onClick={() => switchMode('check')} className={`tab-btn ${mode === 'check' ? 'active' : ''}`}>
                        <i className="fas fa-check-double mr-2"></i> Nakijken
                    </button>
                </div>
            </div>

            <style>{`
                .tab-btn { flex: 1; padding: 6px 12px; border-radius: 6px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; color: #475569; transition: all; }
                .tab-btn:hover { background: #f8fafc; }
                .tab-btn.active { background: #e0e7ff; color: #4338ca; }
            `}</style>

            {/* Content */}
            <div className="p-6 md:p-10 overflow-y-auto bg-slate-50/50 print:bg-white print:p-0 flex-1">
                
                {/* Print Header */}
                <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
                     <h1 className="text-3xl font-bold text-slate-900">
                        {mode === 'dictee' ? 'Dictee' : 'Spelling Werkblad'}
                     </h1>
                     <div className="flex justify-between mt-2 text-lg">
                         <span>Groep: {localData.group}</span>
                         <span>Naam: _______________________</span>
                     </div>
                </div>

                {/* MODUS: DICTEE */}
                {mode === 'dictee' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <i className="fas fa-microphone"></i>
                                </div>
                                Voorlees Dictee
                            </h3>
                            <div className="space-y-6">
                                {localData.woordenlijst.map((w, i) => (
                                    <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-slate-900 mb-1 filter blur-sm hover:blur-none transition-all cursor-pointer" title="Klik om te zien">{w.woord}</p>
                                            <p className="text-slate-500 italic">
                                                {localData.dicteeZinnen?.[i] || `Schrijf op: ${w.woord}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODUS: MACHINE (Groep 5 / 7 Specifiek) */}
                {mode === 'machine' && localData.oefeningen?.speciale_oefeningen && (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-3">
                            <i className="fas fa-info-circle text-xl"></i>
                            <p className="font-medium">
                                {localData.group === '5' 
                                    ? "Gebruik de Klankgroepen-machine: Hak het woord, zoek de laatste klank en pas de regel toe."
                                    : "Werkwoordspelling: Ontleed eerst de zin voordat je het woord opschrijft."}
                            </p>
                        </div>
                        {localData.oefeningen.speciale_oefeningen.map((ex, i) => 
                            localData.group === '5' 
                                ? renderKlankgroepMachine(ex, i) 
                                : renderWerkwoordModule(ex, i)
                        )}
                    </div>
                )}

                {/* MODUS: INVULLEN / NAKIJKEN */}
                {(mode === 'fill' || mode === 'check' || mode === 'print') && localData.oefeningen && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Invul Oefeningen */}
                        {localData.oefeningen.invulzinnen.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4 print:mb-2">1. Maak de zinnen af</h3>
                                <div className="grid gap-4 print:block">
                                    {localData.oefeningen.invulzinnen.map((ex, i) => renderInteractiveExercise(ex, i))}
                                </div>
                            </div>
                        )}
                        
                        {/* Keuze Oefeningen */}
                        {localData.oefeningen.kies_juiste_spelling.length > 0 && (
                            <div className="break-before-page">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 print:mt-8">2. Kies de juiste spelling</h3>
                                <div className="grid gap-4 print:block">
                                    {localData.oefeningen.kies_juiste_spelling.map((ex, i) => renderInteractiveExercise(ex, i + 5))}
                                </div>
                            </div>
                        )}

                        {/* Leesverhaal (niet bij print) */}
                        {mode !== 'print' && (
                            <div className="mt-12 bg-orange-50 rounded-xl p-6 border border-orange-100 no-print">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-orange-800 text-lg">
                                        <i className="fas fa-book-open mr-2"></i> Leesverhaal
                                    </h3>
                                    {!story && (
                                        <button 
                                            onClick={handleGenerateStory} 
                                            disabled={loadingStory}
                                            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-600 transition-colors"
                                        >
                                            {loadingStory ? 'Schrijven...' : 'Maak Verhaal'}
                                        </button>
                                    )}
                                </div>
                                {story && (
                                     <div className="prose prose-orange text-slate-800" dangerouslySetInnerHTML={{ __html: story.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') }} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorksheetPlayer;