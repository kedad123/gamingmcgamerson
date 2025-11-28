// Game state
let score = 0;
let streak = 0;
let bestStreak = 0;
let currentCorrectColor = null;
let currentCorrectIndex = null;
let hasAnswered = false;
let gameMode = 'description'; // 'description' or 'name'
let difficulty = 'medium'; // 'easy', 'medium', or 'hard'
let learningMode = false; // when true, uses color wheel instead of full database

// Color database with detailed descriptions and names
const colorData = [
    // Blues
    { color: '#4169E1', name: 'Royal Blue', description: 'A vibrant, medium-dark blue that evokes the grandeur of royal robes and majestic crowns. This color has been associated with nobility and dignity throughout history.' },
    { color: '#87CEEB', name: 'Sky Blue', description: 'A light, airy blue that captures the essence of a clear afternoon sky. This serene color brings feelings of peace and tranquility, like gazing up on a cloudless day.' },
    { color: '#000080', name: 'Navy Blue', description: 'A deep, dark blue that mirrors the depths of the ocean at night. This rich color conveys authority and professionalism, often seen in military and naval uniforms.' },
    { color: '#ADD8E6', name: 'Light Blue', description: 'A soft, pale blue with a gentle, calming quality. This delicate color resembles a morning sky just after dawn, bringing a sense of freshness and new beginnings.' },
    { color: '#1E90FF', name: 'Dodger Blue', description: 'A brilliant, electric blue that captures the essence of tropical waters and digital displays. This modern, eye-catching color radiates energy and innovation.' },

    // Reds
    { color: '#DC143C', name: 'Crimson', description: 'A deep, vivid red with hints of purple, like the color of precious rubies. This intense color embodies passion and luxury, often associated with fine jewelry and romance.' },
    { color: '#8B0000', name: 'Dark Red', description: 'An extremely deep, almost brownish red that resembles aged wine or dried blood. This somber color conveys seriousness and has historical associations with ancient textiles.' },
    { color: '#FF6347', name: 'Tomato', description: 'A vibrant orange-red that perfectly captures the color of a ripe summer tomato. This fresh, appetizing color brings to mind gardens and healthy, sun-ripened produce.' },
    { color: '#CD5C5C', name: 'Indian Red', description: 'A muted, dusty red with subtle brown undertones. This earthy color resembles terracotta pottery or dried clay bricks from Mediterranean villages.' },
    { color: '#B22222', name: 'Fire Brick', description: 'A strong, classic red reminiscent of fire engines and danger signs. This bold color commands attention and is often used to signal warnings or emergencies.' },

    // Greens
    { color: '#2E8B57', name: 'Sea Green', description: 'A medium-dark green that captures the color of the sea in tropical regions. This refreshing color sits between blue and green, evoking coastal waters and marine life.' },
    { color: '#90EE90', name: 'Light Green', description: 'A soft, pale green like fresh spring leaves just emerging. This gentle color embodies renewal and growth, reminiscent of new grass and budding plants.' },
    { color: '#228B22', name: 'Forest Green', description: 'A pure, vibrant green like a lush forest canopy. This natural color represents the heart of nature, full of life and vitality, often seen in healthy vegetation.' },
    { color: '#006400', name: 'Dark Green', description: 'An extremely deep, almost black green like dense forest shade. This rich color suggests mystery and depth, reminiscent of ancient woodlands and evergreen trees.' },
    { color: '#9ACD32', name: 'Yellow Green', description: 'A bright, yellow-tinted green like young grass or chartreuse liqueur. This lively color combines the energy of yellow with the freshness of green.' },

    // Yellows
    { color: '#FFD700', name: 'Gold', description: 'A rich, lustrous yellow that perfectly mimics precious metal. This warm, valuable color has adorned crowns, coins, and treasures throughout history.' },
    { color: '#FFFF00', name: 'Yellow', description: 'A pure, intense yellow at maximum brightness. This eye-catching color is used for highlighters and caution signs, demanding immediate attention.' },
    { color: '#F0E68C', name: 'Khaki', description: 'A pale, soft yellow like dried wheat or desert sand. This warm, natural color evokes prairies and beaches, bringing a sense of warmth and nostalgia.' },
    { color: '#BDB76B', name: 'Dark Khaki', description: 'A muted, olive-tinted yellow with green undertones. This earthy color resembles dried grass or aged parchment, suggesting autumn and natural materials.' },

    // Purples
    { color: '#9370DB', name: 'Medium Purple', description: 'A soft, muted purple with blue undertones, like mountain ranges at twilight. This dreamy color blends the calm of blue with the mystery of purple.' },
    { color: '#8B008B', name: 'Dark Magenta', description: 'A deep, rich purple that borders on dark magenta. This intense color suggests luxury and mystery, like royal velvet or exotic orchids.' },
    { color: '#9932CC', name: 'Dark Orchid', description: 'A vibrant, dark purple like blooming orchid flowers. This exotic color combines blue and red in perfect balance, suggesting elegance and sophistication.' },
    { color: '#E6E6FA', name: 'Lavender', description: 'A very pale purple with a gentle, ethereal quality. This delicate color resembles the soft purple flowers of its namesake plant, bringing calm and serenity.' },

    // Oranges
    { color: '#FF8C00', name: 'Dark Orange', description: 'A deep, vivid orange without any red or yellow dominance. This pure orange resembles autumn leaves at their peak or fresh citrus fruit.' },
    { color: '#FF7F50', name: 'Coral', description: 'A warm orange-pink like tropical marine formations. This vibrant color captures the beauty of underwater reefs and ocean life.' },
    { color: '#FFA500', name: 'Orange', description: 'A bright, pure orange that sits perfectly between red and yellow. This energetic color is associated with autumn, citrus fruits, and warmth.' },

    // Pinks
    { color: '#FF69B4', name: 'Hot Pink', description: 'A vivid, bright pink with blue undertones. This bold, tropical color is energetic and playful, like neon signs or vibrant flowers.' },
    { color: '#FFC0CB', name: 'Pink', description: 'A very light, delicate pink like cherry blossoms or cotton candy. This soft, sweet color evokes innocence and gentle femininity.' },
    { color: '#FFB6C1', name: 'Light Pink', description: 'A pale pink that\'s slightly more saturated than baby pink. This tender color suggests romance and softness, like rose petals or sunset clouds.' },

    // Browns
    { color: '#8B4513', name: 'Saddle Brown', description: 'A rich, reddish-brown like polished leather saddles. This warm, earthy color evokes craftsmanship and natural materials, suggesting autumn and harvest.' },
    { color: '#D2691E', name: 'Chocolate', description: 'A medium brown with orange undertones, like roasted cacao beans or autumn spices. This warm color is both inviting and appetizing.' },
    { color: '#A0522D', name: 'Sienna', description: 'A reddish-brown like weathered clay or brick. This earthy color suggests natural materials and rustic charm.' },

    // Grays
    { color: '#708090', name: 'Slate Gray', description: 'A medium gray with subtle blue undertones, like storm clouds or slate tiles. This cool, neutral color suggests stability and professionalism.' },
    { color: '#C0C0C0', name: 'Silver', description: 'A light gray with a slight metallic quality, like polished metal or modern design elements. This neutral color is sleek and contemporary.' },
    { color: '#696969', name: 'Dim Gray', description: 'A medium-dark gray, perfectly neutral without warm or cool tones. This balanced color is versatile and sophisticated.' }
];

// Learning mode color wheel
const colorWheel = {
    primary: [
        { color: '#FF0000', name: 'Red', description: 'A pure, vibrant red - one of the three primary colors. This fundamental color cannot be created by mixing other colors.' },
        { color: '#FFFF00', name: 'Yellow', description: 'A pure, bright yellow - one of the three primary colors. This fundamental color stands alone and cannot be created by mixing.' },
        { color: '#0000FF', name: 'Blue', description: 'A pure, vivid blue - one of the three primary colors. This fundamental color is irreducible and forms the basis of all other colors.' }
    ],
    secondary: [
        { color: '#FF0000', name: 'Red', description: 'A pure, vibrant red - one of the three primary colors. This fundamental color cannot be created by mixing other colors.' },
        { color: '#FF7F00', name: 'Orange', description: 'A bright orange created by mixing red and yellow. This secondary color bridges warm colors, bringing energy and enthusiasm.' },
        { color: '#FFFF00', name: 'Yellow', description: 'A pure, bright yellow - one of the three primary colors. This fundamental color stands alone and cannot be created by mixing.' },
        { color: '#00FF00', name: 'Green', description: 'A vibrant green created by mixing yellow and blue. This secondary color represents nature, growth, and harmony.' },
        { color: '#0000FF', name: 'Blue', description: 'A pure, vivid blue - one of the three primary colors. This fundamental color is irreducible and forms the basis of all other colors.' },
        { color: '#8B00FF', name: 'Purple', description: 'A rich purple created by mixing red and blue. This secondary color combines the passion of red with the calm of blue.' }
    ],
    tertiary: [
        { color: '#FF0000', name: 'Red', description: 'A pure, vibrant red - one of the three primary colors on the color wheel.' },
        { color: '#FF3F00', name: 'Vermilion', description: 'A red-orange tertiary color, leaning toward red. Created by mixing red with orange, it has a fiery, energetic quality.' },
        { color: '#FF7F00', name: 'Orange', description: 'A bright orange secondary color, perfectly balanced between red and yellow on the color wheel.' },
        { color: '#FFBF00', name: 'Amber', description: 'A yellow-orange tertiary color, leaning toward yellow. Created by mixing yellow with orange, it resembles golden honey.' },
        { color: '#FFFF00', name: 'Yellow', description: 'A pure, bright yellow - one of the three primary colors on the color wheel.' },
        { color: '#7FFF00', name: 'Lime', description: 'A yellow-green tertiary color, leaning toward green. Created by mixing yellow with green, it has a fresh, spring-like quality.' },
        { color: '#00FF00', name: 'Green', description: 'A vibrant green secondary color, perfectly balanced between yellow and blue on the color wheel.' },
        { color: '#00FF7F', name: 'Cyan', description: 'A blue-green tertiary color, also called aqua or turquoise. Created by mixing green with blue, it evokes tropical waters.' },
        { color: '#0000FF', name: 'Blue', description: 'A pure, vivid blue - one of the three primary colors on the color wheel.' },
        { color: '#7F00FF', name: 'Violet', description: 'A blue-purple tertiary color, leaning toward blue. Created by mixing blue with purple, it has a cool, royal quality.' },
        { color: '#8B00FF', name: 'Purple', description: 'A rich purple secondary color, perfectly balanced between blue and red on the color wheel.' },
        { color: '#FF00FF', name: 'Magenta', description: 'A red-purple tertiary color, leaning toward red. Created by mixing purple with red, it has a bold, vibrant quality.' }
    ]
};

// Initialize game
function initGame() {
    loadBestStreak();
    setupModeToggle();
    setupDifficultyToggle();
    setupLearningModeToggle();
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

// Setup mode toggle
function setupModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    modeToggle.addEventListener('click', () => {
        gameMode = gameMode === 'description' ? 'name' : 'description';
        modeToggle.textContent = gameMode === 'description' ? 'Mode: Description' : 'Mode: Name';
        newRound();
    });
}

// Setup difficulty toggle
function setupDifficultyToggle() {
    const difficultyToggle = document.getElementById('difficultyToggle');
    difficultyToggle.addEventListener('click', () => {
        if (difficulty === 'easy') {
            difficulty = 'medium';
        } else if (difficulty === 'medium') {
            difficulty = 'hard';
        } else {
            difficulty = 'easy';
        }

        updateDifficultyText();
        newRound();
    });
}

// Setup learning mode toggle
function setupLearningModeToggle() {
    const learningToggle = document.getElementById('learningToggle');
    learningToggle.addEventListener('click', () => {
        learningMode = !learningMode;
        learningToggle.textContent = learningMode ? 'Learning: ON' : 'Learning: OFF';
        updateDifficultyText();
        newRound();
    });
}

// Update difficulty text based on learning mode
function updateDifficultyText() {
    const difficultyToggle = document.getElementById('difficultyToggle');
    if (learningMode) {
        if (difficulty === 'easy') {
            difficultyToggle.textContent = 'Level: Primary (3)';
        } else if (difficulty === 'medium') {
            difficultyToggle.textContent = 'Level: Secondary (6)';
        } else {
            difficultyToggle.textContent = 'Level: Tertiary (12)';
        }
    } else {
        const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        difficultyToggle.textContent = `Difficulty: ${difficultyText}`;
    }
}

// Generate similar colors based on difficulty
function generateSimilarColors(baseColor) {
    const colors = [baseColor];

    // Parse base color
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Set variation range based on difficulty
    let minVariation, maxVariation;
    if (difficulty === 'easy') {
        minVariation = 50;
        maxVariation = 90;
    } else if (difficulty === 'medium') {
        minVariation = 30;
        maxVariation = 60;
    } else { // hard
        minVariation = 10;
        maxVariation = 30;
    }

    // Generate two similar colors with variations based on difficulty
    for (let i = 0; i < 2; i++) {
        const variation = minVariation + Math.random() * (maxVariation - minVariation);
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

    // Pick random color from appropriate database
    let randomColorData;
    let colors;

    if (learningMode) {
        // Use color wheel based on difficulty
        let wheelColors;
        if (difficulty === 'easy') {
            wheelColors = colorWheel.primary;
        } else if (difficulty === 'medium') {
            wheelColors = colorWheel.secondary;
        } else {
            wheelColors = colorWheel.tertiary;
        }

        // Pick one correct answer
        randomColorData = wheelColors[Math.floor(Math.random() * wheelColors.length)];
        currentCorrectColor = randomColorData.color;

        // Pick 2 other random colors from the same wheel (making sure they're different)
        const otherColors = wheelColors.filter(c => c.color !== currentCorrectColor);
        const shuffledOthers = shuffle([...otherColors]);
        colors = [
            currentCorrectColor,
            shuffledOthers[0].color,
            shuffledOthers[1].color
        ];
    } else {
        randomColorData = colorData[Math.floor(Math.random() * colorData.length)];
        currentCorrectColor = randomColorData.color;

        // Generate similar colors for normal mode
        colors = generateSimilarColors(currentCorrectColor);
    }

    const shuffledColors = shuffle(colors);

    // Store the correct index
    currentCorrectIndex = shuffledColors.findIndex(c => c.toUpperCase() === currentCorrectColor.toUpperCase());

    // Display description or name based on mode
    const descriptionBox = document.getElementById('description');
    if (gameMode === 'description') {
        descriptionBox.textContent = randomColorData.description;
    } else {
        descriptionBox.textContent = randomColorData.name;
    }

    // Display color boxes
    const container = document.getElementById('colorsContainer');
    container.innerHTML = '';

    shuffledColors.forEach((color, index) => {
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = color;
        box.dataset.index = index;
        box.addEventListener('click', () => checkAnswer(color, box, index));
        container.appendChild(box);
    });

    // Hide feedback and next button
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('nextButton').style.display = 'none';
}

// Check answer
function checkAnswer(selectedColor, box, selectedIndex) {
    if (hasAnswered) return;

    hasAnswered = true;
    const feedback = document.getElementById('feedback');
    const allBoxes = document.querySelectorAll('.color-box');

    // Disable all boxes
    allBoxes.forEach(b => b.classList.add('disabled'));

    const isCorrect = selectedIndex === currentCorrectIndex;

    if (isCorrect) {
        // Correct answer
        box.classList.add('correct');

        // Show color code
        const colorName = colorData.find(c => c.color.toUpperCase() === currentCorrectColor.toUpperCase()).name;
        feedback.innerHTML = `✓ Correct! <strong>${colorName}</strong> (${currentCorrectColor.toUpperCase()})`;
        feedback.className = 'feedback correct';
        score += 10;
        streak++;
        saveBestStreak();
    } else {
        // Incorrect answer
        box.classList.add('incorrect');

        // Highlight correct answer
        allBoxes[currentCorrectIndex].classList.add('correct');

        // Show color codes
        const colorName = colorData.find(c => c.color.toUpperCase() === currentCorrectColor.toUpperCase()).name;
        feedback.innerHTML = `✗ Wrong! The correct answer was <strong>${colorName}</strong> (${currentCorrectColor.toUpperCase()})`;
        feedback.className = 'feedback incorrect';
        streak = 0;
    }

    // Update score display
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;

    // Show next button
    document.getElementById('nextButton').style.display = 'block';
}

// Next button handler
document.getElementById('nextButton').addEventListener('click', newRound);

// Start game on load
initGame();
