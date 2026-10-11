// ======================================================
// MAZE GAME
// ROUTE FINDING USING BEST FIRST SEARCH
// ======================================================


// ======================================================
// MAZE SETTINGS
// ======================================================

const ROWS = 21;
const COLS = 21;

const start = [1, 1];
const goal = [ROWS - 2, COLS - 2];


// ======================================================
// GAME VARIABLES
// ======================================================

let maze = [];

let player = [...start];

let moves = 0;

let seconds = 0;

let gameFinished = false;

let gameStarted = false;

let timerInterval = null;


// AI variables

let aiPath = [];

let exploredCells = [];


// ======================================================
// GENERATE MAZE
// ======================================================

function generateMaze() {

    // Create complete wall maze

    maze = Array.from(
        { length: ROWS },
        () => Array(COLS).fill(1)
    );


    // Create paths

    carveMaze(1, 1);


    // Make sure start is open

    maze[1][1] = 0;


    // Make sure goal is open

    maze[ROWS - 2][COLS - 2] = 0;


    // Reset player

    player = [...start];


    // Reset game information

    moves = 0;

    seconds = 0;

    gameFinished = false;

    gameStarted = false;


    // Clear AI information

    aiPath = [];

    exploredCells = [];


    // Stop timer

    stopTimer();


    // Update screen

    document.getElementById("status").textContent =
        "Playing";


    document.getElementById("pathLength").textContent =
        "-";


    document.getElementById("message").innerHTML =
        "Find your way from <strong>START</strong> to <strong>GOAL</strong>!";


    updateInfo();

    drawMaze();
}


// ======================================================
// CREATE MAZE PATH
// ======================================================

function carveMaze(row, col) {

    maze[row][col] = 0;


    const directions = [

        [-2, 0],

        [2, 0],

        [0, -2],

        [0, 2]

    ];


    shuffle(directions);


    for (const [dr, dc] of directions) {

        const newRow = row + dr;

        const newCol = col + dc;


        if (

            newRow > 0 &&

            newRow < ROWS - 1 &&

            newCol > 0 &&

            newCol < COLS - 1 &&

            maze[newRow][newCol] === 1

        ) {

            // Open wall between cells

            maze[
                row + dr / 2
            ][
                col + dc / 2
            ] = 0;


            carveMaze(
                newRow,
                newCol
            );
        }
    }
}


// ======================================================
// SHUFFLE
// ======================================================

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];
    }
}


// ======================================================
// DRAW MAZE
// ======================================================

function drawMaze() {

    const mazeElement =
        document.getElementById("maze");


    mazeElement.innerHTML = "";


    mazeElement.style.gridTemplateColumns =
        `repeat(${COLS}, 25px)`;


    mazeElement.style.gridTemplateRows =
        `repeat(${ROWS}, 25px)`;


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < COLS;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.classList.add("cell");


            // ------------------------------------------
            // WALL
            // ------------------------------------------

            if (
                maze[row][col] === 1
            ) {

                cell.classList.add("wall");
            }


            // ------------------------------------------
            // EXPLORED CELLS
            // ------------------------------------------

            if (
                exploredCells.some(
                    position =>
                        position[0] === row &&
                        position[1] === col
                )
            ) {

                cell.classList.add("explored");
            }


            // ------------------------------------------
            // AI PATH
            // ------------------------------------------

            if (
                aiPath.some(
                    position =>
                        position[0] === row &&
                        position[1] === col
                )
            ) {

                cell.classList.add("ai-path");
            }


            // ------------------------------------------
            // START
            // ------------------------------------------

            if (

                row === start[0] &&

                col === start[1]

            ) {

                cell.classList.add("start");
            }


            // ------------------------------------------
            // GOAL
            // ------------------------------------------

            if (

                row === goal[0] &&

                col === goal[1]

            ) {

                cell.classList.add("goal");
            }


            // ------------------------------------------
            // PLAYER
            // ------------------------------------------

            if (

                row === player[0] &&

                col === player[1]

            ) {

                cell.classList.add("player");
            }


            mazeElement.appendChild(cell);
        }
    }
}


// ======================================================
// PLAYER MOVEMENT
// ======================================================

function movePlayer(dr, dc) {

    if (gameFinished) {

        return;
    }


    const newRow =
        player[0] + dr;


    const newCol =
        player[1] + dc;


    // ------------------------------------------
    // CHECK BOUNDARY
    // ------------------------------------------

    if (

        newRow < 0 ||

        newRow >= ROWS ||

        newCol < 0 ||

        newCol >= COLS

    ) {

        return;
    }


    // ------------------------------------------
    // CHECK WALL
    // ------------------------------------------

    if (
        maze[newRow][newCol] === 1
    ) {

        document.getElementById("message").textContent =
            "🧱 Wall! Try another direction.";

        return;
    }


    // ------------------------------------------
    // START TIMER
    // ------------------------------------------

    if (!gameStarted) {

        gameStarted = true;

        startTimer();
    }


    // ------------------------------------------
    // MOVE PLAYER
    // ------------------------------------------

    player[0] = newRow;

    player[1] = newCol;

    moves++;


    updateInfo();

    drawMaze();


    // ------------------------------------------
    // CHECK GOAL
    // ------------------------------------------

    if (

        player[0] === goal[0] &&

        player[1] === goal[1]

    ) {

        gameFinished = true;

        stopTimer();


        document.getElementById("status").textContent =
            "Won! 🎉";


        document.getElementById("message").innerHTML =

            `
            🎉 <strong>Congratulations!</strong>
            <br>
            You reached the goal.
            <br>
            Moves: <strong>${moves}</strong>
            <br>
            Time: <strong>${seconds}</strong> seconds
            `;
    }
}


// ======================================================
// KEYBOARD CONTROLS
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (

            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright"
            ].includes(key)

        ) {

            event.preventDefault();
        }


        if (

            key === "arrowup" ||

            key === "w"

        ) {

            movePlayer(-1, 0);
        }


        else if (

            key === "arrowdown" ||

            key === "s"

        ) {

            movePlayer(1, 0);
        }


        else if (

            key === "arrowleft" ||

            key === "a"

        ) {

            movePlayer(0, -1);
        }


        else if (

            key === "arrowright" ||

            key === "d"

        ) {

            movePlayer(0, 1);
        }

    }
);


// ======================================================
// START TIMER
// ======================================================

function startTimer() {

    stopTimer();


    timerInterval =
        setInterval(
            function() {

                seconds++;


                document.getElementById("timer").textContent =
                    seconds;

            },
            1000
        );
}


// ======================================================
// STOP TIMER
// ======================================================

function stopTimer() {

    if (
        timerInterval !== null
    ) {

        clearInterval(
            timerInterval
        );


        timerInterval = null;
    }
}


// ======================================================
// UPDATE INFORMATION
// ======================================================

function updateInfo() {

    document.getElementById("moves").textContent =
        moves;


    document.getElementById("timer").textContent =
        seconds;
}


// ======================================================
// GET BEST FIRST SEARCH RESULT FROM PYTHON
// ======================================================

async function getBestFirstPath() {

    try {

        const response =
            await fetch(
                "/solve",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            maze: maze,

                            start: player,

                            goal: goal

                        })

                }
            );


        return await response.json();

    }

    catch (error) {

        console.error(error);


        document.getElementById("message").textContent =
            "❌ Python server connection failed.";


        return {

            found: false,

            path: [],

            explored: []

        };
    }
}


// ======================================================
// BEST FIRST HINT
//
// THIS FUNCTION SHOWS ONLY ONE DIRECTION.
// IT DOES NOT SHOW THE FULL ROUTE.
// ======================================================

async function showOnlyHint() {

    if (gameFinished) {

        return;
    }


    const result =
        await getBestFirstPath();


    // ------------------------------------------
    // NO ROUTE
    // ------------------------------------------

    if (!result.found) {

        document.getElementById("message").textContent =
            "❌ No route found.";

        return;
    }


    // ------------------------------------------
    // ALREADY AT GOAL
    // ------------------------------------------

    if (

        !result.path ||

        result.path.length < 2

    ) {

        document.getElementById("message").innerHTML =
            "🎉 You are already at the goal!";

        return;
    }


    // ------------------------------------------
    // CURRENT POSITION
    // ------------------------------------------

    const current =
        result.path[0];


    // ------------------------------------------
    // NEXT POSITION ONLY
    // ------------------------------------------

    const next =
        result.path[1];


    const rowChange =
        next[0] - current[0];


    const colChange =
        next[1] - current[1];


    let direction = "";


    // UP

    if (
        rowChange === -1
    ) {

        direction = "⬆️ UP";
    }


    // DOWN

    else if (
        rowChange === 1
    ) {

        direction = "⬇️ DOWN";
    }


    // LEFT

    else if (
        colChange === -1
    ) {

        direction = "⬅️ LEFT";
    }


    // RIGHT

    else if (
        colChange === 1
    ) {

        direction = "➡️ RIGHT";
    }


    // ------------------------------------------
    // VERY IMPORTANT
    //
    // CLEAR THE AI PATH
    // SO NO FULL ROUTE IS SHOWN
    // ------------------------------------------

    aiPath = [];

    exploredCells = [];


    document.getElementById("pathLength").textContent =
        "-";


    // ------------------------------------------
    // SHOW ONLY THE HINT
    // ------------------------------------------

    document.getElementById("message").innerHTML =

        `
        💡 <strong>Best First Hint</strong>
        <br>
        Try moving: <strong>${direction}</strong>
        `;


    // Draw maze without AI route

    drawMaze();
}


// ======================================================
// SOLVE WITH BEST FIRST SEARCH
//
// THIS FUNCTION SHOWS THE COMPLETE AI ROUTE.
// ======================================================

async function solveMaze() {

    if (gameFinished) {

        return;
    }


    const result =
        await getBestFirstPath();


    // ------------------------------------------
    // NO ROUTE
    // ------------------------------------------

    if (!result.found) {

        document.getElementById("message").textContent =
            "❌ No route found.";

        return;
    }


    // Clear previous route

    aiPath = [];

    exploredCells = [];


    // Show path length

    document.getElementById("pathLength").textContent =
        result.path_length;


    document.getElementById("message").innerHTML =
        "🤖 Best First Search is exploring the maze...";


    // ------------------------------------------
    // SHOW EXPLORED CELLS
    // ------------------------------------------

    for (

        let i = 0;

        i < result.explored.length;

        i++

    ) {

        exploredCells.push(
            result.explored[i]
        );


        drawMaze();


        await sleep(18);
    }


    // ------------------------------------------
    // SEARCH COMPLETED
    // ------------------------------------------

    document.getElementById("message").innerHTML =

        `
        🤖 <strong>Best First Search completed!</strong>
        <br>
        Explored:
        <strong>${result.explored_count}</strong>
        cells
        <br>
        Path Length:
        <strong>${result.path_length}</strong>
        <br>
        Execution Time:
        <strong>${result.time}</strong> ms
        `;


    // ------------------------------------------
    // SHOW COMPLETE AI ROUTE
    // ------------------------------------------

    for (

        let i = 0;

        i < result.path.length;

        i++

    ) {

        aiPath.push(
            result.path[i]
        );


        drawMaze();


        await sleep(50);
    }
}


// ======================================================
// SLEEP
// ======================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


// ======================================================
// BUTTONS
// ======================================================


// NEW MAZE

document.getElementById("newMazeButton")
    .addEventListener(
        "click",
        generateMaze
    );


// BEST FIRST HINT

document.getElementById("hintButton")
    .addEventListener(
        "click",
        showOnlyHint
    );


// SOLVE

document.getElementById("solveButton")
    .addEventListener(
        "click",
        solveMaze
    );


// ======================================================
// START GAME
// ======================================================

generateMaze();