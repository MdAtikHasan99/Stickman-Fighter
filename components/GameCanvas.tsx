import React, { useRef, useEffect, useCallback } from 'react';
import { Player, Platform, Vector2D, Controls, Particle } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRAVITY,
  FRICTION,
  PLAYER_1_ID,
  PLAYER_2_ID,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  INITIAL_PLAYER_HEALTH,
  PLAYER_SPEED,
  JUMP_FORCE,
  PLAYER_1_COLOR,
  PLAYER_2_COLOR,
  ATTACK_DURATION,
  ATTACK_DAMAGE,
  KNOCKBACK_FORCE,
  PLAYER_1_CONTROLS,
  PLAYER_2_CONTROLS,
  HIT_FLASH_DURATION,
  ATTACK_RANGE,
  BLOCK_DAMAGE_REDUCTION,
  BLOCK_KNOCKBACK_REDUCTION,
  COMBO_MAX_TIME,
  COMBO_DAMAGE_MULTIPLIER,
  KO_ANIMATION_DURATION,
} from '../constants';

interface GameCanvasProps {
  onGameOver: (winner: Player | null) => void;
  setPlayer1Health: (health: number) => void;
  setPlayer2Health: (health: number) => void;
  setPlayer1Combo: (combo: number) => void;
  setPlayer2Combo: (combo: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, setPlayer1Health, setPlayer2Health, setPlayer1Combo, setPlayer2Combo }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playersRef = useRef<Player[]>([]);
  const platformsRef = useRef<Platform[]>([]);
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const animationFrameId = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef({ duration: 0, magnitude: 0 });

  const createPlayer = (id: number, color: string, x: number): Player => ({
    id,
    position: { x, y: 100 },
    velocity: { x: 0, y: 0 },
    size: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
    health: INITIAL_PLAYER_HEALTH,
    color,
    isGrounded: false,
    isAttacking: false,
    attackTimer: 0,
    facingDirection: id === PLAYER_1_ID ? 'right' : 'left',
    isHit: 0,
    isBlocking: false,
    comboCount: 0,
    comboTimer: 0,
    isKO: false,
    koTimer: 0,
  });

  const resetGame = useCallback(() => {
    playersRef.current = [
      createPlayer(PLAYER_1_ID, PLAYER_1_COLOR, CANVAS_WIDTH / 4),
      createPlayer(PLAYER_2_ID, PLAYER_2_COLOR, (CANVAS_WIDTH / 4) * 3 - PLAYER_WIDTH),
    ];
    platformsRef.current = [
      // Main floor
      { position: { x: 0, y: CANVAS_HEIGHT - 50 }, size: { width: CANVAS_WIDTH, height: 50 } },
      // Mid platforms
      { position: { x: 200, y: 350 }, size: { width: 250, height: 20 } },
      { position: { x: CANVAS_WIDTH - 200 - 250, y: 350 }, size: { width: 250, height: 20 } },
      // Top platform
      { position: { x: (CANVAS_WIDTH - 300) / 2, y: 200 }, size: { width: 300, height: 20 } },
    ];
    particlesRef.current = [];
    setPlayer1Health(INITIAL_PLAYER_HEALTH);
    setPlayer2Health(INITIAL_PLAYER_HEALTH);
    setPlayer1Combo(0);
    setPlayer2Combo(0);
  }, [setPlayer1Health, setPlayer2Health, setPlayer1Combo, setPlayer2Combo]);

  const drawStickman = useCallback((ctx: CanvasRenderingContext2D, player: Player) => {
    const { x, y } = player.position;
    const { width, height } = player.size;
    const dir = player.facingDirection === 'right' ? 1 : -1;

    ctx.save();
    ctx.translate(x, y);

    // Body
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.2);
    ctx.lineTo(width / 2, height * 0.6);
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 6;
    
    // Head
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.1, height * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.beginPath(); // Reset path for limbs

    if (player.isKO) {
        const rotationProgress = (KO_ANIMATION_DURATION - player.koTimer) / KO_ANIMATION_DURATION;
        const rotationAngle = (Math.PI / 2) * rotationProgress * dir * -1; // Rotate backward

        ctx.translate(width / 2, height / 2);
        ctx.rotate(rotationAngle);
        ctx.translate(-width / 2, -height / 2);
        
        // Body
        ctx.moveTo(width / 2, height * 0.2);
        ctx.lineTo(width / 2, height * 0.6);
        
        // Head
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.1, height * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.beginPath();

        // Limp Limbs
        ctx.moveTo(width / 2, height * 0.6);
        ctx.lineTo(width * 0.3, height * 0.9);
        ctx.moveTo(width / 2, height * 0.6);
        ctx.lineTo(width * 0.7, height * 0.9);
        ctx.moveTo(width / 2, height * 0.4);
        ctx.lineTo(width * 0.2, height * 0.5);
        ctx.moveTo(width / 2, height * 0.4);
        ctx.lineTo(width * 0.8, height * 0.5);

    } else if (player.isAttacking) {
        if (player.attackTimer > ATTACK_DURATION - 5) { // Wind-up phase
            if (player.id === PLAYER_1_ID) { // Player 1 Punch Wind-up
                ctx.moveTo(width / 2, height * 0.4);
                ctx.lineTo(width / 2 - width * 0.3 * dir, height * 0.3);
            } else { // Player 2 Kick Wind-up
                ctx.moveTo(width / 2, height * 0.6);
                ctx.lineTo(width / 2 - width * 0.1 * dir, height * 0.8);
            }
        } else { // Execution phase
            if (player.id === PLAYER_1_ID) { // Player 1: Punch
                // Attacking arm
                ctx.moveTo(width / 2, height * 0.4);
                ctx.lineTo(width / 2 + (width * 0.8) * dir, height * 0.35);
                // Other arm
                ctx.moveTo(width / 2, height * 0.4);
                ctx.lineTo(width / 2 - (width * 0.3) * dir, height * 0.5);
            } else { // Player 2: Kick
                // Attacking leg
                ctx.moveTo(width / 2, height * 0.6);
                ctx.lineTo(width / 2 + (width * 0.6) * dir, height * 0.8);
                // Grounded leg
                ctx.moveTo(width / 2, height * 0.6);
                ctx.lineTo(width / 2 - (width * 0.2) * dir, height);
            }
        }
        // Draw non-attacking limbs for both players during attack
        if (player.id === PLAYER_1_ID) { // P1 non-attacking limbs
            ctx.moveTo(width / 2, height * 0.6);
            ctx.lineTo(width / 2 - width * 0.2 * dir, height);
            ctx.moveTo(width / 2, height * 0.6);
            ctx.lineTo(width / 2 + width * 0.2 * dir, height);
        } else { // P2 non-attacking limbs
            ctx.moveTo(width / 2, height * 0.4);
            ctx.lineTo(width / 2 - (width * 0.3) * dir, height * 0.3);
            ctx.moveTo(width / 2, height * 0.4);
            ctx.lineTo(width / 2 + (width * 0.3) * dir, height * 0.3);
        }
    } else if (player.isBlocking) {
        // Blocking pose
        // Legs
        ctx.moveTo(width / 2, height * 0.6);
        ctx.lineTo(width / 2 - width * 0.2 * dir, height);
        ctx.moveTo(width / 2, height * 0.6);
        ctx.lineTo(width / 2 + width * 0.2 * dir, height);
        // Arms (crossed)
        ctx.moveTo(width / 2, height * 0.4);
        ctx.lineTo(width / 2 + width * 0.3 * dir, height * 0.3);
        ctx.moveTo(width / 2, height * 0.4);
        ctx.lineTo(width / 2 - width * 0.3 * dir, height * 0.5);
    } else if (!player.isGrounded) {
      // Jumping pose
      // Legs (tucked in)
      ctx.moveTo(width / 2, height * 0.6);
      ctx.lineTo(width / 2 - width * 0.2 * dir, height * 0.8);
      ctx.moveTo(width / 2, height * 0.6);
      ctx.lineTo(width / 2 + width * 0.2 * dir, height * 0.8);
      // Arms (raised)
      ctx.moveTo(width / 2, height * 0.4);
      ctx.lineTo(width / 2 + width * 0.3 * dir, height * 0.2);
      ctx.moveTo(width / 2, height * 0.4);
      ctx.lineTo(width / 2 - width * 0.3 * dir, height * 0.2);
    } else {
      // Idle/Running pose
      // Legs
      ctx.moveTo(width / 2, height * 0.6);
      ctx.lineTo(width / 2 - width * 0.2 * dir, height);
      ctx.moveTo(width / 2, height * 0.6);
      ctx.lineTo(width / 2 + width * 0.2 * dir, height);
      // Arms
      ctx.moveTo(width / 2, height * 0.4);
      ctx.lineTo(width / 2 + width * 0.3 * dir, height * 0.6);
      ctx.moveTo(width / 2, height * 0.4);
      ctx.lineTo(width / 2 - width * 0.3 * dir, height * 0.6);
    }
    ctx.stroke();

    if (player.isHit > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  },[]);
  
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    let gameOverConditionMet = false;

    // --- UPDATE LOGIC ---
    playersRef.current.forEach((player) => {
      if (player.isKO) {
          player.velocity.y += GRAVITY;
          player.position.y += player.velocity.y;
          player.koTimer--;
          if (player.koTimer <= 0) {
              gameOverConditionMet = true;
          }
          return; // Skip controls and other logic if KO'd
      }

      const controls: Controls = player.id === PLAYER_1_ID ? PLAYER_1_CONTROLS : PLAYER_2_CONTROLS;
      const keys = keysPressedRef.current;

      // Block
      player.isBlocking = keys[controls.block] && player.isGrounded && !player.isAttacking;

      // Movement
      if (!player.isBlocking) {
        if (keys[controls.left]) {
            player.velocity.x = -PLAYER_SPEED;
            player.facingDirection = 'left';
        } else if (keys[controls.right]) {
            player.velocity.x = PLAYER_SPEED;
            player.facingDirection = 'right';
        }
      }
      
      // Jump
      if (keys[controls.jump] && player.isGrounded && !player.isBlocking) {
        player.velocity.y = -JUMP_FORCE;
        player.isGrounded = false;
      }
      
      // Attack
      if (keys[controls.attack] && player.attackTimer <= 0 && !player.isBlocking) {
        player.isAttacking = true;
        player.attackTimer = ATTACK_DURATION;
      }
      
      // Update timers
      if (player.attackTimer > 0) {
        player.attackTimer--;
        if (player.attackTimer <= 0) {
          player.isAttacking = false;
        }
      }
      if(player.isHit > 0) {
        player.isHit--;
      }
      if (player.comboTimer > 0) {
        player.comboTimer--;
        if (player.comboTimer === 0) {
          player.comboCount = 0;
          if (player.id === PLAYER_1_ID) setPlayer1Combo(0);
          else setPlayer2Combo(0);
        }
      }

      // Physics
      player.velocity.y += GRAVITY;
      player.velocity.x *= FRICTION;
      
      const previousY = player.position.y;
      player.position.x += player.velocity.x;
      player.position.y += player.velocity.y;
      
      player.isGrounded = false;
      
      // Platform collisions
      platformsRef.current.forEach(platform => {
        if (player.isKO) return; // No platform collision for KO'd players
        if (player.position.x + player.size.width > platform.position.x &&
            player.position.x < platform.position.x + platform.size.width) {
          
          const wasAbove = previousY + player.size.height <= platform.position.y;
          const isNowIntersectingOrBelow = player.position.y + player.size.height >= platform.position.y;

          if (player.velocity.y >= 0 && wasAbove && isNowIntersectingOrBelow) {
            player.position.y = platform.position.y - player.size.height;
            player.velocity.y = 0;
            player.isGrounded = true;
          }
        }
      });
      
      // Canvas boundaries
      if (player.position.x < 0) player.position.x = 0;
      if (player.position.x + player.size.width > CANVAS_WIDTH) player.position.x = CANVAS_WIDTH - player.size.width;
    });

    // --- PLAYER-PLAYER COLLISION ---
    const [p1, p2] = playersRef.current;
    if (!p1.isKO && !p2.isKO && p1.position.x < p2.position.x + p2.size.width &&
        p1.position.x + p1.size.width > p2.position.x &&
        p1.position.y < p2.position.y + p2.size.height &&
        p1.position.y + p1.size.height > p2.position.y
    ) {
      // Resolve Overlap
      const overlapX = (p1.position.x + p1.size.width / 2) - (p2.position.x + p2.size.width / 2);
      const combinedHalfWidths = p1.size.width / 2 + p2.size.width / 2;
      const penetrationX = combinedHalfWidths - Math.abs(overlapX);

      if (penetrationX > 0) {
        const moveX = penetrationX / 2;
        if (overlapX > 0) { // p1 is to the right of p2
          p1.position.x += moveX;
          p2.position.x -= moveX;
        } else { // p1 is to the left of p2
          p1.position.x -= moveX;
          p2.position.x += moveX;
        }
        
        // Bounce effect
        const tempVelX = p1.velocity.x;
        p1.velocity.x = p2.velocity.x;
        p2.velocity.x = tempVelX;
      }
    }


    // --- ATTACK LOGIC & KO CHECK ---
    playersRef.current.forEach((player, index) => {
        const otherPlayer = playersRef.current[1 - index];
        if (player.isKO || otherPlayer.isKO) return; // Can't attack or be attacked if KO'd

        if (player.isAttacking && player.attackTimer === ATTACK_DURATION - 6) { // Hit frame
            const attackX = player.facingDirection === 'right' 
                ? player.position.x + player.size.width 
                : player.position.x;
            const attackY = player.position.y + player.size.height / 2;

            const distanceX = Math.abs((otherPlayer.position.x + otherPlayer.size.width/2) - attackX);
            const distanceY = Math.abs((otherPlayer.position.y + otherPlayer.size.height/2) - attackY);

            if (distanceX < ATTACK_RANGE && distanceY < player.size.height) { // Increased vertical range
              const damageMultiplier = otherPlayer.isBlocking ? BLOCK_DAMAGE_REDUCTION : 1;
              const knockbackMultiplier = otherPlayer.isBlocking ? BLOCK_KNOCKBACK_REDUCTION : 1;
              
              player.comboCount++;
              player.comboTimer = COMBO_MAX_TIME;
              if (player.id === PLAYER_1_ID) setPlayer1Combo(player.comboCount);
              else setPlayer2Combo(player.comboCount);
              
              otherPlayer.comboCount = 0;
              otherPlayer.comboTimer = 0;
              if (otherPlayer.id === PLAYER_1_ID) setPlayer1Combo(0);
              else setPlayer2Combo(0);
              
              const comboDamageBonus = Math.max(0, player.comboCount - 1) * COMBO_DAMAGE_MULTIPLIER;
              const finalDamage = ATTACK_DAMAGE * (1 + comboDamageBonus);

              otherPlayer.health -= finalDamage * damageMultiplier;
              otherPlayer.isHit = HIT_FLASH_DURATION;
              otherPlayer.velocity.x += (KNOCKBACK_FORCE * (player.facingDirection === 'right' ? 1 : -1)) * knockbackMultiplier;
              otherPlayer.velocity.y -= (KNOCKBACK_FORCE / 2) * knockbackMultiplier;
              
              screenShakeRef.current = { duration: 10, magnitude: 5 * knockbackMultiplier };

              const impactPosition = {
                  x: otherPlayer.position.x + otherPlayer.size.width / 2,
                  y: otherPlayer.position.y + otherPlayer.size.height / 2,
              };
              for (let i = 0; i < 15; i++) {
                  particlesRef.current.push({
                      position: { ...impactPosition },
                      velocity: { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 },
                      radius: Math.random() * 3 + 1,
                      color: 'white',
                      lifespan: 20,
                      maxLifespan: 20,
                  });
              }
              
              const newHealth = Math.max(0, otherPlayer.health);
              if (otherPlayer.id === PLAYER_1_ID) {
                  setPlayer1Health(newHealth);
              } else {
                  setPlayer2Health(newHealth);
              }
              
              if (newHealth <= 0) {
                otherPlayer.isKO = true;
                otherPlayer.koTimer = KO_ANIMATION_DURATION;
              }
            }
        }
    });

    if (gameOverConditionMet) {
      cancelAnimationFrame(animationFrameId.current);
      const player1 = playersRef.current[0];
      const player2 = playersRef.current[1];
      const p1KO = player1.isKO;
      const p2KO = player2.isKO;

      if (p1KO && p2KO) {
        onGameOver(null); // Tie
      } else if (p1KO) {
        onGameOver(player2); // Player 2 wins
      } else {
        onGameOver(player1); // Player 1 wins
      }
      return; // Stop the loop
    }
    
    // --- DRAW LOGIC ---
    ctx.save();
    if (screenShakeRef.current.duration > 0) {
      const { magnitude } = screenShakeRef.current;
      const shakeX = (Math.random() - 0.5) * magnitude;
      const shakeY = (Math.random() - 0.5) * magnitude;
      ctx.translate(shakeX, shakeY);
      screenShakeRef.current.duration--;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Background
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Platforms
    platformsRef.current.forEach(platform => {
      ctx.fillStyle = '#334155'; // slate-700
      ctx.fillRect(platform.position.x, platform.position.y, platform.size.width, platform.size.height);
    });

    // Players
    playersRef.current.forEach(player => {
      drawStickman(ctx, player);
    });

    // Particles
    particlesRef.current = particlesRef.current.filter(p => p.lifespan > 0);
    particlesRef.current.forEach((p) => {
        p.velocity.y += GRAVITY * 0.1; // Less gravity for sparks
        p.position.x += p.velocity.x;
        p.position.y += p.velocity.y;
        p.lifespan--;

        // Draw
        ctx.globalAlpha = p.lifespan / p.maxLifespan;
        ctx.beginPath();
        ctx.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset alpha
    });
    
    ctx.restore();

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [onGameOver, setPlayer1Health, setPlayer2Health, setPlayer1Combo, setPlayer2Combo, drawStickman]);

  useEffect(() => {
    resetGame();
    animationFrameId.current = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e: KeyboardEvent) => { keysPressedRef.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressedRef.current[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-lg" />;
};

export default GameCanvas;