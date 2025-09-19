/**
 * GameEngine class - Core 3D rendering foundation
 * Manages the main game loop, Three.js scene, camera, and lighting
 */

import * as THREE from 'three';
import { Maze, TEST_MAZE_DATA } from './Maze';
import { Pacman } from './Pacman';
import { InputManager } from './InputManager';
import { CollisionSystem } from './CollisionSystem';
import { PelletManager } from './PelletManager';
import { GameState } from './GameState';
import { GhostManager } from './GhostManager';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private lastTime: number = 0;


  
  // Maze system
  private maze: Maze | null = null;
  
  // Pacman character
  private pacman: Pacman | null = null;
  
  // Pellet system
  private pelletManager: PelletManager | null = null;
  
  // Ghost system
  private ghostManager: GhostManager | null = null;
  
  // Input system
  private inputManager: InputManager;
  
  // Game state management
  private gameState: GameState;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    
    // Initialize input manager
    this.inputManager = new InputManager();
    
    // Initialize game state
    this.gameState = new GameState();
    
    this.initialize();
  }

  /**
   * Initialize the 3D rendering system
   */
  private initialize(): void {
    // Set up renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 1);

    // Set up isometric camera positioning at (20, 20, 20)
    this.setupCamera();

    // Implement basic lighting system
    this.setupLighting();

    // Create and render test maze to verify 3D maze generation
    this.createTestMaze();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    console.log('GameEngine initialized successfully');
  }

  /**
   * Set up isometric camera positioning at (20, 20, 20) with proper target
   */
  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      45, // FOV
      window.innerWidth / window.innerHeight, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );

    // Position camera at (20, 20, 20) for isometric view
    this.camera.position.set(20, 20, 20);
    
    // Target the center of the scene (maze center)
    this.camera.lookAt(0, 0, 0);
    
    console.log('Isometric camera positioned at (20, 20, 20)');
  }

  /**
   * Implement basic lighting system with ambient and directional lights
   */
  private setupLighting(): void {
    // Ambient light for soft fill lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    this.scene.add(directionalLight);

    console.log('Lighting system initialized (ambient + directional)');
  }



  /**
   * Create and render a simple test maze to verify 3D maze generation
   */
  private createTestMaze(): void {
    // Add a ground plane for better visualization
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Create maze instance with test data
    this.maze = new Maze(this.scene, TEST_MAZE_DATA);
    
    // Create pellet system
    this.createPelletSystem();
    
    // Create Pacman character at starting position
    this.createPacman();
    
    // Create ghost system after Pacman is created
    this.createGhostSystem();
    
    // Set up input callbacks after Pacman is created
    this.setupInputCallbacks();
    
    // Set up game state callbacks
    this.setupGameStateCallbacks();
    
    console.log('Test maze created and rendered with ground plane');
  }

  /**
   * Create pellet system for collectibles
   */
  private createPelletSystem(): void {
    if (!this.maze) {
      console.error('Cannot create pellet system: maze not initialized');
      return;
    }

    this.pelletManager = new PelletManager(this.scene, this.maze);
    console.log('Pellet system created and initialized');
  }

  /**
   * Create Pacman character at the starting position
   */
  private createPacman(): void {
    if (!this.maze) {
      console.error('Cannot create Pacman: maze not initialized');
      return;
    }

    const mazeData = this.maze.getMazeData();
    this.pacman = new Pacman(
      this.scene, 
      this.maze, 
      mazeData.pacmanStart.x, 
      mazeData.pacmanStart.z
    );
    
    console.log('Pacman character created and added to scene');
  }

  /**
   * Create ghost system with AI behaviors
   */
  private createGhostSystem(): void {
    if (!this.maze || !this.pacman) {
      console.error('Cannot create ghost system: maze or Pacman not initialized');
      return;
    }

    this.ghostManager = new GhostManager(this.scene, this.maze, this.pacman);
    console.log('Ghost system created with AI behaviors');
  }

  /**
   * Set up input callbacks to integrate InputManager with Pacman movement
   */
  private setupInputCallbacks(): void {
    // Set up movement callback for Pacman control
    this.inputManager.setMovementCallback((direction: THREE.Vector2) => {
      if (this.pacman) {
        this.pacman.setDirection(direction);
      }
    });

    // Set up action callback for game controls
    this.inputManager.setActionCallback((action: string) => {
      switch (action) {
        case 'pause':
          if (this.isRunning) {
            this.pause();
          } else {
            this.resume();
          }
          break;
        case 'restart':
          this.restartGame();
          break;
        case 'mute':
          // TODO: Implement audio muting when audio system is added
          console.log('Mute functionality - to be implemented with audio system');
          break;
      }
    });

    console.log('Input callbacks set up for Pacman movement and game controls');
  }

  /**
   * Set up game state callbacks for level completion and game over
   */
  private setupGameStateCallbacks(): void {
    // Level completion callback
    this.gameState.setOnLevelCompleteCallback(() => {
      console.log('Level completed! Advancing to next level...');
      // TODO: Add level transition effects
      this.gameState.nextLevel();
      this.restartLevel();
    });

    // Game over callback
    this.gameState.setOnGameOverCallback(() => {
      console.log('Game Over!');
      this.pause();
      // TODO: Show game over screen
    });

    // Power mode callback
    this.gameState.setOnPowerModeChangeCallback((active: boolean) => {
      console.log(`Power mode ${active ? 'activated' : 'deactivated'}`);
      // Notify ghosts about power mode change
      if (this.ghostManager) {
        if (active) {
          this.ghostManager.activatePowerMode();
        }
      }
    });

    console.log('Game state callbacks configured');
  }

  /**
   * Restart the current level (for level progression)
   */
  private restartLevel(): void {
    if (this.pacman && this.maze) {
      const mazeData = this.maze.getMazeData();
      this.pacman.reset(mazeData.pacmanStart.x, mazeData.pacmanStart.z);
      
      // Reset pellets
      if (this.pelletManager) {
        this.pelletManager.resetPellets();
      }
      
      // Reset ghosts
      if (this.ghostManager) {
        this.ghostManager.resetGhosts();
      }
      
      console.log('Level restarted');
    }
  }

  /**
   * Restart the game to initial state
   */
  private restartGame(): void {
    // Reset game state
    this.gameState.reset();
    
    if (this.pacman && this.maze) {
      const mazeData = this.maze.getMazeData();
      this.pacman.reset(mazeData.pacmanStart.x, mazeData.pacmanStart.z);
      
      // Reset pellets
      if (this.pelletManager) {
        this.pelletManager.resetPellets();
      }
      
      // Reset ghosts
      if (this.ghostManager) {
        this.ghostManager.resetGhosts();
      }
      
      console.log('Game restarted');
    }
  }

  /**
   * Start the main game loop using requestAnimationFrame
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
    
    console.log('Game loop started');
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    console.log('Game loop stopped');
  }

  /**
   * Pause the game loop
   */
  public pause(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.gameState.setGameStatus('paused');
    console.log('Game loop paused');
  }

  /**
   * Resume the game loop
   */
  public resume(): void {
    if (!this.isRunning) {
      this.gameState.setGameStatus('playing');
      this.start();
    }
  }

  /**
   * Main game loop using requestAnimationFrame
   */
  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update game logic
    this.update(deltaTime);

    // Render the scene
    this.render();

    // Schedule next frame
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    // Only update if game is playing
    if (this.gameState.getGameStatus() !== 'playing') {
      return;
    }

    // Update game state (power mode timer)
    this.gameState.updatePowerMode(deltaTime);

    // Update Pacman
    if (this.pacman) {
      this.pacman.update(deltaTime);
    }

    // Update ghost system
    if (this.ghostManager) {
      this.ghostManager.update(deltaTime);
      
      // Check for ghost collisions with Pacman
      if (this.pacman) {
        const ghostCollision = this.ghostManager.checkPacmanCollisions();
        if (ghostCollision.hasCollision && ghostCollision.ghost) {
          if (ghostCollision.isVulnerable) {
            // Pacman eats vulnerable ghost
            const bonusPoints = this.ghostManager.eatGhost(ghostCollision.ghost);
            this.gameState.addScore(bonusPoints);
            console.log(`Ghost eaten! Bonus points: ${bonusPoints}`);
          } else {
            // Pacman loses a life
            this.gameState.loseLife();
            console.log('Pacman caught by ghost! Life lost.');
            
            if (this.gameState.getLives() > 0) {
              // Respawn Pacman and reset ghosts
              const mazeData = this.maze!.getMazeData();
              this.pacman.reset(mazeData.pacmanStart.x, mazeData.pacmanStart.z);
              this.ghostManager.resetGhosts();
            }
          }
        }
      }
    }

    // Update pellet system
    if (this.pelletManager) {
      this.pelletManager.update(deltaTime);
      
      // Check for pellet collection
      if (this.pacman) {
        const collectionResult = this.pelletManager.checkPelletCollisions(this.pacman);
        if (collectionResult.collected) {
          // Add scoring logic: 10 points for pellets, 50 points for power pellets
          if (collectionResult.isPowerPellet) {
            this.gameState.addPowerPelletScore();
          } else {
            this.gameState.addPelletScore();
          }
          
          console.log(`Pellet collected! Points: ${collectionResult.points}, Power Pellet: ${collectionResult.isPowerPellet}`);
          
          // Add level completion detection when all pellets are collected
          if (this.pelletManager.areAllPelletsCollected()) {
            this.gameState.completeLevel();
          }
        }
      }
    }
  }

  /**
   * Render the 3D scene
   */
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize events
   */
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Get the maze instance for external access
   */
  public getMaze(): Maze | null {
    return this.maze;
  }

  /**
   * Get the Three.js scene for external access
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the camera for external access
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the renderer for external access
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Get the Pacman instance for external access
   */
  public getPacman(): Pacman | null {
    return this.pacman;
  }

  /**
   * Get the InputManager instance for external access
   */
  public getInputManager(): InputManager {
    return this.inputManager;
  }

  /**
   * Get the CollisionSystem instance for external access
   */
  public getCollisionSystem(): CollisionSystem | null {
    return this.pacman ? this.pacman.getCollisionSystem() : null;
  }

  /**
   * Get the PelletManager instance for external access
   */
  public getPelletManager(): PelletManager | null {
    return this.pelletManager;
  }

  /**
   * Get the GhostManager instance for external access
   */
  public getGhostManager(): GhostManager | null {
    return this.ghostManager;
  }

  /**
   * Get the GameState instance for external access
   */
  public getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Handle keyboard input for Pacman movement (legacy method - now handled by InputManager)
   * @deprecated Use InputManager directly instead
   */
  public handleKeyInput(_keyCode: string, _isPressed: boolean): void {
    // This method is kept for backward compatibility but is now handled by InputManager
    console.warn('handleKeyInput is deprecated - InputManager handles input automatically');
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stop();
    
    // Clean up Three.js resources
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Dispose maze resources
    if (this.maze) {
      this.maze.dispose();
      this.maze = null;
    }

    // Dispose pellet manager resources
    if (this.pelletManager) {
      this.pelletManager.dispose();
      this.pelletManager = null;
    }

    // Dispose ghost manager resources
    if (this.ghostManager) {
      this.ghostManager.dispose();
      this.ghostManager = null;
    }

    // Dispose Pacman resources
    if (this.pacman) {
      this.pacman.dispose();
      this.pacman = null;
    }

    // Dispose input manager
    this.inputManager.dispose();

    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    console.log('GameEngine disposed');
  }
}