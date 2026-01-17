
import React, { useState } from 'react';
import { ViewState, COLORS } from '../types';

interface NavbarProps {
    currentView: ViewState | 'database';
    onNavigate: (view: ViewState | 'database') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNav = (view: ViewState | 'database') => {
        onNavigate(view);
        setIsMenuOpen(false);
    };

    const NavItem = ({ view, icon, label, isLab = false }: { view: ViewState | 'database', icon: string, label: string, isLab?: boolean }) => {
        const isActive = currentView === view;
        const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm md:text-base cursor-pointer";
        
        let activeClass = "";
        let inactiveClass = "";

        if (isLab) {
            activeClass = "bg-slate-800 text-cyan-400 shadow-md border border-slate-700";
            inactiveClass = "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50";
        } else {
            activeClass = "bg-blue-600 text-white shadow-md";
            inactiveClass = "text-slate-300 hover:bg-slate-800 hover:text-white";
        }

        return (
            <button 
                onClick={() => handleNav(view)}
                className={`${baseClass} ${isActive ? activeClass : inactiveClass} w-full md:w-auto`}
            >
                <i className={`fas ${icon} w-5 text-center`}></i>
                <span>{label}</span>
            </button>
        );
    };

    return (
        <nav className="bg-slate-900 text-slate-300 shadow-lg sticky top-0 z-50 no-print">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('create')}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        <h1 className="text-xl font-extrabold text-white tracking-tight">
                            Staal<span className="text-green-500">maatje</span>
                        </h1>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        <NavItem view="create" icon="fa-magic" label="Maken" />
                        <NavItem view="library" icon="fa-folder-open" label="Bibliotheek" />
                        <NavItem view="info" icon="fa-book-open" label="Handboek" />
                        
                        <div className="h-6 w-px bg-slate-700 mx-2"></div>
                        
                        {/* Lab Dropdown trigger or just items. Putting them inline for now as requested */}
                        <NavItem view="database" icon="fa-database" label="DB" isLab />
                        <NavItem view="admin" icon="fa-flask" label="Woorden" isLab />
                        <NavItem view="tester" icon="fa-vial" label="Design" isLab />
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                        >
                            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Collapsible) */}
            {isMenuOpen && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-fade-in">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-2">Hoofdmenu</div>
                    <NavItem view="create" icon="fa-magic" label="Nieuw Werkblad" />
                    <NavItem view="library" icon="fa-folder-open" label="Bibliotheek" />
                    <NavItem view="info" icon="fa-book-open" label="Staal Handboek" />
                    
                    <div className="border-t border-slate-800 my-4"></div>
                    
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Labs & Tools</div>
                    <NavItem view="database" icon="fa-database" label="Oefeningen Database" isLab />
                    <NavItem view="admin" icon="fa-flask" label="Woorden Laboratorium" isLab />
                    <NavItem view="tester" icon="fa-vial" label="Vormgeving Tester" isLab />
                </div>
            )}
        </nav>
    );
};

export default Navbar;
