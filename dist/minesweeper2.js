"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Minesweeper2 = function () {
    function Minesweeper2(selector) {
        _classCallCheck(this, Minesweeper2);

        this.board = null;
        this.columns = 0;
        this.rows = 0;
        this.gameOngoing = false;
        this.winHandler = function () {};
        this.loseHandler = function () {};

        this.htmls = {
            empty: '&nbsp;',
            mine: 'X',
            flag: '!',
            unknown: '?'
        };

        this.$container = jQuery('<div/>');

        this.$container = jQuery(selector).empty().on('click', 'td', this.showMineHandler(this)).on('contextmenu', 'td', this.flagHandler(this));
    }

    _createClass(Minesweeper2, [{
        key: 'newGame',
        value: function newGame(columns, rows, mines) {
            if (columns < 5 || rows < 5 || mines < 1 || mines >= columns * rows / 2) {
                return;
            }

            this.columns = columns;
            this.rows = rows;
            this.eraseBoard();
            this.spreadMines(mines);
            this.calculateMinesAround();
            this.drawTable();
            this.gameOngoing = true;
        }
    }, {
        key: 'setWinHandler',
        value: function setWinHandler(fn) {
            this.winHandler = fn;
        }
    }, {
        key: 'setLoseHandler',
        value: function setLoseHandler(fn) {
            this.loseHandler = fn;
        }
    }, {
        key: 'setHtmls',
        value: function setHtmls(settings) {
            this.htmls = settings;
        }
    }, {
        key: 'eraseBoard',
        value: function eraseBoard() {
            this.board = [];
            for (var i = 0; i < this.rows; i++) {
                this.board[i] = [];
                for (var j = 0; j < this.columns; j++) {
                    this.board[i][j] = {
                        mine: false,
                        minesAround: 0,
                        revealed: false,
                        flag: 0
                    };
                }
            }
        }
    }, {
        key: 'spreadMines',
        value: function spreadMines(mines) {
            while (mines != 0) {
                var i = Math.floor(Math.random() * this.rows);
                var j = Math.floor(Math.random() * this.columns);

                if (!this.board[i][j].mine) {
                    this.board[i][j].mine = true;
                    mines -= 1;
                }
            }
        }
    }, {
        key: 'calculateMinesAround',
        value: function calculateMinesAround() {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    this.board[i][j].minesAround = this.mines3x3(i, j);
                }
            }
        }
    }, {
        key: 'drawTable',
        value: function drawTable() {
            var $table = jQuery('<table/>');

            for (var i = 0; i < this.rows; i++) {
                var $row = jQuery('<tr/>');
                for (var j = 0; j < this.columns; j++) {
                    $row.append(jQuery('<td/>').html(this.htmls.empty));
                }
                $table.append($row);
            }

            this.$container.empty().append($table);
        }
    }, {
        key: 'getCellPosition',
        value: function getCellPosition($cell) {
            return {
                column: $cell.index(),
                row: $cell.parent().index()
            };
        }
    }, {
        key: 'showMineHandler',
        value: function showMineHandler(ms) {
            return function () {
                var pos = ms.getCellPosition(jQuery(this));

                if (!ms.gameOngoing) {
                    return;
                }

                ms.revealCell(pos.row, pos.column, true);
            };
        }
    }, {
        key: 'flagHandler',
        value: function flagHandler(ms) {
            return function (e) {
                var pos = ms.getCellPosition(jQuery(this));
                var cell = ms.board[pos.row][pos.column];

                e.preventDefault();

                if (!ms.gameOngoing || cell.revealed) {
                    return;
                }

                cell.flag = (cell.flag + 1) % 3;
                ms.refreshCell(pos.row, pos.column);
            };
        }
    }, {
        key: 'refreshCell',
        value: function refreshCell(row, column) {
            var $cell = this.$container.find('tr:eq(' + row + ') td:eq(' + column + ')');
            var cell = this.board[row][column];

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
    }, {
        key: 'mines3x3',
        value: function mines3x3(row, column, evalFn) {
            if (!evalFn) {
                evalFn = function evalFn(cell) {
                    return cell.mine;
                };
            }

            var count = 0;
            for (var i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); i++) {
                for (var j = Math.max(column - 1, 0); j <= Math.min(column + 1, this.columns - 1); j++) {
                    if (this.board[i][j] && evalFn(this.board[i][j])) {
                        count += 1;
                    }
                }
            }

            return count;
        }
    }, {
        key: 'flagsAround',
        value: function flagsAround(row, column) {
            return this.mines3x3(row, column, function (cell) {
                return cell.flag == 1;
            });
        }
    }, {
        key: 'revealCell',
        value: function revealCell(row, column, forced) {
            if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
                return;
            }

            var cell = this.board[row][column];

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
            this.refreshCell(row, column);

            if (!cell.minesAround) {
                this.revealNeighbours(row, column);
            }

            if (cell.mine) {
                this.lose();
            }

            if (this.isGameWon()) {
                this.win();
            }
        }
    }, {
        key: 'revealNeighbours',
        value: function revealNeighbours(row, column) {
            for (var i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); i++) {
                for (var j = Math.max(column - 1, 0); j <= Math.min(column + 1, this.columns - 1); j++) {
                    if (i != row || j != column) {
                        this.revealCell(i, j);
                    }
                }
            }
        }
    }, {
        key: 'isGameWon',
        value: function isGameWon() {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.columns; j++) {
                    if (!this.board[i][j].mine && !this.board[i][j].revealed) {
                        return false;
                    }
                }
            }

            return true;
        }
    }, {
        key: 'lose',
        value: function lose() {
            this.gameOngoing = false;
            if (this.loseHandler) {
                this.loseHandler();
            }
        }
    }, {
        key: 'win',
        value: function win() {
            this.gameOngoing = false;
            if (this.winHandler) {
                this.winHandler();
            }
        }
    }]);

    return Minesweeper2;
}();
