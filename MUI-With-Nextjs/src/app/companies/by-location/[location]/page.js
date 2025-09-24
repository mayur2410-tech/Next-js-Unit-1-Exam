'use client'; // client-side component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Box,
} from '@mui/material';

export default function CompaniesByLocationPage() {
  const { location } = useParams(); // dynamic route param
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompaniesByLocation() {
      try {
        const response = await axios.get(`/api/companies/by-location/${location}`);
        setCompanies(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch companies by location');
      } finally {
        setLoading(false);
      }
    }

    fetchCompaniesByLocation();
  }, [location]);

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
      <Typography variant="h4" gutterBottom>
        Companies in {location}
      </Typography>

      {companies.length === 0 ? (
        <Typography variant="body1">No companies found at this location.</Typography>
      ) : (
        <Grid container spacing={3}>
          {companies.map((company) => (
            <Grid item xs={12} sm={6} md={4} key={company._id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6">{company.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base Salary: {company.salaryBand?.base ? `$${company.salaryBand.base.toLocaleString()}` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Headcount: {company.headcount ?? 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
