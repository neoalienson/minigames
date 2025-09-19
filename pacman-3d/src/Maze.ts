/**
 * Maze class - Handles 2D maze layout and generates 3D wall geometry
 * Converts 2D array data into 3D maze structures with proper materials
 */

import * as THREE from 'three';

// 2D maze layout data structure using number arrays
export interface MazeData {
  width: number;
  height: number;
  layout: number[][]; // 0: empty, 1: wall, 2: pellet, 3: power pellet
  pacmanStart: { x: number; z: number };
  ghostStarts: { x: number; z: number }[];
}

export class Maze {
  private scene: THREE.Scene;
  private mazeData: MazeData;
  private wallMeshes: THREE.Mesh[] = [];
  private wallMaterial!: THREE.Material;
  private wallGeometry!: THREE.BoxGeometry;
  
  // Maze configuration
  private readonly WALL_SIZE = 2; // Size of each wall block
  private readonly WALL_HEIGHT = 1; // Height of walls (lowered for better visibility)

  constructor(scene: THREE.Scene, mazeData: MazeData) {
    this.scene = scene;
    this.mazeData = mazeData;
    
    // Create modular wall pieces using BoxGeometry with proper materials
    this.createWallGeometry();
    this.createWallMaterial();
    
    // Generate 3D maze from 2D data
    this.generateMaze();
  }

  /**
   * Create modular wall pieces using BoxGeometry
   */
  private createWallGeometry(): void {
    this.wallGeometry = new THREE.BoxGeometry(
      this.WALL_SIZE, 
      this.WALL_HEIGHT, 
      this.WALL_SIZE
    );
    
    console.log('Wall geometry created with BoxGeometry');
  }

  /**
   * Add basic textures and materials for maze walls
   */
  private createWallMaterial(): void {
    // Create a basic material with a blue color for now
    // In a real implementation, you might load textures here
    this.wallMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x0066cc,
      transparent: false
    });
    
    console.log('Wall material created');
  }

  /**
   * Generate 3D wall geometry from 2D maze data
   */
  private generateMaze(): void {
    // Clear existing wall meshes
    this.clearWalls();
    
    // Iterate through the 2D maze layout
    for (let row = 0; row < this.mazeData.height; row++) {
      for (let col = 0; col < this.mazeData.width; col++) {
        const cellValue = this.mazeData.layout[row][col];
        
        // If cell is a wall (value 1), create a 3D wall block
        if (cellValue === 1) {
          this.createWallBlock(col, row);
        }
      }
    }
    
    console.log(`Generated ${this.wallMeshes.length} wall blocks from 2D maze data`);
  }

  /**
   * Create a single wall block at the specified grid position
   */
  private createWallBlock(gridX: number, gridZ: number): void {
    // Create wall mesh using the shared geometry and material
    const wallMesh = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
    
    // Position the wall in 3D space
    // Convert grid coordinates to world coordinates
    const worldX = (gridX - this.mazeData.width / 2) * this.WALL_SIZE;
    const worldZ = (gridZ - this.mazeData.height / 2) * this.WALL_SIZE;
    const worldY = this.WALL_HEIGHT / 2; // Position wall so bottom is at y=0
    
    wallMesh.position.set(worldX, worldY, worldZ);
    
    // Enable shadows
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    
    // Add to scene and track in array
    this.scene.add(wallMesh);
    this.wallMeshes.push(wallMesh);
  }

  /**
   * Clear all existing wall meshes from the scene
   */
  private clearWalls(): void {
    this.wallMeshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.wallMeshes = [];
  }

  /**
   * Get the maze data
   */
  public getMazeData(): MazeData {
    return this.mazeData;
  }

  /**
   * Update the maze with new data
   */
  public updateMaze(newMazeData: MazeData): void {
    this.mazeData = newMazeData;
    this.generateMaze();
  }

  /**
   * Convert world coordinates to grid coordinates
   */
  public worldToGrid(worldX: number, worldZ: number): { x: number; z: number } {
    const gridX = Math.round(worldX / this.WALL_SIZE + this.mazeData.width / 2);
    const gridZ = Math.round(worldZ / this.WALL_SIZE + this.mazeData.height / 2);
    return { x: gridX, z: gridZ };
  }

  /**
   * Convert grid coordinates to world coordinates
   */
  public gridToWorld(gridX: number, gridZ: number): { x: number; z: number } {
    const worldX = (gridX - this.mazeData.width / 2) * this.WALL_SIZE;
    const worldZ = (gridZ - this.mazeData.height / 2) * this.WALL_SIZE;
    return { x: worldX, z: worldZ };
  }

  /**
   * Check if a grid position contains a wall
   */
  public isWall(gridX: number, gridZ: number): boolean {
    // Ensure coordinates are integers
    const intX = Math.floor(gridX);
    const intZ = Math.floor(gridZ);
    
    if (intX < 0 || intX >= this.mazeData.width || 
        intZ < 0 || intZ >= this.mazeData.height) {
      return true; // Treat out-of-bounds as walls
    }
    
    // Additional safety check for layout array
    if (!this.mazeData.layout[intZ] || this.mazeData.layout[intZ][intX] === undefined) {
      return true; // Treat invalid positions as walls
    }
    
    return this.mazeData.layout[intZ][intX] === 1;
  }

  /**
   * Get wall size for collision detection
   */
  public getWallSize(): number {
    return this.WALL_SIZE;
  }

  /**
   * Dispose of maze resources
   */
  public dispose(): void {
    this.clearWalls();
    this.wallGeometry.dispose();
    this.wallMaterial.dispose();
    console.log('Maze resources disposed');
  }
}

// Simple test maze data for verification with pellets
export const TEST_MAZE_DATA: MazeData = {
  width: 11,
  height: 11,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 3, 2, 2, 2, 1, 2, 2, 2, 3, 1],
    [1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1],
    [1, 2, 2, 2, 2, 0, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1],
    [1, 3, 2, 2, 2, 1, 2, 2, 2, 3, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  pacmanStart: { x: 5, z: 5 },
  ghostStarts: [
    { x: 3, z: 3 },
    { x: 7, z: 3 },
    { x: 3, z: 7 },
    { x: 7, z: 7 }
  ]
};