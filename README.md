Minesweeper2
============


Installing / Basic usage
------------------------

Clone the repository:

    git clone https://github.com/riskawarrior/minesweeper2.git

Include Minesweeper2 in your webpage:

    <!-- Don't forget to include jQuery! -->
    <script type="text/javascript" src="dist/minesweeper2.min.js"></script>

Initialize the game:

    <script type="text/javascript">
        var game = new Minesweeper2('#game'); // selector in which the game will be generated
    </script>

Start a new game:

    <script type="text/javascript">
        game.newGame(10, 10, 10); // columns, rows, mines
    </script>

Have fun!

### Keys

* Left click: show cell
* Right click: mark as mine/unkown


Skins
-----

### Bootstrap skin

1. Include Bootstrap
2. Include Minesweeper2 Bootstrap skin

    <link rel="stylesheet" href="skins/bootstrap/bootstrap.css"/>

3. Instantiate a Bootstrap skinned game

    var game = new BootstrapMinesweeper2('#game');


Installing via Bower
--------------------

    bower install minesweeper2 --save


API
---

### Initializing on a container / creating a new instance

    var game = new Minesweeper2('#game');

### Setting the flag/mine/empty/unknown icons

    game.setHtmls({
        empty: '&nbsp;',
        mine: 'X',
        flag: '!',
        unknown: '?'
    });

### Setting the callback function for winning/losing

    game.setWinHandler(function () {
        alert('You won, YaaaY!');
    });
    game.setLoseHandler(function () {
        alert('Bad luck');
    });

### Starting a new game

    game.newGame(10, 10, 10); // columns, rows, mines


Development
-----------

For development, you'll need jQuery and Babel:

    bower install
    npm install

Before commit, please don't forget to re-generate the dist files:

    npm run build


License
-------

*MIT*
