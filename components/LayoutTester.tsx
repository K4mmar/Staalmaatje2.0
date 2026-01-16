
import React, { useState } from 'react';
import { MOCK_LAB_DATA } from '../services/mockDataService';
import WorksheetPlayer from './WorksheetPlayer';

interface LayoutTesterProps {
    onBack: () => void;
}

const LayoutTester: React.FC<LayoutTesterProps> = ({ onBack }) => {
    const [previewKey, setPreviewKey] = useState<string | null>(null);
    const [isSingleMode, setIsSingleMode] = useState(false);

    // Data voor de kaarten, met aangepaste kleuren voor lichte modus
    const TEST_CARDS = [
        { id: '4', name: 'Groep 4', icon: 'fa-shapes', color: 'text-orange-600 bg-orange-50 border-orange-100' },
        { id: '5', name: 'Groep 5', icon: 'fa-cogs', color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { id: '6', name: 'Groep 6', icon: 'fa-language', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { id: '7', name: 'Groep 7/8', icon: 'fa-spell-check', color: 'text-purple-600 bg-purple-50 border-purple-100' },
    ];

    if (previewKey) {
        return (
            <WorksheetPlayer 
                data={MOCK_LAB_DATA[previewKey]} 
                initialMode="print" 
                onClose={() => setPreviewKey(null)} 
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <button onClick={onBack} className="text-slate-400 hover:text-slate-800 mb-2 font-bold flex items-center gap-2 transition-colors">
                            <i className="fas fa-arrow-left"></i> Terug naar Dashboard
                        </button>
                        <h1 className="text-3xl font-extrabold text-slate-800">
                            <i className="fas fa-vial text-orange-500 mr-3"></i>
                            Vormgeving Lab
                        </h1>
                        <p className="text-slate-500">Test layouts met realistische data sets (15 woorden).</p>
                    </div>

                    {/* Mode Toggle Control */}
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
                        <button 
                            onClick={() => setIsSingleMode(false)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${!isSingleMode ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <i className="fas fa-layer-group"></i> Mix Variant
                        </button>
                        <button 
                            onClick={() => setIsSingleMode(true)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isSingleMode ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <i className="fas fa-bullseye"></i> Focus Variant
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {TEST_CARDS.map(card => {
                        const key = `${card.id}_${isSingleMode ? 'single' : 'mix'}`;
                        return (
                            <button 
                                key={card.id}
                                onClick={() => setPreviewKey(key)}
                                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all text-left flex flex-col h-full relative overflow-hidden"
                            >
                                <div className={`w-14 h-14 ${card.color} border rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                    <i className={`fas ${card.icon} text-2xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{card.name}</h3>
                                <p className="text-sm text-slate-500 flex-1 leading-relaxed">
                                    {isSingleMode ? 'Focus layout: 1 specifieke regel, 15 woorden, gerichte oefeningen.' : 'Mix layout: 3 categorieën, 15 woorden, sorteer oefeningen.'}
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-orange-600 font-bold text-sm group-hover:gap-3 transition-all">
                                    Open Preview <i className="fas fa-arrow-right"></i>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Info Panel */}
                <div className="mt-12 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-8">
                         <div className="flex-1">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                                <i className="fas fa-check-double text-orange-500"></i>
                                Layout Validatie
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                In dit lab gebruiken we <strong>geoptimaliseerde testdata</strong>. Elk voorbeeld is opgebouwd met exact 15 woorden, precies zoals een echt werkblad in de app.
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Hierdoor kun je exact zien hoe de <strong>paginering</strong>, de <strong>sorteervakken</strong> en de <strong>invullijsten</strong> zich gedragen bij een volledige belasting van de pagina.
                            </p>
                        </div>
                        <div className="w-px bg-slate-100 hidden md:block"></div>
                        <div className="flex-1">
                             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                                <i className="fas fa-print text-blue-500"></i>
                                Print Instructie
                            </h3>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check text-green-500 mt-1"></i>
                                    <span>Controleer of 'Stap 3' altijd op een nieuwe pagina begint.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check text-green-500 mt-1"></i>
                                    <span>Controleer of de sorteervakken bij de Mix-variant hoog genoeg zijn voor 5 woorden.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check text-green-500 mt-1"></i>
                                    <span>Test de leesbaarheid van het handschrift lettertype.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayoutTester;
