import { Box, Button, Modal, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const DeviceModal = ({ open, handleClose, device, refreshDevices }) => {
    const [editedDevice, setEditedDevice] = useState(device || {});
    const [openConfirm, setOpenConfirm] = useState(false); // Estado del modal de confirmación
    

    useEffect(() => {
        if (device) {
            setEditedDevice(device);
        }
    }, [device]);

    const handleChange = (e) => {
        setEditedDevice({ ...editedDevice, [e.target.name]: e.target.value });
    };
    
    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8085/api/v1/admin/devices/${device.id}`, editedDevice, {
                headers: { Authorization: `Bearer ${token}` },
            });
            refreshDevices();
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el dispositivo", error);
        }
    };

    const confirmDelete = () => {
        setOpenConfirm(true); // Abre el modal de confirmación
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
        setOpenConfirm(false); // Cierra el modal de confirmación
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
                    <Typography variant="h6">Editar Dispositivo</Typography>
                    <TextField fullWidth margin="normal" label="Código" name="code" value={editedDevice.code || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Nombre" name="name" value={editedDevice.name || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Serial" name="serial" value={editedDevice.serial || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Especificaciones" name="specification" value={editedDevice.specification || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Tipo" name="type" value={editedDevice.type || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Estado" name="status" value={editedDevice.status || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Precio" name="price" type="number" value={editedDevice.price || ''} onChange={handleChange} />
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
        </>
    );
};

export default DeviceModal;
