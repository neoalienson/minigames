/**
 * Main entry point for the 3D Isometric Pacman game
 */

import * as THREE from 'three';
import { Howl } from 'howler';
import { GameEngine } from './GameEngine';

console.log('3D Isometric Pacman - Starting...');

// Initialize the game
let gameEngine: GameEngine | null = null;

function initializeGame(): void {
  try {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Verify Three.js and Howler.js are available
    console.log('Three.js version:', THREE.REVISION);
    console.log('Howler.js available:', typeof Howl !== 'undefined');

    // Create and start the game engine
    gameEngine = new GameEngine(canvas);
    gameEngine.start();

    console.log('Game initialized and started successfully');
    
    // Add basic controls info to console
    console.log('Game controls:');
    console.log('- Use Arrow Keys to move Pacman');
    console.log('- Press Space to pause/resume');
    console.log('- Press R to restart');
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

// Keyboard input is now handled automatically by InputManager in GameEngine
// No need for manual keyboard event handling here

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

// Keyboard input is handled automatically by InputManager - no manual listeners needed

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (gameEngine) {
    gameEngine.dispose();
  }
});
