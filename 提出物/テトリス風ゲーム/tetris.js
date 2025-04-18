const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const gridSize = 20;
const boardWidth = 12;
const boardHeight = 20;

canvas.width = boardWidth * gridSize;
canvas.height = boardHeight * gridSize;

let board = [];
for (let y = 0; y < boardHeight; y++) {
    board[y] = [];
    for (let x = 0; x < boardWidth; x++) {
        board[y][x] = 0;
    }
}

const tetrominoes = [
    { shape: [[1, 1, 1, 1]], color: 'cyan' },
    { shape: [[1, 1], [1, 1]], color: 'yellow' },
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
    { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
    { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' },
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }
];

let currentTetromino = getRandomTetromino();
let currentX = Math.floor(boardWidth / 2) - Math.floor(currentTetromino.shape[0].length / 2);
let currentY = 0;
let nextTetromino = getRandomTetromino();
let heldTetromino = null;
let canHold = true;
let score = 0;
let level = 1;
let dropInterval = 500;

function getRandomTetromino() {
    return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

function drawTetromino() {
    currentTetromino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                context.fillStyle = currentTetromino.color;
                context.fillRect((currentX + x) * gridSize, (currentY + y) * gridSize, gridSize, gridSize);
            }
        });
    });
}

function drawBoard() {
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (board[y][x]) {
                context.fillStyle = board[y][x];
                context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            } else {
                context.strokeStyle = '#888';
                context.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);

                // 現在のテトリミノの縦一列の色を変更
                for (let i = 0; i < currentTetromino.shape.length; i++) {
                    for (let j = 0; j < currentTetromino.shape[i].length; j++) {
                        if (currentTetromino.shape[i][j]) {
                            if (currentX + j === x) {
                                context.fillStyle = 'lightgreen'; // 色を変更
                                context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                            }
                        }
                    }
                }
            }
        }
    }
}

function moveTetromino(dx, dy) {
    currentX += dx;
    currentY += dy;
    if (checkCollision()) {
        currentX -= dx;
        currentY -= dy;
        if (dy === 1) {
            freezeTetromino();
            clearLines();
            currentTetromino = nextTetromino;
            nextTetromino = getRandomTetromino();
            currentX = Math.floor(boardWidth / 2) - Math.floor(currentTetromino.shape[0].length / 2);
            currentY = 0;
            canHold = true;
            if (checkCollision()) {
                alert('ゲームオーバー！スコア: ' + score);
                resetGame();
            }
        }
    }
}

function rotateTetromino() {
    const originalShape = currentTetromino.shape;
    const rotatedShape = originalShape[0].map((val, index) => originalShape.map(row => row[index]).reverse());
    currentTetromino.shape = rotatedShape;
    if (checkCollision()) {
        currentTetromino.shape = originalShape;
    }
}

function checkCollision() {
    return currentTetromino.shape.some((row, y) => {
        return row.some((cell, x) => {
            return cell && (currentX + x < 0 || currentX + x >= boardWidth || currentY + y >= boardHeight || board[currentY + y][currentX + x]);
        });
    });
}

function freezeTetromino() {
    currentTetromino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                board[currentY + y][currentX + x] = currentTetromino.color;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    let clearedLines = [];
    for (let y = boardHeight - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            clearedLines.push(y);
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        board.splice(clearedLines[0], linesCleared);
        for (let i = 0; i < linesCleared; i++) {
            board.unshift(Array(boardWidth).fill(0));
        }
        updateScore(linesCleared);
    }
}

function updateScore(lines) {
    switch (lines) {
        case 1:
            score += 100 * level;
            break;
        case 2:
            score += 300 * level;
            break;
        case 3:
            score += 500 * level;
            break;
        case 4:
            score += 800 * level;
            break;
    }
    updateLevel();
}

function updateLevel() {
    if (score >= level * 1000) {
        level++;
        dropInterval *= 0.8;
    }
}

function drawNextTetromino() {
    context.fillStyle = '#000';
    context.fillRect(boardWidth * gridSize + 10, 10, 100, 100);
    context.fillStyle = nextTetromino.color;
    nextTetromino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                context.fillRect(boardWidth * gridSize + 20 + x * gridSize, 20 + y * gridSize, gridSize, gridSize);
            }
        });
    });
}

function drawHeldTetromino() {
    context.fillStyle = '#000';
    context.fillRect(boardWidth * gridSize + 10, 120, 100, 100);
    if (heldTetromino) {
        context.fillStyle = heldTetromino.color;
        heldTetromino.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    context.fillRect(boardWidth * gridSize + 20 + x * gridSize, 130 + y * gridSize, gridSize, gridSize);
                }
            });
        });
    }
}

function holdTetromino() {
    if (canHold) {
        if (heldTetromino === null) {
            heldTetromino = currentTetromino;
            currentTetromino = nextTetromino;
            nextTetromino = getRandomTetromino();
        } else {
            const temp = currentTetromino;
            currentTetromino = heldTetromino;
            heldTetromino = temp;
        }
        currentX = Math.floor(boardWidth / 2) - Math.floor(currentTetromino.shape[0].length / 2);
        currentY = 0;
        canHold = false;
    }
}

function resetGame() {
    board = [];
    for (let y = 0; y < boardHeight; y++) {
        board[y] = [];
        for (let x = 0; x < boardWidth; x++) {
            board[y][x] = 0;
        }
    }
    score = 0;
    level = 1;
    dropInterval = 500;
    currentTetromino = getRandomTetromino();
    nextTetromino = getRandomTetromino();
    heldTetromino = null;
    canHold = true;
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawTetromino();
    drawNextTetromino();
    drawHeldTetromino();
    moveTetromino(0, 1);
    document.getElementById('score').textContent = 'スコア: ' + score;
    document.getElementById('level').textContent = 'レベル: ' + level;
    setTimeout(gameLoop, dropInterval);
}

gameLoop();

document.addEventListener('keydown', event => {
    switch (event.key) {
        case 'ArrowLeft':
            moveTetromino(-1, 0);
            break;
        case 'ArrowRight':
            moveTetromino(1, 0);
            break;
        case 'ArrowUp':
            rotateTetromino();
            break;
        case 'ArrowDown':
            moveTetromino(0, 1);
            break;
        case 'c':
            holdTetromino();
            break;
    }
});