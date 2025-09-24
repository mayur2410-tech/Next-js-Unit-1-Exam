'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Box,
} from '@mui/material';

export default function CompaniesByBenefitPage() {
  const { benefit } = useParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompaniesByBenefit() {
      try {
        const response = await axios.get(`/api/companies/benefit/${benefit}`);
        setCompanies(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch companies by benefit');
      } finally {
        setLoading(false);
      }
    }

    fetchCompaniesByBenefit();
  }, [benefit]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <Typography variant="h4">Companies offering</Typography>
        <Chip label={benefit} color="primary" />
      </Box>

      {companies.length === 0 ? (
        <Typography variant="body1">No companies found offering this benefit.</Typography>
      ) : (
        <Grid container spacing={3}>
          {companies.map((company) => (
            <Grid item xs={12} sm={6} md={4} key={company._id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6">{company.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Benefits:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {company.benefits?.map((b, i) => (
                      <Chip key={i} label={b} size="small" color="secondary" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
