/* ============================================
   INTERACTION SYSTEM
   Handles player interactions with 3D objects
   ============================================ */

const InteractionSystem = (() => {
  // Track what the player has interacted with
  const interacted = new Set();

  // Interaction definitions
  const interactions = {
    crew1: {
      prompt: 'Examine crew member',
      dialogue: 'crew1',
      onComplete: () => {
        interacted.add('crew1');
        checkDiscoveries();
        if (!interacted.has('flashback-crew') && interacted.has('crew2')) {
          interacted.add('flashback-crew');
          setTimeout(() => {
            StoryEngine.playFlashback('crew', () => {
              StoryEngine.showObjective('Find the ship\'s log terminal');
            });
          }, 1000);
        }
      },
    },

    crew2: {
      prompt: 'Examine crew member',
      dialogue: 'crew2',
      onComplete: () => {
        interacted.add('crew2');
        checkDiscoveries();
        if (!interacted.has('flashback-crew') && interacted.has('crew1')) {
          interacted.add('flashback-crew');
          setTimeout(() => {
            StoryEngine.playFlashback('crew', () => {
              StoryEngine.showObjective('Find the ship\'s log terminal');
            });
          }, 1000);
        }
      },
    },

    monitor: {
      prompt: 'Read medical monitor',
      dialogue: 'monitor',
      onComplete: () => {
        interacted.add('monitor');
        checkDiscoveries();
        StoryEngine.showObjective('Examine the other crew members');
      },
    },

    terminal: {
      prompt: 'Access ship terminal',
      dialogue: 'terminal',
      onComplete: () => {
        interacted.add('terminal');
        checkDiscoveries();
        // Trigger astrophage flashback
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

    'door-corridor': {
      prompt: 'Enter corridor',
      dialogue: 'door-corridor',
      onComplete: () => {
        interacted.add('door-corridor');
        GameEngine.moveToRoom('corridor');
      },
    },

    'door-control': {
      prompt: 'Enter control room',
      dialogue: 'door-control',
      onComplete: () => {
        interacted.add('door-control');
        GameEngine.moveToRoom('control-room');
      },
    },

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
        interacted.add('nav-console');
        GameEngine.updateMission('APPROACH TAU CETI');
        StoryEngine.showObjective('Anomalous object detected — investigate further');
      },
    },
  };

  function checkDiscoveries() {
    const discoveryCount = ['crew1', 'crew2', 'monitor', 'terminal'].filter(k => interacted.has(k)).length;
    if (discoveryCount >= 3 && !interacted.has('door-corridor')) {
      // After enough discoveries, hint at the corridor
      setTimeout(() => {
        StoryEngine.showObjective('Head through the door to the corridor');
      }, 2000);
    }
  }

  function getInteraction(key) {
    return interactions[key] || null;
  }

  function hasInteracted(key) {
    return interacted.has(key);
  }

  return {
    getInteraction,
    hasInteracted,
    interacted,
  };
})();
