
import React, { useState, useEffect } from 'react';
import { ViewState, WorksheetData, COLORS } from './types';
import Dashboard from './components/Dashboard';
import WorksheetCreator from './components/WorksheetCreator';
import Library from './components/Library';
import WorksheetPlayer from './components/WorksheetPlayer';
import WordGenerator from './components/WordGenerator';
import DictationCard from './components/DictationCard';
import InfoHandboek from './components/InfoHandboek';
import LayoutTester from './components/LayoutTester';

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>('dashboard');
    const [currentWorksheet, setCurrentWorksheet] = useState<WorksheetData | null>(null);
    const [playerMode, setPlayerMode] = useState<'dictee' | 'fill' | 'print'>('fill'); 
    const [library, setLibrary] = useState<WorksheetData[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('staalmaatje_library_v2');
        if (saved) {
            try {
                setLibrary(JSON.parse(saved));
            } catch (e) { console.error("History load error", e); }
        }
    }, []);

    const saveToLibrary = (ws: WorksheetData) => {
        const exists = library.find(i => i.id === ws.id);
        let updated;
        if (exists) {
            updated = library.map(i => i.id === ws.id ? ws : i);
        } else {
            updated = [ws, ...library];
        }
        setLibrary(updated);
        localStorage.setItem('staalmaatje_library_v2', JSON.stringify(updated));
    };

    const deleteFromLibrary = (id: string) => {
        if(!confirm("Weet je zeker dat je dit werkblad wilt verwijderen?")) return;
        const updated = library.filter(ws => ws.id !== id);
        setLibrary(updated);
        localStorage.setItem('staalmaatje_library_v2', JSON.stringify(updated));
    };

    const handleWorksheetCreated = (ws: WorksheetData, initialMode: 'fill' | 'print' = 'fill') => {
        saveToLibrary(ws);
        setCurrentWorksheet(ws);
        setPlayerMode(initialMode); 
        setView('player');
    };

    const handleStartDictation = (ws: WorksheetData) => {
        if (!library.find(i => i.id === ws.id)) {
            saveToLibrary(ws);
        }
        setCurrentWorksheet(ws);
        setView('dictee');
    }

    const handleOpenWorksheet = (ws: WorksheetData) => {
        setCurrentWorksheet(ws);
        setPlayerMode('fill'); 
        setView('player');
    };

    const handleUpdateSentences = (sentences: string[]) => {
        if (currentWorksheet) {
            const updated = { ...currentWorksheet, dicteeZinnen: sentences };
            setCurrentWorksheet(updated);
            saveToLibrary(updated);
        }
    };

    const Sidebar = () => (
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto no-print">
            <div className="p-6 border-b border-slate-800">
                 <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <i className="fas fa-graduation-cap text-blue-500"></i>
                    Staal<span className="text-green-500">maatje</span>
                </h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                <button 
                    onClick={() => setView('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
                >
                    <i className="fas fa-home w-5"></i> Dashboard
                </button>
                <button 
                    onClick={() => setView('create')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
                >
                    <i className="fas fa-magic w-5"></i> Maken
                </button>
                <button 
                    onClick={() => setView('library')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === 'library' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
                >
                    <i className="fas fa-folder-open w-5"></i> Bibliotheek
                </button>
                <button 
                    onClick={() => setView('info')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === 'info' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
                >
                    <i className="fas fa-book-open w-5"></i> Handboek
                </button>
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <button 
                    onClick={() => setView('admin')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${view === 'admin' ? 'bg-purple-900/50 text-purple-300' : 'text-slate-500 hover:text-purple-300'}`}
                >
                    <i className="fas fa-flask w-5"></i> Woorden Lab
                </button>
                <button 
                    onClick={() => setView('tester')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${view === 'tester' ? 'bg-orange-900/50 text-orange-300' : 'text-slate-500 hover:text-orange-300'}`}
                >
                    <i className="fas fa-vial w-5"></i> Vormgeving Lab
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard onNavigate={setView} />;
            case 'create':
                return <WorksheetCreator onWorksheetCreated={handleWorksheetCreated} onStartDictation={handleStartDictation} />;
            case 'library':
                return <Library worksheets={library} onOpen={handleOpenWorksheet} onDelete={deleteFromLibrary} />;
            case 'info':
                return <InfoHandboek onBack={() => setView('dashboard')} />;
            case 'tester':
                return <LayoutTester onBack={() => setView('dashboard')} />;
            case 'player':
                return currentWorksheet ? <WorksheetPlayer data={currentWorksheet} initialMode={playerMode} onClose={() => setView('library')} /> : <Dashboard onNavigate={setView} />;
            case 'dictee':
                return currentWorksheet ? <DictationCard words={currentWorksheet.woordenlijst} group={currentWorksheet.group} existingSentences={currentWorksheet.dicteeZinnen} onBack={() => setView('library')} onSaveToLibrary={handleUpdateSentences} /> : <Dashboard onNavigate={setView} />;
            case 'admin':
                return <WordGenerator />;
            default:
                return <Dashboard onNavigate={setView} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            <aside className="hidden md:block w-64 flex-shrink-0">
                <Sidebar />
            </aside>
            <main className="flex-1 p-4 md:p-8 md:ml-64 print:ml-0 print:p-0">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
