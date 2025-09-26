"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { alpha, useTheme } from "@mui/material/styles";

export default function NavChart({ data }: { data: { x: Date; y: number }[] }) {
  const theme = useTheme();

  return (
    <LineChart
      height={320}
      series={[
        {
          id: "nav",
          data: data.map((d) => d.y),
          label: "NAV",
          color: theme.palette.primary.main
        }
      ]}
      xAxis={[
        {
          scaleType: "time",
          data: data.map((d) => d.x),
        }
      ]}
      margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
      slotProps={{
        legend: { hidden: true }
      }}
      sx={{
        ".MuiLineElement-root": { strokeWidth: 2 },
        ".MuiAreaElement-root": { fill: alpha(theme.palette.primary.main, 0.1) }
      }}
    />
  );
}