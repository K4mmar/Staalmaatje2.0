import React, { useState } from 'react';
import { SPELLING_REGELS, GRAMMATICA_REGELS } from '../constants';

interface InfoHandboekProps {
    onBack: () => void;
}

type Tab = 'categorie' | 'grammatica' | 'raps';

const InfoHandboek: React.FC<InfoHandboekProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('categorie');
    const [searchTerm, setSearchTerm] = useState('');

    const renderCategories = () => {
        const filtered = SPELLING_REGELS.filter(r => 
            r.naam.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.regel.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filtered.map(rule => (
                    <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700">{rule.naam}</span>
                            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm border border-slate-300">
                                {rule.id}
                            </span>
                        </div>
                        <div className="p-5">
                            <p className="font-medium text-slate-800 mb-2">{rule.regel}</p>
                            {rule.uitgebreide_uitleg && (
                                <p className="text-sm text-slate-600 mb-4 bg-blue-50 p-2 rounded">{rule.uitgebreide_uitleg}</p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-center bg-green-50 p-2 rounded border border-green-100">
                                    <i className="fas fa-check text-green-500 mb-1"></i><br/>
                                    <strong>{rule.voorbeeld}</strong>
                                </div>
                                <div className="text-center bg-red-50 p-2 rounded border border-red-100">
                                    <i className="fas fa-times text-red-500 mb-1"></i><br/>
                                    <span className="line-through text-slate-500">{rule.fout}</span>
                                </div>
                            </div>

                            {rule.versje && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-xs font-bold text-purple-500 uppercase">Versje:</span>
                                    <p className="text-xs italic text-slate-600 whitespace-pre-line mt-1">"{rule.versje}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderGrammar = () => {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                {['woordsoort', 'zinsdeel', 'leesteken'].map((cat) => (
                    <div key={cat} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-xl font-bold text-slate-800 capitalize mb-4 border-b pb-2">{cat}en</h3>
                        <div className="grid gap-4">
                            {GRAMMATICA_REGELS.filter(r => r.categorie === cat).map((rule, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-slate-50 rounded-lg">
                                    <span className="font-bold text-blue-600 min-w-[180px]">{rule.term}</span>
                                    <span className="text-slate-700">{rule.uitleg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderRaps = () => {
        const eiRap = SPELLING_REGELS.find(r => r.naam === 'Ei-plaat');
        const auRap = SPELLING_REGELS.find(r => r.naam === 'Au-plaat');
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in max-w-5xl mx-auto">
                <div className="bg-orange-50 p-8 rounded-2xl border border-orange-200 shadow-sm">
                    <h3 className="text-2xl font-extrabold text-orange-800 mb-6 text-center">EI-RAP</h3>
                    <div className="prose prose-orange mx-auto whitespace-pre-line text-lg font-medium text-slate-800 text-center leading-relaxed">
                        {eiRap?.versje || "Geen tekst gevonden."}
                    </div>
                </div>
                
                <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200 shadow-sm">
                    <h3 className="text-2xl font-extrabold text-blue-800 mb-6 text-center">AU-RAP</h3>
                     <div className="prose prose-blue mx-auto whitespace-pre-line text-lg font-medium text-slate-800 text-center leading-relaxed">
                        {auRap?.versje || "Geen tekst gevonden."}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-800">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Staal Handboek</h1>
                    <p className="text-slate-500">Alle regels, afspraken en raps op een rij.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                <button 
                    onClick={() => setActiveTab('categorie')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'categorie' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-list-ol mr-2"></i> Categorieën
                </button>
                <button 
                    onClick={() => setActiveTab('grammatica')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'grammatica' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-spell-check mr-2"></i> Grammatica
                </button>
                <button 
                    onClick={() => setActiveTab('raps')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'raps' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-music mr-2"></i> Platen & Raps
                </button>
            </div>

            {activeTab === 'categorie' && (
                <div className="mb-6 relative">
                    <i className="fas fa-search absolute left-4 top-3.5 text-slate-400"></i>
                    <input 
                        type="text"
                        placeholder="Zoek een regel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            )}

            {/* Content Area */}
            <div className="pb-12">
                {activeTab === 'categorie' && renderCategories()}
                {activeTab === 'grammatica' && renderGrammar()}
                {activeTab === 'raps' && renderRaps()}
            </div>
        </div>
    );
};

export default InfoHandboek;