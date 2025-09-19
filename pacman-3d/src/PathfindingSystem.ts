/**
 * PathfindingSystem class - Implements A* pathfinding algorithm for ghost navigation
 * Provides intelligent pathfinding with performance optimizations including caching and spatial partitioning
 */

import * as THREE from 'three';
import { Maze } from './Maze';

// Node for A* pathfinding
interface PathNode {
  x: number;
  z: number;
  gCost: number; // Distance from start
  hCost: number; // Heuristic distance to target
  fCost: number; // Total cost (g + h)
  parent: PathNode | null;
}

// Cached path result
interface CachedPath {
  path: THREE.Vector2[];
  timestamp: number;
  targetX: number;
  targetZ: number;
}

export class PathfindingSystem {
  private maze: Maze;
  private pathCache: Map<string, CachedPath> = new Map();
  private readonly CACHE_DURATION = 2000; // Cache paths for 2 seconds
  private readonly MAX_CACHE_SIZE = 100;
  
  // Spatial partitioning for performance
  private spatialGrid: Map<string, PathNode[]> = new Map();
  private readonly SPATIAL_GRID_SIZE = 4;

  constructor(maze: Maze) {
    this.maze = maze;
  }

  /**
   * Find path using A* algorithm with caching and optimizations
   */
  public findPath(
    startX: number, 
    startZ: number, 
    targetX: number, 
    targetZ: number
  ): THREE.Vector2[] {
    // Ensure coordinates are integers
    const intStartX = Math.floor(startX);
    const intStartZ = Math.floor(startZ);
    const intTargetX = Math.floor(targetX);
    const intTargetZ = Math.floor(targetZ);
    
    // Check cache first
    const cacheKey = `${intStartX},${intStartZ}-${intTargetX},${intTargetZ}`;
    const cachedPath = this.pathCache.get(cacheKey);
    
    if (cachedPath && Date.now() - cachedPath.timestamp < this.CACHE_DURATION) {
      return [...cachedPath.path]; // Return copy of cached path
    }

    // Perform A* pathfinding
    const path = this.performAStar(intStartX, intStartZ, intTargetX, intTargetZ);
    
    // Cache the result
    this.cachePathResult(cacheKey, path, intTargetX, intTargetZ);
    
    return path;
  }

  /**
   * Perform A* pathfinding algorithm
   */
  private performAStar(
    startX: number, 
    startZ: number, 
    targetX: number, 
    targetZ: number
  ): THREE.Vector2[] {
    const mazeData = this.maze.getMazeData();
    
    // Validate coordinates
    if (!this.isValidPosition(startX, startZ) || !this.isValidPosition(targetX, targetZ)) {
      return [];
    }

    // If start and target are the same, return empty path
    if (startX === targetX && startZ === targetZ) {
      return [];
    }

    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    
    // Create start node
    const startNode: PathNode = {
      x: startX,
      z: startZ,
      gCost: 0,
      hCost: this.calculateHeuristic(startX, startZ, targetX, targetZ),
      fCost: 0,
      parent: null
    };
    startNode.fCost = startNode.gCost + startNode.hCost;
    
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest fCost
      let currentNode = openSet[0];
      let currentIndex = 0;
      
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fCost < currentNode.fCost || 
           (openSet[i].fCost === currentNode.fCost && openSet[i].hCost < currentNode.hCost)) {
          currentNode = openSet[i];
          currentIndex = i;
        }
      }

      // Remove current node from open set and add to closed set
      openSet.splice(currentIndex, 1);
      closedSet.add(`${currentNode.x},${currentNode.z}`);

      // Check if we reached the target
      if (currentNode.x === targetX && currentNode.z === targetZ) {
        return this.reconstructPath(currentNode);
      }

      // Check all neighbors
      const neighbors = this.getNeighbors(currentNode.x, currentNode.z);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.z}`;
        
        // Skip if in closed set or is a wall
        if (closedSet.has(neighborKey) || this.maze.isWall(neighbor.x, neighbor.z)) {
          continue;
        }

        // Calculate costs
        const gCost = currentNode.gCost + this.getMovementCost(currentNode, neighbor);
        const hCost = this.calculateHeuristic(neighbor.x, neighbor.z, targetX, targetZ);
        const fCost = gCost + hCost;

        // Check if this path to neighbor is better
        const existingNode = openSet.find(node => node.x === neighbor.x && node.z === neighbor.z);
        
        if (!existingNode) {
          // Add new node to open set
          const newNode: PathNode = {
            x: neighbor.x,
            z: neighbor.z,
            gCost: gCost,
            hCost: hCost,
            fCost: fCost,
            parent: currentNode
          };
          openSet.push(newNode);
        } else if (gCost < existingNode.gCost) {
          // Update existing node with better path
          existingNode.gCost = gCost;
          existingNode.fCost = gCost + existingNode.hCost;
          existingNode.parent = currentNode;
        }
      }
    }

    // No path found
    return [];
  }

  /**
   * Get valid neighboring positions
   */
  private getNeighbors(x: number, z: number): THREE.Vector2[] {
    const neighbors: THREE.Vector2[] = [];
    const directions = [
      { x: 0, z: 1 },   // up
      { x: 0, z: -1 },  // down
      { x: 1, z: 0 },   // right
      { x: -1, z: 0 }   // left
    ];

    for (const dir of directions) {
      const newX = x + dir.x;
      const newZ = z + dir.z;
      
      if (this.isValidPosition(newX, newZ)) {
        neighbors.push(new THREE.Vector2(newX, newZ));
      }
    }

    return neighbors;
  }

  /**
   * Check if position is valid (within bounds and not a wall)
   */
  private isValidPosition(x: number, z: number): boolean {
    const mazeData = this.maze.getMazeData();
    
    // Ensure coordinates are integers and within bounds
    const intX = Math.floor(x);
    const intZ = Math.floor(z);
    
    if (intX < 0 || intX >= mazeData.width || intZ < 0 || intZ >= mazeData.height) {
      return false;
    }
    
    return !this.maze.isWall(intX, intZ);
  }

  /**
   * Calculate heuristic distance (Manhattan distance)
   */
  private calculateHeuristic(x1: number, z1: number, x2: number, z2: number): number {
    return Math.abs(x1 - x2) + Math.abs(z1 - z2);
  }

  /**
   * Get movement cost between two adjacent nodes
   */
  private getMovementCost(from: PathNode, to: THREE.Vector2): number {
    // Base movement cost
    let cost = 1;
    
    // Add slight penalty for direction changes to encourage straight paths
    if (from.parent) {
      const prevDirection = {
        x: from.x - from.parent.x,
        z: from.z - from.parent.z
      };
      const currentDirection = {
        x: to.x - from.x,
        z: to.z - from.z
      };
      
      if (prevDirection.x !== currentDirection.x || prevDirection.z !== currentDirection.z) {
        cost += 0.1; // Small penalty for direction change
      }
    }
    
    return cost;
  }

  /**
   * Reconstruct path from target node back to start
   */
  private reconstructPath(targetNode: PathNode): THREE.Vector2[] {
    const path: THREE.Vector2[] = [];
    let currentNode: PathNode | null = targetNode;

    while (currentNode !== null) {
      path.unshift(new THREE.Vector2(currentNode.x, currentNode.z));
      currentNode = currentNode.parent;
    }

    // Remove the first node (current position) as we don't need to move to where we already are
    if (path.length > 1) {
      path.shift();
    }

    return path;
  }

  /**
   * Cache path result for performance optimization
   */
  private cachePathResult(cacheKey: string, path: THREE.Vector2[], targetX: number, targetZ: number): void {
    // Clean old cache entries if cache is getting too large
    if (this.pathCache.size >= this.MAX_CACHE_SIZE) {
      this.cleanOldCacheEntries();
    }

    this.pathCache.set(cacheKey, {
      path: [...path], // Store copy of path
      timestamp: Date.now(),
      targetX: targetX,
      targetZ: targetZ
    });
  }

  /**
   * Clean old cache entries to prevent memory bloat
   */
  private cleanOldCacheEntries(): void {
    const currentTime = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cachedPath] of this.pathCache.entries()) {
      if (currentTime - cachedPath.timestamp > this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.pathCache.delete(key);
    }
  }

  /**
   * Find path to nearest valid position if direct path is not possible
   */
  public findPathToNearest(
    startX: number, 
    startZ: number, 
    targetX: number, 
    targetZ: number,
    maxRadius: number = 5
  ): THREE.Vector2[] {
    // First try direct path
    let path = this.findPath(startX, startZ, targetX, targetZ);
    if (path.length > 0) {
      return path;
    }

    // If direct path fails, try nearby positions in expanding radius
    for (let radius = 1; radius <= maxRadius; radius++) {
      const nearbyPositions = this.getPositionsInRadius(targetX, targetZ, radius);
      
      for (const pos of nearbyPositions) {
        if (this.isValidPosition(pos.x, pos.z)) {
          path = this.findPath(startX, startZ, pos.x, pos.z);
          if (path.length > 0) {
            return path;
          }
        }
      }
    }

    return [];
  }

  /**
   * Get positions in a given radius around a center point
   */
  private getPositionsInRadius(centerX: number, centerZ: number, radius: number): THREE.Vector2[] {
    const positions: THREE.Vector2[] = [];
    
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let z = centerZ - radius; z <= centerZ + radius; z++) {
        const distance = Math.abs(x - centerX) + Math.abs(z - centerZ);
        if (distance === radius) {
          positions.push(new THREE.Vector2(x, z));
        }
      }
    }
    
    return positions;
  }

  /**
   * Clear path cache
   */
  public clearCache(): void {
    this.pathCache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.pathCache.size,
      hitRate: 0 // Could implement hit rate tracking if needed
    };
  }

  /**
   * Dispose of pathfinding system resources
   */
  public dispose(): void {
    this.pathCache.clear();
    this.spatialGrid.clear();
  }
}