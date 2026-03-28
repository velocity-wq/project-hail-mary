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
      { speaker: 'RYLAND', text: 'Something feels off — heavier than normal. My steps are sluggish.' },
      { speaker: 'RYLAND', text: 'I should look around. Figure out what\'s going on.' },
    ],

    // --- GRAVITY PUZZLE ---
    gravity_start: [
      { speaker: 'RYLAND', text: 'A medical pen. Let me try something...' },
      { speaker: 'RYLAND', text: 'I drop it and watch it fall.' },
    ],
    gravity_result: [
      { speaker: 'RYLAND', text: 'That was too fast. Way too fast.' },
      { speaker: 'RYLAND', text: 'I timed it — the pen fell like it weighs 1.5 times normal.' },
      { speaker: 'RYLAND', text: 'We\'re under 1.5G. This isn\'t Earth. This isn\'t any planet.' },
      { speaker: 'RYLAND', text: 'This ship is spinning — centrifugal force creating artificial gravity.' },
      { speaker: 'RYLAND', text: 'That explains why my body feels so heavy after years in a coma.' },
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

    // --- PHASE 2: LABORATORY & ASTROPHAGE ---
    'door-lab': [
      { speaker: 'RYLAND', text: 'This looks like a fully equipped laboratory. The equipment here is bleeding edge.' },
      { speaker: 'RYLAND', text: 'If I\'m a scientist, this is my domain.' },
    ],
    microscope_intro: [
      { speaker: 'RYLAND', text: 'A microscope and spectrometer setup. Let\'s see what we\'ve got.' },
      { speaker: 'RYLAND', text: 'There\'s a sample loaded. A tiny black dot. Is this... Astrophage?' },
    ],
    microscope_result: [
      { speaker: 'RYLAND', text: 'It absorbed all the infrared laser energy. Converting it to mass, or maybe storing it?' },
      { speaker: 'RYLAND', text: 'It\'s eating the light. It\'s eating the Sun.' },
      { speaker: 'RYLAND', text: 'And I\'m supposed to stop it.' },
    ],

    // --- PHASE 3: THE BLIP-A ---
    radar_alert: [
      { speaker: 'SYSTEM', text: '> PROXIMITY ALERT. PROXIMITY ALERT.' },
      { speaker: 'RYLAND', text: 'What is that alarm? A proximity alert?' },
      { speaker: 'RYLAND', text: 'I need to check the radar console right now.' },
    ],
    radar_contact: [
      { speaker: 'RYLAND', text: 'That\'s not a natural object. It\'s moving to intercept us.' },
      { speaker: 'RYLAND', text: 'It\'s a ship. An alien ship.' },
      { speaker: 'RYLAND', text: 'I\'m not the only one here. I need to get to the airlock.' },
    ],
    'door-airlock': [
      { speaker: 'RYLAND', text: 'The airlock. If they want to dock with us, this is where it will happen.' },
      { speaker: 'RYLAND', text: 'But I can\'t just open the door. What if their atmosphere is toxic?' },
    ],
    wall_building: [
      { speaker: 'RYLAND', text: 'Xenonite panels and sealant. I can build a divider in the airlock.' },
      { speaker: 'RYLAND', text: 'Keep their atmosphere on their side, and mine on mine.' },
      { speaker: 'RYLAND', text: 'This stuff is heavy. Reminds me of the training. Actually...' },
    ],

    // --- PHASE 4: SCIENCE BROS ---
    rocky_arrival: [
      { speaker: 'RYLAND', text: 'He\'s here. He looks like a five-legged spider made of stone.' },
      { speaker: 'RYLAND', text: 'He\'s tapping on the glass and making musical sounds. Chords.' },
      { speaker: 'RYLAND', text: 'He has no eyes. He must see with sound. Like a bat.' },
      { speaker: 'RYLAND', text: 'I need to communicate. I need to translate those chords.' },
    ],
    translation_success: [
      { speaker: 'SYSTEM', text: '> DICTIONARY UPDATED.' },
      { speaker: 'ROCKY', text: '(Translated) "QUESTION. YOU HAVE MATE? YOU HAVE HATCHLINGS?"' },
      { speaker: 'RYLAND', text: 'My mate... my wife. Yes, I do.' },
      { speaker: 'RYLAND', text: 'That question... it hits hard. Her face is blurry in my memory.' },
      { speaker: 'ROCKY', text: '(Translated) "WE SAVE WORLDS. YES?"' },
      { speaker: 'RYLAND', text: 'Yes, Rocky. We save worlds.' },
    ],
    taumoeba_discovery: [
      { speaker: 'RYLAND', text: 'We found it. Taumoeba. A microorganism that preys on Astrophage.' },
      { speaker: 'RYLAND', text: 'This is the cure. If we breed enough of this, we can save both our stars.' },
      { speaker: 'ROCKY', text: '(Translated) "GOOD. VERY GOOD. YES!"' },
      { speaker: 'RYLAND', text: 'I have to send it back to Earth on the Beetles.' },
    ],

    // --- PHASE 5: THE CLIMAX ---
    hazard_mode: [
      { speaker: 'SYSTEM', text: '> CRITICAL ALERT: CONTAINMENT BREACH DETECTED IN MAIN TANKS' },
      { speaker: 'SYSTEM', text: '> TAUMOEBA MUTATION DETECTED — XENONITE CONSUMPTION ACTIVE' },
      { speaker: 'RYLAND', text: 'The Taumoeba... it evolved. It\'s eating out of its tanks!' },
      { speaker: 'RYLAND', text: 'It\'s eating the Xenonite!' },
      { speaker: 'RYLAND', text: 'Oh god. Rocky\'s ship is made entirely of Xenonite.' },
      { speaker: 'RYLAND', text: 'If the Taumoeba got on his ship... it\'s going to eat his fuel and destroy his hull.' },
      { speaker: 'RYLAND', text: 'I need to isolate the unmutated samples and load the Beetle probes. Now!' },
    ],
    emergency_complete: [
      { speaker: 'SYSTEM', text: '> BEETLE PROBES LOADED WITH UNMUTATED TAUMOEBA' },
      { speaker: 'SYSTEM', text: '> LAUNCH TRAJECTORY TO EARTH — CALCULATED' },
      { speaker: 'SYSTEM', text: '> BEETLES LAUNCHED SUCCESSFULLY' },
      { speaker: 'RYLAND', text: 'Earth is saved. The Beetles will make it back with the cure.' },
      { speaker: 'RYLAND', text: 'But Rocky...' },
      { speaker: 'RYLAND', text: 'The mutated Taumoeba is eating his ship apart right now.' },
      { speaker: 'RYLAND', text: 'I have to make a choice.' },
    ],
    final_choice: [
      { speaker: 'RYLAND', text: 'I only have enough Astrophage fuel to go one way.' },
      { speaker: 'RYLAND', text: 'Option one: Go to Earth. I survive. I see my wife. Humanity lives.' },
      { speaker: 'RYLAND', text: 'Option two: Intercept Rocky. Give him the unmutated Taumoeba. Save his species.' },
      { speaker: 'RYLAND', text: 'But if I do that... I\'ll never see home again. I\'ll die of old age in another star system.' },
    ],
  };

  // ===== FLASHBACKS =====
  const flashbacks = {
    classroom: {
      title: 'MEMORY: THE CLASSROOM',
      lines: [
        'A brightly lit, warm middle school science classroom.',
        'I am standing at the teacher\'s desk. My desk.',
        'There is a framed picture of my wife. My anchor. My reason.',
        'The room smells like whiteboard markers and bad cafeteria food.',
        'Eva Stratt and two NASA agents burst through the door without knocking.',
        '"Everyone out," Stratt commands. The children scramble.',
        '"Dr. Grace, we need you to come with us. Right now."',
        '"Why?" I asked. "I\'m just a middle school science teacher."',
        '"Because the Sun is dimming," she said. "And your obscure paper on waterless alien life might be the key to saving it."',
        'I looked at the picture of my wife. Then I followed them.',
      ],
    },
    astrophage: {
      title: 'MEMORY: THE NASA BRIEFING',
      lines: [
        'A chaotic government briefing room. Harsh fluorescent lights.',
        'Scientists, military officers, world leaders — all crammed in one room.',
        '"Dr. Grace, the Sun is losing energy at an alarming rate."',
        'Stratt slides a folder across the table.',
        '"We\'ve identified a single-celled organism — Astrophage. It\'s eating the Sun."',
        '"At current rates, Earth enters catastrophic ice age within 30 years."',
        'The room is dead silent. The weight of those words is crushing.',
        '"We need you on the Hail Mary mission, Dr. Grace."',
        '"Are you crazy?" I said. "I need motion sickness pills for a merry-go-round! I put the \'not\' in astronaut!"',
        'Stratt didn\'t blink. "Your expertise is mandatory to save the human race."',
        '"You don\'t have a choice anymore, Dr. Grace."',
      ],
    },
    crew: {
      title: 'MEMORY: LAUNCH DAY',
      lines: [
        'Three pressure suits. Three faces in helmets.',
        'Commander Yáo — confident, steady. Born to lead.',
        'Engineer Ilyukhina — brilliant, sharp-witted. Could fix anything.',
        'And me. The reluctant scientist who put the "not" in astronaut.',
        '"This is a one-way trip," Yáo said. Matter of fact.',
        '"We know," Ilyukhina replied. No hesitation.',
        'I said nothing. I don\'t think I chose to be here.',
        'The rockets ignited. Earth shrank behind us.',
        'I remember thinking: I\'ll never see a sunset again.',
      ],
    },
    training: {
      title: 'MEMORY: ASTRONAUT TRAINING',
      lines: [
        'A centrifuge spinning at impossible speeds. My vision tunneled.',
        '"Keep your cursor in the green zone!" the instructor screamed.',
        'Flight simulators with a thousand controls that all had to be perfect.',
        '"Dock the module, Grace! DOCK IT!"',
        'Operating a robotic arm in a clumsy EVA suit. Pick up rocks. Time limit.',
        '"Faster! You won\'t have time to be slow out there!"',
        'They pushed me until my body broke, and then they pushed harder.',
        'Not because I was meant to be an astronaut.',
        'But because I was the only one who understood the science.',
        'And the science was the only thing that could save eight billion lives.',
      ],
    },
    wife: {
      title: 'MEMORY: THE GOODBYE',
      lines: [
        'A quiet living room. Outside, it was snowing. The sun was visibly dimmer than it should be.',
        'She held my hand, her eyes rimmed with red.',
        '"Don\'t go," she said. It was a plea, not an order.',
        '"If I stay, we get maybe five more years before the atmosphere freezes," I told her.',
        '"I don\'t care. Five years together is better than dying alone in the dark."',
        'I cupped her face. "I\'m going so that you have the rest of your life. So that everyone does."',
        '"Promise me you\'ll come back."',
        'I couldn\'t answer. We both knew it was a one-way ticket.',
        'That was our last night. Then the medical coma. Then the stars.',
        'Her face is the last human thing I remember.',
      ],
    },
  };

  // ===== EPILOGUES =====
  const epilogues = {
    earth: [
      { text: 'Earth, 14 years later.' },
      { text: 'The sun is bright again in a blue sky.' },
      { text: 'Ryland Grace sits on a porch, holding his wife\'s hand.' },
      { text: 'The ice retreated. The crops returned. Humanity survived.' },
      { text: 'He is hailed as a hero. "The man who saved the world."' },
      { text: 'But every night, he looks up at the stars.' },
      { text: 'And thinks about the friend he left behind.' },
      { text: 'The friend who is dying alone, in the dark, impossibly far away.' },
      { text: '"I\'m sorry, Rocky."' },
    ],
    rocky: [
      { text: 'Erid, many years later.' },
      { text: 'A dark, red-lit alien dome. The air tastes like ammonia.' },
      { text: 'An older Ryland Grace stands in front of a class of young, spider-like alien children.' },
      { text: 'He is teaching them science. Just like he taught on Earth.' },
      { text: 'A worn photograph of a human woman rests on his desk.' },
      { text: 'His friend, Rocky, taps a happy chord on his shoulder.' },
      { text: '"SUN IS BRIGHT AGAIN," Rocky says.' },
      { text: '"Both suns," Grace smiles.' },
      { text: 'He never saw Earth again. He never saw her again.' },
      { text: 'But he saved two worlds. And found a home among the stars.' },
    ]
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
    if (isTyping) {
      clearTimeout(typeTimer);
      isTyping = false;
    }
    if (wakeupSleepTimer) {
      clearTimeout(wakeupSleepTimer);
      wakeupSleepTimer = null;
    }
    if (wakeupSkipResolve) {
      const resolve = wakeupSkipResolve;
      wakeupSkipResolve = null;
      resolve();
    }
  }

  // ===== DIALOGUE SYSTEM =====
  function showDialogue(dialogueKey, callback) {
    const lines = dialogues[dialogueKey];
    if (!lines) { if (callback) callback(); return; }

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
    } else if (line.speaker === 'ROCKY') {
      speakerEl.style.color = '#ff8800';
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

  // ===== WAKE UP SEQUENCE (skippable) =====
  async function playWakeupSequence(callback) {
    const screen = document.getElementById('wakeup-screen');
    const textEl = document.getElementById('wakeup-text');
    const overlay = document.getElementById('wakeup-overlay');
    const skipHint = document.getElementById('skip-hint');

    const beep = document.getElementById('audio-beep');
    if (beep) {
      beep.volume = 0.5;
      beep.play().catch(() => {});
    }

    screen.classList.add('active');
    isInWakeup = true;
    if (skipHint) skipHint.classList.remove('hidden');
    overlay.style.opacity = '1';

    await skippableSleep(1000);
    overlay.style.opacity = '0.8';
    textEl.classList.add('visible');

    const thoughts = dialogues.wakeup;
    for (let i = 0; i < thoughts.length; i++) {
      if (!isInWakeup) break;
      textEl.textContent = '';
      await typeText(textEl, thoughts[i].text, 40);
      await skippableSleep(1500);

      const progress = (i + 1) / thoughts.length;
      overlay.style.opacity = String(0.8 - (progress * 0.8));
    }

    await skippableSleep(800);
    screen.style.transition = 'opacity 1.5s ease';
    screen.style.opacity = '0';
    await skippableSleep(1500);
    screen.classList.remove('active');
    screen.style.opacity = '';
    isInWakeup = false;
    if (skipHint) skipHint.classList.add('hidden');
    if (beep) beep.pause();
    if (callback) callback();
  }

  function skipWakeup() {
    if (!isInWakeup) return;
    isInWakeup = false;
    skipCurrentWakeupStep();
  }

  // ===== FLASHBACK (skippable) =====
  async function playFlashback(flashbackKey, callback) {
    const data = flashbacks[flashbackKey];
    if (!data) { if (callback) callback(); return; }

    const overlay = document.getElementById('flashback-overlay');
    const textEl = document.getElementById('flashback-text');
    const labelEl = overlay.querySelector('.flashback-label');

    const launchAudio = document.getElementById('audio-launch');
    if (flashbackKey === 'crew' && launchAudio) {
      launchAudio.volume = 1.0;
      launchAudio.currentTime = 0;
      launchAudio.play().catch(() => {});
    }

    labelEl.textContent = `◆ ${data.title} ◆`;
    overlay.classList.remove('hidden');
    isInWakeup = true;

    for (let i = 0; i < data.lines.length; i++) {
      if (!isInWakeup) break;
      textEl.textContent = '';
      await typeText(textEl, data.lines[i], 30);
      await skippableSleep(2000);
    }

    await skippableSleep(1000);
    isInWakeup = false;
    if (flashbackKey === 'crew' && launchAudio) launchAudio.pause();
    overlay.classList.add('hidden');
    if (callback) callback();
  }

  // ===== EPILOGUE =====
  async function playEpilogue(endingId) {
    const data = epilogues[endingId];
    if (!data) return;

    const screen = document.getElementById('epilogue-screen');
    const textEl = document.getElementById('epilogue-text');

    // Hide HUD
    document.getElementById('hud').style.display = 'none';
    // Hide dialogue box
    document.getElementById('dialogue-box').classList.add('hidden');

    // Show epilogue - needs .active class per our CSS fix
    screen.classList.remove('hidden');
    screen.classList.add('active');
    screen.style.display = 'flex';

    setTimeout(() => {
      textEl.classList.add('visible');
    }, 100);

    textEl.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
      const p = document.createElement('p');
      p.textContent = data[i].text;
      p.style.animationDelay = `${i * 2.5}s`;
      textEl.appendChild(p);
    }

    await sleep(data.length * 2500 + 5000);

    const reload = document.createElement('p');
    reload.textContent = "Thank you for playing Project Hail Mary.";
    reload.style.animationDelay = "1s";
    reload.style.color = "var(--cyan)";
    reload.style.marginTop = "3rem";
    textEl.appendChild(reload);

    const refresh = document.createElement('p');
    refresh.textContent = "Refresh to play again.";
    refresh.style.animationDelay = "2s";
    refresh.style.color = "#888";
    refresh.style.marginTop = "1rem";
    textEl.appendChild(refresh);
  }

  // ===== OBJECTIVE =====
  function showObjective(text) {
    const popup = document.getElementById('objective-popup');
    const textEl = document.getElementById('objective-text');
    textEl.textContent = text;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 5000);
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

  return {
    showDialogue,
    advanceDialogue,
    playWakeupSequence,
    playFlashback,
    playEpilogue,
    showObjective,
    isDialogueActive,
    isWakeupActive,
    skipCurrentWakeupStep,
    skipWakeup,
    dialogues,
  };
})();
