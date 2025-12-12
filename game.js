// Devil Levels - simple canvas game with levels
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const restartBtn = document.getElementById('restartBtn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const closeOverlay = document.getElementById('closeOverlay');
const playerNameInput = document.getElementById('playerName');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const highscoreList = document.getElementById('highscoreList');

let W = canvas.width,
    H = canvas.height;
let keys = {};
let game = null;

// Touch controls for mobile
let touchControls = {
    leftPressed: false,
    rightPressed: false
};

class Player {
    constructor() {
        this.w = 48;
        this.h = 24;
        this.x = W / 2 - this.w / 2;
        this.y = H - this.h - 10;
        this.speed = 6;
    }
    update() {
        if (keys.ArrowLeft || keys.a || touchControls.leftPressed) this.x -= this.speed;
        if (keys.ArrowRight || keys.d || touchControls.rightPressed) this.x += this.speed;
        this.x = Math.max(0, Math.min(W - this.w, this.x));
    }
    draw() {
        ctx.fillStyle = '#ffb4b4';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // horns
        ctx.fillStyle = '#ff3b30';
        ctx.fillRect(this.x + 6, this.y - 8, 6, 8);
        ctx.fillRect(this.x + this.w - 12, this.y - 8, 6, 8);
    }
}

class Devil {
    constructor(x, y, speed, size = 28) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = size
    }
    update(dt) { this.y += this.speed * dt }
    draw() {
        ctx.fillStyle = '#ff3b30';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.devils = [];
        this.lastSpawn = 0;
        this.spawnInterval = 1200; // ms
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.running = false;
        this.lastTime = 0;
    }
    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.frame.bind(this));
    }
    stop() { this.running = false }
    frame(t) {
        if (!this.running) return;
        const dt = (t - this.lastTime) / 16.666;
        this.lastTime = t;
        this.update(dt);
        this.draw();
        requestAnimationFrame(this.frame.bind(this));
    }
    update(dt) {
        this.player.update(dt);
        // spawn logic
        this.lastSpawn += dt * 16.666;
        const interval = Math.max(350, this.spawnInterval - (this.level - 1) * 100);
        if (this.lastSpawn > interval) {
            this.lastSpawn = 0;
            const x = Math.random() * (W - 40) + 20;
            const speed = 1 + this.level * 0.5 + Math.random() * this.level * 0.6;
            this.devils.push(new Devil(x, -40, speed, 18 + Math.random() * 18));
        }
        // update devils
        for (let i = this.devils.length - 1; i >= 0; i--) {
            const d = this.devils[i];
            d.update(dt);
            if (this.collide(d, this.player)) {
                this.devils.splice(i, 1);
                this.lives--;
                updateHUD();
                if (this.lives <= 0) { this.gameOver(); return }
            } else if (d.y > H + 50) {
                this.devils.splice(i, 1);
                this.score += 10;
                updateHUD();
                if (this.score >= this.level * 200) { this.levelUp(); }
            }
        }
    }
    draw() {
        ctx.clearRect(0, 0, W, H);
        // background grid
        for (let y = 0; y < H; y += 40) {
            ctx.fillStyle = 'rgba(255,255,255,0.01)';
            ctx.fillRect(0, y, W, 1)
        }
        this.player.draw();
        this.devils.forEach(d => d.draw());
    }
    collide(devil, player) {
        const dx = Math.abs(devil.x - (player.x + player.w / 2));
        const dy = Math.abs(devil.y - (player.y + player.h / 2));
        return dx < (devil.size + player.w / 2) && dy < (devil.size + player.h / 2);
    }
    levelUp() {
        this.level++;
        levelEl.textContent = this.level;
        nextLevelBtn.classList.remove('hidden');
        this.stop();
        overlayTitle.textContent = 'Level Cleared!';
        overlayText.textContent = `Level ${this.level-1} cleared. Ready for level ${this.level}?`;
        overlay.classList.remove('hidden')
    }
    gameOver() {
        this.stop();
        overlayTitle.textContent = 'Game Over';
        overlayText.textContent = `Score: ${this.score}`;
        document.getElementById('nameLabel').classList.remove('hidden');
        playerNameInput.value = '';
        submitScoreBtn.classList.remove('hidden');
        restartBtn.classList.remove('hidden');
        overlay.classList.remove('hidden')
    }
}

function updateHUD() {
    scoreEl.textContent = game.score;
    levelEl.textContent = game.level;
    livesEl.textContent = game.lives
}

// controls - Keyboard
window.addEventListener('keydown', e => { keys[e.key] = true });
window.addEventListener('keyup', e => { keys[e.key] = false });

// Touch controls for mobile devices - Track swipes and touches in both directions
let touchStartX = 0;
let touchStartY = 0;
let currentTouchX = 0;
const SWIPE_THRESHOLD = 10; // minimum pixels to detect a swipe

document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    currentTouchX = touchStartX;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    currentTouchX = touch.clientX;

    // Calculate swipe distance
    const swipeDistance = currentTouchX - touchStartX;

    // Detect swipe direction based on how far the finger has moved
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance < 0) {
            // Swiping LEFT (moving from right to left)
            touchControls.leftPressed = true;
            touchControls.rightPressed = false;
        } else {
            // Swiping RIGHT (moving from left to right)
            touchControls.rightPressed = true;
            touchControls.leftPressed = false;
        }
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchControls.leftPressed = false;
    touchControls.rightPressed = false;
    touchStartX = 0;
    touchStartY = 0;
    currentTouchX = 0;
}, { passive: true });
startBtn.addEventListener('click', () => {
    if (game && game.running) return;
    game = new Game();
    updateHUD();
    game.start();
    overlay.classList.add('hidden');
    startBtn.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
});
nextLevelBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    if (game) {
        game.lastSpawn = 0;
        game.devils = [];
        game.start();
    }
});
restartBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    restartBtn.classList.add('hidden');
    submitScoreBtn.classList.add('hidden');
    document.getElementById('nameLabel').classList.add('hidden');
    startBtn.classList.remove('hidden');
    game = null;
    updateHUD();
    loadHighscores();
});
closeOverlay.addEventListener('click', () => { overlay.classList.add('hidden'); })
submitScoreBtn.addEventListener('click', async() => {
    const name = playerNameInput.value.trim() || 'Player';
    const payload = { name, score: game ? game.score : 0 };
    try {
        await fetch('/api/highscores', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        overlay.classList.add('hidden');
        loadHighscores();
    } catch (e) { alert('Failed to submit score') }
});

async function loadHighscores() {
    try {
        const res = await fetch('/api/highscores');
        const list = await res.json();
        highscoreList.innerHTML = '';
        list.slice(0, 10).forEach(h => {
            const li = document.createElement('li');
            li.textContent = `${h.name} — ${h.score}`;
            highscoreList.appendChild(li)
        })
    } catch (e) { console.error(e) }
}

// initial
updateHUD();
loadHighscores();

// Detect device type and show appropriate controls
function detectDeviceAndShowControls() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth < 768);

    const pcControls = document.querySelector('.pc-controls');
    const mobileControls = document.querySelector('.mobile-controls');

    if (isMobile) {
        if (pcControls) pcControls.style.display = 'none';
        if (mobileControls) mobileControls.style.display = 'inline';
    } else {
        if (pcControls) pcControls.style.display = 'inline';
        if (mobileControls) mobileControls.style.display = 'none';
    }
}

// Run on page load and on resize
window.addEventListener('load', detectDeviceAndShowControls);
window.addEventListener('resize', detectDeviceAndShowControls);