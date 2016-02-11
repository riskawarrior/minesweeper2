var minesweeper = (function ($) {
    var $container,
        board,
        columns = 0,
        rows = 0,
        gameOngoing = false,

        winHandler,
        loseHandler,

        htmls = {
            empty: '&nbsp;',
            mine: 'X',
            flag: '!',
            unknown: '?'
        },

        newGame = function (_columns, _rows, mines) {
            if (_columns < 5 || _rows < 5 || mines < 1 || mines >= (_columns * _rows) / 2 || !$container) {
                return;
            }

            columns = _columns;
            rows = _rows;
            eraseBoard();
            spreadMines(mines);
            calculateMinesAround();
            drawTable();
            gameOngoing = true;
        },
        init = function (selector) {
            $container = $(selector);
            $container.empty();
            $container.on('click', 'td', showMineHandler);
            $container.on('contextmenu', 'td', flagHandler);
        },
        setWinHandler = function (fn) {
            winHandler = fn;
        },
        setLoseHandler = function (fn) {
            loseHandler = fn;
        },
        setHtmls = function (settings) {
            htmls = settings;
        },
        eraseBoard = function () {
            var i, j;

            board = [];
            for (i = 0; i < rows; i++) {
                board[i] = [];
                for (j = 0; j < columns; j++) {
                    board[i][j] = {
                        mine: false,
                        minesAround: 0,
                        revealed: false,
                        flag: 0
                    };
                }
            }
        },
        spreadMines = function (mines) {
            var i, j;

            while (mines != 0) {
                i = Math.floor(Math.random() * rows);
                j = Math.floor(Math.random() * columns);

                if (!board[i][j].mine) {
                    board[i][j].mine = true;
                    mines -= 1;
                }
            }
        },
        calculateMinesAround = function () {
            var i, j;

            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    board[i][j].minesAround = mines3x3(i, j);
                }
            }
        },
        drawTable = function () {
            var $table = $('<table/>'),
                $row,
                i, j;

            for (i = 0; i < rows; i++) {
                $row = $('<tr/>');
                for (j = 0; j < columns; j++) {
                    $row.append($('<td/>').html(htmls.empty));
                }
                $table.append($row);
            }

            $container.empty().append($table);
        },
        showMineHandler = function () {
            var pos = getCellPosition($(this));

            if (!gameOngoing) {
                return;
            }

            revealCell(pos.row, pos.column, true);
        },
        flagHandler = function (e) {
            var pos = getCellPosition($(this)),
                cell = board[pos.row][pos.column];

            e.preventDefault();

            if (!gameOngoing || cell.revealed) {
                return;
            }

            cell.flag = (cell.flag + 1) % 3;
            refreshCell(pos.row, pos.column);
        },
        getCellPosition = function ($cell) {
            return {
                column: $cell.index(),
                row: $cell.parent().index()
            };
        },
        refreshCell = function (row, column) {
            var $cell = $container.find('tr:eq(' + row + ') td:eq(' + column + ')'),
                cell = board[row][column];

            $cell.html(htmls.empty);
            if (cell.revealed) {
                if (cell.mine) {
                    $cell.html(htmls.mine);
                    return;
                }

                $cell.html(cell.minesAround);
            }

            if (cell.flag == 1) {
                $cell.html(htmls.flag);
            }
            if (cell.flag == 2) {
                $cell.html(htmls.unknown);
            }
        },
        mines3x3 = function (row, column, evalFn) {
            var i, j, count = 0;

            if (!evalFn) {
                evalFn = function (cell) {
                    return cell.mine;
                }
            }

            for (i = Math.max(row - 1, 0); i <= Math.min(row + 1, rows - 1); i++) {
                for (j = Math.max(column - 1, 0); j <= Math.min(column + 1, columns - 1); j++) {
                    if (board[i][j] && evalFn(board[i][j])) {
                        count += 1;
                    }
                }
            }

            return count;
        },
        flagsAround = function (row, column) {
            return mines3x3(row, column, function (cell) {
                return cell.flag == 1;
            });
        },
        revealCell = function (row, column, forced) {
            var cell;

            if (row < 0 || row >= rows || column < 0 || column >= columns) {
                return;
            }

            cell = board[row][column];

            if (cell.flag != 0) {
                return;
            }

            if (cell.revealed) {
                if (forced && flagsAround(row, column) == cell.minesAround) {
                    revealNeighbours(row, column);
                }
                return;
            }

            cell.revealed = true;
            refreshCell(row, column);

            if (!cell.minesAround) {
                revealNeighbours(row, column);
            }

            if (cell.mine) {
                lose();
            }

            if (isGameWon()) {
                win();
            }
        },
        revealNeighbours = function (row, column) {
            var i, j;

            for (i = Math.max(row - 1, 0); i <= Math.min(row + 1, rows - 1); i++) {
                for (j = Math.max(column - 1, 0); j <= Math.min(column + 1, columns - 1); j++) {
                    if (i != row || j != column) {
                        revealCell(i, j);
                    }
                }
            }
        },
        isGameWon = function () {
            var i, j;

            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    if (!board[i][j].mine && !board[i][j].revealed) {
                        return false;
                    }
                }
            }

            return true;
        },
        lose = function () {
            gameOngoing = false;
            if (loseHandler) {
                loseHandler();
            }
        },
        win = function () {
            gameOngoing = false;
            if (winHandler) {
                winHandler();
            }
        };

    return {
        init: init,
        newGame: newGame,
        setWinHandler: setWinHandler,
        setLoseHandler: setLoseHandler,
        setHtmls: setHtmls
    };
}(jQuery));
