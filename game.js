/* =====================================================================
   QUEST FOR THE MAGIC GEM
   A 2D top-down dungeon explorer you can play in a phone browser.

   Dad & Son: almost everything you want to change lives in the
   "STORY & WORLD" section a little further down. Look for the big
   comment banners. You can change the hero's name, the words people
   say, and even draw new rooms using simple letters. Have fun!
   ===================================================================== */

"use strict";

/* ------------------------- basic settings ------------------------- */
const TILE = 32;          // size of one square, in pixels
const COLS = 15;          // how many squares wide a room is
const ROWS = 11;          // how many squares tall a room is
const HUD_H = 40;         // space at the top for hearts & shards
const W = COLS * TILE;            // play-area width  (480)
const H = ROWS * TILE + HUD_H;    // full canvas height

/* ------------------------- difficulty ----------------------------
   Tweak these to make the game easier or harder for your hero.
   Bigger hearts = more forgiving.  Smaller enemy numbers = gentler.
   (The original, harder values are noted in the comments.)            */
const TUNING = {
  startHearts: 5,         // hearts you begin with                 (was 3)
  hurtInvuln: 1.6,        // seconds of flashing safety after a hit (was 1.0)
  knockback: 26,          // how far an enemy shoves you on a touch (was 0)
  spawnGrace: 1.0,        // seconds of safety right after a door   (was 0)
  slimeChaseSpeed: 34,    // slime speed while chasing you          (was 42)
  slimeChaseRange: 120,   // how close before a slime notices you   (was 150)
  batSpeed: 44,           // how fast a bat drifts toward you       (was 60)
  batWaggle: 26,          // how wildly a bat swoops around          (was 40)
};

/* =====================================================================
   STORY & WORLD  --  change these to make the game your own!
   ===================================================================== */

const STORY = {
  heroName: "Pip",          // <-- your son can pick the hero's name!
  kingdom:  "Luminara",
  villain:  "Vesper",
  // The very first message when the game starts:
  intro: [
    "Long ago the Magic Gem kept the kingdom of " + "Luminara" + " full of light.",
    "But the sorcerer Vesper shattered it and scattered the shards in dark dungeons.",
    "You found a glowing fragment and an old map...",
    "Brave the dungeons. Recover the gem. Restore the light!"
  ],
  win: [
    "The last shard clicks into place...",
    "Warm light pours across the whole kingdom!",
    "Crops stand tall, the sky shines gold, and the people cheer your name.",
    "You did it, hero. Luminara is saved!  -  THE END -",
    "(Made with love by Dad & Son. Add more dungeons whenever you like!)"
  ]
};

/* ---------------------------------------------------------------------
   ROOMS
   Each room is drawn as a little picture made of letters.
   Here is what every letter means:

     #  wall (you can't walk through)
     .  floor (walkable)
     V  vine  (blocks the way until you CUT it with your sword)
     B  pushable block (walk into it to shove it)
     P  pressure plate (put a block on it to open a gate)
     g  gate (closed; opens when the room's puzzle is solved)
     C  chest (gives you a heart container)
     S  shard altar (touch it to collect the gem shard!)
     G  gem pedestal in the village (restores the gem at the end)
     N  a friendly person to talk to
     x  a slime enemy starts here
     y  a bat enemy starts here
     ^ v < >  doors that lead to another room (north/south/west/east)

   "exits" tells each door which room it leads to, and where you
   appear (in tiles) when you arrive.
   --------------------------------------------------------------------- */

const ROOMS = {
  /* ----------------------------- HUB VILLAGE ----------------------- */
  hub: {
    name: "Luminara Village",
    bg: "#243b2e", floor: "#3f6b4f", wall: "#1c2c22",
    grid: [
      "###############",
      "#.............#",
      "#....N........#",
      "#.............#",
      "#......G......#",
      "#.............#",
      "#....<.>......#",
      "#.............#",
      "#.............#",
      "#.............#",
      "###############",
    ],
    npc: ["Elder", [
      "Welcome home, " + STORY.heroName + "!",
      "Two shards still lie in the dungeons beyond the village.",
      "Left is the Verdant Hollow. Right is the Glimmering Grotto.",
      "Bring the shards back to the gem pedestal here, then touch it.",
      "I believe in you!"
    ]],
    exits: {
      "<": { to: "vh1", spawn: [1, 4] },    // left door -> Verdant Hollow
      ">": { to: "gr1", spawn: [1, 4] },    // right door -> Grotto
    }
  },

  /* -------------------- DUNGEON 1: VERDANT HOLLOW ------------------ */
  vh1: {
    name: "Verdant Hollow",
    bg: "#1d3024", floor: "#356048", wall: "#142019",
    grid: [
      "###############",
      "#.....x.......#",
      "#.............#",
      "#...x.....VVV.#",
      "<.........V...>",
      "#.........VVV.#",
      "#......x......#",
      "#.............#",
      "#.............#",
      "###############",
      "###############",
    ],
    exits: {
      "<": { to: "hub", spawn: [5, 7] },    // back to village
      ">": { to: "vh2", spawn: [1, 4] },    // deeper into the dungeon
    },
    note: "Cut the vines to open the path right!"
  },
  vh2: {
    name: "Verdant Hollow",
    bg: "#1d3024", floor: "#356048", wall: "#142019",
    grid: [
      "#######^#######",
      "#######g#######",
      "#.............#",
      "#.............#",
      "<....B...P....#",
      "#.............#",
      "#........x....#",
      "#.............#",
      "#.............#",
      "###############",
      "###############",
    ],
    exits: {
      "<": { to: "vh1", spawn: [13, 4] },
      "^": { to: "vh3", spawn: [7, 7] },    // north door opens after puzzle
    },
    note: "Push the block onto the plate to open the gate."
  },
  vh3: {
    name: "Forest Shard Altar",
    bg: "#22402f", floor: "#3c6e52", wall: "#142019",
    grid: [
      "###############",
      "#.............#",
      "#.............#",
      "#......S......#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#......v......#",
      "###############",
      "###############",
    ],
    shard: "Forest Shard",
    exits: { "v": { to: "vh2", spawn: [7, 2] } }
  },

  /* ------------------ DUNGEON 2: GLIMMERING GROTTO ----------------- */
  gr1: {
    name: "Glimmering Grotto",
    bg: "#1b2440", floor: "#34457a", wall: "#0f1426",
    grid: [
      "###############",
      "#.....y.......#",
      "#.............#",
      "#...x.........#",
      "<..........g..>",
      "#.............#",
      "#......y......#",
      "#....x........#",
      "#.............#",
      "###############",
      "###############",
    ],
    clearGate: true,   // gate opens when every enemy is defeated
    exits: {
      "<": { to: "hub", spawn: [7, 7] },
      ">": { to: "gr2", spawn: [1, 4] },
    },
    note: "Defeat every creature to open the gate."
  },
  gr2: {
    name: "Glimmering Grotto",
    bg: "#1b2440", floor: "#34457a", wall: "#0f1426",
    grid: [
      "#######^#######",
      "#######g#######",
      "#.............#",
      "#.............#",
      "<....B...P....#",
      "#.............#",
      "#...y.........#",
      "#.............#",
      "#.............#",
      "###############",
      "###############",
    ],
    exits: {
      "<": { to: "gr1", spawn: [13, 4] },
      "^": { to: "gr3", spawn: [7, 7] },
    },
    note: "Push the block onto the plate to open the gate."
  },
  gr3: {
    name: "Crystal Shard Altar",
    bg: "#222a4a", floor: "#3a4c86", wall: "#0f1426",
    grid: [
      "###############",
      "#.............#",
      "#.............#",
      "#......S......#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#......v......#",
      "###############",
      "###############",
    ],
    shard: "Crystal Shard",
    exits: { "v": { to: "gr2", spawn: [7, 2] } }
  },
};

const TOTAL_SHARDS = 2;   // we hid 2 shards above. Add more dungeons later!

/* =====================================================================
   From here down is the game "engine". You don't have to edit it,
   but you're welcome to peek! It handles drawing, moving, and fighting.
   ===================================================================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = W;
canvas.height = H;
ctx.imageSmoothingEnabled = false;

/* ------------------------------ input ----------------------------- */
// touchVec = direction from the on-screen joystick (phones)
// keyboard = arrow keys / WASD (computers)
const touchVec = { x: 0, y: 0, active: false };
let attackQueued = false;
let interactQueued = false;

const keys = {};
addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if ([" ", "j"].includes(e.key.toLowerCase())) attackQueued = true;
  if (["e", "k", "enter"].includes(e.key.toLowerCase())) interactQueued = true;
});
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

// Returns the final movement direction, preferring the joystick when held.
function readMovement() {
  if (touchVec.active) return { x: touchVec.x, y: touchVec.y };
  let x = 0, y = 0;
  if (keys["arrowleft"] || keys["a"]) x -= 1;
  if (keys["arrowright"] || keys["d"]) x += 1;
  if (keys["arrowup"] || keys["w"]) y -= 1;
  if (keys["arrowdown"] || keys["s"]) y += 1;
  return { x, y };
}

/* --------- touch joystick (left) + buttons (right) ---------------- */
const stick = document.getElementById("stick");
const knob = document.getElementById("knob");
let stickId = null, stickCx = 0, stickCy = 0;

function startStick(id, cx, cy) { stickId = id; stickCx = cx; stickCy = cy; }
function moveStick(px, py) {
  let dx = px - stickCx, dy = py - stickCy;
  const max = 45, len = Math.hypot(dx, dy) || 1;
  const cl = Math.min(len, max);
  const nx = (dx / len), ny = (dy / len);
  knob.style.transform = `translate(${nx * cl}px, ${ny * cl}px)`;
  if (len > 10) { touchVec.x = nx; touchVec.y = ny; touchVec.active = true; }
  else { touchVec.x = 0; touchVec.y = 0; touchVec.active = false; }
}
function endStick() {
  stickId = null;
  touchVec.x = 0; touchVec.y = 0; touchVec.active = false;
  knob.style.transform = "translate(0,0)";
}

stick.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const t = e.changedTouches[0];
  const r = stick.getBoundingClientRect();
  startStick(t.identifier, r.left + r.width / 2, r.top + r.height / 2);
  moveStick(t.clientX, t.clientY);
}, { passive: false });
stick.addEventListener("touchmove", (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === stickId) moveStick(t.clientX, t.clientY);
}, { passive: false });
stick.addEventListener("touchend", (e) => {
  for (const t of e.changedTouches) if (t.identifier === stickId) endStick();
}, { passive: false });
stick.addEventListener("touchcancel", endStick, { passive: false });

function bindButton(id, onPress) {
  const el = document.getElementById(id);
  el.addEventListener("touchstart", (e) => { e.preventDefault(); onPress(); el.classList.add("pressed"); }, { passive: false });
  el.addEventListener("touchend", (e) => { e.preventDefault(); el.classList.remove("pressed"); }, { passive: false });
  el.addEventListener("mousedown", (e) => { e.preventDefault(); onPress(); });
}
bindButton("btnA", () => { attackQueued = true; });
bindButton("btnB", () => { interactQueued = true; });

/* ------------------------------ state ----------------------------- */
const game = {
  state: "title",          // title | play | dialog | win
  roomId: "hub",
  room: null,              // runtime copy of current room
  shards: 0,
  maxHearts: TUNING.startHearts,
  hearts: TUNING.startHearts,
  essence: 0,
  dialog: null,            // {lines:[], i:0, after:fn}
  flicker: 0,
};

const player = {
  x: W / 2, y: ROWS * TILE / 2 + HUD_H,
  r: 11, speed: 130,
  dir: "down",
  attackTime: 0,           // >0 while swinging
  hurtTime: 0,             // invulnerability timer
};

let enemies = [];
let particles = [];
let pickups = [];

/* ----------------------- save / load progress -------------------- */
function save() {
  try {
    localStorage.setItem("qmg_save", JSON.stringify({
      roomId: "hub", shards: game.shards, maxHearts: game.maxHearts,
      collected: collectedShards, opened: openedChests,
    }));
  } catch (e) {}
}
function loadSave() {
  try { return JSON.parse(localStorage.getItem("qmg_save")); } catch (e) { return null; }
}
let collectedShards = {};   // roomId -> true
let openedChests = {};      // "roomId:c:r" -> true

/* --------------------------- room loading ------------------------- */
function loadRoom(id, spawnTile) {
  const def = ROOMS[id];
  game.roomId = id;
  // make a fresh, editable copy of the grid (array of char arrays)
  const grid = def.grid.map((row) => row.split(""));
  enemies = [];
  particles = [];
  pickups = [];

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const ch = grid[r][c];
      const px = c * TILE + TILE / 2;
      const py = r * TILE + TILE / 2 + HUD_H;
      if (ch === "x") { enemies.push(makeEnemy("slime", px, py)); grid[r][c] = "."; }
      else if (ch === "y") { enemies.push(makeEnemy("bat", px, py)); grid[r][c] = "."; }
      else if (ch === "C" && openedChests[id + ":" + c + ":" + r]) { grid[r][c] = "."; }
      else if (ch === "S" && collectedShards[id]) { grid[r][c] = "."; }
    }
  }

  game.room = { def, grid };

  // If this room's gate puzzle was already solved (shard taken), keep gate open.
  if (collectedShards[id]) {} // altar rooms have no gate

  if (spawnTile) {
    player.x = spawnTile[0] * TILE + TILE / 2;
    player.y = spawnTile[1] * TILE + TILE / 2 + HUD_H;
  }
  // brief safety so you don't walk straight into a hit when a room loads
  player.hurtTime = Math.max(player.hurtTime, TUNING.spawnGrace);
  if (def.note) showToast(def.note);
}

/* ------------------------------ enemies --------------------------- */
function makeEnemy(kind, x, y) {
  if (kind === "slime") return { kind, x, y, r: 11, hp: 2, hurt: 0, t: Math.random() * 6, vx: 0, vy: 0 };
  return { kind, x, y, r: 9, hp: 1, hurt: 0, t: Math.random() * 6, ox: x, oy: y };
}

function updateEnemies(dt) {
  for (const e of enemies) {
    e.t += dt;
    if (e.hurt > 0) e.hurt -= dt;
    const dx = player.x - e.x, dy = player.y - e.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (e.kind === "slime") {
      const chase = dist < TUNING.slimeChaseRange;
      const sp = chase ? TUNING.slimeChaseSpeed : 18;
      if (chase) { e.vx = (dx / dist) * sp; e.vy = (dy / dist) * sp; }
      else {
        // gentle wander
        e.vx = Math.cos(e.t * 0.7) * sp;
        e.vy = Math.sin(e.t * 0.9) * sp;
      }
      moveCircle(e, e.vx * dt, e.vy * dt);
    } else { // bat: swoops in a sine pattern, drifts toward player
      const sp = TUNING.batSpeed;
      e.x += ((dx / dist) * sp + Math.cos(e.t * 4) * TUNING.batWaggle) * dt;
      e.y += ((dy / dist) * sp + Math.sin(e.t * 4) * TUNING.batWaggle) * dt;
      clampToRoom(e);
    }

    // touch the hero -> damage
    if (player.hurtTime <= 0 && dist < e.r + player.r - 2) hurtPlayer(e);
  }
  enemies = enemies.filter((e) => e.hp > 0);

  // gate that opens when all enemies are gone
  if (game.room.def.clearGate && enemies.length === 0) openAllGates();
}

/* ------------------------- collision helpers ---------------------- */
function tileAtPx(px, py) {
  const c = Math.floor(px / TILE);
  const r = Math.floor((py - HUD_H) / TILE);
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return "#";
  return game.room.grid[r][c];
}
function isSolid(ch) {
  return ch === "#" || ch === "V" || ch === "B" || ch === "g" ||
         ch === "C" || ch === "N" || ch === "G";
}
function clampToRoom(o) {
  o.x = Math.max(TILE + o.r, Math.min(W - TILE - o.r, o.x));
  o.y = Math.max(HUD_H + TILE + o.r, Math.min(H - TILE - o.r, o.y));
}

// Move a circle (player/enemy) with simple wall sliding.
function moveCircle(o, dx, dy) {
  const steps = Math.ceil((Math.abs(dx) + Math.abs(dy)) / 4) || 1;
  for (let i = 0; i < steps; i++) {
    const sx = dx / steps, sy = dy / steps;
    if (!hitsWall(o.x + sx, o.y, o.r)) o.x += sx;
    if (!hitsWall(o.x, o.y + sy, o.r)) o.y += sy;
  }
}
function hitsWall(px, py, r) {
  // check the four edge points of the circle
  const pts = [[px - r, py], [px + r, py], [px, py - r], [px, py + r]];
  for (const [x, y] of pts) if (isSolid(tileAtPx(x, y))) return true;
  return false;
}

/* ------------------------- player update -------------------------- */
function updatePlayer(dt) {
  const mv = readMovement();
  let mx = mv.x, my = mv.y;
  const mag = Math.hypot(mx, my);
  if (mag > 1) { mx /= mag; my /= mag; }

  if (mag > 0.1) {
    if (Math.abs(mx) > Math.abs(my)) player.dir = mx < 0 ? "left" : "right";
    else player.dir = my < 0 ? "up" : "down";
    tryMove(mx * player.speed * dt, my * player.speed * dt);
  }

  if (player.attackTime > 0) player.attackTime -= dt;
  if (player.hurtTime > 0) player.hurtTime -= dt;

  if (attackQueued) { attackQueued = false; doAttack(); }
  if (interactQueued) { interactQueued = false; doInteract(); }

  checkTriggers();
}

function tryMove(dx, dy) {
  // try to push blocks if we walk into one
  const aheadX = player.x + Math.sign(dx) * (player.r + 2);
  const aheadY = player.y + Math.sign(dy) * (player.r + 2);
  if (dx && tileAtPx(aheadX, player.y) === "B") pushBlock(aheadX, player.y, Math.sign(dx), 0);
  if (dy && tileAtPx(player.x, aheadY) === "B") pushBlock(player.x, aheadY, 0, Math.sign(dy));
  moveCircle(player, dx, dy);
}

let pushCooldown = 0;
function pushBlock(px, py, sx, sy) {
  if (pushCooldown > 0) return;
  const c = Math.floor(px / TILE), r = Math.floor((py - HUD_H) / TILE);
  const nc = c + sx, nr = r + sy;
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
  const dest = game.room.grid[nr][nc];
  if (dest === "." || dest === "P") {
    // leave behind floor (or a plate if one was here)
    game.room.grid[r][c] = ".";
    game.room.grid[nr][nc] = "B";
    pushCooldown = 0.18;
    checkPlates();
  }
}

function checkPlates() {
  // a plate counts as pressed if a block sits on it OR has covered it.
  // We track plates by remembering their positions.
  let plates = 0, pressed = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = game.room.grid[r][c];
      if (ch === "P") plates++;
    }
  }
  // count blocks resting where a plate used to be (we marked plate->block)
  // Simpler approach: a plate is "solved" when there are no 'P' tiles left
  // because pushing a block onto it overwrote the 'P'. So:
  if (plates === 0 && game.room.def.grid.join("").includes("P")) {
    openAllGates();
    showToast("A gate rumbles open!");
  }
}

function openAllGates() {
  let changed = false;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (game.room.grid[r][c] === "g") { game.room.grid[r][c] = "."; changed = true; }
  if (changed) for (let i = 0; i < 14; i++) sparkle(W / 2, HUD_H + TILE, "#ffe08a");
}

/* ------------------------------ attack ---------------------------- */
function doAttack() {
  if (player.attackTime > 0) return;
  player.attackTime = 0.28;
  const reach = 26;
  let hx = player.x, hy = player.y;
  if (player.dir === "left") hx -= reach;
  if (player.dir === "right") hx += reach;
  if (player.dir === "up") hy -= reach;
  if (player.dir === "down") hy += reach;

  // cut vines in front of you
  const vc = Math.floor(hx / TILE), vr = Math.floor((hy - HUD_H) / TILE);
  if (vr >= 0 && vr < ROWS && vc >= 0 && vc < COLS && game.room.grid[vr][vc] === "V") {
    game.room.grid[vr][vc] = ".";
    for (let i = 0; i < 8; i++) sparkle(vc * TILE + 16, vr * TILE + 16 + HUD_H, "#6fd66f");
  }

  // hit enemies in front of you
  for (const e of enemies) {
    if (Math.hypot(e.x - hx, e.y - hy) < e.r + 16) {
      e.hp -= 1; e.hurt = 0.2;
      const k = 18;
      if (player.dir === "left") e.x -= k;
      if (player.dir === "right") e.x += k;
      if (player.dir === "up") e.y -= k;
      if (player.dir === "down") e.y += k;
      clampToRoom(e);
      if (e.hp <= 0) { for (let i = 0; i < 10; i++) sparkle(e.x, e.y, e.kind === "slime" ? "#7fe07f" : "#9aa6ff"); dropEssence(e.x, e.y); }
    }
  }
}

function dropEssence(x, y) {
  if (Math.random() < 0.6) pickups.push({ x, y, r: 6, t: 0 });
}

/* ----------------------------- damage ----------------------------- */
function hurtPlayer(enemy) {
  game.hearts -= 1;
  player.hurtTime = TUNING.hurtInvuln;
  // shove the hero away from whatever touched them, so they aren't pinned
  if (enemy) {
    const dx = player.x - enemy.x, dy = player.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    moveCircle(player, (dx / d) * TUNING.knockback, (dy / d) * TUNING.knockback);
  }
  for (let i = 0; i < 10; i++) sparkle(player.x, player.y, "#ff7a7a");
  if (game.hearts <= 0) respawn();
}
function respawn() {
  game.hearts = game.maxHearts;
  showToast("You wake up at the village...");
  loadRoom("hub", [7, 8]);
}

/* ---------------------------- triggers ---------------------------- */
function checkTriggers() {
  const ch = tileAtPx(player.x, player.y);
  // doors
  if ("^v<>".includes(ch)) {
    const exit = game.room.def.exits[ch];
    if (exit) { save(); loadRoom(exit.to, exit.spawn); return; }
  }
  // shard altar
  if (ch === "S" && !collectedShards[game.roomId]) {
    collectedShards[game.roomId] = true;
    game.shards += 1;
    const c = Math.floor(player.x / TILE), r = Math.floor((player.y - HUD_H) / TILE);
    game.room.grid[r][c] = ".";
    save();
    startDialog([
      "You lift the " + (game.room.def.shard || "Gem Shard") + " from the altar!",
      "Its warm light fills your heart with courage.",
      "Shards recovered: " + game.shards + " of " + TOTAL_SHARDS + ".",
      game.shards >= TOTAL_SHARDS
        ? "All shards found! Return to the gem pedestal in the village."
        : "Return to the village, then seek the next dungeon."
    ]);
  }
  // pickups
  for (const p of pickups) {
    if (Math.hypot(p.x - player.x, p.y - player.y) < player.r + p.r) {
      p.dead = true; game.essence += 1;
    }
  }
  pickups = pickups.filter((p) => !p.dead);
}

function doInteract() {
  // talk to an NPC standing in front of us
  const reach = 22;
  let hx = player.x, hy = player.y;
  if (player.dir === "left") hx -= reach;
  if (player.dir === "right") hx += reach;
  if (player.dir === "up") hy -= reach;
  if (player.dir === "down") hy += reach;
  const ch = tileAtPx(hx, hy);
  if (ch === "N" && game.room.def.npc) {
    startDialog(game.room.def.npc[1]);
    return;
  }
  if (ch === "G") { tryRestoreGem(); return; }
}

function tryRestoreGem() {
  if (game.shards >= TOTAL_SHARDS) {
    game.state = "win";
    startDialog(STORY.win, () => { game.state = "win"; });
  } else {
    startDialog([
      "The gem pedestal hums softly.",
      "You still need " + (TOTAL_SHARDS - game.shards) + " more shard(s) before it can be restored."
    ]);
  }
}

/* ----------------------------- dialog ----------------------------- */
function startDialog(lines, after) {
  game.dialog = { lines, i: 0, after: after || null };
  game.state = "dialog";
}
function advanceDialog() {
  if (!game.dialog) return;
  game.dialog.i += 1;
  if (game.dialog.i >= game.dialog.lines.length) {
    const after = game.dialog.after;
    game.dialog = null;
    if (game.state !== "win") game.state = "play";
    if (after) after();
  }
}

/* ----------------------------- toast ------------------------------ */
let toast = null;
function showToast(text) { toast = { text, t: 2.6 }; }

/* --------------------------- particles ---------------------------- */
function sparkle(x, y, color) {
  particles.push({
    x, y, color, t: 0.5,
    vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120,
  });
}
function updateParticles(dt) {
  for (const p of particles) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  particles = particles.filter((p) => p.t > 0);
  for (const p of pickups) p.t += dt;
}

/* ------------------------------ drawing --------------------------- */
function draw() {
  const room = game.room;
  ctx.fillStyle = room ? room.def.bg : "#101820";
  ctx.fillRect(0, 0, W, H);

  if (game.state === "title") { drawTitle(); return; }
  if (!room) return;

  // floor + tiles
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = room.grid[r][c];
      const x = c * TILE, y = r * TILE + HUD_H;
      // base floor under everything
      ctx.fillStyle = room.def.floor;
      ctx.fillRect(x, y, TILE, TILE);
      drawTile(ch, x, y, room);
    }
  }

  drawPickups();
  drawEnemies();
  drawPlayer();
  drawParticles();
  drawHUD();
  if (toast) drawToast();
  if (game.dialog) drawDialog();
  else if (game.state === "win") drawWinScreen();
}

function drawWinScreen() {
  ctx.fillStyle = "rgba(8,12,20,0.78)";
  ctx.fillRect(0, 0, W, H);
  glowDiamond(W / 2, H / 2 - 50 + Math.sin(Date.now() / 350) * 5, "#fff0a6");
  ctx.fillStyle = "#ffe08a"; ctx.textAlign = "center"; ctx.font = "bold 30px sans-serif";
  ctx.fillText("VICTORY!", W / 2, H / 2 + 4);
  ctx.fillStyle = "#fff"; ctx.font = "14px sans-serif";
  ctx.fillText("The Magic Gem is whole again.", W / 2, H / 2 + 38);
  ctx.fillStyle = "#cfe3ff"; ctx.font = "12px sans-serif";
  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) ctx.fillText("tap to return to the title", W / 2, H / 2 + 74);
  ctx.textAlign = "left";
}

function drawTile(ch, x, y, room) {
  switch (ch) {
    case "#":
      ctx.fillStyle = room.def.wall;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(x, y, TILE, 4);
      break;
    case "V": // vine
      ctx.fillStyle = "#2f7d3f";
      ctx.fillRect(x + 3, y, 6, TILE);
      ctx.fillRect(x + 14, y, 6, TILE);
      ctx.fillRect(x + 23, y, 6, TILE);
      ctx.fillStyle = "#56b85a";
      for (let i = 4; i < TILE; i += 9) { ctx.fillRect(x + 1, y + i, 4, 4); ctx.fillRect(x + 20, y + i + 3, 4, 4); }
      break;
    case "B": // pushable block
      ctx.fillStyle = "#8a6a44";
      ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
      ctx.fillStyle = "#6b5135";
      ctx.fillRect(x + 3, y + 3, TILE - 6, 5);
      ctx.strokeStyle = "#4a3823"; ctx.strokeRect(x + 3.5, y + 3.5, TILE - 7, TILE - 7);
      break;
    case "P": // pressure plate
      ctx.fillStyle = "#caa64a";
      ctx.fillRect(x + 7, y + 7, TILE - 14, TILE - 14);
      ctx.strokeStyle = "#7a6320"; ctx.strokeRect(x + 7.5, y + 7.5, TILE - 15, TILE - 15);
      break;
    case "g": // closed gate
      ctx.fillStyle = "#6b6f78";
      for (let i = 0; i < TILE; i += 7) ctx.fillRect(x + i, y, 4, TILE);
      ctx.fillStyle = "#3a3d44"; ctx.fillRect(x, y + TILE / 2 - 2, TILE, 4);
      break;
    case "C": // chest
      ctx.fillStyle = "#b5862f"; ctx.fillRect(x + 4, y + 10, TILE - 8, TILE - 14);
      ctx.fillStyle = "#7a5a1e"; ctx.fillRect(x + 4, y + 8, TILE - 8, 6);
      ctx.fillStyle = "#ffe08a"; ctx.fillRect(x + TILE / 2 - 2, y + 14, 4, 5);
      break;
    case "S": // shard altar
      glowDiamond(x + TILE / 2, y + TILE / 2, "#8fe3ff");
      break;
    case "G": // gem pedestal
      ctx.fillStyle = "#5b5b6b"; ctx.fillRect(x + 6, y + 14, TILE - 12, TILE - 14);
      glowDiamond(x + TILE / 2, y + 8 + Math.sin(Date.now() / 300) * 2,
                  game.shards >= TOTAL_SHARDS ? "#fff0a6" : "#9fb0ff");
      break;
    case "N": // npc
      drawNpc(x, y);
      break;
    case "^": case "v": case "<": case ">":
      drawDoor(ch, x, y, room);
      break;
  }
}

function glowDiamond(cx, cy, color) {
  const s = 7 + Math.sin(Date.now() / 250) * 1.5;
  ctx.save();
  ctx.globalAlpha = 0.35; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, s + 8, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.8;
  ctx.fillRect(cx - 2, cy - s + 3, 2, s);
  ctx.restore();
}

function drawDoor(ch, x, y, room) {
  ctx.fillStyle = "#1a1208";
  ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
  ctx.fillStyle = "#caa64a";
  ctx.fillRect(x + 4, y + 4, TILE - 8, 4);
}

function drawNpc(x, y) {
  ctx.fillStyle = "#d8b48c"; // robe
  ctx.fillRect(x + 9, y + 12, 14, 16);
  ctx.fillStyle = "#f0d0a8"; // head
  ctx.beginPath(); ctx.arc(x + 16, y + 9, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(x + 10, y + 26, 12, 3); // beard
}

function drawPlayer() {
  const x = player.x, y = player.y;
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(x, y + 10, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

  const blink = player.hurtTime > 0 && Math.floor(player.hurtTime * 12) % 2 === 0;
  if (!blink) {
    // body (green tunic)
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(x - 8, y - 4, 16, 14);
    // head
    ctx.fillStyle = "#f3c9a0";
    ctx.beginPath(); ctx.arc(x, y - 9, 7, 0, Math.PI * 2); ctx.fill();
    // hair / cap
    ctx.fillStyle = "#7a4a23";
    ctx.fillRect(x - 7, y - 16, 14, 5);
    // facing eyes
    ctx.fillStyle = "#222";
    if (player.dir === "down") { ctx.fillRect(x - 4, y - 9, 2, 2); ctx.fillRect(x + 2, y - 9, 2, 2); }
    if (player.dir === "up") { /* back of head */ }
    if (player.dir === "left") { ctx.fillRect(x - 5, y - 9, 2, 2); }
    if (player.dir === "right") { ctx.fillRect(x + 3, y - 9, 2, 2); }
  }

  // sword swing
  if (player.attackTime > 0) {
    ctx.strokeStyle = "#e9f6ff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    let sx = x, sy = y, ex = x, ey = y;
    if (player.dir === "left") { ex = x - 26; ey = y; }
    if (player.dir === "right") { ex = x + 26; ey = y; }
    if (player.dir === "up") { ex = x; ey = y - 26; }
    if (player.dir === "down") { ex = x; ey = y + 26; }
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = 1;
  }
}

function drawEnemies() {
  for (const e of enemies) {
    const flash = e.hurt > 0 && Math.floor(e.hurt * 20) % 2 === 0;
    if (e.kind === "slime") {
      const wob = Math.sin(e.t * 6) * 2;
      ctx.fillStyle = flash ? "#ffffff" : "#5fbf5f";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + 2, e.r, e.r - 2 + wob, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#234d23";
      ctx.fillRect(e.x - 5, e.y - 2, 2, 2); ctx.fillRect(e.x + 3, e.y - 2, 2, 2);
    } else {
      ctx.fillStyle = flash ? "#ffffff" : "#7a6fae";
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
      // wings
      const flap = Math.sin(e.t * 16) * 5;
      ctx.beginPath();
      ctx.moveTo(e.x - e.r, e.y); ctx.lineTo(e.x - e.r - 8, e.y - 5 - flap); ctx.lineTo(e.x - e.r - 2, e.y + 3); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(e.x + e.r, e.y); ctx.lineTo(e.x + e.r + 8, e.y - 5 - flap); ctx.lineTo(e.x + e.r + 2, e.y + 3); ctx.fill();
      ctx.fillStyle = "#ffd34d"; ctx.fillRect(e.x - 4, e.y - 1, 2, 2); ctx.fillRect(e.x + 2, e.y - 1, 2, 2);
    }
  }
}

function drawPickups() {
  for (const p of pickups) {
    const yy = p.y + Math.sin(p.t * 5) * 2;
    ctx.fillStyle = "#ffe27a";
    ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(p.x, yy, p.r + 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(p.x, yy, p.r - 2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.t * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
}

/* ------------------------------- HUD ------------------------------ */
function drawHUD() {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, HUD_H);
  // hearts
  for (let i = 0; i < game.maxHearts; i++) {
    drawHeart(12 + i * 24, 20, i < game.hearts);
  }
  // shards
  glowDiamond(W - 96, 20, "#8fe3ff");
  ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.textBaseline = "middle";
  ctx.fillText("x " + game.shards + "/" + TOTAL_SHARDS, W - 80, 20);
  // essence
  ctx.fillStyle = "#ffe27a";
  ctx.beginPath(); ctx.arc(W - 168, 20, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText("" + game.essence, W - 156, 20);
  // room name
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(game.room ? game.room.def.name : "", W / 2, 20);
  ctx.textAlign = "left";
}

function drawHeart(cx, cy, full) {
  ctx.fillStyle = full ? "#ff5a6e" : "#5a3038";
  ctx.beginPath();
  ctx.moveTo(cx, cy + 6);
  ctx.bezierCurveTo(cx - 9, cy - 3, cx - 4, cy - 9, cx, cy - 3);
  ctx.bezierCurveTo(cx + 4, cy - 9, cx + 9, cy - 3, cx, cy + 6);
  ctx.fill();
}

function drawToast() {
  ctx.globalAlpha = Math.min(1, toast.t);
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.font = "13px sans-serif"; ctx.textAlign = "center";
  const w = ctx.measureText(toast.text).width + 24;
  ctx.fillRect(W / 2 - w / 2, H - 34, w, 22);
  ctx.fillStyle = "#fff";
  ctx.fillText(toast.text, W / 2, H - 23);
  ctx.textAlign = "left"; ctx.globalAlpha = 1;
}

function drawDialog() {
  const lines = game.dialog ? game.dialog.lines : [];
  const i = game.dialog ? game.dialog.i : 0;
  const boxH = 90;
  ctx.fillStyle = "rgba(8,12,20,0.92)";
  ctx.fillRect(12, H - boxH - 12, W - 24, boxH);
  ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 2;
  ctx.strokeRect(12, H - boxH - 12, W - 24, boxH);
  ctx.fillStyle = "#fff"; ctx.font = "14px sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  wrapText(lines[i] || "", 26, H - boxH + 2, W - 52, 19);
  ctx.fillStyle = "#ffe08a"; ctx.font = "11px sans-serif";
  ctx.fillText("tap / press B to continue", 26, H - 26);
  ctx.textBaseline = "middle";
}

function wrapText(text, x, y, maxW, lh) {
  const words = String(text).split(" ");
  let line = "", yy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = word + " "; yy += lh; }
    else line = test;
  }
  ctx.fillText(line, x, yy);
}

/* ----------------------------- title ------------------------------ */
function drawTitle() {
  ctx.fillStyle = "#0d1322"; ctx.fillRect(0, 0, W, H);
  // floating gem
  glowDiamond(W / 2, H / 2 - 40 + Math.sin(Date.now() / 400) * 6, "#ffe08a");
  ctx.fillStyle = "#fff"; ctx.textAlign = "center";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("Quest for the", W / 2, H / 2 + 6);
  ctx.fillStyle = "#ffe08a"; ctx.font = "bold 30px sans-serif";
  ctx.fillText("MAGIC GEM", W / 2, H / 2 + 38);
  ctx.fillStyle = "#cfe3ff"; ctx.font = "14px sans-serif";
  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) ctx.fillText("tap to begin", W / 2, H / 2 + 84);
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "11px sans-serif";
  ctx.fillText("A quest for Dad & Son", W / 2, H - 24);
  ctx.textAlign = "left";
}

/* --------------------------- start game --------------------------- */
function startGame() {
  const s = loadSave();
  if (s) {
    game.shards = s.shards || 0;
    // keep any bonus hearts from chests, but never below the friendly minimum
    game.maxHearts = Math.max(s.maxHearts || 0, TUNING.startHearts);
    collectedShards = s.collected || {};
    openedChests = s.opened || {};
  }
  game.hearts = game.maxHearts;
  game.state = "play";
  loadRoom("hub", [7, 8]);
  if (!s) startDialog(STORY.intro);
}

// tapping the canvas: start the game, or advance dialog
canvas.addEventListener("pointerdown", () => {
  if (game.state === "title") startGame();
  else if (game.dialog) advanceDialog();
  else if (game.state === "win") {
    // finished the quest: clear progress and return to the title for a replay
    try { localStorage.removeItem("qmg_save"); } catch (e) {}
    game.shards = 0; collectedShards = {}; openedChests = {};
    game.state = "title";
  }
});

/* ----------------------------- main loop -------------------------- */
let last = performance.now();
function loop(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.05) dt = 0.05; // avoid big jumps

  if (game.state === "play") {
    if (pushCooldown > 0) pushCooldown -= dt;
    updatePlayer(dt);
    updateEnemies(dt);
    updateParticles(dt);
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
  } else if (game.state === "dialog") {
    // allow B button / keyboard to advance
    if (interactQueued || attackQueued) { interactQueued = false; attackQueued = false; advanceDialog(); }
    updateParticles(dt);
  }

  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
