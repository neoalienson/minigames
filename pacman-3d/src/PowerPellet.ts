/**
 * PowerPellet class - Special power pellets that activate power mode
 * Creates larger pellets with glow effects that give Pacman temporary power
 */

import * as THREE from 'three';
import { GameObject } from './GameObject';

export class PowerPellet extends GameObject {
  private pelletGeometry!: THREE.SphereGeometry;
  private pelletMaterial!: THREE.MeshLambertMaterial;
  private glowGeometry!: THREE.SphereGeometry;
  private glowMaterial!: THREE.MeshBasicMaterial;
  private glowMesh!: THREE.Mesh;
  private gridPosition: THREE.Vector2;
  private isCollected: boolean = false;
  private pointValue: number = 50;
  
  // Animation properties
  private rotationSpeed: number = 1.5; // Slower rotation than regular pellets
  private bobSpeed: number = 2; // Slower bob than regular pellets
  private bobAmount: number = 0.15; // More pronounced bobbing
  private glowPulseSpeed: number = 4; // Glow pulsing speed
  private time: number = 0;
  private baseY: number = 0.5; // Base height above ground

  constructor(scene: THREE.Scene, gridX: number, gridZ: number) {
    super(scene);
    
    this.gridPosition = new THREE.Vector2();
    this.gridPosition.x = gridX;
    this.gridPosition.y = gridZ;
    
    // Create power pellet 3D model with glow effect
    this.createPowerPelletModel();
    
    console.log(`PowerPellet created at grid position (${gridX}, ${gridZ})`);
  }

  /**
   * Create PowerPellet 3D model with larger size and glow effect
   */
  private createPowerPelletModel(): void {
    // Create larger sphere geometry for power pellets
    this.pelletGeometry = new THREE.SphereGeometry(0.35, 12, 12);
    this.pelletMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffaa00, // Orange-yellow color
      emissive: 0x441100, // More pronounced glow
      transparent: false
    });
    
    this.mesh = new THREE.Mesh(this.pelletGeometry, this.pelletMaterial);
    
    // Create glow effect using a larger, transparent sphere
    this.glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    this.glowMesh = new THREE.Mesh(this.glowGeometry, this.glowMaterial);
    
    // Add glow mesh to main mesh
    this.mesh.add(this.glowMesh);
    
    // Enable shadows
    this.mesh.castShadow = false; // Power pellets don't cast shadows for performance
    this.mesh.receiveShadow = false;
    
    // Add to scene
    this.addToScene();
    
    console.log('PowerPellet 3D model created with larger size and glow effect');
  }

  /**
   * Update power pellet animation and glow effects
   */
  public update(deltaTime: number): void {
    if (this.isCollected) return;
    
    this.time += deltaTime;
    
    // Rotate the pellet continuously (slower than regular pellets)
    this.rotation.y += this.rotationSpeed * deltaTime;
    
    // Bob up and down more prominently
    const bobOffset = Math.sin(this.time * this.bobSpeed) * this.bobAmount;
    this.position.y = this.baseY + bobOffset;
    
    // Animate glow effect with pulsing
    if (this.glowMesh) {
      const glowPulse = (Math.sin(this.time * this.glowPulseSpeed) + 1) * 0.5; // 0 to 1
      const glowOpacity = 0.2 + glowPulse * 0.3; // 0.2 to 0.5
      const glowScale = 1 + glowPulse * 0.2; // 1 to 1.2
      
      this.glowMaterial.opacity = glowOpacity;
      this.glowMesh.scale.x = glowScale;
      this.glowMesh.scale.y = glowScale;
      this.glowMesh.scale.z = glowScale;
    }
    
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
   * Check if power pellet is collected
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
   * Collect the power pellet (remove from scene and mark as collected)
   */
  public collect(): void {
    if (this.isCollected) return;
    
    this.isCollected = true;
    this.removeFromScene();
    
    console.log(`PowerPellet collected at grid position (${this.gridPosition.x}, ${this.gridPosition.y}) for ${this.pointValue} points`);
  }

  /**
   * Check if this power pellet collides with a given position
   */
  public checkCollision(worldPosition: THREE.Vector3, radius: number = 0.8): boolean {
    if (this.isCollected) return false;
    
    const distance = Math.sqrt(
      Math.pow(this.position.x - worldPosition.x, 2) +
      Math.pow(this.position.y - worldPosition.y, 2) +
      Math.pow(this.position.z - worldPosition.z, 2)
    );
    return distance < (radius + 0.35); // PowerPellet radius is 0.35
  }

  /**
   * Dispose of power pellet resources
   */
  public dispose(): void {
    if (this.glowMesh) {
      this.glowMesh.geometry.dispose();
      if (this.glowMesh.material) {
        if (Array.isArray(this.glowMesh.material)) {
          this.glowMesh.material.forEach(material => material.dispose());
        } else {
          this.glowMesh.material.dispose();
        }
      }
    }
    
    super.dispose();
    console.log('PowerPellet disposed');
  }
}