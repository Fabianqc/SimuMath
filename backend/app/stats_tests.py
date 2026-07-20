import math
from typing import List, Dict, Any, Tuple

# Importación de scipy.stats con fallbacks robustos por si scipy se está instalando
try:
    from scipy.stats import norm, chi2, ksone
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False


def _get_norm_critical_value(alpha: float = 0.05) -> float:
    """Retorna Z_{1 - alpha/2} para una prueba de dos colas."""
    if HAS_SCIPY:
        return float(norm.ppf(1.0 - alpha / 2.0))
    # Fallback precalculado para alfa = 0.05
    return 1.95996 if abs(alpha - 0.05) < 1e-4 else 1.96


def _get_chi2_critical_value(df: int, alpha: float = 0.05, tail: str = "upper") -> float:
    """
    Retorna el valor crítico de Chi-cuadrado para df grados de libertad.
    tail: 'upper' para 1-alpha, 'lower' para alpha/2, 'upper_two_tail' para 1-alpha/2.
    """
    if df < 1:
        df = 1
    if HAS_SCIPY:
        prob = (1.0 - alpha / 2.0) if tail == "upper_two_tail" else ((1.0 - alpha) if tail == "upper" else alpha / 2.0)
        return float(chi2.ppf(prob, df))
    
    # Fallback si scipy no estuviera disponible (Aproximación Wilson-Hilferty)
    z = 1.95996 if tail in ("upper", "upper_two_tail") else -1.95996
    val = 1.0 - 2.0 / (9.0 * df) + z * math.sqrt(2.0 / (9.0 * df))
    return max(0.001, df * (val ** 3))


# Tabla de valores críticos K-S (alfa = 0.05)
KS_CRITICAL_VALUES_05 = {
    1: 0.975, 2: 0.842, 3: 0.708, 4: 0.624, 5: 0.563,
    6: 0.519, 7: 0.483, 8: 0.454, 9: 0.430, 10: 0.409,
    11: 0.391, 12: 0.375, 13: 0.361, 14: 0.349, 15: 0.338,
    16: 0.327, 17: 0.318, 18: 0.309, 19: 0.301, 20: 0.294,
    25: 0.264, 30: 0.242, 35: 0.224
}

def get_ks_critical_value(n: int, alpha: float = 0.05) -> float:
    """Valor crítico exacto de Kolmogorov-Smirnov para una cola (alfa = 0.05)."""
    if HAS_SCIPY and abs(alpha - 0.05) < 1e-4 and n <= 100:
        try:
            return float(ksone.ppf(1.0 - alpha, n))
        except Exception:
            pass
            
    if n in KS_CRITICAL_VALUES_05 and abs(alpha - 0.05) < 1e-4:
        return KS_CRITICAL_VALUES_05[n]
        
    if n < 35 and abs(alpha - 0.05) < 1e-4:
        keys = sorted(KS_CRITICAL_VALUES_05.keys())
        for i in range(len(keys) - 1):
            if keys[i] < n < keys[i+1]:
                x1, x2 = keys[i], keys[i+1]
                y1, y2 = KS_CRITICAL_VALUES_05[x1], KS_CRITICAL_VALUES_05[x2]
                return y1 + (n - x1) * (y2 - y1) / (x2 - x1)
                
    # Aproximación asintótica estándar
    return 1.36 / math.sqrt(n)


# =====================================================================
# 1. PRUEBA DE MEDIAS (Mean Test)
# =====================================================================
def run_mean_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Prueba de la Media para uniformidad U(0,1).
    H0: mu = 0.5 vs H1: mu != 0.5
    Estadístico Z_0 = (x_bar - 0.5) * sqrt(12 * N)
    """
    n = len(numbers)
    if n == 0:
        raise ValueError("La lista de números no puede estar vacía.")
        
    mean = sum(numbers) / n
    sigma_mean = 1.0 / math.sqrt(12.0 * n)
    z_score = (mean - 0.5) / sigma_mean
    
    crit_z = _get_norm_critical_value(alpha)
    lower_limit = 0.5 - crit_z * sigma_mean
    upper_limit = 0.5 + crit_z * sigma_mean
    
    passed = abs(z_score) <= crit_z
    
    return {
        "test_name": "Prueba de Medias",
        "sample_size": n,
        "mean": round(mean, 6),
        "z_score": round(z_score, 6),
        "critical_value": round(crit_z, 4),
        "lower_limit": round(lower_limit, 6),
        "upper_limit": round(upper_limit, 6),
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"Promedio muestral (x̄) = {round(mean, 6)}. "
                   f"Estadístico |Z₀| = {round(abs(z_score), 4)} vs Valor Crítico Z_{{α/2}} = {round(crit_z, 4)}. "
                   f"Intervalo de aceptación para la media: [{round(lower_limit, 6)}, {round(upper_limit, 6)}]. "
                   f"Hipótesis H₀ (µ = 0.5) {'ACEPTADA' if passed else 'RECHAZADA'}."
    }


# =====================================================================
# 2. PRUEBA DE VARIANZA (Variance Test)
# =====================================================================
def run_variance_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Prueba de Varianza para uniformidad U(0,1).
    H0: sigma^2 = 1/12 vs H1: sigma^2 != 1/12
    Estadístico Chi^2_0 = 12 * (N - 1) * S^2
    """
    n = len(numbers)
    if n <= 1:
        raise ValueError("La prueba de varianza requiere al menos 2 números.")
        
    mean = sum(numbers) / n
    sample_variance = sum((x - mean) ** 2 for x in numbers) / (n - 1)
    
    df = n - 1
    chi_square_score = 12.0 * df * sample_variance
    
    lower_crit_chi = _get_chi2_critical_value(df, alpha, tail="lower")
    upper_crit_chi = _get_chi2_critical_value(df, alpha, tail="upper_two_tail")
    
    lower_var_limit = lower_crit_chi / (12.0 * df)
    upper_var_limit = upper_crit_chi / (12.0 * df)
    
    passed = lower_crit_chi <= chi_square_score <= upper_crit_chi
    
    return {
        "test_name": "Prueba de Varianza",
        "sample_size": n,
        "variance": round(sample_variance, 6),
        "chi_square_score": round(chi_square_score, 6),
        "degrees_of_freedom": df,
        "lower_critical_value": round(lower_crit_chi, 5),
        "upper_critical_value": round(upper_crit_chi, 5),
        "lower_var_limit": round(lower_var_limit, 6),
        "upper_var_limit": round(upper_var_limit, 6),
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"Varianza muestral (S²) = {round(sample_variance, 6)}. "
                   f"Estadístico X²₀ = {round(chi_square_score, 4)} (gl = {df}). "
                   f"Intervalo crítico para X²: [{round(lower_crit_chi, 4)}, {round(upper_crit_chi, 4)}]. "
                   f"Intervalo de aceptación para S²: [{round(lower_var_limit, 6)}, {round(upper_var_limit, 6)}]. "
                   f"Hipótesis H₀ (σ² = 1/12) {'ACEPTADA' if passed else 'RECHAZADA'}."
    }


# =====================================================================
# 3. PRUEBA DE SMIRNOV (Kolmogorov-Smirnov Test)
# =====================================================================
def run_kolmogorov_smirnov_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Prueba Kolmogorov-Smirnov (Smirnov) para uniformidad U(0,1).
    H0: Los números siguen una distribución U(0,1).
    Estadístico D = max(D+, D-)
    """
    n = len(numbers)
    if n == 0:
        raise ValueError("La lista de números no puede estar vacía.")
        
    sorted_nums = sorted(numbers)
    
    d_plus_list = []
    d_minus_list = []
    step_details = []
    
    for i in range(n):
        idx_1_based = i + 1
        x_i = sorted_nums[i]
        
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
    
    critical_value = get_ks_critical_value(n, alpha)
    passed = d_statistic < critical_value
    
    return {
        "test_name": "Prueba de Smirnov (K-S)",
        "sample_size": n,
        "sorted_numbers": [round(x, 6) for x in sorted_nums],
        "d_statistic": round(d_statistic, 6),
        "d_plus_max": round(max_d_plus, 6),
        "d_minus_max": round(max_d_minus, 6),
        "critical_value": round(critical_value, 5),
        "passed": bool(passed),
        "alpha": alpha,
        "step_details": step_details,
        "details": f"Distancia máxima D calculada = {round(d_statistic, 6)}. "
                   f"Valor crítico K-S (N={n}, α={alpha}) = {round(critical_value, 5)}. "
                   f"Como D {'<' if passed else '>='} D_crítico, la hipótesis H₀ de uniformidad es {'ACEPTADA' if passed else 'RECHAZADA'}."
    }


# =====================================================================
# 4. PRUEBA DE PÓKER (Poker Test)
# =====================================================================
def run_poker_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Prueba de Póker para uniformidad de dígitos decimales en U(0,1).
    Clasifica los 4 dígitos decimales de cada número R_i.
    
    Aplica el Criterio de Agrupación Formal de Chi-cuadrada (Regla de Oro: E_k >= 5):
    - Si N < 100 (frecuencias esperadas de tercias/póker < 5), agrupa formalmente en 2 categorías:
      1. Todos Diferentes (TD): p = 0.5040
      2. Con Alguna Repetición (AR - Par, Dos Pares, Tercia, Póker): p = 0.4960
    - Si N >= 100 (E_k >= 5 para categorías individuales), evalúa las 5 categorías detalladas.
    """
    n = len(numbers)
    if n == 0:
        raise ValueError("La lista de números no puede estar vacía.")

    # Clasificar cada número
    raw_counts = {"TD": 0, "1P": 0, "2P": 0, "T": 0, "P": 0}

    for num in numbers:
        val_int = int(round((num % 1.0) * 10000))
        digits_str = f"{val_int:04d}"[:4]
        digits = [int(d) for d in digits_str]
        
        counts = {}
        for d in digits:
            counts[d] = counts.get(d, 0) + 1
            
        freq_pattern = sorted(counts.values(), reverse=True)
        
        if freq_pattern == [1, 1, 1, 1]:
            category = "TD"
        elif freq_pattern == [2, 1, 1]:
            category = "1P"
        elif freq_pattern == [2, 2]:
            category = "2P"
        elif freq_pattern == [3, 1]:
            category = "T"
        elif freq_pattern == [4]:
            category = "P"
        else:
            category = "TD"

        raw_counts[category] += 1

    # Determinar si aplicamos agrupación formal (E_k < 5)
    use_grouping = n < 100

    if use_grouping:
        # Agrupación estadística formal para N < 100
        prob_map = {
            "TD": 0.5040,
            "AR": 0.4960  # 0.4320 + 0.0270 + 0.0360 + 0.0010
        }
        observed_counts = {
            "TD": raw_counts["TD"],
            "AR": raw_counts["1P"] + raw_counts["2P"] + raw_counts["T"] + raw_counts["P"]
        }
        name_map = {
            "TD": "Todos Diferentes",
            "AR": "Con Alguna Repetición (Par/Tercia/Póker)"
        }
    else:
        # Categorías detalladas completas para N >= 100
        prob_map = {
            "TD": 0.5040, "1P": 0.4320, "2P": 0.0270, "T": 0.0360, "P": 0.0010
        }
        observed_counts = raw_counts
        name_map = {
            "TD": "Todos Diferentes", "1P": "Un Par", "2P": "Dos Pares",
            "T": "Tercia", "P": "Póker (4 Iguales)"
        }

    categories_detail = []
    chi_square_score = 0.0

    for cat, prob in prob_map.items():
        obs = observed_counts[cat]
        exp = n * prob
        diff = obs - exp
        term = (diff ** 2) / exp if exp > 0 else 0.0
        chi_square_score += term

        categories_detail.append({
            "category": cat,
            "name": name_map[cat],
            "probability": prob,
            "observed": obs,
            "expected": round(exp, 4),
            "chi_term": round(term, 6)
        })

    df = len(prob_map) - 1 # df = 1 para agrupar, df = 4 sin agrupar
    crit_chi = _get_chi2_critical_value(df, alpha, tail="upper")
    passed = chi_square_score <= crit_chi

    grouping_note = " (Agrupación formal aplicada por E < 5)" if use_grouping else ""

    return {
        "test_name": "Prueba de Póker",
        "sample_size": n,
        "chi_square_score": round(chi_square_score, 6),
        "critical_value": round(crit_chi, 5),
        "degrees_of_freedom": df,
        "categories": categories_detail,
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"Estadístico X² calculado = {round(chi_square_score, 4)} vs Valor Crítico X²({df}, α={alpha}) = {round(crit_chi, 4)}{grouping_note}. "
                   f"Hipótesis H₀ de independencia de dígitos decimales {'ACEPTADA' if passed else 'RECHAZADA'}."
    }





# =====================================================================
# 5. PRUEBA DE SERIE (Series Test)
# =====================================================================
def run_series_test(numbers: List[float], alpha: float = 0.05, m: int = 2) -> Dict[str, Any]:
    """
    Prueba de Serie (Test de Pares 2D).
    Evalúa la independencia de pares no solapados (R_1, R_2), (R_3, R_4), ... en una cuadrícula m x m.
    H0: Los pares están uniformemente distribuidos en el plano [0,1] x [0,1].
    """
    n = len(numbers)
    if n < 2:
        raise ValueError("La prueba de serie requiere al menos 2 números.")

    pairs = [(numbers[i], numbers[i+1]) for i in range(0, n - 1, 2)]
    num_pairs = len(pairs)

    grid_count = { (i, j): 0 for i in range(m) for j in range(m) }

    for u1, u2 in pairs:
        row = min(int(u1 * m), m - 1)
        col = min(int(u2 * m), m - 1)
        grid_count[(row, col)] += 1

    expected_per_cell = num_pairs / (m * m)
    chi_square_score = 0.0
    cells_detail = []

    for (row, col), obs in grid_count.items():
        diff = obs - expected_per_cell
        term = (diff ** 2) / expected_per_cell if expected_per_cell > 0 else 0.0
        chi_square_score += term

        cells_detail.append({
            "cell": f"[{row/m:.2f}-{(row+1)/m:.2f}) x [{col/m:.2f}-{(col+1)/m:.2f})",
            "observed": obs,
            "expected": round(expected_per_cell, 4),
            "chi_term": round(term, 6)
        })

    df = (m * m) - 1
    crit_chi = _get_chi2_critical_value(df, alpha, tail="upper")
    passed = chi_square_score <= crit_chi

    return {
        "test_name": "Prueba de Serie",
        "sample_size": n,
        "num_pairs": num_pairs,
        "grid_size": f"{m}x{m}",
        "chi_square_score": round(chi_square_score, 6),
        "critical_value": round(crit_chi, 5),
        "degrees_of_freedom": df,
        "cells": cells_detail,
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"Total de pares (N/2) = {num_pairs}. "
                   f"Estadístico X² calculado = {round(chi_square_score, 4)} vs Valor Crítico X²({df}, α={alpha}) = {round(crit_chi, 4)}. "
                   f"Hipótesis H₀ de independencia en pares 2D {'ACEPTADA' if passed else 'RECHAZADA'}."
    }


# =====================================================================
# 6. PRUEBA DE HUECOS (Gap Test)
# =====================================================================
def run_gap_test(numbers: List[float], alpha: float = 0.05, a: float = 0.2, b: float = 0.8) -> Dict[str, Any]:
    """
    Prueba de Huecos (Gap Test).
    Evalúa la longitud de rachas de ceros (huecos) entre apariciones de números en [a, b].
    H0: La longitud de los huecos sigue una distribución geométrica con p = b - a.
    """
    n = len(numbers)
    if n == 0:
        raise ValueError("La lista de números no puede estar vacía.")

    p = b - a
    if p <= 0 or p >= 1:
        raise ValueError("El intervalo [a, b] debe cumplir 0 < b - a < 1.")

    binary_seq = [1 if a <= x <= b else 0 for x in numbers]

    gap_lengths = []
    current_gap = 0
    in_gap = False

    for bit in binary_seq:
        if bit == 1:
            if in_gap:
                gap_lengths.append(current_gap)
                current_gap = 0
            else:
                in_gap = True
                current_gap = 0
        else:
            if in_gap:
                current_gap += 1

    total_gaps = len(gap_lengths)

    if total_gaps == 0:
        return {
            "test_name": "Prueba de Huecos",
            "sample_size": n,
            "interval": f"[{a}, {b}]",
            "total_gaps": 0,
            "chi_square_score": 0.0,
            "critical_value": round(_get_chi2_critical_value(2, alpha, tail="upper"), 5),
            "degrees_of_freedom": 2,
            "gap_counts": [],
            "passed": True,
            "alpha": alpha,
            "details": f"No se observaron huecos completos suficientes en la muestra (N={n}) para el intervalo [{a}, {b}]. "
                       f"Aumenta la muestra N para una mayor precisión estadística."
        }

    max_k = 3
    gap_bins = {k: 0 for k in range(max_k + 1)}

    for gap in gap_lengths:
        if gap >= max_k:
            gap_bins[max_k] += 1
        else:
            gap_bins[gap] += 1

    chi_square_score = 0.0
    gap_counts_detail = []

    for k in range(max_k + 1):
        obs = gap_bins[k]
        prob_k = (p * ((1.0 - p) ** k)) if k < max_k else ((1.0 - p) ** max_k)
        exp = total_gaps * prob_k
        diff = obs - exp
        term = (diff ** 2) / exp if exp > 0 else 0.0
        chi_square_score += term

        gap_counts_detail.append({
            "gap_length": f"{k}" if k < max_k else f">={max_k}",
            "observed": obs,
            "probability": round(prob_k, 4),
            "expected": round(exp, 4),
            "chi_term": round(term, 6)
        })

    df = max_k
    crit_chi = _get_chi2_critical_value(df, alpha, tail="upper")
    passed = chi_square_score <= crit_chi

    return {
        "test_name": "Prueba de Huecos",
        "sample_size": n,
        "interval": f"[{a}, {b}]",
        "total_gaps": total_gaps,
        "chi_square_score": round(chi_square_score, 6),
        "critical_value": round(crit_chi, 5),
        "degrees_of_freedom": df,
        "gap_counts": gap_counts_detail,
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"Total de huecos observados = {total_gaps} en el intervalo [{a}, {b}]. "
                   f"Estadístico X² calculado = {round(chi_square_score, 4)} vs Valor Crítico X²({df}, α={alpha}) = {round(crit_chi, 4)}. "
                   f"Hipótesis H₀ de distribución de huecos {'ACEPTADA' if passed else 'RECHAZADA'}."
    }


# =====================================================================
# 7. PRUEBA DE CORRIDAS ARRIBA Y ABAJO (Runs Up and Down Test)
# =====================================================================
def run_runs_up_down_test(numbers: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Prueba de Corridas Arriba y Abajo (Runs Up and Down Test).
    Genera la secuencia de signos: + si R_{i+1} > R_i, - si R_{i+1} <= R_i.
    Estadísticos teóricos bajo H0:
        Media mu_b = (2N - 1) / 3
        Varianza sigma_b^2 = (16N - 29) / 90
        Z_0 = (b - mu_b) / sigma_b
    """
    n = len(numbers)
    if n <= 1:
        raise ValueError("La prueba de corridas arriba y abajo requiere al menos 2 números.")

    signs = []
    for i in range(n - 1):
        signs.append("+" if numbers[i+1] > numbers[i] else "-")

    b = 1
    for i in range(len(signs) - 1):
        if signs[i] != signs[i+1]:
            b += 1

    expected_mean = (2.0 * n - 1.0) / 3.0
    expected_variance = (16.0 * n - 29.0) / 90.0
    sigma_b = math.sqrt(expected_variance)

    z_score = (b - expected_mean) / sigma_b if sigma_b > 0 else 0.0
    crit_z = _get_norm_critical_value(alpha)
    passed = abs(z_score) <= crit_z

    return {
        "test_name": "Prueba de Corridas Arriba y Abajo",
        "sample_size": n,
        "runs_count": b,
        "expected_mean": round(expected_mean, 4),
        "expected_variance": round(expected_variance, 6),
        "z_score": round(z_score, 6),
        "critical_value": round(crit_z, 4),
        "signs_sequence": "".join(signs),
        "passed": bool(passed),
        "alpha": alpha,
        "details": f"Número de corridas observadas (b) = {b} (Esperado: µ_b = {round(expected_mean, 4)}, Var: σ²_b = {round(expected_variance, 4)}). "
                   f"Estadístico |Z₀| = {round(abs(z_score), 4)} vs Valor Crítico Z = {round(crit_z, 4)}. "
                   f"Hipótesis H₀ de independencia y ausencia de tendencias {'ACEPTADA' if passed else 'RECHAZADA'}."
    }
