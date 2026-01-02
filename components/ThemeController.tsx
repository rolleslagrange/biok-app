import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMode } from '../App';

export const ThemeController = () => {
    const { mode } = useMode();
    const location = useLocation();

    useEffect(() => {
        // 1. Definir los colores
        const COLORS = {
            welcome: '#F8FAFC', // Slate-50 (Pantalla de inicio clara)
            planes: '#111827',  // Gray-900 (Modo Planes por defecto)
            comer: '#1F1916',   // Warm-Dark (Modo Comer: rgb(31, 25, 22))
        };

        let targetColor = COLORS.planes;

        // 2. Lógica de decisión
        if (location.pathname === '/') {
            // Si estamos en la portada (WelcomeView), usamos el color claro
            targetColor = COLORS.welcome;
        } else {
            // Si estamos dentro de la app, depende del modo
            targetColor = mode === 'comer' ? COLORS.comer : COLORS.planes;
        }

        // 3. Aplicar el color a la etiqueta meta
        const metaThemeColor = document.querySelector("meta[name='theme-color']");
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', targetColor);
        }

        // 4. Actualizar clase del body (para el fondo CSS)
        document.body.className = mode === 'planes' ? 'theme-planes' : 'theme-comer';

    }, [mode, location.pathname]); // Se ejecuta cada vez que cambia el modo o la ruta

    return null; // Este componente no renderiza nada visual
};
