import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMode } from '../App';
import { getItems, updateItem } from '../services/mockData';
import { Item, PlanItem, ComerItem, MealType } from '../types';
import { MapPin, Car, ExternalLink, Sparkles, ThumbsUp, PartyPopper, User, Tag } from 'lucide-react';

export const ProposalView: React.FC = () => {
  const { id } = useParams();
  const { mode } = useMode();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);

  const accentColor = mode === 'planes' ? 'text-planes' : 'text-comer';
  const accentBg = mode === 'planes' ? 'bg-planes' : 'bg-comer';
  const surfaceAccent = mode === 'planes' ? 'bg-blue-500/10' : 'bg-orange-500/10';
  
  useEffect(() => {
    getItems(mode).then(items => {
        const found = items.find(i => i.id === id);
        if (found) setItem(found);
    });
  }, [id, mode]);

  if (!item) return <div className="h-full flex items-center justify-center text-textSec">Cargando oráculo...</div>;

  const handleAccept = async () => {
    const updated = { ...item, isActive: true };
    await updateItem(updated);
    navigate('/catalog');
  };

  const handleReroll = () => {
    navigate('/decide');
  };

  const isPlan = item.type === 'plan';

  const getLocationLabel = (loc: string) => {
    const map: Record<string, string> = { 'home': 'Casa', 'city': 'Ciudad', 'nature': 'Naturaleza' };
    return map[loc] || loc;
  };

  const getMealLabel = (type: MealType) => {
    const map: Record<string, string> = { 'lunch': 'Comida', 'dinner': 'Cena', 'bar': 'Tomar algo' };
    return map[type] || type;
  };

  const getPriceDisplay = () => {
    if (isPlan) {
        const price = (item as PlanItem).price;
        return price === 0 ? 'Gratis' : `${price} €`;
    }
    const range = (item as ComerItem).price_range;
    return range === 'low' ? '€' : range === 'mid' ? '€€' : '€€€';
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden relative">
      
      {/* 1. Header Compacto */}
      <header className="flex-none pt-6 pb-2 text-center animate-in slide-in-from-top-4 duration-500 z-10">
        <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-surface shadow-lg shadow-black/20 mb-1 ring-1 ring-white/5">
            <PartyPopper size={24} className={`${accentColor} animate-bounce`} />
        </div>
        <h2 className="text-[10px] font-black text-textSec uppercase tracking-[0.2em] opacity-80">El oráculo ha decidido</h2>
      </header>

      {/* 2. Main Content - Flex Grow to fill space */}
      <main className="flex-1 min-h-0 px-5 py-2 flex flex-col w-full max-w-md mx-auto">
         <div className="flex-1 bg-surface rounded-[1.8rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             
             {/* Gradient Overlay for texture */}
             <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 pointer-events-none ${mode === 'planes' ? 'bg-blue-500' : 'bg-orange-500'}`} />

             {/* Internal Content - Reduced padding to fit larger buttons */}
             <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
                
                {/* Title & Tags */}
                <div className="space-y-3 text-center flex-none pt-2">
                    <h1 className="text-2xl font-black leading-tight text-white drop-shadow-sm line-clamp-2 px-2">
                        {item.title}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${surfaceAccent} ${accentColor}`}>
                            <User size={10} /> {item.createdBy}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${surfaceAccent} ${accentColor}`}>
                            <Tag size={10} /> {getPriceDisplay()}
                        </span>
                    </div>
                </div>

                <hr className="border-white/5" />

                {/* Logistics Grid (Compact) */}
                <div className="grid grid-cols-2 gap-2 flex-none">
                    <div className="bg-background/40 p-2.5 rounded-xl flex flex-col items-center justify-center border border-white/5">
                        <span className="text-[9px] text-textSec uppercase font-bold tracking-wider">Las Carreras</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-white">{item.time_las_carreras}</span>
                            <span className="text-[10px] font-bold text-textSec">min</span>
                        </div>
                    </div>

                    <div className="bg-background/40 p-2.5 rounded-xl flex flex-col items-center justify-center border border-white/5">
                        <span className="text-[9px] text-textSec uppercase font-bold tracking-wider">Portu</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-white">{item.time_portu}</span>
                            <span className="text-[10px] font-bold text-textSec">min</span>
                        </div>
                    </div>

                    <div className="bg-background/40 p-2.5 rounded-xl flex flex-col items-center justify-center border border-white/5">
                        <span className="text-[9px] text-textSec uppercase font-bold tracking-wider">Coche</span>
                        <div className={`flex items-center gap-1.5 font-bold text-sm ${item.car_needed ? 'text-white' : 'text-textSec'}`}>
                            <Car size={14} />
                            {item.car_needed ? 'Sí' : 'No'}
                        </div>
                    </div>

                    <div className="bg-background/40 p-2.5 rounded-xl flex flex-col items-center justify-center border border-white/5">
                        <span className="text-[9px] text-textSec uppercase font-bold tracking-wider">
                            {isPlan ? 'UBICACIÓN' : 'MOMENTO'}
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-white text-xs text-center leading-tight">
                            <MapPin size={12} className={accentColor} />
                            {isPlan 
                                ? getLocationLabel((item as PlanItem).location)
                                : (item as ComerItem).meal_type.map(getMealLabel).join(', ').slice(0, 15) // Truncate if too long
                            }
                        </div>
                    </div>
                </div>

                {/* Notes & Links Area (Flexible) */}
                <div className="flex-1 min-h-0 flex flex-col gap-3 justify-center">
                    {item.notes && (
                        <div className="relative bg-background/30 p-3 rounded-xl border border-white/5 flex-1 min-h-[60px] flex items-center justify-center text-center">
                            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl opacity-50 ${accentBg}`}></div>
                            <p className="text-sm text-gray-300 italic leading-snug line-clamp-4">"{item.notes}"</p>
                        </div>
                    )}

                    {item.links && item.links.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {item.links.slice(0, 2).map((link, idx) => ( // Limit to 2 links for space
                                <a 
                                    key={idx} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-lg bg-background hover:bg-white/5 transition-colors text-xs font-bold border border-white/5 ${accentColor}`}
                                >
                                    <ExternalLink size={14} />
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
             </div>
         </div>
      </main>

      {/* 3. Action Footer (Enlarged) */}
      <div className="flex-none p-5 pt-1 space-y-3 z-10 w-full max-w-md mx-auto mb-2">
         <button 
            onClick={handleAccept}
            className={`w-full h-16 rounded-2xl font-black text-xl uppercase tracking-widest text-white shadow-xl shadow-black/30 flex items-center justify-center gap-3 transition-transform active:scale-95 hover:brightness-110 ${accentBg}`}
         >
            <ThumbsUp size={24} />
            {mode === 'planes' ? '¡Vamos!' : '¡Reservar!'}
         </button>
         
         <button 
            onClick={handleReroll}
            className="w-full h-14 rounded-xl font-bold text-sm uppercase tracking-widest text-textSec bg-surface/50 border border-white/5 hover:bg-surface flex items-center justify-center gap-2 active:scale-95 transition-all"
         >
            <Sparkles size={18} />
            Probar otra opción
         </button>
      </div>

    </div>
  );
};