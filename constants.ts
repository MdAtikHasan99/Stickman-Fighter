import { Controls } from './types';

// Canvas & World
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 576;
export const GRAVITY = 0.6;
export const FRICTION = 0.9;

// Player
export const PLAYER_1_ID = 1;
export const PLAYER_2_ID = 2;
export const PLAYER_WIDTH = 50;
export const PLAYER_HEIGHT = 90;
export const INITIAL_PLAYER_HEALTH = 100;
export const PLAYER_SPEED = 5;
export const JUMP_FORCE = 15;
export const PLAYER_1_COLOR = '#ef4444'; // red-500
export const PLAYER_2_COLOR = '#3b82f6'; // blue-500

// Combat
export const ATTACK_DURATION = 20; // in frames
export const ATTACK_COOLDOWN = 30; // in frames
export const ATTACK_RANGE = 70;
export const ATTACK_DAMAGE = 10;
export const KNOCKBACK_FORCE = 7;
export const HIT_FLASH_DURATION = 10; // in frames
export const BLOCK_DAMAGE_REDUCTION = 0.2; // Takes 20% of damage
export const BLOCK_KNOCKBACK_REDUCTION = 0.2; // Takes 20% of knockback
export const COMBO_MAX_TIME = 60; // 60 frames (1 second) to continue a combo
export const COMBO_DAMAGE_MULTIPLIER = 0.1; // 10% more damage per combo hit
export const KO_ANIMATION_DURATION = 60; // 60 frames (1 second)

// Controls
export const PLAYER_1_CONTROLS: Controls = {
  left: 'a',
  right: 'd',
  jump: 'w',
  attack: 'f',
  block: 's',
};

export const PLAYER_2_CONTROLS: Controls = {
  left: 'arrowleft',
  right: 'arrowright',
  jump: 'arrowup',
  attack: '/',
  block: 'arrowdown',
};