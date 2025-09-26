"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardActionArea, CardContent, TextField, Typography, Button, Stack, CircularProgress, Grid } from "@mui/material";
import Link from "next/link";
import type { SchemeListItem } from "@/lib/mfapi";
import SearchBar from "@/components/SearchBar";

type GroupsResponse = {
  generatedAt: string;
  ttlHours: number;
  groups: Record<string, Record<string, SchemeListItem[]>>; // fund_house -> category -> schemes
};

export default function FundsPage() {
  const [schemes, setSchemes] = useState<SchemeListItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [groups, setGroups] = useState<GroupsResponse | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/mf", { next: { revalidate: 60 } });
      const data: SchemeListItem[] = await res.json();
      setSchemes(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return schemes;
    return schemes.filter((x) => x.schemeName.toLowerCase().includes(s));
  }, [q, schemes]);

  const loadGroups = async () => {
    setGroupsLoading(true);
    const res = await fetch("/api/mf/groups");
    const data: GroupsResponse = await res.json();
    setGroups(data);
    setGroupsLoading(false);
  };

  return (
    <Stack gap={3}>
      <Typography variant="h4">Mutual Funds</Typography>

      <SearchBar value={q} onChange={setQ} placeholder="Search schemes by name" />

      {loading ? (
        <Stack alignItems="center" mt={4}><CircularProgress /></Stack>
      ) : (
        <Grid container spacing={2}>
          {filtered.slice(0, 500).map((scheme) => (
            <Grid key={scheme.schemeCode} item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <Link href={`/scheme/${scheme.schemeCode}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <CardActionArea>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {scheme.schemeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Code: {scheme.schemeCode}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box>
        <Stack direction="row" gap={2} alignItems="center">
          <Button variant="contained" onClick={loadGroups} disabled={groupsLoading}>
            {groupsLoading ? "Building groups..." : "Load groups by fund house & category"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            First run may take time; results cached for 24h.
          </Typography>
        </Stack>
      </Box>

      {groups && (
        <Stack gap={2}>
          <Typography variant="h5">Grouped by Fund House and Category</Typography>
          {Object.entries(groups.groups).map(([house, categories]) => (
            <Box key={house} sx={{ border: "1px solid #eee", borderRadius: 1, p: 2 }}>
              <Typography variant="h6">{house}</Typography>
              <Stack gap={2} mt={1}>
                {Object.entries(categories).map(([category, items]) => (
                  <Box key={category}>
                    <Typography variant="subtitle1" color="text.secondary">{category}</Typography>
                    <Grid container spacing={1} mt={0.5}>
                      {items.slice(0, 24).map((s) => (
                        <Grid key={s.schemeCode} item xs={12} sm={6} md={4}>
                          <Card variant="outlined" sx={{ p: 1 }}>
                            <Link href={`/scheme/${s.schemeCode}`} style={{ textDecoration: "none", color: "inherit" }}>
                              <Typography sx={{ textDecoration: "none" }}>{s.schemeName}</Typography>
                            </Link>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}