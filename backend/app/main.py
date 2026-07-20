import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Importar módulos propios
from app.generators import generate_mid_squares, generate_linear_congruential
from app.stats_tests import (
    run_mean_test,
    run_variance_test,
    run_kolmogorov_smirnov_test,
    run_poker_test,
    run_series_test,
    run_gap_test,
    run_runs_up_down_test
)
from app.theory import InverseTransformDiscrete, CompositionMethod

# Cargar variables de entorno
load_dotenv()

app = FastAPI(
    title="API de Simulación y Modelos",
    description="Backend en FastAPI para generación de números pseudoaleatorios y validación mediante pruebas estadísticas.",
    version="1.0.0"
)

# Configurar orígenes de CORS desde variables de entorno
cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
if cors_origins_raw == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de entrada para Pydantic (Validación y tipado estricto)

class MidSquareRequest(BaseModel):
    seed: int = Field(..., description="Semilla inicial. Debe ser un entero positivo.")
    num_digits: int = Field(4, description="Número de dígitos (d) de la semilla. Debe ser un número par >= 4.")
    count: int = Field(20, description="Cantidad de números a generar.")

    @validator('seed')
    def validate_seed(cls, v):
        if v <= 0:
            raise ValueError("La semilla debe ser un número entero positivo.")
        return v

    @validator('num_digits')
    def validate_num_digits(cls, v):
        if v < 4 or v % 2 != 0:
            raise ValueError("El número de dígitos debe ser par y al menos 4.")
        return v
        
    @validator('seed', 'num_digits')
    def validate_seed_len(cls, v, values):
        if 'seed' in values and 'num_digits' in values:
            seed_len = len(str(values['seed']))
            if seed_len > values['num_digits']:
                raise ValueError(f"La semilla ingresada ({values['seed']}) tiene {seed_len} dígitos, lo cual supera los {values['num_digits']} dígitos configurados.")
        return v


class CongruentialRequest(BaseModel):
    seed: int = Field(..., description="Semilla inicial X_0. Debe ser un entero positivo.")
    a: int = Field(..., description="Multiplicador. Debe ser un entero positivo.")
    c: int = Field(..., description="Incremento. Debe ser un entero no negativo.")
    m: int = Field(..., description="Módulo. Debe ser un entero positivo y mayor que la semilla, multiplicador e incremento.")
    count: int = Field(20, description="Cantidad de números a generar.")

    @validator('seed', 'a', 'm')
    def validate_positives(cls, v):
        if v <= 0:
            raise ValueError("La semilla, el multiplicador y el módulo deben ser mayores que cero.")
        return v

    @validator('c')
    def validate_non_negative(cls, v):
        if v < 0:
            raise ValueError("El incremento no puede ser negativo.")
        return v

    @validator('m')
    def validate_modulus_relations(cls, v, values):
        if 'seed' in values and values['seed'] >= v:
            raise ValueError("El módulo (m) debe ser estrictamente mayor que la semilla (X_0).")
        if 'a' in values and values['a'] >= v:
            raise ValueError("El módulo (m) debe ser estrictamente mayor que el multiplicador (a).")
        if 'c' in values and values['c'] >= v:
            raise ValueError("El módulo (m) debe ser estrictamente mayor que el incremento (c).")
        return v


class DiscreteInverseRequest(BaseModel):
    values: List[str] = Field(..., description="Lista de valores discretos a generar.")
    probabilities: List[float] = Field(..., description="Lista de probabilidades correspondientes que deben sumar 1.0.")
    count: int = Field(20, description="Cantidad de elementos a generar.")

    @validator('probabilities')
    def validate_probabilities(cls, v):
        if any(p < 0 for p in v):
            raise ValueError("Las probabilidades no pueden ser negativas.")
        if abs(sum(v) - 1.0) > 1e-5:
            raise ValueError(f"La suma de las probabilidades debe ser exactamente 1.0 (suma: {sum(v)}).")
        return v


# Función auxiliar para empaquetar resultados y ejecutar las 7 pruebas de uniformidad e independencia
def package_and_test(numbers: List[float], history: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Correr las 7 pruebas estadísticas requeridas
    mean_test_res = run_mean_test(numbers)
    var_test_res = run_variance_test(numbers)
    ks_test_res = run_kolmogorov_smirnov_test(numbers)
    poker_test_res = run_poker_test(numbers)
    series_test_res = run_series_test(numbers)
    gap_test_res = run_gap_test(numbers)
    runs_test_res = run_runs_up_down_test(numbers)
    
    return {
        "generated_numbers": numbers,
        "history": history,
        "tests": {
            "mean_test": mean_test_res,
            "variance_test": var_test_res,
            "ks_test": ks_test_res,
            "poker_test": poker_test_res,
            "series_test": series_test_res,
            "gap_test": gap_test_res,
            "runs_test": runs_test_res
        }
    }


# Endpoints API

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a la API de Simulación y Modelos",
        "endpoints_disponibles": {
            "/api/generate/mid-square": "POST - Generador Cuadrados Medios",
            "/api/generate/congruential": "POST - Generador Congruencial Lineal",
            "/api/theory/inverse": "POST - Demostración de Transformada Inversa Discreta",
            "/api/theory/composition": "GET - Demostración de Método de Composición (Mezcla)"
        }
    }


@app.post("/api/generate/mid-square")
def post_mid_square(payload: MidSquareRequest):
    try:
        numbers, history = generate_mid_squares(
            seed=payload.seed,
            num_digits=payload.num_digits,
            count=payload.count
        )
        return package_and_test(numbers, history)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/generate/congruential")
def post_congruential(payload: CongruentialRequest):
    try:
        numbers, history = generate_linear_congruential(
            seed=payload.seed,
            a=payload.a,
            c=payload.c,
            m=payload.m,
            count=payload.count
        )
        return package_and_test(numbers, history)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/theory/inverse")
def post_discrete_inverse(payload: DiscreteInverseRequest):
    try:
        generator = InverseTransformDiscrete(
            values=payload.values,
            probabilities=payload.probabilities
        )
        results = generator.generate_batch(count=payload.count)
        return {
            "method": "Método de la Transformada Inversa (Variables Discretas)",
            "definition": "Permite generar variables discretas asociando intervalos acumulados de probabilidad a cada valor posible. Al generar un U ~ U(0,1), determinamos en qué intervalo cae.",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/theory/composition")
def get_composition_demo(count: int = 6):
    try:
        generator = CompositionMethod()
        results = generator.generate_batch(count=count)
        return {
            "method": "Método de Composición (Mezcla de Distribuciones)",
            "definition": "Permite modelar distribuciones complejas expresadas como mezclas ponderadas de otras distribuciones F(x) = sum(p_j * F_j(x)). Se usa una primera variable U1 para elegir qué distribución usar, y una U2 para muestrear de ella.",
            "mixture_details": {
                "distribution_1": "U(0, 5) con peso de probabilidad 0.40",
                "distribution_2": "U(10, 20) con peso de probabilidad 0.60"
            },
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
