/**
 * Tests for Pacman class
 */

import * as THREE from 'three';
import { Pacman } from './Pacman';
import { Maze } from './Maze';

// Mock Three.js scene
const mockScene = {
  add: jest.fn(),
  remove: jest.fn(),
  children: [],
  traverse: jest.fn(),
} as any;

// Simple test maze data
const testMazeData = {
  width: 5,
  height: 5,
  layout: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ],
  pacmanStart: { x: 2, z: 2 },
  ghostStarts: []
};

describe('Pacman', () => {
  let maze: Maze;
  let pacman: Pacman;

  beforeEach(() => {
    maze = new Maze(mockScene, testMazeData);
    pacman = new Pacman(mockScene, maze, 2, 2);
  });

  afterEach(() => {
    if (pacman) {
      pacman.dispose();
    }
    if (maze) {
      maze.dispose();
    }
  });

  test('should create Pacman at correct starting position', () => {
    const gridPos = pacman.getGridPosition();
    expect(gridPos.x).toBe(2);
    expect(gridPos.y).toBe(2);
  });

  test('should have a mesh after creation', () => {
    expect(pacman.mesh).toBeTruthy();
    expect(pacman.mesh).toBeInstanceOf(THREE.Mesh);
  });

  test('should start not moving', () => {
    expect(pacman.getIsMoving()).toBe(false);
  });

  test('should set direction correctly', () => {
    const direction = new THREE.Vector2(1, 0);
    pacman.setDirection(direction);
    
    // Update to process the direction change
    pacman.update(0.016); // ~60fps
    
    const currentDirection = pacman.getCurrentDirection();
    expect(currentDirection.x).toBe(1);
    expect(currentDirection.y).toBe(0);
  });

  test('should start moving when valid direction is set', () => {
    const direction = new THREE.Vector2(1, 0); // Move right
    pacman.setDirection(direction);
    
    // Update to process the direction change
    pacman.update(0.016);
    
    expect(pacman.getIsMoving()).toBe(true);
  });

  test('should not move into walls', () => {
    const direction = new THREE.Vector2(0, -1); // Move up into wall
    pacman.setDirection(direction);
    
    // Update multiple times
    for (let i = 0; i < 10; i++) {
      pacman.update(0.016);
    }
    
    // Should still be at starting position
    const gridPos = pacman.getGridPosition();
    expect(gridPos.x).toBe(2);
    expect(gridPos.y).toBe(2);
    expect(pacman.getIsMoving()).toBe(false);
  });

  test('should reset to specified position', () => {
    // Move Pacman first
    pacman.setDirection(new THREE.Vector2(1, 0));
    pacman.update(0.5); // Move for half a second
    
    // Reset to new position
    pacman.reset(1, 3);
    
    const gridPos = pacman.getGridPosition();
    expect(gridPos.x).toBe(1);
    expect(gridPos.y).toBe(3);
    expect(pacman.getIsMoving()).toBe(false);
  });

  test('should update world position based on grid position', () => {
    const worldPos = pacman.getWorldPosition();
    expect(worldPos.y).toBe(1); // Should be positioned above ground
    expect(typeof worldPos.x).toBe('number');
    expect(typeof worldPos.z).toBe('number');
  });
});