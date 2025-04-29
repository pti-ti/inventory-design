import {
    Box, Button, Modal, TextField, Typography,
    Snackbar, Alert, Select, MenuItem, InputLabel,
    FormControl, Autocomplete
} from "@mui/material";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useState, useEffect } from "react";
import axios from "axios";

const MaintenanceModal = ({ open, handleClose, maintenance, refreshMaintenances }) => {
    const isEditing = Boolean(maintenance?.id);

    const initialMaintenanceState = {
        id: "",
        deviceId: "",
        deviceCode: "",
        deviceBrand: "",
        deviceModel: "",
        userId: "",
        userEmail: "",
        maintenanceType: "",
        maintenanceDate: "",
        comment: "",
        items: []
    };

    const [editedMaintenance, setEditedMaintenance] = useState(initialMaintenanceState);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [itemsList, setItemsList] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"
    const [emailInput, setEmailInput] = useState('');
    const [emailSuggestions, setEmailSuggestions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deviceSuggestions, setDeviceSuggestions] = useState([]);
    const [deviceCodeInput, setDeviceCodeInput] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [userLocation, setUserLocation] = useState('');
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    



    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    // Primer useEffect para actualizar mantenimiento
useEffect(() => {
    if (open && maintenance) {
        let formattedDate = "";
        if (maintenance.maintenanceDate) {
            if (maintenance.maintenanceDate.includes("/")) {
                const [day, month, year] = maintenance.maintenanceDate.split("/");
                formattedDate = `${year}-${month}-${day}`; // Convertir correctamente
            } else {
                formattedDate = maintenance.maintenanceDate; // Mantener formato si ya está correcto
            }
        }

        const updatedMaintenance = {
            id: maintenance.id ?? "",
            deviceId: maintenance.deviceId ?? "",
            deviceCode: maintenance.deviceCode ?? "",
            deviceBrand: maintenance.deviceBrand ?? "",
            deviceModel: maintenance.deviceModel ?? "",
            userEmail: maintenance.userEmail ?? "",
            maintenanceType: maintenance.maintenanceType ?? "",
            comment: maintenance.comment ?? "",
            maintenanceDate: formattedDate, // Asignar la fecha formateada
            items: maintenance.items?.map(item => item.id) ?? [],
        };

        setEditedMaintenance(updatedMaintenance);
        console.log("Estado actualizado de editedMaintenance:", updatedMaintenance);
    } else {
        setEditedMaintenance(initialMaintenanceState);
    }
}, [maintenance, open]);

// Segundo useEffect para cargar ítems
useEffect(() => {
    if (open && itemsList.length === 0) {
        const token = localStorage.getItem("token");

        axios.get(`${API_BASE_URL}/api/v1/items`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => setItemsList(response.data))
            .catch(error => {
                console.error("Error al obtener ítems:", error);
                setErrorMessage("No se pudieron cargar los ítems.");
            });
    }
}, [open]);

// Tercer useEffect para obtener los datos del dispositivo
useEffect(() => {
    if (!isEditing && editedMaintenance.deviceId) {
        fetchDeviceData(editedMaintenance.deviceId);
    }
}, [editedMaintenance.deviceId]);

// Cuarto useEffect para obtener los datos del usuario
useEffect(() => {
    if (!isEditing && editedMaintenance.userId) {
        fetchUserData(editedMaintenance.userId);
    }
}, [editedMaintenance.userId]);

useEffect(() => {
    const delayDebounce = setTimeout(() => {
        if (deviceCodeInput.trim() === '') {
            setDeviceSuggestions([]);
            return;
        }

        const fetchDeviceSuggestions = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/api/v1/devices/search`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        code: deviceCodeInput,
                    },
                });

                if (response.data && response.data.length > 0) {
                    setDeviceSuggestions(response.data);
                    const device = response.data[0];

                    // Actualizamos el estado solo si los valores cambian
                    setEditedMaintenance(prev => {
                        const newDeviceCode = device.code || prev.deviceCode;
                        const newDeviceBrand = brands.find(b => b.name === device.brandName)?.id?.toString() || prev.deviceBrand;
                        const newDeviceModel = models.find(m => m.name === device.modelName)?.id?.toString() || prev.deviceModel;

                        return {
                            ...prev,
                            deviceCode: newDeviceCode,
                            deviceBrand: newDeviceBrand,
                            deviceModel: newDeviceModel,
                        };
                    });
                } else {
                    setDeviceSuggestions([]);
                    setErrorMessage("No se encontraron dispositivos con ese código.");
                }
            } catch (error) {
                console.error("Error al buscar dispositivos por código:", error);
                setErrorMessage("Ocurrió un error al buscar el dispositivo.");
            }
        };

        fetchDeviceSuggestions();
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
}, [deviceCodeInput]);


// useEffect para cargar usuarios por email con debounce
useEffect(() => {
    const delayDebounce = setTimeout(() => {
        if (emailInput.trim() === '') {
            setEmailSuggestions([]);
            return;
        }

        const fetchUserSuggestions = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/api/v1/users/by-email`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        email: emailInput,
                    },
                });

                const usersWithLocation = response.data.map(user => ({
                    ...user,
                    location: user.location || "",  // Asegúrate de que el campo 'location' esté en la respuesta
                }));

                setEmailSuggestions(usersWithLocation);
            } catch (error) {
                console.error("Error al buscar usuarios por email:", error);
            }
        };

        fetchUserSuggestions();
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
}, [emailInput]);

// Función para manejar cambios en los campos
const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMaintenance(prev => ({ ...prev, [name]: value }));
};

const resetForm = () => {
    setEditedMaintenance(initialMaintenanceState);
    setDeviceCodeInput('');
    setEmailInput('');
};

const handleCloseModal = () => {
    resetForm();
    handleClose();
};




// Función para manejar cambios en los ítems
const handleItemsChange = (event) => {
    setEditedMaintenance(prev => ({
        ...prev,
        items: event.target.value
    }));
};

const handleCreateOrUpdate = async () => {
    const selectedDate = new Date(editedMaintenance.maintenanceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Para comparar solo la fecha, no la hora

    if (selectedDate > today) {
        setSnackbarMessage("La fecha de mantenimiento no puede ser futura.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
    }

    // Autocompleta deviceId si no está aún
    if (!editedMaintenance.deviceId && deviceCodeInput) {
        const foundDevice = deviceSuggestions.find(d => d.code === deviceCodeInput);
        if (foundDevice) {
            editedMaintenance.deviceId = foundDevice.id;
        } else {
            setSnackbarMessage("El código del dispositivo no es válido.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
    }

    // Autocompleta userId si no está aún
    if (!editedMaintenance.userId && emailInput) {
        const foundUser = emailSuggestions.find(u => u.email === emailInput);
        if (foundUser) {
            editedMaintenance.userId = foundUser.id;
        } else {
            setSnackbarMessage("El correo del usuario no es válido.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
    }

    try {
        const token = localStorage.getItem("token");

        const maintenanceData = {
            id: isEditing ? editedMaintenance.id : undefined,
            device: { id: Number(editedMaintenance.deviceId) },
            user: { id: Number(editedMaintenance.userId) },
            maintenanceType: editedMaintenance.maintenanceType,
            maintenanceDate: editedMaintenance.maintenanceDate,
            comment: editedMaintenance.comment,
            items: editedMaintenance.items.map(id => ({ id: Number(id) })),
            updatedBy: 3,
        };

        if (isEditing) {
            await axios.put(
                `${API_BASE_URL}/api/v1/maintenances/${editedMaintenance.id}`,
                maintenanceData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSnackbarMessage("Mantenimiento actualizado exitosamente.");
        } else {
            await axios.post(
                `${API_BASE_URL}/api/v1/maintenances/register`,
                maintenanceData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSnackbarMessage("Mantenimiento registrado exitosamente.");

            // Descargar Excel solo en modo registro
            try {
                const response = await axios.get(`${API_BASE_URL}/api/v1/excel/update`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "Mantenimiento.xlsx");
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            } catch (excelError) {
                console.error("Error al descargar el Excel:", excelError);
                setSnackbarMessage("Mantenimiento guardado, pero ocurrió un error al descargar el Excel.");
                setSnackbarSeverity("warning");
                setSnackbarOpen(true);
            }
        }

        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        refreshMaintenances();
        handleClose();
    } catch (error) {
        console.error("Error al guardar mantenimiento:", error);
        setSnackbarMessage("Error al guardar el mantenimiento. Inténtalo de nuevo.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    }
};


// Función para obtener datos del dispositivo
const fetchDeviceData = async (deviceId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/v1/devices/${deviceId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const device = response.data;
        console.log("Device data:", device);
        
        // Solo actualiza los valores si el dispositivo tiene datos
        setEditedMaintenance(prev => ({
            ...prev,
            deviceId: device.id?.toString() || "",
            deviceCode: device.code || prev.deviceCode,   // Mantiene el código si no hay nuevo
            deviceBrand: device.brandName || prev.deviceBrand,  // No sobrescribe si ya existe
            deviceModel: device.modelName || prev.deviceModel,  // No sobrescribe si ya existe
        }));
    } catch (error) {
        console.error("Error al obtener datos del dispositivo:", error);
        
        // Aquí solo restableces a vacíos si realmente no se pueden obtener los datos
        setEditedMaintenance(prev => ({
            ...prev,
            deviceId: prev.deviceId,
            deviceCode: prev.deviceCode,  // No se borra el código si hay error
            deviceBrand: prev.deviceBrand,  // No se borra la marca
            deviceModel: prev.deviceModel,  // No se borra el modelo
        }));
    }
};


// Función para obtener datos del usuario
const fetchUserData = async (userId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data;
        setEditedMaintenance(prev => ({
            ...prev,
            userEmail: user.email || "",
        }));
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setEditedMaintenance(prev => ({
            ...prev,
            userEmail: "",
        }));
    }
};

return (
    <>
        <Modal open={open} onClose={handleCloseModal}>
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
                <Typography variant="h6">
                    {isEditing ? "Editar Mantenimiento" : "Registrar Mantenimiento"}
                </Typography>

                <Autocomplete
                    freeSolo
                    options={deviceSuggestions.map(device => device.code)}
                    inputValue={deviceCodeInput}
                    onInputChange={(e, newValue) => setDeviceCodeInput(newValue)}
                    onChange={(e, newValue) => {
                        setDeviceCodeInput(newValue || '');  // Actualiza el input del código del dispositivo
                        const selectedDevice = deviceSuggestions.find(device => device.code === newValue);
                        if (selectedDevice) {
                            setEditedMaintenance(prev => ({
                                ...prev,
                                deviceId: selectedDevice.id,
                            }));
                            fetchDeviceData(selectedDevice.id);  // Trae los datos del dispositivo
                        }
                    }}
                    
                    renderInput={(params) => (
                        <TextField {...params} fullWidth margin="normal" label="Código dispositivo" />
                    )}
                />

                <TextField fullWidth margin="normal" label="Marca del dispositivo" name="deviceBrand" value={editedMaintenance.deviceBrand}  disabled/>
                <TextField fullWidth margin="normal" label="Modelo del dispositivo" name="deviceModel" value={editedMaintenance.deviceModel}  disabled/>

                <Autocomplete
                    freeSolo
                    options={emailSuggestions.map(user => user.email)}
                    inputValue={emailInput}
                    onInputChange={(e, newValue) => setEmailInput(newValue)}
                    onChange={(e, newValue) => {
                        setEmailInput(newValue || '');
                        const selectedUser = emailSuggestions.find(user => user.email === newValue);
                        if (selectedUser) {
                            setEditedMaintenance(prev => ({
                                ...prev,
                                userEmail: selectedUser.email,
                                userLocation: selectedUser.location || "",
                            }));
                        }
                    }}
                    renderInput={(params) => (
                        <TextField {...params} fullWidth margin="normal" label="Correo del usuario" />
                    )}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Tipo de Mantenimiento</InputLabel>
                    <Select
                        name="maintenanceType"
                        value={editedMaintenance.maintenanceType}
                        onChange={handleChange}
                    >
                        <MenuItem value="" disabled>Selecciona un tipo</MenuItem>
                        <MenuItem value="Preventivo">Preventivo</MenuItem>
                        <MenuItem value="Correctivo">Correctivo</MenuItem>
                        <MenuItem value="Garantía">Garantía</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="items-label">Selecciona Ítems</InputLabel>
                    <Select
                        labelId="items-label"
                        multiple
                        value={editedMaintenance.items}
                        onChange={handleItemsChange}
                        renderValue={(selected) =>
                            selected.map(id => itemsList.find(item => item.id === id)?.name).join(", ")
                        }
                    >
                        {itemsList.map(item => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    margin="normal"
                    label="Comentarios"
                    name="comment"
                    value={editedMaintenance.comment}
                    onChange={handleChange}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Fecha de mantenimiento"
                    name="maintenanceDate"
                    type="date"
                    value={editedMaintenance.maintenanceDate}
                    onChange={handleChange}
                    disabled={isEditing}
                    InputLabelProps={{ shrink: true }}
                />

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleCreateOrUpdate}
                    >
                        {isEditing ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Box>
        </Modal>

        <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000} // Se cierra en 4 segundos
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
            <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                {snackbarMessage}
            </Alert>
        </Snackbar>
    </>
);

};

export default MaintenanceModal;
