export default class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createGrid();
    }

    createGrid() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }

    reset() {
        this.grid = this.createGrid();
    }

    isValidPosition(tetromino) {
        return tetromino.shape.every((row, dy) => {
            return row.every((value, dx) => {
                if (!value) return true;
                const x = tetromino.x + dx;
                const y = tetromino.y + dy;

                // Check bounds
                if (x < 0 || x >= this.cols || y >= this.rows) return false;

                // Check collision with static blocks
                if (y >= 0 && this.grid[y][x] !== 0) return false;

                return true;
            });
        });
    }

    lockTetromino(tetromino) {
        tetromino.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const x = tetromino.x + dx;
                    const y = tetromino.y + dy;
                    if (y >= 0 && y < this.rows) {
                        this.grid[y][x] = 1; // Mark as occupied
                    }
                }
            });
        });
    }

    checkLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                // Clear line
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // Check same row index again (since everything shifted down)
            }
        }
        return linesCleared;
    }

    draw(ctx, cellSize) {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    // Draw static block
                    ctx.fillStyle = '#555'; // Gray for dead blocks
                    ctx.fillRect(
                        x * cellSize,
                        y * cellSize,
                        cellSize - 2,
                        cellSize - 2
                    );
                }
            });
        });
    }
}
