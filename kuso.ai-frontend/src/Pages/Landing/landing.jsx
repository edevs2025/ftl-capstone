import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./landing.css";
import ParticleEffect from "./ParticleEffect";

const HeroSection = () => {
  const [textIndex, setTextIndex] = useState(0);
  const texts = ["behavioral interviews.", "corporate interviews."];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ height: "100vh", position: "relative", overflow: "hidden" }}>
      <div className="landing-page-navbar">
        <Link to="question-bank">
          <button>questions</button>
        </Link>
        <Link to="question-bank">
          <button>get started</button>
        </Link>
      </div>
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
          bottom: "15rem",
          fontSize: "3.5rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          sx={{ top: "-20rem" }}
        >
          <Typography variant="h2" gutterBottom sx={{ fontSize: "5.5rem" }}>
            muso.ai
          </Typography>
          <Typography variant="h5" gutterBottom>
            practice{" "}
            <span className="changing-text" style={{ color: "#646cff" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={textIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {texts[textIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
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
              "&:hover": { backgroundColor: "black", color: "#646cff" },
            }}
          >
            take me there
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
};

const LandingPage = () => (
  <>
    <HeroSection />
  </>
);

export default LandingPage;
