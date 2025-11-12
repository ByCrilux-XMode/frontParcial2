import { NextRequest, NextResponse } from "next/server";

// 1. Lee la URL del microservicio desde tu archivo .env
// (Esta es la variable ML_MICROSERVICE_URL="http://127.0.0.1:5001")
const ML_API_URL = process.env.API_URL2;

/**
 * Pasa una solicitud desde el cliente de Next.js al microservicio de IA (Flask).
 * Esta función es llamada por tus nuevos archivos 'route.ts'.
 */
export async function proxyToMLService(
  req: NextRequest,
  endpoint: string
): Promise<NextResponse> {
  // Verifica si la variable de entorno está configurada
  if (!ML_API_URL) {
    return NextResponse.json(
      { message: "La URL del microservicio de IA no está configurada en el servidor (.env)" },
      { status: 500 }
    );
  }

  try {
    // Construye la URL completa del microservicio (Ej: http://127.0.0.1:5001/predict/item-quantity)
    const backendUrl = `${ML_API_URL}/${endpoint}`;
    
    // 2. Lee el body (JSON) que envió la página de pronósticos
    const body = await req.json();

    // 3. Reenvía la solicitud al microservicio de IA (Python/Flask)
    const res = await fetch(backendUrl, {
      method: "POST", // Todas las predicciones son POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), // Envía el JSON que recibimos
    });

    // 4. Obtiene la respuesta del microservicio
    const data = await res.json();

    if (!res.ok) {
      // Si el microservicio de IA dio un error, se lo pasamos al frontend
      return NextResponse.json(
        { message: data.error || "Error en el microservicio de IA" },
        { status: res.status }
      );
    }

    // 5. Devuelve la predicción exitosa al frontend
    return NextResponse.json(data, { status: 200 });

  } catch (err: any) {
    console.error(`Error en el proxy de IA (proxyToMLService) a ${endpoint}:`, err);
    return NextResponse.json(
      { message: "Error interno del proxy de Next.js", error: err.message },
      { status: 502 } // 502 Bad Gateway (Error conectando con el otro servidor)
    );
  }
}