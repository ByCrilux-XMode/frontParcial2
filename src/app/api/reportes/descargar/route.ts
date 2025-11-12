import { NextRequest, NextResponse } from "next/server";

// Asegúrate de que esta variable de entorno esté configurada
const API_URL = process.env.API_URL ; 

/**
 * Endpoint para POST /api/reporte/descargar.
 * Reenvía la petición POST al backend y retransmite el archivo binario
 * (PDF/Excel) directamente al cliente.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("jwt-token")?.value;
  const backendUrl = `${API_URL}/v1/reporte/descargar`;

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

    if (!backendRes.ok) {
      // Manejar errores (ej. 401, 403, o un error de lógica del reporte 500)
      const errorText = await backendRes.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: `Error del backend: ${backendRes.statusText}`, detail: errorText };
      }
      return NextResponse.json(errorData, { status: backendRes.status });
    }

    // 2. Extraer los encabezados de la respuesta del backend
    const contentType = backendRes.headers.get("Content-Type") || "application/octet-stream";
    const contentDisposition = backendRes.headers.get("Content-Disposition");
    
    // 3. Crear el nuevo objeto de respuesta para el cliente de Next.js
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType);
    
    // 4. Reenviar el encabezado Content-Disposition para forzar la descarga
    if (contentDisposition) {
      responseHeaders.set("Content-Disposition", contentDisposition);
    }
    
    // 5. Retornar la respuesta binaria
    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: responseHeaders,
    });

  } catch (err: any) {
    console.error("Error directo en /api/reporte/descargar:", err.message);
    return NextResponse.json(
      { message: "Error interno del servidor al procesar el archivo.", detail: err.message },
      { status: 500 }
    );
  }
}