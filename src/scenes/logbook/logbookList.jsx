import { Box, Typography, useTheme, Button, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LogbookModal from "./logbookModal";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

const Logbook = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [logbookToDelete, setLogbookToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No se encontró un token en localStorage");
        return;
      }
      
      const response = await axios.get("http://localhost:8085/api/v1/admin/logbooks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedLogbooks = response.data.map(logbook => ({
        id: logbook.id || 0,
        deviceCode: logbook.deviceCode || "Desconocido",
        deviceName: logbook.deviceName || "Desconocido",
        userEmail: logbook.userEmail || "No asignado",
        statusName: logbook.statusName || "Desconocido",
        locationName: logbook.locationName || "Sin ubicación",
        note: logbook.note || "Sin notas",
        createdAt: logbook.createdAt
          ? new Date(logbook.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" })
          : "Fecha no disponible"
      }));

      setRows(formattedLogbooks);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      alert("Error al cargar los mantenimientos, intenta nuevamente.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (logbook = null) => {
    setSelectedLogbook(logbook);
    setOpenModal(true);
  };

  const handleOpenConfirmModal = (id) => {
    setLogbookToDelete(id);
    setOpenConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!logbookToDelete) {
      console.error("No se ha seleccionado ninguna bitácora para eliminar.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8085/api/v1/admin/logbooks/${logbookToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar la bitácora:", error);
    }

    setOpenConfirmModal(false);
    setLogbookToDelete(null);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "deviceCode", headerName: "Código del dispositivo", flex: 1 },
    { field: "deviceName", headerName: "Nombre del dispositivo", flex: 1 },
    { field: "userEmail", headerName: "Email del usuario", flex: 1 },
    { field: "statusName", headerName: "Estado", flex: 1 },
    { field: "locationName", headerName: "Ubicación", flex: 1 },
    { field: "note", headerName: "Notas", flex: 1 },
    { field: "createdAt", headerName: "Creado el", flex: 1 },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="default" onClick={() => handleOpenModal(params.row)}>
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="BITÁCORAS" subtitle="Búsqueda de las bitácoras del registro TI" />
        <Button variant="contained" color="primary" onClick={() => handleOpenModal()} startIcon={<FactCheckOutlinedIcon />}>
          Agregar bitácora
        </Button>
      </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
        <DataGrid checkboxSelection rows={rows} columns={columns} />
      </Box>

      {/* Modal para registrar/editar bitácora */}
      <LogbookModal 
        open={openModal}
        handleClose={() => setOpenModal(false)}
        logbook={selectedLogbook}
        isEditing={!!selectedLogbook} 
        refreshLogbooks={fetchData}
      />

      {/* Modal de confirmación de eliminación */}
      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que deseas eliminar esta bitácora? Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)} color="primary">Cancelar</Button>
          <Button onClick={handleDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logbook;
