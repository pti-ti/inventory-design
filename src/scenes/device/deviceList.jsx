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
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeviceHistoryModal from "./DeviceHistoryModal"; // Ajusta la ruta si es necesario
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { exportDevices } from "../excel/exportDevices";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Tooltip from "@mui/material/Tooltip";

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
  const { user } = useContext(AuthContext);
  const role = user?.userType?.replace("ROLE_", ""); // Ejemplo de rol: "TECHNICIAN"
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [deviceHistory, setDeviceHistory] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No se encontró un token en localStorage");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Dispositivos obtenidos:", response.data);

      const formattedDevices = response.data.map(device => ({
        id: device.id,
        code: device.code,
        brand: device.brandName,  // Se cambia 'brand' por 'brandName'
        model: device.modelName,  // Se cambia 'model' por 'modelName'
        serial: device.serial,
        type: device.type,
        specification: device.specification,
        location: device.locationName, // Se cambia 'location' por 'locationName'
        status: device.statusName,  // Se cambia 'status' por 'statusName'
        price: device.price,
        userEmail: device.userEmail || "Sin asignar",
        note: device.note || "Sin nota",
        createdAt: device.createdAt,
        createdBy: device.createdByEmail,

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
      const apiUrl = `${API_BASE_URL}/api/v1/devices/register`;

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
      const apiUrl = `${API_BASE_URL}/api/v1/devices/${deviceData.id}`;

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

  const [deviceInfo, setDeviceInfo] = useState({});

  const handleShowHistory = async (device) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/logbooks/device/${device.id}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeviceHistory(response.data);
      // Guarda la info del dispositivo seleccionado
      setDeviceInfo({
        createdAt: device.createdAt,
        createdBy: device.createdBy,
      });
      setHistoryModalOpen(true);
    } catch (error) {
      setSnackbarMessage("No se pudo cargar el historial.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
      await axios.delete(`${API_BASE_URL}/api/v1/devices/${deviceToDelete}`, {
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
    { field: "id", headerName: "ID", width: 50, cellClassName: "name-column--cell" },
    { field: "code", headerName: "Código", width: 0, cellClassName: "name-column--cell" },
    { field: "brand", headerName: "Marca", width: 80, cellClassName: "name-column--cell" },
    { field: "model", headerName: "Modelo", flex: 1, cellClassName: "name-column--cell" },
    { field: "serial", headerName: "Serial", flex: 1, cellClassName: "name-column--cell" },
    { field: "specification", headerName: "Especificaciones", flex: 1, cellClassName: "name-column--cell" },
    { field: "type", headerName: "Tipo", flex: 1, cellClassName: "name-column--cell" },
    { field: "note", headerName: "Nota", flex: 1, cellClassName: "name-column--cell" },
    { field: "userEmail", headerName: "Asignado a:", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "price",
      headerName: "Precio",
      width: 50,
      cellClassName: "name-column--cell",
      renderCell: (params) => formatPrice(params.value) // Aplicar formato a los precios
    },
    { field: "status", headerName: "Estado", flex: 1, cellClassName: "name-column--cell" },
    { field: "location", headerName: "Ubicación", flex: 1, cellClassName: "name-column--cell" },
    // Solo mostrar acciones si el rol no es TECHNICIAN
    ...(role !== "TECHNICIAN" ? [{
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => handleEdit(params.row)}
              sx={{ color: colors.greenAccent[400] }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              onClick={() => handleOpenConfirmModal(params.row.id)}
              sx={{ color: colors.greenAccent[400], ml: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Historial">
            <IconButton
              onClick={() => handleShowHistory(params.row)}
              sx={{ color: colors.greenAccent[400], ml: 1 }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    }] : []),
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center"></Box>
      <Header title="DISPOSITIVOS" subtitle="Búsqueda de los dispositivos de TI" />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {/* Mostrar el botón "Agregar Dispositivo" para todos los roles */}
        <Button variant="contained" color="primary" onClick={() => {
          setSelectedDevice(null);
          setIsEditing(false);
          setOpenModal(true);
        }} startIcon={<LaptopOutlinedIcon />}>
          Agregar Dispositivo
        </Button>

        {/* Solo mostrar el botón "Exportar a Excel" si el rol no es TECHNICIAN */}
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

      <DeviceHistoryModal
        open={historyModalOpen}
        handleClose={() => setHistoryModalOpen(false)}
        history={deviceHistory}
        deviceCreatedAt={deviceInfo.createdAt}
        deviceCreatedBy={deviceInfo.createdBy}
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