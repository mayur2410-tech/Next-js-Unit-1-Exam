# Mutual Fund Explorer + SIP Calculator (Next.js + MUI)

Implements the assignment from `s3_full_stack/00.assignments/04.md`:
- Next.js App Router
- API wrappers for MFAPI.in
- Returns and SIP calculators
- MUI UI with charts
- In-memory caching with TTL

## Getting Started

```bash
# Node 18+ recommended
npm install
npm run dev
# open http://localhost:3000/funds
```

## API Routes

- GET `/api/mf`
  - Returns full schemes list (cached ~12h).
- GET `/api/mf/groups`
  - Aggregates `fund_house -> category -> schemes`. First call may be heavy, cached 24h.
- GET `/api/scheme/:code`
  - Returns scheme metadata + NAV history.
- GET `/api/scheme/:code/returns?period=1m|3m|6m|1y` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - Returns: startDate, endDate, startNAV, endNAV, simpleReturn %, annualizedReturn % (>=30 days).
- POST `/api/scheme/:code/sip`
  - Body:
    ```json
    {
      "amount": 5000,
      "frequency": "monthly",
      "from": "2020-01-01",
      "to": "2023-12-31"
    }
    ```
  - Returns: totalInvested, currentValue, totalUnits, absoluteReturn %, annualizedReturn %, growth points.

## Frontend Pages

- `/funds`
  - Search schemes, quick links to details.
  - Load "Group by fund house & category" on demand (cached).
- `/scheme/[code]`
  - Metadata, NAV chart (last 1y), returns card with presets.
  - SIP calculator with growth chart.

## SIP & Returns Rules

- Nearest earlier available NAV for each SIP date or calculation boundary.
- Skip NAVs `<= 0`.
- `needs_review` flagged if data is insufficient.
- Annualized return only when duration >= ~30 days (returns) or >= ~1 month (SIP).

## Notes

- Caching is process memory only (TTLCache). For production, use Redis or KV store.
- MFAPI date format (DD-MM-YYYY) is normalized to ISO (YYYY-MM-DD).
- Charts use `@mui/x-charts`.

## Ideas to Extend

- Lumpsum and SWP calculators
- Compare funds and portfolio simulations
- Export to CSV/PDF
- Persist cache in Redis with background refresh