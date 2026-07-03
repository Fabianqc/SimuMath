import math
from typing import List, Dict, Any, Tuple

def generate_mid_squares(seed: int, num_digits: int = 4, count: int = 6) -> Tuple[List[float], List[Dict[str, Any]]]:
    """
    Genera números pseudoaleatorios utilizando el Método de Cuadrados Medios (Mid-Square Method).
    
    Lógica matemática:
    1. Se toma una semilla X_0 de 'd' dígitos (usualmente d = 4).
    2. Se calcula el cuadrado de la semilla: Y_0 = X_0^2.
    3. Si Y_0 tiene menos de 2*d dígitos, se rellenan ceros a la izquierda para completar 2*d dígitos.
    4. Se extraen los 'd' dígitos centrales del número obtenido en el paso 3. 
       Estos dígitos forman la siguiente semilla X_1.
    5. El número pseudoaleatorio uniforme U_1 se obtiene dividiendo X_1 entre 10^d (dando un valor entre [0, 1)).
    6. Se repite el proceso recursivamente para X_2, X_3, ..., X_n.
    """
    results: List[float] = []
    history: List[Dict[str, Any]] = []
    
    current_seed = seed
    d = num_digits
    expected_len = 2 * d
    divisor = 10 ** d
    
    for i in range(count):
        squared = current_seed ** 2
        squared_str = str(squared)
        
        # Relleno con ceros a la izquierda si es necesario
        padded_str = squared_str.zfill(expected_len)
        
        # Extracción de los dígitos centrales
        # Si expected_len = 8, extraemos del índice 2 al 6 (4 dígitos)
        start_idx = (len(padded_str) - d) // 2
        end_idx = start_idx + d
        mid_digits_str = padded_str[start_idx:end_idx]
        next_seed = int(mid_digits_str)
        
        ri = next_seed / divisor
        
        history.append({
            "index": i + 1,
            "seed": current_seed,
            "squared": squared,
            "padded": padded_str,
            "extracted": mid_digits_str,
            "ri": ri
        })
        
        results.append(ri)
        current_seed = next_seed
        
    return results, history


def generate_linear_congruential(seed: int, a: int, c: int, m: int, count: int = 6) -> Tuple[List[float], List[Dict[str, Any]]]:
    """
    Genera números pseudoaleatorios utilizando el Método Congruencial Lineal (LCG).
    
    Lógica matemática:
    La relación recursiva está dada por la ecuación:
        X_{n+1} = (a * X_n + c) mod m
    donde:
        X_0 = Semilla (seed > 0)
        a = Multiplicador (a > 0)
        c = Incremento (c >= 0)
        m = Módulo (m > X_0, a, c)
        
    El número pseudoaleatorio uniforme U_{n+1} se obtiene normalizando el valor generado:
        U_{n+1} = X_{n+1} / m
        
    Este método genera números en el intervalo [0, 1). Su periodo máximo es m, lo que ocurre si
    se cumplen las condiciones del Teorema de Hull-Dobell.
    """
    results: List[float] = []
    history: List[Dict[str, Any]] = []
    
    current_x = seed
    
    for i in range(count):
        multiplied_plus_c = a * current_x + c
        next_x = multiplied_plus_c % m
        ri = next_x / m
        
        history.append({
            "index": i + 1,
            "x_n": current_x,
            "calculation": f"({a} * {current_x} + {c}) = {multiplied_plus_c}",
            "x_next": next_x,
            "ri": ri
        })
        
        results.append(ri)
        current_x = next_x
        
    return results, history
