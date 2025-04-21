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
        deviceCode: "",
        deviceBrand: "",
        deviceModel: "",
        userId: "",
        userEmail: "",
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

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const [statusResponse, locationResponse, brandResponse, modelResponse] = await Promise.all([
                        axios.get(`${API_BASE_URL}/api/v1/admin/status`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_BASE_URL}/api/v1/admin/locations`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_BASE_URL}/api/v1/admin/brands`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_BASE_URL}/api/v1/admin/models`, { headers: { Authorization: `Bearer ${token}` } }),
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
            console.log("Logbook recibido:", logbook);
            setEditedLogbook({
                id: logbook.id ?? "",
                deviceId: logbook.deviceId || "",
                deviceCode: logbook.deviceCode || "",
                deviceBrand: brands.find(b => b.name === logbook.deviceBrand)?.id?.toString() || "",
                deviceModel: models.find(m => m.name === logbook.deviceModel)?.id?.toString() || "",
                userId: logbook.userId ? logbook.userId.toString() : "",
                userEmail: logbook.userEmail || "",
                statusId: statuses.find(s => s.name === logbook.statusName)?.id?.toString() || "",
                locationId: locations.find(l => l.name === logbook.locationName)?.id?.toString() || "",
                note: logbook.note ?? "",
                createdAt: logbook.createdAt ?? ""
            });
        } else {
            setEditedLogbook(initialLogbookState);
        }
    }, [logbook, open, statuses, locations, brands, models]);

    const fetchDeviceById = async (deviceId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/api/v1/admin/devices/${deviceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const device = response.data;

            setEditedLogbook(prev => ({
                ...prev,
                deviceCode: device.code || "",
                deviceBrand: brands.find(b => b.name === device.brandName)?.id?.toString() || "",
                deviceModel: models.find(m => m.name === device.modelName)?.id?.toString() || "",
                locationId: locations.find(loc => loc.name === device.locationName)?.id?.toString() || "",
                statusId: statuses.find(s => s.name === device.statusName)?.id?.toString() || ""
            }));
        } catch (error) {
            console.error("No se pudo obtener el dispositivo", error.response?.data || error.message);
            setErrorMessage("No se encontró el dispositivo con ese ID.");
        }
    };

    const handleUserIdChange = async (e) => {
        const value = e.target.value;

        setEditedLogbook(prev => ({ ...prev, userId: value }));

        if (value.trim().length === 0) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/api/v1/admin/users/${value}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = response.data;

            setEditedLogbook(prev => ({
                ...prev,
                userEmail: user.email || ""
            }));
        } catch (error) {
            console.error("No se pudo obtener el usuario", error.response?.data || error.message);
            setErrorMessage("No se encontró el usuario con ese ID.");
        }
    };



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
    
            if (!editedLogbook.note.trim()) {
                setErrorMessage("Las notas son obligatorias.");
                return;
            }
    
            let logbookData;
    
            if (isEditing) {
                // Solo se edita la nota
                logbookData = {
                    note: editedLogbook.note
                };
            } else {
                // Se envían todos los datos para crear
                logbookData = {
                    device: { id: parseInt(editedLogbook.deviceId) },
                    brand: { id: parseInt(editedLogbook.deviceBrand) },
                    model: { id: parseInt(editedLogbook.deviceModel) },
                    status: { id: parseInt(editedLogbook.statusId) },
                    location: { id: parseInt(editedLogbook.locationId) },
                    user: { id: parseInt(editedLogbook.userId) },
                    note: editedLogbook.note
                };
            }
    
            console.log("Datos enviados al backend:", logbookData);
    
            if (isEditing) {
                await axios.put(
                    `${API_BASE_URL}/api/v1/admin/logbooks/${editedLogbook.id}`,
                    logbookData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage("Bitácora actualizada correctamente.");
            } else {
                await axios.post(
                    `${API_BASE_URL}/api/v1/admin/logbooks/register`,
                    logbookData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage("Bitácora registrada correctamente.");

                try {
                    const response = await axios.get(`${API_BASE_URL}/api/v1/admin/excel/logbook`, {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: "blob",
                    });
    
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "Bitacora.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                } catch (excelError) {
                    console.error("Error al descargar el Excel de bitácora:", excelError);
                    setSuccessMessage("Bitácora guardada, pero ocurrió un error al descargar el Excel.");
                }
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

                    {/* Campos deshabilitados durante la edición */}
                    {!isEditing && (
                        <TextField
                            fullWidth
                            margin="normal"
                            label="ID del Dispositivo"
                            name="deviceId"
                            value={editedLogbook.deviceId}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEditedLogbook(prev => ({ ...prev, deviceId: value }));

                                // Si el ID tiene al menos 1 carácter, busca el dispositivo (puedes ajustar esto)
                                if (value.trim().length > 0) {
                                    fetchDeviceById(value);
                                }
                            }}
                        />
                    )}


                    <TextField
                        fullWidth margin="normal" label="Código del Dispositivo"
                        name="deviceCode" value={editedLogbook.deviceCode} onChange={handleChange} disabled
                    />



                    <FormControl fullWidth margin="normal">
                        <InputLabel>Marca</InputLabel>
                        <Select name="deviceBrand" value={editedLogbook.deviceBrand} onChange={handleChange} disabled
                        >
                            {brands.map(brand => (
                                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Modelo</InputLabel>
                        <Select name="deviceModel" value={editedLogbook.deviceModel} onChange={handleChange} disabled
                        >
                            {models.map(model => (
                                <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {!isEditing && (
                        <TextField
                            fullWidth
                            margin="normal"
                            label="ID del Usuario"
                            name="userId"
                            value={editedLogbook.userId}
                            onChange={handleUserIdChange}
                        />
                    )}

                    <TextField
                        fullWidth margin="normal" label="Email del Usuario"
                        name="userEmail" value={editedLogbook.userEmail} onChange={handleChange} disabled
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ubicación</InputLabel>
                        <Select name="locationId" value={editedLogbook.locationId} onChange={handleChange} disabled={isEditing}>
                            {locations.map(location => (
                                <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select name="statusId" value={editedLogbook.statusId} onChange={handleChange} disabled={isEditing} >
                            {statuses.map(status => (
                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Solo el campo de "notas" es editable */}
                    <TextField
                        fullWidth margin="normal" label="Notas" name="note"
                        value={editedLogbook.note} onChange={handleChange}
                    />

                    <Button fullWidth variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
                        {isEditing ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Modal>

            <Snackbar open={!!successMessage || !!errorMessage} autoHideDuration={4000} onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseSnackbar} severity={successMessage ? "success" : "error"}>
                    {successMessage || errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default LogbookModal;
