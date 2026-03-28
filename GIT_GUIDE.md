# 🚀 Git Quick Guide — Project Hail Mary

> For the hackathon team. Copy-paste these commands into your terminal.

---

## ⚡ First Time Setup

**1. Clone the repo:**
```bash
git clone https://github.com/velocity-wq/project-hail-mary.git
cd project-hail-mary
```

**2. Set your identity** (replace with your GitHub username & ID):
```bash
git config user.name "YOUR_GITHUB_USERNAME"
git config user.email "YOUR_GITHUB_ID+YOUR_GITHUB_USERNAME@users.noreply.github.com"
```
> Find your GitHub ID at: `https://api.github.com/users/YOUR_USERNAME` (look for the `"id"` field)

**3. Install GitHub CLI** (optional but recommended):
```bash
brew install gh
gh auth login
```

---

## 🔄 Daily Workflow

### Before you start working — ALWAYS pull first:
```bash
git pull
```

### After you make changes — push them up:
```bash
git add .
git commit -m "describe what you changed"
git push
```

### The full cycle:
```bash
git pull                              # get latest changes
# ... do your work ...
git add .                             # stage all changes
git commit -m "added ship controls"   # commit with a message
git push                              # push to GitHub
```

---

## 🛠️ Useful Commands

| Command | What it does |
|---|---|
| `git status` | See what files you changed |
| `git pull` | Download latest changes from GitHub |
| `git add .` | Stage ALL changed files |
| `git add filename` | Stage a specific file |
| `git commit -m "msg"` | Save staged changes with a message |
| `git push` | Upload your commits to GitHub |
| `git log --oneline -5` | See last 5 commits |
| `git diff` | See what you changed (before staging) |

---

## ⚠️ If You Get a Merge Conflict

This happens when two people edit the same file. Don't panic:

```bash
git pull                    # this will show the conflict
# open the conflicted file, look for <<<<<<< and >>>>>>> markers
# edit the file to keep what you want
git add .
git commit -m "resolved merge conflict"
git push
```

---

## 📁 Project Structure (from agents.md)

```
project-hail-mary/
├── agents.md            # Project context & game guide
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

## 🧠 Golden Rules

1. **Always `git pull` before you start working** — avoids conflicts
2. **Commit often** with clear messages — makes it easy to undo stuff
3. **Don't push broken code** — test it first
4. **Communicate** — let the team know what files you're working on

> Questions? Ask in the group chat or check the [GitHub repo](https://github.com/velocity-wq/project-hail-mary).
