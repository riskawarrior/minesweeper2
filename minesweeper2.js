"use strict";

class Minesweeper2 {
    constructor(selector) {
        this.board = null;
        this.columns = 0;
        this.rows = 0;
        this.mines = 0;
        this.revealed = 0;
        this.gameOngoing = false;
        this.winHandler = () => {
        };
        this.loseHandler = () => {
        };

        this.htmls = {
            empty: '&nbsp;',
            mine: 'X',
            flag: '!',
            unknown: '?'
        };

        this.$container = jQuery(selector);
        this.attachEventHandlers();
    }

    attachEventHandlers() {
        this.$container
            .empty()
            .on('click', 'td', this.showMineHandler(this))
            .on('contextmenu', 'td', this.flagHandler(this));
    }

    newGame(columns, rows, mines) {
        if (columns < 5 || rows < 5 || mines < 1 || mines >= (columns * rows) / 2) {
            throw new Error('Invalid table size or mine number!');
        }

        this.columns = Number(columns);
        this.rows = Number(rows);
        this.mines = Number(mines);
        this.revealed = 0;
        this.eraseBoard();
        this.spreadMines(mines);
        this.drawTable();
        this.gameOngoing = true;
    }

    setWinHandler(fn) {
        this.winHandler = fn;
    }

    setLoseHandler(fn) {
        this.loseHandler = fn;
    }

    setHtmls(settings) {
        this.htmls = settings;
    }

    eraseBoard() {
        this.board = [];
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.columns; j++) {
                this.board[i][j] = {
                    mine: false,
                    minesAround: 0,
                    revealed: false,
                    flag: 0
                };
            }
        }
    }

    spreadMines(mines) {
        for (let i = 0; i < mines; i++) {
            this.putMineSomewhere();
        }
    }

    putMineSomewhere() {
        do {
            let i = Math.floor(Math.random() * this.rows);
            let j = Math.floor(Math.random() * this.columns);

            if (!this.board[i][j].mine) {
                this.board[i][j].mine = true;
                this.modifyNeighboursMineNumber(i, j);
                break;
            }
        } while (1);
    }

    modifyNeighboursMineNumber(row, column, increaseBy = 1) {
        for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); i++) {
            for (let j = Math.max(column - 1, 0); j <= Math.min(column + 1, this.columns - 1); j++) {
                if (i != row || j != column) {
                    this.board[i][j].minesAround += increaseBy;
                }
            }
        }
    }

    drawTable() {
        let $table = jQuery('<table/>').addClass('minesweeper2');
        let $body = jQuery('<tbody/>').appendTo($table);

        for (let i = 0; i < this.rows; i++) {
            let $row = jQuery('<tr/>');
            for (let j = 0; j < this.columns; j++) {
                $row.append(jQuery('<td/>').html(this.htmls.empty));
            }
            $body.append($row);
        }

        this.$container.empty().append($table);
    }

    getCellPosition($cell) {
        return {
            column: $cell.index(),
            row: $cell.parent().index()
        };
    }

    showMineHandler(ms) {
        return function () {
            let pos = ms.getCellPosition(jQuery(this));

            if (!ms.gameOngoing) {
                return;
            }

            ms.revealCell(pos.row, pos.column, true);
        };
    }

    flagHandler(ms) {
        return function (e) {
            let pos = ms.getCellPosition(jQuery(this));
            let cell = ms.board[pos.row][pos.column];

            e.preventDefault();

            if (!ms.gameOngoing || cell.revealed) {
                return;
            }

            cell.flag = (cell.flag + 1) % 3;
            ms.refreshCell(pos.row, pos.column);
        };
    }

    refreshCell(row, column) {
        let $cell = this.$container.find('tr:eq(' + row + ') > td:eq(' + column + ')');
        let cell = this.board[row][column];

        $cell.html(this.htmls.empty);
        if (cell.revealed) {
            if (cell.mine) {
                $cell.html(this.htmls.mine);
                return;
            }

            $cell.html(cell.minesAround);
        }

        if (cell.flag == 1) {
            $cell.html(this.htmls.flag);
        }
        if (cell.flag == 2) {
            $cell.html(this.htmls.unknown);
        }
    }

    mines3x3(row, column, evalFn = cell => cell.mine) {
        let count = 0;
        for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); i++) {
            for (let j = Math.max(column - 1, 0); j <= Math.min(column + 1, this.columns - 1); j++) {
                if (this.board[i][j] && evalFn(this.board[i][j])) {
                    count += 1;
                }
            }
        }

        return count;
    }

    flagsAround(row, column) {
        return this.mines3x3(row, column, function (cell) {
            return cell.flag == 1;
        });
    }

    revealCell(row, column, forced) {
        if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
            return;
        }

        let cell = this.board[row][column];

        if (cell.flag != 0) {
            return;
        }

        if (cell.revealed) {
            if (forced && this.flagsAround(row, column) == cell.minesAround) {
                this.revealNeighbours(row, column);
            }
            return;
        }

        cell.revealed = true;
        this.revealed += 1;
        this.refreshCell(row, column);

        if (!cell.minesAround) {
            this.revealNeighbours(row, column);
        }

        if (cell.mine) {
            if (this.revealed == 1) {
                this.resetMine(row, column);
                return;
            }

            this.lose();
        }

        if (this.isGameWon()) {
            this.win();
        }
    }

    revealNeighbours(row, column) {
        for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); i++) {
            for (let j = Math.max(column - 1, 0); j <= Math.min(column + 1, this.columns - 1); j++) {
                if (i != row || j != column) {
                    this.revealCell(i, j);
                }
            }
        }
    }

    resetMine(row, column) {
        let cell = this.board[row][column];

        this.putMineSomewhere();
        this.modifyNeighboursMineNumber(row, column, -1);
        cell.minesAround = this.mines3x3(row, column);
        cell.mine = false;
        this.refreshCell(row, column);
    }

    isGameWon() {
        console.log(this.rows * this.columns, this.mines + this.revealed);
        return this.rows * this.columns == this.mines + this.revealed;
    }

    lose() {
        this.gameOngoing = false;
        if (this.loseHandler) {
            this.loseHandler();
        }
    }

    win() {
        this.gameOngoing = false;
        if (this.winHandler) {
            this.winHandler();
        }
    }
}
