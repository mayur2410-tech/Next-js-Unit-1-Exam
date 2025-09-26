"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Card, CardContent, MenuItem, Select, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SchemeDetails, ReturnsResponse } from "@/lib/mfapi";
import NavChart from "@/components/NavChart";
import SipCalculator from "@/components/SipCalculator";

const presetPeriods = ["1m", "3m", "6m", "1y"] as const;

export default function SchemeDetailPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [details, setDetails] = useState<SchemeDetails | null>(null);
  const [period, setPeriod] = useState<(typeof presetPeriods)[number]>("1y");
  const [returns, setReturns] = useState<ReturnsResponse | null>(null);

  useEffect(() => {
    async function loadDetails() {
      const res = await fetch(`/api/scheme/${code}`);
      const data: SchemeDetails = await res.json();
      setDetails(data);
    }
    loadDetails();
  }, [code]);

  useEffect(() => {
    async function loadReturns() {
      const res = await fetch(`/api/scheme/${code}/returns?period=${period}`);
      const data: ReturnsResponse = await res.json();
      setReturns(data);
    }
    loadReturns();
  }, [code, period]);

  const lastYearSeries = useMemo(() => {
    if (!details) return [];
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    return details.navHistory
      .filter((d) => new Date(d.date) >= cutoff)
      .map((d) => ({ x: new Date(d.date), y: Number(d.nav) }));
  }, [details]);

  if (!details) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <Stack gap={3}>
      <Typography variant="h4">{details.meta.scheme_name}</Typography>

      <Grid container spacing={2}>
        {/* <Grid size={{ xs: 12, md: 8 }}> */}
          <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Metadata</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} gap={4} mt={2}>
                <Stack>
                  <Typography variant="body2">Fund House</Typography>
                  <Typography variant="subtitle1">{details.meta.fund_house || "-"}</Typography>
                </Stack>
                <Stack>
                  <Typography variant="body2">Category</Typography>
                  <Typography variant="subtitle1">{details.meta.scheme_category || "-"}</Typography>
                </Stack>
                <Stack>
                  <Typography variant="body2">Type</Typography>
                  <Typography variant="subtitle1">{details.meta.scheme_type || "-"}</Typography>
                </Stack>
                <Stack>
                  <Typography variant="body2">ISIN (Growth)</Typography>
                  <Typography variant="subtitle1">{details.meta.isin_growth || "-"}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
  <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Returns</Typography>
                <Select size="small" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                  {presetPeriods.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </Stack>
              <Box mt={2}>
                {returns ? (
                  <Stack gap={0.5}>
                    <Typography variant="body2">Start: {returns.startDate}</Typography>
                    <Typography variant="body2">End: {returns.endDate}</Typography>
                    <Typography variant="body2">Start NAV: {returns.startNAV.toFixed(2)}</Typography>
                    <Typography variant="body2">End NAV: {returns.endNAV.toFixed(2)}</Typography>
                    <Typography variant="body2">Simple Return: {returns.simpleReturn.toFixed(2)}%</Typography>
                    {returns.annualizedReturn != null && (
                      <Typography variant="body2">Annualized: {returns.annualizedReturn.toFixed(2)}%</Typography>
                    )}
                    {returns.needs_review && (
                      <Typography color="warning.main">needs_review: Insufficient data</Typography>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2">Loading…</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" mb={2}>NAV (Last 1 Year)</Typography>
          <NavChart data={lastYearSeries} />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" mb={2}>SIP Calculator</Typography>
          <SipCalculator schemeCode={String(code)} />
        </CardContent>
      </Card>
    </Stack>
  );
}