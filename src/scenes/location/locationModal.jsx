import { 
    Box, Button, Modal, TextField, Typography, Snackbar, Alert 
} from "@mui/material";
import { useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

const LocationModal = ({ open, handleClose, location, refreshLocations }) => {
    const isEditing = Boolean(location); // Verifica si está editando o creando
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Valores iniciales
    const initialValues = {
        name: location?.name || "",
    };

    // Esquema de validación con Yup
    const validationSchema = yup.object().shape({
        name: yup.string()
            .required("Este campo es obligatorio")
            .min(2, "El nombre debe tener al menos 2 caracteres")
            .matches(/^[a-zA-Z\s]+$/, "Solo se permiten letras y espacios"),
    });

    // Mostrar mensajes en Snackbar
    const showSnackbar = (message, severity = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Crear una nueva ubicación
    const handleRegisterLocation = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://192.168.128.148:8085/api/v1/admin/locations/create", 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Ubicación creada correctamente.");
            refreshLocations();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al registrar la ubicación", error);
            showSnackbar("Error al registrar la ubicación.", "error");
        }
    };

    // Actualizar una ubicación existente
    const handleUpdateLocation = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://192.168.128.148:8085/api/v1/admin/locations/${location.id}`, 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Ubicación actualizada correctamente.");
            refreshLocations();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al actualizar la ubicación", error);
            showSnackbar("Error al actualizar la ubicación.", "error");
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
                        {isEditing ? "Editar Ubicación" : "Agregar Ubicación"}
                    </Typography>

                    <Formik 
                        initialValues={initialValues} 
                        validationSchema={validationSchema} 
                        onSubmit={(values, { resetForm }) => {
                            isEditing 
                                ? handleUpdateLocation(values, resetForm)
                                : handleRegisterLocation(values, resetForm);
                        }}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre de la Ubicación"
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                />

                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary" 
                                    sx={{ mt: 2, width: "100%" }}
                                >
                                    {isEditing ? "Guardar Cambios" : "Agregar Ubicación"}
                                </Button>
                            </form>
                        )}
                    </Formik>
                </Box>
            </Modal>

            {/* Notificación Snackbar */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={3000} 
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default LocationModal;
