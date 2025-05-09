import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import api from "../../api"; // Importamos la instancia de Axios
import { MenuItem, Select, FormHelperText, FormControl, InputLabel } from "@mui/material";


const LogbookRegister = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm}) => {
    const logbookData = {
      device: { id: parseInt(values.device) },
      user: values.user ? { id: parseInt(values.user) } : null,
      location: { id: parseInt(values.location) },
      status: { id: parseInt(values.status) },
      type: values.type,
      note: values.note,
    };
    

    console.log("Enviando datos:", logbookData);

    try {
      const response = await api.post("/admin/logbooks/register", logbookData);
      console.log("Bitácora registrada:", response.data);
      alert("Bitácora registrada con éxito");
      resetForm();
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert("Hubo un error al registrar la bitácora");
    }
  };

  return (
    <Box m="20px">
      <Header title="REGISTRAR BITACORA" subtitle="Registro de las bitácoras de los dispositivos" />

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

              <FormControl fullWidth variant="filled" error={!!touched.status && !!errors.status} sx={{ gridColumn: "span 2" }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="status"
                  value={values.status || ""}
                  onBlur={handleBlur}
                  onChange={handleChange}
                >
                  <MenuItem value="1">Entregado</MenuItem>
                  <MenuItem value="2">Dañado</MenuItem>
                  <MenuItem value="3">Mantenimiento</MenuItem>
                  <MenuItem value="4">Disponible</MenuItem>
                  <MenuItem value="4">No disponible</MenuItem>
                </Select>
                {touched.status && errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
              
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Tipo"
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
                type="text"
                label="Nota"
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
                Registrar bitacora
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
    location: yup.string().required("La localización es obligatorio"),
    status: yup.string().required("El estado es obligatorio"),
    type: yup.string().required("El tipo es obligatorio"),
    note: yup.string().required("Escriba algún tipo de nota."),
  });

const initialValues = {
  device: "",
  user: "",
  location: "",
  status: "",
  type: "",
  note: "",
};

export default LogbookRegister;
