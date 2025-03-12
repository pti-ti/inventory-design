import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LaptopChromebookIcon from "@mui/icons-material/LaptopChromebook";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import MouseIcon from "@mui/icons-material/Mouse";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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

      {/* GRID */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px">
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title="12,361" subtitle="Portátiles" icon={<LaptopChromebookIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title="431,225" subtitle="Auriculares" icon={<HeadphonesIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title="32,441" subtitle="Teclados" icon={<KeyboardIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title="1,325,134" subtitle="Mouse" icon={<MouseIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        
        {/* Valor del Inventario */}
        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px" textAlign="center">
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>Valor del inventario TI</Typography>
          <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]}>$59,342.32</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;