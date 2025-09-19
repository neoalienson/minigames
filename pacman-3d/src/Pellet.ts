/**
 * Pellet class - Regular collectible pellets in the maze
 * Creates small spherical pellets that Pacman can collect for points
 */

import * as THREE from 'three';
import { GameObject } from './GameObject';

export class Pellet extends GameObject {
  private pelletGeometry!: THREE.SphereGeometry;
  private pelletMaterial!: THREE.MeshLambertMaterial;
  private gridPosition: THREE.Vector2;
  private isCollected: boolean = false;
  private pointValue: number = 10;
  
  // Animation properties
  private rotationSpeed: number = 2; // Radians per second
  private bobSpeed: number = 3; // Bob up and down speed
  private bobAmount: number = 0.1; // How much to bob up and down
  private time: number = 0;
  private baseY: number = 0.5; // Base height above ground

  constructor(scene: THREE.Scene, gridX: number, gridZ: number) {
    super(scene);
    
    this.gridPosition = new THREE.Vector2();
    this.gridPosition.x = gridX;
    this.gridPosition.y = gridZ;
    
    // Create pellet 3D model
    this.createPelletModel();
    
    console.log(`Pellet created at grid position (${gridX}, ${gridZ})`);
  }

  /**
   * Create Pellet 3D model using small SphereGeometry
   */
  private createPelletModel(): void {
    // Create small sphere geometry for regular pellets
    this.pelletGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    this.pelletMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffff88, // Light yellow color
      emissive: 0x222200, // Slight glow
      transparent: false
    });
    
    this.mesh = new THREE.Mesh(this.pelletGeometry, this.pelletMaterial);
    
    // Enable shadows
    this.mesh.castShadow = false; // Pellets don't cast shadows for performance
    this.mesh.receiveShadow = false;
    
    // Add to scene
    this.addToScene();
    
    console.log('Regular pellet 3D model created with small SphereGeometry');
  }

  /**
   * Update pellet animation and logic
   */
  public update(deltaTime: number): void {
    if (this.isCollected) return;
    
    this.time += deltaTime;
    
    // Rotate the pellet continuously
    this.rotation.y += this.rotationSpeed * deltaTime;
    
    // Bob up and down slightly
    const bobOffset = Math.sin(this.time * this.bobSpeed) * this.bobAmount;
    this.position.y = this.baseY + bobOffset;
    
    this.updateTransform();
  }

  /**
   * Render method (inherited from GameObject)
   */
  public render(): void {
    // Rendering is handled by Three.js automatically
  }

  /**
   * Set world position (called by PelletManager)
   */
  public setWorldPosition(worldX: number, worldZ: number): void {
    this.position.x = worldX;
    this.position.y = this.baseY;
    this.position.z = worldZ;
    this.updateTransform();
  }

  /**
   * Get grid position
   */
  public getGridPosition(): THREE.Vector2 {
    const result = new THREE.Vector2();
    result.x = this.gridPosition.x;
    result.y = this.gridPosition.y;
    return result;
  }

  /**
   * Get world position
   */
  public getWorldPosition(): THREE.Vector3 {
    const result = new THREE.Vector3();
    result.x = this.position.x;
    result.y = this.position.y;
    result.z = this.position.z;
    return result;
  }

  /**
   * Check if pellet is collected
   */
  public getIsCollected(): boolean {
    return this.isCollected;
  }

  /**
   * Get point value for scoring
   */
  public getPointValue(): number {
    return this.pointValue;
  }

  /**
   * Collect the pellet (remove from scene and mark as collected)
   */
  public collect(): void {
    if (this.isCollected) return;
    
    this.isCollected = true;
    this.removeFromScene();
    
    console.log(`Pellet collected at grid position (${this.gridPosition.x}, ${this.gridPosition.y}) for ${this.pointValue} points`);
  }

  /**
   * Check if this pellet collides with a given position
   */
  public checkCollision(worldPosition: THREE.Vector3, radius: number = 0.8): boolean {
    if (this.isCollected) return false;
    
    const distance = Math.sqrt(
      Math.pow(this.position.x - worldPosition.x, 2) +
      Math.pow(this.position.y - worldPosition.y, 2) +
      Math.pow(this.position.z - worldPosition.z, 2)
    );
    return distance < (radius + 0.15); // Pellet radius is 0.15
  }

  /**
   * Dispose of pellet resources
   */
  public dispose(): void {
    super.dispose();
    console.log('Pellet disposed');
  }
}