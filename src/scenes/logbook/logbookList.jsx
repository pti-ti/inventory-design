import { Box, Typography, useTheme, Button, IconButton, Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LogbookModal from "./logbookModal";
import Tooltip from "@mui/material/Tooltip";
import LogbookHistoryModal from "./logbookHistoryModal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

const LogbookList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [logbookToDelete, setLogbookToDelete] = useState(null);
  const currentUserId = localStorage.getItem("userId");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No tienes permiso para ver esta información.");
        throw new Error("No se encontró un token en localStorage");
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/logbooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Bitácoras obtenidas:", response.data);

      // Formatear datos correctamente
      const formattedLogbooks = response.data.map(logbook => ({
        id: logbook.id || 0,
        deviceCode: logbook.deviceCode || "Desconocido",
        deviceBrand: logbook.deviceBrand || "Desconocido",
        deviceModel: logbook.deviceModel || "Desconocido",
        userEmail: logbook.userEmail || "No asignado",
        statusName: logbook.deviceStatus || "Desconocido",
        locationName: logbook.deviceLocation || "Sin ubicación",
        note: logbook.note || "Sin notas",
        createdAt: logbook.createdAt
          ? new Date(logbook.createdAt).toLocaleDateString("es-ES", {
            year: "numeric", month: "2-digit", day: "2-digit"
          })
          : "Fecha no disponible",
        changes: logbook.changes || ""
      }));
      console.log("Bitácoras formateadas:", formattedLogbooks);
      setRows(formattedLogbooks);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      alert("Error al cargar los mantenimientos, intenta nuevamente.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowHistory = (logbook) => {
    setSelectedHistory(logbook);
    setHistoryModalOpen(true);
  };

  const handleEdit = (logbook) => {
    console.log("Bitácora seleccionada para editar:", logbook)
    setSelectedLogbook(logbook);
    setOpenModal(true);
  };

  const handleOpenModal = (logbook = null) => {
    setSelectedLogbook(logbook);
    setOpenModal(true);
  };

  const handleOpenConfirmModal = (id) => {
    setLogbookToDelete(id);
    setOpenConfirmModal(true);
  };

  const handleUpdateLogbook = async (updatedLogbook) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No tienes permiso para editar esta bitácora.");
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/v1/logbooks/${updatedLogbook.id}`,
        {
          statusName: updatedLogbook.statusName,
          locationName: updatedLogbook.locationName,
          note: updatedLogbook.note,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchData(); // Recargar antes de cerrar el modal
      setOpenModal(false);
    } catch (error) {
      console.error("Error al actualizar la bitácora:", error);
      alert("No se pudo actualizar la bitácora. Inténtalo nuevamente.");
    }
  };

  const handleDelete = async () => {
    if (!logbookToDelete) {
      console.error("No se ha seleccionado ninguna bitácora para eliminar.");
      return;
    }

    try {
      console.log("Intentando eliminar bitácora con ID:", logbookToDelete.id);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/v1/logbooks/${logbookToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSnackbarMessage("Bitácora eliminada exitosamente.");
      setSnackbarSeverity("success"); // Color verde de éxito
      fetchData(); // Recargar la lista después de eliminar
    } catch (error) {
      console.error("Error al eliminar la bitácora:", error);
      setSnackbarMessage("Error al eliminar la bitácora. Inténtalo nuevamente.");
      setSnackbarSeverity("error"); // Color rojo de error
    }

    setSnackbarOpen(true); // Mostrar el mensaje
    setOpenConfirmModal(false); // Cerrar el modal de confirmación
    setLogbookToDelete(null); // Limpiar la variable de estado
  };

  const handleDownloadExcel = async (logbook) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/excel/logbook`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { logbookId: logbook.id },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Usa el código del dispositivo para el nombre del archivo
      const filename = `Bitacora_${logbook.deviceCode}.xlsx`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      setSnackbarMessage("No se pudo descargar el Excel de la bitácora.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50, cellClassName: "name-column--cell" },
    { field: "deviceCode", headerName: "Código del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceBrand", headerName: "Marca del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "deviceModel", headerName: "Modelo del dispositivo", flex: 1, cellClassName: "name-column--cell" },
    { field: "userEmail", headerName: "Email del usuario", flex: 1, cellClassName: "name-column--cell" },
    { field: "statusName", headerName: "Estado", flex: 1, cellClassName: "name-column--cell" },
    { field: "locationName", headerName: "Ubicación", flex: 1, cellClassName: "name-column--cell" },
    { field: "note", headerName: "Notas", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "createdAt",
      headerName: "Creado el",
      flex: 1,
      cellClassName: "name-column--cell"
    },
    /* {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="default" onClick={() => {
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
    }, */
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ver historial">
            <IconButton
              color="primary"
              onClick={() => handleShowHistory(params.row)}
              sx={{ color: colors.greenAccent[400] }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Descargar Excel">
            <IconButton
              color="success"
              onClick={() => handleDownloadExcel(params.row)}
              sx={{
                color: colors.greenAccent[400],
                ml: 1,
              }}
            >
              <DescriptionOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center"></Box>
      <Header title="BITÁCORAS" subtitle="Búsqueda de las bitácoras de los dispositivos de TI" />
      {/* <Button variant="contained" color="primary" onClick={() => handleOpenModal()} startIcon={<FactCheckOutlinedIcon />}>
        Agregar Bitácora
      </Button> */}

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
      <LogbookModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        logbook={selectedLogbook}
        refreshLogbooks={fetchData}
        handleUpdateLogbook={handleUpdateLogbook}
      />
      <LogbookHistoryModal
        open={historyModalOpen}
        handleClose={() => setHistoryModalOpen(false)}
        logbook={selectedHistory}
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000} // Cierra automáticamente en 4 segundos
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

export default LogbookList;