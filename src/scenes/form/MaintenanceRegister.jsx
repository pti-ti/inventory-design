import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import api from "../../api"; // Importamos la instancia de Axios
import { MenuItem, Select, FormHelperText, FormControl, InputLabel } from "@mui/material";


const MaintenanceRegister = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm}) => {

    const formattedDate = `${values.date}T00:00:00`;

    const maintenanceData = {
      device: { id: parseInt(values.device) },
      user: values.user ? { id: parseInt(values.user) } : null,
      maintenanceType: values.type,
      maintenanceDate: formattedDate,
      comment: values.note,
    };
    

    console.log("Enviando datos:", maintenanceData);

    try {
      const response = await api.post("/admin/maintenances/register", maintenanceData);
      console.log("Mantenimiento registrado:", response.data);
      alert("Mantenimiento registrado con éxito");
      resetForm();
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert("Hubo un error al registrar el mantenimiento");
    }
  };

  return (
    <Box m="20px">
      <Header title="REGISTRAR MANTENIMIENTO" subtitle="Registro de los mantenimientos de los dispositivos" />

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
                label="ID Dispositivo"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.device}
                name="device"
                error={!!touched.device && !!errors.device}
                helperText={touched.device && errors.device}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="ID Usuario"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.user}
                name="user"
                error={!!touched.user && !!errors.user}
                helperText={touched.user && errors.user}
                sx={{ gridColumn: "span 2" }}
              />
             
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Tipo de mantenimiento"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.type}
                name="type"
                error={!!touched.type && !!errors.type}
                helperText={touched.type && errors.type}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="fecha del mantenimiento"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.date}
                name="date"
                error={!!touched.date && !!errors.date}
                helperText={touched.date && errors.date}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Comentario"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.note}
                name="note"
                error={!!touched.note && !!errors.note}
                helperText={touched.note && errors.note}
                sx={{ gridColumn: "span 2" }}
              />
            
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Registrar mantenimiento
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
    device: yup.string().required("El código del dispositivo es obligatorio"),
    user: yup.string().nullable(),
    type: yup.string().required("El tipo de mantenimiento es obligatorio"),
    date: yup.string().required("La fecha del mantenimiento es obligatoria"),
    note: yup.string().required("Escribe algún tipo de comentario."),
  });

const initialValues = {
  device: "",
  user: "",
  type: "",
  date: "",
  note: "",
};

export default MaintenanceRegister;
