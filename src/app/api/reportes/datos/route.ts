import { NextRequest, NextResponse } from "next/server";

// Asegúrate de que esta variable de entorno esté configurada
const API_URL = process.env.API_URL ; 

/**
 * Endpoint para POST /api/reporte/datos.
 * Reenvía la petición POST al backend para obtener datos JSON de reportes.
 * Este endpoint llama a Spring Boot /v1/reporte/datos.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("jwt-token")?.value;
  const backendUrl = `${API_URL}/v1/reporte/datos`; // URL del backend: /v1/reporte/datos

  try {
    const body = await req.json(); // Leer el cuerpo que contiene el { prompt: string }

    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Incluye el token de autenticación
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify(body),
    };

    // 1. Llamar al backend de Spring Boot
    const backendRes = await fetch(backendUrl, fetchOptions);

    // 2. Manejo de respuesta genérico
    const responseText = await backendRes.text();

    if (!backendRes.ok) {
      // Manejar error del backend (Spring Boot devuelve { message: ..., detail: ... } o texto plano)
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: `Error del backend: ${backendRes.statusText}`, detail: responseText };
      }
      return NextResponse.json(errorData, { status: backendRes.status });
    }

    // 3. Éxito: Devolver el JSON tal cual (List<Map<String, Object>>)
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data, { status: backendRes.status });
    } catch {
      // Esto solo ocurre si Spring Boot devuelve 200 OK con contenido que no es JSON (es inesperado)
      return NextResponse.json(
        { message: "Respuesta exitosa, pero no es JSON válido.", detail: responseText }, 
        { status: 500 }
      );
    }

  } catch (err: any) {
    console.error("Error directo en /api/reporte/datos:", err.message);
    return NextResponse.json(
      { message: "Error interno del servidor.", detail: err.message },
      { status: 500 }
    );
  }
}