import { Box, Typography, useTheme, Button, IconButton } from "@mui/material";
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

const Maintenance = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
  const currentUserId = localStorage.getItem("userId");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No se encontró un token en localStorage");
        return;
      }
      
      const response = await axios.get("http://localhost:8085/api/v1/admin/maintenances", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Mantenimientos obtenidos:", response.data);
      
      // Formatear datos correctamente
      const formattedMaintenances = response.data.map(maintenance => ({
        ...maintenance,
        deviceId: maintenance.deviceId ?? 0,
        deviceCode: maintenance.deviceCode || "Desconocido",
        deviceName: maintenance.deviceName || "Desconocido",
        userEmail: maintenance.userEmail || "Desconocido",
        maintenanceType: maintenance.maintenanceType || "Desconocido",
        comment: maintenance.comment || "Desconocido",
        maintenanceDate: maintenance.maintenanceDate 
          ? new Date(maintenance.maintenanceDate).toLocaleDateString("es-ES", {
              year: "numeric", month: "2-digit", day: "2-digit"
            })
          : "Fecha no disponible"
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
      await axios.delete(`http://localhost:8085/api/v1/admin/maintenances/${maintenanceToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el mantenimiento:", error);
    }
    setOpenConfirmModal(false);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "deviceId", headerName: "ID dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceCode", headerName: "Código del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceName", headerName: "Nombre del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "userEmail", headerName: "Email del usuario", flex: 1, cellClassName: "name-column--cell" },
    { field: "maintenanceType", headerName: "Tipo de mantenimiento", flex: 1, cellClassName: "name-column--cell" },
    { field: "comment", headerName: "Comentarios", flex: 1, cellClassName: "name-column--cell" },
    { 
      field: "maintenanceDate", 
      headerName: "Fecha de mantenimiento", 
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
    </Box>
  );
};

export default Maintenance;
