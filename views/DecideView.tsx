import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../App';
import { getItems } from '../services/mockData';
import { Item, PlanItem, ComerItem, PlanLocation, MealType, PriceRange } from '../types';
import { Sparkles, MapPin, Clock, Euro, Car, Repeat, Loader2 } from 'lucide-react';

export const DecideView: React.FC = () => {
  const { mode } = useMode();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [maxTime, setMaxTime] = useState(30);
  const [origin, setOrigin] = useState<'las_carreras' | 'portu'>('las_carreras');
  const [carAvailable, setCarAvailable] = useState(true);
  const [allowRepeat, setAllowRepeat] = useState(false);
  
  // Plan Specific Filters
  const [planLocation, setPlanLocation] = useState<PlanLocation | null>(null);
  const [maxPrice, setMaxPrice] = useState(50);
  
  // Comer Specific Filters
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);

  // Animation State
  const [isDeciding, setIsDeciding] = useState(false);
  const [shuffleText, setShuffleText] = useState('');

  useEffect(() => {
    setLoading(true);
    getItems(mode).then((data) => {
      setItems(data);
      setLoading(false);
    });
    
    // Load Default Origin
    const defaultOrigin = localStorage.getItem('biok_default_origin');
    if (defaultOrigin && (defaultOrigin === 'las_carreras' || defaultOrigin === 'portu')) {
        setOrigin(defaultOrigin as any);
    }
  }, [mode]);

  // ADAPTIVE UI LOGIC
  const DEFAULT_MAX_TIME = 90;
  const DEFAULT_MAX_PRICE = 100;

  const dynamicMaxTime = useMemo(() => {
    if (items.length === 0) return DEFAULT_MAX_TIME;
    const max = items.reduce((acc, item) => {
      const time = origin === 'las_carreras' ? item.time_las_carreras : item.time_portu;
      return time > acc ? time : acc;
    }, 0);
    return Math.max(DEFAULT_MAX_TIME, max);
  }, [items, origin]);

  const dynamicMaxPrice = useMemo(() => {
    if (mode !== 'planes' || items.length === 0) return DEFAULT_MAX_PRICE;
    const max = items.reduce((acc, item) => {
      if (item.type === 'plan') {
         return item.price > acc ? item.price : acc;
      }
      return acc;
    }, 0);
    return Math.max(DEFAULT_MAX_PRICE, max);
  }, [items, mode]);

  const accentColor = mode === 'planes' ? 'text-planes' : 'text-comer';
  const accentBg = mode === 'planes' ? 'bg-planes' : 'bg-comer';
  const sliderColor = mode === 'planes' ? 'accent-planes' : 'accent-comer';

  const toggleFilter = <T,>(current: T[], item: T, setter: (val: T[]) => void) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const getFilteredItems = () => {
    return items.filter(item => {
      // Common filters
      if (!allowRepeat && item.isDone) return false;
      
      const travelTime = origin === 'las_carreras' ? item.time_las_carreras : item.time_portu;
      if (travelTime > maxTime) return false;
      if (!carAvailable && item.car_needed) return false;

      // Mode specific
      if (mode === 'planes') {
        const plan = item as PlanItem;
        if (planLocation && plan.location !== planLocation) return false;
        if (plan.price > maxPrice) return false;
      } else {
        const comer = item as ComerItem;
        if (mealTypes.length > 0 && !mealTypes.some(t => comer.meal_type.includes(t))) return false;
        if (priceRanges.length > 0 && !priceRanges.includes(comer.price_range)) return false;
      }
      return true;
    });
  };

  const filteredCount = getFilteredItems().length;

  const handleDecide = () => {
    const candidates = getFilteredItems();
    if (candidates.length === 0) return;

    // Start Animation Sequence
    setIsDeciding(true);
    
    // Pick winner immediately
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    
    // Shuffle Effect
    let iteration = 0;
    // 5 seconds total duration: 62 iterations * 80ms approx = 4960ms
    const maxIterations = 62; 
    
    const interval = setInterval(() => {
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
        setShuffleText(randomItem.title);
        iteration++;

        if (iteration >= maxIterations) {
            clearInterval(interval);
            // Navigate to Proposal View instead of Detail View
            navigate(`/proposal/${winner.id}`);
        }
    }, 80);
  };

  return (
    <div className="p-6 pb-48 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Origin Selection */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-textSec uppercase tracking-wider flex items-center gap-2">
          <MapPin size={18} /> Salida
        </h3>
        {/* Updated to match Author buttons in AddView */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setOrigin('las_carreras')}
            className={`h-14 rounded-xl font-bold flex items-center justify-center transition-all ${origin === 'las_carreras' ? `${accentBg} text-white shadow-lg` : 'bg-surface text-textSec'}`}
          >
            Las Carreras
          </button>
          <button
            onClick={() => setOrigin('portu')}
            className={`h-14 rounded-xl font-bold flex items-center justify-center transition-all ${origin === 'portu' ? `${accentBg} text-white shadow-lg` : 'bg-surface text-textSec'}`}
          >
            Portu
          </button>
        </div>
      </section>

      {/* Travel Time Slider */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-textSec uppercase tracking-wider flex items-center gap-2">
            <Clock size={18} /> Viaje Máx.
            </h3>
            <span className={`text-base font-bold ${accentColor}`}>{maxTime} min</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max={dynamicMaxTime} 
            step="5"
            value={maxTime} 
            onChange={(e) => setMaxTime(Number(e.target.value))}
            className={`w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer ${sliderColor}`}
        />
      </section>

      {/* Toggles Grid */}
      <div className="grid grid-cols-1 gap-4">
          {/* Car Toggle - Border Removed */}
          <section className="flex items-center justify-between bg-surface p-4 rounded-xl">
             <div className="flex items-center gap-3">
                <Car size={20} className={carAvailable ? 'text-textMain' : 'text-textSec'} />
                <span className="font-bold text-base">¿Tenemos coche?</span>
             </div>
             <div 
               className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${carAvailable ? accentBg : 'bg-toggle'}`}
               onClick={() => setCarAvailable(!carAvailable)}
             >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${carAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </div>
          </section>

          {/* Repeat Toggle - Border Removed */}
          <section className="flex items-center justify-between bg-surface p-4 rounded-xl">
             <div className="flex items-center gap-3">
                <Repeat size={20} className={allowRepeat ? 'text-textMain' : 'text-textSec'} />
                <span className="font-bold text-base">¿Repetir?</span>
             </div>
             <div 
               className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${allowRepeat ? accentBg : 'bg-toggle'}`}
               onClick={() => setAllowRepeat(!allowRepeat)}
             >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${allowRepeat ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </div>
          </section>
      </div>

      <hr className="border-line" />

      {/* MODE SPECIFIC FILTERS */}
      {mode === 'planes' ? (
        <>
            {/* Location Type - Updated to match AddView style (p-3 gap-1) */}
            <section className="space-y-3">
                <h3 className="text-base font-bold text-textSec uppercase tracking-wider">Ubicación</h3>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(PlanLocation).map(loc => (
                        <button
                            key={loc}
                            onClick={() => setPlanLocation(planLocation === loc ? null : loc)}
                            className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${planLocation === loc ? `${accentBg} text-white` : 'bg-surface text-textSec hover:text-textMain'}`}
                        >
                            <span className="text-2xl">
                                {loc === 'home' ? '🏠' : loc === 'city' ? '🏙️' : '🌲'}
                            </span>
                            {loc === 'home' ? 'Casa' : loc === 'city' ? 'Ciudad' : 'Naturaleza'}
                        </button>
                    ))}
                </div>
            </section>

            {/* Price Exact */}
             <section className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-textSec uppercase tracking-wider flex items-center gap-2">
                    Presupuesto
                    </h3>
                    <span className={`text-base font-bold ${accentColor}`}>{maxPrice} €</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max={dynamicMaxPrice} 
                    step="5"
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-planes"
                />
            </section>
        </>
      ) : (
        <>
            {/* Meal Type - Updated to match AddView style (p-3 gap-1) */}
            <section className="space-y-3">
                <h3 className="text-base font-bold text-textSec uppercase tracking-wider">Momento</h3>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => toggleFilter(mealTypes, MealType.LUNCH, setMealTypes)}
                        className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${mealTypes.includes(MealType.LUNCH) ? `${accentBg} text-white` : 'bg-surface text-textSec'}`}
                    >
                        <span className="text-2xl">☀️</span>
                        Comida
                    </button>
                    <button 
                        onClick={() => toggleFilter(mealTypes, MealType.DINNER, setMealTypes)}
                        className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${mealTypes.includes(MealType.DINNER) ? `${accentBg} text-white` : 'bg-surface text-textSec'}`}
                    >
                        <span className="text-2xl">🌙</span>
                        Cena
                    </button>
                    <button 
                        onClick={() => toggleFilter(mealTypes, MealType.BAR, setMealTypes)}
                        className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${mealTypes.includes(MealType.BAR) ? `${accentBg} text-white` : 'bg-surface text-textSec'}`}
                    >
                        <span className="text-2xl">🍻</span>
                        Tomar algo
                    </button>
                </div>
            </section>

             {/* Price Range - Updated to h-14 to match AddView */}
             <section className="space-y-3">
                <h3 className="text-base font-bold text-textSec uppercase tracking-wider">Presupuesto</h3>
                <div className="flex gap-2">
                     {[PriceRange.LOW, PriceRange.MID, PriceRange.HIGH].map(range => (
                         <button
                            key={range}
                            onClick={() => toggleFilter(priceRanges, range, setPriceRanges)}
                            className={`flex-1 h-14 rounded-xl font-bold flex items-center justify-center transition-all ${priceRanges.includes(range) ? `${accentBg} text-white` : 'bg-surface text-textSec'}`}
                        >
                            {range === 'low' ? '€' : range === 'mid' ? '€€' : '€€€'}
                        </button>
                     ))}
                </div>
            </section>
        </>
      )}

      {/* Floating Action CTA - Border Removed */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
            <div className="text-center mb-3">
                <span className={`text-base font-bold uppercase tracking-wider py-1 px-3 rounded-full bg-background ${accentColor}`}>
                    {loading ? '...' : `${filteredCount} opciones disponibles`}
                </span>
            </div>
            <button
                onClick={handleDecide}
                disabled={filteredCount === 0}
                className={`w-full py-6 rounded-2xl font-black text-2xl uppercase tracking-widest text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-3 ${filteredCount === 0 ? 'bg-toggle cursor-not-allowed opacity-50' : accentBg}`}
            >
                <Sparkles size={28} />
                ¡ELEGIR YA!
            </button>
        </div>
      </div>

      {/* ANIMATION OVERLAY - RENDERED IN PORTAL TO COVER EVERYTHING */}
      {isDeciding && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 touch-none">
            {/* Pulsing Aura */}
            <div className="relative mb-12">
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 animate-pulse ${accentBg}`}></div>
                <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center ${accentBg} text-white shadow-2xl animate-bounce`}>
                    <Sparkles size={64} fill="currentColor" className="animate-pulse" />
                </div>
            </div>
            
            <div className="h-32 flex items-center justify-center w-full">
                <h2 className="text-4xl font-black text-center leading-tight animate-in slide-in-from-bottom-2 duration-100 key={shuffleText}">
                    {shuffleText}
                </h2>
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-3">
                <Loader2 size={32} className={`animate-spin ${accentColor}`} />
                <p className="text-textSec font-extrabold tracking-widest uppercase text-sm animate-pulse">
                    Consultando al oráculo...
                </p>
            </div>
        </div>,
        document.body
      )}

    </div>
  );
};