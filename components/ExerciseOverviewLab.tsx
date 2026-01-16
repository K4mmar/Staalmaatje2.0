
import React, { useState } from 'react';
import { SPELLING_REGELS, GROUP_CATEGORIES, CATEGORIES, GRADE_STRATEGIES } from '../constants';
import { MOCK_LAB_DATA } from '../services/mockDataService';
import { COLORS, WorksheetData } from '../types';
import DidacticStyledWord from './DidacticStyledWord';
import WorksheetPlayer from './WorksheetPlayer';

interface ExerciseOverviewLabProps {
    onBack: () => void;
}

type DetailSelection = {
    group: string;
    step: 1 | 2 | 3;
    title: string;
} | null;

const ExerciseOverviewLab: React.FC<ExerciseOverviewLabProps> = ({ onBack }) => {
    const [previewWorksheet, setPreviewWorksheet] = useState<WorksheetData | null>(null);
    const [detailSelection, setDetailSelection] = useState<DetailSelection>(null);

    const groups = ['4', '5', '6', '7/8'];

    // --- LOGICA DEFINITIES PER GROEP (Voor de Matrix Teksten) ---
    const getGroupLogic = (grp: string) => {
        const isUpper = grp === '7/8' || grp === '8';
        
        let step2 = {
            title: "2. Denken & Analyseren",
            focus: "Regel toepassen",
            action: "Klankgroepen schema. Woord splitsen en regel benoemen.",
            visual: "bro - den | Cat 10"
        };

        if (grp === '4') {
             step2 = {
                title: "2. Denken & Analyseren",
                focus: "Categorie-specifieke Gaten",
                action: "Geen willekeurige gaten, maar focus op de moeilijkheid per categorie.",
                visual: "Lu...t (g/ch/cht)"
            };
        } else if (grp === '5') {
            step2 = {
                title: "2. Klankgroepen Schema",
                focus: "Splitsen & Regels",
                action: "Het kind moet het woord splitsen en de regel kiezen (bo - men).",
                visual: "bo - men (lang)"
            };
        } else if (grp === '6') {
            step2 = {
                title: "2. Klank & Herkomst",
                focus: "Dynamisch: Schema of Klank-Teken",
                action: "Cat 10? -> Schema (Splitsen). Leenwoord? -> Klank-analyse (Ik hoor k, ik schrijf c).",
                visual: "jager (schema) | cola (k/c)"
            };
        } else if (isUpper) {
            step2 = {
                title: "2. Werkwoordschema",
                focus: "Stroomschema: PV -> Tijd -> Onderwerp",
                action: "Stappenplan volgen. Eerst ontleden, dan spellen.",
                visual: "PV? > TT? > O? > Stam+t"
            };
        }
        
        return {
            step1: {
                title: "1. Kijken & Schrijven",
                focus: "Visuele inprenting",
                action: "Woord overschrijven + Categorie-actie (streepjes/rondjes).",
                visual: "b-oo-m"
            },
            step2: step2,
            step3: {
                title: "3. Doen & Toepassen",
                focus: "Context & Transfer",
                action: isUpper 
                    ? "Redacteursom & Foutsporing." 
                    : "Invulzinnen & Context.",
                visual: isUpper ? "Fout: Kado -> Cadeau" : "De ... blaft. (hond)"
            }
        };
    };

    // --- RENDERERS ---

    // 1. DETAIL TABEL WEERGAVE
    const renderDatabaseTable = () => {
        if (!detailSelection) return null;
        
        const { group, step, title } = detailSelection;
        
        // Stap 1 is generiek (toon alle regels of filter op groep als gewenst, hier pakken we de groep filter)
        // Stap 2 & 3 zijn specifiek
        
        const activeCatIds = GROUP_CATEGORIES[group === '7/8' ? '7' : group] || [];
        const filteredRules = SPELLING_REGELS.filter(r => activeCatIds.includes(r.id));

        return (
            <div className="animate-fade-in bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[75vh]">
                {/* Header van de Tabel */}
                <div className="bg-slate-800 text-white p-6 flex justify-between items-center flex-shrink-0 z-20">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                                ${step === 1 ? 'bg-blue-500' : step === 2 ? 'bg-green-500' : 'bg-orange-500'}`}>
                                Stap {step}
                            </span>
                            <span className="text-slate-400 font-medium">Groep {group}</span>
                        </div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                    </div>
                    <button 
                        onClick={() => setDetailSelection(null)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-times"></i> Sluiten
                    </button>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider sticky top-0 z-10 shadow-sm border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-bold border-b w-16">ID</th>
                                <th className="p-4 font-bold border-b w-1/4">Categorie</th>
                                <th className="p-4 font-bold border-b">Instructie / Opdracht</th>
                                <th className="p-4 font-bold border-b w-1/3">Voorbeeld Uitwerking</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {filteredRules.map(rule => {
                                let instruction = "";
                                let visual = <></>;

                                if (step === 1) {
                                    instruction = rule.stap1.opdracht;
                                    const ex = rule.voorbeeld.split('/')[0].trim();
                                    visual = <DidacticStyledWord word={ex} catId={rule.id} />;
                                } else if (step === 2) {
                                    if (rule.stap2) {
                                        instruction = rule.stap2.instructie;
                                        visual = (
                                            <div className="flex flex-col gap-1">
                                                <span className="font-handwriting text-lg text-slate-700">{rule.stap2.visual_template || rule.voorbeeld}</span>
                                                <span className="text-[10px] text-green-600 uppercase font-bold bg-green-50 px-2 py-0.5 rounded w-fit">{rule.stap2.type}</span>
                                            </div>
                                        );
                                    } else {
                                        instruction = "-";
                                    }
                                } else if (step === 3) {
                                     if (rule.stap3) {
                                        instruction = rule.stap3.instructie;
                                        visual = (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-600 italic">"De {rule.voorbeeld}..."</span>
                                                <span className="text-[10px] text-orange-600 uppercase font-bold bg-orange-50 px-2 py-0.5 rounded w-fit">{rule.stap3.type}</span>
                                            </div>
                                        );
                                     }
                                }

                                return (
                                    <tr key={rule.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-400">{rule.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{rule.naam}</div>
                                            <div className="text-xs text-slate-500 italic mt-1">{rule.regel}</div>
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium">
                                            {instruction}
                                        </td>
                                        <td className="p-4 bg-slate-50/50">
                                            {visual}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // 2. MATRIX WEERGAVE (TRECHTER)
    const renderMatrix = () => (
        <div className="space-y-16 animate-fade-in pb-12">
            {groups.map((group) => {
                const currentLogic = getGroupLogic(group);
                const strategy = GRADE_STRATEGIES[group === '7/8' ? '7' : group];
                const baseKey = group === '7/8' ? '7' : group;

                return (
                    <div key={group} className="relative">
                        {/* Group Header */}
                        <div className="flex items-center gap-4 mb-0 ml-4">
                            <div className="px-4 py-1 rounded-t-lg bg-slate-800 text-white font-bold text-sm uppercase tracking-wider">
                                Groep {group}
                            </div>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative">
                            
                            {/* PDF Preview Buttons */}
                            <div className="absolute top-6 right-6 flex gap-2 z-20">
                                <button 
                                    onClick={() => setPreviewWorksheet(MOCK_LAB_DATA[`${baseKey}_single`])}
                                    title="Bekijk voorbeeld met 1 focus categorie"
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:text-orange-600 hover:border-orange-300 transition-all flex items-center gap-2"
                                >
                                    <i className="fas fa-bullseye"></i> Focus PDF
                                </button>
                                <button 
                                    onClick={() => setPreviewWorksheet(MOCK_LAB_DATA[`${baseKey}_mix`])}
                                    title="Bekijk voorbeeld met 3 categorieën door elkaar"
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:text-blue-600 hover:border-blue-300 transition-all flex items-center gap-2"
                                >
                                    <i className="fas fa-layer-group"></i> Mix PDF
                                </button>
                            </div>

                            {/* Info Bar */}
                            <div className="mb-8 pr-48">
                                <p className="text-slate-600 text-sm italic border-l-4 border-blue-500 pl-3">
                                    "{strategy.teacherTone}"
                                </p>
                            </div>

                            {/* TRECHTER GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                {/* Connecting Line */}
                                <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-slate-100 -z-0 mx-16"></div>

                                {/* START: WOORDENWOLK */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative z-10 flex flex-col h-full">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold absolute -top-4 left-1/2 transform -translate-x-1/2 shadow-md border-4 border-white">Start</div>
                                    <h4 className="font-bold text-lg text-slate-800 text-center mb-2">Woordenwolk</h4>
                                    <p className="text-xs text-slate-500 text-center mb-4 flex-1">
                                        15 woorden<br/>(8x Focus / 5x Herhaling)
                                    </p>
                                    <div className="bg-slate-50 rounded border border-slate-100 p-2 text-center text-xs text-slate-400">
                                        Geen database actie
                                    </div>
                                </div>

                                {/* STAP 1 */}
                                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 relative z-10 hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold absolute -top-4 left-1/2 transform -translate-x-1/2 shadow-md border-4 border-white">1</div>
                                    <h4 className="font-bold text-lg text-blue-900 text-center mb-2">{currentLogic.step1.title}</h4>
                                    <p className="text-xs text-slate-600 text-center mb-4 flex-1">{currentLogic.step1.action}</p>
                                    
                                    <button 
                                        onClick={() => setDetailSelection({ group, step: 1, title: `Stap 1: Inprenting (Groep ${group})` })}
                                        className="w-full py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-database"></i> Bekijk Database
                                    </button>
                                </div>

                                {/* STAP 2 */}
                                <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 relative z-10 hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold absolute -top-4 left-1/2 transform -translate-x-1/2 shadow-md border-4 border-white">2</div>
                                    <h4 className="font-bold text-lg text-green-900 text-center mb-2">{currentLogic.step2.title}</h4>
                                    <p className="text-xs text-slate-600 text-center mb-4 flex-1">{currentLogic.step2.action}</p>

                                    <button 
                                        onClick={() => setDetailSelection({ group, step: 2, title: `Stap 2: Analyse (Groep ${group})` })}
                                        className="w-full py-2 bg-white border border-green-200 text-green-700 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-database"></i> Bekijk Database
                                    </button>
                                </div>

                                {/* STAP 3 */}
                                <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100 relative z-10 hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold absolute -top-4 left-1/2 transform -translate-x-1/2 shadow-md border-4 border-white">3</div>
                                    <h4 className="font-bold text-lg text-orange-900 text-center mb-2">{currentLogic.step3.title}</h4>
                                    <p className="text-xs text-slate-600 text-center mb-4 flex-1">{currentLogic.step3.action}</p>

                                    <button 
                                        onClick={() => setDetailSelection({ group, step: 3, title: `Stap 3: Transfer (Groep ${group})` })}
                                        className="w-full py-2 bg-white border border-orange-200 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-database"></i> Bekijk Database
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    if (previewWorksheet) {
        return (
            <WorksheetPlayer 
                data={previewWorksheet} 
                initialMode="print" 
                onClose={() => setPreviewWorksheet(null)} 
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                 {/* Header */}
                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <button onClick={onBack} className="text-slate-400 hover:text-slate-800 mb-2 font-bold flex items-center gap-2 transition-colors">
                            <i className="fas fa-arrow-left"></i> Terug naar Dashboard
                        </button>
                        <h1 className="text-3xl font-extrabold text-slate-800">
                            <i className="fas fa-database text-cyan-600 mr-3"></i>
                            Oefeningen Database
                        </h1>
                        <p className="text-slate-500">Het Didactisch Model per Groep (Matrix)</p>
                    </div>
                </div>

                {detailSelection ? renderDatabaseTable() : renderMatrix()}
            </div>
        </div>
    );
};

export default ExerciseOverviewLab;
