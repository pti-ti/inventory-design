import api from "./api";

// Registrar usuario con contraseña por defecto
export const registerUser = async (userData) => {
    try {
      const response = await api.post("/register", userData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
    }
  };