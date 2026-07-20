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
  Info,
  Grid,
  Layers,
  Activity,
  Award,
  BarChart2
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

// Interfaces para tipado de las 7 Pruebas Estadísticas
interface StepDetailKS {
  index: number;
  x_i: number;
  i_div_n: number;
  i_minus_1_div_n: number;
  d_plus: number;
  d_minus: number;
}

interface PokerCategoryDetail {
  category: string;
  name: string;
  probability: number;
  observed: number;
  expected: number;
  chi_term: number;
}

interface SeriesCellDetail {
  cell: string;
  observed: number;
  expected: number;
  chi_term: number;
}

interface GapCountDetail {
  gap_length: string;
  observed: number;
  probability: number;
  expected: number;
  chi_term: number;
}

interface TestResult {
  test_name: string;
  sample_size: number;
  passed: boolean;
  alpha: number;
  details: string;

  // Medias
  mean?: number;
  z_score?: number;
  critical_value?: number;
  lower_limit?: number;
  upper_limit?: number;

  // Varianza
  variance?: number;
  chi_square_score?: number;
  degrees_of_freedom?: number;
  lower_critical_value?: number;
  upper_critical_value?: number;
  lower_var_limit?: number;
  upper_var_limit?: number;

  // Smirnov (K-S)
  d_statistic?: number;
  d_plus_max?: number;
  d_minus_max?: number;
  sorted_numbers?: number[];
  step_details?: StepDetailKS[];

  // Póker
  categories?: PokerCategoryDetail[];

  // Serie
  num_pairs?: number;
  grid_size?: string;
  cells?: SeriesCellDetail[];

  // Huecos
  interval?: string;
  total_gaps?: number;
  gap_counts?: GapCountDetail[];

  // Corridas arriba y abajo
  runs_count?: number;
  expected_mean?: number;
  expected_variance?: number;
  signs_sequence?: string;
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
    poker_test: TestResult;
    series_test: TestResult;
    gap_test: TestResult;
    runs_test: TestResult;
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

  // Parámetros de Cuadrados Medios (por defecto N=20)
  const [midSquareSeed, setMidSquareSeed] = useState("3708");
  const [midSquareDigits, setMidSquareDigits] = useState("4");
  const [midSquareCount, setMidSquareCount] = useState("20");

  // Parámetros de LCG (por defecto N=20)
  const [lcgSeed, setLcgSeed] = useState("17");
  const [lcgA, setLcgA] = useState("101");
  const [lcgC, setLcgC] = useState("43");
  const [lcgM, setLcgM] = useState("1000");
  const [lcgCount, setLcgCount] = useState("20");

  // Controladores de UI para Desglose de Pruebas
  const [activeDetailTab, setActiveDetailTab] = useState<string | null>("ks");
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
          body: JSON.stringify({ values: vals, probabilities: probs, count: 20 })
        });
      } else {
        response = await fetch(`${backendUrl}/api/theory/composition?count=20`);
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
      
      {/* Header Institucional */}
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
              <p className="text-xs text-slate-500 font-medium">Plataforma Académica de Simulación y Las 7 Pruebas Estadísticas</p>
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-12 w-full">
        
        {/* Banner de error */}
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
          /* PESTAÑA PRINCIPAL: GENERADORES Y 7 PRUEBAS ESTADÍSTICAS */
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
                            min="2"
                            max="10000"
                            value={midSquareCount}
                            onChange={(e) => setMidSquareCount(e.target.value)}
                            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none transition-all"
                            required
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
                            placeholder="Ej: 17"
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
                            placeholder="Ej: 1000"
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
                            placeholder="Ej: 101"
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
                            placeholder="Ej: 43"
                            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Muestra (N)</label>
                        <input
                          type="number"
                          min="2"
                          max="10000"
                          value={lcgCount}
                          onChange={(e) => setLcgCount(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-lg px-3.5 py-2 text-sm outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Calculando las 7 Pruebas...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Generar y Validar 7 Pruebas
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Detalle Educativo */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-xs text-slate-500 leading-relaxed space-y-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-500" />
                  Marco Estadístico Académico
                </h3>
                <p>
                  Se evalúan <strong className="text-slate-800">7 pruebas de hipótesis</strong> con <span className="font-mono text-slate-800 font-semibold">α = 0.05</span> (95% de confianza) utilizando valores críticos exactos de las distribuciones <span className="font-semibold text-slate-800">Normal (Z)</span>, <span className="font-semibold text-slate-800">Chi-cuadrada (χ²)</span> y <span className="font-semibold text-slate-800">Kolmogorov-Smirnov (D)</span>.
                </p>
              </div>
            </div>

            {/* Panel Derecho: Resultados de las 7 Pruebas */}
            <div className="lg:col-span-8 space-y-6">
              {results ? (
                <div className="space-y-6">
                  
                  {/* Encabezado de Pruebas */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Award className="h-5 w-5 text-indigo-600" />
                        Resultados de las 7 Pruebas Estadísticas
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Muestra procesada: <span className="font-bold text-slate-700 font-mono">N = {results.generated_numbers.length}</span> números pseudoaleatorios.
                      </p>
                    </div>
                  </div>

                  {/* Rejilla de Tarjetas para las 7 Pruebas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* 1. Prueba de Medias */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">1. Medias</span>
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
                        <h3 className="text-xs font-semibold text-slate-800 mt-2.5">Prueba de Medias (μ = 0.5)</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Promedio (x̄)</span>
                          <span className="text-slate-700 font-bold">{results.tests.mean_test.mean}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">|Z₀| vs Z_crit</span>
                          <span className={`font-bold ${results.tests.mean_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {Math.abs(results.tests.mean_test.z_score || 0).toFixed(3)} / {results.tests.mean_test.critical_value}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Prueba de Varianza */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">2. Varianza</span>
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
                        <h3 className="text-xs font-semibold text-slate-800 mt-2.5">Prueba de Varianza (σ² = 1/12)</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3 flex justify-between text-xs font-mono">
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

                    {/* 3. Prueba de Smirnov (K-S) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">3. Smirnov</span>
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
                        <h3 className="text-xs font-semibold text-slate-800 mt-2.5">Prueba Kolmogorov-Smirnov</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Distancia D</span>
                          <span className={`font-bold ${results.tests.ks_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {results.tests.ks_test.d_statistic}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">D Crítico</span>
                          <span className="text-slate-700 font-bold">{results.tests.ks_test.critical_value}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Prueba de Póker */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">4. Póker</span>
                          {results.tests.poker_test.passed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rechazado
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 mt-2.5">Prueba de Póker (Dígitos)</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Estadístico X²</span>
                          <span className={`font-bold ${results.tests.poker_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {results.tests.poker_test.chi_square_score}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">X² Crítico (gl={results.tests.poker_test.degrees_of_freedom})</span>
                          <span className="text-slate-700 font-bold">{results.tests.poker_test.critical_value}</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Prueba de Serie */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">5. Serie</span>
                          {results.tests.series_test.passed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rechazado
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 mt-2.5">Prueba de Serie (Pares 2D)</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Pares / X²</span>
                          <span className={`font-bold ${results.tests.series_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {results.tests.series_test.num_pairs} p. / {results.tests.series_test.chi_square_score}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">X² Crítico</span>
                          <span className="text-slate-700 font-bold">{results.tests.series_test.critical_value}</span>
                        </div>
                      </div>
                    </div>

                    {/* 6. Prueba de Huecos */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">6. Huecos</span>
                          {results.tests.gap_test.passed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rechazado
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 mt-2.5">Prueba de Huecos (Gaps)</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Huecos / X²</span>
                          <span className={`font-bold ${results.tests.gap_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {results.tests.gap_test.total_gaps} / {results.tests.gap_test.chi_square_score}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">X² Crítico</span>
                          <span className="text-slate-700 font-bold">{results.tests.gap_test.critical_value}</span>
                        </div>
                      </div>
                    </div>

                    {/* 7. Prueba de Corridas Arriba y Abajo */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all md:col-span-2 lg:col-span-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">7. Corridas</span>
                          {results.tests.runs_test.passed ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rechazado
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-slate-800 mt-2.5">Corridas Arriba y Abajo</h3>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 mt-3 flex justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">Corridas (b)</span>
                          <span className="text-slate-700 font-bold">{results.tests.runs_test.runs_count}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-sans">|Z₀| vs Z_crit</span>
                          <span className={`font-bold ${results.tests.runs_test.passed ? "text-emerald-600" : "text-rose-600"}`}>
                            {Math.abs(results.tests.runs_test.z_score || 0).toFixed(3)} / {results.tests.runs_test.critical_value}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Tabla de Traza de Números Generados */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Traza Matemática de Generación</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Muestra las iteraciones y valores generados por el servidor.</p>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                        N = {results.generated_numbers.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-[300px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-slate-100 z-10">
                          <tr className="border-b border-slate-200 text-slate-500 font-mono">
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
                            <tr key={row.index} className="hover:bg-slate-50/80">
                              <td className="px-6 py-2.5 text-center font-mono text-slate-400 font-semibold">{row.index}</td>
                              {generatorType === "mid-squares" ? (
                                <>
                                  <td className="px-6 py-2.5 font-mono text-slate-600">{row.seed}</td>
                                  <td className="px-6 py-2.5 font-mono text-slate-500">{row.squared}</td>
                                  <td className="px-6 py-2.5 text-center font-mono font-bold text-slate-700">{row.extracted}</td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-2.5 font-mono text-slate-600">{row.x_n}</td>
                                  <td className="px-6 py-2.5 font-mono text-slate-500">{row.calculation}</td>
                                  <td className="px-6 py-2.5 text-center font-mono font-bold text-slate-700">{row.x_next}</td>
                                </>
                              )}
                              <td className="px-6 py-2.5 text-right font-mono font-bold text-slate-800">{row.ri.toFixed(6)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sección de Desglose Matemático Interactivo (Pestañas de las 7 Pruebas) */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <Activity className="h-4 w-4 text-indigo-600" />
                          Desglose Matemático Interactivo
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Selecciona una prueba para ver su procedimiento numérico paso a paso.</p>
                      </div>
                    </div>

                    {/* Selector de pestañas */}
                    <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50 p-1 gap-1 text-xs font-semibold">
                      {[
                        { id: "ks", name: "Smirnov (K-S)" },
                        { id: "poker", name: "Póker" },
                        { id: "series", name: "Serie (2D)" },
                        { id: "gap", name: "Huecos" },
                        { id: "runs", name: "Corridas Arriba/Abajo" },
                        { id: "mean", name: "Medias" },
                        { id: "variance", name: "Varianza" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailTab(tab.id)}
                          className={`px-3 py-2 rounded-md transition-all whitespace-nowrap ${
                            activeDetailTab === tab.id
                              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    {/* Contenido de cada pestaña */}
                    <div className="p-6">
                      
                      {/* Smirnov (K-S) */}
                      {activeDetailTab === "ks" && results.tests.ks_test.step_details && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ordenación y Distancias Máximas D⁺ y D⁻</h4>
                            <span className="text-xs font-mono font-bold text-slate-600">D Crítico = {results.tests.ks_test.critical_value}</span>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white max-h-[300px]">
                            <table className="w-full text-left border-collapse text-[11px] font-mono">
                              <thead className="sticky top-0 bg-slate-50">
                                <tr className="border-b border-slate-200 text-slate-400">
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
                                  <tr key={step.index} className="hover:bg-slate-50/50">
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

                          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
                            <div>D⁺ max = <strong>{results.tests.ks_test.d_plus_max}</strong> | D⁻ max = <strong>{results.tests.ks_test.d_minus_max}</strong></div>
                            <div>D final = <strong className="text-indigo-600 font-bold">{results.tests.ks_test.d_statistic}</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Póker */}
                      {activeDetailTab === "poker" && results.tests.poker_test.categories && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Frecuencias Observadas vs Esperadas (4 Dígitos Decimales)</h4>
                            <span className="text-xs font-mono font-bold text-slate-600">X² Crítico = {results.tests.poker_test.critical_value}</span>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="w-full text-left border-collapse text-xs font-mono">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400 bg-slate-50">
                                  <th className="px-4 py-2.5">Categoría</th>
                                  <th className="px-4 py-2.5">Probabilidad (p_i)</th>
                                  <th className="px-4 py-2.5 text-center">Observado (O_i)</th>
                                  <th className="px-4 py-2.5 text-center">Esperado (E_i)</th>
                                  <th className="px-4 py-2.5 text-right">(O_i - E_i)² / E_i</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-600">
                                {results.tests.poker_test.categories.map((cat) => (
                                  <tr key={cat.category} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-2.5 font-bold text-slate-800">{cat.name} ({cat.category})</td>
                                    <td className="px-4 py-2.5 text-slate-500">{cat.probability.toFixed(4)}</td>
                                    <td className="px-4 py-2.5 text-center text-slate-900 font-bold">{cat.observed}</td>
                                    <td className="px-4 py-2.5 text-center text-slate-500">{cat.expected}</td>
                                    <td className="px-4 py-2.5 text-right font-bold text-indigo-600">{cat.chi_term.toFixed(6)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
                            <div>Grados de libertad: <strong>{results.tests.poker_test.degrees_of_freedom}</strong></div>
                            <div>X² total = <strong className="text-indigo-600 font-bold">{results.tests.poker_test.chi_square_score}</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Serie */}
                      {activeDetailTab === "series" && results.tests.series_test.cells && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Frecuencias de Pares en Cuadrícula 2D ({results.tests.series_test.grid_size})</h4>
                            <span className="text-xs font-mono font-bold text-slate-600">Pares Evaluados = {results.tests.series_test.num_pairs}</span>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="w-full text-left border-collapse text-xs font-mono">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400 bg-slate-50">
                                  <th className="px-4 py-2.5">Subcelda 2D [U1 x U2]</th>
                                  <th className="px-4 py-2.5 text-center">Observados (O_ij)</th>
                                  <th className="px-4 py-2.5 text-center">Esperados (E_ij)</th>
                                  <th className="px-4 py-2.5 text-right">Término Chi-cuadrado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-600">
                                {results.tests.series_test.cells.map((cell, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-2.5 font-bold text-slate-800">{cell.cell}</td>
                                    <td className="px-4 py-2.5 text-center text-slate-900 font-bold">{cell.observed}</td>
                                    <td className="px-4 py-2.5 text-center text-slate-500">{cell.expected}</td>
                                    <td className="px-4 py-2.5 text-right font-bold text-indigo-600">{cell.chi_term.toFixed(6)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
                            <div>X² Crítico ({results.tests.series_test.degrees_of_freedom} gl): <strong>{results.tests.series_test.critical_value}</strong></div>
                            <div>X² Calculado = <strong className="text-indigo-600 font-bold">{results.tests.series_test.chi_square_score}</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Huecos */}
                      {activeDetailTab === "gap" && results.tests.gap_test.gap_counts && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Prueba de Huecos (Intervalo {results.tests.gap_test.interval})</h4>
                            <span className="text-xs font-mono font-bold text-slate-600">Huecos Totales = {results.tests.gap_test.total_gaps}</span>
                          </div>

                          {results.tests.gap_test.gap_counts.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                              <table className="w-full text-left border-collapse text-xs font-mono">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-400 bg-slate-50">
                                    <th className="px-4 py-2.5">Longitud de Hueco (k)</th>
                                    <th className="px-4 py-2.5 text-center">Probabilidad Geométrica</th>
                                    <th className="px-4 py-2.5 text-center">Observados</th>
                                    <th className="px-4 py-2.5 text-center">Esperados</th>
                                    <th className="px-4 py-2.5 text-right">Término Chi-cuadrado</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                  {results.tests.gap_test.gap_counts.map((gap, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2.5 font-bold text-slate-800">k = {gap.gap_length}</td>
                                      <td className="px-4 py-2.5 text-center text-slate-500">{gap.probability.toFixed(4)}</td>
                                      <td className="px-4 py-2.5 text-center text-slate-900 font-bold">{gap.observed}</td>
                                      <td className="px-4 py-2.5 text-center text-slate-500">{gap.expected}</td>
                                      <td className="px-4 py-2.5 text-right font-bold text-indigo-600">{gap.chi_term.toFixed(6)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-4 rounded-lg bg-amber-50 text-amber-800 text-xs">
                              {results.tests.gap_test.details}
                            </div>
                          )}

                          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
                            <div>X² Crítico: <strong>{results.tests.gap_test.critical_value}</strong></div>
                            <div>X² Calculado = <strong className="text-indigo-600 font-bold">{results.tests.gap_test.chi_square_score}</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Corridas arriba y abajo */}
                      {activeDetailTab === "runs" && (
                        <div className="space-y-4 text-xs font-mono">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider font-sans">Secuencia de Signos (+ / -) y Rachas</h4>
                          
                          <div className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto font-bold tracking-widest break-all">
                            {results.tests.runs_test.signs_sequence}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-sans">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Corridas Observadas (b)</span>
                              <span className="text-base font-bold text-slate-800 font-mono">{results.tests.runs_test.runs_count}</span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Media Teórica µ_b</span>
                              <span className="text-base font-bold text-slate-800 font-mono">{results.tests.runs_test.expected_mean}</span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Varianza Teórica σ²_b</span>
                              <span className="text-base font-bold text-slate-800 font-mono">{results.tests.runs_test.expected_variance}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Medias */}
                      {activeDetailTab === "mean" && (
                        <div className="space-y-4 text-xs">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider">Intervalo de Aceptación de la Media</h4>
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono space-y-2">
                            <div>• Promedio muestral (x̄): <strong className="text-slate-900">{results.tests.mean_test.mean}</strong></div>
                            <div>• Límite Inferior: <strong className="text-slate-700">{results.tests.mean_test.lower_limit}</strong></div>
                            <div>• Límite Superior: <strong className="text-slate-700">{results.tests.mean_test.upper_limit}</strong></div>
                            <div>• Estadístico Z₀: <strong className="text-indigo-600">{results.tests.mean_test.z_score}</strong> (Z Crítico = {results.tests.mean_test.critical_value})</div>
                          </div>
                        </div>
                      )}

                      {/* Varianza */}
                      {activeDetailTab === "variance" && (
                        <div className="space-y-4 text-xs">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider">Intervalo Crítico Chi-cuadrada y Varianza</h4>
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono space-y-2">
                            <div>• Varianza muestral (S²): <strong className="text-slate-900">{results.tests.variance_test.variance}</strong></div>
                            <div>• Estadístico X²₀: <strong className="text-indigo-600">{results.tests.variance_test.chi_square_score}</strong> (gl = {results.tests.variance_test.degrees_of_freedom})</div>
                            <div>• Intervalo Crítico X²: [<strong>{results.tests.variance_test.lower_critical_value}</strong>, <strong>{results.tests.variance_test.upper_critical_value}</strong>]</div>
                            <div>• Intervalo de Aceptación para S²: [<strong>{results.tests.variance_test.lower_var_limit}</strong>, <strong>{results.tests.variance_test.upper_var_limit}</strong>]</div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Resumen explicativo textual de las 7 Pruebas */}
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs text-slate-600">
                    <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Evaluación Teórica Completa de Hipótesis (7 Pruebas)</h4>
                    <div className="space-y-2 font-medium">
                      <p><strong>1. Prueba de Medias:</strong> {results.tests.mean_test.details}</p>
                      <p><strong>2. Prueba de Varianza:</strong> {results.tests.variance_test.details}</p>
                      <p><strong>3. Prueba de Smirnov:</strong> {results.tests.ks_test.details}</p>
                      <p><strong>4. Prueba de Póker:</strong> {results.tests.poker_test.details}</p>
                      <p><strong>5. Prueba de Serie:</strong> {results.tests.series_test.details}</p>
                      <p><strong>6. Prueba de Huecos:</strong> {results.tests.gap_test.details}</p>
                      <p><strong>7. Prueba de Corridas Arriba/Abajo:</strong> {results.tests.runs_test.details}</p>
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
                    Establece los valores en el panel izquierdo y haz clic en &quot;Generar y Validar 7 Pruebas&quot; para ejecutar los algoritmos y visualizar la auditoría estadística.
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

              {/* Resultados de Teoría */}
              <div className="lg:col-span-8 space-y-6">
                {theoryData ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">{theoryData.method}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{theoryData.definition}</p>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-[400px]">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead className="sticky top-0 bg-slate-100">
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="px-4 py-2 text-center">Iteración</th>
                            <th className="px-4 py-2">Detalle Matemático</th>
                            <th className="px-4 py-2 text-right">Resultado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {theoryData.results.map((row) => (
                            <tr key={row.iteration} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 text-center font-bold text-slate-400">{row.iteration}</td>
                              <td className="px-4 py-2.5 text-slate-700">{row.explanation}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                                {theoryType === "inverse" ? row.selected_value : row.value.toFixed(4)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8 bg-white">
                    <BookOpen className="h-8 w-8 text-slate-300 mb-2" />
                    <span className="text-xs text-slate-400 font-medium">Selecciona un método teórico y presiona &quot;Ejecutar Simulación Teórica&quot;.</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
