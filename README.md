
# TSP Displayer

Este proyecto es una aplicación web para visualizar soluciones del Problema del Viajante (TSP).

## Tecnologías usadas

- **Python**: Lenguaje de programación principal.
- **FastAPI**: Framework para construir la API.
- **Uvicorn**: Servidor ASGI para ejecutar la aplicación.
- **HTML/CSS/JavaScript**: Para la interfaz de usuario.

## Estructura del proyecto

```
tsp-displayer/
│
├── src/
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── api.py
│   │   └── tsp.py
│   ├── frontend/
│   │   ├── index.html
│   │   ├── script.js
│   │   └── styles.css
├── venv/
│   └── ...
├── README.md
└── requirements.txt
```

## Configuración del entorno virtual

Para crear el entorno virtual en la raíz del proyecto, ejecuta los siguientes comandos:

```bash
python -m venv venv
source venv/bin/activate  # En Windows usa `venv\Scripts\activate`
pip install -r requirements.txt
```

## Levantar el servidor

Para levantar el servidor de Uvicorn, ejecuta el siguiente comando:

```bash
uvicorn src.backend.api:app --reload
```

Esto iniciará el servidor en `http://127.0.0.1:8000`.

## Uso

1. Abre tu navegador y navega a `http://127.0.0.1:8000` y verifica que se este ejecutando la api.
2. Utiliza la interfaz para cargar y visualizar soluciones del TSP haz "show preview" del index.html o abrelo en tu navegador.