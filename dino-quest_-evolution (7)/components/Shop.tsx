
import React from 'react';
import { ShopItem, CurrencyType } from '../types';

interface ShopProps {
  items: ShopItem[];
  wallet: Record<CurrencyType, number>;
  selectedSkin: string;
  onClose: () => void;
  onBuy: (id: string) => void;
}

const DINO_ICON_SPRITE = [
  "      RRRRRRRR",
  "      RRRRRRRR",
  "      RRWWWWWW",
  "      RRRRRRRR",
  "      RRRR    ",
  "RR  RRRRRRRR  ",
  "RRRRRRRRRR    ",
  "RRRRRRRRRR    ",
  "  RRRRRRRR    ",
  "    RR  RR    ",
  "    RR  RR    ",
  "    RRR RRR   "
];

const DinoPreview: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="grid grid-cols-14 gap-0 w-14 h-11">
      {DINO_ICON_SPRITE.map((row, r) => (
        <div key={r} className="flex h-[4px]">
          {row.split('').map((char, c) => (
            <div 
              key={c} 
              className="w-[4px] h-[4px]" 
              style={{ 
                backgroundColor: char === 'R' 
                  ? (color === 'linear-gradient' ? '#f06' : color) 
                  : char === 'W' ? 'white' : 'transparent',
                backgroundImage: char === 'R' && color === 'linear-gradient' 
                  ? 'linear-gradient(45deg, #f06, #4a90e2, #f1c40f, #2ecc71)' 
                  : 'none'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const Shop: React.FC<ShopProps> = ({ items, wallet, onClose, onBuy, selectedSkin }) => {
  const filteredItems = items.filter(item => item.type === 'skin');

  const currencySymbols: Record<CurrencyType, string> = {
    coin: 'PIÈCES',
    ruby: 'RUBIS',
    diamond: 'DIAMANTS'
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
      <div className="bg-[#fdfdfd] w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-[6px] border-yellow-400">
        <div className="bg-yellow-400 p-10 flex justify-between items-center text-white">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">DINO MEGA SKIN SHOP</h2>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white text-yellow-600">APPARENCES</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col gap-1 items-end bg-black/30 p-4 rounded-2xl border border-white/20">
                <div className="text-sm font-black text-white">{wallet.coin} 🪙</div>
                <div className="text-sm font-black text-red-400">{wallet.ruby} ♦️</div>
                <div className="text-sm font-black text-blue-400">{wallet.diamond} 💎</div>
             </div>
             <button onClick={onClose} className="hover:rotate-90 transition-all text-4xl font-black">✕</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 bg-[#fafafa]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => {
              const cost = item.price;
              const canAfford = wallet[item.currencyPriceType] >= cost;

              return (
                <div key={item.id} className={`relative border-4 p-6 rounded-[2rem] flex flex-col items-center transition-all ${selectedSkin === item.id ? 'border-yellow-400 bg-yellow-50 shadow-xl' : 'border-gray-100 bg-white'}`}>
                  <div className="py-4">
                    <DinoPreview color={item.color} />
                  </div>
                  
                  <div className="text-center mt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">{item.name}</h4>
                    <p className="text-[8px] text-gray-400 mt-2 h-8 italic">{item.description}</p>
                  </div>

                  <button 
                    onClick={() => onBuy(item.id)}
                    disabled={!item.unlocked && !canAfford}
                    className={`mt-4 w-full py-4 rounded-2xl text-[9px] font-black tracking-widest transition-all ${
                      item.unlocked
                        ? (selectedSkin === item.id ? 'bg-green-500 text-white shadow-inner' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                        : (canAfford ? 'bg-yellow-400 text-white hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400')
                    }`}
                  >
                    {item.unlocked 
                      ? (selectedSkin === item.id ? 'SÉLECTIONNÉ' : 'ÉQUIPER') 
                      : `${cost} ${currencySymbols[item.currencyPriceType]}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
