/**
 * PelletManager class - Manages pellet placement and collection system
 * Handles pellet creation based on maze layout and collision detection with Pacman
 */

import * as THREE from 'three';
import { Maze } from './Maze';
import { Pellet } from './Pellet';
import { PowerPellet } from './PowerPellet';
import { Pacman } from './Pacman';

export interface PelletCollectionResult {
  collected: boolean;
  points: number;
  isPowerPellet: boolean;
}

export class PelletManager {
  private scene: THREE.Scene;
  private maze: Maze;
  private pellets: Pellet[] = [];
  private powerPellets: PowerPellet[] = [];
  private totalPellets: number = 0;
  private collectedPellets: number = 0;

  constructor(scene: THREE.Scene, maze: Maze) {
    this.scene = scene;
    this.maze = maze;
    
    // Create pellets based on maze layout
    this.createPelletsFromMaze();
    
    console.log(`PelletManager initialized with ${this.pellets.length} regular pellets and ${this.powerPellets.length} power pellets`);
  }

  /**
   * Implement pellet placement system based on maze layout data
   */
  private createPelletsFromMaze(): void {
    const mazeData = this.maze.getMazeData();
    
    // Clear existing pellets
    this.clearAllPellets();
    
    // Iterate through maze layout to place pellets
    for (let row = 0; row < mazeData.height; row++) {
      for (let col = 0; col < mazeData.width; col++) {
        const cellValue = mazeData.layout[row][col];
        
        // Create regular pellet (value 2)
        if (cellValue === 2) {
          this.createRegularPellet(col, row);
        }
        // Create power pellet (value 3)
        else if (cellValue === 3) {
          this.createPowerPellet(col, row);
        }
      }
    }
    
    this.totalPellets = this.pellets.length + this.powerPellets.length;
    this.collectedPellets = 0;
    
    console.log(`Created ${this.pellets.length} regular pellets and ${this.powerPellets.length} power pellets from maze layout`);
  }

  /**
   * Create a regular pellet at the specified grid position
   */
  private createRegularPellet(gridX: number, gridZ: number): void {
    const pellet = new Pellet(this.scene, gridX, gridZ);
    
    // Convert grid position to world position using maze
    const worldPos = this.maze.gridToWorld(gridX, gridZ);
    pellet.setWorldPosition(worldPos.x, worldPos.z);
    
    this.pellets.push(pellet);
  }

  /**
   * Create a power pellet at the specified grid position
   */
  private createPowerPellet(gridX: number, gridZ: number): void {
    const powerPellet = new PowerPellet(this.scene, gridX, gridZ);
    
    // Convert grid position to world position using maze
    const worldPos = this.maze.gridToWorld(gridX, gridZ);
    powerPellet.setWorldPosition(worldPos.x, worldPos.z);
    
    this.powerPellets.push(powerPellet);
  }

  /**
   * Update all pellets (animations, etc.)
   */
  public update(deltaTime: number): void {
    // Update regular pellets
    this.pellets.forEach(pellet => {
      if (!pellet.getIsCollected()) {
        pellet.update(deltaTime);
      }
    });
    
    // Update power pellets
    this.powerPellets.forEach(powerPellet => {
      if (!powerPellet.getIsCollected()) {
        powerPellet.update(deltaTime);
      }
    });
  }

  /**
   * Add collision detection between Pacman and pellets
   */
  public checkPelletCollisions(pacman: Pacman): PelletCollectionResult {
    const pacmanWorldPos = pacman.getWorldPosition();
    const result: PelletCollectionResult = {
      collected: false,
      points: 0,
      isPowerPellet: false
    };

    // Check regular pellets
    for (const pellet of this.pellets) {
      if (!pellet.getIsCollected() && pellet.checkCollision(pacmanWorldPos)) {
        pellet.collect();
        this.collectedPellets++;
        result.collected = true;
        result.points = pellet.getPointValue();
        result.isPowerPellet = false;
        
        console.log(`Regular pellet collected! Points: ${result.points}`);
        return result; // Return immediately after first collision
      }
    }

    // Check power pellets
    for (const powerPellet of this.powerPellets) {
      if (!powerPellet.getIsCollected() && powerPellet.checkCollision(pacmanWorldPos)) {
        powerPellet.collect();
        this.collectedPellets++;
        result.collected = true;
        result.points = powerPellet.getPointValue();
        result.isPowerPellet = true;
        
        console.log(`Power pellet collected! Points: ${result.points}`);
        return result; // Return immediately after first collision
      }
    }

    return result;
  }

  /**
   * Get total number of pellets in the maze
   */
  public getTotalPellets(): number {
    return this.totalPellets;
  }

  /**
   * Get number of collected pellets
   */
  public getCollectedPellets(): number {
    return this.collectedPellets;
  }

  /**
   * Get number of remaining pellets
   */
  public getRemainingPellets(): number {
    return this.totalPellets - this.collectedPellets;
  }

  /**
   * Check if all pellets have been collected
   */
  public areAllPelletsCollected(): boolean {
    return this.collectedPellets >= this.totalPellets;
  }

  /**
   * Get all regular pellets
   */
  public getPellets(): Pellet[] {
    return this.pellets;
  }

  /**
   * Get all power pellets
   */
  public getPowerPellets(): PowerPellet[] {
    return this.powerPellets;
  }

  /**
   * Reset all pellets (for game restart)
   */
  public resetPellets(): void {
    this.createPelletsFromMaze();
  }

  /**
   * Clear all pellets from scene and arrays
   */
  private clearAllPellets(): void {
    // Dispose and clear regular pellets
    this.pellets.forEach(pellet => pellet.dispose());
    this.pellets = [];
    
    // Dispose and clear power pellets
    this.powerPellets.forEach(powerPellet => powerPellet.dispose());
    this.powerPellets = [];
  }

  /**
   * Dispose of all pellet manager resources
   */
  public dispose(): void {
    this.clearAllPellets();
    console.log('PelletManager disposed');
  }
}