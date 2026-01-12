import React, { useState } from 'react';
import { WordItem } from '../types';
import { generateDictationSentences } from '../services/geminiService';
import InteractiveDictation from './InteractiveDictation';
import PrintableDictation from './PrintableDictation';

interface DictationCardProps {
    words: WordItem[];
    group: string;
    onBack: () => void;
    onSaveToLibrary: (sentences: string[]) => void;
    existingSentences?: string[]; 
}

type ViewMode = 'setup' | 'hub' | 'interactive' | 'print';

const DictationCard: React.FC<DictationCardProps> = ({ words, group, onBack, onSaveToLibrary, existingSentences }) => {
    const [view, setView] = useState<ViewMode>(existingSentences ? 'hub' : 'setup');
    const [sentences, setSentences] = useState<string[]>(existingSentences || []);
    const [isLoading, setIsLoading] = useState(false);

    // Genereer zinnen via de centrale service
    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const s = await generateDictationSentences(words, group);
            setSentences(s);
            onSaveToLibrary(s);
            setView('hub');
        } catch (e) {
            alert("Kon geen zinnen genereren. Controleer je internetverbinding.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER LOGIC ---

    if (view === 'interactive') {
        return (
            <InteractiveDictation 
                words={words} 
                sentences={sentences} 
                onClose={() => setView('hub')} 
            />
        );
    }

    if (view === 'print') {
        return (
            <PrintableDictation 
                words={words} 
                sentences={sentences} 
                group={group}
                onClose={() => setView('hub')} 
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {view === 'setup' && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                        <h2 className="text-2xl font-bold"><i className="fas fa-microphone-alt mr-2"></i> Dictee Voorbereiden</h2>
                        <button onClick={onBack} className="text-blue-100 hover:text-white"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fas fa-magic text-4xl text-blue-500"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Woordenlijst is klaar!</h3>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                            De AI kan nu passende dicteezinnen schrijven voor deze {words.length} woorden, afgestemd op Groep {group}.
                        </p>
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all flex items-center gap-3 mx-auto"
                        >
                            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                            {isLoading ? 'Zinnen Schrijven...' : 'Genereer Dictee'}
                        </button>
                    </div>
                </div>
            )}

            {view === 'hub' && (
                <div>
                     <button onClick={onBack} className="mb-4 text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2">
                        <i className="fas fa-arrow-left"></i> Terug naar Dashboard
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Woordenlijst Zijbalk */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
                            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Woordenlijst</h3>
                            <ul className="space-y-2">
                                {words.map((w, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{i+1}</span>
                                        <span className="font-medium text-slate-800">{w.woord}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Hoofd Keuze Menu */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Hoe wil je het dictee afnemen?</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setView('print')}
                                        className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <i className="fas fa-print text-xl"></i>
                                        </div>
                                        <h4 className="font-bold text-lg text-slate-800">Printen</h4>
                                        <p className="text-sm text-slate-500 mt-1">Print een formulier voor de voorlezer.</p>
                                    </button>

                                    <button 
                                        onClick={() => setView('interactive')}
                                        className="p-6 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left"
                                    >
                                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <i className="fas fa-laptop text-xl"></i>
                                        </div>
                                        <h4 className="font-bold text-lg text-slate-800">Digitaal</h4>
                                        <p className="text-sm text-slate-500 mt-1">Interactief dictee met spraak.</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DictationCard;