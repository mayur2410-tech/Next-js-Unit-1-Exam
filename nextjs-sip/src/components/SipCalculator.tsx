"use client";

import { useState } from "react";
import { Alert, Button, Stack, TextField, Typography, Grid } from "@mui/material";
import SipGrowthChart, { SipPoint } from "./SipGrowthChart";

type SipResponse = {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  absoluteReturn: number;
  annualizedReturn: number | null;
  needs_review?: boolean;
  points: SipPoint[];
};

export default function SipCalculator({ schemeCode }: { schemeCode: string }) {
  const [amount, setAmount] = useState(5000);
  const [from, setFrom] = useState("2020-01-01");
  const [to, setTo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SipResponse | null>(null);
  const [error, setError] = useState<string>("");

  const calculate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/scheme/${schemeCode}/sip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          frequency: "monthly",
          from,
          to: to || undefined
        })
      });
      const json: SipResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to calculate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="SIP amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </Grid>
  <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Start date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
  <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="End date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Leave empty to use latest NAV"
          />
        </Grid>
      </Grid>

      <Button variant="contained" onClick={calculate} disabled={loading}>
        {loading ? "Calculating..." : "Calculate Returns"}
      </Button>

      {error && <Alert severity="error">{error}</Alert>}

      {data && (
        <Stack gap={1}>
          {data.needs_review && (
            <Alert severity="warning">needs_review: Insufficient data in the selected period.</Alert>
          )}
          <Typography>Total invested: ₹{data.totalInvested.toFixed(2)}</Typography>
          <Typography>Current value: ₹{data.currentValue.toFixed(2)}</Typography>
          <Typography>Absolute return: {data.absoluteReturn.toFixed(2)}%</Typography>
          {data.annualizedReturn != null && (
            <Typography>Annualized return: {data.annualizedReturn.toFixed(2)}%</Typography>
          )}

          <SipGrowthChart points={data.points} />
        </Stack>
      )}
    </Stack>
  );
}