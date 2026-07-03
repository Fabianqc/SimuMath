import sys
import os

# Añadir el directorio actual al path para poder importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.generators import generate_mid_squares, generate_linear_congruential
from app.stats_tests import run_mean_test, run_variance_test, run_kolmogorov_smirnov_test

def test_generators_and_tests():
    print("--- Probando generador de Cuadrados Medios (Semilla 3708, d=4) ---")
    nums, hist = generate_mid_squares(3708, 4, 6)
    print(f"Números generados: {nums}")
    for item in hist:
        print(f"Paso {item['index']}: Semilla: {item['seed']} -> Cuadrado: {item['squared']} -> Extracción: {item['extracted']} -> R_i: {item['ri']}")
        
    print("\n--- Corriendo Pruebas Estadísticas para Cuadrados Medios ---")
    m_test = run_mean_test(nums)
    print(f"Prueba de la Media: Aprobada={m_test['passed']}, Z_score={m_test['z_score']}")
    
    v_test = run_variance_test(nums)
    print(f"Prueba de la Varianza: Aprobada={v_test['passed']}, Chi2_score={v_test['chi_square_score']}")
    
    ks_test = run_kolmogorov_smirnov_test(nums)
    print(f"Prueba Kolmogorov-Smirnov: Aprobada={ks_test['passed']}, D={ks_test['d_statistic']}, Crítico={ks_test['critical_value']}")

    print("\n--- Probando generador Congruencial Lineal (LCG: X0=4, a=5, c=7, m=8) ---")
    nums_lcg, hist_lcg = generate_linear_congruential(4, 5, 7, 8, 6)
    print(f"Números generados: {nums_lcg}")
    for item in hist_lcg:
        print(f"Paso {item['index']}: X_n: {item['x_n']} -> {item['calculation']} -> X_next: {item['x_next']} -> R_i: {item['ri']}")

    print("\n--- Corriendo Pruebas Estadísticas para LCG ---")
    m_test_lcg = run_mean_test(nums_lcg)
    print(f"Prueba de la Media: Aprobada={m_test_lcg['passed']}, Z_score={m_test_lcg['z_score']}")
    
    v_test_lcg = run_variance_test(nums_lcg)
    print(f"Prueba de la Varianza: Aprobada={v_test_lcg['passed']}, Chi2_score={v_test_lcg['chi_square_score']}")
    
    ks_test_lcg = run_kolmogorov_smirnov_test(nums_lcg)
    print(f"Prueba Kolmogorov-Smirnov: Aprobada={ks_test_lcg['passed']}, D={ks_test_lcg['d_statistic']}, Crítico={ks_test_lcg['critical_value']}")

if __name__ == "__main__":
    test_generators_and_tests()
