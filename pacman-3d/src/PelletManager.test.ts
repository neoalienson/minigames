/**
 * Unit tests for PelletManager class
 */

import * as THREE from 'three';
import { PelletManager } from './PelletManager';
import { Maze, MazeData } from './Maze';
import { Pacman } from './Pacman';

// Mock Three.js scene
const mockScene = new THREE.Scene();

// Test maze data with pellets
const testMazeData: MazeData = {
  width: 5,
  height: 5,
  layout: [
    [1, 1, 1, 1, 1],
    [1, 2, 2, 3, 1],
    [1, 2, 0, 2, 1],
    [1, 3, 2, 2, 1],
    [1, 1, 1, 1, 1]
  ],
  pacmanStart: { x: 2, z: 2 },
  ghostStarts: []
};

describe('PelletManager', () => {
  let pelletManager: PelletManager;
  let maze: Maze;
  let pacman: Pacman;

  beforeEach(() => {
    maze = new Maze(mockScene, testMazeData);
    pelletManager = new PelletManager(mockScene, maze);
    pacman = new Pacman(mockScene, maze, 2, 2);
  });

  afterEach(() => {
    pelletManager.dispose();
    maze.dispose();
    pacman.dispose();
  });

  describe('constructor', () => {
    it('should create pellets based on maze layout', () => {
      expect(pelletManager.getPellets().length).toBe(6); // Count of 2s in layout
      expect(pelletManager.getPowerPellets().length).toBe(2); // Count of 3s in layout
      expect(pelletManager.getTotalPellets()).toBe(8);
    });

    it('should initialize with zero collected pellets', () => {
      expect(pelletManager.getCollectedPellets()).toBe(0);
      expect(pelletManager.getRemainingPellets()).toBe(8);
    });
  });

  describe('update', () => {
    it('should update all pellets without errors', () => {
      expect(() => pelletManager.update(0.016)).not.toThrow();
    });
  });

  describe('checkPelletCollisions', () => {
    it('should detect no collision when Pacman is not near pellets', () => {
      const result = pelletManager.checkPelletCollisions(pacman);
      expect(result.collected).toBe(false);
      expect(result.points).toBe(0);
    });

    it('should detect collision when Pacman moves to pellet position', () => {
      // Move Pacman to a pellet position
      const worldPos = maze.gridToWorld(1, 1); // Position with regular pellet
      pacman.position.set(worldPos.x, 1, worldPos.z);
      
      const result = pelletManager.checkPelletCollisions(pacman);
      expect(result.collected).toBe(true);
      expect(result.points).toBe(10);
      expect(result.isPowerPellet).toBe(false);
    });

    it('should detect power pellet collision', () => {
      // Move Pacman to a power pellet position
      const worldPos = maze.gridToWorld(3, 1); // Position with power pellet
      pacman.position.set(worldPos.x, 1, worldPos.z);
      
      const result = pelletManager.checkPelletCollisions(pacman);
      expect(result.collected).toBe(true);
      expect(result.points).toBe(50);
      expect(result.isPowerPellet).toBe(true);
    });

    it('should update collected count after collection', () => {
      const worldPos = maze.gridToWorld(1, 1);
      pacman.position.set(worldPos.x, 1, worldPos.z);
      
      pelletManager.checkPelletCollisions(pacman);
      expect(pelletManager.getCollectedPellets()).toBe(1);
      expect(pelletManager.getRemainingPellets()).toBe(7);
    });
  });

  describe('areAllPelletsCollected', () => {
    it('should return false when pellets remain', () => {
      expect(pelletManager.areAllPelletsCollected()).toBe(false);
    });

    it('should return true when all pellets are collected', () => {
      // Collect all pellets by setting collected count
      const pellets = pelletManager.getPellets();
      const powerPellets = pelletManager.getPowerPellets();
      
      pellets.forEach(pellet => pellet.collect());
      powerPellets.forEach(powerPellet => powerPellet.collect());
      
      // Manually update collected count for test
      for (let i = 0; i < pelletManager.getTotalPellets(); i++) {
        const worldPos = maze.gridToWorld(1, 1);
        pacman.position.set(worldPos.x, 1, worldPos.z);
        pelletManager.checkPelletCollisions(pacman);
      }
      
      expect(pelletManager.areAllPelletsCollected()).toBe(true);
    });
  });

  describe('resetPellets', () => {
    it('should reset all pellets to initial state', () => {
      // Collect some pellets first
      const worldPos = maze.gridToWorld(1, 1);
      pacman.position.set(worldPos.x, 1, worldPos.z);
      pelletManager.checkPelletCollisions(pacman);
      
      expect(pelletManager.getCollectedPellets()).toBe(1);
      
      // Reset pellets
      pelletManager.resetPellets();
      
      expect(pelletManager.getCollectedPellets()).toBe(0);
      expect(pelletManager.getRemainingPellets()).toBe(pelletManager.getTotalPellets());
    });
  });

  describe('dispose', () => {
    it('should dispose without errors', () => {
      expect(() => pelletManager.dispose()).not.toThrow();
    });
  });
});