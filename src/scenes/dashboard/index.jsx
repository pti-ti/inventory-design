import { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Estado para el valor total del inventario
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);

  // Estado para dispositivos por estado
  const [deviceStatus, setDeviceStatus] = useState({});

  // Estado para dispositivos por tipo
  const [deviceTypeCounts, setDeviceTypeCounts] = useState({});

  // Formatear número en COP
  const formatCurrencyCOP = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    // Obtener el valor total del inventario
    fetch("http://localhost:8085/api/v1/admin/devices/total-inventory-value")
      .then((res) => res.json())
      .then((data) => setTotalInventoryValue(data))
      .catch((err) => console.error("Error al obtener datos:", err));

    // Obtener dispositivos organizados por estado (EXCLUYENDO BORRADOS)
    fetch("http://localhost:8085/api/v1/admin/status/device-status-count")
      .then((res) => res.json())
      .then((data) => setDeviceStatus(data))
      .catch((err) => console.error("Error al obtener datos:", err));

    // Obtener dispositivos organizados por tipo
    fetch("http://localhost:8085/api/v1/admin/devices/count-by-type")
      .then((res) => res.json())
      .then((data) => setDeviceTypeCounts(data))
      .catch((err) => console.error("Error al obtener datos:", err));
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Bienvenido al Inventario de TI" />
        <Box>
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
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="auto"
        gap="15px"
      >
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
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.greenAccent[500]}
            sx={{ textAlign: "center" }}
          >
            {totalInventoryValue > 0
              ? formatCurrencyCOP(totalInventoryValue)
              : "No disponible"}
          </Typography>
        </Box>

        {/* DISPOSITIVOS POR ESTADO */}
        <Box gridColumn="span 12">
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            Dispositivos organizados por estado
          </Typography>
        </Box>

        {Object.entries(deviceStatus).map(([status, count], index) => (
          <Box
            key={index}
            gridColumn="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="5px"
            borderRadius="8px"
          >
            <StatBox title={count.toString()} subtitle={status} />
          </Box>
        ))}

        {/* DISPOSITIVOS POR TIPO */}
        <Box gridColumn="span 12">
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            Dispositivos organizados por tipo
          </Typography>
        </Box>

        {Object.entries(deviceTypeCounts).map(([type, count], index) => (
          <Box
            key={index}
            gridColumn="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="5px"
            borderRadius="8px"
          >
            <StatBox title={count.toString()} subtitle={type} />
          </Box>
        ))}

        {/* BARCHART */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="20px"
          borderRadius="8px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Dispositivos por Tipo
          </Typography>
          <Box height="250px">
            <BarChart
              isDashboard={true}
              data={Object.entries(deviceTypeCounts).map(([type, count]) => ({
                name: type,
                value: count,
              }))}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
