import { Box, Button, TextField, InputAdornment } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { MenuItem, Select, FormHelperText, FormControl, InputLabel } from "@mui/material";
import api from "../../api"; // Importamos la instancia de Axios
import { NumericFormat } from "react-number-format";

const DeviceRegister = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm}) => {
    const deviceData = {
      code: values.code,
      name: values.name,
      serial: values.serial,
      specification: values.specification,
      type: values.type,
      status: values.status,
      price: values.price,
    };

    console.log("Enviando datos:", deviceData);

    try {
      const response = await api.post("/admin/devices/register", deviceData);
      console.log("Dispositivo registrado:", response.data);
      alert("Dispositivo registrado con éxito");
      resetForm();
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert("Hubo un error al registrar el dispositivo");
    }
  };

  return (
    <Box m="20px">
      <Header title="REGISTRAR DISPOSITIVO" subtitle="Registro de los dispositivos a cargo del área de TI" />

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
          setFieldValue,
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
                label="Código"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.code}
                name="code"
                error={!!touched.code && !!errors.code}
                helperText={touched.code && errors.code}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nombre"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Serial"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.serial}
                name="serial"
                error={!!touched.serial && !!errors.serial}
                helperText={touched.serial && errors.serial}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Especificaciones"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.specification}
                name="specification"
                error={!!touched.specification && !!errors.specification}
                helperText={touched.specification && errors.specification}
                sx={{ gridColumn: "span 2" }}
              />

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

              <NumericFormat
                fullWidth
                variant="filled"
                customInput={TextField}
                type="text"
                label="Precio"
                onBlur={handleBlur}
                onValueChange={(values) => {
                  setFieldValue('price', values.floatValue);
                }}
                value={values.price}
                name="price"
                error={!!touched.price && !!errors.price}
                helperText={touched.price && errors.price}
                sx={{ gridColumn: "span 2" }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
              />

              {/* Campo de selección de estado */}
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
                  <MenuItem value="5">No disponible</MenuItem>
                </Select>
                {touched.status && errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Registrar dispositivo
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
    code: yup.string().required("El código es obligatorio"),
    name: yup.string().required("El nombre es obligatorio"),
    serial: yup.string().required("El serial es obligatorio"),
    specification: yup.string().required("Las especificaciones son obligatorias"),
    type: yup.string().required("El tipo es obligatorio"),
    status: yup.string().required("Seleccione un estado"),
    price: yup.number().required("El precio es obligatorio").positive("El precio debe ser un número positivo"),
  });

const initialValues = {
  code: "",
  name: "",
  serial: "",
  specification: "",
  type: "",
  status: "",
  price: "",
};

export default DeviceRegister;
