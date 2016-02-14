"use strict";

class BootstrapMinesweeper2 extends Minesweeper2 {

    constructor(selector) {
        super(selector);

        this.htmls = {
            empty: '&nbsp;',
            mine: '<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span>',
            flag: '<span class="glyphicon glyphicon-flag" aria-hidden="true"></span>',
            unknown: '<span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>'
        };
    }

    drawTable() {
        super.drawTable();

        this.$container.children().addClass('table-bordered table text-center');
    }
}
