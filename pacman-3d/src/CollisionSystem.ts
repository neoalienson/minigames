/**
 * CollisionSystem class - Handles all collision detection and response
 * Provides grid-based and bounding box collision detection for game entities
 */

import * as THREE from 'three';
import { Maze } from './Maze';
import { GameObject } from './GameObject';

export interface CollisionResult {
  hasCollision: boolean;
  collisionPoint?: THREE.Vector3;
  collisionNormal?: THREE.Vector3;
  collisionType?: 'wall' | 'boundary' | 'entity';
}

export interface BoundingBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
  center: THREE.Vector3;
  size: THREE.Vector3;
}

export class CollisionSystem {
  private maze: Maze;

  constructor(maze: Maze) {
    this.maze = maze;
    
    console.log('CollisionSystem initialized with grid-based collision detection');
  }

  /**
   * Grid-based collision detection - Check if a grid position contains a wall
   */
  public checkGridCollision(gridX: number, gridZ: number): CollisionResult {
    const hasCollision = this.maze.isWall(gridX, gridZ);
    
    if (hasCollision) {
      // Calculate collision point at the center of the wall grid cell
      const worldPos = this.maze.gridToWorld(gridX, gridZ);
      const collisionPoint = new THREE.Vector3(worldPos.x, 1, worldPos.z);
      
      return {
        hasCollision: true,
        collisionPoint,
        collisionType: 'wall'
      };
    }

    return { hasCollision: false };
  }

  /**
   * Wall collision detection to prevent movement through walls
   */
  public checkWallCollision(currentGridPos: THREE.Vector2, direction: THREE.Vector2): CollisionResult {
    const nextGridX = currentGridPos.x + direction.x;
    const nextGridZ = currentGridPos.y + direction.y;
    
    return this.checkGridCollision(nextGridX, nextGridZ);
  }

  /**
   * Check collision with maze boundaries
   */
  public checkBoundaryCollision(gridX: number, gridZ: number): CollisionResult {
    const mazeData = this.maze.getMazeData();
    
    if (gridX < 0 || gridX >= mazeData.width || 
        gridZ < 0 || gridZ >= mazeData.height) {
      
      // Calculate collision point at boundary
      const clampedX = Math.max(0, Math.min(mazeData.width - 1, gridX));
      const clampedZ = Math.max(0, Math.min(mazeData.height - 1, gridZ));
      const worldPos = this.maze.gridToWorld(clampedX, clampedZ);
      
      return {
        hasCollision: true,
        collisionPoint: new THREE.Vector3(worldPos.x, 1, worldPos.z),
        collisionType: 'boundary'
      };
    }

    return { hasCollision: false };
  }

  /**
   * Bounding box collision detection for precise interactions
   */
  public checkBoundingBoxCollision(entityA: GameObject, entityB: GameObject): CollisionResult {
    const boxA = this.calculateBoundingBox(entityA);
    const boxB = this.calculateBoundingBox(entityB);
    
    // AABB (Axis-Aligned Bounding Box) collision detection
    const hasCollision = this.aabbIntersection(boxA, boxB);
    
    if (hasCollision) {
      // Calculate collision point as the center point between the two bounding boxes
      const collisionPoint = new THREE.Vector3().addVectors(boxA.center, boxB.center).multiplyScalar(0.5);
      
      // Calculate collision normal (direction from A to B)
      const collisionNormal = new THREE.Vector3().subVectors(boxB.center, boxA.center).normalize();
      
      return {
        hasCollision: true,
        collisionPoint,
        collisionNormal,
        collisionType: 'entity'
      };
    }

    return { hasCollision: false };
  }

  /**
   * Calculate bounding box for a game object
   */
  private calculateBoundingBox(entity: GameObject): BoundingBox {
    const position = entity.position;
    const scale = entity.scale;
    
    // Default size for entities (can be customized per entity type)
    const defaultSize = new THREE.Vector3(0.8, 0.8, 0.8);
    const size = new THREE.Vector3(
      defaultSize.x * scale.x,
      defaultSize.y * scale.y,
      defaultSize.z * scale.z
    );
    const halfSize = size.clone().multiplyScalar(0.5);
    
    const min = new THREE.Vector3(
      position.x - halfSize.x,
      position.y - halfSize.y,
      position.z - halfSize.z
    );
    const max = new THREE.Vector3(
      position.x + halfSize.x,
      position.y + halfSize.y,
      position.z + halfSize.z
    );
    
    return {
      min,
      max,
      center: position.clone(),
      size
    };
  }

  /**
   * AABB intersection test
   */
  private aabbIntersection(boxA: BoundingBox, boxB: BoundingBox): boolean {
    return (boxA.min.x <= boxB.max.x && boxA.max.x >= boxB.min.x) &&
           (boxA.min.y <= boxB.max.y && boxA.max.y >= boxB.min.y) &&
           (boxA.min.z <= boxB.max.z && boxA.max.z >= boxB.min.z);
  }

  /**
   * Check if movement in a direction would cause a collision
   */
  public canMoveInDirection(currentGridPos: THREE.Vector2, direction: THREE.Vector2): boolean {
    const collision = this.checkWallCollision(currentGridPos, direction);
    return !collision.hasCollision;
  }

  /**
   * Collision response that stops movement at walls
   */
  public resolveWallCollision(entity: GameObject, attemptedDirection: THREE.Vector2): THREE.Vector2 {
    // Convert entity world position to grid position
    const worldPos = entity.position;
    const gridPos = this.maze.worldToGrid(worldPos.x, worldPos.z);
    const currentGridPos = new THREE.Vector2(gridPos.x, gridPos.z);
    
    // Check if movement in attempted direction would cause collision
    if (!this.canMoveInDirection(currentGridPos, attemptedDirection)) {
      // Stop movement by returning zero direction
      return new THREE.Vector2(0, 0);
    }
    
    // Allow movement if no collision
    return attemptedDirection.clone();
  }

  /**
   * Check collision between entity and walls at world position
   */
  public checkEntityWallCollision(entity: GameObject): CollisionResult {
    const worldPos = entity.position;
    const gridPos = this.maze.worldToGrid(worldPos.x, worldPos.z);
    
    // Check boundary collision first
    const boundaryCollision = this.checkBoundaryCollision(gridPos.x, gridPos.z);
    if (boundaryCollision.hasCollision) {
      return boundaryCollision;
    }
    
    // Check wall collision
    return this.checkGridCollision(gridPos.x, gridPos.z);
  }

  /**
   * Get the closest valid grid position (used for collision response)
   */
  public getClosestValidPosition(gridX: number, gridZ: number): THREE.Vector2 {
    const mazeData = this.maze.getMazeData();
    
    // Clamp to maze boundaries
    const clampedX = Math.max(0, Math.min(mazeData.width - 1, gridX));
    const clampedZ = Math.max(0, Math.min(mazeData.height - 1, gridZ));
    
    // If the clamped position is a wall, find nearest empty space
    if (this.maze.isWall(clampedX, clampedZ)) {
      // Simple approach: check adjacent cells for empty space
      const directions = [
        { x: 0, y: 1 },   // up
        { x: 0, y: -1 },  // down
        { x: 1, y: 0 },   // right
        { x: -1, y: 0 }   // left
      ];
      
      for (const dir of directions) {
        const testX = clampedX + dir.x;
        const testZ = clampedZ + dir.y;
        
        if (testX >= 0 && testX < mazeData.width && 
            testZ >= 0 && testZ < mazeData.height && 
            !this.maze.isWall(testX, testZ)) {
          const result = new THREE.Vector2();
          result.x = testX;
          result.y = testZ;
          return result;
        }
      }
    }
    
    const result = new THREE.Vector2();
    result.x = clampedX;
    result.y = clampedZ;
    return result;
  }

  /**
   * Advanced collision detection with swept volume (for fast-moving objects)
   */
  public checkSweptCollision(startPos: THREE.Vector3, endPos: THREE.Vector3, _entityRadius: number = 0.4): CollisionResult {
    // Convert world positions to grid positions
    const startGrid = this.maze.worldToGrid(startPos.x, startPos.z);
    const endGrid = this.maze.worldToGrid(endPos.x, endPos.z);
    
    // Create Vector2 objects properly
    const startVec = new THREE.Vector2();
    startVec.x = startGrid.x;
    startVec.y = startGrid.z;
    
    const endVec = new THREE.Vector2();
    endVec.x = endGrid.x;
    endVec.y = endGrid.z;
    
    // Use Bresenham's line algorithm to check all grid cells along the path
    const gridCells = this.getGridCellsAlongLine(startVec, endVec);
    
    for (const cell of gridCells) {
      const collision = this.checkGridCollision(cell.x, cell.y);
      if (collision.hasCollision) {
        return collision;
      }
    }
    
    return { hasCollision: false };
  }

  /**
   * Get all grid cells along a line using Bresenham's algorithm
   */
  private getGridCellsAlongLine(start: THREE.Vector2, end: THREE.Vector2): THREE.Vector2[] {
    const cells: THREE.Vector2[] = [];
    
    let x0 = Math.floor(start.x);
    let y0 = Math.floor(start.y);
    const x1 = Math.floor(end.x);
    const y1 = Math.floor(end.y);
    
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
      const cell = new THREE.Vector2();
      cell.x = x0;
      cell.y = y0;
      cells.push(cell);
      
      if (x0 === x1 && y0 === y1) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
    
    return cells;
  }

  /**
   * Update collision system (called each frame if needed)
   */
  public update(_deltaTime: number): void {
    // This method can be used for dynamic collision updates
    // Currently not needed but available for future enhancements
  }

  /**
   * Get maze reference for external access
   */
  public getMaze(): Maze {
    return this.maze;
  }

  /**
   * Dispose of collision system resources
   */
  public dispose(): void {
    // Clean up any resources if needed
    console.log('CollisionSystem disposed');
  }
}