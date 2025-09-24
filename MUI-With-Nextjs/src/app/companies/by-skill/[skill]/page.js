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
  Chip,
  CircularProgress,
  Box,
} from '@mui/material';

export default function CompaniesBySkillPage() {
  const { skill } = useParams(); // dynamic route param
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompaniesBySkill() {
      try {
        const response = await axios.get(`/api/companies/by-skill/${skill}`);
        setCompanies(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch companies by skill');
      } finally {
        setLoading(false);
      }
    }

    fetchCompaniesBySkill();
  }, [skill]);

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
        <Typography variant="h4">Companies requiring</Typography>
        <Chip label={skill} color="primary" />
      </Box>

      {companies.length === 0 ? (
        <Typography variant="body1">No companies found for this skill.</Typography>
      ) : (
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
                    Base Salary: {company.salaryBand?.base ? `$${company.salaryBand.base.toLocaleString()}` : 'N/A'}
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
