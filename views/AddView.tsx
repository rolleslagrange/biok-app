import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMode } from '../App';
import { addItem, getItems, updateItem } from '../services/mockData';
import { Author, PlanLocation, PlanDuration, PriceRange, MealType, Item, LinkItem, PlanItem, ComerItem } from '../types';
import { Save, User, Car, Euro, Link as LinkIcon, Plus, Trash2, X, ArrowLeft } from 'lucide-react';

export const AddView: React.FC = () => {
  const { mode } = useMode();
  const navigate = useNavigate();
  const { id } = useParams(); // Check if editing
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState<Author | null>(null);
  const [timeLasCarreras, setTimeLasCarreras] = useState<string>('');
  const [timePortu, setTimePortu] = useState<string>('');
  const [carNeeded, setCarNeeded] = useState(false);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [createdAt, setCreatedAt] = useState<number>(Date.now());
  
  // Link State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [tempLinkLabel, setTempLinkLabel] = useState('');
  const [tempLinkUrl, setTempLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Mode Specific
  const [price, setPrice] = useState<string>(''); // For Plan
  const [location, setLocation] = useState<PlanLocation>(PlanLocation.CITY); // For Plan
  const [duration, setDuration] = useState<PlanDuration>(PlanDuration.SHORT); // For Plan
  
  const [priceRange, setPriceRange] = useState<PriceRange>(PriceRange.MID); // For Comer
  const [mealTypes, setMealTypes] = useState<MealType[]>([]); // For Comer

  const accentColor = mode === 'planes' ? 'text-planes' : 'text-comer';
  const accentBg = mode === 'planes' ? 'bg-planes' : 'bg-comer';

  // Load data if editing OR load defaults
  useEffect(() => {
    if (id) {
        setLoading(true);
        getItems(mode).then(items => {
            const item = items.find(i => i.id === id);
            if (item) {
                setTitle(item.title);
                setAuthor(item.createdBy);
                setTimeLasCarreras(item.time_las_carreras.toString());
                setTimePortu(item.time_portu.toString());
                setCarNeeded(item.car_needed);
                setNotes(item.notes || '');
                setLinks(item.links || []);
                setIsFavorite(item.isFavorite);
                setIsDone(item.isDone);
                setCreatedAt(item.createdAt);

                if (item.type === 'plan') {
                    setPrice((item as PlanItem).price.toString());
                    setLocation((item as PlanItem).location);
                    setDuration((item as PlanItem).duration);
                } else {
                    setPriceRange((item as ComerItem).price_range);
                    setMealTypes((item as ComerItem).meal_type);
                }
            }
            setLoading(false);
        });
    } else {
        // Reset form for add mode AND CHECK DEFAULTS
        const defaultAuthor = localStorage.getItem('biok_default_author');
        if (defaultAuthor) setAuthor(defaultAuthor as Author);
        else setAuthor(null);

        setTitle('');
        setTimeLasCarreras('');
        setTimePortu('');
        setCarNeeded(false);
        setNotes('');
        setLinks([]);
        setPrice('');
        setLocation(PlanLocation.CITY);
        setPriceRange(PriceRange.MID);
        setMealTypes([]);
        setLoading(false);
    }
  }, [id, mode]);

  const handleSubmit = async () => {
    if (!title || !timeLasCarreras || !timePortu || !author) return;

    setSubmitting(true);
    const baseItem = {
        id: id || crypto.randomUUID(), // Keep ID if editing
        title,
        createdBy: author,
        time_las_carreras: Number(timeLasCarreras),
        time_portu: Number(timePortu),
        car_needed: carNeeded,
        notes,
        isFavorite: isFavorite,
        isDone: isDone,
        createdAt: createdAt,
        links: links
    };

    let newItem: Item;

    if (mode === 'planes') {
        newItem = {
            ...baseItem,
            type: 'plan',
            price: Number(price),
            location,
            duration
        };
    } else {
        newItem = {
            ...baseItem,
            type: 'comer',
            price_range: priceRange,
            meal_type: mealTypes
        };
    }

    if (id) {
        await updateItem(newItem);
    } else {
        await addItem(newItem);
    }
    
    setSubmitting(false);
    // Use replace: true to prevent history loops when saving edits
    navigate(id ? `/detail/${id}` : '/catalog', { replace: true });
  };

  const toggleMealType = (type: MealType) => {
    if (mealTypes.includes(type)) {
        setMealTypes(mealTypes.filter(t => t !== type));
    } else {
        setMealTypes([...mealTypes, type]);
    }
  };

  const addLink = () => {
    if (tempLinkLabel && tempLinkUrl) {
      setLinks([...links, { label: tempLinkLabel, url: tempLinkUrl }]);
      setTempLinkLabel('');
      setTempLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  if (loading) return <div className="p-8 text-center text-textSec">Cargando datos...</div>;

  return (
    <div className={`min-h-full ${id ? 'bg-background' : ''}`}>
      
      {/* Custom Header for Edit Mode (Since Shell is hidden) */}
      {id && (
          <header className="sticky top-0 z-40 bg-background/90 backdrop-blur px-4 py-4 flex items-center gap-4 border-b border-white/5">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface text-textSec hover:text-white transition-colors">
                  <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-extrabold tracking-wider text-textMain">Editar</h1>
          </header>
      )}

      <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ${id ? 'p-6 pt-6 pb-10' : 'p-6 pb-32'}`}>
        
        {/* Title */}
        <div>
          <input 
              type="text" 
              placeholder={mode === 'planes' ? "Nombre del plan..." : "Nombre del sitio..."}
              className="w-full bg-transparent border-0 border-b-2 border-line focus:border-white text-2xl font-bold placeholder-gray-600 px-0 py-2 outline-none transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Author - Borders removed */}
        <div className="space-y-2">
          <label className="text-base font-bold text-textSec uppercase tracking-wider">Propuesto por</label>
          <div className="flex gap-4">
              {[Author.SERGIO, Author.NEREA].map(a => (
                  <button
                      key={a}
                      onClick={() => setAuthor(a)}
                      className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${author === a ? `${accentBg} text-white shadow-lg` : 'bg-surface text-textSec'}`}
                  >
                      <User size={18} />
                      <span className="font-bold">{a}</span>
                  </button>
              ))}
          </div>
        </div>

        {/* Logistics - Borders removed */}
        <div className="space-y-2">
          <label className="text-base font-bold text-textSec uppercase tracking-wider">Tiempos de viaje (min)</label>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-xl p-3 transition-colors">
                  <span className="text-xs text-textSec block mb-1">Desde Las Carreras</span>
                  <input 
                      type="number" 
                      className="w-full bg-transparent text-base font-bold outline-none placeholder-gray-600" 
                      placeholder="0"
                      value={timeLasCarreras}
                      onChange={(e) => setTimeLasCarreras(e.target.value)}
                  />
              </div>
              <div className="bg-surface rounded-xl p-3 transition-colors">
                  <span className="text-xs text-textSec block mb-1">Desde Portu</span>
                  <input 
                      type="number" 
                      className="w-full bg-transparent text-base font-bold outline-none placeholder-gray-600" 
                      placeholder="0"
                      value={timePortu}
                      onChange={(e) => setTimePortu(e.target.value)}
                  />
              </div>
          </div>
        </div>

        {/* Car Toggle - Styled Switch */}
        <div 
          onClick={() => setCarNeeded(!carNeeded)}
          className="flex items-center justify-between bg-surface p-4 rounded-xl cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
              <Car size={20} className={carNeeded ? 'text-white' : 'text-textSec'} />
              <span className={`font-bold text-base ${carNeeded ? 'text-white' : 'text-textSec'}`}>Coche necesario</span>
          </div>
          {/* Toggle Switch */}
          <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${carNeeded ? accentBg : 'bg-toggle'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${carNeeded ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>

        <hr className="border-line" />

        {/* MODE SPECIFIC FIELDS */}
        {mode === 'planes' ? (
          <>
              {/* Price - Height fixed to h-14 to match Comer buttons */}
              <div className="space-y-2">
                  <label className="text-base font-bold text-textSec uppercase tracking-wider">Precio</label>
                  <div className="bg-surface rounded-xl h-14 px-4 flex items-center">
                      <Euro size={20} className="text-textSec mr-2" />
                      <input 
                          type="number" 
                          className="w-full bg-transparent text-base font-bold outline-none" 
                          placeholder="0"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                      />
                  </div>
              </div>

              {/* Location (Entorno Style) - Height matched to Comer Meal Type buttons */}
              <div className="space-y-2">
                  <label className="text-base font-bold text-textSec uppercase tracking-wider">Ubicación</label>
                  <div className="grid grid-cols-3 gap-2">
                      {Object.values(PlanLocation).map(loc => (
                          <button
                              key={loc}
                              onClick={() => setLocation(loc)}
                              className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${location === loc ? `${accentBg} text-white` : 'bg-surface text-textSec hover:text-textMain'}`}
                          >
                              <span className="text-2xl">
                                  {loc === 'home' ? '🏠' : loc === 'city' ? '🏙️' : '🌲'}
                              </span>
                              {loc === 'home' ? 'Casa' : loc === 'city' ? 'Ciudad' : 'Naturaleza'}
                          </button>
                      ))}
                  </div>
              </div>
          </>
        ) : (
          <>
              {/* Price Range (Coste Style) - Height fixed to h-14 */}
              <div className="space-y-2">
                  <label className="text-base font-bold text-textSec uppercase tracking-wider">Rango de Precio</label>
                  <div className="flex gap-2">
                      {[PriceRange.LOW, PriceRange.MID, PriceRange.HIGH].map(range => (
                          <button
                              key={range}
                              onClick={() => setPriceRange(range)}
                              className={`flex-1 h-14 rounded-xl font-bold flex items-center justify-center transition-all ${priceRange === range ? `${accentBg} text-white` : 'bg-surface text-textSec hover:border-textSec'}`}
                          >
                              {range === 'low' ? '€' : range === 'mid' ? '€€' : '€€€'}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Meal Type (Momento Style) */}
              <div className="space-y-2">
                  <label className="text-base font-bold text-textSec uppercase tracking-wider">Momento</label>
                  <div className="grid grid-cols-3 gap-2">
                      <button 
                          onClick={() => toggleMealType(MealType.LUNCH)}
                          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${mealTypes.includes(MealType.LUNCH) ? `${accentBg} text-white` : 'bg-surface text-textSec'}`}
                      >
                          <span className="text-2xl">☀️</span>
                          Comida
                      </button>
                      <button 
                          onClick={() => toggleMealType(MealType.DINNER)}
                          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${mealTypes.includes(MealType.DINNER) ? `${accentBg} text-white` : 'bg-surface text-textSec'}`}
                      >
                          <span className="text-2xl">🌙</span>
                          Cena
                      </button>
                      <button 
                          onClick={() => toggleMealType(MealType.BAR)}
                          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${mealTypes.includes(MealType.BAR) ? `${accentBg} text-white` : 'bg-surface text-textSec'}`}
                      >
                          <span className="text-2xl">🍻</span>
                          Tomar algo
                      </button>
                  </div>
              </div>
          </>
        )}

        {/* Links Section - Borders removed */}
        <div className="space-y-2">
          <label className="text-base font-bold text-textSec uppercase tracking-wider flex justify-between items-center">
              Enlaces
              <button 
                  onClick={() => setShowLinkInput(true)} 
                  className={`text-base flex items-center gap-1 px-2 py-1 rounded bg-surface ${accentColor}`}
                  disabled={showLinkInput}
              >
                  <Plus size={12} /> Añadir
              </button>
          </label>
          
          <div className="space-y-2">
              {links.map((link, index) => (
                  <div key={index} className="flex items-center justify-between bg-surface p-3 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                          <LinkIcon size={16} className="text-textSec flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold truncate">{link.label}</span>
                              <span className="text-xs text-textSec truncate">{link.url}</span>
                          </div>
                      </div>
                      <button onClick={() => removeLink(index)} className="text-textSec hover:text-red-400 p-2">
                          <Trash2 size={16} />
                      </button>
                  </div>
              ))}

              {showLinkInput && (
                  <div className="bg-surface p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col gap-2">
                          <input 
                              type="text" 
                              placeholder="Nombre (ej: Entradas)" 
                              className="bg-background rounded-lg p-2 text-sm outline-none focus:text-textMain"
                              value={tempLinkLabel}
                              onChange={(e) => setTempLinkLabel(e.target.value)}
                          />
                          <input 
                              type="url" 
                              placeholder="https://..." 
                              className="bg-background rounded-lg p-2 text-sm outline-none focus:text-textMain"
                              value={tempLinkUrl}
                              onChange={(e) => setTempLinkUrl(e.target.value)}
                          />
                          <div className="flex gap-2 mt-1">
                              <button 
                                  onClick={addLink} 
                                  disabled={!tempLinkLabel || !tempLinkUrl}
                                  className={`flex-1 py-2 rounded-lg font-bold text-xs text-white ${accentBg} disabled:opacity-50`}
                              >
                                  Añadir
                              </button>
                              <button 
                                  onClick={() => setShowLinkInput(false)} 
                                  className="px-3 py-2 rounded-lg font-bold text-xs bg-toggle text-textSec hover:text-white"
                              >
                                  <X size={16} />
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
        </div>

        {/* Notes - Fixed size, max length */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
              <label className="text-base font-bold text-textSec uppercase tracking-wider">Notas</label>
              <span className={`text-base font-bold transition-colors ${notes.length === 280 ? 'text-red-400' : 'text-textSec'}`}>
                  {notes.length}/280
              </span>
          </div>
          <textarea 
              className="w-full bg-surface rounded-xl p-4 outline-none text-base h-40 resize-none placeholder-gray-600 transition-colors"
              placeholder="Detalles extra..."
              value={notes}
              maxLength={280}
              onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={!title || !timeLasCarreras || !timePortu || !author || submitting}
          className={`w-full py-4 rounded-xl font-extrabold text-lg uppercase tracking-widest shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
              (!title || !timeLasCarreras || !timePortu || !author) 
              ? 'bg-surface text-gray-500 cursor-not-allowed' 
              : `${accentBg} text-white`
          }`}
        >
          <Save size={20} />
          {submitting ? (id ? 'Actualizando...' : 'Guardando...') : (id ? 'Actualizar' : 'Guardar')}
        </button>
      </div>

    </div>
  );
};