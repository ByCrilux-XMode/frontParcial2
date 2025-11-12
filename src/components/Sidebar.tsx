"use client";
import { useState, ReactNode, useEffect } from "react";
// Se han eliminado las importaciones de next/link y next/navigation,
// y se han reemplazado con simulaciones para que el código compile en el entorno.
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Users as UsersIcon,
  FileText as FileTextIcon,
  ChevronDown as ChevronDownIcon,
  LayoutDashboardIcon,
  StoreIcon,
  LogOut,
  X,
  ClipboardList,
  User as UserProfileIcon,
  StepForwardIcon,
} from "lucide-react";
import { UsuarioGet } from "@/types/usuario/usuario";
import { apiFetcher } from "@/lib/apiFetcher";

const usePathname = () => "/admin";

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: ReactNode;
  children?: SubMenuItem[];
}

// Componente de Ícono de Cierre para Móvil (Ahora usando X de Lucide)
const CloseIcon = () => <X className="h-6 w-6" />;

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  // Usamos usePathname (simulado) para obtener la ruta actual y determinar el estado activo
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UsuarioGet | null>(null);

  // 3. useEffect para leer desde localStorage (solo se ejecuta en el cliente)
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        setUser(JSON.parse(storedUserData));
      } catch (e) {
        console.error("Error al parsear userData de localStorage", e);
      }
    }
  }, []);
  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  // Función para verificar si un enlace es el activo
  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    // Lógica de logout simulada
    const data = apiFetcher("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    //const authChannel = new BroadcastChannel("auth_channel");
    //authChannel.postMessage("logout");
    localStorage.removeItem("userData");
    router.push("/login");
  };

  const menuItems: MenuItem[] = [
    {
      name: "Panel Principal",
      href: "/admin",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      name: "Ventas & Caja",
      icon: <StoreIcon className="h-5 w-5" />,
      children: [
        {
          name: "Nota de Venta",
          href: "/admin/venta/nota_venta", // Esto lo usarían los vendedores constantemente
        },
        {
          name: "Registros de Venta",
          href: "/admin/venta/registro",
        },
      ],
    },
    {
      name: "Inventario",
      icon: <ClipboardList className="h-5 w-5" />,
      children: [
        {
          name: "Control de Stock",
          href: "/admin/inventario/stock",
        },
        {
          name: "Catálogo de Productos",
          href: "/admin/inventario/catalogo",
        },
        {
          name: "Categorías",
          href: "/admin/inventario/categoria",
        },
      ],
    },
    {
      name: "Usuarios",
      icon: <UsersIcon className="h-5 w-5" />,
      children: [
        {
          name: "Clientes",
          href: "/admin/usuario/cliente",
        },
        {
          name: "Vendedores",
          href: "/admin/usuario/vendedor", // Asumo que solo lo ven Admins o Gerentes
        },
      ],
    },
    {
      name: "Reportes",
      icon: <FileTextIcon className="h-5 w-5" />,
      children: [
        {
          name: "Reporte Dinámico",
          href: "/admin/reporte/reporte_dinamico",
        },
        {
          name: "Pronóstico ",
          href: "/admin/reporte/pronostico",
        },
      ],
    },
  ];

  const rol = user?.rolNombre;
  let filteredMenuItems = [...menuItems];

  if (rol === "ROLE_VENDEDOR") {
    filteredMenuItems = menuItems
      .filter(
        (item) =>
          item.name === "Panel Principal" ||
          item.name === "Ventas & Caja" ||
          item.name === "Inventario" || // <-- Añadido
          item.name === "Usuarios"
      )
      .map((item) => {
        if (item.name === "Usuarios") {
          return {
            ...item,
            children: item.children?.filter(
              (child) => child.name === "Clientes"
            ),
          };
        }
        if (item.name === "Inventario") {
          // Para Vendedor, solo mostrar "Control de Stock"
          return {
            ...item,
            children: item.children?.filter(
              (child) => child.name === "Control de Stock"
            ),
          };
        }
        return item;
      });
  } else if (rol !== "ROLE_ADMIN") {
    // Si no es vendedor ni admin, solo ve el panel principal
    filteredMenuItems = menuItems.filter(
      (item) => item.name === "Panel Principal"
    );
    console.log(rol);
  }

  return (
    <>
      {/* Botón hamburguesa y overlay para móvil */}
      <div className="md:hidden fixed top-1/12 -translate-y-1 ">
        <button
          className="p-2 bg-slate-700 text-white rounded-e-2xl   "
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <StepForwardIcon />
        </button>
        {open && (
          <div
            className="fixed inset-0  z-30"
            onClick={() => setOpen(false)}
          ></div>
        )}
      </div>

      {/* Sidebar Principal */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 w-64 h-screen bg-slate-900 text-gray-300 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out 
                md:sticky md:top-0 md:translate-x-0 md:flex md:flex-col md:h-screen overflow-y-auto`}
      >
        {/* Encabezado de la Boutique */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h1 className="font-extrabold text-lg text-white tracking-wider">
            Boutique TRENDORA
          </h1>
          <button
            className="md:hidden p-1 text-gray-400 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 p-3 space-y-2 font-medium">
          {filteredMenuItems.map((item, i) => {
            const hasChildren = !!item.children;
            const itemIsActive = item.href && isActive(item.href);

            // Clase base para los elementos del menú
            const baseClasses =
              "w-full flex items-center p-3 rounded-lg transition-all duration-150 group";
            // Clase de estado normal/hover
            const defaultClasses =
              "text-gray-300 hover:bg-slate-800 hover:text-white";
            // Clase de estado activo (El acento dorado)
            const activeClasses =
              "bg-amber-500 text-slate-900 shadow-md font-semibold";

            const linkClasses = itemIsActive ? activeClasses : defaultClasses;

            return (
              <div key={i}>
                {!hasChildren ? (
                  // 1. Enlace normal (sin submenú)
                  <Link
                    href={item.href || "#"}
                    onClick={() => setOpen(false)}
                    className={`${baseClasses} ${linkClasses}`}
                  >
                    <span
                      className={`mr-3 ${
                        itemIsActive
                          ? "text-slate-900"
                          : "text-amber-500 group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  // 2. Elemento con submenú
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`${baseClasses} ${defaultClasses} justify-between`}
                    >
                      <span className="flex items-center">
                        <span className="mr-3 text-amber-500">{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      <span
                        className={`transform transition-transform duration-200 ${
                          openSubmenu === item.name ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDownIcon className="h-5 w-5" />
                      </span>
                    </button>

                    {/* Submenú Colapsable */}
                    <div
                      className={`pl-8 mt-1 space-y-1 transition-all duration-300 ease-in-out ${
                        openSubmenu === item.name
                          ? "max-h-96 opacity-100 pt-1" // Altura generosa para asegurar la apertura
                          : "max-h-0 opacity-0"
                      } overflow-hidden`}
                    >
                      {item.children?.map((sub, j) => {
                        const subIsActive = isActive(sub.href);
                        const subLinkClasses = subIsActive
                          ? "bg-amber-600 text-white font-semibold"
                          : "text-gray-400 hover:bg-slate-700 hover:text-white";

                        return (
                          <Link
                            key={j}
                            href={sub.href}
                            onClick={() => setOpen(false)}
                            className={`block p-2 text-sm rounded-lg transition duration-150 ${subLinkClasses}`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sección de Logout (Abajo) */}
        {/* --- ¡SECCIÓN MODIFICADA! --- */}
        {/* Sección de Usuario y Logout (Abajo) */}
        <div className="border-t border-slate-700/50">
          {/* Perfil de Usuario */}
          <div className="flex items-center p-4 mt-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900">
              {user ? (
                // Muestra la inicial del nombre
                user.nombre.charAt(0).toUpperCase()
              ) : (
                // Icono de 'cargando'
                <UserProfileIcon className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3 min-w-0">
              <p
                className="font-semibold text-white truncate"
                title={user ? `${user.nombre} ${user.apellido}` : ""}
              >
                {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
              </p>
              <p className="text-sm text-gray-400 truncate">
                {user ? user.rolNombre : "..."}
              </p>
            </div>
          </div>

          {/* Botón de Logout */}
          <div className="p-4 pt-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
