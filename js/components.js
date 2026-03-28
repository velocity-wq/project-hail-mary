/* ============================================
   HOLD-TO-LOOK — A-Frame Component
   Click to lock pointer (FPS-style).
   Mouse movement orbits the camera.
   Press ESC or click outside to unlock.
   ============================================ */

AFRAME.registerComponent('hold-to-look', {
  schema: {
    sensitivity: { type: 'number', default: 0.15 },
    enabled: { type: 'boolean', default: false },
  },

  init: function () {
    this.yaw = 0;
    this.pitch = 0;
    this.isLocked = false;

    // Bind methods
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onLockChange = this._onLockChange.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);

    // Bind to canvas
    const tryBind = () => {
      const canvas = this.el.sceneEl.canvas;
      if (!canvas) return false;

      canvas.addEventListener('click', this._onClick);
      canvas.addEventListener('contextmenu', this._onContextMenu);
      canvas.setAttribute('draggable', 'false');
      canvas.style.userSelect = 'none';

      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('pointerlockchange', this._onLockChange);

      console.log('[hold-to-look] Pointer lock mode ready');
      return true;
    };

    if (!tryBind()) {
      this.el.sceneEl.addEventListener('renderstart', () => tryBind());
      setTimeout(() => tryBind(), 2000);
    }
  },

  _onClick: function (e) {
    if (!this.data.enabled) return;

    // If not locked, request pointer lock
    if (!this.isLocked) {
      const canvas = this.el.sceneEl.canvas;
      if (canvas && canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    }
  },

  _onLockChange: function () {
    const canvas = this.el.sceneEl.canvas;
    this.isLocked = (document.pointerLockElement === canvas);

    if (this.isLocked) {
      canvas.style.cursor = 'none';
    } else {
      canvas.style.cursor = '';
    }
  },

  _onMouseMove: function (e) {
    if (!this.isLocked || !this.data.enabled) return;

    const dx = e.movementX || 0;
    const dy = e.movementY || 0;

    this.yaw -= dx * this.data.sensitivity;
    this.pitch -= dy * this.data.sensitivity;
    this.pitch = Math.max(-85, Math.min(85, this.pitch));
  },

  _onContextMenu: function (e) { e.preventDefault(); },

  tick: function () {
    if (!this.data.enabled) return;

    const pitchRad = this.pitch * (Math.PI / 180);
    const yawRad = this.yaw * (Math.PI / 180);

    this.el.object3D.rotation.set(pitchRad, yawRad, 0);
    this.el.object3D.rotation.order = 'YXZ';
  },

  getYaw: function () {
    return this.yaw;
  },

  remove: function () {
    const canvas = this.el.sceneEl.canvas;
    if (canvas) {
      canvas.removeEventListener('click', this._onClick);
      canvas.removeEventListener('contextmenu', this._onContextMenu);
    }
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onLockChange);
  },
});
