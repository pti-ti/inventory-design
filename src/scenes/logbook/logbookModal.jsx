import { 
    Box, Button, Modal, TextField, Typography, Dialog, DialogActions, 
    DialogContent, DialogTitle 
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const LogbookModal = ({ open, handleClose, logbook, refreshLogbooks }) => {
    const initialLogbookState = {
        id: "",
        deviceId: "",
        deviceCode: "",
        deviceName: "",
        userEmail: "",
        statusId: "",
        locationId: "",
        note: "",
        createdAt: ""
    };

    const [editedLogbook, setEditedLogbook] = useState(initialLogbookState);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);

    useEffect(() => {
        if (open && logbook) {
            console.log("Datos recibidos del backend:", logbook);
    
            const formatDate = (dateString) => {
                if (!dateString) return "";
                if (dateString.includes("-")) return dateString; // Ya está en formato yyyy-MM-dd
                const [day, month, year] = dateString.split("/");
                return `${year}-${month}-${day}`;
            };

            setEditedLogbook({
                id: logbook.id ?? "",
                deviceCode: logbook.deviceCode ?? "",
                deviceName: logbook.deviceName ?? "",
                userEmail: logbook.userEmail ?? "",
                statusName: logbook.statusName ?? "",
                locationName: logbook.locationName ?? "",
                note: logbook.note ?? "",
                createdAt: formatDate(logbook.createdAt)
            });
        } else {
            setEditedLogbook(initialLogbookState);
        }
    }, [logbook, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedLogbook((prev) => ({
            ...prev,
            [name]: name === "maintenanceDate" ? formatDate(value) : value
        }));
    };

    const handleUpdate = async () => {
        console.log("Datos enviados al backend:", editedLogbook);
        
        try {
            const token = localStorage.getItem("token");
            

            console.log("UserID desde localStorage:"); 

            const updateLogbook = {
                device: { id: editedLogbook.deviceId },
                user: { id: editedLogbook.userId },
                location: { id: editedLogbook.locationId },
                status: { id: editedLogbook.statusId },
                note: editedLogbook.note, 
            };

            console.log("Datos enviados para actualizar:", updateLogbook);
            
            await axios.put(
                `http://localhost:8085/api/v1/admin/logbooks/${id}`, 
                updateLogbook, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            refreshLogbooks();
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
                `http://localhost:8085/api/v1/admin/logbooks/${logbook.id}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refreshLogbooks();
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
                    <Typography variant="h6">Editar Bitácoras</Typography>
                    <TextField fullWidth margin="normal" label="ID" name="id" value={editedLogbook.id} disabled />
                    <TextField fullWidth margin="normal" label="Código dispositivo" name="deviceCode" value={editedLogbook.deviceCode || ""} disabled onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Nombre del dispositivo" name="deviceName" value={editedLogbook.deviceName || ""} disabled onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Email del usuario" name="userEmail" value={editedLogbook.userEmail || ""} disabled onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Estado" name="statusName" value={editedLogbook.statusName || ""} disabled onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Ubicación" name="locationName" value={editedLogbook.locationName || ""} disabled onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Notas" name="note" value={editedLogbook.note || ""} onChange={handleChange} />
                    <TextField 
                        fullWidth 
                        margin="normal" 
                        label="Creado el: " 
                        name="createdAt" 
                        type="date"
                        value={editedLogbook.createdAt || ""}
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
                    ¿Quieres eliminar esta bitácora? Esta acción no se puede deshacer.
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

export default LogbookModal;
