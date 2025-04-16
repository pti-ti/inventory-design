import { Box, Typography, useTheme, Button, IconButton, Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import MaintenanceModal from "./maintenanceModal";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import * as XLSX from "xlsx";

const filePath = "";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const updateMaintenanceExcel = async () => {
  try {
    // 1. Obtener datos de la API
    const token = "tu_token"; // Reemplaza con el token real
    const response = await axios.get(`${API_BASE_URL}/api/v1/admin/maintenances`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data || response.data.length === 0) {
      console.error("No hay datos de mantenimiento.");
      return;
    }

    // Obtener la fecha de mantenimiento
    const maintenanceDate = response.data[0]?.maintenanceDate;
    if (!maintenanceDate) {
      console.error("No se encontró la fecha.");
      return;
    }

    // 2. Leer el archivo Excel existente
    if (!fs.existsSync(filePath)) {
      console.error("El archivo de mantenimiento no existe.");
      return;
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Primera hoja
    const worksheet = workbook.Sheets[sheetName];

    // 3. Modificar la celda J6 con la nueva fecha
    worksheet["J6"] = { t: "s", v: new Date(maintenanceDate).toLocaleDateString("es-ES") };

    // 4. Guardar los cambios en el mismo archivo
    XLSX.writeFile(workbook, filePath);

    console.log("Archivo de mantenimiento actualizado correctamente. ✅");
  } catch (error) {
    console.error("Error al actualizar el archivo Excel:", error);
  }
};

// Ejecutar la función
updateMaintenanceExcel();

const Maintenance = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
  const currentUserId = localStorage.getItem("userId");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No se encontró un token en localStorage");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/admin/maintenances`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Mantenimientos obtenidos:", response.data);



      // Formatear datos correctamente
      const formattedMaintenances = response.data.map(maintenance => ({
        ...maintenance,
        deviceId: maintenance.deviceId ?? 0,
        deviceCode: maintenance.deviceCode || "Desconocido",
        deviceBrand: maintenance.deviceBrand || "Desconocido",
        deviceModel: maintenance.deviceModel || "Desconocido",
        userEmail: maintenance.userEmail || "Desconocido",
        userLocation: maintenance.userLocation || "Desconocida",
        maintenanceType: maintenance.maintenanceType || "Desconocido",
        comment: maintenance.comment || "Desconocido",
        createdByEmail: maintenance.createdByEmail || "Desconocido",
        maintenanceDate: maintenance.maintenanceDate
          ? new Date(maintenance.maintenanceDate).toISOString().split("T")[0]
          : null

      }));

      setRows(formattedMaintenances);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      alert("Error al cargar los mantenimientos, intenta nuevamente.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedMaintenance(null); // Indica que se creará un nuevo mantenimiento
    setOpenModal(true);
  };

  const handleEdit = (maintenance) => {
    setSelectedMaintenance(maintenance); // Se pasa el mantenimiento seleccionado para edición
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMaintenance(null); // Se limpia el estado para evitar persistencia accidental
  };

  const handleOpenConfirmModal = (id) => {
    setMaintenanceToDelete(id);
    setOpenConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/v1/admin/maintenances/${maintenanceToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSnackbarMessage("Mantenimiento eliminado correctamente.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      fetchData(); // Recargar la lista de mantenimientos
    } catch (error) {
      console.error("Error al eliminar el mantenimiento:", error);
      setSnackbarMessage("Error al eliminar el mantenimiento.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    setOpenConfirmModal(false);
  };


  const columns = [
    { field: "id", headerName: "ID", width: 40 },
    { field: "deviceId", headerName: "ID dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceCode", headerName: "Código del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceBrand", headerName: "Marca", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceModel", headerName: "Modelo", flex: 1, cellClassName: "name-column--cell" },
    { field: "userEmail", headerName: "Email del usuario", flex: 1, cellClassName: "name-column--cell" },
    { field: "userLocation", headerName: "Ubicación del usuario", flex: 1, cellClassName: "name-column--cell" },
    { field: "maintenanceType", headerName: "Tipo de mantenimiento", flex: 1, cellClassName: "name-column--cell" },
    { field: "comment", headerName: "Comentarios", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "items",
      headerName: "Ítems utilizados",
      flex: 2,
      renderCell: (params) => (
        <span>{params.value?.map(item => item.name).join(", ") || "Sin ítems"}</span>
      ),
      cellClassName: "name-column--cell"
    },
    {
      field: "maintenanceDate",
      headerName: "Fecha de mantenimiento",
      flex: 1,
      cellClassName: "name-column--cell"
    },
    {
      field: "createdByEmail",
      headerName: "Creado por",
      flex: 1,
      cellClassName: "name-column--cell"
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="default" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleOpenConfirmModal(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];


  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center"></Box>
      <Header title="MANTENIMIENTOS" subtitle="Búsqueda de los mantenimientos de los dispositivos de TI" />
      <Button variant="contained" color="primary" onClick={handleOpenCreateModal} startIcon={<BuildOutlinedIcon />}>
        Agregar Mantenimiento
      </Button>

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
        <DataGrid checkboxSelection rows={rows} columns={columns} />
      </Box>

      {/* Modal para registrar/editar mantenimiento */}
      <MaintenanceModal
        open={openModal}
        handleClose={handleCloseModal}
        maintenance={selectedMaintenance}
        isEditing={!!selectedMaintenance} // true si se está editando, false si se está creando
        refreshMaintenances={fetchData}
      />

      {/* Modal de confirmación de eliminación */}
      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que deseas eliminar este mantenimiento? Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)} color="default">Cancelar</Button>
          <Button onClick={handleDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}

      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Maintenance;
