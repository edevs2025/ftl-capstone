import {React, useEffect} from "react";
import "./Signin.css";
import Navbar from "../../components/Navbar/Navbar";
import { SignUp, SignIn} from "@clerk/clerk-react";
import { Box, Typography, Button } from "@mui/material";
import ParticleEffect from "../Landing/ParticleEffect"; // Adjust the import path as needed
import ModifiedParticleEffect from "../Landing/ModifiedParticleEffect";


function Signup() {
  
  return (
    <>
      <Navbar />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // Ensure ParticleEffect is in the background
        }}
      >
        <ModifiedParticleEffect />
      </Box>
      <div className="signin-container">
        <SignIn forceRedirectUrl="/question-bank" />
      </div>
    </>
  );
}

export default Signup;