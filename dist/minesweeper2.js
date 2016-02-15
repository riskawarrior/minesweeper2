"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Minesweeper2 = function () {
    function Minesweeper2(selector) {
        _classCallCheck(this, Minesweeper2);

        this.board = null;
        this.columns = 0;
        this.rows = 0;
        this.mines = 0;
        this.revealed = 0;
        this.gameOngoing = false;
        this.winHandler = function () {};
        this.loseHandler = function () {};

        this.htmls = {
            empty: '&nbsp;',
            mine: 'X',
            flag: '!',
            unknown: '?'
        };

        this.$container = jQuery(selector);
        this.attachEventHandlers();
    }

    _createClass(Minesweeper2, [{
        key: 'attachEventHandlers',
        value: function attachEventHandlers() {
            this.$container.empty().on('click', 'td', this.showMineHandler(this)).on('contextmenu', 'td', this.flagHandler(this));
        }
    }, {
        key: 'newGame',
        value: function newGame(columns, rows, mines) {
            if (columns < 5 || rows < 5 || mines < 1 || mines >= columns * rows / 2) {
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
            for (var i = 0; i < mines; i++) {
                this.putMineSomewhere();
            }
        }
    }, {
        key: 'putMineSomewhere',
        value: function putMineSomewhere() {
            do {
                var i = Math.floor(Math.random() * this.rows);
                var j = Math.floor(Math.random() * this.columns);

                if (!this.board[i][j].mine) {
                    this.board[i][j].mine = true;
                    this.modifyNeighboursMineNumber(i, j);
                    break;
                }
            } while (1);
        }
    }, {
        key: 'modifyNeighboursMineNumber',
        value: function modifyNeighboursMineNumber(row, column) {
            var increaseBy = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

            for (var i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.rows - 1); i++) {
                for (var j = Math.max(column - 1, 0); j <= Math.min(column + 1, this.columns - 1); j++) {
                    if (i != row || j != column) {
                        this.board[i][j].minesAround += increaseBy;
                    }
                }
            }
        }
    }, {
        key: 'drawTable',
        value: function drawTable() {
            var $table = jQuery('<table/>').addClass('minesweeper2');
            var $body = jQuery('<tbody/>').appendTo($table);

            for (var i = 0; i < this.rows; i++) {
                var $row = jQuery('<tr/>');
                for (var j = 0; j < this.columns; j++) {
                    $row.append(jQuery('<td/>').html(this.htmls.empty));
                }
                $body.append($row);
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
            var $cell = this.$container.find('tr:eq(' + row + ') > td:eq(' + column + ')');
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
        value: function mines3x3(row, column) {
            var evalFn = arguments.length <= 2 || arguments[2] === undefined ? function (cell) {
                return cell.mine;
            } : arguments[2];

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
        key: 'resetMine',
        value: function resetMine(row, column) {
            var cell = this.board[row][column];

            this.putMineSomewhere();
            this.modifyNeighboursMineNumber(row, column, -1);
            cell.minesAround = this.mines3x3(row, column);
            cell.mine = false;
            this.refreshCell(row, column);
        }
    }, {
        key: 'isGameWon',
        value: function isGameWon() {
            console.log(this.rows * this.columns, this.mines + this.revealed);
            return this.rows * this.columns == this.mines + this.revealed;
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
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BootstrapMinesweeper2 = function (_Minesweeper) {
    _inherits(BootstrapMinesweeper2, _Minesweeper);

    function BootstrapMinesweeper2(selector) {
        _classCallCheck(this, BootstrapMinesweeper2);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BootstrapMinesweeper2).call(this, selector));

        _this.htmls = {
            empty: '&nbsp;',
            mine: '<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span>',
            flag: '<span class="glyphicon glyphicon-flag" aria-hidden="true"></span>',
            unknown: '<span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>'
        };
        return _this;
    }

    _createClass(BootstrapMinesweeper2, [{
        key: 'drawTable',
        value: function drawTable() {
            _get(Object.getPrototypeOf(BootstrapMinesweeper2.prototype), 'drawTable', this).call(this);

            this.$container.children().addClass('table-bordered table text-center');
        }
    }]);

    return BootstrapMinesweeper2;
}(Minesweeper2);
