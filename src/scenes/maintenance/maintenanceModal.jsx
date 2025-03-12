import { 
    Box, Button, Modal, TextField, Typography, Dialog, DialogActions, 
    DialogContent, Snackbar, Alert, DialogTitle 
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const MaintenanceModal = ({ open, handleClose, maintenance, refreshMaintenances }) => {
    const isEditing = Boolean(maintenance?.id); // Determina si es edición o registro

    const initialMaintenanceState = {
        id: "",
        deviceId: "",
        deviceCode: "",
        deviceName: "",
        userId: "",
        userEmail: "",
        maintenanceType: "",
        maintenanceDate: "",
        comment: ""
    };
    
    const [editedMaintenance, setEditedMaintenance] = useState(initialMaintenanceState);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);


    useEffect(() => {
        if (open && maintenance) {
            console.log("Datos recibidos del backend:", maintenance);

            const formatDate = (dateString) => {
                if (!dateString) return "";
                if (dateString.includes("-")) return dateString;
                const [day, month, year] = dateString.split("/");
                return `${year}-${month}-${day}`;
            };

            setEditedMaintenance({
                id: maintenance.id ?? "",
                deviceId: maintenance.deviceId ?? "",
                deviceCode: maintenance.deviceCode ?? "",
                deviceName: maintenance.deviceName ?? "",
                userId: maintenance.userId ?? "",
                userEmail: maintenance.userEmail ?? "",
                maintenanceType: maintenance.maintenanceType ?? "",
                comment: maintenance.comment ?? "",
                maintenanceDate: formatDate(maintenance.maintenanceDate)
            });
        } else {
            setEditedMaintenance(initialMaintenanceState);
        }
    }, [maintenance, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedMaintenance((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreate = async () => {
        try {
            console.log("📌 Datos actuales de editedMaintenance:", editedMaintenance);
    
            const newMaintenance = {
                device: { id: Number(editedMaintenance.deviceId) },
                user: { id: Number(editedMaintenance.userId) }, // Asegurar que se usa editedMaintenance.userId
                maintenanceType: editedMaintenance.maintenanceType,
                maintenanceDate: editedMaintenance.maintenanceDate,
                comment: editedMaintenance.comment,
            };
    
            console.log("Datos enviados para crear mantenimiento:", newMaintenance);
    
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8085/api/v1/admin/maintenances/register",
                newMaintenance,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            refreshMaintenances();
            setOpenSuccess(true);
            setTimeout(() => setOpenSuccess(false), 2000);
            setOpenSnackbar(true);
            handleClose();
        } catch (error) {
            console.error("🚨 Error al crear el mantenimiento:", error);
        }
    };
    
    

    const handleUpdate = async () => {
        console.log("Datos enviados al backend:", editedMaintenance);
        
        try {
            const token = localStorage.getItem("token");

            const updateMaintenance = {
                maintenanceType: editedMaintenance.maintenanceType,
                maintenanceDate: editedMaintenance.maintenanceDate,
                comment: editedMaintenance.comment,
            };

            console.log("Datos enviados para actualizar:", updateMaintenance);
            
            await axios.put(
                `http://localhost:8085/api/v1/admin/maintenances/${editedMaintenance.id}`, 
                updateMaintenance, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            refreshMaintenances();
            setOpenSuccess(true);
            setTimeout(() => setOpenSuccess(false), 2000);
            setOpenSnackbar(true);
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el mantenimiento", error);
        }
    };

    const confirmDelete = () => {
        setOpenConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:8085/api/v1/admin/maintenances/${editedMaintenance.id}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refreshMaintenances();
            handleClose();
        } catch (error) {
            console.error("Error al eliminar el mantenimiento", error);
        }
        setOpenConfirm(false);
    };

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    <Typography variant="h6">
                        {isEditing ? "Editar Mantenimiento" : "Registrar Mantenimiento"}
                    </Typography>

                    {/* Campos para Registro */}
                    {!isEditing && (
                        <>
                            <TextField fullWidth margin="normal" label="ID del dispositivo" name="deviceId" value={editedMaintenance.deviceId} onChange={handleChange} required />
                            <TextField fullWidth margin="normal" label="ID del usuario" name="userId" value={editedMaintenance.userId} onChange={handleChange} required />
                            
                        </>
                    )}

                    {/* Campos para Edición */}
                    {isEditing && (
                        <>
                            <TextField fullWidth margin="normal" label="Código dispositivo" name="deviceCode" value={editedMaintenance.deviceCode} onChange={handleChange} disabled />
                            <TextField fullWidth margin="normal" label="Nombre del dispositivo" name="deviceName" value={editedMaintenance.deviceName} onChange={handleChange} disabled />
                            <TextField fullWidth margin="normal" label="Email del usuario" name="userEmail" value={editedMaintenance.userEmail} onChange={handleChange} disabled />
                        </>
                    )}

                    <TextField fullWidth margin="normal" label="Tipo de mantenimiento" name="maintenanceType" value={editedMaintenance.maintenanceType} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Comentarios" name="comment" value={editedMaintenance.comment} onChange={handleChange} />
                    <TextField 
                        fullWidth 
                        margin="normal" 
                        label="Fecha de mantenimiento" 
                        name="maintenanceDate" 
                        type="date"
                        value={editedMaintenance.maintenanceDate}
                        onChange={handleChange}
                        disabled={isEditing}
                        InputLabelProps={{ shrink: true }} 
                    />

                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button variant="contained" color="info" onClick={isEditing ? handleUpdate : handleCreate}>
                            {isEditing ? "Guardar Cambios" : "Registrar"}
                        </Button>
                    </Box>

                    {/* {isEditing && (
                        <Button variant="contained" color="error" onClick={confirmDelete} sx={{ mt: 2, ml: 2 }}>
                            Eliminar
                        </Button>
                    )} */}
                </Box>
            </Modal>

            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%" }}>
                    {isEditing ? "Mantenimiento actualizado correctamente" : "Mantenimiento creado correctamente"}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MaintenanceModal;
