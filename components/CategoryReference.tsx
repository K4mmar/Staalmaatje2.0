import React, { useState } from 'react';
import { SPELLING_REGELS } from '../constants';
import { COLORS } from '../types';

interface CategoryReferenceProps {
    onBack: () => void;
}

const CategoryReference: React.FC<CategoryReferenceProps> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRules = SPELLING_REGELS.filter(rule => 
        rule.naam.toLowerCase().includes(searchTerm.toLowerCase()) || 
        rule.id.toString().includes(searchTerm) ||
        rule.regel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-800 transition-colors">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Spiekbriefje</h2>
                        <p className="text-slate-500">Alle spellingregels en instinkers op een rij</p>
                    </div>
                </div>
                <div className="relative w-full md:w-64">
                    <i className="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Zoek categorie..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRules.map(rule => (
                    <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700">{rule.naam}</span>
                            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm border border-slate-300">
                                {rule.id}
                            </span>
                        </div>
                        
                        <div className="p-5">
                            <p className="text-slate-600 text-sm mb-6 min-h-[40px] italic">
                                "{rule.regel}"
                            </p>

                            <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-2 border border-slate-100">
                                <div className="text-center border-r border-slate-200 pr-2">
                                    <div className="text-xs text-green-600 font-bold uppercase mb-1">
                                        <i className="fas fa-check mr-1"></i> Zo moet het
                                    </div>
                                    <div className="font-bold text-slate-800">{rule.voorbeeld}</div>
                                </div>
                                <div className="text-center pl-2">
                                    <div className="text-xs text-red-500 font-bold uppercase mb-1">
                                        <i className="fas fa-times mr-1"></i> Fout
                                    </div>
                                    <div className="font-medium text-slate-400 line-through decoration-red-400 decoration-2">
                                        {rule.fout}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredRules.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <i className="fas fa-search text-4xl mb-2"></i>
                    <p>Geen regels gevonden voor "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default CategoryReference;