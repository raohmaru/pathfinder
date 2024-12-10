// https://www.gamedev.net/articles/programming/artificial-intelligence/a-pathfinding-for-beginners-r2003/
// https://github.com/qiao/PathFinding.js/blob/master/src/finders/AStarFinder.js

const abs = Math.abs;
// We use 10 and 14 for simplicity's sake. The ratio is about right.
const scale = 10;
// const SQRT2 =  Math.SQRT2;
// SQRT2 approximation for performance's sake. We avoid having to calculate square roots and decimals,
// as computers cannot cannot accurately represent a decimal number because it's represented in binary floating-point.
const SQRT2 =  14;

export default function PathFinder(list, start, target, grid, heuristic, diagonalMov) {
    const {x: dx, y: dy} = target;
    let node, adjNodes, ng;
    list.push(start);
    start.opened = true;
    const closed = [];
    while (list.length) {
        node = list.pop();
        node.closed = true;
        closed.push(node);
        if (node === target) {
            return [node, closed];
        }
        adjNodes = grid.getAdjacent(node, diagonalMov);
        for (let n of adjNodes) {
            if (n.closed) {
                continue;
            }
            // ng = node.g + 1;
            ng = node.g + (!diagonalMov || (n.x - node.x === 0 || n.y - node.y === 0) ? scale : SQRT2);
            if (!n.opened || ng < n.g) {
                n.g = ng;
                n.h ??= heuristic(abs(n.x - dx), abs(n.y - dy)) * scale;
                n.f = n.g + n.h;
                n.parent = node;
                if (!n.opened) {
                    list.push(n);
                    n.opened = true;
                } else {
                    list.update(n);
                }
            }
        }
    }
    // No path found
    return [false, closed];
}