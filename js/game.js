/* ============================================
   GAME ENGINE
   Core game loop, camera control, state management,
   room transitions, and A-Frame integration.
   Uses Gemini's inline camera + hasDragged pattern
   merged with our full 5-room game.
   ============================================ */

const GameEngine = (() => {
  // ===== GAME STATE =====
  const state = {
    started: false,
    currentRoom: 'medbay',
    controlsEnabled: false,
    inGameWorld: false,
  };

  const roomConfig = {
    medbay:         { position: { x: 0, y: 0, z: 2 }, label: 'MED BAY' },
    corridor:       { position: { x: 0, y: 0, z: 8 }, label: 'CORRIDOR' },
    'control-room': { position: { x: 0, y: 0, z: 22 }, label: 'CONTROL ROOM' },
    laboratory:     { position: { x: 0, y: 0, z: 36 }, label: 'LABORATORY' },
    airlock:        { position: { x: 0, y: 0, z: 50 }, label: 'AIRLOCK' },
  };

  const roomBounds = {
    medbay:         { minX: -3.3, maxX: 3.3, minZ: -4.3, maxZ: 4.3 },
    corridor:       { minX: -1.2, maxX: 1.2, minZ: 5.0, maxZ: 19.0 },
    'control-room': { minX: -4.3, maxX: 4.3, minZ: 19.0, maxZ: 31.0 },
    laboratory:     { minX: -3.8, maxX: 3.8, minZ: 35.5, maxZ: 44.5 },
    airlock:        { minX: -2.3, maxX: 2.3, minZ: 50.5, maxZ: 57.5 },
  };

  // ===== INLINE CAMERA CONTROL (from Gemini) =====
  let isLooking = false, hasDragged = false;
  let cameraYaw = 0, cameraPitch = 0;
  let lastMouseX = 0, lastMouseY = 0;

  // ===== WASD MOVEMENT =====
  const keys = { w: false, a: false, s: false, d: false };
  const moveSpeed = 5;
  let lastFrameTime = 0, loopRunning = false;

  // ===== UNIFIED MOUSE/KEYBOARD CONTROLS (Gemini pattern) =====
  function setupControls() {
    // --- MOUSE DOWN: route to cutscene skip / dialogue advance / look start ---
    document.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only

      // If cutscene playing, skip it
      if (StoryEngine.isCutsceneActive()) { StoryEngine.skipCutscene(); return; }
      // If dialogue showing, advance it
      if (StoryEngine.isDialogueActive()) { StoryEngine.advanceDialogue(); return; }
      // If game not started, start it
      if (!state.started) { startGame(); return; }

      if (!state.inGameWorld || !state.controlsEnabled) return;

      // Don't start looking if clicking on a UI element
      const isUI = e.target.closest('.puzzle-ui, .dialogue-box, .objective-popup, .btn-glow');
      if (isUI) return;

      e.preventDefault();
      isLooking = true; hasDragged = false;
      lastMouseX = e.clientX; lastMouseY = e.clientY;
      document.body.classList.add('is-looking');
    });

    // --- MOUSE UP: stop looking ---
    document.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return;
      isLooking = false;
      document.body.classList.remove('is-looking');
    });

    document.addEventListener('mouseleave', () => {
      isLooking = false;
      document.body.classList.remove('is-looking');
    });

    // --- MOUSE MOVE: rotate camera when holding ---
    document.addEventListener('mousemove', (e) => {
      if (!isLooking || !state.controlsEnabled) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;

      // Only count as drag if moved significantly
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      cameraYaw -= dx * 0.3;
      cameraPitch -= dy * 0.3;
      cameraPitch = Math.max(-85, Math.min(85, cameraPitch));

      const camera = document.getElementById('player-camera');
      if (camera && camera.object3D) {
        camera.object3D.rotation.order = 'YXZ';
        camera.object3D.rotation.x = THREE.MathUtils.degToRad(cameraPitch);
        camera.object3D.rotation.y = THREE.MathUtils.degToRad(cameraYaw);
      }
    });

    // Prevent right-click context menu in game
    document.addEventListener('contextmenu', e => { if (state.inGameWorld) e.preventDefault(); });

    // --- KEYBOARD ---
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key] = true;

      // FIX: Block keyboard auto-repeat (prevents spacebar spam bug)
      if (e.repeat) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (StoryEngine.isCutsceneActive()) StoryEngine.skipCutscene();
        else if (StoryEngine.isDialogueActive()) StoryEngine.advanceDialogue();
        else if (!state.started) startGame();
      }
    });

    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key] = false;
    });
  }

  // ===== GAME LOOP =====
  function gameLoop(time) {
    requestAnimationFrame(gameLoop);

    // Lock movement during UI/cutscenes
    if (!state.controlsEnabled || !state.inGameWorld ||
        StoryEngine.isDialogueActive() || StoryEngine.isCutsceneActive()) {
      lastFrameTime = time;
      return;
    }

    const dt = Math.min((time - lastFrameTime) / 1000, 0.1);
    lastFrameTime = time;

    // Calculate movement direction relative to camera yaw
    const yawRad = cameraYaw * (Math.PI / 180);
    let moveX = 0, moveZ = 0;

    if (keys.w) { moveX -= Math.sin(yawRad); moveZ -= Math.cos(yawRad); }
    if (keys.s) { moveX += Math.sin(yawRad); moveZ += Math.cos(yawRad); }
    if (keys.a) { moveX -= Math.cos(yawRad); moveZ += Math.sin(yawRad); }
    if (keys.d) { moveX += Math.cos(yawRad); moveZ -= Math.sin(yawRad); }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len === 0) return;

    moveX = (moveX / len) * moveSpeed * dt;
    moveZ = (moveZ / len) * moveSpeed * dt;

    const cameraRig = document.getElementById('camera-rig');
    if (!cameraRig) return;

    const pos = cameraRig.getAttribute('position');
    let newX = pos.x + moveX;
    let newZ = pos.z + moveZ;

    // Clamp to room boundaries
    const bounds = roomBounds[state.currentRoom];
    if (bounds) {
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
    }

    cameraRig.setAttribute('position', { x: newX, y: pos.y, z: newZ });
  }

  // ===== INITIALIZATION =====
  function init() {
    setupControls();

    const scene = document.getElementById('game-scene');

    function onLoaded() {
      const camera = document.getElementById('player-camera');
      // Remove A-Frame's built-in controls that clash with our custom camera
      camera.removeAttribute('look-controls');
      camera.removeAttribute('wasd-controls');

      if (!loopRunning) { loopRunning = true; requestAnimationFrame(gameLoop); }

      // Setup interaction detection using cursor events (handles child mesh hits)
      const cursorEl = document.querySelector('[cursor]');
      let currentHoveredInteractive = null;

      cursorEl.addEventListener('raycaster-intersection', (evt) => {
        if (StoryEngine.isDialogueActive() || StoryEngine.isCutsceneActive()) return;
        // Find the .interactive ancestor of the hit element
        const hitEl = evt.detail.els[0];
        const interactive = hitEl.closest ? hitEl.closest('.interactive') : 
          (hitEl.classList && hitEl.classList.contains('interactive') ? hitEl : hitEl.parentEl && hitEl.parentEl.closest('.interactive'));
        
        if (!interactive) return;
        currentHoveredInteractive = interactive;
        const interaction = InteractionSystem.getInteraction(interactive.getAttribute('data-interaction'));
        if (interaction) {
          document.getElementById('prompt-text').textContent = interaction.prompt;
          document.getElementById('interaction-prompt').classList.remove('hidden');
          document.getElementById('crosshair').classList.add('active');
        }
      });

      cursorEl.addEventListener('raycaster-intersection-cleared', () => {
        currentHoveredInteractive = null;
        document.getElementById('interaction-prompt').classList.add('hidden');
        document.getElementById('crosshair').classList.remove('active');
      });

      // Click handler — uses whatever the crosshair is currently pointing at
      document.querySelector('.a-canvas').addEventListener('click', () => {
        if (hasDragged || !currentHoveredInteractive) return;
        if (StoryEngine.isDialogueActive() || StoryEngine.isCutsceneActive()) return;

        const el = currentHoveredInteractive;
        const interaction = InteractionSystem.getInteraction(el.getAttribute('data-interaction'));
        if (interaction) {
          document.getElementById('interaction-prompt').classList.add('hidden');
          document.getElementById('crosshair').classList.remove('active');

          // Remove pulse animation from clicked object
          const targets = el.childElementCount > 0 ? Array.from(el.children) : [el];
          targets.forEach(child => {
            if (child.hasAttribute && child.hasAttribute('animation__pulse')) child.removeAttribute('animation__pulse');
            if (child.setAttribute) child.setAttribute('material', 'opacity', 1);
          });

          currentHoveredInteractive = null;
          StoryEngine.showDialogue(interaction.dialogue, interaction.onComplete);
        }
      });

      console.log('[GameEngine] Scene loaded, interactions ready');
    }

    if (scene.hasLoaded) onLoaded();
    else scene.addEventListener('loaded', onLoaded);

    console.log('[GameEngine] Initialized');
  }

  // ===== START GAME (now delegates EVERYTHING to startFullIntro) =====
  function startGame() {
    if (state.started) return;
    state.started = true;
    // The entire intro + wakeup is now ONE unified async flow
    StoryEngine.startFullIntro(() => enterGameWorld());
  }

  // ===== ENTER 3D WORLD =====
  function enterGameWorld() {
    if (state.inGameWorld) return; // Guard against double-entry
    state.inGameWorld = true;
    document.body.classList.add('in-game');

    document.getElementById('camera-rig').setAttribute('position', '0 0 -1');

    setTimeout(() => document.getElementById('hud').classList.remove('hidden'), 500);

    setTimeout(() => {
      state.controlsEnabled = true;
      updateMission('EXPLORE MED BAY');

      StoryEngine.showDialogue('firstLook', () => {
        StoryEngine.showObjective('Look around the med bay. Walk to the glowing objects and CLICK them to examine.');

        // Add pulsing glow animation to all interactive objects (Gemini's approach)
        document.querySelectorAll('.interactive').forEach(el => {
          const targets = el.childElementCount > 0 ? Array.from(el.children) : [el];
          targets.forEach(child => {
            if (['A-BOX', 'A-PLANE', 'A-CYLINDER'].includes(child.tagName)) {
              let mat = child.getAttribute('material') || {};
              if (typeof mat === 'string') child.setAttribute('material', mat + '; transparent: true');
              else child.setAttribute('material', 'transparent', true);
              child.setAttribute('animation__pulse', 'property: material.opacity; from: 1; to: 0.4; dur: 1000; dir: alternate; loop: true; easing: easeInOutSine');
            }
          });
        });
      });
    }, 1500);
  }

  // ===== ROOM TRANSITIONS =====
  function moveToRoom(roomId) {
    const config = roomConfig[roomId];
    if (!config) return;

    state.controlsEnabled = false;

    // Make target room visible
    const roomEl = document.getElementById(roomId);
    if (roomEl) roomEl.setAttribute('visible', 'true');

    // Screen transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'screen-transition';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    setTimeout(() => {
      // Hide previous room (Gemini's optimization)
      if (state.currentRoom && state.currentRoom !== roomId) {
        const prevRoom = document.getElementById(state.currentRoom);
        if (prevRoom) prevRoom.setAttribute('visible', 'false');
      }

      document.getElementById('camera-rig').setAttribute('position',
        `${config.position.x} ${config.position.y} ${config.position.z}`);
      document.getElementById('hud-location-text').textContent = config.label;
      state.currentRoom = roomId;

      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.remove();
          state.controlsEnabled = true;
        }, 600);
      }, 500);
    }, 600);
  }

  function updateMission(text) {
    document.getElementById('hud-mission-text').textContent = text;
  }

  // ===== PUZZLE UI HELPERS =====
  function openPuzzleUI(uiId) {
    state.controlsEnabled = false;
    document.getElementById(uiId).classList.remove('hidden');
    document.body.classList.remove('in-game');
  }

  function closePuzzleUI(uiId) {
    document.getElementById(uiId).classList.add('hidden');
    document.body.classList.add('in-game');
    state.controlsEnabled = true;
  }

  // ===== HAZARD MODE =====
  function toggleHazardMode(enable) {
    const hazardLight = document.getElementById('hazard-light');
    const globalAmbient = document.getElementById('global-ambient');
    const hudTop = document.querySelector('.hud-top');

    if (enable) {
      if (hazardLight) {
        hazardLight.setAttribute('visible', 'true');
        hazardLight.setAttribute('intensity', '1.0');
        hazardLight.setAttribute('animation__hazardpulse', {
          property: 'intensity', from: 0.5, to: 1.5,
          dur: 1000, dir: 'alternate', loop: true,
        });
      }
      if (globalAmbient) globalAmbient.setAttribute('intensity', '0.2');
      if (hudTop) hudTop.style.color = 'var(--red)';
      const missionVal = document.querySelector('.hud-mission .hud-value');
      if (missionVal) { missionVal.style.color = 'var(--red)'; missionVal.classList.add('warning-text'); }
    } else {
      if (hazardLight) { hazardLight.setAttribute('visible', 'false'); hazardLight.removeAttribute('animation__hazardpulse'); }
      if (globalAmbient) globalAmbient.setAttribute('intensity', '1.2');
      if (hudTop) hudTop.style.color = '';
      const missionVal = document.querySelector('.hud-mission .hud-value');
      if (missionVal) { missionVal.classList.remove('warning-text'); missionVal.style.color = 'var(--orange)'; }
    }
  }

  // ===== EMERGENCY TIMER =====
  let emergencyTimerInterval = null;

  function startEmergencyTimer(seconds, callback) {
    let timerEl = document.getElementById('emergency-timer');
    if (!timerEl) {
      timerEl = document.createElement('div');
      timerEl.id = 'emergency-timer';
      timerEl.className = 'emergency-timer';
      document.body.appendChild(timerEl);
    }
    timerEl.style.display = 'block';
    let remaining = seconds;
    timerEl.textContent = `⚠ ${remaining}s REMAINING`;

    emergencyTimerInterval = setInterval(() => {
      remaining--;
      timerEl.textContent = `⚠ ${remaining}s REMAINING`;
      if (remaining <= 10) timerEl.classList.add('critical');
      if (remaining <= 0) {
        clearInterval(emergencyTimerInterval);
        timerEl.style.display = 'none';
        if (callback) callback();
      }
    }, 1000);
  }

  return {
    init, startGame, moveToRoom, updateMission,
    enableControls: () => { state.controlsEnabled = true; },
    disableControls: () => { state.controlsEnabled = false; },
    openPuzzleUI, closePuzzleUI, toggleHazardMode, startEmergencyTimer,
  };
})();

document.addEventListener('DOMContentLoaded', GameEngine.init);
