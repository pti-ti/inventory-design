import { Box, Button, Modal, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import axios from "axios";

const DeviceModal = ({ open, handleClose, device, refreshDevices }) => {
    const [editedDevice, setEditedDevice] = useState(device || {});
    const [openConfirm, setOpenConfirm] = useState(false); 
    const [openSuccess, setOpenSuccess] = useState(false); 

    // Mapeo de nombres de estado a IDs
    const statusMap = {
        "Entregado": 1,
        "Dañado": 2,
        "Mantenimiento": 3,
        "Disponible": 4,
        "No disponible": 5
    };

    useEffect(() => {
        if (open && device) {
            console.log("Datos recibidos del backend:", device);

            setEditedDevice({
                code: device.code || "",
                name: device.name || "",
                serial: device.serial || "",
                specification: device.specification || "",
                type: device.type || "",
                status: statusMap[device.status] || "",  // Convertir nombre a ID
                price: device.price || ""
            });

            console.log("Estatus cargado:", device.status, "->", statusMap[device.status]);
        }
    }, [device, open]);

    const handleChange = (e) => {
        setEditedDevice({ ...editedDevice, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");

            const updateDevice = {
                ...editedDevice,
                status: { id: editedDevice.status }  // Enviar el ID como objeto
            };

            console.log("Datos enviados al backend:", updateDevice);

            await axios.put(`http://localhost:8085/api/v1/admin/devices/${device.id}`, updateDevice, {
                headers: { Authorization: `Bearer ${token}` },
            });

            refreshDevices();
            setOpenSuccess(true);
            setTimeout(() => setOpenSuccess(false), 2000);
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el dispositivo", error);
        }
        setOpenConfirm(false);
    };

    const confirmDelete = () => {
        setOpenConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8085/api/v1/admin/devices/${device.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            refreshDevices();
            handleClose();
        } catch (error) {
            console.error("Error al eliminar el dispositivo", error);
        }
        setOpenConfirm(false);
    };

    const handleCloseModal = () => {
        console.log("Cerrando modal...");
        handleClose();
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
                    <Typography variant="h6">Editar Dispositivo</Typography>
                    <TextField fullWidth margin="normal" label="Código" name="code" value={editedDevice.code || ''} onChange={handleChange} disabled />
                    <TextField fullWidth margin="normal" label="Nombre" name="name" value={editedDevice.name || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Serial" name="serial" value={editedDevice.serial || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Especificaciones" name="specification" value={editedDevice.specification || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Tipo" name="type" value={editedDevice.type || ''} onChange={handleChange} />

                    {/* Selector de Estado */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-label">Estatus</InputLabel>
                        <Select
                            labelId="status-label"
                            name="status"
                            value={editedDevice.status || ""}
                            onChange={(e) => setEditedDevice({ ...editedDevice, status: e.target.value })}
                        >
                            <MenuItem value={1}>Entregado</MenuItem>
                            <MenuItem value={2}>Dañado</MenuItem>
                            <MenuItem value={3}>Mantenimiento</MenuItem>
                            <MenuItem value={4}>Disponible</MenuItem>
                            <MenuItem value={5}>No disponible</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="normal" label="Precio" name="price" value={editedDevice.price || ''} onChange={handleChange} />

                    <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mt: 2 }}>Guardar Cambios</Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ mt: 2, ml: 2 }}>Eliminar</Button>
                </Box>
            </Modal>

            {/* Modal de confirmación para eliminar */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogContent>
                    ¿Quieres eliminar el dispositivo? Esta acción no se puede deshacer.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">Cancelar</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>Eliminar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de éxito */}
            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
                <DialogTitle>¡Dispositivo actualizado!</DialogTitle>
                <DialogContent>
                    Los cambios se guardaron correctamente.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSuccess(false)} color="primary" autoFocus>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeviceModal;
