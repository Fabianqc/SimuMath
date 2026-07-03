import uvicorn
import os
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    
    # Iniciar servidor Uvicorn
    # Nota: reload=True no debe usarse en entornos de producción real,
    # pero para despliegues locales avanzados es muy útil.
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
