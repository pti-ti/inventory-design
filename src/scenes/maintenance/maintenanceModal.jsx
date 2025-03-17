import { 
    Box, Button, Modal, TextField, Typography,
    Snackbar, Alert, Select, MenuItem, InputLabel,
    FormControl 
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
        deviceName: "",
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

    const itemMap = {
        "Verificación de seriales y etiquetas": 1,
        "Verificación de funcionamiento de equipos": 2,
        "Limpieza física superficial (parte externa)": 3,
        "Limpieza interna de equipos": 4,
        "Verificación de cableado": 5,
        "Verificación de puntos de red, revisión de etiquetado en mapa red": 6,
        "Verificación de rendimiento de equipo y espacio": 7,
        "Verificación de malware y addware": 8,
        "Mantenimiento de software (actualización de software)": 9,
        "Cambio de partes y/o suministros": 10,
        "Verificación de niveles de tinta": 11,
        "Otras acciones": 12
    };

    useEffect(() => {
        if (open && maintenance) {
            setEditedMaintenance({
                id: maintenance.id ?? "",
                deviceId: maintenance.deviceId ?? "",
                deviceCode: maintenance.deviceCode ?? "",
                deviceName: maintenance.deviceName ?? "",
                userId: maintenance.userId ?? "",
                userEmail: maintenance.userEmail ?? "",
                maintenanceType: maintenance.maintenanceType ?? "",
                comment: maintenance.comment ?? "",
                maintenanceDate: maintenance.maintenanceDate ?? "",
                items: maintenance.items?.map(item => item.id) ?? []
            });
        } else {
            setEditedMaintenance(initialMaintenanceState);
        }
    }, [maintenance, open]);

    useEffect(() => {
        if (open) {
            const token = localStorage.getItem("token");
    
            axios.get("http://localhost:8085/api/v1/admin/items", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => setItemsList(response.data))
            .catch(error => console.error("Error al obtener ítems:", error));
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedMaintenance((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemsChange = (event) => {
        setEditedMaintenance((prev) => ({
            ...prev,
            items: event.target.value  // Guarda los IDs de los ítems seleccionados
        }));
    };

    const handleCreate = async () => {
        try {
            const newMaintenance = {
                device: { id: Number(editedMaintenance.deviceId) },
                user: { id: Number(editedMaintenance.userId) },
                maintenanceType: editedMaintenance.maintenanceType,
                items: editedMaintenance.items.map(id => ({ id: Number(id) })),
                maintenanceDate: editedMaintenance.maintenanceDate,
                comment: editedMaintenance.comment,
            };

            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8085/api/v1/admin/maintenances/register",
                newMaintenance,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            refreshMaintenances();
            setOpenSnackbar(true);
            handleClose();
        } catch (error) {
            console.error("Error al crear el mantenimiento:", error);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const updateMaintenance = {
                maintenanceType: editedMaintenance.maintenanceType,
                maintenanceDate: editedMaintenance.maintenanceDate,
                comment: editedMaintenance.comment,
            };

            await axios.put(
                `http://localhost:8085/api/v1/admin/maintenances/${editedMaintenance.id}`, 
                updateMaintenance, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            refreshMaintenances();
            setOpenSnackbar(true);
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el mantenimiento", error);
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
                    <Typography variant="h6">
                        {isEditing ? "Editar Mantenimiento" : "Registrar Mantenimiento"}
                    </Typography>

                    {!isEditing && (
                        <>
                            <TextField fullWidth margin="normal" label="ID del dispositivo" name="deviceId" value={editedMaintenance.deviceId} onChange={handleChange} required />
                            <TextField fullWidth margin="normal" label="ID del usuario" name="userId" value={editedMaintenance.userId} onChange={handleChange} required />
                        </>
                    )}

                    {isEditing && (
                        <>
                            <TextField fullWidth margin="normal" label="Código dispositivo" name="deviceCode" value={editedMaintenance.deviceCode} disabled />
                            <TextField fullWidth margin="normal" label="Nombre del dispositivo" name="deviceName" value={editedMaintenance.deviceName} disabled />
                            <TextField fullWidth margin="normal" label="Email del usuario" name="userEmail" value={editedMaintenance.userEmail} disabled />
                        </>
                    )}

                    {/* Lista desplegable para Tipo de Mantenimiento */}
                    <Select
                        fullWidth
                        // margin="normal"
                        name="maintenanceType"
                        value={editedMaintenance.maintenanceType}
                        onChange={handleChange}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>Selecciona un tipo de mantenimiento</MenuItem>
                        <MenuItem value="Preventivo">Preventivo</MenuItem>
                        <MenuItem value="Correctivo">Correctivo</MenuItem>
                        <MenuItem value="Garantía">Garantía</MenuItem>
                    </Select>

                    {/* Selector múltiple de ítems */}
                    <FormControl fullWidth margin="normal">
                    <InputLabel id="items-label">Selecciona Ítems</InputLabel>
                    <Select
                        labelId="items-label"
                        multiple
                        value={editedMaintenance.items}
                        onChange={handleItemsChange}
                        renderValue={() => null} // Evita mostrar los valores dentro del Select
                    >
                        {itemsList.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Textarea para mostrar los ítems seleccionados */}
                <TextareaAutosize
                    minRows={3} // Controla la altura del textarea
                    value={editedMaintenance.items
                        .map(id => itemsList.find(item => item.id === id)?.name)
                        .join(", ")}
                    readOnly
                    className="w-full border rounded p-2 mt-2"
                />


                    <TextField fullWidth margin="normal" label="Comentarios" name="comment" value={editedMaintenance.comment} onChange={handleChange} />
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
                        <Button variant="contained" color="info" onClick={isEditing ? handleUpdate : handleCreate}>
                            {isEditing ? "Guardar Cambios" : "Registrar"}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%" }}>
                    {isEditing ? "Mantenimiento actualizado correctamente" : "Mantenimiento creado correctamente"}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MaintenanceModal;
