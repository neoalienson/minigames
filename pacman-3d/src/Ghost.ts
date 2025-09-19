/**
 * Ghost class - AI-controlled enemy with advanced state machine and pathfinding
 * Implements sophisticated chase behavior, different personalities, and collision detection
 */

import * as THREE from 'three';
import { GameObject } from './GameObject';
import { Maze } from './Maze';
import { CollisionSystem } from './CollisionSystem';
import { Pacman } from './Pacman';
import { PathfindingSystem } from './PathfindingSystem';
import { GhostAI, GhostAIState, GhostPersonality } from './GhostAI';

// Legacy ghost states for backward compatibility
export enum GhostState {
  CHASE = 'chase',
  SCATTER = 'scatter',
  FRIGHTENED = 'frightened',
  DEAD = 'dead'
}

// Re-export for backward compatibility
export { GhostPersonality } from './GhostAI';

// Ghost colors for different personalities
const GHOST_COLORS = {
  [GhostPersonality.AGGRESSIVE]: 0xff0000,  // Red
  [GhostPersonality.AMBUSH]: 0xff69b4,     // Pink
  [GhostPersonality.RANDOM]: 0xffa500,     // Orange
  [GhostPersonality.DEFENSIVE]: 0x00bfff   // Blue
};

export class Ghost extends GameObject {
  // Advanced AI system
  private ghostAI: GhostAI;
  private pathfindingSystem: PathfindingSystem;
  private state: GhostState = GhostState.CHASE;
  private personality: GhostPersonality;
  private pacmanTarget: Pacman;
  
  // Movement properties
  private gridPosition: THREE.Vector2;
  private targetGridPosition: THREE.Vector2;
  private currentDirection: THREE.Vector2;
  private isMoving: boolean = false;
  private moveSpeed: number = 3; // Grid units per second (slightly slower than Pacman)
  private interpolationProgress: number = 0;
  
  // AI behavior properties
  private aiDirection: THREE.Vector2 | null = null;
  private lastAIUpdate: number = 0;
  private aiUpdateInterval: number = 100; // Update AI every 100ms
  
  // 3D model properties
  private ghostGeometry!: THREE.BoxGeometry;
  private ghostMaterial!: THREE.MeshLambertMaterial;
  private eyeGeometry!: THREE.SphereGeometry;
  private leftEyeMesh!: THREE.Mesh;
  private rightEyeMesh!: THREE.Mesh;
  
  // Maze and collision system
  private maze: Maze;
  private collisionSystem: CollisionSystem;
  
  // Starting position for respawn
  private startGridPosition: THREE.Vector2;
  
  // State transition management
  private stateTransitionTimer: number = 0;
  private frightenedDuration: number = 10; // 10 seconds of frightened state

  constructor(
    scene: THREE.Scene, 
    maze: Maze, 
    pacman: Pacman,
    personality: GhostPersonality,
    startGridX: number, 
    startGridZ: number
  ) {
    super(scene);
    this.maze = maze;
    this.pacmanTarget = pacman;
    this.personality = personality;
    
    // Initialize collision system
    this.collisionSystem = new CollisionSystem(maze);
    
    // Initialize advanced AI systems
    this.pathfindingSystem = new PathfindingSystem(maze);
    this.ghostAI = new GhostAI(this.pathfindingSystem, maze, pacman, personality);
    
    // Initialize grid positions (using x and y for 2D grid, z becomes y)
    this.gridPosition = new THREE.Vector2(startGridX, startGridZ);
    this.targetGridPosition = new THREE.Vector2(startGridX, startGridZ);
    this.startGridPosition = new THREE.Vector2(startGridX, startGridZ);
    this.currentDirection = new THREE.Vector2(0, 0);
    
    // Create 3D ghost model
    this.createGhostModel();
    
    // Set initial world position
    this.updateWorldPosition();
    
    console.log(`Advanced Ghost created with ${personality} personality at grid position (${startGridX}, ${startGridZ})`);
  }

  /**
   * Create 3D ghost model using BoxGeometry with eyes
   */
  private createGhostModel(): void {
    // Create main ghost body using rounded BoxGeometry
    this.ghostGeometry = new THREE.BoxGeometry(1.4, 1.6, 1.4);
    this.ghostMaterial = new THREE.MeshLambertMaterial({ 
      color: GHOST_COLORS[this.personality]
    });
    
    this.mesh = new THREE.Mesh(this.ghostGeometry, this.ghostMaterial);
    
    // Enable shadows
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    
    // Create eyes
    this.createEyes();
    
    // Add to scene
    this.addToScene();
    
    console.log(`Ghost 3D model created with ${this.personality} personality`);
  }

  /**
   * Create eye meshes for the ghost
   */
  private createEyes(): void {
    this.eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    // Left eye
    this.leftEyeMesh = new THREE.Mesh(this.eyeGeometry, eyeMaterial);
    this.leftEyeMesh.position.set(-0.3, 0.3, 0.6);
    this.mesh!.add(this.leftEyeMesh);
    
    // Right eye
    this.rightEyeMesh = new THREE.Mesh(this.eyeGeometry, eyeMaterial);
    this.rightEyeMesh.position.set(0.3, 0.3, 0.6);
    this.mesh!.add(this.rightEyeMesh);
    
    // Create pupils
    const pupilGeometry = new THREE.SphereGeometry(0.08, 6, 6);
    const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0, 0, 0.05);
    this.leftEyeMesh.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0, 0, 0.05);
    this.rightEyeMesh.add(rightPupil);
  }

  /**
   * Update ghost AI and movement with advanced pathfinding
   */
  public update(deltaTime: number): void {
    this.updateAdvancedAI(deltaTime);
    this.updateMovement(deltaTime);
    this.updateTransform();
  }

  /**
   * Update advanced AI behavior using the new AI system
   */
  private updateAdvancedAI(deltaTime: number): void {
    this.lastAIUpdate += deltaTime * 1000;
    this.stateTransitionTimer += deltaTime;
    
    // Update AI system and get direction
    if (this.lastAIUpdate >= this.aiUpdateInterval) {
      this.aiDirection = this.ghostAI.update(deltaTime, this.gridPosition);
      this.lastAIUpdate = 0;
    }
    
    // Handle state transitions and timers
    this.handleStateTransitions(deltaTime);
    
    // Apply AI direction to movement
    if (this.aiDirection && !this.isMoving) {
      // Convert AI direction to discrete movement direction
      const discreteDirection = this.discretizeDirection(this.aiDirection);
      if (this.canMoveInDirection(discreteDirection)) {
        this.currentDirection = discreteDirection;
      }
    }
  }

  /**
   * Handle state transitions and timing
   */
  private handleStateTransitions(deltaTime: number): void {
    // Handle frightened state timer
    if (this.state === GhostState.FRIGHTENED) {
      this.stateTransitionTimer += deltaTime;
      if (this.stateTransitionTimer >= this.frightenedDuration) {
        this.setState(GhostState.CHASE);
        this.stateTransitionTimer = 0;
      }
    }
    
    // Sync AI state with ghost state
    this.syncAIState();
  }

  /**
   * Synchronize AI state with ghost state
   */
  private syncAIState(): void {
    const aiState = this.ghostAI.getState();
    
    // Convert AI state to legacy ghost state
    switch (aiState) {
      case GhostAIState.CHASE:
        if (this.state !== GhostState.CHASE && this.state !== GhostState.FRIGHTENED) {
          this.state = GhostState.CHASE;
        }
        break;
      case GhostAIState.SCATTER:
        if (this.state !== GhostState.SCATTER && this.state !== GhostState.FRIGHTENED) {
          this.state = GhostState.SCATTER;
        }
        break;
      case GhostAIState.FRIGHTENED:
        this.state = GhostState.FRIGHTENED;
        break;
      case GhostAIState.DEAD:
        this.state = GhostState.DEAD;
        break;
    }
  }

  /**
   * Convert continuous AI direction to discrete grid direction
   */
  private discretizeDirection(aiDirection: THREE.Vector2): THREE.Vector2 {
    const absX = Math.abs(aiDirection.x);
    const absY = Math.abs(aiDirection.y);
    
    if (absX > absY) {
      return new THREE.Vector2(aiDirection.x > 0 ? 1 : -1, 0);
    } else {
      return new THREE.Vector2(0, aiDirection.y > 0 ? 1 : -1);
    }
  }



  /**
   * Update movement with smooth interpolation
   */
  private updateMovement(deltaTime: number): void {
    // Start movement if we have a direction and aren't moving
    if (!this.isMoving && (this.currentDirection.x !== 0 || this.currentDirection.y !== 0)) {
      if (this.canMoveInDirection(this.currentDirection)) {
        this.startMovement();
      } else {
        // Clear direction if can't move
        this.currentDirection.set(0, 0);
      }
    }

    // Update movement interpolation
    if (this.isMoving) {
      this.interpolationProgress += this.moveSpeed * deltaTime;
      
      if (this.interpolationProgress >= 1.0) {
        // Movement complete
        this.gridPosition.copy(this.targetGridPosition);
        this.interpolationProgress = 0;
        this.isMoving = false;
      }
      
      // Update world position with smooth interpolation
      this.updateWorldPosition();
    }
  }

  /**
   * Start movement to the next grid position
   */
  private startMovement(): void {
    this.targetGridPosition.x = this.gridPosition.x + this.currentDirection.x;
    this.targetGridPosition.y = this.gridPosition.y + this.currentDirection.y;
    this.isMoving = true;
    this.interpolationProgress = 0;
  }

  /**
   * Check if ghost can move in the specified direction
   */
  private canMoveInDirection(direction: THREE.Vector2): boolean {
    return this.collisionSystem.canMoveInDirection(this.gridPosition, direction);
  }

  /**
   * Update world position with smooth interpolation between grid positions
   */
  private updateWorldPosition(): void {
    let currentGridPos: THREE.Vector2;
    
    if (this.isMoving) {
      // Interpolate between current and target grid positions
      currentGridPos = new THREE.Vector2();
      currentGridPos.x = this.gridPosition.x + (this.targetGridPosition.x - this.gridPosition.x) * this.interpolationProgress;
      currentGridPos.y = this.gridPosition.y + (this.targetGridPosition.y - this.gridPosition.y) * this.interpolationProgress;
    } else {
      currentGridPos = this.gridPosition.clone();
    }
    
    // Convert grid position to world coordinates
    const worldPos = this.maze.gridToWorld(currentGridPos.x, currentGridPos.y);
    this.position.set(worldPos.x, 1, worldPos.z); // Y=1 to position above ground
  }

  /**
   * Change ghost state and sync with AI system
   */
  public setState(newState: GhostState): void {
    if (this.state !== newState) {
      console.log(`Ghost ${this.personality} changing state from ${this.state} to ${newState}`);
      this.state = newState;
      this.stateTransitionTimer = 0;
      
      // Sync with AI system
      switch (newState) {
        case GhostState.CHASE:
          this.ghostAI.setState(GhostAIState.CHASE);
          this.moveSpeed = 3;
          break;
        case GhostState.SCATTER:
          this.ghostAI.setState(GhostAIState.SCATTER);
          this.moveSpeed = 3;
          break;
        case GhostState.FRIGHTENED:
          this.ghostAI.setState(GhostAIState.FRIGHTENED);
          this.moveSpeed = 2;
          break;
        case GhostState.DEAD:
          this.ghostAI.setState(GhostAIState.DEAD);
          this.moveSpeed = 5;
          break;
      }
      
      // Update visual appearance based on state
      this.updateAppearance();
    }
  }

  /**
   * Update ghost appearance based on current state
   */
  private updateAppearance(): void {
    if (!this.ghostMaterial || !this.ghostMaterial.color) return;
    
    switch (this.state) {
      case GhostState.CHASE:
      case GhostState.SCATTER:
        this.ghostMaterial.color.setHex(GHOST_COLORS[this.personality]);
        this.ghostMaterial.transparent = false;
        break;
        
      case GhostState.FRIGHTENED:
        this.ghostMaterial.color.setHex(0x0000ff); // Blue when frightened
        this.ghostMaterial.transparent = false;
        break;
        
      case GhostState.DEAD:
        this.ghostMaterial.color.setHex(0x666666); // Gray when dead
        this.ghostMaterial.transparent = true;
        this.ghostMaterial.opacity = 0.5;
        break;
    }
  }

  /**
   * Respawn ghost at starting position
   */
  private respawn(): void {
    this.gridPosition.copy(this.startGridPosition);
    this.targetGridPosition.copy(this.startGridPosition);
    this.currentDirection.set(0, 0);
    this.isMoving = false;
    this.interpolationProgress = 0;
    this.setState(GhostState.SCATTER); // Start in scatter mode after respawn
    this.updateWorldPosition();
    
    console.log(`Ghost ${this.personality} respawned at starting position`);
  }

  /**
   * Force scatter mode behavior
   */
  public forceScatterMode(): void {
    if (this.state !== GhostState.FRIGHTENED && this.state !== GhostState.DEAD) {
      this.setState(GhostState.SCATTER);
      this.ghostAI.forceScatterMode();
    }
  }

  /**
   * Force chase mode behavior
   */
  public forceChaseMode(): void {
    if (this.state !== GhostState.FRIGHTENED && this.state !== GhostState.DEAD) {
      this.setState(GhostState.CHASE);
      this.ghostAI.forceChaseMode();
    }
  }

  /**
   * Check collision with Pacman
   */
  public checkPacmanCollision(): boolean {
    return this.collisionSystem.checkBoundingBoxCollision(this, this.pacmanTarget).hasCollision;
  }

  /**
   * Render method (inherited from GameObject)
   */
  public render(): void {
    // Rendering is handled by Three.js automatically
  }

  /**
   * Get current grid position
   */
  public getGridPosition(): THREE.Vector2 {
    return this.gridPosition.clone();
  }

  /**
   * Get current world position
   */
  public getWorldPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get current state
   */
  public getState(): GhostState {
    return this.state;
  }

  /**
   * Get personality type
   */
  public getPersonality(): GhostPersonality {
    return this.personality;
  }

  /**
   * Check if ghost is vulnerable (frightened state)
   */
  public isVulnerable(): boolean {
    return this.state === GhostState.FRIGHTENED;
  }

  /**
   * Kill the ghost (set to dead state)
   */
  public kill(): void {
    this.setState(GhostState.DEAD);
  }

  /**
   * Set frightened state (power mode activated)
   */
  public setFrightened(): void {
    if (this.state !== GhostState.DEAD) {
      this.setState(GhostState.FRIGHTENED);
    }
  }

  /**
   * Reset to normal chase state
   */
  public setNormal(): void {
    if (this.state === GhostState.FRIGHTENED) {
      this.setState(GhostState.CHASE);
    }
  }

  /**
   * Reset ghost to starting position and state
   */
  public reset(): void {
    this.ghostAI.reset();
    this.stateTransitionTimer = 0;
    this.lastAIUpdate = 0;
    this.aiDirection = null;
    this.respawn();
  }

  /**
   * Dispose of ghost resources
   */
  public dispose(): void {
    // Dispose AI systems
    this.ghostAI.dispose();
    this.pathfindingSystem.dispose();
    
    // Dispose collision system
    this.collisionSystem.dispose();
    
    super.dispose();
    console.log(`Ghost ${this.personality} disposed`);
  }
}