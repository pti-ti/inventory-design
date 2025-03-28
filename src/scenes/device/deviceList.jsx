import { Box, useTheme, Button, IconButton, Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined";
import DeviceModal from "./deviceModal";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { exportDevices } from "../excel/exportDevices";

const Device = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success", "error", "warning", etc.


  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No se encontró un token en localStorage");
        return;
      }

      const response = await axios.get("http://localhost:8085/api/v1/admin/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Dispositivos obtenidos:", response.data);

      const formattedDevices = response.data.map(device => ({
        ...device,
        id: device.id,
        status: device.status?.name || "Desconocido",
        location: device.location?.name || "No especificado",
      }));

      setRows(formattedDevices);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      alert("Error al cargar los dispositivos, intenta nuevamente.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterDevice = async (deviceData) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = "http://localhost:8085/api/v1/admin/devices/register";

      console.log("Registrando dispositivo:", JSON.stringify(deviceData, null, 2));

      await axios.post(apiUrl, deviceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData();
      setOpenModal(false);
    } catch (error) {
      console.error("Error al registrar el dispositivo", error);
    }
  };

  const handleUpdateDevice = async (deviceData) => {

    try {
      const token = localStorage.getItem("token");
      const apiUrl = `http://localhost:8085/api/v1/admin/devices/${deviceData.id}`;

      console.log("Actualizando dispositivo:", JSON.stringify(deviceData, null, 2));

      await axios.put(apiUrl, deviceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData();
      setOpenModal(false);
    } catch (error) {
      console.error("Error al actualizar el dispositivo", error);
    }
  };

  const handleEdit = (device) => {
    console.log("Editando dispositivo:", device);
    setSelectedDevice(device);
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleOpenConfirmModal = (id) => {
    setDeviceToDelete(id);
    setOpenConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8085/api/v1/admin/devices/${deviceToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSnackbarMessage("Dispositivo eliminado correctamente");
      setSnackbarSeverity("success");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el dispositivo:", error);
      setSnackbarMessage("Error al eliminar el dispositivo");
      setSnackbarSeverity("error");
    }

    setSnackbarOpen(true);
    setOpenConfirmModal(false);
  };


  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(price);
  };

  const columns = [
    { field: "id", headerName: "ID" },
    { field: "code", headerName: "Código", flex: 1, cellClassName: "name-column--cell" },
    { field: "name", headerName: "Nombre", flex: 1, cellClassName: "name-column--cell" },
    { field: "serial", headerName: "Serial", flex: 1, cellClassName: "name-column--cell" },
    { field: "specification", headerName: "Especificaciones", flex: 1, cellClassName: "name-column--cell" },
    { field: "type", headerName: "Tipo", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "price",
      headerName: "Precio",
      flex: 1,
      cellClassName: "name-column--cell",
      renderCell: (params) => formatPrice(params.value) // Aplicar formato a los precios
    },
    //{ field: "price", headerName: "Precio", flex: 1, cellClassName: "name-column--cell" },
    { field: "status", headerName: "Estado", flex: 1, cellClassName: "name-column--cell" },
    { field: "location", headerName: "Ubicación", flex: 1, cellClassName: "name-column--cell" },
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
      <Header title="DISPOSITIVOS" subtitle="Búsqueda de los dispositivos de TI" />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button variant="contained" color="primary" onClick={() => {
          setSelectedDevice(null);
          setIsEditing(false);
          setOpenModal(true);
        }} startIcon={<LaptopOutlinedIcon />}>
          Agregar Dispositivo
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => exportDevices(rows)} // Pasa los datos como argumento
        >
          Exportar a Excel
        </Button>
      </Box>
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

      {/* Modal para registrar/editar dispositivo */}
      <DeviceModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        device={selectedDevice}
        refreshDevices={fetchData}
        handleRegister={handleRegisterDevice}
        handleUpdate={handleUpdateDevice}
        isEditing={isEditing}
      />

      {/* Modal de confirmación de eliminación */}
      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que deseas eliminar este dispositivo? Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)} color="primary">Cancelar</Button>
          <Button onClick={handleDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};


export default Device;