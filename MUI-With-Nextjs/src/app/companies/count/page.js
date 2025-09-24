// app/companies/count/page.js
'use client'




import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';

export default function TotalCompaniesPage() {
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTotalCompanies() {
      try {
        const response = await axios.get('/api/companies/count');
        setTotal(response.data.total);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchTotalCompanies();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {loading && <CircularProgress />}
        {error && (
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        )}
        {total !== null && !loading && !error && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Total Companies
            </Typography>
            <Typography variant="h4" color="primary">
              We have {total} companies in our database
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
