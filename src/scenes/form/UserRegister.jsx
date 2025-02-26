import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { MenuItem, Select, FormHelperText, FormControl, InputLabel } from "@mui/material";
import api from "../../api"; // Importamos la instancia de Axios

const UserRegister = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm}) => {
    const userData = {
      email: values.email,
      location: {
        id: parseInt(values.location),
      },
    };

    console.log("Enviando datos:", userData);

    try {
      const response = await api.post("/admin/users/register", userData);
      console.log("Usuario registrado:", response.data);
      alert("Usuario registrado con éxito");
      resetForm();
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert("Hubo un error al registrar el usuario");
    }
  };

  return (
    <Box m="20px">
      <Header title="REGISTRAR USUARIO" subtitle="Registro de los usuarios" />

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
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email...@pti-sa.com.co"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Campo de selección de ciudad */}
              <FormControl fullWidth variant="filled" error={!!touched.location && !!errors.location} sx={{ gridColumn: "span 2" }}>
                <InputLabel>Ciudad</InputLabel>
                <Select
                  name="location"
                  value={values.location || ""}
                  onBlur={handleBlur}
                  onChange={handleChange}
                >
                  <MenuItem value="1">Cali</MenuItem>
                  <MenuItem value="2">Barranquilla</MenuItem>
                  <MenuItem value="3">Bogotá</MenuItem>
                  <MenuItem value="4">Popayán</MenuItem>
                </Select>
                {touched.location && errors.location && <FormHelperText>{errors.location}</FormHelperText>}
              </FormControl>
              
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Registrar Usuario
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// Validaciones con Yup
const checkoutSchema = yup.object().shape({
  email: yup
    .string()
    .email("Correo inválido")
    .matches(/^[a-zA-Z0-9._%+-]+@pti-sa\.com\.co$/, "El correo debe pertenecer a pti-sa.com.co")
    .required("Este campo es obligatorio"),
  ciudad: yup.string().required("Seleccione una ciudad"),
});

const initialValues = {
  email: "",
  ciudad: "",
};

export default UserRegister;
