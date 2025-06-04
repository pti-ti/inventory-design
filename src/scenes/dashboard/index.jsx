import React from "react";
import { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import BlockIcon from "@mui/icons-material/Block";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import MonitorIcon from "@mui/icons-material/Monitor";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import MouseIcon from "@mui/icons-material/Mouse";
import HeadsetIcon from "@mui/icons-material/Headset";
import PrintIcon from "@mui/icons-material/Print";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import DonutChart from "../../components/DonutChart";
import BarChartComponent from "../../components/BarChartTypeLocation";
import CountUp from "react-countup";
import InventoryIcon from '@mui/icons-material/Inventory';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';


const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Estados
  const [totalInventoryValue, setTotalInventoryValue] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [deviceTypeCounts, setDeviceTypeCounts] = useState({});
  const [deviceLocationCounts, setTotalLocationValue] = useState({});
  const [deviceLocationTypeCounts, setDeviceLocationTypeCounts] = useState({});
  const [statusReady, setStatusReady] = useState(false);
  const [typeReady, setTypeReady] = useState(false);
  const [statusKey, setStatusKey] = useState(0);
  const [typeKey, setTypeKey] = useState(0);

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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Función para obtener datos
  const fetchData = async () => {
    try {
      // Obtener el valor total del inventario
      const inventoryRes = await fetch(`${API_BASE_URL}/api/v1/devices/total-inventory-value`);
      const inventoryData = await inventoryRes.json();
      setTotalInventoryValue(inventoryData);

      // Obtener dispositivos organizados por estado
      const statusRes = await fetch(`${API_BASE_URL}/api/v1/status/device-status-count`);
      const statusData = await statusRes.json();
      setDeviceStatus(statusData);

      // Obtener dispositivos organizados por tipo
      const typeRes = await fetch(`${API_BASE_URL}/api/v1/devices/count-by-type`);
      const typeData = await typeRes.json();
      setDeviceTypeCounts(typeData);

      //Obtener dispositivos organizados por ubicación 
      const locationRes = await fetch(`${API_BASE_URL}/api/v1/locations/device-location-count`);
      const locationData = await locationRes.json();
      setTotalLocationValue(locationData);

      //Obtener dispositivos organizado por tipo y ubicación
      const locationTypeRes = await fetch(`${API_BASE_URL}/api/v1/locations/device-location-type-count`);
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
  }, [theme.palette.mode]);

  useEffect(() => {
    console.log("Ubicaciones obtenidas:", deviceLocationCounts);
  }, [deviceLocationCounts]);

  useEffect(() => {
    if (deviceStatus && Object.keys(deviceStatus).length > 0) {
      setStatusReady(false); // pausa para forzar reinicio
      setTimeout(() => {
        setStatusKey((prev) => prev + 1);
        setStatusReady(true);
      }, 50); // breve delay permite que React desmonte el anterior
    }
  }, [deviceStatus]);

  useEffect(() => {
    if (deviceTypeCounts && Object.keys(deviceTypeCounts).length > 0) {
      setTypeReady(false);
      setTimeout(() => {
        setTypeKey((prev) => prev + 1);
        setTypeReady(true);
      }, 50);
    }
  }, [deviceTypeCounts]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box width="100%" display="flex" justifyContent="center" alignItems="center" mb={2}>
        <Header title="DASHBOARD" subtitle="Inventario Gestión TI (Potencia y Tecnologías Incorporadas)" />
      </Box>

      {/* VALOR TOTAL DEL INVENTARIO EN ESQUINA SUPERIOR DERECHA */}
      <Box
        width="100%"
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mb={2}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[800]})`,
            color: colors.grey[100],
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            padding: "20px 32px",
            minWidth: 320,
            display: "flex",
            alignItems: "center",
            gap: 2,
            transition: "transform 0.3s ease, box-shadow 0.3s ease", // Añade transición
            "&:hover": {
              transform: "scale(1.03)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              cursor: "pointer",
            },
          }}
        >
          <Box>
            <Typography variant="subtitle2" color={colors.grey[200]}>
              Valor total del inventario de TI
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
              {totalInventoryValue ? (
                <CountUp
                  start={0}
                  end={totalInventoryValue}
                  duration={2.5}
                  separator="."
                  decimals={0}
                  decimal=","
                  prefix="$ "
                  formattingFn={(value) => formatCurrencyCOP(value)}
                />
              ) : "Cargando..."}
            </Typography>
          </Box>
          <MonetizationOnIcon sx={{ fontSize: 48, color: colors.grey[100] }} />
        </Box>
      </Box>

      {/* BOX - Dispositivos por tipo con icono */}
      <Box
        backgroundColor={colors.primary[1000]}
        p="20px"
        borderRadius="12px"
        sx={{
          width: "100%",
          background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[800]})`,
          transition: "transform 0.3s ease, box-shadow 0.3s ease", // Efecto de transición
          boxShadow: "4px 4px 12px rgba(0, 0, 0, 0.4)",
          marginBottom: "20px",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            cursor: "pointer",
          },
        }}
      >
        <Typography
          variant="h5"
          fontWeight="600"
          color={colors.grey[100]}
          textAlign="center"
          marginBottom="20px"
        >
          Dispositivos por tipo
        </Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          alignItems="center"
          gap="5px"
          width="100%"
        >
          {Object.entries(deviceTypeCounts).map(([type, count]) => (
            <Box
              key={type}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p="16px"
              width="120px"
              height="130px"
              backgroundColor={colors.blueAccent[700]}
              borderRadius="16px"
              sx={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: colors.blueAccent[600],
                },
              }}
            >
              {deviceIcons[type] ? (
                React.cloneElement(deviceIcons[type], {
                  fontSize: "large",
                  sx: { color: colors.grey[100], fontSize: 40 },
                })
              ) : (
                <BlockIcon fontSize="large" sx={{ color: colors.grey[100], fontSize: 40 }} />
              )}
              <Typography
                color={colors.grey[100]}
                sx={{ fontSize: 13, textAlign: "center", marginTop: "8px" }}
              >
                {type}
              </Typography>
              <Typography fontWeight="bold" color={colors.grey[100]} sx={{ fontSize: 16 }}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="auto" gap="10px">
        {/* DISPOSITIVOS POR ESTADO */}
        <Box
          gridColumn="span 6"

          p="20px"
          borderRadius="12px"
          sx={{
            width: "100%",
            height: "400px",
            backgroundColor: colors.primary[1000],
            background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[800]})`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.03)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              cursor: "pointer",
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]} // Así se adapta al tema
            sx={{
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            Dispositivos organizados por estado
          </Typography>
          <Box flex={1} display="flex" justifyContent="center" alignItems="center">
            {deviceStatus && Object.keys(deviceStatus).length > 0 ? (
              <DonutChart key={`status-${Date.now()}`} data={deviceStatus} height={260} width={260} />
            ) : (
              <Typography color="red">No hay datos disponibles</Typography>
            )}
          </Box>
        </Box>

        {/* DISPOSITIVOS POR TIPO */}
        <Box
          gridColumn="span 6"
          p="20px"
          borderRadius="12px"
          sx={{
            width: "100%",
            height: "400px",
            backgroundColor: colors.primary[1000],
            background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[800]})`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.03)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              cursor: "pointer",
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]} // Así se adapta al tema
            sx={{
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            Dispositivos organizados por tipo
          </Typography>
          <Box flex={1} display="flex" justifyContent="center" alignItems="center">
            {deviceTypeCounts && Object.keys(deviceTypeCounts).length > 0 ? (
              <DonutChart key={`type-${Date.now()}`} data={deviceTypeCounts} height={260} width={260} />
            ) : (
              <Typography color="red">No hay datos disponibles</Typography>
            )}
          </Box>
        </Box>
        {/* GRÁFICOS DE DISPOSITIVOS POR UBICACIÓN Y POR TIPO Y UBICACIÓN */}
        <Box
          gridColumn="span 6"
          p="20px"
          borderRadius="12px"
          sx={{
            width: "100%",
            height: "400px",
            backgroundColor: colors.primary[1000],
            background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[800]})`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.03)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              cursor: "pointer",
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            sx={{
              textAlign: "center", // Cambiado de "left" a "center"
              marginBottom: "10px", // Puedes dejarlo en 10px para igualar los otros boxes
              // Quita marginLeft
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
          p="20px"
          borderRadius="12px"
          sx={{
            width: "100%",
            height: "400px",
            backgroundColor: colors.primary[1000],
            background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[800]})`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.03)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              cursor: "pointer",
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={colors.grey[100]}
            sx={{
              textAlign: "center", // Cambiado de "left" a "center"
              marginBottom: "10px",
              // Quita marginLeft
            }}
          >
            Dispositivos organizados por ubicación y tipo
          </Typography>
          <Box height="340px">
            {deviceLocationTypeCounts && Object.keys(deviceLocationTypeCounts).length > 0 ? (
              <BarChartComponent
                key={theme.palette.mode}
                data={transformLocationData(deviceLocationTypeCounts)}
              />
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