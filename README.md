Minesweeper2
============


Installing / Basic usage
------------------------

Clone the repository:

    git clone https://github.com/riskawarrior/minesweeper2.git

Include Minesweeper2 in your webpage:

    <!-- Don't forget to include jQuery! -->
    <script type="text/javascript" src="minesweeper.js"></script>

Initialize the game:

    <script type="text/javascript">
        minesweeper.init('#game'); // selector in which the game will be generated
    </script>

Start a new game:

    <script type="text/javascript">
        minesweeper.newGame(10, 10, 10); // columns, rows, mines
    </script>

Have fun!


Installing via Bower
--------------------

    bower install minesweeper2 --save


API
---

### Initializing on a container

    minesweeper.init('selector');

### Setting the flag/mine/empty/unknown icons

    minesweeper.setHtmls({
        empty: '&nbsp;',
        mine: 'X',
        flag: '!',
        unknown: '?'
    });

### Setting the callback function for winning/losing

    minesweeper.setWinHandler(function () {
        alert('You won, YaaaY!');
    });
    minesweeper.setLoseHandler(function () {
        alert('Bad luck');
    });

### Starting a new game

    minesweeper.newGame(10, 10, 10); // columns, rows, mines


License
-------

*MIT*
