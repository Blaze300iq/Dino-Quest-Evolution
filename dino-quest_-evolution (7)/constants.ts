
import { BossType } from './types';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;
export const GROUND_Y = 520;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const DOUBLE_JUMP_COOLDOWN = 5000;
export const DINO_WIDTH = 44;
export const DINO_HEIGHT = 47;

export const BOSS_MAX_HEALTH = 40000000; 
export const DINO_MAX_HEALTH = 2500;
export const DINO_MAX_HEALTH_BASE = 2500;
export const DINO_MAX_MANA = 600;

export const PARRY_WINDOW = 400;
export const PARRY_COOLDOWN = 1500;
export const PARRY_REFLECT_MULT = 40; 

export interface BossStyle {
  sprite: string[];
  palette: Record<string, string>;
  projectileColor: string;
}

export const BOSS_STYLES: Record<BossType, BossStyle> = {
  DEMON_SPIKE: {
    sprite: [
      "   XXXXRXXXX   ",
      "  XXRRRRRXX  ",
      " XXRRRRRRRXX ",
      "XRRWWRRRWWRRX",
      "XRWWWRRRWWWRX",
      "XRRRRRRRRRRRX",
      " XRRRRRRRRRX ",
      "  XXXXXXXXX  ",
      " XXXXXXXXXXX ",
      "XXXXXXXXXXXXX",
      "XXXXXXXXXXXXX",
      " XXXXXXXXXXX ",
      "  XXXXXXXXX  ",
    ],
    palette: { 'X': '#1a1a1a', 'R': '#7f1d1d', 'W': '#fefce8' },
    projectileColor: '#ef4444'
  },
  SKELETON_HAMMER: {
    sprite: [
      "      WWWW     ",
      "     WWWWWW    ",
      "     WWBWBW    ",
      "      WWWW     ",
      "   HHHHHHHHHH  ",
      "   H   WW   H  ",
      "   H   WW   H  ",
      "       WW      ",
      "      WWWW     ",
      "     WW  WW    ",
      "    WW    WW   ",
    ],
    palette: { 'W': '#f3f4f6', 'B': '#000000', 'H': '#4b5563' },
    projectileColor: '#94a3b8'
  },
  LAVA_GOLEM: {
    sprite: [
      "    LLLLLLL    ",
      "   LLLLLLLLL   ",
      "  LLLOOOOLLL  ",
      " LLLOOOOOOOLLL ",
      "LLLOOOOOOOOLLL",
      "LLLOOOOOOOOLLL",
      " LLLOOOOOOOLLL ",
      "  LLLLLLLLL   ",
      "   LLLLLLL    ",
    ],
    palette: { 'L': '#450a0a', 'O': '#f97316' },
    projectileColor: '#f97316'
  },
  VOID_WATCHER: {
    sprite: [
      "    PPPPPPP    ",
      "   PPPPPPPPP   ",
      "  PPPEEEEPPP  ",
      " PPPEEEEEEPEE ",
      "PPEEEEEEEEEEPE",
      "PPEEEEEEEEEEPE",
      " PPPEEEEEEPEE ",
      "  PPPEEEEPPP  ",
      "    PPPPPPP    ",
    ],
    palette: { 'P': '#2e1065', 'E': '#000000' },
    projectileColor: '#a855f7'
  },
  CRYSTAL_TITAN: {
    sprite: [
      "     CCCCC     ",
      "    CCCCCCC    ",
      "   CCCCCCCCC   ",
      "  CCCCCCCCCCC  ",
      " CCCCCCCCCCCCC ",
      "CCCCCCCCCCCCCCC",
      " CCCCCCCCCCCCC ",
      "  CCCCCCCCCCC  ",
      "   CCCCCCCCC   ",
    ],
    palette: { 'C': '#06b6d4' },
    projectileColor: '#22d3ee'
  }
};

export interface SkillData {
  id: string; manaCost: number; cooldown: number; dmgMult: number;
  type: 'PROJECTILE' | 'RAIN' | 'BEAM' | 'DASH' | 'AOE' | 'SPECIAL';
  rarity: 'COMMON' | 'RARE' | 'GODLY' | 'ULTIMATE';
  description: string; color: string;
}

export const SKILLS_DATA: Record<string, SkillData> = {
  FIREBALL: { id: 'FIREBALL', manaCost: 15, cooldown: 600, dmgMult: 4, type: 'PROJECTILE', rarity: 'COMMON', description: 'Boule de feu standard.', color: '#ef4444' },
  ICE_SHARD: { id: 'ICE_SHARD', manaCost: 15, cooldown: 500, dmgMult: 3.5, type: 'PROJECTILE', rarity: 'COMMON', description: 'Éclat de glace rapide.', color: '#60a5fa' },
  THUNDER_BOLT: { id: 'THUNDER_BOLT', manaCost: 20, cooldown: 800, dmgMult: 6, type: 'PROJECTILE', rarity: 'COMMON', description: 'Petit éclair direct.', color: '#facc15' },
  BLAST: { id: 'BLAST', manaCost: 10, cooldown: 400, dmgMult: 3, type: 'PROJECTILE', rarity: 'COMMON', description: "Explosion d'énergie.", color: '#ffffff' },
  METEOR_STRIKE: { id: 'METEOR_STRIKE', manaCost: 50, cooldown: 3500, dmgMult: 45, type: 'RAIN', rarity: 'RARE', description: 'Appel de météores.', color: '#f97316' },
  BLIZZARD: { id: 'BLIZZARD', manaCost: 45, cooldown: 4000, dmgMult: 35, type: 'RAIN', rarity: 'RARE', description: 'Tempête de neige.', color: '#93c5fd' },
  STORM_WRAITH: { id: 'STORM_WRAITH', manaCost: 55, cooldown: 5000, dmgMult: 55, type: 'PROJECTILE', rarity: 'RARE', description: 'Esprit de la tempête.', color: '#eab308' },
  DARK_VOID: { id: 'DARK_VOID', manaCost: 60, cooldown: 6000, dmgMult: 70, type: 'PROJECTILE', rarity: 'RARE', description: "Sphère d'ombre.", color: '#4c1d95' },
  HOLY_BEAM: { id: 'HOLY_BEAM', manaCost: 90, cooldown: 8000, dmgMult: 180, type: 'BEAM', rarity: 'GODLY', description: 'Faisceau divin continu.', color: '#fef08a' },
  BLACK_HOLE: { id: 'BLACK_HOLE', manaCost: 120, cooldown: 12000, dmgMult: 350, type: 'AOE', rarity: 'GODLY', description: 'Trou noir massif.', color: '#000000' },
  ABYSS_GAZE: { id: 'ABYSS_GAZE', manaCost: 110, cooldown: 10000, dmgMult: 300, type: 'BEAM', rarity: 'GODLY', description: 'Rayon du néant.', color: '#1e1b4b' },
  GLACIER_CRASH: { id: 'GLACIER_CRASH', manaCost: 130, cooldown: 14000, dmgMult: 500, type: 'RAIN', rarity: 'GODLY', description: 'Chute de glaciers.', color: '#3b82f6' },
  PHOENIX_REBIRTH: { id: 'PHOENIX_REBIRTH', manaCost: 200, cooldown: 45000, dmgMult: 12000, type: 'AOE', rarity: 'ULTIMATE', description: 'Explosion solaire suprême.', color: '#ff4400' },
  DRAGON_SOUL: { id: 'DRAGON_SOUL', manaCost: 250, cooldown: 55000, dmgMult: 20000, type: 'BEAM', rarity: 'ULTIMATE', description: 'Souffle du Dragon Originel.', color: '#dc2626' },
  QUANTUM_DASH: { id: 'QUANTUM_DASH', manaCost: 150, cooldown: 15000, dmgMult: 4000, type: 'DASH', rarity: 'ULTIMATE', description: 'Traversée des dimensions.', color: '#818cf8' },
  TIME_GOD: { id: 'TIME_GOD', manaCost: 350, cooldown: 65000, dmgMult: 800, type: 'SPECIAL', rarity: 'ULTIMATE', description: 'Arrête le temps.', color: '#00ffff' },
  GALAXY_COLLAPSE: { id: 'GALAXY_COLLAPSE', manaCost: 300, cooldown: 60000, dmgMult: 25000, type: 'AOE', rarity: 'ULTIMATE', description: "Fin d'un univers.", color: '#a855f7' },
  JUDGMENT_DAY: { id: 'JUDGMENT_DAY', manaCost: 280, cooldown: 50000, dmgMult: 18000, type: 'RAIN', rarity: 'ULTIMATE', description: 'Colère du Dieu Créateur.', color: '#ffffff' },
  VOLCANO_ERUPTION: { id: 'VOLCANO_ERUPTION', manaCost: 220, cooldown: 35000, dmgMult: 15000, type: 'RAIN', rarity: 'ULTIMATE', description: 'Pluie de lave.', color: '#7f1d1d' },
  VOID_ERUPTION: { id: 'VOID_ERUPTION', manaCost: 240, cooldown: 40000, dmgMult: 16000, type: 'AOE', rarity: 'ULTIMATE', description: 'Éclatement du néant.', color: '#2e1065' },
  REALITY_WAVE: { id: 'REALITY_WAVE', manaCost: 260, cooldown: 55000, dmgMult: 22000, type: 'AOE', rarity: 'ULTIMATE', description: 'Réécriture de la réalité.', color: '#f472b6' },
  GALAXY_IMPACT: { id: 'GALAXY_IMPACT', manaCost: 400, cooldown: 70000, dmgMult: 50000, type: 'AOE', rarity: 'ULTIMATE', description: 'Une galaxie se brise, créant une supernova dévastatrice.', color: '#ff00ff' },
  ADMINISTRATOR_IMPACT: { id: 'ADMINISTRATOR_IMPACT', manaCost: 0, cooldown: 1000, dmgMult: 999999999, type: 'AOE', rarity: 'ULTIMATE', description: 'COMMANDE SYSTÈME : Oblitère toute existence hostile.', color: '#00ffff' }
};

export const THEMES = [
  { range: [1, 100], name: 'Forêt Interdite', bg: '#064e3b', floor: '#065f46', decor: '🌲' },
  { range: [101, 200], name: 'Cité Cybernétique', bg: '#1e1b4b', floor: '#312e81', decor: '⚡' },
  { range: [201, 300], name: 'Enfer de Lave', bg: '#450a0a', floor: '#7f1d1d', decor: '🔥' },
  { range: [301, 400], name: 'Abysses Profonds', bg: '#171717', floor: '#262626', decor: '💀' },
  { range: [401, 500], name: 'Sanctuaire Divin', bg: '#422006', floor: '#78350f', decor: '✨' },
  { range: [501, 600], name: 'Royaume de Cristal', bg: '#083344', floor: '#155e75', decor: '💎' },
  { range: [601, 700], name: 'Désert du Vide', bg: '#000000', floor: '#171717', decor: '🌀' },
  { range: [701, 800], name: 'Cité Perdue d\'Atlantis', bg: '#1e3a8a', floor: '#1e40af', decor: '🔱' },
  { range: [801, 900], name: 'Dimension du Code', bg: '#052e16', floor: '#064e3b', decor: '💾' },
  { range: [901, 1000], name: 'Origine du Néant', bg: '#020617', floor: '#000000', decor: '⚛️' },
];
