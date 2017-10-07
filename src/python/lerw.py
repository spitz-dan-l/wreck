from collections import Counter

def compute_full_traversals(dim_x, dim_y):
    points = [(x, y) for x in range(dim_x) for y in range(dim_y)]

    graph = {}

    for x, y in points:
        adj = set()
        if x > 0:
            adj.add((x - 1, y))
        if x < dim_x - 1:
            adj.add((x + 1, y))

        if y > 0:
            adj.add((x, y - 1))
        if y < dim_y - 1:
            adj.add((x, y + 1))

        graph[(x, y)] = adj

    def dfs_paths(graph, start, goal):
        stack = [(start, [start])]
        while stack:
            (vertex, path) = stack.pop()
            for next in graph[vertex] - set(path):
                if next == goal:
                    yield path + [next]
                else:
                    stack.append((next, path + [next]))

    all_full_traversals = []

    start = (0,0)

    for dest in points:
        if dest == start:
            continue
        travs = []
        for path in dfs_paths(graph, start, dest):
            if len(path) == dim_x * dim_y: #full traversal
                travs.append(path)
        all_full_traversals.extend(travs)

    return all_full_traversals

if __name__ == '__main__':
    corners = [(0,0), (0, 2), (3,0), (3,2)]

    ts = compute_full_traversals(4,3)

    corner_orders = Counter()

    for t in ts:
        c_o = tuple(p for p in t if p in corners)
        corner_orders[c_o] += 1


    corner_gaps = Counter()

    for t in ts:
        gaps = []
        current_gap = 0
        for p in t:
            if p in corners:
                gaps.append(current_gap)
                current_gap = 0
            else:
                current_gap += 1

        gaps.append(current_gap)

        corner_gaps[tuple(gaps)] += 1


