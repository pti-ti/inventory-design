import { 
    Box, Button, Modal, TextField, Typography, MenuItem, 
    Select, FormControl, InputLabel, Dialog, DialogTitle,
    DialogContent, DialogActions, Snackbar, Alert 
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
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const isEditing = Boolean(editedLogbook.id);

    const statuses = [
        { id: 1, name: "Entregado" },
        { id: 2, name: "Dañado" },
        { id: 3, name: "Mantenimiento" },
        { id: 4, name: "Disponible" },
        { id: 5, name: "No disponible" }
    ];

    const locations = [
        { id: 1, name: "Recursos Humanos" },
        { id: 2, name: "Barranquilla" },
        { id: 3, name: "Bogotá" },
        { id: 4, name: "Popayán" }
    ];

    useEffect(() => {
        console.log("Recibiendo logbook en modal:", logbook);
        if (open && logbook) {
            const updatedLogbook = {
                id: logbook.id ?? "",
                deviceId: logbook.deviceId ? logbook.deviceId.toString() : "", 
                deviceName: logbook.deviceName ?? "",
                userId: logbook.userId ? logbook.userId.toString() : "", 
                userEmail: logbook.userEmail ?? "",
                statusId: statuses.find(s => s.name === logbook.statusName)?.id || "", 
                locationId: locations.find(l => l.name === logbook.locationName)?.id || "", 
                note: logbook.note ?? ""
            };
            console.log("Actualizando editedLogbook en modal:", updatedLogbook);
            setEditedLogbook(updatedLogbook);
        } else {
            setEditedLogbook(initialLogbookState);
        }
    }, [logbook, open]);
    
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedLogbook((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        try {
            const token = localStorage.getItem("token");
    
            if (!editedLogbook.deviceId?.toString().trim() || 
                !editedLogbook.userId?.toString().trim() || 
                !editedLogbook.statusId || 
                !editedLogbook.locationId) {
                setErrorMessage("Todos los campos son obligatorios para registrar una nueva bitácora.");
                return;
            }
    
            const logbookData = {
                device: { id: editedLogbook.deviceId },
                user: { id: editedLogbook.userId },
                status: { id: editedLogbook.statusId },
                location: { id: editedLogbook.locationId },
                note: editedLogbook.note || "" // Evitar undefined
            };
    
            await axios.post("http://localhost:8085/api/v1/admin/logbooks/register", logbookData, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            setSuccessMessage("Bitácora registrada correctamente.");
            refreshLogbooks();
            handleClose();
        } catch (error) {
            console.error("Error al guardar la bitácora", error.response?.data || error.message);
            setErrorMessage(error.response?.data?.message || "No se pudo procesar la solicitud.");
        }
    };

    const handleUpdateLogbook = async () => {
        try {
            const token = localStorage.getItem("token");
    
            if (!editedLogbook.id) {
                setErrorMessage("No se puede actualizar la bitácora sin un ID.");
                return;
            }
    
            if (!editedLogbook.statusId || !editedLogbook.locationId) {
                setErrorMessage("Estado y Ubicación son obligatorios para actualizar la bitácora.");
                return;
            }
    
            const updateData = {
                status: { id: editedLogbook.statusId },
                location: { id: editedLogbook.locationId },
                note: editedLogbook.note || "" // Asegurar que no sea undefined
            };
    
            await axios.put(
                `http://localhost:8085/api/v1/admin/logbooks/${editedLogbook.id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            setSuccessMessage("Bitácora actualizada correctamente.");
            refreshLogbooks(); // Actualiza la lista de bitácoras
            handleClose(); // Cierra el modal o formulario
        } catch (error) {
            console.error("Error al actualizar la bitácora", error.response?.data || error.message);
            setErrorMessage(error.response?.data?.message || "No se pudo actualizar la bitácora.");
        }
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
                    <Typography variant="h6">{isEditing ? "Editar Bitácora" : "Registrar Bitácora"}</Typography>
                    
                    {!isEditing && (
                        <>
                            <TextField
                                fullWidth margin="normal" label="Id del dispositivo"
                                name="deviceId" value={editedLogbook.deviceId || ""}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth margin="normal" label="Id del Usuario"
                                name="userId" value={editedLogbook.userId || ""}
                                onChange={handleChange}
                            />
                            
                        </>
                    )}
                    
                    {isEditing && (
                        <>
                            <TextField
                                fullWidth margin="normal" label="Nombre del dispositivo"
                                name="deviceName" value={editedLogbook.deviceName || ""}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth margin="normal" label="Email del Usuario"
                                name="userEmail" value={editedLogbook.userEmail || ""}
                                onChange={handleChange}
                            />
                        </>
                    )}
    
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ubicación</InputLabel>
                        <Select
                            name="locationId"
                            value={editedLogbook.locationId || ""}
                            onChange={handleChange}
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
    
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select
                            name="statusId"
                            value={editedLogbook.statusId || ""}
                            onChange={handleChange}
                        >
                            {statuses.map((status) => (
                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
    
                    <TextField fullWidth margin="normal" label="Notas" name="note" value={editedLogbook.note || ""} onChange={handleChange} />
                            
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={isEditing ? handleUpdateLogbook : handleCreate}
                        sx={{ mt: 2 }}
                    >
                        {isEditing ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Modal>
    
            {/* Notificación de éxito */}
            <Snackbar open={Boolean(successMessage)} autoHideDuration={3000} onClose={() => setSuccessMessage("")}
            >
                <Alert severity="success" onClose={() => setSuccessMessage("")}>{successMessage}</Alert>
            </Snackbar>
    
            {/* Notificación de error */}
            <Snackbar open={Boolean(errorMessage)} autoHideDuration={3000} onClose={() => setErrorMessage("")}
            >
                <Alert severity="error" onClose={() => setErrorMessage("")}>{errorMessage}</Alert>
            </Snackbar>
        </>
    );
    
};

export default LogbookModal;
