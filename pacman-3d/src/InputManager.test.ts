/**
 * InputManager test suite
 * Tests keyboard input handling, key state tracking, and callback functionality
 */

import { InputManager } from './InputManager';
import { Vector2 } from 'three';

// Mock DOM events
class MockKeyboardEvent extends Event {
  code: string;
  
  constructor(type: string, options: { code: string }) {
    super(type);
    this.code = options.code;
  }
  
  preventDefault() {
    // Mock preventDefault
  }
}

describe('InputManager', () => {
  let inputManager: InputManager;
  let movementCallback: jest.Mock;
  let actionCallback: jest.Mock;

  beforeEach(() => {
    inputManager = new InputManager();
    movementCallback = jest.fn();
    actionCallback = jest.fn();
    
    inputManager.setMovementCallback(movementCallback);
    inputManager.setActionCallback(actionCallback);
  });

  afterEach(() => {
    inputManager.dispose();
  });

  describe('Key State Tracking', () => {
    test('should initialize with all keys unpressed', () => {
      const keyState = inputManager.getKeyState();
      
      expect(keyState.up).toBe(false);
      expect(keyState.down).toBe(false);
      expect(keyState.left).toBe(false);
      expect(keyState.right).toBe(false);
      expect(keyState.space).toBe(false);
      expect(keyState.r).toBe(false);
      expect(keyState.m).toBe(false);
    });

    test('should track key press state correctly', () => {
      // Simulate arrow up key press
      const keyDownEvent = new MockKeyboardEvent('keydown', { code: 'ArrowUp' });
      document.dispatchEvent(keyDownEvent);
      
      expect(inputManager.isKeyPressed('up')).toBe(true);
      expect(inputManager.isKeyPressed('down')).toBe(false);
    });

    test('should track key release state correctly', () => {
      // Press and then release arrow up
      const keyDownEvent = new MockKeyboardEvent('keydown', { code: 'ArrowUp' });
      const keyUpEvent = new MockKeyboardEvent('keyup', { code: 'ArrowUp' });
      
      document.dispatchEvent(keyDownEvent);
      expect(inputManager.isKeyPressed('up')).toBe(true);
      
      document.dispatchEvent(keyUpEvent);
      expect(inputManager.isKeyPressed('up')).toBe(false);
    });

    test('should reset all key states', () => {
      // Press multiple keys
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowLeft' }));
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'Space' }));
      
      // Verify keys are pressed
      expect(inputManager.isKeyPressed('up')).toBe(true);
      expect(inputManager.isKeyPressed('left')).toBe(true);
      expect(inputManager.isKeyPressed('space')).toBe(true);
      
      // Reset and verify all keys are unpressed
      inputManager.resetKeyState();
      const keyState = inputManager.getKeyState();
      
      Object.values(keyState).forEach(pressed => {
        expect(pressed).toBe(false);
      });
    });
  });

  describe('Movement Direction Calculation', () => {
    test('should calculate correct direction for single arrow key', () => {
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      
      expect(movementCallback).toHaveBeenCalledTimes(1);
      const calledVector = movementCallback.mock.calls[0][0] as Vector2;
      expect(calledVector.x).toBe(0);
      expect(calledVector.y).toBe(-1);
    });

    test('should calculate correct direction for all arrow keys', () => {
      const testCases = [
        { key: 'ArrowUp', expectedX: 0, expectedY: -1 },
        { key: 'ArrowDown', expectedX: 0, expectedY: 1 },
        { key: 'ArrowLeft', expectedX: -1, expectedY: 0 },
        { key: 'ArrowRight', expectedX: 1, expectedY: 0 }
      ];

      testCases.forEach(({ key, expectedX, expectedY }) => {
        movementCallback.mockClear();
        document.dispatchEvent(new MockKeyboardEvent('keydown', { code: key }));
        
        expect(movementCallback).toHaveBeenCalledTimes(1);
        const calledVector = movementCallback.mock.calls[0][0] as Vector2;
        expect(calledVector.x).toBe(expectedX);
        expect(calledVector.y).toBe(expectedY);
        
        // Release key
        document.dispatchEvent(new MockKeyboardEvent('keyup', { code: key }));
      });
    });

    test('should prioritize horizontal movement when both horizontal and vertical keys are pressed', () => {
      // Press up and right simultaneously
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      movementCallback.mockClear();
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowRight' }));
      
      // Should prioritize horizontal (right) movement
      expect(movementCallback).toHaveBeenCalledTimes(1);
      const calledVector = movementCallback.mock.calls[0][0] as Vector2;
      expect(calledVector.x).toBe(1);
      expect(calledVector.y).toBe(0);
    });

    test('should update direction when keys are released', () => {
      // Press right, then up
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowRight' }));
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      
      movementCallback.mockClear();
      
      // Release right key - should now move up
      document.dispatchEvent(new MockKeyboardEvent('keyup', { code: 'ArrowRight' }));
      expect(movementCallback).toHaveBeenCalledTimes(1);
      const calledVector = movementCallback.mock.calls[0][0] as Vector2;
      expect(calledVector.x).toBe(0);
      expect(calledVector.y).toBe(-1);
    });

    test('should return zero vector when no movement keys are pressed', () => {
      // Press and release a key
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      movementCallback.mockClear();
      document.dispatchEvent(new MockKeyboardEvent('keyup', { code: 'ArrowUp' }));
      
      expect(movementCallback).toHaveBeenCalledTimes(1);
      const calledVector = movementCallback.mock.calls[0][0] as Vector2;
      expect(calledVector.x).toBe(0);
      expect(calledVector.y).toBe(0);
    });
  });

  describe('Action Key Handling', () => {
    test('should trigger pause action on space key press', () => {
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'Space' }));
      
      expect(actionCallback).toHaveBeenCalledWith('pause');
    });

    test('should trigger restart action on R key press', () => {
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'KeyR' }));
      
      expect(actionCallback).toHaveBeenCalledWith('restart');
    });

    test('should trigger mute action on M key press', () => {
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'KeyM' }));
      
      expect(actionCallback).toHaveBeenCalledWith('mute');
    });

    test('should only trigger action once per key press (not continuous)', () => {
      // Press space key
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'Space' }));
      expect(actionCallback).toHaveBeenCalledTimes(1);
      
      // Press space key again (simulating held key)
      actionCallback.mockClear();
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'Space' }));
      expect(actionCallback).not.toHaveBeenCalled();
      
      // Release and press again - should trigger
      document.dispatchEvent(new MockKeyboardEvent('keyup', { code: 'Space' }));
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'Space' }));
      expect(actionCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input Enable/Disable', () => {
    test('should be enabled by default', () => {
      expect(inputManager.isInputEnabled()).toBe(true);
    });

    test('should disable input processing when disabled', () => {
      inputManager.setEnabled(false);
      
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      
      expect(movementCallback).not.toHaveBeenCalled();
      expect(inputManager.isKeyPressed('up')).toBe(false);
    });

    test('should clear key state when disabled', () => {
      // Press a key while enabled
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      expect(inputManager.isKeyPressed('up')).toBe(true);
      
      // Disable input
      inputManager.setEnabled(false);
      expect(inputManager.isKeyPressed('up')).toBe(false);
    });

    test('should re-enable input processing when enabled', () => {
      inputManager.setEnabled(false);
      inputManager.setEnabled(true);
      
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      
      expect(movementCallback).toHaveBeenCalled();
      expect(inputManager.isKeyPressed('up')).toBe(true);
    });
  });

  describe('Callback Management', () => {
    test('should handle missing movement callback gracefully', () => {
      inputManager.setMovementCallback(null as any);
      
      expect(() => {
        document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      }).not.toThrow();
    });

    test('should handle missing action callback gracefully', () => {
      inputManager.setActionCallback(null as any);
      
      expect(() => {
        document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'Space' }));
      }).not.toThrow();
    });
  });

  describe('getCurrentMovementDirection', () => {
    test('should return current movement direction based on key state', () => {
      // No keys pressed
      let direction = inputManager.getCurrentMovementDirection();
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(0);
      
      // Press up
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      direction = inputManager.getCurrentMovementDirection();
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(-1);
      
      // Press right (should prioritize horizontal)
      document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowRight' }));
      direction = inputManager.getCurrentMovementDirection();
      expect(direction.x).toBe(1);
      expect(direction.y).toBe(0);
    });
  });

  describe('Disposal', () => {
    test('should clean up callbacks on disposal', () => {
      inputManager.dispose();
      
      // Callbacks should be cleared
      expect(() => {
        document.dispatchEvent(new MockKeyboardEvent('keydown', { code: 'ArrowUp' }));
      }).not.toThrow();
    });
  });
});