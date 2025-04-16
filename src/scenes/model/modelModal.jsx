import { 
    Box, Button, Modal, TextField, Typography, Snackbar, Alert 
} from "@mui/material";
import { useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

const modelModal = ({ open, handleClose, model, refreshModels }) => {
    const isEditing = Boolean(model);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Valores iniciales del formulario
    const initialValues = {
        name: model?.name || "",
    };

    // Esquema de validación con Yup
    const validationSchema = yup.object().shape({
        name: yup.string()
            .required("Este campo es obligatorio")
            .min(2, "El nombre debe tener al menos 2 caracteres")
            .matches(/^[a-zA-Z0-9\s]+$/, "Solo se permiten letras, números y espacios")
    });

    // Mostrar mensajes en Snackbar
    const showSnackbar = (message, severity = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Crear un nuevo modelo
    const handleRegisterModel = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE_URL}/api/v1/admin/models/create`, 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Modelo creado correctamente.");
            refreshModels();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al registrar el modelo", error);
            showSnackbar("Error al registrar el modelo.", "error");
        }
    };

    // Actualizar un modelo existente
    const handleUpdateModel = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/api/v1/admin/models/${model.id}`, 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Modelo actualizado correctamente.");
            refreshModels();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el modelo", error);
            showSnackbar("Error al actualizar el modelo.", "error");
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
                        {isEditing ? "Editar Modelo" : "Agregar Modelo"}
                    </Typography>

                    <Formik 
                        initialValues={initialValues} 
                        validationSchema={validationSchema} 
                        onSubmit={(values, { resetForm }) => {
                            isEditing 
                                ? handleUpdateModel(values, resetForm)
                                : handleRegisterModel(values, resetForm);
                        }}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre del Modelo"
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
                                    {isEditing ? "Guardar Cambios" : "Agregar Modelo"}
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

export default modelModal;
