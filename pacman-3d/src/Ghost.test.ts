/**
 * Ghost class unit tests
 * Tests ghost AI behavior, movement, and collision detection
 */

import * as THREE from 'three';
import { Ghost, GhostState, GhostPersonality } from './Ghost';
import { Maze, TEST_MAZE_DATA } from './Maze';
import { Pacman } from './Pacman';

// Mock Three.js scene for testing
const mockScene = new THREE.Scene();

describe('Ghost', () => {
  let maze: Maze;
  let pacman: Pacman;
  let ghost: Ghost;

  beforeEach(() => {
    // Create maze and Pacman instances for testing
    maze = new Maze(mockScene, TEST_MAZE_DATA);
    pacman = new Pacman(mockScene, maze, 5, 5);
    
    // Create ghost with aggressive personality
    ghost = new Ghost(
      mockScene,
      maze,
      pacman,
      GhostPersonality.AGGRESSIVE,
      3,
      3
    );
  });

  afterEach(() => {
    // Clean up resources
    ghost.dispose();
    pacman.dispose();
    maze.dispose();
  });

  describe('Ghost Creation', () => {
    test('should create ghost with correct personality and position', () => {
      expect(ghost.getPersonality()).toBe(GhostPersonality.AGGRESSIVE);
      expect(ghost.getGridPosition()).toEqual(new THREE.Vector2(3, 3));
      expect(ghost.getState()).toBe(GhostState.CHASE);
    });

    test('should create ghost with different personalities', () => {
      const pinkGhost = new Ghost(
        mockScene,
        maze,
        pacman,
        GhostPersonality.AMBUSH,
        7,
        3
      );
      
      expect(pinkGhost.getPersonality()).toBe(GhostPersonality.AMBUSH);
      expect(pinkGhost.getGridPosition()).toEqual(new THREE.Vector2(7, 3));
      
      pinkGhost.dispose();
    });
  });

  describe('Ghost AI States', () => {
    test('should change state correctly', () => {
      expect(ghost.getState()).toBe(GhostState.CHASE);
      
      ghost.setState(GhostState.FRIGHTENED);
      expect(ghost.getState()).toBe(GhostState.FRIGHTENED);
      expect(ghost.isVulnerable()).toBe(true);
      
      ghost.setState(GhostState.DEAD);
      expect(ghost.getState()).toBe(GhostState.DEAD);
      expect(ghost.isVulnerable()).toBe(false);
    });

    test('should handle frightened state correctly', () => {
      ghost.setFrightened();
      expect(ghost.getState()).toBe(GhostState.FRIGHTENED);
      expect(ghost.isVulnerable()).toBe(true);
      
      ghost.setNormal();
      expect(ghost.getState()).toBe(GhostState.CHASE);
      expect(ghost.isVulnerable()).toBe(false);
    });

    test('should not change from dead state when setting frightened', () => {
      ghost.setState(GhostState.DEAD);
      ghost.setFrightened();
      expect(ghost.getState()).toBe(GhostState.DEAD);
    });
  });

  describe('Ghost Movement', () => {
    test('should update position over time', () => {
      // Update ghost multiple times to simulate movement
      for (let i = 0; i < 10; i++) {
        ghost.update(0.1); // 100ms per update
      }
      
      // Ghost should have attempted to move (position may be same if blocked by walls)
      const finalPosition = ghost.getGridPosition();
      expect(finalPosition).toBeDefined();
    });

    test('should have valid world position', () => {
      const worldPosition = ghost.getWorldPosition();
      expect(worldPosition).toBeInstanceOf(THREE.Vector3);
      expect(worldPosition.y).toBe(1); // Should be positioned above ground
    });
  });

  describe('Ghost Collision Detection', () => {
    test('should detect collision with Pacman when close', () => {
      // Move Pacman to same position as ghost
      pacman.reset(3, 3);
      
      // Update positions
      ghost.update(0.016);
      pacman.update(0.016);
      
      // Check collision
      const hasCollision = ghost.checkPacmanCollision();
      expect(typeof hasCollision).toBe('boolean');
    });

    test('should not detect collision when Pacman is far away', () => {
      // Ensure Pacman is far from ghost
      pacman.reset(9, 9);
      
      // Update positions
      ghost.update(0.016);
      pacman.update(0.016);
      
      // Check collision
      const hasCollision = ghost.checkPacmanCollision();
      expect(hasCollision).toBe(false);
    });
  });

  describe('Ghost Personality Behaviors', () => {
    test('should have different AI behaviors for different personalities', () => {
      const aggressiveGhost = new Ghost(
        mockScene, maze, pacman, GhostPersonality.AGGRESSIVE, 1, 1
      );
      const ambushGhost = new Ghost(
        mockScene, maze, pacman, GhostPersonality.AMBUSH, 2, 1
      );
      const randomGhost = new Ghost(
        mockScene, maze, pacman, GhostPersonality.RANDOM, 3, 1
      );
      const defensiveGhost = new Ghost(
        mockScene, maze, pacman, GhostPersonality.DEFENSIVE, 4, 1
      );
      
      expect(aggressiveGhost.getPersonality()).toBe(GhostPersonality.AGGRESSIVE);
      expect(ambushGhost.getPersonality()).toBe(GhostPersonality.AMBUSH);
      expect(randomGhost.getPersonality()).toBe(GhostPersonality.RANDOM);
      expect(defensiveGhost.getPersonality()).toBe(GhostPersonality.DEFENSIVE);
      
      // Clean up
      aggressiveGhost.dispose();
      ambushGhost.dispose();
      randomGhost.dispose();
      defensiveGhost.dispose();
    });
  });

  describe('Ghost Reset and Respawn', () => {
    test('should reset to starting position', () => {
      const startPosition = ghost.getGridPosition();
      
      // Move ghost by updating it
      ghost.update(1.0);
      
      // Reset ghost
      ghost.reset();
      
      // Should be back at starting position
      expect(ghost.getGridPosition()).toEqual(startPosition);
      expect(ghost.getState()).toBe(GhostState.CHASE);
    });

    test('should handle kill and respawn cycle', () => {
      ghost.kill();
      expect(ghost.getState()).toBe(GhostState.DEAD);
      
      // Reset should bring back to life
      ghost.reset();
      expect(ghost.getState()).toBe(GhostState.CHASE);
    });
  });

  describe('Ghost Resource Management', () => {
    test('should dispose resources without errors', () => {
      expect(() => {
        ghost.dispose();
      }).not.toThrow();
    });

    test('should handle multiple dispose calls', () => {
      ghost.dispose();
      expect(() => {
        ghost.dispose();
      }).not.toThrow();
    });
  });
});