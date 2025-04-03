import {
    Box, Button, Modal, TextField, Typography, MenuItem,
    Select, FormControl, InputLabel, Snackbar, Alert
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const LogbookModal = ({ open, handleClose, logbook, refreshLogbooks }) => {
    const initialLogbookState = {
        id: "",
        deviceId: "",
        deviceBrand: "",
        deviceModel: "",
        userId: "",  // Cambiado de userEmail a userId
        statusId: "",
        locationId: "",
        note: "",
        createdAt: ""
    };

    const [statuses, setStatuses] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [locations, setLocations] = useState([]);
    const [editedLogbook, setEditedLogbook] = useState(initialLogbookState);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const isEditing = Boolean(logbook?.id);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const [statusResponse, locationResponse, brandResponse, modelResponse] = await Promise.all([
                        axios.get("http://localhost:8085/api/v1/admin/status", { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get("http://localhost:8085/api/v1/admin/locations", { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get("http://localhost:8085/api/v1/admin/brands", { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get("http://localhost:8085/api/v1/admin/models", { headers: { Authorization: `Bearer ${token}` } }),
                    ]);

                    setStatuses(statusResponse.data);
                    setLocations(locationResponse.data);
                    setBrands(brandResponse.data);
                    setModels(modelResponse.data);
                } catch (error) {
                    console.error("Error al obtener datos:", error);
                }
            };

            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (logbook && open && statuses.length > 0 && locations.length > 0 && brands.length > 0 && models.length > 0) {
            setEditedLogbook({
                id: logbook.id ?? "",
                deviceId: logbook.deviceCode || "",
                deviceBrand: brands.find(b => b.name === logbook.deviceBrand)?.id?.toString() || "",
                deviceModel: models.find(m => m.name === logbook.deviceModel)?.id?.toString() || "",
                userId: logbook.userId ?? "",  // Usar userId en lugar de userEmail
                statusId: statuses.find(s => s.name === logbook.statusName)?.id?.toString() || "",
                locationId: locations.find(l => l.name === logbook.locationName)?.id?.toString() || "",
                note: logbook.note ?? "",
                createdAt: logbook.createdAt ?? ""
            });
        } else {
            setEditedLogbook(initialLogbookState);
        }
    }, [logbook, open, statuses, locations, brands, models]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedLogbook(prev => ({ ...prev, [name]: value }));
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage("");
        setErrorMessage("");
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!editedLogbook.deviceId.trim() || !editedLogbook.statusId || !editedLogbook.locationId || !editedLogbook.userId) {
                setErrorMessage("Todos los campos son obligatorios.");
                return;
            }

            const logbookData = {
                device: { id: editedLogbook.deviceId },
                brand: { id: editedLogbook.deviceBrand },
                model: { id: editedLogbook.deviceModel },
                status: { id: editedLogbook.statusId },
                location: { id: editedLogbook.locationId },
                user: { id: editedLogbook.userId },  // Cambiado de email a id
                note: editedLogbook.note || ""
            };

            if (isEditing) {
                await axios.put(
                    `http://localhost:8085/api/v1/admin/logbooks/${editedLogbook.id}`,
                    logbookData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage("Bitácora actualizada correctamente.");
            } else {
                await axios.post(
                    "http://localhost:8085/api/v1/admin/logbooks/register",
                    logbookData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage("Bitácora registrada correctamente.");
            }

            refreshLogbooks();
            handleClose();
        } catch (error) {
            console.error("Error al guardar la bitácora", error.response?.data || error.message);
            setErrorMessage("No se pudo procesar la solicitud.");
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
                        <TextField
                            fullWidth margin="normal" label="Código del dispositivo"
                            name="deviceId" value={editedLogbook.deviceId} onChange={handleChange}
                        />
                    )}

                    {/* Campo para ingresar el ID del usuario */}
                    <TextField
                        fullWidth margin="normal" label="ID del Usuario"
                        name="userId" value={editedLogbook.userId} onChange={handleChange}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Marca</InputLabel>
                        <Select name="deviceBrand" value={editedLogbook.deviceBrand} onChange={handleChange}
                        disabled={isEditing}
                        >
                            {brands.map(brand => (
                                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Modelo</InputLabel>
                        <Select name="deviceModel" value={editedLogbook.deviceModel} onChange={handleChange}
                        disabled={isEditing}
                        >
                            {models.map(model => (
                                <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ubicación</InputLabel>
                        <Select name="locationId" value={editedLogbook.locationId} onChange={handleChange}>
                            {locations.map(location => (
                                <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select name="statusId" value={editedLogbook.statusId} onChange={handleChange}>
                            {statuses.map(status => (
                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="normal" label="Notas" name="note" value={editedLogbook.note} onChange={handleChange} />

                    <Button fullWidth variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
                        {isEditing ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Modal>

            <Snackbar open={!!successMessage || !!errorMessage} autoHideDuration={4000} onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={successMessage ? "success" : "error"}>
                    {successMessage || errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default LogbookModal;
