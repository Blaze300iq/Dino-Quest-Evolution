
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GameStatus, AdminSettings, Upgrades, CurrencyType, Boss, Projectile, InventoryItem, SkillId, Particle, KeyBindings, GameMode, BossType
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, GRAVITY, JUMP_FORCE, DINO_WIDTH, DINO_HEIGHT, SKILLS_DATA, DINO_MAX_MANA, BOSS_MAX_HEALTH, PARRY_WINDOW, PARRY_COOLDOWN, PARRY_REFLECT_MULT, THEMES, BOSS_STYLES
} from '../constants';

interface GameProps {
  status: GameStatus; dungeonLevel: number; onStatusChange: (status: GameStatus) => void;
  onGameOver: (score: number) => void; onVictory: (score: number, drops: InventoryItem[]) => void;
  onCollect: (type: CurrencyType, amount: number) => void; onScoreUpdate: (score: number) => void;
  skinColor: string; adminSettings: AdminSettings; upgrades: Upgrades;
  equippedSkills: { id: SkillId, label: string }[]; bindings: KeyBindings;
  onShadowDefeated: () => void; onShadowVictory: () => void;
}

const DINO_SPRITE = ["      RRRRRRRR", "      RRRRRRRR", "      RRRRRRRR", "      RRRRRRRR", "      RRWWWWWW", "      RRRRRRRR", "      RRRR    ", "RR  RRRRRRRR  ", "RRRRRRRRRR    ", "RRRRRRRRRR    ", "RRRRRRRRRR    ", "  RRRRRRRR    ", "    RR  RR    ", "    RR  RR    ", "    RRR RRR   "];
const ps = DINO_HEIGHT / DINO_SPRITE.length;

const Game: React.FC<GameProps> = ({ 
  status, dungeonLevel, onGameOver, onVictory, onCollect, skinColor, adminSettings, upgrades, equippedSkills, bindings, onShadowDefeated, onShadowVictory
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dinoHP, setDinoHP] = useState(upgrades.maxHealth);
  const [dinoMana, setDinoMana] = useState(DINO_MAX_MANA);
  const [bossHealthPercent, setBossHealthPercent] = useState<number | null>(null);
  const [dmgFlash, setDmgFlash] = useState(0);

  const theme = THEMES.find(t => dungeonLevel >= t.range[0] && dungeonLevel <= t.range[1]) || THEMES[0];

  const gameState = useRef({
    dinoX: 150, dinoY: GROUND_Y - DINO_HEIGHT, dinoVy: 0,
    dinoHealth: upgrades.maxHealth, dinoMana: DINO_MAX_MANA,
    shadowX: CANVAS_WIDTH - 200, shadowY: GROUND_Y - DINO_HEIGHT, shadowVy: 0, shadowHealth: 5000 * dungeonLevel, shadowActive: false,
    projectiles: [] as Projectile[], particles: [] as Particle[],
    boss: null as Boss | null, bossSpawned: false, iframe: 0, shake: 0,
    parry: { active: 0, cooldown: 0 },
    keys: { left: false, right: false }, skillLastUsed: {} as Record<string, number>,
    timeStop: 0, dashTimer: 0,
    adminImpactAnim: { active: false, timer: 0, phase: 0 } 
  });

  const createParticles = (x: number, y: number, color: string, count: number, speed: number = 8) => {
    for (let i = 0; i < count; i++) {
      gameState.current.particles.push({
        x, y, vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
        life: 1, color, size: Math.random() * 8 + 2
      });
    }
  };

  const generateBossDrop = (): InventoryItem[] => {
    const drops: InventoryItem[] = [];
    const roll = Math.random();
    const dropChance = 0.01 + (dungeonLevel / 2000); 
    if (roll < dropChance) {
      const rarities: ('COMMON' | 'RARE' | 'GODLY' | 'ULTIMATE')[] = [];
      if (dungeonLevel <= 35) rarities.push('COMMON');
      if (dungeonLevel > 25 && dungeonLevel <= 65) rarities.push('RARE');
      if (dungeonLevel > 55 && dungeonLevel <= 90) rarities.push('GODLY');
      if (dungeonLevel > 85) rarities.push('ULTIMATE');
      if (rarities.length === 0) rarities.push(dungeonLevel > 50 ? 'RARE' : 'COMMON');
      const targetRarity = rarities[Math.floor(Math.random() * rarities.length)];
      const possibleSkills = Object.values(SKILLS_DATA).filter(s => s.rarity === targetRarity && s.id !== 'ADMINISTRATOR_IMPACT');
      if (possibleSkills.length > 0) {
        const skill = possibleSkills[Math.floor(Math.random() * possibleSkills.length)];
        drops.push({ id: `DROP_${Date.now()}_${Math.floor(Math.random() * 1000)}`, name: `Parchemin: ${skill.id.replace(/_/g, ' ')}`, type: 'SKILL', skillId: skill.id as SkillId, level: 1, rarity: skill.rarity });
      }
    }
    return drops;
  };

  const spawnBoss = useCallback(() => {
    const state = gameState.current;
    const isGolden = Math.random() < 0.10;
    const bossTypes: BossType[] = ['DEMON_SPIKE', 'SKELETON_HAMMER', 'LAVA_GOLEM', 'VOID_WATCHER', 'CRYSTAL_TITAN'];
    const randomType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    const levelBuff = dungeonLevel >= 80 ? 100 : 1;
    const baseHealth = BOSS_MAX_HEALTH * dungeonLevel * levelBuff;
    const finalHealth = isGolden ? baseHealth * 5 : baseHealth;
    state.boss = { x: CANVAS_WIDTH - 450, y: GROUND_Y - 450, health: finalHealth, maxHealth: finalHealth, active: true, level: dungeonLevel, type: randomType, state: 'IDLE', stateTimer: 0, phase: 1, lastShoot: 0, isGolden: isGolden };
    setBossHealthPercent(100);
  }, [dungeonLevel]);

  useEffect(() => {
    if (status === GameStatus.PLAYING && !gameState.current.bossSpawned) { spawnBoss(); gameState.current.bossSpawned = true; }
    if (status === GameStatus.SHADOW_REALM) { gameState.current.shadowActive = true; gameState.current.shadowHealth = 5000 * dungeonLevel; gameState.current.shadowX = CANVAS_WIDTH - 200; }
  }, [status, spawnBoss, dungeonLevel]);

  const takeDamage = useCallback((amt: number) => {
    const state = gameState.current;
    // L'admin est invincible si l'impact est actif
    if (adminSettings.invincible || state.iframe > 0 || state.dashTimer > 0 || state.adminImpactAnim.active) return;
    if (state.parry.active > 0) {
      state.parry.active = 0; state.iframe = 50; state.shake = 60;
      createParticles(state.dinoX + 25, state.dinoY + 25, '#60a5fa', 50, 15);
      if (state.boss?.active) { state.boss.health -= amt * PARRY_REFLECT_MULT; setBossHealthPercent((state.boss.health / state.boss.maxHealth) * 100); }
      return;
    }
    state.dinoHealth -= amt; setDinoHP(state.dinoHealth);
    state.iframe = 45; state.shake = 45; setDmgFlash(0.7);
    createParticles(state.dinoX + 25, state.dinoY + 25, '#ef4444', 30, 12);
    if (state.dinoHealth <= 0) onGameOver(0);
  }, [adminSettings.invincible, onGameOver]);

  const handleSkill = (skillId: SkillId) => {
    const now = Date.now();
    const data = SKILLS_DATA[skillId];
    if (!data || (now - (gameState.current.skillLastUsed[skillId] || 0) < data.cooldown && !adminSettings.noCooldown)) return;
    if (gameState.current.dinoMana < data.manaCost && !adminSettings.allPowers) return;
    
    gameState.current.skillLastUsed[skillId] = now;
    if (!adminSettings.allPowers) { gameState.current.dinoMana -= data.manaCost; setDinoMana(gameState.current.dinoMana); }

    const state = gameState.current;
    const isUlt = data.rarity === 'ULTIMATE';
    if (isUlt) { state.shake = 120; setDmgFlash(0.5); }
    const baseDmg = upgrades.rangedDamage * data.dmgMult;

    // ADMINISTRATOR IMPACT SEQUENCE
    if ((skillId as string) === 'ADMINISTRATOR_IMPACT') {
      state.adminImpactAnim = { active: true, timer: 90, phase: 1 }; // Phase 1: Charge
      state.timeStop = 220; // Immobilise le temps pour savourer l'instant
      return;
    }

    if ((skillId as string) === 'GALAXY_IMPACT') {
      setDmgFlash(1.0); state.shake = 300;
      const colors = ['#ffffff', '#facc15', '#a855f7', '#3b82f6', '#ff00ff'];
      for (let j = 0; j < 500; j++) {
        const angle = Math.random() * Math.PI * 2;
        state.particles.push({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: Math.cos(angle) * (Math.random() * 40 + 5), vy: Math.sin(angle) * (Math.random() * 40 + 5), life: 1.5 + Math.random(), color: colors[Math.floor(Math.random() * colors.length)], size: Math.random() * 15 + 5 });
      }
    }

    switch (data.type) {
      case 'PROJECTILE': state.projectiles.push({ x: state.dinoX + 50, y: state.dinoY + 25, vx: 38, vy: 0, id: now, owner: 'PLAYER', dmg: baseDmg, color: data.color, isUltimate: isUlt, isPiercing: data.rarity === 'GODLY' || isUlt }); break;
      case 'RAIN': for(let i=0; i< (isUlt ? 30 : 12); i++) state.projectiles.push({ x: Math.random() * CANVAS_WIDTH, y: -200 - (i*50), vx: (Math.random()-0.5)*5, vy: 25, id: now + i, owner: 'PLAYER', dmg: baseDmg/4, color: data.color, isUltimate: isUlt }); break;
      case 'BEAM': state.projectiles.push({ x: state.dinoX + 50, y: state.dinoY + 25, vx: 50, vy: 0, id: now, owner: 'PLAYER', dmg: baseDmg, color: data.color, isUltimate: isUlt, isPiercing: true, size: isUlt ? 80 : 40 }); break;
      case 'DASH': state.dashTimer = 30; state.iframe = 35; createParticles(state.dinoX, state.dinoY, data.color, 100, 20); break;
      case 'AOE':
        if ((skillId as string) !== 'GALAXY_IMPACT' && (skillId as string) !== 'ADMINISTRATOR_IMPACT') { setDmgFlash(0.8); state.shake = 150; createParticles(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, data.color, 200, 30); }
        if (state.boss?.active) { state.boss.health -= baseDmg; setBossHealthPercent((state.boss.health / state.boss.maxHealth) * 100); }
        if (state.shadowActive) state.shadowHealth -= baseDmg;
        break;
      case 'SPECIAL': if (skillId === 'TIME_GOD') { state.timeStop = 400; state.shake = 80; } break;
    }
    createParticles(state.dinoX + 50, state.dinoY + 25, data.color, 25, 12);
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const loop = () => {
      const state = gameState.current;
      const isShadowMode = status === GameStatus.SHADOW_REALM;
      const isPlaying = status === GameStatus.PLAYING || isShadowMode;

      if (isPlaying) {
        const speedMult = state.timeStop > 0 ? 0.08 : 1.0;
        state.dinoVy += GRAVITY; state.dinoY += state.dinoVy;
        if (state.dinoY > GROUND_Y - DINO_HEIGHT) { state.dinoY = GROUND_Y - DINO_HEIGHT; state.dinoVy = 0; }
        if (state.keys.left) state.dinoX -= 16;
        if (state.keys.right) state.dinoX += 16;
        if (state.dashTimer > 0) { state.dinoX += 45; state.dashTimer--; }
        state.dinoX = Math.max(0, Math.min(CANVAS_WIDTH - DINO_WIDTH, state.dinoX));
        
        if (isShadowMode && state.shadowActive) {
            state.shadowVy += GRAVITY; state.shadowY += state.shadowVy;
            if (state.shadowY > GROUND_Y - DINO_HEIGHT) { state.shadowY = GROUND_Y - DINO_HEIGHT; state.shadowVy = 0; }
            const targetX = state.dinoX + 400;
            if (state.shadowX < targetX - 10) state.shadowX += 8; else if (state.shadowX > targetX + 10) state.shadowX -= 8;
            if (state.dinoVy < -5 && state.shadowY >= GROUND_Y - DINO_HEIGHT) state.shadowVy = JUMP_FORCE;
            if (Math.random() < 0.03) state.projectiles.push({ x: state.shadowX, y: state.shadowY + 20, vx: -20, vy: 0, id: Date.now(), owner: 'BOSS', dmg: 30 * dungeonLevel, color: '#a855f7', size: 25 });
            if (state.shadowHealth <= 0) { state.shadowActive = false; onShadowDefeated(); }
        }

        if (state.iframe > 0) state.iframe--; if (state.parry.active > 0) state.parry.active--; if (state.parry.cooldown > 0) state.parry.cooldown--;
        state.dinoMana = Math.min(DINO_MAX_MANA, state.dinoMana + 0.8); if (state.timeStop > 0) state.timeStop--;
        if (dmgFlash > 0) setDmgFlash(prev => Math.max(0, prev - 0.03));

        // --- GESTION DE L'ANIMATION ADMINISTRATOR IMPACT (SÉQUENCE COMPLÈTE) ---
        if (state.adminImpactAnim.active) {
            if (state.adminImpactAnim.phase === 1) { // Phase de Concentration (1.5s)
                state.adminImpactAnim.timer--;
                state.shake = 15; 
                // Particules convergentes vers le Dino
                if (Math.random() < 0.7) {
                   const angle = Math.random() * Math.PI * 2;
                   const dist = 400 + Math.random() * 200;
                   state.particles.push({ x: state.dinoX + 25 + Math.cos(angle) * dist, y: state.dinoY + 25 + Math.sin(angle) * dist, vx: -Math.cos(angle) * 20, vy: -Math.sin(angle) * 20, life: 0.6, color: '#00ffff', size: 5 });
                }
                if (state.adminImpactAnim.timer <= 0) {
                    state.adminImpactAnim.phase = 2;
                    state.adminImpactAnim.timer = 120; // Délai de 2 secondes avant le coup fatal (60fps * 2)
                    setDmgFlash(1.0); // Flash de détonation visuelle
                    state.shake = 200;
                    // Explosion massive de particules (On voit l'explosion ici)
                    const colors = ['#00ff00', '#ffffff', '#00ffff', '#020617'];
                    for (let j = 0; j < 1200; j++) {
                      const angle = Math.random() * Math.PI * 2;
                      const speed = Math.random() * 80 + 10;
                      state.particles.push({ x: state.dinoX + 25, y: state.dinoY + 25, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 3.0 + Math.random(), color: colors[Math.floor(Math.random() * colors.length)], size: Math.random() * 25 + 5 });
                    }
                }
            } else if (state.adminImpactAnim.phase === 2) { // Phase post-explosion visuelle (Attente du Jugement)
                state.adminImpactAnim.timer--;
                state.shake = 10; // Vibrations résiduelles constantes
                
                // Ondes de choc visuelles pendant l'attente
                if (state.adminImpactAnim.timer % 8 === 0) {
                   const radius = 500 - (state.adminImpactAnim.timer * 4);
                   createParticles(state.dinoX + 25, state.dinoY + 25, '#00ff00', 30, 45);
                }

                if (state.adminImpactAnim.timer <= 0) {
                    // EFFACEMENT DE TOUTE EXISTENCE (Le boss meurt enfin après 2s)
                    if (state.boss?.active) { state.boss.health = 0; setBossHealthPercent(0); }
                    if (state.shadowActive) state.shadowHealth = 0;
                    
                    setDmgFlash(0.6); // Flash final de confirmation
                    state.shake = 120;
                    state.adminImpactAnim.active = false; // Fin de l'invincibilité
                }
            }
        }

        if (state.boss?.active && !isShadowMode) {
          const b = state.boss; const style = BOSS_STYLES[b.type];
          if (b.isGolden) createParticles(b.x + Math.random()*300, b.y + Math.random()*300, '#facc15', 1, 3);
          if (Math.random() < 0.08) {
             const levelDmgBuff = dungeonLevel >= 80 ? 100 : 1;
             state.projectiles.push({ x: b.x + 100, y: b.y + 150, vx: -24 * speedMult, vy: (Math.random()-0.5)*18 * speedMult, id: Date.now(), owner: 'BOSS', dmg: (b.isGolden ? 150 : 25) * dungeonLevel * levelDmgBuff, color: b.isGolden ? '#facc15' : style.projectileColor });
          }
          if (b.health <= 0) { b.active = false; const drops = generateBossDrop(); onVictory(100 * dungeonLevel, drops); }
        }

        state.projectiles.forEach((p, i) => {
          p.x += p.vx; p.y += p.vy;
          if (p.owner === 'PLAYER') {
            if (state.boss?.active && !isShadowMode && Math.abs(p.x - (state.boss.x + 200)) < 200 && Math.abs(p.y - (state.boss.y + 200)) < 200) {
              state.boss.health -= (p.dmg || 1); setBossHealthPercent((state.boss.health / state.boss.maxHealth) * 100);
              if (!p.isPiercing) state.projectiles.splice(i, 1);
              createParticles(p.x, p.y, p.color || '#fff', 15);
            }
            if (isShadowMode && state.shadowActive && Math.abs(p.x - state.shadowX) < 50 && Math.abs(p.y - state.shadowY) < 50) {
                state.shadowHealth -= (p.dmg || 1); if (!p.isPiercing) state.projectiles.splice(i, 1); createParticles(p.x, p.y, '#a855f7', 15);
            }
          } else if (Math.abs(p.x - (state.dinoX + 25)) < 35 && Math.abs(p.y - (state.dinoY + 25)) < 35) { takeDamage(p.dmg || 25); state.projectiles.splice(i, 1); }
          if (p.x < -1000 || p.x > CANVAS_WIDTH + 1000 || p.y > CANVAS_HEIGHT + 1000) state.projectiles.splice(i, 1);
        });

        ctx.save();
        if (state.shake > 0) { ctx.translate((Math.random()-0.5)*state.shake, (Math.random()-0.5)*state.shake); state.shake *= 0.94; }
        ctx.fillStyle = isShadowMode ? '#020617' : (state.timeStop > 0 ? '#111827' : theme.bg);
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = isShadowMode ? '#1e1b4b' : theme.floor; ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
        if (dmgFlash > 0) { ctx.fillStyle = `rgba(255, 255, 255, ${dmgFlash})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }

        if (state.iframe % 4 < 2) {
          ctx.fillStyle = '#000000';
          [[-1,0],[1,0],[0,-1],[0,1]].forEach(([ox, oy]) => { DINO_SPRITE.forEach((row, r) => row.split('').forEach((c, col) => { if (c === 'R') ctx.fillRect(state.dinoX + col*ps + ox, state.dinoY + r*ps + oy, ps+0.5, ps+0.5); })); });
          DINO_SPRITE.forEach((row, r) => row.split('').forEach((c, col) => { if (c === 'R') { ctx.fillStyle = state.dashTimer > 0 ? '#818cf8' : skinColor; ctx.fillRect(state.dinoX + col*ps, state.dinoY + r*ps, ps+0.5, ps+0.5); } }));
        }

        // VISUEL : ORBE DE CONCENTRATION ADMINISTRATOR
        if (state.adminImpactAnim.active && state.adminImpactAnim.phase === 1) {
            const radius = (1.0 - state.adminImpactAnim.timer / 90) * 180;
            ctx.save();
            ctx.shadowBlur = 60; ctx.shadowColor = '#00ffff';
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.beginPath(); ctx.arc(state.dinoX + 25, state.dinoY + 25, radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.stroke();
            ctx.restore();
        }

        if (isShadowMode && state.shadowActive) {
            ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = '#a855f7';
            DINO_SPRITE.forEach((row, r) => row.split('').forEach((c, col) => { if (c === 'R') { ctx.fillStyle = '#0f172a'; ctx.fillRect(state.shadowX + col*ps, state.shadowY + r*ps, ps+0.5, ps+0.5); ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 0.5; ctx.strokeRect(state.shadowX + col*ps, state.shadowY + r*ps, ps, ps); } }));
            ctx.restore(); ctx.fillStyle = '#000'; ctx.fillRect(state.shadowX - 25, state.shadowY - 20, 100, 8); ctx.fillStyle = '#a855f7'; ctx.fillRect(state.shadowX - 25, state.shadowY - 20, (state.shadowHealth / (5000*dungeonLevel)) * 100, 8);
        }

        if (state.boss?.active && !isShadowMode) {
          const b = state.boss; const style = BOSS_STYLES[b.type];
          ctx.save(); ctx.translate(b.x, b.y + Math.sin(Date.now()/200)*25);
          if (b.isGolden) { ctx.shadowBlur = 40; ctx.shadowColor = '#facc15'; }
          style.sprite.forEach((row, r) => row.split('').forEach((char, c) => { if (char !== ' ') { ctx.fillStyle = b.isGolden ? '#facc15' : (style.palette[char] || '#000'); ctx.fillRect(c * 28, r * 28, 29, 29); } }));
          ctx.restore();
        }

        state.projectiles.forEach(p => { ctx.save(); if (p.isUltimate) { ctx.shadowBlur = 30; ctx.shadowColor = p.color || '#fff'; } ctx.fillStyle = p.color || '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size || 16, 0, Math.PI*2); ctx.fill(); ctx.restore(); });
        state.particles.forEach((p, i) => { p.x += p.vx * speedMult; p.y += p.vy * speedMult; p.life -= 0.02; ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fillRect(p.x, p.y, p.size || 6, p.size || 6); if (p.life <= 0) state.particles.splice(i, 1); });
        ctx.restore();
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop); return () => cancelAnimationFrame(animId);
  }, [status, skinColor, upgrades.rangedDamage, dungeonLevel, onVictory, onGameOver, onCollect, onShadowDefeated, dmgFlash, theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(); const state = gameState.current;
      if (k === bindings.left.toLowerCase()) state.keys.left = true;
      if (k === bindings.right.toLowerCase()) state.keys.right = true;
      if (k === bindings.jump.toLowerCase() && state.dinoY >= GROUND_Y - DINO_HEIGHT - 10) state.dinoVy = JUMP_FORCE;
      const skillKeys = [bindings.skill1, bindings.skill2, bindings.skill3, bindings.skill4, bindings.skill5, bindings.skill6].map(sk => sk.toLowerCase());
      const sIdx = skillKeys.indexOf(k); if (sIdx !== -1 && equippedSkills[sIdx]) handleSkill(equippedSkills[sIdx].id);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(); const state = gameState.current;
      if (k === bindings.left.toLowerCase()) state.keys.left = false;
      if (k === bindings.right.toLowerCase()) state.keys.right = false;
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [bindings, equippedSkills]);

  return (
    <div className="relative font-pixel">
      {status === GameStatus.SHADOW_REALM && ( <div className="absolute inset-0 bg-purple-900/10 pointer-events-none animate-pulse z-0" /> )}
      {bossHealthPercent !== null && status !== GameStatus.SHADOW_REALM && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] z-20">
          <div className={`text-[12px] ${gameState.current.boss?.isGolden ? 'text-yellow-400' : 'text-white'} text-center mb-3 font-black uppercase drop-shadow-md`}> {gameState.current.boss?.isGolden ? '👑 BOSS LÉGENDAIRE (OR) 👑' : `BOSS : ${gameState.current.boss?.type}`} </div>
          <div className={`h-10 bg-black/80 border-4 ${gameState.current.boss?.isGolden ? 'border-yellow-400 animate-pulse' : 'border-white/40'} rounded-full overflow-hidden shadow-2xl`}>
            <div className={`h-full ${gameState.current.boss?.isGolden ? 'bg-yellow-400' : 'bg-gradient-to-r from-red-600 to-orange-400'} transition-all duration-300`} style={{width: `${bossHealthPercent}%`}} />
          </div>
        </div>
      )}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        {equippedSkills.map((s, i) => (
          <div key={i} className={`w-20 h-20 bg-black/90 border-4 ${SKILLS_DATA[s.id]?.rarity === 'ULTIMATE' ? 'border-yellow-400 animate-pulse' : 'border-white/20'} rounded-2xl flex flex-col items-center justify-center`}>
            <div className="text-[6px] text-white font-black text-center mb-1 uppercase px-1 truncate w-full">{s.label}</div>
            <div className="text-[12px] text-yellow-400 font-black">{[bindings.skill1, bindings.skill2, bindings.skill3, bindings.skill4, bindings.skill5, bindings.skill6][i]?.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div className="absolute top-10 left-10 flex flex-col gap-4 z-30">
        <div className="w-[350px] h-12 bg-black/60 border-4 border-white/20 rounded-2xl overflow-hidden relative shadow-lg">
          <div className="h-full bg-emerald-500 transition-all" style={{width: `${(dinoHP/upgrades.maxHealth)*100}%`}} />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black drop-shadow-md">HP: {Math.floor(dinoHP)}</div>
        </div>
        <div className="w-[300px] h-6 bg-black/60 border-2 border-white/10 rounded-full overflow-hidden shadow-md"> <div className="h-full bg-blue-500" style={{width: `${(dinoMana/DINO_MAX_MANA)*100}%`}} /> </div>
      </div>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-[4rem] border-[15px] border-black/80 shadow-2xl" />
    </div>
  );
};

export default Game;
