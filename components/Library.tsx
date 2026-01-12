import React, { useState } from 'react';
import { WorksheetData, COLORS } from '../types';

interface LibraryProps {
    worksheets: WorksheetData[];
    onOpen: (ws: WorksheetData) => void;
    onDelete: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ worksheets, onOpen, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = worksheets.filter(ws => 
        ws.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ws.group.includes(searchTerm)
    );

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Bibliotheek</h2>
                    <p className="text-slate-500">Beheer al je opgeslagen werkbladen</p>
                </div>
                <div className="relative w-full md:w-64">
                    <i className="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Zoek werkblad..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    <i className="fas fa-folder-open text-4xl text-slate-300 mb-4"></i>
                    <p className="text-slate-500 font-medium">Geen werkbladen gevonden.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(ws => (
                        <div key={ws.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">Groep {ws.group}</span>
                                <button onClick={() => onDelete(ws.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{ws.title}</h3>
                            <p className="text-xs text-slate-500 mb-4">
                                <i className="far fa-calendar-alt mr-1"></i>
                                {new Date(ws.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric'})}
                            </p>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                                <button 
                                    onClick={() => onOpen(ws)}
                                    className="flex-1 py-2 rounded-lg font-bold text-sm text-white transition-transform hover:scale-[1.02]"
                                    style={{backgroundColor: COLORS.blue}}
                                >
                                    Openen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Library;
