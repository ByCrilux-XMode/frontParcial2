"use client";
import { useState } from "react";
import { useClientes } from "@/hooks/useClientes"; // Corregido: Ruta relativa
import { useProdVariantes } from "@/hooks/useProdVariantes"; // Corregido: Ruta relativa
import { Loader2, Brain, TrendingUp, UserCheck, Package } from "lucide-react";
import FormField from "@/components/forms/FormField"; // Corregido: Ruta relativa
import Section from "@/components/forms/Section"; // Corregido: Ruta relativa

// YA NO NECESITAMOS LA URL PÚBLICA, la página llamará a /api/predict/...
// const ML_API_URL = process.env.NEXT_PUBLIC_ML_MICROSERVICE_URL; 

export default function PronosticoPage() {
  
  // Hooks para poblar los dropdowns
  const { clientes } = useClientes();
  const { prodVariantes } = useProdVariantes();

  // --- Estados para Modelo 1 (SKU) ---
  const [skuFecha, setSkuFecha] = useState(new Date().toISOString().split('T')[0]);
  const [skuSeleccionado, setSkuSeleccionado] = useState("");
  const [skuResultado, setSkuResultado] = useState<string | null>(null);
  const [skuLoading, setSkuLoading] = useState(false);
  
  // --- Estados para Modelo 2 (Cliente) ---
  const [clienteMes, setClienteMes] = useState(new Date().getMonth() + 1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clienteResultado, setClienteResultado] = useState<string | null>(null);
  const [clienteLoading, setClienteLoading] = useState(false);

  // --- Estados para Modelo 3 (Ventas Totales) ---
  const [ventasFecha, setVentasFecha] = useState(new Date().toISOString().split('T')[0]);
  const [ventasResultado, setVentasResultado] = useState<string | null>(null);
  const [ventasLoading, setVentasLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // --- Función genérica para llamar a NUESTRAS rutas API internas ---
  const fetchPrediction = async (endpoint: string, body: object) => {
    // CAMBIO: Quitado ML_API_URL. Ahora llama a las rutas internas.
    setError(null);

    try {
      const res = await fetch(endpoint, { // Llama a /api/predict/...
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        // El error ahora vendrá de nuestro proxy (proxyToMLService)
        throw new Error(data.message || `Error ${res.status}`);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // --- Handlers para cada modelo ---

  const handlePredictSKU = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkuLoading(true);
    setSkuResultado(null);

    const variante = prodVariantes?.find(v => v.sku === skuSeleccionado);
    if (!variante) {
        setError("SKU no encontrado en los datos de variantes.");
        setSkuLoading(false);
        return;
    }

    const body = {
      fecha: skuFecha,
      sku: skuSeleccionado,
      metodo_pago: "QR", // Puedes añadir inputs para esto
      tipo_venta: "Online", // Puedes añadir inputs para esto
      precio_unitario: variante.precio
    };

    // CAMBIO: Llamar a la ruta interna
    const data = await fetchPrediction("/api/predict/item-quantity", body);
    if (data) {
      const cantidad = parseFloat(data.prediccion_cantidad).toFixed(2);
      setSkuResultado(`Se venderán aprox. ${cantidad} unidades.`);
    }
    setSkuLoading(false);
  };

  const handlePredictCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setClienteLoading(true);
    setClienteResultado(null);

    const body = {
      mes: parseInt(String(clienteMes), 10),
      username: clienteSeleccionado,
    };
    
    // CAMBIO: Llamar a la ruta interna
    const data = await fetchPrediction("/api/predict/customer-value", body);
    if (data) {
        const gasto = parseFloat(data.prediccion_gasto).toFixed(2);
        setClienteResultado(`Gastará aprox. ${gasto} Bs. en el mes.`);
    }
    setClienteLoading(false);
  };

  const handlePredictVentas = async (e: React.FormEvent) => {
    e.preventDefault();
    setVentasLoading(true);
    setVentasResultado(null);

    const body = { fecha: ventasFecha };
    
    // CAMBIO: Llamar a la ruta interna
    const data = await fetchPrediction("/api/predict/total-sales", body);
    if (data) {
        const conteo = parseFloat(data.prediccion_ventas_totales).toFixed(0);
        setVentasResultado(`Se esperan ${conteo} transacciones.`);
    }
    setVentasLoading(false);
  };

  // ... (El JSX del return es idéntico al anterior, no necesita cambios)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
        <Brain className="mr-3 h-10 w-10 text-blue-600" />
        Panel de Pronósticos (IA)
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === Tarjeta 1: Pronóstico de SKU === */}
        <form onSubmit={handlePredictSKU}>
          <Section icon={<Package size={20} />} title="1. Demanda por Producto (SKU)">
            <FormField label="Seleccionar SKU">
              <select
                value={skuSeleccionado}
                onChange={(e) => setSkuSeleccionado(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">-- Elija un SKU --</option>
                {prodVariantes?.map(v => (
                  <option key={v.sku} value={v.sku}>{`${v.sku} (${v.producto})`}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Fecha de Predicción">
              <input
                type="date"
                value={skuFecha}
                onChange={(e) => setSkuFecha(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                required
              />
            </FormField>
            <button
              type="submit"
              disabled={skuLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {skuLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Predecir Cantidad"}
            </button>
            {skuResultado && (
              <div className="mt-4 text-center text-lg font-bold text-blue-600">
                {skuResultado}
              </div>
            )}
          </Section>
        </form>

        {/* === Tarjeta 2: Pronóstico de Cliente === */}
        <form onSubmit={handlePredictCliente}>
          <Section icon={<UserCheck size={20} />} title="2. Valor del Cliente">
            <FormField label="Seleccionar Cliente">
              <select
                value={clienteSeleccionado}
                onChange={(e) => setClienteSeleccionado(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">-- Elija un Cliente --</option>
                {clientes?.map(c => (
                  <option key={c.id} value={c.username}>{`${c.username} (${c.nombre} ${c.apellido})`}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Mes de Predicción (1-12)">
              <input
                type="number"
                min="1"
                max="12"
                value={clienteMes}
                onChange={(e) => setClienteMes(Number(e.target.value))}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                required
              />
            </FormField>
            <button
              type="submit"
              disabled={clienteLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {clienteLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Predecir Gasto"}
            </button>
            {clienteResultado && (
              <div className="mt-4 text-center text-lg font-bold text-blue-600">
                {clienteResultado}
              </div>
            )}
          </Section>
        </form>

        {/* === Tarjeta 3: Pronóstico de Ventas Totales === */}
        <form onSubmit={handlePredictVentas}>
          <Section icon={<TrendingUp size={20} />} title="3. Ventas Totales por Día">
            <FormField label="Fecha de Predicción">
              <input
                type="date"
                value={ventasFecha}
                onChange={(e) => setVentasFecha(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                required
              />
            </FormField>
            <button
              type="submit"
              disabled={ventasLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-[5.7rem]" // (Ajuste visual para alinear botones)
            >
              {ventasLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Predecir Transacciones"}
            </button>
            {ventasResultado && (
              <div className="mt-4 text-center text-lg font-bold text-blue-600">
                {ventasResultado}
              </div>
            )}
          </Section>
        </form>

      </div>
    </div>
  );
}