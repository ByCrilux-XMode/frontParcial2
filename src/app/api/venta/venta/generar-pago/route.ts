import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para POST /venta/venta/generar-pago
 * Este endpoint es llamado por el cliente (Next.js) para iniciar el checkout.
 * Reenvía la solicitud al backend de Spring Boot, que devuelve la URL de la
 * pasarela de pagos Libélula.
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  // El endpoint del backend es 'venta/venta/generar-pago'
  return proxyToBackend(req, "venta/venta/generar-pago");
}

export const POST = handler;