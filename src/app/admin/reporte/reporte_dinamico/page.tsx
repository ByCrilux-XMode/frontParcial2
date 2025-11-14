// src/app/admin/reporte/reporte_dinamico/page.tsx
'use client';
import React, { useState } from 'react';

// 1️⃣ Tus importaciones para PDF y Excel
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// URL de tu API Route (la misma que tenías)
const N8N_WEBHOOK_URL = '/api/reportes';

export default function ReporteDinamicoPage() {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- LÓGICA PARA LLAMAR A LA API ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResultados([]); // Limpia resultados anteriores

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                setResultados([]); // Asegurarse de que no haya datos
            } else if (data.length === 0) {
                // Si la respuesta es un array vacío, no es un error
                setError("No se encontraron resultados para esta consulta.");
                setResultados([]);
            } else {
                setResultados(data);
            }

        } catch (err: any) {
            setError('No se pudo conectar al servicio de reportes.');
        }
        setLoading(false);
    };

    // --- Funciones de Descarga (con tu lógica de tipos corregida) ---
    const downloadExcel = () => {
        if (resultados.length === 0) return;
        const ws = utils.json_to_sheet(resultados);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'Reporte');
        writeFile(wb, 'reporte.xlsx');
    };

    const downloadPdf = () => {
        if (resultados.length === 0) return; 
        const doc = new jsPDF();
        const head = [Object.keys(resultados[0])];
        const body = resultados.map(row => Object.values(row));

        autoTable(doc, {
            head: head as string[][],
            body: body as (string | number | boolean | null)[][],
        });
        doc.save('reporte.pdf');
    };

    const tableHeaders = resultados.length > 0 ? Object.keys(resultados[0]) : [];

    // --- 3️⃣ Tu JSX con estilos Tailwind ---
    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reporte Dinámico con IA</h1>

            {/* --- Formulario de Entrada --- */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ej: ¿Producto más vendido el mes pasado?"
                        className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className={`p-3 px-6 text-white font-semibold rounded-md transition-colors
                                    ${(loading || !query.trim()) 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Generar Reporte'
                        )}
                    </button>
                </form>
            </div>

            {/* --- Mensaje de Error (o "No encontrado") --- */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-sm mb-6" role="alert">
                    <strong className="font-bold">Aviso: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* --- Sección de Resultados (Solo si hay datos) --- */}
            {resultados.length > 0 && !error && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    
                    {/* --- Cabecera de Reporte y Botones de Descarga --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4 sm:mb-0">
                            Resultados del Reporte
                        </h2>
                        <div className="flex gap-3">
                            <button 
                                onClick={downloadExcel}
                                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors">
                                Descargar Excel
                            </button>
                            <button 
                                onClick={downloadPdf}
                                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors">
                                Descargar PDF
                            </button>
                        </div>
                    </div>

                    {/* --- Tabla de Datos --- */}
                    <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    {tableHeaders.map((header) => (
                                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            {header.replace(/_/g, ' ')} {/* Limpia nombres de columnas */}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {resultados.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                        {tableHeaders.map((header, colIndex) => (
                                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {String(row[header])}
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
    );
}