/**
 * CollisionSystem tests - Comprehensive testing for collision detection
 */

import * as THREE from 'three';
import { CollisionSystem } from './CollisionSystem';
import { Maze, MazeData } from './Maze';
import { GameObject } from './GameObject';

// Mock GameObject for testing
class MockGameObject extends GameObject {
  constructor(scene: THREE.Scene, position: THREE.Vector3 = new THREE.Vector3()) {
    super(scene);
    this.position.copy(position);
  }

  update(_deltaTime: number): void {
    // Mock implementation
  }

  render(): void {
    // Mock implementation
  }
}

// Test maze data for collision testing
const TEST_COLLISION_MAZE: MazeData = {
  width: 5,
  height: 5,
  layout: [
    [1, 1, 1, 1, 1],  // Row 0 (z=0): all walls
    [1, 0, 0, 0, 1],  // Row 1 (z=1): walls on sides, empty in middle
    [1, 0, 1, 0, 1],  // Row 2 (z=2): walls on sides, wall in center
    [1, 0, 0, 0, 1],  // Row 3 (z=3): walls on sides, empty in middle
    [1, 1, 1, 1, 1]   // Row 4 (z=4): all walls
  ],
  pacmanStart: { x: 1, z: 1 },
  ghostStarts: [{ x: 3, z: 3 }]
};

describe('CollisionSystem', () => {
  let scene: THREE.Scene;
  let maze: Maze;
  let collisionSystem: CollisionSystem;

  beforeEach(() => {
    scene = new THREE.Scene();
    maze = new Maze(scene, TEST_COLLISION_MAZE);
    collisionSystem = new CollisionSystem(maze);
  });

  afterEach(() => {
    maze.dispose();
  });

  describe('Grid-based collision detection', () => {
    test('should detect wall collision at wall positions', () => {
      // Test wall positions from the maze layout
      const wallCollision = collisionSystem.checkGridCollision(0, 0); // Top-left corner (wall)
      expect(wallCollision.hasCollision).toBe(true);
      expect(wallCollision.collisionType).toBe('wall');
      expect(wallCollision.collisionPoint).toBeDefined();
    });

    test('should not detect collision at empty positions', () => {
      // Test empty position
      const emptyCollision = collisionSystem.checkGridCollision(1, 1); // Empty space
      expect(emptyCollision.hasCollision).toBe(false);
    });

    test('should detect collision at internal wall positions', () => {
      // Test internal wall at position (2, 2)
      const internalWallCollision = collisionSystem.checkGridCollision(2, 2);
      expect(internalWallCollision.hasCollision).toBe(true);
      expect(internalWallCollision.collisionType).toBe('wall');
    });
  });

  describe('Wall collision detection for movement', () => {
    test('should prevent movement into walls', () => {
      const currentPos = new THREE.Vector2();
      currentPos.x = 1;
      currentPos.y = 1; // Empty space
      const upDirection = new THREE.Vector2();
      upDirection.x = 0;
      upDirection.y = -1; // Moving up into wall
      
      const collision = collisionSystem.checkWallCollision(currentPos, upDirection);
      expect(collision.hasCollision).toBe(true);
    });

    test('should allow movement into empty spaces', () => {
      const currentPos = new THREE.Vector2();
      currentPos.x = 1;
      currentPos.y = 1; // Empty space at (1,1) - layout[1][1] = 0
      const rightDirection = new THREE.Vector2();
      rightDirection.x = 1;
      rightDirection.y = 0; // Moving right to (2,1) - layout[1][2] = 0
      
      // Verify the positions are actually empty
      expect(maze.isWall(1, 1)).toBe(false); // Current position should be empty
      expect(maze.isWall(2, 1)).toBe(false); // Target position should be empty
      
      const collision = collisionSystem.checkWallCollision(currentPos, rightDirection);
      expect(collision.hasCollision).toBe(false);
    });

    test('should check movement direction validity', () => {
      const currentPos = new THREE.Vector2();
      currentPos.x = 1;
      currentPos.y = 1; // Position (1,1) - empty space
      
      // Verify maze layout first
      expect(maze.isWall(1, 0)).toBe(true);  // Up: (1,0) should be wall
      expect(maze.isWall(1, 2)).toBe(false); // Down: (1,2) should be empty (layout[2][1] = 0)
      expect(maze.isWall(2, 1)).toBe(false); // Right: (2,1) should be empty (layout[1][2] = 0)  
      expect(maze.isWall(0, 1)).toBe(true);  // Left: (0,1) should be wall
      
      // Create direction vectors properly
      const upDir = new THREE.Vector2(); upDir.x = 0; upDir.y = -1;
      const downDir = new THREE.Vector2(); downDir.x = 0; downDir.y = 1;
      const rightDir = new THREE.Vector2(); rightDir.x = 1; rightDir.y = 0;
      const leftDir = new THREE.Vector2(); leftDir.x = -1; leftDir.y = 0;
      
      // Test all four directions from position (1,1)
      expect(collisionSystem.canMoveInDirection(currentPos, upDir)).toBe(false); // Up to (1,0) - wall
      expect(collisionSystem.canMoveInDirection(currentPos, downDir)).toBe(true);   // Down to (1,2) - empty
      expect(collisionSystem.canMoveInDirection(currentPos, rightDir)).toBe(true);   // Right to (2,1) - empty
      expect(collisionSystem.canMoveInDirection(currentPos, leftDir)).toBe(false); // Left to (0,1) - wall
    });
  });

  describe('Boundary collision detection', () => {
    test('should detect collision outside maze boundaries', () => {
      // Test positions outside the 5x5 maze
      const leftBoundary = collisionSystem.checkBoundaryCollision(-1, 2);
      expect(leftBoundary.hasCollision).toBe(true);
      expect(leftBoundary.collisionType).toBe('boundary');

      const rightBoundary = collisionSystem.checkBoundaryCollision(5, 2);
      expect(rightBoundary.hasCollision).toBe(true);
      expect(rightBoundary.collisionType).toBe('boundary');

      const topBoundary = collisionSystem.checkBoundaryCollision(2, -1);
      expect(topBoundary.hasCollision).toBe(true);
      expect(topBoundary.collisionType).toBe('boundary');

      const bottomBoundary = collisionSystem.checkBoundaryCollision(2, 5);
      expect(bottomBoundary.hasCollision).toBe(true);
      expect(bottomBoundary.collisionType).toBe('boundary');
    });

    test('should not detect collision within maze boundaries', () => {
      const insideBoundary = collisionSystem.checkBoundaryCollision(2, 2);
      expect(insideBoundary.hasCollision).toBe(false);
    });
  });

  describe('Bounding box collision detection', () => {
    test('should detect collision between overlapping entities', () => {
      const entityA = new MockGameObject(scene, new THREE.Vector3(0, 0, 0));
      const entityB = new MockGameObject(scene, new THREE.Vector3(0.5, 0, 0)); // Overlapping
      
      const collision = collisionSystem.checkBoundingBoxCollision(entityA, entityB);
      expect(collision.hasCollision).toBe(true);
      expect(collision.collisionType).toBe('entity');
      expect(collision.collisionPoint).toBeDefined();
      expect(collision.collisionNormal).toBeDefined();
    });

    test('should not detect collision between separated entities', () => {
      const entityA = new MockGameObject(scene, new THREE.Vector3(0, 0, 0));
      const entityB = new MockGameObject(scene, new THREE.Vector3(5, 0, 0)); // Far apart
      
      const collision = collisionSystem.checkBoundingBoxCollision(entityA, entityB);
      expect(collision.hasCollision).toBe(false);
    });

    test('should calculate correct collision normal', () => {
      const entityA = new MockGameObject(scene, new THREE.Vector3(0, 0, 0));
      const entityB = new MockGameObject(scene, new THREE.Vector3(1, 0, 0)); // To the right
      
      const collision = collisionSystem.checkBoundingBoxCollision(entityA, entityB);
      if (collision.hasCollision && collision.collisionNormal) {
        // Normal should point from A to B (positive X direction)
        expect(collision.collisionNormal.x).toBeGreaterThan(0);
        expect(Math.abs(collision.collisionNormal.y)).toBeLessThan(0.1);
        expect(Math.abs(collision.collisionNormal.z)).toBeLessThan(0.1);
      }
    });
  });

  describe('Collision response system', () => {
    test('should stop movement when collision detected', () => {
      const entity = new MockGameObject(scene, new THREE.Vector3(0, 1, 0)); // At world position (0,1,0)
      const attemptedDirection = new THREE.Vector2();
      attemptedDirection.x = 0;
      attemptedDirection.y = -1; // Trying to move up into wall
      
      const resolvedDirection = collisionSystem.resolveWallCollision(entity, attemptedDirection);
      expect(resolvedDirection.x).toBe(0);
      expect(resolvedDirection.y).toBe(0);
    });

    test('should allow movement when no collision', () => {
      // Position entity at empty space in world coordinates
      const worldPos = maze.gridToWorld(1, 1); // Empty space
      const entity = new MockGameObject(scene, new THREE.Vector3(worldPos.x, 1, worldPos.z));
      const attemptedDirection = new THREE.Vector2();
      attemptedDirection.x = 1;
      attemptedDirection.y = 0; // Moving right into empty space
      
      // Verify the movement should be allowed
      expect(maze.isWall(1, 1)).toBe(false); // Current position is empty
      expect(maze.isWall(2, 1)).toBe(false); // Target position is empty
      
      const resolvedDirection = collisionSystem.resolveWallCollision(entity, attemptedDirection);
      expect(resolvedDirection.x).toBe(1);
      expect(resolvedDirection.y).toBe(0);
    });
  });

  describe('Entity-wall collision detection', () => {
    test('should detect when entity is in wall position', () => {
      // Position entity at wall location
      const wallWorldPos = maze.gridToWorld(0, 0); // Wall position
      const entity = new MockGameObject(scene, new THREE.Vector3(wallWorldPos.x, 1, wallWorldPos.z));
      
      const collision = collisionSystem.checkEntityWallCollision(entity);
      expect(collision.hasCollision).toBe(true);
      expect(collision.collisionType).toBe('wall');
    });

    test('should not detect collision when entity is in empty space', () => {
      // Position entity at empty location
      const emptyWorldPos = maze.gridToWorld(1, 1); // Empty space
      const entity = new MockGameObject(scene, new THREE.Vector3(emptyWorldPos.x, 1, emptyWorldPos.z));
      
      const collision = collisionSystem.checkEntityWallCollision(entity);
      expect(collision.hasCollision).toBe(false);
    });
  });

  describe('Closest valid position calculation', () => {
    test('should return same position if already valid', () => {
      const validPos = collisionSystem.getClosestValidPosition(1, 1); // Empty space
      expect(validPos.x).toBe(1);
      expect(validPos.y).toBe(1);
    });

    test('should find adjacent empty space for wall positions', () => {
      const validPos = collisionSystem.getClosestValidPosition(2, 2); // Wall position
      // Should find an adjacent empty space
      expect(collisionSystem.checkGridCollision(validPos.x, validPos.y).hasCollision).toBe(false);
    });

    test('should clamp to maze boundaries', () => {
      const validPos = collisionSystem.getClosestValidPosition(-5, -5); // Far outside
      expect(validPos.x).toBeGreaterThanOrEqual(0);
      expect(validPos.y).toBeGreaterThanOrEqual(0);
      expect(validPos.x).toBeLessThan(5);
      expect(validPos.y).toBeLessThan(5);
    });
  });

  describe('Swept collision detection', () => {
    test('should detect collision along movement path', () => {
      // Start in empty space, end in wall
      const startWorldPos = maze.gridToWorld(1, 1); // Empty
      const endWorldPos = maze.gridToWorld(0, 0);   // Wall
      
      const startPos = new THREE.Vector3(startWorldPos.x, 1, startWorldPos.z);
      const endPos = new THREE.Vector3(endWorldPos.x, 1, endWorldPos.z);
      
      const collision = collisionSystem.checkSweptCollision(startPos, endPos);
      expect(collision.hasCollision).toBe(true);
    });

    test('should not detect collision for valid movement path', () => {
      // Move between empty spaces
      const startWorldPos = maze.gridToWorld(1, 1); // Empty
      const endWorldPos = maze.gridToWorld(3, 1);   // Empty
      
      const startPos = new THREE.Vector3(startWorldPos.x, 1, startWorldPos.z);
      const endPos = new THREE.Vector3(endWorldPos.x, 1, endWorldPos.z);
      
      const collision = collisionSystem.checkSweptCollision(startPos, endPos);
      expect(collision.hasCollision).toBe(false);
    });
  });

  describe('Integration with maze boundaries and internal walls', () => {
    test('should handle all maze boundary walls correctly', () => {
      // Test all boundary positions
      for (let x = 0; x < 5; x++) {
        // Top and bottom boundaries
        expect(collisionSystem.checkGridCollision(x, 0).hasCollision).toBe(true);
        expect(collisionSystem.checkGridCollision(x, 4).hasCollision).toBe(true);
      }
      
      for (let z = 0; z < 5; z++) {
        // Left and right boundaries
        expect(collisionSystem.checkGridCollision(0, z).hasCollision).toBe(true);
        expect(collisionSystem.checkGridCollision(4, z).hasCollision).toBe(true);
      }
    });

    test('should handle internal walls correctly', () => {
      // Test the internal wall at (2,2)
      expect(collisionSystem.checkGridCollision(2, 2).hasCollision).toBe(true);
      
      // Test empty spaces around the internal wall
      expect(collisionSystem.checkGridCollision(1, 2).hasCollision).toBe(false);
      expect(collisionSystem.checkGridCollision(3, 2).hasCollision).toBe(false);
      expect(collisionSystem.checkGridCollision(2, 1).hasCollision).toBe(false);
      expect(collisionSystem.checkGridCollision(2, 3).hasCollision).toBe(false);
    });

    test('should prevent movement through maze boundaries', () => {
      // Test movement from edge positions outward
      const edgePos = new THREE.Vector2();
      edgePos.x = 1;
      edgePos.y = 0; // Near top boundary
      const outwardDirection = new THREE.Vector2();
      outwardDirection.x = 0;
      outwardDirection.y = -1; // Moving up into boundary
      
      expect(collisionSystem.canMoveInDirection(edgePos, outwardDirection)).toBe(false);
    });

    test('should prevent movement through internal walls', () => {
      // Test movement into internal wall
      const nearWallPos = new THREE.Vector2();
      nearWallPos.x = 1;
      nearWallPos.y = 2; // Next to internal wall
      const intoWallDirection = new THREE.Vector2();
      intoWallDirection.x = 1;
      intoWallDirection.y = 0; // Moving right into wall
      
      expect(collisionSystem.canMoveInDirection(nearWallPos, intoWallDirection)).toBe(false);
    });
  });

  describe('Performance and edge cases', () => {
    test('should handle zero movement direction', () => {
      const currentPos = new THREE.Vector2();
      currentPos.x = 1;
      currentPos.y = 1;
      const zeroDirection = new THREE.Vector2();
      zeroDirection.x = 0;
      zeroDirection.y = 0;
      
      expect(() => {
        collisionSystem.canMoveInDirection(currentPos, zeroDirection);
      }).not.toThrow();
    });

    test('should handle entities at exact grid boundaries', () => {
      // Test entity positioned exactly between grid cells
      const betweenGrids = maze.gridToWorld(1.5, 1.5);
      const entity = new MockGameObject(scene, new THREE.Vector3(betweenGrids.x, 1, betweenGrids.z));
      
      expect(() => {
        collisionSystem.checkEntityWallCollision(entity);
      }).not.toThrow();
    });

    test('should handle very large movement distances', () => {
      const startPos = new THREE.Vector3(0, 0, 0);
      const endPos = new THREE.Vector3(1000, 0, 1000);
      
      expect(() => {
        collisionSystem.checkSweptCollision(startPos, endPos);
      }).not.toThrow();
    });
  });
});