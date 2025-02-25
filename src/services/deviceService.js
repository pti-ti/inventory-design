import api from "./api";

// Registrar dispositivo
export const registerDevice = async (deviceData) => {
    try {
      const response = await api.post("/device/register", deviceData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar dispositivo:", error);
        throw error;
    }
};