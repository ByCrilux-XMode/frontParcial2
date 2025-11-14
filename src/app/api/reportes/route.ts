// src/app/api/reporte/route.ts
import { NextResponse } from 'next/server';

// ¡IMPORTANTE! Pega tu URL de n8n (con ngrok) aquí
const N8N_WEBHOOK_URL = 'https://jeffry-sorriest-benny.ngrok-free.dev/webhook/test-llm';

export async function POST(request: Request) {
    console.log("--- DEBUG: API /api/reporte ---");
    console.log("PASO 1: Recibida llamada del frontend.");
    try {
        // 1. Obtenemos la { query } que nos mandó el frontend
        const body = await request.json();
        const userQuery = body.query;
        
        // 2. Hacemos la llamada a n8n (de servidor a servidor)
        console.log(`PASO 2: Llamando a n8n con la query: "${userQuery}"`);
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userQuery }), // Reenviamos la query
            cache: 'no-store'
        });

        if (!n8nResponse.ok) {
            // Si n8n da un error
            console.error(`ERROR: n8n respondió con error: ${n8nResponse.status}`);
            throw new Error(`Error de n8n: ${n8nResponse.statusText}`);
        }

        // 3. Obtenemos la respuesta de n8n (los datos de PostgreSQL o el error)
        const data = await n8nResponse.json();
        console.log("PASO 3: Recibido de n8n (datos de Postgres):");
        console.log(JSON.stringify(data, null, 2));
        // 4. Devolvemos los datos al frontend
        console.log("PASO 4: Devolviendo datos al frontend.");
        return NextResponse.json(data);

    } catch (error: any) {
        // Manejo de errores
        console.error("--- DEBUG: ERROR CATASTRÓFICO EN API ---");
        console.error(error.message);
        console.error("Error en /api/reporte:", error.message);
        
        return NextResponse.json({ error: 'Fallo al conectar con el servicio' }, { status: 500 });
    }
}