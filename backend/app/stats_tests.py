import math
from typing import List, Dict, Any

# Tabla de valores críticos para la prueba Kolmogorov-Smirnov (alfa = 0.05)
# Fuente: Tablas estándar de K-S para muestras pequeñas
KS_CRITICAL_VALUES_05 = {
    1: 0.975, 2: 0.842, 3: 0.708, 4: 0.624, 5: 0.563,
    6: 0.519, 7: 0.483, 8: 0.454, 9: 0.430, 10: 0.409,
    11: 0.391, 12: 0.375, 13: 0.361, 14: 0.349, 15: 0.338,
    16: 0.327, 17: 0.318, 18: 0.309, 19: 0.301, 20: 0.294,
    25: 0.264, 30: 0.242, 35: 0.224
}

def get_ks_critical_value(n: int, alpha: float = 0.05) -> float:
    """
    Retorna el valor crítico para la prueba de Kolmogorov-Smirnov con un nivel de significancia del 5% (alfa = 0.05).
    Si n es mayor que 35, se utiliza la aproximación asintótica: 1.36 / sqrt(n).
    """
    if alpha != 0.05:
        # Por simplicidad y robustez académica, si piden otro nivel de significancia
        # usamos la aproximación estándar o un valor precalculado.
        return 1.36 / math.sqrt(n)
        
    if n in KS_CRITICAL_VALUES_05:
        return KS_CRITICAL_VALUES_05[n]
    
    # Si n no está en la tabla pero es menor que 35, buscamos el valor más cercano o interpolamos
    if n < 35:
        keys = sorted(KS_CRITICAL_VALUES_05.keys())
        for i in range(len(keys) - 1):
            if keys[i] < n < keys[i+1]:
                # Interpolación lineal simple
                x1, x2 = keys[i], keys[i+1]
                y1, y2 = KS_CRITICAL_VALUES_05[x1], KS_CRITICAL_VALUES_05[x2]
                return y1 + (n - x1) * (y2 - y1) / (x2 - x1)
                
    # Para n >= 35, aproximación asintótica
    return 1.36 / math.sqrt(n)


def run_mean_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Realiza la Prueba de la Media (Mean Test) para verificar la hipótesis de uniformidad.
    
    Lógica matemática:
    - Hipótesis:
        H_0: La media del conjunto de números es igual a 0.5 (μ = 0.5)
        H_1: La media del conjunto de números es diferente de 0.5 (μ != 0.5)
    
    - Estadísticos:
        Promedio muestral (x_bar) = (1 / N) * sum(x_i)
        Varianza teórica del promedio (sigma_x_bar^2) = 1 / (12 * N)
        Desviación estándar teórica (sigma_x_bar) = 1 / sqrt(12 * N)
        Estadístico de prueba (Z_0) = (x_bar - 0.5) / sigma_x_bar
                                     = (x_bar - 0.5) * sqrt(12 * N)
                                     
    - Criterio de aceptación:
        Se acepta H_0 si |Z_0| <= Z_{alpha/2}.
        Para alfa = 0.05 (nivel de significancia del 5%):
            Z_{0.025} = 1.96 (dos colas)
    """
    n = len(numbers)
    if n == 0:
        raise ValueError("La lista de números no puede estar vacía.")
        
    mean = sum(numbers) / n
    
    # Desviación estándar del promedio bajo H_0: sigma_x_bar = 1 / sqrt(12 * N)
    sigma_mean = 1.0 / math.sqrt(12 * n)
    
    # Estadístico Z_0
    z_score = (mean - 0.5) / sigma_mean
    
    # Valor crítico estándar para dos colas con alfa = 0.05
    # (Z_{1 - alpha/2} = Z_0.975 ≈ 1.95996)
    critical_value = 1.96
    
    passed = abs(z_score) <= critical_value
    
    return {
        "test_name": "Prueba de la Media",
        "sample_size": n,
        "mean": round(mean, 6),
        "z_score": round(z_score, 6),
        "critical_value": critical_value,
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"El promedio calculado de los {n} números es {round(mean, 4)}. "
                   f"El estadístico calculado |Z_0| = {round(abs(z_score), 4)} "
                   f"se compara contra el valor crítico Z = {critical_value}. "
                   f"Como |Z_0| {'<=' if passed else '>'} {critical_value}, la hipótesis H_0 es "
                   f"{'ACEPTADA (Los números tienen una media estadísticamente igual a 0.5).' if passed else 'RECHAZADA (La media difiere significativamente de 0.5).'}"
    }


def run_variance_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Realiza la Prueba de la Varianza (Variance Test) para verificar la hipótesis de uniformidad.
    
    Lógica matemática:
    - Hipótesis:
        H_0: La varianza del conjunto de números es igual a 1/12 (σ^2 = 1/12 ≈ 0.083333)
        H_1: La varianza del conjunto de números es diferente de 1/12 (σ^2 != 1/12)
        
    - Estadísticos:
        Varianza muestral (S^2) = (1 / (N - 1)) * sum((x_i - x_bar)^2)
        Estadístico de prueba (Chi^2_0) = ((N - 1) * S^2) / σ^2
                                         = 12 * (N - 1) * S^2
                                         
    - Criterio de aceptación:
        Se acepta H_0 si Chi^2_{1-alpha/2, N-1} <= Chi^2_0 <= Chi^2_{alpha/2, N-1}
        Para N = 6, grados de libertad (df) = 5.
        Bajo alfa = 0.05:
            Límite inferior: Chi^2_{0.975, 5} ≈ 0.831211
            Límite superior: Chi^2_{0.025, 5} ≈ 12.83250
    """
    n = len(numbers)
    if n <= 1:
        raise ValueError("Para calcular la varianza muestral se requieren al menos 2 números.")
        
    mean = sum(numbers) / n
    # Varianza muestral
    sample_variance = sum((x - mean) ** 2 for x in numbers) / (n - 1)
    
    # Varianza teórica de la distribución uniforme U(0,1)
    theoretical_variance = 1.0 / 12.0 # 0.083333...
    
    # Estadístico Chi-cuadrado calculado
    chi_square_score = ((n - 1) * sample_variance) / theoretical_variance
    
    # Valores críticos de Chi-cuadrado para df = n - 1 y alfa = 0.05
    # Por simplicidad y rigurosidad con n = 6: df = 5
    df = n - 1
    
    # Tabla de valores críticos comunes para alfa = 0.05
    # Claves: grados_de_libertad -> (limite_inferior [0.975], limite_superior [0.025])
    chi2_critical_table = {
        1: (0.00098, 5.02389),
        2: (0.05064, 7.37776),
        3: (0.21579, 9.34840),
        4: (0.48442, 11.14329),
        5: (0.83121, 12.83250), # Exactamente n = 6
        6: (1.23734, 14.44938),
        7: (1.68987, 16.01276),
        8: (2.17973, 17.53455),
        9: (2.70039, 19.02277),
        10: (3.24697, 20.48318)
    }
    
    if df in chi2_critical_table:
        lower_crit, upper_crit = chi2_critical_table[df]
    else:
        # Aproximación Wilson-Hilferty para Chi-cuadrado si df > 10
        # Z_inf = -1.96, Z_sup = 1.96
        # chi2 = df * (1 - 2/(9*df) +/- Z * sqrt(2/(9*df)))^3
        def wh_approx(z):
            val = 1.0 - 2.0 / (9.0 * df) + z * math.sqrt(2.0 / (9.0 * df))
            return df * (val ** 3)
        lower_crit = wh_approx(-1.96)
        upper_crit = wh_approx(1.96)
        
    passed = lower_crit <= chi_square_score <= upper_crit
    
    return {
        "test_name": "Prueba de la Varianza",
        "sample_size": n,
        "variance": round(sample_variance, 6),
        "chi_square_score": round(chi_square_score, 6),
        "lower_critical_value": round(lower_crit, 5),
        "upper_critical_value": round(upper_crit, 5),
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"La varianza muestral calculada es {round(sample_variance, 6)} (teórica: {round(theoretical_variance, 6)}). "
                   f"El estadístico calculado es X^2 = {round(chi_square_score, 4)}. "
                   f"El intervalo de aceptación para df = {df} es [{round(lower_crit, 4)}, {round(upper_crit, 4)}]. "
                   f"Como X^2 {'está' if passed else 'no está'} dentro del intervalo, la hipótesis H_0 es "
                   f"{'ACEPTADA (La varianza es estadísticamente igual a 1/12).' if passed else 'RECHAZADA (La varianza difiere significativamente de 1/12).'}"
    }


def run_kolmogorov_smirnov_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Realiza la Prueba de Bondad de Ajuste Kolmogorov-Smirnov (K-S Test) para uniformidad U(0,1).
    
    Lógica matemática:
    - Hipótesis:
        H_0: Los números siguen una distribución uniforme estándar U(0,1).
        H_1: Los números no siguen una distribución uniforme estándar U(0,1).
        
    - Estadísticos:
        1. Se ordenan los N números de menor a mayor: x_(1) <= x_(2) <= ... <= x_(N).
        2. Para cada elemento se calculan las desviaciones de la función de distribución acumulada teórica (F(x) = x):
            D^+_i = i/N - x_(i)       (Distancia por exceso)
            D^-_i = x_(i) - (i-1)/N   (Distancia por defecto)
        3. Se calcula la distancia máxima:
            D = max(D^+_i, D^-_i) para todo i = 1, ..., N.
            
    - Criterio de aceptación:
        Se acepta H_0 si D < D_{alpha, N}.
        Para N = 6 y alfa = 0.05:
            D_{0.05, 6} ≈ 0.519 (o 0.521 según algunas tablas). Usaremos 0.519/0.521.
    """
    n = len(numbers)
    if n == 0:
        raise ValueError("La lista de números no puede estar vacía.")
        
    # Ordenar los números de forma ascendente
    sorted_nums = sorted(numbers)
    
    d_plus_list = []
    d_minus_list = []
    step_details = []
    
    for i in range(n):
        idx_1_based = i + 1
        x_i = sorted_nums[i]
        
        # F(x) esperada para uniforme es el propio x_i
        i_div_n = idx_1_based / n
        i_minus_1_div_n = i / n
        
        d_plus = i_div_n - x_i
        d_minus = x_i - i_minus_1_div_n
        
        d_plus_list.append(d_plus)
        d_minus_list.append(d_minus)
        
        step_details.append({
            "index": idx_1_based,
            "x_i": round(x_i, 6),
            "i_div_n": round(i_div_n, 4),
            "i_minus_1_div_n": round(i_minus_1_div_n, 4),
            "d_plus": round(d_plus, 6),
            "d_minus": round(d_minus, 6)
        })
        
    max_d_plus = max(d_plus_list)
    max_d_minus = max(d_minus_list)
    d_statistic = max(max_d_plus, max_d_minus)
    
    # Obtener el valor crítico
    critical_value = get_ks_critical_value(n, alpha)
    
    passed = d_statistic < critical_value
    
    return {
        "test_name": "Prueba de Kolmogorov-Smirnov",
        "sample_size": n,
        "sorted_numbers": [round(x, 6) for x in sorted_nums],
        "d_statistic": round(d_statistic, 6),
        "d_plus_max": round(max_d_plus, 6),
        "d_minus_max": round(max_d_minus, 6),
        "critical_value": critical_value,
        "passed": bool(passed),
        "alpha": alpha,
        "step_details": step_details,
        "details": f"El valor máximo calculado de la distancia K-S es D = {round(d_statistic, 4)}. "
                   f"El valor crítico correspondiente para N = {n} (alfa = {alpha}) es {critical_value}. "
                   f"Como D {'<' if passed else '>='} {critical_value}, la hipótesis H_0 de uniformidad es "
                   f"{'ACEPTADA (Los números siguen una distribución uniforme estándar).' if passed else 'RECHAZADA (Los números no siguen una distribución uniforme estándar).'}"
    }
