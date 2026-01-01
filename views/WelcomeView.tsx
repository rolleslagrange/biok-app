import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../App';
import { 
  Tent, UtensilsCrossed, MapPin, Ticket, Beer, Pizza, Popcorn, Mountain, 
  Waves, Coffee, Music, Car, Bike, Camera, Gamepad2, Dumbbell, Plane, 
  Binoculars, Compass, Palette, Trophy, Wine, Croissant, Cake, IceCream2, 
  Sandwich, Apple, Beef, CloudSun, Moon, Umbrella, Heart, Star, Anchor, 
  Fish, Flame, Gift, ShoppingBag, Sofa, Tv, Sparkles
} from 'lucide-react';
import { AppMode } from '../types';

// Full Icon Set
const allIcons = [
  Tent, UtensilsCrossed, MapPin, Ticket, Beer, Pizza, Popcorn, Mountain, 
  Waves, Coffee, Music, Car, Bike, Camera, Gamepad2, Dumbbell, Plane, 
  Binoculars, Compass, Palette, Trophy, Wine, Croissant, Cake, IceCream2, 
  Sandwich, Apple, Beef, CloudSun, Moon, Umbrella, Heart, Star, Anchor, 
  Fish, Flame, Gift, ShoppingBag, Sofa, Tv
];

// Helper: Fisher-Yates shuffle to randomize icons without immediate repetition
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const IconBackground = () => {
  // CONFIGURATION
  const TILE_SIZE = 600; // Smaller tile size for better performance (600px square)
  const ICON_GAP = 100; // Space between icon centers
  
  // Calculate grid dimensions within the tile
  const COLS = Math.ceil(TILE_SIZE / ICON_GAP);
  const ROWS = Math.ceil(TILE_SIZE / ICON_GAP);

  // Generate the Master Tile layout ONE time
  const tileLayout = useMemo(() => {
    const layout = [];
    const totalSlots = ROWS * COLS;
    
    // Create a "Bag" of icons that guarantees all icons are used at least once
    // before repeating. This solves the "lack of variety" issue.
    let iconBag: typeof allIcons = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // Refill bag if empty
        if (iconBag.length === 0) {
            iconBag = shuffleArray(allIcons);
        }
        
        const Icon = iconBag.pop()!; // Take one unique icon
        
        // Staggered Position (Brick Layout)
        // Shift every odd row by half the gap
        const xOffset = (row % 2) * (ICON_GAP / 2);
        
        // Exact pixel position
        const x = col * ICON_GAP + xOffset;
        const y = row * ICON_GAP;

        // Visual tweaks
        const opacity = 0.15 + (Math.random() * 0.25); // Random opacity 0.15 - 0.4
        const rotation = Math.random() * 20 - 10; // Slight tilt -10deg to 10deg

        layout.push({ id: `${row}-${col}`, Icon, x, y, opacity, rotation });
      }
    }
    return layout;
  }, []); // Empty dependency array = calculated once on mount

  // Render a single 600x600 Tile
  const MasterTile = () => (
    <div 
      className="relative flex-none overflow-hidden" 
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    >
      {tileLayout.map(({ id, Icon, x, y, opacity, rotation }) => (
        <div 
          key={id}
          className="absolute flex items-center justify-center text-slate-400 dark:text-slate-600"
          style={{ 
            left: x, 
            top: y, 
            opacity, 
            transform: `rotate(${rotation}deg)` 
          }}
        >
          <Icon size={28} strokeWidth={2} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-50 pointer-events-none select-none">
      <style>
        {`
          @keyframes scroll-seamless {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-${TILE_SIZE}px, -${TILE_SIZE}px, 0); }
          }
          .animate-seamless {
            /* 30s for a smooth glide */
            animation: scroll-seamless 40s linear infinite;
            will-change: transform;
            display: flex;
            flex-direction: column;
            /* Start slightly off-screen to ensure coverage */
            margin-left: -20px; 
            margin-top: -20px;
          }
          .row-flex {
             display: flex;
          }
        `}
      </style>

      {/* 
         THE STRATEGY: 
         We render a 3x3 Grid of the MasterTile.
         Total Area covered: 1800px x 1800px.
         Animation moves diagonally by exactly 1 Tile Size (600px).
         Once it moves 600px, it resets to 0.
         Since Tile 2 is identical to Tile 1, the reset is invisible.
         This is extremely lightweight compared to a 4000px mesh.
      */}
      <div className="animate-seamless">
         {[0, 1, 2].map((rowIndex) => (
             <div key={rowIndex} className="row-flex">
                 {[0, 1, 2].map((colIndex) => (
                     <MasterTile key={`${rowIndex}-${colIndex}`} />
                 ))}
             </div>
         ))}
      </div>
    </div>
  );
};

export const WelcomeView: React.FC = () => {
  const { setMode } = useMode();
  const navigate = useNavigate();

  const handleSelection = (selectedMode: AppMode) => {
    setMode(selectedMode);
    navigate('/decide');
  };

  return (
    // LIGHT MODE Background: Slate-50 (#F8FAFC) - Clean and soft on the eyes
    <div className="h-full flex flex-col p-4 overflow-hidden animate-in zoom-in-95 duration-500 absolute inset-0 z-50 bg-slate-50">
      
      {/* Background Pattern */}
      <IconBackground />

      {/* Top Card: Planes */}
      {/* Mobile Optimized: Color (Blue-50/60), NO Blur, White Icon Circle */}
      <button
        onClick={() => handleSelection('planes')}
        className="group relative flex-1 w-full flex flex-col items-center justify-center bg-blue-50/60 border-2 border-blue-200 rounded-3xl p-4 transition-all active:scale-95 shadow-2xl shadow-blue-200/50 overflow-hidden z-10"
      >
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center w-full">
          {/* Icon Circle: Now White to pop against the blue card */}
          <div className="p-6 rounded-full bg-white text-blue-500 shadow-sm transition-all duration-300">
            <Tent size={56} strokeWidth={2.5} />
          </div>
          {/* Title matches Icon Color */}
          <span className="text-3xl font-black uppercase tracking-[0.2em] text-blue-600 drop-shadow-sm">
            Planes
          </span>
        </div>
      </button>

      {/* Center Title */}
      <div className="flex-none py-8 flex items-center justify-center z-10 relative">
        {/* 
           Layout Logic: 
           Using Flexbox centers the *entire group* (Title + Asterisk). 
           This ensures the left margin of 'B' equals the right margin of the 'Sparkle'.
        */}
        <div className="flex items-start">
            {/* Dark Text on Light BG - Slate 800 */}
            <h1 className="text-8xl font-[1000] tracking-[0.15em] text-slate-800 drop-shadow-sm select-none opacity-90 leading-none">
              BIOK
            </h1>
            
            {/* Asterisk Sparkle - Flow relative */}
            {/* -ml-3 to pull it closer to the K (counteracting tracking), -mt-2 for superscript effect */}
            <div className="-ml-3 -mt-2">
                <Sparkles 
                    size={42} 
                    strokeWidth={0} // Solid fill
                    className="text-slate-800 fill-slate-800 opacity-90"
                />
            </div>
        </div>
      </div>

      {/* Bottom Card: Comer */}
      {/* Mobile Optimized: Color (Orange-50/60), NO Blur, White Icon Circle */}
      <button
        onClick={() => handleSelection('comer')}
        className="group relative flex-1 w-full flex flex-col items-center justify-center bg-orange-50/60 border-2 border-orange-200 rounded-3xl p-4 transition-all active:scale-95 shadow-2xl shadow-orange-200/50 overflow-hidden z-10"
      >
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center w-full">
          {/* Icon Circle: Now White to pop against the orange card */}
          <div className="p-6 rounded-full bg-white text-orange-500 shadow-sm transition-all duration-300">
            <UtensilsCrossed size={56} strokeWidth={2.5} />
          </div>
          {/* Title matches Icon Color */}
          <span className="text-3xl font-black uppercase tracking-[0.2em] text-orange-600 drop-shadow-sm">
            Comer
          </span>
        </div>
      </button>

    </div>
  );
};