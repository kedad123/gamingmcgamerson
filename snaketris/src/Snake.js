export default class Snake {
    constructor(board) {
        this.board = board;
        this.body = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveTimer = 0;
        this.moveInterval = 200; // Snake speed
        this.reset();
    }

    reset(startSize = 1) {
        // Start in the middle bottom, moving UP
        this.body = [];
        const size = parseInt(startSize) || 1;
        for (let i = 0; i < size; i++) {
            this.body.push({ x: 5, y: 19 + i }); // Stack downwards
        }

        this.direction = { x: 0, y: -1 };
        this.nextDirection = { x: 0, y: -1 };
    }

    shrink() {
        if (this.body.length > 1) {
            this.body.pop();
        }
    }

    grow() {
        if (this.body.length === 0) return;
        const tail = this.body[this.body.length - 1];
        this.body.push({ ...tail });
    }

    handleInput(key) {
        // Prevent 180 turns
        switch (key) {
            case 'ArrowUp':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    update(deltaTime) {
        this.moveTimer += deltaTime;
        if (this.moveTimer > this.moveInterval) {
            this.moveTimer = 0;
            this.move();
        }
    }

    move() {
        this.direction = this.nextDirection;
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Wall Collision
        if (head.x < 0 || head.x >= this.board.cols || head.y < 0 || head.y >= this.board.rows) {
            return false; // Collision
        }

        // Static Block Collision (EAT IT!)
        let ate = false;
        if (this.board.grid[head.y][head.x] !== 0) {
            this.board.grid[head.y][head.x] = 0; // Remove block
            ate = true;
            this.justAte = true; // Flag for Game to see
        } else {
            this.justAte = false;
        }

        // Self Collision
        if (this.body.some(segment => segment.x === head.x && segment.y === head.y)) {
            return false; // Collision
        }

        // Add new head
        this.body.unshift(head);

        // Remove tail (unless ate)
        if (!ate) {
            this.body.pop();
        }

        return true; // Move successful
    }

    draw(ctx, cellSize) {
        ctx.fillStyle = '#00ff9d';
        this.body.forEach(segment => {
            ctx.fillRect(
                segment.x * cellSize,
                segment.y * cellSize,
                cellSize - 2,
                cellSize - 2
            );
        });
    }
}
