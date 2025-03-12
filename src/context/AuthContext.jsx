import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    let userType = localStorage.getItem("userType");

    console.log("Datos recuperados del localStorage:", { token, username, userType });

    if (token && username) {
      if (userType === "undefined" || userType === "null" || !userType) {
        userType = null; // Aseguramos que no tenga valores inválidos
      }
      
      setUser({ username, userType });
      console.log("Usuario cargado en useEffect:", { username, userType });
    }
  }, []);

  const login = (userData, token) => {
    console.log("Datos recibidos en login:", userData);

    const { username, userType } = userData || {}; 

    console.log("Valores extraídos:", { username, userType });

    if (!username) {
      console.error("⚠️ Error: No se recibió un username válido en login");
      return;
    }

    if (!userType) {
      console.warn("⚠️ Advertencia: userType es null o undefined");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("userType", userType || ""); // Evita guardar valores inválidos

    setUser({ username, userType: userType || null });

    console.log("Usuario después del login:", { username, userType });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userType");
    setUser(null);
    console.log("Usuario cerró sesión");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
