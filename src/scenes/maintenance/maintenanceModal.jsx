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
        deviceBrand: "",
        deviceModel: "",
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
    const [errorMessage, setErrorMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"


    useEffect(() => {
        if (open && maintenance) {
            let formattedDate = "";
            if (maintenance.maintenanceDate) {
                if (maintenance.maintenanceDate.includes("/")) {
                    const [day, month, year] = maintenance.maintenanceDate.split("/");
                    formattedDate = `${year}-${month}-${day}`; // Convertir correctamente
                } else {
                    formattedDate = maintenance.maintenanceDate; // Mantener formato si ya está correcto
                }
            }

            const updatedMaintenance = {
                id: maintenance.id ?? "",
                deviceId: maintenance.deviceId ?? "",
                deviceCode: maintenance.deviceCode ?? "",
                deviceBrand: maintenance.deviceBrand ?? "",
                deviceModel: maintenance.deviceModel ?? "",
                userEmail: maintenance.userEmail ?? "",
                maintenanceType: maintenance.maintenanceType ?? "",
                comment: maintenance.comment ?? "",
                maintenanceDate: formattedDate, // Asignar la fecha formateada
                items: maintenance.items?.map(item => item.id) ?? []
            };

            setEditedMaintenance(updatedMaintenance);

            console.log("Estado actualizado de editedMaintenance:", updatedMaintenance);
        } else {
            setEditedMaintenance(initialMaintenanceState);
        }
    }, [maintenance, open]);


    useEffect(() => {
        if (open && itemsList.length === 0) {
            const token = localStorage.getItem("token");

            axios.get("http://localhost:8085/api/v1/admin/items", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => setItemsList(response.data))
                .catch(error => {
                    console.error("Error al obtener ítems:", error);
                    setErrorMessage("No se pudieron cargar los ítems.");
                });
        }
    }, [open]);

    useEffect(() => {
        if (!isEditing && editedMaintenance.deviceId) {
            fetchDeviceData(editedMaintenance.deviceId);
        }
    }, [editedMaintenance.deviceId]);

    useEffect(() => {
        if (!isEditing && editedMaintenance.userId) {
            fetchUserData(editedMaintenance.userId);
        }
    }, [editedMaintenance.userId]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedMaintenance(prev => ({ ...prev, [name]: value }));
    };

    const handleItemsChange = (event) => {
        setEditedMaintenance(prev => ({
            ...prev,
            items: event.target.value
        }));
    };

    const handleCreateOrUpdate = async () => {
        try {
            const token = localStorage.getItem("token");

            const maintenanceData = {
                id: isEditing ? editedMaintenance.id : undefined,
                device: { id: Number(editedMaintenance.deviceId) },
                user: { id: Number(editedMaintenance.userId) },
                maintenanceType: editedMaintenance.maintenanceType,
                maintenanceDate: editedMaintenance.maintenanceDate,
                comment: editedMaintenance.comment,
                items: editedMaintenance.items.map(id => ({ id: Number(id) })),
                updatedBy: 3,
            };

            if (isEditing) {
                await axios.put(
                    `http://localhost:8085/api/v1/admin/maintenances/${editedMaintenance.id}`,
                    maintenanceData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSnackbarMessage("Mantenimiento actualizado exitosamente.");
            } else {
                await axios.post(
                    "http://localhost:8085/api/v1/admin/maintenances/register",
                    maintenanceData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSnackbarMessage("Mantenimiento registrado exitosamente.");

                // Descargar Excel solo en modo registro
                try {
                    const response = await axios.get("http://localhost:8085/api/v1/admin/excel/update", {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: "blob",
                    });

                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "Mantenimiento.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                } catch (excelError) {
                    console.error("Error al descargar el Excel:", excelError);
                    setSnackbarMessage("Mantenimiento guardado, pero ocurrió un error al descargar el Excel.");
                    setSnackbarSeverity("warning");
                    setSnackbarOpen(true);
                }
            }

            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            refreshMaintenances();
            handleClose();
        } catch (error) {
            console.error("Error al guardar mantenimiento:", error);
            setSnackbarMessage("Error al guardar el mantenimiento. Inténtalo de nuevo.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    // Reemplaza con tus endpoints reales si son distintos
    const fetchDeviceData = async (deviceId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8085/api/v1/admin/devices/${deviceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const device = response.data;
            console.log("Device data:", device);
            setEditedMaintenance(prev => ({
                ...prev,
                deviceCode: device.code || "",
                deviceBrand: device.brandName || "",
                deviceModel: device.modelName || "",
            }));
        } catch (error) {
            console.error("Error al obtener datos del dispositivo:", error);
            setEditedMaintenance(prev => ({
                ...prev,
                deviceCode: "",
                deviceBrand: "",
                deviceModel: "",
            }));
        }
    };

    const fetchUserData = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8085/api/v1/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = response.data;
            setEditedMaintenance(prev => ({
                ...prev,
                userEmail: user.email || "",
            }));
        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
            setEditedMaintenance(prev => ({
                ...prev,
                userEmail: "",
            }));
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
                            <TextField fullWidth margin="normal" label="ID del dispositivo" name="deviceId" value={editedMaintenance.deviceId} onChange={handleChange} />
                            <TextField fullWidth margin="normal" label="ID del usuario" name="userId" value={editedMaintenance.userId} onChange={handleChange} />
                        </>
                    )}

                    {/* {isEditing && (
                        <>
                            <TextField fullWidth margin="normal" label="Código dispositivo" name="deviceCode" value={editedMaintenance.deviceCode} disabled />
                            <TextField fullWidth margin="normal" label="Marca del dispositivo" name="deviceBrand" value={editedMaintenance.deviceBrand} disabled />
                            <TextField fullWidth margin="normal" label="Modelo del dispositivo" name="deviceModel" value={editedMaintenance.deviceModel} disabled />
                            <TextField fullWidth margin="normal" label="Email del usuario" name="userEmail" value={editedMaintenance.userEmail} disabled />
                        </>
                    )} */}

                    <TextField fullWidth margin="normal" label="Código dispositivo" name="deviceCode" value={editedMaintenance.deviceCode} disabled />
                    <TextField fullWidth margin="normal" label="Marca del dispositivo" name="deviceBrand" value={editedMaintenance.deviceBrand} disabled />
                    <TextField fullWidth margin="normal" label="Modelo del dispositivo" name="deviceModel" value={editedMaintenance.deviceModel} disabled />
                    <TextField fullWidth margin="normal" label="Email del usuario" name="userEmail" value={editedMaintenance.userEmail} disabled />


                    <FormControl fullWidth margin="normal">
                        <InputLabel>Tipo de Mantenimiento</InputLabel>
                        <Select name="maintenanceType" value={editedMaintenance.maintenanceType} onChange={handleChange}>
                            <MenuItem value="" disabled>Selecciona un tipo</MenuItem>
                            <MenuItem value="Preventivo">Preventivo</MenuItem>
                            <MenuItem value="Correctivo">Correctivo</MenuItem>
                            <MenuItem value="Garantía">Garantía</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="items-label">Selecciona Ítems</InputLabel>
                        <Select
                            labelId="items-label"
                            multiple
                            value={editedMaintenance.items}
                            onChange={handleItemsChange}
                            renderValue={(selected) => selected.map(id => itemsList.find(item => item.id === id)?.name).join(", ")}
                        >
                            {itemsList.map(item => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

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
                        <Button fullWidth variant="contained" color="primary" onClick={handleCreateOrUpdate}>
                            {isEditing ? "Guardar Cambios" : "Registrar"}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000} // Se cierra en 4 segundos
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </>
    );
};

export default MaintenanceModal;
