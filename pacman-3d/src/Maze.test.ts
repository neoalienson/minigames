/**
 * Tests for Maze class - Basic maze structure and rendering
 */

import * as THREE from 'three';
import { Maze, TEST_MAZE_DATA, MazeData } from './Maze';

// Mock Three.js for testing
jest.mock('three', () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
  })),
  BoxGeometry: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  MeshLambertMaterial: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn() },
    castShadow: true,
    receiveShadow: true,
  })),
}));

describe('Maze', () => {
  let scene: THREE.Scene;
  let maze: Maze;

  beforeEach(() => {
    // Create mock scene
    scene = new THREE.Scene();
    scene.add = jest.fn();
    scene.remove = jest.fn();
    
    // Create maze instance
    maze = new Maze(scene, TEST_MAZE_DATA);
  });

  afterEach(() => {
    if (maze) {
      maze.dispose();
    }
  });

  describe('Maze Data Structure', () => {
    it('should accept 2D maze layout data structure using number arrays', () => {
      const mazeData = maze.getMazeData();
      
      expect(mazeData.width).toBe(11);
      expect(mazeData.height).toBe(11);
      expect(Array.isArray(mazeData.layout)).toBe(true);
      expect(mazeData.layout.length).toBe(11);
      expect(mazeData.layout[0].length).toBe(11);
    });

    it('should have proper maze layout with walls and empty spaces', () => {
      const mazeData = maze.getMazeData();
      
      // Check corners are walls (value 1)
      expect(mazeData.layout[0][0]).toBe(1);
      expect(mazeData.layout[0][10]).toBe(1);
      expect(mazeData.layout[10][0]).toBe(1);
      expect(mazeData.layout[10][10]).toBe(1);
      
      // Check center is empty (value 0)
      expect(mazeData.layout[5][5]).toBe(0);
    });

    it('should have pacman and ghost start positions', () => {
      const mazeData = maze.getMazeData();
      
      expect(mazeData.pacmanStart).toEqual({ x: 5, z: 5 });
      expect(mazeData.ghostStarts).toHaveLength(4);
      expect(mazeData.ghostStarts[0]).toEqual({ x: 3, z: 3 });
    });
  });

  describe('3D Wall Generation', () => {
    it('should generate 3D wall geometry from 2D data', () => {
      // Count walls in test maze data
      let wallCount = 0;
      for (let row = 0; row < TEST_MAZE_DATA.height; row++) {
        for (let col = 0; col < TEST_MAZE_DATA.width; col++) {
          if (TEST_MAZE_DATA.layout[row][col] === 1) {
            wallCount++;
          }
        }
      }
      
      // Verify scene.add was called for each wall
      expect(scene.add).toHaveBeenCalledTimes(wallCount);
    });

    it('should create modular wall pieces using BoxGeometry', () => {
      // Verify BoxGeometry constructor was called
      expect(THREE.BoxGeometry).toHaveBeenCalled();
    });

    it('should create materials for maze walls', () => {
      // Verify MeshLambertMaterial constructor was called
      expect(THREE.MeshLambertMaterial).toHaveBeenCalled();
    });
  });

  describe('Coordinate Conversion', () => {
    it('should convert world coordinates to grid coordinates', () => {
      const gridCoords = maze.worldToGrid(0, 0);
      expect(gridCoords.x).toBe(Math.round(TEST_MAZE_DATA.width / 2));
      expect(gridCoords.z).toBe(Math.round(TEST_MAZE_DATA.height / 2));
    });

    it('should convert grid coordinates to world coordinates', () => {
      const worldCoords = maze.gridToWorld(5, 5);
      // For an 11x11 maze, grid position (5,5) should be at world position (-1, -1)
      // because (5 - 11/2) * 2 = (5 - 5.5) * 2 = -1
      expect(worldCoords.x).toBe(-1);
      expect(worldCoords.z).toBe(-1);
    });

    it('should detect walls correctly', () => {
      // Test corner (should be wall)
      expect(maze.isWall(0, 0)).toBe(true);
      
      // Test center (should be empty)
      expect(maze.isWall(5, 5)).toBe(false);
      
      // Test out of bounds (should be wall)
      expect(maze.isWall(-1, -1)).toBe(true);
      expect(maze.isWall(20, 20)).toBe(true);
    });
  });

  describe('Maze Updates', () => {
    it('should update maze with new data', () => {
      const newMazeData: MazeData = {
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
        ghostStarts: [{ x: 1, z: 1 }]
      };

      maze.updateMaze(newMazeData);
      
      const updatedData = maze.getMazeData();
      expect(updatedData.width).toBe(5);
      expect(updatedData.height).toBe(5);
    });
  });

  describe('Resource Management', () => {
    it('should dispose resources properly', () => {
      const mockGeometry = { dispose: jest.fn() };
      const mockMaterial = { dispose: jest.fn() };
      
      // Mock the geometry and material
      (maze as any).wallGeometry = mockGeometry;
      (maze as any).wallMaterial = mockMaterial;
      
      maze.dispose();
      
      expect(mockGeometry.dispose).toHaveBeenCalled();
      expect(mockMaterial.dispose).toHaveBeenCalled();
    });
  });
});