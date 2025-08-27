export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  size: { width: number; height: number };
  health: number;
  color: string;
  isGrounded: boolean;
  isAttacking: boolean;
  attackTimer: number;
  facingDirection: 'left' | 'right';
  isHit: number; // timer to show hit flash
  isBlocking: boolean;
  comboCount: number;
  comboTimer: number;
  isKO: boolean;
  koTimer: number;
}

export interface Platform {
  position: Vector2D;
  size: { width: number; height: number };
}

export enum GameState {
  Menu = 'MENU',
  Playing = 'PLAYING',
  GameOver = 'GAME_OVER',
}

export interface Controls {
    left: string;
    right: string;
    jump: string;
    attack: string;
    block: string;
}

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  color: string;
  lifespan: number;
  maxLifespan: number;
}