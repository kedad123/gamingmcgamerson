import Board from './Board.js';
import Snake from './Snake.js';
import Tetromino from './Tetromino.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Default Config
        this.config = {
            snakeSpeed: 200,
            tetrisSpeed: 1000,
            snakeStartSize: 1,
            growRate: 1,
            shrinkRate: 5,
            rows: 20,
            cols: 10,
            proMode: true
        };

        this.applyConfig();
        this.bindInput();
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.applyConfig();
        this.reset();
    }

    applyConfig() {
        this.cols = this.config.cols;
        this.rows = this.config.rows;
        this.cellSize = 30;

        // Resize canvas
        this.width = this.cols * this.cellSize;
        this.height = this.rows * this.cellSize;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.board = new Board(this.rows, this.cols);
        this.snake = new Snake(this.board);
        this.fallingPiece = null;

        this.dropInterval = this.config.tetrisSpeed;
        this.snake.moveInterval = this.config.snakeSpeed;

        // Initialize timers
        this.lastTime = 0;
        this.dropCounter = 0;
        this.snake.moveTimer = 0;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.gameOver = false;
        this.reset();
        this.spawnTetromino();
        this.loop();
    }

    reset() {
        this.board.reset();
        this.snake.reset(this.config.snakeStartSize);
        this.score = 0;
        this.level = 1;
        this.updateUI();
    }

    spawnTetromino() {
        this.fallingPiece = new Tetromino();
    }

    bindInput() {
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.gameOver) return;

            // Snake Controls
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.snake.handleInput(e.key);
            }

            // Tetris Controls (WASD)
            if (this.fallingPiece) {
                if (e.key === 'a' || e.key === 'A') {
                    this.fallingPiece.x--;
                    if (!this.board.isValidPosition(this.fallingPiece)) this.fallingPiece.x++;
                }
                if (e.key === 'd' || e.key === 'D') {
                    this.fallingPiece.x++;
                    if (!this.board.isValidPosition(this.fallingPiece)) this.fallingPiece.x--;
                }
                if (e.key === 's' || e.key === 'S') {
                    this.fallingPiece.y++;
                    if (!this.board.isValidPosition(this.fallingPiece)) this.fallingPiece.y--;
                }
                if (e.key === 'w' || e.key === 'W') {
                    const originalShape = this.fallingPiece.shape;
                    this.fallingPiece.rotate();
                    if (!this.board.isValidPosition(this.fallingPiece)) {
                        this.fallingPiece.shape = originalShape; // Revert if invalid
                    }
                }
            }
        });
    }

    updateTetromino() {
        if (!this.fallingPiece) {
            this.spawnTetromino();
            return;
        }

        // Try moving down
        this.fallingPiece.y++;
        if (!this.board.isValidPosition(this.fallingPiece)) {
            // Hit something, move back up and lock
            this.fallingPiece.y--;
            this.lockPiece();
        }
    }

    lockPiece() {
        try {
            console.log("Locking piece...");
            // Check if snake is crushed
            if (this.checkSnakeCrush()) {
                console.log("Snake crushed!");
                this.endGame();
                return;
            }

            if (!this.fallingPiece) return;

            this.board.lockTetromino(this.fallingPiece);
            this.fallingPiece = null;

            // Snake grows when a piece drops
            const growRate = parseInt(this.config.growRate) || 1;
            console.log("Growing snake by", growRate);
            for (let i = 0; i < growRate; i++) {
                this.snake.grow();
            }

            // Check for lines
            const linesCleared = this.board.checkLines();
            if (linesCleared > 0) {
                console.log("Lines cleared:", linesCleared);
                this.score += linesCleared * 100 * this.level;

                // Snake shrinks when lines are cleared
                const shrinkRate = parseInt(this.config.shrinkRate) || 1;
                for (let i = 0; i < linesCleared * shrinkRate; i++) {
                    this.snake.shrink();
                }

                this.checkLevel();
                this.updateUI();
            }
        } catch (e) {
            console.error("Error in lockPiece:", e);
            this.endGame();
        }
    }

    checkLevel() {
        // Simple leveling: every 500 points?
        const newLevel = Math.floor(this.score / 500) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, this.config.tetrisSpeed - (this.level - 1) * 100);
        }
    }

    checkSnakeCrush() {
        if (!this.fallingPiece) return false;
        // Simple check: if any block of the falling piece overlaps with snake body
        return this.fallingPiece.shape.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                const x = this.fallingPiece.x + dx;
                const y = this.fallingPiece.y + dy;
                return this.snake.body.some(segment => segment.x === x && segment.y === y);
            });
        });
    }

    update(deltaTime) {
        if (this.gameOver) return;

        // Snake Update
        this.snake.moveTimer += deltaTime;
        if (this.snake.moveTimer > this.snake.moveInterval) {
            this.snake.moveTimer = 0;

            // Pro Mode Check: Check if next move hits falling piece
            if (this.config.proMode && this.fallingPiece) {
                const nextHead = {
                    x: this.snake.body[0].x + this.snake.direction.x,
                    y: this.snake.body[0].y + this.snake.direction.y
                };

                // Check collision with falling piece
                const hitFalling = this.fallingPiece.shape.some((row, dy) => {
                    return row.some((value, dx) => {
                        if (!value) return false;
                        const x = this.fallingPiece.x + dx;
                        const y = this.fallingPiece.y + dy;
                        return x === nextHead.x && y === nextHead.y;
                    });
                });

                if (hitFalling) {
                    console.log("Pro Mode Collision!");
                    this.endGame();
                    return;
                }
            }

            if (!this.snake.move()) {
                console.log("Snake died!");
                this.endGame();
                return;
            }
            // Check if snake ate something
            if (this.snake.justAte) {
                this.score += 10;
                this.updateUI();
            }
        }

        // Tetromino Falling
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.dropCounter = 0;
            this.updateTetromino();
        }
    }

    endGame() {
        console.log("Game Over triggered");
        this.gameOver = true;
        this.isRunning = false;
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    draw() {
        // Clear screen
        this.ctx.fillStyle = '#0f0f13';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Board (Static blocks)
        this.board.draw(this.ctx, this.cellSize);

        // Draw Snake
        this.snake.draw(this.ctx, this.cellSize);

        // Draw Falling Piece
        if (this.fallingPiece) {
            this.fallingPiece.draw(this.ctx, this.cellSize);
        }
    }

    loop(time = 0) {
        if (!this.isRunning) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    updateUI() {
        document.getElementById('score').innerText = this.score;
        document.getElementById('level').innerText = this.level;
    }
}
