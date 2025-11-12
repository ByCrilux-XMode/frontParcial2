"use client";

import { useState, useMemo } from "react";
import { Loader2, Download, Table, FileText, XCircle } from "lucide-react";

// Importamos las funciones de la API que acabamos de crear
// Nota: 'fetchReporteDatos' y 'downloadReporte' se definen aquí mismo
// para simplificar el ejemplo, ya que encapsulan el POST a los endpoints.

// DTO para el cuerpo de la petición POST
interface IaRequestDTO {
  prompt: string;
}

// ------------------------------------------------------------------
// FUNCIONES AUXILIARES (REPLICAN LA LÓGICA DE LOS ENDPOINTS PROXY)
// Se mantienen aquí para demostrar la interacción de la página.
// En un proyecto real, se moverían a un archivo de 'utils' o 'service'.
// ------------------------------------------------------------------

/**
 * Función para obtener datos de un reporte (para mostrar en tabla).
 */
async function fetchReporteDatos(prompt: string) {
  const body: IaRequestDTO = { prompt };
  
  const res = await fetch("/api/reportes/datos", { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error desconocido al obtener datos.");
  }
  return data as Array<Record<string, any>>; // Retorna un array de objetos (la tabla)
}

/**
 * Función para descargar un reporte binario (PDF/Excel).
 */
async function downloadReporte(prompt: string) {
  const body: IaRequestDTO = { prompt };

  const response = await fetch("/api/reportes/descargar", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al descargar el reporte.');
  }

  // Procesar la respuesta binaria
  const blob = await response.blob();
  
  // Extraer el nombre del archivo del encabezado Content-Disposition
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'reporte.bin';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+?)"/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  // Iniciar la descarga en el navegador
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------------

export default function ReporteDinamicoPage() {
  const [prompt, setPrompt] = useState("");
  const [reportData, setReportData] = useState<Array<Record<string, any>> | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(value);
  };

  const handleRunReport = async () => {
    setError(null);
    setReportData(null);
    setIsLoading(true);
    
    if (!prompt.trim()) {
      setError("Por favor, ingrese un prompt.");
      setIsLoading(false);
      return;
    }

    // 1. Determinar el título del reporte
    setReportTitle(prompt.trim());

    try {
      // 2. Llamar al endpoint de datos
      const data = await fetchReporteDatos(prompt);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud de reporte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'excel' | 'json') => {
    setError(null);
    setIsLoading(true);

    if (!prompt.trim()) {
      setError("Por favor, ingrese un prompt antes de descargar.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Agregar la instrucción de formato al prompt original
      const downloadPrompt = `${prompt} en formato ${format}`;
      await downloadReporte(downloadPrompt);
      
      // Mostrar éxito, aunque el archivo ya haya forzado la descarga
      alert(`✅ Descarga de reporte en formato ${format.toUpperCase()} iniciada.`);
    } catch (err: any) {
      setError(err.message || "Error al iniciar la descarga.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extrae las cabeceras de la tabla
  const tableHeaders = useMemo(() => {
    if (reportData && reportData.length > 0) {
      return Object.keys(reportData[0]);
    }
    return [];
  }, [reportData]);


  const renderCellValue = (value: any) => {
    // Intenta formatear como moneda si parece un número y el nombre de columna lo sugiere
    if (typeof value === 'number' && (reportTitle.toLowerCase().includes('ganancia') || reportTitle.toLowerCase().includes('ingresos') || reportTitle.toLowerCase().includes('total'))) {
        return formatCurrency(value);
    }
    if (typeof value === 'number' && (value > 1000 || String(value).includes('.'))) {
        return formatCurrency(value);
    }
    return String(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Table className="mr-3 h-7 w-7 text-blue-600" /> Reporte Dinámico (IA)
      </h1>
      <p className="mb-6 text-gray-600">
        Consulta métricas de negocio en lenguaje natural. Ejemplos: "Ganancias de la marca Nike" o "Productos más vendidos en algodón en PDF".
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
        {/* PROMPT INPUT */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Consulta (Prompt)
          </label>
          <div className="flex space-x-3">
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              placeholder="Ej: Total de ventas del mes pasado"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  e.preventDefault();
                  handleRunReport();
                }
              }}
            />
            <button
              onClick={handleRunReport}
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" /> Ejecutar
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOTONES DE DESCARGA */}
        <div className="flex space-x-4">
          <p className="text-sm font-medium text-gray-700 self-center">Descargar:</p>
          <button
            onClick={() => handleDownloadReport('pdf')}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 border border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" /> PDF
          </button>
          <button
            onClick={() => handleDownloadReport('excel')}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" /> Excel
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="mt-8">
        {isLoading && (
          <div className="text-center py-10 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-lg text-gray-600">Generando reporte...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start">
             <XCircle className="h-6 w-6 mr-3 mt-1" />
             <div className="text-sm">
                <p className="font-bold">Error en la ejecución:</p>
                <p>{error}</p>
             </div>
          </div>
        )}

        {reportData && !error && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Resultados para: <span className="text-blue-600">"{reportTitle}"</span>
            </h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700"
                      >
                        {header.replace(/_/g, ' ')} {/* Formatear guiones bajos */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reportData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {tableHeaders.map((header) => (
                        <td
                          key={header}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {renderCellValue(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}