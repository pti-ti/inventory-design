import {
    Box, useTheme, Button, IconButton, Snackbar, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import StatusModal from "./statusModal";
import Tooltip from "@mui/material/Tooltip";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

const StatusList = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [rows, setRows] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [statusToDelete, setLocationToDelete] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // 🔹 Función para obtener estados desde la API
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No se encontró un token en localStorage.");
            }

            const response = await axios.get(`${API_BASE_URL}/api/v1/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const formattedLocations = response.data.map(status => ({
                id: status.id || status._id,
                name: status.name,
                createdBy: status.createdBy || "Desconocido",
                createdAt: new Date(status.createdAt).toLocaleDateString()
            }));

            setRows(formattedLocations);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            showSnackbar("Error al cargar el estado.", "error");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSnackbar = (message, severity = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleEdit = (status) => {
        setSelectedStatus(status);
        setOpenEditModal(true);
    };

    const handleOpenAddModal = () => {
        setSelectedStatus(null);
        setOpenAddModal(true);
    };

    const handleOpenConfirmModal = (id) => {
        setLocationToDelete(id);
        setOpenConfirmModal(true);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/api/v1/status/${statusToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            showSnackbar("Estado eliminado correctamente.");
            fetchData();
        } catch (error) {
            console.error("Error al eliminar el estado:", error);
            showSnackbar("No se pudo eliminar el estado.", "error");
        }
        setOpenConfirmModal(false);
    };

    const columns = [
        { field: "id", headerName: "ID", width: 50, cellClassName: "name-column--cell" },
        { field: "name", headerName: "Estado del dispositivo", flex: 1, cellClassName: "name-column--cell" },
        { field: "createdBy", headerName: "Creado Por (ID Usuario)", flex: 1, cellClassName: "name-column--cell" },
        { field: "createdAt", headerName: "Fecha de Creación", flex: 1, cellClassName: "name-column--cell" },
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
            <Header title="ESTADOS" subtitle="Gestión de los estados de los dispositivos de PTI" />
            <Button variant="contained" color="primary" onClick={handleOpenAddModal} startIcon={<AddIcon />}>
                Agregar Estado
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

            <StatusModal
                open={openAddModal}
                handleClose={() => setOpenAddModal(false)}
                status={null}
                refreshStatus={fetchData}
                showSnackbar={showSnackbar}
            />
            <StatusModal
                open={openEditModal}
                handleClose={() => setOpenEditModal(false)}
                status={selectedStatus}
                refreshStatus={fetchData}
                showSnackbar={showSnackbar}
            />

            <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>¿Seguro que deseas eliminar este estado?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmModal(false)} color="primary">Cancelar</Button>
                    <Button onClick={handleDelete} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>

            {/* Notificación Snackbar */}
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StatusList;
