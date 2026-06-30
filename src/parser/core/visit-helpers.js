/**
 * CST visitor 共享辅助：预分配 loop 替代 `.map` 以减少中间数组分配。
 */

/**
 * @template T
 * @param {unknown[]} nodes
 * @param {(node: unknown) => T} visitFn
 * @returns {T[]}
 */
export function visitArrayChildren(nodes, visitFn) {
  const n = nodes.length;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = visitFn(nodes[i]);
  }
  return arr;
}
