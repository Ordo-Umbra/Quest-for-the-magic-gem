# 💎 Quest for the Magic Gem

A 2D top-down dungeon explorer — built for Dad & Son to play and grow together.
It runs in any **phone web browser**, so you don't need a computer or an app store.

Brave the dungeons. Recover the gem. Restore the light!

---

## ▶️ How to play it on your phone

You have two easy options.

### Option A — Publish it to a web link (best for playing often)

This makes a real web address you can open and bookmark on your phone. The
project is set up to **turn publishing on by itself**, so usually you don't
have to change any settings at all.

1. After any change is saved, the game publishes automatically. Your web
   address will be:

   `https://ordo-umbra.github.io/quest-for-the-magic-gem/`

2. Open that link on your phone, tap **"Add to Home Screen"** in your browser
   menu, and now it works just like an app. 🎮

**If the link doesn't work after a few minutes**, the auto-enable may have been
blocked. Turn Pages on manually one time:
   - On your phone, open this repo on **github.com**.
   - Tap **Settings** → **Pages**.
   - Under **Build and deployment → Source**, choose **GitHub Actions**.
   - Then open the **Actions** tab, tap the latest run, and choose **Re-run**.

Every time you save a change to the game, it re-publishes automatically.

### Option B — Quick preview without publishing

Open this link on your phone (it serves the game straight from GitHub):

`https://raw.githack.com/Ordo-Umbra/quest-for-the-magic-gem/claude/game-for-son-6esv1t/index.html`

(Option A is nicer once you're set up, because the address is shorter and it
saves your progress reliably.)

---

## 🕹️ Controls

**On a phone:**
- **Left thumb** — the round joystick moves the hero.
- **⚔ button** — swing your sword (hits enemies *and* cuts vines).
- **● button** — talk to people and use the gem pedestal.
- **Tap the screen** — start the game and move through conversations.

**On a computer (for testing):**
- **Arrow keys / WASD** — move
- **Space or J** — attack
- **E or Enter** — talk / interact

---

## 🗺️ What's in the game right now

- A **village hub** with the Elder who explains your quest and the gem pedestal.
- **Verdant Hollow** — a forest dungeon. Cut the vines, then solve a
  block-and-plate puzzle to reach the **Forest Shard**.
- **Glimmering Grotto** — a crystal cave. Defeat every creature to open the
  gate, solve another puzzle, and claim the **Crystal Shard**.
- Hearts (you respawn in the village if they run out — very forgiving!),
  slimes, bats, light essence to collect, and a victory ending when both
  shards are returned to the gem.
- Your progress **saves automatically** in the browser.

This matches the gentle, hopeful "classic Zelda feel" from your design outline,
and it's built to grow.

---

## ✏️ How to change the game (no computer needed!)

Everything you'll want to tweak lives at the **top of `game.js`**. You can edit
it right on github.com: open `game.js`, tap the **pencil ✏️ icon**, make your
change, and tap **Commit changes**. The game re-publishes by itself.

### Rename the hero, kingdom, or villain
Find the `STORY` section near the top and change the words in quotes:

```js
const STORY = {
  heroName: "Pip",        // <-- your son's hero name goes here
  kingdom:  "Luminara",
  villain:  "Vesper",
  ...
```

### Change what people say
The `intro`, `win`, and each room's `npc` lines are just lists of sentences in
quotes. Change them to anything you like!

### Draw a brand-new room
Each dungeon room is a little picture made of letters in the `ROOMS` section.
Here's the full key:

| Letter | Meaning |
|--------|---------|
| `#` | wall |
| `.` | floor (you can walk here) |
| `V` | vine (cut it with the sword) |
| `B` | pushable block |
| `P` | pressure plate (push a block onto it) |
| `g` | gate (opens when the puzzle is solved) |
| `S` | shard altar (touch it to win the shard) |
| `G` | gem pedestal (village only) |
| `N` | a person to talk to |
| `x` | a slime starts here |
| `y` | a bat starts here |
| `^ v < >` | doors (up / down / left / right) |

Copy an existing room, change the letters to design your own layout, and add a
new door + `exits` entry to connect it. Each room is exactly **15 letters wide
and 11 rows tall**.

When you and your son dream up new dungeons, enemies, or puzzles, just ask and
we can keep building — that's the whole spirit of the outline. 🌟

---

*Made with love. — Dad & Son*
