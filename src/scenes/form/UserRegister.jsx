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
  Alert,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import api from "../../api";
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserRegister = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

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
              <Box width="100%" maxWidth="400px">
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

              <Box width="100%" maxWidth="400px">
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

              <Box width="100%" maxWidth="400px">
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
              <Button type="submit" color="secondary" variant="contained">
                Crear Usuario
              </Button>
            </Box>
          </form>
        )}
      </Formik>

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
