import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { Item } from '../types';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyA_cKpx6sG0DKWqsv3qhkqD_lACoJ0s6V4",
  authDomain: "biok-bd973.firebaseapp.com",
  projectId: "biok-bd973",
  storageBucket: "biok-bd973.firebasestorage.app",
  messagingSenderId: "535700244258",
  appId: "1:535700244258:web:8f8c093c1258af1686477b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HABILITAR PERSISTENCIA OFFLINE (Clave para PWA)
// Esto permite que la app funcione sin internet usando la caché local
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('BIOK: Múltiples pestañas abiertas. La persistencia solo funciona en una.');
  } else if (err.code == 'unimplemented') {
    console.warn('BIOK: El navegador no soporta persistencia offline.');
  }
});

// Collection Names
const COL_PLANES = 'planes';
const COL_COMER = 'comer';

export const getItems = async (mode: 'planes' | 'comer'): Promise<Item[]> => {
  try {
    const colRef = collection(db, mode === 'planes' ? COL_PLANES : COL_COMER);
    const q = query(colRef, orderBy('createdAt', 'desc')); 
    
    // Si estamos offline, esto leerá de la caché automáticamente
    const snapshot = await getDocs(q);
    
    const items: Item[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Item));
    
    return items;
  } catch (error: any) {
    console.error("Error fetching items from Firebase:", error);
    if (error.code === 'permission-denied') {
        alert("⚠️ Error de Permisos: Ve a Firebase Console > Firestore > Reglas y cambia 'allow read, write: if false;' por 'if true;'");
    }
    return [];
  }
};

export const addItem = async (item: Item): Promise<void> => {
  try {
    const colName = item.type === 'plan' ? COL_PLANES : COL_COMER;
    await setDoc(doc(db, colName, item.id), item);
  } catch (error: any) {
    console.error("Error adding item:", error);
    if (error.code === 'permission-denied') alert("Error de permisos al guardar. Revisa la consola de Firebase.");
    throw error;
  }
};

export const updateItem = async (item: Item): Promise<void> => {
  try {
    const colName = item.type === 'plan' ? COL_PLANES : COL_COMER;
    const { id, ...data } = item;
    await updateDoc(doc(db, colName, id), data as any);
  } catch (error: any) {
    console.error("Error updating item:", error);
    if (error.code === 'permission-denied') alert("Error de permisos al actualizar. Revisa la consola de Firebase.");
    throw error;
  }
};

export const deleteItem = async (id: string, mode: 'planes' | 'comer'): Promise<void> => {
  try {
    const colName = mode === 'planes' ? COL_PLANES : COL_COMER;
    await deleteDoc(doc(db, colName, id));
  } catch (error: any) {
    console.error("Error deleting item:", error);
    if (error.code === 'permission-denied') alert("Error de permisos al borrar. Revisa la consola de Firebase.");
    throw error;
  }
};