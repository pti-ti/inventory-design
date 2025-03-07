import { Box, Button, Modal, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { DiOpensource } from "react-icons/di";

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
    const [openSuccess, setOpenSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const statuses = [
        { id: 1, name: "Entregado" },
        { id: 2, name: "Dañado" },
        { id: 3, name: "Mantenimiento" },
        { id: 4, name: "Disponible" },
        { id: 5, name: "No disponible" }
    ];

    const locations = [
        { id: 1, name: "Cali" },
        { id: 2, name: "Barranquilla" },
        { id: 3, name: "Bogotá" },
        { id: 4, name: "Popayán" }
    ];

    useEffect(() => {
        if (open && logbook) {
            setEditedLogbook({
                id: logbook.id ?? "",
                deviceId: logbook.deviceId ?? "",
                deviceCode: logbook.deviceCode ?? "",
                deviceName: logbook.deviceName ?? "",
                userEmail: logbook.userEmail ?? "",
                statusId: logbook.statusId ?? "",
                locationId: logbook.locationId ?? "",
                note: logbook.note ?? "",
                createdAt: logbook.createdAt ?? ""
            });
            setIsEditing(!!logbook.id);
        } else {
            setEditedLogbook(initialLogbookState);
            setIsEditing(false);
        }
    }, [logbook, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedLogbook((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateOrUpdate = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!editedLogbook.id) {
                if (!editedLogbook.deviceId || !editedLogbook.userEmail || !editedLogbook.statusId || !editedLogbook.locationId) {
                    alert("Todos los campos son obligatorios para registrar una nueva bitácora.");
                    return;
                }
            }

            const logbookData = {
                device: { id: editedLogbook.deviceId },
                user: { email: editedLogbook.userEmail },
                status: { id: editedLogbook.statusId },
                location: { id: editedLogbook.locationId },
                note: editedLogbook.note
            };

            if (editedLogbook.id) {
                await axios.put(`http://localhost:8085/api/v1/admin/logbooks/${editedLogbook.id}`, logbookData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post("http://localhost:8085/api/v1/admin/logbooks/register", logbookData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            refreshLogbooks();
            setOpenSuccess(true);
            handleClose();
        } catch (error) {
            console.error("Error al guardar la bitácora", error.response?.data || error.message);
            alert(`Error: ${error.response?.data?.message || "No se pudo procesar la solicitud"}`);
        }
    };

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)", width: 400,
                    bgcolor: "background.paper", boxShadow: 24,
                    p: 4, borderRadius: 2
                }}>
                    <Typography variant="h6">{editedLogbook.id ? "Editar Bitácora" : "Registrar Bitácora"}</Typography>

                    <TextField
                        fullWidth margin="normal" label="Código dispositivo"
                        name="deviceCode" value={editedLogbook.deviceCode || ""}
                        disabled={!!editedLogbook.id} onChange={handleChange}
                    />
                    <TextField
                        fullWidth margin="normal" label="Nombre del dispositivo"
                        name="deviceName" value={editedLogbook.deviceName || ""}
                        disabled={!!editedLogbook.id} onChange={handleChange}
                    />
                    <TextField
                        fullWidth margin="normal" label="Email del usuario"
                        name="userEmail" value={editedLogbook.userEmail || ""}
                        onChange={handleChange}
                        disabled={isEditing} // Inhabilita cuando se está editando
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select
                            name="statusId"
                            value={editedLogbook.statusId || ""}
                            onChange={handleChange}
                            disabled={isEditing} // Inhabilita cuando se está editando
                        >
                            {statuses.map((status) => (
                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ubicación</InputLabel>
                        <Select
                            name="locationId"
                            value={editedLogbook.locationId || ""}
                            onChange={handleChange}
                            disabled={isEditing} // Inhabilita cuando se está editando
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="normal" label="Notas" name="note" value={editedLogbook.note || ""} onChange={handleChange} />

                    <Button variant="contained" color="primary" onClick={handleCreateOrUpdate} sx={{ mt: 2 }}>
                        {editedLogbook.id ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Modal>

            {/* Dialog de confirmación */}
            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
                <DialogTitle>¡{isEditing ? "Bitácora actualizada" : "Bitácora registrada"}!</DialogTitle>
                <DialogContent>
                    {isEditing ? "Los cambios se guardaron correctamente." : "La bitácora ha sido creada con éxito."}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSuccess(false)} color="primary" autoFocus>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );

};

export default LogbookModal;
