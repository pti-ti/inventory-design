import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8085/api/v1/admin/locations/device-location-count");
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
    <div style={{ maxWidth: "800px", height: "400px", margin: "0 auto" }}>
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
          }}
          keys={["count"]}
          indexBy="city"
          margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
          padding={0.3}
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
            legend: isDashboard ? undefined : "Ubicación",
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? undefined : "Cantidad",
            legendPosition: "middle",
            legendOffset: -40,
            tickValues: data.length > 0
              ? [...Array(Math.max(...data.map((d) => d.count)) + 1).keys()]
              : undefined,
            format: (value) => Math.round(value),
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
              symbolSize: 20,
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
