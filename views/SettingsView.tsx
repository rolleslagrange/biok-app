import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Trash2, Check, BarChart3, Trophy, X, Car, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { getItems } from '../services/mockData';
import { PlanItem, ComerItem, MealType } from '../types';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  isUnlocked: boolean;
  tier: number; // 1 to 5
}

interface AchievementGroup {
    id: string;
    title: string;
    achievements: Achievement[];
}

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  
  // Feedback states
  const [exporting, setExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Interaction State
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Stats Data
  const [stats, setStats] = useState({
    totalItems: 0,
    sergioCount: 0,
    nereaCount: 0,
    taximetroMinutes: 0,
    sofaPct: 0,
    callePct: 0,
    paladar: { lunch: 0, dinner: 0, bar: 0 },
    achievementGroups: [] as AchievementGroup[],
    totalUnlocked: 0,
    totalAchievements: 0
  });

  useEffect(() => {
    const fetchData = async () => {
        const planes = await getItems('planes') as PlanItem[];
        const comer = await getItems('comer') as ComerItem[];
        const all = [...planes, ...comer];

        // Basic Counts
        const sergio = all.filter(i => i.createdBy === 'Sergio').length;
        const nerea = all.filter(i => i.createdBy === 'Nerea').length;
        
        // --- ESTADÍSTICAS ---
        const completedItems = all.filter(i => i.isDone);
        const totalMinutes = completedItems.reduce((acc, item) => {
            const avgTrip = (item.time_las_carreras + item.time_portu) / 2;
            return acc + avgTrip;
        }, 0);

        const completedPlanes = planes.filter(p => p.isDone);
        const homeCount = completedPlanes.filter(p => p.location === 'home').length;
        const outCount = completedPlanes.filter(p => p.location !== 'home').length;
        const totalCompletedPlanes = homeCount + outCount || 1;
        const sofaPct = Math.round((homeCount / totalCompletedPlanes) * 100);

        const lunchCount = comer.filter(c => c.meal_type.includes(MealType.LUNCH)).length;
        const dinnerCount = comer.filter(c => c.meal_type.includes(MealType.DINNER)).length;
        const barCount = comer.filter(c => c.meal_type.includes(MealType.BAR)).length;

        // --- CONTADORES PARA LOGROS ---
        const completedComer = comer.filter(c => c.isDone);
        
        const willyFogCount = completedItems.filter(i => i.time_las_carreras > 45 || i.time_portu > 45).length;
        const cheapCount = completedPlanes.filter(p => p.price === 0).length + completedComer.filter(c => c.price_range === 'low').length;
        const expensiveCount = completedPlanes.filter(p => p.price > 50).length + completedComer.filter(c => c.price_range === 'high').length;
        const natureCount = completedPlanes.filter(p => p.location === 'nature').length;
        const cityCount = completedPlanes.filter(p => p.location === 'city').length;
        const homeDoneCount = completedPlanes.filter(p => p.location === 'home').length;
        const historyCount = completedItems.length;

        // --- DEFINICIÓN DE LOGROS ---
        const defineGroup = (id: string, title: string, count: number, definitions: {t: number, icon: string, name: string, desc: string}[]) => {
            return {
                id,
                title,
                achievements: definitions.map((def, idx) => ({
                    id: `${id}_${def.t}`,
                    tier: idx + 1,
                    icon: def.icon,
                    title: def.name,
                    desc: def.desc,
                    isUnlocked: count >= def.t
                }))
            };
        };

        const groups: AchievementGroup[] = [
            defineGroup('travel', 'Aventureros', willyFogCount, [
                { t: 1, icon: '🚶', name: 'Turista', desc: '1 plan lejos (>45min)' },
                { t: 5, icon: '🚲', name: 'Explorador', desc: '5 planes lejos' },
                { t: 10, icon: '🚗', name: 'Viajero', desc: '10 planes lejos' },
                { t: 25, icon: '✈️', name: 'Nómada', desc: '25 planes lejos' },
                { t: 50, icon: '🚀', name: 'Willy Fog', desc: '50 planes lejos' }
            ]),
            defineGroup('eco', 'Economía', cheapCount, [
                { t: 1, icon: '🪙', name: 'Tacaños', desc: '1 plan Low Cost' },
                { t: 5, icon: '🏷️', name: 'Oferta', desc: '5 planes Low Cost' },
                { t: 10, icon: '🐷', name: 'Ahorradores', desc: '10 planes Low Cost' },
                { t: 25, icon: '📉', name: 'Inversores', desc: '25 planes Low Cost' },
                { t: 50, icon: '🎁', name: 'Gratis Total', desc: '50 planes Low Cost' }
            ]),
            defineGroup('rich', 'Alto Standing', expensiveCount, [
                { t: 1, icon: '💳', name: 'Un Capricho', desc: '1 plan Caro (>50€)' },
                { t: 3, icon: '🥂', name: 'Derrochadores', desc: '3 planes Caros' },
                { t: 5, icon: '💍', name: 'VIP', desc: '5 planes Caros' },
                { t: 10, icon: '💎', name: 'Magnates', desc: '10 planes Caros' },
                { t: 20, icon: '👑', name: 'Jeques', desc: '20 planes Caros' }
            ]),
            defineGroup('nature', 'Naturaleza', natureCount, [
                { t: 1, icon: '🍂', name: 'Dominguero', desc: '1 plan Naturaleza' },
                { t: 5, icon: '🍄', name: 'Recolector', desc: '5 planes Naturaleza' },
                { t: 10, icon: '🌲', name: 'Senderista', desc: '10 planes Naturaleza' },
                { t: 25, icon: '🏔️', name: 'Alpinista', desc: '25 planes Naturaleza' },
                { t: 50, icon: '🦅', name: 'Superviviente', desc: '50 planes Naturaleza' }
            ]),
            defineGroup('city', 'Urbanitas', cityCount, [
                { t: 1, icon: '🚦', name: 'Peatón', desc: '1 plan Ciudad' },
                { t: 5, icon: '🎭', name: 'Cultureta', desc: '5 planes Ciudad' },
                { t: 10, icon: '🏙️', name: 'Urbanita', desc: '10 planes Ciudad' },
                { t: 25, icon: '🚕', name: 'Cosmopolita', desc: '25 planes Ciudad' },
                { t: 50, icon: '🗽', name: 'Alcalde', desc: '50 planes Ciudad' }
            ]),
            defineGroup('home', 'Caseros', homeDoneCount, [
                { t: 1, icon: '🧦', name: 'Pantufla', desc: '1 plan Casero' },
                { t: 5, icon: '🕯️', name: 'Hygge', desc: '5 planes Caseros' },
                { t: 10, icon: '📺', name: 'Peli y Manta', desc: '10 planes Caseros' },
                { t: 25, icon: '🍕', name: 'Búnker', desc: '25 planes Caseros' },
                { t: 50, icon: '🏰', name: 'Fortaleza', desc: '50 planes Caseros' }
            ]),
            defineGroup('hist', 'Historial', historyCount, [
                { t: 1, icon: '🐣', name: 'Novatos', desc: '1 plan total' },
                { t: 10, icon: '🐥', name: 'Iniciados', desc: '10 planes totales' },
                { t: 25, icon: '🦉', name: 'Veteranos', desc: '25 planes totales' },
                { t: 50, icon: '🦁', name: 'Maestros', desc: '50 planes totales' },
                { t: 100, icon: '🐲', name: 'Leyendas', desc: '100 planes totales' }
            ])
        ];

        let totalU = 0;
        let totalA = 0;
        groups.forEach(g => {
            totalA += g.achievements.length;
            totalU += g.achievements.filter(a => a.isUnlocked).length;
        });

        setStats({
            totalItems: all.length,
            sergioCount: sergio,
            nereaCount: nerea,
            taximetroMinutes: Math.round(totalMinutes),
            sofaPct: sofaPct,
            callePct: 100 - sofaPct,
            paladar: { lunch: lunchCount, dinner: dinnerCount, bar: barCount },
            achievementGroups: groups,
            totalUnlocked: totalU,
            totalAchievements: totalA
        });
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
        const planes = await getItems('planes');
        const comer = await getItems('comer');
        
        const data = {
            version: 1,
            timestamp: Date.now(),
            planes,
            comer
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `biok_backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Export failed", e);
    } finally {
        setExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            if (!json.planes || !json.comer) throw new Error("Formato inválido");
            setImportStatus('success');
            setTimeout(() => setImportStatus('idle'), 2000);
        } catch (err) {
            setImportStatus('error');
            setTimeout(() => setImportStatus('idle'), 2000);
        }
    };
    reader.readAsText(file);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  // Hardcoded Beige Theme colors just for this view
  const bgMain = 'bg-[#FDFBF7]'; 
  const bgCard = 'bg-white';
  const textMain = 'text-stone-800';
  const textSec = 'text-stone-400';
  const border = 'border-stone-200';

  // Stats Calculations
  const totalVotes = stats.sergioCount + stats.nereaCount || 1;
  const sergioPct = Math.round((stats.sergioCount / totalVotes) * 100);
  const nereaPct = 100 - sergioPct;

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} pb-10 flex flex-col transition-colors duration-500`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 ${bgMain}/95 backdrop-blur px-4 py-4 flex items-center gap-4`}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-black/5 text-stone-600">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold tracking-wider text-stone-800">Ajustes</h1>
      </header>

      <main className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-300 flex-1 flex flex-col">
        
        {/* SECTION: ESTADÍSTICAS BIOK */}
        <section className="space-y-4">
            <h2 className={`text-base font-bold ${textSec} uppercase tracking-wider flex items-center gap-2`}>
                <BarChart3 size={20} /> ESTADÍSTICAS BIOK
            </h2>

            {/* Marcador de Pareja - Standard padding p-4 */}
            <div className={`${bgCard} rounded-xl p-4 shadow-sm border ${border} space-y-3`}>
                <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Contador de Propuestas</span>
                </div>
                
                <div className="relative h-8 w-full rounded-full overflow-hidden flex bg-stone-100">
                    <div style={{ width: `${sergioPct}%` }} className="bg-green-200 flex items-center justify-center transition-all duration-1000">
                        {sergioPct > 10 && <span className="text-xs font-black text-green-800">{sergioPct}%</span>}
                    </div>
                    <div style={{ width: `${nereaPct}%` }} className="bg-blue-200 flex items-center justify-center transition-all duration-1000">
                         {nereaPct > 10 && <span className="text-xs font-black text-blue-800">{nereaPct}%</span>}
                    </div>
                </div>
                <div className="flex justify-between text-xs font-bold text-stone-500 px-1">
                    <span>Sergio: {stats.sergioCount}</span>
                    <span>Nerea: {stats.nereaCount}</span>
                </div>
            </div>

            {/* Grid de Nuevas Estadísticas - Consistent Gap 3 */}
            <div className="grid grid-cols-2 gap-3">
                 {/* Taxímetro - Standard p-4, Optimized Content filling space */}
                <div className={`${bgCard} col-span-2 rounded-xl p-4 shadow-sm border ${border} flex items-center justify-between`}>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Taxímetro</span>
                        
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-black text-stone-800 leading-none">{stats.taximetroMinutes}</span>
                            <span className="text-base font-bold text-stone-400">min</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium leading-tight">Tiempo aproximado viajando juntos</span>
                    </div>
                    <div className="p-4 bg-yellow-100 rounded-full text-yellow-600 shrink-0">
                        <Car size={28} />
                    </div>
                </div>

                {/* Casa vs Calle - Standard p-4, Content Distributed evenly */}
                <div className={`${bgCard} rounded-xl p-4 shadow-sm border ${border} flex flex-col h-full`}>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">Casa vs Calle</span>
                    <div className="flex-1 flex flex-col justify-between">
                         <div className="flex items-center justify-between">
                            <span className="text-2xl">🏠</span>
                            <span className="font-black text-stone-700 text-lg">{stats.sofaPct}%</span>
                         </div>
                         <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                             <div style={{ width: `${stats.sofaPct}%` }} className="h-full bg-indigo-300 transition-all duration-1000"></div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="font-black text-stone-700 text-lg">{stats.callePct}%</span>
                            <span className="text-2xl">🌍</span>
                         </div>
                    </div>
                </div>

                {/* Paladar Biok - Standard p-4, Content Distributed evenly */}
                <div className={`${bgCard} rounded-xl p-4 shadow-sm border ${border} flex flex-col h-full`}>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">Paladar BIOK</span>
                    <div className="flex-1 flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-stone-600 font-bold">🍝 Comida</span>
                            <span className="font-black text-base">{stats.paladar.lunch}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-stone-600 font-bold">🍕 Cena</span>
                            <span className="font-black text-base">{stats.paladar.dinner}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-stone-600 font-bold">🍻 Poteo</span>
                            <span className="font-black text-base">{stats.paladar.bar}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* SECTION: LOGROS (COLLAPSIBLE) */}
        <section className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h2 className={`text-base font-bold ${textSec} uppercase tracking-wider flex items-center gap-2`}>
                    <Trophy size={20} /> Logros
                </h2>
                <span className="text-xs bg-stone-200 text-stone-500 px-2 py-1 rounded-full font-bold">
                    {stats.totalUnlocked}/{stats.totalAchievements}
                </span>
            </div>
            
            <div className="space-y-3">
                {stats.achievementGroups.map((group) => {
                    const unlockedInGroup = group.achievements.filter(a => a.isUnlocked).length;
                    const isExpanded = expandedGroupId === group.id;

                    return (
                        <div key={group.id} className={`${bgCard} rounded-xl border ${border} overflow-hidden shadow-sm transition-all`}>
                            {/* Accordion Header - Standard p-4 */}
                            <button 
                                onClick={() => toggleGroup(group.id)}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${unlockedInGroup === 5 ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400'}`}>
                                        {unlockedInGroup}
                                    </div>
                                    <span className="font-bold text-sm text-stone-700 uppercase tracking-wide">{group.title}</span>
                                </div>
                                {isExpanded ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                            </button>
                            
                            {/* Collapsible Content */}
                            {isExpanded && (
                                <div className="p-4 pt-0 border-t border-stone-50 bg-stone-50/50 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-5 gap-2 mt-4">
                                        {group.achievements.map((achievement) => (
                                            <button 
                                                key={achievement.id}
                                                onClick={() => setSelectedBadge(achievement)}
                                                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all active:scale-95 relative overflow-hidden bg-white ${
                                                    achievement.isUnlocked 
                                                        ? 'border-amber-200 shadow-sm' 
                                                        : 'border-stone-100 grayscale opacity-40'
                                                }`}
                                            >
                                                <span className="text-xl drop-shadow-sm z-10">{achievement.icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>

        {/* SECTION: DATA MANAGEMENT */}
        <section className="space-y-4">
            <h2 className={`text-base font-bold ${textSec} uppercase tracking-wider flex items-center gap-2`}>
                <Database size={20} /> Gestión de Datos
            </h2>
            
            <div className={`${bgCard} rounded-xl overflow-hidden shadow-sm border ${border}`}>
                {/* Standard p-4 for list items */}
                <button 
                    onClick={handleExport}
                    className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors border-b border-stone-100"
                >
                    <div className="flex items-center gap-3">
                        <Download size={20} className="text-stone-500" />
                        <span className="font-bold text-sm text-stone-700">Exportar Copia (JSON)</span>
                    </div>
                    {exporting && <span className={`text-xs ${textSec}`}>...</span>}
                </button>

                <label className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors cursor-pointer border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <Upload size={20} className="text-stone-500" />
                        <span className="font-bold text-sm text-stone-700">Importar Copia</span>
                    </div>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    {importStatus === 'success' && <Check size={18} className="text-green-600" />}
                    {importStatus === 'error' && <span className="text-xs text-red-400">Error</span>}
                </label>
                
                <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group">
                    <div className="flex items-center gap-3">
                        <Trash2 size={20} className="text-red-300 group-hover:text-red-500 transition-colors" />
                        <span className="font-bold text-sm text-red-300 group-hover:text-red-500 transition-colors">Borrar Todo</span>
                    </div>
                </button>
            </div>
        </section>

        {/* Info Footer */}
        <div className="mt-auto text-center pt-8 pb-4">
            <div className={`text-sm font-bold text-stone-400 opacity-60 space-y-1`}>
                <p>Hecho con 🖤 para mi Nerea</p>
                <p>Te ama Sergio</p>
            </div>
        </div>

      </main>

      {/* ACHIEVEMENT DETAILS MODAL */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                {/* Background Decor */}
                <div className={`absolute top-0 left-0 w-full h-24 ${selectedBadge.isUnlocked ? 'bg-amber-100' : 'bg-stone-100'}`}></div>
                
                <button 
                    onClick={() => setSelectedBadge(null)}
                    className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
                >
                    <X size={20} className="text-stone-500" />
                </button>

                <div className="relative flex flex-col items-center text-center gap-4 mt-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl border-4 bg-white shadow-lg ${selectedBadge.isUnlocked ? 'border-amber-200' : 'border-stone-100 grayscale'}`}>
                        {selectedBadge.icon}
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-stone-800">{selectedBadge.title}</h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedBadge.isUnlocked ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}`}>
                            {selectedBadge.isUnlocked ? 'Completado' : 'Bloqueado'}
                        </div>
                        <p className="text-sm text-stone-500 font-medium leading-relaxed px-2">
                            {selectedBadge.desc}
                        </p>
                    </div>
                </div>
            </div>
            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={() => setSelectedBadge(null)}></div>
        </div>
      )}

    </div>
  );
};