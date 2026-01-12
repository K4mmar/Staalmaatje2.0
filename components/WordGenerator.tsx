import React, { useState, useEffect } from 'react';
import { GROUP_CATEGORIES, CATEGORIES, SPELLING_REGELS } from '../constants';
import { COLORS } from '../types';
import { generateDidacticWordList } from '../services/geminiService';

interface WordGeneratorProps {
    initialGroup?: string;
}

const WordGenerator: React.FC<WordGeneratorProps> = ({ initialGroup = '4' }) => {
    const [group, setGroup] = useState(initialGroup);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [words, setWords] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState<number>(0);
    const [isDailyLimit, setIsDailyLimit] = useState(false);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(p => p - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleGenerate = async () => {
        if (!selectedCategory || cooldown > 0 || isDailyLimit) return;
        setLoading(true);
        setError(null);
        setWords([]);

        try {
            const validWords = await generateDidacticWordList(selectedCategory, group);
            if (validWords.length === 0) throw new Error("Geen woorden gevonden of limiet bereikt.");
            setWords(validWords);
        } catch (e: any) {
             if (e.message === 'QUOTA_DAILY') {
                setIsDailyLimit(true);
                setError("Daglimiet bereikt (1500 verzoeken). Reset morgenochtend.");
            } else if (e.message === 'QUOTA_LIMIT') {
                setCooldown(60);
                setError("Snelheidslimiet bereikt. Wacht 60 seconden.");
            } else {
                setError(e.message || "Kon geen woorden genereren.");
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const text = words.join('\n');
        navigator.clipboard.writeText(text);
        alert("Woorden gekopieerd naar klembord!");
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <div className="mb-6 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-flask text-purple-600"></i>
                    Woordengenerator (OpenTaal Validated)
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Controls */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Groep</label>
                        <select 
                            value={group} 
                            onChange={(e) => { setGroup(e.target.value); setSelectedCategory(null); }}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {['4', '5', '6', '7/8'].map(g => (
                                <option key={g} value={g === '7/8' ? '7' : g}>Groep {g}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Categorie</label>
                        <select 
                            value={selectedCategory || ''} 
                            onChange={(e) => setSelectedCategory(Number(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">Kies een categorie...</option>
                            {(GROUP_CATEGORIES[group] || []).map(catId => (
                                <option key={catId} value={catId}>{catId}. {CATEGORIES[catId]}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!selectedCategory || loading || cooldown > 0 || isDailyLimit}
                        className={`w-full font-bold py-2 px-4 rounded-lg text-white transition-all shadow-md flex items-center justify-center gap-2 ${ (cooldown > 0 || isDailyLimit) ? 'bg-slate-400 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: (cooldown > 0 || isDailyLimit) ? undefined : COLORS.orange }}
                    >
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin"></i> Bezig...</>
                        ) : cooldown > 0 ? (
                            <><i className="fas fa-clock"></i> {cooldown}s</>
                        ) : isDailyLimit ? (
                             <><i className="fas fa-ban"></i> Limiet</>
                        ) : (
                            <><i className="fas fa-play"></i> Genereer Lijst</>
                        )}
                    </button>
                    
                    {isDailyLimit && (
                        <div className="bg-red-50 text-red-600 p-2 rounded text-xs">
                            Daglimiet bereikt. Morgen weer!
                        </div>
                    )}
                    {error && !isDailyLimit && <p className="text-red-500 text-sm">{error}</p>}
                </div>

                {/* Info Panel */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-4 relative">
                     {words.length > 0 ? (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-slate-800">Resultaat ({words.length})</h3>
                                <button onClick={copyToClipboard} className="text-xs text-slate-500 hover:text-purple-600">
                                    <i className="fas fa-copy"></i> Kopiëren
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {words.map((w, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-sm">
                                        <div className="w-5 h-5 rounded-full flex-shrink-0 bg-green-100 text-green-700 font-bold flex items-center justify-center text-xs">
                                            {selectedCategory}
                                        </div>
                                        <span className="text-slate-800 font-medium">
                                            {w}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                     ) : (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[200px]">
                            <i className="fas fa-list-ol text-4xl mb-2 opacity-30"></i>
                            <p>Selecteer een categorie en klik op genereer.</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default WordGenerator;