const canvas1 = document.createElement('canvas');
const canvas2 = document.createElement('canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
canvas1.width = 800;
canvas1.height = 800;
canvas2.width = 800;
canvas2.height = 800;

canvas1.style.border = '1px solid black';
canvas2.style.border = '1px solid black';

document.body.appendChild(canvas1);
document.body.appendChild(canvas2);

// Audio elements
const badSound = new Audio('bad-sound.mp3'); // Replace with your bad sound URL
const goodSound = new Audio('good-sound.mp3'); // Replace with your good sound URL

// Game variables
let players = []; // Array of players
let projectiles = []; // Array of projectiles
let coins = []; // Array of coins
let score = 0;
let lives = 5;
const playerRadius = 10;
const projectileRadius = 5;
const coinRadius = 7;
const baseSpeed = 2;
let speed = baseSpeed;
let speedBoostP2 = baseSpeed;
const defaultCannonInterval = 80; // Default starting fire rate
let cannonInterval = defaultCannonInterval;
let coinSpawnInterval = 200; // Frames between coin spawns
let cannonTimer = cannonInterval;
let coinTimer = coinSpawnInterval;
let boostTimer = 0; // Timer for P1 speed boost
const boostDuration = 20; // Frames P1 boost lasts
let gameOver = false;

// Shake variables
let shakeIntensity = 0; // Amount of shake
let shakeDecay = 0.8; // How quickly the shake dissipates

// Glow variables
let glowIntensity = 0; // Glow amount
let glowDecay = 0.9; // How quickly the glow fades

// High score list
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
const maxHighScores = 10; // Keep top 10 scores

// Rate adjustment variables
const cannonIntervalDecrease = 2; // Rate at which cannon fire rate increases
const speedIncreaseRateP2 = 0.1; // Rate at which P2 speed increases

// Player class
class Player {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.dx = 0;
    this.dy = 0;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;

    // Boundary conditions
    if (this.x < 0) this.x = 0;
    if (this.x > canvas1.width) this.x = canvas1.width;
    if (this.y < 0) this.y = 0;
    if (this.y > canvas1.height) this.y = canvas1.height;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, playerRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

// Projectile class
class Projectile {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, projectileRadius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}

// Coin class
class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, coinRadius, 0, Math.PI * 2);
    ctx.fillStyle = "gold";
    ctx.fill();
    ctx.closePath();
  }
}

// Initialize players
function resetGame() {
  players = [];
  projectiles = [];
  coins = [];
  score = 0;
  lives = 5;
  speed = baseSpeed;
  speedBoostP2 = baseSpeed;
  cannonInterval = defaultCannonInterval;
  cannonTimer = cannonInterval;
  coinTimer = coinSpawnInterval;
  boostTimer = 0;
  gameOver = false;

  players.push(new Player(200, 300, "blue")); // Player 1 for dodging
  players.push(new Player(200, 300, "green")); // Player 2 for collecting
}
resetGame();

// Keyboard controls
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function handleInput(player, index) {
  if (index === 0) {
    player.dx = 0;
    player.dy = 0;
    let currentSpeed = speed;

    if (keys[" "]) {
      if (boostTimer <= 0) {
        boostTimer = boostDuration;
      }
    }

    if (boostTimer > 0) {
      currentSpeed = speed * 2;
      boostTimer--;
    }

    if (keys["ArrowUp"]) player.dy = -currentSpeed;
    if (keys["ArrowDown"]) player.dy = currentSpeed;
    if (keys["ArrowLeft"]) player.dx = -currentSpeed;
    if (keys["ArrowRight"]) player.dx = currentSpeed;

    if (keys["Shift"]) {
      player.dx = -player.dx;
      player.dy = -player.dy;
    }
  } else {
    const reference = players[0];
    let dx = -reference.dx;
    let dy = -reference.dy;

    if (keys["Control"] && keys["Shift"]) {
      [dx, dy] = [dy, -dx];
    } else if (keys["Control"]) {
      [dx, dy] = [-dy, dx];
    }

    player.dx = dx * (speedBoostP2 / baseSpeed);
    player.dy = dy * (speedBoostP2 / baseSpeed);
  }
}

function spawnProjectiles() {
  if (cannonTimer <= 0) {
    const cannonPositions = [
      { x: canvas1.width / 2, y: 0 },
      { x: canvas1.width / 2, y: canvas1.height },
      { x: 0, y: canvas1.height / 2 },
      { x: canvas1.width, y: canvas1.height / 2 },
    ];

    cannonPositions.forEach((pos) => {
      const angle = Math.atan2(players[0].y - pos.y, players[0].x - pos.x);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      projectiles.push(new Projectile(pos.x, pos.y, dx, dy));
    });

    cannonTimer = cannonInterval;
  }
  cannonTimer--;
}

function spawnCoins() {
  if (coinTimer <= 0) {
    const x = Math.random() * canvas2.width;
    const y = Math.random() * canvas2.height;
    coins.push(new Coin(x, y));
    coinTimer = coinSpawnInterval;
  }
  coinTimer--;
}

function checkCollisions() {
  projectiles = projectiles.filter((projectile) => {
    const player1 = players[0];
    const dist = Math.hypot(player1.x - projectile.x, player1.y - projectile.y);
    if (dist < playerRadius + projectileRadius) {
      badSound.play();
      lives--;
      shakeIntensity = 10; // Trigger shake
      if (lives <= 0) gameOver = true;
      return false;
    }
    return true;
  });

  coins = coins.filter((coin) => {
    const player2 = players[1];
    const dist = Math.hypot(player2.x - coin.x, player2.y - coin.y);
    if (dist < playerRadius + coinRadius) {
      goodSound.play();
      score++;
      glowIntensity = 0.5; // Trigger glow
      speedBoostP2 += speedIncreaseRateP2;
      cannonInterval = Math.max(10, cannonInterval - cannonIntervalDecrease);
      return false;
    }
    return true;
  });
}

function applyShake(ctx) {
  if (shakeIntensity > 0) {
    const offsetX = (Math.random() - 0.5) * shakeIntensity * 2;
    const offsetY = (Math.random() - 0.5) * shakeIntensity * 2;
    ctx.setTransform(1, 0, 0, 1, offsetX, offsetY);
    shakeIntensity *= shakeDecay;
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

function applyGlow(ctx) {
  if (glowIntensity > 0) {
    ctx.fillStyle = `rgba(255, 255, 0, ${glowIntensity})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    glowIntensity *= glowDecay;
  }
}

function gameLoop() {
  if (gameOver) {
    ctx1.setTransform(1, 0, 0, 1, 0, 0);
    ctx2.setTransform(1, 0, 0, 1, 0, 0);

    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    ctx1.fillStyle = "black";
    ctx1.font = "30px Arial";
    ctx1.fillText("Game Over", canvas1.width / 2 - 70, canvas1.height / 2);
    ctx1.font = "20px Arial";
    ctx1.fillText(`Score: ${score}`, canvas1.width / 2 - 50, canvas1.height / 2 + 30);
    ctx1.fillText("Press R to Restart", canvas1.width / 2 - 90, canvas1.height / 2 + 60);

    window.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        resetGame();
        gameLoop();
      }
    });
    return;
  }

  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

  applyShake(ctx1);
  applyShake(ctx2);

  applyGlow(ctx1);
  applyGlow(ctx2);

  ctx1.fillStyle = "black";
  ctx1.fillText(`Lives: ${lives}`, 10, 20);
  ctx1.fillText(`Fire Rate: ${Math.round(1000 / cannonInterval)} ms/shot`, 10, 40);
  ctx2.fillStyle = "black";
  ctx2.fillText(`Score: ${score}`, 10, 20);
  ctx2.fillText(`P2 Speed: ${speedBoostP2.toFixed(2)}`, 10, 40);

  players.forEach((player, index) => {
    handleInput(player, index);
    player.move();
    player.draw(index === 0 ? ctx1 : ctx2);
  });

  spawnProjectiles();
  projectiles.forEach((projectile) => {
    projectile.move();
    projectile.draw(ctx1);
  });

  spawnCoins();
  coins.forEach((coin) => {
    coin.draw(ctx2);
  });

  checkCollisions();

  requestAnimationFrame(gameLoop);
}

gameLoop();
