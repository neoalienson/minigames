/**
 * GameState class - Manages game state including score, lives, level, and game status
 * Handles scoring logic, UI updates, and level progression
 */

export type GameStatus = 'playing' | 'paused' | 'gameOver' | 'levelComplete';

export interface GameStateData {
  score: number;
  lives: number;
  level: number;
  gameStatus: GameStatus;
  powerModeActive: boolean;
  powerModeTimer: number;
}

export class GameState {
  private score: number = 0;
  private lives: number = 3;
  private level: number = 1;
  private gameStatus: GameStatus = 'playing';
  private powerModeActive: boolean = false;
  private powerModeTimer: number = 0;
  
  // UI elements
  private scoreElement: HTMLElement | null = null;
  private livesElement: HTMLElement | null = null;
  private levelElement: HTMLElement | null = null;
  
  // Event callbacks
  private onLevelCompleteCallback: (() => void) | null = null;
  private onGameOverCallback: (() => void) | null = null;
  private onPowerModeChangeCallback: ((active: boolean) => void) | null = null;

  constructor() {
    this.initializeUI();
    this.updateUI();
    console.log('GameState initialized');
  }

  /**
   * Initialize UI elements for score, lives, and level display
   */
  private initializeUI(): void {
    this.scoreElement = document.getElementById('score');
    this.livesElement = document.getElementById('lives');
    this.levelElement = document.getElementById('level');
    
    if (!this.scoreElement || !this.livesElement || !this.levelElement) {
      console.warn('Some UI elements not found - UI updates may not work properly');
    }
  }

  /**
   * Add scoring logic: 10 points for pellets, 50 points for power pellets
   */
  public addScore(points: number): void {
    this.score += points;
    this.updateUI();
    console.log(`Score updated: +${points} points (Total: ${this.score})`);
  }

  /**
   * Add points for regular pellet collection (10 points)
   */
  public addPelletScore(): void {
    this.addScore(10);
  }

  /**
   * Add points for power pellet collection (50 points)
   */
  public addPowerPelletScore(): void {
    this.addScore(50);
    this.activatePowerMode();
  }

  /**
   * Activate power mode for 10 seconds
   */
  public activatePowerMode(): void {
    this.powerModeActive = true;
    this.powerModeTimer = 10.0; // 10 seconds
    
    if (this.onPowerModeChangeCallback) {
      this.onPowerModeChangeCallback(true);
    }
    
    console.log('Power mode activated for 10 seconds');
  }

  /**
   * Update power mode timer
   */
  public updatePowerMode(deltaTime: number): void {
    if (this.powerModeActive) {
      this.powerModeTimer -= deltaTime;
      
      if (this.powerModeTimer <= 0) {
        this.powerModeActive = false;
        this.powerModeTimer = 0;
        
        if (this.onPowerModeChangeCallback) {
          this.onPowerModeChangeCallback(false);
        }
        
        console.log('Power mode deactivated');
      }
    }
  }

  /**
   * Lose a life
   */
  public loseLife(): void {
    if (this.lives > 0) {
      this.lives--;
      this.updateUI();
      
      if (this.lives <= 0) {
        this.setGameStatus('gameOver');
        if (this.onGameOverCallback) {
          this.onGameOverCallback();
        }
        console.log('Game Over - No lives remaining');
      } else {
        console.log(`Life lost - ${this.lives} lives remaining`);
      }
    }
  }

  /**
   * Add level completion detection when all pellets are collected
   */
  public completeLevel(): void {
    this.setGameStatus('levelComplete');
    
    if (this.onLevelCompleteCallback) {
      this.onLevelCompleteCallback();
    }
    
    console.log(`Level ${this.level} completed!`);
  }

  /**
   * Advance to next level
   */
  public nextLevel(): void {
    this.level++;
    this.setGameStatus('playing');
    this.updateUI();
    console.log(`Advanced to level ${this.level}`);
  }

  /**
   * Create game state persistence and reset functionality
   */
  public reset(): void {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameStatus = 'playing';
    this.powerModeActive = false;
    this.powerModeTimer = 0;
    this.updateUI();
    console.log('Game state reset to initial values');
  }

  /**
   * Save game state to localStorage
   */
  public saveState(): void {
    const gameData: GameStateData = {
      score: this.score,
      lives: this.lives,
      level: this.level,
      gameStatus: this.gameStatus,
      powerModeActive: this.powerModeActive,
      powerModeTimer: this.powerModeTimer
    };
    
    try {
      localStorage.setItem('pacman-game-state', JSON.stringify(gameData));
      console.log('Game state saved to localStorage');
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }

  /**
   * Load game state from localStorage
   */
  public loadState(): boolean {
    try {
      const savedData = localStorage.getItem('pacman-game-state');
      if (savedData) {
        const gameData: GameStateData = JSON.parse(savedData);
        
        this.score = gameData.score;
        this.lives = gameData.lives;
        this.level = gameData.level;
        this.gameStatus = gameData.gameStatus;
        this.powerModeActive = gameData.powerModeActive;
        this.powerModeTimer = gameData.powerModeTimer;
        
        this.updateUI();
        console.log('Game state loaded from localStorage');
        return true;
      }
    } catch (error) {
      console.warn('Failed to load game state:', error);
    }
    
    return false;
  }

  /**
   * Update UI display for score, lives, and level information
   */
  private updateUI(): void {
    if (this.scoreElement) {
      this.scoreElement.textContent = `Score: ${this.score}`;
    }
    
    if (this.livesElement) {
      this.livesElement.textContent = `Lives: ${this.lives}`;
    }
    
    if (this.levelElement) {
      this.levelElement.textContent = `Level: ${this.level}`;
    }
  }

  // Getters
  public getScore(): number {
    return this.score;
  }

  public getLives(): number {
    return this.lives;
  }

  public getLevel(): number {
    return this.level;
  }

  public getGameStatus(): GameStatus {
    return this.gameStatus;
  }

  public isPowerModeActive(): boolean {
    return this.powerModeActive;
  }

  public getPowerModeTimer(): number {
    return this.powerModeTimer;
  }

  // Setters
  public setGameStatus(status: GameStatus): void {
    this.gameStatus = status;
    console.log(`Game status changed to: ${status}`);
  }

  // Event callback setters
  public setOnLevelCompleteCallback(callback: () => void): void {
    this.onLevelCompleteCallback = callback;
  }

  public setOnGameOverCallback(callback: () => void): void {
    this.onGameOverCallback = callback;
  }

  public setOnPowerModeChangeCallback(callback: (active: boolean) => void): void {
    this.onPowerModeChangeCallback = callback;
  }

  /**
   * Get complete game state data
   */
  public getGameStateData(): GameStateData {
    return {
      score: this.score,
      lives: this.lives,
      level: this.level,
      gameStatus: this.gameStatus,
      powerModeActive: this.powerModeActive,
      powerModeTimer: this.powerModeTimer
    };
  }
}