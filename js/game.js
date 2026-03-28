/* ============================================
   GAME ENGINE
   Core game loop, state management,
   room transitions, and A-Frame integration
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
    medbay: {
      position: { x: 0, y: 0, z: 2 },
      label: 'MED BAY',
    },
    corridor: {
      position: { x: 0, y: 0, z: 8 },
      label: 'CORRIDOR',
    },
    'control-room': {
      position: { x: 0, y: 0, z: 22 },
      label: 'CONTROL ROOM',
    },
  };

  // ===== CAMERA (hold-to-look) =====
  let isLooking = false;
  let lookSensitivity = 0.3;
  let cameraYaw = 0;
  let cameraPitch = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;

  // ===== WASD =====
  const keys = { w: false, a: false, s: false, d: false };
  const moveSpeed = 5;
  let lastFrameTime = 0;

  // Room boundaries
  const roomBounds = {
    medbay:         { minX: -3.3, maxX: 3.3, minZ: -4.3, maxZ: 4.3 },
    corridor:       { minX: -1.2, maxX: 1.2, minZ: 5.0, maxZ: 19.0 },
    'control-room': { minX: -4.3, maxX: 4.3, minZ: 19.0, maxZ: 31.0 },
  };

  // ===== SETUP CONTROLS =====
  function setupControls() {
    // ---- HOLD-TO-LOOK: listen on DOCUMENT, not canvas ----
    // This avoids A-Frame's canvas event interception
    document.addEventListener('mousedown', (e) => {
      // Don't look during UI interactions
      if (!state.inGameWorld) return;
      if (StoryEngine.isDialogueActive()) return;

      // Don't look when clicking on UI overlays
      const isUI = e.target.closest('#dialogue-box, #intro-screen, #wakeup-screen, #flashback-overlay, #objective-popup, .btn-glow');
      if (isUI) return;

      e.preventDefault();
      isLooking = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      document.body.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseup', () => {
      isLooking = false;
      document.body.style.cursor = '';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isLooking || !state.controlsEnabled) return;

      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      cameraYaw -= dx * lookSensitivity;
      cameraPitch -= dy * lookSensitivity;
      cameraPitch = Math.max(-85, Math.min(85, cameraPitch));

      const camera = document.getElementById('player-camera');
      if (camera) {
        camera.setAttribute('rotation', { x: cameraPitch, y: cameraYaw, z: 0 });
      }
    });

    // Prevent context menu
    document.addEventListener('contextmenu', (e) => {
      if (state.inGameWorld) e.preventDefault();
    });

    // Prevent drag on canvas
    const scene = document.getElementById('game-scene');
    scene.addEventListener('loaded', () => {
      const canvas = scene.canvas;
      if (canvas) {
        canvas.addEventListener('dragstart', (e) => e.preventDefault());
        canvas.setAttribute('draggable', 'false');
      }
    });

    // ---- KEYBOARD ----
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key] = true;

      // Space/Enter: advance dialogue OR skip wakeup
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (StoryEngine.isDialogueActive()) {
          StoryEngine.advanceDialogue();
        } else if (StoryEngine.isWakeupActive()) {
          StoryEngine.skipCurrentWakeupStep();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key] = false;
    });

    console.log('[GameEngine] Controls initialized');
  }

  // ===== GAME LOOP =====
  function gameLoop(time) {
    requestAnimationFrame(gameLoop);
    if (!state.controlsEnabled || !state.inGameWorld) {
      lastFrameTime = time;
      return;
    }

    const dt = Math.min((time - lastFrameTime) / 1000, 0.1);
    lastFrameTime = time;

    const yawRad = cameraYaw * (Math.PI / 180);
    let moveX = 0, moveZ = 0;

    if (keys.w) { moveX -= Math.sin(yawRad); moveZ -= Math.cos(yawRad); }
    if (keys.s) { moveX += Math.sin(yawRad); moveZ += Math.cos(yawRad); }
    if (keys.a) { moveX -= Math.cos(yawRad); moveZ += Math.sin(yawRad); }
    if (keys.d) { moveX += Math.cos(yawRad); moveZ -= Math.sin(yawRad); }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX = (moveX / len) * moveSpeed * dt;
      moveZ = (moveZ / len) * moveSpeed * dt;
    } else {
      return;
    }

    const cameraRig = document.getElementById('camera-rig');
    if (!cameraRig) return;

    const pos = cameraRig.getAttribute('position');
    let newX = pos.x + moveX;
    let newZ = pos.z + moveZ;

    const bounds = roomBounds[state.currentRoom];
    if (bounds) {
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
    }

    cameraRig.setAttribute('position', { x: newX, y: pos.y, z: newZ });
  }

  // ===== INITIALIZATION =====
  function init() {
    // Start button
    document.getElementById('btn-start').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startGame();
    });

    // Dialogue click
    document.getElementById('dialogue-box').addEventListener('click', (e) => {
      e.stopPropagation();
      StoryEngine.advanceDialogue();
    });

    // Wakeup screen click = skip current step
    document.getElementById('wakeup-screen').addEventListener('click', () => {
      if (StoryEngine.isWakeupActive()) {
        StoryEngine.skipCurrentWakeupStep();
      }
    });

    // Setup controls & interactions
    setupControls();
    setupAFrameInteractions();

    // Start game loop when scene ready
    const scene = document.getElementById('game-scene');
    scene.addEventListener('loaded', () => {
      const camera = document.getElementById('player-camera');
      camera.setAttribute('look-controls', 'enabled', false);
      camera.setAttribute('wasd-controls', 'enabled', false);
      requestAnimationFrame(gameLoop);
    });

    console.log('[GameEngine] Initialized');
  }

  // ===== START GAME =====
  function startGame() {
    if (state.started) return;
    state.started = true;

    const introScreen = document.getElementById('intro-screen');
    introScreen.style.transition = 'opacity 1.5s ease';
    introScreen.style.opacity = '0';

    setTimeout(() => {
      introScreen.classList.remove('active');
      introScreen.style.display = 'none';
      StoryEngine.playWakeupSequence(() => enterGameWorld());
    }, 1500);
  }

  // ===== ENTER 3D WORLD =====
  function enterGameWorld() {
    state.inGameWorld = true;
    document.body.classList.add('in-game');

    const wakeup = document.getElementById('wakeup-screen');
    wakeup.classList.remove('active');
    wakeup.style.display = 'none';

    // Position camera
    document.getElementById('camera-rig').setAttribute('position', '0 0 -1');

    // Show HUD
    setTimeout(() => {
      document.getElementById('hud').classList.remove('hidden');
    }, 500);

    // Enable controls + show first dialogue
    setTimeout(() => {
      state.controlsEnabled = true;

      // Update mission status from UNKNOWN
      updateMission('EXPLORE MED BAY');

      StoryEngine.showDialogue('firstLook', () => {
        StoryEngine.showObjective('Look around the med bay. Walk to the glowing objects to examine them.');
        // Pulse interactive objects to draw attention
        pulseInteractives();
      });
    }, 1500);
  }

  // ===== PULSE INTERACTIVE OBJECTS =====
  function pulseInteractives() {
    const interactives = document.querySelectorAll('.interactive');
    interactives.forEach(el => {
      // Add a glow animation component
      const origColor = el.getAttribute('material')?.color || '#ffffff';
      el.setAttribute('animation__pulse', {
        property: 'material.opacity',
        from: 1,
        to: 0.5,
        dur: 1000,
        dir: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      });
    });
  }

  // ===== CONTROLS =====
  function enableControls() {
    state.controlsEnabled = true;
  }

  function disableControls() {
    state.controlsEnabled = false;
  }

  // ===== A-FRAME INTERACTIONS =====
  function setupAFrameInteractions() {
    const scene = document.getElementById('game-scene');
    scene.addEventListener('loaded', () => {
      console.log('[GameEngine] A-Frame scene loaded');

      const interactives = document.querySelectorAll('.interactive');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (StoryEngine.isDialogueActive()) return;
          const interactionKey = el.getAttribute('data-interaction');
          const interaction = InteractionSystem.getInteraction(interactionKey);
          if (interaction) {
            showInteractionPrompt(interaction.prompt);
            document.getElementById('crosshair').classList.add('active');
          }
        });

        el.addEventListener('mouseleave', () => {
          hideInteractionPrompt();
          document.getElementById('crosshair').classList.remove('active');
        });

        el.addEventListener('click', () => {
          if (StoryEngine.isDialogueActive()) return;
          const interactionKey = el.getAttribute('data-interaction');
          const interaction = InteractionSystem.getInteraction(interactionKey);
          if (interaction) {
            hideInteractionPrompt();
            document.getElementById('crosshair').classList.remove('active');
            // Stop pulsing after first interaction
            el.removeAttribute('animation__pulse');
            el.setAttribute('material', 'opacity', 1);
            StoryEngine.showDialogue(interaction.dialogue, interaction.onComplete);
          }
        });
      });
    });
  }

  function showInteractionPrompt(text) {
    const prompt = document.getElementById('interaction-prompt');
    document.getElementById('prompt-text').textContent = text;
    prompt.classList.remove('hidden');
  }

  function hideInteractionPrompt() {
    document.getElementById('interaction-prompt').classList.add('hidden');
  }

  // ===== ROOM TRANSITIONS =====
  function moveToRoom(roomId) {
    const config = roomConfig[roomId];
    if (!config) return;

    disableControls();

    const roomEl = document.getElementById(roomId);
    if (roomEl) roomEl.setAttribute('visible', 'true');

    const overlay = document.createElement('div');
    overlay.className = 'screen-transition';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    setTimeout(() => {
      document.getElementById('camera-rig').setAttribute('position',
        `${config.position.x} ${config.position.y} ${config.position.z}`);
      document.getElementById('hud-location-text').textContent = config.label;
      state.currentRoom = roomId;

      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.remove();
          enableControls();
        }, 600);
      }, 500);
    }, 600);
  }

  function updateMission(text) {
    document.getElementById('hud-mission-text').textContent = text;
  }

  return {
    init,
    startGame,
    moveToRoom,
    updateMission,
    enableControls,
    disableControls,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  GameEngine.init();
});
