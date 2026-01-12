export const speak = (text: string, queue: boolean = false) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (!queue) window.speechSynthesis.cancel();
        
        // Korte vertraging om te zorgen dat eerdere audio stopt
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'nl-NL';
            utterance.rate = 0.85; // Iets rustiger voor dictee
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }, 50);
    }
};

export const cancelSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
};