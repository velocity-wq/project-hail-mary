/* ============================================
   STORY ENGINE
   Handles all narrative content, dialogue,
   typewriter effects, and flashback sequences
   ============================================ */

const StoryEngine = (() => {
  // ===== DIALOGUE DATA =====
  const dialogues = {
    // --- WAKE UP SEQUENCE ---
    wakeup: [
      { speaker: '', text: '...' },
      { speaker: '', text: 'Where... am I?' },
      { speaker: '', text: 'Everything hurts. My body feels like it hasn\'t moved in years.' },
      { speaker: '', text: 'I try to open my eyes. The light is blinding, even though it\'s barely there.' },
      { speaker: '', text: 'I\'m lying on something hard. Cold metal beneath thin fabric.' },
      { speaker: '', text: 'There\'s a beeping sound. Steady. Rhythmic. Medical.' },
      { speaker: '', text: 'I need to get up. I need to figure out where I am.' },
    ],

    // --- FIRST LOOK AROUND ---
    firstLook: [
      { speaker: 'RYLAND', text: 'Okay... I\'m in some kind of medical bay. The room is dimly lit — emergency lighting, maybe?' },
      { speaker: 'RYLAND', text: 'There are two other beds. They\'re not empty.' },
      { speaker: 'RYLAND', text: 'I don\'t think those people are sleeping.' },
      { speaker: 'RYLAND', text: 'I should look around. Figure out what\'s going on.' },
    ],

    // --- CREW EXAMINATION ---
    crew1: [
      { speaker: 'RYLAND', text: 'One of the other crew members. They\'re... gone. Been gone for a while, by the look of it.' },
      { speaker: 'RYLAND', text: 'Their suit has a name tag: "CDR. YÁO LI-JIE"' },
      { speaker: 'RYLAND', text: 'Commander. So this is a mission of some kind.' },
      { speaker: 'RYLAND', text: 'I don\'t remember them. I don\'t remember anything.' },
    ],

    crew2: [
      { speaker: 'RYLAND', text: 'Another body. "ENG. OLESYA ILYUKHINA"' },
      { speaker: 'RYLAND', text: 'An engineer. Russian, judging by the name.' },
      { speaker: 'RYLAND', text: 'Two crew members dead. And me — alive. Why just me?' },
      { speaker: 'RYLAND', text: 'Something went wrong. Very wrong.' },
    ],

    // --- MEDICAL MONITOR ---
    monitor: [
      { speaker: 'SYSTEM', text: '> COMA RECOVERY PROTOCOL — COMPLETE' },
      { speaker: 'SYSTEM', text: '> PATIENT: GRACE, RYLAND — VITALS NOMINAL' },
      { speaker: 'SYSTEM', text: '> ELAPSED MISSION TIME: 2,592 DAYS' },
      { speaker: 'RYLAND', text: '2,592 days?! That\'s... over seven years.' },
      { speaker: 'RYLAND', text: 'Seven years in a coma. On a spaceship. What the hell happened to me?' },
    ],

    // --- SHIP LOG TERMINAL ---
    terminal: [
      { speaker: 'TERMINAL', text: '> HAIL MARY — MISSION LOG' },
      { speaker: 'TERMINAL', text: '> STATUS: EN ROUTE TO TAU CETI SYSTEM' },
      { speaker: 'TERMINAL', text: '> MISSION: PROJECT HAIL MARY — ASTROPHAGE INVESTIGATION' },
      { speaker: 'TERMINAL', text: '> CREW: 3 (2 DECEASED — CDR. YÁO, ENG. ILYUKHINA)' },
      { speaker: 'RYLAND', text: 'Tau Ceti? That\'s... 12 light-years from Earth.' },
      { speaker: 'RYLAND', text: '"Astrophage." That word... it feels familiar. Important.' },
      { speaker: 'RYLAND', text: 'I need to get to the control room. There has to be more information there.' },
    ],

    // --- DOOR TO CORRIDOR ---
    'door-corridor': [
      { speaker: 'RYLAND', text: 'The corridor. It stretches ahead, dimly lit. The ship hums with a low vibration.' },
      { speaker: 'RYLAND', text: 'The control room should be at the other end.' },
    ],

    // --- CORRIDOR DOOR TO CONTROL ROOM ---
    'door-control': [
      { speaker: 'RYLAND', text: 'The control room. This is where I\'ll find answers.' },
    ],

    // --- CONTROL ROOM: VIEWPORT ---
    viewport: [
      { speaker: 'RYLAND', text: 'Stars. Endless, unblinking stars.' },
      { speaker: 'RYLAND', text: 'No Earth. No Sun. Nothing I recognize.' },
      { speaker: 'RYLAND', text: 'I\'m really out here. Alone. Impossibly far from home.' },
      { speaker: 'RYLAND', text: 'But... somewhere in those stars is the answer to saving everything I left behind.' },
    ],

    // --- NAVIGATION CONSOLE ---
    'nav-console': [
      { speaker: 'SYSTEM', text: '> NAVIGATION — TAU CETI APPROACH' },
      { speaker: 'SYSTEM', text: '> ETA: 14 DAYS, 7 HOURS' },
      { speaker: 'SYSTEM', text: '> ASTROPHAGE FUEL: 62.4% REMAINING' },
      { speaker: 'SYSTEM', text: '> WARNING: ANOMALOUS OBJECT DETECTED IN TAU CETI ORBIT' },
      { speaker: 'RYLAND', text: 'Anomalous object? What could be in orbit around Tau Ceti?' },
      { speaker: 'RYLAND', text: 'And "Astrophage fuel" — we\'re using the thing we\'re investigating as fuel?' },
      { speaker: 'RYLAND', text: 'I need to remember. I need to figure out what Astrophage is.' },
    ],
  };

  // ===== FLASHBACKS =====
  const flashbacks = {
    astrophage: {
      title: 'MEMORY: THE BRIEFING',
      lines: [
        'A conference room. Harsh fluorescent lights.',
        '"Dr. Grace, the Sun is dimming."',
        'A woman in a military uniform slides a folder across the table.',
        '"We\'ve identified a single-celled organism — we\'re calling it Astrophage."',
        '"It absorbs stellar energy. It\'s literally eating the Sun."',
        '"At current rates, Earth will enter a catastrophic ice age within 30 years."',
        'The room is silent. I remember the weight of those words.',
        '"We need you on this mission, Dr. Grace."',
        '"I\'m a schoolteacher," I said. "I used to be a scientist."',
        '"You\'re the person who solved Astrophage reproduction. We need that mind."',
      ],
    },
    crew: {
      title: 'MEMORY: LAUNCH DAY',
      lines: [
        'Three pressure suits. Three faces in helmets.',
        'Commander Yáo — confident, steady. Born to lead.',
        'Engineer Ilyukhina — brilliant, sharp-witted. Could fix anything.',
        'And me. The reluctant scientist.',
        '"This is a one-way trip," Yáo said. Matter of fact.',
        '"We know," Ilyukhina replied. No hesitation.',
        'I said nothing. I don\'t think I chose to be here.',
        'The rockets ignited. Earth shrank behind us.',
        'I remember thinking: I\'ll never see a sunset again.',
      ],
    },
  };

  // ===== STATE =====
  let currentDialogue = null;
  let currentLineIndex = 0;
  let isTyping = false;
  let typeTimer = null;
  let onDialogueComplete = null;

  // Wakeup skip state
  let wakeupSkipResolve = null;
  let isInWakeup = false;
  let wakeupSleepTimer = null;

  // ===== TYPEWRITER EFFECT =====
  function typeText(element, text, speed = 25) {
    return new Promise((resolve) => {
      let i = 0;
      element.textContent = '';
      isTyping = true;

      function type() {
        if (i < text.length) {
          element.textContent += text[i];
          i++;
          typeTimer = setTimeout(type, speed);
        } else {
          isTyping = false;
          resolve();
        }
      }
      type();
    });
  }

  function skipTypewriter(element, text) {
    clearTimeout(typeTimer);
    element.textContent = text;
    isTyping = false;
  }

  // ===== SKIPPABLE SLEEP (for wakeup/flashback) =====
  function skippableSleep(ms) {
    return new Promise((resolve) => {
      wakeupSleepTimer = setTimeout(resolve, ms);
      wakeupSkipResolve = resolve;
    });
  }

  function skipCurrentWakeupStep() {
    // Skip typewriter if typing
    if (isTyping) {
      clearTimeout(typeTimer);
      isTyping = false;
    }
    // Skip sleep timer
    if (wakeupSleepTimer) {
      clearTimeout(wakeupSleepTimer);
      wakeupSleepTimer = null;
    }
    // Resolve the pending promise
    if (wakeupSkipResolve) {
      const resolve = wakeupSkipResolve;
      wakeupSkipResolve = null;
      resolve();
    }
  }

  // ===== DIALOGUE SYSTEM =====
  function showDialogue(dialogueKey, callback) {
    const lines = dialogues[dialogueKey];
    if (!lines) return;

    currentDialogue = lines;
    currentLineIndex = 0;
    onDialogueComplete = callback || null;

    const box = document.getElementById('dialogue-box');
    box.classList.remove('hidden');

    showNextLine();
  }

  async function showNextLine() {
    if (!currentDialogue || currentLineIndex >= currentDialogue.length) {
      closeDialogue();
      return;
    }

    const line = currentDialogue[currentLineIndex];
    const speakerEl = document.getElementById('dialogue-speaker');
    const textEl = document.getElementById('dialogue-text');

    speakerEl.textContent = line.speaker;

    // Color code speakers
    if (line.speaker === 'SYSTEM' || line.speaker === 'TERMINAL') {
      speakerEl.style.color = '#00ff66';
    } else if (line.speaker === 'RYLAND') {
      speakerEl.style.color = '#00f0ff';
    } else {
      speakerEl.style.color = '#8888aa';
    }

    await typeText(textEl, line.text, line.speaker === 'SYSTEM' || line.speaker === 'TERMINAL' ? 15 : 25);
  }

  function advanceDialogue() {
    if (isTyping) {
      const line = currentDialogue[currentLineIndex];
      const textEl = document.getElementById('dialogue-text');
      skipTypewriter(textEl, line.text);
      return;
    }

    currentLineIndex++;
    if (currentLineIndex < currentDialogue.length) {
      showNextLine();
    } else {
      closeDialogue();
    }
  }

  function closeDialogue() {
    const box = document.getElementById('dialogue-box');
    box.classList.add('hidden');
    currentDialogue = null;
    currentLineIndex = 0;

    if (onDialogueComplete) {
      const cb = onDialogueComplete;
      onDialogueComplete = null;
      cb();
    }
  }

  // ===== WAKE UP SEQUENCE (now skippable) =====
  async function playWakeupSequence(callback) {
    const screen = document.getElementById('wakeup-screen');
    const textEl = document.getElementById('wakeup-text');
    const overlay = document.getElementById('wakeup-overlay');
    const skipHint = document.getElementById('skip-hint');

    screen.classList.add('active');
    isInWakeup = true;

    // Show skip hint
    if (skipHint) skipHint.classList.remove('hidden');

    // Start in pure black
    overlay.style.opacity = '1';

    await skippableSleep(1000);

    // Fade the overlay slightly
    overlay.style.opacity = '0.8';
    textEl.classList.add('visible');

    const thoughts = dialogues.wakeup;
    for (let i = 0; i < thoughts.length; i++) {
      if (!isInWakeup) break; // early exit if fully skipped

      textEl.textContent = '';
      await typeText(textEl, thoughts[i].text, 40);
      await skippableSleep(1500);

      // Gradually lighten
      const progress = (i + 1) / thoughts.length;
      overlay.style.opacity = String(0.8 - (progress * 0.8));
    }

    await skippableSleep(800);

    // Fade out wake up screen
    screen.style.transition = 'opacity 1.5s ease';
    screen.style.opacity = '0';

    await skippableSleep(1500);
    screen.classList.remove('active');
    screen.style.opacity = '';
    isInWakeup = false;

    if (skipHint) skipHint.classList.add('hidden');

    if (callback) callback();
  }

  // Fully skip the wakeup — jump straight to game world
  function skipWakeup() {
    if (!isInWakeup) return;
    isInWakeup = false;
    skipCurrentWakeupStep();
  }

  // ===== FLASHBACK (now skippable) =====
  async function playFlashback(flashbackKey, callback) {
    const data = flashbacks[flashbackKey];
    if (!data) return;

    const overlay = document.getElementById('flashback-overlay');
    const textEl = document.getElementById('flashback-text');
    const labelEl = overlay.querySelector('.flashback-label');

    labelEl.textContent = `◆ ${data.title} ◆`;
    overlay.classList.remove('hidden');
    isInWakeup = true; // reuse the skip mechanism

    for (let i = 0; i < data.lines.length; i++) {
      if (!isInWakeup) break;
      textEl.textContent = '';
      await typeText(textEl, data.lines[i], 30);
      await skippableSleep(2000);
    }

    await skippableSleep(1000);
    isInWakeup = false;

    // Click or space to close
    overlay.classList.add('hidden');
    if (callback) callback();
  }

  // ===== OBJECTIVE =====
  function showObjective(text) {
    const popup = document.getElementById('objective-popup');
    const textEl = document.getElementById('objective-text');

    textEl.textContent = text;
    popup.classList.remove('hidden');

    setTimeout(() => {
      popup.classList.add('hidden');
    }, 5000);
  }

  // ===== UTILITY =====
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function isDialogueActive() {
    return currentDialogue !== null;
  }

  function isWakeupActive() {
    return isInWakeup;
  }

  // ===== PUBLIC API =====
  return {
    showDialogue,
    advanceDialogue,
    playWakeupSequence,
    playFlashback,
    showObjective,
    isDialogueActive,
    isWakeupActive,
    skipCurrentWakeupStep,
    skipWakeup,
    dialogues,
  };
})();
