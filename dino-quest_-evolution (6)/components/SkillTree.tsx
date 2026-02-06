
import React, { useState, useRef, useEffect } from 'react';
import { SkillTreeStats } from '../types';

interface SkillTreeProps {
  stats: SkillTreeStats;
  sp: number;
  onUpgrade: (key: string, amount?: number) => void;
  onClose: () => void;
}

const SkillTree: React.FC<SkillTreeProps> = ({ stats, sp, onUpgrade, onClose }) => {
  const [activeHold, setActiveHold] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const HOLD_DURATION = 600; // ms to trigger mass upgrade

  const skills = [
    { id: 'swordDmgLevel', name: 'Force', desc: '+1% Dégâts Épée', icon: '⚔️', color: 'text-orange-500' },
    { id: 'rangedDmgLevel', name: 'Magie', desc: '+1% Dégâts Sorts', icon: '🔥', color: 'text-blue-500' },
    { id: 'moveSpeedLevel', name: 'Agilité', desc: '+0.8% Vitesse', icon: '👟', color: 'text-green-500' },
  ];

  const handlePointerDown = (skillId: string) => {
    if (sp <= 0) return;
    setActiveHold(skillId);
    setHoldProgress(0);
    holdStartTimeRef.current = Date.now();

    // Start a visual update loop for the progress bar
    const updateProgress = () => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
      
      if (progress < 100 && holdTimerRef.current !== null) {
        holdTimerRef.current = requestAnimationFrame(updateProgress);
      } else if (progress >= 100) {
        // Trigger mass upgrade
        onUpgrade(skillId, sp);
        resetHold();
      }
    };

    holdTimerRef.current = requestAnimationFrame(updateProgress);
  };

  const handlePointerUp = (skillId: string) => {
    const elapsed = Date.now() - holdStartTimeRef.current;
    if (elapsed < HOLD_DURATION && activeHold === skillId) {
      // It was a short click
      onUpgrade(skillId, 1);
    }
    resetHold();
  };

  const resetHold = () => {
    if (holdTimerRef.current !== null) {
      cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setActiveHold(null);
    setHoldProgress(0);
  };

  // Ensure clean up on unmount or when component closes
  useEffect(() => {
    return () => resetHold();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-xl font-pixel">
      <div className="bg-gray-900 w-full max-w-2xl border-8 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)] rounded-[2rem] overflow-hidden flex flex-col">
        <div className="p-8 bg-purple-500 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">ARBRE DES TALENTS</h2>
            <p className="text-[10px] font-bold opacity-80 mt-1">Points disponibles : <span className="text-yellow-300">{sp} SP</span></p>
          </div>
          <button onClick={onClose} className="text-3xl font-black hover:scale-110 transition-all">✕</button>
        </div>

        <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {skills.map(skill => {
            const currentLevel = stats[skill.id as keyof SkillTreeStats];
            const isBeingHeld = activeHold === skill.id;

            return (
              <div key={skill.id} className="bg-gray-800/50 border-4 border-gray-700 p-6 rounded-3xl flex flex-col items-center text-center">
                <span className="text-4xl mb-4">{skill.icon}</span>
                <h3 className={`text-[10px] font-black uppercase mb-1 ${skill.color}`}>{skill.name}</h3>
                <p className="text-[8px] text-gray-400 mb-4">{skill.desc}</p>
                <div className="text-[10px] font-bold text-white mb-6">NIVEAU {currentLevel}</div>
                
                <button 
                  onPointerDown={() => handlePointerDown(skill.id)}
                  onPointerUp={() => handlePointerUp(skill.id)}
                  onPointerLeave={resetHold}
                  disabled={sp <= 0}
                  className={`relative w-full py-3 rounded-xl text-[8px] font-black uppercase transition-all overflow-hidden ${sp > 0 ? 'bg-purple-500 text-white active:scale-95' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                  {/* Progress Bar Overlay */}
                  {isBeingHeld && (
                    <div 
                      className="absolute top-0 left-0 h-full bg-white/30 pointer-events-none transition-all duration-75"
                      style={{ width: `${holdProgress}%` }}
                    />
                  )}
                  
                  <span className="relative z-10">
                    {sp > 0 ? (isBeingHeld && holdProgress > 30 ? 'TOUT DÉPENSER !' : 'AMÉLIORER') : 'REQUIS: 1 SP'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-gray-800 text-center border-t border-gray-700">
           <p className="text-[8px] text-gray-500 uppercase">Maintenez le bouton pour dépenser tous vos points d'un coup.</p>
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
