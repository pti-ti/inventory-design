import { 
    Box, Button, Modal, TextField, Typography, Snackbar, Alert 
} from "@mui/material";
import { useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

const BrandModal = ({ open, handleClose, brand, refreshBrands }) => {
    const isEditing = Boolean(brand);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Valores iniciales del formulario
    const initialValues = {
        name: brand?.name || "",
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

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Crear una nueva marca
    const handleRegisterBrand = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE_URL}/api/v1/brands/create`, 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Marca creada correctamente.");
            refreshBrands();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al registrar la marca", error);
            showSnackbar("Error al registrar la marca.", "error");
        }
    };

    // Actualizar una marca existente
    const handleUpdateBrand = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/api/v1/brands/${brand.id}`, 
                { name: values.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar("Marca actualizada correctamente.");
            refreshBrands();
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al actualizar la marca", error);
            showSnackbar("Error al actualizar la marca.", "error");
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
                        {isEditing ? "Editar Marca" : "Agregar Marca"}
                    </Typography>

                    <Formik 
                        initialValues={initialValues} 
                        validationSchema={validationSchema} 
                        onSubmit={(values, { resetForm }) => {
                            isEditing 
                                ? handleUpdateBrand(values, resetForm)
                                : handleRegisterBrand(values, resetForm);
                        }}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre de la Marca"
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
                                    {isEditing ? "Guardar Cambios" : "Agregar Marca"}
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

export default BrandModal;
