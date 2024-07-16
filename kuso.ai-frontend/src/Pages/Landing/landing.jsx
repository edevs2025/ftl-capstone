import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import WaveScene from "./WaveScene";
import "./landing.css";
import ParticleEffect from "./ParticleEffect";

const features = [
  { title: "Feature One", description: "Description of feature one." },
  { title: "Feature Two", description: "Description of feature two." },
  { title: "Feature Three", description: "Description of feature three." },
];

const testimonials = [
  { name: "John Doe", feedback: "This service is amazing!" },
  { name: "Jane Smith", feedback: "Highly recommend to everyone." },
  { name: "Sam Wilson", feedback: "Transformed our business completely." },
];

const Header = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" style={{ flexGrow: 1 }}>
        Your Company
      </Typography>
      <Button color="inherit" component={Link} to="/mock-ai">
        Mock AI
      </Button>
    </Toolbar>
  </AppBar>
);

const HeroSection = () => (
  <Box
    sx={{
      height: "100vh",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}
    >
      <ParticleEffect />
    </Box>
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h2" gutterBottom>
          muso.ai
        </Typography>
        <Typography variant="h5" gutterBottom>
          practice mock interviews.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to="/mock-ai"
          sx={{
            backgroundColor: "white",
            color: "black",
            "&:hover": { backgroundColor: "black" },
          }}
        >
          take me there
        </Button>
      </motion.div>
    </Box>
  </Box>
);

const FeaturesSection = () => (
  <Box id="features" sx={{ padding: 4, textAlign: "center" }}>
    <Typography variant="h4" gutterBottom>
      Our Features
    </Typography>
    <Grid container spacing={4}>
      {features.map((feature, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              {feature.title}
            </Typography>
            <Typography>{feature.description}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const TestimonialsSection = () => (
  <Box sx={{ padding: 4, textAlign: "center", backgroundColor: "#f5f5f5" }}>
    <Typography variant="h4" gutterBottom>
      Testimonials
    </Typography>
    <Grid container spacing={4}>
      {testimonials.map((testimonial, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              {testimonial.name}
            </Typography>
            <Typography>{testimonial.feedback}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const Footer = () => (
  <Box
    sx={{
      padding: 2,
      textAlign: "center",
      backgroundColor: "#333",
      color: "#fff",
    }}
  >
    <Typography variant="body1">© 2023 Your Company</Typography>
  </Box>
);

const LandingPage = () => (
  <>
    <Header />
    <HeroSection />
    <FeaturesSection />
    <TestimonialsSection />
    <Footer />
  </>
);

export default LandingPage;
