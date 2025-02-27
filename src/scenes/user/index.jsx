import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";

const User = () => {
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
  
          const response = await axios.get("http://localhost:8085/api/v1/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("Datos recibidos de la API:", response.data);
  
          if (Array.isArray(response.data)) {
            const processedData = response.data.map((user) => ({
              ...user,
              locationName: user.location?.name || "Sin ubicación", 
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
    { field: "id", headerName: "ID" },
    { field: "email", headerName: "Email", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "locationName",
      headerName: "Ubicación",
      flex: 1,
      cellClassName: "name-column--cell",
    },
  ];
  

  return (
    <Box m="20px">
      <Header title="USUARIOS" subtitle="Búsqueda de los usuarios del registro TI" />
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

export default User;
