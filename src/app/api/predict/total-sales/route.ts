import { proxyToMLService } from "@/lib/proxyToML";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para el endpoint de predicción de ventas totales.
 * El cliente llama a: POST /api/predict/total-sales
 * Esto llama a:     POST http://127.0.0.1:5001/predict/total-sales
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Llama al manejador, pasándole el endpoint "predict/total-sales"
  return proxyToMLService(req, "predict/total-sales");
}