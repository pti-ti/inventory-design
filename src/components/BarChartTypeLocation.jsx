import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Box, useTheme } from "@mui/material";
import axios from "axios";
import { tokens } from "../theme";

const BarChartTypeLocation = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Extraer todos los tipos de dispositivos únicos
  const deviceTypes = [...new Set(Object.values(data).flatMap((devices) => Object.keys(devices)))];

  // Transformar datos
  const chartData = Object.entries(data).map(([location, devices]) => {
    const entry = { location };
    deviceTypes.forEach((type) => {
      entry[type] = devices[type] || 0;
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
        keys={deviceTypes}
        indexBy="location"
        margin={{ top: 40, right: 160, bottom: 80, left: 60 }}
        padding={0.3}
        colors={{ scheme: "category10" }}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}

        // Eje X (Ubicación)
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -25,
          legend: "",
          legendPosition: "middle",
          legendOffset: 40,
          tickLine: true,
        }}

        // Eje Y (Cantidad de dispositivos)
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Cantidad de Dispositivos",
          legendPosition: "middle",
          legendOffset: -50,
          tickValues: Array.from(
            { length: Math.max(5, Math.ceil(Math.max(...chartData.flatMap(d => deviceTypes.map(type => d[type] || 0))))) },
            (_, i) => i + 1
          ),
          tickLine: true,
        }}

        enableGridX={true}
        enableGridY={true}
        gridYValues={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}

        enableLabel={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}

        legends={[
          {
            dataFrom: "keys",
            anchor: "right",
            direction: "column",
            translateX: 140,
            itemWidth: 120,
            itemHeight: 20,
            itemTextColor: theme.palette.text.primary, // Usa el color del tema
            symbolSize: 20,
            symbolShape: "circle",
          },
        ]}

        // Adaptar el estilo al tema
        theme={{
          axis: {
            domain: {
              line: {
                stroke: theme.palette.text.primary, // Color del eje
                strokeWidth: 1,
              },
            },
            ticks: {
              line: {
                stroke: theme.palette.text.primary, // Color de las líneas de ticks
                strokeWidth: 1,
              },
              text: {
                fill: theme.palette.text.primary, // Color del texto de los ticks
              },
            },
          },
          grid: {
            line: {
              stroke: theme.palette.divider, // Color de las líneas del grid
              strokeWidth: 1,
              strokeDasharray: "4 4",
            },
          },
          labels: {
            text: {
              fill: theme.palette.text.primary, // Color del texto dentro del gráfico
            },
          },
        }}
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
        setData(result);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setData(null);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {data ? <BarChartTypeLocation data={data} /> : <p>Cargando datos...</p>}
    </div>
  );
};

export default Dashboard;
