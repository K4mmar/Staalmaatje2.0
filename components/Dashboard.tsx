import React from 'react';
import { COLORS } from '../types';
import { aiGuardrail } from '../services/aiGuardrail';

interface DashboardProps {
    onNavigate: (view: 'create' | 'library' | 'admin' | 'info') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center py-12">
                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                     <i className="fas fa-owl text-6xl" style={{color: COLORS.blue}}></i>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
                    Welkom bij <span style={{color: COLORS.blue}}>Staal</span><span style={{color: COLORS.green}}>maatje</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    De professionele assistent voor het maken, beheren en digitaal afnemen van spellingwerkbladen.
                </p>
                <button 
                    onClick={() => aiGuardrail.reset()} 
                    className="mt-4 text-xs text-slate-400 hover:text-red-500 underline"
                >
                    Reset AI Beveiliging (Dev Only)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {/* Create Card */}
                <button 
                    onClick={() => onNavigate('create')}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all text-left relative overflow-hidden h-full flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i className="fas fa-magic text-8xl" style={{color: COLORS.blue}}></i>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white" style={{backgroundColor: COLORS.blue}}>
                        <i className="fas fa-plus text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Nieuw Werkblad</h3>
                    <p className="text-sm text-slate-500">Kies categorieën en genereer direct een nieuw werkblad met AI.</p>
                </button>

                {/* Library Card */}
                <button 
                    onClick={() => onNavigate('library')}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all text-left relative overflow-hidden h-full flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i className="fas fa-folder-open text-8xl" style={{color: COLORS.green}}></i>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white" style={{backgroundColor: COLORS.green}}>
                        <i className="fas fa-book text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Bibliotheek</h3>
                    <p className="text-sm text-slate-500">Bekijk opgeslagen werkbladen, print ze opnieuw of laat ze digitaal invullen.</p>
                </button>

                {/* Info Card */}
                <button 
                    onClick={() => onNavigate('info')}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all text-left relative overflow-hidden h-full flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i className="fas fa-book-open text-8xl" style={{color: COLORS.orange}}></i>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white" style={{backgroundColor: COLORS.orange}}>
                        <i className="fas fa-info text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Staal Handboek</h3>
                    <p className="text-sm text-slate-500">Regels, grammatica uitleg, raps en voorbeelden.</p>
                </button>

                {/* Admin Card */}
                 <button 
                    onClick={() => onNavigate('admin')}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all text-left relative overflow-hidden h-full flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i className="fas fa-cogs text-8xl" style={{color: COLORS.purple}}></i>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white" style={{backgroundColor: COLORS.purple}}>
                        <i className="fas fa-flask text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Woorden Lab</h3>
                    <p className="text-sm text-slate-500">Beheer de motor. Test de woordgeneratie.</p>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;