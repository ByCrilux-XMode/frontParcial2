import { proxyToMLService } from "@/lib/proxyToML";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para el endpoint de predicción de valor de cliente.
 * El cliente llama a: POST /api/predict/customer-value
 * Esto llama a:     POST http://127.0.0.1:5001/predict/customer-value
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Llama al manejador, pasándole el endpoint "predict/customer-value"
  return proxyToMLService(req, "predict/customer-value");
}