/**
 * Jest setup file for testing configuration
 */

// Mock Three.js for testing
jest.mock('three', () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    traverse: jest.fn(),
  })),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  Vector3: jest.fn((x = 0, y = 0, z = 0) => {
    const vector = {
      set: jest.fn((newX, newY, newZ) => {
        vector.x = newX;
        vector.y = newY;
        vector.z = newZ;
        return vector;
      }),
      copy: jest.fn((other) => {
        vector.x = other.x;
        vector.y = other.y;
        vector.z = other.z;
        return vector;
      }),
      clone: jest.fn(() => {
        const cloned = {
          x: vector.x,
          y: vector.y,
          z: vector.z,
          set: jest.fn(),
          copy: jest.fn(),
          clone: jest.fn(),
          addVectors: jest.fn(),
          subVectors: jest.fn(),
          multiplyScalar: jest.fn((scalar) => {
            cloned.x *= scalar;
            cloned.y *= scalar;
            cloned.z *= scalar;
            return cloned;
          }),
          normalize: jest.fn(),
        };
        return cloned;
      }),
      addVectors: jest.fn((a, b) => {
        vector.x = a.x + b.x;
        vector.y = a.y + b.y;
        vector.z = a.z + b.z;
        return vector;
      }),
      subVectors: jest.fn((a, b) => {
        vector.x = a.x - b.x;
        vector.y = a.y - b.y;
        vector.z = a.z - b.z;
        return vector;
      }),
      multiplyScalar: jest.fn((scalar) => {
        vector.x *= scalar;
        vector.y *= scalar;
        vector.z *= scalar;
        return vector;
      }),
      normalize: jest.fn(() => {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        if (length > 0) {
          vector.x /= length;
          vector.y /= length;
          vector.z /= length;
        }
        return vector;
      }),
      x: x,
      y: y,
      z: z,
    };
    return vector;
  }),
  Vector2: jest.fn((x = 0, y = 0) => {
    const vector = {
      set: jest.fn(),
      copy: jest.fn((other) => {
        vector.x = other.x;
        vector.y = other.y;
        return vector;
      }),
      clone: jest.fn(() => ({ 
        x: vector.x, 
        y: vector.y,
        clone: jest.fn(() => ({ x: vector.x, y: vector.y })),
        copy: jest.fn(),
        set: jest.fn(),
        add: jest.fn(),
        equals: jest.fn(() => false),
        multiplyScalar: jest.fn(),
      })),
      add: jest.fn(),
      equals: jest.fn(() => false),
      lerpVectors: jest.fn(),
      multiplyScalar: jest.fn(),
      x: x,
      y: y,
    };
    return vector;
  }),
  BoxGeometry: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  SphereGeometry: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  ConeGeometry: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  MeshBasicMaterial: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  MeshLambertMaterial: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn(), copy: jest.fn() },
    rotation: { setFromVector3: jest.fn(), x: 0, y: 0, z: 0 },
    scale: { copy: jest.fn() },
    add: jest.fn(),
    geometry: { dispose: jest.fn() },
    material: { dispose: jest.fn() },
    castShadow: false,
    receiveShadow: false,
    visible: true,
  })),
}));

// Mock Howler.js for testing
jest.mock('howler', () => ({
  Howl: jest.fn(),
  Howler: {
    volume: jest.fn(),
    mute: jest.fn(),
  },
}));
