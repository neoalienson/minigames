/**
 * InputManager class - Handles keyboard events and input state tracking
 * Provides smooth movement through continuous input polling and key state management
 */

import * as THREE from 'three';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  r: boolean;
  m: boolean;
}

export type InputCallback = (direction: THREE.Vector2) => void;
export type ActionCallback = (action: string) => void;

export class InputManager {
  private keyState: InputState;
  private movementCallback: InputCallback | null = null;
  private actionCallback: ActionCallback | null = null;
  private isEnabled: boolean = true;

  // Key mapping configuration
  private keyMap: { [key: string]: keyof InputState } = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'Space': 'space',
    'KeyR': 'r',
    'KeyM': 'm'
  };

  constructor() {
    // Initialize key state - all keys start as not pressed
    this.keyState = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
      r: false,
      m: false
    };

    this.setupEventListeners();
    console.log('InputManager initialized with key state tracking');
  }

  /**
   * Set up keyboard event listeners for key press and release
   */
  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent context menu on right click to avoid interfering with game
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    console.log('Keyboard event listeners set up');
  }

  /**
   * Handle key press events - update key state and trigger callbacks
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const mappedKey = this.keyMap[event.code];
    if (mappedKey) {
      event.preventDefault();
      
      // Update key state
      const wasPressed = this.keyState[mappedKey];
      this.keyState[mappedKey] = true;
      
      // Handle movement keys with continuous movement support
      if (this.isMovementKey(mappedKey)) {
        this.updateMovementDirection();
      }
      
      // Handle action keys (only trigger on initial press, not continuous)
      if (this.isActionKey(mappedKey) && !wasPressed) {
        this.handleActionKey(mappedKey);
      }
    }
  }

  /**
   * Handle key release events - update key state
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const mappedKey = this.keyMap[event.code];
    if (mappedKey) {
      event.preventDefault();
      
      // Update key state
      this.keyState[mappedKey] = false;
      
      // Update movement direction when movement keys are released
      if (this.isMovementKey(mappedKey)) {
        this.updateMovementDirection();
      }
    }
  }

  /**
   * Check if a key is a movement key
   */
  private isMovementKey(key: keyof InputState): boolean {
    return key === 'up' || key === 'down' || key === 'left' || key === 'right';
  }

  /**
   * Check if a key is an action key
   */
  private isActionKey(key: keyof InputState): boolean {
    return key === 'space' || key === 'r' || key === 'm';
  }

  /**
   * Update movement direction based on current key state and call movement callback
   */
  private updateMovementDirection(): void {
    if (!this.movementCallback) return;

    const direction = new THREE.Vector2(0, 0);
    
    // Determine movement direction based on pressed keys
    // Priority system: most recently pressed key takes precedence
    if (this.keyState.up) {
      direction.y = -1;
    }
    if (this.keyState.down) {
      direction.y = 1;
    }
    if (this.keyState.left) {
      direction.x = -1;
    }
    if (this.keyState.right) {
      direction.x = 1;
    }

    // Handle diagonal movement - prioritize most recent input
    // For now, we'll use the last pressed direction (no diagonal movement in classic Pacman)
    if (direction.x !== 0 && direction.y !== 0) {
      // If both horizontal and vertical keys are pressed, prioritize the most recent
      // For simplicity, we'll prioritize horizontal movement
      direction.y = 0;
    }

    this.movementCallback(direction);
  }

  /**
   * Handle action key presses
   */
  private handleActionKey(key: keyof InputState): void {
    if (!this.actionCallback) return;

    switch (key) {
      case 'space':
        this.actionCallback('pause');
        break;
      case 'r':
        this.actionCallback('restart');
        break;
      case 'm':
        this.actionCallback('mute');
        break;
    }
  }

  /**
   * Set callback for movement input
   */
  public setMovementCallback(callback: InputCallback): void {
    this.movementCallback = callback;
  }

  /**
   * Set callback for action input
   */
  public setActionCallback(callback: ActionCallback): void {
    this.actionCallback = callback;
  }

  /**
   * Get current key state for a specific key
   */
  public isKeyPressed(key: keyof InputState): boolean {
    return this.keyState[key];
  }

  /**
   * Get current movement direction based on key state
   */
  public getCurrentMovementDirection(): THREE.Vector2 {
    const direction = new THREE.Vector2(0, 0);
    
    if (this.keyState.up) direction.y = -1;
    else if (this.keyState.down) direction.y = 1;
    
    if (this.keyState.left) direction.x = -1;
    else if (this.keyState.right) direction.x = 1;
    
    // Prioritize horizontal movement if both are pressed
    if (direction.x !== 0 && direction.y !== 0) {
      direction.y = 0;
    }
    
    return direction;
  }

  /**
   * Enable or disable input processing
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // Clear key state when disabled
    if (!enabled) {
      Object.keys(this.keyState).forEach(key => {
        this.keyState[key as keyof InputState] = false;
      });
    }
    
    console.log(`InputManager ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if input is currently enabled
   */
  public isInputEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Reset all key states to unpressed
   */
  public resetKeyState(): void {
    Object.keys(this.keyState).forEach(key => {
      this.keyState[key as keyof InputState] = false;
    });
    console.log('Input key state reset');
  }

  /**
   * Get a copy of the current key state
   */
  public getKeyState(): InputState {
    return { ...this.keyState };
  }

  /**
   * Clean up event listeners
   */
  public dispose(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('contextmenu', (e) => e.preventDefault());
    
    this.movementCallback = null;
    this.actionCallback = null;
    
    console.log('InputManager disposed');
  }
}