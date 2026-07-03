# SimuMath - Simulador de Números Pseudoaleatorios y Pruebas Estadísticas

Este proyecto es una aplicación web académica diseñada para la materia **Simulación y Modelos**. Permite generar números pseudoaleatorios utilizando métodos clásicos y validarlos mediante pruebas de hipótesis estadísticas.

## 🚀 Arquitectura del Proyecto

El proyecto está dividido en dos partes:
1. **Backend (FastAPI - Python)**: Procesa los cálculos matemáticos puros para generar los números y evaluar las pruebas estadísticas.
2. **Frontend (Next.js/React - TypeScript - Tailwind CSS)**: Interfaz gráfica moderna en modo oscuro, interactiva y responsiva para configurar parámetros y visualizar la traza matemática paso a paso.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado:
- [Python 3.9+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)

---

## ⚙️ Variables de Entorno (.env)

El proyecto está preparado para producción y utiliza variables de entorno cargadas dinámicamente mediante archivos `.env`:

### Backend (`backend/.env`):
* `HOST`: Dirección del host del servidor (por defecto `127.0.0.1`).
* `PORT`: Puerto de escucha del servidor (por defecto `8000`).
* `CORS_ORIGINS`: Lista de orígenes permitidos separados por coma (ej. `http://localhost:3000` o `*` para desarrollo libre).

### Frontend (`frontend/.env`):
* `NEXT_PUBLIC_API_URL`: URL pública del API del Backend (por defecto `http://localhost:8000`). Debe ser accesible desde el cliente del navegador.

---

## 💻 Instrucciones para Levantar el Entorno Local

### 1. Iniciar el Backend (FastAPI)

1. Abre tu terminal y ve a la carpeta del backend:
   ```bash
   cd backend
   ```
2. (Recomendado) Crea e inicia un entorno virtual:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Ejecuta el servidor del backend:
   ```bash
   python run.py
   ```
   El servidor estará disponible en `http://localhost:8000`. Puedes verificarlo abriendo `http://localhost:8000/` en tu navegador.

### 2. Iniciar el Frontend (Next.js)

1. Abre otra terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El frontend se levantará en `http://localhost:3000`.

---

## 🧠 Métodos y Pruebas Soportadas

### Generadores (N = 6):
* **Método de Cuadrados Medios**: Eleva la semilla de *d* dígitos al cuadrado, extrae los *d* dígitos centrales como la siguiente semilla y normaliza dividiendo entre $10^d$.
* **Método Congruencial Lineal**: Usa la relación recursiva $X_{n+1} = (a \cdot X_n + c) \pmod m$ y normaliza $U_{n+1} = X_{n+1} / m$.

### Pruebas de Validación ($\alpha = 0.05$):
* **Prueba de Media**: Compara la media muestral contra el valor esperado de 0.5.
* **Prueba de Varianza**: Evalúa si la varianza muestral es estadísticamente igual a 1/12 (0.0833) usando la distribución Chi-cuadrada.
* **Prueba Kolmogorov-Smirnov**: Valida la bondad de ajuste de la muestra contra la distribución uniforme acumulada teórica, ordenando los números y comparando la distancia máxima $D$ con el valor crítico para $N=6$.

### Extensiones Teóricas Demostrativas:
* **Método de la Transformada Inversa (Variables Discretas)**: Simulación interactiva asociando rangos acumulados a categorías discretas.
* **Método de Composición**: Muestreo continuo por mezcla probabilística ponderada de dos distribuciones uniformes.
