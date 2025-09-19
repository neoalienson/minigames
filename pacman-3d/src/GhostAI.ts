/**
 * GhostAI class - Advanced AI system with state management and personality-based behaviors
 * Implements sophisticated ghost behaviors with state transitions and mode management
 */

import * as THREE from 'three';
import { PathfindingSystem } from './PathfindingSystem';
import { Maze } from './Maze';
import { Pacman } from './Pacman';

// Enhanced ghost states with more sophisticated behavior
export enum GhostAIState {
  CHASE = 'chase',
  SCATTER = 'scatter',
  FRIGHTENED = 'frightened',
  DEAD = 'dead',
  ENTERING = 'entering' // When ghost is entering the maze
}

// Ghost personality types with enhanced behaviors
export enum GhostPersonality {
  AGGRESSIVE = 'aggressive',    // Red ghost - direct aggressive chase
  AMBUSH = 'ambush',           // Pink ghost - ambush and intercept tactics
  RANDOM = 'random',           // Orange ghost - unpredictable movement
  DEFENSIVE = 'defensive'      // Blue ghost - defensive and territorial
}

// AI mode timing configuration
interface AIModeConfig {
  scatterDuration: number;
  chaseDuration: number;
  modeTransitions: number[];
}

// Default AI mode configuration (in seconds)
const DEFAULT_AI_CONFIG: AIModeConfig = {
  scatterDuration: 7,
  chaseDuration: 20,
  modeTransitions: [7, 27, 34, 54, 59, 79, 84] // Times when modes switch
};

export class GhostAI {
  private pathfinding: PathfindingSystem;
  private maze: Maze;
  private pacman: Pacman;
  private personality: GhostPersonality;
  
  // AI state management
  private currentState: GhostAIState = GhostAIState.SCATTER;
  private previousState: GhostAIState = GhostAIState.SCATTER;
  private stateTimer: number = 0;
  private globalTimer: number = 0;
  
  // Mode management
  private aiConfig: AIModeConfig;
  private currentModeIndex: number = 0;
  private isInScatterMode: boolean = true;
  
  // Pathfinding and movement
  private currentPath: THREE.Vector2[] = [];
  private pathIndex: number = 0;
  private lastPathUpdate: number = 0;
  private pathUpdateInterval: number = 500; // Update path every 500ms
  
  // Personality-specific properties
  private aggressionLevel: number = 1.0;
  private territorialRadius: number = 5;
  private ambushDistance: number = 4;
  private randomnessLevel: number = 0.3;
  
  // Corner positions for scatter mode
  private scatterTarget: THREE.Vector2;
  
  // Performance optimization
  private lastTargetPosition: THREE.Vector2 = new THREE.Vector2(-1, -1);
  private targetPositionTolerance: number = 0.5;

  constructor(
    pathfinding: PathfindingSystem,
    maze: Maze,
    pacman: Pacman,
    personality: GhostPersonality
  ) {
    this.pathfinding = pathfinding;
    this.maze = maze;
    this.pacman = pacman;
    this.personality = personality;
    this.aiConfig = { ...DEFAULT_AI_CONFIG };
    
    this.initializePersonality();
    this.setScatterTarget();
    
    console.log(`GhostAI initialized with ${personality} personality`);
  }

  /**
   * Initialize personality-specific properties
   */
  private initializePersonality(): void {
    switch (this.personality) {
      case GhostPersonality.AGGRESSIVE:
        this.aggressionLevel = 1.5;
        this.pathUpdateInterval = 300; // More frequent updates for aggressive behavior
        this.randomnessLevel = 0.1;
        break;
        
      case GhostPersonality.AMBUSH:
        this.aggressionLevel = 1.2;
        this.ambushDistance = 6;
        this.pathUpdateInterval = 400;
        this.randomnessLevel = 0.2;
        break;
        
      case GhostPersonality.RANDOM:
        this.aggressionLevel = 0.8;
        this.pathUpdateInterval = 800;
        this.randomnessLevel = 0.7;
        break;
        
      case GhostPersonality.DEFENSIVE:
        this.aggressionLevel = 0.9;
        this.territorialRadius = 8;
        this.pathUpdateInterval = 600;
        this.randomnessLevel = 0.3;
        break;
    }
  }

  /**
   * Set scatter target based on personality and maze layout
   */
  private setScatterTarget(): void {
    const mazeData = this.maze.getMazeData();
    
    switch (this.personality) {
      case GhostPersonality.AGGRESSIVE:
        this.scatterTarget = new THREE.Vector2(mazeData.width - 2, 1); // Top-right
        break;
      case GhostPersonality.AMBUSH:
        this.scatterTarget = new THREE.Vector2(1, 1); // Top-left
        break;
      case GhostPersonality.RANDOM:
        this.scatterTarget = new THREE.Vector2(mazeData.width - 2, mazeData.height - 2); // Bottom-right
        break;
      case GhostPersonality.DEFENSIVE:
        this.scatterTarget = new THREE.Vector2(1, mazeData.height - 2); // Bottom-left
        break;
    }
  }

  /**
   * Update AI behavior and state management
   */
  public update(deltaTime: number, currentPosition: THREE.Vector2): THREE.Vector2 | null {
    this.globalTimer += deltaTime;
    this.stateTimer += deltaTime;
    this.lastPathUpdate += deltaTime * 1000;
    
    // Update AI mode (scatter/chase) based on global timer
    this.updateAIMode();
    
    // Update AI state and get next direction
    return this.updateAIState(currentPosition);
  }

  /**
   * Update AI mode transitions between scatter and chase
   */
  private updateAIMode(): void {
    const currentTime = this.globalTimer;
    
    // Check if we should transition to next mode
    if (this.currentModeIndex < this.aiConfig.modeTransitions.length) {
      const nextTransitionTime = this.aiConfig.modeTransitions[this.currentModeIndex];
      
      if (currentTime >= nextTransitionTime) {
        this.isInScatterMode = !this.isInScatterMode;
        this.currentModeIndex++;
        
        // Force state transition if not in special states
        if (this.currentState === GhostAIState.CHASE || this.currentState === GhostAIState.SCATTER) {
          this.setState(this.isInScatterMode ? GhostAIState.SCATTER : GhostAIState.CHASE);
        }
        
        console.log(`Ghost ${this.personality} mode transition: ${this.isInScatterMode ? 'SCATTER' : 'CHASE'}`);
      }
    } else {
      // After all transitions, default to chase mode
      if (this.currentState === GhostAIState.SCATTER) {
        this.setState(GhostAIState.CHASE);
      }
    }
  }

  /**
   * Update AI state and return next movement direction
   */
  private updateAIState(currentPosition: THREE.Vector2): THREE.Vector2 | null {
    switch (this.currentState) {
      case GhostAIState.CHASE:
        return this.updateChaseState(currentPosition);
        
      case GhostAIState.SCATTER:
        return this.updateScatterState(currentPosition);
        
      case GhostAIState.FRIGHTENED:
        return this.updateFrightenedState(currentPosition);
        
      case GhostAIState.DEAD:
        return this.updateDeadState(currentPosition);
        
      case GhostAIState.ENTERING:
        return this.updateEnteringState(currentPosition);
        
      default:
        return null;
    }
  }

  /**
   * Chase state behavior with personality-based targeting
   */
  private updateChaseState(currentPosition: THREE.Vector2): THREE.Vector2 | null {
    const pacmanPos = this.pacman.getGridPosition();
    let targetPosition: THREE.Vector2;
    
    // Apply personality-specific chase behavior
    switch (this.personality) {
      case GhostPersonality.AGGRESSIVE:
        targetPosition = this.getAggressiveTarget(pacmanPos);
        break;
        
      case GhostPersonality.AMBUSH:
        targetPosition = this.getAmbushTarget(pacmanPos);
        break;
        
      case GhostPersonality.RANDOM:
        targetPosition = this.getRandomTarget(pacmanPos);
        break;
        
      case GhostPersonality.DEFENSIVE:
        targetPosition = this.getDefensiveTarget(pacmanPos, currentPosition);
        break;
        
      default:
        targetPosition = pacmanPos.clone();
    }
    
    return this.getNextDirectionToTarget(currentPosition, targetPosition);
  }

  /**
   * Scatter state behavior - move to assigned corner
   */
  private updateScatterState(currentPosition: THREE.Vector2): THREE.Vector2 | null {
    return this.getNextDirectionToTarget(currentPosition, this.scatterTarget);
  }

  /**
   * Frightened state behavior - flee from Pacman with some randomness
   */
  private updateFrightenedState(currentPosition: THREE.Vector2): THREE.Vector2 | null {
    const pacmanPos = this.pacman.getGridPosition();
    
    // Add randomness to frightened behavior
    if (Math.random() < 0.3) {
      return this.getRandomDirection(currentPosition);
    }
    
    // Flee from Pacman
    const fleeDirection = new THREE.Vector2();
    fleeDirection.x = currentPosition.x - pacmanPos.x;
    fleeDirection.y = currentPosition.y - pacmanPos.y;
    
    // Normalize and extend flee direction
    const length = Math.sqrt(fleeDirection.x * fleeDirection.x + fleeDirection.y * fleeDirection.y);
    if (length > 0) {
      fleeDirection.x /= length;
      fleeDirection.y /= length;
    }
    
    const fleeTarget = currentPosition.clone();
    fleeTarget.x += fleeDirection.x * 5;
    fleeTarget.y += fleeDirection.y * 5;
    
    return this.getNextDirectionToTarget(currentPosition, fleeTarget);
  }

  /**
   * Dead state behavior - return to starting position quickly
   */
  private updateDeadState(currentPosition: THREE.Vector2): THREE.Vector2 | null {
    const mazeData = this.maze.getMazeData();
    const ghostStart = mazeData.ghostStarts[0] || { x: 5, z: 5 }; // Fallback position
    const startPosition = new THREE.Vector2(ghostStart.x, ghostStart.z);
    
    return this.getNextDirectionToTarget(currentPosition, startPosition);
  }

  /**
   * Entering state behavior - move from starting position to active area
   */
  private updateEnteringState(currentPosition: THREE.Vector2): THREE.Vector2 | null {
    // Move toward center of maze
    const mazeData = this.maze.getMazeData();
    const centerPosition = new THREE.Vector2(
      Math.floor(mazeData.width / 2),
      Math.floor(mazeData.height / 2)
    );
    
    const direction = this.getNextDirectionToTarget(currentPosition, centerPosition);
    
    // Transition to scatter mode once near center
    const distanceToCenter = Math.sqrt(
      Math.pow(currentPosition.x - centerPosition.x, 2) + 
      Math.pow(currentPosition.y - centerPosition.y, 2)
    );
    
    if (distanceToCenter < 2) {
      this.setState(GhostAIState.SCATTER);
    }
    
    return direction;
  }

  /**
   * Get aggressive target (direct chase with slight prediction)
   */
  private getAggressiveTarget(pacmanPos: THREE.Vector2): THREE.Vector2 {
    const pacmanDirection = this.pacman.getCurrentDirection();
    const target = pacmanPos.clone();
    
    // Predict Pacman's position slightly ahead
    target.x += pacmanDirection.x * 2;
    target.y += pacmanDirection.y * 2;
    
    return target;
  }

  /**
   * Get ambush target (intercept Pacman's path)
   */
  private getAmbushTarget(pacmanPos: THREE.Vector2): THREE.Vector2 {
    const pacmanDirection = this.pacman.getCurrentDirection();
    const target = pacmanPos.clone();
    
    // Target position ahead of Pacman for ambush
    target.x += pacmanDirection.x * this.ambushDistance;
    target.y += pacmanDirection.y * this.ambushDistance;
    
    return target;
  }

  /**
   * Get random target with some bias toward Pacman
   */
  private getRandomTarget(pacmanPos: THREE.Vector2): THREE.Vector2 {
    if (Math.random() < this.randomnessLevel) {
      // Random movement
      const mazeData = this.maze.getMazeData();
      return new THREE.Vector2(
        Math.floor(Math.random() * mazeData.width),
        Math.floor(Math.random() * mazeData.height)
      );
    } else {
      // Bias toward Pacman
      return pacmanPos.clone();
    }
  }

  /**
   * Get defensive target (maintain distance while being territorial)
   */
  private getDefensiveTarget(pacmanPos: THREE.Vector2, currentPos: THREE.Vector2): THREE.Vector2 {
    const distance = Math.sqrt(
      Math.pow(currentPos.x - pacmanPos.x, 2) + 
      Math.pow(currentPos.y - pacmanPos.y, 2)
    );
    
    if (distance < this.territorialRadius) {
      // Move away from Pacman
      const awayDirection = new THREE.Vector2();
      awayDirection.x = currentPos.x - pacmanPos.x;
      awayDirection.y = currentPos.y - pacmanPos.y;
      
      const length = Math.sqrt(awayDirection.x * awayDirection.x + awayDirection.y * awayDirection.y);
      if (length > 0) {
        awayDirection.x /= length;
        awayDirection.y /= length;
      }
      
      const target = currentPos.clone();
      target.x += awayDirection.x * 3;
      target.y += awayDirection.y * 3;
      
      return target;
    } else {
      // Normal chase when at safe distance
      return pacmanPos.clone();
    }
  }

  /**
   * Get next direction toward target using pathfinding
   */
  private getNextDirectionToTarget(currentPos: THREE.Vector2, targetPos: THREE.Vector2): THREE.Vector2 | null {
    // Check if we need to update the path
    const targetChanged = Math.abs(targetPos.x - this.lastTargetPosition.x) > this.targetPositionTolerance ||
                         Math.abs(targetPos.y - this.lastTargetPosition.y) > this.targetPositionTolerance;
    
    if (this.currentPath.length === 0 || 
        this.pathIndex >= this.currentPath.length ||
        this.lastPathUpdate > this.pathUpdateInterval ||
        targetChanged) {
      
      // Find new path
      this.currentPath = this.pathfinding.findPathToNearest(
        Math.round(currentPos.x), 
        Math.round(currentPos.y), 
        Math.round(targetPos.x), 
        Math.round(targetPos.y)
      );
      
      this.pathIndex = 0;
      this.lastPathUpdate = 0;
      this.lastTargetPosition.copy(targetPos);
    }
    
    // Get next direction from path
    if (this.currentPath.length > 0 && this.pathIndex < this.currentPath.length) {
      const nextPosition = this.currentPath[this.pathIndex];
      const direction = new THREE.Vector2();
      direction.x = nextPosition.x - currentPos.x;
      direction.y = nextPosition.y - currentPos.y;
      
      // Normalize direction
      const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      if (length > 0) {
        direction.x /= length;
        direction.y /= length;
      }
      
      // Move to next path node when close enough
      if (length < 0.5) {
        this.pathIndex++;
      }
      
      return direction;
    }
    
    return null;
  }

  /**
   * Get random valid direction
   */
  private getRandomDirection(currentPos: THREE.Vector2): THREE.Vector2 | null {
    const directions = [
      new THREE.Vector2(0, 1),   // up
      new THREE.Vector2(0, -1),  // down
      new THREE.Vector2(1, 0),   // right
      new THREE.Vector2(-1, 0)   // left
    ];
    
    // Filter valid directions
    const validDirections = directions.filter(dir => {
      const testPos = currentPos.clone();
      testPos.x += dir.x;
      testPos.y += dir.y;
      return !this.maze.isWall(Math.round(testPos.x), Math.round(testPos.y));
    });
    
    if (validDirections.length > 0) {
      return validDirections[Math.floor(Math.random() * validDirections.length)];
    }
    
    return null;
  }

  /**
   * Set AI state with proper transitions
   */
  public setState(newState: GhostAIState): void {
    if (this.currentState !== newState) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.stateTimer = 0;
      
      // Clear current path when state changes
      this.currentPath = [];
      this.pathIndex = 0;
      
      console.log(`Ghost ${this.personality} AI state changed to ${newState}`);
    }
  }

  /**
   * Get current AI state
   */
  public getState(): GhostAIState {
    return this.currentState;
  }

  /**
   * Get current personality
   */
  public getPersonality(): GhostPersonality {
    return this.personality;
  }

  /**
   * Force scatter mode
   */
  public forceScatterMode(): void {
    this.isInScatterMode = true;
    if (this.currentState === GhostAIState.CHASE) {
      this.setState(GhostAIState.SCATTER);
    }
  }

  /**
   * Force chase mode
   */
  public forceChaseMode(): void {
    this.isInScatterMode = false;
    if (this.currentState === GhostAIState.SCATTER) {
      this.setState(GhostAIState.CHASE);
    }
  }

  /**
   * Reset AI to initial state
   */
  public reset(): void {
    this.currentState = GhostAIState.SCATTER;
    this.previousState = GhostAIState.SCATTER;
    this.stateTimer = 0;
    this.globalTimer = 0;
    this.currentModeIndex = 0;
    this.isInScatterMode = true;
    this.currentPath = [];
    this.pathIndex = 0;
    this.lastPathUpdate = 0;
  }

  /**
   * Dispose of AI resources
   */
  public dispose(): void {
    this.currentPath = [];
  }
}