import React, { useEffect } from 'react';
import { WordItem, COLORS } from '../types';
import { SPELLING_REGELS } from '../constants';

interface PrintableDictationProps {
    words: WordItem[];
    sentences: string[];
    group: string;
    onClose: () => void;
}

const PrintableDictation: React.FC<PrintableDictationProps> = ({ words, sentences, group, onClose }) => {
    
    // Automatisch printscherm openen bij laden
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    const getRuleDetails = (catId: number) => {
        return SPELLING_REGELS.find(r => r.id === catId);
    };

    return (
        <div className="fixed inset-0 bg-white z-[9999] overflow-auto animate-fade-in">
            {/* Navigatiebalk voor scherm (wordt verborgen bij printen) */}
            <div className="no-print bg-slate-800 text-white p-4 flex justify-between items-center sticky top-0 shadow-lg">
                <div className="font-bold text-lg">
                    <i className="fas fa-print mr-2"></i> Afdrukvoorbeeld
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => window.print()} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        <i className="fas fa-print"></i> Print
                    </button>
                    <button 
                        onClick={onClose} 
                        className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        <i className="fas fa-times"></i> Sluiten
                    </button>
                </div>
            </div>

            {/* Het daadwerkelijke A4 formulier */}
            <div className="max-w-[21cm] mx-auto bg-white p-8 md:p-12 min-h-screen">
                <div className="border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-black mb-2">Dictee Groep {group}</h1>
                    <div className="flex justify-between text-black font-medium text-sm">
                        <span>Datum: {new Date().toLocaleDateString()}</span>
                        <span>Naam: _______________________</span>
                    </div>
                </div>

                <div className="mb-6 p-4 border border-black rounded-lg">
                    <h3 className="font-bold text-black mb-1 uppercase text-xs tracking-wider">Instructie voor voorlezer:</h3>
                    <ul className="list-disc list-inside text-sm text-black space-y-1">
                        <li>Lees de zin rustig voor.</li>
                        <li>Herhaal het <strong>dikgedrukte</strong> woord.</li>
                        <li>Bij een fout: Bespreek de regel die eronder staat.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    {words.map((w, i) => {
                        const rule = getRuleDetails(w.categorie);
                        return (
                            <div key={i} className="border-b border-gray-300 pb-3 break-inside-avoid">
                                <div className="flex gap-4">
                                    <div className="font-bold text-black w-6 flex-shrink-0 pt-1">
                                        {i + 1}.
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-base text-black leading-relaxed mb-2">
                                            {sentences[i] ? (
                                                <span dangerouslySetInnerHTML={{ 
                                                    __html: sentences[i].replace(new RegExp(w.woord, 'gi'), `<strong>${w.woord}</strong>`) 
                                                }} />
                                            ) : (
                                                <span>Schrijf op: <strong>{w.woord}</strong></span>
                                            )}
                                        </div>
                                        {rule && (
                                            <div className="text-xs text-black mt-1 pl-2 border-l-2 border-black">
                                                <span className="font-bold mr-2">Regel {rule.id} ({rule.naam}):</span>
                                                <span>{rule.regel}</span>
                                                {rule.versje && <div className="mt-1 italic opacity-80 whitespace-pre-line">"{rule.versje.split('\n')[0]}..."</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PrintableDictation;