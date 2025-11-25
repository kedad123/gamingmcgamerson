export const SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
};

export const COLORS = {
    I: '#00f0f0',
    J: '#0000f0',
    L: '#f0a000',
    O: '#f0f000',
    S: '#00f000',
    T: '#a000f0',
    Z: '#f00000'
};

export default class Tetromino {
    constructor() {
        const type = this.randomType();
        this.shape = SHAPES[type];
        this.color = COLORS[type];
        this.x = 3; // Center-ish
        this.y = 0;
    }

    randomType() {
        const types = 'IJLOSTZ';
        return types[Math.floor(Math.random() * types.length)];
    }

    rotate() {
        // Transpose + Reverse rows = 90 degree rotation
        const newShape = this.shape[0].map((val, index) =>
            this.shape.map(row => row[index]).reverse()
        );
        this.shape = newShape;
    }

    draw(ctx, cellSize) {
        ctx.fillStyle = this.color;
        this.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    ctx.fillRect(
                        (this.x + dx) * cellSize,
                        (this.y + dy) * cellSize,
                        cellSize - 2,
                        cellSize - 2
                    );
                }
            });
        });
    }
}
