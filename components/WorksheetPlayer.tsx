
import React, { useState, useMemo } from 'react';
import { WorksheetData, ExerciseItem } from '../types';
import { generateExercises } from '../services/geminiService';
import { CATEGORIES, SPELLING_REGELS } from '../constants';
import { getStep1InstructionText } from '../services/didacticFormatting';
import PrintLayout from './PrintLayout';
import DidacticStyledWord from './DidacticStyledWord';

interface WorksheetPlayerProps {
    data: WorksheetData;
    initialMode: 'dictee' | 'fill' | 'print'; 
    onClose: () => void;
}

const WorksheetPlayer: React.FC<WorksheetPlayerProps> = ({ data, initialMode, onClose }) => {
    const [mode, setMode] = useState<'dictee' | 'machine' | 'fill' | 'check' | 'print'>(initialMode);
    const [localData, setLocalData] = useState<WorksheetData>(data);
    const [generatingExercises, setGeneratingExercises] = useState(false);

    // Genereer een willekeurige volgorde voor de woordenwolk.
    const shuffledWords = useMemo(() => {
        const list = [...localData.woordenlijst];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }, [localData.woordenlijst]);

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
        const stap2Items = oef.stap2_oefening || oef.transformatie || [];
        const stap3Items = (oef.stap3_oefening || oef.context || []).slice(0, 10);

        // Instructie uit DB halen voor Stap 1
        const getStep1Instruction = () => {
            const cats = oef.sorteer_oefening?.categorieen || [];
            if (cats.length > 1) return "Kijk naar de woordenwolk. Schrijf de woorden in het juiste vak.";
            
            if (cats.length === 1) {
                const rule = SPELLING_REGELS.find(r => r.id === cats[0]);
                if (rule?.stap1?.opdracht) return rule.stap1.opdracht;
                return "Schrijf de woorden netjes op.";
            }
            return "Schrijf de woorden netjes op.";
        };

        // Groepeer Stap 2 items op basis van Opdracht (zodat instructies niet door elkaar lopen)
        const groupedStep2 = stap2Items.reduce((acc, item) => {
            const key = item.opdracht || "Vul in";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, ExerciseItem[]>);

        let itemCounterStap2 = 1;
        
        // --- LOGICA VOOR STAP 3 INSTRUCTIE ---
        const isUpperGroup = ['7', '8', '7/8'].includes(gr);
        
        // Bepaal welke categorieën er in stap 3 zitten
        const uniqueStep3Cats = Array.from(new Set(stap3Items.map(i => i.categorie)));
        
        let step3MainInstruction = "";

        if (isUpperGroup) {
            step3MainInstruction = "Lees de zinnen. Haal de fout eruit of vervoeg het werkwoord.";
        } else {
            if (uniqueStep3Cats.length === 1) {
                // FOCUS: Pak de specifieke instructie van deze categorie (bijv. "Zet in meervoud")
                const ruleId = uniqueStep3Cats[0];
                const rule = SPELLING_REGELS.find(r => r.id === ruleId);
                step3MainInstruction = rule?.stap3?.instructie || "Lees de zin en vul het woord in.";
            } else {
                // MIX: Algemene duidelijke instructie
                step3MainInstruction = "Lees de zin. Kijk goed en vul het ontbrekende woord in.";
            }
        }

        return (
            <PrintLayout title={localData.title} group={localData.group} onClose={onClose}>
                {/* --- PAGINA 1: WOORDEN, SORTEREN, ANALYSEREN --- */}
                
                <div className="mb-8 text-center">
                    <div className="inline-block px-8 py-4 bg-blue-50/50 border border-blue-200 rounded-2xl relative shadow-sm max-w-2xl">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                            Woordenwolk
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                            {shuffledWords.map((w, i) => (
                                <span key={i} className="font-bold text-lg text-slate-800">
                                    {w.woord}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* STAP 1 */}
                <div className="exercise-block mb-8 bg-white relative">
                    <div className="flex items-center gap-3 mb-4 mt-6">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md text-sm">1</div>
                        <h3 className="font-bold text-xl text-slate-800">
                            {oef.sorteer_oefening?.categorieen && oef.sorteer_oefening.categorieen.length > 1 ? "Kijken & Sorteren" : "Kijken & Schrijven"}
                        </h3>
                    </div>
                    <div className="text-sm text-slate-600 mb-6 italic">Opdracht: {getStep1Instruction()}</div>

                    {oef.sorteer_oefening?.categorieen && oef.sorteer_oefening.categorieen.length > 1 ? (
                        /* MULTI CATEGORY VIEW (SORTEREN) */
                        <div className="flex border border-slate-300 rounded-xl overflow-hidden min-h-[250px] shadow-sm">
                            {oef.sorteer_oefening.categorieen.map((catId: number, colIndex: number) => {
                                const exampleItem = colIndex === 0 ? localData.woordenlijst.find(w => w.categorie === catId) : null;
                                return (
                                    <div key={colIndex} className="flex-1 flex flex-col border-r border-slate-300 last:border-r-0">
                                        <div className="bg-slate-50 p-2 border-b border-slate-300 text-center">
                                            <div className="inline-flex items-center justify-center px-2 py-1 bg-white border border-blue-600 rounded-lg text-blue-600 text-xs font-bold gap-1 shadow-sm">
                                                <span>{catId}</span>
                                                <span className="uppercase tracking-tighter text-[9px]">{CATEGORIES[catId]?.substring(0, 8)}..</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white p-4 space-y-6">
                                            {[...Array(5)].map((_, idx) => (
                                                <div key={idx} className="border-b border-slate-200 h-4 relative">
                                                    {idx === 0 && exampleItem && (
                                                        <span className="absolute bottom-0 left-0 text-slate-300 font-handwriting text-lg">
                                                            {exampleItem.woord}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* SINGLE CATEGORY VIEW (FOCUS) */
                        <div className="columns-3 gap-8">
                             {stap1Items.slice(0, 15).map((item: ExerciseItem, i: number) => (
                                <div key={i} className="flex items-end gap-2 break-inside-avoid mb-4">
                                     <span className="text-slate-400 font-bold text-xs w-4">{i+1}.</span>
                                     <div className="flex-1 border-b border-slate-300 h-6 relative">
                                        {i === 0 && (
                                            <span className="absolute bottom-0 left-0 text-slate-300 font-handwriting text-lg">
                                                <DidacticStyledWord word={item.woord} catId={item.categorie} metadata={item.metadata} />
                                            </span>
                                        )}
                                     </div>
                                </div>
                             ))}
                        </div>
                    )}
                </div>

                {/* STAP 2: GEGROEPEERD PER OPDRACHT */}
                <div className="exercise-block bg-white relative">
                    <div className="flex items-center gap-3 mb-4 mt-6">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md text-sm">2</div>
                        <h3 className="font-bold text-xl text-slate-800">
                             Denken & Analyseren
                        </h3>
                    </div>

                    {Object.entries(groupedStep2).map(([instruction, groupItems], groupIdx) => (
                        <div key={groupIdx} className="mb-8 last:mb-0">
                            <div className="text-sm text-slate-600 mb-4 italic bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                <strong>Opdracht:</strong> {instruction}
                            </div>
                            
                            <div className="columns-2 gap-12">
                                {groupItems.map((item: ExerciseItem, idx: number) => {
                                    const currentIndex = itemCounterStap2++;
                                    const fullWord = item.woord || "";
                                    const isExample = idx === 0;
                                    
                                    // Visualisatie logica
                                    let visualContent = <></>;

                                    if (item.type === 'werkwoord') {
                                        visualContent = (
                                            <div className="flex flex-col gap-1 w-full mt-1">
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                                    <div className="flex-1 text-center bg-slate-50 border border-slate-200 rounded px-1">PV?</div>
                                                    <i className="fas fa-arrow-right text-[8px] text-slate-300"></i>
                                                    <div className="flex-1 text-center bg-slate-50 border border-slate-200 rounded px-1">Tijd?</div>
                                                    <i className="fas fa-arrow-right text-[8px] text-slate-300"></i>
                                                    <div className="flex-1 text-center bg-slate-50 border border-slate-200 rounded px-1">Wie?</div>
                                                </div>
                                                <div className="border-b border-slate-300 h-8 w-full relative bg-slate-50/30">
                                                    {isExample && (
                                                        <span className="absolute bottom-0 text-slate-400 font-sans text-sm p-1">
                                                            {fullWord} ({item.metadata?.infinitief || 'infinitief'})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    } else if (item.type === 'klankgroep' || item.type === 'splits') {
                                        visualContent = (
                                            <div className="flex items-center gap-2">
                                                <div className={`flex-1 border-slate-300 h-8 w-32 relative ${isExample ? 'border-b' : 'border-b-2 border-dotted'}`}>
                                                    {isExample && (
                                                        <span className="absolute bottom-0 text-slate-400 font-sans text-lg">
                                                            {item.metadata?.lettergrepen || fullWord}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="w-8 h-8 border border-slate-300 rounded bg-white"></div>
                                            </div>
                                        );
                                    } else if (item.type === 'keuze' || item.type === 'invul' || item.type === 'gaten' || item.type === 'langermaak' || item.type === 'spiegel') {
                                        const prefix = item.metadata?.prefix || "";
                                        const suffix = item.metadata?.suffix || "";
                                        const choices = item.metadata?.choices || [];
                                        
                                        if (isExample) {
                                            // VOORBEELD: Volledig woord in Standaard Font (grijs)
                                            visualContent = (
                                                <div className="flex items-baseline gap-0.5 text-lg font-sans text-slate-400">
                                                    <span>{fullWord}</span>
                                                    {choices.length > 0 && <span className="text-sm text-slate-300 ml-2">({choices.join('/')})</span>}
                                                    {item.type === 'langermaak' && <span className="text-sm text-slate-300 ml-2">(d/t)</span>}
                                                </div>
                                            );
                                        } else {
                                            // OEFENING: Prefix/Suffix in Sans (Gedrukt), Invulruimte Dotted
                                            visualContent = (
                                                <div className="flex items-baseline gap-0.5 text-lg text-slate-800">
                                                    <span className="font-sans">{prefix}</span>
                                                    <span className="inline-block min-w-[60px] border-b-2 border-dotted border-slate-400 mx-1"></span>
                                                    <span className="font-sans">{suffix}</span>
                                                    
                                                    {choices.length > 0 && (
                                                        <span className="text-sm text-slate-400 font-sans ml-2">
                                                            ({choices.join('/')})
                                                        </span>
                                                    )}
                                                    {item.type === 'langermaak' && (
                                                        <span className="text-sm text-slate-400 font-sans ml-2">(d/t)</span>
                                                    )}
                                                </div>
                                            );
                                        }
                                    } else if (item.type === 'discriminatie') {
                                         const fout = item.metadata?.foutWoord || "";
                                         // Bepaal een logisch afbreekpunt voor de invuloefening (laatste 2 letters zijn vaak de valkuil bij cat 1)
                                         const splitIndex = fullWord.length > 3 ? fullWord.length - 2 : fullWord.length - 1;
                                         const prefix = fullWord.substring(0, splitIndex);

                                         if (isExample) {
                                            // Voorbeeld: Duidelijk contrast. melk -> meluk (fout)
                                            visualContent = (
                                                <div className="flex items-center gap-2 text-lg font-sans text-slate-600">
                                                    <span className="font-bold text-slate-800">{fullWord}</span>
                                                    <span className="text-slate-300 text-sm">|</span>
                                                    <span className="line-through decoration-red-400 decoration-2 text-red-300">{fout}</span>
                                                </div>
                                            );
                                         } else {
                                            // Oefening: Actief denken. 'wo...' invullen.
                                            visualContent = (
                                                <div className="flex items-baseline text-lg text-slate-800">
                                                    <span className="font-sans">{prefix}</span>
                                                    <span className="inline-block min-w-[60px] border-b-2 border-dotted border-slate-400 ml-0.5"></span>
                                                </div>
                                            );
                                         }
                                    } else {
                                        // Fallback visual
                                        visualContent = (
                                            <div className="flex items-center gap-2 w-full">
                                                <span className={`font-bold text-sm w-24 ${isExample ? 'font-sans text-slate-400' : 'font-sans text-slate-800'}`}>{fullWord}</span>
                                                <span className="flex-1 border-b border-slate-300 h-6"></span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={item.id} className="flex items-end gap-3 break-inside-avoid mb-5">
                                            {/* Nummering */}
                                            <span className="text-slate-400 font-bold text-xs w-5 mb-1 text-right">{currentIndex}.</span>
                                            
                                            {/* Inhoud */}
                                            <div className="flex-1 overflow-hidden">
                                                {item.type === 'werkwoord' && <div className="font-bold text-sm text-slate-700 mb-0.5 font-sans">{fullWord}</div>}
                                                {visualContent}
                                            </div>

                                            {/* Categorie Badge (Rechts uitgelijnd) */}
                                            <div className="w-5 h-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0 mb-1 ml-1">
                                                {item.categorie}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* STAP 3 */}
                <div className="force-page-break">
                    <div className="exercise-block bg-white relative">
                        <div className="flex items-center gap-3 mb-4 mt-6">
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md text-sm">3</div>
                            <h3 className="font-bold text-xl text-slate-800">Toepassen</h3>
                        </div>
                        
                        <div className="text-sm text-slate-600 mb-8 italic bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <strong>Opdracht:</strong> {step3MainInstruction}
                        </div>

                        <div className="space-y-8">
                            {stap3Items.map((item: ExerciseItem, i: number) => {
                                let content = item.opdracht; 
                                
                                // LOGICA VOOR INVULZINNEN (Groep 4-6)
                                if (!isUpperGroup) {
                                    // 1. Probeer '...' te vervangen door een mooie schrijflijn
                                    // 2. Als '...' niet bestaat, zoek het doelwoord en vervang het.
                                    const regexWord = new RegExp(`\\b${item.woord}\\b`, 'gi');
                                    
                                    if (content.includes('...')) {
                                        // Vervang '...' door een dotted line span
                                        const parts = content.split('...');
                                        return (
                                            <div key={i} className="flex items-baseline gap-3">
                                                <span className="text-slate-400 font-bold text-sm min-w-[1.5rem] text-right">{i+1}.</span>
                                                <div className="text-lg text-slate-800 font-sans leading-loose">
                                                    {parts[0]}
                                                    <span className="inline-block border-b-2 border-dotted border-slate-400 min-w-[120px] mx-1"></span>
                                                    {parts[1]}
                                                </div>
                                                 {/* Categorie Badge (Rechts) */}
                                                 <div className="ml-auto w-5 h-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0">
                                                    {item.categorie}
                                                </div>
                                            </div>
                                        );
                                    } 
                                    else if (regexWord.test(content)) {
                                         // Doelwoord gevonden, vervang door gat
                                         const parts = content.split(regexWord);
                                         return (
                                            <div key={i} className="flex items-baseline gap-3">
                                                <span className="text-slate-400 font-bold text-sm min-w-[1.5rem] text-right">{i+1}.</span>
                                                <div className="text-lg text-slate-800 font-sans leading-loose">
                                                    {parts[0]}
                                                    <span className="inline-block border-b-2 border-dotted border-slate-400 min-w-[120px] mx-1"></span>
                                                    {parts[1]}
                                                </div>
                                                <div className="ml-auto w-5 h-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0">
                                                    {item.categorie}
                                                </div>
                                            </div>
                                         );
                                    }
                                }

                                // LOGICA VOOR REDACTEUR / BOVENBOUW (Groep 7/8) of Fallback
                                // Hier tonen we de zin en een schrijfregel eronder.
                                return (
                                    <div key={i} className="relative mb-6 break-inside-avoid">
                                        <div className="flex gap-3 mb-1">
                                            <span className="text-slate-400 font-bold text-sm pt-1 min-w-[1.5rem] text-right">{i+1}.</span>
                                            <div className="text-base text-slate-800 font-medium w-full font-sans">
                                                {content}
                                            </div>
                                            <div className="w-5 h-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0 mt-1">
                                                {item.categorie}
                                            </div>
                                        </div>
                                        <div className="writing-line relative ml-10 border-b border-slate-300 h-8"></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-[9px] text-slate-400 uppercase tracking-widest">
                    Staalmaatje © 2024
                </div>
            </PrintLayout>
        );
    }
    
    // Fallback voor andere modes (omdat we hier focussen op de print/werkblad update)
    return <div className="p-10">Selecteer Print Modus</div>;
};

export default WorksheetPlayer;
