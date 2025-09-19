/**
 * Basic test to verify project setup and dependencies
 */

import * as THREE from 'three';
import { Howl } from 'howler';

describe('Project Setup', () => {
  test('Three.js is available and mocked', () => {
    expect(THREE.Scene).toBeDefined();
    expect(THREE.PerspectiveCamera).toBeDefined();
    expect(THREE.WebGLRenderer).toBeDefined();
  });

  test('Howler.js is available and mocked', () => {
    expect(Howl).toBeDefined();
  });

  test('Canvas element can be found in DOM', () => {
    // Mock DOM element
    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
    const canvas = document.getElementById('gameCanvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.tagName).toBe('CANVAS');
  });
});