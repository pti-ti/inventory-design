import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Box, useTheme } from "@mui/material";
import axios from "axios";
import { tokens } from "../theme";

const BarChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Extraer todos los tipos de dispositivos únicos para las claves del gráfico
  const deviceTypes = [...new Set(Object.values(data).flatMap((devices) => Object.keys(devices)))];

  // Convertir el JSON en un array adecuado para @nivo/bar
  const chartData = Object.entries(data).map(([location, devices]) => {
    const entry = { location }; // Se agrega la ubicación como clave
    deviceTypes.forEach((type) => {
      entry[type] = devices[type] || 0; // Si no tiene ese dispositivo, se asigna 0
    });
    return entry;
  });

  return (
    <Box
      p="16px"
      backgroundColor={colors.primary[400]}
      borderRadius="8px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      height="400px"
    >
      <ResponsiveBar
        data={chartData}
        keys={deviceTypes} // Los diferentes tipos de dispositivos
        indexBy="location" // La agrupación será por ubicación
        margin={{ top: 40, right: 160, bottom: 80, left: 60 }} // Ajustar margen derecho para espacio para la leyenda
        padding={0.3}
        colors={{ scheme: "category10" }} // Paleta de colores para cada tipo de dispositivo
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -25,
          legend: "",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Cantidad de Dispositivos",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        enableLabel={true} // Mostrar valores dentro de las barras
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "right", // Mover la leyenda al lado derecho del gráfico
            direction: "column",
            translateX: 140, // Mover la leyenda más lejos del gráfico
            itemWidth: 120,
            itemHeight: 20,
            itemTextColor: "#999",
            symbolSize: 20,
            symbolShape: "circle",
          },
        ]}
      />
    </Box>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8085/api/v1/admin/locations/device-location-type-count");
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const result = await response.json();

        console.log("Datos recibidos de la API:", result);

        setData(result); // Guarda los datos sin transformar para el gráfico de barras
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setData(null);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      
      {data ? (
        <BarChart data={data} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default Dashboard;
