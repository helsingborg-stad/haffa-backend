import { toLookup } from './to-lookup'
import { toMap } from './to-map'

export interface Tree<T> {
  roots: TreeNode<T>[]
  treeNodeById: Record<string, TreeNode<T>>
  getChildrenRec: (...ids: string[]) => Iterable<TreeNode<T>>
}
export type TreeNode<T> = T & { children: TreeNode<T>[] }

export const mapTree = <T>(
  nodes: T[],
  id: (node: T) => string,
  parentId: (node: T) => string
): Tree<T> => {
  const nodesByParentId = toLookup(nodes, parentId)

  const makeTreeNode = (node: T): TreeNode<T> => ({
    ...node,
    children: nodesByParentId[id(node)]?.map(makeTreeNode) || [],
  })
  const roots = nodesByParentId['']?.map(makeTreeNode) || []

  const collectTreeNodes = (node: TreeNode<T>, s: Set<TreeNode<T>>) => {
    s.add(node)
    node.children.forEach(n => collectTreeNodes(n, s))
  }

  const allNodes = new Set<TreeNode<T>>()
  roots.map(n => collectTreeNodes(n, allNodes))

  const treeNodeById = toMap([...allNodes], id, n => n)
  return {
    roots,
    treeNodeById,
    getChildrenRec: (...ids: string[]) => {
      const s = new Set<TreeNode<T>>()
      ids
        .map(nid => treeNodeById[nid])
        .filter(n => n)
        .forEach(n => collectTreeNodes(n, s))
      return s
    },
  }
}
