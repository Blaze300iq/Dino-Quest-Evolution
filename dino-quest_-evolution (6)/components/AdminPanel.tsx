
import React from 'react';
import { AdminSettings, CurrencyType } from '../types';

interface AdminPanelProps {
  settings: AdminSettings;
  onClose: () => void;
  onUpdate: (settings: AdminSettings) => void;
  onCollect: (type: CurrencyType, amount: number) => void;
  onAdminMaxAll: () => void;
  onAdminGiveAll: () => void;
  onUnlockAll: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onClose, onUpdate, onCollect, onAdminMaxAll, onAdminGiveAll, onUnlockAll }) => {
  const toggle = (key: keyof AdminSettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const resetProgress = () => {
    if (confirm("Reset ALL progress?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-gray-900 text-green-400 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xs font-bold tracking-widest uppercase">Console Système Dino</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold">✕</button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tricherie & Physique</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Invincible', key: 'invincible' as keyof AdminSettings },
                { label: 'Saut Infini', key: 'infiniteJump' as keyof AdminSettings },
                { label: 'Vitesse Max', key: 'superSpeed' as keyof AdminSettings },
                { label: 'Sans Obstacles', key: 'noObstacles' as keyof AdminSettings },
                { label: 'Sans Cooldown', key: 'noCooldown' as keyof AdminSettings },
                { label: 'Full Powers', key: 'allPowers' as keyof AdminSettings },
              ].map((item) => (
                <button 
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${settings[item.key] ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-green-600'}`}
                >
                  {item.label}: {settings[item.key] ? 'ON' : 'OFF'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Économie Globale</h3>
            <div className="flex flex-col gap-2">
               <button 
                 onClick={onUnlockAll} 
                 className="bg-purple-600 border border-purple-500 hover:bg-purple-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
               >
                 🔓 DÉBLOQUER LES 1000 ÉTAGES
               </button>
               <button 
                 onClick={onAdminGiveAll} 
                 className="bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
               >
                 ⚔️ TOUTES LES ARMES & SKILLS
               </button>
               <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => onCollect('coin', 10000)} className="bg-gray-800 border border-gray-700 hover:bg-gray-700 py-2 rounded-lg text-[10px] font-bold">+10K 🪙</button>
                  <button onClick={() => onCollect('ruby', 1000)} className="bg-gray-800 border border-gray-700 hover:bg-gray-700 py-2 rounded-lg text-[10px] font-bold">+1K ♦️</button>
                  <button onClick={() => onCollect('diamond', 500)} className="bg-gray-800 border border-gray-700 hover:bg-gray-700 py-2 rounded-lg text-[10px] font-bold">+500 💎</button>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button 
              onClick={resetProgress}
              className="w-full bg-red-900/20 border border-red-900/40 text-red-500 hover:bg-red-900/40 hover:text-white py-3 rounded-xl text-xs font-bold transition-all"
            >
              Réinitialiser toutes les données
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
