import { Box, Button, Modal, TextField, Typography, Snackbar, Alert, Autocomplete, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const initialDevice = {
    code: "", brandId: "", modelId: "", serial: "", specification: "",
    type: "", statusId: "", price: "", locationId: "", userEmail: "", userId: "",
    note: ""
};

const DeviceModal = ({ open, handleClose, device, refreshDevices }) => {
    const isEditing = !!device;
    const [editedDevice, setEditedDevice] = useState(initialDevice);
    const [catalogs, setCatalogs] = useState({ locations: [], statuses: [], brands: [], models: [] });
    const [emailInput, setEmailInput] = useState('');
    const [emailSuggestions, setEmailSuggestions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingUserId, setLoadingUserId] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Cargar catálogos
    useEffect(() => {
        if (!open) return;
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const [locations, statuses, models, brands] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/v1/locations`, { headers }),
                    axios.get(`${API_BASE_URL}/api/v1/status`, { headers }),
                    axios.get(`${API_BASE_URL}/api/v1/models`, { headers }),
                    axios.get(`${API_BASE_URL}/api/v1/brands`, { headers }),
                ]);
                setCatalogs({
                    locations: locations.data, statuses: statuses.data,
                    models: models.data, brands: brands.data
                });
            } catch (error) { console.error("Error al obtener catálogos", error); }
        };
        fetchData();
    }, [open]);

    // Inicializar formulario
    useEffect(() => {
        if (open && isEditing && device && Object.values(catalogs).every(arr => arr.length)) {
            setEditedDevice({
                code: device.code || "",
                brandId: catalogs.brands.find(b => b.name === device.brand)?.id || "",
                modelId: catalogs.models.find(m => m.name === device.model)?.id || "",
                serial: device.serial || "",
                specification: device.specification || "",
                type: device.type || "",
                statusId: catalogs.statuses.find(s => s.name === device.status)?.id || "",
                price: device.price ?? "",
                locationId: catalogs.locations.find(l => l.name === device.location)?.id || "",
                userEmail: device.userEmail || "",
                userId: device.userId?.toString() || "",
                note: device.note || "",
            });
            setSelectedUser(device.userEmail ? { email: device.userEmail, id: device.userId } : null);
        } else if (open && !isEditing) {
            setEditedDevice(initialDevice);
            setSelectedUser(null);
        }
    }, [device, open, isEditing, catalogs]);

    // Limpiar al cerrar
    useEffect(() => {
        if (!open) {
            setEditedDevice(initialDevice);
            setSelectedUser(null);
            setEmailInput('');
            setEmailSuggestions([]);
        }
    }, [open]);

    // Autocompletar usuario
    useEffect(() => {
        const delay = setTimeout(() => {
            if (!emailInput.trim()) return setEmailSuggestions([]);
            const fetchSuggestions = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(`${API_BASE_URL}/api/v1/users/by-email`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { email: emailInput }
                    });
                    setEmailSuggestions(res.data.map(u => ({ ...u, location: u.location || "" })));
                } catch { setEmailSuggestions([]); }
            };
            fetchSuggestions();
        }, 300);
        return () => clearTimeout(delay);
    }, [emailInput]);

    // Buscar userId por email
    useEffect(() => {
        const fetchUserId = async () => {
            if (editedDevice.userEmail && editedDevice.userEmail.includes('@')) {
                setLoadingUserId(true);
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(`${API_BASE_URL}/api/v1/users/by-email`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { email: editedDevice.userEmail }
                    });
                    setEditedDevice(prev => ({
                        ...prev,
                        userId: res.data?.[0]?.id?.toString() || ""
                    }));
                } catch { setEditedDevice(prev => ({ ...prev, userId: "" })); }
                setLoadingUserId(false);
            }
        };
        fetchUserId();
    }, [editedDevice.userEmail]);

    // Handlers
    const handleChange = e => setEditedDevice(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (loadingUserId) {
            return setSnackbar({ open: true, message: "Por favor espera a que se valide el usuario.", severity: "warning" });
        }
        if (!editedDevice.userId) {
            return setSnackbar({ open: true, message: "Debes seleccionar un usuario válido del autocompletado.", severity: "error" });
        }
        // Validación de campos requeridos
        const required = [
            { key: "code", label: "Código" }, { key: "brandId", label: "Marca" }, { key: "modelId", label: "Modelo" },
            { key: "serial", label: "Serial" }, { key: "specification", label: "Especificaciones" }, { key: "type", label: "Tipo" },
            { key: "userEmail", label: "Asignado a" }, { key: "statusId", label: "Estado" }, { key: "price", label: "Precio" }, { key: "locationId", label: "Ubicación" }
        ];
        for (const field of required) {
            const value = editedDevice[field.key];
            if (field.key !== "price" && (!value || value.toString().trim() === "")) {
                return setSnackbar({ open: true, message: `El campo "${field.label}" es obligatorio.`, severity: "error" });
            }
            if (field.key === "price") {
                if (value === "" || value === null || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
                    return setSnackbar({ open: true, message: `El campo "Precio" debe ser un número positivo.`, severity: "error" });
                }
            }
        }

        // Guardar (deja la validación de duplicado al backend)
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = isEditing
                ? `${API_BASE_URL}/api/v1/devices/${device.id}`
                : `${API_BASE_URL}/api/v1/devices/register`;
            const deviceData = {
                code: editedDevice.code,
                brand: { id: Number(editedDevice.brandId) },
                model: { id: Number(editedDevice.modelId) },
                serial: editedDevice.serial,
                type: editedDevice.type,
                specification: editedDevice.specification,
                price: Number(editedDevice.price),
                status: { id: Number(editedDevice.statusId) },
                location: { id: Number(editedDevice.locationId) },
                user: { id: Number(editedDevice.userId) },
                note: editedDevice.note
            };

            console.log("Datos enviados al backend:", deviceData);

            await (isEditing
                ? axios.put(apiUrl, deviceData, { headers })
                : axios.post(apiUrl, deviceData, { headers }));
            setSnackbar({ open: true, message: isEditing ? "Dispositivo actualizado con éxito" : "Dispositivo registrado con éxito", severity: "success" });
            refreshDevices();
            handleClose();
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Error al guardar el dispositivo.",
                severity: "error"
            });
        }
    };

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: 400, bgcolor: "background.paper", boxShadow: 24, p: 4, borderRadius: 2,
                }}>
                    <Typography variant="h6">{isEditing ? "Editar Dispositivo" : "Registrar Dispositivo"}</Typography>
                    <TextField fullWidth margin="normal" label="Código" name="code" value={editedDevice.code} onChange={handleChange} disabled={isEditing} />
                    <FormControl fullWidth margin="normal" disabled={isEditing}>
                        <InputLabel>Marca</InputLabel>
                        <Select name="brandId" value={editedDevice.brandId} onChange={handleChange}>
                            {catalogs.brands.map(brand => (
                                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" disabled={isEditing}>
                        <InputLabel>Modelo</InputLabel>
                        <Select name="modelId" value={editedDevice.modelId} onChange={handleChange}>
                            {catalogs.models.map(model => (
                                <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField fullWidth margin="normal" label="Serial" name="serial" value={editedDevice.serial} onChange={handleChange} disabled={isEditing} />
                    <TextField fullWidth margin="normal" label="Especificaciones" name="specification" value={editedDevice.specification} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Tipo" name="type" value={editedDevice.type} onChange={handleChange} disabled={isEditing} />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Nota (opcional)"
                        name="note"
                        value={editedDevice.note}
                        onChange={handleChange}
                    />
                    <Autocomplete
                        fullWidth
                        options={emailSuggestions}
                        getOptionLabel={option => option.email || ""}
                        value={selectedUser}
                        onInputChange={(_, newInputValue) => {
                            setEmailInput(newInputValue);
                            setEditedDevice(prev => ({ ...prev, userEmail: newInputValue }));
                        }}
                        onChange={(_, newValue) => {
                            setSelectedUser(newValue);
                            setEditedDevice(prev => ({
                                ...prev,
                                userId: newValue?.id?.toString() || '',
                                userEmail: newValue?.email || '',
                                locationId: newValue?.location?.id || prev.locationId
                            }));
                        }}
                        renderInput={params => (
                            <TextField {...params} label="Correo del Usuario" margin="normal" />
                        )}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select name="statusId" value={editedDevice.statusId} onChange={handleChange}>
                            {catalogs.statuses.map(status => (
                                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Localización</InputLabel>
                        <Select name="locationId" value={editedDevice.locationId} onChange={handleChange}>
                            {catalogs.locations.map(location => (
                                <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField fullWidth margin="normal" label="Precio" name="price" type="number" value={editedDevice.price} onChange={handleChange} />
                    <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }} disabled={loadingUserId}>
                        {isEditing ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Modal>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default DeviceModal;