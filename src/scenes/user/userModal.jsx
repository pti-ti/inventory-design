import { Box, Button, Modal, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const UserModal = ({ open, handleClose, user, refreshUsers }) => {
    const [editedUser, setEditedUser] = useState(user || {});
    const [openConfirm, setOpenConfirm] = useState(false); // Estado del modal de confirmación
    

    useEffect(() => {
        if (user) {
            setEditedUser({
                id: user.id || "",
                email: user.email || "",
                location: user.location || ""
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };
    
    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8085/api/v1/admin/users/${user.id}`, editedUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            refreshUsers();
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
            await axios.delete(`http://localhost:8085/api/v1/admin/users/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            refreshUsers();
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
                    <Typography variant="h6">Editar Usuario</Typography>
                    <TextField fullWidth margin="normal" label="ID" name="id" value={editedUser.id || ''} onChange={handleChange} />
                    <TextField fullWidth margin="normal" label="Email" name="email" value={editedUser.email || ''} onChange={handleChange} />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ubicación"
                        name="location"
                        value={editedUser.location || ''}
                        onChange={handleChange}
                    />
                    <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mt: 2 }}>Guardar Cambios</Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ mt: 2, ml: 2 }}>Eliminar</Button>
                </Box>
            </Modal>

            {/* Modal de confirmación para eliminar */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogContent>
                    ¿Quieres eliminar el usuario? Esta acción no se puede deshacer.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">Cancelar</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>Eliminar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserModal;
