
import React from 'react';
import { InventoryItem } from '../types';

interface VictoryScreenProps {
  score: number;
  rewards: InventoryItem[];
  nextLevel: number;
  onRestart: () => void;
  onMenu: () => void;
  onNextLevel: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ score, rewards, nextLevel, onRestart, onMenu, onNextLevel }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl z-50 p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-12 rounded-[4rem] border-8 border-yellow-400 shadow-2xl max-w-xl w-full">
        <h2 className="text-4xl font-black text-yellow-500 mb-2 uppercase italic tracking-tighter">VICTOIRE !</h2>
        <p className="text-[10px] text-gray-400 uppercase font-black mb-8 tracking-widest">Le Gardien de l'étage a été terrassé</p>
        
        <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-10 border-4 border-gray-100 shadow-inner">
          <div className="text-[10px] uppercase font-black text-gray-400 mb-6 tracking-widest">Butin de Combat</div>
          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-center bg-yellow-100 p-5 rounded-2xl border-2 border-yellow-200">
                <span className="text-[11px] font-black uppercase">NIVEAU DÉBLOQUÉ</span>
                <span className="bg-yellow-400 text-white px-4 py-2 rounded-xl text-[12px] font-black">ETAGE {nextLevel}</span>
             </div>
             {rewards.length > 0 ? (
               rewards.map(item => (
                 <div key={item.id} className="flex justify-between items-center bg-blue-100 p-5 rounded-2xl border-2 border-blue-200 animate-bounce">
                    <span className="text-[11px] font-black uppercase">{item.name} {item.type === 'SWORD' ? '⚔️' : '🛡️'}</span>
                    <span className="text-[9px] font-black text-blue-600 uppercase">LÉGENDAIRE !</span>
                 </div>
               ))
             ) : (
               <div className="text-[10px] text-gray-400 uppercase italic py-4">Aucun équipement mythique trouvé cette fois...</div>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
           <button 
             onClick={onNextLevel} 
             className="bg-yellow-400 hover:bg-yellow-300 text-white py-6 rounded-3xl shadow-xl transition-all active:scale-95 text-xl font-black uppercase border-b-8 border-yellow-600"
           >
             Niveau Suivant ➔
           </button>
           <div className="grid grid-cols-2 gap-4">
              <button onClick={onRestart} className="bg-black hover:bg-gray-800 text-white py-4 rounded-2xl transition-all active:scale-95 text-[10px] font-black uppercase">Rejouer</button>
              <button onClick={onMenu} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-2xl transition-all text-[10px] font-black uppercase">Sanctuaire</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
