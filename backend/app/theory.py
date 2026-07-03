import random
from typing import List, Dict, Any, Tuple

class InverseTransformDiscrete:
    """
    Clase que demuestra e implementa el Método de la Transformada Inversa
    para variables aleatorias discretas.
    
    Lógica Matemática:
    Dado una variable aleatoria discreta X que toma valores x_1, x_2, ..., x_k 
    con probabilidades p_1, p_2, ..., p_k (tales que sum(p_i) = 1):
    
    1. Se calcula la Función de Distribución Acumulada (CDF):
       F(x_j) = P(X <= x_j) = sum_{i=1}^{j} p_i
    
    2. Se genera un número pseudoaleatorio uniforme U ~ U(0, 1).
    
    3. Se selecciona el valor x_j para el cual se cumple que:
       F(x_{j-1}) < U <= F(x_j)  (donde F(x_0) = 0).
       Es decir, se encuentra el menor índice j tal que F(x_j) >= U.
       
    4. Se retorna x_j como el valor generado de la variable aleatoria.
    """
    
    def __init__(self, values: List[Any], probabilities: List[float]):
        if len(values) != len(probabilities):
            raise ValueError("La lista de valores y de probabilidades deben tener el mismo tamaño.")
        
        # Validar que las probabilidades sean positivas y sumen aproximadamente 1
        if any(p < 0 for p in probabilities):
            raise ValueError("Las probabilidades no pueden ser negativas.")
            
        sum_p = sum(probabilities)
        if not math_approx_equal(sum_p, 1.0, tolerance=1e-5):
            raise ValueError(f"La suma de las probabilidades debe ser igual a 1 (suma actual: {sum_p}).")
            
        self.values = values
        self.probabilities = probabilities
        
        # Calcular la distribución acumulada (CDF)
        self.cdf: List[float] = []
        cumulative = 0.0
        for p in self.probabilities:
            cumulative += p
            self.cdf.append(cumulative)
            
    def generate_single(self, u: float = None) -> Tuple[Any, float, int]:
        """
        Genera un único valor usando un número uniforme u en [0,1).
        Si u es None, se genera uno nuevo usando random.random().
        Retorna una tupla (valor_generado, u_utilizado, indice_seleccionado).
        """
        if u is None:
            u = random.random()
            
        # Encontrar el menor índice j tal que cdf[j] >= u
        for index, cumulative_prob in enumerate(self.cdf):
            if u <= cumulative_prob:
                return self.values[index], u, index
                
        # Caso de borde por precisión numérica
        return self.values[-1], u, len(self.values) - 1

    def generate_batch(self, count: int = 6) -> List[Dict[str, Any]]:
        """
        Genera un lote de valores discretos con trazabilidad completa de pasos.
        """
        results = []
        for i in range(count):
            u = random.random()
            val, u_used, idx = self.generate_single(u)
            
            # Construir explicación paso a paso
            intervals_str = []
            prev_cdf = 0.0
            for k in range(len(self.cdf)):
                intervals_str.append(f"Val: {self.values[k]} (Rango: [{round(prev_cdf, 4)}, {round(self.cdf[k], 4)}])")
                prev_cdf = self.cdf[k]
                
            results.append({
                "iteration": i + 1,
                "u": round(u_used, 6),
                "selected_value": val,
                "index_selected": idx,
                "cdf": [round(x, 4) for x in self.cdf],
                "explanation": f"U = {round(u_used, 4)} cae en el intervalo {idx+1}. "
                               f"Por lo tanto, se selecciona el valor '{val}'."
            })
        return results


class CompositionMethod:
    """
    Clase que demuestra e implementa el Método de Composición (o Mezcla de Distribuciones).
    
    Lógica Matemática:
    Este método se aplica cuando la función de densidad f(x) o de distribución F(x) 
    de la variable aleatoria que deseamos simular se puede expresar como una 
    combinación lineal de otras funciones de distribución conocidas:
    
        F(x) = sum_{j=1}^{k} p_j * F_j(x)
        
    donde:
        p_j > 0 son las probabilidades de mezcla (pesos), tales que sum_{j=1}^{k} p_j = 1.
        F_j(x) son distribuciones acumuladas conocidas de las cuales es fácil generar números.
        
    Algoritmo de generación:
    1. Se genera un número aleatorio discreto J en el conjunto {1, 2, ..., k} 
       usando las probabilidades {p_1, p_2, ..., p_k} (método de la transformada inversa).
    2. Con base en el valor de J obtenido, se genera un número pseudoaleatorio X 
       proveniente de la distribución correspondiente F_J(x).
    3. Se retorna X.
    """
    
    def __init__(self):
        # Para demostración práctica, crearemos una mezcla de dos distribuciones uniformes:
        # Uniforme 1: U(0, 5) con peso 0.4
        # Uniforme 2: U(10, 20) con peso 0.6
        self.weights = [0.4, 0.6]
        # Usamos el generador discreto para seleccionar cuál distribución usar
        self.selector = InverseTransformDiscrete(values=[0, 1], probabilities=self.weights)
        
    def generate_single(self) -> Tuple[float, float, int, float, str]:
        """
        Genera un número usando composición de dos uniformes.
        Retorna (valor_generado, u1, distribucion_elegida, u2, explicacion)
        """
        # 1. Seleccionar la distribución usando U1
        u1 = random.random()
        dist_idx, _, _ = self.selector.generate_single(u1)
        
        # 2. Generar el valor en la distribución elegida usando U2
        u2 = random.random()
        
        if dist_idx == 0:
            # Generar de U(0, 5) -> x = a + (b - a)*u2 = 0 + 5*u2
            x = 5.0 * u2
            explanation = f"Con U1 = {round(u1, 4)} se eligió la Distribución 1: U(0, 5) (peso 0.4). Con U2 = {round(u2, 4)} se generó X = 5 * {round(u2, 4)} = {round(x, 4)}."
        else:
            # Generar de U(10, 20) -> x = a + (b - a)*u2 = 10 + 10*u2
            x = 10.0 + 10.0 * u2
            explanation = f"Con U1 = {round(u1, 4)} se eligió la Distribución 2: U(10, 20) (peso 0.6). Con U2 = {round(u2, 4)} se generó X = 10 + 10 * {round(u2, 4)} = {round(x, 4)}."
            
        return x, u1, dist_idx, u2, explanation

    def generate_batch(self, count: int = 6) -> List[Dict[str, Any]]:
        results = []
        for i in range(count):
            x, u1, dist, u2, explanation = self.generate_single()
            results.append({
                "iteration": i + 1,
                "value": round(x, 6),
                "u1": round(u1, 6),
                "distribution_chosen": dist + 1,
                "u2": round(u2, 6),
                "explanation": explanation
            })
        return results


def math_approx_equal(a: float, b: float, tolerance: float = 1e-9) -> bool:
    return abs(a - b) < tolerance
