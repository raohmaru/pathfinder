import Grid from './libs/Grid.js';
import BinaryHeap from './libs/BinaryHeap.js';
import PathFinder from './libs/PathFinder.js';
import wait from './libs/wait.js';
import { $ } from './libs/dom.js';
import * as heuristics from './libs/heuristics.js';

const cellSize = 30;
const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
let { width: canvasWidth, height: canvasHeight } = canvas;
let rows = (canvasWidth / cellSize) << 0;  // Fast round floor
let cols = (canvasHeight / cellSize) << 0;

let grid = Grid(rows, cols);
let startCell = grid.getCellAt(0, 0);
let targetCell = grid.getCellAt(19, 19);

let blocked = [];
let mouseDown = false;
let erase = false;
let playing = false;

// Graphics
function drawGrid(grid) {
    const {rows, cols} = grid;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    for (let i = 0; i < rows + 1; i++) {
        ctx.moveTo(0, i * cellSize + .5);
        ctx.lineTo(canvasWidth, i * cellSize + .5);
    }
    for (let i = 0; i < cols + 1; i++) {
        ctx.moveTo(i * cellSize + .5, 0);
        ctx.lineTo(i * cellSize + .5, canvasHeight);
    }
    ctx.stroke();
    ctx.font = "9px Calibri";
    ctx.fillStyle = 'black';
    for (let i = 0; i < grid.size; i++) {
        const x = i % cols;
        const y = i / cols << 0;
        ctx.fillText(`${x},${y}`, x * cellSize + 1, y * cellSize + 8);
    }
}

function resetGrid() {
    drawGrid(grid);
    drawCell(startCell, 'blue');
    drawCell(targetCell, 'red');
    drawBlockedCell();
}

function drawCell(cell, color, textColor = 'white') {
    const {x, y, f} = cell;
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.strokeRect(x * cellSize + .5, y * cellSize + .5, cellSize, cellSize);
    ctx.fillStyle = textColor;
    ctx.fillText(`${x},${y}`, x * cellSize + 1, y * cellSize + 8);
    if (f !== undefined && f !== Infinity) {
        ctx.fillText(`${(f/10).toFixed()}`, x * cellSize + 1, y * cellSize + 28);
    }
}

function drawBorderCell(x, y, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(x * cellSize + .5, y * cellSize + .5, cellSize, cellSize);
}

function drawBlockedCell() {
    for (let i = 0; i < blocked.length; i++) {
        const b = blocked[i];
        // Restore two unsigned 16bit ints from 32bit int
        const cell = grid.getCellAt(b >> 16, b & 0xFFFF);
        if (cell) {
            cell.blocked = true;
            drawCell(cell, 'black');
        }
    }
}

const heuristic = function() {
    const fun = heuristics[$('#heuristic').value];
    return function(dx, dy) {
        return fun(dx, dy) * (parseFloat($('#weight').value) || 1);
    }
}

async function main() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    grid = Grid(rows, cols);
    startCell = grid.getCellAt(startCell.x, startCell.y);
    targetCell = grid.getCellAt(targetCell.x, targetCell.y);
    resetGrid();
    const diagonal = $('#diagonal').checked;
    const t0 = performance.now();
    const list = BinaryHeap((a, b) => a?.f - b?.f);
    const [path, closed] = PathFinder(list, startCell, targetCell, grid, heuristic(), diagonal);
    const t1 = performance.now();
    const ms = +$('#ms').value;
    // Draw search
    playing = true;
    for (let i = 0; i < closed.length; i++) {
        const node = closed[i];
        if (node === startCell || node === targetCell) {
            continue;
        }
        drawBorderCell(node.x, node.y, 'blue');
        const adjNodes = grid.getAdjacent(node, diagonal);
        for (let n of adjNodes) {
            if (n !== startCell && n !== targetCell) {
                drawCell(n, 'rgba(0, 0, 0, 0.1)', 'black');
            }
        }
        ms && await wait(ms);
        if (!playing) {
            return;
        }
    }
    // Draw backwards path
    const $output = $('#output');
    if (path) {
        let n = path;
        let c = 1;
        while((n = n.parent) && (n.x != startCell.x || n.y != startCell.y)) {
            drawCell(n, 'rgb(255, 165, 0, 0.75)', 'black');
            c++;
            ms && await wait(10);
            if (!playing) {
                return;
            }
        }
        $output.textContent = `Number of steps: ${c}`;
    } else {
        $output.textContent = 'Unable to find the destination';
    }
    $output.innerHTML += `<br>Execution time: ${t1 - t0} ms`;
    playing = false;
}

// UI
resetGrid();

function getXY(e) {
    const x = (e.x - canvas.offsetLeft + window.scrollX) / cellSize << 0;
    const y = (e.y - canvas.offsetTop + window.scrollY) / cellSize << 0;
    return [x, y];
}

function addBlocked(x, y) {
    if (x === startCell.x && y === startCell.y || x === targetCell.x && y === targetCell.y) {
        return;
    }
    // Stores two unsigned 16bit ints into a 32bit int.
    // First int in the higher 16bit, and the other at the lower 16bit.
    blocked.push((x << 16) | (y & 0xFFFF));
    drawCell({x, y}, 'black');
}

function removeBlocked(x, y) {
    if (x === startCell.x && y === startCell.y || x === targetCell.x && y === targetCell.y) {
        return;
    }
    const uint = (x << 16) | (y & 0xFFFF);
    // If ints have the same value, output will be 0
    blocked = blocked.filter(b => b ^ uint);
    drawCell({x, y}, 'white', 'black');
}

canvas.addEventListener('mousedown', e => {
    mouseDown = true;
    if (e.button === 0) {
        addBlocked(...getXY(e));
    } else {
        e.preventDefault();
        erase = true;
        removeBlocked(...getXY(e));
    }
});

canvas.addEventListener('mouseup', e => {
    mouseDown = false;
    erase = false;
});

canvas.addEventListener('mousemove', e => {
    const [x, y] = getXY(e);
    if (mouseDown) {
        erase ? removeBlocked(x, y) : addBlocked(x, y);
    }
});

canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
});

$('#find').addEventListener('click', () => {
    if (playing) {
        playing = false;
    } else {
        main();
    }
});

$('#reset').addEventListener('click', () => {
    blocked.length = 0;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawGrid(grid);
    drawCell(startCell, 'blue');
    drawCell(targetCell, 'red');
    playing = false;
});

$('#cols').addEventListener('change', (e) => {
    cols = parseInt(e.target.value, 10);
    grid = Grid(rows, cols);
    canvasWidth = cols * cellSize;
    canvas.width = canvasWidth;
    canvas.style.width = `${canvasWidth}px`;
    targetCell.x = cols - 1;
    resetGrid();
});

$('#rows').addEventListener('change', (e) => {
    rows = parseInt(e.target.value, 10);
    grid = Grid(rows, cols);
    canvasHeight = rows * cellSize;
    canvas.height = canvasHeight;
    canvas.style.height = `${canvasHeight}px`;
    targetCell.y = rows - 1;
    resetGrid();
});