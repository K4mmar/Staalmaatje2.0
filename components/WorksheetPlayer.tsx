
import React, { useState } from 'react';
import { WorksheetData, UserAnswers, ExerciseItem } from '../types';
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
        const stap3Items = oef.context || oef.invulzinnen || oef.redacteur_oefening || [];

        return (
            <PrintLayout 
                title={localData.title} 
                group={localData.group} 
                onClose={onClose} 
            >
                {/* Woordenwolk (Alle 15 woorden) */}
                <div className="mb-20 text-center">
                    <div className="inline-block p-10 bg-blue-50/50 border-2 border-blue-200 rounded-[3rem] relative shadow-sm">
                        <div className="absolute -top-5 left-10 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">De Woordenwolk</div>
                        <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
                            {localData.woordenlijst.map((w, i) => (
                                <span key={i} className="font-extrabold text-2xl text-slate-800 transition-all hover:scale-105">
                                    {w.woord}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* STAP 1: HERKENNEN */}
                <div className="exercise-block mb-24 bg-white relative">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg text-lg">
                            <i className="fas fa-eye"></i>
                        </div>
                        <h3 className="font-extrabold text-3xl text-slate-800 tracking-tight">1. Kijken & Sorteren</h3>
                    </div>
                    
                    <div className="bg-blue-50/30 p-5 rounded-2xl text-base mb-10 border-l-8 border-blue-600 leading-relaxed text-slate-700">
                        <strong className="text-blue-900">Opdracht:</strong> {oef.sorteer_oefening?.categorieen && oef.sorteer_oefening.categorieen.length > 1 
                            ? "Kijk goed naar de woordenwolk hierboven. In welke categorie horen de woorden? Schrijf ze in het juiste vak." 
                            : (stap1Items[0]?.categorie === 1 ? "Zet streepjes tussen alle letters van de woorden uit de wolk." : getCategoryAction(stap1Items[0]?.categorie || 1))}
                    </div>

                    {oef.sorteer_oefening?.categorieen && oef.sorteer_oefening.categorieen.length > 1 ? (
                        <div className="grid grid-cols-3 border-2 border-slate-300 rounded-[2rem] overflow-hidden min-h-[400px] shadow-sm">
                            {oef.sorteer_oefening.categorieen.map((catId: number, i: number) => (
                                <div key={i} className="flex flex-col border-r-2 border-slate-300 last:border-r-0">
                                    <div className="bg-slate-50 p-6 border-b-2 border-slate-300 text-center">
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 mx-auto flex items-center justify-center text-base font-bold text-blue-600 mb-2 shadow-sm">{catId}</div>
                                        <div className="font-extrabold text-[11px] text-slate-600 uppercase tracking-widest leading-none px-2">
                                            {CATEGORIES[catId]}
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                             {stap1Items.map((item: ExerciseItem, i: number) => (
                                <div key={i} className="flex items-end gap-4 pb-3 border-b border-slate-100">
                                     <span className="text-slate-300 font-bold text-base w-6">{i+1}</span>
                                     <div className="text-xl font-bold text-slate-800 w-40">{item.woord}</div>
                                     <div className="flex-1 border-b-2 border-dotted border-slate-400 h-8 relative">
                                         {i === 0 && <span className="absolute left-2 -top-1 font-handwriting text-blue-500 text-2xl opacity-50">{item.woord.split('').join('-')}</span>}
                                     </div>
                                </div>
                             ))}
                        </div>
                    )}
                </div>

                {/* STAP 2: ANALYSE */}
                <div className="exercise-block mb-24 bg-white relative page-break-before">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg text-lg">
                            <i className="fas fa-cog"></i>
                        </div>
                        <h3 className="font-extrabold text-3xl text-slate-800 tracking-tight">2. Denken & Hakken</h3>
                    </div>
                    
                    <div className="bg-green-50/30 p-5 rounded-2xl text-base mb-10 border-l-8 border-green-600 leading-relaxed text-slate-700">
                         <strong className="text-green-900">Opdracht:</strong> {gr === '4' ? "Vul de letters in die op de stippellijntjes horen te staan." : (gr === '5' || gr === '6' ? "Verdeel elk woord in klankgroepen. Wat is de laatste klank?" : "Kruis aan of het woord een zelfstandig naamwoord (zn), werkwoord (ww) of bijvoeglijk naamwoord (bn) is.")}
                    </div>

                    {gr === '4' ? (
                        <div className="grid grid-cols-2 gap-x-20 gap-y-10">
                            {stap2Items.map((item: ExerciseItem, i: number) => {
                                const fullWord = item.woord || "";
                                const prefix = item.metadata?.prefix || "";
                                const suffix = item.metadata?.suffix || "";
                                const missingCount = Math.max(1, fullWord.length - prefix.length - suffix.length);
                                return (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="text-slate-300 font-bold text-base">{i+1}</span>
                                        <div className="text-3xl font-bold flex items-baseline tracking-wide">
                                            <span className="text-slate-800">{prefix}</span>
                                            <span className="mx-1 flex">
                                                {Array.from({ length: missingCount }).map((_, idx) => (
                                                    <span key={idx} className="w-8 border-b-4 border-slate-800 border-dotted mx-0.5 h-8"></span>
                                                ))}
                                            </span>
                                            <span className="text-slate-800">{suffix}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (gr === '5' || gr === '6' ? (
                        <table className="w-full rounded-[2rem] overflow-hidden border-2 border-slate-300 shadow-sm">
                            <thead className="bg-slate-50">
                                <tr className="border-b-2 border-slate-300">
                                    <th className="p-5 text-left font-bold text-slate-600 uppercase text-xs tracking-widest">Woord</th>
                                    <th className="p-5 text-left font-bold text-slate-600 uppercase text-xs tracking-widest">Hakken</th>
                                    <th className="p-5 text-left font-bold text-slate-600 uppercase text-xs tracking-widest">Laatste klank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stap2Items.map((item: ExerciseItem, i: number) => (
                                    <tr key={i} className="border-b border-slate-200 last:border-0 h-20">
                                        <td className="p-6 font-extrabold text-2xl text-slate-800">{item.woord}</td>
                                        <td className="p-6 border-l border-slate-100"></td>
                                        <td className="p-6 border-l border-slate-100"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="space-y-4">
                             {stap2Items.map((item: ExerciseItem, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <span className="font-extrabold text-2xl text-slate-800">{item.woord}</span>
                                    <div className="flex gap-12 mr-4">
                                        {['zn', 'ww', 'bn'].map((type: string) => (
                                            <div key={type} className="flex items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-slate-400 rounded-lg bg-white shadow-inner"></div>
                                                <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* STAP 3: TOEPASSEN */}
                <div className="exercise-block mb-24 bg-white relative">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg text-lg">
                            <i className="fas fa-pencil-alt"></i>
                        </div>
                        <h3 className="font-extrabold text-3xl text-slate-800 tracking-tight">3. Doen & Schrijven</h3>
                    </div>
                    
                    <div className="bg-orange-50/30 p-5 rounded-2xl text-base mb-10 border-l-8 border-orange-500 leading-relaxed text-slate-700">
                        <strong className="text-orange-900">Opdracht:</strong> {stap3Items[0]?.type === 'redacteur' ? "In deze zinnen zijn de dikgedrukte woorden fout geschreven. Kun jij ze verbeteren op de lijnen?" : "Maak de zin af. Gebruik een passend woord uit de woordenwolk van stap 1."}
                    </div>

                    <div className="space-y-12">
                        {stap3Items.slice(0, 8).map((item: ExerciseItem, i: number) => (
                            <div key={i} className="flex gap-6">
                                <span className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-500 text-base flex-shrink-0 shadow-sm border border-slate-200">{i+1}</span>
                                <div className="flex-1">
                                    <div className="text-2xl leading-[1.6] text-slate-800 mb-6 font-medium">
                                        {item.opdracht.split('...').map((part: string, pIdx: number, arr: string[]) => (
                                            <React.Fragment key={pIdx}>
                                                {part}
                                                {pIdx < arr.length - 1 && <span className="inline-block w-48 border-b-2 border-slate-400 border-dotted mx-2 relative top-1"></span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    {item.type === 'redacteur' && (
                                        <div className="space-y-4 mt-8">
                                            <div className="h-10 border-b-2 border-slate-300 w-full"></div>
                                            <div className="h-10 border-b-2 border-slate-300 w-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer (Print-only) */}
                <div className="mt-20 text-center text-[10px] text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100 pt-8 font-bold">
                    Gegenereerd door Staalmaatje • Didactisch Trechtermodel • www.staalmaatje.nl
                </div>
            </PrintLayout>
        );
    }

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
                @media print { .page-break-before { page-break-before: always; } }
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
