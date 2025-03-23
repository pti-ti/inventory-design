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
    const [statuses, setStatuses] = useState([]);
    const [locations, setLocations] = useState([]);

    const isEditing = Boolean(editedLogbook.id);

    useEffect(() => {
        if (open) {
            const fetchStatusesAndLocations = async () => {
                try {
                    const token = localStorage.getItem("token");
    
                    const [statusResponse, locationResponse] = await Promise.all([
                        axios.get("http://localhost:8085/api/v1/admin/status", { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get("http://localhost:8085/api/v1/admin/locations", { headers: { Authorization: `Bearer ${token}` } })
                    ]);
    
                    setStatuses(statusResponse.data);
                    setLocations(locationResponse.data);
                } catch (error) {
                    console.error("Error al obtener estados y ubicaciones", error);
                }
            };
    
            fetchStatusesAndLocations();
        }
    }, [open]);
    
    useEffect(() => {
        if (logbook && open) {
            console.log("Datos del logbook:", logbook);
            setEditedLogbook({
                id: logbook.id ?? "",
                deviceId: logbook.deviceId ? logbook.deviceId.toString() : "",
                deviceName: logbook.deviceName ?? "",
                userEmail: logbook.userEmail ?? "",
                statusId: statuses.find(s => s.name === logbook.statusName)?.id || "",  // 🔹 Buscar el ID a partir del nombre
                locationId: locations.find(l => l.name === logbook.locationName)?.id || "",  // 🔹 Buscar el ID a partir del nombre
                note: logbook.note ?? "",
                createdAt: logbook.createdAt ?? ""
            });
            
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

            if (!editedLogbook.deviceId?.trim() || 
                !editedLogbook.userId?.trim() || 
                !editedLogbook.statusId || 
                !editedLogbook.locationId) {
                setErrorMessage("Todos los campos son obligatorios.");
                return;
            }

            const logbookData = {
                device: { id: editedLogbook.deviceId },
                user: { id: editedLogbook.userId },
                status: { id: editedLogbook.statusId },
                location: { id: editedLogbook.locationId },
                note: editedLogbook.note || ""
            };

            await axios.post("http://localhost:8085/api/v1/admin/logbooks/register", logbookData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage("Bitácora registrada correctamente.");
            refreshLogbooks();
            handleClose();
        } catch (error) {
            console.error("Error al guardar la bitácora", error.response?.data || error.message);
            setErrorMessage("No se pudo procesar la solicitud.");
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
                setErrorMessage("Estado y Ubicación son obligatorios.");
                return;
            }

            const updateData = {
                status: { id: editedLogbook.statusId },
                location: { id: editedLogbook.locationId },
                note: editedLogbook.note || ""
            };

            await axios.put(
                `http://localhost:8085/api/v1/admin/logbooks/${editedLogbook.id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage("Bitácora actualizada correctamente.");
            refreshLogbooks();
            handleClose();
        } catch (error) {
            console.error("Error al actualizar la bitácora", error.response?.data || error.message);
            setErrorMessage("No se pudo actualizar la bitácora.");
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
        </>
    );
};

export default LogbookModal;