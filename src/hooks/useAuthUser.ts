"use client";
import { useState, useEffect } from "react";
import { UsuarioGet } from "@/types/usuario/usuario";

export function useAuthUser(): UsuarioGet | null {
  const [user, setUser] = useState<UsuarioGet | null>(null);

  useEffect(() => {
    const updateUserState = () => {
      if (typeof window !== "undefined") {
        const userDataString = localStorage.getItem("userData");
        if (userDataString) {
          try {
            const userData: UsuarioGet = JSON.parse(userDataString);
            setUser(userData);
          } catch (error) {
            console.error(
              "Error parsing user data from localStorage:",
              error
            );
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    updateUserState(); // Initial check

    const authChannel = new BroadcastChannel("auth_channel");
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data === "logout" || event.data === "login") {
        updateUserState();
      }
    };

    authChannel.addEventListener("message", handleAuthMessage);

    // Also listen for storage events, as a fallback
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "userData") {
        updateUserState();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      authChannel.removeEventListener("message", handleAuthMessage);
      window.removeEventListener("storage", handleStorageChange);
      authChannel.close();
    };
  }, []);

  return user;
}
