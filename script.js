const board = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const status = document.getElementById('status');
const resetButton = document.getElementById('reset');
const modeSelect = document.getElementById('mode');

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// Store the original cell colors
const originalCellColors = cells.map(cell => cell.style.backgroundColor);

// Event listener for mode selection
modeSelect.addEventListener('change', function () {
    currentPlayer = 'X'; // Reset the current player to X
    gameBoard = ['', '', '', '', '', '', '', '', '']; // Reset the game board
    gameActive = true; // Reset game status
    updateStatusText(); // Update status text based on selected mode
    resetBoard(); // Reset the game board UI

    if (modeSelect.value === 'ai' && currentPlayer === 'O') {
        // If playing against AI and it's AI's turn, trigger AI move
        handleAIMove();
    }
});

// Event listener for cell clicks
board.addEventListener('click', handleCellClick);

// Event listener for reset button
resetButton.addEventListener('click', handleReset);

// Function to handle cell click
function handleCellClick(event) {
    const cell = event.target;
    const cellIndex = cell.getAttribute('data-cell-index');

    // Check if the cell is already marked or the game is over
    if (!gameActive || gameBoard[cellIndex] !== '') return;

    // Update game board and UI
    gameBoard[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer;

    // Change the background color of the clicked O cell to #00BFFF
    if (currentPlayer === 'O') {
        cell.style.backgroundColor = '#00BFFF';
    } else {
        cell.style.backgroundColor = '#FF4500'; // Change the background color of X cells
    }

    // Check for a win or draw
    if (checkWin()) {
        gameActive = false;
        status.textContent = `Player ${currentPlayer} Wins!`;
    } else if (isBoardFull()) {
        gameActive = false;
        status.textContent = 'It\'s a Draw!';
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatusText();

        if (modeSelect.value === 'ai' && currentPlayer === 'O') {
            // If playing against AI and it's AI's turn, trigger AI move
            handleAIMove();
        }
    }
}

// Function to handle AI move
function handleAIMove() {
    // Implement AI logic (e.g., random move for simplicity)
    let emptyCells = gameBoard.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);

    if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const aiMove = emptyCells[randomIndex];
        gameBoard[aiMove] = 'O';
        cells[aiMove].textContent = 'O';
        cells[aiMove].style.backgroundColor = '#00BFFF';

        // Check for a win or draw after AI move
        if (checkWin()) {
            gameActive = false;
            status.textContent = 'AI Wins!';
        } else if (isBoardFull()) {
            gameActive = false;
            status.textContent = 'It\'s a Draw!';
        } else {
            currentPlayer = 'X';
            updateStatusText();
        }
    }
}

// Function to check for a win
function checkWin() {
    const winCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const combination of winCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            highlightWinningCells(combination); // Highlight the winning cells
            return true;
        }
    }

    return false;
}

// Function to highlight the winning cells
function highlightWinningCells(combination) {
    for (const index of combination) {
        cells[index].style.backgroundColor = '#00FA9A'; // Change the background color of winning cells
    }
}

// Function to check if the board is full (a draw)
function isBoardFull() {
    return gameBoard.every(cell => cell !== '');
}

// Function to reset the game board
function resetBoard() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach((cell, index) => {
        cell.textContent = '';
        cell.style.backgroundColor = originalCellColors[index]; // Reset to the original background color
    });
    gameActive = true;
}

// Function to update the status text based on the selected mode
function updateStatusText() {
    if (modeSelect.value === 'ai') {
        status.textContent = currentPlayer === 'X' ? 'Your Turn' : 'AI\'s Turn';
    } else {
        status.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

// Function to handle game reset
function handleReset() {
    // Clear the game board and reset the game state
    resetBoard();

    // Reset the status text based on the selected mode
    if (modeSelect.value === 'ai') {
        status.textContent = 'Your Turn';
    } else {
        status.textContent = `Player X's Turn`;
    }

    // Ensure the first player is always 'X' when the game resets
    currentPlayer = 'X';

    // Re-enable cell click event listeners
    board.removeEventListener('click', handleCellClick);
    board.addEventListener('click', handleCellClick); // Add it again to reset the event

    // Re-enable the mode selection dropdown
    modeSelect.disabled = false;
}

function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
    // Check if the game is over or if we've reached a terminal state
    const result = checkResult(board);
    if (result !== null) {
        if (result === 'X') {
            return -1; // Player X wins
        } else if (result === 'O') {
            return 1; // Player O wins
        } else {
            return 0; // It's a draw
        }
    }

    if (isMaximizingPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O'; // Simulate AI move
                const score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = ''; // Undo the move
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, bestScore);

                if (beta <= alpha) {
                    break; // Prune remaining branches
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X'; // Simulate player X move
                const score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = ''; // Undo the move
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, bestScore);

                if (beta <= alpha) {
                    break; // Prune remaining branches
                }
            }
        }
        return bestScore;
    }
}

function getAIMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O'; // Simulate AI move
            const score = minimax(gameBoard, 0, false, -Infinity, Infinity);
            gameBoard[i] = ''; // Undo the move

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}
