// game.js
// EchoChase.io Game (Prototype)
// This code uses a simple HTML5 canvas and JavaScript for the game logic.

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// Game variables
let players = []; // Array of players
let echoes = []; // Array of echoes
let projectiles = []; // Array of projectiles
let coins = []; // Array of coins
let score = 0;
let lives = 5;
const playerRadius = 10;
const projectileRadius = 5;
const coinRadius = 7;
const echoDuration = 100; // Frames an echo lasts
const speed = 2;
let cannonInterval = 100; // Frames between cannon shots
const coinSpawnInterval = 200; // Frames between coin spawns
let cannonTimer = cannonInterval;
let coinTimer = coinSpawnInterval;

// Utility function to generate random colors
function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// Player class
class Player {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.dx = 0;
    this.dy = 0;
    this.echoTimer = 0;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;

    // Boundary conditions
    if (this.x < 0) this.x = 0;
    if (this.x > canvas.width) this.x = canvas.width;
    if (this.y < 0) this.y = 0;
    if (this.y > canvas.height) this.y = canvas.height;

    // Create echoes periodically
    if (this.echoTimer <= 0) {
      echoes.push(new Echo(this.x, this.y, this.color));
      this.echoTimer = 20; // Delay between echoes
    }
    this.echoTimer--;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, playerRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

// Echo class
class Echo {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.duration = echoDuration;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, playerRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color + "80"; // Slightly transparent
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.duration--;
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

  draw() {
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

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, coinRadius, 0, Math.PI * 2);
    ctx.fillStyle = "gold";
    ctx.fill();
    ctx.closePath();
  }
}

// Initialize players
players.push(new Player(100, 100, randomColor()));
players.push(new Player(700, 500, randomColor()));

// Keyboard controls
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function handleInput(player, index) {
  if (index === 0) {
    // Top dot (reference) moves normally
    player.dx = 0;
    player.dy = 0;
    if (keys['ArrowUp']) player.dy = -speed;
    if (keys['ArrowDown']) player.dy = speed;
    if (keys['ArrowLeft']) player.dx = -speed;
    if (keys['ArrowRight']) player.dx = speed;
  } else {
    // Second dot (controlled by Shift and Ctrl)
    const reference = players[0];
    let dx = reference.dx;
    let dy = reference.dy;

    if (keys['Shift'] && keys['Control']) {
      // Rotate -90 degrees
      [dx, dy] = [dy, -dx];
    } else if (keys['Shift']) {
      // Rotate 180 degrees
      dx = -dx;
      dy = -dy;
    } else if (keys['Control']) {
      // Rotate 90 degrees
      [dx, dy] = [-dy, dx];
    }

    player.dx = dx;
    player.dy = dy;
  }
}

function spawnCannonProjectiles() {
  if (cannonTimer <= 0) {
    const player1 = players[0];
    const cannons = [
      { x: canvas.width / 2, y: 0 }, // Top middle
      { x: canvas.width / 2, y: canvas.height }, // Bottom middle
      { x: canvas.width, y: canvas.height / 2 }, // Right middle
      { x: 0, y: canvas.height / 2 }, // Left middle
    ];

    cannons.forEach((cannon) => {
      const angle = Math.atan2(player1.y - cannon.y, player1.x - cannon.x);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      projectiles.push(new Projectile(cannon.x, cannon.y, dx, dy));
    });

    cannonTimer = cannonInterval;
    cannonInterval = Math.max(20, cannonInterval - 1); // Decrease interval over time
  }
  cannonTimer--;
}

function spawnCoins() {
  if (coinTimer <= 0) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
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
      lives--;
      if (lives <= 0) {
        displayGameOver();
      }
      return false; // Remove projectile after collision
    }
    return true;
  });

  coins = coins.filter((coin) => {
    const player2 = players[1];
    const dist = Math.hypot(player2.x - coin.x, player2.y - coin.y);
    if (dist < playerRadius + coinRadius) {
      score++;
      return false;
    }
    return true;
  });
}

function displayGameOver() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over! Press R to Restart", canvas.width / 2 - 150, canvas.height / 2);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      window.location.reload();
    }
  });
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Display player colors, score, lives, and bullet speed
  players.forEach((player, index) => {
    ctx.fillStyle = "black";
    ctx.fillText(`Player ${index + 1} Color: ${player.color}`, 10, 20 + index * 20);
  });
  ctx.fillText(`Score: ${score}`, 10, 60);
  ctx.fillText(`Lives: ${lives}`, 10, 80);
  ctx.fillText(`Bullet Speed: ${Math.round(1000 / cannonInterval)} ms/shot`, 10, 100);

  // Update players
  players.forEach((player, index) => {
    handleInput(player, index);
    player.move();
    player.draw();
  });

  // Spawn and move projectiles
  spawnCannonProjectiles();
  projectiles.forEach((projectile) => {
    projectile.move();
    projectile.draw();
  });

  // Spawn and draw coins
  spawnCoins();
  coins.forEach((coin) => {
    coin.draw();
  });

  // Check collisions
  checkCollisions();

  // Update and draw echoes
  echoes = echoes.filter((echo) => echo.duration > 0);
  echoes.forEach((echo) => {
    echo.update();
    echo.draw();
  });

  if (lives > 0) {
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
