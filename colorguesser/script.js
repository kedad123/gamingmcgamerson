// Game state
let score = 0;
let streak = 0;
let bestStreak = 0;
let currentCorrectColor = null;
let hasAnswered = false;

// Color database with detailed descriptions
const colorData = [
    // Blues
    { color: '#4169E1', description: 'A vibrant, medium-dark blue that evokes the grandeur of royal robes and majestic crowns. This color has been associated with nobility and dignity throughout history.' },
    { color: '#87CEEB', description: 'A light, airy blue that captures the essence of a clear afternoon sky. This serene color brings feelings of peace and tranquility, like gazing up on a cloudless day.' },
    { color: '#000080', description: 'A deep, dark blue that mirrors the depths of the ocean at night. This rich color conveys authority and professionalism, often seen in military and naval uniforms.' },
    { color: '#ADD8E6', description: 'A soft, pale blue with a gentle, calming quality. This delicate color resembles a morning sky just after dawn, bringing a sense of freshness and new beginnings.' },
    { color: '#1E90FF', description: 'A brilliant, electric blue that captures the essence of tropical waters and digital displays. This modern, eye-catching color radiates energy and innovation.' },

    // Reds
    { color: '#DC143C', description: 'A deep, vivid red with hints of purple, like the color of precious rubies. This intense color embodies passion and luxury, often associated with fine jewelry and romance.' },
    { color: '#8B0000', description: 'An extremely deep, almost brownish red that resembles aged wine or dried blood. This somber color conveys seriousness and has historical associations with ancient textiles.' },
    { color: '#FF6347', description: 'A vibrant orange-red that perfectly captures the color of a ripe summer tomato. This fresh, appetizing color brings to mind gardens and healthy, sun-ripened produce.' },
    { color: '#CD5C5C', description: 'A muted, dusty red with subtle brown undertones. This earthy color resembles terracotta pottery or dried clay bricks from Mediterranean villages.' },
    { color: '#B22222', description: 'A strong, classic red reminiscent of fire engines and danger signs. This bold color commands attention and is often used to signal warnings or emergencies.' },

    // Greens
    { color: '#2E8B57', description: 'A medium-dark green that captures the color of the sea in tropical regions. This refreshing color sits between blue and green, evoking coastal waters and marine life.' },
    { color: '#90EE90', description: 'A soft, pale green like fresh spring leaves just emerging. This gentle color embodies renewal and growth, reminiscent of new grass and budding plants.' },
    { color: '#228B22', description: 'A pure, vibrant green like a lush forest canopy. This natural color represents the heart of nature, full of life and vitality, often seen in healthy vegetation.' },
    { color: '#006400', description: 'An extremely deep, almost black green like dense forest shade. This rich color suggests mystery and depth, reminiscent of ancient woodlands and evergreen trees.' },
    { color: '#9ACD32', description: 'A bright, yellow-tinted green like young grass or chartreuse liqueur. This lively color combines the energy of yellow with the freshness of green.' },

    // Yellows
    { color: '#FFD700', description: 'A rich, lustrous yellow that perfectly mimics precious metal. This warm, valuable color has adorned crowns, coins, and treasures throughout history.' },
    { color: '#FFFF00', description: 'A pure, intense yellow at maximum brightness. This eye-catching color is used for highlighters and caution signs, demanding immediate attention.' },
    { color: '#F0E68C', description: 'A pale, soft yellow like dried wheat or desert sand. This warm, natural color evokes prairies and beaches, bringing a sense of warmth and nostalgia.' },
    { color: '#BDB76B', description: 'A muted, olive-tinted yellow with green undertones. This earthy color resembles dried grass or aged parchment, suggesting autumn and natural materials.' },

    // Purples
    { color: '#9370DB', description: 'A soft, muted purple with blue undertones, like mountain ranges at twilight. This dreamy color blends the calm of blue with the mystery of purple.' },
    { color: '#8B008B', description: 'A deep, rich purple that borders on dark magenta. This intense color suggests luxury and mystery, like royal velvet or exotic orchids.' },
    { color: '#9932CC', description: 'A vibrant, dark purple like blooming orchid flowers. This exotic color combines blue and red in perfect balance, suggesting elegance and sophistication.' },
    { color: '#E6E6FA', description: 'A very pale purple with a gentle, ethereal quality. This delicate color resembles the soft purple flowers of its namesake plant, bringing calm and serenity.' },

    // Oranges
    { color: '#FF8C00', description: 'A deep, vivid orange without any red or yellow dominance. This pure orange resembles autumn leaves at their peak or fresh citrus fruit.' },
    { color: '#FF7F50', description: 'A warm orange-pink like tropical marine formations. This vibrant color captures the beauty of underwater reefs and ocean life.' },
    { color: '#FF6347', description: 'A bright red-orange like perfectly ripe garden vegetables. This appetizing color sits between red and orange, suggesting freshness and flavor.' },

    // Pinks
    { color: '#FF69B4', description: 'A vivid, bright pink with blue undertones. This bold, tropical color is energetic and playful, like neon signs or vibrant flowers.' },
    { color: '#FFC0CB', description: 'A very light, delicate pink like cherry blossoms or cotton candy. This soft, sweet color evokes innocence and gentle femininity.' },
    { color: '#FFB6C1', description: 'A pale pink that\'s slightly more saturated than baby pink. This tender color suggests romance and softness, like rose petals or sunset clouds.' },

    // Browns
    { color: '#8B4513', description: 'A rich, reddish-brown like polished leather saddles. This warm, earthy color evokes craftsmanship and natural materials, suggesting autumn and harvest.' },
    { color: '#D2691E', description: 'A medium brown with orange undertones, like roasted cacao beans or autumn spices. This warm color is both inviting and appetizing.' },
    { color: '#A0522D', description: 'A reddish-brown like weathered clay or brick. This earthy color suggests natural materials and rustic charm.' },

    // Grays
    { color: '#708090', description: 'A medium gray with subtle blue undertones, like storm clouds or slate tiles. This cool, neutral color suggests stability and professionalism.' },
    { color: '#C0C0C0', description: 'A light gray with a slight metallic quality, like polished metal or modern design elements. This neutral color is sleek and contemporary.' },
    { color: '#696969', description: 'A medium-dark gray, perfectly neutral without warm or cool tones. This balanced color is versatile and sophisticated.' }
];

// Initialize game
function initGame() {
    loadBestStreak();
    newRound();
}

// Load best streak from localStorage
function loadBestStreak() {
    const saved = localStorage.getItem('colorGuesserBest');
    if (saved) {
        bestStreak = parseInt(saved);
        document.getElementById('best').textContent = bestStreak;
    }
}

// Save best streak to localStorage
function saveBestStreak() {
    if (streak > bestStreak) {
        bestStreak = streak;
        localStorage.setItem('colorGuesserBest', bestStreak);
        document.getElementById('best').textContent = bestStreak;
    }
}

// Generate similar colors
function generateSimilarColors(baseColor) {
    const colors = [baseColor];

    // Parse base color
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Generate two similar colors with slight variations
    for (let i = 0; i < 2; i++) {
        const variation = 30 + Math.random() * 40; // Random variation between 30-70
        const newR = Math.max(0, Math.min(255, r + (Math.random() > 0.5 ? variation : -variation)));
        const newG = Math.max(0, Math.min(255, g + (Math.random() > 0.5 ? variation : -variation)));
        const newB = Math.max(0, Math.min(255, b + (Math.random() > 0.5 ? variation : -variation)));

        const newColor = '#' +
            Math.round(newR).toString(16).padStart(2, '0') +
            Math.round(newG).toString(16).padStart(2, '0') +
            Math.round(newB).toString(16).padStart(2, '0');

        colors.push(newColor);
    }

    return colors;
}

// Shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start new round
function newRound() {
    hasAnswered = false;

    // Pick random color from database
    const randomColorData = colorData[Math.floor(Math.random() * colorData.length)];
    currentCorrectColor = randomColorData.color;

    // Generate similar colors
    const colors = generateSimilarColors(currentCorrectColor);
    const shuffledColors = shuffle(colors);

    // Display description
    document.getElementById('description').textContent = randomColorData.description;

    // Display color boxes
    const container = document.getElementById('colorsContainer');
    container.innerHTML = '';

    shuffledColors.forEach(color => {
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = color;
        box.addEventListener('click', () => checkAnswer(color, box));
        container.appendChild(box);
    });

    // Hide feedback and next button
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('nextButton').style.display = 'none';
}

// Check answer
function checkAnswer(selectedColor, box) {
    if (hasAnswered) return;

    hasAnswered = true;
    const feedback = document.getElementById('feedback');
    const allBoxes = document.querySelectorAll('.color-box');

    // Disable all boxes
    allBoxes.forEach(b => b.classList.add('disabled'));

    if (selectedColor.toUpperCase() === currentCorrectColor.toUpperCase()) {
        // Correct answer
        box.classList.add('correct');
        feedback.textContent = '✓ Correct! Well done!';
        feedback.className = 'feedback correct';
        score += 10;
        streak++;
        saveBestStreak();
    } else {
        // Incorrect answer
        box.classList.add('incorrect');

        // Highlight correct answer
        allBoxes.forEach(b => {
            if (b.style.backgroundColor === rgbToHex(currentCorrectColor)) {
                b.classList.add('correct');
            }
        });

        feedback.textContent = '✗ Wrong! The correct color was highlighted.';
        feedback.className = 'feedback incorrect';
        streak = 0;
    }

    // Update score display
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;

    // Show next button
    document.getElementById('nextButton').style.display = 'block';
}

// Convert RGB to Hex (for comparison)
function rgbToHex(color) {
    if (color.startsWith('#')) {
        return color.toLowerCase();
    }

    const rgb = color.match(/\d+/g);
    const hex = '#' +
        parseInt(rgb[0]).toString(16).padStart(2, '0') +
        parseInt(rgb[1]).toString(16).padStart(2, '0') +
        parseInt(rgb[2]).toString(16).padStart(2, '0');

    return hex.toLowerCase();
}

// Next button handler
document.getElementById('nextButton').addEventListener('click', newRound);

// Start game on load
initGame();
