import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { AppMode } from './types';
import { Layout } from './components/Layout';
import { WelcomeView } from './views/WelcomeView';
import { DecideView } from './views/DecideView';
import { AddView } from './views/AddView';
import { CatalogView } from './views/CatalogView';
import { DetailView } from './views/DetailView';
import { SettingsView } from './views/SettingsView';
import { ProposalView } from './views/ProposalView';
import { ThemeController } from './components/ThemeController';

// Context for Mode
interface ModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within a ModeProvider');
  return context;
};

const App: React.FC = () => {
  const [mode, setModeState] = useState<AppMode>('planes');

  const toggleMode = () => {
    setModeState(prev => prev === 'planes' ? 'comer' : 'planes');
  };

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
  };

  // ThemeController manages the global styles and meta tags

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      <HashRouter>
        <ThemeController />
        <Layout>
          <Routes>
            <Route path="/" element={<WelcomeView />} />
            <Route path="/decide" element={<DecideView />} />
            <Route path="/add" element={<AddView />} />
            <Route path="/edit/:id" element={<AddView />} />
            <Route path="/catalog" element={<CatalogView />} />
            <Route path="/detail/:id" element={<DetailView />} />
            <Route path="/proposal/:id" element={<ProposalView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ModeContext.Provider>
  );
};

export default App;