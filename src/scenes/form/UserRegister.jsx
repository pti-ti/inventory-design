import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormHelperText,
  FormControl,
  InputLabel,
  Snackbar,
  Card,
  CardContent,
  Avatar,
  Alert, Modal,
  IconButton,
  Chip, ListItemIcon, Stack
} from "@mui/material";
import React from "react";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import api from "../../api";
import { useState, useEffect } from "react";
import { List, ListItem, ListItemText, Divider, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import { useTheme } from "@mui/material/styles";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserRegister = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [usuarios, setUsuarios] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const theme = useTheme();
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);


  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get(`${API_BASE_URL}/api/v1/users/exclude-user-role`);
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsuarios();
  }, []);

  const handleFormSubmit = async (values, { resetForm }) => {
    const userData = {
      email: values.email, // Asumiendo que "email" es el campo a enviar
      password: values.password,
      userType: values.userType,
    };

    try {
      const response = await api.post(`${API_BASE_URL}/api/v1/users/create`, userData);
      setSnackbarMessage("Usuario registrado con éxito");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      resetForm(); // Esto reseteará todos los campos, incluido el email
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Hubo un error al registrar el usuario";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box m="20px">
      <Header title="REGISTRAR USUARIO" subtitle="Registro de los usuarios del inventario" />

      {/* Botón para abrir el modal */}
      <Box display="flex" justifyContent="center" mt="20px">
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Registrar Usuario
        </Button>
      </Box>

      {/* Modal con el formulario */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 500,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Registrar Usuario</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={checkoutSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap="20px"
                >
                  <Box width="100%">
                    <TextField
                      fullWidth
                      variant="filled"
                      type="text"
                      label="Email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                      name="email"
                      error={!!touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                    />
                  </Box>

                  <Box width="100%">
                    <TextField
                      fullWidth
                      variant="filled"
                      type="password"
                      label="Contraseña"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.password}
                      name="password"
                      error={!!touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
                    />
                  </Box>

                  <Box width="100%">
                    <FormControl
                      fullWidth
                      variant="filled"
                      error={!!touched.userType && !!errors.userType}
                    >
                      <InputLabel>Tipo de Usuario</InputLabel>
                      <Select
                        name="userType"
                        value={values.userType}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      >
                        <MenuItem value="ADMIN">Administrador</MenuItem>
                        <MenuItem value="TECHNICIAN">Técnico</MenuItem>
                      </Select>
                      {touched.userType && errors.userType && (
                        <FormHelperText>{errors.userType}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="center" mt="20px">
                  <Button variant="contained" color="primary" type="submit">
                    Guardar Usuario
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Box>
      </Modal>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Usuarios registrados
        </Typography>
        <Stack spacing={2}>
          {usuarios.map((usuario) => (
            <Card
              key={usuario.id}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: 2,
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: "background.default",
              }}
            >
              <Avatar
                sx={{
                  bgcolor:
                    usuario.userType === "ADMIN"
                      ? (theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main)
                      : (theme.palette.mode === "dark" ? theme.palette.secondary.light : theme.palette.secondary.main),
                  color: theme.palette.getContrastText(
                    usuario.userType === "ADMIN"
                      ? (theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main)
                      : (theme.palette.mode === "dark" ? theme.palette.secondary.light : theme.palette.secondary.main)
                  ),
                  mr: 2,
                }}
              >
                {usuario.userType === "ADMIN" ? (
                  <AdminPanelSettingsIcon />
                ) : (
                  <BuildCircleIcon />
                )}
              </Avatar>

              <CardContent sx={{ flex: 1, padding: "8px 0 !important" }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {usuario.email}
                </Typography>
                <Chip
                  label={usuario.userType === "ADMIN" ? "Administrador" : "Técnico"}
                  color={usuario.userType === "ADMIN" ? "primary" : "secondary"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );

};

// Validaciones con Yup
const checkoutSchema = yup.object().shape({
  email: yup
    .string()
    .email("Debe ser un correo válido")
    .required("Este campo es obligatorio"),
  password: yup
    .string()
    .min(3, "Debe tener al menos 3 caracteres")
    .required("Este campo es obligatorio"),
  userType: yup.string().required("Seleccione un tipo de usuario"),
});

// Valores iniciales
const initialValues = {
  email: "",
  password: "",
  userType: "",
};

export default UserRegister;
