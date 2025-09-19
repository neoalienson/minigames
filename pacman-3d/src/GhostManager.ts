/**
 * GhostManager class - Manages multiple ghost instances and their AI behaviors
 * Handles ghost spawning, state management, and collision detection with Pacman
 */

import * as THREE from 'three';
import { Ghost, GhostState, GhostPersonality } from './Ghost';
import { Maze } from './Maze';
import { Pacman } from './Pacman';

export interface GhostCollisionResult {
  hasCollision: boolean;
  ghost: Ghost | null;
  isVulnerable: boolean;
}

export class GhostManager {
  private scene: THREE.Scene;
  private maze: Maze;
  private pacman: Pacman;
  private ghosts: Ghost[] = [];
  
  // Power mode management
  private powerModeActive: boolean = false;
  private powerModeTimer: number = 0;
  private readonly POWER_MODE_DURATION = 10; // 10 seconds

  constructor(scene: THREE.Scene, maze: Maze, pacman: Pacman) {
    this.scene = scene;
    this.maze = maze;
    this.pacman = pacman;
    
    this.createGhosts();
    
    console.log('GhostManager initialized with 4 ghost instances');
  }

  /**
   * Create four ghost instances with different colors and starting positions
   */
  private createGhosts(): void {
    const mazeData = this.maze.getMazeData();
    const ghostStarts = mazeData.ghostStarts;
    
    // Define ghost personalities in order
    const personalities = [
      GhostPersonality.AGGRESSIVE,  // Red ghost
      GhostPersonality.AMBUSH,      // Pink ghost  
      GhostPersonality.RANDOM,      // Orange ghost
      GhostPersonality.DEFENSIVE    // Blue ghost
    ];
    
    // Create ghosts at their starting positions
    for (let i = 0; i < Math.min(4, ghostStarts.length); i++) {
      const startPos = ghostStarts[i];
      const personality = personalities[i];
      
      const ghost = new Ghost(
        this.scene,
        this.maze,
        this.pacman,
        personality,
        startPos.x,
        startPos.z
      );
      
      this.ghosts.push(ghost);
      
      console.log(`Created ${personality} ghost at position (${startPos.x}, ${startPos.z})`);
    }
    
    // If we have fewer than 4 starting positions, create additional ghosts near existing ones
    while (this.ghosts.length < 4) {
      const personality = personalities[this.ghosts.length];
      
      // Create fallback positions if not enough starting positions
      let offsetX: number, offsetZ: number;
      
      if (ghostStarts.length > 0) {
        const baseIndex = this.ghosts.length % ghostStarts.length;
        const basePos = ghostStarts[baseIndex];
        
        // Offset position to avoid overlap
        offsetX = basePos.x + (this.ghosts.length % 2 === 0 ? 1 : -1);
        offsetZ = basePos.z + (this.ghosts.length >= 2 ? 1 : 0);
      } else {
        // Fallback positions if no ghost starts defined
        offsetX = 3 + this.ghosts.length;
        offsetZ = 3 + (this.ghosts.length % 2);
      }
      
      const ghost = new Ghost(
        this.scene,
        this.maze,
        this.pacman,
        personality,
        offsetX,
        offsetZ
      );
      
      this.ghosts.push(ghost);
      
      console.log(`Created additional ${personality} ghost at position (${offsetX}, ${offsetZ})`);
    }
  }

  /**
   * Update all ghosts
   */
  public update(deltaTime: number): void {
    // Update power mode timer
    this.updatePowerMode(deltaTime);
    
    // Update each ghost
    for (const ghost of this.ghosts) {
      ghost.update(deltaTime);
    }
  }

  /**
   * Update power mode timer and ghost states
   */
  private updatePowerMode(deltaTime: number): void {
    if (this.powerModeActive) {
      this.powerModeTimer -= deltaTime;
      
      if (this.powerModeTimer <= 0) {
        this.deactivatePowerMode();
      }
    }
  }

  /**
   * Activate power mode (when Pacman eats a power pellet)
   */
  public activatePowerMode(): void {
    this.powerModeActive = true;
    this.powerModeTimer = this.POWER_MODE_DURATION;
    
    // Set all living ghosts to frightened state
    for (const ghost of this.ghosts) {
      if (ghost.getState() !== GhostState.DEAD) {
        ghost.setFrightened();
      }
    }
    
    console.log('Power mode activated - ghosts are now vulnerable');
  }

  /**
   * Deactivate power mode
   */
  private deactivatePowerMode(): void {
    this.powerModeActive = false;
    this.powerModeTimer = 0;
    
    // Return all frightened ghosts to normal state
    for (const ghost of this.ghosts) {
      if (ghost.getState() === GhostState.FRIGHTENED) {
        ghost.setNormal();
      }
    }
    
    console.log('Power mode deactivated - ghosts return to normal behavior');
  }

  /**
   * Check collision between Pacman and all ghosts
   */
  public checkPacmanCollisions(): GhostCollisionResult {
    for (const ghost of this.ghosts) {
      if (ghost.checkPacmanCollision()) {
        return {
          hasCollision: true,
          ghost: ghost,
          isVulnerable: ghost.isVulnerable()
        };
      }
    }
    
    return {
      hasCollision: false,
      ghost: null,
      isVulnerable: false
    };
  }

  /**
   * Handle ghost being eaten by Pacman
   */
  public eatGhost(ghost: Ghost): number {
    if (ghost.isVulnerable()) {
      ghost.kill();
      console.log(`Ghost ${ghost.getPersonality()} eaten by Pacman`);
      
      // Return bonus points for eating ghost
      return 200;
    }
    
    return 0;
  }

  /**
   * Set all ghosts to scatter mode using advanced AI
   */
  public setScatterMode(): void {
    for (const ghost of this.ghosts) {
      ghost.forceScatterMode();
    }
    
    console.log('All ghosts set to scatter mode with advanced AI');
  }

  /**
   * Set all ghosts to chase mode using advanced AI
   */
  public setChaseMode(): void {
    for (const ghost of this.ghosts) {
      ghost.forceChaseMode();
    }
    
    console.log('All ghosts set to chase mode with advanced AI');
  }

  /**
   * Reset all ghosts to starting positions and states
   */
  public resetGhosts(): void {
    for (const ghost of this.ghosts) {
      ghost.reset();
    }
    
    this.deactivatePowerMode();
    
    console.log('All ghosts reset to starting positions');
  }

  /**
   * Get all ghost instances
   */
  public getGhosts(): Ghost[] {
    return [...this.ghosts]; // Return copy to prevent external modification
  }

  /**
   * Get ghost by personality type
   */
  public getGhostByPersonality(personality: GhostPersonality): Ghost | null {
    return this.ghosts.find(ghost => ghost.getPersonality() === personality) || null;
  }

  /**
   * Check if power mode is currently active
   */
  public isPowerModeActive(): boolean {
    return this.powerModeActive;
  }

  /**
   * Get remaining power mode time
   */
  public getPowerModeTimeRemaining(): number {
    return this.powerModeActive ? this.powerModeTimer : 0;
  }

  /**
   * Get number of living ghosts
   */
  public getLivingGhostCount(): number {
    return this.ghosts.filter(ghost => ghost.getState() !== GhostState.DEAD).length;
  }

  /**
   * Get number of vulnerable ghosts
   */
  public getVulnerableGhostCount(): number {
    return this.ghosts.filter(ghost => ghost.isVulnerable()).length;
  }

  /**
   * Dispose of all ghost resources
   */
  public dispose(): void {
    for (const ghost of this.ghosts) {
      ghost.dispose();
    }
    
    this.ghosts = [];
    
    console.log('GhostManager disposed');
  }
}