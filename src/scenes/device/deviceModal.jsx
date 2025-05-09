import { Box, Button, Modal, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import axios from "axios";

const DeviceModal = ({ open, handleClose, device, refreshDevices }) => {
    const isEditing = !!device;
    const [editedDevice, setEditedDevice] = useState({
        code: "",
        brandId: "",
        modelId: "",
        serial: "",
        specification: "",
        type: "",
        statusId: "",
        price: "",
        locationId: ""
    });

    const [locations, setLocations] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const headers = { Authorization: `Bearer ${token}` };

                    const [locRes, statRes, modRes, brandRes] = await Promise.all([
                        axios.get(`${API_BASE_URL}/api/v1/locations`, { headers }),
                        axios.get(`${API_BASE_URL}/api/v1/status`, { headers }),
                        axios.get(`${API_BASE_URL}/api/v1/models`, { headers }),
                        axios.get(`${API_BASE_URL}/api/v1/brands`, { headers }),
                    ]);

                    setLocations(locRes.data);
                    setStatuses(statRes.data);
                    setModels(modRes.data);
                    setBrands(brandRes.data);
                } catch (error) {
                    console.error("Error al obtener datos", error);
                }
            };

            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (open && isEditing && device && brands.length && models.length && statuses.length && locations.length) {
            setEditedDevice({
                code: device.code || "",
                brandId: brands.find(b => b.name === device.brand)?.id || "",
                modelId: models.find(m => m.name === device.model)?.id || "",
                serial: device.serial || "",
                specification: device.specification || "",
                type: device.type || "",
                statusId: statuses.find(s => s.name === device.status)?.id || "",
                price: device.price || "",
                locationId: locations.find(l => l.name === device.location)?.id || ""
            });
        } else if (open && !isEditing) {
            setEditedDevice({
                code: "",
                brandId: "",
                modelId: "",
                serial: "",
                specification: "",
                type: "",
                statusId: "",
                price: "",
                locationId: ""
            });
        }
    }, [device, open, isEditing, brands, models, statuses, locations]);


    const handleChange = (e) => {
        setEditedDevice(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        // Validación de campos requeridos
        const requiredFields = [
            { key: "code", label: "Código" },
            { key: "brandId", label: "Marca" },
            { key: "modelId", label: "Modelo" },
            { key: "serial", label: "Serial" },
            { key: "specification", label: "Especificaciones" },
            { key: "type", label: "Tipo" },
            { key: "statusId", label: "Estado" },
            { key: "price", label: "Precio" },
            { key: "locationId", label: "Ubicación" }
        ];

        for (const field of requiredFields) {
            const value = editedDevice[field.key];
            if (!value || value.toString().trim() === "") {
                setSnackbarMessage(`Error al guardar dispositivo: el campo "${field.label}" es obligatorio.`);
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }

            if (field.key === "price") {
                const price = parseFloat(value);
                if (isNaN(price) || price < 0) {
                    setSnackbarMessage(`Error al guardar dispositivo: el campo "Precio" debe ser un número positivo.`);
                    setSnackbarSeverity("error");
                    setOpenSnackbar(true);
                    return;
                }
            }
        }

        const isCreating = !device?.id;
        const codeChanged = !device || editedDevice.code !== device.code;

        // ✅ Validación del código duplicado
        if (isCreating || codeChanged) {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            try {
                const response = await axios.get(`${API_BASE_URL}/api/v1/devices/search/${editedDevice.code}`, { headers });
                const existingDevices = response.data;

                if (existingDevices.length > 0) {
                    const existingDevice = existingDevices[0];
                    if (!device || existingDevice.id !== device.id) {
                        setSnackbarMessage(`Error: el código "${editedDevice.code}" ya está registrado para otro dispositivo.`);
                        setSnackbarSeverity("error");
                        setOpenSnackbar(true);
                        return;
                    }
                }

            } catch (error) {
                // Aquí puedes verificar si el error es un 404, lo cual indicaría que el código no existe
                if (error.response?.status !== 404) {
                    console.error("Error al verificar código de dispositivo:", error);
                    setSnackbarMessage("Error al verificar el código del dispositivo.");
                    setSnackbarSeverity("error");
                    setOpenSnackbar(true);
                    return;
                }
            }
        }

        // ✅ Guardado del dispositivo
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const apiUrl = isEditing
                ? `${API_BASE_URL}/api/v1/devices/${device.id}`
                : `${API_BASE_URL}/api/v1/devices/register`;

            const deviceData = {
                ...editedDevice,
                brand: { id: editedDevice.brandId },
                model: { id: editedDevice.modelId },
                status: { id: editedDevice.statusId },
                location: { id: editedDevice.locationId }
            };

            delete deviceData.brandId;
            delete deviceData.modelId;
            delete deviceData.statusId;
            delete deviceData.locationId;

            if (isEditing) {
                await axios.put(apiUrl, deviceData, { headers });
                
                setSnackbarMessage("Dispositivo actualizado con éxito");
            } else {
                await axios.post(apiUrl, deviceData, { headers });
                setSnackbarMessage("Dispositivo registrado con éxito");
            }

            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            refreshDevices();
            handleClose();
        } catch (error) {
            console.error("Error al guardar el dispositivo:", error);
            if (error.response?.data?.message) {
                setSnackbarMessage(`Error: ${error.response.data.message}`);
            } else {
                setSnackbarMessage("Error al guardar el dispositivo por código duplicado.");
            }
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
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
                    <Typography variant="h6">{isEditing ? "Editar Dispositivo" : "Registrar Dispositivo"}</Typography>
                    <TextField fullWidth margin="normal" label="Código" name="code" value={editedDevice.code} onChange={handleChange} />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Marca</InputLabel>
                        <Select name="brandId" value={editedDevice.brandId} onChange={handleChange}>
                            {brands.map(brand => (
                                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Modelo</InputLabel>
                        <Select name="modelId" value={editedDevice.modelId} onChange={handleChange}>
                            {models.map(model => (
                                <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="normal" label="Serial" name="serial" value={editedDevice.serial} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Especificaciones" name="specification" value={editedDevice.specification} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Tipo" name="type" value={editedDevice.type} onChange={handleChange} />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select name="statusId" value={editedDevice.statusId} onChange={handleChange}>
                            {statuses.map(status => (
                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Localización</InputLabel>
                        <Select name="locationId" value={editedDevice.locationId} onChange={handleChange}>
                            {locations.map(location => (
                                <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="normal" label="Precio" name="price" value={editedDevice.price} onChange={handleChange} />

                    <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
                        {isEditing ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Modal>

            {/* Diálogo de Éxito */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default DeviceModal;
