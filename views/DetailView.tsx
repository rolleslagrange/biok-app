import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMode } from '../App';
import { getItems, updateItem, deleteItem } from '../services/mockData';
import { Item, PlanItem, ComerItem, MealType } from '../types';
import { ArrowLeft, Star, Clock, MapPin, Car, Trash2, CheckCircle, ExternalLink, Edit, AlertTriangle } from 'lucide-react';

export const DetailView: React.FC = () => {
  const { id } = useParams();
  const { mode } = useMode();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const accentColor = mode === 'planes' ? 'text-planes' : 'text-comer';
  const accentBg = mode === 'planes' ? 'bg-planes' : 'bg-comer';
  
  useEffect(() => {
    getItems(mode).then(items => {
        const found = items.find(i => i.id === id);
        if (found) setItem(found);
    });
  }, [id, mode]);

  if (!item) return <div className="p-8 text-center text-textSec">Cargando...</div>;

  const toggleFavorite = async () => {
    const updated = { ...item, isFavorite: !item.isFavorite };
    await updateItem(updated);
    setItem(updated);
  };

  const confirmDelete = async () => {
    if (item && item.id) {
        await deleteItem(item.id, mode);
        setShowDeleteModal(false);
        navigate('/catalog');
    }
  };

  const handleComplete = async () => {
    // When completing, we must clear isActive
    const updated = { ...item, isDone: true, isActive: false, completedAt: Date.now() };
    await updateItem(updated);
    navigate('/catalog');
  }

  const isPlan = item.type === 'plan';

  // Translators
  const getLocationLabel = (loc: string) => {
    const map: Record<string, string> = { 'home': 'Casa', 'city': 'Ciudad', 'nature': 'Naturaleza' };
    return map[loc] || loc;
  };

  const getMealLabel = (type: MealType) => {
    const map: Record<string, string> = { 'lunch': 'Comida', 'dinner': 'Cena', 'bar': 'Tomar algo' };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-background pb-10 relative">
      {/* Header - Border removed */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur px-4 py-4 flex items-center justify-between">
        {/* Explicit navigation to /catalog to prevent history loops */}
        <button onClick={() => navigate('/catalog')} className="p-2 rounded-full hover:bg-surface">
            <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
            <button onClick={() => navigate(`/edit/${item.id}`)} className="p-2 rounded-full hover:bg-surface text-gray-600 hover:text-white">
                <Edit size={24} />
            </button>
            <button onClick={toggleFavorite} className={`p-2 rounded-full hover:bg-surface ${item.isFavorite ? 'text-yellow-500' : 'text-gray-600'}`}>
                <Star size={24} fill={item.isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
         {/* Title Card */}
         <div className="space-y-2">
            <h1 className="text-3xl font-extrabold leading-tight">{item.title}</h1>
            <div className="flex items-center gap-2 text-sm font-bold text-textSec">
                {/* Badges - Borders removed */}
                <span className="bg-surface px-2 py-1 rounded">Por {item.createdBy}</span>
                {isPlan ? (
                    <span className="bg-surface px-2 py-1 rounded">{(item as PlanItem).price} €</span>
                ) : (
                    <span className="bg-surface px-2 py-1 rounded">{(item as ComerItem).price_range === 'low' ? '€' : (item as ComerItem).price_range === 'mid' ? '€€' : '€€€'}</span>
                )}
            </div>
         </div>

         {/* Meta Grid - Borders removed */}
         <div className="grid grid-cols-2 gap-3">
             <div className="bg-surface p-4 rounded-2xl flex flex-col gap-1">
                 <span className="text-xs text-textSec uppercase font-bold">Las Carreras</span>
                 <div className="flex items-center gap-2 text-lg font-bold">
                    <Clock size={18} className="text-textSec" />
                    {item.time_las_carreras} min
                 </div>
             </div>
             <div className="bg-surface p-4 rounded-2xl flex flex-col gap-1">
                 <span className="text-xs text-textSec uppercase font-bold">Portu</span>
                 <div className="flex items-center gap-2 text-lg font-bold">
                    <Clock size={18} className="text-textSec" />
                    {item.time_portu} min
                 </div>
             </div>
             <div className="bg-surface p-4 rounded-2xl flex flex-col gap-1">
                 <span className="text-xs text-textSec uppercase font-bold">Coche</span>
                 <div className="flex items-center gap-2 text-lg font-bold">
                    <Car size={18} className="text-textSec" />
                    {item.car_needed ? 'Sí' : 'No'}
                 </div>
             </div>
             <div className="bg-surface p-4 rounded-2xl flex flex-col gap-1">
                 <span className="text-xs text-textSec uppercase font-bold">
                    {isPlan ? 'Ubicación' : 'Momento'}
                 </span>
                 <div className="flex items-center gap-2 text-lg font-bold">
                    <MapPin size={18} className="text-textSec" />
                    {isPlan 
                        ? getLocationLabel((item as PlanItem).location)
                        : (item as ComerItem).meal_type.map(getMealLabel).join(', ')
                    }
                 </div>
             </div>
         </div>

         {/* Links Section - Borders removed */}
         {item.links && item.links.length > 0 && (
            <div className="bg-surface p-5 rounded-2xl">
                <h3 className="text-xs text-textSec uppercase font-bold mb-3">
                    Enlaces
                </h3>
                <div className="space-y-3">
                    {item.links.map((link, idx) => (
                        <a 
                            key={idx} 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`flex items-center justify-between p-3 rounded-xl bg-background hover:text-white transition-colors ${accentColor}`}
                        >
                            <span className="font-bold text-sm truncate pr-2">{link.label}</span>
                            <ExternalLink size={16} />
                        </a>
                    ))}
                </div>
            </div>
         )}

         {/* Notes - Borders removed */}
         {item.notes && (
             <div className="bg-surface p-5 rounded-2xl">
                 <h3 className="text-xs text-textSec uppercase font-bold mb-2">Notas</h3>
                 <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.notes}</p>
             </div>
         )}
         
         {/* Actions */}
         <div className="pt-4 space-y-4">
            {!item.isDone && (
                <button 
                    onClick={handleComplete}
                    className={`w-full py-4 rounded-xl font-extrabold text-lg uppercase tracking-widest text-white shadow-lg flex items-center justify-center gap-2 ${accentBg}`}
                >
                    <CheckCircle size={20} />
                    Completar
                </button>
            )}
            
            <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-red-400 bg-surface/50 flex items-center justify-center gap-2 active:bg-red-900/30 transition-colors"
            >
                <Trash2 size={16} />
                Eliminar
            </button>
         </div>
      </main>

      {/* Delete Confirmation Modal - Borders removed */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">¿Eliminar definitivamente?</h3>
                        <p className="text-sm text-textSec">
                            Estás a punto de borrar "{item.title}". Esta acción no se puede deshacer.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 py-3 rounded-xl font-bold bg-toggle text-textMain hover:bg-surface transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-900/20 transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};