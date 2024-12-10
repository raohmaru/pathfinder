# A* Pathfinder in JavaScript ↯
Find the optimal path between two points in a 2D map by using A* Pathfinding algorithm.

```js
import Grid from './libs/Grid.js';
import BinaryHeap from './libs/BinaryHeap.js';
import PathFinder from './libs/PathFinder.js';
import { manhattan } from './libs/heuristics.js';

// Build the grid (map)
const grid = Grid(20, 20);
// Block passage for some cells
grid.getCellAt(1, 1).blocked = true;
grid.getCellAt(5, 7).blocked = true;
grid.getCellAt(8, 8).blocked = true;
// Use a binary heap to store the paths for real speed
const list = BinaryHeap((a, b) => a?.f - b?.f);
// Start and destination
const startCell = grid.getCellAt(0, 0);
const targetCell = grid.getCellAt(19, 19);
// Allow diagonal movement
const diagonalMovement = true;
// Find the optimal path.
// `path` contains the path to the destination, or null if path to destination is blocked
// `closed` contains all the paths
const [path, closed] = PathFinder(list, startCell, targetCell, grid, manhattan, diagonalMovement);
```

## References
+ https://esstudio.site/2018/10/31/implementing-binary-heaps-with-javascript.html
+ https://github.com/qiao/heap.js/blob/master/src/heap.coffee
+ https://www.gamedev.net/articles/programming/artificial-intelligence/a-pathfinding-for-beginners-r2003/
+ https://github.com/qiao/PathFinding.js/blob/master/src/finders/AStarFinder.js