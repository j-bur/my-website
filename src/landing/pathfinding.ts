/**
 * BFS shortest-path and edge key utilities for mesh path rendering.
 */
import { edgeKey } from './meshGraph';

/**
 * BFS shortest path between two vertices in the mesh graph.
 * All edges have equal weight (unweighted BFS).
 *
 * @returns Vertex index array from source to target (inclusive), or [] if unreachable.
 */
export function findPath(
  adjacency: number[][],
  source: number,
  target: number,
): number[] {
  if (source === target) return [source];

  const parent = new Int32Array(adjacency.length).fill(-1);
  parent[source] = source; // mark visited with self-reference
  const queue: number[] = [source];
  let head = 0;

  while (head < queue.length) {
    const v = queue[head++];
    for (const neighbor of adjacency[v]) {
      if (parent[neighbor] !== -1) continue; // already visited
      parent[neighbor] = v;
      if (neighbor === target) {
        // Reconstruct path
        const path: number[] = [];
        let cur = target;
        while (cur !== source) {
          path.push(cur);
          cur = parent[cur];
        }
        path.push(source);
        path.reverse();
        return path;
      }
      queue.push(neighbor);
    }
  }

  return []; // unreachable
}

/**
 * Convert a vertex path to a set of edge keys for fast membership testing.
 * Uses the canonical edgeKey() from meshGraph.ts.
 */
export function pathToEdgeKeys(path: number[]): Set<number> {
  const keys = new Set<number>();
  for (let i = 0; i < path.length - 1; i++) {
    keys.add(edgeKey(path[i], path[i + 1]));
  }
  return keys;
}
