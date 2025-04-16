import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

// Colores predefinidos para ciertos estados específicos
const STATUS_COLORS = {
  "pendiente reparacion": "#D62728",           // Rojo
  "sin pendientes": "#1F77B4",                 // Azul
  "entregado pendiente acta": "#FF7F0E",       // Naranja
  "en data center": "#2CA02C",                 // Verde
  "sin estado": "#9467BD"                      // Morado
};

// Lista de colores primarios suaves
const PRIMARY_COLORS = [
  "#1F77B4", "#D62728", "#2CA02C", "#FF7F0E",
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
