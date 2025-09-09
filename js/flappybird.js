// Flappy Bird Game for R1 Device
document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const bird = document.getElementById('bird');
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score-display');
    const finalScore = document.getElementById('final-score');
    const bestScore = document.getElementById('best-score');
    const statusMessage = document.getElementById('status-message');
    
    // Game overlays
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    
    // Buttons
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const jumpBtn = document.getElementById('jump-btn');
    
    // Game variables
    let gameRunning = false;
    let gameSpeed = 2; // Pixels per frame
    let gravity = 0.5;
    let jumpStrength = -8;
    let birdVelocity = 0;
    let score = 0;
    let highScore = 0;
    let pipeInterval;
    let gameLoop;
    let lastTimestamp = 0;
    let pipes = [];
    
    // Load high score
    loadHighScore();
    
    // Initialize game
    function init() {
        // Set up event listeners
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
        jumpBtn.addEventListener('click', jump);
        document.addEventListener('keydown', handleKeyDown);
        
        // R1 device specific event listeners
        setupHardwareEvents();
        
        // Display the start screen
        startScreen.classList.remove('hidden');
        gameOverScreen.classList.add('hidden');
        
        updateStatus('Ready to play');
    }
    
    // Setup hardware events for R1 device
    function setupHardwareEvents() {
        // Scroll wheel for jump
        if (window.addEventListener) {
            window.addEventListener('scrollUp', () => {
                if (gameRunning) jump();
            });
            
            // PTT button to start/restart game
            window.addEventListener('sideClick', () => {
                if (!gameRunning) {
                    startGame();
                } else {
                    jump();
                }
            });
        }
    }
    
    // Start the game
    function startGame() {
        // Hide start screen
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        
        // Reset game state
        resetGameState();
        
        // Start game loop
        gameRunning = true;
        lastTimestamp = performance.now();
        gameLoop = requestAnimationFrame(update);
        
        // Start creating pipes
        pipeInterval = setInterval(createPipe, 3000);
        
        updateStatus('Game started');
    }
    
    // Reset game state
    function resetGameState() {
        // Reset bird position and velocity
        bird.style.top = '100px';
        birdVelocity = 0;
        
        // Reset score
        score = 0;
        scoreDisplay.textContent = score;
        
        // Clear pipes
        clearPipes();
    }
    
    // Restart the game
    function restartGame() {
        startGame();
    }
    
    // Game update loop
    function update(timestamp) {
        if (!gameRunning) return;
        
        // Calculate delta time
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Update bird position
        updateBird(deltaTime);
        
        // Update pipes
        updatePipes(deltaTime);
        
        // Check collisions
        if (checkCollisions()) {
            endGame();
            return;
        }
        
        // Request next frame
        gameLoop = requestAnimationFrame(update);
    }
    
    // Update bird position
    function updateBird(deltaTime) {
        // Apply gravity to velocity
        birdVelocity += gravity;
        
        // Apply velocity to position
        const currentTop = parseFloat(bird.style.top) || 100;
        let newTop = currentTop + birdVelocity;
        
        // Constrain bird to game area
        newTop = Math.max(0, Math.min(newTop, gameArea.offsetHeight - bird.offsetHeight - 40));
        
        // Update position
        bird.style.top = `${newTop}px`;
        
        // Rotate bird based on velocity
        const rotation = Math.min(Math.max(-30, birdVelocity * 3), 90);
        bird.style.transform = `rotate(${rotation}deg)`;
    }
    
    // Create a new pipe
    function createPipe() {
        if (!gameRunning) return;
        
        // Create pipe container
        const pipeContainer = document.createElement('div');
        pipeContainer.className = 'pipe-container';
        pipeContainer.style.right = '-52px';
        
        // Random gap position (between 20% and 60% of game area)
        const gameHeight = gameArea.offsetHeight - 40; // Subtract ground height
        const minGapPos = Math.round(gameHeight * 0.2);
        const maxGapPos = Math.round(gameHeight * 0.6);
        const gapPosition = Math.floor(Math.random() * (maxGapPos - minGapPos) + minGapPos);
        
        // Gap size (in pixels)
        const gapSize = 80;
        
        // Create top pipe
        const topPipe = document.createElement('div');
        topPipe.className = 'pipe top';
        topPipe.style.height = `${gapPosition}px`;
        
        // Create bottom pipe
        const bottomPipe = document.createElement('div');
        bottomPipe.className = 'pipe bottom';
        bottomPipe.style.height = `${gameHeight - gapPosition - gapSize}px`;
        
        // Add pipes to container
        pipeContainer.appendChild(topPipe);
        pipeContainer.appendChild(bottomPipe);
        
        // Add container to game area
        gameArea.appendChild(pipeContainer);
        
        // Add pipe to tracking array
        pipes.push({
            element: pipeContainer,
            passed: false
        });
    }
    
    // Update pipes positions
    function updatePipes(deltaTime) {
        for (let i = pipes.length - 1; i >= 0; i--) {
            const pipe = pipes[i];
            const pipeElement = pipe.element;
            
            // Get current position
            const currentRight = parseFloat(pipeElement.style.right) || -52;
            const newRight = currentRight + gameSpeed;
            
            // Update position
            pipeElement.style.right = `${newRight}px`;
            
            // Check if pipe is passed
            if (!pipe.passed && newRight > 120) { // Bird position is 50px from left
                pipe.passed = true;
                updateScore();
            }
            
            // Remove pipe if offscreen
            if (newRight > gameArea.offsetWidth + 52) {
                gameArea.removeChild(pipeElement);
                pipes.splice(i, 1);
            }
        }
    }
    
    // Clear all pipes
    function clearPipes() {
        pipes.forEach(pipe => {
            if (pipe.element && pipe.element.parentNode) {
                pipe.element.parentNode.removeChild(pipe.element);
            }
        });
        
        pipes = [];
    }
    
    // Bird jump
    function jump() {
        if (!gameRunning) return;
        
        birdVelocity = jumpStrength;
        updateStatus('Flap!');
    }
    
    // Handle keyboard controls
    function handleKeyDown(event) {
        if (event.code === 'Space') {
            if (!gameRunning) {
                startGame();
            } else {
                jump();
            }
        }
    }
    
    // Check for collisions
    function checkCollisions() {
        // Get bird bounds
        const birdRect = bird.getBoundingClientRect();
        
        // Check ground collision
        if (birdRect.bottom > gameArea.getBoundingClientRect().bottom - 40) {
            return true;
        }
        
        // Check ceiling collision
        if (birdRect.top < gameArea.getBoundingClientRect().top) {
            return true;
        }
        
        // Check pipe collisions
        for (const pipe of pipes) {
            const pipeElement = pipe.element;
            const topPipe = pipeElement.querySelector('.pipe.top');
            const bottomPipe = pipeElement.querySelector('.pipe.bottom');
            
            if (topPipe && bottomPipe) {
                const topPipeRect = topPipe.getBoundingClientRect();
                const bottomPipeRect = bottomPipe.getBoundingClientRect();
                
                // Check collision with top pipe
                if (
                    birdRect.right > topPipeRect.left &&
                    birdRect.left < topPipeRect.right &&
                    birdRect.top < topPipeRect.bottom
                ) {
                    return true;
                }
                
                // Check collision with bottom pipe
                if (
                    birdRect.right > bottomPipeRect.left &&
                    birdRect.left < bottomPipeRect.right &&
                    birdRect.bottom > bottomPipeRect.top
                ) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Update score
    function updateScore() {
        score++;
        scoreDisplay.textContent = score;
    }
    
    // End the game
    function endGame() {
        gameRunning = false;
        
        // Stop game loop
        cancelAnimationFrame(gameLoop);
        
        // Stop creating pipes
        clearInterval(pipeInterval);
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            saveHighScore();
        }
        
        // Update score display
        finalScore.textContent = score;
        bestScore.textContent = highScore;
        
        // Show game over screen
        gameOverScreen.classList.remove('hidden');
        
        updateStatus('Game over');
    }
    
    // Load high score from storage
    async function loadHighScore() {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                const stored = await window.creationStorage.plain.getItem('flappy_high_score');
                if (stored) {
                    highScore = parseInt(stored, 10) || 0;
                    bestScore.textContent = highScore;
                }
            }
        } catch (error) {
            console.error('Error loading high score:', error);
        }
    }
    
    // Save high score to storage
    async function saveHighScore() {
        try {
            if (window.creationStorage && window.creationStorage.plain) {
                await window.creationStorage.plain.setItem(
                    'flappy_high_score',
                    highScore.toString()
                );
            }
        } catch (error) {
            console.error('Error saving high score:', error);
        }
    }
    
    // Update status message
    function updateStatus(message) {
        statusMessage.textContent = message;
    }
    
    // Initialize the game
    init();
});
