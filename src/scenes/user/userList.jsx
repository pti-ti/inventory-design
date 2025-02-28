import { Box, Typography, useTheme, Button, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UserModal from "./userModal";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

const User = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No se encontró un token en localStorage");
        return;
      }
      const response = await axios.get("http://localhost:8085/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Usuarios obtenidos:", response.data);
      
      // Asegurar que cada usuario tenga un ID único para DataGrid
      const formattedUsers = response.data.map(user => ({
        ...user,
        id: user.id || user._id, // Ajustar según la API
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
    setOpenModal(true);
  };

  const handleOpenConfirmModal = (id) => {
    setUserToDelete(id);
    setOpenConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8085/api/v1/admin/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
    setOpenConfirmModal(false);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "email", headerName: "Email", flex: 1, cellClassName: "name-column--cell" },
    { field: "location", headerName: "Ubicación", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
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
        <DataGrid checkboxSelection rows={rows} columns={columns} />
      </Box>

      {/* Modal para editar usuario */}
      <UserModal open={openModal} handleClose={() => setOpenModal(false)} user={selectedUser} refreshUsers={fetchData} />

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

export default User;
