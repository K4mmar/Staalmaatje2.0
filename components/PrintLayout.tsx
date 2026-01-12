import React, { useEffect } from 'react';

interface PrintLayoutProps {
    title: string;
    group: string;
    children: React.ReactNode;
    instruction?: React.ReactNode;
    onClose: () => void;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ title, group, children, instruction, onClose }) => {
    
    useEffect(() => {
        // Kleine vertraging om zeker te weten dat de DOM klaar is voor de print dialoog
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-800/90 z-[9999] overflow-y-auto animate-fade-in print:bg-white print:inset-auto print:static print:overflow-visible print:h-auto">
            {/* Navigatiebalk (Niet zichtbaar op print) */}
            <div className="no-print fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-50">
                <div className="font-bold text-lg flex items-center gap-2">
                    <i className="fas fa-print"></i> Afdrukvoorbeeld
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => window.print()} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <i className="fas fa-print"></i> Print
                    </button>
                    <button 
                        onClick={onClose} 
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <i className="fas fa-times"></i> Sluiten
                    </button>
                </div>
            </div>

            {/* Het A4 Papier */}
            <div className="print-page-container mx-auto bg-white min-h-screen w-full max-w-[21cm] md:my-20 p-8 md:p-12 shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-full">
                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-6 print:mb-4">
                    <h1 className="text-3xl font-bold text-black mb-2">{title}</h1>
                    <div className="flex justify-between text-black font-medium text-sm">
                        <span>Groep: {group}</span>
                        <span>Datum: {new Date().toLocaleDateString('nl-NL')}</span>
                        <span>Naam: _______________________</span>
                    </div>
                </div>

                {/* Instructie Blok (Optioneel) */}
                {instruction && (
                    <div className="mb-6 p-4 border border-black rounded-lg bg-slate-50 print:bg-transparent">
                        {instruction}
                    </div>
                )}

                {/* De Oefeningen Content */}
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PrintLayout;