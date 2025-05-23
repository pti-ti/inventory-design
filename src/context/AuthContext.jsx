import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userType");
    setUser(null);
    navigate("/login");
    console.log("🔴 Usuario cerró sesión");
  };

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      let userType = localStorage.getItem("userType");

      if (token && username) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Convertimos a segundos

          if (decoded.exp < currentTime) {
            console.warn("🔴 Token expirado, cerrando sesión...");
            logout();
            return;
          }

          if (!userType || userType === "undefined" || userType === "null") {
            userType = null;
          }

          setUser({ username, userType });
          console.log("✅ Usuario autenticado:", { username, userType });
        } catch (error) {
          console.error("⚠️ Error al decodificar el token:", error);
          logout();
        }
      }
    };

    checkTokenExpiration();
    
    // Limpiar eventos cuando el componente se desmonte (en caso de que quieras manejar algún otro evento)
    return () => {};
  }, []);

  const login = (userData, token) => {
    console.log("Datos recibidos en login:", userData);
    const { username, userType } = userData || {};

    if (!username) {
      console.error("⚠️ Error: No se recibió un username válido en login");
      return;
    }

    if (!userType) {
      console.warn("⚠️ Advertencia: userType es null o undefined");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("userType", userType || "");

    setUser({ username, userType: userType || null });
    console.log("✅ Usuario después del login:", { username, userType });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
