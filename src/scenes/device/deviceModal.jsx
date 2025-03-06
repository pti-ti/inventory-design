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
        price: ""
    });
    const [openConfirm, setOpenConfirm] = useState(false);
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
                    price: device.price || ""
                });
            } else {
                setEditedDevice({
                    code: "",
                    name: "",
                    serial: "",
                    specification: "",
                    type: "",
                    status: "",
                    price: ""
                });
            }
        }
    }, [device, open, isEditing]);

    const handleChange = (e) => {
        setEditedDevice({ ...editedDevice, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = isEditing
                ? `http://localhost:8085/api/v1/admin/devices/${device.id}`
                : "http://localhost:8085/api/v1/admin/devices/register";
            const method = isEditing ? "put" : "post";
            const cleanPrice = Number(editedDevice.price.replace(/[^0-9]/g, ""));

            const deviceData = {
                ...editedDevice,
                status: { id: editedDevice.status } // Convertimos status a objeto con id
            };

            console.log("Payload enviado:", JSON.stringify(deviceData, null, 2)); // Agregar este log

            
            await axios({
                method,
                url: apiUrl,
                data: deviceData,
                headers: { Authorization: `Bearer ${token}` },
            });
            
            refreshDevices();
            setOpenSuccess(true);
            setTimeout(() => setOpenSuccess(false), 2000);
            handleClose();
        } catch (error) {
            console.error("Error al guardar el dispositivo", error);
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
                            <MenuItem value={1}>Entregado</MenuItem>
                            <MenuItem value={2}>Dañado</MenuItem>
                            <MenuItem value={3}>Mantenimiento</MenuItem>
                            <MenuItem value={4}>Disponible</MenuItem>
                            <MenuItem value={5}>No disponible</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="normal" label="Precio" name="price" value={editedDevice.price} onChange={handleChange} />
                    
                    <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
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