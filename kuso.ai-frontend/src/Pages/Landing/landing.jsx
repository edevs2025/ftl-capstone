import React from "react";
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
import "./landing.css";
import ParticleEffect from "./ParticleEffect";

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
          practice mock <span style={{ color: "#646cff" }}>interviews</span>.
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

const LandingPage = () => (
  <>
    <HeroSection />
  </>
);

export default LandingPage;
