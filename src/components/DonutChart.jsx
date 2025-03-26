import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

// Colores predefinidos para ciertos estados específicos
const STATUS_COLORS = {
  disponible: "#34a853", // Verde
  laptop: "#4285f4",  // Azul
};

// Lista de colores primarios suaves
const PRIMARY_COLORS = [
  "#ea4335",
  "#fbbc05", 
  "#0fd9f1", "#705b96", "#ff914d", 
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

// Función para asignar colores sin repetir
const assignUniqueColors = (data) => {
  let availableColors = [...PRIMARY_COLORS]; // Copia de colores disponibles
  let colorMap = {}; // Mapa para rastrear colores asignados

  return data.map(([name, value]) => {
    const lowerName = name.toLowerCase();

    // Si el estado ya tiene un color asignado, usarlo
    if (colorMap[lowerName]) {
      return { name, value, color: colorMap[lowerName] };
    }

    // Si el estado tiene un color predefinido, usarlo
    let color = STATUS_COLORS[lowerName] || availableColors.shift() || getRandomColor();

    // Asignar el color al estado y guardarlo en el mapa
    colorMap[lowerName] = color;

    return { name, value, color };
  });
};

const DonutChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Convertir JSON en array y asignar colores sin repetición
  const chartData = assignUniqueColors(Object.entries(data));

  return (
    <Box
      p="px"
      backgroundColor={colors.primary[400]}
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
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
            fill="#8884d8"
            paddingAngle={5}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DonutChart;
