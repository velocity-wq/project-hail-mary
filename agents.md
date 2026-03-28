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

## 🏗️ Game Structure (Planned)

The game is broken into **acts** that mirror the book's narrative arc. Each act introduces new mechanics, environments, and story beats.

### Gameplay Mechanics

- **Dialogue Choices** — The player has choices that affect dialogue, but the main story follows a single narrative arc.
- **Text-Based Dialogue** — Dialogues are not voice acted; all dialogue is displayed as on-screen text.
- **3rd-Person Narrator** — A narrator provides third-person perspective to guide the story.
- **3D Environment** — The game is set in a 3D environment (using Three.js).
- **Controls** — WASD for movement, E for interaction, Space for jumping.
- **Seamless Transitions** — Scene changes (e.g., walking through a door) should feel smooth and cinematic, not abrupt.


### Act 1 — Awakening
- Player wakes up aboard the *Hail Mary* with no memory.
- Explore the ship, discover the dead crew members.
- Tutorial mechanics: movement, interaction, reading logs/data.
- Flashback sequences begin revealing backstory.
- Player starts to understand the mission and the stakes.


### Act 2 — The Mission
- Player pieces together the Astrophage crisis through ship logs, experiments, and flashbacks.
- Science-based puzzles (e.g., analyzing Astrophage samples, managing ship systems).
- Arrive at Tau Ceti.

### Act 3 — First Contact
- Detect Rocky's ship. Establish communication.
- Collaborative puzzles that require working with Rocky.
- Discover Taumoeba.

### Act 4 — The Choice *(subject to major changes)*
- Climactic challenges — breeding Taumoeba, sending beetles back to Earth.
- Final moral choice: return home or help Rocky.
- Multiple endings based on player decisions.

> [!IMPORTANT]
> Acts 3 and 4 are **subject to significant story changes** as the project evolves. The team will define original plot divergences during development.

---

## 🛠️ Technical Notes

- **Platform:** Web-based (runs in browser)
- **Stack:** HTML / CSS / JavaScript + **Three.js** for 3D rendering
- **Collaboration:** GitHub repo — all code is version-controlled and pushed regularly
- **Scope:** Focus on delivering a **polished, playable demo** by hackathon deadline

---

## 📋 For AI Agents — Getting Started

When contributing code to this project:

1. **Read this document first** to understand the game's premise, world, and structure.
2. **Check existing code** in the repo before creating new files — avoid duplicating work.
3. **Follow the act structure** above when building scenes or levels.
4. **Keep it modular** — separate game logic, UI, story/dialogue, and assets into distinct files/folders.
5. **Prioritize Act 1** — the awakening sequence is the first deliverable.
6. **Use semantic HTML and clean CSS** — the game should look polished and feel premium.
7. **Commit and push frequently** — the team is collaborating via GitHub.

### Suggested File Structure

```
project-hail-mary/
├── agents.md            # This file — project context
├── index.html           # Main entry point
├── css/
│   └── style.css        # Global styles
├── js/
│   ├── game.js          # Core game engine / loop
│   ├── story.js         # Dialogue & narrative logic
│   ├── puzzles.js       # Puzzle / minigame mechanics
│   └── ui.js            # UI management
├── assets/
│   ├── images/          # Sprites, backgrounds, UI elements
│   └── audio/           # Sound effects, ambient audio
└── data/
    ├── dialogue.json    # Story dialogue & branching paths
    └── config.json      # Game configuration
```

---

## ❓ Open Questions

These are decisions the team still needs to make:

- [ ] What specific story changes will diverge from the book?
- [ ] What is the separate storyline that needs to be coded?
- [ ] What game engine/framework (if any) beyond vanilla JS?
- [ ] What is the target play-time for the hackathon demo?
- [ ] Will there be audio/music, or is this visual-only?

> [!NOTE]
> If you're an agent and have questions about the project direction, flag them clearly in your output so the team can address them.
