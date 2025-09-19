/**
 * GameObject base class - Foundation for all game entities
 * Provides common functionality for position, rotation, scale, and mesh management
 */

import * as THREE from 'three';

export abstract class GameObject {
  public position: THREE.Vector3;
  public rotation: THREE.Vector3;
  public scale: THREE.Vector3;
  public mesh: THREE.Mesh | null = null;
  protected scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Vector3();
    this.scale = new THREE.Vector3(1, 1, 1);
  }

  /**
   * Abstract method for updating game object logic
   */
  abstract update(deltaTime: number): void;

  /**
   * Abstract method for rendering the game object
   */
  abstract render(): void;

  /**
   * Add the mesh to the scene
   */
  protected addToScene(): void {
    if (this.mesh && !this.scene.children.includes(this.mesh)) {
      this.scene.add(this.mesh);
    }
  }

  /**
   * Remove the mesh from the scene
   */
  protected removeFromScene(): void {
    if (this.mesh && this.scene.children.includes(this.mesh)) {
      this.scene.remove(this.mesh);
    }
  }

  /**
   * Update mesh transform based on position, rotation, and scale
   */
  protected updateTransform(): void {
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.setFromVector3(this.rotation);
      this.mesh.scale.copy(this.scale);
    }
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.removeFromScene();
    if (this.mesh) {
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(material => material.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
      this.mesh = null;
    }
  }
}