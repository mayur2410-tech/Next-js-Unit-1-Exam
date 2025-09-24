'use client';

import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

export default function CompaniesByHeadcountRangePage() {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (min) params.min = min;
      if (max) params.max = max;

      const response = await axios.get('/api/companies/headcount-range', { params });
      setCompanies(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Companies by Headcount Range
      </Typography>

      {/* Form */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          label="Min Headcount"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <TextField
          label="Max Headcount"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Typography color="error" variant="body1" sx={{ mt: 4 }}>
          {error}
        </Typography>
      )}

      {/* Results */}
      {!loading && !error && companies.length > 0 && (
        <Grid container spacing={3}>
          {companies.map((company) => (
            <Grid item xs={12} sm={6} md={4} key={company._id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6">{company.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {company.location || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Headcount: {company.headcount ?? 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base Salary: {company.salaryBand?.base ? `$${company.salaryBand.base.toLocaleString()}` : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && !error && companies.length === 0 && (
        <Typography variant="body1" sx={{ mt: 4 }}>
          No companies found for the specified headcount range.
        </Typography>
      )}
    </Container>
  );
}
