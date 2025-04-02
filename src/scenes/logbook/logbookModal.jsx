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
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [locations, setLocations] = useState([]);

    const isEditing = Boolean(editedLogbook.id);

    useEffect(() => {
        if (open) {
            const fetchStatusesAndLocations = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const [statusResponse, locationResponse, modelResponse, brandResponse] = await Promise.all([
                        axios.get("http://localhost:8085/api/v1/admin/status", { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get("http://localhost:8085/api/v1/admin/locations", { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get("http://localhost:8085/api/v1/admin/brands", { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get("http://localhost:8085/api/v1/admin/models", { headers: { Authorization: `Bearer ${token}` } })
                    ]);

                    setStatuses(statusResponse.data);
                    setLocations(locationResponse.data);
                    setBrands(brandResponse.data);
                    setModels(modelResponse.data);
                } catch (error) {
                    console.error("Error al obtener estados y ubicaciones", error);
                }
            };

            fetchStatusesAndLocations();
        }
    }, [open]);

    useEffect(() => {
        if (logbook && open && statuses.length > 0 && locations.length > 0 && brands.length > 0 && models.length > 0) {
            setEditedLogbook({
                id: logbook.id ?? "",
                deviceId: logbook.deviceCode || "",
                deviceBrand: logbook.deviceBrand || "",
                deviceModel: logbook.deviceModel || "",
                userEmail: logbook.userEmail ?? "",
                statusId: statuses.find(s => s.name === logbook.statusName)?.id?.toString() || "",
                locationId: locations.find(l => l.name === logbook.locationName)?.id?.toString() || "",
                note: logbook.note ?? "",
                createdAt: logbook.createdAt ?? ""
            });
        } else if (!logbook) {
            setEditedLogbook(initialLogbookState);
        }
    }, [logbook, open, statuses, locations, models, brands]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedLogbook((prev) => ({ ...prev, [name]: value }));
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage("");
        setErrorMessage("");
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
                                fullWidth margin="normal" label="Email del Usuario"
                                name="userEmail" value={editedLogbook.userEmail || ""}
                                onChange={handleChange}
                            />
                        </>
                    )}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Marca</InputLabel>
                        <Select
                            name="deviceBrand"
                            value={editedLogbook.deviceBrand || ""}
                            onChange={handleChange}
                        >
                            {brands.map((brand) => (
                                <MenuItem key={brand.id} value={brand.name}>{brand.name}</MenuItem>
                                // Se usa brand.name como value en lugar de brand.id
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Modelo</InputLabel>
                        <Select
                            name="deviceModel"
                            value={editedLogbook.deviceModel || ""}
                            onChange={handleChange}
                        >
                            {models.map((model) => (
                                <MenuItem key={model.id} value={model.name}>{model.name}</MenuItem>
                                // Se usa model.name como value en lugar de model.id
                            ))}
                        </Select>
                    </FormControl>

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

                    <Button fullWidth variant="contained" color="primary" onClick={isEditing ? handleUpdateLogbook : handleCreate} sx={{ mt: 2 }}>
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
