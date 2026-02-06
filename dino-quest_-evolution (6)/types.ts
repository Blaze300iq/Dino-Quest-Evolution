
export interface User {
  username: string;
  password?: string;
  data: {
    wallet: Record<CurrencyType, number>;
    inventory: PlayerInventory;
    maxDungeonLevel: number;
    bindings: KeyBindings;
    selectedSkin: string;
  }
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  VICTORY = 'VICTORY',
  SHADOW_REALM = 'SHADOW_REALM', 
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  ZEN = 'ZEN',
  HARDCORE = 'HARDCORE',
  SPEEDRUN = 'SPEEDRUN',
  GRAVITY_FLIP = 'GRAVITY_FLIP',
  FLOOR_IS_LAVA = 'FLOOR_IS_LAVA',
  DUNGEON_RUN = 'DUNGEON_RUN',
}

export type BossType = 'DEMON_SPIKE' | 'SKELETON_HAMMER' | 'LAVA_GOLEM' | 'VOID_WATCHER' | 'CRYSTAL_TITAN';
export type CurrencyType = 'coin' | 'ruby' | 'diamond';

export type SkillId = 
  | 'FIREBALL' | 'HELLFIRE' | 'METEOR_STRIKE' | 'PHOENIX_REBIRTH' | 'VOLCANO_ERUPTION' | 'SUN_FLARE'
  | 'ICE_SHARD' | 'BLIZZARD' | 'FROST_NOVA' | 'ABSOLUTE_ZERO' | 'GLACIER_CRASH'
  | 'THUNDER_BOLT' | 'CHAIN_LIGHTNING' | 'STORM_WRAITH' | 'THOR_HAMMER' | 'ELECTRO_PULSE'
  | 'DARK_VOID' | 'BLACK_HOLE' | 'SHADOW_CLONE' | 'VOID_ERUPTION' | 'ABYSS_GAZE' | 'NIGHTMARE'
  | 'HOLY_BEAM' | 'DIVINE_PUNISHMENT' | 'ANGEL_WINGS' | 'SANCTUARY' | 'JUDGMENT_DAY'
  | 'QUANTUM_DASH' | 'BLADE_WHIRLWIND' | 'IRON_FIST' | 'SONIC_BOOM' | 'HYPER_DASH'
  | 'TIME_GOD' | 'GALAXY_COLLAPSE' | 'STAR_RAIN' | 'NEBULA_BURST' | 'CHRONOS_BREAK'
  | 'BLAST' | 'LIGHTNING' | 'METEOR' | 'OMEGA_BEAM' | 'DRAGON_SOUL' | 'REALITY_WAVE' | 'STORM_OF_JUDGMENT'
  | 'GALAXY_IMPACT' | 'ADMINISTRATOR_IMPACT';

export interface KeyBindings {
  left: string; right: string; jump: string; crouch: string; parry: string;
  skill1: string; skill2: string; skill3: string; skill4: string;
  skill5: string; skill6: string; skill7: string; skill8: string;
  skill9: string; skill10: string; skill11: string; skill12: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'SWORD' | 'ARMOR' | 'SKILL' | 'STAFF';
  level: number;
  bonusDamage?: number;
  bonusMagic?: number;
  bonusDefense?: number;
  skillId?: SkillId;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'GODLY' | 'ULTIMATE';
}

export interface PlayerInventory {
  items: InventoryItem[];
  equippedSwordId: string | null;
  equippedArmorId: string | null;
  equippedStaffId: string | null;
  equippedSkillIds: string[]; 
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
  type?: string;
  owner: 'PLAYER' | 'BOSS' | 'ENEMY' | 'SHADOW';
  dmg?: number;
  isPiercing?: boolean;
  isUltimate?: boolean;
  color?: string;
  size?: number;
}

export interface Boss {
  x: number; y: number; health: number; maxHealth: number; phase: number; active: boolean; lastShoot: number; level: number; type: BossType; state: string; stateTimer: number;
  isGolden: boolean;
}

export interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string; size?: number;
}

export interface ShopItem {
  id: string; name: string; price: number; currencyPriceType: CurrencyType; description: string; color: string; unlocked: boolean; type: 'skin' | 'upgrade' | 'world_pass';
}

export interface AdminSettings {
  invincible: boolean; infiniteJump: boolean; superSpeed: boolean; noObstacles: boolean; lowGravity: boolean; noCooldown: boolean; allPowers: boolean;
}

export interface Upgrades {
  magnetRange: number; jumpCooldown: number; glideStrength: number; coinMultiplier: number; swordDamage: number; swordRange: number; swordCooldown: number; moveSpeed: number; maxHealth: number; rangedDamage: number;
}

export interface SkillTreeStats {
  swordDmgLevel: number;
  rangedDmgLevel: number;
  moveSpeedLevel: number;
}
