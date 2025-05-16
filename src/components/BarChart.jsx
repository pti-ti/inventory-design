import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/locations/device-location-count`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const result = await response.json();

        // Transformamos el objeto en un array compatible con Nivo Bar
        const transformedData = Object.keys(result).map((city) => ({
          city,
          count: result[city],
        }));

        setData(transformedData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setData([]); // Evita que la gráfica falle
      }
    };

    fetchData();
  }, []);

  // 🎨 Paleta de colores oscuros
  const darkColors = [
    "#1F77B4", "#D62728", "#2CA02C", "#FF7F0E",
    "#9467BD", "#8C564B", "#E377C2", "#7F7F7F",
    "#BCBD22", "#17BECF"
  ];

  return (
    <div style={{ maxWidth: "600px", height: "350px", margin: "0 auto" }}>
      {data.length === 0 ? (
        <p>Cargando datos...</p>
      ) : (
        <ResponsiveBar
          data={data}
          theme={{
            axis: {
              domain: { line: { stroke: colors.grey[100] } },
              legend: { text: { fill: colors.grey[100] } },
              ticks: {
                line: { stroke: colors.grey[100], strokeWidth: 1 },
                text: { fill: colors.grey[100] },
              },
            },
            legends: { text: { fill: colors.grey[100] } },
            tooltip: {
              container: {
                background: colors.grey[100],
                color: colors.grey[900],
                borderRadius: "4px",
                border: `1px solid ${colors.grey[300]}`,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
              },
            },
          }}
          keys={["count"]}
          indexBy="city"
          margin={{ top: 20, right: 50, bottom: 50, left: 40 }} // más margen a la izquierda
          padding={0.2}
          layout="horizontal" // 👈 cambio importante
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={(bar) => darkColors[bar.index % darkColors.length]}
          borderColor={{ from: "color", modifiers: [["darker", "1.6"]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Cantidad de dispositivos",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: () => "",
            legend: "Ubicación",
            //legend: isDashboard ? undefined : "",
            legendPosition: "middle",
            legendOffset: -20,
          }}
          enableLabel={false}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 50,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 10,
              effects: [{ on: "hover", style: { itemOpacity: 1 } }],
            },
          ]}
          role="application"
          barAriaLabel={(e) =>
            `${e.id}: ${e.formattedValue} en ubicación: ${e.indexValue}`
          }
        />


      )}
    </div>
  );
};

export default BarChart;
