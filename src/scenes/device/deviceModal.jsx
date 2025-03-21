import { Box, Button, Modal, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import axios from "axios";

const DeviceModal = ({ open, handleClose, device, refreshDevices }) => {
    const isEditing = !!device;
    const [editedDevice, setEditedDevice] = useState({
        code: "",
        name: "",
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

    const statusMap = {
        "Entregado": 1,
        "Dañado": 2,
        "Mantenimiento": 3,
        "Disponible": 4,
        "No disponible": 5
    };

    useEffect(() => {
        if (open) {
            if (isEditing) {
                setEditedDevice({
                    code: device.code || "",
                    name: device.name || "",
                    serial: device.serial || "",
                    specification: device.specification || "",
                    type: device.type || "",
                    status: statusMap[device.status] || "",
                    price: device.price || "",
                    locationId: locations.find(loc => loc.name === device.location)?.id || ""
                });
            } else {
                setEditedDevice({
                    code: "",
                    name: "",
                    serial: "",
                    specification: "",
                    type: "",
                    status: "",
                    price: "",
                    locationId: ""
                });
            }

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

            fetchLocations();

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
    
            fetchStatuses();
        }
    }, [device, open, isEditing]);

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

            console.log("Registrando dispositivo:", JSON.stringify(deviceData, null, 2));

            await axios.post(apiUrl, deviceData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            refreshDevices();
            setOpenSuccess(true);
            setTimeout(() => setOpenSuccess(false), 2000);
            handleClose();
        } catch (error) {
            console.error("Error al registrar el dispositivo", error);
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

            console.log("Actualizando dispositivo:", JSON.stringify(deviceData, null, 2));

            await axios.put(apiUrl, deviceData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            refreshDevices();
            setOpenSuccess(true);
            setTimeout(() => setOpenSuccess(false), 2000);
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el dispositivo", error);
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
                    <TextField fullWidth margin="normal" label="Nombre" name="name" value={editedDevice.name} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Serial" name="serial" value={editedDevice.serial} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Especificaciones" name="specification" value={editedDevice.specification} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Tipo" name="type" value={editedDevice.type} onChange={handleChange} />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-label">Estatus</InputLabel>
                        <Select
                            labelId="status-label"
                            name="status"
                            value={editedDevice.status}
                            onChange={handleChange}
                        >
                            {statuses.map((status) => (
                                <MenuItem key={status.id} value={status.id}>
                                    {status.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


                    {!isEditing ? (
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="location-label">Localización</InputLabel>
                        <Select
                            labelId="location-label"
                            name="locationId"
                            value={editedDevice.locationId || ""}
                            onChange={handleChange}
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Localización"
                        value={
                            locations.find(loc => loc.id === editedDevice.locationId)?.name || "No disponible"
                        }
                        disabled={isEditing}
                    />
                )}



                    <TextField fullWidth margin="normal" label="Precio" name="price" value={editedDevice.price} onChange={handleChange} />

                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={isEditing ? handleUpdateDevice : handleRegisterDevice} 
                        sx={{ mt: 2 }}
                    >
                        {isEditing ? "Guardar Cambios" : "Registrar"}
                    </Button>
                </Box>
            </Modal>
            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
                <DialogTitle>¡{isEditing ? "Dispositivo actualizado" : "Dispositivo registrado"}!</DialogTitle>
                <DialogContent>
                    {isEditing ? "Los cambios se guardaron correctamente." : "El dispositivo ha sido registrado con éxito."}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSuccess(false)} color="primary" autoFocus>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeviceModal;
