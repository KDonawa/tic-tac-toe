const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;

    return { getName, getSymbol };
};

const AIPlayer = (name, symbol) => {
    function takeTurn(gameBoard) {
        const vacantSquares = gameBoard.getVacantSquares();
        const location = vacantSquares[Math.floor(Math.random() * vacantSquares.length)];
        gameBoard.draw(location, symbol);
    }
    return Object.assign({}, Player(name, symbol), { takeTurn });
};

const HumanPlayer = (name, symbol) => {
    function takeTurn(gameBoard) {
        gameBoard.awaitPlayerInput(this);
    }
    return Object.assign({}, Player(name, symbol), { takeTurn });
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

        draw(this, currentPlayer.getSymbol());
    }

    function draw(location, symbol) {
        rejectPlayerInput();

        board[parseInt(location.dataset.id)] = symbol;
        display();
        turnCompleted();
    }

    function hasWinner() {
        for (let i = 0; i < 3; i++) {
            // check for win along rows
            if (board[3 * i] !== "" && board[3 * i] === board[3 * i + 1] && board[3 * i + 1] === board[3 * i + 2]) {
                return true;
            }
            // check for win along columns
            if (board[i] !== "" && board[i] === board[i + 3] && board[i + 3] === board[i + 6]) {
                return true;
            }
        }

        // check for win along diagonals
        if (board[0] !== "" && board[0] === board[4] && board[4] === board[8]) {
            return true;
        }
        if (board[2] !== "" && board[2] === board[4] && board[4] === board[6]) {
            return true;
        }

        return false;
    }

    init();

    return { init, getBoard, getVacantSquares, awaitPlayerInput, draw, hasWinner };
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
        if (gameBoard.hasWinner()) {
            displayHeader.innerHTML = `<section class="winScreen">${getCurrentPlayer().getName()} Wins</section>`;
            return true;
        }
        if (gameBoard.getVacantSquares().length === 0) {
            displayHeader.innerHTML = `<section class="winScreen">It is a Tie</section>`;
            return true;
        }

        return false;
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

game.init(HumanPlayer("Player One", "X"), AIPlayer("Bot Lvl One", "O"));
