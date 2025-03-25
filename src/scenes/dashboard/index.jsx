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
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";

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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Bienvenido al Inventario de TI" />
        <Button
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
        >
          <DownloadOutlinedIcon sx={{ mr: "10px" }} />
          Descargar Reportes
        </Button>
      </Box>

      {/* GRID & CHARTS */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="auto" gap="15px">
        {/* VALOR TOTAL DEL INVENTARIO */}
        <Box gridColumn="span 12">
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            Valor Total del Inventario de TI
          </Typography>
        </Box>

        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="20px"
          borderRadius="8px"
          sx={{ boxShadow: 3 }}
        >
          <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]} sx={{ textAlign: "center" }}>
            {totalInventoryValue !== null ? formatCurrencyCOP(totalInventoryValue) : "Cargando..."}
          </Typography>
        </Box>

        {/* DISPOSITIVOS POR ESTADO */}
        <Box gridColumn="span 12">
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            Dispositivos organizados por estado
          </Typography>
        </Box>

        {deviceStatus && Object.keys(deviceStatus).length > 0 ? (
          Object.entries(deviceStatus).map(([status, count], index) => (
            <Box
              key={index}
              gridColumn="span 1"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
              p="5px"
              borderRadius="8px"
            >
              {status === "Disponible" && <CheckCircleIcon sx={{ fontSize: 20, color: colors.primary[100], mb: 1 }} />}
              {status === "Entregado" && <VolunteerActivismIcon sx={{ fontSize: 20, color: colors.primary[100], mb: 1 }} />}
              {status === "Mantenimiento" && <BuildIcon sx={{ fontSize: 20, color: colors.primary[100], mb: 1 }} />}
              {status === "No disponible" && <BlockIcon sx={{ fontSize: 20, color: colors.primary[100], mb: 1 }} />}

              <StatBox title={count.toString()} subtitle={status} />
            </Box>
          ))
        ) : (
          <Typography color="red">No hay datos disponibles</Typography>
        )}

        {/* DISPOSITIVOS POR TIPO */}
        <Box gridColumn="span 12">
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            Dispositivos organizados por tipo
          </Typography>
        </Box>

        {deviceTypeCounts && Object.keys(deviceTypeCounts).length > 0 ? (
          Object.entries(deviceTypeCounts).map(([type, count], index) => (
            <Box
              key={index}
              gridColumn="span 1"
              backgroundColor={colors.primary[400]}
              display="flex"
              //flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p="10px"
              borderRadius="8px"

            >
              {type === "Laptop" && <LaptopMacIcon sx={{ fontSize: 20, color: colors.grey[100], mb: 1 }} />}
              {type === "Monitor" && <MonitorIcon sx={{ fontSize: 20, color: colors.grey[100], mb: 1 }} />}
              {type === "Teclado" && <KeyboardIcon sx={{ fontSize: 20, color: colors.grey[100], mb: 1 }} />}
              {type === "Mouse" && <MouseIcon sx={{ fontSize: 20, color: colors.grey[100], mb: 1 }} />}
              {type === "Auriculares" && <HeadsetIcon sx={{ fontSize: 20, color: colors.grey[100], mb: 1 }} />}
              {type === "Impresora" && <PrintIcon sx={{ fontSize: 20, color: colors.grey[100], mb: 1 }} />}
              <StatBox title={count.toString()} subtitle={type} />
            </Box>
          ))
        ) : (
          <Typography color="red">No hay datos disponibles</Typography>
        )}

        {/* BARCHART */}
        {/* Sección envolvente para forzar nueva línea */}
        <Box gridColumn="span 12">
          <Box
            gridColumn="span 8"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            p="20px"
            borderRadius="8px"
            mt="20px" // Margen superior para separación
          >
            <Typography variant="h5" fontWeight="600" sx={{ marginBottom: "15px" }}>
              Dispositivos organizados por ubicación
            </Typography>
            <Box height="370px">
              {deviceLocationCounts && Object.keys(deviceLocationCounts).length > 0 ? (
                <BarChart data={transformLocationData(deviceLocationCounts)} />
              ) : (
                <Typography color="red">No hay datos disponibles</Typography>
              )}
            </Box>
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default Dashboard;