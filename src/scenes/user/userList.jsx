import { Box, Typography, useTheme, Button, IconButton, Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/PersonAdd";
import UserModal from "./userModal";
import Tooltip from "@mui/material/Tooltip";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

const User = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No se encontró un token en localStorage");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Colaboradores obtenidos:", response.data);

      const formattedUsers = response.data.map(user => ({
        ...user,
        id: user.id || user._id,
        location: user.location?.name || "No disponible"
      }));

      setRows(formattedUsers);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setOpenAddModal(true);
  };

  const handleOpenConfirmModal = (id) => {
    setUserToDelete(id);
    setOpenConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/v1/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData(); // Refresca la lista de usuarios
      setSnackbarMessage("Colaborador eliminado correctamente");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error al eliminar el colaborador:", error);
      setSnackbarMessage("Error al eliminar el colaborador");
      setOpenSnackbar(true);
    }
    setOpenConfirmModal(false);
  };


  const columns = [
    { field: "id", headerName: "ID", width: 60, cellClassName: "name-column--cell" },
    { field: "email", headerName: "Email", flex: 1, cellClassName: "name-column--cell" },
    { field: "location", headerName: "Ubicación", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
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
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center"></Box>
      <Header title="COLABORADORES" subtitle="Búsqueda de los colaboradores de TI" />
      <Button variant="contained" color="primary" onClick={() => handleOpenAddModal()} startIcon={<AddIcon />}>
        Agregar Colaborador
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

      <UserModal open={openAddModal} handleClose={() => setOpenAddModal(false)} user={null} refreshUsers={fetchData} />
      <UserModal open={openEditModal} handleClose={() => setOpenEditModal(false)} user={selectedUser} refreshUsers={fetchData} />

      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que deseas eliminar este colaborador? Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)} color="primary">Cancelar</Button>
          <Button onClick={handleDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default User;
