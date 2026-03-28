/* ============================================
   INTERACTION SYSTEM
   Handles player interactions with 3D objects,
   puzzle UI logic, and game progression flags
   ============================================ */

const InteractionSystem = (() => {
  const interacted = new Set();

  // Game state flags for plot progression
  const flags = {
    gravityChecked: false,
    astrophageAnalyzed: false,
    radarChecked: false,
    wallBuilt: false,
    translated: false,
    hazardTriggered: false,
    emergencyComplete: false,
  };

  const interactions = {
    // === PHASE 1: MED BAY ===
    crew1: {
      prompt: 'Examine Commander Yáo',
      dialogue: 'crew1',
      onComplete: () => {
        interacted.add('crew1');
        checkDiscoveries();
      },
    },
    crew2: {
      prompt: 'Examine Engineer Ilyukhina',
      dialogue: 'crew2',
      onComplete: () => {
        interacted.add('crew2');
        checkDiscoveries();
      },
    },

    // Gravity puzzle — pen drop
    gravity: {
      prompt: 'Pick up medical pen',
      dialogue: 'gravity_start',
      onComplete: () => {
        if (!flags.gravityChecked) {
          GameEngine.openPuzzleUI('ui-gravity');
        }
      },
    },

    // Personal locker — photo → classroom flashback
    photo: {
      prompt: 'Open personal locker',
      dialogue: null,
      onComplete: () => {
        interacted.add('photo');
        if (!interacted.has('flashback-classroom')) {
          interacted.add('flashback-classroom');
          StoryEngine.playFlashback('classroom', () => {
            StoryEngine.showObjective('Explore the med bay. Check the monitors and terminals.');
          });
        }
      },
    },

    monitor: {
      prompt: 'Read medical monitor',
      dialogue: 'monitor',
      onComplete: () => {
        interacted.add('monitor');
        checkDiscoveries();
      },
    },

    terminal: {
      prompt: 'Access ship terminal',
      dialogue: 'terminal',
      onComplete: () => {
        interacted.add('terminal');
        checkDiscoveries();
        if (!interacted.has('flashback-astrophage')) {
          interacted.add('flashback-astrophage');
          setTimeout(() => {
            StoryEngine.playFlashback('astrophage', () => {
              StoryEngine.showObjective('Find the control room — head through the door');
              GameEngine.updateMission('FIND CONTROL ROOM');
            });
          }, 1000);
        }
      },
    },

    'door-corridor': {
      prompt: 'Enter corridor',
      dialogue: 'door-corridor',
      onComplete: () => GameEngine.moveToRoom('corridor'),
    },
    'door-control': {
      prompt: 'Enter control room',
      dialogue: 'door-control',
      onComplete: () => {
        GameEngine.moveToRoom('control-room');
        StoryEngine.showObjective('Check the navigation console and viewport');
      },
    },

    // === PHASE 2: CONTROL ROOM & LAB ===
    viewport: {
      prompt: 'Look through viewport',
      dialogue: 'viewport',
      onComplete: () => {
        interacted.add('viewport');
      },
    },
    'nav-console': {
      prompt: 'Access navigation console',
      dialogue: 'nav-console',
      onComplete: () => {
        // After translation + Taumoeba → trigger endgame
        if (!flags.hazardTriggered && flags.translated) {
          triggerHazardMode();
          return;
        }

        if (!interacted.has('nav-console')) {
          interacted.add('nav-console');
          GameEngine.updateMission('INVESTIGATE ASTROPHAGE');
          StoryEngine.showObjective('Anomalous object detected — find the Laboratory door');
        }
      },
    },
    'door-lab': {
      prompt: 'Enter Laboratory',
      dialogue: 'door-lab',
      onComplete: () => {
        GameEngine.moveToRoom('laboratory');
        StoryEngine.showObjective('Use the microscope to analyze the Astrophage sample');
      },
    },

    // === PHASE 2: LABORATORY ===
    microscope: {
      prompt: 'Use Microscope & Spectrometer',
      dialogue: 'microscope_intro',
      onComplete: () => {
        if (!flags.astrophageAnalyzed) {
          GameEngine.openPuzzleUI('ui-microscope');
        } else {
          StoryEngine.showObjective('Already analyzed. Continue exploring.');
        }
      },
    },
    'door-airlock': {
      prompt: 'Enter Airlock',
      dialogue: 'door-airlock',
      onComplete: () => {
        if (flags.radarChecked) {
          GameEngine.moveToRoom('airlock');
          StoryEngine.showObjective('Find materials to build a divider wall');
        } else {
          StoryEngine.showObjective('The airlock is sealed. You need a reason to enter.');
        }
      },
    },

    // === PHASE 3: RADAR & AIRLOCK ===
    radar: {
      prompt: 'Check Proximity Radar',
      dialogue: 'radar_contact',
      onComplete: () => {
        GameEngine.openPuzzleUI('ui-radar');
      },
    },
    xenonite: {
      prompt: 'Build Xenonite Divider Wall',
      dialogue: 'wall_building',
      onComplete: () => {
        flags.wallBuilt = true;
        const wall = document.getElementById('xenonite-wall');
        if (wall) wall.setAttribute('visible', 'true');
        const panels = document.getElementById('xenonite-panels');
        if (panels) panels.setAttribute('visible', 'false');

        // Training flashback → Rocky appears
        setTimeout(() => {
          StoryEngine.playFlashback('training', () => {
            const rocky = document.getElementById('rocky-silhouette');
            if (rocky) rocky.setAttribute('visible', 'true');
            StoryEngine.showDialogue('rocky_arrival', () => {
              StoryEngine.showObjective('Communicate with the alien — click on the silhouette');
              GameEngine.updateMission('FIRST CONTACT');
            });
          });
        }, 1000);
      },
    },

    // === PHASE 4: ROCKY ===
    rocky: {
      prompt: 'Communicate with Rocky',
      dialogue: null,
      onComplete: () => {
        if (!flags.translated) {
          GameEngine.openPuzzleUI('ui-translation');
        } else {
          StoryEngine.showDialogue('taumoeba_discovery', () => {
            StoryEngine.showObjective('Return to the Control Room navigation console');
            GameEngine.updateMission('SEND CURE TO EARTH');
          });
        }
      },
    },
  };

  // === DISCOVERY CHECKER ===
  function checkDiscoveries() {
    const arr = ['crew1', 'crew2', 'monitor', 'terminal'];
    const count = arr.filter(k => interacted.has(k)).length;
    if (count >= 3 && !interacted.has('door-corridor-hinted')) {
      interacted.add('door-corridor-hinted');
      setTimeout(() => {
        StoryEngine.showObjective('Head through the door to the corridor');
        GameEngine.updateMission('EXPLORE THE SHIP');
      }, 2000);
    }

    // Crew flashback after examining both bodies
    if (interacted.has('crew1') && interacted.has('crew2') && !interacted.has('flashback-crew')) {
      interacted.add('flashback-crew');
      setTimeout(() => {
        StoryEngine.playFlashback('crew', () => {
          StoryEngine.showObjective('Find the ship\'s log terminal');
        });
      }, 1000);
    }
  }

  // === PHASE 5: HAZARD MODE ===
  function triggerHazardMode() {
    flags.hazardTriggered = true;
    GameEngine.toggleHazardMode(true);
    GameEngine.updateMission('EMERGENCY — CONTAIN BREACH');
    StoryEngine.showDialogue('hazard_mode', () => {
      // Timed emergency: player has 30 seconds
      GameEngine.startEmergencyTimer(30, () => {
        // Timer complete (or ran out) → proceed to choice
        flags.emergencyComplete = true;
        StoryEngine.showDialogue('emergency_complete', () => {
          GameEngine.openPuzzleUI('ui-final-choice');
          GameEngine.updateMission('THE FINAL CHOICE');
        });
      });
    });
  }

  // === UI PUZZLE EVENT LISTENERS ===
  function initUIPuzzles() {
    // Prevent document mousedown from stealing puzzle button clicks
    document.querySelectorAll('.puzzle-ui .btn-glow, .puzzle-ui .btn-choice, .puzzle-ui .btn-translate').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.stopPropagation());
    });
    // Gravity Puzzle
    const dropBtn = document.getElementById('btn-drop-pen');
    if (dropBtn) {
      dropBtn.addEventListener('click', () => {
        const penEl = document.querySelector('.gravity-pen');
        if (penEl) penEl.classList.add('dropped');
        const timerEl = document.getElementById('gravity-timer');
        if (timerEl) {
          let t = 0;
          const iv = setInterval(() => {
            t += 0.01;
            timerEl.textContent = t.toFixed(2) + 's';
          }, 10);
          setTimeout(() => {
            clearInterval(iv);
            timerEl.textContent = '0.37s';
            timerEl.classList.add('highlight');
            document.getElementById('gravity-result').classList.remove('hidden');
            document.getElementById('btn-close-gravity').classList.remove('hidden');
          }, 370);
        }
      });
    }

    const closeGravity = document.getElementById('btn-close-gravity');
    if (closeGravity) {
      closeGravity.addEventListener('click', () => {
        GameEngine.closePuzzleUI('ui-gravity');
        flags.gravityChecked = true;
        StoryEngine.showDialogue('gravity_result', () => {
          StoryEngine.showObjective('Check the crew beds and personal locker');
        });
      });
    }

    // Microscope
    document.getElementById('btn-fire-laser')?.addEventListener('click', () => {
      document.querySelector('.astrophage-dot')?.classList.add('lasered');
      document.getElementById('microscope-result')?.classList.remove('hidden');
      document.getElementById('btn-close-microscope')?.classList.remove('hidden');
      flags.astrophageAnalyzed = true;
    });

    document.getElementById('btn-close-microscope')?.addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-microscope');
      StoryEngine.showDialogue('microscope_result', () => {
        // Trigger Radar alarm
        const radar = document.getElementById('radar-console');
        if (radar) radar.setAttribute('visible', 'true');
        StoryEngine.showDialogue('radar_alert', () => {
          GameEngine.updateMission('INVESTIGATE PROXIMITY ALERT');
          StoryEngine.showObjective('Return to Control Room — check the radar console');
        });
      });
    });

    // Radar
    document.getElementById('btn-close-radar')?.addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-radar');
      flags.radarChecked = true;
      StoryEngine.showObjective('Head back to the lab, then enter the Airlock');
      GameEngine.updateMission('MAKE FIRST CONTACT');
    });

    // Translation
    document.querySelectorAll('.btn-translate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = e.target.getAttribute('data-word');
        if (word === 'ASTROPHAGE' || word === 'FRIEND') {
          e.target.classList.add('correct');
          document.getElementById('translation-result')?.classList.remove('hidden');
          document.getElementById('btn-close-translation')?.classList.remove('hidden');
          flags.translated = true;
        } else {
          e.target.classList.add('wrong');
          setTimeout(() => e.target.classList.remove('wrong'), 500);
        }
      });
    });

    document.getElementById('btn-close-translation')?.addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-translation');
      StoryEngine.showDialogue('translation_success', () => {
        StoryEngine.playFlashback('wife', () => {
          StoryEngine.showDialogue('taumoeba_discovery', () => {
            StoryEngine.showObjective('Return to the Control Room Navigation Console');
            GameEngine.updateMission('SEND CURE TO EARTH');
          });
        });
      });
    });

    // Final Choice
    document.getElementById('btn-choice-earth')?.addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-final-choice');
      GameEngine.toggleHazardMode(false);
      StoryEngine.playEpilogue('earth');
    });

    document.getElementById('btn-choice-rocky')?.addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-final-choice');
      GameEngine.toggleHazardMode(false);
      StoryEngine.playEpilogue('rocky');
    });
  }

  function getInteraction(key) {
    return interactions[key] || null;
  }

  function hasInteracted(key) {
    return interacted.has(key);
  }

  window.addEventListener('DOMContentLoaded', initUIPuzzles);

  return {
    getInteraction,
    hasInteracted,
    interacted,
    flags,
  };
})();
