const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;

    return { getName, getSymbol };
};

const HumanPlayer = (name = "Player One", symbol = "X") => {
    function takeTurn(gameBoard) {
        gameBoard.awaitPlayerInput(this);
    }
    return Object.assign({}, Player(name, symbol), { takeTurn });
};

const AI = (name, maxDepth, symbol) => {
    function getOpponentSymbol() {
        return symbol === "O" ? "X" : "O";
    }

    function getValidMoves(board) {
        return board.reduce(function (previous, current, i) {
            if (current === "") {
                previous.push(i);
            }
            return previous;
        }, []);
    }

    function minimax(gameBoard, moves, isMaximizing = true, depth = 0) {
        const endState = gameBoard.isClosed();

        // terminating cases
        if (depth === maxDepth) return 0;
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

            getValidMoves(board).forEach((move) => {
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

            getValidMoves(board).forEach((move) => {
                board[move] = getOpponentSymbol();
                const bestScore = minimax(gameBoard, moves, true, depth + 1);
                board[move] = "";

                score = Math.min(score, bestScore);
            });
        }

        return depth === 0 ? moves : score;
    }

    function getBestMove(gameBoard) {
        const moves = minimax(gameBoard, []);

        const bestScore = moves.reduce((bestScore, move) => Math.max(move.bestScore, bestScore), -Infinity);

        bestMoveLocations = moves.filter((move) => move.bestScore === bestScore).map((move) => move.location);

        return bestMoveLocations[Math.floor(Math.random() * bestMoveLocations.length)];
    }

    function takeTurn(gameBoard) {
        gameBoard.draw(getBestMove(gameBoard), symbol);
    }
    return Object.assign({}, Player(name, symbol), { getBestMove, takeTurn });
};

const BasicAI = (name = "Basic Bot", maxDepth = 2, symbol = "O") => {
    return Object.assign({}, AI(name, maxDepth, symbol));
};
const ModerateAI = (name = "Medium Bot", maxDepth = 4, symbol = "O") => {
    return Object.assign({}, AI(name, maxDepth, symbol));
};
const AdvancedAI = (name = "Advanced Bot", maxDepth = 8, symbol = "O") => {
    function takeTurn(gameBoard) {
        let bestMove;

        const { getBestMove } = AI(name, maxDepth, symbol);

        // if AI goes first, start on one of the corners of the board
        if (gameBoard.getBoard().every((x) => x === "")) {
            bestMove = [0, 2, 6, 8][Math.floor(Math.random() * 4)];
        } else {
            bestMove = getBestMove(gameBoard);
        }

        gameBoard.draw(bestMove, symbol);
    }
    return Object.assign({}, AI(name, maxDepth, symbol), { takeTurn });
};

const GameBoard = ({ turnCompleted }) => {
    let board;
    let currentPlayer;

    const squares = [...document.querySelectorAll(".gameBoard-square")];
    squares.forEach((square) => {
        square.addEventListener("click", onClick);
    });

    function init() {
        board = ["", "", "", "", "", "", "", "", ""];
        // board = ["O", "X", "O", "X", "", "O", "X", "", ""]; // test board 1
        // board = ["O", "", "X", "", "X", "", "O", "O", "X"]; // test board 2
        // board = ["", "O", "", "X", "", "O", "X", "X", "O"]; // test board 3
        currentPlayer = null;
        display();
    }

    function display() {
        squares.forEach((square, i) => {
            square.textContent = board[i];
        });
    }

    function getVacantSquares() {
        return squares.filter((square) => square.textContent === "");
    }

    function getBoard() {
        return board;
    }

    function awaitPlayerInput(player) {
        currentPlayer = player;
        getVacantSquares().forEach((square) => {
            square.addEventListener("click", onClick);
        });
    }
    function rejectPlayerInput() {
        currentPlayer = null;
        getVacantSquares().forEach((square) => {
            square.removeEventListener("click", onClick);
        });
    }

    function onClick() {
        if (currentPlayer === null) return;

        draw(parseInt(this.dataset.id), currentPlayer.getSymbol());
    }

    function draw(location, symbol) {
        rejectPlayerInput();

        board[location] = symbol;
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
        if (board.every((x) => x !== "")) {
            return { winner: "", winningSquares: [] };
        }

        return false;
    }

    init();

    return { init, getBoard, awaitPlayerInput, draw, isClosed };
};

const game = (() => {
    let gameBoard = GameBoard({ turnCompleted });
    let currentPlayerIndex;
    let players;
    const displayHeader = document.querySelector(".game-header");
    document.querySelector(".restartBtn").addEventListener("click", restart);

    function getCurrentPlayer() {
        return players[currentPlayerIndex % 2];
    }

    function turnCompleted() {
        if (isGameOver()) return;

        currentPlayerIndex++;
        getCurrentPlayer().takeTurn(gameBoard);
    }

    function isGameOver() {
        const endState = gameBoard.isClosed();
        if (!endState) return false;

        console.log(endState);

        if (endState.winner !== "") {
            displayHeader.innerHTML = `<section class="winScreen">${getCurrentPlayer().getName()} Wins</section>`;
        } else {
            displayHeader.innerHTML = `<section class="winScreen">It is a Tie</section>`;
        }
        return true;
    }

    function restart() {
        displayHeader.innerHTML = `
            <section class="scoreBoard">
                <span class="scoreBoard-player1">${players[0].getName()}</span>
                <span>vs</span>
                <span class="scoreBoard-player2">${players[1].getName()}</span>
            </section>
        `;
        gameBoard.init();
        currentPlayerIndex = Math.floor(Math.random() * 2);
        getCurrentPlayer().takeTurn(gameBoard);
    }

    function init(player1, player2) {
        players = [player1, player2];
        restart();
    }

    return { init };
})();

game.init(HumanPlayer(), AdvancedAI());
