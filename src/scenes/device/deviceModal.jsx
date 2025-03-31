import { Box, Button, Modal, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import axios from "axios";

const DeviceModal = ({ open, handleClose, device, refreshDevices }) => {
    const isEditing = !!device;
    const [editedDevice, setEditedDevice] = useState({
        code: "",
        brand: "",
        model: "",
        serial: "",
        specification: "",
        type: "",
        status: "",
        price: "",
        locationId: ""
    });
    const [locations, setLocations] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // "success" o "error"


    useEffect(() => {
        if (open) {
            if (isEditing) {
                setEditedDevice(prevDevice => ({
                    ...prevDevice,
                    code: device.code || "",
                    name: device.brand || "",
                    name: device.model || "",
                    serial: device.serial || "",
                    specification: device.specification || "",
                    type: device.type || "",
                    status: statuses.find(status => status.name === device.status)?.id || "",
                    price: device.price || "",
                    locationId: locations.find(loc => loc.name === device.location)?.id || ""
                }));
            } else {
                setEditedDevice({
                    code: "",
                    brand: "",
                    model: "",
                    serial: "",
                    specification: "",
                    type: "",
                    status: "",
                    price: "",
                    locationId: ""
                });
            }
        }
    }, [device, open, isEditing]);
    
    useEffect(() => {
        if (open) {
            const fetchLocations = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await axios.get("http://localhost:8085/api/v1/admin/locations", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setLocations(response.data);
                } catch (error) {
                    console.error("Error al obtener localizaciones", error);
                }
            };
    
            const fetchStatuses = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await axios.get("http://localhost:8085/api/v1/admin/status", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setStatuses(response.data);
                } catch (error) {
                    console.error("Error al obtener los estatus", error);
                }
            };
    
            fetchLocations();
            fetchStatuses();
        }
    }, [open]);
    

    const handleChange = (e) => {
        setEditedDevice({ ...editedDevice, [e.target.name]: e.target.value });
    };

    const handleRegisterDevice = async () => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = "http://localhost:8085/api/v1/admin/devices/register";
    
            const deviceData = {
                ...editedDevice,
                status: { id: editedDevice.status },
                location: { id: editedDevice.locationId }
            };
    
            await axios.post(apiUrl, deviceData, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            refreshDevices();
            setSnackbarMessage("Dispositivo registrado con éxito");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            handleClose();
        } catch (error) {
            console.error("Error al registrar el dispositivo", error);
            setSnackbarMessage("Error al registrar el dispositivo");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        }
    };
    
    const handleUpdateDevice = async () => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = `http://localhost:8085/api/v1/admin/devices/${device.id}`;
    
            const deviceData = {
                ...editedDevice,
                status: { id: editedDevice.status },
                location: { id: editedDevice.locationId }
            };
    
            delete deviceData.locationId;
    
            await axios.put(apiUrl, deviceData, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            refreshDevices();
            setSnackbarMessage("Dispositivo actualizado con éxito");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el dispositivo", error);
            setSnackbarMessage("Error al actualizar el dispositivo");
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
                    <TextField fullWidth margin="normal" label="Código" name="code" value={editedDevice.code} onChange={handleChange} disabled={isEditing} />
                    <TextField fullWidth margin="normal" label="Marca" name="brand" value={editedDevice.name} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Modelo" name="model" value={editedDevice.name} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Serial" name="serial" value={editedDevice.serial} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Especificaciones" name="specification" value={editedDevice.specification} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Tipo" name="type" value={editedDevice.type} onChange={handleChange} />
    
                    {/* Campo de Estado (Status) - Deshabilitado si se está editando */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-label">Estado</InputLabel>
                        <Select
                            labelId="status-label"
                            name="status"
                            value={editedDevice.status}
                            onChange={handleChange}
                            disabled={isEditing} // Deshabilitado en modo edición
                        >
                            {statuses.map((status) => (
                                <MenuItem key={status.id} value={status.id}>
                                    {status.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
    
                    {/* Campo de Localización (Location) - Deshabilitado si se está editando */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="location-label">Localización</InputLabel>
                        <Select
                            labelId="location-label"
                            name="locationId"
                            value={editedDevice.locationId || ""}
                            onChange={handleChange}
                            disabled={isEditing} // Deshabilitado en modo edición
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
    
                    <TextField fullWidth margin="normal" label="Precio" name="price" value={editedDevice.price} onChange={handleChange} />
    
                    <Button 
                        fullWidth
                        variant="contained" 
                        color="primary" 
                        onClick={isEditing ? handleUpdateDevice : handleRegisterDevice} 
                        sx={{ mt: 2 }}
                    >
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
