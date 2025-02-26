import api from "./api";

// Registrar mantenimiento
export const registerLogbook = async (logbookData) => {
    try {
      const response = await api.post("/maintenance/register", maintenanceData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar mantenimiento:", error);
      throw error;
    }
  };