"use client";
import Link from "next/link";
import {
  Package,
  Users,
  ShoppingCart,
  LayoutGrid,
  Tag,
  Bookmark,
  Puzzle,
  Layers,
  Palette,
  Ruler,
  User,
  DollarSign,
  ListOrdered,
  PlusCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import React from "react";

interface AdminCardProps {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  bgColor: string;
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  description,
  href,
  Icon,
  bgColor,
}) => (
  <Link
    href={href}
    className={`block p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out ${bgColor} text-white`}
  >
    <div className="flex items-center mb-4">
      <Icon size={32} className="mr-4" />
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-sm opacity-90">{description}</p>
  </Link>
);

import { useAuthUser } from "@/hooks/useAuthUser";

export default function AdminDashboardPage() {
  const user = useAuthUser();
  const rol = user?.rolNombre;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Panel 
      </h1>

      {/* Sección de Inventario */}
      {rol === "ROLE_ADMIN" && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-blue-500 pl-4">
            Gestión de Inventario
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard
              title="Categorías y Atributos"
              description="Administra categorías, marcas, modelos, materiales, etiquetas, colores y tallas."
              href="/admin/inventario/categoria"
              Icon={LayoutGrid}
              bgColor="bg-blue-600 hover:bg-blue-700"
            />
            <AdminCard
              title="Catálogo de Productos"
              description="Gestiona la información detallada de todos los productos."
              href="/admin/inventario/catalogo"
              Icon={Package}
              bgColor="bg-green-600 hover:bg-green-700"
            />
            <AdminCard
              title="Stock de Variantes"
              description="Controla el inventario y las variantes de cada producto."
              href="/admin/inventario/stock"
              Icon={ListOrdered}
              bgColor="bg-purple-600 hover:bg-purple-700"
            />
          </div>
        </section>
      )}

      {/* Sección de Usuarios */}
      {rol === "ROLE_ADMIN" && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-yellow-500 pl-4">
            Gestión de Usuarios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard
              title="Clientes"
              description="Administra la información de los clientes registrados."
              href="/admin/usuario/cliente"
              Icon={User}
              bgColor="bg-yellow-600 hover:bg-yellow-700"
            />
            <AdminCard
              title="Vendedores"
              description="Gestiona las cuentas de los vendedores de la tienda."
              href="/admin/usuario/vendedor"
              Icon={User}
              bgColor="bg-orange-600 hover:bg-orange-700"
            />
          </div>
        </section>
      )}

      {/* Sección de Ventas */}
      {(rol === "ROLE_ADMIN" || rol === "ROLE_VENDEDOR") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-red-500 pl-4">
            Gestión de Ventas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard
              title="Registro de Ventas"
              description="Visualiza y gestiona todas las transacciones de venta."
              href="/admin/venta/registro"
              Icon={ShoppingCart}
              bgColor="bg-red-600 hover:bg-red-700"
            />
            <AdminCard
              title="Registrar Nueva Venta"
              description="Crea una nueva nota de venta para un cliente."
              href="/admin/venta/nota_venta"
              Icon={PlusCircle}
              bgColor="bg-pink-600 hover:bg-pink-700"
            />
          </div>
        </section>
      )}
    </div>
  );
}
