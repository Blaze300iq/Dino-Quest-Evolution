
import React, { useState } from 'react';
import { KeyBindings } from '../types';

interface SettingsProps {
  bindings: KeyBindings;
  onUpdate: (bindings: KeyBindings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ bindings, onUpdate, onClose }) => {
  const [listeningKey, setListeningKey] = useState<keyof KeyBindings | null>(null);

  const handleKeySet = (e: KeyboardEvent) => {
    if (!listeningKey) return;
    e.preventDefault();
    const newBindings = { ...bindings, [listeningKey]: e.key.toLowerCase() };
    onUpdate(newBindings);
    setListeningKey(null);
    window.removeEventListener('keydown', handleKeySet);
  };

  const startListening = (key: keyof KeyBindings) => {
    setListeningKey(key);
    window.addEventListener('keydown', handleKeySet, { once: true });
  };

  const labels: Record<keyof KeyBindings, string> = {
    left: 'Gauche', right: 'Droite', jump: 'Saut / Haut', crouch: 'Bas', parry: 'Parade / Reflect',
    skill1: 'Sort 1', skill2: 'Sort 2', skill3: 'Sort 3', skill4: 'Sort 4',
    skill5: 'Sort 5', skill6: 'Sort 6', skill7: 'Sort 7', skill8: 'Sort 8',
    skill9: 'Sort 9', skill10: 'Sort 10', skill11: 'Sort 11', skill12: 'Sort 12'
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-6 backdrop-blur-md font-pixel">
      <div className="bg-gray-100 w-full max-w-2xl border-8 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 bg-black flex justify-between items-center text-white">
          <h2 className="text-xl font-black uppercase italic">Réglages des Touches</h2>
          <button onClick={onClose} className="text-3xl font-black">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(bindings) as Array<keyof KeyBindings>).map(key => (
              <div key={key} className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-xl">
                <span className="text-[10px] font-black uppercase">{labels[key]}</span>
                <button 
                  onClick={() => startListening(key)}
                  className={`px-4 py-2 border-2 border-black rounded-lg text-[10px] font-bold min-w-[100px] transition-all ${listeningKey === key ? 'bg-yellow-400 animate-pulse' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {listeningKey === key ? '...' : bindings[key]?.toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-yellow-400 text-black text-center font-black text-[8px] uppercase">
          Appuyez sur un bouton puis sur une touche pour la mapper.
        </div>
      </div>
    </div>
  );
};

export default Settings;
