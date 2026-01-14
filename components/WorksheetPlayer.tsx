
import React, { useState } from 'react';
import { WorksheetData, ExerciseItem } from '../types';
import { generateExercises } from '../services/geminiService';
import { CATEGORIES, SPELLING_REGELS } from '../constants';
import PrintLayout from './PrintLayout';

interface WorksheetPlayerProps {
    data: WorksheetData;
    initialMode: 'dictee' | 'fill' | 'print'; 
    onClose: () => void;
}

const WorksheetPlayer: React.FC<WorksheetPlayerProps> = ({ data, initialMode, onClose }) => {
    const [mode, setMode] = useState<'dictee' | 'machine' | 'fill' | 'check' | 'print'>(initialMode);
    const [localData, setLocalData] = useState<WorksheetData>(data);
    const [generatingExercises, setGeneratingExercises] = useState(false);

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
    };

    const getCategoryAction = (id: number) => {
        const rule = SPELLING_REGELS.find(r => r.id === id);
        return rule?.actie || "Schrijf het woord op.";
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

    if (mode === 'print') {
        const oef = localData.oefeningen;
        const gr = localData.group;

        if (!oef) {
            ensureExercises();
            return null;
        }

        const stap1Items = oef.sorteer_oefening?.woorden || [];
        const stap2Items = oef.transformatie || oef.klankgroepen_tabel || oef.gaten_oefening || [];
        // Beperk stap 3 tot max 8 zinnen om het op 1 A4 te houden (pagina 2)
        const stap3Items = (oef.context || oef.invulzinnen || oef.redacteur_oefening || []).slice(0, 8);

        return (
            <PrintLayout title={localData.title} group={localData.group} onClose={onClose}>
                {/* --- PAGINA 1: WOORDEN, SORTEREN, ANALYSEREN --- */}
                
                {/* Woordenwolk */}
                <div className="mb-8 text-center">
                    <div className="inline-block px-8 py-4 bg-blue-50/50 border border-blue-200 rounded-2xl relative shadow-sm max-w-2xl">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                            Woordenwolk
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                            {localData.woordenlijst.map((w, i) => (
                                <span key={i} className="font-bold text-lg text-slate-800">
                                    {w.woord}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* STAP 1: Kijken & Sorteren */}
                <div className="exercise-block mb-8 bg-white relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md text-sm">1</div>
                        <h3 className="font-bold text-xl text-slate-800">Kijken & Sorteren</h3>
                    </div>
                    
                    <div className="text-sm text-slate-600 mb-6 italic">
                        Opdracht: {oef.sorteer_oefening?.categorieen && oef.sorteer_oefening.categorieen.length > 1 
                            ? "Kijk naar de woordenwolk. Schrijf de woorden in het juiste vak." 
                            : "Schrijf de woorden over en zet de categorie-nummers erbij."}
                    </div>

                    {oef.sorteer_oefening?.categorieen && oef.sorteer_oefening.categorieen.length > 1 ? (
                        <div className="flex border border-slate-300 rounded-xl overflow-hidden min-h-[250px] shadow-sm">
                            {oef.sorteer_oefening.categorieen.map((catId: number, i: number) => (
                                <div key={i} className="flex-1 flex flex-col border-r border-slate-300 last:border-r-0">
                                    <div className="bg-slate-50 p-2 border-b border-slate-300 text-center">
                                        <div className="inline-flex items-center justify-center px-2 py-1 bg-white border border-blue-600 rounded-lg text-blue-600 text-xs font-bold gap-1 shadow-sm">
                                            <span>{catId}</span>
                                            <span className="uppercase tracking-tighter text-[9px]">{CATEGORIES[catId].substring(0, 8)}..</span>
                                        </div>
                                    </div>
                                    {/* Lijntjes om te schrijven */}
                                    <div className="flex-1 bg-white p-4 space-y-6">
                                        {[...Array(5)].map((_, idx) => (
                                            <div key={idx} className="border-b border-slate-200 h-4"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                             {stap1Items.slice(0, 15).map((item: ExerciseItem, i: number) => (
                                <div key={i} className="flex items-end gap-2">
                                     <span className="text-slate-400 font-bold text-xs w-4">{i+1}.</span>
                                     <div className="flex-1 border-b border-slate-300 h-6"></div>
                                </div>
                             ))}
                        </div>
                    )}
                </div>

                {/* STAP 2: Analyseren (Op Pagina 1 als het past, anders loopt het door) */}
                <div className="exercise-block bg-white relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md text-sm">2</div>
                        <h3 className="font-bold text-xl text-slate-800">Denken & Hakken</h3>
                    </div>
                    
                    <div className="text-sm text-slate-600 mb-6 italic">
                         Opdracht: {gr === '4' ? "Vul de ontbrekende letters in en schrijf het hele woord." : "Verdeel in klankgroepen en omcirkel de regel."}
                    </div>

                    {gr === '4' ? (
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                            {stap2Items.slice(0, 15).map((item: ExerciseItem, i: number) => {
                                const fullWord = item.woord || "";
                                const prefix = item.metadata?.prefix || "";
                                const suffix = item.metadata?.suffix || "";
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-slate-300 font-bold text-xs w-4">{i+1}.</span>
                                        <div className="flex-1 font-handwriting text-xl tracking-widest text-slate-800">
                                            {prefix}<span className="text-slate-300">...</span>{suffix}
                                        </div>
                                        <div className="w-32 border-b border-slate-300 h-6"></div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Compacte Tabel voor Groep 5-8 */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stap2Items.slice(0, 15).map((item: ExerciseItem, i: number) => (
                                <div key={i} className="flex items-center border-b border-slate-200 pb-1">
                                    <div className="w-1/3 font-bold text-slate-700 text-sm">{item.woord}</div>
                                    <div className="w-2/3 border-b border-slate-300 border-dotted h-6 ml-2"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- PAGINA 2: TOEPASSEN --- */}
                
                <div className="force-page-break">
                    <div className="exercise-block bg-white relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md text-sm">3</div>
                            <h3 className="font-bold text-xl text-slate-800">Doen & Schrijven</h3>
                        </div>
                        
                        <div className="text-sm text-slate-600 mb-8 italic bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <strong>Opdracht:</strong> {stap3Items[0]?.type === 'redacteur' ? "De dikgedrukte woorden zijn fout. Schrijf de zin goed op." : "Maak de zin af met een woord uit de wolk."}
                        </div>

                        <div className="space-y-8">
                            {stap3Items.map((item: ExerciseItem, i: number) => (
                                <div key={i} className="relative">
                                    <div className="flex gap-3 mb-2">
                                        <span className="text-slate-400 font-bold text-sm pt-1">{i+1}.</span>
                                        <div className="text-base text-slate-800 leading-relaxed font-medium">
                                            {item.opdracht.split('...').map((part: string, pIdx: number, arr: string[]) => (
                                                <React.Fragment key={pIdx}>
                                                    {part}
                                                    {pIdx < arr.length - 1 && <span className="inline-block w-24 border-b-2 border-slate-400 border-dotted mx-1"></span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                    {/* De echte schrijflijn */}
                                    <div className="writing-line"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-[9px] text-slate-400 uppercase tracking-widest">
                    Gegenereerd door Staalmaatje • www.staalmaatje.nl
                </div>
            </PrintLayout>
        );
    }

    // ... (rest van de component blijft ongewijzigd voor online modus) ...
    return (
        <div className="bg-white min-h-screen md:min-h-0 md:rounded-2xl shadow-xl border border-slate-200 flex flex-col max-w-5xl mx-auto">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-slate-50 sticky top-0 z-10 rounded-t-2xl no-print gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <div>
                        <h2 className="font-bold text-slate-800">{localData.title}</h2>
                        <div className="flex items-center gap-2">
                             <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">Groep {localData.group}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 w-full md:w-auto overflow-x-auto">
                     <button onClick={() => switchMode('dictee')} className={`tab-btn ${mode === 'dictee' ? 'active' : ''}`}>
                        <i className="fas fa-headphones mr-2"></i> Dictee
                     </button>
                    <button onClick={() => switchMode('fill')} className={`tab-btn ${mode === 'fill' ? 'active' : ''}`}>
                        <i className="fas fa-pen mr-2"></i> Invullen
                    </button>
                    <button onClick={() => switchMode('print')} className="tab-btn">
                        <i className="fas fa-print mr-2"></i> Printen
                    </button>
                </div>
            </div>

            <style>{`
                .tab-btn { flex: 1; padding: 6px 12px; border-radius: 6px; font-size: 0.875rem; font-weight: 600; white-space: nowrap; color: #475569; transition: all; }
                .tab-btn:hover { background: #f8fafc; }
                .tab-btn.active { background: #e0e7ff; color: #4338ca; }
            `}</style>

            <div className="p-10 overflow-y-auto bg-slate-50/50 flex-1">
                 <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-2xl shadow-sm">
                    <i className="fas fa-print text-6xl text-slate-200 mb-6"></i>
                    <h3 className="text-2xl font-bold mb-4">Klaar om te printen?</h3>
                    <p className="text-slate-500 mb-8">Gebruik de print-knop rechtsboven om de PDF-layout volgens het didactische trechtermodel te openen.</p>
                    <button onClick={() => switchMode('print')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                        <i className="fas fa-print mr-2"></i> Open Print Layout
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default WorksheetPlayer;
