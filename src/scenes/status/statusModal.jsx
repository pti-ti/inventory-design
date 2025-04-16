import { 
    Box, Button, Modal, TextField, Typography, Snackbar, Alert 
} from "@mui/material";
import { useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

const statusModal = ({ open, handleClose, status, refreshStatus }) => {
    const isEditing = Boolean(status);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Valores iniciales del formulario
    const initialValues = {
        name: status?.name || "",
    };

    // Esquema de validación con Yup
    const validationSchema = yup.object().shape({
        name: yup.string()
            .required("Este campo es obligatorio")
            .min(3, "El nombre debe tener al menos 3 caracteres")
            .matches(/^[a-zA-Z\s]+$/, "Solo se permiten letras y espacios"),
    });

    // Mostrar mensajes en Snackbar
    const showSnackbar = (message, severity = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Crear un nuevo estado
    const handleRegisterStatus = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE_URL}/api/v1/admin/status/create`, 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Estado creado correctamente.");
            refreshStatus();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al registrar el estado", error);
            showSnackbar("Error al registrar el estado.", "error");
        }
    };

    // Actualizar un estado existente
    const handleUpdateStatus = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/api/v1/admin/status/${status.id}`, 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Estado actualizado correctamente.");
            refreshStatus();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el estado", error);
            showSnackbar("Error al actualizar el estado.", "error");
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
                        {isEditing ? "Editar Estado" : "Agregar Estado"}
                    </Typography>

                    <Formik 
                        initialValues={initialValues} 
                        validationSchema={validationSchema} 
                        onSubmit={(values, { resetForm }) => {
                            isEditing 
                                ? handleUpdateStatus(values, resetForm)
                                : handleRegisterStatus(values, resetForm);
                        }}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre del Estado"
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
                                    {isEditing ? "Guardar Cambios" : "Agregar Estado"}
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

export default statusModal;
