import { Box, Button, Modal, Typography, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

const UserModal = ({ open, handleClose, user, refreshUsers }) => {
    const [openSuccess, setOpenSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [locations, setLocations] = useState([]);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/api/v1/admin/locations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLocations(response.data);
            } catch (error) {
                console.error("Error al obtener las ubicaciones", error);
            }
        };

        if (open) {
            fetchLocations();
        }
    }, [open]);

    const initialValues = {
        email: user?.email || "",
        location: user?.location?.id || ""
    };

    const validationSchema = yup.object().shape({
        email: yup.string()
            .email("Correo inválido")
            .matches(/^[a-zA-Z0-9._%+-]+@pti-sa\.com\.co$/, "El correo debe pertenecer a pti-sa.com.co")
            .required("Este campo es obligatorio"),
        location: yup.string().required("Seleccione una ciudad")
    });

    const handleSubmit = async (values, { resetForm }) => {
        try {
            console.log("Valores enviados al backend:", values); // ✅ DEBUG

            const token = localStorage.getItem("token");
            const isEditing = Boolean(user?.id);
            const url = isEditing
                ? `${API_BASE_URL}/api/v1/admin/users/${user.id}`
                : `${API_BASE_URL}/api/v1/admin/users/register`;

            const method = isEditing ? "put" : "post";

            await axios[method](url, {
                email: values.email,
                location: { id: values.location }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            refreshUsers();
            setSuccessMessage(isEditing ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente");
            setOpenSuccess(true);
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al guardar el usuario", error);
            alert("Error al guardar el usuario: " + (error.response?.data?.message || error.message));
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
                    <Typography variant="h6">{user ? "Editar Usuario" : "Agregar Usuario"}</Typography>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Email"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                />

                                <FormControl fullWidth margin="normal" error={touched.location && Boolean(errors.location)}>
                                    <InputLabel>Ubicación</InputLabel>
                                    <Select
                                        name="location"
                                        value={values.location}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    >
                                        <MenuItem value="" disabled>Selecciona una ubicación</MenuItem>
                                        {locations.map(loc => (
                                            <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary" 
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    {user ? "Guardar Cambios" : "Agregar Usuario"}
                                </Button>
                            </form>
                        )}
                    </Formik>
                </Box>
            </Modal>

            {/* Snackbar para mostrar mensajes de éxito */}
            <Snackbar
                open={openSuccess}
                autoHideDuration={4000}
                onClose={() => setOpenSuccess(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity="success" onClose={() => setOpenSuccess(false)}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default UserModal;
