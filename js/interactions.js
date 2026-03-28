/* ============================================
   INTERACTION SYSTEM
   Handles player interactions with 3D objects and UI logic
   ============================================ */

const InteractionSystem = (() => {
  const interacted = new Set();
  
  // Game state flags for plot progression
  const flags = {
    astrophageAnalyzed: false,
    radarChecked: false,
    wallBuilt: false,
    translated: false,
    hazardTriggered: false
  };

  const interactions = {
    // --- WAKE UP & MED BAY ---
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
    photo: {
      prompt: 'Examine personal locker',
      dialogue: null,
      onComplete: () => {
        interacted.add('photo');
        if (!interacted.has('flashback-classroom')) {
          interacted.add('flashback-classroom');
          StoryEngine.playFlashback('classroom');
        }
      }
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
              StoryEngine.showObjective('Find the control room');
              GameEngine.updateMission('INVESTIGATE ASTROPHAGE');
            });
          }, 1000);
        }
      },
    },
    oxygen: {
      prompt: 'Check life support',
      dialogue: 'oxygen',
      onComplete: () => { interacted.add('oxygen'); },
    },
    supplies: {
      prompt: 'Open supply cabinet',
      dialogue: 'supplies',
      onComplete: () => { interacted.add('supplies'); },
    },
    emergency: {
      prompt: 'Read emergency panel',
      dialogue: 'emergency',
      onComplete: () => {
        interacted.add('emergency');
        checkDiscoveries();
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
        StoryEngine.showObjective('Check the navigation console');
      },
    },
    
    // --- CONTROL ROOM ---
    viewport: {
      prompt: 'Look through viewport',
      dialogue: 'viewport',
      onComplete: () => {},
    },
    'nav-console': {
      prompt: flags.translated ? 'Access navigation console' : 'Access navigation console',
      dialogue: 'nav-console',
      onComplete: () => {
        if (!flags.hazardTriggered && flags.translated) {
          // Triggers endgame if we returned from lab after Taumoeba
          triggerHazardMode();
          return;
        }

        if (!interacted.has('nav-console')) {
          interacted.add('nav-console');
          GameEngine.updateMission('APPROACH TAU CETI');
          StoryEngine.showObjective('Anomalous object detected — find the Laboratory');
          // Play flashback 2 (training) shortly after if desired, or skip for now to save time
        }
      },
    },
    'door-lab': {
      prompt: 'Enter Laboratory',
      dialogue: 'door-lab',
      onComplete: () => {
        GameEngine.moveToRoom('laboratory');
        StoryEngine.showObjective('Analyze the Astrophage sample');
      },
    },

    // --- LABORATORY ---
    microscope: {
      prompt: 'Use Microscope',
      dialogue: 'microscope_intro',
      onComplete: () => {
        if (!flags.astrophageAnalyzed) {
          GameEngine.openPuzzleUI('ui-microscope');
        } else {
          StoryEngine.showObjective('Head back or continue exploring');
        }
      }
    },
    'door-airlock': {
      prompt: 'Enter Airlock',
      dialogue: 'door-airlock',
      onComplete: () => {
        if (flags.radarChecked) {
          GameEngine.moveToRoom('airlock');
          StoryEngine.showObjective('Find materials to build a divider');
        } else {
          StoryEngine.showObjective('The airlock is sealed. You need a reason to enter.');
        }
      }
    },

    // --- ALARM / RADAR ---
    radar: {
      prompt: 'Check Proximity Radar',
      dialogue: 'radar_contact',
      onComplete: () => {
        GameEngine.openPuzzleUI('ui-radar');
      }
    },

    // --- AIRLOCK ---
    xenonite: {
      prompt: 'Build Xenonite Divider',
      dialogue: 'wall_building',
      onComplete: () => {
        flags.wallBuilt = true;
        // Make wall visible
        const wall = document.getElementById('xenonite-wall');
        if (wall) wall.setAttribute('visible', 'true');
        
        // Hide panels
        const panels = document.getElementById('xenonite-panels');
        if (panels) panels.setAttribute('visible', 'false');

        // Play training flashback 
        setTimeout(() => {
          StoryEngine.playFlashback('training', () => {
             // Rocky appears!
             const rocky = document.getElementById('rocky-silhouette');
             if (rocky) rocky.setAttribute('visible', 'true');
             StoryEngine.showDialogue('rocky_arrival', () => {
               StoryEngine.showObjective('Communicate with the alien');
             });
          });
        }, 1000);
      }
    },
    rocky: {
      prompt: 'Communicate',
      dialogue: null, // Custom flow
      onComplete: () => {
        if (!flags.translated) {
          GameEngine.openPuzzleUI('ui-translation');
        } else {
          StoryEngine.showDialogue('taumoeba_discovery', () => {
             StoryEngine.showObjective('Return to the control room');
          });
        }
      }
    }
  };

  function checkDiscoveries() {
    const arr = ['crew1', 'crew2', 'monitor', 'terminal'];
    const count = arr.filter(k => interacted.has(k)).length;
    if (count >= 3 && !interacted.has('door-corridor-hinted')) {
      interacted.add('door-corridor-hinted');
      setTimeout(() => {
        StoryEngine.showObjective('Head through the door to the corridor');
      }, 2000);
    }
    
    // Check crew flashback
    if (interacted.has('crew1') && interacted.has('crew2') && !interacted.has('flashback-crew')) {
      interacted.add('flashback-crew');
      setTimeout(() => {
        StoryEngine.playFlashback('crew', () => {
          StoryEngine.showObjective('Find the ship\'s log terminal');
        });
      }, 1000);
    }
  }

  function triggerHazardMode() {
    flags.hazardTriggered = true;
    GameEngine.toggleHazardMode(true);
    StoryEngine.showDialogue('hazard_mode', () => {
       GameEngine.openPuzzleUI('ui-final-choice');
    });
  }

  // --- UI EVENT LISTENERS ---
  function initUIPuzzles() {
    // Microscope
    document.getElementById('btn-fire-laser').addEventListener('click', () => {
      document.querySelector('.astrophage-dot').classList.add('lasered');
      document.getElementById('microscope-result').classList.remove('hidden');
      document.getElementById('btn-close-microscope').classList.remove('hidden');
      flags.astrophageAnalyzed = true;
    });

    document.getElementById('btn-close-microscope').addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-microscope');
      StoryEngine.showDialogue('microscope_result', () => {
        // Trigger Radar alarm over in control room
        const radar = document.getElementById('radar-console');
        if (radar) radar.setAttribute('visible', 'true');
        StoryEngine.showDialogue('radar_alert', () => {
           GameEngine.updateMission('INVESTIGATE ALERT IN CONTROL ROOM');
        });
      });
    });

    // Radar
    document.getElementById('btn-close-radar').addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-radar');
      flags.radarChecked = true;
      StoryEngine.showObjective('Head back to the lab, then enter the Airlock');
      GameEngine.updateMission('MAKE FIRST CONTACT');
    });

    // Translation
    const transBtns = document.querySelectorAll('.btn-translate');
    transBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = e.target.getAttribute('data-word');
        if (word === 'ASTROPHAGE' || word === 'FRIEND') {
          e.target.classList.add('correct');
          document.getElementById('translation-result').classList.remove('hidden');
          document.getElementById('btn-close-translation').classList.remove('hidden');
          flags.translated = true;
        } else {
          e.target.classList.add('wrong');
          setTimeout(() => e.target.classList.remove('wrong'), 500);
        }
      });
    });

    document.getElementById('btn-close-translation').addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-translation');
      StoryEngine.showDialogue('translation_success', () => {
         StoryEngine.playFlashback('wife', () => {
            StoryEngine.showDialogue('taumoeba_discovery', () => {
               StoryEngine.showObjective('Return to the Control Room Navigation Console');
               GameEngine.updateMission('RETURN TO EARTH');
            });
         });
      });
    });

    // Final Choice
    document.getElementById('btn-choice-earth').addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-final-choice');
      StoryEngine.showDialogue('final_choice', () => {
         StoryEngine.playEpilogue('earth');
      });
    });

    document.getElementById('btn-choice-rocky').addEventListener('click', () => {
      GameEngine.closePuzzleUI('ui-final-choice');
      StoryEngine.showDialogue('final_choice', () => {
         StoryEngine.playEpilogue('rocky');
      });
    });
  }

  function getInteraction(key) {
    return interactions[key] || null;
  }

  function hasInteracted(key) {
    return interacted.has(key);
  }
  
  // Wait for DOM to init button listeners
  window.addEventListener('DOMContentLoaded', initUIPuzzles);

  return {
    getInteraction,
    hasInteracted,
    interacted,
    flags
  };
})();
