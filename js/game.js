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

  // ===== WASD MOVEMENT =====
  const keys = { w: false, a: false, s: false, d: false };
  const moveSpeed = 5;
  let lastFrameTime = 0;

  // Room boundaries
  const roomBounds = {
    medbay:         { minX: -3.3, maxX: 3.3, minZ: -4.3, maxZ: 4.3 },
    corridor:       { minX: -1.2, maxX: 1.2, minZ: 5.0, maxZ: 19.0 },
    'control-room': { minX: -4.3, maxX: 4.3, minZ: 19.0, maxZ: 31.0 },
  };

  // ===== KEYBOARD SETUP =====
  function setupKeyboard() {
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
  }

  // ===== GAME LOOP (WASD + collision) =====
  function gameLoop(time) {
    requestAnimationFrame(gameLoop);
    if (!state.controlsEnabled || !state.inGameWorld) {
      lastFrameTime = time;
      return;
    }

    const dt = Math.min((time - lastFrameTime) / 1000, 0.1);
    lastFrameTime = time;

    // Get yaw from the hold-to-look component
    const camera = document.getElementById('player-camera');
    const holdToLook = camera?.components?.['hold-to-look'];
    const yaw = holdToLook ? holdToLook.getYaw() : 0;
    const yawRad = yaw * (Math.PI / 180);

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

    // Setup keyboard + interactions
    setupKeyboard();
    setupAFrameInteractions();

    // Start game loop when scene ready
    const scene = document.getElementById('game-scene');
    scene.addEventListener('loaded', () => {
      requestAnimationFrame(gameLoop);
      console.log('[GameEngine] Scene loaded, game loop started');
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

    // Enable controls + first dialogue
    setTimeout(() => {
      enableControls();
      updateMission('EXPLORE MED BAY');

      StoryEngine.showDialogue('firstLook', () => {
        StoryEngine.showObjective('Look around the med bay. Hold left-click + drag to look. Walk to glowing objects.');
      });
    }, 1500);
  }

  // ===== ENABLE/DISABLE CONTROLS =====
  function enableControls() {
    state.controlsEnabled = true;
    // Enable the A-Frame hold-to-look component
    const camera = document.getElementById('player-camera');
    camera.setAttribute('hold-to-look', 'enabled', true);
  }

  function disableControls() {
    state.controlsEnabled = false;
    const camera = document.getElementById('player-camera');
    camera.setAttribute('hold-to-look', 'enabled', false);
  }

  // ===== A-FRAME INTERACTIONS =====
  function setupAFrameInteractions() {
    const scene = document.getElementById('game-scene');
    scene.addEventListener('loaded', () => {
      console.log('[GameEngine] Setting up interactions');

      const interactives = document.querySelectorAll('.interactive');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (StoryEngine.isDialogueActive()) return;
          const key = el.getAttribute('data-interaction');
          const interaction = InteractionSystem.getInteraction(key);
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
          const key = el.getAttribute('data-interaction');
          const interaction = InteractionSystem.getInteraction(key);
          if (interaction) {
            hideInteractionPrompt();
            document.getElementById('crosshair').classList.remove('active');
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
