/**
 * Pacman class - Player character with movement and animation
 * Handles 3D model generation, grid-based movement, and mouth animation
 */

import * as THREE from 'three';
import { GameObject } from './GameObject';
import { Maze } from './Maze';
import { CollisionSystem } from './CollisionSystem';

export class Pacman extends GameObject {
  // Movement properties
  private gridPosition: THREE.Vector2;
  private targetGridPosition: THREE.Vector2;
  private currentDirection: THREE.Vector2;
  private nextDirection: THREE.Vector2;
  private isMoving: boolean = false;
  private moveSpeed: number = 4; // Grid units per second
  private interpolationProgress: number = 0;

  // Animation properties
  private mouthAngle: number = 0;
  private mouthSpeed: number = 8; // Radians per second
  private mouthMaxAngle: number = Math.PI * 0.6; // Maximum mouth opening

  // 3D model properties
  private pacmanGeometry!: THREE.SphereGeometry;
  private pacmanMaterial!: THREE.MeshLambertMaterial;
  private mouthGeometry!: THREE.ConeGeometry;
  private mouthMesh!: THREE.Mesh;

  // Maze reference for collision detection
  private maze: Maze;
  
  // Collision system for advanced collision detection
  private collisionSystem: CollisionSystem;

  constructor(scene: THREE.Scene, maze: Maze, startGridX: number = 5, startGridZ: number = 5) {
    super(scene);
    this.maze = maze;
    
    // Initialize collision system
    this.collisionSystem = new CollisionSystem(maze);
    
    // Initialize grid position
    this.gridPosition = new THREE.Vector2();
    this.gridPosition.x = startGridX;
    this.gridPosition.y = startGridZ;
    this.targetGridPosition = new THREE.Vector2();
    this.targetGridPosition.x = startGridX;
    this.targetGridPosition.y = startGridZ;
    this.currentDirection = new THREE.Vector2();
    this.currentDirection.x = 0;
    this.currentDirection.y = 0;
    this.nextDirection = new THREE.Vector2();
    this.nextDirection.x = 0;
    this.nextDirection.y = 0;

    // Generate 3D Pacman model
    this.createPacmanModel();
    
    // Set initial world position
    this.updateWorldPosition();
    
    console.log(`Pacman created at grid position (${startGridX}, ${startGridZ})`);
  }

  /**
   * Generate 3D Pacman model using SphereGeometry with mouth animation
   */
  private createPacmanModel(): void {
    // Create main Pacman body using SphereGeometry
    this.pacmanGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    this.pacmanMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffff00 // Classic Pacman yellow
    });
    
    this.mesh = new THREE.Mesh(this.pacmanGeometry, this.pacmanMaterial);
    
    // Enable shadows
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    
    // Create mouth geometry (cone for the mouth opening)
    this.mouthGeometry = new THREE.ConeGeometry(0.6, 1.2, 8);
    const mouthMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    
    this.mouthMesh = new THREE.Mesh(this.mouthGeometry, mouthMaterial);
    this.mouthMesh.rotation.z = Math.PI / 2; // Point the cone forward
    this.mouthMesh.position.set(0.4, 0, 0); // Position in front of Pacman
    
    // Add mouth to Pacman mesh
    this.mesh.add(this.mouthMesh);
    
    // Add to scene
    this.addToScene();
    
    console.log('Pacman 3D model created with SphereGeometry and mouth animation');
  }

  /**
   * Set movement direction (called by input system)
   */
  public setDirection(direction: THREE.Vector2): void {
    this.nextDirection.copy(direction);
  }

  /**
   * Update Pacman logic including movement and animation
   */
  public update(deltaTime: number): void {
    this.updateMovement(deltaTime);
    this.updateMouthAnimation(deltaTime);
    this.updateTransform();
  }

  /**
   * Implement basic position-based movement on maze grid with smooth interpolation
   */
  private updateMovement(deltaTime: number): void {
    // Check if we can change direction
    const directionsEqual = (this.nextDirection.x === this.currentDirection.x && this.nextDirection.y === this.currentDirection.y);
    if (!directionsEqual && this.canMoveInDirection(this.nextDirection)) {
      this.currentDirection.x = this.nextDirection.x;
      this.currentDirection.y = this.nextDirection.y;
      if (!this.isMoving) {
        this.startMovement();
      }
    }

    // If not moving and have a current direction, try to start moving
    const hasDirection = (this.currentDirection.x !== 0 || this.currentDirection.y !== 0);
    if (!this.isMoving && hasDirection) {
      if (this.canMoveInDirection(this.currentDirection)) {
        this.startMovement();
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
        
        // Try to continue moving in the same direction
        if (this.canMoveInDirection(this.currentDirection)) {
          this.startMovement();
        } else {
          // Stop moving if can't continue
          this.currentDirection.x = 0;
          this.currentDirection.y = 0;
        }
      }
      
      // Update world position with smooth interpolation
      this.updateWorldPosition();
    }

    // Update rotation to face movement direction
    this.updateRotation();
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
   * Check if Pacman can move in the specified direction using CollisionSystem
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
      currentGridPos = new THREE.Vector2();
      currentGridPos.x = this.gridPosition.x;
      currentGridPos.y = this.gridPosition.y;
    }
    
    // Convert grid position to world coordinates
    const worldPos = this.maze.gridToWorld(currentGridPos.x, currentGridPos.y);
    this.position.set(worldPos.x, 1, worldPos.z); // Y=1 to position above ground
  }

  /**
   * Update rotation to face movement direction
   */
  private updateRotation(): void {
    if (this.currentDirection.x !== 0 || this.currentDirection.y !== 0) {
      const angle = Math.atan2(this.currentDirection.y, this.currentDirection.x);
      this.rotation.y = -angle; // Negative because of coordinate system
    }
  }

  /**
   * Create simple movement animation with mouth opening/closing
   */
  private updateMouthAnimation(deltaTime: number): void {
    if (this.isMoving) {
      // Animate mouth opening and closing while moving
      this.mouthAngle += this.mouthSpeed * deltaTime;
      
      // Create oscillating mouth movement
      const mouthOpenAmount = (Math.sin(this.mouthAngle) + 1) * 0.5; // 0 to 1
      const currentMouthAngle = mouthOpenAmount * this.mouthMaxAngle;
      
      // Update mouth mesh rotation to simulate opening/closing
      if (this.mouthMesh) {
        this.mouthMesh.rotation.y = currentMouthAngle;
        this.mouthMesh.visible = mouthOpenAmount > 0.1; // Hide when nearly closed
      }
    } else {
      // Close mouth when not moving
      if (this.mouthMesh) {
        this.mouthMesh.rotation.y = 0;
        this.mouthMesh.visible = false;
      }
    }
  }

  /**
   * Render method (inherited from GameObject)
   */
  public render(): void {
    // Rendering is handled by Three.js automatically
    // This method can be used for custom rendering logic if needed
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
   * Check if Pacman is currently moving
   */
  public getIsMoving(): boolean {
    return this.isMoving;
  }

  /**
   * Get current movement direction
   */
  public getCurrentDirection(): THREE.Vector2 {
    return this.currentDirection.clone();
  }

  /**
   * Check for wall collision at current position
   */
  public checkWallCollision(): boolean {
    const collision = this.collisionSystem.checkEntityWallCollision(this);
    return collision.hasCollision;
  }

  /**
   * Get collision system for external access
   */
  public getCollisionSystem(): CollisionSystem {
    return this.collisionSystem;
  }

  /**
   * Reset Pacman to starting position
   */
  public reset(gridX: number = 5, gridZ: number = 5): void {
    this.gridPosition.x = gridX;
    this.gridPosition.y = gridZ;
    this.targetGridPosition.x = gridX;
    this.targetGridPosition.y = gridZ;
    this.currentDirection.x = 0;
    this.currentDirection.y = 0;
    this.nextDirection.x = 0;
    this.nextDirection.y = 0;
    this.isMoving = false;
    this.interpolationProgress = 0;
    this.mouthAngle = 0;
    
    this.updateWorldPosition();
    this.updateTransform();
    
    console.log(`Pacman reset to grid position (${gridX}, ${gridZ})`);
  }

  /**
   * Dispose of Pacman resources
   */
  public dispose(): void {
    if (this.mouthMesh) {
      this.mouthMesh.geometry.dispose();
      if (this.mouthMesh.material) {
        if (Array.isArray(this.mouthMesh.material)) {
          this.mouthMesh.material.forEach(material => material.dispose());
        } else {
          this.mouthMesh.material.dispose();
        }
      }
    }
    
    // Dispose collision system
    this.collisionSystem.dispose();
    
    super.dispose();
    console.log('Pacman disposed');
  }
}