const $ = (id) => document.getElementById(id)
const $$ = (selector) => document.querySelectorAll(selector)
const graphMap = $("graph-map")
const clearButton = $("clear")
const solveButton = $("solve")
const resetButton = $("reset")

let numNodes = 0
const nodes = []
const edges = []

function createGraphNode(xPosition, yPosition) {
    const node = document.createElement("div")
    node.className = "graph-node"
    node.style.left = `${xPosition}px`
    node.style.top = `${yPosition}px`
    node.textContent = numNodes
    node.dataset.id = numNodes  // Asignar ID único al nodo
    numNodes++

    node.addEventListener("click", (event) => {
        event.stopPropagation()
        node.classList.toggle("clicked")

        const clickedNodes = nodes.filter((n) => n.classList.contains("clicked"))

        if (clickedNodes.length === 2) {
            createGraphEdge(clickedNodes[0], clickedNodes[1])
            clickedNodes.forEach((n) => n.classList.remove("clicked"))
        }
    })

    graphMap.appendChild(node)
    nodes.push(node)
    return node
}

function createGraphEdge(node1, node2) {
    const defaultWeight = 1  

    const edgeElement = document.createElement("div")
    edgeElement.className = "graph-edge"

    const labelElement = document.createElement("input")
    labelElement.className = "edge-label"
    labelElement.type = "number"
    labelElement.value = defaultWeight
    labelElement.min = 1 
    labelElement.dataset.edgeIndex = edges.length
    labelElement.addEventListener("click", (event) => {
        event.stopPropagation()
    })

    labelElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            const edgeIndex = parseInt(labelElement.dataset.edgeIndex)
            const edge = edges[edgeIndex]
            
            if (edge) {
                const newValue = parseInt(labelElement.value)
                if (!isNaN(newValue) && newValue > 0) {
                    edge.weight = newValue
                    labelElement.blur()
                } else {
                    labelElement.value = edge.weight 
                }
            }
        }
    })

    const x1 = node1.offsetLeft + node1.offsetWidth / 2
    const y1 = node1.offsetTop + node1.offsetHeight / 2
    const x2 = node2.offsetLeft + node2.offsetWidth / 2
    const y2 = node2.offsetTop + node2.offsetHeight / 2

    const angle = Math.atan2(y2 - y1, x2 - x1)
    const radius = node1.offsetWidth / 2

    const x1b = x1 + Math.cos(angle) * radius
    const y1b = y1 + Math.sin(angle) * radius
    const x2b = x2 - Math.cos(angle) * radius
    const y2b = y2 - Math.sin(angle) * radius

    const length = Math.hypot(x2b - x1b, y2b - y1b)

    edgeElement.style.width = `${length}px`
    edgeElement.style.transform = `rotate(${angle * (180 / Math.PI)}deg)`
    edgeElement.style.left = `${x1b}px`
    edgeElement.style.top = `${y1b}px`

    labelElement.style.left = `${(x1b + x2b) / 2}px`
    labelElement.style.top = `${(y1b + y2b) / 2}px`

    graphMap.appendChild(edgeElement)
    graphMap.appendChild(labelElement)

    edges.push({
        node1: node1.dataset.id,
        node2: node2.dataset.id,
        weight: defaultWeight,
        edgeElement,
        labelElement
    })
}

function findEdge(node1, node2) {
    return edges.find(e => (e.node1 == node1 && e.node2 == node2) || (e.node1 == node2 && e.node2 == node1))
}

function toMatrix() {
    const matrix = Array.from({ length: numNodes }, () => Array(numNodes).fill('inf'))

    edges.forEach(({ node1, node2, weight }) => {
        matrix[node1][node2] = weight
        matrix[node2][node1] = weight
    })

    return matrix
}

graphMap.addEventListener("click", (event) => {
    const rect = graphMap.getBoundingClientRect()
    const x = event.clientX - rect.left - 20
    const y = event.clientY - rect.top - 20
    createGraphNode(x, y)
})

resetButton.addEventListener("click", (event) => {
    event.stopPropagation()
    $$(".selected, .chosen, .error").forEach(el => el.classList.remove("selected", "chosen", "error"))
})

clearButton.addEventListener("click", (event) => {
    event.stopPropagation()

    nodes.forEach((node) => node.remove())
    edges.forEach(({ edgeElement, labelElement }) => {
        edgeElement.remove()
        labelElement.remove()
    })

    nodes.length = 0
    edges.length = 0
    numNodes = 0
})

solveButton.addEventListener("click", async (event) => {
    event.stopPropagation()
    
    const matrix = { matrix: toMatrix() }
    
    if (edges.length === 0) {
        alert("There are no edges to solve")
        return
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/greedy/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(matrix)
        })
        
        const data = await response.json()
        animateGreedy(data)
    } catch (error) {
        console.error(error)
    }
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function animateGreedy(steps) {
    console.log("Steps:", steps)

    const path = Object.keys(steps)
        .map(key => parseInt(key))
        .filter(num => !isNaN(num))
        .sort((a, b) => steps[a].cost - steps[b].cost)

    for (let index1 = 1; index1 < path.length; index1++) {
        const node1 = path[index1 - 1]
        const node2 = path[index1]

        const choices = steps[node1]['choices'] || []

        let lastEdge = null
        for (let choice of choices) {
            const nextNode = choice['best_node']
            const edge = findEdge(node1, nextNode)
            lastEdge = edge

            if (edge) {
                nodes[nextNode].classList.add("chosen")
                edge.edgeElement.classList.add("chosen")
                edge.labelElement.classList.add("chosen")
            }

            await sleep(500)
        }

        $$(".chosen").forEach(el => el.classList.remove("chosen"))

        nodes[node1].classList.add("selected")
        nodes[node2].classList.add("selected")

        if (lastEdge) {
            lastEdge.edgeElement.classList.add("selected")
            lastEdge.labelElement.classList.add("selected")
        }

        await sleep(1000)
    }

    if (!steps['error']) {
        const lastEdge = findEdge(path[path.length - 1], path[0])

        if (lastEdge) {
            nodes[path[path.length - 1]].classList.add("selected")
            lastEdge.edgeElement.classList.add("selected")
            lastEdge.labelElement.classList.add("selected")
        }
    }
    else{
        selectedPath = $$('.selected')
        selectedPath.forEach(node => node.classList.remove('selected'))
        selectedPath.forEach(edge => edge.classList.add('error'))
    }
}