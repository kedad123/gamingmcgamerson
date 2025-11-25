import Game from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);

    // UI Buttons
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        game.start();
    });

    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.remove('hidden');
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const config = {
            snakeSpeed: parseInt(document.getElementById('opt-snake-speed').value),
            tetrisSpeed: parseInt(document.getElementById('opt-tetris-speed').value),
            snakeStartSize: parseInt(document.getElementById('opt-snake-size').value),
            growRate: parseInt(document.getElementById('opt-grow-rate').value),
            shrinkRate: parseInt(document.getElementById('opt-shrink-rate').value),
            rows: parseInt(document.getElementById('opt-rows').value),
            cols: parseInt(document.getElementById('opt-cols').value),
            proMode: document.getElementById('opt-pro-mode').checked
        };

        game.updateConfig(config);
        document.getElementById('settings-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    });

    // Settings Range Listeners
    const ranges = [
        'snake-speed', 'tetris-speed', 'snake-size',
        'grow-rate', 'shrink-rate', 'rows', 'cols'
    ];

    ranges.forEach(id => {
        const input = document.getElementById(`opt-${id}`);
        const span = document.getElementById(`val-${id}`);
        input.addEventListener('input', (e) => {
            span.innerText = e.target.value;
        });
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        game.reset();
        game.start();
    });
});
