import api from "./api";

// Registrar localización
export const registerLocation = async (locationData) => {
    try {
      const response = await api.post("/location/register", locationData);
      return response.data;
    } catch (error) {
      console.error("Error al registrar ubicación:", error);
        throw error;
    }
};