# Project Hail Mary — Game Development Guide

> **Context:** This is a hackathon project for a **space-themed** hackathon. The game is a web-based interactive experience inspired by Andy Weir's novel *Project Hail Mary*.

---

## 🎯 Project Overview

The player takes on the role of **Ryland Grace**, a scientist who wakes up alone on a spaceship with no memory of who he is or why he's there. Through gameplay, the player uncovers the mission: **save Earth from an extinction-level threat** caused by a mysterious microorganism called *Astrophage* that is draining the Sun's energy.

The game follows a narrative structure loosely based on the book, but **the storyline will diverge and include original plot points** as development progresses. Treat the book's plot as a foundation, not a rigid script.

---

## 📖 Source Material — Key Concepts

These are the core concepts from *Project Hail Mary* that inform the game's world and mechanics:

| Concept | Description |
|---|---|
| **Ryland Grace** | The protagonist — a former molecular biologist turned middle-school science teacher, forcibly recruited for a one-way mission to save humanity. Wakes up with amnesia aboard the *Hail Mary*. |
| **The Hail Mary** | The interstellar spacecraft that carries Grace to the Tau Ceti system. It is powered by Astrophage fuel. |
| **Astrophage** | A single-celled organism that absorbs stellar energy. It is draining the Sun, threatening Earth with a catastrophic ice age. Ironically, it is also an incredibly efficient fuel source for interstellar travel. |
| **Tau Ceti** | A nearby star system that is mysteriously unaffected by Astrophage. Grace's destination to find out why. |
| **Rocky** | An intelligent, spider-like alien from the Eridian system. Rocky's world faces the same Astrophage crisis. He and Grace form an alliance to solve the problem together. |
| **Taumoeba** | A naturally occurring organism discovered at Tau Ceti that *eats* Astrophage — the key to saving both Earth and Erid. |
| **Beetles** | Small autonomous probes designed to carry data (and eventually Taumoeba samples) back to Earth. |

### Key Themes to Reflect in Gameplay

- **Amnesia / Memory Recovery** — The player starts knowing nothing; story unfolds through exploration and flashbacks.
- **Scientific Problem-Solving** — Puzzles and challenges should feel grounded in real science (physics, biology, chemistry).
- **Alien Collaboration** — Communication across species; building trust with Rocky despite vast biological differences.
- **Sacrifice & Duty** — Moral choices about personal survival vs. the fate of entire civilizations.
- **Isolation & Discovery** — The loneliness of deep space contrasted with the wonder of discovery.

---

## 🏗️ Game Structure

The game is broken into **phases** that mirror the book's narrative arc. Each phase introduces new mechanics, environments, and story beats.

### Gameplay Mechanics

- **Dialogue Choices** — The player has choices that affect dialogue, but the main story follows a single narrative arc.
- **Text-Based Dialogue** — Dialogues are not voice acted; all dialogue is displayed as on-screen text.
- **3rd-Person Narrator** — A narrator provides third-person perspective to guide the story.
- **3D Environment** — The game is set in a 3D environment (using A-Frame, built on Three.js).
- **Controls** — WASD for movement, Hold Left Click + Drag to look, Click to interact, Space to continue.
- **Seamless Transitions** — Scene changes (e.g., walking through a door) should feel smooth and cinematic, not abrupt.
- **Puzzle UIs** — Interactive mini-puzzles overlay the 3D scene (microscope, radar, translation matrix).


### Phase 1 — Awakening ✅ COMPLETE
- Player wakes up aboard the *Hail Mary* with no memory.
- Explore the ship, discover the dead crew members (CDR. Yáo, ENG. Ilyukhina).
- Find personal locker with photo → **Flashback: The Classroom** (Stratt recruits Grace).
- Read medical monitor (7 years in coma) and ship terminal (Tau Ceti mission).
- Examining both crew → **Flashback: Launch Day** (with shuttle countdown audio).
- Ship terminal → **Flashback: The Briefing** (Astrophage explained).
- Navigate through Corridor to Control Room.

**Rooms:** Med Bay → Corridor → Control Room

### Phase 2 — The Astrophage Revelation ✅ COMPLETE
- Access the Laboratory from the Control Room.
- **Microscope Puzzle:** Fire infrared laser at Astrophage sample, observe it absorbing 100% of energy.
- After analysis, proximity alarm triggers → radar console appears in Control Room.
- **Radar Puzzle:** Track incoming anomalous object on intercept course.

**Rooms:** Laboratory (microscope, spectrometer)

### Phase 3 — First Contact ✅ COMPLETE
- After radar confirmed, airlock unlocks → enter Airlock.
- Find Xenonite panels → build dividing wall.
- **Flashback: The Training** (centrifuge, flight sims, EVA training).
- Rocky appears as silhouette behind Xenonite wall.
- **Translation Puzzle:** Match Rocky's musical chords to words (ASTROPHAGE, FRIEND, etc.).

**Rooms:** Airlock (with Xenonite wall, Rocky silhouette)

### Phase 4 — Science Bros ✅ COMPLETE
- After translation, Rocky asks about Grace's family.
- **Flashback: The Goodbye** — farewell to wife before launch.
- Discover Taumoeba (organism that eats Astrophage).
- Objective: Return to Control Room.

### Phase 5 — The Climax & The Choice ✅ COMPLETE
- Returning to nav console triggers **Hazard Mode** (red alert, pulsing lights).
- Taumoeba mutation — eating ship fuel AND Xenonite (Rocky's hull).
- **Final Choice UI:**
  - **Go Home:** Return to Earth. See wife. Rocky dies.
  - **Save Rocky:** Turn around. Save friend. Never see Earth again.
- **Epilogue (Earth):** Sun restored. Grace with wife. Wondering about Rocky.
- **Epilogue (Rocky):** Teaching alien children on Erid. Rocky says suns are bright again.

> [!IMPORTANT]
> The wife character is a **major divergence from the book** (Grace has no wife in the novel). This is an intentional creative choice to strengthen the final decision's emotional weight.

---

## 🛠️ Technical Notes

- **Platform:** Web-based (runs in browser)
- **Stack:** HTML / CSS / JavaScript + **A-Frame 1.7** (built on Three.js) for 3D rendering
- **Camera:** Custom `hold-to-look` A-Frame component (js/components.js) — hold left click + drag to orbit
- **Audio:** MP3 files — beep loop during wakeup, shuttle countdown during crew flashback
- **Puzzles:** HTML/CSS overlay UIs (microscope, radar, translation, final choice)
- **Collaboration:** GitHub repo — all code is version-controlled and pushed regularly

---

## 📋 For AI Agents — Getting Started

When contributing code to this project:

1. **Read this document first** to understand the game's premise, world, and structure.
2. **Check existing code** in the repo before creating new files — avoid duplicating work.
3. **Follow the phase structure** above when building scenes or levels.
4. **Keep it modular** — separate game logic, UI, story/dialogue, and assets into distinct files/folders.
5. **Use the A-Frame component pattern** (see js/components.js) for new camera/control features.
6. **Use semantic HTML and clean CSS** — the game should look polished and feel premium.
7. **Commit and push frequently** — the team is collaborating via GitHub.

### File Structure

```
project-hail-mary/
├── agents.md              # This file — project context
├── updated_plan_info      # Detailed phase-by-phase design document
├── index.html             # Main entry point (A-Frame scenes + UI overlays + puzzle UIs)
├── css/
│   └── style.css          # Global styles (HUD, dialogue, puzzles, flashbacks, alerts)
├── js/
│   ├── components.js      # A-Frame custom components (hold-to-look)
│   ├── game.js            # Core game engine / loop / room transitions / puzzle UI helpers
│   ├── story.js           # Dialogue data, flashbacks, epilogues, typewriter effect
│   └── interactions.js    # Player interaction definitions, puzzle logic, plot flags
├── Space Shuttle Launch Countdown.mp3   # Audio: crew flashback
├── beep_beep_beep_sound_effect_to_be_looped.mp3  # Audio: wakeup sequence
└── data/
    └── (future: dialogue.json, config.json)
```

---

## ❓ Open Questions

- [ ] What is the target play-time for the hackathon demo?
- [ ] Should additional minigames be added (gravity puzzle, flight sim)?
- [ ] How to improve Rocky's visual representation?
- [ ] Should there be more rooms (e.g., engine room, cargo bay)?

> [!NOTE]
> If you're an agent and have questions about the project direction, flag them clearly in your output so the team can address them.
