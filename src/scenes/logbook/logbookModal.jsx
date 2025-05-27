import {
    Box, Button, Modal, TextField, Typography, MenuItem,
    Select, FormControl, InputLabel, Snackbar, Alert, Autocomplete
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
    const [emailInput, setEmailInput] = useState('');
    const [emailSuggestions, setEmailSuggestions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deviceSuggestions, setDeviceSuggestions] = useState([]);
    const [deviceCodeInput, setDeviceCodeInput] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [userLocation, setUserLocation] = useState('');




    const isEditing = Boolean(logbook?.id);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const [statusResponse, locationResponse, brandResponse, modelResponse] = await Promise.all([
                        axios.get(`${API_BASE_URL}/api/v1/status`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_BASE_URL}/api/v1/locations`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_BASE_URL}/api/v1/brands`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get(`${API_BASE_URL}/api/v1/models`, { headers: { Authorization: `Bearer ${token}` } }),
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
        if (!open) {
            // Restablecer el estado cuando se cierra el modal
            setEditedLogbook(initialLogbookState);  // Asegúrate de que `initialLogbookState` sea el estado por defecto
            setSelectedUser(null);  // Limpiar el usuario seleccionado
            setEmailInput("");      // Limpiar el campo de correo electrónico
        }
    }, [open]);  // El efecto se ejecuta cuando `open` cambia
    

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

            setSelectedUser({ id: logbook.userId, email: logbook.userEmail });
            setEmailInput(logbook.userEmail || "");

            setSelectedDevice({
                id: logbook.deviceId,
                code: logbook.deviceCode,
                brand: { name: logbook.deviceBrand },
                model: { name: logbook.deviceModel }
            });
            setDeviceCodeInput(logbook.deviceCode || "");


        } else {
            setEditedLogbook(initialLogbookState);
        }
    }, [logbook, open, statuses, locations, brands, models]);

    // Función para cargar los dispositivos por código  
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

                    // Verificamos si la respuesta tiene dispositivos
                    if (response.data && response.data.length > 0) {
                        setDeviceSuggestions(response.data);
                        // Aquí, asignamos los valores de marca y modelo si se encuentran
                        const device = response.data[0];  // Usamos el primer dispositivo de las sugerencias
                        setEditedLogbook(prev => ({
                            ...prev,
                            deviceCode: device.code || "",
                            deviceBrand: brands.find(b => b.name === device.brandName)?.id?.toString() || "",
                            deviceModel: models.find(m => m.name === device.modelName)?.id?.toString() || "",
                        }));
                    } else {
                        // Si no se encuentran dispositivos, mostramos un mensaje
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

    // Función para cargar los emails de los usuarios
    // Función para cargar los emails y ubicaciones de los usuarios
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

                    // Suponiendo que la respuesta incluye la ubicación y el email
                    const usersWithLocation = response.data.map(user => ({
                        ...user,
                        location: user.location || ""  // Asegúrate de que el campo 'location' esté en la respuesta
                    }));

                    setEmailSuggestions(usersWithLocation);
                } catch (error) {
                    console.error("Error al buscar usuarios por email:", error);
                }
            };

            fetchUserSuggestions();
        }, 300); // 300ms de debounce

        return () => clearTimeout(delayDebounce);
    }, [emailInput]);


    const handleUserChange = (event, newValue) => {
        setSelectedUser(newValue);
        if (newValue) {
            // Asumimos que `newValue` tiene un campo `email` y `location`
            setUserLocation(newValue.location || 'Ubicación no disponible');
            setSuccessMessage('Usuario seleccionado exitosamente');
        } else {
            setUserLocation('');
            setSuccessMessage('');
        }
    };

    const resetFormState = () => {
        setEditedLogbook(initialLogbookState);
        setSelectedUser(null);
        setEmailInput('');
        setDeviceCodeInput('');
        setSelectedDevice(null);
        setEmailSuggestions([]);
        setDeviceSuggestions([]);
        setUserLocation('');
    };

    const fetchDeviceById = async (deviceId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/api/v1/devices/${deviceId}`, {
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
            const response = await axios.get(`${API_BASE_URL}/api/v1/users/${value}`, {
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

    const handleEmailInputChange = async (e) => {
        const value = e.target.value;
    }

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!editedLogbook.note.trim()) {
                setErrorMessage("Error en algún campo no permite guardar la bitácora.");
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
                    `${API_BASE_URL}/api/v1/logbooks/${editedLogbook.id}`,
                    logbookData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage("Bitácora actualizada correctamente.");
            } else {
                await axios.post(
                    `${API_BASE_URL}/api/v1/logbooks/register`,
                    logbookData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage("Bitácora registrada correctamente.");
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    const response = await axios.get(`${API_BASE_URL}/api/v1/excel/logbook`, {
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
            resetFormState();  
            handleClose();
        } catch (error) {
            console.error("Error al guardar la bitácora", error.response?.data || error.message);
            setErrorMessage("No se pudo procesar la solicitud.");
        }
    };

    const handleCloseModal = () => {
        handleClose();  // Cerrar el modal
        // Limpiar el estado de la bitácora
        refreshLogbooks(initialLogbookState); // Pasar el estado inicial para limpiar el logbook
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
                    <Typography variant="h6">{isEditing ? "Editar Bitácora" : "Registrar Bitácora"}</Typography>

                
                    {!isEditing && (
                        <Autocomplete
                            fullWidth
                            freeSolo
                            options={deviceSuggestions}
                            getOptionLabel={(option) => option.code || ""}  // Usamos el código como etiqueta de las opciones
                            value={null}  // Aquí no vinculamos el valor directamente, dejamos que solo el input se controle
                            onInputChange={(event, newInputValue) => {
                                // Solo actualizamos el valor de deviceCodeInput cuando escribes
                                setDeviceCodeInput(newInputValue);
                            }}
                            onChange={(event, newValue) => {
                                // Cuando seleccionas un valor de la lista de sugerencias, lo usamos para actualizar el dispositivo
                                if (newValue) {
                                    setSelectedDevice(newValue);

                                    setEditedLogbook((prev) => ({
                                        ...prev,
                                        deviceId: newValue.id.toString(),
                                        deviceCode: newValue.code,
                                        deviceBrand: newValue.brand?.name || "",  // Aquí usamos la marca por nombre
                                        deviceModel: newValue.model?.name || "",  // Aquí usamos el modelo por nombre
                                    }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Código del Dispositivo"
                                    margin="normal"
                                    value={deviceCodeInput}  // Aquí controlamos el valor con el estado de deviceCodeInput
                                    onChange={(e) => setDeviceCodeInput(e.target.value)}  // Actualizamos el valor del input al escribir
                                />
                            )}
                        />


                    )}

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
                        <Autocomplete
                        fullWidth
                        freeSolo
                        options={emailSuggestions}
                        getOptionLabel={(option) => option.email || ""}
                        value={selectedUser}  // Vincula al valor de `selectedUser`
                        onInputChange={(event, newInputValue) => {
                            setEmailInput(newInputValue);  // Actualiza el input del correo
                        }}
                        onChange={(event, newValue) => {
                            setSelectedUser(newValue);  // Asigna el usuario seleccionado al estado
                            setEditedLogbook((prev) => ({
                                ...prev,
                                userId: newValue?.id?.toString() || '',
                                userEmail: newValue?.email || '',
                                locationId: newValue?.location?.id || ''  // Aquí también gestionas la ubicación
                            }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Correo del Usuario"
                                margin="normal"
                            />
                        )}
                    />
                    
                    )}

                    {/* Selección de ubicación */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ubicación</InputLabel>
                        <Select
                            name="locationId"
                            value={editedLogbook.locationId}  // El valor de ubicación se toma de 'editedLogbook'
                            onChange={handleChange}
                            disabled={isEditing}
                        >
                            {locations.map(location => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
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
