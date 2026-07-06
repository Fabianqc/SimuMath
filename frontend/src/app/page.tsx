"use client";

import React, { useState } from "react";
import { 
  Play, 
  Settings, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  TrendingUp, 
  RefreshCw,
  Percent,
  Sliders,
  ChevronRight,
  Info
} from "lucide-react";

// Icono de GitHub personalizado
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

// Interfaces para tipado
interface StepDetailKS {
  index: number;
  x_i: number;
  i_div_n: number;
  i_minus_1_div_n: number;
  d_plus: number;
  d_minus: number;
}

interface TestResult {
  test_name: string;
  sample_size: number;
  passed: boolean;
  alpha: number;
  details: string;
  mean?: number;
  z_score?: number;
  critical_value?: number;
  variance?: number;
  chi_square_score?: number;
  lower_critical_value?: number;
  upper_critical_value?: number;
  d_statistic?: number;
  d_plus_max?: number;
  d_minus_max?: number;
  sorted_numbers?: number[];
  step_details?: StepDetailKS[];
}

interface HistoryRow {
  index: number;
  seed?: string | number;
  squared?: string | number;
  extracted?: string | number;
  x_n?: number;
  calculation?: string | number;
  x_next?: number;
  ri: number;
}

interface BackendResponse {
  generated_numbers: number[];
  history: HistoryRow[];
  tests: {
    mean_test: TestResult;
    variance_test: TestResult;
    ks_test: TestResult;
  };
}

interface TheoryResultRow {
  iteration: number;
  u: number;
  cdf: number[];
  index_selected: number;
  selected_value: string | number;
  u1: number;
  distribution_chosen: number;
  u2: number;
  value: number;
  explanation: string;
}

interface TheoryResponse {
  method: string;
  definition: string;
  results: TheoryResultRow[];
  mixture_details?: {
    distribution_1: string;
    distribution_2: string;
  };
}

export default function Home() {
  // Configuración de Generadores
  const [generatorType, setGeneratorType] = useState<"mid-squares" | "lcg">("mid-squares");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BackendResponse | null>(null);

  // Parámetros de Cuadrados Medios
  const [midSquareSeed, setMidSquareSeed] = useState("3708");
  const [midSquareDigits, setMidSquareDigits] = useState("4");
  const [midSquareCount, setMidSquareCount] = useState("6");

  // Parámetros de LCG
  const [lcgSeed, setLcgSeed] = useState("4");
  const [lcgA, setLcgA] = useState("5");
  const [lcgC, setLcgC] = useState("7");
  const [lcgM, setLcgM] = useState("8");
  const [lcgCount, setLcgCount] = useState("6");

  // Controladores de UI
  const [showKSDetails, setShowKSDetails] = useState(false);
  const [showTheorySection, setShowTheorySection] = useState(false);

  // Estados de la sección teórica (Composición e Inversión)
  const [theoryLoading, setTheoryLoading] = useState(false);
  const [theoryType, setTheoryType] = useState<"inverse" | "composition">("inverse");
  const [theoryData, setTheoryData] = useState<TheoryResponse | null>(null);

  const [discreteValues, setDiscreteValues] = useState("Sol, Nubes, Lluvia");
  const [discreteProbs, setDiscreteProbs] = useState("0.2, 0.5, 0.3");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setShowKSDetails(false);

    try {
      let response;
      if (generatorType === "mid-squares") {
        const payload = {
          seed: parseInt(midSquareSeed, 10),
          num_digits: parseInt(midSquareDigits, 10),
          count: parseInt(midSquareCount, 10)
        };

        response = await fetch(`${backendUrl}/api/generate/mid-square`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        const payload = {
          seed: parseInt(lcgSeed, 10),
          a: parseInt(lcgA, 10),
          c: parseInt(lcgC, 10),
          m: parseInt(lcgM, 10),
          count: parseInt(lcgCount, 10)
        };

        response = await fetch(`${backendUrl}/api/generate/congruential`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error en el servidor backend.");
      }

      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "No se pudo conectar con el servidor backend. Asegúrate de que FastAPI esté corriendo.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTheory = async () => {
    setTheoryLoading(true);
    setError(null);
    setTheoryData(null);

    try {
      let response;
      if (theoryType === "inverse") {
        const vals = discreteValues.split(",").map(s => s.trim());
        const probs = discreteProbs.split(",").map(s => parseFloat(s.trim()));

        if (vals.length !== probs.length) {
          throw new Error("El número de valores y probabilidades debe coincidir.");
        }

        response = await fetch(`${backendUrl}/api/theory/inverse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values: vals, probabilities: probs, count: 6 })
        });
      } else {
        response = await fetch(`${backendUrl}/api/theory/composition?count=6`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error en el servidor backend.");
      }

      setTheoryData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al conectar con la API.";
      setError(errorMessage);
    } finally {
      setTheoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* Header Institucional y Limpio */}
      <header className="border-b border-slate-200 bg-white py-4 px-6 md:px-8 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                SimuMath
              </h1>
              <p className="text-xs text-slate-500 font-medium">Plataforma Académica de Simulación y Validación Estadística</p>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowTheorySection(!showTheorySection)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 flex items-center gap-2 ${
                showTheorySection 
                  ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" 
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {showTheorySection ? "Volver a Generadores" : "Métodos Teóricos (Composición/Inversión)"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Banner de error limpio */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-xs">
            <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Error de Validación o Conexión</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {!showTheorySection ? (
          /* PESTAÑA PRINCIPAL: GENERADORES Y PRUEBAS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Panel Izquierdo: Configuración */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-slate-400" />
                    Parámetros del Generador
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configura los coeficientes de las variables del simulador.</p>
                </div>

                {/* Switch de Generadores */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    onClick={() => { setGeneratorType("mid-squares"); setError(null); }}
                    className={`py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                      generatorType === "mid-squares"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Cuadrados Medios
                  </button>
                  <button
                    onClick={() => { setGeneratorType("lcg"); setError(null); }}
                    className={`py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                      generatorType === "lcg"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Congruencial Lineal
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleGenerate} className="space-y-4">
                  {generatorType === "mid-squares" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Semilla inicial (X₀)</label>
                        <input
                          type="number"
                          value={midSquareSeed}
                          onChange={(e) => setMidSquareSeed(e.target.value)}
                          placeholder="Ej: 3708"
                          className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Dígitos (d)</label>
                          <select
                            value={midSquareDigits}
                            onChange={(e) => setMidSquareDigits(e.target.value)}
                            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-2.5 py-2 text-sm outline-none transition-all"
                          >
                            <option value="4">4 dígitos</option>
                            <option value="6">6 dígitos</option>
                            <option value="8">8 dígitos</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Muestra (N)</label>
                          <input
                            type="number"
                            value={midSquareCount}
                            disabled
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LCG */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Semilla (X₀)</label>
                          <input
                            type="number"
                            value={lcgSeed}
                            onChange={(e) => setLcgSeed(e.target.value)}
                            placeholder="Ej: 4"
                            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Módulo (m)</label>
                          <input
                            type="number"
                            value={lcgM}
                            onChange={(e) => setLcgM(e.target.value)}
                            placeholder="Ej: 8"
                            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Multiplicador (a)</label>
                          <input
                            type="number"
                            value={lcgA}
                            onChange={(e) => setLcgA(e.target.value)}
                            placeholder="Ej: 5"
                            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Incremento (c)</label>
                          <input
                            type="number"
                            value={lcgC}
                            onChange={(e) => setLcgC(e.target.value)}
                            placeholder="Ej: 7"
                            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Muestra (N)</label>
                        <input
                          type="number"
                          value={lcgCount}
                          disabled
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Ejecutando cálculos...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Generar y Validar
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Detalle Educativo */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-xs text-slate-500 leading-relaxed">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-1.5">
                  <Info className="h-4 w-4 text-slate-500" />
                  Nivel de Significancia Estadístico
                </h3>
                Se utiliza un nivel de significancia fijo de <span className="font-mono text-slate-800 font-semibold">α = 0.05</span> (95% de confianza) para evaluar si la muestra de <span className="font-mono text-slate-800 font-semibold">N = 6</span> números cumple con las condiciones matemáticas de distribución uniforme.
              </div>
            </div>

            {/* Panel Derecho: Resultados */}
            <div className="lg:col-span-8 space-y-6">
              {results ? (
                <div className="space-y-6">
                  
                  {/* Tarjetas de Pruebas Estadísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Tarjeta Media */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[150px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Prueba de Media</span>
                          {results.tests.mean_test.passed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rechazado
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 mt-3.5">Comprobación de la Media (μ = 0.5)</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3.5 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Promedio (x̄)</span>
                          <span className="text-slate-700 font-bold">{results.tests.mean_test.mean}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Estadístico |Z₀|</span>
                          <span className={`font-bold ${results.tests.mean_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {Math.abs(results.tests.mean_test.z_score || 0).toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta Varianza */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[150px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Prueba de Varianza</span>
                          {results.tests.variance_test.passed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rechazado
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 mt-3.5">Comprobación de Varianza (σ² = 1/12)</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3.5 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Varianza (S²)</span>
                          <span className="text-slate-700 font-bold">{results.tests.variance_test.variance}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Estadístico X²₀</span>
                          <span className={`font-bold ${results.tests.variance_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {results.tests.variance_test.chi_square_score}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta KS */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[150px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Prueba KS</span>
                          {results.tests.ks_test.passed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rechazado
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 mt-3.5">Prueba de Kolmogorov-Smirnov</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3.5 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Distancia D</span>
                          <span className={`font-bold ${results.tests.ks_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {results.tests.ks_test.d_statistic}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Valor Crítico</span>
                          <span className="text-slate-700 font-bold">{results.tests.ks_test.critical_value}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Tabla de Números Generados */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Traza Matemática de Generación</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Muestra los valores de semilla e iteraciones procesadas por el servidor.</p>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                        N = {results.generated_numbers.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-mono bg-slate-50/50">
                            <th className="px-6 py-2.5 font-semibold text-center w-12">i</th>
                            {generatorType === "mid-squares" ? (
                              <>
                                <th className="px-6 py-2.5 font-semibold">Semilla (X_i)</th>
                                <th className="px-6 py-2.5 font-semibold">Cuadrado (X_i²)</th>
                                <th className="px-6 py-2.5 font-semibold text-center">Extracción Central</th>
                              </>
                            ) : (
                              <>
                                <th className="px-6 py-2.5 font-semibold">Semilla (X_n)</th>
                                <th className="px-6 py-2.5 font-semibold">Fórmula (a * X_n + c)</th>
                                <th className="px-6 py-2.5 font-semibold text-center">X_n+1 (Residuo)</th>
                              </>
                            )}
                            <th className="px-6 py-2.5 font-semibold text-right text-slate-800">Resultado Uniforme (R_i)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {results.history.map((row) => (
                            <tr key={row.index} className="hover:bg-slate-50/50">
                              <td className="px-6 py-3 text-center font-mono text-slate-400 font-semibold">{row.index}</td>
                              {generatorType === "mid-squares" ? (
                                <>
                                  <td className="px-6 py-3 font-mono text-slate-600">{row.seed}</td>
                                  <td className="px-6 py-3 font-mono text-slate-500">{row.squared}</td>
                                  <td className="px-6 py-3 text-center font-mono font-bold text-slate-700">{row.extracted}</td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-3 font-mono text-slate-600">{row.x_n}</td>
                                  <td className="px-6 py-3 font-mono text-slate-500">{row.calculation}</td>
                                  <td className="px-6 py-3 text-center font-mono font-bold text-slate-700">{row.x_next}</td>
                                </>
                              )}
                              <td className="px-6 py-3 text-right font-mono font-bold text-slate-800 text-sm">{row.ri.toFixed(6)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detalle Desplegable K-S */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => setShowKSDetails(!showKSDetails)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 text-left"
                    >
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <Percent className="h-4 w-4 text-slate-500" />
                          Desglose Matemático K-S
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Ver ordenación, límites teóricos e intervalos calculados.</p>
                      </div>
                      {showKSDetails ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </button>

                    {showKSDetails && results.tests.ks_test.step_details && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/20">
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                          <table className="w-full text-left border-collapse text-[11px] font-mono">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 bg-slate-50">
                                <th className="px-4 py-2 text-center w-10">i</th>
                                <th className="px-4 py-2">Ordenado x₍ᵢ₎</th>
                                <th className="px-4 py-2">i / N</th>
                                <th className="px-4 py-2">(i - 1) / N</th>
                                <th className="px-4 py-2 text-right">D⁺ = i/N - x</th>
                                <th className="px-4 py-2 text-right">D⁻ = x - (i-1)/N</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {results.tests.ks_test.step_details.map((step) => (
                                <tr key={step.index} className="hover:bg-slate-50/30">
                                  <td className="px-4 py-2 text-center text-slate-400 font-bold">{step.index}</td>
                                  <td className="px-4 py-2 text-slate-800">{step.x_i.toFixed(6)}</td>
                                  <td className="px-4 py-2 text-slate-500">{step.i_div_n.toFixed(4)}</td>
                                  <td className="px-4 py-2 text-slate-500">{step.i_minus_1_div_n.toFixed(4)}</td>
                                  <td className={`px-4 py-2 text-right font-bold ${step.d_plus === results.tests.ks_test.d_plus_max ? "text-indigo-600" : "text-slate-400"}`}>
                                    {step.d_plus.toFixed(6)}
                                  </td>
                                  <td className={`px-4 py-2 text-right font-bold ${step.d_minus === results.tests.ks_test.d_minus_max ? "text-indigo-600" : "text-slate-400"}`}>
                                    {step.d_minus.toFixed(6)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center p-3.5 rounded-lg bg-white border border-slate-200 text-xs gap-3">
                          <div className="space-y-1 text-slate-500 font-mono">
                            <div>• Distancia excedente máxima: <strong className="text-slate-800 font-semibold">{results.tests.ks_test.d_plus_max}</strong></div>
                            <div>• Distancia deficiente máxima: <strong className="text-slate-800 font-semibold">{results.tests.ks_test.d_minus_max}</strong></div>
                          </div>
                          <div className="text-right">
                            <span className="block text-slate-400 text-[10px] uppercase font-semibold">D calculado final</span>
                            <span className="text-sm font-bold text-slate-800 font-mono">{results.tests.ks_test.d_statistic}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resumen explicativo textual */}
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs text-slate-600">
                    <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Evaluación Teórica de Hipótesis</h4>
                    <div className="space-y-2.5 font-medium">
                      <p><strong>1. Prueba de la Media:</strong> {results.tests.mean_test.details}</p>
                      <p><strong>2. Prueba de la Varianza:</strong> {results.tests.variance_test.details}</p>
                      <p><strong>3. Prueba Kolmogorov-Smirnov:</strong> {results.tests.ks_test.details}</p>
                    </div>
                  </div>

                </div>
              ) : (
                /* Estado inicial */
                <div className="h-full min-h-[400px] rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8 bg-white shadow-xs">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                    <Settings className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Esperando Parámetros</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Establece los valores en el panel izquierdo y haz clic en &quot;Generar y Validar&quot; para cargar el procedimiento y evaluar las pruebas de uniformidad.
                  </p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* SECCIÓN DE MÉTODOS TEÓRICOS */
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-slate-600" />
                Validación de Escalabilidad de Arquitectura
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Demostración de generación por métodos no uniformes mediante la Transformada Inversa y la Composición de distribuciones.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Formulario de Configuración de Teoría */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demostrador</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer bg-slate-50/50">
                      <input
                        type="radio"
                        name="theory-type"
                        checked={theoryType === "inverse"}
                        onChange={() => { setTheoryType("inverse"); setTheoryData(null); }}
                        className="accent-slate-800 mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-semibold block text-slate-800">Transformada Inversa (Discreta)</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Asigna rangos acumulados uniformes a categorías discretas.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer bg-slate-50/50">
                      <input
                        type="radio"
                        name="theory-type"
                        checked={theoryType === "composition"}
                        onChange={() => { setTheoryType("composition"); setTheoryData(null); }}
                        className="accent-slate-800 mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-semibold block text-slate-800">Método de Composición</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Combina densidades de probabilidad ponderadas (U1 y U2).</span>
                      </div>
                    </label>
                  </div>

                  {theoryType === "inverse" && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Categorías</label>
                        <input
                          type="text"
                          value={discreteValues}
                          onChange={(e) => setDiscreteValues(e.target.value)}
                          placeholder="A, B, C"
                          className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Probabilidades (p_i)</label>
                        <input
                          type="text"
                          value={discreteProbs}
                          onChange={(e) => setDiscreteProbs(e.target.value)}
                          placeholder="0.2, 0.5, 0.3"
                          className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleFetchTheory}
                    disabled={theoryLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {theoryLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Simulando...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Ejecutar Simulación Teórica
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* Contenido/Resultados de Teoría */}
              <div className="lg:col-span-8 space-y-6">
                
                {theoryData ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Tarjeta de Definición */}
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-5">
                      <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono">
                        {theoryData.method}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {theoryData.definition}
                      </p>
                      {theoryData.mixture_details && (
                        <div className="mt-3 p-3 rounded bg-white border border-slate-200 text-[10px] font-mono space-y-0.5 text-slate-500">
                          <p className="text-slate-700 font-semibold mb-1">Mezcla configurable de distribuciones:</p>
                          <div>• Distribución 1: {theoryData.mixture_details.distribution_1}</div>
                          <div>• Distribución 2: {theoryData.mixture_details.distribution_2}</div>
                        </div>
                      )}
                    </div>

                    {/* Tabla de Simulación */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h4 className="font-semibold text-slate-800 text-sm">Traza del Procedimiento de Simulación</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Demuestra cómo el backend calculó y seleccionó cada elemento.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-mono bg-slate-50/50">
                              <th className="px-6 py-3 text-center w-12 font-semibold">i</th>
                              {theoryType === "inverse" ? (
                                <>
                                  <th className="px-6 py-3 font-semibold">U ~ U(0,1) Generado</th>
                                  <th className="px-6 py-3 text-center font-semibold">Intervalos de Probabilidad</th>
                                  <th className="px-6 py-3 text-right font-semibold text-slate-800">Categoría Seleccionada</th>
                                </>
                              ) : (
                                <>
                                  <th className="px-6 py-3 text-center font-semibold">U1 (Filtro)</th>
                                  <th className="px-6 py-3 text-center font-semibold">Distribución Seleccionada</th>
                                  <th className="px-6 py-3 text-center font-semibold">U2 (Mapeo)</th>
                                  <th className="px-6 py-3 text-right font-semibold text-slate-800">Número Generado (X)</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                            {theoryData.results.map((row) => (
                              <tr key={row.iteration} className="hover:bg-slate-50/50">
                                <td className="px-6 py-3 text-center text-slate-400 font-semibold">{row.iteration}</td>
                                {theoryType === "inverse" ? (
                                  <>
                                    <td className="px-6 py-3">{row.u.toFixed(6)}</td>
                                    <td className="px-6 py-3 text-center">
                                      {row.cdf.map((val: number, idx: number) => {
                                        const prev = idx === 0 ? 0.0 : row.cdf[idx - 1];
                                        const isSelected = row.index_selected === idx;
                                        return (
                                          <span 
                                            key={idx} 
                                            className={`inline-block mx-1 px-1.5 py-0.5 rounded text-[10px] ${
                                              isSelected 
                                                ? "bg-slate-900 text-white font-bold" 
                                                : "text-slate-400"
                                            }`}
                                          >
                                            [{prev.toFixed(2)}, {val.toFixed(2)}]
                                          </span>
                                        );
                                      })}
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-900 text-sm">{row.selected_value}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-6 py-3 text-center text-slate-500">{row.u1.toFixed(6)}</td>
                                    <td className="px-6 py-3 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        row.distribution_chosen === 1 
                                          ? "bg-blue-50 text-blue-700 border border-blue-200" 
                                          : "bg-purple-50 text-purple-700 border border-purple-200"
                                      }`}>
                                        Distribución {row.distribution_chosen}
                                      </span>
                                    </td>
                                    <td className="px-6 py-3 text-center text-slate-500">{row.u2.toFixed(6)}</td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-900 text-sm">{row.value.toFixed(4)}</td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Explicaciones detalladas */}
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 space-y-2">
                      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Traza Explicativa del Lote</h4>
                      <div className="space-y-1.5 font-mono text-[11px] text-slate-600">
                        {theoryData.results.map((row) => (
                          <div key={row.iteration} className="flex gap-2 items-start py-1 border-b border-slate-200/50 last:border-0">
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span><strong>Paso {row.iteration}:</strong> {row.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Estado inicial de teoría */
                  <div className="h-full min-h-[400px] rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8 bg-white shadow-xs">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">Demostrador de Métodos</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Configura el demostrador teórico a la izquierda y presiona &quot;Ejecutar Simulación Teórica&quot; para cargar el procedimiento.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer con datos de autor y enlace a GitHub */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="text-xs text-slate-500 font-medium">
              Desarrollado para la materia <span className="text-slate-700 font-semibold">Simulación y Modelos</span>
            </p>
            <p className="text-xs text-slate-400">
              Realizado por <span className="text-slate-600 font-semibold">Fabian Quijada</span> (C.I. V-31076939) &bull; Cursante de la <span className="text-slate-600 font-semibold">UDONE</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Fabianqc/SimuMath.git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-150 shadow-xs"
            >
              <GithubIcon className="h-4 w-4" />
              Ver Repositorio GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
