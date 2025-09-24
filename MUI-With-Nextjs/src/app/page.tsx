"use client";

import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Container, Box, Paper } from "@mui/material";

export default function Home() {
  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Company Explorer
          </Typography>
          <Button color="inherit" component={Link} href="/companies/count">
            Total Companies
          </Button>
          <Button color="inherit" component={Link} href="/companies/top-paid">
            Top Paid
          </Button>
          <Button color="inherit" component={Link} href="/companies/by-skill/DSA">
            By Skill
          </Button>
          <Button color="inherit" component={Link} href="/companies/by-location/Hyderabad">
            By Location
          </Button>
          <Button color="inherit" component={Link} href="/companies/headcount-range">
            Headcount Range
          </Button>
          <Button color="inherit" component={Link} href="/companies/benefit/Insurance">
            By Benefit
          </Button>
        </Toolbar>
      </AppBar>

      {/* Landing Content */}
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 5, mt: 5, textAlign: "center" }}>
          <Typography variant="h3" gutterBottom>
            Welcome to Company Explorer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Explore companies by salary, skills, location, benefits, and more.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
