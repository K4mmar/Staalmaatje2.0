
import React, { useState } from 'react';
import { MOCK_LAB_DATA } from '../services/mockDataService';
import WorksheetPlayer from './WorksheetPlayer';

interface LayoutTesterProps {
    onBack: () => void;
}

const LayoutTester: React.FC<LayoutTesterProps> = ({ onBack }) => {
    const [previewKey, setPreviewKey] = useState<string | null>(null);
    const [isSingleMode, setIsSingleMode] = useState(false);

    const TEST_CARDS = [
        { id: '4', name: 'Groep 4', icon: 'fa-shapes', color: 'bg-orange-500' },
        { id: '5', name: 'Groep 5', icon: 'fa-cogs', color: 'bg-blue-500' },
        { id: '6', name: 'Groep 6', icon: 'fa-language', color: 'bg-indigo-500' },
        { id: '7', name: 'Groep 7/8', icon: 'fa-spell-check', color: 'bg-purple-500' },
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
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button onClick={onBack} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors">
                            <i className="fas fa-arrow-left"></i> Terug naar Dashboard
                        </button>
                        <h1 className="text-4xl font-black">Vormgeving <span className="text-orange-500">Lab</span></h1>
                        <p className="text-slate-400 mt-2">Kies een groep en een variant om de layouts te testen met realistische 15-woordenlijsten.</p>
                    </div>

                    <div className="bg-slate-800 p-1.5 rounded-2xl flex border border-slate-700">
                        <button 
                            onClick={() => setIsSingleMode(false)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${!isSingleMode ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <i className="fas fa-layer-group mr-2"></i> Mix Variant (3 Cat)
                        </button>
                        <button 
                            onClick={() => setIsSingleMode(true)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${isSingleMode ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <i className="fas fa-bullseye mr-2"></i> Focus (1 Cat)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TEST_CARDS.map(card => {
                        const key = `${card.id}_${isSingleMode ? 'single' : 'mix'}`;
                        return (
                            <button 
                                key={card.id}
                                onClick={() => setPreviewKey(key)}
                                className="group bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-white/20 hover:shadow-2xl transition-all text-left flex flex-col h-full"
                            >
                                <div className={`w-14 h-14 ${card.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <i className={`fas ${card.icon} text-2xl text-white`}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{card.name}</h3>
                                <p className="text-sm text-slate-400 flex-1">
                                    {isSingleMode ? 'Focus op één spellingregel (15 woorden).' : 'Mix van 3 verschillende categorieën (15 woorden).'}
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
                                    Bekijk {isSingleMode ? 'focus' : 'mix'} <i className="fas fa-arrow-right"></i>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-16 bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-orange-500">
                        <i className="fas fa-check-double"></i>
                        Professionele Layout Check
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-400 leading-relaxed text-sm">
                        <p>
                            In dit lab gebruiken we <strong>geoptimaliseerde testdata</strong>. Elk voorbeeld is opgebouwd met exact 15 woorden, precies zoals een echt werkblad in de app.
                        </p>
                        <p>
                            Hierdoor kun je exact zien hoe de <strong>paginering</strong>, de <strong>sorteervakken</strong> en de <strong>invullijsten</strong> zich gedragen bij een volledige belasting van de pagina.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayoutTester;
