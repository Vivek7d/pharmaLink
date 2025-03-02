// Node class definition
export class Node {
    constructor(x, y, isWalkable = true) {
        this.x = x; // x-coordinate on the grid
        this.y = y; // y-coordinate on the grid
        this.isWalkable = isWalkable; // Whether this node is walkable
        this.g = 0; // Cost from start node
        this.h = 0; // Heuristic (estimated cost to goal)
        this.f = 0; // Total cost (f = g + h)
        this.parent = null; // Parent node for path reconstruction
    }
}

// A* Algorithm
export function aStar(grid, start, end) {
    const openSet = [start]; // Set of nodes to be evaluated
    const closedSet = new Set(); // Set of nodes already evaluated
    
    const directions = [
        { x: 1, y: 0 },  // Right
        { x: -1, y: 0 }, // Left
        { x: 0, y: 1 },  // Down
        { x: 0, y: -1 }, // Up
    ];

    // Heuristic function: Manhattan distance
    const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    // While there are nodes to evaluate
    while (openSet.length > 0) {
        // Get the node with the lowest f score
        let currentNode = openSet.reduce((lowest, node) => (node.f < lowest.f ? node : lowest), openSet[0]);

        // If the end node is reached, reconstruct the path
        if (currentNode === end) {
            const path = [];
            let temp = currentNode;
            while (temp) {
                path.push({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            return path.reverse(); // Return path from start to end
        }

        // Remove currentNode from openSet and add it to closedSet
        openSet.splice(openSet.indexOf(currentNode), 1);
        closedSet.add(currentNode);

        // Explore neighbors
        for (const dir of directions) {
            const neighborX = currentNode.x + dir.x;
            const neighborY = currentNode.y + dir.y;

            // Skip out-of-bounds neighbors
            if (neighborX < 0 || neighborY < 0 || neighborX >= grid.length || neighborY >= grid[0].length) {
                continue;
            }

            const neighbor = grid[neighborX][neighborY];

            // Skip non-walkable nodes or nodes already in closedSet
            if (!neighbor.isWalkable || closedSet.has(neighbor)) {
                continue;
            }

            const tentativeG = currentNode.g + 1; // Assume each move costs 1

            // If neighbor is not in openSet or we found a better path to it
            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeG >= neighbor.g) {
                continue; // No better path, skip
            }

            // Update the neighbor node's information
            neighbor.parent = currentNode;
            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
        }
    }

    return []; // Return an empty array if no path is found
}
