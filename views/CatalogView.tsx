import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../App';
import { getItems, updateItem } from '../services/mockData';
import { Item, PlanItem, ComerItem } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Search, Check, Star, Clock, User, Car, Flame } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  navigate: (path: string) => void;
  toggleDone: (e: React.MouseEvent, item: Item) => void;
  accentColor: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, navigate, toggleDone, accentColor }) => {
  const isPlan = item.type === 'plan';
  
  // Format Price Display
  let priceDisplay = '';
  if (isPlan) {
      const price = (item as PlanItem).price;
      priceDisplay = price === 0 ? 'Gratis' : `${price} €`;
  } else {
      const range = (item as ComerItem).price_range;
      priceDisplay = range === 'low' ? '€' : range === 'mid' ? '€€' : '€€€';
  }

  return (
      <div 
          onClick={() => navigate(`/detail/${item.id}`)}
          className={`group relative rounded-2xl p-4 mb-3 border bg-surface border-white/5 hover:border-white/10 shadow-sm active:scale-[0.98] transition-all duration-200 
            ${item.isDone ? 'opacity-50' : 'opacity-100'}
          `}
      >
          <div className="flex items-center gap-4">
              {/* Checkbox */}
              <button 
                  onClick={(e) => toggleDone(e, item)}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors 
                    ${item.isDone 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-textSec/30 hover:border-white text-transparent hover:text-white/20'
                    }`}
              >
                  <Check size={14} strokeWidth={4} />
              </button>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-3">
                      <h4 className={`text-base font-bold leading-snug break-words ${item.isDone ? 'line-through text-textSec' : 'text-textMain'}`}>
                          {item.title}
                      </h4>
                      
                       {item.isFavorite && !item.isDone && (
                           <Star size={16} className="text-yellow-400 fill-yellow-400 shrink-0" />
                       )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-textSec">
                      <span className={item.isActive ? accentColor : ''}>{priceDisplay}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{item.time_las_carreras}/{item.time_portu}</span>
                      </div>
                      {item.car_needed && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <Car size={12} />
                          </>
                      )}
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span>{item.createdBy}</span>
                  </div>
              </div>
          </div>
      </div>
  );
};

export const CatalogView: React.FC = () => {
  const { mode } = useMode();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');

  const accentColor = mode === 'planes' ? 'text-planes' : 'text-comer';

  useEffect(() => {
    getItems(mode).then(setItems);
  }, [mode]);

  const toggleDone = async (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    // Logic: If marking as done, it also stops being "Active"
    const updated = { 
        ...item, 
        isDone: !item.isDone, 
        isActive: false, 
        completedAt: !item.isDone ? Date.now() : undefined 
    };
    await updateItem(updated);
    setItems(items.map(i => i.id === item.id ? updated : i));
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    (i.notes && i.notes.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter Groups
  const activeItems = filteredItems.filter(i => i.isActive && !i.isDone);
  const pendingItems = filteredItems.filter(i => !i.isDone && !i.isActive).sort((a, b) => (b.isFavorite === a.isFavorite) ? 0 : b.isFavorite ? 1 : -1);
  const historyItems = filteredItems.filter(i => i.isDone).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div className="min-h-full pb-32">
      {/* Search Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-30 p-4 pb-2">
        <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSec group-focus-within:text-textMain transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full bg-surface text-sm font-bold text-textMain rounded-2xl pl-10 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-textSec/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="p-4 pt-2">
        
        {/* ACTIVE SECTION (IN PROGRESS) */}
        {activeItems.length > 0 && (
            <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 flex items-center gap-2 ${accentColor} opacity-90`}>
                    <Flame size={12} className="animate-pulse" />
                    {mode === 'planes' ? 'En curso' : 'Reservado'}
                </h3>
                {activeItems.map(item => (
                    <ItemCard 
                        key={item.id} 
                        item={item} 
                        navigate={navigate} 
                        toggleDone={toggleDone} 
                        accentColor={accentColor}
                    />
                ))}
            </div>
        )}

        {pendingItems.length > 0 && (
            <div className="mb-8">
                <h3 className="text-[10px] font-black text-textSec uppercase tracking-[0.2em] mb-3 ml-2 opacity-60">Pendientes</h3>
                {pendingItems.map(item => (
                    <ItemCard 
                        key={item.id} 
                        item={item} 
                        navigate={navigate} 
                        toggleDone={toggleDone} 
                        accentColor={accentColor} 
                    />
                ))}
            </div>
        )}

        {historyItems.length > 0 && (
            <div>
                 <h3 className="text-[10px] font-black text-textSec uppercase tracking-[0.2em] mb-3 ml-2 opacity-60">Historial</h3>
                 {historyItems.map(item => (
                    <ItemCard 
                        key={item.id} 
                        item={item} 
                        navigate={navigate} 
                        toggleDone={toggleDone} 
                        accentColor={accentColor} 
                    />
                 ))}
            </div>
        )}

        {items.length === 0 && <EmptyState message="No hay nada guardado aún" />}
      </div>
    </div>
  );
};