import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";

// Tomar de referencia este archivo al momento de crear una entidad para listarla.

const Maintenance = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const token = localStorage.getItem("token");
  
          if (!token) {
            console.error("No se encontró un token en localStorage");
            return;
          }
  
          const response = await axios.get("http://localhost:8085/api/v1/admin/maintenances", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("Datos recibidos de la API:", response.data);
  
          if (Array.isArray(response.data)) {
            const processedData = response.data.map((maintenance) => ({
              id: maintenance.id || 0,
              deviceId: maintenance.deviceId || "Desconocido",
              deviceCode: maintenance.deviceCode || "Desconocido",
              deviceName: maintenance.deviceName || "Desconocido",
              userEmail: maintenance.userEmail || "No asignado",
              maintenanceType: maintenance.maintenanceType || "Sin ubicación",
              comment: maintenance.comment || "Sin notas",
            }));

            console.log("Datos procesados:", processedData);
            setRows(processedData);
          } else {
            console.error("La respuesta no es un array:", response.data);
            setRows([]);
          }
        } else {
          console.error("localStorage no está disponible");
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "deviceId", headerName: "ID dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceCode", headerName: "Código del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceName", headerName: "Nombre del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "userEmail", headerName: "Email del usuario", flex: 1, cellClassName: "name-column--cell" },
    { field: "maintenanceType", headerName: "Tipo de mantenimiento", flex: 1, cellClassName: "name-column--cell" },
    { field: "comment", headerName: "Comentarios", flex: 1, cellClassName: "name-column--cell" },
  ];


  return (
    <Box m="20px">
      <Header title="MANTENIMIENTOS" subtitle="Búsqueda de los mantenimientos de los dispositivos de TI" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </Box>
    </Box>
  );
};

export default Maintenance;