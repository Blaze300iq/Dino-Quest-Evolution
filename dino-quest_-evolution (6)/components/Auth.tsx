
import React, { useState, useEffect } from 'react';
import { User, KeyBindings, PlayerInventory, CurrencyType } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

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

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Initialisation du compte admin si inexistant
  useEffect(() => {
    const users: User[] = JSON.parse(localStorage.getItem('dino_users') || '[]');
    if (!users.find(u => u.username === 'admin')) {
      const admin: User = {
        username: 'admin',
        password: '2171',
        data: {
          wallet: { coin: 999999, ruby: 999999, diamond: 999999 },
          inventory: {
            ...DEFAULT_INVENTORY,
            items: [
              ...DEFAULT_INVENTORY.items,
              { id: 'ADMIN_OP', name: 'ADMINISTRATOR IMPACT', type: 'SKILL', skillId: 'ADMINISTRATOR_IMPACT', level: 1, rarity: 'ULTIMATE' }
            ],
            equippedSkillIds: [...DEFAULT_INVENTORY.equippedSkillIds, 'ADMIN_OP']
          },
          maxDungeonLevel: 1000,
          bindings: DEFAULT_BINDINGS,
          selectedSkin: 'gold'
        }
      };
      localStorage.setItem('dino_users', JSON.stringify([...users, admin]));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('REMPLIS TOUS LES CHAMPS !');
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('dino_users') || '[]');

    if (isLogin) {
      const user = users.find(u => u.username === username.toLowerCase() && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('PSEUDO OU MDP INCORRECT !');
      }
    } else {
      if (users.find(u => u.username === username.toLowerCase())) {
        setError('CE PSEUDO EXISTE DEJA !');
        return;
      }

      const newUser: User = {
        username: username.toLowerCase(),
        password: password,
        data: {
          wallet: { coin: 0, ruby: 0, diamond: 0 },
          inventory: DEFAULT_INVENTORY,
          maxDungeonLevel: 1,
          bindings: DEFAULT_BINDINGS,
          selectedSkin: 'default'
        }
      };

      localStorage.setItem('dino_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center font-pixel p-6 z-[1000]">
      <div className="bg-white p-10 border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] max-w-md w-full animate-in zoom-in duration-300">
        <h2 className="text-2xl font-black text-center mb-8 uppercase italic tracking-tighter text-black">
          {isLogin ? 'CONNEXION DINO' : 'REJOINDRE LA QUÊTE'}
        </h2>

        {error && (
          <div className="bg-red-100 border-4 border-red-500 p-4 mb-6 rounded-xl text-[8px] font-black text-red-600 animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Pseudo</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-100 border-4 border-black p-4 rounded-2xl text-[12px] font-black text-black outline-none focus:bg-yellow-50"
              placeholder="Ex: DinoMaster"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Mot de Passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-100 border-4 border-black p-4 rounded-2xl text-[12px] font-black text-black outline-none focus:bg-yellow-50"
              placeholder="••••"
            />
          </div>

          <button 
            type="submit"
            className="bg-black text-white py-6 rounded-2xl font-black text-xl uppercase hover:scale-105 active:scale-95 transition-all mt-4 border-b-8 border-gray-700"
          >
            {isLogin ? 'SE CONNECTER' : "S'INSCRIRE"}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="w-full text-center mt-8 text-[9px] font-black text-gray-400 hover:text-black uppercase transition-all"
        >
          {isLogin ? "PAS ENCORE DE COMPTE ? S'INSCRIRE" : "DEJA UN COMPTE ? SE CONNECTER"}
        </button>
      </div>

      <div className="absolute bottom-10 text-[8px] text-gray-600 opacity-20 hover:opacity-100 transition-all pointer-events-none">
        Indice: Admin est déjà parmi nous...
      </div>
    </div>
  );
};

export default Auth;
