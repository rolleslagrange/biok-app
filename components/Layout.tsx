import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Plus, List, MoreVertical } from 'lucide-react';
import { useMode } from '../App';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { mode, toggleMode } = useMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Theme colors
  const accentColor = mode === 'planes' ? 'text-planes' : 'text-comer';
  const accentBg = mode === 'planes' ? 'bg-planes' : 'bg-comer';

  const isActive = (path: string) => location.pathname === path;
  
  // Logic to identify views where the shell (Header/Nav) should be hidden
  const isDetailView = location.pathname.startsWith('/detail/');
  const isEditView = location.pathname.startsWith('/edit/');
  const isSettingsView = location.pathname === '/settings';
  const isWelcomeView = location.pathname === '/';
  const isProposalView = location.pathname.startsWith('/proposal/');
  
  // Hide global shell elements on specific views
  const hideShell = isDetailView || isWelcomeView || isSettingsView || isProposalView || isEditView;

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-textMain overflow-hidden font-sans transition-colors duration-300">
      {/* Sticky Header */}
      {!hideShell && (
        <header className="flex-none bg-surface/90 backdrop-blur-sm z-50 pt-safe-top pb-2 px-4 shadow-lg transition-colors duration-300 relative">
            {/* Settings Button (Absolute Right) */}
            <button 
                onClick={() => navigate('/settings')}
                className="absolute right-4 top-6 text-textSec hover:text-white transition-colors"
            >
                <MoreVertical size={24} />
            </button>

          <div className="flex flex-col items-center gap-3 pt-4">
            <h1 className="text-xl font-extrabold tracking-widest text-textMain">BIOK</h1>
            
            {/* Mode Toggle - Border removed */}
            <div className="relative flex w-full max-w-[280px] bg-toggle rounded-full p-1.5 h-12 items-center shadow-inner transition-colors duration-300">
               <div 
                 className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-full transition-transform duration-300 ease-in-out shadow-md ${accentBg} ${mode === 'comer' ? 'translate-x-full' : 'translate-x-0'}`}
               ></div>
               
               <button 
                  onClick={() => mode !== 'planes' && toggleMode()}
                  className={`flex-1 z-10 h-full flex items-center justify-center text-xs font-extrabold uppercase tracking-widest transition-colors duration-200 ${mode === 'planes' ? 'text-white' : 'text-textSec'}`}
               >
                  Planes
               </button>
               <button 
                  onClick={() => mode !== 'comer' && toggleMode()}
                  className={`flex-1 z-10 h-full flex items-center justify-center text-xs font-extrabold uppercase tracking-widest transition-colors duration-200 ${mode === 'comer' ? 'text-white' : 'text-textSec'}`}
               >
                  Comer
               </button>
            </div>
          </div>
        </header>
      )}

      {/* Dynamic Content Area with Transition */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative scroll-smooth">
        <div 
          key={mode} 
          className="min-h-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
        >
          {children}
        </div>
      </main>

      {/* Sticky Bottom Navigation */}
      {!hideShell && (
        <nav className="flex-none bg-surface/95 backdrop-blur-md pb-safe-bottom z-50 transition-colors duration-300">
          <div className="flex justify-around items-center h-16 px-4">
            
            {/* Left: Añadir - Borders removed */}
            <button 
              onClick={() => navigate('/add')}
              className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors active:bg-surface ${isActive('/add') ? accentColor : 'text-textSec'}`}
            >
              <Plus size={30} strokeWidth={isActive('/add') ? 3 : 2.5} />
            </button>

            {/* Center: Decidir (Large FAB) - Keep the cutout border only (it's part of the shape, not a box) */}
            <button 
              onClick={() => navigate('/decide')}
              className="relative -top-4 group"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-[5px] border-background transition-transform active:scale-95 ${accentBg} text-white`}>
                <Sparkles 
                  size={32} 
                  fill="currentColor"
                  strokeWidth={1}
                />
              </div>
            </button>

            {/* Right: Catálogo - Borders removed */}
            <button 
               onClick={() => navigate('/catalog')}
               className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors active:bg-surface ${isActive('/catalog') ? accentColor : 'text-textSec'}`}
            >
              <List size={30} strokeWidth={isActive('/catalog') ? 3 : 2.5} />
            </button>

          </div>
        </nav>
      )}
    </div>
  );
};