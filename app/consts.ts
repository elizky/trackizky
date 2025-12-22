import { Activity } from './types';

export const ACTIVITIES: Activity[] = [
  { id: 'read', label: 'Leí', category: 'Creativo' },
  { id: 'write', label: 'Escribí', category: 'Creativo' },
  { id: 'music', label: 'Hice música', category: 'Creativo' },
  { id: 'gym', label: 'Fui al gimnasio', category: 'Cuerpo' },
  { id: 'train', label: 'Entrené', category: 'Cuerpo' },
  { id: 'friends', label: 'Me junté con amigos', category: 'Social' },
  { id: 'asado', label: 'Hice un asado', category: 'Social' },
  { id: 'gaming', label: 'Vicié (Play / PC)', category: 'Ocio' },
  { id: 'delivery', label: 'Pedí delivery', category: 'Consumo' },
  { id: 'doomscroll', label: 'Doomscrolleé', category: 'Consumo' },
  { id: 'alcohol', label: 'Tomé alcohol', category: 'Consumo' },
  { id: 'weed', label: 'Fumé marihuana', category: 'Consumo' },
  { id: 'cry', label: 'Lloré', category: 'Emocional' },
  { id: 'panic', label: 'Tuve un ataque de pánico', category: 'Emocional' },
];
