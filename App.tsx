import React, { useState, useEffect } from 'react';
import { ViewState, WorksheetData } from './types';
import Navbar from './components/Navbar';
import WorksheetCreator from './components/WorksheetCreator';
import Library from './components/Library';
import WorksheetPlayer from './components/WorksheetPlayer';
import WordGenerator from './components/WordGenerator';
import DictationCard from './components/DictationCard';
import InfoHandboek from './components/InfoHandboek';
import LayoutTester from './components/LayoutTester';
import ExerciseOverviewLab from './components/ExerciseOverviewLab';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/Toast';

// Internal App Component to access Toast Context
const StaalmaatjeApp: React.FC = () => {
    const [view, setView] = useState<ViewState | 'database'>('create');
    const [currentWorksheet, setCurrentWorksheet] = useState<WorksheetData | null>(null);
    const [playerMode, setPlayerMode] = useState<'dictee' | 'fill' | 'print'>('fill'); 
    const [library, setLibrary] = useState<WorksheetData[]>([]);
    const { showToast } = useToast();

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
        showToast("Werkblad verwijderd", "info");
    };

    const handleWorksheetCreated = (ws: WorksheetData, initialMode: 'fill' | 'print' = 'fill') => {
        saveToLibrary(ws);
        setCurrentWorksheet(ws);
        setPlayerMode(initialMode); 
        setView('player');
        showToast("Werkblad opgeslagen in bibliotheek", "success");
    };

    const handleStartDictation = (ws: WorksheetData) => {
        if (!library.find(i => i.id === ws.id)) {
            saveToLibrary(ws);
        }
        setCurrentWorksheet(ws);
        setView('dictee');
    };

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
            showToast("Dicteezinnen opgeslagen", "success");
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'create':
                return <WorksheetCreator onWorksheetCreated={handleWorksheetCreated} onStartDictation={handleStartDictation} />;
            case 'library':
                return <Library worksheets={library} onOpen={handleOpenWorksheet} onDelete={deleteFromLibrary} />;
            case 'info':
                return <InfoHandboek onBack={() => setView('create')} />;
            case 'tester':
                return <LayoutTester onBack={() => setView('create')} />;
            case 'database':
                return <ExerciseOverviewLab onBack={() => setView('create')} />;
            case 'player':
                return currentWorksheet ? <WorksheetPlayer data={currentWorksheet} initialMode={playerMode} onClose={() => setView('library')} /> : <WorksheetCreator onWorksheetCreated={handleWorksheetCreated} onStartDictation={handleStartDictation} />;
            case 'dictee':
                return currentWorksheet ? <DictationCard words={currentWorksheet.woordenlijst} group={currentWorksheet.group} existingSentences={currentWorksheet.dicteeZinnen} onBack={() => setView('library')} onSaveToLibrary={handleUpdateSentences} /> : <WorksheetCreator onWorksheetCreated={handleWorksheetCreated} onStartDictation={handleStartDictation} />;
            case 'admin':
                return <WordGenerator />;
            default:
                return <WorksheetCreator onWorksheetCreated={handleWorksheetCreated} onStartDictation={handleStartDictation} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Navbar currentView={view} onNavigate={setView} />
            <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto print:p-0 print:w-full print:max-w-none">
                {renderContent()}
            </main>
        </div>
    );
};

// Root App with Providers
const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <StaalmaatjeApp />
            </ToastProvider>
        </ErrorBoundary>
    );
};

export default App;
