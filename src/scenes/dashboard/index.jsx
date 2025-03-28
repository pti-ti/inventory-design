import { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import BlockIcon from "@mui/icons-material/Block";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import MonitorIcon from "@mui/icons-material/Monitor";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import MouseIcon from "@mui/icons-material/Mouse";
import HeadsetIcon from "@mui/icons-material/Headset";
import PrintIcon from "@mui/icons-material/Print";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import BarChartTypeLocation from "../../components/BarChartTypeLocation";
import StatBox from "../../components/StatBox";
import DonutChart from "../../components/DonutChart";
import BarChartComponent from "../../components/BarChartTypeLocation";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Estados
  const [totalInventoryValue, setTotalInventoryValue] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [deviceTypeCounts, setDeviceTypeCounts] = useState({});
  const [deviceLocationCounts, setTotalLocationValue] = useState({});
  const [deviceLocationTypeCounts, setDeviceLocationTypeCounts] = useState({});

  // Función para formatear moneda COP
  const formatCurrencyCOP = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Mapeo de dispositivos con su respectivo icono
  const deviceIcons = {
    Laptop: <LaptopMacIcon fontSize="large" />,
    Monitor: <MonitorIcon fontSize="large" />,
    Mouse: <MouseIcon fontSize="large" />,
    Impresora: <PrintIcon fontSize="large" />,
    Auriculares: <HeadsetIcon fontSize="large" />,
    Teclado: <KeyboardIcon fontSize="large" />,
    Ipad: <TabletMacIcon fontSize="large" />,
  };

  // Función para obtener datos
  const fetchData = async () => {
    try {
      // Obtener el valor total del inventario
      const inventoryRes = await fetch("http://localhost:8085/api/v1/admin/devices/total-inventory-value");
      const inventoryData = await inventoryRes.json();
      setTotalInventoryValue(inventoryData);

      // Obtener dispositivos organizados por estado
      const statusRes = await fetch("http://localhost:8085/api/v1/admin/status/device-status-count");
      const statusData = await statusRes.json();
      setDeviceStatus(statusData);

      // Obtener dispositivos organizados por tipo
      const typeRes = await fetch("http://localhost:8085/api/v1/admin/devices/count-by-type");
      const typeData = await typeRes.json();
      setDeviceTypeCounts(typeData);

      //Obtener dispositivos organizados por ubicación 
      const locationRes = await fetch("http://localhost:8085/api/v1/admin/locations/device-location-count");
      const locationData = await locationRes.json();
      setTotalLocationValue(locationData);

      //Obtener dispositivos organizado por tipo y ubicación
      const locationTypeRes = await fetch("http://localhost:8085/api/v1/admin/locations/device-location-type-count");
      const locationTypeData = await locationTypeRes.json();
      setDeviceLocationTypeCounts(locationTypeData);

    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };


  const chartData = Object.entries(deviceLocationTypeCounts).map(([location, devices]) => ({
    location,
    ...devices,
  }));

  const transformLocationData = (data) => {
    if (!data || Object.keys(data).length === 0) return [];

    // Obtener todos los tipos de dispositivos únicos
    const deviceTypes = new Set();
    Object.values(data).forEach((devices) => {
      Object.keys(devices).forEach((type) => deviceTypes.add(type));
    });

    // Transformar los datos en el formato adecuado
    return Object.entries(data).map(([location, devices]) => {
      const transformedEntry = { location };

      // Asegurar que todos los tipos de dispositivos estén presentes
      deviceTypes.forEach((type) => {
        transformedEntry[type] = devices[type] || 0; // Si no hay datos, poner 0
      });

      return transformedEntry;
    });
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Ubicaciones obtenidas:", deviceLocationCounts);
  }, [deviceLocationCounts]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box m="20px">
        {/* HEADER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 2, sm: 0 }}
          sx={{
            maxWidth: "85%",
            maxHeight: "1080px",
            transform: {
              xs: "scale(1)",
              sm: "scale(1)",
              md: "scale(0.95)",
              lg: "scale(0.9)",
            },
            transformOrigin: "top",
            overflow: "hidden",
          }}
        >
          {/* El Header ocupa todo el espacio disponible */}
          <Box flexGrow={1}>
            <Header title="DASHBOARD" subtitle="Bienvenido al Inventario de TI" />
          </Box>

          {/* Contenedor del botón alineado a la derecha */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: { xs: "12px", sm: "14px" },
                fontWeight: "bold",
                padding: { xs: "8px 16px", sm: "10px 20px" },
                display: "flex",
                alignItems: "center",
              }}
            >
              <DownloadOutlinedIcon sx={{ mr: { xs: "15px", sm: "10px" } }} />
              Descargar Reportes
            </Button>
          </Box>
        </Box>
      </Box>
      {/* BOX - Dispositivos por tipo con icono */}
      <Box
        gridColumn="span 12"
        backgroundColor={colors.primary[1000]}
        p="10px"
        borderRadius="8px"
        margin="auto"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        sx={{
          width: isSidebarOpen ? "calc(100% - 260px)" : "calc(100% - 70px)",
          transition: "width 0.3s ease-in-out",
          height: "150px",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
          marginBottom: "10px",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="600"
          color={colors.grey[100]}
          textAlign="center"
          marginBottom="10px"
        >
          Dispositivos
        </Typography>

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap="10px"
          width="100%"
        >
          {Object.entries(deviceTypeCounts).map(([type, count]) => (
            <Box
              key={type}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p="10px"
              width="100px"
              height="100px"
              backgroundColor={colors.blueAccent[700]}
              borderRadius="8px"
              sx={{ boxShadow: 2 }}
            >
              {/* Corregido: Verificación de íconos */}
              {deviceIcons[type] ? deviceIcons[type] : <BlockIcon fontSize="large" />}
              <Typography color={colors.grey[100]} sx={{ fontSize: 12 }}>
                {type}
              </Typography>
              <Typography fontWeight="bold" color={colors.grey[100]} sx={{ fontSize: 14 }}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>




      {/* GRID & CHARTS */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="auto" gap="10px">
        {/* VALOR TOTAL DEL INVENTARIO */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[1000]}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p="20px"
          borderRadius="8px"
          sx={{
            width: isSidebarOpen ? "1150px" : "1700px",
            height: "100px",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            marginBottom: "10px", // Eliminado marginLeft innecesario
            margin: "0 auto", // Centrado automático horizontalmente
          }}
        >
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]} sx={{ marginBottom: "10px" }}>
            Valor Total del Inventario de TI
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.grey[100]}
            sx={{ textAlign: "center" }}
          >
            {totalInventoryValue ? formatCurrencyCOP(totalInventoryValue) : "Cargando..."}
          </Typography>
        </Box>




        {/* DISPOSITIVOS POR ESTADO */}
        <Box
          gridColumn="span 6"
          backgroundColor={colors.primary[1000]}
          p="20px"
          borderRadius="8px"
          sx={{
            width: "600px",
            height: "350px",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            margin: "0 auto", // Centrado horizontal
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            sx={{
              alignSelf: "center", // Centrar título
              textAlign: "center",
              marginBottom: "5px",
            }}
          >
            Dispositivos organizados por estado
          </Typography>

          {deviceStatus && Object.keys(deviceStatus).length > 0 ? (
            <DonutChart data={deviceStatus} />
          ) : (
            <Typography color="red">No hay datos disponibles</Typography>
          )}
        </Box>

        {/* DISPOSITIVOS POR TIPO */}
        <Box
          gridColumn="span 6"
          backgroundColor={colors.primary[1000]}
          p="20px"
          borderRadius="8px"
          sx={{
            width: "600px",
            height: "350px",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            margin: "0 auto", // Centrado horizontal
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            sx={{
              alignSelf: "center", // Centrar título
              textAlign: "center",
              marginBottom: "5px",
            }}
          >
            Dispositivos organizados por tipo
          </Typography>

          {deviceTypeCounts && Object.keys(deviceTypeCounts).length > 0 ? (
            <DonutChart data={deviceTypeCounts} />
          ) : (
            <Typography color="red">No hay datos disponibles</Typography>
          )}
        </Box>

        {/* GRÁFICOS DE DISPOSITIVOS POR UBICACIÓN Y POR TIPO Y UBICACIÓN */}
        <Box
          gridColumn="span 6"
          sx={{
            backgroundColor: colors.primary[1000],
            padding: "20px",
            borderRadius: "8px",
            width: "600px",
            height: "400px",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
            margin: "0 auto", // Centrado horizontal
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            sx={{
              alignSelf: "center",
              textAlign: "left",
              marginLeft: "150px",
              marginBottom: "5px"
            }}
          >
            Dispositivos organizados por ubicación
          </Typography>
          <Box height="370px">
            {deviceLocationTypeCounts && Object.keys(deviceLocationTypeCounts).length > 0 ? (
              <BarChart data={transformLocationData(deviceLocationTypeCounts)} />
            ) : (
              <Typography color="red">No hay datos disponibles</Typography>
            )}
          </Box>
        </Box>

        {/* DISPOSITIVOS POR TIPO Y UBICACIÓN */}
        <Box
          gridColumn="span 6"
          backgroundColor={colors.primary[1000]}
          p="20px"
          borderRadius="8px"
          sx={{
            width: "600px",
            height: "400px",
            boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)", // Sombra ligera
            margin: "0 auto", // Centrado horizontal

          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            sx={{
              alignSelf: "center",
              textAlign: "left",
              marginLeft: "150px",
              marginBottom: "5px"
            }}
          >
            Dispositivos organizados por ubicación y tipo
          </Typography>
          <Box height="370px">
            {deviceLocationTypeCounts && Object.keys(deviceLocationTypeCounts).length > 0 ? (
              <BarChartComponent data={transformLocationData(deviceLocationTypeCounts)} />
            ) : (
              <Typography color="red">No hay datos disponibles</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;