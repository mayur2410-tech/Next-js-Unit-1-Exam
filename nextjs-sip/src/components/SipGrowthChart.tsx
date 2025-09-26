"use client";

import { LineChart } from "@mui/x-charts/LineChart";

export type SipPoint = { date: string; investedSoFar: number; unitsSoFar: number; valueAtDate: number };

export default function SipGrowthChart({ points }: { points: SipPoint[] }) {
  const x = points.map((p) => new Date(p.date));
  return (
    <LineChart
      height={320}
      xAxis={[{ data: x, scaleType: "time" }]}
      series={[
        { data: points.map((p) => p.investedSoFar), label: "Invested (₹)" },
        { data: points.map((p) => p.valueAtDate), label: "Value (₹)" }
      ]}
      margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
    />
  );
}