import { Box, Button, Modal, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const DeviceModal = ({ open, handleClose, device, refreshDevices }) => {
    const [editedDevice, setEditedDevice] = useState({});
    const [openConfirm, setOpenConfirm] = useState(false);

    useEffect(() => {
        if (open) {
            setEditedDevice(device || {});
        }
    }, [open, device]);

    const handleChange = (e) => {
        setEditedDevice({ ...editedDevice, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        if (!editedDevice.name || !editedDevice.code) {
            alert("El código y el nombre son obligatorios.");
            return;
        }

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
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                        <Button variant="contained" color="primary" onClick={handleUpdate}>Guardar Cambios</Button>
                        <Button variant="contained" color="error" onClick={() => setOpenConfirm(true)}>Eliminar</Button>
                    </Box>
                </Box>
            </Modal>

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
