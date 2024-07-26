import {React, useEffect} from "react";
import "./Signup.css";
import Navbar from "../../components/Navbar/Navbar";
import { SignUp, SignIn} from "@clerk/clerk-react";
import { Box, Typography, Button } from "@mui/material";
import ParticleEffect from "../Landing/ParticleEffect"; // Adjust the import path as needed
import ModifiedParticleEffect from '../Landing/ModifiedParticleEffect';

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
      <div className="signup-container">
        <SignUp forceRedirectUrl="/question-bank" />
      </div>
    </>
  );
}

export default Signup;

{
  /* <div className="page-container">
        <div className="form-container">
          <form className="form">
            <div className="form-group">
              <label htmlFor="first-name">First Name</label>
              <input type="text" id="first-name" name="first-name" required />
              <label htmlFor="last-name">Last Name</label>
              <input type="text" id="last-name" name="last-name" required />
              <label htmlFor="email">Email</label>
              <input type="text" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="textarea">Occupation</label>
              <textarea
                name="textarea"
                id="textarea"
                rows="10"
                cols="50"
                required
              />
            </div>
            <button className="form-submit-btn" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div> */
}
