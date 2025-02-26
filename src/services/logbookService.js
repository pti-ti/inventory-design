import api from "./api";

// Registrar bitácora
export const registerLogbook = async (logbookData) => {
    try {
      const response = await api.post("/logbook/register", logbookData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar bitácora:", error);
      throw error;
    }
  };