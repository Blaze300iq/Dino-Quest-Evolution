
import React from 'react';
import { PlayerInventory, InventoryItem } from '../types';

interface InventoryProps {
  inventory: PlayerInventory;
  onClose: () => void;
  onEquip: (id: string) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + 'T';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toString();
};

const Inventory: React.FC<InventoryProps> = ({ inventory, onClose, onEquip }) => {
  const getRarityColor = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-400';
      case 'RARE': return 'text-blue-400';
      case 'EPIC': return 'text-purple-400';
      case 'LEGENDARY': return 'text-orange-400';
      case 'GODLY': return 'text-yellow-400 font-bold';
      case 'ULTIMATE': return 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-black font-black animate-pulse';
      default: return 'text-gray-400';
    }
  };

  const getItemIcon = (type: InventoryItem['type']) => {
    switch (type) {
      case 'SWORD': return '⚔️';
      case 'STAFF': return '🪄';
      case 'ARMOR': return '🛡️';
      case 'SKILL': return '📜';
      default: return '📦';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-lg font-pixel">
      <div className="bg-gray-900 w-full max-w-4xl h-[80vh] rounded-[2rem] border-8 border-blue-500 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 bg-blue-500 flex justify-between items-center text-white">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Inventaire Divin</h2>
            <p className="text-[10px] font-bold text-white/70 uppercase">Sorts équipés : {inventory.equippedSkillIds.length}/6</p>
          </div>
          <button onClick={onClose} className="text-3xl font-black hover:rotate-90 transition-all text-white">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.items.map(item => {
            const isEquipped = item.type === 'SKILL' 
              ? inventory.equippedSkillIds.includes(item.id)
              : (inventory.equippedSwordId === item.id || 
                 inventory.equippedArmorId === item.id || 
                 inventory.equippedStaffId === item.id);
            
            return (
              <div key={item.id} className={`p-6 rounded-3xl border-4 transition-all ${isEquipped ? 'border-yellow-400 bg-yellow-400/10 scale-102 shadow-[0_0_20px_rgba(255,255,0,0.2)]' : 'border-gray-800 bg-gray-800/50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">{getItemIcon(item.type)}</span>
                  <span className={`text-[7px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                </div>
                <h4 className="text-[9px] text-white font-black uppercase truncate">{item.name}</h4>
                <div className="text-[7px] text-gray-400 mt-2 mb-4 uppercase">
                  {item.type === 'SKILL' ? 'Capacité Magique' : `Niveau ${item.level}`}
                </div>
                <button 
                  onClick={() => onEquip(item.id)}
                  className={`w-full py-3 rounded-xl text-[7px] font-black uppercase transition-all ${isEquipped ? 'bg-red-500 text-white shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                  {isEquipped ? 'DÉSÉQUIPER' : 'ÉQUIPER'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
