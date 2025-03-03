import { Box, Button, Modal, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import axios from "axios";

const UserModal = ({ open, handleClose, user, refreshUsers }) => {
    const [editedUser, setEditedUser] = useState(user || {});
    const [openConfirm, setOpenConfirm] = useState(false); // Estado del modal de confirmación
    const [openSuccess, setOpenSuccess] = useState(false); // Estado del modal de éxito
    
    const locationMap = {
        "Cali": 1,
        "Barranquilla": 2,
        "Bogotá": 3,
        "Popayán": 4
    };
    
    useEffect(() => {
        if (open && user) {
            console.log("Datos recibidos del backend:", user);
    
            setEditedUser({
                id: user.id || "",
                email: user.email || "",
                location: locationMap[user.location] || "" // Convertir el nombre en ID
            });
    
            console.log("Ubicación cargada:", user.location, "->", locationMap[user.location]);
        }
    }, [user, open]);
    
    const handleChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };
    
    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
    
            const updateUser = {
                ...editedUser,
                location: { id: editedUser.location } // Convertir ID a objeto
            };
    
            console.log("Datos enviados al backend:", updateUser);
    
            await axios.put(`http://localhost:8085/api/v1/admin/users/${user.id}`, updateUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            refreshUsers();
            setOpenSuccess(true); // mostrar mensaje éxito
            setTimeout(() => setOpenSuccess(false), 2000); // cerrar el modal automáticamente después de 2 segundos
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el usuario", error);
        }
        setOpenConfirm(false); // Cierra el modal de confirmación
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

    const handleCloseModal = () => {
        console.log ("Cerrando modal...");
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
                    <Typography variant="h6">Editar Usuario</Typography>
                    <TextField fullWidth margin="normal" label="ID" name="id" value={editedUser.id || ''} onChange={handleChange} disabled/>
                    <TextField fullWidth margin="normal" label="Email" name="email" value={editedUser.email || ''} onChange={handleChange} />
                    <FormControl fullWidth margin="normal">
                    <InputLabel id="location-label">Ubicación</InputLabel>
                        {<Select
                            labelId="location-label"
                            name="location"
                            value={editedUser.location || ""}
                            onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                        >
                            <MenuItem value={1}>Cali</MenuItem>
                            <MenuItem value={2}>Barranquilla</MenuItem>
                            <MenuItem value={3}>Bogotá</MenuItem>
                            <MenuItem value={4}>Popayán</MenuItem>
                        </Select>}
                    </FormControl>
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

            {/* Modal de éxito */}
            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
                <DialogTitle>¡Usuario actualizado!</DialogTitle>
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

export default UserModal;
