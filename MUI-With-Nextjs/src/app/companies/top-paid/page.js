'use client'; // client-side component

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Box,
} from '@mui/material';

export default function TopPaidCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTopPaid() {
      try {
        const response = await axios.get('/api/companies/top-paid?limit=5');
        setCompanies(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch top paid companies');
      } finally {
        setLoading(false);
      }
    }

    fetchTopPaid();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" variant="h6" align="center" sx={{ mt: 8 }}>
        {error}
      </Typography>
    );

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Top Paid Companies
      </Typography>
      <Grid container spacing={3}>
        {companies.map((company, index) => {
          const salary = company.salaryBand?.base ?? 'N/A';
          return (
            <Grid item xs={12} sm={6} md={4} key={company._id}>
              <Card elevation={3}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {company.name}
                      {index === 0 && <Chip label="Top Paid" color="primary" size="small" />}
                    </Box>
                  }
                  subheader={company.location || 'Location N/A'}
                />
                <CardContent>
                  <Typography variant="body1">
                    Base Salary: {typeof salary === 'number' ? `$${salary.toLocaleString()}` : salary}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
