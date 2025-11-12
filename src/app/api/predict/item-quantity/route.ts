import { proxyToMLService } from "@/lib/proxyToML";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para el endpoint de predicción de demanda de SKU.
 * El cliente llama a: POST /api/predict/item-quantity
 * Esto llama a:     POST http://127.0.0.1:5001/predict/item-quantity
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Llama al manejador, pasándole el endpoint "predict/item-quantity"
  return proxyToMLService(req, "predict/item-quantity");
}