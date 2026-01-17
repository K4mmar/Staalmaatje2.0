import React, { useState, useMemo } from 'react';
import { WorksheetData, ExerciseItem } from '../types';
import { generateExercises } from '../services/geminiService';
import { CATEGORIES, SPELLING_REGELS } from '../constants';
import { getStep1InstructionText } from '../services/didacticFormatting';
import PrintLayout from './PrintLayout';
import DidacticStyledWord from './DidacticStyledWord';
import { useToast } from './Toast';

interface WorksheetPlayerProps {
    data: WorksheetData;
    initialMode: 'dictee' | 'fill' | 'print'; 
    onClose: () => void;
}

const WorksheetPlayer: React.FC<WorksheetPlayerProps> = ({ data, initialMode, onClose }) => {
    const [localData, setLocalData] = useState<WorksheetData>(data);
    const [generatingExercises, setGeneratingExercises] = useState(false);
    const { showToast } = useToast();

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
            console.error(e);
            showToast("Kon geen oefeningen genereren", "error");
        } finally {
            setGeneratingExercises(false);
        }
    };

    // Helper voor visualisatie van Klankgroepen blokken (Zoals in Lab)
    const renderSyllableBlocks = (word: string, syllables: string, isExample: boolean) => {
        const parts = syllables ? syllables.split('-') : word.split('');
        return (
            <div className="flex items-center gap-1">
                {parts.map((part, idx) => (
                    <div key={idx} className={`border border-slate-300 h-8 min-w-[3rem] px-2 flex items-center justify-center bg-white ${idx === 0 && isExample ? 'border-b-2 border-slate-400' : 'border-dotted'}`}>
                        {isExample && <span className="font-handwriting text-lg text-slate-600">{part}</span>}
                    </div>
                ))}
                <div className="ml-2 w-8 h-8 border border-slate-400 rounded bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                    ?
                </div>
            </div>
        );
    };

    // Helper voor Werkwoord Schema (Zoals in Lab)
    const renderVerbSchema = (word: string, meta: any, isExample: boolean) => (
        <div className="flex flex-col gap-1 w-full mt-1">
            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                <div className="flex-1 text-center bg-slate-50 border border-slate-200 rounded px-1 py-0.5">PV?</div>
                <i className="fas fa-arrow-right text-[8px] text-slate-300"></i>
                <div className="flex-1 text-center bg-slate-50 border border-slate-200 rounded px-1 py-0.5">Tijd?</div>
                <i className="fas fa-arrow-right text-[8px] text-slate-300"></i>
                <div className="flex-1 text-center bg-slate-50 border border-slate-200 rounded px-1 py-0.5">Onderwerp?</div>
                <i className="fas fa-arrow-right text-[8px] text-slate-300"></i>
                <div className="flex-[2] text-center bg-blue-50 border border-blue-100 rounded px-1 py-0.5 text-blue-800">Schrijf</div>
            </div>
            <div className="border-b border-slate-300 h-8 print:h-8 w-full relative bg-slate-50/10 flex items-center pl-2">
                {isExample && (
                    <span className="text-slate-500 font-handwriting text-lg">
                        {word} <span className="text-xs font-sans text-slate-400 ml-2">({meta?.infinitief || 'infinitief'})</span>
                    </span>
                )}
            </div>
        </div>
    );

    // Helper voor Stap 3 Zinnen (Uniforme opmaak)
    const renderStep3Sentence = (item: ExerciseItem, index: number, isUpperGroup: boolean) => {
        const originalText = item.opdracht || "";
        const targetWord = item.woord || "";
        
        // Component voor de invul-lijn
        const GapLine = () => (
            <span className="inline-block border-b-2 border-dotted border-slate-400 min-w-[120px] mx-1 h-[1em] align-baseline"></span>
        );

        let content;

        if (isUpperGroup) {
            // BOVENBOUW: Zin tonen + Schrijflijn eronder
            content = (
                <div className="w-full">
                    <div className="text-base text-slate-800 font-medium font-sans mb-3 leading-relaxed">
                        {originalText}
                    </div>
                    <div className="writing-line relative border-b border-slate-300 h-6 print:h-6 w-full"></div>
                </div>
            );
        } else {
            // ONDER/MIDDENBOUW: Zin met gaten (inline)
            const splitRegex = new RegExp(`(\\.\\.\\.|\\b${targetWord}\\b)`, 'gi');
            const parts = originalText.split(splitRegex);

            content = (
                <div className="text-lg text-slate-800 font-sans leading-loose">
                    {parts.map((part, i) => {
                        if (part === '...' || part.toLowerCase() === targetWord.toLowerCase()) {
                            return <GapLine key={i} />;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
            );
        }

        return (
            <div key={index} className="flex gap-4 mb-6 break-inside-avoid items-start">
                <div className="text-slate-400 font-bold text-sm min-w-[1.5rem] text-right pt-1.5">
                    {index + 1}.
                </div>
                <div className="flex-1">
                    {content}
                </div>
                <div className="w-5 h-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0 mt-1.5 print:w-4 print:h-4 print:text-[8px]">
                    {item.categorie}
                </div>
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

    const oef = localData.oefeningen;
    const gr = localData.group;

    if (!oef) {
        ensureExercises();
        return null;
    }

    const sorteerOefening = oef.sorteer_oefening;
    const sorteerCategories = sorteerOefening?.categorieen;

    const stap1Items = sorteerOefening?.woorden || [];
    const stap2Items = oef.stap2_oefening || oef.transformatie || [];
    const stap3Items = (oef.stap3_oefening || oef.context || []).slice(0, 10);

    const groupedStep2 = stap2Items.reduce((acc, item) => {
        let key = item.categorie ? item.categorie.toString() : "overig";
        if (key === "overig") key = item.opdracht || "Vul in";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, ExerciseItem[]>);

    let itemCounterStap2 = 1;
    
    const isUpperGroup = ['7', '8', '7/8'].includes(gr);
    const uniqueStep3Cats = Array.from(new Set(stap3Items.map(i => i.categorie)));
    
    let step3MainInstruction = "";
    if (isUpperGroup) {
        step3MainInstruction = "Lees de zinnen. Haal de fout eruit of vervoeg het werkwoord.";
    } else {
        if (uniqueStep3Cats.length === 1) {
            const ruleId = uniqueStep3Cats[0];
            const rule = SPELLING_REGELS.find(r => r.id === ruleId);
            step3MainInstruction = rule?.stap3?.instructie || "Lees de zin en vul het woord in.";
        } else {
            step3MainInstruction = "Lees de zin. Kijk goed en vul het ontbrekende woord in.";
        }
    }

    return (
        <PrintLayout title={localData.title} group={localData.group} onClose={onClose}>
            {/* --- PAGINA 1: WOORDEN, SORTEREN, ANALYSEREN --- */}
            
            <div className="mb-6 print:mb-4 text-center">
                <div className="inline-block px-6 py-3 print:px-4 print:py-2 bg-blue-50/50 border border-blue-200 rounded-2xl relative shadow-sm max-w-2xl print:bg-white print:border-slate-300 print:rounded-lg">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md print:hidden">
                        Woordenwolk
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center print:gap-x-4 print:gap-y-1">
                        {shuffledWords.map((w, i) => (
                            <span key={i} className="font-bold text-lg text-slate-800 print:text-base">
                                {w.woord}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* STAP 1 */}
            <div className="exercise-block mb-8 print:mb-4 bg-white relative print:break-inside-avoid">
                <div className="flex items-center gap-3 mb-4 mt-6 print:mt-0 print:mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md text-sm print:w-6 print:h-6 print:text-xs">1</div>
                    <h3 className="font-bold text-xl text-slate-800 print:text-lg">
                        {sorteerCategories && sorteerCategories.length > 1 ? "Kijken & Sorteren" : "Kijken & Schrijven"}
                    </h3>
                </div>
                <div className="text-sm text-slate-600 mb-6 print:mb-2 italic">
                    Opdracht: {getStep1InstructionText(sorteerCategories?.[0] || 1)}
                </div>

                {sorteerCategories && sorteerCategories.length > 1 ? (
                    <div className="flex border border-slate-300 rounded-xl overflow-hidden min-h-[250px] print:min-h-[180px] shadow-sm">
                        {(sorteerCategories as number[]).map((catId: number, colIndex: number) => {
                            const exampleItem = localData.woordenlijst.find(w => w.categorie === catId);
                            return (
                                <div key={colIndex} className="flex-1 flex flex-col border-r border-slate-300 last:border-r-0">
                                    <div className="bg-slate-50 p-2 border-b border-slate-300 text-center print:p-1">
                                        <div className="inline-flex items-center justify-center px-2 py-1 bg-white border border-blue-600 rounded-lg text-blue-600 text-xs font-bold gap-1 shadow-sm">
                                            <span>{catId}</span>
                                            <span className="uppercase tracking-tighter text-[9px] print:hidden">{CATEGORIES[catId]?.substring(0, 8)}..</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white p-4 space-y-6 print:space-y-5 print:p-2">
                                        {[...Array(5)].map((_, idx) => (
                                            <div key={idx} className="border-b border-slate-200 h-4 relative">
                                                {idx === 0 && exampleItem && (
                                                    <span className="absolute bottom-0 left-0 text-slate-400 font-handwriting text-xl">
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
                    <div className="columns-3 gap-8">
                         {stap1Items.slice(0, 15).map((item: ExerciseItem, i: number) => (
                            <div key={i} className="flex items-end gap-2 break-inside-avoid mb-4 print:mb-2">
                                 <span className="text-slate-400 font-bold text-xs w-4">{i+1}.</span>
                                 <div className="flex-1 border-b border-slate-300 h-6 relative">
                                    {i === 0 && (
                                        <span className="absolute bottom-0 left-0 text-slate-400 font-handwriting text-xl">
                                            <DidacticStyledWord word={item.woord} catId={item.categorie} metadata={item.metadata} />
                                        </span>
                                    )}
                                 </div>
                            </div>
                         ))}
                    </div>
                )}
            </div>

            {/* STAP 2 */}
            <div className="exercise-block bg-white relative print:break-inside-auto">
                <div className="flex items-center gap-3 mb-4 mt-6 print:mt-2 print:mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md text-sm print:w-6 print:h-6 print:text-xs">2</div>
                    <h3 className="font-bold text-xl text-slate-800 print:text-lg">
                         Denken & Analyseren
                    </h3>
                </div>

                {Object.entries(groupedStep2).map(([groupId, groupItems]: [string, ExerciseItem[]], groupIdx) => {
                    const instruction = groupItems[0]?.opdracht || "Vul in";
                    
                    return (
                        <div key={groupIdx} className="mb-8 last:mb-0 print:mb-4">
                            <div className="text-sm text-slate-600 mb-4 print:mb-2 italic bg-slate-50 p-2 rounded border border-slate-100 inline-block print:p-1 print:bg-transparent print:border-none print:text-xs">
                                <strong>Opdracht:</strong> {instruction}
                            </div>
                            
                            <div className="columns-2 gap-12 print:gap-8">
                                {groupItems.map((item: ExerciseItem, idx: number) => {
                                    const currentIndex = itemCounterStap2++;
                                    const fullWord = item.woord || "";
                                    const isExample = idx === 0;
                                    
                                    let visualContent = <></>;

                                    if (item.type === 'werkwoord') {
                                        visualContent = renderVerbSchema(fullWord, item.metadata, isExample);
                                    } else if (item.type === 'klankgroep' || item.type === 'splits') {
                                        const syll = item.metadata?.lettergrepen || fullWord.split('').join('-');
                                        visualContent = renderSyllableBlocks(fullWord, syll, isExample);
                                    } else {
                                        const prefix = item.metadata?.prefix || "";
                                        const suffix = item.metadata?.suffix || "";
                                        const choices = item.metadata?.choices || [];

                                        if (isExample) {
                                            visualContent = (
                                                <div className="flex items-baseline gap-0.5 text-lg font-handwriting text-slate-400">
                                                    <span>{fullWord}</span>
                                                    {choices.length > 0 && <span className="text-sm ml-2 font-sans">({choices.join('/')})</span>}
                                                    {item.type === 'langermaak' && <span className="text-sm ml-2 font-sans">(d/t)</span>}
                                                </div>
                                            );
                                        } else {
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
                                                </div>
                                            );
                                        }
                                    }

                                    return (
                                        <div key={item.id} className="flex items-end gap-3 break-inside-avoid mb-5 print:mb-2">
                                            <span className="text-slate-400 font-bold text-xs w-5 mb-1 text-right">{currentIndex}.</span>
                                            <div className="flex-1 overflow-hidden">
                                                {item.type === 'werkwoord' && <div className="font-bold text-sm text-slate-700 mb-0.5 font-sans">{fullWord}</div>}
                                                {visualContent}
                                            </div>
                                            <div className="w-5 h-5 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0 mb-1 ml-1 print:w-4 print:h-4 print:text-[8px]">
                                                {item.categorie}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* STAP 3 */}
            <div className="force-page-break">
                <div className="exercise-block bg-white relative">
                    <div className="flex items-center gap-3 mb-4 mt-6 print:mt-4">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md text-sm print:w-6 print:h-6 print:text-xs">3</div>
                        <h3 className="font-bold text-xl text-slate-800 print:text-lg">Toepassen</h3>
                    </div>
                    
                    <div className="text-sm text-slate-600 mb-8 italic bg-orange-50 p-3 rounded-lg border border-orange-100 print:mb-4 print:p-2">
                        <strong>Opdracht:</strong> {step3MainInstruction}
                    </div>

                    <div className="space-y-4 print:space-y-2">
                        {stap3Items.map((item, i) => renderStep3Sentence(item, i, isUpperGroup))}
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-[9px] text-slate-400 uppercase tracking-widest">
                Staalmaatje © 2024
            </div>
        </PrintLayout>
    );
};

export default WorksheetPlayer;