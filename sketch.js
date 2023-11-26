// Basic p5.js representation of an evolutionary game theory graph

var topPoint;
var leftPoint;
var rightPoint;
var sideLength = 500;
var numPlayers = 1000;
var players = [];

class Strategy {
    constructor(name, color, stratCallBack) {
        this.name = name;
        this.color = color;
        this.stratCallBack = stratCallBack;
    }
}

class Player {
    constructor(strategy) {
        this.strategy = strategy;
        this.points = 0;
    }
}

/**
 * If the total of the two strategies is less than or equal to 1,
 * the players get the points of their strategies. Otherwise, they
 * get 0 points.
 * @changes the player1.points, player2.points
 */
function divideTheCake(player1, player2) {
    let player1Points = player1.strategy.stratCallBack();
    let player2Points = player2.strategy.stratCallBack();
    let total = player1Points + player2Points;
    if (total <= 1.00) {
        player1.points += player1Points;
        player2.points += player2Points;
    }

    // console.log(`Player 1 using ${player1.strategy.name} got ${player1Points} points`);
    // console.log(`Player 2 using ${player2.strategy.name} got ${player2Points} points`);
    // console.log(`Total: ${total}`);
}

/**
 * Draws a point on the triangle based on the baricentric coordinates provided
 */
function plotPoint(a, b, c) {
    let x = a * topPoint.x + b * leftPoint.x + c * rightPoint.x;
    let y = a * topPoint.y + b * leftPoint.y + c * rightPoint.y;
    fill("#2a9d8f")
    stroke("#2a9d8f");
    ellipse(x, y, 10, 10);
    
    
    // Draw the line from the last point to the current point
    if (window.lastPoint != undefined) {
        stroke("#2a9d8f");
        strokeWeight(2);
        line(window.lastPoint.x, window.lastPoint.y, x, y);
    }
    window.lastPoint = createVector(x, y);
}

/**
 * Draw a point on the triangle based on the number of players of each strategy
 */
function plotPointFromPlayers() {
    let numModest = 0;
    let numFair = 0;
    let numGreedy = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].strategy.name == "Modest") {
            numModest++;
        } else if (players[i].strategy.name == "Fair") {
            numFair++;
        } else {
            numGreedy++;
        }
    }
    let a = numFair / players.length;
    let b = numModest / players.length;
    let c = numGreedy / players.length;
    plotPoint(a, b, c);
}

/**
 * Simulates a single generation of a game. The top 50% of players
 * are selected to reproduce. The bottom 50% are removed from the
 * game.
 * @param {function(Player, Player)} game the game to be simulated
 */
function simulateGame(game) {
    // Shuffle the players
    players = shuffle(players);

    // Play the game, match players in order
    for (let i = 0; i < players.length; i += 2) {
        if (i + 1 >= players.length) {
            break;
        }
        game(players[i], players[i + 1]);
    }

    // Sort the players by points
    players.sort((a, b) => a.points - b.points);

    // Remove the bottom 50% of players
    players = players.slice(players.length / 2);
    console.log(players.map(player => `${player.strategy.name}` + ": " + player.points));
    
    // Reproduce the top 50% of players
    let newPlayers = [];
    for (let i = 0; i < players.length; i++) {
        players[i].points = 0;
        newPlayers.push(players[i]);
        newPlayers.push(new Player(players[i].strategy));
    }
    players = newPlayers;
    


}

/**
 * This function runs once at the beginning of the program
 */
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(5);
    // Calculate the height of the triangle
    let triangleHeight = sideLength * sqrt(3) / 2;

    // Calculate and draw the three points of the triangle
    topPoint = createVector(windowWidth / 2, windowHeight / 2 - triangleHeight / 2);
    leftPoint = createVector(windowWidth / 2 - sideLength / 2, windowHeight / 2 + triangleHeight / 2);
    rightPoint = createVector(windowWidth / 2 + sideLength / 2, windowHeight / 2 + triangleHeight / 2);

    // Define the strategies
    let modest = new Strategy("Modest", color("#e9c46a"), () => 1 / 3);
    let fair = new Strategy("Fair", color("#f4a261"), () => 1 / 2);
    let greedy = new Strategy("Greedy", color("#e76f51"), () => 2 / 3);
    let strategies = [modest, fair, greedy];

    // Define the players
    let strategyRatio = [0.05, 0.05, 0.9];
    for (let i = 0; i < numPlayers; i++) {
        if (i < numPlayers * strategyRatio[0]) {
            players.push(new Player(strategies[0]));
        } else if (i < numPlayers * (strategyRatio[0] + strategyRatio[1])) {
            players.push(new Player(strategies[1]));
        } else {
            players.push(new Player(strategies[2]));
        }
    }

    background("#264653");
    fill("#fdf0d5");
    triangle(topPoint.x, topPoint.y, leftPoint.x, leftPoint.y, rightPoint.x, rightPoint.y);
    plotPointFromPlayers();


}

/**
 * This function runs every frame
 */
function draw() {
    simulateGame(divideTheCake);
    plotPointFromPlayers();
}