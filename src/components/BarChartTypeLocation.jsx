import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box, Typography } from "@mui/material";


const CustomBarTooltip = ({ id, value, indexValue, color }) => {
  const theme = useTheme();
  return (
    <Box
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
        {id}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Dispositivos: <b>{value}</b>
      </Typography>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
        Ubicación: <b>{indexValue}</b>
      </Typography>
    </Box>
  );
};

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
  <div style={{ width: "100%", height: "380px" }}>
    <ResponsiveBar
      data={chartData}
      keys={deviceTypes}
      indexBy="location"
      margin={{ top: 40, right: 100, bottom: 80, left: 100 }}
      padding={0.3}
      colors={{ scheme: "category10" }}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      tooltip={({ id, value, indexValue, color }) => (
        <CustomBarTooltip id={id} value={value} indexValue={indexValue} color={color} />
      )}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -20,
        renderTick: () => null,
        legend: "Ubicación y cantidad de dispositivos",
        legendPosition: "middle",
        legendOffset: 20,
        tickLine: true,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Cantidad de Dispositivos",
        legendPosition: "middle",
        legendOffset: -50,
        tickValues: 10,
        tickLine: true,
      }}
      enableGridX={false}
      enableGridY={false}
      gridYValues={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      enableLabel={true}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor="#ffffff"
      legends={[
        {
          dataFrom: "keys",
          anchor: "right",
          direction: "column",
          translateX: 140,
          itemWidth: 120,
          itemHeight: 20,
          itemTextColor: theme.palette.text.primary,
          symbolSize: 20,
          symbolShape: "circle",
        },
      ]}
      theme={{
        axis: {
          legend: {
            text: {
              fill: theme.palette.text.primary,
            },
          },
          domain: {
            line: {
              stroke: theme.palette.text.primary,
              strokeWidth: 1,
            },
          },
          ticks: {
            line: {
              stroke: theme.palette.text.primary,
              strokeWidth: 1,
            },
            text: {
              fill: theme.palette.text.primary,
            },
          },
        },
        grid: {
          line: {
            stroke: theme.palette.divider,
            strokeWidth: 1,
            strokeDasharray: "4 4",
          },
        },
        labels: {
          text: {
            fill: theme.palette.text.primary,
          },
        },
      }}
    />
  </div>
);
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const theme = useTheme(); // <--- Agrega esto

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/locations/device-location-type-count`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setData(null);
      }
    };

    fetchData();
  }, [theme.palette.mode]); // <--- Agrega theme.palette.mode aquí

  return <div>{data ? <BarChartTypeLocation data={data} /> : <p>Cargando datos...</p>}</div>;
};

export default Dashboard;
