import api from "./api";

// Registrar estado
export const registerStatus = async (statusData) => {
    try {
      const response = await api.post("/status/register", statusData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar estado:", error);
        throw error;
    }
};