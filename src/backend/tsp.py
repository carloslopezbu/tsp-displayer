from pydantic import BaseModel

class Graph(BaseModel):
    matrix: list[list[float]]
    def get(self, i: int = None):
        return self.matrix[i] if i is not None else self.matrix

inf: float = float('inf')

def resolve_inf(graph: Graph):
    for row in graph.get():
        for item in row:
            if item == 'inf':
                item = inf

def greedy_tsp(graph: Graph, start: int = 0):
    n: int = len(graph.get())
    path: list[int] = [start]
    visited: list[bool] = [False] * n
    visited[start] = True
    curr_node: int = start
    cost: float = 0.0
    steps = {curr_node: {'cost': 0, 'choices': []}}

    while len(path) < n:
        best_node = None
        best_cost = inf

        for neighbour in range(n):
            curr_cost = graph.get(curr_node)[neighbour]
            if not visited[neighbour] and curr_cost < best_cost and curr_cost != inf:
                best_node = neighbour
                best_cost = curr_cost
                steps[curr_node]['choices'].append({'best_node': best_node, 'best_cost': best_cost})

        if best_node is not None:
            curr_node = best_node
            cost += best_cost
            visited[curr_node] = True
            path.append(curr_node)
            steps[best_node] = {'cost': cost, 'choices': []}
        else:
            steps['error'] = 'No neighbour available'
            return steps

    last_cost = graph.get(path[-1])[start]
    if last_cost != inf and n != 2:
        path.append(start)
        cost += last_cost
        steps['final'] = {'total_cost': cost}
    else:
        steps['error'] = 'No valid Hamiltonian cycle was found'
        return steps

    return steps