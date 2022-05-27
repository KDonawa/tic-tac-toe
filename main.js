const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;

    return { getName, getSymbol };
};

const AIPlayer = (name, symbol) => {
    function takeTurn(gameBoard) {
        const remainingSquares = gameBoard.getRemainingSquares();
        const location = remainingSquares[Math.floor(Math.random() * remainingSquares.length)];
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
        board = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
        ];
        currentPlayer = null;
        display();
    }

    function awaitPlayerInput(player) {
        currentPlayer = player;
        getRemainingSquares().forEach((square) => {
            square.addEventListener("click", onClick);
        });
    }
    function rejectPlayerInput() {
        currentPlayer = null;
        getRemainingSquares().forEach((square) => {
            square.removeEventListener("click", onClick);
        });
    }

    function display() {
        squares.forEach((square, index) => {
            square.textContent = board[parseInt(index / 3)][index % 3];
        });
    }

    function onClick() {
        if (currentPlayer === null) return;

        draw(this, currentPlayer.getSymbol());
    }

    function getRemainingSquares() {
        return squares.filter((square) => square.textContent === "");
    }

    function draw(location, value) {
        rejectPlayerInput();

        const index = parseInt(location.dataset.id);
        board[parseInt(index / 3)][index % 3] = value;

        display();
        turnCompleted();
    }

    function hasWinner() {
        for (let i = 0; i < 3; i++) {
            // check for win along rows
            if (board[i][0] == board[i][1] && board[i][1] == board[i][2] && board[i][2] != "") {
                return true;
            }
            // check for win along columns
            if (board[0][i] == board[1][i] && board[1][i] == board[2][i] && board[2][i] != "") {
                return true;
            }
        }

        // check for win along diagonals
        if (board[0][0] == board[1][1] && board[1][1] == board[2][2] && board[2][2] != "") {
            return true;
        }
        if (board[0][2] == board[1][1] && board[1][1] == board[2][0] && board[2][0] != "") {
            return true;
        }

        return false;
    }

    init();

    return { init, awaitPlayerInput, draw, getRemainingSquares, hasWinner };
};

const game = (() => {
    let gameBoard;
    let currentPlayerIndex;
    let players;

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
            console.log(`${getCurrentPlayer().getSymbol()} has won!`);
            return true;
        }
        if (gameBoard.getRemainingSquares().length === 0) {
            console.log("It's a tie!");
            return true;
        }

        return false;
    }

    function init(player1, player2) {
        gameBoard = GameBoard({ turnCompleted });
        players = [player1, player2];
        currentPlayerIndex = Math.floor(Math.random() * 2);

        getCurrentPlayer().takeTurn(gameBoard);
    }

    return { init };
})();

game.init(HumanPlayer("Player 1", "X"), AIPlayer("Player 2", "O"));
