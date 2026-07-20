import sys
import os

# Añadir el directorio actual al path para poder importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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

def test_generators_and_tests():
    print("=== PROBANDO GENERADOR DE CUADRADOS MEDIOS (Semilla 3708, d=4, N=20) ===")
    nums, hist = generate_mid_squares(3708, 4, 20)
    print(f"Números generados ({len(nums)}): {nums[:5]}...")
    
    print("\n--- Ejecutando las 7 Pruebas Estadísticas para Cuadrados Medios ---")
    m_test = run_mean_test(nums)
    print(f"1. Prueba de Medias: Aprobada={m_test['passed']}, Z_score={m_test['z_score']}, Limites=[{m_test['lower_limit']}, {m_test['upper_limit']}]")
    
    v_test = run_variance_test(nums)
    print(f"2. Prueba de Varianza: Aprobada={v_test['passed']}, Chi2_score={v_test['chi_square_score']}, Críticos=[{v_test['lower_critical_value']}, {v_test['upper_critical_value']}]")
    
    ks_test = run_kolmogorov_smirnov_test(nums)
    print(f"3. Prueba de Smirnov (K-S): Aprobada={ks_test['passed']}, D={ks_test['d_statistic']}, Crítico={ks_test['critical_value']}")
    
    poker_test = run_poker_test(nums)
    print(f"4. Prueba de Póker: Aprobada={poker_test['passed']}, Chi2_score={poker_test['chi_square_score']}, Crítico={poker_test['critical_value']}")
    
    series_test = run_series_test(nums)
    print(f"5. Prueba de Serie: Aprobada={series_test['passed']}, Pares={series_test['num_pairs']}, Chi2_score={series_test['chi_square_score']}, Crítico={series_test['critical_value']}")
    
    gap_test = run_gap_test(nums)
    print(f"6. Prueba de Huecos: Aprobada={gap_test['passed']}, Total Huecos={gap_test['total_gaps']}, Chi2_score={gap_test['chi_square_score']}, Crítico={gap_test['critical_value']}")
    
    runs_test = run_runs_up_down_test(nums)
    print(f"7. Prueba de Corridas Arriba/Abajo: Aprobada={runs_test['passed']}, Corridas={runs_test['runs_count']}, Z_score={runs_test['z_score']}, Crítico={runs_test['critical_value']}")

    print("\n=== PROBANDO GENERADOR CONGRUENCIA LINEAL (LCG: X0=17, a=101, c=43, m=1000, N=30) ===")
    nums_lcg, hist_lcg = generate_linear_congruential(17, 101, 43, 1000, 30)
    print(f"Números generados ({len(nums_lcg)}): {nums_lcg[:5]}...")

    print("\n--- Ejecutando las 7 Pruebas Estadísticas para LCG ---")
    print(f"1. Medias: Aprobada={run_mean_test(nums_lcg)['passed']}")
    print(f"2. Varianza: Aprobada={run_variance_test(nums_lcg)['passed']}")
    print(f"3. Smirnov (K-S): Aprobada={run_kolmogorov_smirnov_test(nums_lcg)['passed']}")
    print(f"4. Póker: Aprobada={run_poker_test(nums_lcg)['passed']}")
    print(f"5. Serie: Aprobada={run_series_test(nums_lcg)['passed']}")
    print(f"6. Huecos: Aprobada={run_gap_test(nums_lcg)['passed']}")
    print(f"7. Corridas Arriba/Abajo: Aprobada={run_runs_up_down_test(nums_lcg)['passed']}")

if __name__ == "__main__":
    test_generators_and_tests()
