const boardSize = 10;
const shipLengths = [5, 4, 3, 3, 2];
let playerBoard = [];
let computerBoard = [];
let playerHits = [];
let computerHits = [];
let gameOver = false;
let placingShips = true;
let currentShipIndex = 0;
let playerTurn = true;
let currentDirection = true;
let gameStarted = false;

function initBoards() {
    playerBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    computerBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    playerHits = [];
    computerHits = [];
    gameOver = false;
    placingShips = true;
    currentShipIndex = 0;
    playerTurn = true;
    currentDirection = true;
    gameStarted = false;
    displayNotification("");
}

function placeShips(board) {
    shipLengths.forEach(shipLength => {
        let placed = false;
        while (!placed) {
            const direction = Math.random() < 0.5;
            const row = Math.floor(Math.random() * (direction ? boardSize : boardSize - shipLength));
            const col = Math.floor(Math.random() * (direction ? boardSize - shipLength : boardSize));

            if (canPlaceShip(board, row, col, shipLength, direction)) {
                for (let i = 0; i < shipLength; i++) {
                    board[direction ? row : row + i][direction ? col + i : col] = 1;
                }
                placed = true;
            }
        }
    });
}

function canPlaceShip(board, row, col, length, direction) {
    for (let i = 0; i < length; i++) {
        if (board[direction ? row : row + i][direction ? col + i : col] !== 0) {
            return false;
        }
    }
    return true;
}

function playerMove(row, col) {
    if (gameOver || !playerTurn || playerHits.includes(`${row},${col}`) || !gameStarted) return;

    playerHits.push(`${row},${col}`);
    if (computerBoard[row][col] === 1) {
        displayNotification("Hit!");
        computerBoard[row][col] = 2;
        document.querySelector(`#computer-board .cell[data-row="${row}"][data-col="${col}"]`).classList.add('hit');
    } else {
        displayNotification("Miss!");
        computerBoard[row][col] = -1;
        document.querySelector(`#computer-board .cell[data-row="${row}"][data-col="${col}"]`).classList.add('miss');
    }
    checkGameOver(computerBoard);
    playerTurn = false;
    if (!gameOver) {
        setTimeout(computerMove, 1000);
    }
}

function computerMove() {
    if (gameOver || playerTurn) return;

    let row, col;
    do {
        row = Math.floor(Math.random() * boardSize);
        col = Math.floor(Math.random() * boardSize);
    } while (computerHits.includes(`${row},${col}`));

    computerHits.push(`${row},${col}`);
    if (playerBoard[row][col] === 1) {
        displayNotification("Computer hit!");
        playerBoard[row][col] = 2;
        const cell = document.querySelector(`#player-board .cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('ship');
        cell.classList.add('hit');
    } else {
        displayNotification("Computer miss!");
        playerBoard[row][col] = -1;
        document.querySelector(`#player-board .cell[data-row="${row}"][data-col="${col}"]`).classList.add('miss');
    }
    checkGameOver(playerBoard);
    playerTurn = true;
}

function checkGameOver(board) {
    const isGameOver = board.flat().every(cell => cell !== 1);
    if (isGameOver) {
        gameOver = true;
        displayNotification(playerTurn ? "Game Over! You win!" : "Game Over! Computer wins!");
    }
}

function createGameBoard(boardId, isPlayerBoard) {
    const gameBoard = document.getElementById(boardId);
    gameBoard.innerHTML = '';

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            if (isPlayerBoard) {
                cell.addEventListener('click', () => placePlayerShip(row, col));
                cell.addEventListener('mouseover', () => showShipOutline(row, col));
                cell.addEventListener('mouseout', () => hideShipOutline(row, col));
            } else {
                cell.addEventListener('click', () => playerMove(row, col));
            }
            gameBoard.appendChild(cell);
        }
    }
}

function placePlayerShip(row, col) {
    if (!placingShips || playerBoard[row][col] === 1) return;

    const shipLength = shipLengths[currentShipIndex];

    if (canPlaceShip(playerBoard, row, col, shipLength, currentDirection)) {
        hideShipOutline(row, col);
        for (let i = 0; i < shipLength; i++) {
            playerBoard[currentDirection ? row : row + i][currentDirection ? col + i : col] = 1;
            document.querySelector(`#player-board .cell[data-row="${currentDirection ? row : row + i}"][data-col="${currentDirection ? col + i : col}"]`).classList.add('ship');
        }
        currentShipIndex++;
        if (currentShipIndex >= shipLengths.length) {
            placingShips = false;
            document.getElementById('start-game').disabled = false;
        }
    } else {
        displayNotification("Cannot place ship here!");
    }
}

function showShipOutline(row, col) {
    const shipLength = shipLengths[currentShipIndex];
    for (let i = 0; i < shipLength; i++) {
        const cell = document.querySelector(`#player-board .cell[data-row="${currentDirection ? row : row + i}"][data-col="${currentDirection ? col + i : col}"]`);
        if (cell) {
            cell.classList.add('outline');
        }
    }
}

function hideShipOutline(row, col) {
    const shipLength = shipLengths[currentShipIndex];
    for (let i = 0; i < shipLength; i++) {
        const cell = document.querySelector(`#player-board .cell[data-row="${currentDirection ? row : row + i}"][data-col="${currentDirection ? col + i : col}"]`);
        if (cell) {
            cell.classList.remove('outline');
        }
    }
}

function displayNotification(message) {
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;
    setTimeout(() => {
        notificationElement.textContent = '';
    }, 2000);
}

function initializeGame() {
    initBoards();
    createGameBoard('player-board', true);
    createGameBoard('computer-board', false);
}

function startGame() {
    if (placingShips) return;
    placeShips(computerBoard);
    gameStarted = true;
}

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', initializeGame);

document.addEventListener('keydown', (event) => {
    if (event.key === 'z' || event.key === 'Z') {
        const currentRow = document.querySelector('.cell.outline')?.dataset.row;
        const currentCol = document.querySelector('.cell.outline')?.dataset.col;
        if (currentRow && currentCol) {
            hideShipOutline(parseInt(currentRow), parseInt(currentCol));
        }
        currentDirection = !currentDirection;
        if (currentRow && currentCol) {
            showShipOutline(parseInt(currentRow), parseInt(currentCol));
        }
    }
});

window.onload = initializeGame;