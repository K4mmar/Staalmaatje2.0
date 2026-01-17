import React, { useState, useEffect, useRef } from 'react';
import { GROUP_CATEGORIES, CATEGORIES } from '../constants';
import { COLORS, WordItem } from '../types';
import { generateMixedWordList } from '../services/geminiService';
import { useToast } from './Toast';

interface WordGeneratorProps {
    initialGroup?: string;
}

const LogViewer: React.FC<{ logs: string[] }> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs md:text-sm h-64 overflow-y-auto border border-slate-700 shadow-inner">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2 sticky top-0 bg-slate-900">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-400 ml-2">ai-process-console — zsh</span>
            </div>
            <div className="space-y-1">
                {logs.map((log, i) => {
                    let color = "text-slate-300";
                    let icon = ">";
                    if (log.includes("Fase 1")) { color = "text-blue-400"; icon = "⚡"; }
                    if (log.includes("Fase 2")) { color = "text-yellow-400"; icon = "🛡️"; }
                    if (log.includes("Fase 3")) { color = "text-purple-400"; icon = "⚖️"; }
                    if (log.includes("Fase 4")) { color = "text-pink-400"; icon = "🎨"; }
                    if (log.includes("✅")) { color = "text-green-400"; icon = ""; }
                    if (log.includes("❌") || log.includes("⚠️")) { color = "text-red-400"; icon = ""; }
                    if (log.includes("🚀")) { color = "text-white font-bold"; icon = ""; }

                    return (
                        <div key={i} className={`${color} break-words`}>
                            <span className="opacity-50 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                            <span className="mr-2">{icon}</span>
                            {log}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

const WordGenerator: React.FC<WordGeneratorProps> = ({ initialGroup = '4' }) => {
    const [group, setGroup] = useState(initialGroup);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [words, setWords] = useState<WordItem[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState<number>(0);
    const [isDailyLimit, setIsDailyLimit] = useState(false);
    
    const [logs, setLogs] = useState<string[]>([]);
    const { showToast } = useToast();

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
        setLogs([]);

        try {
            const logUpdate = (msg: string) => {
                setLogs(prev => [...prev, msg]);
            };

            const validWords = await generateMixedWordList([selectedCategory], group, logUpdate);
            if (validWords.length === 0) throw new Error("Geen woorden gevonden of limiet bereikt.");
            setWords(validWords);
            showToast("Generatie succesvol!", "success");
        } catch (e: any) {
             if (e.message === 'QUOTA_DAILY') {
                setIsDailyLimit(true);
                setError("Daglimiet bereikt (1500 verzoeken). Reset morgenochtend.");
                showToast("Daglimiet bereikt", "error");
            } else if (e.message === 'QUOTA_LIMIT') {
                setCooldown(60);
                setError("Snelheidslimiet bereikt. Wacht 60 seconden.");
                showToast("Even geduld a.u.b.", "error");
            } else {
                setError(e.message || "Kon geen woorden genereren.");
                setLogs(prev => [...prev, `❌ CRITICAL ERROR: ${e.message}`]);
                showToast("Er ging iets mis", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const text = words.map(w => w.woord).join('\n');
        navigator.clipboard.writeText(text);
        showToast("Woorden gekopieerd naar klembord", "success");
    };
    
    const copyFullJson = () => {
        const text = JSON.stringify(words, null, 2);
        navigator.clipboard.writeText(text);
        showToast("JSON data gekopieerd", "success");
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg max-w-6xl mx-auto">
            <div className="mb-6 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-flask text-purple-600"></i>
                    Woorden & Zinnen Studio
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Genereer gelaagde content: Woord + Dicteezin + Contextzin, afgestemd op het niveau.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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
                            <><i className="fas fa-play"></i> Genereer Content</>
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
                <div className="lg:col-span-3 flex flex-col gap-4">
                    
                    {(loading || logs.length > 0) && (
                        <LogViewer logs={logs} />
                    )}

                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-0 overflow-hidden relative min-h-[500px] flex flex-col">
                        {words.length > 0 ? (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center p-4 bg-white border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800">Resultaat ({words.length})</h3>
                                    <div className="flex gap-2">
                                        <button onClick={copyToClipboard} className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600">
                                            <i className="fas fa-copy mr-1"></i> Kopieer
                                        </button>
                                        <button onClick={copyFullJson} className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200">
                                            <i className="fas fa-code mr-1"></i> JSON
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                                    {words.map((w, idx) => (
                                        <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-xs">
                                                        {w.categorie}
                                                    </div>
                                                    <span className="font-bold text-lg text-slate-800">{w.woord}</span>
                                                    {w.lettergrepen && <span className="text-xs text-slate-400 font-mono bg-slate-50 px-1 rounded">{w.lettergrepen}</span>}
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono">
                                                    ID: {idx+1}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-blue-50/50 p-2 rounded">
                                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Dicteezin (Leerkracht)</div>
                                                    <p className="text-sm text-slate-700 italic">"{w.dicteeZin}"</p>
                                                </div>
                                                <div className="bg-orange-50/50 p-2 rounded">
                                                    <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Contextzin (Leerling)</div>
                                                    <p className="text-sm text-slate-700">"{w.contextZin}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                                {!loading && (
                                    <>
                                        <i className="fas fa-layer-group text-5xl mb-4 opacity-30"></i>
                                        <p className="font-bold">Nog geen content gegenereerd</p>
                                        <p className="text-sm">Kies een categorie en klik op genereer.</p>
                                    </>
                                )}
                                {loading && (
                                    <div className="flex flex-col items-center">
                                        <i className="fas fa-circle-notch fa-spin text-4xl mb-4 text-purple-500"></i>
                                        <p className="animate-pulse">Check de console hierboven...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WordGenerator;
