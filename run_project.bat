@echo off
title Lanzador de SimuMath
color 0A

echo =====================================================================
echo               LANZADOR AUTOMATICO - PROYECTO SIMUMATH
echo =====================================================================
echo.
echo Este script iniciara los servidores de Backend (FastAPI) y 
echo Frontend (Next.js) en ventanas de comandos independientes.
echo.
echo ---------------------------------------------------------------------
echo [*] Levantando Servidor Backend (FastAPI)...
echo ---------------------------------------------------------------------
start "SimuMath - API Backend (FastAPI)" cmd /k "cd backend && (if exist venv\Scripts\activate.bat (echo [1/3] Activando entorno virtual... && call venv\Scripts\activate.bat) else (echo [!] Entorno virtual 'venv' no encontrado. Usando Python del sistema...)) && echo [2/3] Verificando dependencias de Python... && pip install -r requirements.txt && echo [3/3] Iniciando FastAPI en http://localhost:8003 ... && python run.py"

echo.
echo ---------------------------------------------------------------------
echo [*] Levantando Servidor Frontend (Next.js)...
echo ---------------------------------------------------------------------
start "SimuMath - Interfaz Frontend (Next.js)" cmd /k "cd frontend && echo [1/2] Verificando dependencias de Node... && npm install && echo [2/2] Iniciando Next.js en http://localhost:3003 ... && npm run dev"

echo.
echo =====================================================================
echo               ¡SERVIDORES LANZADOS CON EXITO!
echo =====================================================================
echo.
echo - Backend corriendo en:  http://localhost:8003
echo - Docs de la API en:     http://localhost:8003/docs
echo - Frontend corriendo en: http://localhost:3003
echo.
echo Mantén esta ventana abierta o presiona cualquier tecla para salir.
echo =====================================================================
pause > nul
