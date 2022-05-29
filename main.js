const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;

    return { getName, getSymbol };
};

const HumanPlayer = (symbol = "X", name = "Player One") => {
    function takeTurn(gameBoard) {
        gameBoard.awaitPlayerInput();
    }
    return Object.assign({}, Player(name, symbol), { takeTurn });
};

const AIPlayer = (symbol = "O", name = "AI Player", difficulty = 9) => {
    function getOpponentSymbol() {
        return symbol === "O" ? "X" : "O";
    }

    function minimax(gameBoard, moves = [], isMaximizing = true, depth = 0) {
        const endState = gameBoard.isClosed();

        // terminating cases
        if (depth === difficulty) return 0;
        if (endState) {
            if (/* tie */ endState.winner === "") {
                return 0;
            } /* AI wins */ else if (endState.winner === symbol) {
                return 100 - depth;
            } /* AI loses */ else {
                return depth - 100;
            }
        }

        const board = gameBoard.getBoard();

        let score;
        if (isMaximizing) {
            score = -100;

            gameBoard.getValidMoves().forEach((move) => {
                board[move] = symbol;
                const bestScore = minimax(gameBoard, moves, false, depth + 1);
                board[move] = "";

                score = Math.max(score, bestScore);

                if (depth === 0) {
                    moves.push({ location: move, bestScore });
                }
            });
        } else {
            score = 100;

            gameBoard.getValidMoves().forEach((move) => {
                board[move] = getOpponentSymbol();
                const bestScore = minimax(gameBoard, moves, true, depth + 1);
                board[move] = "";

                score = Math.min(score, bestScore);
            });
        }

        return depth === 0 ? moves : score;
    }

    function getBestMove(gameBoard) {
        if (difficulty > 5 && gameBoard.getBoard().every((x) => x === "")) {
            return [0, 2, 6, 8][Math.floor(Math.random() * 4)];
        } else {
            const moves = minimax(gameBoard);
            const bestScore = moves.reduce((bestScore, move) => Math.max(move.bestScore, bestScore), -Infinity);
            bestMoveLocations = moves.filter((move) => move.bestScore === bestScore).map((move) => move.location);
            return bestMoveLocations[Math.floor(Math.random() * bestMoveLocations.length)];
        }
    }

    function takeTurn(gameBoard) {
        gameBoard.playMove(getBestMove(gameBoard));
    }
    return Object.assign({}, Player(name, symbol), { takeTurn });
};

const GameBoard = ({ getCurrentPlayer, turnCompleted }) => {
    let board = ["", "", "", "", "", "", "", "", ""];
    let boardElements = document.querySelectorAll(".gameBoard-square");

    function init() {
        board = ["", "", "", "", "", "", "", "", ""];
        // board = ["O", "X", "O", "X", "", "O", "X", "", ""]; // test board 1
        // board = ["O", "", "X", "", "X", "", "O", "O", "X"]; // test board 2
        // board = ["", "O", "", "X", "", "O", "X", "X", "O"]; // test board 3

        display();
    }

    function display() {
        boardElements.forEach((element, i) => {
            element.textContent = board[i];
        });
    }

    function getBoard() {
        return board;
    }

    function getValidMoves() {
        return board.reduce((previous, current, i) => {
            if (current === "") {
                previous.push(i);
            }
            return previous;
        }, []);
    }

    function awaitPlayerInput() {
        board.forEach((val, i) => {
            if (val === "") {
                boardElements[i].addEventListener("click", onClick);
            }
        });
    }
    function rejectPlayerInput() {
        board.forEach((val, i) => {
            if (val === "") {
                boardElements[i].removeEventListener("click", onClick);
            }
        });
    }

    function onClick() {
        rejectPlayerInput();
        playMove(parseInt(this.dataset.id));
    }

    function playMove(location) {
        board[location] = getCurrentPlayer().getSymbol();
        display();
        turnCompleted();
    }

    function isClosed() {
        for (let i = 0; i < 3; i++) {
            // check for win along rows
            if (board[3 * i] !== "" && board[3 * i] === board[3 * i + 1] && board[3 * i + 1] === board[3 * i + 2]) {
                return { winner: board[3 * i], winningSquares: [3 * i, 3 * i + 1, 3 * i + 2] };
            }
            // check for win along columns
            if (board[i] !== "" && board[i] === board[i + 3] && board[i + 3] === board[i + 6]) {
                return { winner: board[i], winningSquares: [i, i + 3, i + 6] };
            }
        }

        // check for win along diagonals
        if (board[0] !== "" && board[0] === board[4] && board[4] === board[8]) {
            return { winner: board[0], winningSquares: [0, 4, 8] };
        }
        if (board[2] !== "" && board[2] === board[4] && board[4] === board[6]) {
            return { winner: board[2], winningSquares: [2, 4, 6] };
        }

        // check if tie
        if (getValidMoves().length === 0) {
            return { winner: "", winningSquares: [] };
        }

        return false;
    }

    return { init, getBoard, getValidMoves, awaitPlayerInput, playMove, isClosed };
};

const displayController = (() => {
    const gameScreen = document.querySelector(".gameScreen-wrapper");

    function showGameScreen() {
        gameScreen.classList.remove("hidden");
    }

    function hideGameScreen() {
        gameScreen.classList.add("hidden");
    }

    hideGameScreen();

    return { showGameScreen, hideGameScreen };
})();

const game = (() => {
    const gameBoard = GameBoard({ getCurrentPlayer, turnCompleted });
    const displayHeader = document.querySelector(".game-header");
    let players;
    let currentPlayer;

    document.querySelector(".restartBtn").addEventListener("click", startGame);

    function getCurrentPlayer() {
        return currentPlayer;
    }

    function getNextPlayer() {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
        return currentPlayer;
    }

    function turnCompleted() {
        if (isGameOver()) return;

        getNextPlayer().takeTurn(gameBoard);
    }

    function isGameOver() {
        const endState = gameBoard.isClosed();
        if (!endState) return false;

        console.log(endState);

        if (endState.winner !== "") {
            displayHeader.innerHTML = `<section class="winScreen">${currentPlayer.getName()} Wins</section>`;
        } else {
            displayHeader.innerHTML = `<section class="winScreen">It is a Tie</section>`;
        }
        return true;
    }

    function startGame() {
        displayHeader.innerHTML = `
            <section class="scoreBoard">
                <span class="scoreBoard-player1">${players[0].getName()}</span>
                <span>vs</span>
                <span class="scoreBoard-player2">${players[1].getName()}</span>
            </section>
        `;
        gameBoard.init();
        currentPlayer = players[Math.floor(Math.random() * players.length)];
        currentPlayer.takeTurn(gameBoard);
    }

    function init(player1, player2) {
        players = [player1, player2];
        displayController.showGameScreen();
        startGame();
    }

    return { init };
})();

game.init(HumanPlayer(), AIPlayer());
