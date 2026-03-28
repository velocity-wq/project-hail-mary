/* ============================================
   HOLD-TO-LOOK — A-Frame Component
   Registers BEFORE the scene loads.
   Hold left-click + drag to orbit the camera.
   This is the canonical A-Frame way to add
   custom camera controls.
   ============================================ */

AFRAME.registerComponent('hold-to-look', {
  schema: {
    sensitivity: { type: 'number', default: 0.2 },
    enabled: { type: 'boolean', default: false },
  },

  init: function () {
    this.yaw = 0;
    this.pitch = 0;
    this.isHolding = false;
    this.prevX = 0;
    this.prevY = 0;

    // Bind methods
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onDragStart = this._onDragStart.bind(this);

    // Bind to canvas — try immediately, then fallback to renderstart
    const tryBind = () => {
      const canvas = this.el.sceneEl.canvas;
      if (!canvas) return false;

      canvas.addEventListener('mousedown', this._onMouseDown);
      canvas.addEventListener('contextmenu', this._onContextMenu);
      canvas.addEventListener('dragstart', this._onDragStart);
      canvas.setAttribute('draggable', 'false');
      canvas.style.userSelect = 'none';

      // mousemove/mouseup on window so dragging outside canvas still works
      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('mouseup', this._onMouseUp);

      console.log('[hold-to-look] Bound to canvas successfully');
      return true;
    };

    // Try immediate binding
    if (!tryBind()) {
      // Canvas not ready yet — wait for renderstart
      this.el.sceneEl.addEventListener('renderstart', () => tryBind());
      // Absolute fallback
      setTimeout(() => tryBind(), 2000);
    }
  },

  _onMouseDown: function (e) {
    if (!this.data.enabled) return;
    if (e.button !== 0) return; // left click only

    this.isHolding = true;
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    e.preventDefault();

    // Visual feedback
    this.el.sceneEl.canvas.style.cursor = 'grabbing';
  },

  _onMouseMove: function (e) {
    if (!this.isHolding || !this.data.enabled) return;

    const dx = e.clientX - this.prevX;
    const dy = e.clientY - this.prevY;
    this.prevX = e.clientX;
    this.prevY = e.clientY;

    this.yaw -= dx * this.data.sensitivity;
    this.pitch -= dy * this.data.sensitivity;
    this.pitch = Math.max(-85, Math.min(85, this.pitch));
  },

  _onMouseUp: function () {
    this.isHolding = false;
    if (this.el.sceneEl.canvas) {
      this.el.sceneEl.canvas.style.cursor = '';
    }
  },

  _onContextMenu: function (e) { e.preventDefault(); },
  _onDragStart: function (e) { e.preventDefault(); },

  // tick() runs every frame as part of A-Frame's render loop.
  // We directly set the Three.js rotation — this CANNOT be overridden
  // by any other A-Frame system.
  tick: function () {
    if (!this.data.enabled) return;

    const pitchRad = this.pitch * (Math.PI / 180);
    const yawRad = this.yaw * (Math.PI / 180);

    this.el.object3D.rotation.set(pitchRad, yawRad, 0);
    this.el.object3D.rotation.order = 'YXZ';
  },

  // Expose yaw for movement calculations
  getYaw: function () {
    return this.yaw;
  },

  remove: function () {
    const canvas = this.el.sceneEl.canvas;
    if (canvas) {
      canvas.removeEventListener('mousedown', this._onMouseDown);
      canvas.removeEventListener('contextmenu', this._onContextMenu);
      canvas.removeEventListener('dragstart', this._onDragStart);
    }
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
  },
});
