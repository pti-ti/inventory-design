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
import ModelModal from "./modelModal"; // Renombrado
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

const modelList = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [rows, setRows] = useState([]);
    const [selectedModels, setSelectedModel] = useState(null); // Renombrado
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [modelToDelete, setModelToDelete] = useState(null); // Renombrado
    
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); 

    // 🔹 Función para obtener modelos desde la API
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No se encontró un token en localStorage.");
            }

            const response = await axios.get("http://localhost:8085/api/v1/admin/models", { // Cambiado a 'model'
                headers: { Authorization: `Bearer ${token}` },
            });

            const formattedModels = response.data.map(model => ({ // Cambiado a 'model'
                id: model.id || model._id,
                name: model.name, // Cambiado a 'model'
                createdBy: model.createdBy || "Desconocido",
                createdAt: new Date(model.createdAt).toLocaleDateString()
            }));

            setRows(formattedModels);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            showSnackbar("Error al cargar el modelo.", "error"); // Cambiado a 'modelo'
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

    const handleEdit = (model) => { // Cambiado a 'model'
        setSelectedModel(model); // Cambiado a 'model'
        setOpenEditModal(true);
    };

    const handleOpenAddModal = () => {
        setSelectedModel(null); // Cambiado a 'model'
        setOpenAddModal(true);
    };

    const handleOpenConfirmModal = (id) => {
        setModelToDelete(id); // Cambiado a 'model'
        setOpenConfirmModal(true);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8085/api/v1/admin/models/${modelToDelete}`, { // Cambiado a 'model'
                headers: { Authorization: `Bearer ${token}` },
            });

            showSnackbar("Modelo eliminado correctamente."); // Cambiado a 'modelo'
            fetchData();
        } catch (error) {
            console.error("Error al eliminar el modelo:", error); // Cambiado a 'modelo'
            showSnackbar("No se pudo eliminar el modelo.", "error"); // Cambiado a 'modelo'
        }
        setOpenConfirmModal(false);
    };

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5, cellClassName: "name-column--cell" },
        { field: "name", headerName: "Nombre del Modelo", flex: 1, cellClassName: "name-column--cell" }, // Cambiado a 'Modelo'
        { field: "createdBy", headerName: "Creado Por (ID Usuario)", flex: 1, cellClassName: "name-column--cell" },
        { field: "createdAt", headerName: "Fecha de Creación", flex: 1, cellClassName: "name-column--cell" },
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
            <Header title="MODELOS" subtitle="Gestión de modelos de dispositivos de PTI" /> {/* Cambiado a 'Modelos' */}
            <Button variant="contained" color="primary" onClick={handleOpenAddModal} startIcon={<AddIcon />}>
                Agregar Modelo {/* Cambiado a 'Modelo' */}
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

            <ModelModal 
                open={openAddModal} 
                handleClose={() => setOpenAddModal(false)} 
                model={null} // Cambiado a 'model'
                refreshModels={fetchData} // Cambiado a 'model'
                showSnackbar={showSnackbar} 
            />
            <ModelModal 
                open={openEditModal} 
                handleClose={() => setOpenEditModal(false)} 
                model={selectedModels} // Cambiado a 'model'
                refreshModels={fetchData} // Cambiado a 'model'
                showSnackbar={showSnackbar} 
            />

            <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>¿Seguro que deseas eliminar este modelo?</DialogContentText> {/* Cambiado a 'modelo' */}
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

export default modelList;
