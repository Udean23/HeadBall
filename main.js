function ShowInstruction() {
    document.getElementById('instruction').style.display = 'block';
}

function HideInstruction() {
    document.getElementById('instruction').style.display = 'none';
}

let currentKeyDownListener = null;
let currentKeyUpListener = null;

document.addEventListener('DOMContentLoaded', () => {
    const p1Input = document.getElementById('username1');
    const p2Input = document.getElementById('username2');
    const playBtn = document.getElementById('playBtn');
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const levelSelect = document.getElementById('level');

    function checkInputs() {
        if (p1Input.value.trim() !== "" &&
            p2Input.value.trim() !== "" &&
            team1Select.value !== "" &&
            team2Select.value !== "" &&
            levelSelect.value !== "") {
            playBtn.disabled = false;
        } else {
            playBtn.disabled = true;
        }
    }

    p1Input.addEventListener('input', checkInputs);
    p2Input.addEventListener('input', checkInputs);
    team1Select.addEventListener('change', checkInputs);
    team2Select.addEventListener('change', checkInputs);
    levelSelect.addEventListener('change', checkInputs);

    ShowInstruction();
});

function PlayGame() {
    if (window.gameAnimationId) cancelAnimationFrame(window.gameAnimationId);
    if (window.gameTimerInterval) clearInterval(window.gameTimerInterval);
    if (window.itemInterval) clearInterval(window.itemInterval);

    document.getElementById('gamemenu').style.display = 'none';
    document.getElementById('canvas').style.display = 'block';
    document.getElementById('game').style.display = 'block';

    let Username1 = document.getElementById("username1").value;
    let Username2 = document.getElementById("username2").value;
    let ballChoice = document.querySelector('input[name="ball"]:checked').value;

    let score1 = 0;
    let score2 = 0;
    let isPaused = false;
    let suddenDeath = false;
    let isGameOver = false;
    let gameStarted = false;

    let countdownEl = document.getElementById('countdown');
    let countdownVal = 3;
    let countdownInterval;

    var r = document.getElementById("level");
    var level = r.value;
    let seconds = 30;
    if (level == 'MEDIUM') seconds = 20;
    if (level == 'HARD') seconds = 15;

    let counterDisplay = document.getElementById('timeroutput');
    document.getElementById("p1name").textContent = Username1;
    document.getElementById("p2name").textContent = Username2;
    document.getElementById("score1").textContent = score1;
    document.getElementById("score2").textContent = score2;

    var team1 = document.getElementById("team1").value;
    var team2 = document.getElementById("team2").value;

    const flagPaths = {
        1: 'source/Flag/Brazil.png', 2: 'source/Flag/England.png',
        3: 'source/Flag/Germany.png', 4: 'source/Flag/Italy.png',
        5: 'source/Flag/Japan.png', 6: 'source/Flag/Netherlands.png',
        7: 'source/Flag/Portugal.png', 8: 'source/Flag/Spain.png'
    };

    document.getElementById('flag1').src = flagPaths[team1] || flagPaths[1];
    document.getElementById('flag2').src = flagPaths[team2] || flagPaths[2];

    function updateTimerDisplay() {
        if (suddenDeath) {
            counterDisplay.textContent = "S.D.";
            return;
        }
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        counterDisplay.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    updateTimerDisplay();

    function startCounter() {
        if (window.gameTimerInterval) clearInterval(window.gameTimerInterval);
        window.gameTimerInterval = setInterval(() => {
            if (!isPaused && !isGameOver && gameStarted) {
                seconds--;
                updateTimerDisplay();
                if (seconds <= 0) {
                    seconds = 0;
                    if (score1 !== score2) {
                        EndGame();
                    } else {
                        suddenDeath = true;
                        updateTimerDisplay();
                    }
                }
            }
        }, 1000);
    }

    window.ResumeGame = function () {
        if (!isPaused) return;
        isPaused = false;
        document.getElementById('pause-menu').style.display = 'none';
        gameStarted = false;
        countdownVal = 3;
        countdownEl.style.display = 'block';
        countdownEl.innerText = countdownVal;
        countdownInterval = setInterval(() => {
            countdownVal--;
            if (countdownVal > 0) {
                countdownEl.innerText = countdownVal;
            } else if (countdownVal === 0) {
                countdownEl.innerText = "GO!";
            } else {
                clearInterval(countdownInterval);
                countdownEl.style.display = 'none';
                gameStarted = true;
            }
        }, 1000);
    };

    window.SaveScore = function () {
        let history = JSON.parse(localStorage.getItem('headball_history')) || [];
        let winnerName = score1 > score2 ? Username1 : Username2;
        if (score1 === score2) winnerName = "Draw";
        history.push({
            date: new Date().toLocaleString(),
            winner: winnerName,
            score: Math.max(score1, score2),
            details: `${score1} - ${score2}`,
            timestamp: Date.now()
        });
        localStorage.setItem('headball_history', JSON.stringify(history));
        alert('Match result saved!');
    };

    function EndGame() {
        isGameOver = true;
        if (window.gameTimerInterval) clearInterval(window.gameTimerInterval);
        if (window.itemInterval) clearInterval(window.itemInterval);
        document.getElementById('gameover').style.display = 'block';
        let winName = score1 > score2 ? Username1 : Username2;
        document.getElementById('winner-name').textContent = winName;
        document.getElementById('final-score').textContent = `${score1} - ${score2}`;
        const countryMap = { "1": "Brazil", "2": "England", "3": "Germany", "4": "Italy", "5": "Japan", "6": "Netherlands", "7": "Portugal", "8": "Spain" };
        document.getElementById('final-countries').textContent = `${countryMap[team1] || team1} vs ${countryMap[team2] || team2}`;
    }

    var canvas = document.getElementById("canvas");
    var c = canvas.getContext("2d");

    var countries = ['Brazil', 'England', 'Germany', 'Italy', 'Japan', 'Netherlands', 'Portugal', 'Spain'];
    var p1folder = "source/Characters/p1/" + (countries[team1 - 1] || countries[0]) + "/";
    var p2folder = "source/Characters/p2/" + (countries[team2 - 1] || countries[0]) + "/";

    var ballImg = new Image();
    ballImg.src = ballChoice == 1 ? "source/Ball 01.png" : "source/Ball 02.png";

    function loadCharImages(folder) {
        let idle = new Image(); idle.src = folder + "Idle/Idle_000.png";
        let walk = []; for (let i = 0; i <= 9; i++) { let img = new Image(); img.src = folder + `Move Forward/Move Forward_00${i}.png`; walk.push(img); }
        let jump = new Image(); jump.src = folder + "Jump/Jump_000.png";
        let kick = new Image(); kick.src = folder + "Kick/Kick_000.png";
        return { idle, walk, jump, kick };
    }
    let p1Assets = loadCharImages(p1folder);
    let p2Assets = loadCharImages(p2folder);

    var itemImgs = { increase: new Image(), decrease: new Image(), freeze: new Image() };
    itemImgs.increase.src = "source/Increase Ball.png"; itemImgs.decrease.src = "source/Decrease Ball.png"; itemImgs.freeze.src = "source/Diamond Ice.png";

    class Player {
        constructor(x, isP2, assets) {
            this.x = x; this.width = 125; this.height = 150;
            this.defaultDy = canvas.height - this.height - 30;
            this.y = this.defaultDy;
            this.isP2 = isP2;
            this.flip = isP2;
            this.assets = assets;
            this.walkFrame = 0; this.walkCounter = 0;
            this.forwardcon = false; this.backwardcon = false; this.jumpcon = false; this.kickcon = false; this.downcon = true;
            this.vy = 0; this.gravity = 0.5; this.jumpPower = -13;
            this.frozen = false;
        }
        draw() {
            c.save();
            if (this.flip) {
                c.translate(this.x + this.width, this.y);
                c.scale(-1, 1);
            } else {
                c.translate(this.x, this.y);
            }
            let img = this.assets.idle;
            if (this.kickcon) img = this.assets.kick;
            else if (!this.downcon) img = this.assets.jump;
            else if (this.forwardcon || this.backwardcon) {
                this.walkCounter++;
                if (this.walkCounter > 4) {
                    this.walkCounter = 0;
                    this.walkFrame = (this.walkFrame + 1) % this.assets.walk.length;
                }
                img = this.assets.walk[this.walkFrame];
            }
            c.drawImage(img, 0, 0, this.width, this.height);
            c.restore();
        }
        update() {
            if (this.frozen) return;
            if (this.forwardcon) this.x += this.isP2 ? -4 : 4;
            if (this.backwardcon) this.x += this.isP2 ? 4 : -4;
            if (this.jumpcon && this.downcon) { this.vy = this.jumpPower; this.downcon = false; this.jumpcon = false; }
            this.vy += this.gravity; this.y += this.vy;
            if (this.y >= this.defaultDy) {
                this.y = this.defaultDy;
                this.vy = 0;
                this.downcon = true;
            }
            if (this.x < 0) this.x = 0; if (this.x > (1200 - this.width)) this.x = (1200 - this.width);
        }
    }

    class Ball {
        constructor() { this.reset(); this.radius = 24; this.gravity = 0.4; this.frozen = false; }
        draw() { c.drawImage(ballImg, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); }
        update() {
            if (this.frozen) return;
            this.vy += this.gravity; this.x += this.vx; this.y += this.vy;
            this.vx *= 0.993;
            if (this.y + this.radius > 570) { this.y = 570 - this.radius; this.vy *= -0.7; }
            if (this.x - this.radius < 0) { this.x = this.radius; this.vx *= -0.8; }
            if (this.x + this.radius > 1200) { this.x = 1200 - this.radius; this.vx *= -0.8; }
            if (this.x < 50 && this.y > 450) { score2++; document.getElementById("score2").textContent = score2; this.reset(); if (suddenDeath) EndGame(); }
            else if (this.x > 1150 && this.y > 450) { score1++; document.getElementById("score1").textContent = score1; this.reset(); if (suddenDeath) EndGame(); }
        }
        reset() { this.x = 600; this.y = 250; this.vx = 0; this.vy = 0; }
        collideWith(p) {
            let pCenter = { x: p.x + p.width / 2, y: p.y + p.height / 2 };
            let dx = this.x - pCenter.x; let dy = this.y - pCenter.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.radius + 42) {
                let angle = Math.atan2(dy, dx);
                let power = p.kickcon ? 17 : 9.5;
                this.vx = Math.cos(angle) * power;
                this.vy = Math.sin(angle) * power - 2;
                this.x = pCenter.x + Math.cos(angle) * (this.radius + 48);
                this.y = pCenter.y + Math.sin(angle) * (this.radius + 48);
            }
        }
    }

    class Item {
        constructor() {
            this.x = Math.random() * 800 + 200; this.y = -40; this.w = 40; this.h = 40; this.vy = 3;
            let t = ['increase', 'decrease', 'freeze']; this.type = t[Math.floor(Math.random() * 3)]; this.active = true;
        }
        draw() { if (this.active) c.drawImage(itemImgs[this.type], this.x, this.y, this.w, this.h); }
        update(b) {
            if (!this.active) return; this.y += this.vy; if (this.y > 450) this.active = false;
            let dx = b.x - (this.x + this.w / 2); let dy = b.y - (this.y + this.h / 2);
            if (Math.sqrt(dx * dx + dy * dy) < b.radius + 20) {
                this.active = false;
                if (this.type === 'increase') { b.radius = 40; setTimeout(() => b.radius = 24, 4000); }
                else if (this.type === 'decrease') { b.radius = 15; setTimeout(() => b.radius = 24, 4000); }
                else if (this.type === 'freeze') {
                    p1.frozen = true; p2.frozen = true;
                    setTimeout(() => { p1.frozen = false; p2.frozen = false; }, 3000);
                }
            }
        }
    }

    class Goal {
        constructor(x, side) {
            this.x = x; this.y = 320; this.w = 150; this.h = 230;
            this.img = new Image();
            this.img.src = side === 1 ? "source/Goal - Side.png" : "source/Goal - Side2.png";
        }
        draw() { c.drawImage(this.img, this.x, this.y, this.w, this.h); }
    }

    let p1 = new Player(150, false, p1Assets);
    let p2 = new Player(925, true, p2Assets);
    let ball = new Ball();
    let goalLeft = new Goal(0, 1);
    let goalRight = new Goal(1050, 2);
    let itemsList = [];

    window.itemInterval = setInterval(() => {
        if (!isPaused && !isGameOver && gameStarted) itemsList.push(new Item());
    }, 5000);

    function animate() {
        if (isGameOver) return;
        window.gameAnimationId = requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height);

        c.fillStyle = 'rgba(34, 139, 34, 0.8)';
        c.fillRect(0, 570, canvas.width, 30);

        goalLeft.draw();
        goalRight.draw();

        if (!isPaused && gameStarted) {
            p1.update(); p2.update(); ball.update();
            ball.collideWith(p1); ball.collideWith(p2);
            itemsList.forEach(it => it.update(ball));
        }

        p1.draw(); p2.draw(); ball.draw();
        itemsList = itemsList.filter(it => it.active);
        itemsList.forEach(it => it.draw());
    }

    if (currentKeyDownListener) window.removeEventListener('keydown', currentKeyDownListener);
    if (currentKeyUpListener) window.removeEventListener('keyup', currentKeyUpListener);

    currentKeyDownListener = (e) => {
        if (e.key === "Escape" && gameStarted && !isGameOver) {
            if (isPaused) ResumeGame();
            else { isPaused = true; document.getElementById('pause-menu').style.display = 'block'; }
            return;
        }
        if (e.key.toLowerCase() === 'a') p1.backwardcon = true;
        if (e.key.toLowerCase() === 'd') p1.forwardcon = true;
        if (e.key.toLowerCase() === 'w') p1.jumpcon = true;
        if (e.key === ' ') p1.kickcon = true;
        if (e.key === "ArrowLeft") p2.forwardcon = true;
        if (e.key === "ArrowRight") p2.backwardcon = true;
        if (e.key === "ArrowUp") p2.jumpcon = true;
        if (e.key === "Enter") p2.kickcon = true;
    };
    currentKeyUpListener = (e) => {
        if (e.key.toLowerCase() === 'a') p1.backwardcon = false;
        if (e.key.toLowerCase() === 'd') p1.forwardcon = false;
        if (e.key === ' ') p1.kickcon = false;
        if (e.key === "ArrowLeft") p2.forwardcon = false;
        if (e.key === "ArrowRight") p2.backwardcon = false;
        if (e.key === "Enter") p2.kickcon = false;
    };
    window.addEventListener('keydown', currentKeyDownListener);
    window.addEventListener('keyup', currentKeyUpListener);

    countdownEl.style.display = 'block';
    countdownEl.innerText = countdownVal;
    countdownInterval = setInterval(() => {
        countdownVal--;
        if (countdownVal > 0) countdownEl.innerText = countdownVal;
        else if (countdownVal === 0) countdownEl.innerText = "GO!";
        else {
            clearInterval(countdownInterval);
            countdownEl.style.display = 'none';
            gameStarted = true;
            startCounter();
            animate();
        }
    }, 1000);
}

window.ShowHistory = function () {
    document.getElementById('match-history').style.display = 'block';
    window.RenderHistory();
};
window.CloseHistory = function () {
    document.getElementById('match-history').style.display = 'none';
};
window.RenderHistory = function () {
    let history = JSON.parse(localStorage.getItem('headball_history')) || [];
    let sortBy = document.getElementById('history-sort').value;
    if (sortBy === 'score') history.sort((a, b) => b.score - a.score);
    else history.sort((a, b) => b.timestamp - a.timestamp);
    let tbody = document.getElementById('history-list');
    tbody.innerHTML = '';
    history.forEach(item => {
        let row = document.createElement('tr');
        row.innerHTML = `<td>${item.date}</td><td>${item.winner}</td><td>${item.details}</td>`;
        tbody.appendChild(row);
    });
};