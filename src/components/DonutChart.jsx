import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, useTheme } from "@mui/material";
import { Tooltip as MuiTooltip, Typography, Box as MuiBox } from "@mui/material";
import { tokens } from "../theme";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Colores predefinidos para ciertos estados específicos
const STATUS_COLORS = {
  "pendiente reparar": "#D62728", // Rojo
  "pendiente devolver": "#FFD700", // Amarillo
  "entregado pendiente acta": "#FF7F0E", // Naranja
  "disponible": "#2CA02C", // Verde
  "alistamiento": "#9467BD", // Morado
  "asignado": "#1F77B4", // Azul
  "inactivo": "#7F7F7F", // Gris
};

// Lista de colores primarios suaves
const PRIMARY_COLORS = [
  "#1F77B4", "#2CA02C", "#FF7F0E",
  "#9467BD", "#8C564B", "#E377C2", "#7F7F7F",
  "#BCBD22", "#17BECF"
];

// Función para generar un color aleatorio si se acaban los colores primarios
const getRandomColor = () => {
  const letters = "89ABCDEF"; // Usamos tonos más suaves (evitando 0-7)
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
};

// Función para asignar colores únicos sin repetir
const assignUniqueColors = (data) => {
  let availableColors = [...PRIMARY_COLORS];
  let usedColors = new Set();
  let colorMap = {};

  return data.map(([name, value]) => {
    const lowerName = name.toLowerCase();

    // Usa color predefinido si existe y no está usado
    let color = STATUS_COLORS[lowerName];
    if (color && !usedColors.has(color)) {
      usedColors.add(color);
    } else if (availableColors.length > 0) {
      // Usa un color primario disponible
      color = availableColors.shift();
      usedColors.add(color);
    } else {
      // Genera un color aleatorio que no esté usado
      do {
        color = getRandomColor();
      } while (usedColors.has(color));
      usedColors.add(color);
    }

    colorMap[lowerName] = color;
    return { name, value, color };
  });
};

const DonutChart = ({ data, filterKey = "estado" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const chartData = assignUniqueColors(Object.entries(data));

  // Maneja el clic en un segmento del gráfico
  const handlePieClick = (data, index) => {
    if (data && data.name) {
      // Navega al listado filtrado por el filtro correspondiente
      navigate(`/dispositivos?${filterKey}=${encodeURIComponent(data.name)}`);
    }
  };

  // Tooltip personalizado para el DonutChart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0].payload;
      return (
        <MuiBox
          sx={{
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 2,
            boxShadow: 3,
            p: 2,
            minWidth: 180,
            border: `2px solid ${color}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ color, fontWeight: "bold" }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Dispositivos: <b>{value}</b>
          </Typography>
        </MuiBox>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Box
        p="0px"
        backgroundColor={colors.primary[1000]}
        borderRadius="8px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
        height="300px"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              key={chartData.map((d) => d.name).join(",")}
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={5}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              onClick={handlePieClick} // <-- Agrega el manejador de clic
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </motion.div>
  );
};

export default DonutChart;
