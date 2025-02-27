from fastapi import FastAPI, HTTPException
from src.backend.tsp import inf, Graph, greedy_tsp, resolve_inf
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


g = Graph(matrix=[
    [inf, 2, 5, 1],
    [3, inf, 5, 2],
    [1, 4, inf, 3],
    [1, 2, 3, inf]
])

@app.get("/")
def root():
    return greedy_tsp(g)

@app.post("/greedy/")
def compute_greedy(graph: Graph, start: int = 0):
    if start < 0 or start > len(graph.get()):
        raise HTTPException(status_code=404, detail='Start node is not valid')
    resolve_inf(graph)
    return greedy_tsp(graph)
