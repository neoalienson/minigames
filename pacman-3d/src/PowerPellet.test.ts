/**
 * Unit tests for PowerPellet class
 */

import * as THREE from 'three';
import { PowerPellet } from './PowerPellet';

// Mock Three.js scene
const mockScene = new THREE.Scene();

describe('PowerPellet', () => {
  let powerPellet: PowerPellet;

  beforeEach(() => {
    powerPellet = new PowerPellet(mockScene, 3, 7);
  });

  afterEach(() => {
    powerPellet.dispose();
  });

  describe('constructor', () => {
    it('should create a power pellet at the specified grid position', () => {
      const gridPos = powerPellet.getGridPosition();
      expect(gridPos.x).toBe(3);
      expect(gridPos.y).toBe(7);
    });

    it('should not be collected initially', () => {
      expect(powerPellet.getIsCollected()).toBe(false);
    });

    it('should have correct point value', () => {
      expect(powerPellet.getPointValue()).toBe(50);
    });

    it('should create a mesh with glow effect', () => {
      expect(powerPellet.mesh).toBeTruthy();
      expect(powerPellet.mesh).toBeInstanceOf(THREE.Mesh);
      // Check if glow mesh is added as child
      expect(powerPellet.mesh!.children.length).toBeGreaterThan(0);
    });
  });

  describe('setWorldPosition', () => {
    it('should update world position correctly', () => {
      powerPellet.setWorldPosition(20, 25);
      const worldPos = powerPellet.getWorldPosition();
      expect(worldPos.x).toBe(20);
      expect(worldPos.z).toBe(25);
      expect(worldPos.y).toBe(0.5); // Base Y position
    });
  });

  describe('update', () => {
    it('should update animation and glow effects when not collected', () => {
      const initialRotation = powerPellet.rotation.y;
      powerPellet.update(0.1);
      expect(powerPellet.rotation.y).not.toBe(initialRotation);
    });

    it('should not update when collected', () => {
      powerPellet.collect();
      const initialRotation = powerPellet.rotation.y;
      powerPellet.update(0.1);
      expect(powerPellet.rotation.y).toBe(initialRotation);
    });
  });

  describe('checkCollision', () => {
    beforeEach(() => {
      powerPellet.setWorldPosition(0, 0);
    });

    it('should detect collision when Pacman is close enough', () => {
      const pacmanPos = new THREE.Vector3(0.2, 0.5, 0.2);
      expect(powerPellet.checkCollision(pacmanPos)).toBe(true);
    });

    it('should not detect collision when Pacman is too far', () => {
      const pacmanPos = new THREE.Vector3(3, 0.5, 3);
      expect(powerPellet.checkCollision(pacmanPos)).toBe(false);
    });

    it('should not detect collision when already collected', () => {
      powerPellet.collect();
      const pacmanPos = new THREE.Vector3(0.2, 0.5, 0.2);
      expect(powerPellet.checkCollision(pacmanPos)).toBe(false);
    });

    it('should have larger collision radius than regular pellets', () => {
      const pacmanPos = new THREE.Vector3(1, 0.5, 0); // Distance that would miss regular pellet
      expect(powerPellet.checkCollision(pacmanPos)).toBe(true);
    });
  });

  describe('collect', () => {
    it('should mark power pellet as collected', () => {
      powerPellet.collect();
      expect(powerPellet.getIsCollected()).toBe(true);
    });

    it('should not collect twice', () => {
      powerPellet.collect();
      const firstCollected = powerPellet.getIsCollected();
      powerPellet.collect();
      expect(powerPellet.getIsCollected()).toBe(firstCollected);
    });
  });

  describe('dispose', () => {
    it('should dispose without errors', () => {
      expect(() => powerPellet.dispose()).not.toThrow();
    });
  });
});