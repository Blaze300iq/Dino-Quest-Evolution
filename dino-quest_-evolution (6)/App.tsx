
import React, { useState, useEffect, useCallback } from 'react';
import Game from './components/Game';
import Shop from './components/Shop';
import AdminPanel from './components/AdminPanel';
import Inventory from './components/Inventory';
import VictoryScreen from './components/VictoryScreen';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { GameStatus, AdminSettings, ShopItem, Upgrades, CurrencyType, PlayerInventory, InventoryItem, KeyBindings, SkillId, User } from './types';
import { DOUBLE_JUMP_COOLDOWN, DINO_MAX_HEALTH, SKILLS_DATA } from './constants';

const DEFAULT_BINDINGS: KeyBindings = {
  left: 'q', right: 'd', jump: 'z', crouch: 's', parry: 'f',
  skill1: 'x', skill2: 'c', skill3: 'v', skill4: '1',
  skill5: 'r', skill6: 'a', skill7: 't', skill8: 'g',
  skill9: 'y', skill10: 'h', skill11: 'n', skill12: 'b'
};

const DEFAULT_INVENTORY: PlayerInventory = {
  items: [
    { id: 'S1', name: 'Fireball', type: 'SKILL', skillId: 'FIREBALL', level: 1, rarity: 'COMMON' },
    { id: 'S2', name: 'Thunder', type: 'SKILL', skillId: 'THUNDER_BOLT', level: 1, rarity: 'COMMON' }
  ],
  equippedSwordId: null, equippedArmorId: null, equippedStaffId: null,
  equippedSkillIds: ['S1', 'S2']
};

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 'default', name: 'Dino Original', price: 0, currencyPriceType: 'coin', description: 'Le classique.', color: '#535353', unlocked: true, type: 'skin' },
  { id: 'neon-blue', name: 'Néon', price: 150, currencyPriceType: 'coin', description: 'Lumineux.', color: '#00f2ff', unlocked: false, type: 'skin' },
  { id: 'gold', name: 'Or', price: 50, currencyPriceType: 'diamond', description: 'Luxe.', color: '#f1c40f', unlocked: false, type: 'skin' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [selectedDungeonLevel, setSelectedDungeonLevel] = useState<number>(1);
  const [levelPage, setLevelPage] = useState<number>(0);
  
  const [wallet, setWallet] = useState<Record<CurrencyType, number>>({ coin: 0, ruby: 0, diamond: 0 });
  const [inventory, setInventory] = useState<PlayerInventory>(DEFAULT_INVENTORY);
  const [maxDungeonLevel, setMaxDungeonLevel] = useState<number>(1);
  const [bindings, setBindings] = useState<KeyBindings>(DEFAULT_BINDINGS);
  const [selectedSkin, setSelectedSkin] = useState<string>('default');

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [victoryData, setVictoryData] = useState<{ score: number, rewards: InventoryItem[] } | null>(null);

  const [adminSettings, setAdminSettings] = useState<AdminSettings>({ invincible: false, infiniteJump: false, superSpeed: false, noObstacles: false, lowGravity: false, noCooldown: false, allPowers: false });

  useEffect(() => {
    if (currentUser) {
      const users: User[] = JSON.parse(localStorage.getItem('dino_users') || '[]');
      const userIndex = users.findIndex(u => u.username === currentUser.username);
      if (userIndex !== -1) {
        users[userIndex].data = {
          wallet,
          inventory,
          maxDungeonLevel,
          bindings,
          selectedSkin
        };
        localStorage.setItem('dino_users', JSON.stringify(users));
      }
    }
  }, [currentUser, wallet, inventory, maxDungeonLevel, bindings, selectedSkin]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setWallet(user.data.wallet);
    setInventory(user.data.inventory);
    setMaxDungeonLevel(user.data.maxDungeonLevel);
    setBindings(user.data.bindings);
    setSelectedSkin(user.data.selectedSkin);
    setLevelPage(Math.floor((user.data.maxDungeonLevel - 1) / 100));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStatus(GameStatus.START);
  };

  const getUpgrades = (): Upgrades => {
    if (adminSettings.allPowers) return { magnetRange: 300, jumpCooldown: 0, glideStrength: 0.15, coinMultiplier: 10, swordDamage: 1000000, swordRange: 500, swordCooldown: 50, moveSpeed: 2.5, maxHealth: 5000, rangedDamage: 500000 };
    return { magnetRange: 45, jumpCooldown: DOUBLE_JUMP_COOLDOWN, glideStrength: 0.15, coinMultiplier: 1, swordDamage: 10, swordRange: 120, swordCooldown: 180, moveSpeed: 1.2, maxHealth: DINO_MAX_HEALTH, rangedDamage: 350 };
  };

  const handleAdminGiveAll = () => {
    const allSkills = Object.keys(SKILLS_DATA) as SkillId[];
    const newItems: InventoryItem[] = allSkills.map((sid) => ({
      id: `ADMIN_SKILL_${sid}`,
      name: sid.replace(/_/g, ' '),
      type: 'SKILL',
      skillId: sid,
      level: 1,
      rarity: SKILLS_DATA[sid].rarity,
    }));
    setInventory(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
    alert(`Sorts admin injectés !`);
  };

  const startGame = useCallback(() => { setStatus(GameStatus.PLAYING); }, []);
  
  const handleNextLevel = useCallback(() => { 
    if (selectedDungeonLevel < 1000) { 
      setSelectedDungeonLevel(prev => prev + 1); 
      startGame(); 
    } else setStatus(GameStatus.START); 
  }, [selectedDungeonLevel, startGame]);

  const handleVictory = useCallback((score: number, rewards: InventoryItem[]) => {
    setStatus(GameStatus.VICTORY);
    setVictoryData({ score, rewards });
    setWallet(prev => ({ ...prev, coin: prev.coin + score }));
    if (rewards.length > 0) {
      setInventory(prev => ({
        ...prev,
        items: [...prev.items, ...rewards]
      }));
    }
    setMaxDungeonLevel(p => Math.max(p, selectedDungeonLevel + 1));
  }, [selectedDungeonLevel]);

  const equippedSkills = inventory.items.filter(item => inventory.equippedSkillIds.includes(item.id)).map(item => ({ id: item.skillId!, label: item.name }));

  const currentLevelRange = Array.from({length: 100}, (_, i) => levelPage * 100 + i + 1);

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="relative w-full h-screen bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center font-pixel text-white">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl text-[9px] font-black text-black">
            <div className="text-blue-800 mb-2 border-b border-gray-200 pb-1">JOUEUR: {currentUser.username.toUpperCase()}</div>
            <div>COINS: {wallet.coin}</div><div className="text-red-600">RUBY: {wallet.ruby}</div><div className="text-blue-600">DIAMOND: {wallet.diamond}</div>
          </div>
          {currentUser.username === 'admin' && (
            <button onClick={() => setIsAdminOpen(true)} className="bg-red-600 text-white p-2 border-2 border-black text-[7px] font-black uppercase hover:scale-105 transition-all">PANEL ADMIN</button>
          )}
          <button onClick={handleLogout} className="bg-gray-800 text-white p-2 border-2 border-black text-[7px] font-black uppercase hover:bg-red-800 transition-all">DECONNEXION</button>
        </div>
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={() => setStatus(GameStatus.SHADOW_REALM)} className="bg-purple-600 text-white px-4 py-2 border-4 border-black text-[9px] font-black uppercase hover:scale-105">OMBRAGE</button>
          <button onClick={() => setIsInventoryOpen(true)} className="bg-white px-4 py-2 border-4 border-black text-[9px] font-black text-black hover:bg-gray-100">SAC</button>
          <button onClick={() => setIsShopOpen(true)} className="bg-yellow-400 px-4 py-2 border-4 border-black text-[9px] font-black text-black hover:bg-yellow-300">SHOP</button>
          <button onClick={() => setIsSettingsOpen(true)} className="bg-gray-500 text-white px-4 py-2 border-4 border-black text-[9px] font-black hover:bg-gray-400">TOUCHES</button>
        </div>
      </div>

      {status !== GameStatus.START && (
        <Game 
          key={`${selectedDungeonLevel}-${status}`} 
          status={status} 
          dungeonLevel={selectedDungeonLevel} 
          onStatusChange={setStatus} 
          onGameOver={() => setStatus(GameStatus.GAMEOVER)} 
          onVictory={handleVictory} 
          onCollect={(t, a) => setWallet(p => ({...p, [t]: p[t]+a}))} 
          onScoreUpdate={() => {}} 
          skinColor={INITIAL_SHOP_ITEMS.find(i => i.id === selectedSkin)?.color || '#535353'} 
          adminSettings={adminSettings} 
          upgrades={getUpgrades()} 
          equippedSkills={equippedSkills} 
          bindings={bindings} 
          onShadowDefeated={() => { alert('OMBRE VAINCUE !'); setStatus(GameStatus.PLAYING); }} 
          onShadowVictory={() => {}} 
        />
      )}

      {status === GameStatus.START && (
        <div className="bg-white p-12 border-8 border-black text-center shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] z-40 max-w-2xl w-full">
          <h1 className="text-2xl font-black mb-6 italic uppercase text-black">DINO ARCANE EVOLUTION</h1>
          
          <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded-xl border-4 border-black">
             <button onClick={() => setLevelPage(p => Math.max(0, p-1))} className="bg-black text-white px-4 py-2 rounded-lg text-[10px] active:scale-95 disabled:opacity-30" disabled={levelPage === 0}>←</button>
             <div className="text-[12px] font-black text-black">MONDE {levelPage + 1} ({levelPage*100 + 1}-{levelPage*100 + 100})</div>
             <button onClick={() => setLevelPage(p => Math.min(9, p+1))} className="bg-black text-white px-4 py-2 rounded-lg text-[10px] active:scale-95 disabled:opacity-30" disabled={levelPage === 9}>→</button>
          </div>

          <div className="grid grid-cols-10 gap-2 mb-8 max-h-64 overflow-y-auto p-4 border-4 border-black/10 rounded-2xl bg-gray-50">
            {currentLevelRange.map(lvl => (
              <button key={lvl} onClick={() => setSelectedDungeonLevel(lvl)} disabled={lvl > maxDungeonLevel} className={`w-10 h-10 text-[10px] border-2 font-black rounded-lg ${selectedDungeonLevel === lvl ? 'bg-yellow-400 border-black scale-110 shadow-lg text-black' : lvl <= maxDungeonLevel ? 'bg-white border-black hover:bg-gray-100 text-black' : 'bg-gray-200 border-gray-400 opacity-50 text-gray-400'}`}>{lvl}</button>
            ))}
          </div>
          
          <button onClick={startGame} className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_8px_0_0_rgba(75,75,75,1)]">DÉFIER L'ÉTAGE {selectedDungeonLevel}</button>
        </div>
      )}

      {status === GameStatus.VICTORY && victoryData && <VictoryScreen score={victoryData.score} rewards={victoryData.rewards} nextLevel={selectedDungeonLevel + 1} onRestart={startGame} onMenu={() => setStatus(GameStatus.START)} onNextLevel={handleNextLevel} />}
      
      {isInventoryOpen && <Inventory inventory={inventory} onClose={() => setIsInventoryOpen(false)} onEquip={(id) => setInventory(p => { const item = p.items.find(i => i.id === id); if (item?.type === 'SKILL') { const equipped = p.equippedSkillIds.includes(id); return {...p, equippedSkillIds: equipped ? p.equippedSkillIds.filter(i => i !== id) : [...p.equippedSkillIds, id].slice(0, 6)}; } return p; })} />}
      {isShopOpen && <Shop items={INITIAL_SHOP_ITEMS.map(i => ({...i, unlocked: i.id === 'default' || wallet.coin > 0}))} wallet={wallet} onClose={() => setIsShopOpen(false)} onBuy={setSelectedSkin} selectedSkin={selectedSkin} />}
      {isAdminOpen && <AdminPanel settings={adminSettings} onClose={() => setIsAdminOpen(false)} onUpdate={setAdminSettings} onCollect={(t, a) => setWallet(p => ({...p, [t]: p[t]+a}))} onAdminMaxAll={() => {}} onAdminGiveAll={handleAdminGiveAll} onUnlockAll={() => setMaxDungeonLevel(1000)} />}
      {isSettingsOpen && <Settings bindings={bindings} onUpdate={setBindings} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;
