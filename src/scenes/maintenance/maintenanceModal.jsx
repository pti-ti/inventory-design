import { 
    Box, Button, Modal, TextField, Typography, Dialog, DialogActions, 
    DialogContent, DialogTitle 
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const MaintenanceModal = ({ open, handleClose, maintenance, refreshMaintenances }) => {
    const initialMaintenanceState = {
        id: "",
        deviceId: "",
        deviceCode: "",
        deviceName: "",
        userEmail: "",
        maintenanceType: "",
        comment: "",
        maintenanceDate: ""
    };

    const [editedMaintenance, setEditedMaintenance] = useState(initialMaintenanceState);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);

    useEffect(() => {
        if (open && maintenance) {
            console.log("Datos recibidos del backend:", maintenance);
    
            const formatDate = (dateString) => {
                if (!dateString) return "";
                if (dateString.includes("-")) return dateString; // Ya está en formato yyyy-MM-dd
                const [day, month, year] = dateString.split("/");
                return `${year}-${month}-${day}`;
            };

            setEditedMaintenance({
                id: maintenance.id ?? "",
                deviceId: maintenance.deviceId ?? "",
                deviceCode: maintenance.deviceCode ?? "",
                deviceName: maintenance.deviceName ?? "",
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
            [name]: name === "maintenanceDate" ? formatDate(value) : value
        }));
    };

    const handleUpdate = async () => {
        console.log("Datos enviados al backend:", editedMaintenance);
        
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            console.log("UserID desde localStorage:", userId); 

            const updateMaintenance = {
                device: { id: editedMaintenance.deviceId },
                user: { id: editedMaintenance.userId },
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
                    <Typography variant="h6">Editar Mantenimiento</Typography>
                    <TextField fullWidth margin="normal" label="ID" name="id" value={editedMaintenance.id} disabled />
                    <TextField fullWidth margin="normal" label="ID dispositivo" name="deviceId" value={editedMaintenance.deviceId} disabled />
                    <TextField fullWidth margin="normal" label="Código dispositivo" name="deviceCode" value={editedMaintenance.deviceCode || ""} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Nombre del dispositivo" name="deviceName" value={editedMaintenance.deviceName || ""} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Email del usuario" name="userEmail" value={editedMaintenance.userEmail || ""} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Tipo de mantenimiento" name="maintenanceType" value={editedMaintenance.maintenanceType || ""} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Comentarios" name="comment" value={editedMaintenance.comment || ""} onChange={handleChange} />
                    <TextField 
                        fullWidth 
                        margin="normal" 
                        label="Fecha de mantenimiento" 
                        name="maintenanceDate" 
                        type="date"
                        value={editedMaintenance.maintenanceDate || ""}
                        onChange={handleChange}
                        disabled 
                        InputLabelProps={{ shrink: true }} 
                    />
                    
                    <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mt: 2 }}>Guardar Cambios</Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ mt: 2, ml: 2 }}>Eliminar</Button>
                </Box>
            </Modal>

            {/* Modal de confirmación para eliminar */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogContent>
                    ¿Quieres eliminar este mantenimiento? Esta acción no se puede deshacer.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">Cancelar</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>Eliminar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de éxito */}
            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
                <DialogTitle>Mantenimiento actualizado!</DialogTitle>
                <DialogContent>
                    Los cambios se guardaron correctamente.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSuccess(false)} color="primary" autoFocus>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MaintenanceModal;
