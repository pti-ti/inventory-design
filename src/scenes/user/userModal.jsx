import { Box, Button, Modal, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

const UserModal = ({ open, handleClose, user, refreshUsers }) => {
    const [openSuccess, setOpenSuccess] = useState(false);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8085/api/v1/admin/locations", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLocations(response.data); // Suponiendo que response.data es un array de ubicaciones con id y nombre
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
            const token = localStorage.getItem("token");
            const url = user?.id
                ? `http://localhost:8085/api/v1/admin/users/${user.id}`
                : "http://localhost:8085/api/v1/admin/users/register";

            const method = user?.id ? "put" : "post";

            await axios[method](url, {
                email: values.email,
                location: { id: values.location }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            refreshUsers();
            setOpenSuccess(true);
            resetForm();
            handleClose();
        } catch (error) {
            console.error("Error al guardar el usuario", error);
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

                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
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

            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
                <DialogTitle>¡Usuario Creado!</DialogTitle>
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
