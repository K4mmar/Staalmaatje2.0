import React from 'react';
import { WordItem } from '../types';
import { SPELLING_REGELS } from '../constants';
import PrintLayout from './PrintLayout';

interface PrintableDictationProps {
    words: WordItem[];
    sentences: string[];
    group: string;
    onClose: () => void;
}

const PrintableDictation: React.FC<PrintableDictationProps> = ({ words, sentences, group, onClose }) => {
    
    const getRuleDetails = (catId: number) => {
        return SPELLING_REGELS.find(r => r.id === catId);
    };

    const instructionContent = (
        <>
            <h3 className="font-bold text-black mb-1 uppercase text-xs tracking-wider">Instructie voor voorlezer:</h3>
            <ul className="list-disc list-inside text-sm text-black space-y-1">
                <li>Lees de zin rustig voor.</li>
                <li>Herhaal het <strong>dikgedrukte</strong> woord.</li>
                <li>Bij een fout: Bespreek de regel die eronder staat.</li>
            </ul>
        </>
    );

    return (
        <PrintLayout 
            title="Dictee" 
            group={group} 
            instruction={instructionContent} 
            onClose={onClose}
        >
            {words.map((w, i) => {
                const rule = getRuleDetails(w.categorie);
                return (
                    <div key={i} className="border-b border-gray-300 pb-3 mb-2 break-inside-avoid">
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
        </PrintLayout>
    );
};

export default PrintableDictation;