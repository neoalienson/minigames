/**
 * GhostManager class unit tests
 * Tests ghost management, power mode, and collision handling
 */

import * as THREE from 'three';
import { GhostManager } from './GhostManager';
import { GhostState, GhostPersonality } from './Ghost';
import { Maze, TEST_MAZE_DATA } from './Maze';
import { Pacman } from './Pacman';

// Mock Three.js scene for testing
const mockScene = new THREE.Scene();

describe('GhostManager', () => {
  let maze: Maze;
  let pacman: Pacman;
  let ghostManager: GhostManager;

  beforeEach(() => {
    // Create maze and Pacman instances for testing
    maze = new Maze(mockScene, TEST_MAZE_DATA);
    pacman = new Pacman(mockScene, maze, 5, 5);
    
    // Create ghost manager
    ghostManager = new GhostManager(mockScene, maze, pacman);
  });

  afterEach(() => {
    // Clean up resources
    ghostManager.dispose();
    pacman.dispose();
    maze.dispose();
  });

  describe('Ghost Manager Creation', () => {
    test('should create four ghost instances', () => {
      const ghosts = ghostManager.getGhosts();
      expect(ghosts).toHaveLength(4);
    });

    test('should create ghosts with different personalities', () => {
      const ghosts = ghostManager.getGhosts();
      const personalities = ghosts.map(ghost => ghost.getPersonality());
      
      expect(personalities).toContain(GhostPersonality.AGGRESSIVE);
      expect(personalities).toContain(GhostPersonality.AMBUSH);
      expect(personalities).toContain(GhostPersonality.RANDOM);
      expect(personalities).toContain(GhostPersonality.DEFENSIVE);
    });

    test('should place ghosts at different starting positions', () => {
      const ghosts = ghostManager.getGhosts();
      const positions = ghosts.map(ghost => ghost.getGridPosition());
      
      // All positions should be different
      const uniquePositions = new Set(positions.map(pos => `${pos.x},${pos.y}`));
      expect(uniquePositions.size).toBe(4);
    });
  });

  describe('Ghost State Management', () => {
    test('should set all ghosts to scatter mode', () => {
      ghostManager.setScatterMode();
      
      const ghosts = ghostManager.getGhosts();
      ghosts.forEach(ghost => {
        expect(ghost.getState()).toBe(GhostState.SCATTER);
      });
    });

    test('should set all ghosts to chase mode', () => {
      // First set to scatter, then back to chase
      ghostManager.setScatterMode();
      ghostManager.setChaseMode();
      
      const ghosts = ghostManager.getGhosts();
      ghosts.forEach(ghost => {
        expect(ghost.getState()).toBe(GhostState.CHASE);
      });
    });

    test('should reset all ghosts to starting positions', () => {
      const ghosts = ghostManager.getGhosts();
      const initialPositions = ghosts.map(ghost => ghost.getGridPosition());
      
      // Update ghosts to potentially move them
      ghostManager.update(1.0);
      
      // Reset ghosts
      ghostManager.resetGhosts();
      
      // Check they're back at starting positions
      const resetPositions = ghosts.map(ghost => ghost.getGridPosition());
      for (let i = 0; i < initialPositions.length; i++) {
        expect(resetPositions[i]).toEqual(initialPositions[i]);
      }
    });
  });

  describe('Power Mode Management', () => {
    test('should activate power mode correctly', () => {
      expect(ghostManager.isPowerModeActive()).toBe(false);
      
      ghostManager.activatePowerMode();
      
      expect(ghostManager.isPowerModeActive()).toBe(true);
      expect(ghostManager.getPowerModeTimeRemaining()).toBeGreaterThan(0);
    });

    test('should set ghosts to frightened state during power mode', () => {
      ghostManager.activatePowerMode();
      
      const ghosts = ghostManager.getGhosts();
      ghosts.forEach(ghost => {
        if (ghost.getState() !== GhostState.DEAD) {
          expect(ghost.getState()).toBe(GhostState.FRIGHTENED);
          expect(ghost.isVulnerable()).toBe(true);
        }
      });
    });

    test('should deactivate power mode after timeout', () => {
      ghostManager.activatePowerMode();
      expect(ghostManager.isPowerModeActive()).toBe(true);
      
      // Update for longer than power mode duration (10 seconds)
      ghostManager.update(11.0);
      
      expect(ghostManager.isPowerModeActive()).toBe(false);
      expect(ghostManager.getPowerModeTimeRemaining()).toBe(0);
    });

    test('should return ghosts to normal state after power mode ends', () => {
      ghostManager.activatePowerMode();
      
      // Update to end power mode
      ghostManager.update(11.0);
      
      const ghosts = ghostManager.getGhosts();
      ghosts.forEach(ghost => {
        if (ghost.getState() !== GhostState.DEAD) {
          expect(ghost.getState()).toBe(GhostState.CHASE);
          expect(ghost.isVulnerable()).toBe(false);
        }
      });
    });
  });

  describe('Ghost Collision Detection', () => {
    test('should detect no collision when Pacman is far from ghosts', () => {
      // Ensure Pacman is far from all ghosts
      pacman.reset(9, 9);
      
      const collision = ghostManager.checkPacmanCollisions();
      expect(collision.hasCollision).toBe(false);
      expect(collision.ghost).toBeNull();
    });

    test('should handle eating vulnerable ghost', () => {
      const ghosts = ghostManager.getGhosts();
      const testGhost = ghosts[0];
      
      // Set ghost to frightened state
      testGhost.setFrightened();
      expect(testGhost.isVulnerable()).toBe(true);
      
      // Eat the ghost
      const points = ghostManager.eatGhost(testGhost);
      
      expect(points).toBe(200);
      expect(testGhost.getState()).toBe(GhostState.DEAD);
    });

    test('should not award points for eating non-vulnerable ghost', () => {
      const ghosts = ghostManager.getGhosts();
      const testGhost = ghosts[0];
      
      // Ensure ghost is not vulnerable
      expect(testGhost.isVulnerable()).toBe(false);
      
      // Try to eat the ghost
      const points = ghostManager.eatGhost(testGhost);
      
      expect(points).toBe(0);
      expect(testGhost.getState()).not.toBe(GhostState.DEAD);
    });
  });

  describe('Ghost Queries', () => {
    test('should find ghost by personality', () => {
      const aggressiveGhost = ghostManager.getGhostByPersonality(GhostPersonality.AGGRESSIVE);
      expect(aggressiveGhost).not.toBeNull();
      expect(aggressiveGhost?.getPersonality()).toBe(GhostPersonality.AGGRESSIVE);
      
      const ambushGhost = ghostManager.getGhostByPersonality(GhostPersonality.AMBUSH);
      expect(ambushGhost).not.toBeNull();
      expect(ambushGhost?.getPersonality()).toBe(GhostPersonality.AMBUSH);
    });

    test('should count living ghosts correctly', () => {
      expect(ghostManager.getLivingGhostCount()).toBe(4);
      
      // Kill one ghost
      const ghosts = ghostManager.getGhosts();
      ghosts[0].kill();
      
      expect(ghostManager.getLivingGhostCount()).toBe(3);
    });

    test('should count vulnerable ghosts correctly', () => {
      expect(ghostManager.getVulnerableGhostCount()).toBe(0);
      
      // Activate power mode
      ghostManager.activatePowerMode();
      
      expect(ghostManager.getVulnerableGhostCount()).toBe(4);
    });
  });

  describe('Ghost Manager Updates', () => {
    test('should update all ghosts without errors', () => {
      expect(() => {
        ghostManager.update(0.016);
      }).not.toThrow();
    });

    test('should handle power mode timer updates', () => {
      ghostManager.activatePowerMode();
      const initialTime = ghostManager.getPowerModeTimeRemaining();
      
      ghostManager.update(1.0);
      
      const updatedTime = ghostManager.getPowerModeTimeRemaining();
      expect(updatedTime).toBeLessThan(initialTime);
    });
  });

  describe('Resource Management', () => {
    test('should dispose all resources without errors', () => {
      expect(() => {
        ghostManager.dispose();
      }).not.toThrow();
    });

    test('should handle multiple dispose calls', () => {
      ghostManager.dispose();
      expect(() => {
        ghostManager.dispose();
      }).not.toThrow();
    });

    test('should return empty ghost array after disposal', () => {
      ghostManager.dispose();
      const ghosts = ghostManager.getGhosts();
      expect(ghosts).toHaveLength(0);
    });
  });
});