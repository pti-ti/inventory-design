import { Box, Button, Modal, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { MenuItem, Select, InputLabel, FormControl, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

const UserModal = ({ open, handleClose, user, refreshUsers }) => {
    const [openSuccess, setOpenSuccess] = useState(false);

    const locationMap = { "Cali": 1, "Barranquilla": 2, "Bogotá": 3, "Popayán": 4 };

    const initialValues = {
        email: user?.email || "",
        location: user?.location ? locationMap[user.location] : ""
    };

    const validationSchema = yup.object().shape({
        email: yup.string()
            .email("Correo inválido")
            .matches(/^[a-zA-Z0-9._%+-]+@pti-sa\.com\.co$/, "El correo debe pertenecer a pti-sa.com.co")
            .required("Este campo es obligatorio"),
        location: yup.string().required("Seleccione una ciudad")
    });

    const handleRegisterUser = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8085/api/v1/admin/users/register", {
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
            console.error("Error al registrar el usuario", error);
        }
    };

    const handleUpdateUser = async (values, resetForm) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8085/api/v1/admin/users/${user.id}`, {
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
            console.error("Error al actualizar el usuario", error);
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

                    <Formik initialValues={initialValues} validationSchema={validationSchema} 
                        onSubmit={(values, { resetForm }) => {
                            if (user?.id) {
                                handleUpdateUser(values, resetForm);
                            } else {
                                handleRegisterUser(values, resetForm);
                            }
                        }}>
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
                                        <MenuItem value={1}>Cali</MenuItem>
                                        <MenuItem value={2}>Barranquilla</MenuItem>
                                        <MenuItem value={3}>Bogotá</MenuItem>
                                        <MenuItem value={4}>Popayán</MenuItem>
                                    </Select>
                                </FormControl>

                                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                                    {user ? "Guardar Cambios" : "Agregar Usuario"}
                                </Button>
                            </form>
                        )}
                    </Formik>
                </Box>
            </Modal>

            <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
                <DialogTitle>¡Usuario guardado!</DialogTitle>
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
