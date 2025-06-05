let canvas = document.querySelector("canvas");
let gameUpdates = document.querySelector("#gameUpdates");
let undo=document.querySelector("#undo");
canvas.width = 900;
canvas.height = 800;
let moveHistory=[];
let gameWon=false;

let c = canvas.getContext("2d");

let mouse = {
    x: undefined,
    y: undefined
};


let rows = 6;
let columns = 7;
let cellWidth = 100;
let cellHeight = 100;
let gridStartX = 100;
let gridStartY = 100;

let discs = [];
let playerDisks = {
    "red": 4,
    "yellow": 4
};
let blockedColumn = null;
let currentPlayer = "red"; // Player 1 starts
let waitingForBlock = true;

let currRow = null;
let currCol = null;
let lineCoordinates={
    startX:undefined,
    startY:undefined,
    endX:undefined,
    endY:undefined
};

// Timer variables for both players
let playerTimers = {
    red: 30,    // 30 seconds per turn
    yellow: 30
};
let timerInterval = null;

// Get the timer <span> elements for each player (from HTML)
const player1TimerSpan = document.querySelectorAll("#player")[0].querySelector("#timer span");
const player2TimerSpan = document.querySelectorAll("#player")[1].querySelector("#timer span");

// Initialize board
function initializeDiscs() {
    discs = [];
    for (let i = 0; i < rows; i++) {
        discs[i] = new Array(columns).fill(null);
    }
}

initializeDiscs();

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    findRowCol();
    if (currCol === null) return;

    if (waitingForBlock) {
        const opponent = currentPlayer === "red" ? "yellow" : "red";

        if (isColumnFull(currCol)) {
            gameUpdates.innerHTML = `⚠️ Column ${currCol + 1} is full and can't be blocked. Try another.`;
            return;
        }

        const availableCols = getAvailableColumns().filter(col => col !== currCol);
        if (availableCols.length === 0) {
            blockedColumn = null;
            gameUpdates.innerHTML = `🚫 No valid block possible. No column blocked. ${currentPlayer.toUpperCase()}'s turn.`;
        } else {
            moveHistory.push({
                type: 'block',
                currentPlayer,  // The player who is doing the blocking
                blockedColumn,  // The column being blocked (before change)
                playerTimers: { ...playerTimers }  // Copy of the timers
            });

            blockedColumn = currCol;
            gameUpdates.innerHTML = `🔒 ${opponent.toUpperCase()} blocked column ${blockedColumn + 1}. ${currentPlayer.toUpperCase()}'s turn.`;
        }

        waitingForBlock = false;
        drawGrid(); // Update grid immediately after blocking
    } else {
        if (currCol === blockedColumn) {
            gameUpdates.innerHTML = `🚫 Column ${blockedColumn + 1} is blocked this turn. Choose another column.`;
            return;
        }

        if (isColumnFull(currCol)) {
            gameUpdates.innerHTML = `⚠️ Column ${currCol + 1} is full. Choose another column.`;
            return;
        }

        // Check if player has disks left
        if (playerDisks[currentPlayer] <= 0) {
            gameUpdates.innerHTML = `⚠️ ${currentPlayer.toUpperCase()} has no disks left!`;
            return;
        }

        const placedRow = placeDisc(currCol, currentPlayer);
        if (placedRow !== null) {
            moveHistory.push({
                type: 'move',
                currentPlayer,  // The player who made the move
                board: discs.map(row => row.slice()),  // Copy of the board before the move
                playerTimers: { ...playerTimers }  // Copy of the timers
            });

            // Save move to history
            gameUpdates.innerHTML = `✅ ${currentPlayer.toUpperCase()} placed a disc in column ${currCol + 1}.`;

            playerDisks[currentPlayer]--;

            const result = checkWin();
            if (result === 'win' || result === 'draw') {
                gameWon=true;
                endGame(result === 'win' ? currentPlayer : 'draw');
                if(result==="win"){
                    canvas.style.backgroundColor=currentPlayer;
                }
                return;
            }

            switchTurn();
            drawGrid(); // Update grid after placing disc
        }
    }
}

canvas.addEventListener("click", handleClick);

let pause=document.querySelector("#pause");
let play=document.querySelector("#play");
let currentPlayerTime;
let body=document.querySelector("body");

pause.addEventListener("click",()=>{
     currentPlayerTime=playerTimers[currentPlayer];
    if(timerInterval) clearInterval(timerInterval);
    canvas.removeEventListener("click", handleClick);
    body.style.opacity=0.7;
    gameUpdates.innerHTML="Game Paused !! Play to start it "
    updateTimerUI();

}
)
play.addEventListener("click",()=>{
    canvas.addEventListener("click", handleClick);
    body.style.opacity=1;
    startTimerForCurrentPlayer(currentPlayerTime);


})

function undoLastMove() {
    if (moveHistory.length === 0 || gameWon) return;

    const lastAction = moveHistory.pop();

    if (lastAction.type === 'move') {
        // Restore the board state
        discs = lastAction.board.map(row => row.slice());
        // Restore the disk count for the player who made the move
        playerDisks[lastAction.currentPlayer]++;
        // Restore timers
        playerTimers = { ...lastAction.playerTimers };
        gameWon = false;
        
        // The current player should be the one who made the move
        currentPlayer = lastAction.currentPlayer;
        // After undoing a move, we need to go back to the block phase
        waitingForBlock = true;
        blockedColumn = null;

        gameUpdates.innerHTML = `↩️ Move undone. ${currentPlayer.toUpperCase()} must now block a column.`;

    } else if (lastAction.type === 'block') {
        // Restore block state
        blockedColumn = lastAction.blockedColumn;
        // Restore the current player (who did the blocking)
        currentPlayer = lastAction.currentPlayer;
        // Restore timers
        playerTimers = { ...lastAction.playerTimers };
        // After undoing a block, we're back to the move phase
        waitingForBlock = false;

        gameUpdates.innerHTML = `↩️ Block undone. ${currentPlayer.toUpperCase()} may now place a disc.`;
    }

    // Reset the timer for the current player
    clearInterval(timerInterval);
    startTimerForCurrentPlayer(playerTimers[currentPlayer]);
    drawGrid();
    updateTimerUI();
    canvas.addEventListener("click", handleClick);
    particles.length = 0;
}


undo.addEventListener("click",undoLastMove);

function findRowCol() {
    currRow = Math.floor((mouse.y - gridStartY) / cellHeight);
    currCol = Math.floor((mouse.x - gridStartX) / cellWidth);

    if (
        currCol < 0 || currCol >= columns ||
        currRow < 0 || currRow >= rows
    ) {
        currRow = null;
        currCol = null;
    }
}

function placeDisc(col, color) {
    for (let row = rows - 1; row >= 0; row--) {
        if (!discs[row][col]) {
            discs[row][col] = color;
            return row; // return row placed
        }
    }
    return null;
}

function isColumnFull(col) {
    return discs[0][col] !== null;
}

function getAvailableColumns() {
    return [...Array(columns).keys()].filter(col => !isColumnFull(col));
}

function switchTurn() {
    currentPlayer = currentPlayer === "red" ? "yellow" : "red";
    waitingForBlock = true;
    blockedColumn = null;
    resetTimerForPlayer(currentPlayer);
}

function drawGrid() {
    const isDark = document.body.classList.contains("dark-mode");
    // Clear canvas first
    c.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    c.fillStyle = isDark ? "#222" : "#fff";
    c.fillRect(gridStartX, gridStartY, columns * cellWidth, rows * cellHeight);

    // Highlight blocked column (before drawing cells)
    if (blockedColumn !== null) {
        c.fillStyle = 'rgba(0, 0, 0, 0.2)';
        c.fillRect(gridStartX + blockedColumn * cellWidth, gridStartY, cellWidth, cellHeight * rows);
    }

    // Draw each cell
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = gridStartX + col * cellWidth;
            const y = gridStartY + row * cellHeight;

            // Cell background
            c.strokeStyle = "black";
            c.strokeRect(x, y, cellWidth, cellHeight);

            // Draw disc or empty hole
            c.beginPath();
            const cx = x + cellWidth / 2;
            const cy = y + cellHeight / 2;
            const radius = cellWidth / 2 - 5;

            if (discs[row][col]) {
                c.fillStyle = discs[row][col];
                c.arc(cx, cy, radius, 0, Math.PI * 2);
                c.fill();
                c.strokeStyle = "black";
                c.stroke();
            } else {
                c.fillStyle = "white";
                c.arc(cx, cy, radius, 0, Math.PI * 2);
                c.fill();
                c.strokeStyle = "lightgray";
                c.stroke();
            }
        }
    }

    // Display remaining disks
    c.fillStyle = "black";
    c.font = "20px Arial";
    c.fillText(`Red Disks: ${playerDisks.red}`, 20, 30);
    c.fillText(`Yellow Disks: ${playerDisks.yellow}`, 20, 60);
}
function drawLine(startX, startY, endX, endY) {
    c.beginPath();
    c.moveTo(startX, startY);
    c.lineTo(endX, endY);
    c.strokeStyle = "rgba(0,0,0,0.3)";
    c.lineWidth = 5;
    c.stroke();
}



function checkWin() {
    const cellSize = 100; // or whatever your cell size is
    const offset = cellSize / 2; // to center the line in the disc

    

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const color = discs[row][col];
            if (!color) continue;

            // Horizontal
            if (col <= columns - 4 &&
                discs[row][col + 1] === color &&
                discs[row][col + 2] === color &&
                discs[row][col + 3] === color) {

                const startX = (col+1) * cellSize + offset;
                const startY = (row+1) * cellSize + offset;
                const endX = (col + 3+1) * cellSize + offset;
                const endY = (row+1) * cellSize + offset;
                drawLine(startX, startY, endX, endY);
                return 'win';
            }

            // Vertical
            if (row <= rows - 4 &&
                discs[row + 1][col] === color &&
                discs[row + 2][col] === color &&
                discs[row + 3][col] === color) {

                const startX = (col+1)* cellSize + offset;
                const startY = (row+1) * cellSize + offset;
                const endX = (col+1) * cellSize + offset;
                const endY = (row+1 + 3) * cellSize + offset;
                drawLine(startX, startY, endX, endY);
                return 'win';
            }

            // Diagonal down-right
            if (row <= rows - 4 && col <= columns - 4 &&
                discs[row + 1][col + 1] === color &&
                discs[row + 2][col + 2] === color &&
                discs[row + 3][col + 3] === color) {

                const startX = (col+1)* cellSize + offset;
                const startY = (row+1)* cellSize + offset;
                const endX = (col+1+ 3) * cellSize + offset;
                const endY = (row+1+ 3) * cellSize + offset;
                drawLine(startX, startY, endX, endY);
                return 'win';
            }

            // Diagonal up-right
            if (row >= 3 && col <= columns - 4 &&
                discs[row - 1][col + 1] === color &&
                discs[row - 2][col + 2] === color &&
                discs[row - 3][col + 3] === color) {

                const startX = (col+1)* cellSize + offset;
                const startY = (row+1) * cellSize + offset;
                const endX = (col+1+ 3) * cellSize + offset;
                const endY = (row - 3+1) * cellSize + offset;
                drawLine(startX, startY, endX, endY);
                return 'win';
            }
        }
    }

    if (
        (playerDisks["red"] === 0 && playerDisks["yellow"] === 0) ||
        getAvailableColumns().length === 0
    ) {
        return "draw";
    }

    return null;
}

let particles = [];
function animateExplosion(winner) {
        c.clearRect(0, 0, canvas.width, canvas.height);

        // Draw blue background
        c.fillStyle = "#1a73e8";
        c.fillRect(gridStartX, gridStartY, columns * cellWidth, rows * cellHeight);

        // Draw grid lines
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                c.strokeStyle = "black";
                c.strokeRect(
                    gridStartX + col * cellWidth,
                    gridStartY + row * cellHeight,
                    cellWidth,
                    cellHeight
                );
            }
        }

        // Animate particles
        particles.forEach(p => {
            c.beginPath();
            c.fillStyle = p.color;
            c.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            c.fill();
            p.x += p.dx;
            p.y += p.dy;
            p.life--;
        });

        particles = particles.filter(p => p.life > 0);

        if (particles.length > 0) {
            requestAnimationFrame(animateExplosion);
        } else {
            // Show final message
            if (winner === "draw") {
                gameUpdates.innerHTML = `🤝 It's a draw!`;
            } else {
                gameUpdates.innerHTML = `🎉 ${winner} wins the game!`;
            }
            // Clear timers on UI
            player1TimerSpan.textContent = '0s';
            player2TimerSpan.textContent = '0s';
        }
    }

function endGame(winner) {
    canvas.removeEventListener("click", handleClick);
    clearInterval(timerInterval);
    document.querySelector("#reset").innerHTML="Replay";

    if (winner === 'draw') {
        gameUpdates.innerHTML = `🤝 It's a draw!`;
        player1TimerSpan.textContent = '0s';
        player2TimerSpan.textContent = '0s';
        animateExplosion(winner);
        return;
    }

    highlightWinningDiscs(winner);

    // Prepare particles globally
    particles = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            if (discs[row][col]) {
                for (let i = 0; i < 5; i++) {
                    particles.push({
                        x: gridStartX + col * cellWidth + cellWidth / 2,
                        y: gridStartY + row * cellHeight + cellHeight / 2,
                        dx: (Math.random() - 0.5) * 8,
                        dy: (Math.random() - 0.5) * 8,
                        radius: 5 + Math.random() * 5,
                        color: discs[row][col],
                        life: 60
                    });
                }
            }
        }
    }

    // Delay explosion until highlight is done
    setTimeout(() => {
        animateExplosion(winner);
    }, 500 * 5); // match maxFlashes * flashInterval

    play.style.display="none";
    pause.style.display="none";
    updateLeaderboard(winner);  // Add this inside endGame
    document.getElementById("leaderboardContainer").style.display = "block";

}


function highlightWinningDiscs(winner) {
    let flashCount = 0;
    const maxFlashes = 5;
    const flashInterval = 500; // milliseconds
    let winningDiscs = findWinningDiscs(winner);

    const flashIntervalId = setInterval(() => {
        // Toggle between normal and highlighted state
        const highlight = flashCount % 2 === 0;
        
        drawGrid(); // Redraw the grid
        
        if (highlight) {
            // Highlight winning discs
            winningDiscs.forEach(disc => {
                const { row, col } = disc;
                const x = gridStartX + col * cellWidth + cellWidth / 2;
                const y = gridStartY + row * cellHeight + cellHeight / 2;
                
                // Draw a glowing effect
                c.beginPath();
                c.fillStyle = winner === 'red' ? 'rgba(255, 100, 100, 0.7)' : 'rgba(255, 255, 100, 0.7)';
                c.arc(x, y, cellWidth / 2 + 5, 0, Math.PI * 2);
                c.fill();
                
                // Draw the disc itself
                c.beginPath();
                c.fillStyle = winner;
                c.arc(x, y, cellWidth / 2 - 5, 0, Math.PI * 2);
                c.fill();
                c.strokeStyle = "black";
                c.stroke();
            });
        }

        flashCount++;
        if (flashCount >= maxFlashes * 2) {
            clearInterval(flashIntervalId);
            gameUpdates.innerHTML = `🎉 ${winner.toUpperCase()} wins the game!`;
            player1TimerSpan.textContent = '0s';
            player2TimerSpan.textContent = '0s';
            
            // Final draw with winning discs highlighted
            drawGrid();
            winningDiscs.forEach(disc => {
                const { row, col } = disc;
                const x = gridStartX + col * cellWidth + cellWidth / 2;
                const y = gridStartY + row * cellHeight + cellHeight / 2;
                
                c.beginPath();
                c.fillStyle = winner === 'red' ? 'rgba(255, 100, 100, 0.7)' : 'rgba(255, 255, 100, 0.7)';
                c.arc(x, y, cellWidth / 2 + 5, 0, Math.PI * 2);
                c.fill();
                
                c.beginPath();
                c.fillStyle = winner;
                c.arc(x, y, cellWidth / 2 - 5, 0, Math.PI * 2);
                c.fill();
                c.strokeStyle = "black";
                c.stroke();
            });
        }
    }, flashInterval);
}

function findWinningDiscs(winner) {
    let winningDiscs = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const color = discs[row][col];
            if (!color || color !== winner) continue;

            // Horizontal
            if (col <= columns - 4 &&
                discs[row][col + 1] === color &&
                discs[row][col + 2] === color &&
                discs[row][col + 3] === color) {
                return [
                    { row, col },
                    { row, col: col + 1 },
                    { row, col: col + 2 },
                    { row, col: col + 3 }
                ];
            }

            // Vertical
            if (row <= rows - 4 &&
                discs[row + 1][col] === color &&
                discs[row + 2][col] === color &&
                discs[row + 3][col] === color) {
                return [
                    { row, col },
                    { row: row + 1, col },
                    { row: row + 2, col },
                    { row: row + 3, col }
                ];
            }

            // Diagonal down-right
            if (row <= rows - 4 && col <= columns - 4 &&
                discs[row + 1][col + 1] === color &&
                discs[row + 2][col + 2] === color &&
                discs[row + 3][col + 3] === color) {
                return [
                    { row, col },
                    { row: row + 1, col: col + 1 },
                    { row: row + 2, col: col + 2 },
                    { row: row + 3, col: col + 3 }
                ];
            }

            // Diagonal up-right
            if (row >= 3 && col <= columns - 4 &&
                discs[row - 1][col + 1] === color &&
                discs[row - 2][col + 2] === color &&
                discs[row - 3][col + 3] === color) {
                return [
                    { row, col },
                    { row: row - 1, col: col + 1 },
                    { row: row - 2, col: col + 2 },
                    { row: row - 3, col: col + 3 }
                ];
            }
        }
    }

    return winningDiscs; // Will return empty array if no winning discs found
}


function init() {
    canvas.style.backgroundColor="#2a5";
    mouse = {
        x: undefined,
        y: undefined
    };

    rows = 6;
    columns = 7;
    cellWidth = 100;
    cellHeight = 100;
    gridStartX = 100;
    gridStartY = 100;
    moveHistory=[];
    gameWon=false;

    initializeDiscs();
    playerDisks = {
        "red": 4,
        "yellow": 4
    };
    blockedColumn = null;
    currentPlayer = "red";
    waitingForBlock = true;

    currRow = null;
    currCol = null;
    lineCoordinates={
        startX:undefined,
        startY:undefined,
        endX:undefined,
        endY:undefined
    };


    // Reset timers
    playerTimers.red = 30;
    playerTimers.yellow = 30;

    updateTimerUI();

    // Clear previous timer interval if any
    if (timerInterval) clearInterval(timerInterval);

    // Re-enable click handler
    canvas.addEventListener("click", handleClick);
    
    startTimerForCurrentPlayer(30);
    document.querySelector("#reset").innerHTML="Reset";

    play.style.display="";
    pause.style.display="";

    drawGrid();
    renderLeaderboard(); 

    document.getElementById("leaderboardContainer").style.display = "none"; // Hide at start

}

init();

document.querySelector("#reset").addEventListener("click", () => {
    init();
    gameUpdates.innerHTML = "Game restarted. Player 1 (RED) starts the game";
});

// Timer functions
function startTimerForCurrentPlayer(time) {
    // Clear previous interval
    if (timerInterval) clearInterval(timerInterval);

    // Reset current player's timer to 30 seconds
    playerTimers[currentPlayer] = time;
    updateTimerUI();

    timerInterval = setInterval(() => {
        playerTimers[currentPlayer] -= 0.1;
        
        if (playerTimers[currentPlayer] <= 0) {
            playerTimers[currentPlayer] = 0;
            updateTimerUI();
            clearInterval(timerInterval);
            // Time's up - opponent wins
            const opponent = currentPlayer === "red" ? "yellow" : "red";
            gameUpdates.innerHTML = `⏰ Time's up for ${currentPlayer.toUpperCase()}! ${opponent.toUpperCase()} wins!`;
            endGame(opponent);
            return;
        }
        updateTimerUI();
        
    }, 100);
}

function resetTimerForPlayer(player) {
    playerTimers[player] = 30;
    updateTimerUI();
    startTimerForCurrentPlayer(30);
}

function updateTimerUI() {
    // Display timers rounded to 1 decimal place
    player1TimerSpan.textContent = `${Math.max(0, playerTimers.red).toFixed(1)}s`;
    player2TimerSpan.textContent = `${Math.max(0, playerTimers.yellow).toFixed(1)}s`;
}

// Initial draw
drawGrid();

const themeToggle = document.getElementById("themeToggle");

// Set initial theme
document.body.classList.add("light-mode");

themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.contains("light-mode");
    document.body.classList.toggle("light-mode", !isLight);
    document.body.classList.toggle("dark-mode", isLight);

    themeToggle.textContent = isLight ? "☀️ Light Mode" : "🌙 Dark Mode";
    drawGrid(); // redraw canvas to match theme
});

function updateLeaderboard(winner) {
    let stats = JSON.parse(localStorage.getItem("leaderboard")) || {};

    // Initialize missing player stats if necessary
    if (!stats.red) stats.red = { wins: 0, draws: 0 };
    if (!stats.yellow) stats.yellow = { wins: 0, draws: 0 };

    if (winner === "draw") {
        stats.red.draws += 1;
        stats.yellow.draws += 1;
    } else if (winner === "red" || winner === "yellow") {
        stats[winner].wins += 1;
    }

    localStorage.setItem("leaderboard", JSON.stringify(stats));
    renderLeaderboard(stats);
}


function renderLeaderboard(stats = null) {
    stats = stats || JSON.parse(localStorage.getItem("leaderboard")) || {};

    // Safeguard: initialize if missing
    if (!stats.red) stats.red = { wins: 0, draws: 0 };
    if (!stats.yellow) stats.yellow = { wins: 0, draws: 0 };

    const tbody = document.querySelector("#leaderboard tbody");
    tbody.innerHTML = `
        <tr>
            <td>🔴 Red</td>
            <td>${stats.red.wins}</td>
            <td>${stats.red.draws}</td>
        </tr>
        <tr>
            <td>🟡 Yellow</td>
            <td>${stats.yellow.wins}</td>
            <td>${stats.yellow.draws}</td>
        </tr>
    `;

    const container = document.getElementById("leaderboardContainer");
    if (document.body.classList.contains("dark-mode")) {
        container.classList.add("dark-mode");
    } else {
        container.classList.remove("dark-mode");
    }
}

document.getElementById("resetLeaderboard").addEventListener("click", () => {
    const emptyStats = {
        red: { wins: 0, draws: 0 },
        yellow: { wins: 0, draws: 0 }
    };
    localStorage.setItem("leaderboard", JSON.stringify(emptyStats));
    renderLeaderboard(emptyStats);
    gameUpdates.innerHTML = "🏁 Leaderboard reset to 0!";
});


const modal = document.getElementById("instructionsModal");
const openBtn = document.getElementById("openInstructions");
const closeBtn = document.querySelector(".modal .close");

openBtn.onclick = function () {
  modal.style.display = "block";
  if (document.body.classList.contains("dark-mode")) {
    document.querySelector(".modal-content").classList.add("dark-mode");
  } else {
    document.querySelector(".modal-content").classList.remove("dark-mode");
  }
   currentPlayerTime=playerTimers[currentPlayer];
    if(timerInterval) clearInterval(timerInterval);
    canvas.removeEventListener("click", handleClick);
    body.style.opacity=0.7;
    gameUpdates.innerHTML="Game Paused !! Play to start it "
    updateTimerUI();
};

closeBtn.onclick = function () {
  modal.style.display = "none";
   canvas.addEventListener("click", handleClick);
    body.style.opacity=1;
    startTimerForCurrentPlayer(currentPlayerTime);
};

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};



