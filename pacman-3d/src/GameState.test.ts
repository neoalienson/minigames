/**
 * GameState class tests
 */

import { GameState, GameStatus } from './GameState';

// Mock DOM elements
const mockScoreElement = { textContent: '' };
const mockLivesElement = { textContent: '' };
const mockLevelElement = { textContent: '' };

// Mock localStorage
const mockLocalStorage: {
  data: Record<string, string>;
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  clear: jest.Mock<void, []>;
} = {
  data: {} as Record<string, string>,
  getItem: jest.fn((key: string): string | null => mockLocalStorage.data[key] || null),
  setItem: jest.fn((key: string, value: string): void => {
    mockLocalStorage.data[key] = value;
  }),
  clear: jest.fn((): void => {
    mockLocalStorage.data = {};
  })
};

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    // Mock DOM elements
    jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      switch (id) {
        case 'score':
          return mockScoreElement as any;
        case 'lives':
          return mockLivesElement as any;
        case 'level':
          return mockLevelElement as any;
        default:
          return null;
      }
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Clear localStorage mock data
    mockLocalStorage.clear();

    gameState = new GameState();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(gameState.getScore()).toBe(0);
      expect(gameState.getLives()).toBe(3);
      expect(gameState.getLevel()).toBe(1);
      expect(gameState.getGameStatus()).toBe('playing');
      expect(gameState.isPowerModeActive()).toBe(false);
      expect(gameState.getPowerModeTimer()).toBe(0);
    });

    it('should update UI elements on initialization', () => {
      expect(mockScoreElement.textContent).toBe('Score: 0');
      expect(mockLivesElement.textContent).toBe('Lives: 3');
      expect(mockLevelElement.textContent).toBe('Level: 1');
    });
  });

  describe('Scoring System', () => {
    it('should add score correctly', () => {
      gameState.addScore(100);
      expect(gameState.getScore()).toBe(100);
      expect(mockScoreElement.textContent).toBe('Score: 100');
    });

    it('should add pellet score (10 points)', () => {
      gameState.addPelletScore();
      expect(gameState.getScore()).toBe(10);
    });

    it('should add power pellet score (50 points) and activate power mode', () => {
      gameState.addPowerPelletScore();
      expect(gameState.getScore()).toBe(50);
      expect(gameState.isPowerModeActive()).toBe(true);
      expect(gameState.getPowerModeTimer()).toBe(10);
    });

    it('should accumulate scores correctly', () => {
      gameState.addPelletScore(); // 10
      gameState.addPelletScore(); // 20
      gameState.addPowerPelletScore(); // 70
      expect(gameState.getScore()).toBe(70);
    });
  });

  describe('Power Mode', () => {
    it('should activate power mode correctly', () => {
      const callback = jest.fn();
      gameState.setOnPowerModeChangeCallback(callback);
      
      gameState.activatePowerMode();
      
      expect(gameState.isPowerModeActive()).toBe(true);
      expect(gameState.getPowerModeTimer()).toBe(10);
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should deactivate power mode after timer expires', () => {
      const callback = jest.fn();
      gameState.setOnPowerModeChangeCallback(callback);
      
      gameState.activatePowerMode();
      gameState.updatePowerMode(5); // 5 seconds passed
      
      expect(gameState.isPowerModeActive()).toBe(true);
      expect(gameState.getPowerModeTimer()).toBe(5);
      
      gameState.updatePowerMode(6); // 6 more seconds (11 total)
      
      expect(gameState.isPowerModeActive()).toBe(false);
      expect(gameState.getPowerModeTimer()).toBe(0);
      expect(callback).toHaveBeenCalledWith(false);
    });
  });

  describe('Life System', () => {
    it('should lose life correctly', () => {
      gameState.loseLife();
      expect(gameState.getLives()).toBe(2);
      expect(mockLivesElement.textContent).toBe('Lives: 2');
    });

    it('should trigger game over when all lives lost', () => {
      const callback = jest.fn();
      gameState.setOnGameOverCallback(callback);
      
      gameState.loseLife(); // 2 lives
      gameState.loseLife(); // 1 life
      gameState.loseLife(); // 0 lives - game over
      
      expect(gameState.getLives()).toBe(0);
      expect(gameState.getGameStatus()).toBe('gameOver');
      expect(callback).toHaveBeenCalled();
    });

    it('should not lose life below zero', () => {
      // Lose all lives
      gameState.loseLife();
      gameState.loseLife();
      gameState.loseLife();
      
      // Try to lose another life
      gameState.loseLife();
      
      expect(gameState.getLives()).toBe(0);
    });
  });

  describe('Level System', () => {
    it('should complete level correctly', () => {
      const callback = jest.fn();
      gameState.setOnLevelCompleteCallback(callback);
      
      gameState.completeLevel();
      
      expect(gameState.getGameStatus()).toBe('levelComplete');
      expect(callback).toHaveBeenCalled();
    });

    it('should advance to next level', () => {
      gameState.nextLevel();
      expect(gameState.getLevel()).toBe(2);
      expect(gameState.getGameStatus()).toBe('playing');
      expect(mockLevelElement.textContent).toBe('Level: 2');
    });
  });

  describe('Game State Management', () => {
    it('should reset game state correctly', () => {
      // Modify state
      gameState.addScore(500);
      gameState.loseLife();
      gameState.nextLevel();
      gameState.activatePowerMode();
      
      // Reset
      gameState.reset();
      
      expect(gameState.getScore()).toBe(0);
      expect(gameState.getLives()).toBe(3);
      expect(gameState.getLevel()).toBe(1);
      expect(gameState.getGameStatus()).toBe('playing');
      expect(gameState.isPowerModeActive()).toBe(false);
      expect(gameState.getPowerModeTimer()).toBe(0);
    });

    it('should set game status correctly', () => {
      gameState.setGameStatus('paused');
      expect(gameState.getGameStatus()).toBe('paused');
    });
  });

  describe('Persistence', () => {
    it('should save state to localStorage', () => {
      gameState.addScore(100);
      gameState.loseLife();
      gameState.nextLevel();
      
      gameState.saveState();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'pacman-game-state',
        expect.stringContaining('"score":100')
      );
    });

    it('should load state from localStorage', () => {
      const savedState = {
        score: 250,
        lives: 2,
        level: 3,
        gameStatus: 'playing' as GameStatus,
        powerModeActive: false,
        powerModeTimer: 0
      };
      
      mockLocalStorage.data['pacman-game-state'] = JSON.stringify(savedState);
      
      const loaded = gameState.loadState();
      
      expect(loaded).toBe(true);
      expect(gameState.getScore()).toBe(250);
      expect(gameState.getLives()).toBe(2);
      expect(gameState.getLevel()).toBe(3);
    });

    it('should return false when no saved state exists', () => {
      const loaded = gameState.loadState();
      expect(loaded).toBe(false);
    });
  });

  describe('Game State Data', () => {
    it('should return complete game state data', () => {
      gameState.addScore(150);
      gameState.loseLife();
      gameState.activatePowerMode();
      
      const stateData = gameState.getGameStateData();
      
      expect(stateData).toEqual({
        score: 150,
        lives: 2,
        level: 1,
        gameStatus: 'playing',
        powerModeActive: true,
        powerModeTimer: 10
      });
    });
  });
});