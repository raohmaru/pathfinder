export default function Grid(rows, cols) {
    const cells = new Array(rows * cols);
    function addCell(x = 0, y = 0) {
        const o = Object.create(null);  // Object without prototype
        o.x = x;
        o.y = y;
        o.g = 0;
        o.h = undefined;
        o.f = Infinity;
        cells[x + y * cols] = o;
        return o;
    }
    function getCellAt(x, y) {
        return cells[x + y * cols];
    }
    const len = cells.length;
    for (let i = 0; i < len; i++) {
        const x = i % cols;
        const y = i / cols << 0;
        addCell(x, y);
    }
    return {
        getCellAt,
        get size() {
            return rows * cols;
        },
        get rows() {
            return rows;
        },
        get cols() {
            return cols;
        },
        get cells() {
            return cells.slice();
        },
        getAdjacent(cell, diagonalMov) {
            const adjacent = [];
            const {x: cx, y: cy} = cell;
            let i = 0;
            let x = 0;
            let y = 0;
            let ax, ay, adj;
            while (x + y < 2) {
                x = i % 3 - 1;
                y = (i / 3 << 0) - 1;
                i++;
                ax = x + cx;
                ay = y + cy;
                if ((ax !== cx || ay !== cy)
                    // Not out of bounds
                    && ax >= 0 && ay >= 0 && ax < cols && ay < rows
                    // Diagonal movement allowed
                    && (diagonalMov || (ax === cx || ay === cy))
                ) {
                    adj = getCellAt(ax, ay);
                    if (!adj.blocked) {
                        adjacent.push(adj);
                    }
                }
            }
            return adjacent;
        }
    }
};