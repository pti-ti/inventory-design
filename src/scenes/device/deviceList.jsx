import { Box, Typography, useTheme, Button, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeviceModal from "./deviceModal";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

const Device = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

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
      
      // Formatear datos correctamente
      const formattedDevices = response.data.map(device => ({
        ...device,
        id: device.id,  // Se asume que `id` siempre está presente
        status: device.status?.name || "Desconocido"
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

  const handleEdit = (device) => {
    setSelectedDevice(device);
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
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el dispositivo:", error);
    }
    setOpenConfirmModal(false);
  };

  const columns = [
    { field: "id", headerName: "ID" },
    { field: "code", headerName: "Código", flex: 1, cellClassName: "name-column--cell" },
    { field: "name", headerName: "Nombre", flex: 1, cellClassName: "name-column--cell" },
    { field: "serial", headerName: "Serial", flex: 1, cellClassName: "name-column--cell" },
    { field: "specification", headerName: "Especificaciones", flex: 1, cellClassName: "name-column--cell" },
    { field: "type", headerName: "Tipo", flex: 1, cellClassName: "name-column--cell" },
    { field: "price", headerName: "Precio", flex: 1, cellClassName: "name-column--cell" },
    { field: "status", headerName: "Estado", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => {
          console.log("Botón Editar presionado:", params.row);
          handleEdit(params.row);
        }}>
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
      <Header title="DISPOSITIVOS" subtitle="Búsqueda de los dispositivos de TI" />
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

      {/* Modal para editar usuario */}
      <DeviceModal open={openModal} handleClose={() => setOpenModal(false)} device={selectedDevice} refreshDevices={fetchData} />

      {/* Modal de confirmación de eliminación */}
      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)} color="primary">Cancelar</Button>
          <Button onClick={handleDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Device;
