/**
 * Unit tests for Pellet class
 */

import * as THREE from 'three';
import { Pellet } from './Pellet';

// Mock Three.js scene
const mockScene = new THREE.Scene();

describe('Pellet', () => {
  let pellet: Pellet;

  beforeEach(() => {
    pellet = new Pellet(mockScene, 5, 5);
  });

  afterEach(() => {
    pellet.dispose();
  });

  describe('constructor', () => {
    it('should create a pellet at the specified grid position', () => {
      const gridPos = pellet.getGridPosition();
      expect(gridPos.x).toBe(5);
      expect(gridPos.y).toBe(5);
    });

    it('should not be collected initially', () => {
      expect(pellet.getIsCollected()).toBe(false);
    });

    it('should have correct point value', () => {
      expect(pellet.getPointValue()).toBe(10);
    });

    it('should create a mesh', () => {
      expect(pellet.mesh).toBeTruthy();
      expect(pellet.mesh).toBeInstanceOf(THREE.Mesh);
    });
  });

  describe('setWorldPosition', () => {
    it('should update world position correctly', () => {
      pellet.setWorldPosition(10, 15);
      const worldPos = pellet.getWorldPosition();
      expect(worldPos.x).toBe(10);
      expect(worldPos.z).toBe(15);
      expect(worldPos.y).toBe(0.5); // Base Y position
    });
  });

  describe('update', () => {
    it('should update animation when not collected', () => {
      const initialRotation = pellet.rotation.y;
      pellet.update(0.1);
      expect(pellet.rotation.y).not.toBe(initialRotation);
    });

    it('should not update when collected', () => {
      pellet.collect();
      const initialRotation = pellet.rotation.y;
      pellet.update(0.1);
      expect(pellet.rotation.y).toBe(initialRotation);
    });
  });

  describe('checkCollision', () => {
    beforeEach(() => {
      pellet.setWorldPosition(0, 0);
    });

    it('should detect collision when Pacman is close enough', () => {
      const pacmanPos = new THREE.Vector3(0.1, 0.5, 0.1);
      expect(pellet.checkCollision(pacmanPos)).toBe(true);
    });

    it('should not detect collision when Pacman is too far', () => {
      const pacmanPos = new THREE.Vector3(2, 0.5, 2);
      expect(pellet.checkCollision(pacmanPos)).toBe(false);
    });

    it('should not detect collision when already collected', () => {
      pellet.collect();
      const pacmanPos = new THREE.Vector3(0.1, 0.5, 0.1);
      expect(pellet.checkCollision(pacmanPos)).toBe(false);
    });
  });

  describe('collect', () => {
    it('should mark pellet as collected', () => {
      pellet.collect();
      expect(pellet.getIsCollected()).toBe(true);
    });

    it('should not collect twice', () => {
      pellet.collect();
      const firstCollected = pellet.getIsCollected();
      pellet.collect();
      expect(pellet.getIsCollected()).toBe(firstCollected);
    });
  });

  describe('dispose', () => {
    it('should dispose without errors', () => {
      expect(() => pellet.dispose()).not.toThrow();
    });
  });
});