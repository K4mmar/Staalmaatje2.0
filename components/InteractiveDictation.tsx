import React, { useState, useRef, useEffect } from 'react';
import { WordItem, COLORS } from '../types';
import { SPELLING_REGELS } from '../constants';
import { speak, cancelSpeech } from '../services/speechService';

interface InteractiveDictationProps {
    words: WordItem[];
    sentences: string[];
    onClose: () => void;
}

const InteractiveDictation: React.FC<InteractiveDictationProps> = ({ words, sentences, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'none' | 'retry' | 'correct' | 'incorrect'>('none');
    const [attempts, setAttempts] = useState(0); 
    const [hintText, setHintText] = useState<string | null>(null);
    const [showSentence, setShowSentence] = useState(false); // Nieuw: Toggle voor zin weergave
    
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialiseer eerste woord
    useEffect(() => {
        speakSentence();
    }, [currentIndex]);

    const speakSentence = () => {
        if (!sentences[currentIndex]) return;
        const currentWord = words[currentIndex].woord;
        const sentence = sentences[currentIndex];
        
        // Spreek logica
        speak(`${sentence}. ... Schrijf op: ${currentWord}.`);
        
        inputRef.current?.focus();
    };

    const getRuleDetails = (catId: number) => {
        return SPELLING_REGELS.find(r => r.id === catId);
    };

    const checkWord = () => {
        const currentWordObj = words[currentIndex];
        const target = currentWordObj.woord.trim().toLowerCase();
        const input = userInput.trim().toLowerCase();
        
        if (input === target) {
            setFeedback('correct');
            speak(`Goed gedaan! ${currentWordObj.woord} is correct.`);
        } else {
            if (attempts === 0) {
                // Eerste fout: geef hint
                const rule = getRuleDetails(currentWordObj.categorie);
                let feedbackMsg = rule ? rule.regel : "Kijk goed naar de regels.";
                if (rule?.versje) feedbackMsg += " (Denk aan het versje!)";
                setHintText(feedbackMsg);
                
                const spokenFeedback = `Niet helemaal. Denk aan de regel: ${rule ? rule.regel : 'Probeer het nog eens'}.`;
                setAttempts(1);
                setFeedback('retry');
                speak(spokenFeedback, false);
                
                // Herhaal instructie
                setTimeout(() => {
                    const sentence = sentences[currentIndex];
                    speak(`Ik lees de zin nog een keer voor. ... ${sentence}. ... Schrijf op: ${currentWordObj.woord}.`, true);
                }, 4000);
                
                inputRef.current?.select();
            } else {
                // Tweede fout: toon antwoord
                setFeedback('incorrect');
                speak(`Helaas. Je schreef ${userInput}, maar het moet zijn: ${target}.`);
            }
        }
    };

    const nextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserInput('');
            setFeedback('none');
            setAttempts(0); 
            setHintText(null); 
            setShowSentence(false);
        } else {
            speak("Dat was het dictee! Goed gedaan.");
            alert("Dictee klaar!");
            onClose();
        }
    };

    const currentWordObj = words[currentIndex];
    const progress = ((currentIndex + 1) / words.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <button onClick={() => { cancelSpeech(); onClose(); }} className="mb-6 text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2">
                <i className="fas fa-times"></i> Stoppen
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-slate-100 h-2 w-full">
                    <div className="bg-purple-600 h-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>

                <div className="p-8 text-center relative">
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">
                        Woord {currentIndex + 1} van {words.length}
                    </div>

                    {/* Audio Knop */}
                    <div className="mb-6 relative">
                         <button 
                            onClick={speakSentence}
                            className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-md flex items-center justify-center mx-auto text-4xl"
                         >
                             <i className="fas fa-volume-up"></i>
                         </button>
                         <p className="mt-2 text-sm text-purple-600 font-bold cursor-pointer hover:underline" onClick={speakSentence}>
                            Klik om te herhalen
                         </p>
                    </div>

                    {/* Zin Weergave (Op verzoek) */}
                    <div className="mb-8 min-h-[3rem]">
                        {showSentence ? (
                            <p className="text-lg text-slate-700 italic animate-fade-in">
                                "{sentences[currentIndex]?.replace(new RegExp(currentWordObj.woord, 'gi'), '...')}"
                            </p>
                        ) : (
                            <button 
                                onClick={() => setShowSentence(true)}
                                className="text-slate-400 text-sm border border-slate-200 rounded-full px-4 py-1 hover:bg-slate-50 hover:text-slate-600"
                            >
                                <i className="far fa-eye mr-2"></i> Toon zin
                            </button>
                        )}
                    </div>

                    {/* Input Area */}
                    {feedback === 'incorrect' ? (
                        <div className="mb-8 bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-red-500 font-medium mb-1">Je schreef: <span className="line-through">{userInput}</span></p>
                            <p className="text-slate-800 font-bold text-xl">Het juiste woord: <span className="text-green-600">{currentWordObj.woord}</span></p>
                            <button onClick={nextWord} className="mt-4 px-8 py-3 rounded-xl font-bold bg-slate-800 text-white">Volgende</button>
                        </div>
                    ) : feedback === 'correct' ? (
                        <div className="mb-8 bg-green-50 p-6 rounded-xl border border-green-100 animate-bounce-subtle">
                             <div className="text-green-500 text-5xl mb-2"><i className="fas fa-check-circle"></i></div>
                             <div className="text-green-700 text-2xl font-bold mb-6">Heel goed!</div>
                             <button onClick={nextWord} className="px-8 py-3 rounded-xl font-bold bg-green-500 text-white shadow-lg hover:bg-green-600">
                                 Volgende Woord <i className="fas fa-arrow-right ml-2"></i>
                             </button>
                        </div>
                    ) : (
                        <div className="max-w-xs mx-auto">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && checkWord()}
                                className={`w-full text-center text-2xl font-bold p-4 border-b-4 outline-none transition-colors ${feedback === 'retry' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 focus:border-purple-500'}`}
                                placeholder="..."
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                            />
                            
                            {feedback === 'retry' && (
                                <div className="mt-4 text-orange-600 bg-orange-50 p-3 rounded-lg text-sm font-medium border border-orange-100">
                                    <i className="fas fa-exclamation-circle mr-1"></i> {hintText}
                                </div>
                            )}

                            <button 
                                onClick={checkWord} 
                                className={`mt-6 w-full font-bold py-3 rounded-xl text-white transition-all shadow-md ${feedback === 'retry' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                {feedback === 'retry' ? 'Probeer opnieuw' : 'Controleer'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractiveDictation;