const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

const gridSize = 10;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = -gridSize; // Start moving up
let score = 0;
let highScore = localStorage.getItem('nokiaSnakeHighScore') || 0;
let gameInterval;
let gameState = 'START'; // START, PLAYING, GAMEOVER
const neonOrange = '#ff5e00';

highScoreDisplay.textContent = `HI: ${highScore}`;

function initGame() {
    snake = [
        { x: Math.floor(tileCount / 2) * gridSize, y: Math.floor(tileCount / 2) * gridSize }
    ];
    dx = 0;
    dy = -gridSize;
    score = 0;
    scoreDisplay.textContent = `SCORE: ${score}`;
    placeFood();
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    if (gameInterval) clearInterval(gameInterval);
    // Speed of snake
    gameInterval = setInterval(gameLoop, 150);
}

function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    clearCanvas();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = '#000'; // Black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = neonOrange;
        ctx.fillRect(segment.x, segment.y, gridSize - 1, gridSize - 1);
        
        // Add glow to head
        if (index === 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = neonOrange;
            ctx.fillRect(segment.x, segment.y, gridSize - 1, gridSize - 1);
            ctx.shadowBlur = 0; // reset
        }
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = `SCORE: ${score}`;
        placeFood();
    } else {
        snake.pop();
    }
}

function drawFood() {
    ctx.fillStyle = neonOrange;
    ctx.shadowBlur = 5;
    ctx.shadowColor = neonOrange;
    // Draw food as a slightly smaller square or circle
    ctx.fillRect(food.x + 1, food.y + 1, gridSize - 3, gridSize - 3);
    ctx.shadowBlur = 0;
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount) * gridSize;
    food.y = Math.floor(Math.random() * tileCount) * gridSize;
    
    // Ensure food doesn't spawn on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
        }
    });
}

function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    clearInterval(gameInterval);
    gameState = 'GAMEOVER';
    gameOverScreen.classList.remove('hidden');
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('nokiaSnakeHighScore', highScore);
        highScoreDisplay.textContent = `HI: ${highScore}`;
    }
}

// Input Handling
function handleInput(key) {
    if (gameState === 'START' || gameState === 'GAMEOVER') {
        if (key === '5' || key === 'Enter') {
            initGame();
        }
        return;
    }

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    switch (key) {
        case 'ArrowLeft':
        case '4':
            if (!goingRight) { dx = -gridSize; dy = 0; }
            break;
        case 'ArrowUp':
        case '2':
            if (!goingDown) { dx = 0; dy = -gridSize; }
            break;
        case 'ArrowRight':
        case '6':
            if (!goingLeft) { dx = gridSize; dy = 0; }
            break;
        case 'ArrowDown':
        case '8':
            if (!goingUp) { dx = 0; dy = gridSize; }
            break;
    }
}

// Keyboard Events
window.addEventListener('keydown', (e) => {
    handleInput(e.key);
});

// On-screen Keypad Events
const keys = document.querySelectorAll('.key');
keys.forEach(key => {
    key.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double firing on mobile
        const keyValue = key.getAttribute('data-key');
        if (keyValue) {
            handleInput(keyValue);
            key.classList.add('active-simulate');
            setTimeout(() => key.classList.remove('active-simulate'), 100);
        }
    });
    
    key.addEventListener('mousedown', (e) => {
        const keyValue = key.getAttribute('data-key');
        if (keyValue) {
            handleInput(keyValue);
        }
    });
});

// Initial draw
clearCanvas();
